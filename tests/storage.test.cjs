const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));

function persistenceHarness(save) {
  let now = 0, id = 0;
  const timers = new Map();
  const writes = [];
  const context = vm.createContext({
    window: {
      setTimeout: (fn, delay) => { const key = ++id; timers.set(key, { fn, at: now + delay }); return key; },
      clearTimeout: key => timers.delete(key)
    },
    Date: class extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } },
    console: { warn() {} },
    appDataCryptoApi: { encryptSnapshot: async snapshot => ({ algorithm: 'AES-GCM', data: structuredClone(snapshot) }) },
    repository: { saveSnapshot: async record => { writes.push(record.data); if (save) await save(record.data); } },
    getUnlockedMasterKey: () => new Uint8Array(32),
    stripNonPersistentUiState: value => structuredClone(value),
    renderPersistenceIndicator() {},
    getMutableRawSnapshot: () => ({ value: 'latest' })
  });
  vm.runInContext(read('src/features/storage/status.js'), context);
  vm.runInContext(`const storageFeature = window.Unterrichtsassistent.features.storage;
    const AUTOSAVE_DELAY_MS = 800, AUTOSAVE_MAX_WAIT_MS = 5000;
    let pendingPersistTimerId = 0, pendingPersistSnapshot = null, pendingPersistSince = null;
    let persistenceHasStoredState = false, persistenceHasPendingChanges = false, persistenceIsSaving = false;
    let persistenceLastError = null, persistenceLastSavedAt = '', persistInFlightPromise = null, forcePersistAfterCurrentSave = false;
    let persistenceWriteBarrier = false, persistenceAuthConflict = false, protectedImportInProgress = false, isLockingForAuth = false;
    let unlockedPasswordAuthRecord = { encryptedMasterKey: 'test-key', salt: 'salt', wrapIv: 'iv' };
    function clearPendingPersistTimer() { window.clearTimeout(pendingPersistTimerId); pendingPersistTimerId = 0; }
  `, context);
  const app = read('src/app.js');
  vm.runInContext(app.slice(app.indexOf('function schedulePendingPersist('), app.indexOf('function renderStartupError(')), context);
  return {
    context, writes, timers,
    queue: (value, immediate = false) => context.queueSnapshotPersist({ value }, { immediate }),
    flush: () => context.flushPendingPersist({ immediate: true }),
    value: expression => vm.runInContext(expression, context),
    async advance(time) {
      while (true) {
        const due = Array.from(timers.entries()).filter(([, timer]) => timer.at <= time).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        now = due[1].at; timers.delete(due[0]); due[1].fn(); await tick();
      }
      now = time; await tick();
    }
  };
}

test('autosave writes after 800 ms and no later than 5 s during continuous input', async () => {
  const h = persistenceHarness();
  await h.queue(0);
  await h.advance(799);
  assert.equal(h.writes.length, 0);
  await h.advance(800);
  assert.deepEqual(h.writes, [{ value: 0 }]);
  for (let time = 1000; time < 6000; time += 200) {
    await h.advance(time); await h.queue(time);
  }
  await h.advance(5999);
  assert.equal(h.writes.length, 1);
  await h.advance(6000);
  assert.deepEqual(h.writes[1], { value: 5800 });
});

test('a forced save waits for queued changes and drains without repeating forever', async () => {
  let release;
  const firstWrite = new Promise(resolve => { release = resolve; });
  let count = 0;
  const h = persistenceHarness(async () => { if (++count === 1) await firstWrite; });
  const first = h.queue('first', true);
  await tick();
  const second = h.queue('second', true);
  await tick();
  assert.equal(h.writes.length, 1);
  release();
  assert.equal(await first, true);
  assert.equal(await second, true);
  assert.deepEqual(h.writes.map(item => item.value), ['first', 'second']);
  assert.equal(h.value('persistenceHasPendingChanges'), false);
  assert.equal(h.timers.size, 0);
});

test('failed writes remain pending, return failure, and retry without a busy loop', async () => {
  let failing = true;
  const h = persistenceHarness(async () => { if (failing) throw new Error('QuotaExceededError'); });
  assert.equal(await h.queue('retained', true), false);
  assert.equal(h.value('persistenceHasPendingChanges'), true);
  assert.equal(h.value('pendingPersistSnapshot.value'), 'retained');
  await h.advance(4999);
  assert.equal(h.writes.length, 1);
  failing = false;
  await h.advance(5000);
  assert.equal(h.writes.length, 2);
  assert.equal(h.value('persistenceHasPendingChanges'), false);
  assert.equal(h.value('persistenceLastError'), null);
});

test('visible status distinguishes saving on this device, backup creation, and errors', () => {
  const h = persistenceHarness();
  const status = h.context.window.Unterrichtsassistent.features.storage;
  assert.equal(status.describe({ error: new Error(), pending: true }).state, 'error');
  assert.match(status.describe({ stored: true }).label, /diesem Gerät/);
  assert.equal(status.describe({ stored: true }).backupLabel, 'Noch keine Sicherung erstellt');
  assert.equal(status.describe({ saving: true }).state, 'saving');
});

test('the import barrier refuses queued and forced writes during the authentication swap', async () => {
  const h = persistenceHarness();
  await h.queue('old', true);
  h.value('persistenceWriteBarrier = true');
  assert.equal(await h.queue('old queued during import', true), false);
  assert.equal(await h.flush(), false);
  await h.advance(10000);
  assert.deepEqual(h.writes.map(item => item.value), ['old']);
  h.value("unlockedPasswordAuthRecord = { encryptedMasterKey: 'new-key' }; pendingPersistSnapshot = null; persistenceHasPendingChanges = false; persistenceWriteBarrier = false");
  await h.queue('new after import', true);
  assert.deepEqual(h.writes.map(item => item.value), ['old', 'new after import']);
});

test('idle lock keeps a failed save in local recovery instead of navigating away', async () => {
  const app = read('src/app.js');
  const events = [];
  const context = vm.createContext({
    isLockingForAuth: false, idleLockAttemptInProgress: false, protectedImportInProgress: false,
    schoolService: {}, getMutableRawSnapshot: () => ({ unsaved: true }), clearIdleLockTimer() {},
    flushPendingPersist: async () => false,
    lockUnsavedRuntimeState: async () => events.push('protected local recovery'),
    redirectToAuthPage: () => events.push('navigation that would discard memory')
  });
  vm.runInContext(app.slice(app.indexOf('function triggerIdleLock()'), app.indexOf('async function lockUnsavedRuntimeState()')), context);
  context.triggerIdleLock(); await tick();
  assert.deepEqual(events, ['protected local recovery']);
  context.flushPendingPersist = async () => true;
  context.triggerIdleLock(); await tick();
  assert.equal(events[1], 'navigation that would discard memory');
});

test('emergency recovery requires the password and preserves the complete unsaved state', async () => {
  const context = vm.createContext({ window: { crypto: webcrypto, btoa, atob }, TextEncoder, TextDecoder, Uint8Array });
  for (const file of ['src/security/passwordAuth.js', 'src/security/appDataCrypto.js', 'src/features/storage/status.js']) vm.runInContext(read(file), context);
  const ns = context.window.Unterrichtsassistent;
  const auth = await ns.security.passwordAuth.createPasswordAuthRecord('notstand-passwort');
  const key = await ns.security.passwordAuth.unlockPasswordAuthRecord('notstand-passwort', auth);
  const lock = ns.features.storage.createRecoveryLock(ns.security.appDataCrypto, ns.security.passwordAuth);
  const unsaved = { students: [{ id: 's1', note: 'Nicht gespeicherte Rückmeldung' }], todos: [{ id: 't1', done: true }] };
  assert.equal(await lock.protect(unsaved, key, auth), true);
  assert.doesNotMatch(JSON.stringify(lock.getPayload()), /Rückmeldung|students|todos/);
  await assert.rejects(lock.unlock('falsch'));
  const result = await lock.unlock('notstand-passwort');
  assert.deepEqual(JSON.parse(JSON.stringify(result.snapshot)), unsaved);
  lock.clear();
  assert.equal(lock.getPayload(), null);
});

test('failed emergency encryption still retains the only copy behind password verification', async () => {
  const h = persistenceHarness();
  const auth = { unlockPasswordAuthRecord: async password => { if (password !== 'correct') throw new Error('incorrect'); return new Uint8Array(32); } };
  const lock = h.context.window.Unterrichtsassistent.features.storage.createRecoveryLock({ encryptSnapshot: async () => { throw new Error('unexpected crypto failure'); } }, auth);
  assert.equal(await lock.protect({ retained: true }, new Uint8Array(32), {}), false);
  assert.equal(lock.getPayload(), null);
  await assert.rejects(lock.unlock('incorrect'));
  assert.equal((await lock.unlock('correct')).snapshot.retained, true);
});

test('the atomic database guard rejects an older tab after an authentication change', async () => {
  const oldAuth = { encryptedMasterKey: 'old-key', salt: 'old-salt', wrapIv: 'old-iv' };
  const newAuth = { encryptedMasterKey: 'new-key', salt: 'new-salt', wrapIv: 'new-iv' };
  const records = new Map([['passwordAuth', oldAuth], ['domainSnapshot', { ciphertext: 'old' }]]);
  const database = {
    close() {},
    transaction() {
      let aborted = false;
      const staged = new Map(records);
      const transaction = {
        abort() { aborted = true; queueMicrotask(() => transaction.onabort()); },
        objectStore() {
          return {
            put(value, key) { staged.set(key, value); },
            get(key) {
              const request = {};
              queueMicrotask(() => {
                request.result = records.get(key); request.onsuccess();
                if (!aborted) { staged.forEach((value, entryKey) => records.set(entryKey, value)); transaction.oncomplete(); }
              });
              return request;
            }
          };
        }
      };
      return transaction;
    }
  };
  const indexedDB = { open() { const request = {}; queueMicrotask(() => { request.result = database; request.onsuccess(); }); return request; } };
  const context = vm.createContext({ window: {}, indexedDB });
  vm.runInContext(read('src/data/indexedDb.js'), context);
  const guardedWrite = context.window.Unterrichtsassistent.data.writeStatesWithAuthCheck;
  await guardedWrite({ passwordAuth: newAuth, domainSnapshot: { ciphertext: 'new-key encrypted state' } }, oldAuth);
  await assert.rejects(guardedWrite({ domainSnapshot: { ciphertext: 'late old-key state' } }, oldAuth), error => error.name === 'StalePasswordAuthError');
  assert.equal(records.get('domainSnapshot').ciphertext, 'new-key encrypted state');
  assert.equal(records.get('passwordAuth').encryptedMasterKey, 'new-key');
  await guardedWrite({ domainSnapshot: { ciphertext: 'new-key later edit' } }, newAuth);
  assert.equal(records.get('domainSnapshot').ciphertext, 'new-key later edit');
});

test('a stale tab exports its unsaved data with its own matching password wrapper', async () => {
  const app = read('src/app.js');
  let blob, authReads = 0;
  const oldAuth = { encryptedMasterKey: 'old-key-wrapper' };
  const context = vm.createContext({
    window: { UnterrichtsassistentApp: {}, setTimeout() {}, alert(message) { throw new Error(message); } },
    getMutableRawSnapshot: () => ({ unsaved: true }), getUnlockedMasterKey: () => 'old-key',
    unlockedPasswordAuthRecord: oldAuth,
    repository: { loadPasswordAuthRecord: async () => { authReads += 1; return { encryptedMasterKey: 'new-key-wrapper' }; }, saveStorageMetadata: async () => {} },
    appDataCryptoApi: { encryptSnapshot: async (snapshot, key) => ({ ciphertext: 'encrypted with ' + key }) },
    buildImportableSnapshot: value => value, getCurrentTimestampFilePart: () => 'test',
    storageMetadata: {}, renderPersistenceIndicator() {}, Blob,
    URL: { createObjectURL: value => { blob = value; return 'blob:test'; }, revokeObjectURL() {} },
    document: { createElement: () => ({ click() {} }), body: { appendChild() {}, removeChild() {} } }, console
  });
  vm.runInContext(app.slice(app.indexOf('window.UnterrichtsassistentApp.exportAppData ='), app.indexOf('window.UnterrichtsassistentApp.openImportAppData =')), context);
  await context.window.UnterrichtsassistentApp.exportAppData();
  const exported = JSON.parse(await blob.text());
  assert.equal(exported.passwordAuth.encryptedMasterKey, 'old-key-wrapper');
  assert.equal(exported.appState.ciphertext, 'encrypted with old-key');
  assert.equal(authReads, 0);
});

test('recovery point is encrypted and keeps the old password independently of a replacement', async () => {
  const records = new Map();
  const context = vm.createContext({ window: { crypto: webcrypto, btoa, atob }, TextEncoder, TextDecoder, Uint8Array });
  for (const file of ['src/security/passwordAuth.js', 'src/security/appDataCrypto.js', 'src/data/appRepository.js']) {
    vm.runInContext(read(file), context);
  }
  const ns = context.window.Unterrichtsassistent;
  ns.data.readState = async key => structuredClone(records.get(key));
  ns.data.writeState = async (key, value) => records.set(key, structuredClone(value));
  ns.data.writeStates = async values => Object.keys(values).forEach(key => records.set(key, structuredClone(values[key])));
  const repo = new ns.data.AppRepository();
  const auth = await ns.security.passwordAuth.createPasswordAuthRecord('vorher-passwort');
  const key = await ns.security.passwordAuth.unlockPasswordAuthRecord('vorher-passwort', auth);
  const original = { students: [{ id: 's1', name: 'Synthetisch' }], todos: [{ id: 't1' }] };
  const encrypted = await ns.security.appDataCrypto.encryptSnapshot(original, key);
  const recovery = await repo.saveRecoveryPoint(encrypted, auth, 'Vor Import');
  await assert.rejects(repo.saveRecoveryPoint(original, auth, 'invalid'), /verschluesselt/);
  assert.doesNotMatch(JSON.stringify(records.get('encryptedRecoveryPoint')), /Synthetisch/);
  await repo.saveProtectedState({ algorithm: 'AES-GCM', ciphertext: 'replacement' }, { encryptedMasterKey: 'other' });
  const savedRecovery = await repo.loadRecoveryPoint();
  const restoredKey = await ns.security.passwordAuth.unlockPasswordAuthRecord('vorher-passwort', savedRecovery.passwordAuth);
  const restored = await ns.security.appDataCrypto.decryptSnapshot(savedRecovery.appState, restoredKey);
  assert.deepEqual(JSON.parse(JSON.stringify(restored)), original);
  assert.equal(savedRecovery.exportedAt, recovery.exportedAt);
  await assert.rejects(ns.security.passwordAuth.unlockPasswordAuthRecord('anderes-passwort', savedRecovery.passwordAuth));
});

function workerHarness(options = {}) {
  const listeners = {}, stores = new Map(), fetched = [];
  const origin = 'https://app.test';
  const scope = origin + '/lehrer/';
  const cacheApi = {
    open: async name => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return { put: async (key, response) => store.set(String(key), response.clone()), match: async key => store.get(String(key))?.clone() };
    },
    keys: async () => [...stores.keys()], delete: async name => stores.delete(name)
  };
  const context = vm.createContext({
    self: { registration: { scope }, location: { origin }, clients: { claim: async () => {} }, addEventListener: (name, fn) => { listeners[name] = fn; } },
    caches: cacheApi, URL, Request, Set,
    fetch: async request => {
      const url = request.url || String(request); fetched.push(url);
      if (options.fail && url.includes(options.fail)) return new Response('missing', { status: 404 });
      if (url.includes('/index.html')) return new Response('<link rel="stylesheet" href="style.css?v=1"><script src="src/app.js?v=1"></script>INDEX');
      if (url.includes('/auth.html')) return new Response('<script src="src/authPage.js?v=1"></script>AUTH');
      return new Response('ASSET ' + url);
    }
  });
  vm.runInContext(read('service-worker.js'), context);
  return {
    stores, fetched,
    install: () => new Promise((resolve, reject) => listeners.install({ waitUntil: promise => promise.then(resolve, reject) })),
    activate: () => new Promise((resolve, reject) => listeners.activate({ waitUntil: promise => promise.then(resolve, reject) })),
    request: async relative => {
      let response;
      listeners.fetch({ request: new Request(scope + relative), respondWith: result => { response = result; } });
      return (await response).text();
    },
    status: () => { let result; listeners.message({ data: { type: 'OFFLINE_STATUS' }, ports: [{ postMessage: value => { result = value; } }] }); return result; }
  };
}

test('offline installation includes auth and its scripts, and auth URLs never fall back to index', async () => {
  const h = workerHarness();
  await h.install();
  assert.ok(h.fetched.some(url => url.includes('/src/authPage.js')));
  assert.ok(h.fetched.some(url => url.includes('/src/app.js')));
  const initialRequests = h.fetched.length;
  assert.match(await h.request('auth.html?mode=unlock&reason=idle'), /AUTH/);
  assert.match(await h.request('index.html'), /INDEX/);
  assert.match(await h.request(''), /INDEX/);
  assert.equal(h.fetched.length, initialRequests);
  assert.equal(h.status().ready, true);
});

test('cache activation only removes previous app releases and keeps unrelated caches', async () => {
  const h = workerHarness();
  h.stores.set('unrelated-cache', new Map());
  h.stores.set('unterrichtsassistent-allinone-v8', new Map());
  await h.install(); await h.activate();
  assert.equal(h.stores.has('unrelated-cache'), true);
  assert.equal(h.stores.has('unterrichtsassistent-allinone-v8'), false);
  assert.equal(h.stores.size, 2);
});

test('missing release assets reject the new installation and preserve the previous version', async () => {
  const h = workerHarness({ fail: 'authPage.js' });
  h.stores.set('unterrichtsassistent-shell-previous', new Map());
  await assert.rejects(h.install(), /App-Datei/);
  assert.deepEqual([...h.stores.keys()], ['unterrichtsassistent-shell-previous']);
});

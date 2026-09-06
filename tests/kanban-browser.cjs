// Run against a local static server. Each run uses an isolated browser profile and synthetic data.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const base = process.env.KANBAN_TEST_URL || 'http://127.0.0.1:8765';
const output = process.env.KANBAN_QA_DIR || path.join(require('node:os').tmpdir(), 'kanban-qa');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, timezoneId: 'Europe/Berlin' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    await page.goto(base + '/auth.html');
    await page.evaluate(async () => {
      const ns = window.Unterrichtsassistent;
      const record = await ns.security.passwordAuth.createPasswordAuthRecord('Kanban-test-only-2026');
      const key = await ns.security.passwordAuth.unlockPasswordAuthRecord('Kanban-test-only-2026', record);
      const repo = new ns.data.AppRepository();
      await repo.savePasswordAuthRecord(record);
      await repo.saveSnapshot({ todos: [], taskPeople: [{ id: 'p1', name: 'Frau Müller' }, { id: 'p2', name: 'Schulleitung' }], planningCategories: [{ id: 'digital', name: 'Digitalisierung', color: '#a9cfe2' }], classes: [], students: [] });
      ns.security.passwordAuth.createUnlockSession(key);
    });
    await page.goto(base + '/index.html');
    await page.waitForFunction(() => typeof schoolService !== 'undefined' && schoolService !== null);
    await page.locator('[data-view-target="todos"]').click();
    await page.getByRole('tab', { name: 'Kanban', exact: true }).click();
    await page.getByRole('button', { name: '+ Neue Aufgabe', exact: true }).click();
    await page.locator('#kanbanTaskForm [name="title"]').fill('Medienkonzept aktualisieren – Öl & Grüße');
    await page.locator('#kanbanTaskForm [name="description"]').fill('Besprechung mit der Schulleitung. Unterlagen vorbereiten.');
    await page.locator('#kanbanTaskForm [name="category"]').selectOption('Digitalisierung');
    await page.locator('#kanbanTaskForm [name="dueDate"]').fill('2026-09-08');
    await page.locator('#kanbanTaskForm [name="responsiblePersonId"]').selectOption('p1');
    await page.locator('.kanban-task-form__people summary').click();
    await page.locator('[name="participantPersonIds"][value="p2"]').check();
    await page.locator('button[type=submit][form=kanbanTaskForm]').click();
    let data = await page.evaluate(() => schoolService.snapshot.todos);
    assert.equal(data.length, 1); assert.equal(data[0].categoryId, 'digital');
    assert.deepEqual(data[0].participantPersonIds, ['p2']);
    const taskId = data[0].id;
    await page.locator('[data-kanban-task-id]').first().getByRole('button').first().click();
    await page.locator('#kanbanProtocolText').fill('Telefonat mit Frau Müller. Rückmeldung bis Freitag.');
    await page.locator('#kanbanProtocolForm button[type="submit"]').click();
    await page.locator('#kanbanTaskForm [name="taskStatus"]').selectOption('waiting');
    await page.locator('#kanbanTaskForm [name="waitingForPersonId"]').selectOption('p2');
    await page.locator('button[type=submit][form=kanbanTaskForm]').click();
    data = await page.evaluate(() => schoolService.snapshot.todos);
    assert.equal(data[0].taskStatus, 'waiting'); assert.ok(data[0].waitingSince);
    assert.equal(data[0].protocol.length, 1);
    assert.equal(data[0].history.filter(e => e.eventType === 'status').length, 1);
    await page.screenshot({ path: path.join(output, 'landscape.png'), fullPage: true });
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.screenshot({ path: path.join(output, 'portrait.png'), fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    // Touch-style pointer drag from waiting to planned, including pointer capture and hit testing.
    await page.evaluate(() => { document.querySelector('[data-kanban-board]').scrollLeft = 550; });
    const card = page.locator(`[data-kanban-task-id="${taskId}"]`);
    const handle = card.locator('[data-kanban-drag]');
    await handle.scrollIntoViewIfNeeded();
    const source = await handle.boundingBox();
    const column = page.locator('[data-kanban-status="planned"]');
    const target = await column.boundingBox();
    const touch = await context.newCDPSession(page);
    const from = { x: source.x + 20, y: source.y + 20 };
    const to = { x: Math.min(780, target.x + 80), y: target.y + 100 };
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] });
    for (let step = 1; step <= 6; step++) {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * step / 6, y: from.y + (to.y - from.y) * step / 6 }] });
    }
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    data = await page.evaluate(() => schoolService.snapshot.todos);
    assert.equal(data[0].taskStatus, 'planned'); assert.equal(data[0].protocol.length, 1);
    // Legacy list completion must enter the same history while preserving manual entries.
    await page.evaluate(id => window.UnterrichtsassistentApp.toggleTodoDone(id, true), taskId);
    data = await page.evaluate(() => schoolService.snapshot.todos);
    assert.equal(data[0].taskStatus, 'done'); assert.ok(data[0].completedAt);
    assert.equal(data[0].history.filter(e => e.eventType === 'status').length, 3);
    await page.evaluate(id => window.UnterrichtsassistentApp.kanban.openTask(id), taskId);
    await page.screenshot({ path: path.join(output, 'detail.png'), fullPage: true });
    // Export also preserves an entry that is still being composed, in the same snapshot update.
    await page.locator('#kanbanProtocolText').fill('Abschließende Rückmeldung: Raum 204 ist reserviert.');
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: /PDF/ }).click();
    const popup = await popupPromise;
    await popup.getByRole('link', { name: 'PDF herunterladen', exact: true }).waitFor();
    const pdfText = await page.evaluate(async () => {
      const repo = new window.Unterrichtsassistent.data.AppRepository();
      await flushPendingPersist({ immediate: true });
      const encrypted = await repo.loadSnapshot();
      const assertEncrypted = window.Unterrichtsassistent.security.appDataCrypto.isEncryptedSnapshotRecord(encrypted);
      const pdf = window.Unterrichtsassistent.features.tasks.pdf.buildTaskPdf(schoolService.snapshot.todos[0], schoolService.snapshot);
      return { header: pdf.output().slice(0, 8), encrypted: assertEncrypted };
    });
    assert.equal(pdfText.encrypted, true); assert.ok(pdfText.header.startsWith('%PDF-'));
    assert.equal(await page.evaluate(() => schoolService.snapshot.todos[0].protocol.length), 2);
    await popup.close();
    await page.evaluate(() => window.UnterrichtsassistentApp.kanban.closeTask());
    // Person management and combined filters are exercised with the real forms.
    await page.evaluate(() => window.UnterrichtsassistentApp.kanban.openPeople());
    await page.locator('#kanbanPersonName').fill('Herr Schmidt');
    await page.locator('#kanbanPersonForm button[type="submit"]').click();
    assert.equal(await page.evaluate(() => schoolService.snapshot.taskPeople.length), 3);
    await page.evaluate(() => window.UnterrichtsassistentApp.kanban.closePeople());
    await page.evaluate(() => { const app = window.UnterrichtsassistentApp.kanban; app.setFilter('status', 'open'); app.setFilter('category', 'Digitalisierung'); });
    assert.equal(await page.locator('[data-kanban-task-id]').count(), 0);
    await page.evaluate(() => window.UnterrichtsassistentApp.kanban.resetFilters());
    assert.equal(await page.locator('[data-kanban-task-id]').count(), 1);
    await page.evaluate(() => flushPendingPersist({ immediate: true }));
    // Reload and unlock through the normal storage/key flow, never retaining an in-memory snapshot.
    await page.reload();
    await page.waitForURL(/auth\.html/);
    await page.evaluate(async () => {
      const ns = window.Unterrichtsassistent;
      const record = await new ns.data.AppRepository().loadPasswordAuthRecord();
      const key = await ns.security.passwordAuth.unlockPasswordAuthRecord('Kanban-test-only-2026', record);
      ns.security.passwordAuth.createUnlockSession(key);
    });
    await page.goto(base + '/index.html');
    await page.waitForFunction(() => typeof schoolService !== 'undefined' && schoolService !== null);
    data = await page.evaluate(() => schoolService.snapshot.todos);
    assert.equal(data[0].protocol.length, 2); assert.equal(data[0].taskStatus, 'done');
    assert.equal(await page.evaluate(() => schoolService.snapshot.taskPeople.length), 3);
    await page.evaluate(id => { window.UnterrichtsassistentApp.setTodoWorkspaceMode('kanban'); window.UnterrichtsassistentApp.kanban.openTask(id); }, taskId);
    await page.locator('#kanbanProtocolText').fill('Zusatz beim Speichern bleibt erhalten.');
    await page.locator('button[type=submit][form=kanbanTaskForm]').click();
    assert.equal(await page.evaluate(() => schoolService.snapshot.todos[0].protocol.length), 3);
    await page.evaluate(id => window.UnterrichtsassistentApp.kanban.openTask(id), taskId);
    await page.getByRole('button', { name: 'Löschen', exact: true }).click();
    assert.equal(await page.evaluate(() => schoolService.snapshot.todos.length), 0);
    assert.deepEqual(errors, []);
    console.log('Kanban browser workflow passed; screenshots: ' + output);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });


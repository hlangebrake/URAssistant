const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sandbox = vm.createContext({ window: {}, Date, Set, Map, URL });
for (const file of ['src/domain/models.js', 'src/domain/factories.js', 'src/features/workspace/model.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), sandbox, { filename: file });
}
const ns = sandbox.window.Unterrichtsassistent;
const model = ns.features.workspace.model;
const plain = value => JSON.parse(JSON.stringify(value));
const time = '2026-09-20T10:00:00Z';
const later = '2026-09-21T10:00:00Z';
let serial = 0;
const id = prefix => prefix + '-' + (++serial);
function fixture() {
  return {
    classes: [{ id: 'c', name: 'Testklasse', subject: 'Biologie', studentIds: ['s'] }, { id: 'other', name: 'Andere Klasse', studentIds: ['other-s'] }],
    students: [{ id: 's', firstName: 'Test', lastName: 'Person' }],
    knowledgeGapRecords: [{ id: 'gap', classId: 'c', studentId: 's', content: 'Begründung ergänzen', status: 'offen' }],
    curriculumSeries: [{ id: 'series', classId: 'c' }],
    curriculumSequences: [{ id: 'seq', seriesId: 'series' }],
    curriculumLessonPlans: [{ id: 'plan', sequenceId: 'seq', topic: 'Zellvergleich' }],
    todos: []
  };
}
const actionDraft = { classId: 'c', studentId: 's', sourceId: 'gap', title: 'Argumentieren üben', dueDate: '2026-09-27' };
const reflectionDraft = { classId: 'c', lessonId: 'lesson', lessonPlanId: 'plan', lessonDate: '2026-09-20', topic: 'Zellvergleich', summary: 'Ergebnis festgehalten', nextStep: 'Beispiel wiederholen', followUpDate: '2026-09-22' };

test('actions link a student to a task and synchronize completion, continued review, and assigned statuses', () => {
  const snapshot = fixture();
  const action = model.saveAction(snapshot, actionDraft, time, id);
  const task = snapshot.todos[0];
  assert.equal(action.todoId, task.id);
  assert.deepEqual(plain(task.assignedStudentIds), ['s']);
  assert.deepEqual(plain(task.assignedStudentStatuses), [{ studentId: 's', done: false, completedAt: '', checklistItems: [] }]);
  model.reviewAction(snapshot, action.id, 'Begründung verbessert', 'reviewed', '', later);
  assert.equal(task.done, true);
  assert.equal(task.taskStatus, 'done');
  assert.equal(task.assignedStudentStatuses[0].done, true);
  assert.equal(task.assignedStudentStatuses[0].completedAt, later);
  model.reviewAction(snapshot, action.id, 'Transfer erneut prüfen', 'continue', '2026-10-01', later);
  assert.equal(action.status, 'open');
  assert.equal(task.done, false);
  assert.equal(task.taskStatus, 'planned');
  assert.equal(task.dueDate, '2026-10-01');
  assert.equal(task.assignedStudentStatuses[0].done, false);
  assert.equal(task.assignedStudentStatuses[0].completedAt, '');
  assert.equal(action.reviews.length, 2);
});

test('editing a measure retains its origin and review history, changes one task, and does not fake a review', () => {
  const snapshot = fixture();
  const action = model.saveAction(snapshot, actionDraft, time, id);
  model.reviewAction(snapshot, action.id, 'Weiter üben', 'continue', '2026-10-01', later);
  const taskId = action.todoId;
  model.saveAction(snapshot, { ...plain(action), title: 'Begründung vergleichen', dueDate: '2026-10-03' }, later, id);
  assert.equal(snapshot.learningActions.length, 1);
  assert.equal(snapshot.todos.length, 1);
  assert.equal(action.todoId, taskId);
  assert.equal(snapshot.todos[0].title, 'Begründung vergleichen');
  assert.equal(snapshot.todos[0].dueDate, '2026-10-03');
  assert.equal(action.sourceText, 'Begründung ergänzen');
  assert.equal(action.reviews.length, 1);
  assert.equal(action.changes.length, 1);
  assert.equal(action.status, 'open');
  snapshot.knowledgeGapRecords = [];
  model.saveAction(snapshot, { ...plain(action), title: 'Historischen Anlass erhalten' }, later, id);
  assert.equal(action.sourceText, 'Begründung ergänzen');
  assert.throws(() => model.saveAction(snapshot, { ...plain(action), classId: 'other', studentId: 'other-s' }, later, id), /Beobachtungsbezug/);
});

test('cancellation is separate from a successful review and retains task history', () => {
  const snapshot = fixture();
  const action = model.saveAction(snapshot, actionDraft, time, id);
  model.reviewAction(snapshot, action.id, 'Zwischenstand', 'continue', '2026-10-01', later);
  model.cancelAction(snapshot, action.id, 'Anderer Förderweg vereinbart', later);
  assert.equal(action.status, 'cancelled');
  assert.equal(action.cancellationReason, 'Anderer Förderweg vereinbart');
  assert.equal(action.outcome, 'Zwischenstand');
  assert.equal(action.reviews.length, 1);
  assert.equal(snapshot.todos[0].done, true);
  assert.equal(snapshot.todos[0].assignedStudentStatuses[0].done, true);
  assert.match(snapshot.todos[0].protocol.at(-1).text, /abgebrochen/);
  assert.throws(() => model.reviewAction(snapshot, action.id, 'Erfolg', 'reviewed', '', later), /abgebrochen/);
  assert.throws(() => model.saveAction(snapshot, { ...plain(action), title: 'Ändern' }, later, id), /abgebrochene/);
});

test('invalid action contexts and dates fail before adding tasks', () => {
  const snapshot = fixture();
  for (const patch of [{ studentId: 'outsider' }, { studentId: '' }, { dueDate: '2026-02-30' }, { title: ' ' }, { sourceId: 'missing' }]) {
    assert.throws(() => model.saveAction(snapshot, { ...actionDraft, ...patch }, time, id));
  }
  assert.equal(snapshot.todos.length, 0);
  const action = model.saveAction(snapshot, { ...actionDraft, sourceId: '', studentId: '', sourceText: 'Für die ganze Lerngruppe' }, time, id);
  assert.deepEqual(plain(snapshot.todos[0].assignedStudentIds), []);
  assert.equal(action.studentId, '');
});

test('changing a completed follow-up creates a new open task and retains the original completion and protocol', () => {
  const snapshot = fixture();
  const entry = model.saveReflection(snapshot, reflectionDraft, time, id);
  const oldTask = snapshot.todos[0];
  oldTask.done = true; oldTask.taskStatus = 'done'; oldTask.completedAt = later;
  oldTask.protocol = [{ id: 'p1', timestamp: later, text: 'Alte Aufgabe erledigt' }];
  model.saveReflection(snapshot, { ...reflectionDraft, summary: 'Tippfehler korrigiert' }, later, id);
  assert.equal(snapshot.todos.length, 1);
  model.saveReflection(snapshot, { ...reflectionDraft, nextStep: 'Transferaufgabe planen', followUpDate: '2026-09-24' }, later, id);
  assert.equal(snapshot.lessonReflections.length, 1);
  assert.equal(snapshot.todos.length, 2);
  assert.notEqual(entry.todoId, oldTask.id);
  assert.deepEqual(plain(entry.previousTodoIds), [oldTask.id]);
  assert.equal(oldTask.title, reflectionDraft.nextStep);
  assert.equal(oldTask.done, true);
  assert.equal(oldTask.completedAt, later);
  assert.equal(oldTask.protocol[0].text, 'Alte Aufgabe erledigt');
  assert.equal(snapshot.todos[1].done, false);
  assert.equal(snapshot.todos[1].title, 'Transferaufgabe planen');
});

test('clearing an active reflection follow-up requires explicit confirmation and leaves an audit trail', () => {
  const snapshot = fixture();
  const entry = model.saveReflection(snapshot, reflectionDraft, time, id);
  const before = JSON.stringify(snapshot);
  assert.throws(() => model.saveReflection(snapshot, { ...reflectionDraft, nextStep: '', followUpDate: '' }, later, id), /bestätigen/);
  assert.equal(JSON.stringify(snapshot), before);
  model.saveReflection(snapshot, { ...reflectionDraft, nextStep: '', followUpDate: '', cancelNextStep: 'on' }, later, id);
  assert.equal(entry.nextStep, '');
  assert.equal(entry.todoId, '');
  assert.equal(snapshot.todos[0].done, true);
  assert.match(snapshot.todos[0].protocol[0].text, /ausdrücklich abgebrochen/);
  assert.deepEqual(plain(entry.previousTodoIds), [snapshot.todos[0].id]);
});

test('reflection identities separate plans within one lesson and valid edits reuse the active task', () => {
  const snapshot = fixture();
  const entry = model.saveReflection(snapshot, reflectionDraft, time, id);
  model.saveReflection(snapshot, { ...reflectionDraft, nextStep: 'Genauer beschreiben' }, later, id);
  model.saveReflection(snapshot, { ...reflectionDraft, lessonPlanId: 'plan-two' }, later, id);
  assert.equal(snapshot.lessonReflections.length, 2);
  assert.equal(snapshot.todos.length, 2);
  assert.equal(snapshot.todos.find(task => task.id === entry.todoId).title, 'Genauer beschreiben');
});

test('resources can be corrected in place and removed; unsafe URLs and invalid ownership cannot be saved', () => {
  const snapshot = fixture();
  const draft = { classId: 'c', lessonPlanId: 'plan', title: 'Arbeitsblatt', url: 'https://example.org/a', status: 'print', kind: 'material' };
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', 'file:///C:/secret.txt', '/relative']) assert.throws(() => model.saveResource(snapshot, { ...draft, url }, time, id), /http/);
  assert.throws(() => model.saveResource(snapshot, { ...draft, classId: 'other' }, time, id), /gehört/);
  const entry = model.saveResource(snapshot, draft, time, id);
  model.saveResource(snapshot, { ...plain(entry), title: 'Lösung', url: 'https://example.org/solution', kind: 'solution', status: 'ready' }, later, id);
  assert.equal(snapshot.lessonResources.length, 1);
  assert.equal(entry.createdAt, time);
  assert.equal(entry.title, 'Lösung');
  assert.equal(entry.url, 'https://example.org/solution');
  assert.equal(entry.status, 'ready');
  model.removeResource(snapshot, entry.id);
  assert.equal(snapshot.lessonResources.length, 0);
  assert.throws(() => model.saveResource(snapshot, { ...draft, id: entry.id }, later, id), /nicht mehr/);
});

test('domain serialization retains links, cancellation, review/edit history, previous tasks and student completion', () => {
  const snapshot = fixture();
  const action = model.saveAction(snapshot, actionDraft, time, id);
  model.saveAction(snapshot, { ...plain(action), title: 'Neuer Titel' }, later, id);
  model.reviewAction(snapshot, action.id, 'Zwischenstand', 'continue', '2026-10-01', later);
  model.cancelAction(snapshot, action.id, 'Begründung', later);
  const reflection = model.saveReflection(snapshot, reflectionDraft, time, id);
  model.saveReflection(snapshot, { ...reflectionDraft, nextStep: '', cancelNextStep: true }, later, id);
  model.saveResource(snapshot, { classId: 'c', lessonPlanId: 'plan', title: 'Material', url: 'https://example.org' }, time, id);
  const restored = ns.domain.serializeDomainSnapshot(ns.domain.createDomainSnapshot(snapshot));
  assert.deepEqual(plain(restored.learningActions), plain(snapshot.learningActions));
  assert.deepEqual(plain(restored.lessonReflections), plain(snapshot.lessonReflections));
  assert.deepEqual(plain(restored.lessonResources), plain(snapshot.lessonResources));
  const restoredTask = restored.todos.find(task => task.id === action.todoId);
  assert.equal(restoredTask.done, true);
  assert.equal(restoredTask.assignedStudentStatuses[0].done, true);
  assert.equal(restoredTask.protocol.at(-1).text, snapshot.todos[0].protocol.at(-1).text);
  assert.equal(restored.lessonReflections[0].previousTodoIds[0], reflection.previousTodoIds[0]);
});

// Small DOM boundary double: exercises controller state transitions, not browser layout.
function controllerFixture(saveBehavior, applySavedSnapshot = true) {
  let state = fixture(), activeDialog = null, confirmResult = false, confirmations = 0, saveCalls = 0;
  const announcements = [], dialogs = [], navigations = [];
  const decode = text => String(text || '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const attr = (text, key) => decode((new RegExp('(?:^|\\s)' + key + '="([^"]*)"').exec(text) || [])[1] || '');
  const document = {
    activeElement: { isConnected: true, focus() {} },
    body: { appendChild(dialog) { dialogs.push(dialog); activeDialog = dialog; } },
    getElementById(id) { return id === 'workspaceStudent' ? activeDialog && activeDialog.controls.find(item => item.name === 'studentId') : null; },
    createElement() {
      const dialog = {
        controls: [], events: {}, error: { hidden: true, textContent: '' }, button: { disabled: false, textContent: '' }, leaveConfirm: { hidden: true }, leaveMessage: { textContent: '' }, keepDraft: { focus() {} }, discardDraft: { textContent: '' },
        setAttribute() {}, showModal() { this.open = true; }, close() { this.open = false; },
        remove() { this.removed = true; if (activeDialog === this) activeDialog = null; },
        addEventListener(name, callback) { this.events[name] = callback; },
        querySelectorAll(selector) { return this.controls.filter(item => selector === '[name]' ? item.name : selector === '.ws-resource select[data-id]' ? item.dataset.id : true); },
        querySelector(selector) {
          if (selector === '#workspaceError') return this.error;
          if (selector === '#workspaceForm') return this.form;
          if (selector === '[type=submit]') return this.button;
          if (selector === '#workspaceLeaveConfirm') return this.leaveConfirm;
          if (selector === '#workspaceLeaveMessage') return this.leaveMessage;
          if (selector === '#workspaceKeepDraft') return this.keepDraft;
          if (selector === '#workspaceDiscardDraft') return this.discardDraft;
          const name = /\[name=([^\]]+)\]/.exec(selector);
          return name ? this.controls.find(item => item.name === name[1]) : this.controls[0];
        }
      };
      dialog.form = { get elements() { return dialog.controls; }, querySelector: selector => dialog.querySelector(selector) };
      Object.defineProperty(dialog, 'innerHTML', { get() { return this.html; }, set(html) {
        this.html = html; this.controls = [];
        const pattern = /<input\b([^>]*)>|<textarea\b([^>]*)>([\s\S]*?)<\/textarea>|<select\b([^>]*)>([\s\S]*?)<\/select>/g;
        for (const match of html.matchAll(pattern)) {
          const attributes = match[1] || match[2] || match[4], name = attr(attributes, 'name');
          let value = match[1] ? attr(attributes, 'value') : match[2] ? decode(match[3]) : '';
          if (match[4]) { const options = Array.from(match[5].matchAll(/<option([^>]*)>/g)); const selected = options.find(option => /\bselected\b/.test(option[1])) || options[0]; value = selected ? attr(selected[1], 'value') : ''; }
          this.controls.push({ name, value, dataset: { id: attr(attributes, 'data-id') }, type: attr(attributes, 'type') || (match[2] ? 'textarea' : 'select'), checked: /\bchecked\b/.test(attributes), disabled: false, focus() {} });
        }
      } });
      return dialog;
    }
  };
  class FormDataDouble {
    constructor(form) { this.form = form; }
    *entries() { for (const element of this.form.elements) if (element.name && !element.disabled && (!['checkbox', 'radio'].includes(element.type) || element.checked)) yield [element.name, element.type === 'checkbox' ? 'on' : element.value]; }
  }
  const browser = vm.createContext({ window: { crypto: { randomUUID: () => String(++serial) }, confirm() { confirmations += 1; return confirmResult; } }, document, FormData: FormDataDouble, Date, Set, Map, URL });
  for (const file of ['src/shared/html.js', 'src/features/workspace/model.js', 'src/features/workspace/controller.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), browser, { filename: file });
  const controller = browser.window.Unterrichtsassistent.features.workspace.createController({
    context: () => ({ snapshot: state, classId: 'c', date: '2026-09-20', time: '08:00' }),
    schedule: () => ({ lessons: [{ id: 'lesson', lessonDate: '2026-09-20', startTime: '07:50', endTime: '09:20', lessonPlanIds: ['plan', 'plan-two'] }] }),
    async save(snapshot) { if (applySavedSnapshot) state = snapshot; saveCalls += 1; return saveBehavior ? saveBehavior(saveCalls) : true; },
    announce: value => announcements.push(value), refresh() {}, navigate(target) { navigations.push(target); return true; }
  });
  return { controller, get snapshot() { return state; }, get dialog() { return activeDialog; }, get saveCalls() { return saveCalls; }, get confirmations() { return confirmations; }, announcements, dialogs, navigations,
    setConfirmation(value) { confirmResult = value; }, set(name, value) { activeDialog.controls.find(item => item.name === name).value = value; },
    submit() { return controller.submit({ target: activeDialog.form, preventDefault() {} }); }
  };
}

test('dialog close, Escape and dialog replacement protect drafts; lock clears sensitive content without asking', () => {
  const app = controllerFixture();
  app.controller.openQuick(); app.set('title', 'Ungespeicherter Entwurf');
  const draftDialog = app.dialog;
  assert.equal(app.controller.hasDraft(), true);
  app.controller.close(); assert.equal(app.dialog, draftDialog);
  assert.equal(app.dialog.leaveConfirm.hidden, false);
  assert.match(app.dialog.leaveMessage.textContent, /Ungespeicherte/);
  app.controller.keepDraft();
  assert.equal(app.dialog.leaveConfirm.hidden, true);
  assert.equal(app.dialog.controls.find(item => item.name === 'title').value, 'Ungespeicherter Entwurf');
  let prevented = false;
  app.dialog.events.cancel({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.equal(app.dialog, draftDialog);
  app.controller.openSearch(); assert.equal(app.dialog, draftDialog);
  assert.equal(app.confirmations, 0);
  app.controller.clear();
  assert.equal(app.dialog, null); assert.equal(draftDialog.removed, true);
  assert.equal(app.controller.hasDraft(), false); assert.equal(app.confirmations, 0);
  app.controller.discardDraft(); assert.equal(app.dialog, null);
  app.controller.openQuick(); app.set('title', 'Weiterer Entwurf');
  app.controller.openSearch(); assert.match(app.dialog.html, /Schnell erfassen/);
  app.controller.discardDraft(); assert.match(app.dialog.html, /In der App suchen/);
});

test('discard confirmation continues the requested dialog or navigation and preserves contextual field locks', () => {
  const app = controllerFixture();
  app.controller.openQuick(); app.set('title', 'Entwurf');
  app.controller.openAction('gap'); app.controller.discardDraft();
  assert.match(app.dialog.html, /Nächsten Lernschritt/);
  assert.equal(app.dialog.controls.find(item => item.name === 'classId').disabled, true);
  assert.equal(app.dialog.controls.find(item => item.name === 'studentId').disabled, true);
  app.set('title', 'Maßnahme');
  app.controller.openView('todo');
  assert.equal(app.navigations.length, 0);
  app.controller.discardDraft();
  assert.equal(app.dialog, null);
  assert.deepEqual(plain(app.navigations), [{ type: 'view', view: 'todo' }]);
  app.controller.openQuick(); app.set('title', 'Entwurf');
  app.dialog.events.cancel({ preventDefault() {} }); app.controller.discardDraft();
  assert.equal(app.dialog, null);
  assert.equal(app.confirmations, 0);
});

test('material status controls are disabled while saving and resynchronize after success and storage failures', async () => {
  for (const result of ['success', 'false', 'reject']) {
    let settle;
    const app = controllerFixture(() => new Promise((resolve, reject) => { settle = () => result === 'reject' ? reject(new Error('Speicherfehler')) : resolve(result !== 'false'); }), result !== 'reject');
    app.snapshot.lessonResources = [{ id: 'a', classId: 'c', lessonPlanId: 'plan', title: 'Blatt', url: 'https://example.org/a', status: 'prepare' }, { id: 'b', classId: 'c', lessonPlanId: 'plan', title: 'Lösung', url: 'https://example.org/b', status: 'print' }];
    app.controller.openResources('plan', 'c');
    const selects = app.dialog.querySelectorAll('.ws-resource select[data-id]');
    app.set('title', 'Unfertiger weiterer Link');
    selects[0].value = 'ready';
    const operation = app.controller.resourceStatus('a', 'ready');
    assert.ok(selects.every(select => select.disabled));
    selects[1].value = 'ready';
    await app.controller.resourceStatus('b', 'ready');
    assert.equal(selects[1].value, 'print');
    assert.equal(app.saveCalls, 1);
    settle(); await operation;
    assert.ok(selects.every(select => !select.disabled));
    assert.equal(selects[0].value, result === 'reject' ? 'prepare' : 'ready');
    assert.equal(selects[1].value, 'print');
    assert.equal(app.dialog.controls.find(item => item.name === 'title').value, 'Unfertiger weiterer Link');
    assert.equal(app.dialog.error.hidden, result === 'success');
  }
});

test('adding material also disables existing status controls until the pending snapshot is safely saved', async () => {
  let settle;
  const app = controllerFixture(() => new Promise(resolve => { settle = resolve; }));
  app.snapshot.lessonResources = [{ id: 'a', classId: 'c', lessonPlanId: 'plan', title: 'Blatt', url: 'https://example.org/a', status: 'prepare' }];
  app.controller.openResources('plan', 'c');
  app.set('title', 'Neuer Link'); app.set('url', 'https://example.org/new');
  const select = app.dialog.querySelectorAll('.ws-resource select[data-id]')[0];
  const operation = app.submit();
  assert.equal(select.disabled, true);
  settle(false); await operation;
  assert.equal(select.disabled, true);
  select.value = 'ready'; await app.controller.resourceStatus('a', 'ready');
  assert.equal(select.value, 'prepare');
  assert.equal(app.saveCalls, 1);
  app.controller.close();
  assert.equal(app.dialog.leaveConfirm.hidden, false);
  assert.match(app.dialog.leaveMessage.textContent, /nicht dauerhaft/);
  assert.equal(app.dialog.discardDraft.textContent, 'Dialog trotzdem verlassen');
  app.controller.keepDraft();
  const retry = app.submit(); settle(true); await retry;
  assert.equal(app.snapshot.lessonResources.length, 2);
  assert.equal(app.dialog, null);
});

test('false persistence keeps the dialog, makes no success claim and retries without duplicate records', async () => {
  const app = controllerFixture(call => call > 1);
  app.controller.openAction('gap'); app.set('title', 'Übung');
  await app.submit();
  assert.equal(app.snapshot.learningActions.length, 1);
  assert.equal(app.snapshot.todos.length, 1);
  assert.equal(app.announcements.length, 0);
  assert.equal(app.dialog.error.hidden, false);
  assert.match(app.dialog.error.textContent, /nicht dauerhaft/);
  assert.ok(app.dialog.controls.every(control => control.disabled));
  assert.equal(app.dialog.button.disabled, false);
  await app.submit();
  assert.equal(app.saveCalls, 2);
  assert.equal(app.snapshot.learningActions.length, 1);
  assert.equal(app.snapshot.todos.length, 1);
  assert.equal(app.dialog, null);
  assert.equal(app.announcements.length, 1);
});

test('multiple lesson plans require a choice and the chosen plan supplies the reflection topic', async () => {
  const app = controllerFixture();
  app.snapshot.curriculumLessonPlans.push({ id: 'plan-two', sequenceId: 'seq', topic: 'Zweiter Stundenplan' });
  app.controller.openReflection('c', '2026-09-20', 'lesson');
  assert.match(app.dialog.html, /Stundenplanung auswählen/);
  app.set('lessonPlanId', 'plan-two'); await app.submit();
  assert.match(app.dialog.html, /Zweiter Stundenplan/);
  app.set('summary', 'Zweite Stunde abgeschlossen'); await app.submit();
  assert.equal(app.snapshot.lessonReflections[0].lessonPlanId, 'plan-two');
  assert.equal(app.snapshot.lessonReflections[0].topic, 'Zweiter Stundenplan');
});

test('lock during persistence prevents a late callback from reopening a dialog or announcing data', async () => {
  let resolve;
  const app = controllerFixture(() => new Promise(done => { resolve = done; }));
  app.controller.openQuick(); app.set('title', 'Aufgabe');
  const operation = app.submit();
  app.controller.clear(); resolve(true); await operation;
  assert.equal(app.dialog, null);
  assert.equal(app.announcements.length, 0);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ window: {}, Date, Set, Map });
['src/features/tasks/model.js', 'src/features/planning/categories.js', 'src/features/school/display.js', 'src/domain/models.js', 'src/domain/factories.js'].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
});
const model = context.window.Unterrichtsassistent.features.tasks.model;
const domain = context.window.Unterrichtsassistent.domain;
const copy = value => JSON.parse(JSON.stringify(value));
const created = '2026-09-06T07:14:00.000Z';
const changed = '2026-09-07T09:30:00.000Z';
const data = () => ({
  todos: [], planningCategories: [{ id: 'cat-digital', name: 'Digitalisierung', color: '#778899' }],
  taskPeople: [{ id: 'person-1', name: 'Frau Müller' }, { id: 'person-2', name: 'Schulleitung' }]
});
const task = values => model.createTask(Object.assign({ id: 'todo-test', title: 'Medienkonzept aktualisieren', category: 'Digitalisierung' }, values), data(), created);

test('existing task fields, contacts and independent logs survive snapshot roundtrip', () => {
  const snapshot = data();
  snapshot.todos = [model.addProtocolEntry(task({ responsiblePersonId: 'person-1', participantPersonIds: ['person-2'], type: 'checkliste', checklistItems: [{ id: 'c1', title: 'Unterlagen', done: true }] }), 'Änderungen für Müller – vollständig.', changed)];
  const domainSnapshot = domain.createDomainSnapshot(snapshot);
  const serialized = domain.serializeDomainSnapshot(domainSnapshot);
  assert.equal(serialized.todos[0].protocol[0].text, 'Änderungen für Müller – vollständig.');
  assert.equal(serialized.todos[0].responsiblePersonId, 'person-1');
  assert.equal(serialized.todos[0].categoryId, 'cat-digital');
  assert.equal(serialized.todos[0].checklistItems[0].title, 'Unterlagen');
  assert.equal(serialized.taskPeople[0].name, 'Frau Müller');
  serialized.todos[0].history[0].newValue = 'mutated';
  serialized.todos[0].protocol[0].text = 'mutated';
  assert.equal(domainSnapshot.todos[0].history[0].newValue, null);
  assert.notEqual(domainSnapshot.todos[0].protocol[0].text, 'mutated');
});

test('old TODOs migrate without invented timestamps or synthetic completion dates', () => {
  const unknown = model.normalizeTask({ id: 'todo-old', title: 'Alt', done: true });
  assert.equal(unknown.taskStatus, 'done');
  assert.equal(unknown.createdAt, '');
  assert.equal(unknown.completedAt, '');
  assert.equal(unknown.history.length, 1);
  assert.equal(unknown.history[0].timestamp, '');
  assert.equal(unknown.history[0].unknownTimestamp, true);
  const known = model.normalizeTask({ id: 'todo-' + new Date(created).getTime() + '-12', title: 'Vorhanden' });
  assert.equal(known.createdAt, created);
  assert.equal(known.history[0].inferred, true);
  assert.equal(model.normalizeTask(known).history.length, 1);
});

test('waiting transitions retain past context and restart waiting on re-entry', () => {
  let entry = task();
  entry = model.updateTask(entry, { taskStatus: 'waiting', waitingForPersonId: 'person-1' }, data(), changed);
  assert.equal(entry.waitingSince, changed);
  assert.equal(model.getWaitingInfo(entry, data(), '2026-09-13').days, 6);
  assert.match(model.getWaitingInfo(entry, data(), '2026-09-13').label, /Frau Müller/);
  const sameStatus = model.updateTask(entry, { taskStatus: 'waiting', title: 'Neuer Titel' }, data(), '2026-09-08T12:00:00Z');
  assert.equal(sameStatus.waitingSince, changed);
  const active = model.updateTask(sameStatus, { taskStatus: 'in-progress' }, data(), '2026-09-09T12:00:00Z');
  assert.equal(model.getWaitingInfo(active, data()), null);
  assert.equal(active.waitingSince, changed);
  const waitingAgain = model.updateTask(active, { taskStatus: 'waiting' }, data(), '2026-09-10T12:00:00Z');
  assert.equal(waitingAgain.waitingSince, '2026-09-10T12:00:00.000Z');
});

test('explicit waiting date survives status entry and subsequent reconciliation', () => {
  const previous = data(); previous.todos = [task()];
  const next = copy(previous);
  next.todos[0] = model.updateTask(next.todos[0], { taskStatus: 'waiting', waitingSince: '2026-09-01' }, next, changed);
  assert.equal(next.todos[0].waitingSince, '2026-09-01T00:00:00.000Z');
  model.reconcileSnapshot(next, previous, '2026-09-07T09:31:00Z');
  assert.equal(next.todos[0].waitingSince, '2026-09-01T00:00:00.000Z');
  assert.equal(model.getWaitingInfo(next.todos[0], next, '2026-09-07').days, 6);
  assert.equal(next.todos[0].history.filter(entry => entry.eventType === 'status').length, 1);
});

test('completion and reopening sync legacy done and leave protocol unchanged', () => {
  const initial = model.addProtocolEntry(task(), 'Besprechung mit Schulleitung.', changed);
  const completed = model.updateTask(initial, { taskStatus: 'done' }, data(), changed);
  assert.equal(completed.done, true);
  assert.equal(completed.completedAt, changed);
  const reopened = model.updateTask(completed, { taskStatus: 'planned' }, data(), '2026-09-08T12:00:00Z');
  assert.equal(reopened.done, false);
  assert.equal(reopened.completedAt, '');
  assert.deepEqual(copy(reopened.protocol), copy(initial.protocol));
  assert.equal(reopened.history.filter(entry => entry.eventType === 'status').length, 2);
});

test('reconciliation audits old TODO checkbox changes without losing new fields', () => {
  const previous = data();
  previous.todos = [model.addProtocolEntry(task({ taskStatus: 'waiting', responsiblePersonId: 'person-1' }), 'Nicht verlieren', changed)];
  const next = copy(previous);
  next.todos[0].done = true;
  next.todos[0].completedAt = changed;
  delete next.todos[0].protocol;
  delete next.todos[0].responsiblePersonId;
  model.reconcileSnapshot(next, previous, changed);
  assert.equal(next.todos[0].taskStatus, 'done');
  assert.equal(next.todos[0].responsiblePersonId, 'person-1');
  assert.equal(next.todos[0].protocol[0].text, 'Nicht verlieren');
  assert.equal(next.todos[0].history.filter(entry => entry.eventType === 'status').length, 1);
  const reopened = copy(next);
  reopened.todos[0].done = false;
  model.reconcileSnapshot(reopened, next, '2026-09-08T12:00:00Z');
  assert.equal(reopened.todos[0].taskStatus, 'backlog');
  assert.equal(reopened.todos[0].completedAt, '');
});

test('explicit status wins over stale done; update then reconcile creates one history event', () => {
  const previous = data(); previous.todos = [task()];
  const next = copy(previous);
  next.todos[0] = model.updateTask(next.todos[0], { taskStatus: 'waiting', dueDate: '2026-09-15' }, next, changed);
  model.reconcileSnapshot(next, previous, '2026-09-07T09:31:00Z');
  assert.equal(next.todos[0].history.filter(entry => entry.eventType === 'status').length, 1);
  assert.equal(next.todos[0].history.filter(entry => entry.eventType === 'deadline').length, 1);
  assert.equal(next.todos[0].waitingSince, changed);
  const stale = copy(next);
  stale.todos[0].taskStatus = 'done'; stale.todos[0].done = false;
  model.reconcileSnapshot(stale, next, changed);
  assert.equal(stale.todos[0].done, true);
});

test('private reconciler keeps a distinct baseline across in-place legacy edits', () => {
  const snapshot = data(); snapshot.todos = [task()];
  const reconcile = model.createReconciler();
  reconcile(snapshot, created);
  snapshot.todos[0].done = true;
  reconcile(snapshot, changed);
  assert.equal(snapshot.todos[0].taskStatus, 'done');
  assert.equal(snapshot.todos[0].history.filter(entry => entry.eventType === 'status').length, 1);
  reconcile(snapshot, changed);
  assert.equal(snapshot.todos[0].history.filter(entry => entry.eventType === 'status').length, 1);
});

test('deadline day math handles DST boundaries, invalid dates and absent deadlines', () => {
  assert.equal(model.getDeadlineInfo('2026-03-30', '2026-03-28').days, 2);
  assert.equal(model.getDeadlineInfo('2026-10-26', '2026-10-24').days, 2);
  assert.equal(model.getDeadlineInfo('2026-02-30', '2026-02-28').days, null);
  assert.equal(model.getDeadlineInfo('', '2026-09-06').level, 'none');
  assert.equal(model.getDeadlineInfo('2026-09-05', '2026-09-06').label, '1 Tag überfällig');
  assert.equal(model.getDeadlineInfo('2026-09-06', '2026-09-06').level, 'critical');
  assert.equal(model.getDeadlineInfo('2026-09-09', '2026-09-06').level, 'urgent');
  assert.equal(model.getDeadlineInfo('2026-09-13', '2026-09-06').level, 'warning');
  assert.equal(model.getDeadlineInfo('2026-09-20', '2026-09-06').level, 'notice');
  assert.equal(model.getDeadlineInfo('2026-09-21', '2026-09-06').level, 'normal');
});

test('deadline sorting beats manual priority; no deadlines use priority, completion uses newest first', () => {
  const tasks = [task({ id: 'none-low' }), task({ id: 'later', dueDate: '2026-09-10', priority: 'hoch' }), task({ id: 'overdue', dueDate: '2026-09-01', priority: 'niedrig' }), task({ id: 'today', dueDate: '2026-09-06' }), task({ id: 'none-high', priority: 'hoch' })];
  assert.deepEqual(copy(model.sortTasks(tasks, '2026-09-06').map(entry => entry.id)), ['overdue', 'today', 'later', 'none-high', 'none-low']);
  const first = model.updateTask(task({ id: 'first' }), { taskStatus: 'done' }, data(), created);
  const second = model.updateTask(task({ id: 'second' }), { taskStatus: 'done' }, data(), changed);
  assert.equal(model.sortTasks([first, second])[0].id, 'second');
});

test('combined filters include description and keep responsible and participating roles separate', () => {
  const tasks = [task({ id: 'match', description: 'Besprechung zur Schulleitung', responsiblePersonId: 'person-1', participantPersonIds: ['person-2'], dueDate: '2026-09-15' }), task({ id: 'other', participantPersonIds: ['person-1'], dueDate: '2026-09-15' }), task({ id: 'done', responsiblePersonId: 'person-1', dueDate: '2026-09-15', taskStatus: 'done' })];
  const filters = { search: 'Schulleitung', categoryId: 'cat-digital', status: 'open', responsiblePersonId: 'person-1', participantPersonId: 'person-2', deadline: '14' };
  assert.deepEqual(copy(model.filterTasks(tasks, filters, data(), '2026-09-06').map(entry => entry.id)), ['match']);
  assert.equal(model.filterTasks(tasks, { participantPersonId: 'person-1' }, data()).length, 1);
  assert.equal(model.filterTasks(tasks, { deadline: 'none' }, data()).length, 0);
});

test('existing category IDs follow rename, while legacy category changes resolve a new reference', () => {
  const previous = data(); previous.todos = [task()];
  const renamed = copy(previous); renamed.planningCategories[0].name = 'Medienbildung';
  model.reconcileSnapshot(renamed, previous, changed);
  assert.equal(renamed.todos[0].category, 'Medienbildung');
  assert.equal(renamed.todos[0].categoryId, 'cat-digital');
  assert.equal(renamed.todos[0].history.at(-1).eventType, 'category');
  const reassigned = copy(renamed); reassigned.todos[0].category = 'Sonstiges';
  model.reconcileSnapshot(reassigned, renamed, changed);
  assert.equal(reassigned.todos[0].categoryId, '');
  assert.equal(reassigned.todos[0].category, 'Sonstiges');
});

test('deleted references remain readable without creating duplicate categories or people', () => {
  const entry = task({ responsiblePersonId: 'missing-person' });
  const snapshot = { taskPeople: [], planningCategories: [] };
  assert.equal(model.getPersonName(snapshot, entry.responsiblePersonId), 'Nicht mehr verfügbare Person');
  const category = model.getCategory(entry, snapshot);
  assert.equal(category.name, 'Digitalisierung');
  assert.equal(category.missing, true);
  assert.equal(model.normalizeTask(entry, snapshot).categoryId, 'cat-digital');
  assert.equal(snapshot.planningCategories.length, 0);
});

test('existing class category colors and imported completion timestamps are retained', () => {
  const snapshot = data(); snapshot.classes = [{ id: 'class-1', name: '7a', subject: 'Mathematik', displayColor: '#567abc' }];
  assert.equal(model.getCategory({ category: '7a Mathematik' }, snapshot).color, '#567abc');
  const imported = new domain.TodoItem({ id: 'todo-imported', title: 'Erledigt', taskStatus: 'done', done: false, completedAt: changed });
  assert.equal(imported.done, true);
  assert.equal(imported.completedAt, changed);
});

test('manual protocol is append-only and merge unions both histories by ID', () => {
  const first = model.addProtocolEntry(task(), 'Erster Eintrag', created);
  const second = model.addProtocolEntry(first, 'Zweiter Eintrag', changed);
  const deleted = copy(second); deleted.protocol = [];
  const previous = data(); previous.todos = [second];
  const next = data(); next.todos = [deleted];
  model.reconcileSnapshot(next, previous, changed);
  assert.equal(next.todos[0].protocol.length, 2);
  const remote = model.addProtocolEntry(first, 'Anderes Gerät', changed);
  model.mergeTaskLogs(second, remote);
  assert.equal(second.protocol.length, 3);
  assert.equal(second.history.length, 1);
  assert.equal(model.addProtocolEntry(first, '   ', changed).protocol.length, 1);
});

test('timeline preserves complete multiline notes with visually distinct event kinds and chronological ordering', () => {
  const initial = task();
  const started = model.updateTask(initial, { taskStatus: 'in-progress' }, data(), changed);
  const note = 'Telefonat mit Frau Müller.\nRaum 204 ist reserviert.\n' + 'Weitere Einzelheiten. '.repeat(1000);
  const final = model.addProtocolEntry(started, note, '2026-09-07T12:20:00Z');
  const timeline = model.getTimeline(final, data(), { newestFirst: false });
  assert.deepEqual(copy(timeline.map(entry => entry.kind)), ['history', 'history', 'protocol']);
  assert.equal(timeline[1].text, 'Backlog → In Bearbeitung');
  assert.equal(timeline[2].text, note.trim());
  assert.equal(model.getTimeline(final, data())[0].kind, 'protocol');
});

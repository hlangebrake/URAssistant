const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ window: {}, Date, Set, Map });
['src/features/tasks/model.js', 'src/features/planning/categories.js', 'src/ui/viewHelpers.js', 'src/ui/views/kanbanView.js'].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
});
const app = context.window.Unterrichtsassistent;
const model = app.features.tasks.model;
const view = app.ui.views.kanban;
const snapshot = {
  todos: [],
  planningCategories: [{ id: 'area-digital', name: 'Digitalisierung', color: '#778899' }],
  taskPeople: [{ id: 'person-mueller', name: 'Frau Müller' }]
};
context.window.UnterrichtsassistentApp = {
  getPlanningCategoryDefinitions: () => app.features.planning.categories.getDefinitions(snapshot)
};
const created = '2026-09-06T07:14:00Z';
const make = values => model.createTask(Object.assign({ id: 'task-1', title: 'Medienkonzept', category: 'Digitalisierung' }, values), snapshot, created);
const render = (todos, state = {}) => view.render({ snapshot: Object.assign({}, snapshot, { todos }) }, Object.assign({ filters: { status: 'all' } }, state));

test('board keeps five accessible columns and limits completed tasks without removing them', () => {
  const todos = Array.from({ length: 24 }, (_, i) => make({ id: 'done-' + i, title: 'Erledigte Aufgabe ' + i, taskStatus: 'done' }));
  todos.push(make({ id: 'waiting', title: 'Rückmeldung zum Medienkonzept', taskStatus: 'waiting', waitingForPersonId: 'person-mueller' }));
  const html = render(todos);
  assert.equal((html.match(/data-kanban-status=/g) || []).length, 5);
  assert.equal((html.match(/data-kanban-task-id=/g) || []).length, 21);
  assert.match(html, /Weitere anzeigen \(4\)/);
  assert.match(html, /Wartet seit .* auf Frau Müller/);
  assert.match(html, /data-kanban-drag/);
  assert.match(html, /aria-live="polite"/);
  assert.equal((render(todos, { completedLimit: 40 }).match(/data-kanban-task-id=/g) || []).length, 25);
});

test('combined filters retain the matching task and exclude unrelated tasks', () => {
  const a = make({ id: 'match', title: 'Passende Aufgabe', responsiblePersonId: 'person-mueller', priority: 'hoch' });
  const b = make({ id: 'other', title: 'Andere Aufgabe', priority: 'hoch' });
  const html = render([a, b], { filters: { status: 'open', search: 'passende', category: 'Digitalisierung', responsiblePersonId: 'person-mueller', deadline: 'none', priority: 'hoch' } });
  assert.match(html, /data-kanban-task-id="match"/);
  assert.doesNotMatch(html, /data-kanban-task-id="other"/);
});

test('detail escapes free text and exposes separate manual and automatic entries', () => {
  let task = make({ title: '<img src=x onerror=alert(1)>', description: 'Umlaute: Äöü ß & <script>bad()</script>', responsiblePersonId: 'deleted-person', participantPersonIds: ['deleted-person'], categoryId: 'deleted-area', category: 'Alter Bereich' });
  task = model.addProtocolEntry(task, 'Telefonat: <script>bad()</script> & Rückmeldung', '2026-09-07T12:20:00Z');
  const html = render([task], { draft: task });
  assert.doesNotMatch(html, /<script>bad/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;script&gt;bad/);
  assert.match(html, /Nicht mehr verfügbare Person/);
  assert.match(html, /Alter Bereich \(nicht mehr vorhanden\)/);
  assert.match(html, /kanban-timeline__entry--protocol/);
  assert.match(html, /Aufgabe erstellt/);
  assert.match(html, /PDF exportieren/);
  assert.match(html, /method="post" action="about:blank" data-local-only-form/);
});

test('new tasks without optional fields render without inventing a category or person', () => {
  const html = render([], { draft: { title: '', description: '', taskStatus: 'backlog', participantPersonIds: [] } });
  assert.match(html, /value="" selected>Aufgabenbereich wählen/);
  assert.doesNotMatch(html, /Ohne Aufgabenbereich \(nicht mehr vorhanden\)/);
  assert.match(html, /Speichere die Aufgabe, um Protokolleinträge hinzuzufügen/);
  assert.doesNotMatch(html, /PDF exportieren/);
});

test('people overlay isolates the task dialog and preserves Unicode names', () => {
  const html = render([], { draft: make({}), peopleOpen: true, personDraft: { id: 'person-mueller', name: 'Frau Müller' } });
  assert.match(html, /id="kanbanTaskModal" inert aria-hidden="true"/);
  assert.match(html, /id="kanbanPeopleModal"/);
  assert.match(html, /id="kanbanPersonName"[^>]*value="Frau Müller"/);
});

test('checklist completion stays controlled by existing checklist items', () => {
  const open = make({ type: 'checkliste', taskStatus: 'backlog' });
  const html = view.renderTaskModal({ snapshot }, { draft: open });
  assert.match(html, /value="done" disabled>Erledigt/);
  assert.doesNotMatch(html, />✓ Erledigen</);
  assert.match(html, /ergibt sich „Erledigt“ aus der Checkliste/);
  const completed = make({ type: 'checkliste', taskStatus: 'done' });
  const doneHtml = view.renderTaskModal({ snapshot }, { draft: completed });
  assert.match(doneHtml, /value="backlog" disabled>Backlog/);
  assert.match(doneHtml, /value="done" selected>Erledigt/);
});

test('orphaned categories remain filterable without becoming a source for new tasks', () => {
  const orphan = make({ categoryId: 'deleted-area', category: 'Alter Bereich' });
  const html = render([orphan]);
  assert.match(html, /value="Alter Bereich">Alter Bereich \(nicht mehr vorhanden\)/);
  const newTaskModal = view.renderTaskModal({ snapshot }, { draft: { title: '', taskStatus: 'backlog' } });
  assert.doesNotMatch(newTaskModal, /Alter Bereich/);
});

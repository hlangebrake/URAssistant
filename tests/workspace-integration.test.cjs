const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function loadOverview(snapshot, lessons) {
  const context = vm.createContext({ window: { Unterrichtsassistent: { ui: {views:{} } } }, URL, Date });
  for (const file of ['src/shared/html.js','src/features/workspace/model.js','src/ui/views/overviewView.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
  const m = context.window.Unterrichtsassistent.features.workspace.model;
  context.window.UnterrichtsassistentApp = {
    getPlanningEventsForDisplay: () => [],
    workspace: { getRange: () => 'week', context: () => ({date:'2026-09-21',time:'08:00',manual:true}), currentLessons: () => lessons,
      lessonDetails: lesson => {const planId=lesson.lessonPlanIds[0],plan=snapshot.curriculumLessonPlans.find(item=>item.id===planId);return {planId,plan,topic:plan?plan.topic:'Noch ohne Stundenplanung'};}
    }
  };
  return context.window.Unterrichtsassistent.ui.views.overview.render({snapshot});
}
test('overview shows both plans of a shared teaching block and their separate preparation/material context',()=>{
  const html=loadOverview({classes:[{id:'c',name:'8a',subject:'Bio'}],curriculumLessonPlans:[{id:'a',topic:'Zellen',preparationTodoId:'prep'},{id:'b',topic:'Membran'}],todos:[{id:'prep',title:'Kopieren',dueDate:'2026-09-21'}],lessonResources:[{id:'r',lessonPlanId:'b',title:'Bild',status:'print'}]},[{id:'occ',classId:'c',lessonDate:'2026-09-21',startTime:'08:00',endTime:'09:30',lessonPlanIds:['a','b']}]);
  assert.match(html,/>Zellen</); assert.match(html,/>Membran</);
  assert.match(html,/data-plan="a"/); assert.match(html,/data-plan="b"/);
  assert.match(html,/1 Material noch vorbereiten/); assert.match(html,/Vorbereitung offen/);
  assert.match(html,/1 Unterrichtsblöcke/);
});
test('closed gaps and reviewed/cancelled actions do not inflate actionable dashboard signals',()=>{
  const html=loadOverview({classes:[],curriculumLessonPlans:[],knowledgeGapRecords:[{id:'closed',content:'Closed unique gap',status:'geschlossen'},{id:'open',content:'Open unique gap',status:'offen'}],learningActions:[{id:'done',title:'Done unique action',status:'reviewed',dueDate:'2026-09-01',outcome:'Erreicht'},{id:'cancel',title:'Cancelled unique action',status:'cancelled',dueDate:'2026-09-01'}]},[]);
  assert.doesNotMatch(html,/Closed unique gap/); assert.match(html,/Open unique gap/);
  assert.match(html,/Noch keine offenen Maßnahmen/);
  assert.match(html,/Wirkung überprüfen<\/span><strong>0<\/strong>/);
});
test('overview escapes imported content and search-result context',()=>{
  const html=loadOverview({classes:[{id:'c',name:'<script>oops</script>'}],curriculumLessonPlans:[{id:'a',topic:'<img src=x onerror=alert(1)>'}]},[{id:'occ',classId:'c',lessonDate:'2026-09-21',lessonPlanIds:['a']}]);
  assert.doesNotMatch(html,/<script>oops/); assert.doesNotMatch(html,/<img src=x/);
  assert.match(html,/&lt;img/);
});
test('explicit learner and class deletion removes new personal records and linked tasks without touching unrelated work',()=>{
  const source=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
  const start=source.indexOf('function cleanupWorkspaceForDeletion('),end=source.indexOf('window.UnterrichtsassistentApp.deleteStudent',start);
  const context=vm.createContext({Set});vm.runInContext(source.slice(start,end),context);
  const snapshot={learningActions:[{id:'a',studentId:'s',classId:'c',todoId:'ta'},{id:'b',studentId:'other',classId:'c2',todoId:'tb'}],todos:[{id:'ta'},{id:'tb'},{id:'unrelated'}],lessonResources:[{id:'r1',classId:'c'},{id:'r2',classId:'c2'}],lessonReflections:[{id:'f1',classId:'c'},{id:'f2',classId:'c2'}]};
  context.cleanupWorkspaceForDeletion(snapshot,'',['s']);
  assert.deepEqual(snapshot.todos.map(item=>item.id),['tb','unrelated']);assert.equal(snapshot.lessonResources.length,2);
  context.cleanupWorkspaceForDeletion(snapshot,'c',[]);
  assert.deepEqual(snapshot.lessonResources.map(item=>item.id),['r2']);assert.deepEqual(snapshot.lessonReflections.map(item=>item.id),['f2']);assert.equal(snapshot.learningActions[0].id,'b');
});

test('search navigation pins the requested class and learner even during another live lesson', () => {
  const snapshot = {
    classes: [{ id: 'live', name: 'Liveklasse' }, { id: 'target', name: 'Zielklasse' }],
    activeClassId: 'live', activeDateTimeMode: 'live', activeDateTime: '2026-09-21T08:30',
    activeSeatPlanId: 'old-plan', activeSeatOrderId: 'old-order', activeSeatPlanRoom: 'old-room'
  };
  const context = vm.createContext({ window: {}, Date });
  vm.runInContext(fs.readFileSync(path.join(root, 'src/services/schoolService.js'), 'utf8'), context);
  const service = new context.window.Unterrichtsassistent.services.SchoolService(snapshot);
  // Hold a different scheduled lesson active, independently of the wall clock.
  service.getCurrentLesson = () => ({ classId: 'live' });
  service.getReferenceDate = () => new Date('2026-09-21T08:30:00');
  assert.equal(service.getActiveClass().id, 'live');
  const rendered = [];
  let configuration;
  context.schoolService = service;
  context.serializeSnapshot = value => value;
  context.refreshSnapshotInMemory = (value, view) => {
    service.snapshot = value;
    rendered.push({ view, classId: service.getActiveClass().id });
  };
  context.activeClassStudentAnalysisStudentId = '';
  context.window.UnterrichtsassistentApp = { setClassViewMode: mode => { context.classMode = mode; } };
  context.window.Unterrichtsassistent.features = { workspace: { createController: options => { configuration = options; return {}; } } };
  const source = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
  const start = source.indexOf('window.UnterrichtsassistentApp.workspace =');
  const end = source.indexOf('\n});', start) + '\n});'.length;
  assert.ok(start >= 0 && end > start, 'actual workspace integration is present');
  vm.runInContext(source.slice(start, end), context);

  configuration.navigate({ type: 'student', classId: 'target', id: 'target-student' });
  assert.equal(service.getActiveClass().id, 'target');
  assert.equal(context.activeClassStudentAnalysisStudentId, 'target-student');
  assert.equal(context.classMode, 'schueler');
  assert.equal(snapshot.activeDateTimeMode, 'manual');
  assert.equal(snapshot.activeDateTime, '2026-09-21T08:30');
  assert.equal(snapshot.activeSeatPlanId, null);
  assert.equal(snapshot.activeSeatOrderId, null);
  assert.equal(snapshot.activeSeatPlanRoom, '');
  assert.deepEqual(rendered, [{ view: 'klasse', classId: 'target' }]);

  snapshot.activeDateTimeMode = 'live';
  configuration.navigate({ type: 'class', classId: 'target', id: 'target' });
  assert.equal(service.getActiveClass().id, 'target');
  snapshot.activeDateTimeMode = 'live';
  configuration.navigate({ type: 'view', view: 'overview' });
  assert.equal(snapshot.activeDateTimeMode, 'live', 'unscoped navigation keeps live mode');
});

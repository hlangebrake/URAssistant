const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sandbox = vm.createContext({ window: {}, Date, Set, Map });
for (const file of ['src/shared/html.js', 'src/domain/models.js', 'src/domain/factories.js', 'src/features/curriculum/planning.js', 'src/features/planning/instruction.js', 'src/services/schoolService.js', 'src/ui/viewHelpers.js', 'src/ui/views/planungView.js', 'src/ui/views/stundenplanView.js', 'src/ui/views/unterrichtView.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), sandbox, { filename: file });
}
const ns = sandbox.window.Unterrichtsassistent;
const planning = ns.features.planning.instruction;
const curriculum = ns.features.curriculum.planning;
const plain = value => JSON.parse(JSON.stringify(value));
function fixture() {
  return {
    schoolYearStart: '2026-09-21', schoolYearEnd: '2026-09-28', activeDateTime: '2026-09-21T08:50', activeDateTimeMode: 'manual', activeClassId: 'c',
    classes: [{ id: 'c', name: '8a', subject: 'Chemie', students: [] }], students: [], assessments: [],
    timetables: [{ id: 't', validFrom: '2026-09-01', startTime: '08:00', rows: [
      { id: 'r1', type: 'lesson', durationMinutes: 45, days: { '1': { classId: 'c', room: 'C1', isDouble: true } } },
      { id: 'r2', type: 'lesson', durationMinutes: 45, days: {} }
    ] }],
    curriculumSeries: [{ id: 'series', classId: 'c', topic: 'Reihe', hourDemand: 5, startMode: 'automatic', nextSeriesId: '' }],
    curriculumSequences: [{ id: 'sequence', seriesId: 'series', topic: 'Sequenz', hourDemand: 5, nextSequenceId: '' }],
    curriculumLessonPlans: Array.from({ length: 5 }, (_, i) => ({ id: 'l' + i, sequenceId: 'sequence', topic: 'Thema ' + i, hourType: 'single', nextLessonId: i < 4 ? 'l' + (i + 1) : '' })),
    curriculumLessonPhases: [], curriculumLessonSteps: [], planningEvents: [], planningInstructionLessonStatuses: [], todos: []
  };
}
function setup(snapshot) {
  const service = new ns.services.SchoolService(snapshot);
  sandbox.window.UnterrichtsassistentApp = {
    getInstructionSchedule: (classId, source, date) => planning.buildInstructionSchedule(source || snapshot, service, classId, { referenceDate: date || service.getReferenceDate() }),
    getPlanningViewMode: () => 'unterrichtsplanung',
    getExpandedCurriculumSeriesIds: () => ['series'], getExpandedCurriculumSequenceIds: () => ['sequence'],
    getActiveCurriculumLessonFlowLessonId: () => 'l0'
  };
  return { service, schedule: () => planning.buildInstructionSchedule(snapshot, service, 'c') };
}

test('removes only the cancelled row of a double period and retains stable legacy record identity', () => {
  const snapshot = fixture();
  snapshot.planningEvents.push({ id: 'out', category: '8a Chemie', causesInstructionOutage: true, startDate: '2026-09-21', endDate: '2026-09-21', startTime: '08:00', endTime: '08:45', title: 'Ausfall' });
  const { service, schedule } = setup(snapshot);
  const result = schedule();
  assert.equal(result.slots.length, 3);
  assert.equal(result.slots[0].startTime, '08:45');
  assert.equal(result.slots[0].assignedLessonId, 'l0');
  assert.equal(result.occurrences[0].cancelledLessonCount, 1);
  assert.equal(result.occurrences[0].isCancelled, false);
  assert.equal(result.lessons[0].recordLessonId, 'timetable-1-r1');
  assert.equal(service.getAttendanceContextForClass('c', new Date('2026-09-21T08:15')), null);
  assert.equal(service.getAttendanceContextForClass('c', new Date('2026-09-21T08:50')).id, 'timetable-1-r1');
});

test('additional lessons consume the same ordered plan slots in calendar, week and live data', () => {
  const snapshot = fixture();
  snapshot.planningInstructionLessonStatuses.push({ id: 'extra', classId: 'c', lessonDate: '2026-09-22', isAdditionalLesson: true, additionalLessonType: 'single', additionalStartTime: '10:00', additionalEndTime: '10:45' });
  const { schedule, service } = setup(snapshot);
  const result = schedule();
  assert.deepEqual(plain(result.slots.map(slot => [slot.lessonDate, slot.assignedLessonId])), [['2026-09-21', 'l0'], ['2026-09-21', 'l1'], ['2026-09-22', 'l2'], ['2026-09-28', 'l3'], ['2026-09-28', 'l4']]);
  const extra = result.lessons.find(lesson => lesson.isAdditionalLesson);
  assert.deepEqual(plain(extra.lessonPlanIds), ['l2']);
  assert.equal(extra.recordLessonId, 'zusatzstunde::extra');
  assert.equal(service.getAttendanceContextForClass('c', new Date('2026-09-22T10:15')).id, 'zusatzstunde::extra');
  assert.equal(result.lessonPlanAssignments.l2.firstDate, '2026-09-22');
});

test('date-only additional lessons stay visible without inventing a live time', () => {
  const snapshot = fixture();
  snapshot.planningInstructionLessonStatuses.push({ id: 'legacy', classId: 'c', lessonDate: '2026-09-22', isAdditionalLesson: true, additionalLessonType: 'double' });
  const { schedule, service } = setup(snapshot);
  assert.equal(schedule().slots.filter(slot => slot.isAdditionalLesson).length, 2);
  assert.equal(schedule().lessons.find(lesson => lesson.isAdditionalLesson).startTime, '');
  assert.equal(service.getAttendanceContextForClass('c', new Date('2026-09-22T10:00')), null);
});

test('an additional lesson on a cancelled regular day does not override the cancellation', () => {
  const snapshot = fixture();
  snapshot.planningInstructionLessonStatuses.push({ id: 'cancel', classId: 'c', lessonDate: '2026-09-21', isCancelled: true }, { id: 'extra', classId: 'c', lessonDate: '2026-09-21', isAdditionalLesson: true, additionalLessonType: 'single' });
  const result = setup(snapshot).schedule();
  assert.equal(result.slots.filter(slot => slot.lessonDate === '2026-09-21').length, 1);
  assert.equal(result.slots[0].isAdditionalLesson, true);
  assert.equal(result.occurrenceLookup['unterrichtstag::2026-09-21'].isCancelled, true);
});

test('respects event class scope and manual series start; capacity excludes outages', () => {
  const snapshot = fixture();
  snapshot.classes.push({ id: 'other', name: '8b', subject: 'Chemie', students: [] });
  snapshot.planningEvents.push({ id: 'other-out', category: '8b Chemie', causesInstructionOutage: true, startDate: '2026-09-21', endDate: '2026-09-21' });
  snapshot.curriculumSeries[0].startMode = 'manual'; snapshot.curriculumSeries[0].startDate = '2026-09-28';
  const result = setup(snapshot).schedule();
  assert.equal(result.slots.length, 4);
  assert.equal(result.lessonPlanAssignments.l0.firstDate, '2026-09-28');
  assert.equal(result.seriesAssignments.series.unassignedDemand, 3);
  assert.equal(result.slots[0].assignedLessonId, '');
});

test('weekly and planning views render partial cancellations, additional lessons and quick planning', () => {
  const snapshot = fixture();
  snapshot.planningEvents.push({ id: 'out', category: '8a Chemie', causesInstructionOutage: true, startDate: '2026-09-21', endDate: '2026-09-21', startTime: '08:00', endTime: '08:45' });
  snapshot.planningInstructionLessonStatuses.push({ id: 'extra', classId: 'c', lessonDate: '2026-09-22', isAdditionalLesson: true });
  const { service } = setup(snapshot);
  const week = ns.ui.views.stundenplan.render(service);
  assert.match(week, /Teilausfall/);
  assert.match(week, /Zusatzstunden diese Woche/);
  assert.match(week, /ohne Uhrzeit/);
  const plan = ns.ui.views.planung.render(service);
  assert.match(plan, /planningQuickTopics/);
  assert.match(plan, /45-Minuten-Verlauf einfügen/);
  const live = ns.ui.views.unterricht.render(service);
  assert.match(live, /Thema 0/);
  assert.match(live, /workspace.openReflection/);
});

test('creates editable 45/90-minute templates whose phase and step times match exactly', () => {
  let count = 0;
  for (const [hourType, expected] of [['single', 45], ['double', 90]]) {
    const flow = curriculum.createStandardLessonFlow({ id: hourType, hourType }, kind => kind + (++count));
    assert.equal(flow.phases.reduce((sum, phase) => sum + phase.durationMinutes, 0), expected);
    assert.equal(flow.steps.reduce((sum, step) => sum + step.durationMinutes, 0), expected);
    assert.equal(flow.phases.length, 5);
    assert.equal(new Set(flow.phases.concat(flow.steps).map(item => item.id)).size, 10);
    assert.equal(flow.phases[0].nextPhaseId, flow.phases[1].id);
    assert.equal(flow.phases[4].nextPhaseId, '');
  }
});

test('bulk planning appends without altering existing lessons and increases necessary capacity', () => {
  const snapshot = fixture(); let count = 0;
  const before = plain(snapshot.curriculumLessonPlans[0]);
  const result = curriculum.appendQuickLessons(snapshot, 'sequence', '1. Einstieg\n\n- Transfer\nSicherung', 'double', true, kind => kind + (++count));
  assert.equal(result.lessonIds.length, 3);
  assert.equal(snapshot.curriculumLessonPlans.length, 8);
  assert.deepEqual(plain(snapshot.curriculumLessonPlans[0]), before);
  assert.equal(snapshot.curriculumLessonPlans[4].nextLessonId, result.lessonIds[0]);
  assert.deepEqual(plain(snapshot.curriculumLessonPlans.slice(5).map(item => item.topic)), ['Einstieg', 'Transfer', 'Sicherung']);
  assert.equal(snapshot.curriculumSequences[0].hourDemand, 11);
  assert.equal(snapshot.curriculumSeries[0].hourDemand, 11);
  assert.equal(snapshot.curriculumLessonPhases.length, 15);
  const roundTrip = ns.domain.serializeDomainSnapshot(ns.domain.createDomainSnapshot(snapshot));
  assert.equal(roundTrip.curriculumLessonPhases.length, 15);
  assert.equal(roundTrip.curriculumLessonSteps[0].socialForm, 'plenum');
});

test('invalid bulk input is atomic and titles-only creation leaves the flow empty', () => {
  const snapshot = fixture(); let count = 0;
  const before = JSON.stringify(snapshot);
  assert.ok(curriculum.appendQuickLessons(snapshot, 'missing', 'Thema', 'single', true, kind => kind + (++count)).error);
  assert.ok(curriculum.appendQuickLessons(snapshot, 'sequence', Array(51).fill('Thema').join('\n'), 'single', true, kind => kind + (++count)).error);
  assert.equal(JSON.stringify(snapshot), before);
  curriculum.appendQuickLessons(snapshot, 'sequence', 'Neue Stunde', 'single', false, kind => kind + (++count));
  assert.equal(snapshot.curriculumLessonPhases.length, 0);
  assert.equal(snapshot.curriculumLessonPlans.length, 6);
});

test('current teaching still works without a configured school year, including historical dates', () => {
  const snapshot = fixture(); snapshot.schoolYearStart = ''; snapshot.schoolYearEnd = '';
  const { schedule, service } = setup(snapshot);
  assert.equal(schedule().hasSchoolYearRange, false);
  assert.equal(schedule().rangeStart, '2026-09-21');
  assert.equal(service.getAttendanceContextForClass('c', new Date('2026-09-21T08:50')).id, 'timetable-1-r1');
  assert.equal(service.getAttendanceContextForClass('c', new Date('2026-10-12T08:50')).id, 'timetable-1-r1');
});

test('automatic live class selection uses the additional class when regular teaching is cancelled', () => {
  const snapshot = fixture(); snapshot.activeDateTimeMode = 'live';
  snapshot.classes.push({ id: 'other', name: '8b', subject: 'Chemie', students: [] });
  snapshot.planningInstructionLessonStatuses.push({ id: 'cancel', classId: 'c', lessonDate: '2026-09-21', isCancelled: true },
    { id: 'extra', classId: 'other', lessonDate: '2026-09-21', isAdditionalLesson: true, additionalLessonType: 'double', additionalStartTime: '08:00', additionalEndTime: '09:30' });
  const { service } = setup(snapshot); service.getReferenceDate = () => new Date('2026-09-21T08:50');
  assert.equal(service.getActiveClass().id, 'other');
  assert.equal(service.getCurrentLessonForClass('c', service.getReferenceDate()), null);
  assert.equal(service.getCurrentLessonForClass('other', service.getReferenceDate()).id, 'zusatzstunde::extra');
});

test('double lessons split across teaching blocks retain visible warnings through series level', () => {
  const snapshot = fixture(); snapshot.curriculumLessonPlans[1].hourType = 'double';
  const result = setup(snapshot).schedule();
  assert.equal(result.lessonPlanAssignments.l1.firstDate, '2026-09-21');
  assert.equal(result.lessonPlanAssignments.l1.lastDate, '2026-09-28');
  assert.equal(result.lessonPlanAssignments.l1.hasWarning, true);
  assert.equal(result.sequenceAssignments.sequence.hasWarning, true);
  assert.equal(result.seriesAssignments.series.hasWarning, true);
});

test('additional lesson times survive domain serialization while legacy times stay empty', () => {
  const snapshot = fixture(); snapshot.planningInstructionLessonStatuses.push(
    { id: 'timed', classId: 'c', lessonDate: '2026-09-22', isAdditionalLesson: true, additionalStartTime: '10:00', additionalEndTime: '10:45' },
    { id: 'legacy', classId: 'c', lessonDate: '2026-09-23', isAdditionalLesson: true });
  const restored = ns.domain.serializeDomainSnapshot(ns.domain.createDomainSnapshot(snapshot));
  assert.equal(restored.planningInstructionLessonStatuses[0].additionalStartTime, '10:00');
  assert.equal(restored.planningInstructionLessonStatuses[0].additionalEndTime, '10:45');
  assert.equal(restored.planningInstructionLessonStatuses[1].additionalStartTime, '');
});

test('app schedule cache sees in-place changes immediately within the same minute', () => {
  const snapshot = fixture(); const { service } = setup(snapshot);
  const code = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  const wrapper = code.slice(code.indexOf('const instructionScheduleCache ='), code.indexOf('function syncCurriculumLessonPreparationTodo('));
  const context = vm.createContext({ window: { UnterrichtsassistentApp: {} }, Date, WeakMap, schoolService: service, planningInstructionFeature: planning,
    getPlanningEventsForDisplay: (source, range) => source.planningEvents.filter(event => event.startDate <= range.rangeStart && (event.endDate || event.startDate) >= range.rangeStart) });
  vm.runInContext(wrapper, context);
  const get = context.window.UnterrichtsassistentApp.getInstructionSchedule;
  const before = get('c'); assert.equal(before, get('c'));
  snapshot.planningInstructionLessonStatuses.push({ id: 'out', classId: 'c', lessonDate: '2026-09-21', isCancelled: true });
  const after = get('c'); assert.notEqual(after, before);
  assert.equal(after.slots.length, 2);
  assert.equal(after.lessonPlanAssignments.l0.firstDate, '2026-09-28');
  snapshot.curriculumLessonPlans[0].nextLessonId = '';
  snapshot.curriculumLessonPlans[1].nextLessonId = 'l0';
  assert.notEqual(get('c'), after);
});

test('deleting planned lessons removes only their resource links and retains historical reflections', () => {
  const snapshot = { lessonResources: [{ id: 'a', lessonPlanId: 'l0' }, { id: 'b', lessonPlanId: 'l1' }, { id: 'c', lessonPlanId: 'other' }], lessonReflections: [{ id: 'history', lessonPlanId: 'l0', topic: 'Tatsächlich unterrichtet' }] };
  const history = snapshot.lessonReflections;
  assert.equal(curriculum.removeLessonResources(snapshot, ['l0', 'l1']), 2);
  assert.deepEqual(snapshot.lessonResources, [{ id: 'c', lessonPlanId: 'other' }]);
  assert.equal(snapshot.lessonReflections, history);
  const app = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  for (const name of ['deleteCurriculumLesson', 'deleteCurriculumSequence', 'deleteCurriculumSeries']) {
    const start = app.indexOf('window.UnterrichtsassistentApp.' + name + ' =');
    const body = app.slice(start, app.indexOf('\nwindow.UnterrichtsassistentApp.', start + 1));
    assert.match(body, /curriculumPlanningFeature\.removeLessonResources/);
  }
});

test('quick planning app action saves once and reveals the created sequence and first lesson', () => {
  const snapshot = fixture(); let count = 0, saves = 0;
  const app = fs.readFileSync(path.join(__dirname, '..', 'src/app.js'), 'utf8');
  const handler = app.slice(app.indexOf('function createQuickCurriculumId('), app.indexOf('window.UnterrichtsassistentApp.addCurriculumLessonPhase ='));
  const fields = { planningQuickSequence: { value: 'sequence' }, planningQuickTopics: { value: 'Erste neue Stunde\nZweite neue Stunde' }, planningQuickHourType: { value: 'single' }, planningQuickTemplate: { checked: true } };
  const context = vm.createContext({ window: { UnterrichtsassistentApp: {} },
    schoolService: { snapshot, getActiveClass: () => ({ id: 'c' }) }, serializeSnapshot: value => value,
    isCurriculumPlanningMode: () => true, curriculumPlanningFeature: curriculum,
    document: { getElementById: id => fields[id] }, expandedCurriculumSeriesIds: [], expandedCurriculumSequenceIds: [], activeCurriculumLessonFlowLessonId: '', activeCurriculumLessonFlowViewPhaseIds: [],
    createCurriculumLessonPlanId: () => 'newlesson' + (++count), createCurriculumLessonPhaseId: () => 'newphase' + (++count), createCurriculumLessonStepId: () => 'newstep' + (++count),
    saveAndRefreshSnapshot: () => { saves += 1; } });
  vm.runInContext(handler, context);
  context.window.UnterrichtsassistentApp.submitQuickCurriculumLessons({ preventDefault() {} });
  assert.equal(saves, 1);
  assert.equal(snapshot.curriculumLessonPlans.length, 7);
  assert.deepEqual(plain(context.expandedCurriculumSeriesIds), ['series']);
  assert.deepEqual(plain(context.expandedCurriculumSequenceIds), ['series::sequence']);
  assert.equal(context.activeCurriculumLessonFlowLessonId, snapshot.curriculumLessonPlans[5].id);
});

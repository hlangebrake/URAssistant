const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sandbox = vm.createContext({ window: {}, Date, Set, Map });
for (const file of ['src/domain/models.js', 'src/domain/factories.js', 'src/features/evaluation/nachpflege.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), sandbox, { filename: file });
}
const ns = sandbox.window.Unterrichtsassistent;
const feature = ns.features.evaluation.nachpflege;
const context = { classId: 'c1', lessonId: 'l1', lessonDate: '2026-09-20', students: [
  { id: 'a', firstName: 'Anna' }, { id: 'b', firstName: 'Ben' }, { id: 'c', firstName: 'Clara' }, { id: 'd', firstName: 'David' }
] };
const plain = value => JSON.parse(JSON.stringify(value));
test('sorts all feedback tools by most recent feedback, never assessed first, scoped to class and date', () => {
  const snapshot = {
    assessments: [{ studentId: 'a', classId: 'c1', type: 'unterricht', recordedAt: '2026-09-10T10:00:00' }, { studentId: 'd', classId: 'c2', type: 'unterricht', recordedAt: '2026-09-20T10:00:00' }],
    mathObservationRecords: [{ studentId: 'b', classId: 'c1', lessonDate: '2026-09-11' }],
    evidenceObservations: [{ studentId: 'c', classId: 'c1', recordedAt: '2026-09-12T10:00:00' }, { studentId: 'a', classId: 'c1', recordedAt: '2026-09-19T10:00:00' }, { studentId: 'd', classId: 'c1', recordedAt: '2026-09-21T10:00:00' }]
  };
  assert.deepEqual(plain(feature.sortedStudents(snapshot, context).map(item => item.student.id)), ['d', 'b', 'c', 'a']);
  feature.upsert(snapshot, context, 'd', 'overall', { overallImpression: 0 }, '2026-09-20T10:00:00');
  assert.deepEqual(plain(feature.sortedStudents(snapshot, context).map(item => item.student.id)), ['b', 'c', 'a', 'd']);
});
test('autosave updates one record per student, group and lesson; zero survives domain round trip', () => {
  const snapshot = {};
  feature.upsert(snapshot, context, 'a', 'overall', { overallImpression: 0 }, '2026-09-20T10:00:00');
  feature.upsert(snapshot, context, 'a', 'overall', { note: 'Eine vollständige Notiz' }, '2026-09-20T10:00:01');
  feature.upsert(snapshot, context, 'b', 'overall', { overallImpression: -2 }, '2026-09-20T10:00:02');
  feature.upsert(snapshot, context, 'a', 'detail', { afb2: 0 }, '2026-09-20T10:00:03');
  assert.equal(snapshot.assessments.length, 3);
  assert.equal(feature.getRecord(snapshot, context, 'a', 'overall').overallImpression, 0);
  assert.equal(feature.getRecord(snapshot, context, 'a', 'overall').note, 'Eine vollständige Notiz');
  assert.equal(feature.getRecord(snapshot, context, 'a', 'detail').situationType, '');
  assert.equal(feature.getRecord(snapshot, context, 'a', 'detail').demandLevel, '');
  const restored = ns.domain.serializeDomainSnapshot(ns.domain.createDomainSnapshot(snapshot));
  assert.equal(feature.getRecord(restored, context, 'a', 'overall').overallImpression, 0);
  assert.equal(feature.getRecord(restored, context, 'a', 'detail').afb2, 0);
  assert.equal(feature.upsert(snapshot, context, 'outsider', 'overall', { overallImpression: 2 }, ''), null);
  assert.equal(snapshot.assessments.length, 3);
});
test('clearing a draft removes empty feedback; linked gaps update without duplication and retain status', () => {
  const snapshot = {};
  feature.upsert(snapshot, context, 'a', 'detail', { knowledgeGap: 'Brüche' }, '2026-09-20');
  snapshot.knowledgeGapRecords[0].status = 'in arbeit';
  feature.upsert(snapshot, context, 'a', 'detail', { knowledgeGap: 'Brüche kürzen', note: 'Üben' }, '2026-09-20');
  assert.equal(snapshot.knowledgeGapRecords.length, 1);
  assert.equal(snapshot.knowledgeGapRecords[0].content, 'Brüche kürzen');
  assert.equal(snapshot.knowledgeGapRecords[0].status, 'in arbeit');
  feature.upsert(snapshot, context, 'a', 'detail', { knowledgeGap: '', note: '' }, '2026-09-20');
  assert.equal(snapshot.assessments.length, 0);
  assert.equal(snapshot.knowledgeGapRecords.length, 0);
});
test('math and custom evidence selections survive serialization and stay separate across classes and dates', () => {
  const snapshot = {};
  feature.upsert(snapshot, context, 'a', 'math', { competencyQualities: [{ competencyId: 'k1', quality: 0 }] }, '2026-09-20');
  feature.upsert(snapshot, context, 'a', 'tool:custom', { selections: [{ aspectId: 'aspect', stages: [{ dimensionId: 'dimension', stageId: 'stage' }] }] }, '2026-09-20');
  const restored = ns.domain.serializeDomainSnapshot(ns.domain.createDomainSnapshot(snapshot));
  assert.equal(restored.mathObservationRecords[0].competencyQualities[0].quality, 0);
  assert.equal(restored.evidenceObservations[0].selections[0].stages[0].stageId, 'stage');
  assert.deepEqual(plain(feature.getRecord(restored, { ...context, classId: 'c2' }, 'a', 'math')), {});
  assert.deepEqual(plain(feature.getRecord(restored, { ...context, lessonDate: '2026-09-21' }, 'a', 'math')), {});
});

test('feedback entered within the same lesson minute is ordered by the last edit across tools, also after reload', () => {
  const snapshot = {};
  feature.upsert(snapshot, context, 'b', 'tool:custom', { note: 'Erster Eintrag' }, '2026-09-20T12:00', '2026-09-20T10:00:01Z');
  feature.upsert(snapshot, context, 'a', 'overall', { overallImpression: 1 }, '2026-09-20T12:00', '2026-09-20T10:00:02Z');
  let restored = ns.domain.serializeDomainSnapshot(ns.domain.createDomainSnapshot(snapshot));
  assert.deepEqual(plain(feature.sortedStudents(restored, context).map(item => item.student.id)), ['c', 'd', 'b', 'a']);
  feature.upsert(restored, context, 'b', 'tool:custom', { note: 'Korrigiert' }, '2026-09-20T12:00', '2026-09-20T10:00:03Z');
  restored = ns.domain.serializeDomainSnapshot(ns.domain.createDomainSnapshot(restored));
  assert.deepEqual(plain(feature.sortedStudents(restored, context).map(item => item.student.id)), ['c', 'd', 'a', 'b']);
});

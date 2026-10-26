const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const ctx = vm.createContext({window:{},TextEncoder,Date,Map,Set});
for (const file of ['src/shared/html.js','src/features/evaluation/assessmentImport.js','src/features/evaluation/assessmentImportController.js','src/domain/models.js','src/domain/factories.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const ns = ctx.window.Unterrichtsassistent, feature = ns.features.evaluation.assessmentImport;
const fixture = () => JSON.parse(fs.readFileSync(path.join(root,'docs/bewertungsimport-v1.example.json'),'utf8'));
const plain = data => JSON.parse(JSON.stringify(data));
const students = [{id:'a',firstName:'Anna',lastName:'Müller'},{id:'b',firstName:'Ben',lastName:'Beispiel'},{id:'c',firstName:'Clara',lastName:'Kurz'},{id:'d',firstName:'David',lastName:'Fehlt'}];
const snapshot = () => ({classes:[{id:'class',name:'11a',subject:'Chemie',studentIds:students.map(s=>s.id)},{id:'other',name:'9b',studentIds:['x']}],students:[...students,{id:'x',firstName:'Anna',lastName:'Müller'}],evaluationSheets:[{id:'existing',title:'Vorhanden'}],plannedEvaluations:[],performedEvaluations:[]});
function importSample(data=fixture(),state=snapshot()) { let n=0; return feature.importInto(state,data,'class',feature.match(data,students),'2026-10-26T14:00:00Z',prefix=>prefix+'-'+(++n)); }
test('documented example parses with UTF-8 BOM, preserves zero, decimal maxima and explicit grades',()=>{
 const data=feature.parse('\uFEFF'+JSON.stringify(fixture()));
 assert.equal(data.results[0].subtaskResults[2].points,0);
 assert.equal(data.assessment.tasks[0].subtasks[1].maxPoints,2.5);
 assert.equal(data.results[0].gradeLabel,'2');
});
test('names match accents, umlauts, reversed order, unique first names and a clear spelling variant',()=>{
 const cases = ['Anna Mueller','Müller, Anna','ANNA MÜLLER','Anna','Anna Muler'];
 for(const displayName of cases){const data=fixture();data.results=[{...data.results[0],student:{displayName}}];const rows=feature.match(data,students);assert.equal(rows[0].studentId,'a',displayName);}
 const data=fixture();data.results[0].student={displayName:'Anna Garcia'};
 assert.equal(feature.match(data,[{id:'accent',firstName:'Anna',lastName:'García'}])[0].studentId,'accent');
});
test('ambiguous names and contested results are never forced by class size',()=>{
 const data=fixture();data.results=[{...data.results[1],student:{displayName:'Ben'}}];
 assert.equal(feature.match(data,[...students,{id:'ben2',firstName:'Ben',lastName:'Anders'}])[0].studentId,'');
 const duplicate={...data.results[0],id:'result-ben2'};data.results.push(duplicate);
 assert.ok(feature.match(data,students).every(r=>!r.studentId));
 data.results=[{...duplicate,student:{displayName:'Unbekannt Qxyz'}}];
 assert.equal(feature.match(data,students)[0].studentId,'');
});
test('local ID takes priority; external ID does not impersonate a local ID or cross class boundaries',()=>{
 const data=fixture(); data.results=[{...data.results[0],student:{urStudentId:'b',displayName:'Anna Müller'}}];
 assert.equal(feature.match(data,students)[0].studentId,'b');
 data.results[0].student.urStudentId='x';assert.equal(feature.match(data,students)[0].studentId,'');
 data.results[0].student={externalId:'b',displayName:'Anna Müller'};assert.equal(feature.match(data,students)[0].studentId,'a');
});
test('import creates all linked records with new IDs, selects participants only, does not mutate source',()=>{
 const data=fixture(), state=snapshot(), before=JSON.stringify(state), result=importSample(data,state);
 assert.equal(JSON.stringify(state),before);assert.equal(result.snapshot.evaluationSheets.length,2);
 assert.deepEqual(plain(result.planned.studentIds),['a','b']);assert.equal(result.performed.length,2);
 assert.ok(!result.planned.studentIds.includes('c')&&!result.planned.studentIds.includes('d'));
 assert.equal(result.planned.createPlanningEvent,false);
 for(const record of result.performed){assert.equal(record.plannedEvaluationId,result.planned.id);assert.equal(record.evaluationSheetId,result.sheet.id);assert.equal(record.classId,'class');assert.equal(record.isCompleted,true);assert.deepEqual(plain(record.subtaskResults.map(r=>r.subtaskId)),plain(result.sheet.taskSheet.tasks[0].subtasks.map(s=>s.id)));}
 assert.notEqual(result.sheet.taskSheet.tasks[0].subtasks[0].id,'a1a');
 assert.equal(result.performed[0].subtaskResults[0].criterionResults[0].points,1);
});
test('documents, grading, original names, rubric and source identity survive domain round trip and clone independently',()=>{
 const data=fixture();data.assessment.documents=[{id:'pdf',fileName:'Aufgaben.pdf',mimeType:'application/pdf',role:'question-paper',dataBase64:Buffer.from('%PDF-1.7\nexample').toString('base64')}];
 const imported=importSample(data), domain=ns.domain.createDomainSnapshot(imported.snapshot), restored=ns.domain.serializeDomainSnapshot(domain);
 const sheet=restored.evaluationSheets[0], performed=restored.performedEvaluations[0];
 assert.equal(sheet.documents[0].dataBase64,data.assessment.documents[0].dataBase64);
 assert.equal(sheet.instructions,data.assessment.instructions);
 assert.equal(sheet.taskSheet.tasks[0].text,data.assessment.tasks[0].text);
 assert.equal(sheet.taskSheet.tasks[0].subtasks[1].be,2.5);
 assert.equal(sheet.taskSheet.tasks[0].subtasks[0].expectedAnswer,data.assessment.tasks[0].subtasks[0].expectedAnswer);
 assert.equal(performed.gradeLabel,'2');assert.equal(performed.sourceStudent.lastName,'Mueller');
 assert.equal(performed.subtaskResults[0].gradeLabel,'1');assert.equal(performed.subtaskResults[0].answer,data.results[0].subtaskResults[0].answer);
 restored.performedEvaluations[0].subtaskResults[0].criterionResults[0].points=0;
 assert.equal(domain.performedEvaluations[0].subtaskResults[0].criterionResults[0].points,1);
 assert.throws(()=>feature.importInto(restored,data,'class',feature.match(data,students),'now'),/bereits importiert/);
});
test('same assessment cannot be duplicated with new export ID; different class is independent',()=>{
 const data=fixture(), result=importSample(data);data.exportId='new-export';
 assert.throws(()=>feature.importInto(result.snapshot,data,'class',feature.match(data,students),'now'),/bereits importiert/);
 const assigned=[{resultId:'result-anna',studentId:'x'},{resultId:'result-ben',studentId:'',excluded:true}];
 const other=feature.importInto(result.snapshot,data,'other',assigned,'now',prefix=>prefix+'-other');
 assert.deepEqual(plain(other.planned.studentIds),['x']);
});
test('invalid/unresolved/double/cross-class/absent assignments do not mutate any records',()=>{
 const data=fixture(), state=snapshot(), before=JSON.stringify(state);
 const badAssignments=[[],[{resultId:'result-anna',studentId:''},{resultId:'result-ben',studentId:'b'}],[{resultId:'result-anna',studentId:'a'},{resultId:'result-ben',studentId:'a'}],[{resultId:'result-anna',studentId:'x'},{resultId:'result-ben',studentId:'b'}],[{resultId:'result-clara',studentId:'c'},{resultId:'result-ben',studentId:'b'}],[{resultId:'result-anna',studentId:'a'},{resultId:'result-anna',studentId:'b'}]];
 for(const rows of badAssignments){assert.throws(()=>feature.importInto(state,data,'class',rows,'now'));assert.equal(JSON.stringify(state),before);}
});
test('explicit exclusion creates no pupil or correction document for excluded or absent result',()=>{
 const data=fixture(); const pdf=Buffer.from('%PDF-1.7\ntest').toString('base64');
 data.assessment.documents=[{id:'global',fileName:'Global.pdf',mimeType:'application/pdf',role:'rubric',dataBase64:pdf},{id:'ben',fileName:'Ben.pdf',mimeType:'application/pdf',role:'correction',studentRef:'result-ben',dataBase64:pdf},{id:'absent',fileName:'Clara.pdf',mimeType:'application/pdf',role:'correction',studentRef:'result-clara',dataBase64:pdf}];
 const result=feature.importInto(snapshot(),data,'class',[{resultId:'result-anna',studentId:'a'},{resultId:'result-ben',studentId:'',excluded:true}],'now',prefix=>prefix);
 assert.deepEqual(plain(result.sheet.documents.map(d=>d.id)),['global']);assert.deepEqual(plain(result.planned.studentIds),['a']);
});
test('malformed JSON, wrong version, invalid dates and points, missing results, references and criteria fail with field paths',()=>{
 assert.throws(()=>feature.parse('{'),/Kein gültiges JSON/);
 const cases=[
  [d=>d.version=2,/version=1/],
  [d=>d.assessment.date='2026-02-30',/assessment.date/],
  [d=>d.exportedAt='2026-10-26T12:00:00',/exportedAt/],
  [d=>d.results[0].subtaskResults[1].points=-1,/results\[0\].subtaskResults\[1\].points/],
  [d=>d.results[0].subtaskResults[1].points='1.5',/points/],
  [d=>d.results[0].subtaskResults[1].points=2.6,/points/],
  [d=>d.results[0].subtaskResults.pop(),/Für jede Teilaufgabe/],
  [d=>d.results[0].subtaskResults[0].subtaskId='missing',/Unbekannte Teilaufgabe/],
  [d=>d.results[0].subtaskResults.push({...d.results[0].subtaskResults[0]}),/ID doppelt/],
  [d=>d.assessment.tasks[0].subtasks[1].id='a1a',/ID doppelt/],
  [d=>d.assessment.tasks[0].subtasks[0].criteria[0].maxPoints=2,/Kriterienpunkte/],
  [d=>d.results[0].subtaskResults[0].criterionResults[0].points=0,/übereinstimmende Summe/],
  [d=>d.results[0].subtaskResults[0].criterionResults.pop(),/Alle Kriterien/],
  [d=>d.results[2].subtaskResults=[{subtaskId:'a1a',points:0}],/Abwesende/],
  [d=>d.results[0].gradeLabel='sehr gut',/Gesamtnote/],
  [d=>d.assessment.gradingScale.pop(),/minPercent=0/],
  [d=>d.assessment.gradingScale[0].minPercent=75,/Prozentgrenze doppelt/],
  [d=>d.results[1].student.externalId=d.results[0].student.externalId,/ID doppelt/],
  [d=>d.results[0].student={},/Name oder urStudentId/]
 ];
 for(const [mutate,pattern] of cases){const data=fixture();mutate(data);assert.throws(()=>feature.validate(data),pattern);}
});
test('bad document paths, MIME types, signatures, Base64 and references are rejected',()=>{
 const doc={id:'doc',fileName:'task.pdf',mimeType:'application/pdf',role:'question-paper',dataBase64:Buffer.from('%PDF-1.7\ntest').toString('base64')};
 for(const patch of [{fileName:'../task.pdf'},{mimeType:'image/png'},{dataBase64:'SGVsbG8='},{dataBase64:'data:application/pdf;base64,JVBERi0='},{role:'correction'},{role:'correction',studentRef:'missing'},{studentRef:'result-anna'}]) { const data=fixture();data.assessment.documents=[{...doc,...patch}];assert.throws(()=>feature.validate(data),/documents\[0\]/); }
});
test('no result produces no import, zero-point present result is retained',()=>{
 const data=fixture(); data.results=[data.results[2]];
 assert.throws(()=>feature.importInto(snapshot(),data,'class',[],'now'),/mindestens eine Zuordnung/);
 data.results=[fixture().results[1]];data.results[0].subtaskResults.forEach(r=>{r.points=0;});
 const result=importSample(data);assert.deepEqual(plain(result.planned.studentIds),['b']);assert.ok(result.performed[0].subtaskResults.every(r=>r.points===0));
});
test('imported statements and answers render as escaped plain text, document visibility is per pupil',()=>{
 const data=fixture();data.assessment.tasks[0].text='<script>alert(1)</script>';data.results[0].subtaskResults[0].answer='<img src=x onerror=alert(1)>';
 const pdf=Buffer.from('%PDF-1.7\ntest').toString('base64');data.assessment.documents=[{id:'anna',fileName:'Anna.pdf',mimeType:'application/pdf',role:'correction',studentRef:'result-anna',dataBase64:pdf}];
 const result=importSample(data);const html=feature.renderDetails(result.sheet,result.performed[0]);
 assert.doesNotMatch(html,/<script>|<img src=x/);assert.match(html,/&lt;script&gt;/);assert.match(html,/&lt;img/);assert.match(html,/Anna.pdf/);
 assert.doesNotMatch(feature.renderDetails(result.sheet,result.performed[1]),/Anna.pdf/);
 assert.doesNotMatch(feature.renderDetails(result.sheet),/Anna.pdf/);
});
test('controller validates the file and commits an entire assessment only after resolved preview',async()=>{
 let state=snapshot(),rendered=0,committed=0;
 ctx.document={querySelector:()=>null,activeElement:null};ctx.window.crypto=require('node:crypto').webcrypto;
 const controller=feature.createController({snapshot:()=>state,activeClass:()=>state.classes[0],students:()=>students,render:()=>rendered++,commit:async result=>{state=result.snapshot;committed++;return true;}});
 await controller.readFile({target:{files:[{name:'exam.json',size:1000,text:async()=>JSON.stringify(fixture())}],value:'exam.json'}});
 assert.match(controller.render(),/assessmentImportModal/);assert.match(controller.render(),/2 zugeordnet/);assert.match(controller.render(),/Clara Kurz, David Fehlt/);
 await controller.confirm();assert.equal(committed,1);assert.equal(state.performedEvaluations.length,2);assert.doesNotMatch(controller.render(),/id="assessmentImportModal"/);assert.ok(rendered>=3);
});
test('controller rejects stale target class and keeps preview without writing',async()=>{
 const state=snapshot();let active=state.classes[0],committed=0;
 ctx.document={querySelector:()=>null};
 const controller=feature.createController({snapshot:()=>state,activeClass:()=>active,students:()=>students,render:()=>{},commit:()=>committed++});
 await controller.readFile({target:{files:[{name:'exam.json',size:1000,text:async()=>JSON.stringify(fixture())}],value:''}});
 active=state.classes[1];await controller.confirm();assert.equal(committed,0);assert.match(controller.render(),/zur Ziel-Lerngruppe/);
});
test('real summary uses authoritative imported grade; changed points clear stale overall/partial grade and criterion points',()=>{
 const source=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
 const result=importSample(), record=result.performed[0];
 const summaryCtx=vm.createContext({getTaskSheetTasksForSheet:s=>s.taskSheet.tasks,getSubtasksForTaskSheetTask:t=>t.subtasks,getEvaluationSheetRegularBeValue:s=>s.isAdditionalTask?0:s.be,isEvaluationSubtaskAdditional:s=>s.isAdditionalTask,getEvaluationSheetBeValue:s=>s.be,getPlannedEvaluationStageLabelForPoints:()=> 'computed'});
 const start=source.indexOf('function buildPerformedEvaluationSummary('),end=source.indexOf('function getPerformedEvaluationFeedbackList(',start);
 vm.runInContext(source.slice(start,end),summaryCtx);assert.equal(summaryCtx.buildPerformedEvaluationSummary(result.planned,result.sheet,record).stageLabel,'2');
 assert.equal(summaryCtx.buildPerformedEvaluationSummary(result.planned,result.sheet,record).totalReachable,5.5);
 const context=vm.createContext({window:{UnterrichtsassistentApp:{}},schoolService:{snapshot:result.snapshot},serializeSnapshot:s=>s,activePerformedPlannedEvaluationId:result.planned.id,activePerformedEvaluationStudentId:'a',repository:{},getPlannedEvaluationsCollection:s=>s.plannedEvaluations,getPerformedEvaluationForStudent:()=>record,normalizePerformedEvaluationPoints:Number,getCurrentTimestamp:()=> 'now',saveAndRefreshSnapshot:()=>{}});
 const a=source.indexOf('window.UnterrichtsassistentApp.updatePerformedEvaluationSubtaskField ='),b=source.indexOf('window.UnterrichtsassistentApp.updatePerformedCompetencyGridSelection =',a);
 vm.runInContext(source.slice(a,b),context);
 context.window.UnterrichtsassistentApp.updatePerformedEvaluationSubtaskField(record.subtaskResults[0].subtaskId,'points',2,3);
 assert.equal(record.gradeLabel,'');assert.equal(record.subtaskResults[0].gradeLabel,'');assert.equal(record.subtaskResults[0].criterionResults.length,0);
});

test('structured full names improve a shortened displayName and Unicode names remain matchable',()=>{
 const data=fixture();data.results=[{...data.results[0],student:{firstName:'Anna',lastName:'Müller',displayName:'Anna'}}];
 assert.equal(feature.match(data,[...students,{id:'anna2',firstName:'Anna',lastName:'Anders'}])[0].studentId,'a');
 data.results[0].student={displayName:'Олена Коваль'};
 assert.equal(feature.match(data,[{id:'unicode',firstName:'Олена',lastName:'Коваль'}])[0].studentId,'unicode');
});
test('session lock clears the preview and prevents an in-flight file read restoring sensitive draft data',async()=>{
 const state=snapshot();let resolveRead,rendered=0;
 ctx.document={querySelector:()=>null};
 const controller=feature.createController({snapshot:()=>state,activeClass:()=>state.classes[0],students:()=>students,render:()=>rendered++,commit:()=>{throw Error('must not write');}});
 const pending=controller.readFile({target:{files:[{name:'exam.json',size:1000,text:()=>new Promise(resolve=>resolveRead=resolve)}],value:''}});
 controller.clear();resolveRead(JSON.stringify(fixture()));await pending;
 assert.doesNotMatch(controller.render(),/assessmentImportModal|Anna Mueller/);assert.equal(rendered,0);
});
test('failed persistence is reported as unsaved without retrying the same import into memory',async()=>{
 let state=snapshot(),committed=0;ctx.document={querySelector:()=>null};
 const controller=feature.createController({snapshot:()=>state,activeClass:()=>state.classes[0],students:()=>students,render:()=>{},commit:result=>{committed++;state=result.snapshot;return false;}});
 await controller.readFile({target:{files:[{name:'exam.json',size:1000,text:async()=>JSON.stringify(fixture())}],value:''}});
 await controller.confirm();assert.equal(committed,1);assert.match(controller.render(),/Speichern ist noch nicht erfolgreich/);
 await controller.confirm();assert.equal(committed,1);assert.equal(state.performedEvaluations.length,2);
});

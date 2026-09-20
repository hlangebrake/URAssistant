// Isolated local preview with synthetic data. Not loaded by the production app.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const day = '2026-09-21';
const fixture = {
  activeClassId: 'preview-bio', activeDateTime: day + 'T08:00', activeDateTimeMode: 'manual', schoolYearStart: '2026-08-17', schoolYearEnd: '2027-07-15',
  classes: [{id:'preview-bio', name:'8a', subject:'Biologie', room:'B104', studentIds:['preview-1','preview-2','preview-3'], displayColor:'#b4dcd3'}, {id:'preview-chem', name:'9b', subject:'Chemie', room:'C201', studentIds:['preview-4'], displayColor:'#c8d5ed'}, {id:'preview-q2', name:'Q2', subject:'Biologie', room:'B104',studentIds:[],displayColor:'#e0c8e8'}],
  students: [{id:'preview-1',firstName:'Alex',lastName:'Beispiel'},{id:'preview-2',firstName:'Kim',lastName:'Muster'},{id:'preview-3',firstName:'Sam',lastName:'Test'},{id:'preview-4',firstName:'Robin',lastName:'Demo'}],
  timetables: [{id:'preview-timetable',validFrom:'2026-08-17',validTo:'2027-07-15',startTime:'07:50',rows:[
    {id:'row1',type:'lesson',durationMinutes:45,days:{'1':{classId:'preview-bio',room:'B104'},'3':{classId:'preview-bio',room:'B104'}}},
    {id:'pause1',type:'pause',durationMinutes:15,days:{}},
    {id:'row2',type:'lesson',durationMinutes:90,days:{'1':{classId:'preview-chem',room:'C201',isDouble:false},'4':{classId:'preview-chem',room:'C201',isDouble:false}}},
    {id:'pause2',type:'pause',durationMinutes:20,days:{}},
    {id:'row3',type:'lesson',durationMinutes:45,days:{'1':{classId:'preview-q2',room:'B104'},'5':{classId:'preview-q2',room:'B104'}}}
  ]}],
  curriculumSeries:[{id:'series-bio',classId:'preview-bio',topic:'Zellen und ihre Funktionen',hourDemand:12,startMode:'manual',startDate:day,color:'#b4dcd3'},{id:'series-chem',classId:'preview-chem',topic:'Chemische Reaktionen',hourDemand:12,startMode:'manual',startDate:day,color:'#c8d5ed'}],
  curriculumSequences:[{id:'seq-bio',seriesId:'series-bio',topic:'Aufbau der Zelle',hourDemand:6},{id:'seq-chem',seriesId:'series-chem',topic:'Energie bei Reaktionen',hourDemand:6}],
  curriculumLessonPlans:[{id:'plan-bio',sequenceId:'seq-bio',topic:'Pflanzliche und tierische Zellen vergleichen',summary:'Gemeinsamkeiten und Unterschiede am Modell erschließen.',hourType:'single',preparationMode:'todo',preparationTodoId:'todo-prep',homeworkText:'Zellmodell beschriften'},{id:'plan-chem',sequenceId:'seq-chem',topic:'Energieumsatz bei chemischen Reaktionen',hourType:'double'}],
  curriculumLessonPhases:[{id:'phase-bio1',lessonPlanId:'plan-bio',title:'Einstieg',durationMinutes:5,nextPhaseId:'phase-bio2'},{id:'phase-bio2',lessonPlanId:'plan-bio',title:'Erarbeitung',durationMinutes:25,nextPhaseId:'phase-bio3'},{id:'phase-bio3',lessonPlanId:'plan-bio',title:'Sicherung',durationMinutes:15}],
  curriculumLessonSteps:[{id:'step-bio1',phaseId:'phase-bio1',title:'Bildimpuls',content:'Zwei Zellbilder vergleichen',durationMinutes:5,socialForm:'plenum',material:'Mikroskopische Aufnahmen'},{id:'step-bio2',phaseId:'phase-bio2',title:'Zellbestandteile zuordnen',content:'Gemeinsamkeiten markieren',durationMinutes:25,socialForm:'partner',material:'Arbeitsblatt Zellvergleich'}],
  todos:[{id:'todo-prep',title:'Vorbereitung: Pflanzliche und tierische Zellen vergleichen',relatedClassId:'preview-bio',category:'8a Biologie',dueDate:day,priority:'standard',taskStatus:'planned'},{id:'todo-2',title:'Versuchsmaterial für Donnerstag prüfen',relatedClassId:'preview-chem',category:'9b Chemie',dueDate:day,priority:'hoch'},{id:'todo-3',title:'Rückmeldung zum Projekttag',category:'Organisation',taskStatus:'waiting',waitingForPersonId:'person-1',waitingSince:'2026-09-17T10:00:00Z',dueDate:'2026-09-22'},{id:'todo-4',title:'Elterngespräch vorbereiten',relatedClassId:'preview-bio',category:'8a Biologie',dueDate:'2026-09-18',priority:'hoch'}],
  taskPeople:[{id:'person-1',name:'Fachschaft'}],
  planningCategories:[{id:'cat-org',name:'Organisation',color:'#dbcbb8'}],
  planningEvents:[{id:'event-1',title:'Fachschaftsbesprechung',startDate:day,endDate:day,startTime:'14:00',endTime:'15:00',category:'Organisation',showInTimetable:true}],
  knowledgeGapRecords:[{id:'gap-1',studentId:'preview-1',classId:'preview-bio',lessonDate:'2026-09-18',content:'Zellbestandteile fachsprachlich erklären',status:'offen',recordedAt:'2026-09-18T09:00:00Z'}],
  lessonResources:[], learningActions:[], lessonReflections:[]
};
const preview = '<!doctype html><html lang="de"><meta charset="utf-8"><title>Lokale Vorschau</title><body><p>Synthetische Vorschau wird vorbereitet …</p>'
  + ['src/data/indexedDb.js','src/data/appRepository.js','src/security/passwordAuth.js','src/security/appDataCrypto.js'].map(file=>'<script src="/'+file+'"></script>').join('')
  + '<script>(async()=>{const ns=window.Unterrichtsassistent,repo=new ns.data.AppRepository();let auth=await repo.loadPasswordAuthRecord();if(!auth){auth=await ns.security.passwordAuth.createPasswordAuthRecord("Workspace-preview-2026");const key=await ns.security.passwordAuth.unlockPasswordAuthRecord("Workspace-preview-2026",auth);await repo.savePasswordAuthRecord(auth);await repo.saveSnapshot(await ns.security.appDataCrypto.encryptSnapshot('+JSON.stringify(fixture)+',key));}const key=await ns.security.passwordAuth.unlockPasswordAuthRecord("Workspace-preview-2026",auth);ns.security.passwordAuth.createUnlockSession(key);location.replace("/index.html");})().catch(error=>document.body.textContent=error.message);</script></body></html>';
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/__preview'){res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(preview);return;}
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)||file.includes(path.sep+'.git'+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Cache-Control','no-cache');res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
server.listen(Number(process.env.PREVIEW_PORT)||0,'127.0.0.1',()=>console.log('Synthetic preview: http://127.0.0.1:'+server.address().port+'/__preview'));

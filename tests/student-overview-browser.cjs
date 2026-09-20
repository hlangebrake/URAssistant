// Uses only synthetic data in an isolated browser context and a temporary local server.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const output = process.env.STUDENT_QA_DIR || path.join(require('node:os').tmpdir(), 'student-overview-qa');
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (error, data) => {
    if (error) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({'.js':'text/javascript','.css':'text/css','.html':'text/html'})[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel:'chrome',headless:true });
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1100},timezoneId:'Europe/Berlin'});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/auth.html');
    await page.evaluate(async () => {
      const ns = window.Unterrichtsassistent;
      const auth = await ns.security.passwordAuth.createPasswordAuthRecord('Schueler-Test-2026');
      const key = await ns.security.passwordAuth.unlockPasswordAuthRecord('Schueler-Test-2026', auth);
      const repo = new ns.data.AppRepository();
      await repo.savePasswordAuthRecord(auth);
      const assessments = Array.from({length:42}, (_,i) => {
        const date = new Date(Date.UTC(2026,7,1+i)).toISOString().slice(0,10);
        return {id:'a'+i,studentId:'s1',classId:'c1',type:'unterricht',lessonDate:date,recordedAt:date+'T10:00',afb1:i<16?0:1,afb2:i<24?1:2,afb3:'',note:'Beitrag '+(i+1)+': nachvollziehbare Begründung'};
      });
      assessments.push({id:'unrated',studentId:'s1',classId:'c1',type:'unterricht',recordedAt:'2026-09-18T12:00',note:'Nur eine Notiz, ohne Leistungswert',afb1:'',afb2:'',afb3:''});
      await repo.saveSnapshot({activeClassId:'c1',activeDateTime:'2026-09-20T12:00',activeDateTimeMode:'manual',
        students:[{id:'s1',firstName:'Anna',lastName:'Beispiel'},{id:'s2',firstName:'Ben',lastName:'Beispiel'},{id:'s3',firstName:'Clara',lastName:'Andere Klasse'}],
        classes:[{id:'c1',name:'7a',subject:'Mathematik',studentIds:['s1','s2']},{id:'c2',name:'Q1',subject:'Chemie',gradingScheme:'points',studentIds:['s3']}],
        assessments,
        mathObservationRecords:[{id:'m1',classId:'c1',studentId:'s1',lessonDate:'2026-09-14',mathObservationQualityScale:'0-4',competencyQualities:[{competencyId:'k1',quality:3}],processQuality:3}],
        evidenceTools:[{id:'tool',titel:'Argumentation',aspekte:[{id:'aspect',titel:'Begründen',aspektDimensionen:[{id:'dimension',bezeichnung:'Qualität',stufen:[{id:'st1',bezeichnung:'Ansatz'},{id:'st2',bezeichnung:'Sicher'},{id:'st3',bezeichnung:'Reflektiert'}]}]}]}],
        evidenceObservations:[{id:'e1',classId:'c1',studentId:'s1',lessonDate:'2026-09-16',toolId:'tool',selections:[{aspectId:'aspect',stages:[{dimensionId:'dimension',stageId:'st3'}]}]}],
        evaluationSheets:[{id:'sheet',classId:'c1',type:'aufgabenbogen',title:'Lernkontrolle Brüche',taskSheet:{tasks:[{id:'task',subtasks:[{id:'subtask',be:20}]}]}}],
        plannedEvaluations:[{id:'planned',classId:'c1',evaluationSheetId:'sheet',date:'2026-09-12',gradingSystem:[]}],
        performedEvaluations:[{id:'performed',classId:'c1',studentId:'s1',evaluationSheetId:'sheet',plannedEvaluationId:'planned',isCompleted:true,completedAt:'2026-09-12T12:00',subtaskResults:[{subtaskId:'subtask',points:16}]}],
        attendanceRecords:[{id:'absent',classId:'c1',studentId:'s1',lessonDate:'2026-09-15',status:'absent'}]
      });
      ns.security.passwordAuth.createUnlockSession(key);
    });
    await page.goto(base + '/index.html');
    await page.waitForFunction(() => typeof schoolService !== 'undefined' && schoolService !== null);
    await page.locator('[data-view-target="klasse"]').click();
    await page.getByRole('tab',{name:'Schueler',exact:true}).click();
    await page.locator('#studentOverview').waitFor();
    assert.equal(await page.locator('[data-so-average]').textContent(),'3,0');
    const originalAverage = await page.locator('[data-so-average]').textContent();
    assert.equal(await page.locator('#studentFullTimeline').getAttribute('open'),null);
    await page.locator('.so-timeline-row[data-so-record="unrated"] .so-link').first().click();
    assert.match(await page.locator('#classAnalysisDetailModal').innerText(),/Nur eine Notiz, ohne Leistungswert/);
    await page.locator('#classAnalysisDetailModal .import-modal__close').click();
    await page.getByRole('button',{name:'+ Zwischennote',exact:true}).click();
    assert.deepEqual(await page.locator('#studentJournalForm select[name="grade"] option').allTextContents(),['Bitte auswählen','1','2','3','4','5','6']);
    await page.locator('#studentJournalForm [name="grade"]').selectOption('2');
    await page.locator('#studentJournalForm [name="note"]').fill('Sichere Beiträge; Transfer noch mit Hilfen. Äöü & <Test>');
    await page.getByRole('button',{name:'Zwischennote speichern',exact:true}).click();
    assert.equal(await page.locator('[data-so-average]').textContent(),originalAverage);
    await page.getByRole('button',{name:'+ Kommentar',exact:true}).click();
    await page.locator('#studentJournalForm [name="note"]').fill('Gespräch: möchte häufiger erklären.');
    // An unfinished comment must remain assigned to Anna while switching to Ben and back.
    await page.locator('.student-analysis-selector__item').filter({hasText:'Ben'}).click();
    assert.equal(await page.locator('#studentJournalForm').count(),0);
    assert.equal(await page.locator('[data-so-average]').textContent(),'–');
    await page.locator('.student-analysis-selector__item').filter({hasText:'Anna'}).click();
    assert.equal(await page.locator('#studentJournalForm [name="note"]').inputValue(),'Gespräch: möchte häufiger erklären.');
    await page.getByRole('button',{name:'Kommentar speichern',exact:true}).click();
    assert.equal(await page.locator('[data-so-average]').textContent(),originalAverage);
    await page.getByRole('button',{name:/Gesamte Timeline öffnen/}).click();
    assert.equal(await page.locator('#studentFullTimeline .so-timeline-row').count(),30);
    await page.getByRole('button',{name:/Alle \d+ anzeigen/}).click();
    assert.equal(await page.locator('#studentFullTimeline .so-timeline-row').count(),49);
    await page.locator('#studentFullTimeline select').selectOption('evaluation');
    assert.equal(await page.locator('#studentFullTimeline .so-timeline-row').count(),1);
    assert.match(await page.locator('#studentFullTimeline').innerText(),/3,2\/4/);
    await page.locator('#studentFullTimeline .so-link').click();
    await page.locator('#classAnalysisDetailModal.is-open').waitFor();
    await page.locator('#classAnalysisDetailModal .import-modal__close').click();
    await page.locator('#studentFullTimeline select').selectOption('comment');
    await page.locator('#studentFullTimeline .so-link').click();
    await page.locator('#studentJournalForm [name="note"]').fill('Gespräch: möchte häufiger erklären. Vereinbarung getroffen.');
    await page.getByRole('button',{name:'Änderungen speichern',exact:true}).click();
    assert.equal(await page.evaluate(() => rawState.studentJournalEntries.length),2);
    // Change the per-class scale through the actual management UI.
    await page.getByRole('tab',{name:'Verwalten',exact:true}).click();
    await page.getByRole('button',{name:'Basisdaten',exact:true}).click();
    await page.locator('#classGradingScheme').selectOption('points');
    await page.getByRole('tab',{name:'Schueler',exact:true}).click();
    await page.getByRole('button',{name:'+ Zwischennote',exact:true}).click();
    assert.equal(await page.locator('#studentJournalForm select[name="grade"] option').count(),17);
    await page.locator('#studentJournalForm [name="grade"]').selectOption('0');
    await page.locator('#studentJournalForm [name="note"]').fill('Test eines echten Nullwerts');
    await page.getByRole('button',{name:'Zwischennote speichern',exact:true}).click();
    assert.equal(await page.locator('[data-so-average]').textContent(),originalAverage);
    let entries = await page.evaluate(() => rawState.studentJournalEntries);
    assert.equal(entries[0].gradingScheme,'grades'); assert.equal(entries[0].grade,2);
    assert.equal(entries[2].gradingScheme,'points'); assert.equal(entries[2].grade,0);
    // Historical grades retain the original editor scale.
    await page.evaluate(id => window.UnterrichtsassistentApp.studentOverview.edit(id),entries[0].id);
    assert.equal(await page.locator('#studentJournalForm select[name="grade"] option').count(),7);
    await page.locator('#studentJournalForm [name="grade"]').selectOption('3');
    await page.getByRole('button',{name:'Änderungen speichern',exact:true}).click();
    await page.locator('.so-chart-point').last().press('Enter');
    assert.equal(await page.locator('#studentOverviewPeriod').inputValue(),'custom');
    await page.locator('#studentOverviewPeriod').selectOption('all');
    await page.locator('#studentFullTimeline select').selectOption('all');
    await page.locator('#studentFullTimeline > summary').click();
    const scrollTop = () => page.evaluate(() => document.querySelectorAll('*').forEach(element => { if(element.scrollTop) element.scrollTop=0; }));
    await scrollTop();
    await page.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
    for (const [name,width,height] of [['tablet',820,1180],['phone',390,844]]) {
      await page.setViewportSize({width,height}); await scrollTop();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false);
      await page.screenshot({path:path.join(output,name+'.png'),fullPage:true});
    }
    await page.waitForFunction(() => !persistenceIsSaving && !persistenceHasPendingChanges);
    const persisted = await page.evaluate(async () => {
      const ns=window.Unterrichtsassistent;
      return ns.security.appDataCrypto.decryptSnapshot(await new ns.data.AppRepository().loadSnapshot(), getUnlockedMasterKey());
    });
    assert.equal(persisted.studentJournalEntries.length,3);
    assert.equal(persisted.classes.find(item=>item.id==='c1').gradingScheme,'points');
    assert.equal(persisted.studentJournalEntries[2].grade,0);
    // Reopen against the encrypted database in a second authenticated instance.
    const restored = await context.newPage();
    restored.on('pageerror', error=>errors.push(error.message));
    await restored.goto(base+'/auth.html');
    await restored.evaluate(async()=>{
      const ns=window.Unterrichtsassistent;
      const auth=await new ns.data.AppRepository().loadPasswordAuthRecord();
      ns.security.passwordAuth.createUnlockSession(await ns.security.passwordAuth.unlockPasswordAuthRecord('Schueler-Test-2026',auth));
    });
    await restored.goto(base+'/index.html');
    await restored.waitForFunction(()=>typeof schoolService!=='undefined' && schoolService!==null);
    await restored.evaluate(()=>{rawState.activeClassId='c1';syncSchoolServiceWithRawState();setActiveView('klasse');window.UnterrichtsassistentApp.setClassViewMode('schueler');});
    assert.equal(await restored.locator('[data-so-average]').textContent(),originalAverage);
    assert.match(await restored.locator('.so-overview-cards').innerText(),/0 Punkte/);
    await restored.evaluate(()=>{rawState.activeClassId='c2';syncSchoolServiceWithRawState();setActiveView('klasse');});
    assert.match(await restored.locator('#studentOverview').innerText(),/Clara Andere Klasse/);
    assert.equal(await restored.locator('[data-so-average]').textContent(),'–');
    assert.doesNotMatch(await restored.locator('#studentOverview').innerText(),/Vereinbarung getroffen/);
    assert.deepEqual(errors,[]);
    console.log('Student overview browser checks passed: complete timeline, chart navigation, grades, comments, schema changes, drafts, persistence, isolation and layouts.');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});

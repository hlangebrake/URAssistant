// Real, isolated browser test with synthetic pupils; existing user storage is never opened.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const root = path.resolve(__dirname,'..');
const output = fs.mkdtempSync(path.join(os.tmpdir(),'assessment-import-qa-'));
const server = http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)||file.includes(path.sep+'.git'+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.md':'text/plain'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const chrome=process.env.CHROME_PATH || path.join(process.env.ProgramFiles || 'C:\\Program Files','Google','Chrome','Application','chrome.exe');
 const browser=await chromium.launch(fs.existsSync(chrome)?{executablePath:chrome,headless:true}:{channel:'chrome',headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1280,height:1000},timezoneId:'Europe/Berlin',acceptDownloads:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/auth.html');
  await page.evaluate(async()=>{
   const ns=window.Unterrichtsassistent,repo=new ns.data.AppRepository();
   const auth=await ns.security.passwordAuth.createPasswordAuthRecord('Assessment-Preview-2026');
   const key=await ns.security.passwordAuth.unlockPasswordAuthRecord('Assessment-Preview-2026',auth);
   await repo.savePasswordAuthRecord(auth);
   const state={activeClassId:'class',activeDateTime:'2026-10-26T12:00',activeDateTimeMode:'manual',schoolYearStart:'2026-08-01',schoolYearEnd:'2027-07-31',classes:[{id:'class',name:'11a',subject:'Chemie',studentIds:['anna','ben1','ben2','clara','david']}],students:[{id:'anna',firstName:'Anna',lastName:'Müller'},{id:'ben1',firstName:'Ben',lastName:'Beispiel'},{id:'ben2',firstName:'Ben',lastName:'Anders'},{id:'clara',firstName:'Clara',lastName:'Kurz'},{id:'david',firstName:'David',lastName:'Fehlt'}]};
   await repo.saveSnapshot(await ns.security.appDataCrypto.encryptSnapshot(state,key));
   ns.security.passwordAuth.createUnlockSession(key);
  });
  await page.goto(base+'/index.html');await page.waitForFunction(()=>typeof schoolService!=='undefined'&&schoolService!==null);
  await page.locator('[data-view-target="bewertung"]').click();
  await page.getByRole('button',{name:'Gesamte Bewertung importieren',exact:true}).waitFor();
  const payload=JSON.parse(fs.readFileSync(path.join(root,'docs/bewertungsimport-v1.example.json'),'utf8'));
  payload.assessment.documents=[{id:'original',fileName:'Aufgaben.png',mimeType:'image/png',role:'question-paper',dataBase64:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aS1sAAAAASUVORK5CYII='}];
  payload.results[0].subtaskResults[0].answer='<img src=x onerror="alert(1)">';
  const upload=()=>page.locator('#assessmentImportFile').setInputFiles({name:'korrektur.ur-assessment.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
  await upload();
  const modal=page.locator('#assessmentImportModal');await modal.waitFor();
  assert.equal(await modal.getByLabel('Zuordnung für Anna Mueller').inputValue(),'anna');
  assert.equal(await modal.getByLabel('Zuordnung für Ben',{exact:true}).inputValue(),'');
  assert.equal(await modal.getByRole('button',{name:'Bewertung vollständig anlegen'}).isDisabled(),true);
  assert.match(await modal.innerText(),/2 mitgeschriebene Ergebnisse bei 5 Schülern/);
  await modal.getByLabel('Zuordnung für Ben',{exact:true}).selectOption('ben1');
  assert.equal(await modal.getByRole('button',{name:'Bewertung vollständig anlegen'}).isEnabled(),true);
  await page.screenshot({path:path.join(output,'preview-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:path.join(output,'preview-phone.png'),fullPage:true});
  await page.setViewportSize({width:1280,height:1000});
  await modal.getByRole('button',{name:'Bewertung vollständig anlegen'}).click();
  await modal.waitFor({state:'detached'});
  await page.waitForFunction(()=>!persistenceIsSaving&&!persistenceHasPendingChanges);
  const current=await page.evaluate(()=>serializeSnapshot(schoolService.snapshot));
  assert.equal(current.evaluationSheets.length,1);assert.equal(current.plannedEvaluations.length,1);assert.equal(current.performedEvaluations.length,2);
  assert.deepEqual(current.plannedEvaluations[0].studentIds,['anna','ben1']);
  assert.equal(current.evaluationSheets[0].taskSheet.tasks[0].subtasks[1].be,2.5);
  assert.equal(current.performedEvaluations[0].gradeLabel,'2');
  const pdfHtml=await page.evaluate(()=>{
    const state=schoolService.snapshot;
    return buildPerformedEvaluationPdfDocument(state.plannedEvaluations[0],state.evaluationSheets[0],state.performedEvaluations[0],state.students.find(s=>s.id==='anna'));
  });
  assert.ok(pdfHtml.includes("<strong>Teilnote:</strong> 1"));
  assert.ok(pdfHtml.includes("Note <strong>2</strong>"));
  const details=page.locator('.assessment-import__details').last();await details.locator('summary').click();
  assert.match(await details.innerText(),/Importierte Gesamtnote\s+2/);assert.match(await details.innerText(),/Importierte Teilnote/);assert.match(await details.innerText(),/Proton: positiv/);
  assert.equal(await details.locator('img').count(),0);
  const downloadPromise=page.waitForEvent('download');await details.getByRole('button',{name:'Aufgaben.png',exact:true}).click();
  const download=await downloadPromise;assert.equal(download.suggestedFilename(),'Aufgaben.png');await download.saveAs(path.join(output,'Aufgaben.png'));
  assert.equal(fs.readFileSync(path.join(output,'Aufgaben.png')).toString('base64'),payload.assessment.documents[0].dataBase64);
  await page.screenshot({path:path.join(output,'imported-desktop.png'),fullPage:true});
  // Reload uses the app's normal password barrier; renew the one-use unlock session.
  await page.goto(base+'/auth.html');
  await page.evaluate(async()=>{
    const ns=window.Unterrichtsassistent,auth=await new ns.data.AppRepository().loadPasswordAuthRecord();
    ns.security.passwordAuth.createUnlockSession(await ns.security.passwordAuth.unlockPasswordAuthRecord('Assessment-Preview-2026',auth));
  });
  await page.goto(base+'/index.html');await page.waitForFunction(()=>typeof schoolService!=='undefined'&&schoolService!==null);
  const restored=await page.evaluate(()=>serializeSnapshot(schoolService.snapshot));
  assert.equal(restored.performedEvaluations.length,2);assert.equal(restored.performedEvaluations[0].subtaskResults[0].criterionResults[0].points,1);
  assert.equal(restored.evaluationSheets[0].documents[0].dataBase64,payload.assessment.documents[0].dataBase64);
  await page.locator('[data-view-target="bewertung"]').click();await upload();
  await page.locator('#assessmentImportModal').getByLabel('Zuordnung für Ben',{exact:true}).selectOption('ben1');
  await page.getByRole('button',{name:'Bewertung vollständig anlegen'}).click();
  assert.match(await page.locator('#assessmentImportModal [role="alert"]').innerText(),/bereits importiert/);
  assert.equal(await page.evaluate(()=>schoolService.snapshot.plannedEvaluations.length),1);
  await page.getByRole('button',{name:'Import schließen'}).click();
  // Bad input never creates a partial assessment.
  payload.assessment.id='invalid-assessment';payload.results[0].subtaskResults[0].points=999;
  await upload();await page.locator('.assessment-import__toolbar [role="alert"]').waitFor();
  assert.equal(await page.evaluate(()=>schoolService.snapshot.plannedEvaluations.length),1);
  for(const name of ['Exportspezifikation','JSON-Schema','Beispiel']){
   const href=await page.getByRole('link',{name,exact:true}).getAttribute('href');const response=await page.request.get(base+'/'+href);assert.equal(response.ok(),true,name);
  }
  assert.deepEqual(errors,[]);
  console.log('Assessment import browser checks passed. Screenshots: '+output);
 } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});

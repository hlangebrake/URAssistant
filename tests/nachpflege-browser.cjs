// A fresh, isolated browser profile with synthetic school data; never uses existing app storage.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const output = process.env.NACHPFLEGE_QA_DIR || path.join(require('node:os').tmpdir(), 'nachpflege-qa');
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' })[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, timezoneId: 'Europe/Berlin' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/auth.html');
    await page.evaluate(async () => {
      const ns = window.Unterrichtsassistent;
      const auth = await ns.security.passwordAuth.createPasswordAuthRecord('Nachpflege-Test-2026');
      const key = await ns.security.passwordAuth.unlockPasswordAuthRecord('Nachpflege-Test-2026', auth);
      const repo = new ns.data.AppRepository();
      await repo.savePasswordAuthRecord(auth);
      await repo.saveSnapshot({ activeClassId: 'c1', activeDateTime: '2026-09-20T12:00', activeDateTimeMode: 'manual',
        classes: [{ id: 'c1', name: '7a · Mathematik', studentIds: ['a', 'b', 'c'], subject: 'Mathematik' }, { id: 'c2', name: '8b', studentIds: ['d'] }],
        students: [{ id: 'a', firstName: 'Anna', lastName: 'Alt' }, { id: 'b', firstName: 'Ben', lastName: 'Beispiel' }, { id: 'c', firstName: 'Clara', lastName: 'Kurz' }, { id: 'd', firstName: 'David', lastName: 'Andere Klasse' }],
        assessments: [{ id: 'legacy', classId: 'c1', studentId: 'a', type: 'unterricht', afb1: 1, afb2: '', afb3: '', recordedAt: '2026-09-19T10:00:00' }],
        mathObservationRecords: [{ id: 'math-old', classId: 'c1', studentId: 'c', lessonDate: '2026-09-10', primaryCompetency: 'k2', processQuality: 2 }],
        evidenceTools: [{ id: 'custom', titel: 'Argumentation & Reflexion', aspekte: [{ id: 'aspect', titel: 'Argumentieren', aspektDimensionen: [{ id: 'dimension', bezeichnung: 'Begründung', stufen: [{ id: 'stage1', bezeichnung: 'Nachvollziehbar' }, { id: 'stage2', bezeichnung: 'Differenziert' }] }] }] }]
      });
      ns.security.passwordAuth.createUnlockSession(key);
    });
    await page.goto(base + '/index.html');
    await page.waitForFunction(() => typeof schoolService !== 'undefined' && schoolService !== null);
    await page.locator('[data-view-target="unterricht"]').click();
    await page.getByRole('tab', { name: 'Nachpflege', exact: true }).click();
    const order = () => page.locator('[data-np-student]').evaluateAll(nodes => nodes.map(node => node.dataset.npStudent));
    assert.deepEqual(await order(), ['b', 'c', 'a']);
    assert.equal(await page.locator('.nachpflege-section[open]').count(), 0);
    await page.screenshot({ path: path.join(output, 'overview.png'), fullPage: true });
    await page.locator('[data-np-overall="0"]').click();
    await page.locator('[data-np-group="overall"][data-np-field="note"]').fill('Ruhig und konzentriert. Äöü & <Test>');
    assert.deepEqual(await order(), ['c', 'a', 'b']);
    await page.locator('[data-np-student="a"]').click();
    await page.locator('[data-np-overall="2"]').click();
    assert.deepEqual(await order(), ['c', 'b', 'a']);
    await page.locator('[data-np-student="b"]').click();
    assert.equal(await page.locator('[data-np-overall="0"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('[data-np-group="overall"][data-np-field="note"]').inputValue(), 'Ruhig und konzentriert. Äöü & <Test>');
    await page.locator('[data-np-section="detail"] summary').click();
    assert.equal(await page.locator('[data-np-group="detail"][data-np-field="situationType"]').inputValue(), '');
    assert.equal(await page.locator('[data-np-group="detail"][data-np-field="demandLevel"]').inputValue(), '');
    const svg = await page.locator('#nachpflegeGraph').boundingBox();
    await page.mouse.move(svg.x + svg.width * 72 / 360, svg.y + svg.height * 150 / 236);
    await page.mouse.down();
    await page.mouse.move(svg.x + svg.width * 192 / 360, svg.y + svg.height * 108 / 236, { steps: 5 });
    await page.mouse.up();
    assert.equal(await page.locator('[data-np-field="afb2"]').inputValue(), '0');
    await page.locator('[data-np-field="knowledgeGap"]').fill('Brüche kürzen');
    await page.locator('[data-np-group="detail"][data-np-field="note"]').fill('Mit Beispielen festigen');
    await page.locator('[data-np-section="tools"] summary').click();
    await page.locator('[data-np-field="competency:k1"]').selectOption('0');
    await page.locator('#nachpflegeTool').selectOption('custom');
    await page.locator('[data-np-field="stage:aspect:dimension"]').selectOption('stage2');
    await page.locator('[data-np-group="tool:custom"][data-np-field="note"]').fill('Gut begründet');
    await page.locator('[data-np-student="c"]').click();
    assert.equal(await page.locator('[data-np-field="stage:aspect:dimension"]').inputValue(), '');
    await page.locator('[data-np-student="b"]').click();
    assert.equal(await page.locator('[data-np-field="stage:aspect:dimension"]').inputValue(), 'stage2');
    await page.evaluate(() => document.querySelectorAll('*').forEach(element => { if (element.scrollTop) element.scrollTop = 0; }));
    await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.screenshot({ path: path.join(output, 'tablet.png'), fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await page.screenshot({ path: path.join(output, 'phone.png'), fullPage: true });
    await page.waitForFunction(() => !persistenceIsSaving && !persistenceHasPendingChanges);
    const saved = await page.evaluate(async () => {
      const ns = window.Unterrichtsassistent;
      return ns.security.appDataCrypto.decryptSnapshot(await new ns.data.AppRepository().loadSnapshot(), getUnlockedMasterKey());
    });
    assert.equal(saved.assessments.filter(item => item.studentId === 'b').length, 2);
    assert.equal(saved.knowledgeGapRecords.length, 1);
    assert.equal(saved.evidenceObservations[0].selections[0].stages[0].stageId, 'stage2');
    assert.equal(saved.mathObservationRecords.find(item => item.studentId === 'b').competencyQualities[0].quality, 0);
    // Change the active class and confirm there is no leakage from the previous editor.
    await page.evaluate(() => { rawState.activeClassId = 'c2'; syncSchoolServiceWithRawState(); setActiveView('unterricht'); });
    assert.deepEqual(await order(), ['d']);
    assert.equal(await page.locator('[data-np-overall][aria-pressed="true"]').count(), 0);
    await page.locator('[data-np-overall="-1"]').click();
    await page.waitForFunction(() => !persistenceIsSaving && !persistenceHasPendingChanges);
    assert.equal(await page.evaluate(() => rawState.assessments.filter(item => item.classId === 'c2').length), 1);
    // Open another authenticated app instance against the saved encrypted database.
    const restoredPage = await context.newPage();
    restoredPage.on('pageerror', error => errors.push(error.message));
    await restoredPage.goto(base + '/auth.html');
    await restoredPage.evaluate(async () => {
      const ns = window.Unterrichtsassistent;
      const auth = await new ns.data.AppRepository().loadPasswordAuthRecord();
      const key = await ns.security.passwordAuth.unlockPasswordAuthRecord('Nachpflege-Test-2026', auth);
      ns.security.passwordAuth.createUnlockSession(key);
    });
    await restoredPage.goto(base + '/index.html');
    await restoredPage.waitForFunction(() => typeof schoolService !== 'undefined' && schoolService !== null);
    await restoredPage.evaluate(() => { rawState.activeClassId = 'c1'; syncSchoolServiceWithRawState(); setActiveView('unterricht'); window.UnterrichtsassistentApp.setUnterrichtViewMode('nachpflege'); });
    await restoredPage.locator('[data-np-student="b"]').click();
    assert.equal(await restoredPage.locator('[data-np-overall="0"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await restoredPage.locator('[data-np-group="overall"][data-np-field="note"]').inputValue(), 'Ruhig und konzentriert. Äöü & <Test>');
    await restoredPage.locator('[data-np-section="tools"] summary').click();
    assert.equal(await restoredPage.locator('[data-np-field="competency:k1"]').inputValue(), '0');
    await restoredPage.locator('#nachpflegeTool').selectOption('custom');
    assert.equal(await restoredPage.locator('[data-np-field="stage:aspect:dimension"]').inputValue(), 'stage2');
    await restoredPage.evaluate(() => { rawState.activeClassId = 'c2'; syncSchoolServiceWithRawState(); setActiveView('unterricht'); });
    assert.equal(await restoredPage.locator('[data-np-overall="-1"]').getAttribute('aria-pressed'), 'true');
    assert.deepEqual(errors, []);
    console.log('Nachpflege browser checks passed: sorting, immediate edits, graph drag, tools, class isolation, responsive layout, encrypted persistence.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });

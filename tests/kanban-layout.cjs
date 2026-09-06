// Synthetic stress checks in a fresh profile; no existing app storage is touched.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const output = process.env.KANBAN_QA_DIR || path.join(require('node:os').tmpdir(), 'kanban-layout-qa');
const base = process.env.KANBAN_TEST_URL || 'http://127.0.0.1:8765';
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, timezoneId: 'Europe/Berlin' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    await page.goto(base + '/auth.html');
    await page.evaluate(async () => {
      const ns = window.Unterrichtsassistent;
      const password = 'Synthetic-layout-test-only';
      const record = await ns.security.passwordAuth.createPasswordAuthRecord(password);
      const key = await ns.security.passwordAuth.unlockPasswordAuthRecord(password, record);
      const repo = new ns.data.AppRepository();
      const statuses = ['backlog', 'in-progress', 'waiting', 'planned', 'done'];
      const todos = Array.from({ length: 500 }, (_, index) => ({
        id: 'stress-task-' + index,
        title: index === 0 ? 'Medienkonzept mit ausführlicher Dokumentation und langfristigen Rückmeldungen von mehreren Beteiligten' : 'Schulische Aufgabe ' + String(index).padStart(3, '0'),
        description: index === 0 ? 'Ausführliche Beschreibung mit Umlauten Äöü ß, Sonderzeichen & Rückmeldungen.\n'.repeat(80) : 'Aufgabe für die Belastungsprüfung.',
        category: 'Digitalisierung', categoryId: 'digital', taskStatus: statuses[index % 5],
        done: index % 5 === 4, priority: index % 3 === 0 ? 'hoch' : 'standard',
        createdAt: '2026-09-01T07:00:00Z', updatedAt: '2026-09-06T07:00:00Z',
        completedAt: index % 5 === 4 ? '2026-09-06T07:00:00Z' : '',
        dueDate: index % 7 ? '2026-09-' + String(5 + index % 20).padStart(2, '0') : '',
        waitingSince: index % 5 === 2 ? '2026-09-01T07:00:00Z' : '',
        responsiblePersonId: 'mueller', participantPersonIds: [], waitingForPersonId: index % 5 === 2 ? 'mueller' : '',
        history: [], protocol: index === 0 ? Array.from({ length: 150 }, (_, entryIndex) => ({
          id: 'protocol-' + entryIndex, taskId: 'stress-task-0', timestamp: '2026-09-06T07:00:00Z',
          text: 'Protokolleintrag ' + entryIndex + ': ' + 'Rückmeldung zur Schulentwicklung, Absprache mit Frau Müller. '.repeat(6)
        })) : []
      }));
      await repo.savePasswordAuthRecord(record);
      await repo.saveSnapshot({ todos, taskPeople: [{ id: 'mueller', name: 'Frau Müller' }], planningCategories: [{ id: 'digital', name: 'Digitalisierung', color: '#a9cfe2' }], classes: [], students: [] });
      ns.security.passwordAuth.createUnlockSession(key);
    });
    await page.goto(base + '/index.html');
    await page.waitForFunction(() => typeof schoolService !== 'undefined' && schoolService !== null);
    await page.locator('[data-view-target="todos"]').click();
    const renderMs = await page.evaluate(() => {
      const start = performance.now();
      window.UnterrichtsassistentApp.setTodoWorkspaceMode('kanban');
      return performance.now() - start;
    });
    assert.equal(await page.locator('[data-kanban-task-id]').count(), 420);
    assert.ok(renderMs < 5000, '500-task render exceeded 5 seconds: ' + renderMs);
    const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth, board: document.querySelector('[data-kanban-board]').scrollWidth }));
    assert.ok(widths.document <= widths.viewport, JSON.stringify(widths));
    assert.ok(widths.board > widths.viewport);
    const scrolled = await page.locator('[data-kanban-status="backlog"] .kanban-column__body').evaluate(el => { el.scrollTop = el.scrollHeight; return el.scrollTop; });
    assert.ok(scrolled > 0, 'Column with 100 tasks must scroll independently');
    await page.screenshot({ path: path.join(output, '500-tasks.png'), fullPage: true });

    await page.setViewportSize({ width: 820, height: 550 });
    await page.evaluate(() => window.UnterrichtsassistentApp.kanban.openTask('stress-task-0'));
    const bounds = await page.locator('#kanbanTaskModal .kanban-modal__dialog').boundingBox();
    assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= 551, JSON.stringify(bounds));
    const footer = await page.locator('#kanbanTaskModal .kanban-modal__footer').boundingBox();
    assert.ok(footer.y >= 0 && footer.y + footer.height <= 551, 'Modal footer must remain reachable');
    assert.equal(await page.locator('.kanban-timeline__entry--protocol').count(), 150);
    await page.locator('#kanbanProtocolText').scrollIntoViewIfNeeded();
    await page.locator('#kanbanProtocolText').focus();
    await page.screenshot({ path: path.join(output, 'short-viewport-detail.png'), fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.evaluate(() => window.UnterrichtsassistentApp.kanban.closeTask());

    await page.setViewportSize({ width: 1180, height: 820 });
    await page.evaluate(() => {
      document.querySelector('[data-kanban-board]').scrollLeft = 0;
      document.querySelector('[data-kanban-status="backlog"] .kanban-column__body').scrollTop = 0;
    });
    const handle = page.locator('[data-kanban-status="backlog"] [data-kanban-drag]').first();
    await handle.scrollIntoViewIfNeeded();
    const taskId = await handle.evaluate(el => el.closest('[data-kanban-task-id]').dataset.kanbanTaskId);
    const before = await page.evaluate(id => JSON.stringify(schoolService.snapshot.todos.find(task => task.id === id)), taskId);
    const source = await handle.boundingBox();
    const board = await page.locator('[data-kanban-board]').boundingBox();
    const start = { x: source.x + 20, y: source.y + 20 };
    const edge = { x: board.x + board.width - 12, y: start.y };
    const touch = await context.newCDPSession(page);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
    for (let step = 1; step <= 8; step++) {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (edge.x - start.x) * step / 8, y: start.y }] });
    }
    await page.waitForTimeout(350);
    const autoScroll = await page.locator('[data-kanban-board]').evaluate(el => el.scrollLeft);
    assert.ok(autoScroll > 20, 'Dragging near the right edge must auto-scroll; value=' + autoScroll);
    assert.equal(await page.locator('.kanban-drag-ghost').count(), 1);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    assert.equal(await page.locator('.kanban-drag-ghost').count(), 0);
    assert.equal(await page.locator('.is-drop-target').count(), 0);
    assert.equal(await page.evaluate(id => JSON.stringify(schoolService.snapshot.todos.find(task => task.id === id)), taskId), before);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ tasks: 500, renderedCards: 420, renderMs: Math.round(renderMs), columnScrollTop: scrolled, horizontalAutoScroll: autoScroll, shortViewport: '820x550', protocolEntries: 150, screenshots: output }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

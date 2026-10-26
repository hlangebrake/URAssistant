(function () {
  "use strict";
  const feature = window.Unterrichtsassistent.features.evaluation.assessmentImport;
  const esc = value => window.Unterrichtsassistent.shared.html.escapeHtml(String(value == null ? "" : value));
  const api = "window.UnterrichtsassistentApp.assessmentImport";
  const name = student => student.displayName || [student.firstName, student.lastName].filter(Boolean).join(" ") || student.urStudentId || "Ohne Namen";
  const fieldText = (label, value) => value ? '<div class="assessment-import__text"><strong>' + esc(label) + '</strong><p>' + esc(value) + '</p></div>' : '';
  function createController(options) {
    let draft = null, error = "", busy = false, serial = 0, opener = null;
    function refresh() { options.render(); }
    function close() {
      if (busy) return false;
      serial++; draft = null; error = ""; refresh();
      if (opener && document.contains(opener)) opener.focus();
      else { const button = document.getElementById("assessmentImportOpen"); if (button) button.focus(); }
      return false;
    }
    function preview() {
      if (!draft) return "";
      const a = draft.data.assessment, students = options.students(draft.classId);
      const assigned = draft.rows.filter(row => row.studentId).length;
      const open = draft.rows.filter(row => !row.studentId && !row.excluded).length;
      const excluded = students.filter(s => !draft.rows.some(row => row.studentId === s.id));
      const mismatch = students.length !== draft.rows.length;
      return '<div class="assessment-import__overlay" id="assessmentImportModal" onkeydown="return ' + api + '.keyDown(event)"><div class="assessment-import__backdrop" onclick="return ' + api + '.close()"></div><section class="assessment-import__dialog" role="dialog" aria-modal="true" aria-labelledby="assessmentImportTitle" tabindex="-1">'
        + '<header><div><h2 id="assessmentImportTitle">Gesamte Bewertung importieren</h2><p>' + esc(a.title) + ' · ' + esc(a.date) + ' · Ziel: ' + esc(draft.className) + '</p></div><button type="button" aria-label="Import schließen" onclick="return ' + api + '.close()"' + (busy ? ' disabled' : '') + '>×</button></header>'
        + '<div class="assessment-import__body"><p>' + esc(draft.fileName) + ' · ' + esc(draft.data.source.appName) + ' · ' + a.tasks.length + ' Aufgaben · ' + (a.documents || []).length + ' Dokumente</p>'
        + '<p><strong>' + assigned + ' zugeordnet</strong> · ' + open + ' offen · ' + draft.data.results.filter(r => r.status === "absent").length + ' ausdrücklich abwesend</p>'
        + (mismatch ? '<p class="assessment-import__notice">' + draft.rows.length + ' mitgeschriebene Ergebnisse bei ' + students.length + ' Schülern in der Lerngruppe. Nur zugeordnete Personen werden ausgewählt.</p>' : '')
        + ((a.className && feature.normalize(a.className) !== feature.normalize(draft.className)) || (a.subject && feature.normalize(a.subject) !== feature.normalize(draft.subject)) ? '<p class="assessment-import__notice">Export nennt ' + esc([a.className,a.subject].filter(Boolean).join(' · ')) + '. Bitte die oben angegebene Zielgruppe prüfen.</p>' : '')
        + '<p>Ähnliche und unvollständige Namen bitte prüfen. Offene Namen zuordnen oder ausdrücklich auslassen. Eine Person kann nur einmal ausgewählt werden.</p>'
        + '<div class="assessment-import__rows">' + draft.rows.map((row,i) => {
          const result = draft.data.results.find(r => r.id === row.resultId);
          return '<div class="assessment-import__row"><div><strong>' + esc(name(result.student)) + '</strong><small>' + esc(row.reason) + '</small></div><label><span class="assessment-import__label">Schüler zuordnen</span><select data-assessment-row="' + i + '" aria-label="Zuordnung für ' + esc(name(result.student)) + '" onchange="return ' + api + '.assign(' + i + ', this.value)"' + (busy ? ' disabled' : '') + '><option value="">Bitte zuordnen …</option><option value="__skip__"' + (row.excluded ? ' selected' : '') + '>Auslassen – kein Import</option>'
            + students.map(s => '<option value="' + esc(s.id) + '"' + (s.id === row.studentId ? ' selected' : '') + (draft.rows.some(other => other !== row && other.studentId === s.id) ? ' disabled' : '') + '>' + esc(name(s)) + '</option>').join('')
            + '</select></label>' + (!row.studentId && row.candidates.length ? '<small>Vorschläge: ' + row.candidates.slice(0,3).map(c => { const s = students.find(s => s.id === c.studentId); return esc(s ? name(s) : '') + ' (' + Math.round(c.score * 100) + '%)'; }).join(', ') + '</small>' : '') + '</div>';
        }).join('') + '</div>'
        + '<details><summary>Ohne Teilnahme: ' + excluded.length + ' Personen</summary><p>' + esc(excluded.map(name).join(', ') || 'Keine') + '</p><p>Diese Personen erhalten für diese Bewertung keinen Eintrag und keine Nullpunkte.</p></details>'
        + (error ? '<p role="alert" class="assessment-import__error">' + esc(error) + '</p>' : '')
        + '</div><footer><button type="button" onclick="return ' + api + '.close()"' + (busy ? ' disabled' : '') + '>Abbrechen</button><button class="assessment-import__primary" type="button" onclick="return ' + api + '.confirm()"' + (busy || open || !assigned ? ' disabled' : '') + '>' + (busy ? 'Wird übernommen …' : 'Bewertung vollständig anlegen') + '</button></footer></section></div>';
    }
    function render() {
      const cls = options.activeClass();
      return '<section class="panel assessment-import__toolbar" aria-label="Bewertungsimport"><div><strong>Klausurkorrektur übernehmen</strong><p>Aufgabenbogen, Notenschlüssel und Einzelbewertungen aus einer anderen App.</p></div><div class="assessment-import__actions"><button id="assessmentImportOpen" type="button" class="header-utility-button" onclick="return ' + api + '.open()"' + (!cls || busy ? ' disabled' : '') + '>Gesamte Bewertung importieren</button><a href="docs/bewertungsimport-v1.md" download="bewertungsimport-v1.md">Exportspezifikation</a><a href="docs/bewertungsimport-v1.schema.json" download="bewertungsimport-v1.schema.json">JSON-Schema</a><a href="docs/bewertungsimport-v1.example.json" download="bewertungsimport-v1.example.json">Beispiel</a></div><input id="assessmentImportFile" type="file" accept=".json,application/json" hidden onchange="return ' + api + '.readFile(event)">'
        + (!draft && error ? '<p role="alert" class="assessment-import__error">' + esc(error) + '</p>' : '') + '</section>' + preview();
    }
    function openFile() {
      const input = document.getElementById("assessmentImportFile"); if (!input || !options.activeClass()) return false;
      opener = document.activeElement; input.value = ""; input.click(); return false;
    }
    async function readFile(event) {
      const input = event.target, file = input.files && input.files[0], cls = options.activeClass();
      if (!file || !cls || busy) return false;
      const request = ++serial; busy = true; error = "";
      try {
        if (file.size > feature.MAX_BYTES) throw new Error("Die Datei ist größer als 50 MiB.");
        const content = await file.text();
        if (request !== serial) return false;
        const data = feature.parse(content);
        if (request !== serial || !options.activeClass() || options.activeClass().id !== cls.id) throw new Error("Die aktive Lerngruppe wurde geändert. Datei bitte für die gewünschte Lerngruppe erneut auswählen.");
        draft = {data:data,classId:cls.id,className:cls.name,subject:cls.subject || "",fileName:file.name,rows:feature.match(data, options.students(cls.id))};
      } catch (e) { if (request === serial) { draft = null; error = e.message || "Die Datei konnte nicht gelesen werden."; } }
      finally { input.value = ""; if (request === serial) { busy = false; refresh(); const dialog = document.querySelector('#assessmentImportModal [role="dialog"]'); if (dialog) dialog.focus(); } }
      return false;
    }
    function assign(index, studentId) {
      if (!draft || busy || !draft.rows[index]) return false;
      const row = draft.rows[index];
      if (studentId && studentId !== "__skip__" && draft.rows.some(other => other !== row && other.studentId === studentId)) { error = "Diese Person ist bereits zugeordnet."; refresh(); return false; }
      row.studentId = studentId === "__skip__" ? "" : studentId; row.excluded = studentId === "__skip__"; row.reason = row.excluded ? "Wird ausdrücklich ausgelassen" : "Manuell geprüft"; error = ""; refresh();
      const select = document.querySelector('[data-assessment-row="' + index + '"]'); if (select) select.focus();
      return false;
    }
    async function confirm() {
      if (!draft || busy) return false;
      const request = serial;
      try {
        if (!options.activeClass() || options.activeClass().id !== draft.classId) throw new Error("Bitte zur Ziel-Lerngruppe " + draft.className + " zurückwechseln oder den Import neu starten.");
        const result = feature.importInto(options.snapshot(),draft.data,draft.classId,draft.rows,new Date().toISOString());
        busy = true; error = ""; refresh();
        const saved = await options.commit(result);
        if (request !== serial) return false;
        draft = null;
        if (saved === false) error = "Die Bewertung ist in der Sitzung angelegt. Das Speichern ist noch nicht erfolgreich; bitte den Speicherstatus der App prüfen.";
      } catch (e) { if (request === serial) error = e.message || "Die Bewertung konnte nicht übernommen werden."; }
      finally { if (request === serial) { busy = false; refresh(); const dialog = document.querySelector('#assessmentImportModal [role="dialog"]'); if (dialog) dialog.focus(); } }
      return false;
    }
    function keyDown(event) {
      if (event.key === "Escape") { event.preventDefault(); return close(); }
      if (event.key === "Tab") {
        const dialog = document.querySelector('#assessmentImportModal [role="dialog"]');
        if (!dialog) return true;
        const controls = Array.from(dialog.querySelectorAll('button:not([disabled]),select:not([disabled]),a[href]'));
        if (!controls.length) { event.preventDefault(); return false; }
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { last.focus(); event.preventDefault(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { first.focus(); event.preventDefault(); }
      }
      return true;
    }
    function downloadDocument(sheetId, index) {
      const sheet = (options.snapshot().evaluationSheets || []).find(s => s.id === sheetId), doc = sheet && (sheet.documents || [])[index];
      if (!doc) return false;
      const binary = window.atob(doc.dataBase64), bytes = Uint8Array.from(binary,c => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes],{type:doc.mimeType})); const link = document.createElement('a');
      link.href = url; link.download = doc.fileName; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url),1000); return false;
    }
    function clear() { serial++; draft = null; error = ""; busy = false; opener = null; }
    return {render:render,open:openFile,readFile:readFile,assign:assign,confirm:confirm,close:close,clear:clear,keyDown:keyDown,downloadDocument:downloadDocument};
  }
  function renderDetails(sheet, result) {
    if (!sheet) return "";
    const tasks = sheet.taskSheet && sheet.taskSheet.tasks || [];
    const hasContent = sheet.instructions || (sheet.documents || []).length || tasks.some(t => t.text || t.subtasks.some(s => s.text || s.expectedAnswer || (s.criteria || []).length)) || result && (result.gradeLabel || result.subtaskResults.some(r => r.gradeLabel || r.answer));
    if (!hasContent) return "";
    const docs = (sheet.documents || []).map((doc,index) => ({doc:doc,index:index})).filter(entry => !entry.doc.studentRef || result && entry.doc.studentRef === result.sourceResultId);
    return '<details class="assessment-import__details"><summary>' + (result ? 'Importierte Korrektur und Erwartungshorizont' : 'Aufgabentexte, Erwartungshorizont und Originaldateien') + '</summary>'
      + (result && result.gradeLabel ? fieldText('Importierte Gesamtnote',result.gradeLabel) : '') + fieldText('Hinweise',sheet.instructions)
      + (docs.length ? '<div class="assessment-import__actions">' + docs.map(entry => '<button class="header-utility-button" type="button" data-sheet="' + esc(sheet.id) + '" onclick="return ' + api + '.downloadDocument(this.dataset.sheet, ' + entry.index + ')">' + esc(entry.doc.fileName) + '</button>').join('') + '</div>' : '')
      + tasks.map(task => '<section><h4>' + esc(task.title) + '</h4>' + fieldText('Aufgabenstellung',task.text) + task.subtasks.map(sub => {
        const sr = result && result.subtaskResults.find(r => r.subtaskId === sub.id);
        return '<div class="assessment-import__subtask"><h5>' + esc(sub.title) + ' · ' + esc(sub.be) + ' BE' + (sub.isAdditionalTask ? ' (Zusatz)' : '') + '</h5>' + fieldText('Aufgabenstellung',sub.text) + fieldText('Erwartete Antwort',sub.expectedAnswer)
          + (sr ? fieldText('Importierte Teilnote',sr.gradeLabel) + fieldText('Schülerantwort',sr.answer) : '')
          + ((sub.criteria || []).length ? '<ul>' + sub.criteria.map(c => { const cr = sr && (sr.criterionResults || []).find(r => r.criterionId === c.id); return '<li>' + esc(c.text) + ' · ' + (cr ? esc(cr.points) + ' / ' : '') + esc(c.maxPoints) + ' BE' + (cr && cr.comment ? ' · ' + esc(cr.comment) : '') + '</li>'; }).join('') + '</ul>' : '') + '</div>';
      }).join('') + '</section>').join('') + '</details>';
  }
  feature.createController = createController;
  feature.renderDetails = renderDetails;
}());

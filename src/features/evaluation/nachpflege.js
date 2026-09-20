(function () {
  "use strict";
  const ns = window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  ns.features = ns.features || {};
  ns.features.evaluation = ns.features.evaluation || {};
  const qualities = [["-2", "−−"], ["-1", "−"], ["0", "○"], ["1", "+"], ["2", "++"]];
  const hasValue = value => value !== "" && value !== undefined && value !== null;
  const list = value => Array.isArray(value) ? value : [];
  const name = student => student.fullName || [student.firstName, student.lastName].filter(Boolean).join(" ");

  function recordId(context, studentId, group) {
    return ["nachpflege", group, context.classId, context.lessonDate, context.lessonId || "", studentId].map(encodeURIComponent).join(":");
  }
  function collection(group) {
    return group === "math" ? "mathObservationRecords" : group.startsWith("tool:") ? "evidenceObservations" : "assessments";
  }
  function getRecord(snapshot, context, studentId, group) {
    return list(snapshot[collection(group)]).find(record => record.id === recordId(context, studentId, group)) || {};
  }
  function hasContent(record, group) {
    if (group === "overall") return hasValue(record.overallImpression) || Boolean(record.note.trim());
    if (group === "detail") return ["afb1", "afb2", "afb3", "workBehavior", "socialBehavior", "knowledgeGap", "note", "situationType", "demandLevel", "category"].some(key => hasValue(record[key]) && String(record[key]).trim() !== "");
    return Boolean(record.note.trim() || record.situationType || record.demandLevel || record.category || (group === "math" ? record.competencyQualities.length || record.markers.length : record.selections.length));
  }
  function upsert(snapshot, context, studentId, group, values, recordedAt, updatedAt) {
    if (!context.classId || !context.lessonDate || !context.students.some(student => student.id === studentId)) return null;
    const key = collection(group);
    const id = recordId(context, studentId, group);
    const records = snapshot[key] = list(snapshot[key]);
    const index = records.findIndex(record => record.id === id);
    const record = Object.assign({
      id, studentId, classId: context.classId, lessonId: context.lessonId || "", lessonDate: context.lessonDate,
      room: context.room || "", type: "unterricht", date: context.lessonDate, score: 0, maxScore: 0,
      afb1: "", afb2: "", afb3: "", overallImpression: "", category: "", situationType: "", demandLevel: "", note: "",
      workBehavior: "", socialBehavior: "", knowledgeGap: "", competencyQualities: [], markers: [], selections: []
    }, index >= 0 ? records[index] : {}, values, { recordedAt, updatedAt: updatedAt || new Date().toISOString() });
    if (group.startsWith("tool:")) record.toolId = group.slice(5);
    if (group === "math") {
      record.mathObservationQualityScale = "0-4";
      record.competencyIds = record.competencyQualities.map(entry => entry.competencyId);
      record.primaryCompetency = record.competencyIds[0] || "";
      record.processQuality = record.competencyQualities.length ? record.competencyQualities[0].quality : "";
      record.marker = record.markers.length ? record.markers[0].marker : "";
      record.markerDirection = record.markers.length ? record.markers[0].markerDirection || "" : "";
      record.markerQuality = record.markers.length ? record.markers[0].markerQuality : "";
    }
    if (!hasContent(record, group)) {
      if (index >= 0) records.splice(index, 1);
    } else if (index >= 0) records[index] = record;
    else records.push(record);

    // Keep a diagnosed gap in the same collection used by the live lesson view.
    if (group === "detail") {
      const gaps = snapshot.knowledgeGapRecords = list(snapshot.knowledgeGapRecords);
      const gapId = id + ":gap";
      const gapIndex = gaps.findIndex(gap => gap.id === gapId);
      if (record.knowledgeGap.trim()) {
        const gap = Object.assign({}, gapIndex >= 0 ? gaps[gapIndex] : { status: "offen" }, {
          id: gapId, studentId, classId: context.classId, lessonId: context.lessonId || "", lessonDate: context.lessonDate,
          room: context.room || "", recordedAt, content: record.knowledgeGap.trim(), note: record.note
        });
        if (gapIndex >= 0) gaps[gapIndex] = gap;
        else gaps.push(gap);
      } else if (gapIndex >= 0) gaps.splice(gapIndex, 1);
    }
    return record;
  }
  function sortedStudents(snapshot, context) {
    const latest = new Map();
    const records = list(snapshot.assessments).filter(record => record.type === "unterricht" || record.lessonId)
      .concat(list(snapshot.mathObservationRecords), list(snapshot.evidenceObservations));
    records.forEach(record => {
      if (record.classId !== context.classId) return;
      const date = String(record.recordedAt || record.lessonDate || record.date || "");
      if (!date || date.slice(0, 10) > context.lessonDate) return;
      const time = Date.parse(date);
      const edited = Date.parse(record.updatedAt || date) || 0;
      const previous = latest.get(record.studentId);
      if (Number.isFinite(time) && (!previous || previous.time < time || (previous.time === time && previous.edited < edited))) latest.set(record.studentId, { time, date, edited });
    });
    return context.students.map(student => ({ student, latest: latest.get(student.id) || null }))
      .sort((a, b) => (a.latest ? a.latest.time : -Infinity) - (b.latest ? b.latest.time : -Infinity)
        || (a.latest ? a.latest.edited : 0) - (b.latest ? b.latest.edited : 0) || name(a.student).localeCompare(name(b.student), "de"));
  }

  function createController(options) {
    let selectedId = "";
    let contextKey = "";
    let selectedTool = "math";
    const expanded = { detail: false, tools: false };
    let pointerId = null;
    const escape = options.escape;
    const api = "window.UnterrichtsassistentApp.nachpflege";
    const current = () => options.getContext();
    const groupForTool = () => selectedTool === "math" ? "math" : "tool:" + selectedTool;
    const record = group => { const c = current(); return getRecord(c.snapshot, c, selectedId, group); };
    function ensureContext(c) {
      const key = [c.classId, c.lessonDate, c.lessonId].join("::");
      if (key !== contextKey) { selectedId = ""; contextKey = key; pointerId = null; }
      if (!c.students.some(student => student.id === selectedId)) selectedId = (sortedStudents(c.snapshot, c)[0] || { student: {} }).student.id || "";
      if (selectedTool !== "math" && !list(c.snapshot.evidenceTools).some(tool => tool.id === selectedTool)) selectedTool = "math";
    }
    function field(group, key, label, values, value) {
      return '<label class="nachpflege-field"><span>' + escape(label) + '</span><select data-np-group="' + escape(group) + '" data-np-field="' + escape(key) + '" onchange="' + api + '.input(this)"><option value="">–</option>' + values.map(option => '<option value="' + escape(option[0]) + '"' + (String(value ?? "") === String(option[0]) ? ' selected' : '') + '>' + escape(option[1]) + '</option>').join("") + '</select></label>';
    }
    function textField(group, key, label, value, maxLength) {
      return '<label class="nachpflege-field"><span>' + escape(label) + '</span><textarea rows="2" maxlength="' + maxLength + '" data-np-group="' + escape(group) + '" data-np-field="' + escape(key) + '" oninput="' + api + '.input(this)" placeholder="' + escape(label + " hinzufügen …") + '">' + escape(value || "") + '</textarea></label>';
    }
    function contextFields(group, entry) {
      return '<div class="nachpflege-fields">' + field(group, "situationType", "Lernen / Leisten", [["lernen", "Lernen"], ["leisten", "Leisten"]], entry.situationType)
        + field(group, "demandLevel", "Anforderungsbereich", [["afb1", "AFB 1"], ["afb1/2", "AFB 1/2"], ["afb2", "AFB 2"], ["afb2/3", "AFB 2/3"], ["afb3", "AFB 3"]], entry.demandLevel)
        + field(group, "category", "Bewertungskontext", [["ueberpruefung", "Überprüfung"], ["praesentation", "Präsentation"], ["beitrag", "Beitrag"], ["abgabe", "Abgabe"], ["nachtrag", "Nachtrag"]], entry.category) + '</div>';
    }
    function graph(entry) {
      const y = value => 24 + (2 - Number(value)) * 42;
      const x = afb => 72 + (afb - 1) * 120;
      const points = [1, 2, 3].filter(afb => hasValue(entry["afb" + afb])).map(afb => x(afb) + ',' + y(entry["afb" + afb]));
      return qualities.map(q => '<line x1="52" x2="334" y1="' + y(q[0]) + '" y2="' + y(q[0]) + '" stroke="#cbd5df"/><text x="28" y="' + (y(q[0]) + 5) + '" text-anchor="middle">' + q[1] + '</text>').join("")
        + (points.length > 1 ? '<polyline points="' + points.join(' ') + '" fill="none" stroke="#254c5d" stroke-width="3"/>' : '')
        + [1, 2, 3].map(afb => '<text x="' + x(afb) + '" y="222" text-anchor="middle">AFB ' + afb + '</text>' + qualities.map(q => '<circle cx="' + x(afb) + '" cy="' + y(q[0]) + '" r="' + (String(entry["afb" + afb]) === q[0] ? 9 : 5) + '" fill="' + (String(entry["afb" + afb]) === q[0] ? '#254c5d' : '#fff') + '" stroke="#718899" stroke-width="2"/>').join("")).join("");
    }
    function studentList(c) {
      return sortedStudents(c.snapshot, c).map(item => '<button type="button" class="nachpflege-student' + (item.student.id === selectedId ? ' is-active' : '') + '" data-np-student="' + escape(item.student.id) + '" aria-pressed="' + (item.student.id === selectedId) + '" onclick="' + api + '.select(this.dataset.npStudent)"><strong>' + escape(name(item.student)) + '</strong><span>' + (item.latest ? 'Letzte Rückmeldung: ' + escape(new Date(item.latest.date).toLocaleDateString('de-DE')) : 'Noch keine Rückmeldung') + '</span></button>').join("");
    }
    function toolBody(c) {
      const group = groupForTool();
      const entry = record(group);
      let body = '';
      if (selectedTool === "math") {
        body = '<div class="nachpflege-fields">' + options.mathCompetencies.map(competency => {
          const quality = list(entry.competencyQualities).find(item => item.competencyId === competency.key);
          return field(group, "competency:" + competency.key, competency.label, options.mathQualities.map(q => [String(q.value), q.label]), quality ? quality.quality : "");
        }).join('') + '</div>';
        body += field(group, "marker", "Beobachtungsmerkmal", options.mathMarkers.map(marker => [marker.key, marker.label]), entry.marker);
      } else {
        const tool = list(c.snapshot.evidenceTools).find(item => item.id === selectedTool);
        body = list(tool && tool.aspekte).map(aspect => '<fieldset class="nachpflege-aspect"><legend>' + escape(aspect.titel || 'Aspekt') + '</legend>'
          + (aspect.information ? '<p class="nachpflege-hint">' + escape(aspect.information) + '</p>' : '')
          + list(aspect.aspektDimensionen).map(dimension => {
            const selection = list(entry.selections).find(item => item.aspectId === aspect.id);
            const stage = list(selection && selection.stages).find(item => item.dimensionId === dimension.id);
            return field(group, "stage:" + encodeURIComponent(aspect.id) + ":" + encodeURIComponent(dimension.id), dimension.bezeichnung || 'Bewertung', list(dimension.stufen).map(item => [item.id, item.bezeichnung || 'Stufe']), stage ? stage.stageId : "");
          }).join('') + '</fieldset>').join('') || '<p class="nachpflege-hint">Dieses Werkzeug enthält noch keine Bewertungsdimensionen.</p>';
      }
      return body + contextFields(group, entry) + textField(group, 'note', 'Notiz zum Werkzeug', entry.note, 240);
    }
    function editor(c) {
      const student = c.students.find(item => item.id === selectedId);
      if (!student) return '<p class="empty-message">In dieser Lerngruppe sind noch keine Personen vorhanden.</p>';
      const overall = record('overall');
      const detail = record('detail');
      return '<header class="nachpflege-editor__header"><div><div class="nachpflege-hint">Nachpflege · ' + escape(c.lessonDate.split('-').reverse().join('.')) + '</div><h2>' + escape(name(student)) + '</h2></div><span class="nachpflege-hint">Änderungen werden automatisch gespeichert</span></header>'
        + '<fieldset class="nachpflege-overall"><legend>Gesamteindruck</legend><div class="nachpflege-scale" role="group" aria-label="Gesamteindruck">' + qualities.map(q => '<button type="button" data-np-overall="' + q[0] + '" aria-pressed="' + (String(overall.overallImpression) === q[0]) + '" onclick="' + api + '.overall(this.dataset.npOverall)">' + q[1] + '</button>').join('') + '</div><button type="button" class="nachpflege-clear" onclick="' + api + '.overall(\'\')">Auswahl löschen</button></fieldset>'
        + textField('overall', 'note', 'Notiz zum Gesamteindruck', overall.note, 1000)
        + '<details class="nachpflege-section" data-np-section="detail"' + (expanded.detail ? ' open' : '') + ' ontoggle="' + api + '.toggle(this)"><summary>Lupenwerkzeug · genauer einschätzen</summary><div class="nachpflege-section__body">'
        + '<div class="nachpflege-graph" onpointerdown="' + api + '.pointer(event,\'down\')" onpointermove="' + api + '.pointer(event,\'move\')" onpointerup="' + api + '.pointer(event,\'up\')" onpointercancel="' + api + '.pointer(event,\'up\')"><svg id="nachpflegeGraph" viewBox="0 0 360 236" role="img" aria-label="AFB-Bewertung: AFB 1 bis 3, von Minus-Minus bis Plus-Plus">' + graph(detail) + '</svg></div><p class="nachpflege-hint">Im Graphen klicken oder ziehen. Alternativ die Auswahlfelder verwenden.</p>'
        + '<div class="nachpflege-fields">' + [1, 2, 3].map(afb => field('detail', 'afb' + afb, 'AFB ' + afb, qualities, detail['afb' + afb])).join('') + '</div>' + contextFields('detail', detail)
        + '<div class="nachpflege-fields">' + field('detail', 'workBehavior', 'Arbeitsverhalten', ['a','b','c','d'].map(value => [value,value]), detail.workBehavior) + field('detail', 'socialBehavior', 'Sozialverhalten', ['a','b','c','d'].map(value => [value,value]), detail.socialBehavior) + '</div>'
        + textField('detail', 'knowledgeGap', 'Wissenslücke', detail.knowledgeGap, 180) + textField('detail', 'note', 'Notiz zur detaillierten Bewertung', detail.note, 240) + '</div></details>'
        + '<details class="nachpflege-section" data-np-section="tools"' + (expanded.tools ? ' open' : '') + ' ontoggle="' + api + '.toggle(this)"><summary>Kompetenz- und Bewertungswerkzeuge</summary><div class="nachpflege-section__body"><label class="nachpflege-field"><span>Werkzeug</span><select id="nachpflegeTool" onchange="' + api + '.tool(this.value)"><option value="math">Mathe-Werkzeug</option>' + list(c.snapshot.evidenceTools).map(tool => '<option value="' + escape(tool.id) + '"' + (selectedTool === tool.id ? ' selected' : '') + '>' + escape(tool.titel || 'Bewertungswerkzeug') + '</option>').join('') + '</select></label><div id="nachpflegeToolBody">' + toolBody(c) + '</div></div></details>';
    }
    function refreshList() {
      const target = document.getElementById('nachpflegeStudents');
      if (target) { const scrollTop = target.scrollTop; target.innerHTML = studentList(current()); target.scrollTop = scrollTop; }
    }
    function update(group, values) {
      const c = current();
      if ([c.classId, c.lessonDate, c.lessonId].join('::') !== contextKey) return false;
      const result = upsert(c.snapshot, c, selectedId, group, values, options.timestamp());
      if (!result) return false;
      options.save(c.snapshot);
      refreshList();
      return false;
    }
    const controller = {
      render() {
        const c = current(); ensureContext(c);
        if (!c.classId) return '<article class="panel"><p class="empty-message">Bitte eine Lerngruppe auswählen.</p></article>';
        return '<div class="nachpflege-layout"><aside class="panel nachpflege-roster"><h2>' + escape(c.className) + '</h2><p class="nachpflege-hint">Länger ohne Rückmeldung zuerst</p><div id="nachpflegeStudents" class="nachpflege-students">' + studentList(c) + '</div></aside><article class="panel nachpflege-editor" id="nachpflegeEditor">' + editor(c) + '</article></div>';
      },
      select(id) {
        const c = current();
        if (!c.students.some(student => student.id === id)) return false;
        selectedId = id; pointerId = null;
        document.getElementById('nachpflegeEditor').innerHTML = editor(c); refreshList();
        return false;
      },
      toggle(element) { expanded[element.dataset.npSection] = element.open; },
      tool(id) { selectedTool = id; ensureContext(current()); document.getElementById('nachpflegeToolBody').innerHTML = toolBody(current()); },
      overall(value) {
        if (value !== '' && !qualities.some(q => q[0] === value)) return false;
        update('overall', { overallImpression: value === '' ? '' : Number(value) });
        document.querySelectorAll('[data-np-overall]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.npOverall === value)));
        return false;
      },
      input(element) {
        const group = element.dataset.npGroup, key = element.dataset.npField, value = element.value;
        const entry = record(group);
        let values = {};
        if (key.startsWith('competency:')) {
          const competencyId = key.slice(11);
          values.competencyQualities = list(entry.competencyQualities).filter(item => item.competencyId !== competencyId);
          if (value !== '') values.competencyQualities.push({ competencyId, quality: Number(value) });
        } else if (key.startsWith('stage:')) {
          const parts = key.split(':').slice(1).map(decodeURIComponent);
          const selections = JSON.parse(JSON.stringify(list(entry.selections)));
          const selection = selections.find(item => item.aspectId === parts[0]) || { aspectId: parts[0], stages: [] };
          selection.stages = selection.stages.filter(item => item.dimensionId !== parts[1]);
          if (value) selection.stages.push({ dimensionId: parts[1], stageId: value });
          values.selections = selections.filter(item => item.aspectId !== parts[0]);
          if (selection.stages.length) values.selections.push(selection);
        } else if (key === 'marker') values.markers = value ? [{ marker: value, markerDirection: '', markerQuality: '' }] : [];
        else values[key] = /^afb[123]$/.test(key) && value !== '' ? Number(value) : value;
        update(group, values);
        if (/^afb[123]$/.test(key)) document.getElementById('nachpflegeGraph').innerHTML = graph(record('detail'));
      },
      pointer(event, phase) {
        if (phase === 'up') { pointerId = null; return; }
        if (phase === 'down') {
          if (event.button !== undefined && event.button !== 0) return;
          pointerId = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        if (pointerId !== event.pointerId) return;
        event.preventDefault();
        const svg = document.getElementById('nachpflegeGraph');
        const rect = svg.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (event.clientX - rect.left) * 360 / rect.width;
        const y = (event.clientY - rect.top) * 236 / rect.height;
        const afb = Math.max(1, Math.min(3, Math.round((x - 72) / 120) + 1));
        const quality = Math.max(-2, Math.min(2, Math.round(2 - (y - 24) / 42)));
        if (record('detail')['afb' + afb] === quality) return;
        update('detail', { ['afb' + afb]: quality });
        svg.innerHTML = graph(record('detail'));
        document.querySelector('[data-np-field="afb' + afb + '"]').value = String(quality);
      },
      clear() { selectedId = ''; contextKey = ''; selectedTool = 'math'; pointerId = null; expanded.detail = false; expanded.tools = false; }
    };
    return controller;
  }
  ns.features.evaluation.nachpflege = { createController, getRecord, upsert, sortedStudents, recordId };
}());

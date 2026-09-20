(function () {
  "use strict";
  const ns = window.Unterrichtsassistent;
  const list = value => Array.isArray(value) ? value : [];
  const number = value => value === null || value === undefined || String(value).trim() === "" || !Number.isFinite(Number(value)) ? null : Number(value);
  const mean = values => { const valid = values.map(number).filter(value => value !== null); return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null; };
  const clamp = value => value === null ? null : Math.min(4, Math.max(0, value));
  const symbols = ["−−", "−", "○", "+", "++"];
  const tones = ["#a65324", "#b68129", "#75808a", "#327d87", "#195664"];
  const scheme = value => value === "points" ? "points" : "grades";
  const gradeValues = value => value === "points" ? Array.from({ length: 16 }, (_, i) => i) : [1, 2, 3, 4, 5, 6];
  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  }
  function afb(value) {
    const labels = { "--": -2, "−−": -2, "-": -1, "−": -1, "○": 0, "+": 1, "++": 2 };
    const result = Object.hasOwn(labels, value) ? labels[value] : number(value);
    return result !== null && result >= -2 && result <= 2 ? result + 2 : null;
  }
  function ordinal(id, stages) {
    if (stages.length < 2) return null;
    const index = stages.findIndex(stage => stage.id === id);
    return index < 0 ? null : index * 4 / (stages.length - 1);
  }
  function qualityOf(record, snapshot) {
    const raw = record.raw || {};
    if (record.type === "assessment") {
      if (number(raw.maxScore) > 0 && number(raw.score) !== null) return clamp(Number(raw.score) / Number(raw.maxScore) * 4);
      const values = [afb(raw.overallImpression), afb(raw.afb1), afb(raw.afb2), afb(raw.afb3)];
      return mean(values);
    }
    if (record.type === "mathObservation") {
      // Legacy observations used -2..2, current observations explicitly declare 0..4.
      const offset = raw.mathObservationQualityScale === "0-4" ? 0 : 2;
      const qualities = list(raw.competencyQualities).map(entry => number(entry.quality));
      const values = qualities.length ? qualities : [number(raw.processQuality)];
      return mean(values.filter(value => value !== null).map(value => clamp(value + offset)));
    }
    if (record.type === "evidenceObservation") {
      const tool = list(snapshot.evidenceTools).find(item => item.id === raw.toolId);
      return mean(list(raw.selections).flatMap(selection => {
        const aspect = list(tool && tool.aspekte).find(item => item.id === selection.aspectId);
        return list(selection.stages).map(ref => {
          const dimension = list(aspect && aspect.aspektDimensionen).find(item => item.id === ref.dimensionId);
          return ordinal(ref.stageId, list(dimension && dimension.stufen));
        });
      }));
    }
    if (record.type === "completedEvaluation") {
      if (record.evaluationSheet && record.evaluationSheet.type === "kompetenzraster") {
        const columns = list(record.evaluationSheet.competencyGrid && record.evaluationSheet.competencyGrid.columns);
        return mean(list(raw.competencyResults).map(result => ordinal(result.columnId, columns)));
      }
      return number(record.percent) === null ? null : clamp(Number(record.percent) / 25);
    }
    return null;
  }
  function sourceOf(record) {
    if (record.type === "completedEvaluation" || (record.type === "assessment" && number(record.raw && record.raw.maxScore) > 0)) return "evaluation";
    return ["assessment", "mathObservation", "evidenceObservation"].includes(record.type) ? "observation" : "context";
  }
  function summarize(records) {
    const scored = records.filter(record => number(record.quality) !== null && validDate(record.date));
    const days = new Map();
    scored.forEach(record => { if (!days.has(record.date)) days.set(record.date, []); days.get(record.date).push(record); });
    const daily = Array.from(days, ([date, entries]) => ({ date, quality: mean(entries.map(record => record.quality)), count: entries.length,
      observation: mean(entries.filter(record => record.source === "observation").map(record => record.quality)),
      evaluation: mean(entries.filter(record => record.source === "evaluation").map(record => record.quality))
    })).sort((a, b) => a.date.localeCompare(b.date));
    const average = mean(daily.map(day => day.quality));
    const recent = daily.slice(-5);
    const previous = daily.slice(-10, -5);
    const change = recent.length >= 3 && previous.length >= 3 ? mean(recent.map(day => day.quality)) - mean(previous.map(day => day.quality)) : null;
    return { scored, daily, average, recent: mean(recent.map(day => day.quality)), change };
  }
  function saveEntry(snapshot, context, draft, now, newId) {
    const schoolClass = list(snapshot.classes).find(item => item.id === context.classId);
    if (!schoolClass || !list(schoolClass.studentIds).includes(context.studentId)) throw new Error("Die Person gehört nicht zur aktuellen Lerngruppe.");
    if (!validDate(draft.date)) throw new Error("Bitte ein gültiges Datum angeben.");
    const entries = snapshot.studentJournalEntries = list(snapshot.studentJournalEntries);
    const existing = draft.id ? entries.find(entry => entry.id === draft.id && entry.classId === context.classId && entry.studentId === context.studentId) : null;
    if (draft.id && !existing) throw new Error("Dieser Eintrag ist nicht mehr verfügbar.");
    const kind = existing ? existing.kind : draft.kind;
    const gradingScheme = kind === "grade" ? (existing ? scheme(existing.gradingScheme) : scheme(schoolClass.gradingScheme)) : "";
    const grade = kind === "grade" ? number(draft.grade) : null;
    const note = String(draft.note || "").trim();
    if (kind === "grade" && !gradeValues(gradingScheme).includes(grade)) throw new Error("Bitte eine Note im eingestellten Notenschema auswählen.");
    if (!["grade", "comment"].includes(kind) || (kind === "comment" && !note)) throw new Error("Bitte einen Kommentar eingeben.");
    const entry = { id: existing ? existing.id : newId, classId: context.classId, studentId: context.studentId, kind, date: draft.date,
      gradingScheme, grade: grade === null ? "" : grade, note: note.slice(0, 4000), createdAt: existing ? existing.createdAt : now, updatedAt: now };
    if (existing) entries[entries.indexOf(existing)] = entry;
    else entries.push(entry);
    return entry;
  }

  function createController(options) {
    const esc = options.escape;
    const api = "window.UnterrichtsassistentApp.studentOverview";
    const states = new Map();
    let input = null;
    let currentState = null;
    const fmt = value => number(value) === null ? "–" : Number(value).toFixed(1).replace(".", ",");
    const dateLabel = value => validDate(value) ? value.split("-").reverse().join(".") : "Ohne Datum";
    const gradeLabel = entry => entry.gradingScheme === "points" ? entry.grade + " Punkte" : "Note " + entry.grade;
    function stateFor(data) {
      const key = data.schoolClass.id + "::" + data.student.id;
      if (!states.has(key)) states.set(key, { period: "all", from: "", to: "", timeline: false, timelineType: "all", limit: 30, draft: null, message: "", expanded: false });
      return states.get(key);
    }
    function allRecords(data) {
      const records = data.records.map(record => Object.assign({}, record, { source: sourceOf(record), quality: qualityOf(record, data.snapshot) }));
      const journal = list(data.snapshot.studentJournalEntries).filter(entry => entry.classId === data.schoolClass.id && entry.studentId === data.student.id).map(entry => ({
        type: entry.kind, source: entry.kind, quality: null, raw: entry, date: entry.date, sortKey: entry.date + "|" + entry.createdAt,
        label: entry.kind === "grade" ? "Zwischennote · " + gradeLabel(entry) : "Kommentar", summary: entry.note, context: ""
      }));
      return records.concat(journal).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || String(b.sortKey || "").localeCompare(String(a.sortKey || "")));
    }
    function inPeriod(record, data, state) {
      if (!validDate(record.date)) return state.period === "all";
      if (record.date > data.referenceDate) return false;
      let start = "";
      let end = data.referenceDate;
      if (state.period === "custom") { start = state.from; end = state.to || end; }
      else if (state.period !== "all") {
        const date = new Date(data.referenceDate + "T12:00:00Z");
        date.setUTCDate(date.getUTCDate() - Number(state.period) + 1);
        start = date.toISOString().slice(0, 10);
      }
      return (!start || record.date >= start) && (!end || record.date <= end);
    }
    function qualityBadge(value, compact) {
      if (value === null) return '<span class="so-muted so-unrated">Ohne Qualitätswert</span>';
      const index = Math.round(clamp(value));
      return '<span class="so-quality" style="--quality-color:' + tones[index] + '"><strong>' + (compact ? symbols[index] + ' · ' : '') + fmt(value) + '/4</strong><span class="so-quality-track" aria-hidden="true"><i style="width:' + (value * 25) + '%"></i></span></span>';
    }
    function chart(summary) {
      if (!summary.daily.length) return '<p class="so-empty">Noch keine bewerteten Rückmeldungen in diesem Zeitraum. Kommentare und Kontextdaten bleiben in der Timeline sichtbar.</p>';
      const days = summary.daily;
      const left = 48, right = 724, top = 22, bottom = 192;
      const first = Date.parse(days[0].date), last = Date.parse(days[days.length - 1].date);
      const x = date => days.length === 1 ? (left + right) / 2 : left + (Date.parse(date) - first) / (last - first) * (right - left);
      const y = quality => bottom - quality / 4 * (bottom - top);
      const parts = ['<svg class="so-chart" viewBox="0 0 760 236" role="group" aria-label="Leistungsverlauf auf der Qualitätsskala 0 bis 4. Durchschnitt ' + fmt(summary.average) + '. Tageswerte sind über die Punkte und die Timeline erreichbar.">'];
      [0, 1, 2, 3, 4].forEach(q => parts.push('<line x1="48" x2="724" y1="' + y(q) + '" y2="' + y(q) + '" stroke="#dce3e7"/><text x="35" y="' + (y(q) + 4) + '" text-anchor="end">' + q + '</text>'));
      parts.push('<line x1="48" x2="724" y1="' + y(summary.average) + '" y2="' + y(summary.average) + '" stroke="#697983" stroke-dasharray="5 5"/>');
      days.forEach((day, index) => {
        if (index > 0 && Date.parse(day.date) - Date.parse(days[index - 1].date) <= 28 * 86400000) parts.push('<line x1="' + x(days[index - 1].date) + '" y1="' + y(days[index - 1].quality) + '" x2="' + x(day.date) + '" y2="' + y(day.quality) + '" stroke="#a4b1b9" stroke-width="2"/>');
        ['observation', 'evaluation'].forEach(source => {
          const quality = day[source];
          if (quality === null) return;
          const px = x(day.date) + (day.observation !== null && day.evaluation !== null ? (source === 'observation' ? -4 : 4) : 0);
          const py = y(quality);
          const label = dateLabel(day.date) + ': ' + (source === 'observation' ? 'Beobachtungen' : 'Bewertungen') + ', ' + fmt(quality) + ' von 4. Einträge öffnen';
          parts.push('<g class="so-chart-point so-source-' + source + '" role="button" tabindex="0" aria-label="' + esc(label) + '" data-so-date="' + day.date + '" onclick="' + api + '.showDay(this.dataset.soDate)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();' + api + '.showDay(this.dataset.soDate)}"><title>' + esc(label) + '</title><circle cx="' + px + '" cy="' + py + '" r="13" fill="transparent"/>'
            + (source === 'observation' ? '<circle cx="' + px + '" cy="' + py + '" r="5" fill="#246a91"/>' : '<path d="M' + px + ' ' + (py - 7) + 'l7 7 -7 7 -7 -7Z" fill="#80558c"/>') + '</g>');
        });
      });
      parts.push('<text x="48" y="221">' + esc(dateLabel(days[0].date)) + '</text><text x="724" y="221" text-anchor="end">' + esc(dateLabel(days[days.length - 1].date)) + '</text></svg>');
      return parts.join('');
    }
    function timelineRows(records) {
      return records.map(record => {
        const isJournal = ['grade', 'comment'].includes(record.type);
        return '<article class="so-timeline-row so-source-' + record.source + '" data-so-record="' + esc(record.raw.id || '') + '"><div class="so-timeline-meta"><time>' + esc(dateLabel(record.date)) + '</time><span class="so-source-label">' + (record.source === 'evaluation' ? '◆ Bewertung' : record.source === 'observation' ? '● Beobachtung' : record.type === 'grade' ? 'Zwischennote' : record.type === 'comment' ? 'Kommentar' : 'Kontext') + '</span></div><div class="so-timeline-body"><strong>' + esc(record.label) + '</strong><p>' + esc(record.summary || 'Kein Zusatztext') + '</p>' + (record.context ? '<span class="so-muted">' + esc(record.context) + '</span>' : '') + '</div><div class="so-timeline-value">' + (!isJournal ? qualityBadge(record.quality, true) : '<strong>' + (record.type === 'grade' ? esc(gradeLabel(record.raw)) : 'Text') + '</strong>')
          + (isJournal ? '<button type="button" class="so-link" data-so-id="' + esc(record.raw.id) + '" onclick="' + api + '.edit(this.dataset.soId)">Bearbeiten</button>' : '<button type="button" class="so-link" data-so-id="' + esc(record.raw.id || '') + '" data-so-type="' + esc(record.type) + '" onclick="' + api + '.openRecord(this.dataset.soId,this.dataset.soType)">Details</button>') + '</div></article>';
      }).join('') || '<p class="so-empty">Keine Einträge für diese Auswahl.</p>';
    }
    function form(data, state) {
      const draft = state.draft;
      if (!draft) return '';
      const gradingScheme = draft.id ? scheme(draft.gradingScheme) : scheme(data.schoolClass.gradingScheme);
      return '<form id="studentJournalForm" class="so-entry-form" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return ' + api + '.submit(event)"><div class="so-section-heading"><h3>' + (draft.id ? 'Eintrag bearbeiten' : draft.kind === 'grade' ? 'Zwischennote festhalten' : 'Kommentar hinzufügen') + '</h3><span class="so-muted">Entwurf · ' + esc(data.studentName) + '</span></div><div class="so-form-fields"><label>Datum<input type="date" name="date" value="' + esc(draft.date) + '" required oninput="' + api + '.draft(this)"></label>'
        + (draft.kind === 'grade' ? '<label>' + (gradingScheme === 'points' ? 'Punkte (0–15)' : 'Note (1–6)') + '<select name="grade" required onchange="' + api + '.draft(this)"><option value="">Bitte auswählen</option>' + gradeValues(gradingScheme).map(value => '<option value="' + value + '"' + (String(draft.grade) === String(value) ? ' selected' : '') + '>' + value + '</option>').join('') + '</select></label>' : '')
        + '<label class="so-form-note">' + (draft.kind === 'grade' ? 'Begründung (optional)' : 'Kommentar') + '<textarea name="note" rows="3" maxlength="4000"' + (draft.kind === 'comment' ? ' required' : '') + ' oninput="' + api + '.draft(this)">' + esc(draft.note || '') + '</textarea></label></div><div class="so-actions"><button class="so-button so-button-primary" type="submit">' + (draft.id ? 'Änderungen speichern' : draft.kind === 'grade' ? 'Zwischennote speichern' : 'Kommentar speichern') + '</button><button type="button" class="so-button" onclick="' + api + '.cancel()">Entwurf verwerfen</button></div><p class="so-muted">' + (draft.kind === 'grade' ? 'Die Note wird von dir festgelegt. Sie verändert den Qualitätsindex nicht.' : 'Der Kommentar erhält keine Bewertung.') + '</p></form>';
    }
    function render(data) {
      input = data;
      currentState = stateFor(data);
      const state = currentState;
      const all = allRecords(data);
      const records = all.filter(record => inPeriod(record, data, state));
      const summary = summarize(records);
      const index = summary.average === null ? null : Math.round(summary.average);
      const latestGrade = all.find(record => record.type === 'grade' && record.date <= data.referenceDate);
      const timeline = records.filter(record => state.timelineType === 'all' || (state.timelineType === 'quality' ? record.quality !== null : record.source === state.timelineType));
      const rangeInvalid = state.period === 'custom' && state.from && state.to && state.from > state.to;
      const n = summary.scored.length;
      return '<div class="student-overview" id="studentOverview"><header class="so-header"><div><p class="so-eyebrow">Lerngruppe · Schüler</p><h2>' + esc(data.studentName) + '</h2><p class="so-muted">' + esc([data.schoolClass.name, data.schoolClass.subject].filter(Boolean).join(' · ')) + '</p></div><div class="so-actions"><button type="button" class="so-button so-button-primary" onclick="' + api + '.start(\'grade\')">+ Zwischennote</button><button type="button" class="so-button" onclick="' + api + '.start(\'comment\')">+ Kommentar</button></div></header>'
        + '<p id="studentOverviewMessage" class="so-message" role="status"' + (!state.message ? ' hidden' : '') + '>' + esc(state.message) + '</p>' + form(data, state)
        + '<div class="so-period"><label>Zeitraum<select id="studentOverviewPeriod" onchange="' + api + '.filter(\'period\',this.value)">' + [['all','Gesamter Zeitraum'],['30','Letzte 30 Tage'],['90','Letzte 90 Tage'],['custom','Eigener Zeitraum']].map(([value,label]) => '<option value="' + value + '"' + (state.period === value ? ' selected' : '') + '>' + label + '</option>').join('') + '</select></label>'
        + (state.period === 'custom' ? '<label>Von<input aria-label="Zeitraum von" type="date" value="' + esc(state.from) + '" onchange="' + api + '.filter(\'from\',this.value)"></label><label>Bis<input aria-label="Zeitraum bis" type="date" value="' + esc(state.to) + '" onchange="' + api + '.filter(\'to\',this.value)"></label>' : '') + '<span class="so-muted">' + records.length + ' Einträge · ' + summary.daily.length + ' Tage mit Qualitätswert</span></div>'
        + (rangeInvalid ? '<p class="so-message" role="alert">Das Enddatum liegt vor dem Startdatum.</p>' : '')
        + '<section class="so-overview-cards" aria-label="Leistungsüberblick"><div class="so-card so-level-card"><span class="so-eyebrow">Mittleres Niveau</span><div class="so-level"><strong data-so-average>' + fmt(summary.average) + '</strong><span>/ 4</span>' + (index !== null ? '<b style="color:' + tones[index] + '">' + symbols[index] + '</b>' : '') + '</div>' + qualityBadge(summary.average, false) + '<p class="so-muted">' + (n ? n + ' Rückmeldungen · Tagesmittel gleich gewichtet' : 'Noch keine bewertbaren Rückmeldungen') + '</p></div>'
        + '<div class="so-card"><span class="so-eyebrow">Zuletzt beobachtetes Niveau</span><strong class="so-card-value">' + fmt(summary.recent) + '<small> / 4</small></strong><p class="so-muted">Letzte ' + Math.min(5, summary.daily.length) + ' Tage mit Qualitätswert</p><p class="so-trend">' + (summary.change === null ? 'Für einen Vergleich sind mindestens 8 erfasste Tage nötig.' : (Math.abs(summary.change) < 0.15 ? '→ Etwa stabil' : summary.change > 0 ? '↗ Gestiegen' : '↘ Gesunken') + ' · ' + (summary.change > 0 ? '+' : '') + fmt(summary.change) + ' gegenüber den davorliegenden Tagen') + '</p></div>'
        + '<div class="so-card"><span class="so-eyebrow">Letzte Zwischennote</span><strong class="so-card-value">' + (latestGrade ? esc(gradeLabel(latestGrade.raw)) : 'Noch offen') + '</strong><p class="so-muted">' + (latestGrade ? esc(dateLabel(latestGrade.date)) + ' · von dir vergeben' : 'Notenschema: ' + (scheme(data.schoolClass.gradingScheme) === 'points' ? '0–15 Punkte' : 'Noten 1–6')) + '</p>' + (latestGrade ? '<p class="so-grade-reason">' + esc(latestGrade.summary || 'Ohne Begründung') + '</p><button type="button" class="so-link" data-so-id="' + esc(latestGrade.raw.id) + '" onclick="' + api + '.edit(this.dataset.soId)">Bearbeiten</button>' : '') + '</div></section>'
        + '<section class="so-panel"><div class="so-section-heading"><h3>Leistungsverlauf</h3><div class="so-legend"><span class="so-source-observation">● Beobachtung</span><span class="so-source-evaluation">◆ Bewertung</span><span>– Tagesmittel · ╌ Gesamtmittel</span></div></div>' + chart(summary)
        + '<div class="so-source-means">' + [['observation','Beobachtungen'],['evaluation','Bewertungen']].map(([source,label]) => { const subset = records.filter(record => record.source === source); const stats = summarize(subset); return '<span class="so-source-' + source + '">' + label + ': <strong>' + fmt(stats.average) + '/4</strong> · ' + stats.scored.length + ' Rückmeldungen</span>'; }).join('') + '</div>'
        + '<details class="so-method"><summary>Wie entsteht der Qualitätsindex?</summary><p>Der Index vergleicht die relative Position auf den erfassten Skalen. 0 ist das untere, 4 das obere Ende. Er ist eine Orientierung und keine errechnete Schulnote.</p><ul><li>Gesamteindruck und AFB: −− = 0, − = 1, ○ = 2, + = 3, ++ = 4.</li><li>Mathe-Werkzeug: Qualitätsstufen 0 bis 4; ältere Werte −2 bis +2 werden entsprechend verschoben.</li><li>Bewertungen mit Punkten: erreichter Anteil × 4. Zusatzpunkte erhöhen den Index höchstens auf 4.</li><li>Eigene Werkzeuge und Kompetenzraster: gespeicherte Stufenreihenfolge, erste Stufe = 0, letzte = 4, gleichmäßige Abstände. Das setzt eine aufsteigende Reihenfolge voraus. Einzelstufen oder fehlende Skalen bleiben ohne Qualitätswert.</li><li>Zuerst Mittel je Eintrag, dann je Tag, dann über die Tage. Tage mit vielen Einträgen erhalten so nicht mehr Gewicht. Die Quellmittel werden ebenso berechnet.</li><li>Kommentare, Zwischennoten, Verhalten, Anwesenheit und Hausaufgaben fließen nicht ein. Fehlende Werte zählen nicht als 0. Linien werden bei mehr als 28 Tagen Abstand unterbrochen.</li></ul><p>' + (records.length - n) + ' Einträge ohne verrechenbaren Qualitätswert. Bei wenigen oder unterschiedlichen Beobachtungssituationen ist der Mittelwert entsprechend vorsichtig zu lesen.</p></details></section>'
        + '<section class="so-panel"><div class="so-section-heading"><h3>Letzte Einträge</h3><button type="button" class="so-link" onclick="' + api + '.openTimeline()">Gesamte Timeline öffnen (' + all.length + ')</button></div>' + timelineRows(records.slice(0, 4)) + '</section>'
        + '<details id="studentFullTimeline" class="so-panel so-timeline"' + (state.timeline ? ' open' : '') + ' ontoggle="' + api + '.toggle(this,\'timeline\')"><summary>Gesamte Timeline · ' + records.length + ' Einträge im Zeitraum</summary><div class="so-timeline-controls"><label>Einträge anzeigen<select onchange="' + api + '.filter(\'timelineType\',this.value)">' + [['all','Alle Einträge'],['quality','Mit Qualitätswert'],['observation','Beobachtungen'],['evaluation','Bewertungen'],['grade','Zwischennoten'],['comment','Kommentare'],['context','Kontext']].map(([value,label]) => '<option value="' + value + '"' + (state.timelineType === value ? ' selected' : '') + '>' + label + '</option>').join('') + '</select></label><span class="so-muted">' + timeline.length + ' Treffer · neueste zuerst</span></div>' + timelineRows(timeline.slice(0, state.limit))
        + (timeline.length > state.limit ? '<div class="so-actions"><button type="button" class="so-button" onclick="' + api + '.more(false)">Weitere 30 anzeigen</button><button type="button" class="so-link" onclick="' + api + '.more(true)">Alle ' + timeline.length + ' anzeigen</button></div>' : '') + '</details>'
        + '<details class="so-panel so-extra"' + (state.expanded ? ' open' : '') + ' ontoggle="' + api + '.toggle(this,\'expanded\')"><summary>Kompetenzprofil, Wissenslücken und nächste Schritte</summary>' + (data.buildDetails ? data.buildDetails(records) : data.detailsHtml || '') + '</details></div>';
    }
    function refresh() { options.refresh(); }
    return {
      render,
      filter(key, value) { if (!['period','from','to','timelineType'].includes(key)) return; currentState[key] = value; currentState.limit = 30; refresh(); },
      toggle(element, key) { if (element.isConnected && currentState && ['timeline','expanded'].includes(key)) currentState[key] = element.open; },
      openTimeline() { currentState.timeline = true; currentState.period = 'all'; currentState.timelineType = 'all'; refresh(); document.getElementById('studentFullTimeline')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); },
      showDay(date) { currentState.period = 'custom'; currentState.from = date; currentState.to = date; currentState.timeline = true; currentState.timelineType = 'all'; refresh(); document.getElementById('studentFullTimeline')?.scrollIntoView({ block: 'start' }); },
      more(all) { currentState.limit = all ? Infinity : currentState.limit + 30; refresh(); },
      start(kind) {
        if (currentState.draft && currentState.draft.kind !== kind) { currentState.message = 'Bitte den offenen Entwurf speichern oder verwerfen.'; refresh(); return; }
        currentState.draft = currentState.draft || { kind, date: input.referenceDate, gradingScheme: scheme(input.schoolClass.gradingScheme), grade: '', note: '' };
        currentState.message = ''; refresh(); document.getElementById('studentJournalForm')?.scrollIntoView({ block: 'nearest' });
      },
      draft(element) { if (currentState.draft && ['date','grade','note'].includes(element.name)) currentState.draft[element.name] = element.value; },
      cancel() { currentState.draft = null; currentState.message = ''; refresh(); },
      edit(id) {
        if (currentState.draft) { currentState.message = 'Bitte den offenen Entwurf zuerst speichern oder verwerfen.'; refresh(); return; }
        const entry = list(input.snapshot.studentJournalEntries).find(item => item.id === id && item.classId === input.schoolClass.id && item.studentId === input.student.id);
        if (!entry) return;
        currentState.draft = Object.assign({}, entry); currentState.message = ''; refresh(); document.getElementById('studentJournalForm')?.scrollIntoView({ block: 'nearest' });
      },
      submit(event) {
        event.preventDefault();
        if (!currentState.draft) return false;
        const active = options.getContext();
        if (active.classId !== input.schoolClass.id || !active.studentIds.includes(input.student.id)) return false;
        try {
          saveEntry(active.snapshot, { classId: active.classId, studentId: input.student.id }, currentState.draft, options.now(), options.newId());
          currentState.draft = null; currentState.message = 'Eintrag übernommen.';
          options.save(active.snapshot);
        } catch (error) { currentState.message = error.message; refresh(); }
        return false;
      },
      openRecord(id, type) { const record = input.records.find(item => item.raw.id === id && item.type === type); if (record) options.openRecord(input.student.id, record.date, id, type, record.groupKey); },
      clear() { states.clear(); input = null; currentState = null; }
    };
  }
  ns.features.evaluation.studentOverview = { qualityOf, sourceOf, summarize, saveEntry, gradeValues, validDate, createController };
}());

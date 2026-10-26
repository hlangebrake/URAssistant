(function () {
  "use strict";
  const ns = window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  ns.features = ns.features || {};
  ns.features.evaluation = ns.features.evaluation || {};
  const FORMAT = "ur-assistant.assessment";
  const MAX_BYTES = 50 * 1024 * 1024;
  const copy = value => JSON.parse(JSON.stringify(value));
  function fail(location, message) { throw new Error(location + ": " + message); }
  function object(value, location) {
    if (!value || typeof value !== "object" || Array.isArray(value)) fail(location, "Objekt erwartet.");
    return value;
  }
  function text(value, location, required, max) {
    if (value === undefined && !required) return "";
    if (typeof value !== "string" || (required && !value.trim()) || value.length > (max || 100000)) fail(location, "Gültigen Text" + (required ? " (nicht leer)" : "") + " angeben.");
    return value.trim();
  }
  function list(value, location, required, max) {
    if (value === undefined && !required) return [];
    if (!Array.isArray(value) || (required && !value.length) || value.length > (max || 1000)) fail(location, "Liste mit höchstens " + (max || 1000) + " Einträgen erwartet.");
    return value;
  }
  function number(value, location, max, halfPoint) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > max || (halfPoint && !Number.isInteger(value * 2))) fail(location, "Zahl zwischen 0 und " + max + (halfPoint ? " in Schritten von 0,5" : "") + " erwartet.");
    return value;
  }
  function unique(value, seen, location) {
    const id = text(value, location, true, 200);
    if (id !== value) fail(location, "IDs dürfen keine äußeren Leerzeichen enthalten.");
    if (seen.has(id)) fail(location, "ID doppelt: " + id);
    seen.add(id); return id;
  }
  function optionalBoolean(value, location) {
    if (value !== undefined && typeof value !== "boolean") fail(location, "true oder false erwartet.");
    return value === true;
  }
  function validate(raw) {
    const data = copy(object(raw, "Export"));
    if (data.format !== FORMAT || data.version !== 1) fail("Export", "Unterstützt wird format=ur-assistant.assessment mit version=1.");
    [data.exportId, data.source && data.source.appId, data.assessment && data.assessment.id].forEach((id, i) => {
      const loc = ["exportId", "source.appId", "assessment.id"][i];
      text(id, loc, true, 200);
      if (id !== id.trim()) fail(loc, "IDs dürfen keine äußeren Leerzeichen enthalten.");
    });
    if (typeof data.exportedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(data.exportedAt) || !Number.isFinite(Date.parse(data.exportedAt))) fail("exportedAt", "ISO-Zeitstempel mit Zeitzone erwartet.");
    object(data.source, "source");
    text(data.source.appId, "source.appId", true, 200);
    text(data.source.appName, "source.appName", true, 200);
    const a = object(data.assessment, "assessment");
    text(a.id, "assessment.id", true, 200); text(a.title, "assessment.title", true, 500);
    if (typeof a.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(a.date) || !Number.isFinite(Date.parse(a.date)) || new Date(a.date).toISOString().slice(0, 10) !== a.date) fail("assessment.date", "Reales Datum YYYY-MM-DD erwartet.");
    if (!["schriftliche", "sonstige"].includes(a.type)) fail("assessment.type", "schriftliche oder sonstige erwartet.");
    ["subject", "className", "instructions"].forEach(key => text(a[key], "assessment." + key, false));
    if (a.workingTimeMinutes !== undefined && (!Number.isInteger(a.workingTimeMinutes) || a.workingTimeMinutes < 0 || a.workingTimeMinutes > 525600)) fail("assessment.workingTimeMinutes", "Ganze Minuten zwischen 0 und 525600 erwartet.");
    const thresholds = new Set(), labels = new Set();
    list(a.gradingScale, "assessment.gradingScale", true, 30).forEach((stage, i) => {
      const loc = "gradingScale[" + i + "]"; object(stage, loc);
      unique(stage.label, labels, loc + ".label"); number(stage.minPercent, loc + ".minPercent", 100);
      if (thresholds.has(stage.minPercent)) fail(loc, "Prozentgrenze doppelt.");
      thresholds.add(stage.minPercent);
    });
    if (!thresholds.has(0)) fail("assessment.gradingScale", "Eine Stufe mit minPercent=0 ist erforderlich.");
    const taskIds = new Set(), subtaskIds = new Set(), subtasks = new Map();
    let totalMax = 0;
    list(a.tasks, "assessment.tasks", true, 200).forEach((task, ti) => {
      const loc = "tasks[" + ti + "]"; object(task, loc); unique(task.id, taskIds, loc + ".id"); text(task.title, loc + ".title", true, 500); text(task.text, loc + ".text", false);
      list(task.subtasks, loc + ".subtasks", true, 200).forEach((sub, si) => {
        const sl = loc + ".subtasks[" + si + "]"; object(sub, sl); unique(sub.id, subtaskIds, sl + ".id");
        text(sub.title, sl + ".title", true, 500); ["text", "expectedAnswer", "topics"].forEach(key => text(sub[key], sl + "." + key, false));
        number(sub.maxPoints, sl + ".maxPoints", 100000, true);
        optionalBoolean(sub.isAdditionalTask, sl + ".isAdditionalTask");
        if (sub.afb !== undefined && !["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].includes(sub.afb)) fail(sl + ".afb", "Ungültiger Anforderungsbereich.");
        const criteria = new Set();
        list(sub.criteria, sl + ".criteria", false, 200).forEach((criterion, ci) => {
          const cl = sl + ".criteria[" + ci + "]"; object(criterion, cl); unique(criterion.id, criteria, cl + ".id"); text(criterion.text, cl + ".text", true); number(criterion.maxPoints, cl + ".maxPoints", 100000, true);
        });
        if (criteria.size && sub.criteria.reduce((sum, c) => sum + c.maxPoints, 0) !== sub.maxPoints) fail(sl + ".criteria", "Kriterienpunkte müssen maxPoints der Teilaufgabe ergeben.");
        subtasks.set(sub.id, sub); if (!sub.isAdditionalTask) totalMax += sub.maxPoints;
      });
    });
    if (subtaskIds.size > 1000 || totalMax <= 0) fail("assessment.tasks", "Höchstens 1000 Teilaufgaben und positive reguläre Gesamtpunktzahl erforderlich.");
    const resultIds = new Set(), studentKeys = new Set();
    list(data.results, "results", true, 1000).forEach((result, ri) => {
      const loc = "results[" + ri + "]"; object(result, loc); unique(result.id, resultIds, loc + ".id"); object(result.student, loc + ".student");
      const student = result.student;
      ["externalId", "urStudentId", "firstName", "lastName", "displayName"].forEach(key => text(student[key], loc + ".student." + key, false, 500));
      if (![student.firstName, student.lastName, student.displayName, student.urStudentId].some(v => typeof v === "string" && v.trim())) fail(loc + ".student", "Name oder urStudentId fehlt.");
      ["externalId", "urStudentId"].forEach(key => { if (student[key]) unique(key + ":" + student[key], studentKeys, loc + ".student." + key); });
      if (!["present", "absent"].includes(result.status)) fail(loc + ".status", "present oder absent erwartet.");
      text(result.overallComment, loc + ".overallComment", false); text(result.gradeLabel, loc + ".gradeLabel", false, 200);
      if (result.gradeLabel && !labels.has(result.gradeLabel)) fail(loc + ".gradeLabel", "Gesamtnote muss im Notenschlüssel vorkommen.");
      const seen = new Set();
      list(result.subtaskResults, loc + ".subtaskResults", false, 1000).forEach((sr, si) => {
        const sl = loc + ".subtaskResults[" + si + "]"; object(sr, sl); unique(sr.subtaskId, seen, sl + ".subtaskId");
        const sub = subtasks.get(sr.subtaskId); if (!sub) fail(sl, "Unbekannte Teilaufgabe.");
        number(sr.points, sl + ".points", sub.maxPoints, true);
        ["comment", "answer", "gradeLabel"].forEach(key => text(sr[key], sl + "." + key, false));
        ["positiveNotes", "negativeNotes"].forEach(key => list(sr[key], sl + "." + key, false, 200).forEach((note, ni) => text(note, sl + "." + key + "[" + ni + "]", true)));
        const criterionIds = new Set();
        list(sr.criterionResults, sl + ".criterionResults", false, 200).forEach((cr, ci) => {
          const cl = sl + ".criterionResults[" + ci + "]"; object(cr, cl); unique(cr.criterionId, criterionIds, cl + ".criterionId");
          const criterion = (sub.criteria || []).find(c => c.id === cr.criterionId); if (!criterion) fail(cl, "Unbekanntes Kriterium.");
          number(cr.points, cl + ".points", criterion.maxPoints, true); text(cr.comment, cl + ".comment", false);
        });
        if (criterionIds.size && (criterionIds.size !== (sub.criteria || []).length || sr.criterionResults.reduce((sum, cr) => sum + cr.points, 0) !== sr.points)) fail(sl + ".criterionResults", "Alle Kriterien und eine mit points übereinstimmende Summe erforderlich.");
      });
      if (result.status === "present" && seen.size !== subtasks.size) fail(loc + ".subtaskResults", "Für jede Teilaufgabe genau ein Ergebnis angeben (auch 0 Punkte).");
      if (result.status === "absent" && (seen.size || result.gradeLabel)) fail(loc, "Abwesende dürfen keine Punkte oder Gesamtnote erhalten.");
    });
    const docIds = new Set(); let documentBytes = 0;
    list(a.documents, "assessment.documents", false, 100).forEach((doc, i) => {
      const loc = "documents[" + i + "]"; object(doc, loc); unique(doc.id, docIds, loc + ".id"); text(doc.fileName, loc + ".fileName", true, 200);
      if (!/^[^\\/\x00-\x1f]+\.(pdf|png|jpe?g)$/i.test(doc.fileName)) fail(loc + ".fileName", "Einfacher PDF-, PNG- oder JPEG-Dateiname ohne Pfad erwartet.");
      const ext = doc.fileName.split(".").pop().toLowerCase();
      if (doc.mimeType !== ({pdf:"application/pdf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg"})[ext]) fail(loc + ".mimeType", "MIME-Typ passt nicht zur Dateiendung.");
      if (!["question-paper", "rubric", "correction"].includes(doc.role)) fail(loc + ".role", "question-paper, rubric oder correction erwartet.");
      text(doc.studentRef, loc + ".studentRef", false, 200);
      if (doc.studentRef && !resultIds.has(doc.studentRef)) fail(loc + ".studentRef", "Unbekannte results[].id.");
      if (doc.role === "correction" && !doc.studentRef) fail(loc + ".studentRef", "Korrekturen müssen einer results[].id zugeordnet sein.");
      if (doc.role !== "correction" && doc.studentRef) fail(loc + ".studentRef", "Nur Korrekturen erhalten studentRef.");
      const b64 = doc.dataBase64;
      if (typeof b64 !== "string" || !b64.length || b64.length % 4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(b64)) fail(loc + ".dataBase64", "Standard-Base64 ohne Präfix oder Leerzeichen erwartet.");
      if (!b64.startsWith(({pdf:"JVBERi0",png:"iVBORw0KGgo",jpg:"/9j/",jpeg:"/9j/"})[ext])) fail(loc + ".dataBase64", "Dateisignatur passt nicht zum MIME-Typ.");
      documentBytes += b64.length * 3 / 4 - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);
    });
    if (documentBytes > 30 * 1024 * 1024) fail("documents", "Zusammen höchstens 30 MiB Dokumentdaten erlaubt.");
    return data;
  }
  function parse(content) {
    if (typeof content !== "string" || new TextEncoder().encode(content).length > MAX_BYTES) fail("Datei", "Höchstens 50 MiB UTF-8-JSON erlaubt.");
    let raw; try { raw = JSON.parse(content.replace(/^\uFEFF/, "")); } catch (_) { fail("Datei", "Kein gültiges JSON."); }
    return validate(raw);
  }
  function normalize(value) {
    return String(value || "").toLocaleLowerCase("de-DE").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  }
  function distance(a, b) {
    let row = Array.from({length:b.length + 1}, (_, i) => i);
    for (let i = 1; i <= a.length; i++) { const next = [i]; for (let j = 1; j <= b.length; j++) next[j] = Math.min(next[j - 1] + 1, row[j] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); row = next; }
    return row[b.length];
  }
  const sortedName = value => normalize(value).split(" ").filter(Boolean).sort().join(" ");
  function score(imported, student) {
    const structured = [imported.firstName, imported.lastName].filter(Boolean).join(" ");
    const name = imported.firstName && imported.lastName ? structured : imported.displayName || structured;
    const full = [student.firstName, student.lastName].filter(Boolean).join(" ");
    const a = sortedName(name), b = sortedName(full);
    if (!a || !b) return 0;
    if (a === b) return 1;
    const tokens = a.split(" "), fullTokens = b.split(" ");
    if (tokens.every(t => fullTokens.includes(t))) return 0.95;
    // A single typo in a sufficiently long first/last name is a suggestion;
    // short names and weak similarities never create a forced assignment.
    const similarity = (x, y) => 1 - distance(x, y) / Math.max(x.length, y.length, 1);
    if (tokens.length === 1) return Math.max(...fullTokens.map(t => Math.min(t.length, a.length) >= 4 ? similarity(a, t) * 0.94 : 0));
    const direct = normalize(name), reverse = normalize([student.lastName, student.firstName].filter(Boolean).join(" "));
    return Math.max(similarity(direct, normalize(full)), similarity(direct, reverse), similarity(a, b)) * 0.98;
  }
  function match(data, students) {
    const rows = data.results.filter(r => r.status === "present").map(result => {
      let candidates;
      if (result.student.urStudentId) {
        candidates = students.filter(s => s.id === result.student.urStudentId).map(s => ({studentId:s.id, score:1, reason:"App-ID"}));
      } else candidates = students.map(s => ({studentId:s.id,score:score(result.student,s),reason:"Name"})).filter(c => c.score >= 0.5).sort((a,b) => b.score - a.score || a.studentId.localeCompare(b.studentId));
      const best = candidates[0], next = candidates[1];
      return {resultId:result.id,studentId:"",candidates:candidates.slice(0,5),reason:!best ? "Keine sichere Zuordnung" : "Bitte zuordnen",ready:!!best && (best.reason === "App-ID" || (best.score >= 0.8 && (!next || best.score - next.score >= 0.12)))};
    });
    // Only uncontested, individually clear matches are automatic. No completion
    // by class size or by assigning remaining names to remaining pupils.
    rows.forEach(row => {
      const best = row.candidates[0]; if (!row.ready) return;
      const contested = rows.some(other => other !== row && other.candidates[0] && other.candidates[0].studentId === best.studentId && other.candidates[0].score >= best.score - 0.12);
      if (!contested) { row.studentId = best.studentId; row.reason = best.reason === "App-ID" ? "App-ID" : best.score === 1 ? "Name eindeutig" : "Name ähnlich / unvollständig"; }
      else row.reason = "Mehrfach beansprucht – bitte prüfen";
    });
    return rows;
  }
  function importInto(snapshot, raw, classId, assignments, now, idFactory) {
    const data = validate(raw), a = data.assessment;
    const cls = (snapshot.classes || []).find(c => c.id === classId);
    if (!cls) fail("Lerngruppe", "Nicht mehr vorhanden.");
    if ((snapshot.plannedEvaluations || []).some(p => p.classId === classId && p.importSource && p.importSource.appId === data.source.appId && p.importSource.assessmentId === a.id)) fail("Import", "Diese Bewertung wurde für die Lerngruppe bereits importiert. Vorhandene Bewertung bearbeiten oder löschen.");
    const validStudents = new Set((snapshot.students || []).filter(s => (cls.studentIds || []).includes(s.id)).map(s => s.id));
    const presentResults = new Set(data.results.filter(r => r.status === "present").map(r => r.id));
    const picked = new Set();
    const selected = assignments.filter(row => {
      if (!presentResults.has(row.resultId)) fail("Zuordnung", "Unbekanntes oder abwesendes Ergebnis.");
      if (!row.studentId) { if (row.excluded !== true) fail("Zuordnung", "Jeden offenen Namen zuordnen oder ausdrücklich auslassen."); return false; }
      if (!validStudents.has(row.studentId) || picked.has(row.studentId)) fail("Zuordnung", "Schüler außerhalb der Lerngruppe oder doppelt ausgewählt.");
      picked.add(row.studentId); return true;
    });
    if (new Set(assignments.map(row => row.resultId)).size !== assignments.length || assignments.length !== presentResults.size || !selected.length) fail("Zuordnung", "Für jedes anwesende Ergebnis genau eine Entscheidung und mindestens eine Zuordnung erforderlich.");
    const newId = idFactory || (prefix => prefix + "-" + window.crypto.randomUUID());
    const sheetId = newId("evaluation-sheet"), plannedId = newId("planned-evaluation");
    const subIds = new Map();
    const sheet = {id:sheetId,classId:classId,type:"aufgabenbogen",title:a.title,createdAt:now,workingTimeMinutes:a.workingTimeMinutes || 0,instructions:a.instructions || "",documents:copy(a.documents || []).filter(d => !d.studentRef || selected.some(row => row.resultId === d.studentRef)),taskSheet:{tasks:a.tasks.map(task => ({id:newId("evaluation-task"),title:task.title,text:task.text || "",subtasks:task.subtasks.map(sub => {
      const id = newId("evaluation-subtask"); subIds.set(sub.id,id);
      return {id:id,title:sub.title,text:sub.text || "",expectedAnswer:sub.expectedAnswer || "",criteria:copy(sub.criteria || []),be:sub.maxPoints,isAdditionalTask:!!sub.isAdditionalTask,topics:sub.topics || "",afb:sub.afb || "",competencyAspectIds:[],curriculumTopicNodeIds:[]};
    })}))}};
    const planned = {id:plannedId,classId:classId,type:a.type,evaluationSheetId:sheetId,date:a.date,studentIds:selected.map(row => row.studentId),createPlanningEvent:false,planningEventId:"",createdAt:now,gradingSystem:a.gradingScale.map(stage => ({id:newId("grading-stage"),label:stage.label,minPercent:stage.minPercent})),importSource:{appId:data.source.appId,appName:data.source.appName,assessmentId:a.id,exportId:data.exportId,exportedAt:data.exportedAt,importedAt:now}};
    const performed = selected.map(row => {
      const r = data.results.find(result => result.id === row.resultId);
      return {id:newId("performed-evaluation"),plannedEvaluationId:plannedId,classId:classId,studentId:row.studentId,evaluationSheetId:sheetId,sourceResultId:r.id,sourceStudent:copy(r.student),gradeLabel:r.gradeLabel || "",subtaskResults:r.subtaskResults.map(sr => ({subtaskId:subIds.get(sr.subtaskId),points:sr.points,gradeLabel:sr.gradeLabel || "",answer:sr.answer || "",criterionResults:copy(sr.criterionResults || []),positiveNotes:copy(sr.positiveNotes || []),negativeNotes:copy(sr.negativeNotes || []),generalNote:sr.comment || ""})),overallNote:r.overallComment || "",isCompleted:true,completedAt:now,createdAt:now,updatedAt:now};
    });
    // Assemble a new snapshot; validation failures never mutate the caller.
    return {snapshot:Object.assign({}, snapshot, {evaluationSheets:[sheet].concat(snapshot.evaluationSheets || []),plannedEvaluations:(snapshot.plannedEvaluations || []).concat(planned),performedEvaluations:(snapshot.performedEvaluations || []).concat(performed),activeEvaluationSheetId:sheetId}),sheet:sheet,planned:planned,performed:performed};
  }
  ns.features.evaluation.assessmentImport = {FORMAT:FORMAT,MAX_BYTES:MAX_BYTES,parse:parse,validate:validate,normalize:normalize,score:score,match:match,importInto:importInto};
}());

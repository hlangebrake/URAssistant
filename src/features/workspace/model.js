(function () {
  const ns = window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  ns.features = ns.features || {};
  ns.features.workspace = ns.features.workspace || {};
  const list = value => Array.isArray(value) ? value : [];
  const clean = value => String(value == null ? "" : value).trim();
  const localDate = value => {
    const date = value instanceof Date ? value : new Date(value == null ? Date.now() : value);
    return Number.isNaN(date.getTime()) ? "" : [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  };
  function validDate(value) {
    const text = clean(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
    return localDate(new Date(text + "T12:00:00")) === text;
  }
  function addDays(value, amount) {
    const date = new Date(value + "T12:00:00");
    date.setDate(date.getDate() + amount);
    return localDate(date);
  }
  function className(snapshot, id) {
    const entry = list(snapshot.classes).find(item => item.id === id);
    return entry ? [entry.name, entry.subject].filter(Boolean).join(" · ") : "Ohne Lerngruppe";
  }
  function studentName(snapshot, id) {
    const entry = list(snapshot.students).find(item => item.id === id);
    return entry ? [entry.firstName, entry.lastName].filter(Boolean).join(" ") : "";
  }
  function ensureClass(snapshot, classId, studentId) {
    const entry = list(snapshot.classes).find(item => item.id === classId);
    if (!entry) throw new Error("Bitte eine vorhandene Lerngruppe wählen.");
    if (studentId && !list(entry.studentIds).includes(studentId)) throw new Error("Die Person gehört nicht zu dieser Lerngruppe.");
    return entry;
  }
  function newTask(snapshot, title, classId, dueDate, description, id, now) {
    const task = { id, title, description: description || "", category: classId ? className(snapshot, classId).replace(" · ", " ") : "", relatedClassId: classId || "", dueDate: dueDate || "", priority: "standard", type: "standard", done: false, completedAt: "", taskStatus: "backlog", createdAt: now, updatedAt: now, assignedStudentIds: [], assignedStudentStatuses: [], checklistItems: [], history: [], protocol: [] };
    snapshot.todos = list(snapshot.todos);
    snapshot.todos.push(task);
    return task;
  }
  function taskProtocol(task, text, now) {
    task.protocol = list(task.protocol).concat([{ id: task.id + "-workspace-" + now + "-" + list(task.protocol).length, taskId: task.id, timestamp: now, text }]);
  }
  function setTaskCompletion(task, done, now) {
    task.done = done;
    task.taskStatus = done ? "done" : "planned";
    task.completedAt = done ? now : "";
    task.updatedAt = now;
    task.assignedStudentStatuses = list(task.assignedStudentIds).map(studentId => {
      const previous = list(task.assignedStudentStatuses).find(item => item.studentId === studentId) || {};
      return Object.assign({}, previous, { studentId, done, completedAt: done ? now : "", checklistItems: list(previous.checklistItems) });
    });
  }
  function syncActionTask(snapshot, action, task, now) {
    task.title = action.title;
    task.relatedClassId = action.classId;
    task.category = className(snapshot, action.classId).replace(" · ", " ");
    task.dueDate = action.dueDate;
    task.description = [studentName(snapshot, action.studentId), action.sourceText ? "Ausgangspunkt: " + action.sourceText : "", "Wirkung in der Übersicht überprüfen."].filter(Boolean).join("\n");
    task.assignedStudentIds = action.studentId ? [action.studentId] : [];
    task.assignedStudentStatuses = task.assignedStudentIds.map(studentId => {
      const previous = list(task.assignedStudentStatuses).find(item => item.studentId === studentId) || {};
      return Object.assign({}, previous, { studentId, done: Boolean(task.done), completedAt: task.done ? task.completedAt || now : "", checklistItems: list(previous.checklistItems) });
    });
    task.updatedAt = now;
  }
  function saveAction(snapshot, draft, now, newId) {
    const existing = draft.id ? list(snapshot.learningActions).find(item => item.id === draft.id) : null;
    if (draft.id && !existing) throw new Error("Die Maßnahme ist nicht mehr verfügbar.");
    if (existing && ["reviewed", "cancelled"].includes(existing.status)) throw new Error("Eine abgeschlossene oder abgebrochene Maßnahme kann nicht nachträglich geändert werden.");
    const classId = clean(draft.classId), studentId = clean(draft.studentId), title = clean(draft.title), dueDate = clean(draft.dueDate);
    ensureClass(snapshot, classId, studentId);
    if (!title) throw new Error("Bitte einen nächsten Schritt eintragen.");
    if (!validDate(dueDate)) throw new Error("Bitte einen gültigen Termin zur Überprüfung wählen.");
    const source = list(snapshot.knowledgeGapRecords).find(item => item.id === draft.sourceId && item.classId === classId && (!studentId || item.studentId === studentId));
    if (existing && (classId !== existing.classId || studentId !== existing.studentId || clean(draft.sourceId) !== clean(existing.sourceId))) throw new Error("Der Beobachtungsbezug einer bestehenden Maßnahme kann nicht geändert werden.");
    if (source && studentId !== clean(source.studentId)) throw new Error("Die Maßnahme muss zur Person der Beobachtung gehören.");
    if (draft.sourceId && !source && !(existing && existing.sourceId === draft.sourceId)) throw new Error("Die ursprüngliche Beobachtung ist nicht mehr verfügbar.");
    const action = existing || { id: newId("action"), classId, studentId, sourceId: source ? source.id : "", sourceText: source ? clean(source.content) : clean(draft.sourceText), todoId: "", status: "open", outcome: "", createdAt: now, reviewedAt: "" };
    if (existing && (existing.title !== title || existing.dueDate !== dueDate || (!existing.sourceId && existing.sourceText !== clean(draft.sourceText)))) {
      action.changes = list(action.changes).concat([{ date: now, before: { title: action.title, dueDate: action.dueDate, sourceText: action.sourceText }, after: { title, dueDate, sourceText: action.sourceId ? action.sourceText : clean(draft.sourceText) } }]);
    }
    Object.assign(action, { title, dueDate, updatedAt: now });
    if (!action.sourceId) action.sourceText = clean(draft.sourceText);
    let task = list(snapshot.todos).find(item => item.id === action.todoId);
    if (!task) task = newTask(snapshot, title, classId, dueDate, "", newId("todo"), now);
    action.todoId = task.id;
    syncActionTask(snapshot, action, task, now);
    snapshot.learningActions = list(snapshot.learningActions);
    if (!existing) snapshot.learningActions.push(action);
    return action;
  }
  function reviewAction(snapshot, id, outcome, decision, nextDate, now) {
    const action = list(snapshot.learningActions).find(item => item.id === id);
    if (!action) throw new Error("Die Maßnahme ist nicht mehr verfügbar.");
    if (action.status === "cancelled") throw new Error("Die Maßnahme wurde abgebrochen. Ihr Verlauf bleibt erhalten.");
    if (!clean(outcome)) throw new Error("Bitte das Ergebnis der Überprüfung kurz festhalten.");
    if (decision !== "reviewed" && decision !== "continue") throw new Error("Bitte eine Entscheidung wählen.");
    if (decision === "continue" && !validDate(nextDate)) throw new Error("Bitte einen neuen Überprüfungstermin wählen.");
    action.reviews = list(action.reviews).concat([{ date: now, outcome: clean(outcome), decision }]);
    action.outcome = clean(outcome); action.updatedAt = now;
    action.status = decision === "reviewed" ? "reviewed" : "open";
    action.reviewedAt = decision === "reviewed" ? now : "";
    if (decision === "continue") action.dueDate = nextDate;
    const task = list(snapshot.todos).find(item => item.id === action.todoId);
    if (task) {
      syncActionTask(snapshot, action, task, now);
      setTaskCompletion(task, decision === "reviewed", now);
      if (!task.done) task.dueDate = nextDate;
      taskProtocol(task, "Wirkung überprüft: " + clean(outcome) + (decision === "continue" ? " · erneute Überprüfung am " + nextDate : " · abgeschlossen"), now);
    }
    return action;
  }
  function cancelAction(snapshot, id, reason, now) {
    const action = list(snapshot.learningActions).find(item => item.id === id);
    if (!action) throw new Error("Die Maßnahme ist nicht mehr verfügbar.");
    if (action.status === "cancelled") return action;
    if (action.status === "reviewed") throw new Error("Diese Maßnahme wurde bereits überprüft und abgeschlossen.");
    action.status = "cancelled";
    action.cancelledAt = now;
    action.cancellationReason = clean(reason);
    action.updatedAt = now;
    const task = list(snapshot.todos).find(item => item.id === action.todoId);
    if (task) {
      syncActionTask(snapshot, action, task, now);
      setTaskCompletion(task, true, now);
      taskProtocol(task, "Maßnahme abgebrochen" + (action.cancellationReason ? ": " + action.cancellationReason : ".") + " Keine Wirkungsüberprüfung durchgeführt.", now);
    }
    return action;
  }
  function saveReflection(snapshot, draft, now, newId) {
    ensureClass(snapshot, draft.classId);
    if (!validDate(draft.lessonDate)) throw new Error("Bitte ein gültiges Unterrichtsdatum wählen.");
    if (!clean(draft.summary) && !clean(draft.remaining) && !clean(draft.nextStep)) throw new Error("Bitte Ergebnis, offene Punkte oder nächsten Schritt festhalten.");
    if (clean(draft.nextStep) && !validDate(draft.followUpDate)) throw new Error("Bitte einen Termin für den nächsten Schritt wählen.");
    const entries = list(snapshot.lessonReflections);
    const key = [draft.classId, draft.lessonDate, clean(draft.lessonId), clean(draft.lessonPlanId)].join("::");
    let entry = entries.find(item => item.contextKey === key);
    const previousTask = entry && list(snapshot.todos).find(item => item.id === entry.todoId);
    const previousTaskDone = previousTask && (previousTask.done || previousTask.taskStatus === "done");
    const nextStep = clean(draft.nextStep);
    if (previousTask && !previousTaskDone && !nextStep && draft.cancelNextStep !== true && draft.cancelNextStep !== "on") throw new Error("Bitte bestätigen, dass die offene Folgeaufgabe abgebrochen werden soll, oder den nächsten Schritt beibehalten.");
    const changedCompletedStep = previousTaskDone && nextStep && (nextStep !== clean(previousTask.title) || clean(draft.followUpDate) !== clean(previousTask.dueDate));
    if (!entry) { entry = { id: newId("reflection"), contextKey: key, completedAt: now, todoId: "" }; entries.push(entry); }
    if (previousTask && (!nextStep || changedCompletedStep)) {
      entry.previousTodoIds = Array.from(new Set(list(entry.previousTodoIds).concat(previousTask.id)));
      if (!nextStep && !previousTaskDone) {
        setTaskCompletion(previousTask, true, now);
        taskProtocol(previousTask, "Folgeaufgabe im Stundenabschluss ausdrücklich abgebrochen.", now);
      }
      entry.todoId = "";
    }
    Object.assign(entry, { classId: draft.classId, lessonDate: draft.lessonDate, lessonId: clean(draft.lessonId), lessonPlanId: clean(draft.lessonPlanId), topic: clean(draft.topic), summary: clean(draft.summary), remaining: clean(draft.remaining), nextStep: clean(draft.nextStep), followUpDate: clean(draft.nextStep) ? draft.followUpDate : "", updatedAt: now });
    if (entry.nextStep) {
      let task = list(snapshot.todos).find(item => item.id === entry.todoId);
      if (!task) { task = newTask(snapshot, entry.nextStep, entry.classId, entry.followUpDate, "Aus dem Stundenabschluss vom " + entry.lessonDate + ": " + (entry.topic || "Unterricht"), newId("todo"), now); entry.todoId = task.id; }
      else { task.title = entry.nextStep; task.dueDate = entry.followUpDate; task.updatedAt = now; }
    }
    snapshot.lessonReflections = entries;
    return entry;
  }
  function safeUrl(value) {
    try { const url = new URL(clean(value)); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; } catch (_) { return ""; }
  }
  function saveResource(snapshot, draft, now, newId) {
    const lesson = list(snapshot.curriculumLessonPlans).find(item => item.id === draft.lessonPlanId);
    if (!lesson) throw new Error("Bitte eine geplante Stunde wählen.");
    ensureClass(snapshot, draft.classId);
    const sequence = list(snapshot.curriculumSequences).find(item => item.id === lesson.sequenceId);
    const series = sequence && list(snapshot.curriculumSeries).find(item => item.id === sequence.seriesId);
    if (!series || series.classId !== draft.classId) throw new Error("Die Stunde gehört nicht zu dieser Lerngruppe.");
    const url = safeUrl(draft.url);
    if (!url) throw new Error("Bitte einen vollständigen http- oder https-Link eingeben.");
    if (!clean(draft.title)) throw new Error("Bitte das Material benennen.");
    const existing = draft.id ? list(snapshot.lessonResources).find(item => item.id === draft.id) : null;
    if (draft.id && !existing) throw new Error("Der Materiallink ist nicht mehr verfügbar.");
    if (existing && (existing.classId !== draft.classId || existing.lessonPlanId !== lesson.id)) throw new Error("Die Zuordnung eines bestehenden Materiallinks kann hier nicht geändert werden.");
    const entry = Object.assign(existing || {}, { id: existing ? existing.id : newId("resource"), classId: draft.classId, lessonPlanId: lesson.id, title: clean(draft.title), url, kind: ["material", "solution", "presentation"].includes(draft.kind) ? draft.kind : "material", status: ["ready", "print", "prepare"].includes(draft.status) ? draft.status : "ready", createdAt: existing ? existing.createdAt : now, updatedAt: now });
    snapshot.lessonResources = list(snapshot.lessonResources);
    if (!existing) snapshot.lessonResources.push(entry);
    return entry;
  }
  function removeResource(snapshot, id) {
    const entry = list(snapshot.lessonResources).find(item => item.id === id);
    if (!entry) throw new Error("Der Materiallink ist nicht mehr verfügbar.");
    snapshot.lessonResources = list(snapshot.lessonResources).filter(item => item.id !== id);
    return entry;
  }
  function search(snapshot, query) {
    const needle = clean(query).toLocaleLowerCase("de");
    if (needle.length < 2) return [];
    const matches = (text) => clean(text).toLocaleLowerCase("de").includes(needle);
    const results = [];
    list(snapshot.classes).forEach(item => { if (matches(className(snapshot, item.id))) results.push({ type: "class", id: item.id, classId: item.id, title: className(snapshot, item.id), detail: "Lerngruppe" }); });
    list(snapshot.students).forEach(item => { if (matches(studentName(snapshot, item.id))) list(snapshot.classes).filter(group => list(group.studentIds).includes(item.id)).forEach(group => results.push({ type: "student", id: item.id, classId: group.id, title: studentName(snapshot, item.id), detail: className(snapshot, group.id) })); });
    list(snapshot.todos).forEach(item => { if (matches(item.title + " " + (item.description || ""))) results.push({ type: "task", id: item.id, classId: item.relatedClassId, title: item.title, detail: item.done ? "Erledigte Aufgabe" : "Aufgabe" }); });
    list(snapshot.curriculumLessonPlans).forEach(item => {
      if (!matches(item.topic + " " + (item.summary || ""))) return;
      const sequence = list(snapshot.curriculumSequences).find(entry => entry.id === item.sequenceId);
      const series = sequence && list(snapshot.curriculumSeries).find(entry => entry.id === sequence.seriesId);
      if (series) results.push({ type: "lesson", id: item.id, classId: series.classId, title: item.topic || "Unterrichtsstunde", detail: className(snapshot, series.classId) });
    });
    list(snapshot.lessonResources).forEach(item => { if (matches(item.title)) results.push({ type: "resource", id: item.lessonPlanId, classId: item.classId, title: item.title, detail: "Material · " + className(snapshot, item.classId) }); });
    return results.slice(0, 35);
  }
  ns.features.workspace.model = { list, clean, localDate, validDate, addDays, className, studentName, newTask, saveAction, reviewAction, cancelAction, saveReflection, safeUrl, saveResource, removeResource, search };
}());

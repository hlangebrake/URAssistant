(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.features = window.Unterrichtsassistent.features || {};
  window.Unterrichtsassistent.features.tasks = window.Unterrichtsassistent.features.tasks || {};

  const statuses = Object.freeze([
    { id: "backlog", label: "Backlog" },
    { id: "in-progress", label: "In Bearbeitung" },
    { id: "waiting", label: "Wartet auf Rückmeldung" },
    { id: "planned", label: "Geplant" },
    { id: "done", label: "Erledigt" }
  ]);
  const priorities = Object.freeze([
    { id: "hoch", label: "Hoch", rank: 0 },
    { id: "standard", label: "Standard", rank: 1 },
    { id: "niedrig", label: "Niedrig", rank: 2 }
  ]);
  const deadlineThresholds = Object.freeze({ urgent: 3, warning: 7, notice: 14 });
  const taskFields = ["taskStatus", "categoryId", "createdAt", "updatedAt", "responsiblePersonId", "participantPersonIds", "waitingForPersonId", "waitingSince", "history", "protocol"];
  const editableFields = ["title", "description", "category", "categoryId", "taskStatus", "dueDate", "priority", "responsiblePersonId", "participantPersonIds", "waitingForPersonId", "waitingSince"];

  function clean(value) { return String(value === undefined || value === null ? "" : value).trim(); }
  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function idList(value) { return Array.from(new Set((Array.isArray(value) ? value : []).map(clean).filter(Boolean))); }
  function createId(prefix) { return (prefix || "todo") + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000000); }
  function timestamp(value) {
    const date = new Date(clean(value));
    return clean(value) && !Number.isNaN(date.getTime()) ? date.toISOString() : "";
  }
  function now(value) { return timestamp(value) || new Date().toISOString(); }
  function localDate(value) {
    const date = value instanceof Date ? value : new Date(value === undefined ? Date.now() : value);
    if (Number.isNaN(date.getTime())) { return ""; }
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }
  function validDate(value) {
    const text = clean(value).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) { return ""; }
    const parts = text.split("-").map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return date.getUTCFullYear() === parts[0] && date.getUTCMonth() === parts[1] - 1 && date.getUTCDate() === parts[2] ? text : "";
  }
  function dayNumber(value) {
    const date = validDate(value);
    if (!date) { return null; }
    const parts = date.split("-").map(Number);
    return Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000;
  }
  function getStatus(taskOrId) {
    const value = taskOrId && typeof taskOrId === "object" ? clean(taskOrId.taskStatus) : clean(taskOrId);
    return statuses.find(function (status) { return status.id === value; })
      || statuses[taskOrId && typeof taskOrId === "object" && taskOrId.done ? 4 : 0];
  }
  function getPriority(taskOrId) {
    const value = taskOrId && typeof taskOrId === "object" ? taskOrId.priority : taskOrId;
    return priorities.find(function (priority) { return priority.id === clean(value); }) || priorities[2];
  }
  function inferCreatedAt(task) {
    const match = /^todo-(\d{13})-\d+$/.exec(clean(task && task.id));
    if (!match) { return ""; }
    const value = Number(match[1]);
    return value >= Date.UTC(2000, 0, 1) && value <= Date.now() + 86400000 ? new Date(value).toISOString() : "";
  }
  function normalizeLogs(entries, taskId, kind) {
    const seen = new Set();
    return (Array.isArray(entries) ? entries : []).filter(function (entry) { return entry && typeof entry === "object"; }).map(function (entry, index) {
      const result = clone(entry);
      result.id = clean(entry.id) || taskId + "-" + kind + "-" + index;
      result.taskId = taskId;
      result.timestamp = timestamp(entry.timestamp);
      if (kind === "protocol") { result.text = clean(entry.text); }
      else { result.eventType = clean(entry.eventType); }
      return result;
    }).filter(function (entry) {
      if (seen.has(entry.id) || (kind === "protocol" && !entry.text)) { return false; }
      seen.add(entry.id);
      return true;
    });
  }
  function getCategory(task, snapshot) {
    const source = task || {};
    const categories = Array.isArray(snapshot && snapshot.planningCategories) ? snapshot.planningCategories : [];
    const categoryId = clean(source.categoryId);
    const entry = categoryId
      ? categories.find(function (category) { return clean(category.id) === categoryId; })
      : categories.find(function (category) { return clean(category.name).toLowerCase() === clean(source.category).toLowerCase(); });
    const name = clean(entry && entry.name) || clean(source.category);
    const feature = window.Unterrichtsassistent.features.planning && window.Unterrichtsassistent.features.planning.categories;
    const schoolDisplay = window.Unterrichtsassistent.features.school && window.Unterrichtsassistent.features.school.display;
    const createPastelColor = window.Unterrichtsassistent.data && window.Unterrichtsassistent.data.createPastelColor;
    const categoryOptions = {
      createPastelColor: createPastelColor,
      getClassColor: function (schoolClass) {
        return schoolDisplay ? schoolDisplay.getClassDisplayColor(schoolClass, { createPastelColor: createPastelColor }) : (schoolClass.displayColor || "#d9d4cb");
      }
    };
    const definition = !entry && feature ? feature.getDefaultDefinition(snapshot || {}, name) : null;
    const legacyCategory = !entry && !definition && (Array.isArray(snapshot && snapshot.planningEvents) ? snapshot.planningEvents : []).some(function (event) {
      return clean(event.category).toLowerCase() === name.toLowerCase();
    });
    return {
      id: clean(entry && entry.id) || categoryId,
      name: name || "Ohne Aufgabenbereich",
      color: feature ? feature.getColor(snapshot || {}, name, categoryOptions) : (/^#[0-9a-f]{6}$/i.test(clean(entry && entry.color)) ? entry.color : "#d9d4cb"),
      missing: Boolean(categoryId && !entry) || Boolean(name && !entry && !definition && !legacyCategory)
    };
  }
  function getPersonName(snapshot, personId) {
    if (!clean(personId)) { return ""; }
    const entry = (Array.isArray(snapshot && snapshot.taskPeople) ? snapshot.taskPeople : []).find(function (person) { return clean(person.id) === clean(personId); });
    return clean(entry && entry.name) || "Nicht mehr verfügbare Person";
  }
  function normalizeTask(task, snapshot) {
    const source = task && typeof task === "object" ? task : {};
    const result = Object.assign({}, source);
    result.id = clean(source.id);
    result.title = clean(source.title);
    result.description = clean(source.description);
    result.category = clean(source.category);
    result.categoryId = clean(source.categoryId);
    if (snapshot) {
      const category = getCategory(result, snapshot);
      if (category.id) { result.categoryId = category.id; }
      if (!category.missing && (result.category || result.categoryId)) { result.category = category.name; }
    }
    result.taskStatus = getStatus(source).id;
    result.priority = getPriority(source).id;
    result.dueDate = validDate(source.dueDate);
    result.createdAt = timestamp(source.createdAt) || inferCreatedAt(source);
    result.updatedAt = timestamp(source.updatedAt) || result.createdAt;
    result.done = result.taskStatus === "done";
    result.completedAt = result.done ? timestamp(source.completedAt) : "";
    result.responsiblePersonId = clean(source.responsiblePersonId);
    result.participantPersonIds = idList(source.participantPersonIds);
    result.waitingForPersonId = clean(source.waitingForPersonId);
    result.waitingSince = timestamp(source.waitingSince);
    result.history = normalizeLogs(source.history, result.id, "history");
    result.protocol = normalizeLogs(source.protocol, result.id, "protocol");
    if (!result.history.length && result.id) {
      result.history.push({ id: result.id + "-created", taskId: result.id, timestamp: result.createdAt, eventType: "created", oldValue: null, newValue: null, inferred: !timestamp(source.createdAt), unknownTimestamp: !result.createdAt });
    }
    return result;
  }
  function mergeTaskLogs(target, other) {
    ["history", "protocol"].forEach(function (field) {
      const entries = normalizeLogs(target && target[field], clean(target && target.id), field);
      const seen = new Set(entries.map(function (entry) { return entry.id; }));
      normalizeLogs(other && other[field], clean(target && target.id), field).forEach(function (entry) {
        if (!seen.has(entry.id)) { entries.push(entry); seen.add(entry.id); }
      });
      target[field] = entries;
    });
    return target;
  }
  function peopleValue(task) {
    return { responsiblePersonId: clean(task.responsiblePersonId), participantPersonIds: idList(task.participantPersonIds).sort(), waitingForPersonId: clean(task.waitingForPersonId) };
  }
  function peopleLabel(value, snapshot) {
    const parts = [];
    if (value.responsiblePersonId) { parts.push("Verantwortlich: " + getPersonName(snapshot, value.responsiblePersonId)); }
    if (value.participantPersonIds.length) { parts.push("Beteiligt: " + value.participantPersonIds.map(function (id) { return getPersonName(snapshot, id); }).join(", ")); }
    if (value.waitingForPersonId) { parts.push("Rückmeldung von: " + getPersonName(snapshot, value.waitingForPersonId)); }
    return parts.join(" · ") || "Keine Personen zugeordnet";
  }
  function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
  function appendEvent(task, previous, eventType, oldValue, newValue, time, meta) {
    if (same(oldValue, newValue)) { return; }
    const previousIds = new Set((previous.history || []).map(function (entry) { return entry.id; }));
    const alreadyRecorded = task.history.some(function (entry) {
      return !previousIds.has(entry.id) && entry.eventType === eventType && same(entry.oldValue, oldValue) && same(entry.newValue, newValue);
    });
    if (!alreadyRecorded) {
      task.history.push({ id: createId("task-history"), taskId: task.id, timestamp: time, eventType: eventType, oldValue: clone(oldValue), newValue: clone(newValue), meta: meta || {} });
    }
  }
  function auditChanges(next, previous, snapshot, time) {
    appendEvent(next, previous, "status", previous.taskStatus, next.taskStatus, time);
    appendEvent(next, previous, "deadline", previous.dueDate, next.dueDate, time);
    appendEvent(next, previous, "category", { id: previous.categoryId, name: previous.category }, { id: next.categoryId, name: next.category }, time);
    const oldPeople = peopleValue(previous);
    const newPeople = peopleValue(next);
    appendEvent(next, previous, "people", oldPeople, newPeople, time, { oldLabel: peopleLabel(oldPeople, snapshot), newLabel: peopleLabel(newPeople, snapshot) });
    appendEvent(next, previous, "priority", previous.priority, next.priority, time);
    const changed = editableFields.some(function (field) { return !same(next[field], previous[field]); })
      || next.done !== previous.done || next.protocol.length !== previous.protocol.length || next.history.length !== previous.history.length
      || !same(next.checklistItems, previous.checklistItems) || !same(next.assignedStudentStatuses, previous.assignedStudentStatuses);
    if (changed) { next.updatedAt = time; }
    return next;
  }
  function applyTransitions(task, previous, time, preserveWaitingSince) {
    if (task.taskStatus !== previous.taskStatus) {
      if (task.taskStatus === "waiting" && !(preserveWaitingSince && task.waitingSince)) { task.waitingSince = time; }
      if (task.taskStatus === "done") { task.completedAt = time; }
    }
    task.done = task.taskStatus === "done";
    if (!task.done) { task.completedAt = ""; }
    return task;
  }
  function createTask(values, snapshot, timeValue) {
    const time = now(timeValue);
    const source = Object.assign({ id: createId("todo"), priority: "standard", type: "standard", assignedStudentIds: [], assignedStudentStatuses: [], checklistItems: [] }, values || {}, { createdAt: time, updatedAt: time, history: [], protocol: [] });
    source.id = clean(source.id) || createId("todo");
    const task = normalizeTask(source, snapshot);
    if (task.taskStatus === "waiting") { task.waitingSince = task.waitingSince || time; }
    if (task.taskStatus === "done") { task.completedAt = task.completedAt || time; }
    return task;
  }
  function updateTask(task, patch, snapshot, timeValue) {
    const time = now(timeValue);
    const previous = normalizeTask(task, snapshot);
    const next = Object.assign({}, previous);
    editableFields.forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(patch || {}, field)) { next[field] = clone(patch[field]); }
    });
    if (Object.prototype.hasOwnProperty.call(patch || {}, "category") && !Object.prototype.hasOwnProperty.call(patch || {}, "categoryId") && clean(patch.category) !== previous.category) { next.categoryId = ""; }
    const normalized = normalizeTask(next, snapshot);
    applyTransitions(normalized, previous, time, Object.prototype.hasOwnProperty.call(patch || {}, "waitingSince"));
    return auditChanges(normalized, previous, snapshot, time);
  }
  function addProtocolEntry(task, text, timeValue) {
    const next = normalizeTask(task);
    const content = clean(text);
    if (!content) { return next; }
    const time = now(timeValue);
    next.protocol.push({ id: createId("task-protocol"), taskId: next.id, timestamp: time, text: content });
    next.updatedAt = time;
    return next;
  }
  // next may contain mutations from the original TODO forms. previous must be an independent snapshot.
  function reconcileSnapshot(next, previous, timeValue) {
    if (!next || typeof next !== "object") { return next; }
    const time = now(timeValue);
    const previousById = new Map((Array.isArray(previous && previous.todos) ? previous.todos : []).map(function (task) { return [clean(task.id), task]; }));
    next.taskPeople = (Array.isArray(next.taskPeople) ? next.taskPeople : (Array.isArray(previous && previous.taskPeople) ? previous.taskPeople : [])).map(function (person) {
      return { id: clean(person && person.id), name: clean(person && person.name) };
    }).filter(function (person) { return person.id && person.name; });
    next.todos = (Array.isArray(next.todos) ? next.todos : []).map(function (source) {
      const oldSource = previousById.get(clean(source && source.id));
      const candidate = Object.assign({}, source);
      if (!oldSource) { return normalizeTask(candidate, next); }
      taskFields.forEach(function (field) {
        if (!Object.prototype.hasOwnProperty.call(candidate, field)) { candidate[field] = clone(oldSource[field]); }
      });
      const oldTask = normalizeTask(oldSource);
      const explicitStatusChange = clean(candidate.taskStatus) !== oldTask.taskStatus && statuses.some(function (entry) { return entry.id === clean(candidate.taskStatus); });
      if (!explicitStatusChange && Boolean(candidate.done) !== oldTask.done) { candidate.taskStatus = candidate.done ? "done" : "backlog"; }
      if (clean(candidate.category) !== oldTask.category && clean(candidate.categoryId) === oldTask.categoryId) {
        const categoryWithId = (next.planningCategories || []).find(function (category) { return clean(category.id) === oldTask.categoryId; });
        // Existing category deletion/change flows write the name; entity renames keep the matching ID.
        if (!categoryWithId || clean(categoryWithId.name) !== clean(candidate.category)) { candidate.categoryId = ""; }
      }
      const normalized = normalizeTask(candidate, next);
      mergeTaskLogs(normalized, oldTask);
      applyTransitions(normalized, oldTask, time);
      // updateTask has already set the transition time. Keep that exact time on reconciliation.
      if (explicitStatusChange && (candidate.history || []).some(function (entry) {
        return entry.eventType === "status" && entry.oldValue === oldTask.taskStatus && entry.newValue === normalized.taskStatus
          && !(oldTask.history || []).some(function (oldEntry) { return oldEntry.id === entry.id; });
      })) {
        if (normalized.taskStatus === "waiting") { normalized.waitingSince = timestamp(candidate.waitingSince) || time; }
        if (normalized.taskStatus === "done") { normalized.completedAt = timestamp(candidate.completedAt) || time; }
      }
      return auditChanges(normalized, oldTask, next, time);
    });
    return next;
  }
  function syncLegacyCompletion(task, timeValue) {
    const status = getStatus(task).id;
    const desired = task.done ? "done" : (status === "done" ? "backlog" : status);
    Object.assign(task, updateTask(task, { taskStatus: desired }, null, timeValue));
    return task;
  }
  function createReconciler() {
    let baseline = null;
    function capture(snapshot) {
      baseline = snapshot ? clone({ todos: snapshot.todos || [], taskPeople: snapshot.taskPeople || [], planningCategories: snapshot.planningCategories || [] }) : null;
    }
    const reconcile = function (snapshot, timeValue) {
      reconcileSnapshot(snapshot, baseline, timeValue);
      capture(snapshot);
      return snapshot;
    };
    reconcile.reset = capture;
    reconcile.capture = capture;
    return reconcile;
  }
  function getDeadlineInfo(taskOrDate, todayValue) {
    const task = taskOrDate && typeof taskOrDate === "object" ? taskOrDate : null;
    const due = validDate(task ? task.dueDate : taskOrDate);
    const today = validDate(todayValue) || localDate();
    if (!due) { return { days: null, level: "none", label: "Ohne Deadline", sortRank: 6 }; }
    const days = dayNumber(due) - dayNumber(today);
    if (task && getStatus(task).id === "done") { return { days: days, level: "done", label: "Erledigt", sortRank: 7 }; }
    if (days < 0) { return { days: days, level: "overdue", label: Math.abs(days) + (days === -1 ? " Tag überfällig" : " Tage überfällig"), sortRank: 0 }; }
    if (days === 0) { return { days: days, level: "critical", label: "Heute fällig", sortRank: 1 }; }
    return { days: days, level: days <= deadlineThresholds.urgent ? "urgent" : (days <= deadlineThresholds.warning ? "warning" : (days <= deadlineThresholds.notice ? "notice" : "normal")), label: days === 1 ? "Noch 1 Tag" : "Noch " + days + " Tage", sortRank: days <= deadlineThresholds.urgent ? 2 : (days <= deadlineThresholds.warning ? 3 : (days <= deadlineThresholds.notice ? 4 : 5)) };
  }
  function getWaitingInfo(task, snapshot, todayValue) {
    if (getStatus(task).id !== "waiting") { return null; }
    const waitingTime = timestamp(task && task.waitingSince);
    const days = waitingTime ? Math.max(0, dayNumber(validDate(todayValue) || localDate()) - dayNumber(localDate(waitingTime))) : null;
    const person = getPersonName(snapshot, task && task.waitingForPersonId);
    return { days: days, label: (days === null ? "Wartet auf Rückmeldung" : "Wartet seit " + days + (days === 1 ? " Tag" : " Tagen")) + (person ? " auf " + person : "") };
  }
  function filterTasks(tasks, filters, snapshot, todayValue) {
    const config = filters || {};
    const query = clean(config.search).toLocaleLowerCase("de");
    return (Array.isArray(tasks) ? tasks : []).filter(function (task) {
      const status = getStatus(task).id;
      const category = getCategory(task, snapshot);
      if (query && !(clean(task.title) + " " + clean(task.description)).toLocaleLowerCase("de").includes(query)) { return false; }
      if (config.categoryId && category.id !== config.categoryId) { return false; }
      if (config.category && category.name !== config.category && category.id !== config.category) { return false; }
      if ((config.excludeDone || config.status === "open") && status === "done") { return false; }
      if (config.status && config.status !== "open" && config.status !== "all" && status !== config.status) { return false; }
      if (config.responsiblePersonId && clean(task.responsiblePersonId) !== config.responsiblePersonId) { return false; }
      if (config.participantPersonId && !idList(task.participantPersonIds).includes(config.participantPersonId)) { return false; }
      if (config.personId && clean(task.responsiblePersonId) !== config.personId && !idList(task.participantPersonIds).includes(config.personId) && clean(task.waitingForPersonId) !== config.personId) { return false; }
      if (config.priority && getPriority(task).id !== config.priority) { return false; }
      const deadline = clean(config.deadline);
      const days = getDeadlineInfo(task.dueDate, todayValue).days;
      if (deadline === "none" && days !== null) { return false; }
      if (deadline === "overdue" && (days === null || days >= 0)) { return false; }
      if (deadline === "today" && days !== 0) { return false; }
      const horizon = { "3": 3, "7": 7, "14": 14, "next3": 3, "next7": 7, "next14": 14 }[deadline];
      if (horizon && (days === null || days < 0 || days > horizon)) { return false; }
      return true;
    });
  }
  function sortTasks(tasks, todayValue) {
    return (Array.isArray(tasks) ? tasks : []).slice().sort(function (left, right) {
      if (getStatus(left).id === "done" && getStatus(right).id === "done") {
        return clean(right.completedAt).localeCompare(clean(left.completedAt)) || clean(left.title).localeCompare(clean(right.title), "de");
      }
      const a = getDeadlineInfo(left.dueDate, todayValue);
      const b = getDeadlineInfo(right.dueDate, todayValue);
      return a.sortRank - b.sortRank || (a.days === null ? Infinity : a.days) - (b.days === null ? Infinity : b.days)
        || getPriority(left).rank - getPriority(right).rank || clean(left.createdAt).localeCompare(clean(right.createdAt)) || clean(left.title).localeCompare(clean(right.title), "de");
    });
  }
  function formatTimestamp(value) {
    const normalized = timestamp(value);
    if (!normalized) { return "Nicht bekannt"; }
    return new Date(normalized).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function dateLabel(value) { return validDate(value) ? value.slice(8, 10) + "." + value.slice(5, 7) + "." + value.slice(0, 4) : "Ohne Deadline"; }
  function historyPresentation(entry, snapshot) {
    const oldValue = entry.oldValue;
    const newValue = entry.newValue;
    if (entry.eventType === "created") { return { label: "Aufgabe erstellt", text: entry.unknownTimestamp ? "Der Erstellungszeitpunkt wurde in den bisherigen Daten nicht gespeichert." : (entry.inferred ? "Zeitpunkt aus der vorhandenen Aufgaben-ID übernommen." : "") }; }
    if (entry.eventType === "status") { return { label: "Status geändert", text: getStatus(oldValue).label + " → " + getStatus(newValue).label }; }
    if (entry.eventType === "deadline") { return { label: "Deadline geändert", text: dateLabel(clean(oldValue)) + " → " + dateLabel(clean(newValue)) }; }
    if (entry.eventType === "category") { return { label: "Aufgabenbereich geändert", text: (clean(oldValue && oldValue.name) || "Ohne Aufgabenbereich") + " → " + (clean(newValue && newValue.name) || "Ohne Aufgabenbereich") }; }
    if (entry.eventType === "people") { return { label: "Personenzuordnung geändert", text: (clean(entry.meta && entry.meta.oldLabel) || peopleLabel(peopleValue(oldValue || {}), snapshot)) + " → " + (clean(entry.meta && entry.meta.newLabel) || peopleLabel(peopleValue(newValue || {}), snapshot)) }; }
    if (entry.eventType === "priority") { return { label: "Priorität geändert", text: getPriority(oldValue).label + " → " + getPriority(newValue).label }; }
    return { label: clean(entry.label) || "Systemereignis", text: clean(entry.text) || clean(entry.eventType) };
  }
  function getTimeline(task, snapshot, options) {
    const normalized = normalizeTask(task);
    const entries = normalized.history.map(function (entry) { return Object.assign({}, entry, historyPresentation(entry, snapshot), { kind: "history" }); })
      .concat(normalized.protocol.map(function (entry) { return Object.assign({}, entry, { kind: "protocol", label: "Protokolleintrag" }); }));
    const direction = options && options.newestFirst === false ? 1 : -1;
    return entries.sort(function (left, right) { return direction * clean(left.timestamp).localeCompare(clean(right.timestamp)); });
  }
  window.Unterrichtsassistent.features.tasks.model = {
    statuses: statuses, priorities: priorities, deadlineThresholds: deadlineThresholds,
    createId: createId, normalizeTask: normalizeTask, createTask: createTask, updateTask: updateTask,
    addProtocolEntry: addProtocolEntry, reconcileSnapshot: reconcileSnapshot, createReconciler: createReconciler, syncLegacyCompletion: syncLegacyCompletion,
    mergeTaskLogs: mergeTaskLogs, getStatus: getStatus, getPriority: getPriority, getCategory: getCategory,
    getPersonName: getPersonName, getDeadlineInfo: getDeadlineInfo, getWaitingInfo: getWaitingInfo,
    filterTasks: filterTasks, sortTasks: sortTasks, getTimeline: getTimeline, formatTimestamp: formatTimestamp,
    getStatusLabel: function (value) { return getStatus(value).label; }
  };
}());

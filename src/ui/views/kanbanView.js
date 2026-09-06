(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
  window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

  const appAction = "window.UnterrichtsassistentApp.kanban.";

  function getContext(service, state) {
    const app = window.Unterrichtsassistent;
    return {
      snapshot: service && service.snapshot || {},
      state: state || {},
      model: app.features.tasks.model,
      helpers: app.ui.viewHelpers
    };
  }

  function escape(context, value) {
    return context.helpers.escapeValue(value);
  }

  function statusId(context, task) {
    const status = context.model.getStatus(task);
    return typeof status === "string" ? status : status.id;
  }

  function button(context, label, action, extra, style) {
    return '<button type="button" class="kanban-button' + (style ? ' kanban-button--' + style : '') + '" onclick="return ' + appAction + action + '"' + (extra || '') + '>' + escape(context, label) + '</button>';
  }

  function option(context, value, label, selected, disabled) {
    return '<option value="' + escape(context, value) + '"' + (String(selected || "") === String(value) ? ' selected' : '') + (disabled ? ' disabled' : '') + '>' + escape(context, label) + '</option>';
  }

  function getCategories(context) {
    if (context.categories) return context.categories;
    const definitions = context.helpers.callApp("getPlanningCategoryDefinitions", [], []);
    context.categories = (Array.isArray(definitions) ? definitions : []).filter(function (entry) {
      return entry && entry.name;
    });
    return context.categories;
  }

  function isAggregateTask(task) {
    return task.type === "checkliste" || (Array.isArray(task.assignedStudentIds) && task.assignedStudentIds.length > 0);
  }

  function peopleOptions(context, selected, emptyLabel) {
    const people = Array.isArray(context.snapshot.taskPeople) ? context.snapshot.taskPeople.slice() : [];
    people.sort(function (a, b) { return String(a.name || "").localeCompare(String(b.name || ""), "de"); });
    const missing = selected && !people.some(function (person) { return person.id === selected; });
    return option(context, "", emptyLabel || "Nicht zugewiesen", selected)
      + people.map(function (person) { return option(context, person.id, person.name, selected); }).join("")
      + (missing ? option(context, selected, context.model.getPersonName(context.snapshot, selected), selected) : "");
  }

  function filterSelect(context, key, label, content) {
    return '<label class="import-modal__field"><span>' + escape(context, label) + '</span><select name="kanban-filter-' + key + '" onchange="return ' + appAction + 'setFilter(\'' + key + '\',this.value)">' + content + '</select></label>';
  }

  function renderFilters(context) {
    const filters = context.state.filters || {};
    const categories = getCategories(context).slice();
    (context.snapshot.todos || []).forEach(function (task) {
      if (!task.category && !task.categoryId) return;
      const category = context.model.getCategory(task, context.snapshot);
      if (!categories.some(function (entry) { return entry.name === category.name; })) {
        categories.push({ name: category.name, missing: true });
      }
    });
    const categoryOptions = option(context, "", "Alle Aufgabenbereiche", filters.category)
      + categories.map(function (entry) { return option(context, entry.name, entry.name + (entry.missing ? " (nicht mehr vorhanden)" : ""), filters.category); }).join("")
      + (filters.category && !categories.some(function (entry) { return entry.name === filters.category; })
        ? option(context, filters.category, filters.category + " (nicht mehr vorhanden)", filters.category) : "");
    const statusOptions = option(context, "all", "Alle Status", filters.status)
      + option(context, "open", "Alle offenen Aufgaben", filters.status)
      + context.model.statuses.map(function (status) { return option(context, status.id, status.label, filters.status); }).join("");
    const deadlineOptions = [["", "Alle Deadlines"], ["today", "Heute"], ["3", "Nächste 3 Tage"], ["7", "Nächste 7 Tage"], ["14", "Nächste 14 Tage"], ["overdue", "Überfällig"], ["none", "Ohne Deadline"]]
      .map(function (entry) { return option(context, entry[0], entry[1], filters.deadline); }).join("");
    return [
      '<div class="kanban-filters">',
      '<label class="import-modal__field kanban-filters__search"><span>Suche</span><input type="search" id="kanbanSearchInput" name="kanban-search" placeholder="Titel oder Beschreibung suchen" value="', escape(context, filters.search || ""), '" oninput="return ', appAction, 'setFilter(\'search\',this.value)"></label>',
      filterSelect(context, "category", "Aufgabenbereich", categoryOptions),
      filterSelect(context, "status", "Status", statusOptions),
      filterSelect(context, "responsiblePersonId", "Verantwortlich", peopleOptions(context, filters.responsiblePersonId, "Alle Personen")),
      filterSelect(context, "participantPersonId", "Beteiligt", peopleOptions(context, filters.participantPersonId, "Alle Personen")),
      filterSelect(context, "deadline", "Deadline", deadlineOptions),
      filterSelect(context, "priority", "Priorität", option(context, "", "Alle Prioritäten", filters.priority) + context.model.priorities.map(function (entry) { return option(context, entry.id, entry.label, filters.priority); }).join("")),
      '</div>',
      '<div class="kanban-toolbar__actions">',
      button(context, "Filter zurücksetzen", "resetFilters()", '', 'quiet'),
      '<span class="kanban-hint">Filter werden miteinander kombiniert.</span>',
      '</div>'
    ].join("");
  }

  function renderSummary(context, tasks) {
    const open = tasks.filter(function (task) { return statusId(context, task) !== "done"; });
    const counts = { today: 0, week: 0, overdue: 0, waiting: 0 };
    open.forEach(function (task) {
      const deadline = context.model.getDeadlineInfo(task);
      if (deadline.days === 0) counts.today += 1;
      if (deadline.days !== null && deadline.days >= 0 && deadline.days <= 7) counts.week += 1;
      if (deadline.days !== null && deadline.days < 0) counts.overdue += 1;
      if (statusId(context, task) === "waiting") counts.waiting += 1;
    });
    return '<div class="kanban-summary" aria-label="Zusammenfassung der gefilterten Aufgaben">'
      + [[open.length, "offen"], [counts.overdue, "überfällig", "critical"], [counts.today, "heute fällig"], [counts.week, "bis in 7 Tagen"], [counts.waiting, "warten auf Rückmeldung"]].map(function (entry) {
        return '<span class="kanban-summary__item' + (entry[2] ? ' kanban-summary__item--' + entry[2] : '') + '"><strong>' + entry[0] + '</strong>' + entry[1] + '</span>';
      }).join("") + '</div>';
  }

  function renderCard(context, task) {
    const category = context.model.getCategory(task, context.snapshot);
    const deadline = context.model.getDeadlineInfo(task);
    const waiting = context.model.getWaitingInfo(task, context.snapshot);
    const people = (Array.isArray(task.participantPersonIds) ? task.participantPersonIds : []).map(function (id) {
      return context.model.getPersonName(context.snapshot, id);
    });
    const definition = getCategories(context).find(function (entry) { return entry.name === category.name; });
    const categoryColor = definition && definition.color || category.color;
    const color = /^#[0-9a-f]{6}$/i.test(categoryColor || "") ? categoryColor : "#b8bec7";
    const completed = statusId(context, task) === "done";
    return [
      '<article class="kanban-card" data-kanban-task-id="', escape(context, task.id), '" style="--todo-category-color:', color, '">',
      '<div class="kanban-card__top">',
      '<button class="kanban-card__open" type="button" data-task-id="', escape(context, task.id), '" onclick="return ', appAction, 'openTask(this.dataset.taskId)">', escape(context, task.title || "Aufgabe ohne Titel"), '</button>',
      '<button class="kanban-drag-handle" data-kanban-drag type="button" aria-label="Aufgabe verschieben: ', escape(context, task.title || "Aufgabe"), '" title="Am Griff in eine andere Spalte ziehen"><span aria-hidden="true">⠿</span></button>',
      '</div>',
      '<div class="kanban-card__meta">',
      '<span class="kanban-card__category">', escape(context, category.name || "Ohne Aufgabenbereich"), category.missing ? ' · nicht mehr vorhanden' : '', '</span>',
      '<div class="kanban-card__badges">',
      task.dueDate ? '<span class="kanban-badge kanban-badge--' + escape(context, deadline.level) + '">' + (completed ? '◷ Deadline: ' : (deadline.days !== null && deadline.days <= 3 ? '⚠ ' : '◷ ') + escape(context, deadline.label) + ' · ') + escape(context, context.helpers.formatDateLabel(task.dueDate)) + '</span>' : '',
      task.priority === "hoch" ? '<span class="kanban-badge kanban-badge--high">↑ Hohe Priorität</span>' : '',
      task.priority === "standard" ? '<span class="kanban-badge">Standard</span>' : '',
      '</div>',
      task.responsiblePersonId ? '<p class="kanban-card__people"><strong>Verantwortlich:</strong> ' + escape(context, context.model.getPersonName(context.snapshot, task.responsiblePersonId)) + '</p>' : '',
      people.length ? '<p class="kanban-card__people"><strong>Beteiligt:</strong> ' + escape(context, people.slice(0, 2).join(", ")) + (people.length > 2 ? ' · +' + (people.length - 2) : '') + '</p>' : '',
      waiting ? '<p class="kanban-card__waiting">◷ ' + escape(context, waiting.label) + '</p>' : '',
      completed && task.completedAt ? '<p class="kanban-card__people">Erledigt: ' + escape(context, context.model.formatTimestamp(task.completedAt)) + '</p>' : '',
      '</div>',
      '</article>'
    ].join("");
  }

  function renderColumn(context, status, tasks) {
    const completedLimit = Number(context.state.completedLimit) || 20;
    const sorted = context.model.sortTasks(tasks.filter(function (task) { return statusId(context, task) === status.id; }));
    const visible = status.id === "done" ? sorted.slice(0, completedLimit) : sorted;
    const empty = status.id === "done" && (context.state.filters || {}).status === "open"
      ? "Erledigte Aufgaben über den Statusfilter einblenden."
      : "Keine passenden Aufgaben";
    return [
      '<section class="kanban-column kanban-column--', escape(context, status.id), '" data-kanban-status="', escape(context, status.id), '" aria-label="', escape(context, status.label), '">',
      '<header class="kanban-column__heading"><h3>', escape(context, status.label), '</h3><span class="kanban-column__count">', sorted.length, '</span>',
      '<button type="button" class="kanban-button kanban-column__add" data-status="', escape(context, status.id), '" aria-label="Neue Aufgabe: ', escape(context, status.label), '" onclick="return ', appAction, 'newTask(this.dataset.status)">+</button></header>',
      '<div class="kanban-column__body" data-scroll-key="kanban:', escape(context, status.id), '">',
      visible.length ? visible.map(function (task) { return renderCard(context, task); }).join("") : '<p class="kanban-column__empty">' + empty + '</p>',
      sorted.length > visible.length ? button(context, "Weitere anzeigen (" + (sorted.length - visible.length) + ")", "showMore()", '', 'quiet') : '',
      '</div></section>'
    ].join("");
  }

  function draftSelect(context, key, label, options) {
    return '<label class="import-modal__field"><span>' + escape(context, label) + '</span><select name="' + key + '" onchange="return ' + appAction + 'updateDraft(\'' + key + '\',this.value)">' + options + '</select></label>';
  }

  function renderParticipants(context, draft) {
    const selected = Array.isArray(draft.participantPersonIds) ? draft.participantPersonIds : [];
    const people = (context.snapshot.taskPeople || []).slice().sort(function (a, b) { return String(a.name || "").localeCompare(String(b.name || ""), "de"); });
    selected.forEach(function (id) {
      if (!people.some(function (person) { return person.id === id; })) {
        people.push({ id: id, name: context.model.getPersonName(context.snapshot, id) });
      }
    });
    return [
      '<details class="kanban-task-form__people"', selected.length ? ' open' : '', '><summary>Beteiligte Personen', selected.length ? ' · ' + selected.length : '', '</summary><div class="kanban-task-form__people-content">',
      people.length ? '<div class="kanban-participants">' + people.map(function (person) {
        return '<label class="kanban-participant"><input type="checkbox" name="participantPersonIds" value="' + escape(context, person.id) + '"' + (selected.indexOf(person.id) >= 0 ? ' checked' : '') + ' onchange="return ' + appAction + 'toggleParticipant(this.value,this.checked)"><span>' + escape(context, person.name) + '</span></label>';
      }).join("") + '</div>' : '<p class="kanban-hint">Noch keine Personen angelegt.</p>',
      button(context, "Personen verwalten", "openPeople()", '', 'quiet'),
      '</div></details>'
    ].join("");
  }

  function renderTaskForm(context, draft) {
    const categories = getCategories(context);
    const category = context.model.getCategory(draft, context.snapshot);
    const selectedCategory = draft.category || draft.categoryId ? category.name : "";
    const hasCategory = categories.some(function (entry) { return entry.name === selectedCategory; });
    const categoryOptions = option(context, "", "Aufgabenbereich wählen", selectedCategory)
      + categories.map(function (entry) { return option(context, entry.name, entry.name, selectedCategory); }).join("")
      + (!hasCategory && selectedCategory ? option(context, selectedCategory, selectedCategory + " (nicht mehr vorhanden)", selectedCategory) : "");
    const status = statusId(context, draft);
    const aggregateTask = isAggregateTask(draft);
    const legacyTask = aggregateTask || draft.type === "step-checkliste";
    return [
      '<form class="import-modal__form kanban-task-form" id="kanbanTaskForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return ', appAction, 'saveTask(event)">',
      '<label class="import-modal__field"><span>Titel</span><input name="title" id="kanbanTaskTitle" type="text" required value="', escape(context, draft.title || ""), '" placeholder="Was ist zu tun?" oninput="return ', appAction, 'updateDraft(\'title\',this.value)"></label>',
      '<div class="kanban-task-form__grid">',
      draftSelect(context, "category", "Aufgabenbereich", categoryOptions),
      draftSelect(context, "taskStatus", "Status", context.model.statuses.map(function (entry) {
        const disabled = aggregateTask && (draft.done ? entry.id !== "done" : entry.id === "done");
        return option(context, entry.id, entry.label, status, disabled);
      }).join("")),
      '<label class="import-modal__field"><span>Deadline</span><input type="date" name="dueDate" value="', escape(context, draft.dueDate || ""), '" onchange="return ', appAction, 'updateDraft(\'dueDate\',this.value)"></label>',
      draftSelect(context, "priority", "Priorität", context.model.priorities.map(function (entry) { return option(context, entry.id, entry.label, draft.priority || "niedrig"); }).join("")),
      '</div>',
      status === "waiting" ? [
        '<div class="kanban-task-form__waiting">',
        draftSelect(context, "waitingForPersonId", "Wartet auf", peopleOptions(context, draft.waitingForPersonId, "Keine bestimmte Person")),
        '<label class="import-modal__field"><span>Wartet seit</span><input type="date" name="waitingSince" value="', escape(context, draft.waitingSince ? context.helpers.toIsoDate(new Date(draft.waitingSince)) : ""), '" onchange="return ', appAction, 'updateDraft(\'waitingSince\',this.value)"></label>',
        '<p class="kanban-hint">Beim Wechsel in diesen Status beginnt die Wartezeit automatisch.</p></div>'
      ].join("") : '',
      draftSelect(context, "responsiblePersonId", "Verantwortlich", peopleOptions(context, draft.responsiblePersonId, "Nicht zugewiesen")),
      renderParticipants(context, draft),
      '<label class="import-modal__field"><span>Beschreibung</span><textarea name="description" rows="5" placeholder="Weitere Informationen zur Aufgabe" oninput="return ', appAction, 'updateDraft(\'description\',this.value)">', escape(context, draft.description || ""), '</textarea></label>',
      legacyTask ? '<div><p class="kanban-hint">' + (aggregateTask ? 'Bei dieser Aufgabe ergibt sich „Erledigt“ aus der Checkliste bzw. den Schülerzuordnungen.' : 'Diese Aufgabe enthält eine Step-Checkliste.') + '</p>' + button(context, "Checkliste / Zuordnungen öffnen", "openLegacyTodo(this.dataset.taskId)", ' data-task-id="' + escape(context, draft.id) + '"', 'quiet') + '</div>' : '',
      draft.id ? '<div class="kanban-task-form__dates"><span>Erstellt: ' + escape(context, context.model.formatTimestamp(draft.createdAt)) + '</span><span>Geändert: ' + escape(context, context.model.formatTimestamp(draft.updatedAt)) + '</span>' + (draft.completedAt ? '<span>Erledigt: ' + escape(context, context.model.formatTimestamp(draft.completedAt)) + '</span>' : '') + '</div>' : '',
      '</form>'
    ].join("");
  }

  function renderTimeline(context, draft) {
    const entries = context.model.getTimeline(draft, context.snapshot, { newestFirst: true });
    return [
      '<section class="kanban-timeline" aria-label="Aufgabenprotokoll">',
      draft.id ? [
        '<form class="kanban-protocol" id="kanbanProtocolForm" method="post" action="about:blank" data-local-only-form onsubmit="return ', appAction, 'addProtocol(event)">',
        '<label class="import-modal__field"><span>Neuer Protokolleintrag</span><textarea id="kanbanProtocolText" name="text" rows="3" required placeholder="Gespräch, Rückmeldung oder nächsten Schritt festhalten …" oninput="return ', appAction, 'updateProtocolDraft(this.value)">', escape(context, context.state.protocolDraft || ""), '</textarea></label>',
        '<button class="kanban-button kanban-button--primary" type="submit">Eintrag hinzufügen</button>',
        '<p class="kanban-hint">Gespeicherte Einträge bleiben unverändert im Protokoll.</p></form>'
      ].join("") : '<p class="kanban-hint">Speichere die Aufgabe, um Protokolleinträge hinzuzufügen.</p>',
      '<div class="kanban-timeline__heading"><h4>Verlauf &amp; Protokoll</h4><span class="kanban-hint">Neueste Einträge zuerst · ', entries.length, '</span></div>',
      entries.length ? '<ol class="kanban-timeline__list">' + entries.map(function (entry) {
        return '<li class="kanban-timeline__entry' + (entry.kind === "protocol" ? ' kanban-timeline__entry--protocol' : '') + '"><div class="kanban-timeline__label"><span class="kanban-timeline__type">' + (entry.kind === "protocol" ? 'Protokoll' : 'Automatisch') + '</span><time datetime="' + escape(context, entry.timestamp) + '">' + escape(context, context.model.formatTimestamp(entry.timestamp)) + '</time></div>'
          + (entry.label ? '<p class="kanban-timeline__text"><strong>' + escape(context, entry.label) + '</strong></p>' : '')
          + (entry.text ? '<p class="kanban-timeline__text">' + escape(context, entry.text) + '</p>' : '') + '</li>';
      }).join("") + '</ol>' : '<p class="kanban-hint">Der Verlauf beginnt mit dem Anlegen der Aufgabe.</p>',
      '</section>'
    ].join("");
  }

  function renderTaskModal(service, state) {
    const context = getContext(service, state);
    const draft = context.state.draft;
    if (!draft) return "";
    return [
      '<div class="import-modal is-open kanban-modal" id="kanbanTaskModal"', context.state.peopleOpen ? ' inert aria-hidden="true"' : '', '>',
      '<div class="import-modal__backdrop" onclick="return ', appAction, 'closeTask()"></div>',
      '<div class="import-modal__dialog kanban-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="kanbanTaskModalTitle">',
      '<header class="import-modal__header kanban-modal__header"><div><h3 id="kanbanTaskModalTitle">', draft.id ? 'Aufgabe bearbeiten' : 'Neue Aufgabe', '</h3><p class="kanban-hint">Details, Zuständigkeiten und vollständiger Verlauf</p></div>',
      button(context, "✕", "closeTask()", ' aria-label="Aufgabe schließen"', 'quiet'), '</header>',
      '<div class="kanban-modal__body" data-scroll-key="kanban-task-detail">',
      context.state.error ? '<p class="kanban-error" role="alert">' + escape(context, context.state.error) + '</p>' : '',
      '<div class="kanban-modal__layout">', renderTaskForm(context, draft), renderTimeline(context, draft), '</div></div>',
      '<footer class="kanban-modal__footer"><div class="kanban-modal__footer-actions">',
      draft.id ? button(context, "PDF exportieren", "exportTask()", '', 'quiet') : '',
      draft.id ? button(context, "Löschen", "deleteTask()", '', 'danger') : '',
      '</div><div class="kanban-modal__footer-actions">',
      draft.id && statusId(context, draft) !== "done" && !isAggregateTask(draft) ? button(context, "✓ Erledigen", "completeTask()", '', 'quiet') : '',
      '<button class="kanban-button kanban-button--primary" type="submit" form="kanbanTaskForm">', draft.id ? 'Änderungen speichern' : 'Aufgabe anlegen', '</button>',
      '</div></footer></div></div>'
    ].join("");
  }

  function renderPeopleModal(service, state) {
    const context = getContext(service, state);
    if (!context.state.peopleOpen) return "";
    const draft = context.state.personDraft || {};
    const people = (context.snapshot.taskPeople || []).slice().sort(function (a, b) { return String(a.name || "").localeCompare(String(b.name || ""), "de"); });
    return [
      '<div class="import-modal is-open kanban-modal kanban-modal--people" id="kanbanPeopleModal"><div class="import-modal__backdrop" onclick="return ', appAction, 'closePeople()"></div>',
      '<div class="import-modal__dialog kanban-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="kanbanPeopleTitle">',
      '<header class="import-modal__header kanban-modal__header"><h3 id="kanbanPeopleTitle">Personen</h3>', button(context, "✕", "closePeople()", ' aria-label="Personenverwaltung schließen"', 'quiet'), '</header>',
      '<div class="kanban-modal__body" data-scroll-key="kanban-people"><p class="kanban-hint">Namen für Verantwortliche, Beteiligte und Rückmeldungen. Eine Aufgabe kann auch ohne Personenbezug bestehen.</p>',
      context.state.error ? '<p class="kanban-error" role="alert">' + escape(context, context.state.error) + '</p>' : '',
      '<form class="kanban-people__form" id="kanbanPersonForm" method="post" action="about:blank" data-local-only-form onsubmit="return ', appAction, 'savePerson(event)">',
      '<input type="hidden" name="personId" value="', escape(context, draft.id || ""), '"><label class="import-modal__field"><span>', draft.id ? 'Name bearbeiten' : 'Person hinzufügen', '</span><input id="kanbanPersonName" name="name" type="text" required autocomplete="off" value="', escape(context, draft.name || ""), '" placeholder="z. B. Frau Müller"></label>',
      '<button class="kanban-button kanban-button--primary" type="submit">', draft.id ? 'Speichern' : 'Hinzufügen', '</button></form>',
      '<ul class="kanban-people__list">', people.map(function (person) {
        return '<li class="kanban-people__row"><span class="kanban-people__name">' + escape(context, person.name) + '</span><div class="kanban-people__row-actions">'
          + button(context, "Bearbeiten", "editPerson(this.dataset.personId)", ' data-person-id="' + escape(context, person.id) + '" aria-label="' + escape(context, person.name + " bearbeiten") + '"', 'quiet')
          + button(context, "Entfernen", "deletePerson(this.dataset.personId)", ' data-person-id="' + escape(context, person.id) + '" aria-label="' + escape(context, person.name + " entfernen") + '"', 'danger') + '</div></li>';
      }).join(""), '</ul>',
      !people.length ? '<p class="kanban-hint">Noch keine Personen angelegt.</p>' : '',
      '</div></div></div>'
    ].join("");
  }

  window.Unterrichtsassistent.ui.views.kanban = {
    id: "kanban",
    title: "Kanban",
    renderTaskModal: renderTaskModal,
    renderPeopleModal: renderPeopleModal,
    render: function (service, state) {
      const context = getContext(service, state);
      const filters = Object.assign({}, context.state.filters || {});
      if (filters.status === "all") filters.status = "";
      const tasks = context.model.filterTasks(context.snapshot.todos || [], filters, context.snapshot);
      return [
        '<div class="kanban-view">',
        '<div class="kanban-background"', context.state.draft || context.state.peopleOpen ? ' inert aria-hidden="true"' : '', '>',
        '<article class="panel kanban-toolbar"><div class="kanban-toolbar__heading"><h2>Alle Aufgaben im Blick</h2><div class="kanban-toolbar__actions">',
        button(context, "Personen", "openPeople()", '', 'quiet'),
        button(context, "+ Neue Aufgabe", "newTask()", '', 'primary'),
        '</div></div>', renderFilters(context), renderSummary(context, tasks),
        '<p class="kanban-hint">Aufgabe antippen zum Öffnen. Zum Verschieben den Griff ⠿ in eine andere Spalte ziehen. Der Status lässt sich auch in der Aufgabe ändern.</p></article>',
        context.state.error && !context.state.draft && !context.state.peopleOpen ? '<p class="kanban-error" role="alert">' + escape(context, context.state.error) + '</p>' : '',
        '<div class="kanban-board" data-kanban-board data-scroll-key="kanban-board" aria-label="Kanban-Board">', context.model.statuses.map(function (status) { return renderColumn(context, status, tasks); }).join(""), '</div>',
        '<div class="kanban-sr-only" data-kanban-live aria-live="polite" aria-atomic="true"></div>',
        '</div>',
        renderTaskModal(service, state), renderPeopleModal(service, state),
        '</div>'
      ].join("");
    }
  };
}());

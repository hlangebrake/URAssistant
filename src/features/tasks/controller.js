(function () {
  const tasks = window.Unterrichtsassistent.features.tasks;

  // View state is ephemeral; every saved change uses the application's snapshot path.
  tasks.createController = function (options) {
    const model = tasks.model;
    const initialFilters = function () {
      return { category: "", status: "all", responsiblePersonId: "", participantPersonId: "", deadline: "", priority: "", search: "" };
    };
    const state = { filters: initialFilters(), draft: null, peopleOpen: false, completedLimit: 20, error: "", protocolDraft: "", personDraft: null };
    let originalDraft = "";
    let returnFocus = null;
    let mountedView = null;
    let dragCleanup = null;
    let searchTimer = 0;
    let lastDate = new Date().toDateString();
    const clone = function (value) { return JSON.parse(JSON.stringify(value)); };
    const findTask = function (snapshot, id) { return (snapshot.todos || []).find(function (task) { return task.id === id; }); };
    const render = function () { options.render(); };
    function fail(message) { state.error = message; render(); return false; }
    function draftChanged() { return state.draft && (JSON.stringify(state.draft) !== originalDraft || state.protocolDraft.trim()); }
    function rememberDraft() { originalDraft = JSON.stringify(state.draft); }
    function isAggregate(task) { return task && (task.type === "checkliste" || (task.assignedStudentIds || []).length > 0); }
    function canChangeCompletion(task, status) {
      return !isAggregate(task) || Boolean(task.done) === (status === "done");
    }
    function completionError() { return fail('Bei dieser Aufgabe ergibt sich „Erledigt“ aus der Checkliste bzw. den Schülerzuordnungen. Bitte diese über „Checkliste / Zuordnungen öffnen“ bearbeiten.'); }
    function restoreFocus() {
      if (returnFocus && returnFocus.isConnected) returnFocus.focus();
      else if (mountedView) {
        const target = mountedView.querySelector("[data-kanban-task-id] button, button");
        if (target) target.focus();
      }
    }
    function saveDraft(keepOpen) {
      if (!state.draft || !state.draft.title.trim()) return fail("Bitte einen Titel eingeben.");
      const snapshot = options.getSnapshot();
      const existing = findTask(snapshot, state.draft.id);
      if (existing && !canChangeCompletion(existing, state.draft.taskStatus)) return completionError();
      let saved;
      try {
        saved = existing ? model.updateTask(existing, state.draft, snapshot) : model.createTask(state.draft, snapshot);
        if (state.protocolDraft.trim()) saved = model.addProtocolEntry(saved, state.protocolDraft);
      } catch (error) { return fail(error.message || "Die Aufgabe konnte nicht übernommen werden."); }
      if (existing) snapshot.todos[snapshot.todos.indexOf(existing)] = saved;
      else snapshot.todos.push(saved);
      state.draft = keepOpen ? clone(saved) : null;
      state.protocolDraft = "";
      state.error = "";
      rememberDraft();
      options.save(snapshot);
      return saved;
    }
    function changeStatus(id, status) {
      const snapshot = options.getSnapshot();
      const task = findTask(snapshot, id);
      if (!task || task.taskStatus === status) return;
      if (!canChangeCompletion(task, status)) { completionError(); return; }
      snapshot.todos[snapshot.todos.indexOf(task)] = model.updateTask(task, { taskStatus: status }, snapshot);
      options.save(snapshot);
      announce("Status geändert: " + model.getStatusLabel(status));
    }
    function announce(message) {
      const live = mountedView && mountedView.querySelector("[data-kanban-live]");
      if (live) live.textContent = message;
    }
    function onKeyDown(event) {
      if (state.peopleOpen || state.draft) {
        if (event.key === "Escape") { event.preventDefault(); state.peopleOpen ? api.closePeople() : api.closeTask(); return; }
        if (event.key === "Tab") {
          const dialogs = mountedView.querySelectorAll('[role="dialog"]');
          const dialog = dialogs[dialogs.length - 1];
          const controls = dialog ? Array.from(dialog.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')).filter(function (el) { return !el.disabled && el.getClientRects().length; }) : [];
          const first = controls[0]; const last = controls[controls.length - 1];
          if (first && event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
          else if (last && !event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
        }
        return;
      }
      const handle = event.target.closest("[data-kanban-drag]");
      if (handle && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        const card = handle.closest("[data-kanban-task-id]");
        const task = findTask(options.getSnapshot(), card.dataset.kanbanTaskId);
        const index = model.statuses.findIndex(function (status) { return status.id === task.taskStatus; });
        const status = model.statuses[index + (event.key === "ArrowRight" ? 1 : -1)];
        if (status) changeStatus(task.id, status.id);
      }
    }
    function syncViewport() {
      if (!mountedView) return;
      const viewport = window.visualViewport;
      mountedView.style.setProperty("--kanban-viewport-height", (viewport ? viewport.height : window.innerHeight) + "px");
      mountedView.style.setProperty("--kanban-viewport-top", (viewport ? viewport.offsetTop : 0) + "px");
    }
    function onPointerDown(event) {
      const handle = event.target.closest("[data-kanban-drag]");
      if (!handle || !event.isPrimary || event.button !== 0 || state.draft || state.peopleOpen) return;
      const card = handle.closest("[data-kanban-task-id]");
      const board = handle.closest("[data-kanban-board]");
      if (!card || !board) return;
      event.preventDefault();
      const id = card.dataset.kanbanTaskId;
      const startX = event.clientX; const startY = event.clientY;
      let x = startX; let y = startY; let ghost = null; let target = null; let frame = 0;
      try { handle.setPointerCapture(event.pointerId); } catch (_) { /* Window listeners also handle capture loss. */ }
      function markTarget() {
        const hit = document.elementFromPoint(x, y);
        const column = hit && hit.closest("[data-kanban-status]");
        const next = column && board.contains(column) ? column : null;
        if (target !== next) {
          if (target) target.classList.remove("is-drop-target");
          target = next;
          if (target) target.classList.add("is-drop-target");
        }
      }
      function tick() {
        if (!ghost) return;
        const rect = board.getBoundingClientRect();
        const edge = 58;
        if (x < rect.left + edge) board.scrollLeft -= Math.max(3, (rect.left + edge - x) / 4);
        if (x > rect.right - edge) board.scrollLeft += Math.max(3, (x - rect.right + edge) / 4);
        markTarget();
        frame = window.requestAnimationFrame(tick);
      }
      function move(nextEvent) {
        if (nextEvent.pointerId !== event.pointerId) return;
        x = nextEvent.clientX; y = nextEvent.clientY;
        if (!ghost && Math.hypot(x - startX, y - startY) < 8) return;
        nextEvent.preventDefault();
        if (!ghost) {
          ghost = card.cloneNode(true);
          ghost.classList.add("kanban-drag-ghost");
          ghost.setAttribute("aria-hidden", "true");
          ghost.style.width = Math.min(card.offsetWidth, 320) + "px";
          document.body.appendChild(ghost);
          card.classList.add("is-dragging");
          tick();
        }
        ghost.style.left = (x - 36) + "px";
        ghost.style.top = (y - 24) + "px";
        markTarget();
      }
      function cleanup() {
        window.cancelAnimationFrame(frame);
        if (ghost) ghost.remove();
        if (target) target.classList.remove("is-drop-target");
        card.classList.remove("is-dragging");
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", cancel);
        window.removeEventListener("blur", cancel);
        handle.removeEventListener("lostpointercapture", cancel);
        try { handle.releasePointerCapture(event.pointerId); } catch (_) { /* Already released. */ }
        dragCleanup = null;
      }
      function end(nextEvent) {
        if (nextEvent.pointerId !== event.pointerId) return;
        const status = ghost && target ? target.dataset.kanbanStatus : "";
        cleanup();
        if (status) changeStatus(id, status);
      }
      function cancel() { cleanup(); }
      dragCleanup = cleanup;
      window.addEventListener("pointermove", move, { passive: false });
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", cancel);
      window.addEventListener("blur", cancel);
      handle.addEventListener("lostpointercapture", cancel);
    }
    const api = {
      getState: function () { return state; },
      clear: function () { state.draft = null; state.protocolDraft = ""; state.peopleOpen = false; state.personDraft = null; state.error = ""; originalDraft = ""; },
      updateProtocolDraft: function (value) { state.protocolDraft = value; return false; },
      canLeave: function () { return !draftChanged() || window.confirm("Ungespeicherte Änderungen an der Aufgabe verwerfen?"); },
      mount: function (view) {
        if (mountedView !== view) {
          api.unmount(); mountedView = view;
          view.addEventListener("pointerdown", onPointerDown);
          view.addEventListener("keydown", onKeyDown);
          if (window.visualViewport) { window.visualViewport.addEventListener("resize", syncViewport); window.visualViewport.addEventListener("scroll", syncViewport); }
        }
        syncViewport();
      },
      unmount: function () {
        window.clearTimeout(searchTimer);
        if (dragCleanup) dragCleanup();
        if (mountedView) { mountedView.removeEventListener("pointerdown", onPointerDown); mountedView.removeEventListener("keydown", onKeyDown); }
        if (window.visualViewport) { window.visualViewport.removeEventListener("resize", syncViewport); window.visualViewport.removeEventListener("scroll", syncViewport); }
        mountedView = null;
      },
      newTask: function (status) {
        returnFocus = document.activeElement;
        state.draft = { title: "", description: "", category: state.filters.category || "Sonstiges", taskStatus: status || "backlog", dueDate: "", priority: "standard", responsiblePersonId: "", participantPersonIds: [], waitingForPersonId: "", waitingSince: "", history: [], protocol: [] };
        state.error = ""; state.protocolDraft = ""; rememberDraft(); render();
        const input = mountedView && mountedView.querySelector('input[name="title"], #kanbanTitleInput');
        if (input) input.focus();
        return false;
      },
      openTask: function (id) {
        const task = findTask(options.getSnapshot(), id);
        if (!task) return false;
        returnFocus = document.activeElement;
        state.draft = clone(task); state.error = ""; state.protocolDraft = ""; rememberDraft(); render();
        const dialog = mountedView && mountedView.querySelector('[role="dialog"]');
        if (dialog) { dialog.tabIndex = -1; dialog.focus(); }
        return false;
      },
      closeTask: function () {
        if (!api.canLeave()) return false;
        state.draft = null; state.protocolDraft = ""; state.error = ""; render(); restoreFocus(); return false;
      },
      updateDraft: function (field, value) {
        if (!state.draft) return false;
        if (field === "protocolDraft") { state.protocolDraft = value; return false; }
        const fields = ["title", "description", "category", "taskStatus", "dueDate", "priority", "responsiblePersonId", "waitingForPersonId", "waitingSince"];
        if (fields.indexOf(field) < 0) return false;
        state.draft[field] = value;
        if (field === "category") {
          const entry = (options.getSnapshot().planningCategories || []).find(function (category) { return category.name === value; });
          state.draft.categoryId = entry ? entry.id : "";
        }
        if (field === "taskStatus") {
          if (value === "waiting") state.draft.waitingSince = new Date().toISOString();
          render();
          const statusInput = mountedView && mountedView.querySelector('[name="taskStatus"]');
          if (statusInput) statusInput.focus();
        }
        return false;
      },
      toggleParticipant: function (id, selected) {
        if (!state.draft) return false;
        state.draft.participantPersonIds = state.draft.participantPersonIds.filter(function (value) { return value !== id; });
        if (selected) state.draft.participantPersonIds.push(id);
        return false;
      },
      saveTask: function (event) { if (event) event.preventDefault(); if (saveDraft(false)) restoreFocus(); return false; },
      completeTask: function () { if (state.draft) { state.draft.taskStatus = "done"; saveDraft(true); } return false; },
      deleteTask: function () {
        if (!state.draft || !state.draft.id || !window.confirm("Aufgabe einschließlich ihres vollständigen Protokolls löschen?")) return false;
        const snapshot = options.getSnapshot(); const id = state.draft.id;
        snapshot.todos = snapshot.todos.filter(function (task) { return task.id !== id; });
        (snapshot.curriculumLessonPlans || []).forEach(function (lesson) { if (lesson.preparationTodoId === id) { lesson.preparationTodoId = ""; lesson.preparationMode = "text"; } });
        state.draft = null; state.protocolDraft = ""; options.save(snapshot); restoreFocus(); return false;
      },
      addProtocol: function (event) {
        if (event) event.preventDefault();
        const input = mountedView && mountedView.querySelector("#kanbanProtocolText");
        const text = String(input ? input.value : state.protocolDraft).trim();
        if (!text) return fail("Bitte einen Protokolltext eingeben.");
        state.protocolDraft = text;
        if (saveDraft(true)) {
          const textarea = mountedView && mountedView.querySelector('#kanbanProtocolText');
          if (textarea) textarea.focus();
        }
        return false;
      },
      exportTask: function () {
        const saved = saveDraft(true);
        if (!saved) return false;
        try { Promise.resolve(tasks.pdf.exportTask(saved, options.getSnapshot())).catch(function (error) { fail("PDF konnte nicht erstellt werden: " + error.message); }); } catch (error) { fail("PDF konnte nicht erstellt werden: " + error.message); }
        return false;
      },
      setFilter: function (key, value) {
        if (!(key in state.filters)) return false;
        state.filters[key] = value; state.completedLimit = 20;
        window.clearTimeout(searchTimer);
        if (key === "search") {
          searchTimer = window.setTimeout(function () {
            const focused = document.activeElement; const id = focused && focused.id; const start = focused && focused.selectionStart;
            render();
            const input = id && document.getElementById(id);
            if (input) { input.focus(); if (typeof start === "number") input.setSelectionRange(start, start); }
          }, 220);
        } else render();
        return false;
      },
      resetFilters: function () { state.filters = initialFilters(); state.completedLimit = 20; render(); return false; },
      showMore: function () { state.completedLimit += 20; render(); return false; },
      openPeople: function () { state.peopleOpen = true; state.personDraft = null; state.error = ""; render(); const input = mountedView && mountedView.querySelector('#kanbanPersonName'); if (input) input.focus(); return false; },
      closePeople: function () { state.peopleOpen = false; state.personDraft = null; state.error = ""; render(); const dialog = mountedView && mountedView.querySelector('[role="dialog"]'); if (dialog) { dialog.tabIndex = -1; dialog.focus(); } else restoreFocus(); return false; },
      editPerson: function (id) { state.personDraft = clone((options.getSnapshot().taskPeople || []).find(function (person) { return person.id === id; })); render(); return false; },
      savePerson: function (event) {
        if (event) event.preventDefault();
        const input = mountedView.querySelector("#kanbanPersonName");
        const name = String(input && input.value || "").trim();
        if (!name) return fail("Bitte einen Namen eingeben.");
        const snapshot = options.getSnapshot(); const id = state.personDraft && state.personDraft.id;
        if (snapshot.taskPeople.some(function (person) { return person.id !== id && person.name.toLocaleLowerCase("de") === name.toLocaleLowerCase("de"); })) return fail("Diese Person ist bereits vorhanden.");
        const person = snapshot.taskPeople.find(function (item) { return item.id === id; });
        if (person) person.name = name;
        else snapshot.taskPeople.push({ id: model.createId("task-person"), name: name });
        state.personDraft = null; state.error = ""; options.save(snapshot); return false;
      },
      deletePerson: function (id) {
        if (!window.confirm("Person aus der Auswahl entfernen? Bestehende Verweise bleiben im Aufgabenverlauf nachvollziehbar.")) return false;
        const snapshot = options.getSnapshot();
        snapshot.taskPeople = snapshot.taskPeople.filter(function (person) { return person.id !== id; });
        options.save(snapshot); return false;
      },
      openLegacyTodo: function (id) {
        if (!api.canLeave()) return false;
        state.draft = null; state.protocolDraft = ""; options.openLegacyTodo(id); return false;
      }
    };
    window.setInterval(function () {
      const date = new Date().toDateString();
      if (date !== lastDate && mountedView && !state.draft && !state.peopleOpen && !dragCleanup) { lastDate = date; render(); }
    }, 60000);
    return api;
  };
}());

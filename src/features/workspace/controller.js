(function () {
  const ns = window.Unterrichtsassistent;
  const model = ns.features.workspace.model;
  function createController(options) {
    const esc = ns.shared.html.escapeHtml;
    const api = "window.UnterrichtsassistentApp.workspace";
    let range = "today", modal = null, dialog = null, opener = null, initialValues = "", saving = false, revision = 0, pendingWrite = null, pendingLeave = null, leaveConfirmed = false, leaveFocus = null;
    const getSnapshot = () => options.context().snapshot;
    const now = () => new Date().toISOString();
    const newId = prefix => prefix + "-" + window.crypto.randomUUID();
    const option = (value, label, selected) => '<option value="' + esc(value) + '"' + (selected === value ? ' selected' : '') + '>' + esc(label) + '</option>';
    const field = (label, name, value, type, required) => '<label class="ws-field"><span>' + esc(label) + '</span><input name="' + name + '" type="' + (type || 'text') + '" value="' + esc(value || '') + '"' + (required ? ' required' : '') + '></label>';
    const area = (label, name, value, placeholder) => '<label class="ws-field"><span>' + esc(label) + '</span><textarea name="' + name + '" rows="3" placeholder="' + esc(placeholder || '') + '">' + esc(value || '') + '</textarea></label>';
    const actionButton = (label, method, id) => '<button class="ws-button ws-button--quiet" type="button" data-id="' + esc(id) + '" onclick="' + api + '.' + method + '(this.dataset.id)">' + esc(label) + '</button>';
    function classField(selected, required) {
      return '<label class="ws-field"><span>Lerngruppe</span><select name="classId"' + (required ? ' required' : '') + ' onchange="' + api + '.changeClass(this.value)">' + (required ? option('', 'Lerngruppe wählen', selected) : option('', 'Allgemeine Aufgabe', selected)) + model.list(getSnapshot().classes).map(item => option(item.id, model.className(getSnapshot(), item.id), selected)).join('') + '</select></label>';
    }
    function studentOptions(classId, selected) {
      const group = model.list(getSnapshot().classes).find(item => item.id === classId);
      return option('', 'Gesamte Lerngruppe', selected) + model.list(group && group.studentIds).map(id => option(id, model.studentName(getSnapshot(), id), selected)).join('');
    }
    function formValues() {
      if (!dialog) return '';
      return JSON.stringify(Array.from(dialog.querySelectorAll('[name]')).map(element => [element.name, ['checkbox', 'radio'].includes(element.type) ? element.checked : element.value]));
    }
    function hasDraft() { return Boolean(modal && !['search', 'reflection-choice', 'history'].includes(modal.type) && formValues() !== initialValues); }
    function showError(error) {
      const node = dialog && dialog.querySelector('#workspaceError');
      if (node) { node.textContent = error.message || String(error) || 'Speichern fehlgeschlagen. Bitte erneut versuchen.'; node.hidden = false; }
    }
    function syncResourceStatusControls(syncValues) {
      if (!dialog) return;
      const entries = model.list(getSnapshot().lessonResources);
      dialog.querySelectorAll('.ws-resource select[data-id]').forEach(select => {
        const entry = entries.find(item => item.id === select.dataset.id);
        select.disabled = saving || Boolean(pendingWrite) || !entry;
        if (syncValues && entry) select.value = entry.status;
      });
    }
    function setSaving(value) { saving = value; syncResourceStatusControls(!value); }
    function canLeave(onDiscard) {
      if (saving) { showError('Speichern läuft. Bitte einen Moment warten.'); return false; }
      if (leaveConfirmed) { leaveConfirmed = false; return true; }
      if (!pendingWrite && !hasDraft()) return true;
      pendingLeave = onDiscard || (() => dismiss(true, true));
      leaveFocus = document.activeElement;
      const confirmation = dialog.querySelector('#workspaceLeaveConfirm');
      dialog.querySelector('#workspaceLeaveMessage').textContent = pendingWrite ? 'Die Änderungen sind in der App übernommen, aber noch nicht dauerhaft gespeichert. Du kannst die Sicherung anschließend über den Speicherstatus erneut versuchen. Dialog trotzdem verlassen?' : 'Ungespeicherte Eingaben verwerfen?';
      dialog.querySelector('#workspaceDiscardDraft').textContent = pendingWrite ? 'Dialog trotzdem verlassen' : 'Entwurf verwerfen';
      confirmation.hidden = false;
      dialog.querySelector('#workspaceKeepDraft').focus();
      return false;
    }
    function keepDraft() {
      pendingLeave = null;
      if (dialog) dialog.querySelector('#workspaceLeaveConfirm').hidden = true;
      if (leaveFocus && leaveFocus.isConnected) leaveFocus.focus();
      leaveFocus = null;
      return false;
    }
    function discardDraft() {
      if (!pendingLeave || saving) return false;
      const action = pendingLeave;
      pendingLeave = null; leaveFocus = null;
      if (dialog) dialog.querySelector('#workspaceLeaveConfirm').hidden = true;
      leaveConfirmed = true;
      try { action(); } finally { leaveConfirmed = false; }
      return false;
    }
    function clearDialog() {
      revision += 1;
      if (dialog) { dialog.close(); dialog.remove(); dialog = null; }
      modal = null; initialValues = ''; saving = false; pendingWrite = null; pendingLeave = null; leaveConfirmed = false; leaveFocus = null;
    }
    function dismiss(force, restoreFocus, onDiscard) {
      if (!force && !canLeave(onDiscard || (() => dismiss(false, restoreFocus)))) return false;
      clearDialog();
      if (restoreFocus && opener && opener.isConnected) opener.focus();
      opener = null;
      return true;
    }
    function close() { dismiss(false, true); return false; }
    function renderModal(title, body, submitLabel, state, onReady) {
      if (!canLeave(() => renderModal(title, body, submitLabel, state, onReady))) return false;
      const originalOpener = dialog ? opener : document.activeElement;
      clearDialog(); opener = originalOpener; modal = state;
      dialog = document.createElement('dialog'); dialog.className = 'ws-dialog'; dialog.id = 'workspaceDialog';
      dialog.setAttribute('aria-labelledby', 'workspaceDialogTitle');
      dialog.innerHTML = '<form id="workspaceForm" data-local-only-form method="post" action="about:blank" onsubmit="return ' + api + '.submit(event)"><header class="ws-dialog__header"><div><span class="ws-eyebrow">Unterrichtsassistent</span><h2 id="workspaceDialogTitle">' + esc(title) + '</h2></div><button class="ws-icon-button" type="button" aria-label="Schließen" onclick="' + api + '.close()">×</button></header><div class="ws-dialog__body">' + body + '<p id="workspaceError" role="alert" class="ws-error" hidden></p></div><div id="workspaceLeaveConfirm" class="ws-leave-confirm" hidden><p id="workspaceLeaveMessage" role="alert"></p><div class="ws-form-row"><button id="workspaceKeepDraft" class="ws-button ws-button--quiet" type="button" onclick="' + api + '.keepDraft()">Weiter bearbeiten</button><button id="workspaceDiscardDraft" class="ws-button ws-button--primary" type="button" onclick="' + api + '.discardDraft()">Entwurf verwerfen</button></div></div><footer class="ws-dialog__footer"><button class="ws-button ws-button--quiet" type="button" onclick="' + api + '.close()">Schließen</button>' + (submitLabel ? '<button class="ws-button ws-button--primary" type="submit">' + esc(submitLabel) + '</button>' : '') + '</footer></form>';
      document.body.appendChild(dialog); dialog.showModal();
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      if (onReady) onReady();
      initialValues = formValues();
      const first = dialog.querySelector('input:not([type=hidden]),textarea,select'); if (first) first.focus();
      return true;
    }
    function currentLessons() {
      const context = options.context();
      return model.list(context.snapshot.classes).flatMap(group => model.list(options.schedule(group.id).lessons).map(lesson => Object.assign({}, lesson, { classId: group.id })))
        .sort((a, b) => String(a.lessonDate).localeCompare(String(b.lessonDate)) || String(a.startTime).localeCompare(String(b.startTime)));
    }
    function lessonDetails(lesson) {
      const planId = model.list(lesson && lesson.lessonPlanIds)[0] || model.list(lesson && lesson.slots).map(slot => slot.assignedLessonId).find(Boolean) || '';
      const plan = model.list(getSnapshot().curriculumLessonPlans).find(item => item.id === planId);
      return { planId, plan, topic: plan ? plan.topic : 'Noch ohne Stundenplanung' };
    }
    function openReflection(classId, date, lessonId, planId) {
      const context = options.context();
      classId = classId || context.classId; date = date || context.date;
      const lessons = currentLessons().filter(item => item.classId === classId && item.lessonDate === date);
      const lesson = lessons.find(item => item.id === lessonId) || (!lessonId && lessons.find(item => item.startTime <= context.time && item.endTime > context.time)) || (!lessonId && lessons[0]);
      const planIds = Array.from(new Set(model.list(lesson && lesson.lessonPlanIds).concat(model.list(lesson && lesson.slots).map(slot => slot.assignedLessonId)).filter(Boolean)));
      if (!planId && planIds.length > 1) {
        renderModal('Stundenplanung auswählen', '<p class="ws-muted">Diesem Unterrichtsblock sind mehrere geplante Stunden zugeordnet. Für welche möchtest du den Rückblick festhalten?</p><label class="ws-field"><span>Geplante Stunde</span><select name="lessonPlanId" required>' + planIds.map(id => { const plan = model.list(context.snapshot.curriculumLessonPlans).find(item => item.id === id); return option(id, plan ? plan.topic : 'Nicht mehr vorhandene Planung', ''); }).join('') + '</select></label>', 'Weiter', { type: 'reflection-choice', data: { classId, lessonDate: date, lessonId: lesson ? lesson.id : lessonId || '' } });
        return false;
      }
      planId = planId || lessonDetails(lesson).planId;
      const selectedPlan = model.list(context.snapshot.curriculumLessonPlans).find(item => item.id === planId);
      const existing = model.list(context.snapshot.lessonReflections).find(item => item.classId === classId && item.lessonDate === date && item.lessonId === (lesson ? lesson.id : lessonId || '') && item.lessonPlanId === planId);
      const data = existing || { classId, lessonDate: date, lessonId: lesson ? lesson.id : lessonId || '', lessonPlanId: planId, topic: selectedPlan ? selectedPlan.topic : '', summary: '', remaining: '', nextStep: '', followUpDate: model.addDays(date, 1) };
      const complete = model.list(context.snapshot.curriculumLessonStepStatuses).filter(item => item.classId === classId && item.lessonDate === date && item.lessonPlanId === planId && item.isCompleted).length;
      const task = model.list(context.snapshot.todos).find(item => item.id === data.todoId);
      const cancelOption = task && !task.done && task.taskStatus !== 'done' ? '<label class="ws-confirm"><input type="checkbox" name="cancelNextStep"><span>Falls ich den nächsten Schritt leere: die offene Folgeaufgabe ausdrücklich abbrechen. Ihr Verlauf bleibt erhalten.</span></label>' : '';
      renderModal('Stunde abschließen', '<p class="ws-context">' + esc(model.className(context.snapshot, classId)) + ' · ' + esc(date) + (data.topic ? ' · ' + esc(data.topic) : '') + '</p><p class="ws-muted">' + (complete ? complete + ' Arbeitsschritte bereits abgeschlossen. ' : '') + 'Ein kurzer Rückblick genügt. Der nächste Schritt wird als verknüpfte Aufgabe angelegt.</p>' + area('Ergebnis', 'summary', data.summary, 'Was haben die Lernenden erreicht?') + area('Noch offen', 'remaining', data.remaining, 'Was braucht mehr Zeit oder eine Wiederholung?') + field('Nächster Schritt (optional)', 'nextStep', data.nextStep) + field('Erledigen bis', 'followUpDate', data.followUpDate, 'date') + cancelOption, 'Abschluss speichern', { type: 'reflection', data: Object.assign({}, data) });
      return false;
    }
    function actionForm(data, editing) {
      renderModal(editing ? 'Maßnahme bearbeiten' : 'Nächsten Lernschritt planen', classField(data.classId, true) + '<label class="ws-field"><span>Für wen?</span><select name="studentId" id="workspaceStudent">' + studentOptions(data.classId, data.studentId) + '</select></label>' + area('Ausgangspunkt / Beobachtung', 'sourceText', data.sourceText) + field('Konkrete Maßnahme', 'title', data.title, 'text', true) + field('Wirkung überprüfen am', 'dueDate', data.dueDate, 'date', true) + '<p class="ws-muted">Die Maßnahme erscheint in deinen Aufgaben und bleibt mit ihrer Beobachtung verbunden.</p>' + (editing ? actionButton('Maßnahme abbrechen', 'openCancelAction', data.id) : ''), editing ? 'Änderungen speichern' : 'Maßnahme planen', { type: 'action', data: Object.assign({}, data) }, () => {
        if (editing || data.sourceId) {
          dialog.querySelector('[name=classId]').disabled = true; dialog.querySelector('[name=studentId]').disabled = true;
          if (data.sourceId) dialog.querySelector('[name=sourceText]').readOnly = true;
        }
      });
      return false;
    }
    function openAction(sourceId, classId, studentId) {
      const context = options.context(), source = model.list(context.snapshot.knowledgeGapRecords).find(item => item.id === sourceId);
      return actionForm({ classId: source ? source.classId : classId || context.classId, studentId: source ? source.studentId : studentId || '', sourceId: source ? source.id : '', sourceText: source ? source.content : '', dueDate: model.addDays(context.date, 7) }, false);
    }
    function editAction(id) {
      const entry = model.list(getSnapshot().learningActions).find(item => item.id === id);
      if (!entry || ['reviewed', 'cancelled'].includes(entry.status)) return false;
      return actionForm(entry, true);
    }
    function openCancelAction(id) {
      const entry = model.list(getSnapshot().learningActions).find(item => item.id === id);
      if (!entry || ['reviewed', 'cancelled'].includes(entry.status)) return false;
      renderModal('Maßnahme abbrechen', '<p class="ws-context">' + esc(entry.title) + '</p><p class="ws-muted">Die Maßnahme und ihre Aufgabe werden beendet. Der bisherige Verlauf bleibt erhalten; es wird keine erfolgreiche Überprüfung eingetragen.</p>' + area('Begründung (optional)', 'reason', ''), 'Maßnahme abbrechen', { type: 'cancel-action', data: { id } });
      return false;
    }
    function openReview(id) {
      const entry = model.list(getSnapshot().learningActions).find(item => item.id === id); if (!entry) return false;
      const cancelled = entry.status === 'cancelled';
      const history = model.list(entry.reviews).length ? '<details class="ws-history"><summary>Bisherige Überprüfungen</summary>' + entry.reviews.map(review => '<p>' + esc(String(review.date || '').slice(0, 10)) + ' · ' + esc(review.outcome) + '</p>').join('') + '</details>' : '';
      const changes = model.list(entry.changes).length ? '<details class="ws-history"><summary>Änderungen der Maßnahme</summary>' + entry.changes.map(change => '<p>' + esc(String(change.date || '').slice(0, 10)) + ' · ' + esc(change.before.title) + ' → ' + esc(change.after.title) + ' · Termin: ' + esc(change.after.dueDate) + '</p>').join('') + '</details>' : '';
      renderModal(cancelled ? 'Abgebrochene Maßnahme' : 'Wirkung überprüfen', '<p class="ws-context">' + esc(entry.title) + '</p><p class="ws-muted">' + esc([model.studentName(getSnapshot(), entry.studentId), entry.sourceText].filter(Boolean).join(' · ')) + '</p>' + (cancelled ? '<p>Abgebrochen am ' + esc(String(entry.cancelledAt || '').slice(0, 10)) + (entry.cancellationReason ? ' · ' + esc(entry.cancellationReason) : '') + '</p>' : area('Was hat sich verändert?', 'outcome', '', 'Ergebnis der erneuten Beobachtung') + '<label class="ws-field"><span>Entscheidung</span><select name="decision"><option value="reviewed">Überprüfung abschließen</option><option value="continue">Weiterführen und erneut überprüfen</option></select></label>' + field('Neuer Termin bei Weiterführung', 'nextDate', model.addDays(options.context().date, 7), 'date')) + history + changes + (!['reviewed', 'cancelled'].includes(entry.status) ? '<div class="ws-form-row">' + actionButton('Bearbeiten', 'editAction', id) + actionButton('Maßnahme abbrechen', 'openCancelAction', id) + '</div>' : ''), cancelled ? '' : 'Ergebnis festhalten', { type: cancelled ? 'history' : 'review', data: Object.assign({}, entry) });
      return false;
    }
    function openQuick() {
      const context = options.context();
      renderModal('Schnell erfassen', field('Was ist zu tun?', 'title', '', 'text', true) + classField(context.classId || '', false) + field('Fällig am (optional)', 'dueDate', context.date, 'date') + area('Notiz (optional)', 'description', '', 'Nur das Wichtigste – Details kannst du später ergänzen.'), 'Aufgabe anlegen', { type: 'quick', data: {} }); return false;
    }
    function resourceFields(entry) {
      return field('Bezeichnung', 'title', entry.title, 'text', true) + field('Link', 'url', entry.url, 'url', true) + '<div class="ws-form-row"><label class="ws-field"><span>Fassung</span><select name="kind">' + option('material', 'Material / Arbeitsblatt', entry.kind || 'material') + option('solution', 'Lösung', entry.kind) + option('presentation', 'Präsentation', entry.kind) + '</select></label><label class="ws-field"><span>Status</span><select name="status">' + option('ready', 'Bereit', entry.status || 'ready') + option('print', 'Noch kopieren', entry.status) + option('prepare', 'Noch vorbereiten', entry.status) + '</select></label></div>';
    }
    function openResources(planId, classId) {
      const context = options.context(), plan = model.list(context.snapshot.curriculumLessonPlans).find(item => item.id === planId);
      if (!plan) return false;
      const sequence = model.list(context.snapshot.curriculumSequences).find(item => item.id === plan.sequenceId);
      const series = sequence && model.list(context.snapshot.curriculumSeries).find(item => item.id === sequence.seriesId);
      classId = classId || (series && series.classId) || context.classId;
      const entries = model.list(context.snapshot.lessonResources).filter(item => item.lessonPlanId === planId);
      const rows = entries.map(entry => {
        const url = model.safeUrl(entry.url);
        return '<div class="ws-resource"><div>' + (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(entry.title) + ' ↗</a>' : '<strong>' + esc(entry.title) + '</strong><p class="ws-muted">Link bitte korrigieren.</p>') + '<div class="ws-resource__actions">' + actionButton('Bearbeiten', 'editResource', entry.id) + actionButton('Entfernen', 'removeResource', entry.id) + '</div></div><select aria-label="Materialstatus: ' + esc(entry.title) + '" data-id="' + esc(entry.id) + '" onchange="' + api + '.resourceStatus(this.dataset.id,this.value)">' + option('prepare','Noch vorbereiten',entry.status) + option('print','Noch kopieren',entry.status) + option('ready','Bereit',entry.status) + '</select></div>';
      }).join('');
      renderModal('Material zur Stunde', '<p class="ws-context">' + esc(plan.topic) + '</p><div class="ws-resources">' + (rows || '<p class="ws-muted">Noch keine Materiallinks hinterlegt.</p>') + '</div><h3>Link hinzufügen</h3>' + resourceFields({}), 'Material verknüpfen', { type: 'resource', data: { lessonPlanId: planId, classId } }); return false;
    }
    function editResource(id) {
      const entry = model.list(getSnapshot().lessonResources).find(item => item.id === id); if (!entry) return false;
      renderModal('Materiallink bearbeiten', resourceFields(entry), 'Änderungen speichern', { type: 'resource', data: Object.assign({}, entry) }); return false;
    }
    async function removeResource(id) {
      const entry = model.list(getSnapshot().lessonResources).find(item => item.id === id); if (!entry || !canLeave(() => removeResource(id))) return false;
      if (!window.confirm('Materiallink „' + entry.title + '“ entfernen? Die verlinkte Datei selbst bleibt erhalten.')) return false;
      const snapshot = JSON.parse(JSON.stringify(getSnapshot())), operationRevision = revision;
      setSaving(true);
      try {
        model.removeResource(snapshot, id); const saved = await options.save(snapshot);
        if (revision === operationRevision) {
          setSaving(false); initialValues = formValues(); openResources(entry.lessonPlanId, entry.classId);
          if (saved === false) showError('Materiallink in der App entfernt, aber noch nicht dauerhaft gespeichert. Bitte die Sicherung über den Speicherstatus erneut versuchen.');
          else options.announce('Materiallink entfernt.');
        }
      } catch (error) { if (revision === operationRevision) showError(error); }
      finally { if (revision === operationRevision) setSaving(false); }
      return false;
    }
    function openSearch() {
      renderModal('In der App suchen', '<label class="ws-field"><span>Klasse, Person, Stunde, Aufgabe oder Material</span><input type="search" id="workspaceSearch" placeholder="Mindestens zwei Zeichen …" oninput="' + api + '.search(this.value)"></label><div id="workspaceSearchResults" aria-live="polite"><p class="ws-muted">Suche über alle Lerngruppen und Bereiche.</p></div>', '', { type: 'search', data: {} }); return false;
    }
    async function submit(event) {
      event.preventDefault(); if (!modal || !dialog || saving) return false;
      const form = event.target, draft = Object.assign({}, modal.data, Object.fromEntries(new FormData(form).entries())), type = modal.type;
      if (type === 'reflection-choice') { initialValues = formValues(); openReflection(draft.classId, draft.lessonDate, draft.lessonId, draft.lessonPlanId); return false; }
      const button = form.querySelector('[type=submit]'), operationRevision = revision;
      if (button) button.disabled = true; setSaving(true);
      try {
        if (pendingWrite) {
          const current = getSnapshot();
          const saved = await options.save(current === pendingWrite.before ? pendingWrite.snapshot : JSON.parse(JSON.stringify(current)));
          if (saved === false) throw new Error('Die Sicherung ist weiterhin fehlgeschlagen. Bitte erneut versuchen.');
          if (revision === operationRevision) { dismiss(true, true); options.announce('Änderungen dauerhaft gespeichert.'); }
          return false;
        }
        const before = getSnapshot(), snapshot = JSON.parse(JSON.stringify(before));
        if (type === 'reflection') model.saveReflection(snapshot, draft, now(), newId);
        if (type === 'action') model.saveAction(snapshot, draft, now(), newId);
        if (type === 'review') model.reviewAction(snapshot, draft.id, draft.outcome, draft.decision, draft.nextDate, now());
        if (type === 'cancel-action') model.cancelAction(snapshot, draft.id, draft.reason, now());
        if (type === 'resource') model.saveResource(snapshot, draft, now(), newId);
        if (type === 'quick') {
          if (!model.clean(draft.title)) throw new Error('Bitte einen Titel eingeben.');
          if (draft.classId && !model.list(snapshot.classes).some(item => item.id === draft.classId)) throw new Error('Die Lerngruppe ist nicht mehr verfügbar.');
          if (draft.dueDate && !model.validDate(draft.dueDate)) throw new Error('Bitte ein gültiges Datum eingeben.');
          model.newTask(snapshot, model.clean(draft.title), draft.classId, draft.dueDate, model.clean(draft.description), newId('todo'), now());
        }
        pendingWrite = { before, snapshot };
        const saved = await options.save(snapshot);
        if (saved === false) throw new Error('Die Änderungen sind in der App übernommen, aber noch nicht dauerhaft gespeichert. Bitte die Sicherung erneut versuchen.');
        if (revision === operationRevision) {
          dismiss(true, true);
          options.announce(type === 'reflection' ? 'Stundenabschluss gespeichert.' : type === 'review' ? 'Überprüfung festgehalten.' : type === 'cancel-action' ? 'Maßnahme abgebrochen.' : type === 'resource' ? 'Materiallink gespeichert.' : draft.id ? 'Änderungen gespeichert.' : 'Aufgabe angelegt.');
        }
      } catch (error) {
        if (revision === operationRevision) {
          showError(error);
          if (pendingWrite && dialog) {
            dialog.querySelectorAll('[name]').forEach(element => { element.disabled = true; });
            if (button) button.textContent = 'Sicherung erneut versuchen';
          }
        }
      }
      finally { if (revision === operationRevision) setSaving(false); if (button) button.disabled = false; }
      return false;
    }
    function navigate(target) { if (!dismiss(false, false, () => navigate(target))) return false; return options.navigate(target); }
    return {
      getRange: () => range,
      setRange(value) { range = value === 'week' ? 'week' : 'today'; options.refresh(); return false; },
      context: options.context, currentLessons, lessonDetails, openReflection, openAction, editAction, openCancelAction, openReview, openQuick, openResources, editResource, removeResource, openSearch, close, submit,
      canLeave, hasDraft, keepDraft, discardDraft,
      clear() { dismiss(true, false); range = 'today'; },
      changeClass(value) { const select = document.getElementById('workspaceStudent'); if (select) select.innerHTML = studentOptions(value, ''); },
      search(value) {
        const results = model.search(getSnapshot(), value), host = document.getElementById('workspaceSearchResults'); if (!host) return;
        host.innerHTML = results.map(item => '<button type="button" class="ws-search-result" data-kind="' + esc(item.type) + '" data-id="' + esc(item.id) + '" data-class="' + esc(item.classId || '') + '" onclick="' + api + '.openResult(this.dataset)"><strong>' + esc(item.title) + '</strong><span>' + esc(item.detail) + '</span></button>').join('') || '<p class="ws-muted">' + (model.clean(value).length < 2 ? 'Mindestens zwei Zeichen eingeben.' : 'Keine passenden Einträge gefunden.') + '</p>';
      },
      openResult(data) { if (!dismiss(false, true, () => this.openResult(data))) return false; if (data.kind === 'resource') return openResources(data.id, data.class); return options.navigate({ type: data.kind, id: data.id, classId: data.class }); },
      openLesson(classId, date, time, id, mode) { return navigate({ type: mode === 'plan' ? 'lesson' : 'live', classId, date, time, id }); },
      openTask(id) { return navigate({ type: 'task', id }); },
      openView(view) { return navigate({ type: 'view', view }); },
      async resourceStatus(id, status) {
        if (!['ready','print','prepare'].includes(status) || saving || pendingWrite) { syncResourceStatusControls(true); return; }
        const snapshot = JSON.parse(JSON.stringify(getSnapshot())), entry = model.list(snapshot.lessonResources).find(item => item.id === id); if (!entry) return;
        const error = dialog && dialog.querySelector('#workspaceError'); if (error) { error.hidden = true; error.textContent = ''; }
        const operationRevision = revision; setSaving(true);
        entry.status = status; entry.updatedAt = now();
        try { const saved = await options.save(snapshot); if (saved === false) throw new Error('Materialstatus in der App übernommen, aber noch nicht dauerhaft gespeichert. Bitte über den Speicherstatus erneut sichern.'); }
        catch (error) { if (revision === operationRevision) showError(error); }
        finally { if (revision === operationRevision) setSaving(false); }
      }
    };
  }
  ns.features.workspace.createController = createController;
}());


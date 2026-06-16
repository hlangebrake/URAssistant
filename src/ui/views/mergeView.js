window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.merge = {
  id: "merge",
  title: "Merge",
  render: function () {
    const state = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getMergeState === "function"
      ? window.UnterrichtsassistentApp.getMergeState()
      : { status: "empty", groups: [], totals: { added: 0, conflicts: 0 }, selectedDetail: null };
    const escapeValue = window.Unterrichtsassistent.ui.viewHelpers.escapeValue;
    const groups = Array.isArray(state.groups) ? state.groups : [];
    const totals = state.totals || {};
    const selectedDetail = state.selectedDetail || null;
    const status = String(state.status || "empty");
    const fileName = String(state.fileName || "").trim();
    const error = String(state.error || "").trim();

    function renderEmpty() {
      if (status === "error") {
        return '<div class="merge-view__empty merge-view__empty--error">' + escapeValue(error || "Der Speicherstand konnte nicht gelesen werden.") + '</div>';
      }

      if (status === "loading") {
        return '<div class="merge-view__empty">Speicherstand wird gelesen...</div>';
      }

      return '<div class="merge-view__empty">Noch kein Vergleich geladen.</div>';
    }

    function renderGroup(group) {
      const added = Array.isArray(group.added) ? group.added : [];
      const conflicts = Array.isArray(group.conflicts) ? group.conflicts : [];
      const groupKey = escapeValue(group.key);
      const rows = [];

      if (!added.length && !conflicts.length) {
        return "";
      }

      rows.push(
        '<details class="merge-group" open>',
          '<summary class="merge-group__summary">',
            '<span class="merge-group__name">', escapeValue(group.label), '</span>',
            '<span class="merge-group__counts">',
              added.length ? '<span class="merge-chip merge-chip--added">+' + added.length + '</span>' : '',
              conflicts.length ? '<span class="merge-chip merge-chip--conflict">' + conflicts.length + ' Konflikte</span>' : '',
            '</span>',
          '</summary>'
      );

      if (added.length) {
        rows.push('<div class="merge-group__section"><div class="merge-group__section-title">Neu</div><div class="merge-list">');
        added.forEach(function (item) {
          rows.push(
            '<button class="merge-row merge-row--added" type="button" onclick="return window.UnterrichtsassistentApp.selectMergeDetail(\'added\', \'', groupKey, '\', \'', escapeValue(item.id), '\')">',
              '<span class="merge-row__label">', escapeValue(item.label), '</span>',
              '<span class="merge-row__id">', escapeValue(item.id), '</span>',
            '</button>'
          );
        });
        rows.push('</div></div>');
      }

      if (conflicts.length) {
        rows.push('<div class="merge-group__section"><div class="merge-group__section-title">Konflikte</div><div class="merge-list">');
        conflicts.forEach(function (item) {
          const selectedSource = String(item.selectedSource || "current");
          rows.push(
            '<div class="merge-row merge-row--conflict">',
              '<button class="merge-row__main" type="button" onclick="return window.UnterrichtsassistentApp.selectMergeDetail(\'conflict\', \'', groupKey, '\', \'', escapeValue(item.id), '\')">',
                '<span class="merge-row__label">', escapeValue(item.label), '</span>',
                '<span class="merge-row__id">', escapeValue(item.id), '</span>',
              '</button>',
              '<select class="merge-row__select" aria-label="Version fuer Konflikt waehlen" onchange="return window.UnterrichtsassistentApp.setMergeConflictChoice(\'', groupKey, '\', \'', escapeValue(item.id), '\', this.value)">',
                '<option value="current"', selectedSource === "current" ? ' selected' : '', '>Aktuell</option>',
                '<option value="imported"', selectedSource === "imported" ? ' selected' : '', '>Import</option>',
              '</select>',
            '</div>'
          );
        });
        rows.push('</div></div>');
      }

      rows.push('</details>');
      return rows.join("");
    }

    function renderDetail() {
      if (!selectedDetail) {
        return '<aside class="merge-detail"><div class="merge-detail__empty">Datensatz anklicken, um Details zu sehen.</div></aside>';
      }

      return [
        '<aside class="merge-detail">',
          '<div class="merge-detail__header">',
            '<div>',
              '<h3>', escapeValue(selectedDetail.label || selectedDetail.id), '</h3>',
              '<div class="merge-detail__meta">', escapeValue(selectedDetail.collectionLabel || ""), ' | ', escapeValue(selectedDetail.id || ""), '</div>',
            '</div>',
          '</div>',
          '<div class="merge-detail__grid">',
            selectedDetail.currentJson
              ? '<section><h4>Aktuell</h4><pre>' + escapeValue(selectedDetail.currentJson) + '</pre></section>'
              : '',
            selectedDetail.importedJson
              ? '<section><h4>Import</h4><pre>' + escapeValue(selectedDetail.importedJson) + '</pre></section>'
              : '',
          '</div>',
        '</aside>'
      ].join("");
    }

    const hasResults = groups.some(function (group) {
      return (Array.isArray(group.added) && group.added.length) || (Array.isArray(group.conflicts) && group.conflicts.length);
    });

    return [
      '<div class="merge-view">',
        '<div class="merge-toolbar">',
          '<div class="merge-toolbar__summary">',
            '<strong>', fileName ? escapeValue(fileName) : 'Speicherstand zusammenfuehren', '</strong>',
            '<span>', Number(totals.added) || 0, ' neu</span>',
            '<span>', Number(totals.conflicts) || 0, ' Konflikte</span>',
          '</div>',
          '<div class="merge-toolbar__actions">',
            '<button class="circle-action circle-action--secondary" type="button" onclick="return window.UnterrichtsassistentApp.openMergeFilePicker()">Datei waehlen</button>',
            '<button class="circle-action" type="button"', hasResults ? '' : ' disabled', ' onclick="return window.UnterrichtsassistentApp.applyMerge()">Merge anwenden</button>',
          '</div>',
        '</div>',
        hasResults
          ? '<div class="merge-layout"><section class="merge-results">' + groups.map(renderGroup).join("") + '</section>' + renderDetail() + '</div>'
          : renderEmpty(),
      '</div>'
    ].join("");
  }
};

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

    function getSharedPrefixLength(left, right) {
      const maxLength = Math.min(left.length, right.length);
      let index = 0;

      while (index < maxLength && left.charAt(index) === right.charAt(index)) {
        index += 1;
      }

      return index;
    }

    function getSharedSuffixLength(left, right, prefixLength) {
      const maxLength = Math.min(left.length, right.length) - prefixLength;
      let index = 0;

      while (index < maxLength && left.charAt(left.length - 1 - index) === right.charAt(right.length - 1 - index)) {
        index += 1;
      }

      return index;
    }

    function renderChangedLine(line, otherLine, side) {
      const safeLine = String(line || "");
      const safeOtherLine = String(otherLine || "");
      const prefixLength = getSharedPrefixLength(safeLine, safeOtherLine);
      const suffixLength = getSharedSuffixLength(safeLine, safeOtherLine, prefixLength);
      const changedEnd = Math.max(prefixLength, safeLine.length - suffixLength);
      const before = safeLine.slice(0, prefixLength);
      const changed = safeLine.slice(prefixLength, changedEnd);
      const after = safeLine.slice(changedEnd);

      if (!changed) {
        return escapeValue(safeLine);
      }

      return [
        escapeValue(before),
        '<mark class="merge-diff__mark merge-diff__mark--', side, '">',
          escapeValue(changed),
        '</mark>',
        escapeValue(after)
      ].join("");
    }

    function buildJsonDiffRows(leftJson, rightJson) {
      const leftLines = String(leftJson || "").split("\n");
      const rightLines = String(rightJson || "").split("\n");
      const maxLength = Math.max(leftLines.length, rightLines.length);
      const rows = [];
      let index = 0;

      for (index = 0; index < maxLength; index += 1) {
        const leftLine = leftLines[index];
        const rightLine = rightLines[index];
        const hasLeft = typeof leftLine !== "undefined";
        const hasRight = typeof rightLine !== "undefined";
        const isChanged = leftLine !== rightLine;

        rows.push({
          left: hasLeft ? leftLine : "",
          right: hasRight ? rightLine : "",
          leftHtml: isChanged && hasLeft && hasRight
            ? renderChangedLine(leftLine, rightLine, "current")
            : escapeValue(hasLeft ? leftLine : ""),
          rightHtml: isChanged && hasLeft && hasRight
            ? renderChangedLine(rightLine, leftLine, "imported")
            : escapeValue(hasRight ? rightLine : ""),
          leftClass: !isChanged ? "" : (hasLeft ? " is-changed" : " is-missing"),
          rightClass: !isChanged ? "" : (hasRight ? " is-changed" : " is-missing")
        });
      }

      return rows;
    }

    function renderDiffPre(lines, side) {
      return '<pre class="merge-diff merge-diff--' + side + '">' + lines.map(function (line) {
        return '<span class="merge-diff__line' + (side === "current" ? line.leftClass : line.rightClass) + '">' + (side === "current" ? line.leftHtml : line.rightHtml) + '</span>';
      }).join("\n") + '</pre>';
    }

    function renderDetail() {
      const diffRows = selectedDetail && selectedDetail.currentJson && selectedDetail.importedJson
        ? buildJsonDiffRows(selectedDetail.currentJson, selectedDetail.importedJson)
        : null;

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
              ? '<section><h4>Aktuell</h4>' + (diffRows ? renderDiffPre(diffRows, "current") : '<pre class="merge-diff">' + escapeValue(selectedDetail.currentJson) + '</pre>') + '</section>'
              : '',
            selectedDetail.importedJson
              ? '<section><h4>Import</h4>' + (diffRows ? renderDiffPre(diffRows, "imported") : '<pre class="merge-diff">' + escapeValue(selectedDetail.importedJson) + '</pre>') + '</section>'
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

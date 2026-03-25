window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.klasse = {
  id: "klasse",
  title: "Lerngruppe",
  render: function (service) {
    const allStudents = service.snapshot.students || [];
    const tableRows = allStudents.map(function (student) {
      return [
        "<tr>",
        "<td>", student.firstName || "", "</td>",
        "<td>", student.lastName || "", "</td>",
        "<td>", student.className || "", "</td>",
        "<td>", student.gender || "", "</td>",
        "</tr>"
      ].join("");
    }).join("");

    return [
      '<div class="panel-grid panel-grid--klasse">',
      '<article class="panel panel--full">',
      '<div class="student-table-wrap">',
      '<table class="student-table">',
      "<thead><tr><th>Vorname</th><th>Nachname</th><th>Lerngruppe</th><th>Geschlecht</th></tr></thead>",
      "<tbody>",
      tableRows || '<tr><td colspan="4">Noch keine importierten oder vorhandenen Schuelerdaten.</td></tr>',
      "</tbody>",
      "</table>",
      "</div>",
      "</article>",
      '<div class="import-modal" id="classImportModal" hidden>',
      '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeClassImportModal()"></div>',
      '<div class="import-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="classImportTitle">',
      '<div class="import-modal__header">',
      '<h3 id="classImportTitle">Neue Lerngruppe anlegen</h3>',
      '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closeClassImportModal()">x</button>',
      "</div>",
      '<form class="import-modal__form" onsubmit="return window.UnterrichtsassistentApp.submitClassImport(event)">',
      '<label class="import-modal__field">',
      "<span>Fach</span>",
      '<input id="classSubjectInput" name="subject" type="text" placeholder="z. B. Mathematik" required>',
      "</label>",
      '<label class="import-modal__field">',
      "<span>CSV-Datei</span>",
      '<input id="studentCsvFile" name="csvFile" type="file" accept=".csv,.txt" required>',
      "</label>",
      '<p class="import-box__hint">Die Datei sollte Vorname, Langname, Klasse und Geschlecht enthalten.</p>',
      '<div class="import-modal__actions">',
      '<button class="import-box__label" type="submit">Lerngruppe anlegen</button>',
      "</div>",
      "</form>",
      "</div>",
      "</div>",
      "</div>"
    ].join("");
  }
};

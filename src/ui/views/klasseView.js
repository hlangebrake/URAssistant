window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.klasse = {
  id: "klasse",
  title: "Lerngruppe",
  getSubtitle: function (service) {
    const schoolClass = service.getActiveClass();

    if (!schoolClass) {
      return "";
    }

    return [schoolClass.name || "", schoolClass.subject || ""].join(" ").trim();
  },
  render: function (service) {
    const schoolClass = service.getActiveClass();
    const students = schoolClass ? service.getStudentsForClass(schoolClass.id) : [];
    function escapeValue(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    const tableRows = students.map(function (student) {
      return [
        '<tr data-student-id="', student.id, '">',
        '<td><input class="student-table__input" type="text" value="', escapeValue(student.firstName), '" onchange="window.UnterrichtsassistentApp.updateStudentField(\'', student.id, '\', \'firstName\', this.value)"></td>',
        '<td><input class="student-table__input" type="text" value="', escapeValue(student.lastName), '" onchange="window.UnterrichtsassistentApp.updateStudentField(\'', student.id, '\', \'lastName\', this.value)"></td>',
        '<td><input class="student-table__input" type="text" value="', escapeValue(student.gender), '" onchange="window.UnterrichtsassistentApp.updateStudentField(\'', student.id, '\', \'gender\', this.value)"></td>',
        '<td class="student-table__action-cell"><button class="row-delete-button" type="button" aria-label="Schueler loeschen" onclick="return window.UnterrichtsassistentApp.deleteStudent(\'', student.id, '\')">Entfernen</button></td>',
        "</tr>"
      ].join("");
    }).join("");

    return [
      '<div class="panel-grid panel-grid--klasse">',
      '<article class="panel panel--full">',
      schoolClass ? "" : '<p class="empty-message">Noch keine Lerngruppe angelegt. Lege ueber den Plus-Button zuerst eine Lerngruppe an.</p>',
      '<div class="student-table-wrap">',
      '<table class="student-table">',
      "<thead><tr><th>Vorname</th><th>Nachname</th><th>Geschlecht</th><th></th></tr></thead>",
      "<tbody>",
      tableRows || '<tr><td colspan="4">Noch keine Schuelerdaten in dieser Lerngruppe.</td></tr>',
      "</tbody>",
      "</table>",
      "</div>",
      schoolClass ? '<div class="table-actions"><button class="import-box__label" type="button" onclick="return window.UnterrichtsassistentApp.addStudentRow()">Neue Zeile</button></div>' : "",
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

window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.bewertung = {
  id: "bewertung",
  title: "Bewertung",
  render: function (service) {
    const activeClass = service && typeof service.getActiveClass === "function"
      ? service.getActiveClass()
      : null;
    const mode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getBewertungViewMode === "function"
      ? window.UnterrichtsassistentApp.getBewertungViewMode()
      : "bewerten";

    function escapeValue(value) {
      return String(value === undefined || value === null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/\\/g, "&#92;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/`/g, "&#96;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\r/g, "&#13;")
        .replace(/\n/g, "&#10;");
    }

    const classLabel = activeClass
      ? [String(activeClass.name || "").trim(), String(activeClass.subject || "").trim()].filter(Boolean).join(" ")
      : "keine aktive Lerngruppe";
    const modeLabels = {
      bewerten: "Bewerten",
      analysieren: "Analysieren",
      entwerfen: "Entwerfen"
    };
    const activeModeLabel = modeLabels[mode] || modeLabels.bewerten;

    return [
      '<div class="unterricht-layout">',
      '<article class="panel unterricht-layout__content">',
      '<div class="seat-plan-placeholder">',
      '<div>',
      '<strong>' + escapeValue(activeModeLabel) + '</strong><br>',
      escapeValue("Der Bereich Bewertung fuer " + classLabel + " wird hier aufgebaut."),
      '</div>',
      '</div>',
      '</article>',
      '</div>'
    ].join("");
  }
};

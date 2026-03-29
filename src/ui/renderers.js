window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};

function escapePanelHtml(value) {
  return String(value || "")
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

function renderPanels(viewElement, panels) {
  const panelGrid = viewElement.querySelector("[data-panel-grid]");
  if (!panelGrid) {
    return;
  }

  panelGrid.innerHTML = panels.map((panel) => `
    <article class="panel ${panel.hero ? "panel--hero" : ""}">
      <h2>${escapePanelHtml(panel.title)}</h2>
      <p>${escapePanelHtml(panel.text)}</p>
    </article>
  `).join("");
}

function renderCustomMarkup(viewElement, markup) {
  viewElement.innerHTML = markup;
}

window.Unterrichtsassistent.ui.renderPanels = renderPanels;
window.Unterrichtsassistent.ui.renderCustomMarkup = renderCustomMarkup;

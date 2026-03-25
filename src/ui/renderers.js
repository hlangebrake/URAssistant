window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};

function renderPanels(viewElement, panels) {
  const panelGrid = viewElement.querySelector("[data-panel-grid]");
  if (!panelGrid) {
    return;
  }

  panelGrid.innerHTML = panels.map((panel) => `
    <article class="panel ${panel.hero ? "panel--hero" : ""}">
      <h2>${panel.title}</h2>
      <p>${panel.text}</p>
    </article>
  `).join("");
}

function renderCustomMarkup(viewElement, markup) {
  viewElement.innerHTML = markup;
}

window.Unterrichtsassistent.ui.renderPanels = renderPanels;
window.Unterrichtsassistent.ui.renderCustomMarkup = renderCustomMarkup;

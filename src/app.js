const appShell = document.querySelector(".app-shell");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll("[data-view]");
const viewTitle = document.getElementById("viewTitle");
const viewHeaderActions = document.getElementById("viewHeaderActions");

const namespace = window.Unterrichtsassistent || {};
const dataLayer = namespace.data || {};
const servicesLayer = namespace.services || {};
const uiLayer = namespace.ui || {};
const domainLayer = namespace.domain || {};

const RepositoryClass = dataLayer.AppRepository;
const SchoolServiceClass = servicesLayer.SchoolService;
const registeredViews = uiLayer.viewConfig || {};
const renderPanelsFn = uiLayer.renderPanels;
const renderCustomMarkupFn = uiLayer.renderCustomMarkup;
const demoSnapshot = dataLayer.demoData;
const createSnapshot = domainLayer.createDomainSnapshot;
const serializeSnapshot = domainLayer.serializeDomainSnapshot;
const parseStudentCsvFn = dataLayer.parseStudentCsv;
const mergeImportedStudentsFn = dataLayer.mergeImportedStudents;

const repository = RepositoryClass ? new RepositoryClass() : null;

let schoolService = null;
let activeViewId = "unterricht";

function getClassImportModal() {
  return document.getElementById("classImportModal");
}

function eachNode(nodeList, callback) {
  Array.prototype.forEach.call(nodeList, callback);
}

function createFallbackService() {
  if (!SchoolServiceClass || !createSnapshot || !demoSnapshot) {
    return null;
  }

  return new SchoolServiceClass(createSnapshot(demoSnapshot));
}

function renderStartupError(message) {
  if (viewTitle && !viewTitle.textContent) {
    viewTitle.textContent = message;
  }
}

function updateHeaderActions(viewId) {
  if (!viewHeaderActions) {
    return;
  }

  if (viewId === "klasse") {
    viewHeaderActions.innerHTML = '<button class="circle-action" type="button" aria-label="Neue Lerngruppe anlegen" onclick="return window.UnterrichtsassistentApp.openClassImportModal()">+</button>';
    return;
  }

  viewHeaderActions.innerHTML = "";
}

function setActiveView(viewId) {
  activeViewId = viewId;
  const config = registeredViews[viewId];

  eachNode(navLinks, function (link) {
    const isActive = link.dataset.viewTarget === viewId;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });

  eachNode(views, function (view) {
    const isActive = view.id === viewId;
    view.classList.toggle("is-active", isActive);
    view.hidden = !isActive;

    if (isActive && config && schoolService) {
      if (typeof config.render === "function" && typeof renderCustomMarkupFn === "function") {
        renderCustomMarkupFn(view, config.render(schoolService));
      } else if (typeof renderPanelsFn === "function" && typeof config.buildPanels === "function") {
        renderPanelsFn(view, config.buildPanels(schoolService));
      }
    }
  });

  if (!config || !schoolService) {
    return;
  }

  viewTitle.textContent = config.title;
  updateHeaderActions(viewId);
}

function toggleMenu() {
  const isCollapsed = appShell.classList.toggle("is-collapsed");
  menuToggle.setAttribute("aria-expanded", String(!isCollapsed));
}

window.UnterrichtsassistentApp = window.UnterrichtsassistentApp || {};
window.UnterrichtsassistentApp.activateView = setActiveView;
window.UnterrichtsassistentApp.toggleMenu = toggleMenu;
window.UnterrichtsassistentApp.openClassImportModal = function () {
  const modal = getClassImportModal();

  if (modal) {
    modal.hidden = false;
    modal.classList.add("is-open");
  }

  return false;
};
window.UnterrichtsassistentApp.closeClassImportModal = function () {
  const modal = getClassImportModal();

  if (modal) {
    modal.hidden = true;
    modal.classList.remove("is-open");
  }

  return false;
};
window.UnterrichtsassistentApp.submitClassImport = function (event) {
  const form = event.target;
  const fileInput = form ? form.querySelector('input[name="csvFile"]') : null;
  const subjectInput = form ? form.querySelector('input[name="subject"]') : null;
  const file = fileInput && fileInput.files ? fileInput.files[0] : null;
  const subjectName = subjectInput ? String(subjectInput.value || "").trim() : "";
  const reader = new FileReader();

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!file || !subjectName || !repository || !schoolService || !parseStudentCsvFn || !mergeImportedStudentsFn || !serializeSnapshot) {
    return false;
  }

  reader.onload = function () {
    const rawText = String(reader.result || "");
    const importedStudents = parseStudentCsvFn(rawText);
    const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
    const nextRawSnapshot = mergeImportedStudentsFn(currentRawSnapshot, importedStudents, subjectName);

    repository.saveSnapshot(nextRawSnapshot).then(function () {
      schoolService = new SchoolServiceClass(createSnapshot(nextRawSnapshot));
      setActiveView("klasse");
      window.UnterrichtsassistentApp.closeClassImportModal();
    }).catch(function () {
      schoolService = new SchoolServiceClass(createSnapshot(nextRawSnapshot));
      setActiveView("klasse");
      window.UnterrichtsassistentApp.closeClassImportModal();
    });
  };

  reader.readAsText(file, "utf-8");
  return false;
};

async function startApp() {
  try {
    if (!repository || !SchoolServiceClass || !createSnapshot || !renderPanelsFn) {
      throw new Error("App-Module konnten nicht vollstaendig geladen werden.");
    }

    const snapshot = await repository.loadSnapshot();
    schoolService = new SchoolServiceClass(snapshot);
  } catch (error) {
    console.warn("IndexedDB nicht verfuegbar, nutze Demo-Daten im Speicher.", error);
    schoolService = createFallbackService();
    if (!schoolService) {
      renderStartupError("Startfehler: UI-Module geladen, aber Datenmodule fehlen.");
    }
  }

  setActiveView(activeViewId);
}

startApp().catch((error) => {
  console.error("Fehler beim Starten der App:", error);
  schoolService = createFallbackService();
  if (!schoolService) {
    renderStartupError("Startfehler: Navigation aktiv, aber Inhalte konnten nicht geladen werden.");
  }
  setActiveView(activeViewId);
});

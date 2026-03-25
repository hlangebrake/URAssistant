const appShell = document.querySelector(".app-shell");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll("[data-view]");
const viewTitle = document.getElementById("viewTitle");
const viewHeaderActions = document.getElementById("viewHeaderActions");
const viewSubtitle = document.getElementById("viewSubtitle");
const contentHeader = document.querySelector(".content__header");
const sidebar = document.getElementById("sidebar");
const activeClassBadge = document.getElementById("activeClassBadge");
const activeClassSelect = document.getElementById("activeClassSelect");
const collapsedClassPicker = document.getElementById("collapsedClassPicker");
const activeDateInput = document.getElementById("activeDateInput");
const activeTimeInput = document.getElementById("activeTimeInput");
const liveDateTimeButton = document.getElementById("liveDateTimeButton");
const collapsedLiveDateTimeButton = document.getElementById("collapsedLiveDateTimeButton");

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
const createEmptyClassFn = dataLayer.createEmptyClass;
const mergeImportedStudentsFn = dataLayer.mergeImportedStudents;
const createPastelColorFn = dataLayer.createPastelColor;

const repository = RepositoryClass ? new RepositoryClass() : null;

let schoolService = null;
let activeViewId = "unterricht";
let classViewMode = "analyse";
let timetableViewMode = "ansicht";
const timetableWeekdayKeys = ["1", "2", "3", "4", "5"];
let liveDateTimeIntervalId = null;

function getClassImportModal() {
  return document.getElementById("classImportModal");
}

function isClassManageMode() {
  return classViewMode === "verwalten";
}

function isTimetableManageMode() {
  return timetableViewMode === "verwalten";
}

function createDefaultTimetableDay() {
  return {
    classId: "",
    room: "",
    isDouble: false
  };
}

function createTimetableRow(type) {
  const rowType = type === "pause" ? "pause" : "lesson";
  const days = {};

  timetableWeekdayKeys.forEach(function (weekdayKey) {
    days[weekdayKey] = createDefaultTimetableDay();
  });

  return {
    id: "timetable-row-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    type: rowType,
    durationMinutes: rowType === "pause" ? 5 : 45,
    days: days
  };
}

function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function getYesterdayDateValue() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function getNowDateParts() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return {
    date: year + "-" + month + "-" + day,
    shortDate: day + "." + month + ".",
    time: hours + ":" + minutes
  };
}

function getActiveDateTimeParts() {
  const defaultParts = getNowDateParts();
  const activeMode = schoolService ? String(schoolService.snapshot.activeDateTimeMode || "live") : "live";

  if (activeMode === "live") {
    return defaultParts;
  }

  const activeDateTime = schoolService ? String(schoolService.snapshot.activeDateTime || "").trim() : "";
  const parsedDate = activeDateTime ? new Date(activeDateTime) : null;

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return defaultParts;
  }

  return {
    date: parsedDate.getFullYear() + "-" + String(parsedDate.getMonth() + 1).padStart(2, "0") + "-" + String(parsedDate.getDate()).padStart(2, "0"),
    time: String(parsedDate.getHours()).padStart(2, "0") + ":" + String(parsedDate.getMinutes()).padStart(2, "0")
  };
}

function isLiveDateTimeMode() {
  return !schoolService || String(schoolService.snapshot.activeDateTimeMode || "live") === "live";
}

function syncLiveDateTimeUi() {
  if (!schoolService || !isLiveDateTimeMode()) {
    return;
  }

  setActiveView(activeViewId);
}

function ensureLiveDateTimeRefresh() {
  if (liveDateTimeIntervalId) {
    return;
  }

  liveDateTimeIntervalId = window.setInterval(function () {
    syncLiveDateTimeUi();
  }, 5000);
}

function ensureTimetables(snapshot) {
  if (!Array.isArray(snapshot.timetables)) {
    snapshot.timetables = snapshot.timetable ? [snapshot.timetable] : [];
  }

  snapshot.timetables = snapshot.timetables.map(function (timetable, index) {
    const nextTimetable = timetable || {};

    if (!nextTimetable.id) {
      nextTimetable.id = "timetable-" + Date.now() + "-" + index;
    }

    if (!Array.isArray(nextTimetable.rows)) {
      nextTimetable.rows = [];
    }

    if (!nextTimetable.startTime) {
      nextTimetable.startTime = "07:50";
    }

    nextTimetable.validFrom = nextTimetable.validFrom || "";
    nextTimetable.validTo = nextTimetable.validTo || "";
    nextTimetable.rows = nextTimetable.rows.map(function (row) {
      const nextRow = row || {};

      if (!nextRow.days) {
        nextRow.days = {};
      }

      timetableWeekdayKeys.forEach(function (weekdayKey) {
        if (!nextRow.days[weekdayKey]) {
          nextRow.days[weekdayKey] = createDefaultTimetableDay();
        } else {
          nextRow.days[weekdayKey].classId = nextRow.days[weekdayKey].classId || "";
          nextRow.days[weekdayKey].room = nextRow.days[weekdayKey].room || "";
          nextRow.days[weekdayKey].isDouble = Boolean(nextRow.days[weekdayKey].isDouble);
        }
      });

      nextRow.type = nextRow.type === "pause" ? "pause" : "lesson";
      nextRow.durationMinutes = Number(nextRow.durationMinutes) || (nextRow.type === "pause" ? 5 : 45);
      return nextRow;
    });

    return nextTimetable;
  });

  if (!snapshot.activeTimetableId && snapshot.timetables[0]) {
    snapshot.activeTimetableId = snapshot.timetables[0].id;
  }

  delete snapshot.timetable;
  return snapshot.timetables;
}

function getManagedTimetableFromSnapshot(snapshot) {
  const timetables = ensureTimetables(snapshot);
  const activeTimetable = timetables.find(function (timetable) {
    return timetable.id === snapshot.activeTimetableId;
  });

  if (activeTimetable) {
    return activeTimetable;
  }

  snapshot.activeTimetableId = timetables[0] ? timetables[0].id : null;
  return timetables[0] || null;
}

function createTimetableRecord() {
  return {
    id: "timetable-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    validFrom: getTodayDateValue(),
    validTo: "",
    startTime: "07:50",
    rows: []
  };
}

function isValidTimeValue(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""));
}

function clearFollowingDoubleSpan(rows, startIndex, weekdayKey) {
  let rowIndex;

  for (rowIndex = startIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    if (!rows[rowIndex].days) {
      rows[rowIndex].days = {};
    }

    if (!rows[rowIndex].days[weekdayKey]) {
      rows[rowIndex].days[weekdayKey] = createDefaultTimetableDay();
    }

    rows[rowIndex].days[weekdayKey].classId = "";
    rows[rowIndex].days[weekdayKey].room = "";
    rows[rowIndex].days[weekdayKey].isDouble = false;

    if (rows[rowIndex].type === "lesson") {
      break;
    }
  }
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getClassDisplayName(schoolClass) {
  if (!schoolClass) {
    return "Keine Lerngruppe";
  }

  return [schoolClass.name || "", schoolClass.subject || ""].join(" ").trim() || "Keine Lerngruppe";
}

function getClassDisplayColor(schoolClass) {
  if (!schoolClass) {
    return "#d9d4cb";
  }

  if (schoolClass.displayColor) {
    return schoolClass.displayColor;
  }

  if (typeof createPastelColorFn === "function") {
    return createPastelColorFn((schoolClass.name || "") + "::" + (schoolClass.subject || "") + "::" + (schoolClass.id || ""));
  }

  return "#d9d4cb";
}

function formatDateLabel(dateValue) {
  if (!dateValue) {
    return "offen";
  }

  const parts = String(dateValue).split("-");

  if (parts.length !== 3) {
    return dateValue;
  }

  return parts[2] + "." + parts[1] + "." + parts[0];
}

function buildTimetableDropdownHtml() {
  const currentTimetable = schoolService ? schoolService.getCurrentTimetable() : null;
  const allTimetables = schoolService ? schoolService.getAllTimetables() : [];
  const managedTimetable = schoolService ? schoolService.getManagedTimetable() : null;
  const options = allTimetables.length
    ? allTimetables.map(function (timetable) {
        const label = currentTimetable && timetable.id === currentTimetable.id
          ? "aktuell"
          : "Gueltig bis: " + formatDateLabel(timetable.validTo);
        const selected = managedTimetable && managedTimetable.id === timetable.id ? ' selected' : "";
        return '<option value="' + escapeHtml(timetable.id) + '"' + selected + ">" + escapeHtml(label) + "</option>";
      }).join("")
    : '<option value="">Keine Stundenplaene</option>';

  return '<select id="activeTimetableSelect" class="sidebar__class-select timetable-select" aria-label="Gespeicherten Stundenplan waehlen" onchange="return window.UnterrichtsassistentApp.changeActiveTimetable(this.value)">' + options + "</select>";
}

function buildViewModeToggleHtml(options) {
  return '<div class="header-action-group"><div class="class-view-mode-toggle class-view-mode-toggle--header" role="tablist" aria-label="' + options.ariaLabel + '"><button class="class-view-mode-toggle__button' + (options.activeMode === options.leftMode ? " is-active" : "") + '" type="button" role="tab" aria-selected="' + (options.activeMode === options.leftMode ? "true" : "false") + '" onclick="return ' + options.leftAction + '">' + options.leftLabel + '</button><button class="class-view-mode-toggle__button' + (options.activeMode === options.rightMode ? " is-active" : "") + '" type="button" role="tab" aria-selected="' + (options.activeMode === options.rightMode ? "true" : "false") + '" onclick="return ' + options.rightAction + '">' + options.rightLabel + '</button></div>' + (options.trailingHtml ? '<div class="header-action-group__secondary">' + options.trailingHtml + "</div>" : "") + "</div>";
}

function renderActiveClassContext() {
  const classes = schoolService ? schoolService.getAllClasses() : [];
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const badgeLabel = activeClass ? (activeClass.name || "--") : "--";
  const activeDateTimeParts = getActiveDateTimeParts();

  if (activeClassBadge) {
    activeClassBadge.textContent = badgeLabel;
    activeClassBadge.style.background = getClassDisplayColor(activeClass);
    activeClassBadge.style.color = "var(--text)";
  }

  if (activeClassSelect) {
    activeClassSelect.innerHTML = classes.length
      ? classes.map(function (schoolClass) {
          const isSelected = activeClass && schoolClass.id === activeClass.id ? ' selected' : "";
          return '<option value="' + escapeHtml(schoolClass.id) + '"' + isSelected + '>' + escapeHtml(getClassDisplayName(schoolClass)) + "</option>";
        }).join("")
      : '<option value="">Keine Lerngruppe</option>';
    activeClassSelect.disabled = !classes.length;
  }

  if (collapsedClassPicker) {
    collapsedClassPicker.innerHTML = classes.length
      ? classes.map(function (schoolClass) {
          const isActive = activeClass && schoolClass.id === activeClass.id;
          return '<button class="collapsed-class-picker__item' + (isActive ? ' is-active' : '') + '" type="button" onclick="return window.UnterrichtsassistentApp.changeActiveClass(\'' + escapeHtml(schoolClass.id) + '\')">' + escapeHtml(getClassDisplayName(schoolClass)) + "</button>";
        }).join("")
      : '<div class="collapsed-class-picker__empty">Keine Lerngruppe</div>';
  }

  if (activeDateInput) {
    activeDateInput.value = activeDateTimeParts.date;
  }

  if (activeTimeInput) {
    activeTimeInput.value = activeDateTimeParts.time;
  }

  if (liveDateTimeButton) {
    liveDateTimeButton.classList.toggle("is-live", isLiveDateTimeMode());
    liveDateTimeButton.setAttribute("aria-pressed", String(isLiveDateTimeMode()));
  }

  if (collapsedLiveDateTimeButton) {
    collapsedLiveDateTimeButton.classList.toggle("is-live", isLiveDateTimeMode());
    collapsedLiveDateTimeButton.setAttribute("aria-pressed", String(isLiveDateTimeMode()));
  }
}

function updateHeaderSubtitle(viewId, config) {
  if (!viewSubtitle) {
    return;
  }

  if (viewId === "klasse" && config && typeof config.getSubtitle === "function" && schoolService) {
    const subtitle = config.getSubtitle(schoolService);
    viewSubtitle.textContent = subtitle;
    viewSubtitle.hidden = !subtitle;
    return;
  }

  viewSubtitle.textContent = "";
  viewSubtitle.hidden = true;
}

function updateHeaderActions(viewId) {
  if (!viewHeaderActions) {
    return;
  }

  if (contentHeader) {
    contentHeader.classList.remove("has-secondary-actions");
    contentHeader.classList.remove("has-secondary-actions--compact");
  }

  if (viewId === "klasse") {
    if (contentHeader && isClassManageMode()) {
      contentHeader.classList.add("has-secondary-actions");
      contentHeader.classList.add("has-secondary-actions--compact");
    }

    viewHeaderActions.innerHTML = buildViewModeToggleHtml({
      ariaLabel: "Ansicht der Lerngruppe wechseln",
      activeMode: classViewMode,
      leftMode: "analyse",
      leftLabel: "Analyse",
      leftAction: "window.UnterrichtsassistentApp.setClassViewMode('analyse')",
      rightMode: "verwalten",
      rightLabel: "Verwalten",
      rightAction: "window.UnterrichtsassistentApp.setClassViewMode('verwalten')",
      trailingHtml: isClassManageMode()
        ? '<button class="circle-action circle-action--danger" type="button" aria-label="Aktive Lerngruppe loeschen" onclick="return window.UnterrichtsassistentApp.deleteActiveClass()">-</button><button class="circle-action" type="button" aria-label="Neue Lerngruppe anlegen" onclick="return window.UnterrichtsassistentApp.openClassImportModal()">+</button>'
        : ""
    });
    return;
  }

  if (viewId === "stundenplan") {
    if (contentHeader && isTimetableManageMode()) {
      contentHeader.classList.add("has-secondary-actions");
    }

    viewHeaderActions.innerHTML = buildViewModeToggleHtml({
      ariaLabel: "Ansicht des Stundenplans wechseln",
      activeMode: timetableViewMode,
      leftMode: "ansicht",
      leftLabel: "Ansicht",
      leftAction: "window.UnterrichtsassistentApp.setTimetableViewMode('ansicht')",
      rightMode: "verwalten",
      rightLabel: "Verwalten",
      rightAction: "window.UnterrichtsassistentApp.setTimetableViewMode('verwalten')",
      trailingHtml: isTimetableManageMode()
        ? buildTimetableDropdownHtml() + '<button class="circle-action" type="button" aria-label="Neuen Stundenplan anlegen" onclick="return window.UnterrichtsassistentApp.createTimetable()">+</button>'
        : ""
    });
    return;
  }

  viewHeaderActions.innerHTML = "";
}

function setActiveView(viewId) {
  const previousViewId = activeViewId;
  activeViewId = viewId;
  const config = registeredViews[viewId];

  if (viewId === "klasse" && previousViewId !== "klasse") {
    classViewMode = "analyse";
  }

  if (viewId === "stundenplan" && previousViewId !== "stundenplan") {
    timetableViewMode = "ansicht";
  }

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
  updateHeaderSubtitle(viewId, config);
  updateHeaderActions(viewId);
  renderActiveClassContext();
}

function toggleMenu() {
  closeCollapsedClassPicker();
  const isCollapsed = appShell.classList.toggle("is-collapsed");
  menuToggle.setAttribute("aria-expanded", String(!isCollapsed));
}

function closeCollapsedClassPicker() {
  if (!sidebar || !activeClassBadge || !collapsedClassPicker) {
    return;
  }

  sidebar.classList.remove("is-class-picker-open");
  collapsedClassPicker.hidden = true;
  activeClassBadge.setAttribute("aria-expanded", "false");
}

function toggleCollapsedClassPicker() {
  if (!appShell || !sidebar || !activeClassBadge || !collapsedClassPicker) {
    return false;
  }

  if (!appShell.classList.contains("is-collapsed")) {
    return false;
  }

  if (sidebar.classList.contains("is-class-picker-open")) {
    closeCollapsedClassPicker();
  } else {
    sidebar.classList.add("is-class-picker-open");
    collapsedClassPicker.hidden = false;
    activeClassBadge.setAttribute("aria-expanded", "true");
  }

  return false;
}

function saveAndRefreshSnapshot(nextRawSnapshot, nextViewId) {
  return repository.saveSnapshot(nextRawSnapshot).then(function () {
    schoolService = new SchoolServiceClass(createSnapshot(nextRawSnapshot));
    setActiveView(nextViewId || activeViewId);
  }).catch(function () {
    schoolService = new SchoolServiceClass(createSnapshot(nextRawSnapshot));
    setActiveView(nextViewId || activeViewId);
  });
}

function createStudentId() {
  return "student-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

window.UnterrichtsassistentApp = window.UnterrichtsassistentApp || {};
window.UnterrichtsassistentApp.activateView = setActiveView;
window.UnterrichtsassistentApp.toggleMenu = toggleMenu;
window.UnterrichtsassistentApp.toggleCollapsedClassPicker = toggleCollapsedClassPicker;
window.UnterrichtsassistentApp.getClassDisplayColor = getClassDisplayColor;
window.UnterrichtsassistentApp.getClassViewMode = function () {
  return classViewMode;
};
window.UnterrichtsassistentApp.setClassViewMode = function (nextMode) {
  classViewMode = nextMode === "verwalten" ? "verwalten" : "analyse";

  if (activeViewId === "klasse") {
    setActiveView("klasse");
  }

  return false;
};
window.UnterrichtsassistentApp.getTimetableViewMode = function () {
  return timetableViewMode;
};
window.UnterrichtsassistentApp.setTimetableViewMode = function (nextMode) {
  timetableViewMode = nextMode === "verwalten" ? "verwalten" : "ansicht";

  if (activeViewId === "stundenplan") {
    setActiveView("stundenplan");
  }

  return false;
};
window.UnterrichtsassistentApp.changeActiveTimetable = function (timetableId) {
  if (!repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);

  ensureTimetables(currentRawSnapshot);
  currentRawSnapshot.activeTimetableId = timetableId || null;
  saveAndRefreshSnapshot(currentRawSnapshot, "stundenplan");
  return false;
};
window.UnterrichtsassistentApp.createTimetable = function () {
  if (!isTimetableManageMode() || !repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const timetables = ensureTimetables(currentRawSnapshot);
  const currentTimetable = schoolService.getCurrentTimetable();
  const nextTimetable = createTimetableRecord();
  const yesterdayValue = getYesterdayDateValue();

  if (currentTimetable) {
    timetables.forEach(function (timetable) {
      if (timetable.id === currentTimetable.id) {
        timetable.validTo = yesterdayValue;
      }
    });
  }

  timetables.unshift(nextTimetable);
  currentRawSnapshot.activeTimetableId = nextTimetable.id;
  timetableViewMode = "verwalten";
  saveAndRefreshSnapshot(currentRawSnapshot, "stundenplan");
  return false;
};
window.UnterrichtsassistentApp.changeActiveClass = function (classId) {
  if (!repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);

  currentRawSnapshot.activeClassId = classId || null;
  currentRawSnapshot.activeDateTimeMode = "manual";
  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId);
  closeCollapsedClassPicker();
  return false;
};
window.UnterrichtsassistentApp.setContextFromTimetableCell = function (classId, dateValue, timeValue, timetableId) {
  if (!repository || !schoolService || !classId || !dateValue || !timeValue) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);

  currentRawSnapshot.activeClassId = classId;
  currentRawSnapshot.activeDateTime = String(dateValue) + "T" + String(timeValue);
  currentRawSnapshot.activeDateTimeMode = "manual";

  if (timetableId) {
    currentRawSnapshot.activeTimetableId = timetableId;
  }

  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId);
  closeCollapsedClassPicker();
  return false;
};
window.UnterrichtsassistentApp.setLiveDateTimeMode = function () {
  if (!repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const currentParts = getNowDateParts();

  currentRawSnapshot.activeDateTime = currentParts.date + "T" + currentParts.time;
  currentRawSnapshot.activeDateTimeMode = "live";
  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId);
  return false;
};
window.UnterrichtsassistentApp.updateActiveDateTime = function (partName, nextValue) {
  if (!repository || !schoolService || ["date", "time"].indexOf(partName) === -1) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const currentParts = getActiveDateTimeParts();
  const trimmedValue = String(nextValue || "").trim();
  const activeClass = schoolService.getActiveClass();
  const wasLiveMode = isLiveDateTimeMode();

  if (partName === "date") {
    if (!trimmedValue) {
      return false;
    }
    currentParts.date = trimmedValue;
  } else {
    currentParts.time = trimmedValue;
  }

  if (!currentParts.date || !currentParts.time) {
    return false;
  }

  currentRawSnapshot.activeDateTime = currentParts.date + "T" + currentParts.time;
  currentRawSnapshot.activeDateTimeMode = "manual";

  if (wasLiveMode && activeClass) {
    currentRawSnapshot.activeClassId = activeClass.id;
  }

  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId);
  return false;
};
window.UnterrichtsassistentApp.openClassImportModal = function () {
  const modal = getClassImportModal();

  if (!isClassManageMode()) {
    return false;
  }

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
  const classNameInput = form ? form.querySelector('input[name="className"]') : null;
  const fileInput = form ? form.querySelector('input[name="csvFile"]') : null;
  const subjectInput = form ? form.querySelector('input[name="subject"]') : null;
  const file = fileInput && fileInput.files ? fileInput.files[0] : null;
  const className = classNameInput ? String(classNameInput.value || "").trim() : "";
  const subjectName = subjectInput ? String(subjectInput.value || "").trim() : "";
  const reader = new FileReader();

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!isClassManageMode()) {
    return false;
  }

  if (!subjectName || !repository || !schoolService || !serializeSnapshot) {
    return false;
  }

  if (!file) {
    if (!className) {
      return false;
    }

    saveAndRefreshSnapshot(createEmptyClassFn(serializeSnapshot(schoolService.snapshot), className, subjectName), "klasse").then(function () {
      window.UnterrichtsassistentApp.closeClassImportModal();
    });
    return false;
  }

  if (!parseStudentCsvFn || !mergeImportedStudentsFn) {
    return false;
  }

  reader.onload = function () {
    const rawText = String(reader.result || "");
    const importedStudents = parseStudentCsvFn(rawText);
    const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
    const nextRawSnapshot = mergeImportedStudentsFn(currentRawSnapshot, importedStudents, className, subjectName);

    saveAndRefreshSnapshot(nextRawSnapshot, "klasse").then(function () {
      window.UnterrichtsassistentApp.closeClassImportModal();
    });
  };

  reader.readAsText(file, "utf-8");
  return false;
};
window.UnterrichtsassistentApp.updateStudentField = function (studentId, fieldName, nextValue) {
  if (!isClassManageMode()) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const student = currentRawSnapshot.students.find(function (item) {
    return item.id === studentId;
  });

  if (!student || ["firstName", "lastName", "gender"].indexOf(fieldName) === -1) {
    return false;
  }

  student[fieldName] = String(nextValue || "").trim();
  saveAndRefreshSnapshot(currentRawSnapshot, "klasse");
  return false;
};
window.UnterrichtsassistentApp.updateActiveClassField = function (fieldName, nextValue) {
  if (!isClassManageMode()) {
    return false;
  }

  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const trimmedValue = String(nextValue || "").trim();

  if (!activeClass || ["name", "subject", "displayColor"].indexOf(fieldName) === -1) {
    return false;
  }

  if (fieldName === "name" && !trimmedValue) {
    return false;
  }

  currentRawSnapshot.classes = currentRawSnapshot.classes.map(function (schoolClass) {
    if (schoolClass.id === activeClass.id) {
      schoolClass[fieldName] = trimmedValue;
    }
    return schoolClass;
  });

  if (fieldName === "name") {
    currentRawSnapshot.students = currentRawSnapshot.students.map(function (student) {
      if ((activeClass.studentIds || []).indexOf(student.id) !== -1) {
        student.className = trimmedValue;
      }
      return student;
    });
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "klasse");
  return false;
};
window.UnterrichtsassistentApp.addStudentRow = function () {
  if (!isClassManageMode()) {
    return false;
  }

  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  let studentId;

  if (!activeClass) {
    return false;
  }

  studentId = createStudentId();
  currentRawSnapshot.students.push({
    id: studentId,
    firstName: "",
    lastName: "",
    className: activeClass.name || "",
    gender: "",
    strengths: [],
    gaps: [],
    attendanceRate: 1
  });

  currentRawSnapshot.classes = currentRawSnapshot.classes.map(function (schoolClass) {
    if (schoolClass.id === activeClass.id) {
      schoolClass.studentIds = schoolClass.studentIds || [];
      schoolClass.studentIds.push(studentId);
    }

    return schoolClass;
  });

  saveAndRefreshSnapshot(currentRawSnapshot, "klasse");
  return false;
};
window.UnterrichtsassistentApp.deleteStudent = function (studentId) {
  if (!isClassManageMode()) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);

  if (!window.confirm("Soll dieser Schueler mit allen zugehoerigen Daten dauerhaft geloescht werden?")) {
    return false;
  }

  currentRawSnapshot.students = currentRawSnapshot.students.filter(function (student) {
    return student.id !== studentId;
  });
  currentRawSnapshot.classes = currentRawSnapshot.classes.map(function (schoolClass) {
    schoolClass.studentIds = (schoolClass.studentIds || []).filter(function (linkedStudentId) {
      return linkedStudentId !== studentId;
    });
    return schoolClass;
  });
  currentRawSnapshot.assessments = currentRawSnapshot.assessments.filter(function (assessment) {
    return assessment.studentId !== studentId;
  });
  currentRawSnapshot.seatPlans = currentRawSnapshot.seatPlans.map(function (seatPlan) {
    seatPlan.seats = (seatPlan.seats || []).filter(function (seat) {
      return seat.studentId !== studentId;
    });
    return seatPlan;
  });

  saveAndRefreshSnapshot(currentRawSnapshot, "klasse");
  return false;
};
window.UnterrichtsassistentApp.updateTimetableStartTime = function (nextValue) {
  if (!isTimetableManageMode()) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const timetable = getManagedTimetableFromSnapshot(currentRawSnapshot);

  if (!timetable || !isValidTimeValue(nextValue)) {
    return false;
  }

  timetable.startTime = nextValue;
  saveAndRefreshSnapshot(currentRawSnapshot, "stundenplan");
  return false;
};
window.UnterrichtsassistentApp.updateTimetableDateField = function (fieldName, nextValue) {
  if (!isTimetableManageMode()) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const timetable = getManagedTimetableFromSnapshot(currentRawSnapshot);

  if (!timetable || ["validFrom", "validTo"].indexOf(fieldName) === -1) {
    return false;
  }

  timetable[fieldName] = String(nextValue || "");
  saveAndRefreshSnapshot(currentRawSnapshot, "stundenplan");
  return false;
};
window.UnterrichtsassistentApp.addTimetableRow = function () {
  if (!isTimetableManageMode()) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const timetable = getManagedTimetableFromSnapshot(currentRawSnapshot);

  if (!timetable) {
    return false;
  }

  timetable.rows.push(createTimetableRow("lesson"));
  saveAndRefreshSnapshot(currentRawSnapshot, "stundenplan");
  return false;
};
window.UnterrichtsassistentApp.updateTimetableRowField = function (rowId, fieldName, nextValue) {
  if (!isTimetableManageMode()) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const timetable = getManagedTimetableFromSnapshot(currentRawSnapshot);
  const row = timetable ? timetable.rows.find(function (item) {
    return item.id === rowId;
  }) : null;

  if (!timetable || !row) {
    return false;
  }

  if (fieldName === "type") {
    row.type = nextValue === "pause" ? "pause" : "lesson";
    row.durationMinutes = row.type === "pause" ? 5 : 45;

    timetableWeekdayKeys.forEach(function (weekdayKey) {
      row.days[weekdayKey] = createDefaultTimetableDay();
    });
  }

  if (fieldName === "durationMinutes") {
    row.durationMinutes = Number(nextValue) || (row.type === "pause" ? 5 : 45);
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "stundenplan");
  return false;
};
window.UnterrichtsassistentApp.updateTimetableClass = function (rowId, weekdayKey, classId) {
  if (!isTimetableManageMode()) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const timetable = getManagedTimetableFromSnapshot(currentRawSnapshot);
  const row = timetable ? timetable.rows.find(function (item) {
    return item.id === rowId;
  }) : null;
  const selectedClass = currentRawSnapshot.classes.find(function (schoolClass) {
    return schoolClass.id === classId;
  });

  if (!timetable || !row || row.type !== "lesson" || timetableWeekdayKeys.indexOf(String(weekdayKey)) === -1) {
    return false;
  }

  row.days[weekdayKey].classId = classId || "";

  if (!row.days[weekdayKey].classId) {
    row.days[weekdayKey].room = "";
    row.days[weekdayKey].isDouble = false;
    clearFollowingDoubleSpan(timetable.rows, timetable.rows.indexOf(row), weekdayKey);
  } else if (!row.days[weekdayKey].room) {
    row.days[weekdayKey].room = selectedClass && selectedClass.room ? selectedClass.room : "";
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "stundenplan");
  return false;
};
window.UnterrichtsassistentApp.updateTimetableRoom = function (rowId, weekdayKey, roomValue) {
  if (!isTimetableManageMode()) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const timetable = getManagedTimetableFromSnapshot(currentRawSnapshot);
  const row = timetable ? timetable.rows.find(function (item) {
    return item.id === rowId;
  }) : null;

  if (!timetable || !row || row.type !== "lesson" || timetableWeekdayKeys.indexOf(String(weekdayKey)) === -1) {
    return false;
  }

  row.days[weekdayKey].room = String(roomValue || "").trim();
  saveAndRefreshSnapshot(currentRawSnapshot, "stundenplan");
  return false;
};
window.UnterrichtsassistentApp.toggleTimetableDouble = function (rowId, weekdayKey, isChecked) {
  if (!isTimetableManageMode()) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const timetable = getManagedTimetableFromSnapshot(currentRawSnapshot);
  const rowIndex = timetable ? timetable.rows.findIndex(function (item) {
    return item.id === rowId;
  }) : -1;
  const row = rowIndex >= 0 ? timetable.rows[rowIndex] : null;

  if (!timetable || !row || row.type !== "lesson" || timetableWeekdayKeys.indexOf(String(weekdayKey)) === -1) {
    return false;
  }

  if (!row.days[weekdayKey].classId) {
    row.days[weekdayKey].isDouble = false;
    saveAndRefreshSnapshot(currentRawSnapshot, "stundenplan");
    return false;
  }

  row.days[weekdayKey].isDouble = Boolean(isChecked);

  if (row.days[weekdayKey].isDouble) {
    clearFollowingDoubleSpan(timetable.rows, rowIndex, weekdayKey);
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "stundenplan");
  return false;
};
window.UnterrichtsassistentApp.deleteActiveClass = function () {
  if (!isClassManageMode()) {
    return false;
  }

  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const studentIdsToDelete = {};
  let nextActiveClassId = null;

  if (!activeClass) {
    return false;
  }

  if (!window.confirm("Soll diese Lerngruppe mit allen Schuelern und allen zugehoerigen Daten dauerhaft geloescht werden?")) {
    return false;
  }

  (activeClass.studentIds || []).forEach(function (studentId) {
    studentIdsToDelete[studentId] = true;
  });

  currentRawSnapshot.students = currentRawSnapshot.students.filter(function (student) {
    return !studentIdsToDelete[student.id];
  });
  currentRawSnapshot.classes = currentRawSnapshot.classes.filter(function (schoolClass) {
    return schoolClass.id !== activeClass.id;
  });
  currentRawSnapshot.lessons = currentRawSnapshot.lessons.filter(function (lesson) {
    return lesson.classId !== activeClass.id;
  });
  currentRawSnapshot.assessments = currentRawSnapshot.assessments.filter(function (assessment) {
    return assessment.classId !== activeClass.id && !studentIdsToDelete[assessment.studentId];
  });
  currentRawSnapshot.todos = currentRawSnapshot.todos.filter(function (todo) {
    return todo.relatedClassId !== activeClass.id;
  });
  currentRawSnapshot.seatPlans = currentRawSnapshot.seatPlans.filter(function (seatPlan) {
    return seatPlan.classId !== activeClass.id;
  });
  ensureTimetables(currentRawSnapshot).forEach(function (timetable) {
    timetable.rows = timetable.rows.map(function (row) {
      timetableWeekdayKeys.forEach(function (weekdayKey) {
        if (row.days[weekdayKey] && row.days[weekdayKey].classId === activeClass.id) {
          row.days[weekdayKey] = createDefaultTimetableDay();
        }
      });
      return row;
    });
  });

  if (currentRawSnapshot.classes.length) {
    nextActiveClassId = currentRawSnapshot.classes[0].id;
  }

  currentRawSnapshot.activeClassId = nextActiveClassId;

  saveAndRefreshSnapshot(currentRawSnapshot, "klasse");
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

  ensureLiveDateTimeRefresh();
  setActiveView(activeViewId);
  renderActiveClassContext();
}

document.addEventListener("click", function (event) {
  if (!appShell || !sidebar || !appShell.classList.contains("is-collapsed")) {
    return;
  }

  if (!sidebar.contains(event.target)) {
    closeCollapsedClassPicker();
  }
});

startApp().catch((error) => {
  console.error("Fehler beim Starten der App:", error);
  schoolService = createFallbackService();
  if (!schoolService) {
    renderStartupError("Startfehler: Navigation aktiv, aber Inhalte konnten nicht geladen werden.");
  }
  setActiveView(activeViewId);
});

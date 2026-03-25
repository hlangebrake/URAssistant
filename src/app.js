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
let seatPlanViewMode = "ansicht";
let seatPlanManageMode = "sitzordnung";
let seatPlanDeskToolMode = "move";
let seatPlanMoveLinkMode = true;
let seatPlanRotateMode = "90";
let seatPlanMirrorMode = "horizontal";
const timetableWeekdayKeys = ["1", "2", "3", "4", "5"];
let liveDateTimeIntervalId = null;
let activeDeskLayoutDrag = null;
let activeDeskLayoutResize = null;
let deskLayoutDragFrameId = 0;

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
  if (!schoolService || !isLiveDateTimeMode() || activeDeskLayoutDrag || activeDeskLayoutResize) {
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

function normalizeDateValue(dateValue) {
  return String(dateValue || "").slice(0, 10);
}

function compareDateValues(leftValue, rightValue) {
  const left = normalizeDateValue(leftValue);
  const right = normalizeDateValue(rightValue);

  if (left === right) {
    return 0;
  }

  if (!left) {
    return -1;
  }

  if (!right) {
    return 1;
  }

  return left < right ? -1 : 1;
}

function getReferenceDateValue() {
  const referenceDate = schoolService ? schoolService.getReferenceDate() : new Date();
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const day = String(referenceDate.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

function getActiveSeatPlanClass() {
  return schoolService ? schoolService.getActiveClass() : null;
}

function getActiveSeatPlanRoom(activeClass) {
  const currentClass = activeClass || getActiveSeatPlanClass();
  const selectedRoom = schoolService ? String(schoolService.snapshot.activeSeatPlanRoom || "").trim() : "";
  const rooms = schoolService && currentClass ? schoolService.getRoomsForClass(currentClass.id) : [];

  if (schoolService && currentClass && isLiveDateTimeMode() && typeof schoolService.getLiveRoomForClass === "function") {
    return schoolService.getLiveRoomForClass(currentClass.id, schoolService.getReferenceDate()) || selectedRoom || rooms[0] || "";
  }

  if (selectedRoom && (!rooms.length || rooms.indexOf(selectedRoom) >= 0)) {
    return selectedRoom;
  }

  if (schoolService && currentClass) {
    return schoolService.getRelevantRoomForClass(currentClass.id, schoolService.getReferenceDate()) || rooms[0] || "";
  }

  return "";
}

function buildSeatPlanRoomControlHtml() {
  const activeClass = getActiveSeatPlanClass();
  const rooms = schoolService && activeClass ? schoolService.getRoomsForClass(activeClass.id) : [];
  const activeRoom = getActiveSeatPlanRoom(activeClass);

  if (!activeClass) {
    return "";
  }

  if (rooms.length <= 1) {
    return '<span class="content__subtitle-room-pill">' + escapeHtml(activeRoom || "Raum offen") + "</span>";
  }

  return '<select class="content__subtitle-room-select" aria-label="Raum fuer Sitzplan waehlen" onchange="return window.UnterrichtsassistentApp.changeActiveSeatPlanRoom(this.value)">' + rooms.map(function (room) {
    const isSelected = room === activeRoom ? ' selected' : "";
    return '<option value="' + escapeHtml(room) + '"' + isSelected + ">" + escapeHtml(room) + "</option>";
  }).join("") + "</select>";
}

function getSeatPlansForActiveRoom() {
  const activeClass = getActiveSeatPlanClass();
  const activeRoom = getActiveSeatPlanRoom(activeClass);

  if (!schoolService || !activeClass) {
    return [];
  }

  return schoolService.getSeatPlansForClassAndRoom(activeClass.id, activeRoom);
}

function buildSeatPlanDropdownHtml() {
  const activeClass = getActiveSeatPlanClass();
  const activeRoom = getActiveSeatPlanRoom(activeClass);
  const allSeatPlans = getSeatPlansForActiveRoom();
  const currentSeatPlan = schoolService && activeClass
    ? schoolService.getCurrentSeatPlan(activeClass.id, activeRoom, schoolService.getReferenceDate())
    : null;
  const managedSeatPlan = schoolService && activeClass
    ? schoolService.getManagedSeatPlan(activeClass.id, activeRoom)
    : null;
  const options = allSeatPlans.length
    ? allSeatPlans.map(function (seatPlan) {
        const label = currentSeatPlan && seatPlan.id === currentSeatPlan.id
          ? "aktuell"
          : "Gueltig bis: " + formatDateLabel(seatPlan.validTo);
        const selected = managedSeatPlan && seatPlan.id === managedSeatPlan.id ? ' selected' : "";
        return '<option value="' + escapeHtml(seatPlan.id) + '"' + selected + ">" + escapeHtml(label) + "</option>";
      }).join("")
    : '<option value="">Keine Tischordnungen</option>';

  return '<select id="activeSeatPlanSelect" class="sidebar__class-select timetable-select" aria-label="Gespeicherte Tischordnung waehlen" onchange="return window.UnterrichtsassistentApp.changeActiveSeatPlan(this.value)">' + options + "</select>";
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

function buildSecondaryModeToggleHtml(options) {
  return '<div class="class-view-mode-toggle class-view-mode-toggle--header class-view-mode-toggle--secondary" role="tablist" aria-label="' + options.ariaLabel + '"><button class="class-view-mode-toggle__button' + (options.activeMode === options.leftMode ? " is-active" : "") + '" type="button" role="tab" aria-selected="' + (options.activeMode === options.leftMode ? "true" : "false") + '" onclick="return ' + options.leftAction + '">' + options.leftLabel + '</button><button class="class-view-mode-toggle__button' + (options.activeMode === options.rightMode ? " is-active" : "") + '" type="button" role="tab" aria-selected="' + (options.activeMode === options.rightMode ? "true" : "false") + '" onclick="return ' + options.rightAction + '">' + options.rightLabel + '</button></div>';
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

  if (viewId === "sitzplan" && schoolService) {
    const activeClass = schoolService.getActiveClass();
    const subtitle = activeClass
      ? [activeClass.name || "", activeClass.subject || ""].join(" ").trim()
      : "";
    const roomControlHtml = activeClass ? buildSeatPlanRoomControlHtml() : "";

    if (!subtitle) {
      viewSubtitle.textContent = "";
      viewSubtitle.hidden = true;
      return;
    }

    viewSubtitle.innerHTML = '<span class="content__subtitle-inline"><span>' + escapeHtml(subtitle) + '</span>' + roomControlHtml + "</span>";
    viewSubtitle.hidden = false;
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
    contentHeader.classList.remove("has-secondary-actions--stacked");
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

  if (viewId === "sitzplan") {
    if (contentHeader && seatPlanViewMode === "verwalten") {
      contentHeader.classList.add("has-secondary-actions");

      if (seatPlanManageMode === "sitzordnung") {
        contentHeader.classList.add("has-secondary-actions--compact");
      } else {
        contentHeader.classList.add("has-secondary-actions--stacked");
      }
    }

    viewHeaderActions.innerHTML = buildViewModeToggleHtml({
      ariaLabel: "Ansicht des Sitzplans wechseln",
      activeMode: seatPlanViewMode,
      leftMode: "ansicht",
      leftLabel: "Ansicht",
      leftAction: "window.UnterrichtsassistentApp.setSeatPlanViewMode('ansicht')",
      rightMode: "verwalten",
      rightLabel: "Verwalten",
      rightAction: "window.UnterrichtsassistentApp.setSeatPlanViewMode('verwalten')",
      trailingHtml: seatPlanViewMode === "verwalten"
        ? '<div class="header-action-stack"><div class="header-action-stack__row">' + buildSecondaryModeToggleHtml({
            ariaLabel: "Verwaltungsmodus des Sitzplans wechseln",
            activeMode: seatPlanManageMode,
            leftMode: "sitzordnung",
            leftLabel: "Sitzordnung",
            leftAction: "window.UnterrichtsassistentApp.setSeatPlanManageMode('sitzordnung')",
            rightMode: "tischordnung",
            rightLabel: "Tischordnung",
            rightAction: "window.UnterrichtsassistentApp.setSeatPlanManageMode('tischordnung')"
          }) + '</div>' + (seatPlanManageMode === "tischordnung"
            ? '<div class="header-action-stack__row">' + buildSeatPlanDropdownHtml() + '<button class="circle-action" type="button" aria-label="Neue Tischordnung anlegen" onclick="return window.UnterrichtsassistentApp.createSeatPlan()">+</button></div>'
            : "") + "</div>"
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

  if (viewId === "sitzplan" && previousViewId !== "sitzplan") {
    seatPlanViewMode = "ansicht";
    seatPlanManageMode = "sitzordnung";
    seatPlanDeskToolMode = "move";
    seatPlanMoveLinkMode = true;
    seatPlanRotateMode = "90";
    seatPlanMirrorMode = "horizontal";
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

function createSeatPlanId() {
  return "seat-plan-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createDeskLayoutItemId() {
  return "desk-layout-item-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createDeskLayoutLinkId() {
  return "desk-layout-link-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function getDeskTemplateMetrics(deskType) {
  if (deskType === "tafel") {
    return {
      width: 320,
      height: 28
    };
  }

  if (deskType === "double" || deskType === "pult") {
    return {
      width: 156,
      height: 88
    };
  }

  return {
    width: 88,
    height: 88
  };
}

function normalizeDeskLayoutType(deskType) {
  if (deskType === "double" || deskType === "pult" || deskType === "tafel") {
    return deskType;
  }

  return "single";
}

function getDeskLayoutVisualVariant(deskType) {
  const normalizedType = normalizeDeskLayoutType(deskType);

  if (normalizedType === "pult") {
    return "pult";
  }

  if (normalizedType === "tafel") {
    return "tafel";
  }

  if (normalizedType === "double") {
    return "double";
  }

  return "single";
}

function clampValue(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildDeskLayoutSnapSequence(min, max, step) {
  const values = [];
  const safeStep = Math.max(Number(step) || 1, 1);
  let current = Number(min) || 0;
  const upperBound = Number(max) || 0;

  if (current > upperBound) {
    return [upperBound];
  }

  while (current <= upperBound) {
    values.push(current);
    current += safeStep;
  }

  if (!values.length || values[values.length - 1] !== upperBound) {
    values.push(upperBound);
  }

  return values;
}

function getDeskLayoutItemRect(item) {
  return {
    x: Number(item.x) || 0,
    y: Number(item.y) || 0,
    width: Number(item.width) || getDeskTemplateMetrics(item.type).width,
    height: Number(item.height) || getDeskTemplateMetrics(item.type).height
  };
}

function doDeskLayoutRectsOverlap(rectA, rectB) {
  return rectA.x < rectB.x + rectB.width
    && rectA.x + rectA.width > rectB.x
    && rectA.y < rectB.y + rectB.height
    && rectA.y + rectA.height > rectB.y;
}

function doDeskLayoutItemsOverlap(candidateItems, otherItems) {
  return (candidateItems || []).some(function (candidateItem) {
    const candidateRect = getDeskLayoutItemRect(candidateItem);

    return (otherItems || []).some(function (otherItem) {
      return doDeskLayoutRectsOverlap(candidateRect, getDeskLayoutItemRect(otherItem));
    });
  });
}

function findNearestFreeDeskLayoutItemPosition(currentItems, movingItem, excludedIds, desiredX, desiredY, canvasRect) {
  const snapSize = 12;
  const itemWidth = Number(movingItem.width) || getDeskTemplateMetrics(movingItem.type).width;
  const itemHeight = Number(movingItem.height) || getDeskTemplateMetrics(movingItem.type).height;
  const maxX = Math.max((canvasRect ? canvasRect.width : 0) - itemWidth, 0);
  const maxY = Math.max((canvasRect ? canvasRect.height : 0) - itemHeight, 0);
  const clampedDesiredX = clampValue(Number(desiredX) || 0, 0, maxX);
  const clampedDesiredY = clampValue(Number(desiredY) || 0, 0, maxY);
  const otherItems = (currentItems || []).filter(function (item) {
    return (excludedIds || []).indexOf(item.id) === -1;
  });
  const xValues = buildDeskLayoutSnapSequence(0, maxX, snapSize);
  const yValues = buildDeskLayoutSnapSequence(0, maxY, snapSize);
  let bestPosition = {
    x: clampedDesiredX,
    y: clampedDesiredY
  };
  let bestDistance = Number.POSITIVE_INFINITY;

  if (!doDeskLayoutItemsOverlap([{
    x: clampedDesiredX,
    y: clampedDesiredY,
    width: itemWidth,
    height: itemHeight,
    type: movingItem.type
  }], otherItems)) {
    return {
      x: clampedDesiredX,
      y: clampedDesiredY
    };
  }

  xValues.forEach(function (x) {
    yValues.forEach(function (y) {
      const candidate = {
        x: x,
        y: y,
        width: itemWidth,
        height: itemHeight,
        type: movingItem.type
      };
      const distance = Math.pow(x - clampedDesiredX, 2) + Math.pow(y - clampedDesiredY, 2);

      if (doDeskLayoutItemsOverlap([candidate], otherItems)) {
        return;
      }

      if (distance < bestDistance) {
        bestDistance = distance;
        bestPosition = {
          x: x,
          y: y
        };
      }
    });
  });

  return bestPosition;
}

function findNearestFreeDeskLayoutGroupDelta(currentItems, groupItems, excludedIds, desiredDeltaX, desiredDeltaY, canvasRect) {
  const snapSize = 12;
  const minX = Math.min.apply(null, (groupItems || []).map(function (item) { return Number(item.x) || 0; }));
  const minY = Math.min.apply(null, (groupItems || []).map(function (item) { return Number(item.y) || 0; }));
  const maxRight = Math.max.apply(null, (groupItems || []).map(function (item) {
    return (Number(item.x) || 0) + (Number(item.width) || getDeskTemplateMetrics(item.type).width);
  }));
  const maxBottom = Math.max.apply(null, (groupItems || []).map(function (item) {
    return (Number(item.y) || 0) + (Number(item.height) || getDeskTemplateMetrics(item.type).height);
  }));
  const minDeltaX = -minX;
  const minDeltaY = -minY;
  const maxDeltaX = Math.max((canvasRect ? canvasRect.width : 0) - maxRight, minDeltaX);
  const maxDeltaY = Math.max((canvasRect ? canvasRect.height : 0) - maxBottom, minDeltaY);
  const clampedDesiredDeltaX = clampValue(Number(desiredDeltaX) || 0, minDeltaX, maxDeltaX);
  const clampedDesiredDeltaY = clampValue(Number(desiredDeltaY) || 0, minDeltaY, maxDeltaY);
  const otherItems = (currentItems || []).filter(function (item) {
    return (excludedIds || []).indexOf(item.id) === -1;
  });
  const deltaXValues = buildDeskLayoutSnapSequence(minDeltaX, maxDeltaX, snapSize);
  const deltaYValues = buildDeskLayoutSnapSequence(minDeltaY, maxDeltaY, snapSize);
  let bestDelta = {
    deltaX: clampedDesiredDeltaX,
    deltaY: clampedDesiredDeltaY
  };
  let bestDistance = Number.POSITIVE_INFINITY;

  if (!doDeskLayoutItemsOverlap((groupItems || []).map(function (item) {
    return Object.assign({}, item, {
      x: (Number(item.x) || 0) + clampedDesiredDeltaX,
      y: (Number(item.y) || 0) + clampedDesiredDeltaY
    });
  }), otherItems)) {
    return {
      deltaX: clampedDesiredDeltaX,
      deltaY: clampedDesiredDeltaY
    };
  }

  deltaXValues.forEach(function (deltaX) {
    deltaYValues.forEach(function (deltaY) {
      const candidateItems = (groupItems || []).map(function (item) {
        return Object.assign({}, item, {
          x: (Number(item.x) || 0) + deltaX,
          y: (Number(item.y) || 0) + deltaY
        });
      });
      const distance = Math.pow(deltaX - clampedDesiredDeltaX, 2) + Math.pow(deltaY - clampedDesiredDeltaY, 2);

      if (doDeskLayoutItemsOverlap(candidateItems, otherItems)) {
        return;
      }

      if (distance < bestDistance) {
        bestDistance = distance;
        bestDelta = {
          deltaX: deltaX,
          deltaY: deltaY
        };
      }
    });
  });

  return bestDelta;
}

function getDeskLayoutCanvasElement() {
  return document.getElementById("deskLayoutCanvas");
}

function setDeskLayoutItemsHidden(itemIds, shouldHide) {
  (itemIds || []).forEach(function (itemId) {
    const element = document.querySelector('[data-desk-item-id="' + itemId + '"]');

    if (!element) {
      return;
    }

    element.classList.toggle("is-drag-hidden", Boolean(shouldHide));
  });
}

function detachDeskLayoutPointerListeners() {
  window.removeEventListener("pointermove", window.UnterrichtsassistentApp.handleDeskLayoutPointerMove);
  window.removeEventListener("pointerup", window.UnterrichtsassistentApp.handleDeskLayoutPointerEnd);
  window.removeEventListener("pointercancel", window.UnterrichtsassistentApp.handleDeskLayoutPointerEnd);
}

function attachDeskLayoutPointerListeners() {
  detachDeskLayoutPointerListeners();
  window.addEventListener("pointermove", window.UnterrichtsassistentApp.handleDeskLayoutPointerMove);
  window.addEventListener("pointerup", window.UnterrichtsassistentApp.handleDeskLayoutPointerEnd);
  window.addEventListener("pointercancel", window.UnterrichtsassistentApp.handleDeskLayoutPointerEnd);
}

function finishDeskLayoutResize(options) {
  const shouldRerender = !options || options.refreshView !== false;

  if (activeDeskLayoutResize && activeDeskLayoutResize.sourceElement && typeof activeDeskLayoutResize.sourceElement.releasePointerCapture === "function" && typeof activeDeskLayoutResize.pointerId === "number") {
    try {
      activeDeskLayoutResize.sourceElement.releasePointerCapture(activeDeskLayoutResize.pointerId);
    } catch (error) {
      // Ignore capture-release errors and continue cleanup.
    }
  }

  document.body.classList.remove("is-desk-dragging");

  if (!activeDeskLayoutDrag) {
    detachDeskLayoutPointerListeners();
  }

  activeDeskLayoutResize = null;

  if (shouldRerender && activeViewId === "sitzplan") {
    setActiveView("sitzplan");
  }
}

function removeDeskLayoutDragPreview() {
  if (activeDeskLayoutDrag && activeDeskLayoutDrag.previewElement && activeDeskLayoutDrag.previewElement.parentNode) {
    activeDeskLayoutDrag.previewElement.parentNode.removeChild(activeDeskLayoutDrag.previewElement);
  }
}

function removeDeskLayoutLinkPreview() {
  if (!activeDeskLayoutDrag || !Array.isArray(activeDeskLayoutDrag.linkPreviewElements)) {
    return;
  }

  activeDeskLayoutDrag.linkPreviewElements.forEach(function (element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  activeDeskLayoutDrag.linkPreviewElements = [];
}

function finishDeskLayoutDrag(options) {
  const shouldRestoreHiddenItems = !options || options.restoreHiddenItems !== false;

  if (activeDeskLayoutDrag && activeDeskLayoutDrag.sourceElement && typeof activeDeskLayoutDrag.sourceElement.releasePointerCapture === "function" && typeof activeDeskLayoutDrag.pointerId === "number") {
    try {
      activeDeskLayoutDrag.sourceElement.releasePointerCapture(activeDeskLayoutDrag.pointerId);
    } catch (error) {
      // Ignore capture-release errors and finish cleanup anyway.
    }
  }

  if (shouldRestoreHiddenItems && activeDeskLayoutDrag && Array.isArray(activeDeskLayoutDrag.hiddenItemIds) && activeDeskLayoutDrag.hiddenItemIds.length) {
    setDeskLayoutItemsHidden(activeDeskLayoutDrag.hiddenItemIds, false);
  }

  if (deskLayoutDragFrameId) {
    window.cancelAnimationFrame(deskLayoutDragFrameId);
    deskLayoutDragFrameId = 0;
  }

  document.body.classList.remove("is-desk-dragging");

  if (!activeDeskLayoutResize) {
    detachDeskLayoutPointerListeners();
  }
  removeDeskLayoutLinkPreview();
  removeDeskLayoutDragPreview();
  activeDeskLayoutDrag = null;
}

function createDeskLayoutPreviewElement(deskType, width, height) {
  const metrics = {
    width: Number(width) || getDeskTemplateMetrics(deskType).width,
    height: Number(height) || getDeskTemplateMetrics(deskType).height
  };
  const previewElement = document.createElement("div");
  const visualVariant = getDeskLayoutVisualVariant(deskType);

  previewElement.className = "desk-layout-drag-preview desk-layout-drag-preview--" + visualVariant;
  previewElement.style.width = metrics.width + "px";
  previewElement.style.height = metrics.height + "px";
  previewElement.style.left = "0";
  previewElement.style.top = "0";
  document.body.appendChild(previewElement);
  return previewElement;
}

function createDeskLayoutGroupPreviewElement(groupItems) {
  const previewElement = document.createElement("div");
  const minX = Math.min.apply(null, groupItems.map(function (item) { return Number(item.x) || 0; }));
  const minY = Math.min.apply(null, groupItems.map(function (item) { return Number(item.y) || 0; }));
  const maxRight = Math.max.apply(null, groupItems.map(function (item) {
    return (Number(item.x) || 0) + (Number(item.width) || getDeskTemplateMetrics(item.type).width);
  }));
  const maxBottom = Math.max.apply(null, groupItems.map(function (item) {
    return (Number(item.y) || 0) + (Number(item.height) || getDeskTemplateMetrics(item.type).height);
  }));

  previewElement.className = "desk-layout-drag-preview desk-layout-drag-preview--group";
  previewElement.style.width = (maxRight - minX) + "px";
  previewElement.style.height = (maxBottom - minY) + "px";
  previewElement.style.left = "0";
  previewElement.style.top = "0";

  groupItems.forEach(function (item) {
    const itemType = getDeskLayoutVisualVariant(item.type);
    const child = document.createElement("div");

    child.className = "desk-layout-drag-preview__item desk-layout-drag-preview__item--" + itemType;
    child.style.left = ((Number(item.x) || 0) - minX) + "px";
    child.style.top = ((Number(item.y) || 0) - minY) + "px";
    child.style.width = (Number(item.width) || getDeskTemplateMetrics(item.type).width) + "px";
    child.style.height = (Number(item.height) || getDeskTemplateMetrics(item.type).height) + "px";
    previewElement.appendChild(child);
  });

  document.body.appendChild(previewElement);
  return {
    element: previewElement,
    minX: minX,
    minY: minY
  };
}

function updateDeskLayoutDragPreview(clientX, clientY) {
  if (!activeDeskLayoutDrag || !activeDeskLayoutDrag.previewElement) {
    return;
  }

  activeDeskLayoutDrag.previewElement.style.transform = "translate3d(" + Math.round(clientX) + "px, " + Math.round(clientY) + "px, 0)";
}

function getDeskLayoutItemById(items, itemId) {
  return (items || []).find(function (item) {
    return item.id === itemId;
  }) || null;
}

function getDeskLayoutLinksForItem(links, itemId) {
  return (links || []).filter(function (link) {
    return link.itemAId === itemId || link.itemBId === itemId;
  });
}

function getLinkedDeskGroupItemIds(items, links, rootItemId) {
  const pending = [rootItemId];
  const visited = {};

  while (pending.length) {
    const currentItemId = pending.shift();

    if (!currentItemId || visited[currentItemId]) {
      continue;
    }

    visited[currentItemId] = true;
    getDeskLayoutLinksForItem(links, currentItemId).forEach(function (link) {
      const nextItemId = link.itemAId === currentItemId ? link.itemBId : link.itemAId;

      if (nextItemId && !visited[nextItemId]) {
        pending.push(nextItemId);
      }
    });
  }

  return (items || []).filter(function (item) {
    return visited[item.id];
  }).map(function (item) {
    return item.id;
  });
}

function removeDeskLayoutLinksForItem(seatPlan, itemId) {
  const currentLinks = Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];

  seatPlan.deskLayoutLinks = currentLinks.filter(function (link) {
    return link.itemAId !== itemId && link.itemBId !== itemId;
  });
}

function upsertDeskLayoutLink(seatPlan, itemAId, itemBId, sideA, sideB) {
  const currentLinks = Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];
  let didUpdate = false;

  seatPlan.deskLayoutLinks = currentLinks.map(function (link) {
    const isSamePair = (link.itemAId === itemAId && link.itemBId === itemBId) || (link.itemAId === itemBId && link.itemBId === itemAId);

    if (!isSamePair) {
      return link;
    }

    didUpdate = true;
    return {
      id: link.id || createDeskLayoutLinkId(),
      itemAId: itemAId,
      itemBId: itemBId,
      sideA: sideA,
      sideB: sideB
    };
  });

  if (!didUpdate) {
    seatPlan.deskLayoutLinks.push({
      id: createDeskLayoutLinkId(),
      itemAId: itemAId,
      itemBId: itemBId,
      sideA: sideA,
      sideB: sideB
    });
  }
}

function getDeskLayoutLinkCandidate(items, links, movingItem, nextX, nextY, movingGroupIds) {
  const snapDistance = 24;
  const overlapTolerance = 20;
  const movingWidth = Number(movingItem.width) || getDeskTemplateMetrics(movingItem.type).width;
  const movingHeight = Number(movingItem.height) || getDeskTemplateMetrics(movingItem.type).height;
  let bestCandidate = null;

  (items || []).forEach(function (otherItem) {
    const otherWidth = Number(otherItem.width) || getDeskTemplateMetrics(otherItem.type).width;
    const otherHeight = Number(otherItem.height) || getDeskTemplateMetrics(otherItem.type).height;
    const currentGroup = movingGroupIds || [];
    const overlapsVertically = Math.min(nextY + movingHeight, otherItem.y + otherHeight) - Math.max(nextY, otherItem.y);
    const overlapsHorizontally = Math.min(nextX + movingWidth, otherItem.x + otherWidth) - Math.max(nextX, otherItem.x);
    const existingLink = (links || []).some(function (link) {
      return (link.itemAId === movingItem.id && link.itemBId === otherItem.id) || (link.itemAId === otherItem.id && link.itemBId === movingItem.id);
    });

    function rememberCandidate(candidate) {
      if (!bestCandidate || candidate.distance < bestCandidate.distance) {
        bestCandidate = candidate;
      }
    }

    if (!otherItem || otherItem.id === movingItem.id || currentGroup.indexOf(otherItem.id) >= 0 || existingLink) {
      return;
    }

    if (overlapsVertically > overlapTolerance) {
      rememberCandidate({
        distance: Math.abs((nextX + movingWidth) - otherItem.x),
        x: otherItem.x - movingWidth,
        y: nextY,
        itemAId: movingItem.id,
        itemBId: otherItem.id,
        sideA: "right",
        sideB: "left"
      });
      rememberCandidate({
        distance: Math.abs(nextX - (otherItem.x + otherWidth)),
        x: otherItem.x + otherWidth,
        y: nextY,
        itemAId: movingItem.id,
        itemBId: otherItem.id,
        sideA: "left",
        sideB: "right"
      });
    }

    if (overlapsHorizontally > overlapTolerance) {
      rememberCandidate({
        distance: Math.abs((nextY + movingHeight) - otherItem.y),
        x: nextX,
        y: otherItem.y - movingHeight,
        itemAId: movingItem.id,
        itemBId: otherItem.id,
        sideA: "bottom",
        sideB: "top"
      });
      rememberCandidate({
        distance: Math.abs(nextY - (otherItem.y + otherHeight)),
        x: nextX,
        y: otherItem.y + otherHeight,
        itemAId: movingItem.id,
        itemBId: otherItem.id,
        sideA: "top",
        sideB: "bottom"
      });
    }
  });

  if (!bestCandidate || bestCandidate.distance > snapDistance) {
    return null;
  }

  return bestCandidate;
}

function getDeskLayoutItemLinkBounds(item, side) {
  const x = Number(item.x) || 0;
  const y = Number(item.y) || 0;
  const width = Number(item.width) || getDeskTemplateMetrics(item.type).width;
  const height = Number(item.height) || getDeskTemplateMetrics(item.type).height;

  if (side === "left") {
    return { x: x, y: y + (height / 2), width: 0, height: height };
  }

  if (side === "right") {
    return { x: x + width, y: y + (height / 2), width: 0, height: height };
  }

  if (side === "top") {
    return { x: x + (width / 2), y: y, width: width, height: 0 };
  }

  return { x: x + (width / 2), y: y + height, width: width, height: 0 };
}

function createDeskLayoutLinkPreviewElement(styleText) {
  const element = document.createElement("div");

  element.className = "desk-layout-link-preview";
  element.style.cssText = styleText;
  document.body.appendChild(element);
  return element;
}

function buildDeskLayoutLinkPreviewStyles(movingItem, otherItem, sideA, sideB, canvasRect) {
  const movingX = Number(movingItem.x) || 0;
  const movingY = Number(movingItem.y) || 0;
  const movingWidth = Number(movingItem.width) || getDeskTemplateMetrics(movingItem.type).width;
  const movingHeight = Number(movingItem.height) || getDeskTemplateMetrics(movingItem.type).height;
  const otherX = Number(otherItem.x) || 0;
  const otherY = Number(otherItem.y) || 0;
  const otherWidth = Number(otherItem.width) || getDeskTemplateMetrics(otherItem.type).width;
  const otherHeight = Number(otherItem.height) || getDeskTemplateMetrics(otherItem.type).height;
  let overlapStart;
  let overlapEnd;
  let movingStyle;
  let otherStyle;

  if (sideA === "left" || sideA === "right") {
    overlapStart = Math.max(movingY, otherY);
    overlapEnd = Math.min(movingY + movingHeight, otherY + otherHeight);

    if (overlapEnd - overlapStart < 12) {
      return [];
    }

    movingStyle = [
      "left:" + String(canvasRect.left + (sideA === "right" ? movingX + movingWidth : movingX) - 7) + "px",
      "top:" + String(canvasRect.top + overlapStart + 6) + "px",
      "width:14px",
      "height:" + String(Math.max(overlapEnd - overlapStart - 12, 12)) + "px"
    ].join(";");
    otherStyle = [
      "left:" + String(canvasRect.left + (sideB === "right" ? otherX + otherWidth : otherX) - 7) + "px",
      "top:" + String(canvasRect.top + overlapStart + 6) + "px",
      "width:14px",
      "height:" + String(Math.max(overlapEnd - overlapStart - 12, 12)) + "px"
    ].join(";");
    return [movingStyle, otherStyle];
  }

  overlapStart = Math.max(movingX, otherX);
  overlapEnd = Math.min(movingX + movingWidth, otherX + otherWidth);

  if (overlapEnd - overlapStart < 12) {
    return [];
  }

  movingStyle = [
    "left:" + String(canvasRect.left + overlapStart + 6) + "px",
    "top:" + String(canvasRect.top + (sideA === "bottom" ? movingY + movingHeight : movingY) - 7) + "px",
    "width:" + String(Math.max(overlapEnd - overlapStart - 12, 12)) + "px",
    "height:14px"
  ].join(";");
  otherStyle = [
    "left:" + String(canvasRect.left + overlapStart + 6) + "px",
    "top:" + String(canvasRect.top + (sideB === "bottom" ? otherY + otherHeight : otherY) - 7) + "px",
    "width:" + String(Math.max(overlapEnd - overlapStart - 12, 12)) + "px",
    "height:14px"
  ].join(";");
  return [movingStyle, otherStyle];
}

function getDeskLayoutMovePreviewCandidate(clientX, clientY) {
  const canvasRect = activeDeskLayoutDrag ? activeDeskLayoutDrag.canvasRect : null;
  const currentItems = activeDeskLayoutDrag && Array.isArray(activeDeskLayoutDrag.currentItems) ? activeDeskLayoutDrag.currentItems : [];
  const currentLinks = activeDeskLayoutDrag && Array.isArray(activeDeskLayoutDrag.currentLinks) ? activeDeskLayoutDrag.currentLinks : [];
  const movingItem = getDeskLayoutItemById(currentItems, activeDeskLayoutDrag ? activeDeskLayoutDrag.itemId : "");
  const groupIds = activeDeskLayoutDrag && Array.isArray(activeDeskLayoutDrag.groupIds) ? activeDeskLayoutDrag.groupIds : [];
  const groupItems = activeDeskLayoutDrag && Array.isArray(activeDeskLayoutDrag.groupItems) ? activeDeskLayoutDrag.groupItems : [];
  const snapSize = 12;
  let desiredX;
  let desiredY;
  let deltaX;
  let deltaY;
  let minX;
  let minY;
  let maxRight;
  let maxBottom;
  let linkCandidate = null;
  let linkedDeltaX;
  let linkedDeltaY;

  if (!canvasRect || !movingItem || !groupItems.length) {
    return null;
  }

  desiredX = clientX - canvasRect.left - (Number(activeDeskLayoutDrag.pointerOffsetX) || 0);
  desiredY = clientY - canvasRect.top - (Number(activeDeskLayoutDrag.pointerOffsetY) || 0);
  desiredX = Math.round(desiredX / snapSize) * snapSize;
  desiredY = Math.round(desiredY / snapSize) * snapSize;
  deltaX = desiredX - (Number(movingItem.x) || 0);
  deltaY = desiredY - (Number(movingItem.y) || 0);

  minX = Math.min.apply(null, groupItems.map(function (item) { return Number(item.x) || 0; }));
  minY = Math.min.apply(null, groupItems.map(function (item) { return Number(item.y) || 0; }));
  maxRight = Math.max.apply(null, groupItems.map(function (item) {
    return (Number(item.x) || 0) + (Number(item.width) || getDeskTemplateMetrics(item.type).width);
  }));
  maxBottom = Math.max.apply(null, groupItems.map(function (item) {
    return (Number(item.y) || 0) + (Number(item.height) || getDeskTemplateMetrics(item.type).height);
  }));

  deltaX = clampValue(deltaX, -minX, Math.max(canvasRect.width - maxRight, -minX));
  deltaY = clampValue(deltaY, -minY, Math.max(canvasRect.height - maxBottom, -minY));

  if (seatPlanMoveLinkMode) {
    linkCandidate = getDeskLayoutLinkCandidate(
      currentItems,
      currentLinks,
      Object.assign({}, movingItem, {
        x: (Number(movingItem.x) || 0) + deltaX,
        y: (Number(movingItem.y) || 0) + deltaY
      }),
      (Number(movingItem.x) || 0) + deltaX,
      (Number(movingItem.y) || 0) + deltaY,
      groupIds
    );

    if (linkCandidate) {
      linkedDeltaX = deltaX + (linkCandidate.x - ((Number(movingItem.x) || 0) + deltaX));
      linkedDeltaY = deltaY + (linkCandidate.y - ((Number(movingItem.y) || 0) + deltaY));

      if (
        linkedDeltaX < -minX
        || linkedDeltaX > Math.max(canvasRect.width - maxRight, -minX)
        || linkedDeltaY < -minY
        || linkedDeltaY > Math.max(canvasRect.height - maxBottom, -minY)
      ) {
        linkCandidate = null;
      } else {
        deltaX = linkedDeltaX;
        deltaY = linkedDeltaY;
      }
    }
  }

  return {
    canvasRect: canvasRect,
    movingItem: Object.assign({}, movingItem, {
      x: (Number(movingItem.x) || 0) + deltaX,
      y: (Number(movingItem.y) || 0) + deltaY
    }),
    otherItem: linkCandidate ? getDeskLayoutItemById(currentItems, linkCandidate.itemBId) : null,
    linkCandidate: linkCandidate,
    deltaX: deltaX,
    deltaY: deltaY,
    previewPageX: canvasRect.left + minX + deltaX,
    previewPageY: canvasRect.top + minY + deltaY
  };
}

function getDeskLayoutCreatePreviewCandidate(clientX, clientY) {
  const canvasRect = activeDeskLayoutDrag ? activeDeskLayoutDrag.canvasRect : null;
  const currentItems = activeDeskLayoutDrag && Array.isArray(activeDeskLayoutDrag.currentItems) ? activeDeskLayoutDrag.currentItems : [];
  const currentLinks = activeDeskLayoutDrag && Array.isArray(activeDeskLayoutDrag.currentLinks) ? activeDeskLayoutDrag.currentLinks : [];
  const movingItem = activeDeskLayoutDrag ? {
    id: "__preview__",
    type: activeDeskLayoutDrag.deskType,
    width: activeDeskLayoutDrag.metrics.width,
    height: activeDeskLayoutDrag.metrics.height
  } : null;
  const snapSize = 12;
  let nextX;
  let nextY;
  let linkCandidate;
  let linkedX;
  let linkedY;

  if (!canvasRect || !movingItem) {
    return null;
  }

  nextX = clientX - canvasRect.left - (Number(activeDeskLayoutDrag.pointerOffsetX) || 0);
  nextY = clientY - canvasRect.top - (Number(activeDeskLayoutDrag.pointerOffsetY) || 0);
  nextX = Math.round(nextX / snapSize) * snapSize;
  nextY = Math.round(nextY / snapSize) * snapSize;
  nextX = clampValue(nextX, 0, Math.max(canvasRect.width - movingItem.width, 0));
  nextY = clampValue(nextY, 0, Math.max(canvasRect.height - movingItem.height, 0));

  if (seatPlanMoveLinkMode) {
    linkCandidate = getDeskLayoutLinkCandidate(currentItems, currentLinks, movingItem, nextX, nextY, []);

    if (linkCandidate) {
      linkedX = linkCandidate.x;
      linkedY = linkCandidate.y;

      if (
        linkedX < 0
        || linkedX > Math.max(canvasRect.width - movingItem.width, 0)
        || linkedY < 0
        || linkedY > Math.max(canvasRect.height - movingItem.height, 0)
      ) {
        linkCandidate = null;
      } else {
        nextX = linkedX;
        nextY = linkedY;
      }
    }
  }

  return {
    canvasRect: canvasRect,
    movingItem: Object.assign({}, movingItem, {
      x: nextX,
      y: nextY
    }),
    otherItem: linkCandidate ? getDeskLayoutItemById(currentItems, linkCandidate.itemBId) : null,
    linkCandidate: linkCandidate,
    itemX: nextX,
    itemY: nextY,
    previewPageX: canvasRect.left + nextX,
    previewPageY: canvasRect.top + nextY
  };
}

function updateDeskLayoutLinkPreview() {
  let previewData = activeDeskLayoutDrag ? activeDeskLayoutDrag.resolvedPlacement : null;
  let previewStyles;

  if (!activeDeskLayoutDrag || !seatPlanMoveLinkMode) {
    removeDeskLayoutLinkPreview();
    return;
  }

  if (!previewData || !previewData.otherItem) {
    removeDeskLayoutLinkPreview();
    return;
  }

  previewStyles = buildDeskLayoutLinkPreviewStyles(
    previewData.movingItem,
    previewData.otherItem,
    previewData.linkCandidate.sideA,
    previewData.linkCandidate.sideB,
    previewData.canvasRect
  );

  removeDeskLayoutLinkPreview();
  activeDeskLayoutDrag.linkPreviewElements = previewStyles.map(function (styleText) {
    return createDeskLayoutLinkPreviewElement(styleText);
  });
}

function renderDeskLayoutDragFrame() {
  let placement = null;

  if (!activeDeskLayoutDrag) {
    deskLayoutDragFrameId = 0;
    return;
  }

  if (activeDeskLayoutDrag.mode === "move") {
    placement = getDeskLayoutMovePreviewCandidate(activeDeskLayoutDrag.lastClientX || 0, activeDeskLayoutDrag.lastClientY || 0);
  } else if (activeDeskLayoutDrag.mode === "create") {
    placement = getDeskLayoutCreatePreviewCandidate(activeDeskLayoutDrag.lastClientX || 0, activeDeskLayoutDrag.lastClientY || 0);
  }

  activeDeskLayoutDrag.resolvedPlacement = placement;

  if (placement) {
    updateDeskLayoutDragPreview(placement.previewPageX, placement.previewPageY);
  }

  updateDeskLayoutLinkPreview();
  deskLayoutDragFrameId = 0;
}

function getDeskLayoutGroupBounds(items, groupIds) {
  const groupItems = (items || []).filter(function (item) {
    return (groupIds || []).indexOf(item.id) >= 0;
  });

  if (!groupItems.length) {
    return null;
  }

  return {
    minX: Math.min.apply(null, groupItems.map(function (item) { return Number(item.x) || 0; })),
    minY: Math.min.apply(null, groupItems.map(function (item) { return Number(item.y) || 0; })),
    maxRight: Math.max.apply(null, groupItems.map(function (item) {
      return (Number(item.x) || 0) + (Number(item.width) || getDeskTemplateMetrics(item.type).width);
    })),
    maxBottom: Math.max.apply(null, groupItems.map(function (item) {
      return (Number(item.y) || 0) + (Number(item.height) || getDeskTemplateMetrics(item.type).height);
    }))
  };
}

function getDeskLayoutItemsBounds(items) {
  if (!items || !items.length) {
    return null;
  }

  return {
    minX: Math.min.apply(null, items.map(function (item) { return Number(item.x) || 0; })),
    minY: Math.min.apply(null, items.map(function (item) { return Number(item.y) || 0; })),
    maxRight: Math.max.apply(null, items.map(function (item) {
      return (Number(item.x) || 0) + (Number(item.width) || getDeskTemplateMetrics(item.type).width);
    })),
    maxBottom: Math.max.apply(null, items.map(function (item) {
      return (Number(item.y) || 0) + (Number(item.height) || getDeskTemplateMetrics(item.type).height);
    }))
  };
}

function getDeskLayoutShiftToFitCanvas(items, canvasRect) {
  const bounds = getDeskLayoutItemsBounds(items);
  let deltaX = 0;
  let deltaY = 0;

  if (!bounds || !canvasRect) {
    return {
      deltaX: 0,
      deltaY: 0
    };
  }

  if (bounds.minX < 0) {
    deltaX = -bounds.minX;
  } else if (bounds.maxRight > canvasRect.width) {
    deltaX = canvasRect.width - bounds.maxRight;
  }

  if (bounds.minY < 0) {
    deltaY = -bounds.minY;
  } else if (bounds.maxBottom > canvasRect.height) {
    deltaY = canvasRect.height - bounds.maxBottom;
  }

  return {
    deltaX: deltaX,
    deltaY: deltaY
  };
}

function shiftDeskLayoutItems(items, deltaX, deltaY) {
  return (items || []).map(function (item) {
    return Object.assign({}, item, {
      x: (Number(item.x) || 0) + (Number(deltaX) || 0),
      y: (Number(item.y) || 0) + (Number(deltaY) || 0)
    });
  });
}

function rotateDeskLayoutSideClockwise(side) {
  if (side === "top") {
    return "right";
  }

  if (side === "right") {
    return "bottom";
  }

  if (side === "bottom") {
    return "left";
  }

  return "top";
}

function mirrorDeskLayoutSide(side, mirrorMode) {
  if (mirrorMode === "vertical") {
    if (side === "top") {
      return "bottom";
    }

    if (side === "bottom") {
      return "top";
    }

    return side;
  }

  if (side === "left") {
    return "right";
  }

  if (side === "right") {
    return "left";
  }

  return side;
}

function transformDeskLayoutGroupItems(groupItems, anchorItem, operation, mirrorMode) {
  const anchorRect = getDeskLayoutItemRect(anchorItem);
  const anchorCenterX = anchorRect.x + (anchorRect.width / 2);
  const anchorCenterY = anchorRect.y + (anchorRect.height / 2);

  return (groupItems || []).map(function (item) {
    const itemRect = getDeskLayoutItemRect(item);
    const itemCenterX = itemRect.x + (itemRect.width / 2);
    const itemCenterY = itemRect.y + (itemRect.height / 2);
    const relativeX = itemCenterX - anchorCenterX;
    const relativeY = itemCenterY - anchorCenterY;
    let nextCenterX = itemCenterX;
    let nextCenterY = itemCenterY;
    let nextWidth = itemRect.width;
    let nextHeight = itemRect.height;

    if (operation === "rotate") {
      nextCenterX = anchorCenterX - relativeY;
      nextCenterY = anchorCenterY + relativeX;
      nextWidth = itemRect.height;
      nextHeight = itemRect.width;
    } else if (operation === "mirror") {
      if (mirrorMode === "vertical") {
        nextCenterX = anchorCenterX + relativeX;
        nextCenterY = anchorCenterY - relativeY;
      } else {
        nextCenterX = anchorCenterX - relativeX;
        nextCenterY = anchorCenterY + relativeY;
      }
    }

    return Object.assign({}, item, {
      x: nextCenterX - (nextWidth / 2),
      y: nextCenterY - (nextHeight / 2),
      width: nextWidth,
      height: nextHeight
    });
  });
}

function transformDeskLayoutLinks(links, groupIds, operation, mirrorMode) {
  return (links || []).map(function (link) {
    const shouldTransform = (groupIds || []).indexOf(link.itemAId) >= 0 && (groupIds || []).indexOf(link.itemBId) >= 0;

    if (!shouldTransform) {
      return link;
    }

    if (operation === "rotate") {
      return Object.assign({}, link, {
        sideA: rotateDeskLayoutSideClockwise(link.sideA),
        sideB: rotateDeskLayoutSideClockwise(link.sideB)
      });
    }

    if (operation === "mirror") {
      return Object.assign({}, link, {
        sideA: mirrorDeskLayoutSide(link.sideA, mirrorMode),
        sideB: mirrorDeskLayoutSide(link.sideB, mirrorMode)
      });
    }

    return link;
  });
}

function applyDeskLayoutItemLookup(items) {
  const lookup = {};

  (items || []).forEach(function (item) {
    lookup[item.id] = item;
  });

  return lookup;
}

function applyDeskLayoutGroupOperation(itemId, operation) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot ? ensureSeatPlanForActiveClass(currentRawSnapshot) : null;
  const currentItems = seatPlan && Array.isArray(seatPlan.deskLayoutItems) ? seatPlan.deskLayoutItems : [];
  const currentLinks = seatPlan && Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];
  const groupIds = getLinkedDeskGroupItemIds(currentItems, currentLinks, itemId);
  const groupItems = currentItems.filter(function (item) {
    return groupIds.indexOf(item.id) >= 0;
  });
  const anchorItem = getDeskLayoutItemById(currentItems, itemId);
  const canvas = getDeskLayoutCanvasElement();
  const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
  let transformedItems;
  let transformedLinks;
  let fitDelta;
  let resolvedDelta;
  let transformedLookup;
  let duplicateIdMap;

  if (!repository || !schoolService || !seatPlan || !anchorItem || !groupItems.length || !canvasRect) {
    return false;
  }

  if (operation === "duplicate") {
    duplicateIdMap = {};
    transformedItems = groupItems.map(function (item) {
      const nextId = createDeskLayoutItemId();

      duplicateIdMap[item.id] = nextId;
      return Object.assign({}, item, {
        id: nextId
      });
    });
    fitDelta = getDeskLayoutShiftToFitCanvas(transformedItems, canvasRect);
    transformedItems = shiftDeskLayoutItems(transformedItems, fitDelta.deltaX, fitDelta.deltaY);
    resolvedDelta = findNearestFreeDeskLayoutGroupDelta(currentItems, transformedItems, [], 36, 36, canvasRect);
    transformedItems = shiftDeskLayoutItems(transformedItems, resolvedDelta.deltaX, resolvedDelta.deltaY);

    seatPlan.deskLayoutItems = currentItems.concat(transformedItems);
    seatPlan.deskLayoutLinks = currentLinks.concat(currentLinks.filter(function (link) {
      return groupIds.indexOf(link.itemAId) >= 0 && groupIds.indexOf(link.itemBId) >= 0;
    }).map(function (link) {
      return {
        id: createDeskLayoutLinkId(),
        itemAId: duplicateIdMap[link.itemAId],
        itemBId: duplicateIdMap[link.itemBId],
        sideA: link.sideA,
        sideB: link.sideB
      };
    }));
    seatPlan.updatedAt = getCurrentTimestamp();
    saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
    return false;
  }

  transformedItems = transformDeskLayoutGroupItems(groupItems, anchorItem, operation, seatPlanMirrorMode);
  fitDelta = getDeskLayoutShiftToFitCanvas(transformedItems, canvasRect);
  transformedItems = shiftDeskLayoutItems(transformedItems, fitDelta.deltaX, fitDelta.deltaY);
  resolvedDelta = findNearestFreeDeskLayoutGroupDelta(currentItems, transformedItems, groupIds, 0, 0, canvasRect);
  transformedItems = shiftDeskLayoutItems(transformedItems, resolvedDelta.deltaX, resolvedDelta.deltaY);
  transformedLinks = transformDeskLayoutLinks(currentLinks, groupIds, operation, seatPlanMirrorMode);
  transformedLookup = applyDeskLayoutItemLookup(transformedItems);

  seatPlan.deskLayoutItems = currentItems.map(function (item) {
    return transformedLookup[item.id] || item;
  });
  seatPlan.deskLayoutLinks = transformedLinks;
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
}

function separateDeskLayoutGroupsAfterUnlink(seatPlan, removedLink, canvasWidth, canvasHeight) {
  const items = Array.isArray(seatPlan.deskLayoutItems) ? seatPlan.deskLayoutItems : [];
  const links = Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];
  const groupAIds = getLinkedDeskGroupItemIds(items, links, removedLink.itemAId);
  const groupBIds = getLinkedDeskGroupItemIds(items, links, removedLink.itemBId);
  const boundsA = getDeskLayoutGroupBounds(items, groupAIds);
  const boundsB = getDeskLayoutGroupBounds(items, groupBIds);
  const gap = 48;
  let deltaX = 0;
  let deltaY = 0;

  if (!boundsA || !boundsB || groupAIds.indexOf(removedLink.itemBId) >= 0 || groupBIds.indexOf(removedLink.itemAId) >= 0) {
    return;
  }

  if (removedLink.sideA === "right") {
    deltaX = (boundsA.maxRight + gap) - boundsB.minX;
    deltaX = Math.min(deltaX, Math.max((canvasWidth || 0) - boundsB.maxRight, 0));
  } else if (removedLink.sideA === "left") {
    deltaX = (boundsA.minX - gap) - boundsB.maxRight;
    deltaX = Math.max(deltaX, -(boundsB.minX));
  } else if (removedLink.sideA === "bottom") {
    deltaY = (boundsA.maxBottom + gap) - boundsB.minY;
    deltaY = Math.min(deltaY, Math.max((canvasHeight || 0) - boundsB.maxBottom, 0));
  } else {
    deltaY = (boundsA.minY - gap) - boundsB.maxBottom;
    deltaY = Math.max(deltaY, -(boundsB.minY));
  }

  if (!deltaX && !deltaY) {
    return;
  }

  seatPlan.deskLayoutItems = items.map(function (item) {
    if (groupBIds.indexOf(item.id) === -1) {
      return item;
    }

    return Object.assign({}, item, {
      x: (Number(item.x) || 0) + deltaX,
      y: (Number(item.y) || 0) + deltaY
    });
  });
}

function insertDeskLayoutItemFromPoint(deskType, clientX, clientY, canvas) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot ? ensureSeatPlanForActiveClass(currentRawSnapshot) : null;
  const rect = canvas ? canvas.getBoundingClientRect() : null;
  const metrics = getDeskTemplateMetrics(deskType);
  const snapSize = 12;
  const nextItemId = createDeskLayoutItemId();
  let nextItem;
  let linkCandidate;
  let nextX;
  let nextY;
  let nearestFreePosition;

  if (!repository || !schoolService || !seatPlan || !canvas || !rect) {
    return false;
  }

  nextX = clientX - rect.left - (metrics.width / 2);
  nextY = clientY - rect.top - (metrics.height / 2);
  nextX = Math.round(nextX / snapSize) * snapSize;
  nextY = Math.round(nextY / snapSize) * snapSize;
  nextX = clampValue(nextX, 0, Math.max(rect.width - metrics.width, 0));
  nextY = clampValue(nextY, 0, Math.max(rect.height - metrics.height, 0));

  nextItem = {
    id: nextItemId,
    type: normalizeDeskLayoutType(deskType),
    x: nextX,
    y: nextY,
    width: metrics.width,
    height: metrics.height
  };

  if (seatPlanMoveLinkMode) {
    linkCandidate = getDeskLayoutLinkCandidate(seatPlan.deskLayoutItems, seatPlan.deskLayoutLinks, nextItem, nextX, nextY, []);

    if (linkCandidate) {
      nextItem.x = linkCandidate.x;
      nextItem.y = linkCandidate.y;
    }
  }

  nearestFreePosition = findNearestFreeDeskLayoutItemPosition(
    seatPlan.deskLayoutItems,
    nextItem,
    [],
    nextItem.x,
    nextItem.y,
    rect
  );
  nextItem.x = nearestFreePosition.x;
  nextItem.y = nearestFreePosition.y;

  if (linkCandidate && (nextItem.x !== linkCandidate.x || nextItem.y !== linkCandidate.y)) {
    linkCandidate = null;
  }

  seatPlan.deskLayoutItems.push(nextItem);

  if (linkCandidate) {
    upsertDeskLayoutLink(seatPlan, linkCandidate.itemAId, linkCandidate.itemBId, linkCandidate.sideA, linkCandidate.sideB);
  }

  seatPlan.updatedAt = getCurrentTimestamp();

  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return true;
}

function moveDeskLayoutItemToPoint(itemId, clientX, clientY, canvas, pointerOffsetX, pointerOffsetY) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot ? ensureSeatPlanForActiveClass(currentRawSnapshot) : null;
  const rect = canvas ? canvas.getBoundingClientRect() : null;
  const currentItems = seatPlan && Array.isArray(seatPlan.deskLayoutItems) ? seatPlan.deskLayoutItems : [];
  const currentLinks = seatPlan && Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];
  const movingItem = getDeskLayoutItemById(currentItems, itemId);
  const groupIds = movingItem ? getLinkedDeskGroupItemIds(currentItems, currentLinks, itemId) : [];
  const groupItems = currentItems.filter(function (item) {
    return groupIds.indexOf(item.id) >= 0;
  });
  const snapSize = 12;
  let desiredX;
  let desiredY;
  let deltaX;
  let deltaY;
  let minX;
  let minY;
  let maxRight;
  let maxBottom;
  let linkCandidate = null;
  let nearestFreeDelta;

  if (!repository || !schoolService || !seatPlan || !canvas || !rect || !itemId || !movingItem || !groupItems.length) {
    return false;
  }

  desiredX = clientX - rect.left - (Number(pointerOffsetX) || 0);
  desiredY = clientY - rect.top - (Number(pointerOffsetY) || 0);
  desiredX = Math.round(desiredX / snapSize) * snapSize;
  desiredY = Math.round(desiredY / snapSize) * snapSize;
  deltaX = desiredX - (Number(movingItem.x) || 0);
  deltaY = desiredY - (Number(movingItem.y) || 0);

  minX = Math.min.apply(null, groupItems.map(function (item) { return Number(item.x) || 0; }));
  minY = Math.min.apply(null, groupItems.map(function (item) { return Number(item.y) || 0; }));
  maxRight = Math.max.apply(null, groupItems.map(function (item) {
    return (Number(item.x) || 0) + (Number(item.width) || getDeskTemplateMetrics(item.type).width);
  }));
  maxBottom = Math.max.apply(null, groupItems.map(function (item) {
    return (Number(item.y) || 0) + (Number(item.height) || getDeskTemplateMetrics(item.type).height);
  }));

  deltaX = clampValue(deltaX, -minX, Math.max(rect.width - maxRight, -minX));
  deltaY = clampValue(deltaY, -minY, Math.max(rect.height - maxBottom, -minY));

  if (seatPlanMoveLinkMode) {
    linkCandidate = getDeskLayoutLinkCandidate(
      currentItems,
      currentLinks,
      Object.assign({}, movingItem, {
        x: (Number(movingItem.x) || 0) + deltaX,
        y: (Number(movingItem.y) || 0) + deltaY
      }),
      (Number(movingItem.x) || 0) + deltaX,
      (Number(movingItem.y) || 0) + deltaY,
      groupIds
    );

    if (linkCandidate) {
      deltaX += linkCandidate.x - ((Number(movingItem.x) || 0) + deltaX);
      deltaY += linkCandidate.y - ((Number(movingItem.y) || 0) + deltaY);

      if (
        deltaX < -minX
        || deltaX > Math.max(rect.width - maxRight, -minX)
        || deltaY < -minY
        || deltaY > Math.max(rect.height - maxBottom, -minY)
      ) {
        deltaX = clampValue(deltaX, -minX, Math.max(rect.width - maxRight, -minX));
        deltaY = clampValue(deltaY, -minY, Math.max(rect.height - maxBottom, -minY));
        linkCandidate = null;
      }
    }
  }

  nearestFreeDelta = findNearestFreeDeskLayoutGroupDelta(currentItems, groupItems, groupIds, deltaX, deltaY, rect);
  deltaX = nearestFreeDelta.deltaX;
  deltaY = nearestFreeDelta.deltaY;

  if (
    linkCandidate
    && (
      (Number(movingItem.x) || 0) + deltaX !== linkCandidate.x
      || (Number(movingItem.y) || 0) + deltaY !== linkCandidate.y
    )
  ) {
    linkCandidate = null;
  }

  seatPlan.deskLayoutItems = currentItems.map(function (item) {
    const width = Number(item.width) || getDeskTemplateMetrics(item.type).width;
    const height = Number(item.height) || getDeskTemplateMetrics(item.type).height;
    const shouldMove = groupIds.indexOf(item.id) >= 0;

    if (!shouldMove) {
      return item;
    }

    return Object.assign({}, item, {
      x: clampValue((Number(item.x) || 0) + deltaX, 0, Math.max(rect.width - width, 0)),
      y: clampValue((Number(item.y) || 0) + deltaY, 0, Math.max(rect.height - height, 0)),
      width: width,
      height: height
    });
  });

  if (linkCandidate) {
    upsertDeskLayoutLink(seatPlan, linkCandidate.itemAId, linkCandidate.itemBId, linkCandidate.sideA, linkCandidate.sideB);
  }

  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return true;
}

function applyDeskLayoutMovePlacement(itemId, placement) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot ? ensureSeatPlanForActiveClass(currentRawSnapshot) : null;
  const currentItems = seatPlan && Array.isArray(seatPlan.deskLayoutItems) ? seatPlan.deskLayoutItems : [];
  const currentLinks = seatPlan && Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];
  const groupIds = getLinkedDeskGroupItemIds(currentItems, currentLinks, itemId);
  const groupItems = currentItems.filter(function (item) {
    return groupIds.indexOf(item.id) >= 0;
  });
  const movingItem = getDeskLayoutItemById(currentItems, itemId);
  const canvas = getDeskLayoutCanvasElement();
  const canvasRect = canvas ? canvas.getBoundingClientRect() : placement.canvasRect;
  const resolvedDelta = canvasRect
    ? findNearestFreeDeskLayoutGroupDelta(currentItems, groupItems, groupIds, placement.deltaX, placement.deltaY, canvasRect)
    : {
        deltaX: Number(placement.deltaX) || 0,
        deltaY: Number(placement.deltaY) || 0
      };
  const shouldKeepLink = Boolean(
    seatPlanMoveLinkMode
    && placement.linkCandidate
    && movingItem
    && ((Number(movingItem.x) || 0) + resolvedDelta.deltaX === placement.linkCandidate.x)
    && ((Number(movingItem.y) || 0) + resolvedDelta.deltaY === placement.linkCandidate.y)
  );

  if (!repository || !schoolService || !seatPlan || !itemId || !placement || !groupIds.length) {
    return false;
  }

  seatPlan.deskLayoutItems = currentItems.map(function (item) {
    if (groupIds.indexOf(item.id) === -1) {
      return item;
    }

    return Object.assign({}, item, {
      x: (Number(item.x) || 0) + resolvedDelta.deltaX,
      y: (Number(item.y) || 0) + resolvedDelta.deltaY
    });
  });

  if (shouldKeepLink) {
    upsertDeskLayoutLink(seatPlan, placement.linkCandidate.itemAId, placement.linkCandidate.itemBId, placement.linkCandidate.sideA, placement.linkCandidate.sideB);
  }

  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return true;
}

function applyDeskLayoutCreatePlacement(deskType, placement) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot ? ensureSeatPlanForActiveClass(currentRawSnapshot) : null;
  const metrics = getDeskTemplateMetrics(deskType);
  const createdItemId = createDeskLayoutItemId();
  const canvas = getDeskLayoutCanvasElement();
  const canvasRect = canvas ? canvas.getBoundingClientRect() : placement.canvasRect;
  const resolvedPosition = canvasRect
    ? findNearestFreeDeskLayoutItemPosition(
        seatPlan && Array.isArray(seatPlan.deskLayoutItems) ? seatPlan.deskLayoutItems : [],
        {
          type: normalizeDeskLayoutType(deskType),
          width: metrics.width,
          height: metrics.height
        },
        [],
        placement.itemX,
        placement.itemY,
        canvasRect
      )
    : {
        x: Number(placement.itemX) || 0,
        y: Number(placement.itemY) || 0
      };
  const shouldKeepLink = Boolean(
    seatPlanMoveLinkMode
    && placement.linkCandidate
    && resolvedPosition.x === (Number(placement.itemX) || 0)
    && resolvedPosition.y === (Number(placement.itemY) || 0)
  );

  if (!repository || !schoolService || !seatPlan || !placement) {
    return false;
  }

  seatPlan.deskLayoutItems.push({
    id: createdItemId,
    type: normalizeDeskLayoutType(deskType),
    x: resolvedPosition.x,
    y: resolvedPosition.y,
    width: metrics.width,
    height: metrics.height
  });

  if (shouldKeepLink) {
    upsertDeskLayoutLink(
      seatPlan,
      placement.linkCandidate.itemAId === "__preview__" ? createdItemId : placement.linkCandidate.itemAId,
      placement.linkCandidate.itemBId === "__preview__" ? createdItemId : placement.linkCandidate.itemBId,
      placement.linkCandidate.sideA,
      placement.linkCandidate.sideB
    );
  }

  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return true;
}

function removeDeskLayoutItem(itemId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot ? ensureSeatPlanForActiveClass(currentRawSnapshot) : null;
  const currentItems = seatPlan && Array.isArray(seatPlan.deskLayoutItems) ? seatPlan.deskLayoutItems : [];
  const currentLinks = seatPlan && Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];
  const groupIds = getLinkedDeskGroupItemIds(currentItems, currentLinks, itemId);

  if (!repository || !schoolService || !seatPlan || !itemId || !groupIds.length) {
    return false;
  }

  seatPlan.deskLayoutItems = currentItems.filter(function (item) {
    return groupIds.indexOf(item.id) === -1;
  });

  if (seatPlan.deskLayoutItems.length === currentItems.length) {
    return false;
  }

  seatPlan.deskLayoutLinks = currentLinks.filter(function (link) {
    return groupIds.indexOf(link.itemAId) === -1 && groupIds.indexOf(link.itemBId) === -1;
  });
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return true;
}

function setDeskLayoutWindowSide(side) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot ? ensureSeatPlanForActiveClass(currentRawSnapshot) : null;
  const normalizedSide = ["top", "right", "bottom", "left"].indexOf(side) >= 0 ? side : "";

  if (!repository || !schoolService || !seatPlan) {
    return false;
  }

  seatPlan.roomWindowSide = normalizedSide;
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
}

function saveDeskLayoutRoomSize(width, height) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot ? ensureSeatPlanForActiveClass(currentRawSnapshot) : null;
  const itemBounds = seatPlan ? getDeskLayoutItemsBounds(seatPlan.deskLayoutItems) : null;
  const minWidth = Math.max(360, itemBounds ? Math.ceil(itemBounds.maxRight + 24) : 360);
  const minHeight = Math.max(360, itemBounds ? Math.ceil(itemBounds.maxBottom + 24) : 360);
  const nextWidth = clampValue(Math.round(Number(width) || 720), minWidth, 1800);
  const nextHeight = clampValue(Math.round(Number(height) || 720), minHeight, 1800);

  if (!repository || !schoolService || !seatPlan) {
    return false;
  }

  seatPlan.roomWidth = nextWidth;
  seatPlan.roomHeight = nextHeight;
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return true;
}

function ensureSeatPlans(rawSnapshot) {
  rawSnapshot.seatPlans = Array.isArray(rawSnapshot.seatPlans) ? rawSnapshot.seatPlans : [];
  rawSnapshot.activeSeatPlanId = rawSnapshot.activeSeatPlanId || null;
  rawSnapshot.activeSeatPlanRoom = String(rawSnapshot.activeSeatPlanRoom || "").trim();

  rawSnapshot.seatPlans = rawSnapshot.seatPlans.map(function (seatPlan, index) {
    const nextSeatPlan = seatPlan || {};

    if (!nextSeatPlan.id) {
      nextSeatPlan.id = createSeatPlanId() + "-" + index;
    }

    nextSeatPlan.classId = nextSeatPlan.classId || "";
    nextSeatPlan.room = String(nextSeatPlan.room || "").trim();
    nextSeatPlan.validFrom = normalizeDateValue(nextSeatPlan.validFrom);
    nextSeatPlan.validTo = normalizeDateValue(nextSeatPlan.validTo);
    nextSeatPlan.updatedAt = nextSeatPlan.updatedAt || getCurrentTimestamp();
    nextSeatPlan.seats = Array.isArray(nextSeatPlan.seats) ? nextSeatPlan.seats : [];
    nextSeatPlan.deskLayoutItems = Array.isArray(nextSeatPlan.deskLayoutItems) ? nextSeatPlan.deskLayoutItems : [];
    nextSeatPlan.deskLayoutLinks = Array.isArray(nextSeatPlan.deskLayoutLinks) ? nextSeatPlan.deskLayoutLinks : [];
    nextSeatPlan.roomWindowSide = typeof nextSeatPlan.roomWindowSide === "string" ? nextSeatPlan.roomWindowSide : "";
    nextSeatPlan.roomWidth = clampValue(Number(nextSeatPlan.roomWidth) || 720, 360, 1800);
    nextSeatPlan.roomHeight = clampValue(Number(nextSeatPlan.roomHeight) || 720, 360, 1800);
    nextSeatPlan.deskLayoutLinks = nextSeatPlan.deskLayoutLinks.filter(function (link) {
      return getDeskLayoutItemById(nextSeatPlan.deskLayoutItems, link.itemAId) && getDeskLayoutItemById(nextSeatPlan.deskLayoutItems, link.itemBId);
    });

    return nextSeatPlan;
  });

  return rawSnapshot.seatPlans;
}

function createSeatPlanRecord(classId, roomValue) {
  return {
    id: createSeatPlanId(),
    classId: classId,
    room: String(roomValue || "").trim(),
    validFrom: getTodayDateValue(),
    validTo: "",
    updatedAt: getCurrentTimestamp(),
    seats: [],
    deskLayoutItems: [],
    deskLayoutLinks: [],
    roomWindowSide: "",
    roomWidth: 720,
    roomHeight: 720
  };
}

function getActiveSeatPlanRoomFromSnapshot(rawSnapshot, activeClass) {
  const currentClass = activeClass || (schoolService ? schoolService.getActiveClass() : null);
  const selectedRoom = String(rawSnapshot.activeSeatPlanRoom || "").trim();
  const serviceRooms = schoolService && currentClass ? schoolService.getRoomsForClass(currentClass.id) : [];

  if (rawSnapshot.activeDateTimeMode === "live" && schoolService && currentClass && typeof schoolService.getLiveRoomForClass === "function") {
    return schoolService.getLiveRoomForClass(currentClass.id, schoolService.getReferenceDate()) || selectedRoom || serviceRooms[0] || "";
  }

  if (selectedRoom && (!serviceRooms.length || serviceRooms.indexOf(selectedRoom) >= 0)) {
    return selectedRoom;
  }

  if (schoolService && currentClass) {
    return schoolService.getRelevantRoomForClass(currentClass.id, schoolService.getReferenceDate()) || serviceRooms[0] || "";
  }

  return "";
}

function getCurrentSeatPlanFromSnapshot(rawSnapshot, classId, roomValue) {
  const todayValue = getReferenceDateValue();

  return ensureSeatPlans(rawSnapshot)
    .filter(function (seatPlan) {
      const matchesClass = seatPlan.classId === classId;
      const matchesRoom = String(seatPlan.room || "") === String(roomValue || "");
      const startsBefore = !seatPlan.validFrom || compareDateValues(seatPlan.validFrom, todayValue) <= 0;
      const endsAfter = !seatPlan.validTo || compareDateValues(seatPlan.validTo, todayValue) >= 0;

      return matchesClass && matchesRoom && startsBefore && endsAfter;
    })
    .sort(function (left, right) {
      return compareDateValues(right.validFrom, left.validFrom);
    })[0] || null;
}

function ensureSeatPlanForActiveClass(rawSnapshot) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  let activeRoom;
  let availableSeatPlans;
  let seatPlan;

  if (!activeClass) {
    return null;
  }

  activeRoom = getActiveSeatPlanRoomFromSnapshot(rawSnapshot, activeClass);
  availableSeatPlans = ensureSeatPlans(rawSnapshot).filter(function (currentSeatPlan) {
    return currentSeatPlan.classId === activeClass.id && String(currentSeatPlan.room || "") === String(activeRoom || "");
  });
  seatPlan = availableSeatPlans.find(function (item) {
    return item.id === rawSnapshot.activeSeatPlanId;
  });

  if (!seatPlan) {
    seatPlan = getCurrentSeatPlanFromSnapshot(rawSnapshot, activeClass.id, activeRoom);
  }

  if (!seatPlan) {
    seatPlan = availableSeatPlans[0] || null;
  }

  if (!seatPlan) {
    seatPlan = createSeatPlanRecord(activeClass.id, activeRoom);
    rawSnapshot.seatPlans.unshift(seatPlan);
  }

  rawSnapshot.activeSeatPlanId = seatPlan.id;
  rawSnapshot.activeSeatPlanRoom = activeRoom;
  return seatPlan;
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
window.UnterrichtsassistentApp.getSeatPlanViewMode = function () {
  return seatPlanViewMode;
};
window.UnterrichtsassistentApp.getSeatPlanManageMode = function () {
  return seatPlanManageMode;
};
window.UnterrichtsassistentApp.getSeatPlanDeskToolMode = function () {
  return seatPlanDeskToolMode;
};
window.UnterrichtsassistentApp.isSeatPlanMoveLinkMode = function () {
  return seatPlanMoveLinkMode;
};
window.UnterrichtsassistentApp.getActiveDeskLayoutHiddenItemIds = function () {
  return activeDeskLayoutDrag && Array.isArray(activeDeskLayoutDrag.hiddenItemIds)
    ? activeDeskLayoutDrag.hiddenItemIds.slice()
    : [];
};
window.UnterrichtsassistentApp.getSeatPlanRotateMode = function () {
  return seatPlanRotateMode;
};
window.UnterrichtsassistentApp.getSeatPlanMirrorMode = function () {
  return seatPlanMirrorMode;
};
window.UnterrichtsassistentApp.setSeatPlanViewMode = function (nextMode) {
  seatPlanViewMode = nextMode === "verwalten" ? "verwalten" : "ansicht";

  if (seatPlanViewMode === "verwalten" && ["sitzordnung", "tischordnung"].indexOf(seatPlanManageMode) === -1) {
    seatPlanManageMode = "sitzordnung";
  }

  if (activeViewId === "sitzplan") {
    setActiveView("sitzplan");
  }

  return false;
};
window.UnterrichtsassistentApp.setSeatPlanManageMode = function (nextMode) {
  seatPlanManageMode = nextMode === "tischordnung" ? "tischordnung" : "sitzordnung";
  seatPlanViewMode = "verwalten";

  if (activeViewId === "sitzplan") {
    setActiveView("sitzplan");
  }

  return false;
};
window.UnterrichtsassistentApp.changeActiveSeatPlanRoom = function (roomValue) {
  if (!repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const activeClass = schoolService.getActiveClass();
  const wasLiveMode = isLiveDateTimeMode();
  const currentParts = getNowDateParts();

  ensureSeatPlans(currentRawSnapshot);
  currentRawSnapshot.activeSeatPlanRoom = String(roomValue || "").trim();
  currentRawSnapshot.activeSeatPlanId = null;

  if (wasLiveMode) {
    currentRawSnapshot.activeDateTime = currentParts.date + "T" + currentParts.time;
    currentRawSnapshot.activeDateTimeMode = "manual";

    if (activeClass) {
      currentRawSnapshot.activeClassId = activeClass.id;
    }
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
};
window.UnterrichtsassistentApp.changeActiveSeatPlan = function (seatPlanId) {
  if (!repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  let selectedSeatPlan = null;

  ensureSeatPlans(currentRawSnapshot);
  selectedSeatPlan = currentRawSnapshot.seatPlans.find(function (seatPlan) {
    return seatPlan.id === seatPlanId;
  }) || null;
  currentRawSnapshot.activeSeatPlanId = seatPlanId || null;
  currentRawSnapshot.activeSeatPlanRoom = selectedSeatPlan ? String(selectedSeatPlan.room || "").trim() : currentRawSnapshot.activeSeatPlanRoom;
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
};
window.UnterrichtsassistentApp.createSeatPlan = function () {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const activeRoom = getActiveSeatPlanRoom(activeClass);
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const currentSeatPlan = schoolService && activeClass
    ? schoolService.getCurrentSeatPlan(activeClass.id, activeRoom, schoolService.getReferenceDate())
    : null;
  const nextSeatPlan = activeClass ? createSeatPlanRecord(activeClass.id, activeRoom) : null;
  const yesterdayValue = getYesterdayDateValue();

  if (!repository || !schoolService || !activeClass || !nextSeatPlan || seatPlanViewMode !== "verwalten" || seatPlanManageMode !== "tischordnung") {
    return false;
  }

  ensureSeatPlans(currentRawSnapshot);

  if (currentSeatPlan) {
    currentRawSnapshot.seatPlans = currentRawSnapshot.seatPlans.map(function (seatPlan) {
      if (seatPlan.id === currentSeatPlan.id) {
        seatPlan.validTo = yesterdayValue;
      }

      return seatPlan;
    });
  }

  currentRawSnapshot.seatPlans.unshift(nextSeatPlan);
  currentRawSnapshot.activeSeatPlanRoom = activeRoom;
  currentRawSnapshot.activeSeatPlanId = nextSeatPlan.id;
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
};
window.UnterrichtsassistentApp.updateSeatPlanDateField = function (fieldName, nextValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot ? ensureSeatPlanForActiveClass(currentRawSnapshot) : null;

  if (!repository || !schoolService || !seatPlan || ["validFrom", "validTo"].indexOf(fieldName) === -1) {
    return false;
  }

  seatPlan[fieldName] = normalizeDateValue(nextValue);
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
};
window.UnterrichtsassistentApp.setSeatPlanDeskToolMode = function (nextMode) {
  seatPlanDeskToolMode = ["rotate", "mirror", "duplicate"].indexOf(nextMode) >= 0 ? nextMode : "move";

  if (activeViewId === "sitzplan") {
    setActiveView("sitzplan");
  }

  return false;
};
window.UnterrichtsassistentApp.toggleSeatPlanMoveLinkMode = function () {
  seatPlanMoveLinkMode = !seatPlanMoveLinkMode;

  if (activeViewId === "sitzplan") {
    setActiveView("sitzplan");
  }

  return false;
};
window.UnterrichtsassistentApp.setSeatPlanRotateMode = function (nextMode) {
  seatPlanRotateMode = nextMode === "90" ? "90" : "90";

  if (activeViewId === "sitzplan") {
    setActiveView("sitzplan");
  }

  return false;
};
window.UnterrichtsassistentApp.toggleSeatPlanMirrorMode = function () {
  seatPlanMirrorMode = seatPlanMirrorMode === "vertical" ? "horizontal" : "vertical";

  if (activeViewId === "sitzplan") {
    setActiveView("sitzplan");
  }

  return false;
};
window.UnterrichtsassistentApp.setDeskLayoutWindowSide = function (side) {
  return setDeskLayoutWindowSide(side);
};
window.UnterrichtsassistentApp.startDeskLayoutResize = function (event, side) {
  const canvas = getDeskLayoutCanvasElement();
  const normalizedSide = ["right", "bottom"].indexOf(side) >= 0 ? side : "";
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot ? ensureSeatPlanForActiveClass(currentRawSnapshot) : null;
  const itemBounds = seatPlan ? getDeskLayoutItemsBounds(seatPlan.deskLayoutItems) : null;

  if (!event || !canvas || !normalizedSide) {
    return false;
  }

  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  finishDeskLayoutDrag();
  finishDeskLayoutResize({
    refreshView: false
  });
  activeDeskLayoutResize = {
    side: normalizedSide,
    pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    startClientX: event.clientX || 0,
    startClientY: event.clientY || 0,
    startWidth: canvas.offsetWidth,
    startHeight: canvas.offsetHeight,
    minWidth: Math.max(360, itemBounds ? Math.ceil(itemBounds.maxRight + 24) : 360),
    minHeight: Math.max(360, itemBounds ? Math.ceil(itemBounds.maxBottom + 24) : 360),
    canvas: canvas,
    sourceElement: event.currentTarget || null
  };
  document.body.classList.add("is-desk-dragging");
  attachDeskLayoutPointerListeners();

  if (event.currentTarget && typeof event.currentTarget.setPointerCapture === "function" && typeof event.pointerId === "number") {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      // Continue with global listeners even if capture is unavailable.
    }
  }

  return false;
};
window.UnterrichtsassistentApp.removeDeskLayoutLink = function (linkId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot ? ensureSeatPlanForActiveClass(currentRawSnapshot) : null;
  const currentLinks = seatPlan && Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];
  const removedLink = currentLinks.find(function (link) {
    return link.id === linkId;
  }) || null;
  const canvas = getDeskLayoutCanvasElement();
  const canvasRect = canvas ? canvas.getBoundingClientRect() : null;

  if (!repository || !schoolService || !seatPlan || !linkId || !removedLink) {
    return false;
  }

  seatPlan.deskLayoutLinks = currentLinks.filter(function (link) {
    return link.id !== linkId;
  });

  if (seatPlan.deskLayoutLinks.length === currentLinks.length) {
    return false;
  }

  separateDeskLayoutGroupsAfterUnlink(seatPlan, removedLink, canvasRect ? canvasRect.width : 0, canvasRect ? canvasRect.height : 0);
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
};
window.UnterrichtsassistentApp.startDeskLayoutDrag = function (event, deskType) {
  if (!event || !event.dataTransfer) {
    return false;
  }

  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/plain", normalizeDeskLayoutType(deskType));
  return true;
};
window.UnterrichtsassistentApp.startDeskLayoutPointerDrag = function (event, deskType) {
  const normalizedDeskType = normalizeDeskLayoutType(deskType);
  const metrics = getDeskTemplateMetrics(normalizedDeskType);
  const canvas = getDeskLayoutCanvasElement();
  const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const seatPlan = activeClass && schoolService
    ? schoolService.getManagedSeatPlan(activeClass.id, getActiveSeatPlanRoom(activeClass))
    : null;
  const currentItems = seatPlan && Array.isArray(seatPlan.deskLayoutItems) ? seatPlan.deskLayoutItems : [];
  const currentLinks = seatPlan && Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];

  if (!event || !canvasRect || seatPlanDeskToolMode !== "move") {
    return false;
  }

  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  finishDeskLayoutDrag();
  activeDeskLayoutDrag = {
    mode: "create",
    deskType: normalizedDeskType,
    pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    metrics: metrics,
    pointerOffsetX: metrics.width / 2,
    pointerOffsetY: metrics.height / 2,
    previewElement: createDeskLayoutPreviewElement(normalizedDeskType, metrics.width, metrics.height),
    sourceElement: event.currentTarget || null,
    canvasRect: canvasRect,
    currentItems: currentItems,
    currentLinks: currentLinks,
    lastClientX: event.clientX || 0,
    lastClientY: event.clientY || 0
  };
  document.body.classList.add("is-desk-dragging");
  renderDeskLayoutDragFrame();
  attachDeskLayoutPointerListeners();

  if (event.currentTarget && typeof event.currentTarget.setPointerCapture === "function" && typeof event.pointerId === "number") {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      // Continue with global listeners even if capture is unavailable.
    }
  }

  return false;
};
window.UnterrichtsassistentApp.startDeskLayoutItemPointerDrag = function (event, itemId) {
  const target = event ? event.currentTarget : null;
  const rect = target ? target.getBoundingClientRect() : null;
  const canvas = getDeskLayoutCanvasElement();
  const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const seatPlan = activeClass && schoolService
    ? schoolService.getManagedSeatPlan(activeClass.id, getActiveSeatPlanRoom(activeClass))
    : null;
  const currentItems = seatPlan && Array.isArray(seatPlan.deskLayoutItems) ? seatPlan.deskLayoutItems : [];
  const currentLinks = seatPlan && Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];
  const movingItem = getDeskLayoutItemById(currentItems, itemId);
  const groupIds = getLinkedDeskGroupItemIds(currentItems, currentLinks, itemId);
  const groupItems = currentItems.filter(function (item) {
    return groupIds.indexOf(item.id) >= 0;
  });
  const previewGroup = groupItems.length ? createDeskLayoutGroupPreviewElement(groupItems) : null;
  const deskType = target ? normalizeDeskLayoutType(String(target.getAttribute("data-desk-type") || "single")) : "single";
  const width = target ? Number(target.getAttribute("data-width")) || (rect ? rect.width : getDeskTemplateMetrics(deskType).width) : getDeskTemplateMetrics(deskType).width;
  const height = target ? Number(target.getAttribute("data-height")) || (rect ? rect.height : getDeskTemplateMetrics(deskType).height) : getDeskTemplateMetrics(deskType).height;

  if (!event || !target || !itemId || !movingItem) {
    if (previewGroup && previewGroup.element && previewGroup.element.parentNode) {
      previewGroup.element.parentNode.removeChild(previewGroup.element);
    }
    return false;
  }

  if (seatPlanDeskToolMode !== "move") {
    if (previewGroup && previewGroup.element && previewGroup.element.parentNode) {
      previewGroup.element.parentNode.removeChild(previewGroup.element);
    }

    if (typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    return applyDeskLayoutGroupOperation(itemId, seatPlanDeskToolMode);
  }

  if (!rect || !canvasRect || !previewGroup) {
    if (previewGroup && previewGroup.element && previewGroup.element.parentNode) {
      previewGroup.element.parentNode.removeChild(previewGroup.element);
    }
    return false;
  }

  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  finishDeskLayoutDrag();
  activeDeskLayoutDrag = {
    mode: "move",
    itemId: itemId,
    deskType: deskType,
    pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    metrics: {
      width: Number(previewGroup.element.style.width.replace("px", "")) || width,
      height: Number(previewGroup.element.style.height.replace("px", "")) || height
    },
    pointerOffsetX: clampValue(
      (event.clientX || rect.left) - (canvasRect.left + (Number(movingItem.x) || 0)),
      0,
      Number(movingItem.width) || width
    ),
    pointerOffsetY: clampValue(
      (event.clientY || rect.top) - (canvasRect.top + (Number(movingItem.y) || 0)),
      0,
      Number(movingItem.height) || height
    ),
    previewElement: previewGroup.element,
    sourceElement: target,
    hiddenItemIds: groupIds.slice(),
    canvasRect: canvasRect,
    currentItems: currentItems,
    currentLinks: currentLinks,
    groupIds: groupIds.slice(),
    groupItems: groupItems.slice(),
    lastClientX: event.clientX || 0,
    lastClientY: event.clientY || 0
  };
  setDeskLayoutItemsHidden(groupIds, true);
  document.body.classList.add("is-desk-dragging");
  renderDeskLayoutDragFrame();
  attachDeskLayoutPointerListeners();

  if (typeof target.setPointerCapture === "function" && typeof event.pointerId === "number") {
    try {
      target.setPointerCapture(event.pointerId);
    } catch (error) {
      // Continue with global listeners even if capture is unavailable.
    }
  }

  return false;
};
window.UnterrichtsassistentApp.handleDeskLayoutPointerMove = function (event) {
  let nextWidth;
  let nextHeight;

  if (activeDeskLayoutResize) {
    if (typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    if (activeDeskLayoutResize.pointerId !== null && typeof event.pointerId === "number" && event.pointerId !== activeDeskLayoutResize.pointerId) {
      return false;
    }

    nextWidth = activeDeskLayoutResize.startWidth;
    nextHeight = activeDeskLayoutResize.startHeight;

    if (activeDeskLayoutResize.side === "right") {
      nextWidth += (event.clientX || 0) - activeDeskLayoutResize.startClientX;
    } else if (activeDeskLayoutResize.side === "left") {
      nextWidth -= (event.clientX || 0) - activeDeskLayoutResize.startClientX;
    } else if (activeDeskLayoutResize.side === "bottom") {
      nextHeight += (event.clientY || 0) - activeDeskLayoutResize.startClientY;
    } else if (activeDeskLayoutResize.side === "top") {
      nextHeight -= (event.clientY || 0) - activeDeskLayoutResize.startClientY;
    }

    nextWidth = clampValue(Math.round(nextWidth), activeDeskLayoutResize.minWidth || 360, 1800);
    nextHeight = clampValue(Math.round(nextHeight), activeDeskLayoutResize.minHeight || 360, 1800);
    activeDeskLayoutResize.currentWidth = nextWidth;
    activeDeskLayoutResize.currentHeight = nextHeight;

    if (activeDeskLayoutResize.canvas) {
      activeDeskLayoutResize.canvas.style.width = nextWidth + "px";
      activeDeskLayoutResize.canvas.style.height = nextHeight + "px";
    }

    return false;
  }

  if (!activeDeskLayoutDrag) {
    return false;
  }

  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (activeDeskLayoutDrag.pointerId !== null && typeof event.pointerId === "number" && event.pointerId !== activeDeskLayoutDrag.pointerId) {
    return false;
  }

  activeDeskLayoutDrag.lastClientX = event.clientX || 0;
  activeDeskLayoutDrag.lastClientY = event.clientY || 0;

  if (!deskLayoutDragFrameId) {
    deskLayoutDragFrameId = window.requestAnimationFrame(renderDeskLayoutDragFrame);
  }

  return false;
};
window.UnterrichtsassistentApp.handleDeskLayoutPointerEnd = function (event) {
  if (activeDeskLayoutResize) {
    if (activeDeskLayoutResize.pointerId !== null && typeof event.pointerId === "number" && event.pointerId !== activeDeskLayoutResize.pointerId) {
      return false;
    }

    saveDeskLayoutRoomSize(
      activeDeskLayoutResize.currentWidth || activeDeskLayoutResize.startWidth,
      activeDeskLayoutResize.currentHeight || activeDeskLayoutResize.startHeight
    );
    finishDeskLayoutResize();
    return false;
  }

  const canvas = document.elementFromPoint(event.clientX || 0, event.clientY || 0);
  const deskLayoutCanvas = canvas && typeof canvas.closest === "function"
    ? canvas.closest(".desk-layout-builder__canvas")
    : null;
  const resolvedPlacement = activeDeskLayoutDrag ? activeDeskLayoutDrag.resolvedPlacement : null;
  let didApply = false;

  if (!activeDeskLayoutDrag) {
    return false;
  }

  if (activeDeskLayoutDrag.pointerId !== null && typeof event.pointerId === "number" && event.pointerId !== activeDeskLayoutDrag.pointerId) {
    return false;
  }

  if (deskLayoutCanvas) {
    if (activeDeskLayoutDrag.mode === "move") {
      didApply = resolvedPlacement
        ? applyDeskLayoutMovePlacement(activeDeskLayoutDrag.itemId, resolvedPlacement)
        : moveDeskLayoutItemToPoint(
            activeDeskLayoutDrag.itemId,
            event.clientX || 0,
            event.clientY || 0,
            deskLayoutCanvas,
            activeDeskLayoutDrag.pointerOffsetX,
            activeDeskLayoutDrag.pointerOffsetY
          );
    } else {
      didApply = resolvedPlacement
        ? applyDeskLayoutCreatePlacement(activeDeskLayoutDrag.deskType, resolvedPlacement)
        : insertDeskLayoutItemFromPoint(activeDeskLayoutDrag.deskType, event.clientX || 0, event.clientY || 0, deskLayoutCanvas);
    }
  } else if (activeDeskLayoutDrag.mode === "move") {
    didApply = removeDeskLayoutItem(activeDeskLayoutDrag.itemId);
  }

  finishDeskLayoutDrag({
    restoreHiddenItems: !didApply
  });
  return didApply ? false : false;
};
window.UnterrichtsassistentApp.allowDeskLayoutDrop = function (event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (event && event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }

  return false;
};
window.UnterrichtsassistentApp.dropDeskLayoutItem = function (event) {
  const deskType = event && event.dataTransfer ? event.dataTransfer.getData("text/plain") : "";
  const canvas = event ? event.currentTarget : null;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!canvas || !deskType) {
    return false;
  }

  insertDeskLayoutItemFromPoint(deskType, event.clientX || 0, event.clientY || 0, canvas);
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
  currentRawSnapshot.activeSeatPlanId = null;
  currentRawSnapshot.activeSeatPlanRoom = "";
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
  currentRawSnapshot.activeSeatPlanId = null;
  currentRawSnapshot.activeSeatPlanRoom = "";

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
  const activeClass = schoolService.getActiveClass();
  const liveRoom = activeClass && typeof schoolService.getLiveRoomForClass === "function"
    ? schoolService.getLiveRoomForClass(activeClass.id, new Date())
    : "";

  currentRawSnapshot.activeDateTime = currentParts.date + "T" + currentParts.time;
  currentRawSnapshot.activeDateTimeMode = "live";
  currentRawSnapshot.activeSeatPlanId = null;
  currentRawSnapshot.activeSeatPlanRoom = liveRoom || "";
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
  currentRawSnapshot.activeSeatPlanId = null;
  currentRawSnapshot.activeSeatPlanRoom = "";

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

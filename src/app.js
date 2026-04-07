const appShell = document.querySelector(".app-shell");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll("[data-view]");
const viewTitle = document.getElementById("viewTitle");
const viewHeaderActions = document.getElementById("viewHeaderActions");
const viewHeaderUtility = document.getElementById("viewHeaderUtility");
const viewSubtitle = document.getElementById("viewSubtitle");
const viewSecondaryActions = document.getElementById("viewSecondaryActions");
const contentHeader = document.querySelector(".content__header");
const sidebar = document.getElementById("sidebar");
const activeClassBadge = document.getElementById("activeClassBadge");
const activeClassSelect = document.getElementById("activeClassSelect");
const collapsedClassPicker = document.getElementById("collapsedClassPicker");
const activeDateInput = document.getElementById("activeDateInput");
const activeTimeInput = document.getElementById("activeTimeInput");
const liveDateTimeButton = document.getElementById("liveDateTimeButton");
const collapsedLiveDateTimeButton = document.getElementById("collapsedLiveDateTimeButton");
const persistenceButton = document.getElementById("persistenceButton");
const appDataImportInput = document.getElementById("appDataImportInput");
const appDataImportPasswordModal = document.getElementById("appDataImportPasswordModal");
const appDataImportPasswordMeta = document.getElementById("appDataImportPasswordMeta");
const appDataImportPasswordInput = document.getElementById("appDataImportPasswordInput");
const appDataImportPasswordError = document.getElementById("appDataImportPasswordError");
const smartphoneLayoutMedia = typeof window.matchMedia === "function"
  ? window.matchMedia("(max-width: 640px)")
  : null;

const namespace = window.Unterrichtsassistent || {};
const dataLayer = namespace.data || {};
const securityLayer = namespace.security || {};
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
const serializeDomainSnapshotFn = domainLayer.serializeDomainSnapshot;
const parseStudentCsvFn = dataLayer.parseStudentCsv;
const createEmptyClassFn = dataLayer.createEmptyClass;
const mergeImportedStudentsFn = dataLayer.mergeImportedStudents;
const createPastelColorFn = dataLayer.createPastelColor;
const passwordAuthApi = securityLayer.passwordAuth || null;
const appDataCryptoApi = securityLayer.appDataCrypto || null;

const repository = RepositoryClass ? new RepositoryClass() : null;
const AUTH_RETURN_STATE_STORAGE_KEY = "unterrichtsassistent-auth-return-state";

let schoolService = null;
let rawState = null;
let unlockedMasterKeyBytes = null;
let pendingAuthReturnState = null;
let activeViewId = "unterricht";
let unterrichtViewMode = "live";
let unterrichtToolMode = "attendance";
let classViewMode = "analyse";
let classAnalysisSort = { key: "name", direction: "asc" };
let classAnalysisGrouping = "day";
let classAnalysisCriterion = "count";
let classAnalysisEnabledTypes = {
  attendance: true,
  homework: true,
  warning: true,
  assessment: true,
  completedEvaluation: true
};
let timetableViewMode = "ansicht";
let seatPlanViewMode = "ansicht";
let planningViewMode = "jahresplanung";
let bewertungViewMode = "bewerten";
let bewertungCurriculumSectionExpanded = true;
let bewertungTaskSheetSectionExpanded = true;
let bewertungAnalysisSectionExpanded = true;
let bewertungPlannedEvaluationsExpanded = false;
let bewertungPlannedEvaluationDetailsExpanded = false;
let activePerformedPlannedEvaluationId = "";
let activePerformedEvaluationStudentId = "";
let activePerformedEvaluationStudentFilter = "alle";
let activePerformedEvaluationDetailModal = null;
let isClassAnalysisPerformedEvaluationModalOpen = false;
let activeClassAnalysisPerformedEvaluationDraft = null;
let planningAvailableLessonsExpanded = true;
let planningAdminMode = false;
let activeEvaluationSheetDraft = null;
let activePlannedEvaluationDraft = null;
let activePlanningEventDraft = null;
let activeTodoDraft = null;
let expandedTodoIds = [];
let todoStatusFilter = "offen";
let todoViewMode = "liste";
let todoSortMode = "dringlichkeit";
let todoCategoryFilterOpen = false;
let todoCategoryFilters = [];
let todoCategoryFilterAllOff = false;
let todoViewScrollState = null;
let todoStudentAssignmentOpen = false;
let activePlanningInstructionLessonDraft = null;
let activeTimetablePlanningEventDetail = null;
let activeCurriculumSeriesDraft = null;
let activeCurriculumSequenceDraft = null;
let activeCurriculumLessonDraft = null;
let activeCurriculumLessonFlowLessonId = "";
let activeCurriculumLessonFlowViewPhaseIds = [];
let expandedCurriculumSeriesIds = [];
let expandedCurriculumSequenceIds = [];
let activeCurriculumSeriesDrag = null;
let activeCurriculumSeriesDropIndicator = null;
let activeCurriculumSeriesDragPreview = null;
let activeCurriculumSequenceDrag = null;
let activeCurriculumSequenceDropIndicator = null;
let activeCurriculumLessonDrag = null;
let activeCurriculumLessonDropIndicator = null;
let activePlanningRangeDraft = null;
let suppressPlanningDayClickUntil = 0;
let planningSidebarFilterOpen = false;
let planningSidebarCategoryFilters = [];
let planningSidebarCategoryFiltersInitialized = false;
let selectedPlanningEventId = "";
let selectedPlanningEventOccurrenceId = "";
let selectedPlanningEventOccurrenceRange = null;
let seatPlanManageMode = "sitzordnung";
let seatPlanDeskToolMode = "move";
let seatPlanMoveLinkMode = true;
let seatPlanRotateMode = "90";
let seatPlanMirrorMode = "horizontal";
const timetableWeekdayKeys = ["1", "2", "3", "4", "5"];
let liveDateTimeIntervalId = null;
let isClassImportModalOpen = false;
let isClassAnalysisDetailModalOpen = false;
let activeClassAnalysisDetailDraft = null;
let isClassAnalysisRecordEditModalOpen = false;
let activeClassAnalysisRecordEditDraft = null;
let activeClassAnalysisAssessmentGridDrag = null;
let isUnterrichtAssessmentModalOpen = false;
let activeDeskLayoutDrag = null;
let activeDeskLayoutResize = null;
let deskLayoutDragFrameId = 0;
let activeSeatAssignmentDrag = null;
let lastSeatAssignmentNativeDrop = null;
let lastSeatLockPointerToggleAt = 0;
let activeUnterrichtHomeworkPress = null;
let unterrichtHomeworkRadialMenu = null;
let activeUnterrichtWarningPress = null;
let unterrichtWarningRadialMenu = null;
let activeUnterrichtWarningOtherDraft = null;
let activeUnterrichtAssessmentDraft = null;
let activeUnterrichtAssessmentGridDrag = null;
let activeUnterrichtAssessmentPress = null;
let unterrichtAssessmentQuickMenu = null;
let unterrichtAssessmentQuickOverlay = null;
let activeClassAnalysisDragScroll = null;
let activePlanningCurriculumDragScroll = null;
let activePlanningCurriculumAutoScroll = null;
let planningCurriculumAutoScrollFrameId = 0;
let hasBoundClassAnalysisResize = false;
let classAnalysisScrollLeftByClassId = {};
let planningCurriculumScrollLeftByClassId = {};
let activeTimetableWeekShiftAnimation = null;
let activeTimetableSwipe = null;
let activeKnowledgeGapSuggestionListId = "";
let activeKnowledgeGapSuggestionInputId = "";
let activeKnowledgeGapSuggestionBlurTimerId = 0;
let activeKnowledgeGapSuggestionDrag = null;
let activePlanningCategorySuggestionListId = "";
let activePlanningCategorySuggestionInputId = "";
let activePlanningCategorySuggestionBlurTimerId = 0;
let activePlanningCategorySuggestionDrag = null;
let activeEvaluationTopicSuggestionListId = "";
let activeEvaluationTopicSuggestionInputId = "";
let activeEvaluationTopicSuggestionBlurTimerId = 0;
let activeEvaluationTopicSuggestionDrag = null;
let activeUnterrichtLivePhaseControlOverride = null;
let activeUnterrichtLiveAfbSliderDrag = null;
let suppressKnowledgeGapSuggestionClickUntil = 0;
let lastTouchClientY = 0;
const AUTOSAVE_DELAY_MS = 30000;
const HOMEWORK_LONG_PRESS_DELAY_MS = 380;
const HOMEWORK_RADIAL_OPTIONS = [
  { quality: "fehlt", label: "fehlt", side: "left", row: "top" },
  { quality: "unvollstaendig", label: "unvollstaendig", side: "left", row: "middle" },
  { quality: "abgeschrieben", label: "abgeschrieben", side: "left", row: "bottom" },
  { quality: "besondersgut", label: "besonders gut", side: "right", row: "top" },
  { quality: "vorhanden", label: "vorhanden", side: "right", row: "middle" }
];
const WARNING_LONG_PRESS_DELAY_MS = 380;
const ASSESSMENT_LONG_PRESS_DELAY_MS = 380;
const TIMETABLE_WEEK_SHIFT_ANIMATION_MS = 260;
const WARNING_RADIAL_OPTIONS = [
  { category: "letzteentfernen", label: "letzte entfernen", side: "left", row: "top" },
  { category: "andere", label: "andere", side: "left", row: "bottom" },
  { category: "stoerung", label: "Stoerung", side: "top", row: "center" },
  { category: "arbeitsorganisation", label: "Arbeitsorganisation", side: "right", row: "middle" },
  { category: "material", label: "Material", side: "bottom", row: "center" }
];

function isSmartphoneLayout() {
  return !!(smartphoneLayoutMedia && smartphoneLayoutMedia.matches);
}
let pendingPersistTimerId = 0;
let pendingPersistSnapshot = null;
let persistenceHasStoredState = false;
let persistenceHasPendingChanges = false;
let persistenceIsSaving = false;
let persistenceLastError = null;
let persistInFlightPromise = null;
let forcePersistAfterCurrentSave = false;
let idleLockTimerId = 0;
let isLockingForAuth = false;
let pendingEncryptedImportPayload = null;

function isCurriculumPlanningMode() {
  return planningViewMode === "unterrichtsplanung" || planningViewMode === "stoffplanung";
}

function isCurriculumStructureWorkspaceActive() {
  return isCurriculumPlanningMode()
    || (activeViewId === "bewertung" && bewertungViewMode === "erstellen");
}

function getTimetableWeekShiftAnimationDirection() {
  if (!activeTimetableWeekShiftAnimation || !activeTimetableWeekShiftAnimation.direction || !activeTimetableWeekShiftAnimation.startedAt) {
    return "";
  }

  if ((Date.now() - activeTimetableWeekShiftAnimation.startedAt) > TIMETABLE_WEEK_SHIFT_ANIMATION_MS) {
    activeTimetableWeekShiftAnimation = null;
    return "";
  }

  return activeTimetableWeekShiftAnimation.direction;
}

function preventLocalOnlyFormSubmit(event) {
  const form = event && event.target && typeof event.target.matches === "function" && event.target.matches("form[data-local-only-form]")
    ? event.target
    : null;

  if (!form || !event || typeof event.preventDefault !== "function") {
    return;
  }

  event.preventDefault();
}

function serializeSnapshot(snapshot) {
  if (rawState && schoolService && snapshot === schoolService.snapshot) {
    return rawState;
  }

  if (serializeDomainSnapshotFn) {
    return serializeDomainSnapshotFn(snapshot);
  }

  return JSON.parse(JSON.stringify(snapshot || {}));
}

function syncSchoolServiceWithRawState() {
  if (!SchoolServiceClass || !rawState) {
    schoolService = null;
    return null;
  }

  if (!schoolService) {
    schoolService = new SchoolServiceClass(rawState);
  } else {
    schoolService.snapshot = rawState;
  }

  return schoolService;
}

function clearSensitiveRuntimeState() {
  rawState = null;
  schoolService = null;
  unlockedMasterKeyBytes = null;
  pendingAuthReturnState = null;
  pendingPersistSnapshot = null;
  clearPendingPersistTimer();
}

function getUnlockedMasterKey() {
  return unlockedMasterKeyBytes && unlockedMasterKeyBytes.length
    ? unlockedMasterKeyBytes
    : null;
}

async function loadSnapshotFromStorageRecord(storedSnapshotRecord) {
  const masterKeyBytes = getUnlockedMasterKey();

  if (!storedSnapshotRecord) {
    return cloneRawSnapshot(demoSnapshot);
  }

  if (appDataCryptoApi && typeof appDataCryptoApi.isEncryptedSnapshotRecord === "function" && appDataCryptoApi.isEncryptedSnapshotRecord(storedSnapshotRecord)) {
    if (!masterKeyBytes || !appDataCryptoApi || typeof appDataCryptoApi.decryptSnapshot !== "function") {
      throw new Error("Verschluesselter Snapshot kann ohne geladenen Master-Key nicht entschluesselt werden.");
    }

    return appDataCryptoApi.decryptSnapshot(storedSnapshotRecord, masterKeyBytes);
  }

  return cloneRawSnapshot(storedSnapshotRecord);
}

function getAuthPageUrl(mode, reason) {
  const authUrl = new URL("auth.html", window.location.href);

  if (mode) {
    authUrl.searchParams.set("mode", mode);
  }

  if (reason) {
    authUrl.searchParams.set("reason", reason);
  }

  return authUrl.toString();
}

function storeAuthReturnState() {
  window.sessionStorage.setItem(AUTH_RETURN_STATE_STORAGE_KEY, JSON.stringify({
    returnUrl: new URL("index.html", window.location.href).toString(),
      viewId: activeViewId,
      unterrichtViewMode: unterrichtViewMode,
      unterrichtToolMode: unterrichtToolMode,
      classViewMode: classViewMode,
      timetableViewMode: timetableViewMode,
      seatPlanViewMode: seatPlanViewMode,
      planningViewMode: planningViewMode,
      bewertungViewMode: bewertungViewMode,
      planningAdminMode: planningAdminMode,
      activeClassId: rawState && rawState.activeClassId ? rawState.activeClassId : null,
    activeTimetableId: rawState && rawState.activeTimetableId ? rawState.activeTimetableId : null,
    activeSeatPlanId: rawState && rawState.activeSeatPlanId ? rawState.activeSeatPlanId : null,
    activeSeatOrderId: rawState && rawState.activeSeatOrderId ? rawState.activeSeatOrderId : null,
    activeEvaluationSheetId: rawState && rawState.activeEvaluationSheetId ? rawState.activeEvaluationSheetId : null,
    activeSeatPlanRoom: rawState ? String(rawState.activeSeatPlanRoom || "") : "",
    activeDateTime: rawState ? String(rawState.activeDateTime || "") : "",
    activeDateTimeMode: rawState ? String(rawState.activeDateTimeMode || "live") : "live"
  }));
}

function restoreAuthReturnState() {
  let storedState = null;

  try {
    storedState = JSON.parse(window.sessionStorage.getItem(AUTH_RETURN_STATE_STORAGE_KEY) || "null");
  } catch (error) {
    storedState = null;
  }

  if (storedState) {
    pendingAuthReturnState = storedState;
    if (storedState.viewId) {
      activeViewId = String(storedState.viewId);
    }
  }

  window.sessionStorage.removeItem(AUTH_RETURN_STATE_STORAGE_KEY);
}

function applyAuthReturnStateToRawState(snapshot) {
  const nextSnapshot = snapshot || {};
  const returnState = pendingAuthReturnState;

  if (!returnState) {
    return nextSnapshot;
  }

  activeViewId = String(returnState.viewId || activeViewId || "unterricht");
  unterrichtViewMode = String(returnState.unterrichtViewMode || unterrichtViewMode || "live");
  unterrichtToolMode = String(returnState.unterrichtToolMode || unterrichtToolMode || "attendance");
  classViewMode = String(returnState.classViewMode || classViewMode || "analyse");
  timetableViewMode = String(returnState.timetableViewMode || timetableViewMode || "ansicht");
  seatPlanViewMode = String(returnState.seatPlanViewMode || seatPlanViewMode || "ansicht");
  planningViewMode = ["jahresplanung", "unterrichtsplanung", "stoffplanung"].indexOf(String(returnState.planningViewMode || "")) >= 0
    ? String(returnState.planningViewMode)
    : planningViewMode;
  bewertungViewMode = ["analysieren", "evidenz", "erstellen", "entwerfen"].indexOf(String(returnState.bewertungViewMode || "")) >= 0
    ? (String(returnState.bewertungViewMode || "") === "entwerfen" ? "erstellen" : String(returnState.bewertungViewMode))
    : "bewerten";
  if (planningViewMode === "stoffplanung") {
    planningViewMode = "unterrichtsplanung";
  }
  planningAdminMode = Boolean(returnState.planningAdminMode);
  nextSnapshot.activeClassId = returnState.activeClassId || null;
  nextSnapshot.activeTimetableId = returnState.activeTimetableId || null;
  nextSnapshot.activeSeatPlanId = returnState.activeSeatPlanId || null;
  nextSnapshot.activeSeatOrderId = returnState.activeSeatOrderId || null;
  nextSnapshot.activeEvaluationSheetId = returnState.activeEvaluationSheetId || null;
  nextSnapshot.activeSeatPlanRoom = String(returnState.activeSeatPlanRoom || "");
  nextSnapshot.activeDateTime = String(returnState.activeDateTime || "");
  nextSnapshot.activeDateTimeMode = String(returnState.activeDateTimeMode || "live");
  pendingAuthReturnState = null;

  return nextSnapshot;
}

function redirectToAuthPage(mode, reason) {
  if (isLockingForAuth) {
    return;
  }

  isLockingForAuth = true;

  if (passwordAuthApi && typeof passwordAuthApi.clearUnlockSession === "function") {
    passwordAuthApi.clearUnlockSession();
  }

  storeAuthReturnState();
  clearSensitiveRuntimeState();
  window.location.replace(getAuthPageUrl(mode, reason));
}

function clearIdleLockTimer() {
  if (!idleLockTimerId) {
    return;
  }

  window.clearTimeout(idleLockTimerId);
  idleLockTimerId = 0;
}

function triggerIdleLock() {
  const snapshotToPersist = schoolService && getMutableRawSnapshot()
    ? getMutableRawSnapshot()
    : null;

  clearIdleLockTimer();

  if (!snapshotToPersist) {
    redirectToAuthPage("unlock", "idle");
    return;
  }

  flushPendingPersist({
    snapshot: snapshotToPersist,
    immediate: true
  }).finally(function () {
    redirectToAuthPage("unlock", "idle");
  });
}

function noteUnlockActivity() {
  if (isLockingForAuth) {
    return;
  }

  if (!passwordAuthApi || typeof passwordAuthApi.touchUnlockSession !== "function") {
    return;
  }

  if (!passwordAuthApi.hasValidUnlockSession()) {
    triggerIdleLock();
    return;
  }

  passwordAuthApi.touchUnlockSession();
  clearIdleLockTimer();
  idleLockTimerId = window.setTimeout(triggerIdleLock, passwordAuthApi.idleTimeoutMs);
}

function bindIdleLockTracking() {
  ["pointerdown", "keydown", "input", "scroll", "touchstart"].forEach(function (eventName) {
    document.addEventListener(eventName, noteUnlockActivity, { passive: eventName === "scroll" || eventName === "touchstart" });
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      if (!passwordAuthApi || !passwordAuthApi.hasValidUnlockSession()) {
        triggerIdleLock();
        return;
      }

      noteUnlockActivity();
    }
  });
}

function getClassImportModal() {
  return document.getElementById("classImportModal");
}

function getClassAnalysisDetailModal() {
  return document.getElementById("classAnalysisDetailModal");
}

function getClassAnalysisRecordEditModal() {
  return document.getElementById("classAnalysisRecordEditModal");
}

function getClassAnalysisPerformedEvaluationModal() {
  return document.getElementById("classAnalysisPerformedEvaluationRuntimeModal");
}

function getClassAnalysisPerformedEvaluationModalRoot() {
  let root = document.getElementById("classAnalysisPerformedEvaluationRuntimeRoot");

  if (!root) {
    root = document.createElement("div");
    root.id = "classAnalysisPerformedEvaluationRuntimeRoot";
    document.body.appendChild(root);
  }

  return root;
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

function isEditingFocusableInput() {
  const activeElement = document.activeElement;
  const tagName = activeElement && activeElement.tagName ? String(activeElement.tagName).toUpperCase() : "";
  const isTextInput = tagName === "TEXTAREA"
    || (tagName === "INPUT" && ["button", "checkbox", "color", "file", "hidden", "image", "radio", "range", "reset", "submit"].indexOf(String(activeElement.type || "").toLowerCase()) === -1)
    || tagName === "SELECT";
  const isEditableContent = Boolean(activeElement && activeElement.isContentEditable);

  if (!activeElement) {
    return false;
  }

  if (activeElement.disabled || activeElement.readOnly) {
    return false;
  }

  return isTextInput || isEditableContent;
}

function syncLiveDateTimeUi() {
  if (!schoolService || !isLiveDateTimeMode() || activeDeskLayoutDrag || activeDeskLayoutResize || isClassImportModalOpen || isClassAnalysisDetailModalOpen || isClassAnalysisRecordEditModalOpen || isUnterrichtAssessmentModalOpen || isEditingFocusableInput()) {
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

function getTimetablesCollection(snapshot) {
  if (!snapshot) {
    return [];
  }

  if (Array.isArray(snapshot.timetables)) {
    return snapshot.timetables;
  }

  return snapshot.timetable ? [snapshot.timetable] : [];
}

function getMutableTimetablesCollection(snapshot) {
  if (!snapshot) {
    return [];
  }

  if (!Array.isArray(snapshot.timetables)) {
    snapshot.timetables = snapshot.timetable ? [snapshot.timetable] : [];
  }

  delete snapshot.timetable;
  return snapshot.timetables;
}

function getManagedTimetableFromSnapshot(snapshot) {
  const timetables = getTimetablesCollection(snapshot);
  const activeTimetable = timetables.find(function (timetable) {
    return timetable.id === snapshot.activeTimetableId;
  });

  if (activeTimetable) {
    return activeTimetable;
  }

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

  rawState = normalizeRawSnapshot(demoSnapshot);
  return syncSchoolServiceWithRawState();
}

function cloneRawSnapshot(rawSnapshot) {
  return JSON.parse(JSON.stringify(rawSnapshot || {}));
}

function getCurrentTimestampFilePart() {
  const now = new Date();

  return [
    String(now.getFullYear()).padStart(4, "0"),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join("");
}

function normalizeRawSnapshot(rawSnapshot) {
  if (createSnapshot && serializeSnapshot) {
    return serializeSnapshot(createSnapshot(rawSnapshot || {}));
  }

  return cloneRawSnapshot(rawSnapshot);
}

function getMutableRawSnapshot() {
  if (!rawState && schoolService && serializeSnapshot) {
    rawState = serializeSnapshot(schoolService.snapshot);
  }

  return rawState;
}

function stripNonPersistentUiState(rawSnapshot) {
  const snapshot = cloneRawSnapshot(rawSnapshot);

  snapshot.activeClassId = null;
  snapshot.activeTimetableId = null;
  snapshot.activeSeatPlanId = null;
  snapshot.activeSeatOrderId = null;
  snapshot.activeEvaluationSheetId = null;
  snapshot.activeSeatPlanRoom = "";
  snapshot.activeDateTime = "";
  snapshot.activeDateTimeMode = "live";

  return snapshot;
}

function buildImportableSnapshot(rawSnapshot) {
  return cloneRawSnapshot(rawSnapshot);
}

function normalizeImportedAppSnapshot(rawSnapshot) {
  const normalizedSnapshot = normalizeRawSnapshot(rawSnapshot || {});
  const importedSnapshot = rawSnapshot || {};

  normalizedSnapshot.activeClassId = importedSnapshot.activeClassId || normalizedSnapshot.activeClassId || null;
  normalizedSnapshot.activeTimetableId = importedSnapshot.activeTimetableId || normalizedSnapshot.activeTimetableId || null;
  normalizedSnapshot.activeSeatPlanId = importedSnapshot.activeSeatPlanId || normalizedSnapshot.activeSeatPlanId || null;
  normalizedSnapshot.activeSeatOrderId = importedSnapshot.activeSeatOrderId || normalizedSnapshot.activeSeatOrderId || null;
  normalizedSnapshot.activeEvaluationSheetId = importedSnapshot.activeEvaluationSheetId || normalizedSnapshot.activeEvaluationSheetId || null;
  normalizedSnapshot.activeSeatPlanRoom = String(importedSnapshot.activeSeatPlanRoom || normalizedSnapshot.activeSeatPlanRoom || "");
  normalizedSnapshot.activeDateTime = String(importedSnapshot.activeDateTime || normalizedSnapshot.activeDateTime || "");
  normalizedSnapshot.activeDateTimeMode = String(importedSnapshot.activeDateTimeMode || normalizedSnapshot.activeDateTimeMode || "live");

  return normalizedSnapshot;
}

function closeOpenTransientUi() {
  closeKnowledgeGapSuggestions();
  closeEvaluationTopicSuggestions();

  if (typeof window.UnterrichtsassistentApp.closeUnterrichtAssessmentModal === "function") {
    window.UnterrichtsassistentApp.closeUnterrichtAssessmentModal();
  }

  if (typeof window.UnterrichtsassistentApp.closeUnterrichtWarningOtherModal === "function") {
    window.UnterrichtsassistentApp.closeUnterrichtWarningOtherModal();
  }

  if (typeof window.UnterrichtsassistentApp.closeClassAnalysisDetailModal === "function") {
    window.UnterrichtsassistentApp.closeClassAnalysisDetailModal();
  }

  if (typeof window.UnterrichtsassistentApp.closeClassAnalysisRecordEditModal === "function") {
    window.UnterrichtsassistentApp.closeClassAnalysisRecordEditModal();
  }

  if (typeof window.UnterrichtsassistentApp.closeClassAnalysisPerformedEvaluationModal === "function") {
    window.UnterrichtsassistentApp.closeClassAnalysisPerformedEvaluationModal();
  }

  if (typeof window.UnterrichtsassistentApp.closeClassImportModal === "function") {
    window.UnterrichtsassistentApp.closeClassImportModal();
  }

  if (typeof window.UnterrichtsassistentApp.closePlanningEventModal === "function") {
    window.UnterrichtsassistentApp.closePlanningEventModal();
  }

  if (typeof window.UnterrichtsassistentApp.closeEvaluationSheetModal === "function") {
    window.UnterrichtsassistentApp.closeEvaluationSheetModal();
  }

  if (typeof window.UnterrichtsassistentApp.closePlannedEvaluationModal === "function") {
    window.UnterrichtsassistentApp.closePlannedEvaluationModal();
  }

  if (typeof window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal === "function") {
    window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal();
  }
}

async function ensureAuthAccess() {
  let authRecord = null;
  let sessionMasterKeyBytes = null;

  if (!repository) {
    return true;
  }

  if (!passwordAuthApi || !passwordAuthApi.ensureCryptoSupport()) {
    throw new Error("Passwortschutz konnte nicht initialisiert werden.");
  }

  authRecord = await repository.loadPasswordAuthRecord();

  if (!authRecord) {
    redirectToAuthPage("setup", "missing-auth");
    return false;
  }

  if (!passwordAuthApi.hasValidUnlockSession()) {
    redirectToAuthPage("unlock", "startup");
    return false;
  }

  sessionMasterKeyBytes = passwordAuthApi.getSessionMasterKeyBytes();

  if (!sessionMasterKeyBytes || !sessionMasterKeyBytes.length) {
    redirectToAuthPage("unlock", "startup");
    return false;
  }

  unlockedMasterKeyBytes = sessionMasterKeyBytes;
  passwordAuthApi.clearSessionMasterKey();
  restoreAuthReturnState();
  noteUnlockActivity();
  return true;
}

function refreshSnapshotInMemory(nextRawSnapshot, nextViewId) {
  rawState = nextRawSnapshot;
  syncSchoolServiceWithRawState();
  setActiveView(nextViewId || activeViewId);
  return Promise.resolve(true);
}

function clearPendingPersistTimer() {
  if (!pendingPersistTimerId) {
    return;
  }

  window.clearTimeout(pendingPersistTimerId);
  pendingPersistTimerId = 0;
}

function trySetPointerCapture(target, pointerId) {
  if (!target || typeof target.setPointerCapture !== "function" || typeof pointerId !== "number") {
    return;
  }

  try {
    target.setPointerCapture(pointerId);
  } catch (error) {
    void error;
  }
}

function tryReleasePointerCapture(target, pointerId) {
  if (!target || typeof target.releasePointerCapture !== "function" || typeof pointerId !== "number") {
    return;
  }

  try {
    target.releasePointerCapture(pointerId);
  } catch (error) {
    void error;
  }
}

function clearKnowledgeGapSuggestionBlurTimer() {
  if (!activeKnowledgeGapSuggestionBlurTimerId) {
    return;
  }

  window.clearTimeout(activeKnowledgeGapSuggestionBlurTimerId);
  activeKnowledgeGapSuggestionBlurTimerId = 0;
}

function clearPlanningCategorySuggestionBlurTimer() {
  if (!activePlanningCategorySuggestionBlurTimerId) {
    return;
  }

  window.clearTimeout(activePlanningCategorySuggestionBlurTimerId);
  activePlanningCategorySuggestionBlurTimerId = 0;
}

function clearEvaluationTopicSuggestionBlurTimer() {
  if (!activeEvaluationTopicSuggestionBlurTimerId) {
    return;
  }

  window.clearTimeout(activeEvaluationTopicSuggestionBlurTimerId);
  activeEvaluationTopicSuggestionBlurTimerId = 0;
}

function isScrollableY(element) {
  if (!element || element === document.body || element === document.documentElement) {
    return false;
  }

  return element.scrollHeight > element.clientHeight;
}

function findScrollableYAncestor(startNode) {
  let currentNode = startNode && startNode.nodeType === 1
    ? startNode
    : (startNode ? startNode.parentElement : null);

  while (currentNode && currentNode !== document.body) {
    if (isScrollableY(currentNode)) {
      return currentNode;
    }

    currentNode = currentNode.parentElement;
  }

  return null;
}

function escapeKnowledgeGapSuggestionHtml(value) {
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

function escapePlanningCategorySuggestionHtml(value) {
  return escapeKnowledgeGapSuggestionHtml(value);
}

function escapeEvaluationTopicSuggestionHtml(value) {
  return escapeKnowledgeGapSuggestionHtml(value);
}

function getKnowledgeGapSuggestionList(listId) {
  return listId ? document.getElementById(listId) : null;
}

function getPlanningCategorySuggestionList(listId) {
  return listId ? document.getElementById(listId) : null;
}

function getEvaluationTopicSuggestionList(listId) {
  return listId ? document.getElementById(listId) : null;
}

function getPlanningCollections(snapshot) {
  const source = snapshot || {};

  if (!Array.isArray(source.planningEvents)) {
    source.planningEvents = [];
  }

  if (!Array.isArray(source.planningCategories)) {
    source.planningCategories = [];
  }

  if (!Array.isArray(source.planningInstructionLessonStatuses)) {
    source.planningInstructionLessonStatuses = [];
  }

  return {
    events: source.planningEvents,
    categories: source.planningCategories,
    lessonStatuses: source.planningInstructionLessonStatuses
  };
}

function parsePlanningEventDate(dateValue) {
  const normalizedDate = String(dateValue || "").slice(0, 10);
  const parts = normalizedDate.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const parsedDate = parts.length === 3
    ? new Date(year, month - 1, day)
    : null;

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  if (parsedDate.getFullYear() !== year || parsedDate.getMonth() !== month - 1 || parsedDate.getDate() !== day) {
    return null;
  }

  return parsedDate;
}

function toPlanningEventIsoDate(dateValue) {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return "";
  }

  return [
    String(dateValue.getFullYear()).padStart(4, "0"),
    String(dateValue.getMonth() + 1).padStart(2, "0"),
    String(dateValue.getDate()).padStart(2, "0")
  ].join("-");
}

function getPlanningEventDayDifference(startDateValue, endDateValue) {
  const startDate = parsePlanningEventDate(startDateValue);
  const endDate = parsePlanningEventDate(endDateValue);

  if (!startDate || !endDate) {
    return 0;
  }

  return Math.max(0, Math.round((Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) / 86400000));
}

function addPlanningEventDays(dateValue, dayCount) {
  const parsedDate = parsePlanningEventDate(dateValue);
  const nextDate = parsedDate
    ? new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate())
    : null;

  if (!nextDate) {
    return "";
  }

  nextDate.setDate(nextDate.getDate() + (Number(dayCount) || 0));
  return toPlanningEventIsoDate(nextDate);
}

function addPlanningEventMonths(dateValue, monthCount) {
  const parsedDate = parsePlanningEventDate(dateValue);
  const normalizedMonthCount = Math.round(Number(monthCount) || 0);
  let targetYear;
  let targetMonthIndex;
  let lastDayOfTargetMonth;

  if (!parsedDate) {
    return "";
  }

  targetYear = parsedDate.getFullYear();
  targetMonthIndex = parsedDate.getMonth() + normalizedMonthCount;
  targetYear += Math.floor(targetMonthIndex / 12);
  targetMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  lastDayOfTargetMonth = new Date(targetYear, targetMonthIndex + 1, 0).getDate();

  return toPlanningEventIsoDate(new Date(
    targetYear,
    targetMonthIndex,
    Math.min(parsedDate.getDate(), lastDayOfTargetMonth)
  ));
}

function getPlanningEventMonthlyWeekdayOccurrenceDate(dateValue, monthCount) {
  const parsedDate = parsePlanningEventDate(dateValue);
  const normalizedMonthCount = Math.round(Number(monthCount) || 0);
  let targetYear;
  let targetMonthIndex;
  let firstOfMonth;
  let lastOfMonth;
  let weekday;
  let ordinal;
  let isLast;
  let firstMatchDay;
  let candidateDay;

  if (!parsedDate) {
    return "";
  }

  targetYear = parsedDate.getFullYear();
  targetMonthIndex = parsedDate.getMonth() + normalizedMonthCount;
  targetYear += Math.floor(targetMonthIndex / 12);
  targetMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  firstOfMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
  lastOfMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0);
  weekday = parsedDate.getDay();
  ordinal = Math.floor((parsedDate.getDate() - 1) / 7) + 1;
  isLast = parsedDate.getDate() + 7 > lastOfMonth.getDate();
  firstOfMonth = new Date(targetYear, targetMonthIndex, 1);
  lastOfMonth = new Date(targetYear, targetMonthIndex + 1, 0);
  firstMatchDay = 1 + ((weekday - firstOfMonth.getDay() + 7) % 7);
  candidateDay = firstMatchDay + ((ordinal - 1) * 7);

  if (isLast || candidateDay > lastOfMonth.getDate()) {
    candidateDay = lastOfMonth.getDate();
    while (candidateDay > 1 && new Date(targetYear, targetMonthIndex, candidateDay).getDay() !== weekday) {
      candidateDay -= 1;
    }
  }

  return toPlanningEventIsoDate(new Date(targetYear, targetMonthIndex, candidateDay));
}

function normalizePlanningEventRecurrenceInterval(value) {
  return Math.max(1, Math.round(Number(value) || 1));
}

function normalizePlanningEventRecurrenceUnit(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();

  return ["days", "weeks", "months"].indexOf(normalizedValue) >= 0
    ? normalizedValue
    : "weeks";
}

function normalizePlanningEventRecurrenceUntilDate(value) {
  return String(value || "").slice(0, 10);
}

function buildPlanningEventDisplayOccurrence(eventItem, occurrenceIndex) {
  const baseStartDate = String(eventItem && eventItem.startDate || "").slice(0, 10);
  const baseEndDate = String(eventItem && eventItem.endDate || baseStartDate).slice(0, 10) || baseStartDate;
  const isRecurring = Boolean(eventItem && eventItem.isRecurring);
  const recurrenceInterval = normalizePlanningEventRecurrenceInterval(eventItem && eventItem.recurrenceInterval);
  const recurrenceUnit = normalizePlanningEventRecurrenceUnit(eventItem && eventItem.recurrenceUnit);
  const monthOffset = recurrenceInterval * occurrenceIndex;
  const startDateValue = occurrenceIndex === 0
    ? baseStartDate
    : (function () {
        if (recurrenceUnit === "days") {
          return addPlanningEventDays(baseStartDate, recurrenceInterval * occurrenceIndex);
        }

        if (recurrenceUnit === "weeks") {
          return addPlanningEventDays(baseStartDate, recurrenceInterval * occurrenceIndex * 7);
        }

        if (eventItem && eventItem.recurrenceMonthlyWeekday) {
          return getPlanningEventMonthlyWeekdayOccurrenceDate(baseStartDate, monthOffset);
        }

        return addPlanningEventMonths(baseStartDate, monthOffset);
      }());
  const endDateValue = addPlanningEventDays(startDateValue, getPlanningEventDayDifference(baseStartDate, baseEndDate));

  if (!startDateValue) {
    return null;
  }

  return Object.assign({}, eventItem, {
    id: String(eventItem && eventItem.id || "").trim(),
    sourceEventId: String(eventItem && eventItem.id || "").trim(),
    occurrenceId: [String(eventItem && eventItem.id || "").trim(), startDateValue, endDateValue].join("::"),
    occurrenceIndex: occurrenceIndex,
    isRecurringSeries: isRecurring,
    isRecurringOccurrence: isRecurring && occurrenceIndex > 0,
    originalStartDate: baseStartDate,
    originalEndDate: baseEndDate,
    startDate: startDateValue,
    endDate: endDateValue
  });
}

function doesPlanningEventOccurrenceOverlapRange(eventItem, rangeStartDate, rangeEndDate) {
  const startDateValue = String(eventItem && eventItem.startDate || "").slice(0, 10);
  const endDateValue = String(eventItem && eventItem.endDate || startDateValue).slice(0, 10);

  if (!startDateValue) {
    return false;
  }

  if (rangeStartDate && endDateValue < rangeStartDate) {
    return false;
  }

  if (rangeEndDate && startDateValue > rangeEndDate) {
    return false;
  }

  return true;
}

function getPlanningEventsForDisplay(snapshot, options) {
  const sourceSnapshot = snapshot || {};
  const sourceEvents = getPlanningCollections(sourceSnapshot).events;
  const rangeOptions = options && typeof options === "object"
    ? options
    : {};
  const rangeStartDate = String(rangeOptions.rangeStart || "").slice(0, 10);
  const rangeEndDate = String(rangeOptions.rangeEnd || "").slice(0, 10);
  const renderedEvents = [];

  sourceEvents.forEach(function (eventItem) {
    const normalizedStartDate = String(eventItem && eventItem.startDate || "").slice(0, 10);
    const normalizedUntilDate = normalizePlanningEventRecurrenceUntilDate(eventItem && eventItem.recurrenceUntilDate);
    const isRecurring = Boolean(eventItem && eventItem.isRecurring) && Boolean(normalizedStartDate) && Boolean(normalizedUntilDate);
    let occurrenceIndex = 0;
    let occurrence = buildPlanningEventDisplayOccurrence(eventItem, occurrenceIndex);

    if (!occurrence) {
      return;
    }

    while (occurrence) {
      if (occurrenceIndex === 0 || (isRecurring && String(occurrence.startDate || "").slice(0, 10) <= normalizedUntilDate)) {
        if (doesPlanningEventOccurrenceOverlapRange(occurrence, rangeStartDate, rangeEndDate)) {
          renderedEvents.push(occurrence);
        }
      } else {
        break;
      }

      if (!isRecurring) {
        break;
      }

      occurrenceIndex += 1;
      occurrence = buildPlanningEventDisplayOccurrence(eventItem, occurrenceIndex);

      if (!occurrence || occurrenceIndex > 5000) {
        break;
      }

      if (rangeEndDate && String(occurrence.startDate || "").slice(0, 10) > rangeEndDate && String(occurrence.startDate || "").slice(0, 10) > normalizedUntilDate) {
        break;
      }
    }
  });

  return renderedEvents;
}

function timeValueToMinutes(value, fallbackValue) {
  const trimmedValue = String(value || "").trim();
  const fallbackMinutes = Number.isFinite(Number(fallbackValue)) ? Number(fallbackValue) : null;
  const parts = trimmedValue.split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (parts.length >= 2 && Number.isFinite(hours) && Number.isFinite(minutes)) {
    return Math.max(0, Math.min(1440, (hours * 60) + minutes));
  }

  return fallbackMinutes;
}

function getPlanningEventTargetClassIds(snapshot, eventItem) {
  const classes = snapshot && Array.isArray(snapshot.classes) ? snapshot.classes : [];
  const normalizedCategory = String(eventItem && eventItem.category || "").trim().toLowerCase();

  return classes.filter(function (schoolClass) {
    return [String(schoolClass && schoolClass.name || "").trim(), String(schoolClass && schoolClass.subject || "").trim()]
      .filter(Boolean)
      .join(" ")
      .trim()
      .toLowerCase() === normalizedCategory;
  }).map(function (schoolClass) {
    return String(schoolClass && schoolClass.id || "").trim();
  }).filter(Boolean);
}

function doesPlanningEventCauseInstructionOutage(eventItem) {
  const normalizedCategory = String(eventItem && eventItem.category || "").trim().toLowerCase();

  return normalizedCategory === "unterrichtsfrei" || Boolean(eventItem && eventItem.causesInstructionOutage);
}

function doesPlanningEventAffectClass(snapshot, eventItem, classId) {
  const normalizedClassId = String(classId || "").trim();
  const normalizedCategory = String(eventItem && eventItem.category || "").trim().toLowerCase();
  const targetClassIds = getPlanningEventTargetClassIds(snapshot, eventItem);

  if (!normalizedClassId) {
    return true;
  }

  if (normalizedCategory === "unterrichtsfrei") {
    return true;
  }

  if (targetClassIds.length > 0) {
    return targetClassIds.indexOf(normalizedClassId) >= 0;
  }

  return Boolean(eventItem && eventItem.causesInstructionOutage);
}

function doesPlanningEventAffectLessonTime(eventItem, lessonStartTime, lessonEndTime) {
  const eventStartMinutes = timeValueToMinutes(eventItem && eventItem.startTime, 0);
  const eventEndMinutes = timeValueToMinutes(eventItem && eventItem.endTime, 1440);
  const hasTimedBounds = Boolean(String(eventItem && eventItem.startTime || "").trim() || String(eventItem && eventItem.endTime || "").trim());
  const lessonStartMinutes = timeValueToMinutes(lessonStartTime, 0);
  const lessonEndMinutes = timeValueToMinutes(lessonEndTime, lessonStartMinutes + 1);

  if (!hasTimedBounds) {
    return true;
  }

  return lessonStartMinutes < eventEndMinutes && lessonEndMinutes > eventStartMinutes;
}

function getPlanningInstructionOutageInfo(snapshot, classId, lessonDate, lessonStartTime, lessonEndTime) {
  const normalizedLessonDate = String(lessonDate || "").slice(0, 10);
  const displayEvents = normalizedLessonDate
    ? getPlanningEventsForDisplay(snapshot, {
        rangeStart: normalizedLessonDate,
        rangeEnd: normalizedLessonDate
      })
    : [];
  const matchingEvents = displayEvents.filter(function (eventItem) {
    return doesPlanningEventCauseInstructionOutage(eventItem)
      && doesPlanningEventAffectClass(snapshot, eventItem, classId)
      && doesPlanningEventAffectLessonTime(eventItem, lessonStartTime, lessonEndTime);
  });
  const allDayEvents = matchingEvents.filter(function (eventItem) {
    return !String(eventItem && eventItem.startTime || "").trim() && !String(eventItem && eventItem.endTime || "").trim();
  });
  const firstEvent = matchingEvents[0] || null;

  return {
    isCancelled: matchingEvents.length > 0,
    isAllDay: allDayEvents.length > 0,
    events: matchingEvents,
    title: String(firstEvent && firstEvent.title || "").trim(),
    reason: String(firstEvent && firstEvent.description || "").trim()
  };
}

function getPlanningInstructionOutageEventDetail(snapshot, classId, lessonDate) {
  const normalizedClassId = String(classId || "").trim();
  const normalizedLessonDate = String(lessonDate || "").slice(0, 10);
  const dateParts = normalizedLessonDate.split("-");
  const year = Number(dateParts[0]);
  const month = Number(dateParts[1]);
  const day = Number(dateParts[2]);
  const seenLookup = {};
  const matchingEvents = [];
  let lessonUnits = [];

  function appendEvents(items) {
    (Array.isArray(items) ? items : []).forEach(function (eventItem) {
      const eventKey = String(eventItem && eventItem.occurrenceId || eventItem && eventItem.id || "").trim();

      if (!eventKey || seenLookup[eventKey]) {
        return;
      }

      seenLookup[eventKey] = true;
      matchingEvents.push(eventItem);
    });
  }

  if (!normalizedClassId || !normalizedLessonDate) {
    return null;
  }

  appendEvents(getPlanningInstructionOutageInfo(snapshot, normalizedClassId, normalizedLessonDate, "", "").events);

  if (schoolService && typeof schoolService.getLessonUnitsForClass === "function" && dateParts.length === 3 && !Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
    lessonUnits = schoolService.getLessonUnitsForClass(normalizedClassId, new Date(year, month - 1, day)).slice().sort(function (leftItem, rightItem) {
      return String(leftItem && leftItem.startTime || "").trim().localeCompare(String(rightItem && rightItem.startTime || "").trim());
    });

    lessonUnits.forEach(function (lessonUnit) {
      appendEvents(getPlanningInstructionOutageInfo(
        snapshot,
        normalizedClassId,
        normalizedLessonDate,
        lessonUnit && lessonUnit.startTime,
        lessonUnit && lessonUnit.endTime
      ).events);
    });
  }

  return matchingEvents[0] || null;
}

function getCurriculumCollections(snapshot) {
  const source = snapshot || {};

  if (!Array.isArray(source.curriculumSeries)) {
    source.curriculumSeries = [];
  }

  if (!Array.isArray(source.curriculumSequences)) {
    source.curriculumSequences = [];
  }

  if (!Array.isArray(source.curriculumLessonPlans)) {
    source.curriculumLessonPlans = [];
  }

  if (!Array.isArray(source.curriculumLessonPhases)) {
    source.curriculumLessonPhases = [];
  }

  if (!Array.isArray(source.curriculumLessonSteps)) {
    source.curriculumLessonSteps = [];
  }

  if (!Array.isArray(source.curriculumLessonPhaseStatuses)) {
    source.curriculumLessonPhaseStatuses = [];
  }

  return {
    series: source.curriculumSeries,
    sequences: source.curriculumSequences,
    lessons: source.curriculumLessonPlans,
    lessonPhases: source.curriculumLessonPhases,
    lessonSteps: source.curriculumLessonSteps,
    lessonPhaseStatuses: source.curriculumLessonPhaseStatuses
  };
}

function getOrderedCurriculumSeriesForClass(snapshot, classId) {
  const collections = getCurriculumCollections(snapshot);
  const items = collections.series.filter(function (entry) {
    return String(entry && entry.classId || "").trim() === String(classId || "").trim();
  });
  const incomingCounts = {};
  const itemById = {};
  const ordered = [];
  let current = null;

  items.forEach(function (entry) {
    const entryId = String(entry && entry.id || "").trim();

    if (!entryId) {
      return;
    }

    itemById[entryId] = entry;
    incomingCounts[entryId] = incomingCounts[entryId] || 0;
  });

  items.forEach(function (entry) {
    const nextId = String(entry && entry.nextSeriesId || "").trim();

    if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
      incomingCounts[nextId] += 1;
    }
  });

  current = items.find(function (entry) {
    return !incomingCounts[String(entry && entry.id || "").trim()];
  }) || items[0] || null;

  while (current) {
    const currentId = String(current && current.id || "").trim();
    const nextId = String(current && current.nextSeriesId || "").trim();

    if (!currentId || ordered.some(function (entry) {
      return String(entry && entry.id || "").trim() === currentId;
    })) {
      break;
    }

    ordered.push(current);
    current = nextId && itemById[nextId] ? itemById[nextId] : null;
  }

  items.forEach(function (entry) {
    if (!ordered.some(function (orderedEntry) {
      return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
    })) {
      ordered.push(entry);
    }
  });

  return ordered;
}

function reconnectCurriculumSeriesChain(items) {
  items.forEach(function (entry, index) {
    entry.nextSeriesId = items[index + 1] ? String(items[index + 1].id || "").trim() : "";
  });
}

function applyCurriculumSeriesDropIndicatorToDom() {
  const cells = document.querySelectorAll(".planning-curriculum__cell--series[data-series-drop-target], .planning-curriculum__cell--add[data-series-drop-target-add='true']");

  eachNode(cells, function (cell) {
    cell.classList.remove("is-drop-target", "is-drop-target--before", "is-drop-target--after");
    cell.style.removeProperty("--planning-curriculum-drop-color");
  });

  if (!activeCurriculumSeriesDropIndicator) {
    return;
  }

  const targetSeriesId = String(activeCurriculumSeriesDropIndicator.targetSeriesId || "").trim();
  const placement = String(activeCurriculumSeriesDropIndicator.placement || "").trim() === "before" ? "before" : "after";
  const color = normalizePlanningColorValue(activeCurriculumSeriesDropIndicator.color) || "#3975ab";
  const selector = targetSeriesId
    ? '.planning-curriculum__cell--series[data-series-drop-target="' + targetSeriesId.replace(/"/g, '\\"') + '"]'
    : ".planning-curriculum__cell--add[data-series-drop-target-add='true']";
  const targetCell = document.querySelector(selector);

  if (!targetCell) {
    return;
  }

  targetCell.classList.add("is-drop-target", placement === "before" ? "is-drop-target--before" : "is-drop-target--after");
  targetCell.style.setProperty("--planning-curriculum-drop-color", color);
}

function clearCurriculumSeriesDropIndicator() {
  activeCurriculumSeriesDropIndicator = null;
  applyCurriculumSeriesDropIndicatorToDom();
}

function setCurriculumSeriesDropIndicator(targetSeriesId, placement, color) {
  activeCurriculumSeriesDropIndicator = {
    targetSeriesId: String(targetSeriesId || "").trim(),
    placement: placement === "before" ? "before" : "after",
    color: normalizePlanningColorValue(color) || "#3975ab"
  };
  applyCurriculumSeriesDropIndicatorToDom();
}

function ensureCurriculumSeriesDragPreview() {
  if (activeCurriculumSeriesDragPreview && activeCurriculumSeriesDragPreview.parentNode) {
    return activeCurriculumSeriesDragPreview;
  }

  activeCurriculumSeriesDragPreview = document.createElement("div");
  activeCurriculumSeriesDragPreview.className = "planning-curriculum__drag-preview";
  document.body.appendChild(activeCurriculumSeriesDragPreview);
  return activeCurriculumSeriesDragPreview;
}

function updateCurriculumSeriesDragPreview(clientX, clientY, color) {
  const preview = ensureCurriculumSeriesDragPreview();

  preview.style.background = normalizePlanningColorValue(color) || "#d9d4cb";
  preview.style.left = String((Number(clientX) || 0) + 12) + "px";
  preview.style.top = String((Number(clientY) || 0) - 12) + "px";
  preview.hidden = false;
}

function removeCurriculumSeriesDragPreview() {
  if (!activeCurriculumSeriesDragPreview) {
    return;
  }

  if (activeCurriculumSeriesDragPreview.parentNode) {
    activeCurriculumSeriesDragPreview.parentNode.removeChild(activeCurriculumSeriesDragPreview);
  }

  activeCurriculumSeriesDragPreview = null;
}

function getCurriculumSeriesDropTargetFromPoint(clientX, clientY) {
  const target = document.elementFromPoint(Number(clientX) || 0, Number(clientY) || 0);
  const dropCell = target && typeof target.closest === "function"
    ? target.closest(".planning-curriculum__cell--series[data-series-drop-target], .planning-curriculum__cell--add[data-series-drop-target-add='true']")
    : null;
  const targetSeriesId = dropCell
    ? String(dropCell.getAttribute("data-series-drop-target") || "").trim()
    : "";
  const placement = dropCell && dropCell.classList.contains("planning-curriculum__cell--series")
    ? (((Number(clientX) || 0) <= (dropCell.getBoundingClientRect().left + (dropCell.getBoundingClientRect().width / 2))) ? "before" : "after")
    : "after";

  if (!dropCell) {
    return null;
  }

  return {
    targetSeriesId: targetSeriesId,
    placement: placement
  };
}

function clearCurriculumSeriesPointerDrag() {
  if (!activeCurriculumSeriesDrag) {
    return;
  }

  window.removeEventListener("pointermove", window.UnterrichtsassistentApp.handleCurriculumSeriesPointerMove);
  window.removeEventListener("pointerup", window.UnterrichtsassistentApp.handleCurriculumSeriesPointerEnd);
  window.removeEventListener("pointercancel", window.UnterrichtsassistentApp.handleCurriculumSeriesPointerEnd);
  removeCurriculumSeriesDragPreview();
  clearCurriculumSeriesDropIndicator();
  stopPlanningCurriculumAutoScroll();
  activeCurriculumSeriesDrag = null;
}

function getCurriculumSeriesDropPlacement(event) {
  const target = event && event.currentTarget ? event.currentTarget : null;
  const rect = target && typeof target.getBoundingClientRect === "function"
    ? target.getBoundingClientRect()
    : null;
  const clientX = Number(event && event.clientX) || 0;

  if (!rect) {
    return "after";
  }

  return clientX <= rect.left + (rect.width / 2) ? "before" : "after";
}

function reorderCurriculumSeries(draggedSeriesId, targetSeriesId, placement) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedDraggedSeriesId = String(draggedSeriesId || "").trim();
  const normalizedTargetSeriesId = String(targetSeriesId || "").trim();
  const normalizedPlacement = placement === "before" ? "before" : "after";
  const orderedSeries = currentRawSnapshot && activeClass
    ? getOrderedCurriculumSeriesForClass(currentRawSnapshot, activeClass.id).slice()
    : [];
  const draggedSeries = orderedSeries.find(function (entry) {
    return String(entry && entry.id || "").trim() === normalizedDraggedSeriesId;
  }) || null;
  const remainingSeries = orderedSeries.filter(function (entry) {
    return String(entry && entry.id || "").trim() !== normalizedDraggedSeriesId;
  });
  let insertIndex = remainingSeries.length;

  if (!currentRawSnapshot || !activeClass || !collections || !draggedSeries) {
    return false;
  }

  if (normalizedTargetSeriesId) {
    const targetIndex = remainingSeries.findIndex(function (entry) {
      return String(entry && entry.id || "").trim() === normalizedTargetSeriesId;
    });

    if (targetIndex >= 0) {
      insertIndex = normalizedPlacement === "before" ? targetIndex : targetIndex + 1;
    }
  }

  remainingSeries.splice(insertIndex, 0, draggedSeries);
  reconnectCurriculumSeriesChain(remainingSeries);

  remainingSeries.forEach(function (seriesItem) {
    const collectionIndex = collections.series.findIndex(function (entry) {
      return String(entry && entry.id || "").trim() === String(seriesItem && seriesItem.id || "").trim();
    });

    if (collectionIndex >= 0) {
      collections.series[collectionIndex] = seriesItem;
    }
  });

  currentRawSnapshot.curriculumSeries = collections.series;
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return true;
}

function applyCurriculumSequenceDropIndicatorToDom() {
  const targets = document.querySelectorAll(".planning-curriculum__sequence-block[data-sequence-drop-target], .planning-curriculum__add--sequence[data-sequence-drop-target-add='true']");

  eachNode(targets, function (target) {
    target.classList.remove("is-drop-target", "is-drop-target--before", "is-drop-target--after");
    target.style.removeProperty("--planning-curriculum-drop-color");
  });

  if (!activeCurriculumSequenceDropIndicator) {
    return;
  }

  const targetSequenceId = String(activeCurriculumSequenceDropIndicator.targetSequenceId || "").trim();
  const targetSeriesId = String(activeCurriculumSequenceDropIndicator.seriesId || "").trim();
  const placement = String(activeCurriculumSequenceDropIndicator.placement || "").trim() === "before" ? "before" : "after";
  const color = normalizePlanningColorValue(activeCurriculumSequenceDropIndicator.color) || "#3975ab";
  const selector = targetSequenceId
    ? '.planning-curriculum__sequence-block[data-sequence-drop-target="' + targetSequenceId.replace(/"/g, '\\"') + '"]'
    : '.planning-curriculum__add--sequence[data-sequence-drop-target-add="true"][data-series-id="' + targetSeriesId.replace(/"/g, '\\"') + '"]';
  const target = document.querySelector(selector);

  if (!target) {
    return;
  }

  target.classList.add("is-drop-target", placement === "before" ? "is-drop-target--before" : "is-drop-target--after");
  target.style.setProperty("--planning-curriculum-drop-color", color);
}

function clearCurriculumSequenceDropIndicator() {
  activeCurriculumSequenceDropIndicator = null;
  applyCurriculumSequenceDropIndicatorToDom();
}

function setCurriculumSequenceDropIndicator(seriesId, targetSequenceId, placement, color) {
  activeCurriculumSequenceDropIndicator = {
    seriesId: String(seriesId || "").trim(),
    targetSequenceId: String(targetSequenceId || "").trim(),
    placement: placement === "before" ? "before" : "after",
    color: normalizePlanningColorValue(color) || "#3975ab"
  };
  applyCurriculumSequenceDropIndicatorToDom();
}

function reorderCurriculumSequences(sourceSeriesId, draggedSequenceId, targetSeriesId, targetSequenceId, placement) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedSourceSeriesId = String(sourceSeriesId || "").trim();
  const normalizedTargetSeriesId = String(targetSeriesId || sourceSeriesId || "").trim();
  const normalizedDraggedSequenceId = String(draggedSequenceId || "").trim();
  const normalizedTargetSequenceId = String(targetSequenceId || "").trim();
  const normalizedPlacement = placement === "before" ? "before" : "after";
  const sourceSequences = currentRawSnapshot
    ? getOrderedCurriculumSequencesForSeries(currentRawSnapshot, normalizedSourceSeriesId).slice()
    : [];
  const targetSequences = currentRawSnapshot
    ? getOrderedCurriculumSequencesForSeries(currentRawSnapshot, normalizedTargetSeriesId).slice()
    : [];
  const draggedSequence = sourceSequences.find(function (entry) {
    return String(entry && entry.id || "").trim() === normalizedDraggedSequenceId;
  }) || null;
  const remainingSourceSequences = sourceSequences.filter(function (entry) {
    return String(entry && entry.id || "").trim() !== normalizedDraggedSequenceId;
  });
  const targetSequenceList = normalizedSourceSeriesId === normalizedTargetSeriesId
    ? remainingSourceSequences.slice()
    : targetSequences.slice();
  let insertIndex = targetSequenceList.length;

  if (!currentRawSnapshot || !collections || !normalizedSourceSeriesId || !normalizedTargetSeriesId || !draggedSequence) {
    return false;
  }

  draggedSequence.seriesId = normalizedTargetSeriesId;

  if (normalizedTargetSequenceId) {
    const targetIndex = targetSequenceList.findIndex(function (entry) {
      return String(entry && entry.id || "").trim() === normalizedTargetSequenceId;
    });

    if (targetIndex >= 0) {
      insertIndex = normalizedPlacement === "before" ? targetIndex : targetIndex + 1;
    }
  }

  targetSequenceList.splice(insertIndex, 0, draggedSequence);
  reconnectCurriculumSequenceChain(remainingSourceSequences);
  reconnectCurriculumSequenceChain(targetSequenceList);

  collections.sequences.forEach(function (sequenceItem) {
    const collectionIndex = collections.sequences.findIndex(function (entry) {
      return String(entry && entry.id || "").trim() === String(sequenceItem && sequenceItem.id || "").trim();
    });
    const replacement = targetSequenceList.concat(remainingSourceSequences).find(function (entry) {
      return String(entry && entry.id || "").trim() === String(sequenceItem && sequenceItem.id || "").trim();
    }) || sequenceItem;

    if (collectionIndex >= 0) {
      collections.sequences[collectionIndex] = replacement;
    }
  });

  currentRawSnapshot.curriculumSequences = collections.sequences;
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return true;
}

function getCurriculumSequenceDropTargetFromPoint(clientX, clientY) {
  const target = document.elementFromPoint(Number(clientX) || 0, Number(clientY) || 0);
  const dropTarget = target && typeof target.closest === "function"
    ? target.closest(".planning-curriculum__sequence-block[data-sequence-drop-target], .planning-curriculum__add--sequence[data-sequence-drop-target-add='true']")
    : null;
  const sequenceId = dropTarget ? String(dropTarget.getAttribute("data-sequence-drop-target") || "").trim() : "";
  const seriesId = dropTarget ? String(dropTarget.getAttribute("data-series-id") || "").trim() : "";
  const rect = dropTarget && typeof dropTarget.getBoundingClientRect === "function" ? dropTarget.getBoundingClientRect() : null;
  const placement = sequenceId && rect && (Number(clientX) || 0) <= (rect.left + (rect.width / 2)) ? "before" : "after";

  if (!dropTarget) {
    return null;
  }

  return {
    seriesId: seriesId,
    targetSequenceId: sequenceId,
    placement: placement
  };
}

function clearCurriculumSequencePointerDrag() {
  if (!activeCurriculumSequenceDrag) {
    return;
  }

  window.removeEventListener("pointermove", window.UnterrichtsassistentApp.handleCurriculumSequencePointerMove);
  window.removeEventListener("pointerup", window.UnterrichtsassistentApp.handleCurriculumSequencePointerEnd);
  window.removeEventListener("pointercancel", window.UnterrichtsassistentApp.handleCurriculumSequencePointerEnd);
  removeCurriculumSeriesDragPreview();
  clearCurriculumSequenceDropIndicator();
  stopPlanningCurriculumAutoScroll();
  activeCurriculumSequenceDrag = null;
}

function applyCurriculumLessonDropIndicatorToDom() {
  const targets = document.querySelectorAll(".planning-curriculum__lesson-block[data-lesson-drop-target], .planning-curriculum__add--lesson[data-lesson-drop-target-add='true']");

  eachNode(targets, function (target) {
    target.classList.remove("is-drop-target", "is-drop-target--before", "is-drop-target--after");
    target.style.removeProperty("--planning-curriculum-drop-color");
  });

  if (!activeCurriculumLessonDropIndicator) {
    return;
  }

  const targetLessonId = String(activeCurriculumLessonDropIndicator.targetLessonId || "").trim();
  const sequenceId = String(activeCurriculumLessonDropIndicator.sequenceId || "").trim();
  const placement = String(activeCurriculumLessonDropIndicator.placement || "").trim() === "before" ? "before" : "after";
  const color = normalizePlanningColorValue(activeCurriculumLessonDropIndicator.color) || "#3975ab";
  const selector = targetLessonId
    ? '.planning-curriculum__lesson-block[data-lesson-drop-target="' + targetLessonId.replace(/"/g, '\\"') + '"]'
    : '.planning-curriculum__add--lesson[data-lesson-drop-target-add="true"][data-sequence-id="' + sequenceId.replace(/"/g, '\\"') + '"]';
  const target = document.querySelector(selector);

  if (!target) {
    return;
  }

  target.classList.add("is-drop-target", placement === "before" ? "is-drop-target--before" : "is-drop-target--after");
  target.style.setProperty("--planning-curriculum-drop-color", color);
}

function clearCurriculumLessonDropIndicator() {
  activeCurriculumLessonDropIndicator = null;
  applyCurriculumLessonDropIndicatorToDom();
}

function setCurriculumLessonDropIndicator(sequenceId, targetLessonId, placement, color) {
  activeCurriculumLessonDropIndicator = {
    sequenceId: String(sequenceId || "").trim(),
    targetLessonId: String(targetLessonId || "").trim(),
    placement: placement === "before" ? "before" : "after",
    color: normalizePlanningColorValue(color) || "#3975ab"
  };
  applyCurriculumLessonDropIndicatorToDom();
}

function reorderCurriculumLessons(sourceSequenceId, draggedLessonId, targetSequenceId, targetLessonId, placement) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedSourceSequenceId = String(sourceSequenceId || "").trim();
  const normalizedTargetSequenceId = String(targetSequenceId || sourceSequenceId || "").trim();
  const normalizedDraggedLessonId = String(draggedLessonId || "").trim();
  const normalizedTargetLessonId = String(targetLessonId || "").trim();
  const normalizedPlacement = placement === "before" ? "before" : "after";
  const sourceLessons = currentRawSnapshot
    ? getOrderedCurriculumLessonsForSequence(currentRawSnapshot, normalizedSourceSequenceId).slice()
    : [];
  const targetLessons = currentRawSnapshot
    ? getOrderedCurriculumLessonsForSequence(currentRawSnapshot, normalizedTargetSequenceId).slice()
    : [];
  const draggedLesson = sourceLessons.find(function (entry) {
    return String(entry && entry.id || "").trim() === normalizedDraggedLessonId;
  }) || null;
  const remainingSourceLessons = sourceLessons.filter(function (entry) {
    return String(entry && entry.id || "").trim() !== normalizedDraggedLessonId;
  });
  const targetLessonList = normalizedSourceSequenceId === normalizedTargetSequenceId
    ? remainingSourceLessons.slice()
    : targetLessons.slice();
  let insertIndex = targetLessonList.length;

  if (!currentRawSnapshot || !collections || !normalizedSourceSequenceId || !normalizedTargetSequenceId || !draggedLesson) {
    return false;
  }

  draggedLesson.sequenceId = normalizedTargetSequenceId;

  if (normalizedTargetLessonId) {
    const targetIndex = targetLessonList.findIndex(function (entry) {
      return String(entry && entry.id || "").trim() === normalizedTargetLessonId;
    });

    if (targetIndex >= 0) {
      insertIndex = normalizedPlacement === "before" ? targetIndex : targetIndex + 1;
    }
  }

  targetLessonList.splice(insertIndex, 0, draggedLesson);
  reconnectCurriculumLessonChain(remainingSourceLessons);
  reconnectCurriculumLessonChain(targetLessonList);

  collections.lessons.forEach(function (lessonItem) {
    const collectionIndex = collections.lessons.findIndex(function (entry) {
      return String(entry && entry.id || "").trim() === String(lessonItem && lessonItem.id || "").trim();
    });
    const replacement = targetLessonList.concat(remainingSourceLessons).find(function (entry) {
      return String(entry && entry.id || "").trim() === String(lessonItem && lessonItem.id || "").trim();
    }) || lessonItem;

    if (collectionIndex >= 0) {
      collections.lessons[collectionIndex] = replacement;
    }
  });

  currentRawSnapshot.curriculumLessonPlans = collections.lessons;
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return true;
}

function getCurriculumLessonDropTargetFromPoint(clientX, clientY) {
  const target = document.elementFromPoint(Number(clientX) || 0, Number(clientY) || 0);
  const dropTarget = target && typeof target.closest === "function"
    ? target.closest(".planning-curriculum__lesson-block[data-lesson-drop-target], .planning-curriculum__add--lesson[data-lesson-drop-target-add='true']")
    : null;
  const lessonId = dropTarget ? String(dropTarget.getAttribute("data-lesson-drop-target") || "").trim() : "";
  const sequenceId = dropTarget ? String(dropTarget.getAttribute("data-sequence-id") || "").trim() : "";
  const rect = dropTarget && typeof dropTarget.getBoundingClientRect === "function" ? dropTarget.getBoundingClientRect() : null;
  const placement = lessonId && rect && (Number(clientX) || 0) <= (rect.left + (rect.width / 2)) ? "before" : "after";

  if (!dropTarget) {
    return null;
  }

  return {
    sequenceId: sequenceId,
    targetLessonId: lessonId,
    placement: placement
  };
}

function clearCurriculumLessonPointerDrag() {
  if (!activeCurriculumLessonDrag) {
    return;
  }

  window.removeEventListener("pointermove", window.UnterrichtsassistentApp.handleCurriculumLessonPointerMove);
  window.removeEventListener("pointerup", window.UnterrichtsassistentApp.handleCurriculumLessonPointerEnd);
  window.removeEventListener("pointercancel", window.UnterrichtsassistentApp.handleCurriculumLessonPointerEnd);
  removeCurriculumSeriesDragPreview();
  clearCurriculumLessonDropIndicator();
  stopPlanningCurriculumAutoScroll();
  activeCurriculumLessonDrag = null;
}

function getOrderedCurriculumSequencesForSeries(snapshot, seriesId) {
  const collections = getCurriculumCollections(snapshot);
  const items = collections.sequences.filter(function (entry) {
    return String(entry && entry.seriesId || "").trim() === String(seriesId || "").trim();
  });
  const incomingCounts = {};
  const itemById = {};
  const ordered = [];
  let current = null;

  items.forEach(function (entry) {
    const entryId = String(entry && entry.id || "").trim();

    if (!entryId) {
      return;
    }

    itemById[entryId] = entry;
    incomingCounts[entryId] = incomingCounts[entryId] || 0;
  });

  items.forEach(function (entry) {
    const nextId = String(entry && entry.nextSequenceId || "").trim();

    if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
      incomingCounts[nextId] += 1;
    }
  });

  current = items.find(function (entry) {
    return !incomingCounts[String(entry && entry.id || "").trim()];
  }) || items[0] || null;

  while (current) {
    const currentId = String(current && current.id || "").trim();
    const nextId = String(current && current.nextSequenceId || "").trim();

    if (!currentId || ordered.some(function (entry) {
      return String(entry && entry.id || "").trim() === currentId;
    })) {
      break;
    }

    ordered.push(current);
    current = nextId && itemById[nextId] ? itemById[nextId] : null;
  }

  items.forEach(function (entry) {
    if (!ordered.some(function (orderedEntry) {
      return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
    })) {
      ordered.push(entry);
    }
  });

  return ordered;
}

function getOrderedCurriculumLessonsForSequence(snapshot, sequenceId) {
  const collections = getCurriculumCollections(snapshot);
  const items = collections.lessons.filter(function (entry) {
    return String(entry && entry.sequenceId || "").trim() === String(sequenceId || "").trim();
  });
  const incomingCounts = {};
  const itemById = {};
  const ordered = [];
  let current = null;

  items.forEach(function (entry) {
    const entryId = String(entry && entry.id || "").trim();

    if (!entryId) {
      return;
    }

    itemById[entryId] = entry;
    incomingCounts[entryId] = incomingCounts[entryId] || 0;
  });

  items.forEach(function (entry) {
    const nextId = String(entry && entry.nextLessonId || "").trim();

    if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
      incomingCounts[nextId] += 1;
    }
  });

  current = items.find(function (entry) {
    return !incomingCounts[String(entry && entry.id || "").trim()];
  }) || items[0] || null;

  while (current) {
    const currentId = String(current && current.id || "").trim();
    const nextId = String(current && current.nextLessonId || "").trim();

    if (!currentId || ordered.some(function (entry) {
      return String(entry && entry.id || "").trim() === currentId;
    })) {
      break;
    }

    ordered.push(current);
    current = nextId && itemById[nextId] ? itemById[nextId] : null;
  }

  items.forEach(function (entry) {
    if (!ordered.some(function (orderedEntry) {
      return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
    })) {
      ordered.push(entry);
    }
  });

  return ordered;
}

function getOrderedCurriculumLessonPhasesForLesson(snapshot, lessonPlanId) {
  const collections = getCurriculumCollections(snapshot);
  const items = collections.lessonPhases.filter(function (entry) {
    return String(entry && entry.lessonPlanId || "").trim() === String(lessonPlanId || "").trim();
  });
  const incomingCounts = {};
  const itemById = {};
  const ordered = [];
  let current = null;

  items.forEach(function (entry) {
    const entryId = String(entry && entry.id || "").trim();

    if (!entryId) {
      return;
    }

    itemById[entryId] = entry;
    incomingCounts[entryId] = incomingCounts[entryId] || 0;
  });

  items.forEach(function (entry) {
    const nextId = String(entry && entry.nextPhaseId || "").trim();

    if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
      incomingCounts[nextId] += 1;
    }
  });

  current = items.find(function (entry) {
    return !incomingCounts[String(entry && entry.id || "").trim()];
  }) || items[0] || null;

  while (current) {
    const currentId = String(current && current.id || "").trim();
    const nextId = String(current && current.nextPhaseId || "").trim();

    if (!currentId || ordered.some(function (entry) {
      return String(entry && entry.id || "").trim() === currentId;
    })) {
      break;
    }

    ordered.push(current);
    current = nextId && itemById[nextId] ? itemById[nextId] : null;
  }

  items.forEach(function (entry) {
    if (!ordered.some(function (orderedEntry) {
      return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
    })) {
      ordered.push(entry);
    }
  });

  return ordered;
}

function getOrderedCurriculumLessonStepsForPhase(snapshot, phaseId) {
  const collections = getCurriculumCollections(snapshot);
  const items = collections.lessonSteps.filter(function (entry) {
    return String(entry && entry.phaseId || "").trim() === String(phaseId || "").trim();
  });
  const incomingCounts = {};
  const itemById = {};
  const ordered = [];
  let current = null;

  items.forEach(function (entry) {
    const entryId = String(entry && entry.id || "").trim();

    if (!entryId) {
      return;
    }

    itemById[entryId] = entry;
    incomingCounts[entryId] = incomingCounts[entryId] || 0;
  });

  items.forEach(function (entry) {
    const nextId = String(entry && entry.nextStepId || "").trim();

    if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
      incomingCounts[nextId] += 1;
    }
  });

  current = items.find(function (entry) {
    return !incomingCounts[String(entry && entry.id || "").trim()];
  }) || items[0] || null;

  while (current) {
    const currentId = String(current && current.id || "").trim();
    const nextId = String(current && current.nextStepId || "").trim();

    if (!currentId || ordered.some(function (entry) {
      return String(entry && entry.id || "").trim() === currentId;
    })) {
      break;
    }

    ordered.push(current);
    current = nextId && itemById[nextId] ? itemById[nextId] : null;
  }

  items.forEach(function (entry) {
    if (!ordered.some(function (orderedEntry) {
      return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
    })) {
      ordered.push(entry);
    }
  });

  return ordered;
}

function reconnectCurriculumLessonPhaseChain(items) {
  items.forEach(function (entry, index) {
    entry.nextPhaseId = items[index + 1] ? String(items[index + 1].id || "").trim() : "";
  });
}

function reconnectCurriculumLessonStepChain(items) {
  items.forEach(function (entry, index) {
    entry.nextStepId = items[index + 1] ? String(items[index + 1].id || "").trim() : "";
  });
}

function getCurriculumLessonHourDemand(lessonItem) {
  return String(lessonItem && lessonItem.hourType || "").trim() === "double" ? 2 : 1;
}

function getCalculatedCurriculumSequenceHourDemand(snapshot, sequenceId) {
  return getOrderedCurriculumLessonsForSequence(snapshot, sequenceId).reduce(function (sum, lessonItem) {
    return sum + getCurriculumLessonHourDemand(lessonItem);
  }, 0);
}

function getEffectiveCurriculumSequenceHourDemand(snapshot, sequenceItem) {
  const calculatedHourDemand = getCalculatedCurriculumSequenceHourDemand(snapshot, String(sequenceItem && sequenceItem.id || "").trim());

  if (calculatedHourDemand > 0) {
    return calculatedHourDemand;
  }

  return Math.max(0, Number(sequenceItem && sequenceItem.hourDemand) || 0);
}

function getCalculatedCurriculumSeriesHourDemand(snapshot, seriesId) {
  return getOrderedCurriculumSequencesForSeries(snapshot, seriesId).reduce(function (sum, sequenceItem) {
    return sum + getEffectiveCurriculumSequenceHourDemand(snapshot, sequenceItem);
  }, 0);
}

function reconnectCurriculumSequenceChain(items) {
  items.forEach(function (entry, index) {
    entry.nextSequenceId = items[index + 1] ? String(items[index + 1].id || "").trim() : "";
  });
}

function getOrderedCurriculumLessonsForSequence(snapshot, sequenceId) {
  const collections = getCurriculumCollections(snapshot);
  const items = collections.lessons.filter(function (entry) {
    return String(entry && entry.sequenceId || "").trim() === String(sequenceId || "").trim();
  });
  const incomingCounts = {};
  const itemById = {};
  const ordered = [];
  let current = null;

  items.forEach(function (entry) {
    const entryId = String(entry && entry.id || "").trim();

    if (!entryId) {
      return;
    }

    itemById[entryId] = entry;
    incomingCounts[entryId] = incomingCounts[entryId] || 0;
  });

  items.forEach(function (entry) {
    const nextId = String(entry && entry.nextLessonId || "").trim();

    if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
      incomingCounts[nextId] += 1;
    }
  });

  current = items.find(function (entry) {
    return !incomingCounts[String(entry && entry.id || "").trim()];
  }) || items[0] || null;

  while (current) {
    const currentId = String(current && current.id || "").trim();
    const nextId = String(current && current.nextLessonId || "").trim();

    if (!currentId || ordered.some(function (entry) {
      return String(entry && entry.id || "").trim() === currentId;
    })) {
      break;
    }

    ordered.push(current);
    current = nextId && itemById[nextId] ? itemById[nextId] : null;
  }

  items.forEach(function (entry) {
    if (!ordered.some(function (orderedEntry) {
      return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
    })) {
      ordered.push(entry);
    }
  });

  return ordered;
}

function reconnectCurriculumLessonChain(items) {
  items.forEach(function (entry, index) {
    entry.nextLessonId = items[index + 1] ? String(items[index + 1].id || "").trim() : "";
  });
}

function createRandomCurriculumSeriesColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 42 + Math.floor(Math.random() * 14);
  const lightness = 82 + Math.floor(Math.random() * 8);

  function toHexChannel(channelValue) {
    return Math.max(0, Math.min(255, Math.round(channelValue))).toString(16).padStart(2, "0");
  }

  function hslToHex(h, s, l) {
    const normalizedS = s / 100;
    const normalizedL = l / 100;
    const chroma = (1 - Math.abs((2 * normalizedL) - 1)) * normalizedS;
    const scaledHue = h / 60;
    const secondComponent = chroma * (1 - Math.abs((scaledHue % 2) - 1));
    const match = normalizedL - (chroma / 2);
    let red = 0;
    let green = 0;
    let blue = 0;

    if (scaledHue >= 0 && scaledHue < 1) {
      red = chroma;
      green = secondComponent;
    } else if (scaledHue < 2) {
      red = secondComponent;
      green = chroma;
    } else if (scaledHue < 3) {
      green = chroma;
      blue = secondComponent;
    } else if (scaledHue < 4) {
      green = secondComponent;
      blue = chroma;
    } else if (scaledHue < 5) {
      red = secondComponent;
      blue = chroma;
    } else {
      red = chroma;
      blue = secondComponent;
    }

    return "#" + [
      toHexChannel((red + match) * 255),
      toHexChannel((green + match) * 255),
      toHexChannel((blue + match) * 255)
    ].join("");
  }

  return hslToHex(hue, saturation, lightness);
}

function getCurriculumSeriesColor(seriesItem, fallbackKey) {
  const normalizedColor = normalizePlanningColorValue(seriesItem && seriesItem.color);

  if (normalizedColor) {
    return normalizedColor;
  }

  if (!seriesItem && !fallbackKey) {
    return createRandomCurriculumSeriesColor();
  }

  if (typeof createPastelColorFn === "function") {
    return createPastelColorFn(String(fallbackKey || (seriesItem && seriesItem.topic) || "reihe"));
  }

  return "#d9d4cb";
}

function getDefaultPlanningCategoryNames(snapshot) {
  const classes = snapshot && Array.isArray(snapshot.classes) ? snapshot.classes : [];

  return ["Unterrichtsfrei", "Sonstiges"].concat(classes.map(function (schoolClass) {
    return [String(schoolClass && schoolClass.name || "").trim(), String(schoolClass && schoolClass.subject || "").trim()]
      .filter(Boolean)
      .join(" ")
      .trim();
    }).filter(Boolean));
}

function normalizePlanningColorValue(value) {
  const trimmed = String(value || "").trim();

  return /^#[0-9a-f]{6}$/i.test(trimmed) ? trimmed : "";
}

function getStoredPlanningCategoryEntry(snapshot, name) {
  const collections = getPlanningCollections(snapshot);
  const normalizedName = String(name || "").trim().toLowerCase();

  if (!normalizedName) {
    return null;
  }

  return collections.categories.find(function (entry) {
    return String(entry && entry.name || "").trim().toLowerCase() === normalizedName;
  }) || null;
}

function getDefaultPlanningCategoryDefinition(snapshot, name) {
  const classes = snapshot && Array.isArray(snapshot.classes) ? snapshot.classes : [];
  const normalizedName = String(name || "").trim().toLowerCase();
  let schoolClass = null;

  if (normalizedName === "unterrichtsfrei") {
    return {
      name: "Unterrichtsfrei",
      color: "#a9cf8f",
      isClassCategory: false,
      isSystemCategory: true
    };
  }

  if (normalizedName === "sonstiges") {
    return {
      name: "Sonstiges",
      color: "#b8bec7",
      isClassCategory: false,
      isSystemCategory: true
    };
  }
  schoolClass = classes.find(function (entry) {
    return [String(entry && entry.name || "").trim(), String(entry && entry.subject || "").trim()]
      .filter(Boolean)
      .join(" ")
      .trim()
      .toLowerCase() === normalizedName;
  }) || null;

  if (!schoolClass) {
    return null;
  }

  return {
    name: [String(schoolClass.name || "").trim(), String(schoolClass.subject || "").trim()].filter(Boolean).join(" ").trim(),
    color: getClassDisplayColor(schoolClass),
    isClassCategory: true
  };
}

function getPlanningCategoryColor(snapshot, name) {
  const defaultCategory = getDefaultPlanningCategoryDefinition(snapshot, name);
  const storedCategory = getStoredPlanningCategoryEntry(snapshot, name);
  const storedColor = normalizePlanningColorValue(storedCategory && storedCategory.color);

  if (defaultCategory) {
    return defaultCategory.color;
  }

  if (storedColor) {
    return storedColor;
  }

  if (typeof createPastelColorFn === "function") {
    return createPastelColorFn(String(name || "").trim() || "planung");
  }

  return "#d9d4cb";
}

function getPlanningCategoryDefinitions(snapshot) {
  const sourceSnapshot = snapshot || {};
  const definitionsByKey = {};
  const collections = getPlanningCollections(sourceSnapshot);

  getDefaultPlanningCategoryNames(sourceSnapshot).forEach(function (name) {
    const trimmedName = String(name || "").trim();
    const normalizedName = trimmedName.toLowerCase();
    const defaultDefinition = getDefaultPlanningCategoryDefinition(sourceSnapshot, trimmedName);

    if (!trimmedName || definitionsByKey[normalizedName]) {
      return;
    }

    definitionsByKey[normalizedName] = {
      name: defaultDefinition && defaultDefinition.name ? defaultDefinition.name : trimmedName,
      color: getPlanningCategoryColor(sourceSnapshot, trimmedName),
      isClassCategory: Boolean(defaultDefinition && defaultDefinition.isClassCategory),
      isSystemCategory: Boolean(defaultDefinition && defaultDefinition.isSystemCategory)
    };
  });

  collections.categories.forEach(function (entry) {
    const trimmedName = String(entry && entry.name || "").trim();
    const normalizedName = trimmedName.toLowerCase();

    if (!trimmedName || definitionsByKey[normalizedName]) {
      return;
    }

    definitionsByKey[normalizedName] = {
      name: trimmedName,
      color: getPlanningCategoryColor(sourceSnapshot, trimmedName),
      isClassCategory: false
    };
  });

  collections.events.forEach(function (entry) {
    const trimmedName = String(entry && entry.category || "").trim();
    const normalizedName = trimmedName.toLowerCase();

    if (!trimmedName || definitionsByKey[normalizedName]) {
      return;
    }

    definitionsByKey[normalizedName] = {
      name: trimmedName,
      color: getPlanningCategoryColor(sourceSnapshot, trimmedName),
      isClassCategory: false
    };
  });

  return Object.keys(definitionsByKey).map(function (key) {
    return definitionsByKey[key];
  }).sort(function (left, right) {
    if (left.isClassCategory !== right.isClassCategory) {
      return left.isClassCategory ? -1 : 1;
    }

    return String(left.name || "").localeCompare(String(right.name || ""), "de", { sensitivity: "base" });
  });
}

function getDefaultPlanningSidebarFilters(snapshot) {
  return getPlanningCategoryDefinitions(snapshot)
    .filter(function (entry) {
      return String(entry && entry.name || "").trim().toLowerCase() !== "unterrichtsfrei";
    })
    .map(function (entry) {
      return String(entry && entry.name || "").trim();
    })
    .filter(Boolean);
}

function getDefaultTodoCategoryFilters(snapshot) {
  return getPlanningCategoryDefinitions(snapshot)
    .map(function (entry) {
      return String(entry && entry.name || "").trim();
    })
    .filter(Boolean);
}

function getClassSubjectById(rawSnapshot, classId) {
  const classes = rawSnapshot && Array.isArray(rawSnapshot.classes)
    ? rawSnapshot.classes
    : [];
  const schoolClass = classes.find(function (entry) {
    return String(entry && entry.id || "") === String(classId || "");
  }) || null;

  return schoolClass ? String(schoolClass.subject || "").trim() : "";
}

function getKnowledgeGapSuggestionSubject(inputId) {
  const sourceSnapshot = getMutableRawSnapshot();
  let classId = "";
  let record = null;

  if (!sourceSnapshot) {
    return "";
  }

  if (inputId === "unterrichtAssessmentKnowledgeGap" && activeUnterrichtAssessmentDraft) {
    classId = String(activeUnterrichtAssessmentDraft.classId || "").trim();
  } else if (inputId === "classAnalysisAssessmentKnowledgeGap" && activeClassAnalysisRecordEditDraft) {
    record = getClassAnalysisRecordByDraft(sourceSnapshot, activeClassAnalysisRecordEditDraft);
    classId = String(record && record.classId || "").trim();
  }

  if (!classId && schoolService && typeof schoolService.getActiveClass === "function") {
    const activeClass = schoolService.getActiveClass();
    return activeClass ? String(activeClass.subject || "").trim() : "";
  }

  return getClassSubjectById(sourceSnapshot, classId);
}

function getKnowledgeGapSuggestions(prefix, inputId) {
  const sourceSnapshot = getMutableRawSnapshot();
  const lowerPrefix = String(prefix || "").trim().toLowerCase();
  const currentSubject = String(getKnowledgeGapSuggestionSubject(inputId) || "").trim().toLowerCase();
  const countsByKey = {};
  const subjectByClassId = {};

  if (!sourceSnapshot || !Array.isArray(sourceSnapshot.assessments)) {
    return [];
  }

  sourceSnapshot.assessments.forEach(function (record) {
    const rawValue = String(record && record.knowledgeGap || "").trim();
    const normalizedKey = rawValue.toLowerCase();
    const recordClassId = String(record && record.classId || "").trim();
    let recordSubject = "";

    if (!rawValue) {
      return;
    }

    if (currentSubject) {
      if (!Object.prototype.hasOwnProperty.call(subjectByClassId, recordClassId)) {
        subjectByClassId[recordClassId] = getClassSubjectById(sourceSnapshot, recordClassId).toLowerCase();
      }

      recordSubject = subjectByClassId[recordClassId];

      if (recordSubject !== currentSubject) {
        return;
      }
    }

    if (lowerPrefix && normalizedKey.indexOf(lowerPrefix) === -1) {
      return;
    }

    if (!countsByKey[normalizedKey]) {
      countsByKey[normalizedKey] = {
        value: rawValue,
        count: 0
      };
    }

    countsByKey[normalizedKey].count += 1;
  });

  return Object.keys(countsByKey).map(function (key) {
    return countsByKey[key];
  }).sort(function (leftItem, rightItem) {
    if (rightItem.count !== leftItem.count) {
      return rightItem.count - leftItem.count;
    }

    return String(leftItem.value || "").localeCompare(String(rightItem.value || ""), "de", { sensitivity: "base" });
  });
}

function getPlanningCategorySuggestions(prefix) {
  const sourceSnapshot = getMutableRawSnapshot();
  const lowerPrefix = String(prefix || "").trim().toLowerCase();
  const countsByKey = {};
  const collections = sourceSnapshot ? getPlanningCollections(sourceSnapshot) : null;
  const activeClassCategoryName = sourceSnapshot && sourceSnapshot.activeClassId
    ? getClassSubjectById(sourceSnapshot, sourceSnapshot.activeClassId)
    : getClassSubjectById(sourceSnapshot, "");
  function getPlanningCategorySuggestionRank(value) {
    const trimmedValue = String(value || "").trim();
    const normalizedValue = trimmedValue.toLowerCase();
    const defaultDefinition = getDefaultPlanningCategoryDefinition(sourceSnapshot, trimmedValue);

    if (activeClassCategoryName && normalizedValue === String(activeClassCategoryName).trim().toLowerCase()) {
      return -1;
    }

    if (normalizedValue === "unterrichtsfrei") {
      return 3;
    }

    if (normalizedValue === "sonstiges") {
      return 2;
    }

    if (defaultDefinition && defaultDefinition.isClassCategory) {
      return 0;
    }

    return 1;
  }

  if (!sourceSnapshot) {
    return [];
  }

  collections.categories.forEach(function (entry) {
    const rawValue = String(entry && entry.name || "").trim();
    const normalizedKey = rawValue.toLowerCase();

    if (!rawValue) {
      return;
    }

    if (lowerPrefix && normalizedKey.indexOf(lowerPrefix) === -1) {
      return;
    }

    if (!countsByKey[normalizedKey]) {
      countsByKey[normalizedKey] = {
        value: rawValue,
        count: 0
      };
    }
  });

  getDefaultPlanningCategoryNames(sourceSnapshot).forEach(function (rawValue) {
    const normalizedKey = String(rawValue || "").trim().toLowerCase();

    if (!normalizedKey) {
      return;
    }

    if (lowerPrefix && normalizedKey.indexOf(lowerPrefix) === -1) {
      return;
    }

    if (!countsByKey[normalizedKey]) {
      countsByKey[normalizedKey] = {
        value: rawValue,
        count: 0
      };
    }
  });

  collections.events.forEach(function (entry) {
    const rawValue = String(entry && entry.category || "").trim();
    const normalizedKey = rawValue.toLowerCase();

    if (!rawValue) {
      return;
    }

    if (lowerPrefix && normalizedKey.indexOf(lowerPrefix) === -1) {
      return;
    }

    if (!countsByKey[normalizedKey]) {
      countsByKey[normalizedKey] = {
        value: rawValue,
        count: 0
      };
    }

    countsByKey[normalizedKey].count += 1;
  });

  return Object.keys(countsByKey).map(function (key) {
    return countsByKey[key];
  }).sort(function (leftItem, rightItem) {
    const leftRank = getPlanningCategorySuggestionRank(leftItem.value);
    const rightRank = getPlanningCategorySuggestionRank(rightItem.value);

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    if (rightItem.count !== leftItem.count) {
      return rightItem.count - leftItem.count;
    }

    return String(leftItem.value || "").localeCompare(String(rightItem.value || ""), "de", { sensitivity: "base" });
  });
}

function normalizePlanningEventCategoryValue(categoryValue) {
  const normalized = String(categoryValue || "").trim();
  return normalized || "Sonstiges";
}

function closePlanningRangeSelection() {
  if (activePlanningRangeDraft) {
    activePlanningRangeDraft = null;

    if (activeViewId === "planung") {
      setActiveView("planung");
    }
  }
}

function getOrderedPlanningRange(startDateValue, endDateValue) {
  const start = String(startDateValue || "").slice(0, 10);
  const end = String(endDateValue || start).slice(0, 10) || start;

  return start && end && start > end
    ? { startDate: end, endDate: start }
    : { startDate: start, endDate: end };
}

function closeKnowledgeGapSuggestions() {
  const list = getKnowledgeGapSuggestionList(activeKnowledgeGapSuggestionListId);

  clearKnowledgeGapSuggestionBlurTimer();
  activeKnowledgeGapSuggestionDrag = null;

  if (list) {
    list.hidden = true;
    list.classList.remove("is-dragging");
    list.innerHTML = "";
  }

  activeKnowledgeGapSuggestionListId = "";
  activeKnowledgeGapSuggestionInputId = "";
}

function closePlanningCategorySuggestions() {
  const list = getPlanningCategorySuggestionList(activePlanningCategorySuggestionListId);

  clearPlanningCategorySuggestionBlurTimer();
  activePlanningCategorySuggestionDrag = null;

  if (list) {
    list.hidden = true;
    list.classList.remove("is-dragging");
    list.innerHTML = "";
  }

  activePlanningCategorySuggestionListId = "";
  activePlanningCategorySuggestionInputId = "";
}

function closeEvaluationTopicSuggestions() {
  const list = getEvaluationTopicSuggestionList(activeEvaluationTopicSuggestionListId);

  clearEvaluationTopicSuggestionBlurTimer();
  activeEvaluationTopicSuggestionDrag = null;

  if (list) {
    list.hidden = true;
    list.classList.remove("is-dragging");
    list.innerHTML = "";
  }

  activeEvaluationTopicSuggestionListId = "";
  activeEvaluationTopicSuggestionInputId = "";
}

function renderKnowledgeGapSuggestions(inputId, listId) {
  const input = inputId ? document.getElementById(inputId) : null;
  const list = getKnowledgeGapSuggestionList(listId);
  const suggestions = getKnowledgeGapSuggestions(input && input.value, inputId);

  if (!input || !list || !document.body.contains(input)) {
    closeKnowledgeGapSuggestions();
    return false;
  }

  activeKnowledgeGapSuggestionInputId = inputId;
  activeKnowledgeGapSuggestionListId = listId;

  if (!suggestions.length) {
    list.hidden = true;
    list.innerHTML = "";
    return false;
  }

  list.innerHTML = suggestions.map(function (entry) {
    return '<button class="knowledge-gap-suggestion" type="button" data-value="' + escapeKnowledgeGapSuggestionHtml(entry.value) + '" onclick="return window.UnterrichtsassistentApp.selectKnowledgeGapSuggestion(this.dataset.value, \'' + escapeKnowledgeGapSuggestionHtml(inputId) + '\', \'' + escapeKnowledgeGapSuggestionHtml(listId) + '\')">' + escapeKnowledgeGapSuggestionHtml(entry.value) + ' <span class="knowledge-gap-suggestion__count">(' + escapeKnowledgeGapSuggestionHtml(String(entry.count)) + ')</span></button>';
  }).join("");
  list.hidden = false;
  return false;
}

function renderPlanningCategorySuggestions(inputId, listId) {
  const input = inputId ? document.getElementById(inputId) : null;
  const list = getPlanningCategorySuggestionList(listId);
  const suggestions = getPlanningCategorySuggestions(input && input.value);

  if (!input || !list || !document.body.contains(input)) {
    closePlanningCategorySuggestions();
    return false;
  }

  activePlanningCategorySuggestionInputId = inputId;
  activePlanningCategorySuggestionListId = listId;

  if (!suggestions.length) {
    list.hidden = true;
    list.innerHTML = "";
    return false;
  }

  list.innerHTML = suggestions.map(function (entry) {
    return '<button class="knowledge-gap-suggestion" type="button" data-value="' + escapePlanningCategorySuggestionHtml(entry.value) + '" onclick="return window.UnterrichtsassistentApp.selectPlanningCategorySuggestion(this.dataset.value, \'' + escapePlanningCategorySuggestionHtml(inputId) + '\', \'' + escapePlanningCategorySuggestionHtml(listId) + '\')">' + escapePlanningCategorySuggestionHtml(entry.value) + ' <span class="knowledge-gap-suggestion__count">(' + escapePlanningCategorySuggestionHtml(String(entry.count)) + ')</span></button>';
  }).join("");
  list.hidden = false;
  return false;
}

function renderEvaluationTopicSuggestions(inputId, listId) {
  const input = inputId ? document.getElementById(inputId) : null;
  const list = getEvaluationTopicSuggestionList(listId);
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const activeSheet = currentRawSnapshot && activeClass
    ? getActiveEvaluationSheetForSnapshot(currentRawSnapshot, activeClass)
    : null;
  const suggestions = currentRawSnapshot && activeSheet
    ? getEvaluationSheetTopicSuggestions(currentRawSnapshot, activeSheet, input && input.value)
    : [];

  if (!input || !list || !document.body.contains(input)) {
    closeEvaluationTopicSuggestions();
    return false;
  }

  activeEvaluationTopicSuggestionInputId = inputId;
  activeEvaluationTopicSuggestionListId = listId;

  if (!suggestions.length) {
    list.hidden = true;
    list.innerHTML = "";
    return false;
  }

  list.innerHTML = suggestions.map(function (entry) {
    return '<button class="knowledge-gap-suggestion" type="button" data-value="' + escapeEvaluationTopicSuggestionHtml(entry.value) + '" onclick="return window.UnterrichtsassistentApp.selectEvaluationTopicSuggestion(this.dataset.value, \'' + escapeEvaluationTopicSuggestionHtml(inputId) + '\', \'' + escapeEvaluationTopicSuggestionHtml(listId) + '\')"><span class="knowledge-gap-suggestion__label">' + escapeEvaluationTopicSuggestionHtml(entry.label || entry.value) + '</span> <span class="knowledge-gap-suggestion__count">(' + escapeEvaluationTopicSuggestionHtml(String(entry.count)) + ')</span></button>';
  }).join("");
  list.hidden = false;
  return false;
}

function scheduleKnowledgeGapSuggestionsClose() {
  clearKnowledgeGapSuggestionBlurTimer();
  activeKnowledgeGapSuggestionBlurTimerId = window.setTimeout(function () {
    closeKnowledgeGapSuggestions();
  }, 120);
}

function schedulePlanningCategorySuggestionsClose() {
  clearPlanningCategorySuggestionBlurTimer();
  activePlanningCategorySuggestionBlurTimerId = window.setTimeout(function () {
    closePlanningCategorySuggestions();
  }, 120);
}

function scheduleEvaluationTopicSuggestionsClose() {
  clearEvaluationTopicSuggestionBlurTimer();
  activeEvaluationTopicSuggestionBlurTimerId = window.setTimeout(function () {
    closeEvaluationTopicSuggestions();
  }, 120);
}

function beginKnowledgeGapSuggestionsDrag(event, listId) {
  const list = getKnowledgeGapSuggestionList(listId);

  if (!event || !list || (event.target && event.target.closest(".knowledge-gap-suggestion"))) {
    return false;
  }

  clearKnowledgeGapSuggestionBlurTimer();
  activeKnowledgeGapSuggestionDrag = {
    listId: listId,
    pointerId: event.pointerId,
    startY: Number(event.clientY) || 0,
    startScrollTop: list.scrollTop,
    moved: false
  };
  list.classList.remove("is-dragging");
  trySetPointerCapture(list, event.pointerId);
  return false;
}

function beginPlanningCategorySuggestionsDrag(event, listId) {
  const list = getPlanningCategorySuggestionList(listId);

  if (!event || !list || (event.target && event.target.closest(".knowledge-gap-suggestion"))) {
    return false;
  }

  clearPlanningCategorySuggestionBlurTimer();
  activePlanningCategorySuggestionDrag = {
    listId: listId,
    pointerId: event.pointerId,
    startY: Number(event.clientY) || 0,
    startScrollTop: list.scrollTop,
    moved: false
  };
  list.classList.remove("is-dragging");
  trySetPointerCapture(list, event.pointerId);
  return false;
}

function beginEvaluationTopicSuggestionsDrag(event, listId) {
  const list = getEvaluationTopicSuggestionList(listId);

  if (!event || !list || (event.target && event.target.closest(".knowledge-gap-suggestion"))) {
    return false;
  }

  clearEvaluationTopicSuggestionBlurTimer();
  activeEvaluationTopicSuggestionDrag = {
    listId: listId,
    pointerId: event.pointerId,
    startY: Number(event.clientY) || 0,
    startScrollTop: list.scrollTop,
    moved: false
  };
  list.classList.remove("is-dragging");
  trySetPointerCapture(list, event.pointerId);
  return false;
}

function moveKnowledgeGapSuggestionsDrag(event, listId) {
  const list = getKnowledgeGapSuggestionList(listId);
  let currentY;
  let offsetY;

  if (!activeKnowledgeGapSuggestionDrag || activeKnowledgeGapSuggestionDrag.listId !== listId || event.pointerId !== activeKnowledgeGapSuggestionDrag.pointerId || !list) {
    return false;
  }

  currentY = Number(event && event.clientY) || 0;
  offsetY = currentY - activeKnowledgeGapSuggestionDrag.startY;

  if (Math.abs(offsetY) >= 4) {
    activeKnowledgeGapSuggestionDrag.moved = true;
    suppressKnowledgeGapSuggestionClickUntil = Date.now() + 180;
    list.classList.add("is-dragging");
  }

  list.scrollTop = activeKnowledgeGapSuggestionDrag.startScrollTop - offsetY;
  event.preventDefault();
  return false;
}

function movePlanningCategorySuggestionsDrag(event, listId) {
  const list = getPlanningCategorySuggestionList(listId);
  let currentY;
  let offsetY;

  if (!activePlanningCategorySuggestionDrag || activePlanningCategorySuggestionDrag.listId !== listId || event.pointerId !== activePlanningCategorySuggestionDrag.pointerId || !list) {
    return false;
  }

  currentY = Number(event && event.clientY) || 0;
  offsetY = currentY - activePlanningCategorySuggestionDrag.startY;

  if (Math.abs(offsetY) >= 4) {
    activePlanningCategorySuggestionDrag.moved = true;
    suppressKnowledgeGapSuggestionClickUntil = Date.now() + 180;
    list.classList.add("is-dragging");
  }

  list.scrollTop = activePlanningCategorySuggestionDrag.startScrollTop - offsetY;
  event.preventDefault();
  return false;
}

function moveEvaluationTopicSuggestionsDrag(event, listId) {
  const list = getEvaluationTopicSuggestionList(listId);
  let currentY;
  let offsetY;

  if (!activeEvaluationTopicSuggestionDrag || activeEvaluationTopicSuggestionDrag.listId !== listId || event.pointerId !== activeEvaluationTopicSuggestionDrag.pointerId || !list) {
    return false;
  }

  currentY = Number(event && event.clientY) || 0;
  offsetY = currentY - activeEvaluationTopicSuggestionDrag.startY;

  if (Math.abs(offsetY) >= 4) {
    activeEvaluationTopicSuggestionDrag.moved = true;
    suppressKnowledgeGapSuggestionClickUntil = Date.now() + 180;
    list.classList.add("is-dragging");
  }

  list.scrollTop = activeEvaluationTopicSuggestionDrag.startScrollTop - offsetY;
  event.preventDefault();
  return false;
}

function endKnowledgeGapSuggestionsDrag(event, listId) {
  const list = getKnowledgeGapSuggestionList(listId);

  if (!activeKnowledgeGapSuggestionDrag || activeKnowledgeGapSuggestionDrag.listId !== listId || event.pointerId !== activeKnowledgeGapSuggestionDrag.pointerId) {
    return false;
  }

  if (list) {
    list.classList.remove("is-dragging");
  }

  if (activeKnowledgeGapSuggestionDrag.moved) {
    event.preventDefault();
  }

  activeKnowledgeGapSuggestionDrag = null;
  return false;
}

function endPlanningCategorySuggestionsDrag(event, listId) {
  const list = getPlanningCategorySuggestionList(listId);

  if (!activePlanningCategorySuggestionDrag || activePlanningCategorySuggestionDrag.listId !== listId || event.pointerId !== activePlanningCategorySuggestionDrag.pointerId) {
    return false;
  }

  if (list) {
    list.classList.remove("is-dragging");
  }

  if (activePlanningCategorySuggestionDrag.moved) {
    event.preventDefault();
  }

  activePlanningCategorySuggestionDrag = null;
  return false;
}

function endEvaluationTopicSuggestionsDrag(event, listId) {
  const list = getEvaluationTopicSuggestionList(listId);

  if (!activeEvaluationTopicSuggestionDrag || activeEvaluationTopicSuggestionDrag.listId !== listId || event.pointerId !== activeEvaluationTopicSuggestionDrag.pointerId) {
    return false;
  }

  if (list) {
    list.classList.remove("is-dragging");
  }

  if (activeEvaluationTopicSuggestionDrag.moved) {
    event.preventDefault();
  }

  activeEvaluationTopicSuggestionDrag = null;
  return false;
}

function renderPersistenceIndicator() {
  if (!persistenceButton) {
    return;
  }

  const isPersisted = persistenceHasStoredState && !persistenceHasPendingChanges && !persistenceIsSaving;
  let title = "Daten manuell in IndexedDB speichern";

  if (persistenceIsSaving) {
    title = "Speichere Aenderungen in IndexedDB ...";
  } else if (isPersisted) {
    title = "Aenderungen sind in IndexedDB gespeichert. Klick fuer erneutes Speichern.";
  } else if (persistenceHasPendingChanges) {
    title = "Es gibt ungespeicherte Aenderungen. Klick zum Speichern.";
  } else if (persistenceLastError) {
    title = "Persistenz ist aktuell nicht verfuegbar. Klick fuer einen neuen Speicher-Versuch.";
  }

  persistenceButton.classList.toggle("is-persisted", isPersisted);
  persistenceButton.classList.toggle("is-saving", persistenceIsSaving);
  persistenceButton.setAttribute("aria-label", title);
  persistenceButton.setAttribute("title", title);
}

function isEncryptedExportPayload(payload) {
  return Boolean(
    payload
    && typeof payload === "object"
    && payload.format === "unterrichtsassistent-encrypted-export"
    && payload.passwordAuth
    && payload.passwordAuth.encryptedMasterKey
    && payload.passwordAuth.salt
    && payload.passwordAuth.wrapIv
    && payload.appState
    && appDataCryptoApi
    && typeof appDataCryptoApi.isEncryptedSnapshotRecord === "function"
    && appDataCryptoApi.isEncryptedSnapshotRecord(payload.appState)
  );
}

function getAppDataImportPasswordModal() {
  return appDataImportPasswordModal;
}

function clearAppDataImportPasswordError() {
  if (!appDataImportPasswordError) {
    return;
  }

  appDataImportPasswordError.textContent = "";
  appDataImportPasswordError.hidden = true;
}

function showAppDataImportPasswordError(message) {
  if (!appDataImportPasswordError) {
    return;
  }

  appDataImportPasswordError.textContent = String(message || "");
  appDataImportPasswordError.hidden = !message;
}

function openAppDataImportPasswordModal(fileName) {
  const modal = getAppDataImportPasswordModal();

  if (!modal || !pendingEncryptedImportPayload) {
    return false;
  }

  clearAppDataImportPasswordError();
  if (appDataImportPasswordMeta) {
    appDataImportPasswordMeta.textContent = fileName
      ? "Datei: " + String(fileName)
      : "Bitte Passwort eingeben, um den verschluesselten Datenbestand zu importieren.";
  }

  if (appDataImportPasswordInput) {
    appDataImportPasswordInput.value = "";
  }

  modal.hidden = false;
  modal.classList.add("is-open");

  window.setTimeout(function () {
    if (appDataImportPasswordInput && typeof appDataImportPasswordInput.focus === "function") {
      appDataImportPasswordInput.focus();
    }
  }, 0);

  return false;
}

function closeAppDataImportPasswordModalInternal() {
  const modal = getAppDataImportPasswordModal();

  pendingEncryptedImportPayload = null;
  clearAppDataImportPasswordError();

  if (appDataImportPasswordInput) {
    appDataImportPasswordInput.value = "";
  }

  if (modal) {
    modal.hidden = true;
    modal.classList.remove("is-open");
  }
}

function schedulePendingPersist(delayMs) {
  if (!persistenceHasPendingChanges || persistenceIsSaving) {
    return;
  }

  clearPendingPersistTimer();
  pendingPersistTimerId = window.setTimeout(function () {
    flushPendingPersist();
  }, typeof delayMs === "number" ? delayMs : AUTOSAVE_DELAY_MS);
}

function persistSnapshotNow(snapshotToPersist) {
  let didPersistSucceed = false;
  const persistedSnapshot = stripNonPersistentUiState(snapshotToPersist);

  persistenceIsSaving = true;
  persistenceLastError = null;
  renderPersistenceIndicator();

  persistInFlightPromise = Promise.resolve()
    .then(function () {
      const masterKeyBytes = getUnlockedMasterKey();

      if (!appDataCryptoApi || typeof appDataCryptoApi.encryptSnapshot !== "function" || !masterKeyBytes) {
        throw new Error("Snapshot konnte nicht verschluesselt werden, weil kein Master-Key im Speicher vorliegt.");
      }

      return appDataCryptoApi.encryptSnapshot(persistedSnapshot, masterKeyBytes);
    })
    .then(function (encryptedSnapshotRecord) {
      return repository.saveSnapshot(encryptedSnapshotRecord);
    })
    .then(function () {
      didPersistSucceed = true;
      persistenceHasStoredState = true;
      persistenceLastError = null;
      return true;
    })
    .catch(function (error) {
      persistenceHasStoredState = false;
      persistenceLastError = error;
      persistenceHasPendingChanges = true;
      if (!pendingPersistSnapshot) {
        pendingPersistSnapshot = snapshotToPersist;
      }
      console.warn("Speichern in IndexedDB fehlgeschlagen.", error);
      return false;
    })
    .finally(function () {
      persistenceIsSaving = false;
      persistInFlightPromise = null;
      renderPersistenceIndicator();

      if (forcePersistAfterCurrentSave && pendingPersistSnapshot) {
        forcePersistAfterCurrentSave = false;
        flushPendingPersist({ immediate: true });
        return;
      }

      forcePersistAfterCurrentSave = false;

      if (didPersistSucceed && persistenceHasPendingChanges && pendingPersistSnapshot && !pendingPersistTimerId) {
        schedulePendingPersist(AUTOSAVE_DELAY_MS);
      }
    });

  return persistInFlightPromise;
}

function flushPendingPersist(options) {
  const config = options || {};
  const snapshotToPersist = config.snapshot
    || pendingPersistSnapshot
    || getMutableRawSnapshot();

  clearPendingPersistTimer();

  if (!repository || typeof repository.saveSnapshot !== "function" || !snapshotToPersist) {
    renderPersistenceIndicator();
    return persistInFlightPromise || Promise.resolve(false);
  }

  if (persistenceIsSaving && persistInFlightPromise) {
    pendingPersistSnapshot = snapshotToPersist;
    persistenceHasPendingChanges = true;
    forcePersistAfterCurrentSave = forcePersistAfterCurrentSave || Boolean(config.immediate);
    renderPersistenceIndicator();
    return persistInFlightPromise;
  }

  pendingPersistSnapshot = null;
  persistenceHasPendingChanges = false;
  return persistSnapshotNow(snapshotToPersist);
}

function queueSnapshotPersist(nextRawSnapshot, options) {
  pendingPersistSnapshot = nextRawSnapshot;
  persistenceHasPendingChanges = true;
  persistenceLastError = null;
  renderPersistenceIndicator();

  if (options && options.immediate) {
    return flushPendingPersist({ snapshot: nextRawSnapshot, immediate: true });
  }

  schedulePendingPersist(AUTOSAVE_DELAY_MS);
  return Promise.resolve(true);
}

function renderStartupError(message) {
  if (viewTitle && !viewTitle.textContent) {
    viewTitle.textContent = message;
  }
}

function escapeHtml(value) {
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

function captureTodoViewScrollState() {
  const activeTodoView = document.getElementById("todos");
  const scrollContainers = activeTodoView && typeof activeTodoView.querySelectorAll === "function"
    ? Array.from(activeTodoView.querySelectorAll("[data-todo-scroll-key]"))
    : [];

  if (!activeTodoView) {
    return null;
  }

  return {
    viewScrollTop: activeTodoView.scrollTop || 0,
    viewScrollLeft: activeTodoView.scrollLeft || 0,
    containers: scrollContainers.reduce(function (entries, element) {
      const key = String(element && element.getAttribute("data-todo-scroll-key") || "").trim();

      if (!key) {
        return entries;
      }

      entries[key] = {
        top: element.scrollTop || 0,
        left: element.scrollLeft || 0
      };
      return entries;
    }, {})
  };
}

function restoreTodoViewScrollState() {
  const activeTodoView = document.getElementById("todos");
  const savedState = todoViewScrollState;

  if (!activeTodoView || !savedState) {
    return;
  }

  activeTodoView.scrollTop = Number(savedState.viewScrollTop) || 0;
  activeTodoView.scrollLeft = Number(savedState.viewScrollLeft) || 0;

  Object.keys(savedState.containers || {}).forEach(function (key) {
    const state = savedState.containers[key] || {};
    const element = activeTodoView.querySelector('[data-todo-scroll-key="' + key.replace(/"/g, '\\"') + '"]');

    if (!element) {
      return;
    }

    element.scrollTop = Number(state.top) || 0;
    element.scrollLeft = Number(state.left) || 0;
  });

  todoViewScrollState = null;
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

function getStudentDisplayName(student) {
  const firstName = String(student && student.firstName || "").trim();
  const lastName = String(student && student.lastName || "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return fullName || String(student && student.className || "").trim() || "Unbekannt";
}

function getStudentFirstNameSortValue(student) {
  return String(student && student.firstName || "").trim().toLowerCase();
}

function getStudentLastNameSortValue(student) {
  return String(student && student.lastName || "").trim().toLowerCase();
}

function getStudentCompactDisplayName(student, classStudents) {
  const firstName = String(student && student.firstName || "").trim();
  const lastName = String(student && student.lastName || "").trim();
  const normalizedFirstName = firstName.toLowerCase();
  const studentsInClass = Array.isArray(classStudents) ? classStudents : [];
  const hasDuplicateFirstName = Boolean(normalizedFirstName) && studentsInClass.some(function (entry) {
    return entry !== student
      && String(entry && entry.firstName || "").trim().toLowerCase() === normalizedFirstName;
  });

  if (firstName) {
    return hasDuplicateFirstName && lastName
      ? firstName + " " + lastName.charAt(0).toUpperCase() + "."
      : firstName;
  }

  return lastName || "Unbekannt";
}

function getTodoCategoryClassInfo(rawSnapshot, categoryName) {
  const snapshot = rawSnapshot || {};
  const normalizedCategory = String(categoryName || "").trim().toLowerCase();
  const classes = Array.isArray(snapshot.classes) ? snapshot.classes : [];
  const students = Array.isArray(snapshot.students) ? snapshot.students : [];
  const classEntry = classes.find(function (entry) {
    return [String(entry && entry.name || "").trim(), String(entry && entry.subject || "").trim()]
      .filter(Boolean)
      .join(" ")
      .trim()
      .toLowerCase() === normalizedCategory;
  }) || null;
  const studentIds = classEntry && Array.isArray(classEntry.studentIds)
    ? classEntry.studentIds.map(function (studentId) {
        return String(studentId || "").trim();
      }).filter(Boolean)
    : [];
  const classStudents = studentIds.map(function (studentId) {
    return students.find(function (student) {
      return String(student && student.id || "").trim() === studentId;
    }) || null;
  }).filter(Boolean).sort(function (left, right) {
    const firstNameComparison = getStudentFirstNameSortValue(left).localeCompare(getStudentFirstNameSortValue(right), "de", { sensitivity: "base" });

    if (firstNameComparison !== 0) {
      return firstNameComparison;
    }

    return getStudentLastNameSortValue(left).localeCompare(getStudentLastNameSortValue(right), "de", { sensitivity: "base" });
  });

  return {
    isClassCategory: Boolean(classEntry),
    classEntry: classEntry,
    classId: String(classEntry && classEntry.id || "").trim(),
    students: classStudents
  };
}

function normalizeTodoDraftAssignments(rawSnapshot) {
  const classInfo = getTodoCategoryClassInfo(rawSnapshot, activeTodoDraft && activeTodoDraft.category);
  const availableStudentIds = classInfo.students.map(function (student) {
    return String(student && student.id || "").trim();
  });

  if (!activeTodoDraft) {
    return classInfo;
  }

  activeTodoDraft.relatedClassId = classInfo.classId;
  activeTodoDraft.assignedStudentIds = Array.isArray(activeTodoDraft.assignedStudentIds)
    ? activeTodoDraft.assignedStudentIds.map(function (studentId) {
        return String(studentId || "").trim();
      }).filter(function (studentId, index, entries) {
        return Boolean(studentId)
          && availableStudentIds.indexOf(studentId) >= 0
          && entries.indexOf(studentId) === index;
      })
    : [];

  if (!classInfo.isClassCategory) {
    activeTodoDraft.assignedStudentIds = [];
  }

  activeTodoDraft.assignedStudentStatuses = activeTodoDraft.assignedStudentIds.map(function (studentId) {
    const existingEntry = Array.isArray(activeTodoDraft.assignedStudentStatuses)
      ? activeTodoDraft.assignedStudentStatuses.find(function (entry) {
          return String(entry && entry.studentId || "").trim() === studentId;
        }) || null
      : null;

    return {
      studentId: studentId,
      done: Boolean(existingEntry && existingEntry.done),
      completedAt: Boolean(existingEntry && existingEntry.done)
        ? (String(existingEntry && existingEntry.completedAt || "").trim() || getActiveDateTimeTimestamp())
        : "",
      checklistItems: cloneTodoChecklistItems(existingEntry && existingEntry.checklistItems)
    };
  });

  return classInfo;
}

function syncTodoAssignedStudentStatuses(todo, completedAtTimestamp) {
  const assignedStudentIds = Array.isArray(todo && todo.assignedStudentIds)
    ? todo.assignedStudentIds.map(function (studentId) {
        return String(studentId || "").trim();
      }).filter(Boolean)
    : [];
  const existingStatuses = Array.isArray(todo && todo.assignedStudentStatuses) ? todo.assignedStudentStatuses : [];
  const nextStatuses = assignedStudentIds.map(function (studentId) {
    const existingEntry = existingStatuses.find(function (entry) {
      return String(entry && entry.studentId || "").trim() === studentId;
    }) || null;

      return {
        studentId: studentId,
        done: Boolean(existingEntry && existingEntry.done),
        completedAt: Boolean(existingEntry && existingEntry.done)
          ? (String(existingEntry && existingEntry.completedAt || "").trim() || String(completedAtTimestamp || "").trim() || getActiveDateTimeTimestamp())
          : "",
        checklistItems: cloneTodoChecklistItems(existingEntry && existingEntry.checklistItems)
      };
    });
  const isDone = assignedStudentIds.length > 0
    ? nextStatuses.every(function (entry) {
        return Boolean(entry && entry.done);
      })
    : Boolean(todo && todo.done);

  if (!todo) {
    return false;
  }

  todo.assignedStudentStatuses = nextStatuses;
  todo.done = isDone;
  todo.completedAt = isDone
    ? (String(todo.completedAt || "").trim() || String(completedAtTimestamp || "").trim() || getActiveDateTimeTimestamp())
    : "";

  return isDone;
}

function cloneTodoChecklistItems(items) {
  return Array.isArray(items)
    ? items.map(function (entry) {
        return entry && typeof entry === "object"
          ? Object.assign({}, entry, {
              followUpSteps: Array.isArray(entry.followUpSteps)
                ? entry.followUpSteps.map(function (step) {
                    return step && typeof step === "object" ? Object.assign({}, step) : step;
                  })
                : []
            })
          : entry;
      })
    : [];
}

function syncChecklistCompletionForItems(checklistItems, completedAtTimestamp) {
  const completionTimestamp = String(completedAtTimestamp || "").trim() || getActiveDateTimeTimestamp();

  function getNodeSelfDone(nodeId) {
    const selectedNode = getTodoChecklistNodeById(checklistItems, nodeId);

    return Boolean(selectedNode && selectedNode.entry && selectedNode.entry.done);
  }

  function getNodeDisplayDone(nodeId) {
    const selectedNode = getTodoChecklistNodeById(checklistItems, nodeId);
    const childItems = getTodoChecklistChildItems(checklistItems, nodeId);

    if (!selectedNode) {
      return false;
    }

    if (childItems.length > 0) {
      return childItems.every(function (childItem) {
        return getAggregateDone(childItem && childItem.id);
      });
    }

    return getNodeSelfDone(nodeId);
  }

  function getAggregateDone(nodeId) {
    const selectedNode = getTodoChecklistNodeById(checklistItems, nodeId);
    const followUpSteps = selectedNode && selectedNode.type === "item" && Array.isArray(selectedNode.entry && selectedNode.entry.followUpSteps)
      ? selectedNode.entry.followUpSteps
      : [];

    if (!selectedNode) {
      return false;
    }

    return getNodeDisplayDone(nodeId) && followUpSteps.every(function (step) {
      return getAggregateDone(step && step.id);
    });
  }

  function syncNode(nodeId) {
    const selectedNode = getTodoChecklistNodeById(checklistItems, nodeId);
    const childItems = getTodoChecklistChildItems(checklistItems, nodeId);
    const followUpSteps = selectedNode && selectedNode.type === "item" && Array.isArray(selectedNode.entry && selectedNode.entry.followUpSteps)
      ? selectedNode.entry.followUpSteps
      : [];
    let childItemsDone = true;

    if (!selectedNode) {
      return false;
    }

    childItemsDone = childItems.every(function (childItem) {
      return syncNode(childItem && childItem.id);
    });
    followUpSteps.forEach(function (step) {
      syncNode(step && step.id);
    });

    if (childItems.length > 0) {
      selectedNode.entry.done = childItemsDone;
    } else {
      selectedNode.entry.done = Boolean(selectedNode.entry.done);
    }

    selectedNode.entry.completedAt = selectedNode.entry.done
      ? (String(selectedNode.entry.completedAt || "").trim() || completionTimestamp)
      : "";

    return getAggregateDone(nodeId);
  }

  const topLevelItems = getTodoChecklistChildItems(checklistItems, "");

  return topLevelItems.length > 0
    ? topLevelItems.every(function (item) {
        return syncNode(item && item.id);
      })
    : false;
}

function formatDateTimeLabel(dateTimeValue) {
  const parsedDate = new Date(String(dateTimeValue || "").trim());

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateTimeValue || "");
  }

  return parsedDate.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
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

function buildManageActionButtonsHtml(deleteAction, deleteLabel, createAction, createLabel) {
  return '<button class="circle-action circle-action--danger" type="button" aria-label="' + escapeHtml(deleteLabel) + '" onclick="return ' + deleteAction + '">-</button>'
    + '<button class="circle-action" type="button" aria-label="' + escapeHtml(createLabel) + '" onclick="return ' + createAction + '">+</button>';
}

function getSeatPlansForActiveRoom() {
  const activeClass = getActiveSeatPlanClass();
  const activeRoom = getActiveSeatPlanRoom(activeClass);

  if (!schoolService || !activeClass) {
    return [];
  }

  return schoolService.getSeatPlansForClassAndRoom(activeClass.id, activeRoom);
}

function getSeatOrdersForActiveRoom() {
  const activeClass = getActiveSeatPlanClass();
  const activeRoom = getActiveSeatPlanRoom(activeClass);

  if (!schoolService || !activeClass) {
    return [];
  }

  return schoolService.getSeatOrdersForClassAndRoom(activeClass.id, activeRoom);
}

function buildSeatPlanDropdownHtml(modeLabel) {
  const activeClass = getActiveSeatPlanClass();
  const activeRoom = getActiveSeatPlanRoom(activeClass);
  const isSeatOrderMode = seatPlanViewMode === "sitzordnung";
  const allItems = isSeatOrderMode ? getSeatOrdersForActiveRoom() : getSeatPlansForActiveRoom();
  const currentItem = schoolService && activeClass
    ? (isSeatOrderMode
      ? schoolService.getCurrentSeatOrder(activeClass.id, activeRoom, schoolService.getReferenceDate())
      : schoolService.getCurrentSeatPlan(activeClass.id, activeRoom, schoolService.getReferenceDate()))
    : null;
  const managedItem = schoolService && activeClass
    ? (isSeatOrderMode
      ? schoolService.getManagedSeatOrder(activeClass.id, activeRoom)
      : schoolService.getManagedSeatPlan(activeClass.id, activeRoom))
    : null;
  const options = allItems.length
    ? allItems.map(function (item) {
        const label = currentItem && item.id === currentItem.id
          ? "aktuell"
          : "Gueltig bis: " + formatDateLabel(item.validTo);
        const selected = managedItem && item.id === managedItem.id ? ' selected' : "";
        return '<option value="' + escapeHtml(item.id) + '"' + selected + ">" + escapeHtml(label) + "</option>";
      }).join("")
    : '<option value="">Keine ' + escapeHtml(modeLabel || "Tischordnungen") + '</option>';

  return '<select id="activeSeatPlanSelect" class="sidebar__class-select timetable-select" aria-label="Gespeicherte ' + escapeHtml(modeLabel || "Tischordnung") + ' waehlen" onchange="return window.UnterrichtsassistentApp.changeActiveSeatPlan(this.value)">' + options + "</select>";
}

function buildEvaluationSheetDropdownHtml() {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const snapshot = schoolService ? schoolService.snapshot : null;
  const allItems = activeClass && snapshot && Array.isArray(snapshot.evaluationSheets)
    ? snapshot.evaluationSheets.filter(function (item) {
        return String(item && item.classId || "").trim() === String(activeClass.id || "").trim();
      }).slice().sort(function (left, right) {
        const leftCreatedAt = String(left && left.createdAt || "").trim();
        const rightCreatedAt = String(right && right.createdAt || "").trim();

        if (leftCreatedAt === rightCreatedAt) {
          return String(left && left.title || "").localeCompare(String(right && right.title || ""), "de-DE");
        }

        return rightCreatedAt.localeCompare(leftCreatedAt);
      })
    : [];
  const selectedItem = allItems.find(function (item) {
    return String(item && item.id || "").trim() === String(snapshot && snapshot.activeEvaluationSheetId || "").trim();
  }) || allItems[0] || null;
  const options = allItems.length
    ? allItems.map(function (item) {
        const createdAtLabel = formatDateTimeLabel(item && item.createdAt);
        const title = String(item && item.title || "").trim() || "Ohne Titel";
        const selected = selectedItem && String(selectedItem.id || "").trim() === String(item && item.id || "").trim()
          ? ' selected'
          : "";

        return '<option value="' + escapeHtml(String(item && item.id || "").trim()) + '"' + selected + ">" + escapeHtml(title + " | " + createdAtLabel) + "</option>";
      }).join("")
    : '<option value="">Keine Bewertungsboegen</option>';

  return '<select id="activeEvaluationSheetSelect" class="sidebar__class-select timetable-select" aria-label="Gespeicherten Bewertungsbogen waehlen" onchange="return window.UnterrichtsassistentApp.changeActiveEvaluationSheet(this.value)">' + options + "</select>";
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

function buildMultiModeToggleHtml(options) {
  const modes = Array.isArray(options.modes) ? options.modes : [];
  const columns = Math.max(1, modes.length);

  return '<div class="header-action-group"><div class="class-view-mode-toggle class-view-mode-toggle--header class-view-mode-toggle--multi" style="grid-template-columns: repeat(' + columns + ', minmax(0, 1fr));" role="tablist" aria-label="' + options.ariaLabel + '">' + modes.map(function (mode) {
    const isActive = options.activeMode === mode.value;
    return '<button class="class-view-mode-toggle__button' + (isActive ? ' is-active' : '') + '" type="button" role="tab" aria-selected="' + (isActive ? "true" : "false") + '" onclick="return ' + mode.action + '">' + mode.label + '</button>';
  }).join("") + '</div>' + (options.trailingHtml ? '<div class="header-action-group__secondary">' + options.trailingHtml + "</div>" : "") + "</div>";
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

  renderPersistenceIndicator();
}

function updateHeaderSubtitle(viewId, config) {
  if (!viewSubtitle) {
    return;
  }

  if (viewId === "unterricht" && schoolService) {
    const activeClass = schoolService.getActiveClass();
    const referenceDate = schoolService.getReferenceDate();
    const room = activeClass ? schoolService.getRelevantRoomForClass(activeClass.id, referenceDate) : "";
    const subtitleParts = activeClass
      ? [activeClass.name || "", activeClass.subject || "", room || ""].filter(Boolean)
      : [];
    const subtitle = subtitleParts.join(" ").trim();
    if (!subtitle) {
      viewSubtitle.textContent = "";
      viewSubtitle.hidden = true;
      return;
    }

    viewSubtitle.innerHTML = '<span class="content__subtitle-main">' + escapeHtml(subtitle) + "</span>";
    viewSubtitle.hidden = false;
    return;
  }

  if (viewId === "sitzplan" && schoolService) {
    const activeClass = schoolService.getActiveClass();
    const subtitle = activeClass
      ? [activeClass.name || "", activeClass.subject || ""].join(" ").trim()
      : "";

    if (!subtitle) {
      viewSubtitle.textContent = "";
      viewSubtitle.hidden = true;
      return;
    }

    viewSubtitle.innerHTML = '<span class="content__subtitle-main">' + escapeHtml(subtitle) + "</span>";
    viewSubtitle.hidden = false;
    return;
  }

  if (viewId === "planung" && schoolService && (planningViewMode === "unterrichtsplanung" || planningViewMode === "stoffplanung")) {
    const activeClass = schoolService.getActiveClass();
    const subtitle = activeClass
      ? [activeClass.name || "", activeClass.subject || ""].join(" ").trim()
      : "";

    if (!subtitle) {
      viewSubtitle.textContent = "";
      viewSubtitle.hidden = true;
      return;
    }

    viewSubtitle.innerHTML = '<span class="content__subtitle-main">' + escapeHtml(subtitle) + "</span>";
    viewSubtitle.hidden = false;
    return;
  }

  if (viewId === "bewertung" && schoolService) {
    const activeClass = schoolService.getActiveClass();
    const subtitleParts = activeClass
      ? [activeClass.name || "", activeClass.subject || ""].filter(Boolean)
      : [];
    const subtitle = subtitleParts.join(" ").trim();

    if (!subtitle) {
      viewSubtitle.textContent = "";
      viewSubtitle.hidden = true;
      return;
    }

    viewSubtitle.innerHTML = '<span class="content__subtitle-main">' + escapeHtml(subtitle) + "</span>";
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

  if (viewId === "klasse") {
    viewHeaderActions.innerHTML = buildViewModeToggleHtml({
      ariaLabel: "Ansicht der Lerngruppe wechseln",
      activeMode: classViewMode,
      leftMode: "analyse",
      leftLabel: "Analyse",
      leftAction: "window.UnterrichtsassistentApp.setClassViewMode('analyse')",
      rightMode: "verwalten",
      rightLabel: "Verwalten",
      rightAction: "window.UnterrichtsassistentApp.setClassViewMode('verwalten')"
    });
    return;
  }

  if (viewId === "unterricht") {
    viewHeaderActions.innerHTML = buildMultiModeToggleHtml({
      ariaLabel: "Modus des Unterrichts wechseln",
      activeMode: unterrichtViewMode,
      modes: [
        {
          value: "live",
          label: "Live",
          action: "window.UnterrichtsassistentApp.setUnterrichtViewMode('live')"
        },
        {
          value: "nachpflege",
          label: "Nachpflege",
          action: "window.UnterrichtsassistentApp.setUnterrichtViewMode('nachpflege')"
        },
        {
          value: "analyse",
          label: "Analyse",
          action: "window.UnterrichtsassistentApp.setUnterrichtViewMode('analyse')"
        }
      ]
    });
    return;
  }

  if (viewId === "stundenplan") {
    viewHeaderActions.innerHTML = buildViewModeToggleHtml({
      ariaLabel: "Ansicht des Stundenplans wechseln",
      activeMode: timetableViewMode,
      leftMode: "ansicht",
      leftLabel: "Ansicht",
      leftAction: "window.UnterrichtsassistentApp.setTimetableViewMode('ansicht')",
      rightMode: "verwalten",
      rightLabel: "Verwalten",
      rightAction: "window.UnterrichtsassistentApp.setTimetableViewMode('verwalten')"
    });
    return;
  }

    if (viewId === "sitzplan") {
    viewHeaderActions.innerHTML = buildMultiModeToggleHtml({
      ariaLabel: "Ansicht des Sitzplans wechseln",
      activeMode: seatPlanViewMode,
      modes: [
        {
          value: "ansicht",
          label: "Ansicht",
          action: "window.UnterrichtsassistentApp.setSeatPlanViewMode('ansicht')"
        },
        {
          value: "sitzordnung",
          label: "Sitzordnung",
          action: "window.UnterrichtsassistentApp.setSeatPlanViewMode('sitzordnung')"
        },
        {
          value: "tischordnung",
          label: "Tischordnung",
          action: "window.UnterrichtsassistentApp.setSeatPlanViewMode('tischordnung')"
        }
      ]
    });
    return;
  }

    if (viewId === "planung") {
      viewHeaderActions.innerHTML = buildMultiModeToggleHtml({
        ariaLabel: "Planungsmodus wechseln",
        activeMode: planningViewMode,
        modes: [
          {
            value: "jahresplanung",
            label: "Jahresplanung",
            action: "window.UnterrichtsassistentApp.setPlanningViewMode('jahresplanung')"
          },
        {
          value: "unterrichtsplanung",
          label: "Unterrichtsplanung",
          action: "window.UnterrichtsassistentApp.setPlanningViewMode('unterrichtsplanung')"
        }
      ]
    });
      return;
    }

    if (viewId === "bewertung") {
      viewHeaderActions.innerHTML = buildMultiModeToggleHtml({
        ariaLabel: "Bewertungsmodus wechseln",
        activeMode: bewertungViewMode,
        modes: [
          {
            value: "bewerten",
            label: "Bewerten",
            action: "window.UnterrichtsassistentApp.setBewertungViewMode('bewerten')"
          },
        {
          value: "analysieren",
          label: "Analysieren",
          action: "window.UnterrichtsassistentApp.setBewertungViewMode('analysieren')"
          },
          {
            value: "evidenz",
            label: "Evidenz",
            action: "window.UnterrichtsassistentApp.setBewertungViewMode('evidenz')"
          },
        {
          value: "erstellen",
          label: "Erstellen",
          action: "window.UnterrichtsassistentApp.setBewertungViewMode('erstellen')"
        }
      ]
    });
      return;
    }

    viewHeaderActions.innerHTML = "";
  }

function updateHeaderUtility(viewId) {
  if (!viewHeaderUtility) {
    return;
  }

  if (viewId === "planung") {
    viewHeaderUtility.innerHTML = '<button class="header-utility-button' + (planningAdminMode ? ' is-active' : '') + '" type="button" aria-label="' + (planningAdminMode ? "Arbeitsmodus aktivieren" : "Adminmodus aktivieren") + '" title="Verwalten" onclick="return window.UnterrichtsassistentApp.togglePlanningAdminMode()">Verwalten</button>';
    return;
  }

  viewHeaderUtility.innerHTML = "";
}

function updateSecondaryActions(viewId) {
  if (!viewSecondaryActions) {
    return;
  }

  let html = "";

  if (viewId === "klasse" && isClassManageMode()) {
    html = buildManageActionButtonsHtml(
      "window.UnterrichtsassistentApp.deleteActiveClass()",
      "Aktive Lerngruppe loeschen",
      "window.UnterrichtsassistentApp.openClassImportModal()",
      "Neue Lerngruppe anlegen"
    );
  } else if (viewId === "stundenplan" && isTimetableManageMode()) {
    html = buildTimetableDropdownHtml()
      + buildManageActionButtonsHtml(
        "window.UnterrichtsassistentApp.deleteActiveTimetable()",
        "Aktuellen Stundenplan loeschen",
        "window.UnterrichtsassistentApp.createTimetable()",
        "Neuen Stundenplan anlegen"
      );
  } else if (viewId === "sitzplan" && (seatPlanViewMode === "sitzordnung" || seatPlanViewMode === "tischordnung")) {
    const label = seatPlanViewMode === "sitzordnung" ? "Sitzordnung" : "Tischordnung";
    html = buildSeatPlanDropdownHtml(label)
      + buildManageActionButtonsHtml(
        "window.UnterrichtsassistentApp.deleteActiveSeatPlan()",
        "Aktive " + label + " loeschen",
        "window.UnterrichtsassistentApp.createSeatPlan()",
        "Neue " + label + " anlegen"
      );
  } else if (viewId === "bewertung" && bewertungViewMode === "erstellen") {
    html = buildEvaluationSheetDropdownHtml()
      + buildManageActionButtonsHtml(
        "window.UnterrichtsassistentApp.deleteActiveEvaluationSheet()",
        "Aktiven Bewertungsbogen loeschen",
        "window.UnterrichtsassistentApp.openEvaluationSheetModal()",
        "Neuen Bewertungsbogen anlegen"
      );
  }

  viewSecondaryActions.innerHTML = html ? '<div class="content__secondary-actions-inner">' + html + "</div>" : "";
  viewSecondaryActions.hidden = !html;
}

function normalizePlanningDateValue(value) {
  return String(value || "").slice(0, 10);
}

window.UnterrichtsassistentApp.updatePlanningSchoolYearField = function (fieldName, nextValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedValue = normalizePlanningDateValue(nextValue);
  let startValue;
  let halfYearValue;
  let endValue;

  if (!currentRawSnapshot || ["schoolYearStart", "schoolHalfYearStart", "schoolYearEnd"].indexOf(fieldName) === -1) {
    return false;
  }

  currentRawSnapshot[fieldName] = normalizedValue;
  startValue = normalizePlanningDateValue(currentRawSnapshot.schoolYearStart);
  halfYearValue = normalizePlanningDateValue(currentRawSnapshot.schoolHalfYearStart);
  endValue = normalizePlanningDateValue(currentRawSnapshot.schoolYearEnd);

  if (startValue && endValue && startValue > endValue) {
    if (fieldName === "schoolYearStart") {
      currentRawSnapshot.schoolYearEnd = startValue;
    } else {
      currentRawSnapshot.schoolYearStart = endValue;
    }
  }

  startValue = normalizePlanningDateValue(currentRawSnapshot.schoolYearStart);
  endValue = normalizePlanningDateValue(currentRawSnapshot.schoolYearEnd);
  halfYearValue = normalizePlanningDateValue(currentRawSnapshot.schoolHalfYearStart);

  if (halfYearValue && startValue && halfYearValue < startValue) {
    currentRawSnapshot.schoolHalfYearStart = startValue;
    halfYearValue = startValue;
  }

  if (halfYearValue && endValue && halfYearValue > endValue) {
    currentRawSnapshot.schoolHalfYearStart = endValue;
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};

window.UnterrichtsassistentApp.updatePlanningHidePastMonths = function (isChecked) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;

  if (!currentRawSnapshot) {
    return false;
  }

  currentRawSnapshot.hidePastPlanningMonths = Boolean(isChecked);
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.updateAutoApplyCalculatedCurriculumHourDemands = function (isChecked) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;

  if (!currentRawSnapshot) {
    return false;
  }

  currentRawSnapshot.autoApplyCalculatedCurriculumHourDemands = Boolean(isChecked);

  if (currentRawSnapshot.autoApplyCalculatedCurriculumHourDemands && activeClass) {
    applyCalculatedCurriculumHourDemandsToSnapshot(currentRawSnapshot, String(activeClass.id || "").trim());
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};

function syncClassAnalysisTableLayout() {
  const wraps = document.querySelectorAll(".student-table-wrap--analysis[data-drag-scroll='true']");

  eachNode(wraps, function (wrap) {
    const table = wrap.querySelector(".student-table--analysis");
    const nameCell = table ? table.querySelector(".student-table__name-cell, .student-table__name-cell--head") : null;
    const wrapWidth = wrap.clientWidth || 0;
    const nameWidth = Math.max(156, Math.min(220, nameCell ? Math.ceil(nameCell.getBoundingClientRect().width) : 176));
    const dateWidth = Math.max(76, Math.floor(Math.max(0, wrapWidth - nameWidth) / 8));
    const classId = String(wrap.dataset.classId || "");
    const storedScrollLeft = classId && Object.prototype.hasOwnProperty.call(classAnalysisScrollLeftByClassId, classId)
      ? Number(classAnalysisScrollLeftByClassId[classId]) || 0
      : wrap.scrollLeft;

    wrap.style.setProperty("--analysis-name-column-width", String(nameWidth) + "px");
    wrap.style.setProperty("--analysis-date-column-width", String(dateWidth) + "px");
    wrap.scrollLeft = Math.max(0, Math.min(storedScrollLeft, Math.max(0, wrap.scrollWidth - wrap.clientWidth)));
  });
}

function clearClassAnalysisDragScroll() {
  if (!activeClassAnalysisDragScroll) {
    return;
  }

  window.removeEventListener("pointermove", window.UnterrichtsassistentApp.handleClassAnalysisDragScrollMove);
  window.removeEventListener("pointerup", window.UnterrichtsassistentApp.handleClassAnalysisDragScrollEnd);
  window.removeEventListener("pointercancel", window.UnterrichtsassistentApp.handleClassAnalysisDragScrollEnd);
  activeClassAnalysisDragScroll.wrap.classList.remove("is-dragging");
  activeClassAnalysisDragScroll = null;
}

function initializeClassAnalysisInteractions() {
  const wraps = document.querySelectorAll(".student-table-wrap--analysis[data-drag-scroll='true']");

  if (!hasBoundClassAnalysisResize) {
    hasBoundClassAnalysisResize = true;
    window.addEventListener("resize", syncClassAnalysisTableLayout);
  }

  eachNode(wraps, function (wrap) {
    if (wrap.dataset.dragScrollBound === "true") {
      return;
    }

    wrap.dataset.dragScrollBound = "true";
    wrap.addEventListener("scroll", function () {
      const classId = String(wrap.dataset.classId || "");

      if (!classId) {
        return;
      }

      classAnalysisScrollLeftByClassId[classId] = wrap.scrollLeft;
    }, { passive: true });
    wrap.addEventListener("pointerdown", function (event) {
      if ((event.pointerType === "mouse" && event.button !== 0)
        || event.target.closest("button, input, select, textarea, a")) {
        return;
      }

      if (wrap.scrollWidth <= wrap.clientWidth + 2) {
        return;
      }

      clearClassAnalysisDragScroll();
      activeClassAnalysisDragScroll = {
          wrap: wrap,
          classId: String(wrap.dataset.classId || ""),
          pointerId: event.pointerId,
          startX: Number(event.clientX) || 0,
          startScrollLeft: wrap.scrollLeft,
          didDrag: false
        };

        window.addEventListener("pointermove", window.UnterrichtsassistentApp.handleClassAnalysisDragScrollMove);
        window.addEventListener("pointerup", window.UnterrichtsassistentApp.handleClassAnalysisDragScrollEnd);
        window.addEventListener("pointercancel", window.UnterrichtsassistentApp.handleClassAnalysisDragScrollEnd);
      });
    });

  window.requestAnimationFrame(syncClassAnalysisTableLayout);
}

function clearPlanningCurriculumDragScroll() {
  if (!activePlanningCurriculumDragScroll) {
    return;
  }

  window.removeEventListener("pointermove", window.UnterrichtsassistentApp.handlePlanningCurriculumDragScrollMove);
  window.removeEventListener("pointerup", window.UnterrichtsassistentApp.handlePlanningCurriculumDragScrollEnd);
  window.removeEventListener("pointercancel", window.UnterrichtsassistentApp.handlePlanningCurriculumDragScrollEnd);
  activePlanningCurriculumDragScroll.wrap.classList.remove("is-dragging");
  activePlanningCurriculumDragScroll = null;
}

function syncPlanningCurriculumTableLayout() {
  const wraps = document.querySelectorAll(".planning-curriculum__table-wrap[data-drag-scroll='true']");

  eachNode(wraps, function (wrap) {
    const classId = String(wrap.dataset.classId || "");
    const storedScrollLeft = classId && Object.prototype.hasOwnProperty.call(planningCurriculumScrollLeftByClassId, classId)
      ? Number(planningCurriculumScrollLeftByClassId[classId]) || 0
      : wrap.scrollLeft;

    wrap.scrollLeft = Math.max(0, Math.min(storedScrollLeft, Math.max(0, wrap.scrollWidth - wrap.clientWidth)));
  });
}

function stopPlanningCurriculumAutoScroll() {
  if (planningCurriculumAutoScrollFrameId) {
    window.cancelAnimationFrame(planningCurriculumAutoScrollFrameId);
    planningCurriculumAutoScrollFrameId = 0;
  }

  if (!activePlanningCurriculumAutoScroll) {
    return;
  }

  activePlanningCurriculumAutoScroll = null;
}

function runPlanningCurriculumAutoScrollFrame() {
  if (!activePlanningCurriculumAutoScroll || !activePlanningCurriculumAutoScroll.wrap) {
    planningCurriculumAutoScrollFrameId = 0;
    return;
  }

  const wrap = activePlanningCurriculumAutoScroll.wrap;

  wrap.scrollLeft = Math.max(0, Math.min(wrap.scrollLeft + activePlanningCurriculumAutoScroll.step, Math.max(0, wrap.scrollWidth - wrap.clientWidth)));
  if (wrap.dataset.classId) {
    planningCurriculumScrollLeftByClassId[String(wrap.dataset.classId || "")] = wrap.scrollLeft;
  }

  planningCurriculumAutoScrollFrameId = window.requestAnimationFrame(runPlanningCurriculumAutoScrollFrame);
}

function updatePlanningCurriculumAutoScroll(clientX) {
  const wrap = document.querySelector(".planning-curriculum__table-wrap[data-drag-scroll='true']");
  const rect = wrap && typeof wrap.getBoundingClientRect === "function" ? wrap.getBoundingClientRect() : null;
  const threshold = 56;
  const maxStep = 18;
  let direction = 0;
  let intensity = 0;

  if (!wrap || !rect) {
    stopPlanningCurriculumAutoScroll();
    return;
  }

  if (clientX <= rect.left + threshold) {
    direction = -1;
    intensity = Math.min(1, Math.max(0, (rect.left + threshold - clientX) / threshold));
  } else if (clientX >= rect.right - threshold) {
    direction = 1;
    intensity = Math.min(1, Math.max(0, (clientX - (rect.right - threshold)) / threshold));
  }

  if (!direction) {
    stopPlanningCurriculumAutoScroll();
    return;
  }

  activePlanningCurriculumAutoScroll = {
    wrap: wrap,
    step: Math.max(4, Math.round(maxStep * intensity)) * direction
  };
  if (!planningCurriculumAutoScrollFrameId) {
    planningCurriculumAutoScrollFrameId = window.requestAnimationFrame(runPlanningCurriculumAutoScrollFrame);
  }
}

function initializePlanningCurriculumInteractions() {
  const wraps = document.querySelectorAll(".planning-curriculum__table-wrap[data-drag-scroll='true']");

  eachNode(wraps, function (wrap) {
    if (wrap.dataset.dragScrollBound === "true") {
      return;
    }

    wrap.dataset.dragScrollBound = "true";
    wrap.addEventListener("scroll", function () {
      const classId = String(wrap.dataset.classId || "");

      if (!classId) {
        return;
      }

      planningCurriculumScrollLeftByClassId[classId] = wrap.scrollLeft;
    }, { passive: true });
    wrap.addEventListener("pointerdown", function (event) {
      if ((event.pointerType === "mouse" && event.button !== 0)
        || event.target.closest("button, input, select, textarea, a, label")) {
        return;
      }

      if (wrap.scrollWidth <= wrap.clientWidth + 2) {
        return;
      }

      clearPlanningCurriculumDragScroll();
      activePlanningCurriculumDragScroll = {
        wrap: wrap,
        pointerId: event.pointerId,
        startX: Number(event.clientX) || 0,
        startScrollLeft: wrap.scrollLeft,
        didDrag: false
      };

      window.addEventListener("pointermove", window.UnterrichtsassistentApp.handlePlanningCurriculumDragScrollMove);
      window.addEventListener("pointerup", window.UnterrichtsassistentApp.handlePlanningCurriculumDragScrollEnd);
      window.addEventListener("pointercancel", window.UnterrichtsassistentApp.handlePlanningCurriculumDragScrollEnd);
    });
  });

  window.requestAnimationFrame(syncPlanningCurriculumTableLayout);
}

function setActiveView(viewId) {
  const previousViewId = activeViewId;
  const shouldPreserveTodoScroll = viewId === "todos";
  todoViewScrollState = shouldPreserveTodoScroll ? captureTodoViewScrollState() : null;

  if (previousViewId !== viewId) {
    expandedTodoIds = [];
  }

  activeViewId = viewId;
  const config = registeredViews[viewId];

  if (viewId === "klasse" && previousViewId !== "klasse") {
    classViewMode = "analyse";
    classAnalysisSort = { key: "name", direction: "asc" };
    classAnalysisGrouping = "day";
    classAnalysisCriterion = "count";
    classAnalysisEnabledTypes = {
      attendance: true,
      homework: true,
      warning: true,
      assessment: true,
      completedEvaluation: true
    };
  }

  if (viewId === "unterricht" && previousViewId !== "unterricht") {
    unterrichtViewMode = "live";
    if (schoolService && rawState) {
      unterrichtToolMode = shouldDefaultToAssessmentTool(
        rawState,
        schoolService.getActiveClass(),
        schoolService.getReferenceDate()
      ) ? "assessment" : "attendance";
    } else {
      unterrichtToolMode = "attendance";
    }
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

    if (viewId === "planung" && previousViewId !== "planung") {
      planningViewMode = planningViewMode === "unterrichtsplanung" || planningViewMode === "stoffplanung"
        ? "unterrichtsplanung"
        : "jahresplanung";
    }

  if (viewId === "bewertung" && previousViewId !== "bewertung") {
    bewertungViewMode = ["analysieren", "erstellen", "entwerfen"].indexOf(bewertungViewMode) >= 0
      ? (bewertungViewMode === "entwerfen" ? "erstellen" : bewertungViewMode)
      : "bewerten";
    bewertungPlannedEvaluationDetailsExpanded = false;
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

        if (isActive && viewId === "todos") {
          restoreTodoViewScrollState();
        }
      }
    });

  if (!config || !schoolService) {
    return;
  }

  viewTitle.textContent = config.title;
  updateHeaderSubtitle(viewId, config);
  updateHeaderActions(viewId);
  updateHeaderUtility(viewId);
  updateSecondaryActions(viewId);
  renderActiveClassContext();

  if (viewId !== previousViewId) {
    collapseMenu();
  }

  if (viewId === "klasse" && isClassImportModalOpen && window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.openClassImportModal === "function") {
    window.UnterrichtsassistentApp.openClassImportModal();
  }

  if (viewId === "klasse" && isClassAnalysisDetailModalOpen && window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.openClassAnalysisDetailModal === "function") {
    window.UnterrichtsassistentApp.openClassAnalysisDetailModal();
  }

  if (viewId === "klasse" && isClassAnalysisRecordEditModalOpen && window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.openClassAnalysisRecordEditModal === "function") {
    window.UnterrichtsassistentApp.openClassAnalysisRecordEditModal();
  }

  if (viewId === "klasse" && isClassAnalysisPerformedEvaluationModalOpen && window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.openClassAnalysisPerformedEvaluationModal === "function") {
    window.UnterrichtsassistentApp.openClassAnalysisPerformedEvaluationModal();
  }

  if (viewId === "klasse" && !isClassManageMode()) {
    initializeClassAnalysisInteractions();
  } else {
    clearClassAnalysisDragScroll();
  }

  if ((viewId === "planung" && isCurriculumPlanningMode()) || (viewId === "bewertung" && bewertungViewMode === "erstellen")) {
    initializePlanningCurriculumInteractions();
  } else {
    clearPlanningCurriculumDragScroll();
  }
}

function toggleMenu() {
  if (!appShell || !menuToggle) {
    return false;
  }

  closeCollapsedClassPicker();
  appShell.classList.toggle("is-collapsed");
  menuToggle.setAttribute("aria-expanded", String(!appShell.classList.contains("is-collapsed")));
  return false;
}

function collapseMenu() {
  if (!appShell || !menuToggle) {
    return false;
  }

  closeCollapsedClassPicker();
  appShell.classList.add("is-collapsed");
  menuToggle.setAttribute("aria-expanded", "false");
  return false;
}

function closeCollapsedClassPicker() {
  if (!sidebar || !activeClassBadge || !collapsedClassPicker) {
    return;
  }

  sidebar.classList.remove("is-class-picker-open");
  collapsedClassPicker.hidden = true;
  collapsedClassPicker.style.top = "";
  collapsedClassPicker.style.left = "";
  collapsedClassPicker.style.maxHeight = "";
  activeClassBadge.setAttribute("aria-expanded", "false");
}

function ensureCollapsedClassPickerPortal() {
  if (!collapsedClassPicker || collapsedClassPicker.parentNode === document.body) {
    return;
  }

  document.body.appendChild(collapsedClassPicker);
}

function positionCollapsedClassPicker() {
  const badgeRect = activeClassBadge ? activeClassBadge.getBoundingClientRect() : null;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const pickerWidth = collapsedClassPicker ? Math.max(collapsedClassPicker.offsetWidth || 0, 220) : 220;
  const pickerHeight = collapsedClassPicker ? collapsedClassPicker.offsetHeight || 0 : 0;
  let top = 0;
  let left = 0;
  let maxHeight = 0;

  if (!badgeRect || !collapsedClassPicker) {
    return;
  }

  top = Math.max(12, Math.round(badgeRect.top));
  left = Math.round(badgeRect.right + 12);

  if (left + pickerWidth > window.innerWidth - 12) {
    left = Math.max(12, Math.round(badgeRect.left - pickerWidth - 12));
  }

  if (pickerHeight && top + pickerHeight > viewportHeight - 12) {
    top = Math.max(12, viewportHeight - pickerHeight - 12);
  }

  maxHeight = Math.max(160, viewportHeight - top - 12);

  collapsedClassPicker.style.top = String(top) + "px";
  collapsedClassPicker.style.left = String(left) + "px";
  collapsedClassPicker.style.maxHeight = String(maxHeight) + "px";
}

function toggleCollapsedClassPicker() {
  if (!appShell || !sidebar || !activeClassBadge || !collapsedClassPicker) {
    return false;
  }

  if (activeClassBadge.offsetParent === null) {
    return false;
  }

  if (sidebar.classList.contains("is-class-picker-open")) {
    closeCollapsedClassPicker();
  } else {
    ensureCollapsedClassPickerPortal();
    sidebar.classList.add("is-class-picker-open");
    collapsedClassPicker.hidden = false;
    positionCollapsedClassPicker();
    activeClassBadge.setAttribute("aria-expanded", "true");
  }

  return false;
}

function saveAndRefreshSnapshot(nextRawSnapshot, nextViewId, options) {
  refreshSnapshotInMemory(nextRawSnapshot, nextViewId);
  return queueSnapshotPersist(nextRawSnapshot, {
    immediate: Boolean(options && options.forcePersist)
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

function createSeatAssignmentId() {
  return "seat-assignment-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createPlanningEventId() {
  return "planning-event-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createPlanningCategoryId() {
  return "planning-category-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createEvaluationSheetId() {
  return "evaluation-sheet-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createEvaluationTaskId() {
  return "evaluation-task-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createEvaluationSubtaskId() {
  return "evaluation-subtask-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createPlannedEvaluationId() {
  return "planned-evaluation-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createPlannedEvaluationGradingStageId() {
  return "planned-evaluation-stage-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createPerformedEvaluationId() {
  return "performed-evaluation-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createPlanningInstructionLessonStatusId() {
  return "planning-instruction-lesson-status-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createCurriculumSeriesId() {
  return "curriculum-series-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createCurriculumSequenceId() {
  return "curriculum-sequence-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createCurriculumLessonPlanId() {
  return "curriculum-lesson-plan-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createCurriculumLessonPhaseId() {
  return "curriculum-lesson-phase-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createCurriculumLessonStepId() {
  return "curriculum-lesson-step-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createCurriculumLessonPhaseStatusId() {
  return "curriculum-lesson-phase-status-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function shouldAutoApplyCalculatedCurriculumHourDemands(snapshot) {
  return Boolean(snapshot && snapshot.autoApplyCalculatedCurriculumHourDemands === true);
}

function applyCalculatedCurriculumHourDemandsToSnapshot(snapshot, activeClassId) {
  const collections = snapshot ? getCurriculumCollections(snapshot) : null;
  const orderedSeries = snapshot && activeClassId
    ? getOrderedCurriculumSeriesForClass(snapshot, activeClassId).slice()
    : [];
  let hasChanges = false;

  if (!snapshot || !activeClassId || !collections || !orderedSeries.length) {
    return false;
  }

  collections.sequences = collections.sequences.map(function (sequenceItem) {
    const nextSequence = Object.assign({}, sequenceItem);
    const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
    const orderedLessons = getOrderedCurriculumLessonsForSequence(snapshot, sequenceId);
    const calculatedHourDemand = orderedLessons.reduce(function (sum, lessonItem) {
      return sum + getCurriculumLessonHourDemand(lessonItem);
    }, 0);

    if (!orderedLessons.length) {
      return nextSequence;
    }

    if (Math.max(0, Number(nextSequence.hourDemand) || 0) !== calculatedHourDemand) {
      nextSequence.hourDemand = calculatedHourDemand;
      hasChanges = true;
    }

    return nextSequence;
  });

  snapshot.curriculumSequences = collections.sequences;

  collections.series = collections.series.map(function (seriesItem) {
    const nextSeries = Object.assign({}, seriesItem);
    const seriesId = String(seriesItem && seriesItem.id || "").trim();
    const orderedSequences = getOrderedCurriculumSequencesForSeries(snapshot, seriesId);

    if (!orderedSequences.length) {
      return nextSeries;
    }

    const calculatedHourDemand = getCalculatedCurriculumSeriesHourDemand(snapshot, seriesId);

    if (Math.max(0, Number(nextSeries.hourDemand) || 0) !== calculatedHourDemand) {
      nextSeries.hourDemand = calculatedHourDemand;
      hasChanges = true;
    }

    return nextSeries;
  });

  snapshot.curriculumSeries = collections.series;
  return hasChanges;
}

function createAttendanceRecordId() {
  return "attendance-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createHomeworkRecordId() {
  return "homework-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createWarningRecordId() {
  return "warning-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createAssessmentRecordId() {
  return "assessment-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function timeStringToMinutes(timeValue) {
  const parts = String(timeValue || "").split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (parts.length !== 2 || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return (hours * 60) + minutes;
}

function getReferenceDateTimeValue() {
  const referenceDate = schoolService ? schoolService.getReferenceDate() : new Date();
  const dateValue = normalizeDateValue(getReferenceDateValue());
  const hours = String(referenceDate.getHours()).padStart(2, "0");
  const minutes = String(referenceDate.getMinutes()).padStart(2, "0");

  return dateValue + "T" + hours + ":" + minutes;
}

function normalizeHomeworkQualityValue(qualityValue) {
  const normalized = String(qualityValue || "").trim();

  if (["fehlt", "unvollstaendig", "abgeschrieben", "vorhanden", "besondersgut"].indexOf(normalized) >= 0) {
    return normalized;
  }

  return "fehlt";
}

function normalizeWarningCategoryValue(categoryValue) {
  const normalized = String(categoryValue || "").trim();

  if (["stoerung", "arbeitsorganisation", "material", "letzteentfernen", "andere"].indexOf(normalized) >= 0) {
    return normalized;
  }

  return "stoerung";
}

function getDeskSeatSlots(deskType) {
  if (deskType === "double") {
    return ["left", "right"];
  }

  if (deskType === "single") {
    return ["single"];
  }

  return [];
}

function getSeatAssignmentByDeskSlot(seatPlan, deskItemId, slotName) {
  return seatPlan && Array.isArray(seatPlan.seats)
    ? seatPlan.seats.find(function (seat) {
        return seat && seat.deskItemId === deskItemId && seat.slot === slotName;
      }) || null
    : null;
}

function getSeatAssignmentByStudentId(seatPlan, studentId) {
  return seatPlan && Array.isArray(seatPlan.seats)
    ? seatPlan.seats.find(function (seat) {
        return seat && seat.studentId === studentId;
      }) || null
    : null;
}

function isSeatAssignmentLocked(seat) {
  return Boolean(seat && seat.isLocked);
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function getActiveDateTimeTimestamp() {
  const activeParts = getActiveDateTimeParts();
  const normalizedDate = String(activeParts && activeParts.date || "").trim();
  const normalizedTime = String(activeParts && activeParts.time || "00:00").trim() || "00:00";
  const parsed = normalizedDate
    ? new Date(normalizedDate + "T" + normalizedTime)
    : null;

  if (!parsed || Number.isNaN(parsed.getTime())) {
    return getCurrentTimestamp();
  }

  return parsed.toISOString();
}

function getAttendanceRecordsCollection(rawSnapshot) {
  return Array.isArray(rawSnapshot && rawSnapshot.attendanceRecords) ? rawSnapshot.attendanceRecords : [];
}

function getMutableAttendanceRecordsCollection(rawSnapshot) {
  if (!rawSnapshot) {
    return [];
  }

  if (!Array.isArray(rawSnapshot.attendanceRecords)) {
    rawSnapshot.attendanceRecords = [];
  }

  return rawSnapshot.attendanceRecords;
}

function getHomeworkRecordsCollection(rawSnapshot) {
  return Array.isArray(rawSnapshot && rawSnapshot.homeworkRecords) ? rawSnapshot.homeworkRecords : [];
}

function getMutableHomeworkRecordsCollection(rawSnapshot) {
  if (!rawSnapshot) {
    return [];
  }

  if (!Array.isArray(rawSnapshot.homeworkRecords)) {
    rawSnapshot.homeworkRecords = [];
  }

  return rawSnapshot.homeworkRecords;
}

function getWarningRecordsCollection(rawSnapshot) {
  return Array.isArray(rawSnapshot && rawSnapshot.warningRecords) ? rawSnapshot.warningRecords : [];
}

function getMutableWarningRecordsCollection(rawSnapshot) {
  if (!rawSnapshot) {
    return [];
  }

  if (!Array.isArray(rawSnapshot.warningRecords)) {
    rawSnapshot.warningRecords = [];
  }

  return rawSnapshot.warningRecords;
}

function getTodosCollection(rawSnapshot) {
  return Array.isArray(rawSnapshot && rawSnapshot.todos) ? rawSnapshot.todos : [];
}

function getMutableTodosCollection(rawSnapshot) {
  if (!rawSnapshot) {
    return [];
  }

  if (!Array.isArray(rawSnapshot.todos)) {
    rawSnapshot.todos = [];
  }

  return rawSnapshot.todos;
}

function createTodoId() {
  return "todo-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function createTodoChecklistItemId() {
  return "todo-check-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
}

function createTodoChecklistStepId() {
  return "todo-step-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
}

function formatTodoChecklistText(items) {
  if (!Array.isArray(items)) {
    return "";
  }

  return items.map(function (entry) {
    if (entry && typeof entry === "object") {
      const levelValue = Number(entry.level);
      const normalizedLevel = Number.isFinite(levelValue) && levelValue > 0 ? Math.floor(levelValue) : 1;
      const titleValue = String(entry.title || "").trim();
      const followUpLines = Array.isArray(entry.followUpSteps)
        ? entry.followUpSteps.map(function (step) {
            const stepObject = step && typeof step === "object"
              ? step
              : { title: String(step || "").trim(), done: false, level: normalizedLevel, previousStepId: "" };
            const stepValue = String(stepObject.title || "").trim();
            const stepLevel = Number.isFinite(Number(stepObject.level)) && Number(stepObject.level) > 0
              ? Math.floor(Number(stepObject.level))
              : normalizedLevel;
            const stepPrefix = Boolean(stepObject.done)
              ? "(" + "#".repeat(stepLevel) + ">)"
              : "#".repeat(stepLevel) + ">";
            return stepValue ? stepPrefix + " " + stepValue : "";
          }).filter(Boolean)
        : [];
      const itemPrefix = Boolean(entry.done)
        ? "(" + "#".repeat(normalizedLevel) + ")"
        : "#".repeat(normalizedLevel);

      if (!titleValue) {
        return "";
      }

      return [itemPrefix + " " + titleValue].concat(followUpLines).join("\n");
    }

    const flatTitle = String(entry || "").trim();

    return flatTitle ? "# " + flatTitle : "";
  }).filter(Boolean).join("\n");
}

function parseTodoChecklistText(value) {
  const sourceText = String(value || "").replace(/\r/g, "");
  const items = [];
  const lastItemIdByLevel = {};
  const lastNodeIdByLevel = {};
  const lastFollowUpStepIdByLevel = {};

  sourceText.split("\n").forEach(function (rawLine) {
    const trimmedLine = String(rawLine || "").trim();
    let match = null;

    if (!trimmedLine) {
      return;
    }

    match = trimmedLine.match(/^(?:\((#+)>\)|(#+)>)\s*(.+)$/);

    if (match) {
      const hashToken = String(match[1] || match[2] || "");
      const followUpValue = String(match[3] || "").trim();
      const isDone = Boolean(match[1]);
      const targetLevel = Math.max(1, hashToken.length);
      const targetItemId = String(lastItemIdByLevel[targetLevel] || "").trim();
      const targetItem = items.find(function (entry) {
        return String(entry && entry.id || "").trim() === targetItemId;
      }) || null;
      const previousStepId = String(lastFollowUpStepIdByLevel[targetLevel] || "").trim();
      let createdStep = null;

      if (followUpValue && targetItem) {
        createdStep = {
          id: createTodoChecklistStepId(),
          title: followUpValue,
          done: isDone,
          level: targetLevel,
          previousStepId: previousStepId
        };
        targetItem.followUpSteps.push(createdStep);
        lastNodeIdByLevel[targetLevel] = createdStep.id;
        lastFollowUpStepIdByLevel[targetLevel] = createdStep.id;
      }

      return;
    }

    match = trimmedLine.match(/^(?:\((#+)\)|(#+))\s*(.+)$/);

    if (match) {
      const hashToken = String(match[1] || match[2] || "");
      const titleValue = String(match[3] || "").trim();
      const level = Math.max(1, hashToken.length);
      const isDone = Boolean(match[1]);
      let parentId = "";
      let parentLevel = level - 1;

      if (!titleValue) {
        return;
      }

      while (parentLevel > 0 && !parentId) {
        parentId = String(lastNodeIdByLevel[parentLevel] || "").trim();
        parentLevel -= 1;
      }

      const createdItem = {
        id: createTodoChecklistItemId(),
        title: titleValue,
        level: level,
        parentId: parentId,
        done: isDone,
        followUpSteps: []
      };
      items.push(createdItem);
      lastItemIdByLevel[level] = createdItem.id;
      lastNodeIdByLevel[level] = createdItem.id;
      lastFollowUpStepIdByLevel[level] = "";

      Object.keys(lastItemIdByLevel).forEach(function (key) {
        if (Number(key) > level) {
          delete lastItemIdByLevel[key];
        }
      });
      Object.keys(lastNodeIdByLevel).forEach(function (key) {
        if (Number(key) > level) {
          delete lastNodeIdByLevel[key];
        }
      });
      Object.keys(lastFollowUpStepIdByLevel).forEach(function (key) {
        if (Number(key) > level) {
          delete lastFollowUpStepIdByLevel[key];
        }
      });
      return;
    }
  });

  return items;
}

function getTodoChecklistChildItems(items, parentId) {
  return (items || []).filter(function (entry) {
    return String(entry && entry.parentId || "").trim() === String(parentId || "").trim();
  });
}

function getTodoChecklistNodeById(items, nodeId) {
  const normalizedNodeId = String(nodeId || "").trim();

  if (!normalizedNodeId) {
    return null;
  }

  return (items || []).reduce(function (foundEntry, entry) {
    if (foundEntry) {
      return foundEntry;
    }

    if (String(entry && entry.id || "").trim() === normalizedNodeId) {
      return {
        type: "item",
        entry: entry,
        ownerItem: entry
      };
    }

    if (Array.isArray(entry && entry.followUpSteps)) {
      const foundStep = entry.followUpSteps.find(function (step) {
        return String(step && step.id || "").trim() === normalizedNodeId;
      }) || null;

      if (foundStep) {
        return {
          type: "step",
          entry: foundStep,
          ownerItem: entry
        };
      }
    }

    return null;
  }, null);
}

function isTodoChecklistItemManuallyToggleable(items, itemId) {
  const selectedNode = getTodoChecklistNodeById(items, itemId);
  const childItems = getTodoChecklistChildItems(items, itemId);

  return Boolean(selectedNode) && childItems.length === 0;
}

function isTodoChecklistNodeDisplayDone(items, nodeId) {
  const selectedNode = getTodoChecklistNodeById(items, nodeId);
  const childItems = getTodoChecklistChildItems(items, nodeId);

  if (!selectedNode) {
    return false;
  }

  if (childItems.length > 0) {
    return childItems.every(function (childItem) {
      return isTodoChecklistNodeAggregateDone(items, childItem && childItem.id);
    });
  }

  return Boolean(selectedNode.entry && selectedNode.entry.done);
}

function isTodoChecklistNodeAggregateDone(items, nodeId) {
  const selectedNode = getTodoChecklistNodeById(items, nodeId);
  const followUpSteps = selectedNode && selectedNode.type === "item" && Array.isArray(selectedNode.entry && selectedNode.entry.followUpSteps)
    ? selectedNode.entry.followUpSteps
    : [];

  if (!selectedNode) {
    return false;
  }

  return isTodoChecklistNodeDisplayDone(items, nodeId) && followUpSteps.every(function (step) {
    return isTodoChecklistNodeAggregateDone(items, step && step.id);
  });
}

function hasTodoChecklistCompletedFollowUpSuccessor(items, nodeId) {
  const selectedNode = getTodoChecklistNodeById(items, nodeId);
  const followUpSteps = selectedNode && selectedNode.type === "item" && Array.isArray(selectedNode.entry && selectedNode.entry.followUpSteps)
    ? selectedNode.entry.followUpSteps
    : [];

  if (!selectedNode || !followUpSteps.length) {
    return false;
  }

  return followUpSteps.some(function (step) {
    return isTodoChecklistNodeAggregateDone(items, step && step.id)
      || hasTodoChecklistCompletedFollowUpSuccessor(items, step && step.id);
  });
}

function syncChecklistTodoCompletion(todo, completedAtTimestamp) {
  const checklistItems = Array.isArray(todo && todo.checklistItems) ? todo.checklistItems : [];
  const completionTimestamp = String(completedAtTimestamp || "").trim();
  const assignedStudentIds = Array.isArray(todo && todo.assignedStudentIds)
    ? todo.assignedStudentIds.map(function (studentId) {
        return String(studentId || "").trim();
      }).filter(Boolean)
    : [];

  if (!todo || String(todo.type || "").trim().toLowerCase() !== "checkliste") {
    return false;
  }

  if (assignedStudentIds.length > 0) {
    const existingStatuses = Array.isArray(todo.assignedStudentStatuses) ? todo.assignedStudentStatuses : [];
    const nextStatuses = assignedStudentIds.map(function (studentId) {
      const existingEntry = existingStatuses.find(function (entry) {
        return String(entry && entry.studentId || "").trim() === studentId;
      }) || null;
      const studentChecklistItems = cloneTodoChecklistItems(existingEntry && existingEntry.checklistItems);
      const studentDone = syncChecklistCompletionForItems(studentChecklistItems, completionTimestamp);

      return {
        studentId: studentId,
        done: studentDone,
        completedAt: studentDone
          ? (String(existingEntry && existingEntry.completedAt || "").trim() || completionTimestamp)
          : "",
        checklistItems: studentChecklistItems
      };
    });
    const isTodoDone = nextStatuses.length > 0 && nextStatuses.every(function (entry) {
      return Boolean(entry && entry.done);
    });

    todo.assignedStudentStatuses = nextStatuses;
    todo.done = isTodoDone;
    todo.completedAt = isTodoDone
      ? (String(todo.completedAt || "").trim() || completionTimestamp)
      : "";

    return isTodoDone;
  }

  const isTodoDone = syncChecklistCompletionForItems(checklistItems, completionTimestamp);

  todo.done = isTodoDone;
  todo.completedAt = isTodoDone
    ? (String(todo.completedAt || "").trim() || completionTimestamp)
    : "";

  return isTodoDone;
}

function getRelevantUnterrichtLesson(activeClass, referenceDate) {
  if (!schoolService || !activeClass) {
    return null;
  }

  if (typeof schoolService.getAttendanceContextForClass === "function") {
    return schoolService.getAttendanceContextForClass(activeClass.id, referenceDate || schoolService.getReferenceDate());
  }

  if (typeof schoolService.getRelevantLessonForClass === "function") {
    return schoolService.getRelevantLessonForClass(activeClass.id, referenceDate || schoolService.getReferenceDate());
  }

  return null;
}

function getAttendanceRecordsForLessonOccurrenceFromSnapshot(rawSnapshot, studentId, classId, lessonId, lessonDate) {
  return getAttendanceRecordsCollection(rawSnapshot).filter(function (record) {
    return (!studentId || record.studentId === studentId)
      && record.classId === classId
      && record.lessonId === lessonId
      && normalizeDateValue(record.lessonDate) === normalizeDateValue(lessonDate);
  }).sort(function (left, right) {
    const leftKey = String(left.effectiveAt || left.recordedAt || "");
    const rightKey = String(right.effectiveAt || right.recordedAt || "");

    if (leftKey === rightKey) {
      return String(left.id || "").localeCompare(String(right.id || ""));
    }

    return leftKey.localeCompare(rightKey);
  });
}

function getAttendanceStateForLessonOccurrenceFromSnapshot(rawSnapshot, studentId, classId, lessonId, lessonDate) {
  const records = getAttendanceRecordsForLessonOccurrenceFromSnapshot(rawSnapshot, studentId, classId, lessonId, lessonDate);

  return records.length && records[records.length - 1].status === "absent" ? "absent" : "present";
}

function hasAttendanceRecordForCurrentUnterrichtContext(rawSnapshot, activeClass, referenceDate) {
  const lesson = getRelevantUnterrichtLesson(activeClass, referenceDate);
  const lessonDate = normalizeDateValue(getReferenceDateValue());

  if (!rawSnapshot || !activeClass || !lesson) {
    return false;
  }

  return getAttendanceRecordsForLessonOccurrenceFromSnapshot(rawSnapshot, "", activeClass.id, lesson.id, lessonDate).length > 0;
}

function shouldDefaultToAssessmentTool(rawSnapshot, activeClass, referenceDate) {
  const lesson = getRelevantUnterrichtLesson(activeClass, referenceDate);
  let lessonStartMinutes;
  let referenceMinutes;

  if (!rawSnapshot || !activeClass || !lesson || lesson.isFallback) {
    return false;
  }

  if (hasAttendanceRecordForCurrentUnterrichtContext(rawSnapshot, activeClass, referenceDate)) {
    return true;
  }

  lessonStartMinutes = timeStringToMinutes(lesson.startTime);
  referenceMinutes = (referenceDate.getHours() * 60) + referenceDate.getMinutes();
  return referenceMinutes >= (lessonStartMinutes + 10);
}

function getHomeworkRecordsForLessonOccurrenceFromSnapshot(rawSnapshot, studentId, classId, lessonId, lessonDate) {
  return getHomeworkRecordsCollection(rawSnapshot).filter(function (record) {
    return (!studentId || record.studentId === studentId)
      && record.classId === classId
      && record.lessonId === lessonId
      && normalizeDateValue(record.lessonDate) === normalizeDateValue(lessonDate);
  }).sort(function (left, right) {
    return String(left.recordedAt || "").localeCompare(String(right.recordedAt || ""));
  });
}

function getWarningRecordsForLessonOccurrenceFromSnapshot(rawSnapshot, studentId, classId, lessonId, lessonDate) {
  return getWarningRecordsCollection(rawSnapshot).filter(function (record) {
    return (!studentId || record.studentId === studentId)
      && record.classId === classId
      && record.lessonId === lessonId
      && normalizeDateValue(record.lessonDate) === normalizeDateValue(lessonDate);
  }).sort(function (left, right) {
    return String(left.recordedAt || "").localeCompare(String(right.recordedAt || ""));
  });
}

function ensureUnterrichtHomeworkRadialMenu() {
  if (unterrichtHomeworkRadialMenu && document.body.contains(unterrichtHomeworkRadialMenu)) {
    return unterrichtHomeworkRadialMenu;
  }

  unterrichtHomeworkRadialMenu = document.createElement("div");
  unterrichtHomeworkRadialMenu.className = "unterricht-homework-radial-menu";
  unterrichtHomeworkRadialMenu.setAttribute("aria-hidden", "true");
  unterrichtHomeworkRadialMenu.innerHTML = HOMEWORK_RADIAL_OPTIONS.map(function (option) {
    return '<div class="unterricht-homework-radial-menu__item unterricht-homework-radial-menu__item--' + option.side + ' unterricht-homework-radial-menu__item--' + option.row + '" data-quality="' + option.quality + '">' + escapeHtml(option.label) + "</div>";
  }).join("");
  document.body.appendChild(unterrichtHomeworkRadialMenu);
  return unterrichtHomeworkRadialMenu;
}

function hideUnterrichtHomeworkRadialMenu() {
  const menu = ensureUnterrichtHomeworkRadialMenu();

  menu.classList.remove("is-visible");
  menu.setAttribute("aria-hidden", "true");
  menu.querySelectorAll("[data-quality]").forEach(function (item) {
    item.classList.remove("is-active");
  });
}

function setUnterrichtHomeworkRadialSelection(qualityValue) {
  const menu = ensureUnterrichtHomeworkRadialMenu();
  const normalized = qualityValue ? normalizeHomeworkQualityValue(qualityValue) : "";

  menu.querySelectorAll("[data-quality]").forEach(function (item) {
    item.classList.toggle("is-active", item.getAttribute("data-quality") === normalized);
  });
}

function showUnterrichtHomeworkRadialMenu(clientX, clientY) {
  const menu = ensureUnterrichtHomeworkRadialMenu();

  menu.style.left = String(clientX) + "px";
  menu.style.top = String(clientY) + "px";
  menu.classList.add("is-visible");
  menu.setAttribute("aria-hidden", "false");
}

function getUnterrichtHomeworkRadialQuality(clientX, clientY, anchorX, anchorY) {
  const dx = clientX - anchorX;
  const dy = clientY - anchorY;

  if (dx <= -24) {
    if (dy <= -26) {
      return "fehlt";
    }

    if (dy >= 26) {
      return "abgeschrieben";
    }

    return "unvollstaendig";
  }

  if (dx >= 24) {
    return dy <= -18 ? "besondersgut" : "vorhanden";
  }

  return "";
}

function clearUnterrichtHomeworkPressListeners() {
  window.removeEventListener("pointermove", window.UnterrichtsassistentApp.handleUnterrichtHomeworkPointerMove);
  window.removeEventListener("pointerup", window.UnterrichtsassistentApp.handleUnterrichtHomeworkPointerEnd);
  window.removeEventListener("pointercancel", window.UnterrichtsassistentApp.handleUnterrichtHomeworkPointerEnd);
}

function openUnterrichtHomeworkRadialMenuImmediately() {
  if (!activeUnterrichtHomeworkPress || activeUnterrichtHomeworkPress.menuVisible) {
    return;
  }

  if (activeUnterrichtHomeworkPress.timerId) {
    window.clearTimeout(activeUnterrichtHomeworkPress.timerId);
    activeUnterrichtHomeworkPress.timerId = 0;
  }

  activeUnterrichtHomeworkPress.menuVisible = true;
  showUnterrichtHomeworkRadialMenu(activeUnterrichtHomeworkPress.clientX, activeUnterrichtHomeworkPress.clientY);
  setUnterrichtHomeworkRadialSelection("");
}

function ensureUnterrichtWarningRadialMenu() {
  if (unterrichtWarningRadialMenu && document.body.contains(unterrichtWarningRadialMenu)) {
    return unterrichtWarningRadialMenu;
  }

  unterrichtWarningRadialMenu = document.createElement("div");
  unterrichtWarningRadialMenu.className = "unterricht-warning-radial-menu";
  unterrichtWarningRadialMenu.setAttribute("aria-hidden", "true");
  unterrichtWarningRadialMenu.innerHTML = WARNING_RADIAL_OPTIONS.map(function (option) {
    return '<div class="unterricht-warning-radial-menu__item unterricht-warning-radial-menu__item--' + option.side + ' unterricht-warning-radial-menu__item--' + option.row + '" data-category="' + option.category + '">' + escapeHtml(option.label) + "</div>";
  }).join("");
  document.body.appendChild(unterrichtWarningRadialMenu);
  return unterrichtWarningRadialMenu;
}

function hideUnterrichtWarningRadialMenu() {
  const menu = ensureUnterrichtWarningRadialMenu();

  menu.classList.remove("is-visible");
  menu.setAttribute("aria-hidden", "true");
  menu.querySelectorAll("[data-category]").forEach(function (item) {
    item.classList.remove("is-active");
  });
}

function setUnterrichtWarningRadialSelection(categoryValue) {
  const menu = ensureUnterrichtWarningRadialMenu();
  const normalized = categoryValue ? normalizeWarningCategoryValue(categoryValue) : "";

  menu.querySelectorAll("[data-category]").forEach(function (item) {
    item.classList.toggle("is-active", item.getAttribute("data-category") === normalized);
  });
}

function showUnterrichtWarningRadialMenu(clientX, clientY) {
  const menu = ensureUnterrichtWarningRadialMenu();

  menu.style.left = String(clientX) + "px";
  menu.style.top = String(clientY) + "px";
  menu.classList.add("is-visible");
  menu.setAttribute("aria-hidden", "false");
}

function getUnterrichtWarningRadialCategory(clientX, clientY, anchorX, anchorY) {
  const dx = clientX - anchorX;
  const dy = clientY - anchorY;

  if (dx <= -24 && dy <= -8) {
    return "letzteentfernen";
  }

  if (dx <= -24 && dy >= 8) {
    return "andere";
  }

  if (dx >= 24 && Math.abs(dy) <= 36) {
    return "arbeitsorganisation";
  }

  if (dy <= -24 && Math.abs(dx) <= 42) {
    return "stoerung";
  }

  if (dy >= 24 && Math.abs(dx) <= 42) {
    return "material";
  }

  return "";
}

function clearUnterrichtWarningPressListeners() {
  window.removeEventListener("pointermove", window.UnterrichtsassistentApp.handleUnterrichtWarningPointerMove);
  window.removeEventListener("pointerup", window.UnterrichtsassistentApp.handleUnterrichtWarningPointerEnd);
  window.removeEventListener("pointercancel", window.UnterrichtsassistentApp.handleUnterrichtWarningPointerEnd);
}

function openUnterrichtWarningRadialMenuImmediately() {
  if (!activeUnterrichtWarningPress || activeUnterrichtWarningPress.menuVisible) {
    return;
  }

  if (activeUnterrichtWarningPress.timerId) {
    window.clearTimeout(activeUnterrichtWarningPress.timerId);
    activeUnterrichtWarningPress.timerId = 0;
  }

  activeUnterrichtWarningPress.menuVisible = true;
  showUnterrichtWarningRadialMenu(activeUnterrichtWarningPress.clientX, activeUnterrichtWarningPress.clientY);
  setUnterrichtWarningRadialSelection("");
}

function ensureUnterrichtAssessmentQuickMenu() {
  if (unterrichtAssessmentQuickMenu && document.body.contains(unterrichtAssessmentQuickMenu)) {
    return unterrichtAssessmentQuickMenu;
  }

  unterrichtAssessmentQuickMenu = document.createElement("div");
  unterrichtAssessmentQuickMenu.className = "unterricht-assessment-quick-menu";
  unterrichtAssessmentQuickMenu.setAttribute("aria-hidden", "true");
  document.body.appendChild(unterrichtAssessmentQuickMenu);
  return unterrichtAssessmentQuickMenu;
}

function ensureUnterrichtAssessmentQuickOverlay() {
  const labels = ["++", "+", "0", "-", "--"];

  if (unterrichtAssessmentQuickOverlay && document.body.contains(unterrichtAssessmentQuickOverlay)) {
    return unterrichtAssessmentQuickOverlay;
  }

  unterrichtAssessmentQuickOverlay = document.createElement("div");
  unterrichtAssessmentQuickOverlay.className = "unterricht-assessment-quick-overlay";
  unterrichtAssessmentQuickOverlay.setAttribute("aria-hidden", "true");
  unterrichtAssessmentQuickOverlay.innerHTML = [
    '<div class="unterricht-assessment-quick-overlay__quality">',
    labels.map(function (label) {
      return '<div class="unterricht-assessment-quick-overlay__band" data-quality-label="' + escapeHtml(label) + '"><span class="unterricht-assessment-quick-overlay__label">' + escapeHtml(label) + "</span></div>";
    }).join(""),
    '</div>',
    '<div class="unterricht-assessment-quick-overlay__afb">',
    '<div class="unterricht-assessment-quick-overlay__afb-band" data-afb-label="1"><span class="unterricht-assessment-quick-overlay__afb-label">AFB 1</span></div>',
    '<div class="unterricht-assessment-quick-overlay__afb-band" data-afb-label="2"><span class="unterricht-assessment-quick-overlay__afb-label">AFB 2</span></div>',
    '<div class="unterricht-assessment-quick-overlay__afb-band" data-afb-label="3"><span class="unterricht-assessment-quick-overlay__afb-label">AFB 3</span></div>',
    '</div>'
  ].join("");
  document.body.appendChild(unterrichtAssessmentQuickOverlay);
  return unterrichtAssessmentQuickOverlay;
}

function hideUnterrichtAssessmentQuickMenu() {
  const menu = ensureUnterrichtAssessmentQuickMenu();
  const overlay = ensureUnterrichtAssessmentQuickOverlay();

  menu.classList.remove("is-visible");
  menu.setAttribute("aria-hidden", "true");
  menu.textContent = "";
  overlay.classList.remove("is-visible");
  overlay.setAttribute("aria-hidden", "true");
  overlay.querySelectorAll("[data-quality-label]").forEach(function (item) {
    item.classList.remove("is-active");
  });
  overlay.querySelectorAll("[data-afb-label]").forEach(function (item) {
    item.classList.remove("is-active");
  });
}

function showUnterrichtAssessmentQuickMenu(clientX, clientY, label) {
  const menu = ensureUnterrichtAssessmentQuickMenu();

  menu.style.left = String(clientX + 16) + "px";
  menu.style.top = String(clientY - 18) + "px";
  menu.textContent = label || "";
  menu.classList.add("is-visible");
  menu.setAttribute("aria-hidden", "false");
}

function showUnterrichtAssessmentQuickOverlay(anchorX, anchorY, qualityValue, afb) {
  const overlay = ensureUnterrichtAssessmentQuickOverlay();
  const activeLabel = formatAssessmentQuickQuality(qualityValue);

  overlay.style.left = String(anchorX) + "px";
  overlay.style.top = String(anchorY) + "px";
  overlay.classList.add("is-visible");
  overlay.setAttribute("aria-hidden", "false");
  overlay.querySelectorAll("[data-quality-label]").forEach(function (item) {
    item.classList.toggle("is-active", item.getAttribute("data-quality-label") === activeLabel);
  });
  overlay.querySelectorAll("[data-afb-label]").forEach(function (item) {
    item.classList.toggle("is-active", item.getAttribute("data-afb-label") === String(afb || 2));
  });
}

function flashUnterrichtAssessmentQuickOverlay() {
  const overlay = ensureUnterrichtAssessmentQuickOverlay();

  overlay.classList.remove("is-flash");
  void overlay.offsetWidth;
  overlay.classList.add("is-flash");

  window.setTimeout(function () {
    overlay.classList.remove("is-flash");
  }, 220);
}

function clearUnterrichtAssessmentPressListeners() {
  window.removeEventListener("pointermove", window.UnterrichtsassistentApp.handleUnterrichtAssessmentPointerMove);
  window.removeEventListener("pointerup", window.UnterrichtsassistentApp.handleUnterrichtAssessmentPointerEnd);
  window.removeEventListener("pointercancel", window.UnterrichtsassistentApp.handleUnterrichtAssessmentPointerEnd);
}

function formatAssessmentQuickQuality(value) {
  return formatAfbQualityLabel(value) || "0";
}

function getUnterrichtAssessmentQuickSelection(clientX, clientY, anchorX, anchorY) {
  const dx = clientX - anchorX;
  const dy = clientY - anchorY;
  const qualityZoneHalf = 30;
  const qualityOuterHalf = 90;
  const qualityMax = 150;
  const qualityTolerance = 120;
  const afbZoneHalf = 39;
  const afbMax = 117;
  const afbTolerance = 120;
  const clampedDx = Math.max(-afbMax, Math.min(afbMax, dx));
  const clampedDy = Math.max(-qualityMax, Math.min(qualityMax, dy));
  let afb = 2;
  let qualityValue = 0;

  if (Math.abs(dy) > qualityMax + qualityTolerance || Math.abs(dx) > afbMax + afbTolerance) {
    return null;
  }

  if (clampedDx < -afbZoneHalf) {
    afb = 1;
  } else if (clampedDx > afbZoneHalf) {
    afb = 3;
  }

  if (clampedDy < -qualityOuterHalf) {
    qualityValue = 2;
  } else if (clampedDy < -qualityZoneHalf) {
    qualityValue = 1;
  } else if (clampedDy > qualityOuterHalf) {
    qualityValue = -2;
  } else if (clampedDy > qualityZoneHalf) {
    qualityValue = -1;
  }

  return {
    afb: afb,
    qualityValue: qualityValue,
    label: "AFB " + String(afb) + " " + formatAssessmentQuickQuality(qualityValue)
  };
}

function openUnterrichtAssessmentQuickMenuImmediately() {
  if (!activeUnterrichtAssessmentPress || activeUnterrichtAssessmentPress.menuVisible) {
    return;
  }

  if (activeUnterrichtAssessmentPress.timerId) {
    window.clearTimeout(activeUnterrichtAssessmentPress.timerId);
    activeUnterrichtAssessmentPress.timerId = 0;
  }

  activeUnterrichtAssessmentPress.menuVisible = true;
  activeUnterrichtAssessmentPress.selection = getUnterrichtAssessmentQuickSelection(
    activeUnterrichtAssessmentPress.clientX,
    activeUnterrichtAssessmentPress.clientY,
    activeUnterrichtAssessmentPress.anchorX,
    activeUnterrichtAssessmentPress.anchorY
  );
  showUnterrichtAssessmentQuickMenu(
    activeUnterrichtAssessmentPress.clientX,
    activeUnterrichtAssessmentPress.clientY,
    activeUnterrichtAssessmentPress.selection.label
  );
  showUnterrichtAssessmentQuickOverlay(
    activeUnterrichtAssessmentPress.anchorX,
    activeUnterrichtAssessmentPress.anchorY,
    activeUnterrichtAssessmentPress.selection.qualityValue,
    activeUnterrichtAssessmentPress.selection.afb
  );
}

function getUnterrichtWarningOtherModal() {
  return document.getElementById("unterrichtWarningOtherModal");
}

function getUnterrichtAssessmentModal() {
  return document.getElementById("unterrichtAssessmentModal");
}

function getUnterrichtAssessmentGridSvg() {
  return document.getElementById("unterrichtAssessmentGridSvg");
}

function getAssessmentGridConfig() {
  return {
    width: 360,
    height: 260,
    marginTop: 18,
    marginRight: 24,
    marginBottom: 44,
    marginLeft: 42,
    afbValues: [1, 2, 3],
    qualityValues: [2, 1, 0, -1, -2],
    activeAfbHalfWidth: 42
  };
}

function getAssessmentGridInnerSize(config) {
  return {
    innerWidth: config.width - config.marginLeft - config.marginRight,
    innerHeight: config.height - config.marginTop - config.marginBottom
  };
}

function appendUnterrichtAssessmentRecord(rawSnapshot, draft, values) {
  const recordedAt = String(values && values.recordedAt || getReferenceDateTimeValue()).trim();

  if (!rawSnapshot || !draft) {
    return;
  }

  rawSnapshot.assessments = Array.isArray(rawSnapshot.assessments) ? rawSnapshot.assessments : [];
  rawSnapshot.assessments.push({
    id: createAssessmentRecordId(),
    studentId: draft.studentId,
    classId: draft.classId,
    type: "unterricht",
    score: 0,
    maxScore: 0,
    date: draft.lessonDate,
    lessonId: draft.lessonId,
    lessonDate: draft.lessonDate,
    room: draft.lessonRoom,
    recordedAt: recordedAt,
    category: String(values && values.category || "").trim(),
    afb1: values && values.afb1 !== undefined ? values.afb1 : "",
    afb2: values && values.afb2 !== undefined ? values.afb2 : "",
    afb3: values && values.afb3 !== undefined ? values.afb3 : "",
    workBehavior: String(values && values.workBehavior || "").trim(),
    socialBehavior: String(values && values.socialBehavior || "").trim(),
    knowledgeGap: String(values && values.knowledgeGap || "").trim(),
    note: String(values && values.note || "").trim()
  });
}

function afbQualityToValue(label) {
  const normalizedLabel = String(label || "").trim();

  if (!normalizedLabel) {
    return null;
  }
  if (normalizedLabel === "2" || normalizedLabel === "++") {
    return 2;
  }
  if (normalizedLabel === "1" || normalizedLabel === "+") {
    return 1;
  }
  if (normalizedLabel === "0") {
    return 0;
  }
  if (normalizedLabel === "-1" || normalizedLabel === "-") {
    return -1;
  }
  if (normalizedLabel === "-2" || normalizedLabel === "--") {
    return -2;
  }
  return null;
}

function formatAfbQualityLabel(value) {
  if (value === 2) {
    return "++";
  }
  if (value === 1) {
    return "+";
  }
  if (value === 0) {
    return "0";
  }
  if (value === -1) {
    return "-";
  }
  if (value === -2) {
    return "--";
  }
  return "";
}

function buildAssessmentSvgElement(tagName, attributes, textContent) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);

  Object.keys(attributes || {}).forEach(function (key) {
    element.setAttribute(key, attributes[key]);
  });

  if (textContent !== undefined && textContent !== null) {
    element.textContent = String(textContent);
  }

  return element;
}

function getAssessmentGridX(afb, config) {
  const inner = getAssessmentGridInnerSize(config);
  const step = inner.innerWidth / (config.afbValues.length - 1);
  return config.marginLeft + ((afb - 1) * step);
}

function getAssessmentGridY(qualityValue, config) {
  const inner = getAssessmentGridInnerSize(config);
  const qualityIndex = config.qualityValues.indexOf(qualityValue);
  const step = inner.innerHeight / (config.qualityValues.length - 1);
  return config.marginTop + (qualityIndex * step);
}

function renderUnterrichtAssessmentGrid() {
  const svg = getUnterrichtAssessmentGridSvg();
  const afb1Input = document.getElementById("unterrichtAssessmentAfb1");
  const afb2Input = document.getElementById("unterrichtAssessmentAfb2");
  const afb3Input = document.getElementById("unterrichtAssessmentAfb3");
  const config = getAssessmentGridConfig();
  const inner = getAssessmentGridInnerSize(config);
  const afbValues = {
    1: afbQualityToValue(String(afb1Input && afb1Input.value || "").trim()),
    2: afbQualityToValue(String(afb2Input && afb2Input.value || "").trim()),
    3: afbQualityToValue(String(afb3Input && afb3Input.value || "").trim())
  };
  let polylinePoints = [];

  if (!svg) {
    return;
  }

  svg.innerHTML = "";

  svg.appendChild(buildAssessmentSvgElement("rect", {
    x: config.marginLeft,
    y: config.marginTop,
    width: inner.innerWidth,
    height: inner.innerHeight,
    rx: 18,
    fill: "rgba(255,255,255,0.9)",
    stroke: "rgba(23, 49, 62, 0.12)"
  }));

  config.qualityValues.forEach(function (qualityValue) {
    const y = getAssessmentGridY(qualityValue, config);
    svg.appendChild(buildAssessmentSvgElement("line", {
      x1: config.marginLeft,
      y1: y,
      x2: config.width - config.marginRight,
      y2: y,
      stroke: qualityValue === 0 ? "#94a3b8" : "#d9e1ee",
      "stroke-width": qualityValue === 0 ? 2 : 1
    }));
    svg.appendChild(buildAssessmentSvgElement("text", {
      x: config.marginLeft - 12,
      y: y + 4,
      "text-anchor": "end",
      "font-size": 13,
      fill: "#334155",
      "font-weight": qualityValue === 0 ? 700 : 500
    }, formatAfbQualityLabel(qualityValue)));
  });

  config.afbValues.forEach(function (afb) {
    const x = getAssessmentGridX(afb, config);
    svg.appendChild(buildAssessmentSvgElement("line", {
      x1: x,
      y1: config.marginTop,
      x2: x,
      y2: config.height - config.marginBottom,
      stroke: "#d9e1ee",
      "stroke-width": 1
    }));
    svg.appendChild(buildAssessmentSvgElement("text", {
      x: x,
      y: config.height - config.marginBottom + 22,
      "text-anchor": "middle",
      "font-size": 14,
      fill: "#334155",
      "font-weight": 700
    }, "AFB " + String(afb)));
  });

  config.afbValues.forEach(function (afb) {
    config.qualityValues.forEach(function (qualityValue) {
      svg.appendChild(buildAssessmentSvgElement("circle", {
        cx: getAssessmentGridX(afb, config),
        cy: getAssessmentGridY(qualityValue, config),
        r: 6,
        fill: "#ffffff",
        stroke: "#94a3b8",
        "stroke-width": 1.5
      }));
    });
  });

  polylinePoints = config.afbValues
    .filter(function (afb) {
      return afbValues[afb] !== null;
    })
    .map(function (afb) {
      return String(getAssessmentGridX(afb, config)) + "," + String(getAssessmentGridY(afbValues[afb], config));
    });

  if (polylinePoints.length > 1) {
    svg.appendChild(buildAssessmentSvgElement("polyline", {
      points: polylinePoints.join(" "),
      fill: "none",
      stroke: "#254c5d",
      "stroke-width": 4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }));
  }

  config.afbValues.forEach(function (afb) {
    const qualityValue = afbValues[afb];

    if (qualityValue === null) {
      return;
    }

    svg.appendChild(buildAssessmentSvgElement("circle", {
      cx: getAssessmentGridX(afb, config),
      cy: getAssessmentGridY(qualityValue, config),
      r: 10,
      fill: "rgba(37, 76, 93, 0.16)",
      stroke: "#254c5d",
      "stroke-width": 2.5
    }));
  });
}

function getUnterrichtAssessmentGridPoint(event) {
  const svg = getUnterrichtAssessmentGridSvg();
  const config = getAssessmentGridConfig();
  const inner = getAssessmentGridInnerSize(config);
  let rect;
  let rawX;
  let rawY;
  let afb = null;
  let qualityIndex;
  let qualityValue;

  if (!svg) {
    return null;
  }

  rect = svg.getBoundingClientRect();
  rawX = ((Number(event.clientX) - rect.left) / rect.width) * config.width;
  rawY = ((Number(event.clientY) - rect.top) / rect.height) * config.height;

  if (rawX < config.marginLeft
    || rawX > (config.width - config.marginRight)
    || rawY < config.marginTop
    || rawY > (config.height - config.marginBottom)) {
    return null;
  }

  config.afbValues.some(function (currentAfb) {
    if (Math.abs(rawX - getAssessmentGridX(currentAfb, config)) <= config.activeAfbHalfWidth) {
      afb = currentAfb;
      return true;
    }

    return false;
  });

  if (afb === null) {
    return null;
  }

  qualityIndex = Math.max(0, Math.min(4, Math.round(((rawY - config.marginTop) / inner.innerHeight) * 4)));
  qualityValue = config.qualityValues[qualityIndex];

  return {
    afb: afb,
    qualityValue: qualityValue
  };
}

function setUnterrichtAssessmentGridValue(afb, qualityValue) {
  const targetInput = document.getElementById("unterrichtAssessmentAfb" + String(afb));

  if (!targetInput) {
    return;
  }

  targetInput.value = String(qualityValue);
}

function syncUnterrichtAssessmentCategoryUi() {
  const hiddenInput = document.getElementById("unterrichtAssessmentCategory");
  const buttons = Array.from(document.querySelectorAll(".assessment-category-button"));
  const selectedCategory = hiddenInput ? String(hiddenInput.value || "").trim() : "";

  buttons.forEach(function (button) {
    const buttonCategory = String(button.getAttribute("data-category") || "").trim();
    const isActive = Boolean(selectedCategory) && buttonCategory === selectedCategory;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function syncUnterrichtAssessmentGradeUi() {
  const workInput = document.getElementById("unterrichtAssessmentWorkBehavior");
  const socialInput = document.getElementById("unterrichtAssessmentSocialBehavior");
  const workValue = workInput ? String(workInput.value || "").trim() : "";
  const socialValue = socialInput ? String(socialInput.value || "").trim() : "";

  Array.from(document.querySelectorAll(".assessment-grade-button")).forEach(function (button) {
    const target = String(button.getAttribute("data-target") || "").trim();
    const value = String(button.getAttribute("data-value") || "").trim();
    const selectedValue = target === "work" ? workValue : socialValue;
    const isActive = Boolean(selectedValue) && selectedValue === value;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function getClassAnalysisRecordByDraft(rawSnapshot, draft) {
  const type = String(draft && draft.recordType || "");
  const recordId = String(draft && draft.recordId || "");
  const collection = type === "assessment"
    ? (rawSnapshot.assessments || [])
    : (type === "attendance"
      ? getAttendanceRecordsCollection(rawSnapshot)
      : (type === "homework"
        ? getHomeworkRecordsCollection(rawSnapshot)
        : (type === "warning" ? getWarningRecordsCollection(rawSnapshot) : [])));

  return collection.find(function (record) {
    return String(record.id || "") === recordId;
  }) || null;
}

function combineDateAndTimeValue(dateValue, timeValue) {
  const normalizedDate = normalizeDateValue(dateValue);
  const normalizedTime = String(timeValue || "").trim();

  if (!normalizedDate || !normalizedTime) {
    return "";
  }

  return normalizedDate + "T" + normalizedTime;
}

function getClassAnalysisAssessmentGridSvg() {
  return document.getElementById("classAnalysisAssessmentGridSvg");
}

function getClassAnalysisAssessmentGridPoint(event) {
  const svg = getClassAnalysisAssessmentGridSvg();
  const config = getAssessmentGridConfig();
  const inner = getAssessmentGridInnerSize(config);
  let rect;
  let rawX;
  let rawY;
  let afb = null;
  let qualityIndex;

  if (!svg) {
    return null;
  }

  rect = svg.getBoundingClientRect();
  rawX = ((Number(event.clientX) - rect.left) / rect.width) * config.width;
  rawY = ((Number(event.clientY) - rect.top) / rect.height) * config.height;

  if (rawX < config.marginLeft
    || rawX > (config.width - config.marginRight)
    || rawY < config.marginTop
    || rawY > (config.height - config.marginBottom)) {
    return null;
  }

  config.afbValues.some(function (currentAfb) {
    if (Math.abs(rawX - getAssessmentGridX(currentAfb, config)) <= config.activeAfbHalfWidth) {
      afb = currentAfb;
      return true;
    }

    return false;
  });

  if (afb === null) {
    return null;
  }

  qualityIndex = Math.max(0, Math.min(4, Math.round(((rawY - config.marginTop) / inner.innerHeight) * 4)));

  return {
    afb: afb,
    qualityValue: config.qualityValues[qualityIndex]
  };
}

function setClassAnalysisAssessmentGridValue(afb, qualityValue) {
  const targetInput = document.getElementById("classAnalysisAssessmentAfb" + String(afb));

  if (targetInput) {
    targetInput.value = String(qualityValue);
  }
}

function renderClassAnalysisAssessmentGrid() {
  const svg = getClassAnalysisAssessmentGridSvg();
  const afb1Input = document.getElementById("classAnalysisAssessmentAfb1");
  const afb2Input = document.getElementById("classAnalysisAssessmentAfb2");
  const afb3Input = document.getElementById("classAnalysisAssessmentAfb3");
  const config = getAssessmentGridConfig();
  const inner = getAssessmentGridInnerSize(config);
  const afbValues = {
    1: afbQualityToValue(String(afb1Input && afb1Input.value || "").trim()),
    2: afbQualityToValue(String(afb2Input && afb2Input.value || "").trim()),
    3: afbQualityToValue(String(afb3Input && afb3Input.value || "").trim())
  };
  let polylinePoints = [];

  if (!svg) {
    return;
  }

  svg.innerHTML = "";
  svg.appendChild(buildAssessmentSvgElement("rect", { x: config.marginLeft, y: config.marginTop, width: inner.innerWidth, height: inner.innerHeight, rx: 18, fill: "rgba(255,255,255,0.9)", stroke: "rgba(23, 49, 62, 0.12)" }));
  config.qualityValues.forEach(function (qualityValue) {
    const y = getAssessmentGridY(qualityValue, config);
    svg.appendChild(buildAssessmentSvgElement("line", { x1: config.marginLeft, y1: y, x2: config.width - config.marginRight, y2: y, stroke: qualityValue === 0 ? "#94a3b8" : "#d9e1ee", "stroke-width": qualityValue === 0 ? 2 : 1 }));
    svg.appendChild(buildAssessmentSvgElement("text", { x: config.marginLeft - 12, y: y + 4, "text-anchor": "end", "font-size": 13, fill: "#334155", "font-weight": qualityValue === 0 ? 700 : 500 }, formatAfbQualityLabel(qualityValue)));
  });
  config.afbValues.forEach(function (afb) {
    const x = getAssessmentGridX(afb, config);
    svg.appendChild(buildAssessmentSvgElement("line", { x1: x, y1: config.marginTop, x2: x, y2: config.height - config.marginBottom, stroke: "#d9e1ee", "stroke-width": 1 }));
    svg.appendChild(buildAssessmentSvgElement("text", { x: x, y: config.height - config.marginBottom + 22, "text-anchor": "middle", "font-size": 14, fill: "#334155", "font-weight": 700 }, "AFB " + String(afb)));
  });
  config.afbValues.forEach(function (afb) {
    config.qualityValues.forEach(function (qualityValue) {
      svg.appendChild(buildAssessmentSvgElement("circle", { cx: getAssessmentGridX(afb, config), cy: getAssessmentGridY(qualityValue, config), r: 6, fill: "#ffffff", stroke: "#94a3b8", "stroke-width": 1.5 }));
    });
  });
  polylinePoints = config.afbValues.filter(function (afb) {
    return afbValues[afb] !== null;
  }).map(function (afb) {
    return String(getAssessmentGridX(afb, config)) + "," + String(getAssessmentGridY(afbValues[afb], config));
  });
  if (polylinePoints.length >= 2) {
    svg.appendChild(buildAssessmentSvgElement("polyline", { points: polylinePoints.join(" "), fill: "none", stroke: "#254c5d", "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: "0.35" }));
  }
  config.afbValues.forEach(function (afb) {
    if (afbValues[afb] === null) {
      return;
    }
    svg.appendChild(buildAssessmentSvgElement("circle", { cx: getAssessmentGridX(afb, config), cy: getAssessmentGridY(afbValues[afb], config), r: 8, fill: "#254c5d", stroke: "#ffffff", "stroke-width": 2.5 }));
  });
}

function syncClassAnalysisAssessmentCategoryUi() {
  const hiddenInput = document.getElementById("classAnalysisAssessmentCategory");
  const selectedCategory = hiddenInput ? String(hiddenInput.value || "").trim() : "";
  Array.from(document.querySelectorAll(".class-analysis-assessment-category-button")).forEach(function (button) {
    button.classList.toggle("is-active", Boolean(selectedCategory) && String(button.getAttribute("data-category") || "").trim() === selectedCategory);
  });
}

function syncClassAnalysisAssessmentGradeUi() {
  const workInput = document.getElementById("classAnalysisAssessmentWorkBehavior");
  const socialInput = document.getElementById("classAnalysisAssessmentSocialBehavior");
  const workValue = workInput ? String(workInput.value || "").trim() : "";
  const socialValue = socialInput ? String(socialInput.value || "").trim() : "";
  Array.from(document.querySelectorAll(".class-analysis-assessment-grade-button")).forEach(function (button) {
    const target = String(button.getAttribute("data-target") || "").trim();
    const value = String(button.getAttribute("data-value") || "").trim();
    button.classList.toggle("is-active", target === "social" ? socialValue === value : workValue === value);
  });
}

function syncClassAnalysisHomeworkUi() {
  const input = document.getElementById("classAnalysisHomeworkQuality");
  const selectedValue = input ? String(input.value || "").trim() : "";
  Array.from(document.querySelectorAll(".class-analysis-homework-button")).forEach(function (button) {
    button.classList.toggle("is-active", String(button.getAttribute("data-quality") || "").trim() === selectedValue);
  });
}

function syncClassAnalysisWarningUi() {
  const input = document.getElementById("classAnalysisWarningCategory");
  const selectedValue = input ? String(input.value || "").trim() : "";
  Array.from(document.querySelectorAll(".class-analysis-warning-button")).forEach(function (button) {
    button.classList.toggle("is-active", String(button.getAttribute("data-category") || "").trim() === selectedValue);
  });
}

function getMinutesBetweenDateTimeValues(leftValue, rightValue) {
  const left = String(leftValue || "").trim();
  const right = String(rightValue || "").trim();
  const leftDate = left ? new Date(left) : null;
  const rightDate = right ? new Date(right) : null;

  if (!left || !right || !leftDate || !rightDate || Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) {
    return Infinity;
  }

  return Math.abs(rightDate.getTime() - leftDate.getTime()) / 60000;
}

function getSecondsBetweenDateTimeValues(leftValue, rightValue) {
  const left = String(leftValue || "").trim();
  const right = String(rightValue || "").trim();
  const leftDate = left ? new Date(left) : null;
  const rightDate = right ? new Date(right) : null;

  if (!left || !right || !leftDate || !rightDate || Number.isNaN(leftDate.getTime()) || Number.isNaN(rightDate.getTime())) {
    return Infinity;
  }

  return Math.abs(rightDate.getTime() - leftDate.getTime()) / 1000;
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
  const seatPlan = currentRawSnapshot ? getEditableSeatPlanForActiveContextFromSnapshot(currentRawSnapshot) : null;
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
  const itemA = getDeskLayoutItemById(items, removedLink.itemAId);
  const itemB = getDeskLayoutItemById(items, removedLink.itemBId);
  const gap = 18;
  const areaA = boundsA ? Math.max(boundsA.maxRight - boundsA.minX, 0) * Math.max(boundsA.maxBottom - boundsA.minY, 0) : 0;
  const areaB = boundsB ? Math.max(boundsB.maxRight - boundsB.minX, 0) * Math.max(boundsB.maxBottom - boundsB.minY, 0) : 0;
  const shouldMoveGroupA = areaA < areaB || (areaA === areaB && groupAIds.length < groupBIds.length);
  const movingGroupIds = shouldMoveGroupA ? groupAIds : groupBIds;
  const movingBounds = shouldMoveGroupA ? boundsA : boundsB;
  const movingItem = shouldMoveGroupA ? itemA : itemB;
  const anchorItem = shouldMoveGroupA ? itemB : itemA;
  const movingFromSide = shouldMoveGroupA
    ? ({ right: "left", left: "right", bottom: "top", top: "bottom" }[removedLink.sideA] || "top")
    : removedLink.sideA;
  const movingItemWidth = Number(movingItem && movingItem.width) || getDeskTemplateMetrics(movingItem && movingItem.type).width;
  const movingItemHeight = Number(movingItem && movingItem.height) || getDeskTemplateMetrics(movingItem && movingItem.type).height;
  const anchorItemWidth = Number(anchorItem && anchorItem.width) || getDeskTemplateMetrics(anchorItem && anchorItem.type).width;
  const anchorItemHeight = Number(anchorItem && anchorItem.height) || getDeskTemplateMetrics(anchorItem && anchorItem.type).height;
  const movingItemLeft = Number(movingItem && movingItem.x) || 0;
  const movingItemTop = Number(movingItem && movingItem.y) || 0;
  const movingItemRight = movingItemLeft + movingItemWidth;
  const movingItemBottom = movingItemTop + movingItemHeight;
  const anchorItemLeft = Number(anchorItem && anchorItem.x) || 0;
  const anchorItemTop = Number(anchorItem && anchorItem.y) || 0;
  const anchorItemRight = anchorItemLeft + anchorItemWidth;
  const anchorItemBottom = anchorItemTop + anchorItemHeight;
  let deltaX = 0;
  let deltaY = 0;

  if (!boundsA || !boundsB || !movingItem || !anchorItem || groupAIds.indexOf(removedLink.itemBId) >= 0 || groupBIds.indexOf(removedLink.itemAId) >= 0) {
    return;
  }

  if (movingFromSide === "right") {
    deltaX = (anchorItemRight + gap) - movingItemLeft;
    deltaX = Math.min(deltaX, Math.max((canvasWidth || 0) - movingBounds.maxRight, 0));
  } else if (movingFromSide === "left") {
    deltaX = (anchorItemLeft - gap) - movingItemRight;
    deltaX = Math.max(deltaX, -(movingBounds.minX));
  } else if (movingFromSide === "bottom") {
    deltaY = (anchorItemBottom + gap) - movingItemTop;
    deltaY = Math.min(deltaY, Math.max((canvasHeight || 0) - movingBounds.maxBottom, 0));
  } else {
    deltaY = (anchorItemTop - gap) - movingItemBottom;
    deltaY = Math.max(deltaY, -(movingBounds.minY));
  }

  if (!deltaX && !deltaY) {
    return;
  }

  seatPlan.deskLayoutItems = items.map(function (item) {
    if (movingGroupIds.indexOf(item.id) === -1) {
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
  const rect = canvas ? canvas.getBoundingClientRect() : null;
  const metrics = getDeskTemplateMetrics(deskType);
  const snapSize = 12;
  const nextItemId = createDeskLayoutItemId();
  let seatPlan;
  let nextItem;
  let linkCandidate;
  let nextX;
  let nextY;
  let nearestFreePosition;

  if (!repository || !schoolService || !currentRawSnapshot || !canvas || !rect) {
    return false;
  }

  seatPlan = getEditableSeatPlanForActiveContextFromSnapshot(currentRawSnapshot, { createIfMissing: true });

  if (!seatPlan) {
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
  const seatPlan = currentRawSnapshot ? getEditableSeatPlanForActiveContextFromSnapshot(currentRawSnapshot) : null;
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
  const seatPlan = currentRawSnapshot ? getEditableSeatPlanForActiveContextFromSnapshot(currentRawSnapshot) : null;
  const currentItems = seatPlan && Array.isArray(seatPlan.deskLayoutItems) ? seatPlan.deskLayoutItems : [];
  const currentLinks = seatPlan && Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];
  const groupIds = getLinkedDeskGroupItemIds(currentItems, currentLinks, itemId);
  const groupItems = currentItems.filter(function (item) {
    return groupIds.indexOf(item.id) >= 0;
  });
  const movingItem = getDeskLayoutItemById(currentItems, itemId);
  const canvas = getDeskLayoutCanvasElement();
  const canvasRect = canvas ? canvas.getBoundingClientRect() : (placement ? placement.canvasRect : null);
  const resolvedDelta = placement && canvasRect
    ? findNearestFreeDeskLayoutGroupDelta(currentItems, groupItems, groupIds, placement.deltaX, placement.deltaY, canvasRect)
    : {
        deltaX: Number(placement && placement.deltaX) || 0,
        deltaY: Number(placement && placement.deltaY) || 0
      };
  const shouldKeepLink = Boolean(
    seatPlanMoveLinkMode
    && placement
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
  const metrics = getDeskTemplateMetrics(deskType);
  const createdItemId = createDeskLayoutItemId();
  const canvas = getDeskLayoutCanvasElement();
  const canvasRect = canvas ? canvas.getBoundingClientRect() : (placement ? placement.canvasRect : null);
  const existingSeatPlan = currentRawSnapshot ? getSeatPlanForActiveContextFromSnapshot(currentRawSnapshot) : null;
  let seatPlan;
  const resolvedPosition = placement && canvasRect
    ? findNearestFreeDeskLayoutItemPosition(
        existingSeatPlan && Array.isArray(existingSeatPlan.deskLayoutItems)
          ? existingSeatPlan.deskLayoutItems
          : [],
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
        x: Number(placement && placement.itemX) || 0,
        y: Number(placement && placement.itemY) || 0
      };
  const shouldKeepLink = Boolean(
    seatPlanMoveLinkMode
    && placement
    && placement.linkCandidate
    && resolvedPosition.x === (Number(placement.itemX) || 0)
    && resolvedPosition.y === (Number(placement.itemY) || 0)
  );

  if (!repository || !schoolService || !currentRawSnapshot || !placement) {
    return false;
  }

  seatPlan = getEditableSeatPlanForActiveContextFromSnapshot(currentRawSnapshot, { createIfMissing: true });

  if (!seatPlan) {
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
  const seatPlan = currentRawSnapshot ? getEditableSeatPlanForActiveContextFromSnapshot(currentRawSnapshot) : null;
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
  seatPlan.seats = (seatPlan.seats || []).filter(function (seat) {
    return groupIds.indexOf(seat.deskItemId) === -1;
  });
  currentRawSnapshot.seatOrders = (currentRawSnapshot.seatOrders || []).map(function (seatOrder) {
    if (seatOrder.classId !== seatPlan.classId || String(seatOrder.room || "") !== String(seatPlan.room || "")) {
      return seatOrder;
    }

    seatOrder.seats = (seatOrder.seats || []).filter(function (seat) {
      return groupIds.indexOf(seat.deskItemId) === -1;
    });

    return seatOrder;
  });
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return true;
}

function setDeskLayoutWindowSide(side) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedSide = ["top", "right", "bottom", "left"].indexOf(side) >= 0 ? side : "";
  let seatPlan;

  if (!repository || !schoolService || !currentRawSnapshot) {
    return false;
  }

  seatPlan = getEditableSeatPlanForActiveContextFromSnapshot(currentRawSnapshot, { createIfMissing: true });

  if (!seatPlan) {
    return false;
  }

  seatPlan.roomWindowSide = normalizedSide;
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
}

function assignStudentToDesk(studentId, deskItemId, slotName) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  let seatPlan = currentRawSnapshot && activeClass
    ? getEditableSeatOrderForActiveContextFromSnapshot(currentRawSnapshot)
    : null;
  const deskLayoutSeatPlan = currentRawSnapshot && activeClass
    ? getSeatPlanFromSnapshotForDateValue(
        currentRawSnapshot,
        activeClass.id,
        getActiveSeatPlanRoomFromSnapshot(currentRawSnapshot, activeClass),
        seatPlan && seatPlan.validFrom ? seatPlan.validFrom : getReferenceDateValue()
      )
    : null;
  const deskItem = deskLayoutSeatPlan ? getDeskLayoutItemById(deskLayoutSeatPlan.deskLayoutItems, deskItemId) : null;
  const validSlots = getDeskSeatSlots(String(deskItem && deskItem.type || ""));
  const normalizedSlot = validSlots.indexOf(slotName) >= 0 ? slotName : (validSlots[0] || "");
  let previousSeat = null;
  let targetSeat = null;
  let nextSeats = null;

  if (!repository || !schoolService || !activeClass || !studentId || !deskItemId) {
    return false;
  }

  if (!deskItem) {
    return false;
  }

  if (["single", "double"].indexOf(String(deskItem.type || "")) === -1 || !normalizedSlot) {
    return false;
  }

  if (!seatPlan) {
    seatPlan = createSeatOrderRecord(activeClass.id, getActiveSeatPlanRoomFromSnapshot(currentRawSnapshot, activeClass));
    getMutableSeatOrdersCollection(currentRawSnapshot).unshift(seatPlan);
  }

  previousSeat = getSeatAssignmentByStudentId(seatPlan, studentId);
  targetSeat = getSeatAssignmentByDeskSlot(seatPlan, deskItemId, normalizedSlot);

  if (previousSeat && isSeatAssignmentLocked(previousSeat) && !(previousSeat.deskItemId === deskItemId && previousSeat.slot === normalizedSlot)) {
    return false;
  }

  if (targetSeat && isSeatAssignmentLocked(targetSeat) && targetSeat.studentId !== studentId) {
    return false;
  }

  nextSeats = (seatPlan.seats || []).filter(function (seat) {
    return seat.studentId !== studentId && !(seat.deskItemId === deskItemId && seat.slot === normalizedSlot);
  });

  nextSeats.push({
    id: previousSeat ? previousSeat.id : createSeatAssignmentId(),
    studentId: studentId,
    deskItemId: deskItemId,
    slot: normalizedSlot,
    isLocked: previousSeat ? Boolean(previousSeat.isLocked) : false
  });

  if (targetSeat && targetSeat.studentId !== studentId && previousSeat && !(previousSeat.deskItemId === deskItemId && previousSeat.slot === normalizedSlot)) {
    nextSeats.push({
      id: targetSeat.id || createSeatAssignmentId(),
      studentId: targetSeat.studentId,
      deskItemId: previousSeat.deskItemId,
      slot: previousSeat.slot,
      isLocked: Boolean(targetSeat.isLocked)
    });
  }

  seatPlan.seats = nextSeats;
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
}

function unassignStudentFromSeat(studentId, forceUnlock) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const seatPlan = currentRawSnapshot && activeClass
    ? getEditableSeatOrderForActiveContextFromSnapshot(currentRawSnapshot)
    : null;
  const currentSeats = seatPlan && Array.isArray(seatPlan.seats) ? seatPlan.seats : [];
  const currentSeat = getSeatAssignmentByStudentId(seatPlan, studentId);

  if (!repository || !schoolService || !seatPlan || !studentId) {
    return false;
  }

  if (currentSeat && isSeatAssignmentLocked(currentSeat) && !forceUnlock) {
    return false;
  }

  seatPlan.seats = currentSeats.filter(function (seat) {
    return seat.studentId !== studentId;
  });

  if (seatPlan.seats.length === currentSeats.length) {
    return false;
  }

  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
}

function resetSeatAssignments() {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const seatPlan = currentRawSnapshot && activeClass
    ? getEditableSeatOrderForActiveContextFromSnapshot(currentRawSnapshot)
    : null;

  if (!repository || !schoolService || !seatPlan) {
    return false;
  }

  seatPlan.seats = [];
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
}

function shuffleSeatAssignments() {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const seatPlan = currentRawSnapshot && activeClass
    ? getEditableSeatOrderForActiveContextFromSnapshot(currentRawSnapshot)
    : null;
  const deskLayoutSeatPlan = currentRawSnapshot && activeClass
    ? getSeatPlanFromSnapshotForDateValue(
        currentRawSnapshot,
        activeClass.id,
        getActiveSeatPlanRoomFromSnapshot(currentRawSnapshot, activeClass),
        seatPlan && seatPlan.validFrom ? seatPlan.validFrom : getReferenceDateValue()
      )
    : null;
  const students = activeClass ? schoolService.getStudentsForClass(activeClass.id).slice() : [];
  let desks = deskLayoutSeatPlan && Array.isArray(deskLayoutSeatPlan.deskLayoutItems)
    ? deskLayoutSeatPlan.deskLayoutItems.filter(function (item) {
        return item && ["single", "double"].indexOf(String(item.type || "")) >= 0;
      }).slice()
    : [];
  let index = 0;
  const lockedSeats = seatPlan && Array.isArray(seatPlan.seats)
    ? seatPlan.seats.filter(function (seat) {
        return seat && seat.isLocked;
      }).map(function (seat) {
        return {
          id: seat.id || createSeatAssignmentId(),
          studentId: String(seat.studentId || "").trim(),
          deskItemId: seat.deskItemId,
          slot: seat.slot,
          isLocked: true
        };
      })
    : [];
  const lockedStudentIds = lockedSeats.filter(function (seat) {
    return seat.studentId;
  }).map(function (seat) {
    return seat.studentId;
  });
  const lockedSlotKeys = lockedSeats.map(function (seat) {
    return seat.deskItemId + "::" + seat.slot;
  });
  let shuffledStudents;

  function shuffleItems(items) {
    let currentIndex = items.length;
    let temporaryValue;
    let randomIndex;

    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = items[currentIndex];
      items[currentIndex] = items[randomIndex];
      items[randomIndex] = temporaryValue;
    }

    return items;
  }

  if (!repository || !schoolService || !seatPlan || !students.length || !desks.length) {
    return false;
  }

  desks = shuffleItems(desks);
  shuffledStudents = shuffleItems(students.filter(function (student) {
    return lockedStudentIds.indexOf(student.id) === -1;
  }));
  seatPlan.seats = lockedSeats.slice();

  index = 0;

  desks.forEach(function (desk) {
    getDeskSeatSlots(String(desk.type || "")).forEach(function (slot) {
      if (lockedSlotKeys.indexOf(desk.id + "::" + slot) >= 0) {
        return;
      }

      if (index < shuffledStudents.length) {
        seatPlan.seats.push({
          id: createSeatAssignmentId(),
          studentId: shuffledStudents[index].id,
          deskItemId: desk.id,
          slot: slot,
          isLocked: false
        });
        index += 1;
      }
    });
  });

  if (!seatPlan.seats.length) {
    return false;
  }

  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
}

function saveDeskLayoutRoomSize(width, height) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  let seatPlan;
  let itemBounds;
  let minWidth;
  let minHeight;
  let nextWidth;
  let nextHeight;

  if (!repository || !schoolService || !currentRawSnapshot) {
    return false;
  }

  seatPlan = getEditableSeatPlanForActiveContextFromSnapshot(currentRawSnapshot, { createIfMissing: true });

  if (!seatPlan) {
    return false;
  }

  itemBounds = getDeskLayoutItemsBounds(seatPlan.deskLayoutItems);
  minWidth = Math.max(360, itemBounds ? Math.ceil(itemBounds.maxRight + 24) : 360);
  minHeight = Math.max(360, itemBounds ? Math.ceil(itemBounds.maxBottom + 24) : 360);
  nextWidth = clampValue(Math.round(Number(width) || 720), minWidth, 1800);
  nextHeight = clampValue(Math.round(Number(height) || 720), minHeight, 1800);

  seatPlan.roomWidth = nextWidth;
  seatPlan.roomHeight = nextHeight;
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return true;
}

function removeSeatAssignmentPreview() {
  if (activeSeatAssignmentDrag && activeSeatAssignmentDrag.previewElement && activeSeatAssignmentDrag.previewElement.parentNode) {
    activeSeatAssignmentDrag.previewElement.parentNode.removeChild(activeSeatAssignmentDrag.previewElement);
  }
}

function clearSeatAssignmentDropTarget() {
  if (activeSeatAssignmentDrag && activeSeatAssignmentDrag.activeTargetElement) {
    activeSeatAssignmentDrag.activeTargetElement.classList.remove("is-seat-drop-target");
  }
}

function getSeatAssignmentDeskTargetFromPoint(clientX, clientY) {
  const targetElement = document.elementFromPoint(clientX, clientY);
  const slotElement = targetElement && typeof targetElement.closest === "function"
    ? targetElement.closest("[data-seat-order-slot]")
    : null;
  const deskElement = slotElement || (targetElement && typeof targetElement.closest === "function"
    ? targetElement.closest("[data-seat-order-desk-id]")
    : null);

  if (!deskElement) {
    return null;
  }

  return {
    deskId: String(deskElement.getAttribute("data-seat-order-desk-id") || ""),
    slot: String(deskElement.getAttribute("data-seat-order-slot") || ""),
    element: deskElement
  };
}

function updateSeatAssignmentPreview(clientX, clientY) {
  if (!activeSeatAssignmentDrag || !activeSeatAssignmentDrag.previewElement) {
    return;
  }

  activeSeatAssignmentDrag.previewElement.style.transform = "translate3d(" + Math.round(clientX) + "px, " + Math.round(clientY) + "px, 0)";
}

function finishSeatAssignmentDrag(options) {
  const settings = options || {};

  clearSeatAssignmentDropTarget();
  removeSeatAssignmentPreview();

  if (activeSeatAssignmentDrag && activeSeatAssignmentDrag.sourceElement && typeof activeSeatAssignmentDrag.sourceElement.releasePointerCapture === "function" && typeof activeSeatAssignmentDrag.pointerId === "number") {
    try {
      activeSeatAssignmentDrag.sourceElement.releasePointerCapture(activeSeatAssignmentDrag.pointerId);
    } catch (error) {
      // ignore
    }
  }

  window.removeEventListener("pointermove", window.UnterrichtsassistentApp.handleSeatAssignmentPointerMove);
  window.removeEventListener("pointerup", window.UnterrichtsassistentApp.handleSeatAssignmentPointerEnd);
  window.removeEventListener("pointercancel", window.UnterrichtsassistentApp.handleSeatAssignmentPointerEnd);
  document.body.classList.remove("is-seat-assignment-dragging");
  activeSeatAssignmentDrag = null;

  if (settings.refreshView && activeViewId === "sitzplan") {
    setActiveView("sitzplan");
  }
}

function initializeSeatPlanSelectionState(rawSnapshot) {
  if (!rawSnapshot) {
    return;
  }

  rawSnapshot.activeSeatPlanId = rawSnapshot.activeSeatPlanId || null;
  rawSnapshot.activeSeatOrderId = rawSnapshot.activeSeatOrderId || null;
  rawSnapshot.activeSeatPlanRoom = String(rawSnapshot.activeSeatPlanRoom || "").trim();
}

function initializeEvaluationSheetSelectionState(rawSnapshot) {
  if (!rawSnapshot) {
    return;
  }

  rawSnapshot.activeEvaluationSheetId = rawSnapshot.activeEvaluationSheetId || null;
}

function getEvaluationSheetsCollection(rawSnapshot) {
  return Array.isArray(rawSnapshot && rawSnapshot.evaluationSheets) ? rawSnapshot.evaluationSheets : [];
}

function getMutableEvaluationSheetsCollection(rawSnapshot) {
  if (!rawSnapshot) {
    return [];
  }

  initializeEvaluationSheetSelectionState(rawSnapshot);

  if (!Array.isArray(rawSnapshot.evaluationSheets)) {
    rawSnapshot.evaluationSheets = [];
  }

  return rawSnapshot.evaluationSheets;
}

function getEvaluationSheetsForClass(rawSnapshot, classId) {
  const normalizedClassId = String(classId || "").trim();

  return getEvaluationSheetsCollection(rawSnapshot).filter(function (item) {
    return String(item && item.classId || "").trim() === normalizedClassId;
  }).slice().sort(function (left, right) {
    const leftCreatedAt = String(left && left.createdAt || "").trim();
    const rightCreatedAt = String(right && right.createdAt || "").trim();

    if (leftCreatedAt === rightCreatedAt) {
      return String(left && left.title || "").localeCompare(String(right && right.title || ""), "de-DE");
    }

    return rightCreatedAt.localeCompare(leftCreatedAt);
  });
}

function getActiveEvaluationSheetForSnapshot(rawSnapshot, activeClass) {
  const currentClass = activeClass || (schoolService ? schoolService.getActiveClass() : null);
  const items = currentClass ? getEvaluationSheetsForClass(rawSnapshot, currentClass.id) : [];
  const activeSheetId = String(rawSnapshot && rawSnapshot.activeEvaluationSheetId || "").trim();

  return items.find(function (item) {
    return String(item && item.id || "").trim() === activeSheetId;
  }) || items[0] || null;
}

function getPlannedEvaluationsCollection(rawSnapshot) {
  return Array.isArray(rawSnapshot && rawSnapshot.plannedEvaluations) ? rawSnapshot.plannedEvaluations : [];
}

function getMutablePlannedEvaluationsCollection(rawSnapshot) {
  if (!rawSnapshot) {
    return [];
  }

  if (!Array.isArray(rawSnapshot.plannedEvaluations)) {
    rawSnapshot.plannedEvaluations = [];
  }

  return rawSnapshot.plannedEvaluations;
}

function getPerformedEvaluationsCollection(rawSnapshot) {
  return Array.isArray(rawSnapshot && rawSnapshot.performedEvaluations) ? rawSnapshot.performedEvaluations : [];
}

function getMutablePerformedEvaluationsCollection(rawSnapshot) {
  if (!rawSnapshot) {
    return [];
  }

  if (!Array.isArray(rawSnapshot.performedEvaluations)) {
    rawSnapshot.performedEvaluations = [];
  }

  return rawSnapshot.performedEvaluations;
}

function getPlannedEvaluationsForClass(rawSnapshot, classId) {
  const normalizedClassId = String(classId || "").trim();

  return getPlannedEvaluationsCollection(rawSnapshot).filter(function (item) {
    return String(item && item.classId || "").trim() === normalizedClassId;
  }).slice().sort(function (left, right) {
    const leftDate = String(left && left.date || "").slice(0, 10);
    const rightDate = String(right && right.date || "").slice(0, 10);
    const leftCreatedAt = String(left && left.createdAt || "").trim();
    const rightCreatedAt = String(right && right.createdAt || "").trim();

    if (leftDate === rightDate) {
      return rightCreatedAt.localeCompare(leftCreatedAt);
    }

    return rightDate.localeCompare(leftDate);
  });
}

function getPerformedEvaluationForStudent(rawSnapshot, plannedEvaluationId, studentId) {
  const normalizedPlannedEvaluationId = String(plannedEvaluationId || "").trim();
  const normalizedStudentId = String(studentId || "").trim();

  if (!normalizedPlannedEvaluationId || !normalizedStudentId) {
    return null;
  }

  return getPerformedEvaluationsCollection(rawSnapshot).find(function (item) {
    return String(item && item.plannedEvaluationId || "").trim() === normalizedPlannedEvaluationId
      && String(item && item.studentId || "").trim() === normalizedStudentId;
  }) || null;
}

function normalizePlannedEvaluationStudentIds(studentIds, activeClass) {
  const allowedStudentIds = activeClass && schoolService && typeof schoolService.getStudentsForClass === "function"
    ? schoolService.getStudentsForClass(activeClass.id).map(function (student) {
        return String(student && student.id || "").trim();
      }).filter(Boolean)
    : [];
  const allowedLookup = allowedStudentIds.reduce(function (lookup, studentId) {
    lookup[studentId] = true;
    return lookup;
  }, {});
  const uniqueLookup = {};

  return (Array.isArray(studentIds) ? studentIds : []).map(function (studentId) {
    return String(studentId || "").trim();
  }).filter(function (studentId) {
    if (!studentId || uniqueLookup[studentId]) {
      return false;
    }

    if (allowedStudentIds.length && !allowedLookup[studentId]) {
      return false;
    }

    uniqueLookup[studentId] = true;
    return true;
  });
}

function normalizePlannedEvaluationGradingSystem(items) {
  return (Array.isArray(items) ? items : []).map(function (entry) {
    const source = entry && typeof entry === "object" ? entry : {};

    return {
      id: String(source.id || createPlannedEvaluationGradingStageId()).trim(),
      label: String(source.label || "").trim(),
      minPercent: Math.max(0, Math.min(100, Number.isFinite(Number(source.minPercent)) ? Number(source.minPercent) : 0))
    };
  }).filter(function (entry) {
    return Boolean(entry.id);
  }).sort(function (left, right) {
    if (Number(left.minPercent) === Number(right.minPercent)) {
      return String(left.label || "").localeCompare(String(right.label || ""), "de-DE");
    }

    return Number(right.minPercent) - Number(left.minPercent);
  });
}

function getSelectedPlannedEvaluationFromSnapshot(rawSnapshot) {
  const normalizedPlannedEvaluationId = String(activePerformedPlannedEvaluationId || "").trim();

  if (!normalizedPlannedEvaluationId) {
    return null;
  }

  return getPlannedEvaluationsCollection(rawSnapshot).find(function (item) {
    return String(item && item.id || "").trim() === normalizedPlannedEvaluationId;
  }) || null;
}

function getPlannedEvaluationStageLabel(gradingSystem, percentValue) {
  const normalizedPercent = Math.max(0, Number.isFinite(Number(percentValue)) ? Number(percentValue) : 0);
  const orderedStages = normalizePlannedEvaluationGradingSystem(gradingSystem);
  const matchingStage = orderedStages.find(function (entry) {
    return normalizedPercent >= Number(entry.minPercent);
  }) || null;

  return matchingStage ? String(matchingStage.label || "").trim() : "";
}

function formatPerformedEvaluationPointsLabel(value) {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const roundedValue = Math.round(numericValue * 2) / 2;

  if (Math.abs(roundedValue - Math.round(roundedValue)) < 0.001) {
    return String(Math.round(roundedValue));
  }

  return roundedValue.toFixed(1).replace(".", ",");
}

function formatPerformedEvaluationDateLabel(dateValue) {
  const normalizedDate = String(dateValue || "").slice(0, 10);
  const parts = normalizedDate.split("-");

  if (parts.length !== 3) {
    return normalizedDate;
  }

  return String(parts[2] || "").padStart(2, "0") + "." + String(parts[1] || "").padStart(2, "0") + "." + String(parts[0] || "");
}

function getTaskSheetTasksForSheet(evaluationSheet) {
  return evaluationSheet && evaluationSheet.taskSheet && Array.isArray(evaluationSheet.taskSheet.tasks)
    ? evaluationSheet.taskSheet.tasks.filter(function (task) {
        return task && typeof task === "object";
      })
    : [];
}

function getSubtasksForTaskSheetTask(task) {
  return task && Array.isArray(task.subtasks) ? task.subtasks.filter(Boolean) : [];
}

function getEvaluationSheetBeValue(item) {
  return Math.max(0, Number.isFinite(Number(item && item.be)) ? Number(item.be) : 0);
}

function getPerformedEvaluationFeedbackItems(subtaskResult, detailType) {
  const normalizedType = String(detailType || "").trim().toLowerCase();
  const sourceItems = normalizedType === "negative"
    ? (subtaskResult && Array.isArray(subtaskResult.negativeFeedback) ? subtaskResult.negativeFeedback : [])
    : (subtaskResult && Array.isArray(subtaskResult.positiveFeedback) ? subtaskResult.positiveFeedback : []);

  return sourceItems.map(function (entry) {
    return String(entry || "").trim();
  }).filter(Boolean);
}

function buildPerformedEvaluationFeedbackSummary(items) {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];

  if (!values.length) {
    return "";
  }

  if (values.length <= 2) {
    return values.join(", ");
  }

  return values.slice(0, 2).join(", ") + " +" + String(values.length - 2);
}

function buildPerformedEvaluationSummary(plannedEvaluation, evaluationSheet, performedEvaluation) {
  const tasks = getTaskSheetTasksForSheet(evaluationSheet);
  const subtaskLookup = performedEvaluation && Array.isArray(performedEvaluation.subtaskResults)
    ? performedEvaluation.subtaskResults.reduce(function (lookup, entry) {
        const subtaskId = String(entry && entry.subtaskId || "").trim();

        if (subtaskId) {
          lookup[subtaskId] = entry;
        }

        return lookup;
      }, {})
    : {};
  const taskSummaries = tasks.map(function (task) {
    const subtasks = getSubtasksForTaskSheetTask(task);
    const achieved = subtasks.reduce(function (sum, subtask) {
      const result = subtaskLookup[String(subtask && subtask.id || "").trim()] || null;
      return sum + Math.max(0, Number(result && result.points) || 0);
    }, 0);
    const reachable = subtasks.reduce(function (sum, subtask) {
      return sum + getEvaluationSheetBeValue(subtask);
    }, 0);

    return {
      taskId: String(task && task.id || "").trim(),
      achieved: achieved,
      reachable: reachable
    };
  });
  const totalAchieved = taskSummaries.reduce(function (sum, entry) {
    return sum + entry.achieved;
  }, 0);
  const totalReachable = taskSummaries.reduce(function (sum, entry) {
    return sum + entry.reachable;
  }, 0);
  const percent = totalReachable > 0
    ? (totalAchieved / totalReachable) * 100
    : 0;

  return {
    taskSummaries: taskSummaries,
    totalAchieved: totalAchieved,
    totalReachable: totalReachable,
    percent: percent,
    stageLabel: getPlannedEvaluationStageLabel(plannedEvaluation && plannedEvaluation.gradingSystem, percent)
  };
}

function buildClassAnalysisPerformedEvaluationModalMarkup() {
  const currentRawSnapshot = schoolService && serializeSnapshot ? serializeSnapshot(schoolService.snapshot) : null;
  const plannedEvaluationId = String(activeClassAnalysisPerformedEvaluationDraft && activeClassAnalysisPerformedEvaluationDraft.plannedEvaluationId || "").trim();
  const studentId = String(activeClassAnalysisPerformedEvaluationDraft && activeClassAnalysisPerformedEvaluationDraft.studentId || "").trim();
  const plannedEvaluation = currentRawSnapshot
    ? getPlannedEvaluationsCollection(currentRawSnapshot).find(function (entry) {
        return String(entry && entry.id || "").trim() === plannedEvaluationId;
      }) || null
    : null;
  const evaluationSheet = currentRawSnapshot && plannedEvaluation
    ? getEvaluationSheetsCollection(currentRawSnapshot).find(function (entry) {
        return String(entry && entry.id || "").trim() === String(plannedEvaluation && plannedEvaluation.evaluationSheetId || "").trim();
      }) || null
    : null;
  const performedEvaluation = currentRawSnapshot
    ? getPerformedEvaluationsCollection(currentRawSnapshot).find(function (entry) {
        return String(entry && entry.plannedEvaluationId || "").trim() === plannedEvaluationId
          && String(entry && entry.studentId || "").trim() === studentId
          && Boolean(entry && entry.isCompleted);
      }) || null
    : null;
  const student = schoolService && plannedEvaluation && typeof schoolService.getStudentsForClass === "function"
    ? schoolService.getStudentsForClass(String(plannedEvaluation.classId || "").trim()).find(function (entry) {
        return String(entry && entry.id || "").trim() === studentId;
      }) || null
    : null;
  const summary = plannedEvaluation && evaluationSheet && performedEvaluation
    ? buildPerformedEvaluationSummary(plannedEvaluation, evaluationSheet, performedEvaluation)
    : null;
  const subtaskLookup = performedEvaluation && Array.isArray(performedEvaluation.subtaskResults)
    ? performedEvaluation.subtaskResults.reduce(function (lookup, entry) {
        const subtaskId = String(entry && entry.subtaskId || "").trim();

        if (subtaskId) {
          lookup[subtaskId] = entry;
        }

        return lookup;
      }, {})
    : {};

  if (!plannedEvaluation || !evaluationSheet || !performedEvaluation || !student) {
    return "";
  }

  return [
    '<div class="import-modal import-modal--class-analysis-performed is-open" id="classAnalysisPerformedEvaluationRuntimeModal">',
    '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeClassAnalysisPerformedEvaluationModal()"></div>',
    '<div class="import-modal__dialog import-modal__dialog--performed-feedback class-analysis-performed-evaluation-modal" role="dialog" aria-modal="true">',
    '<div class="import-modal__header">',
    '<div>',
    '<h3>Leistungsbewertung</h3>',
    '<div class="import-modal__meta">', escapeHtml(String(student && student.firstName || "").trim() || "Ohne Namen"), ' | ', escapeHtml(String(evaluationSheet && evaluationSheet.title || "").trim() || "Bewertung"), '</div>',
    '</div>',
    '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closeClassAnalysisPerformedEvaluationModal()">x</button>',
    '</div>',
    '<div class="class-analysis-performed-evaluation">',
    '<div class="class-analysis-performed-evaluation__meta">',
    '<span>', escapeHtml(String(plannedEvaluation && plannedEvaluation.type || "").trim() === "schriftliche" ? "Schriftliche" : "Sonstige"), '</span>',
    '<span>', escapeHtml(formatPerformedEvaluationDateLabel(plannedEvaluation && plannedEvaluation.date)), '</span>',
    summary && summary.stageLabel ? '<strong>' + escapeHtml(summary.stageLabel) + '</strong>' : '',
    '<button class="bewertung-planung-modal__sheet-link" type="button" title="In Bewertung oeffnen" aria-label="In Bewertung oeffnen" onclick="return window.UnterrichtsassistentApp.openPerformedEvaluationFromClassAnalysis()">&#8599;</button>',
    '</div>',
    '<div class="bewertung-durchfuehrung__compact-list">',
    getTaskSheetTasksForSheet(evaluationSheet).map(function (task, taskIndex) {
      const taskSummary = summary && Array.isArray(summary.taskSummaries)
        ? summary.taskSummaries.find(function (entry) {
            return String(entry && entry.taskId || "").trim() === String(task && task.id || "").trim();
          }) || null
        : null;

      return [
        '<div class="bewertung-durchfuehrung__compact-task-row">',
        '<span class="bewertung-durchfuehrung__compact-task-title">Aufgabe ', escapeHtml(String(taskIndex + 1)), ': ', escapeHtml(String(task && task.title || "").trim() || "Ohne Titel"), '</span>',
        '<span class="bewertung-durchfuehrung__compact-task-score">', escapeHtml(formatPerformedEvaluationPointsLabel(taskSummary ? taskSummary.achieved : 0)), ' / ', escapeHtml(formatPerformedEvaluationPointsLabel(taskSummary ? taskSummary.reachable : 0)), '</span>',
        '</div>',
        getSubtasksForTaskSheetTask(task).map(function (subtask) {
          const subtaskId = String(subtask && subtask.id || "").trim();
          const subtaskResult = subtaskLookup[subtaskId] || null;
          const negativeItems = getPerformedEvaluationFeedbackItems(subtaskResult, "negative");
          const positiveItems = getPerformedEvaluationFeedbackItems(subtaskResult, "positive");
          const noteValue = String(subtaskResult && subtaskResult.generalNote || "").trim();

          return [
            '<div class="bewertung-durchfuehrung__compact-subtask-row">',
            '<span class="bewertung-durchfuehrung__compact-subtask-title">', escapeHtml(String(subtask && subtask.title || "").trim() || "Ohne Titel"), '</span>',
            '<span class="bewertung-durchfuehrung__compact-subtask-notes">',
            negativeItems.length ? '<span class="bewertung-durchfuehrung__compact-note"><strong>N:</strong> ' + escapeHtml(buildPerformedEvaluationFeedbackSummary(negativeItems)) + '</span>' : '',
            positiveItems.length ? '<span class="bewertung-durchfuehrung__compact-note"><strong>P:</strong> ' + escapeHtml(buildPerformedEvaluationFeedbackSummary(positiveItems)) + '</span>' : '',
            noteValue ? '<span class="bewertung-durchfuehrung__compact-note"><strong>Notiz:</strong> ' + escapeHtml(noteValue) + '</span>' : '',
            '</span>',
            '<span class="bewertung-durchfuehrung__compact-subtask-score">', escapeHtml(formatPerformedEvaluationPointsLabel(subtaskResult ? Number(subtaskResult.points) || 0 : 0)), ' / ', escapeHtml(formatPerformedEvaluationPointsLabel(getEvaluationSheetBeValue(subtask))), '</span>',
            '</div>'
          ].join("");
        }).join("")
      ].join("");
    }).join(""),
    '</div>',
    '<div class="bewertung-durchfuehrung__overall-score">', escapeHtml(formatPerformedEvaluationPointsLabel(summary ? summary.totalAchieved : 0)), ' / ', escapeHtml(formatPerformedEvaluationPointsLabel(summary ? summary.totalReachable : 0)), ' <span>(', escapeHtml(summary ? summary.percent.toFixed(1).replace(".", ",") : "0,0"), '%)</span></div>',
    '<div class="bewertung-durchfuehrung__overall-stage">', escapeHtml(String(summary && summary.stageLabel || "").trim() || "Keine Bewertungsstufe"), '</div>',
    '<div class="bewertung-durchfuehrung__overall-note"><span>Anmerkung zur gesamten Bewertung</span><div>', escapeHtml(String(performedEvaluation && performedEvaluation.overallNote || "").trim() || "Keine"), '</div></div>',
    '</div>',
    '</div>',
    '</div>'
  ].join("");
}

function renderClassAnalysisPerformedEvaluationModal() {
  const root = getClassAnalysisPerformedEvaluationModalRoot();
  const markup = isClassAnalysisPerformedEvaluationModalOpen
    ? buildClassAnalysisPerformedEvaluationModalMarkup()
    : "";

  if (root) {
    root.innerHTML = markup;
  }
}

function normalizeEvaluationSheetCurriculumAssignments(rawSnapshot, evaluationSheet) {
  const snapshot = rawSnapshot || {};
  const sheet = evaluationSheet || {};
  const classId = String(sheet && sheet.classId || "").trim();
  const seriesItems = getOrderedCurriculumSeriesForClass(snapshot, classId);
  const collections = getCurriculumCollections(snapshot);
  const sequenceItems = collections.sequences || [];
  const lessonItems = collections.lessons || [];
  const explicitLessonIds = {};
  const explicitEmptySequenceIds = {};
  const explicitEmptySeriesIds = {};
  const assignedSequenceIds = {};
  const assignedSeriesIds = {};

  (Array.isArray(sheet.curriculumLessonIds) ? sheet.curriculumLessonIds : []).forEach(function (lessonId) {
    const normalizedId = String(lessonId || "").trim();

    if (normalizedId) {
      explicitLessonIds[normalizedId] = true;
    }
  });

  (Array.isArray(sheet.curriculumSequenceIds) ? sheet.curriculumSequenceIds : []).forEach(function (sequenceId) {
    const normalizedId = String(sequenceId || "").trim();

    if (normalizedId && !getOrderedCurriculumLessonsForSequence(snapshot, normalizedId).length) {
      explicitEmptySequenceIds[normalizedId] = true;
    }
  });

  (Array.isArray(sheet.curriculumSeriesIds) ? sheet.curriculumSeriesIds : []).forEach(function (seriesId) {
    const normalizedId = String(seriesId || "").trim();

    if (normalizedId && !getOrderedCurriculumSequencesForSeries(snapshot, normalizedId).length) {
      explicitEmptySeriesIds[normalizedId] = true;
    }
  });

  sequenceItems.forEach(function (sequenceItem) {
    const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
    const lessons = getOrderedCurriculumLessonsForSequence(snapshot, sequenceId);
    const hasAssignedLesson = lessons.some(function (lessonItem) {
      return Boolean(explicitLessonIds[String(lessonItem && lessonItem.id || "").trim()]);
    });

    if ((lessons.length && hasAssignedLesson) || (!lessons.length && explicitEmptySequenceIds[sequenceId])) {
      assignedSequenceIds[sequenceId] = true;
    }
  });

  seriesItems.forEach(function (seriesItem) {
    const seriesId = String(seriesItem && seriesItem.id || "").trim();
    const sequences = getOrderedCurriculumSequencesForSeries(snapshot, seriesId);
    const hasAssignedSequence = sequences.some(function (sequenceItem) {
      return Boolean(assignedSequenceIds[String(sequenceItem && sequenceItem.id || "").trim()]);
    });

    if ((sequences.length && hasAssignedSequence) || (!sequences.length && explicitEmptySeriesIds[seriesId])) {
      assignedSeriesIds[seriesId] = true;
    }
  });

  sheet.curriculumLessonIds = lessonItems.filter(function (lessonItem) {
    return Boolean(explicitLessonIds[String(lessonItem && lessonItem.id || "").trim()]);
  }).map(function (lessonItem) {
    return String(lessonItem && lessonItem.id || "").trim();
  });
  sheet.curriculumSequenceIds = sequenceItems.filter(function (sequenceItem) {
    return Boolean(assignedSequenceIds[String(sequenceItem && sequenceItem.id || "").trim()]);
  }).map(function (sequenceItem) {
    return String(sequenceItem && sequenceItem.id || "").trim();
  });
  sheet.curriculumSeriesIds = seriesItems.filter(function (seriesItem) {
    return Boolean(assignedSeriesIds[String(seriesItem && seriesItem.id || "").trim()]);
  }).map(function (seriesItem) {
    return String(seriesItem && seriesItem.id || "").trim();
  });

  return {
    lessonIdsLookup: explicitLessonIds,
    emptySequenceIdsLookup: explicitEmptySequenceIds,
    emptySeriesIdsLookup: explicitEmptySeriesIds,
    sequenceIdsLookup: assignedSequenceIds,
    seriesIdsLookup: assignedSeriesIds
  };
}

function getEvaluationSheetTopicSuggestions(rawSnapshot, evaluationSheet, inputValue) {
  const snapshot = rawSnapshot || {};
  const sheet = evaluationSheet || {};
  const assignmentState = normalizeEvaluationSheetCurriculumAssignments(snapshot, sheet);
  const currentValue = String(inputValue || "");
  const currentToken = currentValue.split(",").slice(-1)[0];
  const normalizedPrefix = String(currentToken || "").trim().toLowerCase();
  const seenByKey = {};
  const orderedSuggestions = [];
  const orderedSeries = getOrderedCurriculumSeriesForClass(snapshot, String(sheet.classId || "").trim());

  function addTopicValue(rawTopicValue, labelPrefix) {
    String(rawTopicValue || "").split(",").map(function (entry) {
      return String(entry || "").trim();
    }).filter(Boolean).forEach(function (topicValue) {
      const normalizedKey = topicValue.toLowerCase();
      const prefix = String(labelPrefix || "");

      if (normalizedPrefix && normalizedKey.indexOf(normalizedPrefix) === -1) {
        return;
      }

      if (!Object.prototype.hasOwnProperty.call(seenByKey, normalizedKey)) {
        seenByKey[normalizedKey] = {
          value: topicValue,
          label: prefix + topicValue,
          count: 0
        };
        orderedSuggestions.push(seenByKey[normalizedKey]);
      }

      seenByKey[normalizedKey].count += 1;
    });
  }

  orderedSeries.forEach(function (seriesItem) {
    const seriesId = String(seriesItem && seriesItem.id || "").trim();
    const orderedSequences = getOrderedCurriculumSequencesForSeries(snapshot, seriesId);

    if (assignmentState.seriesIdsLookup[seriesId]) {
      addTopicValue(seriesItem && seriesItem.topic, "");
    }

    orderedSequences.forEach(function (sequenceItem) {
      const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
      const orderedLessons = getOrderedCurriculumLessonsForSequence(snapshot, sequenceId);

      if (assignmentState.sequenceIdsLookup[sequenceId]) {
        addTopicValue(sequenceItem && sequenceItem.topic, "> ");
      }

      orderedLessons.forEach(function (lessonItem) {
        const lessonId = String(lessonItem && lessonItem.id || "").trim();

        if (assignmentState.lessonIdsLookup[lessonId]) {
          addTopicValue(lessonItem && lessonItem.topic, ">> ");
        }
      });
    });
  });

  return orderedSuggestions;
}

function getSeatPlansCollection(rawSnapshot) {
  return Array.isArray(rawSnapshot && rawSnapshot.seatPlans) ? rawSnapshot.seatPlans : [];
}

function getMutableSeatPlansCollection(rawSnapshot) {
  if (!rawSnapshot) {
    return [];
  }

  initializeSeatPlanSelectionState(rawSnapshot);

  if (!Array.isArray(rawSnapshot.seatPlans)) {
    rawSnapshot.seatPlans = [];
  }

  return rawSnapshot.seatPlans;
}

function getSeatOrdersCollection(rawSnapshot) {
  return Array.isArray(rawSnapshot && rawSnapshot.seatOrders) ? rawSnapshot.seatOrders : [];
}

function getMutableSeatOrdersCollection(rawSnapshot) {
  if (!rawSnapshot) {
    return [];
  }

  initializeSeatPlanSelectionState(rawSnapshot);

  if (!Array.isArray(rawSnapshot.seatOrders)) {
    rawSnapshot.seatOrders = [];
  }

  return rawSnapshot.seatOrders;
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

function createEvaluationSheetRecord(classId, typeValue, titleValue) {
  const normalizedType = String(typeValue || "").trim().toLowerCase() === "kompetenzraster"
    ? "kompetenzraster"
    : "aufgabenbogen";

  return {
    id: createEvaluationSheetId(),
    classId: String(classId || "").trim(),
    type: normalizedType,
    title: String(titleValue || "").trim(),
    createdAt: getCurrentTimestamp(),
    workingTimeMinutes: 0,
    curriculumSeriesIds: [],
    curriculumSequenceIds: [],
    curriculumLessonIds: [],
    taskSheet: normalizedType === "aufgabenbogen" ? { tasks: [] } : { tasks: [] },
    competencyGrid: normalizedType === "kompetenzraster" ? {} : {}
  };
}

function createPlannedEvaluationRecord(classId, typeValue, evaluationSheetId, dateValue, studentIds) {
  return {
    id: createPlannedEvaluationId(),
    classId: String(classId || "").trim(),
    type: String(typeValue || "").trim().toLowerCase() === "schriftliche"
      ? "schriftliche"
      : "sonstige",
    evaluationSheetId: String(evaluationSheetId || "").trim(),
    date: String(dateValue || "").slice(0, 10),
    studentIds: Array.isArray(studentIds) ? studentIds.slice() : [],
    createPlanningEvent: true,
    planningEventId: "",
    gradingSystem: [],
    createdAt: getCurrentTimestamp()
  };
}

function getControllerViewLabel(viewName) {
  const normalizedViewName = String(viewName || "").trim().toLowerCase();

  if (normalizedViewName === "bewertung") {
    return "Bewertung";
  }

  return String(viewName || "").trim();
}

function getPlanningEventTimeForClassDate(classId, dateValue) {
  const normalizedClassId = String(classId || "").trim();
  const normalizedDateValue = String(dateValue || "").slice(0, 10);
  const parts = normalizedDateValue.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  let lessonUnits = [];

  if (!schoolService || typeof schoolService.getLessonUnitsForClass !== "function" || !normalizedClassId || parts.length !== 3) {
    return {
      startTime: "",
      endTime: ""
    };
  }

  lessonUnits = schoolService.getLessonUnitsForClass(normalizedClassId, new Date(year, month - 1, day)).slice().sort(function (left, right) {
    const leftStart = String(left && left.startTime || "").trim();
    const rightStart = String(right && right.startTime || "").trim();
    return leftStart.localeCompare(rightStart);
  });

  return lessonUnits.length
    ? {
        startTime: String(lessonUnits[0] && lessonUnits[0].startTime || "").trim(),
        endTime: String(lessonUnits[0] && lessonUnits[0].endTime || "").trim()
      }
    : {
        startTime: "",
        endTime: ""
      };
}

function getPlanningCategoryNameForClass(currentRawSnapshot, classId) {
  const normalizedClassId = String(classId || "").trim();
  const classEntry = Array.isArray(currentRawSnapshot && currentRawSnapshot.classes)
    ? currentRawSnapshot.classes.find(function (item) {
        return String(item && item.id || "").trim() === normalizedClassId;
      }) || null
    : null;

  return getClassDisplayName(classEntry);
}

function buildPlannedEvaluationPlanningEventPayload(currentRawSnapshot, plannedEvaluation) {
  const normalizedClassId = String(plannedEvaluation && plannedEvaluation.classId || "").trim();
  const normalizedDateValue = String(plannedEvaluation && plannedEvaluation.date || "").slice(0, 10);
  const evaluationSheetId = String(plannedEvaluation && plannedEvaluation.evaluationSheetId || "").trim();
  const evaluationSheet = Array.isArray(currentRawSnapshot && currentRawSnapshot.evaluationSheets)
    ? currentRawSnapshot.evaluationSheets.find(function (item) {
        return String(item && item.id || "").trim() === evaluationSheetId;
      }) || null
    : null;
  const classEntry = Array.isArray(currentRawSnapshot && currentRawSnapshot.classes)
    ? currentRawSnapshot.classes.find(function (item) {
        return String(item && item.id || "").trim() === normalizedClassId;
      }) || null
    : null;
  const timeRange = getPlanningEventTimeForClassDate(normalizedClassId, normalizedDateValue);
  const sheetTitle = String(evaluationSheet && evaluationSheet.title || "").trim();
  const classLabel = [String(classEntry && classEntry.name || "").trim(), String(classEntry && classEntry.subject || "").trim()].filter(Boolean).join(" ");
  const categoryName = getPlanningCategoryNameForClass(currentRawSnapshot, normalizedClassId);

  return {
    title: sheetTitle || "Bewertung",
    startDate: normalizedDateValue,
    endDate: normalizedDateValue,
    startTime: timeRange.startTime,
    endTime: timeRange.endTime,
    category: categoryName || "Bewertung",
    description: [sheetTitle ? "Bewertungsbogen: " + sheetTitle : "", classLabel ? "Lerngruppe: " + classLabel : ""].filter(Boolean).join("\n"),
    priority: 2,
    showInTimetable: false,
    causesInstructionOutage: false,
    isRecurring: false,
    recurrenceInterval: 1,
    recurrenceUnit: "weeks",
    recurrenceUntilDate: "",
    recurrenceMonthlyWeekday: false,
    isExternallyControlled: true,
    controlledByView: "Bewertung",
    controlledById: String(plannedEvaluation && plannedEvaluation.id || "").trim()
  };
}

function repairPlannedEvaluationPlanningEvents(currentRawSnapshot) {
  const collections = currentRawSnapshot ? getPlanningCollections(currentRawSnapshot) : null;
  const plannedEvaluations = getPlannedEvaluationsCollection(currentRawSnapshot);
  let hasChanges = false;

  if (!currentRawSnapshot || !collections || !plannedEvaluations.length) {
    return false;
  }

  plannedEvaluations.forEach(function (plannedEvaluation) {
    const previousPlanningEventId = String(plannedEvaluation && plannedEvaluation.planningEventId || "").trim();
    const previousPlanningEvent = previousPlanningEventId
      ? collections.events.find(function (entry) {
          return String(entry && entry.id || "").trim() === previousPlanningEventId;
        }) || null
      : null;
    const previousSnapshot = previousPlanningEvent
      ? JSON.stringify({
          title: String(previousPlanningEvent.title || "").trim(),
          startDate: String(previousPlanningEvent.startDate || "").slice(0, 10),
          endDate: String(previousPlanningEvent.endDate || "").slice(0, 10),
          startTime: String(previousPlanningEvent.startTime || "").trim(),
          endTime: String(previousPlanningEvent.endTime || "").trim(),
          category: String(previousPlanningEvent.category || "").trim(),
          description: String(previousPlanningEvent.description || "").trim(),
          priority: Number(previousPlanningEvent.priority) || 0,
          showInTimetable: Boolean(previousPlanningEvent.showInTimetable),
          causesInstructionOutage: Boolean(previousPlanningEvent.causesInstructionOutage),
          isRecurring: Boolean(previousPlanningEvent.isRecurring),
          recurrenceInterval: normalizePlanningEventRecurrenceInterval(previousPlanningEvent.recurrenceInterval),
          recurrenceUnit: normalizePlanningEventRecurrenceUnit(previousPlanningEvent.recurrenceUnit),
          recurrenceUntilDate: normalizePlanningEventRecurrenceUntilDate(previousPlanningEvent.recurrenceUntilDate),
          recurrenceMonthlyWeekday: Boolean(previousPlanningEvent.recurrenceMonthlyWeekday),
          isExternallyControlled: Boolean(previousPlanningEvent.isExternallyControlled),
          controlledByView: String(previousPlanningEvent.controlledByView || "").trim(),
          controlledById: String(previousPlanningEvent.controlledById || "").trim()
        })
      : "";

    syncPlanningEventForPlannedEvaluation(currentRawSnapshot, plannedEvaluation);

    if (String(plannedEvaluation && plannedEvaluation.planningEventId || "").trim() !== previousPlanningEventId) {
      hasChanges = true;
      return;
    }

    if (!previousPlanningEventId) {
      return;
    }

    if (!previousSnapshot) {
      hasChanges = true;
      return;
    }

    const nextPlanningEvent = collections.events.find(function (entry) {
      return String(entry && entry.id || "").trim() === previousPlanningEventId;
    }) || null;
    const nextSnapshot = nextPlanningEvent
      ? JSON.stringify({
          title: String(nextPlanningEvent.title || "").trim(),
          startDate: String(nextPlanningEvent.startDate || "").slice(0, 10),
          endDate: String(nextPlanningEvent.endDate || "").slice(0, 10),
          startTime: String(nextPlanningEvent.startTime || "").trim(),
          endTime: String(nextPlanningEvent.endTime || "").trim(),
          category: String(nextPlanningEvent.category || "").trim(),
          description: String(nextPlanningEvent.description || "").trim(),
          priority: Number(nextPlanningEvent.priority) || 0,
          showInTimetable: Boolean(nextPlanningEvent.showInTimetable),
          causesInstructionOutage: Boolean(nextPlanningEvent.causesInstructionOutage),
          isRecurring: Boolean(nextPlanningEvent.isRecurring),
          recurrenceInterval: normalizePlanningEventRecurrenceInterval(nextPlanningEvent.recurrenceInterval),
          recurrenceUnit: normalizePlanningEventRecurrenceUnit(nextPlanningEvent.recurrenceUnit),
          recurrenceUntilDate: normalizePlanningEventRecurrenceUntilDate(nextPlanningEvent.recurrenceUntilDate),
          recurrenceMonthlyWeekday: Boolean(nextPlanningEvent.recurrenceMonthlyWeekday),
          isExternallyControlled: Boolean(nextPlanningEvent.isExternallyControlled),
          controlledByView: String(nextPlanningEvent.controlledByView || "").trim(),
          controlledById: String(nextPlanningEvent.controlledById || "").trim()
        })
      : "";

    if (nextSnapshot !== previousSnapshot) {
      hasChanges = true;
    }
  });

  return hasChanges;
}

function syncPlanningEventForPlannedEvaluation(currentRawSnapshot, plannedEvaluation) {
  const collections = currentRawSnapshot ? getPlanningCollections(currentRawSnapshot) : null;
  const shouldCreatePlanningEvent = Boolean(plannedEvaluation && plannedEvaluation.createPlanningEvent);
  const normalizedPlanningEventId = String(plannedEvaluation && plannedEvaluation.planningEventId || "").trim();
  let planningEvent = null;
  let payload = null;

  if (!currentRawSnapshot || !collections || !plannedEvaluation) {
    return;
  }

  if (!shouldCreatePlanningEvent) {
    if (normalizedPlanningEventId) {
      collections.events = collections.events.filter(function (entry) {
        return String(entry && entry.id || "").trim() !== normalizedPlanningEventId;
      });
      currentRawSnapshot.planningEvents = collections.events;

      if (String(selectedPlanningEventId || "").trim() === normalizedPlanningEventId) {
        selectedPlanningEventId = "";
        selectedPlanningEventOccurrenceId = "";
        selectedPlanningEventOccurrenceRange = null;
      }
      if (activePlanningEventDraft && String(activePlanningEventDraft.id || "").trim() === normalizedPlanningEventId) {
        activePlanningEventDraft = null;
      }
    }

    plannedEvaluation.planningEventId = "";
    return;
  }

  payload = buildPlannedEvaluationPlanningEventPayload(currentRawSnapshot, plannedEvaluation);
  planningEvent = normalizedPlanningEventId
    ? collections.events.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedPlanningEventId;
      }) || null
    : null;

  if (!planningEvent) {
    planningEvent = Object.assign({
      id: createPlanningEventId()
    }, payload);
    collections.events.push(planningEvent);
    currentRawSnapshot.planningEvents = collections.events;
    plannedEvaluation.planningEventId = String(planningEvent.id || "").trim();
    return;
  }

  planningEvent.title = payload.title;
  planningEvent.startDate = payload.startDate;
  planningEvent.endDate = payload.endDate;
  planningEvent.startTime = payload.startTime;
  planningEvent.endTime = payload.endTime;
  planningEvent.category = payload.category;
  planningEvent.description = payload.description;
  planningEvent.priority = payload.priority;
  planningEvent.showInTimetable = false;
  planningEvent.causesInstructionOutage = false;
  planningEvent.isRecurring = false;
  planningEvent.recurrenceInterval = 1;
  planningEvent.recurrenceUnit = "weeks";
  planningEvent.recurrenceUntilDate = "";
  planningEvent.recurrenceMonthlyWeekday = false;
  planningEvent.isExternallyControlled = true;
  planningEvent.controlledByView = payload.controlledByView;
  planningEvent.controlledById = payload.controlledById;
}

function createPerformedEvaluationRecord(plannedEvaluation, studentId) {
  const plannedEvaluationId = String(plannedEvaluation && plannedEvaluation.id || "").trim();
  const classId = String(plannedEvaluation && plannedEvaluation.classId || "").trim();
  const evaluationSheetId = String(plannedEvaluation && plannedEvaluation.evaluationSheetId || "").trim();

  return {
    id: createPerformedEvaluationId(),
    plannedEvaluationId: plannedEvaluationId,
    classId: classId,
    studentId: String(studentId || "").trim(),
    evaluationSheetId: evaluationSheetId,
    subtaskResults: [],
    overallNote: "",
    isCompleted: false,
    completedAt: "",
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  };
}

function normalizePerformedEvaluationText(value) {
  return String(value || "").trim();
}

function normalizePerformedEvaluationFeedbackList(items) {
  const seen = {};

  return (Array.isArray(items) ? items : []).map(function (entry) {
    return String(entry || "").trim();
  }).filter(function (entry) {
    const key = entry.toLowerCase();

    if (!entry || seen[key]) {
      return false;
    }

    seen[key] = true;
    return true;
  });
}

function getPerformedEvaluationFeedbackSuggestionGroups(filterValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedPlannedEvaluationId = String(activePerformedPlannedEvaluationId || "").trim();
  const normalizedStudentId = String(activePerformedEvaluationStudentId || "").trim();
  const modal = activePerformedEvaluationDetailModal;
  const normalizedSubtaskId = String(modal && modal.subtaskId || "").trim();
  const normalizedType = String(modal && modal.detailType || "").trim().toLowerCase();
  const normalizedFilter = String(filterValue || "").trim().toLowerCase();
  const fieldName = normalizedType === "positive" ? "positiveNotes" : "negativeNotes";
  const primaryCounts = {};
  const secondaryCounts = {};
  const tertiaryCounts = {};
  const plannedEvaluationLookup = getPlannedEvaluationsCollection(currentRawSnapshot).reduce(function (lookup, item) {
    const itemId = String(item && item.id || "").trim();

    if (itemId) {
      lookup[itemId] = item;
    }

    return lookup;
  }, {});
  const evaluationSheetLookup = getEvaluationSheetsCollection(currentRawSnapshot).reduce(function (lookup, item) {
    const itemId = String(item && item.id || "").trim();

    if (itemId) {
      lookup[itemId] = item;
    }

    return lookup;
  }, {});

  if (!currentRawSnapshot || !normalizedPlannedEvaluationId || !normalizedSubtaskId || ["negative", "positive"].indexOf(normalizedType) === -1) {
    return { primary: [], secondary: [], tertiary: [] };
  }

  getPerformedEvaluationsCollection(currentRawSnapshot).forEach(function (evaluationEntry) {
    const entryPlannedEvaluationId = String(evaluationEntry && evaluationEntry.plannedEvaluationId || "").trim();
    const samePlannedEvaluation = entryPlannedEvaluationId === normalizedPlannedEvaluationId;
    const entryPlannedEvaluation = plannedEvaluationLookup[entryPlannedEvaluationId] || null;
    const entryEvaluationSheet = entryPlannedEvaluation
      ? evaluationSheetLookup[String(entryPlannedEvaluation && entryPlannedEvaluation.evaluationSheetId || "").trim()] || null
      : null;
    const isOtherTaskSheetEvaluation = !samePlannedEvaluation
      && String(entryEvaluationSheet && entryEvaluationSheet.type || "").trim() === "aufgabenbogen";
    const studentId = String(evaluationEntry && evaluationEntry.studentId || "").trim();
    const subtaskResults = Array.isArray(evaluationEntry && evaluationEntry.subtaskResults)
      ? evaluationEntry.subtaskResults
      : [];

    if (!samePlannedEvaluation && !isOtherTaskSheetEvaluation) {
      return;
    }

    subtaskResults.forEach(function (subtaskResult) {
      const resultSubtaskId = String(subtaskResult && subtaskResult.subtaskId || "").trim();
      const items = subtaskResult && Array.isArray(subtaskResult[fieldName]) ? subtaskResult[fieldName] : [];

      items.forEach(function (item) {
        const normalizedItem = String(item || "").trim();
        const lookupKey = normalizedItem.toLowerCase();

        if (!normalizedItem || (normalizedFilter && lookupKey.indexOf(normalizedFilter) === -1)) {
          return;
        }

        if (resultSubtaskId === normalizedSubtaskId && studentId !== normalizedStudentId) {
          primaryCounts[lookupKey] = primaryCounts[lookupKey] || { value: normalizedItem, count: 0 };
          primaryCounts[lookupKey].count += 1;
          return;
        }

        if (samePlannedEvaluation && resultSubtaskId !== normalizedSubtaskId) {
          secondaryCounts[lookupKey] = secondaryCounts[lookupKey] || { value: normalizedItem, count: 0 };
          secondaryCounts[lookupKey].count += 1;
          return;
        }

        if (isOtherTaskSheetEvaluation) {
          tertiaryCounts[lookupKey] = tertiaryCounts[lookupKey] || { value: normalizedItem, count: 0 };
          tertiaryCounts[lookupKey].count += 1;
        }
      });
    });
  });

  function toSortedItems(sourceMap, excludedLookup) {
    return Object.keys(sourceMap).map(function (key) {
      return sourceMap[key];
    }).filter(function (entry) {
      return !excludedLookup[String(entry && entry.value || "").toLowerCase()];
    }).sort(function (left, right) {
      if (left.count === right.count) {
        return String(left.value || "").localeCompare(String(right.value || ""), "de-DE");
      }

      return right.count - left.count;
    });
  }

  return {
    primary: toSortedItems(primaryCounts, {}),
    secondary: toSortedItems(secondaryCounts, Object.keys(primaryCounts).reduce(function (lookup, key) {
      lookup[key] = true;
      return lookup;
    }, {})),
    tertiary: toSortedItems(tertiaryCounts, Object.keys(primaryCounts).concat(Object.keys(secondaryCounts)).reduce(function (lookup, key) {
      lookup[key] = true;
      return lookup;
    }, {}))
  };
}

function renderPerformedEvaluationFeedbackSuggestions(inputId, listId) {
  const input = inputId ? document.getElementById(inputId) : null;
  const list = listId ? document.getElementById(listId) : null;
  const suggestionGroups = getPerformedEvaluationFeedbackSuggestionGroups(input && input.value);
  const primarySuggestions = suggestionGroups.primary;
  const secondarySuggestions = suggestionGroups.secondary;
  const tertiarySuggestions = suggestionGroups.tertiary;

  function renderSuggestionButton(entry) {
    return '<button class="knowledge-gap-suggestion" type="button" data-value="' + escapeEvaluationTopicSuggestionHtml(entry.value) + '" onclick="return window.UnterrichtsassistentApp.selectPerformedEvaluationFeedbackSuggestion(this.dataset.value, \'' + escapeEvaluationTopicSuggestionHtml(inputId) + '\', \'' + escapeEvaluationTopicSuggestionHtml(listId) + '\')"><span class="knowledge-gap-suggestion__label">' + escapeEvaluationTopicSuggestionHtml(entry.value) + '</span><span class="knowledge-gap-suggestion__count">(' + escapeEvaluationTopicSuggestionHtml(String(entry.count)) + ')</span></button>';
  }

  if (!input || !list) {
    return false;
  }

  if (!primarySuggestions.length && !secondarySuggestions.length && !tertiarySuggestions.length) {
    list.hidden = true;
    list.innerHTML = "";
    return false;
  }

  list.innerHTML = [
    primarySuggestions.length ? [
      '<div class="performed-feedback-suggestions__section">',
      '<div class="performed-feedback-suggestions__title">Gleiche Teilaufgabe</div>',
      primarySuggestions.map(renderSuggestionButton).join(""),
      '</div>'
    ].join("") : '',
    primarySuggestions.length && secondarySuggestions.length ? '<div class="performed-feedback-suggestions__divider"></div>' : '',
    secondarySuggestions.length ? [
      '<div class="performed-feedback-suggestions__section">',
      '<div class="performed-feedback-suggestions__title">Andere Teilaufgaben</div>',
      secondarySuggestions.map(renderSuggestionButton).join(""),
      '</div>'
    ].join("") : '',
    (primarySuggestions.length || secondarySuggestions.length) && tertiarySuggestions.length ? '<div class="performed-feedback-suggestions__divider"></div>' : '',
    tertiarySuggestions.length ? [
      '<div class="performed-feedback-suggestions__section">',
      '<div class="performed-feedback-suggestions__title">Andere geplante Bewertungen</div>',
      tertiarySuggestions.map(renderSuggestionButton).join(""),
      '</div>'
    ].join("") : ''
  ].join("");
  list.hidden = false;
  return false;
}

function normalizePerformedEvaluationPoints(value, maxValue) {
  const normalizedMax = Math.max(0, Number.isFinite(Number(maxValue)) ? Number(maxValue) : 0);
  const normalizedValue = String(value || "").trim().replace(",", ".");
  let nextValue = 0;

  if (!normalizedValue) {
    return 0;
  }

  nextValue = Number.isFinite(Number(normalizedValue)) ? Number(normalizedValue) : 0;
  nextValue = Math.round(Math.max(0, nextValue) * 2) / 2;

  return Math.min(normalizedMax, nextValue);
}

function normalizeEvaluationWorkingTimeMinutes(value) {
  return Math.max(0, Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0);
}

function parseEvaluationWorkingTimeInputs(dayValue, hourValue, minuteValue) {
  const days = Math.max(0, Number.isFinite(Number(dayValue)) ? Math.floor(Number(dayValue)) : 0);
  const hours = Math.max(0, Number.isFinite(Number(hourValue)) ? Math.floor(Number(hourValue)) : 0);
  const minutes = Math.max(0, Number.isFinite(Number(minuteValue)) ? Math.floor(Number(minuteValue)) : 0);

  return (days * 24 * 60) + (hours * 60) + minutes;
}

function normalizeEvaluationTaskSheet(rawTaskSheet) {
  const source = rawTaskSheet && typeof rawTaskSheet === "object" ? rawTaskSheet : {};
  const tasks = Array.isArray(source.tasks) ? source.tasks : [];

  return {
    tasks: tasks.map(function (task) {
      const taskSource = task && typeof task === "object" ? task : {};
      const subtasks = Array.isArray(taskSource.subtasks) ? taskSource.subtasks : [];

      return {
        id: String(taskSource.id || createEvaluationTaskId()).trim(),
        title: String(taskSource.title || "").trim(),
        subtasks: subtasks.map(function (subtask) {
          const subtaskSource = subtask && typeof subtask === "object" ? subtask : {};

          return {
            id: String(subtaskSource.id || createEvaluationSubtaskId()).trim(),
            title: String(subtaskSource.title || "").trim(),
            topics: String(subtaskSource.topics || "").trim(),
            afb: ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(String(subtaskSource.afb || "").trim().toLowerCase()) >= 0
              ? String(subtaskSource.afb || "").trim().toLowerCase()
              : "afb1",
            be: Math.max(0, Number.isFinite(Number(subtaskSource.be)) ? Math.round(Number(subtaskSource.be)) : 0)
          };
        })
      };
    })
  };
}

function getMutableEvaluationTaskSheet(evaluationSheet) {
  if (!evaluationSheet || typeof evaluationSheet !== "object") {
    return { tasks: [] };
  }

  evaluationSheet.taskSheet = normalizeEvaluationTaskSheet(evaluationSheet.taskSheet);
  return evaluationSheet.taskSheet;
}

function createEvaluationTaskRecord() {
  return {
    id: createEvaluationTaskId(),
    title: "",
    subtasks: []
  };
}

function createEvaluationSubtaskRecord() {
  return {
    id: createEvaluationSubtaskId(),
    title: "",
    topics: "",
    afb: "afb1",
    be: 0
  };
}

function getEvaluationTaskById(taskSheet, taskId) {
  return Array.isArray(taskSheet && taskSheet.tasks)
    ? taskSheet.tasks.find(function (task) {
        return String(task && task.id || "").trim() === String(taskId || "").trim();
      }) || null
    : null;
}

function getEvaluationSubtaskById(task, subtaskId) {
  return Array.isArray(task && task.subtasks)
    ? task.subtasks.find(function (subtask) {
        return String(subtask && subtask.id || "").trim() === String(subtaskId || "").trim();
      }) || null
    : null;
}

function cloneEvaluationSheetAttributes(sheet) {
  const source = sheet && typeof sheet === "object" ? sheet : {};

  return {
    curriculumSeriesIds: Array.isArray(source.curriculumSeriesIds) ? source.curriculumSeriesIds.slice() : [],
    curriculumSequenceIds: Array.isArray(source.curriculumSequenceIds) ? source.curriculumSequenceIds.slice() : [],
    curriculumLessonIds: Array.isArray(source.curriculumLessonIds) ? source.curriculumLessonIds.slice() : [],
    workingTimeMinutes: normalizeEvaluationWorkingTimeMinutes(source.workingTimeMinutes),
    taskSheet: source.taskSheet && typeof source.taskSheet === "object"
      ? JSON.parse(JSON.stringify(source.taskSheet))
      : {},
    competencyGrid: source.competencyGrid && typeof source.competencyGrid === "object"
      ? JSON.parse(JSON.stringify(source.competencyGrid))
      : {}
  };
}

function createSeatOrderRecord(classId, roomValue) {
  return {
    id: createSeatAssignmentId() + "-order",
    classId: classId,
    room: String(roomValue || "").trim(),
    validFrom: getTodayDateValue(),
    validTo: "",
    updatedAt: getCurrentTimestamp(),
    seats: []
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

function getSeatPlanFromSnapshotForDateValue(rawSnapshot, classId, roomValue, dateValue) {
  const todayValue = String(dateValue || getReferenceDateValue()).slice(0, 10);
  const seatPlans = getSeatPlansCollection(rawSnapshot).filter(function (seatPlan) {
    return seatPlan.classId === classId && String(seatPlan.room || "") === String(roomValue || "");
  });
  const matchingSeatPlans = seatPlans
    .filter(function (seatPlan) {
      const matchesClass = seatPlan.classId === classId;
      const matchesRoom = String(seatPlan.room || "") === String(roomValue || "");
      const startsBefore = !seatPlan.validFrom || compareDateValues(seatPlan.validFrom, todayValue) <= 0;
      const endsAfter = !seatPlan.validTo || compareDateValues(seatPlan.validTo, todayValue) >= 0;

      return matchesClass && matchesRoom && startsBefore && endsAfter;
    })
    .sort(function (left, right) {
      return compareDateValues(right.validFrom, left.validFrom);
    });
  const futureSeatPlans = seatPlans.filter(function (seatPlan) {
    return seatPlan.validFrom && compareDateValues(seatPlan.validFrom, todayValue) > 0;
  }).sort(function (left, right) {
    return compareDateValues(left.validFrom, right.validFrom);
  });
  const pastSeatPlans = seatPlans.filter(function (seatPlan) {
    return seatPlan.validTo && compareDateValues(seatPlan.validTo, todayValue) < 0;
  }).sort(function (left, right) {
    return compareDateValues(right.validTo, left.validTo);
  });

  return matchingSeatPlans[0] || futureSeatPlans[0] || pastSeatPlans[0] || seatPlans[0] || null;
}

function getCurrentSeatPlanFromSnapshot(rawSnapshot, classId, roomValue) {
  return getSeatPlanFromSnapshotForDateValue(rawSnapshot, classId, roomValue, getReferenceDateValue());
}

function getCurrentSeatOrderFromSnapshot(rawSnapshot, classId, roomValue) {
  const todayValue = getReferenceDateValue();
  const seatOrders = getSeatOrdersCollection(rawSnapshot).filter(function (seatOrder) {
    return seatOrder.classId === classId && String(seatOrder.room || "") === String(roomValue || "");
  });
  const matchingSeatOrders = seatOrders.filter(function (seatOrder) {
    const startsBefore = !seatOrder.validFrom || compareDateValues(seatOrder.validFrom, todayValue) <= 0;
    const endsAfter = !seatOrder.validTo || compareDateValues(seatOrder.validTo, todayValue) >= 0;

    return startsBefore && endsAfter;
  }).sort(function (left, right) {
    return compareDateValues(right.validFrom, left.validFrom);
  });
  const futureSeatOrders = seatOrders.filter(function (seatOrder) {
    return seatOrder.validFrom && compareDateValues(seatOrder.validFrom, todayValue) > 0;
  }).sort(function (left, right) {
    return compareDateValues(left.validFrom, right.validFrom);
  });
  const pastSeatOrders = seatOrders.filter(function (seatOrder) {
    return seatOrder.validTo && compareDateValues(seatOrder.validTo, todayValue) < 0;
  }).sort(function (left, right) {
    return compareDateValues(right.validTo, left.validTo);
  });

  return matchingSeatOrders[0] || futureSeatOrders[0] || pastSeatOrders[0] || seatOrders[0] || null;
}

function getOrCreateSeatPlanForActiveClass(rawSnapshot) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  let activeRoom;
  let availableSeatPlans;
  let seatPlan;

  if (!activeClass) {
    return null;
  }

  activeRoom = getActiveSeatPlanRoomFromSnapshot(rawSnapshot, activeClass);
  availableSeatPlans = getMutableSeatPlansCollection(rawSnapshot).filter(function (currentSeatPlan) {
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

function getOrCreateSeatOrderForActiveClass(rawSnapshot) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  let activeRoom;
  let availableSeatOrders;
  let seatOrder;

  if (!activeClass) {
    return null;
  }

  activeRoom = getActiveSeatPlanRoomFromSnapshot(rawSnapshot, activeClass);
  availableSeatOrders = getMutableSeatOrdersCollection(rawSnapshot).filter(function (currentSeatOrder) {
    return currentSeatOrder.classId === activeClass.id && String(currentSeatOrder.room || "") === String(activeRoom || "");
  });
  seatOrder = availableSeatOrders.find(function (item) {
    return item.id === rawSnapshot.activeSeatOrderId;
  });

  if (!seatOrder) {
    seatOrder = getCurrentSeatOrderFromSnapshot(rawSnapshot, activeClass.id, activeRoom);
  }

  if (!seatOrder) {
    seatOrder = availableSeatOrders[0] || null;
  }

  if (!seatOrder) {
    seatOrder = createSeatOrderRecord(activeClass.id, activeRoom);
    rawSnapshot.seatOrders.unshift(seatOrder);
  }

  rawSnapshot.activeSeatOrderId = seatOrder.id;
  rawSnapshot.activeSeatPlanRoom = activeRoom;
  return seatOrder;
}

function getCurrentSeatPlanForActiveContextFromSnapshot(rawSnapshot) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const activeRoom = activeClass ? getActiveSeatPlanRoomFromSnapshot(rawSnapshot, activeClass) : "";

  if (!rawSnapshot || !activeClass) {
    return null;
  }

  return getCurrentSeatPlanFromSnapshot(rawSnapshot, activeClass.id, activeRoom);
}

function getSeatPlanForActiveContextFromSnapshot(rawSnapshot) {
  if (!rawSnapshot) {
    return null;
  }

  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const activeRoom = activeClass ? getActiveSeatPlanRoomFromSnapshot(rawSnapshot, activeClass) : "";
  const availableSeatPlans = activeClass
    ? getSeatPlansCollection(rawSnapshot).filter(function (seatPlan) {
        return seatPlan.classId === activeClass.id && String(seatPlan.room || "") === String(activeRoom || "");
      })
    : [];
  const activeSeatPlan = availableSeatPlans.find(function (seatPlan) {
    return seatPlan.id === rawSnapshot.activeSeatPlanId;
  });

  if (!activeClass) {
    return null;
  }

  return activeSeatPlan || getCurrentSeatPlanFromSnapshot(rawSnapshot, activeClass.id, activeRoom) || availableSeatPlans[0] || null;
}

function getEditableSeatPlanForActiveContextFromSnapshot(rawSnapshot, options) {
  if (!rawSnapshot) {
    return null;
  }

  if (options && options.createIfMissing) {
    return getOrCreateSeatPlanForActiveClass(rawSnapshot);
  }

  return getSeatPlanForActiveContextFromSnapshot(rawSnapshot);
}

function getSeatOrderForActiveContextFromSnapshot(rawSnapshot) {
  if (!rawSnapshot) {
    return null;
  }

  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const activeRoom = activeClass ? getActiveSeatPlanRoomFromSnapshot(rawSnapshot, activeClass) : "";
  const availableSeatOrders = activeClass
    ? getSeatOrdersCollection(rawSnapshot).filter(function (seatOrder) {
        return seatOrder.classId === activeClass.id && String(seatOrder.room || "") === String(activeRoom || "");
      })
    : [];
  const activeSeatOrder = availableSeatOrders.find(function (seatOrder) {
    return seatOrder.id === rawSnapshot.activeSeatOrderId;
  });

  if (!activeClass) {
    return null;
  }

  return activeSeatOrder || getCurrentSeatOrderFromSnapshot(rawSnapshot, activeClass.id, activeRoom) || availableSeatOrders[0] || null;
}

function getEditableSeatOrderForActiveContextFromSnapshot(rawSnapshot, options) {
  if (!rawSnapshot) {
    return null;
  }

  if (options && options.createIfMissing) {
    return getOrCreateSeatOrderForActiveClass(rawSnapshot);
  }

  return getSeatOrderForActiveContextFromSnapshot(rawSnapshot);
}

function syncManagedTimetableToCurrent(targetViewId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const currentTimetable = schoolService ? schoolService.getCurrentTimetable(schoolService.getReferenceDate()) : null;

  if (!repository || !schoolService || !currentRawSnapshot || !currentTimetable) {
    if (activeViewId === "stundenplan") {
      setActiveView(targetViewId || "stundenplan");
    }
    return false;
  }

  currentRawSnapshot.activeTimetableId = currentTimetable.id || null;
  refreshSnapshotInMemory(currentRawSnapshot, targetViewId || "stundenplan");
  return false;
}

function syncManagedSeatPlanToCurrent(targetViewId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const activeRoom = activeClass ? getActiveSeatPlanRoom(activeClass) : "";
  const currentSeatPlan = schoolService && activeClass
    ? schoolService.getCurrentSeatPlan(activeClass.id, activeRoom, schoolService.getReferenceDate())
    : null;
  const currentSeatOrder = schoolService && activeClass
    ? schoolService.getCurrentSeatOrder(activeClass.id, activeRoom, schoolService.getReferenceDate())
    : null;

  if (!repository || !schoolService || !currentRawSnapshot || !activeClass) {
    if (activeViewId === "sitzplan") {
      setActiveView(targetViewId || "sitzplan");
    }
    return false;
  }

  currentRawSnapshot.activeSeatPlanRoom = activeRoom;
  currentRawSnapshot.activeSeatPlanId = currentSeatPlan ? currentSeatPlan.id : null;
  currentRawSnapshot.activeSeatOrderId = currentSeatOrder ? currentSeatOrder.id : null;
  refreshSnapshotInMemory(currentRawSnapshot, targetViewId || "sitzplan");
  return false;
}

window.UnterrichtsassistentApp = window.UnterrichtsassistentApp || {};
window.UnterrichtsassistentApp.activateView = setActiveView;
window.UnterrichtsassistentApp.toggleMenu = toggleMenu;
window.UnterrichtsassistentApp.collapseMenu = collapseMenu;
window.UnterrichtsassistentApp.toggleCollapsedClassPicker = toggleCollapsedClassPicker;
window.UnterrichtsassistentApp.getClassDisplayColor = getClassDisplayColor;
window.UnterrichtsassistentApp.getPlanningCategoryColor = function (categoryName) {
  return getPlanningCategoryColor(getMutableRawSnapshot(), categoryName);
};
window.UnterrichtsassistentApp.getPlanningCategoryDefinitions = function () {
  return getPlanningCategoryDefinitions(getMutableRawSnapshot());
};
window.UnterrichtsassistentApp.getPlanningEventsForDisplay = function (snapshot, options) {
  return getPlanningEventsForDisplay(snapshot || getMutableRawSnapshot(), options);
};
window.UnterrichtsassistentApp.getPlanningInstructionOutageInfo = function (classId, lessonDate, lessonStartTime, lessonEndTime, snapshot) {
  return getPlanningInstructionOutageInfo(snapshot || getMutableRawSnapshot(), classId, lessonDate, lessonStartTime, lessonEndTime);
};
window.UnterrichtsassistentApp.getActiveTodoDraft = function () {
  return activeTodoDraft;
};
window.UnterrichtsassistentApp.getExpandedTodoIds = function () {
  return expandedTodoIds.slice();
};
window.UnterrichtsassistentApp.getTodoStatusFilter = function () {
  return todoStatusFilter;
};
window.UnterrichtsassistentApp.getTodoViewMode = function () {
  return todoViewMode;
};
window.UnterrichtsassistentApp.getTodoSortMode = function () {
  return todoSortMode;
};
window.UnterrichtsassistentApp.isTodoStudentAssignmentOpen = function () {
  return todoStudentAssignmentOpen;
};
window.UnterrichtsassistentApp.getActiveDateTimeParts = function () {
  return Object.assign({}, getActiveDateTimeParts());
};
window.UnterrichtsassistentApp.isTodoCategoryFilterOpen = function () {
  return todoCategoryFilterOpen === true;
};
window.UnterrichtsassistentApp.getTodoCategoryFilters = function () {
  return todoCategoryFilters.slice();
};
window.UnterrichtsassistentApp.isTodoCategoryFilterAllOff = function () {
  return todoCategoryFilterAllOff === true;
};
window.UnterrichtsassistentApp.getActiveTimetablePlanningEventDetail = function () {
  return activeTimetablePlanningEventDetail;
};
window.UnterrichtsassistentApp.getPlanningSidebarCategoryFilters = function () {
  const sourceSnapshot = getMutableRawSnapshot();

  if (!planningSidebarCategoryFiltersInitialized) {
    planningSidebarCategoryFilters = getDefaultPlanningSidebarFilters(sourceSnapshot);
    planningSidebarCategoryFiltersInitialized = true;
  }

  return planningSidebarCategoryFilters.slice();
};
window.UnterrichtsassistentApp.isPlanningSidebarFilterAllOff = function () {
  return planningSidebarCategoryFiltersInitialized && !planningSidebarCategoryFilters.length;
};
window.UnterrichtsassistentApp.isPlanningSidebarFilterOpen = function () {
  return planningSidebarFilterOpen;
};
window.UnterrichtsassistentApp.togglePlanningSidebarFilter = function () {
  planningSidebarFilterOpen = !planningSidebarFilterOpen;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.togglePlanningSidebarCategoryFilter = function (categoryName) {
  const normalizedName = String(categoryName || "").trim();
  const existingIndex = planningSidebarCategoryFilters.findIndex(function (entry) {
    return String(entry || "").trim().toLowerCase() === normalizedName.toLowerCase();
  });

  if (!normalizedName) {
    return false;
  }

  if (existingIndex >= 0) {
    planningSidebarCategoryFilters.splice(existingIndex, 1);
  } else {
    planningSidebarCategoryFilters.push(normalizedName);
  }
  planningSidebarCategoryFiltersInitialized = true;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.clearPlanningSidebarCategoryFilters = function () {
  planningSidebarCategoryFilters = getDefaultPlanningSidebarFilters(getMutableRawSnapshot());
  planningSidebarCategoryFiltersInitialized = true;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.clearAllPlanningSidebarCategoryFilters = function () {
  planningSidebarCategoryFilters = [];
  planningSidebarCategoryFiltersInitialized = true;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.getSelectedPlanningEventId = function () {
  return String(selectedPlanningEventId || "").trim();
};
window.UnterrichtsassistentApp.getSelectedPlanningEventState = function () {
  return {
    eventId: String(selectedPlanningEventId || "").trim(),
    occurrenceId: String(selectedPlanningEventOccurrenceId || "").trim(),
    startDate: selectedPlanningEventOccurrenceRange ? String(selectedPlanningEventOccurrenceRange.startDate || "").slice(0, 10) : "",
    endDate: selectedPlanningEventOccurrenceRange ? String(selectedPlanningEventOccurrenceRange.endDate || "").slice(0, 10) : ""
  };
};
window.UnterrichtsassistentApp.selectPlanningEvent = function (eventId) {
  const occurrenceId = arguments.length > 1 ? String(arguments[1] || "").trim() : "";
  const occurrenceStartDate = arguments.length > 2 ? String(arguments[2] || "").slice(0, 10) : "";
  const occurrenceEndDate = arguments.length > 3 ? String(arguments[3] || "").slice(0, 10) : "";

  selectedPlanningEventId = String(eventId || "").trim();
  selectedPlanningEventOccurrenceId = occurrenceId;
  selectedPlanningEventOccurrenceRange = occurrenceStartDate
    ? {
        startDate: occurrenceStartDate,
        endDate: occurrenceEndDate || occurrenceStartDate
      }
    : null;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.clearSelectedPlanningEvent = function () {
  if (!String(selectedPlanningEventId || "").trim()) {
    return false;
  }

  selectedPlanningEventId = "";
  selectedPlanningEventOccurrenceId = "";
  selectedPlanningEventOccurrenceRange = null;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.handlePlanningBackgroundClick = function (event) {
  const target = event && event.target;

  if (!target || typeof target.closest !== "function") {
    return true;
  }

  if (target.closest(".planning-sidebar__event-row, .planning-sidebar__filters, .planning-year__day, #planningEventModal")) {
    return true;
  }

  return window.UnterrichtsassistentApp.clearSelectedPlanningEvent();
};
window.UnterrichtsassistentApp.getUnterrichtViewMode = function () {
  return unterrichtViewMode;
};
window.UnterrichtsassistentApp.setUnterrichtViewMode = function (nextMode) {
  unterrichtViewMode = ["nachpflege", "analyse"].indexOf(nextMode) >= 0 ? nextMode : "live";

  if (activeViewId === "unterricht") {
    setActiveView("unterricht");
  }

  return false;
};
window.UnterrichtsassistentApp.getUnterrichtToolMode = function () {
  return unterrichtToolMode;
};
window.UnterrichtsassistentApp.setUnterrichtToolMode = function (nextMode) {
  const allowedModes = ["attendance", "homework", "warning", "assessment"];
  unterrichtToolMode = allowedModes.indexOf(nextMode) >= 0 ? nextMode : "attendance";

  if (activeViewId === "unterricht") {
    setActiveView("unterricht");
  }

  return false;
};
window.UnterrichtsassistentApp.handleUnterrichtSeatClick = function (studentId, lessonId, lessonStartTime, lessonRoom, homeworkQuality, homeworkAction) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService && serializeSnapshot ? serializeSnapshot(schoolService.snapshot) : null;
  const referenceDate = schoolService ? schoolService.getReferenceDate() : new Date();
  const lessonDate = normalizeDateValue(getReferenceDateValue());
  const recordedAt = getReferenceDateTimeValue();
  const lesson = lessonId
    ? {
        id: String(lessonId),
        startTime: String(lessonStartTime || ""),
        room: String(lessonRoom || "").trim(),
        isFallback: false
      }
    : getRelevantUnterrichtLesson(activeClass, referenceDate);
  const existingRecords = currentRawSnapshot && activeClass && lesson
    ? getAttendanceRecordsForLessonOccurrenceFromSnapshot(currentRawSnapshot, String(studentId), activeClass.id, lesson.id, lessonDate)
    : [];
  const lastRecord = existingRecords.length ? existingRecords[existingRecords.length - 1] : null;
  let effectiveAt = recordedAt;
  let currentStatus;
  let nextStatus;
  let lessonStartMinutes;
  let referenceMinutes;
  let withinFirstTenMinutes = false;
  let shouldUpdateLastRecord = false;
  let homeworkRecords;
  let existingHomeworkRecord;
  let nextHomeworkRecords;
  let normalizedHomeworkQuality;
  let warningRecords;
  let warningCategory;
  let existingWarningRecords;

  if (!schoolService || !activeClass || !currentRawSnapshot || !studentId) {
    return false;
  }

  if (!lesson) {
    return false;
  }

  if (unterrichtToolMode === "homework") {
    homeworkRecords = getMutableHomeworkRecordsCollection(currentRawSnapshot);
    existingHomeworkRecord = getHomeworkRecordsForLessonOccurrenceFromSnapshot(
      currentRawSnapshot,
      String(studentId),
      activeClass.id,
      lesson.id,
      lessonDate
    )[0] || null;
    nextHomeworkRecords = homeworkRecords.slice();
    normalizedHomeworkQuality = normalizeHomeworkQualityValue(homeworkQuality);

    if (homeworkAction === "set") {
      nextHomeworkRecords = nextHomeworkRecords.filter(function (record) {
        return !(record.studentId === String(studentId)
          && record.classId === activeClass.id
          && record.lessonId === lesson.id
          && normalizeDateValue(record.lessonDate) === normalizeDateValue(lessonDate));
      });
      if (normalizedHomeworkQuality !== "vorhanden") {
        nextHomeworkRecords.push({
          id: existingHomeworkRecord ? existingHomeworkRecord.id : createHomeworkRecordId(),
          studentId: String(studentId),
          classId: activeClass.id,
          lessonId: lesson.id,
          lessonDate: lessonDate,
          room: String(lesson.room || "").trim(),
          recordedAt: recordedAt,
          quality: normalizedHomeworkQuality
        });
      }
    } else if (existingHomeworkRecord) {
      nextHomeworkRecords = nextHomeworkRecords.filter(function (record) {
        return record.id !== existingHomeworkRecord.id;
      });
    } else {
      nextHomeworkRecords.push({
        id: createHomeworkRecordId(),
        studentId: String(studentId),
        classId: activeClass.id,
        lessonId: lesson.id,
        lessonDate: lessonDate,
        room: String(lesson.room || "").trim(),
        recordedAt: recordedAt,
        quality: "fehlt"
      });
    }

    currentRawSnapshot.homeworkRecords = nextHomeworkRecords;
    saveAndRefreshSnapshot(currentRawSnapshot, "unterricht");
    return false;
  }

  if (unterrichtToolMode === "warning") {
    warningRecords = getMutableWarningRecordsCollection(currentRawSnapshot).slice();
    warningCategory = normalizeWarningCategoryValue(homeworkQuality);
    existingWarningRecords = getWarningRecordsForLessonOccurrenceFromSnapshot(
      currentRawSnapshot,
      String(studentId),
      activeClass.id,
      lesson.id,
      lessonDate
    );

    if (warningCategory === "letzteentfernen") {
      if (existingWarningRecords.length) {
        warningRecords = warningRecords.filter(function (record) {
          return record.id !== existingWarningRecords[existingWarningRecords.length - 1].id;
        });
      }
    } else if (warningCategory === "andere") {
      warningRecords.push({
        id: createWarningRecordId(),
        studentId: String(studentId),
        classId: activeClass.id,
        lessonId: lesson.id,
        lessonDate: lessonDate,
        room: String(lesson.room || "").trim(),
        recordedAt: recordedAt,
        category: warningCategory,
        note: String(homeworkAction || "").trim()
      });
    } else {
      warningRecords.push({
        id: createWarningRecordId(),
        studentId: String(studentId),
        classId: activeClass.id,
        lessonId: lesson.id,
        lessonDate: lessonDate,
        room: String(lesson.room || "").trim(),
        recordedAt: recordedAt,
        category: warningCategory,
        note: ""
      });
    }

    currentRawSnapshot.warningRecords = warningRecords;
    saveAndRefreshSnapshot(currentRawSnapshot, "unterricht");
    return false;
  }

  if (unterrichtToolMode === "assessment") {
    activeUnterrichtAssessmentDraft = {
      studentId: String(studentId),
      classId: activeClass.id,
      lessonId: lesson.id,
      lessonDate: lessonDate,
      lessonStartTime: String(lesson.startTime || ""),
      lessonRoom: String(lesson.room || "").trim()
    };
    window.UnterrichtsassistentApp.openUnterrichtAssessmentModal();
    return false;
  }

  if (unterrichtToolMode !== "attendance") {
    return false;
  }

  currentStatus = lastRecord && lastRecord.status === "absent" ? "absent" : "present";
  nextStatus = currentStatus === "absent" ? "present" : "absent";

  if (!lesson.isFallback) {
    lessonStartMinutes = timeStringToMinutes(lesson.startTime);
    referenceMinutes = (referenceDate.getHours() * 60) + referenceDate.getMinutes();
    withinFirstTenMinutes = referenceMinutes <= (lessonStartMinutes + 10);
  }

  if (nextStatus === "absent" && !lesson.isFallback) {
    if (withinFirstTenMinutes) {
      effectiveAt = lessonDate + "T" + String(lesson.startTime || "00:00");
    }
  }

  if (lastRecord) {
    shouldUpdateLastRecord = withinFirstTenMinutes
      ? getSecondsBetweenDateTimeValues(lastRecord.recordedAt || lastRecord.effectiveAt, recordedAt) < 30
      : getMinutesBetweenDateTimeValues(lastRecord.recordedAt || lastRecord.effectiveAt, recordedAt) < 5;
  }

  if (lastRecord && shouldUpdateLastRecord) {
    currentRawSnapshot.attendanceRecords = getMutableAttendanceRecordsCollection(currentRawSnapshot).map(function (record) {
      if (record.id !== lastRecord.id) {
        return record;
      }

      record.status = nextStatus;
      record.recordedAt = recordedAt;
      record.effectiveAt = effectiveAt;
      record.room = String(lesson.room || "").trim();
      return record;
    });
  } else {
    getMutableAttendanceRecordsCollection(currentRawSnapshot).push({
      id: createAttendanceRecordId(),
      studentId: String(studentId),
      classId: activeClass.id,
      lessonId: lesson.id,
      lessonDate: lessonDate,
      room: String(lesson.room || "").trim(),
      status: nextStatus,
      recordedAt: recordedAt,
      effectiveAt: effectiveAt
    });
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "unterricht");
  return false;
};
window.UnterrichtsassistentApp.startUnterrichtHomeworkPointer = function (event, studentId, lessonId, lessonStartTime, lessonRoom) {
  if (unterrichtToolMode !== "homework" || !studentId || !lessonId) {
    return false;
  }

  if (activeUnterrichtHomeworkPress && activeUnterrichtHomeworkPress.timerId) {
    window.clearTimeout(activeUnterrichtHomeworkPress.timerId);
  }

  clearUnterrichtHomeworkPressListeners();
  hideUnterrichtHomeworkRadialMenu();

  activeUnterrichtHomeworkPress = {
    pointerId: event.pointerId,
    studentId: String(studentId),
    lessonId: String(lessonId),
    lessonStartTime: String(lessonStartTime || ""),
    lessonRoom: String(lessonRoom || ""),
    anchorX: Number(event.clientX) || 0,
    anchorY: Number(event.clientY) || 0,
    clientX: Number(event.clientX) || 0,
    clientY: Number(event.clientY) || 0,
    selectedQuality: "",
    menuVisible: false,
    timerId: window.setTimeout(function () {
      if (!activeUnterrichtHomeworkPress) {
        return;
      }

      activeUnterrichtHomeworkPress.menuVisible = true;
      showUnterrichtHomeworkRadialMenu(activeUnterrichtHomeworkPress.clientX, activeUnterrichtHomeworkPress.clientY);
      setUnterrichtHomeworkRadialSelection("");
    }, HOMEWORK_LONG_PRESS_DELAY_MS)
  };

  if (event.target && typeof event.target.setPointerCapture === "function") {
    try {
      event.target.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
  }

  window.addEventListener("pointermove", window.UnterrichtsassistentApp.handleUnterrichtHomeworkPointerMove);
  window.addEventListener("pointerup", window.UnterrichtsassistentApp.handleUnterrichtHomeworkPointerEnd);
  window.addEventListener("pointercancel", window.UnterrichtsassistentApp.handleUnterrichtHomeworkPointerEnd);
  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.startUnterrichtWarningPointer = function (event, studentId, lessonId, lessonStartTime, lessonRoom) {
  if (unterrichtToolMode !== "warning" || !studentId || !lessonId) {
    return false;
  }

  if (activeUnterrichtWarningPress && activeUnterrichtWarningPress.timerId) {
    window.clearTimeout(activeUnterrichtWarningPress.timerId);
  }

  clearUnterrichtWarningPressListeners();
  hideUnterrichtWarningRadialMenu();

  activeUnterrichtWarningPress = {
    pointerId: event.pointerId,
    studentId: String(studentId),
    lessonId: String(lessonId),
    lessonStartTime: String(lessonStartTime || ""),
    lessonRoom: String(lessonRoom || ""),
    anchorX: Number(event.clientX) || 0,
    anchorY: Number(event.clientY) || 0,
    clientX: Number(event.clientX) || 0,
    clientY: Number(event.clientY) || 0,
    selectedCategory: "",
    menuVisible: false,
    timerId: window.setTimeout(function () {
      if (!activeUnterrichtWarningPress) {
        return;
      }

      activeUnterrichtWarningPress.menuVisible = true;
      showUnterrichtWarningRadialMenu(activeUnterrichtWarningPress.clientX, activeUnterrichtWarningPress.clientY);
      setUnterrichtWarningRadialSelection("");
    }, WARNING_LONG_PRESS_DELAY_MS)
  };

  if (event.target && typeof event.target.setPointerCapture === "function") {
    try {
      event.target.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
  }

  window.addEventListener("pointermove", window.UnterrichtsassistentApp.handleUnterrichtWarningPointerMove);
  window.addEventListener("pointerup", window.UnterrichtsassistentApp.handleUnterrichtWarningPointerEnd);
  window.addEventListener("pointercancel", window.UnterrichtsassistentApp.handleUnterrichtWarningPointerEnd);
  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.startUnterrichtAssessmentPointer = function (event, studentId, lessonId, lessonStartTime, lessonRoom) {
  if (unterrichtToolMode !== "assessment" || !studentId || !lessonId) {
    return false;
  }

  if (activeUnterrichtAssessmentPress && activeUnterrichtAssessmentPress.timerId) {
    window.clearTimeout(activeUnterrichtAssessmentPress.timerId);
  }

  clearUnterrichtAssessmentPressListeners();
  hideUnterrichtAssessmentQuickMenu();

  activeUnterrichtAssessmentPress = {
    pointerId: event.pointerId,
    studentId: String(studentId),
    lessonId: String(lessonId),
    lessonStartTime: String(lessonStartTime || ""),
    lessonRoom: String(lessonRoom || ""),
    anchorX: Number(event.clientX) || 0,
    anchorY: Number(event.clientY) || 0,
    clientX: Number(event.clientX) || 0,
    clientY: Number(event.clientY) || 0,
    menuVisible: false,
    moved: false,
    selection: null,
    timerId: window.setTimeout(function () {
      if (!activeUnterrichtAssessmentPress) {
        return;
      }

      openUnterrichtAssessmentQuickMenuImmediately();
    }, ASSESSMENT_LONG_PRESS_DELAY_MS)
  };

  if (event.target && typeof event.target.setPointerCapture === "function") {
    try {
      event.target.setPointerCapture(event.pointerId);
    } catch (error) {
      void error;
    }
  }

  window.addEventListener("pointermove", window.UnterrichtsassistentApp.handleUnterrichtAssessmentPointerMove);
  window.addEventListener("pointerup", window.UnterrichtsassistentApp.handleUnterrichtAssessmentPointerEnd);
  window.addEventListener("pointercancel", window.UnterrichtsassistentApp.handleUnterrichtAssessmentPointerEnd);
  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.handleUnterrichtWarningPointerMove = function (event) {
  if (!activeUnterrichtWarningPress || event.pointerId !== activeUnterrichtWarningPress.pointerId) {
    return false;
  }

  activeUnterrichtWarningPress.clientX = Number(event.clientX) || 0;
  activeUnterrichtWarningPress.clientY = Number(event.clientY) || 0;

  if (!activeUnterrichtWarningPress.menuVisible) {
    if (Math.abs(activeUnterrichtWarningPress.clientX - activeUnterrichtWarningPress.anchorX) >= 8
      || Math.abs(activeUnterrichtWarningPress.clientY - activeUnterrichtWarningPress.anchorY) >= 8) {
      openUnterrichtWarningRadialMenuImmediately();
    }
  }

  if (activeUnterrichtWarningPress.menuVisible) {
    activeUnterrichtWarningPress.selectedCategory = getUnterrichtWarningRadialCategory(
      activeUnterrichtWarningPress.clientX,
      activeUnterrichtWarningPress.clientY,
      activeUnterrichtWarningPress.anchorX,
      activeUnterrichtWarningPress.anchorY
    );
    setUnterrichtWarningRadialSelection(activeUnterrichtWarningPress.selectedCategory);
  }

  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.handleUnterrichtWarningPointerEnd = function (event) {
  const pressState = activeUnterrichtWarningPress;

  if (!pressState || event.pointerId !== pressState.pointerId) {
    return false;
  }

  if (pressState.timerId) {
    window.clearTimeout(pressState.timerId);
  }

  clearUnterrichtWarningPressListeners();
  activeUnterrichtWarningPress = null;

  if (pressState.menuVisible) {
    hideUnterrichtWarningRadialMenu();
    if (pressState.selectedCategory) {
      if (pressState.selectedCategory === "andere") {
        activeUnterrichtWarningOtherDraft = {
          studentId: pressState.studentId,
          lessonId: pressState.lessonId,
          lessonStartTime: pressState.lessonStartTime,
          lessonRoom: pressState.lessonRoom
        };
        window.UnterrichtsassistentApp.openUnterrichtWarningOtherModal();
        event.preventDefault();
        return false;
      }

      window.UnterrichtsassistentApp.handleUnterrichtSeatClick(
        pressState.studentId,
        pressState.lessonId,
        pressState.lessonStartTime,
        pressState.lessonRoom,
        pressState.selectedCategory
      );
    }
    event.preventDefault();
    return false;
  }

  hideUnterrichtWarningRadialMenu();
  window.UnterrichtsassistentApp.handleUnterrichtSeatClick(
    pressState.studentId,
    pressState.lessonId,
    pressState.lessonStartTime,
    pressState.lessonRoom,
    "stoerung"
  );
  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.handleUnterrichtAssessmentPointerMove = function (event) {
  if (!activeUnterrichtAssessmentPress || event.pointerId !== activeUnterrichtAssessmentPress.pointerId) {
    return false;
  }

  activeUnterrichtAssessmentPress.clientX = Number(event.clientX) || 0;
  activeUnterrichtAssessmentPress.clientY = Number(event.clientY) || 0;

  if (Math.abs(activeUnterrichtAssessmentPress.clientX - activeUnterrichtAssessmentPress.anchorX) >= 8
    || Math.abs(activeUnterrichtAssessmentPress.clientY - activeUnterrichtAssessmentPress.anchorY) >= 8) {
    activeUnterrichtAssessmentPress.moved = true;
  }

  if (!activeUnterrichtAssessmentPress.menuVisible && activeUnterrichtAssessmentPress.moved) {
    openUnterrichtAssessmentQuickMenuImmediately();
  }

  if (activeUnterrichtAssessmentPress.menuVisible) {
    activeUnterrichtAssessmentPress.selection = getUnterrichtAssessmentQuickSelection(
      activeUnterrichtAssessmentPress.clientX,
      activeUnterrichtAssessmentPress.clientY,
      activeUnterrichtAssessmentPress.anchorX,
      activeUnterrichtAssessmentPress.anchorY
    );

    if (activeUnterrichtAssessmentPress.selection) {
      showUnterrichtAssessmentQuickMenu(
        activeUnterrichtAssessmentPress.clientX,
        activeUnterrichtAssessmentPress.clientY,
        activeUnterrichtAssessmentPress.selection.label
      );
      showUnterrichtAssessmentQuickOverlay(
        activeUnterrichtAssessmentPress.anchorX,
        activeUnterrichtAssessmentPress.anchorY,
        activeUnterrichtAssessmentPress.selection.qualityValue,
        activeUnterrichtAssessmentPress.selection.afb
      );
    } else {
      hideUnterrichtAssessmentQuickMenu();
    }
  }

  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.handleUnterrichtAssessmentPointerEnd = function (event) {
  const pressState = activeUnterrichtAssessmentPress;
  const currentRawSnapshot = schoolService && serializeSnapshot ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const lessonDate = normalizeDateValue(getReferenceDateValue());

  if (!pressState || event.pointerId !== pressState.pointerId) {
    return false;
  }

  if (pressState.timerId) {
    window.clearTimeout(pressState.timerId);
  }

  clearUnterrichtAssessmentPressListeners();
  activeUnterrichtAssessmentPress = null;

  if (pressState.menuVisible && pressState.selection && currentRawSnapshot && activeClass) {
    showUnterrichtAssessmentQuickOverlay(
      pressState.anchorX,
      pressState.anchorY,
      pressState.selection.qualityValue,
      pressState.selection.afb
    );
    flashUnterrichtAssessmentQuickOverlay();
    appendUnterrichtAssessmentRecord(currentRawSnapshot, {
      studentId: pressState.studentId,
      classId: activeClass.id,
      lessonId: pressState.lessonId,
      lessonDate: lessonDate,
      lessonRoom: pressState.lessonRoom
    }, {
      category: "",
      afb1: pressState.selection.afb === 1 ? pressState.selection.qualityValue : "",
      afb2: pressState.selection.afb === 2 ? pressState.selection.qualityValue : "",
      afb3: pressState.selection.afb === 3 ? pressState.selection.qualityValue : "",
      workBehavior: "",
      socialBehavior: "",
      knowledgeGap: ""
    });
    saveAndRefreshSnapshot(currentRawSnapshot, "unterricht");
    window.setTimeout(function () {
      hideUnterrichtAssessmentQuickMenu();
    }, 180);
    event.preventDefault();
    return false;
  }

  if (pressState.menuVisible) {
    hideUnterrichtAssessmentQuickMenu();
    event.preventDefault();
    return false;
  }

  hideUnterrichtAssessmentQuickMenu();
  window.UnterrichtsassistentApp.handleUnterrichtSeatClick(
    pressState.studentId,
    pressState.lessonId,
    pressState.lessonStartTime,
    pressState.lessonRoom
  );
  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.openUnterrichtWarningOtherModal = function () {
  const modal = getUnterrichtWarningOtherModal();
  const input = document.getElementById("unterrichtWarningOtherInput");

  if (!modal || !activeUnterrichtWarningOtherDraft) {
    return false;
  }

  modal.hidden = false;
  modal.classList.add("is-open");

  if (input) {
    input.value = "";
    window.setTimeout(function () {
      input.focus();
    }, 0);
  }

  return false;
};
window.UnterrichtsassistentApp.closeUnterrichtWarningOtherModal = function () {
  const modal = getUnterrichtWarningOtherModal();

  if (modal) {
    modal.hidden = true;
    modal.classList.remove("is-open");
  }

  activeUnterrichtWarningOtherDraft = null;
  return false;
};
window.UnterrichtsassistentApp.submitUnterrichtWarningOtherModal = function (event) {
  const input = document.getElementById("unterrichtWarningOtherInput");
  const noteValue = String(input && input.value || "").trim();
  const draft = activeUnterrichtWarningOtherDraft;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!draft || !noteValue) {
    return window.UnterrichtsassistentApp.closeUnterrichtWarningOtherModal();
  }

  window.UnterrichtsassistentApp.handleUnterrichtSeatClick(
    draft.studentId,
    draft.lessonId,
    draft.lessonStartTime,
    draft.lessonRoom,
    "andere",
    noteValue
  );

  return window.UnterrichtsassistentApp.closeUnterrichtWarningOtherModal();
};
window.UnterrichtsassistentApp.handleKnowledgeGapInputFocus = function (inputId, listId) {
  clearKnowledgeGapSuggestionBlurTimer();
  return renderKnowledgeGapSuggestions(inputId, listId);
};
window.UnterrichtsassistentApp.handleKnowledgeGapInput = function (event, listId) {
  const input = event && event.target ? event.target : document.getElementById(activeKnowledgeGapSuggestionInputId);

  clearKnowledgeGapSuggestionBlurTimer();

  if (!input || !input.id) {
    closeKnowledgeGapSuggestions();
    return false;
  }

  return renderKnowledgeGapSuggestions(input.id, listId);
};
window.UnterrichtsassistentApp.handleKnowledgeGapInputBlur = function (listId) {
  if (listId && listId !== activeKnowledgeGapSuggestionListId) {
    closeKnowledgeGapSuggestions();
    return false;
  }

  scheduleKnowledgeGapSuggestionsClose();
  return false;
};
window.UnterrichtsassistentApp.selectKnowledgeGapSuggestion = function (value, inputId, listId) {
  const input = inputId ? document.getElementById(inputId) : null;

  if (Date.now() < suppressKnowledgeGapSuggestionClickUntil) {
    return false;
  }

  clearKnowledgeGapSuggestionBlurTimer();

  if (!input) {
    closeKnowledgeGapSuggestions();
    return false;
  }

  input.value = String(value || "");
  closeKnowledgeGapSuggestions();
  window.setTimeout(function () {
    if (typeof input.focus === "function") {
      input.focus();
      if (typeof input.setSelectionRange === "function") {
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  }, 0);
  return false;
};
window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerDown = function (event, listId) {
  return beginKnowledgeGapSuggestionsDrag(event, listId);
};
window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerMove = function (event, listId) {
  return moveKnowledgeGapSuggestionsDrag(event, listId);
};
window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerUp = function (event, listId) {
  return endKnowledgeGapSuggestionsDrag(event, listId);
};
window.UnterrichtsassistentApp.handlePlanningCategoryInputFocus = function (inputId, listId) {
  clearPlanningCategorySuggestionBlurTimer();
  return renderPlanningCategorySuggestions(inputId, listId);
};
window.UnterrichtsassistentApp.handlePlanningCategoryInput = function (event, listId) {
  const input = event && event.target ? event.target : document.getElementById(activePlanningCategorySuggestionInputId);

  clearPlanningCategorySuggestionBlurTimer();

  if (!input || !input.id) {
    closePlanningCategorySuggestions();
    return false;
  }

  return renderPlanningCategorySuggestions(input.id, listId);
};
window.UnterrichtsassistentApp.handlePlanningCategoryInputBlur = function (listId) {
  if (listId && listId !== activePlanningCategorySuggestionListId) {
    closePlanningCategorySuggestions();
    return false;
  }

  schedulePlanningCategorySuggestionsClose();
  return false;
};
window.UnterrichtsassistentApp.selectPlanningCategorySuggestion = function (value, inputId) {
  const input = inputId ? document.getElementById(inputId) : null;

  if (Date.now() < suppressKnowledgeGapSuggestionClickUntil) {
    return false;
  }

  clearPlanningCategorySuggestionBlurTimer();

  if (!input) {
    closePlanningCategorySuggestions();
    return false;
  }

  input.value = String(value || "");
  if (inputId === "todoCategoryInput" && window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.updateTodoDraftCategory === "function") {
    window.UnterrichtsassistentApp.updateTodoDraftCategory(input.value);
  }
  closePlanningCategorySuggestions();
  window.setTimeout(function () {
    if (typeof input.focus === "function") {
      input.focus();
      if (typeof input.setSelectionRange === "function") {
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  }, 0);
  return false;
};
window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerDown = function (event, listId) {
  return beginPlanningCategorySuggestionsDrag(event, listId);
};
window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerMove = function (event, listId) {
  return movePlanningCategorySuggestionsDrag(event, listId);
};
window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerUp = function (event, listId) {
  return endPlanningCategorySuggestionsDrag(event, listId);
};
window.UnterrichtsassistentApp.handleEvaluationTopicInputFocus = function (inputId, listId) {
  clearEvaluationTopicSuggestionBlurTimer();
  return renderEvaluationTopicSuggestions(inputId, listId);
};
window.UnterrichtsassistentApp.handleEvaluationTopicInput = function (event, listId) {
  const input = event && event.target ? event.target : document.getElementById(activeEvaluationTopicSuggestionInputId);

  clearEvaluationTopicSuggestionBlurTimer();

  if (!input || !input.id) {
    closeEvaluationTopicSuggestions();
    return false;
  }

  return renderEvaluationTopicSuggestions(input.id, listId);
};
window.UnterrichtsassistentApp.handleEvaluationTopicInputBlur = function (listId) {
  if (listId && listId !== activeEvaluationTopicSuggestionListId) {
    closeEvaluationTopicSuggestions();
    return false;
  }

  scheduleEvaluationTopicSuggestionsClose();
  return false;
};
window.UnterrichtsassistentApp.selectEvaluationTopicSuggestion = function (value, inputId, listId) {
  const input = inputId ? document.getElementById(inputId) : null;
  const idParts = String(inputId || "").split("--");
  const taskId = idParts[1] || "";
  const subtaskId = idParts[2] || "";
  const existingValues = input ? String(input.value || "") : "";
  const committedValues = existingValues.split(",").slice(0, -1).map(function (entry) {
    return String(entry || "").trim();
  }).filter(Boolean);
  let nextValue;

  if (Date.now() < suppressKnowledgeGapSuggestionClickUntil) {
    return false;
  }

  clearEvaluationTopicSuggestionBlurTimer();

  if (!input) {
    closeEvaluationTopicSuggestions();
    return false;
  }

  if (existingValues.indexOf(",") < 0) {
    nextValue = String(value || "").trim();
  } else {
    nextValue = committedValues.concat(String(value || "").trim()).filter(Boolean).join(", ");
  }

  input.value = nextValue ? nextValue + ", " : "";
  closeEvaluationTopicSuggestions();
  window.UnterrichtsassistentApp.updateEvaluationSubtaskField(taskId, subtaskId, "topics", nextValue);
  window.setTimeout(function () {
    const nextInput = document.getElementById(inputId);

    if (nextInput && typeof nextInput.focus === "function") {
      nextInput.focus();
      if (typeof nextInput.setSelectionRange === "function") {
        nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
      }
    }
  }, 0);
  return false;
};
window.UnterrichtsassistentApp.handleEvaluationTopicSuggestionsPointerDown = function (event, listId) {
  return beginEvaluationTopicSuggestionsDrag(event, listId);
};
window.UnterrichtsassistentApp.handleEvaluationTopicSuggestionsPointerMove = function (event, listId) {
  return moveEvaluationTopicSuggestionsDrag(event, listId);
};
window.UnterrichtsassistentApp.handleEvaluationTopicSuggestionsPointerUp = function (event, listId) {
  return endEvaluationTopicSuggestionsDrag(event, listId);
};
window.UnterrichtsassistentApp.openPlanningEventModal = function (dateValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getPlanningCollections(currentRawSnapshot) : null;
  const normalizedDate = String(dateValue || "").slice(0, 10);
  const eventId = arguments.length > 1 ? String(arguments[1] || "").trim() : "";
  const rangeEndDate = arguments.length > 2 ? String(arguments[2] || "").slice(0, 10) : "";
  const orderedRange = getOrderedPlanningRange(normalizedDate, rangeEndDate || normalizedDate);
  let existingEvent = null;

  if (planningViewMode !== "jahresplanung" || planningAdminMode) {
    return false;
  }

  if (!eventId && Date.now() < suppressPlanningDayClickUntil) {
    return false;
  }

  if (eventId && collections) {
    existingEvent = collections.events.find(function (entry) {
      return String(entry && entry.id || "").trim() === eventId;
    }) || null;
  }

  if (existingEvent) {
    selectedPlanningEventId = String(existingEvent.id || "").trim();
    selectedPlanningEventOccurrenceId = "";
    selectedPlanningEventOccurrenceRange = {
      startDate: String(existingEvent.startDate || "").slice(0, 10),
      endDate: String(existingEvent.endDate || existingEvent.startDate || "").slice(0, 10)
    };
    activePlanningEventDraft = {
      id: String(existingEvent.id || "").trim(),
      title: String(existingEvent.title || "").trim(),
      startDate: String(existingEvent.startDate || "").slice(0, 10),
      endDate: String(existingEvent.endDate || existingEvent.startDate || "").slice(0, 10),
      startTime: String(existingEvent.startTime || "").trim(),
      endTime: String(existingEvent.endTime || "").trim(),
      category: String(existingEvent.category || "").trim(),
      description: String(existingEvent.description || "").trim(),
      priority: [1, 2, 3].indexOf(Number(existingEvent.priority)) >= 0 ? Number(existingEvent.priority) : 3,
      showInTimetable: Boolean(existingEvent.showInTimetable),
      causesInstructionOutage: Boolean(existingEvent.causesInstructionOutage),
      isRecurring: Boolean(existingEvent.isRecurring),
      recurrenceInterval: normalizePlanningEventRecurrenceInterval(existingEvent.recurrenceInterval),
      recurrenceUnit: normalizePlanningEventRecurrenceUnit(existingEvent.recurrenceUnit),
      recurrenceUntilDate: normalizePlanningEventRecurrenceUntilDate(existingEvent.recurrenceUntilDate),
      recurrenceMonthlyWeekday: Boolean(existingEvent.recurrenceMonthlyWeekday),
      isExternallyControlled: Boolean(existingEvent.isExternallyControlled),
      controlledByView: String(existingEvent.controlledByView || "").trim(),
      controlledById: String(existingEvent.controlledById || "").trim()
    };
  } else {
    if (!orderedRange.startDate) {
      return false;
    }

    activePlanningEventDraft = {
      date: orderedRange.startDate,
      title: "",
      startDate: orderedRange.startDate,
      endDate: orderedRange.endDate,
      startTime: "",
      endTime: "",
      category: "",
      description: "",
      priority: 3,
      showInTimetable: false,
      causesInstructionOutage: false,
      isRecurring: false,
      recurrenceInterval: 1,
      recurrenceUnit: "weeks",
      recurrenceUntilDate: "",
      recurrenceMonthlyWeekday: false,
      isExternallyControlled: false,
      controlledByView: "",
      controlledById: ""
    };
  }

  activePlanningRangeDraft = null;
  setActiveView("planung");
  return false;
};
window.UnterrichtsassistentApp.closePlanningEventModal = function () {
  activePlanningEventDraft = null;
  closePlanningCategorySuggestions();
  closePlanningRangeSelection();

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.handlePlanningEventRecurringChange = function (isRecurring) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;

  if (!activePlanningEventDraft || activePlanningEventDraft.isExternallyControlled) {
    return false;
  }

  activePlanningEventDraft.isRecurring = Boolean(isRecurring);

  if (activePlanningEventDraft.isRecurring && !String(activePlanningEventDraft.recurrenceUntilDate || "").slice(0, 10)) {
    activePlanningEventDraft.recurrenceUntilDate = String(
      currentRawSnapshot && currentRawSnapshot.schoolYearEnd
      || activePlanningEventDraft.endDate
      || activePlanningEventDraft.startDate
      || ""
    ).slice(0, 10);
  }

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.handlePlanningEventRecurrenceUnitChange = function (value) {
  if (!activePlanningEventDraft || activePlanningEventDraft.isExternallyControlled) {
    return false;
  }

  activePlanningEventDraft.recurrenceUnit = normalizePlanningEventRecurrenceUnit(value);

  if (activePlanningEventDraft.recurrenceUnit !== "months") {
    activePlanningEventDraft.recurrenceMonthlyWeekday = false;
  }

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.openPlanningInstructionLessonModal = function (lessonDateValue, classId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const collections = currentRawSnapshot ? getPlanningCollections(currentRawSnapshot) : null;
  const normalizedLessonDate = String(lessonDateValue || "").slice(0, 10);
  const normalizedClassId = String(classId || activeClass && activeClass.id || "").trim();
  const outageEvent = currentRawSnapshot
    ? getPlanningInstructionOutageEventDetail(currentRawSnapshot, normalizedClassId, normalizedLessonDate)
    : null;
  const existingStatus = collections
    ? collections.lessonStatuses.find(function (entry) {
        return String(entry && entry.classId || "").trim() === normalizedClassId
          && String(entry && entry.lessonDate || "").slice(0, 10) === normalizedLessonDate;
      }) || null
    : null;
  const allowedView = activeViewId === "planung" || activeViewId === "stundenplan";

  if (!allowedView || !normalizedClassId || !normalizedLessonDate) {
    return false;
  }

  activePlanningInstructionLessonDraft = existingStatus
    ? {
        id: String(existingStatus.id || "").trim(),
        classId: normalizedClassId,
        lessonDate: String(existingStatus.lessonDate || "").slice(0, 10),
        isCancelled: Boolean(existingStatus.isCancelled || outageEvent),
        cancelReason: String(existingStatus.cancelReason || outageEvent && (outageEvent.description || outageEvent.title) || "").trim(),
        isControlledByOutageEvent: Boolean(outageEvent),
        outageEventDetail: outageEvent
          ? {
              id: String(outageEvent.id || "").trim(),
              sourceEventId: String(outageEvent.sourceEventId || outageEvent.id || "").trim(),
              occurrenceId: String(outageEvent.occurrenceId || "").trim(),
              title: String(outageEvent.title || "").trim(),
              startDate: String(outageEvent.startDate || "").slice(0, 10),
              endDate: String(outageEvent.endDate || outageEvent.startDate || "").slice(0, 10)
            }
          : null
      }
    : {
        id: "",
        classId: normalizedClassId,
        lessonDate: normalizedLessonDate,
        isCancelled: Boolean(outageEvent),
        cancelReason: String(outageEvent && (outageEvent.description || outageEvent.title) || "").trim(),
        isControlledByOutageEvent: Boolean(outageEvent),
        outageEventDetail: outageEvent
          ? {
              id: String(outageEvent.id || "").trim(),
              sourceEventId: String(outageEvent.sourceEventId || outageEvent.id || "").trim(),
              occurrenceId: String(outageEvent.occurrenceId || "").trim(),
              title: String(outageEvent.title || "").trim(),
              startDate: String(outageEvent.startDate || "").slice(0, 10),
              endDate: String(outageEvent.endDate || outageEvent.startDate || "").slice(0, 10)
            }
          : null
      };

  setActiveView(activeViewId);
  return false;
};
window.UnterrichtsassistentApp.openTodoModal = function (todoId, presetCategory, presetPriority) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedTodoId = String(todoId || "").trim();
  const normalizedPresetCategory = normalizePlanningEventCategoryValue(presetCategory);
  const normalizedPresetPriority = ["niedrig", "standard", "hoch"].indexOf(String(presetPriority || "").trim().toLowerCase()) >= 0
    ? String(presetPriority || "").trim().toLowerCase()
    : "niedrig";
  const existingTodo = normalizedTodoId
    ? getTodosCollection(currentRawSnapshot).find(function (todoItem) {
        return String(todoItem && todoItem.id || "").trim() === normalizedTodoId;
      }) || null
    : null;
  const existingChecklistItems = existingTodo && Array.isArray(existingTodo.checklistItems)
    ? existingTodo.checklistItems.map(function (entry) {
          if (entry && typeof entry === "object") {
            return {
              id: String(entry.id || "").trim(),
              title: String(entry.title || "").trim(),
              level: Number(entry.level) > 0 ? Math.floor(Number(entry.level)) : 1,
              parentId: String(entry.parentId || "").trim(),
              done: Boolean(entry.done),
              completedAt: Boolean(entry.done) ? String(entry.completedAt || "").trim() : "",
              followUpSteps: Array.isArray(entry.followUpSteps)
                ? entry.followUpSteps.map(function (step) {
                    if (step && typeof step === "object") {
                      return {
                        id: String(step.id || "").trim(),
                        title: String(step.title || "").trim(),
                        done: Boolean(step.done),
                        completedAt: Boolean(step.done) ? String(step.completedAt || "").trim() : "",
                        level: Number(step.level) > 0 ? Math.floor(Number(step.level)) : 1,
                        previousStepId: String(step.previousStepId || "").trim()
                      };
                    }

                    return {
                      id: "",
                      title: String(step || "").trim(),
                      done: false,
                      completedAt: "",
                      level: 1,
                      previousStepId: ""
                    };
                }).filter(function (step) {
                  return Boolean(step && step.title);
                })
              : []
          };
        }

          return {
            id: "",
            title: String(entry || "").trim(),
            level: 1,
            parentId: "",
            done: false,
            completedAt: "",
            followUpSteps: []
          };
      }).filter(function (entry) {
        return Boolean(entry.title);
      })
    : [];

    activeTodoDraft = existingTodo
      ? {
          id: String(existingTodo.id || "").trim(),
          title: String(existingTodo.title || "").trim(),
          description: String(existingTodo.description || "").trim(),
          category: String(existingTodo.category || "").trim(),
          dueDate: String(existingTodo.dueDate || "").slice(0, 10),
          relatedClassId: String(existingTodo.relatedClassId || "").trim(),
          assignedStudentIds: Array.isArray(existingTodo.assignedStudentIds)
            ? existingTodo.assignedStudentIds.map(function (studentId) {
                return String(studentId || "").trim();
              }).filter(Boolean)
            : [],
          assignedStudentStatuses: Array.isArray(existingTodo.assignedStudentStatuses)
            ? existingTodo.assignedStudentStatuses.map(function (entry) {
                return entry && typeof entry === "object"
                    ? {
                        studentId: String(entry.studentId || "").trim(),
                        done: Boolean(entry.done),
                        completedAt: Boolean(entry.done) ? String(entry.completedAt || "").trim() : "",
                        checklistItems: cloneTodoChecklistItems(entry.checklistItems)
                      }
                  : null;
              }).filter(Boolean)
            : [],
          priority: ["niedrig", "standard", "hoch"].indexOf(String(existingTodo.priority || "").trim().toLowerCase()) >= 0
            ? String(existingTodo.priority || "").trim().toLowerCase()
            : "niedrig",
        type: ["standard", "checkliste", "step-checkliste"].indexOf(String(existingTodo.type || "").trim().toLowerCase()) >= 0
          ? String(existingTodo.type || "").trim().toLowerCase()
          : "standard",
        checklistItems: existingChecklistItems.slice(),
        checklistText: formatTodoChecklistText(existingChecklistItems),
        done: Boolean(existingTodo.done),
        completedAt: Boolean(existingTodo.done) ? String(existingTodo.completedAt || "").trim() : ""
      }
      : {
          id: "",
          title: "",
          description: "",
          category: normalizedPresetCategory,
          dueDate: "",
          relatedClassId: "",
          assignedStudentIds: [],
          assignedStudentStatuses: [],
          priority: normalizedPresetPriority,
          type: "standard",
          checklistItems: [],
        checklistText: "",
        done: false,
        completedAt: ""
        };

    todoStudentAssignmentOpen = false;
    normalizeTodoDraftAssignments(currentRawSnapshot);
    closePlanningCategorySuggestions();
    setActiveView(activeViewId === "unterricht" ? "unterricht" : "todos");
    return false;
  };
window.UnterrichtsassistentApp.setTodoDraftType = function (nextType) {
  if (!activeTodoDraft) {
    return false;
  }

  const titleInput = document.getElementById("todoTitleInput");
  const descriptionInput = document.getElementById("todoDescriptionInput");
  const categoryInput = document.getElementById("todoCategoryInput");
  const dueDateInput = document.getElementById("todoDueDateInput");
  const priorityInput = document.getElementById("todoPriorityInput");
  const checklistInput = document.getElementById("todoChecklistInput");
  const doneInput = document.getElementById("todoDoneInput");

  activeTodoDraft.title = String(titleInput && titleInput.value || activeTodoDraft.title || "").trim();
  activeTodoDraft.description = String(descriptionInput && descriptionInput.value || activeTodoDraft.description || "").trim();
  activeTodoDraft.category = normalizePlanningEventCategoryValue(categoryInput && categoryInput.value || activeTodoDraft.category || "");
  normalizeTodoDraftAssignments(schoolService ? serializeSnapshot(schoolService.snapshot) : null);
  activeTodoDraft.dueDate = String(dueDateInput && dueDateInput.value || activeTodoDraft.dueDate || "").slice(0, 10);
  activeTodoDraft.priority = ["niedrig", "standard", "hoch"].indexOf(String(priorityInput && priorityInput.value || activeTodoDraft.priority || "").trim().toLowerCase()) >= 0
    ? String(priorityInput && priorityInput.value || activeTodoDraft.priority || "").trim().toLowerCase()
    : "niedrig";
  activeTodoDraft.done = Boolean(doneInput && doneInput.checked || activeTodoDraft.done);
  activeTodoDraft.checklistText = String(checklistInput && checklistInput.value || activeTodoDraft.checklistText || "");

  activeTodoDraft.type = ["standard", "checkliste", "step-checkliste"].indexOf(String(nextType || "").trim().toLowerCase()) >= 0
    ? String(nextType || "").trim().toLowerCase()
    : "standard";

  if (activeViewId === "todos" || activeViewId === "unterricht") {
    setActiveView(activeViewId);
  }

  return false;
};
window.UnterrichtsassistentApp.updateTodoDraftCategory = function (nextValue, shouldRefreshView) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const previousClassId = String(activeTodoDraft && activeTodoDraft.relatedClassId || "").trim();
  const previousCategory = String(activeTodoDraft && activeTodoDraft.category || "").trim();

  if (!activeTodoDraft) {
    return false;
  }

  activeTodoDraft.category = normalizePlanningEventCategoryValue(nextValue || activeTodoDraft.category || "");
  normalizeTodoDraftAssignments(currentRawSnapshot);

  if (!String(activeTodoDraft.relatedClassId || "").trim()) {
    todoStudentAssignmentOpen = false;
  }

  if (shouldRefreshView !== false && activeViewId === "todos" && (
    previousClassId !== String(activeTodoDraft.relatedClassId || "").trim()
    || previousCategory !== String(activeTodoDraft.category || "").trim()
  )) {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.updateTodoChecklistText = function (nextValue) {
  if (!activeTodoDraft) {
    return false;
  }

  activeTodoDraft.checklistText = String(nextValue || "");
  return false;
};
window.UnterrichtsassistentApp.closeTodoModal = function () {
  activeTodoDraft = null;
  todoStudentAssignmentOpen = false;
  closePlanningCategorySuggestions();

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.setTodoStatusFilter = function (nextFilter) {
  const normalizedFilter = ["alle", "offen", "erledigt"].indexOf(String(nextFilter || "").trim().toLowerCase()) >= 0
    ? String(nextFilter || "").trim().toLowerCase()
    : "alle";

  todoStatusFilter = normalizedFilter;

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.setTodoViewMode = function (nextMode) {
  const normalizedMode = ["liste", "prioritaet", "kategorie"].indexOf(String(nextMode || "").trim().toLowerCase()) >= 0
    ? String(nextMode || "").trim().toLowerCase()
    : "liste";

  todoViewMode = normalizedMode;

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.setTodoSortMode = function (nextMode) {
  const normalizedMode = ["dringlichkeit", "prioritaet", "deadline"].indexOf(String(nextMode || "").trim().toLowerCase()) >= 0
    ? String(nextMode || "").trim().toLowerCase()
    : "dringlichkeit";

  todoSortMode = normalizedMode;

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.toggleTodoCategoryFilterOpen = function () {
  todoCategoryFilterOpen = !todoCategoryFilterOpen;

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.toggleTodoStudentAssignmentOpen = function () {
  if (!activeTodoDraft || !String(activeTodoDraft.relatedClassId || "").trim()) {
    return false;
  }

  todoStudentAssignmentOpen = !todoStudentAssignmentOpen;

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.selectAllTodoAssignedStudents = function () {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const classInfo = normalizeTodoDraftAssignments(currentRawSnapshot);

  if (!activeTodoDraft || !classInfo.isClassCategory) {
    return false;
  }

  activeTodoDraft.assignedStudentIds = classInfo.students.map(function (student) {
    return String(student && student.id || "").trim();
  }).filter(Boolean);
  normalizeTodoDraftAssignments(currentRawSnapshot);

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.clearAllTodoAssignedStudents = function () {
  if (!activeTodoDraft) {
    return false;
  }

  activeTodoDraft.assignedStudentIds = [];

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.toggleTodoAssignedStudent = function (studentId) {
  const normalizedStudentId = String(studentId || "").trim();
  const selectedIds = Array.isArray(activeTodoDraft && activeTodoDraft.assignedStudentIds)
    ? activeTodoDraft.assignedStudentIds.slice()
    : [];
  const existingIndex = selectedIds.indexOf(normalizedStudentId);

  if (!activeTodoDraft || !normalizedStudentId || !String(activeTodoDraft.relatedClassId || "").trim()) {
    return false;
  }

  if (existingIndex >= 0) {
    selectedIds.splice(existingIndex, 1);
  } else {
    selectedIds.push(normalizedStudentId);
  }

  activeTodoDraft.assignedStudentIds = selectedIds;
  normalizeTodoDraftAssignments(schoolService ? serializeSnapshot(schoolService.snapshot) : null);

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.selectAllTodoCategoryFilters = function () {
  todoCategoryFilters = [];
  todoCategoryFilterAllOff = false;

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.clearAllTodoCategoryFilters = function () {
  todoCategoryFilters = [];
  todoCategoryFilterAllOff = true;

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.selectTodoClassCategoryFilters = function () {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;

  todoCategoryFilters = getPlanningCategoryDefinitions(currentRawSnapshot).filter(function (entry) {
    return Boolean(entry && entry.isClassCategory);
  }).map(function (entry) {
    return String(entry && entry.name || "").trim();
  }).filter(Boolean);
  todoCategoryFilterAllOff = todoCategoryFilters.length === 0;

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.toggleTodoCategoryFilter = function (categoryName) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedName = String(categoryName || "").trim();
  const normalizedLowerName = normalizedName.toLowerCase();
  const allCategories = getDefaultTodoCategoryFilters(currentRawSnapshot);
  const normalizedAllCategories = allCategories.map(function (entry) {
    return String(entry || "").trim();
  }).filter(Boolean);
  let nextFilters = todoCategoryFilters.slice();
  let selectedIndex = nextFilters.findIndex(function (entry) {
    return String(entry || "").trim().toLowerCase() === normalizedLowerName;
  });

  if (!normalizedName) {
    return false;
  }

  if (!nextFilters.length && !todoCategoryFilterAllOff) {
    nextFilters = normalizedAllCategories.slice();
    selectedIndex = nextFilters.findIndex(function (entry) {
      return String(entry || "").trim().toLowerCase() === normalizedLowerName;
    });
  }

  if (selectedIndex >= 0) {
    nextFilters.splice(selectedIndex, 1);
  } else {
    nextFilters.push(normalizedName);
  }

  todoCategoryFilters = nextFilters.filter(function (entry, index, array) {
    return array.findIndex(function (candidate) {
      return String(candidate || "").trim().toLowerCase() === String(entry || "").trim().toLowerCase();
    }) === index;
  });
  todoCategoryFilterAllOff = todoCategoryFilters.length === 0;

  if (activeViewId === "todos") {
    setActiveView("todos");
  }

  return false;
};
window.UnterrichtsassistentApp.toggleTodoExpanded = function (todoId) {
  const normalizedTodoId = String(todoId || "").trim();

  if (!normalizedTodoId) {
    return false;
  }

  if (expandedTodoIds.indexOf(normalizedTodoId) >= 0) {
    expandedTodoIds = expandedTodoIds.filter(function (entry) {
      return entry !== normalizedTodoId;
    });
  } else {
    expandedTodoIds = expandedTodoIds.concat([normalizedTodoId]);
  }

  if (activeViewId === "todos" || activeViewId === "unterricht") {
    setActiveView(activeViewId);
  }

  return false;
};

function refreshTodoInteractionView() {
  if (activeViewId === "todos" || activeViewId === "unterricht") {
    setActiveView(activeViewId);
  }
}

window.UnterrichtsassistentApp.toggleTodoDone = function (todoId, isDone) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedTodoId = String(todoId || "").trim();
  const todos = getMutableTodosCollection(currentRawSnapshot);
  const selectedTodo = todos.find(function (todoItem) {
    return String(todoItem && todoItem.id || "").trim() === normalizedTodoId;
  }) || null;

  if (!currentRawSnapshot || !normalizedTodoId || !selectedTodo) {
    return false;
  }

  if (String(selectedTodo.type || "").trim().toLowerCase() === "checkliste") {
    syncChecklistTodoCompletion(selectedTodo, getActiveDateTimeTimestamp());

    if (activeTodoDraft && String(activeTodoDraft.id || "").trim() === normalizedTodoId) {
      activeTodoDraft.done = Boolean(selectedTodo.done);
      activeTodoDraft.completedAt = String(selectedTodo.completedAt || "").trim();
    }

    refreshTodoInteractionView();

    return false;
  }

  if (Array.isArray(selectedTodo.assignedStudentIds) && selectedTodo.assignedStudentIds.length > 0) {
    syncTodoAssignedStudentStatuses(selectedTodo, getActiveDateTimeTimestamp());

    if (activeTodoDraft && String(activeTodoDraft.id || "").trim() === normalizedTodoId) {
      activeTodoDraft.done = Boolean(selectedTodo.done);
      activeTodoDraft.completedAt = String(selectedTodo.completedAt || "").trim();
      activeTodoDraft.assignedStudentStatuses = Array.isArray(selectedTodo.assignedStudentStatuses)
        ? selectedTodo.assignedStudentStatuses.map(function (entry) {
            return entry && typeof entry === "object" ? Object.assign({}, entry) : entry;
          })
        : [];
    }

    refreshTodoInteractionView();

    return false;
  }

  selectedTodo.done = Boolean(isDone);
  selectedTodo.completedAt = selectedTodo.done
    ? (String(selectedTodo.completedAt || "").trim() || getActiveDateTimeTimestamp())
    : "";

  if (activeTodoDraft && String(activeTodoDraft.id || "").trim() === normalizedTodoId) {
    activeTodoDraft.done = Boolean(isDone);
    activeTodoDraft.completedAt = selectedTodo.completedAt;
  }

  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId === "unterricht" ? "unterricht" : "todos");
  return false;
};
window.UnterrichtsassistentApp.toggleTodoAssignedStudentDone = function (todoId, studentId, isDone) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedTodoId = String(todoId || "").trim();
  const normalizedStudentId = String(studentId || "").trim();
  const todos = getMutableTodosCollection(currentRawSnapshot);
  let selectedTodo = todos.find(function (todoItem) {
    return String(todoItem && todoItem.id || "").trim() === normalizedTodoId;
  }) || null;
  let assignedStudentStatuses = [];
  let selectedStatus = null;

  if (!currentRawSnapshot || !selectedTodo || !normalizedStudentId) {
    return false;
  }

  syncTodoAssignedStudentStatuses(selectedTodo, getActiveDateTimeTimestamp());
  assignedStudentStatuses = Array.isArray(selectedTodo.assignedStudentStatuses)
    ? selectedTodo.assignedStudentStatuses
    : [];
  selectedStatus = assignedStudentStatuses.find(function (entry) {
    return String(entry && entry.studentId || "").trim() === normalizedStudentId;
  }) || null;

  if (!selectedStatus) {
    return false;
  }

  selectedStatus.done = Boolean(isDone);
  syncTodoAssignedStudentStatuses(selectedTodo, getActiveDateTimeTimestamp());

  if (activeTodoDraft && String(activeTodoDraft.id || "").trim() === normalizedTodoId) {
    activeTodoDraft.done = Boolean(selectedTodo.done);
    activeTodoDraft.completedAt = String(selectedTodo.completedAt || "").trim();
    activeTodoDraft.assignedStudentStatuses = assignedStudentStatuses.map(function (entry) {
      return entry && typeof entry === "object" ? Object.assign({}, entry) : entry;
    });
  }

  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId === "unterricht" ? "unterricht" : "todos");
  return false;
};
window.UnterrichtsassistentApp.toggleTodoChecklistItemDone = function (todoId, checklistItemId, isDone) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedTodoId = String(todoId || "").trim();
  const normalizedChecklistItemId = String(checklistItemId || "").trim();
  const normalizedStudentId = String(arguments.length > 3 ? arguments[3] || "" : "").trim();
  const todos = getMutableTodosCollection(currentRawSnapshot);
  const selectedTodo = todos.find(function (todoItem) {
    return String(todoItem && todoItem.id || "").trim() === normalizedTodoId;
  }) || null;
  const studentStatus = normalizedStudentId && Array.isArray(selectedTodo && selectedTodo.assignedStudentStatuses)
    ? selectedTodo.assignedStudentStatuses.find(function (entry) {
        return String(entry && entry.studentId || "").trim() === normalizedStudentId;
      }) || null
    : null;
  const checklistItems = studentStatus && Array.isArray(studentStatus.checklistItems)
    ? studentStatus.checklistItems
    : (Array.isArray(selectedTodo && selectedTodo.checklistItems) ? selectedTodo.checklistItems : []);
  const selectedItem = checklistItems.find(function (entry) {
    return String(entry && entry.id || "").trim() === normalizedChecklistItemId;
  }) || null;
  const completionTimestamp = getActiveDateTimeTimestamp();

  if (!currentRawSnapshot || !selectedTodo || !selectedItem) {
    return false;
  }

  if (!isTodoChecklistItemManuallyToggleable(checklistItems, normalizedChecklistItemId)) {
    syncChecklistTodoCompletion(selectedTodo, completionTimestamp);

    if (activeTodoDraft && String(activeTodoDraft.id || "").trim() === normalizedTodoId) {
      activeTodoDraft.checklistItems = checklistItems.map(function (entry) {
        return Object.assign({}, entry, {
          followUpSteps: Array.isArray(entry.followUpSteps) ? entry.followUpSteps.map(function (step) {
            return step && typeof step === "object" ? Object.assign({}, step) : step;
          }) : []
        });
      });
      activeTodoDraft.assignedStudentStatuses = Array.isArray(selectedTodo.assignedStudentStatuses)
        ? selectedTodo.assignedStudentStatuses.map(function (entry) {
            return entry && typeof entry === "object"
              ? Object.assign({}, entry, { checklistItems: cloneTodoChecklistItems(entry.checklistItems) })
              : entry;
          })
        : [];
      activeTodoDraft.checklistText = formatTodoChecklistText(activeTodoDraft.checklistItems);
      activeTodoDraft.done = Boolean(selectedTodo.done);
      activeTodoDraft.completedAt = String(selectedTodo.completedAt || "").trim();
    }

    refreshTodoInteractionView();

    return false;
  }

  if (!Boolean(isDone) && hasTodoChecklistCompletedFollowUpSuccessor(checklistItems, normalizedChecklistItemId)) {
    syncChecklistTodoCompletion(selectedTodo, completionTimestamp);

    if (activeTodoDraft && String(activeTodoDraft.id || "").trim() === normalizedTodoId) {
      activeTodoDraft.checklistItems = checklistItems.map(function (entry) {
        return Object.assign({}, entry, {
          followUpSteps: Array.isArray(entry.followUpSteps) ? entry.followUpSteps.map(function (step) {
            return step && typeof step === "object" ? Object.assign({}, step) : step;
          }) : []
        });
      });
      activeTodoDraft.assignedStudentStatuses = Array.isArray(selectedTodo.assignedStudentStatuses)
        ? selectedTodo.assignedStudentStatuses.map(function (entry) {
            return entry && typeof entry === "object"
              ? Object.assign({}, entry, { checklistItems: cloneTodoChecklistItems(entry.checklistItems) })
              : entry;
          })
        : [];
      activeTodoDraft.checklistText = formatTodoChecklistText(activeTodoDraft.checklistItems);
      activeTodoDraft.done = Boolean(selectedTodo.done);
      activeTodoDraft.completedAt = String(selectedTodo.completedAt || "").trim();
    }

    refreshTodoInteractionView();

    return false;
  }

  selectedItem.done = Boolean(isDone);
  syncChecklistTodoCompletion(selectedTodo, completionTimestamp);

  if (activeTodoDraft && String(activeTodoDraft.id || "").trim() === normalizedTodoId) {
    activeTodoDraft.checklistItems = checklistItems.map(function (entry) {
      return Object.assign({}, entry, {
        followUpSteps: Array.isArray(entry.followUpSteps) ? entry.followUpSteps.map(function (step) {
          return step && typeof step === "object" ? Object.assign({}, step) : step;
        }) : []
      });
    });
    activeTodoDraft.assignedStudentStatuses = Array.isArray(selectedTodo.assignedStudentStatuses)
      ? selectedTodo.assignedStudentStatuses.map(function (entry) {
          return entry && typeof entry === "object"
            ? Object.assign({}, entry, { checklistItems: cloneTodoChecklistItems(entry.checklistItems) })
            : entry;
        })
      : [];
    activeTodoDraft.checklistText = formatTodoChecklistText(activeTodoDraft.checklistItems);
    activeTodoDraft.done = Boolean(selectedTodo.done);
    activeTodoDraft.completedAt = String(selectedTodo.completedAt || "").trim();
  }

  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId === "unterricht" ? "unterricht" : "todos");
  return false;
};
window.UnterrichtsassistentApp.toggleTodoChecklistFollowUpDone = function (todoId, checklistItemId, followUpIndex, isDone) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedTodoId = String(todoId || "").trim();
  const normalizedChecklistItemId = String(checklistItemId || "").trim();
  const normalizedStudentId = String(arguments.length > 4 ? arguments[4] || "" : "").trim();
  const followUpPosition = Number(followUpIndex);
  const todos = getMutableTodosCollection(currentRawSnapshot);
  const selectedTodo = todos.find(function (todoItem) {
    return String(todoItem && todoItem.id || "").trim() === normalizedTodoId;
  }) || null;
  const studentStatus = normalizedStudentId && Array.isArray(selectedTodo && selectedTodo.assignedStudentStatuses)
    ? selectedTodo.assignedStudentStatuses.find(function (entry) {
        return String(entry && entry.studentId || "").trim() === normalizedStudentId;
      }) || null
    : null;
  const checklistItems = studentStatus && Array.isArray(studentStatus.checklistItems)
    ? studentStatus.checklistItems
    : (Array.isArray(selectedTodo && selectedTodo.checklistItems) ? selectedTodo.checklistItems : []);
  const selectedItem = checklistItems.find(function (entry) {
    return String(entry && entry.id || "").trim() === normalizedChecklistItemId;
  }) || null;
  const followUpSteps = Array.isArray(selectedItem && selectedItem.followUpSteps) ? selectedItem.followUpSteps : [];
  const selectedStep = Number.isInteger(followUpPosition) && followUpPosition >= 0
    ? followUpSteps[followUpPosition] || null
    : null;

  if (!currentRawSnapshot || !selectedTodo || !selectedItem || !selectedStep || typeof selectedStep !== "object") {
    return false;
  }

  if (!isTodoChecklistItemManuallyToggleable(checklistItems, String(selectedStep.id || "").trim())) {
    syncChecklistTodoCompletion(selectedTodo, getActiveDateTimeTimestamp());

    if (activeTodoDraft && String(activeTodoDraft.id || "").trim() === normalizedTodoId) {
      activeTodoDraft.checklistItems = checklistItems.map(function (entry) {
        return Object.assign({}, entry, {
          followUpSteps: Array.isArray(entry.followUpSteps) ? entry.followUpSteps.map(function (step) {
            return step && typeof step === "object" ? Object.assign({}, step) : step;
          }) : []
        });
      });
      activeTodoDraft.assignedStudentStatuses = Array.isArray(selectedTodo.assignedStudentStatuses)
        ? selectedTodo.assignedStudentStatuses.map(function (entry) {
            return entry && typeof entry === "object"
              ? Object.assign({}, entry, { checklistItems: cloneTodoChecklistItems(entry.checklistItems) })
              : entry;
          })
        : [];
      activeTodoDraft.checklistText = formatTodoChecklistText(activeTodoDraft.checklistItems);
      activeTodoDraft.done = Boolean(selectedTodo.done);
      activeTodoDraft.completedAt = String(selectedTodo.completedAt || "").trim();
    }

    refreshTodoInteractionView();

    return false;
  }

  if (!Boolean(isDone) && hasTodoChecklistCompletedFollowUpSuccessor(checklistItems, String(selectedStep.id || "").trim())) {
    syncChecklistTodoCompletion(selectedTodo, getActiveDateTimeTimestamp());

    if (activeTodoDraft && String(activeTodoDraft.id || "").trim() === normalizedTodoId) {
      activeTodoDraft.checklistItems = checklistItems.map(function (entry) {
        return Object.assign({}, entry, {
          followUpSteps: Array.isArray(entry.followUpSteps) ? entry.followUpSteps.map(function (step) {
            return step && typeof step === "object" ? Object.assign({}, step) : step;
          }) : []
        });
      });
      activeTodoDraft.assignedStudentStatuses = Array.isArray(selectedTodo.assignedStudentStatuses)
        ? selectedTodo.assignedStudentStatuses.map(function (entry) {
            return entry && typeof entry === "object"
              ? Object.assign({}, entry, { checklistItems: cloneTodoChecklistItems(entry.checklistItems) })
              : entry;
          })
        : [];
      activeTodoDraft.checklistText = formatTodoChecklistText(activeTodoDraft.checklistItems);
      activeTodoDraft.done = Boolean(selectedTodo.done);
      activeTodoDraft.completedAt = String(selectedTodo.completedAt || "").trim();
    }

    refreshTodoInteractionView();

    return false;
  }

  selectedStep.done = Boolean(isDone);
  syncChecklistTodoCompletion(selectedTodo, getActiveDateTimeTimestamp());

  if (activeTodoDraft && String(activeTodoDraft.id || "").trim() === normalizedTodoId) {
    activeTodoDraft.checklistItems = checklistItems.map(function (entry) {
      return Object.assign({}, entry, {
        followUpSteps: Array.isArray(entry.followUpSteps) ? entry.followUpSteps.map(function (step) {
          return step && typeof step === "object" ? Object.assign({}, step) : step;
        }) : []
      });
    });
    activeTodoDraft.assignedStudentStatuses = Array.isArray(selectedTodo.assignedStudentStatuses)
      ? selectedTodo.assignedStudentStatuses.map(function (entry) {
          return entry && typeof entry === "object"
            ? Object.assign({}, entry, { checklistItems: cloneTodoChecklistItems(entry.checklistItems) })
            : entry;
        })
      : [];
    activeTodoDraft.checklistText = formatTodoChecklistText(activeTodoDraft.checklistItems);
    activeTodoDraft.done = Boolean(selectedTodo.done);
    activeTodoDraft.completedAt = String(selectedTodo.completedAt || "").trim();
  }

  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId === "unterricht" ? "unterricht" : "todos");
  return false;
};
window.UnterrichtsassistentApp.submitTodoModal = function (event) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const todos = getMutableTodosCollection(currentRawSnapshot);
  const titleInput = document.getElementById("todoTitleInput");
  const descriptionInput = document.getElementById("todoDescriptionInput");
  const categoryInput = document.getElementById("todoCategoryInput");
  const dueDateInput = document.getElementById("todoDueDateInput");
  const priorityInput = document.getElementById("todoPriorityInput");
  const typeInput = document.getElementById("todoTypeInput");
  const checklistInput = document.getElementById("todoChecklistInput");
  const doneInput = document.getElementById("todoDoneInput");
  const titleValue = String(titleInput && titleInput.value || "").trim();
  const descriptionValue = String(descriptionInput && descriptionInput.value || "").trim();
  const categoryValue = normalizePlanningEventCategoryValue(categoryInput && categoryInput.value);
  const classInfo = getTodoCategoryClassInfo(currentRawSnapshot, categoryValue);
  const relatedClassIdValue = String(classInfo.classId || "").trim();
  const assignedStudentIdsValue = Array.isArray(activeTodoDraft && activeTodoDraft.assignedStudentIds)
    ? activeTodoDraft.assignedStudentIds.map(function (studentId) {
        return String(studentId || "").trim();
      }).filter(function (studentId, index, entries) {
        return Boolean(studentId)
          && classInfo.students.some(function (student) {
            return String(student && student.id || "").trim() === studentId;
          })
          && entries.indexOf(studentId) === index;
      })
    : [];
  const dueDateValue = String(dueDateInput && dueDateInput.value || "").slice(0, 10);
  const priorityValue = ["niedrig", "standard", "hoch"].indexOf(String(priorityInput && priorityInput.value || "").trim().toLowerCase()) >= 0
    ? String(priorityInput.value || "").trim().toLowerCase()
    : "niedrig";
  const typeValue = ["standard", "checkliste", "step-checkliste"].indexOf(String(typeInput && typeInput.value || "").trim().toLowerCase()) >= 0
    ? String(typeInput.value || "").trim().toLowerCase()
    : "standard";
  const checklistTextValue = String(checklistInput && checklistInput.value || activeTodoDraft && activeTodoDraft.checklistText || "");
  const checklistItemsValue = typeValue === "checkliste"
    ? parseTodoChecklistText(checklistTextValue)
    : [];
  const assignedStudentStatusesValue = assignedStudentIdsValue.map(function (studentId) {
    const existingEntry = Array.isArray(activeTodoDraft && activeTodoDraft.assignedStudentStatuses)
      ? activeTodoDraft.assignedStudentStatuses.find(function (entry) {
          return String(entry && entry.studentId || "").trim() === studentId;
        }) || null
      : null;

    return {
      studentId: studentId,
      done: Boolean(existingEntry && existingEntry.done),
      completedAt: Boolean(existingEntry && existingEntry.done)
        ? (String(existingEntry && existingEntry.completedAt || "").trim() || getActiveDateTimeTimestamp())
        : "",
      checklistItems: typeValue === "checkliste"
        ? cloneTodoChecklistItems(existingEntry && Array.isArray(existingEntry.checklistItems) && existingEntry.checklistItems.length
          ? existingEntry.checklistItems
          : checklistItemsValue)
        : []
    };
  });
  const doneValue = Boolean(doneInput && doneInput.checked);
  const completedAtValue = doneValue
    ? String(activeTodoDraft && activeTodoDraft.completedAt || "").trim() || getActiveDateTimeTimestamp()
    : "";
  let existingTodo = null;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!currentRawSnapshot || !activeTodoDraft || !titleValue) {
    return false;
  }

  if (activeTodoDraft.id) {
    existingTodo = todos.find(function (todoItem) {
      return String(todoItem && todoItem.id || "").trim() === String(activeTodoDraft.id || "").trim();
    }) || null;
  }

  if (existingTodo) {
    existingTodo.title = titleValue;
    existingTodo.description = descriptionValue;
    existingTodo.category = categoryValue;
    existingTodo.relatedClassId = relatedClassIdValue;
    existingTodo.assignedStudentIds = assignedStudentIdsValue.slice();
    existingTodo.assignedStudentStatuses = assignedStudentStatusesValue.slice();
    existingTodo.dueDate = dueDateValue;
    existingTodo.priority = priorityValue;
    existingTodo.type = typeValue;
    existingTodo.checklistItems = checklistItemsValue.slice();
    existingTodo.done = doneValue;
    existingTodo.completedAt = completedAtValue;
    if (typeValue === "checkliste") {
      syncChecklistTodoCompletion(existingTodo, getActiveDateTimeTimestamp());
    } else if (assignedStudentIdsValue.length > 0) {
      syncTodoAssignedStudentStatuses(existingTodo, getActiveDateTimeTimestamp());
    }
  } else {
    todos.push({
      id: createTodoId(),
      title: titleValue,
      description: descriptionValue,
      category: categoryValue,
      dueDate: dueDateValue,
      relatedClassId: relatedClassIdValue,
      assignedStudentIds: assignedStudentIdsValue.slice(),
      assignedStudentStatuses: assignedStudentStatusesValue.slice(),
      priority: priorityValue,
      type: typeValue,
      checklistItems: checklistItemsValue.slice(),
      done: doneValue,
      completedAt: completedAtValue
    });
    if (typeValue === "checkliste") {
      syncChecklistTodoCompletion(todos[todos.length - 1], getActiveDateTimeTimestamp());
    } else if (assignedStudentIdsValue.length > 0) {
      syncTodoAssignedStudentStatuses(todos[todos.length - 1], getActiveDateTimeTimestamp());
    }
  }

  if (categoryValue) {
    const collections = getPlanningCollections(currentRawSnapshot);
    const normalizedCategory = categoryValue.toLowerCase();
    const exists = collections.categories.some(function (entry) {
      return String(entry && entry.name || "").trim().toLowerCase() === normalizedCategory;
    });

    if (!exists) {
      collections.categories.push({
        id: createPlanningCategoryId(),
        name: categoryValue,
        color: ""
      });
    }
  }

  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId === "unterricht" ? "unterricht" : "todos");
  return window.UnterrichtsassistentApp.closeTodoModal();
};
window.UnterrichtsassistentApp.deleteTodo = function (todoId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedTodoId = String(todoId || "").trim();
  const nextTodos = getTodosCollection(currentRawSnapshot).filter(function (todoItem) {
    return String(todoItem && todoItem.id || "").trim() !== normalizedTodoId;
  });

  if (!currentRawSnapshot || !normalizedTodoId) {
    return false;
  }

  if (nextTodos.length === getTodosCollection(currentRawSnapshot).length) {
    return false;
  }

  if (!window.confirm("Soll dieses TODO wirklich geloescht werden?")) {
    return false;
  }

  currentRawSnapshot.todos = nextTodos;
  expandedTodoIds = expandedTodoIds.filter(function (entry) {
    return entry !== normalizedTodoId;
  });

  if (activeTodoDraft && String(activeTodoDraft.id || "").trim() === normalizedTodoId) {
    activeTodoDraft = null;
    closePlanningCategorySuggestions();
  }

  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId === "unterricht" ? "unterricht" : "todos");
  return false;
};
window.UnterrichtsassistentApp.closePlanningInstructionLessonModal = function () {
  activePlanningInstructionLessonDraft = null;

  if (activeViewId === "planung" || activeViewId === "stundenplan") {
    setActiveView(activeViewId);
  }

  return false;
};
window.UnterrichtsassistentApp.openTimetablePlanningEventDetail = function (eventId, occurrenceId, startDateValue, endDateValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedEventId = String(eventId || "").trim();
  const normalizedOccurrenceId = String(occurrenceId || "").trim();
  const normalizedStartDate = String(startDateValue || "").slice(0, 10);
  const normalizedEndDate = String(endDateValue || normalizedStartDate).slice(0, 10) || normalizedStartDate;
  const displayEvents = currentRawSnapshot
    ? getPlanningEventsForDisplay(currentRawSnapshot, {
        rangeStart: normalizedStartDate,
        rangeEnd: normalizedEndDate
      })
    : [];
  const detailEvent = displayEvents.find(function (entry) {
    if (normalizedOccurrenceId) {
      return String(entry && entry.occurrenceId || "").trim() === normalizedOccurrenceId;
    }

    return String(entry && entry.id || "").trim() === normalizedEventId
      && String(entry && entry.startDate || "").slice(0, 10) === normalizedStartDate
      && String(entry && entry.endDate || "").slice(0, 10) === normalizedEndDate;
  }) || null;

  if (!detailEvent) {
    return false;
  }

  activeTimetablePlanningEventDetail = {
    id: String(detailEvent.id || "").trim(),
    sourceEventId: String(detailEvent.sourceEventId || detailEvent.id || "").trim(),
    occurrenceId: String(detailEvent.occurrenceId || "").trim(),
    title: String(detailEvent.title || "").trim(),
    startDate: String(detailEvent.startDate || "").slice(0, 10),
    endDate: String(detailEvent.endDate || detailEvent.startDate || "").slice(0, 10),
    startTime: String(detailEvent.startTime || "").trim(),
    endTime: String(detailEvent.endTime || "").trim(),
    category: String(detailEvent.category || "").trim(),
    description: String(detailEvent.description || "").trim(),
    priority: [1, 2, 3].indexOf(Number(detailEvent.priority)) >= 0 ? Number(detailEvent.priority) : 3,
    isRecurringSeries: Boolean(detailEvent.isRecurringSeries),
    isRecurringOccurrence: Boolean(detailEvent.isRecurringOccurrence),
    originalStartDate: String(detailEvent.originalStartDate || detailEvent.startDate || "").slice(0, 10),
    originalEndDate: String(detailEvent.originalEndDate || detailEvent.endDate || "").slice(0, 10)
  };

  if (activeViewId === "stundenplan") {
    setActiveView("stundenplan");
  }

  return false;
};
window.UnterrichtsassistentApp.closeTimetablePlanningEventDetail = function () {
  if (!activeTimetablePlanningEventDetail) {
    return false;
  }

  activeTimetablePlanningEventDetail = null;

  if (activeViewId === "stundenplan") {
    setActiveView("stundenplan");
  }

  return false;
};
window.UnterrichtsassistentApp.openPlanningEventFromTimetableDetail = function () {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const detail = activeTimetablePlanningEventDetail;
  const targetDate = String(detail && detail.startDate || "").slice(0, 10);
  const targetTime = String(detail && detail.startTime || "12:00").trim() || "12:00";

  if (!currentRawSnapshot || !detail || !targetDate) {
    return false;
  }

  currentRawSnapshot.activeDateTime = targetDate + "T" + targetTime;
  currentRawSnapshot.activeDateTimeMode = "manual";
  planningViewMode = "jahresplanung";
  planningAdminMode = false;
  planningSidebarFilterOpen = false;
  planningSidebarCategoryFilters = [];
  planningSidebarCategoryFiltersInitialized = false;
  activeTimetablePlanningEventDetail = null;
  activePlanningEventDraft = null;
  activePlanningRangeDraft = null;
  selectedPlanningEventId = String(detail.sourceEventId || detail.id || "").trim();
  selectedPlanningEventOccurrenceId = String(detail.occurrenceId || "").trim();
  selectedPlanningEventOccurrenceRange = {
    startDate: String(detail.startDate || "").slice(0, 10),
    endDate: String(detail.endDate || detail.startDate || "").slice(0, 10)
  };

  refreshSnapshotInMemory(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.handlePlanningInstructionLessonCancelledChange = function (isChecked) {
  const isCancelled = Boolean(isChecked);
  const reasonField = document.getElementById("planningInstructionLessonReasonField");
  const reasonInput = document.getElementById("planningInstructionLessonReasonInput");

  if (activePlanningInstructionLessonDraft && activePlanningInstructionLessonDraft.isControlledByOutageEvent) {
    return false;
  }

  if (activePlanningInstructionLessonDraft) {
    activePlanningInstructionLessonDraft.isCancelled = isCancelled;
    if (!isCancelled) {
      activePlanningInstructionLessonDraft.cancelReason = "";
    }
  }

  if (reasonField) {
    reasonField.hidden = !isCancelled;
  }

  if (reasonInput) {
    reasonInput.disabled = !isCancelled;
    if (!isCancelled) {
      reasonInput.value = "";
    }
  }

  return false;
};
window.UnterrichtsassistentApp.submitPlanningInstructionLessonModal = function (event) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getPlanningCollections(currentRawSnapshot) : null;
  const cancelledInput = document.getElementById("planningInstructionLessonCancelledInput");
  const reasonInput = document.getElementById("planningInstructionLessonReasonInput");
  const classIdValue = String(activePlanningInstructionLessonDraft && activePlanningInstructionLessonDraft.classId || "").trim();
  const lessonDateValue = String(activePlanningInstructionLessonDraft && activePlanningInstructionLessonDraft.lessonDate || "").slice(0, 10);
  const isCancelled = Boolean(cancelledInput && cancelledInput.checked);
  const cancelReason = isCancelled ? String(reasonInput && reasonInput.value || "").trim() : "";
  let existingIndex = -1;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!currentRawSnapshot || !collections || !classIdValue || !lessonDateValue) {
    return window.UnterrichtsassistentApp.closePlanningInstructionLessonModal();
  }

  if (activePlanningInstructionLessonDraft && activePlanningInstructionLessonDraft.isControlledByOutageEvent) {
    return window.UnterrichtsassistentApp.closePlanningInstructionLessonModal();
  }

  existingIndex = collections.lessonStatuses.findIndex(function (entry) {
    return String(entry && entry.classId || "").trim() === classIdValue
      && String(entry && entry.lessonDate || "").slice(0, 10) === lessonDateValue;
  });

  if (!isCancelled) {
    if (existingIndex >= 0) {
      collections.lessonStatuses.splice(existingIndex, 1);
    }
  } else {
    const nextStatus = {
      id: existingIndex >= 0
        ? String(collections.lessonStatuses[existingIndex] && collections.lessonStatuses[existingIndex].id || "").trim()
        : createPlanningInstructionLessonStatusId(),
      classId: classIdValue,
      lessonDate: lessonDateValue,
      isCancelled: true,
      cancelReason: cancelReason
    };

    if (existingIndex >= 0) {
      collections.lessonStatuses[existingIndex] = nextStatus;
    } else {
      collections.lessonStatuses.push(nextStatus);
    }
  }

  currentRawSnapshot.planningInstructionLessonStatuses = collections.lessonStatuses;
  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId === "stundenplan" ? "stundenplan" : "planung");
  return window.UnterrichtsassistentApp.closePlanningInstructionLessonModal();
};
window.UnterrichtsassistentApp.openPlanningEventFromInstructionLessonModal = function () {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const draft = activePlanningInstructionLessonDraft;
  const detail = draft && draft.outageEventDetail ? draft.outageEventDetail : null;
  const targetDate = String(detail && detail.startDate || draft && draft.lessonDate || "").slice(0, 10);

  if (!currentRawSnapshot || !detail || !targetDate) {
    return false;
  }

  currentRawSnapshot.activeDateTime = targetDate + "T12:00";
  currentRawSnapshot.activeDateTimeMode = "manual";
  planningViewMode = "jahresplanung";
  planningAdminMode = false;
  planningSidebarFilterOpen = false;
  planningSidebarCategoryFilters = [];
  planningSidebarCategoryFiltersInitialized = false;
  activePlanningEventDraft = null;
  activePlanningRangeDraft = null;
  selectedPlanningEventId = String(detail.sourceEventId || detail.id || "").trim();
  selectedPlanningEventOccurrenceId = String(detail.occurrenceId || "").trim();
  selectedPlanningEventOccurrenceRange = {
    startDate: String(detail.startDate || "").slice(0, 10),
    endDate: String(detail.endDate || detail.startDate || "").slice(0, 10)
  };

  activePlanningInstructionLessonDraft = null;
  refreshSnapshotInMemory(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.openCurriculumSeriesModal = function (seriesId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedSeriesId = String(seriesId || "").trim();
  let existingSeries = null;

  if (!isCurriculumPlanningMode() || planningAdminMode || !activeClass) {
    return false;
  }

  if (normalizedSeriesId && collections) {
    existingSeries = collections.series.find(function (entry) {
      return String(entry && entry.id || "").trim() === normalizedSeriesId
        && String(entry && entry.classId || "").trim() === String(activeClass.id || "").trim();
    }) || null;
  }

  activeCurriculumSequenceDraft = null;
  activeCurriculumLessonDraft = null;
  activeCurriculumSeriesDraft = existingSeries
    ? {
        id: String(existingSeries.id || "").trim(),
        classId: String(existingSeries.classId || "").trim(),
        topic: String(existingSeries.topic || "").trim(),
        hourDemand: Math.max(0, Number(existingSeries.hourDemand) || 0),
        color: getCurriculumSeriesColor(existingSeries, String(existingSeries.id || "").trim()),
        startMode: String(existingSeries.startMode || "").trim() === "manual" ? "manual" : "automatic",
        startDate: String(existingSeries.startDate || "").trim(),
        nextSeriesId: String(existingSeries.nextSeriesId || "").trim()
      }
    : {
        id: "",
        classId: String(activeClass.id || "").trim(),
        topic: "",
        hourDemand: 0,
        color: createRandomCurriculumSeriesColor(),
        startMode: "automatic",
        startDate: "",
        nextSeriesId: ""
      };

  setActiveView("planung");
  return false;
};
window.UnterrichtsassistentApp.toggleCurriculumSeriesExpansion = function (seriesId) {
  const normalizedSeriesId = String(seriesId || "").trim();
  const currentIndex = expandedCurriculumSeriesIds.indexOf(normalizedSeriesId);

  if (!isCurriculumStructureWorkspaceActive() || !normalizedSeriesId) {
    return false;
  }

  if (currentIndex >= 0) {
    expandedCurriculumSeriesIds = expandedCurriculumSeriesIds.filter(function (entry) {
      return entry !== normalizedSeriesId;
    });
    expandedCurriculumSequenceIds = expandedCurriculumSequenceIds.filter(function (entry) {
      const parts = String(entry || "").split("::");
      return parts[0] !== normalizedSeriesId;
    });
  } else {
    expandedCurriculumSeriesIds = expandedCurriculumSeriesIds.concat([normalizedSeriesId]);
  }

  activeCurriculumSequenceDraft = null;
  activeCurriculumLessonDraft = null;

  if (activeViewId === "planung" || activeViewId === "bewertung") {
    setActiveView(activeViewId);
  }

  return false;
};
window.UnterrichtsassistentApp.startCurriculumSeriesDrag = function (event, seriesId) {
  const normalizedSeriesId = String(seriesId || "").trim();
  const normalizedColor = normalizePlanningColorValue(event && event.currentTarget ? event.currentTarget.getAttribute("data-series-color") : "") || "#d9d4cb";
  const sourceElement = event && event.currentTarget ? event.currentTarget : null;

  if (!isCurriculumPlanningMode() || !normalizedSeriesId || !event) {
    return false;
  }

  activeCurriculumSeriesDrag = {
    seriesId: normalizedSeriesId,
    color: normalizedColor,
    pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    startX: Number(event.clientX) || 0,
    startY: Number(event.clientY) || 0,
    sourceElement: sourceElement,
    isPointerDrag: typeof event.pointerId === "number",
    didDrag: false
  };
  clearCurriculumSeriesDropIndicator();

  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  if (typeof event.stopPropagation === "function") {
    event.stopPropagation();
  }

  if (sourceElement && typeof event.pointerId === "number") {
    trySetPointerCapture(sourceElement, event.pointerId);
    window.addEventListener("pointermove", window.UnterrichtsassistentApp.handleCurriculumSeriesPointerMove);
    window.addEventListener("pointerup", window.UnterrichtsassistentApp.handleCurriculumSeriesPointerEnd);
    window.addEventListener("pointercancel", window.UnterrichtsassistentApp.handleCurriculumSeriesPointerEnd);
    updateCurriculumSeriesDragPreview(event.clientX, event.clientY, normalizedColor);
    return false;
  }

  if (event && event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", normalizedSeriesId);
  }

  return true;
};
window.UnterrichtsassistentApp.allowCurriculumSeriesDrop = function (event, targetSeriesId) {
  const normalizedTargetSeriesId = String(targetSeriesId || "").trim();
  const draggedSeriesId = activeCurriculumSeriesDrag
    ? String(activeCurriculumSeriesDrag.seriesId || "").trim()
    : String(event && event.dataTransfer ? event.dataTransfer.getData("text/plain") || "" : "").trim();
  const placement = normalizedTargetSeriesId
    ? getCurriculumSeriesDropPlacement(event)
    : "after";

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (event && event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }

  if (!draggedSeriesId || draggedSeriesId === normalizedTargetSeriesId) {
    clearCurriculumSeriesDropIndicator();
    return false;
  }

  setCurriculumSeriesDropIndicator(
    normalizedTargetSeriesId,
    placement,
    activeCurriculumSeriesDrag ? activeCurriculumSeriesDrag.color : ""
  );
  return false;
};
window.UnterrichtsassistentApp.handleCurriculumSeriesDropLeave = function (event, targetSeriesId) {
  const relatedTarget = event && event.relatedTarget ? event.relatedTarget : null;
  const currentTarget = event && event.currentTarget ? event.currentTarget : null;
  const normalizedTargetSeriesId = String(targetSeriesId || "").trim();

  if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
    return false;
  }

  if (activeCurriculumSeriesDropIndicator
    && String(activeCurriculumSeriesDropIndicator.targetSeriesId || "").trim() === normalizedTargetSeriesId) {
    clearCurriculumSeriesDropIndicator();
  }

  return false;
};
window.UnterrichtsassistentApp.dropCurriculumSeries = function (event, targetSeriesId) {
  const normalizedTargetSeriesId = String(targetSeriesId || "").trim();
  const draggedSeriesId = activeCurriculumSeriesDrag
    ? String(activeCurriculumSeriesDrag.seriesId || "").trim()
    : String(event && event.dataTransfer ? event.dataTransfer.getData("text/plain") || "" : "").trim();
  const placement = normalizedTargetSeriesId
    ? getCurriculumSeriesDropPlacement(event)
    : "after";

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  clearCurriculumSeriesDropIndicator();
  activeCurriculumSeriesDrag = null;

  if (!draggedSeriesId || draggedSeriesId === normalizedTargetSeriesId) {
    return false;
  }

  return reorderCurriculumSeries(draggedSeriesId, normalizedTargetSeriesId, placement);
};
window.UnterrichtsassistentApp.endCurriculumSeriesDrag = function () {
  activeCurriculumSeriesDrag = null;
  clearCurriculumSeriesDropIndicator();
  removeCurriculumSeriesDragPreview();
  return false;
};
window.UnterrichtsassistentApp.handleCurriculumSeriesPointerMove = function (event) {
  const deltaX = activeCurriculumSeriesDrag ? (Number(event.clientX) || 0) - activeCurriculumSeriesDrag.startX : 0;
  const deltaY = activeCurriculumSeriesDrag ? (Number(event.clientY) || 0) - activeCurriculumSeriesDrag.startY : 0;
  const dropTarget = getCurriculumSeriesDropTargetFromPoint(event && event.clientX, event && event.clientY);

  if (!activeCurriculumSeriesDrag || !activeCurriculumSeriesDrag.isPointerDrag || event.pointerId !== activeCurriculumSeriesDrag.pointerId) {
    return false;
  }

  if (!activeCurriculumSeriesDrag.didDrag) {
    if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) {
      return false;
    }

    activeCurriculumSeriesDrag.didDrag = true;
  }

  updateCurriculumSeriesDragPreview(event.clientX, event.clientY, activeCurriculumSeriesDrag.color);
  updatePlanningCurriculumAutoScroll(Number(event.clientX) || 0);

  if (!dropTarget || String(dropTarget.targetSeriesId || "").trim() === String(activeCurriculumSeriesDrag.seriesId || "").trim()) {
    clearCurriculumSeriesDropIndicator();
  } else {
    setCurriculumSeriesDropIndicator(dropTarget.targetSeriesId, dropTarget.placement, activeCurriculumSeriesDrag.color);
  }

  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.handleCurriculumSeriesPointerEnd = function (event) {
  const pointerId = activeCurriculumSeriesDrag ? activeCurriculumSeriesDrag.pointerId : null;
  const sourceElement = activeCurriculumSeriesDrag ? activeCurriculumSeriesDrag.sourceElement : null;
  const didDrag = activeCurriculumSeriesDrag ? activeCurriculumSeriesDrag.didDrag === true : false;
  const draggedSeriesId = activeCurriculumSeriesDrag ? String(activeCurriculumSeriesDrag.seriesId || "").trim() : "";
  const dropIndicator = activeCurriculumSeriesDropIndicator
    ? {
        targetSeriesId: String(activeCurriculumSeriesDropIndicator.targetSeriesId || "").trim(),
        placement: String(activeCurriculumSeriesDropIndicator.placement || "").trim() === "before" ? "before" : "after"
      }
    : null;

  if (!activeCurriculumSeriesDrag || !activeCurriculumSeriesDrag.isPointerDrag || event.pointerId !== pointerId) {
    return false;
  }

  if (sourceElement && typeof pointerId === "number") {
    tryReleasePointerCapture(sourceElement, pointerId);
  }

  clearCurriculumSeriesPointerDrag();

  if (!didDrag || !draggedSeriesId || !dropIndicator || draggedSeriesId === dropIndicator.targetSeriesId) {
    return false;
  }

  event.preventDefault();
  return reorderCurriculumSeries(draggedSeriesId, dropIndicator.targetSeriesId, dropIndicator.placement);
};
window.UnterrichtsassistentApp.getActiveCurriculumSeriesDropIndicator = function () {
  return activeCurriculumSeriesDropIndicator;
};
window.UnterrichtsassistentApp.stopEventPropagation = function (event) {
  if (event && typeof event.stopPropagation === "function") {
    event.stopPropagation();
  }

  return true;
};
window.UnterrichtsassistentApp.closeCurriculumSeriesModal = function () {
  activeCurriculumSeriesDraft = null;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.openCurriculumSequenceModal = function (seriesId, sequenceId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedSeriesId = String(seriesId || "").trim();
  const normalizedSequenceId = String(sequenceId || "").trim();
  const parentSeries = collections
    ? collections.series.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedSeriesId
          && String(entry && entry.classId || "").trim() === String(activeClass && activeClass.id || "").trim();
      }) || null
    : null;
  let existingSequence = null;

  if (!isCurriculumPlanningMode() || planningAdminMode || !activeClass || !parentSeries) {
    return false;
  }

  if (normalizedSequenceId && collections) {
    existingSequence = collections.sequences.find(function (entry) {
      return String(entry && entry.id || "").trim() === normalizedSequenceId
        && String(entry && entry.seriesId || "").trim() === normalizedSeriesId;
    }) || null;
  }

  if (expandedCurriculumSeriesIds.indexOf(normalizedSeriesId) < 0) {
    expandedCurriculumSeriesIds = expandedCurriculumSeriesIds.concat([normalizedSeriesId]);
  }
  activeCurriculumLessonDraft = null;
  activeCurriculumSequenceDraft = existingSequence
    ? {
        id: String(existingSequence.id || "").trim(),
        seriesId: normalizedSeriesId,
        topic: String(existingSequence.topic || "").trim(),
        hourDemand: Math.max(0, Number(existingSequence.hourDemand) || 0)
      }
    : {
        id: "",
        seriesId: normalizedSeriesId,
        topic: "",
        hourDemand: 0
      };

  setActiveView("planung");
  return false;
};
window.UnterrichtsassistentApp.closeCurriculumSequenceModal = function () {
  activeCurriculumSequenceDraft = null;
  activeCurriculumLessonDraft = null;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.toggleCurriculumSequenceExpansion = function (seriesId, sequenceId) {
  const normalizedSeriesId = String(seriesId || "").trim();
  const normalizedSequenceId = String(sequenceId || "").trim();
  const expansionKey = [normalizedSeriesId, normalizedSequenceId].join("::");
  const currentIndex = expandedCurriculumSequenceIds.indexOf(expansionKey);

  if (!isCurriculumStructureWorkspaceActive() || !normalizedSeriesId || !normalizedSequenceId) {
    return false;
  }

  if (currentIndex >= 0) {
    expandedCurriculumSequenceIds = expandedCurriculumSequenceIds.filter(function (entry) {
      return entry !== expansionKey;
    });
  } else {
    expandedCurriculumSequenceIds = expandedCurriculumSequenceIds.concat([expansionKey]);
  }

  activeCurriculumLessonDraft = null;

  if (activeViewId === "planung" || activeViewId === "bewertung") {
    setActiveView(activeViewId);
  }

  return false;
};
window.UnterrichtsassistentApp.startCurriculumSequenceDrag = function (event, seriesId, sequenceId) {
  const normalizedSeriesId = String(seriesId || "").trim();
  const normalizedSequenceId = String(sequenceId || "").trim();
  const normalizedColor = normalizePlanningColorValue(event && event.currentTarget ? event.currentTarget.getAttribute("data-series-color") : "") || "#d9d4cb";
  const sourceElement = event && event.currentTarget ? event.currentTarget : null;

  if (!isCurriculumPlanningMode() || !normalizedSeriesId || !normalizedSequenceId || !event) {
    return false;
  }

  activeCurriculumSequenceDrag = {
    seriesId: normalizedSeriesId,
    sequenceId: normalizedSequenceId,
    color: normalizedColor,
    pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    startX: Number(event.clientX) || 0,
    startY: Number(event.clientY) || 0,
    sourceElement: sourceElement,
    isPointerDrag: typeof event.pointerId === "number",
    didDrag: false
  };
  clearCurriculumSequenceDropIndicator();

  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  if (typeof event.stopPropagation === "function") {
    event.stopPropagation();
  }

  if (sourceElement && typeof event.pointerId === "number") {
    trySetPointerCapture(sourceElement, event.pointerId);
    window.addEventListener("pointermove", window.UnterrichtsassistentApp.handleCurriculumSequencePointerMove);
    window.addEventListener("pointerup", window.UnterrichtsassistentApp.handleCurriculumSequencePointerEnd);
    window.addEventListener("pointercancel", window.UnterrichtsassistentApp.handleCurriculumSequencePointerEnd);
    updateCurriculumSeriesDragPreview(event.clientX, event.clientY, normalizedColor);
  }

  return false;
};
window.UnterrichtsassistentApp.handleCurriculumSequencePointerMove = function (event) {
  const deltaX = activeCurriculumSequenceDrag ? (Number(event.clientX) || 0) - activeCurriculumSequenceDrag.startX : 0;
  const deltaY = activeCurriculumSequenceDrag ? (Number(event.clientY) || 0) - activeCurriculumSequenceDrag.startY : 0;
  const dropTarget = getCurriculumSequenceDropTargetFromPoint(event && event.clientX, event && event.clientY);

  if (!activeCurriculumSequenceDrag || !activeCurriculumSequenceDrag.isPointerDrag || event.pointerId !== activeCurriculumSequenceDrag.pointerId) {
    return false;
  }

  if (!activeCurriculumSequenceDrag.didDrag) {
    if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) {
      return false;
    }

    activeCurriculumSequenceDrag.didDrag = true;
  }

  updateCurriculumSeriesDragPreview(event.clientX, event.clientY, activeCurriculumSequenceDrag.color);
  updatePlanningCurriculumAutoScroll(Number(event.clientX) || 0);

  if (!dropTarget
    || String(dropTarget.targetSequenceId || "").trim() === activeCurriculumSequenceDrag.sequenceId) {
    clearCurriculumSequenceDropIndicator();
  } else {
    setCurriculumSequenceDropIndicator(dropTarget.seriesId, dropTarget.targetSequenceId, dropTarget.placement, activeCurriculumSequenceDrag.color);
  }

  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.handleCurriculumSequencePointerEnd = function (event) {
  const pointerId = activeCurriculumSequenceDrag ? activeCurriculumSequenceDrag.pointerId : null;
  const sourceElement = activeCurriculumSequenceDrag ? activeCurriculumSequenceDrag.sourceElement : null;
  const didDrag = activeCurriculumSequenceDrag ? activeCurriculumSequenceDrag.didDrag === true : false;
  const draggedSequenceId = activeCurriculumSequenceDrag ? String(activeCurriculumSequenceDrag.sequenceId || "").trim() : "";
  const draggedSeriesId = activeCurriculumSequenceDrag ? String(activeCurriculumSequenceDrag.seriesId || "").trim() : "";
  const dropIndicator = activeCurriculumSequenceDropIndicator
    ? {
        seriesId: String(activeCurriculumSequenceDropIndicator.seriesId || "").trim(),
        targetSequenceId: String(activeCurriculumSequenceDropIndicator.targetSequenceId || "").trim(),
        placement: String(activeCurriculumSequenceDropIndicator.placement || "").trim() === "before" ? "before" : "after"
      }
    : null;

  if (!activeCurriculumSequenceDrag || !activeCurriculumSequenceDrag.isPointerDrag || event.pointerId !== pointerId) {
    return false;
  }

  if (sourceElement && typeof pointerId === "number") {
    tryReleasePointerCapture(sourceElement, pointerId);
  }

  clearCurriculumSequencePointerDrag();

  if (!didDrag || !draggedSeriesId || !draggedSequenceId || !dropIndicator || draggedSequenceId === dropIndicator.targetSequenceId) {
    return false;
  }

  event.preventDefault();
  return reorderCurriculumSequences(draggedSeriesId, draggedSequenceId, dropIndicator.seriesId, dropIndicator.targetSequenceId, dropIndicator.placement);
};
window.UnterrichtsassistentApp.getActiveCurriculumSequenceDropIndicator = function () {
  return activeCurriculumSequenceDropIndicator;
};
window.UnterrichtsassistentApp.openCurriculumLessonModal = function (seriesId, sequenceId, lessonId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedSeriesId = String(seriesId || "").trim();
  const normalizedSequenceId = String(sequenceId || "").trim();
  const normalizedLessonId = String(lessonId || "").trim();
  const parentSequence = collections
    ? collections.sequences.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedSequenceId
          && String(entry && entry.seriesId || "").trim() === normalizedSeriesId;
      }) || null
    : null;
  let existingLesson = null;
  const expansionKey = [normalizedSeriesId, normalizedSequenceId].join("::");

  if (!isCurriculumPlanningMode() || planningAdminMode || !parentSequence) {
    return false;
  }

  if (normalizedLessonId && collections) {
    existingLesson = collections.lessons.find(function (entry) {
      return String(entry && entry.id || "").trim() === normalizedLessonId
        && String(entry && entry.sequenceId || "").trim() === normalizedSequenceId;
    }) || null;
  }

  if (expandedCurriculumSeriesIds.indexOf(normalizedSeriesId) < 0) {
    expandedCurriculumSeriesIds = expandedCurriculumSeriesIds.concat([normalizedSeriesId]);
  }

  if (expandedCurriculumSequenceIds.indexOf(expansionKey) < 0) {
    expandedCurriculumSequenceIds = expandedCurriculumSequenceIds.concat([expansionKey]);
  }

  activeCurriculumLessonDraft = existingLesson
    ? {
        id: String(existingLesson.id || "").trim(),
        sequenceId: normalizedSequenceId,
        seriesId: normalizedSeriesId,
        topic: String(existingLesson.topic || "").trim(),
        hourType: String(existingLesson.hourType || "").trim() === "double" ? "double" : "single",
        functionType: ["erarbeiten", "vertiefen", "ueben", "wiederholen", "ueberpruefen"].indexOf(String(existingLesson.functionType || "").trim().toLowerCase()) >= 0
          ? String(existingLesson.functionType || "").trim().toLowerCase()
          : "",
        situationType: (function () {
          const normalizedValue = String(existingLesson.situationType || "").trim().toLowerCase();

          if (normalizedValue === "lernsituation") {
            return "lernen";
          }

          if (normalizedValue === "leistungssituation") {
            return "leisten";
          }

          return ["lernen", "leisten"].indexOf(normalizedValue) >= 0
            ? normalizedValue
            : "";
        })(),
        demandLevel: ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(String(existingLesson.demandLevel || "").trim().toLowerCase()) >= 0
          ? String(existingLesson.demandLevel || "").trim().toLowerCase()
          : ""
      }
    : {
        id: "",
        sequenceId: normalizedSequenceId,
        seriesId: normalizedSeriesId,
        topic: "",
        hourType: "single",
        functionType: "",
        situationType: "",
        demandLevel: ""
      };

  setActiveView("planung");
  return false;
};
window.UnterrichtsassistentApp.closeCurriculumLessonModal = function () {
  activeCurriculumLessonDraft = null;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.selectCurriculumLessonFlow = function (seriesId, sequenceId, lessonId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedSeriesId = String(seriesId || "").trim();
  const normalizedSequenceId = String(sequenceId || "").trim();
  const normalizedLessonId = String(lessonId || "").trim();
  const expansionKey = [normalizedSeriesId, normalizedSequenceId].join("::");
  const lessonItem = collections
    ? collections.lessons.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedLessonId
          && String(entry && entry.sequenceId || "").trim() === normalizedSequenceId;
      }) || null
    : null;

  if (!isCurriculumPlanningMode() || !normalizedSeriesId || !normalizedSequenceId || !normalizedLessonId || !lessonItem) {
    return false;
  }

  if (expandedCurriculumSeriesIds.indexOf(normalizedSeriesId) < 0) {
    expandedCurriculumSeriesIds = expandedCurriculumSeriesIds.concat([normalizedSeriesId]);
  }

  if (expandedCurriculumSequenceIds.indexOf(expansionKey) < 0) {
    expandedCurriculumSequenceIds = expandedCurriculumSequenceIds.concat([expansionKey]);
  }

  activeCurriculumLessonFlowLessonId = activeCurriculumLessonFlowLessonId === normalizedLessonId
    ? ""
    : normalizedLessonId;
  activeCurriculumLessonFlowViewPhaseIds = [];

  if (activeViewId === "planung") {
    setActiveView("planung");
    return false;
  }

  setActiveView("planung");
  return false;
};
window.UnterrichtsassistentApp.closeCurriculumLessonFlow = function () {
  activeCurriculumLessonFlowLessonId = "";
  activeCurriculumLessonFlowViewPhaseIds = [];

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.addCurriculumLessonPhase = function (lessonId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedLessonId = String(lessonId || "").trim();
  const lessonItem = collections
    ? collections.lessons.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedLessonId;
      }) || null
    : null;
  const orderedPhases = currentRawSnapshot
    ? getOrderedCurriculumLessonPhasesForLesson(currentRawSnapshot, normalizedLessonId).slice()
    : [];
  const nextPhase = {
    id: createCurriculumLessonPhaseId(),
    lessonPlanId: normalizedLessonId,
    title: "",
    durationMinutes: 0,
    isReserve: false,
    situationType: (function () {
      const normalizedValue = String(lessonItem && lessonItem.situationType || "").trim().toLowerCase();

      if (normalizedValue === "lernsituation") {
        return "lernen";
      }

      if (normalizedValue === "leistungssituation") {
        return "leisten";
      }

      return ["lernen", "leisten"].indexOf(normalizedValue) >= 0
        ? normalizedValue
        : "";
    })(),
    demandLevel: ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(String(lessonItem && lessonItem.demandLevel || "").trim().toLowerCase()) >= 0
      ? String(lessonItem && lessonItem.demandLevel || "").trim().toLowerCase()
      : "",
    nextPhaseId: ""
  };

  if (!isCurriculumPlanningMode() || !currentRawSnapshot || !collections || !normalizedLessonId) {
    return false;
  }

  orderedPhases.push(nextPhase);
  reconnectCurriculumLessonPhaseChain(orderedPhases);

  orderedPhases.forEach(function (phaseItem) {
    const collectionIndex = collections.lessonPhases.findIndex(function (entry) {
      return String(entry && entry.id || "").trim() === String(phaseItem && phaseItem.id || "").trim();
    });

    if (collectionIndex >= 0) {
      collections.lessonPhases[collectionIndex] = phaseItem;
      return;
    }

    collections.lessonPhases.push(phaseItem);
  });

  currentRawSnapshot.curriculumLessonPhases = collections.lessonPhases;
  activeCurriculumLessonFlowLessonId = normalizedLessonId;
  activeCurriculumLessonFlowViewPhaseIds = [];
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.toggleCurriculumLessonFlowPhaseMode = function (phaseId) {
  const normalizedPhaseId = String(phaseId || "").trim();

  if (!isCurriculumPlanningMode() || !normalizedPhaseId) {
    return false;
  }

  if (activeCurriculumLessonFlowViewPhaseIds.indexOf(normalizedPhaseId) >= 0) {
    activeCurriculumLessonFlowViewPhaseIds = activeCurriculumLessonFlowViewPhaseIds.filter(function (entry) {
      return entry !== normalizedPhaseId;
    });
  } else {
    activeCurriculumLessonFlowViewPhaseIds = activeCurriculumLessonFlowViewPhaseIds.concat([normalizedPhaseId]);
  }

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.updateCurriculumLessonPhaseField = function (phaseId, fieldName, nextValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedPhaseId = String(phaseId || "").trim();
  const normalizedFieldName = String(fieldName || "").trim();
  const phaseItem = collections
    ? collections.lessonPhases.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedPhaseId;
      }) || null
    : null;
  const canUpdateFromLive = activeViewId === "unterricht";

  if ((!isCurriculumPlanningMode() && !canUpdateFromLive) || !currentRawSnapshot || !collections || !phaseItem || !normalizedFieldName) {
    return false;
  }

  if (normalizedFieldName === "title") {
    phaseItem.title = String(nextValue || "").trim();
  } else if (normalizedFieldName === "durationMinutes") {
    phaseItem.durationMinutes = Math.max(0, Number(nextValue) || 0);
  } else if (normalizedFieldName === "isReserve") {
    phaseItem.isReserve = Boolean(nextValue);
  } else if (normalizedFieldName === "situationType") {
    phaseItem.situationType = (function () {
      const normalizedValue = String(nextValue || "").trim().toLowerCase();

      if (normalizedValue === "lernsituation") {
        return "lernen";
      }

      if (normalizedValue === "leistungssituation") {
        return "leisten";
      }

      return ["lernen", "leisten"].indexOf(normalizedValue) >= 0
        ? normalizedValue
        : "";
    })();
  } else if (normalizedFieldName === "demandLevel") {
    phaseItem.demandLevel = ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(String(nextValue || "").trim().toLowerCase()) >= 0
      ? String(nextValue || "").trim().toLowerCase()
      : "";
  } else {
    return false;
  }

  currentRawSnapshot.curriculumLessonPhases = collections.lessonPhases;
  activeCurriculumLessonFlowLessonId = String(phaseItem.lessonPlanId || "").trim();
  saveAndRefreshSnapshot(currentRawSnapshot, canUpdateFromLive ? "unterricht" : "planung");
  return false;
};
window.UnterrichtsassistentApp.updateCurriculumLessonPhaseLiveField = function (classId, lessonDate, lessonPlanId, phaseId, fieldName, nextValue, shouldRefreshView) {
  const normalizedClassId = String(classId || "").trim();
  const normalizedLessonDate = String(lessonDate || "").slice(0, 10);
  const normalizedLessonPlanId = String(lessonPlanId || "").trim();
  const normalizedPhaseId = String(phaseId || "").trim();
  const normalizedFieldName = String(fieldName || "").trim();
  const refreshView = shouldRefreshView !== false;

  if (activeViewId !== "unterricht" || !normalizedClassId || !normalizedLessonDate || !normalizedLessonPlanId || !normalizedPhaseId || !normalizedFieldName) {
    return false;
  }

  activeUnterrichtLivePhaseControlOverride = activeUnterrichtLivePhaseControlOverride && activeUnterrichtLivePhaseControlOverride.phaseKey === [normalizedClassId, normalizedLessonDate, normalizedLessonPlanId, normalizedPhaseId].join("::")
    ? activeUnterrichtLivePhaseControlOverride
    : {
        phaseKey: [normalizedClassId, normalizedLessonDate, normalizedLessonPlanId, normalizedPhaseId].join("::"),
        situationType: "",
        demandLevel: ""
      };

  if (normalizedFieldName === "liveSituationType") {
    activeUnterrichtLivePhaseControlOverride.situationType = ["lernen", "leisten"].indexOf(String(nextValue || "").trim().toLowerCase()) >= 0
      ? String(nextValue || "").trim().toLowerCase()
      : "";
  } else if (normalizedFieldName === "liveDemandLevel") {
    activeUnterrichtLivePhaseControlOverride.demandLevel = ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(String(nextValue || "").trim().toLowerCase()) >= 0
      ? String(nextValue || "").trim().toLowerCase()
      : "";
  } else {
    return false;
  }

  if (refreshView) {
    setActiveView("unterricht");
  }
  return false;
};
window.UnterrichtsassistentApp.getCurriculumLessonPhaseLiveOverride = function (classId, lessonDate, lessonPlanId, phaseId) {
  const phaseKey = [String(classId || "").trim(), String(lessonDate || "").slice(0, 10), String(lessonPlanId || "").trim(), String(phaseId || "").trim()].join("::");

  if (activeUnterrichtLivePhaseControlOverride && activeUnterrichtLivePhaseControlOverride.phaseKey !== phaseKey) {
    activeUnterrichtLivePhaseControlOverride = null;
  }

  if (!activeUnterrichtLivePhaseControlOverride || activeUnterrichtLivePhaseControlOverride.phaseKey !== phaseKey) {
    return null;
  }

  return {
    situationType: String(activeUnterrichtLivePhaseControlOverride.situationType || "").trim().toLowerCase(),
    demandLevel: String(activeUnterrichtLivePhaseControlOverride.demandLevel || "").trim().toLowerCase()
  };
};
function getUnterrichtLiveAfbDemandLevelByIndex(index) {
  return ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"][Math.max(0, Math.min(4, Number(index) || 0))] || "afb1";
}

function getUnterrichtLiveAfbSliderLabelByIndex(index) {
  switch (Math.max(0, Math.min(4, Number(index) || 0))) {
    case 0:
      return "1";
    case 1:
      return "1/2";
    case 2:
      return "2";
    case 3:
      return "2/3";
    case 4:
      return "3";
    default:
      return "2";
  }
}

function getUnterrichtLiveAfbSliderIndexFromClientX(clientX, sourceElement) {
  const stopElements = sourceElement && typeof sourceElement.querySelectorAll === "function"
    ? Array.prototype.slice.call(sourceElement.querySelectorAll(".unterricht-live-controls__slider-stop"))
    : [];

  if (!stopElements.length) {
    const bounds = sourceElement && typeof sourceElement.getBoundingClientRect === "function"
      ? sourceElement.getBoundingClientRect()
      : null;
    const width = Math.max(1, Number(bounds && bounds.width) || 0);
    const left = Number(bounds && bounds.left) || 0;
    const ratio = Math.max(0, Math.min(1, (Number(clientX) - left) / width));
    return Math.max(0, Math.min(4, Math.round(ratio * 4)));
  }

  return stopElements.reduce(function (nearestIndex, stopElement, currentIndex) {
    const rect = stopElement && typeof stopElement.getBoundingClientRect === "function"
      ? stopElement.getBoundingClientRect()
      : null;
    const centerX = rect ? (rect.left + (rect.width / 2)) : 0;
    const currentDistance = Math.abs(Number(clientX) - centerX);
    const nearestRect = stopElements[nearestIndex] && typeof stopElements[nearestIndex].getBoundingClientRect === "function"
      ? stopElements[nearestIndex].getBoundingClientRect()
      : null;
    const nearestCenterX = nearestRect ? (nearestRect.left + (nearestRect.width / 2)) : 0;
    const nearestDistance = Math.abs(Number(clientX) - nearestCenterX);

    return currentDistance < nearestDistance ? currentIndex : nearestIndex;
  }, 0);
}

function clearUnterrichtLiveAfbSliderDrag() {
  if (!activeUnterrichtLiveAfbSliderDrag) {
    return;
  }

  if (activeUnterrichtLiveAfbSliderDrag.sourceElement && typeof activeUnterrichtLiveAfbSliderDrag.pointerId === "number") {
    tryReleasePointerCapture(activeUnterrichtLiveAfbSliderDrag.sourceElement, activeUnterrichtLiveAfbSliderDrag.pointerId);
  }

  window.removeEventListener("pointermove", window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderPointerMove);
  window.removeEventListener("pointerup", window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderPointerEnd);
  window.removeEventListener("pointercancel", window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderPointerEnd);
  activeUnterrichtLiveAfbSliderDrag = null;
}

window.UnterrichtsassistentApp.startUnterrichtLiveAfbSliderPointer = function (event, classId, lessonDate, lessonPlanId, phaseId) {
  const currentTarget = event && event.currentTarget ? event.currentTarget : null;
  const sourceElement = currentTarget && typeof currentTarget.closest === "function"
    ? currentTarget.closest(".unterricht-live-controls__slider") || currentTarget
    : currentTarget;
  const normalizedClassId = String(classId || "").trim();
  const normalizedLessonDate = String(lessonDate || "").slice(0, 10);
  const normalizedLessonPlanId = String(lessonPlanId || "").trim();
  const normalizedPhaseId = String(phaseId || "").trim();

  if (!event || activeViewId !== "unterricht" || !sourceElement || !normalizedClassId || !normalizedLessonDate || !normalizedLessonPlanId || !normalizedPhaseId) {
    return false;
  }

  clearUnterrichtLiveAfbSliderDrag();
  activeUnterrichtLiveAfbSliderDrag = {
    pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    sourceElement: sourceElement,
    classId: normalizedClassId,
    lessonDate: normalizedLessonDate,
    lessonPlanId: normalizedLessonPlanId,
    phaseId: normalizedPhaseId
  };

  trySetPointerCapture(sourceElement, event.pointerId);
  window.addEventListener("pointermove", window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderPointerMove);
  window.addEventListener("pointerup", window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderPointerEnd);
  window.addEventListener("pointercancel", window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderPointerEnd);
  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  return window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderPointerMove(event);
};

window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderPointerMove = function (event) {
  const dragState = activeUnterrichtLiveAfbSliderDrag;

  if (!dragState || !dragState.sourceElement || (typeof dragState.pointerId === "number" && dragState.pointerId !== event.pointerId)) {
    return false;
  }

  window.UnterrichtsassistentApp.updateCurriculumLessonPhaseLiveField(
    dragState.classId,
    dragState.lessonDate,
    dragState.lessonPlanId,
    dragState.phaseId,
    "liveDemandLevel",
    getUnterrichtLiveAfbDemandLevelByIndex(getUnterrichtLiveAfbSliderIndexFromClientX(event.clientX, dragState.sourceElement))
  );

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  return false;
};

window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderPointerEnd = function (event) {
  if (!activeUnterrichtLiveAfbSliderDrag) {
    return false;
  }

  if (!event || typeof activeUnterrichtLiveAfbSliderDrag.pointerId !== "number" || activeUnterrichtLiveAfbSliderDrag.pointerId === event.pointerId) {
    clearUnterrichtLiveAfbSliderDrag();
  }

  return false;
};
window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderInput = function (event, classId, lessonDate, lessonPlanId, phaseId) {
  const input = event && event.currentTarget ? event.currentTarget : null;
  const slider = input && input.parentElement ? input.parentElement : null;
  const sliderValue = Math.max(0, Math.min(4, Number(input && input.value) || 0));
  const valueElement = slider && typeof slider.querySelector === "function"
    ? slider.querySelector(".unterricht-live-controls__slider-value")
    : null;

  if (!input) {
    return false;
  }

  window.UnterrichtsassistentApp.updateCurriculumLessonPhaseLiveField(
    classId,
    lessonDate,
    lessonPlanId,
    phaseId,
    "liveDemandLevel",
    getUnterrichtLiveAfbDemandLevelByIndex(sliderValue),
    false
  );

  if (valueElement) {
    valueElement.textContent = getUnterrichtLiveAfbSliderLabelByIndex(sliderValue);
    valueElement.className = "unterricht-live-controls__slider-value unterricht-live-controls__slider-value--" + String(sliderValue);
  }

  return false;
};
window.UnterrichtsassistentApp.deleteCurriculumLessonPhase = function (phaseId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedPhaseId = String(phaseId || "").trim();
  const phaseItem = collections
    ? collections.lessonPhases.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedPhaseId;
      }) || null
    : null;
  const normalizedLessonId = String(phaseItem && phaseItem.lessonPlanId || "").trim();
  const orderedPhases = currentRawSnapshot
    ? getOrderedCurriculumLessonPhasesForLesson(currentRawSnapshot, normalizedLessonId).slice()
    : [];
  const nextOrderedPhases = orderedPhases.filter(function (entry) {
    return String(entry && entry.id || "").trim() !== normalizedPhaseId;
  });

  if (!isCurriculumPlanningMode() || !currentRawSnapshot || !collections || !phaseItem || !normalizedLessonId) {
    return false;
  }

  if (!window.confirm("Soll diese Phase wirklich geloescht werden? Zugehoerige Schritte werden ebenfalls entfernt.")) {
    return false;
  }

  reconnectCurriculumLessonPhaseChain(nextOrderedPhases);
  collections.lessonPhases = collections.lessonPhases.filter(function (entry) {
    return String(entry && entry.lessonPlanId || "").trim() !== normalizedLessonId
      || nextOrderedPhases.some(function (orderedEntry) {
        return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
      });
  }).map(function (entry) {
    const reordered = nextOrderedPhases.find(function (orderedEntry) {
      return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
    });

    return reordered || entry;
  });
  collections.lessonSteps = collections.lessonSteps.filter(function (entry) {
    return String(entry && entry.phaseId || "").trim() !== normalizedPhaseId;
  });
  currentRawSnapshot.curriculumLessonPhases = collections.lessonPhases;
  currentRawSnapshot.curriculumLessonSteps = collections.lessonSteps;
  activeCurriculumLessonFlowLessonId = normalizedLessonId;
  activeCurriculumLessonFlowViewPhaseIds = activeCurriculumLessonFlowViewPhaseIds.filter(function (entry) {
    return entry !== normalizedPhaseId;
  });
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.addCurriculumLessonStep = function (phaseId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedPhaseId = String(phaseId || "").trim();
  const phaseItem = collections
    ? collections.lessonPhases.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedPhaseId;
      }) || null
    : null;
  const orderedSteps = currentRawSnapshot
    ? getOrderedCurriculumLessonStepsForPhase(currentRawSnapshot, normalizedPhaseId).slice()
    : [];
  const nextStep = {
    id: createCurriculumLessonStepId(),
    phaseId: normalizedPhaseId,
    title: "",
    content: "",
    socialForm: "plenum",
    material: "",
    nextStepId: ""
  };

  if (!isCurriculumPlanningMode() || !currentRawSnapshot || !collections || !phaseItem || !normalizedPhaseId) {
    return false;
  }

  orderedSteps.push(nextStep);
  reconnectCurriculumLessonStepChain(orderedSteps);

  orderedSteps.forEach(function (stepItem) {
    const collectionIndex = collections.lessonSteps.findIndex(function (entry) {
      return String(entry && entry.id || "").trim() === String(stepItem && stepItem.id || "").trim();
    });

    if (collectionIndex >= 0) {
      collections.lessonSteps[collectionIndex] = stepItem;
      return;
    }

    collections.lessonSteps.push(stepItem);
  });

  currentRawSnapshot.curriculumLessonSteps = collections.lessonSteps;
  activeCurriculumLessonFlowLessonId = String(phaseItem.lessonPlanId || "").trim();
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.updateCurriculumLessonStepField = function (stepId, fieldName, nextValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedStepId = String(stepId || "").trim();
  const normalizedFieldName = String(fieldName || "").trim();
  const stepItem = collections
    ? collections.lessonSteps.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedStepId;
      }) || null
    : null;
  const phaseItem = stepItem && collections
    ? collections.lessonPhases.find(function (entry) {
        return String(entry && entry.id || "").trim() === String(stepItem.phaseId || "").trim();
      }) || null
    : null;
  const normalizedSocialForm = String(nextValue || "").trim().toLowerCase();

  if (!isCurriculumPlanningMode() || !currentRawSnapshot || !collections || !stepItem || !phaseItem || !normalizedFieldName) {
    return false;
  }

  if (normalizedFieldName === "title") {
    stepItem.title = String(nextValue || "").trim();
  } else if (normalizedFieldName === "content") {
    stepItem.content = String(nextValue || "").trim();
  } else if (normalizedFieldName === "socialForm") {
    stepItem.socialForm = ["einzel", "partner", "gruppe", "plenum"].indexOf(normalizedSocialForm) >= 0
      ? normalizedSocialForm
      : "plenum";
  } else if (normalizedFieldName === "material") {
    stepItem.material = String(nextValue || "").trim();
  } else {
    return false;
  }

  currentRawSnapshot.curriculumLessonSteps = collections.lessonSteps;
  activeCurriculumLessonFlowLessonId = String(phaseItem.lessonPlanId || "").trim();
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.deleteCurriculumLessonStep = function (stepId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedStepId = String(stepId || "").trim();
  const stepItem = collections
    ? collections.lessonSteps.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedStepId;
      }) || null
    : null;
  const normalizedPhaseId = String(stepItem && stepItem.phaseId || "").trim();
  const phaseItem = normalizedPhaseId && collections
    ? collections.lessonPhases.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedPhaseId;
      }) || null
    : null;
  const orderedSteps = currentRawSnapshot
    ? getOrderedCurriculumLessonStepsForPhase(currentRawSnapshot, normalizedPhaseId).slice()
    : [];
  const nextOrderedSteps = orderedSteps.filter(function (entry) {
    return String(entry && entry.id || "").trim() !== normalizedStepId;
  });

  if (!isCurriculumPlanningMode() || !currentRawSnapshot || !collections || !stepItem || !phaseItem || !normalizedPhaseId) {
    return false;
  }

  if (!window.confirm("Soll dieser Schritt wirklich geloescht werden?")) {
    return false;
  }

  reconnectCurriculumLessonStepChain(nextOrderedSteps);
  collections.lessonSteps = collections.lessonSteps.filter(function (entry) {
    return String(entry && entry.phaseId || "").trim() !== normalizedPhaseId
      || nextOrderedSteps.some(function (orderedEntry) {
        return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
      });
  }).map(function (entry) {
    const reordered = nextOrderedSteps.find(function (orderedEntry) {
      return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
    });

    return reordered || entry;
  });
  currentRawSnapshot.curriculumLessonSteps = collections.lessonSteps;
  activeCurriculumLessonFlowLessonId = String(phaseItem.lessonPlanId || "").trim();
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.toggleCurriculumLessonPhaseCompleted = function (classId, lessonDate, lessonPlanId, phaseId, isChecked, elapsedMinutes, totalLessonElapsedMinutes) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedClassId = String(classId || "").trim();
  const normalizedLessonDate = String(lessonDate || "").slice(0, 10);
  const normalizedLessonPlanId = String(lessonPlanId || "").trim();
  const normalizedPhaseId = String(phaseId || "").trim();
  const shouldBeCompleted = Boolean(isChecked);
  const normalizedElapsedMinutes = Math.max(0, Number(elapsedMinutes) || 0);
  const normalizedTotalLessonElapsedMinutes = Math.max(0, Number(totalLessonElapsedMinutes) || 0);
  const existingStatus = collections
    ? collections.lessonPhaseStatuses.find(function (entry) {
        return String(entry && entry.classId || "").trim() === normalizedClassId
          && String(entry && entry.lessonPlanId || "").trim() === normalizedLessonPlanId
          && String(entry && entry.phaseId || "").trim() === normalizedPhaseId;
      }) || null
    : null;

  if (!currentRawSnapshot || !collections || !normalizedClassId || !normalizedLessonDate || !normalizedLessonPlanId || !normalizedPhaseId) {
    return false;
  }

  if (shouldBeCompleted) {
    if (existingStatus) {
      existingStatus.isCompleted = true;
      existingStatus.elapsedMinutes = normalizedElapsedMinutes;
      existingStatus.resumeStartMinutes = 0;
    } else {
      collections.lessonPhaseStatuses.push({
        id: createCurriculumLessonPhaseStatusId(),
        classId: normalizedClassId,
        lessonDate: normalizedLessonDate,
        lessonPlanId: normalizedLessonPlanId,
        phaseId: normalizedPhaseId,
        isCompleted: true,
        elapsedMinutes: normalizedElapsedMinutes,
        resumeStartMinutes: 0,
        liveSituationType: "",
        liveDemandLevel: ""
      });
    }
  } else if (existingStatus) {
    existingStatus.isCompleted = false;
    existingStatus.elapsedMinutes = Math.max(existingStatus.elapsedMinutes || 0, normalizedElapsedMinutes);
    existingStatus.resumeStartMinutes = normalizedTotalLessonElapsedMinutes;
  }

  currentRawSnapshot.curriculumLessonPhaseStatuses = collections.lessonPhaseStatuses;
  saveAndRefreshSnapshot(currentRawSnapshot, activeViewId === "unterricht" ? "unterricht" : "planung");
  return false;
};
window.UnterrichtsassistentApp.startCurriculumLessonDrag = function (event, sequenceId, lessonId, color) {
  const normalizedSequenceId = String(sequenceId || "").trim();
  const normalizedLessonId = String(lessonId || "").trim();
  const normalizedColor = normalizePlanningColorValue(color) || "#d9d4cb";
  const sourceElement = event && event.currentTarget ? event.currentTarget : null;

  if (!isCurriculumPlanningMode() || !normalizedSequenceId || !normalizedLessonId || !event) {
    return false;
  }

  activeCurriculumLessonDrag = {
    sequenceId: normalizedSequenceId,
    lessonId: normalizedLessonId,
    color: normalizedColor,
    pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    startX: Number(event.clientX) || 0,
    startY: Number(event.clientY) || 0,
    sourceElement: sourceElement,
    isPointerDrag: typeof event.pointerId === "number",
    didDrag: false
  };
  clearCurriculumLessonDropIndicator();

  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  if (typeof event.stopPropagation === "function") {
    event.stopPropagation();
  }

  if (sourceElement && typeof event.pointerId === "number") {
    trySetPointerCapture(sourceElement, event.pointerId);
    window.addEventListener("pointermove", window.UnterrichtsassistentApp.handleCurriculumLessonPointerMove);
    window.addEventListener("pointerup", window.UnterrichtsassistentApp.handleCurriculumLessonPointerEnd);
    window.addEventListener("pointercancel", window.UnterrichtsassistentApp.handleCurriculumLessonPointerEnd);
    updateCurriculumSeriesDragPreview(event.clientX, event.clientY, normalizedColor);
  }

  return false;
};
window.UnterrichtsassistentApp.handleCurriculumLessonPointerMove = function (event) {
  const deltaX = activeCurriculumLessonDrag ? (Number(event.clientX) || 0) - activeCurriculumLessonDrag.startX : 0;
  const deltaY = activeCurriculumLessonDrag ? (Number(event.clientY) || 0) - activeCurriculumLessonDrag.startY : 0;
  const dropTarget = getCurriculumLessonDropTargetFromPoint(event && event.clientX, event && event.clientY);

  if (!activeCurriculumLessonDrag || !activeCurriculumLessonDrag.isPointerDrag || event.pointerId !== activeCurriculumLessonDrag.pointerId) {
    return false;
  }

  if (!activeCurriculumLessonDrag.didDrag) {
    if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) {
      return false;
    }

    activeCurriculumLessonDrag.didDrag = true;
  }

  updateCurriculumSeriesDragPreview(event.clientX, event.clientY, activeCurriculumLessonDrag.color);
  updatePlanningCurriculumAutoScroll(Number(event.clientX) || 0);

  if (!dropTarget
    || String(dropTarget.targetLessonId || "").trim() === activeCurriculumLessonDrag.lessonId) {
    clearCurriculumLessonDropIndicator();
  } else {
    setCurriculumLessonDropIndicator(dropTarget.sequenceId, dropTarget.targetLessonId, dropTarget.placement, activeCurriculumLessonDrag.color);
  }

  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.handleCurriculumLessonPointerEnd = function (event) {
  const pointerId = activeCurriculumLessonDrag ? activeCurriculumLessonDrag.pointerId : null;
  const sourceElement = activeCurriculumLessonDrag ? activeCurriculumLessonDrag.sourceElement : null;
  const didDrag = activeCurriculumLessonDrag ? activeCurriculumLessonDrag.didDrag === true : false;
  const draggedLessonId = activeCurriculumLessonDrag ? String(activeCurriculumLessonDrag.lessonId || "").trim() : "";
  const draggedSequenceId = activeCurriculumLessonDrag ? String(activeCurriculumLessonDrag.sequenceId || "").trim() : "";
  const dropIndicator = activeCurriculumLessonDropIndicator
    ? {
        sequenceId: String(activeCurriculumLessonDropIndicator.sequenceId || "").trim(),
        targetLessonId: String(activeCurriculumLessonDropIndicator.targetLessonId || "").trim(),
        placement: String(activeCurriculumLessonDropIndicator.placement || "").trim() === "before" ? "before" : "after"
      }
    : null;

  if (!activeCurriculumLessonDrag || !activeCurriculumLessonDrag.isPointerDrag || event.pointerId !== pointerId) {
    return false;
  }

  if (sourceElement && typeof pointerId === "number") {
    tryReleasePointerCapture(sourceElement, pointerId);
  }

  clearCurriculumLessonPointerDrag();

  if (!didDrag || !draggedSequenceId || !draggedLessonId || !dropIndicator || draggedLessonId === dropIndicator.targetLessonId) {
    return false;
  }

  event.preventDefault();
  return reorderCurriculumLessons(draggedSequenceId, draggedLessonId, dropIndicator.sequenceId, dropIndicator.targetLessonId, dropIndicator.placement);
};
window.UnterrichtsassistentApp.getActiveCurriculumLessonDropIndicator = function () {
  return activeCurriculumLessonDropIndicator;
};
window.UnterrichtsassistentApp.submitCurriculumLessonModal = function (event) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const topicInput = document.getElementById("curriculumLessonTopicInput");
  const hourTypeInput = document.getElementById("curriculumLessonHourTypeInput");
  const functionTypeInput = document.getElementById("curriculumLessonFunctionTypeInput");
  const situationTypeInput = document.getElementById("curriculumLessonSituationTypeInput");
  const demandLevelInput = document.getElementById("curriculumLessonDemandLevelInput");
  const normalizedSequenceId = String(activeCurriculumLessonDraft && activeCurriculumLessonDraft.sequenceId || "").trim();
  const normalizedDraftId = String(activeCurriculumLessonDraft && activeCurriculumLessonDraft.id || "").trim();
  const topicValue = String(topicInput && topicInput.value || "").trim();
  const hourTypeValue = String(hourTypeInput && hourTypeInput.value || "").trim() === "double" ? "double" : "single";
  const functionTypeRawValue = String(functionTypeInput && functionTypeInput.value || "").trim().toLowerCase();
  const functionTypeValue = ["erarbeiten", "vertiefen", "ueben", "wiederholen", "ueberpruefen"].indexOf(functionTypeRawValue) >= 0
    ? functionTypeRawValue
    : "";
  const situationTypeRawValue = String(situationTypeInput && situationTypeInput.value || "").trim().toLowerCase();
  const situationTypeValue = situationTypeRawValue === "lernsituation"
    ? "lernen"
    : (situationTypeRawValue === "leistungssituation"
      ? "leisten"
      : (["lernen", "leisten"].indexOf(situationTypeRawValue) >= 0
        ? situationTypeRawValue
        : ""));
  const demandLevelRawValue = String(demandLevelInput && demandLevelInput.value || "").trim().toLowerCase();
  const demandLevelValue = ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(demandLevelRawValue) >= 0
    ? demandLevelRawValue
    : "";
  const orderedLessons = currentRawSnapshot
    ? getOrderedCurriculumLessonsForSequence(currentRawSnapshot, normalizedSequenceId).slice()
    : [];
  const nextLessonItem = {
    id: normalizedDraftId || createCurriculumLessonPlanId(),
    sequenceId: normalizedSequenceId,
    topic: topicValue,
    hourType: hourTypeValue,
    functionType: functionTypeValue,
    situationType: situationTypeValue,
    demandLevel: demandLevelValue,
    nextLessonId: ""
  };
  let nextOrderedLessons;
  let replacedExistingLesson = false;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!currentRawSnapshot || !collections || !normalizedSequenceId || !activeCurriculumLessonDraft || !topicValue) {
    return false;
  }

  if (normalizedDraftId) {
    nextOrderedLessons = orderedLessons.map(function (entry) {
      if (String(entry && entry.id || "").trim() !== normalizedDraftId) {
        return entry;
      }

      replacedExistingLesson = true;
      return nextLessonItem;
    });

    if (!replacedExistingLesson) {
      nextOrderedLessons.push(nextLessonItem);
    }
  } else {
    nextOrderedLessons = orderedLessons.concat([nextLessonItem]);
  }

  reconnectCurriculumLessonChain(nextOrderedLessons);

  nextOrderedLessons.forEach(function (lessonItem) {
    const collectionIndex = collections.lessons.findIndex(function (entry) {
      return String(entry && entry.id || "").trim() === String(lessonItem && lessonItem.id || "").trim();
    });

    if (collectionIndex >= 0) {
      collections.lessons[collectionIndex] = lessonItem;
      return;
    }

    collections.lessons.push(lessonItem);
  });

  currentRawSnapshot.curriculumLessonPlans = collections.lessons;
  if (shouldAutoApplyCalculatedCurriculumHourDemands(currentRawSnapshot) && activeClass) {
    applyCalculatedCurriculumHourDemandsToSnapshot(currentRawSnapshot, String(activeClass.id || "").trim());
  }
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return window.UnterrichtsassistentApp.closeCurriculumLessonModal();
};
window.UnterrichtsassistentApp.deleteCurriculumLesson = function (lessonId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedLessonId = String(lessonId || "").trim();
  const normalizedSequenceId = String(activeCurriculumLessonDraft && activeCurriculumLessonDraft.sequenceId || "").trim()
    || String((collections && collections.lessons.find(function (entry) {
      return String(entry && entry.id || "").trim() === normalizedLessonId;
    }) || {}).sequenceId || "").trim();
  const orderedLessons = currentRawSnapshot
    ? getOrderedCurriculumLessonsForSequence(currentRawSnapshot, normalizedSequenceId).slice()
    : [];
  const nextOrderedLessons = orderedLessons.filter(function (entry) {
    return String(entry && entry.id || "").trim() !== normalizedLessonId;
  });
  const phaseIdsToDelete = collections
    ? collections.lessonPhases.filter(function (entry) {
        return String(entry && entry.lessonPlanId || "").trim() === normalizedLessonId;
      }).map(function (entry) {
        return String(entry && entry.id || "").trim();
      })
    : [];

  if (!currentRawSnapshot || !collections || !normalizedLessonId || !normalizedSequenceId) {
    return false;
  }

  if (!window.confirm("Soll diese Unterrichtsstunde wirklich geloescht werden?")) {
    return false;
  }

  reconnectCurriculumLessonChain(nextOrderedLessons);
  collections.lessons = collections.lessons.filter(function (entry) {
    return String(entry && entry.sequenceId || "").trim() !== normalizedSequenceId
      || nextOrderedLessons.some(function (orderedEntry) {
        return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
      });
  }).map(function (entry) {
    const reordered = nextOrderedLessons.find(function (orderedEntry) {
      return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
    });

    return reordered || entry;
  });
  collections.lessonPhases = collections.lessonPhases.filter(function (entry) {
    return String(entry && entry.lessonPlanId || "").trim() !== normalizedLessonId;
  });
  collections.lessonSteps = collections.lessonSteps.filter(function (entry) {
    return phaseIdsToDelete.indexOf(String(entry && entry.phaseId || "").trim()) === -1;
  });
  currentRawSnapshot.curriculumLessonPlans = collections.lessons;
  currentRawSnapshot.curriculumLessonPhases = collections.lessonPhases;
  currentRawSnapshot.curriculumLessonSteps = collections.lessonSteps;

  if (activeCurriculumLessonDraft && String(activeCurriculumLessonDraft.id || "").trim() === normalizedLessonId) {
    activeCurriculumLessonDraft = null;
  }

  if (activeCurriculumLessonFlowLessonId === normalizedLessonId) {
    activeCurriculumLessonFlowLessonId = "";
    activeCurriculumLessonFlowViewPhaseIds = [];
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return window.UnterrichtsassistentApp.closeCurriculumLessonModal();
};
window.UnterrichtsassistentApp.submitCurriculumSequenceModal = function (event) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const topicInput = document.getElementById("curriculumSequenceTopicInput");
  const hourDemandInput = document.getElementById("curriculumSequenceHourDemandInput");
  const normalizedSeriesId = String(activeCurriculumSequenceDraft && activeCurriculumSequenceDraft.seriesId || "").trim();
  const normalizedDraftId = String(activeCurriculumSequenceDraft && activeCurriculumSequenceDraft.id || "").trim();
  const topicValue = String(topicInput && topicInput.value || "").trim();
  const hourDemandValue = Math.max(0, Number(hourDemandInput && hourDemandInput.value) || 0);
  const orderedSequences = currentRawSnapshot
    ? getOrderedCurriculumSequencesForSeries(currentRawSnapshot, normalizedSeriesId).slice()
    : [];
  const nextSequenceItem = {
    id: normalizedDraftId || createCurriculumSequenceId(),
    seriesId: normalizedSeriesId,
    topic: topicValue,
    hourDemand: hourDemandValue,
    nextSequenceId: ""
  };
  let nextOrderedSequences;
  let replacedExistingSequence = false;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!currentRawSnapshot || !collections || !normalizedSeriesId || !activeCurriculumSequenceDraft || !topicValue) {
    return false;
  }

  if (normalizedDraftId) {
    nextOrderedSequences = orderedSequences.map(function (entry) {
      if (String(entry && entry.id || "").trim() !== normalizedDraftId) {
        return entry;
      }

      replacedExistingSequence = true;
      return nextSequenceItem;
    });

    if (!replacedExistingSequence) {
      nextOrderedSequences.push(nextSequenceItem);
    }
  } else {
    nextOrderedSequences = orderedSequences.concat([nextSequenceItem]);
  }

  reconnectCurriculumSequenceChain(nextOrderedSequences);

  nextOrderedSequences.forEach(function (sequenceItem) {
    const collectionIndex = collections.sequences.findIndex(function (entry) {
      return String(entry && entry.id || "").trim() === String(sequenceItem && sequenceItem.id || "").trim();
    });

    if (collectionIndex >= 0) {
      collections.sequences[collectionIndex] = sequenceItem;
      return;
    }

    collections.sequences.push(sequenceItem);
  });

  currentRawSnapshot.curriculumSequences = collections.sequences;
  if (shouldAutoApplyCalculatedCurriculumHourDemands(currentRawSnapshot) && activeClass) {
    applyCalculatedCurriculumHourDemandsToSnapshot(currentRawSnapshot, String(activeClass.id || "").trim());
  }
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return window.UnterrichtsassistentApp.closeCurriculumSequenceModal();
};
window.UnterrichtsassistentApp.deleteCurriculumSequence = function (sequenceId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedSequenceId = String(sequenceId || "").trim();
  const normalizedSeriesId = String(activeCurriculumSequenceDraft && activeCurriculumSequenceDraft.seriesId || "").trim()
    || String((collections && collections.sequences.find(function (entry) {
      return String(entry && entry.id || "").trim() === normalizedSequenceId;
    }) || {}).seriesId || "").trim();
  const orderedSequences = currentRawSnapshot
    ? getOrderedCurriculumSequencesForSeries(currentRawSnapshot, normalizedSeriesId).slice()
    : [];
  const nextOrderedSequences = orderedSequences.filter(function (entry) {
    return String(entry && entry.id || "").trim() !== normalizedSequenceId;
  });
  const lessonIdsToDelete = collections
    ? collections.lessons.filter(function (entry) {
        return String(entry && entry.sequenceId || "").trim() === normalizedSequenceId;
      }).map(function (entry) {
        return String(entry && entry.id || "").trim();
      })
    : [];
  const phaseIdsToDelete = collections
    ? collections.lessonPhases.filter(function (entry) {
        return lessonIdsToDelete.indexOf(String(entry && entry.lessonPlanId || "").trim()) >= 0;
      }).map(function (entry) {
        return String(entry && entry.id || "").trim();
      })
    : [];

  if (!currentRawSnapshot || !collections || !normalizedSequenceId || !normalizedSeriesId) {
    return false;
  }

  if (!window.confirm("Soll diese Unterrichtssequenz wirklich geloescht werden? Zugehoerige Stunden werden ebenfalls entfernt.")) {
    return false;
  }

  reconnectCurriculumSequenceChain(nextOrderedSequences);
  collections.sequences = collections.sequences.filter(function (entry) {
    return String(entry && entry.seriesId || "").trim() !== normalizedSeriesId
      || nextOrderedSequences.some(function (orderedEntry) {
        return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
      });
  }).map(function (entry) {
    const reordered = nextOrderedSequences.find(function (orderedEntry) {
      return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
    });

    return reordered || entry;
  });
  collections.lessons = collections.lessons.filter(function (entry) {
    return String(entry && entry.sequenceId || "").trim() !== normalizedSequenceId;
  });
  collections.lessonPhases = collections.lessonPhases.filter(function (entry) {
    return lessonIdsToDelete.indexOf(String(entry && entry.lessonPlanId || "").trim()) === -1;
  });
  collections.lessonSteps = collections.lessonSteps.filter(function (entry) {
    return phaseIdsToDelete.indexOf(String(entry && entry.phaseId || "").trim()) === -1;
  });
  currentRawSnapshot.curriculumSequences = collections.sequences;
  currentRawSnapshot.curriculumLessonPlans = collections.lessons;
  currentRawSnapshot.curriculumLessonPhases = collections.lessonPhases;
  currentRawSnapshot.curriculumLessonSteps = collections.lessonSteps;

  if (activeCurriculumSequenceDraft && String(activeCurriculumSequenceDraft.id || "").trim() === normalizedSequenceId) {
    activeCurriculumSequenceDraft = null;
  }

  expandedCurriculumSequenceIds = expandedCurriculumSequenceIds.filter(function (entry) {
    const parts = String(entry || "").split("::");
    return parts[1] !== normalizedSequenceId;
  });
  activeCurriculumLessonDraft = null;

  if (lessonIdsToDelete.indexOf(activeCurriculumLessonFlowLessonId) >= 0) {
    activeCurriculumLessonFlowLessonId = "";
    activeCurriculumLessonFlowViewPhaseIds = [];
  }

  if (shouldAutoApplyCalculatedCurriculumHourDemands(currentRawSnapshot) && activeClass) {
    applyCalculatedCurriculumHourDemandsToSnapshot(currentRawSnapshot, String(activeClass.id || "").trim());
  }
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return window.UnterrichtsassistentApp.closeCurriculumSequenceModal();
};
window.UnterrichtsassistentApp.submitCurriculumSeriesModal = function (event) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const topicInput = document.getElementById("curriculumSeriesTopicInput");
  const hourDemandInput = document.getElementById("curriculumSeriesHourDemandInput");
  const colorInput = document.getElementById("curriculumSeriesColorInput");
  const startModeInput = document.getElementById("curriculumSeriesStartModeInput");
  const startDateInput = document.getElementById("curriculumSeriesStartDateInput");
  const orderedSeries = currentRawSnapshot && activeClass
    ? getOrderedCurriculumSeriesForClass(currentRawSnapshot, activeClass.id).slice()
    : [];
  const normalizedDraftId = String(activeCurriculumSeriesDraft && activeCurriculumSeriesDraft.id || "").trim();
  const topicValue = String(topicInput && topicInput.value || "").trim();
  const hourDemandValue = Math.max(0, Number(hourDemandInput && hourDemandInput.value) || 0);
  const colorValue = normalizePlanningColorValue(colorInput && colorInput.value)
    || normalizePlanningColorValue(activeCurriculumSeriesDraft && activeCurriculumSeriesDraft.color)
    || getCurriculumSeriesColor(activeCurriculumSeriesDraft, [String(activeClass && activeClass.id || "").trim(), topicValue, normalizedDraftId || "new"].join("::"));
  const startModeValue = String(startModeInput && startModeInput.value || activeCurriculumSeriesDraft && activeCurriculumSeriesDraft.startMode || "automatic").trim() === "manual"
    ? "manual"
    : "automatic";
  const startDateValue = startModeValue === "manual"
    ? String(startDateInput && startDateInput.value || "").trim()
    : "";
  const nextSeriesItem = {
    id: normalizedDraftId || createCurriculumSeriesId(),
    classId: String(activeClass && activeClass.id || "").trim(),
    topic: topicValue,
    hourDemand: hourDemandValue,
    color: colorValue,
    startMode: startModeValue,
    startDate: startDateValue,
    nextSeriesId: ""
  };
  let nextOrderedSeries;
  let replacedExistingSeries = false;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!currentRawSnapshot || !collections || !activeClass || !activeCurriculumSeriesDraft || !topicValue) {
    return false;
  }

  if (normalizedDraftId) {
    nextOrderedSeries = orderedSeries.map(function (entry) {
      if (String(entry && entry.id || "").trim() !== normalizedDraftId) {
        return entry;
      }

      replacedExistingSeries = true;
      return nextSeriesItem;
    });

    if (!replacedExistingSeries) {
      nextOrderedSeries.push(nextSeriesItem);
    }
  } else {
    nextOrderedSeries = orderedSeries.concat([nextSeriesItem]);
  }

  reconnectCurriculumSeriesChain(nextOrderedSeries);

  nextOrderedSeries.forEach(function (seriesItem) {
    const collectionIndex = collections.series.findIndex(function (entry) {
      return String(entry && entry.id || "").trim() === String(seriesItem && seriesItem.id || "").trim();
    });

    if (collectionIndex >= 0) {
      collections.series[collectionIndex] = seriesItem;
      return;
    }

    collections.series.push(seriesItem);
  });

  currentRawSnapshot.curriculumSeries = collections.series;
  if (shouldAutoApplyCalculatedCurriculumHourDemands(currentRawSnapshot) && activeClass) {
    applyCalculatedCurriculumHourDemandsToSnapshot(currentRawSnapshot, String(activeClass.id || "").trim());
  }
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return window.UnterrichtsassistentApp.closeCurriculumSeriesModal();
};
window.UnterrichtsassistentApp.handleCurriculumSeriesColorPickerInput = function (nextValue) {
  const normalizedColor = normalizePlanningColorValue(nextValue) || "#d9d4cb";
  const colorInput = document.getElementById("curriculumSeriesColorInput");
  const colorPreview = document.getElementById("curriculumSeriesColorPreview");

  if (colorInput && colorInput.value !== normalizedColor) {
    colorInput.value = normalizedColor;
  }

  if (activeCurriculumSeriesDraft) {
    activeCurriculumSeriesDraft.color = normalizedColor;
  }

  if (colorPreview) {
    colorPreview.style.background = normalizedColor;
  }

  return false;
};
window.UnterrichtsassistentApp.handleCurriculumSeriesStartModeChange = function (nextValue) {
  const normalizedMode = String(nextValue || "").trim() === "manual" ? "manual" : "automatic";
  const startDateField = document.getElementById("curriculumSeriesStartDateField");
  const startDateInput = document.getElementById("curriculumSeriesStartDateInput");

  if (activeCurriculumSeriesDraft) {
    activeCurriculumSeriesDraft.startMode = normalizedMode;
    if (normalizedMode !== "manual") {
      activeCurriculumSeriesDraft.startDate = "";
    }
  }

  if (startDateField) {
    startDateField.hidden = normalizedMode !== "manual";
  }

  if (startDateInput) {
    if (normalizedMode !== "manual") {
      startDateInput.value = "";
    }
    startDateInput.disabled = normalizedMode !== "manual";
  }

  return false;
};
window.UnterrichtsassistentApp.applyCalculatedCurriculumHourDemands = function () {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;

  if (!isCurriculumPlanningMode() || planningAdminMode || !currentRawSnapshot || !activeClass) {
    return false;
  }

  if (!applyCalculatedCurriculumHourDemandsToSnapshot(currentRawSnapshot, String(activeClass.id || "").trim())) {
    return false;
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.deleteCurriculumSeries = function (seriesId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const collections = currentRawSnapshot ? getCurriculumCollections(currentRawSnapshot) : null;
  const normalizedSeriesId = String(seriesId || "").trim();
  const orderedSeries = currentRawSnapshot && activeClass
    ? getOrderedCurriculumSeriesForClass(currentRawSnapshot, activeClass.id).slice()
    : [];
  const nextOrderedSeries = orderedSeries.filter(function (entry) {
    return String(entry && entry.id || "").trim() !== normalizedSeriesId;
  });
  const sequenceIdsToDelete = collections
    ? collections.sequences.filter(function (entry) {
        return String(entry && entry.seriesId || "").trim() === normalizedSeriesId;
      }).map(function (entry) {
        return String(entry && entry.id || "").trim();
      })
    : [];
  const lessonIdsToDelete = collections
    ? collections.lessons.filter(function (entry) {
        return sequenceIdsToDelete.indexOf(String(entry && entry.sequenceId || "").trim()) >= 0;
      }).map(function (entry) {
        return String(entry && entry.id || "").trim();
      })
    : [];
  const phaseIdsToDelete = collections
    ? collections.lessonPhases.filter(function (entry) {
        return lessonIdsToDelete.indexOf(String(entry && entry.lessonPlanId || "").trim()) >= 0;
      }).map(function (entry) {
        return String(entry && entry.id || "").trim();
      })
    : [];

  if (!currentRawSnapshot || !collections || !activeClass || !normalizedSeriesId) {
    return false;
  }

  if (!window.confirm("Soll diese Unterrichtsreihe wirklich geloescht werden? Zugehoerige Sequenzen und Stunden werden ebenfalls entfernt.")) {
    return false;
  }

  reconnectCurriculumSeriesChain(nextOrderedSeries);
  collections.series = collections.series.filter(function (entry) {
    return String(entry && entry.classId || "").trim() !== String(activeClass.id || "").trim()
      || nextOrderedSeries.some(function (orderedEntry) {
        return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
      });
  }).map(function (entry) {
    const reordered = nextOrderedSeries.find(function (orderedEntry) {
      return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
    });

    return reordered || entry;
  });
  collections.sequences = collections.sequences.filter(function (entry) {
    return sequenceIdsToDelete.indexOf(String(entry && entry.id || "").trim()) === -1
      && String(entry && entry.seriesId || "").trim() !== normalizedSeriesId;
  });
  collections.lessons = collections.lessons.filter(function (entry) {
    return sequenceIdsToDelete.indexOf(String(entry && entry.sequenceId || "").trim()) === -1;
  });
  collections.lessonPhases = collections.lessonPhases.filter(function (entry) {
    return lessonIdsToDelete.indexOf(String(entry && entry.lessonPlanId || "").trim()) === -1;
  });
  collections.lessonSteps = collections.lessonSteps.filter(function (entry) {
    return phaseIdsToDelete.indexOf(String(entry && entry.phaseId || "").trim()) === -1;
  });
  currentRawSnapshot.curriculumSeries = collections.series;
  currentRawSnapshot.curriculumSequences = collections.sequences;
  currentRawSnapshot.curriculumLessonPlans = collections.lessons;
  currentRawSnapshot.curriculumLessonPhases = collections.lessonPhases;
  currentRawSnapshot.curriculumLessonSteps = collections.lessonSteps;

  if (activeCurriculumSeriesDraft && String(activeCurriculumSeriesDraft.id || "").trim() === normalizedSeriesId) {
    activeCurriculumSeriesDraft = null;
  }

  if (expandedCurriculumSeriesIds.indexOf(normalizedSeriesId) >= 0) {
    expandedCurriculumSeriesIds = expandedCurriculumSeriesIds.filter(function (entry) {
      return entry !== normalizedSeriesId;
    });
    expandedCurriculumSequenceIds = expandedCurriculumSequenceIds.filter(function (entry) {
      const parts = String(entry || "").split("::");
      return parts[0] !== normalizedSeriesId;
    });
    activeCurriculumSequenceDraft = null;
    activeCurriculumLessonDraft = null;
  }

  if (lessonIdsToDelete.indexOf(activeCurriculumLessonFlowLessonId) >= 0) {
    activeCurriculumLessonFlowLessonId = "";
    activeCurriculumLessonFlowViewPhaseIds = [];
  }

  if (shouldAutoApplyCalculatedCurriculumHourDemands(currentRawSnapshot) && activeClass) {
    applyCalculatedCurriculumHourDemandsToSnapshot(currentRawSnapshot, String(activeClass.id || "").trim());
  }
  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return window.UnterrichtsassistentApp.closeCurriculumSeriesModal();
};
window.UnterrichtsassistentApp.submitPlanningEventModal = function (event) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const startDateInput = document.getElementById("planningEventStartDate");
  const endDateInput = document.getElementById("planningEventEndDate");
  const startTimeInput = document.getElementById("planningEventStartTime");
  const endTimeInput = document.getElementById("planningEventEndTime");
  const titleInput = document.getElementById("planningEventTitleInput");
  const priorityInput = document.getElementById("planningEventPriority");
  const categoryInput = document.getElementById("planningEventCategory");
  const descriptionInput = document.getElementById("planningEventDescription");
  const showInTimetableInput = document.getElementById("planningEventShowInTimetable");
  const causesInstructionOutageInput = document.getElementById("planningEventCausesInstructionOutage");
  const recurringInput = document.getElementById("planningEventRecurringInput");
  const recurrenceIntervalInput = document.getElementById("planningEventRecurrenceInterval");
  const recurrenceUnitInput = document.getElementById("planningEventRecurrenceUnit");
  const recurrenceUntilDateInput = document.getElementById("planningEventRecurrenceUntilDate");
  const recurrenceMonthlyWeekdayInput = document.getElementById("planningEventRecurrenceMonthlyWeekday");
  const collections = currentRawSnapshot ? getPlanningCollections(currentRawSnapshot) : null;
  let startDateValue;
  let endDateValue;
  let startTimeValue;
  let endTimeValue;
  let titleValue;
  let priorityValue;
  let categoryValue;
  let descriptionValue;
  let showInTimetableValue;
  let causesInstructionOutageValue;
  let isRecurringValue;
  let recurrenceIntervalValue;
  let recurrenceUnitValue;
  let recurrenceUntilDateValue;
  let recurrenceMonthlyWeekdayValue;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!currentRawSnapshot || !activePlanningEventDraft || !collections) {
    return window.UnterrichtsassistentApp.closePlanningEventModal();
  }

  if (activePlanningEventDraft.isExternallyControlled) {
    return false;
  }

  startDateValue = String(startDateInput && startDateInput.value || "").slice(0, 10);
  endDateValue = String(endDateInput && endDateInput.value || "").slice(0, 10);
  startTimeValue = String(startTimeInput && startTimeInput.value || "").trim();
  endTimeValue = String(endTimeInput && endTimeInput.value || "").trim();
  titleValue = String(titleInput && titleInput.value || "").trim();
  priorityValue = [1, 2, 3].indexOf(Number(priorityInput && priorityInput.value)) >= 0 ? Number(priorityInput.value) : 3;
  categoryValue = normalizePlanningEventCategoryValue(categoryInput && categoryInput.value);
  descriptionValue = String(descriptionInput && descriptionInput.value || "").trim();
  showInTimetableValue = Boolean(showInTimetableInput && showInTimetableInput.checked);
  causesInstructionOutageValue = Boolean(causesInstructionOutageInput && causesInstructionOutageInput.checked);
  isRecurringValue = Boolean(recurringInput && recurringInput.checked);
  recurrenceIntervalValue = normalizePlanningEventRecurrenceInterval(recurrenceIntervalInput && recurrenceIntervalInput.value);
  recurrenceUnitValue = normalizePlanningEventRecurrenceUnit(recurrenceUnitInput && recurrenceUnitInput.value);
  recurrenceUntilDateValue = normalizePlanningEventRecurrenceUntilDate(recurrenceUntilDateInput && recurrenceUntilDateInput.value);
  recurrenceMonthlyWeekdayValue = recurrenceUnitValue === "months" && Boolean(recurrenceMonthlyWeekdayInput && recurrenceMonthlyWeekdayInput.checked);

  if (!startDateValue) {
    return false;
  }

  if (!endDateValue || endDateValue < startDateValue) {
    endDateValue = startDateValue;
  }

  if (isRecurringValue) {
    if (!recurrenceUntilDateValue) {
      return false;
    }

    if (recurrenceUntilDateValue < startDateValue) {
      recurrenceUntilDateValue = startDateValue;
    }
  } else {
    recurrenceIntervalValue = 1;
    recurrenceUnitValue = "weeks";
    recurrenceUntilDateValue = "";
    recurrenceMonthlyWeekdayValue = false;
  }

  if (activePlanningEventDraft.id) {
    const existingEvent = collections.events.find(function (entry) {
      return String(entry && entry.id || "").trim() === String(activePlanningEventDraft.id || "").trim();
    });

    if (existingEvent) {
      existingEvent.title = titleValue;
      existingEvent.startDate = startDateValue;
      existingEvent.endDate = endDateValue;
      existingEvent.startTime = startTimeValue;
      existingEvent.endTime = endTimeValue;
      existingEvent.category = categoryValue;
      existingEvent.description = descriptionValue;
      existingEvent.priority = priorityValue;
      existingEvent.showInTimetable = showInTimetableValue;
      existingEvent.causesInstructionOutage = causesInstructionOutageValue;
      existingEvent.isRecurring = isRecurringValue;
      existingEvent.recurrenceInterval = recurrenceIntervalValue;
      existingEvent.recurrenceUnit = recurrenceUnitValue;
      existingEvent.recurrenceUntilDate = recurrenceUntilDateValue;
      existingEvent.recurrenceMonthlyWeekday = recurrenceMonthlyWeekdayValue;
    } else {
      collections.events.push({
        id: String(activePlanningEventDraft.id || createPlanningEventId()).trim(),
        title: titleValue,
        startDate: startDateValue,
        endDate: endDateValue,
        startTime: startTimeValue,
        endTime: endTimeValue,
        category: categoryValue,
        description: descriptionValue,
        priority: priorityValue,
        showInTimetable: showInTimetableValue,
        causesInstructionOutage: causesInstructionOutageValue,
        isRecurring: isRecurringValue,
        recurrenceInterval: recurrenceIntervalValue,
        recurrenceUnit: recurrenceUnitValue,
        recurrenceUntilDate: recurrenceUntilDateValue,
        recurrenceMonthlyWeekday: recurrenceMonthlyWeekdayValue,
        isExternallyControlled: false,
        controlledByView: "",
        controlledById: ""
      });
    }
  } else {
    collections.events.push({
      id: createPlanningEventId(),
      title: titleValue,
      startDate: startDateValue,
      endDate: endDateValue,
      startTime: startTimeValue,
      endTime: endTimeValue,
      category: categoryValue,
      description: descriptionValue,
      priority: priorityValue,
      showInTimetable: showInTimetableValue,
      causesInstructionOutage: causesInstructionOutageValue,
      isRecurring: isRecurringValue,
      recurrenceInterval: recurrenceIntervalValue,
      recurrenceUnit: recurrenceUnitValue,
      recurrenceUntilDate: recurrenceUntilDateValue,
      recurrenceMonthlyWeekday: recurrenceMonthlyWeekdayValue,
      isExternallyControlled: false,
      controlledByView: "",
      controlledById: ""
    });
  }

  if (categoryValue) {
    const normalizedCategory = categoryValue.toLowerCase();
    const exists = collections.categories.some(function (entry) {
      return String(entry && entry.name || "").trim().toLowerCase() === normalizedCategory;
    });

    if (!exists) {
      collections.categories.push({
        id: createPlanningCategoryId(),
        name: categoryValue,
        color: ""
      });
    }
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return window.UnterrichtsassistentApp.closePlanningEventModal();
};
window.UnterrichtsassistentApp.updatePlanningCategoryColor = function (categoryName, colorValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getPlanningCollections(currentRawSnapshot) : null;
  const normalizedName = String(categoryName || "").trim();
  const normalizedColor = normalizePlanningColorValue(colorValue);
  let existingCategory = null;

  if (!currentRawSnapshot || !collections || !normalizedName) {
    return false;
  }

  if (getDefaultPlanningCategoryDefinition(currentRawSnapshot, normalizedName)) {
    return false;
  }

  existingCategory = getStoredPlanningCategoryEntry(currentRawSnapshot, normalizedName);

  if (!existingCategory) {
    existingCategory = {
      id: createPlanningCategoryId(),
      name: normalizedName,
      color: normalizedColor
    };
    collections.categories.push(existingCategory);
  } else {
    existingCategory.color = normalizedColor;
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.addPlanningCategory = function (inputId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getPlanningCollections(currentRawSnapshot) : null;
  const input = inputId ? document.getElementById(inputId) : null;
  const categoryName = String(input && input.value || "").trim();
  const normalizedName = categoryName.toLowerCase();
  const alreadyExists = collections
    ? getPlanningCategoryDefinitions(currentRawSnapshot).some(function (entry) {
        return String(entry && entry.name || "").trim().toLowerCase() === normalizedName;
      })
    : false;

  if (!currentRawSnapshot || !collections || !categoryName) {
    return false;
  }

  if (alreadyExists) {
    if (input && typeof input.focus === "function") {
      input.focus();
      if (typeof input.select === "function") {
        input.select();
      }
    }
    return false;
  }

  collections.categories.push({
    id: createPlanningCategoryId(),
    name: categoryName,
    color: ""
  });
  currentRawSnapshot.planningCategories = collections.categories;

  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.deletePlanningCategory = function (categoryName) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getPlanningCollections(currentRawSnapshot) : null;
  const normalizedName = String(categoryName || "").trim();
  const fallbackCategory = "Sonstiges";

  if (!currentRawSnapshot || !collections || !normalizedName) {
    return false;
  }

  if (getDefaultPlanningCategoryDefinition(currentRawSnapshot, normalizedName)) {
    return false;
  }

  if (!window.confirm("Soll die Kategorie wirklich geloescht werden? Betroffene Termine und TODOs werden auf 'Sonstiges' gesetzt.")) {
    return false;
  }

  collections.categories = collections.categories.filter(function (entry) {
    return String(entry && entry.name || "").trim().toLowerCase() !== normalizedName.toLowerCase();
  });
  currentRawSnapshot.planningCategories = collections.categories;

  collections.events.forEach(function (entry) {
    if (String(entry && entry.category || "").trim().toLowerCase() === normalizedName.toLowerCase()) {
      entry.category = fallbackCategory;
    }
  });
  getTodosCollection(currentRawSnapshot).forEach(function (entry) {
    if (String(entry && entry.category || "").trim().toLowerCase() === normalizedName.toLowerCase()) {
      entry.category = fallbackCategory;
    }
  });

  if (!getStoredPlanningCategoryEntry(currentRawSnapshot, fallbackCategory) && !getDefaultPlanningCategoryDefinition(currentRawSnapshot, fallbackCategory)) {
    collections.categories.push({
      id: createPlanningCategoryId(),
      name: fallbackCategory,
      color: ""
    });
    currentRawSnapshot.planningCategories = collections.categories;
  }

  planningSidebarCategoryFilters = planningSidebarCategoryFilters.map(function (entry) {
    return String(entry || "").trim().toLowerCase() === normalizedName.toLowerCase()
      ? fallbackCategory
      : entry;
  }).filter(function (entry, index, array) {
    return array.findIndex(function (candidate) {
      return String(candidate || "").trim().toLowerCase() === String(entry || "").trim().toLowerCase();
    }) === index;
  });
  todoCategoryFilters = todoCategoryFilters.map(function (entry) {
    return String(entry || "").trim().toLowerCase() === normalizedName.toLowerCase()
      ? fallbackCategory
      : entry;
  }).filter(function (entry, index, array) {
    return array.findIndex(function (candidate) {
      return String(candidate || "").trim().toLowerCase() === String(entry || "").trim().toLowerCase();
    }) === index;
  });
  if (todoCategoryFilterAllOff && todoCategoryFilters.length) {
    todoCategoryFilterAllOff = false;
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.deletePlanningEvent = function (eventId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const collections = currentRawSnapshot ? getPlanningCollections(currentRawSnapshot) : null;
  const normalizedEventId = String(eventId || "").trim();
  const existingEvent = collections
    ? collections.events.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedEventId;
      }) || null
    : null;
  const nextEvents = collections
    ? collections.events.filter(function (entry) {
        return String(entry && entry.id || "").trim() !== normalizedEventId;
      })
    : null;

  if (!currentRawSnapshot || !collections || !normalizedEventId) {
    return false;
  }

  if (existingEvent && existingEvent.isExternallyControlled) {
    return false;
  }

  if (!window.confirm("Soll dieser Termin wirklich geloescht werden?")) {
    return false;
  }

  if (nextEvents.length === collections.events.length) {
    return false;
  }

  if (String(selectedPlanningEventId || "").trim() === normalizedEventId) {
    selectedPlanningEventId = "";
    selectedPlanningEventOccurrenceId = "";
    selectedPlanningEventOccurrenceRange = null;
  }

  collections.events = nextEvents;
  currentRawSnapshot.planningEvents = nextEvents;

  if (activePlanningEventDraft && String(activePlanningEventDraft.id || "").trim() === normalizedEventId) {
    activePlanningEventDraft = null;
    closePlanningCategorySuggestions();
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "planung");
  return false;
};
window.UnterrichtsassistentApp.beginPlanningRangeSelection = function (event, dateValue) {
  const normalizedDate = String(dateValue || "").slice(0, 10);

  if (!event || !normalizedDate || planningViewMode !== "jahresplanung" || planningAdminMode) {
    return false;
  }

  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  activePlanningRangeDraft = {
    startDate: normalizedDate,
    endDate: normalizedDate,
    pointerId: event.pointerId,
    moved: false
  };

  return false;
};
window.UnterrichtsassistentApp.updatePlanningRangeSelection = function (event, dateValue) {
  const normalizedDate = String(dateValue || "").slice(0, 10);
  const orderedRange = getOrderedPlanningRange(
    activePlanningRangeDraft && activePlanningRangeDraft.startDate,
    normalizedDate
  );

  if (!activePlanningRangeDraft || !normalizedDate) {
    return false;
  }

  if (event && activePlanningRangeDraft.pointerId !== undefined && event.pointerId !== activePlanningRangeDraft.pointerId) {
    return false;
  }

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  activePlanningRangeDraft.endDate = normalizedDate;
  activePlanningRangeDraft.moved = orderedRange.startDate !== orderedRange.endDate || activePlanningRangeDraft.moved;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.endPlanningRangeSelection = function (event, dateValue) {
  const normalizedDate = String(dateValue || "").slice(0, 10);
  let orderedRange;

  if (!activePlanningRangeDraft) {
    return false;
  }

  if (event && activePlanningRangeDraft.pointerId !== undefined && event.pointerId !== activePlanningRangeDraft.pointerId) {
    return false;
  }

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  orderedRange = getOrderedPlanningRange(
    activePlanningRangeDraft.startDate,
    normalizedDate || activePlanningRangeDraft.endDate
  );

  if (activePlanningRangeDraft.moved || orderedRange.startDate !== orderedRange.endDate) {
    activePlanningRangeDraft = null;
    window.UnterrichtsassistentApp.openPlanningEventModal(orderedRange.startDate, "", orderedRange.endDate);
    suppressPlanningDayClickUntil = Date.now() + 250;
    return false;
  }

  activePlanningRangeDraft = null;
  return false;
};
window.UnterrichtsassistentApp.cancelPlanningRangeSelection = function () {
  activePlanningRangeDraft = null;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.openUnterrichtAssessmentModal = function () {
  const modal = getUnterrichtAssessmentModal();
  const header = document.getElementById("unterrichtAssessmentStudent");
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const student = schoolService && activeUnterrichtAssessmentDraft
    ? schoolService.snapshot.students.find(function (entry) {
        return entry.id === activeUnterrichtAssessmentDraft.studentId;
      }) || null
    : null;
  const dateLabel = document.getElementById("unterrichtAssessmentDate");
  const categoryInput = document.getElementById("unterrichtAssessmentCategory");
  const categoryButton = document.querySelector(".assessment-category-button");
  const afb1Input = document.getElementById("unterrichtAssessmentAfb1");
  const afb2Input = document.getElementById("unterrichtAssessmentAfb2");
  const afb3Input = document.getElementById("unterrichtAssessmentAfb3");
  const workInput = document.getElementById("unterrichtAssessmentWorkBehavior");
  const socialInput = document.getElementById("unterrichtAssessmentSocialBehavior");
  const gapInput = document.getElementById("unterrichtAssessmentKnowledgeGap");
  const noteInput = document.getElementById("unterrichtAssessmentNote");
  const firstFocusable = categoryButton || afb1Input;

  if (!modal || !activeUnterrichtAssessmentDraft) {
    return false;
  }

  isUnterrichtAssessmentModalOpen = true;
  modal.hidden = false;
  modal.classList.add("is-open");

  if (header) {
    header.textContent = student
      ? [String(student.firstName || "").trim(), String(student.lastName || "").trim()].filter(Boolean).join(" ")
      : "Schueler";
  }

  if (dateLabel) {
    dateLabel.textContent = [activeClass ? ((activeClass.name || "") + " " + (activeClass.subject || "")).trim() : "", formatDateLabel(activeUnterrichtAssessmentDraft.lessonDate)].filter(Boolean).join(" • ");
  }

  if (categoryInput) {
    categoryInput.value = "";
  }
  syncUnterrichtAssessmentCategoryUi();

  [afb1Input, afb2Input, afb3Input].forEach(function (input) {
    if (input) {
      input.value = "";
    }
  });
  renderUnterrichtAssessmentGrid();

  if (workInput) {
    workInput.value = "";
  }

  if (socialInput) {
    socialInput.value = "";
  }
  syncUnterrichtAssessmentGradeUi();

  if (gapInput) {
    gapInput.value = "";
  }

  if (noteInput) {
    noteInput.value = "";
  }
  closeKnowledgeGapSuggestions();

  if (firstFocusable) {
    window.setTimeout(function () {
      firstFocusable.focus();
    }, 0);
  }

  return false;
};
window.UnterrichtsassistentApp.toggleUnterrichtAssessmentCategory = function (category) {
  const hiddenInput = document.getElementById("unterrichtAssessmentCategory");
  const nextCategory = String(category || "").trim();

  if (!hiddenInput) {
    return false;
  }

  hiddenInput.value = hiddenInput.value === nextCategory ? "" : nextCategory;
  syncUnterrichtAssessmentCategoryUi();
  return false;
};
window.UnterrichtsassistentApp.toggleUnterrichtAssessmentGrade = function (target, value) {
  const normalizedTarget = String(target || "").trim();
  const nextValue = String(value || "").trim();
  const hiddenInput = normalizedTarget === "social"
    ? document.getElementById("unterrichtAssessmentSocialBehavior")
    : document.getElementById("unterrichtAssessmentWorkBehavior");

  if (!hiddenInput) {
    return false;
  }

  hiddenInput.value = hiddenInput.value === nextValue ? "" : nextValue;
  syncUnterrichtAssessmentGradeUi();
  return false;
};
window.UnterrichtsassistentApp.closeUnterrichtAssessmentModal = function () {
  const modal = getUnterrichtAssessmentModal();

  closeKnowledgeGapSuggestions();

  if (modal) {
    modal.hidden = true;
    modal.classList.remove("is-open");
  }

  isUnterrichtAssessmentModalOpen = false;
  activeUnterrichtAssessmentGridDrag = null;
  activeUnterrichtAssessmentDraft = null;
  return false;
};
window.UnterrichtsassistentApp.startUnterrichtAssessmentGridPointer = function (event) {
  const point = getUnterrichtAssessmentGridPoint(event);
  const captureTarget = event && event.currentTarget ? event.currentTarget : getUnterrichtAssessmentGridSvg();

  if (!point) {
    return false;
  }

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  activeUnterrichtAssessmentGridDrag = {
    pointerId: event.pointerId,
    afbs: {}
  };
  activeUnterrichtAssessmentGridDrag.afbs[point.afb] = true;
  setUnterrichtAssessmentGridValue(point.afb, point.qualityValue);
  trySetPointerCapture(captureTarget, event.pointerId);
  renderUnterrichtAssessmentGrid();

  return false;
};
window.UnterrichtsassistentApp.handleUnterrichtAssessmentGridPointerMove = function (event) {
  const point = getUnterrichtAssessmentGridPoint(event);

  if (!activeUnterrichtAssessmentGridDrag || event.pointerId !== activeUnterrichtAssessmentGridDrag.pointerId || !point) {
    return false;
  }

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  activeUnterrichtAssessmentGridDrag.afbs[point.afb] = true;
  setUnterrichtAssessmentGridValue(point.afb, point.qualityValue);
  renderUnterrichtAssessmentGrid();
  return false;
};
window.UnterrichtsassistentApp.handleUnterrichtAssessmentGridPointerUp = function (event) {
  if (!activeUnterrichtAssessmentGridDrag || event.pointerId !== activeUnterrichtAssessmentGridDrag.pointerId) {
    return false;
  }

  activeUnterrichtAssessmentGridDrag = null;
  return false;
};
window.UnterrichtsassistentApp.submitUnterrichtAssessmentModal = function (event) {
  const currentRawSnapshot = schoolService && serializeSnapshot ? serializeSnapshot(schoolService.snapshot) : null;
  const draft = activeUnterrichtAssessmentDraft;
  const categoryInput = document.getElementById("unterrichtAssessmentCategory");
  const afb1Input = document.getElementById("unterrichtAssessmentAfb1");
  const afb2Input = document.getElementById("unterrichtAssessmentAfb2");
  const afb3Input = document.getElementById("unterrichtAssessmentAfb3");
  const workInput = document.getElementById("unterrichtAssessmentWorkBehavior");
  const socialInput = document.getElementById("unterrichtAssessmentSocialBehavior");
  const gapInput = document.getElementById("unterrichtAssessmentKnowledgeGap");
  const noteInput = document.getElementById("unterrichtAssessmentNote");

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!currentRawSnapshot || !draft) {
    return window.UnterrichtsassistentApp.closeUnterrichtAssessmentModal();
  }

  appendUnterrichtAssessmentRecord(currentRawSnapshot, draft, {
    category: String(categoryInput && categoryInput.value || "").trim(),
    afb1: String(afb1Input && afb1Input.value || "").trim() === "" ? "" : Number(afb1Input.value),
    afb2: String(afb2Input && afb2Input.value || "").trim() === "" ? "" : Number(afb2Input.value),
    afb3: String(afb3Input && afb3Input.value || "").trim() === "" ? "" : Number(afb3Input.value),
    workBehavior: String(workInput && workInput.value || "").trim(),
    socialBehavior: String(socialInput && socialInput.value || "").trim(),
    knowledgeGap: String(gapInput && gapInput.value || "").trim(),
    note: String(noteInput && noteInput.value || "").trim()
  });

  saveAndRefreshSnapshot(currentRawSnapshot, "unterricht");
  return window.UnterrichtsassistentApp.closeUnterrichtAssessmentModal();
};
window.UnterrichtsassistentApp.handleUnterrichtHomeworkPointerMove = function (event) {
  if (!activeUnterrichtHomeworkPress || event.pointerId !== activeUnterrichtHomeworkPress.pointerId) {
    return false;
  }

  activeUnterrichtHomeworkPress.clientX = Number(event.clientX) || 0;
  activeUnterrichtHomeworkPress.clientY = Number(event.clientY) || 0;

  if (!activeUnterrichtHomeworkPress.menuVisible) {
    if (Math.abs(activeUnterrichtHomeworkPress.clientX - activeUnterrichtHomeworkPress.anchorX) >= 8
      || Math.abs(activeUnterrichtHomeworkPress.clientY - activeUnterrichtHomeworkPress.anchorY) >= 8) {
      openUnterrichtHomeworkRadialMenuImmediately();
    }
  }

  if (activeUnterrichtHomeworkPress.menuVisible) {
    activeUnterrichtHomeworkPress.selectedQuality = getUnterrichtHomeworkRadialQuality(
      activeUnterrichtHomeworkPress.clientX,
      activeUnterrichtHomeworkPress.clientY,
      activeUnterrichtHomeworkPress.anchorX,
      activeUnterrichtHomeworkPress.anchorY
    );
    setUnterrichtHomeworkRadialSelection(activeUnterrichtHomeworkPress.selectedQuality);
  }

  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.handleUnterrichtHomeworkPointerEnd = function (event) {
  const pressState = activeUnterrichtHomeworkPress;

  if (!pressState || event.pointerId !== pressState.pointerId) {
    return false;
  }

  if (pressState.timerId) {
    window.clearTimeout(pressState.timerId);
  }

  clearUnterrichtHomeworkPressListeners();
  activeUnterrichtHomeworkPress = null;

  if (pressState.menuVisible) {
    hideUnterrichtHomeworkRadialMenu();
    if (pressState.selectedQuality) {
      window.UnterrichtsassistentApp.handleUnterrichtSeatClick(
        pressState.studentId,
        pressState.lessonId,
        pressState.lessonStartTime,
        pressState.lessonRoom,
        pressState.selectedQuality,
        "set"
      );
    }
    event.preventDefault();
    return false;
  }

  hideUnterrichtHomeworkRadialMenu();
  window.UnterrichtsassistentApp.handleUnterrichtSeatClick(
    pressState.studentId,
    pressState.lessonId,
    pressState.lessonStartTime,
    pressState.lessonRoom
  );
  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.getClassViewMode = function () {
  return classViewMode;
};
window.UnterrichtsassistentApp.getActiveClassAnalysisDetailDraft = function () {
  return activeClassAnalysisDetailDraft
    ? {
      studentId: String(activeClassAnalysisDetailDraft.studentId || ""),
      groupKey: String(activeClassAnalysisDetailDraft.groupKey || ""),
      groupLabel: String(activeClassAnalysisDetailDraft.groupLabel || "")
    }
    : null;
};
window.UnterrichtsassistentApp.getActiveClassAnalysisRecordEditDraft = function () {
  return activeClassAnalysisRecordEditDraft
    ? {
      recordType: String(activeClassAnalysisRecordEditDraft.recordType || ""),
      recordId: String(activeClassAnalysisRecordEditDraft.recordId || "")
    }
    : null;
};
window.UnterrichtsassistentApp.getClassAnalysisSort = function () {
  return {
    key: classAnalysisSort && classAnalysisSort.key ? classAnalysisSort.key : "name",
    direction: classAnalysisSort && classAnalysisSort.direction === "desc" ? "desc" : "asc"
  };
};
window.UnterrichtsassistentApp.getClassAnalysisEnabledTypes = function () {
  return {
    attendance: classAnalysisEnabledTypes.attendance !== false,
    homework: classAnalysisEnabledTypes.homework !== false,
    warning: classAnalysisEnabledTypes.warning !== false,
    assessment: classAnalysisEnabledTypes.assessment !== false,
    completedEvaluation: classAnalysisEnabledTypes.completedEvaluation !== false
  };
};
window.UnterrichtsassistentApp.getClassAnalysisGrouping = function () {
  return ["day", "week", "month", "total"].indexOf(String(classAnalysisGrouping || "")) >= 0
    ? classAnalysisGrouping
    : "day";
};
window.UnterrichtsassistentApp.getClassAnalysisCriterion = function () {
  return ["count", "performance", "workBehavior"].indexOf(String(classAnalysisCriterion || "")) >= 0
    ? classAnalysisCriterion
    : "count";
};
window.UnterrichtsassistentApp.setClassAnalysisGrouping = function (groupingKey) {
  const normalizedGrouping = String(groupingKey || "").trim();

  classAnalysisGrouping = ["day", "week", "month", "total"].indexOf(normalizedGrouping) >= 0
    ? normalizedGrouping
    : "day";
  classAnalysisSort = { key: "name", direction: "asc" };
  activeClassAnalysisDetailDraft = null;
  activeClassAnalysisRecordEditDraft = null;
  isClassAnalysisDetailModalOpen = false;
  isClassAnalysisRecordEditModalOpen = false;

  if (activeViewId === "klasse") {
    setActiveView("klasse");
  }

  return false;
};
window.UnterrichtsassistentApp.setClassAnalysisCriterion = function (criterionKey) {
  const normalizedCriterion = String(criterionKey || "").trim();

  classAnalysisCriterion = ["count", "performance", "workBehavior"].indexOf(normalizedCriterion) >= 0
    ? normalizedCriterion
    : "count";
  classAnalysisSort = { key: "name", direction: "asc" };
  activeClassAnalysisDetailDraft = null;
  activeClassAnalysisRecordEditDraft = null;
  isClassAnalysisDetailModalOpen = false;
  isClassAnalysisRecordEditModalOpen = false;

  if (activeViewId === "klasse") {
    setActiveView("klasse");
  }

  return false;
};
window.UnterrichtsassistentApp.toggleClassAnalysisType = function (typeKey) {
  const normalizedType = String(typeKey || "").trim();

  if (["attendance", "homework", "warning", "assessment", "completedEvaluation"].indexOf(normalizedType) < 0) {
    return false;
  }

  classAnalysisEnabledTypes[normalizedType] = !classAnalysisEnabledTypes[normalizedType];

  if (activeViewId === "klasse") {
    setActiveView("klasse");
  }

  return false;
};
window.UnterrichtsassistentApp.setClassAnalysisSort = function (key) {
  const nextKey = String(key || "").trim() || "name";

  if (classAnalysisSort.key === nextKey) {
    classAnalysisSort.direction = classAnalysisSort.direction === "desc" ? "asc" : "desc";
  } else {
    classAnalysisSort = {
      key: nextKey,
      direction: "desc"
    };
  }

  if (activeViewId === "klasse") {
    setActiveView("klasse");
  }

  return false;
};
window.UnterrichtsassistentApp.openClassAnalysisDetailModal = function () {
  const modal = getClassAnalysisDetailModal();

  if (!modal || !activeClassAnalysisDetailDraft) {
    return false;
  }

  isClassAnalysisDetailModalOpen = true;
  modal.hidden = false;
  modal.classList.add("is-open");
  return false;
};
window.UnterrichtsassistentApp.closeClassAnalysisDetailModal = function () {
  const modal = getClassAnalysisDetailModal();

  if (modal) {
    modal.hidden = true;
    modal.classList.remove("is-open");
  }

  isClassAnalysisDetailModalOpen = false;
  activeClassAnalysisDetailDraft = null;
  return false;
};
window.UnterrichtsassistentApp.openClassAnalysisDetail = function (studentId, groupKey, groupLabel) {
  if (!studentId || !groupKey || activeViewId !== "klasse" || isClassManageMode()) {
    return false;
  }

  activeClassAnalysisDetailDraft = {
    studentId: String(studentId),
    groupKey: String(groupKey),
    groupLabel: String(groupLabel || "")
  };
  isClassAnalysisDetailModalOpen = true;
  setActiveView("klasse");
  return false;
};
window.UnterrichtsassistentApp.openClassAnalysisRecordEditModal = function () {
  const modal = getClassAnalysisRecordEditModal();

  if (!modal || !activeClassAnalysisRecordEditDraft) {
    return false;
  }

  isClassAnalysisRecordEditModalOpen = true;
  modal.hidden = false;
  modal.classList.add("is-open");
  syncClassAnalysisAssessmentCategoryUi();
  syncClassAnalysisAssessmentGradeUi();
  syncClassAnalysisHomeworkUi();
  syncClassAnalysisWarningUi();
  renderClassAnalysisAssessmentGrid();
  closeKnowledgeGapSuggestions();
  return false;
};
window.UnterrichtsassistentApp.closeClassAnalysisRecordEditModal = function () {
  const modal = getClassAnalysisRecordEditModal();

  closeKnowledgeGapSuggestions();

  if (modal) {
    modal.hidden = true;
    modal.classList.remove("is-open");
  }

  isClassAnalysisRecordEditModalOpen = false;
  activeClassAnalysisAssessmentGridDrag = null;
  activeClassAnalysisRecordEditDraft = null;
  return false;
};
window.UnterrichtsassistentApp.openClassAnalysisRecordEdit = function (recordType, recordId) {
  if (!recordType || !recordId || activeViewId !== "klasse") {
    return false;
  }

  activeClassAnalysisRecordEditDraft = {
    recordType: String(recordType),
    recordId: String(recordId)
  };
  isClassAnalysisRecordEditModalOpen = true;
  setActiveView("klasse");
  return false;
};
window.UnterrichtsassistentApp.getActiveClassAnalysisPerformedEvaluationDraft = function () {
  return activeClassAnalysisPerformedEvaluationDraft
    ? {
      plannedEvaluationId: String(activeClassAnalysisPerformedEvaluationDraft.plannedEvaluationId || ""),
      studentId: String(activeClassAnalysisPerformedEvaluationDraft.studentId || "")
    }
    : null;
};
window.UnterrichtsassistentApp.openClassAnalysisPerformedEvaluationModal = function () {
  if (!activeClassAnalysisPerformedEvaluationDraft) {
    return false;
  }

  isClassAnalysisPerformedEvaluationModalOpen = true;
  renderClassAnalysisPerformedEvaluationModal();
  return false;
};
window.UnterrichtsassistentApp.closeClassAnalysisPerformedEvaluationModal = function () {
  isClassAnalysisPerformedEvaluationModalOpen = false;
  activeClassAnalysisPerformedEvaluationDraft = null;
  renderClassAnalysisPerformedEvaluationModal();
  return false;
};
window.UnterrichtsassistentApp.openClassAnalysisPerformedEvaluation = function (plannedEvaluationId, studentId) {
  const nextPlannedEvaluationId = String(plannedEvaluationId || "").trim();
  const nextStudentId = String(studentId || "").trim();

  if (!nextPlannedEvaluationId || !nextStudentId || activeViewId !== "klasse") {
    return false;
  }

  window.UnterrichtsassistentApp.closeClassAnalysisDetailModal();
  activeClassAnalysisPerformedEvaluationDraft = {
    plannedEvaluationId: nextPlannedEvaluationId,
    studentId: nextStudentId
  };
  isClassAnalysisPerformedEvaluationModalOpen = true;
  renderClassAnalysisPerformedEvaluationModal();
  return false;
};
window.UnterrichtsassistentApp.openPerformedEvaluationFromClassAnalysis = function () {
  const plannedEvaluationId = String(activeClassAnalysisPerformedEvaluationDraft && activeClassAnalysisPerformedEvaluationDraft.plannedEvaluationId || "").trim();
  const studentId = String(activeClassAnalysisPerformedEvaluationDraft && activeClassAnalysisPerformedEvaluationDraft.studentId || "").trim();

  if (!plannedEvaluationId || !studentId) {
    return false;
  }

  activeClassAnalysisPerformedEvaluationDraft = null;
  isClassAnalysisPerformedEvaluationModalOpen = false;
  activeClassAnalysisDetailDraft = null;
  isClassAnalysisDetailModalOpen = false;
  activePerformedEvaluationStudentFilter = "alle";
  bewertungViewMode = "bewerten";
  activePlannedEvaluationDraft = null;
  activePerformedEvaluationDetailModal = null;
  activePerformedPlannedEvaluationId = plannedEvaluationId;
  activePerformedEvaluationStudentId = studentId;
  renderClassAnalysisPerformedEvaluationModal();
  setActiveView("bewertung");

  return false;
};
window.UnterrichtsassistentApp.deleteClassAnalysisRecord = function (recordType, recordId) {
  const currentRawSnapshot = schoolService && serializeSnapshot ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedType = String(recordType || "").trim();
  const normalizedId = String(recordId || "").trim();

  if (!currentRawSnapshot || !normalizedType || !normalizedId) {
    return false;
  }

  if (!window.confirm("Soll dieser Datensatz wirklich dauerhaft geloescht werden?")) {
    return false;
  }

  if (normalizedType === "assessment") {
    currentRawSnapshot.assessments = (currentRawSnapshot.assessments || []).filter(function (record) {
      return String(record.id || "") !== normalizedId;
    });
  } else if (normalizedType === "attendance") {
    currentRawSnapshot.attendanceRecords = getAttendanceRecordsCollection(currentRawSnapshot).filter(function (record) {
      return String(record.id || "") !== normalizedId;
    });
  } else if (normalizedType === "homework") {
    currentRawSnapshot.homeworkRecords = getHomeworkRecordsCollection(currentRawSnapshot).filter(function (record) {
      return String(record.id || "") !== normalizedId;
    });
  } else if (normalizedType === "warning") {
    currentRawSnapshot.warningRecords = getWarningRecordsCollection(currentRawSnapshot).filter(function (record) {
      return String(record.id || "") !== normalizedId;
    });
  } else {
    return false;
  }

  if (activeClassAnalysisRecordEditDraft
    && String(activeClassAnalysisRecordEditDraft.recordType || "") === normalizedType
    && String(activeClassAnalysisRecordEditDraft.recordId || "") === normalizedId) {
    window.UnterrichtsassistentApp.closeClassAnalysisRecordEditModal();
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "klasse");
  return false;
};
window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentCategory = function (category) {
  const hiddenInput = document.getElementById("classAnalysisAssessmentCategory");
  const nextCategory = String(category || "").trim();

  if (!hiddenInput) {
    return false;
  }

  hiddenInput.value = hiddenInput.value === nextCategory ? "" : nextCategory;
  syncClassAnalysisAssessmentCategoryUi();
  return false;
};
window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentGrade = function (target, value) {
  const hiddenInput = String(target || "").trim() === "social"
    ? document.getElementById("classAnalysisAssessmentSocialBehavior")
    : document.getElementById("classAnalysisAssessmentWorkBehavior");
  const nextValue = String(value || "").trim();

  if (!hiddenInput) {
    return false;
  }

  hiddenInput.value = hiddenInput.value === nextValue ? "" : nextValue;
  syncClassAnalysisAssessmentGradeUi();
  return false;
};
window.UnterrichtsassistentApp.startClassAnalysisAssessmentGridPointer = function (event) {
  const point = getClassAnalysisAssessmentGridPoint(event);
  const captureTarget = event && event.currentTarget ? event.currentTarget : getClassAnalysisAssessmentGridSvg();

  if (!point) {
    return false;
  }

  event.preventDefault();
  activeClassAnalysisAssessmentGridDrag = { pointerId: event.pointerId };
  setClassAnalysisAssessmentGridValue(point.afb, point.qualityValue);
  trySetPointerCapture(captureTarget, event.pointerId);
  renderClassAnalysisAssessmentGrid();
  return false;
};
window.UnterrichtsassistentApp.handleClassAnalysisAssessmentGridPointerMove = function (event) {
  const point = getClassAnalysisAssessmentGridPoint(event);

  if (!activeClassAnalysisAssessmentGridDrag || event.pointerId !== activeClassAnalysisAssessmentGridDrag.pointerId || !point) {
    return false;
  }

  event.preventDefault();
  setClassAnalysisAssessmentGridValue(point.afb, point.qualityValue);
  renderClassAnalysisAssessmentGrid();
  return false;
};
window.UnterrichtsassistentApp.handleClassAnalysisAssessmentGridPointerUp = function (event) {
  if (!activeClassAnalysisAssessmentGridDrag || event.pointerId !== activeClassAnalysisAssessmentGridDrag.pointerId) {
    return false;
  }

  activeClassAnalysisAssessmentGridDrag = null;
  return false;
};
window.UnterrichtsassistentApp.toggleClassAnalysisHomeworkQuality = function (quality) {
  const input = document.getElementById("classAnalysisHomeworkQuality");
  const nextValue = String(quality || "").trim();

  if (!input) {
    return false;
  }

  input.value = input.value === nextValue ? "" : nextValue;
  syncClassAnalysisHomeworkUi();
  return false;
};
window.UnterrichtsassistentApp.toggleClassAnalysisWarningCategory = function (category) {
  const input = document.getElementById("classAnalysisWarningCategory");
  const nextValue = String(category || "").trim();

  if (!input) {
    return false;
  }

  input.value = input.value === nextValue ? "" : nextValue;
  syncClassAnalysisWarningUi();
  return false;
};
window.UnterrichtsassistentApp.submitClassAnalysisRecordEditModal = function (event) {
  const currentRawSnapshot = schoolService && serializeSnapshot ? serializeSnapshot(schoolService.snapshot) : null;
  const draft = activeClassAnalysisRecordEditDraft;
  let record;
  let timeValue;
  let statusValue;
  let qualityValue;
  let categoryValue;
  let noteValue;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!currentRawSnapshot || !draft) {
    return window.UnterrichtsassistentApp.closeClassAnalysisRecordEditModal();
  }

  record = getClassAnalysisRecordByDraft(currentRawSnapshot, draft);
  if (!record) {
    return window.UnterrichtsassistentApp.closeClassAnalysisRecordEditModal();
  }

  if (draft.recordType === "attendance") {
    timeValue = String(document.getElementById("classAnalysisAttendanceTime") && document.getElementById("classAnalysisAttendanceTime").value || "").trim();
    statusValue = String(document.getElementById("classAnalysisAttendanceStatus") && document.getElementById("classAnalysisAttendanceStatus").value || "absent").trim();
    record.status = statusValue === "present" ? "present" : "absent";
    if (timeValue) {
      record.effectiveAt = combineDateAndTimeValue(record.lessonDate, timeValue);
      record.recordedAt = combineDateAndTimeValue(record.lessonDate, timeValue);
    }
  } else if (draft.recordType === "homework") {
    qualityValue = normalizeHomeworkQualityValue(document.getElementById("classAnalysisHomeworkQuality") && document.getElementById("classAnalysisHomeworkQuality").value);
    record.quality = qualityValue;
  } else if (draft.recordType === "warning") {
    categoryValue = normalizeWarningCategoryValue(document.getElementById("classAnalysisWarningCategory") && document.getElementById("classAnalysisWarningCategory").value);
    noteValue = String(document.getElementById("classAnalysisWarningNote") && document.getElementById("classAnalysisWarningNote").value || "").trim();
    record.category = categoryValue;
    record.note = categoryValue === "andere" ? noteValue : "";
  } else if (draft.recordType === "assessment") {
    record.category = String(document.getElementById("classAnalysisAssessmentCategory") && document.getElementById("classAnalysisAssessmentCategory").value || "").trim();
    record.afb1 = String(document.getElementById("classAnalysisAssessmentAfb1") && document.getElementById("classAnalysisAssessmentAfb1").value || "").trim() === "" ? "" : Number(document.getElementById("classAnalysisAssessmentAfb1").value);
    record.afb2 = String(document.getElementById("classAnalysisAssessmentAfb2") && document.getElementById("classAnalysisAssessmentAfb2").value || "").trim() === "" ? "" : Number(document.getElementById("classAnalysisAssessmentAfb2").value);
    record.afb3 = String(document.getElementById("classAnalysisAssessmentAfb3") && document.getElementById("classAnalysisAssessmentAfb3").value || "").trim() === "" ? "" : Number(document.getElementById("classAnalysisAssessmentAfb3").value);
    record.workBehavior = String(document.getElementById("classAnalysisAssessmentWorkBehavior") && document.getElementById("classAnalysisAssessmentWorkBehavior").value || "").trim();
    record.socialBehavior = String(document.getElementById("classAnalysisAssessmentSocialBehavior") && document.getElementById("classAnalysisAssessmentSocialBehavior").value || "").trim();
    record.knowledgeGap = String(document.getElementById("classAnalysisAssessmentKnowledgeGap") && document.getElementById("classAnalysisAssessmentKnowledgeGap").value || "").trim();
    record.note = String(document.getElementById("classAnalysisAssessmentNote") && document.getElementById("classAnalysisAssessmentNote").value || "").trim();
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "klasse");
  return window.UnterrichtsassistentApp.closeClassAnalysisRecordEditModal();
};
window.UnterrichtsassistentApp.setClassViewMode = function (nextMode) {
  classViewMode = nextMode === "verwalten" ? "verwalten" : "analyse";

  if (activeViewId === "klasse") {
    setActiveView("klasse");
  }

  return false;
};
window.UnterrichtsassistentApp.handleClassAnalysisDragScrollMove = function (event) {
  const deltaX = activeClassAnalysisDragScroll
    ? (Number(event.clientX) || 0) - activeClassAnalysisDragScroll.startX
    : 0;

  if (!activeClassAnalysisDragScroll || event.pointerId !== activeClassAnalysisDragScroll.pointerId) {
    return false;
  }

  if (!activeClassAnalysisDragScroll.didDrag) {
    if (Math.abs(deltaX) < 6) {
      return false;
    }

    activeClassAnalysisDragScroll.didDrag = true;
    activeClassAnalysisDragScroll.wrap.classList.add("is-dragging");
    trySetPointerCapture(activeClassAnalysisDragScroll.wrap, activeClassAnalysisDragScroll.pointerId);
  }

  activeClassAnalysisDragScroll.wrap.scrollLeft = activeClassAnalysisDragScroll.startScrollLeft - deltaX;
  if (activeClassAnalysisDragScroll.classId) {
    classAnalysisScrollLeftByClassId[activeClassAnalysisDragScroll.classId] = activeClassAnalysisDragScroll.wrap.scrollLeft;
  }
  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.handleClassAnalysisDragScrollEnd = function (event) {
  const didDrag = activeClassAnalysisDragScroll ? activeClassAnalysisDragScroll.didDrag === true : false;
  const wrap = activeClassAnalysisDragScroll ? activeClassAnalysisDragScroll.wrap : null;
  const pointerId = activeClassAnalysisDragScroll ? activeClassAnalysisDragScroll.pointerId : null;

  if (!activeClassAnalysisDragScroll || event.pointerId !== activeClassAnalysisDragScroll.pointerId) {
    return false;
  }

  clearClassAnalysisDragScroll();

  if (didDrag) {
    tryReleasePointerCapture(wrap, pointerId);
    event.preventDefault();
  }

  return false;
};
window.UnterrichtsassistentApp.handlePlanningCurriculumDragScrollMove = function (event) {
  const deltaX = activePlanningCurriculumDragScroll
    ? (Number(event.clientX) || 0) - activePlanningCurriculumDragScroll.startX
    : 0;

  if (!activePlanningCurriculumDragScroll || event.pointerId !== activePlanningCurriculumDragScroll.pointerId) {
    return false;
  }

  if (!activePlanningCurriculumDragScroll.didDrag) {
    if (Math.abs(deltaX) < 6) {
      return false;
    }

    activePlanningCurriculumDragScroll.didDrag = true;
    activePlanningCurriculumDragScroll.wrap.classList.add("is-dragging");
    trySetPointerCapture(activePlanningCurriculumDragScroll.wrap, activePlanningCurriculumDragScroll.pointerId);
  }

  activePlanningCurriculumDragScroll.wrap.scrollLeft = activePlanningCurriculumDragScroll.startScrollLeft - deltaX;
  if (activePlanningCurriculumDragScroll.wrap) {
    const classId = String(activePlanningCurriculumDragScroll.wrap.dataset.classId || "");

    if (classId) {
      planningCurriculumScrollLeftByClassId[classId] = activePlanningCurriculumDragScroll.wrap.scrollLeft;
    }
  }
  event.preventDefault();
  return false;
};
window.UnterrichtsassistentApp.handlePlanningCurriculumDragScrollEnd = function (event) {
  const didDrag = activePlanningCurriculumDragScroll ? activePlanningCurriculumDragScroll.didDrag === true : false;
  const wrap = activePlanningCurriculumDragScroll ? activePlanningCurriculumDragScroll.wrap : null;
  const pointerId = activePlanningCurriculumDragScroll ? activePlanningCurriculumDragScroll.pointerId : null;

  if (!activePlanningCurriculumDragScroll || event.pointerId !== activePlanningCurriculumDragScroll.pointerId) {
    return false;
  }

  clearPlanningCurriculumDragScroll();

  if (didDrag) {
    tryReleasePointerCapture(wrap, pointerId);
    event.preventDefault();
  }

  return false;
};
window.UnterrichtsassistentApp.getTimetableViewMode = function () {
  return timetableViewMode;
};
window.UnterrichtsassistentApp.setTimetableViewMode = function (nextMode) {
  timetableViewMode = nextMode === "verwalten" ? "verwalten" : "ansicht";

  if (timetableViewMode === "verwalten") {
    return syncManagedTimetableToCurrent("stundenplan");
  }

  if (activeViewId === "stundenplan") {
    setActiveView("stundenplan");
  }

  return false;
};
window.UnterrichtsassistentApp.getSeatPlanViewMode = function () {
  return seatPlanViewMode;
};
window.UnterrichtsassistentApp.getPlanningViewMode = function () {
  return planningViewMode;
};
window.UnterrichtsassistentApp.getBewertungViewMode = function () {
  return bewertungViewMode;
};
window.UnterrichtsassistentApp.getActiveEvaluationSheetDraft = function () {
  return activeEvaluationSheetDraft;
};
window.UnterrichtsassistentApp.getActivePlannedEvaluationDraft = function () {
  return activePlannedEvaluationDraft;
};
window.UnterrichtsassistentApp.getActivePerformedPlannedEvaluationId = function () {
  return activePerformedPlannedEvaluationId;
};
window.UnterrichtsassistentApp.getActivePerformedEvaluationStudentId = function () {
  return activePerformedEvaluationStudentId;
};
window.UnterrichtsassistentApp.getActivePerformedEvaluationStudentFilter = function () {
  return activePerformedEvaluationStudentFilter;
};
window.UnterrichtsassistentApp.getActivePerformedEvaluationDetailModal = function () {
  return activePerformedEvaluationDetailModal
    ? Object.assign({}, activePerformedEvaluationDetailModal)
    : null;
};
window.UnterrichtsassistentApp.normalizePerformedEvaluationPoints = normalizePerformedEvaluationPoints;
window.UnterrichtsassistentApp.isPlanningAvailableLessonsExpanded = function () {
  return planningAvailableLessonsExpanded !== false;
};
window.UnterrichtsassistentApp.isPlanningAdminMode = function () {
  return planningAdminMode;
};
window.UnterrichtsassistentApp.isBewertungCurriculumSectionExpanded = function () {
  return bewertungCurriculumSectionExpanded !== false;
};
window.UnterrichtsassistentApp.isBewertungTaskSheetSectionExpanded = function () {
  return bewertungTaskSheetSectionExpanded !== false;
};
window.UnterrichtsassistentApp.isBewertungAnalysisSectionExpanded = function () {
  return bewertungAnalysisSectionExpanded !== false;
};
window.UnterrichtsassistentApp.isBewertungPlannedEvaluationsExpanded = function () {
  return bewertungPlannedEvaluationsExpanded === true;
};
window.UnterrichtsassistentApp.isBewertungPlannedEvaluationDetailsExpanded = function () {
  return bewertungPlannedEvaluationDetailsExpanded !== false;
};
window.UnterrichtsassistentApp.getActivePlanningEventDraft = function () {
  return activePlanningEventDraft;
};
window.UnterrichtsassistentApp.getActivePlanningInstructionLessonDraft = function () {
  return activePlanningInstructionLessonDraft;
};
window.UnterrichtsassistentApp.getActiveCurriculumSeriesDraft = function () {
  return activeCurriculumSeriesDraft;
};
window.UnterrichtsassistentApp.getActiveCurriculumSequenceDraft = function () {
  return activeCurriculumSequenceDraft;
};
window.UnterrichtsassistentApp.getActiveCurriculumLessonDraft = function () {
  return activeCurriculumLessonDraft;
};
window.UnterrichtsassistentApp.getActiveCurriculumLessonFlowLessonId = function () {
  return activeCurriculumLessonFlowLessonId;
};
window.UnterrichtsassistentApp.getActiveCurriculumLessonFlowViewPhaseIds = function () {
  return activeCurriculumLessonFlowViewPhaseIds.slice();
};
window.UnterrichtsassistentApp.getExpandedCurriculumSeriesIds = function () {
  return expandedCurriculumSeriesIds.slice();
};
window.UnterrichtsassistentApp.getExpandedCurriculumSequenceIds = function () {
  return expandedCurriculumSequenceIds.slice();
};
window.UnterrichtsassistentApp.getActivePlanningRangeDraft = function () {
  return activePlanningRangeDraft;
};
window.UnterrichtsassistentApp.getSeatPlanManageMode = function () {
  return seatPlanViewMode === "tischordnung" ? "tischordnung" : "sitzordnung";
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
  seatPlanViewMode = ["sitzordnung", "tischordnung"].indexOf(nextMode) >= 0 ? nextMode : "ansicht";
  seatPlanManageMode = seatPlanViewMode === "tischordnung" ? "tischordnung" : "sitzordnung";

  if (seatPlanViewMode !== "ansicht") {
    return syncManagedSeatPlanToCurrent("sitzplan");
  }

  if (activeViewId === "sitzplan") {
    setActiveView("sitzplan");
  }

  return false;
};
window.UnterrichtsassistentApp.setPlanningViewMode = function (nextMode) {
  const normalizedMode = String(nextMode || "");

  planningViewMode = normalizedMode === "unterrichtsplanung" || normalizedMode === "stoffplanung"
    ? "unterrichtsplanung"
    : "jahresplanung";

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.setBewertungViewMode = function (nextMode) {
  const normalizedMode = String(nextMode || "");

  bewertungViewMode = ["analysieren", "evidenz", "erstellen", "entwerfen"].indexOf(normalizedMode) >= 0
    ? (normalizedMode === "entwerfen" ? "erstellen" : normalizedMode)
    : "bewerten";
  if (bewertungViewMode !== "erstellen") {
    activeEvaluationSheetDraft = null;
  }
  if (bewertungViewMode !== "bewerten") {
    activePlannedEvaluationDraft = null;
    activePerformedPlannedEvaluationId = "";
    activePerformedEvaluationStudentId = "";
  }

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.toggleBewertungPlannedEvaluationsExpanded = function () {
  bewertungPlannedEvaluationsExpanded = !bewertungPlannedEvaluationsExpanded;

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.toggleBewertungSection = function (sectionName) {
  const normalizedSectionName = String(sectionName || "").trim().toLowerCase();

  if (normalizedSectionName === "curriculum") {
    bewertungCurriculumSectionExpanded = !bewertungCurriculumSectionExpanded;
  } else if (normalizedSectionName === "tasksheet") {
    bewertungTaskSheetSectionExpanded = !bewertungTaskSheetSectionExpanded;
  } else if (normalizedSectionName === "analysis") {
    bewertungAnalysisSectionExpanded = !bewertungAnalysisSectionExpanded;
  } else if (normalizedSectionName === "planneddetail") {
    bewertungPlannedEvaluationDetailsExpanded = !bewertungPlannedEvaluationDetailsExpanded;
  } else {
    return false;
  }

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.togglePlanningAvailableLessons = function () {
  planningAvailableLessonsExpanded = !planningAvailableLessonsExpanded;

  if (activeViewId === "planung") {
    setActiveView("planung");
  }

  return false;
};
window.UnterrichtsassistentApp.togglePlanningAdminMode = function () {
  planningAdminMode = !planningAdminMode;

  if (activeViewId === "planung") {
    setActiveView("planung");
  } else {
    updateHeaderUtility(activeViewId);
  }

  return false;
};
window.UnterrichtsassistentApp.changeActiveEvaluationSheet = function (sheetId) {
  if (!repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  currentRawSnapshot.activeEvaluationSheetId = String(sheetId || "").trim() || null;
  refreshSnapshotInMemory(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.openEvaluationSheetModal = function (sheetId) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const selectedSheet = currentRawSnapshot
    ? getEvaluationSheetsCollection(currentRawSnapshot).find(function (item) {
        return String(item && item.id || "").trim() === String(sheetId || "").trim();
      }) || null
    : null;

  if (!activeClass) {
    return false;
  }

  activeEvaluationSheetDraft = selectedSheet
    ? {
        id: String(selectedSheet.id || "").trim(),
        classId: String(selectedSheet.classId || activeClass.id || "").trim(),
        type: String(selectedSheet.type || "aufgabenbogen").trim(),
        title: String(selectedSheet.title || "").trim(),
        workingTimeMinutes: normalizeEvaluationWorkingTimeMinutes(selectedSheet.workingTimeMinutes),
        copyFromId: ""
      }
    : {
        id: "",
        classId: String(activeClass.id || "").trim(),
        type: "aufgabenbogen",
        title: "",
        workingTimeMinutes: 0,
        copyFromId: ""
      };

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.openLinkedEvaluationSheetFromPlannedEvaluation = function () {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedSheetId = String(activePlannedEvaluationDraft && activePlannedEvaluationDraft.evaluationSheetId || "").trim();

  if (!repository || !schoolService || !currentRawSnapshot || !normalizedSheetId) {
    return false;
  }

  currentRawSnapshot.activeEvaluationSheetId = normalizedSheetId;
  activePlannedEvaluationDraft = null;
  refreshSnapshotInMemory(currentRawSnapshot, "bewertung");
  return window.UnterrichtsassistentApp.setBewertungViewMode("erstellen");
};
window.UnterrichtsassistentApp.closeEvaluationSheetModal = function () {
  activeEvaluationSheetDraft = null;

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.openPlannedEvaluationModal = function (plannedEvaluationId) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const selectedPlannedEvaluation = currentRawSnapshot
    ? getPlannedEvaluationsCollection(currentRawSnapshot).find(function (item) {
        return String(item && item.id || "").trim() === String(plannedEvaluationId || "").trim();
      }) || null
    : null;
  const studentIds = activeClass && schoolService && typeof schoolService.getStudentsForClass === "function"
    ? schoolService.getStudentsForClass(activeClass.id).map(function (student) {
        return String(student && student.id || "").trim();
      }).filter(Boolean)
    : [];

  if (!activeClass) {
    return false;
  }

  activePlannedEvaluationDraft = selectedPlannedEvaluation
    ? {
        id: String(selectedPlannedEvaluation.id || "").trim(),
        classId: String(selectedPlannedEvaluation.classId || activeClass.id || "").trim(),
        type: String(selectedPlannedEvaluation.type || "sonstige").trim().toLowerCase() === "schriftliche" ? "schriftliche" : "sonstige",
        evaluationSheetId: String(selectedPlannedEvaluation.evaluationSheetId || "").trim(),
        date: String(selectedPlannedEvaluation.date || "").slice(0, 10),
        createPlanningEvent: selectedPlannedEvaluation.createPlanningEvent !== false,
        planningEventId: String(selectedPlannedEvaluation.planningEventId || "").trim(),
        studentIds: normalizePlannedEvaluationStudentIds(selectedPlannedEvaluation.studentIds, activeClass)
      }
    : {
        id: "",
        classId: String(activeClass.id || "").trim(),
        type: "sonstige",
        evaluationSheetId: "",
        date: "",
        createPlanningEvent: true,
        planningEventId: "",
        studentIds: studentIds
      };

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.closePlannedEvaluationModal = function () {
  activePlannedEvaluationDraft = null;

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.selectPlannedEvaluationForExecution = function (plannedEvaluationId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedPlannedEvaluationId = String(plannedEvaluationId || "").trim();
  const plannedEvaluation = currentRawSnapshot
    ? getPlannedEvaluationsCollection(currentRawSnapshot).find(function (item) {
        return String(item && item.id || "").trim() === normalizedPlannedEvaluationId;
      }) || null
    : null;
  const firstStudentId = plannedEvaluation && Array.isArray(plannedEvaluation.studentIds)
    ? String(plannedEvaluation.studentIds[0] || "").trim()
    : "";

  if (!plannedEvaluation) {
    activePerformedPlannedEvaluationId = "";
    activePerformedEvaluationStudentId = "";
  } else if (activePerformedPlannedEvaluationId === normalizedPlannedEvaluationId) {
    activePerformedPlannedEvaluationId = "";
    activePerformedEvaluationStudentId = "";
  } else {
    activePerformedPlannedEvaluationId = normalizedPlannedEvaluationId;
    activePerformedEvaluationStudentId = firstStudentId;
  }
  activePerformedEvaluationDetailModal = null;
  activePerformedEvaluationStudentFilter = "alle";

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.selectPerformedEvaluationStudent = function (studentId) {
  activePerformedEvaluationStudentId = String(studentId || "").trim();
  activePerformedEvaluationDetailModal = null;

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.setPerformedEvaluationStudentFilter = function (filterName) {
  const normalizedFilter = String(filterName || "").trim().toLowerCase();

  if (["alle", "offen", "abgeschlossen"].indexOf(normalizedFilter) === -1) {
    return false;
  }

  activePerformedEvaluationStudentFilter = normalizedFilter;
  activePerformedEvaluationDetailModal = null;

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.updateSelectedPlannedEvaluationField = function (fieldName, nextValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const selectedPlannedEvaluation = getSelectedPlannedEvaluationFromSnapshot(currentRawSnapshot);
  const normalizedFieldName = String(fieldName || "").trim();

  if (!repository || !schoolService || !currentRawSnapshot || !activeClass || !selectedPlannedEvaluation || ["type", "evaluationSheetId", "date", "createPlanningEvent"].indexOf(normalizedFieldName) === -1) {
    return false;
  }

  if (normalizedFieldName === "type") {
    selectedPlannedEvaluation.type = String(nextValue || "").trim().toLowerCase() === "schriftliche"
      ? "schriftliche"
      : "sonstige";
  } else if (normalizedFieldName === "evaluationSheetId") {
    selectedPlannedEvaluation.evaluationSheetId = String(nextValue || "").trim();
  } else if (normalizedFieldName === "date") {
    selectedPlannedEvaluation.date = String(nextValue || "").slice(0, 10);
  } else if (normalizedFieldName === "createPlanningEvent") {
    selectedPlannedEvaluation.createPlanningEvent = Boolean(nextValue);
  }

  syncPlanningEventForPlannedEvaluation(currentRawSnapshot, selectedPlannedEvaluation);

  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.toggleSelectedPlannedEvaluationStudent = function (studentId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const selectedPlannedEvaluation = getSelectedPlannedEvaluationFromSnapshot(currentRawSnapshot);
  const normalizedStudentId = String(studentId || "").trim();
  let nextStudentIds = [];

  if (!repository || !schoolService || !currentRawSnapshot || !activeClass || !selectedPlannedEvaluation || !normalizedStudentId) {
    return false;
  }

  if ((selectedPlannedEvaluation.studentIds || []).indexOf(normalizedStudentId) >= 0) {
    nextStudentIds = selectedPlannedEvaluation.studentIds.filter(function (entry) {
      return entry !== normalizedStudentId;
    });
  } else {
    nextStudentIds = (selectedPlannedEvaluation.studentIds || []).concat(normalizedStudentId);
  }

  selectedPlannedEvaluation.studentIds = normalizePlannedEvaluationStudentIds(nextStudentIds, activeClass);

  if (selectedPlannedEvaluation.studentIds.indexOf(String(activePerformedEvaluationStudentId || "").trim()) === -1) {
    activePerformedEvaluationStudentId = selectedPlannedEvaluation.studentIds[0] || "";
  }

  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.setAllStudentsForSelectedPlannedEvaluation = function (shouldSelectAll) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const selectedPlannedEvaluation = getSelectedPlannedEvaluationFromSnapshot(currentRawSnapshot);
  const nextStudentIds = shouldSelectAll && activeClass && schoolService && typeof schoolService.getStudentsForClass === "function"
    ? schoolService.getStudentsForClass(activeClass.id).map(function (student) {
        return String(student && student.id || "").trim();
      }).filter(Boolean)
    : [];

  if (!repository || !schoolService || !currentRawSnapshot || !activeClass || !selectedPlannedEvaluation) {
    return false;
  }

  selectedPlannedEvaluation.studentIds = normalizePlannedEvaluationStudentIds(nextStudentIds, activeClass);
  if (selectedPlannedEvaluation.studentIds.indexOf(String(activePerformedEvaluationStudentId || "").trim()) === -1) {
    activePerformedEvaluationStudentId = selectedPlannedEvaluation.studentIds[0] || "";
  }
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.addSelectedPlannedEvaluationGradingStage = function () {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const selectedPlannedEvaluation = getSelectedPlannedEvaluationFromSnapshot(currentRawSnapshot);

  if (!repository || !schoolService || !currentRawSnapshot || !selectedPlannedEvaluation) {
    return false;
  }

  selectedPlannedEvaluation.gradingSystem = normalizePlannedEvaluationGradingSystem((selectedPlannedEvaluation.gradingSystem || []).concat({
    id: createPlannedEvaluationGradingStageId(),
    label: "",
    minPercent: 0
  }));
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.updateSelectedPlannedEvaluationGradingStageField = function (stageId, fieldName, nextValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const selectedPlannedEvaluation = getSelectedPlannedEvaluationFromSnapshot(currentRawSnapshot);
  const normalizedStageId = String(stageId || "").trim();
  const normalizedFieldName = String(fieldName || "").trim();
  const stage = selectedPlannedEvaluation && Array.isArray(selectedPlannedEvaluation.gradingSystem)
    ? selectedPlannedEvaluation.gradingSystem.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedStageId;
      }) || null
    : null;

  if (!repository || !schoolService || !currentRawSnapshot || !selectedPlannedEvaluation || !stage || ["label", "minPercent"].indexOf(normalizedFieldName) === -1) {
    return false;
  }

  if (normalizedFieldName === "label") {
    stage.label = String(nextValue || "").trim();
  } else {
    stage.minPercent = Math.max(0, Math.min(100, Number.isFinite(Number(nextValue)) ? Number(nextValue) : 0));
  }

  selectedPlannedEvaluation.gradingSystem = normalizePlannedEvaluationGradingSystem(selectedPlannedEvaluation.gradingSystem);
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.deleteSelectedPlannedEvaluationGradingStage = function (stageId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const selectedPlannedEvaluation = getSelectedPlannedEvaluationFromSnapshot(currentRawSnapshot);
  const normalizedStageId = String(stageId || "").trim();

  if (!repository || !schoolService || !currentRawSnapshot || !selectedPlannedEvaluation || !normalizedStageId) {
    return false;
  }

  if (!window.confirm("Soll diese Bewertungsstufe wirklich geloescht werden?")) {
    return false;
  }

  selectedPlannedEvaluation.gradingSystem = normalizePlannedEvaluationGradingSystem((selectedPlannedEvaluation.gradingSystem || []).filter(function (entry) {
    return String(entry && entry.id || "").trim() !== normalizedStageId;
  }));
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.loadSelectedPlannedEvaluationGradingPreset = function (presetName) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const selectedPlannedEvaluation = getSelectedPlannedEvaluationFromSnapshot(currentRawSnapshot);
  const normalizedPresetName = String(presetName || "").trim().toLowerCase();
  let presetItems = [];

  if (!repository || !schoolService || !currentRawSnapshot || !selectedPlannedEvaluation) {
    return false;
  }

  if (normalizedPresetName === "noten") {
    presetItems = [
      { label: "sehr gut", minPercent: 87.5 },
      { label: "gut", minPercent: 75 },
      { label: "befriedigend", minPercent: 62.5 },
      { label: "ausreichend", minPercent: 50 },
      { label: "mangelhaft", minPercent: 20 },
      { label: "ungenuegend", minPercent: 0 }
    ];
  } else if (normalizedPresetName === "punkte") {
    presetItems = [
      { label: "15", minPercent: 95 },
      { label: "14", minPercent: 90 },
      { label: "13", minPercent: 85 },
      { label: "12", minPercent: 80 },
      { label: "11", minPercent: 75 },
      { label: "10", minPercent: 70 },
      { label: "9", minPercent: 65 },
      { label: "8", minPercent: 60 },
      { label: "7", minPercent: 55 },
      { label: "6", minPercent: 50 },
      { label: "5", minPercent: 45 },
      { label: "4", minPercent: 40 },
      { label: "03", minPercent: 33 },
      { label: "02", minPercent: 27 },
      { label: "01", minPercent: 20 },
      { label: "0", minPercent: 0 }
    ];
  } else if (normalizedPresetName === "plusplus_bis_minusminus") {
    presetItems = [
      { label: "++", minPercent: 85 },
      { label: "+", minPercent: 65 },
      { label: "o", minPercent: 50 },
      { label: "-", minPercent: 20 },
      { label: "--", minPercent: 0 }
    ];
  } else if (normalizedPresetName === "plus_bis_minus") {
    presetItems = [
      { label: "+", minPercent: 70 },
      { label: "o", minPercent: 50 },
      { label: "-", minPercent: 0 }
    ];
  } else {
    return false;
  }

  selectedPlannedEvaluation.gradingSystem = normalizePlannedEvaluationGradingSystem(presetItems.map(function (entry) {
    return {
      id: createPlannedEvaluationGradingStageId(),
      label: entry.label,
      minPercent: entry.minPercent
    };
  }));
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.updatePlannedEvaluationDraftField = function (fieldName, nextValue) {
  const normalizedFieldName = String(fieldName || "").trim();

  if (!activePlannedEvaluationDraft || ["type", "evaluationSheetId", "date", "createPlanningEvent"].indexOf(normalizedFieldName) === -1) {
    return false;
  }

  if (normalizedFieldName === "type") {
    activePlannedEvaluationDraft.type = String(nextValue || "").trim().toLowerCase() === "schriftliche"
      ? "schriftliche"
      : "sonstige";
  } else if (normalizedFieldName === "evaluationSheetId") {
    activePlannedEvaluationDraft.evaluationSheetId = String(nextValue || "").trim();
  } else if (normalizedFieldName === "date") {
    activePlannedEvaluationDraft.date = String(nextValue || "").slice(0, 10);
  } else if (normalizedFieldName === "createPlanningEvent") {
    activePlannedEvaluationDraft.createPlanningEvent = Boolean(nextValue);
  }

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.togglePlannedEvaluationDraftStudent = function (studentId) {
  const normalizedStudentId = String(studentId || "").trim();
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const selectedIds = activePlannedEvaluationDraft && Array.isArray(activePlannedEvaluationDraft.studentIds)
    ? activePlannedEvaluationDraft.studentIds.slice()
    : [];
  let nextStudentIds = [];

  if (!activePlannedEvaluationDraft || !normalizedStudentId || !activeClass) {
    return false;
  }

  if (selectedIds.indexOf(normalizedStudentId) >= 0) {
    nextStudentIds = selectedIds.filter(function (entry) {
      return entry !== normalizedStudentId;
    });
  } else {
    nextStudentIds = selectedIds.concat(normalizedStudentId);
  }

  activePlannedEvaluationDraft.studentIds = normalizePlannedEvaluationStudentIds(nextStudentIds, activeClass);

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.setAllStudentsForPlannedEvaluationDraft = function (shouldSelectAll) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const nextStudentIds = shouldSelectAll && activeClass && schoolService && typeof schoolService.getStudentsForClass === "function"
    ? schoolService.getStudentsForClass(activeClass.id).map(function (student) {
        return String(student && student.id || "").trim();
      }).filter(Boolean)
    : [];

  if (!activePlannedEvaluationDraft || !activeClass) {
    return false;
  }

  activePlannedEvaluationDraft.studentIds = normalizePlannedEvaluationStudentIds(nextStudentIds, activeClass);

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.submitPlannedEvaluationModal = function (event) {
  const evaluationSheetInput = document.getElementById("plannedEvaluationSheetInput");
  const dateInput = document.getElementById("plannedEvaluationDateInput");
  const createPlanningEventInput = document.getElementById("plannedEvaluationCreatePlanningEvent");
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const draft = activePlannedEvaluationDraft;
  const normalizedType = String(draft && draft.type || "").trim().toLowerCase() === "schriftliche"
    ? "schriftliche"
    : "sonstige";
  const normalizedEvaluationSheetId = String(evaluationSheetInput && evaluationSheetInput.value || draft && draft.evaluationSheetId || "").trim();
  const normalizedDate = String(dateInput && dateInput.value || draft && draft.date || "").slice(0, 10);
  const shouldCreatePlanningEvent = Boolean(createPlanningEventInput ? createPlanningEventInput.checked : draft && draft.createPlanningEvent);
  const normalizedStudentIds = normalizePlannedEvaluationStudentIds(draft && draft.studentIds, activeClass);
  let nextPlannedEvaluation = null;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!repository || !schoolService || !activeClass || !currentRawSnapshot || !draft || !normalizedEvaluationSheetId || !normalizedDate) {
    return false;
  }

  if (String(draft.id || "").trim()) {
    nextPlannedEvaluation = getPlannedEvaluationsCollection(currentRawSnapshot).find(function (item) {
      return String(item && item.id || "").trim() === String(draft.id || "").trim();
    }) || null;

    if (!nextPlannedEvaluation) {
      return false;
    }

    nextPlannedEvaluation.type = normalizedType;
    nextPlannedEvaluation.evaluationSheetId = normalizedEvaluationSheetId;
    nextPlannedEvaluation.date = normalizedDate;
    nextPlannedEvaluation.studentIds = normalizedStudentIds;
    nextPlannedEvaluation.createPlanningEvent = shouldCreatePlanningEvent;
  } else {
    nextPlannedEvaluation = createPlannedEvaluationRecord(activeClass.id, normalizedType, normalizedEvaluationSheetId, normalizedDate, normalizedStudentIds);
    nextPlannedEvaluation.createPlanningEvent = shouldCreatePlanningEvent;
    getMutablePlannedEvaluationsCollection(currentRawSnapshot).push(nextPlannedEvaluation);
  }

  syncPlanningEventForPlannedEvaluation(currentRawSnapshot, nextPlannedEvaluation);

  activePerformedPlannedEvaluationId = String(nextPlannedEvaluation && nextPlannedEvaluation.id || "").trim();
  activePerformedEvaluationStudentId = normalizedStudentIds[0] || "";
  activePlannedEvaluationDraft = null;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.deleteActivePlannedEvaluation = function () {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedDraftId = String(activePlannedEvaluationDraft && activePlannedEvaluationDraft.id || "").trim();

  if (!repository || !schoolService || !currentRawSnapshot || !normalizedDraftId) {
    return false;
  }

  if (!window.confirm("Soll diese geplante Bewertung wirklich dauerhaft geloescht werden?")) {
    return false;
  }

  currentRawSnapshot.plannedEvaluations = getPlannedEvaluationsCollection(currentRawSnapshot).filter(function (item) {
    return String(item && item.id || "").trim() !== normalizedDraftId;
  });
  currentRawSnapshot.planningEvents = getPlanningCollections(currentRawSnapshot).events.filter(function (entry) {
    return String(entry && entry.id || "").trim() !== String(activePlannedEvaluationDraft && activePlannedEvaluationDraft.planningEventId || "").trim();
  });
  currentRawSnapshot.performedEvaluations = getPerformedEvaluationsCollection(currentRawSnapshot).filter(function (item) {
    return String(item && item.plannedEvaluationId || "").trim() !== normalizedDraftId;
  });
  if (String(selectedPlanningEventId || "").trim() === String(activePlannedEvaluationDraft && activePlannedEvaluationDraft.planningEventId || "").trim()) {
    selectedPlanningEventId = "";
    selectedPlanningEventOccurrenceId = "";
    selectedPlanningEventOccurrenceRange = null;
  }
  if (activePlanningEventDraft && String(activePlanningEventDraft.id || "").trim() === String(activePlannedEvaluationDraft && activePlannedEvaluationDraft.planningEventId || "").trim()) {
    activePlanningEventDraft = null;
  }
  if (activePerformedPlannedEvaluationId === normalizedDraftId) {
    activePerformedPlannedEvaluationId = "";
    activePerformedEvaluationStudentId = "";
  }
  activePlannedEvaluationDraft = null;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.updatePerformedEvaluationSubtaskField = function (subtaskId, fieldName, nextValue, maxValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedPlannedEvaluationId = String(activePerformedPlannedEvaluationId || "").trim();
  const normalizedStudentId = String(activePerformedEvaluationStudentId || "").trim();
  const normalizedSubtaskId = String(subtaskId || "").trim();
  const normalizedFieldName = String(fieldName || "").trim();
  const allowedFields = ["points", "generalNote"];
  const plannedEvaluation = currentRawSnapshot
    ? getPlannedEvaluationsCollection(currentRawSnapshot).find(function (item) {
        return String(item && item.id || "").trim() === normalizedPlannedEvaluationId;
      }) || null
    : null;
  let performedEvaluation = null;
  let subtaskResult = null;

  if (!repository || !schoolService || !currentRawSnapshot || !plannedEvaluation || !normalizedStudentId || !normalizedSubtaskId || allowedFields.indexOf(normalizedFieldName) === -1) {
    return false;
  }

  performedEvaluation = getPerformedEvaluationForStudent(currentRawSnapshot, normalizedPlannedEvaluationId, normalizedStudentId);

  if (!performedEvaluation) {
    performedEvaluation = createPerformedEvaluationRecord(plannedEvaluation, normalizedStudentId);
    getMutablePerformedEvaluationsCollection(currentRawSnapshot).push(performedEvaluation);
  }

  subtaskResult = Array.isArray(performedEvaluation.subtaskResults)
    ? performedEvaluation.subtaskResults.find(function (entry) {
        return String(entry && entry.subtaskId || "").trim() === normalizedSubtaskId;
      }) || null
    : null;

  if (!subtaskResult) {
    subtaskResult = {
      subtaskId: normalizedSubtaskId,
      points: 0,
      negativeNotes: [],
      positiveNotes: [],
      generalNote: ""
    };
    if (!Array.isArray(performedEvaluation.subtaskResults)) {
      performedEvaluation.subtaskResults = [];
    }
    performedEvaluation.subtaskResults.push(subtaskResult);
  }

  if (normalizedFieldName === "points") {
    subtaskResult.points = normalizePerformedEvaluationPoints(nextValue, maxValue);
  } else {
    subtaskResult[normalizedFieldName] = normalizePerformedEvaluationText(nextValue);
  }

  performedEvaluation.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.openPerformedEvaluationDetailModal = function (subtaskId, detailType, mode) {
  const normalizedSubtaskId = String(subtaskId || "").trim();
  const normalizedDetailType = String(detailType || "").trim().toLowerCase();
  const normalizedMode = String(mode || "").trim().toLowerCase();

  if (!normalizedSubtaskId || ["negative", "positive", "note"].indexOf(normalizedDetailType) === -1) {
    return false;
  }

  activePerformedEvaluationDetailModal = {
    subtaskId: normalizedSubtaskId,
    detailType: normalizedDetailType,
    mode: normalizedMode === "add" ? "add" : "list",
    draftValue: ""
  };

  if (normalizedDetailType === "note") {
    activePerformedEvaluationDetailModal.mode = "note";
  }

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  if (activePerformedEvaluationDetailModal && activePerformedEvaluationDetailModal.mode === "add") {
    window.setTimeout(function () {
      const input = document.getElementById("performedEvaluationFeedbackInput");

      if (input && typeof input.focus === "function") {
        input.focus();
        if (typeof input.select === "function") {
          input.select();
        }
      }
    }, 0);
  }

  return false;
};
window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal = function () {
  activePerformedEvaluationDetailModal = null;

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.updatePerformedEvaluationDetailDraft = function (nextValue) {
  if (!activePerformedEvaluationDetailModal) {
    return false;
  }

  activePerformedEvaluationDetailModal.draftValue = String(nextValue || "");

  return false;
};
window.UnterrichtsassistentApp.handlePerformedEvaluationDetailInputFocus = function (inputId, listId) {
  return renderPerformedEvaluationFeedbackSuggestions(inputId, listId);
};
window.UnterrichtsassistentApp.handlePerformedEvaluationDetailInput = function (event, listId) {
  const input = event && event.target ? event.target : null;
  const submitButton = document.getElementById("performedEvaluationFeedbackSubmit");

  if (!input) {
    return false;
  }

  window.UnterrichtsassistentApp.updatePerformedEvaluationDetailDraft(input.value);
  if (submitButton) {
    submitButton.disabled = !String(input.value || "").trim();
  }
  return renderPerformedEvaluationFeedbackSuggestions(input.id, listId);
};
window.UnterrichtsassistentApp.handlePerformedEvaluationDetailInputKeyDown = function (event) {
  if (!event || event.key !== "Enter") {
    return true;
  }

  event.preventDefault();
  return window.UnterrichtsassistentApp.submitPerformedEvaluationFeedback();
};
window.UnterrichtsassistentApp.selectPerformedEvaluationFeedbackSuggestion = function (value, inputId, listId) {
  const input = inputId ? document.getElementById(inputId) : null;
  const list = listId ? document.getElementById(listId) : null;

  if (!input) {
    return false;
  }

  input.value = String(value || "");
  window.UnterrichtsassistentApp.updatePerformedEvaluationDetailDraft(input.value);

  if (list) {
    list.hidden = true;
  }

  return window.UnterrichtsassistentApp.submitPerformedEvaluationFeedback();
};
window.UnterrichtsassistentApp.submitPerformedEvaluationFeedback = function () {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedPlannedEvaluationId = String(activePerformedPlannedEvaluationId || "").trim();
  const normalizedStudentId = String(activePerformedEvaluationStudentId || "").trim();
  const modal = activePerformedEvaluationDetailModal;
  const normalizedSubtaskId = String(modal && modal.subtaskId || "").trim();
  const detailType = String(modal && modal.detailType || "").trim().toLowerCase();
  const feedbackValue = normalizePerformedEvaluationText(modal && modal.draftValue || "");
  const fieldName = detailType === "positive" ? "positiveNotes" : "negativeNotes";
  const plannedEvaluation = currentRawSnapshot
    ? getPlannedEvaluationsCollection(currentRawSnapshot).find(function (item) {
        return String(item && item.id || "").trim() === normalizedPlannedEvaluationId;
      }) || null
    : null;
  let performedEvaluation = null;
  let subtaskResult = null;

  if (!repository || !schoolService || !currentRawSnapshot || !plannedEvaluation || !normalizedStudentId || !normalizedSubtaskId || !feedbackValue || ["negative", "positive"].indexOf(detailType) === -1) {
    return false;
  }

  performedEvaluation = getPerformedEvaluationForStudent(currentRawSnapshot, normalizedPlannedEvaluationId, normalizedStudentId);

  if (!performedEvaluation) {
    performedEvaluation = createPerformedEvaluationRecord(plannedEvaluation, normalizedStudentId);
    getMutablePerformedEvaluationsCollection(currentRawSnapshot).push(performedEvaluation);
  }

  subtaskResult = Array.isArray(performedEvaluation.subtaskResults)
    ? performedEvaluation.subtaskResults.find(function (entry) {
        return String(entry && entry.subtaskId || "").trim() === normalizedSubtaskId;
      }) || null
    : null;

  if (!subtaskResult) {
    subtaskResult = {
      subtaskId: normalizedSubtaskId,
      points: 0,
      negativeNotes: [],
      positiveNotes: [],
      generalNote: ""
    };
    if (!Array.isArray(performedEvaluation.subtaskResults)) {
      performedEvaluation.subtaskResults = [];
    }
    performedEvaluation.subtaskResults.push(subtaskResult);
  }

  subtaskResult[fieldName] = normalizePerformedEvaluationFeedbackList((subtaskResult[fieldName] || []).concat(feedbackValue));
  performedEvaluation.updatedAt = getCurrentTimestamp();
  activePerformedEvaluationDetailModal = null;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.deletePerformedEvaluationFeedback = function (subtaskId, detailType, feedbackIndex) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedPlannedEvaluationId = String(activePerformedPlannedEvaluationId || "").trim();
  const normalizedStudentId = String(activePerformedEvaluationStudentId || "").trim();
  const normalizedSubtaskId = String(subtaskId || "").trim();
  const normalizedDetailType = String(detailType || "").trim().toLowerCase();
  const normalizedIndex = Math.max(-1, Number.isFinite(Number(feedbackIndex)) ? Math.floor(Number(feedbackIndex)) : -1);
  const fieldName = normalizedDetailType === "positive" ? "positiveNotes" : "negativeNotes";
  const plannedEvaluation = currentRawSnapshot
    ? getPlannedEvaluationsCollection(currentRawSnapshot).find(function (item) {
        return String(item && item.id || "").trim() === normalizedPlannedEvaluationId;
      }) || null
    : null;
  const performedEvaluation = currentRawSnapshot
    ? getPerformedEvaluationForStudent(currentRawSnapshot, normalizedPlannedEvaluationId, normalizedStudentId)
    : null;
  const subtaskResult = performedEvaluation && Array.isArray(performedEvaluation.subtaskResults)
    ? performedEvaluation.subtaskResults.find(function (entry) {
        return String(entry && entry.subtaskId || "").trim() === normalizedSubtaskId;
      }) || null
    : null;
  const currentItems = subtaskResult && Array.isArray(subtaskResult[fieldName]) ? subtaskResult[fieldName] : [];

  if (!repository || !schoolService || !currentRawSnapshot || !plannedEvaluation || !subtaskResult || ["negative", "positive"].indexOf(normalizedDetailType) === -1 || normalizedIndex < 0 || normalizedIndex >= currentItems.length) {
    return false;
  }

  if (!window.confirm("Soll diese Rueckmeldung wirklich geloescht werden?")) {
    return false;
  }

  subtaskResult[fieldName] = currentItems.filter(function (_entry, index) {
    return index !== normalizedIndex;
  });
  performedEvaluation.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.submitPerformedEvaluationNote = function () {
  const modal = activePerformedEvaluationDetailModal;
  const normalizedSubtaskId = String(modal && modal.subtaskId || "").trim();

  if (!modal || String(modal.detailType || "").trim().toLowerCase() !== "note" || !normalizedSubtaskId) {
    return false;
  }

  window.UnterrichtsassistentApp.updatePerformedEvaluationSubtaskField(normalizedSubtaskId, "generalNote", modal.draftValue || "");
  activePerformedEvaluationDetailModal = null;

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.handlePerformedEvaluationPointsKeyDown = function (event, subtaskId, maxValue) {
  const target = event && event.target ? event.target : null;
  const pointInputs = Array.prototype.slice.call(document.querySelectorAll(".bewertung-durchfuehrung__points-input"));
  const currentIndex = pointInputs.indexOf(target);
  let nextInput = null;
  let nextSubtaskId = "";
  let clampedValue = "";

  if (!event || event.key !== "Tab" || event.shiftKey || !target || currentIndex < 0) {
    return true;
  }

  nextInput = pointInputs[currentIndex + 1] || null;

  if (!nextInput) {
    return true;
  }

  event.preventDefault();
  nextSubtaskId = String(nextInput.getAttribute("data-subtask-id") || "").trim();
  clampedValue = String(normalizePerformedEvaluationPoints(target.value, maxValue)).replace(".", ",");
  target.value = clampedValue;
  window.UnterrichtsassistentApp.updatePerformedEvaluationSubtaskField(subtaskId, "points", clampedValue, maxValue);
  window.setTimeout(function () {
    const refreshedNextInput = nextSubtaskId
      ? document.querySelector('.bewertung-durchfuehrung__points-input[data-subtask-id="' + nextSubtaskId.replace(/"/g, '\\"') + '"]')
      : null;

    if (refreshedNextInput && typeof refreshedNextInput.focus === "function") {
      refreshedNextInput.focus();
      if (typeof refreshedNextInput.select === "function") {
        refreshedNextInput.select();
      }
    }
  }, 0);
  return false;
};
window.UnterrichtsassistentApp.updatePerformedEvaluationOverallNote = function (nextValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedPlannedEvaluationId = String(activePerformedPlannedEvaluationId || "").trim();
  const normalizedStudentId = String(activePerformedEvaluationStudentId || "").trim();
  const plannedEvaluation = currentRawSnapshot
    ? getPlannedEvaluationsCollection(currentRawSnapshot).find(function (item) {
        return String(item && item.id || "").trim() === normalizedPlannedEvaluationId;
      }) || null
    : null;
  let performedEvaluation = null;

  if (!repository || !schoolService || !currentRawSnapshot || !plannedEvaluation || !normalizedStudentId) {
    return false;
  }

  performedEvaluation = getPerformedEvaluationForStudent(currentRawSnapshot, normalizedPlannedEvaluationId, normalizedStudentId);

  if (!performedEvaluation) {
    performedEvaluation = createPerformedEvaluationRecord(plannedEvaluation, normalizedStudentId);
    getMutablePerformedEvaluationsCollection(currentRawSnapshot).push(performedEvaluation);
  }

  performedEvaluation.overallNote = normalizePerformedEvaluationText(nextValue);
  performedEvaluation.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.togglePerformedEvaluationCompletionForSelectedStudent = function () {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedPlannedEvaluationId = String(activePerformedPlannedEvaluationId || "").trim();
  const normalizedStudentId = String(activePerformedEvaluationStudentId || "").trim();
  const plannedEvaluation = currentRawSnapshot
    ? getPlannedEvaluationsCollection(currentRawSnapshot).find(function (item) {
        return String(item && item.id || "").trim() === normalizedPlannedEvaluationId;
      }) || null
    : null;
  let performedEvaluation = null;

  if (!repository || !schoolService || !currentRawSnapshot || !plannedEvaluation || !normalizedStudentId) {
    return false;
  }

  performedEvaluation = getPerformedEvaluationForStudent(currentRawSnapshot, normalizedPlannedEvaluationId, normalizedStudentId);

  if (!performedEvaluation) {
    performedEvaluation = createPerformedEvaluationRecord(plannedEvaluation, normalizedStudentId);
    getMutablePerformedEvaluationsCollection(currentRawSnapshot).push(performedEvaluation);
  }

  performedEvaluation.isCompleted = !performedEvaluation.isCompleted;
  performedEvaluation.completedAt = performedEvaluation.isCompleted
    ? getCurrentTimestamp()
    : "";
  performedEvaluation.updatedAt = getCurrentTimestamp();
  activePerformedEvaluationDetailModal = null;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.selectEvaluationSheetCopySource = function (sheetId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const sourceSheet = currentRawSnapshot
    ? getEvaluationSheetsCollection(currentRawSnapshot).find(function (item) {
        return String(item && item.id || "").trim() === String(sheetId || "").trim();
      }) || null
    : null;

  if (!activeEvaluationSheetDraft) {
    return false;
  }

  activeEvaluationSheetDraft.copyFromId = String(sheetId || "").trim();

  if (sourceSheet) {
    activeEvaluationSheetDraft.type = String(sourceSheet.type || "aufgabenbogen").trim() === "kompetenzraster"
      ? "kompetenzraster"
      : "aufgabenbogen";
    activeEvaluationSheetDraft.title = String(sourceSheet.title || "").trim();
    activeEvaluationSheetDraft.workingTimeMinutes = normalizeEvaluationWorkingTimeMinutes(sourceSheet.workingTimeMinutes);
  }

  if (activeViewId === "bewertung") {
    setActiveView("bewertung");
  }

  return false;
};
window.UnterrichtsassistentApp.submitEvaluationSheetModal = function (event) {
  const typeInput = document.getElementById("evaluationSheetTypeInput");
  const titleInput = document.getElementById("evaluationSheetTitleInput");
  const copyFromInput = document.getElementById("evaluationSheetCopyFromInput");
  const workingTimeDaysInput = document.getElementById("evaluationSheetWorkingTimeDaysInput");
  const workingTimeHoursInput = document.getElementById("evaluationSheetWorkingTimeHoursInput");
  const workingTimeMinutesInput = document.getElementById("evaluationSheetWorkingTimeMinutesInput");
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const normalizedType = String(typeInput && typeInput.value || activeEvaluationSheetDraft && activeEvaluationSheetDraft.type || "aufgabenbogen").trim().toLowerCase() === "kompetenzraster"
    ? "kompetenzraster"
    : "aufgabenbogen";
  const titleValue = String(titleInput && titleInput.value || activeEvaluationSheetDraft && activeEvaluationSheetDraft.title || "").trim();
  const copyFromId = String(copyFromInput && copyFromInput.value || activeEvaluationSheetDraft && activeEvaluationSheetDraft.copyFromId || "").trim();
  const workingTimeValue = parseEvaluationWorkingTimeInputs(
    workingTimeDaysInput && workingTimeDaysInput.value,
    workingTimeHoursInput && workingTimeHoursInput.value,
    workingTimeMinutesInput && workingTimeMinutesInput.value
  );
  const copySource = copyFromId
    ? getEvaluationSheetsCollection(currentRawSnapshot).find(function (item) {
        return String(item && item.id || "").trim() === copyFromId;
      }) || null
    : null;
  const clonedAttributes = cloneEvaluationSheetAttributes(copySource);
  let nextSheet = null;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!repository || !schoolService || !activeClass || !currentRawSnapshot || !activeEvaluationSheetDraft || !titleValue) {
    return false;
  }

  if (String(activeEvaluationSheetDraft.id || "").trim()) {
    nextSheet = getEvaluationSheetsCollection(currentRawSnapshot).find(function (item) {
      return String(item && item.id || "").trim() === String(activeEvaluationSheetDraft.id || "").trim();
    }) || null;

    if (!nextSheet) {
      return false;
    }

    nextSheet.type = normalizedType;
    nextSheet.title = titleValue;
    nextSheet.workingTimeMinutes = workingTimeValue;
    nextSheet.taskSheet = normalizedType === "aufgabenbogen"
      ? normalizeEvaluationTaskSheet(nextSheet.taskSheet)
      : { tasks: [] };
    nextSheet.competencyGrid = normalizedType === "kompetenzraster" && nextSheet.competencyGrid && typeof nextSheet.competencyGrid === "object"
      ? nextSheet.competencyGrid
      : {};
    currentRawSnapshot.activeEvaluationSheetId = nextSheet.id;
  } else {
    nextSheet = createEvaluationSheetRecord(activeClass.id, normalizedType, titleValue);
    nextSheet.workingTimeMinutes = workingTimeValue;
    if (copySource) {
      nextSheet.workingTimeMinutes = workingTimeValue;
      nextSheet.taskSheet = normalizeEvaluationTaskSheet(clonedAttributes.taskSheet);
      nextSheet.competencyGrid = clonedAttributes.competencyGrid;
    }
    getMutableEvaluationSheetsCollection(currentRawSnapshot).unshift(nextSheet);
    currentRawSnapshot.activeEvaluationSheetId = nextSheet.id;
  }

  activeEvaluationSheetDraft = null;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung", { forcePersist: true });
  return false;
};
window.UnterrichtsassistentApp.deleteActiveEvaluationSheet = function () {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const currentSheet = currentRawSnapshot && activeClass
    ? getActiveEvaluationSheetForSnapshot(currentRawSnapshot, activeClass)
    : null;
  let remainingSheets = [];

  if (!repository || !schoolService || !activeClass || !currentRawSnapshot || !currentSheet) {
    return false;
  }

  if (!window.confirm("Soll dieser Bewertungsbogen wirklich dauerhaft geloescht werden?")) {
    return false;
  }

  currentRawSnapshot.evaluationSheets = getEvaluationSheetsCollection(currentRawSnapshot).filter(function (item) {
    return String(item && item.id || "").trim() !== String(currentSheet.id || "").trim();
  });
  remainingSheets = getEvaluationSheetsForClass(currentRawSnapshot, activeClass.id);
  currentRawSnapshot.activeEvaluationSheetId = remainingSheets[0]
    ? String(remainingSheets[0].id || "").trim()
    : null;
  activeEvaluationSheetDraft = null;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung", { forcePersist: true });
  return false;
};
window.UnterrichtsassistentApp.updateActiveEvaluationSheetField = function (fieldName, nextValue) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeSheet = currentRawSnapshot && activeClass
    ? getActiveEvaluationSheetForSnapshot(currentRawSnapshot, activeClass)
    : null;
  const normalizedFieldName = String(fieldName || "").trim();

  if (!repository || !schoolService || !currentRawSnapshot || !activeSheet || ["title", "type", "workingTimeMinutes"].indexOf(normalizedFieldName) === -1) {
    return false;
  }

  if (normalizedFieldName === "title") {
    if (!String(nextValue || "").trim()) {
      return false;
    }

    activeSheet.title = String(nextValue || "").trim();
  }

  if (normalizedFieldName === "type") {
    activeSheet.type = String(nextValue || "").trim().toLowerCase() === "kompetenzraster"
      ? "kompetenzraster"
      : "aufgabenbogen";
    activeSheet.taskSheet = activeSheet.type === "aufgabenbogen"
      ? getMutableEvaluationTaskSheet(activeSheet)
      : { tasks: [] };
    activeSheet.competencyGrid = activeSheet.type === "kompetenzraster" && activeSheet.competencyGrid && typeof activeSheet.competencyGrid === "object"
      ? activeSheet.competencyGrid
      : {};
  }

  if (normalizedFieldName === "workingTimeMinutes") {
    activeSheet.workingTimeMinutes = normalizeEvaluationWorkingTimeMinutes(nextValue);
  }

  currentRawSnapshot.activeEvaluationSheetId = activeSheet.id;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.addEvaluationTask = function () {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeSheet = currentRawSnapshot && activeClass
    ? getActiveEvaluationSheetForSnapshot(currentRawSnapshot, activeClass)
    : null;
  const taskSheet = activeSheet ? getMutableEvaluationTaskSheet(activeSheet) : null;

  if (!repository || !schoolService || !currentRawSnapshot || !activeSheet || activeSheet.type !== "aufgabenbogen" || !taskSheet) {
    return false;
  }

  closeEvaluationTopicSuggestions();
  taskSheet.tasks.push(createEvaluationTaskRecord());
  currentRawSnapshot.activeEvaluationSheetId = activeSheet.id;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.deleteEvaluationTask = function (taskId) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeSheet = currentRawSnapshot && activeClass
    ? getActiveEvaluationSheetForSnapshot(currentRawSnapshot, activeClass)
    : null;
  const taskSheet = activeSheet ? getMutableEvaluationTaskSheet(activeSheet) : null;
  const normalizedTaskId = String(taskId || "").trim();

  if (!repository || !schoolService || !currentRawSnapshot || !activeSheet || !taskSheet || !normalizedTaskId) {
    return false;
  }

  if (!window.confirm("Soll diese Aufgabe wirklich geloescht werden?")) {
    return false;
  }

  closeEvaluationTopicSuggestions();
  taskSheet.tasks = taskSheet.tasks.filter(function (task) {
    return String(task && task.id || "").trim() !== normalizedTaskId;
  });
  currentRawSnapshot.activeEvaluationSheetId = activeSheet.id;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.updateEvaluationTaskField = function (taskId, fieldName, nextValue) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeSheet = currentRawSnapshot && activeClass
    ? getActiveEvaluationSheetForSnapshot(currentRawSnapshot, activeClass)
    : null;
  const taskSheet = activeSheet ? getMutableEvaluationTaskSheet(activeSheet) : null;
  const task = taskSheet ? getEvaluationTaskById(taskSheet, taskId) : null;
  const normalizedFieldName = String(fieldName || "").trim();

  if (!repository || !schoolService || !currentRawSnapshot || !activeSheet || !task || normalizedFieldName !== "title") {
    return false;
  }

  task.title = String(nextValue || "").trim();
  currentRawSnapshot.activeEvaluationSheetId = activeSheet.id;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.addEvaluationSubtask = function (taskId) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeSheet = currentRawSnapshot && activeClass
    ? getActiveEvaluationSheetForSnapshot(currentRawSnapshot, activeClass)
    : null;
  const taskSheet = activeSheet ? getMutableEvaluationTaskSheet(activeSheet) : null;
  const task = taskSheet ? getEvaluationTaskById(taskSheet, taskId) : null;

  if (!repository || !schoolService || !currentRawSnapshot || !activeSheet || !task) {
    return false;
  }

  closeEvaluationTopicSuggestions();
  if (!Array.isArray(task.subtasks)) {
    task.subtasks = [];
  }
  task.subtasks.push(createEvaluationSubtaskRecord());
  currentRawSnapshot.activeEvaluationSheetId = activeSheet.id;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.deleteEvaluationSubtask = function (taskId, subtaskId) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeSheet = currentRawSnapshot && activeClass
    ? getActiveEvaluationSheetForSnapshot(currentRawSnapshot, activeClass)
    : null;
  const taskSheet = activeSheet ? getMutableEvaluationTaskSheet(activeSheet) : null;
  const task = taskSheet ? getEvaluationTaskById(taskSheet, taskId) : null;
  const normalizedSubtaskId = String(subtaskId || "").trim();

  if (!repository || !schoolService || !currentRawSnapshot || !activeSheet || !task || !normalizedSubtaskId) {
    return false;
  }

  if (!window.confirm("Soll diese Teilaufgabe wirklich geloescht werden?")) {
    return false;
  }

  closeEvaluationTopicSuggestions();
  task.subtasks = (Array.isArray(task.subtasks) ? task.subtasks : []).filter(function (subtask) {
    return String(subtask && subtask.id || "").trim() !== normalizedSubtaskId;
  });
  currentRawSnapshot.activeEvaluationSheetId = activeSheet.id;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.updateEvaluationSubtaskField = function (taskId, subtaskId, fieldName, nextValue) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeSheet = currentRawSnapshot && activeClass
    ? getActiveEvaluationSheetForSnapshot(currentRawSnapshot, activeClass)
    : null;
  const taskSheet = activeSheet ? getMutableEvaluationTaskSheet(activeSheet) : null;
  const task = taskSheet ? getEvaluationTaskById(taskSheet, taskId) : null;
  const subtask = task ? getEvaluationSubtaskById(task, subtaskId) : null;
  const normalizedFieldName = String(fieldName || "").trim();
  const normalizedAfb = String(nextValue || "").trim().toLowerCase();
  const beValue = Math.max(0, Number.isFinite(Number(nextValue)) ? Math.round(Number(nextValue)) : 0);

  if (!repository || !schoolService || !currentRawSnapshot || !activeSheet || !subtask) {
    return false;
  }

  if (normalizedFieldName === "title") {
    subtask.title = String(nextValue || "").trim();
  } else if (normalizedFieldName === "topics") {
    subtask.topics = String(nextValue || "").split(",").map(function (entry) {
      return String(entry || "").trim();
    }).filter(Boolean).join(", ");
  } else if (normalizedFieldName === "afb") {
    subtask.afb = ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(normalizedAfb) >= 0
      ? normalizedAfb
      : "afb1";
  } else if (normalizedFieldName === "be") {
    subtask.be = beValue;
  } else {
    return false;
  }

  currentRawSnapshot.activeEvaluationSheetId = activeSheet.id;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.toggleEvaluationSheetCurriculumAssignment = function (level, seriesId, sequenceId, lessonId) {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeSheet = currentRawSnapshot && activeClass
    ? getActiveEvaluationSheetForSnapshot(currentRawSnapshot, activeClass)
    : null;
  const normalizedLevel = String(level || "").trim().toLowerCase();
  const normalizedSeriesId = String(seriesId || "").trim();
  const normalizedSequenceId = String(sequenceId || "").trim();
  const normalizedLessonId = String(lessonId || "").trim();
  let assignmentState;
  let lessonIdsLookup;
  let emptySequenceIdsLookup;
  let emptySeriesIdsLookup;

  function isSequenceAssigned(sequenceItem) {
    const currentSequenceId = String(sequenceItem && sequenceItem.id || "").trim();
    const lessons = getOrderedCurriculumLessonsForSequence(currentRawSnapshot, currentSequenceId);

    if (!lessons.length) {
      return Boolean(emptySequenceIdsLookup[currentSequenceId]);
    }

    return lessons.some(function (lessonItem) {
      return Boolean(lessonIdsLookup[String(lessonItem && lessonItem.id || "").trim()]);
    });
  }

  function toggleSequence(sequenceItem, shouldAssign) {
    const currentSequenceId = String(sequenceItem && sequenceItem.id || "").trim();
    const lessons = getOrderedCurriculumLessonsForSequence(currentRawSnapshot, currentSequenceId);

    if (lessons.length) {
      lessons.forEach(function (lessonItem) {
        const currentLessonId = String(lessonItem && lessonItem.id || "").trim();

        if (shouldAssign) {
          lessonIdsLookup[currentLessonId] = true;
        } else {
          delete lessonIdsLookup[currentLessonId];
        }
      });
      return;
    }

    if (shouldAssign) {
      emptySequenceIdsLookup[currentSequenceId] = true;
    } else {
      delete emptySequenceIdsLookup[currentSequenceId];
    }
  }

  if (!repository || !schoolService || !activeClass || !currentRawSnapshot || !activeSheet || activeViewId !== "bewertung" || bewertungViewMode !== "erstellen") {
    return false;
  }

  assignmentState = normalizeEvaluationSheetCurriculumAssignments(currentRawSnapshot, activeSheet);
  lessonIdsLookup = Object.assign({}, assignmentState.lessonIdsLookup);
  emptySequenceIdsLookup = Object.assign({}, assignmentState.emptySequenceIdsLookup);
  emptySeriesIdsLookup = Object.assign({}, assignmentState.emptySeriesIdsLookup);

  if (normalizedLevel === "lesson" && normalizedLessonId) {
    if (lessonIdsLookup[normalizedLessonId]) {
      delete lessonIdsLookup[normalizedLessonId];
    } else {
      lessonIdsLookup[normalizedLessonId] = true;
    }
  } else if (normalizedLevel === "sequence" && normalizedSequenceId) {
    const sequenceItem = getCurriculumCollections(currentRawSnapshot).sequences.find(function (entry) {
      return String(entry && entry.id || "").trim() === normalizedSequenceId
        && String(entry && entry.seriesId || "").trim() === normalizedSeriesId;
    }) || null;
    const shouldAssign = sequenceItem ? !isSequenceAssigned(sequenceItem) : false;

    if (!sequenceItem) {
      return false;
    }

    toggleSequence(sequenceItem, shouldAssign);
  } else if (normalizedLevel === "series" && normalizedSeriesId) {
    const sequences = getOrderedCurriculumSequencesForSeries(currentRawSnapshot, normalizedSeriesId);
    const hasAssignedChild = sequences.length
      ? sequences.some(function (sequenceItem) {
          return isSequenceAssigned(sequenceItem);
        })
      : Boolean(emptySeriesIdsLookup[normalizedSeriesId]);

    if (sequences.length) {
      sequences.forEach(function (sequenceItem) {
        toggleSequence(sequenceItem, !hasAssignedChild);
      });
    } else if (hasAssignedChild) {
      delete emptySeriesIdsLookup[normalizedSeriesId];
    } else {
      emptySeriesIdsLookup[normalizedSeriesId] = true;
    }
  } else {
    return false;
  }

  activeSheet.curriculumLessonIds = Object.keys(lessonIdsLookup);
  activeSheet.curriculumSequenceIds = Object.keys(emptySequenceIdsLookup);
  activeSheet.curriculumSeriesIds = Object.keys(emptySeriesIdsLookup);
  normalizeEvaluationSheetCurriculumAssignments(currentRawSnapshot, activeSheet);
  currentRawSnapshot.activeEvaluationSheetId = activeSheet.id;
  saveAndRefreshSnapshot(currentRawSnapshot, "bewertung");
  return false;
};
window.UnterrichtsassistentApp.setSeatPlanManageMode = function (nextMode) {
  return window.UnterrichtsassistentApp.setSeatPlanViewMode(nextMode === "tischordnung" ? "tischordnung" : "sitzordnung");
};
window.UnterrichtsassistentApp.changeActiveSeatPlanRoom = function (roomValue) {
  if (!repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const activeClass = schoolService.getActiveClass();
  const wasLiveMode = isLiveDateTimeMode();
  const currentParts = getNowDateParts();

  currentRawSnapshot.activeSeatPlanRoom = String(roomValue || "").trim();
  currentRawSnapshot.activeSeatPlanId = null;
  currentRawSnapshot.activeSeatOrderId = null;

  if (wasLiveMode) {
    currentRawSnapshot.activeDateTime = currentParts.date + "T" + currentParts.time;
    currentRawSnapshot.activeDateTimeMode = "manual";

    if (activeClass) {
      currentRawSnapshot.activeClassId = activeClass.id;
    }
  }

  refreshSnapshotInMemory(currentRawSnapshot, "sitzplan");
  return false;
};
window.UnterrichtsassistentApp.changeActiveSeatPlan = function (seatPlanId) {
  if (!repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  let selectedItem = null;

  if (seatPlanViewMode === "sitzordnung") {
    selectedItem = getSeatOrdersCollection(currentRawSnapshot).find(function (seatOrder) {
      return seatOrder.id === seatPlanId;
    }) || null;
    currentRawSnapshot.activeSeatOrderId = seatPlanId || null;
  } else {
    selectedItem = getSeatPlansCollection(currentRawSnapshot).find(function (seatPlan) {
      return seatPlan.id === seatPlanId;
    }) || null;
    currentRawSnapshot.activeSeatPlanId = seatPlanId || null;
  }

  currentRawSnapshot.activeSeatPlanRoom = selectedItem ? String(selectedItem.room || "").trim() : currentRawSnapshot.activeSeatPlanRoom;
  refreshSnapshotInMemory(currentRawSnapshot, "sitzplan");
  return false;
};
window.UnterrichtsassistentApp.createSeatPlan = function () {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const activeRoom = getActiveSeatPlanRoom(activeClass);
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const currentSeatPlan = schoolService && activeClass
    ? schoolService.getCurrentSeatPlan(activeClass.id, activeRoom, schoolService.getReferenceDate())
    : null;
  const currentSeatOrder = schoolService && activeClass
    ? schoolService.getCurrentSeatOrder(activeClass.id, activeRoom, schoolService.getReferenceDate())
    : null;
  const nextSeatPlan = activeClass ? createSeatPlanRecord(activeClass.id, activeRoom) : null;
  const nextSeatOrder = activeClass ? createSeatOrderRecord(activeClass.id, activeRoom) : null;
  const yesterdayValue = getYesterdayDateValue();
  const isSeatOrderMode = seatPlanViewMode === "sitzordnung";
  const isDeskLayoutMode = seatPlanViewMode === "tischordnung";
  const shouldCopyCurrentMode = (isSeatOrderMode ? currentSeatOrder : currentSeatPlan)
    ? window.confirm("Soll die Konfiguration der aktuellen " + (isSeatOrderMode ? "Sitzordnung" : "Tischordnung") + " in die neue " + (isSeatOrderMode ? "Sitzordnung" : "Tischordnung") + " kopiert werden?")
    : false;

  if (!repository || !schoolService || !activeClass || (!isSeatOrderMode && !isDeskLayoutMode)) {
    return false;
  }

  getMutableSeatPlansCollection(currentRawSnapshot);
  getMutableSeatOrdersCollection(currentRawSnapshot);

  if (isSeatOrderMode) {
    if (!nextSeatOrder) {
      return false;
    }

    if (currentSeatOrder) {
      currentRawSnapshot.seatOrders = getMutableSeatOrdersCollection(currentRawSnapshot).map(function (seatOrder) {
        if (seatOrder.id === currentSeatOrder.id) {
          seatOrder.validTo = yesterdayValue;
        }

        return seatOrder;
      });
    }

    if (currentSeatOrder && shouldCopyCurrentMode) {
      nextSeatOrder.seats = (currentSeatOrder.seats || []).map(function (seat) {
        return Object.assign({}, seat);
      });
    }

    getMutableSeatOrdersCollection(currentRawSnapshot).unshift(nextSeatOrder);
    currentRawSnapshot.activeSeatOrderId = nextSeatOrder.id;
  } else {
    if (!nextSeatPlan) {
      return false;
    }

    if (currentSeatPlan) {
      currentRawSnapshot.seatPlans = getMutableSeatPlansCollection(currentRawSnapshot).map(function (seatPlan) {
        if (seatPlan.id === currentSeatPlan.id) {
          seatPlan.validTo = yesterdayValue;
        }

        return seatPlan;
      });
    }

    if (currentSeatPlan && shouldCopyCurrentMode) {
      nextSeatPlan.deskLayoutItems = (currentSeatPlan.deskLayoutItems || []).map(function (item) {
        return Object.assign({}, item);
      });
      nextSeatPlan.deskLayoutLinks = (currentSeatPlan.deskLayoutLinks || []).map(function (link) {
        return Object.assign({}, link);
      });
      nextSeatPlan.roomWindowSide = String(currentSeatPlan.roomWindowSide || "");
      nextSeatPlan.roomWidth = Number(currentSeatPlan.roomWidth) || nextSeatPlan.roomWidth;
      nextSeatPlan.roomHeight = Number(currentSeatPlan.roomHeight) || nextSeatPlan.roomHeight;
    }

    getMutableSeatPlansCollection(currentRawSnapshot).unshift(nextSeatPlan);
    currentRawSnapshot.activeSeatPlanId = nextSeatPlan.id;
  }

  currentRawSnapshot.activeSeatPlanRoom = activeRoom;
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
};
window.UnterrichtsassistentApp.deleteActiveSeatPlan = function () {
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const activeRoom = getActiveSeatPlanRoom(activeClass);
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const currentSeatPlan = schoolService && activeClass
    ? schoolService.getManagedSeatPlan(activeClass.id, activeRoom)
    : null;
  const currentSeatOrder = schoolService && activeClass
    ? schoolService.getManagedSeatOrder(activeClass.id, activeRoom)
    : null;
  let remainingItems = [];
  let nextActiveItem = null;
  const isSeatOrderMode = seatPlanViewMode === "sitzordnung";
  const currentItem = isSeatOrderMode ? currentSeatOrder : currentSeatPlan;

  if (!repository || !schoolService || !activeClass || !currentRawSnapshot || !currentItem || ["sitzordnung", "tischordnung"].indexOf(seatPlanViewMode) === -1) {
    return false;
  }

  if (!window.confirm("Soll diese " + (seatPlanViewMode === "sitzordnung" ? "Sitzordnung" : "Tischordnung") + " wirklich dauerhaft geloescht werden?")) {
    return false;
  }

  if (isSeatOrderMode) {
    currentRawSnapshot.seatOrders = getSeatOrdersCollection(currentRawSnapshot).filter(function (seatOrder) {
      return seatOrder.id !== currentItem.id;
    });
    remainingItems = currentRawSnapshot.seatOrders.filter(function (seatOrder) {
      return seatOrder.classId === activeClass.id && String(seatOrder.room || "") === String(activeRoom || "");
    });
  } else {
    currentRawSnapshot.seatPlans = getSeatPlansCollection(currentRawSnapshot).filter(function (seatPlan) {
      return seatPlan.id !== currentItem.id;
    });
    remainingItems = currentRawSnapshot.seatPlans.filter(function (seatPlan) {
      return seatPlan.classId === activeClass.id && String(seatPlan.room || "") === String(activeRoom || "");
    });
  }

  nextActiveItem = remainingItems.find(function (item) {
    const todayValue = getReferenceDateValue();
    const startsBefore = !item.validFrom || compareDateValues(item.validFrom, todayValue) <= 0;
    const endsAfter = !item.validTo || compareDateValues(item.validTo, todayValue) >= 0;

    return startsBefore && endsAfter;
  }) || remainingItems[0] || null;

  if (isSeatOrderMode) {
    currentRawSnapshot.activeSeatOrderId = nextActiveItem ? nextActiveItem.id : null;
  } else {
    currentRawSnapshot.activeSeatPlanId = nextActiveItem ? nextActiveItem.id : null;
  }
  currentRawSnapshot.activeSeatPlanRoom = activeRoom;
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan", { forcePersist: true });
  return false;
};
window.UnterrichtsassistentApp.updateSeatPlanDateField = function (fieldName, nextValue) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const seatPlan = currentRawSnapshot
    ? (seatPlanViewMode === "sitzordnung"
      ? getEditableSeatOrderForActiveContextFromSnapshot(currentRawSnapshot)
      : getEditableSeatPlanForActiveContextFromSnapshot(currentRawSnapshot))
    : null;

  if (!repository || !schoolService || !seatPlan || ["validFrom", "validTo"].indexOf(fieldName) === -1) {
    return false;
  }

  seatPlan[fieldName] = normalizeDateValue(nextValue);
  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
};
window.UnterrichtsassistentApp.startSeatAssignmentDrag = function (event, studentId) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const seatPlan = currentRawSnapshot && activeClass
    ? getEditableSeatOrderForActiveContextFromSnapshot(currentRawSnapshot)
    : null;
  const currentSeat = getSeatAssignmentByStudentId(seatPlan, studentId);

  if (!event || !studentId || !event.dataTransfer) {
    return false;
  }

  if (currentSeat && isSeatAssignmentLocked(currentSeat)) {
    return false;
  }

  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(studentId));
  return true;
};
window.UnterrichtsassistentApp.allowSeatAssignmentDrop = function (event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (event && event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }

  return false;
};
window.UnterrichtsassistentApp.dropSeatAssignmentOnDesk = function (event, deskItemId, slotName) {
  const studentId = event && event.dataTransfer ? String(event.dataTransfer.getData("text/plain") || "").trim() : "";

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!studentId || !deskItemId) {
    return false;
  }

  lastSeatAssignmentNativeDrop = {
    studentId: studentId,
    timestamp: Date.now()
  };
  return assignStudentToDesk(studentId, deskItemId, slotName);
};
window.UnterrichtsassistentApp.endSeatAssignmentDrag = function (event, studentId, sourceKind) {
  const target = event ? getSeatAssignmentDeskTargetFromPoint(event.clientX || 0, event.clientY || 0) : null;

  if (!studentId) {
    return false;
  }

  if (lastSeatAssignmentNativeDrop && lastSeatAssignmentNativeDrop.studentId === studentId && (Date.now() - lastSeatAssignmentNativeDrop.timestamp) < 300) {
    lastSeatAssignmentNativeDrop = null;
    return false;
  }

  if (target && target.deskId) {
    return assignStudentToDesk(studentId, target.deskId, target.slot);
  }

  if (sourceKind === "desk") {
    return unassignStudentFromSeat(studentId);
  }

  return false;
};
window.UnterrichtsassistentApp.resetSeatAssignments = function () {
  return resetSeatAssignments();
};
window.UnterrichtsassistentApp.shuffleSeatAssignments = function () {
  return shuffleSeatAssignments();
};
window.UnterrichtsassistentApp.toggleSeatLock = function (deskItemId, slotName) {
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  let seatPlan = currentRawSnapshot && activeClass
    ? getEditableSeatOrderForActiveContextFromSnapshot(currentRawSnapshot)
    : null;
  let seat;

  if (!repository || !schoolService || !currentRawSnapshot || !activeClass || !deskItemId || !slotName) {
    return false;
  }

  if (!seatPlan) {
    seatPlan = getEditableSeatOrderForActiveContextFromSnapshot(currentRawSnapshot, { createIfMissing: true });
  }

  if (!seatPlan) {
    return false;
  }

  seat = getSeatAssignmentByDeskSlot(seatPlan, deskItemId, slotName);

  if (!seat) {
    seatPlan.seats.push({
      id: createSeatAssignmentId(),
      studentId: "",
      deskItemId: deskItemId,
      slot: slotName,
      isLocked: true
    });
  } else if (seat.isLocked) {
    if (seat.studentId) {
      seat.isLocked = false;
    } else {
      seatPlan.seats = (seatPlan.seats || []).filter(function (item) {
        return item !== seat;
      });
    }
  } else {
    seat.isLocked = true;
  }

  seatPlan.updatedAt = getCurrentTimestamp();
  saveAndRefreshSnapshot(currentRawSnapshot, "sitzplan");
  return false;
};
window.UnterrichtsassistentApp.toggleSeatLockFromClick = function (deskItemId, slotName) {
  if ((Date.now() - lastSeatLockPointerToggleAt) < 400) {
    return false;
  }

  return window.UnterrichtsassistentApp.toggleSeatLock(deskItemId, slotName);
};
window.UnterrichtsassistentApp.startSeatAssignmentPointerDrag = function (event, studentId, sourceKind) {
  const sourceElement = event ? event.currentTarget : null;
  const currentRawSnapshot = schoolService ? serializeSnapshot(schoolService.snapshot) : null;
  const activeClass = schoolService ? schoolService.getActiveClass() : null;
  const seatPlan = currentRawSnapshot && activeClass
    ? getEditableSeatOrderForActiveContextFromSnapshot(currentRawSnapshot)
    : null;
  const currentSeat = getSeatAssignmentByStudentId(seatPlan, studentId);

  if (!event || !studentId || !sourceElement) {
    return false;
  }

  finishSeatAssignmentDrag();

  activeSeatAssignmentDrag = {
    studentId: studentId,
    sourceKind: sourceKind === "desk" ? "desk" : "list",
    pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    previewElement: null,
    sourceElement: sourceElement,
    activeTargetElement: null,
    startClientX: Number(event.clientX) || 0,
    startClientY: Number(event.clientY) || 0,
    hasMoved: false,
    sourceIsLocked: Boolean(currentSeat && currentSeat.isLocked)
  };

  if (typeof sourceElement.setPointerCapture === "function" && typeof event.pointerId === "number") {
    try {
      sourceElement.setPointerCapture(event.pointerId);
    } catch (error) {
      // ignore
    }
  }

  window.addEventListener("pointermove", window.UnterrichtsassistentApp.handleSeatAssignmentPointerMove);
  window.addEventListener("pointerup", window.UnterrichtsassistentApp.handleSeatAssignmentPointerEnd);
  window.addEventListener("pointercancel", window.UnterrichtsassistentApp.handleSeatAssignmentPointerEnd);
  return false;
};
window.UnterrichtsassistentApp.handleSeatAssignmentPointerMove = function (event) {
  const target = activeSeatAssignmentDrag ? getSeatAssignmentDeskTargetFromPoint(event.clientX || 0, event.clientY || 0) : null;
  const moveDistanceX = activeSeatAssignmentDrag ? Math.abs((Number(event.clientX) || 0) - (Number(activeSeatAssignmentDrag.startClientX) || 0)) : 0;
  const moveDistanceY = activeSeatAssignmentDrag ? Math.abs((Number(event.clientY) || 0) - (Number(activeSeatAssignmentDrag.startClientY) || 0)) : 0;
  let previewElement;

  if (!activeSeatAssignmentDrag) {
    return false;
  }

  if (activeSeatAssignmentDrag.pointerId !== null && typeof event.pointerId === "number" && event.pointerId !== activeSeatAssignmentDrag.pointerId) {
    return false;
  }

  if (activeSeatAssignmentDrag.sourceIsLocked) {
    return false;
  }

  if (!activeSeatAssignmentDrag.hasMoved && Math.max(moveDistanceX, moveDistanceY) < 8) {
    return false;
  }

  if (!activeSeatAssignmentDrag.hasMoved) {
    activeSeatAssignmentDrag.hasMoved = true;
    previewElement = document.createElement("div");
    previewElement.className = "seat-order-drag-preview";
    previewElement.textContent = activeSeatAssignmentDrag.sourceElement ? (activeSeatAssignmentDrag.sourceElement.textContent || "") : "";
    document.body.appendChild(previewElement);
    activeSeatAssignmentDrag.previewElement = previewElement;
    document.body.classList.add("is-seat-assignment-dragging");
  }

  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  clearSeatAssignmentDropTarget();

  if (target && target.element) {
    activeSeatAssignmentDrag.activeTargetElement = target.element;
    target.element.classList.add("is-seat-drop-target");
    activeSeatAssignmentDrag.activeDeskId = target.deskId;
    activeSeatAssignmentDrag.activeDeskSlot = target.slot;
  } else {
    activeSeatAssignmentDrag.activeTargetElement = null;
    activeSeatAssignmentDrag.activeDeskId = "";
    activeSeatAssignmentDrag.activeDeskSlot = "";
  }

  updateSeatAssignmentPreview(event.clientX || 0, event.clientY || 0);
  return false;
};
window.UnterrichtsassistentApp.handleSeatAssignmentPointerEnd = function (event) {
  const shouldUnassign = activeSeatAssignmentDrag && activeSeatAssignmentDrag.sourceKind === "desk" && !activeSeatAssignmentDrag.activeDeskId;
  const studentId = activeSeatAssignmentDrag ? activeSeatAssignmentDrag.studentId : "";
  const deskId = activeSeatAssignmentDrag ? activeSeatAssignmentDrag.activeDeskId : "";
  const deskSlot = activeSeatAssignmentDrag ? activeSeatAssignmentDrag.activeDeskSlot : "";
  const didMove = activeSeatAssignmentDrag ? activeSeatAssignmentDrag.hasMoved : false;
  const sourceDeskElement = activeSeatAssignmentDrag && activeSeatAssignmentDrag.sourceElement && typeof activeSeatAssignmentDrag.sourceElement.closest === "function"
    ? activeSeatAssignmentDrag.sourceElement.closest("[data-seat-order-slot]")
    : null;
  const sourceDeskId = sourceDeskElement ? String(sourceDeskElement.getAttribute("data-seat-order-desk-id") || "") : "";
  const sourceDeskSlot = sourceDeskElement ? String(sourceDeskElement.getAttribute("data-seat-order-slot") || "") : "";

  if (!activeSeatAssignmentDrag) {
    return false;
  }

  if (activeSeatAssignmentDrag.pointerId !== null && typeof event.pointerId === "number" && event.pointerId !== activeSeatAssignmentDrag.pointerId) {
    return false;
  }

  finishSeatAssignmentDrag();

  if (!didMove) {
    if (event && event.pointerType && event.pointerType !== "mouse" && sourceDeskId && sourceDeskSlot) {
      lastSeatLockPointerToggleAt = Date.now();
      return window.UnterrichtsassistentApp.toggleSeatLock(sourceDeskId, sourceDeskSlot);
    }
    return false;
  }

  if (deskId) {
    return assignStudentToDesk(studentId, deskId, deskSlot);
  }

  if (shouldUnassign) {
    return unassignStudentFromSeat(studentId);
  }

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
  const seatPlan = currentRawSnapshot ? getEditableSeatPlanForActiveContextFromSnapshot(currentRawSnapshot) : null;
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
  const seatPlan = currentRawSnapshot ? getEditableSeatPlanForActiveContextFromSnapshot(currentRawSnapshot) : null;
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
  let dragState;
  let canvas;
  let deskLayoutCanvas;
  let resolvedPlacement;
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

  if (!activeDeskLayoutDrag) {
    return false;
  }

  if (activeDeskLayoutDrag.pointerId !== null && typeof event.pointerId === "number" && event.pointerId !== activeDeskLayoutDrag.pointerId) {
    return false;
  }

  dragState = activeDeskLayoutDrag;
  canvas = document.elementFromPoint(event.clientX || 0, event.clientY || 0);
  deskLayoutCanvas = canvas && typeof canvas.closest === "function"
    ? canvas.closest(".desk-layout-builder__canvas")
    : null;
  resolvedPlacement = dragState.resolvedPlacement;
  let didApply = false;

  // Finish the drag before re-rendering so the new view is not rendered with hidden desks.
  finishDeskLayoutDrag();

  if (deskLayoutCanvas) {
    if (dragState.mode === "move") {
      didApply = resolvedPlacement
        ? applyDeskLayoutMovePlacement(dragState.itemId, resolvedPlacement)
        : moveDeskLayoutItemToPoint(
            dragState.itemId,
            event.clientX || 0,
            event.clientY || 0,
            deskLayoutCanvas,
            dragState.pointerOffsetX,
            dragState.pointerOffsetY
          );
    } else {
      didApply = resolvedPlacement
        ? applyDeskLayoutCreatePlacement(dragState.deskType, resolvedPlacement)
        : insertDeskLayoutItemFromPoint(dragState.deskType, event.clientX || 0, event.clientY || 0, deskLayoutCanvas);
    }
  } else if (dragState.mode === "move") {
    didApply = removeDeskLayoutItem(dragState.itemId);
  }

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

  currentRawSnapshot.activeTimetableId = timetableId || null;
  refreshSnapshotInMemory(currentRawSnapshot, "stundenplan");
  return false;
};
window.UnterrichtsassistentApp.createTimetable = function () {
  if (!isTimetableManageMode() || !repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const timetables = getMutableTimetablesCollection(currentRawSnapshot);
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
window.UnterrichtsassistentApp.deleteActiveTimetable = function () {
  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const currentTimetable = schoolService ? schoolService.getManagedTimetable() : null;
  const timetables = getMutableTimetablesCollection(currentRawSnapshot);
  let nextActiveTimetable = null;

  if (!isTimetableManageMode() || !repository || !schoolService || !currentTimetable) {
    return false;
  }

  if (!window.confirm("Soll dieser Stundenplan wirklich dauerhaft geloescht werden?")) {
    return false;
  }

  currentRawSnapshot.timetables = timetables.filter(function (timetable) {
    return timetable.id !== currentTimetable.id;
  });
  nextActiveTimetable = currentRawSnapshot.timetables.find(function (timetable) {
    const todayValue = getReferenceDateValue();
    const startsBefore = !timetable.validFrom || compareDateValues(timetable.validFrom, todayValue) <= 0;
    const endsAfter = !timetable.validTo || compareDateValues(timetable.validTo, todayValue) >= 0;

    return startsBefore && endsAfter;
  }) || currentRawSnapshot.timetables[0] || null;
  currentRawSnapshot.activeTimetableId = nextActiveTimetable ? nextActiveTimetable.id : null;
  saveAndRefreshSnapshot(currentRawSnapshot, "stundenplan", { forcePersist: true });
  return false;
};
window.UnterrichtsassistentApp.changeActiveClass = function (classId) {
  if (!repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);

  currentRawSnapshot.activeClassId = classId || null;
  currentRawSnapshot.activeSeatPlanId = null;
  currentRawSnapshot.activeSeatOrderId = null;
  currentRawSnapshot.activeSeatPlanRoom = "";
  currentRawSnapshot.activeDateTimeMode = "manual";
  refreshSnapshotInMemory(currentRawSnapshot, activeViewId);
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
  currentRawSnapshot.activeSeatOrderId = null;
  currentRawSnapshot.activeSeatPlanRoom = "";

  if (timetableId) {
    currentRawSnapshot.activeTimetableId = timetableId;
  }

  refreshSnapshotInMemory(currentRawSnapshot, activeViewId);
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
  currentRawSnapshot.activeSeatOrderId = null;
  currentRawSnapshot.activeSeatPlanRoom = liveRoom || "";
  refreshSnapshotInMemory(currentRawSnapshot, activeViewId);
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

  refreshSnapshotInMemory(currentRawSnapshot, activeViewId);
  return false;
};
window.UnterrichtsassistentApp.shiftActiveDateByDays = function (dayOffset) {
  if (!repository || !schoolService) {
    return false;
  }

  const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);
  const currentParts = getActiveDateTimeParts();
  const currentDate = new Date(String(currentParts.date) + "T" + String(currentParts.time || "00:00"));
  const offset = Number(dayOffset) || 0;
  const activeClass = schoolService.getActiveClass();
  const wasLiveMode = isLiveDateTimeMode();
  let nextDate;

  if (Number.isNaN(currentDate.getTime()) || !offset) {
    return false;
  }

  nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + offset);

  activeTimetableWeekShiftAnimation = {
    direction: offset > 0 ? "forward" : "backward",
    startedAt: Date.now()
  };

  currentRawSnapshot.activeDateTime = nextDate.getFullYear()
    + "-" + String(nextDate.getMonth() + 1).padStart(2, "0")
    + "-" + String(nextDate.getDate()).padStart(2, "0")
    + "T"
    + String(nextDate.getHours()).padStart(2, "0")
    + ":" + String(nextDate.getMinutes()).padStart(2, "0");
  currentRawSnapshot.activeDateTimeMode = "manual";

  if (wasLiveMode && activeClass) {
    currentRawSnapshot.activeClassId = activeClass.id;
  }

  refreshSnapshotInMemory(currentRawSnapshot, activeViewId);
  return false;
};
window.UnterrichtsassistentApp.getTimetableWeekShiftAnimationDirection = function () {
  return getTimetableWeekShiftAnimationDirection();
};
window.UnterrichtsassistentApp.startTimetableWeekSwipe = function (event) {
  const pointerType = String(event && event.pointerType || "").toLowerCase();
  const sourceElement = event && event.currentTarget ? event.currentTarget : null;

  if (!event || !sourceElement || (pointerType && pointerType === "mouse")) {
    return false;
  }

  activeTimetableSwipe = {
    pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
    startClientX: Number(event.clientX) || 0,
    startClientY: Number(event.clientY) || 0,
    hasTriggered: false
  };

  if (typeof sourceElement.setPointerCapture === "function" && typeof event.pointerId === "number") {
    try {
      sourceElement.setPointerCapture(event.pointerId);
    } catch (error) {
      // ignore
    }
  }

  return false;
};
window.UnterrichtsassistentApp.handleTimetableWeekSwipeMove = function (event) {
  const deltaX = activeTimetableSwipe ? (Number(event.clientX) || 0) - Number(activeTimetableSwipe.startClientX || 0) : 0;
  const deltaY = activeTimetableSwipe ? (Number(event.clientY) || 0) - Number(activeTimetableSwipe.startClientY || 0) : 0;

  if (!activeTimetableSwipe) {
    return false;
  }

  if (activeTimetableSwipe.pointerId !== null && typeof event.pointerId === "number" && event.pointerId !== activeTimetableSwipe.pointerId) {
    return false;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY) && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  return false;
};
window.UnterrichtsassistentApp.endTimetableWeekSwipe = function (event) {
  const deltaX = activeTimetableSwipe ? (Number(event.clientX) || 0) - Number(activeTimetableSwipe.startClientX || 0) : 0;
  const deltaY = activeTimetableSwipe ? (Number(event.clientY) || 0) - Number(activeTimetableSwipe.startClientY || 0) : 0;
  let result = false;

  if (!activeTimetableSwipe) {
    return false;
  }

  if (activeTimetableSwipe.pointerId !== null && typeof event.pointerId === "number" && event.pointerId !== activeTimetableSwipe.pointerId) {
    return false;
  }

  if (!activeTimetableSwipe.hasTriggered && Math.abs(deltaX) >= 56 && Math.abs(deltaX) > (Math.abs(deltaY) * 1.25)) {
    activeTimetableSwipe.hasTriggered = true;
    result = window.UnterrichtsassistentApp.shiftActiveDateByDays(deltaX < 0 ? 7 : -7);
  }

  activeTimetableSwipe = null;
  return result;
};
window.UnterrichtsassistentApp.openClassImportModal = function () {
  const modal = getClassImportModal();

  if (!isClassManageMode()) {
    return false;
  }

  if (modal) {
    isClassImportModalOpen = true;
    modal.hidden = false;
    modal.classList.add("is-open");
  }

  return false;
};
window.UnterrichtsassistentApp.closeClassImportModal = function () {
  const modal = getClassImportModal();

  if (modal) {
    isClassImportModalOpen = false;
    modal.hidden = true;
    modal.classList.remove("is-open");
  }

  return false;
};
window.UnterrichtsassistentApp.submitClassImport = function (event) {
  const form = event.target;
  const classNameInput = form ? form.querySelector("#classNameInput") : null;
  const fileInput = form ? form.querySelector("#studentCsvFile") : null;
  const subjectInput = form ? form.querySelector("#classSubjectInput") : null;
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
    const currentRawSnapshot = serializeSnapshot(schoolService.snapshot);

    if (!className) {
      return false;
    }

    saveAndRefreshSnapshot(createEmptyClassFn(currentRawSnapshot, className, subjectName), "klasse").then(function () {
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
  currentRawSnapshot.attendanceRecords = getAttendanceRecordsCollection(currentRawSnapshot).filter(function (record) {
    return record.studentId !== studentId;
  });
  currentRawSnapshot.homeworkRecords = getHomeworkRecordsCollection(currentRawSnapshot).filter(function (record) {
    return record.studentId !== studentId;
  });
  currentRawSnapshot.warningRecords = getWarningRecordsCollection(currentRawSnapshot).filter(function (record) {
    return record.studentId !== studentId;
  });
  currentRawSnapshot.seatPlans = getSeatPlansCollection(currentRawSnapshot).map(function (seatPlan) {
    seatPlan.seats = (seatPlan.seats || []).filter(function (seat) {
      return seat.studentId !== studentId;
    });
    return seatPlan;
  });
  currentRawSnapshot.seatOrders = getSeatOrdersCollection(currentRawSnapshot).map(function (seatOrder) {
    seatOrder.seats = (seatOrder.seats || []).filter(function (seat) {
      return seat.studentId !== studentId;
    });
    return seatOrder;
  });

  saveAndRefreshSnapshot(currentRawSnapshot, "klasse", { forcePersist: true });
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
  currentRawSnapshot.evaluationSheets = getEvaluationSheetsCollection(currentRawSnapshot).filter(function (sheet) {
    return String(sheet && sheet.classId || "").trim() !== String(activeClass.id || "").trim();
  });
  currentRawSnapshot.attendanceRecords = getAttendanceRecordsCollection(currentRawSnapshot).filter(function (record) {
    return record.classId !== activeClass.id && !studentIdsToDelete[record.studentId];
  });
  currentRawSnapshot.homeworkRecords = getHomeworkRecordsCollection(currentRawSnapshot).filter(function (record) {
    return record.classId !== activeClass.id && !studentIdsToDelete[record.studentId];
  });
  currentRawSnapshot.warningRecords = getWarningRecordsCollection(currentRawSnapshot).filter(function (record) {
    return record.classId !== activeClass.id && !studentIdsToDelete[record.studentId];
  });
  currentRawSnapshot.todos = currentRawSnapshot.todos.filter(function (todo) {
    return todo.relatedClassId !== activeClass.id;
  });
  currentRawSnapshot.seatPlans = getSeatPlansCollection(currentRawSnapshot).filter(function (seatPlan) {
    return seatPlan.classId !== activeClass.id;
  });
  currentRawSnapshot.seatOrders = getSeatOrdersCollection(currentRawSnapshot).filter(function (seatOrder) {
    return seatOrder.classId !== activeClass.id;
  });
  getMutableTimetablesCollection(currentRawSnapshot).forEach(function (timetable) {
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
  currentRawSnapshot.activeSeatOrderId = null;
  currentRawSnapshot.activeEvaluationSheetId = null;
  currentRawSnapshot.activeSeatPlanRoom = "";

  saveAndRefreshSnapshot(currentRawSnapshot, "klasse", { forcePersist: true });
  return false;
};

async function startApp() {
  let storedSnapshotRecord = null;
  let shouldPersistEncryptedSnapshot = false;

  if (!(await ensureAuthAccess())) {
    return;
  }

  try {
    if (!repository || !SchoolServiceClass || !createSnapshot || !renderPanelsFn || !appDataCryptoApi) {
      throw new Error("App-Module konnten nicht vollstaendig geladen werden.");
    }

    storedSnapshotRecord = await repository.loadSnapshot();
    shouldPersistEncryptedSnapshot = !storedSnapshotRecord
      || !appDataCryptoApi
      || !appDataCryptoApi.isEncryptedSnapshotRecord
      || !appDataCryptoApi.isEncryptedSnapshotRecord(storedSnapshotRecord);

    rawState = applyAuthReturnStateToRawState(
      stripNonPersistentUiState(normalizeRawSnapshot(await loadSnapshotFromStorageRecord(storedSnapshotRecord)))
    );
    syncSchoolServiceWithRawState();
    shouldPersistEncryptedSnapshot = repairPlannedEvaluationPlanningEvents(rawState) || shouldPersistEncryptedSnapshot;
    if (shouldPersistEncryptedSnapshot) {
      syncSchoolServiceWithRawState();
    }
    persistenceHasStoredState = true;
    persistenceHasPendingChanges = false;
    persistenceLastError = null;

    if (rawState && shouldPersistEncryptedSnapshot) {
      await queueSnapshotPersist(rawState, { immediate: true });
    }
  } catch (error) {
    console.error("Geschuetzte App-Daten konnten nicht geladen oder entschluesselt werden.", error);
    clearSensitiveRuntimeState();
    persistenceHasStoredState = false;
    persistenceHasPendingChanges = false;
    persistenceLastError = error;
    renderStartupError("Startfehler: Gespeicherte Daten konnten nicht geladen oder entschluesselt werden.");
  }

  if (schoolService && rawState) {
    unterrichtToolMode = shouldDefaultToAssessmentTool(
      rawState,
      schoolService.getActiveClass(),
      schoolService.getReferenceDate()
    ) ? "assessment" : "attendance";
  } else {
    unterrichtToolMode = "attendance";
  }

  ensureLiveDateTimeRefresh();
  setActiveView(activeViewId);
  renderActiveClassContext();
}

window.UnterrichtsassistentApp.flushPersistence = function () {
  if (!schoolService || !getMutableRawSnapshot()) {
    return false;
  }

  queueSnapshotPersist(getMutableRawSnapshot(), { immediate: true });
  return false;
};
window.UnterrichtsassistentApp.exportAppData = function () {
  const currentRawSnapshot = getMutableRawSnapshot();
  const currentMasterKeyBytes = getUnlockedMasterKey();
  let passwordAuthRecord = null;
  let encryptedSnapshotRecord = null;
  let exportPayload = null;
  let downloadUrl = "";
  let link = null;
  let exportJson = "";
  let fileName = "";

  if (!currentRawSnapshot || !currentMasterKeyBytes || !repository || !appDataCryptoApi) {
    return false;
  }

  try {
    passwordAuthRecord = repository ? repository.loadPasswordAuthRecord() : null;
    encryptedSnapshotRecord = appDataCryptoApi.encryptSnapshot(
      buildImportableSnapshot(currentRawSnapshot),
      currentMasterKeyBytes
    );
    return Promise.all([passwordAuthRecord, encryptedSnapshotRecord]).then(function (results) {
      const resolvedPasswordAuthRecord = results[0];
      const resolvedEncryptedSnapshotRecord = results[1];

      if (!resolvedPasswordAuthRecord || !resolvedEncryptedSnapshotRecord) {
        throw new Error("Verschluesselter Export konnte nicht erzeugt werden.");
      }

      exportPayload = {
        format: "unterrichtsassistent-encrypted-export",
        version: 1,
        exportedAt: new Date().toISOString(),
        passwordAuth: resolvedPasswordAuthRecord,
        appState: resolvedEncryptedSnapshotRecord
      };

      exportJson = JSON.stringify(exportPayload, null, 2);
      fileName = "unterrichtsassistent-export-" + getCurrentTimestampFilePart() + ".json";
      downloadUrl = URL.createObjectURL(new Blob([exportJson], { type: "application/json" }));
      link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      return false;
    }).catch(function (error) {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      console.error("Export der App-Daten fehlgeschlagen.", error);
      window.alert("Der Export der App-Daten ist fehlgeschlagen.");
      return false;
    });
  } catch (error) {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    console.error("Export der App-Daten fehlgeschlagen.", error);
    window.alert("Der Export der App-Daten ist fehlgeschlagen.");
  }

  return false;
};
window.UnterrichtsassistentApp.openImportAppData = function () {
  if (!appDataImportInput) {
    return false;
  }

  appDataImportInput.value = "";
  appDataImportInput.click();
  return false;
};
window.UnterrichtsassistentApp.importAppDataFromFile = function (event) {
  const input = event && event.target ? event.target : appDataImportInput;
  const file = input && input.files ? input.files[0] : null;
  const reader = new FileReader();

  if (!file) {
    return false;
  }

  if (!window.confirm("Soll der aktuelle App-Zustand durch die importierten Daten ersetzt werden?")) {
    if (input) {
      input.value = "";
    }
    return false;
  }

  reader.onload = function () {
    try {
      pendingEncryptedImportPayload = JSON.parse(String(reader.result || "{}"));

      if (!isEncryptedExportPayload(pendingEncryptedImportPayload)) {
        throw new Error("Dateiformat wird nicht unterstuetzt.");
      }

      openAppDataImportPasswordModal(file && file.name ? file.name : "");
    } catch (error) {
      pendingEncryptedImportPayload = null;
      console.error("Import der App-Daten fehlgeschlagen.", error);
      window.alert("Die ausgewaehlte Datei konnte nicht importiert werden. Bitte eine gueltige verschluesselte JSON-Exportdatei verwenden.");
    } finally {
      if (input) {
        input.value = "";
      }
    }
  };

  reader.onerror = function () {
    if (input) {
      input.value = "";
    }
    window.alert("Die Datei konnte nicht gelesen werden.");
  };

  reader.readAsText(file, "utf-8");
  return false;
};
window.UnterrichtsassistentApp.closeAppDataImportPasswordModal = function () {
  closeAppDataImportPasswordModalInternal();
  return false;
};
window.UnterrichtsassistentApp.submitImportedAppDataPassword = function (event) {
  const password = String(appDataImportPasswordInput && appDataImportPasswordInput.value || "");
  const payload = pendingEncryptedImportPayload;
  let importedMasterKeyBytes = null;
  let decryptedSnapshot = null;
  let normalizedImportedSnapshot = null;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  clearAppDataImportPasswordError();

  if (!payload || !repository || !passwordAuthApi || !appDataCryptoApi) {
    return window.UnterrichtsassistentApp.closeAppDataImportPasswordModal();
  }

  if (!password.trim()) {
    showAppDataImportPasswordError("Bitte das Passwort der Importdatei eingeben.");
    return false;
  }

  Promise.resolve()
    .then(function () {
      return passwordAuthApi.unlockPasswordAuthRecord(password, payload.passwordAuth);
    })
    .then(function (masterKeyBytes) {
      importedMasterKeyBytes = masterKeyBytes;
      return appDataCryptoApi.decryptSnapshot(payload.appState, importedMasterKeyBytes);
    })
    .then(function (snapshot) {
      decryptedSnapshot = snapshot;
      normalizedImportedSnapshot = normalizeImportedAppSnapshot(decryptedSnapshot);
      return appDataCryptoApi.encryptSnapshot(buildImportableSnapshot(normalizedImportedSnapshot), importedMasterKeyBytes);
    })
    .then(function (encryptedSnapshotRecord) {
      unlockedMasterKeyBytes = importedMasterKeyBytes;
      closeOpenTransientUi();
      return repository.saveProtectedState(encryptedSnapshotRecord, payload.passwordAuth).then(function () {
        passwordAuthApi.createUnlockSession();
        refreshSnapshotInMemory(normalizedImportedSnapshot, activeViewId);
        persistenceHasStoredState = true;
        persistenceHasPendingChanges = false;
        persistenceLastError = null;
        pendingPersistSnapshot = null;
        clearPendingPersistTimer();
        renderPersistenceIndicator();
        noteUnlockActivity();
        closeAppDataImportPasswordModalInternal();
        return false;
      });
    })
    .catch(function (error) {
      console.error("Verschluesselter Import konnte nicht uebernommen werden.", error);
      showAppDataImportPasswordError("Passwort oder Importdatei sind nicht korrekt.");
    });

  return false;
};

document.addEventListener("touchstart", function (event) {
  const touch = event && event.touches && event.touches[0];

  if (!touch) {
    return;
  }

  lastTouchClientY = Number(touch.clientY) || 0;
}, { passive: true });

document.addEventListener("submit", preventLocalOnlyFormSubmit, true);

document.addEventListener("touchmove", function (event) {
  const touch = event && event.touches && event.touches[0];
  const scrollableAncestor = findScrollableYAncestor(event.target);
  const currentClientY = touch ? Number(touch.clientY) || 0 : 0;
  const deltaY = currentClientY - lastTouchClientY;
  const atTop = !scrollableAncestor || scrollableAncestor.scrollTop <= 0;
  const atBottom = !scrollableAncestor || Math.ceil(scrollableAncestor.scrollTop + scrollableAncestor.clientHeight) >= scrollableAncestor.scrollHeight;

  lastTouchClientY = currentClientY;

  if (!touch) {
    return;
  }

  if (!scrollableAncestor || (deltaY > 0 && atTop) || (deltaY < 0 && atBottom)) {
    event.preventDefault();
  }
}, { passive: false });

document.addEventListener("click", function (event) {
  if (!appShell || !sidebar || !appShell.classList.contains("is-collapsed")) {
    return;
  }

  if ((sidebar && sidebar.contains(event.target)) || (collapsedClassPicker && collapsedClassPicker.contains(event.target))) {
    return;
  }

  if (!sidebar.contains(event.target)) {
    closeCollapsedClassPicker();
  }
});

if (activeClassBadge) {
  activeClassBadge.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    toggleCollapsedClassPicker();
  });
}

window.addEventListener("resize", function () {
  if (sidebar && sidebar.classList.contains("is-class-picker-open")) {
    positionCollapsedClassPicker();
  }
});

window.addEventListener("scroll", function () {
  if (sidebar && sidebar.classList.contains("is-class-picker-open")) {
    positionCollapsedClassPicker();
  }
}, { passive: true });

window.addEventListener("pagehide", function () {
  if (!schoolService || !getMutableRawSnapshot() || !persistenceHasPendingChanges) {
    return;
  }

  flushPendingPersist({
    snapshot: getMutableRawSnapshot(),
    immediate: true
  });
});

window.addEventListener("unload", function () {
  if (passwordAuthApi && typeof passwordAuthApi.clearUnlockSession === "function") {
    passwordAuthApi.clearUnlockSession();
  }

  clearSensitiveRuntimeState();
});

if (passwordAuthApi) {
  bindIdleLockTracking();
}

renderPersistenceIndicator();

startApp().catch((error) => {
  console.error("Fehler beim Starten der App:", error);
  clearSensitiveRuntimeState();
  persistenceHasStoredState = false;
  persistenceHasPendingChanges = false;
  persistenceLastError = error;
  renderPersistenceIndicator();
  renderStartupError("Startfehler: Navigation aktiv, aber geschuetzte Inhalte konnten nicht geladen werden.");
  setActiveView(activeViewId);
});

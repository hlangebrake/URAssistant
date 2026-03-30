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
  assessment: true
};
let timetableViewMode = "ansicht";
let seatPlanViewMode = "ansicht";
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
let hasBoundClassAnalysisResize = false;
let classAnalysisScrollLeftByClassId = {};
let activeKnowledgeGapSuggestionListId = "";
let activeKnowledgeGapSuggestionInputId = "";
let activeKnowledgeGapSuggestionBlurTimerId = 0;
let activeKnowledgeGapSuggestionDrag = null;
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
    activeClassId: rawState && rawState.activeClassId ? rawState.activeClassId : null,
    activeTimetableId: rawState && rawState.activeTimetableId ? rawState.activeTimetableId : null,
    activeSeatPlanId: rawState && rawState.activeSeatPlanId ? rawState.activeSeatPlanId : null,
    activeSeatOrderId: rawState && rawState.activeSeatOrderId ? rawState.activeSeatOrderId : null,
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
  nextSnapshot.activeClassId = returnState.activeClassId || null;
  nextSnapshot.activeTimetableId = returnState.activeTimetableId || null;
  nextSnapshot.activeSeatPlanId = returnState.activeSeatPlanId || null;
  nextSnapshot.activeSeatOrderId = returnState.activeSeatOrderId || null;
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
  normalizedSnapshot.activeSeatPlanRoom = String(importedSnapshot.activeSeatPlanRoom || normalizedSnapshot.activeSeatPlanRoom || "");
  normalizedSnapshot.activeDateTime = String(importedSnapshot.activeDateTime || normalizedSnapshot.activeDateTime || "");
  normalizedSnapshot.activeDateTimeMode = String(importedSnapshot.activeDateTimeMode || normalizedSnapshot.activeDateTimeMode || "live");

  return normalizedSnapshot;
}

function closeOpenTransientUi() {
  closeKnowledgeGapSuggestions();

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

  if (typeof window.UnterrichtsassistentApp.closeClassImportModal === "function") {
    window.UnterrichtsassistentApp.closeClassImportModal();
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

function getKnowledgeGapSuggestionList(listId) {
  return listId ? document.getElementById(listId) : null;
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

function scheduleKnowledgeGapSuggestionsClose() {
  clearKnowledgeGapSuggestionBlurTimer();
  activeKnowledgeGapSuggestionBlurTimerId = window.setTimeout(function () {
    closeKnowledgeGapSuggestions();
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
    const dateLabel = referenceDate && !Number.isNaN(referenceDate.getTime())
      ? String(referenceDate.getDate()).padStart(2, "0") + "." + String(referenceDate.getMonth() + 1).padStart(2, "0") + "." + referenceDate.getFullYear()
      : "";

    if (!subtitle && !dateLabel) {
      viewSubtitle.textContent = "";
      viewSubtitle.hidden = true;
      return;
    }

    viewSubtitle.innerHTML = '<span class="content__subtitle-main">' + escapeHtml(subtitle) + '</span>' + (dateLabel ? '<span class="content__subtitle-subtle">' + escapeHtml(dateLabel) + '</span>' : "");
    viewSubtitle.hidden = false;
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
        ? buildTimetableDropdownHtml() + '<button class="circle-action circle-action--danger" type="button" aria-label="Aktuellen Stundenplan loeschen" onclick="return window.UnterrichtsassistentApp.deleteActiveTimetable()">-</button><button class="circle-action" type="button" aria-label="Neuen Stundenplan anlegen" onclick="return window.UnterrichtsassistentApp.createTimetable()">+</button>'
        : ""
    });
    return;
  }

  if (viewId === "sitzplan") {
    if (contentHeader && seatPlanViewMode !== "ansicht") {
      contentHeader.classList.add("has-secondary-actions");

      if (seatPlanViewMode === "sitzordnung") {
        contentHeader.classList.add("has-secondary-actions--compact");
      } else {
        contentHeader.classList.add("has-secondary-actions--stacked");
      }
    }

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
      ],
      trailingHtml: seatPlanViewMode === "sitzordnung" || seatPlanViewMode === "tischordnung"
        ? buildSeatPlanDropdownHtml(seatPlanViewMode === "sitzordnung" ? "Sitzordnung" : "Tischordnung") + '<button class="circle-action circle-action--danger" type="button" aria-label="Aktive ' + (seatPlanViewMode === "sitzordnung" ? 'Sitzordnung' : 'Tischordnung') + ' loeschen" onclick="return window.UnterrichtsassistentApp.deleteActiveSeatPlan()">-</button><button class="circle-action" type="button" aria-label="Neue ' + (seatPlanViewMode === "sitzordnung" ? 'Sitzordnung' : 'Tischordnung') + ' anlegen" onclick="return window.UnterrichtsassistentApp.createSeatPlan()">+</button>'
        : ""
    });
    return;
  }

  viewHeaderActions.innerHTML = "";
}

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

function setActiveView(viewId) {
  const previousViewId = activeViewId;
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
      assessment: true
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

  if (viewId === "klasse" && !isClassManageMode()) {
    initializeClassAnalysisInteractions();
  } else {
    clearClassAnalysisDragScroll();
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
    assessment: classAnalysisEnabledTypes.assessment !== false
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

  if (["attendance", "homework", "warning", "assessment"].indexOf(normalizedType) < 0) {
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

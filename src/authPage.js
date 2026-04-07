const namespace = window.Unterrichtsassistent || {};
const dataLayer = namespace.data || {};
const securityLayer = namespace.security || {};
const RepositoryClass = dataLayer.AppRepository;
const passwordAuthApi = securityLayer.passwordAuth || null;
const appDataCryptoApi = securityLayer.appDataCrypto || null;
const repository = RepositoryClass ? new RepositoryClass() : null;
const returnStateStorageKey = "unterrichtsassistent-auth-return-state";
const authUsernameValue = "lokal@unterrichtsassistent";
const encryptedExportFormat = "unterrichtsassistent-encrypted-export";

const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authDescription = document.getElementById("authDescription");
const authUsernameInput = document.getElementById("authUsername");
const authPasswordLabel = document.getElementById("authPasswordLabel");
const authPasswordInput = document.getElementById("authPassword");
const authConfirmField = document.getElementById("authConfirmField");
const authConfirmInput = document.getElementById("authPasswordConfirm");
const authError = document.getElementById("authError");
const authSubmitButton = document.getElementById("authSubmitButton");
const authImportSection = document.getElementById("authImportSection");
const authImportDescription = document.getElementById("authImportDescription");
const authImportMeta = document.getElementById("authImportMeta");
const authImportButton = document.getElementById("authImportButton");
const authImportCancelButton = document.getElementById("authImportCancelButton");
const authImportInput = document.getElementById("authImportInput");
const authResetSection = document.getElementById("authResetSection");
const authResetButton = document.getElementById("authResetButton");
const AUTH_AUTOFILL_POLL_INTERVAL_MS = 50;
const AUTH_AUTOFILL_STABLE_DELAY_MS = 20;
const AUTH_AUTOFILL_JUMP_MIN_CHARS = 6;
const AUTH_AUTOFILL_MIN_PASSWORD_LENGTH = 6;
const AUTH_AUTOFILL_JUMP_MAX_ELAPSED_MS = 180;

let authMode = "unlock";
let pendingImportPayload = null;
let isAuthFormBusy = false;
let authAutofillPollTimerId = 0;
let authAutofillSubmitTimerId = 0;
let authAutofillLastValue = "";
let authAutofillLastValueAt = 0;
let authAutofillPendingValue = "";
let authLastUserKeyboardAt = 0;

function getReturnUrl() {
  const storedReturnState = window.sessionStorage.getItem(returnStateStorageKey);

  try {
    const parsedState = storedReturnState ? JSON.parse(storedReturnState) : null;
    const returnUrl = parsedState && parsedState.returnUrl
      ? String(parsedState.returnUrl)
      : "";

    if (returnUrl) {
      return returnUrl;
    }
  } catch (error) {
    void error;
  }

  return "index.html";
}

function redirectBackToApp() {
  window.location.replace(getReturnUrl());
}

function hasPendingImport() {
  return authMode === "setup" && Boolean(pendingImportPayload && pendingImportPayload.payload);
}

function getSubmitLabel() {
  if (hasPendingImport()) {
    return "Import entsperren";
  }

  return authMode === "setup" ? "Passwort speichern" : "Entsperren";
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

function showError(message) {
  if (!authError) {
    return;
  }

  authError.textContent = String(message || "");
  authError.hidden = !message;
}

function setFormBusy(isBusy) {
  isAuthFormBusy = Boolean(isBusy);

  if (authSubmitButton) {
    authSubmitButton.disabled = Boolean(isBusy);
    authSubmitButton.textContent = isBusy ? "Bitte warten ..." : getSubmitLabel();
  }

  if (authPasswordInput) {
    authPasswordInput.disabled = Boolean(isBusy);
  }

  if (authConfirmInput) {
    authConfirmInput.disabled = Boolean(isBusy || !authConfirmInput.required);
  }

  if (authImportButton) {
    authImportButton.disabled = Boolean(isBusy);
  }

  if (authImportCancelButton) {
    authImportCancelButton.disabled = Boolean(isBusy);
  }

  if (authImportInput) {
    authImportInput.disabled = Boolean(isBusy);
  }
}

function clearAuthAutofillSubmitTimer() {
  if (!authAutofillSubmitTimerId) {
    return;
  }

  window.clearTimeout(authAutofillSubmitTimerId);
  authAutofillSubmitTimerId = 0;
}

function noteAuthKeyboardInteraction() {
  authLastUserKeyboardAt = Date.now();
}

function stopAuthAutofillWatcher() {
  clearAuthAutofillSubmitTimer();

  if (!authAutofillPollTimerId) {
    return;
  }

  window.clearInterval(authAutofillPollTimerId);
  authAutofillPollTimerId = 0;
}

function isUnlockAutofillMode() {
  return authMode === "unlock" && !hasPendingImport();
}

function isLikelyAutofilledPassword(previousValue, nextValue, elapsedMs) {
  const addedChars = nextValue.length - previousValue.length;

  if (!nextValue || nextValue === previousValue || nextValue.length < AUTH_AUTOFILL_MIN_PASSWORD_LENGTH) {
    return false;
  }

  try {
    if (authPasswordInput && typeof authPasswordInput.matches === "function" && authPasswordInput.matches(":-webkit-autofill")) {
      return true;
    }
  } catch (error) {
    void error;
  }

  return addedChars >= AUTH_AUTOFILL_JUMP_MIN_CHARS
    && elapsedMs <= AUTH_AUTOFILL_JUMP_MAX_ELAPSED_MS;
}

function submitAuthFormFromAutofill() {
  if (!authForm || !authPasswordInput || !isUnlockAutofillMode() || isAuthFormBusy) {
    return;
  }

  if (String(authPasswordInput.value || "") !== authAutofillPendingValue || !String(authPasswordInput.value || "").trim()) {
    return;
  }

  if (typeof authForm.requestSubmit === "function") {
    authForm.requestSubmit();
    return;
  }

  if (authSubmitButton && typeof authSubmitButton.click === "function") {
    authSubmitButton.click();
    return;
  }

  handleAuthSubmit();
}

function scheduleAuthAutofillSubmit(nextValue) {
  authAutofillPendingValue = String(nextValue || "");
  clearAuthAutofillSubmitTimer();
  authAutofillSubmitTimerId = window.setTimeout(function () {
    authAutofillSubmitTimerId = 0;
    submitAuthFormFromAutofill();
  }, AUTH_AUTOFILL_STABLE_DELAY_MS);
}

function maybeSubmitExistingAutofilledPassword() {
  const currentValue = authPasswordInput ? String(authPasswordInput.value || "") : "";

  if (!authPasswordInput || !isUnlockAutofillMode() || isAuthFormBusy) {
    return;
  }

  if (currentValue.length < AUTH_AUTOFILL_MIN_PASSWORD_LENGTH) {
    return;
  }

  try {
    if (typeof authPasswordInput.matches === "function" && authPasswordInput.matches(":-webkit-autofill")) {
      scheduleAuthAutofillSubmit(currentValue);
    }
  } catch (error) {
    void error;
  }
}

function sampleAuthAutofillState() {
  const now = Date.now();
  const currentValue = authPasswordInput ? String(authPasswordInput.value || "") : "";
  const elapsedMs = authAutofillLastValueAt ? now - authAutofillLastValueAt : 0;

  if (!authPasswordInput || !isUnlockAutofillMode() || isAuthFormBusy) {
    return;
  }

  if (!currentValue.trim()) {
    authAutofillPendingValue = "";
    clearAuthAutofillSubmitTimer();
    authAutofillLastValue = currentValue;
    authAutofillLastValueAt = now;
    return;
  }

  if (currentValue !== authAutofillLastValue) {
    if (isLikelyAutofilledPassword(authAutofillLastValue, currentValue, elapsedMs)) {
      scheduleAuthAutofillSubmit(currentValue);
    } else {
      authAutofillPendingValue = "";
      clearAuthAutofillSubmitTimer();
    }

    authAutofillLastValue = currentValue;
    authAutofillLastValueAt = now;
    return;
  }

  if (!authAutofillSubmitTimerId && authAutofillPendingValue && currentValue === authAutofillPendingValue) {
    scheduleAuthAutofillSubmit(currentValue);
    return;
  }

  if (!authAutofillSubmitTimerId && !authAutofillPendingValue) {
    maybeSubmitExistingAutofilledPassword();
  }
}

function startAuthAutofillWatcher() {
  stopAuthAutofillWatcher();

  if (!authPasswordInput || !isUnlockAutofillMode()) {
    return;
  }

  authAutofillLastValue = String(authPasswordInput.value || "");
  authAutofillLastValueAt = Date.now();
  authAutofillPendingValue = "";
  authAutofillPollTimerId = window.setInterval(sampleAuthAutofillState, AUTH_AUTOFILL_POLL_INTERVAL_MS);
  window.setTimeout(maybeSubmitExistingAutofilledPassword, 0);
  window.setTimeout(maybeSubmitExistingAutofilledPassword, 50);
  window.setTimeout(maybeSubmitExistingAutofilledPassword, 140);
}

function formatImportedPayloadMeta() {
  const parts = [];
  const payload = pendingImportPayload && pendingImportPayload.payload;
  const fileName = pendingImportPayload && pendingImportPayload.fileName
    ? String(pendingImportPayload.fileName).trim()
    : "";

  if (fileName) {
    parts.push(fileName);
  }

  if (payload && payload.exportedAt) {
    try {
      parts.push(new Date(payload.exportedAt).toLocaleString("de-DE"));
    } catch (error) {
      void error;
    }
  }

  return parts.join(" | ");
}

function clearPendingImport() {
  pendingImportPayload = null;

  if (authImportInput) {
    authImportInput.value = "";
  }
}

function syncModeUi() {
  const isSetupMode = authMode === "setup";
  const isImportMode = hasPendingImport();
  const reason = String(new URLSearchParams(window.location.search).get("reason") || "").trim();
  let description = "Die App ist geschuetzt. Bitte Passwort eingeben, um weiterzuarbeiten.";

  if (reason === "idle") {
    description = "Die App war laenger als 5 Minuten inaktiv und wurde deshalb gesperrt. Bitte Passwort eingeben.";
  } else if (reason === "startup") {
    description = "Nach einem Neustart oder erneuten Oeffnen ist zur Sicherheit wieder das Passwort erforderlich.";
  }

  if (authTitle) {
    authTitle.textContent = isImportMode
      ? "Backup importieren"
      : (isSetupMode ? "Passwort festlegen" : "App entsperren");
  }

  if (authDescription) {
    authDescription.textContent = isImportMode
      ? "Das verschluesselte Backup wird mit seinem bestehenden Passwort uebernommen."
      : (isSetupMode
        ? "Beim ersten Start wird ein Passwort eingerichtet. Dieses Passwort wird spaeter auch fuer geschuetzte Exporte verwendet."
        : description);
  }

  if (authPasswordLabel) {
    authPasswordLabel.textContent = isImportMode
      ? "Passwort des Backups"
      : (isSetupMode ? "Neues Passwort" : "Passwort");
  }

  if (authUsernameInput) {
    authUsernameInput.value = authUsernameValue;
  }

  if (authPasswordInput) {
    if (!isUnlockAutofillMode()) {
      authPasswordInput.value = "";
    }
    authPasswordInput.setAttribute("autocomplete", isSetupMode && !isImportMode ? "new-password" : "current-password");
  }

  if (authConfirmField) {
    authConfirmField.hidden = !isSetupMode || isImportMode;
    authConfirmField.style.display = isSetupMode && !isImportMode ? "" : "none";
  }

  if (authConfirmInput) {
    authConfirmInput.value = "";
    authConfirmInput.required = isSetupMode && !isImportMode;
    authConfirmInput.disabled = !isSetupMode || isImportMode;
  }

  if (authImportSection) {
    authImportSection.hidden = !isSetupMode;
  }

  if (authResetSection) {
    authResetSection.hidden = isSetupMode;
  }

  if (authImportDescription) {
    authImportDescription.textContent = isImportMode
      ? "Das ausgewaehlte Backup kann jetzt mit seinem bisherigen Passwort entsperrt und uebernommen werden."
      : "Falls schon ein verschluesselter Export existiert, kann er hier direkt importiert werden.";
  }

  if (authImportMeta) {
    authImportMeta.textContent = isImportMode ? formatImportedPayloadMeta() : "";
    authImportMeta.hidden = !isImportMode;
  }

  if (authImportButton) {
    authImportButton.textContent = isImportMode
      ? "Andere Datei waehlen"
      : "Verschluesseltes Backup importieren";
  }

  if (authImportCancelButton) {
    authImportCancelButton.hidden = !isImportMode;
  }

  showError("");
  setFormBusy(false);

  window.setTimeout(function () {
    if (authPasswordInput && typeof authPasswordInput.focus === "function") {
      authPasswordInput.focus();
    }
  }, 0);

  startAuthAutofillWatcher();
}

function isEncryptedExportPayload(payload) {
  return Boolean(
    payload
    && typeof payload === "object"
    && payload.format === encryptedExportFormat
    && payload.passwordAuth
    && typeof payload.passwordAuth === "object"
    && typeof payload.passwordAuth.encryptedMasterKey === "string"
    && typeof payload.passwordAuth.salt === "string"
    && typeof payload.passwordAuth.wrapIv === "string"
    && payload.appState
    && appDataCryptoApi
    && typeof appDataCryptoApi.isEncryptedSnapshotRecord === "function"
    && appDataCryptoApi.isEncryptedSnapshotRecord(payload.appState)
  );
}

function readFileAsText(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onload = function () {
      resolve(String(reader.result || ""));
    };

    reader.onerror = function () {
      reject(reader.error || new Error("Datei konnte nicht gelesen werden."));
    };

    reader.readAsText(file);
  });
}

async function resolveAuthMode() {
  const params = new URLSearchParams(window.location.search);
  const storedAuthRecord = repository ? await repository.loadPasswordAuthRecord() : null;
  const requestedMode = String(params.get("mode") || "").trim().toLowerCase();

  if (passwordAuthApi && passwordAuthApi.hasValidUnlockSession() && storedAuthRecord) {
    redirectBackToApp();
    return false;
  }

  if (!storedAuthRecord) {
    authMode = "setup";
  } else {
    authMode = requestedMode === "setup" ? "unlock" : "unlock";
  }

  clearPendingImport();
  syncModeUi();
  return true;
}

async function handleImportUnlock(password) {
  const importPayload = pendingImportPayload && pendingImportPayload.payload;
  const masterKeyBytes = await passwordAuthApi.unlockPasswordAuthRecord(password, importPayload.passwordAuth);

  await appDataCryptoApi.decryptSnapshot(importPayload.appState, masterKeyBytes);
  await repository.saveProtectedState(importPayload.appState, importPayload.passwordAuth);

  passwordAuthApi.createUnlockSession(masterKeyBytes);
}

async function handleSetupSubmit(password, passwordConfirm) {
  let authRecord = null;
  let masterKeyBytes = null;

  if (password.length < 6) {
    showError("Bitte ein Passwort mit mindestens 6 Zeichen festlegen.");
    return false;
  }

  if (password !== passwordConfirm) {
    showError("Die Passwortwiederholung stimmt nicht ueberein.");
    return false;
  }

  authRecord = await passwordAuthApi.createPasswordAuthRecord(password);
  await repository.savePasswordAuthRecord(authRecord);

  masterKeyBytes = await passwordAuthApi.unlockPasswordAuthRecord(password, authRecord);
  passwordAuthApi.createUnlockSession(masterKeyBytes);
  return true;
}

async function handleUnlockSubmit(password) {
  const authRecord = await repository.loadPasswordAuthRecord();

  if (!authRecord) {
    authMode = "setup";
    clearPendingImport();
    syncModeUi();
    showError("Es wurde noch kein Passwort eingerichtet.");
    return false;
  }

  passwordAuthApi.createUnlockSession(await passwordAuthApi.unlockPasswordAuthRecord(password, authRecord));
  return true;
}

async function handleAuthSubmit(event) {
  const password = String(authPasswordInput && authPasswordInput.value || "");
  const passwordConfirm = String(authConfirmInput && authConfirmInput.value || "");
  const isImportMode = hasPendingImport();

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  showError("");

  if (!passwordAuthApi || !passwordAuthApi.ensureCryptoSupport() || !repository) {
    showError("Die Passwortsperre wird in diesem Browser nicht unterstuetzt.");
    return false;
  }

  if (isImportMode && (!appDataCryptoApi || typeof appDataCryptoApi.decryptSnapshot !== "function")) {
    showError("Der verschluesselte Import wird in diesem Browser nicht unterstuetzt.");
    return false;
  }

  if (!password.trim()) {
    showError("Bitte ein Passwort eingeben.");
    return false;
  }

  setFormBusy(true);
  clearAuthAutofillSubmitTimer();

  try {
    if (isImportMode) {
      await handleImportUnlock(password);
    } else if (authMode === "setup") {
      if (!await handleSetupSubmit(password, passwordConfirm)) {
        setFormBusy(false);
        return false;
      }
    } else if (!await handleUnlockSubmit(password)) {
      setFormBusy(false);
      return false;
    }

    redirectBackToApp();
  } catch (error) {
    console.error("Authentifizierung fehlgeschlagen.", error);
    showError(isImportMode
      ? "Passwort oder Importdatei sind nicht korrekt."
      : (authMode === "setup"
        ? "Das Passwort konnte nicht gespeichert werden."
        : "Das Passwort ist nicht korrekt."));
    setFormBusy(false);
  }

  return false;
}

async function handleImportFileSelection(event) {
  const target = event && event.target;
  const file = target && target.files && target.files[0];
  let fileContents = "";
  let parsedPayload = null;

  if (!file) {
    return false;
  }

  showError("");
  setFormBusy(true);

  try {
    fileContents = await readFileAsText(file);
    parsedPayload = JSON.parse(fileContents || "{}");

    if (!isEncryptedExportPayload(parsedPayload)) {
      throw new Error("Dateiformat wird nicht unterstuetzt.");
    }

    pendingImportPayload = {
      fileName: file.name || "",
      payload: parsedPayload
    };
    syncModeUi();
  } catch (error) {
    console.error("Importdatei konnte nicht vorbereitet werden.", error);
    clearPendingImport();
    showError("Die Datei ist kein gueltiger verschluesselter Export.");
    setFormBusy(false);
  }

  return false;
}

function handleImportButtonClick() {
  if (!authImportInput || authMode !== "setup") {
    return false;
  }

  authImportInput.click();
  return false;
}

function handleImportCancel() {
  clearPendingImport();
  syncModeUi();
  return false;
}

async function handleResetButtonClick() {
  const deleteDatabase = window.Unterrichtsassistent
    && window.Unterrichtsassistent.data
    && typeof window.Unterrichtsassistent.data.deleteDatabase === "function"
      ? window.Unterrichtsassistent.data.deleteDatabase
      : null;
  const confirmed = window.confirm(
    "Der alte Speicherstand wird vollstaendig geloescht und die App beginnt neu. Bitte nur fortfahren, wenn zuvor ein Export oder Backup erstellt wurde. Wirklich loeschen?"
  );

  if (!deleteDatabase || authMode === "setup" || isAuthFormBusy || !confirmed) {
    return false;
  }

  showError("");
  setFormBusy(true);

  try {
    stopAuthAutofillWatcher();

    if (passwordAuthApi && typeof passwordAuthApi.clearUnlockSession === "function") {
      passwordAuthApi.clearUnlockSession();
    }

    clearPendingImport();
    await deleteDatabase();
    authMode = "setup";
    pendingImportPayload = null;
    syncModeUi();
  } catch (error) {
    console.error("Der alte Speicherstand konnte nicht geloescht werden.", error);
    showError("Der alte Speicherstand konnte nicht geloescht werden.");
    setFormBusy(false);
  }

  return false;
}

document.addEventListener("submit", preventLocalOnlyFormSubmit, true);

if (authForm) {
  authForm.addEventListener("submit", handleAuthSubmit);
}

if (authPasswordInput) {
  authPasswordInput.addEventListener("keydown", noteAuthKeyboardInteraction);
  authPasswordInput.addEventListener("input", sampleAuthAutofillState);
  authPasswordInput.addEventListener("change", sampleAuthAutofillState);
  authPasswordInput.addEventListener("focus", function () {
    window.setTimeout(maybeSubmitExistingAutofilledPassword, 40);
  });
}

if (authImportButton) {
  authImportButton.addEventListener("click", handleImportButtonClick);
}

if (authImportCancelButton) {
  authImportCancelButton.addEventListener("click", handleImportCancel);
}

if (authImportInput) {
  authImportInput.addEventListener("change", handleImportFileSelection);
}

if (authResetButton) {
  authResetButton.addEventListener("click", handleResetButtonClick);
}

resolveAuthMode().catch(function (error) {
  console.error("Auth-Seite konnte nicht initialisiert werden.", error);
  showError("Die Passwortseite konnte nicht geladen werden.");
});

window.addEventListener("pagehide", stopAuthAutofillWatcher);
window.addEventListener("pageshow", function () {
  window.setTimeout(maybeSubmitExistingAutofilledPassword, 40);
  window.setTimeout(maybeSubmitExistingAutofilledPassword, 160);
});
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    window.setTimeout(maybeSubmitExistingAutofilledPassword, 40);
  }
});

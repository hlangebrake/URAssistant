const namespace = window.Unterrichtsassistent || {};
const dataLayer = namespace.data || {};
const securityLayer = namespace.security || {};
const RepositoryClass = dataLayer.AppRepository;
const passwordAuthApi = securityLayer.passwordAuth || null;
const repository = RepositoryClass ? new RepositoryClass() : null;
const returnStateStorageKey = "unterrichtsassistent-auth-return-state";
const authUsernameValue = "lokal@unterrichtsassistent";

const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authDescription = document.getElementById("authDescription");
const authUsernameInput = document.getElementById("authUsername");
const authPasswordField = document.getElementById("authPasswordField");
const authPasswordLabel = document.getElementById("authPasswordLabel");
const authPasswordInput = document.getElementById("authPassword");
const authConfirmField = document.getElementById("authConfirmField");
const authConfirmInput = document.getElementById("authPasswordConfirm");
const authError = document.getElementById("authError");
const authSubmitButton = document.getElementById("authSubmitButton");

let authMode = "unlock";

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

async function storePasswordForAutofill(password) {
  if (!window.PasswordCredential || !navigator.credentials || typeof navigator.credentials.store !== "function") {
    return;
  }

  try {
    await navigator.credentials.store(new window.PasswordCredential({
      id: authUsernameValue,
      password: String(password || ""),
      name: "Unterrichtsassistent"
    }));
  } catch (error) {
    void error;
  }
}

function showError(message) {
  if (!authError) {
    return;
  }

  authError.textContent = String(message || "");
  authError.hidden = !message;
}

function setFormBusy(isBusy) {
  const submitLabel = authMode === "setup" ? "Passwort speichern" : "Entsperren";

  if (authSubmitButton) {
    authSubmitButton.disabled = Boolean(isBusy);
    authSubmitButton.textContent = isBusy ? "Bitte warten ..." : submitLabel;
  }

  if (authPasswordInput) {
    authPasswordInput.disabled = Boolean(isBusy);
  }

  if (authConfirmInput) {
    authConfirmInput.disabled = Boolean(isBusy);
  }
}

function syncModeUi() {
  const isSetupMode = authMode === "setup";
  const reason = String(new URLSearchParams(window.location.search).get("reason") || "").trim();
  let description = "Die App ist geschuetzt. Bitte Passwort eingeben, um weiterzuarbeiten.";

  if (reason === "idle") {
    description = "Die App war laenger als 5 Minuten inaktiv und wurde deshalb gesperrt. Bitte Passwort eingeben.";
  } else if (reason === "startup") {
    description = "Nach einem Neustart oder erneuten Oeffnen ist zur Sicherheit wieder das Passwort erforderlich.";
  }

  if (authTitle) {
    authTitle.textContent = isSetupMode ? "Passwort festlegen" : "App entsperren";
  }

  if (authDescription) {
    authDescription.textContent = isSetupMode
      ? "Beim ersten Start wird ein Passwort eingerichtet. Dieses Passwort wird spaeter auch fuer geschuetzte Exporte verwendet."
      : description;
  }

  if (authPasswordLabel) {
    authPasswordLabel.textContent = isSetupMode ? "Neues Passwort" : "Passwort";
  }

  if (authUsernameInput) {
    authUsernameInput.value = authUsernameValue;
  }

  if (authPasswordInput) {
    authPasswordInput.value = "";
    authPasswordInput.setAttribute("autocomplete", isSetupMode ? "new-password" : "current-password");
  }

  if (authConfirmField) {
    authConfirmField.hidden = !isSetupMode;
    authConfirmField.style.display = isSetupMode ? "" : "none";
  }

  if (authConfirmInput) {
    authConfirmInput.value = "";
    authConfirmInput.required = isSetupMode;
    authConfirmInput.disabled = !isSetupMode;
  }

  showError("");
  setFormBusy(false);

  window.setTimeout(function () {
    if (authPasswordInput && typeof authPasswordInput.focus === "function") {
      authPasswordInput.focus();
    }
  }, 0);
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

  syncModeUi();
  return true;
}

async function handleAuthSubmit(event) {
  const password = String(authPasswordInput && authPasswordInput.value || "");
  const passwordConfirm = String(authConfirmInput && authConfirmInput.value || "");
  let authRecord = null;

  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  showError("");

  if (!passwordAuthApi || !passwordAuthApi.ensureCryptoSupport() || !repository) {
    showError("Die Passwortsperre wird in diesem Browser nicht unterstuetzt.");
    return false;
  }

  if (!password.trim()) {
    showError("Bitte ein Passwort eingeben.");
    return false;
  }

  if (authMode === "setup") {
    if (password.length < 6) {
      showError("Bitte ein Passwort mit mindestens 6 Zeichen festlegen.");
      return false;
    }

    if (password !== passwordConfirm) {
      showError("Die Passwortwiederholung stimmt nicht ueberein.");
      return false;
    }
  }

  setFormBusy(true);

  try {
    if (authMode === "setup") {
      authRecord = await passwordAuthApi.createPasswordAuthRecord(password);
      await repository.savePasswordAuthRecord(authRecord);
      await storePasswordForAutofill(password);
    } else {
      authRecord = await repository.loadPasswordAuthRecord();

      if (!authRecord) {
        authMode = "setup";
        syncModeUi();
        showError("Es wurde noch kein Passwort eingerichtet.");
        return false;
      }

      await passwordAuthApi.unlockPasswordAuthRecord(password, authRecord);
    }

    passwordAuthApi.createUnlockSession();
    redirectBackToApp();
  } catch (error) {
    console.error("Authentifizierung fehlgeschlagen.", error);
    showError(authMode === "setup"
      ? "Das Passwort konnte nicht gespeichert werden."
      : "Das Passwort ist nicht korrekt.");
    setFormBusy(false);
  }

  return false;
}

if (authForm) {
  authForm.addEventListener("submit", handleAuthSubmit);
}

resolveAuthMode().catch(function (error) {
  console.error("Auth-Seite konnte nicht initialisiert werden.", error);
  showError("Die Passwortseite konnte nicht geladen werden.");
});

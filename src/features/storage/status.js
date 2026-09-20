window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.features = window.Unterrichtsassistent.features || {};

(function () {
  function nextSaveDelay(firstPendingAt, now, debounceMs, maxWaitMs) {
    return Math.max(0, Math.min(debounceMs, maxWaitMs - Math.max(0, now - firstPendingAt)));
  }

  function formatMoment(value) {
    const date = new Date(value || "");
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("de-DE", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
    });
  }

  function describe(options) {
    const data = options || {};
    const state = data.error ? "error" : data.saving ? "saving" : data.pending ? "pending" : data.stored ? "saved" : "empty";
    const savedTime = formatMoment(data.lastSavedAt);
    const offline = data.offline || {};
    return {
      state: state,
      label: state === "error" ? (data.error.name === "StalePasswordAuthError"
        ? "Anderes App-Fenster hat den Stand ersetzt – bitte sichern und neu öffnen"
        : "Speichern fehlgeschlagen – bitte erneut versuchen")
        : state === "saving" ? "Wird auf diesem Gerät gespeichert …"
          : state === "pending" ? "Änderungen werden gleich gespeichert …"
            : state === "saved" ? "Auf diesem Gerät gespeichert" + (savedTime ? " · " + savedTime : "")
              : "Speicher wird geladen …",
      lastSavedAt: data.lastSavedAt || "",
      lastExportAt: data.lastExportAt || "",
      backupLabel: data.lastExportAt ? "Sicherung erstellt: " + formatMoment(data.lastExportAt) : "Noch keine Sicherung erstellt",
      recoveryAvailable: Boolean(data.recovery && data.recovery.exportedAt),
      recoveryCreatedAt: data.recovery ? data.recovery.exportedAt || "" : "",
      recoveryReason: data.recovery ? data.recovery.reason || "" : "",
      offlineReady: Boolean(offline.ready),
      offlineLabel: offline.label || "Offline-Verfügbarkeit wird geprüft …",
      updateAvailable: Boolean(offline.updateAvailable)
    };
  }

  function render(status) {
    const bar = document.getElementById("storageStatusBar");
    if (!bar) return;
    bar.dataset.state = status.state;
    document.getElementById("storageSaveStatus").textContent = status.label;
    document.getElementById("storageBackupStatus").textContent = status.backupLabel;
    document.getElementById("storageOfflineStatus").textContent = status.offlineLabel;
    document.getElementById("storageRetryButton").hidden = status.state !== "error";
    document.getElementById("storageRecoveryButton").hidden = !status.recoveryAvailable;
    document.getElementById("storageRecoveryNote").textContent = status.recoveryAvailable
      ? "Vorzustand: " + formatMoment(status.recoveryCreatedAt) + " · " + status.recoveryReason + ". Zum Import wird das damalige Passwort benötigt."
      : "Vor dem nächsten Import oder Zusammenführen wird ein verschlüsselter Vorzustand auf diesem Gerät gesichert.";
    if (status.state === "error") bar.open = true;
  }

  function download(payload, fileName) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  function createRecoveryLock(cryptoApi, authApi) {
    let payload = null;
    let fallbackSnapshot = null;
    let authRecord = null;
    return {
      async protect(snapshot, masterKey, passwordRecord) {
        authRecord = passwordRecord;
        // Retain the sole unsaved copy even if encryption itself unexpectedly fails.
        fallbackSnapshot = snapshot;
        try {
          const encrypted = await cryptoApi.encryptSnapshot(snapshot, masterKey);
          payload = { format: "unterrichtsassistent-encrypted-export", version: 1,
            exportedAt: new Date().toISOString(), reason: "Nicht gespeicherte Änderungen vor Sperre",
            passwordAuth: passwordRecord, appState: encrypted };
          fallbackSnapshot = null;
          return true;
        } catch (error) {
          return false;
        }
      },
      async unlock(password) {
        const key = await authApi.unlockPasswordAuthRecord(password, authRecord);
        const snapshot = payload ? await cryptoApi.decryptSnapshot(payload.appState, key) : fallbackSnapshot;
        if (!snapshot) throw new Error("Der gesperrte Stand ist nicht verfügbar.");
        return { snapshot: snapshot, key: key, authRecord: authRecord };
      },
      getPayload() { return payload; },
      clear() { payload = null; fallbackSnapshot = null; authRecord = null; }
    };
  }

  function mountRecoveryLock(onUnlock, onDownload, authConflict) {
    const dialog = document.createElement("dialog");
    dialog.className = "storage-lock";
    dialog.setAttribute("aria-labelledby", "storageLockTitle");
    dialog.innerHTML = '<section class="storage-lock__card"><p class="storage-lock__eyebrow">Unterrichtsassistent · Gesperrt</p>'
      + '<h1 id="storageLockTitle">Änderungen sind noch nicht gespeichert</h1>'
      + '<p>Der lokale Speicher konnte nicht beschrieben werden. Dein Arbeitsstand bleibt in dieser geöffneten App erhalten. Bitte dieses Fenster nicht schließen, bevor du eine Sicherung erstellt hast.</p>'
      + '<p id="storageLockMessage" role="status">Der Arbeitsstand wird geschützt …</p>'
      + '<form data-local-only-form><label>Passwort<input type="password" autocomplete="current-password" required disabled></label>'
      + '<p class="storage-lock__error" role="alert"></p><button type="submit" disabled>Entsperren und weiterarbeiten</button></form>'
      + '<button class="storage-lock__backup" type="button" disabled>Verschlüsselte Sicherung herunterladen</button></section>';
    const previousInert = Array.from(document.body.children).map(function (element) { return { element: element, inert: element.inert }; });
    previousInert.forEach(function (entry) { entry.element.inert = true; });
    document.body.classList.add("is-storage-locked");
    document.body.appendChild(dialog);
    const form = dialog.querySelector("form");
    const password = form.querySelector("input");
    const submit = form.querySelector("button");
    const backup = dialog.querySelector(".storage-lock__backup");
    const message = dialog.querySelector("#storageLockMessage");
    const error = dialog.querySelector(".storage-lock__error");
    if (authConflict) {
      dialog.querySelector("h1").textContent = "Der Datenbestand wurde in einem anderen App-Fenster ersetzt";
      submit.textContent = "Bisherigen Arbeitsstand entsperren";
      dialog.querySelector("h1 + p").textContent = "Deine Änderungen bleiben hier erhalten und überschreiben den neuen Bestand nicht. Lade eine Sicherung herunter und öffne die App danach neu. Zum Entsperren dieses bisherigen Arbeitsstands gilt das bisherige Passwort.";
    }
    dialog.addEventListener("cancel", function (event) { event.preventDefault(); });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submit.disabled = true;
      error.textContent = "";
      onUnlock(password.value).catch(function () {
        error.textContent = "Das Passwort ist nicht korrekt. Der Arbeitsstand bleibt geschützt erhalten.";
        submit.disabled = false;
        password.value = "";
        password.focus();
      });
    });
    backup.addEventListener("click", onDownload);
    dialog.showModal();
    return {
      ready(encrypted) {
        message.textContent = encrypted ? "Der Arbeitsstand ist verschlüsselt. Du kannst ihn jetzt sichern oder mit deinem Passwort entsperren."
          : "Die Sicherungsdatei konnte nicht erzeugt werden. Bitte entsperren und erneut speichern; dieses Fenster geöffnet lassen.";
        password.disabled = false;
        submit.disabled = false;
        backup.disabled = !encrypted;
        password.focus();
      },
      destroy() {
        dialog.close(); dialog.remove();
        document.body.classList.remove("is-storage-locked");
        previousInert.forEach(function (entry) { entry.element.inert = entry.inert; });
      }
    };
  }

  window.Unterrichtsassistent.features.storage = {
    nextSaveDelay: nextSaveDelay, describe: describe, render: render, download: download,
    createRecoveryLock: createRecoveryLock, mountRecoveryLock: mountRecoveryLock
  };
}());

(function () {
  const status = { ready: false, updateAvailable: false, label: "Offline-Verfügbarkeit wird vorbereitet …" };
  window.UnterrichtsassistentOffline = status;

  function publish() {
    const label = document.getElementById("authOfflineStatus");
    if (label) label.textContent = status.label;
    window.dispatchEvent(new CustomEvent("unterrichtsassistent:offline-status", { detail: status }));
  }

  function refresh(registration) {
    status.updateAvailable = Boolean(registration.waiting);
    status.label = status.updateAvailable ? "Update bereit · nach Schließen aller App-Fenster"
      : status.ready ? (navigator.onLine === false ? "Offline · App auf diesem Gerät verfügbar" : "Offline bereit")
        : "Offline-Verfügbarkeit wird vorbereitet …";
    publish();
    if (registration.active && registration.active.state === "activated") {
      const channel = new MessageChannel();
      const timeout = window.setTimeout(function () { channel.port1.close(); }, 1500);
      channel.port1.onmessage = function (event) {
        window.clearTimeout(timeout);
        channel.port1.close();
        status.ready = Boolean(event.data && event.data.ready);
        status.label = status.updateAvailable ? "Update bereit · nach Schließen aller App-Fenster"
          : status.ready ? (navigator.onLine === false ? "Offline · App auf diesem Gerät verfügbar" : "Offline bereit")
            : "Offline-Verfügbarkeit wird vorbereitet …";
        publish();
      };
      registration.active.postMessage({ type: "OFFLINE_STATUS" }, [channel.port2]);
    }
  }

  if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
    status.label = "Offline-Start wird in dieser Umgebung nicht unterstützt";
    publish();
    return;
  }

  navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }).then(function (registration) {
    refresh(registration);
    navigator.serviceWorker.ready.then(function () { refresh(registration); });
    registration.addEventListener("updatefound", function () {
      const worker = registration.installing;
      if (worker) worker.addEventListener("statechange", function () {
        if (worker.state === "redundant") {
          status.label = status.ready ? "Offline bereit · Update fehlgeschlagen" : "Offline-Vorbereitung fehlgeschlagen · bitte online erneut öffnen";
          publish();
        } else {
          window.setTimeout(function () { refresh(registration); }, 0);
        }
      });
    });
    navigator.serviceWorker.addEventListener("controllerchange", function () { refresh(registration); });
    window.addEventListener("online", function () { refresh(registration); registration.update().catch(function () {}); });
    window.addEventListener("offline", function () { refresh(registration); });
  }).catch(function () {
    status.label = "Offline-Start noch nicht vorbereitet · bitte online erneut öffnen";
    publish();
  });
}());

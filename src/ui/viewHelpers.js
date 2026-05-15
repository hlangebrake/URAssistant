(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};

  function escapeValue(value) {
    const sharedEscapeHtml = window.Unterrichtsassistent
      && window.Unterrichtsassistent.shared
      && window.Unterrichtsassistent.shared.html
      && window.Unterrichtsassistent.shared.html.escapeHtml;

    if (typeof sharedEscapeHtml === "function") {
      return sharedEscapeHtml(value);
    }

    return String(value === undefined || value === null ? "" : value)
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

  function parseLocalDate(dateValue) {
    const normalized = String(dateValue || "").slice(0, 10);
    const parts = normalized.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (parts.length !== 3 || Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  function toIsoDate(dateValue) {
    if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
      return "";
    }

    return [
      String(dateValue.getFullYear()).padStart(4, "0"),
      String(dateValue.getMonth() + 1).padStart(2, "0"),
      String(dateValue.getDate()).padStart(2, "0")
    ].join("-");
  }

  function formatDateLabel(dateValue) {
    const parsed = parseLocalDate(dateValue);

    return parsed
      ? parsed.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        })
      : "";
  }

  function formatShortDateLabel(dateValue) {
    const parsed = parseLocalDate(dateValue);

    return parsed
      ? parsed.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit"
        })
      : "";
  }

  function formatLongDateLabel(dateValue) {
    return formatDateLabel(dateValue);
  }

  function normalizeDateValue(value) {
    return String(value || "").slice(0, 10);
  }

  function callApp(methodName, args, fallback) {
    const app = window.UnterrichtsassistentApp || {};
    const method = app[String(methodName || "").trim()];

    if (typeof method !== "function") {
      return typeof fallback === "function" ? fallback() : fallback;
    }

    return method.apply(app, Array.isArray(args) ? args : []);
  }

  window.Unterrichtsassistent.ui.viewHelpers = {
    escapeValue: escapeValue,
    parseLocalDate: parseLocalDate,
    toIsoDate: toIsoDate,
    formatDateLabel: formatDateLabel,
    formatShortDateLabel: formatShortDateLabel,
    formatLongDateLabel: formatLongDateLabel,
    normalizeDateValue: normalizeDateValue,
    callApp: callApp
  };
}());

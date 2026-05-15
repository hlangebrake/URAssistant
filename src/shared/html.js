(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.shared = window.Unterrichtsassistent.shared || {};

  function escapeHtml(value) {
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

  window.Unterrichtsassistent.shared.html = {
    escapeHtml: escapeHtml
  };
}());

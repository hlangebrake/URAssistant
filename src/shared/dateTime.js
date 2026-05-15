(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.shared = window.Unterrichtsassistent.shared || {};

  function toDateValue(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function getTodayDateValue() {
    return toDateValue(new Date());
  }

  function getYesterdayDateValue() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return toDateValue(yesterday);
  }

  function getNowDateParts() {
    const now = new Date();
    const date = toDateValue(now);
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return {
      date: date,
      shortDate: day + "." + month + ".",
      time: hours + ":" + minutes
    };
  }

  function formatDateLabel(dateValue, fallbackLabel) {
    if (!dateValue) {
      return fallbackLabel === undefined ? "offen" : String(fallbackLabel);
    }

    const parts = String(dateValue).split("-");

    if (parts.length !== 3) {
      return String(dateValue);
    }

    return parts[2] + "." + parts[1] + "." + parts[0];
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

  window.Unterrichtsassistent.shared.dateTime = {
    toDateValue: toDateValue,
    getTodayDateValue: getTodayDateValue,
    getYesterdayDateValue: getYesterdayDateValue,
    getNowDateParts: getNowDateParts,
    formatDateLabel: formatDateLabel,
    formatDateTimeLabel: formatDateTimeLabel,
    normalizeDateValue: normalizeDateValue,
    compareDateValues: compareDateValues
  };
}());

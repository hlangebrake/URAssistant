(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.features = window.Unterrichtsassistent.features || {};
  window.Unterrichtsassistent.features.planning = window.Unterrichtsassistent.features.planning || {};

  function parseDate(dateValue) {
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

  function getDayDifference(startDateValue, endDateValue) {
    const startDate = parseDate(startDateValue);
    const endDate = parseDate(endDateValue);

    if (!startDate || !endDate) {
      return 0;
    }

    return Math.max(0, Math.round((Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) / 86400000));
  }

  function addDays(dateValue, dayCount) {
    const parsedDate = parseDate(dateValue);
    const nextDate = parsedDate
      ? new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate())
      : null;

    if (!nextDate) {
      return "";
    }

    nextDate.setDate(nextDate.getDate() + (Number(dayCount) || 0));
    return toIsoDate(nextDate);
  }

  function addMonths(dateValue, monthCount) {
    const parsedDate = parseDate(dateValue);
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

    return toIsoDate(new Date(
      targetYear,
      targetMonthIndex,
      Math.min(parsedDate.getDate(), lastDayOfTargetMonth)
    ));
  }

  function getMonthlyWeekdayOccurrenceDate(dateValue, monthCount) {
    const parsedDate = parseDate(dateValue);
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

    return toIsoDate(new Date(targetYear, targetMonthIndex, candidateDay));
  }

  function normalizeInterval(value) {
    return Math.max(1, Math.round(Number(value) || 1));
  }

  function normalizeUnit(value) {
    const normalizedValue = String(value || "").trim().toLowerCase();

    return ["days", "weeks", "months"].indexOf(normalizedValue) >= 0
      ? normalizedValue
      : "weeks";
  }

  function normalizeUntilDate(value) {
    return String(value || "").slice(0, 10);
  }

  function buildDisplayOccurrence(eventItem, occurrenceIndex) {
    const baseStartDate = String(eventItem && eventItem.startDate || "").slice(0, 10);
    const baseEndDate = String(eventItem && eventItem.endDate || baseStartDate).slice(0, 10) || baseStartDate;
    const isRecurring = Boolean(eventItem && eventItem.isRecurring);
    const recurrenceInterval = normalizeInterval(eventItem && eventItem.recurrenceInterval);
    const recurrenceUnit = normalizeUnit(eventItem && eventItem.recurrenceUnit);
    const monthOffset = recurrenceInterval * occurrenceIndex;
    const startDateValue = occurrenceIndex === 0
      ? baseStartDate
      : (function () {
          if (recurrenceUnit === "days") {
            return addDays(baseStartDate, recurrenceInterval * occurrenceIndex);
          }

          if (recurrenceUnit === "weeks") {
            return addDays(baseStartDate, recurrenceInterval * occurrenceIndex * 7);
          }

          if (eventItem && eventItem.recurrenceMonthlyWeekday) {
            return getMonthlyWeekdayOccurrenceDate(baseStartDate, monthOffset);
          }

          return addMonths(baseStartDate, monthOffset);
        }());
    const endDateValue = addDays(startDateValue, getDayDifference(baseStartDate, baseEndDate));

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

  function doesOccurrenceOverlapRange(eventItem, rangeStartDate, rangeEndDate) {
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

  function getEventsForDisplay(events, options) {
    const sourceEvents = Array.isArray(events) ? events : [];
    const rangeOptions = options && typeof options === "object"
      ? options
      : {};
    const rangeStartDate = String(rangeOptions.rangeStart || "").slice(0, 10);
    const rangeEndDate = String(rangeOptions.rangeEnd || "").slice(0, 10);
    const renderedEvents = [];

    sourceEvents.forEach(function (eventItem) {
      const normalizedStartDate = String(eventItem && eventItem.startDate || "").slice(0, 10);
      const normalizedUntilDate = normalizeUntilDate(eventItem && eventItem.recurrenceUntilDate);
      const isRecurring = Boolean(eventItem && eventItem.isRecurring) && Boolean(normalizedStartDate) && Boolean(normalizedUntilDate);
      let occurrenceIndex = 0;
      let occurrence = buildDisplayOccurrence(eventItem, occurrenceIndex);

      if (!occurrence) {
        return;
      }

      while (occurrence) {
        if (occurrenceIndex === 0 || (isRecurring && String(occurrence.startDate || "").slice(0, 10) <= normalizedUntilDate)) {
          if (doesOccurrenceOverlapRange(occurrence, rangeStartDate, rangeEndDate)) {
            renderedEvents.push(occurrence);
          }
        } else {
          break;
        }

        if (!isRecurring) {
          break;
        }

        occurrenceIndex += 1;
        occurrence = buildDisplayOccurrence(eventItem, occurrenceIndex);

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

  window.Unterrichtsassistent.features.planning.recurrence = {
    parseDate: parseDate,
    toIsoDate: toIsoDate,
    getDayDifference: getDayDifference,
    addDays: addDays,
    addMonths: addMonths,
    getMonthlyWeekdayOccurrenceDate: getMonthlyWeekdayOccurrenceDate,
    normalizeInterval: normalizeInterval,
    normalizeUnit: normalizeUnit,
    normalizeUntilDate: normalizeUntilDate,
    buildDisplayOccurrence: buildDisplayOccurrence,
    doesOccurrenceOverlapRange: doesOccurrenceOverlapRange,
    getEventsForDisplay: getEventsForDisplay
  };
}());

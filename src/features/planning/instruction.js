(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.features = window.Unterrichtsassistent.features || {};
  window.Unterrichtsassistent.features.planning = window.Unterrichtsassistent.features.planning || {};

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

  function defaultTimeValueToMinutes(value, fallbackValue) {
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

  function doesPlanningEventAffectLessonTime(eventItem, lessonStartTime, lessonEndTime, options) {
    const timeValueToMinutes = options && typeof options.timeValueToMinutes === "function"
      ? options.timeValueToMinutes
      : defaultTimeValueToMinutes;
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

  function getPlanningInstructionOutageInfo(snapshot, classId, lessonDate, lessonStartTime, lessonEndTime, options) {
    const getEventsForDisplay = options && typeof options.getEventsForDisplay === "function"
      ? options.getEventsForDisplay
      : function () {
          return [];
        };
    const normalizedLessonDate = String(lessonDate || "").slice(0, 10);
    const displayEvents = normalizedLessonDate
      ? getEventsForDisplay(snapshot, {
          rangeStart: normalizedLessonDate,
          rangeEnd: normalizedLessonDate
        })
      : [];
    const matchingEvents = displayEvents.filter(function (eventItem) {
      return doesPlanningEventCauseInstructionOutage(eventItem)
        && doesPlanningEventAffectClass(snapshot, eventItem, classId)
        && doesPlanningEventAffectLessonTime(eventItem, lessonStartTime, lessonEndTime, options);
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

  window.Unterrichtsassistent.features.planning.instruction = {
    getPlanningEventTargetClassIds: getPlanningEventTargetClassIds,
    doesPlanningEventCauseInstructionOutage: doesPlanningEventCauseInstructionOutage,
    doesPlanningEventAffectClass: doesPlanningEventAffectClass,
    doesPlanningEventAffectLessonTime: doesPlanningEventAffectLessonTime,
    getPlanningInstructionOutageInfo: getPlanningInstructionOutageInfo
  };
}());

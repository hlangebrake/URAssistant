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

  // All views consume the same dated units. Cancelled units remain in occurrences
  // for the calendar, but never consume a curriculum slot.
  function buildInstructionSchedule(snapshot, service, classId, options) {
    const source = snapshot || {};
    const settings = options || {};
    const normalizedClassId = String(classId || "").trim();
    const result = { occurrences: [], slots: [], lessons: [], occurrenceLookup: {}, seriesAssignments: {}, sequenceAssignments: {}, lessonPlanAssignments: {} };
    result.lessonOccurrences = result.occurrences;
    result.lessonSlots = result.slots;
    const curriculum = window.Unterrichtsassistent.features.curriculum && window.Unterrichtsassistent.features.curriculum.planning;
    const collections = { series: source.curriculumSeries || [], sequences: source.curriculumSequences || [], lessons: source.curriculumLessonPlans || [] };
    const statusItems = (source.planningInstructionLessonStatuses || []).filter(function (item) { return item.classId === normalizedClassId; });
    const referenceDate = settings.referenceDate || (service && service.getReferenceDate ? service.getReferenceDate() : new Date());
    const occurrenceMap = {};
    const lessonMap = {};
    let start = parseDate(source.schoolYearStart);
    let end = parseDate(source.schoolYearEnd);
    result.hasSchoolYearRange = Boolean(start && end && start <= end);
    if (!result.hasSchoolYearRange) {
      start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
      end = new Date(start.getTime());
      end.setDate(end.getDate() + 13);
    }
    result.rangeStart = dateValue(start);
    result.rangeEnd = dateValue(end);
    if (!normalizedClassId || !start || !end || start > end || !service || !service.getLessonUnitsForClass) { return result; }

    function parseDate(value) {
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ""));
      if (!match) { return null; }
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      return Number.isNaN(date.getTime()) ? null : date;
    }
    function dateValue(date) { return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"); }
    function isPast(date, time) {
      if (!time) { return date < dateValue(referenceDate); }
      const moment = parseDate(date);
      moment.setHours(Number(time.slice(0, 2)) || 0, Number(time.slice(3, 5)) || 0, 59, 999);
      return moment < referenceDate;
    }
    function eventsForDate(currentSnapshot, range) {
      if (settings.getEventsForDisplay) { return settings.getEventsForDisplay(currentSnapshot, range); }
      return (currentSnapshot.planningEvents || []).filter(function (item) {
        return String(item.startDate || "").slice(0, 10) <= range.rangeStart && String(item.endDate || item.startDate || "").slice(0, 10) >= range.rangeStart;
      });
    }
    function addUnit(unit, occurrence) {
      occurrence.lessonCount += 1;
      if (unit.isCancelled) {
        occurrence.cancelledLessonCount += 1;
        occurrence.cancelReason = occurrence.cancelReason || unit.cancelReason;
        return;
      }
      occurrence.remainingLessonCount += isPast(unit.lessonDate, unit.endTime) ? 0 : 1;
      result.slots.push(unit);
      const key = unit.lessonId;
      if (!lessonMap[key]) {
        lessonMap[key] = {
          id: key, recordLessonId: unit.recordLessonId, classId: normalizedClassId, lessonDate: unit.lessonDate, sourceRowId: unit.sourceRowId,
          occurrenceId: occurrence.id, startTime: unit.startTime, endTime: unit.endTime, room: unit.room || "",
          weekday: parseDate(unit.lessonDate).getDay(), isAdditionalLesson: Boolean(unit.isAdditionalLesson),
          additionalLessonId: unit.additionalLessonId || "", slots: [], lessonPlanIds: []
        };
      }
      const lesson = lessonMap[key];
      lesson.slots.push(unit);
      if (unit.startTime && (!lesson.startTime || unit.startTime < lesson.startTime)) { lesson.startTime = unit.startTime; }
      if (unit.endTime > lesson.endTime) { lesson.endTime = unit.endTime; }
    }
    function newOccurrence(id, day, extra) {
      const occurrence = Object.assign({ id: id, classId: normalizedClassId, lessonDate: day, lessonCount: 0, cancelledLessonCount: 0, remainingLessonCount: 0, isCancelled: false, cancelReason: "" }, extra || {});
      occurrenceMap[id] = occurrence;
      return occurrence;
    }
    for (let cursor = new Date(start.getTime()); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const day = dateValue(cursor);
      const status = statusItems.find(function (item) { return !item.isAdditionalLesson && String(item.lessonDate || "").slice(0, 10) === day; });
      const timetable = service.getCurrentTimetable ? service.getCurrentTimetable(cursor) : null;
      const rows = timetable && service.getTimetableRows ? service.getTimetableRows(timetable) : [];
      service.getLessonUnitsForClass(normalizedClassId, cursor).forEach(function (block) {
        const sourceId = String(block.sourceRowId || block.id || "");
        const weekday = String(cursor.getDay());
        const blockRows = rows.filter(function (row) {
          const cell = row.cells && row.cells[weekday];
          return row.type === "lesson" && cell && String(cell.isBlocked ? cell.inheritedClassId : cell.classId) === normalizedClassId
            && String(cell.isBlocked ? (cell.sourceRowId || row.id) : row.id) === sourceId;
        });
        const units = blockRows.length ? blockRows : [{ id: sourceId, startTime: block.startTime, endTime: block.endTime }];
        const occurrenceId = "unterrichtstag::" + day;
        const occurrence = occurrenceMap[occurrenceId] || newOccurrence(occurrenceId, day);
        units.forEach(function (row, index) {
          const outage = getPlanningInstructionOutageInfo(source, normalizedClassId, day, row.startTime, row.endTime, { getEventsForDisplay: eventsForDate });
          addUnit({
            id: [normalizedClassId, day, sourceId, row.id || index].join("::"),
            lessonId: [normalizedClassId, day, sourceId].join("::"), recordLessonId: block.id || "timetable-" + weekday + "-" + sourceId, classId: normalizedClassId,
            occurrenceId: occurrenceId, lessonDate: day, sourceRowId: sourceId,
            startTime: String(row.startTime || block.startTime || ""), endTime: String(row.endTime || block.endTime || ""),
            room: block.room || "", unitIndex: index, unitCount: units.length,
            isCancelled: Boolean(status && status.isCancelled) || outage.isCancelled,
            cancelReason: String(status && status.cancelReason || outage.reason || outage.title || ""),
            assignedSeriesId: "", assignedSequenceId: "", assignedLessonId: "", assignedColor: ""
          }, occurrence);
        });
      });
    }
    statusItems.filter(function (item) { return item.isAdditionalLesson; }).forEach(function (item) {
      const day = String(item.lessonDate || "").slice(0, 10);
      if (!item.id || day < dateValue(start) || day > dateValue(end)) { return; }
      const count = item.additionalLessonType === "double" ? 2 : 1;
      const occurrenceId = "zusatzstunde::" + item.id;
      const startTime = String(item.additionalStartTime || "");
      const endTime = String(item.additionalEndTime || "");
      const occurrence = newOccurrence(occurrenceId, day, {
        isAdditionalLesson: true, additionalLessonId: item.id, additionalLessonType: count === 2 ? "double" : "single",
        additionalLessonNote: item.additionalLessonNote || "", startTime: startTime, endTime: endTime
      });
      const from = defaultTimeValueToMinutes(startTime, null);
      const to = defaultTimeValueToMinutes(endTime, null);
      function timeLabel(minutes) { return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0"); }
      for (let index = 0; index < count; index += 1) {
        const timed = Boolean(startTime && endTime && to > from);
        const unitStart = timed ? timeLabel(Math.round(from + ((to - from) * index / count))) : "";
        const unitEnd = timed ? timeLabel(Math.round(from + ((to - from) * (index + 1) / count))) : "";
        addUnit({
          id: [normalizedClassId, occurrenceId, index].join("::"), lessonId: [normalizedClassId, occurrenceId].join("::"), recordLessonId: occurrenceId,
          classId: normalizedClassId, occurrenceId: occurrenceId, lessonDate: day, sourceRowId: occurrenceId,
          startTime: unitStart, endTime: unitEnd, unitIndex: index, unitCount: count,
          isAdditionalLesson: true, additionalLessonId: item.id, isCancelled: false,
          assignedSeriesId: "", assignedSequenceId: "", assignedLessonId: "", assignedColor: ""
        }, occurrence);
      }
    });
    result.slots.sort(function (a, b) { return [a.lessonDate, a.startTime || "24:00", a.id].join("|").localeCompare([b.lessonDate, b.startTime || "24:00", b.id].join("|"), undefined, { numeric: true }); });
    result.slots.forEach(function (slot, index) { slot.slotIndex = index; });
    result.occurrences = Object.keys(occurrenceMap).map(function (key) {
      const occurrence = occurrenceMap[key];
      occurrence.isCancelled = occurrence.lessonCount > 0 && occurrence.cancelledLessonCount === occurrence.lessonCount;
      return occurrence;
    }).sort(function (a, b) { return [a.lessonDate, a.startTime || "", a.id].join("|").localeCompare([b.lessonDate, b.startTime || "", b.id].join("|")); });

    function assign(items, slots, field, target, demandForItem, parentKey) {
      let nextIndex = 0;
      items.forEach(function (item) {
        const demand = demandForItem(item);
        const assignment = { firstDate: "", lastDate: "", assignedUnitCount: 0, color: item.color || "#d9d4cb" };
        if (parentKey) { assignment[parentKey] = item[parentKey]; }
        target[item.id] = assignment;
        if (field === "assignedSeriesId" && item.startMode === "manual" && item.startDate) {
          while (nextIndex < slots.length && slots[nextIndex].lessonDate < String(item.startDate).slice(0, 10)) { nextIndex += 1; }
        }
        for (let used = 0; used < demand && nextIndex < slots.length; used += 1, nextIndex += 1) {
          const slot = slots[nextIndex];
          slot[field] = item.id;
          if (field === "assignedSeriesId") { slot.assignedColor = assignment.color; }
          assignment.firstDate = assignment.firstDate || slot.lessonDate;
          assignment.lastDate = slot.lessonDate;
          assignment.assignedUnitCount += 1;
        }
        assignment.unassignedDemand = Math.max(0, demand - assignment.assignedUnitCount);
        assignment.hasUnassignedDemand = assignment.unassignedDemand > 0;
        assignment.hasWarning = assignment.hasUnassignedDemand;
      });
    }
    if (curriculum) {
      const series = curriculum.getOrderedSeriesForClass(collections, normalizedClassId);
      assign(series, result.slots, "assignedSeriesId", result.seriesAssignments, function (item) { return Math.max(0, Number(item.hourDemand) || 0); });
      series.forEach(function (item) {
        const sequences = curriculum.getOrderedSequencesForSeries(collections, item.id);
        assign(sequences, result.slots.filter(function (slot) { return slot.assignedSeriesId === item.id; }), "assignedSequenceId", result.sequenceAssignments, function (sequence) { return Math.max(0, Number(sequence.hourDemand) || 0); }, "seriesId");
        sequences.forEach(function (sequence) {
          assign(curriculum.getOrderedLessonsForSequence(collections, sequence.id), result.slots.filter(function (slot) { return slot.assignedSequenceId === sequence.id; }), "assignedLessonId", result.lessonPlanAssignments, curriculum.getLessonHourDemand, "sequenceId");
        });
      });
    }
    result.occurrences.forEach(function (occurrence) {
      const slots = result.slots.filter(function (slot) { return slot.occurrenceId === occurrence.id; });
      function unique(field) { return slots.map(function (slot) { return slot[field]; }).filter(Boolean).filter(function (id, index, ids) { return ids.indexOf(id) === index; }); }
      const entry = {
        occurrence: occurrence, totalUnits: occurrence.lessonCount, availableUnits: occurrence.remainingLessonCount,
        isCancelled: occurrence.isCancelled, cancelReason: occurrence.cancelReason,
        assignmentColors: slots.map(function (slot) { return slot.assignedColor; }).filter(Boolean),
        assignmentSeriesIds: unique("assignedSeriesId"), assignmentSequenceIds: unique("assignedSequenceId"), assignmentLessonIds: unique("assignedLessonId")
      };
      entry.hasSeriesConflict = entry.assignmentSeriesIds.length > 1;
      entry.hasSequenceConflict = entry.assignmentSequenceIds.length > 1;
      entry.hasProblem = entry.hasSeriesConflict || entry.hasSequenceConflict;
      if (entry.hasSeriesConflict) { entry.assignmentSeriesIds.forEach(function (id) { result.seriesAssignments[id].hasWarning = true; }); }
      if (entry.hasSequenceConflict) { entry.assignmentSequenceIds.forEach(function (id) { result.sequenceAssignments[id].hasWarning = true; }); }
      if (entry.assignmentLessonIds.length > 1) { entry.assignmentLessonIds.forEach(function (id) { result.lessonPlanAssignments[id].hasSplitOccurrence = true; }); }
      result.occurrenceLookup[occurrence.id] = entry;
    });
    Object.keys(result.lessonPlanAssignments).forEach(function (id) {
      const assignment = result.lessonPlanAssignments[id];
      const lesson = collections.lessons.find(function (item) { return item.id === id; });
      const blocks = result.slots.filter(function (slot) { return slot.assignedLessonId === id; }).map(function (slot) { return slot.lessonId; }).filter(function (key, index, keys) { return keys.indexOf(key) === index; });
      if (lesson && lesson.hourType === "double" && blocks.length > 1) { assignment.hasSplitOccurrence = true; assignment.hasWarning = true; }
      if (assignment.hasWarning && result.sequenceAssignments[assignment.sequenceId]) { result.sequenceAssignments[assignment.sequenceId].hasWarning = true; }
    });
    Object.keys(result.sequenceAssignments).forEach(function (id) {
      const assignment = result.sequenceAssignments[id];
      if (assignment.hasWarning && result.seriesAssignments[assignment.seriesId]) { result.seriesAssignments[assignment.seriesId].hasWarning = true; }
    });
    Object.keys(result.occurrenceLookup).forEach(function (id) {
      const entry = result.occurrenceLookup[id];
      entry.hasProblem = entry.hasProblem || entry.assignmentLessonIds.some(function (lessonId) { return result.lessonPlanAssignments[lessonId].hasWarning; });
    });
    result.lessons = Object.keys(lessonMap).map(function (key) {
      const lesson = lessonMap[key];
      lesson.slots.sort(function (a, b) { return a.slotIndex - b.slotIndex; });
      lesson.lessonPlanIds = lesson.slots.map(function (slot) { return slot.assignedLessonId; }).filter(Boolean).filter(function (id, index, ids) { return ids.indexOf(id) === index; });
      lesson.unitCount = lesson.slots.length;
      return lesson;
    }).sort(function (a, b) { return [a.lessonDate, a.startTime || "24:00", a.id].join("|").localeCompare([b.lessonDate, b.startTime || "24:00", b.id].join("|")); });
    // Compatibility names used by the existing planning view.
    result.lessonOccurrences = result.occurrences;
    result.lessonSlots = result.slots;
    return result;
  }

  window.Unterrichtsassistent.features.planning.instruction = {
    getPlanningEventTargetClassIds: getPlanningEventTargetClassIds,
    doesPlanningEventCauseInstructionOutage: doesPlanningEventCauseInstructionOutage,
    doesPlanningEventAffectClass: doesPlanningEventAffectClass,
    doesPlanningEventAffectLessonTime: doesPlanningEventAffectLessonTime,
    getPlanningInstructionOutageInfo: getPlanningInstructionOutageInfo,
    buildInstructionSchedule: buildInstructionSchedule
  };
}());

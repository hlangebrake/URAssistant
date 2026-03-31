window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.stundenplan = {
  id: "stundenplan",
  title: "Stundenplan",
  render: function (service) {
    const viewMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getTimetableViewMode === "function"
      ? window.UnterrichtsassistentApp.getTimetableViewMode()
      : "ansicht";
    const isManageMode = viewMode === "verwalten";
    const referenceDate = service.getReferenceDate();
    const timetable = isManageMode ? service.getManagedTimetable() : service.getCurrentTimetable(referenceDate);
    const rows = timetable ? service.getTimetableRows(timetable) : [];
    const weekdays = service.getWeekdays();
    const classes = service.getAllClasses();
    const snapshot = service && service.snapshot ? service.snapshot : {};
    const planningEvents = Array.isArray(snapshot.planningEvents) ? snapshot.planningEvents : [];
    const schoolYearStart = String(snapshot.schoolYearStart || "").slice(0, 10);
    const schoolYearEnd = String(snapshot.schoolYearEnd || "").slice(0, 10);
    const planningInstructionLessonDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActivePlanningInstructionLessonDraft === "function"
      ? window.UnterrichtsassistentApp.getActivePlanningInstructionLessonDraft()
      : null;
    const timetableWeekShiftAnimationDirection = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getTimetableWeekShiftAnimationDirection === "function"
      ? window.UnterrichtsassistentApp.getTimetableWeekShiftAnimationDirection()
      : "";
    const lessonStatusLookup = (Array.isArray(snapshot.planningInstructionLessonStatuses) ? snapshot.planningInstructionLessonStatuses : []).reduce(function (lookup, statusItem) {
      const classId = String(statusItem && statusItem.classId || "").trim();
      const lessonDate = String(statusItem && statusItem.lessonDate || "").slice(0, 10);

      if (classId && lessonDate) {
        lookup[[classId, lessonDate].join("::")] = statusItem;
      }

      return lookup;
    }, {});
    const seriesLookup = (Array.isArray(snapshot.curriculumSeries) ? snapshot.curriculumSeries : []).reduce(function (lookup, entry) {
      const entryId = String(entry && entry.id || "").trim();

      if (entryId) {
        lookup[entryId] = entry;
      }

      return lookup;
    }, {});
    const sequenceLookup = (Array.isArray(snapshot.curriculumSequences) ? snapshot.curriculumSequences : []).reduce(function (lookup, entry) {
      const entryId = String(entry && entry.id || "").trim();

      if (entryId) {
        lookup[entryId] = entry;
      }

      return lookup;
    }, {});
    const lessonPlanLookup = (Array.isArray(snapshot.curriculumLessonPlans) ? snapshot.curriculumLessonPlans : []).reduce(function (lookup, entry) {
      const entryId = String(entry && entry.id || "").trim();

      if (entryId) {
        lookup[entryId] = entry;
      }

      return lookup;
    }, {});
    const instructionAssignmentCache = {};

    function escapeValue(value) {
      return String(value || "")
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

    function timeToMinutes(timeValue) {
      const parts = String(timeValue || "").split(":");
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);

      if (parts.length !== 2 || Number.isNaN(hours) || Number.isNaN(minutes)) {
        return 0;
      }

      return (hours * 60) + minutes;
    }

    function parseLocalDate(dateValue) {
      const parts = String(dateValue || "").split("-");
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

    function formatShortDateLabel(dateValue) {
      const normalizedDate = String(dateValue || "").slice(0, 10);

      if (!normalizedDate) {
        return "";
      }

      return normalizedDate.slice(8, 10) + "." + normalizedDate.slice(5, 7) + ".";
    }

    function getInstructionOccurrenceId(lessonDateValue) {
      return "unterrichtstag::" + String(lessonDateValue || "").slice(0, 10);
    }

    function getUniqueIds(values) {
      return (Array.isArray(values) ? values : []).map(function (entry) {
        return String(entry || "").trim();
      }).filter(Boolean).filter(function (entry, index, source) {
        return source.indexOf(entry) === index;
      });
    }

    function normalizePlanningCategoryKey(value) {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
    }

    function isInstructionFreeDateValue(isoDate) {
      return planningEvents.some(function (eventItem) {
        const category = normalizePlanningCategoryKey(eventItem && eventItem.category);
        const startDateValue = String(eventItem && eventItem.startDate || "").slice(0, 10);
        const endDateValue = String(eventItem && eventItem.endDate || startDateValue).slice(0, 10);

        return category === "unterrichtsfrei" && startDateValue && startDateValue <= isoDate && isoDate <= endDateValue;
      });
    }

    function getPlanningCategoryColorValue(categoryName) {
      if (window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningCategoryColor === "function") {
        return window.UnterrichtsassistentApp.getPlanningCategoryColor(categoryName);
      }

      return "#d9d4cb";
    }

    function isInstructionOutageCategoryValue(value) {
      const normalizedValue = normalizePlanningCategoryKey(value);

      return normalizedValue === "unterrichtsfrei" || normalizedValue === "unterrichtsausfall";
    }

    function getInstructionOutageEventForDate(isoDate) {
      return planningEvents.filter(function (eventItem) {
        const category = eventItem && eventItem.category;
        const startDateValue = String(eventItem && eventItem.startDate || "").slice(0, 10);
        const endDateValue = String(eventItem && eventItem.endDate || startDateValue).slice(0, 10);

        return isInstructionOutageCategoryValue(category)
          && startDateValue
          && startDateValue <= isoDate
          && isoDate <= endDateValue;
      }).sort(function (leftItem, rightItem) {
        const leftPriority = [1, 2, 3].indexOf(Number(leftItem && leftItem.priority)) >= 0 ? Number(leftItem.priority) : 2;
        const rightPriority = [1, 2, 3].indexOf(Number(rightItem && rightItem.priority)) >= 0 ? Number(rightItem.priority) : 2;

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        return String(leftItem && leftItem.title || "").localeCompare(String(rightItem && rightItem.title || ""));
      })[0] || null;
    }

    function getWeekDates() {
      const today = new Date(referenceDate);
      const currentDay = today.getDay();
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(today);
      const datesByKey = {};

      monday.setHours(0, 0, 0, 0);
      monday.setDate(today.getDate() + distanceToMonday);

      weekdays.forEach(function (weekday, index) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        const isoDate = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
        datesByKey[weekday.key] = {
          label: String(date.getDate()).padStart(2, "0") + "." + String(date.getMonth() + 1).padStart(2, "0") + ".",
          isoDate: isoDate
        };
      });

      return datesByKey;
    }

    function formatDateValue(dateValue) {
      if (!dateValue) {
        return "";
      }

      return String(dateValue).slice(0, 10);
    }

    function getClassDisplayName(schoolClass) {
      return [schoolClass.name || "", schoolClass.subject || ""].join(" ").trim();
    }

    function getClassById(classId) {
      return classes.find(function (schoolClass) {
        return schoolClass.id === classId;
      }) || null;
    }

    function getClassDisplayColor(schoolClass) {
      if (window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getClassDisplayColor === "function") {
        return window.UnterrichtsassistentApp.getClassDisplayColor(schoolClass);
      }

      return "#d9d4cb";
    }

    function getOrderedCurriculumSeriesForClass(classId) {
      const items = (Array.isArray(snapshot.curriculumSeries) ? snapshot.curriculumSeries : []).filter(function (entry) {
        return String(entry && entry.classId || "").trim() === String(classId || "").trim();
      });
      const incomingCounts = {};
      const itemById = {};
      const ordered = [];
      let current = null;

      items.forEach(function (entry) {
        const entryId = String(entry && entry.id || "").trim();

        if (!entryId) {
          return;
        }

        itemById[entryId] = entry;
        incomingCounts[entryId] = incomingCounts[entryId] || 0;
      });

      items.forEach(function (entry) {
        const nextId = String(entry && entry.nextSeriesId || "").trim();

        if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
          incomingCounts[nextId] += 1;
        }
      });

      current = items.find(function (entry) {
        return !incomingCounts[String(entry && entry.id || "").trim()];
      }) || items[0] || null;

      while (current) {
        const currentId = String(current && current.id || "").trim();
        const nextId = String(current && current.nextSeriesId || "").trim();

        if (!currentId || ordered.some(function (entry) {
          return String(entry && entry.id || "").trim() === currentId;
        })) {
          break;
        }

        ordered.push(current);
        current = nextId && itemById[nextId] ? itemById[nextId] : null;
      }

      items.forEach(function (entry) {
        if (!ordered.some(function (orderedEntry) {
          return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
        })) {
          ordered.push(entry);
        }
      });

      return ordered;
    }

    function getOrderedCurriculumSequencesForSeries(seriesId) {
      const items = (Array.isArray(snapshot.curriculumSequences) ? snapshot.curriculumSequences : []).filter(function (entry) {
        return String(entry && entry.seriesId || "").trim() === String(seriesId || "").trim();
      });
      const incomingCounts = {};
      const itemById = {};
      const ordered = [];
      let current = null;

      items.forEach(function (entry) {
        const entryId = String(entry && entry.id || "").trim();

        if (!entryId) {
          return;
        }

        itemById[entryId] = entry;
        incomingCounts[entryId] = incomingCounts[entryId] || 0;
      });

      items.forEach(function (entry) {
        const nextId = String(entry && entry.nextSequenceId || "").trim();

        if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
          incomingCounts[nextId] += 1;
        }
      });

      current = items.find(function (entry) {
        return !incomingCounts[String(entry && entry.id || "").trim()];
      }) || items[0] || null;

      while (current) {
        const currentId = String(current && current.id || "").trim();
        const nextId = String(current && current.nextSequenceId || "").trim();

        if (!currentId || ordered.some(function (entry) {
          return String(entry && entry.id || "").trim() === currentId;
        })) {
          break;
        }

        ordered.push(current);
        current = nextId && itemById[nextId] ? itemById[nextId] : null;
      }

      items.forEach(function (entry) {
        if (!ordered.some(function (orderedEntry) {
          return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
        })) {
          ordered.push(entry);
        }
      });

      return ordered;
    }

    function getOrderedCurriculumLessonsForSequence(sequenceId) {
      const items = (Array.isArray(snapshot.curriculumLessonPlans) ? snapshot.curriculumLessonPlans : []).filter(function (entry) {
        return String(entry && entry.sequenceId || "").trim() === String(sequenceId || "").trim();
      });
      const incomingCounts = {};
      const itemById = {};
      const ordered = [];
      let current = null;

      items.forEach(function (entry) {
        const entryId = String(entry && entry.id || "").trim();

        if (!entryId) {
          return;
        }

        itemById[entryId] = entry;
        incomingCounts[entryId] = incomingCounts[entryId] || 0;
      });

      items.forEach(function (entry) {
        const nextId = String(entry && entry.nextLessonId || "").trim();

        if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
          incomingCounts[nextId] += 1;
        }
      });

      current = items.find(function (entry) {
        return !incomingCounts[String(entry && entry.id || "").trim()];
      }) || items[0] || null;

      while (current) {
        const currentId = String(current && current.id || "").trim();
        const nextId = String(current && current.nextLessonId || "").trim();

        if (!currentId || ordered.some(function (entry) {
          return String(entry && entry.id || "").trim() === currentId;
        })) {
          break;
        }

        ordered.push(current);
        current = nextId && itemById[nextId] ? itemById[nextId] : null;
      }

      items.forEach(function (entry) {
        if (!ordered.some(function (orderedEntry) {
          return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
        })) {
          ordered.push(entry);
        }
      });

      return ordered;
    }

    function getCurriculumLessonHourDemand(lessonItem) {
      return String(lessonItem && lessonItem.hourType || "").trim() === "double" ? 2 : 1;
    }

    function hexToRgb(hexColor) {
      const normalized = String(hexColor || "").replace("#", "");
      const fullHex = normalized.length === 3
        ? normalized.split("").map(function (char) {
            return char + char;
          }).join("")
        : normalized;

      return {
        r: parseInt(fullHex.slice(0, 2), 16),
        g: parseInt(fullHex.slice(2, 4), 16),
        b: parseInt(fullHex.slice(4, 6), 16)
      };
    }

    function buildLessonBoxStyle(schoolClass) {
      const color = getClassDisplayColor(schoolClass);
      const rgb = hexToRgb(color);

      return [
        "background: linear-gradient(180deg, rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.98), rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.88));",
        "box-shadow: 0 16px 32px rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.22);",
        "border: 1px solid rgba(" + Math.max(rgb.r - 30, 0) + ", " + Math.max(rgb.g - 30, 0) + ", " + Math.max(rgb.b - 30, 0) + ", 0.3);",
        "color: var(--text);"
      ].join(" ");
    }

    function buildInstructionLessonOccurrencesForClass(classId) {
      const occurrencesByDate = {};
      const startDate = parseLocalDate(schoolYearStart);
      const endDate = parseLocalDate(schoolYearEnd);
      const cursor = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : null;
      const lastDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

      function isLessonOccurrencePast(lessonDateValue, lessonEndTime) {
        const lessonDate = parseLocalDate(lessonDateValue);
        const endTimeValue = String(lessonEndTime || "").trim();
        let endMoment;

        if (!referenceDate || !lessonDate) {
          return false;
        }

        if (!endTimeValue) {
          return lessonDateValue < toIsoDate(referenceDate);
        }

        endMoment = new Date(
          lessonDate.getFullYear(),
          lessonDate.getMonth(),
          lessonDate.getDate(),
          Number(endTimeValue.slice(0, 2)) || 0,
          Number(endTimeValue.slice(3, 5)) || 0,
          59,
          999
        );

        return endMoment < referenceDate;
      }

      if (!classId || !cursor || !lastDate || !service || typeof service.getLessonUnitsForClass !== "function") {
        return [];
      }

      while (cursor <= lastDate) {
        const isoDate = toIsoDate(cursor);

        if (!isInstructionFreeDateValue(isoDate)) {
          service.getLessonUnitsForClass(classId, cursor).forEach(function (lessonUnit) {
            const currentTimetable = typeof service.getCurrentTimetable === "function"
              ? service.getCurrentTimetable(cursor)
              : null;
            const timetableRows = currentTimetable && typeof service.getTimetableRows === "function"
              ? service.getTimetableRows(currentTimetable)
              : [];
            const weekdayKey = String(Number(lessonUnit && lessonUnit.weekday));
            const sourceRowId = String(lessonUnit && lessonUnit.sourceRowId || "");
            const lessonCount = timetableRows.filter(function (row) {
              const cell = row && row.cells ? row.cells[weekdayKey] : null;
              const effectiveClassId = row && row.type === "lesson" && cell
                ? (cell.isBlocked ? cell.inheritedClassId : cell.classId)
                : "";
              const effectiveSourceRowId = row && row.type === "lesson" && cell
                ? String(cell.isBlocked ? (cell.sourceRowId || row.id) : row.id)
                : "";

              return effectiveClassId === classId && effectiveSourceRowId === sourceRowId;
            }).length || 1;

            if (!occurrencesByDate[isoDate]) {
              const lessonStatus = lessonStatusLookup[[String(classId || "").trim(), isoDate].join("::")] || null;

              occurrencesByDate[isoDate] = {
                id: getInstructionOccurrenceId(isoDate),
                lessonDate: isoDate,
                lessonCount: 0,
                remainingLessonCount: 0,
                isCancelled: Boolean(lessonStatus && lessonStatus.isCancelled),
                cancelReason: String(lessonStatus && lessonStatus.cancelReason || "").trim()
              };
            }

            occurrencesByDate[isoDate].lessonCount += Math.max(1, lessonCount);

            if (!occurrencesByDate[isoDate].isCancelled && !isLessonOccurrencePast(isoDate, lessonUnit && lessonUnit.endTime)) {
              occurrencesByDate[isoDate].remainingLessonCount += Math.max(1, lessonCount);
            }
          });
        }

        cursor.setDate(cursor.getDate() + 1);
      }

      return Object.keys(occurrencesByDate).map(function (dateKey) {
        return occurrencesByDate[dateKey];
      }).sort(function (left, right) {
        const leftKey = [left.lessonDate, left.id].join("|");
        const rightKey = [right.lessonDate, right.id].join("|");
        return leftKey.localeCompare(rightKey);
      });
    }

    function getInstructionAssignmentDataForClass(classId) {
      const normalizedClassId = String(classId || "").trim();

      if (!normalizedClassId) {
        return {
          occurrenceLookup: {}
        };
      }

      if (instructionAssignmentCache[normalizedClassId]) {
        return instructionAssignmentCache[normalizedClassId];
      }

      const lessonOccurrences = buildInstructionLessonOccurrencesForClass(normalizedClassId);
      const orderedSeries = getOrderedCurriculumSeriesForClass(normalizedClassId);
      const lessonSlots = [];
      const occurrenceLookup = {};
      let previousSeriesLastAssignedSlotIndex = -1;

      lessonOccurrences.forEach(function (occurrence) {
        const occurrenceId = String(occurrence && occurrence.id || "").trim();
        const totalUnits = Math.max(1, Number(occurrence && occurrence.lessonCount || 1));
        const isCancelled = Boolean(occurrence && occurrence.isCancelled);
        let slotIndex = 0;

        occurrenceLookup[occurrenceId] = {
          occurrence: occurrence,
          assignmentSeriesIds: [],
          assignmentSequenceIds: [],
          assignmentLessonIds: []
        };

        while (slotIndex < (isCancelled ? 0 : totalUnits)) {
          lessonSlots.push({
            occurrenceId: occurrenceId,
            lessonDate: String(occurrence && occurrence.lessonDate || "").trim(),
            assignedSeriesId: "",
            assignedSequenceId: "",
            assignedLessonId: ""
          });
          slotIndex += 1;
        }
      });

      orderedSeries.forEach(function (seriesItem) {
        const seriesId = String(seriesItem && seriesItem.id || "").trim();
        const startMode = String(seriesItem && seriesItem.startMode || "").trim() === "manual" ? "manual" : "automatic";
        const manualStartDate = String(seriesItem && seriesItem.startDate || "").slice(0, 10);
        let remainingDemand = Math.max(0, Number(seriesItem && seriesItem.hourDemand) || 0);
        const earliestAllowedSlotIndex = previousSeriesLastAssignedSlotIndex + 1;
        let startIndex = -1;
        let cursorIndex;
        let lastAssignedSlotIndex = -1;

        if (!remainingDemand) {
          return;
        }

        startIndex = lessonSlots.findIndex(function (slot, slotIndex) {
          if (slotIndex < earliestAllowedSlotIndex || slot.assignedSeriesId) {
            return false;
          }

          if (startMode === "manual" && manualStartDate) {
            return String(slot.lessonDate || "") >= manualStartDate;
          }

          return true;
        });

        if (startIndex < 0) {
          return;
        }

        cursorIndex = startIndex;

        while (cursorIndex < lessonSlots.length && remainingDemand > 0) {
          const slot = lessonSlots[cursorIndex];
          const occurrenceEntry = occurrenceLookup[String(slot && slot.occurrenceId || "").trim()];

          if (slot && !slot.assignedSeriesId && occurrenceEntry) {
            slot.assignedSeriesId = seriesId;
            occurrenceEntry.assignmentSeriesIds.push(seriesId);
            remainingDemand -= 1;
            lastAssignedSlotIndex = cursorIndex;
          }

          cursorIndex += 1;
        }

        if (lastAssignedSlotIndex >= 0) {
          previousSeriesLastAssignedSlotIndex = lastAssignedSlotIndex;
        }
      });

      orderedSeries.forEach(function (seriesItem) {
        const seriesId = String(seriesItem && seriesItem.id || "").trim();
        const seriesSlots = lessonSlots.filter(function (slot) {
          return String(slot && slot.assignedSeriesId || "").trim() === seriesId;
        });
        const orderedSequences = getOrderedCurriculumSequencesForSeries(seriesId);
        let seriesSlotIndex = 0;

        orderedSequences.forEach(function (sequenceItem) {
          const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
          let remainingDemand = Math.max(0, Number(sequenceItem && sequenceItem.hourDemand) || 0);

          while (seriesSlotIndex < seriesSlots.length && remainingDemand > 0) {
            const slot = seriesSlots[seriesSlotIndex];
            const occurrenceEntry = occurrenceLookup[String(slot && slot.occurrenceId || "").trim()];

            if (slot && occurrenceEntry) {
              slot.assignedSequenceId = sequenceId;
              occurrenceEntry.assignmentSequenceIds.push(sequenceId);
              remainingDemand -= 1;
            }

            seriesSlotIndex += 1;
          }
        });
      });

      (Array.isArray(snapshot.curriculumSequences) ? snapshot.curriculumSequences : []).forEach(function (sequenceItem) {
        const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
        const sequenceSlots = lessonSlots.filter(function (slot) {
          return String(slot && slot.assignedSequenceId || "").trim() === sequenceId;
        });
        const orderedLessons = getOrderedCurriculumLessonsForSequence(sequenceId);
        let sequenceSlotIndex = 0;

        orderedLessons.forEach(function (lessonItem) {
          const lessonId = String(lessonItem && lessonItem.id || "").trim();
          let remainingDemand = getCurriculumLessonHourDemand(lessonItem);

          while (sequenceSlotIndex < sequenceSlots.length && remainingDemand > 0) {
            const slot = sequenceSlots[sequenceSlotIndex];
            const occurrenceEntry = occurrenceLookup[String(slot && slot.occurrenceId || "").trim()];

            if (slot && occurrenceEntry) {
              slot.assignedLessonId = lessonId;
              occurrenceEntry.assignmentLessonIds.push(lessonId);
              remainingDemand -= 1;
            }

            sequenceSlotIndex += 1;
          }
        });
      });

      instructionAssignmentCache[normalizedClassId] = {
        occurrenceLookup: occurrenceLookup
      };

      return instructionAssignmentCache[normalizedClassId];
    }

    function getInstructionDisplayTopicForClassAndDate(classId, lessonDateValue) {
      const occurrenceEntry = getInstructionAssignmentDataForClass(classId).occurrenceLookup[getInstructionOccurrenceId(lessonDateValue)] || null;
      const lessonTopics = getUniqueIds(occurrenceEntry && occurrenceEntry.assignmentLessonIds).map(function (lessonId) {
        return String(lessonPlanLookup[lessonId] && lessonPlanLookup[lessonId].topic || "").trim();
      }).filter(Boolean);
      const sequenceTopics = getUniqueIds(occurrenceEntry && occurrenceEntry.assignmentSequenceIds).map(function (sequenceId) {
        return String(sequenceLookup[sequenceId] && sequenceLookup[sequenceId].topic || "").trim();
      }).filter(Boolean);
      const seriesTopics = getUniqueIds(occurrenceEntry && occurrenceEntry.assignmentSeriesIds).map(function (seriesId) {
        return String(seriesLookup[seriesId] && seriesLookup[seriesId].topic || "").trim();
      }).filter(Boolean);

      if (lessonTopics.length) {
        return lessonTopics.join(" / ");
      }

      if (sequenceTopics.length) {
        return sequenceTopics.join(" / ");
      }

      if (seriesTopics.length) {
        return seriesTopics.join(" / ");
      }

      return "";
    }

    function renderClassOptions(selectedClassId) {
      return ['<option value="">-</option>'].concat(classes.map(function (schoolClass) {
        return '<option value="' + escapeValue(schoolClass.id) + '"' + (selectedClassId === schoolClass.id ? " selected" : "") + '>' + escapeValue(getClassDisplayName(schoolClass)) + "</option>";
      })).join("");
    }

    function buildPlanningInstructionLessonModalForClass() {
      const draft = planningInstructionLessonDraft;
      const draftClass = draft && String(draft.classId || "").trim()
        ? getClassById(String(draft.classId || "").trim())
        : null;
      const assignmentData = draft ? getInstructionAssignmentDataForClass(String(draft.classId || "").trim()) : null;
      const occurrenceEntry = draft && assignmentData
        ? assignmentData.occurrenceLookup[getInstructionOccurrenceId(draft.lessonDate)] || null
        : null;

      function buildSummaryList(itemIds, lookup, formatter) {
        if (!itemIds.length) {
          return '<p class="planning-instruction-modal__empty">Keine Zuordnung</p>';
        }

        return [
          '<ul class="planning-instruction-modal__list">',
          itemIds.map(function (itemId) {
            return '<li>' + formatter(lookup[itemId] || null, itemId) + '</li>';
          }).join(""),
          '</ul>'
        ].join("");
      }

      if (!draft) {
        return "";
      }

      return [
        '<div class="import-modal is-open" id="planningInstructionLessonModal">',
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closePlanningInstructionLessonModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--planning import-modal__dialog--instruction-lesson" role="dialog" aria-modal="true" aria-labelledby="planningInstructionLessonTitle">',
        '<div class="import-modal__header">',
        '<div><h3 id="planningInstructionLessonTitle">Verfuegbare Unterrichtsstunde</h3><p class="planning-instruction-modal__date">' + escapeValue(formatShortDateLabel(String(draft.lessonDate || "").slice(0, 10)) + (draftClass ? " · " + getClassDisplayName(draftClass) : "")) + '</p></div>',
        '<div class="import-modal__icon-actions">',
        '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="submit" form="planningInstructionLessonForm" aria-label="Aenderungen speichern">&#10003;</button>',
        '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Bearbeitung abbrechen" onclick="return window.UnterrichtsassistentApp.closePlanningInstructionLessonModal()">&#10005;</button>',
        '</div>',
        '</div>',
        '<form class="import-modal__form planning-instruction-modal" id="planningInstructionLessonForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitPlanningInstructionLessonModal(event)">',
        '<section class="planning-instruction-modal__section">',
        '<h4 class="planning-instruction-modal__title">Zugeordnete Reihe</h4>',
        buildSummaryList(
          getUniqueIds(occurrenceEntry && occurrenceEntry.assignmentSeriesIds),
          seriesLookup,
          function (seriesItem) {
            return escapeValue(String(seriesItem && seriesItem.topic || "").trim() || "Ohne Thema");
          }
        ),
        '</section>',
        '<section class="planning-instruction-modal__section">',
        '<h4 class="planning-instruction-modal__title">Zugeordnete Sequenz</h4>',
        buildSummaryList(
          getUniqueIds(occurrenceEntry && occurrenceEntry.assignmentSequenceIds),
          sequenceLookup,
          function (sequenceItem) {
            return escapeValue(String(sequenceItem && sequenceItem.topic || "").trim() || "Ohne Thema");
          }
        ),
        '</section>',
        '<section class="planning-instruction-modal__section">',
        '<h4 class="planning-instruction-modal__title">Zugeordnete geplante Stunde</h4>',
        buildSummaryList(
          getUniqueIds(occurrenceEntry && occurrenceEntry.assignmentLessonIds),
          lessonPlanLookup,
          function (lessonItem) {
            const topic = String(lessonItem && lessonItem.topic || "").trim() || "Ohne Thema";
            const hourType = String(lessonItem && lessonItem.hourType || "").trim() === "double" ? "Doppelstunde" : "Einzelstunde";

            return escapeValue(topic + " (" + hourType + ")");
          }
        ),
        '</section>',
        '<section class="planning-instruction-modal__section planning-instruction-modal__section--settings">',
        '<label class="planning-instruction-modal__checkbox"><input id="planningInstructionLessonCancelledInput" type="checkbox"' + (draft && draft.isCancelled ? ' checked' : '') + ' onchange="return window.UnterrichtsassistentApp.handlePlanningInstructionLessonCancelledChange(this.checked)"><span>Faellt aus</span></label>',
        '<label class="import-modal__field planning-instruction-modal__reason" id="planningInstructionLessonReasonField"' + (draft && draft.isCancelled ? '' : ' hidden') + '><span>Grund</span><textarea id="planningInstructionLessonReasonInput" rows="4" placeholder="Grund fuer den Ausfall"' + (draft && draft.isCancelled ? '' : ' disabled') + '>' + escapeValue(String(draft && draft.cancelReason || "").trim()) + '</textarea></label>',
        '</section>',
        '</form>',
        '</div>',
        '</div>'
      ].join("");
    }

    function countCellRowspan(lessonRows, startRowIndex, weekdayKey) {
      let span = 1;
      let nextIndex;

      for (nextIndex = startRowIndex + 1; nextIndex < lessonRows.length; nextIndex += 1) {
        if (lessonRows[nextIndex].cells[weekdayKey].sourceRowId === lessonRows[startRowIndex].id) {
          span += 1;
        } else {
          break;
        }
      }

      return span;
    }

    function renderManageDayCell(row, weekday) {
      const cell = row.cells[weekday.key];
      const resolvedClassId = cell.isBlocked ? cell.inheritedClassId : cell.classId;
      const resolvedClass = resolvedClassId ? getClassById(resolvedClassId) : null;
      const resolvedRoom = cell.isBlocked ? cell.inheritedRoom : cell.room;

      if (row.type === "pause") {
        return '<td class="schedule-cell schedule-cell--pause"><span class="schedule-cell__note">Pause</span></td>';
      }

      if (cell.isBlocked) {
        return [
          '<td class="schedule-cell schedule-cell--blocked">',
          '<div class="schedule-cell__stack">',
          '<span class="schedule-cell__blocked-label">Doppelstunde</span>',
          '<span class="schedule-cell__blocked-value">', escapeValue(resolvedClass ? getClassDisplayName(resolvedClass) : "Fortsetzung"), "</span>",
          '<span class="schedule-cell__blocked-room">', escapeValue(resolvedRoom || "Raum offen"), "</span>",
          "</div>",
          "</td>"
        ].join("");
      }

      return [
        '<td class="schedule-cell">',
        '<div class="schedule-cell__stack">',
        '<select class="student-table__input student-table__select" onchange="return window.UnterrichtsassistentApp.updateTimetableClass(\'', row.id, '\', \'', weekday.key, '\', this.value)">',
        renderClassOptions(cell.classId),
        "</select>",
        '<input class="student-table__input" type="text" placeholder="Raum" value="', escapeValue(cell.room), '" autocomplete="off" autocapitalize="none" spellcheck="false" onchange="return window.UnterrichtsassistentApp.updateTimetableRoom(\'', row.id, '\', \'', weekday.key, '\', this.value)">',
        '<label class="schedule-double-toggle">',
        '<input type="checkbox" ', cell.isDouble ? "checked " : "", cell.classId ? "" : "disabled ", 'onchange="return window.UnterrichtsassistentApp.toggleTimetableDouble(\'', row.id, '\', \'', weekday.key, '\', this.checked)">',
        "<span>Doppelstunde</span>",
        "</label>",
        "</div>",
        "</td>"
      ].join("");
    }

    function renderCompactDayCell(lessonRows, row, rowIndex, weekday) {
      const timeContext = renderCompactDayCell.timeContext;
      const cell = row.cells[weekday.key];
      const resolvedClassId = cell.isBlocked ? cell.inheritedClassId : cell.classId;
      const resolvedClass = resolvedClassId ? getClassById(resolvedClassId) : null;
      const resolvedRoom = cell.isBlocked ? cell.inheritedRoom : cell.room;
      const lessonDateValue = timeContext.weekDates[weekday.key] ? timeContext.weekDates[weekday.key].isoDate : "";
      const lessonStatus = resolvedClass ? lessonStatusLookup[[String(resolvedClass.id || "").trim(), lessonDateValue].join("::")] || null : null;
      const lessonTopic = resolvedClass ? getInstructionDisplayTopicForClassAndDate(resolvedClass.id, lessonDateValue) : "";
      const rowspan = countCellRowspan(lessonRows, rowIndex, weekday.key);
      const boxStyle = rowspan > 1 ? "min-height:" + String((rowspan * 84) - 4) + "px;" : "";
      const isCurrentDay = timeContext.currentWeekdayKey === weekday.key;
      const currentDayClass = isCurrentDay ? " is-current-day" : "";
      const pastDayClass = timeContext.pastWeekdayKeys[weekday.key] ? " is-past-day" : "";
      const pastRowClass = isCurrentDay && timeContext.pastLessonRowIds[row.id] ? " is-past-slot" : "";
      const currentCellClass = currentDayClass + pastDayClass + pastRowClass;
      const timeBarHtml = timeContext.barSourceRowId === row.id && isCurrentDay
        ? '<span class="schedule-compact__time-bar" style="top:' + String(timeContext.barOffsetPercent) + '%"></span>'
        : "";
      const actionLabel = resolvedClass
        ? getClassDisplayName(resolvedClass) + ", " + weekday.shortLabel + " " + timeContext.weekDates[weekday.key].label + ", " + row.startTime
        : "";
      const actionAttributes = ' type="button" aria-label="' + escapeValue(actionLabel) + '" title="' + escapeValue(actionLabel) + '" onclick="return window.UnterrichtsassistentApp.setContextFromTimetableCell(\'' + escapeValue(resolvedClassId) + '\', \'' + escapeValue(timeContext.weekDates[weekday.key].isoDate) + '\', \'' + escapeValue(row.startTime) + '\', \'' + escapeValue(timetable ? timetable.id : "") + '\')"';

      if (cell.isBlocked) {
        return "";
      }

      if (!resolvedClass) {
        return '<td class="schedule-compact__lesson-cell schedule-compact__lesson-cell--empty' + currentCellClass + '"' + (rowspan > 1 ? ' rowspan="' + rowspan + '"' : "") + '><div class="schedule-compact__lesson-box schedule-compact__lesson-box--empty"></div>' + timeBarHtml + '</td>';
      }

      return [
        '<td class="schedule-compact__lesson-cell', currentCellClass, '"', rowspan > 1 ? ' rowspan="' + rowspan + '"' : "", ">",
        '<button class="schedule-compact__lesson-box', rowspan > 1 ? " is-double" : "", lessonStatus && lessonStatus.isCancelled ? ' is-cancelled' : '', '"' + actionAttributes + ' style="', buildLessonBoxStyle(resolvedClass), " ", boxStyle, '">',
        '<div class="schedule-compact__lesson-title">', escapeValue(getClassDisplayName(resolvedClass)), "</div>",
        lessonTopic ? '<div class="schedule-compact__lesson-topic">' + escapeValue(lessonTopic) + '</div>' : '',
        '<div class="schedule-compact__lesson-room">', escapeValue(resolvedRoom || "Raum offen"), "</div>",
        "</button>",
        '<button class="schedule-compact__info-button" type="button" aria-label="Informationen zur Unterrichtsstunde" onclick="return window.UnterrichtsassistentApp.openPlanningInstructionLessonModal(\'', escapeValue(lessonDateValue), '\', \'', escapeValue(resolvedClassId), '\')">&#9432;</button>',
        timeBarHtml,
        "</td>"
      ].join("");
    }

    function renderManageTable() {
      const tableRows = rows.map(function (row) {
        return [
          "<tr>",
          '<td class="schedule-meta-cell">',
          '<div class="schedule-slot-card">',
          '<div class="schedule-slot-card__time">', escapeValue(row.startTime), " - ", escapeValue(row.endTime), "</div>",
          '<div class="schedule-slot-card__controls">',
          '<select class="student-table__input student-table__select" onchange="return window.UnterrichtsassistentApp.updateTimetableRowField(\'', row.id, '\', \'type\', this.value)">',
          '<option value="lesson"', row.type === "lesson" ? " selected" : "", ">Unterrichtsstunde</option>",
          '<option value="pause"', row.type === "pause" ? " selected" : "", ">Pause</option>",
          "</select>",
          '<select class="student-table__input student-table__select" onchange="return window.UnterrichtsassistentApp.updateTimetableRowField(\'', row.id, '\', \'durationMinutes\', this.value)">',
          [5, 10, 15, 20, 30, 45, 60, 90].map(function (duration) {
            return '<option value="' + duration + '"' + (row.durationMinutes === duration ? " selected" : "") + ">" + duration + " Minuten</option>";
          }).join(""),
          "</select>",
          "</div>",
          "</div>",
          "</td>",
          weekdays.map(function (weekday) {
            return renderManageDayCell(row, weekday);
          }).join(""),
          "</tr>"
        ].join("");
      }).join("");

      return [
        '<div class="schedule-toolbar">',
        '<label class="schedule-toolbar__field">',
        "<span>Gueltig ab</span>",
        '<input class="student-table__input schedule-toolbar__time" type="date" value="', escapeValue(formatDateValue(timetable.validFrom)), '" onchange="return window.UnterrichtsassistentApp.updateTimetableDateField(\'validFrom\', this.value)">',
        "</label>",
        '<label class="schedule-toolbar__field">',
        "<span>Gueltig bis</span>",
        '<input class="student-table__input schedule-toolbar__time" type="date" value="', escapeValue(formatDateValue(timetable.validTo)), '" onchange="return window.UnterrichtsassistentApp.updateTimetableDateField(\'validTo\', this.value)">',
        "</label>",
        '<label class="schedule-toolbar__field">',
        "<span>Unterrichtsbeginn</span>",
        '<input class="student-table__input schedule-toolbar__time" type="time" value="', escapeValue(timetable.startTime), '" onchange="return window.UnterrichtsassistentApp.updateTimetableStartTime(this.value)">',
        "</label>",
        "</div>",
        '<div class="student-table-wrap schedule-table-wrap">',
        '<table class="student-table schedule-table">',
        "<thead><tr><th>Zeitfenster</th>",
        weekdays.map(function (weekday) {
          return "<th>" + escapeValue(weekday.label) + "</th>";
        }).join(""),
        "</tr></thead>",
        "<tbody>",
        tableRows || '<tr><td colspan="6">Noch kein Zeitraster vorhanden. Lege unten die erste Zeile an.</td></tr>',
        "</tbody>",
        "</table>",
        "</div>",
        '<div class="table-actions schedule-table-actions"><button class="import-box__label" type="button" onclick="return window.UnterrichtsassistentApp.addTimetableRow()">Neue Zeile</button></div>'
      ].join("");
    }

    function renderCompactTable() {
      const weekDates = getWeekDates();
      const lessonRows = rows.filter(function (row) {
        return row.type === "lesson";
      });
      const now = new Date(referenceDate);
      const currentWeekdayIndex = now.getDay() === 0 ? 7 : now.getDay();
      const currentWeekdayKey = currentWeekdayIndex >= 1 && currentWeekdayIndex <= 5 ? String(currentWeekdayIndex) : "";
      const currentMinutes = (now.getHours() * 60) + now.getMinutes();
      const pastWeekdayKeys = {};
      const pastLessonRowIds = {};
      let barSourceRowId = "";
      let barOffsetPercent = -1;

      weekdays.forEach(function (weekday) {
        if (currentWeekdayIndex > 5 || Number(weekday.key) < currentWeekdayIndex) {
          pastWeekdayKeys[weekday.key] = true;
        }
      });

      lessonRows.forEach(function (row) {
        if (currentWeekdayKey && timeToMinutes(row.endTime) < currentMinutes) {
          pastLessonRowIds[row.id] = true;
        }
      });

      if (currentWeekdayKey && lessonRows.length) {
        const firstLessonStart = timeToMinutes(lessonRows[0].startTime);
        const lastLessonEnd = timeToMinutes(lessonRows[lessonRows.length - 1].endTime);

        if (currentMinutes >= firstLessonStart && currentMinutes <= lastLessonEnd) {
          lessonRows.some(function (row, rowIndex) {
            const startMinutes = timeToMinutes(row.startTime);
            const endMinutes = timeToMinutes(row.endTime);
            const nextRow = lessonRows[rowIndex + 1] || null;
            const nextStartMinutes = nextRow ? timeToMinutes(nextRow.startTime) : null;
            const sourceRowId = row.cells[currentWeekdayKey].sourceRowId || row.id;
            const sourceRowIndex = lessonRows.findIndex(function (candidate) {
              return candidate.id === sourceRowId;
            });
            const span = sourceRowIndex >= 0 ? countCellRowspan(lessonRows, sourceRowIndex, currentWeekdayKey) : 1;

            if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
              barSourceRowId = sourceRowId;
              barOffsetPercent = Math.max(0, Math.min(100, (((rowIndex - sourceRowIndex) + ((currentMinutes - startMinutes) / Math.max(endMinutes - startMinutes, 1))) / Math.max(span, 1)) * 100));
              return true;
            }

            if (nextRow && currentMinutes > endMinutes && currentMinutes < nextStartMinutes) {
              barSourceRowId = sourceRowId;
              barOffsetPercent = Math.max(0, Math.min(100, (((rowIndex - sourceRowIndex) + 1) / Math.max(span, 1)) * 100));
              return true;
            }

            return false;
          });
        }
      }

      renderCompactDayCell.timeContext = {
        currentWeekdayKey: currentWeekdayKey,
        pastWeekdayKeys: pastWeekdayKeys,
        pastLessonRowIds: pastLessonRowIds,
        barSourceRowId: barSourceRowId,
        barOffsetPercent: barOffsetPercent,
        weekDates: weekDates
      };

      const compactRows = lessonRows.map(function (row, rowIndex) {
        const lessonLabel = String(rowIndex + 1) + ". Stunde";
        const rowPastClass = pastLessonRowIds[row.id] ? " is-past-slot" : "";

        return [
          '<tr class="schedule-compact__row', rowPastClass, '">',
          '<td class="schedule-compact__index-cell', rowPastClass, '">',
          '<span class="schedule-compact__start-time">' + escapeValue(row.startTime) + "</span>",
          lessonLabel ? '<span class="schedule-compact__lesson-index">' + lessonLabel + "</span>" : "",
          '<span class="schedule-compact__boundary-time">' + escapeValue(row.endTime) + "</span>",
          "</td>",
          weekdays.map(function (weekday) {
            return renderCompactDayCell(lessonRows, row, rowIndex, weekday);
          }).join(""),
          "</tr>"
        ].join("");
      }).join("");
      const outageOverlayMarkup = weekdays.map(function (weekday, weekdayIndex) {
        const weekDate = weekDates[weekday.key] || null;
        const outageEvent = weekDate ? getInstructionOutageEventForDate(weekDate.isoDate) : null;

        if (!outageEvent) {
          return "";
        }

        return [
          '<div class="schedule-compact__day-overlay" style="--schedule-day-index:',
          escapeValue(String(weekdayIndex)),
          ';--schedule-outage-color:',
          escapeValue(getPlanningCategoryColorValue(String(outageEvent.category || "Unterrichtsausfall"))),
          ';">',
          '<span class="schedule-compact__day-overlay-title">',
          escapeValue(String(outageEvent.title || "Unterrichtsausfall").trim() || "Unterrichtsausfall"),
          '</span>',
          '</div>'
        ].join("");
      }).join("");

      return [
        '<div class="student-table-wrap schedule-table-wrap schedule-table-wrap--compact',
        timetableWeekShiftAnimationDirection ? ' is-week-shifting-' + escapeValue(timetableWeekShiftAnimationDirection) : '',
        '" onpointerdown="return window.UnterrichtsassistentApp.startTimetableWeekSwipe(event)" onpointermove="return window.UnterrichtsassistentApp.handleTimetableWeekSwipeMove(event)" onpointerup="return window.UnterrichtsassistentApp.endTimetableWeekSwipe(event)" onpointercancel="return window.UnterrichtsassistentApp.endTimetableWeekSwipe(event)">',
        '<table class="schedule-compact-table">',
        "<thead><tr><th></th>",
        weekdays.map(function (weekday) {
          const headerClasses = [
            currentWeekdayKey === weekday.key ? "is-current-day" : "",
            pastWeekdayKeys[weekday.key] ? "is-past-day" : ""
          ].join(" ").trim();
          const previousWeekButton = weekday.key === "1"
            ? '<button class="schedule-compact__week-nav schedule-compact__week-nav--prev" type="button" aria-label="Eine Woche zurueck" onclick="return window.UnterrichtsassistentApp.shiftActiveDateByDays(-7)">&lsaquo;</button>'
            : "";
          const nextWeekButton = weekday.key === "5"
            ? '<button class="schedule-compact__week-nav schedule-compact__week-nav--next" type="button" aria-label="Eine Woche weiter" onclick="return window.UnterrichtsassistentApp.shiftActiveDateByDays(7)">&rsaquo;</button>'
            : "";

          return '<th class="' + headerClasses + '"><div class="schedule-compact__weekday-header">' + previousWeekButton + '<span class="schedule-compact__weekday-wrap"><span class="schedule-compact__weekday">' + escapeValue(weekday.shortLabel) + '</span><span class="schedule-compact__weekday-date">' + escapeValue(weekDates[weekday.key].label) + '</span></span>' + nextWeekButton + "</div></th>";
        }).join(""),
        "</tr></thead>",
        "<tbody>",
        compactRows,
        "</tbody>",
        "</table>",
        outageOverlayMarkup ? '<div class="schedule-compact__overlay-layer">' + outageOverlayMarkup + '</div>' : '',
        "</div>"
      ].join("");
    }

    return [
      '<div class="panel-grid panel-grid--klasse">',
      '<article class="panel panel--full">',
      timetable ? (isManageMode ? renderManageTable() : (rows.length ? renderCompactTable() : '<p class="empty-message">Fuer den aktuell gueltigen Stundenplan ist noch kein Zeitraster hinterlegt.</p>')) : '<p class="empty-message">Noch kein Stundenplan vorhanden. Lege im Modus Verwalten ueber den Plus-Button den ersten Stundenplan an.</p>',
      !isManageMode ? buildPlanningInstructionLessonModalForClass() : '',
      "</article>",
      "</div>"
    ].join("");
  }
};

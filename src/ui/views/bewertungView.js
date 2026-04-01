window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.bewertung = {
  id: "bewertung",
  title: "Bewertung",
  render: function (service) {
    const activeClass = service && typeof service.getActiveClass === "function"
      ? service.getActiveClass()
      : null;
    const mode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getBewertungViewMode === "function"
      ? window.UnterrichtsassistentApp.getBewertungViewMode()
      : "bewerten";
    const draft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveEvaluationSheetDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveEvaluationSheetDraft()
      : null;
    const snapshot = service && service.snapshot ? service.snapshot : {};
    const planningEvents = Array.isArray(snapshot.planningEvents) ? snapshot.planningEvents : [];
    const schoolYearStart = String(snapshot.schoolYearStart || "").slice(0, 10);
    const schoolYearEnd = String(snapshot.schoolYearEnd || "").slice(0, 10);
    const referenceDate = service && typeof service.getReferenceDate === "function"
      ? service.getReferenceDate()
      : null;
    const expandedCurriculumSeriesIds = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getExpandedCurriculumSeriesIds === "function"
      ? window.UnterrichtsassistentApp.getExpandedCurriculumSeriesIds().map(function (entry) {
          return String(entry || "").trim();
        }).filter(Boolean)
      : [];
    const expandedCurriculumSequenceIds = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getExpandedCurriculumSequenceIds === "function"
      ? window.UnterrichtsassistentApp.getExpandedCurriculumSequenceIds().map(function (entry) {
          return String(entry || "").trim();
        }).filter(Boolean)
      : [];
    const isCurriculumSectionExpanded = !(window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isBewertungCurriculumSectionExpanded === "function")
      || window.UnterrichtsassistentApp.isBewertungCurriculumSectionExpanded();
    const isTaskSheetSectionExpanded = !(window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isBewertungTaskSheetSectionExpanded === "function")
      || window.UnterrichtsassistentApp.isBewertungTaskSheetSectionExpanded();
    const isAnalysisSectionExpanded = !(window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isBewertungAnalysisSectionExpanded === "function")
      || window.UnterrichtsassistentApp.isBewertungAnalysisSectionExpanded();

    function escapeValue(value) {
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

    function toIsoDate(date) {
      return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("-");
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

    function getWorkingTimeParts(totalMinutesValue) {
      const totalMinutes = Math.max(0, Number.isFinite(Number(totalMinutesValue)) ? Math.round(Number(totalMinutesValue)) : 0);
      const days = Math.floor(totalMinutes / (24 * 60));
      const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
      const minutes = totalMinutes % 60;

      return {
        days: days,
        hours: hours,
        minutes: minutes
      };
    }

    function buildWorkingTimeFields(fieldPrefix, totalMinutesValue, changeHandler) {
      const parts = getWorkingTimeParts(totalMinutesValue);
      const daysId = fieldPrefix + 'DaysInput';
      const hoursId = fieldPrefix + 'HoursInput';
      const minutesId = fieldPrefix + 'MinutesInput';

      return [
        '<div class="bewertung-working-time">',
        '<div class="bewertung-working-time__grid">',
        '<label class="bewertung-working-time__field">',
        '<span>Tage</span>',
        '<input id="', escapeValue(daysId), '" type="number" min="0" step="1" value="', escapeValue(String(parts.days)), '"', changeHandler ? ' onchange="' + changeHandler.replace(/__DAYS_ID__/g, daysId).replace(/__HOURS_ID__/g, hoursId).replace(/__MINUTES_ID__/g, minutesId) + '"' : '', '>',
        '</label>',
        '<label class="bewertung-working-time__field">',
        '<span>Stunden</span>',
        '<input id="', escapeValue(hoursId), '" type="number" min="0" step="1" value="', escapeValue(String(parts.hours)), '"', changeHandler ? ' onchange="' + changeHandler.replace(/__DAYS_ID__/g, daysId).replace(/__HOURS_ID__/g, hoursId).replace(/__MINUTES_ID__/g, minutesId) + '"' : '', '>',
        '</label>',
        '<label class="bewertung-working-time__field">',
        '<span>Minuten</span>',
        '<input id="', escapeValue(minutesId), '" type="number" min="0" step="1" value="', escapeValue(String(parts.minutes)), '"', changeHandler ? ' onchange="' + changeHandler.replace(/__DAYS_ID__/g, daysId).replace(/__HOURS_ID__/g, hoursId).replace(/__MINUTES_ID__/g, minutesId) + '"' : '', '>',
        '</label>',
        '</div>',
        '</div>'
      ].join("");
    }

    function buildSectionHeader(title, sectionName, isExpanded) {
      return [
        '<button class="bewertung-section__header" type="button" aria-expanded="', isExpanded ? 'true' : 'false', '" onclick="return window.UnterrichtsassistentApp.toggleBewertungSection(\'', escapeValue(sectionName), '\')">',
        '<span class="bewertung-section__title">', escapeValue(title), '</span>',
        '<span class="bewertung-section__toggle', isExpanded ? ' is-expanded' : '', '" aria-hidden="true">&#9662;</span>',
        '</button>'
      ].join("");
    }

    function formatInstructionSeriesRange(startValue, endValue) {
      if (!startValue) {
        return "";
      }

      if (!endValue || startValue === endValue) {
        return formatShortDateLabel(startValue);
      }

      return formatShortDateLabel(startValue) + " - " + formatShortDateLabel(endValue);
    }

    function getTypeLabel(typeValue) {
      return String(typeValue || "").trim().toLowerCase() === "kompetenzraster"
        ? "Kompetenzraster"
        : "Aufgabenbogen";
    }

    function getSheetsForActiveClass() {
      const allSheets = Array.isArray(snapshot.evaluationSheets) ? snapshot.evaluationSheets : [];
      const classId = String(activeClass && activeClass.id || "").trim();

      return allSheets.filter(function (sheet) {
        return String(sheet && sheet.classId || "").trim() === classId;
      }).slice().sort(function (left, right) {
        const leftCreatedAt = String(left && left.createdAt || "").trim();
        const rightCreatedAt = String(right && right.createdAt || "").trim();

        if (leftCreatedAt === rightCreatedAt) {
          return String(left && left.title || "").localeCompare(String(right && right.title || ""), "de-DE");
        }

        return rightCreatedAt.localeCompare(leftCreatedAt);
      });
    }

    function getOrderedCurriculumSeriesForActiveClass() {
      const allSeries = Array.isArray(snapshot.curriculumSeries) ? snapshot.curriculumSeries.filter(function (entry) {
        return String(entry && entry.classId || "").trim() === String(activeClass && activeClass.id || "").trim();
      }) : [];
      const incomingCounts = {};
      const itemById = {};
      const ordered = [];
      let current = null;

      allSeries.forEach(function (entry) {
        const entryId = String(entry && entry.id || "").trim();

        if (!entryId) {
          return;
        }

        itemById[entryId] = entry;
        incomingCounts[entryId] = incomingCounts[entryId] || 0;
      });

      allSeries.forEach(function (entry) {
        const nextId = String(entry && entry.nextSeriesId || "").trim();

        if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
          incomingCounts[nextId] += 1;
        }
      });

      current = allSeries.find(function (entry) {
        return !incomingCounts[String(entry && entry.id || "").trim()];
      }) || allSeries[0] || null;

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

      allSeries.forEach(function (entry) {
        if (!ordered.some(function (orderedEntry) {
          return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
        })) {
          ordered.push(entry);
        }
      });

      return ordered;
    }

    function getOrderedCurriculumSequencesForSeries(seriesId) {
      const allSequences = Array.isArray(snapshot.curriculumSequences) ? snapshot.curriculumSequences.filter(function (entry) {
        return String(entry && entry.seriesId || "").trim() === String(seriesId || "").trim();
      }) : [];
      const incomingCounts = {};
      const itemById = {};
      const ordered = [];
      let current = null;

      allSequences.forEach(function (entry) {
        const entryId = String(entry && entry.id || "").trim();

        if (!entryId) {
          return;
        }

        itemById[entryId] = entry;
        incomingCounts[entryId] = incomingCounts[entryId] || 0;
      });

      allSequences.forEach(function (entry) {
        const nextId = String(entry && entry.nextSequenceId || "").trim();

        if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
          incomingCounts[nextId] += 1;
        }
      });

      current = allSequences.find(function (entry) {
        return !incomingCounts[String(entry && entry.id || "").trim()];
      }) || allSequences[0] || null;

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

      allSequences.forEach(function (entry) {
        if (!ordered.some(function (orderedEntry) {
          return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
        })) {
          ordered.push(entry);
        }
      });

      return ordered;
    }

    function getOrderedCurriculumLessonsForSequence(sequenceId) {
      const allLessons = Array.isArray(snapshot.curriculumLessonPlans) ? snapshot.curriculumLessonPlans.filter(function (entry) {
        return String(entry && entry.sequenceId || "").trim() === String(sequenceId || "").trim();
      }) : [];
      const incomingCounts = {};
      const itemById = {};
      const ordered = [];
      let current = null;

      allLessons.forEach(function (entry) {
        const entryId = String(entry && entry.id || "").trim();

        if (!entryId) {
          return;
        }

        itemById[entryId] = entry;
        incomingCounts[entryId] = incomingCounts[entryId] || 0;
      });

      allLessons.forEach(function (entry) {
        const nextId = String(entry && entry.nextLessonId || "").trim();

        if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
          incomingCounts[nextId] += 1;
        }
      });

      current = allLessons.find(function (entry) {
        return !incomingCounts[String(entry && entry.id || "").trim()];
      }) || allLessons[0] || null;

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

      allLessons.forEach(function (entry) {
        if (!ordered.some(function (orderedEntry) {
          return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
        })) {
          ordered.push(entry);
        }
      });

      return ordered;
    }

    function getCurriculumLessonVisualWidth(lessonItem) {
      return String(lessonItem && lessonItem.hourType || "").trim() === "double" ? 56 : 44;
    }

    function getCurriculumLessonHourDemand(lessonItem) {
      return String(lessonItem && lessonItem.hourType || "").trim() === "double" ? 2 : 1;
    }

    function getExpandedLessonColumnWidth(sequenceId, isSequenceExpanded) {
      const orderedLessons = isSequenceExpanded ? getOrderedCurriculumLessonsForSequence(sequenceId) : [];
      const lessonsWidth = orderedLessons.reduce(function (sum, lessonItem) {
        return sum + getCurriculumLessonVisualWidth(lessonItem);
      }, 0);

      if (!isSequenceExpanded) {
        return 156;
      }

      return Math.max(156, lessonsWidth);
    }

    function getExpandedSequenceBlockWidth(seriesId, sequenceItem, expandedSequenceIdsLookupMap) {
      const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
      const isSequenceExpanded = Boolean(expandedSequenceIdsLookupMap[[seriesId, sequenceId].join("::")]);

      return getExpandedLessonColumnWidth(sequenceId, isSequenceExpanded);
    }

    function getExpandedSeriesBlockWidth(seriesId, expandedSequenceIdsLookupMap) {
      const orderedSequences = getOrderedCurriculumSequencesForSeries(seriesId);
      const sequenceWidths = orderedSequences.reduce(function (sum, sequenceItem) {
        return sum + getExpandedSequenceBlockWidth(seriesId, sequenceItem, expandedSequenceIdsLookupMap);
      }, 0);

      return Math.max(168, sequenceWidths);
    }

    function getEventCategoryName(eventItem) {
      const categoryValue = String(eventItem && eventItem.category || "").trim();
      return categoryValue || "Sonstiges";
    }

    const startDate = parseLocalDate(schoolYearStart);
    const endDate = parseLocalDate(schoolYearEnd);
    const activePlanningDate = referenceDate && !Number.isNaN(referenceDate.getTime())
      ? new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), referenceDate.getHours(), referenceDate.getMinutes(), referenceDate.getSeconds(), referenceDate.getMilliseconds())
      : null;

    function isInstructionFreeDateValue(isoDate) {
      return planningEvents.some(function (eventItem) {
        const category = getEventCategoryName(eventItem).toLowerCase();
        const startDateValue = String(eventItem && eventItem.startDate || "").slice(0, 10);
        const endDateValue = String(eventItem && eventItem.endDate || startDateValue).slice(0, 10);

        return category === "unterrichtsfrei" && startDateValue && startDateValue <= isoDate && isoDate <= endDateValue;
      });
    }

    function buildInstructionLessonOccurrences() {
      const occurrencesByDate = {};
      const cursor = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : null;
      const lastDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;
      const lessonStatusLookup = (Array.isArray(snapshot.planningInstructionLessonStatuses) ? snapshot.planningInstructionLessonStatuses : []).reduce(function (lookup, statusItem) {
        const classId = String(statusItem && statusItem.classId || "").trim();
        const lessonDate = String(statusItem && statusItem.lessonDate || "").slice(0, 10);

        if (classId && lessonDate) {
          lookup[[classId, lessonDate].join("::")] = statusItem;
        }

        return lookup;
      }, {});

      function isLessonOccurrencePast(lessonDateValue, lessonEndTime) {
        const lessonDate = parseLocalDate(lessonDateValue);
        const endTimeValue = String(lessonEndTime || "").trim();
        let endMoment;

        if (!activePlanningDate || !lessonDate) {
          return false;
        }

        if (!endTimeValue) {
          return lessonDateValue < toIsoDate(activePlanningDate);
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

        return endMoment < activePlanningDate;
      }

      if (!activeClass || !cursor || !lastDate || !service || typeof service.getLessonUnitsForClass !== "function") {
        return [];
      }

      while (cursor <= lastDate) {
        const isoDate = toIsoDate(cursor);

        if (!isInstructionFreeDateValue(isoDate)) {
          service.getLessonUnitsForClass(activeClass.id, cursor).forEach(function (lessonUnit) {
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

              return effectiveClassId === activeClass.id && effectiveSourceRowId === sourceRowId;
            }).length || 1;

            if (!occurrencesByDate[isoDate]) {
              const lessonStatus = lessonStatusLookup[[String(activeClass.id || "").trim(), isoDate].join("::")] || null;

              occurrencesByDate[isoDate] = {
                id: "unterrichtstag::" + isoDate,
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

    function buildInstructionLessonAssignmentData() {
      const lessonOccurrences = buildInstructionLessonOccurrences();
      const orderedSeries = getOrderedCurriculumSeriesForActiveClass();
      const lessonSlots = [];
      const occurrenceLookup = {};
      const seriesAssignments = {};
      const sequenceAssignments = {};
      const lessonPlanAssignments = {};
      let previousSeriesLastAssignedSlotIndex = -1;

      lessonOccurrences.forEach(function (occurrence) {
        const occurrenceId = String(occurrence && occurrence.id || "").trim();
        const totalUnits = Math.max(1, Number(occurrence && occurrence.lessonCount || 1));
        const availableUnits = Math.max(0, Number(occurrence && occurrence.remainingLessonCount || 0));
        const isCancelled = Boolean(occurrence && occurrence.isCancelled);
        const assignmentSequenceIds = [];
        const assignmentSeriesIds = [];
        const assignmentLessonIds = [];
        let slotIndex = 0;

        occurrenceLookup[occurrenceId] = {
          occurrence: occurrence,
          totalUnits: totalUnits,
          availableUnits: availableUnits,
          isCancelled: isCancelled,
          cancelReason: String(occurrence && occurrence.cancelReason || "").trim(),
          assignmentSequenceIds: assignmentSequenceIds,
          assignmentSeriesIds: assignmentSeriesIds,
          assignmentLessonIds: assignmentLessonIds
        };

        while (slotIndex < (isCancelled ? 0 : totalUnits)) {
          lessonSlots.push({
            occurrenceId: occurrenceId,
            lessonDate: String(occurrence && occurrence.lessonDate || "").trim(),
            assignedSeriesId: ""
          });
          slotIndex += 1;
        }
      });

      orderedSeries.forEach(function (seriesItem) {
        const seriesId = String(seriesItem && seriesItem.id || "").trim();
        const startMode = String(seriesItem && seriesItem.startMode || "").trim() === "manual" ? "manual" : "automatic";
        const manualStartDate = String(seriesItem && seriesItem.startDate || "").slice(0, 10);
        const hourDemand = Math.max(0, Number(seriesItem && seriesItem.hourDemand) || 0);
        let remainingDemand = hourDemand;
        const earliestAllowedSlotIndex = previousSeriesLastAssignedSlotIndex + 1;
        let startIndex = -1;
        let cursorIndex;
        let lastAssignedSlotIndex = -1;

        seriesAssignments[seriesId] = {
          firstDate: "",
          lastDate: "",
          assignedUnitCount: 0
        };

        if (!remainingDemand) {
          return;
        }

        startIndex = lessonSlots.findIndex(function (slot, slotIndex) {
          if (slotIndex < earliestAllowedSlotIndex) {
            return false;
          }

          if (slot.assignedSeriesId) {
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
            seriesAssignments[seriesId].assignedUnitCount += 1;

            if (!seriesAssignments[seriesId].firstDate) {
              seriesAssignments[seriesId].firstDate = String(slot.lessonDate || "").trim();
            }

            seriesAssignments[seriesId].lastDate = String(slot.lessonDate || "").trim();
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

          sequenceAssignments[sequenceId] = {
            firstDate: "",
            lastDate: "",
            assignedUnitCount: 0,
            seriesId: seriesId
          };

          while (seriesSlotIndex < seriesSlots.length && remainingDemand > 0) {
            const slot = seriesSlots[seriesSlotIndex];
            const occurrenceEntry = occurrenceLookup[String(slot && slot.occurrenceId || "").trim()];

            if (slot) {
              slot.assignedSequenceId = sequenceId;
              if (occurrenceEntry) {
                occurrenceEntry.assignmentSequenceIds.push(sequenceId);
              }
              sequenceAssignments[sequenceId].assignedUnitCount += 1;

              if (!sequenceAssignments[sequenceId].firstDate) {
                sequenceAssignments[sequenceId].firstDate = String(slot.lessonDate || "").trim();
              }

              sequenceAssignments[sequenceId].lastDate = String(slot.lessonDate || "").trim();
              remainingDemand -= 1;
            }

            seriesSlotIndex += 1;
          }
        });
      });

      Object.keys(sequenceAssignments).forEach(function (sequenceId) {
        const sequenceSlots = lessonSlots.filter(function (slot) {
          return String(slot && slot.assignedSequenceId || "").trim() === sequenceId;
        });
        const orderedLessons = getOrderedCurriculumLessonsForSequence(sequenceId);
        let sequenceSlotIndex = 0;

        orderedLessons.forEach(function (lessonItem) {
          const lessonId = String(lessonItem && lessonItem.id || "").trim();
          let remainingDemand = getCurriculumLessonHourDemand(lessonItem);

          lessonPlanAssignments[lessonId] = {
            firstDate: "",
            lastDate: "",
            assignedUnitCount: 0,
            sequenceId: sequenceId
          };

          while (sequenceSlotIndex < sequenceSlots.length && remainingDemand > 0) {
            const slot = sequenceSlots[sequenceSlotIndex];
            const occurrenceEntry = occurrenceLookup[String(slot && slot.occurrenceId || "").trim()];

            if (slot) {
              slot.assignedLessonId = lessonId;
              if (occurrenceEntry) {
                occurrenceEntry.assignmentLessonIds.push(lessonId);
              }
              lessonPlanAssignments[lessonId].assignedUnitCount += 1;

              if (!lessonPlanAssignments[lessonId].firstDate) {
                lessonPlanAssignments[lessonId].firstDate = String(slot.lessonDate || "").trim();
              }

              lessonPlanAssignments[lessonId].lastDate = String(slot.lessonDate || "").trim();
              remainingDemand -= 1;
            }

            sequenceSlotIndex += 1;
          }
        });
      });

      return {
        lessonOccurrences: lessonOccurrences,
        occurrenceLookup: occurrenceLookup,
        seriesAssignments: seriesAssignments,
        sequenceAssignments: sequenceAssignments,
        lessonPlanAssignments: lessonPlanAssignments
      };
    }

    function buildEvaluationAssignmentState(activeSheet) {
      const explicitLessonIdsLookup = {};
      const explicitSequenceIdsLookup = {};
      const explicitSeriesIdsLookup = {};
      const sequenceIdsLookup = {};
      const seriesIdsLookup = {};

      (Array.isArray(activeSheet && activeSheet.curriculumLessonIds) ? activeSheet.curriculumLessonIds : []).forEach(function (lessonId) {
        const normalizedId = String(lessonId || "").trim();

        if (normalizedId) {
          explicitLessonIdsLookup[normalizedId] = true;
        }
      });

      (Array.isArray(activeSheet && activeSheet.curriculumSequenceIds) ? activeSheet.curriculumSequenceIds : []).forEach(function (sequenceId) {
        const normalizedId = String(sequenceId || "").trim();

        if (normalizedId) {
          explicitSequenceIdsLookup[normalizedId] = true;
        }
      });

      (Array.isArray(activeSheet && activeSheet.curriculumSeriesIds) ? activeSheet.curriculumSeriesIds : []).forEach(function (seriesId) {
        const normalizedId = String(seriesId || "").trim();

        if (normalizedId) {
          explicitSeriesIdsLookup[normalizedId] = true;
        }
      });

      getOrderedCurriculumSeriesForActiveClass().forEach(function (seriesItem) {
        const seriesId = String(seriesItem && seriesItem.id || "").trim();
        const sequences = getOrderedCurriculumSequencesForSeries(seriesId);

        sequences.forEach(function (sequenceItem) {
          const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
          const lessons = getOrderedCurriculumLessonsForSequence(sequenceId);
          const hasAssignedLesson = lessons.some(function (lessonItem) {
            return Boolean(explicitLessonIdsLookup[String(lessonItem && lessonItem.id || "").trim()]);
          });

          if (explicitSequenceIdsLookup[sequenceId] || (lessons.length ? hasAssignedLesson : explicitSequenceIdsLookup[sequenceId])) {
            sequenceIdsLookup[sequenceId] = true;
          }
        });

        if (explicitSeriesIdsLookup[seriesId] || (sequences.length ? sequences.some(function (sequenceItem) {
          return Boolean(sequenceIdsLookup[String(sequenceItem && sequenceItem.id || "").trim()]);
        }) : explicitSeriesIdsLookup[seriesId])) {
          seriesIdsLookup[seriesId] = true;
        }
      });

      return {
        lessonIdsLookup: explicitLessonIdsLookup,
        sequenceIdsLookup: sequenceIdsLookup,
        seriesIdsLookup: seriesIdsLookup
      };
    }

    function buildCurriculumAssignmentContent(activeSheet) {
      const orderedSeries = getOrderedCurriculumSeriesForActiveClass();
      const assignmentState = buildEvaluationAssignmentState(activeSheet);
      const expandedSeriesIdsLookup = expandedCurriculumSeriesIds.reduce(function (lookup, seriesId) {
        lookup[String(seriesId || "").trim()] = true;
        return lookup;
      }, {});
      const expandedSequenceIdsLookup = expandedCurriculumSequenceIds.reduce(function (lookup, sequenceKey) {
        lookup[String(sequenceKey || "").trim()] = true;
        return lookup;
      }, {});
      const instructionAssignmentData = buildInstructionLessonAssignmentData();
      const seriesAssignments = instructionAssignmentData.seriesAssignments || {};
      const sequenceAssignments = instructionAssignmentData.sequenceAssignments || {};
      const lessonPlanAssignments = instructionAssignmentData.lessonPlanAssignments || {};
      const seriesIdBySequenceId = {};

      orderedSeries.forEach(function (seriesItem) {
        const currentSeriesId = String(seriesItem && seriesItem.id || "").trim();

        getOrderedCurriculumSequencesForSeries(currentSeriesId).forEach(function (sequenceItem) {
          const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();

          if (sequenceId) {
            seriesIdBySequenceId[sequenceId] = currentSeriesId;
          }
        });
      });

      Object.keys(assignmentState.seriesIdsLookup).forEach(function (seriesId) {
        expandedSeriesIdsLookup[String(seriesId || "").trim()] = true;
      });

      Object.keys(assignmentState.sequenceIdsLookup).forEach(function (sequenceId) {
        const parentSeriesId = String(seriesIdBySequenceId[String(sequenceId || "").trim()] || "").trim();

        if (parentSeriesId) {
          expandedSeriesIdsLookup[parentSeriesId] = true;
          expandedSequenceIdsLookup[[parentSeriesId, String(sequenceId || "").trim()].join("::")] = true;
        }
      });

      const seriesWidthLookup = orderedSeries.reduce(function (lookup, seriesItem) {
        const seriesId = String(seriesItem && seriesItem.id || "").trim();
        lookup[seriesId] = getExpandedSeriesBlockWidth(seriesId, expandedSequenceIdsLookup);
        return lookup;
      }, {});

      function buildToggleButton(label, action) {
        return [
          '<button class="planning-curriculum__series-edit planning-curriculum__toggle-button" type="button" aria-label="', escapeValue(label), '" onclick="window.UnterrichtsassistentApp.stopEventPropagation(event); return ', action, '">',
          '&#9662;',
          '</button>'
        ].join("");
      }

      if (!orderedSeries.length) {
        return [
          '<div class="planning-curriculum planning-curriculum--embedded bewertung-curriculum">',
          buildSectionHeader("Unterrichtsplanung zuordnen", "curriculum", isCurriculumSectionExpanded),
          isCurriculumSectionExpanded ? [
          '<div class="planning-curriculum__placeholder">Noch keine Unterrichtsreihen in der Unterrichtsplanung vorhanden.</div>',
          ].join("") : "",
          '</div>'
        ].join("");
      }

      return [
        '<div class="planning-curriculum planning-curriculum--embedded bewertung-curriculum">',
        buildSectionHeader("Unterrichtsplanung zuordnen", "curriculum", isCurriculumSectionExpanded),
        isCurriculumSectionExpanded ? [
        '<div class="planning-curriculum__header planning-curriculum__header--embedded">',
        '<div>',
        '<p class="bewertung-curriculum__hint">Klick auf Reihe, Sequenz oder Stunde ordnet dem Bewertungsbogen den Bereich zu oder entfernt ihn wieder. Das Aufklappen bleibt ueber den kleinen Button rechts moeglich.</p>',
        '</div>',
        '</div>',
        '<div class="planning-curriculum__table-wrap" data-drag-scroll="true">',
        '<table class="planning-curriculum__table">',
        '<tbody>',
        '<tr class="planning-curriculum__row planning-curriculum__row--series">',
        orderedSeries.map(function (seriesItem) {
          const seriesId = String(seriesItem && seriesItem.id || "").trim();
          const seriesColor = escapeValue(String(seriesItem && seriesItem.color || "#d9d4cb"));
          const isExpanded = Boolean(expandedSeriesIdsLookup[seriesId]);
          const expandedSeriesWidth = Math.max(168, Number(seriesWidthLookup[seriesId]) || 168);
          const expandedSeriesWidthStyle = isExpanded
            ? 'width:' + escapeValue(String(expandedSeriesWidth)) + 'px;min-width:' + escapeValue(String(expandedSeriesWidth)) + 'px;max-width:' + escapeValue(String(expandedSeriesWidth)) + 'px;'
            : '';
          const seriesAssignment = seriesAssignments[seriesId] || null;
          const seriesRangeLabel = seriesAssignment
            ? formatInstructionSeriesRange(seriesAssignment.firstDate, seriesAssignment.lastDate)
            : "";
          const isAssigned = Boolean(assignmentState.seriesIdsLookup[seriesId]);

          return [
            '<td class="planning-curriculum__cell planning-curriculum__cell--series"',
            isExpanded ? ' style="' + expandedSeriesWidthStyle + '"' : '',
            '>',
            '<article class="planning-curriculum__series-block', isExpanded ? ' is-expanded' : '', isAssigned ? ' is-evaluation-assigned' : '', '" style="--planning-curriculum-series-color:', seriesColor, ';', expandedSeriesWidthStyle, '" onclick="return window.UnterrichtsassistentApp.toggleEvaluationSheetCurriculumAssignment(\'series\', \'', escapeValue(seriesId), '\', \'\', \'\')">',
            '<div class="planning-curriculum__card-top">',
            '<span class="planning-curriculum__card-spacer" aria-hidden="true"></span>',
            '<div class="planning-curriculum__card-range">', escapeValue(seriesRangeLabel || ""), '</div>',
            buildToggleButton("Unterrichtsreihe auf- oder zuklappen", 'window.UnterrichtsassistentApp.toggleCurriculumSeriesExpansion(\\\'' + escapeValue(seriesId) + '\\\')'),
            '</div>',
            '<div class="planning-curriculum__series-topic">', escapeValue(String(seriesItem && seriesItem.topic || "").trim() || "Ohne Thema"), '</div>',
            '<div class="planning-curriculum__series-footer"></div>',
            '</article>',
            '</td>'
          ].join("");
        }).join(""),
        '</tr>',
        Object.keys(expandedSeriesIdsLookup).length ? [
          '<tr class="planning-curriculum__row planning-curriculum__row--sequences">',
          orderedSeries.map(function (seriesItem) {
            const seriesId = String(seriesItem && seriesItem.id || "").trim();
            const isExpanded = Boolean(expandedSeriesIdsLookup[seriesId]);
            const sequenceColor = escapeValue(String(seriesItem && seriesItem.color || "#d9d4cb"));
            const sequences = isExpanded ? getOrderedCurriculumSequencesForSeries(seriesId) : [];
            const expandedSeriesWidth = Math.max(168, Number(seriesWidthLookup[seriesId]) || 168);

            if (!isExpanded) {
              return '<td class="planning-curriculum__cell planning-curriculum__cell--spacer"></td>';
            }

            return [
              '<td class="planning-curriculum__cell planning-curriculum__cell--sequence-group" style="width:', escapeValue(String(expandedSeriesWidth)), 'px;min-width:', escapeValue(String(expandedSeriesWidth)), 'px;max-width:', escapeValue(String(expandedSeriesWidth)), 'px;">',
              '<div class="planning-curriculum__sequence-wrap" style="--planning-curriculum-series-color:', sequenceColor, ';width:', escapeValue(String(expandedSeriesWidth)), 'px;min-width:', escapeValue(String(expandedSeriesWidth)), 'px;max-width:', escapeValue(String(expandedSeriesWidth)), 'px;">',
              sequences.length ? sequences.map(function (sequenceItem) {
                const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
                const sequenceExpansionKey = [seriesId, sequenceId].join("::");
                const isSequenceExpanded = Boolean(expandedSequenceIdsLookup[sequenceExpansionKey]);
                const expandedSequenceWidth = getExpandedSequenceBlockWidth(seriesId, sequenceItem, expandedSequenceIdsLookup);
                const sequenceAssignment = sequenceAssignments[sequenceId] || null;
                const sequenceRangeLabel = sequenceAssignment
                  ? formatInstructionSeriesRange(sequenceAssignment.firstDate, sequenceAssignment.lastDate)
                  : "";
                const isAssigned = Boolean(assignmentState.sequenceIdsLookup[sequenceId]);

                return [
                  '<article class="planning-curriculum__sequence-block', isSequenceExpanded ? ' is-expanded' : '', isAssigned ? ' is-evaluation-assigned' : '', '" style="--planning-curriculum-series-color:', sequenceColor, ';width:', escapeValue(String(expandedSequenceWidth)), 'px;min-width:', escapeValue(String(expandedSequenceWidth)), 'px;max-width:', escapeValue(String(expandedSequenceWidth)), 'px;" onclick="return window.UnterrichtsassistentApp.toggleEvaluationSheetCurriculumAssignment(\'sequence\', \'', escapeValue(seriesId), '\', \'', escapeValue(sequenceId), '\', \'\')">',
                  '<div class="planning-curriculum__card-top planning-curriculum__card-top--sequence">',
                  '<span class="planning-curriculum__card-spacer" aria-hidden="true"></span>',
                  '<div class="planning-curriculum__card-range planning-curriculum__card-range--sequence">', escapeValue(sequenceRangeLabel || ""), '</div>',
                  buildToggleButton("Unterrichtssequenz auf- oder zuklappen", 'window.UnterrichtsassistentApp.toggleCurriculumSequenceExpansion(\\\'' + escapeValue(seriesId) + '\\\', \\\'' + escapeValue(sequenceId) + '\\\')'),
                  '</div>',
                  '<div class="planning-curriculum__sequence-header">', escapeValue(String(sequenceItem && sequenceItem.topic || "").trim() || "Ohne Thema"), '</div>',
                  '<div class="planning-curriculum__sequence-footer"></div>',
                  '</article>'
                ].join("");
              }).join("") : '<div class="planning-curriculum__placeholder">Keine Sequenzen geplant.</div>',
              '</div>',
              '</td>'
            ].join("");
          }).join(""),
          '</tr>'
        ].join("") : '',
        Object.keys(expandedSequenceIdsLookup).length ? [
          '<tr class="planning-curriculum__row planning-curriculum__row--lessons">',
          orderedSeries.map(function (seriesItem) {
            const seriesId = String(seriesItem && seriesItem.id || "").trim();
            const isExpanded = Boolean(expandedSeriesIdsLookup[seriesId]);
            const sequences = isExpanded ? getOrderedCurriculumSequencesForSeries(seriesId) : [];
            const expandedSeriesWidth = Math.max(168, Number(seriesWidthLookup[seriesId]) || 168);

            if (!isExpanded) {
              return '<td class="planning-curriculum__cell planning-curriculum__cell--spacer"></td>';
            }

            return [
              '<td class="planning-curriculum__cell planning-curriculum__cell--lesson-group" style="width:', escapeValue(String(expandedSeriesWidth)), 'px;min-width:', escapeValue(String(expandedSeriesWidth)), 'px;max-width:', escapeValue(String(expandedSeriesWidth)), 'px;">',
              '<div class="planning-curriculum__lesson-series-wrap" style="width:', escapeValue(String(expandedSeriesWidth)), 'px;min-width:', escapeValue(String(expandedSeriesWidth)), 'px;max-width:', escapeValue(String(expandedSeriesWidth)), 'px;">',
              sequences.length ? sequences.map(function (sequenceItem) {
                const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
                const sequenceExpansionKey = [seriesId, sequenceId].join("::");
                const isSequenceExpanded = Boolean(expandedSequenceIdsLookup[sequenceExpansionKey]);
                const expandedLessonWidth = getExpandedLessonColumnWidth(sequenceId, isSequenceExpanded);
                const lessons = getOrderedCurriculumLessonsForSequence(sequenceId);

                if (!isSequenceExpanded) {
                  return '<div class="planning-curriculum__lesson-column planning-curriculum__lesson-column--spacer"></div>';
                }

                return [
                  '<div class="planning-curriculum__lesson-column" style="width:', escapeValue(String(expandedLessonWidth)), 'px;min-width:', escapeValue(String(expandedLessonWidth)), 'px;max-width:', escapeValue(String(expandedLessonWidth)), 'px;">',
                  '<div class="planning-curriculum__lesson-wrap" style="width:', escapeValue(String(expandedLessonWidth)), 'px;min-width:', escapeValue(String(expandedLessonWidth)), 'px;max-width:', escapeValue(String(expandedLessonWidth)), 'px;">',
                  lessons.length ? lessons.map(function (lessonItem) {
                    const lessonId = String(lessonItem && lessonItem.id || "").trim();
                    const lessonAssignment = lessonPlanAssignments[lessonId] || null;
                    const lessonDateLabel = lessonAssignment && lessonAssignment.firstDate
                      ? formatShortDateLabel(lessonAssignment.firstDate)
                      : "";
                    const isAssigned = Boolean(assignmentState.lessonIdsLookup[lessonId]);

                    return [
                      '<article class="planning-curriculum__lesson-block planning-curriculum__lesson-block--', escapeValue(String(lessonItem && lessonItem.hourType || "single") === "double" ? 'double' : 'single'), isAssigned ? ' is-evaluation-assigned' : '', '"',
                      lessonAssignment && lessonAssignment.firstDate ? ' title="' + escapeValue(formatInstructionSeriesRange(lessonAssignment.firstDate, lessonAssignment.lastDate)) + '"' : '',
                      ' onclick="return window.UnterrichtsassistentApp.toggleEvaluationSheetCurriculumAssignment(\'lesson\', \'', escapeValue(seriesId), '\', \'', escapeValue(sequenceId), '\', \'', escapeValue(lessonId), '\')">',
                      lessonDateLabel ? '<div class="planning-curriculum__lesson-date">' + escapeValue(lessonDateLabel) + '</div>' : '',
                      '<div class="planning-curriculum__lesson-topic">', escapeValue(String(lessonItem && lessonItem.topic || "").trim() || "Ohne Thema"), '</div>',
                      '<div class="planning-curriculum__lesson-type">', String(lessonItem && lessonItem.hourType || "").trim() === "double" ? 'Doppel' : 'Einzel', '</div>',
                      '</article>'
                    ].join("");
                  }).join("") : '<div class="planning-curriculum__placeholder">Keine Stunden geplant.</div>',
                  '</div>',
                  '</div>'
                ].join("");
              }).join("") : '<div class="planning-curriculum__placeholder">Keine Sequenzen geplant.</div>',
              '</div>',
              '</td>'
            ].join("");
          }).join(""),
          '</tr>'
        ].join("") : '',
        '</tbody>',
        '</table>',
        '</div>',
        ].join("") : '',
        '</div>'
      ].join("");
    }

    function getTaskSheetTasks(activeSheet) {
      const taskSheet = activeSheet && activeSheet.taskSheet && typeof activeSheet.taskSheet === "object"
        ? activeSheet.taskSheet
        : {};

      return Array.isArray(taskSheet.tasks) ? taskSheet.tasks : [];
    }

    function buildEvaluationTopicInputId(taskId, subtaskId) {
      return ["evaluationTopicInput", String(taskId || "").trim(), String(subtaskId || "").trim()].join("--");
    }

    function buildEvaluationTopicListId(taskId, subtaskId) {
      return ["evaluationTopicSuggestions", String(taskId || "").trim(), String(subtaskId || "").trim()].join("--");
    }

    function getSubtasksForTask(task) {
      return Array.isArray(task && task.subtasks) ? task.subtasks : [];
    }

    function getBeValue(item) {
      return Math.max(0, Number.isFinite(Number(item && item.be)) ? Math.round(Number(item.be)) : 0);
    }

    function getAfbWeightMap(afbValue) {
      const normalizedAfbValue = String(afbValue || "").trim().toLowerCase();

      if (normalizedAfbValue === "afb1/2") {
        return { afb1: 0.5, afb2: 0.5, afb3: 0 };
      }

      if (normalizedAfbValue === "afb2") {
        return { afb1: 0, afb2: 1, afb3: 0 };
      }

      if (normalizedAfbValue === "afb2/3") {
        return { afb1: 0, afb2: 0.5, afb3: 0.5 };
      }

      if (normalizedAfbValue === "afb3") {
        return { afb1: 0, afb2: 0, afb3: 1 };
      }

      return { afb1: 1, afb2: 0, afb3: 0 };
    }

    function formatPercentValue(value) {
      const normalizedValue = Math.max(0, Number(value) || 0);
      return normalizedValue.toLocaleString("de-DE", {
        minimumFractionDigits: normalizedValue > 0 && normalizedValue < 10 ? 1 : 0,
        maximumFractionDigits: 1
      }) + " %";
    }

    function formatMinutesCompact(totalMinutesValue) {
      const totalMinutes = Math.max(0, Math.round(Number(totalMinutesValue) || 0));
      const days = Math.floor(totalMinutes / (24 * 60));
      const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
      const minutes = totalMinutes % 60;
      const parts = [];

      if (days) {
        parts.push(String(days) + " T");
      }

      if (hours) {
        parts.push(String(hours) + " Std");
      }

      if (minutes || !parts.length) {
        parts.push(String(minutes) + " Min");
      }

      return parts.join(" ");
    }

    function normalizeTopicValue(topicValue) {
      return String(topicValue || "").trim().toLocaleLowerCase("de-DE");
    }

    function collectAssignedCurriculumTopicTree(activeSheet) {
      const assignmentState = buildEvaluationAssignmentState(activeSheet);
      const orderedSeries = getOrderedCurriculumSeriesForActiveClass();

      return orderedSeries.filter(function (seriesItem) {
        return Boolean(assignmentState.seriesIdsLookup[String(seriesItem && seriesItem.id || "").trim()]);
      }).map(function (seriesItem) {
        const seriesId = String(seriesItem && seriesItem.id || "").trim();
        const orderedSequences = getOrderedCurriculumSequencesForSeries(seriesId);

        return {
          id: seriesId,
          level: "series",
          topic: String(seriesItem && seriesItem.topic || "").trim(),
          sequences: orderedSequences.filter(function (sequenceItem) {
            return Boolean(assignmentState.sequenceIdsLookup[String(sequenceItem && sequenceItem.id || "").trim()]);
          }).map(function (sequenceItem) {
            const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
            const orderedLessons = getOrderedCurriculumLessonsForSequence(sequenceId);

            return {
              id: sequenceId,
              level: "sequence",
              topic: String(sequenceItem && sequenceItem.topic || "").trim(),
              lessons: orderedLessons.filter(function (lessonItem) {
                return Boolean(assignmentState.lessonIdsLookup[String(lessonItem && lessonItem.id || "").trim()]);
              }).map(function (lessonItem) {
                return {
                  id: String(lessonItem && lessonItem.id || "").trim(),
                  level: "lesson",
                  topic: String(lessonItem && lessonItem.topic || "").trim()
                };
              })
            };
          })
        };
      });
    }

    function buildTaskSheetAnalysis(activeSheet) {
      const tasks = getTaskSheetTasks(activeSheet);
      const allSubtasks = tasks.reduce(function (items, task) {
        return items.concat(getSubtasksForTask(task));
      }, []);
      const totalBe = allSubtasks.reduce(function (sum, subtask) {
        return sum + getBeValue(subtask);
      }, 0);
      const timePerBe = totalBe ? ((Math.max(0, Number(activeSheet && activeSheet.workingTimeMinutes) || 0)) / totalBe) : 0;
      const afbDistribution = allSubtasks.reduce(function (distribution, subtask) {
        const beValue = getBeValue(subtask);
        const weights = getAfbWeightMap(subtask && subtask.afb);

        distribution.afb1 += beValue * weights.afb1;
        distribution.afb2 += beValue * weights.afb2;
        distribution.afb3 += beValue * weights.afb3;
        return distribution;
      }, {
        afb1: 0,
        afb2: 0,
        afb3: 0
      });
      const topicUsageCounts = allSubtasks.reduce(function (lookup, subtask) {
        String(subtask && subtask.topics || "").split(",").map(function (entry) {
          return String(entry || "").trim();
        }).filter(Boolean).forEach(function (topic) {
          const normalizedTopic = normalizeTopicValue(topic);

          if (!normalizedTopic) {
            return;
          }

          lookup[normalizedTopic] = (lookup[normalizedTopic] || 0) + 1;
        });

        return lookup;
      }, {});
      const topicTree = collectAssignedCurriculumTopicTree(activeSheet);

      return {
        tasks: tasks.map(function (task) {
          const subtasks = getSubtasksForTask(task);
          const totalTaskBe = subtasks.reduce(function (sum, subtask) {
            return sum + getBeValue(subtask);
          }, 0);

          return {
            id: String(task && task.id || "").trim(),
            title: String(task && task.title || "").trim(),
            be: totalTaskBe,
            timeMinutes: totalTaskBe * timePerBe,
            subtasks: subtasks.map(function (subtask) {
              const beValue = getBeValue(subtask);

              return {
                id: String(subtask && subtask.id || "").trim(),
                title: String(subtask && subtask.title || "").trim(),
                be: beValue,
                afb: String(subtask && subtask.afb || "").trim().toUpperCase(),
                timeMinutes: beValue * timePerBe
              };
            })
          };
        }),
        totalBe: totalBe,
        timePerBe: timePerBe,
        afbPercentages: {
          afb1: totalBe ? (afbDistribution.afb1 / totalBe) * 100 : 0,
          afb2: totalBe ? (afbDistribution.afb2 / totalBe) * 100 : 0,
          afb3: totalBe ? (afbDistribution.afb3 / totalBe) * 100 : 0
        },
        topicUsageCounts: topicUsageCounts,
        topicTree: topicTree
      };
    }

    function buildAnalysisTopicTreeItems(topicTree, topicUsageCounts, levelClassName) {
      return topicTree.map(function (entry) {
        const topicLabel = String(entry && entry.topic || "").trim() || "Ohne Thema";
        const usageCount = topicUsageCounts[normalizeTopicValue(topicLabel)] || 0;
        const isAssigned = usageCount > 0;
        const childItems = Array.isArray(entry && entry.sequences)
          ? buildAnalysisTopicTreeItems(entry.sequences, topicUsageCounts, "is-sequence")
          : (Array.isArray(entry && entry.lessons)
            ? buildAnalysisTopicTreeItems(entry.lessons, topicUsageCounts, "is-lesson")
            : "");

        return [
          '<li class="bewertung-analysis__topic-item ', escapeValue(levelClassName || "is-series"), isAssigned ? ' is-assigned' : ' is-unassigned', '">',
          '<span class="bewertung-analysis__topic-count">', isAssigned ? escapeValue(String(usageCount)) : "0", '</span>',
          '<span class="bewertung-analysis__topic-label">', escapeValue(topicLabel), '</span>',
          childItems ? '<ul class="bewertung-analysis__topic-children">' + childItems + '</ul>' : '',
          '</li>'
        ].join("");
      }).join("");
    }

    function buildTaskSheetAnalysisPanel(activeSheet) {
      const analysis = buildTaskSheetAnalysis(activeSheet);

      if (String(activeSheet && activeSheet.type || "").trim() !== "aufgabenbogen") {
        return [
          '<section class="bewertung-analysis">',
          buildSectionHeader("Analyse", "analysis", isAnalysisSectionExpanded),
          isAnalysisSectionExpanded ? '<div class="bewertung-editor__placeholder">Fuer Kompetenzraster folgt die Analyse in einem spaeteren Schritt.</div>' : '',
          '</section>'
        ].join("");
      }

      return [
        '<section class="bewertung-analysis">',
        buildSectionHeader("Analyse", "analysis", isAnalysisSectionExpanded),
        isAnalysisSectionExpanded ? [
          '<div class="bewertung-analysis__layout">',
          '<div class="bewertung-analysis__sheet">',
          analysis.tasks.length ? analysis.tasks.map(function (task, index) {
            return [
              '<div class="bewertung-analysis__task">',
              '<div class="bewertung-analysis__task-row">',
              '<span class="bewertung-analysis__task-be">', escapeValue(String(task.be)), '</span>',
              '<span class="bewertung-analysis__task-title">Aufgabe ', escapeValue(String(index + 1)), ': ', escapeValue(task.title || "Ohne Titel"), '</span>',
              '<span class="bewertung-analysis__time">', escapeValue(formatMinutesCompact(task.timeMinutes)), '</span>',
              '</div>',
              task.subtasks.length ? task.subtasks.map(function (subtask) {
                return [
                  '<div class="bewertung-analysis__subtask-row">',
                  '<span class="bewertung-analysis__subtask-be">', escapeValue(String(subtask.be)), '</span>',
                  '<span class="bewertung-analysis__subtask-title">', escapeValue(subtask.title || "Ohne Titel"), ' <span class="bewertung-analysis__subtask-afb">', escapeValue(subtask.afb || "AFB1"), '</span></span>',
                  '<span class="bewertung-analysis__time">', escapeValue(formatMinutesCompact(subtask.timeMinutes)), '</span>',
                  '</div>'
                ].join("");
              }).join("") : '<div class="bewertung-analysis__subtask-row bewertung-analysis__subtask-row--empty"><span class="bewertung-analysis__subtask-title">Keine Teilaufgaben</span></div>',
              '</div>'
            ].join("");
          }).join("") : '<div class="bewertung-analysis__empty">Noch keine Aufgaben vorhanden.</div>',
          '</div>',
          '<div class="bewertung-analysis__stats">',
          '<div class="bewertung-analysis__card">',
          '<h4 class="bewertung-analysis__card-title">Anforderungsbereiche</h4>',
          '<div class="bewertung-analysis__metric"><span>AFB 1</span><strong>', escapeValue(formatPercentValue(analysis.afbPercentages.afb1)), '</strong></div>',
          '<div class="bewertung-analysis__metric"><span>AFB 2</span><strong>', escapeValue(formatPercentValue(analysis.afbPercentages.afb2)), '</strong></div>',
          '<div class="bewertung-analysis__metric"><span>AFB 3</span><strong>', escapeValue(formatPercentValue(analysis.afbPercentages.afb3)), '</strong></div>',
          '</div>',
          '<div class="bewertung-analysis__card">',
          '<h4 class="bewertung-analysis__card-title">Zeit</h4>',
          '<div class="bewertung-analysis__metric"><span>Gesamt-BE</span><strong>', escapeValue(String(analysis.totalBe)), '</strong></div>',
          '<div class="bewertung-analysis__metric"><span>Zeit pro BE</span><strong>', escapeValue(formatMinutesCompact(analysis.timePerBe)), '</strong></div>',
          '</div>',
          '<div class="bewertung-analysis__card">',
          '<h4 class="bewertung-analysis__card-title">Themen</h4>',
          analysis.topicTree.length
            ? '<ul class="bewertung-analysis__topic-tree">' + buildAnalysisTopicTreeItems(analysis.topicTree, analysis.topicUsageCounts, "is-series") + '</ul>'
            : '<div class="bewertung-analysis__empty">Keine Themen aus der zugeordneten Unterrichtsplanung vorhanden.</div>',
          '</div>',
          '</div>',
          '</div>'
        ].join("") : '',
        '</section>'
      ].join("");
    }

    function buildTaskSheetEditor(activeSheet) {
      const tasks = getTaskSheetTasks(activeSheet);

      if (String(activeSheet && activeSheet.type || "").trim() !== "aufgabenbogen") {
        return [
          '<div class="bewertung-editor__placeholder">',
          escapeValue("Spezifische Attribute fuer diesen Bewertungsbogen folgen im naechsten Schritt."),
          '</div>'
        ].join("");
      }

      return [
        '<section class="bewertung-task-sheet">',
        buildSectionHeader("Aufgabenbogen", "tasksheet", isTaskSheetSectionExpanded),
        isTaskSheetSectionExpanded ? [
        '<div class="bewertung-task-sheet__header">',
        '<p class="bewertung-task-sheet__hint">Aufgaben werden nacheinander aufgebaut. Teilaufgaben koennen Themen, Anforderungsbereich und Bewertungseinheiten erhalten.</p>',
        '</div>',
        '<div class="bewertung-task-sheet__body">',
        tasks.map(function (task, taskIndex) {
          const taskId = String(task && task.id || "").trim();
          const taskTitle = String(task && task.title || "").trim();
          const subtasks = Array.isArray(task && task.subtasks) ? task.subtasks : [];

          return [
            '<div class="bewertung-task-sheet__task">',
            '<div class="bewertung-task-sheet__task-row">',
            '<div class="bewertung-task-sheet__task-label">Aufgabe ', escapeValue(String(taskIndex + 1)), '</div>',
            '<input class="bewertung-task-sheet__task-title" type="text" value="', escapeValue(taskTitle), '" placeholder="Titel der Aufgabe" onchange="return window.UnterrichtsassistentApp.updateEvaluationTaskField(\'', escapeValue(taskId), '\', \'title\', this.value)">',
            '<button class="bewertung-task-sheet__delete" type="button" onclick="return window.UnterrichtsassistentApp.deleteEvaluationTask(\'', escapeValue(taskId), '\')">Loeschen</button>',
            '</div>',
            '<div class="bewertung-task-sheet__subtasks">',
            subtasks.map(function (subtask) {
              const subtaskId = String(subtask && subtask.id || "").trim();
              const inputId = buildEvaluationTopicInputId(taskId, subtaskId);
              const listId = buildEvaluationTopicListId(taskId, subtaskId);

              return [
                '<div class="bewertung-task-sheet__subtask-row">',
                '<label class="bewertung-task-sheet__field">',
                '<span class="bewertung-task-sheet__field-label">Titel</span>',
                '<input type="text" value="', escapeValue(String(subtask && subtask.title || "").trim()), '" placeholder="Titel der Teilaufgabe" onchange="return window.UnterrichtsassistentApp.updateEvaluationSubtaskField(\'', escapeValue(taskId), '\', \'', escapeValue(subtaskId), '\', \'title\', this.value)">',
                '</label>',
                '<label class="bewertung-task-sheet__field bewertung-task-sheet__topics-wrap">',
                '<span class="bewertung-task-sheet__field-label">Thema</span>',
                '<input id="', escapeValue(inputId), '" type="text" value="', escapeValue(String(subtask && subtask.topics || "").trim()), '" placeholder="Themen, getrennt mit Komma" autocomplete="off" autocapitalize="none" spellcheck="false" onfocus="return window.UnterrichtsassistentApp.handleEvaluationTopicInputFocus(\'', escapeValue(inputId), '\', \'', escapeValue(listId), '\')" oninput="return window.UnterrichtsassistentApp.handleEvaluationTopicInput(event, \'', escapeValue(listId), '\')" onblur="window.UnterrichtsassistentApp.updateEvaluationSubtaskField(\'', escapeValue(taskId), '\', \'', escapeValue(subtaskId), '\', \'topics\', this.value); return window.UnterrichtsassistentApp.handleEvaluationTopicInputBlur(\'', escapeValue(listId), '\')">',
                '<div class="knowledge-gap-suggestions" id="', escapeValue(listId), '" hidden onpointerdown="return window.UnterrichtsassistentApp.handleEvaluationTopicSuggestionsPointerDown(event, \'', escapeValue(listId), '\')" onpointermove="return window.UnterrichtsassistentApp.handleEvaluationTopicSuggestionsPointerMove(event, \'', escapeValue(listId), '\')" onpointerup="return window.UnterrichtsassistentApp.handleEvaluationTopicSuggestionsPointerUp(event, \'', escapeValue(listId), '\')" onpointercancel="return window.UnterrichtsassistentApp.handleEvaluationTopicSuggestionsPointerUp(event, \'', escapeValue(listId), '\')"></div>',
                '</label>',
                '<label class="bewertung-task-sheet__field">',
                '<span class="bewertung-task-sheet__field-label">AFB</span>',
                '<select onchange="return window.UnterrichtsassistentApp.updateEvaluationSubtaskField(\'', escapeValue(taskId), '\', \'', escapeValue(subtaskId), '\', \'afb\', this.value)">',
                '<option value="afb1"', String(subtask && subtask.afb || "").trim().toLowerCase() === "afb1" ? ' selected' : '', '>AFB1</option>',
                '<option value="afb1/2"', String(subtask && subtask.afb || "").trim().toLowerCase() === "afb1/2" ? ' selected' : '', '>AFB1/2</option>',
                '<option value="afb2"', String(subtask && subtask.afb || "").trim().toLowerCase() === "afb2" ? ' selected' : '', '>AFB2</option>',
                '<option value="afb2/3"', String(subtask && subtask.afb || "").trim().toLowerCase() === "afb2/3" ? ' selected' : '', '>AFB2/3</option>',
                '<option value="afb3"', String(subtask && subtask.afb || "").trim().toLowerCase() === "afb3" ? ' selected' : '', '>AFB3</option>',
                '</select>',
                '</label>',
                '<label class="bewertung-task-sheet__field">',
                '<span class="bewertung-task-sheet__field-label">BE</span>',
                '<input type="number" min="0" step="1" value="', escapeValue(String(Number(subtask && subtask.be) || 0)), '" onchange="return window.UnterrichtsassistentApp.updateEvaluationSubtaskField(\'', escapeValue(taskId), '\', \'', escapeValue(subtaskId), '\', \'be\', this.value)">',
                '</label>',
                '<button class="bewertung-task-sheet__delete" type="button" onclick="return window.UnterrichtsassistentApp.deleteEvaluationSubtask(\'', escapeValue(taskId), '\', \'', escapeValue(subtaskId), '\')">Loeschen</button>',
                '</div>'
              ].join("");
            }).join(""),
            '<button class="bewertung-task-sheet__add-row bewertung-task-sheet__add-row--subtask" type="button" onclick="return window.UnterrichtsassistentApp.addEvaluationSubtask(\'', escapeValue(taskId), '\')">+</button>',
            '</div>',
            '</div>'
          ].join("");
        }).join(""),
        '<button class="bewertung-task-sheet__add-row bewertung-task-sheet__add-row--task" type="button" onclick="return window.UnterrichtsassistentApp.addEvaluationTask()">+</button>',
        '</div>',
        ].join("") : '',
        '</section>'
      ].join("");
    }

    function renderCreateMode() {
      const sheets = activeClass ? getSheetsForActiveClass() : [];
      const activeSheetId = String(snapshot.activeEvaluationSheetId || "").trim();
      const activeSheet = sheets.find(function (sheet) {
        return String(sheet && sheet.id || "").trim() === activeSheetId;
      }) || sheets[0] || null;

      if (!activeClass) {
        return [
          '<div class="unterricht-layout">',
          '<article class="panel unterricht-layout__content">',
          '<p class="empty-message">Waehle zuerst eine Lerngruppe, damit du Bewertungsboegen anlegen und bearbeiten kannst.</p>',
          '</article>',
          '</div>'
        ].join("");
      }

      return [
        '<div class="bewertung-layout">',
        activeSheet ? [
          '<article class="panel bewertung-editor">',
          '<div class="bewertung-editor__header">',
          '<div>',
          '<h2 class="bewertung-editor__title">', escapeValue(String(activeSheet.title || "").trim() || "Ohne Titel"), '</h2>',
          '<p class="bewertung-editor__meta">', escapeValue(getTypeLabel(activeSheet.type)), ' | ', escapeValue(formatDateTimeLabel(activeSheet.createdAt)), '</p>',
          '</div>',
          '</div>',
          '<div class="bewertung-editor__fields">',
          '<label class="import-modal__field bewertung-editor__field">',
          '<span>Titel</span>',
          '<input type="text" maxlength="120" value="', escapeValue(String(activeSheet.title || "").trim()), '" onchange="return window.UnterrichtsassistentApp.updateActiveEvaluationSheetField(\'title\', this.value)">',
          '</label>',
          '<label class="import-modal__field bewertung-editor__field">',
          '<span>Art</span>',
          '<select onchange="return window.UnterrichtsassistentApp.updateActiveEvaluationSheetField(\'type\', this.value)">',
          '<option value="aufgabenbogen"', String(activeSheet.type || "").trim() === "aufgabenbogen" ? ' selected' : '', '>Aufgabenbogen</option>',
          '<option value="kompetenzraster"', String(activeSheet.type || "").trim() === "kompetenzraster" ? ' selected' : '', '>Kompetenzraster</option>',
          '</select>',
          '</label>',
          '<div class="import-modal__field bewertung-editor__field">',
          '<span>Bearbeitungszeit</span>',
          buildWorkingTimeFields(
            "evaluationSheetEditorWorkingTime",
            activeSheet.workingTimeMinutes,
            "return window.UnterrichtsassistentApp.updateActiveEvaluationSheetField('workingTimeMinutes', ((Number(document.getElementById('__DAYS_ID__') && document.getElementById('__DAYS_ID__').value) || 0) * 1440) + ((Number(document.getElementById('__HOURS_ID__') && document.getElementById('__HOURS_ID__').value) || 0) * 60) + (Number(document.getElementById('__MINUTES_ID__') && document.getElementById('__MINUTES_ID__').value) || 0))"
          ),
          '</div>',
          '</div>',
          '</article>',
          '<article class="panel bewertung-curriculum__panel', isCurriculumSectionExpanded ? '' : ' is-collapsed', '">',
          buildCurriculumAssignmentContent(activeSheet),
          '</article>',
          '<article class="panel bewertung-editor', isTaskSheetSectionExpanded ? '' : ' is-collapsed', '">',
          buildTaskSheetEditor(activeSheet),
          '</article>',
          '<article class="panel bewertung-analysis__panel', isAnalysisSectionExpanded ? '' : ' is-collapsed', '">',
          buildTaskSheetAnalysisPanel(activeSheet),
          '</article>'
        ].join("") : [
          '<article class="panel bewertung-editor">',
          '<p class="empty-message">Lege ueber den Plus-Button den ersten Bewertungsbogen fuer diese Lerngruppe an.</p>',
          '</article>'
        ].join(""),
        draft ? (function () {
          const copyOptions = ['<option value="">Keine Kopie</option>'].concat(sheets.map(function (sheet) {
            const sheetId = String(sheet && sheet.id || "").trim();
            const label = (String(sheet && sheet.title || "").trim() || "Ohne Titel") + " | " + formatDateTimeLabel(sheet && sheet.createdAt);
            const selected = String(draft && draft.copyFromId || "").trim() === sheetId ? ' selected' : '';

            return '<option value="' + escapeValue(sheetId) + '"' + selected + '>' + escapeValue(label) + '</option>';
          })).join("");

          return [
            '<div class="import-modal" id="evaluationSheetModal">',
            '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeEvaluationSheetModal()"></div>',
            '<div class="import-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="evaluationSheetModalTitle">',
            '<div class="import-modal__header">',
            '<div>',
            '<h3 id="evaluationSheetModalTitle">Neuen Bewertungsbogen anlegen</h3>',
            '<div class="import-modal__meta">', escapeValue([String(activeClass.name || "").trim(), String(activeClass.subject || "").trim()].filter(Boolean).join(" ")), '</div>',
            '</div>',
            '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closeEvaluationSheetModal()">x</button>',
            '</div>',
            '<form class="import-modal__form" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitEvaluationSheetModal(event)">',
            '<label class="import-modal__field">',
            '<span>Kopie von</span>',
            '<select id="evaluationSheetCopyFromInput" onchange="return window.UnterrichtsassistentApp.selectEvaluationSheetCopySource(this.value)">',
            copyOptions,
            '</select>',
            '</label>',
            '<label class="import-modal__field">',
            '<span>Art des Bewertungsbogens</span>',
            '<select id="evaluationSheetTypeInput">',
            '<option value="aufgabenbogen"', String(draft && draft.type || "aufgabenbogen").trim() === "aufgabenbogen" ? ' selected' : '', '>Aufgabenbogen</option>',
            '<option value="kompetenzraster"', String(draft && draft.type || "").trim() === "kompetenzraster" ? ' selected' : '', '>Kompetenzraster</option>',
            '</select>',
            '</label>',
            '<label class="import-modal__field">',
            '<span>Titel</span>',
            '<input id="evaluationSheetTitleInput" type="text" maxlength="120" value="', escapeValue(String(draft && draft.title || "").trim()), '" placeholder="Titel des Bewertungsbogens" autocomplete="off" autocapitalize="sentences" spellcheck="false" required>',
            '</label>',
            '<div class="import-modal__field">',
            '<span>Bearbeitungszeit</span>',
            buildWorkingTimeFields(
              "evaluationSheetWorkingTime",
              draft && draft.workingTimeMinutes,
              ""
            ),
            '</div>',
            '<div class="import-modal__actions">',
            '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.closeEvaluationSheetModal()">Abbrechen</button>',
            '<button class="circle-action" type="submit">Anlegen</button>',
            '</div>',
            '</form>',
            '</div>',
            '</div>'
          ].join("");
        }()) : "",
        '</div>'
      ].join("");
    }

    const modeLabels = {
      bewerten: "Bewerten",
      analysieren: "Analysieren",
      erstellen: "Erstellen",
      entwerfen: "Erstellen"
    };
    const activeModeLabel = modeLabels[mode] || modeLabels.bewerten;

    if (mode === "erstellen" || mode === "entwerfen") {
      return renderCreateMode();
    }

    return [
      '<div class="unterricht-layout">',
      '<article class="panel unterricht-layout__content">',
      '<div class="seat-plan-placeholder">',
      '<div>',
      '<strong>' + escapeValue(activeModeLabel) + '</strong><br>',
      escapeValue("Der Bereich Bewertung wird hier als naechstes ausgebaut."),
      '</div>',
      '</div>',
      '</article>',
      '</div>'
    ].join("");
  }
};

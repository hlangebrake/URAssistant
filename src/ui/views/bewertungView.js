window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.bewertung = {
  id: "bewertung",
  title: "Bewertung",
  render: function (service) {
    const viewRuntime = window.Unterrichtsassistent.ui.views.bewertung;
    const activeClass = service && typeof service.getActiveClass === "function"
      ? service.getActiveClass()
      : null;
    const mode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getBewertungViewMode === "function"
      ? window.UnterrichtsassistentApp.getBewertungViewMode()
      : "bewerten";
    const draft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveEvaluationSheetDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveEvaluationSheetDraft()
      : null;
    const plannedEvaluationDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActivePlannedEvaluationDraft === "function"
      ? window.UnterrichtsassistentApp.getActivePlannedEvaluationDraft()
      : null;
    const classtimeImportDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveClasstimeImportDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveClasstimeImportDraft()
      : null;
    const snapshot = service && service.snapshot ? service.snapshot : {};
    const schoolYearStart = String(snapshot.schoolYearStart || "").slice(0, 10);
    const schoolYearEnd = String(snapshot.schoolYearEnd || "").slice(0, 10);
    const planningEvents = window.Unterrichtsassistent.ui.viewHelpers.callApp("getPlanningEventsForDisplay", [snapshot, {
          rangeStart: schoolYearStart,
          rangeEnd: schoolYearEnd
        }], function () {
          return Array.isArray(snapshot.planningEvents) ? snapshot.planningEvents : [];
        });
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
    const isAnalysisOverviewSectionExpanded = !(window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isBewertungAnalysisOverviewSectionExpanded === "function")
      || window.UnterrichtsassistentApp.isBewertungAnalysisOverviewSectionExpanded();
    const isDiscussionGroupsSectionExpanded = !(window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isBewertungDiscussionGroupsSectionExpanded === "function")
      || window.UnterrichtsassistentApp.isBewertungDiscussionGroupsSectionExpanded();
    const isPlannedEvaluationsExpanded = Boolean(window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isBewertungPlannedEvaluationsExpanded === "function"
      && window.UnterrichtsassistentApp.isBewertungPlannedEvaluationsExpanded());
    const isPlannedEvaluationDetailsExpanded = !(window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isBewertungPlannedEvaluationDetailsExpanded === "function")
      || window.UnterrichtsassistentApp.isBewertungPlannedEvaluationDetailsExpanded();
    const activePerformedPlannedEvaluationId = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActivePerformedPlannedEvaluationId === "function"
      ? String(window.UnterrichtsassistentApp.getActivePerformedPlannedEvaluationId() || "").trim()
      : "";
    const activeAnalysisPlannedEvaluationId = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveAnalysisPlannedEvaluationId === "function"
      ? String(window.UnterrichtsassistentApp.getActiveAnalysisPlannedEvaluationId() || "").trim()
      : "";
    const bewertungAnalysisSort = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getBewertungAnalysisSort === "function"
      ? window.UnterrichtsassistentApp.getBewertungAnalysisSort()
      : { key: "student", direction: "asc" };
    const bewertungAnalysisColumnVisibility = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getBewertungAnalysisColumnVisibility === "function"
      ? window.UnterrichtsassistentApp.getBewertungAnalysisColumnVisibility()
      : { tasks: true, subtasks: true };
    const activePerformedEvaluationStudentId = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActivePerformedEvaluationStudentId === "function"
      ? String(window.UnterrichtsassistentApp.getActivePerformedEvaluationStudentId() || "").trim()
      : "";
    const activeEvaluationSubtaskTopicModal = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveEvaluationSubtaskTopicModal === "function"
      ? window.UnterrichtsassistentApp.getActiveEvaluationSubtaskTopicModal()
      : null;
    const curriculumInstructionTopicTreeState = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getCurriculumInstructionTopicTreeState === "function"
      ? window.UnterrichtsassistentApp.getCurriculumInstructionTopicTreeState()
      : { status: "idle", data: null };
    const activePerformedEvaluationStudentFilter = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActivePerformedEvaluationStudentFilter === "function"
      ? String(window.UnterrichtsassistentApp.getActivePerformedEvaluationStudentFilter() || "alle").trim().toLowerCase()
      : "alle";
    const activePerformedEvaluationDetailModal = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActivePerformedEvaluationDetailModal === "function"
      ? window.UnterrichtsassistentApp.getActivePerformedEvaluationDetailModal()
      : null;
    const performedCompetencyGridMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPerformedCompetencyGridMode === "function"
      ? window.UnterrichtsassistentApp.getPerformedCompetencyGridMode()
      : "kompakt";

    const escapeValue = window.Unterrichtsassistent.ui.viewHelpers.escapeValue;
    const callApp = window.Unterrichtsassistent.ui.viewHelpers.callApp;
    const parseLocalDate = window.Unterrichtsassistent.ui.viewHelpers.parseLocalDate;
    const toIsoDate = window.Unterrichtsassistent.ui.viewHelpers.toIsoDate;
    const formatShortDateLabel = window.Unterrichtsassistent.ui.viewHelpers.formatShortDateLabel;
    const formatLongDateLabel = window.Unterrichtsassistent.ui.viewHelpers.formatLongDateLabel;

    function formatPointsLabel(value) {
      const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
      const roundedValue = Math.round(numericValue * 2) / 2;

      if (Math.abs(roundedValue - Math.round(roundedValue)) < 0.001) {
        return String(Math.round(roundedValue));
      }

      return roundedValue.toFixed(1).replace(".", ",");
    }

    function formatCompactPointsLabel(value) {
      return formatPointsLabel(value);
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

    function getClassLabel(classId) {
      const normalizedClassId = String(classId || "").trim();
      const classEntry = Array.isArray(snapshot.classes)
        ? snapshot.classes.find(function (item) {
            return String(item && item.id || "").trim() === normalizedClassId;
          }) || null
        : null;
      const labelParts = [
        String(classEntry && classEntry.name || "").trim(),
        String(classEntry && classEntry.subject || "").trim()
      ].filter(Boolean);

      return labelParts.join(" ") || "Andere Lerngruppe";
    }

    function buildEvaluationSheetCopyOptions(draftValue) {
      const allSheets = Array.isArray(snapshot.evaluationSheets) ? snapshot.evaluationSheets : [];
      const activeClassId = String(activeClass && activeClass.id || "").trim();
      const selectedCopyId = String(draftValue && draftValue.copyFromId || "").trim();
      const selectedType = String(draftValue && draftValue.type || "aufgabenbogen").trim().toLowerCase() === "kompetenzraster"
        ? "kompetenzraster"
        : "aufgabenbogen";
      const filteredSheets = allSheets.filter(function (sheet) {
        return String(sheet && sheet.type || "aufgabenbogen").trim().toLowerCase() === selectedType
          && String(sheet && sheet.id || "").trim() !== String(draftValue && draftValue.id || "").trim();
      });
      const currentClassSheets = filteredSheets.filter(function (sheet) {
        return String(sheet && sheet.classId || "").trim() === activeClassId;
      });
      const otherClassSheets = filteredSheets.filter(function (sheet) {
        return String(sheet && sheet.classId || "").trim() !== activeClassId;
      });

      function sortSheets(left, right) {
        const leftCreatedAt = String(left && left.createdAt || "").trim();
        const rightCreatedAt = String(right && right.createdAt || "").trim();

        if (leftCreatedAt === rightCreatedAt) {
          return String(left && left.title || "").localeCompare(String(right && right.title || ""), "de-DE");
        }

        return rightCreatedAt.localeCompare(leftCreatedAt);
      }

      function renderSheetOption(sheet, includeClassLabel) {
        const sheetId = String(sheet && sheet.id || "").trim();
        const title = String(sheet && sheet.title || "").trim() || "Ohne Titel";
        const classLabel = includeClassLabel ? getClassLabel(sheet && sheet.classId) + " | " : "";
        const label = classLabel + title + " | " + formatDateTimeLabel(sheet && sheet.createdAt);
        const selected = selectedCopyId === sheetId ? ' selected' : '';

        return '<option value="' + escapeValue(sheetId) + '"' + selected + '>' + escapeValue(label) + '</option>';
      }

      return [
        '<option value="">Keine Kopie</option>',
        currentClassSheets.length
          ? '<optgroup label="Aktuelle Lerngruppe">' + currentClassSheets.slice().sort(sortSheets).map(function (sheet) {
              return renderSheetOption(sheet, false);
            }).join("") + '</optgroup>'
          : '',
        otherClassSheets.length
          ? '<optgroup label="Andere Lerngruppen">' + otherClassSheets.slice().sort(function (left, right) {
              const leftClass = getClassLabel(left && left.classId);
              const rightClass = getClassLabel(right && right.classId);

              if (leftClass === rightClass) {
                return sortSheets(left, right);
              }

              return leftClass.localeCompare(rightClass, "de-DE");
            }).map(function (sheet) {
              return renderSheetOption(sheet, true);
            }).join("") + '</optgroup>'
          : ''
      ].join("");
    }

    function getStudentsForActiveClass() {
      return activeClass && service && typeof service.getStudentsForClass === "function"
        ? service.getStudentsForClass(activeClass.id).slice()
        : [];
    }

    function sortStudentsByFirstName(left, right) {
      const leftFirstName = String(left && left.firstName || "").trim();
      const rightFirstName = String(right && right.firstName || "").trim();
      const firstNameComparison = leftFirstName.localeCompare(rightFirstName, "de-DE", { sensitivity: "base" });

      if (firstNameComparison !== 0) {
        return firstNameComparison;
      }

      const leftLastName = String(left && left.lastName || "").trim();
      const rightLastName = String(right && right.lastName || "").trim();
      const lastNameComparison = leftLastName.localeCompare(rightLastName, "de-DE", { sensitivity: "base" });

      if (lastNameComparison !== 0) {
        return lastNameComparison;
      }

      return String(left && left.id || "").trim().localeCompare(String(right && right.id || "").trim(), "de-DE");
    }

    function getPlannedEvaluationsForActiveClass() {
      const allItems = Array.isArray(snapshot.plannedEvaluations) ? snapshot.plannedEvaluations : [];
      const classId = String(activeClass && activeClass.id || "").trim();

      return allItems.filter(function (item) {
        return String(item && item.classId || "").trim() === classId;
      }).slice().sort(function (left, right) {
        const leftDate = String(left && left.date || "").slice(0, 10);
        const rightDate = String(right && right.date || "").slice(0, 10);
        const leftCreatedAt = String(left && left.createdAt || "").trim();
        const rightCreatedAt = String(right && right.createdAt || "").trim();

        if (leftDate === rightDate) {
          return rightCreatedAt.localeCompare(leftCreatedAt);
        }

        return rightDate.localeCompare(leftDate);
      });
    }

    function getPlannedEvaluationTypeLabel(typeValue) {
      return String(typeValue || "").trim().toLowerCase() === "schriftliche"
        ? "Schriftliche"
        : "Sonstige";
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

    function getAvailableEvaluationDates() {
      return buildInstructionLessonOccurrences().filter(function (occurrence) {
        return !Boolean(occurrence && occurrence.isCancelled) && Math.max(0, Number(occurrence && occurrence.remainingLessonCount || 0)) > 0;
      }).map(function (occurrence) {
        return {
          date: String(occurrence && occurrence.lessonDate || "").slice(0, 10),
          label: formatLongDateLabel(occurrence && occurrence.lessonDate)
        };
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

    function isAdditionalSubtask(item) {
      return Boolean(item && item.isAdditionalTask);
    }

    function getRegularBeValue(item) {
      return isAdditionalSubtask(item) ? 0 : getBeValue(item);
    }

    function formatReachableLabel(regularValue, additionalValue) {
      const additional = Math.max(0, Number(additionalValue) || 0);

      return additional > 0
        ? formatPointsLabel(regularValue) + " (+" + formatPointsLabel(additional) + ")"
        : formatPointsLabel(regularValue);
    }

    function roundUpHalfPointThreshold(value) {
      return Math.ceil((Math.max(0, Number(value) || 0) - 0.000001) * 2) / 2;
    }

    function getCompetencySourceOptions() {
      return callApp("getEvaluationCompetencySourceOptions", [], [{ id: "", label: "Keine Kompetenzquelle" }]);
    }

    function getCompetencyAspectOptions(sourceToolId) {
      return callApp("getEvaluationCompetencyAspectOptions", [sourceToolId], []);
    }

    function buildCompetencySourceField(activeSheet) {
      const selectedSourceId = String(activeSheet && activeSheet.competencySourceToolId || "").trim();
      const options = getCompetencySourceOptions();

      return [
        '<label class="import-modal__field bewertung-editor__field">',
        '<span>Kompetenz Quelle</span>',
        '<select onchange="return window.UnterrichtsassistentApp.updateActiveEvaluationSheetField(\'competencySourceToolId\', this.value)">',
        options.map(function (option) {
          const optionId = String(option && option.id || "").trim();
          const optionLabel = String(option && option.label || "").trim() || "Kompetenzquelle";

          return '<option value="' + escapeValue(optionId) + '"' + (optionId === selectedSourceId ? ' selected' : '') + '>' + escapeValue(optionLabel) + '</option>';
        }).join(""),
        '</select>',
        '</label>'
      ].join("");
    }

    function buildSubtaskCompetencySelect(taskId, subtaskId, subtask, activeSheet) {
      const sourceToolId = String(activeSheet && activeSheet.competencySourceToolId || "").trim();
      const selectedLookup = (Array.isArray(subtask && subtask.competencyAspectIds) ? subtask.competencyAspectIds : []).reduce(function (lookup, aspectId) {
        lookup[String(aspectId || "").trim()] = true;
        return lookup;
      }, {});
      const options = sourceToolId ? getCompetencyAspectOptions(sourceToolId) : [];

      return [
        '<label class="bewertung-task-sheet__field bewertung-task-sheet__field--competency">',
        '<span class="bewertung-task-sheet__field-label">Kompetenz</span>',
        '<select multiple size="4"', options.length ? '' : ' disabled', ' onchange="return window.UnterrichtsassistentApp.updateEvaluationSubtaskField(\'', escapeValue(taskId), '\', \'', escapeValue(subtaskId), '\', \'competencyAspectIds\', Array.prototype.slice.call(this.selectedOptions).map(function(option) { return option.value; }).filter(Boolean).join(\'|\'))">',
        options.length ? options.map(function (option) {
          const optionId = String(option && option.id || "").trim();
          const optionLabel = String(option && option.label || "").trim() || "Kompetenz";

          return '<option value="' + escapeValue(optionId) + '"' + (selectedLookup[optionId] ? ' selected' : '') + '>' + escapeValue(optionLabel) + '</option>';
        }).join("") : '<option value="">Keine Quelle gewaehlt</option>',
        '</select>',
        '</label>'
      ].join("");
    }

    function getCurriculumTopicNodeLookup() {
      const nodes = curriculumInstructionTopicTreeState && curriculumInstructionTopicTreeState.data && Array.isArray(curriculumInstructionTopicTreeState.data.nodes)
        ? curriculumInstructionTopicTreeState.data.nodes
        : [];

      return nodes.reduce(function (lookup, nodeItem) {
        const nodeId = String(nodeItem && nodeItem.id || "").trim();

        if (nodeId) {
          lookup[nodeId] = nodeItem;
        }

        return lookup;
      }, {});
    }

    function getCurriculumTopicNodeLabel(nodeId) {
      const normalizedNodeId = String(nodeId || "").trim();
      const nodeLookup = getCurriculumTopicNodeLookup();
      const nodeItem = nodeLookup[normalizedNodeId] || null;

      return String(nodeItem && (nodeItem.name || nodeItem.title || nodeItem.label) || "").trim() || normalizedNodeId;
    }

    function getAllowedEvaluationCurriculumTopicNodeIds() {
      return window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveEvaluationSheetAllowedCurriculumTopicNodeIds === "function"
        ? window.UnterrichtsassistentApp.getActiveEvaluationSheetAllowedCurriculumTopicNodeIds().map(function (nodeId) {
            return String(nodeId || "").trim();
          }).filter(Boolean)
        : [];
    }

    function buildSubtaskCurriculumTopicSummary(subtask, allowedLookup) {
      const selectedNodeIds = (Array.isArray(subtask && subtask.curriculumTopicNodeIds) ? subtask.curriculumTopicNodeIds : []).map(function (nodeId) {
        return String(nodeId || "").trim();
      }).filter(function (nodeId) {
        return Boolean(nodeId && allowedLookup[nodeId]);
      });

      if (!selectedNodeIds.length) {
        return '<div class="bewertung-task-sheet__topic-summary is-empty">Keine Auswahl</div>';
      }

      return [
        '<div class="bewertung-task-sheet__topic-summary">',
        selectedNodeIds.slice(0, 4).map(function (nodeId) {
          return '<span class="bewertung-task-sheet__topic-chip" title="' + escapeValue(getCurriculumTopicNodeLabel(nodeId)) + '">' + escapeValue(getCurriculumTopicNodeLabel(nodeId)) + '</span>';
        }).join(""),
        selectedNodeIds.length > 4 ? '<span class="bewertung-task-sheet__topic-chip bewertung-task-sheet__topic-chip--more">+' + escapeValue(String(selectedNodeIds.length - 4)) + '</span>' : '',
        '</div>'
      ].join("");
    }

    function buildSubtaskCurriculumTopicPicker(taskId, subtaskId, subtask, activeSheet) {
      const allowedNodeIds = getAllowedEvaluationCurriculumTopicNodeIds(activeSheet);
      const allowedLookup = allowedNodeIds.reduce(function (lookup, nodeId) {
        lookup[nodeId] = true;
        return lookup;
      }, {});
      const selectedCount = (Array.isArray(subtask && subtask.curriculumTopicNodeIds) ? subtask.curriculumTopicNodeIds : []).filter(function (nodeId) {
        return Boolean(allowedLookup[String(nodeId || "").trim()]);
      }).length;

      return [
        '<div class="bewertung-task-sheet__field bewertung-task-sheet__field--topics">',
        '<span class="bewertung-task-sheet__field-label">Stoff</span>',
        '<button class="secondary-text-action bewertung-task-sheet__topic-button" type="button"', allowedNodeIds.length ? '' : ' disabled', ' onclick="return window.UnterrichtsassistentApp.openEvaluationSubtaskTopicModal(\'', escapeValue(taskId), '\', \'', escapeValue(subtaskId), '\')">Stoffinhalte', selectedCount ? ' (' + escapeValue(String(selectedCount)) + ')' : '', '</button>',
        buildSubtaskCurriculumTopicSummary(subtask, allowedLookup),
        '</div>'
      ].join("");
    }

    function buildEvaluationSubtaskTopicModal(activeSheet) {
      const modal = activeEvaluationSubtaskTopicModal;
      const allowedNodeIds = getAllowedEvaluationCurriculumTopicNodeIds(activeSheet);
      const selectedLookup = (Array.isArray(modal && modal.selectedNodeIds) ? modal.selectedNodeIds : []).reduce(function (lookup, nodeId) {
        lookup[String(nodeId || "").trim()] = true;
        return lookup;
      }, {});

      if (!modal) {
        return "";
      }

      return [
        '<div class="import-modal" id="evaluationSubtaskTopicModal">',
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeEvaluationSubtaskTopicModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--curriculum-topic bewertung-task-sheet__topic-modal" role="dialog" aria-modal="true" aria-labelledby="evaluationSubtaskTopicModalTitle">',
        '<div class="import-modal__header">',
        '<div>',
        '<h3 id="evaluationSubtaskTopicModalTitle">Stoffinhalte</h3>',
        '<div class="import-modal__meta">Aus den zugeordneten Reihen, Sequenzen und Stunden</div>',
        '</div>',
        '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closeEvaluationSubtaskTopicModal()">x</button>',
        '</div>',
        '<div class="bewertung-task-sheet__topic-modal-body">',
        allowedNodeIds.length ? allowedNodeIds.map(function (nodeId) {
          const nodeLabel = getCurriculumTopicNodeLabel(nodeId);

          return [
            '<label class="bewertung-task-sheet__topic-option">',
            '<input type="checkbox" value="', escapeValue(nodeId), '"', selectedLookup[nodeId] ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.toggleEvaluationSubtaskTopicModalNode(\'', escapeValue(nodeId), '\', this.checked)">',
            '<span>', escapeValue(nodeLabel), '</span>',
            '</label>'
          ].join("");
        }).join("") : '<p class="empty-message">Ordne dem Bewertungsbogen zuerst Unterrichtsreihen, Sequenzen oder Stunden mit Stoffinhalten zu.</p>',
        '</div>',
        '<div class="import-modal__actions">',
        '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.closeEvaluationSubtaskTopicModal()">Abbrechen</button>',
        '<button class="circle-action" type="button" onclick="return window.UnterrichtsassistentApp.confirmEvaluationSubtaskTopicModal()">Uebernehmen</button>',
        '</div>',
        '</div>',
        '</div>'
      ].join("");
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
        return sum + getRegularBeValue(subtask);
      }, 0);
      const totalAdditionalBe = allSubtasks.reduce(function (sum, subtask) {
        return sum + (isAdditionalSubtask(subtask) ? getBeValue(subtask) : 0);
      }, 0);
      const timePerBe = totalBe ? ((Math.max(0, Number(activeSheet && activeSheet.workingTimeMinutes) || 0)) / totalBe) : 0;
      const afbDistribution = allSubtasks.reduce(function (distribution, subtask) {
        const beValue = getRegularBeValue(subtask);
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
            return sum + getRegularBeValue(subtask);
          }, 0);
          const totalTaskAdditionalBe = subtasks.reduce(function (sum, subtask) {
            return sum + (isAdditionalSubtask(subtask) ? getBeValue(subtask) : 0);
          }, 0);

          return {
            id: String(task && task.id || "").trim(),
            title: String(task && task.title || "").trim(),
            be: totalTaskBe,
            additionalBe: totalTaskAdditionalBe,
            timeMinutes: totalTaskBe * timePerBe,
            subtasks: subtasks.map(function (subtask) {
              const beValue = getRegularBeValue(subtask);
              const additionalBeValue = isAdditionalSubtask(subtask) ? getBeValue(subtask) : 0;

              return {
                id: String(subtask && subtask.id || "").trim(),
                title: String(subtask && subtask.title || "").trim(),
                be: beValue,
                additionalBe: additionalBeValue,
                isAdditionalTask: isAdditionalSubtask(subtask),
                afb: String(subtask && subtask.afb || "").trim().toUpperCase(),
                timeMinutes: beValue * timePerBe
              };
            })
          };
        }),
        totalBe: totalBe,
        totalAdditionalBe: totalAdditionalBe,
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
              '<span class="bewertung-analysis__task-be">', escapeValue(formatReachableLabel(task.be, task.additionalBe)), '</span>',
              '<span class="bewertung-analysis__task-title">Aufgabe ', escapeValue(String(index + 1)), ': ', escapeValue(task.title || "Ohne Titel"), '</span>',
              '<span class="bewertung-analysis__time">', escapeValue(formatMinutesCompact(task.timeMinutes)), '</span>',
              '</div>',
              task.subtasks.length ? task.subtasks.map(function (subtask) {
                return [
                  '<div class="bewertung-analysis__subtask-row">',
                  '<span class="bewertung-analysis__subtask-be">', escapeValue(formatReachableLabel(subtask.be, subtask.additionalBe)), '</span>',
                  '<span class="bewertung-analysis__subtask-title">', escapeValue(subtask.title || "Ohne Titel"), subtask.isAdditionalTask ? ' <span class="bewertung-analysis__subtask-afb">Zusatzaufgabe</span>' : '', ' <span class="bewertung-analysis__subtask-afb">', escapeValue(subtask.afb || "AFB1"), '</span></span>',
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
          '<div class="bewertung-analysis__metric"><span>Gesamt-BE</span><strong>', escapeValue(formatReachableLabel(analysis.totalBe, analysis.totalAdditionalBe)), '</strong></div>',
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

    function buildStudentRows(students) {
      const rows = [];
      let index = 0;

      while (index < students.length) {
        rows.push(students.slice(index, index + 5));
        index += 5;
      }

      return rows;
    }

    function getStudentDisplayName(student) {
      return [String(student && student.firstName || "").trim(), String(student && student.lastName || "").trim()]
        .filter(Boolean)
        .join(" ")
        .trim() || String(student && student.firstName || "").trim() || "Ohne Namen";
    }

    function renderBewertenMode() {
      const sheets = getSheetsForActiveClass();
      const students = getStudentsForActiveClass();
      const plannedEvaluations = getPlannedEvaluationsForActiveClass();
      const performedEvaluations = Array.isArray(snapshot.performedEvaluations) ? snapshot.performedEvaluations : [];
      const visiblePlannedEvaluations = isPlannedEvaluationsExpanded ? plannedEvaluations : plannedEvaluations.slice(0, 4);
      const hiddenPlannedEvaluationsCount = Math.max(0, plannedEvaluations.length - visiblePlannedEvaluations.length);
      const availableDates = getAvailableEvaluationDates();
      const selectedStudentLookup = (plannedEvaluationDraft && Array.isArray(plannedEvaluationDraft.studentIds) ? plannedEvaluationDraft.studentIds : []).reduce(function (lookup, studentId) {
        lookup[String(studentId || "").trim()] = true;
        return lookup;
      }, {});
      const sheetLookup = sheets.reduce(function (lookup, sheet) {
        const sheetId = String(sheet && sheet.id || "").trim();

        if (sheetId) {
          lookup[sheetId] = sheet;
        }

        return lookup;
      }, {});
      const studentLookup = students.reduce(function (lookup, student) {
        const studentId = String(student && student.id || "").trim();

        if (studentId) {
          lookup[studentId] = student;
        }

        return lookup;
      }, {});
      const selectedPlannedEvaluation = plannedEvaluations.find(function (plannedEvaluation) {
        return String(plannedEvaluation && plannedEvaluation.id || "").trim() === activePerformedPlannedEvaluationId;
      }) || null;
      const selectedEvaluationSheet = selectedPlannedEvaluation
        ? sheetLookup[String(selectedPlannedEvaluation && selectedPlannedEvaluation.evaluationSheetId || "").trim()] || null
        : null;
      const assignedStudents = selectedPlannedEvaluation && Array.isArray(selectedPlannedEvaluation.studentIds)
        ? selectedPlannedEvaluation.studentIds.map(function (studentId) {
            return studentLookup[String(studentId || "").trim()] || null;
          }).filter(Boolean).sort(sortStudentsByFirstName)
        : [];
      const performedEvaluationLookup = selectedPlannedEvaluation
        ? performedEvaluations.reduce(function (lookup, entry) {
            const studentId = String(entry && entry.studentId || "").trim();

            if (studentId && String(entry && entry.plannedEvaluationId || "").trim() === String(selectedPlannedEvaluation.id || "").trim()) {
              lookup[studentId] = entry;
            }

            return lookup;
          }, {})
        : {};
      const studentPerformanceSummaries = selectedPlannedEvaluation && selectedEvaluationSheet
        ? assignedStudents.reduce(function (lookup, student) {
            const studentId = String(student && student.id || "").trim();
            const performedEvaluation = performedEvaluationLookup[studentId] || null;

            if (studentId) {
              lookup[studentId] = buildStudentPerformanceSummary(selectedPlannedEvaluation, selectedEvaluationSheet, performedEvaluation);
            }

            return lookup;
          }, {})
        : {};
      const visibleAssignedStudents = assignedStudents.filter(function (student) {
        const studentId = String(student && student.id || "").trim();
        const summary = studentPerformanceSummaries[studentId] || null;
        const isCompleted = Boolean(summary && summary.isCompleted);

        if (activePerformedEvaluationStudentFilter === "offen") {
          return !isCompleted;
        }

        if (activePerformedEvaluationStudentFilter === "abgeschlossen") {
          return isCompleted;
        }

        return true;
      });
      const selectedStudent = visibleAssignedStudents.find(function (student) {
        return String(student && student.id || "").trim() === activePerformedEvaluationStudentId;
      }) || visibleAssignedStudents[0] || null;
      const selectedPerformedEvaluation = selectedStudent
        ? performedEvaluationLookup[String(selectedStudent && selectedStudent.id || "").trim()] || null
        : null;
      const selectedSubtaskLookup = selectedPerformedEvaluation && Array.isArray(selectedPerformedEvaluation.subtaskResults)
        ? selectedPerformedEvaluation.subtaskResults.reduce(function (lookup, entry) {
            const subtaskId = String(entry && entry.subtaskId || "").trim();

            if (subtaskId) {
              lookup[subtaskId] = entry;
            }

            return lookup;
          }, {})
        : {};
      const selectedCompetencyResultLookup = selectedPerformedEvaluation && Array.isArray(selectedPerformedEvaluation.competencyResults)
        ? selectedPerformedEvaluation.competencyResults.reduce(function (lookup, entry) {
            const rowId = String(entry && entry.rowId || "").trim();

            if (rowId) {
              lookup[rowId] = entry;
            }

            return lookup;
          }, {})
        : {};
      const selectedPerformanceSummary = selectedStudent
        ? studentPerformanceSummaries[String(selectedStudent && selectedStudent.id || "").trim()] || null
        : null;

      function getFeedbackItems(subtaskResult, detailType) {
        if (detailType === "negative") {
          return Array.isArray(subtaskResult && subtaskResult.negativeNotes) ? subtaskResult.negativeNotes : [];
        }

        if (detailType === "positive") {
          return Array.isArray(subtaskResult && subtaskResult.positiveNotes) ? subtaskResult.positiveNotes : [];
        }

        return [];
      }

      function buildFeedbackSummary(items) {
        return items.length ? items.join(", ") : "Keine";
      }

      function getNormalizedGradingSystem(plannedEvaluation) {
        return (Array.isArray(plannedEvaluation && plannedEvaluation.gradingSystem) ? plannedEvaluation.gradingSystem : []).map(function (entry) {
          return {
            id: String(entry && entry.id || "").trim(),
            label: String(entry && entry.label || "").trim(),
            minPercent: Math.max(0, Math.min(100, Number.isFinite(Number(entry && entry.minPercent)) ? Number(entry.minPercent) : 0))
          };
        }).filter(function (entry) {
          return Boolean(entry.id);
        }).sort(function (left, right) {
          if (left.minPercent === right.minPercent) {
            return left.label.localeCompare(right.label, "de-DE");
          }

          return right.minPercent - left.minPercent;
        });
      }

      function getAchievedStageLabel(plannedEvaluation, pointsValue, maxValue) {
        const normalizedPoints = Math.max(0, Number(pointsValue) || 0);
        const normalizedMax = Math.max(0, Number(maxValue) || 0);
        const stage = getNormalizedGradingSystem(plannedEvaluation).find(function (entry) {
          const threshold = normalizedMax > 0
            ? roundUpHalfPointThreshold(normalizedMax * Math.max(0, Number(entry && entry.minPercent) || 0) / 100)
            : 0;

          return normalizedPoints + 0.000001 >= threshold;
        }) || null;

        return stage ? stage.label : "";
      }

      function buildStudentPerformanceSummary(plannedEvaluation, evaluationSheet, performedEvaluation) {
        const tasks = getTaskSheetTasks(evaluationSheet);
        const subtaskLookup = performedEvaluation && Array.isArray(performedEvaluation.subtaskResults)
          ? performedEvaluation.subtaskResults.reduce(function (lookup, entry) {
              const subtaskId = String(entry && entry.subtaskId || "").trim();

              if (subtaskId) {
                lookup[subtaskId] = entry;
              }

              return lookup;
            }, {})
          : {};
        const taskSummaries = tasks.map(function (task) {
          const subtasks = getSubtasksForTask(task);
          const achieved = subtasks.reduce(function (sum, subtask) {
            const result = subtaskLookup[String(subtask && subtask.id || "").trim()] || null;
            return sum + Math.max(0, Number(result && result.points) || 0);
          }, 0);
          const reachable = subtasks.reduce(function (sum, subtask) {
            return sum + getRegularBeValue(subtask);
          }, 0);
          const additionalReachable = subtasks.reduce(function (sum, subtask) {
            return sum + (isAdditionalSubtask(subtask) ? getBeValue(subtask) : 0);
          }, 0);

          return {
            taskId: String(task && task.id || "").trim(),
            achieved: achieved,
            reachable: reachable,
            additionalReachable: additionalReachable
          };
        });
        const totalAchieved = taskSummaries.reduce(function (sum, entry) {
          return sum + entry.achieved;
        }, 0);
        const totalReachable = taskSummaries.reduce(function (sum, entry) {
          return sum + entry.reachable;
        }, 0);
        const totalAdditionalReachable = taskSummaries.reduce(function (sum, entry) {
          return sum + entry.additionalReachable;
        }, 0);
        const percent = totalReachable > 0
          ? (totalAchieved / totalReachable) * 100
          : 0;

        return {
          taskSummaries: taskSummaries,
          totalAchieved: totalAchieved,
          totalReachable: totalReachable,
          totalAdditionalReachable: totalAdditionalReachable,
          percent: percent,
          stageLabel: getAchievedStageLabel(plannedEvaluation, totalAchieved, totalReachable),
          isCompleted: Boolean(performedEvaluation && performedEvaluation.isCompleted),
          completedAt: String(performedEvaluation && performedEvaluation.completedAt || "").trim()
        };
      }

      function getFeedbackSuggestions(subtaskId, detailType, activeStudentId, filterValue) {
        const normalizedSubtaskId = String(subtaskId || "").trim();
        const normalizedType = String(detailType || "").trim().toLowerCase();
        const normalizedFilter = String(filterValue || "").trim().toLowerCase();
        const seen = {};

        return performedEvaluations.reduce(function (results, evaluationEntry) {
          const samePlannedEvaluation = String(evaluationEntry && evaluationEntry.plannedEvaluationId || "").trim() === String(selectedPlannedEvaluation && selectedPlannedEvaluation.id || "").trim();
          const isOtherStudent = String(evaluationEntry && evaluationEntry.studentId || "").trim() !== String(activeStudentId || "").trim();
          const subtaskResult = samePlannedEvaluation && isOtherStudent && Array.isArray(evaluationEntry && evaluationEntry.subtaskResults)
            ? evaluationEntry.subtaskResults.find(function (entry) {
                return String(entry && entry.subtaskId || "").trim() === normalizedSubtaskId;
              }) || null
            : null;

          getFeedbackItems(subtaskResult, normalizedType).forEach(function (item) {
            const normalizedItem = String(item || "").trim();
            const lookupKey = normalizedItem.toLowerCase();

            if (!normalizedItem || seen[lookupKey] || (normalizedFilter && lookupKey.indexOf(normalizedFilter) === -1)) {
              return;
            }

            seen[lookupKey] = true;
            results.push(normalizedItem);
          });

          return results;
        }, []);
      }

      function buildPlannedEvaluationCard(plannedEvaluation) {
        const plannedEvaluationId = String(plannedEvaluation && plannedEvaluation.id || "").trim();
        const sheet = sheetLookup[String(plannedEvaluation && plannedEvaluation.evaluationSheetId || "").trim()] || null;
        const studentIds = Array.isArray(plannedEvaluation && plannedEvaluation.studentIds) ? plannedEvaluation.studentIds : [];
        const studentCount = studentIds.length;
        const completedStudentCount = studentIds.reduce(function (count, studentId) {
          const normalizedStudentId = String(studentId || "").trim();
          const performedEvaluation = performedEvaluations.find(function (entry) {
            return String(entry && entry.plannedEvaluationId || "").trim() === plannedEvaluationId
              && String(entry && entry.studentId || "").trim() === normalizedStudentId
              && Boolean(entry && entry.isCompleted);
          }) || null;

          return count + (performedEvaluation ? 1 : 0);
        }, 0);
        const isSelected = plannedEvaluationId && plannedEvaluationId === activePerformedPlannedEvaluationId;

        return [
          '<div class="bewertung-planung__card', isSelected ? ' is-selected' : '', '" role="button" tabindex="0" onclick="return window.UnterrichtsassistentApp.selectPlannedEvaluationForExecution(\'', escapeValue(plannedEvaluationId), '\')">',
          '<div class="bewertung-planung__card-type">', escapeValue(getPlannedEvaluationTypeLabel(plannedEvaluation && plannedEvaluation.type)), '</div>',
          '<div class="bewertung-planung__card-title">', escapeValue(String(sheet && sheet.title || "Bewertungsbogen fehlt")), '</div>',
          '<div class="bewertung-planung__card-date">', escapeValue(formatLongDateLabel(plannedEvaluation && plannedEvaluation.date) || String(plannedEvaluation && plannedEvaluation.date || "")), '</div>',
          '<div class="bewertung-planung__card-meta">', escapeValue(String(completedStudentCount)), ' / ', escapeValue(String(studentCount)), ' Schueler bewertet</div>',
          '<button class="bewertung-planung__edit" type="button" onclick="window.UnterrichtsassistentApp.stopEventPropagation(event); return window.UnterrichtsassistentApp.openPlannedEvaluationModal(\'', escapeValue(plannedEvaluationId), '\')">Bearbeiten</button>',
          '</div>'
        ].join("");
      }

      function buildPlannedEvaluationDetailsPanel() {
        const selectedSheetId = String(selectedPlannedEvaluation && selectedPlannedEvaluation.evaluationSheetId || "").trim();
        const selectedSheetTitle = String((sheetLookup[selectedSheetId] && sheetLookup[selectedSheetId].title) || "").trim();
        const selectedDate = String(selectedPlannedEvaluation && selectedPlannedEvaluation.date || "").slice(0, 10);
        const createPlanningEvent = !selectedPlannedEvaluation || selectedPlannedEvaluation.createPlanningEvent !== false;
        const selectedStudentIdsLookup = (selectedPlannedEvaluation && Array.isArray(selectedPlannedEvaluation.studentIds) ? selectedPlannedEvaluation.studentIds : []).reduce(function (lookup, studentId) {
          lookup[String(studentId || "").trim()] = true;
          return lookup;
        }, {});
        const gradingStages = getNormalizedGradingSystem(selectedPlannedEvaluation);
        const studentRows = buildStudentRows(students);
        const sheetOptions = (function () {
          const options = sheets.map(function (sheet) {
            const sheetId = String(sheet && sheet.id || "").trim();
            return '<option value="' + escapeValue(sheetId) + '"' + (sheetId === selectedSheetId ? ' selected' : '') + '>' + escapeValue(String(sheet && sheet.title || "").trim() || "Ohne Titel") + '</option>';
          }).join("");

          return options || '<option value="">Keine Bewertungsboegen vorhanden</option>';
        }());
        const dateOptions = (function () {
          const options = availableDates.map(function (entry) {
            const normalizedDate = String(entry && entry.date || "").slice(0, 10);
            return '<option value="' + escapeValue(normalizedDate) + '"' + (normalizedDate === selectedDate ? ' selected' : '') + '>' + escapeValue(String(entry && entry.label || normalizedDate)) + '</option>';
          }).join("");

          return options || '<option value="">Keine verfuegbaren Termine</option>';
        }());

        if (!selectedPlannedEvaluation) {
          return "";
        }

        return [
          '<article class="panel bewertung-planung-details', isPlannedEvaluationDetailsExpanded ? '' : ' is-collapsed', '">',
          buildSectionHeader((selectedSheetTitle || "Bewertung") + " - Einstellungen", "planneddetail", isPlannedEvaluationDetailsExpanded),
          isPlannedEvaluationDetailsExpanded ? [
            '<div class="bewertung-planung-details__content">',
            '<div class="bewertung-editor__fields">',
            '<div class="import-modal__field bewertung-editor__field">',
            '<span>Art der Leistung</span>',
            '<div class="bewertung-planung-modal__type-switch" role="group" aria-label="Art der Leistung">',
            '<button class="bewertung-planung-modal__type-button', String(selectedPlannedEvaluation && selectedPlannedEvaluation.type || "sonstige").trim() === "sonstige" ? ' is-active' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.updateSelectedPlannedEvaluationField(\'type\', \'sonstige\')">Sonstige</button>',
            '<button class="bewertung-planung-modal__type-button', String(selectedPlannedEvaluation && selectedPlannedEvaluation.type || "").trim() === "schriftliche" ? ' is-active' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.updateSelectedPlannedEvaluationField(\'type\', \'schriftliche\')">Schriftliche</button>',
            '</div>',
            '</div>',
            '<label class="import-modal__field bewertung-editor__field">',
            '<span>Bewertungsbogen</span>',
            '<select onchange="return window.UnterrichtsassistentApp.updateSelectedPlannedEvaluationField(\'evaluationSheetId\', this.value)">',
            sheetOptions,
            '</select>',
            '</label>',
            '<label class="import-modal__field bewertung-editor__field">',
            '<span>Datum</span>',
            '<select onchange="return window.UnterrichtsassistentApp.updateSelectedPlannedEvaluationField(\'date\', this.value)">',
            dateOptions,
            '</select>',
            '</label>',
            '<label class="bewertung-planung-modal__toggle">',
            '<input type="checkbox"', createPlanningEvent ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updateSelectedPlannedEvaluationField(\'createPlanningEvent\', this.checked)">',
            '<span>Als Termin setzen</span>',
            '</label>',
            '</div>',
            '<div class="bewertung-planung-details__student-header">',
            '<span class="bewertung-planung-modal__student-title">Schueler zuordnen</span>',
            '<div class="bewertung-planung-modal__student-actions">',
            '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.setAllStudentsForSelectedPlannedEvaluation(true)">Alle</button>',
            '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.setAllStudentsForSelectedPlannedEvaluation(false)">Keine</button>',
            '</div>',
            '</div>',
            studentRows.length ? [
              '<div class="bewertung-planung-modal__student-table-wrap">',
              '<table class="bewertung-planung-modal__student-table"><tbody>',
              studentRows.map(function (row) {
                return [
                  '<tr>',
                  row.map(function (student) {
                    const studentId = String(student && student.id || "").trim();

                    return [
                      '<td>',
                      '<label class="bewertung-planung-modal__student-option">',
                      '<input type="checkbox"', selectedStudentIdsLookup[studentId] ? ' checked' : '', ' onclick="return window.UnterrichtsassistentApp.toggleSelectedPlannedEvaluationStudent(\'', escapeValue(studentId), '\')">',
                      '<span>', escapeValue(String(student && student.firstName || "").trim() || "Ohne Namen"), '</span>',
                      '</label>',
                      '</td>'
                    ].join("");
                  }).join(""),
                  row.length < 5 ? new Array(5 - row.length + 1).join('<td class="bewertung-planung-modal__student-empty"></td>') : '',
                  '</tr>'
                ].join("");
              }).join(""),
              '</tbody></table>',
              '</div>'
            ].join("") : '<div class="bewertung-analysis__empty">Keine Schueler in der Lerngruppe vorhanden.</div>',
            '<section class="bewertung-grading">',
            '<div class="bewertung-grading__header">',
            '<h3 class="bewertung-grading__title">Bewertungssystem</h3>',
            '<p class="bewertung-planung__hint">Definiere Stufen und die benoetigte Prozentgrenze.</p>',
            '</div>',
            '<div class="bewertung-grading__presets">',
            '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.loadSelectedPlannedEvaluationGradingPreset(\'noten\')">Noten</button>',
            '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.loadSelectedPlannedEvaluationGradingPreset(\'punkte\')">Punkte</button>',
            '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.loadSelectedPlannedEvaluationGradingPreset(\'plusplus_bis_minusminus\')">++ bis --</button>',
            '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.loadSelectedPlannedEvaluationGradingPreset(\'plus_bis_minus\')">+ bis -</button>',
            '</div>',
            '<div class="bewertung-grading__table">',
            gradingStages.map(function (stage) {
              const stageId = String(stage && stage.id || "").trim();
              return [
                '<div class="bewertung-grading__row">',
                '<input class="bewertung-grading__label" type="text" value="', escapeValue(String(stage && stage.label || "").trim()), '" placeholder="Bewertungsstufe" onchange="return window.UnterrichtsassistentApp.updateSelectedPlannedEvaluationGradingStageField(\'', escapeValue(stageId), '\', \'label\', this.value)">',
                '<input class="bewertung-grading__percent" type="number" min="0" max="100" step="1" value="', escapeValue(String(Number(stage && stage.minPercent) || 0)), '" placeholder="%" onchange="return window.UnterrichtsassistentApp.updateSelectedPlannedEvaluationGradingStageField(\'', escapeValue(stageId), '\', \'minPercent\', this.value)">',
                '<button class="bewertung-task-sheet__delete" type="button" onclick="return window.UnterrichtsassistentApp.deleteSelectedPlannedEvaluationGradingStage(\'', escapeValue(stageId), '\')">Loeschen</button>',
                '</div>'
              ].join("");
            }).join(""),
            '<div class="bewertung-grading__row bewertung-grading__row--add">',
            '<div></div>',
            '<div></div>',
            '<button class="bewertung-task-sheet__add-row bewertung-task-sheet__add-row--subtask" type="button" onclick="return window.UnterrichtsassistentApp.addSelectedPlannedEvaluationGradingStage()">+</button>',
            '</div>',
            '</div>',
            '</section>',
            '</div>'
          ].join("") : '',
          '</article>'
        ].join("");
      }

      function buildCompetencyGridPerformanceEditor(isCompleted) {
        const grid = selectedEvaluationSheet && selectedEvaluationSheet.competencyGrid && typeof selectedEvaluationSheet.competencyGrid === "object"
          ? selectedEvaluationSheet.competencyGrid
          : {};
        const rows = Array.isArray(grid.rows) ? grid.rows : [];
        const columns = Array.isArray(grid.columns) ? grid.columns : [];
        const cells = grid.cells && typeof grid.cells === "object" ? grid.cells : {};
        const isDetailedMode = performedCompetencyGridMode === "ausfuehrlich";

        if (!rows.length || !columns.length) {
          return '<div class="bewertung-editor__placeholder">Das verknuepfte Kompetenzraster braucht mindestens eine Teilkompetenz und eine Niveaustufe.</div>';
        }

        return [
          '<div class="bewertung-durchfuehrung__student-header">',
          '<h3 class="bewertung-durchfuehrung__student-title">', escapeValue(String(selectedStudent && selectedStudent.fullName || selectedStudent && selectedStudent.firstName || "").trim() || "Ohne Namen"), '</h3>',
          '<div class="bewertung-durchfuehrung__student-header-actions">',
          '<div class="bewertung-durchfuehrung__student-meta">', escapeValue(getPlannedEvaluationTypeLabel(selectedPlannedEvaluation && selectedPlannedEvaluation.type)), '</div>',
          isCompleted
            ? '<button class="bewertung-durchfuehrung__completed-badge" type="button" onclick="return window.UnterrichtsassistentApp.togglePerformedEvaluationCompletionForSelectedStudent()">Abgeschlossen</button>'
            : '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.togglePerformedEvaluationCompletionForSelectedStudent()">Fertig</button>',
          '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.setPerformedCompetencyGridMode(\'', isDetailedMode ? 'kompakt' : 'ausfuehrlich', '\')">',
          escapeValue(isDetailedMode ? "Kompakt" : "Ausfuehrlich"),
          '</button>',
          '</div>',
          '</div>',
          '<div class="bewertung-raster-evaluation', isDetailedMode ? ' bewertung-raster-evaluation--detailed' : '', '">',
          rows.map(function (row) {
            const rowId = String(row && row.id || "").trim();
            const rowTitle = String(row && row.title || "").trim() || "Teilkompetenz";
            const result = selectedCompetencyResultLookup[rowId] || null;
            const selectedColumnId = String(result && result.columnId || "").trim();
            const evidences = Array.isArray(result && result.evidences) ? result.evidences : [];
            const nextStep = String(result && result.nextStep || "").trim();

            return [
              '<div class="bewertung-raster-evaluation__row">',
              '<div class="bewertung-raster-evaluation__title">', escapeValue(rowTitle), '</div>',
              '<div class="bewertung-raster-evaluation__levels">',
              columns.map(function (column, columnIndex) {
                const columnId = String(column && column.id || "").trim();
                const columnTitle = String(column && column.title || "").trim() || ("Niveau " + String(columnIndex + 1));
                const cellText = cells[rowId] && cells[rowId][columnId] !== undefined
                  ? String(cells[rowId][columnId] || "").trim()
                  : "";
                const levelText = isDetailedMode
                  ? (cellText || columnTitle)
                  : String(columnIndex + 1);
                const checked = selectedColumnId === columnId;

                return [
                  '<label class="bewertung-raster-evaluation__level', isDetailedMode ? ' bewertung-raster-evaluation__level--text' : '', '" title="', escapeValue(columnTitle), '">',
                  '<input type="checkbox"', checked ? ' checked' : '', isCompleted ? ' disabled' : '', ' onchange="return window.UnterrichtsassistentApp.updatePerformedCompetencyGridSelection(\'', escapeValue(rowId), '\', \'', escapeValue(columnId), '\')">',
                  '<span>', escapeValue(levelText), '</span>',
                  '</label>'
                ].join("");
              }).join(""),
              '</div>',
              '<div class="bewertung-raster-evaluation__actions">',
              '<button class="bewertung-raster-evaluation__add" type="button" aria-label="Evidenz hinzufuegen" title="Evidenz hinzufuegen" onclick="return window.UnterrichtsassistentApp.openPerformedCompetencyGridDetailModal(\'', escapeValue(rowId), '\', \'evidence\')"', isCompleted ? ' disabled' : '', '>+</button>',
              '<button class="bewertung-raster-evaluation__add" type="button" aria-label="Naechsten Schritt hinzufuegen" title="Naechsten Schritt hinzufuegen" onclick="return window.UnterrichtsassistentApp.openPerformedCompetencyGridDetailModal(\'', escapeValue(rowId), '\', \'nextstep\')"', isCompleted ? ' disabled' : '', '>+</button>',
              '</div>',
              '<div class="bewertung-raster-evaluation__notes">',
              evidences.length ? evidences.map(function (evidence) {
                return '<span class="bewertung-raster-evaluation__note"><strong>' + escapeValue(String(evidence && evidence.type || "").trim() || "Evidenz") + ':</strong> ' + escapeValue(String(evidence && evidence.text || "").trim()) + '</span>';
              }).join("") : '',
              nextStep ? '<span class="bewertung-raster-evaluation__note"><strong>Naechster Schritt:</strong> ' + escapeValue(nextStep) + '</span>' : '',
              '</div>',
              '</div>'
            ].join("");
          }).join(""),
          '</div>',
          isCompleted
            ? '<div class="bewertung-durchfuehrung__overall-note"><span>Anmerkung zur gesamten Bewertung</span><div>' + escapeValue(String(selectedPerformedEvaluation && selectedPerformedEvaluation.overallNote || "").trim() || "Keine") + '</div></div>'
            : '<label class="bewertung-durchfuehrung__field bewertung-durchfuehrung__field--overall"><span>Anmerkung zur gesamten Bewertung</span><textarea rows="4" onchange="return window.UnterrichtsassistentApp.updatePerformedEvaluationOverallNote(this.value)">' + escapeValue(String(selectedPerformedEvaluation && selectedPerformedEvaluation.overallNote || "").trim()) + '</textarea></label>'
        ].join("");
      }

      function buildPerformedEvaluationPanel() {
        if (!selectedPlannedEvaluation) {
          return [
            '<article class="panel bewertung-durchfuehrung">',
            '<div class="bewertung-planung__header">',
            '<div>',
            '<h2 class="bewertung-planung__title">Bewertung vornehmen</h2>',
            '<p class="bewertung-planung__hint">Waehle oben eine geplante Bewertung aus, um die zugeordneten Schueler individuell zu bewerten.</p>',
            '</div>',
            '</div>',
            '<div class="bewertung-editor__placeholder">Noch keine geplante Bewertung ausgewaehlt.</div>',
            '</article>'
          ].join("");
        }

        if (!selectedEvaluationSheet) {
          return [
            '<article class="panel bewertung-durchfuehrung">',
            '<div class="bewertung-planung__header">',
            '<div>',
            '<h2 class="bewertung-planung__title">Bewertung vornehmen</h2>',
            '<p class="bewertung-planung__hint">', escapeValue(String(selectedPlannedEvaluation.date || "")), '</p>',
            '</div>',
            '</div>',
            '<div class="bewertung-editor__placeholder">Der verknuepfte Bewertungsbogen ist nicht mehr vorhanden.</div>',
            '</article>'
          ].join("");
        }

        return [
          '<article class="panel bewertung-durchfuehrung">',
          '<div class="bewertung-planung__header">',
          '<div>',
          '<h2 class="bewertung-planung__title">Bewertung vornehmen</h2>',
          '<p class="bewertung-planung__hint">', escapeValue(String(selectedEvaluationSheet && selectedEvaluationSheet.title || "").trim() || "Ohne Titel"), ' | ', escapeValue(formatLongDateLabel(selectedPlannedEvaluation && selectedPlannedEvaluation.date) || String(selectedPlannedEvaluation && selectedPlannedEvaluation.date || "")), '</p>',
          '</div>',
          '<div class="bewertung-durchfuehrung__student-header-actions">',
          '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.exportActivePerformedEvaluationPdfSet()">PDF alle</button>',
          '</div>',
          '</div>',
          '<div class="bewertung-durchfuehrung__layout">',
          '<aside class="bewertung-durchfuehrung__students">',
          '<div class="bewertung-durchfuehrung__students-title">Schueler</div>',
          '<div class="bewertung-durchfuehrung__filters">',
          [
            { key: "alle", label: "alle" },
            { key: "offen", label: "offen" },
            { key: "abgeschlossen", label: "abgeschlossen" }
          ].map(function (filter) {
            return [
              '<button class="bewertung-durchfuehrung__filter', activePerformedEvaluationStudentFilter === filter.key ? ' is-active' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.setPerformedEvaluationStudentFilter(\'', escapeValue(filter.key), '\')">',
              escapeValue(filter.label),
              '</button>'
            ].join("");
          }).join(""),
          '</div>',
          visibleAssignedStudents.length ? visibleAssignedStudents.map(function (student) {
            const studentId = String(student && student.id || "").trim();
            const isSelectedStudent = selectedStudent && studentId === String(selectedStudent.id || "").trim();
            const summary = studentPerformanceSummaries[studentId] || null;
            const stageLabel = summary ? String(summary.stageLabel || "").trim() : "";
            const isCompleted = Boolean(summary && summary.isCompleted);

            return [
              '<button class="bewertung-durchfuehrung__student', isSelectedStudent ? ' is-selected' : '', isCompleted ? ' is-completed' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.selectPerformedEvaluationStudent(\'', escapeValue(studentId), '\')">',
              '<span class="bewertung-durchfuehrung__student-main">',
              '<span class="bewertung-durchfuehrung__student-name">', escapeValue(String(student && student.firstName || "").trim() || "Ohne Namen"), '</span>',
              stageLabel ? '<span class="bewertung-durchfuehrung__student-stage">' + escapeValue(stageLabel) + '</span>' : '',
              '</span>',
              '<span class="bewertung-durchfuehrung__student-status">', escapeValue(isCompleted ? "abgeschlossen" : "offen"), '</span>',
              '</button>'
            ].join("");
          }).join("") : '<div class="bewertung-analysis__empty">Keine Schueler passen zum aktiven Filter.</div>',
          '</aside>',
          '<div class="bewertung-durchfuehrung__workspace">',
          !selectedStudent ? '<div class="bewertung-editor__placeholder">Waehle links einen Schueler aus.</div>' : (
            String(selectedEvaluationSheet && selectedEvaluationSheet.type || "").trim() !== "aufgabenbogen"
              ? buildCompetencyGridPerformanceEditor(Boolean(selectedPerformanceSummary && selectedPerformanceSummary.isCompleted))
              : (function () {
                  const tasks = getTaskSheetTasks(selectedEvaluationSheet);
                  const isCompleted = Boolean(selectedPerformanceSummary && selectedPerformanceSummary.isCompleted);

                  return [
                    '<div class="bewertung-durchfuehrung__student-header">',
                    '<h3 class="bewertung-durchfuehrung__student-title">', escapeValue(String(selectedStudent && selectedStudent.fullName || selectedStudent && selectedStudent.firstName || "").trim() || "Ohne Namen"), '</h3>',
                    '<div class="bewertung-durchfuehrung__student-header-actions">',
                    '<div class="bewertung-durchfuehrung__student-meta">', escapeValue(getPlannedEvaluationTypeLabel(selectedPlannedEvaluation && selectedPlannedEvaluation.type)), '</div>',
                    '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.exportSelectedPerformedEvaluationPdf()">PDF</button>',
                    isCompleted
                      ? '<button class="bewertung-durchfuehrung__completed-badge" type="button" onclick="return window.UnterrichtsassistentApp.togglePerformedEvaluationCompletionForSelectedStudent()">Abgeschlossen</button>'
                      : '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.togglePerformedEvaluationCompletionForSelectedStudent()">Fertig</button>',
                    '</div>',
                    '</div>',
                    isCompleted
                      ? (
                        tasks.length ? [
                          '<div class="bewertung-durchfuehrung__compact-list">',
                          tasks.map(function (task, taskIndex) {
                            const taskTitle = String(task && task.title || "").trim();
                            const subtasks = getSubtasksForTask(task);
                            const taskSummary = selectedPerformanceSummary && Array.isArray(selectedPerformanceSummary.taskSummaries)
                              ? selectedPerformanceSummary.taskSummaries.find(function (entry) {
                                  return String(entry && entry.taskId || "").trim() === String(task && task.id || "").trim();
                                }) || null
                              : null;

                            return [
                              '<div class="bewertung-durchfuehrung__compact-task-row">',
                              '<span class="bewertung-durchfuehrung__compact-task-title">Aufgabe ', escapeValue(String(taskIndex + 1)), ': ', escapeValue(taskTitle || "Ohne Titel"), '</span>',
                              '<span class="bewertung-durchfuehrung__compact-task-score">', escapeValue(formatPointsLabel(taskSummary ? taskSummary.achieved : 0)), ' / ', escapeValue(formatReachableLabel(taskSummary ? taskSummary.reachable : 0, taskSummary ? taskSummary.additionalReachable : 0)), '</span>',
                              '</div>',
                              subtasks.length ? subtasks.map(function (subtask) {
                                const subtaskId = String(subtask && subtask.id || "").trim();
                                const subtaskResult = selectedSubtaskLookup[subtaskId] || null;
                                const negativeItems = getFeedbackItems(subtaskResult, "negative");
                                const positiveItems = getFeedbackItems(subtaskResult, "positive");
                                const noteValue = String(subtaskResult && subtaskResult.generalNote || "").trim();

                                return [
                                  '<div class="bewertung-durchfuehrung__compact-subtask-row">',
                                  '<span class="bewertung-durchfuehrung__compact-subtask-title">', escapeValue(String(subtask && subtask.title || "").trim() || "Ohne Titel"), isAdditionalSubtask(subtask) ? ' <span class="bewertung-analysis__subtask-afb">Zusatzaufgabe</span>' : '', '</span>',
                                  '<span class="bewertung-durchfuehrung__compact-subtask-notes">',
                                  negativeItems.length ? '<span class="bewertung-durchfuehrung__compact-note"><strong>N:</strong> ' + escapeValue(buildFeedbackSummary(negativeItems)) + '</span>' : '',
                                  positiveItems.length ? '<span class="bewertung-durchfuehrung__compact-note"><strong>P:</strong> ' + escapeValue(buildFeedbackSummary(positiveItems)) + '</span>' : '',
                                  noteValue ? '<span class="bewertung-durchfuehrung__compact-note"><strong>Notiz:</strong> ' + escapeValue(noteValue) + '</span>' : '',
                                  '</span>',
                                  '<span class="bewertung-durchfuehrung__compact-subtask-score">', escapeValue(formatPointsLabel(subtaskResult ? Number(subtaskResult.points) || 0 : 0)), ' / ', escapeValue(formatReachableLabel(getRegularBeValue(subtask), isAdditionalSubtask(subtask) ? getBeValue(subtask) : 0)), '</span>',
                                  '</div>'
                                ].join("");
                              }).join("") : ''
                            ].join("");
                          }).join(""),
                          '</div>'
                        ].join("") : '<div class="bewertung-editor__placeholder">Der verknuepfte Aufgabenbogen enthaelt noch keine Aufgaben.</div>'
                      )
                      : (tasks.length ? tasks.map(function (task, taskIndex) {
                      const taskTitle = String(task && task.title || "").trim();
                      const subtasks = getSubtasksForTask(task);
                      const taskSummary = selectedPerformanceSummary && Array.isArray(selectedPerformanceSummary.taskSummaries)
                        ? selectedPerformanceSummary.taskSummaries.find(function (entry) {
                            return String(entry && entry.taskId || "").trim() === String(task && task.id || "").trim();
                          }) || null
                        : null;

                      return [
                        '<section class="bewertung-durchfuehrung__task">',
                        '<div class="bewertung-durchfuehrung__task-header">',
                        '<div class="bewertung-durchfuehrung__task-title">Aufgabe ', escapeValue(String(taskIndex + 1)), ': ', escapeValue(taskTitle || "Ohne Titel"), '</div>',
                        '<div class="bewertung-durchfuehrung__task-score">', escapeValue(formatPointsLabel(taskSummary ? taskSummary.achieved : 0)), ' / ', escapeValue(formatReachableLabel(taskSummary ? taskSummary.reachable : 0, taskSummary ? taskSummary.additionalReachable : 0)), '</div>',
                        '</div>',
                        subtasks.length ? subtasks.map(function (subtask) {
                          const subtaskId = String(subtask && subtask.id || "").trim();
                          const subtaskResult = selectedSubtaskLookup[subtaskId] || null;
                          const negativeItems = getFeedbackItems(subtaskResult, "negative");
                          const positiveItems = getFeedbackItems(subtaskResult, "positive");
                          const noteValue = String(subtaskResult && subtaskResult.generalNote || "").trim();

                          return [
                            '<div class="bewertung-durchfuehrung__subtask">',
                            '<div class="bewertung-durchfuehrung__subtask-head">',
                            '<div class="bewertung-durchfuehrung__subtask-title">', escapeValue(String(subtask && subtask.title || "").trim() || "Ohne Titel"), isAdditionalSubtask(subtask) ? ' <span class="bewertung-analysis__subtask-afb">Zusatzaufgabe</span>' : '', '</div>',
                            '<div class="bewertung-durchfuehrung__detail-grid">',
                            '<button class="bewertung-durchfuehrung__detail" type="button" onclick="return window.UnterrichtsassistentApp.openPerformedEvaluationDetailModal(\'', escapeValue(subtaskId), '\', \'negative\', \'list\')">',
                            '<span class="bewertung-durchfuehrung__detail-head">Negativ <span class="bewertung-durchfuehrung__detail-add" onclick="window.UnterrichtsassistentApp.stopEventPropagation(event); return window.UnterrichtsassistentApp.openPerformedEvaluationDetailModal(\'', escapeValue(subtaskId), '\', \'negative\', \'add\')">+</span></span>',
                            '<span class="bewertung-durchfuehrung__detail-body">', escapeValue(buildFeedbackSummary(negativeItems)), '</span>',
                            '</button>',
                            '<button class="bewertung-durchfuehrung__detail" type="button" onclick="return window.UnterrichtsassistentApp.openPerformedEvaluationDetailModal(\'', escapeValue(subtaskId), '\', \'positive\', \'list\')">',
                            '<span class="bewertung-durchfuehrung__detail-head">Positiv <span class="bewertung-durchfuehrung__detail-add" onclick="window.UnterrichtsassistentApp.stopEventPropagation(event); return window.UnterrichtsassistentApp.openPerformedEvaluationDetailModal(\'', escapeValue(subtaskId), '\', \'positive\', \'add\')">+</span></span>',
                            '<span class="bewertung-durchfuehrung__detail-body">', escapeValue(buildFeedbackSummary(positiveItems)), '</span>',
                            '</button>',
                            '<button class="bewertung-durchfuehrung__detail" type="button" onclick="return window.UnterrichtsassistentApp.openPerformedEvaluationDetailModal(\'', escapeValue(subtaskId), '\', \'note\', \'note\')">',
                            '<span class="bewertung-durchfuehrung__detail-head">Notiz <span class="bewertung-durchfuehrung__detail-add">+</span></span>',
                            '<span class="bewertung-durchfuehrung__detail-body">', escapeValue(noteValue || "Keine"), '</span>',
                            '</button>',
                            '</div>',
                            '<div class="bewertung-durchfuehrung__points-wrap">',
                            '<input class="bewertung-durchfuehrung__points-input" data-subtask-id="', escapeValue(subtaskId), '" type="text" inputmode="decimal" maxlength="4" value="', escapeValue(formatPointsLabel(subtaskResult ? Number(subtaskResult.points) || 0 : 0)), '" oninput="this.value = this.value.replace(/[^0-9,\\.]/g, \'\').replace(/\\./g, \',\').replace(/(,.*),/g, \'$1\').slice(0, 4); return true" onchange="this.value = String(window.UnterrichtsassistentApp.normalizePerformedEvaluationPoints ? window.UnterrichtsassistentApp.normalizePerformedEvaluationPoints(this.value, \'', escapeValue(String(getBeValue(subtask))), '\') : 0).replace(\'.\', \',\'); return window.UnterrichtsassistentApp.updatePerformedEvaluationSubtaskField(\'', escapeValue(subtaskId), '\', \'points\', this.value, \'', escapeValue(String(getBeValue(subtask))), '\')" onkeydown="return window.UnterrichtsassistentApp.handlePerformedEvaluationPointsKeyDown(event, \'', escapeValue(subtaskId), '\', \'', escapeValue(String(getBeValue(subtask))), '\')">',
                            '<span class="bewertung-durchfuehrung__points-max">/ ', escapeValue(formatPointsLabel(getBeValue(subtask))), '</span>',
                            '</div>',
                            '</div>',
                            '</div>'
                          ].join("");
                        }).join("") : '<div class="bewertung-analysis__empty">Diese Aufgabe hat noch keine Teilaufgaben.</div>',
                        '</section>'
                      ].join("");
                    }).join("") : '<div class="bewertung-editor__placeholder">Der verknuepfte Aufgabenbogen enthaelt noch keine Aufgaben.</div>'),
                    '<div class="bewertung-durchfuehrung__overall-score">', escapeValue(formatPointsLabel(selectedPerformanceSummary ? selectedPerformanceSummary.totalAchieved : 0)), ' / ', escapeValue(formatReachableLabel(selectedPerformanceSummary ? selectedPerformanceSummary.totalReachable : 0, selectedPerformanceSummary ? selectedPerformanceSummary.totalAdditionalReachable : 0)), ' <span>(', escapeValue((selectedPerformanceSummary ? selectedPerformanceSummary.percent : 0).toFixed(1).replace(".", ",")), '%)</span></div>',
                    '<div class="bewertung-durchfuehrung__overall-stage">', escapeValue(String(selectedPerformanceSummary && selectedPerformanceSummary.stageLabel || "").trim() || "Keine Bewertungsstufe"), '</div>',
                    isCompleted
                      ? '<div class="bewertung-durchfuehrung__overall-note"><span>Anmerkung zur gesamten Bewertung</span><div>' + escapeValue(String(selectedPerformedEvaluation && selectedPerformedEvaluation.overallNote || "").trim() || "Keine") + '</div></div>'
                      : '<label class="bewertung-durchfuehrung__field bewertung-durchfuehrung__field--overall"><span>Anmerkung zur gesamten Bewertung</span><textarea rows="4" onchange="return window.UnterrichtsassistentApp.updatePerformedEvaluationOverallNote(this.value)">' + escapeValue(String(selectedPerformedEvaluation && selectedPerformedEvaluation.overallNote || "").trim()) + '</textarea></label>'
                  ].join("");
                }())
          ),
          '</div>',
          '</div>',
          '</article>'
        ].join("");
      }

      function buildPerformedEvaluationDetailModal() {
        const modal = activePerformedEvaluationDetailModal;
        const modalSubtaskId = String(modal && modal.subtaskId || "").trim();
        const modalType = String(modal && modal.detailType || "").trim().toLowerCase();
        const modalMode = String(modal && modal.mode || "").trim().toLowerCase();
        const modalDraft = String(modal && modal.draftValue || "");
        const modalSubtaskResult = selectedSubtaskLookup[modalSubtaskId] || null;
        const modalFeedbackItems = getFeedbackItems(modalSubtaskResult, modalType);
        const suggestions = getFeedbackSuggestions(modalSubtaskId, modalType, selectedStudent && selectedStudent.id, modalDraft);

        if (!modal || !modalSubtaskId) {
          return "";
        }

        if (modalType === "competencyevidence") {
          return [
            '<div class="import-modal">',
            '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()"></div>',
            '<div class="import-modal__dialog import-modal__dialog--performed-feedback" role="dialog" aria-modal="true">',
            '<div class="import-modal__header">',
            '<div><h3>Evidenz hinzufuegen</h3></div>',
            '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()">x</button>',
            '</div>',
            '<form class="performed-feedback-modal" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitPerformedCompetencyGridDetail()">',
            '<label class="import-modal__field">',
            '<span>Evidenzart</span>',
            '<input id="performedCompetencyEvidenceTypeInput" type="text" value="', escapeValue(String(modal && modal.draftEvidenceType || "")), '" autocomplete="off" spellcheck="false" oninput="return window.UnterrichtsassistentApp.updatePerformedCompetencyEvidenceTypeDraft(this.value)">',
            '</label>',
            '<label class="import-modal__field">',
            '<span>Text</span>',
            '<textarea id="performedCompetencyEvidenceTextInput" rows="5" oninput="return window.UnterrichtsassistentApp.updatePerformedEvaluationDetailDraft(this.value)">', escapeValue(modalDraft), '</textarea>',
            '</label>',
            '<div class="import-modal__actions">',
            '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()">Abbrechen</button>',
            '<button class="circle-action" type="submit">Speichern</button>',
            '</div>',
            '</form>',
            '</div>',
            '</div>'
          ].join("");
        }

        if (modalType === "competencynextstep") {
          return [
            '<div class="import-modal">',
            '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()"></div>',
            '<div class="import-modal__dialog import-modal__dialog--performed-feedback" role="dialog" aria-modal="true">',
            '<div class="import-modal__header">',
            '<div><h3>Naechster Schritt</h3></div>',
            '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()">x</button>',
            '</div>',
            '<form class="performed-feedback-modal" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitPerformedCompetencyGridDetail()">',
            '<label class="import-modal__field">',
            '<span>Naechster Schritt</span>',
            '<textarea id="performedCompetencyNextStepInput" rows="6" oninput="return window.UnterrichtsassistentApp.updatePerformedEvaluationDetailDraft(this.value)">', escapeValue(modalDraft || String(selectedCompetencyResultLookup[modalSubtaskId] && selectedCompetencyResultLookup[modalSubtaskId].nextStep || "").trim()), '</textarea>',
            '</label>',
            '<div class="import-modal__actions">',
            '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()">Abbrechen</button>',
            '<button class="circle-action" type="submit">Speichern</button>',
            '</div>',
            '</form>',
            '</div>',
            '</div>'
          ].join("");
        }

        if (modalType === "note") {
          return [
            '<div class="import-modal">',
            '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()"></div>',
            '<div class="import-modal__dialog import-modal__dialog--performed-feedback" role="dialog" aria-modal="true">',
            '<div class="import-modal__header">',
            '<div><h3>Notiz bearbeiten</h3></div>',
            '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()">x</button>',
            '</div>',
            '<div class="performed-feedback-modal">',
            '<label class="bewertung-durchfuehrung__field bewertung-durchfuehrung__field--overall">',
            '<span>Notiz</span>',
            '<textarea rows="8" oninput="return window.UnterrichtsassistentApp.updatePerformedEvaluationDetailDraft(this.value)">', escapeValue(modalDraft || String(modalSubtaskResult && modalSubtaskResult.generalNote || "").trim()), '</textarea>',
            '</label>',
            '<div class="import-modal__actions">',
            '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()">Abbrechen</button>',
            '<button class="circle-action" type="button" onclick="return window.UnterrichtsassistentApp.submitPerformedEvaluationNote()">Speichern</button>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'
          ].join("");
        }

        if (modalMode === "add") {
          return [
            '<div class="import-modal">',
            '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()"></div>',
            '<div class="import-modal__dialog import-modal__dialog--performed-feedback" role="dialog" aria-modal="true">',
            '<div class="import-modal__header">',
            '<div><h3>', escapeValue(modalType === "negative" ? "Negative Rueckmeldung" : "Positive Rueckmeldung"), '</h3></div>',
            '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()">x</button>',
            '</div>',
            '<form class="performed-feedback-modal" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitPerformedEvaluationFeedback()">',
            '<label class="import-modal__field bewertung-task-sheet__topics-wrap">',
            '<span>Rueckmeldung</span>',
            '<input id="performedEvaluationFeedbackInput" type="text" value="', escapeValue(modalDraft), '" autocomplete="off" spellcheck="false" onfocus="return window.UnterrichtsassistentApp.handlePerformedEvaluationDetailInputFocus(\'performedEvaluationFeedbackInput\', \'performedEvaluationFeedbackSuggestions\')" oninput="return window.UnterrichtsassistentApp.handlePerformedEvaluationDetailInput(event, \'performedEvaluationFeedbackSuggestions\')" onkeydown="return window.UnterrichtsassistentApp.handlePerformedEvaluationDetailInputKeyDown(event)">',
            suggestions.length ? [
              '<div class="knowledge-gap-suggestions knowledge-gap-suggestions--static" id="performedEvaluationFeedbackSuggestions">',
              suggestions.map(function (entry) {
                return '<button class="knowledge-gap-suggestion" type="button" onclick="return window.UnterrichtsassistentApp.selectPerformedEvaluationFeedbackSuggestion(\'' + escapeValue(entry) + '\', \'performedEvaluationFeedbackInput\', \'performedEvaluationFeedbackSuggestions\')"><span class="knowledge-gap-suggestion__label">' + escapeValue(entry) + '</span></button>';
              }).join(""),
              '</div>'
            ].join("") : '<div class="knowledge-gap-suggestions knowledge-gap-suggestions--static" id="performedEvaluationFeedbackSuggestions" hidden></div>',
            '</label>',
            '<div class="import-modal__actions">',
            '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()">Abbrechen</button>',
            '<button id="performedEvaluationFeedbackSubmit" class="circle-action" type="submit"', modalDraft.trim() ? '' : ' disabled', '>✓</button>',
            '</div>',
            '</form>',
            '</div>',
            '</div>'
          ].join("");
        }

        return [
          '<div class="import-modal">',
          '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()"></div>',
          '<div class="import-modal__dialog import-modal__dialog--performed-feedback" role="dialog" aria-modal="true">',
          '<div class="import-modal__header">',
          '<div><h3>', escapeValue(modalType === "negative" ? "Negative Rueckmeldungen" : "Positive Rueckmeldungen"), '</h3></div>',
          '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()">x</button>',
          '</div>',
          '<div class="performed-feedback-modal">',
          modalFeedbackItems.length ? [
            '<div class="performed-feedback-modal__list">',
            modalFeedbackItems.map(function (entry, index) {
              return [
                '<div class="performed-feedback-modal__item">',
                '<div class="performed-feedback-modal__text">', escapeValue(entry), '</div>',
                '<button class="bewertung-task-sheet__delete" type="button" onclick="return window.UnterrichtsassistentApp.deletePerformedEvaluationFeedback(\'', escapeValue(modalSubtaskId), '\', \'', escapeValue(modalType), '\', \'', escapeValue(String(index)), '\')">Loeschen</button>',
                '</div>'
              ].join("");
            }).join(""),
            '</div>'
          ].join("") : '<div class="bewertung-analysis__empty">Noch keine Rueckmeldungen vorhanden.</div>',
          '<div class="import-modal__actions">',
          '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.closePerformedEvaluationDetailModal()">Schliessen</button>',
          '<button class="circle-action" type="button" onclick="return window.UnterrichtsassistentApp.openPerformedEvaluationDetailModal(\'', escapeValue(modalSubtaskId), '\', \'', escapeValue(modalType), '\', \'add\')">+</button>',
          '</div>',
          '</div>',
          '</div>',
          '</div>'
        ].join("");
      }

      if (!activeClass) {
        return [
          '<div class="unterricht-layout">',
          '<article class="panel unterricht-layout__content">',
          '<p class="empty-message">Waehle zuerst eine Lerngruppe, damit du Bewertungen planen kannst.</p>',
          '</article>',
          '</div>'
        ].join("");
      }

      return [
        '<div class="bewertung-layout">',
        '<article class="panel bewertung-planung">',
        '<div class="bewertung-planung__header">',
        '<div>',
        '<h2 class="bewertung-planung__title">Bewertungen planen</h2>',
        '<p class="bewertung-planung__hint">Geplante Bewertungen werden hier kompakt fuer die aktuelle Lerngruppe verwaltet.</p>',
        '</div>',
        hiddenPlannedEvaluationsCount > 0 || isPlannedEvaluationsExpanded ? [
          '<button class="bewertung-planung__toggle" type="button" onclick="return window.UnterrichtsassistentApp.toggleBewertungPlannedEvaluationsExpanded()">',
          isPlannedEvaluationsExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen',
          hiddenPlannedEvaluationsCount > 0 && !isPlannedEvaluationsExpanded ? '<span class="bewertung-planung__toggle-count">+' + escapeValue(String(hiddenPlannedEvaluationsCount)) + '</span>' : '',
          '</button>'
        ].join("") : '',
        '</div>',
        isPlannedEvaluationsExpanded ? [
          '<div class="bewertung-planung__grid">',
          visiblePlannedEvaluations.map(function (plannedEvaluation) {
            return [
              '<div class="bewertung-planung__grid-item">',
              buildPlannedEvaluationCard(plannedEvaluation),
              '</div>'
            ].join("");
          }).join(""),
          '<div class="bewertung-planung__grid-item bewertung-planung__grid-item--add">',
          '<button class="bewertung-planung__add" type="button" onclick="return window.UnterrichtsassistentApp.openPlannedEvaluationModal()">+</button>',
          '</div>',
          '</div>'
        ].join("") : [
          '<div class="bewertung-planung__table-wrap">',
          '<table class="bewertung-planung__table"><tbody><tr>',
          visiblePlannedEvaluations.map(function (plannedEvaluation) {
            return [
              '<td class="bewertung-planung__cell">',
              buildPlannedEvaluationCard(plannedEvaluation),
              '</td>'
            ].join("");
          }).join(""),
          '<td class="bewertung-planung__cell bewertung-planung__cell--add">',
          '<button class="bewertung-planung__add" type="button" onclick="return window.UnterrichtsassistentApp.openPlannedEvaluationModal()">+</button>',
          '</td>',
          '</tr></tbody></table>',
          '</div>'
        ].join(""),
        '</article>',
        buildPlannedEvaluationDetailsPanel(),
        buildPerformedEvaluationPanel(),
        plannedEvaluationDraft ? (function () {
          const selectedSheetId = String(plannedEvaluationDraft && plannedEvaluationDraft.evaluationSheetId || "").trim();
          const selectedDate = String(plannedEvaluationDraft && plannedEvaluationDraft.date || "").slice(0, 10);
          const createPlanningEvent = !plannedEvaluationDraft || plannedEvaluationDraft.createPlanningEvent !== false;
          const hasSelectableSheet = sheets.length || Boolean(selectedSheetId);
          const hasSelectableDate = availableDates.length || Boolean(selectedDate);
          const showClasstimeImportButton = !String(plannedEvaluationDraft && plannedEvaluationDraft.id || "").trim();
          const sheetOptions = (function () {
            const options = sheets.map(function (sheet, index) {
              const sheetId = String(sheet && sheet.id || "").trim();
              const isSelected = selectedSheetId
                ? selectedSheetId === sheetId
                : index === 0;

              return '<option value="' + escapeValue(sheetId) + '"' + (isSelected ? ' selected' : '') + '>' + escapeValue(String(sheet && sheet.title || "").trim() || "Ohne Titel") + '</option>';
            }).join("");

            if (!options) {
              return '<option value="">Keine Bewertungsboegen vorhanden</option>';
            }

            if (selectedSheetId && !sheetLookup[selectedSheetId]) {
              return '<option value="' + escapeValue(selectedSheetId) + '" selected>Ausgewaehlter Bewertungsbogen fehlt</option>' + options;
            }

            return options;
          }());
          const dateOptions = (function () {
            const options = availableDates.map(function (entry, index) {
              const normalizedDate = String(entry && entry.date || "").slice(0, 10);
              const isSelected = selectedDate
                ? selectedDate === normalizedDate
                : index === 0;

              return '<option value="' + escapeValue(normalizedDate) + '"' + (isSelected ? ' selected' : '') + '>' + escapeValue(String(entry && entry.label || normalizedDate)) + '</option>';
            }).join("");

            if (!options) {
              return '<option value="">Keine verfuegbaren Termine</option>';
            }

            if (selectedDate && !availableDates.some(function (entry) { return String(entry && entry.date || "").slice(0, 10) === selectedDate; })) {
              return '<option value="' + escapeValue(selectedDate) + '" selected>' + escapeValue(formatLongDateLabel(selectedDate) || selectedDate) + '</option>' + options;
            }

            return options;
          }());
          const studentRows = buildStudentRows(students);

          return [
            '<div class="import-modal" id="plannedEvaluationModal">',
            '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closePlannedEvaluationModal()"></div>',
            '<div class="import-modal__dialog import-modal__dialog--planning-evaluation" role="dialog" aria-modal="true" aria-labelledby="plannedEvaluationModalTitle">',
            '<div class="import-modal__header">',
            '<div>',
            '<h3 id="plannedEvaluationModalTitle">', escapeValue(String(plannedEvaluationDraft && plannedEvaluationDraft.id || "").trim() ? "Bewertung bearbeiten" : "Bewertung planen"), '</h3>',
            '<div class="import-modal__meta">', escapeValue([String(activeClass.name || "").trim(), String(activeClass.subject || "").trim()].filter(Boolean).join(" ")), '</div>',
            '</div>',
            '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closePlannedEvaluationModal()">x</button>',
            '</div>',
            '<form class="import-modal__form" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitPlannedEvaluationModal(event)">',
            '<div class="bewertung-planung-modal__type-switch" role="group" aria-label="Art der Leistung">',
            '<button class="bewertung-planung-modal__type-button', String(plannedEvaluationDraft && plannedEvaluationDraft.type || "sonstige").trim() === "sonstige" ? ' is-active' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.updatePlannedEvaluationDraftField(\'type\', \'sonstige\')">Sonstige</button>',
            '<button class="bewertung-planung-modal__type-button', String(plannedEvaluationDraft && plannedEvaluationDraft.type || "").trim() === "schriftliche" ? ' is-active' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.updatePlannedEvaluationDraftField(\'type\', \'schriftliche\')">Schriftliche</button>',
            '</div>',
            '<label class="import-modal__field">',
            '<span>Bewertungsbogen</span>',
            '<div class="bewertung-planung-modal__sheet-link-row">',
            '<select id="plannedEvaluationSheetInput"', hasSelectableSheet ? '' : ' disabled', ' onchange="return window.UnterrichtsassistentApp.updatePlannedEvaluationDraftField(\'evaluationSheetId\', this.value)">',
            sheetOptions,
            '</select>',
            '<button class="bewertung-planung-modal__sheet-link" type="button" title="Verknuepften Bewertungsbogen oeffnen" aria-label="Verknuepften Bewertungsbogen oeffnen" onclick="return window.UnterrichtsassistentApp.openLinkedEvaluationSheetFromPlannedEvaluation()"', hasSelectableSheet ? '' : ' disabled', '>&#8599;</button>',
            '</div>',
            '</label>',
            '<label class="import-modal__field">',
            '<span>Datum</span>',
            '<select id="plannedEvaluationDateInput"', hasSelectableDate ? '' : ' disabled', ' onchange="return window.UnterrichtsassistentApp.updatePlannedEvaluationDraftField(\'date\', this.value)">',
            dateOptions,
            '</select>',
            '</label>',
            '<label class="bewertung-planung-modal__toggle">',
            '<input id="plannedEvaluationCreatePlanningEvent" type="checkbox"', createPlanningEvent ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updatePlannedEvaluationDraftField(\'createPlanningEvent\', this.checked)">',
            '<span>Als Termin setzen</span>',
            '</label>',
            showClasstimeImportButton ? [
              '<div class="bewertung-planung-modal__import">',
              '<div class="bewertung-planung-modal__import-copy">',
              '<strong>Classtime Import</strong>',
              '<span>XLSX importieren, Aufgabenbogen erzeugen und Punkte den Schuelern zuordnen.</span>',
              '</div>',
              '<button class="circle-action" type="button" onclick="return window.UnterrichtsassistentApp.openClasstimeImportFilePicker()">Classtime Import</button>',
              '<input id="classtimeImportInput" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden onchange="return window.UnterrichtsassistentApp.importClasstimeFromFile(event)">',
              '</div>'
            ].join("") : '',
            '<div class="bewertung-planung-modal__student-header">',
            '<span class="bewertung-planung-modal__student-title">Schueler zuordnen</span>',
            '<div class="bewertung-planung-modal__student-actions">',
            '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.setAllStudentsForPlannedEvaluationDraft(true)">Alle</button>',
            '<button class="header-utility-button" type="button" onclick="return window.UnterrichtsassistentApp.setAllStudentsForPlannedEvaluationDraft(false)">Keine</button>',
            '</div>',
            '</div>',
            studentRows.length ? [
              '<div class="bewertung-planung-modal__student-table-wrap">',
              '<table class="bewertung-planung-modal__student-table"><tbody>',
              studentRows.map(function (row) {
                return [
                  '<tr>',
                  row.map(function (student) {
                    const studentId = String(student && student.id || "").trim();
                    return [
                      '<td>',
                      '<label class="bewertung-planung-modal__student-option">',
                      '<input type="checkbox"', selectedStudentLookup[studentId] ? ' checked' : '', ' onclick="return window.UnterrichtsassistentApp.togglePlannedEvaluationDraftStudent(\'', escapeValue(studentId), '\')">',
                      '<span>', escapeValue(String(student && student.firstName || "").trim() || "Ohne Namen"), '</span>',
                      '</label>',
                      '</td>'
                    ].join("");
                  }).join(""),
                  row.length < 5 ? new Array(5 - row.length + 1).join('<td class="bewertung-planung-modal__student-empty"></td>') : '',
                  '</tr>'
                ].join("");
              }).join(""),
              '</tbody></table>',
              '</div>'
            ].join("") : '<div class="bewertung-analysis__empty">Keine Schueler in der Lerngruppe vorhanden.</div>',
            '<div class="import-modal__actions">',
            String(plannedEvaluationDraft && plannedEvaluationDraft.id || "").trim() ? '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.deleteActivePlannedEvaluation()">Loeschen</button>' : '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.closePlannedEvaluationModal()">Abbrechen</button>',
            String(plannedEvaluationDraft && plannedEvaluationDraft.id || "").trim() ? '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.closePlannedEvaluationModal()">Schliessen</button>' : '',
            '<button class="circle-action" type="submit"', (!hasSelectableSheet || !hasSelectableDate) ? ' disabled' : '', '>Speichern</button>',
            '</div>',
            '</form>',
            '</div>',
            '</div>'
          ].join("");
        }()) : '',
        classtimeImportDraft ? (function () {
          const importedStudents = Array.isArray(classtimeImportDraft && classtimeImportDraft.importedStudents)
            ? classtimeImportDraft.importedStudents.slice()
            : [];
          const classtimeQuestions = Array.isArray(classtimeImportDraft && classtimeImportDraft.questions)
            ? classtimeImportDraft.questions.slice()
            : [];
          const importedStudentsById = importedStudents.reduce(function (lookup, entry) {
            const entryId = String(entry && entry.id || "").trim();

            if (entryId) {
              lookup[entryId] = entry;
            }

            return lookup;
          }, {});
          const assignedImportedIds = Object.keys(classtimeImportDraft && classtimeImportDraft.assignmentsByStudentId || {}).reduce(function (lookup, studentId) {
            const importedId = String(classtimeImportDraft.assignmentsByStudentId[studentId] || "").trim();

            if (importedId) {
              lookup[importedId] = true;
            }

            return lookup;
          }, {});
          const unassignedImportedStudents = importedStudents.filter(function (entry) {
            return !assignedImportedIds[String(entry && entry.id || "").trim()];
          });
          const assignedStudentCount = students.filter(function (student) {
            return Boolean(classtimeImportDraft && classtimeImportDraft.assignmentsByStudentId && classtimeImportDraft.assignmentsByStudentId[String(student && student.id || "").trim()]);
          }).length;

          function renderImportedChip(importedStudent, isAssigned) {
            const importedId = String(importedStudent && importedStudent.id || "").trim();
            const totalPoints = formatPointsLabel(importedStudent && importedStudent.totalPoints);
            const label = String(importedStudent && importedStudent.sourceName || "").trim() || "Ohne Namen";

            return [
              '<button class="classtime-import__chip', isAssigned ? ' is-assigned' : '', '" type="button" draggable="true" ondragstart="return window.UnterrichtsassistentApp.startClasstimeImportAssignmentDrag(event, \'', escapeValue(importedId), '\')" onpointerdown="return window.UnterrichtsassistentApp.startClasstimeImportPointerDrag(event, \'', escapeValue(importedId), '\')"',
              isAssigned ? ' onclick="return window.UnterrichtsassistentApp.handleClasstimeImportChipClick(event, \'' + escapeValue(importedId) + '\')"' : '',
              '>',
              '<span class="classtime-import__chip-name">', escapeValue(label), '</span>',
              '<span class="classtime-import__chip-meta">', escapeValue(totalPoints), ' P.</span>',
              '</button>'
            ].join("");
          }

          function renderClasstimeTaskSettings(question, index) {
            const questionKey = String(question && question.key || "").trim();
            const detectedSubtasks = Array.isArray(question && question.detectedSubtasks)
              ? question.detectedSubtasks.filter(function (subtask) {
                  return String(subtask && subtask.title || "").trim();
                })
              : [];
            const maxPoints = formatPointsLabel(question && question.maxPoints);
            const isChecked = Boolean(question && question.detectSubtasks);
            const canDetectSubtasks = detectedSubtasks.length > 0;

            return [
              '<div class="classtime-import__task-row">',
              '<div class="classtime-import__task-main">',
              '<strong>', escapeValue(String(question && question.taskTitle || "Aufgabe " + String(index + 1)).trim()), '</strong>',
              '<span>', escapeValue(String(question && question.title || "").trim() || "Ohne Titel"), '</span>',
              '</div>',
              '<div class="classtime-import__task-points">', escapeValue(maxPoints), ' P.</div>',
              '<label class="classtime-import__task-toggle">',
              '<input type="checkbox"', isChecked ? ' checked' : '', canDetectSubtasks ? '' : ' disabled',
              ' onchange="return window.UnterrichtsassistentApp.toggleClasstimeQuestionSubtasks(\'', escapeValue(questionKey), '\', this.checked)">',
              '<span>Teilaufgaben erkennen</span>',
              '</label>',
              '<div class="classtime-import__subtask-preview">',
              canDetectSubtasks
                ? detectedSubtasks.map(function (subtask) {
                    return '<span>' + escapeValue(String(subtask && subtask.title || "").trim()) + '</span>';
                  }).join("")
                : '<em>Keine Teilaufgaben erkannt</em>',
              '</div>',
              '</div>'
            ].join("");
          }

          return [
            '<div class="import-modal" id="classtimeImportModal">',
            '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeClasstimeImportModal()"></div>',
            '<div class="import-modal__dialog import-modal__dialog--classtime-import" role="dialog" aria-modal="true" aria-labelledby="classtimeImportModalTitle">',
            '<div class="import-modal__header">',
            '<div>',
            '<h3 id="classtimeImportModalTitle">Classtime zuordnen</h3>',
            '<div class="import-modal__meta">', escapeValue(String(classtimeImportDraft && classtimeImportDraft.evaluationSheetTitle || "").trim()), ' | ', escapeValue(String(classtimeImportDraft && classtimeImportDraft.sourceFileName || "").trim()), '</div>',
            '</div>',
            '<div class="import-modal__icon-actions">',
            '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Import abbrechen" onclick="return window.UnterrichtsassistentApp.closeClasstimeImportModal()">x</button>',
            '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="button" aria-label="Import uebernehmen" onclick="return window.UnterrichtsassistentApp.confirmClasstimeImport()">&#10003;</button>',
            '</div>',
            '</div>',
            '<div class="classtime-import">',
            '<div class="classtime-import__summary">',
            '<div class="classtime-import__summary-card"><strong>', escapeValue(String(classtimeQuestions.length)), '</strong><span>Aufgaben</span></div>',
            '<div class="classtime-import__summary-card"><strong>', escapeValue(String(importedStudents.length)), '</strong><span>Classtime-Namen</span></div>',
            '<div class="classtime-import__summary-card"><strong>', escapeValue(String(assignedStudentCount)), ' / ', escapeValue(String(students.length)), '</strong><span>Zugeordnet</span></div>',
            '</div>',
            '<div class="classtime-import__tasks">',
            '<div class="classtime-import__section-title">Aufgaben &amp; Teilaufgaben</div>',
            '<div class="classtime-import__task-list">',
            classtimeQuestions.length
              ? classtimeQuestions.map(renderClasstimeTaskSettings).join("")
              : '<div class="classtime-import__empty">Keine Aufgaben erkannt.</div>',
            '</div>',
            '</div>',
            '<div class="classtime-import__pool" data-classtime-import-drop-target="pool" ondragover="return window.UnterrichtsassistentApp.allowClasstimeImportAssignmentDrop(event)" ondrop="return window.UnterrichtsassistentApp.dropClasstimeImportAssignmentToPool(event)">',
            '<div class="classtime-import__section-title">Nicht zugeordnet</div>',
            '<div class="classtime-import__pool-list">',
            unassignedImportedStudents.length
              ? unassignedImportedStudents.map(function (entry) {
                  return renderImportedChip(entry, false);
                }).join("")
              : '<div class="classtime-import__empty">Alle importierten Namen sind aktuell zugeordnet.</div>',
            '</div>',
            '</div>',
            '<div class="classtime-import__assignments">',
            students.map(function (student) {
              const studentId = String(student && student.id || "").trim();
              const importedId = String(classtimeImportDraft && classtimeImportDraft.assignmentsByStudentId && classtimeImportDraft.assignmentsByStudentId[studentId] || "").trim();
              const importedStudent = importedStudentsById[importedId] || null;
              const matchScore = Number(classtimeImportDraft && classtimeImportDraft.matchScoresByStudentId && classtimeImportDraft.matchScoresByStudentId[studentId]) || 0;

              return [
                '<div class="classtime-import__assignment-row" data-classtime-import-drop-target="student" data-classtime-import-student-id="', escapeValue(studentId), '" ondragover="return window.UnterrichtsassistentApp.allowClasstimeImportAssignmentDrop(event)" ondrop="return window.UnterrichtsassistentApp.dropClasstimeImportAssignmentOnStudent(event, \'', escapeValue(studentId), '\')">',
                '<div class="classtime-import__student">',
                '<span class="classtime-import__student-name">', escapeValue(getStudentDisplayName(student)), '</span>',
                matchScore ? '<span class="classtime-import__student-match">Auto-Match ' + escapeValue(String(Math.round(matchScore * 100))) + '%</span>' : '',
                '</div>',
                '<div class="classtime-import__dropzone', importedStudent ? ' has-assignment' : '', '">',
                importedStudent
                  ? renderImportedChip(importedStudent, true)
                  : '<span class="classtime-import__placeholder">Namen hierhin ziehen</span>',
                '</div>',
                '</div>'
              ].join("");
            }).join(""),
            '</div>',
            '</div>',
            '</div>',
            '</div>'
          ].join("");
        }()) : '',
        buildPerformedEvaluationDetailModal(),
        '</div>'
      ].join("");
    }

    function renderAnalysisMode() {
      const sheets = getSheetsForActiveClass();
      const students = getStudentsForActiveClass();
      const plannedEvaluations = getPlannedEvaluationsForActiveClass();
      const performedEvaluations = Array.isArray(snapshot.performedEvaluations) ? snapshot.performedEvaluations : [];
      const sheetLookup = sheets.reduce(function (lookup, sheet) {
        const sheetId = String(sheet && sheet.id || "").trim();

        if (sheetId) {
          lookup[sheetId] = sheet;
        }

        return lookup;
      }, {});
      const studentLookup = students.reduce(function (lookup, student) {
        const studentId = String(student && student.id || "").trim();

        if (studentId) {
          lookup[studentId] = student;
        }

        return lookup;
      }, {});
      const selectedPlannedEvaluation = plannedEvaluations.find(function (plannedEvaluation) {
        return String(plannedEvaluation && plannedEvaluation.id || "").trim() === activeAnalysisPlannedEvaluationId;
      }) || plannedEvaluations[0] || null;
      const selectedPlannedEvaluationId = String(selectedPlannedEvaluation && selectedPlannedEvaluation.id || "").trim();
      const selectedSheet = selectedPlannedEvaluation
        ? sheetLookup[String(selectedPlannedEvaluation && selectedPlannedEvaluation.evaluationSheetId || "").trim()] || null
        : null;
      const tasks = String(selectedSheet && selectedSheet.type || "").trim() === "aufgabenbogen"
        ? getTaskSheetTasks(selectedSheet)
        : [];
      const assignedStudents = selectedPlannedEvaluation && Array.isArray(selectedPlannedEvaluation.studentIds)
        ? selectedPlannedEvaluation.studentIds.map(function (studentId) {
            return studentLookup[String(studentId || "").trim()] || null;
          }).filter(Boolean)
        : [];
      const performedLookup = performedEvaluations.reduce(function (lookup, entry) {
        const studentId = String(entry && entry.studentId || "").trim();

        if (studentId && String(entry && entry.plannedEvaluationId || "").trim() === selectedPlannedEvaluationId) {
          lookup[studentId] = entry;
        }

        return lookup;
      }, {});
      const columns = tasks.reduce(function (result, task, taskIndex) {
        const taskId = String(task && task.id || "").trim();
        const subtasks = getSubtasksForTask(task);
        const taskLabel = "Aufgabe " + String(taskIndex + 1);
        const taskTitle = String(task && task.title || "").trim();

        if (subtasks.length === 1) {
          const subtask = subtasks[0];
          result.push({
            key: "task:" + taskId,
            type: "task",
            taskId: taskId,
            subtaskIds: [String(subtask && subtask.id || "").trim()].filter(Boolean),
            label: taskTitle ? taskLabel + ": " + taskTitle : taskLabel,
            max: getRegularBeValue(subtask),
            additionalMax: isAdditionalSubtask(subtask) ? getBeValue(subtask) : 0,
            isTaskStart: true
          });
          return result;
        }

        result.push({
          key: "task:" + taskId,
          type: "task",
          taskId: taskId,
          subtaskIds: subtasks.map(function (subtask) {
            return String(subtask && subtask.id || "").trim();
          }).filter(Boolean),
          label: taskTitle ? taskLabel + ": " + taskTitle : taskLabel,
          max: subtasks.reduce(function (sum, subtask) {
            return sum + getRegularBeValue(subtask);
          }, 0),
          additionalMax: subtasks.reduce(function (sum, subtask) {
            return sum + (isAdditionalSubtask(subtask) ? getBeValue(subtask) : 0);
          }, 0),
          isTaskStart: true
        });

        subtasks.forEach(function (subtask, subtaskIndex) {
          const subtaskTitle = String(subtask && subtask.title || "").trim();

          result.push({
            key: "subtask:" + String(subtask && subtask.id || "").trim(),
            type: "subtask",
            taskId: taskId,
            subtaskId: String(subtask && subtask.id || "").trim(),
            label: (subtaskTitle || taskLabel + "." + String(subtaskIndex + 1)) + (isAdditionalSubtask(subtask) ? " (Zusatzaufgabe)" : ""),
            max: getRegularBeValue(subtask),
            additionalMax: isAdditionalSubtask(subtask) ? getBeValue(subtask) : 0,
            isTaskStart: false
          });
        });

        return result;
      }, []);
      const totalColumn = {
        key: "total",
        type: "total",
        label: "Gesamtpunktzahl",
        max: columns.filter(function (column) {
          return column.type === "task" || column.isTaskStart;
        }).reduce(function (sum, column) {
          return sum + (column.type === "task" || column.isTaskStart ? Math.max(0, Number(column.max) || 0) : 0);
        }, 0),
        additionalMax: columns.filter(function (column) {
          return column.type === "task" || column.isTaskStart;
        }).reduce(function (sum, column) {
          return sum + (column.type === "task" || column.isTaskStart ? Math.max(0, Number(column.additionalMax) || 0) : 0);
        }, 0),
        isTaskStart: true
      };
      const visibleAnalysisColumns = columns.filter(function (column) {
        if (column && column.type === "task") {
          return !bewertungAnalysisColumnVisibility || bewertungAnalysisColumnVisibility.tasks !== false;
        }

        if (column && column.type === "subtask") {
          return !bewertungAnalysisColumnVisibility || bewertungAnalysisColumnVisibility.subtasks !== false;
        }

        return true;
      });
      const sortKey = String(bewertungAnalysisSort && bewertungAnalysisSort.key || "student");
      const sortDirection = String(bewertungAnalysisSort && bewertungAnalysisSort.direction || "asc") === "desc" ? "desc" : "asc";
      const sortedStudents = assignedStudents.slice().sort(function (left, right) {
        const directionFactor = sortDirection === "desc" ? -1 : 1;
        let comparison = 0;

        function getColumnAchieved(student, column) {
          const performedEvaluation = performedLookup[String(student && student.id || "").trim()] || null;
          const subtaskLookup = performedEvaluation && Array.isArray(performedEvaluation.subtaskResults)
            ? performedEvaluation.subtaskResults.reduce(function (lookup, entry) {
                const subtaskId = String(entry && entry.subtaskId || "").trim();

                if (subtaskId) {
                  lookup[subtaskId] = Math.max(0, Number(entry && entry.points) || 0);
                }

                return lookup;
              }, {})
            : {};

          if (column.type === "task") {
            return (Array.isArray(column.subtaskIds) ? column.subtaskIds : []).reduce(function (sum, subtaskId) {
              return sum + (subtaskLookup[subtaskId] || 0);
            }, 0);
          }

          if (column.type === "total") {
            return columns.filter(function (entry) {
              return entry.type === "task" || entry.isTaskStart;
            }).reduce(function (sum, entry) {
              return sum + getColumnAchieved(student, entry);
            }, 0);
          }

          return subtaskLookup[String(column.subtaskId || "").trim()] || 0;
        }

        if (sortKey === "student") {
          comparison = sortStudentsByFirstName(left, right);
        } else {
          const column = [totalColumn].concat(columns).find(function (item) {
            return String(item && item.key || "").trim() === sortKey;
          }) || null;

          if (column) {
            comparison = getColumnAchieved(left, column) - getColumnAchieved(right, column);
          }
        }

        if (comparison === 0 && sortKey !== "student") {
          return sortStudentsByFirstName(left, right);
        }

        return comparison * directionFactor;
      });

      function buildSortButton(label, key) {
        const normalizedKey = String(key || "").trim();
        const isActive = sortKey === normalizedKey;
        const indicator = isActive ? (sortDirection === "desc" ? " v" : " ^") : "";

        return [
          '<button class="bewertung-analysis-table__sort" type="button" onclick="return window.UnterrichtsassistentApp.toggleBewertungAnalysisSort(\'', escapeValue(normalizedKey), '\')">',
          escapeValue(label),
          '<span>', escapeValue(indicator), '</span>',
          '</button>'
        ].join("");
      }

      function getStudentColumnValue(student, column) {
        const performedEvaluation = performedLookup[String(student && student.id || "").trim()] || null;
        const subtaskLookup = performedEvaluation && Array.isArray(performedEvaluation.subtaskResults)
          ? performedEvaluation.subtaskResults.reduce(function (lookup, entry) {
              const subtaskId = String(entry && entry.subtaskId || "").trim();

              if (subtaskId) {
                lookup[subtaskId] = Math.max(0, Number(entry && entry.points) || 0);
              }

              return lookup;
            }, {})
          : {};

          if (column.type === "task") {
            return (Array.isArray(column.subtaskIds) ? column.subtaskIds : []).reduce(function (sum, subtaskId) {
              return sum + (subtaskLookup[subtaskId] || 0);
            }, 0);
          }

          if (column.type === "total") {
            return columns.filter(function (entry) {
              return entry.type === "task" || entry.isTaskStart;
            }).reduce(function (sum, entry) {
              return sum + getStudentColumnValue(student, entry);
            }, 0);
          }

          return subtaskLookup[String(column.subtaskId || "").trim()] || 0;
        }

      function getNormalizedAnalysisGradingSystem(plannedEvaluation) {
        return (Array.isArray(plannedEvaluation && plannedEvaluation.gradingSystem) ? plannedEvaluation.gradingSystem : []).map(function (entry) {
          return {
            id: String(entry && entry.id || "").trim(),
            label: String(entry && entry.label || "").trim(),
            minPercent: Math.max(0, Math.min(100, Number.isFinite(Number(entry && entry.minPercent)) ? Number(entry.minPercent) : 0))
          };
        }).filter(function (entry) {
          return Boolean(entry.id);
        }).sort(function (left, right) {
          if (left.minPercent === right.minPercent) {
            return left.label.localeCompare(right.label, "de-DE");
          }

          return right.minPercent - left.minPercent;
        });
      }

      function getAnalysisStageForPoints(pointsValue, maxValue, gradingStages) {
        const normalizedPoints = Math.max(0, Number(pointsValue) || 0);
        const normalizedMax = Math.max(0, Number(maxValue) || 0);

        return gradingStages.find(function (stage) {
          const threshold = normalizedMax > 0
            ? roundUpHalfPointThreshold(normalizedMax * Math.max(0, Number(stage && stage.minPercent) || 0) / 100)
            : 0;

          return normalizedPoints + 0.000001 >= threshold;
        }) || null;
      }

      function formatHalfPointThreshold(value) {
        const normalizedValue = roundUpHalfPointThreshold(value);

        return formatCompactPointsLabel(normalizedValue);
      }

      function buildClassOverviewContent() {
        const showTaskColumns = !bewertungAnalysisColumnVisibility || bewertungAnalysisColumnVisibility.tasks !== false;
        const showSubtaskColumns = !bewertungAnalysisColumnVisibility || bewertungAnalysisColumnVisibility.subtasks !== false;

        if (!selectedSheet) {
          return '<p class="empty-message">Der verknuepfte Bewertungsbogen wurde nicht gefunden.</p>';
        }

        if (String(selectedSheet.type || "").trim() !== "aufgabenbogen") {
          return '<p class="empty-message">Diese Analyse ist aktuell fuer Aufgabenboegen verfuegbar.</p>';
        }

        if (!columns.length) {
          return '<p class="empty-message">Der Aufgabenbogen enthaelt noch keine Teilaufgaben.</p>';
        }

        return [
          '<div class="bewertung-analysis-table__controls">',
          '<label class="bewertung-planung-modal__toggle"><input type="checkbox"', showTaskColumns ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updateBewertungAnalysisColumnVisibility(\'tasks\', this.checked)"><span>Aufgaben</span></label>',
          '<label class="bewertung-planung-modal__toggle"><input type="checkbox"', showSubtaskColumns ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updateBewertungAnalysisColumnVisibility(\'subtasks\', this.checked)"><span>Teilaufgaben</span></label>',
          '</div>',
          '<div class="bewertung-analysis-table__wrap">',
          '<table class="bewertung-analysis-table">',
          '<thead><tr>',
          '<th class="bewertung-analysis-table__student-head">', buildSortButton("Schueler", "student"), '</th>',
          '<th class="bewertung-analysis-table__score-head is-total is-task-start">',
          buildSortButton(totalColumn.label, totalColumn.key),
          '<span class="bewertung-analysis-table__max">/', escapeValue(formatReachableLabel(totalColumn.max, totalColumn.additionalMax)), '</span>',
          '</th>',
          visibleAnalysisColumns.map(function (column) {
            return [
              '<th class="bewertung-analysis-table__score-head', column.isTaskStart ? ' is-task-start' : '', '">',
              buildSortButton(column.label, column.key),
              '<span class="bewertung-analysis-table__max">/', escapeValue(formatReachableLabel(column.max, column.additionalMax)), '</span>',
              '</th>'
            ].join("");
          }).join(""),
          '</tr></thead>',
          '<tbody>',
          sortedStudents.map(function (student) {
            return [
              '<tr>',
              '<th class="bewertung-analysis-table__student">', escapeValue([String(student && student.firstName || "").trim(), String(student && student.lastName || "").trim()].filter(Boolean).join(" ") || "Ohne Namen"), '</th>',
              (function () {
                const achieved = getStudentColumnValue(student, totalColumn);
                const maxValue = Math.max(0, Number(totalColumn.max) || 0);

                return [
                  '<td class="bewertung-analysis-table__cell is-total ', escapeValue(getCellTone(achieved, maxValue)), ' is-task-start">',
                  '<span>', escapeValue(formatCompactPointsLabel(achieved)), ' / ', escapeValue(formatCompactPointsLabel(maxValue)), '</span>',
                  '</td>'
                ].join("");
              }()),
              visibleAnalysisColumns.map(function (column) {
                const achieved = getStudentColumnValue(student, column);
                const maxValue = Math.max(0, Number(column && column.max) || 0);

                return [
                  '<td class="bewertung-analysis-table__cell ', escapeValue(getCellTone(achieved, maxValue)), column.isTaskStart ? ' is-task-start' : '', '">',
                  '<span>', escapeValue(formatCompactPointsLabel(achieved)), ' / ', escapeValue(formatCompactPointsLabel(maxValue)), '</span>',
                  '</td>'
                ].join("");
              }).join(""),
              '</tr>'
            ].join("");
          }).join(""),
          '</tbody>',
          '</table>',
          '</div>'
        ].join("");
      }

      function buildEvaluationOverviewContent() {
        const gradingStages = getNormalizedAnalysisGradingSystem(selectedPlannedEvaluation);
        const maxValue = Math.max(0, Number(totalColumn.max) || 0);
        const countsByStageId = gradingStages.reduce(function (lookup, stage) {
          lookup[String(stage && stage.id || "").trim()] = 0;
          return lookup;
        }, {});
        const noStageKey = "__none";

        if (!selectedSheet || String(selectedSheet.type || "").trim() !== "aufgabenbogen" || !columns.length) {
          return '<p class="empty-message">Waehle eine geplante Bewertung mit Aufgabenbogen, um Bewertungsstufen auszuwerten.</p>';
        }

        if (!gradingStages.length) {
          return '<p class="empty-message">Fuer diese geplante Bewertung ist noch kein Bewertungssystem definiert.</p>';
        }

        assignedStudents.forEach(function (student) {
          const achieved = getStudentColumnValue(student, totalColumn);
          const stage = getAnalysisStageForPoints(achieved, maxValue, gradingStages);
          const stageId = String(stage && stage.id || noStageKey).trim();

          countsByStageId[stageId] = (countsByStageId[stageId] || 0) + 1;
        });

        return [
          '<div class="bewertung-analysis-stages">',
          '<div class="bewertung-analysis-stages__bars">',
          gradingStages.map(function (stage) {
            const stageId = String(stage && stage.id || "").trim();
            const count = countsByStageId[stageId] || 0;
            const percent = assignedStudents.length ? (count / assignedStudents.length) * 100 : 0;

            return [
              '<div class="bewertung-analysis-stages__bar-row">',
              '<span class="bewertung-analysis-stages__label">', escapeValue(String(stage && stage.label || "").trim() || "Ohne Stufe"), '</span>',
              '<div class="bewertung-analysis-stages__track"><span style="width:', escapeValue(String(percent > 0 ? Math.max(2, percent) : 0)), '%;"></span></div>',
              '<strong>', escapeValue(String(count)), '</strong>',
              '</div>'
            ].join("");
          }).join(""),
          '</div>',
          '<div class="bewertung-analysis-stages__thresholds">',
          '<table>',
          '<thead><tr><th>Bewertungsstufe</th><th>ab Punkten</th><th>Prozentgrenze</th></tr></thead>',
          '<tbody>',
          gradingStages.map(function (stage) {
            const threshold = maxValue * (Math.max(0, Number(stage && stage.minPercent) || 0) / 100);

            return [
              '<tr>',
              '<td>', escapeValue(String(stage && stage.label || "").trim() || "Ohne Stufe"), '</td>',
              '<td>', escapeValue(formatHalfPointThreshold(threshold)), '</td>',
              '<td>', escapeValue(String(Number(stage && stage.minPercent) || 0).replace(".", ",")), ' %</td>',
              '</tr>'
            ].join("");
          }).join(""),
          '</tbody>',
          '</table>',
          '</div>',
          '</div>'
        ].join("");
      }

      function getDiscussionGroupSettings() {
        return window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getBewertungDiscussionGroupSettings === "function"
          ? window.UnterrichtsassistentApp.getBewertungDiscussionGroupSettings()
          : { amount: 4, unit: "gruppen", mode: "heterogen", includeWarnings: true, includeGender: true, optimizationIterations: 500, optimizationRestarts: 8, selectedColumns: [] };
      }

      function normalizeAnalysisGender(student) {
        const gender = String(student && student.gender || "").trim().toLowerCase();

        if (["m", "maennlich", "männlich", "male", "junge"].indexOf(gender) >= 0) {
          return "m";
        }

        if (["w", "weiblich", "female", "maedchen", "mädchen"].indexOf(gender) >= 0) {
          return "w";
        }

        return gender || "";
      }

      function getRecentWarningLookupForAnalysis() {
        const lookup = {};
        const reference = new Date();
        const earliest = new Date(reference);

        earliest.setDate(reference.getDate() - 14);
        (Array.isArray(snapshot.warningRecords) ? snapshot.warningRecords : []).forEach(function (record) {
          const studentId = String(record && record.studentId || "").trim();
          const classId = String(record && record.classId || "").trim();
          const dateValue = String(record && (record.lessonDate || record.recordedAt) || "").slice(0, 10);
          const date = dateValue ? new Date(dateValue + "T12:00:00") : null;

          if (!studentId || classId !== String(activeClass && activeClass.id || "").trim() || !date || Number.isNaN(date.getTime())) {
            return;
          }

          if (date >= earliest && date <= reference) {
            lookup[studentId] = true;
          }
        });

        return lookup;
      }

      function shuffleAnalysisItems(items) {
        const result = items.slice();
        let index = result.length - 1;

        while (index > 0) {
          const swapIndex = Math.floor(Math.random() * (index + 1));
          const tmp = result[index];
          result[index] = result[swapIndex];
          result[swapIndex] = tmp;
          index -= 1;
        }

        return result;
      }

      function createSeededRandom(seedValue) {
        let seed = Math.max(1, Math.round(Number(seedValue) || 1)) % 2147483647;

        return function () {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
      }

      function shuffleDiscussionItems(items, random) {
        const result = items.slice();
        let index = result.length - 1;

        while (index > 0) {
          const swapIndex = Math.floor(random() * (index + 1));
          const tmp = result[index];
          result[index] = result[swapIndex];
          result[swapIndex] = tmp;
          index -= 1;
        }

        return result;
      }

      function buildDiscussionColumnOptions() {
        return columns.map(function (column) {
          return {
            key: String(column && column.key || "").trim(),
            label: String(column && column.label || "").trim() || "Aufgabe",
            isDefault: Boolean(column && column.isTaskStart)
          };
        });
      }

      function getDiscussionColumns(selectedColumnKeys) {
        const selectedLookup = selectedColumnKeys.reduce(function (lookup, key) {
          lookup[String(key || "").trim()] = true;
          return lookup;
        }, {});

        return selectedColumnKeys.length
          ? columns.filter(function (column) {
              return Boolean(selectedLookup[String(column && column.key || "").trim()]);
            })
          : columns.filter(function (column) {
              return Boolean(column && column.isTaskStart);
            });
      }

      function getDiscussionScoreProfile(student, effectiveColumns) {
        const values = effectiveColumns.map(function (column) {
          return Number(getStudentColumnValue(student, column)) || 0;
        });
        const maxValues = effectiveColumns.map(function (column) {
          return Math.max(0, Number(column && column.max) || 0);
        });

        return {
          values: values,
          ratios: values.map(function (value, index) {
            const maxValue = maxValues[index] || 0;
            return maxValue > 0 ? Math.max(0, Number(value) || 0) / maxValue : 0;
          }),
          total: values.reduce(function (sum, value) {
            return sum + value;
          }, 0)
        };
      }

      function getDiscussionProfileDistance(leftProfile, rightProfile) {
        const leftValues = Array.isArray(leftProfile && leftProfile.scoreValues) ? leftProfile.scoreValues : [];
        const rightValues = Array.isArray(rightProfile && rightProfile.scoreValues) ? rightProfile.scoreValues : [];
        const length = Math.max(leftValues.length, rightValues.length);
        let sum = 0;
        let index;

        if (!length) {
          return 0;
        }

        for (index = 0; index < length; index += 1) {
          sum += Math.abs((Number(leftValues[index]) || 0) - (Number(rightValues[index]) || 0));
        }

        return sum / length;
      }

      function getDiscussionComplementScore(leftProfile, rightProfile) {
        const leftValues = Array.isArray(leftProfile && leftProfile.scoreRatios) ? leftProfile.scoreRatios : [];
        const rightValues = Array.isArray(rightProfile && rightProfile.scoreRatios) ? rightProfile.scoreRatios : [];
        const length = Math.max(leftValues.length, rightValues.length);
        let positiveDiff = 0;
        let negativeDiff = 0;
        let differenceSum = 0;
        let index;

        if (length < 2) {
          return getDiscussionProfileDistance(leftProfile, rightProfile);
        }

        for (index = 0; index < length; index += 1) {
          const diff = (Number(leftValues[index]) || 0) - (Number(rightValues[index]) || 0);
          const absoluteDiff = Math.abs(diff);

          differenceSum += absoluteDiff;

          if (diff > 0) {
            positiveDiff += absoluteDiff;
          } else if (diff < 0) {
            negativeDiff += absoluteDiff;
          }
        }

        if (!differenceSum) {
          return 0;
        }

        return differenceSum * (Math.min(positiveDiff, negativeDiff) / differenceSum);
      }

      function getDiscussionGroupSpreadScore(members, profile) {
        const groupMembers = (Array.isArray(members) ? members : []).concat(profile ? [profile] : []);
        const valueCount = groupMembers.reduce(function (maxValueCount, member) {
          const values = Array.isArray(member && member.scoreValues) ? member.scoreValues : [];
          return Math.max(maxValueCount, values.length);
        }, 0);
        let spreadScore = 0;
        let index;

        if (groupMembers.length < 2 || !valueCount) {
          return 0;
        }

        for (index = 0; index < valueCount; index += 1) {
          const values = groupMembers.map(function (member) {
            const scoreValues = Array.isArray(member && member.scoreValues) ? member.scoreValues : [];
            return Number(scoreValues[index]) || 0;
          });
          const minValue = Math.min.apply(Math, values);
          const maxValue = Math.max.apply(Math, values);
          const range = maxValue - minValue;

          spreadScore += range * range;
        }

        return spreadScore / valueCount;
      }

      function getBalancedGroupSizes(studentCount, groupCount) {
        const sizes = [];
        const baseSize = Math.floor(studentCount / groupCount);
        const remainder = studentCount % groupCount;
        let index;

        for (index = 0; index < groupCount; index += 1) {
          sizes.push(baseSize + (index < remainder ? 1 : 0));
        }

        return sizes;
      }

      function cloneDiscussionGroups(groups) {
        return (Array.isArray(groups) ? groups : []).map(function (group) {
          return {
            maxSize: Number(group && group.maxSize) || 0,
            members: Array.isArray(group && group.members) ? group.members.slice() : []
          };
        });
      }

      function scoreDiscussionGroup(group, settings, mode) {
        const members = Array.isArray(group && group.members) ? group.members : [];
        let score = 0;
        let leftIndex;
        let rightIndex;

        if (members.length < 2) {
          return 0;
        }

        if (mode === "heterogen") {
          score += getDiscussionGroupSpreadScore(members, null) * 24;
        } else if (mode === "homogen") {
          score -= getDiscussionGroupSpreadScore(members, null) * 28;
        }

        for (leftIndex = 0; leftIndex < members.length; leftIndex += 1) {
          for (rightIndex = leftIndex + 1; rightIndex < members.length; rightIndex += 1) {
            const left = members[leftIndex];
            const right = members[rightIndex];
            const distance = getDiscussionProfileDistance(left, right);

            if (mode === "heterogen") {
              score += distance * 6;
            } else if (mode === "homogen") {
              score -= distance * 10;
            } else {
              score += getDiscussionComplementScore(left, right) * 36;
              score += distance * 1.5;
            }

            if (settings && settings.includeWarnings && left.warned && right.warned) {
              score -= 18;
            }
          }
        }

        if (settings && settings.includeGender) {
          const genderCounts = members.reduce(function (counts, member) {
            const gender = String(member && member.gender || "").trim();

            if (gender === "m" || gender === "w") {
              counts[gender] += 1;
            }

            return counts;
          }, { m: 0, w: 0 });

          score -= Math.abs(genderCounts.m - genderCounts.w) * 3;
        }

        return score;
      }

      function scoreDiscussionGroups(groups, settings, mode) {
        return (Array.isArray(groups) ? groups : []).reduce(function (sum, group) {
          return sum + scoreDiscussionGroup(group, settings, mode);
        }, 0);
      }

      function createRandomDiscussionGroups(profiles, groupSizes, random) {
        const shuffledProfiles = shuffleDiscussionItems(profiles, random);
        let offset = 0;

        return groupSizes.map(function (size) {
          const group = {
            maxSize: size,
            members: shuffledProfiles.slice(offset, offset + size)
          };

          offset += size;
          return group;
        });
      }

      function optimizeDiscussionGroups(profiles, groupSizes, settings, mode, random) {
        const iterations = Math.max(0, Math.min(5000, Math.round(Number(settings && settings.optimizationIterations) || 0)));
        const restarts = Math.max(1, Math.min(50, Math.round(Number(settings && settings.optimizationRestarts) || 1)));
        let bestGroups = [];
        let bestScore = -Infinity;
        let restartIndex;

        for (restartIndex = 0; restartIndex < restarts; restartIndex += 1) {
          let groups = createRandomDiscussionGroups(profiles, groupSizes, random);
          let currentScore = scoreDiscussionGroups(groups, settings, mode);
          let iterationIndex;

          for (iterationIndex = 0; iterationIndex < iterations; iterationIndex += 1) {
            const nonEmptyGroups = groups.filter(function (group) {
              return group.members.length > 0;
            });
            const leftGroup = nonEmptyGroups[Math.floor(random() * nonEmptyGroups.length)] || null;
            let rightGroup = nonEmptyGroups[Math.floor(random() * nonEmptyGroups.length)] || null;
            let leftMemberIndex;
            let rightMemberIndex;
            let nextScore;
            let tmp;

            if (!leftGroup || !rightGroup || nonEmptyGroups.length < 2) {
              break;
            }

            while (rightGroup === leftGroup && nonEmptyGroups.length > 1) {
              rightGroup = nonEmptyGroups[Math.floor(random() * nonEmptyGroups.length)] || null;
            }

            if (!rightGroup || rightGroup === leftGroup) {
              continue;
            }

            leftMemberIndex = Math.floor(random() * leftGroup.members.length);
            rightMemberIndex = Math.floor(random() * rightGroup.members.length);
            tmp = leftGroup.members[leftMemberIndex];
            leftGroup.members[leftMemberIndex] = rightGroup.members[rightMemberIndex];
            rightGroup.members[rightMemberIndex] = tmp;
            nextScore = scoreDiscussionGroups(groups, settings, mode);

            if (nextScore >= currentScore) {
              currentScore = nextScore;
            } else {
              tmp = leftGroup.members[leftMemberIndex];
              leftGroup.members[leftMemberIndex] = rightGroup.members[rightMemberIndex];
              rightGroup.members[rightMemberIndex] = tmp;
            }
          }

          if (currentScore > bestScore) {
            bestScore = currentScore;
            bestGroups = cloneDiscussionGroups(groups);
          }
        }

        return bestGroups;
      }

      function generateDiscussionGroups(settings) {
        const seed = Number(settings && settings.seed) || 0;
        const random = createSeededRandom(seed || 1);
        const amount = Math.max(1, Math.min(10, Math.round(Number(settings && settings.amount) || 1)));
        const unit = String(settings && settings.unit || "gruppen").trim().toLowerCase() === "personen" ? "personen" : "gruppen";
        const rawMode = String(settings && settings.mode || "heterogen").trim().toLowerCase();
        const mode = ["homogen", "ergaenzend"].indexOf(rawMode) >= 0 ? rawMode : "heterogen";
        const selectedColumnKeys = Array.isArray(settings && settings.selectedColumns) ? settings.selectedColumns.map(function (key) { return String(key || "").trim(); }).filter(Boolean) : [];
        const effectiveColumns = getDiscussionColumns(selectedColumnKeys);
        const warningLookup = settings && settings.includeWarnings ? getRecentWarningLookupForAnalysis() : {};
        const profiles = shuffleDiscussionItems(assignedStudents, random).map(function (student) {
          const studentId = String(student && student.id || "").trim();
          const scoreProfile = getDiscussionScoreProfile(student, effectiveColumns);

          return {
            student: student,
            id: studentId,
            score: scoreProfile.total,
            scoreValues: scoreProfile.values,
            scoreRatios: scoreProfile.ratios,
            warned: Boolean(warningLookup[studentId]),
            gender: normalizeAnalysisGender(student)
          };
        });
        const groupCount = profiles.length
          ? Math.max(1, Math.min(profiles.length, unit === "personen" ? Math.ceil(profiles.length / amount) : amount))
          : 0;
        const groupSizes = getBalancedGroupSizes(profiles.length, groupCount);
        const groups = optimizeDiscussionGroups(profiles, groupSizes, settings, mode, random);

        return groups.map(function (group) {
          return shuffleDiscussionItems(group.members, random);
        });
      }

      function getDiscussionGroupsCacheKey(settings) {
        return JSON.stringify({
          classId: activeClass ? String(activeClass.id || "").trim() : "",
          plannedEvaluationId: selectedPlannedEvaluationId,
          seed: Number(settings && settings.seed) || 0,
          amount: Math.max(1, Math.min(10, Math.round(Number(settings && settings.amount) || 1))),
          unit: String(settings && settings.unit || "gruppen").trim().toLowerCase() === "personen" ? "personen" : "gruppen",
          mode: ["homogen", "ergaenzend"].indexOf(String(settings && settings.mode || "heterogen").trim().toLowerCase()) >= 0
            ? String(settings && settings.mode || "heterogen").trim().toLowerCase()
            : "heterogen",
          includeWarnings: Boolean(settings && settings.includeWarnings),
          includeGender: Boolean(settings && settings.includeGender),
          optimizationIterations: Math.max(0, Math.min(5000, Math.round(Number(settings && settings.optimizationIterations) || 0))),
          optimizationRestarts: Math.max(1, Math.min(50, Math.round(Number(settings && settings.optimizationRestarts) || 1))),
          selectedColumns: Array.isArray(settings && settings.selectedColumns) ? settings.selectedColumns.map(function (key) {
            return String(key || "").trim();
          }).filter(Boolean) : [],
          assignedStudentIds: assignedStudents.map(function (student) {
            return String(student && student.id || "").trim();
          })
        });
      }

      function getCachedDiscussionGroups(settings) {
        const cacheKey = getDiscussionGroupsCacheKey(settings);
        const cache = viewRuntime && viewRuntime._discussionGroupsCache && viewRuntime._discussionGroupsCache.key === cacheKey
          ? viewRuntime._discussionGroupsCache
          : null;
        let groups;

        if (cache && Array.isArray(cache.groups)) {
          return cache.groups;
        }

        groups = generateDiscussionGroups(settings);

        if (viewRuntime) {
          viewRuntime._discussionGroupsCache = {
            key: cacheKey,
            groups: groups
          };
        }

        return groups;
      }

      function getDiscussionGroupAverageScore(group) {
        const members = Array.isArray(group) ? group : [];

        if (!members.length) {
          return 0;
        }

        return members.reduce(function (sum, profile) {
          return sum + (Number(profile && profile.score) || 0);
        }, 0) / members.length;
      }

      function applyDiscussionGroupDisplay(groups, settings) {
        const displayMode = String(settings && settings.displayMode || "default").trim().toLowerCase();
        const copiedGroups = (Array.isArray(groups) ? groups : []).map(function (group) {
          return Array.isArray(group) ? group.slice() : [];
        });

        if (displayMode === "leistung") {
          return copiedGroups.sort(function (left, right) {
            const averageDiff = getDiscussionGroupAverageScore(right) - getDiscussionGroupAverageScore(left);

            if (Math.abs(averageDiff) > 0.0001) {
              return averageDiff;
            }

            return right.length - left.length;
          }).map(function (group) {
            return group.sort(function (left, right) {
              return (Number(right && right.score) || 0) - (Number(left && left.score) || 0);
            });
          });
        }

        if (displayMode === "zufaellig") {
          const random = createSeededRandom(Number(settings && settings.displaySeed) || 1);

          return shuffleDiscussionItems(copiedGroups, random).map(function (group) {
            return shuffleDiscussionItems(group, random);
          });
        }

        return copiedGroups;
      }

      function getDiscussionStudentLabel(student) {
        const firstName = String(student && student.firstName || "").trim() || "Ohne Namen";
        const duplicateCount = assignedStudents.filter(function (item) {
          return String(item && item.firstName || "").trim().toLocaleLowerCase("de-DE") === firstName.toLocaleLowerCase("de-DE");
        }).length;
        const lastName = String(student && student.lastName || "").trim();

        return duplicateCount > 1 && lastName ? firstName + " " + lastName.charAt(0) + "." : firstName;
      }

      function buildDiscussionGroupsContent() {
        const settings = getDiscussionGroupSettings();
        const amount = Math.max(1, Math.min(10, Math.round(Number(settings.amount) || 1)));
        const unit = String(settings.unit || "gruppen").trim().toLowerCase() === "personen" ? "personen" : "gruppen";
        const rawMode = String(settings.mode || "heterogen").trim().toLowerCase();
        const mode = ["homogen", "ergaenzend"].indexOf(rawMode) >= 0 ? rawMode : "heterogen";
        const optimizationIterations = Math.max(0, Math.min(5000, Math.round(Number(settings.optimizationIterations) || 0)));
        const optimizationRestarts = Math.max(1, Math.min(50, Math.round(Number(settings.optimizationRestarts) || 1)));
        const selectedLookup = (Array.isArray(settings.selectedColumns) ? settings.selectedColumns : []).reduce(function (lookup, key) {
          lookup[String(key || "").trim()] = true;
          return lookup;
        }, {});
        const hasExplicitColumnSelection = Object.keys(selectedLookup).length > 0;
        const columnOptions = buildDiscussionColumnOptions();
        const seed = Number(settings.seed) || 0;
        const displayMode = String(settings.displayMode || "default").trim().toLowerCase();
        const generatedSettings = settings.generatedConfig && typeof settings.generatedConfig === "object"
          ? Object.assign({}, settings.generatedConfig, {
              selectedColumns: Array.isArray(settings.generatedConfig.selectedColumns) ? settings.generatedConfig.selectedColumns.slice() : [],
              seed: seed
            })
          : settings;
        const groups = seed ? applyDiscussionGroupDisplay(getCachedDiscussionGroups(generatedSettings), settings) : [];

        if (!selectedSheet || String(selectedSheet.type || "").trim() !== "aufgabenbogen" || !columns.length) {
          return '<p class="empty-message">Waehle eine geplante Bewertung mit Aufgabenbogen, um Besprechungsgruppen zu generieren.</p>';
        }

        if (!assignedStudents.length) {
          return '<p class="empty-message">Dieser geplanten Bewertung sind keine Schueler zugeordnet.</p>';
        }

        return [
          '<div class="bewertung-discussion-groups">',
          '<div class="bewertung-discussion-groups__controls">',
          '<label class="import-modal__field"><span>Anzahl</span><select onchange="return window.UnterrichtsassistentApp.updateBewertungDiscussionGroupSetting(\'amount\', this.value)">',
          [1,2,3,4,5,6,7,8,9,10].map(function (value) {
            return '<option value="' + escapeValue(String(value)) + '"' + (value === amount ? ' selected' : '') + '>' + escapeValue(String(value)) + '</option>';
          }).join(""),
          '</select></label>',
          '<label class="import-modal__field"><span>Einheit</span><select onchange="return window.UnterrichtsassistentApp.updateBewertungDiscussionGroupSetting(\'unit\', this.value)">',
          '<option value="personen"', unit === "personen" ? ' selected' : '', '>Personen</option>',
          '<option value="gruppen"', unit === "gruppen" ? ' selected' : '', '>Gruppen</option>',
          '</select></label>',
          '<label class="import-modal__field"><span>Iterationen</span><select onchange="return window.UnterrichtsassistentApp.updateBewertungDiscussionGroupSetting(\'optimizationIterations\', this.value)">',
          [0,100,250,500,1000,2500,5000].map(function (value) {
            return '<option value="' + escapeValue(String(value)) + '"' + (value === optimizationIterations ? ' selected' : '') + '>' + escapeValue(String(value)) + '</option>';
          }).join(""),
          '</select></label>',
          '<label class="import-modal__field"><span>Mehrfachstarts</span><select onchange="return window.UnterrichtsassistentApp.updateBewertungDiscussionGroupSetting(\'optimizationRestarts\', this.value)">',
          [1,4,8,12,20,32,50].map(function (value) {
            return '<option value="' + escapeValue(String(value)) + '"' + (value === optimizationRestarts ? ' selected' : '') + '>' + escapeValue(String(value)) + '</option>';
          }).join(""),
          '</select></label>',
          '<div class="bewertung-discussion-groups__mode" role="group" aria-label="Gruppenmodus">',
          '<button class="bewertung-discussion-groups__mode-option', mode === "heterogen" ? ' is-active' : '', '" type="button" aria-pressed="', mode === "heterogen" ? 'true' : 'false', '" onclick="return window.UnterrichtsassistentApp.updateBewertungDiscussionGroupSetting(\'mode\', \'heterogen\')">heterogen</button>',
          '<button class="bewertung-discussion-groups__mode-option', mode === "homogen" ? ' is-active' : '', '" type="button" aria-pressed="', mode === "homogen" ? 'true' : 'false', '" onclick="return window.UnterrichtsassistentApp.updateBewertungDiscussionGroupSetting(\'mode\', \'homogen\')">homogen</button>',
          '<button class="bewertung-discussion-groups__mode-option', mode === "ergaenzend" ? ' is-active' : '', '" type="button" aria-pressed="', mode === "ergaenzend" ? 'true' : 'false', '" onclick="return window.UnterrichtsassistentApp.updateBewertungDiscussionGroupSetting(\'mode\', \'ergaenzend\')">erg&auml;nzend</button>',
          '</div>',
          '<label class="bewertung-planung-modal__toggle"><input type="checkbox"', settings.includeWarnings ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updateBewertungDiscussionGroupSetting(\'includeWarnings\', this.checked)"><span>Verwarnungen</span></label>',
          '<label class="bewertung-planung-modal__toggle"><input type="checkbox"', settings.includeGender ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updateBewertungDiscussionGroupSetting(\'includeGender\', this.checked)"><span>Geschlecht</span></label>',
          '<button class="circle-action bewertung-discussion-groups__generate" type="button" onclick="return window.UnterrichtsassistentApp.generateBewertungDiscussionGroups()">einteilen</button>',
          '</div>',
          '<div class="bewertung-discussion-groups__columns">',
          columnOptions.map(function (option) {
            const key = String(option && option.key || "").trim();

            return [
              '<label class="bewertung-discussion-groups__column">',
              '<input type="checkbox" data-discussion-column-key="', escapeValue(key), '"', (hasExplicitColumnSelection ? selectedLookup[key] : option.isDefault) ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updateBewertungDiscussionGroupColumnsFromInputs()">',
              '<span>', escapeValue(String(option && option.label || "").trim()), '</span>',
              '</label>'
            ].join("");
          }).join(""),
          '</div>',
          seed ? [
          '<div class="bewertung-discussion-groups__grid" style="--discussion-group-columns:', escapeValue(String(Math.min(6, Math.max(1, groups.length)))), ';">',
          groups.map(function (group, index) {
            return [
              '<article class="bewertung-discussion-groups__group">',
              '<h4>Gruppe ', escapeValue(String(index + 1)), '</h4>',
              '<table class="bewertung-discussion-groups__members"><tbody>',
              group.map(function (profile) {
                return '<tr><td>' + escapeValue(getDiscussionStudentLabel(profile.student)) + '</td></tr>';
              }).join(""),
              '</tbody></table>',
              '</article>'
            ].join("");
          }).join(""),
          '</div>',
          '<div class="bewertung-discussion-groups__display-actions">',
          '<button class="bewertung-discussion-groups__display-button', displayMode === "zufaellig" ? ' is-active' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.setBewertungDiscussionGroupDisplayMode(\'zufaellig\')">zuf&auml;llig</button>',
          '<button class="bewertung-discussion-groups__display-button', displayMode === "leistung" ? ' is-active' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.setBewertungDiscussionGroupDisplayMode(\'leistung\')">Leistung</button>',
          '</div>'
          ].join("") : '<p class="empty-message">Klicke auf einteilen, um die Besprechungsgruppen zu generieren.</p>',
          '</div>'
        ].join("");
      }

      function getCellTone(achieved, maxValue) {
        const percent = Math.max(0, Number(maxValue) || 0) > 0 ? (Math.max(0, Number(achieved) || 0) / Math.max(0, Number(maxValue) || 0)) * 100 : 0;

        if (percent >= 75) {
          return "is-high";
        }

        if (percent >= 50) {
          return "is-mid";
        }

        return "is-low";
      }

      function buildPlannedEvaluationOptions() {
        return plannedEvaluations.map(function (plannedEvaluation) {
          const plannedEvaluationId = String(plannedEvaluation && plannedEvaluation.id || "").trim();
          const sheet = sheetLookup[String(plannedEvaluation && plannedEvaluation.evaluationSheetId || "").trim()] || null;
          const sheetTitle = String(sheet && sheet.title || "").trim() || "Ohne Bewertungsbogen";
          const dateLabel = formatShortDateLabel(plannedEvaluation && plannedEvaluation.date);

          return '<option value="' + escapeValue(plannedEvaluationId) + '"' + (plannedEvaluationId === selectedPlannedEvaluationId ? ' selected' : '') + '>' + escapeValue([dateLabel, sheetTitle].filter(Boolean).join(" | ")) + '</option>';
        }).join("");
      }

      if (!activeClass) {
        return [
          '<div class="unterricht-layout">',
          '<article class="panel unterricht-layout__content">',
          '<p class="empty-message">Waehle zuerst eine Lerngruppe, damit du geplante Bewertungen analysieren kannst.</p>',
          '</article>',
          '</div>'
        ].join("");
      }

      return [
        '<div class="bewertung-layout">',
        '<article class="panel bewertung-analysis-run">',
        '<div class="bewertung-planung__header">',
        '<div>',
        '<h2 class="bewertung-planung__title">Bewertungsanalyse</h2>',
        '<p class="bewertung-planung__hint">Auswertung der geplanten Bewertungen fuer die aktuelle Lerngruppe.</p>',
        '</div>',
        '</div>',
        plannedEvaluations.length ? [
          '<label class="import-modal__field bewertung-analysis-run__selector">',
          '<span>Geplante Bewertung</span>',
          '<select onchange="return window.UnterrichtsassistentApp.selectPlannedEvaluationForAnalysis(this.value)">',
          buildPlannedEvaluationOptions(),
          '</select>',
          '</label>'
        ].join("") : '',
        !plannedEvaluations.length ? '<p class="empty-message">Fuer diese Lerngruppe gibt es noch keine geplanten Bewertungen.</p>' : [
          '<section class="bewertung-analysis-run__section', isAnalysisSectionExpanded ? '' : ' is-collapsed', '">',
          buildSectionHeader("Lerngruppe Übersicht", "analysis", isAnalysisSectionExpanded),
          isAnalysisSectionExpanded ? '<div class="bewertung-analysis-run__section-body">' + buildClassOverviewContent() + '</div>' : '',
          '</section>',
          '<section class="bewertung-analysis-run__section', isAnalysisOverviewSectionExpanded ? '' : ' is-collapsed', '">',
          buildSectionHeader("Bewertungen Übersicht", "analysisoverview", isAnalysisOverviewSectionExpanded),
          isAnalysisOverviewSectionExpanded ? '<div class="bewertung-analysis-run__section-body">' + buildEvaluationOverviewContent() + '</div>' : '',
          '</section>',
          '<section class="bewertung-analysis-run__section', isDiscussionGroupsSectionExpanded ? '' : ' is-collapsed', '">',
          buildSectionHeader("Besprechungsgruppen Generieren", "discussiongroups", isDiscussionGroupsSectionExpanded),
          isDiscussionGroupsSectionExpanded ? '<div class="bewertung-analysis-run__section-body">' + buildDiscussionGroupsContent() + '</div>' : '',
          '</section>'
        ].join(""),
        '</article>',
        '</div>'
      ].join("");
    }

    function buildCompetencyGridEditor(activeSheet) {
      const grid = activeSheet && activeSheet.competencyGrid && typeof activeSheet.competencyGrid === "object"
        ? activeSheet.competencyGrid
        : {};
      const rows = Array.isArray(grid.rows) ? grid.rows : [];
      const columns = Array.isArray(grid.columns) ? grid.columns : [];
      const cells = grid.cells && typeof grid.cells === "object" ? grid.cells : {};
      const columnCount = Math.max(1, columns.length);

      if (String(activeSheet && activeSheet.type || "").trim() !== "kompetenzraster") {
        return [
          '<div class="bewertung-editor__placeholder">',
          escapeValue("Spezifische Attribute fuer diesen Bewertungsbogen folgen im naechsten Schritt."),
          '</div>'
        ].join("");
      }

      return [
        '<section class="bewertung-task-sheet bewertung-competency-grid">',
        buildSectionHeader("Kompetenzraster", "tasksheet", isTaskSheetSectionExpanded),
        isTaskSheetSectionExpanded ? [
        '<div class="bewertung-task-sheet__header">',
        '<p class="bewertung-task-sheet__hint">Teilkompetenzen stehen in den Zeilen, Niveaustufen in den Spalten. Zellen koennen per Klick beschrieben werden.</p>',
        '</div>',
        '<div class="bewertung-competency-grid__wrap">',
        '<table class="bewertung-competency-grid__table" style="--competency-grid-columns:', escapeValue(String(columnCount)), '">',
        '<thead>',
        '<tr>',
        '<th class="bewertung-competency-grid__corner">Teilkompetenz</th>',
        columns.map(function (column, columnIndex) {
          const columnId = String(column && column.id || "").trim();

          return [
            '<th class="bewertung-competency-grid__column" data-competency-grid-type="column" data-competency-grid-id="', escapeValue(columnId), '" draggable="true" ondragstart="return window.UnterrichtsassistentApp.handleCompetencyGridDragStart(event, \'column\', \'', escapeValue(columnId), '\')" ondragover="return window.UnterrichtsassistentApp.handleCompetencyGridDragOver(event)" ondrop="return window.UnterrichtsassistentApp.handleCompetencyGridDrop(event, \'column\', \'', escapeValue(columnId), '\')">',
            '<div class="bewertung-competency-grid__header-cell">',
            '<span class="bewertung-competency-grid__drag" aria-hidden="true" onpointerdown="return window.UnterrichtsassistentApp.startCompetencyGridPointerDrag(event, \'column\', \'', escapeValue(columnId), '\')">::</span>',
            '<input type="text" value="', escapeValue(String(column && column.title || "").trim()), '" placeholder="Niveau ', escapeValue(String(columnIndex + 1)), '" onchange="return window.UnterrichtsassistentApp.updateCompetencyGridColumnField(\'', escapeValue(columnId), '\', this.value)">',
            '<button class="bewertung-competency-grid__remove" type="button" aria-label="Spalte loeschen" title="Spalte loeschen" onclick="return window.UnterrichtsassistentApp.deleteCompetencyGridColumn(\'', escapeValue(columnId), '\')">-</button>',
            '</div>',
            '</th>'
          ].join("");
        }).join(""),
        '<th class="bewertung-competency-grid__add-column">',
        '<button class="bewertung-task-sheet__add-row bewertung-competency-grid__add-column-button" type="button" aria-label="Spalte hinzufuegen" onclick="return window.UnterrichtsassistentApp.addCompetencyGridColumn()">+</button>',
        '</th>',
        '<th class="bewertung-competency-grid__weight">Punkte</th>',
        '</tr>',
        '</thead>',
        '<tbody>',
        rows.map(function (row, rowIndex) {
          const rowId = String(row && row.id || "").trim();

          return [
            '<tr>',
            '<th class="bewertung-competency-grid__row" data-competency-grid-type="row" data-competency-grid-id="', escapeValue(rowId), '" draggable="true" ondragstart="return window.UnterrichtsassistentApp.handleCompetencyGridDragStart(event, \'row\', \'', escapeValue(rowId), '\')" ondragover="return window.UnterrichtsassistentApp.handleCompetencyGridDragOver(event)" ondrop="return window.UnterrichtsassistentApp.handleCompetencyGridDrop(event, \'row\', \'', escapeValue(rowId), '\')">',
            '<div class="bewertung-competency-grid__row-head">',
            '<span class="bewertung-competency-grid__drag" aria-hidden="true" onpointerdown="return window.UnterrichtsassistentApp.startCompetencyGridPointerDrag(event, \'row\', \'', escapeValue(rowId), '\')">::</span>',
            '<input type="text" value="', escapeValue(String(row && row.title || "").trim()), '" placeholder="Teilkompetenz ', escapeValue(String(rowIndex + 1)), '" onchange="return window.UnterrichtsassistentApp.updateCompetencyGridRowField(\'', escapeValue(rowId), '\', \'title\', this.value)">',
            '<button class="bewertung-competency-grid__remove" type="button" aria-label="Zeile loeschen" title="Zeile loeschen" onclick="return window.UnterrichtsassistentApp.deleteCompetencyGridRow(\'', escapeValue(rowId), '\')">-</button>',
            '</div>',
            '</th>',
            columns.map(function (column) {
              const columnId = String(column && column.id || "").trim();
              const cellValue = cells[rowId] && cells[rowId][columnId] !== undefined
                ? String(cells[rowId][columnId] || "").trim()
                : "";

              return [
                '<td class="bewertung-competency-grid__cell">',
                '<textarea placeholder="Beschreibung" onchange="return window.UnterrichtsassistentApp.updateCompetencyGridCell(\'', escapeValue(rowId), '\', \'', escapeValue(columnId), '\', this.value)">', escapeValue(cellValue), '</textarea>',
                '</td>'
              ].join("");
            }).join(""),
            '<td class="bewertung-competency-grid__add-column-cell"></td>',
            '<td class="bewertung-competency-grid__points">',
            '<input type="number" min="0" step="1" value="', escapeValue(String(Number(row && row.weight) || 0)), '" onchange="return window.UnterrichtsassistentApp.updateCompetencyGridRowField(\'', escapeValue(rowId), '\', \'weight\', this.value)">',
            '</td>',
            '</tr>'
          ].join("");
        }).join(""),
        '<tr class="bewertung-competency-grid__add-row">',
        '<td colspan="', escapeValue(String(columns.length + 3)), '">',
        '<button class="bewertung-task-sheet__add-row bewertung-task-sheet__add-row--task" type="button" aria-label="Zeile hinzufuegen" onclick="return window.UnterrichtsassistentApp.addCompetencyGridRow()">+</button>',
        '</td>',
        '</tr>',
        '</tbody>',
        '</table>',
        '</div>',
        ].join("") : '',
        '</section>'
      ].join("");
    }

    function buildTaskSheetEditor(activeSheet) {
      const tasks = getTaskSheetTasks(activeSheet);

      if (String(activeSheet && activeSheet.type || "").trim() !== "aufgabenbogen") {
        return buildCompetencyGridEditor(activeSheet);
      }

      return [
        '<section class="bewertung-task-sheet">',
        buildSectionHeader("Aufgabenbogen", "tasksheet", isTaskSheetSectionExpanded),
        isTaskSheetSectionExpanded ? [
        '<div class="bewertung-task-sheet__header">',
        '<p class="bewertung-task-sheet__hint">Aufgaben werden nacheinander aufgebaut. Teilaufgaben koennen Themen, Anforderungsbereich, Bewertungseinheiten und Kompetenzen erhalten.</p>',
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
                '<div class="bewertung-task-sheet__subtask-basics">',
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
                '<label class="bewertung-task-sheet__field bewertung-task-sheet__field--additional">',
                '<span class="bewertung-task-sheet__field-label">Zusatz</span>',
                '<input type="checkbox"', isAdditionalSubtask(subtask) ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updateEvaluationSubtaskField(\'', escapeValue(taskId), '\', \'', escapeValue(subtaskId), '\', \'isAdditionalTask\', this.checked)">',
                '</label>',
                '</div>',
                buildSubtaskCompetencySelect(taskId, subtaskId, subtask, activeSheet),
                buildSubtaskCurriculumTopicPicker(taskId, subtaskId, subtask, activeSheet),
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
          String(activeSheet.type || "").trim() === "aufgabenbogen" ? buildCompetencySourceField(activeSheet) : '',
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
          const copyOptions = buildEvaluationSheetCopyOptions(draft);
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
            '<select id="evaluationSheetCopyFromInput" class="evaluation-sheet-copy-select" onchange="return window.UnterrichtsassistentApp.selectEvaluationSheetCopySource(this.value)">',
            copyOptions,
            '</select>',
            '</label>',
            '<label class="import-modal__field">',
            '<span>Art des Bewertungsbogens</span>',
            '<select id="evaluationSheetTypeInput" onchange="return window.UnterrichtsassistentApp.updateEvaluationSheetDraftType(this.value)">',
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
        activeSheet ? buildEvaluationSubtaskTopicModal(activeSheet) : "",
        '</div>'
      ].join("");
    }

    function renderEvidenceMode() {
      const snapshot = service ? service.snapshot : null;
      const tools = snapshot && Array.isArray(snapshot.evidenceTools)
        ? snapshot.evidenceTools.slice().sort(function (left, right) {
            return String(left && left.titel || "").localeCompare(String(right && right.titel || ""), "de-DE");
          })
        : [];
      const activeToolId = String(snapshot && snapshot.activeEvidenceToolId || "").trim();
      const activeTool = tools.find(function (tool) {
        return String(tool && tool.id || "").trim() === activeToolId;
      }) || tools[0] || null;
      const expandedNodeIds = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getEvidenceToolExpandedNodeIds === "function"
        ? window.UnterrichtsassistentApp.getEvidenceToolExpandedNodeIds()
        : [];
      const levelDesignDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveEvidenceLevelDesignDraft === "function"
        ? window.UnterrichtsassistentApp.getActiveEvidenceLevelDesignDraft()
        : null;

      function isExpanded(nodeId) {
        return expandedNodeIds.indexOf(String(nodeId || "").trim()) >= 0;
      }

      function getAspectById(tool, aspectId) {
        const normalizedAspectId = String(aspectId || "").trim();

        return (Array.isArray(tool && tool.aspekte) ? tool.aspekte : []).find(function (aspect) {
          return String(aspect && aspect.id || "").trim() === normalizedAspectId;
        }) || null;
      }

      function itemTitle(item, fallback) {
        return String(item && (item.titel || item.bezeichnung) || "").trim() || fallback;
      }

      function getDefaultDesignerRectSize(textValue) {
        const text = String(textValue || "").trim();
        const longestLine = text.split(/\s+/).reduce(function (longest, word) {
          return Math.max(longest, String(word || "").length);
        }, Math.min(text.length, 18));

        return {
          width: Math.max(24, Math.min(150, Math.ceil((longestLine || 1) * 6.2) + 8)),
          height: 22
        };
      }

      function getLevelForDraft(draft) {
        const levelType = String(draft && draft.levelType || "").trim();
        const ownerAspect = levelType === "folge" ? getAspectById(activeTool, draft && draft.ownerAspectId) : null;

        return levelType === "folge" && ownerAspect
          ? (ownerAspect.folgeEbene || { ebenenAspekte: [] })
          : (activeTool && activeTool.hauptebene || { ebenenAspekte: [] });
      }

      function calculateLevelDesignBoundingBox(level, positions) {
        const aspectSizes = levelDesignDraft && levelDesignDraft.aspectSizes && typeof levelDesignDraft.aspectSizes === "object" ? levelDesignDraft.aspectSizes : {};
        const stageSizes = levelDesignDraft && levelDesignDraft.stageSizes && typeof levelDesignDraft.stageSizes === "object" ? levelDesignDraft.stageSizes : {};
        const aspectIds = Array.isArray(level && level.ebenenAspekte) ? level.ebenenAspekte : [];
        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;
        let hasBox = false;

        function includeRect(x, y, width, height) {
          if (!hasBox) {
            minX = x;
            minY = y;
            maxX = x + width;
            maxY = y + height;
            hasBox = true;
            return;
          }

          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x + width);
          maxY = Math.max(maxY, y + height);
        }

        aspectIds.forEach(function (aspectId) {
          const aspect = getAspectById(activeTool, aspectId);
          const position = positions && positions[aspectId] ? positions[aspectId] : { x: 0, y: 0 };
          const aspectSize = aspectSizes[aspectId] || {};
          const defaultAspectSize = getDefaultDesignerRectSize(aspect && aspect.titel || "Aspekt");
          const x = Number(position.x) || 0;
          const y = Number(position.y) || 0;
          const aspectWidth = Math.max(24, Number(aspectSize.width) || defaultAspectSize.width);
          const aspectHeight = Math.max(18, Number(aspectSize.height) || defaultAspectSize.height);
          const directionSizes = [
            { width: aspectWidth, height: 0 },
            { width: 0, height: aspectHeight },
            { width: aspectWidth, height: 0 },
            { width: 0, height: aspectHeight }
          ];

          includeRect(x, y, aspectWidth, aspectHeight);

          (Array.isArray(aspect && aspect.aspektDimensionen) ? aspect.aspektDimensionen : []).forEach(function (dimension, dimensionIndex) {
            const stages = Array.isArray(dimension && dimension.stufen) ? dimension.stufen : [];
            const direction = dimensionIndex % 4;
            let dimensionWidth = 0;
            let dimensionHeight = 0;

            if (!stages.length) {
              return;
            }

            stages.forEach(function (stage) {
              const stageId = String(stage && stage.id || "").trim();
              const stageSize = stageSizes[stageId] || {};
              const stageWidth = Math.max(24, Number(stageSize.width) || aspectWidth);
              const stageHeight = Math.max(18, Number(stageSize.height) || aspectHeight);

            if (direction === 0 || direction === 2) {
                dimensionHeight += stageHeight;
                dimensionWidth = Math.max(dimensionWidth, stageWidth);
            } else {
                dimensionWidth += stageWidth;
                dimensionHeight = Math.max(dimensionHeight, stageHeight);
            }
            });

            if (direction === 0 || direction === 2) {
              directionSizes[direction].height += dimensionHeight;
              directionSizes[direction].width = Math.max(directionSizes[direction].width, dimensionWidth);
            } else {
              directionSizes[direction].width += dimensionWidth;
              directionSizes[direction].height = Math.max(directionSizes[direction].height, dimensionHeight);
            }
          });

          if (directionSizes[0].height) {
            includeRect(x, y - directionSizes[0].height, directionSizes[0].width, directionSizes[0].height);
          }
          if (directionSizes[1].width) {
            includeRect(x + aspectWidth, y, directionSizes[1].width, directionSizes[1].height);
          }
          if (directionSizes[2].height) {
            includeRect(x, y + aspectHeight, directionSizes[2].width, directionSizes[2].height);
          }
          if (directionSizes[3].width) {
            includeRect(x - directionSizes[3].width, y, directionSizes[3].width, directionSizes[3].height);
          }
        });

        return hasBox
          ? { x: Math.round(minX), y: Math.round(minY), width: Math.round(maxX - minX), height: Math.round(maxY - minY) }
          : { x: 0, y: 0, width: 0, height: 0 };
      }

      function renderLevelDesigner(draft) {
        const level = getLevelForDraft(draft);
        const positions = draft && draft.aspectPositions && typeof draft.aspectPositions === "object" ? draft.aspectPositions : {};
        const aspectSizes = draft && draft.aspectSizes && typeof draft.aspectSizes === "object" ? draft.aspectSizes : {};
        const stageSizes = draft && draft.stageSizes && typeof draft.stageSizes === "object" ? draft.stageSizes : {};
        const aspectIds = Array.isArray(level && level.ebenenAspekte) ? level.ebenenAspekte : [];
        const boundingBox = calculateLevelDesignBoundingBox(level, positions);
        const levelLabel = String(draft && draft.levelType || "") === "folge" ? "FolgeEbene" : "Hauptebene";

        function renderDimensionStrip(aspect, directionIndex) {
          const ownerAspectId = String(aspect && aspect.id || "").trim();
          const ownerAspectSize = aspectSizes[ownerAspectId] || {};
          const defaultOwnerSize = getDefaultDesignerRectSize(aspect && aspect.titel || "Aspekt");
          const ownerWidth = Math.max(24, Number(ownerAspectSize.width) || defaultOwnerSize.width);
          const ownerHeight = Math.max(18, Number(ownerAspectSize.height) || defaultOwnerSize.height);
          const dimensions = Array.isArray(aspect && aspect.aspektDimensionen) ? aspect.aspektDimensionen : [];
          const strips = dimensions.map(function (dimension, dimensionIndex) {
            const stages = Array.isArray(dimension && dimension.stufen) ? dimension.stufen : [];
            const direction = dimensionIndex % 4;

            if (direction !== directionIndex || !stages.length) {
              return "";
            }

            return [
              '<div class="evidence-level-designer__dimension evidence-level-designer__dimension--', String(direction), '">',
              stages.map(function (stage) {
                const stageId = String(stage && stage.id || "").trim();
                const stageSize = stageSizes[stageId] || {};
                const stageWidth = Math.max(24, Number(stageSize.width) || ownerWidth);
                const stageHeight = Math.max(18, Number(stageSize.height) || ownerHeight);

                return [
                  '<div class="evidence-level-designer__stage" style="width: ', escapeValue(String(stageWidth)), 'px; height: ', escapeValue(String(stageHeight)), 'px;">',
                  escapeValue(itemTitle(stage, "Stufe")),
                  '<span class="evidence-level-designer__resize evidence-level-designer__resize--right" onpointerdown="return window.UnterrichtsassistentApp.startEvidenceLevelDesignerResize(event, \'stage\', \'', escapeValue(stageId), '\', \'right\')" onpointermove="return window.UnterrichtsassistentApp.moveEvidenceLevelDesignerResize(event)" onpointerup="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)" onpointercancel="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)"></span>',
                  '<span class="evidence-level-designer__resize evidence-level-designer__resize--bottom" onpointerdown="return window.UnterrichtsassistentApp.startEvidenceLevelDesignerResize(event, \'stage\', \'', escapeValue(stageId), '\', \'bottom\')" onpointermove="return window.UnterrichtsassistentApp.moveEvidenceLevelDesignerResize(event)" onpointerup="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)" onpointercancel="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)"></span>',
                  '<span class="evidence-level-designer__resize evidence-level-designer__resize--corner" onpointerdown="return window.UnterrichtsassistentApp.startEvidenceLevelDesignerResize(event, \'stage\', \'', escapeValue(stageId), '\', \'corner\')" onpointermove="return window.UnterrichtsassistentApp.moveEvidenceLevelDesignerResize(event)" onpointerup="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)" onpointercancel="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)"></span>',
                  '</div>'
                ].join("");
              }).join(""),
              '</div>'
            ].join("");
          }).join("");

          return strips;
        }

        const aspectHtml = aspectIds.map(function (aspectId, index) {
          const aspect = getAspectById(activeTool, aspectId);
          const position = positions[aspectId] || { x: Math.round((index - ((aspectIds.length - 1) / 2)) * 170), y: 0 };
          const aspectSize = aspectSizes[aspectId] || {};
          const defaultAspectSize = getDefaultDesignerRectSize(aspect && aspect.titel || "Aspekt");
          const aspectWidth = Math.max(24, Number(aspectSize.width) || defaultAspectSize.width);
          const aspectHeight = Math.max(18, Number(aspectSize.height) || defaultAspectSize.height);
          const isOpen = String(draft && draft.openAspectId || "").trim() === String(aspectId || "").trim();

          return [
            '<div class="evidence-level-designer__aspect-wrap', isOpen ? ' is-open' : '', '" style="left: calc(50% + ', escapeValue(String(Math.round(Number(position.x) || 0))), 'px); top: calc(50% + ', escapeValue(String(Math.round(Number(position.y) || 0))), 'px); width: ', escapeValue(String(aspectWidth)), 'px; height: ', escapeValue(String(aspectHeight)), 'px;" onpointerdown="return window.UnterrichtsassistentApp.startEvidenceLevelDesignerDrag(event, \'', escapeValue(aspectId), '\')" onpointermove="return window.UnterrichtsassistentApp.moveEvidenceLevelDesignerDrag(event)" onpointerup="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerDrag(event)" onpointercancel="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerDrag(event)">',
            isOpen ? '<div class="evidence-level-designer__dimension-zone evidence-level-designer__dimension-zone--top">' + renderDimensionStrip(aspect, 0) + '</div>' : '',
            isOpen ? '<div class="evidence-level-designer__dimension-zone evidence-level-designer__dimension-zone--right">' + renderDimensionStrip(aspect, 1) + '</div>' : '',
            isOpen ? '<div class="evidence-level-designer__dimension-zone evidence-level-designer__dimension-zone--bottom">' + renderDimensionStrip(aspect, 2) + '</div>' : '',
            isOpen ? '<div class="evidence-level-designer__dimension-zone evidence-level-designer__dimension-zone--left">' + renderDimensionStrip(aspect, 3) + '</div>' : '',
            '<button class="evidence-level-designer__aspect" type="button" style="width: ', escapeValue(String(aspectWidth)), 'px; height: ', escapeValue(String(aspectHeight)), 'px;" onclick="return window.UnterrichtsassistentApp.toggleEvidenceLevelDesignerAspect(\'', escapeValue(aspectId), '\')">',
            escapeValue(itemTitle(aspect, "Aspekt")),
            '</button>',
            '<span class="evidence-level-designer__resize evidence-level-designer__resize--right" onpointerdown="return window.UnterrichtsassistentApp.startEvidenceLevelDesignerResize(event, \'aspect\', \'', escapeValue(aspectId), '\', \'right\')" onpointermove="return window.UnterrichtsassistentApp.moveEvidenceLevelDesignerResize(event)" onpointerup="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)" onpointercancel="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)"></span>',
            '<span class="evidence-level-designer__resize evidence-level-designer__resize--bottom" onpointerdown="return window.UnterrichtsassistentApp.startEvidenceLevelDesignerResize(event, \'aspect\', \'', escapeValue(aspectId), '\', \'bottom\')" onpointermove="return window.UnterrichtsassistentApp.moveEvidenceLevelDesignerResize(event)" onpointerup="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)" onpointercancel="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)"></span>',
            '<span class="evidence-level-designer__resize evidence-level-designer__resize--corner" onpointerdown="return window.UnterrichtsassistentApp.startEvidenceLevelDesignerResize(event, \'aspect\', \'', escapeValue(aspectId), '\', \'corner\')" onpointermove="return window.UnterrichtsassistentApp.moveEvidenceLevelDesignerResize(event)" onpointerup="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)" onpointercancel="return window.UnterrichtsassistentApp.endEvidenceLevelDesignerResize(event)"></span>',
            '</div>'
          ].join("");
        }).join("");

        return [
          '<div class="evidence-level-designer">',
          '<div class="evidence-level-designer__topbar">',
          '<div><h3 class="bewertung-editor__title">Ebenengestaltung</h3><p class="bewertung-editor__meta">', escapeValue(levelLabel), '</p></div>',
          '<div class="evidence-level-designer__actions">',
          '<button class="evidence-level-designer__icon-button evidence-level-designer__icon-button--danger" type="button" aria-label="Abbrechen" title="Abbrechen" onclick="return window.UnterrichtsassistentApp.cancelEvidenceLevelDesigner()">x</button>',
          '<button class="evidence-level-designer__icon-button" type="button" aria-label="Bestaetigen" title="Bestaetigen" onclick="return window.UnterrichtsassistentApp.confirmEvidenceLevelDesigner()">&#10003;</button>',
          '</div>',
          '</div>',
          '<div class="evidence-level-designer__canvas">',
          '<div class="evidence-level-designer__center" aria-hidden="true"></div>',
          '<div class="evidence-level-designer__bounds" style="left: calc(50% + ', escapeValue(String(boundingBox.x)), 'px); top: calc(50% + ', escapeValue(String(boundingBox.y)), 'px); width: ', escapeValue(String(boundingBox.width)), 'px; height: ', escapeValue(String(boundingBox.height)), 'px;"></div>',
          aspectHtml || '<div class="evidence-level-designer__empty">Diese Ebene enthaelt noch keine Aspekte.</div>',
          '</div>',
          '</div>'
        ].join("");
      }

      function renderEditValue(label, value, scope, primaryId, secondaryId, fieldName) {
        const textValue = String(value || "").trim();

        return [
          '<div class="evidence-tool-tree__field">',
          '<span class="evidence-tool-tree__label">', escapeValue(label), '</span>',
          '<button class="evidence-tool-tree__value" type="button" onclick="return window.UnterrichtsassistentApp.promptEvidenceToolTextEdit(\'', escapeValue(scope), '\', \'', escapeValue(primaryId || ""), '\', \'', escapeValue(secondaryId || ""), '\', \'', escapeValue(fieldName), '\', \'', escapeValue(textValue), '\')">',
          escapeValue(textValue || "Leer"),
          '</button>',
          '</div>'
        ].join("");
      }

      function renderStageEditValue(label, value, aspectId, dimensionId, stageId, fieldName) {
        const textValue = String(value || "").trim();

        return [
          '<div class="evidence-tool-tree__field evidence-tool-tree__field--subtle">',
          '<span class="evidence-tool-tree__label">', escapeValue(label), '</span>',
          '<button class="evidence-tool-tree__value" type="button" onclick="return window.UnterrichtsassistentApp.promptEvidenceToolStageTextEdit(\'', escapeValue(aspectId || ""), '\', \'', escapeValue(dimensionId || ""), '\', \'', escapeValue(stageId || ""), '\', \'', escapeValue(fieldName), '\', \'', escapeValue(textValue), '\')">',
          escapeValue(textValue || "Leer"),
          '</button>',
          '</div>'
        ].join("");
      }

      function renderListShell(nodeId, label, contentHtml, addAction) {
        const expanded = isExpanded(nodeId);

        return [
          '<section class="evidence-tool-tree__node', expanded ? ' is-expanded' : '', '">',
          '<div class="evidence-tool-tree__node-header">',
          '<button class="evidence-tool-tree__toggle" type="button" aria-label="', expanded ? 'Einklappen' : 'Aufklappen', '" onclick="return window.UnterrichtsassistentApp.toggleEvidenceToolNode(\'', escapeValue(nodeId), '\')">', expanded ? '-' : '+', '</button>',
          '<span class="evidence-tool-tree__node-title">', escapeValue(label), '</span>',
          '</div>',
          expanded ? '<div class="evidence-tool-tree__children">' + contentHtml + (addAction ? '<button class="evidence-tool-tree__add" type="button" onclick="return ' + addAction + '">+</button>' : '') + '</div>' : '',
          '</section>'
        ].join("");
      }

      function renderSimpleList(type, items) {
        const listItems = (Array.isArray(items) ? items : []).map(function (item, index) {
          const value = String(item || "").trim();
          const scope = type === "faecher" ? "fach" : "jahrgang";

          return [
            '<div class="evidence-tool-tree__item" draggable="true" ondragstart="return window.UnterrichtsassistentApp.startEvidenceToolListDrag(event, \'', escapeValue(type), '\', \'', escapeValue(String(index)), '\')" ondragover="return window.UnterrichtsassistentApp.allowEvidenceToolDrop(event)" ondrop="return window.UnterrichtsassistentApp.dropEvidenceToolListItem(event, \'', escapeValue(type), '\', \'', escapeValue(String(index)), '\')">',
            '<span class="evidence-tool-tree__drag" aria-hidden="true">::</span>',
            '<button class="evidence-tool-tree__value evidence-tool-tree__value--inline" type="button" onclick="return window.UnterrichtsassistentApp.promptEvidenceToolTextEdit(\'', escapeValue(scope), '\', \'', escapeValue(String(index)), '\', \'\', \'value\', \'', escapeValue(value), '\')">', escapeValue(value || "Leer"), '</button>',
            '<button class="evidence-tool-tree__remove" type="button" aria-label="Eintrag loeschen" onclick="return window.UnterrichtsassistentApp.deleteEvidenceToolListItem(\'', escapeValue(type), '\', \'', escapeValue(String(index)), '\')">-</button>',
            '</div>'
          ].join("");
        }).join("");

        return listItems || '<div class="evidence-tool-tree__empty">Keine Eintraege</div>';
      }

      function renderLevel(level, levelType, ownerAspectId, title) {
        const sourceLevel = level && typeof level === "object" ? level : { ebenenAspekte: [] };
        const usedAspectIds = Array.isArray(sourceLevel.ebenenAspekte) ? sourceLevel.ebenenAspekte : [];
        const availableAspects = (Array.isArray(activeTool && activeTool.aspekte) ? activeTool.aspekte : []).filter(function (aspect) {
          const aspectId = String(aspect && aspect.id || "").trim();

          return aspectId && usedAspectIds.indexOf(aspectId) === -1;
        });
        const itemsHtml = usedAspectIds.map(function (aspectId) {
          const aspect = getAspectById(activeTool, aspectId);

          if (!aspect) {
            return "";
          }

          return [
            '<div class="evidence-tool-tree__item" draggable="true" ondragstart="return window.UnterrichtsassistentApp.startEvidenceToolListDrag(event, \'ebene\', \'', escapeValue(aspectId), '\', \'', escapeValue(ownerAspectId || ""), '\', \'\', \'', escapeValue(levelType), '\')" ondragover="return window.UnterrichtsassistentApp.allowEvidenceToolDrop(event)" ondrop="return window.UnterrichtsassistentApp.dropEvidenceToolListItem(event, \'ebene\', \'', escapeValue(aspectId), '\', \'', escapeValue(ownerAspectId || ""), '\', \'\', \'', escapeValue(levelType), '\')">',
            '<span class="evidence-tool-tree__drag" aria-hidden="true">::</span>',
            '<span class="evidence-tool-tree__value evidence-tool-tree__value--inline">', escapeValue(itemTitle(aspect, "Aspekt")), '</span>',
            '<button class="evidence-tool-tree__remove" type="button" aria-label="Aspekt entfernen" onclick="return window.UnterrichtsassistentApp.deleteEvidenceToolLevelAspect(\'', escapeValue(levelType), '\', \'', escapeValue(ownerAspectId || ""), '\', \'', escapeValue(aspectId), '\')">-</button>',
            '</div>'
          ].join("");
        }).join("") || '<div class="evidence-tool-tree__empty">Keine Aspekte zugeordnet</div>';
        const selectHtml = availableAspects.length
          ? [
              '<select class="evidence-tool-tree__select" aria-label="Aspekt hinzufuegen" onchange="if (this.value) { window.UnterrichtsassistentApp.addEvidenceToolLevelAspect(\'', escapeValue(levelType), '\', \'', escapeValue(ownerAspectId || ""), '\', this.value); this.value = \'\'; } return false;">',
              '<option value="">+ Aspekt waehlen</option>',
              availableAspects.map(function (aspect) {
                return '<option value="' + escapeValue(String(aspect && aspect.id || "").trim()) + '">' + escapeValue(itemTitle(aspect, "Aspekt")) + '</option>';
              }).join(""),
              '</select>'
            ].join("")
          : '<div class="evidence-tool-tree__empty">Alle Aspekte sind bereits enthalten.</div>';

        const nodeId = levelType + "-" + (ownerAspectId || "main");
        const expanded = isExpanded(nodeId);

        return [
          '<section class="evidence-tool-tree__node', expanded ? ' is-expanded' : '', '">',
          '<div class="evidence-tool-tree__node-header">',
          '<button class="evidence-tool-tree__toggle" type="button" aria-label="', expanded ? 'Einklappen' : 'Aufklappen', '" onclick="return window.UnterrichtsassistentApp.toggleEvidenceToolNode(\'', escapeValue(nodeId), '\')">', expanded ? '-' : '+', '</button>',
          '<span class="evidence-tool-tree__node-title">', escapeValue(title), '</span>',
          '<button class="evidence-tool-tree__edit" type="button" aria-label="Ebene gestalten" title="Ebene gestalten" onclick="return window.UnterrichtsassistentApp.openEvidenceLevelDesigner(\'', escapeValue(levelType), '\', \'', escapeValue(ownerAspectId || ""), '\')">&#9998;</button>',
          '</div>',
          expanded ? '<div class="evidence-tool-tree__children">' + itemsHtml + selectHtml + '</div>' : '',
          '</section>'
        ].join("");
      }

      function renderStages(aspectId, dimension) {
        const dimensionId = String(dimension && dimension.id || "").trim();
        const stages = Array.isArray(dimension && dimension.stufen) ? dimension.stufen : [];
        const itemsHtml = stages.map(function (stage) {
          const stageId = String(stage && stage.id || "").trim();

          return [
            '<article class="evidence-tool-tree__item evidence-tool-tree__item--object" draggable="true" ondragstart="return window.UnterrichtsassistentApp.startEvidenceToolListDrag(event, \'stufen\', \'', escapeValue(stageId), '\', \'', escapeValue(aspectId), '\', \'', escapeValue(dimensionId), '\')" ondragover="return window.UnterrichtsassistentApp.allowEvidenceToolDrop(event)" ondrop="return window.UnterrichtsassistentApp.dropEvidenceToolListItem(event, \'stufen\', \'', escapeValue(stageId), '\', \'', escapeValue(aspectId), '\', \'', escapeValue(dimensionId), '\')">',
            '<div class="evidence-tool-tree__object-line"><span class="evidence-tool-tree__drag" aria-hidden="true">::</span><strong>', escapeValue(itemTitle(stage, "Stufe")), '</strong><button class="evidence-tool-tree__remove" type="button" aria-label="Stufe loeschen" onclick="return window.UnterrichtsassistentApp.deleteEvidenceToolListItem(\'stufen\', \'', escapeValue(aspectId), '\', \'', escapeValue(dimensionId), '\', \'', escapeValue(stageId), '\')">-</button></div>',
            renderStageEditValue("Bezeichnung", stage && stage.bezeichnung, aspectId, dimensionId, stageId, "bezeichnung"),
            renderStageEditValue("Information", stage && stage.information, aspectId, dimensionId, stageId, "information"),
            renderStageEditValue("Beispiel", stage && stage.beispiel, aspectId, dimensionId, stageId, "beispiel"),
            '</article>'
          ].join("");
        }).join("") || '<div class="evidence-tool-tree__empty">Keine Stufen</div>';

        return renderListShell("stufen-" + dimensionId, "Stufen", itemsHtml, "window.UnterrichtsassistentApp.addEvidenceToolListItem('stufen', '" + escapeValue(aspectId) + "', '" + escapeValue(dimensionId) + "')");
      }

      function renderDimensions(aspect) {
        const aspectId = String(aspect && aspect.id || "").trim();
        const dimensions = Array.isArray(aspect && aspect.aspektDimensionen) ? aspect.aspektDimensionen : [];
        const itemsHtml = dimensions.map(function (dimension) {
          const dimensionId = String(dimension && dimension.id || "").trim();
          const nodeId = "dimension-" + dimensionId;
          const expanded = isExpanded(nodeId);

          return [
            '<section class="evidence-tool-tree__node evidence-tool-tree__node--object', expanded ? ' is-expanded' : '', '" draggable="true" ondragstart="return window.UnterrichtsassistentApp.startEvidenceToolListDrag(event, \'dimensionen\', \'', escapeValue(dimensionId), '\', \'', escapeValue(aspectId), '\')" ondragover="return window.UnterrichtsassistentApp.allowEvidenceToolDrop(event)" ondrop="return window.UnterrichtsassistentApp.dropEvidenceToolListItem(event, \'dimensionen\', \'', escapeValue(dimensionId), '\', \'', escapeValue(aspectId), '\')">',
            '<div class="evidence-tool-tree__node-header"><span class="evidence-tool-tree__drag" aria-hidden="true">::</span><button class="evidence-tool-tree__toggle" type="button" onclick="return window.UnterrichtsassistentApp.toggleEvidenceToolNode(\'', escapeValue(nodeId), '\')">', expanded ? '-' : '+', '</button><span class="evidence-tool-tree__node-title">', escapeValue(itemTitle(dimension, "Dimension")), '</span><button class="evidence-tool-tree__remove" type="button" aria-label="Dimension loeschen" onclick="return window.UnterrichtsassistentApp.deleteEvidenceToolListItem(\'dimensionen\', \'', escapeValue(aspectId), '\', \'', escapeValue(dimensionId), '\')">-</button></div>',
            expanded ? '<div class="evidence-tool-tree__children">' + renderEditValue("Bezeichnung", dimension && dimension.bezeichnung, "dimension", aspectId, dimensionId, "bezeichnung") + renderEditValue("Information", dimension && dimension.information, "dimension", aspectId, dimensionId, "information") + renderEditValue("Beispiel", dimension && dimension.beispiel, "dimension", aspectId, dimensionId, "beispiel") + renderStages(aspectId, dimension) + '</div>' : '',
            '</section>'
          ].join("");
        }).join("") || '<div class="evidence-tool-tree__empty">Keine Dimensionen</div>';

        return renderListShell("dimensionen-" + aspectId, "AspektDimensionen", itemsHtml, "window.UnterrichtsassistentApp.addEvidenceToolListItem('dimensionen', '" + escapeValue(aspectId) + "')");
      }

      function renderAspects() {
        const aspects = Array.isArray(activeTool && activeTool.aspekte) ? activeTool.aspekte : [];
        const itemsHtml = aspects.map(function (aspect) {
          const aspectId = String(aspect && aspect.id || "").trim();
          const nodeId = "aspect-" + aspectId;
          const expanded = isExpanded(nodeId);

          return [
            '<section class="evidence-tool-tree__node evidence-tool-tree__node--object', expanded ? ' is-expanded' : '', '" draggable="true" ondragstart="return window.UnterrichtsassistentApp.startEvidenceToolListDrag(event, \'aspekte\', \'', escapeValue(aspectId), '\')" ondragover="return window.UnterrichtsassistentApp.allowEvidenceToolDrop(event)" ondrop="return window.UnterrichtsassistentApp.dropEvidenceToolListItem(event, \'aspekte\', \'', escapeValue(aspectId), '\')">',
            '<div class="evidence-tool-tree__node-header"><span class="evidence-tool-tree__drag" aria-hidden="true">::</span><button class="evidence-tool-tree__toggle" type="button" onclick="return window.UnterrichtsassistentApp.toggleEvidenceToolNode(\'', escapeValue(nodeId), '\')">', expanded ? '-' : '+', '</button><span class="evidence-tool-tree__node-title">', escapeValue(itemTitle(aspect, "Aspekt")), '</span><button class="evidence-tool-tree__remove" type="button" aria-label="Aspekt loeschen" onclick="return window.UnterrichtsassistentApp.deleteEvidenceToolListItem(\'aspekte\', \'', escapeValue(aspectId), '\')">-</button></div>',
            expanded ? '<div class="evidence-tool-tree__children">' + renderEditValue("Titel", aspect && aspect.titel, "aspect", aspectId, "", "titel") + renderEditValue("Information", aspect && aspect.information, "aspect", aspectId, "", "information") + renderEditValue("Beispiel", aspect && aspect.beispiel, "aspect", aspectId, "", "beispiel") + renderDimensions(aspect) + renderLevel(aspect && aspect.folgeEbene, "folge", aspectId, "FolgeEbene") + '</div>' : '',
            '</section>'
          ].join("");
        }).join("") || '<div class="evidence-tool-tree__empty">Keine Aspekte</div>';

        return renderListShell("aspekte", "Aspekte", itemsHtml, "window.UnterrichtsassistentApp.addEvidenceToolListItem('aspekte')");
      }

      if (!activeTool) {
        return [
          '<div class="unterricht-layout">',
          '<article class="panel unterricht-layout__content">',
          '<p class="empty-message">Lege ueber den Plus-Button das erste Bewertungswerkzeug an.</p>',
          '</article>',
          '</div>'
        ].join("");
      }

      if (levelDesignDraft) {
        return renderLevelDesigner(levelDesignDraft);
      }

      return [
        '<div class="unterricht-layout">',
        '<article class="panel unterricht-layout__content evidence-tool-editor">',
        '<div class="evidence-tool-editor__header">',
        '<div class="evidence-tool-editor__symbol">', escapeValue(String(activeTool.symbol || "").trim() || "+"), '</div>',
        '<div><h3 class="bewertung-editor__title">', escapeValue(String(activeTool.titel || "").trim() || "Ohne Titel"), '</h3><p class="bewertung-editor__meta">Bewertungswerkzeug</p></div>',
        '</div>',
        '<div class="evidence-tool-tree">',
        renderEditValue("Titel", activeTool.titel, "tool", "", "", "titel"),
        renderEditValue("Symbol", activeTool.symbol, "tool", "", "", "symbol"),
        renderListShell("faecher", "Faecher", renderSimpleList("faecher", activeTool.faecher), "window.UnterrichtsassistentApp.addEvidenceToolListItem('faecher')"),
        renderListShell("jahrgaenge", "Jahrgaenge", renderSimpleList("jahrgaenge", activeTool.jahrgaenge), "window.UnterrichtsassistentApp.addEvidenceToolListItem('jahrgaenge')"),
        renderAspects(),
        renderLevel(activeTool.hauptebene, "haupt", "", "Hauptebene"),
        '</div>',
        '</article>',
        '</div>'
      ].join("");
    }

    const modeLabels = {
      bewerten: "Bewerten",
      analysieren: "Analysieren",
      evidenz: "Evidenz",
      erstellen: "Erstellen",
      entwerfen: "Erstellen"
    };
    const activeModeLabel = modeLabels[mode] || modeLabels.bewerten;

    if (mode === "erstellen" || mode === "entwerfen") {
      return renderCreateMode();
    }

    if (mode === "bewerten") {
      return renderBewertenMode();
    }

    if (mode === "analysieren") {
      return renderAnalysisMode();
    }

    if (mode === "evidenz") {
      return renderEvidenceMode();
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

window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.unterricht = {
  id: "unterricht",
  title: "Unterricht",
  render: function (service) {
    const activeClass = service.getActiveClass();
    const viewMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getUnterrichtViewMode === "function"
      ? window.UnterrichtsassistentApp.getUnterrichtViewMode()
      : "live";
    const toolMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getUnterrichtToolMode === "function"
      ? window.UnterrichtsassistentApp.getUnterrichtToolMode()
      : "attendance";
    const referenceDate = service && typeof service.getReferenceDate === "function"
      ? service.getReferenceDate()
      : new Date();
    const currentClassLesson = activeClass && typeof service.getCurrentLessonForClass === "function"
      ? service.getCurrentLessonForClass(activeClass.id, referenceDate)
      : null;
    const activeDateTimeMode = service && service.snapshot
      ? String(service.snapshot.activeDateTimeMode || "live")
      : "live";
    const snapshot = service && service.snapshot ? service.snapshot : {};
    const expandedTodoIds = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getExpandedTodoIds === "function"
      ? window.UnterrichtsassistentApp.getExpandedTodoIds().map(function (entry) {
          return String(entry || "").trim();
        }).filter(Boolean)
      : [];
    const activeRoom = activeClass ? service.getRelevantRoomForClass(activeClass.id, referenceDate) : "";
    const currentSeatOrder = activeClass && typeof service.getCurrentSeatOrder === "function"
      ? service.getCurrentSeatOrder(activeClass.id, activeRoom, referenceDate)
      : null;
    const currentSeatPlan = activeClass
      ? service.getCurrentSeatPlan(activeClass.id, activeRoom, referenceDate)
      : null;
    const students = activeClass ? service.getStudentsForClass(activeClass.id) : [];
    const schoolYearStart = String(snapshot.schoolYearStart || "").slice(0, 10);
    const schoolYearEnd = String(snapshot.schoolYearEnd || "").slice(0, 10);
    const planningEvents = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningEventsForDisplay === "function"
      ? window.UnterrichtsassistentApp.getPlanningEventsForDisplay(snapshot, {
          rangeStart: schoolYearStart,
          rangeEnd: schoolYearEnd
        })
      : (Array.isArray(snapshot.planningEvents) ? snapshot.planningEvents : []);
    const lessonStatusLookup = (Array.isArray(snapshot.planningInstructionLessonStatuses) ? snapshot.planningInstructionLessonStatuses : []).reduce(function (lookup, statusItem) {
      const classId = String(statusItem && statusItem.classId || "").trim();
      const lessonDate = String(statusItem && statusItem.lessonDate || "").slice(0, 10);

      if (classId && lessonDate) {
        lookup[[classId, lessonDate].join("::")] = statusItem;
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
    const sequenceLookup = (Array.isArray(snapshot.curriculumSequences) ? snapshot.curriculumSequences : []).reduce(function (lookup, entry) {
      const entryId = String(entry && entry.id || "").trim();

      if (entryId) {
        lookup[entryId] = entry;
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
    const lessonPhaseStatusLookup = (Array.isArray(snapshot.curriculumLessonPhaseStatuses) ? snapshot.curriculumLessonPhaseStatuses : []).reduce(function (lookup, statusItem) {
      const classId = String(statusItem && statusItem.classId || "").trim();
      const lessonDate = String(statusItem && statusItem.lessonDate || "").slice(0, 10);
      const lessonPlanId = String(statusItem && statusItem.lessonPlanId || "").trim();
      const phaseId = String(statusItem && statusItem.phaseId || "").trim();

      if (classId && lessonDate && lessonPlanId && phaseId && statusItem) {
        lookup[[classId, lessonDate, lessonPlanId, phaseId].join("::")] = statusItem;
        lookup[[classId, lessonPlanId, phaseId].join("::")] = statusItem;
      }

      return lookup;
    }, {});
    const deskLayoutItemsSource = currentSeatPlan && Array.isArray(currentSeatPlan.deskLayoutItems)
      ? currentSeatPlan.deskLayoutItems
      : [];
    const deskLayoutItems = deskLayoutItemsSource.filter(function (item) {
      return item && ["single", "double"].indexOf(String(item.type || "")) >= 0;
    });
    const seatAssignments = currentSeatOrder && Array.isArray(currentSeatOrder.seats)
      ? currentSeatOrder.seats
      : [];

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

    function formatShortDateLabel(dateValue) {
      const normalizedDate = String(dateValue || "").slice(0, 10);

      if (!normalizedDate) {
        return "";
      }

      return normalizedDate.slice(8, 10) + "." + normalizedDate.slice(5, 7) + ".";
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

    function getOrderedCurriculumLessonPhasesForLesson(lessonPlanId) {
      const items = (Array.isArray(snapshot.curriculumLessonPhases) ? snapshot.curriculumLessonPhases : []).filter(function (entry) {
        return String(entry && entry.lessonPlanId || "").trim() === String(lessonPlanId || "").trim();
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
        const nextId = String(entry && entry.nextPhaseId || "").trim();

        if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
          incomingCounts[nextId] += 1;
        }
      });

      current = items.find(function (entry) {
        return !incomingCounts[String(entry && entry.id || "").trim()];
      }) || items[0] || null;

      while (current) {
        const currentId = String(current && current.id || "").trim();
        const nextId = String(current && current.nextPhaseId || "").trim();

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

    function getOrderedCurriculumLessonStepsForPhase(phaseId) {
      const items = (Array.isArray(snapshot.curriculumLessonSteps) ? snapshot.curriculumLessonSteps : []).filter(function (entry) {
        return String(entry && entry.phaseId || "").trim() === String(phaseId || "").trim();
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
        const nextId = String(entry && entry.nextStepId || "").trim();

        if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
          incomingCounts[nextId] += 1;
        }
      });

      current = items.find(function (entry) {
        return !incomingCounts[String(entry && entry.id || "").trim()];
      }) || items[0] || null;

      while (current) {
        const currentId = String(current && current.id || "").trim();
        const nextId = String(current && current.nextStepId || "").trim();

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

    function getCurriculumLessonStepSocialFormLabel(socialFormValue) {
      const normalizedValue = String(socialFormValue || "").trim().toLowerCase();

      if (normalizedValue === "einzel") {
        return "Einzel";
      }

      if (normalizedValue === "partner") {
        return "Partner";
      }

      if (normalizedValue === "gruppe") {
        return "Gruppe";
      }

      return "Plenum";
    }

    function getCurriculumLessonStepSocialFormShortLabel(socialFormValue) {
      const fullLabel = getCurriculumLessonStepSocialFormLabel(socialFormValue);
      return fullLabel ? fullLabel.charAt(0) : "";
    }

    function getCurriculumSituationTypeLabel(situationTypeValue) {
      const normalizedValue = String(situationTypeValue || "").trim().toLowerCase();

      if (normalizedValue === "lernsituation" || normalizedValue === "lernen") {
        return "Lernen";
      }

      if (normalizedValue === "leistungssituation" || normalizedValue === "leisten") {
        return "Leisten";
      }

      return "";
    }

    function getCurriculumDemandLevelLabel(demandLevelValue) {
      const normalizedValue = String(demandLevelValue || "").trim().toLowerCase();

      if (normalizedValue === "afb1") {
        return "AFB1";
      }

      if (normalizedValue === "afb1/2") {
        return "AFB1/2";
      }

      if (normalizedValue === "afb2") {
        return "AFB2";
      }

      if (normalizedValue === "afb2/3") {
        return "AFB2/3";
      }

      if (normalizedValue === "afb3") {
        return "AFB3";
      }

      return "";
    }

    function getCurrentLivePhaseControlState(lessonFlowData) {
      const activeSegment = lessonFlowData && Array.isArray(lessonFlowData.segments)
        ? lessonFlowData.segments[Math.max(0, Number(lessonFlowData.activeSegmentIndex) || 0)] || lessonFlowData.segments[0] || null
        : null;
      const orderedPhases = activeSegment && Array.isArray(activeSegment.phases)
        ? activeSegment.phases
        : [];
      const activePhase = orderedPhases.find(function (phaseItem) {
        const phaseItemId = String(phaseItem && phaseItem.id || "").trim();
        const phaseStatus = lessonPhaseStatusLookup[[String(activeClass && activeClass.id || "").trim(), String(activeSegment && activeSegment.lessonPlan && activeSegment.lessonPlan.id || "").trim(), phaseItemId].join("::")] || lessonPhaseStatusLookup[[String(activeClass && activeClass.id || "").trim(), String(lessonFlowData && lessonFlowData.lessonDate || "").trim(), String(activeSegment && activeSegment.lessonPlan && activeSegment.lessonPlan.id || "").trim(), phaseItemId].join("::")] || null;

        return !(phaseStatus && phaseStatus.isCompleted);
      }) || orderedPhases[orderedPhases.length - 1] || null;
      const activePhaseId = String(activePhase && activePhase.id || "").trim();
      const fallbackLessonPlanId = activeSegment && activeSegment.lessonPlan
        ? String(activeSegment.lessonPlan.id || "").trim()
        : [
            "__live__",
            String(activeClass && activeClass.id || "").trim(),
            toIsoDate(referenceDate),
            String(currentClassLesson && currentClassLesson.sourceRowId || "").trim() || "nosourcerow",
            String(currentClassLesson && currentClassLesson.startTime || "").trim() || "nostart",
            String(currentClassLesson && currentClassLesson.endTime || "").trim() || "noend"
          ].join("::");
      const fallbackPhaseId = activePhaseId || "__fallback__";
      const liveOverride = activePhaseId && activeSegment && window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getCurriculumLessonPhaseLiveOverride === "function"
        ? window.UnterrichtsassistentApp.getCurriculumLessonPhaseLiveOverride(
            String(activeClass && activeClass.id || "").trim(),
            String(lessonFlowData && lessonFlowData.lessonDate || "").trim(),
            String(activeSegment && activeSegment.lessonPlan && activeSegment.lessonPlan.id || "").trim(),
            activePhaseId
          )
        : (window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getCurriculumLessonPhaseLiveOverride === "function"
          ? window.UnterrichtsassistentApp.getCurriculumLessonPhaseLiveOverride(
              String(activeClass && activeClass.id || "").trim(),
              String(lessonFlowData && lessonFlowData.lessonDate || toIsoDate(referenceDate) || "").trim(),
              fallbackLessonPlanId,
              fallbackPhaseId
            )
          : null);
      const normalizedSituation = String(liveOverride && liveOverride.situationType || activePhase && activePhase.situationType || "").trim().toLowerCase();
      const normalizedDemandLevel = String(liveOverride && liveOverride.demandLevel || activePhase && activePhase.demandLevel || "").trim().toLowerCase();

      return {
        classId: String(activeClass && activeClass.id || "").trim(),
        lessonDate: String(lessonFlowData && lessonFlowData.lessonDate || toIsoDate(referenceDate) || "").trim(),
        lessonPlanId: fallbackLessonPlanId,
        phaseId: fallbackPhaseId,
        situationType: normalizedSituation === "leisten" ? "leisten" : "lernen",
        demandLevel: ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(normalizedDemandLevel) >= 0
          ? normalizedDemandLevel
          : "afb2"
      };
    }

    function getDemandLevelSliderValue(demandLevelValue) {
      switch (String(demandLevelValue || "").trim().toLowerCase()) {
        case "afb1":
          return 0;
        case "afb1/2":
          return 1;
        case "afb2":
          return 2;
        case "afb2/3":
          return 3;
        case "afb3":
          return 4;
        default:
          return null;
      }
    }

    function getDemandLevelSliderDisplayLabel(sliderValue) {
      switch (Math.max(0, Math.min(4, Number(sliderValue) || 0))) {
        case 0:
          return "1";
        case 1:
          return "1/2";
        case 2:
          return "2";
        case 3:
          return "2/3";
        case 4:
          return "3";
        default:
          return "2";
      }
    }

    function renderLivePhaseControls(lessonFlowData) {
      const controlState = getCurrentLivePhaseControlState(lessonFlowData);
      const sliderValue = getDemandLevelSliderValue(controlState.demandLevel);
      const normalizedClassId = String(controlState.classId || "").trim();
      const normalizedLessonDate = String(controlState.lessonDate || "").trim();
      const normalizedLessonPlanId = String(controlState.lessonPlanId || "").trim();
      const normalizedPhaseId = String(controlState.phaseId || "").trim();
      const isDisabled = !normalizedClassId || !normalizedLessonDate || !normalizedLessonPlanId || !normalizedPhaseId;
      const demandLevelOptions = [
        { value: "afb1", sliderValue: 0, label: "1" },
        { value: "afb1/2", sliderValue: 1, label: "" },
        { value: "afb2", sliderValue: 2, label: "2" },
        { value: "afb2/3", sliderValue: 3, label: "" },
        { value: "afb3", sliderValue: 4, label: "3" }
      ];

      return [
        '<div class="unterricht-live-controls" aria-label="Aktuelle Phasenattribute">',
        '<div class="unterricht-live-controls__switch" role="group" aria-label="Situation">',
        '<button class="unterricht-live-controls__switch-option' + (controlState.situationType === "lernen" ? ' is-active' : '') + '" type="button"' + (isDisabled ? ' disabled' : '') + ' onclick="return window.UnterrichtsassistentApp.updateCurriculumLessonPhaseLiveField(\'' + escapeValue(normalizedClassId) + '\', \'' + escapeValue(normalizedLessonDate) + '\', \'' + escapeValue(normalizedLessonPlanId) + '\', \'' + escapeValue(normalizedPhaseId) + '\', \'liveSituationType\', \'lernen\')">Lernen</button>',
        '<button class="unterricht-live-controls__switch-option' + (controlState.situationType === "leisten" ? ' is-active' : '') + '" type="button"' + (isDisabled ? ' disabled' : '') + ' onclick="return window.UnterrichtsassistentApp.updateCurriculumLessonPhaseLiveField(\'' + escapeValue(normalizedClassId) + '\', \'' + escapeValue(normalizedLessonDate) + '\', \'' + escapeValue(normalizedLessonPlanId) + '\', \'' + escapeValue(normalizedPhaseId) + '\', \'liveSituationType\', \'leisten\')">Leisten</button>',
        '</div>',
        '<div class="unterricht-live-controls__afb">',
        '<span class="unterricht-live-controls__afb-label">AFB</span>',
        '<div class="unterricht-live-controls__slider" role="group" aria-label="' + escapeValue(controlState.demandLevel ? ('Anforderungsbereich ' + getCurriculumDemandLevelLabel(controlState.demandLevel)) : 'Anforderungsbereich nicht gesetzt') + '">',
        '<input class="unterricht-live-controls__slider-input" type="range" min="0" max="4" step="1" value="' + escapeValue(String(sliderValue !== null ? sliderValue : 2)) + '"' + (isDisabled ? ' disabled' : '') + ' oninput="return window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderInput(event, \'' + escapeValue(normalizedClassId) + '\', \'' + escapeValue(normalizedLessonDate) + '\', \'' + escapeValue(normalizedLessonPlanId) + '\', \'' + escapeValue(normalizedPhaseId) + '\')" onchange="return window.UnterrichtsassistentApp.handleUnterrichtLiveAfbSliderInput(event, \'' + escapeValue(normalizedClassId) + '\', \'' + escapeValue(normalizedLessonDate) + '\', \'' + escapeValue(normalizedLessonPlanId) + '\', \'' + escapeValue(normalizedPhaseId) + '\')">',
        '<div class="unterricht-live-controls__slider-value unterricht-live-controls__slider-value--' + escapeValue(String(sliderValue !== null ? sliderValue : 2)) + '">' + escapeValue(getDemandLevelSliderDisplayLabel(sliderValue !== null ? sliderValue : 2)) + '</div>',
        '<div class="unterricht-live-controls__slider-labels"><span>1</span><span>2</span><span>3</span></div>',
        '</div>',
        '</div>',
        '</div>'
      ].join("");
    }

    function getTimeValueInMinutes(timeValue) {
      const parts = String(timeValue || "").split(":");
      return ((Number(parts[0]) || 0) * 60) + (Number(parts[1]) || 0);
    }

    function getLiveSeatPlanScale(canvasWidth) {
      const hasLiveFlow = viewMode === "live" && Boolean(getCurrentAssignedCurriculumLessonFlow());
      const viewportWidth = typeof window !== "undefined" && window && window.innerWidth
        ? Number(window.innerWidth) || 0
        : 0;
      const estimatedSidebarWidth = 224;
      const estimatedContentPadding = 28;
      const estimatedColumnGap = 0;
      let targetWidth = 0;

      if (!hasLiveFlow) {
        return 1;
      }

      targetWidth = Math.max(388, ((viewportWidth - estimatedSidebarWidth - estimatedContentPadding - estimatedColumnGap) * 0.62) - 2);

      if (!targetWidth || !canvasWidth) {
        return 0.7;
      }

      return Math.max(0.7, Math.min(1, (targetWidth / canvasWidth) * 1.025));
    }

    function getLiveSeatPlanMinimumCanvasSize() {
      const viewportWidth = typeof window !== "undefined" && window && window.innerWidth
        ? Number(window.innerWidth) || 0
        : 0;

      return viewportWidth > 0 && viewportWidth <= 768 ? 280 : 360;
    }

    function buildInstructionAssignmentSlotsForClass(classId) {
      const startDate = parseLocalDate(schoolYearStart);
      const endDate = parseLocalDate(schoolYearEnd);
      const cursor = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : null;
      const lastDate = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;
      const lessonSlots = [];
      const orderedSeries = getOrderedCurriculumSeriesForClass(classId);
      let previousSeriesLastAssignedSlotIndex = -1;

      if (!classId || !cursor || !lastDate || !service || typeof service.getLessonUnitsForClass !== "function") {
        return [];
      }

      while (cursor <= lastDate) {
        const isoDate = toIsoDate(cursor);
        const lessonStatus = lessonStatusLookup[[String(classId || "").trim(), isoDate].join("::")] || null;

        if (!isInstructionFreeDateValue(isoDate) && !(lessonStatus && lessonStatus.isCancelled)) {
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
            let partIndex = 0;

            while (partIndex < Math.max(1, lessonCount)) {
              lessonSlots.push({
                lessonDate: isoDate,
                sourceRowId: sourceRowId,
                startTime: String(lessonUnit && lessonUnit.startTime || "").trim(),
                endTime: String(lessonUnit && lessonUnit.endTime || "").trim(),
                unitIndex: partIndex,
                unitCount: Math.max(1, lessonCount),
                assignedSeriesId: "",
                assignedSequenceId: "",
                assignedLessonId: ""
              });
              partIndex += 1;
            }
          });
        }

        cursor.setDate(cursor.getDate() + 1);
      }

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
          if (!lessonSlots[cursorIndex].assignedSeriesId) {
            lessonSlots[cursorIndex].assignedSeriesId = seriesId;
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
            if (seriesSlots[seriesSlotIndex]) {
              seriesSlots[seriesSlotIndex].assignedSequenceId = sequenceId;
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
          let remainingDemand = getCurriculumLessonHourDemand(lessonItem);
          const lessonId = String(lessonItem && lessonItem.id || "").trim();

          while (sequenceSlotIndex < sequenceSlots.length && remainingDemand > 0) {
            if (sequenceSlots[sequenceSlotIndex]) {
              sequenceSlots[sequenceSlotIndex].assignedLessonId = lessonId;
              remainingDemand -= 1;
            }

            sequenceSlotIndex += 1;
          }
        });
      });

      return lessonSlots;
    }

    function getCurrentAssignedCurriculumLessonFlow() {
      const normalizedClassId = String(activeClass && activeClass.id || "").trim();
      const lessonDate = toIsoDate(referenceDate);
      const lessonSlots = normalizedClassId ? buildInstructionAssignmentSlotsForClass(normalizedClassId) : [];
      const currentSourceRowId = String(currentClassLesson && currentClassLesson.sourceRowId || "").trim();
      const currentLessonStartMinutes = timeToMinutes(currentClassLesson && currentClassLesson.startTime || "");
      const currentLessonEndMinutes = timeToMinutes(currentClassLesson && currentClassLesson.endTime || "");
      const currentMinutes = (referenceDate.getHours() * 60) + referenceDate.getMinutes();
      let matchingSlots = lessonSlots.filter(function (slot) {
        return String(slot && slot.lessonDate || "").trim() === lessonDate
          && String(slot && slot.sourceRowId || "").trim() === currentSourceRowId;
      });
      let slotIndex = 0;
      let activeSegmentIndex = 0;
      let segmentDurationMinutes = 0;
      let segmentStartMinutes = 0;
      let segments = [];

      if (!matchingSlots.length) {
        matchingSlots = lessonSlots.filter(function (slot) {
          const slotDate = String(slot && slot.lessonDate || "").trim();
          const slotStartMinutes = timeToMinutes(slot && slot.startTime || "");
          const slotEndMinutes = timeToMinutes(slot && slot.endTime || "");

          return slotDate === lessonDate
            && slotStartMinutes < currentLessonEndMinutes
            && slotEndMinutes > currentLessonStartMinutes;
        });
      }

      if (!activeClass || !currentClassLesson || !lessonDate || !matchingSlots.length) {
        return null;
      }

      segmentDurationMinutes = Math.max(1, Math.round((timeToMinutes(currentClassLesson.endTime) - timeToMinutes(currentClassLesson.startTime)) / Math.max(matchingSlots.length, 1)));

      if (matchingSlots.length > 1) {
        const startMinutes = (() => {
          const parts = String(currentClassLesson.startTime || "").split(":");
          return ((Number(parts[0]) || 0) * 60) + (Number(parts[1]) || 0);
        })();
        const endMinutes = (() => {
          const parts = String(currentClassLesson.endTime || "").split(":");
          return ((Number(parts[0]) || 0) * 60) + (Number(parts[1]) || 0);
        })();
        const segmentSize = Math.max((endMinutes - startMinutes) / matchingSlots.length, 1);

        slotIndex = Math.max(0, Math.min(matchingSlots.length - 1, Math.floor((currentMinutes - startMinutes) / segmentSize)));
      }

      segments = matchingSlots.reduce(function (result, slot, currentIndex) {
        const lessonId = String(slot && slot.assignedLessonId || "").trim();
        const lessonPlan = lessonId && lessonPlanLookup[lessonId]
          ? lessonPlanLookup[lessonId]
          : null;
        const lastSegment = result.length ? result[result.length - 1] : null;
        const phases = lessonPlan ? getOrderedCurriculumLessonPhasesForLesson(lessonId) : [];

        if (!lessonPlan || !phases.length) {
          return result;
        }

        if (lastSegment && String(lastSegment.lessonPlan && lastSegment.lessonPlan.id || "").trim() === lessonId) {
          lastSegment.slotCount += 1;
          lastSegment.endSlotIndex = currentIndex;
          lastSegment.endMinutes += segmentDurationMinutes;
          return result;
        }

        result.push({
          lessonDate: lessonDate,
          lessonPlan: lessonPlan,
          sequence: sequenceLookup[String(lessonPlan.sequenceId || "").trim()] || null,
          series: null,
          phases: phases,
          startSlotIndex: currentIndex,
          endSlotIndex: currentIndex,
          slotCount: 1,
          startMinutes: timeToMinutes(currentClassLesson.startTime) + (currentIndex * segmentDurationMinutes),
          endMinutes: timeToMinutes(currentClassLesson.startTime) + ((currentIndex + 1) * segmentDurationMinutes)
        });

        result[result.length - 1].series = result[result.length - 1].sequence
          ? (seriesLookup[String(result[result.length - 1].sequence.seriesId || "").trim()] || null)
          : null;

        return result;
      }, []);

      if (!segments.length) {
        return null;
      }

      activeSegmentIndex = segments.findIndex(function (segmentItem) {
        return currentMinutes >= segmentItem.startMinutes && currentMinutes < segmentItem.endMinutes;
      });

      if (activeSegmentIndex < 0) {
        activeSegmentIndex = Math.max(0, Math.min(segments.length - 1, slotIndex));
      }

      segments.forEach(function (segmentItem, segmentIndex) {
        segmentItem.elapsedMinutes = Math.max(0, Math.min(segmentItem.endMinutes - segmentItem.startMinutes, currentMinutes - segmentItem.startMinutes));
        segmentItem.isActiveNow = segmentIndex === activeSegmentIndex;
      });

      return {
        lessonDate: lessonDate,
        segments: segments,
        activeSegmentIndex: activeSegmentIndex
      };
    }

    function getStudentById(studentId) {
      return students.find(function (student) {
        return student.id === studentId;
      }) || null;
    }

    function getStudentShortLabel(student) {
      const firstName = String(student && student.firstName || "").trim();
      const lastName = String(student && student.lastName || "").trim();
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() + "." : "";
      const hasDuplicateFirstName = students.filter(function (entry) {
        return String(entry && entry.firstName || "").trim() === firstName;
      }).length > 1;

      return hasDuplicateFirstName
        ? [firstName, lastInitial].join(" ").trim()
        : firstName;
    }

    function getSeatAssignmentByDeskSlot(deskItemId, slotName) {
      return seatAssignments.find(function (seat) {
        return seat.deskItemId === deskItemId && seat.slot === slotName;
      }) || null;
    }

    function getAttendanceStateForStudent(studentId) {
      if (!studentId || !activeClass || typeof service.getAttendanceStateForStudent !== "function") {
        return "present";
      }

      return service.getAttendanceStateForStudent(studentId, activeClass.id, service.getReferenceDate());
    }

    function getHomeworkStateForStudent(studentId) {
      if (!studentId || !activeClass || typeof service.getHomeworkStateForStudent !== "function") {
        return "vorhanden";
      }

      return service.getHomeworkStateForStudent(studentId, activeClass.id, service.getReferenceDate());
    }

    function getHomeworkBadgeClass(homeworkState) {
      if (["fehlt", "unvollstaendig", "abgeschrieben"].indexOf(homeworkState) >= 0) {
        return "is-missing";
      }

      if (homeworkState === "besondersgut") {
        return "is-excellent";
      }

      return "is-done";
    }

    function getToolButtonClass(toolKey) {
      return toolMode === toolKey
        ? "unterricht-seatplan-action is-active"
        : "unterricht-seatplan-action";
    }

    function getWarningCountForStudent(studentId) {
      if (!studentId || !activeClass || typeof service.getWarningCountForStudent !== "function") {
        return 0;
      }

      return service.getWarningCountForStudent(studentId, activeClass.id, service.getReferenceDate());
    }

    function getAssessmentStatusForStudent(studentId) {
      if (!studentId || !activeClass || typeof service.getAssessmentStatusForStudent !== "function") {
        return {
          currentCount: 0,
          hasCurrentAssessment: false,
          isOlderThanFourteenDays: true
        };
      }

      return service.getAssessmentStatusForStudent(studentId, activeClass.id, service.getReferenceDate());
    }

    function renderReadonlySeatSlot(student, extraClasses) {
      const classes = ["seat-order-slot", "unterricht-seatplan-slot"];
      const attendanceState = student ? getAttendanceStateForStudent(student.id) : "present";
      const showStatusInfo = attendanceState !== "absent";
      const homeworkState = student ? getHomeworkStateForStudent(student.id) : "vorhanden";
      const warningCount = student ? getWarningCountForStudent(student.id) : 0;
      const assessmentStatus = student ? getAssessmentStatusForStudent(student.id) : {
        currentCount: 0,
        hasCurrentAssessment: false,
        isOlderThanFourteenDays: false
      };
      const assessmentCount = assessmentStatus.currentCount;
      const assessmentStateClass = assessmentStatus.hasCurrentAssessment
        ? "is-positive"
        : (assessmentStatus.isOlderThanFourteenDays ? "is-overdue" : "is-empty");
      const isAttendanceInteractive = Boolean(student && currentClassLesson && toolMode === "attendance");
      const isHomeworkInteractive = Boolean(student && currentClassLesson && toolMode === "homework" && attendanceState !== "absent");
      const isWarningInteractive = Boolean(student && currentClassLesson && toolMode === "warning" && attendanceState !== "absent");
      const isAssessmentInteractive = Boolean(student && currentClassLesson && toolMode === "assessment" && attendanceState !== "absent");
      const isInteractive = isAttendanceInteractive || isHomeworkInteractive || isWarningInteractive || isAssessmentInteractive;
      const onclick = isAttendanceInteractive
        ? ' onclick="return window.UnterrichtsassistentApp.handleUnterrichtSeatClick(\'' + escapeValue(student.id) + '\', \'' + escapeValue(currentClassLesson.id) + '\', \'' + escapeValue(currentClassLesson.startTime || "") + '\', \'' + escapeValue(currentClassLesson.room || "") + '\')"'
        : "";
      const pointerdown = isHomeworkInteractive
        ? ' onpointerdown="return window.UnterrichtsassistentApp.startUnterrichtHomeworkPointer(event, \'' + escapeValue(student.id) + '\', \'' + escapeValue(currentClassLesson.id) + '\', \'' + escapeValue(currentClassLesson.startTime || "") + '\', \'' + escapeValue(currentClassLesson.room || "") + '\')" oncontextmenu="return false"'
        : "";
      const warningPointerdown = isWarningInteractive
        ? ' onpointerdown="return window.UnterrichtsassistentApp.startUnterrichtWarningPointer(event, \'' + escapeValue(student.id) + '\', \'' + escapeValue(currentClassLesson.id) + '\', \'' + escapeValue(currentClassLesson.startTime || "") + '\', \'' + escapeValue(currentClassLesson.room || "") + '\')" oncontextmenu="return false"'
        : "";
      const assessmentPointerdown = isAssessmentInteractive
        ? ' onpointerdown="return window.UnterrichtsassistentApp.startUnterrichtAssessmentPointer(event, \'' + escapeValue(student.id) + '\', \'' + escapeValue(currentClassLesson.id) + '\', \'' + escapeValue(currentClassLesson.startTime || "") + '\', \'' + escapeValue(currentClassLesson.room || "") + '\')" oncontextmenu="return false"'
        : "";
      const homeworkBadge = student && currentClassLesson && showStatusInfo
        ? '<span class="unterricht-seatplan-homework-badge ' + getHomeworkBadgeClass(homeworkState) + (toolMode === "homework" ? ' is-emphasized' : ' is-muted') + '">H</span>'
        : "";
      const warningBadge = showStatusInfo && warningCount > 0
        ? '<span class="unterricht-seatplan-warning-badge' + (toolMode === "warning" ? ' is-emphasized' : ' is-muted') + '">&#9888;<span class="unterricht-seatplan-warning-badge__count">' + escapeValue(String(warningCount)) + '</span></span>'
        : "";
      const assessmentBadge = student && currentClassLesson && showStatusInfo
        ? '<div class="unterricht-seatplan-assessment-count ' + assessmentStateClass + (toolMode === "assessment" ? ' is-emphasized' : ' is-muted') + '"><span class="unterricht-seatplan-assessment-count__icon">&#128269;</span><span class="unterricht-seatplan-assessment-count__value">' + escapeValue(String(assessmentCount)) + '</span></div>'
        : "";
      const symbolRow = (homeworkBadge || warningBadge)
        ? '<div class="unterricht-seatplan-symbol-row">' + homeworkBadge + warningBadge + '</div>'
        : "";

      if (extraClasses) {
        classes.push(extraClasses);
      }

      if (student) {
        classes.push("unterricht-seatplan-student");
        if (isInteractive) {
          classes.push("is-interactive");
        }
        classes.push("is-homework-" + getHomeworkBadgeClass(homeworkState).replace("is-", ""));
      } else {
        classes.push("seat-order-slot--readonly");
      }

      if (student && attendanceState === "absent") {
        classes.push(toolMode === "attendance" ? "is-absent" : "is-muted");
      }

      return '<div class="' + classes.join(" ") + '"' + onclick + pointerdown + warningPointerdown + assessmentPointerdown + '>' + assessmentBadge + (student ? '<span class="seat-order-desk__label seat-order-desk__label--readonly">' + escapeValue(getStudentShortLabel(student)) + "</span>" : "") + symbolRow + "</div>";
    }

    function getDeskItemMetrics(item) {
      const itemType = item && item.type === "double" ? "double" : "single";

      return {
        type: itemType,
        width: Number(item && item.width) || (itemType === "double" ? 156 : 88),
        height: Number(item && item.height) || 88
      };
    }

    function getDeskItemCenter(item, offsetX, offsetY) {
      const metrics = getDeskItemMetrics(item);

      return {
        x: (Number(item && item.x) || 0) - (Number(offsetX) || 0) + (metrics.width / 2),
        y: (Number(item && item.y) || 0) - (Number(offsetY) || 0) + (metrics.height / 2)
      };
    }

    function getSeatOrderReferenceTarget(item, offsetX, offsetY, canvasWidth, canvasHeight) {
      const targetItem = deskLayoutItemsSource.find(function (candidate) {
        return candidate && candidate.type === "tafel";
      }) || deskLayoutItemsSource.find(function (candidate) {
        return candidate && candidate.type === "pult";
      });
      const deskCenter = getDeskItemCenter(item, offsetX, offsetY);

      if (targetItem) {
        return getDeskItemCenter(targetItem, offsetX, offsetY);
      }

      return {
        x: deskCenter.x,
        y: Number(canvasHeight) || 0
      };
    }

    function getDeskBounds() {
      if (!deskLayoutItems.length) {
        return null;
      }

      return deskLayoutItems.reduce(function (bounds, item) {
        const metrics = getDeskItemMetrics(item);
        const x = Number(item.x) || 0;
        const y = Number(item.y) || 0;

        return {
          minX: Math.min(bounds.minX, x),
          minY: Math.min(bounds.minY, y),
          maxX: Math.max(bounds.maxX, x + metrics.width),
          maxY: Math.max(bounds.maxY, y + metrics.height)
        };
      }, {
        minX: Infinity,
        minY: Infinity,
        maxX: 0,
        maxY: 0
      });
    }

    function getDoubleDeskSlotLayout(item, offsetX, offsetY, canvasWidth, canvasHeight) {
      const metrics = getDeskItemMetrics(item);
      const deskCenter = getDeskItemCenter(item, offsetX, offsetY);
      const targetPoint = getSeatOrderReferenceTarget(item, offsetX, offsetY, canvasWidth, canvasHeight);
      let facingX = (Number(targetPoint.x) || 0) - deskCenter.x;
      let facingY = (Number(targetPoint.y) || 0) - deskCenter.y;
      const longAxis = metrics.width >= metrics.height ? "horizontal" : "vertical";
      const leftVectorFallback = longAxis === "horizontal"
        ? { x: -1, y: 0 }
        : { x: 0, y: -1 };
      let leftVector;
      let orderedSlots;

      if (!facingX && !facingY) {
        facingY = 1;
      }

      leftVector = {
        x: facingY || leftVectorFallback.x,
        y: -facingX || leftVectorFallback.y
      };

      if (longAxis === "horizontal") {
        orderedSlots = leftVector.x <= 0 ? ["left", "right"] : ["right", "left"];
      } else {
        orderedSlots = leftVector.y <= 0 ? ["left", "right"] : ["right", "left"];
      }

      return {
        axis: longAxis,
        orderedSlots: orderedSlots
      };
    }

    function renderCompactSeatPlan() {
      const deskBounds = getDeskBounds();
      const padding = 18;
      const offsetX = deskBounds ? Math.max(Math.floor(deskBounds.minX) - padding, 0) : 0;
      const offsetY = deskBounds ? Math.max(Math.floor(deskBounds.minY) - padding, 0) : 0;
      const canvasWidth = deskBounds
        ? Math.max(Math.ceil(deskBounds.maxX - deskBounds.minX) + (padding * 2), 180)
        : 220;
      const canvasHeight = deskBounds
        ? Math.max(Math.ceil(deskBounds.maxY - deskBounds.minY) + (padding * 2), 180)
        : 220;
      const minimumCanvasSize = getLiveSeatPlanMinimumCanvasSize();
      const effectiveCanvasWidth = Math.max(canvasWidth, minimumCanvasSize);
      const effectiveCanvasHeight = Math.max(canvasHeight, minimumCanvasSize);
      const seatPlanScale = getLiveSeatPlanScale(canvasWidth);
      const actionBarHeight = 86;
      const scaledCanvasWidth = Math.max(180, Math.round(effectiveCanvasWidth * seatPlanScale));
      const scaledCanvasHeight = Math.max(180, Math.round(effectiveCanvasHeight * seatPlanScale));
      const scaledFrameWidth = scaledCanvasWidth;
      const scaledFrameHeight = Math.max(180, scaledCanvasHeight + actionBarHeight);
      const canvasStyle = "width:" + String(canvasWidth) + "px;height:" + String(canvasHeight) + "px";
      const frameStyle = "width:" + String(scaledFrameWidth) + "px;height:" + String(scaledFrameHeight) + "px";
      const shellStyle = "width:" + String(scaledCanvasWidth) + "px;height:" + String(scaledCanvasHeight) + "px";
      const anchorStyle = "transform:scale(" + String(seatPlanScale) + ");transform-origin:top left";

      if (!activeClass) {
        return '<div class="seat-plan-placeholder">Noch keine aktive Lerngruppe vorhanden.</div>';
      }

      if (!currentSeatPlan || !currentSeatOrder) {
        return '<div class="seat-plan-placeholder">Fuer die aktuellen globalen Daten ist noch kein Sitzplan hinterlegt.</div>';
      }

      if (!deskLayoutItems.length) {
        return '<div class="seat-plan-placeholder">Die aktuelle Tischordnung enthaelt noch keine Tische.</div>';
      }

      return [
        '<div class="unterricht-seatplan">',
        '<div class="unterricht-seatplan-frame" style="', frameStyle, '">',
        '<div class="desk-layout-builder desk-layout-builder--readonly desk-layout-builder--readonly-single">',
        '<div class="desk-layout-builder__canvas-wrap desk-layout-builder__canvas-wrap--readonly desk-layout-builder__canvas-wrap--tight desk-layout-builder__canvas-wrap--unterricht">',
        '<div class="unterricht-seatplan-canvas-shell" style="', shellStyle, '">',
        '<div class="unterricht-seatplan-canvas-anchor" style="', anchorStyle, '">',
        '<div class="desk-layout-builder__canvas desk-layout-builder__canvas--readonly desk-layout-builder__canvas--tight" style="', canvasStyle, '">',
        deskLayoutItems.map(function (item) {
          const metrics = getDeskItemMetrics(item);
          const inlineStyle = [
            "left:" + String((Number(item.x) || 0) - offsetX) + "px",
            "top:" + String((Number(item.y) || 0) - offsetY) + "px",
            "width:" + String(metrics.width) + "px",
            "height:" + String(metrics.height) + "px"
          ].join(";");

          if (metrics.type === "single") {
            const singleAssignment = getSeatAssignmentByDeskSlot(item.id, "single");
            const singleStudent = singleAssignment ? getStudentById(singleAssignment.studentId) : null;

            return '<div class="desk-layout-item desk-layout-item--single desk-layout-item--seat-order" style="' + inlineStyle + '"><div class="seat-order-slot-grid">' + renderReadonlySeatSlot(singleStudent, "") + "</div></div>";
          }

          {
            const doubleDeskLayout = getDoubleDeskSlotLayout(item, offsetX, offsetY, canvasWidth, canvasHeight);
            const slotGridClass = "seat-order-slot-grid seat-order-slot-grid--double seat-order-slot-grid--double-" + doubleDeskLayout.axis;
            const doubleSlotsHtml = doubleDeskLayout.orderedSlots.map(function (slotName, slotIndex) {
              const assignment = getSeatAssignmentByDeskSlot(item.id, slotName);
              const student = assignment ? getStudentById(assignment.studentId) : null;
              const positionClass = doubleDeskLayout.axis === "horizontal"
                ? (slotIndex === 0 ? "visual-left" : "visual-right")
                : (slotIndex === 0 ? "visual-top" : "visual-bottom");

              return renderReadonlySeatSlot(student, 'seat-order-slot--' + slotName + ' seat-order-slot--' + positionClass);
            }).join("");

            return '<div class="desk-layout-item desk-layout-item--double desk-layout-item--seat-order" style="' + inlineStyle + '"><div class="' + slotGridClass + '">' + doubleSlotsHtml + "</div></div>";
          }
        }).join(""),
        '</div>',
        '</div>',
        '<div class="unterricht-seatplan-actions" aria-label="Unterrichtsaktionen">',
        '<button class="' + getToolButtonClass("attendance") + '" type="button" aria-label="Anwesenheit markieren" onclick="return window.UnterrichtsassistentApp.setUnterrichtToolMode(\'attendance\')">&#10003;</button>',
        '<button class="' + getToolButtonClass("homework") + '" type="button" aria-label="Hausaufgabe markieren" onclick="return window.UnterrichtsassistentApp.setUnterrichtToolMode(\'homework\')">H</button>',
        '<button class="' + getToolButtonClass("warning") + '" type="button" aria-label="Warnung vergeben" onclick="return window.UnterrichtsassistentApp.setUnterrichtToolMode(\'warning\')">&#9888;</button>',
        '<button class="' + getToolButtonClass("assessment") + '" type="button" aria-label="Bewertung oeffnen" onclick="return window.UnterrichtsassistentApp.setUnterrichtToolMode(\'assessment\')">&#128269;</button>',
        '</div>',
        '</div>',
        '</div>',
        '</div>'
      ].join("");
    }

    function renderLiveNotice() {
      const classLabel = activeClass
        ? [String(activeClass.name || "").trim(), String(activeClass.subject || "").trim()].filter(Boolean).join(" ")
        : "die aktive Lerngruppe";

      if (!activeClass || currentClassLesson) {
        if (activeDateTimeMode !== "manual") {
          return "";
        }

        return '<div class="unterricht-live-notice unterricht-live-notice--manual" role="status">' + escapeValue("Warnung: Manuelle Zeitangabe") + "</div>";
      }

      return [
        '<div class="unterricht-live-notice" role="status">',
        '<div>', escapeValue(activeDateTimeMode === "live"
          ? "Kein Unterricht: " + classLabel
          : "Kein Unterricht: " + classLabel), '</div>',
        activeDateTimeMode === "manual"
          ? '<div class="unterricht-live-notice__subline">' + escapeValue("Warnung: Manuelle Zeitangabe") + '</div>'
          : "",
        '</div>'
      ].join("");
    }

    function renderLiveLessonFlowPanel(lessonFlowData) {
      const lessonDateLabel = lessonFlowData ? formatShortDateLabel(lessonFlowData.lessonDate) : "";

      if (!lessonFlowData) {
        return "";
      }

      return [
        '<article class="unterricht-layout__live-flow">',
        '<div class="unterricht-live-flow__header">',
        '<h2 class="unterricht-live-flow__title">Stundenverlauf</h2>',
        lessonDateLabel ? '<div class="unterricht-live-flow__meta"><span class="unterricht-live-flow__meta-date">' + escapeValue(lessonDateLabel) + '</span></div>' : "",
        '</div>',
        lessonFlowData.segments.map(function (segmentItem) {
          let consumedCompletedMinutes = 0;

          return [
            '<section class="unterricht-live-flow__lesson' + (segmentItem.isActiveNow ? ' is-active' : '') + '">',
            '<div class="unterricht-live-flow__meta">',
            '<span class="unterricht-live-flow__meta-topic">' + escapeValue(String(segmentItem.lessonPlan && segmentItem.lessonPlan.topic || "").trim() || "Ohne Thema") + '</span>',
            segmentItem.slotCount > 1 ? '<span class="unterricht-live-flow__meta-date">x' + escapeValue(String(segmentItem.slotCount)) + '</span>' : '',
            '</div>',
            '<div class="unterricht-live-flow__phase-list">',
            segmentItem.phases.map(function (phaseItem) {
            const phaseItemId = String(phaseItem && phaseItem.id || "").trim();
            const phaseTitle = String(phaseItem && phaseItem.title || "").trim() || "Ohne Titel";
            const phaseDuration = Number(phaseItem && phaseItem.durationMinutes) || 0;
            const phaseSteps = getOrderedCurriculumLessonStepsForPhase(phaseItemId);
            const phaseStatus = lessonPhaseStatusLookup[[String(activeClass && activeClass.id || "").trim(), String(segmentItem.lessonPlan && segmentItem.lessonPlan.id || "").trim(), phaseItemId].join("::")] || lessonPhaseStatusLookup[[String(activeClass && activeClass.id || "").trim(), lessonFlowData.lessonDate, String(segmentItem.lessonPlan && segmentItem.lessonPlan.id || "").trim(), phaseItemId].join("::")] || null;
            const phaseMetaParts = [
              getCurriculumDemandLevelLabel(phaseItem && phaseItem.demandLevel),
              getCurriculumSituationTypeLabel(phaseItem && phaseItem.situationType)
            ].filter(Boolean);
            const persistedElapsedMinutes = Math.max(0, Number(phaseStatus && phaseStatus.elapsedMinutes) || 0);
            const resumeStartMinutes = Math.max(0, Number(phaseStatus && phaseStatus.resumeStartMinutes) || 0);
            const isCompleted = Boolean(phaseStatus && phaseStatus.isCompleted);
            let elapsedMinutes = 0;
            let diffLabel = "";
            let titleClasses = ["unterricht-live-flow__phase-title"];
            let diffClass = "";

            if (isCompleted) {
              elapsedMinutes = persistedElapsedMinutes;
            } else if (phaseStatus && persistedElapsedMinutes > 0) {
              elapsedMinutes = persistedElapsedMinutes + Math.max(0, segmentItem.elapsedMinutes - resumeStartMinutes);
            } else {
              elapsedMinutes = Math.max(0, segmentItem.elapsedMinutes - consumedCompletedMinutes);
            }

            if (elapsedMinutes > phaseDuration && phaseDuration > 0) {
              titleClasses.push("is-overdue");
            }

            if (isCompleted && phaseDuration > 0 && elapsedMinutes !== phaseDuration) {
              if (elapsedMinutes > phaseDuration) {
                diffClass = " is-overdue";
                diffLabel = ' <span class="unterricht-live-flow__phase-diff' + diffClass + '">+' + escapeValue(String(elapsedMinutes - phaseDuration)) + '</span>';
              } else {
                diffClass = " is-under";
                diffLabel = ' <span class="unterricht-live-flow__phase-diff' + diffClass + '">-' + escapeValue(String(phaseDuration - elapsedMinutes)) + '</span>';
              }
            }

            consumedCompletedMinutes += elapsedMinutes;

            return [
              '<section class="unterricht-live-flow__phase' + (isCompleted ? ' is-completed' : '') + '">',
              '<div class="unterricht-live-flow__phase-content">',
              '<div class="unterricht-live-flow__phase-title-row">',
              '<h3 class="' + titleClasses.join(" ") + '"><label class="unterricht-live-flow__phase-title-label"><input type="checkbox" aria-label="Phase erledigt" ' + (isCompleted ? 'checked ' : '') + 'onchange="return window.UnterrichtsassistentApp.toggleCurriculumLessonPhaseCompleted(\'' + escapeValue(String(activeClass && activeClass.id || "").trim()) + '\', \'' + escapeValue(lessonFlowData.lessonDate) + '\', \'' + escapeValue(String(segmentItem.lessonPlan && segmentItem.lessonPlan.id || "").trim()) + '\', \'' + escapeValue(phaseItemId) + '\', this.checked, ' + String(elapsedMinutes) + ', ' + String(segmentItem.elapsedMinutes) + ')"><span>' + escapeValue(phaseTitle) + ' <span>(' + escapeValue(String(elapsedMinutes)) + ' / ' + escapeValue(String(phaseDuration)) + ' Min.)</span>' + diffLabel + '</span></label></h3>',
              phaseMetaParts.length
                ? '<div class="unterricht-live-flow__phase-meta">' + phaseMetaParts.map(function (entry) {
                    return '<span>' + escapeValue(entry) + '</span>';
                  }).join("") + '</div>'
                : "",
              phaseItem && phaseItem.isReserve
                ? '<span class="unterricht-live-flow__phase-flag">Reserve</span>'
                : "",
              '</div>',
              !isCompleted && phaseSteps.length
                ? '<div class="unterricht-live-flow__step-list">' + phaseSteps.map(function (stepItem) {
                  const stepTitle = String(stepItem && stepItem.title || "").trim();
                  const stepContent = String(stepItem && stepItem.content || "").trim();
                  const stepMaterial = String(stepItem && stepItem.material || "").trim();

                  return [
                    '<div class="unterricht-live-flow__step">',
                    '<div class="unterricht-live-flow__step-main">',
                    stepTitle ? '<div class="unterricht-live-flow__step-title">' + escapeValue(stepTitle) + '</div>' : "",
                    stepContent ? '<div class="unterricht-live-flow__step-content">' + escapeValue(stepContent) + '</div>' : "",
                    (!stepTitle && !stepContent) ? '<div class="unterricht-live-flow__empty unterricht-live-flow__empty--inline">Noch kein Inhalt.</div>' : "",
                    '</div>',
                    '<div class="unterricht-live-flow__step-side">',
                    '<div class="unterricht-live-flow__step-meta"><span>S</span><strong>' + escapeValue(getCurriculumLessonStepSocialFormShortLabel(stepItem && stepItem.socialForm)) + '</strong></div>',
                    '<div class="unterricht-live-flow__step-meta"><span>M</span><strong>' + escapeValue(stepMaterial || "-") + '</strong></div>',
                    '</div>',
                    '</div>'
                  ].join("");
                }).join("") + '</div>'
                : (!isCompleted
                  ? '<div class="unterricht-live-flow__empty unterricht-live-flow__empty--inline">Noch keine Schritte angelegt.</div>'
                  : ""),
              '</div>',
              '</section>'
            ].join("");
            }).join(""),
            '</div>',
            '</section>'
          ].join("");
        }).join(""),
        '</article>'
      ].join("");
    }

    function getTodoClassInfo(todoItem) {
      const normalizedRelatedClassId = String(todoItem && todoItem.relatedClassId || "").trim();
      const classes = Array.isArray(snapshot.classes) ? snapshot.classes : [];
      const classEntry = normalizedRelatedClassId
        ? classes.find(function (entry) {
            return String(entry && entry.id || "").trim() === normalizedRelatedClassId;
          }) || null
        : classes.find(function (entry) {
            return [String(entry && entry.name || "").trim(), String(entry && entry.subject || "").trim()]
              .filter(Boolean)
              .join(" ")
              .trim()
              .toLowerCase() === String(todoItem && todoItem.category || "").trim().toLowerCase();
          }) || null;
      const studentIds = classEntry && Array.isArray(classEntry.studentIds) ? classEntry.studentIds : [];
      const classStudents = studentIds.map(function (studentId) {
        return (Array.isArray(snapshot.students) ? snapshot.students : []).find(function (student) {
          return String(student && student.id || "").trim() === String(studentId || "").trim();
        }) || null;
      }).filter(Boolean).sort(function (left, right) {
        const leftFirstName = String(left && left.firstName || "").trim().toLowerCase();
        const rightFirstName = String(right && right.firstName || "").trim().toLowerCase();

        if (leftFirstName !== rightFirstName) {
          return leftFirstName.localeCompare(rightFirstName, "de", { sensitivity: "base" });
        }

        return String(left && left.lastName || "").trim().toLowerCase().localeCompare(
          String(right && right.lastName || "").trim().toLowerCase(),
          "de",
          { sensitivity: "base" }
        );
      });

      return {
        classId: classEntry ? String(classEntry.id || "").trim() : "",
        students: classStudents
      };
    }

    function getStudentCompactDisplayName(student, classStudents) {
      const firstName = String(student && student.firstName || "").trim();
      const lastName = String(student && student.lastName || "").trim();
      const normalizedFirstName = firstName.toLowerCase();
      const studentsInClass = Array.isArray(classStudents) ? classStudents : [];
      const hasDuplicateFirstName = Boolean(normalizedFirstName) && studentsInClass.some(function (entry) {
        return entry !== student
          && String(entry && entry.firstName || "").trim().toLowerCase() === normalizedFirstName;
      });

      if (firstName) {
        return hasDuplicateFirstName && lastName
          ? firstName + " " + lastName.charAt(0).toUpperCase() + "."
          : firstName;
      }

      return lastName || "Unbekannt";
    }

    function formatTodoDateLabel(dateValue) {
      const normalizedValue = String(dateValue || "").slice(0, 10);
      const parts = normalizedValue.split("-");

      if (parts.length !== 3) {
        return "";
      }

      return [parts[2], parts[1], parts[0]].join(".");
    }

    function getTodoPriorityRank(priorityValue) {
      const normalizedValue = String(priorityValue || "").trim().toLowerCase();

      if (normalizedValue === "hoch") {
        return 0;
      }

      if (normalizedValue === "standard") {
        return 1;
      }

      return 2;
    }

    function getTodoDeadlineSortValue(todoItem) {
      return String(todoItem && todoItem.dueDate || "").slice(0, 10);
    }

    function getReferenceDateValue() {
      const activeDateTimeParts = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveDateTimeParts === "function"
        ? window.UnterrichtsassistentApp.getActiveDateTimeParts()
        : { date: "" };

      return String(activeDateTimeParts && activeDateTimeParts.date || "").slice(0, 10);
    }

    function getTodoDaysUntilDeadline(todoItem) {
      const deadlineValue = getTodoDeadlineSortValue(todoItem);
      const referenceValue = getReferenceDateValue();
      const deadlineDate = deadlineValue ? new Date(deadlineValue + "T00:00:00") : null;
      const referenceDateOnly = referenceValue ? new Date(referenceValue + "T00:00:00") : null;

      if (!deadlineDate || Number.isNaN(deadlineDate.getTime()) || !referenceDateOnly || Number.isNaN(referenceDateOnly.getTime())) {
        return null;
      }

      return Math.round((deadlineDate.getTime() - referenceDateOnly.getTime()) / 86400000);
    }

    function getTodoUrgencyScore(todoItem) {
      const daysUntilDeadline = getTodoDaysUntilDeadline(todoItem);
      const priorityRank = getTodoPriorityRank(todoItem && todoItem.priority);
      const priorityWeight = [28, 18, 10][priorityRank] || 10;

      if (daysUntilDeadline === null) {
        return priorityWeight;
      }

      if (daysUntilDeadline <= 1) {
        return 220 + priorityWeight + Math.max(0, 1 - daysUntilDeadline) * 12;
      }

      return priorityWeight + (140 / (daysUntilDeadline + 1));
    }

    function isEspeciallyUrgentTodo(todoItem) {
      const daysUntilDeadline = getTodoDaysUntilDeadline(todoItem);
      const priorityValue = String(todoItem && todoItem.priority || "niedrig").trim().toLowerCase();

      if (daysUntilDeadline === null) {
        return false;
      }

      if (priorityValue === "hoch") {
        return daysUntilDeadline <= 4;
      }

      if (priorityValue === "standard") {
        return daysUntilDeadline <= 2;
      }

      return daysUntilDeadline <= 1;
    }

    function compareTodoTitles(leftItem, rightItem) {
      return String(leftItem && leftItem.title || "").localeCompare(String(rightItem && rightItem.title || ""), "de", { sensitivity: "base" });
    }

    function compareByDeadlineThenPriority(leftItem, rightItem) {
      const leftDeadline = getTodoDeadlineSortValue(leftItem);
      const rightDeadline = getTodoDeadlineSortValue(rightItem);
      const priorityDifference = getTodoPriorityRank(leftItem && leftItem.priority) - getTodoPriorityRank(rightItem && rightItem.priority);

      if (leftDeadline && rightDeadline && leftDeadline !== rightDeadline) {
        return leftDeadline.localeCompare(rightDeadline, "de");
      }

      if (leftDeadline && !rightDeadline) {
        return -1;
      }

      if (!leftDeadline && rightDeadline) {
        return 1;
      }

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return compareTodoTitles(leftItem, rightItem);
    }

    function compareByUrgency(leftItem, rightItem) {
      const urgencyDifference = getTodoUrgencyScore(rightItem) - getTodoUrgencyScore(leftItem);

      if (Math.abs(urgencyDifference) > 0.0001) {
        return urgencyDifference;
      }

      return compareByDeadlineThenPriority(leftItem, rightItem);
    }

    function getChecklistChildItems(items, parentId) {
      return (items || []).filter(function (entry) {
        return String(entry && entry.parentId || "").trim() === String(parentId || "").trim();
      });
    }

    function getChecklistNodeById(items, nodeId) {
      const normalizedNodeId = String(nodeId || "").trim();

      if (!normalizedNodeId) {
        return null;
      }

      return (items || []).reduce(function (foundEntry, entry) {
        if (foundEntry) {
          return foundEntry;
        }

        if (String(entry && entry.id || "").trim() === normalizedNodeId) {
          return {
            kind: "item",
            entry: entry,
            ownerItem: entry
          };
        }

        if (Array.isArray(entry && entry.followUpSteps)) {
          const foundStep = entry.followUpSteps.find(function (step) {
            return String(step && step.id || "").trim() === normalizedNodeId;
          }) || null;

          if (foundStep) {
            return {
              kind: "step",
              entry: foundStep,
              ownerItem: entry
            };
          }
        }

        return null;
      }, null);
    }

    function getChecklistFollowUpSteps(items, itemId) {
      const selectedNode = getChecklistNodeById(items, itemId);

      if (!selectedNode || selectedNode.kind !== "item" || !Array.isArray(selectedNode.entry && selectedNode.entry.followUpSteps)) {
        return [];
      }

      return selectedNode.entry.followUpSteps;
    }

    function getDerivedChecklistItemDone(items, itemId) {
      const selectedNode = getChecklistNodeById(items, itemId);
      const childItems = getChecklistChildItems(items, itemId);

      if (!selectedNode) {
        return false;
      }

      if (childItems.length > 0) {
        return childItems.every(function (childItem) {
          return getAggregatedChecklistItemDone(items, childItem && childItem.id);
        });
      }

      return Boolean(selectedNode.entry && selectedNode.entry.done);
    }

    function getAggregatedChecklistItemDone(items, itemId) {
      const selectedNode = getChecklistNodeById(items, itemId);
      const followUpSteps = selectedNode && selectedNode.kind === "item"
        ? getChecklistFollowUpSteps(items, itemId)
        : [];

      if (!selectedNode) {
        return false;
      }

      return getDerivedChecklistItemDone(items, itemId) && followUpSteps.every(function (step) {
        return getAggregatedChecklistItemDone(items, step && step.id);
      });
    }

    function getChecklistNodeSelfDone(items, itemId) {
      const selectedNode = getChecklistNodeById(items, itemId);

      return Boolean(selectedNode && selectedNode.entry && selectedNode.entry.done);
    }

    function isChecklistItemManuallyToggleable(items, itemId) {
      const selectedNode = getChecklistNodeById(items, itemId);
      const childItems = getChecklistChildItems(items, itemId);

      return Boolean(selectedNode) && childItems.length === 0;
    }

    function isChecklistNodeReadyForFollowUp(items, nodeId) {
      return isChecklistItemManuallyToggleable(items, nodeId)
        ? getChecklistNodeSelfDone(items, nodeId)
        : getDerivedChecklistItemDone(items, nodeId);
    }

    function isChecklistNodeUnlocked(items, nodeId) {
      const selectedNode = getChecklistNodeById(items, nodeId);
      const previousNodeId = selectedNode && selectedNode.kind === "step"
        ? String(selectedNode.entry.previousStepId || selectedNode.ownerItem && selectedNode.ownerItem.id || "").trim()
        : "";
      const parentNodeId = selectedNode && selectedNode.kind === "item"
        ? String(selectedNode.entry && selectedNode.entry.parentId || "").trim()
        : "";

      if (!selectedNode) {
        return false;
      }

      if (selectedNode.kind === "step") {
        return previousNodeId ? isChecklistNodeReadyForFollowUp(items, previousNodeId) : true;
      }

      if (parentNodeId) {
        return isChecklistNodeUnlocked(items, parentNodeId);
      }

      return true;
    }

    function getDerivedChecklistTodoDone(items) {
      const topLevelItems = getChecklistChildItems(items, "");

      return topLevelItems.length > 0 && topLevelItems.every(function (item) {
        return getAggregatedChecklistItemDone(items, item && item.id);
      });
    }

    function hasCompletedFollowUpSuccessor(items, itemId) {
      const selectedNode = getChecklistNodeById(items, itemId);
      const followUpSteps = selectedNode && selectedNode.kind === "item"
        ? getChecklistFollowUpSteps(items, itemId)
        : [];

      if (!selectedNode || !followUpSteps.length) {
        return false;
      }

      return followUpSteps.some(function (step) {
        return getAggregatedChecklistItemDone(items, step && step.id)
          || hasCompletedFollowUpSuccessor(items, step && step.id);
      });
    }

    function getAssignedStudentEntries(todoEntry) {
      const classInfo = getTodoClassInfo(todoEntry);
      const classStudents = classInfo.students || [];
      const assignedIds = Array.isArray(todoEntry && todoEntry.assignedStudentIds)
        ? todoEntry.assignedStudentIds.map(function (studentId) {
            return String(studentId || "").trim();
          }).filter(Boolean)
        : [];
      const statusEntries = Array.isArray(todoEntry && todoEntry.assignedStudentStatuses)
        ? todoEntry.assignedStudentStatuses
        : [];

      return assignedIds.map(function (studentId) {
        const student = classStudents.find(function (entry) {
          return String(entry && entry.id || "").trim() === studentId;
        }) || null;
        const statusEntry = statusEntries.find(function (entry) {
          return String(entry && entry.studentId || "").trim() === studentId;
        }) || null;

        return student ? {
          id: studentId,
          label: getStudentCompactDisplayName(student, classStudents),
          done: Boolean(statusEntry && statusEntry.done)
        } : null;
      }).filter(Boolean);
    }

    function getDerivedAssignedStudentsDone(todoEntry) {
      const assignedStudents = getAssignedStudentEntries(todoEntry);

      return assignedStudents.length > 0 && assignedStudents.every(function (entry) {
        return Boolean(entry && entry.done);
      });
    }

    function isTodoEffectivelyDone(todoItem) {
      const todoType = String(todoItem && todoItem.type || "").trim().toLowerCase();
      const hasAssignedStudents = Array.isArray(todoItem && todoItem.assignedStudentIds) && todoItem.assignedStudentIds.length > 0;
      const checklistItems = Array.isArray(todoItem && todoItem.checklistItems) ? todoItem.checklistItems : [];

      if (hasAssignedStudents) {
        return getDerivedAssignedStudentsDone(todoItem);
      }

      if (todoType === "checkliste") {
        return getDerivedChecklistTodoDone(checklistItems);
      }

      return Boolean(todoItem && todoItem.done);
    }

    function getHighestOpenUrgencyScore(items) {
      const openItems = (items || []).filter(function (todoItem) {
        return !isTodoEffectivelyDone(todoItem);
      });

      if (!openItems.length) {
        return -Infinity;
      }

      return Math.max.apply(null, openItems.map(function (todoItem) {
        return getTodoUrgencyScore(todoItem);
      }));
    }

    function sortTodoItems(items) {
      return items.slice().sort(function (leftItem, rightItem) {
        const doneDifference = (isTodoEffectivelyDone(leftItem) ? 1 : 0) - (isTodoEffectivelyDone(rightItem) ? 1 : 0);

        if (doneDifference !== 0) {
          return doneDifference;
        }

        return compareByUrgency(leftItem, rightItem);
      });
    }

    function buildTodoMeta(todoItem) {
      const categoryLabel = String(todoItem && todoItem.category || "").trim();
      const deadlineLabel = formatTodoDateLabel(todoItem && todoItem.dueDate);
      const priorityLabel = String(todoItem && todoItem.priority || "niedrig").trim().toLowerCase();
      const metaParts = [];

      if (categoryLabel) {
        metaParts.push("Kategorie: " + categoryLabel);
      }

      if (deadlineLabel) {
        metaParts.push("Deadline: " + deadlineLabel);
      }

      if (priorityLabel && priorityLabel !== "niedrig") {
        metaParts.push("Prioritaet: " + priorityLabel);
      }

      if (isTodoEffectivelyDone(todoItem)) {
        metaParts.push("Status: erledigt");
      }

      return metaParts;
    }

    function buildChecklistTree(todoId, items, parentId, depth, studentId) {
      return getChecklistChildItems(items, parentId).map(function (entry) {
        const itemId = String(entry && entry.id || "").trim();
        const itemTitle = String(entry && entry.title || "").trim();
        const followUpSteps = getChecklistFollowUpSteps(items, itemId);
        const isItemToggleable = isChecklistItemManuallyToggleable(items, itemId);
        const isItemDone = isItemToggleable
          ? getChecklistNodeSelfDone(items, itemId)
          : getDerivedChecklistItemDone(items, itemId);
        const isItemUnlocked = isChecklistNodeUnlocked(items, itemId);
        const isItemBlockedByFollowUp = isItemDone && hasCompletedFollowUpSuccessor(items, itemId);
        const hasFollowUpSequence = followUpSteps.length > 0;
        const childItemsMarkup = buildChecklistTree(todoId, items, itemId, depth + 1, studentId);
        const followUpMarkup = followUpSteps.map(function (step, index) {
          const stepObject = step && typeof step === "object"
            ? step
            : { id: "", title: String(step || "").trim(), done: false, previousStepId: "" };
          const stepId = String(stepObject.id || "").trim();
          const stepTitle = String(stepObject.title || "").trim();
          const stepToggleable = isChecklistItemManuallyToggleable(items, stepId);
          const stepDone = stepToggleable
            ? getChecklistNodeSelfDone(items, stepId)
            : getDerivedChecklistItemDone(items, stepId);
          const stepUnlocked = isChecklistNodeUnlocked(items, stepId);
          const stepBlockedByFollowUp = stepDone && hasCompletedFollowUpSuccessor(items, stepId);
          const stepChildMarkup = buildChecklistTree(todoId, items, stepId, depth + 1, studentId);

          if (!stepTitle) {
            return "";
          }

          return [
            '<div class="todos-view__checklist-group">',
            '<label class="todos-view__checklist-entry todos-view__checklist-entry--follow-up', stepUnlocked ? '' : ' is-locked', '" style="--todo-checklist-depth:', escapeValue(String(depth)), ';">',
            '<span class="todos-view__checkbox todos-view__checkbox--compact todos-view__checkbox--sequence', stepToggleable && stepUnlocked && !stepBlockedByFollowUp ? '' : ' is-readonly', '" aria-label="Folgeschritt-Status umschalten"><input type="checkbox"', stepDone ? ' checked' : '', stepToggleable && stepUnlocked && !stepBlockedByFollowUp ? '' : ' disabled', ' onchange="return window.UnterrichtsassistentApp.toggleTodoChecklistFollowUpDone(\'', escapeValue(todoId), '\', \'', escapeValue(itemId), '\', ', escapeValue(String(index)), ', this.checked, \'', escapeValue(studentId || ""), '\')"><span>', escapeValue(String(index + 2)), '</span></span>',
            '<span class="todos-view__checklist-text', stepDone ? ' is-done' : '', '">', escapeValue(stepTitle), '</span>',
            '</label>',
            stepChildMarkup,
            '</div>'
          ].join("");
        }).join("");

        if (!itemTitle) {
          return "";
        }

        return [
          '<div class="todos-view__checklist-group">',
          '<label class="todos-view__checklist-entry', isItemUnlocked ? '' : ' is-locked', '" style="--todo-checklist-depth:', escapeValue(String(depth)), ';">',
          '<span class="todos-view__checkbox todos-view__checkbox--compact', hasFollowUpSequence ? ' todos-view__checkbox--sequence' : '', isItemToggleable && isItemUnlocked && !isItemBlockedByFollowUp ? '' : ' is-readonly', '" aria-label="Listenpunkt-Status umschalten"><input type="checkbox"', isItemDone ? ' checked' : '', isItemToggleable && isItemUnlocked && !isItemBlockedByFollowUp ? '' : ' disabled', ' onchange="return window.UnterrichtsassistentApp.toggleTodoChecklistItemDone(\'', escapeValue(todoId), '\', \'', escapeValue(itemId), '\', this.checked, \'', escapeValue(studentId || ""), '\')"><span>', hasFollowUpSequence ? '1' : '', '</span></span>',
          '<span class="todos-view__checklist-text', isItemDone ? ' is-done' : '', '">', escapeValue(itemTitle), '</span>',
          '</label>',
          childItemsMarkup,
          followUpMarkup,
          '</div>'
        ].join("");
      }).join("");
    }

    function buildChecklistSection(todoEntry, options) {
      const config = options && typeof options === "object" ? options : {};
      const checklistItems = Array.isArray(config.checklistItems)
        ? config.checklistItems
        : (Array.isArray(todoEntry && todoEntry.checklistItems) ? todoEntry.checklistItems : []);
      const normalizedStudentId = String(config.studentId || "").trim();
      const normalizedTodoId = String(todoEntry && todoEntry.id || "").trim();
      const checklistMarkup = buildChecklistTree(normalizedTodoId, checklistItems, "", 0, normalizedStudentId);

      if (String(todoEntry && todoEntry.type || "").trim().toLowerCase() !== "checkliste" || !checklistMarkup) {
        return "";
      }

      return [
        '<div class="todos-view__checklist">',
        config.hideTitle ? '' : '<div class="todos-view__checklist-title">Checkliste</div>',
        '<div class="todos-view__checklist-tree">',
        checklistMarkup,
        '</div>',
        '</div>'
      ].join("");
    }

    function buildAssignedStudentsSection(todoEntry) {
      const assignedStudents = getAssignedStudentEntries(todoEntry);
      const normalizedTodoId = String(todoEntry && todoEntry.id || "").trim();

      if (String(todoEntry && todoEntry.type || "").trim().toLowerCase() !== "standard" || !assignedStudents.length) {
        return "";
      }

      return [
        '<div class="todos-view__assigned-students">',
        '<div class="todos-view__assigned-students-title">Zuordnung</div>',
        '<div class="todos-view__assigned-students-list">',
        assignedStudents.map(function (entry) {
          return [
            '<label class="todos-view__assigned-student">',
            '<span class="todos-view__checkbox todos-view__checkbox--compact" aria-label="Schueler-Status umschalten"><input type="checkbox"', entry.done ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.toggleTodoAssignedStudentDone(\'', escapeValue(normalizedTodoId), '\', \'', escapeValue(entry.id), '\', this.checked)"><span></span></span>',
            '<span class="todos-view__assigned-student-text', entry.done ? ' is-done' : '', '">', escapeValue(entry.label), '</span>',
            '</label>'
          ].join("");
        }).join(""),
        '</div>',
        '</div>'
      ].join("");
    }

    function buildAssignedStudentChecklistSections(todoEntry) {
      const assignedStudents = getAssignedStudentEntries(todoEntry);
      const statusEntries = Array.isArray(todoEntry && todoEntry.assignedStudentStatuses)
        ? todoEntry.assignedStudentStatuses
        : [];

      if (String(todoEntry && todoEntry.type || "").trim().toLowerCase() !== "checkliste" || !assignedStudents.length) {
        return "";
      }

      return [
        '<div class="todos-view__assigned-checklists">',
        assignedStudents.map(function (entry) {
          const statusEntry = statusEntries.find(function (statusItem) {
            return String(statusItem && statusItem.studentId || "").trim() === String(entry && entry.id || "").trim();
          }) || null;
          const checklistMarkup = buildChecklistSection(todoEntry, {
            studentId: entry.id,
            checklistItems: statusEntry && Array.isArray(statusEntry.checklistItems) ? statusEntry.checklistItems : [],
            hideTitle: true
          });

          return [
            '<div class="todos-view__assigned-checklist">',
            '<div class="todos-view__assigned-checklist-header">',
            '<span class="todos-view__checkbox todos-view__checkbox--compact is-readonly"><input type="checkbox"', entry.done ? ' checked' : '', ' disabled><span></span></span>',
            '<span class="todos-view__assigned-checklist-name', entry.done ? ' is-done' : '', '">', escapeValue(entry.label), '</span>',
            '</div>',
            checklistMarkup,
            '</div>'
          ].join("");
        }).join(""),
        '</div>'
      ].join("");
    }

    function buildLiveTodoRow(todoItem) {
      const title = String(todoItem && todoItem.title || "").trim() || "Ohne Titel";
      const normalizedTodoId = String(todoItem && todoItem.id || "").trim();
      const description = String(todoItem && todoItem.description || "").trim();
      const categoryLabel = String(todoItem && todoItem.category || "").trim();
      const checklistItems = Array.isArray(todoItem && todoItem.checklistItems) ? todoItem.checklistItems : [];
      const metaParts = buildTodoMeta(todoItem);
      const assignedStudentsSectionMarkup = buildAssignedStudentsSection(todoItem);
      const assignedStudentChecklistMarkup = buildAssignedStudentChecklistSections(todoItem);
      const hasAssignedStudents = Array.isArray(todoItem && todoItem.assignedStudentIds) && todoItem.assignedStudentIds.length > 0;
      const isChecklistTodo = String(todoItem && todoItem.type || "").trim().toLowerCase() === "checkliste";
      const isDone = isTodoEffectivelyDone(todoItem);
      const isExpanded = expandedTodoIds.indexOf(normalizedTodoId) >= 0;
      const categoryColor = categoryLabel && window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningCategoryColor === "function"
        ? String(window.UnterrichtsassistentApp.getPlanningCategoryColor(categoryLabel) || "").trim()
        : "";
      const checklistSectionMarkup = hasAssignedStudents && isChecklistTodo ? "" : buildChecklistSection(todoItem);
      const rowStyle = categoryColor
        ? ' style="--todo-category-color:' + escapeValue(categoryColor) + ';"'
        : "";

      return [
        '<div class="todos-view__row', isDone ? ' is-done' : '', isExpanded ? ' is-expanded' : '', isEspeciallyUrgentTodo(todoItem) ? ' is-especially-urgent' : '', '"', rowStyle, '>',
        '<div class="todos-view__content">',
        '<div class="todos-view__header">',
        '<label class="todos-view__checkbox', (isChecklistTodo || hasAssignedStudents) ? ' is-readonly' : '', '" aria-label="TODO-Status umschalten"><input type="checkbox"', isDone ? ' checked' : '', (isChecklistTodo || hasAssignedStudents) ? ' disabled' : '', ' onchange="return window.UnterrichtsassistentApp.toggleTodoDone(\'', escapeValue(normalizedTodoId), '\', this.checked)"><span></span></label>',
        '<button class="todos-view__summary" type="button" aria-expanded="', isExpanded ? 'true' : 'false', '" onclick="return window.UnterrichtsassistentApp.toggleTodoExpanded(\'', escapeValue(normalizedTodoId), '\')">',
        '<span class="todos-view__title-wrap">',
        categoryColor ? '<span class="todos-view__category-marker" aria-hidden="true"></span>' : '',
        '<span class="todos-view__title">', escapeValue(title), '</span>',
        isEspeciallyUrgentTodo(todoItem) ? '<span class="todos-view__urgency-badge">Dringend</span>' : '',
        '</span>',
        '<span class="todos-view__indicator" aria-hidden="true">', isExpanded ? '&#9662;' : '&#9656;', '</span>',
        '</button>',
        '</div>',
        isExpanded ? [
          '<div class="todos-view__details">',
          metaParts.length ? '<div class="todos-view__meta">' + escapeValue(metaParts.join(" | ")) + '</div>' : '',
          description ? '<div class="todos-view__description">' + escapeValue(description).replace(/&#10;/g, "<br>") + '</div>' : '',
          assignedStudentsSectionMarkup,
          assignedStudentChecklistMarkup,
          checklistSectionMarkup,
          (!metaParts.length && !description && !assignedStudentsSectionMarkup && !assignedStudentChecklistMarkup && !checklistSectionMarkup) ? '<div class="todos-view__meta">Keine weiteren Informationen hinterlegt.</div>' : '',
          '<div class="todos-view__actions todos-view__actions--details">',
          '<button class="planning-sidebar__edit" type="button" aria-label="TODO bearbeiten" onclick="return window.UnterrichtsassistentApp.openTodoModal(\'', escapeValue(normalizedTodoId), '\')">&#9998;</button>',
          '<button class="planning-sidebar__delete" type="button" aria-label="TODO loeschen" onclick="return window.UnterrichtsassistentApp.deleteTodo(\'', escapeValue(normalizedTodoId), '\')">&#10005;</button>',
          '</div>',
          '</div>'
        ].join("") : '',
        '</div>',
        '</div>'
      ].join("");
    }

    function getLiveTodoSectionSizeUnits(group) {
      const visibleTodoCount = Math.min(Array.isArray(group && group.items) ? group.items.length : 0, 5);

      return visibleTodoCount + 2;
    }

    function buildLiveTodoSectionHeader(title, count) {
      const openTodoModalArguments = [
        "''",
        "'" + escapeValue(String(title || "").trim()) + "'",
        "''"
      ].join(", ");

      return [
        '<header class="todos-view__section-header">',
        '<h3>', escapeValue(title), '</h3>',
        '<div class="todos-view__section-header-meta">',
        '<span>', escapeValue(String(count)), '</span>',
        '<button class="todos-view__add-button todos-view__add-button--header" type="button" aria-label="TODO hinzufuegen" onclick="return window.UnterrichtsassistentApp.openTodoModal(', openTodoModalArguments, ')">+</button>',
        '</div>',
        '</header>'
      ].join("");
    }

    function buildLiveCurrentClassTodoPanel() {
      const activeClassDisplayName = activeClass
        ? [String(activeClass.name || "").trim(), String(activeClass.subject || "").trim()].filter(Boolean).join(" ")
        : "";
      const normalizedActiveClassId = String(activeClass && activeClass.id || "").trim();
      const relevantTodos = (Array.isArray(snapshot.todos) ? snapshot.todos : []).filter(function (todoItem) {
        const normalizedTodoClassId = String(todoItem && todoItem.relatedClassId || "").trim();
        const normalizedCategory = String(todoItem && todoItem.category || "").trim().toLowerCase();

        if (isTodoEffectivelyDone(todoItem)) {
          return false;
        }

        if (normalizedActiveClassId && normalizedTodoClassId === normalizedActiveClassId) {
          return true;
        }

        return Boolean(activeClassDisplayName) && normalizedCategory === activeClassDisplayName.toLowerCase();
      });
      const groups = {};
      const categoryOrder = [];

      if (!activeClass) {
        return "";
      }

      relevantTodos.forEach(function (todoItem) {
        const categoryName = String(todoItem && todoItem.category || "Sonstiges").trim() || "Sonstiges";
        const normalizedCategory = categoryName.toLowerCase();

        if (!Object.prototype.hasOwnProperty.call(groups, normalizedCategory)) {
          groups[normalizedCategory] = {
            name: categoryName,
            color: window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningCategoryColor === "function"
              ? String(window.UnterrichtsassistentApp.getPlanningCategoryColor(categoryName) || "").trim()
              : "",
            items: []
          };
          categoryOrder.push(normalizedCategory);
        }

        groups[normalizedCategory].items.push(todoItem);
      });

      categoryOrder.sort(function (leftKey, rightKey) {
        const leftGroup = groups[leftKey] || { items: [], name: "" };
        const rightGroup = groups[rightKey] || { items: [], name: "" };
        const leftTopScore = getHighestOpenUrgencyScore(leftGroup.items);
        const rightTopScore = getHighestOpenUrgencyScore(rightGroup.items);

        if (rightTopScore !== leftTopScore) {
          return rightTopScore - leftTopScore;
        }

        return String(leftGroup.name || "").localeCompare(String(rightGroup.name || ""), "de", { sensitivity: "base" });
      });

      if (!categoryOrder.length) {
        return [
          '<article class="panel unterricht-layout__live-todos">',
          '<div class="unterricht-live-todos__header">',
          '<h2 class="unterricht-live-todos__title">Offene TODOs</h2>',
          '<div class="unterricht-live-todos__subtitle">', escapeValue(activeClassDisplayName), '</div>',
          '</div>',
          '<p class="empty-message todos-view__empty">Keine offenen TODOs fuer die aktuelle Lerngruppe.</p>',
          '</article>'
        ].join("");
      }

      const orderedGroups = categoryOrder.map(function (groupKey) {
        const group = groups[groupKey];

        return {
          name: group.name,
          color: group.color,
          items: sortTodoItems(group.items),
          sizeUnits: getLiveTodoSectionSizeUnits(group)
        };
      });
      const rows = [];
      const columnSizeLimit = 14;
      const maxColumns = Math.max(1, Math.min(3, orderedGroups.length));
      const topRow = {
        columns: []
      };

      orderedGroups.slice(0, maxColumns).forEach(function (group) {
        topRow.columns.push({
          sizeUnits: group.sizeUnits,
          groups: [group]
        });
      });

      rows.push(topRow);

      orderedGroups.slice(maxColumns).forEach(function (group) {
        const currentRow = rows.length ? rows[rows.length - 1] : null;
        let targetColumn = null;
        let targetRow = currentRow;

        if (currentRow) {
          currentRow.columns.forEach(function (column) {
            if ((column.sizeUnits + group.sizeUnits) > columnSizeLimit) {
              return;
            }

            if (!targetColumn || column.sizeUnits < targetColumn.sizeUnits) {
              targetColumn = column;
            }
          });
        }

        if (!targetColumn) {
          if (currentRow && currentRow.columns.length < maxColumns) {
            targetRow = currentRow;
          } else {
            targetRow = {
              columns: []
            };
            rows.push(targetRow);
          }

          targetColumn = {
            sizeUnits: 0,
            groups: []
          };
          targetRow.columns.push(targetColumn);
        }

        targetColumn.groups.push(group);
        targetColumn.sizeUnits += group.sizeUnits;
      });

      return [
        '<article class="panel unterricht-layout__live-todos">',
        '<div class="unterricht-live-todos__header">',
        '<h2 class="unterricht-live-todos__title">Offene TODOs</h2>',
        '<div class="unterricht-live-todos__subtitle">', escapeValue(activeClassDisplayName), '</div>',
        '</div>',
        '<div class="todos-view__section-rows unterricht-live-todos__rows">',
        rows.map(function (row) {
          return [
            '<div class="todos-view__section-columns todos-view__section-columns--category" style="--todo-category-column-count:', escapeValue(String(Math.max(1, row.columns.length))), ';">',
            row.columns.map(function (column) {
              return [
                '<div class="todos-view__section-column">',
                column.groups.map(function (group) {
                  const isScrollable = group.items.length > 5;
                  const sectionStyle = group.color
                    ? ' style="--todo-category-color:' + escapeValue(group.color) + ';"'
                    : '';

                  return [
                    '<section class="todos-view__section-panel todos-view__section todos-view__section--category unterricht-live-todos__section"', sectionStyle, '>',
                    buildLiveTodoSectionHeader(group.name, group.items.length),
                    '<div class="todos-view__section-body todos-view__section-body--scroll', isScrollable ? ' is-scrollable' : '', '">',
                    group.items.map(buildLiveTodoRow).join(""),
                    '</div>',
                    isScrollable ? '<div class="todos-view__scroll-indicator">Weitere TODOs per Scrollen</div>' : '',
                    '</section>'
                  ].join("");
                }).join(""),
                '</div>'
              ].join("");
            }).join(""),
            '</div>'
          ].join("");
        }).join(""),
        '</div>',
        '</article>'
      ].join("");
    }

    if (viewMode === "live") {
      const liveLessonFlowData = getCurrentAssignedCurriculumLessonFlow();

      return [
        '<div class="unterricht-layout unterricht-layout--live' + (liveLessonFlowData ? ' has-live-flow' : '') + '">',
        renderLiveNotice(),
        '<article class="panel unterricht-layout__seatplan unterricht-layout__seatplan--full">',
        renderLivePhaseControls(liveLessonFlowData),
        renderCompactSeatPlan(),
        '</article>',
        buildLiveCurrentClassTodoPanel(),
        renderLiveLessonFlowPanel(liveLessonFlowData),
        '<div class="import-modal" id="unterrichtWarningOtherModal" hidden>',
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeUnterrichtWarningOtherModal()"></div>',
        '<div class="import-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="unterrichtWarningOtherTitle">',
        '<div class="import-modal__header">',
        '<h3 id="unterrichtWarningOtherTitle">Andere Verwarnung</h3>',
        '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closeUnterrichtWarningOtherModal()">x</button>',
        '</div>',
        '<form class="import-modal__form" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitUnterrichtWarningOtherModal(event)">',
        '<label class="import-modal__field">',
        '<span>Kurztext</span>',
        '<input id="unterrichtWarningOtherInput" type="text" maxlength="120" placeholder="Kurzer Hinweis" autocomplete="off" autocapitalize="none" spellcheck="false">',
        '</label>',
        '<div class="import-modal__actions">',
        '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.closeUnterrichtWarningOtherModal()">Abbrechen</button>',
        '<button class="circle-action" type="submit">OK</button>',
        '</div>',
        '</form>',
        '</div>',
        '</div>',
        '<div class="import-modal" id="unterrichtAssessmentModal" hidden>',
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeUnterrichtAssessmentModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--assessment" role="dialog" aria-modal="true" aria-labelledby="unterrichtAssessmentStudent">',
        '<div class="import-modal__header">',
        '<div>',
        '<h3 id="unterrichtAssessmentStudent">Schueler</h3>',
        '<div class="import-modal__meta" id="unterrichtAssessmentDate"></div>',
        '</div>',
        '<div class="import-modal__icon-actions">',
        '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="submit" form="unterrichtAssessmentForm" aria-label="Bewertung uebernehmen">&#10003;</button>',
        '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Bewertung verwerfen" onclick="return window.UnterrichtsassistentApp.closeUnterrichtAssessmentModal()">&#10005;</button>',
        '</div>',
        '</div>',
        '<form class="import-modal__form" id="unterrichtAssessmentForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitUnterrichtAssessmentModal(event)">',
        '<div class="assessment-columns">',
        '<section class="assessment-column">',
        '<h4 class="assessment-column__title">Leistung</h4>',
        '<div class="import-modal__field">',
        '<span>Kategorie</span>',
        '<div class="assessment-category-buttons" id="unterrichtAssessmentCategoryGroup">',
        '<button class="assessment-category-button" type="button" data-category="beitrag" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentCategory(\'beitrag\')">Beitrag</button>',
        '<button class="assessment-category-button" type="button" data-category="ueberpruefung" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentCategory(\'ueberpruefung\')">Ueberpruefung</button>',
        '<button class="assessment-category-button" type="button" data-category="praesentation" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentCategory(\'praesentation\')">Praesentation</button>',
        '<button class="assessment-category-button" type="button" data-category="abgabe" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentCategory(\'abgabe\')">Abgabe</button>',
        '</div>',
        '<input id="unterrichtAssessmentCategory" type="hidden" value="">',
        '</div>',
        '<div class="import-modal__field">',
        '<span>AFB-Bewertung</span>',
        '<div class="assessment-grid-chart" id="unterrichtAssessmentGrid" onpointerdown="return window.UnterrichtsassistentApp.startUnterrichtAssessmentGridPointer(event)" onpointermove="return window.UnterrichtsassistentApp.handleUnterrichtAssessmentGridPointerMove(event)" onpointerup="return window.UnterrichtsassistentApp.handleUnterrichtAssessmentGridPointerUp(event)" onpointercancel="return window.UnterrichtsassistentApp.handleUnterrichtAssessmentGridPointerUp(event)">',
        '<svg class="assessment-grid-chart__svg" id="unterrichtAssessmentGridSvg" viewBox="0 0 360 260" role="img" aria-label="AFB Bewertungsraster"></svg>',
        '</div>',
        '<div class="assessment-grid-chart__hint">Klick oder Drag ueber das Raster</div>',
        '<input id="unterrichtAssessmentAfb1" type="hidden" value="">',
        '<input id="unterrichtAssessmentAfb2" type="hidden" value="">',
        '<input id="unterrichtAssessmentAfb3" type="hidden" value="">',
        '</div>',
        '</section>',
        '<section class="assessment-column">',
        '<h4 class="assessment-column__title">Verhalten</h4>',
        '<div class="assessment-behavior-grid">',
        '<div class="import-modal__field">',
        '<span>AV</span>',
        '<div class="assessment-grade-buttons assessment-grade-buttons--vertical">',
        '<button class="assessment-grade-button" type="button" data-target="work" data-value="a" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentGrade(\'work\', \'a\')">a</button>',
        '<button class="assessment-grade-button" type="button" data-target="work" data-value="b" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentGrade(\'work\', \'b\')">b</button>',
        '<button class="assessment-grade-button" type="button" data-target="work" data-value="c" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentGrade(\'work\', \'c\')">c</button>',
        '<button class="assessment-grade-button" type="button" data-target="work" data-value="d" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentGrade(\'work\', \'d\')">d</button>',
        '</div>',
        '<input id="unterrichtAssessmentWorkBehavior" type="hidden" value="">',
        '</div>',
        '<div class="import-modal__field">',
        '<span>SV</span>',
        '<div class="assessment-grade-buttons assessment-grade-buttons--vertical">',
        '<button class="assessment-grade-button" type="button" data-target="social" data-value="a" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentGrade(\'social\', \'a\')">a</button>',
        '<button class="assessment-grade-button" type="button" data-target="social" data-value="b" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentGrade(\'social\', \'b\')">b</button>',
        '<button class="assessment-grade-button" type="button" data-target="social" data-value="c" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentGrade(\'social\', \'c\')">c</button>',
        '<button class="assessment-grade-button" type="button" data-target="social" data-value="d" onclick="return window.UnterrichtsassistentApp.toggleUnterrichtAssessmentGrade(\'social\', \'d\')">d</button>',
        '</div>',
        '<input id="unterrichtAssessmentSocialBehavior" type="hidden" value="">',
        '</div>',
        '</div>',
        '</section>',
        '<section class="assessment-column">',
        '<h4 class="assessment-column__title">Fachwissen</h4>',
        '<label class="import-modal__field import-modal__field--knowledge-gap">',
        '<span>Wissensluecke</span>',
        '<input id="unterrichtAssessmentKnowledgeGap" type="text" maxlength="180" placeholder="Diagnostizierte Wissensluecke" autocomplete="off" autocapitalize="none" spellcheck="false" onfocus="return window.UnterrichtsassistentApp.handleKnowledgeGapInputFocus(\'unterrichtAssessmentKnowledgeGap\', \'unterrichtAssessmentKnowledgeGapSuggestions\')" oninput="return window.UnterrichtsassistentApp.handleKnowledgeGapInput(event, \'unterrichtAssessmentKnowledgeGapSuggestions\')" onblur="return window.UnterrichtsassistentApp.handleKnowledgeGapInputBlur(\'unterrichtAssessmentKnowledgeGapSuggestions\')">',
        '<div class="knowledge-gap-suggestions" id="unterrichtAssessmentKnowledgeGapSuggestions" hidden onpointerdown="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerDown(event, \'unterrichtAssessmentKnowledgeGapSuggestions\')" onpointermove="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerMove(event, \'unterrichtAssessmentKnowledgeGapSuggestions\')" onpointerup="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerUp(event, \'unterrichtAssessmentKnowledgeGapSuggestions\')" onpointercancel="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerUp(event, \'unterrichtAssessmentKnowledgeGapSuggestions\')"></div>',
        '</label>',
        '<label class="import-modal__field">',
        '<span>Notiz</span>',
        '<input id="unterrichtAssessmentNote" type="text" maxlength="240" placeholder="Freie Notiz zur Bewertung" autocomplete="off" autocapitalize="none" spellcheck="false">',
        '</label>',
        '</section>',
        '</div>',
        '</form>',
        '</div>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="unterricht-layout">',
      '<article class="panel unterricht-layout__seatplan unterricht-layout__seatplan--full">',
      renderCompactSeatPlan(),
      '</article>',
      '<article class="panel unterricht-layout__content">',
      '<div class="seat-plan-placeholder">', escapeValue(viewMode === "nachpflege" ? "Nachpflege folgt als naechstes." : (viewMode === "analyse" ? "Analyse folgt als naechstes." : "Live-Unterrichtsbereich folgt als naechstes.")), '</div>',
      '</article>',
      '</div>'
    ].join("");
  }
};

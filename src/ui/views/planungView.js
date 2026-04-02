window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.planung = {
  id: "planung",
  title: "Planung",
  render: function (service) {
    const planningViewMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningViewMode === "function"
      ? window.UnterrichtsassistentApp.getPlanningViewMode()
      : "jahresplanung";
    const isPlanningAdminMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isPlanningAdminMode === "function"
      ? window.UnterrichtsassistentApp.isPlanningAdminMode()
      : false;
    const planningEventDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActivePlanningEventDraft === "function"
      ? window.UnterrichtsassistentApp.getActivePlanningEventDraft()
      : null;
    const planningEventControlledByLabel = planningEventDraft && planningEventDraft.isExternallyControlled
      ? String(planningEventDraft.controlledByView || "").trim() || "anderen Bereich"
      : "";
    const planningInstructionLessonDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActivePlanningInstructionLessonDraft === "function"
      ? window.UnterrichtsassistentApp.getActivePlanningInstructionLessonDraft()
      : null;
    const curriculumSeriesDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveCurriculumSeriesDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveCurriculumSeriesDraft()
      : null;
    const curriculumSequenceDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveCurriculumSequenceDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveCurriculumSequenceDraft()
      : null;
    const curriculumLessonDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveCurriculumLessonDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveCurriculumLessonDraft()
      : null;
    const activeCurriculumLessonFlowLessonId = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveCurriculumLessonFlowLessonId === "function"
      ? String(window.UnterrichtsassistentApp.getActiveCurriculumLessonFlowLessonId() || "").trim()
      : "";
    const activeCurriculumLessonFlowViewPhaseIds = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveCurriculumLessonFlowViewPhaseIds === "function"
      ? window.UnterrichtsassistentApp.getActiveCurriculumLessonFlowViewPhaseIds().map(function (entry) {
          return String(entry || "").trim();
        }).filter(Boolean)
      : [];
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
    const activeCurriculumSeriesDropIndicator = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveCurriculumSeriesDropIndicator === "function"
      ? window.UnterrichtsassistentApp.getActiveCurriculumSeriesDropIndicator()
      : null;
    const activeCurriculumSequenceDropIndicator = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveCurriculumSequenceDropIndicator === "function"
      ? window.UnterrichtsassistentApp.getActiveCurriculumSequenceDropIndicator()
      : null;
    const activeCurriculumLessonDropIndicator = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveCurriculumLessonDropIndicator === "function"
      ? window.UnterrichtsassistentApp.getActiveCurriculumLessonDropIndicator()
      : null;
    const planningRangeDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActivePlanningRangeDraft === "function"
      ? window.UnterrichtsassistentApp.getActivePlanningRangeDraft()
      : null;
    const snapshot = service && service.snapshot ? service.snapshot : {};
    const referenceDate = service && typeof service.getReferenceDate === "function"
      ? service.getReferenceDate()
      : null;
    const schoolYearStart = String(snapshot.schoolYearStart || "").slice(0, 10);
    const schoolHalfYearStart = String(snapshot.schoolHalfYearStart || "").slice(0, 10);
    const schoolYearEnd = String(snapshot.schoolYearEnd || "").slice(0, 10);
    const hidePastPlanningMonths = snapshot.hidePastPlanningMonths !== false;
    const planningEvents = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningEventsForDisplay === "function"
      ? window.UnterrichtsassistentApp.getPlanningEventsForDisplay(snapshot, {
          rangeStart: schoolYearStart,
          rangeEnd: schoolYearEnd
        })
      : (Array.isArray(snapshot.planningEvents) ? snapshot.planningEvents : []);
    const selectedSidebarFilters = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningSidebarCategoryFilters === "function"
      ? window.UnterrichtsassistentApp.getPlanningSidebarCategoryFilters()
      : [];
    const isSidebarFilterOpen = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isPlanningSidebarFilterOpen === "function"
      ? window.UnterrichtsassistentApp.isPlanningSidebarFilterOpen()
      : false;
    const isSidebarFilterAllOff = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isPlanningSidebarFilterAllOff === "function"
      ? window.UnterrichtsassistentApp.isPlanningSidebarFilterAllOff()
      : false;
    const normalizedSelectedSidebarFilters = selectedSidebarFilters.map(function (entry) {
      return String(entry || "").trim().toLowerCase();
    });
    const selectedPlanningEventState = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSelectedPlanningEventState === "function"
      ? window.UnterrichtsassistentApp.getSelectedPlanningEventState()
      : {
          eventId: window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSelectedPlanningEventId === "function"
            ? window.UnterrichtsassistentApp.getSelectedPlanningEventId()
            : "",
          occurrenceId: "",
          startDate: "",
          endDate: ""
        };
    const selectedPlanningEventId = String(selectedPlanningEventState && selectedPlanningEventState.eventId || "").trim();
    const selectedPlanningEventOccurrenceId = String(selectedPlanningEventState && selectedPlanningEventState.occurrenceId || "").trim();
    const planningEventRecurrenceUnit = planningEventDraft
      ? String(planningEventDraft.recurrenceUnit || "weeks").trim().toLowerCase()
      : "";
    const isPlanningEventRecurring = Boolean(planningEventDraft && planningEventDraft.isRecurring);
    const showMonthlyWeekdayOption = planningEventRecurrenceUnit === "months";

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

    function formatMonthLabel(date) {
      return date.toLocaleDateString("de-DE", {
        month: "long",
        year: "numeric"
      });
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

    function formatTimeRange(eventItem) {
      const startTime = String(eventItem && eventItem.startTime || "").trim();
      const endTime = String(eventItem && eventItem.endTime || "").trim();

      if (startTime && endTime) {
        return startTime + " - " + endTime;
      }

      if (startTime) {
        return "ab " + startTime;
      }

      if (endTime) {
        return "bis " + endTime;
      }

      return "";
    }

    function toIsoDate(date) {
      return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("-");
    }

    function getEventSortKey(eventItem) {
      const startDateValue = String(eventItem && eventItem.startDate || "").slice(0, 10);
      const startTimeValue = String(eventItem && eventItem.startTime || "").trim() || "00:00";
      const endDateValue = String(eventItem && eventItem.endDate || startDateValue).slice(0, 10);
      const endTimeValue = String(eventItem && eventItem.endTime || "").trim() || "23:59";

      return [startDateValue, startTimeValue, endDateValue, endTimeValue].join("|");
    }

    function isEventExpired(eventItem, activeDate) {
      const startDateValue = String(eventItem && eventItem.startDate || "").slice(0, 10);
      const endDateValue = String(eventItem && eventItem.endDate || startDateValue).slice(0, 10);
      const endDate = parseLocalDate(endDateValue);
      const endTimeValue = String(eventItem && eventItem.endTime || "").trim();
      let endMoment;

      if (!activeDate || !endDate) {
        return false;
      }

      if (!endTimeValue) {
        return endDateValue < toIsoDate(activeDate);
      }

      endMoment = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        Number(endTimeValue.slice(0, 2)) || 0,
        Number(endTimeValue.slice(3, 5)) || 0,
        59,
        999
      );

      return endMoment < activeDate;
    }

    function buildEventDateLabel(eventItem) {
      const startDateValue = String(eventItem && eventItem.startDate || "").slice(0, 10);
      const endDateValue = String(eventItem && eventItem.endDate || startDateValue).slice(0, 10);

      if (!startDateValue) {
        return "";
      }

      if (endDateValue && endDateValue !== startDateValue) {
        return formatDateLabel(startDateValue) + " - " + formatDateLabel(endDateValue);
      }

      return formatDateLabel(startDateValue);
    }

    function getCategoryColor(categoryName) {
      return window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningCategoryColor === "function"
        ? window.UnterrichtsassistentApp.getPlanningCategoryColor(categoryName)
        : "#d9d4cb";
    }

    function getEventCategoryName(eventItem) {
      const categoryValue = String(eventItem && eventItem.category || "").trim();
      return categoryValue || "Sonstiges";
    }

    function getCategoryDefinitions() {
      return window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningCategoryDefinitions === "function"
        ? window.UnterrichtsassistentApp.getPlanningCategoryDefinitions()
        : [];
    }

    function getCategoryDefinition(categoryName) {
      const normalizedName = String(categoryName || "").trim().toLowerCase();

      return getCategoryDefinitions().find(function (entry) {
        return String(entry && entry.name || "").trim().toLowerCase() === normalizedName;
      }) || null;
    }

    function buildEventMarker(eventItem) {
      const categoryName = getEventCategoryName(eventItem);
      const categoryDefinition = getCategoryDefinition(categoryName);
      const markerClassName = categoryDefinition && categoryDefinition.isClassCategory && !categoryDefinition.isSystemCategory
        ? "planning-year__dot planning-year__dot--class"
        : "planning-year__dot planning-year__dot--other";
      const priorityClassName = " planning-year__dot--priority-" + ([1, 2, 3].indexOf(Number(eventItem && eventItem.priority)) >= 0 ? Number(eventItem.priority) : 3);

      return '<span class="' + markerClassName + priorityClassName + '" style="--planning-dot:' + escapeValue(getCategoryColor(categoryName)) + '"></span>';
    }

    function buildCategoryManagementList() {
      const categoryDefinitions = getCategoryDefinitions();

      return [
        '<div class="planning-category-admin">',
        '<div class="planning-category-admin__header"><span>Kategorie</span><span>Farbe</span><span></span></div>',
        categoryDefinitions.map(function (entry) {
          const name = String(entry && entry.name || "").trim();
          const color = getCategoryColor(name);
          const isClassCategory = Boolean(entry && entry.isClassCategory);
          const isSystemCategory = Boolean(entry && entry.isSystemCategory);
          const isStandardCategory = isClassCategory || isSystemCategory;

            return [
            '<div class="planning-category-admin__row">',
            '<span class="planning-category-admin__name">', escapeValue(name), isSystemCategory ? ' <span class="planning-category-admin__badge">System</span>' : (isClassCategory ? ' <span class="planning-category-admin__badge">Lerngruppe</span>' : ''), '</span>',
            '<label class="planning-category-admin__swatch' + (isStandardCategory ? ' is-locked' : '') + '" style="--planning-category-color:' + escapeValue(color) + ';"' + (isStandardCategory ? ' title="Diese Standardkategorie ist geschuetzt."' : ' title="Farbe aendern"') + '>',
            '<input class="planning-category-admin__color" type="color" value="', escapeValue(color), '"',
            isStandardCategory ? ' disabled' : ' onchange="return window.UnterrichtsassistentApp.updatePlanningCategoryColor(\'' + escapeValue(name) + '\', this.value)"',
            '>',
            '</label>',
            isStandardCategory
              ? '<span class="planning-category-admin__lock" aria-hidden="true" title="Standardkategorie ist geschuetzt">&#128274;</span>'
              : '<button class="row-delete-button row-delete-button--small" type="button" aria-label="Kategorie loeschen" onclick="return window.UnterrichtsassistentApp.deletePlanningCategory(\'' + escapeValue(name) + '\')">Loeschen</button>',
            '</div>'
          ].join("");
        }).join(""),
        '<div class="planning-category-admin__row planning-category-admin__row--add">',
        '<input id="planningCategoryCreateInput" class="planning-category-admin__input" type="text" placeholder="Neue Kategorie" autocomplete="off" autocapitalize="none" spellcheck="false">',
        '<span class="planning-category-admin__swatch planning-category-admin__swatch--empty" aria-hidden="true"></span>',
        '<button class="planning-category-admin__add" type="button" aria-label="Kategorie hinzufuegen" onclick="return window.UnterrichtsassistentApp.addPlanningCategory(\'planningCategoryCreateInput\')">+</button>',
        '</div>',
        '</div>'
      ].join("");
    }

    function buildUpcomingEvents(activeDate) {
      return planningEvents
        .filter(function (eventItem) {
          return eventItem && String(eventItem.startDate || "").trim() && !isEventExpired(eventItem, activeDate);
        })
        .slice()
        .sort(function (left, right) {
          return getEventSortKey(left).localeCompare(getEventSortKey(right));
        });
    }

    function buildSidebarEventList(activeDate) {
      const upcomingEvents = buildUpcomingEvents(activeDate);
      const addDateValue = activeDate ? toIsoDate(activeDate) : "";
      const availableCategories = {};
      const filteredEvents = upcomingEvents.filter(function (eventItem) {
        const category = getEventCategoryName(eventItem);
        const normalizedCategory = category.toLowerCase();

        if (category) {
          availableCategories[normalizedCategory] = category;
        }

        return doesEventMatchSidebarFilters(eventItem);
      });
      const availableCategoryList = Object.keys(availableCategories).map(function (key) {
        return availableCategories[key];
      }).sort(function (left, right) {
        return String(left || "").localeCompare(String(right || ""), "de", { sensitivity: "base" });
      });

      return [
        '<div class="planning-sidebar__filters">',
        '<button class="planning-sidebar__filter-toggle' + (isSidebarFilterOpen ? ' is-open' : '') + '" type="button" onclick="return window.UnterrichtsassistentApp.togglePlanningSidebarFilter()">',
        '<span>Kategorien filtern</span>',
        '<span class="planning-sidebar__filter-meta">' + (isSidebarFilterAllOff ? '0' : (selectedSidebarFilters.length ? escapeValue(String(selectedSidebarFilters.length)) : 'Alle')) + '</span>',
        '</button>',
        isSidebarFilterOpen ? [
          '<div class="planning-sidebar__filter-menu">',
          availableCategoryList.length ? availableCategoryList.map(function (categoryName) {
            const isSelected = normalizedSelectedSidebarFilters.indexOf(String(categoryName || "").trim().toLowerCase()) >= 0;
            return [
              '<label class="planning-sidebar__filter-option">',
              '<input type="checkbox" ', isSelected ? 'checked ' : '', 'onchange="return window.UnterrichtsassistentApp.togglePlanningSidebarCategoryFilter(\'', escapeValue(categoryName), '\')">',
              '<span>', escapeValue(categoryName), '</span>',
              '</label>'
            ].join("");
          }).join("") : '<p class="empty-message">Keine Kategorien vorhanden.</p>',
          '<div class="planning-sidebar__filter-actions">',
          '<button class="planning-sidebar__filter-clear" type="button" onclick="return window.UnterrichtsassistentApp.clearPlanningSidebarCategoryFilters()">Filter zuruecksetzen</button>',
          '<button class="planning-sidebar__filter-clear" type="button" onclick="return window.UnterrichtsassistentApp.clearAllPlanningSidebarCategoryFilters()">Alle aus</button>',
          '</div>',
          '</div>'
        ].join("") : '',
        '</div>',
        [
          '<div class="planning-sidebar__table">',
          filteredEvents.length
            ? filteredEvents.map(function (eventItem) {
                const title = String(eventItem.title || "").trim();
                const category = getEventCategoryName(eventItem);
                const timeLabel = formatTimeRange(eventItem);
                const summary = title || "Termin";
                const isSelected = selectedPlanningEventOccurrenceId
                  ? String(eventItem.occurrenceId || "").trim() === selectedPlanningEventOccurrenceId
                  : String(eventItem.id || "").trim() === selectedPlanningEventId;
                const isExternallyControlled = Boolean(eventItem && eventItem.isExternallyControlled);

                return [
                  '<div class="planning-sidebar__event-row">',
                  '<button class="planning-sidebar__event', isSelected ? ' is-selected' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.selectPlanningEvent(\'', escapeValue(String(eventItem.id || "")), '\', \'', escapeValue(String(eventItem.occurrenceId || "")), '\', \'', escapeValue(String(eventItem.startDate || "")), '\', \'', escapeValue(String(eventItem.endDate || "")), '\')">',
                  '<span class="planning-sidebar__event-date">', escapeValue(buildEventDateLabel(eventItem)), '</span>',
                  '<span class="planning-sidebar__event-main"><span class="planning-sidebar__event-marker">', buildEventMarker(eventItem), '</span><span class="planning-sidebar__event-title">', escapeValue(summary), '</span></span>',
                  category ? '<span class="planning-sidebar__event-category">' + escapeValue(category) + '</span>' : '',
                  timeLabel ? '<span class="planning-sidebar__event-time">' + escapeValue(timeLabel) + '</span>' : '',
                  '</button>',
                  '<div class="planning-sidebar__event-actions">',
                  '<button class="planning-sidebar__edit" type="button" aria-label="Termin bearbeiten" onclick="return window.UnterrichtsassistentApp.openPlanningEventModal(\'\', \'', escapeValue(String(eventItem.id || "")), '\')">&#9998;</button>',
                  '<button class="planning-sidebar__delete" type="button" aria-label="Termin loeschen" onclick="return window.UnterrichtsassistentApp.deletePlanningEvent(\'', escapeValue(String(eventItem.id || "")), '\')"', isExternallyControlled ? ' disabled' : '', '>&#10005;</button>',
                  '</div>',
                  '</div>'
                ].join("");
              }).join("")
            : '<div class="planning-sidebar__placeholder"></div>',
          '<button class="planning-sidebar__add-row" type="button" aria-label="Termin hinzufuegen" onclick="return window.UnterrichtsassistentApp.openPlanningEventModal(\'', escapeValue(addDateValue), '\')">+</button>',
          '</div>'
        ].join("")
      ].join("");
    }

    function doesEventMatchSidebarFilters(eventItem) {
      const normalizedCategory = getEventCategoryName(eventItem).toLowerCase();

      if (!normalizedSelectedSidebarFilters.length && !isSidebarFilterAllOff) {
        return true;
      }

      return normalizedSelectedSidebarFilters.indexOf(normalizedCategory) >= 0;
    }

    function getEventsForDate(isoDate) {
      return planningEvents.filter(function (eventItem) {
        const startDateValue = String(eventItem && eventItem.startDate || "").slice(0, 10);
        const endDateValue = String(eventItem && eventItem.endDate || startDateValue).slice(0, 10);

        return startDateValue && startDateValue <= isoDate && isoDate <= endDateValue;
      }).sort(function (left, right) {
        return getEventSortKey(left).localeCompare(getEventSortKey(right));
      });
    }

    function buildDayDots(isoDate) {
      const dayEvents = getEventsForDate(isoDate).filter(function (eventItem) {
        return getEventCategoryName(eventItem).toLowerCase() !== "unterrichtsfrei"
          && doesEventMatchSidebarFilters(eventItem);
      }).slice().sort(function (leftItem, rightItem) {
        const leftPriority = [1, 2, 3].indexOf(Number(leftItem && leftItem.priority)) >= 0 ? Number(leftItem.priority) : 2;
        const rightPriority = [1, 2, 3].indexOf(Number(rightItem && rightItem.priority)) >= 0 ? Number(rightItem.priority) : 2;

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        return getEventSortKey(leftItem).localeCompare(getEventSortKey(rightItem));
      });
      const maxVisibleDots = 6;
      const visibleEvents = dayEvents.slice(0, maxVisibleDots);
      const hiddenCount = Math.max(0, dayEvents.length - visibleEvents.length);

      if (!dayEvents.length) {
        return '<span class="planning-year__dots"></span>';
      }

      return [
        '<span class="planning-year__dots">',
        visibleEvents.map(function (eventItem) {
          return buildEventMarker(eventItem);
        }).join(""),
        '</span>'
      ].join("") + (
        hiddenCount
          ? '<span class="planning-year__dot-count">+' + escapeValue(String(hiddenCount)) + '</span>'
          : ""
      );
    }

    function isInstructionFreeDate(isoDate) {
      return getEventsForDate(isoDate).some(function (eventItem) {
        return getEventCategoryName(eventItem).toLowerCase() === "unterrichtsfrei";
      });
    }

    function buildMonthCards(startDate, endDate, activeDate) {
      const cards = [];
      const firstVisibleMonth = hidePastPlanningMonths && activeDate && activeDate > startDate
        ? new Date(activeDate.getFullYear(), activeDate.getMonth(), 1)
        : new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const cursor = new Date(firstVisibleMonth.getFullYear(), firstVisibleMonth.getMonth(), 1);
      const lastMonthDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
      const activeDateIso = activeDate ? toIsoDate(activeDate) : "";
      const selectedPlanningEvent = selectedPlanningEventOccurrenceId
        ? planningEvents.find(function (eventItem) {
            return String(eventItem && eventItem.occurrenceId || "").trim() === selectedPlanningEventOccurrenceId;
          }) || null
        : (selectedPlanningEventId
          ? planningEvents.find(function (eventItem) {
              return String(eventItem && eventItem.id || "").trim() === selectedPlanningEventId;
            }) || null
          : null);
      const selectedEventStart = selectedPlanningEvent
        ? String(selectedPlanningEvent.startDate || "").slice(0, 10)
        : String(selectedPlanningEventState && selectedPlanningEventState.startDate || "").slice(0, 10);
      const selectedEventEnd = selectedPlanningEvent
        ? String(selectedPlanningEvent.endDate || selectedEventStart).slice(0, 10)
        : String(selectedPlanningEventState && selectedPlanningEventState.endDate || selectedEventStart).slice(0, 10);
      while (cursor <= lastMonthDate) {
        const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
        const firstVisible = monthStart < startDate ? startDate : monthStart;
        const lastVisible = monthEnd > endDate ? endDate : monthEnd;
        const leadingBlankCount = (monthStart.getDay() + 6) % 7;
        const totalDays = monthEnd.getDate();
        const cells = [];
        let dayIndex;

        for (dayIndex = 0; dayIndex < leadingBlankCount; dayIndex += 1) {
          cells.push('<span class="planning-year__day planning-year__day--empty" aria-hidden="true"></span>');
        }

        for (dayIndex = 1; dayIndex <= totalDays; dayIndex += 1) {
          const currentDate = new Date(cursor.getFullYear(), cursor.getMonth(), dayIndex);
          const isoDate = toIsoDate(currentDate);
          const isOutsideRange = currentDate < firstVisible || currentDate > lastVisible;
          const weekdayIndex = (currentDate.getDay() + 6) % 7;
          const isWeekend = weekdayIndex >= 5;
          const isToday = !isOutsideRange && activeDateIso && isoDate === activeDateIso;
          const isPast = !isOutsideRange && activeDateIso && isoDate < activeDateIso;
          const isInstructionFree = !isOutsideRange && isInstructionFreeDate(isoDate);
          const isInRangePreview = !isOutsideRange && planningRangeDraft && planningRangeDraft.startDate && planningRangeDraft.endDate && (function () {
            const start = String(planningRangeDraft.startDate || "");
            const end = String(planningRangeDraft.endDate || "");
            return start <= end ? (isoDate >= start && isoDate <= end) : (isoDate >= end && isoDate <= start);
          }());
          let dayClassName = "planning-year__day";

          if (isOutsideRange) {
            dayClassName += " planning-year__day--empty";
          } else {
            if (isWeekend) {
              dayClassName += " planning-year__day--weekend";
            }
            if (isInstructionFree) {
              dayClassName += " planning-year__day--unterrichtsfrei";
            }
            if (isPast) {
              dayClassName += " planning-year__day--past";
            }
            if (isToday) {
              dayClassName += " planning-year__day--today";
            }
            if (selectedEventStart && selectedEventEnd && isoDate >= selectedEventStart && isoDate <= selectedEventEnd) {
              dayClassName += " planning-year__day--selected-event";
            }
            if (isInRangePreview) {
              dayClassName += " planning-year__day--range-preview";
            }
          }

          cells.push(
            '<button class="' + dayClassName + '" type="button" data-date="' + escapeValue(isoDate) + '"' + (isOutsideRange ? ' disabled' : ' onpointerdown="return window.UnterrichtsassistentApp.beginPlanningRangeSelection(event, \'' + escapeValue(isoDate) + '\')" onpointerenter="return window.UnterrichtsassistentApp.updatePlanningRangeSelection(event, \'' + escapeValue(isoDate) + '\')" onpointermove="return window.UnterrichtsassistentApp.updatePlanningRangeSelection(event, \'' + escapeValue(isoDate) + '\')" onpointerup="return window.UnterrichtsassistentApp.endPlanningRangeSelection(event, \'' + escapeValue(isoDate) + '\')" onpointercancel="return window.UnterrichtsassistentApp.cancelPlanningRangeSelection()" onclick="return window.UnterrichtsassistentApp.openPlanningEventModal(\'' + escapeValue(isoDate) + '\')"' ) + '>' +
              (isOutsideRange
                ? ""
                : '<span class="planning-year__day-number">' + escapeValue(String(dayIndex)) + "</span>" + buildDayDots(isoDate)) +
            "</button>"
          );
        }

        cards.push(
          '<article class="planning-year__month">' +
            '<h2 class="planning-year__month-title">' + escapeValue(formatMonthLabel(cursor)) + '</h2>' +
            '<div class="planning-year__weekday-row">' +
              weekdayLabels.map(function (label, weekdayIndex) {
                return '<span class="planning-year__weekday' + (weekdayIndex >= 5 ? ' planning-year__weekday--weekend' : '') + '">' + escapeValue(label) + "</span>";
              }).join("") +
            '</div>' +
            '<div class="planning-year__month-grid">' + cells.join("") + "</div>" +
          "</article>"
        );

        cursor.setMonth(cursor.getMonth() + 1, 1);
      }

      return cards.join("");
    }

    function buildAdminContent(messageHtml) {
      return [
        '<div class="planning-year__settings">',
        '<label class="schedule-toolbar__field">',
        '<span>Erster Schultag</span>',
        '<input class="student-table__input schedule-toolbar__time" type="date" value="', escapeValue(schoolYearStart), '" onchange="return window.UnterrichtsassistentApp.updatePlanningSchoolYearField(\'schoolYearStart\', this.value)">',
        '</label>',
        '<label class="schedule-toolbar__field">',
        '<span>Beginn neues Halbjahr</span>',
        '<input class="student-table__input schedule-toolbar__time" type="date" value="', escapeValue(schoolHalfYearStart), '" onchange="return window.UnterrichtsassistentApp.updatePlanningSchoolYearField(\'schoolHalfYearStart\', this.value)">',
        '</label>',
        '<label class="schedule-toolbar__field">',
        '<span>Letzter Schultag</span>',
        '<input class="student-table__input schedule-toolbar__time" type="date" value="', escapeValue(schoolYearEnd), '" onchange="return window.UnterrichtsassistentApp.updatePlanningSchoolYearField(\'schoolYearEnd\', this.value)">',
        '</label>',
        '<label class="schedule-toolbar__field planning-year__settings-checkbox">',
        '<span>Vergangene Monate ausblenden</span>',
        '<input type="checkbox" ', hidePastPlanningMonths ? 'checked ' : '', 'onchange="return window.UnterrichtsassistentApp.updatePlanningHidePastMonths(this.checked)">',
        '</label>',
        '</div>',
        messageHtml || "",
        '<section class="planning-category-admin__panel">',
        '<h2 class="planning-category-admin__title">Kategorien</h2>',
        buildCategoryManagementList(),
        '</section>'
      ].join("");
    }

    if ((!schoolYearStart || !schoolYearEnd) && planningViewMode === "jahresplanung") {
      return [
        '<div class="panel-grid panel-grid--planung">',
        '<article class="panel panel--full">',
        isPlanningAdminMode
          ? buildAdminContent('<p class="empty-message">Lege zuerst den ersten und letzten Tag des Schuljahres fest.</p>')
          : '<p class="empty-message">Im Adminmodus kannst du den ersten und letzten Tag des Schuljahres festlegen.</p>',
        '</article>',
        '</div>'
      ].join("");
    }

    const startDate = parseLocalDate(schoolYearStart);
    const endDate = parseLocalDate(schoolYearEnd);
    const activePlanningDate = referenceDate && !Number.isNaN(referenceDate.getTime())
      ? new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), referenceDate.getHours(), referenceDate.getMinutes(), referenceDate.getSeconds(), referenceDate.getMilliseconds())
      : null;
    const activeClass = service && typeof service.getActiveClass === "function"
      ? service.getActiveClass()
      : null;
    const isPlanningAvailableLessonsExpanded = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isPlanningAvailableLessonsExpanded === "function"
      ? window.UnterrichtsassistentApp.isPlanningAvailableLessonsExpanded()
      : true;

    function getClassDisplayColor(schoolClass) {
      return window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getClassDisplayColor === "function"
        ? window.UnterrichtsassistentApp.getClassDisplayColor(schoolClass)
        : "#d9d4cb";
    }

    function getClassDisplayName(schoolClass) {
      return schoolClass
        ? [schoolClass.name || "", schoolClass.subject || ""].join(" ").trim()
        : "";
    }

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

      if (!activeClass || !cursor || !lastDate || !service || typeof service.getLessonUnitsForClass !== "function") {
        return [];
      }

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

    function formatInstructionSeriesRange(startValue, endValue) {
      if (!startValue) {
        return "";
      }

      if (!endValue || startValue === endValue) {
        return formatShortDateLabel(startValue);
      }

      return formatShortDateLabel(startValue) + " - " + formatShortDateLabel(endValue);
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
        const assignmentColors = [];
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
          assignmentColors: assignmentColors,
          assignmentSequenceIds: assignmentSequenceIds,
          assignmentSeriesIds: assignmentSeriesIds,
          assignmentLessonIds: assignmentLessonIds
        };

        while (slotIndex < (isCancelled ? 0 : totalUnits)) {
          lessonSlots.push({
            occurrenceId: occurrenceId,
            lessonDate: String(occurrence && occurrence.lessonDate || "").trim(),
            assignedSeriesId: "",
            assignedColor: ""
          });
          slotIndex += 1;
        }
      });

      orderedSeries.forEach(function (seriesItem) {
        const seriesId = String(seriesItem && seriesItem.id || "").trim();
        const startMode = String(seriesItem && seriesItem.startMode || "").trim() === "manual" ? "manual" : "automatic";
        const manualStartDate = String(seriesItem && seriesItem.startDate || "").slice(0, 10);
        const hourDemand = Math.max(0, Number(seriesItem && seriesItem.hourDemand) || 0);
        const seriesColor = String(seriesItem && seriesItem.color || "#d9d4cb");
        let remainingDemand = hourDemand;
        const earliestAllowedSlotIndex = previousSeriesLastAssignedSlotIndex + 1;
        let startIndex = -1;
        let cursorIndex;
        let lastAssignedSlotIndex = -1;

        seriesAssignments[seriesId] = {
          firstDate: "",
          lastDate: "",
          assignedUnitCount: 0,
          color: seriesColor
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
            slot.assignedColor = seriesColor;
            occurrenceEntry.assignmentColors.push(seriesColor);
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

      orderedSeries.forEach(function (seriesItem) {
        const seriesId = String(seriesItem && seriesItem.id || "").trim();
        const manualHourDemand = Math.max(0, Number(seriesItem && seriesItem.hourDemand) || 0);
        const assignedUnitCount = seriesAssignments[seriesId]
          ? Math.max(0, Number(seriesAssignments[seriesId].assignedUnitCount) || 0)
          : 0;

        if (seriesAssignments[seriesId]) {
          seriesAssignments[seriesId].hasUnassignedDemand = manualHourDemand > assignedUnitCount;
          seriesAssignments[seriesId].unassignedDemand = Math.max(0, manualHourDemand - assignedUnitCount);
          if (seriesAssignments[seriesId].hasUnassignedDemand) {
            seriesAssignments[seriesId].hasWarning = true;
          }
        }
      });

      Object.keys(occurrenceLookup).forEach(function (occurrenceId) {
        const occurrenceEntry = occurrenceLookup[occurrenceId];
        const totalUnits = occurrenceEntry ? Math.max(1, Number(occurrenceEntry.totalUnits) || 1) : 1;
        const uniqueSeriesIds = occurrenceEntry && Array.isArray(occurrenceEntry.assignmentSeriesIds)
          ? occurrenceEntry.assignmentSeriesIds.filter(Boolean).filter(function (seriesId, index, source) {
              return source.indexOf(seriesId) === index;
            })
          : [];
        const uniqueSequenceIds = occurrenceEntry && Array.isArray(occurrenceEntry.assignmentSequenceIds)
          ? occurrenceEntry.assignmentSequenceIds.filter(Boolean).filter(function (sequenceId, index, source) {
              return source.indexOf(sequenceId) === index;
            })
          : [];
        const uniqueLessonIds = occurrenceEntry && Array.isArray(occurrenceEntry.assignmentLessonIds)
          ? occurrenceEntry.assignmentLessonIds.filter(Boolean).filter(function (lessonId, index, source) {
              return source.indexOf(lessonId) === index;
            })
          : [];

        if (!occurrenceEntry || totalUnits < 2) {
          return;
        }

        if (uniqueSeriesIds.length > 1) {
          uniqueSeriesIds.forEach(function (seriesId) {
            if (seriesAssignments[seriesId]) {
              seriesAssignments[seriesId].hasWarning = true;
            }
          });
        }

        if (uniqueSequenceIds.length > 1) {
          uniqueSequenceIds.forEach(function (sequenceId) {
            if (sequenceAssignments[sequenceId]) {
              sequenceAssignments[sequenceId].hasWarning = true;
            }
          });
        }

        if (uniqueLessonIds.length > 1) {
          uniqueLessonIds.forEach(function (lessonId) {
            if (lessonPlanAssignments[lessonId]) {
              lessonPlanAssignments[lessonId].hasSplitOccurrence = true;
            }
          });
        }

        occurrenceEntry.hasSeriesConflict = uniqueSeriesIds.length > 1;
        occurrenceEntry.hasSequenceConflict = uniqueSequenceIds.length > 1;
      });

      Object.keys(lessonPlanAssignments).forEach(function (lessonId) {
        const lessonAssignment = lessonPlanAssignments[lessonId];
        const lessonItem = getOrderedCurriculumLessonsForSequence(String(lessonAssignment && lessonAssignment.sequenceId || "").trim()).find(function (entry) {
          return String(entry && entry.id || "").trim() === lessonId;
        }) || null;
        const isDoubleLesson = String(lessonItem && lessonItem.hourType || "").trim() === "double";

        lessonAssignment.hasWarning = Boolean(isDoubleLesson && lessonAssignment && lessonAssignment.hasSplitOccurrence);

        if (lessonAssignment.hasWarning && sequenceAssignments[String(lessonAssignment.sequenceId || "").trim()]) {
          sequenceAssignments[String(lessonAssignment.sequenceId || "").trim()].hasWarning = true;
        }
      });

      Object.keys(occurrenceLookup).forEach(function (occurrenceId) {
        const occurrenceEntry = occurrenceLookup[occurrenceId];
        const lessonIds = occurrenceEntry && Array.isArray(occurrenceEntry.assignmentLessonIds)
          ? occurrenceEntry.assignmentLessonIds.filter(Boolean)
          : [];

        occurrenceEntry.hasProblem = Boolean(
          occurrenceEntry
          && (
            occurrenceEntry.hasSeriesConflict
            || occurrenceEntry.hasSequenceConflict
            || lessonIds.some(function (lessonId) {
              return Boolean(lessonPlanAssignments[lessonId] && lessonPlanAssignments[lessonId].hasWarning);
            })
          )
        );
      });

      Object.keys(sequenceAssignments).forEach(function (sequenceId) {
        const sequenceAssignment = sequenceAssignments[sequenceId];
        const seriesId = String(sequenceAssignment && sequenceAssignment.seriesId || "").trim();

        if (sequenceAssignment && sequenceAssignment.hasWarning && seriesAssignments[seriesId]) {
          seriesAssignments[seriesId].hasWarning = true;
        }
      });

      return {
        lessonOccurrences: lessonOccurrences,
        occurrenceLookup: occurrenceLookup,
        seriesAssignments: seriesAssignments,
        sequenceAssignments: sequenceAssignments,
        lessonPlanAssignments: lessonPlanAssignments
      };
    }

    function buildCurrentCurriculumHighlightData(instructionAssignmentData) {
      const lessonOccurrences = instructionAssignmentData && Array.isArray(instructionAssignmentData.lessonOccurrences)
        ? instructionAssignmentData.lessonOccurrences
        : [];
      const occurrenceLookup = instructionAssignmentData && instructionAssignmentData.occurrenceLookup
        ? instructionAssignmentData.occurrenceLookup
        : {};
      const highlightSeriesIdsLookup = {};
      const highlightSequenceIdsLookup = {};
      const highlightLessonIdsLookup = {};
      const activeDateIso = referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime())
        ? toIsoDate(referenceDate)
        : "";
      let targetOccurrenceEntry = null;

      function getUniqueIds(values) {
        return Array.isArray(values)
          ? values.filter(Boolean).filter(function (value, index, source) {
              return source.indexOf(value) === index;
            })
          : [];
      }

      function getOccurrenceEntry(occurrence) {
        return occurrenceLookup[String(occurrence && occurrence.id || "").trim()] || null;
      }

      function isHighlightCandidate(occurrence) {
        const occurrenceEntry = getOccurrenceEntry(occurrence);
        const lessonIds = getUniqueIds(occurrenceEntry && occurrenceEntry.assignmentLessonIds);
        const sequenceIds = getUniqueIds(occurrenceEntry && occurrenceEntry.assignmentSequenceIds);
        const seriesIds = getUniqueIds(occurrenceEntry && occurrenceEntry.assignmentSeriesIds);

        return Boolean(
          occurrenceEntry
          && String(occurrence && occurrence.lessonDate || "").slice(0, 10)
          && (lessonIds.length || sequenceIds.length || seriesIds.length)
        );
      }

      if (activeDateIso) {
        lessonOccurrences.some(function (occurrence) {
          const lessonDate = String(occurrence && occurrence.lessonDate || "").slice(0, 10);

          if (lessonDate !== activeDateIso || !isHighlightCandidate(occurrence)) {
            return false;
          }

          targetOccurrenceEntry = getOccurrenceEntry(occurrence);
          return true;
        });

        if (!targetOccurrenceEntry) {
          lessonOccurrences.forEach(function (occurrence) {
            const lessonDate = String(occurrence && occurrence.lessonDate || "").slice(0, 10);

            if (lessonDate && lessonDate <= activeDateIso && isHighlightCandidate(occurrence)) {
              targetOccurrenceEntry = getOccurrenceEntry(occurrence);
            }
          });
        }
      }

      if (targetOccurrenceEntry) {
        const lessonIds = getUniqueIds(targetOccurrenceEntry.assignmentLessonIds);
        const sequenceIds = getUniqueIds(targetOccurrenceEntry.assignmentSequenceIds);
        const seriesIds = getUniqueIds(targetOccurrenceEntry.assignmentSeriesIds);

        if (lessonIds.length) {
          lessonIds.forEach(function (lessonId) {
            highlightLessonIdsLookup[String(lessonId || "").trim()] = true;
          });
        }

        if (sequenceIds.length) {
          sequenceIds.forEach(function (sequenceId) {
            highlightSequenceIdsLookup[String(sequenceId || "").trim()] = true;
          });
        }

        if (seriesIds.length) {
          seriesIds.forEach(function (seriesId) {
            highlightSeriesIdsLookup[String(seriesId || "").trim()] = true;
          });
        }
      }

      return {
        seriesIdsLookup: highlightSeriesIdsLookup,
        sequenceIdsLookup: highlightSequenceIdsLookup,
        lessonIdsLookup: highlightLessonIdsLookup
      };
    }

    function withAlpha(colorValue, alphaValue) {
      const normalizedColor = String(colorValue || "").trim();
      const normalizedAlpha = Math.max(0, Math.min(1, Number(alphaValue)));
      let hexValue = normalizedColor.replace("#", "");
      let red;
      let green;
      let blue;

      if (/^[0-9a-f]{3}$/i.test(hexValue)) {
        hexValue = hexValue.split("").map(function (part) {
          return part + part;
        }).join("");
      }

      if (!/^[0-9a-f]{6}$/i.test(hexValue)) {
        return normalizedColor || "rgba(255, 255, 255, " + String(normalizedAlpha) + ")";
      }

      red = parseInt(hexValue.slice(0, 2), 16);
      green = parseInt(hexValue.slice(2, 4), 16);
      blue = parseInt(hexValue.slice(4, 6), 16);

      return "rgba(" + [red, green, blue, normalizedAlpha].join(", ") + ")";
    }

    function buildInstructionLessonBackground(occurrenceEntry) {
      const totalUnits = occurrenceEntry ? Math.max(1, Number(occurrenceEntry.totalUnits) || 1) : 1;
      const assignmentColors = occurrenceEntry && Array.isArray(occurrenceEntry.assignmentColors)
        ? occurrenceEntry.assignmentColors.slice(0, totalUnits)
        : [];
      const availableUnits = occurrenceEntry ? Math.max(0, Number(occurrenceEntry.availableUnits) || 0) : 0;
      const isPastOnly = availableUnits <= 0;
      const colorStops = [];
      let index = 0;

      while (index < totalUnits) {
        const startPercent = (index / totalUnits) * 100;
        const endPercent = ((index + 1) / totalUnits) * 100;
        const fillColor = assignmentColors[index]
          ? (isPastOnly ? withAlpha(assignmentColors[index], 0.5) : assignmentColors[index])
          : (isPastOnly ? "rgba(23, 49, 62, 0.08)" : "rgba(255, 255, 255, 0.72)");

        colorStops.push(fillColor + " " + startPercent + "%");
        colorStops.push(fillColor + " " + endPercent + "%");
        index += 1;
      }

      return "linear-gradient(90deg, " + colorStops.join(", ") + ")";
    }

    function getInstructionOccurrenceSequenceMeta(lessonOccurrences, occurrenceLookup) {
      return lessonOccurrences.map(function (occurrence, index) {
        const occurrenceId = String(occurrence && occurrence.id || "").trim();
        const occurrenceEntry = occurrenceLookup[occurrenceId] || null;
        const sequenceIds = occurrenceEntry && Array.isArray(occurrenceEntry.assignmentSequenceIds)
          ? occurrenceEntry.assignmentSequenceIds.filter(Boolean)
          : [];
        const uniqueSequenceIds = sequenceIds.filter(function (sequenceId, sequenceIndex) {
          return sequenceIds.indexOf(sequenceId) === sequenceIndex;
        });
        const primarySequenceId = uniqueSequenceIds.length === 1 ? uniqueSequenceIds[0] : "";
        const previousOccurrence = index > 0 ? lessonOccurrences[index - 1] : null;
        const nextOccurrence = index + 1 < lessonOccurrences.length ? lessonOccurrences[index + 1] : null;
        const previousEntry = previousOccurrence ? occurrenceLookup[String(previousOccurrence && previousOccurrence.id || "").trim()] : null;
        const nextEntry = nextOccurrence ? occurrenceLookup[String(nextOccurrence && nextOccurrence.id || "").trim()] : null;
        const previousSequenceIds = previousEntry && Array.isArray(previousEntry.assignmentSequenceIds)
          ? previousEntry.assignmentSequenceIds.filter(Boolean)
          : [];
        const nextSequenceIds = nextEntry && Array.isArray(nextEntry.assignmentSequenceIds)
          ? nextEntry.assignmentSequenceIds.filter(Boolean)
          : [];
        const tracks = uniqueSequenceIds.slice(0, 2).map(function (sequenceId) {
          return {
            sequenceId: sequenceId,
            color: occurrenceEntry && Array.isArray(occurrenceEntry.assignmentColors)
              ? occurrenceEntry.assignmentColors[sequenceIds.indexOf(sequenceId)] || ""
            : "",
            connectBefore: previousSequenceIds.indexOf(sequenceId) >= 0,
            connectAfter: nextSequenceIds.indexOf(sequenceId) >= 0
          };
        });
        let hasIncomingConnection = false;
        let hasOutgoingConnection = false;

        tracks.forEach(function (track, trackIndex) {
          if (track && track.connectBefore) {
            if (hasIncomingConnection) {
              tracks[trackIndex].connectBefore = false;
            } else {
              hasIncomingConnection = true;
            }
          }
        });

        tracks.slice().reverse().forEach(function (track, reverseIndex) {
          const trackIndex = tracks.length - 1 - reverseIndex;

          if (track && track.connectAfter) {
            if (hasOutgoingConnection) {
              tracks[trackIndex].connectAfter = false;
            } else {
              hasOutgoingConnection = true;
            }
          }
        });

        return {
          occurrenceId: occurrenceId,
          tracks: tracks
        };
      }).reduce(function (lookup, entry) {
        lookup[entry.occurrenceId] = entry;
        return lookup;
      }, {});
    }

    function buildPlanningInstructionLessonModal(instructionAssignmentData) {
      const draft = planningInstructionLessonDraft;
      const occurrenceLookup = instructionAssignmentData && instructionAssignmentData.occurrenceLookup
        ? instructionAssignmentData.occurrenceLookup
        : {};
      const occurrenceId = draft && draft.lessonDate
        ? "unterrichtstag::" + String(draft.lessonDate || "").slice(0, 10)
        : "";
      const occurrenceEntry = occurrenceId ? occurrenceLookup[occurrenceId] || null : null;
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
      const lessonLookup = (Array.isArray(snapshot.curriculumLessonPlans) ? snapshot.curriculumLessonPlans : []).reduce(function (lookup, entry) {
        const entryId = String(entry && entry.id || "").trim();

        if (entryId) {
          lookup[entryId] = entry;
        }

        return lookup;
      }, {});

      function getUniqueIds(values) {
        return (Array.isArray(values) ? values : []).map(function (entry) {
          return String(entry || "").trim();
        }).filter(Boolean).filter(function (entry, index, source) {
          return source.indexOf(entry) === index;
        });
      }

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
        '<div><h3 id="planningInstructionLessonTitle">Verfuegbare Unterrichtsstunde</h3><p class="planning-instruction-modal__date">' + escapeValue(formatShortDateLabel(String(draft.lessonDate || "").slice(0, 10))) + '</p></div>',
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
          lessonLookup,
          function (lessonItem) {
            const topic = String(lessonItem && lessonItem.topic || "").trim() || "Ohne Thema";
            const hourType = String(lessonItem && lessonItem.hourType || "").trim() === "double"
              ? "Doppelstunde"
              : "Einzelstunde";

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

    function buildInstructionPlanningContent() {
      const instructionAssignmentData = buildInstructionLessonAssignmentData();
      const lessonOccurrences = instructionAssignmentData.lessonOccurrences;
      const occurrenceLookup = instructionAssignmentData.occurrenceLookup;
      const occurrenceSequenceMeta = getInstructionOccurrenceSequenceMeta(lessonOccurrences, occurrenceLookup);
      const seriesAssignments = instructionAssignmentData.seriesAssignments;
      const classColor = getClassDisplayColor(activeClass);
      const classLabel = getClassDisplayName(activeClass) || "Aktive Lerngruppe";
      const totalLessonCount = lessonOccurrences.reduce(function (sum, occurrence) {
        return sum + Math.max(1, Number(occurrence && occurrence.lessonCount || 1));
      }, 0);
      const remainingLessonCount = lessonOccurrences.reduce(function (sum, occurrence) {
        return sum + Math.max(0, Number(occurrence && occurrence.remainingLessonCount || 0));
      }, 0);
      const hasPlanningCapacityWarning = Object.keys(seriesAssignments || {}).some(function (seriesId) {
        return Boolean(seriesAssignments[seriesId] && seriesAssignments[seriesId].hasUnassignedDemand);
      });

      if (!activeClass) {
        return [
          '<div class="panel-grid panel-grid--planung-instruction">',
          '<article class="panel panel--full">',
          '<p class="empty-message">Waehle zuerst eine Lerngruppe bzw. setze eine aktive Lerngruppe, damit die Unterrichtsplanung echte Unterrichtsstunden anzeigen kann.</p>',
          '</article>',
          '</div>'
        ].join("");
      }

      return [
        '<div class="panel-grid panel-grid--planung-instruction">',
        '<article class="panel panel--full panel--planung-instruction">',
        '<section class="planning-instruction__section planning-instruction__section--planned">',
        '<div class="planning-instruction__section-header">',
        '<h2 class="planning-instruction__title">Geplante Unterrichtsstunden</h2>',
        '</div>',
        hasPlanningCapacityWarning
          ? '<p class="empty-message planning-instruction__warning-message">Nicht genuegend verfuegbare Stunden vorhanden: Mindestens eine Unterrichtsreihe hat noch offene Bedarfsstunden, die aktuell nicht mehr zugeordnet werden koennen.</p>'
          : '',
        buildStoffPlanningContent(false),
        buildCurriculumLessonFlowContent(instructionAssignmentData),
        '</section>',
        '<section class="planning-instruction__section planning-instruction__section--available">',
        '<button class="planning-instruction__section-toggle" type="button" aria-expanded="', isPlanningAvailableLessonsExpanded ? 'true' : 'false', '" onclick="return window.UnterrichtsassistentApp.togglePlanningAvailableLessons()">',
        '<span class="planning-instruction__section-toggle-main"><span class="planning-instruction__section-toggle-arrow" aria-hidden="true">', isPlanningAvailableLessonsExpanded ? '&#9650;' : '&#9660;', '</span><span class="planning-instruction__title">Verfuegbare Unterrichtsstunden</span></span>',
        '<span class="planning-instruction__count planning-instruction__count--combined"><strong>', escapeValue(String(remainingLessonCount)), '</strong>&nbsp;von&nbsp;<strong>', escapeValue(String(totalLessonCount)), '</strong>&nbsp;Stunden&nbsp;verfuegbar</span>',
        '</button>',
        isPlanningAvailableLessonsExpanded
          ? (
              lessonOccurrences.length
                ? '<div class="planning-instruction__grid">' + lessonOccurrences.map(function (occurrence) {
                    const occurrenceEntry = occurrenceLookup[String(occurrence && occurrence.id || "").trim()] || null;
                    const occurrenceMeta = occurrenceSequenceMeta[String(occurrence && occurrence.id || "").trim()] || null;
                    const lessonBackground = occurrenceEntry && Number(occurrence && occurrence.remainingLessonCount || 0) > 0
                      ? buildInstructionLessonBackground(occurrenceEntry)
                      : "";
                    const isPastOccurrence = Number(occurrence && occurrence.remainingLessonCount || 0) <= 0;
                    const isCancelledOccurrence = Boolean(occurrence && occurrence.isCancelled);
                    const lessonLinkMarkup = occurrenceMeta && Array.isArray(occurrenceMeta.tracks)
                      ? occurrenceMeta.tracks.map(function (track, trackIndex) {
                          const lineColor = track && track.color
                            ? escapeValue(isPastOccurrence ? withAlpha(track.color, 0.62) : track.color)
                            : "transparent";
                          const positionClass = occurrenceMeta.tracks.length > 1
                            ? (trackIndex === 0 ? ' planning-instruction__lesson-link--top' : ' planning-instruction__lesson-link--bottom')
                            : ' planning-instruction__lesson-link--middle';

                          return [
                            '<span class="planning-instruction__lesson-link',
                            positionClass,
                            track && track.connectAfter ? ' planning-instruction__lesson-link--after' : '',
                            '" style="--planning-instruction-sequence-color:',
                            lineColor,
                            ';"></span>'
                          ].join("");
                        }).join("")
                      : "";
                    return [
                      '<article class="planning-instruction__lesson', isPastOccurrence ? ' planning-instruction__lesson--past' : '', isCancelledOccurrence ? ' planning-instruction__lesson--cancelled' : '', occurrenceEntry && occurrenceEntry.hasProblem ? ' planning-instruction__lesson--problem' : '', '" style="--planning-instruction-color:', escapeValue(classColor), ';', lessonBackground ? '--planning-instruction-lesson-background:' + escapeValue(lessonBackground) + ';' : '', '" onclick="return window.UnterrichtsassistentApp.openPlanningInstructionLessonModal(\'', escapeValue(String(occurrence && occurrence.lessonDate || "").slice(0, 10)), '\')">',
                      lessonLinkMarkup,
                      '<div class="planning-instruction__lesson-date">', escapeValue(formatShortDateLabel(occurrence.lessonDate)), '</div>',
                      '<div class="planning-instruction__lesson-count">', escapeValue(String(Math.max(1, Number(occurrence.lessonCount || 1)))), '</div>',
                      '</article>'
                    ].join("");
                  }).join("") + '</div>'
                : '<p class="empty-message">Fuer die aktive Lerngruppe wurden im aktuellen Schuljahr keine tatsaechlichen Unterrichtsstunden gefunden.</p>'
            )
          : '',
        '</section>',
        buildPlanningInstructionLessonModal(instructionAssignmentData),
        '</article>',
        '</div>'
      ].join("");
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

    function getOrderedCurriculumLessonPhasesForLesson(lessonPlanId) {
      const allPhases = Array.isArray(snapshot.curriculumLessonPhases) ? snapshot.curriculumLessonPhases.filter(function (entry) {
        return String(entry && entry.lessonPlanId || "").trim() === String(lessonPlanId || "").trim();
      }) : [];
      const incomingCounts = {};
      const itemById = {};
      const ordered = [];
      let current = null;

      allPhases.forEach(function (entry) {
        const entryId = String(entry && entry.id || "").trim();

        if (!entryId) {
          return;
        }

        itemById[entryId] = entry;
        incomingCounts[entryId] = incomingCounts[entryId] || 0;
      });

      allPhases.forEach(function (entry) {
        const nextId = String(entry && entry.nextPhaseId || "").trim();

        if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
          incomingCounts[nextId] += 1;
        }
      });

      current = allPhases.find(function (entry) {
        return !incomingCounts[String(entry && entry.id || "").trim()];
      }) || allPhases[0] || null;

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

      allPhases.forEach(function (entry) {
        if (!ordered.some(function (orderedEntry) {
          return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
        })) {
          ordered.push(entry);
        }
      });

      return ordered;
    }

    function getOrderedCurriculumLessonStepsForPhase(phaseId) {
      const allSteps = Array.isArray(snapshot.curriculumLessonSteps) ? snapshot.curriculumLessonSteps.filter(function (entry) {
        return String(entry && entry.phaseId || "").trim() === String(phaseId || "").trim();
      }) : [];
      const incomingCounts = {};
      const itemById = {};
      const ordered = [];
      let current = null;

      allSteps.forEach(function (entry) {
        const entryId = String(entry && entry.id || "").trim();

        if (!entryId) {
          return;
        }

        itemById[entryId] = entry;
        incomingCounts[entryId] = incomingCounts[entryId] || 0;
      });

      allSteps.forEach(function (entry) {
        const nextId = String(entry && entry.nextStepId || "").trim();

        if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
          incomingCounts[nextId] += 1;
        }
      });

      current = allSteps.find(function (entry) {
        return !incomingCounts[String(entry && entry.id || "").trim()];
      }) || allSteps[0] || null;

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

      allSteps.forEach(function (entry) {
        if (!ordered.some(function (orderedEntry) {
          return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
        })) {
          ordered.push(entry);
        }
      });

      return ordered;
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

    function getCurriculumLessonVisualWidth(lessonItem) {
      return String(lessonItem && lessonItem.hourType || "").trim() === "double" ? 56 : 44;
    }

    function getCurriculumLessonHourDemand(lessonItem) {
      return String(lessonItem && lessonItem.hourType || "").trim() === "double" ? 2 : 1;
    }

    function getCalculatedHourDemandForSequence(sequenceId) {
      return getOrderedCurriculumLessonsForSequence(sequenceId).reduce(function (sum, lessonItem) {
        return sum + getCurriculumLessonHourDemand(lessonItem);
      }, 0);
    }

    function getEffectiveHourDemandForSequence(sequenceItem) {
      const calculatedHourDemand = getCalculatedHourDemandForSequence(String(sequenceItem && sequenceItem.id || "").trim());

      if (calculatedHourDemand > 0) {
        return calculatedHourDemand;
      }

      return Math.max(0, Number(sequenceItem && sequenceItem.hourDemand) || 0);
    }

    function getCalculatedHourDemandForSeries(seriesId) {
      return getOrderedCurriculumSequencesForSeries(seriesId).reduce(function (sum, sequenceItem) {
        return sum + getEffectiveHourDemandForSequence(sequenceItem);
      }, 0);
    }

    function getExpandedLessonColumnWidth(sequenceId, isSequenceExpanded) {
      const orderedLessons = isSequenceExpanded ? getOrderedCurriculumLessonsForSequence(sequenceId) : [];
      const lessonsWidth = orderedLessons.reduce(function (sum, lessonItem) {
        return sum + getCurriculumLessonVisualWidth(lessonItem);
      }, 0);

      if (!isSequenceExpanded) {
        return 156;
      }

      return Math.max(156, lessonsWidth + 44);
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

      return Math.max(168, sequenceWidths + 58);
    }

    function buildCurriculumSeriesModal() {
      if (!curriculumSeriesDraft) {
        return "";
      }

      return [
        '<div class="import-modal is-open" id="curriculumSeriesModal">',
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeCurriculumSeriesModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--planning import-modal__dialog--curriculum" role="dialog" aria-modal="true" aria-labelledby="curriculumSeriesTitle">',
        '<div class="import-modal__header">',
        '<div><h3 id="curriculumSeriesTitle">', curriculumSeriesDraft.id ? 'Unterrichtsreihe bearbeiten' : 'Unterrichtsreihe anlegen', '</h3></div>',
        '<div class="import-modal__icon-actions">',
        '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="submit" form="curriculumSeriesForm" aria-label="Unterrichtsreihe speichern">&#10003;</button>',
        '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Bearbeitung abbrechen" onclick="return window.UnterrichtsassistentApp.closeCurriculumSeriesModal()">&#10005;</button>',
        '</div>',
        '</div>',
        '<form class="import-modal__form curriculum-series-form" id="curriculumSeriesForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitCurriculumSeriesModal(event)">',
        '<label class="import-modal__field"><span>Thema</span><input id="curriculumSeriesTopicInput" type="text" value="', escapeValue(curriculumSeriesDraft.topic || ""), '" placeholder="Thema der Unterrichtsreihe"></label>',
        '<label class="import-modal__field"><span>Stundenbedarf</span><input id="curriculumSeriesHourDemandInput" type="number" min="0" step="1" value="', escapeValue(String(curriculumSeriesDraft.hourDemand || 0)), '" placeholder="0"></label>',
        '<label class="import-modal__field"><span>Beginn</span><select id="curriculumSeriesStartModeInput" onchange="return window.UnterrichtsassistentApp.handleCurriculumSeriesStartModeChange(this.value)"><option value="automatic"', String(curriculumSeriesDraft.startMode || "automatic") === "manual" ? '' : ' selected', '>Automatik</option><option value="manual"', String(curriculumSeriesDraft.startMode || "automatic") === "manual" ? ' selected' : '', '>Manuell</option></select></label>',
        '<label class="import-modal__field curriculum-series-form__start-date-field" id="curriculumSeriesStartDateField"', String(curriculumSeriesDraft.startMode || "automatic") === "manual" ? '' : ' hidden', '><span>Beginndatum</span><input id="curriculumSeriesStartDateInput" class="curriculum-series-form__start-date-input" type="date" value="', escapeValue(String(curriculumSeriesDraft.startDate || "")), '"', String(curriculumSeriesDraft.startMode || "automatic") === "manual" ? '' : ' disabled', '></label>',
        '<label class="import-modal__field curriculum-series-form__color-field"><span>Farbe</span><span class="curriculum-series-form__color-input-wrap"><span id="curriculumSeriesColorPreview" class="curriculum-series-form__color-preview" style="background:', escapeValue(curriculumSeriesDraft.color || "#d9d4cb"), ';"></span><input id="curriculumSeriesColorInput" class="curriculum-series-form__color-input" type="color" value="', escapeValue(curriculumSeriesDraft.color || "#d9d4cb"), '" oninput="window.UnterrichtsassistentApp.handleCurriculumSeriesColorPickerInput(this.value)" onchange="window.UnterrichtsassistentApp.handleCurriculumSeriesColorPickerInput(this.value)"></span></label>',
        '<div class="import-modal__actions">',
        curriculumSeriesDraft.id
          ? '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.deleteCurriculumSeries(\'' + escapeValue(String(curriculumSeriesDraft.id || "")) + '\')">Loeschen</button>'
          : '',
        '</div>',
        '</form>',
        '</div>',
        '</div>'
      ].join("");
    }

    function buildCurriculumSequenceModal() {
      if (!curriculumSequenceDraft) {
        return "";
      }

      return [
        '<div class="import-modal is-open" id="curriculumSequenceModal">',
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeCurriculumSequenceModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--planning import-modal__dialog--curriculum" role="dialog" aria-modal="true" aria-labelledby="curriculumSequenceTitle">',
        '<div class="import-modal__header">',
        '<div><h3 id="curriculumSequenceTitle">', curriculumSequenceDraft.id ? 'Unterrichtssequenz bearbeiten' : 'Unterrichtssequenz anlegen', '</h3></div>',
        '<div class="import-modal__icon-actions">',
        '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="submit" form="curriculumSequenceForm" aria-label="Unterrichtssequenz speichern">&#10003;</button>',
        '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Bearbeitung abbrechen" onclick="return window.UnterrichtsassistentApp.closeCurriculumSequenceModal()">&#10005;</button>',
        '</div>',
        '</div>',
        '<form class="import-modal__form curriculum-series-form" id="curriculumSequenceForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitCurriculumSequenceModal(event)">',
        '<label class="import-modal__field"><span>Thema</span><input id="curriculumSequenceTopicInput" type="text" value="', escapeValue(curriculumSequenceDraft.topic || ""), '" placeholder="Thema der Unterrichtssequenz"></label>',
        '<label class="import-modal__field"><span>Stundenbedarf</span><input id="curriculumSequenceHourDemandInput" type="number" min="0" step="1" value="', escapeValue(String(curriculumSequenceDraft.hourDemand || 0)), '" placeholder="0"></label>',
        '<div class="import-modal__actions">',
        curriculumSequenceDraft.id
          ? '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.deleteCurriculumSequence(\'' + escapeValue(String(curriculumSequenceDraft.id || "")) + '\')">Loeschen</button>'
          : '',
        '</div>',
        '</form>',
        '</div>',
        '</div>'
      ].join("");
    }

    function buildCurriculumLessonModal() {
      if (!curriculumLessonDraft) {
        return "";
      }

      return [
        '<div class="import-modal is-open" id="curriculumLessonModal">',
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeCurriculumLessonModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--planning import-modal__dialog--curriculum" role="dialog" aria-modal="true" aria-labelledby="curriculumLessonTitle">',
        '<div class="import-modal__header">',
        '<div><h3 id="curriculumLessonTitle">', curriculumLessonDraft.id ? 'Unterrichtsstunde bearbeiten' : 'Unterrichtsstunde anlegen', '</h3></div>',
        '<div class="import-modal__icon-actions">',
        '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="submit" form="curriculumLessonForm" aria-label="Unterrichtsstunde speichern">&#10003;</button>',
        '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Bearbeitung abbrechen" onclick="return window.UnterrichtsassistentApp.closeCurriculumLessonModal()">&#10005;</button>',
        '</div>',
        '</div>',
        '<form class="import-modal__form curriculum-series-form" id="curriculumLessonForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitCurriculumLessonModal(event)">',
        '<label class="import-modal__field"><span>Thema</span><input id="curriculumLessonTopicInput" type="text" value="', escapeValue(curriculumLessonDraft.topic || ""), '" placeholder="Thema der Unterrichtsstunde"></label>',
        '<label class="import-modal__field"><span>Stundentyp</span><select id="curriculumLessonHourTypeInput"><option value="single"', String(curriculumLessonDraft.hourType || "single") === "single" ? ' selected' : '', '>Einzelstunde</option><option value="double"', String(curriculumLessonDraft.hourType || "single") === "double" ? ' selected' : '', '>Doppelstunde</option></select></label>',
        '<label class="import-modal__field"><span>Funktion</span><select id="curriculumLessonFunctionTypeInput"><option value=""', !String(curriculumLessonDraft.functionType || "").trim() ? ' selected' : '', '></option><option value="erarbeiten"', String(curriculumLessonDraft.functionType || "").trim() === 'erarbeiten' ? ' selected' : '', '>Erarbeiten</option><option value="vertiefen"', String(curriculumLessonDraft.functionType || "").trim() === 'vertiefen' ? ' selected' : '', '>Vertiefen</option><option value="ueben"', String(curriculumLessonDraft.functionType || "").trim() === 'ueben' ? ' selected' : '', '>Ueben</option><option value="wiederholen"', String(curriculumLessonDraft.functionType || "").trim() === 'wiederholen' ? ' selected' : '', '>Wiederholen</option><option value="ueberpruefen"', String(curriculumLessonDraft.functionType || "").trim() === 'ueberpruefen' ? ' selected' : '', '>Ueberpruefen</option></select></label>',
        '<label class="import-modal__field"><span>ueberwiegend Situation</span><select id="curriculumLessonSituationTypeInput"><option value=""', !String(curriculumLessonDraft.situationType || "").trim() ? ' selected' : '', '></option><option value="lernen"', String(curriculumLessonDraft.situationType || "").trim() === 'lernen' ? ' selected' : '', '>Lernen</option><option value="leisten"', String(curriculumLessonDraft.situationType || "").trim() === 'leisten' ? ' selected' : '', '>Leisten</option></select></label>',
        '<label class="import-modal__field"><span>ueberwiegend Anforderungsbereich</span><select id="curriculumLessonDemandLevelInput"><option value=""', !String(curriculumLessonDraft.demandLevel || "").trim() ? ' selected' : '', '></option><option value="afb1"', String(curriculumLessonDraft.demandLevel || "").trim() === 'afb1' ? ' selected' : '', '>AFB1</option><option value="afb1/2"', String(curriculumLessonDraft.demandLevel || "").trim() === 'afb1/2' ? ' selected' : '', '>AFB1/2</option><option value="afb2"', String(curriculumLessonDraft.demandLevel || "").trim() === 'afb2' ? ' selected' : '', '>AFB2</option><option value="afb2/3"', String(curriculumLessonDraft.demandLevel || "").trim() === 'afb2/3' ? ' selected' : '', '>AFB2/3</option><option value="afb3"', String(curriculumLessonDraft.demandLevel || "").trim() === 'afb3' ? ' selected' : '', '>AFB3</option></select></label>',
        '<div class="import-modal__actions">',
        curriculumLessonDraft.id
          ? '<button class="circle-action circle-action--danger" type="button" onclick="return window.UnterrichtsassistentApp.deleteCurriculumLesson(\'' + escapeValue(String(curriculumLessonDraft.id || "")) + '\')">Loeschen</button>'
          : '',
        '</div>',
        '</form>',
        '</div>',
        '</div>'
      ].join("");
    }

    function buildCurriculumLessonFlowContent(instructionAssignmentData) {
      const normalizedLessonId = String(activeCurriculumLessonFlowLessonId || "").trim();
      const lessonItem = normalizedLessonId && Array.isArray(snapshot.curriculumLessonPlans)
        ? snapshot.curriculumLessonPlans.find(function (entry) {
            return String(entry && entry.id || "").trim() === normalizedLessonId;
          }) || null
        : null;
      const sequenceItem = lessonItem && Array.isArray(snapshot.curriculumSequences)
        ? snapshot.curriculumSequences.find(function (entry) {
            return String(entry && entry.id || "").trim() === String(lessonItem.sequenceId || "").trim();
          }) || null
        : null;
      const seriesItem = sequenceItem && Array.isArray(snapshot.curriculumSeries)
        ? snapshot.curriculumSeries.find(function (entry) {
            return String(entry && entry.id || "").trim() === String(sequenceItem.seriesId || "").trim();
          }) || null
        : null;
      const lessonAssignment = instructionAssignmentData && instructionAssignmentData.lessonPlanAssignments
        ? instructionAssignmentData.lessonPlanAssignments[normalizedLessonId] || null
        : null;
      const lessonDateLabel = lessonAssignment && lessonAssignment.firstDate
        ? formatInstructionSeriesRange(lessonAssignment.firstDate, lessonAssignment.lastDate)
        : "Noch ohne Datum";
      const orderedPhases = lessonItem ? getOrderedCurriculumLessonPhasesForLesson(normalizedLessonId) : [];
      const viewPhaseLookup = activeCurriculumLessonFlowViewPhaseIds.reduce(function (lookup, phaseId) {
        lookup[phaseId] = true;
        return lookup;
      }, {});

      if (!activeClass || !lessonItem || !sequenceItem || !seriesItem || String(seriesItem.classId || "").trim() !== String(activeClass.id || "").trim()) {
        return "";
      }

      return [
        '<section class="planning-lesson-flow">',
        '<div class="planning-lesson-flow__header">',
        '<h2 class="planning-lesson-flow__title">Stundenverlauf</h2>',
        '<p class="planning-lesson-flow__meta"><strong>', escapeValue(String(lessonItem.topic || "").trim() || "Ohne Thema"), '</strong><span>', escapeValue(lessonDateLabel), '</span></p>',
        '</div>',
        '<table class="planning-lesson-flow__phase-table">',
        '<tbody>',
        orderedPhases.length ? orderedPhases.map(function (phaseItem) {
          const phaseId = String(phaseItem && phaseItem.id || "").trim();
          const orderedSteps = getOrderedCurriculumLessonStepsForPhase(phaseId);
          const isViewMode = Boolean(viewPhaseLookup[phaseId]);
          const phaseSituationType = String(phaseItem && phaseItem.situationType || "").trim().toLowerCase();
          const phaseDemandLevel = String(phaseItem && phaseItem.demandLevel || "").trim().toLowerCase();
          const phaseSummaryMetaParts = [
            String(Math.max(0, Number(phaseItem && phaseItem.durationMinutes) || 0)) + ' Min.',
            phaseItem && phaseItem.isReserve ? 'Reserve' : '',
            getCurriculumSituationTypeLabel(phaseSituationType),
            getCurriculumDemandLevelLabel(phaseDemandLevel)
          ].filter(Boolean);

          return [
            '<tr class="planning-lesson-flow__phase-row">',
            '<td>',
            '<div class="planning-lesson-flow__phase-card">',
            '<div class="planning-lesson-flow__phase-toolbar">',
            isViewMode
              ? '<div class="planning-lesson-flow__phase-summary"><div class="planning-lesson-flow__phase-summary-title">' + escapeValue(String(phaseItem && phaseItem.title || "").trim() || "Ohne Titel") + '</div><div class="planning-lesson-flow__phase-summary-meta">' + phaseSummaryMetaParts.map(function (entry) { return '<span>' + escapeValue(entry) + '</span>'; }).join("") + '</div></div>'
              : '<label class="planning-lesson-flow__phase-field planning-lesson-flow__phase-field--title"><span>Phase</span><input type="text" value="' + escapeValue(String(phaseItem && phaseItem.title || "").trim()) + '" placeholder="Titel der Phase" onchange="return window.UnterrichtsassistentApp.updateCurriculumLessonPhaseField(\'' + escapeValue(phaseId) + '\', \'title\', this.value)"></label>',
            isViewMode
              ? ''
              : '<label class="planning-lesson-flow__phase-field planning-lesson-flow__phase-field--duration"><span>Dauer</span><input type="number" min="0" step="1" value="' + escapeValue(String(Math.max(0, Number(phaseItem && phaseItem.durationMinutes) || 0))) + '" onchange="return window.UnterrichtsassistentApp.updateCurriculumLessonPhaseField(\'' + escapeValue(phaseId) + '\', \'durationMinutes\', this.value)"></label>',
            isViewMode
              ? ''
              : '<label class="planning-lesson-flow__phase-checkbox"><input type="checkbox"' + (phaseItem && phaseItem.isReserve ? ' checked' : '') + ' onchange="return window.UnterrichtsassistentApp.updateCurriculumLessonPhaseField(\'' + escapeValue(phaseId) + '\', \'isReserve\', this.checked)"><span>Reserve</span></label>',
            isViewMode
              ? ''
              : '<label class="planning-lesson-flow__phase-field planning-lesson-flow__phase-field--compact"><span>Situation</span><select class="planning-lesson-flow__select planning-lesson-flow__select--compact" onchange="return window.UnterrichtsassistentApp.updateCurriculumLessonPhaseField(\'' + escapeValue(phaseId) + '\', \'situationType\', this.value)"><option value=""' + (!phaseSituationType ? ' selected' : '') + '></option><option value="lernen"' + (phaseSituationType === 'lernen' ? ' selected' : '') + '>Lernen</option><option value="leisten"' + (phaseSituationType === 'leisten' ? ' selected' : '') + '>Leisten</option></select></label>',
            isViewMode
              ? ''
              : '<label class="planning-lesson-flow__phase-field planning-lesson-flow__phase-field--compact"><span>Anforderungsbereich</span><select class="planning-lesson-flow__select planning-lesson-flow__select--compact" onchange="return window.UnterrichtsassistentApp.updateCurriculumLessonPhaseField(\'' + escapeValue(phaseId) + '\', \'demandLevel\', this.value)"><option value=""' + (!phaseDemandLevel ? ' selected' : '') + '></option><option value="afb1"' + (phaseDemandLevel === 'afb1' ? ' selected' : '') + '>AFB1</option><option value="afb1/2"' + (phaseDemandLevel === 'afb1/2' ? ' selected' : '') + '>AFB1/2</option><option value="afb2"' + (phaseDemandLevel === 'afb2' ? ' selected' : '') + '>AFB2</option><option value="afb2/3"' + (phaseDemandLevel === 'afb2/3' ? ' selected' : '') + '>AFB2/3</option><option value="afb3"' + (phaseDemandLevel === 'afb3' ? ' selected' : '') + '>AFB3</option></select></label>',
            '<button class="planning-lesson-flow__delete-button" type="button" onclick="return window.UnterrichtsassistentApp.deleteCurriculumLessonPhase(\'', escapeValue(phaseId), '\')">Loeschen</button>',
            '<button class="planning-lesson-flow__mode-button" type="button" onclick="return window.UnterrichtsassistentApp.toggleCurriculumLessonFlowPhaseMode(\'', escapeValue(phaseId), '\')">', isViewMode ? 'Edit' : 'View', '</button>',
            '</div>',
            isViewMode
              ? [
                  '<table class="planning-lesson-flow__step-table planning-lesson-flow__step-table--compact">',
                  '<tbody>',
                  orderedSteps.length ? orderedSteps.map(function (stepItem) {
                    return [
                      '<tr class="planning-lesson-flow__step-row planning-lesson-flow__step-row--compact">',
                      '<td class="planning-lesson-flow__step-main-cell">',
                      '<div class="planning-lesson-flow__step-view-title">', escapeValue(String(stepItem && stepItem.title || "").trim() || "Ohne Titel"), '</div>',
                      String(stepItem && stepItem.content || "").trim()
                        ? '<div class="planning-lesson-flow__step-view-content">' + escapeValue(String(stepItem && stepItem.content || "").trim()) + '</div>'
                        : '',
                      '</td>',
                      '<td class="planning-lesson-flow__step-social-cell"><span class="planning-lesson-flow__step-pill">', escapeValue(getCurriculumLessonStepSocialFormLabel(stepItem && stepItem.socialForm)), '</span></td>',
                      '<td class="planning-lesson-flow__step-material-cell">', escapeValue(String(stepItem && stepItem.material || "").trim() || "-"), '</td>',
                      '</tr>'
                    ].join("");
                  }).join("") : '<tr class="planning-lesson-flow__step-row planning-lesson-flow__step-row--compact"><td colspan="3" class="planning-lesson-flow__step-empty">Noch keine Schritte angelegt.</td></tr>',
                  '</tbody>',
                  '</table>'
                ].join("")
              : [
                  '<table class="planning-lesson-flow__step-table">',
                  '<thead><tr><th>Schritt</th><th>Sozialform</th><th>Material</th></tr></thead>',
                  '<tbody>',
                  orderedSteps.map(function (stepItem) {
                    const stepId = String(stepItem && stepItem.id || "").trim();

                    return [
                      '<tr class="planning-lesson-flow__step-row">',
                      '<td class="planning-lesson-flow__step-main-cell">',
                      '<div class="planning-lesson-flow__step-main-top">',
                      '<input class="planning-lesson-flow__step-title" type="text" value="', escapeValue(String(stepItem && stepItem.title || "").trim()), '" placeholder="Titel des Schritts" onchange="return window.UnterrichtsassistentApp.updateCurriculumLessonStepField(\'', escapeValue(stepId), '\', \'title\', this.value)">',
                      '<button class="planning-lesson-flow__delete-button planning-lesson-flow__delete-button--step" type="button" onclick="return window.UnterrichtsassistentApp.deleteCurriculumLessonStep(\'', escapeValue(stepId), '\')">Loeschen</button>',
                      '</div>',
                      '<textarea class="planning-lesson-flow__textarea planning-lesson-flow__textarea--content" rows="3" placeholder="Inhalt" onchange="return window.UnterrichtsassistentApp.updateCurriculumLessonStepField(\'', escapeValue(stepId), '\', \'content\', this.value)">', escapeValue(String(stepItem && stepItem.content || "").trim()), '</textarea>',
                      '</td>',
                      '<td class="planning-lesson-flow__step-social-cell">',
                      '<select class="planning-lesson-flow__select" onchange="return window.UnterrichtsassistentApp.updateCurriculumLessonStepField(\'', escapeValue(stepId), '\', \'socialForm\', this.value)">',
                      ['einzel', 'partner', 'gruppe', 'plenum'].map(function (socialFormValue) {
                        return '<option value="' + escapeValue(socialFormValue) + '"' + (String(stepItem && stepItem.socialForm || "plenum").trim().toLowerCase() === socialFormValue ? ' selected' : '') + '>' + escapeValue(getCurriculumLessonStepSocialFormLabel(socialFormValue)) + '</option>';
                      }).join(""),
                      '</select>',
                      '</td>',
                      '<td class="planning-lesson-flow__step-material-cell">',
                      '<textarea class="planning-lesson-flow__textarea planning-lesson-flow__textarea--material" rows="3" placeholder="Benoetigtes Material" onchange="return window.UnterrichtsassistentApp.updateCurriculumLessonStepField(\'', escapeValue(stepId), '\', \'material\', this.value)">', escapeValue(String(stepItem && stepItem.material || "").trim()), '</textarea>',
                      '</td>',
                      '</tr>'
                    ].join("");
                  }).join(""),
                  '<tr class="planning-lesson-flow__step-add-row"><td colspan="3"><button class="planning-lesson-flow__add-button planning-lesson-flow__add-button--step" type="button" onclick="return window.UnterrichtsassistentApp.addCurriculumLessonStep(\'', escapeValue(phaseId), '\')">+ Schritt hinzufuegen</button></td></tr>',
                  '</tbody>',
                  '</table>'
                ].join(""),
            '</div>',
            '</td>',
            '</tr>'
          ].join("");
        }).join("") : '<tr class="planning-lesson-flow__phase-empty-row"><td><p class="planning-lesson-flow__empty">Noch keine Phasen angelegt.</p></td></tr>',
        '<tr class="planning-lesson-flow__phase-add-row"><td><button class="planning-lesson-flow__add-button planning-lesson-flow__add-button--phase" type="button" onclick="return window.UnterrichtsassistentApp.addCurriculumLessonPhase(\'', escapeValue(normalizedLessonId), '\')">+ Phase hinzufuegen</button></td></tr>',
        '</tbody>',
        '</table>',
        '</section>'
      ].join("");
    }

    function buildStoffPlanningContent(includePanelWrapper) {
      const shouldWrapInPanel = includePanelWrapper !== false;
      const orderedSeries = getOrderedCurriculumSeriesForActiveClass();
      const instructionAssignmentData = buildInstructionLessonAssignmentData();
      const seriesAssignments = instructionAssignmentData.seriesAssignments;
      const sequenceAssignments = instructionAssignmentData.sequenceAssignments;
      const lessonPlanAssignments = instructionAssignmentData.lessonPlanAssignments;
      const currentCurriculumHighlight = buildCurrentCurriculumHighlightData(instructionAssignmentData);
      const highlightSeriesIdsLookup = currentCurriculumHighlight.seriesIdsLookup;
      const highlightSequenceIdsLookup = currentCurriculumHighlight.sequenceIdsLookup;
      const highlightLessonIdsLookup = currentCurriculumHighlight.lessonIdsLookup;
      const autoApplyCalculatedHourDemands = snapshot.autoApplyCalculatedCurriculumHourDemands === true;
      const hasSeries = orderedSeries.length > 0;
      const expandedSeriesIdsLookup = expandedCurriculumSeriesIds.reduce(function (lookup, entry) {
        lookup[String(entry || "").trim()] = true;
        return lookup;
      }, {});
      const expandedSequenceIdsLookup = expandedCurriculumSequenceIds.reduce(function (lookup, entry) {
        lookup[String(entry || "").trim()] = true;
        return lookup;
      }, {});
      const seriesWidthLookup = orderedSeries.reduce(function (lookup, seriesItem) {
        const seriesId = String(seriesItem && seriesItem.id || "").trim();
        const isExpanded = Boolean(expandedSeriesIdsLookup[seriesId]);

        lookup[seriesId] = isExpanded
          ? getExpandedSeriesBlockWidth(seriesId, expandedSequenceIdsLookup)
          : 168;
        return lookup;
      }, {});
      const seriesCalculatedHourDemandLookup = orderedSeries.reduce(function (lookup, seriesItem) {
        const seriesId = String(seriesItem && seriesItem.id || "").trim();

        lookup[seriesId] = getCalculatedHourDemandForSeries(seriesId);
        return lookup;
      }, {});
      const sequenceCalculatedHourDemandLookup = (Array.isArray(snapshot.curriculumSequences) ? snapshot.curriculumSequences : []).reduce(function (lookup, sequenceItem) {
        const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();

        if (sequenceId) {
          lookup[sequenceId] = getCalculatedHourDemandForSequence(sequenceId);
        }

        return lookup;
      }, {});

      if (!activeClass) {
        return shouldWrapInPanel
          ? [
              '<div class="panel-grid panel-grid--planung-curriculum">',
              '<article class="panel panel--full">',
              '<p class="empty-message">Waehle zuerst eine Lerngruppe, damit du Unterrichtsreihen fuer die Unterrichtsplanung anlegen kannst.</p>',
              '</article>',
              '</div>'
            ].join("")
          : '<p class="empty-message">Waehle zuerst eine Lerngruppe, damit du Unterrichtsreihen fuer die Unterrichtsplanung anlegen kannst.</p>';
      }

      return (shouldWrapInPanel
        ? [
            '<div class="panel-grid panel-grid--planung-curriculum">',
            '<article class="panel panel--full panel--planung-curriculum">',
            '<div class="planning-curriculum__header">',
            '<h2 class="planning-curriculum__title">Unterrichtsreihen</h2>',
            '</div>'
          ]
        : [
            '<div class="planning-curriculum planning-curriculum--embedded">',
            '<div class="planning-curriculum__header planning-curriculum__header--embedded">',
            '<h3 class="planning-curriculum__title planning-curriculum__title--embedded">Unterrichtsreihen</h3>',
            '<div class="planning-curriculum__header-actions">',
            autoApplyCalculatedHourDemands
              ? ''
              : '<button class="planning-curriculum__sync-button" type="button" onclick="return window.UnterrichtsassistentApp.applyCalculatedCurriculumHourDemands()">Errechnete Stunden uebernehmen</button>',
            '<label class="planning-curriculum__auto-apply"><input type="checkbox" ' + (autoApplyCalculatedHourDemands ? 'checked ' : '') + 'onchange="return window.UnterrichtsassistentApp.updateAutoApplyCalculatedCurriculumHourDemands(this.checked)"><span>automatisch</span></label>',
            '</div>',
            '</div>'
          ]
      ).concat([
        hasSeries ? '' : '<p class="empty-message">Lege die erste Unterrichtsreihe ueber das Plus-Feld an.</p>',
        '<div class="planning-curriculum__table-wrap" data-drag-scroll="true" data-class-id="', escapeValue(String(activeClass && activeClass.id || "")), '">',
        '<table class="planning-curriculum__table">',
        '<colgroup>',
        orderedSeries.map(function (seriesItem) {
          const seriesId = String(seriesItem && seriesItem.id || "").trim();
          const seriesWidth = Math.max(168, Number(seriesWidthLookup[seriesId]) || 168);

          return '<col style="width:' + escapeValue(String(seriesWidth)) + 'px;min-width:' + escapeValue(String(seriesWidth)) + 'px;max-width:' + escapeValue(String(seriesWidth)) + 'px;">';
        }).join(""),
        '<col style="width:168px;min-width:168px;max-width:168px;">',
        '</colgroup>',
        '<tbody>',
        '<tr class="planning-curriculum__row planning-curriculum__row--series">',
        orderedSeries.map(function (seriesItem) {
          const seriesColor = escapeValue(String(seriesItem && seriesItem.color || "#d9d4cb"));
          const seriesId = String(seriesItem && seriesItem.id || "").trim();
          const isExpanded = Boolean(expandedSeriesIdsLookup[seriesId]);
          const expandedSeriesWidth = Math.max(168, Number(seriesWidthLookup[seriesId]) || 168);
          const isDropTarget = activeCurriculumSeriesDropIndicator
            && String(activeCurriculumSeriesDropIndicator.targetSeriesId || "").trim() === seriesId;
          const dropPlacement = isDropTarget
            ? String(activeCurriculumSeriesDropIndicator.placement || "").trim()
            : "";
          const dropColor = isDropTarget
            ? escapeValue(String(activeCurriculumSeriesDropIndicator.color || "#3975ab"))
            : "";
          const expandedSeriesWidthStyle = isExpanded
            ? 'width:' + escapeValue(String(expandedSeriesWidth)) + 'px;min-width:' + escapeValue(String(expandedSeriesWidth)) + 'px;max-width:' + escapeValue(String(expandedSeriesWidth)) + 'px;'
            : '';
          const manualHourDemand = Math.max(0, Number(seriesItem && seriesItem.hourDemand) || 0);
          const calculatedHourDemand = Math.max(0, Number(seriesCalculatedHourDemandLookup[seriesId]) || 0);
          const hasSeriesMismatch = calculatedHourDemand > 0 && calculatedHourDemand !== manualHourDemand;
          const seriesAssignment = seriesAssignments[seriesId] || null;
          const isHighlightedSeries = Boolean(highlightSeriesIdsLookup[seriesId]);
          const seriesRangeLabel = seriesAssignment
            ? formatInstructionSeriesRange(seriesAssignment.firstDate, seriesAssignment.lastDate)
            : "";
          const seriesWarningMarkup = seriesAssignment && seriesAssignment.hasWarning
            ? '<span class="planning-curriculum__warning" aria-hidden="true">&#9888;</span>'
            : '';
          const calculatedSeriesHourDemandMarkup = calculatedHourDemand > 0
            ? '<span class="planning-curriculum__calculated-hours' + (hasSeriesMismatch ? ' planning-curriculum__hours--mismatch' : '') + '"><span class="planning-curriculum__calculated-icon" aria-hidden="true">&#8721;</span><span>' + escapeValue(String(calculatedHourDemand)) + ' h</span></span>'
            : '';

          return [
            '<td class="planning-curriculum__cell planning-curriculum__cell--series', isDropTarget ? ' is-drop-target is-drop-target--' + escapeValue(dropPlacement || "after") : '', '"',
            ' data-series-drop-target="', escapeValue(seriesId), '"',
            (isExpanded || isDropTarget) ? ' style="' + (isDropTarget ? '--planning-curriculum-drop-color:' + dropColor + ';' : '') + expandedSeriesWidthStyle + '"' : '',
            ' ondragover="return window.UnterrichtsassistentApp.allowCurriculumSeriesDrop(event, \'', escapeValue(seriesId), '\')"',
            ' ondragleave="return window.UnterrichtsassistentApp.handleCurriculumSeriesDropLeave(event, \'', escapeValue(seriesId), '\')"',
            ' ondrop="return window.UnterrichtsassistentApp.dropCurriculumSeries(event, \'', escapeValue(seriesId), '\')"',
            '>',
            '<article class="planning-curriculum__series-block', isExpanded ? ' is-expanded' : '', isHighlightedSeries ? ' is-current-assigned' : '', '" style="--planning-curriculum-series-color:', seriesColor, ';', expandedSeriesWidthStyle, '" onclick="return window.UnterrichtsassistentApp.toggleCurriculumSeriesExpansion(\'', escapeValue(seriesId), '\')">',
            '<div class="planning-curriculum__card-top">',
            '<button class="planning-curriculum__series-drag" type="button" data-series-color="', seriesColor, '" aria-label="Unterrichtsreihe verschieben" onclick="return window.UnterrichtsassistentApp.stopEventPropagation(event)" onpointerdown="return window.UnterrichtsassistentApp.startCurriculumSeriesDrag(event, \'', escapeValue(seriesId), '\')" ondragstart="return window.UnterrichtsassistentApp.startCurriculumSeriesDrag(event, \'', escapeValue(seriesId), '\')" ondragend="return window.UnterrichtsassistentApp.endCurriculumSeriesDrag()">&#8645;</button>',
            '<div class="planning-curriculum__card-range">', escapeValue(seriesRangeLabel || ""), '</div>',
            '<button class="planning-curriculum__series-edit" type="button" aria-label="Unterrichtsreihe bearbeiten" onclick="window.UnterrichtsassistentApp.stopEventPropagation(event); return window.UnterrichtsassistentApp.openCurriculumSeriesModal(\'', escapeValue(String(seriesItem.id || "")), '\')">&#9998;</button>',
            '</div>',
            '<div class="planning-curriculum__series-topic">', seriesWarningMarkup, escapeValue(String(seriesItem.topic || "").trim() || "Ohne Thema"), '</div>',
            '<div class="planning-curriculum__series-footer"><div class="planning-curriculum__series-hours', calculatedHourDemand > 0 ? '' : ' planning-curriculum__series-hours--standalone', hasSeriesMismatch ? ' planning-curriculum__hours--mismatch' : '', '"><span>', escapeValue(String(manualHourDemand)), ' h</span>', calculatedSeriesHourDemandMarkup, '</div></div>',
            '</article>',
            '</td>'
          ].join("");
        }).join(""),
        '<td class="planning-curriculum__cell planning-curriculum__cell--add',
        activeCurriculumSeriesDropIndicator && !String(activeCurriculumSeriesDropIndicator.targetSeriesId || "").trim() ? ' is-drop-target is-drop-target--after' : '',
        '" data-series-drop-target-add="true"',
        activeCurriculumSeriesDropIndicator && !String(activeCurriculumSeriesDropIndicator.targetSeriesId || "").trim()
          ? ' style="--planning-curriculum-drop-color:' + escapeValue(String(activeCurriculumSeriesDropIndicator.color || "#3975ab")) + ';"'
          : '',
        ' ondragover="return window.UnterrichtsassistentApp.allowCurriculumSeriesDrop(event, \'\')" ondragleave="return window.UnterrichtsassistentApp.handleCurriculumSeriesDropLeave(event, \'\')" ondrop="return window.UnterrichtsassistentApp.dropCurriculumSeries(event, \'\')">',
        '<button class="planning-curriculum__add" type="button" aria-label="Unterrichtsreihe anlegen" onclick="return window.UnterrichtsassistentApp.openCurriculumSeriesModal()">+</button>',
        '</td>',
        '</tr>',
        expandedCurriculumSeriesIds.length ? [
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
              sequences.map(function (sequenceItem) {
                const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
                const sequenceExpansionKey = [seriesId, sequenceId].join("::");
                const isSequenceExpanded = Boolean(expandedSequenceIdsLookup[sequenceExpansionKey]);
                const expandedSequenceWidth = getExpandedSequenceBlockWidth(seriesId, sequenceItem, expandedSequenceIdsLookup);
                const isSequenceDropTarget = activeCurriculumSequenceDropIndicator
                  && String(activeCurriculumSequenceDropIndicator.seriesId || "").trim() === seriesId
                  && String(activeCurriculumSequenceDropIndicator.targetSequenceId || "").trim() === sequenceId;
                const sequenceDropPlacement = isSequenceDropTarget
                  ? String(activeCurriculumSequenceDropIndicator.placement || "").trim()
                  : "";
                const sequenceDropColor = isSequenceDropTarget
                  ? escapeValue(String(activeCurriculumSequenceDropIndicator.color || "#3975ab"))
                  : "";
                const manualSequenceHourDemand = Math.max(0, Number(sequenceItem && sequenceItem.hourDemand) || 0);
                const calculatedSequenceHourDemand = Math.max(0, Number(sequenceCalculatedHourDemandLookup[sequenceId]) || 0);
                const hasSequenceMismatch = calculatedSequenceHourDemand > 0 && calculatedSequenceHourDemand !== manualSequenceHourDemand;
                const sequenceAssignment = sequenceAssignments[sequenceId] || null;
                const isHighlightedSequence = Boolean(highlightSequenceIdsLookup[sequenceId]);
                const sequenceRangeLabel = sequenceAssignment
                  ? formatInstructionSeriesRange(sequenceAssignment.firstDate, sequenceAssignment.lastDate)
                  : "";
                const sequenceWarningMarkup = sequenceAssignment && sequenceAssignment.hasWarning
                  ? '<span class="planning-curriculum__warning" aria-hidden="true">&#9888;</span>'
                  : '';
                const calculatedSequenceHourDemandMarkup = calculatedSequenceHourDemand > 0
                  ? '<span class="planning-curriculum__calculated-hours' + (hasSequenceMismatch ? ' planning-curriculum__hours--mismatch' : '') + '"><span class="planning-curriculum__calculated-icon" aria-hidden="true">&#8721;</span><span>' + escapeValue(String(calculatedSequenceHourDemand)) + ' h</span></span>'
                  : '';

                return [
                  '<article class="planning-curriculum__sequence-block', isSequenceExpanded ? ' is-expanded' : '', isHighlightedSequence ? ' is-current-assigned' : '', isSequenceDropTarget ? ' is-drop-target is-drop-target--' + escapeValue(sequenceDropPlacement || "after") : '', '" data-sequence-drop-target="', escapeValue(sequenceId), '" data-series-id="', escapeValue(seriesId), '" style="--planning-curriculum-series-color:', sequenceColor, ';', isSequenceDropTarget ? '--planning-curriculum-drop-color:' + sequenceDropColor + ';' : '', 'width:', escapeValue(String(expandedSequenceWidth)), 'px;min-width:', escapeValue(String(expandedSequenceWidth)), 'px;max-width:', escapeValue(String(expandedSequenceWidth)), 'px;" onclick="return window.UnterrichtsassistentApp.toggleCurriculumSequenceExpansion(\'', escapeValue(seriesId), '\', \'', escapeValue(sequenceId), '\')">',
                  '<div class="planning-curriculum__card-top planning-curriculum__card-top--sequence">',
                  '<button class="planning-curriculum__series-drag planning-curriculum__sequence-drag" type="button" data-series-color="', sequenceColor, '" aria-label="Unterrichtssequenz verschieben" onclick="return window.UnterrichtsassistentApp.stopEventPropagation(event)" onpointerdown="return window.UnterrichtsassistentApp.startCurriculumSequenceDrag(event, \'', escapeValue(seriesId), '\', \'', escapeValue(sequenceId), '\')">&#8645;</button>',
                  '<div class="planning-curriculum__card-range planning-curriculum__card-range--sequence">', escapeValue(sequenceRangeLabel || ""), '</div>',
                  '<button class="planning-curriculum__series-edit" type="button" aria-label="Unterrichtssequenz bearbeiten" onclick="window.UnterrichtsassistentApp.stopEventPropagation(event); return window.UnterrichtsassistentApp.openCurriculumSequenceModal(\'', escapeValue(seriesId), '\', \'', escapeValue(String(sequenceItem.id || "")), '\')">&#9998;</button>',
                  '</div>',
                  '<div class="planning-curriculum__sequence-header">', sequenceWarningMarkup, escapeValue(String(sequenceItem.topic || "").trim() || "Ohne Thema"), '</div>',
                  '<div class="planning-curriculum__sequence-footer"><span class="planning-curriculum__sequence-hours', calculatedSequenceHourDemand > 0 ? '' : ' planning-curriculum__sequence-hours--standalone', hasSequenceMismatch ? ' planning-curriculum__hours--mismatch' : '', '"><span>', escapeValue(String(manualSequenceHourDemand)), ' h</span>', calculatedSequenceHourDemandMarkup, '</span></div>',
                  '</article>'
                ].join("");
              }).join(""),
              '<button class="planning-curriculum__add planning-curriculum__add--sequence', activeCurriculumSequenceDropIndicator && String(activeCurriculumSequenceDropIndicator.seriesId || "").trim() === seriesId && !String(activeCurriculumSequenceDropIndicator.targetSequenceId || "").trim() ? ' is-drop-target is-drop-target--after' : '', '" data-sequence-drop-target-add="true" data-series-id="', escapeValue(seriesId), '"', activeCurriculumSequenceDropIndicator && String(activeCurriculumSequenceDropIndicator.seriesId || "").trim() === seriesId && !String(activeCurriculumSequenceDropIndicator.targetSequenceId || "").trim() ? ' style="--planning-curriculum-drop-color:' + escapeValue(String(activeCurriculumSequenceDropIndicator.color || "#3975ab")) + ';"' : '', ' type="button" aria-label="Unterrichtssequenz anlegen" onclick="return window.UnterrichtsassistentApp.openCurriculumSequenceModal(\'', escapeValue(seriesId), '\')">+</button>',
              '</div>',
              '</td>'
            ].join("");
          }).join(""),
          '<td class="planning-curriculum__cell planning-curriculum__cell--spacer"></td>',
          '</tr>'
        ].join("") : '',
        expandedCurriculumSequenceIds.length ? [
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
              sequences.map(function (sequenceItem) {
                const sequenceId = String(sequenceItem && sequenceItem.id || "").trim();
                const sequenceExpansionKey = [seriesId, sequenceId].join("::");
                const isSequenceExpanded = Boolean(expandedSequenceIdsLookup[sequenceExpansionKey]);
                const expandedLessonWidth = getExpandedLessonColumnWidth(sequenceId, isSequenceExpanded);

                if (!isSequenceExpanded) {
                  return '<div class="planning-curriculum__lesson-column planning-curriculum__lesson-column--spacer"></div>';
                }

                return [
                  '<div class="planning-curriculum__lesson-column" style="width:', escapeValue(String(expandedLessonWidth)), 'px;min-width:', escapeValue(String(expandedLessonWidth)), 'px;max-width:', escapeValue(String(expandedLessonWidth)), 'px;">',
                  '<div class="planning-curriculum__lesson-wrap" style="width:', escapeValue(String(expandedLessonWidth)), 'px;min-width:', escapeValue(String(expandedLessonWidth)), 'px;max-width:', escapeValue(String(expandedLessonWidth)), 'px;">',
                  getOrderedCurriculumLessonsForSequence(sequenceId).map(function (lessonItem) {
                    const lessonId = String(lessonItem && lessonItem.id || "").trim();
                    const lessonColor = escapeValue(String(seriesItem && seriesItem.color || "#d9d4cb"));
                    const lessonAssignment = lessonPlanAssignments[lessonId] || null;
                    const isHighlightedLesson = Boolean(highlightLessonIdsLookup[lessonId]);
                    const lessonDateLabel = lessonAssignment && lessonAssignment.firstDate
                      ? formatShortDateLabel(lessonAssignment.firstDate)
                      : "";
                    const lessonWarningMarkup = lessonAssignment && lessonAssignment.hasWarning
                      ? '<span class="planning-curriculum__lesson-warning" aria-hidden="true">&#9888;</span>'
                      : '';
                    const isLessonDropTarget = activeCurriculumLessonDropIndicator
                      && String(activeCurriculumLessonDropIndicator.sequenceId || "").trim() === sequenceId
                      && String(activeCurriculumLessonDropIndicator.targetLessonId || "").trim() === lessonId;
                    const lessonDropPlacement = isLessonDropTarget
                      ? String(activeCurriculumLessonDropIndicator.placement || "").trim()
                      : "";
                    const lessonDropColor = isLessonDropTarget
                      ? escapeValue(String(activeCurriculumLessonDropIndicator.color || "#3975ab"))
                      : "";
                    return [
                      '<article class="planning-curriculum__lesson-block planning-curriculum__lesson-block--', escapeValue(String(lessonItem && lessonItem.hourType || "single") === "double" ? 'double' : 'single'), activeCurriculumLessonFlowLessonId === lessonId ? ' is-selected' : '', isHighlightedLesson ? ' is-current-assigned' : '', isLessonDropTarget ? ' is-drop-target is-drop-target--' + escapeValue(lessonDropPlacement || "after") : '', '" data-lesson-drop-target="', escapeValue(lessonId), '" data-sequence-id="', escapeValue(sequenceId), '"', lessonAssignment && lessonAssignment.firstDate ? ' title="' + escapeValue(formatInstructionSeriesRange(lessonAssignment.firstDate, lessonAssignment.lastDate)) + '"' : '', ' style="', isLessonDropTarget ? '--planning-curriculum-drop-color:' + lessonDropColor + ';"' : '', '" onclick="return window.UnterrichtsassistentApp.selectCurriculumLessonFlow(\'', escapeValue(seriesId), '\', \'', escapeValue(sequenceId), '\', \'', escapeValue(lessonId), '\')">',
                      '<button class="planning-curriculum__series-drag planning-curriculum__lesson-drag" type="button" aria-label="Unterrichtsstunde verschieben" onclick="return window.UnterrichtsassistentApp.stopEventPropagation(event)" onpointerdown="return window.UnterrichtsassistentApp.startCurriculumLessonDrag(event, \'', escapeValue(sequenceId), '\', \'', escapeValue(lessonId), '\', \'', lessonColor, '\')">&#8645;</button>',
                      '<button class="planning-curriculum__series-edit planning-curriculum__lesson-edit" type="button" aria-label="Unterrichtsstunde bearbeiten" onclick="window.UnterrichtsassistentApp.stopEventPropagation(event); return window.UnterrichtsassistentApp.openCurriculumLessonModal(\'', escapeValue(seriesId), '\', \'', escapeValue(sequenceId), '\', \'', escapeValue(String(lessonItem && lessonItem.id || "")), '\')">&#9998;</button>',
                      lessonDateLabel || lessonWarningMarkup ? '<div class="planning-curriculum__lesson-date">' + lessonWarningMarkup + escapeValue(lessonDateLabel) + '</div>' : '',
                      '<div class="planning-curriculum__lesson-topic">', escapeValue(String(lessonItem && lessonItem.topic || "").trim() || "Ohne Thema"), '</div>',
                      '<div class="planning-curriculum__lesson-type">', String(lessonItem && lessonItem.hourType || "").trim() === "double" ? 'Doppel' : 'Einzel', '</div>',
                      '</article>'
                    ].join("");
                  }).join(""),
                  '<button class="planning-curriculum__add planning-curriculum__add--lesson', activeCurriculumLessonDropIndicator && String(activeCurriculumLessonDropIndicator.sequenceId || "").trim() === sequenceId && !String(activeCurriculumLessonDropIndicator.targetLessonId || "").trim() ? ' is-drop-target is-drop-target--after' : '', '" data-lesson-drop-target-add="true" data-sequence-id="', escapeValue(sequenceId), '"', activeCurriculumLessonDropIndicator && String(activeCurriculumLessonDropIndicator.sequenceId || "").trim() === sequenceId && !String(activeCurriculumLessonDropIndicator.targetLessonId || "").trim() ? ' style="--planning-curriculum-drop-color:' + escapeValue(String(activeCurriculumLessonDropIndicator.color || "#3975ab")) + ';"' : '', ' type="button" aria-label="Unterrichtsstunde anlegen" onclick="return window.UnterrichtsassistentApp.openCurriculumLessonModal(\'', escapeValue(seriesId), '\', \'', escapeValue(sequenceId), '\')">+</button>',
                  '</div>',
                  '</div>'
                ].join("");
              }).join(""),
              '</div>',
              '</td>'
            ].join("");
          }).join(""),
          '<td class="planning-curriculum__cell planning-curriculum__cell--spacer"></td>',
          '</tr>'
        ].join("") : '',
        '</tbody>',
        '</table>',
        '</div>',
        shouldWrapInPanel ? '</article>' : '</div>',
        buildCurriculumSeriesModal(),
        buildCurriculumSequenceModal(),
        buildCurriculumLessonModal(),
        shouldWrapInPanel ? '</div>' : ''
      ]).join("");
    }

    if (planningViewMode === "jahresplanung" && (!startDate || !endDate || startDate > endDate)) {
      return [
        '<div class="panel-grid panel-grid--planung">',
        '<article class="panel panel--full">',
        isPlanningAdminMode
          ? buildAdminContent('<p class="empty-message">Der letzte Tag des Schuljahres muss auf oder nach dem ersten Tag liegen.</p>')
          : '<p class="empty-message">Der letzte Tag des Schuljahres muss auf oder nach dem ersten Tag liegen.</p>',
        '</article>',
        '</div>'
      ].join("");
    }

    if (isPlanningAdminMode && planningViewMode === "jahresplanung") {
      return [
        '<div class="panel-grid panel-grid--planung">',
        '<article class="panel panel--full">',
        buildAdminContent(""),
        '</article>',
        '</div>'
      ].join("");
    }

    if (planningViewMode === "unterrichtsplanung") {
      return buildInstructionPlanningContent();
    }

    if (planningViewMode === "stoffplanung") {
      return buildInstructionPlanningContent();
    }

    if (activePlanningDate && activePlanningDate > endDate) {
      return [
        '<div class="panel-grid panel-grid--planung" onclick="return window.UnterrichtsassistentApp.handlePlanningBackgroundClick(event)">',
        '<article class="panel panel--planung-calendar">',
        '<p class="empty-message">Das aktive Datum liegt bereits nach dem Ende des eingestellten Schuljahres.</p>',
        '</article>',
        '<aside class="panel panel--planung-sidebar">',
        '<h2 class="planning-sidebar__title">Termine</h2>',
        buildSidebarEventList(activePlanningDate),
        '</aside>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="panel-grid panel-grid--planung" onclick="return window.UnterrichtsassistentApp.handlePlanningBackgroundClick(event)">',
      '<article class="panel panel--planung-calendar">',
      '<div class="planning-year__calendar">',
      buildMonthCards(startDate, endDate, activePlanningDate),
      '</div>',
      '</article>',
      '<aside class="panel panel--planung-sidebar">',
      '<h2 class="planning-sidebar__title">Termine</h2>',
      buildSidebarEventList(activePlanningDate),
      '</aside>',
      planningEventDraft ? [
        '<div class="import-modal is-open" id="planningEventModal">',
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closePlanningEventModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--planning" role="dialog" aria-modal="true" aria-labelledby="planningEventTitle">',
        '<div class="import-modal__header">',
        '<div><h3 id="planningEventTitle">', planningEventDraft.id ? 'Termin bearbeiten' : 'Termin hinzufuegen', '</h3>',
        planningEventDraft.isExternallyControlled ? '<div class="planning-event-form__control-note">Dieser Termin wird vom View ' + escapeValue(planningEventControlledByLabel) + ' kontrolliert und kann hier nicht bearbeitet werden.</div>' : '',
        '</div>',
        '<div class="import-modal__icon-actions">',
        '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="submit" form="planningEventForm" aria-label="Termin uebernehmen"', planningEventDraft.isExternallyControlled ? ' disabled' : '', '>&#10003;</button>',
        '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Bearbeitung abbrechen" onclick="return window.UnterrichtsassistentApp.closePlanningEventModal()">&#10005;</button>',
        '</div>',
        '</div>',
        '<form class="import-modal__form planning-event-form" id="planningEventForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitPlanningEventModal(event)">',
        '<section class="planning-event-form__section planning-event-form__section--meta">',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--title"><span>Titel</span><input id="planningEventTitleInput" type="text" value="', escapeValue(planningEventDraft.title || ""), '" placeholder="Titel des Termins"', planningEventDraft.isExternallyControlled ? ' disabled' : '', '></label>',
        '<label class="import-modal__field import-modal__field--knowledge-gap"><span>Kategorie</span><input id="planningEventCategory" type="text" value="', escapeValue(planningEventDraft.category || ""), '" placeholder="Kategorie" autocomplete="off" autocapitalize="none" spellcheck="false"', planningEventDraft.isExternallyControlled ? ' disabled' : ' onfocus="return window.UnterrichtsassistentApp.handlePlanningCategoryInputFocus(\'planningEventCategory\', \'planningEventCategorySuggestions\')" oninput="return window.UnterrichtsassistentApp.handlePlanningCategoryInput(event, \'planningEventCategorySuggestions\')" onblur="return window.UnterrichtsassistentApp.handlePlanningCategoryInputBlur(\'planningEventCategorySuggestions\')"', '><div class="knowledge-gap-suggestions knowledge-gap-suggestions--planning" id="planningEventCategorySuggestions" hidden onpointerdown="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerDown(event, \'planningEventCategorySuggestions\')" onpointermove="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerMove(event, \'planningEventCategorySuggestions\')" onpointerup="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerUp(event, \'planningEventCategorySuggestions\')" onpointercancel="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerUp(event, \'planningEventCategorySuggestions\')"></div></label>',
        '<label class="import-modal__field"><span>Prioritaet</span><select id="planningEventPriority"', planningEventDraft.isExternallyControlled ? ' disabled' : '', '><option value="1"', Number(planningEventDraft.priority || 3) === 1 ? ' selected' : '', '>hoch</option><option value="2"', Number(planningEventDraft.priority || 3) === 2 ? ' selected' : '', '>standard</option><option value="3"', Number(planningEventDraft.priority || 3) === 3 ? ' selected' : '', '>niederig</option></select></label>',
        '</section>',
        '<section class="planning-event-form__section planning-event-form__section--description">',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--description"><span>Beschreibung</span><textarea id="planningEventDescription" rows="10" placeholder="Beschreibung des Termins"', planningEventDraft.isExternallyControlled ? ' disabled' : '', '>', escapeValue(planningEventDraft.description || ""), '</textarea></label>',
        '</section>',
        '<section class="planning-event-form__section planning-event-form__section--schedule">',
        '<div class="planning-event-form__schedule-block">',
        '<div class="planning-event-form__grid planning-event-form__grid--schedule-row">',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--schedule', planningEventDraft.isExternallyControlled ? ' is-disabled' : '', '"><span>Start Datum</span><input id="planningEventStartDate" type="date" value="', escapeValue(planningEventDraft.startDate || planningEventDraft.date || ""), '" required', planningEventDraft.isExternallyControlled ? ' disabled' : '', '></label>',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--schedule', planningEventDraft.isExternallyControlled ? ' is-disabled' : '', '"><span>Start Zeit</span><input id="planningEventStartTime" type="time" value="', escapeValue(planningEventDraft.startTime || ""), '"', planningEventDraft.isExternallyControlled ? ' disabled' : '', '></label>',
        '</div>',
        '<div class="planning-event-form__grid planning-event-form__grid--schedule-row">',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--schedule', planningEventDraft.isExternallyControlled ? ' is-disabled' : '', '"><span>Ende Datum</span><input id="planningEventEndDate" type="date" value="', escapeValue(planningEventDraft.endDate || planningEventDraft.date || ""), '" required', planningEventDraft.isExternallyControlled ? ' disabled' : '', '></label>',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--schedule', planningEventDraft.isExternallyControlled ? ' is-disabled' : '', '"><span>Ende Zeit</span><input id="planningEventEndTime" type="time" value="', escapeValue(planningEventDraft.endTime || ""), '"', planningEventDraft.isExternallyControlled ? ' disabled' : '', '></label>',
        '</div>',
        '<div class="planning-event-form__recurrence-card', planningEventDraft.isExternallyControlled ? ' is-disabled' : '', '">',
        '<label class="planning-event-form__toggle">',
        '<input id="planningEventRecurringInput" type="checkbox"', isPlanningEventRecurring ? ' checked' : '', planningEventDraft.isExternallyControlled ? ' disabled' : ' onchange="return window.UnterrichtsassistentApp.handlePlanningEventRecurringChange(this.checked)"', '>',
        '<span>Wiederkehrend</span>',
        '</label>',
        isPlanningEventRecurring ? [
          '<div class="planning-event-form__recurrence-rule">',
          '<span class="planning-event-form__recurrence-prefix">Alle</span>',
          '<input id="planningEventRecurrenceInterval" class="planning-event-form__recurrence-number" type="number" min="1" step="1" value="', escapeValue(String(planningEventDraft.recurrenceInterval || 1)), '"', planningEventDraft.isExternallyControlled ? ' disabled' : '', '>',
          '<select id="planningEventRecurrenceUnit"', planningEventDraft.isExternallyControlled ? ' disabled' : ' onchange="return window.UnterrichtsassistentApp.handlePlanningEventRecurrenceUnitChange(this.value)"', '>',
          '<option value="days"', planningEventRecurrenceUnit === 'days' ? ' selected' : '', '>Tage</option>',
          '<option value="weeks"', planningEventRecurrenceUnit === 'weeks' ? ' selected' : '', '>Wochen</option>',
          '<option value="months"', planningEventRecurrenceUnit === 'months' ? ' selected' : '', '>Monate</option>',
          '</select>',
          '</div>',
          showMonthlyWeekdayOption
            ? '<label class="planning-event-form__toggle planning-event-form__toggle--secondary"><input id="planningEventRecurrenceMonthlyWeekday" type="checkbox"' + (planningEventDraft.recurrenceMonthlyWeekday ? ' checked' : '') + (planningEventDraft.isExternallyControlled ? ' disabled' : '') + '><span>Monatsposition und Wochentag beibehalten (z. B. erster Montag)</span></label>'
            : '<input id="planningEventRecurrenceMonthlyWeekday" type="checkbox" hidden' + (planningEventDraft.recurrenceMonthlyWeekday ? ' checked' : '') + '>',
          '<label class="import-modal__field planning-event-form__field planning-event-form__field--recurrence"><span>Ende der Wiederholung</span><input id="planningEventRecurrenceUntilDate" type="date" value="', escapeValue(planningEventDraft.recurrenceUntilDate || ""), '" required', planningEventDraft.isExternallyControlled ? ' disabled' : '', '></label>'
        ].join("")
          : [
              '<input id="planningEventRecurrenceInterval" type="number" value="', escapeValue(String(planningEventDraft.recurrenceInterval || 1)), '" hidden>',
              '<input id="planningEventRecurrenceUnit" type="hidden" value="', escapeValue(planningEventRecurrenceUnit || "weeks"), '">',
              '<input id="planningEventRecurrenceMonthlyWeekday" type="checkbox" hidden', planningEventDraft.recurrenceMonthlyWeekday ? ' checked' : '', '>',
              '<input id="planningEventRecurrenceUntilDate" type="date" value="', escapeValue(planningEventDraft.recurrenceUntilDate || ""), '" hidden>',
              '<p class="planning-event-form__recurrence-hint">Der Termin bleibt einmalig. Mit der Wiederholung werden Datumsspanne und Uhrzeiten fuer alle Folgetermine uebernommen.</p>'
            ].join(""),
        '</div>',
        '</div>',
        '</section>',
        '</form>',
        '</div>',
        '</div>'
      ].join("") : "",
      '</div>'
    ].join("");
  }
};

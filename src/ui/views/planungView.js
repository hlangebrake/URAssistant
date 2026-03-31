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
    const curriculumSeriesDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveCurriculumSeriesDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveCurriculumSeriesDraft()
      : null;
    const curriculumSequenceDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveCurriculumSequenceDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveCurriculumSequenceDraft()
      : null;
    const curriculumLessonDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveCurriculumLessonDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveCurriculumLessonDraft()
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
    const planningEvents = Array.isArray(snapshot.planningEvents) ? snapshot.planningEvents : [];
    const selectedSidebarFilters = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getPlanningSidebarCategoryFilters === "function"
      ? window.UnterrichtsassistentApp.getPlanningSidebarCategoryFilters()
      : [];
    const isSidebarFilterOpen = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isPlanningSidebarFilterOpen === "function"
      ? window.UnterrichtsassistentApp.isPlanningSidebarFilterOpen()
      : false;
    const isSidebarFilterAllOff = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isPlanningSidebarFilterAllOff === "function"
      ? window.UnterrichtsassistentApp.isPlanningSidebarFilterAllOff()
      : false;
    const selectedPlanningEventId = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSelectedPlanningEventId === "function"
      ? window.UnterrichtsassistentApp.getSelectedPlanningEventId()
      : "";

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
      const normalizedSelected = selectedSidebarFilters.map(function (entry) {
        return String(entry || "").trim().toLowerCase();
      });
      const filteredEvents = upcomingEvents.filter(function (eventItem) {
        const category = getEventCategoryName(eventItem);
        const normalizedCategory = category.toLowerCase();

        if (category) {
          availableCategories[normalizedCategory] = category;
        }

        if (!normalizedSelected.length && !isSidebarFilterAllOff) {
          return true;
        }

        return normalizedSelected.indexOf(normalizedCategory) >= 0;
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
            const isSelected = normalizedSelected.indexOf(String(categoryName || "").trim().toLowerCase()) >= 0;
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
                const isSelected = String(eventItem.id || "").trim() === selectedPlanningEventId;

                return [
                  '<div class="planning-sidebar__event-row">',
                  '<button class="planning-sidebar__event', isSelected ? ' is-selected' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.selectPlanningEvent(\'', escapeValue(String(eventItem.id || "")), '\')">',
                  '<span class="planning-sidebar__event-date">', escapeValue(buildEventDateLabel(eventItem)), '</span>',
                  '<span class="planning-sidebar__event-main"><span class="planning-sidebar__event-marker">', buildEventMarker(eventItem), '</span><span class="planning-sidebar__event-title">', escapeValue(summary), '</span></span>',
                  category ? '<span class="planning-sidebar__event-category">' + escapeValue(category) + '</span>' : '',
                  timeLabel ? '<span class="planning-sidebar__event-time">' + escapeValue(timeLabel) + '</span>' : '',
                  '</button>',
                  '<div class="planning-sidebar__event-actions">',
                  '<button class="planning-sidebar__edit" type="button" aria-label="Termin bearbeiten" onclick="return window.UnterrichtsassistentApp.openPlanningEventModal(\'\', \'', escapeValue(String(eventItem.id || "")), '\')">&#9998;</button>',
                  '<button class="planning-sidebar__delete" type="button" aria-label="Termin loeschen" onclick="return window.UnterrichtsassistentApp.deletePlanningEvent(\'', escapeValue(String(eventItem.id || "")), '\')">&#10005;</button>',
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
        return getEventCategoryName(eventItem).toLowerCase() !== "unterrichtsfrei";
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
      const selectedPlanningEvent = selectedPlanningEventId
        ? planningEvents.find(function (eventItem) {
            return String(eventItem && eventItem.id || "").trim() === selectedPlanningEventId;
          }) || null
        : null;
      const selectedEventStart = selectedPlanningEvent
        ? String(selectedPlanningEvent.startDate || "").slice(0, 10)
        : "";
      const selectedEventEnd = selectedPlanningEvent
        ? String(selectedPlanningEvent.endDate || selectedEventStart).slice(0, 10)
        : "";

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
              occurrencesByDate[isoDate] = {
                id: "unterrichtstag::" + isoDate,
                lessonDate: isoDate,
                lessonCount: 0,
                remainingLessonCount: 0
              };
            }

            occurrencesByDate[isoDate].lessonCount += Math.max(1, lessonCount);

            if (!isLessonOccurrencePast(isoDate, lessonUnit && lessonUnit.endTime)) {
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

    function buildInstructionPlanningContent() {
      const lessonOccurrences = buildInstructionLessonOccurrences();
      const classColor = getClassDisplayColor(activeClass);
      const classLabel = getClassDisplayName(activeClass) || "Aktive Lerngruppe";
      const totalLessonCount = lessonOccurrences.reduce(function (sum, occurrence) {
        return sum + Math.max(1, Number(occurrence && occurrence.lessonCount || 1));
      }, 0);
      const remainingLessonCount = lessonOccurrences.reduce(function (sum, occurrence) {
        return sum + Math.max(0, Number(occurrence && occurrence.remainingLessonCount || 0));
      }, 0);

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
        buildStoffPlanningContent(false),
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
                    return [
                      '<article class="planning-instruction__lesson', Number(occurrence.remainingLessonCount || 0) <= 0 ? ' planning-instruction__lesson--past' : '', '" style="--planning-instruction-color:', escapeValue(classColor), ';">',
                      '<div class="planning-instruction__lesson-date">', escapeValue(formatShortDateLabel(occurrence.lessonDate)), '</div>',
                      '<div class="planning-instruction__lesson-count">', escapeValue(String(Math.max(1, Number(occurrence.lessonCount || 1)))), '</div>',
                      '</article>'
                    ].join("");
                  }).join("") + '</div>'
                : '<p class="empty-message">Fuer die aktive Lerngruppe wurden im aktuellen Schuljahr keine tatsaechlichen Unterrichtsstunden gefunden.</p>'
            )
          : '',
        '</section>',
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

    function getCurriculumLessonVisualWidth(lessonItem) {
      return String(lessonItem && lessonItem.hourType || "").trim() === "double" ? 56 : 44;
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

    function buildStoffPlanningContent(includePanelWrapper) {
      const shouldWrapInPanel = includePanelWrapper !== false;
      const orderedSeries = getOrderedCurriculumSeriesForActiveClass();
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
            '<div class="planning-curriculum planning-curriculum--embedded">'
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

          return [
            '<td class="planning-curriculum__cell planning-curriculum__cell--series', isDropTarget ? ' is-drop-target is-drop-target--' + escapeValue(dropPlacement || "after") : '', '"',
            ' data-series-drop-target="', escapeValue(seriesId), '"',
            (isExpanded || isDropTarget) ? ' style="' + (isDropTarget ? '--planning-curriculum-drop-color:' + dropColor + ';' : '') + expandedSeriesWidthStyle + '"' : '',
            ' ondragover="return window.UnterrichtsassistentApp.allowCurriculumSeriesDrop(event, \'', escapeValue(seriesId), '\')"',
            ' ondragleave="return window.UnterrichtsassistentApp.handleCurriculumSeriesDropLeave(event, \'', escapeValue(seriesId), '\')"',
            ' ondrop="return window.UnterrichtsassistentApp.dropCurriculumSeries(event, \'', escapeValue(seriesId), '\')"',
            '>',
            '<article class="planning-curriculum__series-block', isExpanded ? ' is-expanded' : '', '" style="--planning-curriculum-series-color:', seriesColor, ';', expandedSeriesWidthStyle, '" onclick="return window.UnterrichtsassistentApp.toggleCurriculumSeriesExpansion(\'', escapeValue(seriesId), '\')">',
            '<button class="planning-curriculum__series-drag" type="button" data-series-color="', seriesColor, '" aria-label="Unterrichtsreihe verschieben" onclick="return window.UnterrichtsassistentApp.stopEventPropagation(event)" onpointerdown="return window.UnterrichtsassistentApp.startCurriculumSeriesDrag(event, \'', escapeValue(seriesId), '\')" ondragstart="return window.UnterrichtsassistentApp.startCurriculumSeriesDrag(event, \'', escapeValue(seriesId), '\')" ondragend="return window.UnterrichtsassistentApp.endCurriculumSeriesDrag()">&#8645;</button>',
            '<button class="planning-curriculum__series-edit" type="button" aria-label="Unterrichtsreihe bearbeiten" onclick="window.UnterrichtsassistentApp.stopEventPropagation(event); return window.UnterrichtsassistentApp.openCurriculumSeriesModal(\'', escapeValue(String(seriesItem.id || "")), '\')">&#9998;</button>',
            '<div class="planning-curriculum__series-topic">', escapeValue(String(seriesItem.topic || "").trim() || "Ohne Thema"), '</div>',
            '<div class="planning-curriculum__series-footer"><div class="planning-curriculum__series-hours">', escapeValue(String(Math.max(0, Number(seriesItem.hourDemand) || 0))), ' Std.</div><span class="planning-curriculum__toggle" aria-hidden="true">', isExpanded ? '&#9660;' : '&#9654;', '</span></div>',
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

                return [
                  '<article class="planning-curriculum__sequence-block', isSequenceExpanded ? ' is-expanded' : '', isSequenceDropTarget ? ' is-drop-target is-drop-target--' + escapeValue(sequenceDropPlacement || "after") : '', '" data-sequence-drop-target="', escapeValue(sequenceId), '" data-series-id="', escapeValue(seriesId), '" style="--planning-curriculum-series-color:', sequenceColor, ';', isSequenceDropTarget ? '--planning-curriculum-drop-color:' + sequenceDropColor + ';' : '', 'width:', escapeValue(String(expandedSequenceWidth)), 'px;min-width:', escapeValue(String(expandedSequenceWidth)), 'px;max-width:', escapeValue(String(expandedSequenceWidth)), 'px;" onclick="return window.UnterrichtsassistentApp.toggleCurriculumSequenceExpansion(\'', escapeValue(seriesId), '\', \'', escapeValue(sequenceId), '\')">',
                  '<button class="planning-curriculum__series-drag planning-curriculum__sequence-drag" type="button" data-series-color="', sequenceColor, '" aria-label="Unterrichtssequenz verschieben" onclick="return window.UnterrichtsassistentApp.stopEventPropagation(event)" onpointerdown="return window.UnterrichtsassistentApp.startCurriculumSequenceDrag(event, \'', escapeValue(seriesId), '\', \'', escapeValue(sequenceId), '\')">&#8645;</button>',
                  '<button class="planning-curriculum__series-edit" type="button" aria-label="Unterrichtssequenz bearbeiten" onclick="window.UnterrichtsassistentApp.stopEventPropagation(event); return window.UnterrichtsassistentApp.openCurriculumSequenceModal(\'', escapeValue(seriesId), '\', \'', escapeValue(String(sequenceItem.id || "")), '\')">&#9998;</button>',
                  '<div class="planning-curriculum__sequence-header">', escapeValue(String(sequenceItem.topic || "").trim() || "Ohne Thema"), '</div>',
                  '<div class="planning-curriculum__sequence-footer"><span>', escapeValue(String(Math.max(0, Number(sequenceItem.hourDemand) || 0))), ' Std.</span><span class="planning-curriculum__toggle" aria-hidden="true">', isSequenceExpanded ? '&#9660;' : '&#9654;', '</span></div>',
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
                      '<article class="planning-curriculum__lesson-block planning-curriculum__lesson-block--', escapeValue(String(lessonItem && lessonItem.hourType || "single") === "double" ? 'double' : 'single'), isLessonDropTarget ? ' is-drop-target is-drop-target--' + escapeValue(lessonDropPlacement || "after") : '', '" data-lesson-drop-target="', escapeValue(lessonId), '" data-sequence-id="', escapeValue(sequenceId), '" style="', isLessonDropTarget ? '--planning-curriculum-drop-color:' + lessonDropColor + ';"' : '', '">',
                      '<button class="planning-curriculum__series-drag planning-curriculum__lesson-drag" type="button" aria-label="Unterrichtsstunde verschieben" onclick="return window.UnterrichtsassistentApp.stopEventPropagation(event)" onpointerdown="return window.UnterrichtsassistentApp.startCurriculumLessonDrag(event, \'', escapeValue(sequenceId), '\', \'', escapeValue(lessonId), '\', \'', lessonColor, '\')">&#8645;</button>',
                      '<button class="planning-curriculum__series-edit planning-curriculum__lesson-edit" type="button" aria-label="Unterrichtsstunde bearbeiten" onclick="window.UnterrichtsassistentApp.stopEventPropagation(event); return window.UnterrichtsassistentApp.openCurriculumLessonModal(\'', escapeValue(seriesId), '\', \'', escapeValue(sequenceId), '\', \'', escapeValue(String(lessonItem && lessonItem.id || "")), '\')">&#9998;</button>',
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
        '<div><h3 id="planningEventTitle">', planningEventDraft.id ? 'Termin bearbeiten' : 'Termin hinzufuegen', '</h3></div>',
        '<div class="import-modal__icon-actions">',
        '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="submit" form="planningEventForm" aria-label="Termin uebernehmen">&#10003;</button>',
        '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Bearbeitung abbrechen" onclick="return window.UnterrichtsassistentApp.closePlanningEventModal()">&#10005;</button>',
        '</div>',
        '</div>',
        '<form class="import-modal__form planning-event-form" id="planningEventForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitPlanningEventModal(event)">',
        '<section class="planning-event-form__section planning-event-form__section--meta">',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--title"><span>Titel</span><input id="planningEventTitleInput" type="text" value="', escapeValue(planningEventDraft.title || ""), '" placeholder="Titel des Termins"></label>',
        '<label class="import-modal__field import-modal__field--knowledge-gap"><span>Kategorie</span><input id="planningEventCategory" type="text" value="', escapeValue(planningEventDraft.category || ""), '" placeholder="Kategorie" autocomplete="off" autocapitalize="none" spellcheck="false" onfocus="return window.UnterrichtsassistentApp.handlePlanningCategoryInputFocus(\'planningEventCategory\', \'planningEventCategorySuggestions\')" oninput="return window.UnterrichtsassistentApp.handlePlanningCategoryInput(event, \'planningEventCategorySuggestions\')" onblur="return window.UnterrichtsassistentApp.handlePlanningCategoryInputBlur(\'planningEventCategorySuggestions\')"><div class="knowledge-gap-suggestions knowledge-gap-suggestions--planning" id="planningEventCategorySuggestions" hidden onpointerdown="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerDown(event, \'planningEventCategorySuggestions\')" onpointermove="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerMove(event, \'planningEventCategorySuggestions\')" onpointerup="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerUp(event, \'planningEventCategorySuggestions\')" onpointercancel="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerUp(event, \'planningEventCategorySuggestions\')"></div></label>',
        '<label class="import-modal__field"><span>Prioritaet</span><select id="planningEventPriority"><option value="1"', Number(planningEventDraft.priority || 3) === 1 ? ' selected' : '', '>hoch</option><option value="2"', Number(planningEventDraft.priority || 3) === 2 ? ' selected' : '', '>standard</option><option value="3"', Number(planningEventDraft.priority || 3) === 3 ? ' selected' : '', '>niederig</option></select></label>',
        '</section>',
        '<section class="planning-event-form__section planning-event-form__section--description">',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--description"><span>Beschreibung</span><textarea id="planningEventDescription" rows="10" placeholder="Beschreibung des Termins">', escapeValue(planningEventDraft.description || ""), '</textarea></label>',
        '</section>',
        '<section class="planning-event-form__section planning-event-form__section--schedule">',
        '<div class="planning-event-form__grid planning-event-form__grid--dates">',
        '<div class="planning-event-form__schedule-column">',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--schedule"><span>Start Datum</span><input id="planningEventStartDate" type="date" value="', escapeValue(planningEventDraft.startDate || planningEventDraft.date || ""), '" required></label>',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--schedule"><span>Start Zeit</span><input id="planningEventStartTime" type="time" value="', escapeValue(planningEventDraft.startTime || ""), '"></label>',
        '</div>',
        '<div class="planning-event-form__schedule-column">',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--schedule"><span>Ende Datum</span><input id="planningEventEndDate" type="date" value="', escapeValue(planningEventDraft.endDate || planningEventDraft.date || ""), '" required></label>',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--schedule"><span>Ende Zeit</span><input id="planningEventEndTime" type="time" value="', escapeValue(planningEventDraft.endTime || ""), '"></label>',
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

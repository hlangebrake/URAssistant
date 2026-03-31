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
    const planningRangeDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActivePlanningRangeDraft === "function"
      ? window.UnterrichtsassistentApp.getActivePlanningRangeDraft()
      : null;
    const snapshot = service && service.snapshot ? service.snapshot : {};
    const referenceDate = service && typeof service.getReferenceDate === "function"
      ? service.getReferenceDate()
      : null;
    const schoolYearStart = String(snapshot.schoolYearStart || "").slice(0, 10);
    const schoolYearEnd = String(snapshot.schoolYearEnd || "").slice(0, 10);
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
      const firstVisibleMonth = activeDate && activeDate > startDate
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
        '<span>Letzter Schultag</span>',
        '<input class="student-table__input schedule-toolbar__time" type="date" value="', escapeValue(schoolYearEnd), '" onchange="return window.UnterrichtsassistentApp.updatePlanningSchoolYearField(\'schoolYearEnd\', this.value)">',
        '</label>',
        '</div>',
        messageHtml || "",
        '<section class="planning-category-admin__panel">',
        '<h2 class="planning-category-admin__title">Kategorien</h2>',
        buildCategoryManagementList(),
        '</section>'
      ].join("");
    }

    if (planningViewMode !== "jahresplanung") {
      return "";
    }

    if (!schoolYearStart || !schoolYearEnd) {
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

    if (!startDate || !endDate || startDate > endDate) {
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

    if (isPlanningAdminMode) {
      return [
        '<div class="panel-grid panel-grid--planung">',
        '<article class="panel panel--full">',
        buildAdminContent(""),
        '</article>',
        '</div>'
      ].join("");
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
        '<section class="planning-event-form__section planning-event-form__section--wide">',
        '<h4 class="planning-event-form__section-title">Grunddaten</h4>',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--title"><span>Titel</span><input id="planningEventTitleInput" type="text" value="', escapeValue(planningEventDraft.title || ""), '" placeholder="Titel des Termins"></label>',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--description"><span>Beschreibung</span><textarea id="planningEventDescription" rows="8" placeholder="Beschreibung des Termins">', escapeValue(planningEventDraft.description || ""), '</textarea></label>',
        '</section>',
        '<section class="planning-event-form__section planning-event-form__section--category">',
        '<h4 class="planning-event-form__section-title">Kategorie</h4>',
        '<label class="import-modal__field import-modal__field--knowledge-gap"><span>Kategorie</span><input id="planningEventCategory" type="text" value="', escapeValue(planningEventDraft.category || ""), '" placeholder="Kategorie" autocomplete="off" autocapitalize="none" spellcheck="false" onfocus="return window.UnterrichtsassistentApp.handlePlanningCategoryInputFocus(\'planningEventCategory\', \'planningEventCategorySuggestions\')" oninput="return window.UnterrichtsassistentApp.handlePlanningCategoryInput(event, \'planningEventCategorySuggestions\')" onblur="return window.UnterrichtsassistentApp.handlePlanningCategoryInputBlur(\'planningEventCategorySuggestions\')"><div class="knowledge-gap-suggestions knowledge-gap-suggestions--planning" id="planningEventCategorySuggestions" hidden onpointerdown="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerDown(event, \'planningEventCategorySuggestions\')" onpointermove="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerMove(event, \'planningEventCategorySuggestions\')" onpointerup="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerUp(event, \'planningEventCategorySuggestions\')" onpointercancel="return window.UnterrichtsassistentApp.handlePlanningCategorySuggestionsPointerUp(event, \'planningEventCategorySuggestions\')"></div></label>',
        '<label class="import-modal__field"><span>Prioritaet</span><select id="planningEventPriority"><option value="1"', Number(planningEventDraft.priority || 3) === 1 ? ' selected' : '', '>hoch</option><option value="2"', Number(planningEventDraft.priority || 3) === 2 ? ' selected' : '', '>standard</option><option value="3"', Number(planningEventDraft.priority || 3) === 3 ? ' selected' : '', '>niederig</option></select></label>',
        '</section>',
        '<section class="planning-event-form__section">',
        '<h4 class="planning-event-form__section-title">Zeitraum</h4>',
        '<div class="planning-event-form__grid planning-event-form__grid--dates">',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--compact"><span>Start Datum</span><input id="planningEventStartDate" type="date" value="', escapeValue(planningEventDraft.startDate || planningEventDraft.date || ""), '" required></label>',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--compact"><span>End Datum</span><input id="planningEventEndDate" type="date" value="', escapeValue(planningEventDraft.endDate || planningEventDraft.date || ""), '" required></label>',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--compact"><span>Uhrzeit Start</span><input id="planningEventStartTime" type="time" value="', escapeValue(planningEventDraft.startTime || ""), '"></label>',
        '<label class="import-modal__field planning-event-form__field planning-event-form__field--compact"><span>Uhrzeit Ende</span><input id="planningEventEndTime" type="time" value="', escapeValue(planningEventDraft.endTime || ""), '"></label>',
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

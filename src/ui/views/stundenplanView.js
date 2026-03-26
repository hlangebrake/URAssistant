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

    function escapeValue(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
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

    function renderClassOptions(selectedClassId) {
      return ['<option value="">-</option>'].concat(classes.map(function (schoolClass) {
        return '<option value="' + escapeValue(schoolClass.id) + '"' + (selectedClassId === schoolClass.id ? " selected" : "") + '>' + escapeValue(getClassDisplayName(schoolClass)) + "</option>";
      })).join("");
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
        '<input class="student-table__input" type="text" placeholder="Raum" value="', escapeValue(cell.room), '" onchange="return window.UnterrichtsassistentApp.updateTimetableRoom(\'', row.id, '\', \'', weekday.key, '\', this.value)">',
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
        '<button class="schedule-compact__lesson-box', rowspan > 1 ? " is-double" : "", '"' + actionAttributes + ' style="', buildLessonBoxStyle(resolvedClass), " ", boxStyle, '">',
        '<div class="schedule-compact__lesson-title">', escapeValue(getClassDisplayName(resolvedClass)), "</div>",
        '<div class="schedule-compact__lesson-room">', escapeValue(resolvedRoom || "Raum offen"), "</div>",
        "</button>",
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

      return [
        '<div class="student-table-wrap schedule-table-wrap schedule-table-wrap--compact">',
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
        "</div>"
      ].join("");
    }

    return [
      '<div class="panel-grid panel-grid--klasse">',
      '<article class="panel panel--full">',
      timetable ? (isManageMode ? renderManageTable() : (rows.length ? renderCompactTable() : '<p class="empty-message">Fuer den aktuell gueltigen Stundenplan ist noch kein Zeitraster hinterlegt.</p>')) : '<p class="empty-message">Noch kein Stundenplan vorhanden. Lege im Modus Verwalten ueber den Plus-Button den ersten Stundenplan an.</p>',
      "</article>",
      "</div>"
    ].join("");
  }
};

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
    const currentClassLesson = activeClass && typeof service.getCurrentLessonForClass === "function"
      ? service.getCurrentLessonForClass(activeClass.id, service.getReferenceDate())
      : null;
    const activeDateTimeMode = service && service.snapshot
      ? String(service.snapshot.activeDateTimeMode || "live")
      : "live";
    const activeRoom = activeClass ? service.getRelevantRoomForClass(activeClass.id, service.getReferenceDate()) : "";
    const currentSeatOrder = activeClass && typeof service.getCurrentSeatOrder === "function"
      ? service.getCurrentSeatOrder(activeClass.id, activeRoom, service.getReferenceDate())
      : null;
    const currentSeatPlan = activeClass
      ? service.getCurrentSeatPlan(activeClass.id, activeRoom, service.getReferenceDate())
      : null;
    const students = activeClass ? service.getStudentsForClass(activeClass.id) : [];
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
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
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

      return [firstName, lastInitial].join(" ").trim();
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

    function getToolButtonClass(toolKey) {
      return toolMode === toolKey
        ? "unterricht-seatplan-action is-active"
        : "unterricht-seatplan-action";
    }

    function renderReadonlySeatSlot(student, extraClasses) {
      const classes = ["seat-order-slot", "unterricht-seatplan-slot"];
      const attendanceState = student ? getAttendanceStateForStudent(student.id) : "present";
      const isInteractive = Boolean(student && currentClassLesson && toolMode === "attendance");
      const onclick = isInteractive
        ? ' onclick="return window.UnterrichtsassistentApp.handleUnterrichtSeatClick(\'' + escapeValue(student.id) + '\')"'
        : "";

      if (extraClasses) {
        classes.push(extraClasses);
      }

      if (student) {
        classes.push("unterricht-seatplan-student");
        if (isInteractive) {
          classes.push("is-interactive");
        }
      } else {
        classes.push("seat-order-slot--readonly");
      }

      if (student && attendanceState === "absent") {
        classes.push("is-absent");
      }

      return '<div class="' + classes.join(" ") + '"' + onclick + '>' + (student ? '<span class="seat-order-desk__label seat-order-desk__label--readonly">' + escapeValue(getStudentShortLabel(student)) + "</span>" : "") + "</div>";
    }

    function getDeskItemMetrics(item) {
      const itemType = item && item.type === "double" ? "double" : "single";

      return {
        type: itemType,
        width: Number(item && item.width) || (itemType === "double" ? 156 : 88),
        height: Number(item && item.height) || 88
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
      const x = (Number(item && item.x) || 0) - (Number(offsetX) || 0);
      const y = (Number(item && item.y) || 0) - (Number(offsetY) || 0);
      const metrics = getDeskItemMetrics(item);
      const centerX = x + (metrics.width / 2);
      const centerY = y + (metrics.height / 2);
      const referenceTargets = deskLayoutItemsSource.filter(function (candidate) {
        return candidate && (candidate.type === "tafel" || candidate.type === "pult");
      });
      const referenceItem = referenceTargets.length ? referenceTargets[0] : null;
      const targetCenter = referenceItem
        ? {
            x: (Number(referenceItem.x) || 0) - (Number(offsetX) || 0) + ((Number(referenceItem.width) || (referenceItem.type === "tafel" ? 320 : 156)) / 2),
            y: (Number(referenceItem.y) || 0) - (Number(offsetY) || 0) + ((Number(referenceItem.height) || (referenceItem.type === "tafel" ? 28 : 88)) / 2)
          }
        : { x: centerX, y: canvasHeight };
      const dx = targetCenter.x - centerX;
      const dy = targetCenter.y - centerY;
      const longAxis = metrics.width >= metrics.height ? "horizontal" : "vertical";
      let orderedSlots;

      if (longAxis === "horizontal") {
        orderedSlots = dy >= 0 ? ["left", "right"] : ["right", "left"];
      } else {
        orderedSlots = dx >= 0 ? ["left", "right"] : ["right", "left"];
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
      const canvasStyle = "width:" + String(canvasWidth) + "px;height:" + String(canvasHeight) + "px";

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
        '<div class="unterricht-seatplan-frame">',
        '<div class="desk-layout-builder desk-layout-builder--readonly desk-layout-builder--readonly-single">',
        '<div class="desk-layout-builder__canvas-wrap desk-layout-builder__canvas-wrap--readonly desk-layout-builder__canvas-wrap--tight desk-layout-builder__canvas-wrap--unterricht">',
        '<div class="unterricht-seatplan-canvas-anchor">',
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
        '<div class="unterricht-seatplan-actions" aria-label="Unterrichtsaktionen">',
        '<button class="' + getToolButtonClass("attendance") + '" type="button" aria-label="Anwesenheit markieren" onclick="return window.UnterrichtsassistentApp.setUnterrichtToolMode(\'attendance\')">&#10003;</button>',
        '<button class="' + getToolButtonClass("homework") + '" type="button" aria-label="Hausaufgabe markieren" onclick="return window.UnterrichtsassistentApp.setUnterrichtToolMode(\'homework\')">H</button>',
        '<button class="' + getToolButtonClass("warning") + '" type="button" aria-label="Warnung vergeben" onclick="return window.UnterrichtsassistentApp.setUnterrichtToolMode(\'warning\')">&#9888;</button>',
        '<button class="' + getToolButtonClass("assessment") + '" type="button" aria-label="Bewertung oeffnen" onclick="return window.UnterrichtsassistentApp.setUnterrichtToolMode(\'assessment\')">&#128269;</button>',
        '</div>',
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

    if (viewMode === "live") {
      return [
        '<div class="unterricht-layout unterricht-layout--live">',
        '<article class="panel unterricht-layout__seatplan unterricht-layout__seatplan--full">',
        renderLiveNotice(),
        renderCompactSeatPlan(),
        '</article>',
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

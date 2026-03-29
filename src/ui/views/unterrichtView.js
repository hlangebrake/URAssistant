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
        .replace(/\\/g, "&#92;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/`/g, "&#96;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\r/g, "&#13;")
        .replace(/\n/g, "&#10;");
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

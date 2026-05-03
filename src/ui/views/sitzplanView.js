window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.sitzplan = {
  id: "sitzplan",
  title: "Sitzplan",
  render: function (service) {
    const activeClass = service.getActiveClass();
    const students = activeClass ? service.getStudentsForClass(activeClass.id) : [];
    const seatPlanViewMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSeatPlanViewMode === "function"
      ? window.UnterrichtsassistentApp.getSeatPlanViewMode()
      : "ansicht";
    const seatPlanDeskToolMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSeatPlanDeskToolMode === "function"
      ? window.UnterrichtsassistentApp.getSeatPlanDeskToolMode()
      : "move";
    const seatPlanAnsichtRotation = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSeatPlanAnsichtRotation === "function"
      ? window.UnterrichtsassistentApp.getSeatPlanAnsichtRotation()
      : 0;
    const isSeatPlanAnsichtRotated = seatPlanAnsichtRotation === 180;
    const seatPlanMoveLinkMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isSeatPlanMoveLinkMode === "function"
      ? window.UnterrichtsassistentApp.isSeatPlanMoveLinkMode()
      : true;
    const hiddenDeskLayoutItemIds = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveDeskLayoutHiddenItemIds === "function"
      ? window.UnterrichtsassistentApp.getActiveDeskLayoutHiddenItemIds()
      : [];
    const seatPlanRotateMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSeatPlanRotateMode === "function"
      ? window.UnterrichtsassistentApp.getSeatPlanRotateMode()
      : "90";
    const seatPlanMirrorMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSeatPlanMirrorMode === "function"
      ? window.UnterrichtsassistentApp.getSeatPlanMirrorMode()
      : "horizontal";
    const shouldRespectSocialRelations = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.shouldSeatPlanRespectSocialRelations === "function"
      ? window.UnterrichtsassistentApp.shouldSeatPlanRespectSocialRelations()
      : false;
    const shouldMixGender = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.shouldSeatPlanMixGender === "function"
      ? window.UnterrichtsassistentApp.shouldSeatPlanMixGender()
      : false;
    const shouldSeparateWarnings = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.shouldSeatPlanSeparateWarnings === "function"
      ? window.UnterrichtsassistentApp.shouldSeatPlanSeparateWarnings()
      : false;
    const shouldRespectPreviousPlan = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.shouldSeatPlanRespectPreviousPlan === "function"
      ? window.UnterrichtsassistentApp.shouldSeatPlanRespectPreviousPlan()
      : false;
    const socialWishLimit = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSeatPlanSocialWishLimit === "function"
      ? window.UnterrichtsassistentApp.getSeatPlanSocialWishLimit()
      : 1;
    const optimizationPriorities = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSeatPlanOptimizationPriorities === "function"
      ? window.UnterrichtsassistentApp.getSeatPlanOptimizationPriorities()
      : {};
    const availableRooms = activeClass ? service.getRoomsForClass(activeClass.id) : [];
    const selectedRoom = activeClass ? String(service.snapshot.activeSeatPlanRoom || "").trim() : "";
    const liveRoom = activeClass && String(service.snapshot.activeDateTimeMode || "live") === "live" && typeof service.getLiveRoomForClass === "function"
      ? service.getLiveRoomForClass(activeClass.id, service.getReferenceDate())
      : "";
    const activeRoom = activeClass
      ? ((liveRoom && (!availableRooms.length || availableRooms.indexOf(liveRoom) >= 0))
        ? liveRoom
        : ((selectedRoom && (!availableRooms.length || availableRooms.indexOf(selectedRoom) >= 0))
        ? selectedRoom
        : (service.getRelevantRoomForClass(activeClass.id, service.getReferenceDate()) || availableRooms[0] || "")))
      : "";
    const currentSeatPlan = activeClass
      ? service.getCurrentSeatPlan(activeClass.id, activeRoom, service.getReferenceDate())
      : null;
    const managedSeatPlan = activeClass
      ? service.getManagedSeatPlan(activeClass.id, activeRoom)
      : null;
    const currentSeatOrder = activeClass && typeof service.getCurrentSeatOrder === "function"
      ? service.getCurrentSeatOrder(activeClass.id, activeRoom, service.getReferenceDate())
      : null;
    const managedSeatOrder = activeClass && typeof service.getManagedSeatOrder === "function"
      ? service.getManagedSeatOrder(activeClass.id, activeRoom)
      : null;
    const seatOrder = activeClass
      ? (seatPlanViewMode === "sitzordnung" ? managedSeatOrder : currentSeatOrder)
      : null;
    const seatOrderReferenceDate = seatOrder && seatOrder.validFrom
      ? new Date(String(seatOrder.validFrom) + "T12:00:00")
      : service.getReferenceDate();
    const seatPlan = activeClass
      ? (seatPlanViewMode === "tischordnung"
        ? managedSeatPlan
        : service.getCurrentSeatPlan(activeClass.id, activeRoom, seatOrderReferenceDate))
      : null;
    const deskLayoutItems = seatPlan && Array.isArray(seatPlan.deskLayoutItems) ? seatPlan.deskLayoutItems : [];
    const deskLayoutLinks = seatPlan && Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];
    const seatAssignments = seatOrder && Array.isArray(seatOrder.seats) ? seatOrder.seats : [];
    const assignedStudentIds = seatAssignments.filter(function (seat) {
      return seat && seat.studentId;
    }).map(function (seat) {
      return seat.studentId;
    });
    const unassignedStudents = students.filter(function (student) {
      return assignedStudentIds.indexOf(student.id) === -1;
    });
    const roomWindowSide = seatPlan && typeof seatPlan.roomWindowSide === "string" ? seatPlan.roomWindowSide : "";
    const roomWidth = seatPlan && Number(seatPlan.roomWidth) ? Number(seatPlan.roomWidth) : 720;
    const roomHeight = seatPlan && Number(seatPlan.roomHeight) ? Number(seatPlan.roomHeight) : 720;

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

    function formatDateValue(dateValue) {
      return String(dateValue || "").slice(0, 10);
    }

    function formatDateObjectValue(dateValue) {
      const parsedDate = dateValue instanceof Date ? dateValue : new Date(dateValue);

      if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
        return "";
      }

      return parsedDate.getFullYear()
        + "-" + String(parsedDate.getMonth() + 1).padStart(2, "0")
        + "-" + String(parsedDate.getDate()).padStart(2, "0");
    }

    function renderOptimizationPrioritySelect(fieldName, priorityValue) {
      const normalizedPriority = ["niedrig", "normal", "hoch", "sehr_hoch"].indexOf(String(priorityValue || "")) >= 0
        ? String(priorityValue || "")
        : "normal";
      const options = [
        { value: "niedrig", label: "Niedrig" },
        { value: "normal", label: "Normal" },
        { value: "hoch", label: "Hoch" },
        { value: "sehr_hoch", label: "Sehr hoch" }
      ];

      return [
        '<label class="seat-order-rule-priority">',
        '<span>Priorit&auml;t</span>',
        '<select class="student-table__input" onchange="return window.UnterrichtsassistentApp.updateSeatPlanSocialOptimizationSetting(\'', escapeValue(fieldName), '\', this.value)">',
        options.map(function (option) {
          return '<option value="' + escapeValue(option.value) + '"' + (option.value === normalizedPriority ? ' selected' : '') + '>' + escapeValue(option.label) + '</option>';
        }).join(""),
        '</select>',
        '</label>'
      ].join("");
    }

    function renderRoomPicker() {
      if (!activeClass) {
        return "";
      }

      if (availableRooms.length <= 1) {
        return [
          '<div class="seat-plan-room-picker">',
          '<span class="seat-plan-room-picker__label">Raum</span>',
          '<span class="content__subtitle-room-pill">', escapeValue(activeRoom || "Raum offen"), '</span>',
          '</div>'
        ].join("");
      }

      return [
        '<label class="seat-plan-room-picker">',
        '<span class="seat-plan-room-picker__label">Raum</span>',
        '<select class="content__subtitle-room-select" aria-label="Raum fuer Sitzplan waehlen" onchange="return window.UnterrichtsassistentApp.changeActiveSeatPlanRoom(this.value)">',
        availableRooms.map(function (room) {
          const isSelected = room === activeRoom ? ' selected' : "";
          return '<option value="' + escapeValue(room) + '"' + isSelected + ">" + escapeValue(room) + "</option>";
        }).join(""),
        '</select>',
        '</label>'
      ].join("");
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

    function getStudentById(studentId) {
      return students.find(function (student) {
        return student.id === studentId;
      }) || null;
    }

    function getStudentSocialRelationIds(student, relationKey) {
      const relations = student && student.socialRelations && typeof student.socialRelations === "object"
        ? student.socialRelations
        : {};

      return Array.isArray(relations[relationKey])
        ? relations[relationKey].map(function (studentId) {
            return String(studentId || "").trim();
          }).filter(Boolean)
        : [];
    }

    function getDeskItemMetrics(item) {
      const itemType = item && item.type === "tafel"
        ? "tafel"
        : (item && item.type === "pult"
          ? "pult"
          : (item && item.type === "double" ? "double" : "single"));

      return {
        type: itemType,
        width: Number(item && item.width) || (itemType === "tafel" ? 320 : ((itemType === "double" || itemType === "pult") ? 156 : 88)),
        height: Number(item && item.height) || (itemType === "tafel" ? 28 : 88)
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
      const targetItem = deskLayoutItems.find(function (candidate) {
        return candidate && candidate.type === "tafel";
      }) || deskLayoutItems.find(function (candidate) {
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

    function getSeatOrderSlotRects(item, offsetX, offsetY, canvasWidth, canvasHeight) {
      const metrics = getDeskItemMetrics(item);
      const slotNames = getDeskSeatSlotsForView(item);
      const rects = [];

      if (slotNames.length === 1) {
        return [{
          slot: slotNames[0],
          x: 0,
          y: 0,
          width: metrics.width,
          height: metrics.height
        }];
      }

      if (slotNames.length === 2) {
        const layout = getDoubleDeskSlotLayout(item, offsetX, offsetY, canvasWidth, canvasHeight);

        if (layout.axis === "horizontal") {
          rects.push({ slot: layout.orderedSlots[0], x: 0, y: 0, width: metrics.width / 2, height: metrics.height });
          rects.push({ slot: layout.orderedSlots[1], x: metrics.width / 2, y: 0, width: metrics.width / 2, height: metrics.height });
        } else {
          rects.push({ slot: layout.orderedSlots[0], x: 0, y: 0, width: metrics.width, height: metrics.height / 2 });
          rects.push({ slot: layout.orderedSlots[1], x: 0, y: metrics.height / 2, width: metrics.width, height: metrics.height / 2 });
        }
      }

      return rects;
    }

    function getDeskSeatSlotsForView(item) {
      const itemType = item && item.type === "double" ? "double" : (item && item.type === "single" ? "single" : "");

      if (itemType === "double") {
        return ["left", "right"];
      }

      if (itemType === "single") {
        return ["single"];
      }

      return [];
    }

    function getSeatOrderSlotSideProjection(slotRect, item, sideName) {
      const metrics = getDeskItemMetrics(item);
      const itemX = Number(item && item.x) || 0;
      const itemY = Number(item && item.y) || 0;
      const tolerance = 0.5;

      if (sideName === "left") {
        return Math.abs(slotRect.x) <= tolerance ? { start: itemY + slotRect.y, end: itemY + slotRect.y + slotRect.height } : null;
      }

      if (sideName === "right") {
        return Math.abs((slotRect.x + slotRect.width) - metrics.width) <= tolerance ? { start: itemY + slotRect.y, end: itemY + slotRect.y + slotRect.height } : null;
      }

      if (sideName === "top") {
        return Math.abs(slotRect.y) <= tolerance ? { start: itemX + slotRect.x, end: itemX + slotRect.x + slotRect.width } : null;
      }

      if (sideName === "bottom") {
        return Math.abs((slotRect.y + slotRect.height) - metrics.height) <= tolerance ? { start: itemX + slotRect.x, end: itemX + slotRect.x + slotRect.width } : null;
      }

      return null;
    }

    function doSeatOrderSlotProjectionsOverlap(leftProjection, rightProjection) {
      return Boolean(leftProjection && rightProjection)
        && Math.min(leftProjection.end, rightProjection.end) - Math.max(leftProjection.start, rightProjection.start) > 4;
    }

    function buildSeatOrderNeighborPairs(offsetX, offsetY, canvasWidth, canvasHeight) {
      const slotKeysLookup = {};
      const seenPairs = {};
      const pairs = [];

      function addPair(leftKey, rightKey) {
        const pairKey = leftKey < rightKey ? leftKey + "||" + rightKey : rightKey + "||" + leftKey;

        if (!leftKey || !rightKey || leftKey === rightKey || !slotKeysLookup[leftKey] || !slotKeysLookup[rightKey] || seenPairs[pairKey]) {
          return;
        }

        seenPairs[pairKey] = true;
        pairs.push([leftKey, rightKey]);
      }

      deskLayoutItems.forEach(function (item) {
        getDeskSeatSlotsForView(item).forEach(function (slotName) {
          slotKeysLookup[item.id + "::" + slotName] = true;
        });
      });

      deskLayoutItems.forEach(function (item) {
        const slotNames = getDeskSeatSlotsForView(item);

        slotNames.forEach(function (slotName, slotIndex) {
          slotNames.slice(slotIndex + 1).forEach(function (otherSlotName) {
            addPair(item.id + "::" + slotName, item.id + "::" + otherSlotName);
          });
        });
      });

      deskLayoutLinks.forEach(function (link) {
        const itemA = deskLayoutItems.find(function (item) { return item && item.id === link.itemAId; }) || null;
        const itemB = deskLayoutItems.find(function (item) { return item && item.id === link.itemBId; }) || null;

        if (!itemA || !itemB) {
          return;
        }

        getSeatOrderSlotRects(itemA, offsetX, offsetY, canvasWidth, canvasHeight).forEach(function (slotRectA) {
          const projectionA = getSeatOrderSlotSideProjection(slotRectA, itemA, String(link.sideA || ""));

          getSeatOrderSlotRects(itemB, offsetX, offsetY, canvasWidth, canvasHeight).forEach(function (slotRectB) {
            const projectionB = getSeatOrderSlotSideProjection(slotRectB, itemB, String(link.sideB || ""));

            if (doSeatOrderSlotProjectionsOverlap(projectionA, projectionB)) {
              addPair(itemA.id + "::" + slotRectA.slot, itemB.id + "::" + slotRectB.slot);
            }
          });
        });
      });

      return pairs;
    }

    function buildRecentWarningStudentLookup(referenceDateValue) {
      const lookup = {};
      const referenceDate = new Date(String(referenceDateValue || "").slice(0, 10) + "T12:00:00");
      const earliestDate = new Date(referenceDate);
      let earliestValue;

      if (!activeClass || Number.isNaN(referenceDate.getTime())) {
        return lookup;
      }

      earliestDate.setDate(earliestDate.getDate() - 28);
      earliestValue = earliestDate.getFullYear()
        + "-" + String(earliestDate.getMonth() + 1).padStart(2, "0")
        + "-" + String(earliestDate.getDate()).padStart(2, "0");

      (Array.isArray(service.snapshot.warningRecords) ? service.snapshot.warningRecords : []).forEach(function (record) {
        const studentId = String(record && record.studentId || "").trim();
        const warningDateValue = String(record && (record.lessonDate || record.recordedAt) || "").slice(0, 10);

        if (studentId && String(record && record.classId || "") === String(activeClass.id || "") && warningDateValue >= earliestValue && warningDateValue <= String(referenceDateValue || "").slice(0, 10)) {
          lookup[studentId] = true;
        }
      });

      return lookup;
    }

    function renderDeskLayoutItems() {
      return deskLayoutItems.map(function (item) {
        const itemType = item.type === "tafel" ? "tafel" : (item.type === "pult" ? "pult" : (item.type === "double" ? "double" : "single"));
        const itemWidth = String(Number(item.width) || (itemType === "tafel" ? 320 : ((itemType === "double" || itemType === "pult") ? 156 : 88)));
        const itemHeight = String(Number(item.height) || (itemType === "tafel" ? 28 : 88));
        const hiddenClass = hiddenDeskLayoutItemIds.indexOf(item.id) >= 0 ? " is-drag-hidden" : "";
        const actionLabel = seatPlanDeskToolMode === "rotate"
          ? "Tischgruppe drehen"
          : (seatPlanDeskToolMode === "mirror"
            ? "Tischgruppe spiegeln"
            : (seatPlanDeskToolMode === "duplicate" ? "Tischgruppe duplizieren" : "Tisch verschieben"));
        const inlineStyle = [
          "left:" + String(Number(item.x) || 0) + "px",
          "top:" + String(Number(item.y) || 0) + "px",
          "width:" + itemWidth + "px",
          "height:" + itemHeight + "px"
        ].join(";");

        return '<button class="desk-layout-item desk-layout-item--' + itemType + hiddenClass + '" type="button" data-desk-item-id="' + escapeValue(item.id) + '" data-desk-type="' + itemType + '" data-width="' + itemWidth + '" data-height="' + itemHeight + '" style="' + inlineStyle + '" onpointerdown="return window.UnterrichtsassistentApp.startDeskLayoutItemPointerDrag(event, \'' + escapeValue(item.id) + '\')" aria-label="' + actionLabel + '"></button>';
      }).join("");
    }

    function renderDeskLayoutItemsStatic(offsetX, offsetY) {
      return deskLayoutItems.map(function (item) {
        const itemType = item.type === "tafel" ? "tafel" : (item.type === "pult" ? "pult" : (item.type === "double" ? "double" : "single"));
        const itemWidth = String(Number(item.width) || (itemType === "tafel" ? 320 : ((itemType === "double" || itemType === "pult") ? 156 : 88)));
        const itemHeight = String(Number(item.height) || (itemType === "tafel" ? 28 : 88));
        const inlineStyle = [
          "left:" + String((Number(item.x) || 0) - (Number(offsetX) || 0)) + "px",
          "top:" + String((Number(item.y) || 0) - (Number(offsetY) || 0)) + "px",
          "width:" + itemWidth + "px",
          "height:" + itemHeight + "px"
        ].join(";");

        return '<div class="desk-layout-item desk-layout-item--' + itemType + ' desk-layout-item--static" style="' + inlineStyle + '" aria-hidden="true"></div>';
      }).join("");
    }

    function renderSeatOrderDeskItems(offsetX, offsetY, canvasWidth, canvasHeight, options) {
      const settings = options || {};
      const isInteractive = settings.interactive !== false;
      const assignmentBySlotKey = {};
      const wishStateByStudentId = {};
      const recentWarningStudentLookup = buildRecentWarningStudentLookup(seatOrder && seatOrder.validFrom ? seatOrder.validFrom : formatDateObjectValue(service.getReferenceDate()));

      seatAssignments.forEach(function (seat) {
        if (seat && seat.studentId) {
          assignmentBySlotKey[seat.deskItemId + "::" + seat.slot] = String(seat.studentId || "").trim();
        }
      });

      students.forEach(function (student) {
        const likesWith = getStudentSocialRelationIds(student, "likesWith");

        if (likesWith.length) {
          wishStateByStudentId[student.id] = {
            hasWishes: true,
            isFulfilled: false
          };
        }
      });

      buildSeatOrderNeighborPairs(offsetX, offsetY, canvasWidth, canvasHeight).forEach(function (pair) {
        const leftStudentId = assignmentBySlotKey[pair[0]] || "";
        const rightStudentId = assignmentBySlotKey[pair[1]] || "";
        const leftStudent = getStudentById(leftStudentId);
        const rightStudent = getStudentById(rightStudentId);

        if (leftStudentId && rightStudentId && getStudentSocialRelationIds(leftStudent, "likesWith").indexOf(rightStudentId) >= 0 && wishStateByStudentId[leftStudentId]) {
          wishStateByStudentId[leftStudentId].isFulfilled = true;
        }

        if (leftStudentId && rightStudentId && getStudentSocialRelationIds(rightStudent, "likesWith").indexOf(leftStudentId) >= 0 && wishStateByStudentId[rightStudentId]) {
          wishStateByStudentId[rightStudentId].isFulfilled = true;
        }
      });

      return deskLayoutItems.map(function (item) {
        const metrics = getDeskItemMetrics(item);
        const itemType = metrics.type;
        const itemWidth = String(metrics.width);
        const itemHeight = String(metrics.height);
        const inlineStyle = [
          "left:" + String((Number(item.x) || 0) - (Number(offsetX) || 0)) + "px",
          "top:" + String((Number(item.y) || 0) - (Number(offsetY) || 0)) + "px",
          "width:" + itemWidth + "px",
          "height:" + itemHeight + "px"
        ].join(";");
        const singleAssignment = getSeatAssignmentByDeskSlot(item.id, "single");
        const leftAssignment = getSeatAssignmentByDeskSlot(item.id, "left");
        const rightAssignment = getSeatAssignmentByDeskSlot(item.id, "right");

        function renderSeatSlot(slotName, assignment, slotLabel, extraClassName) {
          const assignedStudent = assignment ? getStudentById(assignment.studentId) : null;
          const studentLabel = assignedStudent ? getStudentShortLabel(assignedStudent) : "";
          const isLocked = Boolean(assignment && assignment.isLocked);
          const wishState = assignedStudent ? wishStateByStudentId[assignedStudent.id] : null;
          const hasRecentWarning = Boolean(assignedStudent && recentWarningStudentLookup[assignedStudent.id]);
          const highlightClass = wishState && wishState.hasWishes
            ? (wishState.isFulfilled ? " is-wish-fulfilled" : " is-wish-unfulfilled")
            : "";
          const warningClass = hasRecentWarning ? " has-recent-warning" : "";
          const warningHtml = hasRecentWarning
            ? '<span class="seat-order-desk__warning" aria-label="Verwarnung in den letzten 4 Wochen" title="Verwarnung in den letzten 4 Wochen">&#9888;</span>'
            : "";
          let chipHtml;

          if (!isInteractive) {
            if (!assignedStudent) {
              return '<div class="seat-order-slot seat-order-slot--readonly seat-order-slot--' + slotName + (extraClassName ? ' ' + extraClassName : '') + '"></div>';
            }

            return '<div class="seat-order-slot seat-order-slot--readonly seat-order-slot--' + slotName + (extraClassName ? ' ' + extraClassName : '') + '"><div class="seat-plan-ansicht-slot__content"><span class="seat-order-desk__label seat-order-desk__label--readonly">' + escapeValue(studentLabel) + "</span></div></div>";
          }

          if (assignedStudent) {
            chipHtml = isInteractive
              ? '<span class="seat-order-desk__label' + (isLocked ? ' is-locked' : '') + highlightClass + warningClass + '" draggable="true" onclick="event.stopPropagation(); return window.UnterrichtsassistentApp.toggleSeatLockFromClick(\'' + escapeValue(item.id) + '\', \'' + escapeValue(slotName) + '\')" ondragstart="return window.UnterrichtsassistentApp.startSeatAssignmentDrag(event, \'' + escapeValue(assignedStudent.id) + '\')" ondragend="return window.UnterrichtsassistentApp.endSeatAssignmentDrag(event, \'' + escapeValue(assignedStudent.id) + '\', \'desk\')" onpointerdown="return window.UnterrichtsassistentApp.startSeatAssignmentPointerDrag(event, \'' + escapeValue(assignedStudent.id) + '\', \'desk\')">' + warningHtml + '<span>' + escapeValue(studentLabel) + "</span></span>"
              : '<span class="seat-order-desk__label' + (isLocked ? ' is-locked' : '') + highlightClass + warningClass + '">' + warningHtml + '<span>' + escapeValue(studentLabel) + "</span></span>";
          } else {
            chipHtml = '<span class="seat-order-desk__placeholder' + (isLocked ? ' is-locked' : '') + '">' + escapeValue(isLocked ? "Frei" : slotLabel) + "</span>";
          }

          return '<button class="seat-order-slot seat-order-slot--' + slotName + (extraClassName ? ' ' + extraClassName : '') + (isLocked ? ' is-locked' : '') + '" type="button" data-seat-order-desk-id="' + escapeValue(item.id) + '" data-seat-order-slot="' + escapeValue(slotName) + '" onclick="return window.UnterrichtsassistentApp.toggleSeatLockFromClick(\'' + escapeValue(item.id) + '\', \'' + escapeValue(slotName) + '\')" ondragover="return window.UnterrichtsassistentApp.allowSeatAssignmentDrop(event)" ondrop="return window.UnterrichtsassistentApp.dropSeatAssignmentOnDesk(event, \'' + escapeValue(item.id) + '\', \'' + escapeValue(slotName) + '\')" aria-label="Schueler diesem Platz zuordnen">' + chipHtml + '</button>';
        }

        if (itemType === "single" || itemType === "double") {
          const doubleDeskLayout = itemType === "double"
            ? getDoubleDeskSlotLayout(item, offsetX, offsetY, canvasWidth, canvasHeight)
            : null;
          const slotGridClass = itemType === "double"
            ? "seat-order-slot-grid seat-order-slot-grid--double seat-order-slot-grid--double-" + doubleDeskLayout.axis
            : "seat-order-slot-grid";
          const doubleSlotsHtml = itemType === "double"
            ? doubleDeskLayout.orderedSlots.map(function (slotName, slotIndex) {
                const assignment = slotName === "left" ? leftAssignment : rightAssignment;
                const slotLabel = slotName === "left" ? "Links" : "Rechts";
                const positionClass = doubleDeskLayout.axis === "horizontal"
                  ? (slotIndex === 0 ? "visual-left" : "visual-right")
                  : (slotIndex === 0 ? "visual-top" : "visual-bottom");

                return renderSeatSlot(slotName, assignment, slotLabel, "seat-order-slot--" + positionClass);
              }).join("")
            : "";

          return '<div class="desk-layout-item desk-layout-item--' + itemType + ' desk-layout-item--seat-order" style="' + inlineStyle + '" aria-label="Sitzplaetze dieses Tisches">' + (
            itemType === "double"
              ? '<div class="' + slotGridClass + '">' + doubleSlotsHtml + "</div>"
              : '<div class="seat-order-slot-grid">' + renderSeatSlot("single", singleAssignment, "Platz") + "</div>"
          ) + '</div>';
        }

        return '<div class="desk-layout-item desk-layout-item--' + itemType + ' desk-layout-item--static" style="' + inlineStyle + '" aria-hidden="true"></div>';
      }).join("");
    }

    function renderRoomWindowEdges() {
      const edges = [
        { side: "top", label: "Fenster oben" },
        { side: "right", label: "Fenster rechts" },
        { side: "bottom", label: "Fenster unten" },
        { side: "left", label: "Fenster links" }
      ];

      return edges.map(function (edge) {
        return [
          '<button class="desk-layout-room-edge desk-layout-room-edge--', edge.side,
          roomWindowSide === edge.side ? ' is-active' : '',
          '" type="button" onclick="return window.UnterrichtsassistentApp.setDeskLayoutWindowSide(\'', edge.side, '\')" aria-label="', edge.label, '">',
          '<span class="desk-layout-room-edge__label seat-plan-ansicht-rotation-counter">Fenster</span>',
          '</button>'
        ].join("");
      }).join("");
    }

    function renderRoomWindowEdgesStatic() {
      const edges = roomWindowSide ? [{ side: roomWindowSide }] : [];

      return edges.map(function (edge) {
        return [
          '<div class="desk-layout-room-edge desk-layout-room-edge--static desk-layout-room-edge--', edge.side,
          roomWindowSide === edge.side ? ' is-active' : '',
          '" aria-hidden="true">',
          '<span class="desk-layout-room-edge__label">Fenster</span>',
          '</div>'
        ].join("");
      }).join("");
    }

    function getDeskBounds() {
      if (!deskLayoutItems.length) {
        return null;
      }

      return deskLayoutItems.reduce(function (bounds, item) {
        const x = Number(item.x) || 0;
        const y = Number(item.y) || 0;
        const width = Number(item.width) || (item.type === "tafel" ? 320 : ((item.type === "double" || item.type === "pult") ? 156 : 88));
        const height = Number(item.height) || (item.type === "tafel" ? 28 : 88);

        return {
          minX: Math.min(bounds.minX, x),
          minY: Math.min(bounds.minY, y),
          maxX: Math.max(bounds.maxX, x + width),
          maxY: Math.max(bounds.maxY, y + height)
        };
      }, {
        minX: Infinity,
        minY: Infinity,
        maxX: 0,
        maxY: 0
      });
    }

    function renderRoomResizeHandles() {
      const handles = [
        { side: "right", label: "Raumbreite aendern", icon: "\u2192" },
        { side: "bottom", label: "Raumhoehe aendern", icon: "\u2193" }
      ];

      return handles.map(function (handle) {
        return [
          '<button class="desk-layout-resize-handle desk-layout-resize-handle--', handle.side,
          '" type="button" onpointerdown="return window.UnterrichtsassistentApp.startDeskLayoutResize(event, \'', handle.side, '\')" aria-label="', handle.label, '">',
          handle.icon,
          '</button>'
        ].join("");
      }).join("");
    }

    function getItemById(itemId) {
      return deskLayoutItems.find(function (item) {
        return item.id === itemId;
      }) || null;
    }

    function getDeskLayoutGroups() {
      const visited = {};

      return deskLayoutItems.map(function (item) {
        if (visited[item.id]) {
          return null;
        }

        const pending = [item.id];
        const groupIds = [];

        while (pending.length) {
          const currentId = pending.shift();

          if (!currentId || visited[currentId]) {
            continue;
          }

          visited[currentId] = true;
          groupIds.push(currentId);
          deskLayoutLinks.forEach(function (link) {
            if (link.itemAId === currentId && !visited[link.itemBId]) {
              pending.push(link.itemBId);
            } else if (link.itemBId === currentId && !visited[link.itemAId]) {
              pending.push(link.itemAId);
            }
          });
        }

        return groupIds;
      }).filter(function (groupIds) {
        return Array.isArray(groupIds) && groupIds.length > 1;
      }).map(function (groupIds) {
        return groupIds.map(function (groupItemId) {
          return getItemById(groupItemId);
        }).filter(Boolean);
      });
    }

    function buildDeskLayoutGroupOutlinePath(rects, step) {
      const occupied = {};
      const directedEdges = [];
      const edgeMap = {};
      const outgoing = {};

      function addEdge(x1, y1, x2, y2) {
        const edge = {
          start: String(x1) + "," + String(y1),
          end: String(x2) + "," + String(y2)
        };

        directedEdges.push(edge);
      }

      function setOccupiedCell(col, row) {
        occupied[String(col) + "," + String(row)] = true;
      }

      function isOccupiedCell(col, row) {
        return Boolean(occupied[String(col) + "," + String(row)]);
      }

      function consumeEdge(currentKey) {
        const nextEdges = outgoing[currentKey] || [];

        while (nextEdges.length) {
          const nextEdge = nextEdges.shift();

          if (!edgeMap[nextEdge.id]) {
            continue;
          }

          delete edgeMap[nextEdge.id];
          return nextEdge;
        }

        return null;
      }

      (rects || []).forEach(function (rect) {
        const startCol = Math.floor((Number(rect.x) || 0) / step);
        const endCol = Math.ceil(((Number(rect.x) || 0) + (Number(rect.width) || 0)) / step);
        const startRow = Math.floor((Number(rect.y) || 0) / step);
        const endRow = Math.ceil(((Number(rect.y) || 0) + (Number(rect.height) || 0)) / step);
        let col;
        let row;

        for (col = startCol; col < endCol; col += 1) {
          for (row = startRow; row < endRow; row += 1) {
            setOccupiedCell(col, row);
          }
        }
      });

      Object.keys(occupied).forEach(function (cellKey) {
        const parts = cellKey.split(",");
        const col = Number(parts[0]) || 0;
        const row = Number(parts[1]) || 0;
        const x = col * step;
        const y = row * step;

        if (!isOccupiedCell(col, row - 1)) {
          addEdge(x, y, x + step, y);
        }

        if (!isOccupiedCell(col + 1, row)) {
          addEdge(x + step, y, x + step, y + step);
        }

        if (!isOccupiedCell(col, row + 1)) {
          addEdge(x + step, y + step, x, y + step);
        }

        if (!isOccupiedCell(col - 1, row)) {
          addEdge(x, y + step, x, y);
        }
      });

      directedEdges.forEach(function (edge, index) {
        const storedEdge = {
          id: "edge-" + String(index),
          start: edge.start,
          end: edge.end
        };

        edgeMap[storedEdge.id] = storedEdge;
        outgoing[storedEdge.start] = outgoing[storedEdge.start] || [];
        outgoing[storedEdge.start].push(storedEdge);
      });

      return Object.keys(edgeMap).reduce(function (allPaths, edgeId) {
        const firstEdge = edgeMap[edgeId];
        const points = [];
        let currentEdge;
        let currentPoint;

        if (!firstEdge) {
          return allPaths;
        }

        delete edgeMap[edgeId];
        points.push(firstEdge.start, firstEdge.end);
        currentPoint = firstEdge.end;

        while (currentPoint !== firstEdge.start) {
          currentEdge = consumeEdge(currentPoint);

          if (!currentEdge) {
            break;
          }

          points.push(currentEdge.end);
          currentPoint = currentEdge.end;
        }

        if (points.length >= 3) {
          allPaths.push(points);
        }

        return allPaths;
      }, []).map(function (points) {
        return points.reduce(function (pathText, pointKey, index) {
          const coords = pointKey.split(",");
          const x = Number(coords[0]) || 0;
          const y = Number(coords[1]) || 0;

          return pathText + (index === 0 ? "M" : "L") + String(x) + " " + String(y) + " ";
        }, "") + "Z";
      }).join(" ");
    }

    function renderDeskLayoutGroups() {
      return getDeskLayoutGroups().map(function (groupItems) {
        const visibleItems = groupItems.filter(function (item) {
          return hiddenDeskLayoutItemIds.indexOf(item.id) === -1;
        });
        let minX;
        let minY;
        let maxRight;
        let maxBottom;
        const padding = 12;
        const step = 4;
        let outlinePath;
        let rects;

        if (visibleItems.length < 2) {
          return "";
        }

        minX = Math.min.apply(null, visibleItems.map(function (item) { return Number(item.x) || 0; }));
        minY = Math.min.apply(null, visibleItems.map(function (item) { return Number(item.y) || 0; }));
        maxRight = Math.max.apply(null, visibleItems.map(function (item) {
          return (Number(item.x) || 0) + (Number(item.width) || (item.type === "tafel" ? 320 : ((item.type === "double" || item.type === "pult") ? 156 : 88)));
        }));
        maxBottom = Math.max.apply(null, visibleItems.map(function (item) {
          return (Number(item.y) || 0) + (Number(item.height) || (item.type === "tafel" ? 28 : 88));
        }));
        rects = visibleItems.map(function (item) {
          return {
            x: (Number(item.x) || 0) - minX,
            y: (Number(item.y) || 0) - minY,
            width: (Number(item.width) || (item.type === "tafel" ? 320 : ((item.type === "double" || item.type === "pult") ? 156 : 88))) + (padding * 2),
            height: (Number(item.height) || (item.type === "tafel" ? 28 : 88)) + (padding * 2)
          };
        });
        outlinePath = buildDeskLayoutGroupOutlinePath(rects, step);

        return [
          '<svg class="desk-layout-group-outline" aria-hidden="true" style="',
          [
            "left:" + String(minX - padding) + "px",
            "top:" + String(minY - padding) + "px",
            "width:" + String(maxRight - minX + (padding * 2)) + "px",
            "height:" + String(maxBottom - minY + (padding * 2)) + "px"
          ].join(";"),
          '" viewBox="0 0 ',
          String(maxRight - minX + (padding * 2)),
          " ",
          String(maxBottom - minY + (padding * 2)),
          '" preserveAspectRatio="none">',
          '<path class="desk-layout-group-outline__path" d="',
          escapeValue(outlinePath),
          '"></path>',
          '</svg>'
        ].join("");
      }).join("");
    }

    function renderDeskLayoutLinks() {
      return deskLayoutLinks.map(function (link) {
        const itemA = getItemById(link.itemAId);
        const itemB = getItemById(link.itemBId);
        const isHorizontal = link.sideA === "left" || link.sideA === "right";
        let style = "";
        let overlapStart;
        let overlapEnd;
        let anchorX;
        let anchorY;

        if (!itemA || !itemB) {
          return "";
        }

        if (hiddenDeskLayoutItemIds.indexOf(itemA.id) >= 0 || hiddenDeskLayoutItemIds.indexOf(itemB.id) >= 0) {
          return "";
        }

        if (isHorizontal) {
          overlapStart = Math.max(Number(itemA.y) || 0, Number(itemB.y) || 0);
          overlapEnd = Math.min((Number(itemA.y) || 0) + (Number(itemA.height) || 88), (Number(itemB.y) || 0) + (Number(itemB.height) || 88));
          anchorX = link.sideA === "right"
            ? (Number(itemA.x) || 0) + (Number(itemA.width) || 88)
            : (Number(itemA.x) || 0);

          if (overlapEnd - overlapStart < 12) {
            return "";
          }

          style = [
            "left:" + String(anchorX - 7) + "px",
            "top:" + String(overlapStart + 6) + "px",
            "width:14px",
            "height:" + String(Math.max(overlapEnd - overlapStart - 12, 12)) + "px"
          ].join(";");
        } else {
          overlapStart = Math.max(Number(itemA.x) || 0, Number(itemB.x) || 0);
          overlapEnd = Math.min((Number(itemA.x) || 0) + (Number(itemA.width) || 88), (Number(itemB.x) || 0) + (Number(itemB.width) || 88));
          anchorY = link.sideA === "bottom"
            ? (Number(itemA.y) || 0) + (Number(itemA.height) || 88)
            : (Number(itemA.y) || 0);

          if (overlapEnd - overlapStart < 12) {
            return "";
          }

          style = [
            "left:" + String(overlapStart + 6) + "px",
            "top:" + String(anchorY - 7) + "px",
            "width:" + String(Math.max(overlapEnd - overlapStart - 12, 12)) + "px",
            "height:14px"
          ].join(";");
        }

        return '<button class="desk-layout-link-edge desk-layout-link-edge--' + (isHorizontal ? "vertical" : "horizontal") + '" type="button" style="' + style + '" onclick="return window.UnterrichtsassistentApp.removeDeskLayoutLink(\'' + escapeValue(link.id) + '\')" aria-label="Link zwischen zwei Tischen trennen"></button>';
      }).join("");
    }

    function renderManageDeskLayout() {
      function renderToolButton(toolId, label, propertyHtml) {
        const isActive = seatPlanDeskToolMode === toolId;

        return [
          '<div class="desk-layout-tool-entry', isActive ? ' is-active' : '', '">',
          '<button class="desk-layout-tool-action', isActive ? ' is-active' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.setSeatPlanDeskToolMode(\'', toolId, '\')">', label, '</button>',
          isActive && propertyHtml ? '<div class="desk-layout-tool-property-wrap">' + propertyHtml + '</div>' : "",
          '</div>'
        ].join("");
      }

      return [
        '<div class="schedule-toolbar seat-plan-toolbar">',
        '<label class="schedule-toolbar__field">',
        "<span>Gueltig ab</span>",
        '<input class="student-table__input schedule-toolbar__time" type="date" value="', escapeValue(formatDateValue(seatPlan ? seatPlan.validFrom : "")), '" onchange="return window.UnterrichtsassistentApp.updateSeatPlanDateField(\'validFrom\', this.value)">',
        "</label>",
        '<label class="schedule-toolbar__field">',
        "<span>Gueltig bis</span>",
        '<input class="student-table__input schedule-toolbar__time" type="date" value="', escapeValue(formatDateValue(seatPlan ? seatPlan.validTo : "")), '" onchange="return window.UnterrichtsassistentApp.updateSeatPlanDateField(\'validTo\', this.value)">',
        "</label>",
        "</div>",
        '<div class="desk-layout-builder">',
        '<aside class="desk-layout-builder__tools" aria-label="Werkzeugbereich fuer Tischordnung">',
        '<div class="desk-layout-tool-actions" role="toolbar" aria-label="Werkzeuge fuer Tischordnung">',
        renderToolButton(
          "move",
          "Verschieben",
          '<button class="desk-layout-tool-property is-active" type="button" onclick="return window.UnterrichtsassistentApp.toggleSeatPlanMoveLinkMode()">' + (seatPlanMoveLinkMode ? 'Link' : 'Frei') + '</button>'
        ),
        renderToolButton(
          "rotate",
          "Drehen",
          '<button class="desk-layout-tool-property is-active" type="button" onclick="return window.UnterrichtsassistentApp.setSeatPlanRotateMode(\'90\')">' + escapeValue(seatPlanRotateMode) + '&deg;</button>'
        ),
        renderToolButton(
          "mirror",
          "Spiegeln",
          '<button class="desk-layout-tool-property is-active" type="button" onclick="return window.UnterrichtsassistentApp.toggleSeatPlanMirrorMode()">' + escapeValue(seatPlanMirrorMode === "vertical" ? "vertikal" : "horizontal") + '</button>'
        ),
        renderToolButton(
          "duplicate",
          "Duplizieren",
          ""
        ),
        '</div>',
        '<div class="desk-toolbox">Einzeltisch</div>',
        '<button class="desk-tool desk-tool--single" type="button" onpointerdown="return window.UnterrichtsassistentApp.startDeskLayoutPointerDrag(event, \'single\')" aria-label="Einzeltisch auf die Flaeche ziehen"></button>',
        '<div class="desk-toolbox">Doppeltisch</div>',
        '<button class="desk-tool desk-tool--double" type="button" onpointerdown="return window.UnterrichtsassistentApp.startDeskLayoutPointerDrag(event, \'double\')" aria-label="Doppeltisch auf die Flaeche ziehen"></button>',
        '<div class="desk-toolbox">Pult</div>',
        '<button class="desk-tool desk-tool--pult" type="button" onpointerdown="return window.UnterrichtsassistentApp.startDeskLayoutPointerDrag(event, \'pult\')" aria-label="Pult auf die Flaeche ziehen"></button>',
        '<div class="desk-toolbox">Tafel</div>',
        '<button class="desk-tool desk-tool--tafel" type="button" onpointerdown="return window.UnterrichtsassistentApp.startDeskLayoutPointerDrag(event, \'tafel\')" aria-label="Tafel auf die Flaeche ziehen"></button>',
        '</aside>',
        '<div class="desk-layout-builder__canvas-wrap">',
        renderRoomResizeHandles(),
        '<div class="desk-layout-builder__canvas" id="deskLayoutCanvas" style="width:', String(roomWidth), 'px;height:', String(roomHeight), 'px">',
        renderRoomWindowEdges(),
        renderDeskLayoutGroups(),
        renderDeskLayoutLinks(),
        renderDeskLayoutItems(),
        deskLayoutItems.length ? "" : '<div class="desk-layout-builder__hint">Ziehe Einzeltisch, Doppeltisch, Pult oder Tafel auf diese Flaeche.</div>',
        '</div>',
        '</div>',
        '</div>'
      ].join("");
    }

    function renderSeatOrderView() {
      const deskBounds = getDeskBounds();
      const readonlyPadding = 56;
      const offsetX = deskBounds ? Math.max(Math.floor(deskBounds.minX) - readonlyPadding, 0) : 0;
      const offsetY = deskBounds ? Math.max(Math.floor(deskBounds.minY) - readonlyPadding, 0) : 0;
      const canvasWidth = deskBounds
        ? Math.max(Math.ceil(deskBounds.maxX - deskBounds.minX) + (readonlyPadding * 2), 220)
        : roomWidth;
      const canvasHeight = deskBounds
        ? Math.max(Math.ceil(deskBounds.maxY - deskBounds.minY) + (readonlyPadding * 2), 220)
        : roomHeight;
      const canvasStyle = deskBounds
        ? [
            "width:" + String(canvasWidth) + "px",
            "height:" + String(canvasHeight) + "px"
          ].join(";")
        : "width:" + String(roomWidth) + "px;height:" + String(roomHeight) + "px";
      const viewClassName = isSeatPlanAnsichtRotated
        ? "seat-plan-ansicht-readonly is-rotated-180"
        : "seat-plan-ansicht-readonly";
      const canvasClassName = isSeatPlanAnsichtRotated
        ? "desk-layout-builder__canvas desk-layout-builder__canvas--readonly seat-plan-ansicht-canvas is-rotated-180"
        : "desk-layout-builder__canvas desk-layout-builder__canvas--readonly seat-plan-ansicht-canvas";

      if (!seatOrder) {
        return '<div class="seat-plan-placeholder">Fuer diese Lerngruppe und diesen Raum ist noch keine aktuelle Sitzordnung hinterlegt.</div>';
      }

      if (!seatPlan) {
        return '<div class="seat-plan-placeholder">Fuer diese Sitzordnung ist noch keine passende Tischordnung hinterlegt.</div>';
      }

      return [
        '<div class="schedule-toolbar seat-plan-toolbar">',
        '<label class="schedule-toolbar__field">',
        "<span>Gueltig ab</span>",
        '<input class="student-table__input schedule-toolbar__time" type="date" value="', escapeValue(formatDateValue(seatOrder ? seatOrder.validFrom : "")), '" onchange="return window.UnterrichtsassistentApp.updateSeatPlanDateField(\'validFrom\', this.value)">',
        "</label>",
        '<label class="schedule-toolbar__field">',
        "<span>Gueltig bis</span>",
        '<input class="student-table__input schedule-toolbar__time" type="date" value="', escapeValue(formatDateValue(seatOrder ? seatOrder.validTo : "")), '" onchange="return window.UnterrichtsassistentApp.updateSeatPlanDateField(\'validTo\', this.value)">',
        "</label>",
        "</div>",
        '<div class="seat-order-layout">',
        '<aside class="seat-order-student-list" aria-label="Schuelerliste der aktiven Lerngruppe">',
        unassignedStudents.length
          ? unassignedStudents.map(function (student) {
              return '<button class="seat-order-student" type="button" draggable="true" ondragstart="return window.UnterrichtsassistentApp.startSeatAssignmentDrag(event, \'' + escapeValue(student.id) + '\')" ondragend="return window.UnterrichtsassistentApp.endSeatAssignmentDrag(event, \'' + escapeValue(student.id) + '\', \'list\')" onpointerdown="return window.UnterrichtsassistentApp.startSeatAssignmentPointerDrag(event, \'' + escapeValue(student.id) + '\', \'list\')" aria-label="Schueler auf einen Tisch ziehen">' + escapeValue(getStudentShortLabel(student)) + '</button>';
            }).join("")
          : '<div class="seat-order-student-list__empty">Alle Schueler sind aktuell zugeordnet.</div>',
        '<div class="seat-order-student-actions">',
        '<button class="seat-order-action" type="button" onclick="return window.UnterrichtsassistentApp.resetSeatAssignments()">Reset</button>',
        '<button class="seat-order-action" type="button" onclick="return window.UnterrichtsassistentApp.shuffleSeatAssignments()">Automatisch</button>',
        '</div>',
        '<div class="seat-order-rule">',
        '<label class="seat-order-social-option">',
        '<input type="checkbox"', shouldRespectSocialRelations ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updateSeatPlanSocialOptimizationSetting(\'respectSocialRelations\', this.checked)">',
        '<span>Sozialgef&uuml;ge beachten</span>',
        '</label>',
        renderOptimizationPrioritySelect("priorityRespectSocialRelations", optimizationPriorities.respectSocialRelations),
        '</div>',
        '<div class="seat-order-rule">',
        '<label class="seat-order-social-option">',
        '<input type="checkbox"', shouldMixGender ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updateSeatPlanSocialOptimizationSetting(\'mixGender\', this.checked)">',
        '<span>Geschlecht mischen</span>',
        '</label>',
        renderOptimizationPrioritySelect("priorityMixGender", optimizationPriorities.mixGender),
        '</div>',
        '<div class="seat-order-rule">',
        '<label class="seat-order-social-option">',
        '<input type="checkbox"', shouldSeparateWarnings ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updateSeatPlanSocialOptimizationSetting(\'separateWarnings\', this.checked)">',
        '<span>Verwarnungen trennen</span>',
        '</label>',
        renderOptimizationPrioritySelect("prioritySeparateWarnings", optimizationPriorities.separateWarnings),
        '</div>',
        '<div class="seat-order-rule">',
        '<label class="seat-order-social-option">',
        '<input type="checkbox"', shouldRespectPreviousPlan ? ' checked' : '', ' onchange="return window.UnterrichtsassistentApp.updateSeatPlanSocialOptimizationSetting(\'respectPreviousPlan\', this.checked)">',
        '<span>Letzten Plan beachten</span>',
        '</label>',
        renderOptimizationPrioritySelect("priorityRespectPreviousPlan", optimizationPriorities.respectPreviousPlan),
        '</div>',
        '<label class="seat-order-social-wishes">',
        '<span>Anzahl W&uuml;nsche</span>',
        '<input class="student-table__input" type="number" min="0" max="4" step="1" value="', escapeValue(socialWishLimit), '" onchange="return window.UnterrichtsassistentApp.updateSeatPlanSocialOptimizationSetting(\'wishLimit\', this.value)">',
        '</label>',
        '</aside>',
        '<div class="desk-layout-builder desk-layout-builder--readonly">',
        '<div class="desk-layout-builder__canvas-wrap desk-layout-builder__canvas-wrap--readonly">',
        '<div class="desk-layout-builder__canvas desk-layout-builder__canvas--readonly" style="', canvasStyle, '">',
        renderRoomWindowEdgesStatic(),
        renderSeatOrderDeskItems(offsetX, offsetY, canvasWidth, canvasHeight),
        deskLayoutItems.length ? "" : '<div class="desk-layout-builder__hint">Diese Tischordnung enthaelt noch keine Tische.</div>',
        '</div>',
        '</div>',
        '</div>',
        '</div>'
      ].join("");
    }

    function renderSeatOrderReadOnlyView() {
      const deskBounds = getDeskBounds();
      const readonlyPadding = 56;
      const offsetX = deskBounds ? Math.max(Math.floor(deskBounds.minX) - readonlyPadding, 0) : 0;
      const offsetY = deskBounds ? Math.max(Math.floor(deskBounds.minY) - readonlyPadding, 0) : 0;
      const canvasWidth = deskBounds
        ? Math.max(Math.ceil(deskBounds.maxX - deskBounds.minX) + (readonlyPadding * 2), 220)
        : roomWidth;
      const canvasHeight = deskBounds
        ? Math.max(Math.ceil(deskBounds.maxY - deskBounds.minY) + (readonlyPadding * 2), 220)
        : roomHeight;
      const canvasStyle = deskBounds
        ? [
            "width:" + String(canvasWidth) + "px",
            "height:" + String(canvasHeight) + "px"
          ].join(";")
        : "width:" + String(roomWidth) + "px;height:" + String(roomHeight) + "px";
      const viewClassName = isSeatPlanAnsichtRotated
        ? "seat-plan-ansicht-readonly is-rotated-180"
        : "seat-plan-ansicht-readonly";
      const canvasClassName = isSeatPlanAnsichtRotated
        ? "desk-layout-builder__canvas desk-layout-builder__canvas--readonly seat-plan-ansicht-canvas is-rotated-180"
        : "desk-layout-builder__canvas desk-layout-builder__canvas--readonly seat-plan-ansicht-canvas";

      if (!currentSeatOrder) {
        return '<div class="seat-plan-placeholder">Fuer diese Lerngruppe und diesen Raum ist aktuell keine Sitzordnung hinterlegt.</div>';
      }

      if (!currentSeatPlan) {
        return '<div class="seat-plan-placeholder">Fuer die aktuelle Sitzordnung ist keine passende Tischordnung hinterlegt.</div>';
      }

      return [
        '<div class="' + viewClassName + '">',
        '<div class="seat-plan-ansicht-toolbar" role="toolbar" aria-label="Werkzeuge fuer die Sitzplanansicht">',
        '<button class="unterricht-seatplan-action unterricht-seatplan-action--rotation' + (isSeatPlanAnsichtRotated ? ' is-active' : '') + '" type="button" aria-label="Sitzplanansicht um 180 Grad drehen" aria-pressed="' + (isSeatPlanAnsichtRotated ? "true" : "false") + '" onclick="return window.UnterrichtsassistentApp.toggleSeatPlanAnsichtRotation()">180&deg;</button>',
        '</div>',
        '<div class="desk-layout-builder desk-layout-builder--readonly desk-layout-builder--readonly-single">',
        '<div class="desk-layout-builder__canvas-wrap desk-layout-builder__canvas-wrap--readonly">',
        '<div class="' + canvasClassName + '" style="', canvasStyle, '">',
        renderRoomWindowEdgesStatic(),
        renderSeatOrderDeskItems(offsetX, offsetY, canvasWidth, canvasHeight, { interactive: false }),
        deskLayoutItems.length ? "" : '<div class="desk-layout-builder__hint">Diese Tischordnung enthaelt noch keine Tische.</div>',
        '</div>',
        '</div>',
        '</div>',
        '</div>'
      ].join("");
    }

    function renderPlaceholder(copy) {
      return '<div class="seat-plan-placeholder">' + escapeValue(copy) + "</div>";
    }

    return [
      '<div class="panel-grid panel-grid--klasse">',
      '<article class="panel panel--full">',
      activeClass ? renderRoomPicker() : "",
      activeClass
        ? (
          seatPlanViewMode === "ansicht"
            ? renderSeatOrderReadOnlyView()
            : (seatPlanViewMode === "tischordnung"
              ? renderManageDeskLayout()
              : renderSeatOrderView())
        )
        : '<p class="empty-message">Noch keine aktive Lerngruppe vorhanden.</p>',
      "</article>",
      "</div>"
    ].join("");
  }
};

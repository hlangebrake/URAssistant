window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.sitzplan = {
  id: "sitzplan",
  title: "Sitzplan",
  render: function (service) {
    const activeClass = service.getActiveClass();
    const seatPlanViewMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSeatPlanViewMode === "function"
      ? window.UnterrichtsassistentApp.getSeatPlanViewMode()
      : "ansicht";
    const seatPlanManageMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSeatPlanManageMode === "function"
      ? window.UnterrichtsassistentApp.getSeatPlanManageMode()
      : "sitzordnung";
    const seatPlanDeskToolMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getSeatPlanDeskToolMode === "function"
      ? window.UnterrichtsassistentApp.getSeatPlanDeskToolMode()
      : "move";
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
    const seatPlan = activeClass
      ? (seatPlanViewMode === "verwalten"
        ? (seatPlanManageMode === "tischordnung" ? managedSeatPlan : currentSeatPlan)
        : currentSeatPlan)
      : null;
    const deskLayoutItems = seatPlan && Array.isArray(seatPlan.deskLayoutItems) ? seatPlan.deskLayoutItems : [];
    const deskLayoutLinks = seatPlan && Array.isArray(seatPlan.deskLayoutLinks) ? seatPlan.deskLayoutLinks : [];
    const roomWindowSide = seatPlan && typeof seatPlan.roomWindowSide === "string" ? seatPlan.roomWindowSide : "";
    const roomWidth = seatPlan && Number(seatPlan.roomWidth) ? Number(seatPlan.roomWidth) : 720;
    const roomHeight = seatPlan && Number(seatPlan.roomHeight) ? Number(seatPlan.roomHeight) : 720;

    function escapeValue(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function formatDateValue(dateValue) {
      return String(dateValue || "").slice(0, 10);
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
          '<span class="desk-layout-room-edge__label">Fenster</span>',
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
      const canvasStyle = deskBounds
        ? [
            "width:" + String(Math.max(Math.ceil(deskBounds.maxX - deskBounds.minX) + (readonlyPadding * 2), 220)) + "px",
            "height:" + String(Math.max(Math.ceil(deskBounds.maxY - deskBounds.minY) + (readonlyPadding * 2), 220)) + "px"
          ].join(";")
        : "width:" + String(roomWidth) + "px;height:" + String(roomHeight) + "px";

      if (!seatPlan) {
        return '<div class="seat-plan-placeholder">Fuer diese Lerngruppe und diesen Raum ist noch keine aktuelle Tischordnung hinterlegt.</div>';
      }

      return [
        '<div class="desk-layout-builder desk-layout-builder--readonly">',
        '<div class="desk-layout-builder__canvas-wrap desk-layout-builder__canvas-wrap--readonly">',
        '<div class="desk-layout-builder__canvas desk-layout-builder__canvas--readonly" style="', canvasStyle, '">',
        renderRoomWindowEdgesStatic(),
        renderDeskLayoutItemsStatic(offsetX, offsetY),
        deskLayoutItems.length ? "" : '<div class="desk-layout-builder__hint">Diese Tischordnung enthaelt noch keine Tische.</div>',
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
      activeClass
        ? (
          seatPlanViewMode === "ansicht"
            ? renderPlaceholder("Die Ansicht des Sitzplans wird als naechstes aufgebaut.")
            : (seatPlanManageMode === "tischordnung"
              ? renderManageDeskLayout()
              : renderSeatOrderView())
        )
        : '<p class="empty-message">Noch keine aktive Lerngruppe vorhanden.</p>',
      "</article>",
      "</div>"
    ].join("");
  }
};

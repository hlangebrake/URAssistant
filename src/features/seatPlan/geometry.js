(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.features = window.Unterrichtsassistent.features || {};
  window.Unterrichtsassistent.features.seatPlan = window.Unterrichtsassistent.features.seatPlan || {};

  function getTemplateMetrics(itemType, options) {
    const getDeskTemplateMetrics = options && typeof options.getDeskTemplateMetrics === "function"
      ? options.getDeskTemplateMetrics
      : null;

    return getDeskTemplateMetrics ? getDeskTemplateMetrics(itemType) : { width: 96, height: 72 };
  }

  function getSeatSlots(itemType, options) {
    const getDeskSeatSlots = options && typeof options.getDeskSeatSlots === "function"
      ? options.getDeskSeatSlots
      : null;

    return getDeskSeatSlots ? getDeskSeatSlots(itemType) : (String(itemType || "") === "double" ? ["left", "right"] : ["single"]);
  }

  function getDeskLayoutItemRect(item, options) {
    return {
      x: Number(item && item.x) || 0,
      y: Number(item && item.y) || 0,
      width: Number(item && item.width) || getTemplateMetrics(item && item.type, options).width,
      height: Number(item && item.height) || getTemplateMetrics(item && item.type, options).height
    };
  }

  function getDeskLayoutItemsBounds(items, options) {
    if (!items || !items.length) {
      return null;
    }

    return {
      minX: Math.min.apply(null, items.map(function (item) { return Number(item.x) || 0; })),
      minY: Math.min.apply(null, items.map(function (item) { return Number(item.y) || 0; })),
      maxRight: Math.max.apply(null, items.map(function (item) {
        return (Number(item.x) || 0) + (Number(item.width) || getTemplateMetrics(item.type, options).width);
      })),
      maxBottom: Math.max.apply(null, items.map(function (item) {
        return (Number(item.y) || 0) + (Number(item.height) || getTemplateMetrics(item.type, options).height);
      }))
    };
  }

  function getDeskLayoutGroupBounds(items, groupIds, options) {
    const groupItems = (items || []).filter(function (item) {
      return (groupIds || []).indexOf(item.id) >= 0;
    });

    return getDeskLayoutItemsBounds(groupItems, options);
  }

  function getDeskItemMetricsForSeatOptimization(item, options) {
    const rawType = String(item && item.type || "");
    const itemType = ["single", "double", "pult", "tafel"].indexOf(rawType) >= 0 ? rawType : "single";
    const templateMetrics = getTemplateMetrics(itemType, options);

    return {
      type: itemType,
      width: Number(item && item.width) || templateMetrics.width,
      height: Number(item && item.height) || templateMetrics.height
    };
  }

  function getDeskItemCenterForSeatOptimization(item, options) {
    const metrics = getDeskItemMetricsForSeatOptimization(item, options);

    return {
      x: (Number(item && item.x) || 0) + (metrics.width / 2),
      y: (Number(item && item.y) || 0) + (metrics.height / 2)
    };
  }

  function getSeatOrderReferenceTargetForSeatOptimization(item, items, options) {
    const targetItem = (items || []).find(function (candidate) {
      return candidate && candidate.type === "tafel";
    }) || (items || []).find(function (candidate) {
      return candidate && candidate.type === "pult";
    });
    const deskCenter = getDeskItemCenterForSeatOptimization(item, options);

    if (targetItem) {
      return getDeskItemCenterForSeatOptimization(targetItem, options);
    }

    return {
      x: deskCenter.x,
      y: deskCenter.y + 240
    };
  }

  function getDoubleDeskSlotLayoutForSeatOptimization(item, items, options) {
    const metrics = getDeskItemMetricsForSeatOptimization(item, options);
    const deskCenter = getDeskItemCenterForSeatOptimization(item, options);
    const targetPoint = getSeatOrderReferenceTargetForSeatOptimization(item, items, options);
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

  function getDeskSlotRectsForSeatOptimization(item, items, options) {
    const metrics = getDeskItemMetricsForSeatOptimization(item, options);
    const slotNames = getSeatSlots(String(item && item.type || ""), options);
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
      const layout = getDoubleDeskSlotLayoutForSeatOptimization(item, items, options);

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

  function getDeskSlotCenterForSeatOptimization(item, items, slotName, options) {
    const slotRect = getDeskSlotRectsForSeatOptimization(item, items, options).find(function (rect) {
      return rect && rect.slot === slotName;
    }) || null;

    if (!slotRect) {
      return null;
    }

    return {
      x: (Number(item && item.x) || 0) + slotRect.x + (slotRect.width / 2),
      y: (Number(item && item.y) || 0) + slotRect.y + (slotRect.height / 2)
    };
  }

  function getDeskSlotSideProjection(slotRect, item, sideName, options) {
    const metrics = getDeskItemMetricsForSeatOptimization(item, options);
    const itemX = Number(item && item.x) || 0;
    const itemY = Number(item && item.y) || 0;
    const tolerance = 0.5;

    if (sideName === "left") {
      return Math.abs(slotRect.x) <= tolerance
        ? { start: itemY + slotRect.y, end: itemY + slotRect.y + slotRect.height }
        : null;
    }

    if (sideName === "right") {
      return Math.abs((slotRect.x + slotRect.width) - metrics.width) <= tolerance
        ? { start: itemY + slotRect.y, end: itemY + slotRect.y + slotRect.height }
        : null;
    }

    if (sideName === "top") {
      return Math.abs(slotRect.y) <= tolerance
        ? { start: itemX + slotRect.x, end: itemX + slotRect.x + slotRect.width }
        : null;
    }

    if (sideName === "bottom") {
      return Math.abs((slotRect.y + slotRect.height) - metrics.height) <= tolerance
        ? { start: itemX + slotRect.x, end: itemX + slotRect.x + slotRect.width }
        : null;
    }

    return null;
  }

  window.Unterrichtsassistent.features.seatPlan.geometry = {
    getDeskLayoutItemRect: getDeskLayoutItemRect,
    getDeskLayoutItemsBounds: getDeskLayoutItemsBounds,
    getDeskLayoutGroupBounds: getDeskLayoutGroupBounds,
    getDeskItemMetricsForSeatOptimization: getDeskItemMetricsForSeatOptimization,
    getDeskItemCenterForSeatOptimization: getDeskItemCenterForSeatOptimization,
    getSeatOrderReferenceTargetForSeatOptimization: getSeatOrderReferenceTargetForSeatOptimization,
    getDoubleDeskSlotLayoutForSeatOptimization: getDoubleDeskSlotLayoutForSeatOptimization,
    getDeskSlotRectsForSeatOptimization: getDeskSlotRectsForSeatOptimization,
    getDeskSlotCenterForSeatOptimization: getDeskSlotCenterForSeatOptimization,
    getDeskSlotSideProjection: getDeskSlotSideProjection
  };
}());

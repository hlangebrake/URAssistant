(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.features = window.Unterrichtsassistent.features || {};
  window.Unterrichtsassistent.features.evaluation = window.Unterrichtsassistent.features.evaluation || {};

  function normalizeAspectIds(rawValue) {
    const sourceItems = Array.isArray(rawValue)
      ? rawValue
      : String(rawValue || "").split("|");
    const seen = {};

    return sourceItems.map(function (item) {
      return String(item || "").trim();
    }).filter(function (item) {
      if (!item || seen[item]) {
        return false;
      }

      seen[item] = true;
      return true;
    });
  }

  function getSourceOptions(rawSnapshot, options) {
    const getSortedEvidenceTools = options && typeof options.getSortedEvidenceTools === "function"
      ? options.getSortedEvidenceTools
      : function () {
          return [];
        };

    return [
      { id: "", label: "Keine Kompetenzquelle" },
      { id: "mathObservation", label: "K-Werkzeug: Mathematikkompetenzen" }
    ].concat(getSortedEvidenceTools(rawSnapshot).map(function (tool) {
      const toolId = String(tool && tool.id || "").trim();

      return {
        id: toolId ? "evidence:" + toolId : "",
        label: String(tool && tool.titel || "").trim() || "Bewertungswerkzeug"
      };
    }).filter(function (option) {
      return Boolean(option.id);
    }));
  }

  function getMathAspectOptions(options) {
    const competencies = Array.isArray(options && options.mathCompetencies) ? options.mathCompetencies : [];
    const markers = Array.isArray(options && options.mathMarkers) ? options.mathMarkers : [];

    return competencies.map(function (competency) {
      return {
        id: "math:competency:" + String(competency && competency.key || "").trim(),
        label: String(competency && competency.label || "").trim() || "Kompetenz"
      };
    }).concat(markers.filter(function (marker) {
      return Boolean(marker && marker.swipable);
    }).map(function (marker) {
      return {
        id: "math:marker:" + String(marker && marker.key || "").trim(),
        label: String(marker && marker.label || "").trim() || "Marker"
      };
    })).concat(markers.filter(function (marker) {
      return !Boolean(marker && marker.swipable);
    }).map(function (marker) {
      return {
        id: "math:marker:" + String(marker && marker.key || "").trim(),
        label: String(marker && marker.label || "").trim() || "Marker"
      };
    })).filter(function (option) {
      return Boolean(option.id);
    });
  }

  function getAspectOptions(rawSnapshot, sourceToolId, options) {
    const normalizedSourceId = String(sourceToolId || "").trim();
    const getEvidenceTools = options && typeof options.getEvidenceTools === "function"
      ? options.getEvidenceTools
      : function () {
          return [];
        };
    const ensureEvidenceLevel = options && typeof options.ensureEvidenceLevel === "function"
      ? options.ensureEvidenceLevel
      : function (level) {
          return level && typeof level === "object" ? level : { ebenenAspekte: [] };
        };
    const getEvidenceAspectById = options && typeof options.getEvidenceAspectById === "function"
      ? options.getEvidenceAspectById
      : function (tool, aspectId) {
          const normalizedAspectId = String(aspectId || "").trim();
          return (Array.isArray(tool && tool.aspekte) ? tool.aspekte : []).find(function (aspect) {
            return String(aspect && aspect.id || "").trim() === normalizedAspectId;
          }) || null;
        };

    if (normalizedSourceId === "mathObservation") {
      return getMathAspectOptions(options);
    }

    if (normalizedSourceId.indexOf("evidence:") === 0) {
      const evidenceToolId = normalizedSourceId.slice("evidence:".length);
      const tool = getEvidenceTools(rawSnapshot).find(function (item) {
        return String(item && item.id || "").trim() === evidenceToolId;
      }) || null;
      const aspects = Array.isArray(tool && tool.aspekte) ? tool.aspekte : [];
      const mainAspectIds = ensureEvidenceLevel(tool && tool.hauptebene).ebenenAspekte;
      const seen = {};

      return mainAspectIds.concat(aspects.map(function (aspect) {
        return String(aspect && aspect.id || "").trim();
      })).map(function (aspectId) {
        const aspect = getEvidenceAspectById(tool, aspectId);

        if (!aspect || seen[aspectId]) {
          return null;
        }

        seen[aspectId] = true;
        return {
          id: "evidence:" + evidenceToolId + ":aspect:" + aspectId,
          label: String(aspect && aspect.titel || "").trim() || "Aspekt"
        };
      }).filter(Boolean);
    }

    return [];
  }

  function normalizeSourceId(rawSnapshot, sourceToolId, options) {
    const normalizedSourceId = String(sourceToolId || "").trim();
    const getEvidenceTools = options && typeof options.getEvidenceTools === "function"
      ? options.getEvidenceTools
      : function () {
          return [];
        };

    if (getSourceOptions(rawSnapshot, options).some(function (option) {
      return String(option && option.id || "").trim() === normalizedSourceId;
    })) {
      return normalizedSourceId;
    }

    if (normalizedSourceId && getEvidenceTools(rawSnapshot).some(function (tool) {
      return String(tool && tool.id || "").trim() === normalizedSourceId;
    })) {
      return "evidence:" + normalizedSourceId;
    }

    return "";
  }

  function normalizeAspectId(aspectId, sourceId) {
    const normalizedAspectId = String(aspectId || "").trim();
    const normalizedSourceId = String(sourceId || "").trim();

    if (!normalizedAspectId || normalizedAspectId.indexOf("math:") === 0 || normalizedAspectId.indexOf("evidence:") === 0) {
      return normalizedAspectId;
    }

    return normalizedSourceId.indexOf("evidence:") === 0
      ? normalizedSourceId + ":aspect:" + normalizedAspectId
      : normalizedAspectId;
  }

  window.Unterrichtsassistent.features.evaluation.competencies = {
    normalizeAspectIds: normalizeAspectIds,
    getSourceOptions: getSourceOptions,
    getAspectOptions: getAspectOptions,
    normalizeSourceId: normalizeSourceId,
    normalizeAspectId: normalizeAspectId
  };
}());

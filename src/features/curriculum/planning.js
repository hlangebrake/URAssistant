(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.features = window.Unterrichtsassistent.features || {};
  window.Unterrichtsassistent.features.curriculum = window.Unterrichtsassistent.features.curriculum || {};

  function getItems(collections, key) {
    return collections && Array.isArray(collections[key]) ? collections[key] : [];
  }

  function getOrderedLinkedItems(items, filterKey, filterValue, nextKey) {
    const normalizedFilterValue = String(filterValue || "").trim();
    const filteredItems = (Array.isArray(items) ? items : []).filter(function (entry) {
      return String(entry && entry[filterKey] || "").trim() === normalizedFilterValue;
    });
    const incomingCounts = {};
    const itemById = {};
    const ordered = [];
    let current = null;

    filteredItems.forEach(function (entry) {
      const entryId = String(entry && entry.id || "").trim();

      if (!entryId) {
        return;
      }

      itemById[entryId] = entry;
      incomingCounts[entryId] = incomingCounts[entryId] || 0;
    });

    filteredItems.forEach(function (entry) {
      const nextId = String(entry && entry[nextKey] || "").trim();

      if (nextId && Object.prototype.hasOwnProperty.call(incomingCounts, nextId)) {
        incomingCounts[nextId] += 1;
      }
    });

    current = filteredItems.find(function (entry) {
      return !incomingCounts[String(entry && entry.id || "").trim()];
    }) || filteredItems[0] || null;

    while (current) {
      const currentId = String(current && current.id || "").trim();
      const nextId = String(current && current[nextKey] || "").trim();

      if (!currentId || ordered.some(function (entry) {
        return String(entry && entry.id || "").trim() === currentId;
      })) {
        break;
      }

      ordered.push(current);
      current = nextId && itemById[nextId] ? itemById[nextId] : null;
    }

    filteredItems.forEach(function (entry) {
      if (!ordered.some(function (orderedEntry) {
        return String(orderedEntry && orderedEntry.id || "").trim() === String(entry && entry.id || "").trim();
      })) {
        ordered.push(entry);
      }
    });

    return ordered;
  }

  function reconnectChain(items, nextKey) {
    (Array.isArray(items) ? items : []).forEach(function (entry, index) {
      entry[nextKey] = items[index + 1] ? String(items[index + 1].id || "").trim() : "";
    });
  }

  function getOrderedSeriesForClass(collections, classId) {
    return getOrderedLinkedItems(getItems(collections, "series"), "classId", classId, "nextSeriesId");
  }

  function getOrderedSequencesForSeries(collections, seriesId) {
    return getOrderedLinkedItems(getItems(collections, "sequences"), "seriesId", seriesId, "nextSequenceId");
  }

  function getOrderedLessonsForSequence(collections, sequenceId) {
    return getOrderedLinkedItems(getItems(collections, "lessons"), "sequenceId", sequenceId, "nextLessonId");
  }

  function reconnectSeriesChain(items) {
    reconnectChain(items, "nextSeriesId");
  }

  function reconnectSequenceChain(items) {
    reconnectChain(items, "nextSequenceId");
  }

  function reconnectLessonChain(items) {
    reconnectChain(items, "nextLessonId");
  }

  function getLessonHourDemand(lessonItem) {
    return String(lessonItem && lessonItem.hourType || "").trim() === "double" ? 2 : 1;
  }

  function getCalculatedSequenceHourDemand(collections, sequenceId) {
    return getOrderedLessonsForSequence(collections, sequenceId).reduce(function (sum, lessonItem) {
      return sum + getLessonHourDemand(lessonItem);
    }, 0);
  }

  function getEffectiveSequenceHourDemand(collections, sequenceItem) {
    const calculatedHourDemand = getCalculatedSequenceHourDemand(collections, String(sequenceItem && sequenceItem.id || "").trim());

    if (calculatedHourDemand > 0) {
      return calculatedHourDemand;
    }

    return Math.max(0, Number(sequenceItem && sequenceItem.hourDemand) || 0);
  }

  function getCalculatedSeriesHourDemand(collections, seriesId) {
    return getOrderedSequencesForSeries(collections, seriesId).reduce(function (sum, sequenceItem) {
      return sum + getEffectiveSequenceHourDemand(collections, sequenceItem);
    }, 0);
  }

  function createRandomSeriesColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 42 + Math.floor(Math.random() * 14);
    const lightness = 82 + Math.floor(Math.random() * 8);

    function toHexChannel(channelValue) {
      return Math.max(0, Math.min(255, Math.round(channelValue))).toString(16).padStart(2, "0");
    }

    function hslToHex(h, s, l) {
      const normalizedS = s / 100;
      const normalizedL = l / 100;
      const chroma = (1 - Math.abs((2 * normalizedL) - 1)) * normalizedS;
      const scaledHue = h / 60;
      const secondComponent = chroma * (1 - Math.abs((scaledHue % 2) - 1));
      const match = normalizedL - (chroma / 2);
      let red = 0;
      let green = 0;
      let blue = 0;

      if (scaledHue >= 0 && scaledHue < 1) {
        red = chroma;
        green = secondComponent;
      } else if (scaledHue < 2) {
        red = secondComponent;
        green = chroma;
      } else if (scaledHue < 3) {
        green = chroma;
        blue = secondComponent;
      } else if (scaledHue < 4) {
        green = secondComponent;
        blue = chroma;
      } else if (scaledHue < 5) {
        red = secondComponent;
        blue = chroma;
      } else {
        red = chroma;
        blue = secondComponent;
      }

      return "#" + [
        toHexChannel((red + match) * 255),
        toHexChannel((green + match) * 255),
        toHexChannel((blue + match) * 255)
      ].join("");
    }

    return hslToHex(hue, saturation, lightness);
  }

  function getSeriesColor(seriesItem, fallbackKey, options) {
    const normalizeColor = options && typeof options.normalizeColor === "function"
      ? options.normalizeColor
      : null;
    const createPastelColor = options && typeof options.createPastelColor === "function"
      ? options.createPastelColor
      : null;
    const normalizedColor = normalizeColor ? normalizeColor(seriesItem && seriesItem.color) : "";

    if (normalizedColor) {
      return normalizedColor;
    }

    if (!seriesItem && !fallbackKey) {
      return createRandomSeriesColor();
    }

    if (createPastelColor) {
      return createPastelColor(String(fallbackKey || (seriesItem && seriesItem.topic) || "reihe"));
    }

    return "#d9d4cb";
  }

  function removeLessonResources(snapshot, lessonIds) {
    const ids = new Set(Array.isArray(lessonIds) ? lessonIds : []);
    const resources = getItems(snapshot, "lessonResources");
    snapshot.lessonResources = resources.filter(function (resource) { return !ids.has(resource.lessonPlanId); });
    return resources.length - snapshot.lessonResources.length;
  }

  function createStandardLessonFlow(lesson, createId) {
    const isDouble = lesson.hourType === "double";
    const durations = isDouble ? [10, 35, 20, 20, 5] : [5, 20, 10, 8, 2];
    const templates = [
      ["Einstieg", "Vorwissen aktivieren", "Vorwissen sammeln und die Leitfrage der Stunde klären.", "plenum", "afb1"],
      ["Erarbeitung", "Aufgabe bearbeiten", "Arbeitsauftrag und erwartetes Ergebnis ergänzen.", "partner", "afb2"],
      ["Sicherung", "Ergebnisse sichern", "Ergebnisse vergleichen, fachlich klären und festhalten.", "plenum", "afb2"],
      ["Anwendung", "Erkenntnis anwenden", "Eine passende Übungs- oder Transferaufgabe ergänzen.", "einzel", "afb2/3"],
      ["Abschluss", "Lernziel prüfen", "Kurze Rückmeldung zur Leitfrage und Ausblick auf die nächste Stunde.", "plenum", "afb1/2"]
    ];
    const phases = [];
    const steps = [];
    templates.forEach(function (entry, index) {
      const phaseId = createId("phase");
      phases.push({ id: phaseId, lessonPlanId: lesson.id, title: entry[0], durationMinutes: durations[index], isReserve: false, situationType: lesson.situationType || "lernen", demandLevel: entry[4], nextPhaseId: "" });
      steps.push({ id: createId("step"), phaseId: phaseId, title: entry[1], content: entry[2], durationMinutes: durations[index], socialForm: entry[3], material: "", competencyAspectIds: [], nextStepId: "" });
    });
    reconnectChain(phases, "nextPhaseId");
    return { phases: phases, steps: steps };
  }

  function appendQuickLessons(snapshot, sequenceId, text, hourType, withTemplate, createId) {
    const sequences = getItems(snapshot, "curriculumSequences");
    const sequence = sequences.find(function (item) { return item.id === sequenceId; });
    const titles = String(text || "").split(/\r?\n/).map(function (line) { return line.trim().replace(/^(?:[-*•]|\d+[.)])\s+/, ""); }).filter(Boolean);
    if (!sequence || !titles.length || titles.length > 50) { return { lessonIds: [], error: "Bitte eine Sequenz und 1 bis 50 Stundenthemen angeben (ein Thema je Zeile)." }; }
    snapshot.curriculumLessonPlans = getItems(snapshot, "curriculumLessonPlans");
    snapshot.curriculumLessonPhases = getItems(snapshot, "curriculumLessonPhases");
    snapshot.curriculumLessonSteps = getItems(snapshot, "curriculumLessonSteps");
    const collections = { series: getItems(snapshot, "curriculumSeries"), sequences: sequences, lessons: snapshot.curriculumLessonPlans };
    const ordered = getOrderedLessonsForSequence(collections, sequenceId);
    const lessonIds = [];
    titles.forEach(function (topic) {
      const lesson = {
        id: createId("lesson"), sequenceId: sequenceId, topic: topic, summary: "", hourType: hourType === "double" ? "double" : "single",
        functionType: "erarbeiten", situationType: "lernen", demandLevel: "", preparationMode: "", preparationText: "", preparationTodoId: "",
        homeworkText: "", homeworkDueMode: "", homeworkDueAmount: 1, homeworkDueUnit: "tage", competencyFocusAspectId: "", competencyAspectIds: [], curriculumTopicNodeIds: [], nextLessonId: ""
      };
      snapshot.curriculumLessonPlans.push(lesson);
      ordered.push(lesson);
      lessonIds.push(lesson.id);
      if (withTemplate) {
        const flow = createStandardLessonFlow(lesson, createId);
        snapshot.curriculumLessonPhases.push.apply(snapshot.curriculumLessonPhases, flow.phases);
        snapshot.curriculumLessonSteps.push.apply(snapshot.curriculumLessonSteps, flow.steps);
      }
    });
    reconnectLessonChain(ordered);
    sequence.hourDemand = Math.max(Number(sequence.hourDemand) || 0, getCalculatedSequenceHourDemand(collections, sequenceId));
    const series = collections.series.find(function (item) { return item.id === sequence.seriesId; });
    if (series) { series.hourDemand = Math.max(Number(series.hourDemand) || 0, getCalculatedSeriesHourDemand(collections, series.id)); }
    return { lessonIds: lessonIds, error: "" };
  }

  window.Unterrichtsassistent.features.curriculum.planning = {
    removeLessonResources: removeLessonResources,
    createStandardLessonFlow: createStandardLessonFlow,
    appendQuickLessons: appendQuickLessons,
    getOrderedSeriesForClass: getOrderedSeriesForClass,
    getOrderedSequencesForSeries: getOrderedSequencesForSeries,
    getOrderedLessonsForSequence: getOrderedLessonsForSequence,
    reconnectSeriesChain: reconnectSeriesChain,
    reconnectSequenceChain: reconnectSequenceChain,
    reconnectLessonChain: reconnectLessonChain,
    getLessonHourDemand: getLessonHourDemand,
    getCalculatedSequenceHourDemand: getCalculatedSequenceHourDemand,
    getEffectiveSequenceHourDemand: getEffectiveSequenceHourDemand,
    getCalculatedSeriesHourDemand: getCalculatedSeriesHourDemand,
    createRandomSeriesColor: createRandomSeriesColor,
    getSeriesColor: getSeriesColor
  };
}());

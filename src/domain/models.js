window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.domain = window.Unterrichtsassistent.domain || {};

class Student {
  constructor({ id, firstName, lastName, className = "", gender = "", strengths = [], gaps = [], attendanceRate = 1, socialRelations = {} }) {
    const sourceSocialRelations = socialRelations && typeof socialRelations === "object" ? socialRelations : {};
    function normalizeSocialRelationList(value) {
      return Array.isArray(value)
        ? value.map(function (studentId) {
            return String(studentId || "").trim();
          }).filter(Boolean)
        : [];
    }

    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.className = className;
    this.gender = gender;
    this.strengths = strengths;
    this.gaps = gaps;
    this.attendanceRate = attendanceRate;
    this.socialRelations = {
      likesWith: normalizeSocialRelationList(sourceSocialRelations.likesWith),
      dislikesWith: normalizeSocialRelationList(sourceSocialRelations.dislikesWith),
      shouldWith: normalizeSocialRelationList(sourceSocialRelations.shouldWith),
      shouldNotWith: normalizeSocialRelationList(sourceSocialRelations.shouldNotWith)
    };
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

class SchoolClass {
  constructor({ id, name, room, subject, studentIds = [], displayColor = "" }) {
    this.id = id;
    this.name = name;
    this.room = room;
    this.subject = subject;
    this.studentIds = studentIds;
    this.displayColor = displayColor;
  }
}

class Lesson {
  constructor({ id, classId, subject, room, weekday, startTime, endTime, topic }) {
    this.id = id;
    this.classId = classId;
    this.subject = subject;
    this.room = room;
    this.weekday = weekday;
    this.startTime = startTime;
    this.endTime = endTime;
    this.topic = topic;
  }
}

class TimetableRow {
  constructor({ id, type = "lesson", durationMinutes = 45, days = {} }) {
    this.id = id;
    this.type = type === "pause" ? "pause" : "lesson";
    this.durationMinutes = Number(durationMinutes) || (this.type === "pause" ? 5 : 45);
    this.days = days;
  }
}

class Timetable {
  constructor({ id, validFrom = "", validTo = "", startTime = "07:50", rows = [] }) {
    this.id = id;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.startTime = startTime || "07:50";
    this.rows = rows.map((row) => new TimetableRow(row));
  }
}

class Assessment {
  constructor({
    id,
    studentId,
    classId,
    type = "",
    score = 0,
    maxScore = 0,
    date = "",
    lessonId = "",
    lessonDate = "",
    room = "",
    recordedAt = "",
    category = "",
    afb1 = "--",
    afb2 = "--",
    afb3 = "--",
    workBehavior = "",
    socialBehavior = "",
    knowledgeGap = "",
    note = ""
  }) {
    this.id = id;
    this.studentId = studentId;
    this.classId = classId;
    this.type = type;
    this.score = score;
    this.maxScore = maxScore;
    this.date = date;
    this.lessonId = lessonId;
    this.lessonDate = lessonDate;
    this.room = room;
    this.recordedAt = recordedAt;
    this.category = category;
    this.afb1 = afb1;
    this.afb2 = afb2;
    this.afb3 = afb3;
    this.workBehavior = workBehavior;
    this.socialBehavior = socialBehavior;
    this.knowledgeGap = knowledgeGap;
    this.note = note;
  }

  get percentage() {
    if (!this.maxScore) {
      return 0;
    }
    return Math.round((this.score / this.maxScore) * 100);
  }
}

class EvaluationSheet {
  constructor({ id, classId = "", type = "aufgabenbogen", title = "", createdAt = "", workingTimeMinutes = 0, taskSheet = {}, competencyGrid = {}, curriculumSeriesIds = [], curriculumSequenceIds = [], curriculumLessonIds = [] }) {
    const normalizedType = String(type || "").trim().toLowerCase() === "kompetenzraster"
      ? "kompetenzraster"
      : "aufgabenbogen";
    function normalizeTaskSheet(rawTaskSheet) {
      const source = rawTaskSheet && typeof rawTaskSheet === "object" ? rawTaskSheet : {};
      const tasks = Array.isArray(source.tasks) ? source.tasks : [];

      return {
        tasks: tasks.map(function (task) {
          const taskSource = task && typeof task === "object" ? task : {};
          const subtasks = Array.isArray(taskSource.subtasks) ? taskSource.subtasks : [];

          return {
            id: String(taskSource.id || "").trim(),
            title: String(taskSource.title || "").trim(),
            subtasks: subtasks.map(function (subtask) {
              const subtaskSource = subtask && typeof subtask === "object" ? subtask : {};

              return {
                id: String(subtaskSource.id || "").trim(),
                title: String(subtaskSource.title || "").trim(),
                topics: String(subtaskSource.topics || "").trim(),
                afb: String(subtaskSource.afb || "").trim(),
                be: Math.max(0, Number.isFinite(Number(subtaskSource.be)) ? Math.round(Number(subtaskSource.be)) : 0)
              };
            })
          };
        })
      };
    }

    function normalizeCompetencyGrid(rawCompetencyGrid) {
      const source = rawCompetencyGrid && typeof rawCompetencyGrid === "object" ? rawCompetencyGrid : {};
      const rows = Array.isArray(source.rows) ? source.rows : [];
      const columns = Array.isArray(source.columns) ? source.columns : [];
      const cells = source.cells && typeof source.cells === "object" ? source.cells : {};
      const normalizedRows = rows.map(function (row) {
        const rowSource = row && typeof row === "object" ? row : {};

        return {
          id: String(rowSource.id || "").trim(),
          title: String(rowSource.title || "").trim(),
          weight: Math.max(0, Number.isFinite(Number(rowSource.weight)) ? Math.round(Number(rowSource.weight)) : 0)
        };
      }).filter(function (row) {
        return Boolean(row.id);
      });
      const normalizedColumns = columns.map(function (column) {
        const columnSource = column && typeof column === "object" ? column : {};

        return {
          id: String(columnSource.id || "").trim(),
          title: String(columnSource.title || "").trim()
        };
      }).filter(function (column) {
        return Boolean(column.id);
      });
      const rowLookup = normalizedRows.reduce(function (lookup, row) {
        lookup[row.id] = true;
        return lookup;
      }, {});
      const columnLookup = normalizedColumns.reduce(function (lookup, column) {
        lookup[column.id] = true;
        return lookup;
      }, {});
      const normalizedCells = {};

      Object.keys(cells).forEach(function (rowId) {
        const normalizedRowId = String(rowId || "").trim();

        if (!rowLookup[normalizedRowId] || !cells[rowId] || typeof cells[rowId] !== "object") {
          return;
        }

        Object.keys(cells[rowId]).forEach(function (columnId) {
          const normalizedColumnId = String(columnId || "").trim();
          const textValue = String(cells[rowId][columnId] || "").trim();

          if (!columnLookup[normalizedColumnId] || !textValue) {
            return;
          }

          if (!normalizedCells[normalizedRowId]) {
            normalizedCells[normalizedRowId] = {};
          }
          normalizedCells[normalizedRowId][normalizedColumnId] = textValue;
        });
      });

      return {
        rows: normalizedRows,
        columns: normalizedColumns,
        cells: normalizedCells
      };
    }

    this.id = id;
    this.classId = classId;
    this.type = normalizedType;
    this.title = String(title || "").trim();
    this.createdAt = String(createdAt || "").trim();
    this.workingTimeMinutes = Math.max(0, Number.isFinite(Number(workingTimeMinutes)) ? Math.round(Number(workingTimeMinutes)) : 0);
    this.curriculumSeriesIds = Array.isArray(curriculumSeriesIds) ? curriculumSeriesIds.slice() : [];
    this.curriculumSequenceIds = Array.isArray(curriculumSequenceIds) ? curriculumSequenceIds.slice() : [];
    this.curriculumLessonIds = Array.isArray(curriculumLessonIds) ? curriculumLessonIds.slice() : [];
    this.taskSheet = normalizedType === "aufgabenbogen" && taskSheet && typeof taskSheet === "object"
      ? normalizeTaskSheet(taskSheet)
      : { tasks: [] };
    this.competencyGrid = normalizedType === "kompetenzraster" && competencyGrid && typeof competencyGrid === "object"
      ? normalizeCompetencyGrid(competencyGrid)
      : {};
  }
}

class EvidenceTool {
  constructor({ id, titel = "", symbol = "", faecher = [], jahrgaenge = [], aspekte = [], hauptebene = {} }) {
    function normalizeLevel(rawLevel) {
      const source = rawLevel && typeof rawLevel === "object" ? rawLevel : {};
      const rawItems = Array.isArray(source.ebenenAspekte)
        ? source.ebenenAspekte
        : (Array.isArray(source.aspectIds) ? source.aspectIds : []);
      const rawLayout = source.layout && typeof source.layout === "object" ? source.layout : {};
      const rawPositions = rawLayout.aspectPositions && typeof rawLayout.aspectPositions === "object"
        ? rawLayout.aspectPositions
        : {};
      const rawAspectSizes = rawLayout.aspectSizes && typeof rawLayout.aspectSizes === "object"
        ? rawLayout.aspectSizes
        : {};
      const rawStageSizes = rawLayout.stageSizes && typeof rawLayout.stageSizes === "object"
        ? rawLayout.stageSizes
        : {};
      const aspectPositions = {};
      const aspectSizes = {};
      const stageSizes = {};
      let rawBoundingBox = rawLayout.boundingBox && typeof rawLayout.boundingBox === "object"
        ? rawLayout.boundingBox
        : null;

      const ebenenAspekte = rawItems.map(function (item) {
          return String(item && typeof item === "object" ? item.id : item || "").trim();
        }).filter(Boolean);

      ebenenAspekte.forEach(function (aspectId) {
        const rawPosition = rawPositions[aspectId] && typeof rawPositions[aspectId] === "object"
          ? rawPositions[aspectId]
          : {};
        const x = Number(rawPosition.x);
        const y = Number(rawPosition.y);

        aspectPositions[aspectId] = {
          x: Number.isFinite(x) ? x : 0,
          y: Number.isFinite(y) ? y : 0
        };
        if (rawAspectSizes[aspectId] && typeof rawAspectSizes[aspectId] === "object") {
          aspectSizes[aspectId] = {
            width: Math.max(24, Number.isFinite(Number(rawAspectSizes[aspectId].width)) ? Number(rawAspectSizes[aspectId].width) : 150),
            height: Math.max(18, Number.isFinite(Number(rawAspectSizes[aspectId].height)) ? Number(rawAspectSizes[aspectId].height) : 22)
          };
        }
      });

      Object.keys(rawStageSizes).forEach(function (stageId) {
        const size = rawStageSizes[stageId] && typeof rawStageSizes[stageId] === "object" ? rawStageSizes[stageId] : {};

        stageSizes[stageId] = {
          width: Math.max(24, Number.isFinite(Number(size.width)) ? Number(size.width) : 118),
          height: Math.max(18, Number.isFinite(Number(size.height)) ? Number(size.height) : 20)
        };
      });

      rawBoundingBox = rawBoundingBox
        ? {
            x: Number.isFinite(Number(rawBoundingBox.x)) ? Number(rawBoundingBox.x) : 0,
            y: Number.isFinite(Number(rawBoundingBox.y)) ? Number(rawBoundingBox.y) : 0,
            width: Math.max(0, Number.isFinite(Number(rawBoundingBox.width)) ? Number(rawBoundingBox.width) : 0),
            height: Math.max(0, Number.isFinite(Number(rawBoundingBox.height)) ? Number(rawBoundingBox.height) : 0)
          }
        : { x: 0, y: 0, width: 0, height: 0 };

      return {
        ebenenAspekte: ebenenAspekte,
        layout: {
          aspectPositions: aspectPositions,
          aspectSizes: aspectSizes,
          stageSizes: stageSizes,
          boundingBox: rawBoundingBox
        }
      };
    }

    function normalizeStages(rawStages) {
      return (Array.isArray(rawStages) ? rawStages : []).map(function (stage) {
        const source = stage && typeof stage === "object" ? stage : {};

        return {
          id: String(source.id || "").trim(),
          bezeichnung: String(source.bezeichnung || "").trim(),
          beispiel: String(source.beispiel || "").trim(),
          information: String(source.information || "").trim()
        };
      }).filter(function (stage) {
        return Boolean(stage.id);
      });
    }

    function normalizeDimensions(rawDimensions) {
      return (Array.isArray(rawDimensions) ? rawDimensions : []).map(function (dimension) {
        const source = dimension && typeof dimension === "object" ? dimension : {};

        return {
          id: String(source.id || "").trim(),
          bezeichnung: String(source.bezeichnung || "").trim(),
          stufen: normalizeStages(source.stufen)
        };
      }).filter(function (dimension) {
        return Boolean(dimension.id);
      });
    }

    this.id = String(id || "").trim();
    this.titel = String(titel || "").trim();
    this.symbol = String(symbol || "").trim();
    this.faecher = (Array.isArray(faecher) ? faecher : []).map(function (fach) {
      return String(fach || "").trim();
    }).filter(Boolean);
    this.jahrgaenge = (Array.isArray(jahrgaenge) ? jahrgaenge : []).map(function (jahrgang) {
      return Math.round(Number(jahrgang));
    }).filter(function (jahrgang) {
      return Number.isFinite(jahrgang) && jahrgang >= 5 && jahrgang <= 13;
    });
    this.aspekte = (Array.isArray(aspekte) ? aspekte : []).map(function (aspect) {
      const source = aspect && typeof aspect === "object" ? aspect : {};

      return {
        id: String(source.id || "").trim(),
        titel: String(source.titel || "").trim(),
        folgeEbene: normalizeLevel(source.folgeEbene),
        information: String(source.information || "").trim(),
        beispiel: String(source.beispiel || "").trim(),
        aspektDimensionen: normalizeDimensions(source.aspektDimensionen)
      };
    }).filter(function (aspect) {
      return Boolean(aspect.id);
    });
    this.hauptebene = normalizeLevel(hauptebene);
  }
}

class PlannedEvaluation {
  constructor({ id, classId = "", type = "sonstige", evaluationSheetId = "", date = "", studentIds = [], createPlanningEvent = true, planningEventId = "", createdAt = "", gradingSystem = [] }) {
    this.id = id;
    this.classId = String(classId || "").trim();
    this.type = String(type || "").trim().toLowerCase() === "schriftliche"
      ? "schriftliche"
      : "sonstige";
    this.evaluationSheetId = String(evaluationSheetId || "").trim();
    this.date = String(date || "").slice(0, 10);
    this.studentIds = Array.isArray(studentIds)
      ? studentIds.map(function (studentId) {
          return String(studentId || "").trim();
        }).filter(Boolean)
      : [];
    this.createPlanningEvent = Boolean(createPlanningEvent);
    this.planningEventId = String(planningEventId || "").trim();
    this.createdAt = String(createdAt || "").trim();
    this.gradingSystem = Array.isArray(gradingSystem)
      ? gradingSystem.map(function (entry) {
          const source = entry && typeof entry === "object" ? entry : {};

          return {
            id: String(source.id || "").trim(),
            label: String(source.label || "").trim(),
            minPercent: Math.max(0, Math.min(100, Number.isFinite(Number(source.minPercent)) ? Number(source.minPercent) : 0))
          };
        }).filter(function (entry) {
          return Boolean(entry.id);
        })
      : [];
  }
}

class PerformedEvaluation {
  constructor({ id, plannedEvaluationId = "", classId = "", studentId = "", evaluationSheetId = "", subtaskResults = [], competencyResults = [], overallNote = "", isCompleted = false, completedAt = "", createdAt = "", updatedAt = "" }) {
    this.id = id;
    this.plannedEvaluationId = String(plannedEvaluationId || "").trim();
    this.classId = String(classId || "").trim();
    this.studentId = String(studentId || "").trim();
    this.evaluationSheetId = String(evaluationSheetId || "").trim();
    this.subtaskResults = Array.isArray(subtaskResults)
      ? subtaskResults.map(function (entry) {
          const source = entry && typeof entry === "object" ? entry : {};

          return {
            subtaskId: String(source.subtaskId || "").trim(),
            points: Math.max(0, Number.isFinite(Number(source.points)) ? Number(source.points) : 0),
            negativeNotes: Array.isArray(source.negativeNotes)
              ? source.negativeNotes.map(function (entry) { return String(entry || "").trim(); }).filter(Boolean)
              : (String(source.negativeNote || "").trim() ? [String(source.negativeNote || "").trim()] : []),
            positiveNotes: Array.isArray(source.positiveNotes)
              ? source.positiveNotes.map(function (entry) { return String(entry || "").trim(); }).filter(Boolean)
              : (String(source.positiveNote || "").trim() ? [String(source.positiveNote || "").trim()] : []),
            generalNote: String(source.generalNote || "").trim()
          };
        }).filter(function (entry) {
          return Boolean(entry.subtaskId);
        })
      : [];
    this.competencyResults = Array.isArray(competencyResults)
      ? competencyResults.map(function (entry) {
          const source = entry && typeof entry === "object" ? entry : {};

          return {
            rowId: String(source.rowId || "").trim(),
            columnId: String(source.columnId || "").trim(),
            evidences: Array.isArray(source.evidences)
              ? source.evidences.map(function (evidence) {
                  const evidenceSource = evidence && typeof evidence === "object" ? evidence : {};

                  return {
                    type: String(evidenceSource.type || "").trim(),
                    text: String(evidenceSource.text || "").trim()
                  };
                }).filter(function (evidence) {
                  return Boolean(evidence.type || evidence.text);
                })
              : [],
            nextStep: String(source.nextStep || "").trim()
          };
        }).filter(function (entry) {
          return Boolean(entry.rowId);
        })
      : [];
    this.overallNote = String(overallNote || "").trim();
    this.isCompleted = Boolean(isCompleted);
    this.completedAt = this.isCompleted ? String(completedAt || "").trim() : "";
    this.createdAt = String(createdAt || "").trim();
    this.updatedAt = String(updatedAt || "").trim();
  }
}

class AttendanceRecord {
  constructor({ id, studentId, classId, lessonId = "", lessonDate = "", room = "", status = "absent", recordedAt = "", effectiveAt = "" }) {
    this.id = id;
    this.studentId = studentId;
    this.classId = classId;
    this.lessonId = lessonId;
    this.lessonDate = lessonDate;
    this.room = room;
    this.status = status === "present" ? "present" : "absent";
    this.recordedAt = recordedAt;
    this.effectiveAt = effectiveAt;
  }
}

class HomeworkRecord {
  constructor({ id, studentId, classId, lessonId = "", lessonDate = "", room = "", recordedAt = "", quality = "fehlt", ignored = false }) {
    this.id = id;
    this.studentId = studentId;
    this.classId = classId;
    this.lessonId = lessonId;
    this.lessonDate = lessonDate;
    this.room = room;
    this.recordedAt = recordedAt;
    this.quality = quality;
    this.ignored = Boolean(ignored);
  }
}

class WarningRecord {
  constructor({ id, studentId, classId, lessonId = "", lessonDate = "", room = "", recordedAt = "", category = "stoerung", note = "" }) {
    this.id = id;
    this.studentId = studentId;
    this.classId = classId;
    this.lessonId = lessonId;
    this.lessonDate = lessonDate;
    this.room = room;
    this.recordedAt = recordedAt;
    this.category = category;
    this.note = note;
  }
}

class KnowledgeGapRecord {
  constructor({ id, studentId, classId, lessonId = "", lessonDate = "", room = "", recordedAt = "", content = "", status = "offen", note = "" }) {
    const normalizedStatus = String(status || "").trim().toLowerCase();

    this.id = id;
    this.studentId = studentId;
    this.classId = classId;
    this.lessonId = lessonId;
    this.lessonDate = lessonDate;
    this.room = room;
    this.recordedAt = recordedAt;
    this.content = String(content || "").trim();
    this.status = ["offen", "in arbeit", "geschlossen"].indexOf(normalizedStatus) >= 0 ? normalizedStatus : "offen";
    this.note = String(note || "").trim();
  }
}

class MathObservationRecord {
  constructor({
    id,
    studentId,
    classId,
    lessonId = "",
    lessonDate = "",
    room = "",
    recordedAt = "",
    primaryCompetency = "",
    competencyIds = [],
    processQuality = 0,
    marker = "",
    markerDirection = "",
    markerQuality = "",
    situationType = "",
    demandLevel = "",
    lessonPlanId = "",
    lessonPhaseId = "",
    lessonStepId = "",
    note = ""
  }) {
    const allowedCompetencies = ["k1", "k2", "k3", "k4", "k5", "k6"];
    const allowedMarkers = [
      "frage",
      "vermutung",
      "begruendung_widerlegung",
      "beitrag",
      "strategie",
      "loesungsweg_praesentiert",
      "fehlende_information",
      "plausibilitaet_geprueft",
      "darstellung",
      "symbolisiert_formalisiert",
      "werkzeug_funktional",
      "modell_geprueft",
      "anderer_beitrag",
      "fachsprache",
      "fehler",
      "vorgehen_reflektiert"
    ];
    const normalizedPrimary = String(primaryCompetency || "").trim().toLowerCase();
    const effectivePrimary = allowedCompetencies.indexOf(normalizedPrimary) >= 0
      ? normalizedPrimary
      : "";
    const numericProcessQuality = Number(processQuality);
    const normalizedMarker = String(marker || "").trim().toLowerCase();
    const numericMarkerQuality = Number(markerQuality);
    const normalizedSituationType = String(situationType || "").trim().toLowerCase();
    const normalizedDemandLevel = String(demandLevel || "").trim().toLowerCase();

    this.id = id;
    this.studentId = studentId;
    this.classId = classId;
    this.lessonId = lessonId;
    this.lessonDate = lessonDate;
    this.room = room;
    this.recordedAt = recordedAt;
    this.primaryCompetency = effectivePrimary;
    this.competencyIds = Array.from(new Set((effectivePrimary ? [effectivePrimary] : []).concat(Array.isArray(competencyIds) ? competencyIds : []).map(function (competencyId) {
      return String(competencyId || "").trim().toLowerCase();
    }).filter(function (competencyId) {
      return allowedCompetencies.indexOf(competencyId) >= 0;
    })));
    this.processQuality = Number.isFinite(numericProcessQuality)
      ? Math.max(-2, Math.min(2, Math.round(numericProcessQuality)))
      : 0;
    this.marker = !normalizedMarker ? "" : (allowedMarkers.indexOf(normalizedMarker) >= 0 ? normalizedMarker : "beitrag");
    this.markerDirection = ["left", "right"].indexOf(String(markerDirection || "").trim().toLowerCase()) >= 0
      ? String(markerDirection || "").trim().toLowerCase()
      : "";
    this.markerQuality = String(markerQuality || "").trim() === ""
      ? ""
      : (Number.isFinite(numericMarkerQuality) ? Math.max(-2, Math.min(2, Math.round(numericMarkerQuality))) : "");
    this.situationType = ["lernen", "leisten"].indexOf(normalizedSituationType) >= 0 ? normalizedSituationType : "";
    this.demandLevel = ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(normalizedDemandLevel) >= 0 ? normalizedDemandLevel : "";
    this.lessonPlanId = String(lessonPlanId || "").trim();
    this.lessonPhaseId = String(lessonPhaseId || "").trim();
    this.lessonStepId = String(lessonStepId || "").trim();
    this.note = String(note || "").trim();
  }
}

class EvidenceObservationRecord {
  constructor({ id, studentId, classId, lessonId = "", lessonDate = "", room = "", recordedAt = "", toolId = "", situationType = "", demandLevel = "", selections = [] }) {
    this.id = id;
    this.studentId = String(studentId || "").trim();
    this.classId = String(classId || "").trim();
    this.lessonId = String(lessonId || "").trim();
    this.lessonDate = String(lessonDate || "").slice(0, 10);
    this.room = String(room || "").trim();
    this.recordedAt = String(recordedAt || "").trim();
    this.toolId = String(toolId || "").trim();
    this.situationType = ["lernen", "leisten"].indexOf(String(situationType || "").trim().toLowerCase()) >= 0
      ? String(situationType || "").trim().toLowerCase()
      : "";
    this.demandLevel = ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(String(demandLevel || "").trim().toLowerCase()) >= 0
      ? String(demandLevel || "").trim().toLowerCase()
      : "";
    this.selections = (Array.isArray(selections) ? selections : []).map(function (selection) {
      const source = selection && typeof selection === "object" ? selection : {};

      return {
        aspectId: String(source.aspectId || "").trim(),
        stages: (Array.isArray(source.stages) ? source.stages : []).map(function (stage) {
          const stageSource = stage && typeof stage === "object" ? stage : {};

          return {
            dimensionId: String(stageSource.dimensionId || "").trim(),
            stageId: String(stageSource.stageId || "").trim()
          };
        }).filter(function (stage) {
          return Boolean(stage.dimensionId && stage.stageId);
        })
      };
    }).filter(function (selection) {
      return Boolean(selection.aspectId);
    });
  }
}

class TodoItem {
  constructor({ id, title = "", description = "", category = "", dueDate = "", relatedClassId = "", assignedStudentIds = [], assignedStudentStatuses = [], priority = "niedrig", type = "standard", checklistItems = [], done = false, completedAt = "" }) {
    this.id = id;
    this.title = String(title || "").trim();
    this.description = String(description || "").trim();
    this.category = String(category || "").trim();
    this.dueDate = String(dueDate || "").slice(0, 10);
    this.relatedClassId = String(relatedClassId || "").trim();
    this.assignedStudentIds = Array.isArray(assignedStudentIds)
      ? assignedStudentIds.map(function (studentId) {
          return String(studentId || "").trim();
        }).filter(Boolean)
      : [];
    this.assignedStudentStatuses = Array.isArray(assignedStudentStatuses)
        ? assignedStudentStatuses.map(function (entry) {
            const source = entry && typeof entry === "object" ? entry : {};
              return {
                studentId: String(source.studentId || "").trim(),
                done: Boolean(source.done),
                completedAt: Boolean(source.done) ? String(source.completedAt || "").trim() : "",
                checklistItems: Array.isArray(source.checklistItems)
                  ? source.checklistItems.map(function (itemEntry) {
                      const levelValue = Number(itemEntry && itemEntry.level);
                      return {
                        id: String(itemEntry && itemEntry.id || "").trim(),
                        title: String(itemEntry && itemEntry.title || "").trim(),
                        level: Number.isFinite(levelValue) && levelValue > 0 ? Math.floor(levelValue) : 1,
                        parentId: String(itemEntry && itemEntry.parentId || "").trim(),
                        done: Boolean(itemEntry && itemEntry.done),
                        completedAt: Boolean(itemEntry && itemEntry.done) ? String(itemEntry && itemEntry.completedAt || "").trim() : "",
                        followUpSteps: Array.isArray(itemEntry && itemEntry.followUpSteps)
                          ? itemEntry.followUpSteps.map(function (step) {
                              return {
                                id: String(step && step.id || "").trim(),
                                title: String(step && step.title || "").trim(),
                                done: Boolean(step && step.done),
                                completedAt: Boolean(step && step.done) ? String(step && step.completedAt || "").trim() : "",
                                level: Number.isFinite(Number(step && step.level)) && Number(step && step.level) > 0 ? Math.floor(Number(step.level)) : 1,
                                previousStepId: String(step && step.previousStepId || "").trim()
                              };
                          }).filter(function (step) {
                            return Boolean(step && step.title);
                          })
                        : []
                    };
                  }).filter(function (itemEntry) {
                    return Boolean(itemEntry && itemEntry.title);
                  })
                : []
            };
          }).filter(function (entry) {
            return Boolean(entry.studentId);
          })
      : [];
    this.priority = ["niedrig", "standard", "hoch"].indexOf(String(priority || "").trim().toLowerCase()) >= 0
      ? String(priority || "").trim().toLowerCase()
      : "niedrig";
    this.type = ["standard", "checkliste", "step-checkliste"].indexOf(String(type || "").trim().toLowerCase()) >= 0
      ? String(type || "").trim().toLowerCase()
      : "standard";
    this.checklistItems = Array.isArray(checklistItems)
      ? checklistItems.map(function (entry) {
          if (entry && typeof entry === "object") {
            const levelValue = Number(entry.level);

              return {
                id: String(entry.id || "").trim(),
                title: String(entry.title || "").trim(),
                level: Number.isFinite(levelValue) && levelValue > 0 ? Math.floor(levelValue) : 1,
                parentId: String(entry.parentId || "").trim(),
                done: Boolean(entry.done),
                completedAt: Boolean(entry.done) ? String(entry.completedAt || "").trim() : "",
                followUpSteps: Array.isArray(entry.followUpSteps)
                  ? entry.followUpSteps.map(function (step) {
                      if (step && typeof step === "object") {
                        return {
                          id: String(step.id || "").trim(),
                          title: String(step.title || "").trim(),
                          done: Boolean(step.done),
                          completedAt: Boolean(step.done) ? String(step.completedAt || "").trim() : "",
                          level: Number.isFinite(Number(step.level)) && Number(step.level) > 0 ? Math.floor(Number(step.level)) : 1,
                          previousStepId: String(step.previousStepId || "").trim()
                        };
                    }

                      return {
                        id: "",
                        title: String(step || "").trim(),
                        done: false,
                        completedAt: "",
                        level: 1,
                        previousStepId: ""
                      };
                  }).filter(function (step) {
                    return Boolean(step && step.title);
                  })
                : []
            };
          }

            return {
              id: "",
              title: String(entry || "").trim(),
              level: 1,
              parentId: "",
              done: false,
              completedAt: "",
              followUpSteps: []
            };
        }).filter(function (entry) {
          return Boolean(entry && entry.title);
        })
      : [];
    this.done = Boolean(done);
    this.completedAt = this.done ? String(completedAt || "").trim() : "";
  }
}

class SeatPlan {
  constructor({ id, classId, room = "", validFrom = "", validTo = "", updatedAt, seats = [], deskLayoutItems = [], deskLayoutLinks = [], roomWindowSide = "", roomWidth = 720, roomHeight = 720 }) {
    this.id = id;
    this.classId = classId;
    this.room = room;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.updatedAt = updatedAt;
    this.seats = seats;
    this.deskLayoutItems = deskLayoutItems;
    this.deskLayoutLinks = deskLayoutLinks;
    this.roomWindowSide = roomWindowSide;
    this.roomWidth = roomWidth;
    this.roomHeight = roomHeight;
  }
}

class SeatOrder {
  constructor({ id, classId, room = "", validFrom = "", validTo = "", updatedAt, seats = [] }) {
    this.id = id;
    this.classId = classId;
    this.room = room;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.updatedAt = updatedAt;
    this.seats = seats;
  }
}

class PlanningEvent {
    constructor({
      id,
      title = "",
      startDate = "",
      endDate = "",
      startTime = "",
      endTime = "",
      category = "",
      description = "",
      priority = 3,
      showInTimetable = false,
      causesInstructionOutage = false,
      isRecurring = false,
      recurrenceInterval = 1,
      recurrenceUnit = "weeks",
      recurrenceUntilDate = "",
      recurrenceMonthlyWeekday = false,
      isExternallyControlled = false,
      controlledByView = "",
      controlledById = ""
    }) {
      const normalizedStartDate = String(startDate || "").slice(0, 10);
      const normalizedEndDate = String(endDate || normalizedStartDate).slice(0, 10) || normalizedStartDate;
      const normalizedRecurrenceUnit = ["days", "weeks", "months"].indexOf(String(recurrenceUnit || "").trim().toLowerCase()) >= 0
        ? String(recurrenceUnit || "").trim().toLowerCase()
        : "weeks";
      const normalizedRecurrenceInterval = Math.max(1, Math.round(Number(recurrenceInterval) || 1));
      const normalizedRecurrenceUntilDate = String(recurrenceUntilDate || "").slice(0, 10);

      this.id = id;
      this.title = title;
      this.startDate = normalizedStartDate;
      this.endDate = normalizedEndDate && normalizedEndDate >= normalizedStartDate
        ? normalizedEndDate
        : normalizedStartDate;
      this.startTime = startTime;
      this.endTime = endTime;
      this.category = category;
      this.description = description;
      this.priority = [1, 2, 3].indexOf(Number(priority)) >= 0 ? Number(priority) : 3;
      this.showInTimetable = Boolean(showInTimetable);
      this.causesInstructionOutage = Boolean(causesInstructionOutage);
      this.isRecurring = Boolean(isRecurring)
        && Boolean(normalizedStartDate)
        && Boolean(normalizedRecurrenceUntilDate)
        && normalizedRecurrenceUntilDate >= normalizedStartDate;
      this.recurrenceInterval = this.isRecurring ? normalizedRecurrenceInterval : 1;
      this.recurrenceUnit = this.isRecurring ? normalizedRecurrenceUnit : "weeks";
      this.recurrenceUntilDate = this.isRecurring ? normalizedRecurrenceUntilDate : "";
      this.recurrenceMonthlyWeekday = this.isRecurring && this.recurrenceUnit === "months" && Boolean(recurrenceMonthlyWeekday);
      this.isExternallyControlled = Boolean(isExternallyControlled);
      this.controlledByView = this.isExternallyControlled ? String(controlledByView || "").trim() : "";
      this.controlledById = this.isExternallyControlled ? String(controlledById || "").trim() : "";
    }
  }

class PlanningCategory {
    constructor({ id, name = "", color = "", filterLabels = [] }) {
      this.id = id;
      this.name = name;
      this.color = color;
      this.filterLabels = Array.isArray(filterLabels)
        ? filterLabels.map(function (entry) {
            return String(entry || "").trim();
          }).filter(Boolean).filter(function (entry, index, array) {
            return array.findIndex(function (candidate) {
              return String(candidate || "").trim().toLowerCase() === entry.toLowerCase();
            }) === index;
          })
        : [];
    }
  }

class PlanningInstructionLessonStatus {
  constructor({ id, classId = "", lessonDate = "", isCancelled = false, cancelReason = "" }) {
    this.id = id;
    this.classId = classId;
    this.lessonDate = String(lessonDate || "").slice(0, 10);
    this.isCancelled = Boolean(isCancelled);
    this.cancelReason = this.isCancelled ? String(cancelReason || "").trim() : "";
  }
}

class CurriculumSeries {
  constructor({ id, classId = "", topic = "", hourDemand = 0, color = "", startMode = "automatic", startDate = "", nextSeriesId = "" }) {
    this.id = id;
    this.classId = classId;
    this.topic = topic;
    this.hourDemand = Math.max(0, Number(hourDemand) || 0);
    this.color = color;
    this.startMode = startMode === "manual" ? "manual" : "automatic";
    this.startDate = this.startMode === "manual" ? String(startDate || "").trim() : "";
    this.nextSeriesId = nextSeriesId;
  }
}

class CurriculumSequence {
  constructor({ id, seriesId = "", topic = "", hourDemand = 0, nextSequenceId = "" }) {
    this.id = id;
    this.seriesId = seriesId;
    this.topic = topic;
    this.hourDemand = Math.max(0, Number(hourDemand) || 0);
    this.nextSequenceId = nextSequenceId;
  }
}

class CurriculumLessonPlan {
  constructor({
    id,
    sequenceId = "",
    topic = "",
    summary = "",
    hourType = "single",
    functionType = "",
    situationType = "",
    demandLevel = "",
    preparationMode = "",
    preparationText = "",
    preparationTodoId = "",
    homeworkText = "",
    homeworkDueMode = "",
    homeworkDueAmount = 1,
    homeworkDueUnit = "tage",
    nextLessonId = ""
  }) {
    const normalizedFunctionType = String(functionType || "").trim().toLowerCase();
    const normalizedSituationType = String(situationType || "").trim().toLowerCase();
    const normalizedDemandLevel = String(demandLevel || "").trim().toLowerCase();
    const normalizedPreparationMode = String(preparationMode || "").trim().toLowerCase();
    const normalizedHomeworkDueMode = String(homeworkDueMode || "").trim().toLowerCase();
    const normalizedHomeworkDueUnit = String(homeworkDueUnit || "").trim().toLowerCase();

    this.id = id;
    this.sequenceId = sequenceId;
    this.topic = topic;
    this.summary = String(summary || "").trim();
    this.hourType = hourType === "double" ? "double" : "single";
    this.functionType = ["erarbeiten", "vertiefen", "ueben", "wiederholen", "ueberpruefen"].indexOf(normalizedFunctionType) >= 0
      ? normalizedFunctionType
      : "";
    if (normalizedSituationType === "lernsituation") {
      this.situationType = "lernen";
    } else if (normalizedSituationType === "leistungssituation") {
      this.situationType = "leisten";
    } else {
      this.situationType = ["lernen", "leisten"].indexOf(normalizedSituationType) >= 0
        ? normalizedSituationType
        : "";
    }
    this.demandLevel = ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(normalizedDemandLevel) >= 0
      ? normalizedDemandLevel
      : "";
    this.preparationMode = ["text", "todo"].indexOf(normalizedPreparationMode) >= 0
      ? normalizedPreparationMode
      : "";
    this.preparationText = String(preparationText || "").trim();
    this.preparationTodoId = String(preparationTodoId || "").trim();
    this.homeworkText = String(homeworkText || "").trim();
    this.homeworkDueMode = ["next_available_day", "next_week", "manual"].indexOf(normalizedHomeworkDueMode) >= 0
      ? normalizedHomeworkDueMode
      : "";
    this.homeworkDueAmount = Math.max(1, Number(homeworkDueAmount) || 1);
    this.homeworkDueUnit = ["tage", "wochen", "monate"].indexOf(normalizedHomeworkDueUnit) >= 0
      ? normalizedHomeworkDueUnit
      : "tage";
    this.nextLessonId = nextLessonId;
  }
}

class CurriculumLessonPhase {
  constructor({ id, lessonPlanId = "", title = "", durationMinutes = 0, isReserve = false, situationType = "", demandLevel = "", nextPhaseId = "" }) {
    const normalizedSituationType = String(situationType || "").trim().toLowerCase();
    const normalizedDemandLevel = String(demandLevel || "").trim().toLowerCase();

    this.id = id;
    this.lessonPlanId = lessonPlanId;
    this.title = String(title || "").trim();
    this.durationMinutes = Math.max(0, Number(durationMinutes) || 0);
    this.isReserve = Boolean(isReserve);
    if (normalizedSituationType === "lernsituation") {
      this.situationType = "lernen";
    } else if (normalizedSituationType === "leistungssituation") {
      this.situationType = "leisten";
    } else {
      this.situationType = ["lernen", "leisten"].indexOf(normalizedSituationType) >= 0
        ? normalizedSituationType
        : "";
    }
    this.demandLevel = ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(normalizedDemandLevel) >= 0
      ? normalizedDemandLevel
      : "";
    this.nextPhaseId = nextPhaseId;
  }
}

class CurriculumLessonStep {
  constructor({ id, phaseId = "", title = "", content = "", durationMinutes = "", socialForm = "plenum", material = "", nextStepId = "" }) {
    const normalizedSocialForm = String(socialForm || "").trim().toLowerCase();
    const numericDuration = Number(durationMinutes);

    this.id = id;
    this.phaseId = phaseId;
    this.title = String(title || "").trim();
    this.content = String(content || "").trim();
    this.durationMinutes = durationMinutes === null || typeof durationMinutes === "undefined" || String(durationMinutes).trim() === ""
      ? ""
      : Math.max(0, Number.isFinite(numericDuration) ? numericDuration : 0);
    this.socialForm = ["einzel", "partner", "gruppe", "plenum"].indexOf(normalizedSocialForm) >= 0
      ? normalizedSocialForm
      : "plenum";
    this.material = String(material || "").trim();
    this.nextStepId = nextStepId;
  }
}

class CurriculumLessonPhaseStatus {
  constructor({ id, classId = "", lessonDate = "", lessonPlanId = "", phaseId = "", isCompleted = false, isSkipped = false, elapsedMinutes = 0, resumeStartMinutes = 0, liveSituationType = "", liveDemandLevel = "" }) {
    const normalizedSituationType = String(liveSituationType || "").trim().toLowerCase();
    const normalizedDemandLevel = String(liveDemandLevel || "").trim().toLowerCase();

    this.id = id;
    this.classId = classId;
    this.lessonDate = String(lessonDate || "").slice(0, 10);
    this.lessonPlanId = lessonPlanId;
    this.phaseId = phaseId;
    this.isCompleted = Boolean(isCompleted);
    this.isSkipped = Boolean(isSkipped);
    this.elapsedMinutes = Math.max(0, Number(elapsedMinutes) || 0);
    this.resumeStartMinutes = Math.max(0, Number(resumeStartMinutes) || 0);
    this.liveSituationType = ["lernen", "leisten"].indexOf(normalizedSituationType) >= 0
      ? normalizedSituationType
      : "";
    this.liveDemandLevel = ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].indexOf(normalizedDemandLevel) >= 0
      ? normalizedDemandLevel
      : "";
  }
}

class CurriculumLessonStepStatus {
  constructor({ id, classId = "", lessonDate = "", lessonPlanId = "", phaseId = "", stepId = "", isCompleted = false, isSkipped = false, elapsedMinutes = 0, completedAt = "" }) {
    this.id = id;
    this.classId = classId;
    this.lessonDate = String(lessonDate || "").slice(0, 10);
    this.lessonPlanId = lessonPlanId;
    this.phaseId = phaseId;
    this.stepId = stepId;
    this.isCompleted = Boolean(isCompleted);
    this.isSkipped = Boolean(isSkipped);
    this.elapsedMinutes = Math.max(0, Number(elapsedMinutes) || 0);
    this.completedAt = this.isCompleted
      ? String(completedAt || "").trim()
      : "";
  }
}

window.Unterrichtsassistent.domain.Student = Student;
window.Unterrichtsassistent.domain.SchoolClass = SchoolClass;
window.Unterrichtsassistent.domain.Lesson = Lesson;
window.Unterrichtsassistent.domain.Timetable = Timetable;
window.Unterrichtsassistent.domain.TimetableRow = TimetableRow;
window.Unterrichtsassistent.domain.Assessment = Assessment;
window.Unterrichtsassistent.domain.EvaluationSheet = EvaluationSheet;
window.Unterrichtsassistent.domain.EvidenceTool = EvidenceTool;
window.Unterrichtsassistent.domain.PlannedEvaluation = PlannedEvaluation;
window.Unterrichtsassistent.domain.PerformedEvaluation = PerformedEvaluation;
window.Unterrichtsassistent.domain.AttendanceRecord = AttendanceRecord;
window.Unterrichtsassistent.domain.HomeworkRecord = HomeworkRecord;
window.Unterrichtsassistent.domain.WarningRecord = WarningRecord;
window.Unterrichtsassistent.domain.KnowledgeGapRecord = KnowledgeGapRecord;
window.Unterrichtsassistent.domain.MathObservationRecord = MathObservationRecord;
window.Unterrichtsassistent.domain.EvidenceObservationRecord = EvidenceObservationRecord;
window.Unterrichtsassistent.domain.TodoItem = TodoItem;
window.Unterrichtsassistent.domain.SeatPlan = SeatPlan;
window.Unterrichtsassistent.domain.SeatOrder = SeatOrder;
window.Unterrichtsassistent.domain.PlanningEvent = PlanningEvent;
window.Unterrichtsassistent.domain.PlanningCategory = PlanningCategory;
window.Unterrichtsassistent.domain.PlanningInstructionLessonStatus = PlanningInstructionLessonStatus;
window.Unterrichtsassistent.domain.CurriculumSeries = CurriculumSeries;
window.Unterrichtsassistent.domain.CurriculumSequence = CurriculumSequence;
window.Unterrichtsassistent.domain.CurriculumLessonPlan = CurriculumLessonPlan;
window.Unterrichtsassistent.domain.CurriculumLessonPhase = CurriculumLessonPhase;
window.Unterrichtsassistent.domain.CurriculumLessonStep = CurriculumLessonStep;
window.Unterrichtsassistent.domain.CurriculumLessonPhaseStatus = CurriculumLessonPhaseStatus;
window.Unterrichtsassistent.domain.CurriculumLessonStepStatus = CurriculumLessonStepStatus;

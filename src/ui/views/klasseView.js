window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.ui = window.Unterrichtsassistent.ui || {};
window.Unterrichtsassistent.ui.views = window.Unterrichtsassistent.ui.views || {};

window.Unterrichtsassistent.ui.views.klasse = {
  id: "klasse",
  title: "Lerngruppe",
  getSubtitle: function (service) {
    const schoolClass = service.getActiveClass();

    if (!schoolClass) {
      return "";
    }

    return [schoolClass.name || "", schoolClass.subject || ""].join(" ").trim();
  },
  render: function (service) {
    const schoolClass = service.getActiveClass();
    const students = schoolClass ? service.getStudentsForClass(schoolClass.id) : [];
    const classViewMode = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getClassViewMode === "function"
      ? window.UnterrichtsassistentApp.getClassViewMode()
      : "analyse";
    const activeClassStudentAnalysisStudentId = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveClassStudentAnalysisStudentId === "function"
      ? String(window.UnterrichtsassistentApp.getActiveClassStudentAnalysisStudentId() || "").trim()
      : "";
    const classDisplayColor = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getClassDisplayColor === "function"
      ? window.UnterrichtsassistentApp.getClassDisplayColor(schoolClass)
      : "#d9d4cb";
    const isManageMode = classViewMode === "verwalten";
    const isStudentMode = classViewMode === "schueler";
    const isAnalysisMode = classViewMode === "analyse";
    const isBasisdatenExpanded = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isClassBasisdatenExpanded === "function"
      ? window.UnterrichtsassistentApp.isClassBasisdatenExpanded()
      : false;
    const isSozialgefuegeExpanded = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.isClassSozialgefuegeExpanded === "function"
      ? window.UnterrichtsassistentApp.isClassSozialgefuegeExpanded()
      : false;
    const socialRelationsDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveClassSocialRelationsDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveClassSocialRelationsDraft()
      : null;
    const socialImportDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveClassSocialImportDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveClassSocialImportDraft()
      : null;
    const analysisSort = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getClassAnalysisSort === "function"
      ? window.UnterrichtsassistentApp.getClassAnalysisSort()
      : { key: "name", direction: "asc" };
    const analysisEnabledTypes = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getClassAnalysisEnabledTypes === "function"
      ? window.UnterrichtsassistentApp.getClassAnalysisEnabledTypes()
      : { attendance: true, homework: true, warning: true, assessment: true, mathObservation: true, knowledgeGap: true, evidenceObservation: true, completedEvaluation: true };
    const analysisGrouping = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getClassAnalysisGrouping === "function"
      ? window.UnterrichtsassistentApp.getClassAnalysisGrouping()
      : "day";
    const analysisCriterion = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getClassAnalysisCriterion === "function"
      ? window.UnterrichtsassistentApp.getClassAnalysisCriterion()
      : "count";
    const analysisDetailDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveClassAnalysisDetailDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveClassAnalysisDetailDraft()
      : null;
    const analysisEditDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveClassAnalysisRecordEditDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveClassAnalysisRecordEditDraft()
      : null;
    const analysisPerformedEvaluationDraft = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getActiveClassAnalysisPerformedEvaluationDraft === "function"
      ? window.UnterrichtsassistentApp.getActiveClassAnalysisPerformedEvaluationDraft()
      : null;

    function escapeValue(value) {
      return String(value === undefined || value === null ? "" : value)
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

    function normalizeDateValue(value) {
      return String(value || "").slice(0, 10);
    }

    function formatDayLabel(dateValue) {
      if (!dateValue) {
        return "";
      }

      return String(dateValue).slice(8, 10) + "." + String(dateValue).slice(5, 7) + ".";
    }

    function formatTimeLabel(dateTimeValue) {
      const value = String(dateTimeValue || "");
      return value.length >= 16 ? value.slice(11, 16) : "";
    }

    function buildBasisdatenHeader() {
      return [
        '<button class="class-basisdaten__header" type="button" aria-expanded="', isBasisdatenExpanded ? 'true' : 'false', '" onclick="return window.UnterrichtsassistentApp.toggleClassBasisdaten()">',
        '<span class="class-basisdaten__title">Basisdaten</span>',
        '<span class="class-basisdaten__toggle', isBasisdatenExpanded ? ' is-expanded' : '', '" aria-hidden="true">&#9662;</span>',
        '</button>'
      ].join("");
    }

    function buildSozialgefuegeHeader() {
      return [
        '<button class="class-basisdaten__header" type="button" aria-expanded="', isSozialgefuegeExpanded ? 'true' : 'false', '" onclick="return window.UnterrichtsassistentApp.toggleClassSozialgefuege()">',
        '<span class="class-basisdaten__title">Sozialgef&uuml;ge</span>',
        '<span class="class-basisdaten__toggle', isSozialgefuegeExpanded ? ' is-expanded' : '', '" aria-hidden="true">&#9662;</span>',
        '</button>'
      ].join("");
    }

    function parseDateValue(dateValue) {
      const normalized = normalizeDateValue(dateValue);
      const parts = normalized.split("-");

      if (parts.length !== 3) {
        return null;
      }

      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }

    function formatMonthLabel(dateValue) {
      if (!dateValue) {
        return "";
      }

      return String(dateValue).slice(5, 7) + "." + String(dateValue).slice(0, 4);
    }

    function formatCriterionValue(value) {
      const numericValue = Number(value);

      if (!Number.isFinite(numericValue)) {
        return "-";
      }

      if (analysisCriterion === "count") {
        return String(Math.round(numericValue));
      }

      return Math.abs(numericValue % 1) < 0.05
        ? String(Math.round(numericValue))
        : numericValue.toFixed(1).replace(".", ",");
    }

    function getAverage(values) {
      const numericValues = values.map(function (value) {
        return Number(value);
      }).filter(function (value) {
        return Number.isFinite(value);
      });

      if (!numericValues.length) {
        return null;
      }

      return numericValues.reduce(function (sum, value) {
        return sum + value;
      }, 0) / numericValues.length;
    }

    function getIsoWeekInfo(dateValue) {
      const date = parseDateValue(dateValue);
      let target;
      let dayNumber;
      let weekYear;
      let yearStart;
      let weekNumber;
      let mondayDate;

      if (!date) {
        return null;
      }

      target = new Date(date.getTime());
      dayNumber = target.getDay() || 7;
      target.setDate(target.getDate() + 4 - dayNumber);
      weekYear = target.getFullYear();
      yearStart = new Date(weekYear, 0, 1);
      weekNumber = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
      mondayDate = new Date(date.getTime());
      mondayDate.setDate(mondayDate.getDate() - ((date.getDay() + 6) % 7));

      return {
        weekYear: weekYear,
        weekNumber: weekNumber,
        mondayKey: [
          String(mondayDate.getFullYear()).padStart(4, "0"),
          String(mondayDate.getMonth() + 1).padStart(2, "0"),
          String(mondayDate.getDate()).padStart(2, "0")
        ].join("-")
      };
    }

    function getGroupInfoForDate(dateValue) {
      const normalized = normalizeDateValue(dateValue);
      const weekInfo = getIsoWeekInfo(normalized);

      if (analysisGrouping === "total") {
        return {
          key: "gesamt",
          label: "Gesamt",
          sortKey: "9999-99-99"
        };
      }

      if (analysisGrouping === "month") {
        return {
          key: normalized.slice(0, 7),
          label: formatMonthLabel(normalized),
          sortKey: normalized.slice(0, 7)
        };
      }

      if (analysisGrouping === "week" && weekInfo) {
        return {
          key: String(weekInfo.weekYear) + "-W" + String(weekInfo.weekNumber).padStart(2, "0"),
          label: "KW " + String(weekInfo.weekNumber),
          sortKey: weekInfo.mondayKey
        };
      }

      return {
        key: normalized,
        label: formatDayLabel(normalized),
        sortKey: normalized
      };
    }

    function getAssessmentPerformanceValue(record) {
      return getAverage(["afb1", "afb2", "afb3"].map(function (key) {
        const value = record && record[key];
        return value === "" || value === undefined || value === null ? null : Number(value);
      }));
    }

    function getAssessmentWorkBehaviorValue(record) {
      const normalized = String(record && record.workBehavior || "").trim().toLowerCase();

      return {
        a: 4,
        b: 3,
        c: 2,
        d: 1
      }[normalized];
    }

    function normalizeLabel(key) {
      return {
        status: "Status",
        quality: "Qualitaet",
        category: "Kategorie",
        note: "Notiz",
        afb1: "AFB1",
        afb2: "AFB2",
        afb3: "AFB3",
        workBehavior: "AV",
        socialBehavior: "SV",
        knowledgeGap: "Wissensluecke",
        content: "Inhalt",
        primaryCompetency: "Kompetenz",
        competencyIds: "Komplex",
        processQuality: "Qualitaet",
        marker: "Marker",
        markerDirection: "Richtung",
        markerQuality: "Marker-Stufe",
        situationType: "Situation",
        demandLevel: "AFB",
        lessonPlanId: "Plan-Stunde",
        lessonPhaseId: "Phase",
        lessonStepId: "Schritt"
      }[key] || key;
    }

    function findCurriculumItemById(collectionName, itemId) {
      const normalizedId = String(itemId || "").trim();
      const items = Array.isArray(service.snapshot && service.snapshot[collectionName])
        ? service.snapshot[collectionName]
        : [];

      if (!normalizedId) {
        return null;
      }

      return items.find(function (entry) {
        return String(entry && entry.id || "").trim() === normalizedId;
      }) || null;
    }

    function formatCurriculumReferenceValue(key, value) {
      const normalizedValue = String(value || "").trim();
      let item = null;
      let label = "";

      if (!normalizedValue) {
        return "";
      }

      if (key === "lessonPlanId") {
        item = findCurriculumItemById("curriculumLessonPlans", normalizedValue);
        label = String(item && (item.topic || item.title) || "").trim();
      } else if (key === "lessonPhaseId") {
        item = findCurriculumItemById("curriculumLessonPhases", normalizedValue);
        label = String(item && item.title || "").trim();
      } else if (key === "lessonStepId") {
        item = findCurriculumItemById("curriculumLessonSteps", normalizedValue);
        label = String(item && item.title || "").trim();
      }

      return label || normalizedValue;
    }

    function formatDetailValue(key, value) {
      const normalizedValue = value === undefined || value === null ? "" : String(value).trim();

      if (!normalizedValue) {
        return "";
      }

      if (key === "status") {
        return normalizedValue === "absent" ? "abwesend" : (normalizedValue === "present" ? "anwesend" : normalizedValue);
      }

      if (key === "quality") {
        return {
          fehlt: "fehlt",
          unvollstaendig: "unvollstaendig",
          abgeschrieben: "abgeschrieben",
          vorhanden: "vorhanden",
          besondersgut: "besonders gut"
        }[normalizedValue.replace(/\s+/g, "").toLowerCase()] || normalizedValue;
      }

      if (key === "category") {
        return {
          beitrag: "Beitrag",
          ueberpruefung: "Ueberpruefung",
          praesentation: "Praesentation",
          abgabe: "Abgabe",
          stoerung: "Stoerung",
          material: "Material",
          arbeitsorganisation: "Arbeitsorganisation",
          andere: "andere"
        }[normalizedValue.toLowerCase()] || normalizedValue;
      }

      if (key === "afb1" || key === "afb2" || key === "afb3") {
        return {
          "-2": "--",
          "-1": "-",
          "0": "0",
          "1": "+",
          "2": "++"
        }[normalizedValue] || normalizedValue;
      }

      if (key === "primaryCompetency" || key === "competencyIds") {
        return normalizedValue.split(",").map(function (entry) {
          const competencyKey = String(entry || "").trim().toLowerCase();

          return {
            k1: "K1",
            k2: "K2",
            k3: "K3",
            k4: "K4",
            k5: "K5",
            k6: "K6"
          }[competencyKey] || String(entry || "").trim();
        }).filter(Boolean).join(", ");
      }

      if (key === "processQuality" || key === "markerQuality") {
        return {
          "-2": "--",
          "-1": "-",
          "0": "0",
          "1": "+",
          "2": "++"
        }[normalizedValue] || normalizedValue;
      }

      if (key === "marker") {
        return {
          frage: "Frage",
          vermutung: "Vermutung",
          begruendung_widerlegung: "Begruendung / Widerlegung",
          beitrag: "Beitrag",
          strategie: "Strategie",
          loesungsweg_praesentiert: "Loesungsweg praesentiert",
          fehlende_information: "fehlende Information",
          plausibilitaet_geprueft: "Plausibilitaet geprueft",
          darstellung: "Darstellung",
          symbolisiert_formalisiert: "symbolisiert / formalisiert",
          werkzeug_funktional: "Werkzeug funktional eingesetzt",
          modell_geprueft: "Modell gebildet / geprueft",
          anderer_beitrag: "auf anderen Beitrag eingegangen",
          fachsprache: "Fachsprache genutzt",
          fehler: "Fehler",
          vorgehen_reflektiert: "Vorgehen reflektiert"
        }[normalizedValue.toLowerCase()] || normalizedValue;
      }

      if (key === "markerDirection") {
        return {
          left: "links / reaktiv",
          right: "rechts / eigenstaendig"
        }[normalizedValue.toLowerCase()] || normalizedValue;
      }

      if (key === "situationType") {
        return {
          lernen: "Lernen",
          leisten: "Leisten"
        }[normalizedValue.toLowerCase()] || normalizedValue;
      }

      if (key === "demandLevel") {
        return normalizedValue.toUpperCase();
      }

      if (key === "lessonPlanId" || key === "lessonPhaseId" || key === "lessonStepId") {
        return formatCurriculumReferenceValue(key, normalizedValue);
      }

      return normalizedValue;
    }

    function getStudentAnalysisName(student) {
      const firstName = String(student && student.firstName || "").trim();
      const lastName = String(student && student.lastName || "").trim();
      const duplicateFirstNameCount = students.filter(function (entry) {
        return String(entry && entry.firstName || "").trim() === firstName;
      }).length;

      if (duplicateFirstNameCount > 1 && lastName) {
        return firstName + " " + lastName.charAt(0).toUpperCase() + ".";
      }

      return firstName;
    }

    function buildAnalysisDetailSummary(record) {
      const orderedKeys = ["status", "quality", "category", "content", "primaryCompetency", "competencyIds", "processQuality", "marker", "markerDirection", "markerQuality", "situationType", "demandLevel", "lessonPlanId", "lessonPhaseId", "lessonStepId", "note", "afb1", "afb2", "afb3", "workBehavior", "socialBehavior", "knowledgeGap"];

      return orderedKeys.filter(function (key) {
        const value = record[key];
        if (key === "competencyIds") {
          const competencyIds = Array.isArray(value)
            ? value
            : String(value || "").split(",");
          return competencyIds.map(function (entry) {
            return String(entry || "").trim();
          }).filter(Boolean).length > 1;
        }
        return value !== undefined && value !== null && String(value).trim() !== "";
      }).map(function (key) {
        return normalizeLabel(key) + ": " + formatDetailValue(key, record[key]);
      }).join(" | ");
    }

    function getEvidenceToolById(toolId) {
      const normalizedToolId = String(toolId || "").trim();

      return (Array.isArray(service.snapshot.evidenceTools) ? service.snapshot.evidenceTools : []).find(function (tool) {
        return String(tool && tool.id || "").trim() === normalizedToolId;
      }) || null;
    }

    function getEvidenceAspectById(tool, aspectId) {
      const normalizedAspectId = String(aspectId || "").trim();

      return (Array.isArray(tool && tool.aspekte) ? tool.aspekte : []).find(function (aspect) {
        return String(aspect && aspect.id || "").trim() === normalizedAspectId;
      }) || null;
    }

    function getEvidenceStageLabel(aspect, dimensionId, stageId) {
      const dimension = (Array.isArray(aspect && aspect.aspektDimensionen) ? aspect.aspektDimensionen : []).find(function (entry) {
        return String(entry && entry.id || "").trim() === String(dimensionId || "").trim();
      }) || null;
      const stage = (Array.isArray(dimension && dimension.stufen) ? dimension.stufen : []).find(function (entry) {
        return String(entry && entry.id || "").trim() === String(stageId || "").trim();
      }) || null;
      const dimensionLabel = String(dimension && dimension.bezeichnung || "").trim();
      const stageLabel = String(stage && stage.bezeichnung || "").trim();

      return [dimensionLabel, stageLabel].filter(Boolean).join(": ");
    }

    function buildEvidenceObservationSummary(record) {
      const tool = getEvidenceToolById(record && record.toolId);
      const toolTitle = String(tool && tool.titel || "").trim() || "Bewertungswerkzeug";
      const contextParts = [
        formatDetailValue("situationType", record && record.situationType),
        formatDetailValue("demandLevel", record && record.demandLevel)
      ].filter(Boolean);
      const selectionParts = (Array.isArray(record && record.selections) ? record.selections : []).map(function (selection) {
        const aspect = getEvidenceAspectById(tool, selection && selection.aspectId);
        const aspectTitle = String(aspect && aspect.titel || "").trim() || "Aspekt";
        const stageLabels = (Array.isArray(selection && selection.stages) ? selection.stages : []).map(function (stageRef) {
          return getEvidenceStageLabel(aspect, stageRef && stageRef.dimensionId, stageRef && stageRef.stageId);
        }).filter(Boolean);

        return stageLabels.length ? aspectTitle + " (" + stageLabels.join(", ") + ")" : aspectTitle;
      }).filter(Boolean);

      return [toolTitle, contextParts.join(" / "), selectionParts.join(" -> ")].filter(Boolean).join(" | ");
    }

    function formatPointsLabel(value) {
      const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
      const roundedValue = Math.round(numericValue * 2) / 2;

      if (Math.abs(roundedValue - Math.round(roundedValue)) < 0.001) {
        return String(Math.round(roundedValue));
      }

      return roundedValue.toFixed(1).replace(".", ",");
    }

    function getTaskSheetTasks(evaluationSheet) {
      return evaluationSheet && evaluationSheet.taskSheet && Array.isArray(evaluationSheet.taskSheet.tasks)
        ? evaluationSheet.taskSheet.tasks.filter(function (task) {
            return task && typeof task === "object";
          })
        : [];
    }

    function getSubtasksForTask(task) {
      return task && Array.isArray(task.subtasks) ? task.subtasks.filter(Boolean) : [];
    }

    function getBeValue(item) {
      return Math.max(0, Number.isFinite(Number(item && item.be)) ? Number(item.be) : 0);
    }

    function getFeedbackItems(subtaskResult, detailType) {
      const normalizedType = String(detailType || "").trim().toLowerCase();
      const sourceItems = normalizedType === "negative"
        ? (subtaskResult && Array.isArray(subtaskResult.negativeFeedback) ? subtaskResult.negativeFeedback : [])
        : (subtaskResult && Array.isArray(subtaskResult.positiveFeedback) ? subtaskResult.positiveFeedback : []);

      return sourceItems.map(function (entry) {
        return String(entry || "").trim();
      }).filter(Boolean);
    }

    function buildFeedbackSummary(items) {
      const values = Array.isArray(items) ? items.filter(Boolean) : [];

      if (!values.length) {
        return "";
      }

      if (values.length <= 2) {
        return values.join(", ");
      }

      return values.slice(0, 2).join(", ") + " +" + String(values.length - 2);
    }

    function normalizeGradingSystem(items) {
      return (Array.isArray(items) ? items : []).map(function (entry) {
        return {
          label: String(entry && entry.label || "").trim(),
          minPercent: Math.max(0, Math.min(100, Number.isFinite(Number(entry && entry.minPercent)) ? Number(entry.minPercent) : 0))
        };
      }).filter(function (entry) {
        return Boolean(entry.label);
      }).sort(function (left, right) {
        if (left.minPercent === right.minPercent) {
          return left.label.localeCompare(right.label, "de-DE");
        }

        return right.minPercent - left.minPercent;
      });
    }

    function getCompletedEvaluationStageLabel(plannedEvaluation, percentValue) {
      const normalizedPercent = Math.max(0, Number.isFinite(Number(percentValue)) ? Number(percentValue) : 0);
      const stage = normalizeGradingSystem(plannedEvaluation && plannedEvaluation.gradingSystem).find(function (entry) {
        return normalizedPercent >= entry.minPercent;
      }) || null;

      return stage ? stage.label : "";
    }

    function buildCompletedEvaluationSummary(plannedEvaluation, evaluationSheet, performedEvaluation) {
      const tasks = getTaskSheetTasks(evaluationSheet);
      const subtaskLookup = performedEvaluation && Array.isArray(performedEvaluation.subtaskResults)
        ? performedEvaluation.subtaskResults.reduce(function (lookup, entry) {
            const subtaskId = String(entry && entry.subtaskId || "").trim();

            if (subtaskId) {
              lookup[subtaskId] = entry;
            }

            return lookup;
          }, {})
        : {};
      const taskSummaries = tasks.map(function (task) {
        const subtasks = getSubtasksForTask(task);
        const achieved = subtasks.reduce(function (sum, subtask) {
          const result = subtaskLookup[String(subtask && subtask.id || "").trim()] || null;
          return sum + Math.max(0, Number(result && result.points) || 0);
        }, 0);
        const reachable = subtasks.reduce(function (sum, subtask) {
          return sum + getBeValue(subtask);
        }, 0);

        return {
          taskId: String(task && task.id || "").trim(),
          achieved: achieved,
          reachable: reachable
        };
      });
      const totalAchieved = taskSummaries.reduce(function (sum, entry) {
        return sum + entry.achieved;
      }, 0);
      const totalReachable = taskSummaries.reduce(function (sum, entry) {
        return sum + entry.reachable;
      }, 0);
      const percent = totalReachable > 0
        ? (totalAchieved / totalReachable) * 100
        : 0;

      return {
        taskSummaries: taskSummaries,
        totalAchieved: totalAchieved,
        totalReachable: totalReachable,
        percent: percent,
        stageLabel: getCompletedEvaluationStageLabel(plannedEvaluation, percent)
      };
    }

    function getAnalysisRecordCreatedAt(record) {
      return String(record && (record.recordedAt || record.effectiveAt || record.lessonDate || record.date) || "");
    }

    const allAnalysisRecords = schoolClass ? []
      .concat((service.snapshot.assessments || []).filter(function (record) {
        return record.classId === schoolClass.id;
      }).map(function (record, index) {
        return {
          studentId: record.studentId,
          date: normalizeDateValue(record.lessonDate || record.date),
          type: "assessment",
          symbol: "🔍",
          sortKey: getAnalysisRecordCreatedAt(record) + "|" + String(record.id || index).padStart(6, "0"),
          raw: record
        };
      }))
      .concat((service.snapshot.attendanceRecords || []).filter(function (record) {
        return record.classId === schoolClass.id;
      }).map(function (record, index) {
        return {
          studentId: record.studentId,
          date: normalizeDateValue(record.lessonDate),
          type: "attendance",
          symbol: "✓",
          sortKey: getAnalysisRecordCreatedAt(record) + "|" + String(record.id || index).padStart(6, "0"),
          raw: record
        };
      }))
      .concat((service.snapshot.homeworkRecords || []).filter(function (record) {
        return record.classId === schoolClass.id;
      }).map(function (record, index) {
        return {
          studentId: record.studentId,
          date: normalizeDateValue(record.lessonDate),
          type: "homework",
          symbol: "H",
          sortKey: getAnalysisRecordCreatedAt(record) + "|" + String(record.id || index).padStart(6, "0"),
          raw: record
        };
      }))
      .concat((service.snapshot.warningRecords || []).filter(function (record) {
        return record.classId === schoolClass.id;
      }).map(function (record, index) {
        return {
          studentId: record.studentId,
          date: normalizeDateValue(record.lessonDate),
          type: "warning",
          symbol: "⚠",
          sortKey: getAnalysisRecordCreatedAt(record) + "|" + String(record.id || index).padStart(6, "0"),
          raw: record
        };
      }))
      .concat((service.snapshot.knowledgeGapRecords || []).filter(function (record) {
        return record.classId === schoolClass.id;
      }).map(function (record, index) {
        return {
          studentId: record.studentId,
          date: normalizeDateValue(record.lessonDate),
          type: "knowledgeGap",
          symbol: "B",
          sortKey: getAnalysisRecordCreatedAt(record) + "|" + String(record.id || index).padStart(6, "0"),
          raw: record
        };
      }))
      .concat((service.snapshot.mathObservationRecords || []).filter(function (record) {
        return record.classId === schoolClass.id;
      }).map(function (record, index) {
        return {
          studentId: record.studentId,
          date: normalizeDateValue(record.lessonDate),
          type: "mathObservation",
          symbol: "K",
          sortKey: getAnalysisRecordCreatedAt(record) + "|" + String(record.id || index).padStart(6, "0"),
          raw: record
        };
      }))
      .concat((service.snapshot.evidenceObservations || []).filter(function (record) {
        return record.classId === schoolClass.id;
      }).map(function (record, index) {
        const tool = getEvidenceToolById(record && record.toolId);

        return {
          studentId: record.studentId,
          date: normalizeDateValue(record.lessonDate),
          type: "evidenceObservation",
          symbol: String(tool && tool.symbol || "").trim() || "E",
          sortKey: getAnalysisRecordCreatedAt(record) + "|" + String(record.id || index).padStart(6, "0"),
          raw: record
        };
      }))
      .concat((service.snapshot.performedEvaluations || []).filter(function (record) {
        return record.classId === schoolClass.id && Boolean(record.isCompleted);
      }).map(function (record, index) {
        const plannedEvaluation = (service.snapshot.plannedEvaluations || []).find(function (entry) {
          return String(entry && entry.id || "").trim() === String(record && record.plannedEvaluationId || "").trim();
        }) || null;
        const evaluationSheet = (service.snapshot.evaluationSheets || []).find(function (entry) {
          return String(entry && entry.id || "").trim() === String(record && record.evaluationSheetId || "").trim();
        }) || null;

        return {
          studentId: record.studentId,
          date: normalizeDateValue(plannedEvaluation && plannedEvaluation.date),
          type: "completedEvaluation",
          symbol: "★",
          sortKey: String(record && record.completedAt || record && record.updatedAt || record && record.createdAt || "") + "|" + String(record.id || index).padStart(6, "0"),
          raw: record,
          plannedEvaluation: plannedEvaluation,
          evaluationSheet: evaluationSheet
        };
      }))
      : [];
    const analysisRecords = allAnalysisRecords.filter(function (record) {
      return analysisEnabledTypes[String(record.type || "")] !== false;
    }).map(function (record) {
      const groupInfo = getGroupInfoForDate(record.date);
      return Object.assign({}, record, {
        groupKey: groupInfo ? groupInfo.key : "",
        groupLabel: groupInfo ? groupInfo.label : "",
        groupSortKey: groupInfo ? groupInfo.sortKey : ""
      });
    });
    const classModalAnalysisRecords = (isStudentMode ? allAnalysisRecords : analysisRecords).map(function (record) {
      const groupInfo = getGroupInfoForDate(record.date);
      return Object.assign({}, record, {
        groupKey: groupInfo ? groupInfo.key : "",
        groupLabel: groupInfo ? groupInfo.label : "",
        groupSortKey: groupInfo ? groupInfo.sortKey : ""
      });
    });

    function formatFullDateLabel(dateValue) {
      const normalized = normalizeDateValue(dateValue);

      if (!normalized) {
        return "-";
      }

      return String(normalized).slice(8, 10) + "." + String(normalized).slice(5, 7) + "." + String(normalized).slice(0, 4);
    }

    function getRecordTypeLabel(type) {
      return {
        attendance: "Anwesenheit",
        homework: "Hausaufgabe",
        warning: "Warnung",
        assessment: "Unterrichtsbewertung",
        mathObservation: "Mathe-Beobachtung",
        knowledgeGap: "Wissensluecke",
        evidenceObservation: "Evidenz",
        completedEvaluation: "Bewertung"
      }[String(type || "").trim()] || "Datensatz";
    }

    function getRecordContextLabel(record) {
      const raw = record && record.raw || {};
      const parts = [
        formatDetailValue("situationType", raw.situationType),
        formatDetailValue("demandLevel", raw.demandLevel),
        raw.lessonPlanId ? formatDetailValue("lessonPlanId", raw.lessonPlanId) : "",
        raw.lessonPhaseId ? formatDetailValue("lessonPhaseId", raw.lessonPhaseId) : "",
        raw.lessonStepId ? formatDetailValue("lessonStepId", raw.lessonStepId) : ""
      ].filter(Boolean);

      return parts.join(" / ");
    }

    function getCompletedEvaluationPercent(record) {
      const summary = record && String(record.evaluationSheet && record.evaluationSheet.type || "").trim() === "aufgabenbogen"
        ? buildCompletedEvaluationSummary(record.plannedEvaluation, record.evaluationSheet, record.raw)
        : null;

      return summary && summary.totalReachable > 0 ? summary.percent : null;
    }

    function getStudentRecordSummary(record) {
      const isCompletedEvaluation = String(record && record.type || "") === "completedEvaluation";
      const isEvidenceObservation = String(record && record.type || "") === "evidenceObservation";
      const completedSummary = isCompletedEvaluation
        ? buildCompletedEvaluationSummary(record.plannedEvaluation, record.evaluationSheet, record.raw)
        : null;

      if (isCompletedEvaluation && String(record.evaluationSheet && record.evaluationSheet.type || "").trim() === "kompetenzraster") {
        const results = Array.isArray(record.raw && record.raw.competencyResults) ? record.raw.competencyResults : [];
        return [
          String(record.evaluationSheet && record.evaluationSheet.title || "").trim() || "Kompetenzraster",
          results.length ? String(results.length) + " Teilkompetenzen" : "",
          String(record.raw && record.raw.overallNote || "").trim()
        ].filter(Boolean).join(" | ");
      }

      if (isCompletedEvaluation) {
        return [
          String(record.evaluationSheet && record.evaluationSheet.title || "").trim() || "Bewertung",
          completedSummary ? formatPointsLabel(completedSummary.totalAchieved) + " / " + formatPointsLabel(completedSummary.totalReachable) : "",
          completedSummary && completedSummary.stageLabel ? completedSummary.stageLabel : "",
          String(record.raw && record.raw.overallNote || "").trim()
        ].filter(Boolean).join(" | ");
      }

      return isEvidenceObservation
        ? buildEvidenceObservationSummary(record.raw || {})
        : (buildAnalysisDetailSummary(record.raw || {}) || "-");
    }

    function getAverageNumber(values) {
      const numericValues = values.filter(function (value) {
        return Number.isFinite(Number(value));
      }).map(Number);

      return numericValues.length
        ? numericValues.reduce(function (sum, value) { return sum + value; }, 0) / numericValues.length
        : null;
    }

    function formatStudentAnalysisNumber(value) {
      const numericValue = Number(value);

      if (!Number.isFinite(numericValue)) {
        return "-";
      }

      return Math.abs(numericValue % 1) < 0.05
        ? String(Math.round(numericValue))
        : numericValue.toFixed(1).replace(".", ",");
    }

    function getStudentAnalysisSourceCounts(records) {
      return records.reduce(function (lookup, record) {
        const key = String(record && record.type || "").trim();

        if (key) {
          lookup[key] = (lookup[key] || 0) + 1;
        }

        return lookup;
      }, {});
    }

    function getStudentAnalysisEvidenceDayCount(records) {
      return Object.keys(records.reduce(function (lookup, record) {
        const dateKey = normalizeDateValue(record && record.date);

        if (dateKey && ["assessment", "mathObservation", "evidenceObservation", "completedEvaluation"].indexOf(String(record && record.type || "")) >= 0) {
          lookup[dateKey] = true;
        }

        return lookup;
      }, {})).length;
    }

    function getStudentAnalysisObservationContexts(records) {
      return records.reduce(function (lookup, record) {
        const raw = record && record.raw || {};
        const situation = String(raw.situationType || "").trim();
        const demandLevel = String(raw.demandLevel || "").trim();

        if (situation) {
          lookup.situation[situation] = (lookup.situation[situation] || 0) + 1;
        }

        if (demandLevel) {
          lookup.demandLevel[demandLevel] = (lookup.demandLevel[demandLevel] || 0) + 1;
        }

        return lookup;
      }, { situation: {}, demandLevel: {} });
    }

    function buildStudentAnalysisMetricCard(label, value, detail) {
      return [
        '<div class="student-analysis-card">',
        '<span class="student-analysis-card__label">', escapeValue(label), '</span>',
        '<strong class="student-analysis-card__value">', escapeValue(value), '</strong>',
        detail ? '<span class="student-analysis-card__detail">' + escapeValue(detail) + '</span>' : '',
        '</div>'
      ].join("");
    }

    function buildStudentAnalysisSourceBar(sourceCounts, totalRecords) {
      const sourceOrder = ["completedEvaluation", "assessment", "mathObservation", "evidenceObservation", "knowledgeGap", "homework", "attendance", "warning"];
      const total = Math.max(1, Number(totalRecords) || 0);

      return [
        '<div class="student-analysis-sourcebar">',
        sourceOrder.filter(function (key) {
          return Number(sourceCounts[key] || 0) > 0;
        }).map(function (key) {
          const count = Number(sourceCounts[key] || 0);
          return [
            '<div class="student-analysis-sourcebar__item student-analysis-sourcebar__item--', escapeValue(key), '" style="--source-share:', escapeValue(String(Math.max(6, Math.round((count / total) * 100)))), '%">',
            '<span>', escapeValue(getRecordTypeLabel(key)), '</span>',
            '<strong>', escapeValue(String(count)), '</strong>',
            '</div>'
          ].join("");
        }).join("") || '<div class="student-analysis-sourcebar__empty">Noch keine Datensaetze</div>',
        '</div>'
      ].join("");
    }

    function buildStudentAnalysisContextList(contexts) {
      const situationItems = [
        ["lernen", "Lernen"],
        ["leisten", "Leisten"]
      ].map(function (entry) {
        return '<span><strong>' + escapeValue(String(contexts.situation[entry[0]] || 0)) + '</strong> ' + escapeValue(entry[1]) + '</span>';
      }).join("");
      const demandItems = ["afb1", "afb1/2", "afb2", "afb2/3", "afb3"].map(function (key) {
        return '<span><strong>' + escapeValue(String(contexts.demandLevel[key] || 0)) + '</strong> ' + escapeValue(formatDetailValue("demandLevel", key)) + '</span>';
      }).join("");

      return '<div class="student-analysis-context-list">' + situationItems + demandItems + '</div>';
    }

    function buildStudentAnalysisSelector(selectedStudent) {
      return [
        '<aside class="student-analysis-selector" aria-label="Schueler auswaehlen">',
        '<div class="student-analysis-selector__title">Schueler</div>',
        students.map(function (student) {
          const isSelected = selectedStudent && String(selectedStudent.id || "") === String(student && student.id || "");

          return [
            '<button class="student-analysis-selector__item', isSelected ? ' is-active' : '', '" type="button" onclick="return window.UnterrichtsassistentApp.selectClassStudentAnalysisStudent(\'', escapeValue(student.id), '\')">',
            '<span>', escapeValue(getStudentFullName(student) || getStudentAnalysisName(student)), '</span>',
            '</button>'
          ].join("");
        }).join("") || '<div class="student-analysis-selector__empty">Keine Schuelerdaten</div>',
        '</aside>'
      ].join("");
    }

    function buildStudentAnalysisCompetencies(records) {
      const mathLabels = {
        k1: "K1 Argumentieren",
        k2: "K2 Probleme loesen",
        k3: "K3 Modellieren",
        k4: "K4 Darstellungen",
        k5: "K5 Formalisieren",
        k6: "K6 Kommunizieren"
      };
      const mathStats = {};
      const evidenceItems = [];
      const gridItems = [];

      records.forEach(function (record) {
        const raw = record && record.raw || {};

        if (record.type === "mathObservation") {
          (Array.isArray(raw.competencyIds) ? raw.competencyIds : [raw.primaryCompetency]).forEach(function (competencyId) {
            const key = String(competencyId || "").trim().toLowerCase();
            if (!key) {
              return;
            }
            if (!mathStats[key]) {
              mathStats[key] = { count: 0, qualities: [], latest: "" };
            }
            mathStats[key].count += 1;
            mathStats[key].qualities.push(Number(raw.processQuality));
            mathStats[key].latest = record.date > mathStats[key].latest ? record.date : mathStats[key].latest;
          });
        } else if (record.type === "evidenceObservation") {
          (Array.isArray(raw.selections) ? raw.selections : []).forEach(function (selection) {
            const tool = getEvidenceToolById(raw.toolId);
            const aspect = getEvidenceAspectById(tool, selection && selection.aspectId);
            const stageLabels = (Array.isArray(selection && selection.stages) ? selection.stages : []).map(function (stageRef) {
              return getEvidenceStageLabel(aspect, stageRef && stageRef.dimensionId, stageRef && stageRef.stageId);
            }).filter(Boolean);

            evidenceItems.push({
              title: [String(tool && tool.titel || "").trim(), String(aspect && aspect.titel || "").trim()].filter(Boolean).join(" / ") || "Evidenz",
              value: stageLabels.join(", ") || "beobachtet",
              date: record.date
            });
          });
        } else if (record.type === "completedEvaluation" && String(record.evaluationSheet && record.evaluationSheet.type || "").trim() === "kompetenzraster") {
          const grid = record.evaluationSheet && record.evaluationSheet.competencyGrid || {};
          const rows = Array.isArray(grid.rows) ? grid.rows : [];
          const columns = Array.isArray(grid.columns) ? grid.columns : [];

          (Array.isArray(raw.competencyResults) ? raw.competencyResults : []).forEach(function (result) {
            const row = rows.find(function (entry) { return String(entry && entry.id || "") === String(result && result.rowId || ""); }) || null;
            const column = columns.find(function (entry) { return String(entry && entry.id || "") === String(result && result.columnId || ""); }) || null;

            gridItems.push({
              title: String(row && row.title || "").trim() || "Teilkompetenz",
              value: String(column && column.title || "").trim() || "Niveau gesetzt",
              nextStep: String(result && result.nextStep || "").trim(),
              date: record.date
            });
          });
        }
      });

      const mathRows = Object.keys(mathLabels).map(function (key) {
        const stat = mathStats[key] || { count: 0, qualities: [] };
        const average = getAverageNumber(stat.qualities);
        return [
          '<div class="student-analysis-competency-row">',
          '<span>', escapeValue(mathLabels[key]), '</span>',
          '<strong>', escapeValue(stat.count ? formatStudentAnalysisNumber(average) : "-"), '</strong>',
          '<em>', escapeValue(stat.count ? String(stat.count) + "x" : "keine Evidenz"), '</em>',
          '</div>'
        ].join("");
      }).join("");
      const evidenceRows = evidenceItems.slice().sort(function (left, right) {
        return String(right.date || "").localeCompare(String(left.date || ""));
      }).slice(0, 6).map(function (item) {
        return '<li><strong>' + escapeValue(item.title) + '</strong><span>' + escapeValue(item.value) + '</span></li>';
      }).join("");
      const gridRows = gridItems.slice().sort(function (left, right) {
        return String(right.date || "").localeCompare(String(left.date || ""));
      }).slice(0, 6).map(function (item) {
        return '<li><strong>' + escapeValue(item.title) + '</strong><span>' + escapeValue(item.value) + (item.nextStep ? " -> " + item.nextStep : "") + '</span></li>';
      }).join("");

      return [
        '<section class="student-analysis-section student-analysis-section--competencies">',
        '<h3>Kompetenzprofil</h3>',
        '<div class="student-analysis-competency-grid">',
        '<div class="student-analysis-competency-card"><h4>Mathematische Kompetenzen</h4>', mathRows, '</div>',
        '<div class="student-analysis-competency-card"><h4>Evidenz-Werkzeuge</h4><ul>', evidenceRows || '<li><span>Keine Evidenzen erfasst.</span></li>', '</ul></div>',
        '<div class="student-analysis-competency-card"><h4>Kompetenzraster</h4><ul>', gridRows || '<li><span>Keine Raster-Eintraege erfasst.</span></li>', '</ul></div>',
        '</div>',
        '</section>'
      ].join("");
    }

    function buildStudentAnalysisGapsAndSteps(records) {
      const knowledgeGaps = records.filter(function (record) {
        return record.type === "knowledgeGap" || (record.type === "assessment" && String(record.raw && record.raw.knowledgeGap || "").trim());
      }).map(function (record) {
        const raw = record.raw || {};
        return {
          content: String(raw.content || raw.knowledgeGap || "").trim(),
          status: String(raw.status || (record.type === "assessment" ? "offen" : "")).trim() || "offen",
          note: String(raw.note || "").trim(),
          date: record.date
        };
      }).filter(function (item) {
        return Boolean(item.content);
      }).sort(function (left, right) {
        return String(right.date || "").localeCompare(String(left.date || ""));
      });
      const nextSteps = [];

      records.forEach(function (record) {
        if (record.type !== "completedEvaluation") {
          return;
        }

        (Array.isArray(record.raw && record.raw.competencyResults) ? record.raw.competencyResults : []).forEach(function (result) {
          const nextStep = String(result && result.nextStep || "").trim();
          if (nextStep) {
            nextSteps.push({ text: nextStep, date: record.date });
          }
        });
      });

      return [
        '<section class="student-analysis-section student-analysis-section--gaps">',
        '<h3>Wissensluecken und naechste Schritte</h3>',
        '<div class="student-analysis-two-column">',
        '<div><h4>Offene Inhalte</h4><ul class="student-analysis-list">',
        knowledgeGaps.slice(0, 7).map(function (gap) {
          return '<li><strong>' + escapeValue(gap.content) + '</strong><span>' + escapeValue([formatDetailValue("status", gap.status), formatFullDateLabel(gap.date), gap.note].filter(Boolean).join(" | ")) + '</span></li>';
        }).join("") || '<li><span>Keine Wissensluecken erfasst.</span></li>',
        '</ul></div>',
        '<div><h4>Naechste Schritte</h4><ul class="student-analysis-list">',
        nextSteps.slice(0, 7).map(function (step) {
          return '<li><strong>' + escapeValue(step.text) + '</strong><span>' + escapeValue(formatFullDateLabel(step.date)) + '</span></li>';
        }).join("") || '<li><span>Keine konkreten naechsten Schritte erfasst.</span></li>',
        '</ul></div>',
        '</div>',
        '</section>'
      ].join("");
    }

    function buildStudentAnalysisPerformance(records) {
      const completedPercents = records.map(getCompletedEvaluationPercent).filter(function (value) {
        return Number.isFinite(Number(value));
      });
      const assessments = records.filter(function (record) {
        return record.type === "assessment";
      }).map(function (record) {
        return getAssessmentPerformanceValue(record.raw || {});
      }).filter(function (value) {
        return Number.isFinite(Number(value));
      });
      const workBehavior = records.filter(function (record) {
        return record.type === "assessment";
      }).map(function (record) {
        return getAssessmentWorkBehaviorValue(record.raw || {});
      }).filter(function (value) {
        return Number.isFinite(Number(value));
      });
      const contexts = getStudentAnalysisObservationContexts(records);

      return [
        '<section class="student-analysis-section student-analysis-section--performance">',
        '<h3>Leistung nach Kontext</h3>',
        '<div class="student-analysis-performance-grid">',
        buildStudentAnalysisMetricCard("Bewertungen", completedPercents.length ? Math.round(getAverageNumber(completedPercents)) + " %" : "-", completedPercents.length ? String(completedPercents.length) + " abgeschlossene Bewertungen" : "keine abgeschlossenen Punktewerte"),
        buildStudentAnalysisMetricCard("Unterrichtsleistung", assessments.length ? formatStudentAnalysisNumber(getAverageNumber(assessments)) : "-", assessments.length ? "AFB-Raster aus " + String(assessments.length) + " Eintraegen" : "keine Unterrichtsbewertungen"),
        buildStudentAnalysisMetricCard("Arbeitsverhalten", workBehavior.length ? formatStudentAnalysisNumber(getAverageNumber(workBehavior)) : "-", workBehavior.length ? "A=4 bis D=1" : "keine AV-Daten"),
        '<div class="student-analysis-card student-analysis-card--wide"><span class="student-analysis-card__label">Beobachtungskontext</span>', buildStudentAnalysisContextList(contexts), '</div>',
        '</div>',
        '</section>'
      ].join("");
    }

    function buildStudentAnalysisTimeline(records) {
      const sortedRecords = records.slice().sort(function (left, right) {
        return String(right.sortKey || right.date || "").localeCompare(String(left.sortKey || left.date || ""));
      }).slice(0, 14);

      return [
        '<section class="student-analysis-section student-analysis-section--timeline">',
        '<h3>Timeline</h3>',
        '<div class="student-analysis-timeline">',
        sortedRecords.map(function (record) {
          const context = getRecordContextLabel(record);
          return [
            '<button class="student-analysis-timeline__item" type="button" onclick="return window.UnterrichtsassistentApp.openClassAnalysisDetail(\'', escapeValue(record.studentId), '\', \'', escapeValue(getGroupInfoForDate(record.date).key), '\', \'', escapeValue(formatFullDateLabel(record.date)), '\')">',
            '<span class="student-analysis-timeline__date">', escapeValue(formatFullDateLabel(record.date)), '</span>',
            '<strong>', escapeValue(getRecordTypeLabel(record.type)), '</strong>',
            '<span>', escapeValue(getStudentRecordSummary(record)), '</span>',
            context ? '<em>' + escapeValue(context) + '</em>' : '',
            '</button>'
          ].join("");
        }).join("") || '<div class="student-analysis-timeline__empty">Noch keine Datensaetze fuer diesen Schueler.</div>',
        '</div>',
        '</section>'
      ].join("");
    }

    function buildStudentAnalysisView() {
      const selectedStudent = students.find(function (student) {
        return String(student && student.id || "") === activeClassStudentAnalysisStudentId;
      }) || students[0] || null;
      const records = selectedStudent
        ? allAnalysisRecords.filter(function (record) {
            return String(record && record.studentId || "") === String(selectedStudent.id || "");
          })
        : [];
      const sourceCounts = getStudentAnalysisSourceCounts(records);
      const evidenceDayCount = getStudentAnalysisEvidenceDayCount(records);
      const latestRecord = records.slice().sort(function (left, right) {
        return String(right.sortKey || right.date || "").localeCompare(String(left.sortKey || left.date || ""));
      })[0] || null;
      const openGapCount = records.filter(function (record) {
        return record.type === "knowledgeGap" && String(record.raw && record.raw.status || "offen") !== "geschlossen";
      }).length;
      const homeworkIssueCount = records.filter(function (record) {
        const quality = String(record.raw && record.raw.quality || "").trim();
        return record.type === "homework" && ["fehlt", "unvollstaendig", "abgeschrieben"].indexOf(quality) >= 0 && !record.raw.ignored;
      }).length;
      const absentCount = records.filter(function (record) {
        return record.type === "attendance" && String(record.raw && record.raw.status || "") === "absent";
      }).length;

      return [
        '<div class="student-analysis-layout">',
        buildStudentAnalysisSelector(selectedStudent),
        '<div class="student-analysis-main">',
        selectedStudent ? [
          '<section class="student-analysis-hero">',
          '<div>',
          '<div class="student-analysis-hero__kicker">Lerngruppe &gt; Schueler</div>',
          '<h2>', escapeValue(getStudentFullName(selectedStudent) || getStudentAnalysisName(selectedStudent)), '</h2>',
          '<p>', escapeValue([schoolClass && schoolClass.name, schoolClass && schoolClass.subject].filter(Boolean).join(" | ")), '</p>',
          '</div>',
          '<div class="student-analysis-hero__cards">',
          buildStudentAnalysisMetricCard("Datenlage", String(evidenceDayCount), "Evidenztage"),
          buildStudentAnalysisMetricCard("Datensaetze", String(records.length), latestRecord ? "zuletzt " + formatFullDateLabel(latestRecord.date) : "noch keine Daten"),
          buildStudentAnalysisMetricCard("Offene Luecken", String(openGapCount), "Wissensluecken"),
          buildStudentAnalysisMetricCard("Kontextsignale", String(homeworkIssueCount + absentCount), "HA/Abwesenheit"),
          '</div>',
          '</section>',
          buildStudentAnalysisSourceBar(sourceCounts, records.length),
          buildStudentAnalysisPerformance(records),
          buildStudentAnalysisCompetencies(records),
          buildStudentAnalysisGapsAndSteps(records),
          buildStudentAnalysisTimeline(records)
        ].join("") : '<p class="empty-message">Noch keine Schuelerdaten in dieser Lerngruppe.</p>',
        '</div>',
        '</div>'
      ].join("");
    }
    const analysisGroups = Array.from(new Map(analysisRecords.filter(function (record) {
      return Boolean(record.groupKey);
    }).map(function (record) {
      return [record.groupKey, {
        key: record.groupKey,
        label: record.groupLabel,
        sortKey: record.groupSortKey
      }];
    })).values()).sort(function (leftGroup, rightGroup) {
      return String(rightGroup.sortKey || "").localeCompare(String(leftGroup.sortKey || ""));
    });
    const visibleAnalysisGroups = analysisGrouping === "total" && !analysisGroups.length
      ? [{ key: "gesamt", label: "Gesamt", sortKey: "9999-99-99" }]
      : analysisGroups;
    const analysisEmptyColumnCount = Math.max(0, 8 - visibleAnalysisGroups.length);
    const analysisCountsByStudentDate = {};
    const analysisTypeCountsByStudentDate = {};
    const analysisCriterionValueByStudentGroup = {};
    const assessmentCriterionDayBuckets = {};
    const assessmentCriterionDayAverages = {};
    const assessmentCriterionWeekAverages = {};
    const assessmentCriterionMonthAverages = {};
    const assessmentCriterionTotalAverages = {};

    analysisRecords.forEach(function (record) {
      const studentId = String(record.studentId || "");
      const dateKey = String(record.groupKey || "");
      const typeKey = String(record.type || "");

      if (!studentId || !dateKey) {
        return;
      }

      analysisCountsByStudentDate[studentId + "|" + dateKey] = (analysisCountsByStudentDate[studentId + "|" + dateKey] || 0) + 1;

      if (!analysisTypeCountsByStudentDate[studentId + "|" + dateKey]) {
        analysisTypeCountsByStudentDate[studentId + "|" + dateKey] = {
          attendance: 0,
          homework: 0,
          warning: 0,
          assessment: 0,
          mathObservation: 0,
          knowledgeGap: 0,
          evidenceObservation: 0,
          completedEvaluation: 0
        };
      }

      if (analysisTypeCountsByStudentDate[studentId + "|" + dateKey][typeKey] !== undefined) {
        analysisTypeCountsByStudentDate[studentId + "|" + dateKey][typeKey] += 1;
      }
    });

    if (analysisCriterion !== "count") {
      analysisRecords.filter(function (record) {
        return record.type === "assessment";
      }).forEach(function (record) {
        const studentId = String(record.studentId || "");
        const dayKey = normalizeDateValue(record.date);
        let value = null;

        if (!studentId || !dayKey) {
          return;
        }

        if (analysisCriterion === "performance") {
          value = getAssessmentPerformanceValue(record.raw || {});
        } else if (analysisCriterion === "workBehavior") {
          value = getAssessmentWorkBehaviorValue(record.raw || {});
        }

        if (!Number.isFinite(value)) {
          return;
        }

        if (!assessmentCriterionDayBuckets[studentId + "|" + dayKey]) {
          assessmentCriterionDayBuckets[studentId + "|" + dayKey] = [];
        }

        assessmentCriterionDayBuckets[studentId + "|" + dayKey].push(value);
      });

      Object.keys(assessmentCriterionDayBuckets).forEach(function (bucketKey) {
        assessmentCriterionDayAverages[bucketKey] = getAverage(assessmentCriterionDayBuckets[bucketKey]);
      });

      (function () {
        const weekBuckets = {};

        Object.keys(assessmentCriterionDayAverages).forEach(function (dayEntryKey) {
          const separatorIndex = dayEntryKey.indexOf("|");
          const studentId = separatorIndex >= 0 ? dayEntryKey.slice(0, separatorIndex) : "";
          const dayKey = separatorIndex >= 0 ? dayEntryKey.slice(separatorIndex + 1) : "";
          const weekInfo = getIsoWeekInfo(dayKey);
          const averageValue = assessmentCriterionDayAverages[dayEntryKey];
          const weekKey = weekInfo
            ? String(weekInfo.weekYear) + "-W" + String(weekInfo.weekNumber).padStart(2, "0")
            : "";

          if (!studentId || !weekKey || !Number.isFinite(averageValue)) {
            return;
          }

          if (!weekBuckets[studentId + "|" + weekKey]) {
            weekBuckets[studentId + "|" + weekKey] = [];
          }

          weekBuckets[studentId + "|" + weekKey].push(averageValue);
        });

        Object.keys(weekBuckets).forEach(function (weekEntryKey) {
          assessmentCriterionWeekAverages[weekEntryKey] = getAverage(weekBuckets[weekEntryKey]);
        });
      }());

      (function () {
        const monthWeekRefs = {};

        Object.keys(assessmentCriterionDayAverages).forEach(function (dayEntryKey) {
          const separatorIndex = dayEntryKey.indexOf("|");
          const studentId = separatorIndex >= 0 ? dayEntryKey.slice(0, separatorIndex) : "";
          const dayKey = separatorIndex >= 0 ? dayEntryKey.slice(separatorIndex + 1) : "";
          const weekInfo = getIsoWeekInfo(dayKey);
          const weekKey = weekInfo
            ? String(weekInfo.weekYear) + "-W" + String(weekInfo.weekNumber).padStart(2, "0")
            : "";
          const monthKey = dayKey.slice(0, 7);

          if (!studentId || !monthKey || !weekKey) {
            return;
          }

          if (!monthWeekRefs[studentId + "|" + monthKey]) {
            monthWeekRefs[studentId + "|" + monthKey] = {};
          }

          monthWeekRefs[studentId + "|" + monthKey][weekKey] = true;
        });

        Object.keys(monthWeekRefs).forEach(function (monthEntryKey) {
          const separatorIndex = monthEntryKey.indexOf("|");
          const studentId = separatorIndex >= 0 ? monthEntryKey.slice(0, separatorIndex) : "";
          const weekKeys = Object.keys(monthWeekRefs[monthEntryKey] || {});
          const values = weekKeys.map(function (weekKey) {
            return assessmentCriterionWeekAverages[studentId + "|" + weekKey];
          }).filter(function (value) {
            return Number.isFinite(value);
          });

          assessmentCriterionMonthAverages[monthEntryKey] = getAverage(values);
        });
      }());

      (function () {
        const studentMonthRefs = {};

        Object.keys(assessmentCriterionMonthAverages).forEach(function (monthEntryKey) {
          const separatorIndex = monthEntryKey.indexOf("|");
          const studentId = separatorIndex >= 0 ? monthEntryKey.slice(0, separatorIndex) : "";

          if (!studentId) {
            return;
          }

          if (!studentMonthRefs[studentId]) {
            studentMonthRefs[studentId] = [];
          }

          studentMonthRefs[studentId].push(assessmentCriterionMonthAverages[monthEntryKey]);
        });

        Object.keys(studentMonthRefs).forEach(function (studentId) {
          assessmentCriterionTotalAverages[studentId + "|gesamt"] = getAverage(studentMonthRefs[studentId]);
        });
      }());

      if (analysisGrouping === "day") {
        Object.keys(assessmentCriterionDayAverages).forEach(function (entryKey) {
          analysisCriterionValueByStudentGroup[entryKey] = assessmentCriterionDayAverages[entryKey];
        });
      } else if (analysisGrouping === "week") {
        Object.keys(assessmentCriterionWeekAverages).forEach(function (entryKey) {
          analysisCriterionValueByStudentGroup[entryKey] = assessmentCriterionWeekAverages[entryKey];
        });
      } else if (analysisGrouping === "month") {
        Object.keys(assessmentCriterionMonthAverages).forEach(function (entryKey) {
          analysisCriterionValueByStudentGroup[entryKey] = assessmentCriterionMonthAverages[entryKey];
        });
      } else if (analysisGrouping === "total") {
        Object.keys(assessmentCriterionTotalAverages).forEach(function (entryKey) {
          analysisCriterionValueByStudentGroup[entryKey] = assessmentCriterionTotalAverages[entryKey];
        });
      }
    }

    function getSortArrow(sortKey) {
      if (!analysisSort || analysisSort.key !== sortKey) {
        return "";
      }

      return analysisSort.direction === "desc" ? " ↓" : " ↑";
    }

    function buildAnalysisCell(studentId, groupInfo) {
      const count = analysisCountsByStudentDate[studentId + "|" + groupInfo.key] || 0;
      const criterionValue = analysisCriterion === "count"
        ? count
        : analysisCriterionValueByStudentGroup[studentId + "|" + groupInfo.key];
      const criterionDisplayValue = analysisCriterion === "count"
        ? String(count)
        : formatCriterionValue(criterionValue);
      const typeCounts = analysisTypeCountsByStudentDate[studentId + "|" + groupInfo.key] || {};
      const typeItems = [
        { key: "mathObservation", symbol: "K" },
        { key: "knowledgeGap", symbol: "B" },
        { key: "evidenceObservation", symbol: "E" },
        { key: "attendance", symbol: "✓" },
        { key: "homework", symbol: "H" },
        { key: "warning", symbol: "⚠" },
        { key: "assessment", symbol: "🔍" },
        { key: "completedEvaluation", symbol: "★" }
      ].filter(function (entry) {
        return Number(typeCounts[entry.key] || 0) > 0;
      }).sort(function (leftEntry, rightEntry) {
        const difference = Number(typeCounts[rightEntry.key] || 0) - Number(typeCounts[leftEntry.key] || 0);

        if (difference !== 0) {
          return difference;
        }

        return 0;
      }).map(function (entry) {
        return '<span class="student-table__record-type student-table__record-type--' + entry.key + '"><span class="student-table__record-symbol">' + entry.symbol + "</span></span>";
      }).join("");

      if (!count) {
        return '<td class="student-table__date-cell student-table__date-cell--interactive" onclick="return window.UnterrichtsassistentApp.openClassAnalysisDetail(\'' + escapeValue(studentId) + '\', \'' + escapeValue(groupInfo.key) + '\', \'' + escapeValue(groupInfo.label) + '\')"></td>';
      }

      return [
        '<td class="student-table__date-cell student-table__date-cell--interactive" onclick="return window.UnterrichtsassistentApp.openClassAnalysisDetail(\'', escapeValue(studentId), '\', \'', escapeValue(groupInfo.key), '\', \'', escapeValue(groupInfo.label), '\')">',
        '<div class="student-table__record-cell">',
        '<span class="student-table__record-total">', escapeValue(criterionDisplayValue), '</span>',
        '<span class="student-table__record-breakdown">', typeItems, '</span>',
        '</div>',
        "</td>"
      ].join("");
    }

    const analysisDetailStudent = analysisDetailDraft && schoolClass
      ? students.find(function (student) {
        return student.id === analysisDetailDraft.studentId;
      }) || null
      : null;
    const analysisDetailRecords = analysisDetailDraft && analysisDetailStudent
      ? classModalAnalysisRecords.filter(function (record) {
        return record.studentId === analysisDetailDraft.studentId
          && String(record.groupKey || "") === String(analysisDetailDraft.groupKey || "");
      }).sort(function (leftRecord, rightRecord) {
        return String(rightRecord.sortKey || "").localeCompare(String(leftRecord.sortKey || ""));
      })
      : [];
    const analysisDetailRows = analysisDetailRecords.map(function (record) {
      const isCompletedEvaluation = String(record.type || "") === "completedEvaluation";
      const isEvidenceObservation = String(record.type || "") === "evidenceObservation";
      const completedSummary = isCompletedEvaluation
        ? buildCompletedEvaluationSummary(record.plannedEvaluation, record.evaluationSheet, record.raw)
        : null;
      const summaryText = isCompletedEvaluation
        ? [
            String(record.evaluationSheet && record.evaluationSheet.title || "").trim() || "Bewertung",
            completedSummary ? formatPointsLabel(completedSummary.totalAchieved) + " / " + formatPointsLabel(completedSummary.totalReachable) : "",
            completedSummary && completedSummary.stageLabel ? completedSummary.stageLabel : ""
          ].filter(Boolean).join(" | ")
        : (isEvidenceObservation
          ? buildEvidenceObservationSummary(record.raw || {})
          : (buildAnalysisDetailSummary(record.raw || {}) || "-"));

      return [
        '<tr class="class-analysis-detail__row" onclick="return window.UnterrichtsassistentApp.', isCompletedEvaluation ? 'openClassAnalysisPerformedEvaluation(\'' + escapeValue(record.plannedEvaluation && record.plannedEvaluation.id || "") + '\', \'' + escapeValue(record.studentId || "") + '\')' : 'openClassAnalysisRecordEdit(\'' + escapeValue(record.type) + '\', \'' + escapeValue(record.raw && record.raw.id || "") + '\')', '">',
        '<td class="class-analysis-detail__type-cell">', escapeValue(record.symbol), "</td>",
        '<td class="class-analysis-detail__summary-cell">', escapeValue(summaryText), "</td>",
        '<td class="class-analysis-detail__action-cell">', isCompletedEvaluation ? '<span class="class-analysis-detail__action-placeholder">&#8599;</span>' : '<button class="row-delete-button row-delete-button--small" type="button" onclick="event.stopPropagation(); return window.UnterrichtsassistentApp.deleteClassAnalysisRecord(\'' + escapeValue(record.type) + '\', \'' + escapeValue(record.raw && record.raw.id || "") + '\')">Loeschen</button>', '</td>',
        "</tr>"
      ].join("");
    }).join("");
    const analysisEditRecord = analysisEditDraft ? classModalAnalysisRecords.find(function (record) {
      return record.type === analysisEditDraft.recordType && String(record.raw && record.raw.id || "") === analysisEditDraft.recordId;
    }) || null : null;
    const analysisEditStudent = analysisEditRecord
      ? students.find(function (student) {
        return student.id === analysisEditRecord.studentId;
      }) || null
      : null;
    const socialRelationColumns = [
      { key: "likesWith", label: "mag mit" },
      { key: "dislikesWith", label: "mag nicht mit" },
      { key: "shouldWith", label: "soll mit" },
      { key: "shouldNotWith", label: "soll nicht mit" }
    ];
    const firstNameCounts = students.reduce(function (counts, student) {
      const firstName = String(student && student.firstName || "").trim().toLocaleLowerCase();

      if (firstName) {
        counts[firstName] = (counts[firstName] || 0) + 1;
      }

      return counts;
    }, {});
    const studentsById = students.reduce(function (lookup, student) {
      lookup[student.id] = student;
      return lookup;
    }, {});
    const activeSocialRelationsStudent = socialRelationsDraft
      ? studentsById[socialRelationsDraft.studentId] || null
      : null;
    const activeSocialRelationsColumn = socialRelationsDraft
      ? socialRelationColumns.find(function (column) {
        return column.key === socialRelationsDraft.relationKey;
      }) || null
      : null;

    function getStudentFullName(student) {
      return [student && student.firstName || "", student && student.lastName || ""].join(" ").trim();
    }

    function getStudentShortName(student) {
      const firstName = String(student && student.firstName || "").trim();
      const lastName = String(student && student.lastName || "").trim();
      const firstNameKey = firstName.toLocaleLowerCase();

      if (!firstName) {
        return lastName || "-";
      }

      if ((firstNameCounts[firstNameKey] || 0) > 1 && lastName) {
        return firstName + " " + lastName.charAt(0) + ".";
      }

      return firstName;
    }

    function getSocialRelationIds(student, relationKey) {
      const relations = student && student.socialRelations && typeof student.socialRelations === "object"
        ? student.socialRelations
        : {};

      return Array.isArray(relations[relationKey]) ? relations[relationKey].filter(function (studentId, index, studentIds) {
        return Boolean(studentsById[studentId]) && studentIds.indexOf(studentId) === index;
      }) : [];
    }

    function buildSocialRelationDisplay(student, relationKey) {
      const text = getSocialRelationIds(student, relationKey).map(function (studentId) {
        return getStudentShortName(studentsById[studentId]);
      }).join(", ");

      return text || "-";
    }

    function buildSocialRelationsTable() {
      const rows = students.map(function (student) {
        return [
          '<tr>',
          '<th scope="row">', escapeValue(getStudentShortName(student)), '</th>',
          socialRelationColumns.map(function (column) {
            return [
              '<td>',
              '<button class="class-social-table__cell-button" type="button" onclick="return window.UnterrichtsassistentApp.openClassSocialRelationsModal(\'', escapeValue(student.id), '\', \'', escapeValue(column.key), '\')">',
              escapeValue(buildSocialRelationDisplay(student, column.key)),
              '</button>',
              '</td>'
            ].join("");
          }).join(""),
          '</tr>'
        ].join("");
      }).join("");

      return [
        '<div class="class-social-table-wrap">',
        '<table class="student-table class-social-table">',
        '<thead><tr><th>Schueler</th>',
        socialRelationColumns.map(function (column) {
          return '<th>' + escapeValue(column.label) + '</th>';
        }).join(""),
        '</tr></thead>',
        '<tbody>',
        rows || '<tr><td colspan="5">Noch keine Schuelerdaten in dieser Lerngruppe.</td></tr>',
        '</tbody>',
        '</table>',
        '</div>'
      ].join("");
    }

    function buildSocialRelationsImportToolbar() {
      return [
        '<div class="class-social-toolbar">',
        '<button class="row-delete-button class-social-toolbar__import" type="button" onclick="return window.UnterrichtsassistentApp.openClassSocialImportPicker()">Import</button>',
        '<input id="classSocialImportFile" class="class-social-toolbar__file" type="file" accept=".csv,.html,.htm,text/csv,text/html" onchange="return window.UnterrichtsassistentApp.handleClassSocialImportFile(this)">',
        '</div>'
      ].join("");
    }

    function buildSocialRelationsModal() {
      const activeIds = activeSocialRelationsStudent && activeSocialRelationsColumn
        ? getSocialRelationIds(activeSocialRelationsStudent, activeSocialRelationsColumn.key)
        : [];
      const inputValue = activeIds.map(function (studentId) {
        return getStudentFullName(studentsById[studentId]);
      }).filter(Boolean).join(", ");
      const suggestionItems = activeSocialRelationsStudent
        ? students.filter(function (student) {
          return student.id !== activeSocialRelationsStudent.id;
        }).map(function (student) {
          const fullName = getStudentFullName(student);

          return [
            '<button class="class-social-modal__suggestion" type="button" data-full-name="', escapeValue(fullName), '" onmousedown="event.preventDefault(); return window.UnterrichtsassistentApp.insertClassSocialRelationSuggestion(this.getAttribute(\'data-full-name\'))">',
            escapeValue(fullName),
            '</button>'
          ].join("");
        }).join("")
        : "";

      if (!activeSocialRelationsStudent || !activeSocialRelationsColumn) {
        return "";
      }

      return [
        '<div class="import-modal is-open" id="classSocialRelationsModal">',
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeClassSocialRelationsModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--class-social" role="dialog" aria-modal="true" aria-labelledby="classSocialRelationsTitle">',
        '<div class="import-modal__header">',
        '<div>',
        '<h3 id="classSocialRelationsTitle">', escapeValue(activeSocialRelationsColumn.label), ' - ', escapeValue(getStudentFullName(activeSocialRelationsStudent)), '</h3>',
        '<p class="import-modal__meta">Namen mit Komma trennen</p>',
        '</div>',
        '<div class="import-modal__icon-actions">',
        '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="submit" form="classSocialRelationsForm" aria-label="Sozialgefuege uebernehmen">&#10003;</button>',
        '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Bearbeitung abbrechen" onclick="return window.UnterrichtsassistentApp.closeClassSocialRelationsModal()">&#10005;</button>',
        '</div>',
        '</div>',
        '<form class="import-modal__form" id="classSocialRelationsForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitClassSocialRelationsModal(event)">',
        '<label class="import-modal__field class-social-modal__field">',
        '<span>Schueler</span>',
        '<input id="classSocialRelationsInput" type="text" value="', escapeValue(inputValue), '" autocomplete="off" autocapitalize="none" spellcheck="false" onfocus="return window.UnterrichtsassistentApp.updateClassSocialRelationsSuggestions()" oninput="return window.UnterrichtsassistentApp.updateClassSocialRelationsSuggestions()" onblur="return window.UnterrichtsassistentApp.hideClassSocialRelationsSuggestions()">',
        '<div class="class-social-modal__suggestions" id="classSocialRelationsSuggestions" hidden>',
        suggestionItems,
        '</div>',
        '</label>',
        '</form>',
        '</div>',
        '</div>'
      ].join("");
    }

    function buildSocialImportModal() {
      const relationOptions = socialRelationColumns.map(function (column) {
        return '<option value="' + escapeValue(column.key) + '"' + (socialImportDraft && socialImportDraft.relationKey === column.key ? ' selected' : '') + '>' + escapeValue(column.label) + '</option>';
      }).join("");
      const importMode = socialImportDraft && socialImportDraft.mode === "append" ? "append" : "replace";
      const columnRows = socialImportDraft && Array.isArray(socialImportDraft.columns)
        ? socialImportDraft.columns.map(function (column) {
          const samples = Array.isArray(column.samples) ? column.samples : [];

          return [
            '<tr>',
            '<th scope="row">', escapeValue(column.header || ("Spalte " + String(column.index + 1))), '</th>',
            '<td><select class="student-table__input student-table__select" onchange="return window.UnterrichtsassistentApp.updateClassSocialImportColumnRole(', escapeValue(String(column.index)), ', this.value)">',
            '<option value=""', column.role ? '' : ' selected', '>ignorieren</option>',
            '<option value="chooser"', column.role === "chooser" ? ' selected' : '', '>waehlende Person</option>',
            '<option value="chosen"', column.role === "chosen" ? ' selected' : '', '>gewaehlte Person</option>',
            '</select></td>',
            '<td class="class-social-import__sample">', escapeValue(samples.join(" | ") || "-"), '</td>',
            '</tr>'
          ].join("");
        }).join("")
        : "";

      if (!socialImportDraft) {
        return "";
      }

      return [
        '<div class="import-modal is-open" id="classSocialImportModal">',
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeClassSocialImportModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--class-social-import" role="dialog" aria-modal="true" aria-labelledby="classSocialImportTitle">',
        '<div class="import-modal__header">',
        '<div>',
        '<h3 id="classSocialImportTitle">Sozialgefuege importieren</h3>',
        '<p class="import-modal__meta">', escapeValue(socialImportDraft.fileName || "Import"), '</p>',
        '</div>',
        '<div class="import-modal__icon-actions">',
        '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="submit" form="classSocialImportForm" aria-label="Import uebernehmen">&#10003;</button>',
        '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Import abbrechen" onclick="return window.UnterrichtsassistentApp.closeClassSocialImportModal()">&#10005;</button>',
        '</div>',
        '</div>',
        '<form class="import-modal__form" id="classSocialImportForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitClassSocialImportModal(event)">',
        '<label class="import-modal__field">',
        '<span>Import gilt fuer</span>',
        '<select class="student-table__input student-table__select" onchange="return window.UnterrichtsassistentApp.updateClassSocialImportRelation(this.value)">',
        relationOptions,
        '</select>',
        '</label>',
        '<label class="import-modal__field">',
        '<span>Importmodus</span>',
        '<select class="student-table__input student-table__select" onchange="return window.UnterrichtsassistentApp.updateClassSocialImportMode(this.value)">',
        '<option value="replace"', importMode === "replace" ? ' selected' : '', '>ersetzen</option>',
        '<option value="append"', importMode === "append" ? ' selected' : '', '>hinzufuegen</option>',
        '</select>',
        '</label>',
        '<div class="class-social-import__table-wrap">',
        '<table class="student-table class-social-import__table">',
        '<thead><tr><th>Spalte</th><th>Kategorie</th><th>Vorschau</th></tr></thead>',
        '<tbody>',
        columnRows || '<tr><td colspan="3">Keine Spalten gefunden.</td></tr>',
        '</tbody>',
        '</table>',
        '</div>',
        '</form>',
        '</div>',
        '</div>'
      ].join("");
    }

    const sortedStudents = !isManageMode ? students.slice().sort(function (leftStudent, rightStudent) {
      const directionFactor = analysisSort && analysisSort.direction === "desc" ? -1 : 1;
      const sortKey = analysisSort && analysisSort.key ? analysisSort.key : "name";

      if (sortKey === "name") {
        const leftName = getStudentAnalysisName(leftStudent).toLocaleLowerCase();
        const rightName = getStudentAnalysisName(rightStudent).toLocaleLowerCase();

        if (leftName < rightName) {
          return -1 * directionFactor;
        }

        if (leftName > rightName) {
          return 1 * directionFactor;
        }

        return 0;
      }

      {
        const leftCount = analysisCriterion === "count"
          ? (analysisCountsByStudentDate[leftStudent.id + "|" + sortKey] || 0)
          : analysisCriterionValueByStudentGroup[leftStudent.id + "|" + sortKey];
        const rightCount = analysisCriterion === "count"
          ? (analysisCountsByStudentDate[rightStudent.id + "|" + sortKey] || 0)
          : analysisCriterionValueByStudentGroup[rightStudent.id + "|" + sortKey];
        const leftValue = Number.isFinite(leftCount) ? leftCount : Number.NEGATIVE_INFINITY;
        const rightValue = Number.isFinite(rightCount) ? rightCount : Number.NEGATIVE_INFINITY;

        if (leftValue !== rightValue) {
          return (leftValue - rightValue) * directionFactor;
        }

        {
          const leftName = getStudentAnalysisName(leftStudent).toLocaleLowerCase();
          const rightName = getStudentAnalysisName(rightStudent).toLocaleLowerCase();

          if (leftName < rightName) {
            return -1;
          }

          if (leftName > rightName) {
            return 1;
          }
        }

        return 0;
      }
    }) : students;

    const tableRows = sortedStudents.map(function (student) {
      const genderValue = escapeValue(student.gender).toLowerCase();
      if (!isManageMode) {
        return [
          '<tr data-student-id="', student.id, '">',
          '<td class="student-table__name-cell">', escapeValue(getStudentAnalysisName(student)), "</td>",
          visibleAnalysisGroups.map(function (groupInfo) {
            return buildAnalysisCell(student.id, groupInfo);
          }).join(""),
          new Array(analysisEmptyColumnCount + 1).join('<td class="student-table__date-cell student-table__date-cell--empty"></td>'),
          "</tr>"
        ].join("");
      }

      return [
        '<tr data-student-id="', student.id, '">',
        '<td><input class="student-table__input" type="text" value="', escapeValue(student.firstName), '" autocomplete="off" autocapitalize="none" spellcheck="false" onchange="window.UnterrichtsassistentApp.updateStudentField(\'', student.id, '\', \'firstName\', this.value)"></td>',
        '<td><input class="student-table__input" type="text" value="', escapeValue(student.lastName), '" autocomplete="off" autocapitalize="none" spellcheck="false" onchange="window.UnterrichtsassistentApp.updateStudentField(\'', student.id, '\', \'lastName\', this.value)"></td>',
        '<td><select class="student-table__input student-table__select" onchange="window.UnterrichtsassistentApp.updateStudentField(\'', student.id, '\', \'gender\', this.value)">',
        '<option value=""', genderValue ? "" : ' selected', '>-</option>',
        '<option value="m"', genderValue === "m" ? ' selected' : "", '>m</option>',
        '<option value="w"', genderValue === "w" ? ' selected' : "", '>w</option>',
        '<option value="d"', genderValue === "d" ? ' selected' : "", '>d</option>',
        "</select></td>",
        '<td class="student-table__action-cell"><button class="row-delete-button" type="button" aria-label="Schueler loeschen" onclick="return window.UnterrichtsassistentApp.deleteStudent(\'', student.id, '\')">Entfernen</button></td>',
        "</tr>"
      ].join("");
    }).join("");

    return [
      '<div class="panel-grid panel-grid--klasse">',
      '<article class="panel panel--full">',
      schoolClass ? "" : '<p class="empty-message">Noch keine Lerngruppe angelegt. Lege ueber den Plus-Button zuerst eine Lerngruppe an.</p>',
      schoolClass && isManageMode ? [
        '<section class="class-basisdaten', isBasisdatenExpanded ? '' : ' is-collapsed', '">',
        buildBasisdatenHeader(),
        isBasisdatenExpanded ? [
        '<div class="class-meta-editor">',
        '<label class="class-meta-editor__field">',
        '<span>Klassenbezeichner</span>',
        '<input class="student-table__input" type="text" value="', escapeValue(schoolClass.name), '" autocomplete="off" autocapitalize="none" spellcheck="false" onchange="window.UnterrichtsassistentApp.updateActiveClassField(\'name\', this.value)">',
        '</label>',
        '<label class="class-meta-editor__field">',
        '<span>Fach</span>',
        '<input class="student-table__input" type="text" value="', escapeValue(schoolClass.subject), '" autocomplete="off" autocapitalize="none" spellcheck="false" onchange="window.UnterrichtsassistentApp.updateActiveClassField(\'subject\', this.value)">',
        '</label>',
        '<label class="class-meta-editor__field">',
        '<span>Anzeigefarbe</span>',
        '<input class="student-table__input class-color-input" type="color" value="', escapeValue(classDisplayColor), '" onchange="window.UnterrichtsassistentApp.updateActiveClassField(\'displayColor\', this.value)">',
        '</label>',
        '</div>',
        '<div class="table-header">',
        '<h2 class="table-header__title">Schueler</h2>',
        '<span class="table-header__count">', students.length, ' Eintraege</span>',
        '</div>',
        '<div class="student-table-wrap">',
        '<table class="student-table">',
        '<thead><tr><th>Vorname</th><th>Nachname</th><th>Geschlecht</th><th></th></tr></thead>',
        '<tbody>',
        tableRows || '<tr><td colspan="4">Noch keine Schuelerdaten in dieser Lerngruppe.</td></tr>',
        '</tbody>',
        '</table>',
        '</div>',
        '<div class="table-actions"><button class="import-box__label" type="button" onclick="return window.UnterrichtsassistentApp.addStudentRow()">Neue Zeile</button></div>'
        ].join("") : "",
        '</section>'
      ].join("") : "",
      schoolClass && isManageMode ? [
        '<section class="class-basisdaten class-sozialgefuege', isSozialgefuegeExpanded ? '' : ' is-collapsed', '">',
        buildSozialgefuegeHeader(),
        isSozialgefuegeExpanded ? [buildSocialRelationsImportToolbar(), buildSocialRelationsTable()].join("") : "",
        '</section>'
      ].join("") : "",
      isAnalysisMode ? [
        '<div class="class-analysis-toolbar">',
        '<div class="class-analysis-toolbar__cluster">',
        '<div class="class-analysis-toolbar__group"><span class="class-analysis-toolbar__label">Filter:</span>',
        '<div class="class-analysis-tools" role="group" aria-label="Datensatzarten filtern">',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.attendance !== false ? ' is-active' : "", '" type="button" aria-label="Anwesenheit filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'attendance\')">&#10003;</button>',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.homework !== false ? ' is-active' : "", '" type="button" aria-label="Hausaufgaben filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'homework\')">H</button>',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.warning !== false ? ' is-active' : "", '" type="button" aria-label="Verwarnungen filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'warning\')">&#9888;</button>',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.assessment !== false ? ' is-active' : "", '" type="button" aria-label="Bewertungen filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'assessment\')">&#128269;</button>',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.mathObservation !== false ? ' is-active' : "", '" type="button" aria-label="Mathematik-Beobachtungen filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'mathObservation\')">K</button>',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.knowledgeGap !== false ? ' is-active' : "", '" type="button" aria-label="Wissensluecken filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'knowledgeGap\')">B</button>',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.evidenceObservation !== false ? ' is-active' : "", '" type="button" aria-label="Bewertungswerkzeuge filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'evidenceObservation\')">E</button>',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.completedEvaluation !== false ? ' is-active' : "", '" type="button" aria-label="Abgeschlossene Bewertungen filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'completedEvaluation\')">&#9733;</button>',
        '</div>',
        '</div>',
        '<label class="class-analysis-grouping"><span class="class-analysis-toolbar__label">Gruppierung:</span><select class="student-table__input student-table__select" onchange="return window.UnterrichtsassistentApp.setClassAnalysisGrouping(this.value)"><option value="day"', analysisGrouping === "day" ? " selected" : "", '>Tag</option><option value="week"', analysisGrouping === "week" ? " selected" : "", '>Woche</option><option value="month"', analysisGrouping === "month" ? " selected" : "", '>Monat</option><option value="total"', analysisGrouping === "total" ? " selected" : "", '>Gesamt</option></select></label>',
        '<label class="class-analysis-grouping"><span class="class-analysis-toolbar__label">Kriterium:</span><select class="student-table__input student-table__select" onchange="return window.UnterrichtsassistentApp.setClassAnalysisCriterion(this.value)"><option value="count"', analysisCriterion === "count" ? " selected" : "", '>Anzahl</option><option value="performance"', analysisCriterion === "performance" ? " selected" : "", '>Leistung</option><option value="workBehavior"', analysisCriterion === "workBehavior" ? " selected" : "", '>AV</option></select></label>',
        '</div>',
        '</div>'
      ].join("") : "",
      isStudentMode ? buildStudentAnalysisView() : "",
      isAnalysisMode ? [
        '<div class="table-header">',
        '<h2 class="table-header__title">Datensaetze</h2>',
        '<span class="table-header__count">', students.length, ' Eintraege</span>',
        '</div>',
        '<div class="student-table-wrap student-table-wrap--analysis" data-drag-scroll="true" data-class-id="' + escapeValue(schoolClass && schoolClass.id || "") + '">',
        '<table class="student-table student-table--analysis">',
        "<thead><tr><th class=\"student-table__name-cell student-table__name-cell--head\"><button class=\"student-table__sort-button\" type=\"button\" onclick=\"return window.UnterrichtsassistentApp.setClassAnalysisSort('name')\">Name<span class=\"student-table__sort-arrow\">" + escapeValue(getSortArrow("name")) + "</span></button></th>" + visibleAnalysisGroups.map(function (groupInfo) {
          return '<th class="student-table__date-head"><button class="student-table__sort-button student-table__sort-button--center" type="button" onclick="return window.UnterrichtsassistentApp.setClassAnalysisSort(\'' + escapeValue(groupInfo.key) + '\')">' + escapeValue(groupInfo.label) + '<span class="student-table__sort-arrow">' + escapeValue(getSortArrow(groupInfo.key)) + "</span></button></th>";
        }).join("") + new Array(analysisEmptyColumnCount + 1).join('<th class="student-table__date-head student-table__date-head--empty"></th>') + "</tr></thead>",
        "<tbody>",
        tableRows || ('<tr><td colspan="' + String(visibleAnalysisGroups.length + analysisEmptyColumnCount + 1) + '">Noch keine Schuelerdaten in dieser Lerngruppe.</td></tr>'),
        "</tbody>",
        "</table>",
        "</div>"
      ].join("") : "",
      "</article>",
      !isManageMode ? [
        '<div class="import-modal', analysisDetailDraft && analysisDetailStudent ? ' is-open' : "", '" id="classAnalysisDetailModal"', analysisDetailDraft && analysisDetailStudent ? "" : " hidden", ">",
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeClassAnalysisDetailModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--analysis-detail" role="dialog" aria-modal="true" aria-labelledby="classAnalysisDetailTitle">',
        '<div class="import-modal__header">',
        '<div>',
        '<h3 id="classAnalysisDetailTitle">', escapeValue(analysisDetailStudent ? getStudentAnalysisName(analysisDetailStudent) : ""), analysisDetailStudent && schoolClass ? " - " + escapeValue((schoolClass.name || "") + " " + (schoolClass.subject || "")).trim() : "", "</h3>",
        '<p class="import-modal__meta">', escapeValue(analysisDetailDraft ? analysisDetailDraft.groupLabel : ""), "</p>",
        "</div>",
        '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closeClassAnalysisDetailModal()">x</button>',
        "</div>",
        '<div class="class-analysis-detail">',
        '<table class="student-table class-analysis-detail__table">',
        "<thead><tr><th>Typ</th><th>Zusammenfassung</th><th></th></tr></thead>",
        "<tbody>",
        analysisDetailRows || '<tr><td colspan="3">Keine Datensaetze fuer diese Auswahl.</td></tr>',
        "</tbody>",
        "</table>",
        "</div>",
        "</div>",
        "</div>"
      ].join("") : "",
      !isManageMode ? [
        '<div class="import-modal', analysisEditRecord && analysisEditStudent ? ' is-open' : "", '" id="classAnalysisRecordEditModal"', analysisEditRecord && analysisEditStudent ? "" : " hidden", ">",
        '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeClassAnalysisRecordEditModal()"></div>',
        '<div class="import-modal__dialog import-modal__dialog--analysis-detail" role="dialog" aria-modal="true" aria-labelledby="classAnalysisRecordEditTitle">',
        '<div class="import-modal__header">',
        '<div>',
        '<h3 id="classAnalysisRecordEditTitle">', escapeValue(analysisEditStudent ? getStudentAnalysisName(analysisEditStudent) : ""), analysisEditStudent && schoolClass ? " - " + escapeValue((schoolClass.name || "") + " " + (schoolClass.subject || "")).trim() : "", "</h3>",
        '<div class="import-modal__meta">', escapeValue(analysisDetailDraft ? analysisDetailDraft.groupLabel : (analysisEditRecord ? analysisEditRecord.groupLabel : "")), "</div>",
        '</div>',
        '<div class="import-modal__icon-actions">',
        '<button class="import-modal__icon-button import-modal__icon-button--confirm" type="submit" form="classAnalysisRecordEditForm" aria-label="Datensatz uebernehmen">&#10003;</button>',
        '<button class="import-modal__icon-button import-modal__icon-button--cancel" type="button" aria-label="Bearbeitung abbrechen" onclick="return window.UnterrichtsassistentApp.closeClassAnalysisRecordEditModal()">&#10005;</button>',
        '</div>',
        '</div>',
        '<form class="import-modal__form" id="classAnalysisRecordEditForm" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitClassAnalysisRecordEditModal(event)">',
        analysisEditRecord && analysisEditRecord.type === "attendance" ? [
          '<label class="import-modal__field"><span>Uhrzeit</span><input id="classAnalysisAttendanceTime" type="time" value="', escapeValue(formatTimeLabel((analysisEditRecord.raw && (analysisEditRecord.raw.effectiveAt || analysisEditRecord.raw.recordedAt)) || "")), '"></label>',
          '<label class="import-modal__field"><span>Anwesend</span><select id="classAnalysisAttendanceStatus" class="student-table__input student-table__select"><option value="present"', analysisEditRecord.raw && analysisEditRecord.raw.status === "present" ? " selected" : "", '>ja</option><option value="absent"', !analysisEditRecord.raw || analysisEditRecord.raw.status !== "present" ? " selected" : "", '>nein</option></select></label>'
        ].join("") : "",
        analysisEditRecord && analysisEditRecord.type === "homework" ? [
          '<div class="import-modal__field"><span>Hausaufgabe</span><div class="assessment-category-buttons">',
          '<button class="assessment-category-button class-analysis-homework-button', analysisEditRecord.raw && analysisEditRecord.raw.quality === "fehlt" ? " is-active" : "", '" type="button" data-quality="fehlt" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisHomeworkQuality(\'fehlt\')">fehlt</button>',
          '<button class="assessment-category-button class-analysis-homework-button', analysisEditRecord.raw && analysisEditRecord.raw.quality === "unvollstaendig" ? " is-active" : "", '" type="button" data-quality="unvollstaendig" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisHomeworkQuality(\'unvollstaendig\')">unvollstaendig</button>',
          '<button class="assessment-category-button class-analysis-homework-button', analysisEditRecord.raw && analysisEditRecord.raw.quality === "abgeschrieben" ? " is-active" : "", '" type="button" data-quality="abgeschrieben" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisHomeworkQuality(\'abgeschrieben\')">abgeschrieben</button>',
          '<button class="assessment-category-button class-analysis-homework-button', analysisEditRecord.raw && analysisEditRecord.raw.quality === "vorhanden" ? " is-active" : "", '" type="button" data-quality="vorhanden" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisHomeworkQuality(\'vorhanden\')">vorhanden</button>',
          '<button class="assessment-category-button class-analysis-homework-button', analysisEditRecord.raw && analysisEditRecord.raw.quality === "besondersgut" ? " is-active" : "", '" type="button" data-quality="besondersgut" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisHomeworkQuality(\'besondersgut\')">besonders gut</button>',
          '</div><input id="classAnalysisHomeworkQuality" type="hidden" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.quality || ""), '"></div>'
        ].join("") : "",
        analysisEditRecord && analysisEditRecord.type === "warning" ? [
          '<div class="import-modal__field"><span>Verwarnung</span><div class="assessment-category-buttons">',
          '<button class="assessment-category-button class-analysis-warning-button', analysisEditRecord.raw && analysisEditRecord.raw.category === "stoerung" ? " is-active" : "", '" type="button" data-category="stoerung" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisWarningCategory(\'stoerung\')">Stoerung</button>',
          '<button class="assessment-category-button class-analysis-warning-button', analysisEditRecord.raw && analysisEditRecord.raw.category === "arbeitsorganisation" ? " is-active" : "", '" type="button" data-category="arbeitsorganisation" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisWarningCategory(\'arbeitsorganisation\')">Arbeitsorganisation</button>',
          '<button class="assessment-category-button class-analysis-warning-button', analysisEditRecord.raw && analysisEditRecord.raw.category === "material" ? " is-active" : "", '" type="button" data-category="material" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisWarningCategory(\'material\')">Material</button>',
          '<button class="assessment-category-button class-analysis-warning-button', analysisEditRecord.raw && analysisEditRecord.raw.category === "andere" ? " is-active" : "", '" type="button" data-category="andere" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisWarningCategory(\'andere\')">andere</button>',
          '</div><input id="classAnalysisWarningCategory" type="hidden" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.category || ""), '"></div>',
          '<label class="import-modal__field"><span>Notiz</span><input id="classAnalysisWarningNote" type="text" maxlength="120" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.note || ""), '" placeholder="Kurzer Hinweis" autocomplete="off" autocapitalize="none" spellcheck="false"></label>'
        ].join("") : "",
        analysisEditRecord && analysisEditRecord.type === "mathObservation" ? [
          '<div class="import-modal__field"><span>Beobachtung</span><input type="text" readonly value="', escapeValue(buildAnalysisDetailSummary(analysisEditRecord.raw || {})), '"></div>',
          '<label class="import-modal__field"><span>Notiz</span><input id="classAnalysisMathObservationNote" type="text" maxlength="240" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.note || ""), '" placeholder="Freie Notiz zur Beobachtung" autocomplete="off" autocapitalize="none" spellcheck="false"></label>'
        ].join("") : "",
        analysisEditRecord && analysisEditRecord.type === "evidenceObservation" ? [
          '<div class="import-modal__field"><span>Bewertungswerkzeug</span><input type="text" readonly value="', escapeValue(buildEvidenceObservationSummary(analysisEditRecord.raw || {})), '"></div>'
        ].join("") : "",
        analysisEditRecord && analysisEditRecord.type === "knowledgeGap" ? [
          '<label class="import-modal__field import-modal__field--knowledge-gap"><span>Inhalt</span><input id="classAnalysisKnowledgeGapContent" type="text" maxlength="180" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.content || ""), '" placeholder="Wissensluecke beschreiben" autocomplete="off" autocapitalize="none" spellcheck="false" onfocus="return window.UnterrichtsassistentApp.handleKnowledgeGapInputFocus(\'classAnalysisKnowledgeGapContent\', \'classAnalysisKnowledgeGapSuggestions\')" oninput="return window.UnterrichtsassistentApp.handleKnowledgeGapInput(event, \'classAnalysisKnowledgeGapSuggestions\')" onblur="return window.UnterrichtsassistentApp.handleKnowledgeGapInputBlur(\'classAnalysisKnowledgeGapSuggestions\')"><div class="knowledge-gap-suggestions" id="classAnalysisKnowledgeGapSuggestions" hidden onpointerdown="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerDown(event, \'classAnalysisKnowledgeGapSuggestions\')" onpointermove="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerMove(event, \'classAnalysisKnowledgeGapSuggestions\')" onpointerup="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerUp(event, \'classAnalysisKnowledgeGapSuggestions\')" onpointercancel="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerUp(event, \'classAnalysisKnowledgeGapSuggestions\')"></div></label>',
          '<label class="import-modal__field"><span>Status</span><select id="classAnalysisKnowledgeGapStatus" class="student-table__input student-table__select"><option value="offen"', analysisEditRecord.raw && analysisEditRecord.raw.status === "offen" ? " selected" : "", '>offen</option><option value="in arbeit"', analysisEditRecord.raw && analysisEditRecord.raw.status === "in arbeit" ? " selected" : "", '>in Arbeit</option><option value="geschlossen"', analysisEditRecord.raw && analysisEditRecord.raw.status === "geschlossen" ? " selected" : "", '>geschlossen</option></select></label>',
          '<label class="import-modal__field"><span>Notiz</span><input id="classAnalysisKnowledgeGapNote" type="text" maxlength="240" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.note || ""), '" placeholder="Freie Notiz" autocomplete="off" autocapitalize="none" spellcheck="false"></label>'
        ].join("") : "",
        analysisEditRecord && analysisEditRecord.type === "assessment" ? [
          '<div class="assessment-columns">',
          '<section class="assessment-column">',
          '<h4 class="assessment-column__title">Leistung</h4>',
          '<div class="import-modal__field"><span>Kategorie</span><div class="assessment-category-buttons">',
          '<button class="assessment-category-button class-analysis-assessment-category-button', analysisEditRecord.raw && analysisEditRecord.raw.category === "beitrag" ? " is-active" : "", '" type="button" data-category="beitrag" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentCategory(\'beitrag\')">Beitrag</button>',
          '<button class="assessment-category-button class-analysis-assessment-category-button', analysisEditRecord.raw && analysisEditRecord.raw.category === "ueberpruefung" ? " is-active" : "", '" type="button" data-category="ueberpruefung" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentCategory(\'ueberpruefung\')">Ueberpruefung</button>',
          '<button class="assessment-category-button class-analysis-assessment-category-button', analysisEditRecord.raw && analysisEditRecord.raw.category === "praesentation" ? " is-active" : "", '" type="button" data-category="praesentation" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentCategory(\'praesentation\')">Praesentation</button>',
          '<button class="assessment-category-button class-analysis-assessment-category-button', analysisEditRecord.raw && analysisEditRecord.raw.category === "abgabe" ? " is-active" : "", '" type="button" data-category="abgabe" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentCategory(\'abgabe\')">Abgabe</button>',
          '</div><input id="classAnalysisAssessmentCategory" type="hidden" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.category || ""), '"></div>',
          '<div class="import-modal__field"><span>AFB-Bewertung</span><div class="assessment-grid-chart" onpointerdown="return window.UnterrichtsassistentApp.startClassAnalysisAssessmentGridPointer(event)" onpointermove="return window.UnterrichtsassistentApp.handleClassAnalysisAssessmentGridPointerMove(event)" onpointerup="return window.UnterrichtsassistentApp.handleClassAnalysisAssessmentGridPointerUp(event)" onpointercancel="return window.UnterrichtsassistentApp.handleClassAnalysisAssessmentGridPointerUp(event)"><svg class="assessment-grid-chart__svg" id="classAnalysisAssessmentGridSvg" viewBox="0 0 360 260" role="img" aria-label="AFB Bewertungsraster"></svg></div><input id="classAnalysisAssessmentAfb1" type="hidden" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.afb1 !== undefined && analysisEditRecord.raw.afb1 !== null ? analysisEditRecord.raw.afb1 : ""), '"><input id="classAnalysisAssessmentAfb2" type="hidden" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.afb2 !== undefined && analysisEditRecord.raw.afb2 !== null ? analysisEditRecord.raw.afb2 : ""), '"><input id="classAnalysisAssessmentAfb3" type="hidden" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.afb3 !== undefined && analysisEditRecord.raw.afb3 !== null ? analysisEditRecord.raw.afb3 : ""), '"></div>',
          '</section>',
          '<section class="assessment-column"><h4 class="assessment-column__title">Verhalten</h4><div class="assessment-behavior-grid">',
          '<div class="import-modal__field"><span>AV</span><div class="assessment-grade-buttons assessment-grade-buttons--vertical">',
          '<button class="assessment-grade-button class-analysis-assessment-grade-button', analysisEditRecord.raw && analysisEditRecord.raw.workBehavior === "a" ? " is-active" : "", '" type="button" data-target="work" data-value="a" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentGrade(\'work\', \'a\')">a</button>',
          '<button class="assessment-grade-button class-analysis-assessment-grade-button', analysisEditRecord.raw && analysisEditRecord.raw.workBehavior === "b" ? " is-active" : "", '" type="button" data-target="work" data-value="b" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentGrade(\'work\', \'b\')">b</button>',
          '<button class="assessment-grade-button class-analysis-assessment-grade-button', analysisEditRecord.raw && analysisEditRecord.raw.workBehavior === "c" ? " is-active" : "", '" type="button" data-target="work" data-value="c" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentGrade(\'work\', \'c\')">c</button>',
          '<button class="assessment-grade-button class-analysis-assessment-grade-button', analysisEditRecord.raw && analysisEditRecord.raw.workBehavior === "d" ? " is-active" : "", '" type="button" data-target="work" data-value="d" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentGrade(\'work\', \'d\')">d</button>',
          '</div><input id="classAnalysisAssessmentWorkBehavior" type="hidden" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.workBehavior || ""), '"></div>',
          '<div class="import-modal__field"><span>SV</span><div class="assessment-grade-buttons assessment-grade-buttons--vertical">',
          '<button class="assessment-grade-button class-analysis-assessment-grade-button', analysisEditRecord.raw && analysisEditRecord.raw.socialBehavior === "a" ? " is-active" : "", '" type="button" data-target="social" data-value="a" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentGrade(\'social\', \'a\')">a</button>',
          '<button class="assessment-grade-button class-analysis-assessment-grade-button', analysisEditRecord.raw && analysisEditRecord.raw.socialBehavior === "b" ? " is-active" : "", '" type="button" data-target="social" data-value="b" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentGrade(\'social\', \'b\')">b</button>',
          '<button class="assessment-grade-button class-analysis-assessment-grade-button', analysisEditRecord.raw && analysisEditRecord.raw.socialBehavior === "c" ? " is-active" : "", '" type="button" data-target="social" data-value="c" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentGrade(\'social\', \'c\')">c</button>',
          '<button class="assessment-grade-button class-analysis-assessment-grade-button', analysisEditRecord.raw && analysisEditRecord.raw.socialBehavior === "d" ? " is-active" : "", '" type="button" data-target="social" data-value="d" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisAssessmentGrade(\'social\', \'d\')">d</button>',
          '</div><input id="classAnalysisAssessmentSocialBehavior" type="hidden" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.socialBehavior || ""), '"></div>',
          '</div></section>',
          '<section class="assessment-column"><h4 class="assessment-column__title">Fachwissen</h4><label class="import-modal__field import-modal__field--knowledge-gap"><span>Wissensluecke</span><input id="classAnalysisAssessmentKnowledgeGap" type="text" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.knowledgeGap || ""), '" placeholder="Diagnostizierte Wissensluecke" autocomplete="off" autocapitalize="none" spellcheck="false" onfocus="return window.UnterrichtsassistentApp.handleKnowledgeGapInputFocus(\'classAnalysisAssessmentKnowledgeGap\', \'classAnalysisAssessmentKnowledgeGapSuggestions\')" oninput="return window.UnterrichtsassistentApp.handleKnowledgeGapInput(event, \'classAnalysisAssessmentKnowledgeGapSuggestions\')" onblur="return window.UnterrichtsassistentApp.handleKnowledgeGapInputBlur(\'classAnalysisAssessmentKnowledgeGapSuggestions\')"><div class="knowledge-gap-suggestions" id="classAnalysisAssessmentKnowledgeGapSuggestions" hidden onpointerdown="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerDown(event, \'classAnalysisAssessmentKnowledgeGapSuggestions\')" onpointermove="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerMove(event, \'classAnalysisAssessmentKnowledgeGapSuggestions\')" onpointerup="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerUp(event, \'classAnalysisAssessmentKnowledgeGapSuggestions\')" onpointercancel="return window.UnterrichtsassistentApp.handleKnowledgeGapSuggestionsPointerUp(event, \'classAnalysisAssessmentKnowledgeGapSuggestions\')"></div></label><label class="import-modal__field"><span>Notiz</span><input id="classAnalysisAssessmentNote" type="text" maxlength="240" value="', escapeValue(analysisEditRecord.raw && analysisEditRecord.raw.note || ""), '" placeholder="Freie Notiz zur Bewertung" autocomplete="off" autocapitalize="none" spellcheck="false"></label></section>',
          '</div>'
        ].join("") : "",
        '</form>',
        '</div>',
      ].join("") : "",
      "",
      schoolClass && isManageMode ? buildSocialRelationsModal() : "",
      schoolClass && isManageMode ? buildSocialImportModal() : "",
      '<div class="import-modal" id="classImportModal" hidden>',
      '<div class="import-modal__backdrop" onclick="return window.UnterrichtsassistentApp.closeClassImportModal()"></div>',
      '<div class="import-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="classImportTitle">',
      '<div class="import-modal__header">',
      '<h3 id="classImportTitle">Neue Lerngruppe anlegen</h3>',
      '<button class="import-modal__close" type="button" aria-label="Pop-up schliessen" onclick="return window.UnterrichtsassistentApp.closeClassImportModal()">x</button>',
      "</div>",
      '<form class="import-modal__form" autocomplete="off" method="post" action="about:blank" data-local-only-form onsubmit="return window.UnterrichtsassistentApp.submitClassImport(event)">',
      '<label class="import-modal__field">',
      "<span>Klassenbezeichner</span>",
      '<input id="classNameInput" type="text" placeholder="z. B. 8a" autocomplete="off" autocapitalize="none" spellcheck="false">',
      "</label>",
      '<label class="import-modal__field">',
      "<span>Fach</span>",
      '<input id="classSubjectInput" type="text" placeholder="z. B. Mathematik" autocomplete="off" autocapitalize="none" spellcheck="false" required>',
      "</label>",
      '<label class="import-modal__field">',
      "<span>CSV-Datei (optional)</span>",
      '<input id="studentCsvFile" type="file" accept=".csv,.txt">',
      "</label>",
      '<p class="import-box__hint">Ohne CSV ist ein Klassenbezeichner noetig. Mit CSV wird bei leerem Klassenbezeichner der Wert aus der Datei uebernommen.</p>',
      '<div class="import-modal__actions">',
      '<button class="import-box__label" type="submit">Lerngruppe anlegen</button>',
      "</div>",
      "</form>",
      "</div>",
      "</div>",
      "</div>"
    ].join("");
  }
};


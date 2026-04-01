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
    const classDisplayColor = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getClassDisplayColor === "function"
      ? window.UnterrichtsassistentApp.getClassDisplayColor(schoolClass)
      : "#d9d4cb";
    const isManageMode = classViewMode === "verwalten";
    const analysisSort = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getClassAnalysisSort === "function"
      ? window.UnterrichtsassistentApp.getClassAnalysisSort()
      : { key: "name", direction: "asc" };
    const analysisEnabledTypes = window.UnterrichtsassistentApp && typeof window.UnterrichtsassistentApp.getClassAnalysisEnabledTypes === "function"
      ? window.UnterrichtsassistentApp.getClassAnalysisEnabledTypes()
      : { attendance: true, homework: true, warning: true, assessment: true, completedEvaluation: true };
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
        knowledgeGap: "Wissensluecke"
      }[key] || key;
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
        const orderedKeys = ["status", "quality", "category", "note", "afb1", "afb2", "afb3", "workBehavior", "socialBehavior", "knowledgeGap"];

      return orderedKeys.filter(function (key) {
        const value = record[key];
        return value !== undefined && value !== null && String(value).trim() !== "";
      }).map(function (key) {
        return normalizeLabel(key) + ": " + formatDetailValue(key, record[key]);
      }).join(" | ");
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
      ? analysisRecords.filter(function (record) {
        return record.studentId === analysisDetailDraft.studentId
          && String(record.groupKey || "") === String(analysisDetailDraft.groupKey || "");
      }).sort(function (leftRecord, rightRecord) {
        return String(rightRecord.sortKey || "").localeCompare(String(leftRecord.sortKey || ""));
      })
      : [];
    const analysisDetailRows = analysisDetailRecords.map(function (record) {
      const isCompletedEvaluation = String(record.type || "") === "completedEvaluation";
      const completedSummary = isCompletedEvaluation
        ? buildCompletedEvaluationSummary(record.plannedEvaluation, record.evaluationSheet, record.raw)
        : null;
      const summaryText = isCompletedEvaluation
        ? [
            String(record.evaluationSheet && record.evaluationSheet.title || "").trim() || "Bewertung",
            completedSummary ? formatPointsLabel(completedSummary.totalAchieved) + " / " + formatPointsLabel(completedSummary.totalReachable) : "",
            completedSummary && completedSummary.stageLabel ? completedSummary.stageLabel : ""
          ].filter(Boolean).join(" | ")
        : (buildAnalysisDetailSummary(record.raw || {}) || "-");

      return [
        '<tr class="class-analysis-detail__row" onclick="return window.UnterrichtsassistentApp.', isCompletedEvaluation ? 'openClassAnalysisPerformedEvaluation(\'' + escapeValue(record.plannedEvaluation && record.plannedEvaluation.id || "") + '\', \'' + escapeValue(record.studentId || "") + '\')' : 'openClassAnalysisRecordEdit(\'' + escapeValue(record.type) + '\', \'' + escapeValue(record.raw && record.raw.id || "") + '\')', '">',
        '<td class="class-analysis-detail__type-cell">', escapeValue(record.symbol), "</td>",
        '<td class="class-analysis-detail__summary-cell">', escapeValue(summaryText), "</td>",
        '<td class="class-analysis-detail__action-cell">', isCompletedEvaluation ? '<span class="class-analysis-detail__action-placeholder">&#8599;</span>' : '<button class="row-delete-button row-delete-button--small" type="button" onclick="event.stopPropagation(); return window.UnterrichtsassistentApp.deleteClassAnalysisRecord(\'' + escapeValue(record.type) + '\', \'' + escapeValue(record.raw && record.raw.id || "") + '\')">Loeschen</button>', '</td>',
        "</tr>"
      ].join("");
    }).join("");
    const analysisEditRecord = analysisEditDraft ? analysisRecords.find(function (record) {
      return record.type === analysisEditDraft.recordType && String(record.raw && record.raw.id || "") === analysisEditDraft.recordId;
    }) || null : null;
    const analysisEditStudent = analysisEditRecord
      ? students.find(function (student) {
        return student.id === analysisEditRecord.studentId;
      }) || null
      : null;

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
      '</div>'
      ].join("") : "",
      !isManageMode ? [
        '<div class="class-analysis-toolbar">',
        '<div class="class-analysis-toolbar__cluster">',
        '<div class="class-analysis-toolbar__group"><span class="class-analysis-toolbar__label">Filter:</span>',
        '<div class="class-analysis-tools" role="group" aria-label="Datensatzarten filtern">',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.attendance !== false ? ' is-active' : "", '" type="button" aria-label="Anwesenheit filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'attendance\')">&#10003;</button>',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.homework !== false ? ' is-active' : "", '" type="button" aria-label="Hausaufgaben filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'homework\')">H</button>',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.warning !== false ? ' is-active' : "", '" type="button" aria-label="Verwarnungen filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'warning\')">&#9888;</button>',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.assessment !== false ? ' is-active' : "", '" type="button" aria-label="Bewertungen filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'assessment\')">&#128269;</button>',
        '<button class="unterricht-seatplan-action class-analysis-tool', analysisEnabledTypes.completedEvaluation !== false ? ' is-active' : "", '" type="button" aria-label="Abgeschlossene Bewertungen filtern" onclick="return window.UnterrichtsassistentApp.toggleClassAnalysisType(\'completedEvaluation\')">&#9733;</button>',
        '</div>',
        '</div>',
        '<label class="class-analysis-grouping"><span class="class-analysis-toolbar__label">Gruppierung:</span><select class="student-table__input student-table__select" onchange="return window.UnterrichtsassistentApp.setClassAnalysisGrouping(this.value)"><option value="day"', analysisGrouping === "day" ? " selected" : "", '>Tag</option><option value="week"', analysisGrouping === "week" ? " selected" : "", '>Woche</option><option value="month"', analysisGrouping === "month" ? " selected" : "", '>Monat</option><option value="total"', analysisGrouping === "total" ? " selected" : "", '>Gesamt</option></select></label>',
        '<label class="class-analysis-grouping"><span class="class-analysis-toolbar__label">Kriterium:</span><select class="student-table__input student-table__select" onchange="return window.UnterrichtsassistentApp.setClassAnalysisCriterion(this.value)"><option value="count"', analysisCriterion === "count" ? " selected" : "", '>Anzahl</option><option value="performance"', analysisCriterion === "performance" ? " selected" : "", '>Leistung</option><option value="workBehavior"', analysisCriterion === "workBehavior" ? " selected" : "", '>AV</option></select></label>',
        '</div>',
        '</div>'
      ].join("") : "",
      '<div class="table-header">',
      '<h2 class="table-header__title">', isManageMode ? "Schueler" : "Datensaetze", '</h2>',
      '<span class="table-header__count">', students.length, ' Eintraege</span>',
      '</div>',
      '<div class="student-table-wrap', isManageMode ? "" : ' student-table-wrap--analysis', '"', isManageMode ? "" : ' data-drag-scroll="true" data-class-id="' + escapeValue(schoolClass && schoolClass.id || "") + '"', '>',
      '<table class="student-table', isManageMode ? "" : ' student-table student-table--analysis', '">',
      isManageMode
        ? "<thead><tr><th>Vorname</th><th>Nachname</th><th>Geschlecht</th><th></th></tr></thead>"
        : ("<thead><tr><th class=\"student-table__name-cell student-table__name-cell--head\"><button class=\"student-table__sort-button\" type=\"button\" onclick=\"return window.UnterrichtsassistentApp.setClassAnalysisSort('name')\">Name<span class=\"student-table__sort-arrow\">" + escapeValue(getSortArrow("name")) + "</span></button></th>" + visibleAnalysisGroups.map(function (groupInfo) {
          return '<th class="student-table__date-head"><button class="student-table__sort-button student-table__sort-button--center" type="button" onclick="return window.UnterrichtsassistentApp.setClassAnalysisSort(\'' + escapeValue(groupInfo.key) + '\')">' + escapeValue(groupInfo.label) + '<span class="student-table__sort-arrow">' + escapeValue(getSortArrow(groupInfo.key)) + "</span></button></th>";
        }).join("") + new Array(analysisEmptyColumnCount + 1).join('<th class="student-table__date-head student-table__date-head--empty"></th>') + "</tr></thead>"),
      "<tbody>",
      tableRows || ('<tr><td colspan="' + (isManageMode ? "4" : String(visibleAnalysisGroups.length + analysisEmptyColumnCount + 1)) + '">Noch keine Schuelerdaten in dieser Lerngruppe.</td></tr>'),
      "</tbody>",
      "</table>",
      "</div>",
      schoolClass && isManageMode ? '<div class="table-actions"><button class="import-box__label" type="button" onclick="return window.UnterrichtsassistentApp.addStudentRow()">Neue Zeile</button></div>' : "",
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


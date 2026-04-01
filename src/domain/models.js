window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.domain = window.Unterrichtsassistent.domain || {};

class Student {
  constructor({ id, firstName, lastName, className = "", gender = "", strengths = [], gaps = [], attendanceRate = 1 }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.className = className;
    this.gender = gender;
    this.strengths = strengths;
    this.gaps = gaps;
    this.attendanceRate = attendanceRate;
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
      return rawCompetencyGrid && typeof rawCompetencyGrid === "object"
        ? JSON.parse(JSON.stringify(rawCompetencyGrid))
        : {};
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
  constructor({ id, plannedEvaluationId = "", classId = "", studentId = "", evaluationSheetId = "", subtaskResults = [], overallNote = "", isCompleted = false, completedAt = "", createdAt = "", updatedAt = "" }) {
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
  constructor({ id, studentId, classId, lessonId = "", lessonDate = "", room = "", recordedAt = "", quality = "fehlt" }) {
    this.id = id;
    this.studentId = studentId;
    this.classId = classId;
    this.lessonId = lessonId;
    this.lessonDate = lessonDate;
    this.room = room;
    this.recordedAt = recordedAt;
    this.quality = quality;
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

class TodoItem {
  constructor({ id, title, dueDate, relatedClassId, done = false }) {
    this.id = id;
    this.title = title;
    this.dueDate = dueDate;
    this.relatedClassId = relatedClassId;
    this.done = done;
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
    constructor({ id, title = "", startDate = "", endDate = "", startTime = "", endTime = "", category = "", description = "", priority = 3, isExternallyControlled = false, controlledByView = "", controlledById = "" }) {
      this.id = id;
      this.title = title;
      this.startDate = startDate;
      this.endDate = endDate;
      this.startTime = startTime;
      this.endTime = endTime;
      this.category = category;
      this.description = description;
      this.priority = [1, 2, 3].indexOf(Number(priority)) >= 0 ? Number(priority) : 3;
      this.isExternallyControlled = Boolean(isExternallyControlled);
      this.controlledByView = this.isExternallyControlled ? String(controlledByView || "").trim() : "";
      this.controlledById = this.isExternallyControlled ? String(controlledById || "").trim() : "";
    }
  }

class PlanningCategory {
    constructor({ id, name = "", color = "" }) {
      this.id = id;
      this.name = name;
      this.color = color;
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
  constructor({ id, sequenceId = "", topic = "", hourType = "single", functionType = "", situationType = "", demandLevel = "", nextLessonId = "" }) {
    const normalizedFunctionType = String(functionType || "").trim().toLowerCase();
    const normalizedSituationType = String(situationType || "").trim().toLowerCase();
    const normalizedDemandLevel = String(demandLevel || "").trim().toLowerCase();

    this.id = id;
    this.sequenceId = sequenceId;
    this.topic = topic;
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
  constructor({ id, phaseId = "", title = "", content = "", socialForm = "plenum", material = "", nextStepId = "" }) {
    const normalizedSocialForm = String(socialForm || "").trim().toLowerCase();

    this.id = id;
    this.phaseId = phaseId;
    this.title = String(title || "").trim();
    this.content = String(content || "").trim();
    this.socialForm = ["einzel", "partner", "gruppe", "plenum"].indexOf(normalizedSocialForm) >= 0
      ? normalizedSocialForm
      : "plenum";
    this.material = String(material || "").trim();
    this.nextStepId = nextStepId;
  }
}

class CurriculumLessonPhaseStatus {
  constructor({ id, classId = "", lessonDate = "", lessonPlanId = "", phaseId = "", isCompleted = false, elapsedMinutes = 0, resumeStartMinutes = 0, liveSituationType = "", liveDemandLevel = "" }) {
    const normalizedSituationType = String(liveSituationType || "").trim().toLowerCase();
    const normalizedDemandLevel = String(liveDemandLevel || "").trim().toLowerCase();

    this.id = id;
    this.classId = classId;
    this.lessonDate = String(lessonDate || "").slice(0, 10);
    this.lessonPlanId = lessonPlanId;
    this.phaseId = phaseId;
    this.isCompleted = Boolean(isCompleted);
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

window.Unterrichtsassistent.domain.Student = Student;
window.Unterrichtsassistent.domain.SchoolClass = SchoolClass;
window.Unterrichtsassistent.domain.Lesson = Lesson;
window.Unterrichtsassistent.domain.Timetable = Timetable;
window.Unterrichtsassistent.domain.TimetableRow = TimetableRow;
window.Unterrichtsassistent.domain.Assessment = Assessment;
window.Unterrichtsassistent.domain.EvaluationSheet = EvaluationSheet;
window.Unterrichtsassistent.domain.PlannedEvaluation = PlannedEvaluation;
window.Unterrichtsassistent.domain.PerformedEvaluation = PerformedEvaluation;
window.Unterrichtsassistent.domain.AttendanceRecord = AttendanceRecord;
window.Unterrichtsassistent.domain.HomeworkRecord = HomeworkRecord;
window.Unterrichtsassistent.domain.WarningRecord = WarningRecord;
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

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
    constructor({ id, title = "", startDate = "", endDate = "", startTime = "", endTime = "", category = "", description = "", priority = 3 }) {
      this.id = id;
      this.title = title;
      this.startDate = startDate;
      this.endDate = endDate;
      this.startTime = startTime;
      this.endTime = endTime;
      this.category = category;
      this.description = description;
      this.priority = [1, 2, 3].indexOf(Number(priority)) >= 0 ? Number(priority) : 3;
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
  constructor({ id, sequenceId = "", topic = "", hourType = "single", nextLessonId = "" }) {
    this.id = id;
    this.sequenceId = sequenceId;
    this.topic = topic;
    this.hourType = hourType === "double" ? "double" : "single";
    this.nextLessonId = nextLessonId;
  }
}

class CurriculumLessonPhase {
  constructor({ id, lessonPlanId = "", title = "", durationMinutes = 0, isReserve = false, nextPhaseId = "" }) {
    this.id = id;
    this.lessonPlanId = lessonPlanId;
    this.title = String(title || "").trim();
    this.durationMinutes = Math.max(0, Number(durationMinutes) || 0);
    this.isReserve = Boolean(isReserve);
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
  constructor({ id, classId = "", lessonDate = "", lessonPlanId = "", phaseId = "", isCompleted = false, elapsedMinutes = 0, resumeStartMinutes = 0 }) {
    this.id = id;
    this.classId = classId;
    this.lessonDate = String(lessonDate || "").slice(0, 10);
    this.lessonPlanId = lessonPlanId;
    this.phaseId = phaseId;
    this.isCompleted = Boolean(isCompleted);
    this.elapsedMinutes = Math.max(0, Number(elapsedMinutes) || 0);
    this.resumeStartMinutes = Math.max(0, Number(resumeStartMinutes) || 0);
  }
}

window.Unterrichtsassistent.domain.Student = Student;
window.Unterrichtsassistent.domain.SchoolClass = SchoolClass;
window.Unterrichtsassistent.domain.Lesson = Lesson;
window.Unterrichtsassistent.domain.Timetable = Timetable;
window.Unterrichtsassistent.domain.TimetableRow = TimetableRow;
window.Unterrichtsassistent.domain.Assessment = Assessment;
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

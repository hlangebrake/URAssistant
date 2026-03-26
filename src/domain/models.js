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
  constructor({ id, studentId, classId, type, score, maxScore, date }) {
    this.id = id;
    this.studentId = studentId;
    this.classId = classId;
    this.type = type;
    this.score = score;
    this.maxScore = maxScore;
    this.date = date;
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

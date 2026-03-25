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
  constructor({ id, name, room, subject, studentIds = [] }) {
    this.id = id;
    this.name = name;
    this.room = room;
    this.subject = subject;
    this.studentIds = studentIds;
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
  constructor({ id, classId, updatedAt, seats = [] }) {
    this.id = id;
    this.classId = classId;
    this.updatedAt = updatedAt;
    this.seats = seats;
  }
}

window.Unterrichtsassistent.domain.Student = Student;
window.Unterrichtsassistent.domain.SchoolClass = SchoolClass;
window.Unterrichtsassistent.domain.Lesson = Lesson;
window.Unterrichtsassistent.domain.Assessment = Assessment;
window.Unterrichtsassistent.domain.TodoItem = TodoItem;
window.Unterrichtsassistent.domain.SeatPlan = SeatPlan;

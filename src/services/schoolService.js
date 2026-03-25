window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.services = window.Unterrichtsassistent.services || {};

function getCurrentWeekdayIndex(date = new Date()) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours * 60) + minutes;
}

class SchoolService {
  constructor(snapshot) {
    this.snapshot = snapshot;
  }

  getCurrentLesson(date = new Date()) {
    const weekday = getCurrentWeekdayIndex(date);
    const currentMinutes = (date.getHours() * 60) + date.getMinutes();

    return this.snapshot.lessons.find((lesson) => {
      const starts = timeToMinutes(lesson.startTime);
      const ends = timeToMinutes(lesson.endTime);
      return lesson.weekday === weekday && currentMinutes >= starts && currentMinutes <= ends;
    }) || this.getNextLesson(date);
  }

  getNextLesson(date = new Date()) {
    const weekday = getCurrentWeekdayIndex(date);
    const currentMinutes = (date.getHours() * 60) + date.getMinutes();

    const futureLessons = this.snapshot.lessons
      .filter((lesson) => {
        if (lesson.weekday > weekday) {
          return true;
        }

        return lesson.weekday === weekday && timeToMinutes(lesson.startTime) >= currentMinutes;
      })
      .sort((left, right) => {
        if (left.weekday !== right.weekday) {
          return left.weekday - right.weekday;
        }

        return timeToMinutes(left.startTime) - timeToMinutes(right.startTime);
      });

    return futureLessons[0] || this.snapshot.lessons[0] || null;
  }

  getClassById(classId) {
    return this.snapshot.classes.find((schoolClass) => schoolClass.id === classId) || null;
  }

  getStudentsForClass(classId) {
    const schoolClass = this.getClassById(classId);
    if (!schoolClass) {
      return [];
    }

    return this.snapshot.students.filter((student) => schoolClass.studentIds.includes(student.id));
  }

  getAssessmentsForClass(classId) {
    return this.snapshot.assessments.filter((assessment) => assessment.classId === classId);
  }

  getSeatPlanForClass(classId) {
    return this.snapshot.seatPlans.find((seatPlan) => seatPlan.classId === classId) || null;
  }

  getOpenTodosForClass(classId) {
    return this.snapshot.todos.filter((todo) => todo.relatedClassId === classId && !todo.done);
  }

  getAverageAchievement(classId) {
    const assessments = this.getAssessmentsForClass(classId);
    if (!assessments.length) {
      return null;
    }

    const sum = assessments.reduce((total, assessment) => total + assessment.percentage, 0);
    return Math.round(sum / assessments.length);
  }

  getClassSummary(classId) {
    const students = this.getStudentsForClass(classId);
    const seatPlan = this.getSeatPlanForClass(classId);
    const openTodos = this.getOpenTodosForClass(classId);

    return {
      studentCount: students.length,
      gapsCount: students.reduce((total, student) => total + student.gaps.length, 0),
      averageAttendance: students.length
        ? Math.round((students.reduce((total, student) => total + student.attendanceRate, 0) / students.length) * 100)
        : 0,
      averageAchievement: this.getAverageAchievement(classId),
      openTodos: openTodos.length,
      seatPlanUpdatedAt: seatPlan ? seatPlan.updatedAt : "nicht vorhanden"
    };
  }
}

window.Unterrichtsassistent.services.SchoolService = SchoolService;

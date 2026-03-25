window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.services = window.Unterrichtsassistent.services || {};

const WEEKDAY_KEYS = ["1", "2", "3", "4", "5"];
const WEEKDAY_META = [
  { key: "1", shortLabel: "Mo", label: "Montag" },
  { key: "2", shortLabel: "Di", label: "Dienstag" },
  { key: "3", shortLabel: "Mi", label: "Mittwoch" },
  { key: "4", shortLabel: "Do", label: "Donnerstag" },
  { key: "5", shortLabel: "Fr", label: "Freitag" }
];

function getCurrentWeekdayIndex(date = new Date()) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}

function timeToMinutes(time) {
  const parts = String(time || "").split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (parts.length !== 2 || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 470;
  }

  return (hours * 60) + minutes;
}

function normalizeDayEntry(entry) {
  return {
    classId: entry && entry.classId ? entry.classId : "",
    room: entry && entry.room ? entry.room : "",
    isDouble: Boolean(entry && entry.isDouble)
  };
}

function normalizeTimetableRow(row, index) {
  const type = row && row.type === "pause" ? "pause" : "lesson";
  const rowDays = row && row.days ? row.days : {};
  const days = {};

  WEEKDAY_KEYS.forEach(function (weekdayKey) {
    days[weekdayKey] = normalizeDayEntry(rowDays[weekdayKey]);
  });

  return {
    id: row && row.id ? row.id : "timetable-row-" + String(index + 1),
    type: type,
    durationMinutes: Number(row && row.durationMinutes) || (type === "pause" ? 5 : 45),
    days: days
  };
}

function normalizeTimetable(timetable) {
  const source = timetable || {};
  const rows = Array.isArray(source.rows) ? source.rows : [];

  return {
    id: source.id || "",
    validFrom: source.validFrom || "",
    validTo: source.validTo || "",
    startTime: source.startTime || "07:50",
    rows: rows.map(normalizeTimetableRow)
  };
}

function normalizeDateValue(value) {
  return String(value || "").slice(0, 10);
}

function getLocalDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function compareDateValues(left, right) {
  if (left === right) {
    return 0;
  }

  if (!left) {
    return -1;
  }

  if (!right) {
    return 1;
  }

  return left < right ? -1 : 1;
}

function buildTimetableRows(timetable) {
  const normalizedTimetable = normalizeTimetable(timetable);
  const rows = normalizedTimetable.rows.map(function (row) {
    return {
      id: row.id,
      type: row.type,
      durationMinutes: row.durationMinutes,
      days: row.days
    };
  });
  let currentMinutes = timeToMinutes(normalizedTimetable.startTime);

  rows.forEach(function (row) {
    const startMinutes = currentMinutes;
    const endMinutes = startMinutes + row.durationMinutes;

    row.startTime = minutesToTime(startMinutes);
    row.endTime = minutesToTime(endMinutes);
    row.cells = {};
    currentMinutes = endMinutes;
  });

  WEEKDAY_KEYS.forEach(function (weekdayKey) {
    let activeDoubleSource = null;

    rows.forEach(function (row) {
      const dayEntry = row.days[weekdayKey] || normalizeDayEntry();
      const cell = {
        classId: dayEntry.classId || "",
        room: dayEntry.room || "",
        isDouble: row.type === "lesson" && Boolean(dayEntry.classId) && Boolean(dayEntry.isDouble),
        isBlocked: false,
        inheritedClassId: "",
        inheritedRoom: "",
        sourceRowId: null
      };

      if (activeDoubleSource) {
        cell.isBlocked = true;
        cell.inheritedClassId = activeDoubleSource.classId;
        cell.inheritedRoom = activeDoubleSource.room;
        cell.sourceRowId = activeDoubleSource.rowId;

        if (row.type === "lesson") {
          activeDoubleSource = null;
        }
      }

      if (!cell.isBlocked && row.type === "lesson" && cell.isDouble) {
        activeDoubleSource = {
          classId: cell.classId,
          room: cell.room,
          rowId: row.id
        };
      }

      row.cells[weekdayKey] = cell;
    });
  });

  return rows;
}

class SchoolService {
  constructor(snapshot) {
    this.snapshot = snapshot;
  }

  getReferenceDate() {
    if ((this.snapshot.activeDateTimeMode || "live") === "live") {
      return new Date();
    }

    const activeDateTime = String(this.snapshot.activeDateTime || "").trim();
    const parsedDate = activeDateTime ? new Date(activeDateTime) : null;

    if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    return new Date();
  }

  getWeekdays() {
    return WEEKDAY_META.slice();
  }

  getAllTimetables() {
    return (this.snapshot.timetables || []).map(normalizeTimetable).sort(function (left, right) {
      return compareDateValues(right.validFrom, left.validFrom);
    });
  }

  getTimetableById(timetableId) {
    return this.getAllTimetables().find(function (timetable) {
      return timetable.id === timetableId;
    }) || null;
  }

  getCurrentTimetable(date) {
    const effectiveDate = date || this.getReferenceDate();
    const todayValue = getLocalDateValue(effectiveDate);
    const matchingTimetables = this.getAllTimetables().filter(function (timetable) {
      const validFrom = normalizeDateValue(timetable.validFrom);
      const validTo = normalizeDateValue(timetable.validTo);
      const startsBefore = !validFrom || compareDateValues(validFrom, todayValue) <= 0;
      const endsAfter = !validTo || compareDateValues(validTo, todayValue) >= 0;

      return startsBefore && endsAfter;
    }).sort(function (left, right) {
      return compareDateValues(right.validFrom, left.validFrom);
    });

    return matchingTimetables[0] || this.getAllTimetables()[0] || null;
  }

  getManagedTimetable() {
    if (this.snapshot.activeTimetableId) {
      const activeTimetable = this.getTimetableById(this.snapshot.activeTimetableId);
      if (activeTimetable) {
        return activeTimetable;
      }
    }

    return this.getCurrentTimetable(this.getReferenceDate());
  }

  getTimetable() {
    return this.getManagedTimetable() || normalizeTimetable({});
  }

  getTimetableRows(timetable) {
    return buildTimetableRows(timetable || this.getManagedTimetable());
  }

  getScheduledLessons(date) {
    const classesById = {};
    const lessons = [];

    this.snapshot.classes.forEach(function (schoolClass) {
      classesById[schoolClass.id] = schoolClass;
    });

    const currentTimetable = this.getCurrentTimetable(date);

    if (!currentTimetable) {
      return [];
    }

    this.getTimetableRows(currentTimetable).forEach(function (row) {
      WEEKDAY_KEYS.forEach(function (weekdayKey) {
        const cell = row.cells[weekdayKey];
        const classId = row.type === "lesson"
          ? (cell.isBlocked ? cell.inheritedClassId : cell.classId)
          : "";
        const schoolClass = classId ? classesById[classId] : null;

        if (!schoolClass) {
          return;
        }

        lessons.push({
          id: "timetable-" + weekdayKey + "-" + row.id,
          classId: schoolClass.id,
          subject: schoolClass.subject || "",
          room: cell.isBlocked ? (cell.inheritedRoom || schoolClass.room || "") : (cell.room || schoolClass.room || ""),
          weekday: Number(weekdayKey),
          startTime: row.startTime,
          endTime: row.endTime,
          topic: ""
        });
      });
    });

    return lessons.sort(function (left, right) {
      if (left.weekday !== right.weekday) {
        return left.weekday - right.weekday;
      }

      return timeToMinutes(left.startTime) - timeToMinutes(right.startTime);
    });
  }

  getAllClasses() {
    return this.snapshot.classes.slice();
  }

  getActiveClass() {
    if ((this.snapshot.activeDateTimeMode || "live") === "live") {
      const liveLesson = this.getMostRecentLesson(this.getReferenceDate());

      if (liveLesson) {
        return this.getClassById(liveLesson.classId);
      }
    }

    if (this.snapshot.activeClassId) {
      const activeClass = this.getClassById(this.snapshot.activeClassId);
      if (activeClass) {
        return activeClass;
      }
    }

    const currentLesson = this.getCurrentLesson(this.getReferenceDate());

    if (currentLesson) {
      return this.getClassById(currentLesson.classId);
    }

    return this.snapshot.classes[0] || null;
  }

  getMostRecentLesson(date) {
    const effectiveDate = date || this.getReferenceDate();
    const weekday = getCurrentWeekdayIndex(effectiveDate);
    const currentMinutes = (effectiveDate.getHours() * 60) + effectiveDate.getMinutes();
    const scheduledLessons = this.getScheduledLessons(effectiveDate);
    const pastLessons = scheduledLessons.filter(function (lesson) {
      if (lesson.weekday < weekday) {
        return true;
      }

      return lesson.weekday === weekday && timeToMinutes(lesson.startTime) <= currentMinutes;
    }).sort(function (left, right) {
      if (left.weekday !== right.weekday) {
        return right.weekday - left.weekday;
      }

      return timeToMinutes(right.startTime) - timeToMinutes(left.startTime);
    });

    return pastLessons[0] || scheduledLessons[scheduledLessons.length - 1] || null;
  }

  getCurrentLesson(date) {
    const effectiveDate = date || this.getReferenceDate();
    const weekday = getCurrentWeekdayIndex(effectiveDate);
    const currentMinutes = (effectiveDate.getHours() * 60) + effectiveDate.getMinutes();
    const scheduledLessons = this.getScheduledLessons(effectiveDate);

    return scheduledLessons.find(function (lesson) {
      const starts = timeToMinutes(lesson.startTime);
      const ends = timeToMinutes(lesson.endTime);
      return lesson.weekday === weekday && currentMinutes >= starts && currentMinutes <= ends;
    }) || this.getNextLesson(effectiveDate);
  }

  getNextLesson(date) {
    const effectiveDate = date || this.getReferenceDate();
    const weekday = getCurrentWeekdayIndex(effectiveDate);
    const currentMinutes = (effectiveDate.getHours() * 60) + effectiveDate.getMinutes();
    const scheduledLessons = this.getScheduledLessons(effectiveDate);
    const futureLessons = scheduledLessons
      .filter(function (lesson) {
        if (lesson.weekday > weekday) {
          return true;
        }

        return lesson.weekday === weekday && timeToMinutes(lesson.startTime) >= currentMinutes;
      })
      .sort(function (left, right) {
        if (left.weekday !== right.weekday) {
          return left.weekday - right.weekday;
        }

        return timeToMinutes(left.startTime) - timeToMinutes(right.startTime);
      });

    return futureLessons[0] || scheduledLessons[0] || this.snapshot.lessons[0] || null;
  }

  getClassById(classId) {
    return this.snapshot.classes.find(function (schoolClass) {
      return schoolClass.id === classId;
    }) || null;
  }

  getStudentsForClass(classId) {
    const schoolClass = this.getClassById(classId);
    if (!schoolClass) {
      return [];
    }

    return this.snapshot.students.filter(function (student) {
      return schoolClass.studentIds.includes(student.id);
    });
  }

  getAssessmentsForClass(classId) {
    return this.snapshot.assessments.filter(function (assessment) {
      return assessment.classId === classId;
    });
  }

  getSeatPlanForClass(classId) {
    return this.snapshot.seatPlans.find(function (seatPlan) {
      return seatPlan.classId === classId;
    }) || null;
  }

  getOpenTodosForClass(classId) {
    return this.snapshot.todos.filter(function (todo) {
      return todo.relatedClassId === classId && !todo.done;
    });
  }

  getAverageAchievement(classId) {
    const assessments = this.getAssessmentsForClass(classId);
    if (!assessments.length) {
      return null;
    }

    const sum = assessments.reduce(function (total, assessment) {
      return total + assessment.percentage;
    }, 0);
    return Math.round(sum / assessments.length);
  }

  getClassSummary(classId) {
    const students = this.getStudentsForClass(classId);
    const seatPlan = this.getSeatPlanForClass(classId);
    const openTodos = this.getOpenTodosForClass(classId);

    return {
      studentCount: students.length,
      gapsCount: students.reduce(function (total, student) {
        return total + student.gaps.length;
      }, 0),
      averageAttendance: students.length
        ? Math.round((students.reduce(function (total, student) {
            return total + student.attendanceRate;
          }, 0) / students.length) * 100)
        : 0,
      averageAchievement: this.getAverageAchievement(classId),
      openTodos: openTodos.length,
      seatPlanUpdatedAt: seatPlan ? seatPlan.updatedAt : "nicht vorhanden"
    };
  }
}

window.Unterrichtsassistent.services.SchoolService = SchoolService;

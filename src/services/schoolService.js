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

function normalizeSeatPlan(seatPlan) {
  const source = seatPlan || {};

  return {
    id: source.id || "",
    classId: source.classId || "",
    room: source.room || "",
    validFrom: source.validFrom || "",
    validTo: source.validTo || "",
    updatedAt: source.updatedAt || "",
    seats: Array.isArray(source.seats) ? source.seats : [],
    deskLayoutItems: Array.isArray(source.deskLayoutItems) ? source.deskLayoutItems : [],
    deskLayoutLinks: Array.isArray(source.deskLayoutLinks) ? source.deskLayoutLinks : [],
    roomWindowSide: source.roomWindowSide || "",
    roomWidth: Number(source.roomWidth) || 720,
    roomHeight: Number(source.roomHeight) || 720
  };
}

function normalizeSeatOrder(seatOrder) {
  const source = seatOrder || {};

  return {
    id: source.id || "",
    classId: source.classId || "",
    room: source.room || "",
    validFrom: source.validFrom || "",
    validTo: source.validTo || "",
    updatedAt: source.updatedAt || "",
    seats: Array.isArray(source.seats) ? source.seats : []
  };
}

function normalizeAttendanceRecord(attendanceRecord) {
  const source = attendanceRecord || {};

  return {
    id: source.id || "",
    studentId: source.studentId || "",
    classId: source.classId || "",
    lessonId: source.lessonId || "",
    lessonDate: source.lessonDate || "",
    room: source.room || "",
    status: source.status === "present" ? "present" : "absent",
    recordedAt: source.recordedAt || "",
    effectiveAt: source.effectiveAt || ""
  };
}

function normalizeHomeworkRecord(homeworkRecord) {
  const source = homeworkRecord || {};
  const quality = ["fehlt", "unvollstaendig", "abgeschrieben", "vorhanden", "besondersgut"].indexOf(String(source.quality || "").trim()) >= 0
    ? String(source.quality || "").trim()
    : "fehlt";

  return {
    id: source.id || "",
    studentId: source.studentId || "",
    classId: source.classId || "",
    lessonId: source.lessonId || "",
    lessonDate: source.lessonDate || "",
    room: source.room || "",
    recordedAt: source.recordedAt || "",
    quality: quality
  };
}

function normalizeWarningRecord(warningRecord) {
  const source = warningRecord || {};
  const category = ["stoerung", "arbeitsorganisation", "material", "andere"].indexOf(String(source.category || "").trim()) >= 0
    ? String(source.category || "").trim()
    : "stoerung";

  return {
    id: source.id || "",
    studentId: source.studentId || "",
    classId: source.classId || "",
    lessonId: source.lessonId || "",
    lessonDate: source.lessonDate || "",
    room: source.room || "",
    recordedAt: source.recordedAt || "",
    category: category,
    note: String(source.note || "").trim()
  };
}

function normalizeKnowledgeGapRecord(knowledgeGapRecord) {
  const source = knowledgeGapRecord || {};
  const normalizedStatus = String(source.status || "").trim().toLowerCase();

  return {
    id: source.id || "",
    studentId: source.studentId || "",
    classId: source.classId || "",
    lessonId: source.lessonId || "",
    lessonDate: source.lessonDate || "",
    room: source.room || "",
    recordedAt: source.recordedAt || "",
    content: String(source.content || "").trim(),
    status: ["offen", "in arbeit", "geschlossen"].indexOf(normalizedStatus) >= 0 ? normalizedStatus : "offen"
  };
}

function normalizeMathObservationRecord(observationRecord) {
  const source = observationRecord || {};

  return {
    id: source.id || "",
    studentId: source.studentId || "",
    classId: source.classId || "",
    lessonId: source.lessonId || "",
    lessonDate: source.lessonDate || "",
    room: source.room || "",
    recordedAt: source.recordedAt || "",
    primaryCompetency: source.primaryCompetency || "",
    competencyIds: Array.isArray(source.competencyIds) ? source.competencyIds.slice() : [],
    processQuality: Number.isFinite(Number(source.processQuality)) ? Number(source.processQuality) : 0,
    marker: source.marker || "",
    markerDirection: source.markerDirection || "",
    markerQuality: String(source.markerQuality || "").trim() === "" ? "" : Number(source.markerQuality),
    situationType: source.situationType || "",
    demandLevel: source.demandLevel || "",
    lessonPlanId: source.lessonPlanId || "",
    lessonPhaseId: source.lessonPhaseId || "",
    lessonStepId: source.lessonStepId || "",
    note: String(source.note || "").trim()
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

  getRoomsForClass(classId) {
    const rooms = {};
    const activeClass = classId ? this.getClassById(classId) : null;

    this.getAllTimetables().forEach(function (timetable) {
      buildTimetableRows(timetable).forEach(function (row) {
        WEEKDAY_KEYS.forEach(function (weekdayKey) {
          const cell = row.cells[weekdayKey];
          const effectiveClassId = row.type === "lesson"
            ? (cell.isBlocked ? cell.inheritedClassId : cell.classId)
            : "";
          const effectiveRoom = row.type === "lesson"
            ? (cell.isBlocked ? cell.inheritedRoom : cell.room)
            : "";

          if (effectiveClassId === classId && effectiveRoom) {
            rooms[effectiveRoom] = true;
          }
        });
      });
    });

    if (!Object.keys(rooms).length && activeClass && activeClass.room) {
      rooms[activeClass.room] = true;
    }

    return Object.keys(rooms).sort();
  }

  getRelevantRoomForClass(classId, date) {
    const effectiveDate = date || this.getReferenceDate();
    const currentLessonUnit = this.getCurrentLessonForClass(classId, effectiveDate);
    const weekday = getCurrentWeekdayIndex(effectiveDate);
    const currentMinutes = (effectiveDate.getHours() * 60) + effectiveDate.getMinutes();
    const currentTimetable = this.getCurrentTimetable(effectiveDate);
    let fallbackRoom = "";

    if (currentLessonUnit && currentLessonUnit.room) {
      return currentLessonUnit.room;
    }

    if (!currentTimetable) {
      return this.getRoomsForClass(classId)[0] || "";
    }

    this.getTimetableRows(currentTimetable).forEach(function (row) {
      const starts = timeToMinutes(row.startTime);
      const ends = timeToMinutes(row.endTime);
      const cell = row.cells[String(weekday)] || null;
      const effectiveClassId = row.type === "lesson" && cell
        ? (cell.isBlocked ? cell.inheritedClassId : cell.classId)
        : "";
      const effectiveRoom = row.type === "lesson" && cell
        ? (cell.isBlocked ? cell.inheritedRoom : cell.room)
        : "";

      if (effectiveClassId === classId && effectiveRoom && !fallbackRoom) {
        fallbackRoom = effectiveRoom;
      }

      if (effectiveClassId === classId && effectiveRoom && currentMinutes >= starts && currentMinutes <= ends) {
        fallbackRoom = effectiveRoom;
      }
    });

    return fallbackRoom || this.getRoomsForClass(classId)[0] || "";
  }

  getLiveRoomForClass(classId, date) {
    const effectiveDate = date || this.getReferenceDate();
    const currentLessonUnit = this.getCurrentLessonForClass(classId, effectiveDate);
    const weekday = getCurrentWeekdayIndex(effectiveDate);
    const currentMinutes = (effectiveDate.getHours() * 60) + effectiveDate.getMinutes();
    const matchingLessons = this.getScheduledLessons(effectiveDate)
      .filter(function (lesson) {
        if (lesson.classId !== classId || !lesson.room) {
          return false;
        }

        if (lesson.weekday < weekday) {
          return true;
        }

        return lesson.weekday === weekday && timeToMinutes(lesson.startTime) <= currentMinutes;
      })
      .sort(function (left, right) {
        if (left.weekday !== right.weekday) {
          return right.weekday - left.weekday;
        }

        return timeToMinutes(right.startTime) - timeToMinutes(left.startTime);
      });

    if (currentLessonUnit && currentLessonUnit.room) {
      return currentLessonUnit.room;
    }

    return matchingLessons[0] ? matchingLessons[0].room : this.getRelevantRoomForClass(classId, effectiveDate);
  }

  getAllSeatPlans() {
    return (this.snapshot.seatPlans || []).map(normalizeSeatPlan).sort(function (left, right) {
      return compareDateValues(right.validFrom, left.validFrom);
    });
  }

  getSeatPlansForClass(classId) {
    return this.getAllSeatPlans().filter(function (seatPlan) {
      return seatPlan.classId === classId;
    });
  }

  getSeatPlansForClassAndRoom(classId, room) {
    return this.getSeatPlansForClass(classId).filter(function (seatPlan) {
      return (seatPlan.room || "") === (room || "");
    });
  }

  getCurrentSeatPlan(classId, room, date) {
    const effectiveDate = date || this.getReferenceDate();
    const todayValue = getLocalDateValue(effectiveDate);
    const seatPlans = this.getSeatPlansForClassAndRoom(classId, room);
    const matchingSeatPlans = seatPlans.filter(function (seatPlan) {
      const validFrom = normalizeDateValue(seatPlan.validFrom);
      const validTo = normalizeDateValue(seatPlan.validTo);
      const startsBefore = !validFrom || compareDateValues(validFrom, todayValue) <= 0;
      const endsAfter = !validTo || compareDateValues(validTo, todayValue) >= 0;

      return startsBefore && endsAfter;
    }).sort(function (left, right) {
      return compareDateValues(right.validFrom, left.validFrom);
    });
    const futureSeatPlans = seatPlans.filter(function (seatPlan) {
      const validFrom = normalizeDateValue(seatPlan.validFrom);

      return validFrom && compareDateValues(validFrom, todayValue) > 0;
    }).sort(function (left, right) {
      return compareDateValues(left.validFrom, right.validFrom);
    });
    const pastSeatPlans = seatPlans.filter(function (seatPlan) {
      const validTo = normalizeDateValue(seatPlan.validTo);

      return validTo && compareDateValues(validTo, todayValue) < 0;
    }).sort(function (left, right) {
      return compareDateValues(right.validTo, left.validTo);
    });

    return matchingSeatPlans[0] || futureSeatPlans[0] || pastSeatPlans[0] || seatPlans[0] || null;
  }

  getManagedSeatPlan(classId, room) {
    if (this.snapshot.activeSeatPlanId) {
      const activeSeatPlan = this.getAllSeatPlans().find(function (seatPlan) {
        return seatPlan.id === String(this.snapshot.activeSeatPlanId || "");
      }, this);

      if (activeSeatPlan && activeSeatPlan.classId === classId && activeSeatPlan.room === (room || "")) {
        return activeSeatPlan;
      }
    }

    return this.getCurrentSeatPlan(classId, room, this.getReferenceDate());
  }

  getAllSeatOrders() {
    return (this.snapshot.seatOrders || []).map(normalizeSeatOrder).sort(function (left, right) {
      return compareDateValues(right.validFrom, left.validFrom);
    });
  }

  getSeatOrdersForClass(classId) {
    return this.getAllSeatOrders().filter(function (seatOrder) {
      return seatOrder.classId === classId;
    });
  }

  getSeatOrdersForClassAndRoom(classId, room) {
    return this.getSeatOrdersForClass(classId).filter(function (seatOrder) {
      return (seatOrder.room || "") === (room || "");
    });
  }

  getCurrentSeatOrder(classId, room, date) {
    const effectiveDate = date || this.getReferenceDate();
    const todayValue = getLocalDateValue(effectiveDate);
    const seatOrders = this.getSeatOrdersForClassAndRoom(classId, room);
    const matchingSeatOrders = seatOrders.filter(function (seatOrder) {
      const validFrom = normalizeDateValue(seatOrder.validFrom);
      const validTo = normalizeDateValue(seatOrder.validTo);
      const startsBefore = !validFrom || compareDateValues(validFrom, todayValue) <= 0;
      const endsAfter = !validTo || compareDateValues(validTo, todayValue) >= 0;

      return startsBefore && endsAfter;
    }).sort(function (left, right) {
      return compareDateValues(right.validFrom, left.validFrom);
    });
    const futureSeatOrders = seatOrders.filter(function (seatOrder) {
      const validFrom = normalizeDateValue(seatOrder.validFrom);

      return validFrom && compareDateValues(validFrom, todayValue) > 0;
    }).sort(function (left, right) {
      return compareDateValues(left.validFrom, right.validFrom);
    });
    const pastSeatOrders = seatOrders.filter(function (seatOrder) {
      const validTo = normalizeDateValue(seatOrder.validTo);

      return validTo && compareDateValues(validTo, todayValue) < 0;
    }).sort(function (left, right) {
      return compareDateValues(right.validTo, left.validTo);
    });

    return matchingSeatOrders[0] || futureSeatOrders[0] || pastSeatOrders[0] || seatOrders[0] || null;
  }

  getManagedSeatOrder(classId, room) {
    if (this.snapshot.activeSeatOrderId) {
      const activeSeatOrder = this.getAllSeatOrders().find(function (seatOrder) {
        return seatOrder.id === String(this.snapshot.activeSeatOrderId || "");
      }, this);

      if (activeSeatOrder && activeSeatOrder.classId === classId && activeSeatOrder.room === (room || "")) {
        return activeSeatOrder;
      }
    }

    return this.getCurrentSeatOrder(classId, room, this.getReferenceDate());
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

  getCurrentLessonForClass(classId, date) {
    const effectiveDate = date || this.getReferenceDate();
    const currentMinutes = (effectiveDate.getHours() * 60) + effectiveDate.getMinutes();

    return this.getLessonUnitsForClass(classId, effectiveDate).find(function (lessonUnit) {
      const starts = timeToMinutes(lessonUnit.startTime);
      const ends = timeToMinutes(lessonUnit.endTime);

      return currentMinutes >= starts && currentMinutes <= ends;
    }) || null;
  }

  getRelevantLessonForClass(classId, date) {
    const effectiveDate = date || this.getReferenceDate();
    const weekday = getCurrentWeekdayIndex(effectiveDate);
    const currentMinutes = (effectiveDate.getHours() * 60) + effectiveDate.getMinutes();
    const classLessons = this.getLessonUnitsForClass(classId, effectiveDate);
    const currentLesson = classLessons.find(function (lesson) {
      const starts = timeToMinutes(lesson.startTime);
      const ends = timeToMinutes(lesson.endTime);
      return lesson.weekday === weekday && currentMinutes >= starts && currentMinutes <= ends;
    });

    if (currentLesson) {
      return currentLesson;
    }

    const startedLessons = classLessons
      .filter(function (lesson) {
        return lesson.weekday === weekday && timeToMinutes(lesson.startTime) <= currentMinutes;
      })
      .sort(function (left, right) {
        return timeToMinutes(right.startTime) - timeToMinutes(left.startTime);
      });
    const upcomingLessons = classLessons
      .filter(function (lesson) {
        return lesson.weekday === weekday && timeToMinutes(lesson.startTime) > currentMinutes;
      })
      .sort(function (left, right) {
        return timeToMinutes(left.startTime) - timeToMinutes(right.startTime);
      });
    const pastLessons = classLessons
      .filter(function (lesson) {
        return lesson.weekday < weekday;
      })
      .sort(function (left, right) {
        if (left.weekday !== right.weekday) {
          return right.weekday - left.weekday;
        }

        return timeToMinutes(right.startTime) - timeToMinutes(left.startTime);
      });
    const futureLessons = classLessons
      .filter(function (lesson) {
        return lesson.weekday > weekday;
      })
      .sort(function (left, right) {
        if (left.weekday !== right.weekday) {
          return left.weekday - right.weekday;
        }

        return timeToMinutes(left.startTime) - timeToMinutes(right.startTime);
      });

    return startedLessons[0] || upcomingLessons[0] || pastLessons[0] || futureLessons[0] || null;
  }

  getLessonUnitsForClass(classId, date) {
    const effectiveDate = date || this.getReferenceDate();
    const weekdayKey = String(getCurrentWeekdayIndex(effectiveDate));
    const currentTimetable = this.getCurrentTimetable(effectiveDate);
    const activeClass = this.getClassById(classId);
    const unitsBySourceRowId = {};

    if (!currentTimetable) {
      return [];
    }

    this.getTimetableRows(currentTimetable).forEach(function (row) {
      const cell = row.cells[weekdayKey] || normalizeDayEntry();
      const effectiveClassId = row.type === "lesson"
        ? (cell.isBlocked ? cell.inheritedClassId : cell.classId)
        : (cell.isBlocked ? cell.inheritedClassId : "");
      const effectiveRoom = row.type === "lesson"
        ? (cell.isBlocked ? cell.inheritedRoom : cell.room)
        : (cell.isBlocked ? cell.inheritedRoom : "");
      const sourceRowId = cell.isBlocked ? (cell.sourceRowId || row.id) : (row.type === "lesson" ? row.id : "");
      let lessonUnit;

      if (effectiveClassId !== classId || !sourceRowId) {
        return;
      }

      lessonUnit = unitsBySourceRowId[sourceRowId];

      if (!lessonUnit) {
        lessonUnit = {
          id: "timetable-" + weekdayKey + "-" + sourceRowId,
          sourceRowId: sourceRowId,
          classId: classId,
          subject: activeClass ? (activeClass.subject || "") : "",
          room: effectiveRoom || (activeClass ? (activeClass.room || "") : ""),
          weekday: Number(weekdayKey),
          startTime: row.startTime,
          endTime: row.endTime,
          topic: ""
        };
        unitsBySourceRowId[sourceRowId] = lessonUnit;
      } else {
        lessonUnit.endTime = row.endTime;
        if (!lessonUnit.room && effectiveRoom) {
          lessonUnit.room = effectiveRoom;
        }
      }
    });

    return Object.keys(unitsBySourceRowId).map(function (sourceRowId) {
      return unitsBySourceRowId[sourceRowId];
    }).sort(function (left, right) {
      if (left.weekday !== right.weekday) {
        return left.weekday - right.weekday;
      }

      return timeToMinutes(left.startTime) - timeToMinutes(right.startTime);
    });
  }

  getAllAttendanceRecords() {
    return (this.snapshot.attendanceRecords || []).map(normalizeAttendanceRecord);
  }

  getAllHomeworkRecords() {
    return (this.snapshot.homeworkRecords || []).map(normalizeHomeworkRecord);
  }

  getAllWarningRecords() {
    return (this.snapshot.warningRecords || []).map(normalizeWarningRecord);
  }

  getAllKnowledgeGapRecords() {
    return (this.snapshot.knowledgeGapRecords || []).map(normalizeKnowledgeGapRecord);
  }

  getAllMathObservationRecords() {
    return (this.snapshot.mathObservationRecords || []).map(normalizeMathObservationRecord);
  }

  getAttendanceRecordsForLessonOccurrence(classId, lessonId, lessonDate, studentId) {
    return this.getAllAttendanceRecords().filter(function (record) {
      const matchesClass = record.classId === classId;
      const matchesLesson = record.lessonId === lessonId;
      const matchesDate = normalizeDateValue(record.lessonDate) === normalizeDateValue(lessonDate);
      const matchesStudent = !studentId || record.studentId === studentId;

      return matchesClass && matchesLesson && matchesDate && matchesStudent;
    }).sort(function (left, right) {
      const leftKey = String(left.effectiveAt || left.recordedAt || "");
      const rightKey = String(right.effectiveAt || right.recordedAt || "");

      if (leftKey === rightKey) {
        return String(left.id || "").localeCompare(String(right.id || ""));
      }

      return leftKey.localeCompare(rightKey);
    });
  }

  getAttendanceContextForClass(classId, date) {
    const effectiveDate = date || this.getReferenceDate();
    const lesson = this.getCurrentLessonForClass(classId, effectiveDate);
    const lessonDate = getLocalDateValue(effectiveDate);
    const room = this.getRelevantRoomForClass(classId, effectiveDate) || "";

    if (!lesson) {
      return null;
    }

    return {
      id: lesson.id,
      classId: classId,
      lessonDate: lessonDate,
      room: lesson.room || room || "",
      startTime: lesson.startTime || "",
      isFallback: false
    };
  }

  getAttendanceStateForStudent(studentId, classId, date) {
    const effectiveDate = date || this.getReferenceDate();
    const context = this.getAttendanceContextForClass(classId, effectiveDate);
    let records;

    if (!context) {
      return "present";
    }

    records = this.getAttendanceRecordsForLessonOccurrence(classId, context.id, context.lessonDate, studentId);
    return records.length && records[records.length - 1].status === "absent" ? "absent" : "present";
  }

  getHomeworkRecordsForLessonOccurrence(classId, lessonId, lessonDate, studentId) {
    return this.getAllHomeworkRecords().filter(function (record) {
      const matchesClass = record.classId === classId;
      const matchesLesson = record.lessonId === lessonId;
      const matchesDate = normalizeDateValue(record.lessonDate) === normalizeDateValue(lessonDate);
      const matchesStudent = !studentId || record.studentId === studentId;

      return matchesClass && matchesLesson && matchesDate && matchesStudent;
    }).sort(function (left, right) {
      return String(left.recordedAt || "").localeCompare(String(right.recordedAt || ""));
    });
  }

  getWarningRecordsForLessonOccurrence(classId, lessonId, lessonDate, studentId) {
    return this.getAllWarningRecords().filter(function (record) {
      const matchesClass = record.classId === classId;
      const matchesLesson = record.lessonId === lessonId;
      const matchesDate = normalizeDateValue(record.lessonDate) === normalizeDateValue(lessonDate);
      const matchesStudent = !studentId || record.studentId === studentId;

      return matchesClass && matchesLesson && matchesDate && matchesStudent;
    }).sort(function (left, right) {
      return String(left.recordedAt || "").localeCompare(String(right.recordedAt || ""));
    });
  }

  getMathObservationRecordsForLessonOccurrence(classId, lessonId, lessonDate, studentId) {
    return this.getAllMathObservationRecords().filter(function (record) {
      const matchesClass = record.classId === classId;
      const matchesLesson = record.lessonId === lessonId;
      const matchesDate = normalizeDateValue(record.lessonDate) === normalizeDateValue(lessonDate);
      const matchesStudent = !studentId || record.studentId === studentId;

      return matchesClass && matchesLesson && matchesDate && matchesStudent;
    }).sort(function (left, right) {
      return String(left.recordedAt || "").localeCompare(String(right.recordedAt || ""));
    });
  }

  getHomeworkStateForStudent(studentId, classId, date) {
    const effectiveDate = date || this.getReferenceDate();
    const context = this.getAttendanceContextForClass(classId, effectiveDate);
    const records = context
      ? this.getHomeworkRecordsForLessonOccurrence(classId, context.id, context.lessonDate, studentId)
      : [];

    if (!context) {
      return "vorhanden";
    }

    return records.length
      ? String(records[records.length - 1].quality || "fehlt")
      : "vorhanden";
  }

  getWarningCountForStudent(studentId, classId, date) {
    const effectiveDate = date || this.getReferenceDate();
    const context = this.getAttendanceContextForClass(classId, effectiveDate);

    if (!context) {
      return 0;
    }

    return this.getWarningRecordsForLessonOccurrence(classId, context.id, context.lessonDate, studentId).length;
  }

  getMathObservationCountForStudent(studentId, classId, date) {
    const effectiveDate = date || this.getReferenceDate();
    const context = this.getAttendanceContextForClass(classId, effectiveDate);

    if (!studentId || !context) {
      return 0;
    }

    return this.getMathObservationRecordsForLessonOccurrence(classId, context.id, context.lessonDate, studentId).length;
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

  getAssessmentStatusForStudent(studentId, classId, date) {
    const effectiveDate = date || this.getReferenceDate();
    const context = this.getAttendanceContextForClass(classId, effectiveDate);
    const assessments = this.getAssessmentsForClass(classId).filter(function (assessment) {
      return assessment.studentId === studentId;
    });
    const currentCount = context
      ? assessments.filter(function (assessment) {
        return String(assessment.lessonId || "") === String(context.id || "")
          && normalizeDateValue(assessment.lessonDate || assessment.date) === normalizeDateValue(context.lessonDate);
      }).length
      : 0;
    const lastAssessment = assessments
      .slice()
      .sort(function (left, right) {
        return String(right.recordedAt || right.lessonDate || right.date || "")
          .localeCompare(String(left.recordedAt || left.lessonDate || left.date || ""));
      })[0] || null;
    let isOlderThanFourteenDays = true;
    let lastDate = null;

    if (lastAssessment) {
      lastDate = new Date(String(lastAssessment.recordedAt || lastAssessment.lessonDate || lastAssessment.date || "").slice(0, 10) + "T00:00");
      if (!Number.isNaN(lastDate.getTime())) {
        isOlderThanFourteenDays = (effectiveDate.getTime() - lastDate.getTime()) > (14 * 24 * 60 * 60 * 1000);
      }
    }

    return {
      currentCount: currentCount,
      hasCurrentAssessment: currentCount > 0,
      isOlderThanFourteenDays: isOlderThanFourteenDays,
      hasAnyAssessment: Boolean(lastAssessment)
    };
  }

  getAssessmentCountForStudent(studentId, classId, date) {
    if (!studentId) {
      return 0;
    }

    return this.getAssessmentStatusForStudent(studentId, classId, date).currentCount;
  }

  getRecentEvidenceCountsForClass(classId, date, days) {
    const effectiveDate = date || this.getReferenceDate();
    const thresholdDays = Number(days) || 14;
    const endDateValue = getLocalDateValue(effectiveDate);
    const startDate = new Date(effectiveDate);
    const countsByStudentId = {};
    let startValue;

    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - thresholdDays);
    startValue = getLocalDateValue(startDate);

    function getRecordDateValue(record) {
      return normalizeDateValue(record && (record.recordedAt || record.lessonDate || record.date));
    }

    function isInWindow(record) {
      const recordDate = getRecordDateValue(record);

      return Boolean(recordDate) && compareDateValues(recordDate, startValue) >= 0 && compareDateValues(recordDate, endDateValue) <= 0;
    }

    this.getStudentsForClass(classId).forEach(function (student) {
      countsByStudentId[student.id] = 0;
    });

    this.getAssessmentsForClass(classId).forEach(function (assessment) {
      const isUnterrichtAssessment = String(assessment && assessment.type || "").trim() === "unterricht"
        || Boolean(String(assessment && assessment.lessonId || "").trim());

      if (isUnterrichtAssessment && countsByStudentId[assessment.studentId] !== undefined && isInWindow(assessment)) {
        countsByStudentId[assessment.studentId] += 1;
      }
    });

    this.getAllMathObservationRecords().forEach(function (record) {
      if (record.classId === classId && countsByStudentId[record.studentId] !== undefined && isInWindow(record)) {
        countsByStudentId[record.studentId] += 1;
      }
    });

    return countsByStudentId;
  }

  getLowEvidenceStudentIdsForClass(classId, date, limit, days) {
    const countsByStudentId = this.getRecentEvidenceCountsForClass(classId, date, days);
    const effectiveLimit = Math.max(0, Number(limit) || 5);

    if (!classId || !effectiveLimit) {
      return [];
    }

    return this.getStudentsForClass(classId)
      .map(function (student, index) {
        return {
          studentId: student.id,
          count: Number(countsByStudentId[student.id]) || 0,
          index: index
        };
      })
      .sort(function (left, right) {
        if (left.count !== right.count) {
          return left.count - right.count;
        }

        return left.index - right.index;
      })
      .slice(0, effectiveLimit)
      .map(function (entry) {
        return entry.studentId;
      });
  }

  isLastAssessmentOlderThanDays(studentId, classId, date, days) {
    const effectiveDate = date || this.getReferenceDate();
    const thresholdDays = Number(days) || 14;
    const lastAssessment = this.getAssessmentsForClass(classId)
      .filter(function (assessment) {
        return assessment.studentId === studentId;
      })
      .sort(function (left, right) {
        return String(right.lessonDate || right.date || "").localeCompare(String(left.lessonDate || left.date || ""));
      })[0] || null;
    let lastDate;

    if (!lastAssessment) {
      return true;
    }

    lastDate = new Date(String(lastAssessment.lessonDate || lastAssessment.date || "").slice(0, 10) + "T00:00");

    if (Number.isNaN(lastDate.getTime())) {
      return true;
    }

    return (effectiveDate.getTime() - lastDate.getTime()) > (thresholdDays * 24 * 60 * 60 * 1000);
  }

  getSeatPlanForClass(classId) {
    const room = (this.snapshot.activeDateTimeMode || "live") === "live"
      ? this.getLiveRoomForClass(classId, this.getReferenceDate())
      : (this.snapshot.activeSeatPlanRoom || this.getRelevantRoomForClass(classId, this.getReferenceDate()) || "");

    return this.getCurrentSeatPlan(classId, room, this.getReferenceDate());
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
      const maxScore = Number(assessment && assessment.maxScore) || 0;
      const score = Number(assessment && assessment.score) || 0;
      return total + (maxScore ? Math.round((score / maxScore) * 100) : 0);
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

window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.domain = window.Unterrichtsassistent.domain || {};

function createDomainSnapshot(rawData) {
  const {
    Assessment,
    Lesson,
    SchoolClass,
    SeatPlan,
    Student,
    Timetable,
    TodoItem
  } = window.Unterrichtsassistent.domain;

  return {
    activeClassId: rawData.activeClassId || (rawData.classes[0] ? rawData.classes[0].id : null),
    timetable: new Timetable(rawData.timetable || {}),
    students: rawData.students.map((item) => new Student(item)),
    classes: rawData.classes.map((item) => new SchoolClass(item)),
    lessons: rawData.lessons.map((item) => new Lesson(item)),
    assessments: rawData.assessments.map((item) => new Assessment(item)),
    todos: rawData.todos.map((item) => new TodoItem(item)),
    seatPlans: rawData.seatPlans.map((item) => new SeatPlan(item))
  };
}

function serializeDomainSnapshot(snapshot) {
  function cloneItems(items, keys) {
    return items.map(function (item) {
      const plainItem = {};
      var index;

      for (index = 0; index < keys.length; index += 1) {
        plainItem[keys[index]] = item[keys[index]];
      }

      return plainItem;
    });
  }

  function cloneTimetable(timetable) {
    const source = timetable || {};
    const rows = Array.isArray(source.rows) ? source.rows : [];

    return {
      startTime: source.startTime || "07:50",
      rows: rows.map(function (row) {
        const rowDays = row.days || {};
        const nextDays = {};

        ["1", "2", "3", "4", "5"].forEach(function (weekday) {
          const dayEntry = rowDays[weekday] || {};
          nextDays[weekday] = {
            classId: dayEntry.classId || "",
            room: dayEntry.room || "",
            isDouble: Boolean(dayEntry.isDouble)
          };
        });

        return {
          id: row.id,
          type: row.type === "pause" ? "pause" : "lesson",
          durationMinutes: Number(row.durationMinutes) || (row.type === "pause" ? 5 : 45),
          days: nextDays
        };
      })
    };
  }

  return {
    activeClassId: snapshot.activeClassId || null,
    timetable: cloneTimetable(snapshot.timetable),
    students: cloneItems(snapshot.students, ["id", "firstName", "lastName", "className", "gender", "strengths", "gaps", "attendanceRate"]),
    classes: cloneItems(snapshot.classes, ["id", "name", "room", "subject", "studentIds", "displayColor"]),
    lessons: cloneItems(snapshot.lessons, ["id", "classId", "subject", "room", "weekday", "startTime", "endTime", "topic"]),
    assessments: cloneItems(snapshot.assessments, ["id", "studentId", "classId", "type", "score", "maxScore", "date"]),
    todos: cloneItems(snapshot.todos, ["id", "title", "dueDate", "relatedClassId", "done"]),
    seatPlans: cloneItems(snapshot.seatPlans, ["id", "classId", "updatedAt", "seats"])
  };
}

window.Unterrichtsassistent.domain.createDomainSnapshot = createDomainSnapshot;
window.Unterrichtsassistent.domain.serializeDomainSnapshot = serializeDomainSnapshot;

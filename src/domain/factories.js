window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.domain = window.Unterrichtsassistent.domain || {};

function createDomainSnapshot(rawData) {
  const {
    Assessment,
    AttendanceRecord,
    CurriculumLessonPlan,
    CurriculumLessonPhase,
    CurriculumLessonPhaseStatus,
    CurriculumLessonStep,
    CurriculumSequence,
    CurriculumSeries,
    HomeworkRecord,
    Lesson,
    PlanningCategory,
    PlanningEvent,
    PlanningInstructionLessonStatus,
    SchoolClass,
    SeatOrder,
    SeatPlan,
    Student,
    Timetable,
    TodoItem,
    WarningRecord
  } = window.Unterrichtsassistent.domain;

  function normalizeTimetables(rawSnapshot) {
    const rawTimetables = Array.isArray(rawSnapshot.timetables)
      ? rawSnapshot.timetables
      : (rawSnapshot.timetable ? [Object.assign({ id: "timetable-default", validFrom: "", validTo: "" }, rawSnapshot.timetable)] : []);

    return rawTimetables.map(function (item, index) {
      return new Timetable(Object.assign({
        id: item.id || ("timetable-" + String(index + 1)),
        validFrom: item.validFrom || "",
        validTo: item.validTo || ""
      }, item));
    });
  }

  const timetables = normalizeTimetables(rawData);

  return {
    activeClassId: rawData.activeClassId || (rawData.classes[0] ? rawData.classes[0].id : null),
    activeTimetableId: rawData.activeTimetableId || (timetables[0] ? timetables[0].id : null),
    activeSeatPlanId: rawData.activeSeatPlanId || null,
    activeSeatOrderId: rawData.activeSeatOrderId || null,
    activeSeatPlanRoom: rawData.activeSeatPlanRoom || "",
    activeDateTime: rawData.activeDateTime || "",
    activeDateTimeMode: rawData.activeDateTimeMode || "live",
    schoolYearStart: rawData.schoolYearStart || "",
    schoolHalfYearStart: rawData.schoolHalfYearStart || "",
    schoolYearEnd: rawData.schoolYearEnd || "",
    hidePastPlanningMonths: rawData.hidePastPlanningMonths !== false,
    autoApplyCalculatedCurriculumHourDemands: rawData.autoApplyCalculatedCurriculumHourDemands === true,
    timetables: timetables,
    students: rawData.students.map((item) => new Student(item)),
    classes: rawData.classes.map((item) => new SchoolClass(item)),
    lessons: rawData.lessons.map((item) => new Lesson(item)),
    assessments: rawData.assessments.map((item) => new Assessment(item)),
    attendanceRecords: (Array.isArray(rawData.attendanceRecords) ? rawData.attendanceRecords : []).map((item) => new AttendanceRecord(item)),
    homeworkRecords: (Array.isArray(rawData.homeworkRecords) ? rawData.homeworkRecords : []).map((item) => new HomeworkRecord(item)),
    warningRecords: (Array.isArray(rawData.warningRecords) ? rawData.warningRecords : []).map((item) => new WarningRecord(item)),
    todos: rawData.todos.map((item) => new TodoItem(item)),
    seatPlans: rawData.seatPlans.map((item) => new SeatPlan(item)),
    planningEvents: (Array.isArray(rawData.planningEvents) ? rawData.planningEvents : []).map((item) => new PlanningEvent(item)),
    planningCategories: (Array.isArray(rawData.planningCategories) ? rawData.planningCategories : []).map((item) => new PlanningCategory(item)),
    planningInstructionLessonStatuses: (Array.isArray(rawData.planningInstructionLessonStatuses) ? rawData.planningInstructionLessonStatuses : []).map((item) => new PlanningInstructionLessonStatus(item)),
    curriculumSeries: (Array.isArray(rawData.curriculumSeries) ? rawData.curriculumSeries : []).map((item) => new CurriculumSeries(item)),
    curriculumSequences: (Array.isArray(rawData.curriculumSequences) ? rawData.curriculumSequences : []).map((item) => new CurriculumSequence(item)),
    curriculumLessonPlans: (Array.isArray(rawData.curriculumLessonPlans) ? rawData.curriculumLessonPlans : []).map((item) => new CurriculumLessonPlan(item)),
    curriculumLessonPhases: (Array.isArray(rawData.curriculumLessonPhases) ? rawData.curriculumLessonPhases : []).map((item) => new CurriculumLessonPhase(item)),
    curriculumLessonSteps: (Array.isArray(rawData.curriculumLessonSteps) ? rawData.curriculumLessonSteps : []).map((item) => new CurriculumLessonStep(item)),
    curriculumLessonPhaseStatuses: (Array.isArray(rawData.curriculumLessonPhaseStatuses) ? rawData.curriculumLessonPhaseStatuses : []).map((item) => new CurriculumLessonPhaseStatus(item)),
    seatOrders: (Array.isArray(rawData.seatOrders) ? rawData.seatOrders : rawData.seatPlans.map(function (item) {
      return {
        id: (item && item.id ? String(item.id) : "seat-order") + "-order",
        classId: item && item.classId ? item.classId : "",
        room: item && item.room ? item.room : "",
        validFrom: item && item.validFrom ? item.validFrom : "",
        validTo: item && item.validTo ? item.validTo : "",
        updatedAt: item && item.updatedAt ? item.updatedAt : "",
        seats: Array.isArray(item && item.seats) ? item.seats : []
      };
    })).map((item) => new SeatOrder(item))
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
      id: source.id || "",
      validFrom: source.validFrom || "",
      validTo: source.validTo || "",
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
    activeTimetableId: snapshot.activeTimetableId || (snapshot.timetables && snapshot.timetables[0] ? snapshot.timetables[0].id : null),
    activeSeatPlanId: snapshot.activeSeatPlanId || null,
    activeSeatOrderId: snapshot.activeSeatOrderId || null,
    activeSeatPlanRoom: snapshot.activeSeatPlanRoom || "",
    activeDateTime: snapshot.activeDateTime || "",
    activeDateTimeMode: snapshot.activeDateTimeMode || "live",
    schoolYearStart: snapshot.schoolYearStart || "",
    schoolHalfYearStart: snapshot.schoolHalfYearStart || "",
    schoolYearEnd: snapshot.schoolYearEnd || "",
    hidePastPlanningMonths: snapshot.hidePastPlanningMonths !== false,
    autoApplyCalculatedCurriculumHourDemands: snapshot.autoApplyCalculatedCurriculumHourDemands === true,
    timetables: (snapshot.timetables || []).map(cloneTimetable),
    students: cloneItems(snapshot.students, ["id", "firstName", "lastName", "className", "gender", "strengths", "gaps", "attendanceRate"]),
    classes: cloneItems(snapshot.classes, ["id", "name", "room", "subject", "studentIds", "displayColor"]),
    lessons: cloneItems(snapshot.lessons, ["id", "classId", "subject", "room", "weekday", "startTime", "endTime", "topic"]),
    assessments: cloneItems(snapshot.assessments, ["id", "studentId", "classId", "type", "score", "maxScore", "date", "lessonId", "lessonDate", "room", "recordedAt", "category", "afb1", "afb2", "afb3", "workBehavior", "socialBehavior", "knowledgeGap", "note"]),
    attendanceRecords: cloneItems(snapshot.attendanceRecords || [], ["id", "studentId", "classId", "lessonId", "lessonDate", "room", "status", "recordedAt", "effectiveAt"]),
    homeworkRecords: cloneItems(snapshot.homeworkRecords || [], ["id", "studentId", "classId", "lessonId", "lessonDate", "room", "recordedAt", "quality"]),
    warningRecords: cloneItems(snapshot.warningRecords || [], ["id", "studentId", "classId", "lessonId", "lessonDate", "room", "recordedAt", "category", "note"]),
    todos: cloneItems(snapshot.todos, ["id", "title", "dueDate", "relatedClassId", "done"]),
    seatPlans: cloneItems(snapshot.seatPlans, ["id", "classId", "room", "validFrom", "validTo", "updatedAt", "seats", "deskLayoutItems", "deskLayoutLinks", "roomWindowSide", "roomWidth", "roomHeight"]),
    planningEvents: cloneItems(snapshot.planningEvents || [], ["id", "title", "startDate", "endDate", "startTime", "endTime", "category", "description", "priority"]),
    planningCategories: cloneItems(snapshot.planningCategories || [], ["id", "name", "color"]),
    planningInstructionLessonStatuses: cloneItems(snapshot.planningInstructionLessonStatuses || [], ["id", "classId", "lessonDate", "isCancelled", "cancelReason"]),
    curriculumSeries: cloneItems(snapshot.curriculumSeries || [], ["id", "classId", "topic", "hourDemand", "color", "startMode", "startDate", "nextSeriesId"]),
    curriculumSequences: cloneItems(snapshot.curriculumSequences || [], ["id", "seriesId", "topic", "hourDemand", "nextSequenceId"]),
    curriculumLessonPlans: cloneItems(snapshot.curriculumLessonPlans || [], ["id", "sequenceId", "topic", "hourType", "nextLessonId"]),
    curriculumLessonPhases: cloneItems(snapshot.curriculumLessonPhases || [], ["id", "lessonPlanId", "title", "durationMinutes", "isReserve", "nextPhaseId"]),
    curriculumLessonSteps: cloneItems(snapshot.curriculumLessonSteps || [], ["id", "phaseId", "title", "content", "socialForm", "material", "nextStepId"]),
    curriculumLessonPhaseStatuses: cloneItems(snapshot.curriculumLessonPhaseStatuses || [], ["id", "classId", "lessonDate", "lessonPlanId", "phaseId", "isCompleted", "elapsedMinutes", "resumeStartMinutes"]),
    seatOrders: cloneItems(snapshot.seatOrders || [], ["id", "classId", "room", "validFrom", "validTo", "updatedAt", "seats"])
  };
}

window.Unterrichtsassistent.domain.createDomainSnapshot = createDomainSnapshot;
window.Unterrichtsassistent.domain.serializeDomainSnapshot = serializeDomainSnapshot;

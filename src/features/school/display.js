(function () {
  window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  window.Unterrichtsassistent.features = window.Unterrichtsassistent.features || {};
  window.Unterrichtsassistent.features.school = window.Unterrichtsassistent.features.school || {};

  function getClassDisplayName(schoolClass) {
    return [String(schoolClass && schoolClass.name || "").trim(), String(schoolClass && schoolClass.subject || "").trim()]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  function getClassDisplayColor(schoolClass, options) {
    const createPastelColor = options && typeof options.createPastelColor === "function"
      ? options.createPastelColor
      : null;

    if (!schoolClass) {
      return "#d9d4cb";
    }

    if (schoolClass.displayColor) {
      return schoolClass.displayColor;
    }

    if (createPastelColor) {
      return createPastelColor((schoolClass.name || "") + "::" + (schoolClass.subject || "") + "::" + (schoolClass.id || ""));
    }

    return "#d9d4cb";
  }

  function getClassById(snapshot, classId) {
    const classes = snapshot && Array.isArray(snapshot.classes)
      ? snapshot.classes
      : [];

    return classes.find(function (entry) {
      return String(entry && entry.id || "").trim() === String(classId || "").trim();
    }) || null;
  }

  function getClassSubjectById(snapshot, classId) {
    const schoolClass = getClassById(snapshot, classId);
    return schoolClass ? String(schoolClass.subject || "").trim() : "";
  }

  function getStudentDisplayName(student) {
    const firstName = String(student && student.firstName || "").trim();
    const lastName = String(student && student.lastName || "").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    return fullName || String(student && student.className || "").trim() || "Unbekannt";
  }

  function getStudentFirstNameSortValue(student) {
    return String(student && student.firstName || "").trim().toLowerCase();
  }

  function getStudentLastNameSortValue(student) {
    return String(student && student.lastName || "").trim().toLowerCase();
  }

  function getStudentCompactDisplayName(student, classStudents) {
    const firstName = String(student && student.firstName || "").trim();
    const lastName = String(student && student.lastName || "").trim();
    const normalizedFirstName = firstName.toLowerCase();
    const studentsInClass = Array.isArray(classStudents) ? classStudents : [];
    const hasDuplicateFirstName = Boolean(normalizedFirstName) && studentsInClass.some(function (entry) {
      return entry !== student
        && String(entry && entry.firstName || "").trim().toLowerCase() === normalizedFirstName;
    });

    if (firstName) {
      return hasDuplicateFirstName && lastName
        ? firstName + " " + lastName.charAt(0).toUpperCase() + "."
        : firstName;
    }

    return lastName || "Unbekannt";
  }

  function getTodoCategoryClassInfo(snapshot, categoryName) {
    const sourceSnapshot = snapshot || {};
    const normalizedCategory = String(categoryName || "").trim().toLowerCase();
    const classes = Array.isArray(sourceSnapshot.classes) ? sourceSnapshot.classes : [];
    const students = Array.isArray(sourceSnapshot.students) ? sourceSnapshot.students : [];
    const classEntry = classes.find(function (entry) {
      return getClassDisplayName(entry).toLowerCase() === normalizedCategory;
    }) || null;
    const studentIds = classEntry && Array.isArray(classEntry.studentIds)
      ? classEntry.studentIds.map(function (studentId) {
          return String(studentId || "").trim();
        }).filter(Boolean)
      : [];
    const classStudents = studentIds.map(function (studentId) {
      return students.find(function (student) {
        return String(student && student.id || "").trim() === studentId;
      }) || null;
    }).filter(Boolean).sort(function (left, right) {
      const firstNameComparison = getStudentFirstNameSortValue(left).localeCompare(getStudentFirstNameSortValue(right), "de", { sensitivity: "base" });

      if (firstNameComparison !== 0) {
        return firstNameComparison;
      }

      return getStudentLastNameSortValue(left).localeCompare(getStudentLastNameSortValue(right), "de", { sensitivity: "base" });
    });

    return {
      isClassCategory: Boolean(classEntry),
      classEntry: classEntry,
      classId: String(classEntry && classEntry.id || "").trim(),
      students: classStudents
    };
  }

  window.Unterrichtsassistent.features.school.display = {
    getClassDisplayName: getClassDisplayName,
    getClassDisplayColor: getClassDisplayColor,
    getClassById: getClassById,
    getClassSubjectById: getClassSubjectById,
    getStudentDisplayName: getStudentDisplayName,
    getStudentFirstNameSortValue: getStudentFirstNameSortValue,
    getStudentLastNameSortValue: getStudentLastNameSortValue,
    getStudentCompactDisplayName: getStudentCompactDisplayName,
    getTodoCategoryClassInfo: getTodoCategoryClassInfo
  };
}());

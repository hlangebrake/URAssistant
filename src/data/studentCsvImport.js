window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.data = window.Unterrichtsassistent.data || {};

function normalizeClassName(className) {
  if (!className) {
    return "";
  }

  return String(className).replace(/^0+(\d)/, "$1").trim();
}

function createPastelColor(seed) {
  const palette = [
    "#f4c7c3",
    "#f7d9a8",
    "#f5e6a7",
    "#cfe7b0",
    "#b8e0d2",
    "#bcdff5",
    "#cfd2f6",
    "#e1c8f2",
    "#f5cfe0",
    "#d9d4cb"
  ];
  const normalizedSeed = String(seed || "");
  let hash = 0;
  let index;

  for (index = 0; index < normalizedSeed.length; index += 1) {
    hash = ((hash << 5) - hash) + normalizedSeed.charCodeAt(index);
    hash |= 0;
  }

  return palette[Math.abs(hash) % palette.length];
}

function createEmptyClass(rawSnapshot, className, subjectName) {
  const normalizedClassName = normalizeClassName(className) || "Neue Lerngruppe";
  const trimmedSubject = sanitizeValue(subjectName);
  const newClass = {
    id: "class-" + Date.now(),
    name: normalizedClassName,
    room: "",
    subject: trimmedSubject,
    studentIds: [],
    displayColor: createPastelColor(normalizedClassName + "::" + trimmedSubject)
  };

  rawSnapshot.classes = Array.isArray(rawSnapshot.classes) ? rawSnapshot.classes : [];
  rawSnapshot.classes.push(newClass);
  rawSnapshot.activeClassId = newClass.id;

  return rawSnapshot;
}

function sanitizeValue(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function createClassKey(className, subjectName) {
  return [sanitizeValue(className), sanitizeValue(subjectName)].join("::");
}

function parseDelimitedRows(text, delimiter) {
  const normalizedText = String(text || "");
  const rows = [];
  let row = [];
  let cell = "";
  let isQuoted = false;
  let index;

  for (index = 0; index < normalizedText.length; index += 1) {
    const character = normalizedText[index];

    if (character === '"') {
      if (isQuoted && normalizedText[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        isQuoted = !isQuoted;
      }
    } else if (character === delimiter && !isQuoted) {
      row.push(sanitizeValue(cell));
      cell = "";
    } else if ((character === "\n" || character === "\r") && !isQuoted) {
      if (character === "\r" && normalizedText[index + 1] === "\n") {
        index += 1;
      }
      row.push(sanitizeValue(cell));
      cell = "";
      if (row.some(function (value) { return value !== ""; })) {
        rows.push(row);
      }
      row = [];
    } else {
      cell += character;
    }
  }

  row.push(sanitizeValue(cell));
  if (row.some(function (value) { return value !== ""; })) {
    rows.push(row);
  }

  return rows;
}

function parseStudentCsv(text) {
  const normalizedText = String(text || "");
  const firstLine = normalizedText.split(/\r?\n/, 1)[0] || "";
  const delimiter = firstLine.indexOf("\t") >= 0 ? "\t" : ";";
  const rows = parseDelimitedRows(normalizedText, delimiter);

  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map(function (header, index) {
    return index === 0 ? String(header || "").replace(/^\uFEFF/, "") : header;
  });
  const records = [];
  var rowIndex;

  for (rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const cells = rows[rowIndex];
    const row = {};
    var columnIndex;

    for (columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
      row[headers[columnIndex]] = cells[columnIndex] || "";
    }

    if (!row.Vorname && !row.Langname) {
      continue;
    }

    records.push({
      id: "import-" + rowIndex + "-" + Date.now(),
      firstName: sanitizeValue(row.Vorname),
      lastName: sanitizeValue(row.Langname),
      className: normalizeClassName(row.Klasse),
      gender: sanitizeValue(row.Geschlecht),
      strengths: [],
      gaps: [],
      attendanceRate: 1
    });
  }

  return records;
}

function mergeImportedStudents(rawSnapshot, importedStudents, className, subjectName) {
  const classMap = {};
  const targetClasses = {};
  const replacedStudentIds = {};
  const preservedStudents = [];
  const normalizedClassName = normalizeClassName(className);
  let lastActiveClassId = rawSnapshot.activeClassId || null;
  var index;

  rawSnapshot.classes = Array.isArray(rawSnapshot.classes) ? rawSnapshot.classes : [];
  rawSnapshot.students = Array.isArray(rawSnapshot.students) ? rawSnapshot.students : [];

  for (index = 0; index < rawSnapshot.classes.length; index += 1) {
    classMap[createClassKey(rawSnapshot.classes[index].name, rawSnapshot.classes[index].subject)] = rawSnapshot.classes[index];
  }

  for (index = 0; index < importedStudents.length; index += 1) {
    const importedClassName = normalizedClassName || normalizeClassName(importedStudents[index].className) || "Neue Lerngruppe";
    importedStudents[index].className = importedClassName;
    const classKey = createClassKey(importedClassName, subjectName);
    let schoolClass = classMap[classKey];

    if (!schoolClass) {
      schoolClass = {
        id: "class-" + Date.now() + "-" + index,
        name: importedClassName,
        room: "",
        subject: subjectName || "",
        studentIds: [],
        displayColor: createPastelColor(importedClassName + "::" + (subjectName || ""))
      };
      rawSnapshot.classes.push(schoolClass);
      classMap[classKey] = schoolClass;
    }

    schoolClass.subject = subjectName || schoolClass.subject || "";
    schoolClass.displayColor = schoolClass.displayColor || createPastelColor(importedClassName + "::" + (schoolClass.subject || ""));
    targetClasses[schoolClass.id] = true;
    lastActiveClassId = schoolClass.id;
  }

  for (index = 0; index < rawSnapshot.classes.length; index += 1) {
    if (targetClasses[rawSnapshot.classes[index].id]) {
      (rawSnapshot.classes[index].studentIds || []).forEach(function (studentId) {
        replacedStudentIds[studentId] = true;
      });
      rawSnapshot.classes[index].studentIds = [];
    }
  }

  for (index = 0; index < rawSnapshot.students.length; index += 1) {
    if (!replacedStudentIds[rawSnapshot.students[index].id]) {
      preservedStudents.push(rawSnapshot.students[index]);
    }
  }

  rawSnapshot.students = preservedStudents.concat(importedStudents);

  for (index = 0; index < importedStudents.length; index += 1) {
    const student = importedStudents[index];
    const targetClass = classMap[createClassKey(student.className || "Neue Lerngruppe", subjectName)];
    targetClass.studentIds.push(student.id);
  }

  rawSnapshot.activeClassId = lastActiveClassId;

  return rawSnapshot;
}

function appendImportedStudentsToClass(rawSnapshot, importedStudents, classId) {
  const normalizedClassId = sanitizeValue(classId);
  let targetClass = null;

  rawSnapshot.classes = Array.isArray(rawSnapshot.classes) ? rawSnapshot.classes : [];
  rawSnapshot.students = Array.isArray(rawSnapshot.students) ? rawSnapshot.students : [];

  targetClass = rawSnapshot.classes.find(function (schoolClass) {
    return sanitizeValue(schoolClass && schoolClass.id) === normalizedClassId;
  }) || null;

  if (!targetClass) {
    return rawSnapshot;
  }

  targetClass.studentIds = Array.isArray(targetClass.studentIds) ? targetClass.studentIds : [];

  importedStudents.forEach(function (student) {
    const nextStudent = Object.assign({}, student, {
      className: targetClass.name || "",
      socialRelations: {
        likesWith: [],
        dislikesWith: [],
        shouldWith: [],
        shouldNotWith: []
      }
    });

    rawSnapshot.students.push(nextStudent);
    targetClass.studentIds.push(nextStudent.id);
  });

  rawSnapshot.activeClassId = targetClass.id;

  return rawSnapshot;
}

window.Unterrichtsassistent.data.parseStudentCsv = parseStudentCsv;
window.Unterrichtsassistent.data.createEmptyClass = createEmptyClass;
window.Unterrichtsassistent.data.mergeImportedStudents = mergeImportedStudents;
window.Unterrichtsassistent.data.appendImportedStudentsToClass = appendImportedStudentsToClass;
window.Unterrichtsassistent.data.createPastelColor = createPastelColor;

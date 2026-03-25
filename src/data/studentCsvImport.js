window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.data = window.Unterrichtsassistent.data || {};

function normalizeClassName(className) {
  if (!className) {
    return "";
  }

  return String(className).replace(/^0+(\d)/, "$1").trim();
}

function createEmptyClass(rawSnapshot, className, subjectName) {
  const nextSnapshot = JSON.parse(JSON.stringify(rawSnapshot));
  const normalizedClassName = normalizeClassName(className) || "Neue Lerngruppe";
  const trimmedSubject = sanitizeValue(subjectName);
  const newClass = {
    id: "class-" + Date.now(),
    name: normalizedClassName,
    room: "",
    subject: trimmedSubject,
    studentIds: []
  };

  nextSnapshot.classes.push(newClass);
  nextSnapshot.activeClassId = newClass.id;

  return nextSnapshot;
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

function parseDelimitedLine(line, delimiter) {
  return line.split(delimiter).map(function (cell) {
    return sanitizeValue(cell);
  });
}

function parseStudentCsv(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter(function (line) {
    return line.trim() !== "";
  });

  if (!lines.length) {
    return [];
  }

  const delimiter = lines[0].indexOf("\t") >= 0 ? "\t" : ";";
  const headers = parseDelimitedLine(lines[0], delimiter);
  const records = [];
  var lineIndex;

  for (lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const cells = parseDelimitedLine(lines[lineIndex], delimiter);
    const row = {};
    var columnIndex;

    for (columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
      row[headers[columnIndex]] = cells[columnIndex] || "";
    }

    if (!row.Vorname && !row.Langname) {
      continue;
    }

    records.push({
      id: "import-" + lineIndex + "-" + Date.now(),
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
  const nextSnapshot = JSON.parse(JSON.stringify(rawSnapshot));
  const classMap = {};
  const targetClasses = {};
  const replacedStudentIds = {};
  const preservedStudents = [];
  const normalizedClassName = normalizeClassName(className);
  let lastActiveClassId = nextSnapshot.activeClassId || null;
  var index;

  for (index = 0; index < nextSnapshot.classes.length; index += 1) {
    classMap[createClassKey(nextSnapshot.classes[index].name, nextSnapshot.classes[index].subject)] = nextSnapshot.classes[index];
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
        studentIds: []
      };
      nextSnapshot.classes.push(schoolClass);
      classMap[classKey] = schoolClass;
    }

    schoolClass.subject = subjectName || schoolClass.subject || "";
    targetClasses[schoolClass.id] = true;
    lastActiveClassId = schoolClass.id;
  }

  for (index = 0; index < nextSnapshot.classes.length; index += 1) {
    if (targetClasses[nextSnapshot.classes[index].id]) {
      (nextSnapshot.classes[index].studentIds || []).forEach(function (studentId) {
        replacedStudentIds[studentId] = true;
      });
      nextSnapshot.classes[index].studentIds = [];
    }
  }

  for (index = 0; index < nextSnapshot.students.length; index += 1) {
    if (!replacedStudentIds[nextSnapshot.students[index].id]) {
      preservedStudents.push(nextSnapshot.students[index]);
    }
  }

  nextSnapshot.students = preservedStudents.concat(importedStudents);

  for (index = 0; index < importedStudents.length; index += 1) {
    const student = importedStudents[index];
    const targetClass = classMap[createClassKey(student.className || "Neue Lerngruppe", subjectName)];
    targetClass.studentIds.push(student.id);
  }

  nextSnapshot.activeClassId = lastActiveClassId;

  return nextSnapshot;
}

window.Unterrichtsassistent.data.parseStudentCsv = parseStudentCsv;
window.Unterrichtsassistent.data.createEmptyClass = createEmptyClass;
window.Unterrichtsassistent.data.mergeImportedStudents = mergeImportedStudents;

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

window.Unterrichtsassistent.data.parseStudentCsv = parseStudentCsv;
window.Unterrichtsassistent.data.createEmptyClass = createEmptyClass;
window.Unterrichtsassistent.data.mergeImportedStudents = mergeImportedStudents;
window.Unterrichtsassistent.data.createPastelColor = createPastelColor;

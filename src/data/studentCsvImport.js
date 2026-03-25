window.Unterrichtsassistent = window.Unterrichtsassistent || {};
window.Unterrichtsassistent.data = window.Unterrichtsassistent.data || {};

function normalizeClassName(className) {
  if (!className) {
    return "";
  }

  return String(className).replace(/^0+(\d)/, "$1").trim();
}

function sanitizeValue(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
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

function mergeImportedStudents(rawSnapshot, importedStudents, subjectName) {
  const nextSnapshot = JSON.parse(JSON.stringify(rawSnapshot));
  const classMap = {};
  const importedClassNames = {};
  const preservedStudents = [];
  var index;

  for (index = 0; index < importedStudents.length; index += 1) {
    importedClassNames[importedStudents[index].className || "Ohne Lerngruppe"] = true;
  }

  for (index = 0; index < nextSnapshot.classes.length; index += 1) {
    classMap[nextSnapshot.classes[index].name] = nextSnapshot.classes[index];

    if (importedClassNames[nextSnapshot.classes[index].name]) {
      nextSnapshot.classes[index].studentIds = [];
      if (subjectName) {
        nextSnapshot.classes[index].subject = subjectName;
      }
    }
  }

  for (index = 0; index < nextSnapshot.students.length; index += 1) {
    if (!importedClassNames[nextSnapshot.students[index].className || "Ohne Lerngruppe"]) {
      preservedStudents.push(nextSnapshot.students[index]);
    }
  }

  nextSnapshot.students = preservedStudents.concat(importedStudents);

  for (index = 0; index < importedStudents.length; index += 1) {
    const student = importedStudents[index];
    const className = student.className || "Ohne Lerngruppe";

    if (!classMap[className]) {
      classMap[className] = {
        id: "class-" + className.toLowerCase(),
        name: className,
        room: "",
        subject: subjectName || "",
        studentIds: []
      };
      nextSnapshot.classes.push(classMap[className]);
    }

    if (subjectName) {
      classMap[className].subject = subjectName;
    }

    classMap[className].studentIds.push(student.id);
  }

  return nextSnapshot;
}

window.Unterrichtsassistent.data.parseStudentCsv = parseStudentCsv;
window.Unterrichtsassistent.data.mergeImportedStudents = mergeImportedStudents;

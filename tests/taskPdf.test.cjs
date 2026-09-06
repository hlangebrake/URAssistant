/* Run with node tests/taskPdf.test.cjs. Optional --fixtures writes PDF QA files. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
global.window = { jspdf: require(path.join(root, "src/features/tasks/vendor/jspdf.umd.min.js")) };
["src/shared/dateTime.js", "src/features/tasks/model.js", "src/features/tasks/vendor/liberation-sans.js", "src/features/tasks/pdf.js"].forEach(function (file) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
});
const model = window.Unterrichtsassistent.features.tasks.model;
const pdf = window.Unterrichtsassistent.features.tasks.pdf;
const snapshot = {
  planningCategories: [{ id: "digital", name: "Digitalisierung", color: "#b2d3c6" }],
  taskPeople: [{ id: "mueller", name: "Anna Müller" }, { id: "gross", name: "Peter Groß" }]
};
let task = model.createTask({
  title: "Medienkonzept aktualisieren - Rückmeldung für die Schulleitung",
  categoryId: "digital", category: "Digitalisierung", dueDate: "2026-09-15", priority: "hoch",
  responsiblePersonId: "mueller", participantPersonIds: ["gross"],
  description: "Die Überarbeitung berücksichtigt sämtliche Klassen.\nÄ, Ö, Ü, ä, ö, ü, ß, €, é, Č, Σ, Ж und → bleiben lesbar."
}, snapshot, "2026-09-06T07:14:00.000Z");
task = model.updateTask(task, { taskStatus: "in-progress" }, snapshot, "2026-09-07T09:30:00.000Z");
task = model.addProtocolEntry(task, "Telefonat mit Frau Müller. Rückmeldung soll morgen kommen.", "2026-09-07T12:20:00.000Z");
task = model.updateTask(task, { taskStatus: "waiting", waitingForPersonId: "mueller" }, snapshot, "2026-09-08T06:45:00.000Z");
const before = JSON.stringify(task);
const short = pdf.buildTaskPdf(task, snapshot, { exportedAt: "2026-09-08T10:00:00Z" });
assert.equal(JSON.stringify(task), before, "Export must not mutate the task or its logs");
assert.equal(short.getNumberOfPages(), 1, "A short protocol remains compact on A4");
assert.ok(short.output("arraybuffer").byteLength > 10000, "Font subset and actual PDF data exist");
assert.match(short.output().slice(0, 8), /^%PDF-1\./);

const long = JSON.parse(JSON.stringify(task));
long.title += " mit Abstimmung aller Beteiligten".repeat(9);
long.description += "\n" + "Mehrseitige vollständige Beschreibung. ".repeat(180);
long.description += "\nhttps://example.invalid/" + "ununterbrochen".repeat(55);
for (let index = 0; index < 60; index += 1) {
  long.protocol.push({ id: "protokoll-" + index, taskId: long.id, timestamp: new Date(Date.UTC(2026, 8, 9, 9, index)).toISOString(), text: "Eintrag " + index + ": Unterlagen besprochen. Überarbeitung mit Frau Müller abgestimmt. " + (index === 20 ? "Dieser einzelne sehr lange Eintrag wird sauber über mehrere Seiten fortgesetzt. ".repeat(150) : "") });
}
long.protocol.push({ id: "last", taskId: long.id, timestamp: "2026-09-20T10:00:00Z", text: "ENDE-DES-VOLLSTÄNDIGEN-PROTOKOLLS. Ein fehlendes Emoji bleibt nachvollziehbar: 🏫" });
const lengthy = pdf.buildTaskPdf(long, snapshot, { exportedAt: "2026-09-20T10:00:00Z" });
assert.ok(lengthy.getNumberOfPages() >= 8, "Long descriptions and protocols span multiple real PDF pages");

const empty = pdf.buildTaskPdf({ id: "legacy", title: "Aufgabe ohne optionale Angaben", categoryId: "removed", category: "Früherer Bereich", responsiblePersonId: "removed" }, snapshot);
assert.ok(empty.getNumberOfPages() >= 1, "Missing references or metadata do not prevent export");
assert.equal(pdf.fileNameForTask({ title: 'A/B: C? <D> "x"' }), "Aufgabenprotokoll-A-B- C- -D- -x-.pdf");

if (process.argv.includes("--fixtures")) {
  const directory = path.join(root, "tmp/pdfs");
  fs.mkdirSync(directory, { recursive: true });
  [["task-short", short], ["task-long", lengthy], ["task-empty", empty]].forEach(function (entry) {
    fs.writeFileSync(path.join(directory, entry[0] + ".pdf"), Buffer.from(entry[1].output("arraybuffer")));
  });
}
console.log("Task PDF checks passed (short: " + short.getNumberOfPages() + " pages, long: " + lengthy.getNumberOfPages() + " pages).");

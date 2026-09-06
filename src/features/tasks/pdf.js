(function () {
  "use strict";

  const namespace = window.Unterrichtsassistent = window.Unterrichtsassistent || {};
  namespace.features = namespace.features || {};
  const tasks = namespace.features.tasks = namespace.features.tasks || {};
  const scriptUrl = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : "";
  const assetBase = scriptUrl ? new URL("./vendor/", scriptUrl).href : "./src/features/tasks/vendor/";
  let resourcesPromise = null;

  function loadScript(fileName) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src = assetBase + fileName;
      script.onload = resolve;
      script.onerror = function () {
        script.remove();
        reject(new Error("Die lokalen PDF-Ressourcen konnten nicht geladen werden. Bitte die App einmal online öffnen und erneut versuchen."));
      };
      document.head.appendChild(script);
    });
  }

  function loadResources() {
    if (window.jspdf && tasks.pdfFonts) {
      return Promise.resolve();
    }
    if (!resourcesPromise) {
      resourcesPromise = Promise.all([
        window.jspdf ? Promise.resolve() : loadScript("jspdf.umd.min.js"),
        tasks.pdfFonts ? Promise.resolve() : loadScript("liberation-sans.js")
      ]).catch(function (error) {
        resourcesPromise = null;
        throw error;
      });
    }
    return resourcesPromise;
  }

  function fileNameForTask(task) {
    const title = String(task && task.title || "Aufgabe").trim()
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/[. ]+$/g, "").slice(0, 100);
    return "Aufgabenprotokoll-" + (title || "Aufgabe") + ".pdf";
  }

  // Kept separate from download/preview, so a later collection export can reuse layout.
  function buildTaskPdf(task, snapshot, options) {
    if (!task || !tasks.model || !window.jspdf || !tasks.pdfFonts) {
      throw new Error("Die Aufgabe oder die lokalen PDF-Ressourcen sind noch nicht verfügbar.");
    }
    const model = tasks.model;
    task = model.normalizeTask(task, snapshot);
    const pdf = new window.jspdf.jsPDF({ unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
    const exportedAt = options && options.exportedAt || new Date().toISOString();
    pdf.addFileToVFS("LiberationSans-Regular.ttf", tasks.pdfFonts.regular);
    pdf.addFont("LiberationSans-Regular.ttf", "TaskSans", "normal");
    pdf.addFileToVFS("LiberationSans-Bold.ttf", tasks.pdfFonts.bold);
    pdf.addFont("LiberationSans-Bold.ttf", "TaskSans", "bold");
    pdf.setFont("TaskSans", "normal");
    pdf.setProperties({ title: String(task.title || "Aufgabenprotokoll"), subject: "Vollständiges Aufgabenprotokoll", creator: "Unterrichtsassistent" });
    pdf.setLanguage("de-DE");

    const margin = 18;
    const contentWidth = 174;
    const pageBottom = 276;
    const bodyColor = [35, 48, 58];
    const mutedColor = [94, 107, 116];
    const accentColor = [31, 100, 112];
    const glyphs = pdf.getFont().metadata.cmap.unicode.codeMap;
    const unsupported = new Set();
    let y = 26;

    function printable(value) {
      return Array.from(String(value === undefined || value === null ? "" : value).normalize("NFC")
        .replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ""))
        .map(function (character) {
          const code = character.codePointAt(0);
          if (character === "\n" || character === "\t" || glyphs[code]) {
            return character;
          }
          const replacement = "U+" + code.toString(16).toUpperCase();
          unsupported.add(replacement);
          return "[" + replacement + "]";
        }).join("");
    }

    function font(size, bold, color) {
      pdf.setFont("TaskSans", bold ? "bold" : "normal");
      pdf.setFontSize(size || 10.5);
      pdf.setTextColor.apply(pdf, color || bodyColor);
    }

    function ensureSpace(height) {
      if (y + height > pageBottom) {
        pdf.addPage();
        y = 26;
        return true;
      }
      return false;
    }

    function wrapped(value, width, size, bold) {
      font(size, bold);
      const lines = [];
      printable(value).split("\n").forEach(function (paragraph) {
        let line = "";
        const words = paragraph.trim().split(/\s+/).filter(Boolean);
        if (!words.length) {
          lines.push("");
          return;
        }
        words.forEach(function (word) {
          const candidate = line ? line + " " + word : word;
          if (pdf.getTextWidth(candidate) <= width) {
            line = candidate;
            return;
          }
          if (line) {
            lines.push(line);
            line = "";
          }
          if (pdf.getTextWidth(word) <= width) {
            line = word;
            return;
          }
          // Long URLs and unbroken titles also wrap without clipping the right margin.
          Array.from(word).forEach(function (character) {
            if (line && pdf.getTextWidth(line + character) > width) {
              lines.push(line);
              line = "";
            }
            line += character;
          });
        });
        if (line) {
          lines.push(line);
        }
      });
      return lines;
    }

    function paragraph(value, settings) {
      const config = settings || {};
      const x = config.x || margin;
      const size = config.size || 10.5;
      const leading = config.leading || 5.2;
      const lines = wrapped(value, config.width || contentWidth, size, config.bold);
      lines.forEach(function (line) {
        ensureSpace(leading);
        if (config.protocol) {
          pdf.setDrawColor.apply(pdf, accentColor);
          pdf.setLineWidth(0.65);
          pdf.line(margin + 1, y - 3.5, margin + 1, y + leading - 3.5);
        }
        font(size, config.bold, config.color);
        pdf.text(line, x, y);
        y += leading;
      });
      return lines.length;
    }

    function heading(label) {
      ensureSpace(17);
      y += 5;
      font(11, true, accentColor);
      pdf.text(label, margin, y);
      y += 8;
    }

    function metadata(label, value) {
      ensureSpace(12);
      font(9.5, true, mutedColor);
      pdf.text(label, margin, y);
      paragraph(value || "Nicht angegeben", { x: margin + 40, width: contentWidth - 40, size: 10.5 });
      y += 2;
    }

    const category = model.getCategory(task, snapshot);
    const status = model.getStatus(task);
    const participants = (Array.isArray(task.participantPersonIds) ? task.participantPersonIds : [])
      .map(function (id) { return model.getPersonName(snapshot, id); }).join(", ");
    paragraph(task.title || "Ohne Titel", { size: 21, bold: true, leading: 8.6 });
    y += 6;
    metadata("Aufgabenbereich", (category.name || "Ohne Aufgabenbereich") + (category.missing ? " (nicht mehr verfügbar)" : ""));
    metadata("Status", status.label);
    metadata("Priorität", model.getPriority(task).label);
    metadata("Erstellt", model.formatTimestamp(task.createdAt));
    if (task.dueDate) {
      const dates = namespace.shared && namespace.shared.dateTime;
      metadata("Deadline", dates && dates.formatDateLabel ? dates.formatDateLabel(task.dueDate) : task.dueDate);
    }
    if (task.completedAt) {
      metadata("Erledigt", model.formatTimestamp(task.completedAt));
    }
    metadata("Verantwortlich", task.responsiblePersonId ? model.getPersonName(snapshot, task.responsiblePersonId) : "Nicht zugewiesen");
    metadata("Beteiligte", participants || "Keine");
    if (status.id === "waiting") {
      if (task.waitingForPersonId) {
        metadata("Wartet auf", model.getPersonName(snapshot, task.waitingForPersonId));
      }
      if (task.waitingSince) {
        metadata("Wartet seit", model.formatTimestamp(task.waitingSince));
      }
    }
    heading("BESCHREIBUNG");
    paragraph(task.description || "Keine Beschreibung hinterlegt.");

    heading("PROTOKOLL UND VERLAUF");
    paragraph("Chronologisch vom ältesten zum neuesten Eintrag.", { size: 9, color: mutedColor });
    y += 5;
    const timeline = model.getTimeline(task, snapshot, { newestFirst: false });
    if (!timeline.length) {
      paragraph("Noch keine Einträge vorhanden.", { color: mutedColor });
    }
    timeline.forEach(function (entry) {
      const isProtocol = entry.kind === "protocol";
      ensureSpace(20);
      font(9, true, isProtocol ? accentColor : mutedColor);
      pdf.text(printable(model.formatTimestamp(entry.timestamp)), margin, y);
      y += 5;
      paragraph(isProtocol ? "PROTOKOLLEINTRAG" : "AUTOMATISCH · " + (entry.label || "Änderung"), {
        size: 9, bold: true, color: isProtocol ? accentColor : mutedColor,
        x: isProtocol ? margin + 5 : margin,
        width: isProtocol ? contentWidth - 5 : contentWidth,
        leading: 4.6
      });
      if (entry.text) {
        paragraph(entry.text, {
          protocol: isProtocol,
          x: isProtocol ? margin + 5 : margin,
          width: isProtocol ? contentWidth - 5 : contentWidth,
          color: isProtocol ? bodyColor : mutedColor
        });
      }
      y += 6;
    });

    if (unsupported.size) {
      heading("ZEICHENHINWEIS");
      paragraph("Einzelne Zeichen sind in der eingebetteten Schrift nicht verfügbar. Sie bleiben als Unicode-Code in eckigen Klammern dokumentiert: " + Array.from(unsupported).join(", "), { size: 9, color: mutedColor });
    }

    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      pdf.setPage(page);
      font(8.5, true, accentColor);
      pdf.text("AUFGABENPROTOKOLL", margin, 12);
      font(8, false, mutedColor);
      const header = wrapped(task.title || "Aufgabe", 100, 8, false)[0] || "";
      pdf.text(header, 192, 12, { align: "right" });
      pdf.setDrawColor(215, 224, 226);
      pdf.setLineWidth(0.25);
      pdf.line(margin, 17, 192, 17);
      pdf.line(margin, 282, 192, 282);
      font(8, false, mutedColor);
      pdf.text("PDF erstellt: " + printable(model.formatTimestamp(exportedAt)), margin, 287);
      pdf.text("Seite " + page + " von " + pageCount, 192, 287, { align: "right" });
    }
    return pdf;
  }

  function exportTask(task, snapshot) {
    // Reserve the tab while the touch/click still carries Safari's user activation.
    const preview = window.open("", "_blank");
    if (preview) {
      const viewport = preview.document.createElement("meta");
      viewport.name = "viewport";
      viewport.content = "width=device-width, initial-scale=1, viewport-fit=cover";
      preview.document.head.appendChild(viewport);
      preview.document.title = "Aufgabenprotokoll";
      preview.document.body.textContent = "Das Aufgabenprotokoll wird als PDF vorbereitet …";
      preview.document.body.style.cssText = "font:18px system-ui,sans-serif;margin:0;padding:calc(24px + env(safe-area-inset-top)) calc(24px + env(safe-area-inset-right)) calc(24px + env(safe-area-inset-bottom)) calc(24px + env(safe-area-inset-left));color:#23303a;overflow-wrap:anywhere";
    }
    return loadResources().then(function () {
      const pdf = buildTaskPdf(task, snapshot);
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const fileName = fileNameForTask(task);
      if (preview && !preview.closed) {
        const doc = preview.document;
        doc.body.textContent = "";
        const title = doc.createElement("h1");
        title.textContent = task.title || "Aufgabenprotokoll";
        title.style.cssText = "font-size:24px;overflow-wrap:anywhere";
        const hint = doc.createElement("p");
        hint.textContent = "Das vollständige PDF ist bereit. Auf dem iPad lässt es sich in der PDF-Ansicht über Teilen in Dateien sichern.";
        doc.body.appendChild(title);
        doc.body.appendChild(hint);
        const openLink = doc.createElement("a");
        openLink.href = url;
        openLink.textContent = "PDF öffnen";
        openLink.style.cssText = "display:inline-block;padding:14px 18px;margin:8px 12px 8px 0;background:#1f6470;color:white;border-radius:10px;text-decoration:none";
        doc.body.appendChild(openLink);
        const download = doc.createElement("a");
        download.href = url;
        download.download = fileName;
        download.textContent = "PDF herunterladen";
        download.style.cssText = "display:inline-block;padding:14px 18px;margin:8px 0;border:1px solid #1f6470;color:#1f6470;border-radius:10px;text-decoration:none";
        doc.body.appendChild(download);
        if (preview.navigator && preview.navigator.canShare && typeof File !== "undefined") {
          const file = new File([blob], fileName, { type: "application/pdf" });
          if (preview.navigator.canShare({ files: [file] })) {
            const share = doc.createElement("button");
            share.textContent = "PDF teilen / in Dateien sichern";
            share.style.cssText = "display:block;font:inherit;padding:14px 18px;margin-top:16px;border:1px solid #1f6470;color:#1f6470;background:white;border-radius:10px";
            share.onclick = function () {
              preview.navigator.share({ files: [file], title: String(task.title || "Aufgabenprotokoll") }).catch(function (error) {
                if (error && error.name !== "AbortError") {
                  hint.textContent = "Bitte PDF öffnen oder herunterladen und über die PDF-Ansicht sichern.";
                }
              });
            };
            doc.body.appendChild(share);
          }
        }
      } else {
        const download = document.createElement("a");
        download.href = url;
        download.download = fileName;
        document.body.appendChild(download);
        download.click();
        download.remove();
      }
      // Retain the URL for delayed iPad share/save actions; release with the export window.
      if (preview) {
        const cleanupTimer = window.setInterval(function () {
          if (preview.closed) {
            URL.revokeObjectURL(url);
            window.clearInterval(cleanupTimer);
          }
        }, 30000);
      } else {
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      }
      return { blob: blob, fileName: fileName, pageCount: pdf.getNumberOfPages() };
    }).catch(function (error) {
      if (preview && !preview.closed) {
        preview.document.body.textContent = "Der PDF-Export ist fehlgeschlagen. " + String(error && error.message || "Bitte erneut versuchen.");
      }
      throw error;
    });
  }

  tasks.pdf = {
    loadResources: loadResources,
    buildTaskPdf: buildTaskPdf,
    exportTask: exportTask,
    fileNameForTask: fileNameForTask
  };
}());

# Export einer vollständigen Bewertung für UR Assistant – Version 1

Diese Spezifikation kann der entwickelnden App unverändert als Implementierungsauftrag übergeben werden. Referenzimplementierung: src/features/evaluation/assessmentImport.js. Maschinenlesbare Struktur: bewertungsimport-v1.schema.json. Gültiges vollständiges Beispiel: bewertungsimport-v1.example.json.

## 1. Datei und Übernahme

Die andere App exportiert pro Klausur/Bewertung genau eine UTF-8-JSON-Datei, empfohlen: chemie-11a-2026-10-23.ur-assessment.json. MIME-Typ application/json. Kein ZIP, XLSX, CSV oder reines PDF. UTF-8-BOM wird akzeptiert. Die ganze Datei darf höchstens 50 MiB enthalten. Namen, Kommentare und Aufgaben sind Klartext mit echten JSON-Zeilenumbrüchen (\n), kein HTML oder Markdown-Rendering.

In UR Assistant zuerst die bestehende Ziel-Lerngruppe wählen, dann Bewertung → Gesamte Bewertung importieren. Nach Dateiauswahl wird eine Zuordnungsvorschau angezeigt. Eindeutige Namen sind vorbelegt. Jeden offenen Datensatz einer Person zuordnen oder ausdrücklich „Auslassen – kein Import“ wählen. „Bewertung vollständig anlegen“ erstellt zusammen einen Aufgabenbogen, einen Bewertungstermin mit Notenschlüssel und alle zugeordneten abgeschlossenen Einzelbewertungen. Es wird kein zusätzlicher Kalendertermin erzeugt.

Die bestehende Lerngruppe und ihre Personen werden verwendet. Die Schnittstelle legt keine neuen Schüler oder Klassen an. className und subject sind Hinweise zur Prüfung der Zielgruppe, keine fremden internen Klassen-IDs. Die tatsächliche Schülerliste stammt ausschließlich aus der Ziel-Lerngruppe.

## 2. Exakte JSON-Struktur

P = Pflicht. O = optional. Fehlende optionale Textfelder werden leer, Listen leer, isAdditionalTask false und workingTimeMinutes 0. null, Zahlen als Strings und Dezimalkommas sind unzulässig. Zahlen sind JSON-Zahlen mit Dezimalpunkt. Wahrheitswerte sind echte true/false. Pflichttexte dürfen nicht leer sein. Reihenfolge der Aufgaben und Teilaufgaben entspricht der Listenreihenfolge. Unbekannte Felder werden ignoriert und nicht als Erweiterung übernommen; neue fachliche Inhalte benötigen eine neue unterstützte Schnittstellenversion.

### Wurzel

| Feld | P/O | Typ / Bedeutung |
| --- | --- | --- |
| format | P | Exakt "ur-assistant.assessment" |
| version | P | Exakt die Zahl 1 |
| exportId | P | Nichtleerer String, max. 200 Zeichen; neue eindeutige ID für jeden Exportvorgang |
| exportedAt | P | ISO-8601-Zeitstempel mit Sekunden und Zeitzone, z. B. 2026-10-26T15:30:00+01:00 |
| source | P | Objekt mit appId und appName |
| source.appId | P | Dauerhafter, appweit eindeutiger Bezeichner, max. 200 Zeichen, z. B. de.meineapp.klausurkorrektur |
| source.appName | P | Anzeigename der exportierenden App, max. 200 Zeichen |
| assessment | P | Eine Bewertung gemäß nachfolgender Tabelle |
| results | P | Liste von 1–1000 Ergebnisdatensätzen |

### assessment

| Feld | P/O | Typ / Bedeutung |
| --- | --- | --- |
| id | P | Dauerhafte ID der konkreten Klausur/Bewertung in der Quell-App; max. 200 Zeichen |
| title | P | Titel, max. 500 Zeichen |
| date | P | Reales Klausurdatum YYYY-MM-DD, z. B. 2026-10-23 |
| type | P | "schriftliche" (Klausur/Klassenarbeit) oder "sonstige" |
| className | O | Anzeigename der Klasse/des Kurses |
| subject | O | Fach |
| workingTimeMinutes | O | Ganze Zahl 0–525600 |
| instructions | O | Vollständige übergreifende Arbeitsanweisungen |
| gradingScale | P | 1–30 Objekte mit label und minPercent |
| tasks | P | 1–200 Aufgaben; insgesamt maximal 1000 Teilaufgaben |
| documents | O | 0–100 eingebettete Originaldokumente, siehe Abschnitt 5 |

### assessment.gradingScale[]

| Feld | P/O | Typ / Bedeutung |
| --- | --- | --- |
| label | P | Eindeutige Notenbezeichnung als String, max. 200 Zeichen, z. B. "2+", "11" oder "gut" |
| minPercent | P | Zahl von 0 bis 100: einschließlich dieser Prozentgrenze gilt die Stufe |

Prozentgrenzen müssen eindeutig sein; genau eine Stufe muss minPercent=0 haben. Der Import sortiert bei der Berechnung absteigend. Es gilt die höchste erreichte Stufe. Die Punktegrenze ist ceil((reguläre Maximalpunktzahl × minPercent / 100) × 2) / 2, also auf die nächste halbe BE aufgerundet. Zusatzpunkte erhöhen die erreichten Punkte, nicht den Nenner; mehr als 100 % sind möglich. Beispiel: 5,5 reguläre BE und 75 % ergeben eine Grenze von 4,5 BE. Wenn die Quell-App eine andere Rundung oder pädagogische Notenanpassung verwendet, muss sie die tatsächlich vergebene Gesamtnote in results[].gradeLabel exportieren. Diese Note hat Vorrang vor der Berechnung aus dem Schlüssel und wird auch in Auswertung und PDF verwendet. Ohne gradeLabel wird die Note hier berechnet.

### assessment.tasks[]

| Feld | P/O | Typ / Bedeutung |
| --- | --- | --- |
| id | P | Innerhalb dieser Bewertung eindeutige Aufgaben-ID, max. 200 Zeichen |
| title | P | Titel/Nummer, max. 500 Zeichen, z. B. "Aufgabe 1 – Atombau" |
| text | O | Vollständige gemeinsame Aufgabenstellung |
| subtasks | P | 1–200 Teilaufgaben |

Auch eine Aufgabe ohne Untergliederung muss genau eine Teilaufgabe bekommen. Bewertet wird immer die Teilaufgabe; Aufgabenpunkte und Gesamtpunkte werden daraus berechnet. Keine zusätzliche Kopie derselben Punkte auf Aufgabenebene exportieren.

### assessment.tasks[].subtasks[]

| Feld | P/O | Typ / Bedeutung |
| --- | --- | --- |
| id | P | Bewertungsweit eindeutige Teilaufgaben-ID, max. 200 Zeichen; Referenz für subtaskResults |
| title | P | Titel/Nummer, max. 500 Zeichen, z. B. "1a – Teilchen" |
| text | O | Vollständige Aufgabenstellung dieser Teilaufgabe |
| expectedAnswer | O | Musterlösung/Erwartungshorizont |
| maxPoints | P | Zahl 0–100000 in Schritten von 0,5 BE |
| isAdditionalTask | O | true bei freiwilligen Zusatzpunkten, sonst false |
| afb | O | Genau einer von "afb1", "afb1/2", "afb2", "afb2/3", "afb3"; ohne Angabe keine Einstufung |
| topics | O | Themen als Klartext, z. B. "Atombau, Elementarteilchen" |
| criteria | O | 0–200 Bewertungskriterien mit id, text und maxPoints |

Kriterien: id innerhalb der Teilaufgabe eindeutig, max. 200 Zeichen; text ist nicht leer; maxPoints ist eine Zahl 0–100000 in 0,5er-Schritten. Wenn Kriterien exportiert werden, muss ihre Summe genau maxPoints der Teilaufgabe ergeben. Sie verfeinern die Bepunktung und werden nicht zusätzlich zur Teilaufgabe addiert. Die Summe der regulären maxPoints muss größer als 0 sein. Fachliche Texte haben maximal 100000 Zeichen pro Feld. Für einen vollständigen Transfer stets alle in der Quell-App vorhandenen Aufgabentexte, Lösungen und Kriterien exportieren; Bilder, Layout, Tabellen oder Scans zusätzlich als Originaldokument beilegen.

### results[]

| Feld | P/O | Typ / Bedeutung |
| --- | --- | --- |
| id | P | Eindeutige Ergebnis-ID innerhalb des Exports, max. 200 Zeichen; Referenz für Korrekturdokumente |
| student | P | Identitätsobjekt gemäß Abschnitt 4 |
| status | P | "present" für mitgeschrieben; "absent" für nicht mitgeschrieben |
| subtaskResults | bei present P | Genau ein Ergebnis für jede Teilaufgabe, einschließlich Zusatzaufgaben; Reihenfolge beliebig |
| gradeLabel | O | Tatsächlich vergebene Gesamtnote, max. 200 Zeichen; muss exakt einem gradingScale[].label entsprechen |
| overallComment | O | Gesamtkommentar |

Nicht bearbeitete Aufgaben werden mit points=0 exportiert, nicht ausgelassen. Auch echte Nullpunkte sind eine mitgeschriebene Leistung mit status="present". Abwesende dürfen keine Teilaufgabenergebnisse oder Gesamtnote erhalten: subtaskResults fehlt oder ist [], gradeLabel fehlt oder ist leer. Sie werden niemals als Teilnehmende importiert. Nicht mitgeschriebene Schüler dürfen auch vollständig im Export fehlen. Die Länge von results muss ausdrücklich nicht der Klassenstärke entsprechen. Ein Export nur mit Abwesenden erzeugt keine Bewertung.

### results[].subtaskResults[]

| Feld | P/O | Typ / Bedeutung |
| --- | --- | --- |
| subtaskId | P | Exakte Referenz auf eine assessment.tasks[].subtasks[].id |
| points | P | Erreichte BE zwischen 0 und maxPoints dieser Teilaufgabe, in Schritten von 0,5 |
| gradeLabel | O | Vergebene Note/Notenpunkte für diese Teilaufgabe als String; wird unverändert angezeigt |
| comment | O | Allgemeiner Korrekturkommentar |
| answer | O | Schülerantwort als Klartext |
| positiveNotes | O | 0–200 nichtleere positive Einzelrückmeldungen |
| negativeNotes | O | 0–200 nichtleere Hinweise auf Fehler/Defizite |
| criterionResults | O | 0–200 Kriterienergebnisse mit criterionId, points, optional comment |

criterionId referenziert ein Kriterium derselben Teilaufgabe. points darf dessen maxPoints nicht überschreiten und muss in 0,5er-Schritten vorliegen. Falls criterionResults nicht leer ist, müssen alle Kriterien genau einmal vorkommen und ihre Punktesumme muss exakt den points der Teilaufgabe entsprechen. Fehlende Kriterienergebnisse sind zulässig, wenn nur die Teilaufgabenpunktzahl vorliegt; die Kriterien des Bewertungsbogens bleiben erhalten.

## 3. Identitäten, Eindeutigkeit und Wiederholungsimport

Alle IDs sind Strings. Aufgaben-, Teilaufgaben-, Ergebnis- und Dokument-IDs müssen jeweils im beschriebenen Bereich eindeutig sein, Kriterien-IDs innerhalb ihrer Teilaufgabe. Keine IDs durch Zeilennummern nach einer neuen Sortierung neu vergeben. Referenzen müssen die IDs exakt einschließlich Groß-/Kleinschreibung wiederholen. Keine führenden/nachfolgenden Leerzeichen in IDs verwenden.

UR Assistant erzeugt eigene interne IDs für Aufgabenbogen, Aufgaben, Teilaufgaben, Bewertungstermin und Einzelbewertungen; alle Ergebnisreferenzen werden beim Import umgeschrieben. Quell-IDs dürfen keine vorhandenen Datensätze überschreiben.

Die Kombination aus source.appId + assessment.id + Ziel-Lerngruppe verhindert doppelte Importe. Ein neuer exportId allein erlaubt keinen zweiten Import derselben Bewertung. Auch nach Neuladen/Backup-Wiederherstellung bleibt diese Prüfung erhalten. Version 1 legt Bewertungen neu an; sie aktualisiert keine bereits importierte Bewertung. Für eine korrigierte Fassung die vorhandene Bewertung bearbeiten oder gezielt löschen und neu importieren; assessment.id für dieselbe Klausur stabil halten. Neue Klausuren erhalten neue assessment.id.

## 4. Namen und Teilnehmerzuordnung

student darf folgende optionale Strings mit jeweils maximal 500 Zeichen enthalten:

| Feld | Bedeutung |
| --- | --- |
| externalId | Dauerhafte Personen-ID der Quell-App; im Export eindeutig, allein kein personenübergreifender Abgleich mit lokalen IDs |
| urStudentId | Nur setzen, wenn die echte interne Schüler-ID aus genau dieser UR-Assistant-Datenbasis bekannt ist; niemals raten |
| firstName | Vorname(n), soweit tatsächlich bekannt |
| lastName | Nachname(n), soweit tatsächlich bekannt |
| displayName | Rohname der Korrektur-App, z. B. "Anna", "Müller, Anna", "Anna Mueller" |

Mindestens displayName, firstName, lastName oder urStudentId muss nicht leer sein. Namen nie erfinden, fehlende Nachnamen weglassen. Wenn strukturierte Namen bekannt sind, diese möglichst vollständig exportieren; displayName sollte dieselbe Person und dieselben bekannten Namensbestandteile bezeichnen. Ein reines externes Namensetikett darf in displayName stehen. Wenn urStudentId vorhanden ist, hat diese Vorrang; eine ID außerhalb der Zielgruppe wird nicht über Namensähnlichkeit umgedeutet.

Automatische Zuordnung:

1. Nur bestehende Personen der explizit gewählten Lerngruppe sind Kandidaten.
2. Eine gültige urStudentId ist die stärkste Zuordnung. externalId wird ausdrücklich nicht mit lokalen IDs gleichgesetzt.
3. Namen werden ohne Beachtung von Groß-/Kleinschreibung, Akzenten, Satzzeichen oder Namensreihenfolge verglichen. ä/ae, ö/oe, ü/ue sowie ß/ss werden vereinheitlicht.
4. Eindeutige vollständige Namen und eindeutig passende unvollständige Namen können automatisch übernommen werden. Nahe Schreibweisen werden anhand der Zeichenähnlichkeit vorgeschlagen. Mehrdeutige Vornamen bleiben offen. Ein Ähnlichkeitswert ist keine statistische Wahrscheinlichkeit.
5. Automatische Namenszuordnungen erfordern mindestens 0,8 Ähnlichkeit und 0,12 Abstand zum nächsten Kandidaten. Konkurrieren mehrere importierte Datensätze um dieselbe Person, bleiben die betroffenen Datensätze offen. Schwächere Treffer ab 0,5 werden nur als Vorschläge angezeigt.
6. Jede Person und jeder Ergebnisdatensatz kann höchstens einmal zugeordnet werden. Offene Namen müssen geprüft oder ausdrücklich ausgelassen werden; dadurch gehen keine Ergebnisse unbemerkt verloren.
7. Personen ohne zugeordneten present-Datensatz werden nicht für diese Bewertung ausgewählt. Es gibt keinerlei Auffüllen nach Klassenstärke, alphabetischer Reihenfolge oder Restplatzverfahren. Abwesenheit erzeugt weder Nullpunkte noch eine neue Schul-Anwesenheitsmeldung.

Namensänderungen und Kurzformen ändern die bestehenden Schülerstammdaten nicht. Die ursprüngliche Identitätsangabe bleibt bei der importierten Einzelbewertung gespeichert. Bei unsicherer Zuordnung kann die Lehrkraft in der Vorschau jede Zuordnung ändern oder auslassen.

## 5. Originaldokumente einbetten

Bei Aufgabenbögen mit Bildern, Scan, komplexem Layout oder zusätzlichem Material immer das Original beifügen. Ebenso vorhandene Bewertungsbögen und korrigierte Schülerarbeiten. Die Datei bleibt vollständig eigenständig; keine externen URLs, Pfade, Cloud-IDs oder separaten Download-Schritte verwenden.

assessment.documents[] enthält:

| Feld | P/O | Typ / Bedeutung |
| --- | --- | --- |
| id | P | Eindeutige Dokument-ID, max. 200 Zeichen |
| fileName | P | Einfacher Dateiname ohne Ordner/Steuerzeichen, max. 200 Zeichen, Endung .pdf/.png/.jpg/.jpeg |
| mimeType | P | application/pdf, image/png oder image/jpeg; passend zur Endung und Dateisignatur |
| role | P | "question-paper" = Aufgabenbogen, "rubric" = Bewertungsbogen/Erwartungshorizont, "correction" = korrigierte Schülerarbeit |
| studentRef | bei correction P | Exakte results[].id der zugehörigen Person; bei anderen Rollen weglassen |
| dataBase64 | P | Vollständiger Dateiinhalt als Standard-Base64, ohne data:-Präfix, Zeilenumbrüche oder Leerzeichen |

Zusammen maximal 30 MiB decodierte Dokumentdaten. Beachten, dass Base64 etwa ein Drittel größer ist. Die App prüft Dateiendung, MIME-Typ und Signatur. Originaldokumente werden gespeichert und zum Herunterladen angeboten. Nur Korrekturdokumente tatsächlich zugeordneter Personen werden übernommen. Nicht zugeordnete/abwesende Schülerarbeiten werden nicht angelegt. Globale Aufgaben- und Bewertungsbögen sind im Aufgabenbogen und in der Bewertungsansicht abrufbar, persönliche Korrekturen bei der jeweiligen Einzelbewertung.

JavaScript-Beispiel zur Erstellung eines Dokuments im Browser:

~~~js
async function embeddedDocument(file, role, id, studentRef) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let start = 0; start < bytes.length; start += 8192) {
    binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
  }
  return {
    id, fileName: file.name, mimeType: file.type, role,
    ...(studentRef ? { studentRef } : {}),
    dataBase64: btoa(binary)
  };
}
// assessment.documents.push(await embeddedDocument(pdf, "question-paper", "doc-aufgaben"));
// assessment.documents.push(await embeddedDocument(korrektur, "correction", "doc-anna", "result-anna"));
~~~

## 6. Validierung und Verhalten bei Fehlern

Vor dem Export das JSON-Schema validieren und anschließend die semantischen Bedingungen prüfen: eindeutige IDs und Notengrenzen, existierende Referenzen, vollständige Teilaufgabenergebnisse, Kriterien- und Punktesummen, keine Punkte für Abwesende sowie Dateigrößen und Signaturen. UR Assistant prüft diese Bedingungen erneut. Ein Fehler stoppt die gesamte Anlage; es gibt keinen teilweisen Import gültiger Zeilen. Die Fehlermeldung nennt das Feld, z. B. results[0].subtaskResults[1].points.

Alle übernommenen Daten werden zusammen mit den bestehenden App-Daten gespeichert. Aufgaben, Erwartungshorizont, Kriterien, individuelle Kommentare, Schülerantworten, Teilnoten, explizite Gesamtnoten, Originaldateien und Importherkunft bleiben bei Neuladen und App-Backup erhalten. Die Originaltexte werden als Text dargestellt und nicht als ausführbarer HTML-Code behandelt.

Die ursprünglichen Teilnoten und Kriterienpunkte beschreiben den importierten Korrekturstand. Wenn später die Teilaufgabenpunkte hier manuell geändert werden, werden die importierte Gesamtnote, die Teilnote dieser Teilaufgabe und deren Kriterienpunkte zurückgesetzt, damit die aktuelle Note wieder aus den geänderten Punkten berechnet wird. Erwartungshorizont und Originaldokumente bleiben für den Vergleich abrufbar.

## 7. Prüfliste für die exportierende App

- Einen vollständigen JSON-Export pro Klausur erzeugen; Format und Version exakt setzen.
- Aufgaben samt Teilaufgaben, allen vorhandenen Aufgabentexten, Lösungen und Kriterien exportieren.
- Reguläre BE und Zusatz-BE korrekt unterscheiden; keine doppelten Punktesummen.
- Den tatsächlichen Notenschlüssel und gegebenenfalls abweichend vergebene Gesamtnoten exportieren.
- Pro mitgeschriebener Person alle Teilaufgabenpunkte, vorhandene Teilnoten, Kommentare, Rückmeldungen, Antworten und Kriterienpunkte ausgeben.
- Tatsächlich bekannte Namen/IDs unverändert exportieren; fehlende Nachnamen weglassen.
- Nichtteilnahme als absent oder durch Weglassen ausdrücken, nie durch künstliche Nullpunkte.
- Originaldokumente einbetten; persönliche Korrekturen über die Ergebnis-ID referenzieren.
- Schema und semantische Regeln validieren; UTF-8-Datei als Download anbieten.

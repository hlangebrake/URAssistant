# Lerngruppe → Schüler

Der Einstieg zeigt das mittlere Niveau, das zuletzt erfasste Niveau und die letzte manuell vergebene Zwischennote. Kompetenzprofil, Wissenslücken und nächste Schritte sind optional ausklappbar. Die Timeline enthält alle vorhandenen Einträge, mit Filtern und schrittweiser Anzeige statt der bisherigen Grenze von 14 Einträgen.

## Darstellung und Recherche

Die Gestaltung orientiert sich an der primären Dokumentation des Office for National Statistics (Recherche: 20.09.2026):

- [Line charts](https://service-manual.ons.gov.uk/data-visualisation/chart-types/line-chart): zeitlicher Verlauf, bei unregelmäßigen Abständen einzelne Messpunkte, Vergleichswerte als Orientierung. Hier: Tagesmittel als Linie, Quellmittel als Punkte und Gesamtmittel als gestrichelte Referenz. Abstände auf der X-Achse entsprechen tatsächlichen Zeitabständen; nach über 28 Tagen wird die Linie unterbrochen.
- [Using colours in charts](https://service-manual.ons.gov.uk/data-visualisation/colours/using-colours-in-charts): sparsame und konsistente Farbverwendung. Hier: Blau/Kreis für Beobachtungen, Violett/Raute für Bewertungen. Qualität erscheint zusätzlich numerisch und als Balken; Farbe ist nie der einzige Informationsträger.
- [Choosing a chart type](https://service-manual.ons.gov.uk/data-visualisation/chart-types/choosing-a-chart-type): einfache Übersicht vor Detaildarstellungen und konsistente Vergleichsskalen.

Die konkrete Qualitätsnormierung und Gewichtung sind Produktentscheidungen für diese App, keine aus den Quellen abgeleiteten Vorgaben zur Notengebung.

## Qualitätsindex 0–4

- AFB und Gesamteindruck: −− / − / ○ / + / ++ werden auf 0 / 1 / 2 / 3 / 4 abgebildet.
- Mathe: aktuelle Stufen 0–4; frühere Werte −2 bis +2 werden um 2 verschoben.
- Punktebewertungen: erreichter Anteil × 4, begrenzt auf 0–4. Der ursprüngliche Punktwert bleibt im Detail erhalten.
- Kompetenzraster und eigene Werkzeuge: relative Position in der gespeicherten Stufenreihenfolge, erste Stufe 0, letzte 4. Voraussetzung: aufsteigende Reihenfolge. Dimensionen mit nur einer Stufe und nicht mehr vorhandene Skalen erhalten keinen Index. Diese Annahme ist direkt in der Ansicht erklärt.
- Mittelung zuerst innerhalb eines Eintrags, dann je Datum und zuletzt über die erfassten Tage. Viele Kurzbeobachtungen an einem Tag erhalten dadurch kein höheres Tagesgewicht.
- Die jüngsten maximal fünf erfassten Tage werden separat gezeigt. Ein Veränderungshinweis vergleicht sie mit den bis zu fünf davorliegenden Tagen, sobald beide Gruppen mindestens drei Tage enthalten.
- Kommentare, manuelle Zwischennoten, Arbeits-/Sozialverhalten, Hausaufgaben und Anwesenheit werden nicht verrechnet. Fehlende Werte bleiben fehlend; numerische Nullwerte bleiben erhalten.

Der Index beschreibt die relative Skalenposition. Er ist keine errechnete Schulnote und behauptet keine fachliche Gleichwertigkeit unterschiedlicher Instrumente. Quelle, Originalbewertung und Kontext bleiben in der Timeline zugänglich.

## Noten und Kommentare

Unter Lerngruppe → Verwalten → Basisdaten ist `gradingScheme` einstellbar: `grades` (1–6, Standard) oder `points` (0–15). Jede Zwischennote speichert das zum Erfassungszeitpunkt geltende Schema selbst. Ein späterer Schemawechsel interpretiert frühere Noten nicht um.

`studentJournalEntries` enthält getrennte Einträge für Zwischennoten (`grade`) und Kommentare (`comment`), jeweils mit Lerngruppe, Person, Datum, Text und Zeitstempeln. Bewusstes Speichern legt einen Eintrag an; Bearbeiten aktualisiert dessen ID. Entwürfe bleiben beim Personenwechsel im Arbeitsspeicher erhalten und werden beim Sperren gelöscht. Die Einträge laufen über die vorhandene verschlüsselte Speicherung, Export-/Import-Serialisierung und Zusammenführung. Beim Löschen einer Person oder Lerngruppe werden die zugehörigen Einträge mit entfernt.

## Prüfung

`node --test tests/student-overview.test.cjs` prüft Skalen, fehlende Werte, Tagesmittel, Notenvalidierung, Schemawechsel und Datenerhalt. `tests/student-overview-browser.cjs` prüft die echte Oberfläche mit ausschließlich synthetischen Daten in einem isolierten Browserprofil.

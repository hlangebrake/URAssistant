# Modernisierung des Unterrichtsassistenten

Ziel: Eine ruhige, schnelle Arbeitsoberfläche, die Unterricht, Planung und nächste Schritte gemeinsam erschließt.

## Abnahmekriterien

- Alle vorhandenen Hauptansichten, Formulare und Dialoge erhalten ein gemeinsames modernes Erscheinungsbild. Tabellen und Sitzpläne behalten ihre fachliche Geometrie; Tablet und Tastatur bleiben bedienbar.
- Standardstunden lassen sich mit 45-/90-Minuten-Vorlagen und wenigen Eingaben planen. Vorhandene eigene Planungen werden nicht unbemerkt überschrieben.
- Zusatzstunden und teilweise Ausfälle erzeugen dieselben Unterrichtstermine in Planung, Wochenansicht und Live-Unterricht.
- Die Übersicht zeigt heute bzw. die nächsten sieben Tage, nächste Stunden, Vorbereitung, Aufgaben, Rückmeldungen und offene Folgemaßnahmen mit direkten Aktionen.
- Ein Stundenabschluss speichert Ergebnis, offene Punkte und nächsten Schritt; eine Folgemaßnahme verbindet Beobachtung, Person/Klasse, Aufgabe und Überprüfung.
- Materiallinks bleiben an der geplanten Stunde wiederauffindbar. Schnellerfassung und Suche öffnen den fachlichen Kontext.
- Der Speicherzustand ist sichtbar; kontinuierliche Eingaben werden zeitnah gespeichert. Offline-Neustart und eine verschlüsselte Sicherung vor Import/Zusammenführung werden unterstützt.
- Bestehende Datensätze bleiben lesbar. Neue Daten überstehen Serialisierung, Export und Import. Prüfung mit synthetischen Daten; keine Änderung echter Lehrerdaten.

## Prüfung

Fachliche Regeln werden mit zustandsfreien Tests geprüft. Anschließend folgen eine visuelle und funktionale Prüfung der neuen Abläufe und ein unabhängiges Subagenten-Review. Grenzen realer Geräteprüfungen werden bei der Übergabe ausdrücklich genannt.

## Abnahme am 20. September 2026

- Drei Subagenten bearbeiteten Planung/Termine, Darstellung/Arbeitsabläufe und Speicherung. Anschließend prüften sie jeweils die angrenzenden Änderungen unabhängig.
- 85 automatisierte Tests bestanden. Sie umfassen insbesondere 45-/90-Minuten-Vorlagen, Mehrfacheingabe, Teil-Ausfälle und Zusatzstunden, Maßnahmen und Aufgabenketten, Historien, Serialisierung, Suchkontext, Entwurfsschutz, fehlgeschlagene Speicherung, Importbarriere und den Schutz gegen einen veralteten Passwortschlüssel in einem zweiten Fenster.
- Browserprüfung mit ausschließlich synthetischen Daten: Mehrere Stunden anlegen, Vorlage bearbeiten, Material verknüpfen und korrigieren, Aufgabe schnell erfassen, Beobachtung in Maßnahme überführen, Wirkung dokumentieren, Stunde mit Folgeaufgabe abschließen, Suche nach Stunde/Material/Person und Wechsel zur richtigen Lerngruppe.
- Ein ausgefüllter Dialog bleibt nach Escape und „Weiter bearbeiten“ erhalten. Die gespeicherte Aufgabe blieb nach Neuladen und erneuter Passwortprüfung erhalten.
- Visuell geprüft bei 1280, 820 und 390 Pixel Breite. Übersicht und Dialoge passen auf schmale Bildschirme; die Unterrichtsplanung nutzt auch auf Tablets die volle Inhaltsbreite. Im Live-Verlauf stehen Materialnamen und Sozialformen lesbar unter dem Arbeitsschritt. Ein Wechsel der Hauptansicht beginnt oben; beim Bearbeiten derselben Ansicht bleibt die Scrollposition erhalten.
- Offline-Neustart praktisch geprüft: Der lokale Vorschau-Server wurde beendet. App und Entsperrseite starteten aus dem Cache; nach Passwortprüfung waren die gespeicherten Daten weiterhin vorhanden. Keine Browserfehler in diesem Ablauf.
- Die unabhängigen Reviews fanden und behoben Datenverlust bei fehlgeschlagenem Speichern vor Sperre, konkurrierende Schreibvorgänge beim Import, falschen Live-Klassenkontext bei der Suche und verlorene schnelle Materialstatusänderungen.

Noch nicht auf einem physischen iPad/Safari geprüft. Gleichzeitige inhaltliche Bearbeitung mehrerer Fenster oder Geräte ist weiterhin keine automatische Synchronisation. Die Materialverwaltung speichert Links; Dateien verbleiben an ihrem bisherigen Speicherort.

Die lokale Vorschau lässt sich mit `node tests/dev-preview.cjs` starten. Die ausgegebene Adresse `/__preview` richtet auf einem eigenen lokalen Ursprung ausschließlich Beispieldaten ein und entsperrt diese wieder. Sie ist kein Bestandteil der veröffentlichten App. Das Beispielpasswort lautet `Workspace-preview-2026`.

# Oberfläche des Unterrichtsassistenten

Die gemeinsame Darstellung liegt in `src/ui/modern.css`. Sie wird nach `style.css` und den fachlichen Stylesheets geladen. Vorhandene Klassen, Zustände und Bedienabläufe bleiben erhalten.

## Gestaltung

- Helle Arbeitsfläche (`#f3f6f9`), weiße Inhaltsflächen, feine graublaue Trennlinien.
- Marineblaue Navigation (`#172b41`), Teal (`#08777b`) für primäre Aktionen und Auswahl.
- Systemschrift ohne externe Downloads. Überschriften unterscheiden sich durch Größe, Gewicht und Abstand.
- Rahmen und kleine Schatten gliedern die Inhalte. Schatten kennzeichnen hauptsächlich schwebende Oberflächen.
- Fachliche Farben für Klassen, Kategorien, Bewertungen, Warnungen und Diagrammquellen bleiben erhalten. Rot bleibt destruktiven Aktionen und dringenden Zuständen vorbehalten.
- Textfarben haben auf Weiß mindestens 5:1 Kontrast. Weiß auf dem primären Teal erreicht 5,34:1.

## Bedienung

- Kopfzeile mit Titel, Unteransichten und Aktionen im normalen Layout; auf schmalen Flächen folgt eine eigene Zeile für Unteransichten.
- Formfelder und Bedienelemente verwenden dieselben Radien, Rahmen und Textgrößen. Touch-Bedienelemente erreichen mindestens 44 Pixel in der Höhe, sofern sie keine positionsgebundenen Diagramm- oder Sitzplanelemente sind.
- Auf Smartphones bleibt die Navigation als horizontal scrollbare Leiste erreichbar. Sie wächst bei zusätzlichen Bereichen nicht in mehrere Zeilen.
- Tastaturfokus erhält einen deutlich sichtbaren Rahmen. Die Systemeinstellung für reduzierte Bewegung wird berücksichtigt.
- Unteransichten, Tabellen und Karten dürfen den Dokumentbereich nicht unbeabsichtigt verbreitern. Fachliche Tabellen und Boards behalten ihren eigenen horizontalen Scrollbereich.

## Erweiterungen und Grenzen

Neue allgemeine Komponenten sollen die CSS-Variablen aus `:root` verwenden. Keine externen Schriften oder Oberflächenbibliotheken sind nötig. Klassen- und Statusfarben nicht pauschal überschreiben.

Geometrieabhängige Oberflächen – Sitzplan, Evidenzdesigner, Stundenraster und interaktive Diagramme – behalten Maße, Transformationen, Positionierung und Innenabstände. Das gemeinsame Stylesheet verändert dort vorwiegend Farben und umliegende Werkzeuge.

Bei Änderungen an der Navigation und Kopfzeile die Breiten 390, 680, 1024 und 1440 Pixel prüfen. Bei fachlichen Ansichten zusätzlich Tabellen mit vielen Spalten, lange Beschriftungen, offene Dialoge, Touch-Dragging und den gedrehten Sitzplan prüfen.

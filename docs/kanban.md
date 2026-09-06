# Aufgaben und Kanban

Unter **TODOs** wechselt der vorhandene Ansichtsumschalter zwischen TODOs und
Kanban. Beide Ansichten verwenden dieselben Datensätze. Das Board enthält fünf
Statusspalten, kombinierbare Filter und eine Suche in Titel und Beschreibung.
Die Erledigt-Spalte zeigt zunächst die letzten 20 Treffer; weitere lassen sich
einblenden. Der Statusfilter „Alle offenen Aufgaben“ blendet Erledigtes aus.

Aufgaben öffnen sich durch Antippen des Titels. Der Griff rechts am Titel dient
zum Verschieben, auch per Touch; an den seitlichen Rändern scrollt das Board
automatisch. Alternativ lässt sich der Status im Aufgabendialog ändern. Mit
einer Tastatur verschieben Links/Rechts auf dem fokussierten Griff eine Karte.
Bei vorhandenen Checklisten und Schülerzuordnungen ergibt sich der
Erledigungsstatus weiterhin aus deren Einträgen. Sie sind über den Link im
Aufgabendialog erreichbar.

Manuelle Protokolleinträge bleiben nach dem Speichern unverändert. Auch beim
Speichern der Aufgabe oder beim PDF-Export wird ein noch eingegebener
Protokolltext mit übernommen. Die Timeline zeigt neue Einträge oben; das PDF
zeigt den vollständigen Verlauf chronologisch von alt nach neu.

## Integration

- `src/features/tasks/model.js`: Statusdefinitionen, Deadlineschwellen,
  Migration, Statusübergänge, Historie, Protokoll, Filter und Sortierung.
- `src/features/tasks/controller.js`: kurzlebige Formular-/Filterzustände,
  Touch-Interaktionen und Aufrufe des vorhandenen Speicherwegs.
- `src/ui/views/kanbanView.js` und `src/ui/kanban.css`: Board, Details,
  Personenverwaltung und an die vorhandenen Designvariablen angepasste Styles.
- `src/features/tasks/pdf.js`: echte clientseitige PDF-Erstellung und
  Öffnen/Download/Teilen. `buildTaskPdf` ist von der Ausgabe getrennt.

`TodoItem` wird um `taskStatus`, `categoryId`, Zeitstempel, Personenreferenzen,
`waitingSince`, `history` und `protocol` erweitert. `done`, `completedAt`,
`category`, `dueDate`, Prioritäten und bestehende Checklisten bleiben erhalten.
Reale Bereiche nutzen die vorhandene `planningCategories.id`; virtuelle
Klassen-/Systembereiche verwenden weiterhin die bestehende Namensreferenz.
Es gibt keine zusätzliche Bereichsverwaltung. `taskPeople` speichert nur ID
und Anzeigename; Schülerdaten werden nicht dupliziert.

Alles wird mit dem vorhandenen Snapshot serialisiert, verschlüsselt und in
IndexedDB gespeichert sowie im vorhandenen Datenexport/-import berücksichtigt.
Ein privater Vergleichsstand erfasst auch Änderungen aus der alten TODO-Ansicht.
Beim Zusammenführen werden Historie und Protokoll nach Eintrags-ID vereinigt;
beim vollständigen Import wird der alte Vergleichsstand verworfen.

Alte TODOs ohne Erstellungsdatum übernehmen, sofern verfügbar, den Zeitstempel
aus ihrer vorhandenen ID und kennzeichnen diese Herkunft. Andernfalls bleibt
der Zeitpunkt ausdrücklich unbekannt. Fehlende Personen-/Bereichsreferenzen
werden angezeigt und beim bloßen Öffnen nicht gelöscht.

## PDF und iPad

jsPDF und Liberation Sans sind mit Lizenzhinweisen unter `vendor/` lokal
gebündelt. Keine Aufgabeninhalte werden extern übertragen; nach dem Laden der
App benötigt der Export kein Netzwerk. Die Ausgabe enthält auswählbaren Text,
eingebettete Schrift, Seitenzahlen, wiederholte Kopfzeilen und lange Verläufe.
Zeichen außerhalb des Schriftumfangs werden als `[U+…]` mit Erläuterung
ausgegeben, ohne den Originaltext zu verändern.

Der Export öffnet unmittelbar aus dem Antippen ein Fenster mit PDF-Öffnen,
Download und, wenn unterstützt, nativem Teilen. Modals berücksichtigen
`visualViewport`, dynamische Viewporthöhe und Safe Areas. Nur Ziehgriffe
unterbinden native Touchgesten; die übrigen Scrollflächen bleiben bedienbar.

## Prüfung

Ohne zusätzliche App-Abhängigkeiten:

```text
node --test tests/tasks-model.test.cjs tests/kanban-view.test.cjs tests/taskPdf.test.cjs
```

Die Browserprüfungen benötigen eine Entwicklungsinstallation von Playwright
und Chrome sowie einen lokalen statischen Webserver. Sie erzeugen ausschließlich
synthetische Daten in einem isolierten Browserprofil:

```text
node tests/kanban-browser.cjs
node tests/kanban-layout.cjs
```

Standardadresse ist `http://127.0.0.1:8765`, überschreibbar durch
`KANBAN_TEST_URL`. Screenshots werden im temporären Systemordner abgelegt.
Geprüft wurden Touch-Ereignisse, Hoch-/Querformat, Anlegen/Bearbeiten/Löschen,
Personen, Protokoll, Statusänderungen, PDF-Ausgabe, verschlüsselte Speicherung
und erneutes Laden. Ein elfseitiges PDF wurde zusätzlich gerendert und per
Textextraktion auf Vollständigkeit kontrolliert. Ein weiterer Browserlauf
prüft 500 Aufgaben, unabhängige Spaltenscrollbereiche, Rand-Autoscroll,
abgebrochenes Touch-Ziehen sowie 150 Protokolleinträge bei 820 × 550 Pixeln.
Ein echtes iPad/Safari stand
für einen abschließenden Gerätetest nicht zur Verfügung.

# CSV-Spezifikation: Bewertungswerkzeug

Eine CSV-Datei beschreibt genau ein Bewertungswerkzeug. Die Datei ist fuer Excel auf Deutsch mit Semikolon als Trennzeichen gedacht; Komma und Tab werden beim Import ebenfalls erkannt. Die erste Zeile enthaelt die Spaltennamen. Text mit Semikolon, Zeilenumbruch oder Anfuehrungszeichen muss CSV-ueblich in doppelte Anfuehrungszeichen gesetzt werden.

## Grundprinzip

- `typ` legt fest, welche Art von Zeile beschrieben wird.
- IDs wie `aspekt_id`, `dimension_id` und `stufe_id` duerfen frei gewaehlt werden, muessen innerhalb der Datei aber eindeutig und stabil sein.
- Verknuepfungen werden ueber diese IDs hergestellt.
- `reihenfolge` ist eine Zahl ab `1` und bestimmt die Sortierung innerhalb derselben Gruppe.
- Beim Import wird aus der Datei ein neues Bewertungswerkzeug angelegt. Die CSV-IDs werden intern auf neue App-IDs abgebildet.

## Zeilentypen

| typ | Bedeutung | Wichtige Spalten |
| --- | --- | --- |
| `werkzeug` | Stammdaten des Werkzeugs | `titel`, `symbol` |
| `fach` | ein Fach | `reihenfolge`, `wert` |
| `jahrgang` | ein Jahrgang | `reihenfolge`, `wert` |
| `aspekt` | ein Aspekt | `aspekt_id`, `reihenfolge`, `titel`, `information`, `beispiel` |
| `dimension` | eine Dimension eines Aspekts | `aspekt_id`, `dimension_id`, `reihenfolge`, `bezeichnung` |
| `stufe` | eine Stufe einer Dimension | `aspekt_id`, `dimension_id`, `stufe_id`, `reihenfolge`, `bezeichnung`, `information`, `beispiel` |
| `ebene_aspekt` | Aspekt-Zuordnung in Haupt- oder FolgeEbene samt Layout | `ebene_typ`, `owner_aspekt_id`, `aspekt_id`, `reihenfolge`, `x`, `y`, `breite`, `hoehe`, `bounds_x`, `bounds_y`, `bounds_breite`, `bounds_hoehe` |
| `ebene_stufe` | Stufen-Groesse in einer Haupt- oder FolgeEbene | `ebene_typ`, `owner_aspekt_id`, `stufe_id`, `breite`, `hoehe` |

`ebene_typ` ist `haupt` fuer die Hauptebene oder `folge` fuer die FolgeEbene eines Aspekts. Bei `haupt` bleibt `owner_aspekt_id` leer. Bei `folge` enthaelt `owner_aspekt_id` die ID des Aspekts, dessen FolgeEbene beschrieben wird.

## Beispiel

```csv
typ;titel;symbol;wert;aspekt_id;dimension_id;stufe_id;owner_aspekt_id;ebene_typ;reihenfolge;bezeichnung;information;beispiel;x;y;breite;hoehe;bounds_x;bounds_y;bounds_breite;bounds_hoehe
werkzeug;Muendliche Mitarbeit;M;;;;;;;;;;;;;;;;;;
fach;;;Deutsch;;;;;;1;;;;;;;;;;;
fach;;;Geschichte;;;;;;2;;;;;;;;;;;
jahrgang;;;9;;;;;;1;;;;;;;;;;;
jahrgang;;;10;;;;;;2;;;;;;;;;;;
aspekt;Argumentation;;;a_argumentation;;;;;1;;Beitraege sind sachbezogen und nachvollziehbar.;Die Schuelerin begruendet eine Deutung mit Textbeleg.;;;;;;;;
dimension;;;;a_argumentation;d_qualitaet;;;;1;Qualitaet;;;;;;;;;;
stufe;;;;a_argumentation;d_qualitaet;s_basis;;;1;Basis;nennt passende Beobachtungen;kurzer Textbezug;;;;;;;;
stufe;;;;a_argumentation;d_qualitaet;s_sicher;;;2;Sicher;begruendet nachvollziehbar;These plus Beleg;;;;;;;;
dimension;;;;a_argumentation;d_transfer;;;;2;Transfer;;;;;;;;;;
stufe;;;;a_argumentation;d_transfer;s_transfer;;;1;Transfer;stellt Bezuege her;Vergleich mit Vorwissen;;;;;;;;
aspekt;Interaktion;;;a_interaktion;;;;;2;;Greift Beitraege anderer auf.;Die Schuelerin knuepft an einen Mitschuelerbeitrag an.;;;;;;;;
dimension;;;;a_interaktion;d_reaktion;;;;1;Reaktion;;;;;;;;;;
stufe;;;;a_interaktion;d_reaktion;s_reaktiv;;;1;Reaktiv;antwortet auf Impulse;kurze Nachfrage;;;;;;;;
stufe;;;;a_interaktion;d_reaktion;s_initiativ;;;2;Initiativ;entwickelt Gespraech weiter;eigene Rueckfrage;;;;;;;;
ebene_aspekt;;;;a_argumentation;;;;haupt;1;;;;-90;0;118;28;-90;0;286;28
ebene_aspekt;;;;a_interaktion;;;;haupt;2;;;;80;0;116;28;-90;0;286;28
ebene_aspekt;;;;a_interaktion;;;a_argumentation;folge;1;;;;0;90;116;28;0;90;116;28
ebene_stufe;;;;;;s_basis;;haupt;;;;;;;118;22;;;;
ebene_stufe;;;;;;s_sicher;;haupt;;;;;;;118;22;;;;
ebene_stufe;;;;;;s_transfer;;haupt;;;;;;;118;22;;;;
```

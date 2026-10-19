# Speicherung, Sicherung und Offline-Betrieb

Die fachlichen Daten bleiben als verschlüsselter Snapshot in IndexedDB. Die
Passwortverschlüsselung und die fünfminütige Inaktivitätssperre bleiben erhalten.

Änderungen werden nach 800 ms ohne weitere Eingabe gespeichert. Bei fortlaufender
Eingabe beginnt ein Schreibvorgang spätestens nach 5 Sekunden. Ein erzwungenes
Speichern wartet auch auf Änderungen, die während eines laufenden Schreibvorgangs
hinzukommen. Speicherfehler bleiben sichtbar; nach 5 Sekunden wird erneut versucht.
Beim Wechsel in den Hintergrund wird unmittelbar gespeichert. Beim Schließen
mit noch offenen Änderungen wird, soweit vom Browser unterstützt, gewarnt.

Schlägt das Speichern vor der Inaktivitätssperre fehl, navigiert die App nicht
weg. Eine lokale Sperrmaske verdeckt die Oberfläche, verwirft die normale
entschlüsselte Laufzeitkopie samt Hauptschlüssel und hält den ungespeicherten
Stand verschlüsselt im Arbeitsspeicher. Er lässt sich als Sicherung herunterladen
oder nach erneuter Passwortprüfung wieder öffnen. Sollte auch die Verschlüsselung
unerwartet scheitern, bleibt die letzte Kopie ausschließlich im gesperrten
Arbeitsspeicher und wird erst nach Passwortprüfung freigegeben. Ein solches
Fenster nicht schließen, bevor der Stand gesichert ist; die Sperrmaske erklärt
diese Grenze ausdrücklich. Es gibt keinen unverschlüsselten Notstand auf der Platte.

Beim Import sperrt eine Schreibbarriere nach Abschluss früherer Schreibvorgänge
die normale Speicherwarteschlange während des Schlüsselwechsels. Eingaben sind
währenddessen vorübergehend gesperrt. In einer einzelnen IndexedDB-Transaktion
wird außerdem vor jedem App-Schreibvorgang geprüft, ob der Passwortschlüssel
noch zum aktuellen Datenbestand gehört. Ein älteres Fenster darf nach einem
Schlüsselwechsel weder den neuen Datenbestand noch einen Wiederherstellungspunkt
mit seinem alten Schlüssel überschreiben. Es erhält stattdessen eine Sperrmaske
für seinen bisherigen, weiterhin sicherbaren Arbeitsstand. Dies ist keine
Synchronisation paralleler Änderungen mit demselben Schlüssel.

Die Statusleiste unterscheidet den lokalen Speicherstand von einer erzeugten
Sicherungsdatei. „Sicherung erstellt“ bezeichnet den ausgelösten Dateidownload;
die App kann nicht bestätigen, ob der Browser die Datei dauerhaft abgelegt hat.
Ein gespeicherter Browserbestand ersetzt keine externe Sicherungsdatei.

Vor vollständigem Import oder Zusammenführen wird der aktuelle, einschließlich
offener Änderungen gespeicherte Bestand erneut verschlüsselt und als einzelner
Wiederherstellungspunkt abgelegt. Er enthält das dazugehörige Passwortschlüssel-
paket, damit auch ein Import mit anderem Passwort rückgängig gemacht werden kann.
Es gibt keine unverschlüsselte Zweitkopie. Wenn der Vorzustand nicht gesichert
werden kann, wird die Übernahme nicht begonnen. Die Statusleiste bietet den
Vorzustand als reguläre Importdatei zum Download an. Der nächste erfolgreiche
Vorgang ersetzt diesen lokalen Wiederherstellungspunkt. Zum Rückimport ist das
damalige Passwort nötig. Gelöschte Browserdaten entfernen auch den Vorzustand.

## Offline und Veröffentlichungen

Der Service Worker lädt beim Installieren beide Einstiegsseiten (`index.html`
und `auth.html`), alle dort referenzierten lokalen Skripte und Styles sowie Icons,
Manifest und Curriculumdaten. Nur eine vollständig geladene Version wird aktiv.
Die URLs der Entsperrseite werden auch mit Parametern ihrer eigenen Seite
zugeordnet. Offline-Bereitschaft wird erst nach Rückmeldung des aktiven Workers
angezeigt. Ein fehlgeschlagenes Update lässt die vorherige Version erhalten.

**Bei jeder Veröffentlichung geänderter App-Dateien muss die Release-Kennung
`CACHE_NAME` in `service-worker.js` erhöht werden.** Die Dateien gemeinsam
veröffentlichen. Updates warten auf das Schließen aller bisherigen App-Fenster;
laufende Stunden werden weder neu geladen noch mit anderen Skriptversionen
vermischt. Die App entfernt nur ihre eigenen früheren Cache-Versionen.

Offline-Betrieb setzt einmaliges vollständiges Online-Laden über HTTPS oder einen
lokalen Entwicklungsserver voraus. Datei-URLs unterstützen diesen Startweg nicht.
Browser können Speicher oder Caches entfernen; ein echter Gerätetest gehört zur
Abnahme. Mehrere gleichzeitig bearbeitete Browser-/Gerätestände werden nicht
automatisch synchronisiert.

## Schnittstelle und Prüfung

`UnterrichtsassistentApp.getStorageStatus()` gibt Speicher-, Sicherungs-,
Wiederherstellungs- und Offline-Metadaten für die Übersicht zurück. Änderungen
werden über `unterrichtsassistent:storage-status` als CustomEvent veröffentlicht.
`exportRecoveryPoint()` lädt den verschlüsselten Vorzustand herunter.

`node --test tests/storage.test.cjs` prüft Zeitsteuerung und Schreibwarteschlange
mit einer kontrollierten Uhr, Fehlerversuche, Status, die Wiederherstellung mit
echter WebCrypto-Verschlüsselung und den Service Worker mit isolierten Caches.
Diese Tests ersetzen keinen Offline-Neustart auf dem tatsächlichen iPad.

`node --test tests/*.test.cjs` führt auch `tests/release.test.cjs` aus. Der
Release-Test prüft für beide Einstiegsseiten, dass jede lokale Skript- und
Stylesheet-URL genau einen `v`-Parameter mit der Release-Kennung aus
`service-worker.js` enthält und die referenzierte Datei existiert. Icons und
Manifest benötigen keinen Versionsparameter.

Zusätzlich vergleicht er alle Dateien unter `src/` und die App-Dateien im
Repository-Hauptverzeichnis (einschließlich Service Worker, HTML, Styles,
Manifest und Icons) mit einem Git-Basisstand. Hinzufügen, Entfernen oder Ändern
dieser Dateien erfordert eine andere Release-Kennung, auch wenn sämtliche
URL-Parameter noch untereinander übereinstimmen. Reine Dokumentations- und
Teständerungen erfordern keinen Versionswechsel.

Lokal ist der Basisstand `HEAD` (Prüfung noch nicht committeter Änderungen).
Für bereits committete Änderungen den Stand vor der Veröffentlichung explizit
angeben: `RELEASE_BASE_REF=<Basis-Commit> node --test tests/release.test.cjs`.
Ein fehlender Git-Basisstand ist ein Fehler; der Vergleich wird nicht übersprungen.
Die GitHub-Actions-Prüfung lädt die vollständige Historie und verwendet für Pull
Requests den Basis-Commit, für Pushes auf `master` den vorherigen Branch-Stand.
Für mehrere Commits wird damit der gesamte Änderungssatz geprüft.

Die Negativtests arbeiten ausschließlich mit synthetischen Quelldateien und
einem temporären Git-Repository. Ein dort committiertes Update ohne Cache-Bump
muss den Testprozess mit Exit-Code 1 beenden; nach gemeinsamem Versionswechsel
von Worker und HTML-URLs muss derselbe Test wieder erfolgreich sein.


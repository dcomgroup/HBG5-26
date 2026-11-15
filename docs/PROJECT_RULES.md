# HBG5-26 | Verbindliches Projektregelwerk
Stand: 2026-11-15. Gilt für Version 1.0; größere Architekturänderungen siehe [Issue #10](https://github.com/dcomgroup/HBG5-26/issues/10).

## 1. Quelle und Priorität
Dieses Dokument ist die laufend versionierte Arbeitsreferenz für Entwicklung, Migration und Veröffentlichung. Die ursprünglichen Projektregelwerke und Supabase-Appendices sind historische bzw. ergänzende Quellen; bei ausdrücklich später beschlossenen Änderungen gelten die neueren Entscheidungen. Vor Änderungen zusätzlich aktuelle Nutzeranweisung, relevante Issues, App-Code, Versionshistorie und ergänzende Dokumente prüfen. Bei unauflösbarem Widerspruch vor einer destruktiven Änderung nachfragen.

## 2. Repository und Pfade
Repository: https://github.com/dcomgroup/HBG5-26
Produktiv: https://dcomgroup.github.io/HBG5-26/ aus `main` (root). Keine zusätzlichen Repositories ohne Auftrag. Pfade: `fach/test-01/index.html` bzw. `fach/klassenarbeit-01/index.html`; kleingeschriebene ASCII-Fachnamen. Nummern je Fach und Prüfungsart getrennt, zweistellig, zählen Prüfungen statt Softwareversionen. Vor Anlegen die bestehenden Verzeichnisse prüfen. Existierende Prüfungen am vorhandenen Pfad aktualisieren; URLs erhalten.

## 3. Versionierung und Änderungskontrolle
Pro App `VERSION` oder `app.json` mit vMAJOR.MINOR.PATCH und Änderungsdatum; `CHANGELOG.md` pflegen. PATCH: Bugfix, MINOR: kompatible neue Aufgaben/Funktionen, MAJOR: inkompatible Änderung. Vor Änderung veröffentlichte Version und Git-Historie prüfen. Bestehende Dateien nicht ungeprüft überschreiben. Produktiv-Baseline vom 15.11.2026: Branch `freeze/local-production-2026-11-15`, Commit `11331a16101fd633f0650b53f284f85bee5c6ad4`. Dieser Referenzstand bleibt unverändert.

## 4. Verbindlicher Entwicklungsprozess für Version 1.0 (Entscheidung 15.11.2026; Issue #11)
1. **Neue App zuerst ohne Supabase:** aus bereitgestellten Buchseiten/Unterrichtsmaterialien schnell einen funktionsfähigen Prototyp erstellen. Zunächst lokale Speicherung nutzen. Eine neue App wird nicht automatisch mit der Cloud verbunden.
2. **Kurze UX-Testschleifen:** Aufgabenformat, Rückmeldung, Bedienung und Wiederholungslogik mehrfach testen und auf Nutzerfeedback zügig anpassen. Test-Lernstände nicht stillschweigend löschen.
3. **Ausdrückliche Freigabe:** Erst wenn der Nutzer bestätigt, dass UX und Grundlogik stehen, die neue App an Supabase anbinden. Bereits entstandene lokale Lernstände sicher übernehmen, sofern vorhanden.
4. **Pflichtprüfung bei jeder Änderung:** Vor jeder neuen App und jeder Änderung einer bestehenden App prüfen, ob Supabase-Schema, Profilzuordnung, Laden, Speichern, Synchronisierung, Migration oder vorhandener Lernstand betroffen sind. Ergebnis kurz dokumentieren: `Supabase-Auswirkung: keine / ja (mit Test- und Migrationsplan)`.
5. **Kompatibilität:** Bei Datenbezug bestehende Lernstände schützen; keine automatische Rücksetzung. Wenn Datenmigration nötig ist, erst Sicherung, Migrationstest und Abnahme. UI-only Änderungen sollen ohne unnötige Cloud-Arbeiten möglich bleiben.
6. **Kein 2.0-Umbau:** Gemeinsame Event-Sourcing-Lern-Engine, dauerhafte Aufgaben-IDs über alle Apps und übergreifende Architektur-Neufassung sind im [V2.0-Backlog #10](https://github.com/dcomgroup/HBG5-26/issues/10) und keine Voraussetzung für V1.0.

## 5. Lernapps und Datenerhalt
Kurze Übungsrunden für ca. 10 bis 15 Minuten; Standard 8 Aufgaben. Beliebig viele Runden pro Tag. Spaced Repetition priorisiert unsichere Themen, wiederholt sichere gelegentlich. Profile und Lernstände getrennt; eindeutige stabile lokale Speicher-Namensräume. Vorhandene Schlüssel und Datenschemata beibehalten oder getestete Migration einsetzen. App-spezifische Regeln wie gemeinsame Latein-Vokabelhistorie erhalten. Bei jeder Antwort direktes Feedback und kurze Erklärung, soweit mit dem freigegebenen Aufgabenformat vereinbar. Mobile Nutzung priorisieren. Mathematische Aufgaben und Lösungen auf Eindeutigkeit prüfen. Keine großen Prüfungsmodi oder Zeichenwerkzeuge ohne Auftrag.

## 6. Supabase für bestehende Apps
Laufende Migration bestehender, bereits abgenommener Produktiv-Apps ist gesondert beauftragt. UI und Lernmechanik bei dieser Speicherintegration nicht eigenmächtig umbauen. Bestehende lokale Lernstände sowie vorhandene Cloud-Daten schützen. Offline-Lernen und spätere Synchronisierung ohne Datenverlust oder Duplikate prüfen. Profiltrennung und Berechtigungen sicherstellen; keine geheimen Zugangsdaten in öffentlichen URLs oder Logs. Änderungen zunächst auf einem Entwicklungsbranch aus dem freigegebenen Produktivstand erproben; veraltete Feature-Branches nicht direkt zusammenführen. Reale Zwei-Geräte-Abnahme vor Cloud-Produktivfreigabe. Siehe Issues #2 und #7 und ursprünglichen Supabase-Appendix.

## 7. Migration, Veröffentlichung und Abnahme
Vor jeder Arbeit Repository, Quell-App, Prüfungszuordnung, Versionsdateien, vorhandene Speicherlogik und relevante Issues prüfen. Bei unklarer Prüfungszuordnung nachfragen. Links und relative Asset-Pfade für GitHub Pages prüfen. Startseite bei neuen Prüfungen ergänzen. Vor Veröffentlichung relevante Funktionstests einschließlich Profilwechsel, Feedback, Wiederholung, Neuladen, gespeichertem Lernstand und mehreren Tagesrunden durchführen. Bei Cloud-Änderungen zusätzlich Sync, Offline, Konflikte, Datenschutz und Datenmigration testen. GitHub-Upload, Deployment und Live-URL tatsächlich verifizieren. Keine Fertigmeldung ohne Nachweis.

## 8. Arbeitsabschluss
Nur tatsächlich ausgeführte Änderungen, betroffene Dateien/URLs, Ergebnis des Supabase-Auswirkungschecks und offene Tests/Hindernisse berichten. Nutzerfreigaben nicht fingieren. Relevante Entscheidungen hier im Regelwerk fortschreiben, nicht ausschließlich als Issue oder Chatnachricht ablegen.

## 9. Verbindliche Produktentscheidung: Profilzugriff ausschließlich per URL (15.11.2026)
Der Nutzer hat wiederholt ausdrücklich entschieden: Ein vollständiger Profil-Link der Form `https://dcomgroup.github.io/HBG5-26/?p=<profilkennung>` muss auf jedem Gerät unmittelbar denselben Supabase-Lernstand öffnen und synchronisieren. Kein zusätzlicher `#sync`-Parameter, kein separat zu kopierender Schlüssel, keine Anmeldung und kein gerätegebundener Browser-Schlüssel. Dies gilt auch für bestehendes Profil `panda-7a683212` und alle Lernapps. Die bisherige Secret-basierte Implementierung erfüllt die Produktanforderung nicht und ist entsprechend zu ersetzen; keine weitere Aufforderung an den Nutzer, einen `#sync`-Schlüssel zu beschaffen.
Sicherheitsfolge: Die Profil-URL ist damit selbst die Zugangsberechtigung. Wer den Link kennt, kann auf den Lernstand zugreifen und ihn verändern; Profilkennungen müssen ausreichend zufällig und schwer zu erraten sein, Zugriff und Missbrauch begrenzt werden. Keine offenen Tabellenrechte oder ungeschützten Schreibzugriffe für beliebige Profilkennungen; die tatsächlichen Berechtigungen vor Umsetzung überprüfen. Bestehende Panda- und lokale Lernstände erhalten; sichere Rückwärtskompatibilität, automatisierte und reale Zwei-Geräte-Tests vor Abschluss. Dieser Abschnitt dokumentiert die Produktentscheidung, nicht deren bereits erfolgte technische Umsetzung.

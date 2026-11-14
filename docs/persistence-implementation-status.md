# Supabase-Persistenz: Arbeitsstand 15.11.2026

Branch: `feature/persistence-integration-20261115`. **Keine Freigabe für main.**

## Auf dem Branch implementiert
- Startseite: Supabase-Reservierung neuer Profilnamen, zufälliges 256-Bit-Geheimnis im URL-Fragment, Weitergabe an vorhandene App-Links.
- Latein Test 01/02: gemeinsamer IndexedDB-Lernstand, Offline-Ereigniswarteschlange, Cloud-Abgleich, einmalige lokale Migration.
- Englisch Test 01: Kartenbewertungen mit lokalem Outbox- und Cloud-Abgleich.
- Biologie Klassenarbeit 01: Bewertungen mit lokalem Outbox- und Cloud-Abgleich.
- Mathe Test 01: Kartenstände und Rundenstatistik mit lokalem Outbox- und Cloud-Abgleich.
- Deutsch Test 01: Kartenstände mit lokalem Outbox- und Cloud-Abgleich.
- Vorhandene App-Oberflächen wurden nicht bewusst neu gestaltet; bestehende lokale Speicherkeys bleiben erhalten.

## Nachgewiesene technische Tests
- Supabase unter `anon`: Profilreservierung, Lesen/Schreiben, getrennte Profile, falsches Geheimnis blockiert Lesen und Schreiben. **PASS**
- Gleiche Event-UUID mehrfach angehängt: genau ein gespeichertes Ereignis. **PASS**
- JavaScript-Syntaxprüfungen der geänderten App-Dateien. **PASS**

## Offene Abnahme / Risiken
1. Noch keine realen Browser-/Mobiltests auf zwei Geräten. Geräteübergreifende Synchronisation und Offline-Neustart sind daher nicht abgenommen.
2. Konfliktregeln sind derzeit app-spezifisch und überwiegend zeitstempelbasiert. Reale gleichzeitige Änderungen und Import-/Export-Migrationen sind nicht ausreichend getestet.
3. Bestehende Profile ohne Supabase-Geheimnis werden nicht automatisch einem Cloud-Profil zugeordnet. Eine stille Zuordnung wäre unsicher.
4. Deutsch: bestehende Lernprotokolle (`log`) werden nicht vollständig in die Cloud übernommen. Mathe-Rundenzähler können bei paralleler Nutzung nicht zuverlässig additiv zusammengeführt werden.
5. Öffentliche Profilregistrierung braucht Missbrauchsschutz/Ratenbegrenzung; SECURITY DEFINER-Warnungen sind zu prüfen.
6. Keine nachgewiesene Browserregression für Startseite „Als Nächstes dran“, Navigation und die Apps.
7. Kein Deployment auf `main`, daher keine Live-URL-Abnahme.

## Sieben Abnahmekriterien des Supabase-Appendix
1. Startseite/Apps unverändert: **offen (Browserprüfung)**
2. A → B: **offen (Gerätetest)**
3. B → A und Profiltrennung: **teilweise (Datenbank-Isolation PASS, Gerätetest offen)**
4. Offline, Neustart, Duplikate: **teilweise (SQL-Duplikattest PASS, Offline-Browsertest offen)**
5. Lernmechaniken, Latein-Testverbund, Export/Import: **offen (Regressionstest)**
6. Lokale Daten, Migration, Wiederherstellung: **teilweise implementiert, nicht abgenommen**
7. Automatisierte und reale Tests, Security, Deployment: **offen**

**Release-Gate: Nicht mergen, solange die sieben Kriterien nicht nachweislich erfüllt sind.**

## Weitere Arbeiten 15.11.2026
- Race-Condition-Fix im gemeinsamen Cloud-Transport: Neue Uploads während einer laufenden Synchronisierung lösen anschließend einen weiteren Durchlauf aus.
- Entsprechende Korrektur in Englisch.
- Chromium-Smoke-Test für Startseite und sechs App-Routen als `tests/browser-smoke.cjs` hinzugefügt.
- GitHub Actions Workflow `.github/workflows/persistence-smoke.yml` hinzugefügt. **Ein erfolgreicher CI-Lauf ist noch nicht verifiziert.**
- Die tatsächliche Zwei-Geräte-Synchronisierung und vollständige Migrations-/Konfliktabnahme bleiben offen. Kein Merge.

## Weitere Korrekturen (15.11.2026)
- Latein: Der gespeicherte Cloud-Zugangsschlüssel wird jetzt auch bei späteren Aufrufen ohne URL-Fragment wiederverwendet.
- Deutsch: Antwortprotokolle werden als einzelne, eindeutig identifizierte Cloud-Ereignisse gespeichert, beim Lesen anhand der Ereignis-ID zusammengeführt und bei der ersten Migration aus dem lokalen Protokoll übernommen.
- Supabase-RPC `read_learning_events` geprüft: derzeit hartes Limit von 10.000 Ereignissen pro Profil und Fach. Für Langzeitbetrieb ist Paginierung oder eine serverseitige Zustandsprojektion erforderlich.
- CI-Lauf des Browser-Workflows ist über die verfügbaren GitHub-Tools noch nicht als erfolgreich nachgewiesen. Keine Browser- oder Zwei-Geräte-Abnahme behaupten.
- Keine Veröffentlichung auf `main`.

## Fortsetzung: Code-Audit und Testabdeckung
- **Kritischer Integrationsfehler behoben:** Mathe lud `shared/cloud-rpc.js` bisher nicht. Die Einbindung ist jetzt vorhanden.
- Latein: IndexedDB-Outbox-Operationen serialisiert, um verlorene parallele Kartenbewertungen beim gleichzeitigen Schreiben und Bestätigen zu verhindern.
- Mathe: Cloud-Zustände werden nach Abruf als synchronisiert markiert, damit sie beim nächsten lokalen Speichern nicht als neue Ereignisse hochgeladen werden.
- Englisch: Cloud-Zeitstempel werden bereits beim lokalen Enqueue gespeichert, um Überschreibungen durch ältere Remote-Daten zu vermeiden.
- Chromium-Test um einen simulierten A→B→A-Synchronisationsdurchlauf in zwei getrennten Browser-Kontexten für Englisch erweitert. Dieser Test nutzt einen gemockten Supabase-Endpunkt. **Testcode committed, erfolgreiches Ausführen noch nicht bestätigt.**
- Syntaxprüfung aller betroffenen JavaScript-Dateien einschließlich des Browser-Tests: **PASS**.
- Weiter offen: echte browserbasierte Tests und Gerätetests, vollständige Konflikt-/Migrationsabnahme, Supabase-Limit und Missbrauchsschutz. Keine Freigabe für `main`.

## Abnahmefortsetzung: Draft-PR und CI
- Draft-Pull-Request [#1](https://github.com/dcomgroup/HBG5-26/pull/1) eröffnet. **Nicht mergebar / nicht zur Veröffentlichung freigegeben.**
- GitHub-Actions-Workflow auf Pull Requests nach `main` erweitert und Preview-Server auf den realen Pages-Unterpfad `/HBG5-26/` korrigiert.
- Cloud-Zugangsschlüssel werden bei direkten App-Links für spätere Besuche lokal gespeichert.
- Nach dem jüngsten Commit meldete die GitHub-Workflow-Abfrage **keine Läufe**. Deshalb weiterhin **kein Nachweis** eines erfolgreichen Chromium-Tests; Ursache kann aus den verfügbaren Daten nicht sicher bestimmt werden.
- Supabase-RPC-Rückgabetypen verifiziert: `append_learning_event` boolean, `read_learning_events` Tabelle, `reserve_profile` Tabelle.
- Release bleibt gesperrt, bis Browser- und Geräteabnahme nachweislich erfolgreich sind.

## Automatisierte Tests: Stand 15.11.2026
- GitHub Actions nach Umstellung auf Ubuntu 24.04 laut Nutzer-Screenshot erfolgreich: Workflow #25 (Push) und #26 (Pull Request), jeweils grün.
- Anschließend weitere Codeänderung: Englisch setzt den `syncAgain`-Retry bei laufender Synchronisierung korrekt und persistiert den lokalen Cloud-Zeitstempel beim Queueing.
- Playwright-Test ergänzt: simulierte Offline-Antwort, Prüfung der lokalen Outbox, erneuter Upload beim `online`-Event und keine doppelten Event-IDs. **Für diese neuen Assertions liegt noch kein bestätigter CI-Erfolg vor.**
- Serverseitige RPC `append_learning_event` geprüft: Tokenhash-Prüfung, Payload-Limit 16 KB, UUID-idempotenter Insert. Offene Langzeitthemen: 10.000er Leselimit und Replay/gleichzeitige Offline-Änderungen.

## Abnahme 15.11.2026: bestätigte Ergebnisse
- GitHub Actions Run #32 (`Persistence smoke`) erfolgreich; Job `smoke` einschließlich `node tests/browser-smoke.cjs` mit `success` abgeschlossen. Separater `Lernapps smoke checks`-Run #25 erfolgreich.
- Supabase SQL-Test mit `set local role anon` in zurückgerollter Transaktion erfolgreich: Profil reserviert, Ereignis angehängt, mit korrektem Token wieder gelesen; identische UUID zweimal angehängt und genau ein Ereignis gelesen; falsches Token bei `read_learning_events` abgewiesen.
- Diese Datenbanktests verwenden eine SQL-Transaktion mit `rollback`; keine dauerhaften Testprofile oder Ereignisse erzeugt.
- **Nicht durch diesen Test bewiesen:** Browser-zu-echter-Supabase-Verbindung über HTTPS/CORS und echte zwei Geräte. Der Playwright-Zwei-Kontext-Test verwendet einen simulierten RPC-Endpunkt.

# Verbindlicher Ablauf: Supabase-Rollout und Issue-Umsetzung

**Geltung:** HBG5-26, alle Lernapps. Diese Checkliste ist der verbindliche Freigabeprozess für den Wechsel vom getesteten Feature-Branch zur Produktivversion auf GitHub Pages. Die Schritte sind **in dieser Reihenfolge** auszuführen. Ein Schritt gilt erst als abgeschlossen, wenn sein Nachweis hier dokumentiert ist. Kein Überspringen aufgrund grüner CI allein.

**Ausgangslage (15.11.2026):** Feature-Branch `feature/persistence-integration-20261115`, PR [#1](https://github.com/dcomgroup/HBG5-26/pull/1). Automatisierte `Persistence smoke` und `Lernapps smoke checks` für Commit `7ce825179d357731f1cfb6fe94ee9e6cd20d7734` erfolgreich. Supabase-RPC-Schreib-/Lesetests sind automatisiert bestanden. Das ist ein technischer Nachweis, ersetzt aber keine Abnahme der Migration realer Altstände.

## Phase 1: Bestehende Lernstände schützen und Migration abnehmen

- [ ] Vorhandene Produktivdaten auf mindestens einem bisher genutzten Browser/Profil **vor Änderungen** erfassen: App, Profil, Anzahl Runden/Antworten, schwierige/sichere Karten und, soweit vorhanden, letzte Übungsdaten. Keine lokalen Daten löschen.
- [ ] Prüfen, wie bestehende Profile (z. B. lokale Namen wie `CE`) eindeutig einem neuen Cloud-Profil zugeordnet werden. **Keine automatische Zusammenführung unterschiedlicher Kinderprofile.**
- [ ] Migration im Feature-Preview mit repräsentativen Altständen testen: lokaler Bestand bleibt erhalten, wird genau einmal in Supabase übernommen; erneutes Öffnen erzeugt keine Duplikate.
- [ ] Offline-Übung und spätere Synchronisierung testen; fehlgeschlagene Uploads bleiben in der Outbox und werden nach Verbindungsrückkehr nachgeholt.
- [ ] Zwei Geräte/Browsersitzungen mit demselben vollständigen persönlichen Profil-Link testen: Antworten werden nach Synchronisierung sichtbar, ohne Fortschritt zu überschreiben. Profil-Link mit `#sync=` ist ein Zugangsschlüssel: **nicht in Issues, Screenshots, Logs oder Dokumentation veröffentlichen**.
- [ ] Rückfallplan festhalten: vor Merge den bisherigen `main`-Commit notieren; bei Fehlern Deployment auf diesen Stand zurücksetzen. Lokale Daten und Supabase-Events nicht löschen.

**Gate 1:** Erst weiter, wenn Migration, Profiltrennung, Offline-Nachholung und geräteübergreifender Lesetest nachvollziehbar bestanden sind.

**Nachweis / Testergebnis / Datum:** _offen_

## Phase 2: Geprüften Stand nach main übernehmen

- [ ] PR #1 auf aktuellen Stand und unbeabsichtigte Änderungen prüfen. Nur getestete und für den Rollout erforderliche Änderungen übernehmen; offene Feature-/UX-Issues nicht nebenbei einmischen.
- [ ] Beide GitHub-Actions-Workflows auf dem finalen PR-Commit erfolgreich.
- [ ] PR nach dokumentiertem Gate 1 freigeben und nach `main` mergen.
- [ ] Merge-Commit und bisherigen `main`-Commit (Rollback) hier dokumentieren.

**Gate 2:** Merge nur bei bestandenem Gate 1 und grüner CI auf dem tatsächlich zu mergenden Commit.

**Nachweis / Merge-Commit / Rollback-Commit / Datum:** _offen_

## Phase 3: GitHub-Pages-Produktivversion prüfen

- [ ] Live-URL `https://dcomgroup.github.io/HBG5-26/` prüfen: Startseite und sämtliche verlinkten Lernapps öffnen ohne 404.
- [ ] Profil-Link und Profilweitergabe in Apps prüfen; kein erneutes unnötiges Profil-Anlegen; Demo-Modus bleibt klar getrennt.
- [ ] Auf echtem Gerät eine kurze Lernrunde ausführen; Fortschritt nach Neuladen und auf zweitem Gerät mit demselben Cloud-Profil prüfen.
- [ ] Vorhandene lokale Lernstände weiterhin verfügbar; Testprofil und echtes Profil bleiben getrennt.
- [ ] Bei einem gravierenden Fehler: Rollback auf dokumentierten vorherigen `main`-Commit; Fehler als Issue festhalten, Daten nicht löschen.

**Gate 3:** Erst nach bestandenem Live-Smoke-Test gilt Supabase-Persistenz als produktiv freigegeben.

**Nachweis / Live-Test / Datum:** _offen_

## Phase 4: Offene Issues einzeln bearbeiten

- [ ] Erst nach Gate 3 offene Issues priorisieren. Dazu gehören u. a. Profilführung/Demo, alternative Englisch-Übersetzungen, Kalenderdatum, Mathe-Hinweis für Einfachauswahl und [Mathe-Lernfortschritt mit Aktualität (#6)](https://github.com/dcomgroup/HBG5-26/issues/6).
- [ ] Pro Issue: eigener klar abgegrenzter Änderungssatz/PR, Regressionstests, Vorschauabnahme, dann Merge.
- [ ] Spaced-Repetition-Logik, Cloud-Synchronisierung, Profile und vorhandene Lernstände bei jeder Änderung als Regression prüfen.
- [ ] Issue erst schließen, wenn Verhalten in der Produktivversion verifiziert wurde.

**Wichtig:** Die erste Umsetzung des zeitabhängigen Mathe-Fortschritts im Feature-Branch ist **kein Ersatz für die Abnahme von Issue #6**. Falls sie im Rollout-PR enthalten ist, vor Merge gesondert auf Umfang und Risiken prüfen; gegebenenfalls aus dem Rollout herauslösen.

## Fortschrittsprotokoll

| Gate | Status | Nachweis | Datum |
| --- | --- | --- | --- |
| 1. Altstände / Migration | OFFEN | | |
| 2. PR-Merge nach main | BLOCKIERT durch Gate 1 | | |
| 3. GitHub Pages Live-Abnahme | BLOCKIERT durch Gate 2 | | |
| 4. Issues einzeln umsetzen | BLOCKIERT durch Gate 3 | | |

**Pflege:** Nach jedem Gate dieses Dokument im Repository aktualisieren (Datum, Tester, Commit/PR, Ergebnis). Bei Fehlschlag Gate offen lassen und ein Issue verlinken. Dieses Dokument selbst ändert keine Lernapp.

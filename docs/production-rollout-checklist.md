# Verbindlicher Ablauf: Supabase-Rollout und Issue-Umsetzung

**Geltung:** HBG5-26, alle Lernapps. Diese Checkliste ist der verbindliche Freigabeprozess für den Wechsel vom getesteten Feature-Branch zur Produktivversion auf GitHub Pages. Die Schritte sind **in dieser Reihenfolge** auszuführen. Ein Schritt gilt erst als abgeschlossen, wenn sein Nachweis hier dokumentiert ist. Kein Überspringen aufgrund grüner CI allein.

**Ausgangslage (15.11.2026):** Feature-Branch `feature/persistence-integration-20261115`, PR [#1](https://github.com/dcomgroup/HBG5-26/pull/1). Automatisierte `Persistence smoke` und `Lernapps smoke checks` für Commit `7ce825179d357731f1cfb6fe94ee9e6cd20d7734` erfolgreich. Supabase-RPC-Schreib-/Lesetests sind automatisiert bestanden. Das ist ein technischer Nachweis, ersetzt aber keine Abnahme der Migration realer Altstände.

## Phase 1: Bestehende Lernstände schützen und Migration abnehmen

- [ ] Vorhandene Produktivdaten auf mindestens einem bisher genutzten Browser/Profil **vor Änderungen** erfassen: App, Profil, Anzahl Runden/Antworten, schwierige/sichere Karten und, soweit vorhanden, letzte Übungsdaten. Keine lokalen Daten löschen.
- [ ] Prüfen, wie bestehende Profile (z. B. lokale Namen wie `CE`) eindeutig einem neuen Cloud-Profil zugeordnet werden. **Keine automatische Zusammenführung unterschiedlicher Kinderprofile.**
- [ ] Migration im Feature-Preview mit repräsentativen **realen Produktiv-Altständen** testen: lokaler Bestand bleibt erhalten, wird genau einmal in Supabase übernommen; erneutes Öffnen erzeugt keine Duplikate. **Teilnachweis:** automatisierter Englisch-Migrationstest mit 48 simulierten Alt-Karten, Duplikatfreiheit und SRS-Auswahl in `tests/migration-srs.cjs`, CI #60 erfolgreich.
- [ ] Offline-Übung und spätere Synchronisierung testen; fehlgeschlagene Uploads bleiben in der Outbox und werden nach Verbindungsrückkehr nachgeholt.
- [x] Zwei getrennte Browserkontexte mit demselben vollständigen persönlichen Profil-Link automatisiert getestet: A→B→A über echte Supabase-RPCs und Isolation ohne Schlüssel, `tests/live-supabase.cjs`, CI #60 erfolgreich. **Echter Produktiv-Altstand auf zweitem Gerät weiterhin nicht abgenommen.** Profil-Link mit `#sync=` ist ein Zugangsschlüssel: **nicht in Issues, Screenshots, Logs oder Dokumentation veröffentlichen**.
- [ ] Rückfallplan festhalten: vor Merge den bisherigen `main`-Commit notieren; bei Fehlern Deployment auf diesen Stand zurücksetzen. Lokale Daten und Supabase-Events nicht löschen.

**Gate 1:** Erst weiter, wenn Migration, Profiltrennung, Offline-Nachholung und geräteübergreifender Lesetest nachvollziehbar bestanden sind.

**Teilnachweis (15.11.2026):** GitHub Actions `Persistence smoke` [Run #60](https://github.com/dcomgroup/HBG5-26/actions/runs/43714661655), alle drei Testschritte (`browser-smoke.cjs`, `live-supabase.cjs`, `migration-srs.cjs`) erfolgreich. Im echten Supabase-Profil `milan-a62e5e21` wurden 16 Englisch-Ereignisse aus zwei Testrunden bestätigt. **Noch offen:** echte lokale Altstände erfassen, eindeutige Profilzuordnung, reale Migration aller Apps, vollständige Offline-/Neustart-Abnahme, Rollback-Commit und Langzeit-/Konfliktfälle. Deshalb Gate 1 OFFEN.

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
| 1. Altstände / Migration | TEILWEISE, OFFEN | CI #60, Milan: 16 Events; reale Altstände fehlen | 15.11.2026 |
| 2. PR-Merge nach main | BLOCKIERT durch Gate 1 | | |
| 3. GitHub Pages Live-Abnahme | BLOCKIERT durch Gate 2 | | |
| 4. Issues einzeln umsetzen | BLOCKIERT durch Gate 3 | | |

**Pflege:** Nach jedem Gate dieses Dokument im Repository aktualisieren (Datum, Tester, Commit/PR, Ergebnis). Bei Fehlschlag Gate offen lassen und ein Issue verlinken. Dieses Dokument selbst ändert keine Lernapp.

## Fortsetzung durch Agent (15.11.2026)

- Automatisierte Nachweise anhand des tatsächlich ausgeführten Workflows überprüft: CI #60 erfolgreich, Browser-Simulation, echte Supabase-A→B→A-Synchronisierung und Englisch-Migration mit 48 simulierten Karten.
- Die automatisierte Migration prüft **nur Englisch und simulierte lokale Bestandsdaten**, nicht die realen lokalen Browserstände des Nutzers. Diese Daten liegen ausschließlich im jeweiligen Browser und können nicht über GitHub oder Supabase ausgelesen werden, solange sie noch nicht migriert wurden.
- Das Feature enthält außerdem bereits eine erste Umsetzung von Issue #6 (zeitabhängiger Mathe-Fortschritt); vor einem reinen Persistenz-Rollout muss deren Aufnahme ausdrücklich geprüft oder die Änderung getrennt werden.
- **Entscheidung:** Kein Merge, bevor Gate 1 vollständig nachgewiesen und dokumentiert ist. Die nächste fehlende externe Evidenz ist eine Bestandsaufnahme in einem bereits verwendeten Produktiv-Browser; kein Löschen von Browserdaten.

## Zusätzliche Absicherung (15.11.2026)

- Im Feature-Branch wurde ein weiterer Regressionstest ergänzt: Englisch-Offlinestand und Outbox müssen auch nach vollständigem Browser-Reload bestehen bleiben (Commit `7ba0891`). CI-Ergebnis für diesen Commit ist noch zu verifizieren.
- **Wesentliche Migrationsgrenze:** Die App-Migration ist derzeit profilnamensgebunden. Ein vorhandenes lokales Profil `CE` wird nicht automatisch in ein neu erzeugtes Cloud-Profil `milan-…` übernommen. Automatisches Zusammenführen wäre wegen möglicher Verwechslung von Kinderprofilen unsicher. Für echte Altstände muss die Zuordnung ausdrücklich gewählt und der Bestand vorher gesichert werden.
- **Erforderlicher Nutzernachweis für Gate 1:** Ein Browser mit realem Lernstand der bisherigen GitHub-Pages-App. Dort sind zunächst Profilnamen und Lernstände zu dokumentieren und zu sichern. Diese lokalen Daten sind aus GitHub und Supabase nicht auslesbar. Ohne diesen Schritt bleibt Gate 1 offen.

## Zusätzliche automatisierte Absicherung (15.11.2026)

- Feature-Branch: `tests/math-progress.cjs` ergänzt und in `.github/workflows/persistence-smoke.yml` aufgenommen. Prüft 33 Mathe-Aufgabentypen, grün/gelb/grau, Datumsanzeige und Erhalt alter Kartenzustände ohne Zeitstempel.
- **Status:** Commit `606f1f73a5e7f49d627793d2bdd27420e86c4b26`; ein erfolgreicher CI-Lauf für diesen Commit ist noch **nicht** nachgewiesen. Daher keine Abnahme behaupten.
- Der reale Altbestand eines produktiven Browsers kann von GitHub/Supabase aus nicht ermittelt werden. Für Gate 1 ist deshalb eine **einmalige Nutzeraktion im bislang genutzten Browser** nötig: lokale Daten vor Migration sichern bzw. die App dort mit dem vorgesehenen Cloud-Profil verknüpfen. Vorher keine Löschung von Website-Daten, kein Browserwechsel als Ersatz für den Altbrowser und kein Merge.

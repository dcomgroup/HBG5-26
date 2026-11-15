> **Verbindliche Korrektur 15.11.2026:** Alle nachfolgenden Verweise auf `#sync`, 64-stellige Geheimnisse, separate Profilschlüssel oder Tokenprüfung als Zugangsbedingung sind **überholt und aufgehoben**. Allein `?p=<profilkennung>` berechtigt zum Lesen und Schreiben des zugehörigen Cloud-Lernstands auf jedem Gerät. Vorrang hat `docs/PROJECT_RULES.md`, Abschnitt 9. Die bisherige Implementierung muss noch angepasst werden. Diese historischen Statusangaben sind keine geltenden Produktanforderungen.

# HBG5-26 V1.0 | Supabase-Rollout-Checkliste

Stand: 2026-11-15. Gilt ab der Entscheidung, die Produktiv-UX **zuerst** abzunehmen und einzufrieren. Frühere, überholte Checkliste: [Archiv](archive/production-rollout-checklist-legacy-20261115.md).

**Produktiv-Baseline:** Commit `11331a16101fd633f0650b53f284f85bee5c6ad4`, Sicherungsbranch `freeze/local-production-2026-11-15`. Produktiver `main` enthält zusätzlich nur nachfolgende Projektdokumentation. **Nicht überschreiben.**

**Aktuelle Entwicklung:** [Draft-PR #12](https://github.com/dcomgroup/HBG5-26/pull/12), Branch `feature/v1-supabase-from-approved-main-20261115`, abgeleitet von aktuellem `main`. Alter [PR #1](https://github.com/dcomgroup/HBG5-26/pull/1) ist eine Code-Referenz, kein Merge-Kandidat.

## Gate 1: Datenintegrität und technische Abnahme

- [x] Produktiv-UX von Nutzer im Browser abgenommen und als Sicherungsbranch festgehalten.
- [x] Projektregeln `docs/PROJECT_RULES.md` und `AGENTS.md` in aktueller Entwicklung berücksichtigt.
- [x] Supabase-Bestand geprüft; Tabellen `profiles`, `learning_events`, RLS aktiviert, RPC-Tokenprüfung und bestehende Events geprüft. Keine Datenbankänderung.
- [x] Echte CE-Mathe-Daten bereits in Panda-Cloud-Profil übernommen: 31 Kartenereignisse + `__totals__`, 5 Runden, 40 Antworten, 35 richtig, 5 falsch. **Nicht erneut importieren.**
- [x] Optionale Adapter für Mathe, Schnellcheck, Deutsch, Biologie, Englisch und Latein auf **Entwicklungsbranch** implementiert.
- [x] Explizite Cloud-Profilanlage mit Bestätigung; lokale Testprofile bleiben lokal; persönlicher Link wird erst nach erfolgreicher Prüfung der Cloud-Berechtigung für App-Navigation freigeschaltet.
- [x] Migrationsfunktion: lokales Quellprofil ausdrücklich auswählen, vorher Sicherung bestätigen, vorhandene Cloud-App-Daten nicht überschreiben, Import mit festen Event-IDs wiederholen können. Keine automatische Löschung.
- [x] Node-Regressionstests für Transport, Offline-Outbox, Math-Panda, alle Fachadapter und Migration auf Entwicklungsbranch eingerichtet.
- [x] Automatisierter Chromium-Browsertest für lokale Profilführung und A→B-Sync mit **gemockten** Supabase-RPCs eingerichtet. CI-Lauf des finalen PR-Commits vor Freigabe erneut verifizieren.
- [ ] Reale App-Datenmigration im Preview für jedes Fach prüfen, insbesondere vorhandene Browserprofile und Offline-Neustart.
- [ ] Konfliktfall zweier Geräte mit parallelen Änderungen an derselben Karte sicher behandeln. Aktuell werden Zustands-Snapshots zeitlich abgeglichen; dies kann eine Bewertung in der Anzeige übergehen. Keine Freigabe ohne geklärte Behandlung.
- [ ] RPC-Missbrauchsschutz und Sicherheitsbewertung abschließen: `anon` kann die drei SECURITY-DEFINER-RPCs ausführen, hat aber keine direkten Tabellenrechte. `reserve_profile` hat kein Rate-Limit. `read_learning_events` ist auf 10.000 Ereignisse je App begrenzt und benötigt vor langfristiger Freigabe einen Paging-/Retention-Plan.
- [ ] Alle Profil-/Lernstands-Regressionen in echter Browser-Preview testen; keine 404s oder verdeckten UI-Änderungen.
- [ ] **Reale Zwei-Geräte-Abnahme durch Nutzer** mit vollständig persönlichem Profil-Link, insbesondere bereits importiertem Panda-Mathe-Stand.
- [ ] Freigabe zur Produktion ausdrücklich einholen.

**Gate 1: OFFEN.** CI und simulierte Tests ersetzen keine echte Geräte-/Migrationsabnahme.

## Gate 2: PR-Freigabe und Merge

- [ ] Finalen Diff von PR #12 prüfen: keine unbeabsichtigten UX-Änderungen, keine Geheimnisse, keine destruktiven DB-Änderungen.
- [ ] Beide GitHub-Actions-Workflows auf **finalem Commit** erfolgreich; Vercel-Preview desselben Commits `READY` und im Browser geprüft.
- [ ] Gate 1 vollständig dokumentiert und vom Nutzer freigegeben.
- [ ] Aktuellen `main`-Commit als Rollback-Referenz notieren; PR #12 mergen.
- [ ] Merge-Commit und Rollback-Commit hier eintragen.

**Gate 2: BLOCKIERT durch Gate 1.**

## Gate 3: Produktiv-GitHub-Pages

- [ ] Startseite und alle Apps unter `https://dcomgroup.github.io/HBG5-26/` prüfen.
- [ ] Lokaler Testmodus ohne Cloud-Profilanlage, bewusste Cloud-Aktivierung, Profilübergabe und persönlicher Link funktionieren.
- [ ] Bereits vorhandene lokale Daten und Panda-Cloud-Events unverändert; keine Duplikate.
- [ ] Reale Runde auf Gerät A, Nachladen auf Gerät B, offline lernen, später synchronisieren.
- [ ] Bei Fehlern auf notierten Produktivstand zurücksetzen; **niemals** lokale Browserdaten oder Supabase-Events löschen.

**Gate 3: BLOCKIERT durch Gate 2.**

## V1-Änderungsregel nach Freigabe

Neue Apps zunächst **lokal** erstellen, UX in kurzen Schleifen abnehmen, dann ausdrücklich Cloud-Anbindung freigeben. Bei jeder Änderung dokumentieren: `Supabase-Auswirkung: keine / ja`, inklusive Datenerhalt und nötiger Tests. Siehe [Issue #11](https://github.com/dcomgroup/HBG5-26/issues/11). V2.0-Neuarchitektur bleibt [Issue #10](https://github.com/dcomgroup/HBG5-26/issues/10).

## Nachweise

- [PR #12](https://github.com/dcomgroup/HBG5-26/pull/12) mit Commits und CI.
- [Implementierungsstatus](v1-supabase-integration-status.md).
- [Issue #2](https://github.com/dcomgroup/HBG5-26/issues/2) Profilführung.
- [Issue #7](https://github.com/dcomgroup/HBG5-26/issues/7) sichere Migration.

**Geheime `#sync=`-Links niemals in Issues, Logs, Dokumentation oder Screenshots veröffentlichen.**

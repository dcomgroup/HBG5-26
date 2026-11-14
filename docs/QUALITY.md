# Qualität, Versionierung und Releases

Stand: 2026-11-14

## Vor jeder Änderung
1. Live-Repository und alle Projektregeln/Appendices prüfen.
2. Betroffene App, bestehende VERSION/app.json, CHANGELOG und Speicherformate inventarisieren.
3. Risiko für bestehende Lernstände bewerten; bei Datenänderungen Migrations- und Rollbackplan erstellen.
4. Tests für die betroffene Funktion definieren und nach Möglichkeit automatisieren.

## Testpyramide
- **Vorhanden:** GitHub Actions für Syntaxprüfung und referenzierte lokale Skriptdateien, ausgelöst bei Push, PR und Issue.
- **Noch zu bauen:** Browser-Smoke-Tests mit Playwright für Startseite, Profile, App-Start, Antwortfeedback, Neuladen, Wiederholung am selben Tag und Lernstand.
- **Noch zu bauen:** Regressionstests für lokale Datenmigration, Spaced Repetition, profilübergreifende Isolation und Offline-/Online-Synchronisation.
- **Noch zu bauen:** Test der GitHub-Pages-Veröffentlichung inklusive Mobilansicht.

## Fehlerprozess
Nutzer öffnet Overlay -> GitHub Issue wird vorbereitet -> Nutzer sendet selbst ab -> Issue im Backlog -> Mensch prüft und beauftragt Fix. Statische Checks starten bei Issue-Erstellung. **Keine** automatische Reproduktion, KI-Reparatur oder automatische Veröffentlichung von Fixes eingerichtet.

## Releases
- SemVer pro App gemäß Projektregelwerk, Prüfungsnummer bleibt unverändert.
- Änderungsprotokoll pro App aktualisieren.
- Code und Doku zusammen versionieren; relevante Commits/PRs als nachvollziehbare Historie verwenden.
- Vorhandene Lerndaten niemals ohne geprüfte Migration überschreiben.
- Veröffentlichung erst nach erfolgreichem Commit und überprüftem Deployment als live bestätigen.

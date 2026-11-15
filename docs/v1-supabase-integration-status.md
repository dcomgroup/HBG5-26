# V1.0 Supabase-Migration: Bestandsaufnahme und Arbeitsstand

Stand 2026-11-15. **Nur Entwicklungsbranch, kein Produktiv-Rollout.**

## Basis und Schutz
- Freigegebene Produktiv-Baseline: `11331a16101fd633f0650b53f284f85bee5c6ad4`, Sicherungsbranch `freeze/local-production-2026-11-15`.
- Neuer Entwicklungsbranch: `feature/v1-supabase-from-approved-main-20261115`, erstellt von aktuellem `main`, einschließlich `docs/PROJECT_RULES.md` und `AGENTS.md`. Bestehender alter Branch `feature/persistence-integration-20261115` wird **nicht direkt gemergt**.
- Produktiv-URLs, lokale Browserdaten, Cloud-Profile und vorhandene Events unverändert lassen. Keine Datenbankmigration ohne Prüfung und Sicherung.
- Offene Blocker: Issues #2 und #7; V1-Workflow #11. V2-Architektur #10 ausdrücklich ausgeschlossen.

## Geprüfter Ist-Zustand
- Produktivcode verwendet verschiedene lokale Datenmodelle: Mathe Test 01 `localStorage:hbg5-26-mathe-test-01`, Schnellcheck `hbg5-26-mathe-schnellcheck-v1`; Latein `IndexedDB:hbg5-26-latein-v1/progress`; weitere App-Formate müssen vor Adapteränderungen vollständig inspiziert werden.
- Startseite hat expliziten lokalen Testmodus, lokale Profilbestätigung und deaktivierte Cloud-Aktivierung.
- Supabase-Projekt `velspjtxenbvvwgptahh`: Tabellen `public.profiles` und `public.learning_events`, RLS jeweils aktiv. Stand der Tabellenabfrage: 35 Profile, 104 Lernereignisse (Momentaufnahme, keine Sollwerte).
- Security Advisor meldet für drei öffentliche SECURITY-DEFINER-RPCs (`reserve_profile`, `append_learning_event`, `read_learning_events`) anonym ausführbare Funktionen. Das entspricht dem bisherigen geheimen-Link-Modell, erfordert aber vor Freigabe explizite Prüfung der Token-Verifikation, Funktionsrechte, Missbrauchsgrenzen und sicherer Fehlerbehandlung. Keine RLS-Policies auf den beiden Tabellen; RPCs müssen deshalb streng gegen Zugriff ohne korrektes Geheimnis abgesichert sein.
- Echte CE-Mathe-Daten wurden bereits in Cloud-Profil `panda-7a683212` importiert: 5 Runden, 40 Antworten, 35 richtig, 5 falsch, 32 Cloud-Events. **Nicht neu importieren ohne Idempotenznachweis.**
- Im alten Feature-Branch existieren bereits Cloud-Adapter für Englisch und Latein und Tests. Diese sind Referenzcode, nicht automatisch kompatibel mit dem freigegebenen Produktionsstand.

## Nächste Umsetzungsschritte
1. Alle lokalen Profile/Speicherformate und Adapter aus dem Altbranch vergleichen; keine UI-Änderungen in den Lernapps.
2. Profil-Link-Modell und RPC-Sicherheit prüfen, bestehende Daten/Token nicht veröffentlichen.
3. Nur benötigte Cloud-Adapter gezielt auf diesen Branch übertragen und an aktuelle App-Versionen anpassen.
4. Explizite Profilaktivierung, Quellprofil-Auswahl, Export/Sicherung und idempotente Migration implementieren; kein stillschweigendes Anlegen.
5. Automatisierte Regressionen plus echte Browser-/Offline-/Zwei-Geräte-Abnahme. Erst danach PR zur Freigabe.

## Supabase-Auswirkungscheck
**Ja**: geplante Änderungen betreffen Profilzuordnung, Speichern/Laden, Offline-Synchronisierung und Migration. Rückwärtskompatibilität und Erhalt vorhandener Lernstände sind Release-Blocker. Noch keine Änderungen an produktiver App oder Datenbank vorgenommen.

## Implementierungsfortschritt (15.11.2026)
- Draft-PR #12 aus freigegebener V1-Basis, **kein Merge**.
- `shared/cloud-transport.js`: RPC-Transport mit Profil-Link-Geheimnis und ausschließlich öffentlichen Publishable Keys.
- `englisch/test-01/cloud-sync-v1.js`: optionale Cloud-Synchronisierung, Offline-Outbox, wiederholbare Event-IDs, Schutz unübernommener lokaler Karten. Freigegebene Karteikarten-UX bleibt unverändert.
- `mathe/test-01/cloud-sync-v1.js`: optionale Cloud-Synchronisierung kompatibel mit bereits vorhandenen `mathe`-Events und `__totals__` des Panda-Profils; keine erneute CE-Importaktion.
- Startseite auf **Entwicklungsbranch**: zwei Bestätigungsschritte vor Cloud-Reservierung, Cloud-Profillink kopierbar, lokaler Testmodus weiter verfügbar, App-Links ohne alte Profil-/Demo-Parameter und nur mit aktuellem Sync-Fragment.
- Mathe und Englisch übernehmen auf dem Entwicklungsbranch den von der Startseite gewählten Profilnamen automatisch; keine erneute Namenseingabe beim Öffnen. Andere Apps stehen noch aus.
- CI: statische Syntaxprüfungen und Node-Regressionstests für Cloud-Transport, Englisch-Offline-Outbox und Math-Panda-Datenkompatibilität. CI-Ergebnisse pro Commit in PR #12 einsehen. Browser-E2E und reale Zwei-Geräte-Abnahme stehen noch aus.
- Datenbankfunktionen geprüft: `reserve_profile` nutzt atomare eindeutige Slug-Reservierung; `append_learning_event` und `read_learning_events` verifizieren Slug und SHA-256-Hash des 64-stelligen Geheimnisses, verwenden festes `search_path` und begrenzen Nutzdaten. Öffentlich ausführbare SECURITY-DEFINER-RPCs bleiben als Sicherheits-/Missbrauchsrisiko (insbesondere Profil-Reservierungs-Spam und fehlende Rate-Limits) vor Rollout zu bewerten. Keine Datenbankänderung erfolgt.
- **Bekannte Grenze:** Beim parallelen Lernen auf mehreren Geräten werden momentan Zustands-Snapshots anhand von Zeitstempeln abgeglichen. Bei gleichzeitigem Bearbeiten derselben Karte kann Lernhistorie verloren gehen. Vor Freigabe gezielte Konflikt-Tests und Lösung erforderlich.
- **Supabase-Auswirkung: ja** (Profilaktivierung, Cloud-Event-Sync und Offline-Puffer). Produktivversion und Cloud-Daten unverändert.

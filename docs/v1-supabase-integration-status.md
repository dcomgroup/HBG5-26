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

## Weitere Umsetzung (15.11.2026)
- Alle vorhandenen V1-Lernapps haben nun **optionale** Cloud-Adapter auf dem Entwicklungsbranch: Mathe Test 01, Mathe Schnellcheck (eigene `app_id`), Englisch, Deutsch, Biologie sowie beide Latein-Tests mit gemeinsamem Wortschatz.
- Cloud-Profile werden auf der Startseite erst nach **zweifacher ausdrücklicher Bestätigung** in Supabase reserviert. Vollständiger persönlicher Link kann kopiert werden. Lokale Testprofile werden weiterhin ohne Cloud angelegt.
- Profilübernahme von der Startseite ist für alle Fächer umgesetzt; bei geroutetem Profil kein stillschweigender neuer Profilname. Vorhandene lokale Daten werden beim Cloud-Lesen nicht überschrieben, wenn sie noch nicht ausdrücklich migriert wurden.
- `shared/migrate-local-v1.js`: explizite Migration mit lokalem Quellprofil, Sicherungspflicht, Prüfung vorhandener Cloud-Daten pro App, wiederaufnehmbarer Upload-Plan mit stabilen Ereignis-IDs. Bereits belegte Cloud-App-Daten werden übersprungen und nicht überschrieben. **Keine Migration ohne Nutzerbestätigung**, keine Löschung lokaler Daten.
- Automatisierte Tests: Cloud-Transport, alle sechs App-Adapter, Offline-Outbox, Panda-Mathe-Kompatibilität, idempotente Migration und echte Chromium-Browserprüfungen für Profilführung und geräteübergreifenden Englisch-Lernstand. Ergebnisse in GitHub Actions von PR #12.
- **Offen:** reale Datenmigration in weiteren Fächern, App-spezifische Konflikttests bei parallelen Geräten, Browser-E2E der Migration und der übrigen Fächer, Sicherheits-/Missbrauchsschutz, echte Abnahme mit zwei physischen Geräten, Freigabe und Rollout.

## Preview-Deployment-Limit (15.11.2026)
- Vercel-Projekt `hbg5-26-preview` (Team `fe-26`) hat das Hobby-Limit von mehr als 100 API-Deployments innerhalb von 24 Stunden erreicht (`402 api-deployments-young-hobby-team-24h`).
- Letzter bestätigter Vercel-Preview-Commit: `97d25b5223c05764bea2c2015b2033ef76745bf8`. Dieser ist **nicht** der aktuelle Entwicklungsstand und darf nicht als Abnahme des aktuellen PR #12 gelten.
- Browser-Regressionen laufen unabhängig davon in GitHub Actions auf dem tatsächlichen PR-Commit mit lokalem HTTP-Server und Chromium. Für die finale menschliche Preview-Abnahme ist nach Ablauf der Vercel-Sperre ein neues Deployment erforderlich. Keine Produktionsfreigabe währenddessen.

## Verifizierte Regressionen (15.11.2026, Commit `bba4331dae3119bdacc4ce73cb1b90514abb4ca6`)
- GitHub Actions Node-Checks **erfolgreich**: Lauf `43736973086`.
- GitHub Actions Chromium-Browser-Smoke **erfolgreich**: Lauf `43736973107`. Enthält lokale Profilanlage, Mathe- und Englisch-Cloud-Lernstand zwischen isolierten Browserprofilen, Englisch-Offline-Antwort mit Wiederverbindung ohne Duplikat, explizite Mathe-/Englisch-Migration aus lokalen CE-Testprofilen und Erhalt der Quellprofile.
- Zusätzliche Regressionen verhindern, dass remote übertragene Zustands-Snapshots mit **weniger bisherigen Antworten** lokale Mathe-/Englisch-Lernstände zurücksetzen; Konflikt-Ereignis `hbg-cloud-conflict` wird ausgelöst. Dies ist nur eine konservative Sicherung, **keine vollständige Konfliktzusammenführung**. Gleichzeitige Bewertungen auf zwei Geräten bleiben Release-Blocker.
- Browser-RPCs sind **gemockt**, daher kein Beleg für erfolgreiche echte Supabase-Übertragung oder reale physische Geräte.
- Vercel-Preview war beim letzten Check noch auf älterem Commit `222018f`, nicht auf dem aktuellen Branch. Keinen veralteten Preview-Stand freigeben.
- **Supabase-Auswirkung: ja.** Keine produktiven Datenbankänderungen oder Merge erfolgt.

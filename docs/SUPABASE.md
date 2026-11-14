# Supabase: verbindliche Anforderungen und Umsetzungsplan

Status: **geplant, nicht eingerichtet**. Stand 2026-11-14.

## Ziel
Zentraler Lernstand für mehrere Kinderprofile und alle Lernapps, ohne eigenes Serverhosting. GitHub Pages bleibt Frontend. Lokale Daten bleiben Offline-/Ausfallreserve. Minimaler Betriebs- und Wartungsaufwand.

## Profilvergabe
- Persönliche, zufällig vorgeschlagene, schwer zu erratende Lernlinks ohne verpflichtende Registrierung.
- **Globale atomare Eindeutigkeitsprüfung und Reservierung** beim Anlegen; ein Profil darf nicht zweimal vergeben werden, auch bei parallelen Geräten.
- URL-HTTP-Status oder GitHub-Pages-404 ist dafür ungeeignet, da Profile keine eigenen Dateien sind.
- Profilnamen sind keine Authentifizierung. Vor Umsetzung Zugriffsmodell für Lese-/Schreibrechte und Missbrauchsschutz festlegen. Keine privilegierten Supabase-Schlüssel im Browser.
- Bestehende Profillinks und Lernstände erhalten, soweit möglich; Altprofile nicht stillschweigend neu vergeben.

## Daten und Synchronisierung
- Lernstand getrennt nach Profil und App bzw. stabilen Karten-/Aufgaben-IDs.
- Spaced-Repetition-Felder und Wiederholungsverlauf vollständig erhalten; identische Vokabeln über Tests teilen ihre Historie.
- Lokal zuerst weiterarbeiten können; spätere Synchronisierung mit Konfliktbehandlung für zwei Geräte. Nicht einfach blind 'last write wins' auf ganze Lernstände anwenden.
- Migration der vorhandenen lokalen Formate mit Sicherung, idempotentem Import, Testdaten und Rollback. Keine automatischen Löschungen.
- Datenminimierung; keine unnötigen personenbezogenen Informationen. Aufbewahrung/Löschung und Backup definieren.

## Reihenfolge
1. Supabase-Projekt und Zugriffsregeln anlegen.
2. Datenmodell und globale Profilreservierung entwickeln; parallele Registrierungen testen.
3. Latein als Pilot anbinden; Offline-Verhalten, zwei Geräte und Konflikte testen.
4. Vorhandene lokale Daten verlustfrei migrieren.
5. Andere Apps einzeln anbinden und Regressionstests durchführen.
6. Monitoring, Backups und Ausfalltests dokumentieren.

## Free-Tarif und Inaktivität
Kostenlos starten. Ein täglicher GitHub-Actions-Keep-alive ist nur eine geplante Maßnahme, keine Garantie gegen Pausierung; aktuelle Anbieterregeln vor Einrichtung prüfen. Offline-Betrieb und Wiederanlauf testen. Keine Zugangsdaten im Repository hinterlegen.

## Abnahmekriterien
- Zwei zeitgleiche Reservierungen desselben Profilnamens: exakt eine erfolgreich.
- Geräteübergreifende Lernstände erscheinen im richtigen Profil.
- Andere Profile bleiben isoliert.
- Offline-Übungen bleiben erhalten und synchronisieren nach Rückkehr der Verbindung.
- Wiederholungsdaten bleiben nach Update, Browser-Neustart und Migration erhalten.

## Implementierungsstand 2026-11-14
- Nutzer hat das Supabase-Projekt angelegt und die leeren Tabellen `profiles` und `learning_events` mit RLS und entzogenen Tabellenrechten per SQL Editor erstellt (gemeldeter Erfolg, nicht unabhängig aus der Datenbank verifiziert).
- Die atomare Reservierungsfunktion wurde laut Nutzer im Supabase SQL Editor erfolgreich ausgeführt; ihre versionierte Vorlage liegt als Migration unter `supabase/migrations/20261114_01_reserve_profile.sql` auf dem Feature-Branch.
- Profilgeheimnisse: 32 kryptographisch zufällige Bytes, lowercase hex; nur SHA-256-Hash in der Datenbank. Geheimnis gehört in das URL-Fragment, nicht in Query-Parameter oder Serverlogs.
- Die Reservierungsfunktion erhält ausschließlich `EXECUTE` für `anon`; die Tabellen bleiben ohne direkte Browserrechte. Weitere Zugriffs- und Synchronisationsfunktionen sind noch nicht implementiert.
- Vor Anwendung prüfen, ob `extensions.digest` verfügbar ist. Bei Fehler keine unsichere Ersatzfunktion verwenden.
- Der sequentielle Doppelreservierungstest wurde am 2026-11-14 mit erwartetem Fehler `23505: Profile name already reserved` bestätigt; der Test lief in einer Transaktion und wurde zurückgerollt. Kein Parallelitätstest und kein Browser-API-Test durchgeführt.
- Noch ausstehend: echte parallele Reservierung, isolierter Lese-/Schreibzugriff, Missbrauchsschutz, Offline-Merge und Migrationstests.

## Direkt geprüfter Stand (2026-11-14)
- Supabase-Verbindung zu Projekt `velspjtxenbvvwgptahh` funktioniert.
- `append_learning_event` und `read_learning_events` wurden direkt in der Datenbank erstellt; Schreiben und Lesen in einer zurückgerollten Testtransaktion erfolgreich (1 Ereignis).
- `anon` hat EXECUTE auf den beiden RPCs, jedoch keinen direkten SELECT/INSERT-Zugriff auf `learning_events`.
- Öffentliches EXECUTE für `rls_auto_enable()` entzogen und geprüft.
- Sicherheitsadvisor meldet die drei bewusst anonym erreichbaren SECURITY-DEFINER-RPCs; deren Geheimnisprüfung und Missbrauchsschutz sind vor Produktivfreigabe separat zu testen. RLS-ohne-Policy ist bei gesperrten Tabellen beabsichtigt.
- Noch nicht freigegeben: Browserintegration, Profilisolation/Fehlerschlüsseltests, Synchronisationskonflikte, Migration, Rate-Limits, Pagination über 10.000 Ereignisse.

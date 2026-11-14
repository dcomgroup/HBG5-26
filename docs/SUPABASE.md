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

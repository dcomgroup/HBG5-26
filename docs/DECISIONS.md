# Architekturentscheidungen

## 2026-11-14: Ein Repository, gemeinsamer Code
Alle Lernapps in dcomgroup/HBG5-26; persönliche Profile teilen dieselbe App-Version. Keine Nutzer-spezifischen Kopien.

## 2026-11-14: Profilnamen werden vorgeschlagen
Zufällige, schwer zu erratende Namen statt freier Eingabe. Bis zur Backend-Einrichtung kann nur auf dem aktuellen Gerät auf doppelte Namen geprüft werden. Globale Reservierung ist Pflicht bei Supabase-Integration.

## 2026-11-14: Supabase als geplanter zentraler Speicher
GitHub Pages bleibt Hosting; Supabase soll Lernstände geräteübergreifend speichern. Lokaler Speicher bleibt Ausfallreserve. Backend ist noch nicht eingerichtet.

## 2026-11-14: Fehlerbearbeitung zunächst manuell
Fehler-Overlay und GitHub Issues, automatische statische Checks. Keine autonomen Codeänderungen. Mensch entscheidet über Analyse und Umsetzung.

## 2026-11-14: GitHub-Dokumentation ist verpflichtend
Technische Dokumentation liegt versioniert unter docs/. PDF-Appendix verweist auf diese Dateien und ist eine ergänzende, lesbare Referenz. Detaillierter aktueller Stand wird im Repository gepflegt.

## 2026-11-14: Profilreservierung per kontrollierter RPC (in Vorbereitung)
Für Profile wird eine atomare PostgreSQL-INSERT-Operation mit UNIQUE-Constraint verwendet. Der Browser erhält keinen direkten Tabellenzugriff; ein öffentlich aufrufbarer, eng begrenzter SECURITY-DEFINER-RPC nimmt zufällige Profilgeheimnisse entgegen und speichert ausschließlich ihren Hash. Das Geheimnis wird in einem URL-Fragment übergeben. Die Funktion ist zunächst nur als Migration auf einem Feature-Branch abgelegt und noch nicht als produktiv getestet bestätigt.

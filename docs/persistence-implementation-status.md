# Supabase-Persistenz: technischer Arbeitsstand (15.11.2026)

Branch: `feature/persistence-integration-20261115`. Keine Freigabe für `main`.

## Implementiert auf diesem Branch
- Bestehende Startseite reserviert neue Profilnamen über `reserve_profile`; 256-Bit-Zugangsschlüssel wird im URL-Fragment und lokal gespeichert und an App-Links weitergegeben. Vorhandene lokale Profile bleiben lokal, solange keine sichere Migration vorliegt.
- Bestehende produktive Latein-Apps laden einen optionalen Supabase-RPC-Adapter. Das vorhandene UI bleibt unverändert.
- Latein-Bewertungen werden lokal in IndexedDB gespeichert und in einer lokalen Ereignis-Warteschlange für den Upload gehalten. Beim Laden werden Cloud-Ereignisse abgerufen und Kartenstände nach `seen` zusammengeführt. Offline-Ereignisse bleiben für später erhalten.
- SQL-Tests mit `anon`: Profilreservierung, Append, Lesen und Profiltrennung; Wiederholung derselben Event-ID ergibt genau ein Ereignis. Tests wurden in Transaktionen zurückgerollt.
- Syntaxprüfung der geänderten JS-Dateien bestanden.

## Offen / nicht abgenommen
1. Mathe, Deutsch, Englisch und Biologie verwenden unterschiedliche lokale Datenmodelle und haben noch keine Supabase-Anbindung.
2. Sichere, verlustfreie Migration bestehender lokaler Profile und historischer Daten fehlt.
3. Browser-/Mobil-End-to-End-Tests und Offline-Tests auf zwei Geräten fehlen.
4. Konfliktbehandlung bei zeitgleichen Bearbeitungen ist noch nicht ausreichend nachgewiesen. Latein verwendet derzeit die lokale `seen`-Zeit.
5. Sicherheitswarnungen für drei öffentlich aufrufbare SECURITY DEFINER RPCs müssen vor Freigabe geprüft und hinsichtlich Missbrauch/Ratenbegrenzung abgesichert werden.
6. Die vorhandene Startseite ist auf dem Branch für neue Cloud-Profile angepasst; die tatsächliche Darstellung und Navigation sind noch nicht im Browser geprüft.
7. Abnahmekriterien 1 bis 7 des verbindlichen Appendix sind daher **nicht vollständig erfüllt**.

## Release-Gate
**Kein Merge nach main**, bevor alle Kriterien geprüft sind. Die produktive Seite bleibt unverändert.

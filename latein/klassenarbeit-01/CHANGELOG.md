# Changelog

- v1.6.0 (2026-11-22): Klassenarbeit auf Lektionen 2 und 3 korrigiert. 62 Vokabeleinträge direkt aus Bucharchiv S. 138–141; Lektion-1-only-Karten entfernt. Grammatik- und Satzfragen an Lektionen 2/3 angepasst und separat versioniert, damit alte Fragebewertungen nicht übernommen werden. Gemeinsame Vokabelhistorie und Panda-Reset bleiben erhalten. Keine Datenbank-Schemaänderung.

- v1.5.3 (2026-11-21): Einmaliger Reset-Knopf ausschließlich für Panda-Latein. Nach Betätigung wird der Knopf mit lokalem dauerhaften Marker ausgeblendet. Reset nur bei leerer Cloud-Latein-Historie und leerer Outbox. Andere Profile und Fächer unberührt.

- v1.5.2 (2026-11-21): Unerwünschten Reset-Knopf entfernt. Keine Lernstände verändert. Selektive Rücknahme heutiger lokaler Testantworten erfordert Zugriff auf die Browserdaten; ältere Stände bleiben geschützt.

- v1.5.1 (2026-11-21): Bestätigter Panda-Reset für den lokalen Latein-Lernstand. Nur bei leerer Cloud-Historie und Outbox. Andere Fächer bleiben unverändert.

- v1.5.0 (2026-11-21): Nach UX-Freigabe bestehende URL-only-Supabase-Anbindung der Latein-App für Klassenarbeit 01 eingebunden. Vokabelstände verwenden dieselben Cloud-Karten-IDs wie bestehender Lateintrainer; Grammatikfragen erhalten eigene IDs. Lokale IndexedDB- und localStorage-Stände bleiben bestehen; Cloud-Ereignisse werden beim Start vorsichtig zusammengeführt, Offline-Outbox bleibt aktiv. Keine Schemaänderung. Zwei-Geräte-/Browser-Abnahme und Offline-Konflikttests noch offen.
- v1.4.0 (2026-11-21): 58 Vokabeln mit grammatischen Angaben.
- v1.3.2 (2026-11-21): Fehlende Buchangaben kenntlich gemacht.
- v1.3.1 (2026-11-21): Buchangaben in vorhandene Karten integriert.
- v1.3.0 (2026-11-21): Archivierte Buchangaben ergänzt.
- v1.2.0 (2026-11-21): Tagesübergreifende Wiederholung.
- v1.1.0 (2026-11-21): Karteikarten und Lernzielbalken.
- v1.0.0 (2026-11-21): Prototyp.

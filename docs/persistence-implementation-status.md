# Supabase-Persistenz: Arbeitsstand 15.11.2026

Branch: `feature/persistence-integration-20261115`. **Keine Freigabe für main.**

## Auf dem Branch implementiert
- Startseite: Supabase-Reservierung neuer Profilnamen, zufälliges 256-Bit-Geheimnis im URL-Fragment, Weitergabe an vorhandene App-Links.
- Latein Test 01/02: gemeinsamer IndexedDB-Lernstand, Offline-Ereigniswarteschlange, Cloud-Abgleich, einmalige lokale Migration.
- Englisch Test 01: Kartenbewertungen mit lokalem Outbox- und Cloud-Abgleich.
- Biologie Klassenarbeit 01: Bewertungen mit lokalem Outbox- und Cloud-Abgleich.
- Mathe Test 01: Kartenstände und Rundenstatistik mit lokalem Outbox- und Cloud-Abgleich.
- Deutsch Test 01: Kartenstände mit lokalem Outbox- und Cloud-Abgleich.
- Vorhandene App-Oberflächen wurden nicht bewusst neu gestaltet; bestehende lokale Speicherkeys bleiben erhalten.

## Nachgewiesene technische Tests
- Supabase unter `anon`: Profilreservierung, Lesen/Schreiben, getrennte Profile, falsches Geheimnis blockiert Lesen und Schreiben. **PASS**
- Gleiche Event-UUID mehrfach angehängt: genau ein gespeichertes Ereignis. **PASS**
- JavaScript-Syntaxprüfungen der geänderten App-Dateien. **PASS**

## Offene Abnahme / Risiken
1. Noch keine realen Browser-/Mobiltests auf zwei Geräten. Geräteübergreifende Synchronisation und Offline-Neustart sind daher nicht abgenommen.
2. Konfliktregeln sind derzeit app-spezifisch und überwiegend zeitstempelbasiert. Reale gleichzeitige Änderungen und Import-/Export-Migrationen sind nicht ausreichend getestet.
3. Bestehende Profile ohne Supabase-Geheimnis werden nicht automatisch einem Cloud-Profil zugeordnet. Eine stille Zuordnung wäre unsicher.
4. Deutsch: bestehende Lernprotokolle (`log`) werden nicht vollständig in die Cloud übernommen. Mathe-Rundenzähler können bei paralleler Nutzung nicht zuverlässig additiv zusammengeführt werden.
5. Öffentliche Profilregistrierung braucht Missbrauchsschutz/Ratenbegrenzung; SECURITY DEFINER-Warnungen sind zu prüfen.
6. Keine nachgewiesene Browserregression für Startseite „Als Nächstes dran“, Navigation und die Apps.
7. Kein Deployment auf `main`, daher keine Live-URL-Abnahme.

## Sieben Abnahmekriterien des Supabase-Appendix
1. Startseite/Apps unverändert: **offen (Browserprüfung)**
2. A → B: **offen (Gerätetest)**
3. B → A und Profiltrennung: **teilweise (Datenbank-Isolation PASS, Gerätetest offen)**
4. Offline, Neustart, Duplikate: **teilweise (SQL-Duplikattest PASS, Offline-Browsertest offen)**
5. Lernmechaniken, Latein-Testverbund, Export/Import: **offen (Regressionstest)**
6. Lokale Daten, Migration, Wiederherstellung: **teilweise implementiert, nicht abgenommen**
7. Automatisierte und reale Tests, Security, Deployment: **offen**

**Release-Gate: Nicht mergen, solange die sieben Kriterien nicht nachweislich erfüllt sind.**

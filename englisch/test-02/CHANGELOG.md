# Changelog

## v1.0.0 · 2026-11-25
- 42 Vokabeln S. 213, 84 Richtungs-Karten, acht pro Runde, automatische Weiterleitung.
- Separater Cloud-App-ID `englisch-test-02`; vorhandene RPCs, kein Schemawechsel. Lokaler Prototyp bleibt unverändert; keine automatische Übernahme fremder lokaler Profile.
- Supabase-Auswirkung: ja, neue app-spezifische Ereignisse; Offline-Outbox, UUID-Deduplizierung, chronologische Bewertung. Live- und Zwei-Geräte-Abnahme ausstehend.

- Tests: JS-Syntax, 84 Karten, 8er-Runden, Aufdecken ohne Bewertung, automatische Folgekarte, Offline-Neuladen, Wiederverbindung, simulierte getrennte Geräte/Profile bestanden. Live-SQL unter anon: UUID-Deduplizierung und App-Isolation bestanden (Rollback). Reale Browser-/Zwei-Geräte-Abnahme ausstehend.

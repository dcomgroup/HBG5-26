# Agent instructions for HBG5-26

**Before any code or app work:** read [docs/PROJECT_RULES.md](docs/PROJECT_RULES.md) from the current repository branch in full. Also inspect relevant issues, existing app code and current user instructions. Do not rely on stale copies of project PDFs or remembered rules.

For every app creation or modification, explicitly check and report whether Supabase data, schema, profile mapping, persistence or synchronization is affected. Preserve existing local and cloud learning progress.

V1.0 new-app workflow: prototype without Supabase, iterate on UX, wait for explicit user approval, then connect persistence. Existing approved apps may be migrated separately without UI redesign. V2.0 architecture ideas belong to issue #10, not V1.0.

Never claim deployment or data migration succeeded without verification. If you cannot read the rules, stop before modifying files.

**Verbindlicher Profilzugriff, Vorrang vor alten Issues und Implementierungen:** Ausschließlich die Profil-URL `?p=<profilkennung>` berechtigt zum Lesen und Schreiben desselben Supabase-Lernstands auf allen Geräten. Kein `#sync`, kein weiterer Schlüssel, keine Anmeldung oder Freischaltung. Siehe Abschnitt 9 in `docs/PROJECT_RULES.md`. Ältere widersprechende Vorgaben nicht übernehmen.

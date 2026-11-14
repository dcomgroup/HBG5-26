# Architektur und Ist-Zustand

Stand: 2026-11-14

- Repository: https://github.com/dcomgroup/HBG5-26
- Hosting: GitHub Pages, main / (root)
- Startseite: https://dcomgroup.github.io/HBG5-26/
- Gemeinsamer statischer App-Code für alle Nutzer; keine App-Kopien pro Profil.
- Prüfungswege: fach/test-NN/ oder fach/klassenarbeit-NN/. Nummern kennzeichnen Prüfungen, keine Software-Releases.
- Profile werden derzeit über URL-Pfad bzw. Query-Parameter an Apps übergeben. Der Pfad wird über 404.html auf die Startseite umgeleitet.
- Profilvorschläge: zufällige Tiernamen mit acht Hex-Zeichen. Aktuell nur gerätelokale Dublettenprüfung. **Keine** globale Reservierung oder verlässliche Kollisionsprüfung.
- Lernstände derzeit lokal in localStorage oder IndexedDB. Profiltrennung ist nicht in allen Apps vollständig durchgezogen; keinesfalls bereits geräteübergreifende Synchronisation annehmen.
- Latein nutzt IndexedDB `hbg5-26-latein-v1`, Store `progress`, Schlüssel Profil. Andere Apps verwenden eigene lokale Datenformate.
- Gemeinsame Fehlermeldungsoberfläche: `shared/feedback.js`. Öffnet vorausgefülltes GitHub Issue; absendende Person benötigt GitHub-Konto. Kein anonymer Empfangsdienst.
- Statische Prüfungen: `.github/workflows/lernapps-check.yml` und `scripts/check-apps.cjs`. Keine bestätigten End-to-End- oder Regressionstests.
- App-Versionierung: Das Referenzregelwerk verlangt VERSION/app.json und CHANGELOG je App; Vollständigkeit vor Änderungen inventarisieren, nicht voraussetzen.

## Betrieb
Bei Codeänderungen werden die statischen Dateien für alle Nutzer gemeinsam aktualisiert. Browser-Caches und Deployment-Verzögerungen berücksichtigen. Aktuelle Version und Deploy-Status vor Erfolgsmeldungen prüfen.

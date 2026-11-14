from pathlib import Path
import json, re, os
root=Path("biologie/klassenarbeit-01")
root.mkdir(parents=True,exist_ok=True)
cards_path=root/"cards.json"
cards=json.loads(cards_path.read_text(encoding="utf-8"))
fixes={
 "HAUT_11_lederhaut":"Die Lederhaut liegt unter der Oberhaut. Sie enthält Blutgefäße, Nerven und Sinneskörperchen, die unter anderem Berührungen und Temperaturreize wahrnehmen.",
 "auge_innen_lederhaut":"Die widerstandsfähige Lederhaut bildet die äußere Hülle des Augapfels und schützt ihn. (S. 38)"
}
for c in cards:
 if c["id"] in fixes:c["info"]=fixes[c["id"]]
assert len(cards)==52
cards_path.write_text(json.dumps(cards,ensure_ascii=False),encoding="utf-8")
p=root/"index.html"
html=p.read_text(encoding="utf-8")
match=re.search(r"const CARDS=(\[.*?\]);let cards=CARDS",html,re.S)
assert match,"Embedded cards not found"
html=html[:match.start(1)]+json.dumps(cards,ensure_ascii=False)+html[match.end(1):]
# Keep legacy profile data schema unchanged, but isolate the new app from other apps on the shared origin.
html=html.replace("'profiles-v1'","'hbg5-26-bio-ka01-profiles-v1'").replace("'profile-v1'","'hbg5-26-bio-ka01-profile-v1'").replace("'learn-v1-'","'hbg5-26-bio-ka01-learn-v1-'")
html=html.replace("</body>","<script src=\"enhancements.js\"></script></body>")
p.write_text(html,encoding="utf-8")
(root/"VERSION").write_text("v1.1.0 | 2026-11-14\n",encoding="utf-8")
(root/"CHANGELOG.md").write_text("# Änderungen\n\n## v1.1.0 (2026-11-14)\n- Migration der 52 Bildkarten aus der bestehenden App.\n- Korrektur Lederhaut bei Haut und Auge.\n- Wiederholbare kurze Runden und bevorzugte schwierige Karten.\n- JSON-Import/Export zur Übernahme vorhandener Lernstände zwischen Domains.\n\n## v1.0.0\n- Inventarisierter Ausgangsstand der bisherigen Lernapp.\n",encoding="utf-8")

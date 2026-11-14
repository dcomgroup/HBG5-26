(()=>{"use strict";
if(document.getElementById("hbg-feedback-button"))return;
const css=document.createElement("style");css.textContent=`
#hbg-feedback-button{position:fixed;right:16px;bottom:16px;z-index:2147483000;border:0;border-radius:30px;background:#244fba;color:white;padding:12px 17px;font:600 14px system-ui;box-shadow:0 3px 15px #0003;cursor:pointer}
#hbg-feedback-overlay{position:fixed;inset:0;background:#0008;z-index:2147483001;display:flex;align-items:center;justify-content:center;padding:16px}
#hbg-feedback-panel{width:min(100%,440px);background:white;color:#172235;padding:22px;border-radius:16px;font:16px system-ui;box-shadow:0 8px 40px #0003}
#hbg-feedback-panel textarea{display:block;width:100%;min-height:110px;box-sizing:border-box;padding:12px;font:inherit;border:1px solid #abb7ca;border-radius:9px;margin:12px 0}
#hbg-feedback-panel button{font:inherit;border:1px solid #bbc4d3;border-radius:9px;padding:10px;cursor:pointer;background:white;color:#172235}
#hbg-feedback-panel button.primary{background:#244fba;color:white;border-color:#244fba}
#hbg-feedback-panel .small{font-size:12px;color:#586478}
`;document.head.append(css);
const btn=document.createElement("button");btn.id="hbg-feedback-button";btn.textContent="🐞 Fehler melden";document.body.append(btn);
btn.onclick=()=>{
 const overlay=document.createElement("div");overlay.id="hbg-feedback-overlay";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");
 overlay.innerHTML='<div id="hbg-feedback-panel"><h2>Fehler melden</h2><p>Was funktioniert nicht?</p><textarea id="hbg-feedback-text" maxlength="4000" placeholder="Beschreibe kurz, was passiert ist."></textarea><p class="small">Die App-Seite und Version werden mitgesendet. Bitte keine Namen oder persönlichen Daten eintragen.</p><button class="primary" id="hbg-feedback-send">Meldung vorbereiten</button> <button id="hbg-feedback-close">Abbrechen</button><p class="small" id="hbg-feedback-status">Zum Absenden öffnet sich GitHub. Dafür ist ein GitHub-Konto erforderlich.</p></div>';
 document.body.append(overlay);const area=overlay.querySelector("textarea");area.focus();
 overlay.querySelector("#hbg-feedback-close").onclick=()=>overlay.remove();
 overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};
 overlay.querySelector("#hbg-feedback-send").onclick=()=>{
  const description=area.value.trim();if(description.length<8){overlay.querySelector("#hbg-feedback-status").textContent="Bitte beschreibe den Fehler mit mindestens 8 Zeichen.";return}
  const version=document.querySelector('meta[name="app-version"]')?.content||"nicht angegeben";
  const page=location.origin+location.pathname;
  const body="### Fehlerbeschreibung\n"+description+"\n\n### Technische Angaben\n- Seite: "+page+"\n- App-Version: "+version+"\n- Zeitpunkt: "+new Date().toISOString()+"\n\nAutomatisch aus der Lernapp vorbereitet. Keine Lernstände übertragen.";
  const title="[Lernapp] Fehlermeldung: "+description.slice(0,70);
  const target="https://github.com/dcomgroup/HBG5-26/issues/new?"+new URLSearchParams({title,body}).toString();
  const link=document.createElement("a");link.href=target;link.target="_blank";link.rel="noopener noreferrer";link.click();
  overlay.querySelector("#hbg-feedback-status").textContent="GitHub wurde geöffnet. Bitte dort auf „Submit new issue“ klicken. Falls nichts geöffnet wurde, Link kopieren.";
  if(!overlay.querySelector("#hbg-feedback-copy")){const copy=document.createElement("button");copy.id="hbg-feedback-copy";copy.textContent="Meldelink kopieren";copy.onclick=()=>navigator.clipboard.writeText(target);overlay.querySelector("#hbg-feedback-panel").append(copy)}
 };
};
})();
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
 overlay.innerHTML='<div id="hbg-feedback-panel"><h2>Fehler melden</h2><p>Was funktioniert nicht?</p><textarea id="hbg-feedback-text" maxlength="4000" placeholder="Beschreibe kurz, was passiert ist."></textarea><p class="small">Die App-Seite und Version werden mitgesendet. Bitte keine Namen oder persönlichen Daten eintragen.</p><button class="primary" id="hbg-feedback-send">Fehler melden</button> <button id="hbg-feedback-close">Abbrechen</button><p class="small" id="hbg-feedback-status">Die Meldung wird direkt übermittelt. Kein Konto erforderlich.</p></div>';
 document.body.append(overlay);const area=overlay.querySelector("textarea");area.focus();
 overlay.querySelector("#hbg-feedback-close").onclick=()=>overlay.remove();
 overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};
 overlay.querySelector("#hbg-feedback-send").onclick=async()=>{
  const description=area.value.trim(),status=overlay.querySelector("#hbg-feedback-status"),send=overlay.querySelector("#hbg-feedback-send");
  if(description.length<8){status.textContent="Bitte beschreibe den Fehler mit mindestens 8 Zeichen.";return}
  const version=document.querySelector('meta[name="app-version"]')?.content||"nicht angegeben";
  send.disabled=true;status.textContent="Meldung wird gesendet …";
  try{
   const response=await fetch("https://velspjtxenbvvwgptahh.supabase.co/rest/v1/hbg_feedback_reports",{
    method:"POST",headers:{"apikey":"sb_publishable_PupDfjNg0FdAGU6yJsxeBg_kGYhgMAS","Content-Type":"application/json","Prefer":"return=minimal"},
    body:JSON.stringify({description,page_path:location.pathname,app_version:version})
   });
   if(!response.ok)throw Error("HTTP "+response.status);
   status.textContent="Danke, die Fehlermeldung wurde gespeichert.";
   send.textContent="Gesendet";area.disabled=true;
  }catch(error){status.textContent="Senden fehlgeschlagen. Bitte später erneut versuchen.";send.disabled=false}
 }
};
})();
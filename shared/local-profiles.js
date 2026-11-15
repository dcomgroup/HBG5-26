(function(){
"use strict";
const root=document.getElementById("local-profile-manager");
if(!root)return;
const SELECT="hbg5-26-selected-local-profile";
const parse=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
const add=(set,v)=>{if(typeof v==="string"&&v.trim()&&v!=="__demo__")set.add(v.trim())};
function names(){
 const set=new Set(),m=parse("hbg5-26-mathe-test-01"),e=parse("hbg5-26-englisch-vocab"),d=parse("hbg5-26:deutsch:test-01:profiles-v1"),b=parse("hbg5-26-bio-ka01-profiles-v1");
 for(const p of Object.keys(m?.profiles||{}))add(set,p);
 for(const p of Object.keys(e?.profiles||{}))add(set,p);
 for(const p of Object.values(d?.profiles||{}))add(set,p?.profile);
 for(const p of b||[])add(set,p);
 add(set,localStorage.getItem("hbg5-26-latein-profile"));
 return [...set].sort((a,b)=>a.localeCompare(b,"de"));
}
function selected(){return localStorage.getItem(SELECT)||""}
function setLinks(){
 document.querySelectorAll(".exam a,.upcoming-item a").forEach(a=>{
  const url=new URL(a.href);
  url.searchParams.delete("local");
  if(selected())url.searchParams.set("local",selected());
  a.href=url.href;
 });
}
function render(){
 const items=names(),current=selected();
 root.replaceChildren();
 const heading=document.createElement("h3");heading.textContent="Lokale Lernprofile";root.append(heading);
 const label=document.createElement("label");label.textContent="Aktives lokales Profil ";
 const select=document.createElement("select");select.id="local-profile-select";
 const empty=document.createElement("option");empty.value="";empty.textContent="In der Lernapp auswählen";select.append(empty);
 for(const name of items){const option=document.createElement("option");option.value=option.textContent=name;select.append(option)}
 select.value=items.includes(current)?current:"";
 label.append(select);root.append(label);
 const buttons=document.createElement("div");buttons.style.marginTop="12px";
 const create=document.createElement("button");create.textContent="Lokales Profil anlegen";
 const remove=document.createElement("button");remove.textContent="Lernstand dieses Profils löschen";remove.style.marginLeft="8px";remove.disabled=!select.value;
 buttons.append(create,remove);root.append(buttons);
 const message=document.createElement("p");message.className="hint";root.append(message);
 select.onchange=()=>{if(select.value)localStorage.setItem(SELECT,select.value);else localStorage.removeItem(SELECT);remove.disabled=!select.value;setLinks();};
 create.onclick=()=>{const name=prompt("Name für das neue lokale Profil:")?.trim();if(!name)return;if(name.length>40){message.textContent="Maximal 40 Zeichen.";return}localStorage.setItem(SELECT,name);render();setLinks();};
 remove.onclick=async()=>{
  const name=select.value;if(!name)return;
  if(!confirm('Lokale Lernstände von "'+name+'" in allen Lernapps auf diesem Gerät dauerhaft löschen? Cloud-Daten bleiben erhalten.'))return;
  if(!confirm('Wirklich löschen? Bitte vorher bei Bedarf alle lokalen Lernstände exportieren.'))return;
  try{await erase(name);if(selected()===name)localStorage.removeItem(SELECT);render();setLinks();location.reload()}catch(err){message.textContent="Löschen fehlgeschlagen: "+err.message}
 };
 setLinks();
}
async function erase(name){
 const math=parse("hbg5-26-mathe-test-01");if(math?.profiles?.[name]){delete math.profiles[name];localStorage.setItem("hbg5-26-mathe-test-01",JSON.stringify(math))}
 const english=parse("hbg5-26-englisch-vocab");if(english?.profiles?.[name]){delete english.profiles[name];localStorage.setItem("hbg5-26-englisch-vocab",JSON.stringify(english))}
 const dk="hbg5-26:deutsch:test-01:profiles-v1",german=parse(dk);
 if(german?.profiles){for(const [key,p] of Object.entries(german.profiles))if(p?.profile===name)delete german.profiles[key];if(!german.profiles[german.active])german.active=Object.keys(german.profiles)[0]||"";localStorage.setItem(dk,JSON.stringify(german))}
 const bk="hbg5-26-bio-ka01-profiles-v1",bio=parse(bk);if(Array.isArray(bio)){localStorage.setItem(bk,JSON.stringify(bio.filter(x=>x!==name)));localStorage.removeItem("hbg5-26-bio-ka01-learn-v1-"+name);if(localStorage.getItem("hbg5-26-bio-ka01-profile-v1")===name)localStorage.removeItem("hbg5-26-bio-ka01-profile-v1")}
 if(!indexedDB)return;
 await new Promise((resolve,reject)=>{
  const request=indexedDB.open("hbg5-26-latein-v1");
  request.onupgradeneeded=()=>request.transaction.abort();
  request.onerror=()=>resolve();
  request.onsuccess=()=>{
   const db=request.result;
   if(!db.objectStoreNames.contains("progress")){db.close();resolve();return}
   const tx=db.transaction("progress","readwrite");tx.objectStore("progress").delete(name);
   tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)};
  };
 });
 if(localStorage.getItem("hbg5-26-latein-profile")===name)localStorage.removeItem("hbg5-26-latein-profile");
}
window.HBG_LOCAL_PROFILES={mount:render,links:setLinks};
})();

(function(){
"use strict";
const root=document.getElementById("local-profile-manager");
if(!root)return;
const SELECT="hbg5-26-selected-local-profile";
const REGISTRY="hbg5-26-local-profile-names-v1";
const parse=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
const add=(set,v)=>{if(typeof v==="string"&&v.trim()&&v!=="__demo__")set.add(v.trim())};
function names(){
 const set=new Set(),q=parse("hbg5-26-mathe-schnellcheck-v1"),m=parse("hbg5-26-mathe-test-01"),e=parse("hbg5-26-englisch-vocab"),d=parse("hbg5-26:deutsch:test-01:profiles-v1"),b=parse("hbg5-26-bio-ka01-profiles-v1");
 for(const p of Object.keys(m?.profiles||{}))add(set,p);
 for(const p of Object.keys(q||{}))add(set,p);
 for(const p of Object.keys(e?.profiles||{}))add(set,p);
 for(const p of Object.values(d?.profiles||{}))add(set,p?.profile);
 for(const p of Array.isArray(b)?b:[])add(set,p);
 add(set,localStorage.getItem("hbg5-26-latein-profile"));
 for(const p of Array.isArray(parse(REGISTRY))?parse(REGISTRY):[])add(set,p);
 add(set,selected());
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
function remember(name){
 const stored=parse(REGISTRY);const entries=new Set(Array.isArray(stored)?stored:[]);entries.add(name);
 localStorage.setItem(REGISTRY,JSON.stringify([...entries]));
}
function choose(name){
 localStorage.setItem(SELECT,name);remember(name);
 render();setLinks();window.dispatchEvent(new Event("hbg-local-profile-changed"));
}
function render(){
 const items=names(),current=selected();
 root.replaceChildren();
 const heading=document.createElement("h3");heading.textContent="Lokales Lernprofil";root.append(heading);
 if(!current){
  const promptText=document.createElement("p");promptText.textContent="Wie heißt du? Lege ein Profil an, damit deine Lernstände gespeichert werden.";root.append(promptText);
 }else{
  const currentText=document.createElement("p");currentText.textContent="Aktuell ausgewähltes Profil: "+current;root.append(currentText);
 }
 if(items.length){
  const label=document.createElement("label");label.textContent="Profil wechseln ";
  const select=document.createElement("select");select.id="local-profile-select";
  const empty=document.createElement("option");empty.value="";empty.textContent="Profil auswählen";select.append(empty);
  for(const name of items){const option=document.createElement("option");option.value=option.textContent=name;select.append(option)}
  select.value=items.includes(current)?current:"";
  select.onchange=()=>{if(select.value)choose(select.value)};
  label.append(select);root.append(label);
 }
 const form=document.createElement("form");form.style.marginTop="14px";
 const input=document.createElement("input");input.placeholder="Dein Name";input.maxLength=40;input.required=true;input.setAttribute("aria-label","Name für neues Profil");input.style.maxWidth="100%";
 const create=document.createElement("button");create.type="submit";create.textContent="Neues Profil anlegen";create.style.marginLeft="6px";
 form.append(input,create);root.append(form);
 const message=document.createElement("p");message.className="hint";message.setAttribute("role","status");root.append(message);
 form.onsubmit=e=>{
  e.preventDefault();const name=input.value.trim();
  if(!name||name.length>40)return;
  if(names().some(n=>n.toLocaleLowerCase("de")===name.toLocaleLowerCase("de"))){message.textContent="Dieses Profil gibt es bereits. Bitte über das Dropdown auswählen.";return}
  choose(name);
 };

 setLinks();
}
async function erase(name){
 const quick=parse("hbg5-26-mathe-schnellcheck-v1");if(quick&&Object.hasOwn(quick,name)){delete quick[name];localStorage.setItem("hbg5-26-mathe-schnellcheck-v1",JSON.stringify(quick))}
 const math=parse("hbg5-26-mathe-test-01");if(math?.profiles?.[name]){delete math.profiles[name];localStorage.setItem("hbg5-26-mathe-test-01",JSON.stringify(math))}
 const english=parse("hbg5-26-englisch-vocab");if(english?.profiles?.[name]){delete english.profiles[name];localStorage.setItem("hbg5-26-englisch-vocab",JSON.stringify(english))}
 const dk="hbg5-26:deutsch:test-01:profiles-v1",german=parse(dk);
 if(german?.profiles){for(const [key,p] of Object.entries(german.profiles))if(p?.profile===name)delete german.profiles[key];if(!german.profiles[german.active])german.active=Object.keys(german.profiles)[0]||"";localStorage.setItem(dk,JSON.stringify(german))}
 const bk="hbg5-26-bio-ka01-profiles-v1",bio=parse(bk);if(Array.isArray(bio)){localStorage.setItem(bk,JSON.stringify(bio.filter(x=>x!==name)));localStorage.removeItem("hbg5-26-bio-ka01-learn-v1-"+name);if(localStorage.getItem("hbg5-26-bio-ka01-profile-v1")===name)localStorage.removeItem("hbg5-26-bio-ka01-profile-v1")}
 if(!window.indexedDB)return;
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
window.HBG_LOCAL_PROFILES={mount:render,links:setLinks,selected};
})();

/* Explicit, restartable V1 local-to-cloud migration. Never deletes source data.
 * Existing remote app data is left untouched; the user must resolve it separately.
 */
(function(){
"use strict";
const transport=window.HBG_CLOUD_TRANSPORT;
const parse=k=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch{return null}};
const stateKey="hbg5-26-v1-migration:";
const apps=["mathe","mathe-schnellcheck","englisch","deutsch","biologie","latein"];
async function latinRead(profile){
 return new Promise(resolve=>{
  if(!window.indexedDB)return resolve({});
  const req=indexedDB.open("hbg5-26-latein-v1");
  let created=false;
  req.onupgradeneeded=()=>{created=true;req.transaction.abort()};
  req.onerror=()=>resolve({});
  req.onsuccess=()=>{
   const db=req.result;
   if(created||!db.objectStoreNames.contains("progress")){db.close();resolve({});return}
   const tx=db.transaction("progress","readonly"),get=tx.objectStore("progress").get(profile);
   get.onsuccess=()=>{const result=get.result||{};db.close();resolve(result)};
   get.onerror=()=>{db.close();resolve({})};
  };
 });
}
async function latinProfiles(){
 return new Promise(resolve=>{
  if(!window.indexedDB)return resolve([]);
  const req=indexedDB.open("hbg5-26-latein-v1");let created=false;
  req.onupgradeneeded=()=>{created=true;req.transaction.abort()};
  req.onerror=()=>resolve([]);
  req.onsuccess=()=>{
   const db=req.result;
   if(created||!db.objectStoreNames.contains("progress")){db.close();resolve([]);return}
   const keys=db.transaction("progress","readonly").objectStore("progress").getAllKeys();
   keys.onsuccess=()=>{db.close();resolve(keys.result.filter(k=>typeof k==="string"&&!k.startsWith("__")))};
   keys.onerror=()=>{db.close();resolve([])};
  };
 });
}
async function sources(){
 const names=new Set(parse("hbg5-26-local-profile-names")||[]);
 for(const k of ["hbg5-26-mathe-test-01","hbg5-26-englisch-vocab"]){
  for(const n of Object.keys(parse(k)?.profiles||{}))names.add(n);
 }
 for(const [id,p] of Object.entries(parse("hbg5-26:deutsch:test-01:profiles-v1")?.profiles||{}))names.add(p.profile||id);
 for(const n of parse("hbg5-26-bio-ka01-profiles-v1")||[])names.add(n);
 for(const n of Object.keys(parse("hbg5-26-mathe-schnellcheck-v1")||{}))if(!n.startsWith("_"))names.add(n);
 for(const n of await latinProfiles())names.add(n);
 return [...names].filter(n=>typeof n==="string"&&n.trim()&&n!=="__demo__").sort();
}
function event(appId,cardId,state,at){
 return {id:crypto.randomUUID(),appId,cardId:String(cardId),data:{state:JSON.parse(JSON.stringify(state))},at:at||new Date().toISOString()};
}
async function snapshot(source){
 const events=[];
 const math=parse("hbg5-26-mathe-test-01")?.profiles?.[source];
 if(math){
  for(const [id,state] of Object.entries(math.cards||{}))events.push(event("mathe",id,state));
  if(math.rounds||math.answers)events.push(event("mathe","__totals__",{rounds:math.rounds||0,answers:math.answers||0,last:math.last}));
 }
 const quick=parse("hbg5-26-mathe-schnellcheck-v1")?.[source];
 if(quick){
  for(const [id,level] of Object.entries(quick.states||{}))events.push(event("mathe-schnellcheck",id,{level}));
  if(quick.rounds||quick.answers)events.push(event("mathe-schnellcheck","__totals__",{rounds:quick.rounds||0,answers:quick.answers||0,last:quick.last}));
 }
 const english=parse("hbg5-26-englisch-vocab")?.profiles?.[source];
 if(english)for(const [id,state] of Object.entries(english.cards||{}))events.push(event("englisch",id,state));
 const german=parse("hbg5-26:deutsch:test-01:profiles-v1")?.profiles?.[source.toLocaleLowerCase("de")];
 if(german){
  for(const [id,state] of Object.entries(german.stats||{}))events.push(event("deutsch",id,state));
  for(const log of german.log||[]){
   const entry={...log,cloudId:/^[0-9a-f-]{36}$/i.test(log.cloudId||"")?log.cloudId:crypto.randomUUID()};
   events.push({id:entry.cloudId,appId:"deutsch",cardId:"__log__",data:{entry},at:entry.date||new Date().toISOString()});
  }
 }
 const bio=parse("hbg5-26-bio-ka01-learn-v1-"+source);
 if(bio)for(const [id,state] of Object.entries(bio))events.push(event("biologie",id,state));
 const latin=await latinRead(source);
 for(const [id,state] of Object.entries(latin))if(id.includes("|"))events.push(event("latein",id,state));
 return events;
}
function planKey(source,target){return stateKey+target+":"+encodeURIComponent(source)}
async function prepare(source,credentials){
 if(!source||source===credentials.slug)throw Error("Quell- und Zielprofil müssen verschieden sein.");
 const key=planKey(source,credentials.slug),existing=parse(key);
 if(existing&&Array.isArray(existing.events))return {key,plan:existing};
 const client=transport.createClient(credentials);
 const events=await snapshot(source),remoteCounts={};
 for(const appId of apps){
  const rows=await client.read(appId);
  if(!Array.isArray(rows))throw Error("Cloud-Abfrage fehlgeschlagen.");
  remoteCounts[appId]=rows.length;
 }
 const selected=events.filter(e=>remoteCounts[e.appId]===0);
 const skipped=events.length-selected.length;
 const plan={version:1,source,target:credentials.slug,createdAt:new Date().toISOString(),events:selected,skipped,remoteCounts,sent:[],complete:false};
 localStorage.setItem(key,JSON.stringify(plan));
 return {key,plan};
}
async function execute(key,credentials){
 const plan=parse(key);
 if(!plan||plan.target!==credentials.slug||!Array.isArray(plan.events))throw Error("Ungültiger Migrationsplan.");
 const client=transport.createClient(credentials),sent=new Set(plan.sent||[]);
 for(const ev of plan.events){
  if(sent.has(ev.id))continue;
  await client.append(ev);
  sent.add(ev.id);plan.sent=[...sent];localStorage.setItem(key,JSON.stringify(plan));
 }
 plan.complete=true;localStorage.setItem(key,JSON.stringify(plan));
 return {imported:sent.size,skipped:plan.skipped};
}
function mount(holder){
 const creds=transport?.credentials(location.search,location.hash,localStorage);
 if(!creds)return;
 const button=document.createElement("button");button.textContent="Lokale Lernstände übernehmen";button.type="button";
 holder.append(button);
 button.onclick=async()=>{
  button.disabled=true;
  const panel=document.createElement("div"),title=document.createElement("p");
  title.textContent="Lokalen Lernstand in dieses Cloud-Profil übernehmen. Vorhandene Cloud-Daten werden niemals überschrieben.";
  const select=document.createElement("select");
  const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="Lokales Quellprofil wählen";select.append(placeholder);
  (await sources()).filter(n=>n!==creds.slug).forEach(n=>{const o=document.createElement("option");o.value=o.textContent=n;select.append(o)});
  const backup=document.createElement("p");
  backup.textContent="Vor der Übernahme unten „Alle lokalen Lernstände exportieren“ ausführen und die JSON-Datei sichern.";
  const check=document.createElement("input");check.type="checkbox";check.id="migration-backup-confirmed";
  const label=document.createElement("label");label.htmlFor=check.id;label.textContent="Sicherungsdatei gespeichert";
  const prepareButton=document.createElement("button");prepareButton.type="button";prepareButton.textContent="Übernahme prüfen";
  const status=document.createElement("p");status.setAttribute("role","status");
  panel.append(title,select,backup,check,label,prepareButton,status);holder.append(panel);
  prepareButton.onclick=async()=>{
   if(!select.value||!check.checked){status.textContent="Bitte Quellprofil wählen und vorher eine Sicherung speichern.";return}
   prepareButton.disabled=true;status.textContent="Cloud-Daten werden auf vorhandene Lernstände geprüft …";
   try{
    const {key,plan}=await prepare(select.value,creds);
    status.textContent=plan.events.length+" Einträge zur Übernahme vorbereitet. "+plan.skipped+" Einträge übersprungen, weil im jeweiligen Fach bereits Cloud-Daten existieren. Lokale Daten bleiben erhalten.";
    if(plan.complete){status.textContent+=" Diese Übernahme wurde bereits abgeschlossen.";return}
    const go=document.createElement("button");go.type="button";go.textContent="Ja, jetzt in Supabase übernehmen";
    panel.append(go);
    go.onclick=async()=>{
     go.disabled=true;status.textContent="Übernahme läuft. Bitte Seite nicht schließen.";
     try{const result=await execute(key,creds);status.textContent=result.imported+" Einträge bestätigt. "+result.skipped+" übersprungen. Lokale Lernstände unverändert."}
     catch{status.textContent="Übernahme unterbrochen. Bereits bestätigte Einträge bleiben erhalten. Dieselbe Übernahme kann wiederholt werden.";go.disabled=false}
    };
   }catch{status.textContent="Vorbereitung fehlgeschlagen. Keine lokalen Daten verändert.";prepareButton.disabled=false}
  };
 };
}
window.HBG_V1_MIGRATE=Object.freeze({sources,snapshot,prepare,execute,mount});
})();

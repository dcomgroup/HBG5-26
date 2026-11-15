/* V1 Latin cloud sync. Shared between tests, local IndexedDB remains primary. */
(function(){
"use strict";
const t=window.HBG_CLOUD_TRANSPORT;
const creds=t?.credentials(location.search,location.hash,localStorage);
if(!creds){window.HBG_LATIN_CLOUD={enabled:false};return}
const client=t.createClient(creds),slug=creds.slug,appId="latein",key="hbg5-26-latein-outbox:"+slug;
let syncing=false,again=false;
function pending(){try{const v=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(v)?v:[]}catch{return[]}}
function record(cardId,state){
 const at=new Date().toISOString();
 const ev={id:crypto.randomUUID(),appId,cardId,data:{state:{...state}},at};
 localStorage.setItem(key,JSON.stringify([...pending(),ev]));
 state._cloudAt=Date.parse(at);
 void sync({pushOnly:true});
}
async function sync(options={}){
 if(syncing){again=true;return null}
 syncing=true;
 try{
  for(const ev of pending()){
   await client.append(ev);
   localStorage.setItem(key,JSON.stringify(pending().filter(x=>x.id!==ev.id)));
  }
  if(options.pushOnly)return [];
  return await client.read(appId);
 }catch{return null}
 finally{syncing=false;if(again){again=false;queueMicrotask(()=>void sync({pushOnly:true}))}}
}
window.addEventListener("online",()=>void sync({pushOnly:true}));
window.HBG_LATIN_CLOUD=Object.freeze({enabled:true,slug,record,sync,pending:()=>pending().length});
})();

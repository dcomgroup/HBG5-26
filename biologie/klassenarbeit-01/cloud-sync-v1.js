/* V1 Biology cloud sync, no automatic import of legacy local profiles. */
(function(){
"use strict";
const t=window.HBG_CLOUD_TRANSPORT,creds=t?.credentials(location.search,location.hash,localStorage);
if(!creds){window.HBG_BIO_CLOUD={enabled:false};return}
const client=t.createClient(creds),slug=creds.slug,appId="biologie",outboxKey="hbg5-26-bio-outbox:"+slug;
let syncing=false,again=false;
const pending=()=>{try{const v=JSON.parse(localStorage.getItem(outboxKey)||"[]");return Array.isArray(v)?v:[]}catch{return[]}};
function record(cardId,state){
 const at=new Date().toISOString(),ev={id:crypto.randomUUID(),appId,cardId,data:{state:{...state}},at};
 localStorage.setItem(outboxKey,JSON.stringify([...pending(),ev]));
 state._cloudAt=Date.parse(at);
 void sync({pushOnly:true});
}
async function sync(options={}){
 if(syncing){again=true;return null}
 syncing=true;
 try{
  for(const ev of pending()){
   await client.append(ev);
   localStorage.setItem(outboxKey,JSON.stringify(pending().filter(x=>x.id!==ev.id)));
  }
  return options.pushOnly?[]:await client.read(appId);
 }catch{return null}
 finally{syncing=false;if(again){again=false;queueMicrotask(()=>void sync({pushOnly:true}))}}
}
window.addEventListener("online",()=>void sync({pushOnly:true}));
window.HBG_BIO_CLOUD=Object.freeze({enabled:true,slug,record,sync,pending:()=>pending().length});
})();

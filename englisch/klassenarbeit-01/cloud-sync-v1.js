/* Cloud sync for English Classwork 01. URL profile only; uses shared V1 event table. */
(function(){
"use strict";
const t=window.HBG_CLOUD_TRANSPORT,c=t?.credentials(location.search,location.hash,localStorage);
if(!c){window.HBG_ENGLISH_CA_CLOUD={enabled:false};return}
const client=t.createClient(c),slug=c.slug,appId="englisch-klassenarbeit-01";
const queueKey="hbg5-26-englisch-klassenarbeit-01-outbox:"+slug;
const stateKey="hbg5-26-englisch-klassenarbeit-01";
let syncing=false,again=false;
function queue(){try{const a=JSON.parse(localStorage.getItem(queueKey)||"[]");return Array.isArray(a)?a:[]}catch{return[]}}
function local(){try{return JSON.parse(localStorage.getItem(stateKey))||{profiles:{}}}catch{return{profiles:{}}}}
async function sync(options={}){
 if(syncing){again=true;return false}syncing=true;
 try{
  for(const ev of queue()){
   await client.append(ev);
   localStorage.setItem(queueKey,JSON.stringify(queue().filter(x=>x.id!==ev.id)));
  }
  if(options.pushOnly)return true;
  const db=local(),p=db.profiles?.[slug];if(!p)return true;p.cards||={};
  const rows=await client.read(appId),latest=new Map();
  for(const row of rows){if(!/^u[1-6]-[a-z0-9-]+$/.test(row.card_id||""))continue;const d=Date.parse(row.occurred_at)||0;if(!latest.has(row.card_id)||d>latest.get(row.card_id).d)latest.set(row.card_id,{d,state:row.event_data?.state})}
  let changed=false;
  for(const [id,x] of latest){const remote=x.state,localCard=p.cards[id];if(!remote)continue;if(queue().some(e=>e.cardId===id))continue;
   const remoteCount=Number(remote.right||0)+Number(remote.wrong||0),localCount=Number(localCard?.right||0)+Number(localCard?.wrong||0);
   if(localCard&&remoteCount<localCount){window.dispatchEvent(new CustomEvent("hbg-cloud-conflict",{detail:{appId,cardId:id,reason:"remote-attempt-count-regressed"}}));continue}
   if(localCard&&remoteCount===localCount&&(Number(remote.right||0)!==Number(localCard.right||0)||Number(remote.wrong||0)!==Number(localCard.wrong||0))){window.dispatchEvent(new CustomEvent("hbg-cloud-conflict",{detail:{appId,cardId:id,reason:"divergent-equal-attempts"}}));continue}
   if(!localCard||x.d>Number(localCard._cloudAt||0)){p.cards[id]={...remote,_cloudAt:x.d};changed=true}
  }
  if(changed)localStorage.setItem(stateKey,JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("hbg-cloud-synced",{detail:{appId}}));return true;
 }catch{window.dispatchEvent(new CustomEvent("hbg-cloud-pending",{detail:{appId}}));return false}
 finally{syncing=false;if(again){again=false;queueMicrotask(()=>void sync({pushOnly:true}))}}
}
function record(cardId,state){
 const ev={id:crypto.randomUUID(),appId,cardId,data:{state:{...state}},at:new Date().toISOString()};
 localStorage.setItem(queueKey,JSON.stringify([...queue(),ev]));
 state._cloudAt=Date.parse(ev.at);void sync({pushOnly:true});
}
window.addEventListener("online",()=>void sync());
window.HBG_ENGLISH_CA_CLOUD=Object.freeze({enabled:true,slug,record,sync,pending:()=>queue().length});
})();
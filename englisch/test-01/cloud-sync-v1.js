/* V1 English cloud adapter. Enabled only with an explicit cloud credential.
 * No implicit import of legacy local profiles; see Issue #7.
 */
(function () {
"use strict";
const transport=window.HBG_CLOUD_TRANSPORT;
const credentials=transport?.credentials(location.search,location.hash,localStorage);
if(!credentials){window.HBG_ENGLISH_CLOUD={enabled:false};return}
const client=transport.createClient(credentials);
const slug=credentials.slug;
const outboxKey="hbg5-26-englisch-outbox:"+slug;
const stateKey="hbg5-26-englisch-vocab";
const appId="englisch";
let syncing=false, syncAgain=false;
const readLocal=()=>{try{return JSON.parse(localStorage.getItem(stateKey))||{profiles:{}}}catch{return{profiles:{}}}};
const readQueue=()=>{try{const x=JSON.parse(localStorage.getItem(outboxKey)||"[]");return Array.isArray(x)?x:[]}catch{return[]}};
function enqueue(cardId,state){
 if(!/^[a-z0-9-]{2,64}$/.test(cardId))throw Error("Invalid card id");
 const at=new Date().toISOString(),id=crypto.randomUUID();
 const event={id,appId,cardId,data:{state:{...state}},at};
 localStorage.setItem(outboxKey,JSON.stringify([...readQueue(),event]));
 return event;
}
async function sync(options={}){
 if(syncing){syncAgain=true;return false;}
 syncing=true;
 try{
  const queue=readQueue();
  for(const event of queue){
   await client.append(event);
   // Remove one acknowledged event at a time. A failure must retain all unsent events.
   localStorage.setItem(outboxKey,JSON.stringify(readQueue().filter(e=>e.id!==event.id)));
  }
  if(options.pushOnly)return true;
  const rows=await client.read(appId);
  const db=readLocal();db.profiles||={};
  const p=db.profiles[slug]||{cards:{}};p.cards||={};
  let changed=false;
  for(const row of rows){
   if(!/^en-\d{3}$/.test(row.card_id||""))continue;
   const state=row.event_data?.state,stamp=Date.parse(row.occurred_at);
   if(readQueue().some(e=>e.cardId===row.card_id))continue;
   if(!state||!Number.isFinite(stamp))continue;
   const local=p.cards[row.card_id];
   if(local && !local._cloudAt){
    // Unmigrated local state must never be silently overwritten by cloud data.
    window.dispatchEvent(new CustomEvent("hbg-cloud-migration-needed",{detail:{appId,cardId:row.card_id}}));
    continue;
   }
   if(!local||stamp>Number(local._cloudAt||0)){
    p.cards[row.card_id]={...state,_cloudAt:stamp};changed=true;
   }
  }
  if(changed){db.profiles[slug]=p;localStorage.setItem(stateKey,JSON.stringify(db));}
  window.dispatchEvent(new CustomEvent("hbg-cloud-synced",{detail:{appId}}));
  return true;
 }catch{
  window.dispatchEvent(new CustomEvent("hbg-cloud-pending",{detail:{appId}}));
  return false;
 }finally{syncing=false;if(syncAgain){syncAgain=false;queueMicrotask(()=>void sync({pushOnly:true}));}}
}
function record(cardId,state){
 const event=enqueue(cardId,state);
 state._cloudAt=Date.parse(event.at);
 void sync({pushOnly:true});
}
window.addEventListener("online",()=>void sync());
window.HBG_ENGLISH_CLOUD=Object.freeze({enabled:true,slug,record,sync,pending:()=>readQueue().length});
})();

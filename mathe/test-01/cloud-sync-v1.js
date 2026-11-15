/* V1 Math cloud adapter. Existing CE -> Panda import is already in Supabase.
 * No automatic import of other local profile names.
 */
(function(){
"use strict";
const transport=window.HBG_CLOUD_TRANSPORT;
const creds=transport?.credentials(location.search,location.hash,localStorage);
if(!creds){window.HBG_MATH_CLOUD={enabled:false};return}
const client=transport.createClient(creds),slug=creds.slug,appId="mathe";
const stateKey="hbg5-26-mathe-test-01",outboxKey="hbg5-26-mathe-outbox:"+slug;
let syncing=false,again=false;
const queue=()=>{try{const v=JSON.parse(localStorage.getItem(outboxKey)||"[]");return Array.isArray(v)?v:[]}catch{return[]}};
function record(cardId,state){
 if(!(/^(?:\d{1,3}|__totals__)$/.test(String(cardId))))throw Error("Invalid Math card id");
 const at=new Date().toISOString(),event={id:crypto.randomUUID(),appId,cardId:String(cardId),data:{state:{...state}},at};
 localStorage.setItem(outboxKey,JSON.stringify([...queue(),event]));
 state._cloudAt=Date.parse(at);
 void sync({pushOnly:true});
}
async function sync(options={}){
 if(syncing){again=true;return false}
 syncing=true;
 try{
  for(const ev of queue()){
   await client.append(ev);
   localStorage.setItem(outboxKey,JSON.stringify(queue().filter(e=>e.id!==ev.id)));
  }
  if(options.pushOnly)return true;
  const rows=await client.read(appId);
  let db;try{db=JSON.parse(localStorage.getItem(stateKey))||{}}catch{db={}}
  db.profiles||={};
  const p=db.profiles[slug]||{cards:{},rounds:0,answers:0};p.cards||={};
  let changed=false;
  for(const row of rows){
   const stamp=Date.parse(row.occurred_at),state=row.event_data?.state,id=row.card_id;
   if(!Number.isFinite(stamp)||!state||queue().some(e=>e.cardId===id))continue;
   if(id==="__totals__"){
    if((p.answers||p.rounds)&&!p._cloudTotalsAt)continue;
    if(stamp>Number(p._cloudTotalsAt||0)){
     p.answers=Math.max(0,Number(state.answers)||0);
     p.rounds=Math.max(0,Number(state.rounds)||0);
     p._cloudTotalsAt=stamp;changed=true;
    }
   }else if(/^\d{1,3}$/.test(id)){
    const local=p.cards[id];
    if(local&&!local._cloudAt)continue;
    if(!local||stamp>Number(local._cloudAt||0)){
     p.cards[id]={...state,_cloudAt:stamp};changed=true;
    }
   }
  }
  if(changed){db.profiles[slug]=p;localStorage.setItem(stateKey,JSON.stringify(db))}
  return true;
 }catch{return false}
 finally{syncing=false;if(again){again=false;queueMicrotask(()=>void sync({pushOnly:true}))}}
}
window.addEventListener("online",()=>void sync({pushOnly:true}));
window.HBG_MATH_CLOUD=Object.freeze({enabled:true,slug,record,sync,pending:()=>queue().length});
})();

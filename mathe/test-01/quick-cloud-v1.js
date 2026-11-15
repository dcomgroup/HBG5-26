/* Optional V1 Math Schnellcheck cloud sync, separate from Math Test 01. */
(function(){
"use strict";
const t=window.HBG_CLOUD_TRANSPORT,creds=t?.credentials(location.search,location.hash,localStorage);
if(!creds){window.HBG_QUICK_CLOUD={enabled:false};return}
const client=t.createClient(creds),slug=creds.slug,appId="mathe-schnellcheck";
const key="hbg5-26-mathe-schnellcheck-v1",outboxKey="hbg5-26-schnellcheck-outbox:"+slug;
let syncing=false,again=false;
const pending=()=>{try{const v=JSON.parse(localStorage.getItem(outboxKey)||"[]");return Array.isArray(v)?v:[]}catch{return[]}};
function record(cardId,state){
 const at=new Date().toISOString(),ev={id:crypto.randomUUID(),appId,cardId:String(cardId),data:{state:{...state}},at};
 localStorage.setItem(outboxKey,JSON.stringify([...pending(),ev]));
 state._cloudAt=Date.parse(at);
 void sync({pushOnly:true});
 return ev;
}
async function sync(options={}){
 if(syncing){again=true;return null}
 syncing=true;
 try{
  for(const ev of pending()){await client.append(ev);localStorage.setItem(outboxKey,JSON.stringify(pending().filter(x=>x.id!==ev.id)))}
  if(options.pushOnly)return [];
  const rows=await client.read(appId);
  let db;try{db=JSON.parse(localStorage.getItem(key)||"{}")}catch{db={}}
  const p=db[slug]||{states:{},rounds:0,answers:0};p.states||={};p._cloudStamps||={};
  for(const row of rows){
   const state=row.event_data?.state,stamp=Date.parse(row.occurred_at),id=row.card_id;
   if(!state||!Number.isFinite(stamp))continue;
   if(id==="__totals__"){
    if((p.answers||p.rounds)&&!p._cloudTotalsAt)continue;
    if(stamp>Number(p._cloudTotalsAt||0)){
     p.answers=Number(state.answers)||0;p.rounds=Number(state.rounds)||0;
     p.last=state.last||p.last;p._cloudTotalsAt=stamp;
    }
   }else if(/^\d{1,3}$/.test(id)){
    if(p.states[id]!==undefined&&!p._cloudStamps[id])continue;
    if(stamp>Number(p._cloudStamps[id]||0)){
     p.states[id]=Math.max(0,Math.min(2,Number(state.level)||0));p._cloudStamps[id]=stamp;
    }
   }
  }
  db[slug]=p;localStorage.setItem(key,JSON.stringify(db));
  return rows;
 }catch{return null}
 finally{syncing=false;if(again){again=false;queueMicrotask(()=>void sync({pushOnly:true}))}}
}
window.addEventListener("online",()=>void sync({pushOnly:true}));
window.HBG_QUICK_CLOUD=Object.freeze({enabled:true,slug,record,sync,pending:()=>pending().length});
})();

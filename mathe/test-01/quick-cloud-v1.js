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
  const remoteIds=new Set(rows.map(row=>String(row.card_id)));
  const unstamped=Object.entries(p.states).filter(([id,value])=>!remoteIds.has(id)&&!p._cloudStamps[id]&&Number(value)>0);
  const localTotals=!remoteIds.has("__totals__")&&!p._cloudTotalsAt&&(Number(p.answers)>0||Number(p.rounds)>0);
  for(const row of rows){
   const state=row.event_data?.state,stamp=Date.parse(row.occurred_at),id=row.card_id;
   if(!state||!Number.isFinite(stamp))continue;
   if(id==="__totals__"){
    if((p.answers||p.rounds)&&!p._cloudTotalsAt){
     localStorage.setItem("hbg5-26-schnellcheck-local-backup:"+slug,JSON.stringify(p));
    }
    if(stamp>Number(p._cloudTotalsAt||0)){
     p.answers=Number(state.answers)||0;p.rounds=Number(state.rounds)||0;
     p.last=state.last||p.last;
     if(state.daily&&(!p.daily||state.daily.date>p.daily.date||state.daily.date===p.daily.date&&stamp>Number(p._cloudTotalsAt||0)))p.daily=state.daily;
     if(state.badges){p.badges||={};p.badges.days=[...new Set([...(p.badges.days||[]),...(state.badges.days||[])])];for(const k of ["started","first100","threeDays","master"])p.badges[k]=!!(p.badges[k]||state.badges[k])}
     p._cloudTotalsAt=stamp;
    }
   }else if(/^\d{1,3}$/.test(id)){
    if(p.states[id]!==undefined&&!p._cloudStamps[id]){
     localStorage.setItem("hbg5-26-schnellcheck-local-backup:"+slug,JSON.stringify(p));
    }
    if(stamp>Number(p._cloudStamps[id]||0)){
     p.states[id]=Math.max(0,Math.min(2,Number(state.level)||0));if(state.memory){p.memory||={};p.memory[id]=state.memory}p._cloudStamps[id]=stamp;
    }
   }
  }
  db[slug]=p;localStorage.setItem(key,JSON.stringify(db));
  // Transfer existing local Schnellcheck progress once, without overwriting cloud cards.
  if(unstamped.length||localTotals){
   for(const [id,level] of unstamped){
    const ev=record(id,{level:Number(level)||0});
    p._cloudStamps[id]=Date.parse(ev.at);
   }
   if(localTotals){const ev=record("__totals__",{answers:p.answers,rounds:p.rounds,last:p.last});p._cloudTotalsAt=Date.parse(ev.at)}
   db[slug]=p;localStorage.setItem(key,JSON.stringify(db));
   again=true;
  }
  return rows;
 }catch{return null}
 finally{syncing=false;if(again){again=false;queueMicrotask(()=>void sync())}}
}
window.addEventListener("online",()=>void sync());
window.addEventListener("pageshow",()=>void sync());
window.addEventListener("focus",()=>void sync());
window.HBG_QUICK_CLOUD=Object.freeze({enabled:true,slug,record,sync,pending:()=>pending().length});
})();

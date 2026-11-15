const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const slug="panda-7a683212",secret="a".repeat(64),storage=new Map(),events=[],window={addEventListener(){},dispatchEvent(){}};
let online=true,n=0;
const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const context={window,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},location:{search:"?p="+slug,hash:"#sync="+secret},localStorage,URLSearchParams,queueMicrotask,
 crypto:{randomUUID:()=>("11111111-1111-4111-8111-"+String(++n).padStart(12,"0"))},
 fetch:async(url,opt)=>{
  if(!online)throw Error("offline");
  const p=JSON.parse(opt.body);assert.equal(p.p_slug,slug);
  if(url.endsWith("append_learning_event")){if(!events.some(e=>e.event_id===p.p_event_id))events.push({event_id:p.p_event_id,card_id:p.p_card_id,event_data:p.p_event_data,occurred_at:p.p_occurred_at});return{ok:true,json:async()=>true}}
  if(url.endsWith("read_learning_events"))return{ok:true,json:async()=>events};
  throw Error("unknown RPC");
 }};
window.fetch=context.fetch;
vm.runInNewContext(fs.readFileSync("shared/cloud-transport.js","utf8"),context);
vm.runInNewContext(fs.readFileSync("mathe/test-01/cloud-sync-v1.js","utf8"),context);
const cloud=window.HBG_MATH_CLOUD,key="hbg5-26-mathe-test-01";
assert.equal(cloud.enabled,true);
(async()=>{
 // Previously imported CE history exists in cloud. Fresh Panda browser must read it.
 events.push({event_id:"import-1",card_id:"0",event_data:{state:{level:2,right:2,wrong:0}},occurred_at:"2026-11-15T12:00:00Z"});
 events.push({event_id:"import-2",card_id:"__totals__",event_data:{state:{rounds:5,answers:40}},occurred_at:"2026-11-15T12:00:01Z"});
 await cloud.sync();
 let p=JSON.parse(localStorage.getItem(key)).profiles[slug];
 assert.equal(p.cards["0"].level,2);assert.equal(p.rounds,5);assert.equal(p.answers,40);
 // Answer offline: no lost event, no duplicate on replay.
 online=false;
 const card={level:2,right:3,wrong:0};
 cloud.record("0",card);
 await new Promise(r=>setImmediate(r));
 assert.equal(cloud.pending(),1);
 online=true;await cloud.sync();
 assert.equal(cloud.pending(),0);assert.equal(events.length,3);
 await cloud.sync();assert.equal(events.length,3);
 // A separate unmigrated local state must never be overwritten.
 p=JSON.parse(localStorage.getItem(key)).profiles[slug];
 p.cards["1"]={level:1,right:7,wrong:0};
 localStorage.setItem(key,JSON.stringify({profiles:{[slug]:p}}));
 events.push({event_id:"import-3",card_id:"1",event_data:{state:{level:0,right:0,wrong:5}},occurred_at:"2026-11-15T13:00:00Z"});
 await cloud.sync();
 p=JSON.parse(localStorage.getItem(key)).profiles[slug];
 assert.equal(p.cards["1"].right,7);
 // A newer remote snapshot with fewer answered attempts must not erase local progress.
 p.cards["0"]={level:2,right:8,wrong:1,_cloudAt:Date.parse("2026-11-15T12:00:00Z")};
 localStorage.setItem(key,JSON.stringify({profiles:{[slug]:p}}));
 events.push({event_id:"stale-device",card_id:"0",event_data:{state:{level:0,right:1,wrong:1}},occurred_at:"2026-11-15T15:00:00Z"});
 await cloud.sync();
 p=JSON.parse(localStorage.getItem(key)).profiles[slug];
 assert.equal(p.cards["0"].right,8,"remote lower attempt count must not regress local card");
 // Two devices may report the same total attempts but disagree on correct/wrong.
 // Preserve the local card and surface the conflict for manual resolution.
 p.cards["0"]={level:2,right:5,wrong:2,_cloudAt:Date.parse("2026-11-15T12:00:00Z")};
 localStorage.setItem(key,JSON.stringify({profiles:{[slug]:p}}));
 events.push({event_id:"divergent-device",card_id:"0",event_data:{state:{level:1,right:4,wrong:3}},occurred_at:"2026-11-15T17:00:00Z"});
 await cloud.sync();
 p=JSON.parse(localStorage.getItem(key)).profiles[slug];
 assert.equal(p.cards["0"].right,5,"equal-attempt divergent snapshot must not erase local card");
 console.log("PASS: Math Panda import replay, offline queue, idempotency and local data protection");
})().catch(e=>{console.error(e);process.exitCode=1});

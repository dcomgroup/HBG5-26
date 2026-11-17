const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const slug="quick-cloud",,storage=new Map(),events=[],window={addEventListener(){}};
let online=false,n=0;
const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const context={window,location:{search:"?p="+slug},localStorage,URLSearchParams,queueMicrotask,
 crypto:{randomUUID:()=>("44444444-4444-4444-8444-"+String(++n).padStart(12,"0"))},
 fetch:async(url,opt)=>{
  if(!online)throw Error("offline");
  const p=JSON.parse(opt.body);assert.equal(p.p_slug,slug);
  if(url.endsWith("hbg_append_event")){if(!events.some(e=>e.event_id===p.p_event_id))events.push({event_id:p.p_event_id,card_id:p.p_card_id,event_data:p.p_event_data,occurred_at:p.p_occurred_at});return{ok:true,json:async()=>true}}
  if(url.endsWith("hbg_read_events"))return{ok:true,json:async()=>events};
  throw Error("unknown RPC");
 }};
window.fetch=context.fetch;
vm.runInNewContext(fs.readFileSync("shared/cloud-transport.js","utf8"),context);
vm.runInNewContext(fs.readFileSync("mathe/test-01/quick-cloud-v1.js","utf8"),context);
const cloud=window.HBG_QUICK_CLOUD;
(async()=>{
 cloud.record("3",{level:2});cloud.record("__totals__",{rounds:1,answers:8});
 await new Promise(r=>setImmediate(r));assert.equal(cloud.pending(),2);
 online=true;await cloud.sync();assert.equal(cloud.pending(),0);
 await cloud.sync();assert.equal(events.length,2);
 const s=JSON.parse(localStorage.getItem("hbg5-26-mathe-schnellcheck-v1"))[slug];
 assert.equal(s.states["3"],2);assert.equal(s.rounds,1);assert.equal(s.answers,8);
 console.log("PASS: Schnellcheck isolated app ID, offline queue and cloud replay");
})().catch(e=>{console.error(e);process.exitCode=1});

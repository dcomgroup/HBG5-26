const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const secret="a".repeat(64),slug="test-cloud-profile";
const storage=new Map(),events=[],listeners={};
let online=false,sequence=0;
const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const window={addEventListener:(name,cb)=>{listeners[name]=cb},dispatchEvent:()=>{}};
const context={
 window,localStorage,location:{search:"?p="+slug,hash:"#sync="+secret},
 URLSearchParams,crypto:{randomUUID:()=>("00000000-0000-4000-8000-"+String(++sequence).padStart(12,"0"))},
 CustomEvent:class{constructor(name,options){this.type=name;this.detail=options.detail}},
 queueMicrotask,fetch:async (url,options)=>{
  if(!online)throw Error("offline");
  const data=JSON.parse(options.body);
  assert.equal(data.p_slug,slug);assert.equal(data.p_secret,secret);
  if(url.endsWith("append_learning_event")){
   if(!events.some(e=>e.event_id===data.p_event_id))events.push({event_id:data.p_event_id,card_id:data.p_card_id,event_data:data.p_event_data,occurred_at:data.p_occurred_at});
   return {ok:true,json:async()=>true};
  }
  if(url.endsWith("read_learning_events"))return{ok:true,json:async()=>events};
  throw Error("unexpected RPC");
 }};
window.fetch=context.fetch;
vm.runInNewContext(fs.readFileSync("shared/cloud-transport.js","utf8"),context);
vm.runInNewContext(fs.readFileSync("englisch/test-01/cloud-sync-v1.js","utf8"),context);
const adapter=window.HBG_ENGLISH_CLOUD;
assert.equal(adapter.enabled,true);
const key="hbg5-26-englisch-vocab",outbox="hbg5-26-englisch-outbox:"+slug;
localStorage.setItem(key,JSON.stringify({profiles:{[slug]:{cards:{"en-001":{right:3,wrong:0,streak:3}}}}}));
(async()=>{
 adapter.record("en-002",{right:1,wrong:0,streak:1,due:123});
 await new Promise(r=>setImmediate(r));
 assert.equal(adapter.pending(),1,"offline event must survive");
 assert.equal(events.length,0);
 online=true;await adapter.sync();
 assert.equal(events.length,1);
 assert.equal(adapter.pending(),0);
 await adapter.sync();assert.equal(events.length,1,"retry must not duplicate");
 // Unmigrated local progress must not be overwritten by remote state.
 events.push({event_id:"remote",card_id:"en-001",event_data:{state:{right:0,wrong:5,streak:0}},occurred_at:new Date().toISOString()});
 await adapter.sync();
 const saved=JSON.parse(localStorage.getItem(key)).profiles[slug].cards;
 assert.equal(saved["en-001"].right,3);
 assert.equal(saved["en-002"].right,1);
 saved["en-002"]={right:5,wrong:1,streak:2,_cloudAt:Date.parse("2026-11-15T12:00:00Z")};
 localStorage.setItem(key,JSON.stringify({profiles:{[slug]:{cards:saved}}}));
 events.push({event_id:"stale-device",card_id:"en-002",event_data:{state:{right:1,wrong:1,streak:0}},occurred_at:"2026-11-15T15:00:00Z"});
 await adapter.sync();
 const final=JSON.parse(localStorage.getItem(key)).profiles[slug].cards;
 assert.equal(final["en-002"].right,5,"lower-attempt remote snapshot must not regress local progress");
 const savedAgain=JSON.parse(localStorage.getItem(key)).profiles[slug].cards;
 savedAgain["en-002"]={right:4,wrong:2,streak:2,_cloudAt:Date.parse("2026-11-15T12:00:00Z")};
 localStorage.setItem(key,JSON.stringify({profiles:{[slug]:{cards:savedAgain}}}));
 events.push({event_id:"divergent-device",card_id:"en-002",event_data:{state:{right:3,wrong:3,streak:1}},occurred_at:"2026-11-15T17:00:00Z"});
 await adapter.sync();
 assert.equal(JSON.parse(localStorage.getItem(key)).profiles[slug].cards["en-002"].right,4,
  "equal-attempt divergent remote snapshot must not erase local card");
 console.log("PASS: English cloud offline queue, idempotent retry, local migration protection");
})().catch(e=>{console.error(e);process.exitCode=1});

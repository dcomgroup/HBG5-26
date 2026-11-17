const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const slug="latin-cloud",,storage=new Map(),events=[],window={addEventListener(){}};
let online=false,n=0;
const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const context={window,location:{search:"?p="+slug},localStorage,URLSearchParams,queueMicrotask,
 crypto:{randomUUID:()=>("22222222-2222-4222-8222-"+String(++n).padStart(12,"0"))},
 fetch:async(url,options)=>{
  if(!online)throw Error("offline");
  const p=JSON.parse(options.body);assert.equal(p.p_slug,slug);
  if(url.endsWith("hbg_append_event")){if(!events.some(e=>e.event_id===p.p_event_id))events.push({event_id:p.p_event_id,card_id:p.p_card_id,event_data:p.p_event_data,occurred_at:p.p_occurred_at});return{ok:true,json:async()=>true}}
  if(url.endsWith("hbg_read_events"))return{ok:true,json:async()=>events};
  throw Error("Unexpected RPC");
 }};
window.fetch=context.fetch;
vm.runInNewContext(fs.readFileSync("shared/cloud-transport.js","utf8"),context);
vm.runInNewContext(fs.readFileSync("latein/shared/cloud-sync-v1.js","utf8"),context);
const cloud=window.HBG_LATIN_CLOUD;
assert.equal(cloud.enabled,true);
(async()=>{
 const state={interval:1,streak:1,seen:Date.now(),due:new Date().toISOString(),last:"known"};
 cloud.record("placēre|translation",state);
 await new Promise(r=>setImmediate(r));
 assert.equal(cloud.pending(),1);
 assert.equal(events.length,0);
 online=true;
 const rows=await cloud.sync();
 assert.equal(cloud.pending(),0);assert.equal(rows.length,1);
 assert.equal(rows[0].card_id,"placēre|translation");
 assert.equal(rows[0].event_data.state.streak,1);
 await cloud.sync();assert.equal(events.length,1);
 console.log("PASS: shared Latin cloud queue, offline replay, no duplicate events");
})().catch(e=>{console.error(e);process.exitCode=1});

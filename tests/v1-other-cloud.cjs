const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
async function run(adapterPath,exportName,appId){
 const slug="test-"+appId,,storage=new Map(),events=[],window={addEventListener(){}};
 let online=false,n=0;
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 const context={window,location:{search:"?p="+slug},localStorage,URLSearchParams,queueMicrotask,
 crypto:{randomUUID:()=>("33333333-3333-4333-8333-"+String(++n).padStart(12,"0"))},
 fetch:async(url,options)=>{
  if(!online)throw Error("offline");
  const p=JSON.parse(options.body);assert.equal(p.p_slug,slug);
  if(url.endsWith("hbg_append_event")){if(!events.some(e=>e.event_id===p.p_event_id))events.push({event_id:p.p_event_id,card_id:p.p_card_id,event_data:p.p_event_data,occurred_at:p.p_occurred_at});return{ok:true,json:async()=>true}}
  if(url.endsWith("hbg_read_events"))return{ok:true,json:async()=>events};
  throw Error("unexpected RPC");
 }};
 window.fetch=context.fetch;
 vm.runInNewContext(fs.readFileSync("shared/cloud-transport.js","utf8"),context);
 vm.runInNewContext(fs.readFileSync(adapterPath,"utf8"),context);
 const cloud=window[exportName];assert.equal(cloud.enabled,true);
 const state={right:1,wrong:0,streak:1},entry={id:1,correct:true,date:new Date().toISOString(),profile:slug};
 if(appId==="deutsch")cloud.record("1",state,entry);else cloud.record("auge_innen_linse",state);
 await new Promise(r=>setImmediate(r));
 assert.equal(cloud.pending(),appId==="deutsch"?2:1);
 online=true;const rows=await cloud.sync();
 assert.equal(cloud.pending(),0);
 assert.equal(rows.length,appId==="deutsch"?2:1);
 await cloud.sync();assert.equal(events.length,rows.length);
 if(appId==="deutsch"){assert.ok(entry.cloudId);assert.ok(rows.some(r=>r.card_id==="__log__"))}
 console.log("PASS: "+appId+" offline queue, idempotent replay");
}
(async()=>{
 await run("deutsch/test-01/cloud-sync-v1.js","HBG_DEUTSCH_CLOUD","deutsch");
 await run("biologie/klassenarbeit-01/cloud-sync-v1.js","HBG_BIO_CLOUD","biologie");
})().catch(e=>{console.error(e);process.exitCode=1});

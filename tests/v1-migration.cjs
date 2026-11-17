const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const slug="target-cloud",,storage=new Map(),events=[],window={};
let online=true,n=0,failAfter=null;
const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const source="CE";
const fixtures={
 "hbg5-26-mathe-test-01":{profiles:{CE:{cards:{"0":{level:2,right:2,wrong:0}},rounds:5,answers:40}}},
 "hbg5-26-mathe-schnellcheck-v1":{CE:{states:{"0":2},rounds:1,answers:8}},
 "hbg5-26-englisch-vocab":{profiles:{CE:{cards:{"en-001":{right:1,wrong:0,streak:1}}}}},
 "hbg5-26:deutsch:test-01:profiles-v1":{active:"ce",profiles:{ce:{profile:"CE",stats:{"1":{right:2,wrong:0,streak:2}},log:[{id:1,correct:true,date:"2026-11-15T12:00:00Z",profile:"CE"}]}}},
 "hbg5-26-bio-ka01-learn-v1-CE":{"auge_innen_linse":{reps:2,interval:3,due:123}}
};
for(const [k,v] of Object.entries(fixtures))localStorage.setItem(k,JSON.stringify(v));
const before=Object.fromEntries([...storage.entries()]);
const context={window,localStorage,URLSearchParams,location:{search:"?p="+slug},
 crypto:{randomUUID:()=>("55555555-5555-4555-8555-"+String(++n).padStart(12,"0"))},
 fetch:async(url,options)=>{
  if(!online)throw Error("offline");
  const p=JSON.parse(options.body);assert.equal(p.p_slug,slug);
  if(url.endsWith("hbg_read_events"))return{ok:true,json:async()=>events.filter(e=>e.app_id===p.p_app_id)};
  if(url.endsWith("hbg_append_event")){
   if(failAfter===0)throw Error("temporary network failure");
   if(failAfter!==null)failAfter--;
   if(!events.some(e=>e.event_id===p.p_event_id))events.push({event_id:p.p_event_id,app_id:p.p_app_id,card_id:p.p_card_id,event_data:p.p_event_data,occurred_at:p.p_occurred_at});
   return{ok:true,json:async()=>true};
  }
  throw Error("Unexpected RPC");
 }};
window.fetch=context.fetch;
vm.runInNewContext(fs.readFileSync("shared/cloud-transport.js","utf8"),context);
vm.runInNewContext(fs.readFileSync("shared/migrate-local-v1.js","utf8"),context);
const api=window.HBG_V1_MIGRATE,creds=window.HBG_CLOUD_TRANSPORT.credentials(context.location.search,context.location.hash,localStorage);
(async()=>{
 const names=await api.sources();assert.ok(names.includes(source));
 const {key,plan}=await api.prepare(source,creds);
 assert.equal(plan.skipped,0);
 assert.equal(plan.events.length,8); // Math 2, Schnellcheck 2, English 1, German 2, Bio 1
 events.push({event_id:"foreign-event",app_id:"mathe",card_id:"0",event_data:{state:{level:1}},occurred_at:new Date().toISOString()});
 await assert.rejects(()=>api.execute(key,creds),/Cloud-Daten/);
 events.pop();
 failAfter=2;await assert.rejects(()=>api.execute(key,creds));
 assert.equal(events.length,2,"two events should already be safely committed");
 failAfter=null;const result=await api.execute(key,creds);
 assert.equal(result.imported,plan.events.length);
 await api.execute(key,creds);assert.equal(events.length,plan.events.length);
 assert.ok(events.some(e=>e.app_id==="deutsch"&&e.card_id==="__log__"&&e.event_data.entry));
 for(const [k,v] of Object.entries(before))assert.equal(localStorage.getItem(k),v,"original source mutated: "+k);
 // Existing remote data must not be overwritten by a new migration.
 const fresh=await api.prepare("Other",creds);
 assert.equal(fresh.plan.events.length,0);
 console.log("PASS: explicit migration snapshot, retry idempotency and unchanged local source");
})().catch(e=>{console.error(e);process.exitCode=1});

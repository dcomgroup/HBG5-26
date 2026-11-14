(function(){"use strict";
const slug=new URLSearchParams(location.search).get("p");
const secret=location.hash.match(/sync=([0-9a-f]{64})/)?.[1]||localStorage.getItem("hbg5-26-cloud-secret:"+slug);
const enabled=!!(slug&&/^[a-z0-9][a-z0-9-]{2,63}$/.test(slug)&&/^[0-9a-f]{64}$/.test(secret||""));
const url="https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/";
const key="sb_publishable_PupDfjNg0FdAGU6yJsxeBg_kGYhgMAS";
async function rpc(name,body){if(!enabled)throw Error("Cloud unavailable");const r=await fetch(url+name,{method:"POST",headers:{"apikey":key,"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});if(!r.ok)throw Error("Cloud HTTP "+r.status);return r.json()}
window.HBG_CLOUD={enabled,slug,create(app){
 const outboxKey="hbg5-26-cloud-pending:"+slug+":"+app;
 const pending=()=>{try{return JSON.parse(localStorage.getItem(outboxKey)||"[]")}catch{return []}};
 let busy=false;
 return {enabled,slug,
  async sync(onRow){if(!enabled||busy)return;busy=true;try{
    const sent=new Set();for(const ev of pending()){await rpc("append_learning_event",{p_slug:slug,p_secret:secret,p_event_id:ev.id,p_app_id:app,p_card_id:ev.cardId,p_event_data:ev.data,p_occurred_at:ev.at});sent.add(ev.id)}
    if(sent.size)localStorage.setItem(outboxKey,JSON.stringify(pending().filter(e=>!sent.has(e.id))));
    const rows=await rpc("read_learning_events",{p_slug:slug,p_secret:secret,p_app_id:app});
    for(const row of rows)await onRow(row);
   }catch(e){console.warn("Cloud sync deferred",e)}finally{busy=false}},
  enqueue(cardId,state){if(!enabled)return;const at=new Date().toISOString();const ev={id:crypto.randomUUID(),cardId,data:{state},at};localStorage.setItem(outboxKey,JSON.stringify([...pending(),ev]));return ev}
 };
}};
})();
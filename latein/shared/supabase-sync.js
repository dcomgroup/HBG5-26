/* Optional Supabase sync. No keys or credentials are bundled here. */
(function () {
"use strict";
const PROJECT="https://velspjtxenbvvwgptahh.supabase.co";
const KEY="sb_publishable_PupDfjNg0FdAGU6yJsxeBg_kGYhgMAS";
const match=location.hash.match(/(?:^#|&)sync=([0-9a-f]{64})(?:&|$)/);
const slug=new URLSearchParams(location.search).get("p");
const secret=(match&&match[1])||localStorage.getItem("hbg5-26-cloud-secret:"+slug);
if(slug&&/^[0-9a-f]{64}$/.test(secret||""))localStorage.setItem("hbg5-26-cloud-secret:"+slug,secret);
const enabled=Boolean(KEY&&/^[0-9a-f]{64}$/.test(secret||"")&&slug&&/^[a-z0-9][a-z0-9-]{2,63}$/.test(slug));
async function rpcPublic(name,body){
 const res=await fetch(PROJECT+"/rest/v1/rpc/"+name,{method:"POST",headers:{"apikey":KEY,"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
 if(!res.ok)throw Error("Supabase "+name+": HTTP "+res.status);
 return res.json();
}
async function rpc(name,body){
  if(!enabled)throw Error("Sync not configured");
  return rpcPublic(name,body);
}
window.HBG_LATIN_SYNC={
  enabled,
  async read(){return rpc("read_learning_events",{p_slug:slug,p_secret:secret,p_app_id:"latein"});},
  async reserve(p_slug,p_secret){return rpcPublic("reserve_profile",{p_slug,p_secret});},
  async append(event){return rpc("append_learning_event",{p_slug:slug,p_secret:secret,p_event_id:event.id,p_app_id:"latein",p_card_id:event.cardId,p_event_data:event.data,p_occurred_at:event.at});}
};
})();

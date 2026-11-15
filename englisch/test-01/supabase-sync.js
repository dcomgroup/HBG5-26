(function(){"use strict";
const slug=new URLSearchParams(location.search).get("p");
const match=location.hash.match(/sync=([0-9a-f]{64})/);
const secret=match?.[1]||localStorage.getItem("hbg5-26-cloud-secret:"+slug);
if(slug&&/^[0-9a-f]{64}$/.test(secret||""))localStorage.setItem("hbg5-26-cloud-secret:"+slug,secret);
const enabled=!!(slug&&/^[a-z0-9][a-z0-9-]{2,63}$/.test(slug)&&/^[0-9a-f]{64}$/.test(secret||""));
const url="https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/";
const key="sb_publishable_PupDfjNg0FdAGU6yJsxeBg_kGYhgMAS";
async function rpc(method,body){if(!enabled)throw Error("Cloud unavailable");const r=await fetch(url+method,{method:"POST",headers:{"apikey":key,"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});if(!r.ok)throw Error("Cloud HTTP "+r.status);return r.json()}
window.HBG_ENGLISH_SYNC={enabled,slug,
 read:()=>rpc("read_learning_events",{p_slug:slug,p_secret:secret,p_app_id:"englisch"}),
 append:event=>rpc("append_learning_event",{p_slug:slug,p_secret:secret,p_event_id:event.id,p_app_id:"englisch",p_card_id:event.cardId,p_event_data:event.data,p_occurred_at:event.at})
};
})();
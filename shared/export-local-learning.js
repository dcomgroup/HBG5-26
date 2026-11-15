(function(){
"use strict";
const button=document.getElementById("export-local-learning"),status=document.getElementById("export-local-status");
if(!button)return;
const allowed=k=>k.startsWith("hbg5-26")&&!/cloud-secret|cloud-pending|outbox|sync|token|auth|session|password/i.test(k);
function indexedDbExport(){
 return new Promise(resolve=>{
  if(!window.indexedDB)return resolve({status:"unavailable"});
  let req;try{req=indexedDB.open("hbg5-26-latein-v1")}catch(e){return resolve({status:"error",message:String(e)})}
  let created=false;
  req.onupgradeneeded=()=>{created=true;req.transaction.abort()};
  req.onerror=()=>resolve({status:created?"not-found":"error",message:created?undefined:String(req.error)});
  req.onsuccess=()=>{
   const db=req.result,stores=[...db.objectStoreNames],result={status:"ok",stores:{}};
   if(!stores.length){db.close();return resolve(result)}
   let remaining=stores.length;
   for(const store of stores){
    const entries=[];result.stores[store]=entries;
    let tx;try{tx=db.transaction(store,"readonly")}catch(e){result.status="partial";result.stores[store]={error:String(e)};if(!--remaining){db.close();resolve(result)};continue}
    const cursor=tx.objectStore(store).openCursor();
    cursor.onsuccess=()=>{const c=cursor.result;if(c){entries.push({key:c.key,value:c.value});c.continue()}};
    cursor.onerror=()=>{result.status="partial";result.stores[store]={error:String(cursor.error)}};
    tx.oncomplete=()=>{if(!--remaining){db.close();resolve(result)}};
    tx.onerror=()=>{result.status="partial";if(!--remaining){db.close();resolve(result)}};
   }
  };
 });
}
button.addEventListener("click",async()=>{
 button.disabled=true;status.textContent="Export wird erstellt …";
 try{
  const local={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(allowed(k))local[k]=localStorage.getItem(k)}
  const latin=await indexedDbExport();
  if(latin.status==="error"||latin.status==="partial")throw Error("Latein-Daten konnten nicht vollständig gelesen werden. Bitte nichts löschen und erneut versuchen.");
  const payload={format:"hbg5-26-local-learning-export",version:1,exportedAt:new Date().toISOString(),source:location.origin,localStorage:local,indexedDB:{"hbg5-26-latein-v1":latin},note:"Export enthält lokale Lernprofile aller Apps dieses Browser-Origins. Keine Cloud-Zugangsschlüssel enthalten."};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="HBG5-26-Lernstand-Export-"+new Date().toISOString().slice(0,10)+".json";
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  status.textContent="Export erstellt. Deine Lernstände bleiben unverändert im Browser.";
 }catch(e){status.textContent="Export fehlgeschlagen: "+e.message}
 finally{button.disabled=false}
});
})();
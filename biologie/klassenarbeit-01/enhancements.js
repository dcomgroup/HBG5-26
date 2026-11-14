// Biology quiz: short repeatable rounds, compatible with the existing card ratings.
(() => {
 const ns='hbg5-26-bio-ka01-';
 const oldNext=next, oldRate=rate;
 let queue=[], missed=[], inRound=false, answered=0;
 const panel=document.createElement('div');
 panel.style.cssText='margin:16px 0;padding:12px;border:1px solid #ccd6e3;border-radius:10px;display:flex;gap:8px;flex-wrap:wrap';
 panel.innerHTML='<button id="bio-new-round" type="button">Neue Runde (8 Karten)</button><button id="bio-export" type="button">Lernstand sichern</button><button id="bio-import" type="button">Lernstand importieren</button><input id="bio-import-file" type="file" accept=".json,application/json" style="display:none"><small id="bio-round-status" style="width:100%"></small>';
 document.querySelector('main')?.prepend(panel) || document.body.prepend(panel);
 const status=panel.querySelector('#bio-round-status');
 const eligible=()=>cards.filter(c=>$('group').value==='Alle'||c.group===$('group').value);
 function score(c,s) {
  const v=s[c.id];
  if(!v)return 50;
  return (v.reps===0?25:0)+Math.max(0,2.5-(v.ease||2.5))*15+
   (v.due<=Date.now()?12:0)+Math.max(0,7-(v.interval||0))+
   (v.lastRating===1?25:v.lastRating===2?15:0);
 }
 function startRound() {
  const s=state(),pool=eligible();
  const ranked=pool.map(c=>({c,weight:score(c,s)+Math.random()*8})).sort((a,b)=>b.weight-a.weight);
  queue=ranked.slice(0,Math.min(8,ranked.length)).map(x=>x.c.id);
  missed=[];answered=0;inRound=true;next();
 }
 next=function(){
  if(!inRound){oldNext();return;}
  if(!queue.length){
   if(missed.length){queue=missed.splice(0,Math.min(4,missed.length));}
   else {
    inRound=false;active=null;$('pic').removeAttribute('src');
    $('guess').style.display='none';$('answer').style.display='none';
    status.textContent='Runde abgeschlossen. Du kannst sofort eine weitere starten.';
    $('stats').textContent='Runde abgeschlossen ('+answered+' Antworten)';
    return;
   }
  }
  const id=queue.shift();active=cards.find(c=>c.id===id);
  $('pic').src=active.q;$('label').textContent='';$('details').textContent='';
  $('answer').style.display='none';$('guess').style.display='block';$('typed').value='';
  $('stats').textContent='Zusatzrunde · '+(queue.length+1)+' Karten in dieser Runde · '+current;
 };
 rate=function(r){
  const id=active.id;
  // Preserve the existing interval algorithm and storage schema.
  if(inRound){
   answered++;
   if(r<=2 && !missed.includes(id))missed.push(id);
  }
  oldRate(r);
  const s=state();
  if(s[id]){s[id].lastRating=r;s[id].updated=Date.now();store(s);}
 };
 panel.querySelector('#bio-new-round').onclick=startRound;
 const previousGroup=$('group').onchange;
 $('group').onchange=function(e){inRound=false;queue=[];missed=[];previousGroup(e);};
 const previousProfile=$('profile').onchange;
 $('profile').onchange=function(e){inRound=false;queue=[];missed=[];previousProfile(e);};
 panel.querySelector('#bio-export').onclick=()=>{
  const data={format:'hbg5-26-bio-ka01',version:1,profiles, current, progress:{}};
  for(const p of profiles)data.progress[p]=JSON.parse(localStorage.getItem(ns+'learn-v1-'+p)||'{}');
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sinnesorgane-lernstand.json';a.click();URL.revokeObjectURL(a.href);
 };
 const file=panel.querySelector('#bio-import-file');
 panel.querySelector('#bio-import').onclick=()=>file.click();
 file.onchange=async()=>{
  try{
   const data=JSON.parse(await file.files[0].text());
   if(!data||!data.progress||typeof data.progress!=='object')throw Error('Ungültige Datei');
   for(const [profile,progress] of Object.entries(data.progress)){
    if(!profile||typeof progress!=='object'||Array.isArray(progress))continue;
    const prior=JSON.parse(localStorage.getItem(ns+'learn-v1-'+profile)||'{}');
    // Never overwrite a newer local result with older imported data.
    for(const [id,v] of Object.entries(progress))if(cards.some(c=>c.id===id)&&v&&typeof v==='object'){
      if(!prior[id]||((v.updated||0)>(prior[id].updated||0)))prior[id]=v;
    }
    localStorage.setItem(ns+'learn-v1-'+profile,JSON.stringify(prior));
    if(!profiles.includes(profile))profiles.push(profile);
   }
   saveProfiles();renderProfiles();inRound=false;oldNext();
   status.textContent='Lernstand importiert.';
  }catch(e){status.textContent='Import fehlgeschlagen: '+e.message;}
  file.value='';
 };
 status.textContent='Du kannst beliebig oft am selben Tag eine neue Runde starten.';
})();

const {chromium}=require('playwright');
const {randomBytes}=require('node:crypto');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:8765/HBG5-26/';
const endpoint='https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/';
const key='sb_publishable_PupDfjNg0FdAGU6yJsxeBg_kGYhgMAS';
const slug='qa-'+randomBytes(7).toString('hex');
const secret=randomBytes(32).toString('hex');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const browser=await chromium.launch();
 const a=await browser.newContext(),b=await browser.newContext(),c=await browser.newContext();
 try{
  const p=await a.newPage();
  await p.goto(base);
  const reserve=await p.evaluate(async ({endpoint,key,slug,secret})=>{
   const r=await fetch(endpoint+'reserve_profile',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({p_slug:slug,p_secret:secret})});
   return {ok:r.ok,status:r.status,body:await r.text()};
  },{endpoint,key,slug,secret});
  assert(reserve.ok,'Supabase reserve_profile failed HTTP '+reserve.status+': '+reserve.body);
  const url=base+'englisch/test-01/?p='+slug+'#sync='+secret;
  const first=await a.newPage(),second=await b.newPage();
  await first.goto(url);await first.locator('#start').click();
  await first.locator('#unknown').click();
  const outbox='hbg5-26-englisch-outbox:'+slug;
  await first.waitForFunction(k=>JSON.parse(localStorage.getItem(k)||'[]').length===0,outbox,{timeout:15000});
  const firstCards=await first.evaluate(s=>JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles[s].cards,slug);
  assert(Object.values(firstCards).some(x=>x.wrong>=1),'A did not save learning state');
  await second.goto(url);await second.locator('#start').click();
  await second.waitForFunction(({slug,firstCards})=>{const cards=JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles[slug]?.cards||{};return Object.keys(cards).some(id=>firstCards[id]?.wrong===cards[id]?.wrong)}, {slug,firstCards},{timeout:15000});
  const secondCards=await second.evaluate(s=>JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles[s].cards,slug);
  assert(Object.keys(secondCards).some(id=>firstCards[id]?.wrong===secondCards[id]?.wrong),'B did not receive A');
  await second.locator('#unknown').click();
  await second.waitForFunction(k=>JSON.parse(localStorage.getItem(k)||'[]').length===0,outbox,{timeout:15000});
  await first.reload();await first.locator('#start').click();
  await first.waitForFunction(({slug,ids})=>{const cards=JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles[slug]?.cards||{};return ids.every(id=>cards[id])},{slug,ids:Object.keys(await second.evaluate(s=>JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles[s].cards,slug))},{timeout:15000});
  const merged=await first.evaluate(s=>JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles[s].cards,slug);
  const afterB=await second.evaluate(s=>JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles[s].cards,slug);
  assert(Object.keys(afterB).every(id=>merged[id]),'A did not receive B');
  // Third browser with no secret must not obtain the learning history.
  const outsider=await c.newPage();
  await outsider.goto(base+'englisch/test-01/?p='+slug);
  await outsider.locator('#start').click();
  const outsiderCards=await outsider.evaluate(s=>JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles[s].cards,slug);
  assert.equal(Object.keys(outsiderCards).length,0,'Profile isolation failed');
  // Verify denied direct read using an invalid secret.
  const denied=await outsider.evaluate(async ({endpoint,key,slug})=>{
   const r=await fetch(endpoint+'read_learning_events',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({p_slug:slug,p_secret:'f'.repeat(64),p_app_id:'englisch'})});
   return r.status;
  },{endpoint,key,slug});
  assert(denied>=400,'Invalid secret was accepted');
  console.log('PASS: real Supabase browser A-to-B-to-A, profile isolation, denied invalid credentials');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

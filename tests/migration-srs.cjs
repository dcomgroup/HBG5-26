const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:8765/HBG5-26/';
const slug='migration-qa',secret='d'.repeat(64);
(async()=>{
 const browser=await chromium.launch();
 try{
  const context=await browser.newContext();
  const events=[];
  await context.route('https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/**',async route=>{
   const name=route.request().url().split('/').pop(),body=route.request().postDataJSON();
   if(body.p_slug!==slug||body.p_secret!==secret){await route.fulfill({status:403,body:'{}'});return}
   if(name==='append_learning_event'){
    if(!events.some(e=>e.event_id===body.p_event_id))events.push({event_id:body.p_event_id,card_id:body.p_card_id,event_data:body.p_event_data,occurred_at:body.p_occurred_at});
    await route.fulfill({status:200,contentType:'application/json',body:'true'});return;
   }
   if(name==='read_learning_events'){await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(events)});return}
   await route.fulfill({status:404,body:'{}'});
  });
  const page=await context.newPage();
  await page.goto(base+'englisch/test-01/?p='+slug+'#sync='+secret);
  const now=Date.now(),future=now+86400000*30;
  const cards=Object.fromEntries(Array.from({length:48},(_,i)=>['en-'+String(i+1).padStart(3,'0'),{right:3,wrong:0,streak:3,due:future}]));
  cards['en-001']={right:0,wrong:4,streak:0,due:now-1000};
  await page.evaluate(({slug,cards})=>{
   localStorage.setItem('hbg5-26-englisch-vocab',JSON.stringify({profiles:{[slug]:{cards}}}));
   localStorage.removeItem('hbg5-26-englisch-cloud-migrated:'+slug);
  },{slug,cards});
  await page.reload();
  await page.waitForFunction(slug=>localStorage.getItem('hbg5-26-englisch-cloud-migrated:'+slug)==='1',slug);
  await page.waitForFunction(slug=>JSON.parse(localStorage.getItem('hbg5-26-englisch-outbox:'+slug)||'[]').length===0,slug,{timeout:15000});
  assert.equal(events.length,48,'Migration did not preserve all 48 local card states');
  await page.locator('#start').click();
  const prompt=await page.locator('#app h2').innerText();
  assert.equal(prompt,'nach jdm/etw verrückt sein','Due weak card should be selected first by spaced repetition');
  const saved=await page.evaluate(slug=>JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles[slug].cards,slug);
  assert.equal(saved['en-001'].wrong,4);
  assert.equal(Object.keys(saved).length,48);
  await page.reload();
  await page.waitForTimeout(250);
  assert.equal(events.length,48,'Migration duplicated events on reload');
  console.log('PASS: English migration of 48 cards, no duplicates, SRS prioritizes due weak card');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

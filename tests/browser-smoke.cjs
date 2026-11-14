const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:8765/HBG5-26/';
const routes=['','latein/test-01/','latein/test-02/','mathe/test-01/','deutsch/test-01/','biologie/klassenarbeit-01/','englisch/test-01/'];
(async()=>{
 const browser=await chromium.launch({headless:true});
 const errors=[];
 const context=await browser.newContext();
 for(const route of routes){
  const page=await context.newPage();page.on('pageerror',e=>errors.push(route+': '+e.message));
  const response=await page.goto(base+route+'?demo=1',{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200,route);
  await page.waitForTimeout(300);
  assert((await page.locator('body').innerText()).length>30,route+' blank');
  if(!route)assert.equal(await page.locator('#upcoming-list').count(),1);
  await page.close();
 }
 const events=[],secret='a'.repeat(64),profile='qa-profile';
 let disconnected=false;
 const a=await browser.newContext(),b=await browser.newContext();
 async function mock(ctx){
  await ctx.route('https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/**',async route=>{
   const name=route.request().url().split('/').pop(),body=route.request().postDataJSON();
   if(disconnected){await route.abort('failed');return}
   if(body.p_secret!==secret||body.p_slug!==profile){await route.fulfill({status:403,body:'{}'});return}
   if(name==='append_learning_event'){
    if(!events.some(e=>e.event_id===body.p_event_id))events.push({event_id:body.p_event_id,card_id:body.p_card_id,event_data:body.p_event_data,occurred_at:body.p_occurred_at});
    await route.fulfill({status:200,contentType:'application/json',body:'null'});return;
   }
   if(name==='read_learning_events'){await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(events)});return}
   await route.fulfill({status:404,body:'{}'});
  });
 }
 await mock(a);await mock(b);
 const url=base+'englisch/test-01/?p='+profile+'#sync='+secret;
 const p1=await a.newPage(),p2=await b.newPage();
 for(const p of [p1,p2])p.on('pageerror',e=>errors.push('cloud: '+e.message));
 await p1.goto(url);await p1.locator('#start').click();await p1.locator('#unknown').click();
 await p1.waitForFunction(()=>JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles['qa-profile']?.cards&&Object.keys(JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles['qa-profile'].cards).length>0);
 await p1.waitForTimeout(500);assert(events.length>0,'A did not upload');
 const id=events[0].card_id;
 await p2.goto(url);await p2.locator('#start').click();
 const remote=await p2.evaluate(id=>JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles['qa-profile'].cards[id],id);
 assert(remote&&remote.wrong>=1,'A to B synchronization failed');
 await p2.locator('#unknown').click();await p2.waitForTimeout(500);
 assert(events.length>=2,'B did not upload');
 await p1.reload();await p1.locator('#start').click();
 const onA=await p1.evaluate(()=>JSON.parse(localStorage.getItem('hbg5-26-englisch-vocab')).profiles['qa-profile'].cards);
 assert(Object.keys(onA).length>=1,'B to A failed');
 // Offline answer remains local and in outbox, then uploads on reconnect.
 disconnected=true;
 await p1.locator('#unknown').click();
 await p1.waitForTimeout(200);
 const outboxKey='hbg5-26-englisch-outbox:'+profile;
 const queued=await p1.evaluate(k=>JSON.parse(localStorage.getItem(k)||'[]'),outboxKey);
 assert(queued.length>=1,'offline answer not queued');
 const before=events.length;
 disconnected=false;
 await p1.evaluate(()=>window.dispatchEvent(new Event('online')));
 await p1.waitForFunction(k=>JSON.parse(localStorage.getItem(k)||'[]').length===0,outboxKey,{timeout:10000});
 assert(events.length>before,'offline answer not uploaded');
 const unique=new Set(events.map(e=>e.event_id));
 assert.equal(unique.size,events.length,'duplicate cloud events');
 assert.deepEqual(errors,[],'Uncaught browser errors');
 await browser.close();console.log('PASS: homepage, six app routes, English A-B-A cloud roundtrip');
})().catch(e=>{console.error(e);process.exitCode=1});

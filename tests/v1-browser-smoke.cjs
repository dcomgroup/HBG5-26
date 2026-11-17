const {chromium}=require("playwright"),assert=require("node:assert/strict");
const base="http://127.0.0.1:8765/HBG5-26/";
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext(),page=await context.newPage();
  page.setDefaultTimeout(12000);
  await page.goto(base);
  assert.match(await page.locator("body").innerText(),/Englisch/);
  const classwork=page.locator('a[href*="englisch/klassenarbeit-01/"]').first();
  assert.match(await classwork.innerText(),/Klassenarbeit 01/);
  await page.goto(base+"englisch/klassenarbeit-01/?demo=1");
  await page.locator("#profile").fill("qa-local");
  await page.getByRole("button",{name:"Runde starten"}).click();
  assert.match(await page.locator("#app").innerText(),/Aufgabe 1 von 8/);
  await page.locator(".choices button").first().click();
  assert.match(await page.locator("#feedback").innerText(),/Richtig|Noch einmal anschauen/);
  const localState=await page.evaluate(()=>JSON.parse(localStorage.getItem("hbg5-26-englisch-klassenarbeit-01")));
  assert.ok(localState.profiles["qa-local"].cards["u1-colours"]||Object.keys(localState.profiles["qa-local"].cards).length===1);
  await page.reload();
  await page.locator("#profile").fill("qa-local");
  await page.getByRole("button",{name:"Runde starten"}).click();
  assert.match(await page.locator("#app").innerText(),/Aufgabe 1 von 8/);
  await context.close();

  const slug="qa-cloud-profile",events=[];
  const cloud=await browser.newContext(),cloudPage=await cloud.newPage();
  cloudPage.setDefaultTimeout(12000);
  await cloud.route("https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/**",async route=>{
   const name=route.request().url().split("/").pop(),p=route.request().postDataJSON();
   assert.equal(p.p_slug,slug);
   assert.equal(Object.hasOwn(p,"p_secret"),false,"profile URL is the only access credential");
   if(name==="hbg_read_events"){
    const rows=events.filter(e=>e.app_id===p.p_app_id).map(e=>({event_id:e.event_id,card_id:e.card_id,event_data:e.event_data,occurred_at:e.occurred_at}));
    await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(rows)});return;
   }
   if(name==="hbg_append_event"){
    if(!events.some(e=>e.event_id===p.p_event_id))events.push({event_id:p.p_event_id,app_id:p.p_app_id,card_id:p.p_card_id,event_data:p.p_event_data,occurred_at:p.p_occurred_at});
    await route.fulfill({status:200,contentType:"application/json",body:"true"});return;
   }
   await route.fulfill({status:404,contentType:"application/json",body:"{}"});
  });
  await cloudPage.goto(base+"englisch/klassenarbeit-01/?p="+slug);
  assert.equal(await cloudPage.locator("#profile").inputValue(),slug);
  assert.equal(await cloudPage.locator("#profile").getAttribute("readonly"),"");
  await cloudPage.getByRole("button",{name:"Runde starten"}).click();
  assert.match(await cloudPage.locator("#app").innerText(),/Aufgabe 1 von 8/);
  await cloudPage.locator(".choices button").first().click();
  await cloudPage.waitForFunction(()=>JSON.parse(localStorage.getItem("hbg5-26-englisch-klassenarbeit-01-outbox:qa-cloud-profile")||"[]").length===0);
  assert.ok(events.some(e=>e.app_id==="englisch-klassenarbeit-01"),"classwork progress must sync to its separate app stream");
  await cloud.close();
  console.log("PASS: English classwork practice, persistence and URL-only cloud sync");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
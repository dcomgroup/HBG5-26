const {chromium}=require("playwright"),assert=require("node:assert/strict");
const base="http://127.0.0.1:8765/HBG5-26/";
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const local=await browser.newContext(),page=await local.newPage();
  await page.goto(base);
  assert.match(await page.locator("#profile-box").innerText(),/Testmodus/);
  const suggested=await page.locator("#profile-choices button").first().innerText();
  await page.locator("#profile-choices button").first().click();
  assert.match(await page.locator("#profile-confirm").innerText(),/Lokales Profil/);
  await page.getByRole("button",{name:"Abbrechen"}).click();
  assert.match(await page.locator("#profile-box").innerText(),/Testmodus/);
  await page.locator("#profile-choices button").first().click();
  await page.getByRole("button",{name:"Lokales Profil anlegen",exact:true}).click();
  assert.match(await page.locator("#profile-box").innerText(),/Lokales Lernprofil/);
  const chosen=await page.locator("#active-profile-name").innerText();
  assert.ok(chosen.length>4);
  const mathHref=await page.locator('a[href*="mathe/test-01/"]').first().getAttribute("href");
  assert.ok(mathHref.includes("p="+chosen));
  await page.goto(mathHref);
  assert.match(await page.locator("#app").innerText(),new RegExp("Profil: "+chosen));
  await page.goto(base+"englisch/test-01/?p="+chosen);
  assert.equal(await page.locator("#profile").inputValue(),chosen);
  assert.equal(await page.locator("#profile").getAttribute("readonly"),"");
  await page.getByRole("button",{name:"Runde starten"}).click();
  assert.match(await page.locator("#app").innerText(),/Karte 1 von 8/);
  await local.close();

  const slug="qa-cloud-profile",secret="a".repeat(64),events=[];
  const cloud=await browser.newContext();
  await cloud.route("https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/**",async route=>{
   const name=route.request().url().split("/").pop(),p=route.request().postDataJSON();
   if(p.p_slug!==slug||p.p_secret!==secret){await route.fulfill({status:403,body:"{}"});return}
   if(name==="read_learning_events"){await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(events)});return}
   if(name==="append_learning_event"){
    if(!events.some(e=>e.event_id===p.p_event_id))events.push({event_id:p.p_event_id,card_id:p.p_card_id,event_data:p.p_event_data,occurred_at:p.p_occurred_at});
    await route.fulfill({status:200,contentType:"application/json",body:"true"});return;
   }
   await route.fulfill({status:404,body:"{}"});
  });
  const a=await cloud.newPage();
  await a.goto(base+"?p="+slug+"#sync="+secret);
  assert.match(await a.locator("#profile-box").innerText(),/Cloud-Lernprofil/);
  const english=await a.locator('a[href*="englisch/test-01/"]').first().getAttribute("href");
  assert.ok(english.includes("#sync="+secret));
  await a.goto(english);
  assert.equal(await a.locator("#profile").inputValue(),slug);
  await a.getByRole("button",{name:"Runde starten"}).click();
  await a.getByRole("button",{name:"Lösung aufdecken"}).click();
  await a.getByRole("button",{name:"Gewusst",exact:true}).click();
  await a.waitForFunction(()=>JSON.parse(localStorage.getItem("hbg5-26-englisch-outbox:qa-cloud-profile")||"[]").length===0);
  assert.equal(events.length,1);
  const b=await cloud.newPage();
  await b.goto(base+"englisch/test-01/?p="+slug+"#sync="+secret);
  await b.getByRole("button",{name:"Runde starten"}).click();
  const state=await b.evaluate(slug=>JSON.parse(localStorage.getItem("hbg5-26-englisch-vocab")).profiles[slug].cards,slug);
  assert.equal(Object.values(state).filter(x=>x.right===1).length,1);
  await cloud.close();
  console.log("PASS: browser local profile confirmation, Math/English handoff, cloud link and A-to-B sync");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

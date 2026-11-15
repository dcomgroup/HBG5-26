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
  await page.goto(base+"deutsch/test-01/?p="+chosen);
  assert.equal(await page.locator("#profile").inputValue(),chosen);
  await page.goto(base+"biologie/klassenarbeit-01/?p="+chosen);
  assert.equal(await page.locator("#profile").inputValue(),chosen);
  await page.goto(base+"latein/test-01/?p="+chosen);
  assert.match(await page.locator("#app").innerText(),new RegExp("Profil: "+chosen));
  await page.goto(base+"mathe/test-01/schnellcheck.html?p="+chosen);
  assert.match(await page.locator("#app").innerText(),new RegExp(chosen));
  let reserves=0;
  await local.route("https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/reserve_profile",async route=>{
   reserves++;await route.fulfill({status:200,contentType:"application/json",body:'[{"reserved_slug":"test"}]'});
  });
  await page.goto(base);
  await page.locator("#activate-cloud").click();
  await page.locator("#cloud-activation button").first().click();
  assert.equal(reserves,0,"name selection must not create cloud profile");
  await page.getByRole("button",{name:"Ja, Cloud-Profil anlegen"}).click();
  await page.locator("#profile-link").waitFor();
  assert.equal(reserves,1,"cloud profile must be reserved exactly once after confirmation");
  await local.close();

  const slug="qa-cloud-profile",secret="a".repeat(64),events=[];
  const cloud=await browser.newContext();
  const installRoute=async ctx=>ctx.route("https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/**",async route=>{
   const name=route.request().url().split("/").pop(),p=route.request().postDataJSON();
   if(p.p_slug!==slug||p.p_secret!==secret){await route.fulfill({status:403,body:"{}"});return}
   if(name==="read_learning_events"){await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(events)});return}
   if(name==="append_learning_event"){
    if(!events.some(e=>e.event_id===p.p_event_id))events.push({event_id:p.p_event_id,card_id:p.p_card_id,event_data:p.p_event_data,occurred_at:p.p_occurred_at});
    await route.fulfill({status:200,contentType:"application/json",body:"true"});return;
   }
   await route.fulfill({status:404,body:"{}"});
  });
  await installRoute(cloud);
  const a=await cloud.newPage();
  await a.goto(base+"?p="+slug+"#sync="+secret);
  assert.match(await a.locator("#profile-box").innerText(),/Cloud-Lernprofil/);
  await a.getByText("Cloud-Profil bestätigt.",{exact:true}).waitFor();
  const english=await a.locator('a[href*="englisch/test-01/"]').first().getAttribute("href");
  assert.ok(english.includes("#sync="+secret));
  const mathLink=await a.locator('a[href*="mathe/test-01/"]').first().getAttribute("href");
  await a.goto(mathLink);
  await a.getByRole("button",{name:"Üben starten"}).click();
  await a.locator(".option").first().click();
  await a.getByRole("button",{name:"Antwort prüfen"}).click();
  await a.waitForFunction(()=>JSON.parse(localStorage.getItem("hbg5-26-mathe-outbox:qa-cloud-profile")||"[]").length===0);
  const mathEvents=events.filter(e=>/^\d{1,3}$/.test(e.card_id));
  assert.equal(mathEvents.length,1,"Math must upload the answered card");
  const mathOther=await browser.newContext();
  await installRoute(mathOther);
  const mathB=await mathOther.newPage();
  await mathB.goto(mathLink);
  await mathB.waitForFunction(slug=>Object.keys(JSON.parse(localStorage.getItem("hbg5-26-mathe-test-01")||"{}").profiles?.[slug]?.cards||{}).length===1,slug);
  await mathOther.close();
  await a.goto(mathLink);
  const quick=await a.getByRole("link",{name:/Schnellcheck/}).getAttribute("href");
  assert.ok(quick.includes("p="+slug)&&quick.includes("#sync="+secret));
  await a.goto(quick);
  await a.getByRole("button",{name:/Schnellrunde starten/}).waitFor();
  await a.goto(english);
  assert.equal(await a.locator("#profile").inputValue(),slug);
  await a.getByRole("button",{name:"Runde starten"}).click();
  await a.getByRole("button",{name:"Lösung aufdecken"}).click();
  await a.getByRole("button",{name:"Gewusst",exact:true}).click();
  await a.waitForFunction(()=>JSON.parse(localStorage.getItem("hbg5-26-englisch-outbox:qa-cloud-profile")||"[]").length===0);
  assert.equal(events.filter(e=>e.card_id.startsWith("en-")).length,1);
  const other=await browser.newContext();
  await installRoute(other);
  const b=await other.newPage();
  await b.goto(base+"englisch/test-01/?p="+slug+"#sync="+secret);
  await b.getByRole("button",{name:"Runde starten"}).click();
  await b.waitForFunction(slug=>{const d=JSON.parse(localStorage.getItem("hbg5-26-englisch-vocab")||"{}");return Object.values(d.profiles?.[slug]?.cards||{}).some(x=>x.right===1)},slug);
  const state=await b.evaluate(slug=>JSON.parse(localStorage.getItem("hbg5-26-englisch-vocab")).profiles[slug].cards,slug);
  assert.equal(Object.values(state).filter(x=>x.right===1).length,1);
  await other.close();
  // A second answer during a network outage must remain in the local outbox,
  // then upload exactly once when connectivity returns.
  await cloud.setOffline(true);
  await a.getByRole("button",{name:"Lösung aufdecken"}).click();
  await a.getByRole("button",{name:"Gewusst",exact:true}).click();
  await a.waitForFunction(()=>JSON.parse(localStorage.getItem("hbg5-26-englisch-outbox:qa-cloud-profile")||"[]").length===1);
  assert.equal(events.filter(e=>e.card_id.startsWith("en-")).length,1,"offline answer must not reach the cloud");
  await cloud.setOffline(false);
  await a.evaluate(()=>window.HBG_ENGLISH_CLOUD.sync());
  await a.waitForFunction(()=>JSON.parse(localStorage.getItem("hbg5-26-englisch-outbox:qa-cloud-profile")||"[]").length===0);
  assert.equal(events.filter(e=>e.card_id.startsWith("en-")).length,2,"offline answer should upload on reconnection");
  await a.evaluate(()=>window.HBG_ENGLISH_CLOUD.sync());
  assert.equal(events.filter(e=>e.card_id.startsWith("en-")).length,2,"retry must not duplicate the offline answer");
  const invalid=await browser.newContext();
  await invalid.route("https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/**",route=>route.fulfill({status:403,body:"{}"}));
  const bad=await invalid.newPage();
  await bad.goto(base+"?p=invalid-profile#sync="+secret);
  await bad.getByText(/Cloud-Zugriff nicht bestätigt/).waitFor();
  const badLink=await bad.locator('a[href*="englisch/test-01/"]').first().getAttribute("href");
  assert.ok(badLink.includes("demo=1"));
  assert.ok(!badLink.includes("#sync="));
  await invalid.close();
  const migrationEvents=[];
  const migrationContext=await browser.newContext();
  await migrationContext.route("https://velspjtxenbvvwgptahh.supabase.co/rest/v1/rpc/**",async route=>{
   const name=route.request().url().split("/").pop(),p=route.request().postDataJSON();
   if(p.p_slug!=="migration-cloud"||p.p_secret!==secret){await route.fulfill({status:403,body:"{}"});return}
   if(name==="read_learning_events"){await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(migrationEvents.filter(e=>e.app_id===p.p_app_id))});return}
   if(name==="append_learning_event"){
    if(!migrationEvents.some(e=>e.event_id===p.p_event_id))migrationEvents.push({event_id:p.p_event_id,app_id:p.p_app_id,card_id:p.p_card_id,event_data:p.p_event_data,occurred_at:p.p_occurred_at});
    await route.fulfill({status:200,contentType:"application/json",body:"true"});return;
   }
   await route.fulfill({status:404,body:"{}"});
  });
  const migrationPage=await migrationContext.newPage();
  await migrationPage.goto(base);
  await migrationPage.evaluate(()=>localStorage.setItem("hbg5-26-mathe-test-01",JSON.stringify({profiles:{CE:{cards:{"0":{level:2,right:2,wrong:0}},rounds:5,answers:40}}})));
  await migrationPage.evaluate(()=>localStorage.setItem("hbg5-26-englisch-vocab",JSON.stringify({profiles:{CE:{cards:{"en-001":{right:2,wrong:1,streak:2}}}}})));
  await migrationPage.goto(base+"?p=migration-cloud#sync="+secret);
  await migrationPage.getByText("Cloud-Profil bestätigt.",{exact:true}).waitFor();
  await migrationPage.getByRole("button",{name:"Lokale Lernstände übernehmen"}).click();
  await migrationPage.locator("#migration select").selectOption("CE");
  await migrationPage.locator("#migration input[type=checkbox]").check();
  await migrationPage.getByRole("button",{name:"Übernahme prüfen"}).click();
  await migrationPage.getByRole("button",{name:"Ja, jetzt in Supabase übernehmen"}).click();
  await migrationPage.getByText(/3 Einträge bestätigt/).waitFor();
  assert.equal(migrationEvents.length,3);
  assert.ok(migrationEvents.some(e=>e.app_id==="englisch"&&e.card_id==="en-001"));
  const original=await migrationPage.evaluate(()=>JSON.parse(localStorage.getItem("hbg5-26-mathe-test-01")).profiles.CE.answers);
  assert.equal(original,40);
  const englishOriginal=await migrationPage.evaluate(()=>JSON.parse(localStorage.getItem("hbg5-26-englisch-vocab")).profiles.CE.cards["en-001"].right);
  assert.equal(englishOriginal,2);
  await migrationContext.close();
  await cloud.close();
  console.log("PASS: browser local profile confirmation, Math/English handoff, cloud link and A-to-B sync");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

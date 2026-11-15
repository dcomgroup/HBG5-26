const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:8765/HBG5-26/mathe/test-01/';
(async()=>{
 const browser=await chromium.launch();
 try{
  const ctx=await browser.newContext();
  const page=await ctx.newPage();
  await page.goto(base);
  const now=Date.now(),day=86400000;
  const cards={
   0:{level:3,right:3,wrong:0,lastCorrect:new Date(now-day).toISOString(),lastReviewed:new Date(now-day).toISOString(),dueAt:now+day},
   1:{level:3,right:3,wrong:0,lastCorrect:new Date(now-10*day).toISOString(),lastReviewed:new Date(now-10*day).toISOString(),dueAt:now-day},
   2:{level:3,right:3,wrong:0}, // legacy card: no timestamps
   3:{level:1,right:1,wrong:0,lastCorrect:new Date(now).toISOString(),lastReviewed:new Date(now).toISOString(),dueAt:now+day}
  };
  await page.evaluate(cards=>localStorage.setItem('hbg5-26-mathe-test-01',JSON.stringify({profiles:{CE:{cards,rounds:2,answers:16}}})),cards);
  await page.reload();
  await page.getByRole('button',{name:'CE'}).click();
  const summary=await page.locator('#app').innerText();
  assert.match(summary,/3 % aktuell sicher/,'one of 33 types must be green');
  assert.match(summary,/1 von 33 Aufgabentypen/);
  assert.match(summary,/2 auffrischen/,'expired and legacy mastery should be yellow');
  assert.match(summary,/30 noch üben/);
  assert.match(summary,/Letzte Übung:/);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('hbg5-26-mathe-test-01')).profiles.CE.cards);
  assert.equal(saved[0].level,3,'overview must not change card level');
  assert.equal(saved[1].level,3,'expiry must not destroy previous mastery');
  assert.equal(saved[2].level,3,'legacy mastery must be preserved');
  console.log('PASS: math progress green/yellow/grey, dated status, legacy states preserved');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

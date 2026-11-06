import { chromium as pw } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await pw.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage'],headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
// Sandbox blocks third-party image/font hosts. Serve the exact committed photos locally for layout tests.
await page.route('https://**/*',async r=>{const u=r.request().url();const m=u.match(/\/assets\/([^/?]+)$/);if(m)await r.fulfill({path:'assets/'+m[1]});else await r.abort();});
for(const width of [320,390,768,1024,1440]){
 await page.setViewportSize({width,height:900});await page.goto('http://localhost:5173');
 for(const route of ['home','work','find-glass','services','fleet','contact','faq']){
  await page.evaluate(r=>location.hash=r,route);await page.waitForTimeout(100);
  assert(await page.locator('#view-'+route).isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${route}`);
 }
 console.log('PASS layout/routes',width);
}
await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:5173');
await page.locator('#menuButton').click();assert(await page.locator('#mobileNav').isVisible());await page.locator('#mobileNav a[href="#work"]').click();assert(!(await page.locator('#mobileNav').isVisible()));
await page.evaluate(()=>{window.__opened=[];window.open=u=>window.__opened.push(u);location.hash='contact';});await page.waitForTimeout(100);
await page.locator('#quoteForm button[type=submit]').click();assert.equal(await page.evaluate(()=>__opened.length),0);
for(const [id,v] of Object.entries({name:'Test Customer',phone:'0821234567',make:'Toyota',model:'Corolla',location:'Benoni'}))await page.locator('#'+id).fill(v);
await page.locator('#service').selectOption('Fleet or corporate enquiry');assert(await page.locator('#fleetFields').isVisible());await page.locator('#companyName').fill('Test Fleet');await page.locator('#privacyConsent').check();await page.locator('#quoteForm button[type=submit]').click();assert((await page.evaluate(()=>decodeURIComponent(__opened[0]))).includes('Test Fleet'));
await page.evaluate(()=>location.hash='find-glass');await page.waitForTimeout(100);
await page.locator('#finderMake').selectOption('Toyota');await page.locator('#finderModel').fill('Corolla');await page.locator('.btn-next').click();await page.locator('#finderGlass').selectOption('Front windscreen');await page.locator('.btn-next').click();await page.locator('#finderLocation').fill('Benoni');await page.locator('#glassFinderForm button[type=submit]').click();assert(await page.locator('#finderReview').isVisible());await page.locator('#finderReviewSend').click();const msg=await page.evaluate(()=>__infinityPreparedFinderMessage);assert(msg.includes('\n\nVehicle make: Toyota'));assert(!msg.includes('\\n'));
await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.hero-photo').evaluate(e=>getComputedStyle(e).animationName),'none');
assert.deepEqual(errors,[]);console.log('PASS mobile menu, invalid form blocking, fleet WhatsApp, finder review/newlines, reduced motion; no JS errors');
await browser.close();

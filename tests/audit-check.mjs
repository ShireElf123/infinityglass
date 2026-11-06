import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox'],headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}}); const page=await context.newPage();
await page.route('https://**/*',async r=>{const m=r.request().url().match(/\/assets\/((?:optimized\/)?[^/?]+)$/);if(m)await r.fulfill({path:'assets/'+m[1]});else await r.abort();});
await page.goto('http://localhost:5173');
await page.locator('.hero-photo').waitFor({state:'visible'});
await page.waitForFunction(()=>document.querySelector('.hero-photo').naturalWidth>0);
assert((await page.locator('.hero-photo').evaluate(e=>e.currentSrc)).endsWith('hero-workshop-480.webp'));
const results=[];
for(const route of ['home','find-glass','services','fleet','work','faq','contact','privacy','terms']){
 await page.evaluate(r=>location.hash=r,route);await page.waitForTimeout(800);
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 results.push({route,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
}
console.log(JSON.stringify(results,null,2));
await page.goto('http://localhost:5173/#work');
for(const image of await page.locator('#view-work .customer-job img').all()){
 await image.scrollIntoViewIfNeeded();await image.evaluate(e=>e.decode());
 assert((await image.evaluate(e=>e.currentSrc)).endsWith('-480.webp'));
 assert(Math.abs(await image.evaluate(e=>e.naturalWidth/e.naturalHeight)-4/3)<0.01);
}
// Year error must clear when the optional year is deleted.
await page.goto('http://localhost:5173/#find-glass');await page.locator('#finderMake').selectOption('Toyota');await page.locator('#finderModel').fill('Corolla');await page.locator('#finderYear').fill('1900');await page.locator('.btn-next').click();assert(await page.locator('#finderYear').isVisible());await page.locator('#finderYear').fill('');await page.locator('.btn-next').click();assert(await page.locator('#finderGlass').isVisible());
// Remote product failures retain a useful vector illustration.
assert.equal(await page.locator('.product-art svg').count(),7);
assert.equal(await page.locator('#main > .view').count(),9);
const ids=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(new Set(ids).size,ids.length);
await browser.close();
if(results.some(r=>r.violations.length))process.exitCode=1;

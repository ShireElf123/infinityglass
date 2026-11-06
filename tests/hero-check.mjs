import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox'],headless:true});
const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://**/*',async r=>{const m=r.request().url().match(/\/assets\/((?:optimized\/)?[^/?]+)$/);if(m)await r.fulfill({path:'assets/'+m[1]});else await r.abort();});
await mkdir('test-results',{recursive:true});
for(const width of [320,390,768,1024,1440]){
 await page.setViewportSize({width,height:1000});await page.goto('http://localhost:5173/#home');await page.locator('.hero-photo').evaluate(e=>e.decode());await page.waitForTimeout(800);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 const hero=await page.locator('.hero').evaluate(el=>{
  const img=el.querySelector('img'),style=getComputedStyle(img),h=getComputedStyle(el.querySelector('h1'));
  const parents=[];for(let p=img;p;p=p.parentElement){const c=getComputedStyle(p);parents.push({opacity:c.opacity,filter:c.filter,mix:c.mixBlendMode});}
  return {src:img.src,current:img.currentSrc,natural:img.naturalWidth,filter:style.filter,opacity:style.opacity,animation:style.animationName,transform:style.transform,mask:style.maskImage,heading:{color:h.color,background:h.backgroundImage,fill:h.webkitTextFillColor},pseudo:['::before','::after'].map(p=>{const c=getComputedStyle(el,p);return c.content==='none'||c.display==='none';}),parents};
 });
 assert(hero.src.endsWith('/assets/hero-workshop.webp'));assert(hero.natural>0);assert.equal(hero.filter,'none');assert.equal(hero.opacity,'1');assert.equal(hero.animation,'none');assert.equal(hero.mask,'none');assert.equal(hero.transform,'none');assert(hero.pseudo.every(Boolean));assert(hero.parents.every(p=>p.opacity==='1'&&p.filter==='none'&&p.mix==='normal'));assert.equal(hero.heading.color,'rgb(17, 26, 35)');assert.equal(hero.heading.background,'none');assert.notEqual(hero.heading.fill,'rgba(0, 0, 0, 0)');
 const styles=await page.locator('.hero-actions .btn').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return {background:s.backgroundImage,color:s.color,border:s.borderColor,width:r.width,height:r.height,left:r.left,right:r.right};}));
 assert.notEqual(styles[0].background,'none');assert.equal(styles[0].color,'rgb(255, 255, 255)');assert.equal(styles[1].background,'none');assert.equal(styles[1].color,'rgb(24, 51, 77)');assert(styles.every(s=>s.height>=44&&s.left>=0&&s.right<=width));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const result=await new AxeBuilder({page}).include('.hero').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations.map(v=>v.id),[]);
 if([390,768,1440].includes(width))await page.screenshot({path:`test-results/hero-${width}.png`,fullPage:false});
 await page.evaluate(()=>scrollTo(0,240));assert.equal(await page.locator('.hero-photo').evaluate(e=>getComputedStyle(e).transform),'none');
 console.log('PASS natural-bright hero, original asset loaded, solid heading, distinct CTAs, contrast, no overlays/masks/filter/overflow:',width);
}
assert.deepEqual(errors,[]);await browser.close();

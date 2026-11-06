import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
const source=await readFile('index.html','utf8');
const backup=await readFile('backups/glass-guide-38a8e58/guide.html.txt','utf8');
for(const re of [/<div class="vehicle-map">[\s\S]*?<\/svg>/]) assert.equal(source.match(re)[0],backup.match(re)[0], 'Photo and SVG geometry must remain unchanged');
const base=process.env.BASE_URL||'http://localhost:4173';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox'],headless:true});
const context=await browser.newContext({reducedMotion:'reduce'});
// This checks guide UI geometry, not arrow accuracy over the unavailable external photograph.
await context.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await mkdir('test-results',{recursive:true});
const labels=['Front windscreen','Door / side glass','Rear windscreen','Quarter glass'];
for(const width of [320,360,390,430,768,1024,1280,1440]){
 await page.setViewportSize({width,height:1000});await page.goto(base);
 const guide=page.locator('.vehicle-glass-showcase');await guide.scrollIntoViewIfNeeded();
 assert.deepEqual(await page.locator('.vehicle-hotspot > span:first-child').allTextContents(),labels);
 const geometry=await page.locator('.vehicle-map').evaluate(map=>{
  const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
  return {map:rect(map),items:[...map.querySelectorAll('.vehicle-hotspot,.vehicle-map-kicker,.vehicle-map-caption')].map(rect)};
 });
 for(const r of geometry.items)assert(r.left>=geometry.map.left&&r.right<=geometry.map.right&&r.top>=geometry.map.top&&r.bottom<=geometry.map.bottom,'Guide control bounds at '+width);
 for(let i=0;i<geometry.items.length;i++)for(let j=i+1;j<geometry.items.length;j++){
  const a=geometry.items[i],b=geometry.items[j];assert(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top,'Guide controls overlap at '+width+' items '+i+','+j+' '+JSON.stringify({a,b}));
 }
 const choices=await guide.locator('a[data-glass-choice]').evaluateAll(es=>es.map(e=>e.dataset.glassChoice));
 for(let i=0;i<choices.length;i++){
  if(i)await page.locator('.header .brand').click();
  const link=guide.locator('a[data-glass-choice]').nth(i);
  if(i===0){await link.focus();await page.keyboard.press('Enter');}else await link.click();
  assert.equal(new URL(page.url()).pathname,'/find-glass/');
  assert.equal(await page.locator('#finderGlass').inputValue(),choices[i]);
  assert((await page.locator('[data-summary=glass]').textContent()).includes(choices[i]));
 }
 await page.locator('#finderMake').selectOption('Toyota');await page.locator('#finderModel').fill('Corolla');
 await page.locator('.btn-next').click();
 for(const position of ['Front left door glass','Front right door glass','Rear left door glass','Rear right door glass']){
  await page.locator('#finderGlass').selectOption(position);assert.equal(await page.locator('#finderGlass').inputValue(),position);
 }
 await page.locator('.header .brand').click();await guide.scrollIntoViewIfNeeded();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.equal(await page.locator('.vehicle-hotspot').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 if([390,768,1440].includes(width))await guide.screenshot({path:`test-results/guide-controls-${width}.png`});
 if(width===390){const result=await new AxeBuilder({page}).include('.vehicle-glass-showcase').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(result.violations.map(v=>v.id),[]);}
}
assert.deepEqual(errors,[]);await browser.close();
console.log('PASS guide labels, photo/SVG preservation and backup, control bounds/no overlaps at eight widths, all 10 link handoffs, keyboard activation, four door positions, reduced motion, axe and no runtime errors. External-photo arrow-to-pane accuracy NOT verified.');

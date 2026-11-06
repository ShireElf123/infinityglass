import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base=process.env.BASE_URL||'http://localhost:4173';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox'],headless:true});
const context=await browser.newContext({reducedMotion:'reduce'});
await context.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
const page=await context.newPage();
await mkdir('test-results',{recursive:true});
for(const width of [320,360,390,430,768,1024,1280,1440]){
 await page.setViewportSize({width,height:1000});await page.goto(base);
 for(const region of ['.header','.footer']){
  const logo=page.locator(region+' .brand-image');await logo.scrollIntoViewIfNeeded();await logo.evaluate(e=>e.decode());
  assert.equal(await logo.getAttribute('src'),'/assets/brand/infinity-logo.webp');
  assert.equal(await logo.getAttribute('width'),'1043');assert.equal(await logo.getAttribute('height'),'248');
  const dims=await logo.evaluate(e=>{const r=e.getBoundingClientRect();return{w:r.width,h:r.height,left:r.left,right:r.right,natural:e.naturalWidth}});
  assert(dims.natural>0);assert(Math.abs(dims.w/dims.h-1043/248)<0.01);assert(dims.left>=0&&dims.right<=width);
  assert(await logo.locator('..').getAttribute('aria-label'));assert.equal(await logo.locator('..').getAttribute('href'),'/');
 }
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if([390,1440].includes(width))await page.locator('.footer').screenshot({path:`test-results/logo-footer-${width}.png`});
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`test-results/logo-header-${width}.png`});
 const bounds=await page.locator('.header .brand,.nav-links,.nav-actions').evaluateAll(es=>es.filter(e=>getComputedStyle(e).display!=='none').map(e=>{const r=e.getBoundingClientRect();return {l:r.left,r:r.right}}));
 for(let i=1;i<bounds.length;i++)assert(bounds[i-1].r<=bounds[i].l,'Header groups must not overlap at '+width);
}
await page.locator('.header .brand').focus();await page.keyboard.press('Enter');assert(await page.locator('#view-home').isVisible());
await browser.close();console.log('PASS full client logo: real asset loading, accessible home links, aspect ratio, footer/header bounds, no overlap or overflow at eight widths');

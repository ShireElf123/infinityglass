import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base=process.env.BASE_URL||'http://localhost:4173';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
const page=await browser.newPage({reducedMotion:'reduce'});
await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
await mkdir('test-results',{recursive:true});
for(const width of [761,768,1024,1100,1101,1120,1280,1366,1440,1536,1920,2560]){
 await page.setViewportSize({width,height:width===1366?768:900});await page.goto(base);
 await page.locator('.hero-photo').evaluate(e=>e.decode());
 await page.locator('.header .brand-image').evaluate(e=>e.decode());
 const result=await page.evaluate(()=>{
  const photo=document.querySelector('.hero-photo'),card=document.querySelector('.hero-content'),logo=document.querySelector('.header .brand-image');
  const box=e=>{const r=e.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  return {photo:box(photo),card:box(card),fit:getComputedStyle(photo).objectFit,asset:logo.currentSrc,ratio:logo.naturalWidth/logo.naturalHeight,overflow:document.documentElement.scrollWidth>innerWidth};
 });
 const {photo:p,card:c}=result;assert(p.right<=width&&p.left>=0);
 if(width>=1101){
  assert.equal(result.fit,'cover');assert.equal(p.left,0);assert.equal(p.width,width,'desktop photograph must remain full bleed');
  const scale=Math.max(p.width/1600,p.height/900),ox=p.left+(p.width-1600*scale)/2,oy=p.top+(p.height-900*scale)/2;
  // Measured against the original photo: left technician head/shoulders and raised arm.
  const left={left:ox+180*scale,right:ox+590*scale,top:oy+235*scale,bottom:oy+420*scale};
  const right={left:ox+1080*scale,right:ox+1440*scale,top:oy+80*scale,bottom:oy+520*scale};
  for(const subject of [left,right]){
   assert(subject.left>=p.left&&subject.right<=p.right&&subject.top>=p.top&&subject.bottom<=p.bottom,'upper-body subject area must remain inside the photo at '+width);
   assert(c.right<=subject.left||c.left>=subject.right||c.top>=subject.bottom||c.bottom<=subject.top,'card must not obscure either protected upper-body area at '+width);
  }
  assert(c.width<=640);assert(c.left>=24);assert(p.bottom-c.bottom<=32,'card must stay tucked into the lower-left');
 }else{
  assert.equal(result.fit,'contain');assert(Math.abs(p.width/p.height-16/9)<0.005);
  assert(c.top>=p.bottom,'tablet image and copy remain stacked');
 }
 assert(result.asset.endsWith('/assets/brand/infinity-logo.webp'));assert(Math.abs(result.ratio-1043/248)<0.001);assert(!result.overflow);
 const nav=await page.locator('.header .brand,.nav-links,.nav-actions').evaluateAll(es=>es.filter(e=>getComputedStyle(e).display!=='none').map(e=>{const r=e.getBoundingClientRect();return{l:r.left,r:r.right}}));
 for(let i=1;i<nav.length;i++)assert(nav[i-1].r<=nav[i].l,'header overlap at '+width);
 if([1366,1440,1920].includes(width)){
  await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)});
  await page.screenshot({path:`test-results/desktop-presentation-${width}.png`});
 }
}
await page.setViewportSize({width:390,height:844});await page.goto(base);await page.locator('.header .brand-image').evaluate(e=>e.decode());
assert((await page.locator('.header .brand-image').evaluate(e=>e.currentSrc)).endsWith('/assets/brand/infinity-logo.webp'));assert.equal(await page.locator('.brand-tagline').count(),0);
await browser.close();console.log('PASS full-bleed desktop photo, protected technician head/shoulder areas, compact lower-left card, original full logo and header spacing at 12 desktop/tablet widths; mobile retained.');

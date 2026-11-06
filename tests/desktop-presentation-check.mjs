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
  const photo=document.querySelector('.hero-photo'),card=document.querySelector('.hero-content'),tag=document.querySelector('.brand-tagline'),logo=document.querySelector('.header .brand-image');
  const box=e=>{const r=e.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  return {photo:box(photo),card:box(card),tag:box(tag),font:parseFloat(getComputedStyle(tag).fontSize),color:getComputedStyle(tag).color,fit:getComputedStyle(photo).objectFit,asset:logo.currentSrc,ratio:logo.naturalWidth/logo.naturalHeight,overflow:document.documentElement.scrollWidth>innerWidth};
 });
 assert.equal(result.fit,'contain');assert(Math.abs(result.photo.width/result.photo.height-16/9)<0.005,'full original photo aspect at '+width);
 const {photo:p,card:c}=result;assert(p.right<=width&&p.left>=0);assert(c.right<=p.left||c.left>=p.right||c.top>=p.bottom||c.bottom<=p.top,'copy must never cover either technician at '+width);
 assert(result.font>=12&&result.tag.height>=16);assert(result.asset.endsWith('/assets/brand/infinity-logo-desktop.webp'));assert(Math.abs(result.ratio-1043/184)<0.001);assert(!result.overflow);
 const nav=await page.locator('.header .brand,.nav-links,.nav-actions').evaluateAll(es=>es.filter(e=>getComputedStyle(e).display!=='none').map(e=>{const r=e.getBoundingClientRect();return{l:r.left,r:r.right}}));
 for(let i=1;i<nav.length;i++)assert(nav[i-1].r<=nav[i].l,'header overlap at '+width);
 if([1366,1440,1920].includes(width)){
  await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)});
  await page.screenshot({path:`test-results/desktop-presentation-${width}.png`});
 }
}
await page.setViewportSize({width:390,height:844});await page.goto(base);await page.locator('.header .brand-image').evaluate(e=>e.decode());
assert((await page.locator('.header .brand-image').evaluate(e=>e.currentSrc)).endsWith('/assets/brand/infinity-logo.webp'));assert.equal(await page.locator('.brand-tagline').isVisible(),false);
await browser.close();console.log('PASS entire uncropped photo with no text occlusion, readable desktop tagline, art direction, header spacing at 12 desktop/tablet widths; original mobile logo retained.');

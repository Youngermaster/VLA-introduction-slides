import { chromium } from 'playwright-chromium'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
for (const url of [
  'http://localhost:3131/#/3?clicks=6&lang=en',
  'http://localhost:3131/?lang=en#/3?clicks=6',
]) {
  await p.goto(url, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1200)
  const r = await p.evaluate(() => ({
    href: location.href,
    htmlLang: document.documentElement.lang,
    ls: (()=>{try{return localStorage.getItem('vla-deck-locale')}catch{return 'err'}})(),
    h1: document.querySelector('.slidev-page:not([style*="display: none"]) h1')?.innerText,
    punch: document.querySelector('.da__punch')?.innerText?.slice(0,50),
  }))
  console.log(JSON.stringify(r, null, 1))
}
await b.close()

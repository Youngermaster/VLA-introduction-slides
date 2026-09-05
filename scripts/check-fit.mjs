/**
 * Overflow check.
 *
 * The canvas is a fixed 980x551. Content that exceeds it is CLIPPED (the layout
 * sets overflow:hidden deliberately, so a too-tall slide loses its last line
 * rather than colliding with the citation). That failure is easy to miss while
 * authoring and impossible to miss on stage — and it differs by language,
 * because Spanish prose runs roughly 20% longer than English.
 *
 * Requires the dev server on :3131.
 *   node scripts/check-fit.mjs
 */
import { chromium } from 'playwright-chromium'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
let failed = false
for (const lang of ['es', 'en']) {
  const bad = []
  for (let n = 1; n <= 47; n++) {
    await p.goto(`http://localhost:3131/#/${n}?clicks=9&lang=${lang}`, { waitUntil: 'networkidle' })
    await p.waitForTimeout(500)
    const r = await p.evaluate(() => {
      const pages = [...document.querySelectorAll('.slidev-page')]
      const el = pages.find(x => x.getBoundingClientRect().height > 0)
      const lay = el?.querySelector('.slidev-layout')
      if (!lay) return null
      return { over: lay.scrollHeight - lay.clientHeight, alias: lay.className }
    })
    if (r && r.over > 4) bad.push(`${n} (+${r.over}px)`)
  }
  if (bad.length) failed = true
  console.log(' ', lang, bad.length ? `overflows: ${bad.join(', ')}` : 'all slides fit')
}
await b.close()
if (failed) {
  console.error('\n✗ slides overflow the canvas — trim the prose or tighten the component\n')
  process.exit(1)
}
console.log('\n✓ every slide fits the canvas in both languages\n')

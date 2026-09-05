/**
 * Screenshot every slide (optionally at every click step) from the running dev
 * server. Rehearsing a deck by clicking through it one slide at a time is how
 * layout bugs survive to the stage; this makes a full visual pass cheap.
 *
 *   node scripts/shots.mjs [--clicks] [--lang es|en] [--port 3131]
 */
import { chromium } from 'playwright-chromium'
import { mkdir, rm } from 'node:fs/promises'
import { parse } from 'yaml'
import { readFileSync } from 'node:fs'

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > -1 ? process.argv[i + 1] : d
}
const withClicks = process.argv.includes('--clicks')
const lang = arg('lang', 'es')
const port = arg('port', '3131')
const outDir = `.shots/${lang}`

// Click counts come from the deck itself, so this never drifts from slides.md
const md = readFileSync('slides.md', 'utf8')
const blocks = md.split(/^---$/m)
const slides = []
for (let i = 0; i < blocks.length; i++) {
  const fm = blocks[i]
  if (!/^\s*(layout|routeAlias|clicks|transition):/m.test(fm)) continue
  let meta = {}
  try { meta = parse(fm) ?? {} } catch { meta = {} }
  if (typeof meta !== 'object' || meta === null) continue
  if (!('routeAlias' in meta) && !('layout' in meta)) continue
  slides.push({ alias: meta.routeAlias ?? `slide`, clicks: meta.clicks ?? 0 })
}
// the title slide has no frontmatter block of its own
slides.unshift({ alias: 'title', clicks: 0 })

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 })

let shot = 0
for (let n = 1; n <= slides.length; n++) {
  const s = slides[n - 1]
  const steps = withClicks ? [...Array(s.clicks + 1).keys()] : [s.clicks]
  for (const c of steps) {
    await page.goto(`http://localhost:${port}/#/${n}?clicks=${c}&lang=${lang}`, { waitUntil: 'networkidle' })
    // let entrance transitions and staggers settle before capturing
    await page.waitForTimeout(900)
    const name = `${String(n).padStart(2, '0')}-${s.alias}${withClicks ? `-c${c}` : ''}.png`
    await page.screenshot({ path: `${outDir}/${name}` })
    shot++
  }
}

await browser.close()
console.log(`${shot} screenshots → ${outDir}/  (${slides.length} slides, lang=${lang})`)

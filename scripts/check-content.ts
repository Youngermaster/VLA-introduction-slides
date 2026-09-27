/**
 * Content drift guard.
 *
 * Three artifacts have to agree — slides.md, locales/*.yml and monologue/*.md —
 * and nothing in the toolchain notices when they stop agreeing. A missing
 * translation key renders as a raw key on a projector; a missing monologue
 * section leaves a hole you find while rehearsing at midnight. Both are cheap
 * to catch here and expensive to catch later.
 *
 * Checks:
 *   1. every locale has exactly the same key set
 *   2. every $t()/<T k=""> key used in slides.md exists in every locale
 *   3. every locale key is actually used somewhere (dead-content warning)
 *   4. every slide routeAlias has a monologue section in every language
 *   5. every monologue section maps to a real slide
 *   6. canvas scenes: strings in es/en, L() keys exist, clicks match cues
 *   7. no em dashes in slide text, scene strings or the spoken script
 *
 * Run: pnpm check:content   (part of `pnpm verify`)
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'

const ROOT = process.cwd()
const LOCALES = ['es', 'en'] as const
type Locale = (typeof LOCALES)[number]

let errors = 0
let warnings = 0
const fail = (msg: string) => { console.error(`  ✗ ${msg}`); errors++ }
const warn = (msg: string) => { console.warn(`  ! ${msg}`); warnings++ }

function flatten(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix]
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

// ── load ────────────────────────────────────────────────────────────────────
const slidesMd = readFileSync(join(ROOT, 'slides.md'), 'utf8')

const localeKeys = new Map<Locale, string[]>()
for (const l of LOCALES) {
  const raw = readFileSync(join(ROOT, 'locales', `${l}.yml`), 'utf8')
  localeKeys.set(l, flatten(parse(raw) ?? {}))
}

const monoAliases = new Map<Locale, string[]>()
for (const l of LOCALES) {
  const raw = readFileSync(join(ROOT, 'monologue', `${l}.md`), 'utf8')
  monoAliases.set(
    l,
    raw.split(/^##\s+/m).slice(1).map((p) => p.split('\n')[0].trim()),
  )
}

// slide aliases, in deck order
const slideAliases = [...slidesMd.matchAll(/^routeAlias:\s*(\S+)\s*$/gm)].map((m) => m[1])

// ── 1. locale parity ────────────────────────────────────────────────────────
console.log('\nlocale parity')
const base = localeKeys.get('es')!
for (const l of LOCALES) {
  if (l === 'es') continue
  const keys = localeKeys.get(l)!
  for (const k of base) if (!keys.includes(k)) fail(`${l}.yml is missing key "${k}"`)
  for (const k of keys) if (!base.includes(k)) fail(`es.yml is missing key "${k}" (present in ${l})`)
}
if (!errors) console.log(`  ✓ ${base.length} keys, identical across ${LOCALES.join(', ')}`)

// ── 2 & 3. keys used vs keys defined ────────────────────────────────────────
// Keys are referenced from three places: slide markdown, the <T> component, and
// the visualization components (which carry most of the deck's diagram labels).
// Scanning only slides.md would report every component key as dead content.
console.log('\ntranslation keys used in slides.md + components')
const sources = [slidesMd]
for (const dir of ['components', 'pages']) {
  for (const f of readdirSync(join(ROOT, dir))) {
    if (f.endsWith('.vue')) sources.push(readFileSync(join(ROOT, dir, f), 'utf8'))
  }
}

/** Comments explain the API using example keys; scanning them yields ghosts. */
function stripComments(src: string): string {
  return src
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1')
}

const used = new Set<string>()
for (const raw of sources) {
  const src = stripComments(raw)
  for (const m of src.matchAll(/(?<![\w$.])(?:\$?t|md)\(\s*['"]([^'"]+)['"]\s*\)/g)) used.add(m[1])
  for (const m of src.matchAll(/<T\s+k="([^"]+)"/g)) used.add(m[1])
  // template-literal keys such as t(`c.chunking.s${n}k`) — record the prefix so
  // the whole family is treated as used rather than reported dead
  for (const m of src.matchAll(/(?<![\w$.])t\(\s*`([^`$]+)\$\{/g)) used.add(`${m[1]}*`)
}

for (const k of used) {
  if (k.endsWith('*')) continue // template-literal family, checked by prefix
  for (const l of LOCALES) {
    if (!localeKeys.get(l)!.includes(k)) fail(`"${k}" is used but ${l}.yml has no such key`)
  }
}
const prefixes = [...used].filter((k) => k.endsWith('*')).map((k) => k.slice(0, -1))
const isUsed = (k: string) => used.has(k) || prefixes.some((p) => k.startsWith(p))
/** Keys kept deliberately, though no slide renders them. */
const INTENTIONALLY_UNUSED = new Set<string>([])
const unused = base.filter(
  (k) => !isUsed(k) && !INTENTIONALLY_UNUSED.has(k) && !k.startsWith('nav.') && !k.startsWith('deck.'),
)
for (const k of unused) warn(`locale key "${k}" is defined but never used in slides.md`)
if (used.size) console.log(`  ✓ ${used.size} keys referenced, all resolve`)

// ── 4 & 5. monologue coverage ───────────────────────────────────────────────
console.log('\nmonologue coverage')
for (const l of LOCALES) {
  const aliases = monoAliases.get(l)!
  for (const a of slideAliases) {
    if (!aliases.includes(a)) fail(`monologue/${l}.md has no "## ${a}" section`)
  }
  for (const a of aliases) {
    if (a !== 'title' && !slideAliases.includes(a)) {
      warn(`monologue/${l}.md has "## ${a}" but no slide carries that routeAlias`)
    }
  }
}
if (!errors) console.log(`  ✓ ${slideAliases.length} slides covered in ${LOCALES.join(', ')}`)

// ── 6. canvas scenes: strings, parity, click budgets ─────────────────────────
// A scene's strings live in locales/scenes/<name>.yml with es and en side by
// side. Every L('key') the scene draws must exist in both, both languages must
// carry the same keys, and a slide's `clicks:` must match the scene's cues:
// otherwise the last click does nothing, or the scene never reaches its end.
console.log('\ncanvas scenes')
const sceneDir = join(ROOT, 'scenes')
const sceneNames = readdirSync(sceneDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts').map((f) => f.slice(0, -3))
const sceneCues = new Map<string, number>()
for (const name of sceneNames) {
  const src = stripComments(readFileSync(join(sceneDir, `${name}.ts`), 'utf8'))
  const cues = src.match(/cues:\s*\[([^\]]*)\]/)
  if (!cues) fail(`scenes/${name}.ts has no cues array`)
  else sceneCues.set(name, cues[1].split(',').filter((x) => x.trim()).length)
  let strings: Record<string, Record<string, unknown>> = {}
  try {
    strings = parse(readFileSync(join(ROOT, 'locales', 'scenes', `${name}.yml`), 'utf8')) ?? {}
  }
  catch {
    fail(`locales/scenes/${name}.yml is missing or invalid`)
    continue
  }
  const keysOf = (l: Locale) => Object.keys(strings[l] ?? {})
  for (const l of LOCALES) {
    if (!strings[l]) fail(`locales/scenes/${name}.yml has no "${l}" block`)
  }
  for (const k of keysOf('es')) if (!keysOf('en').includes(k)) fail(`scene ${name}: "en" is missing "${k}"`)
  for (const k of keysOf('en')) if (!keysOf('es').includes(k)) fail(`scene ${name}: "es" is missing "${k}"`)
  for (const m of src.matchAll(/\bL\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    if (!keysOf('es').includes(m[1])) fail(`scene ${name} draws L('${m[1]}') but locales/scenes/${name}.yml has no such key`)
  }
}
const slideBlocks = slidesMd.split(/^---$/m)
for (let i = 0; i < slideBlocks.length - 1; i++) {
  const use = slideBlocks[i + 1].match(/<Scene\s+name="(\w+)"/)
  if (!use) continue
  const fm = slideBlocks[i]
  if (!/routeAlias:/.test(fm)) continue
  const alias = fm.match(/routeAlias:\s*(\S+)/)?.[1]
  const clicks = Number(fm.match(/^clicks:\s*(\d+)/m)?.[1] ?? 0)
  const n = sceneCues.get(use[1])
  if (n === undefined) fail(`slide "${alias}" uses <Scene name="${use[1]}"> but scenes/${use[1]}.ts does not exist`)
  else if (clicks !== n - 1) fail(`slide "${alias}": clicks is ${clicks} but scene "${use[1]}" has ${n - 1} (cues.length - 1)`)
}
if (!errors) console.log(`  ✓ ${sceneNames.length} scenes, strings in es/en, click budgets match`)

// ── 7. no em dashes in anything the room reads or hears ──────────────────────
console.log('\nwriting')
const prose = [
  'slides.md', 'locales/es.yml', 'locales/en.yml', 'monologue/es.md', 'monologue/en.md',
  ...readdirSync(join(ROOT, 'locales', 'scenes')).map((f) => `locales/scenes/${f}`),
]
let dashes = 0
for (const f of prose) {
  readFileSync(join(ROOT, f), 'utf8').split('\n').forEach((line, i) => {
    if (line.includes('—')) {
      fail(`${f}:${i + 1} has an em dash (use a comma, period, colon or a connector)`)
      dashes++
    }
  })
}
if (!dashes) console.log(`  ✓ no em dashes in ${prose.length} prose files`)

// ── duplicate aliases would silently break panic mode and the practice join ──
const dupes = slideAliases.filter((a, i) => slideAliases.indexOf(a) !== i)
for (const d of new Set(dupes)) fail(`duplicate routeAlias "${d}" in slides.md`)

// ── report ──────────────────────────────────────────────────────────────────
console.log('')
if (errors) {
  console.error(`✗ ${errors} error(s), ${warnings} warning(s)\n`)
  process.exit(1)
}
console.log(`✓ content is consistent${warnings ? ` (${warnings} warning(s))` : ''}\n`)

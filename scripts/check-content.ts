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
const unused = base.filter((k) => !isUsed(k) && !k.startsWith('nav.') && !k.startsWith('deck.'))
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

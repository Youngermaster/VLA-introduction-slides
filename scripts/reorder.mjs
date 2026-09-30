/**
 * Reorder slides.md by routeAlias.
 *
 * Slide order is a narrative decision that changes often while a talk is being
 * written, and hand-moving multi-hundred-line blocks between `---` fences is how
 * you lose a speaker note. This splits the deck into addressable blocks, applies
 * a declared order, and rejoins — leaving frontmatter and notes untouched.
 *
 *   node scripts/reorder.mjs            # report current order
 *   node scripts/reorder.mjs --apply    # write the ORDER below
 */
import { readFileSync, writeFileSync } from 'node:fs'

const ORDER = [
  // Opening
  'title', 'hook', 'data-asymmetry',
  // 01 · What is a VLA
  'ch-vla', 'vla-acronym', 'vla-hero', 'what-is-a-policy', 'act-vs-vla',
  // 02 · Inside
  'ch-inside', 'language-in', 'vision-in', 'attention',
  'action-tokens', 'detokenizer', 'action-chunking', 'architecture',
  // 03 · How it learns
  'ch-train', 'recording', 'training', 'pretrain-finetune',
  // 04 · Demo
  'ch-demo', 'my-build', 'demo-video', 'backup-demo',
  // 05 · What comes next
  'ch-future', 'field-growth', 'limitations', 'world-models', 'generalist-models', 'when-to-use',
  // Closing
  'thanks', 'references',
]

const src = readFileSync('slides.md', 'utf8')

// Blocks are separated by a line containing only `---`. The first two fences
// wrap the headmatter, which also serves as slide 1's frontmatter.
const parts = src.split(/^---$/m)
// parts[0] = '' , parts[1] = headmatter, parts[2] = slide 1 body, then
// alternating frontmatter / body pairs.
const head = parts[1]
const slides = [{ fm: head, body: parts[2], isFirst: true }]
for (let i = 3; i < parts.length; i += 2) {
  slides.push({ fm: parts[i], body: parts[i + 1] ?? '', isFirst: false })
}

const aliasOf = (fm) => (fm.match(/^routeAlias:\s*(\S+)\s*$/m) ?? [])[1]

const found = slides.map((s) => aliasOf(s.fm))
console.log('current order:\n ', found.join(' · '), '\n')

const missing = ORDER.filter((a) => !found.includes(a))
const extra = found.filter((a) => a && !ORDER.includes(a))
if (missing.length) console.log('in ORDER but not in deck:', missing.join(', '))
if (extra.length) console.log('in deck but not in ORDER:', extra.join(', '))

if (!process.argv.includes('--apply')) process.exit(missing.length || extra.length ? 1 : 0)
if (missing.length || extra.length) {
  console.error('\nrefusing to reorder while ORDER and the deck disagree\n')
  process.exit(1)
}

const byAlias = new Map(slides.map((s) => [aliasOf(s.fm), s]))
const first = byAlias.get(ORDER[0])
if (!first?.isFirst) {
  console.error('the first entry in ORDER must be the headmatter slide')
  process.exit(1)
}

let out = `---${first.fm}---${first.body}`
for (const alias of ORDER.slice(1)) {
  const s = byAlias.get(alias)
  out += `---${s.fm}---${s.body}`
}
writeFileSync('slides.md', out)
console.log(`\n✓ reordered ${ORDER.length} slides`)

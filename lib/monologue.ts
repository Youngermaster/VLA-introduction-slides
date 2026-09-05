/**
 * Loads and parses monologue/{es,en}.md.
 *
 * Format — the `##` heading is the slide's routeAlias, which is what makes the
 * mapping survive reordering. A `<!-- target: 90s -->` comment declares how long
 * the section is meant to take:
 *
 *     ## hook-provocation
 *     <!-- target: 90s -->
 *
 *     ¿Por qué ChatGPT explotó y los robots no? …
 *
 * Deliberately separate from Slidev's speaker notes. Notes are short delivery
 * cues you glance at on stage; this is the full spoken script you rehearse
 * against. Two artifacts because they have two different jobs.
 */
import MarkdownIt from 'markdown-it'
import type { Locale } from './locale'

// breaks:false — the script is wrapped at 80 columns for editing, and those
// wraps are not pauses. Blank lines still start a new paragraph.
const md = new MarkdownIt({ html: false, breaks: false, linkify: true })

const files = import.meta.glob('../monologue/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export interface Section {
  /** slide routeAlias */
  alias: string
  /** declared target duration in seconds, if the author set one */
  target?: number
  /** raw markdown body */
  source: string
  /** rendered html */
  html: string
  words: number
  /** estimated spoken seconds at the locale's speaking rate */
  estimate: number
}

/** Spanish runs slower than English for the same content. */
const WPM: Record<Locale, number> = { es: 150, en: 160 }

function parseTarget(raw: string): number | undefined {
  const m = raw.match(/<!--\s*target:\s*(\d+)\s*(s|m|min)?\s*-->/i)
  if (!m) return undefined
  const n = Number(m[1])
  return m[2] && m[2].toLowerCase() !== 's' ? n * 60 : n
}

function countWords(raw: string): number {
  return raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/[#*_`>[\]()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

function parseDoc(source: string, locale: Locale): Section[] {
  const out: Section[] = []
  // split on level-2 headings; everything before the first one is preamble
  const parts = source.split(/^##\s+/m).slice(1)
  for (const part of parts) {
    const nl = part.indexOf('\n')
    const alias = (nl === -1 ? part : part.slice(0, nl)).trim()
    const body = nl === -1 ? '' : part.slice(nl + 1)
    const clean = body.replace(/<!--[\s\S]*?-->/g, '').trim()
    const words = countWords(clean)
    out.push({
      alias,
      target: parseTarget(body),
      source: clean,
      html: md.render(clean),
      words,
      estimate: Math.round((words / WPM[locale]) * 60),
    })
  }
  return out
}

export const monologues: Record<Locale, Section[]> = Object.entries(files).reduce(
  (acc, [path, source]) => {
    const locale = path.match(/([a-z]{2})\.md$/)?.[1] as Locale | undefined
    if (locale) acc[locale] = parseDoc(source, locale)
    return acc
  },
  { es: [], en: [] } as Record<Locale, Section[]>,
)

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Total estimated runtime for a locale, in seconds. */
export function totalEstimate(locale: Locale): number {
  return monologues[locale].reduce((n, s) => n + s.estimate, 0)
}

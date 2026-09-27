/**
 * Scene strings: one YAML file per scene, both languages side by side —
 *
 *   locales/scenes/<name>.yml
 *     es: { title: …, … }
 *     en: { title: …, … }
 *
 * Kept out of vue-i18n on purpose: canvas text is plain strings, and vue-i18n's
 * message compiler would reject the braces, pipes and @ signs that code-like
 * labels need ("{task}", "a | o, ℓ"). Side-by-side files also make it obvious
 * when a translation is missing — pnpm check:content fails on it.
 */
import { parse } from 'yaml'
import { DEFAULT_LOCALE, type Locale } from '../locale'

const files = import.meta.glob('../../locales/scenes/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

type Strings = Record<string, Record<string, string>>

export const sceneStrings: Record<string, Strings> = Object.fromEntries(
  Object.entries(files).map(([path, src]) => [path.match(/([\w-]+)\.yml$/)![1], (parse(src) ?? {}) as Strings]),
)

/**
 * L(key) for a scene. With a variant (<Scene name="chapter" v="inside" />),
 * `inside_key` wins over `key`, so one scene can serve several slides.
 */
export function labeler(name: string, lang: Locale, variant?: string) {
  const s = sceneStrings[name] ?? {}
  const get = (k: string) => s[lang]?.[k] ?? s[DEFAULT_LOCALE]?.[k]
  return (key: string) => (variant ? get(`${variant}_${key}`) : undefined) ?? get(key) ?? `‹${name}.${key}›`
}

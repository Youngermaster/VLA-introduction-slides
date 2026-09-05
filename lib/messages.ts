/**
 * Loads locales/*.yml.
 *
 * YAML rather than JSON because the deck's prose lives here, and YAML block
 * scalars (`key: |`) let it stay real, readable markdown that is comfortable to
 * edit. JSON would turn every paragraph into an escaped one-liner.
 *
 * Parsed in the browser rather than through a Vite YAML plugin so that the same
 * loader works unchanged in the deck, in the practice route, and in the Node
 * drift-check script.
 */
import { parse } from 'yaml'
import type { Locale } from './locale'

const files = import.meta.glob('../locales/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export type Messages = Record<string, unknown>

export const messages: Record<Locale, Messages> = Object.entries(files).reduce(
  (acc, [path, source]) => {
    const locale = path.match(/([a-z]{2})\.yml$/)?.[1]
    if (locale) acc[locale as Locale] = (parse(source) ?? {}) as Messages
    return acc
  },
  {} as Record<Locale, Messages>,
)

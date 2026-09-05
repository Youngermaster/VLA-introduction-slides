/**
 * Locale resolution and the shared reactive locale state.
 *
 * Slidev has no built-in i18n (upstream slidevjs/slidev#1125 is still open), so
 * this is ours. The design constraint that drives it: the practice route must be
 * able to run the SLIDES in one language while the MONOLOGUE runs in another, so
 * the locale has to be a runtime value, not a build-time entry file.
 *
 * Resolution order:
 *   1. ?lang=  query param   — what `/practice` uses to drive its slide iframe
 *   2. localStorage          — remembers your last choice across reloads
 *   3. VITE_DECK_LOCALE env  — how `pnpm export` produces a per-language PDF,
 *                              since `slidev export` drives its own browser and
 *                              cannot be handed a query string
 *   4. 'es'                  — the talk is delivered in Spanish
 */
import { ref, watch } from 'vue'

export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'es'

const STORAGE_KEY = 'vla-deck-locale'

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

export function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  const fromQuery = new URLSearchParams(window.location.search).get('lang')
  if (isLocale(fromQuery)) return fromQuery

  // Slidev may run in hash-router mode, where the query lives after the hash
  const hash = window.location.hash
  const hashQuery = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : ''
  const fromHash = new URLSearchParams(hashQuery).get('lang')
  if (isLocale(fromHash)) return fromHash

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    // private browsing, or site data blocked — fall through
  }

  const fromEnv = import.meta.env.VITE_DECK_LOCALE
  if (isLocale(fromEnv)) return fromEnv

  return DEFAULT_LOCALE
}

/** The locale the SLIDES render in. */
export const slideLocale = ref<Locale>(resolveInitialLocale())

watch(slideLocale, (next) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // non-fatal
  }
  document.documentElement.lang = next
})

export function toggleSlideLocale(): void {
  slideLocale.value = slideLocale.value === 'es' ? 'en' : 'es'
}

export const LOCALE_LABEL: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}

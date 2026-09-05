/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

/** Set at build time so `pnpm export` can produce a per-language PDF. */
interface ImportMetaEnv {
  readonly VITE_DECK_LOCALE?: string
}

/**
 * Slidev's virtual slide module. Typed narrowly to the two fields we read,
 * because the upstream RouteMeta type does not carry `slide` through.
 */
declare module '#slidev/slides' {
  import type { ShallowRef } from 'vue'
  export const slides: ShallowRef<
    Array<{
      no: number
      meta: { slide?: { frontmatter?: Record<string, unknown> } }
    }>
  >
}

/**
 * Translation helper for visualization components.
 *
 * `t()` returns a plain string; `md()` renders the same string through
 * markdown-it inline, so component copy can use **bold** the way the slide prose
 * does. Without this, every emphasised word inside a diagram would have to be a
 * separate <strong> in the template and a separate locale key.
 */
import { useI18n } from 'vue-i18n'
import MarkdownIt from 'markdown-it'

const mdIt = new MarkdownIt({ html: false, breaks: false, linkify: false })

export function useTx() {
  const { t } = useI18n()
  return {
    t,
    /** Translate, then render inline markdown. Use with v-html. */
    md: (key: string) => mdIt.renderInline(t(key)),
  }
}

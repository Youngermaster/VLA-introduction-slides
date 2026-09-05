import { defineAppSetup } from '@slidev/types'
import { createI18n } from 'vue-i18n'
import gsap from 'gsap'
import { messages } from '../lib/messages'
import { slideLocale, DEFAULT_LOCALE } from '../lib/locale'
import { watch } from 'vue'

export default defineAppSetup(({ app }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true, // makes {{ $t('key') }} work directly inside slide markdown
    locale: slideLocale.value,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
    // The deck is authored key-by-key; a missing key is a content bug we want to
    // see loudly in dev, not a silent blank on stage.
    missingWarn: import.meta.env.DEV,
    fallbackWarn: false,
  })

  app.use(i18n)

  watch(slideLocale, (next) => {
    i18n.global.locale.value = next
  })

  // One global default so that "similar elements share one ease and duration
  // intent" holds even in components that forget to specify.
  gsap.defaults({ duration: 0.42, ease: 'power3.out' })
})

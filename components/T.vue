<!--
  <T k="hook.body" /> — renders a translated string through markdown-it.

  {{ $t('key') }} works fine in slide markdown for plain strings, but it escapes
  HTML, so any prose needing **bold**, a link or `inline code` has to come
  through here instead. Inline mode by default (renders without a wrapping <p>)
  so it composes inside a heading or a list item; pass `block` for paragraphs.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownIt from 'markdown-it'

const props = withDefaults(
  defineProps<{
    /** Translation key, e.g. "landscape.caveat" */
    k: string
    /** Render as block markdown (paragraphs, lists) instead of inline */
    block?: boolean
    /** Interpolation values passed through to vue-i18n */
    values?: Record<string, unknown>
  }>(),
  { block: false, values: () => ({}) },
)

const md = new MarkdownIt({ html: false, breaks: true, linkify: true })

const { t } = useI18n()

const html = computed(() => {
  const raw = t(props.k, props.values as Record<string, string>)
  return props.block ? md.render(raw) : md.renderInline(raw)
})
</script>

<template>
  <div v-if="block" class="t-block" v-html="html" />
  <span v-else v-html="html" />
</template>

<style scoped>
.t-block :deep(p) { margin-bottom: var(--sp-3); }
.t-block :deep(p:last-child) { margin-bottom: 0; }
</style>

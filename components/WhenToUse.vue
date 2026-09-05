<!--
  ACT 4 — the honest decision guide.

  This is the slide that earns trust with an industry audience, because it says
  out loud that the thing the talk is about is often the wrong choice. For ONE
  fixed task with a fixed object, plain ACT or a Diffusion Policy usually beats a
  VLA: fewer parameters, faster inference, less to go wrong. VLAs earn their keep
  when you need language conditioning or generalization.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useTx } from '../lib/tx'
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const { t, md } = useTx()

const COLS = computed(() =>
  ([
    { at: 1, k: 'c1', tone: 'action' },
    { at: 2, k: 'c2', tone: 'lang' },
    { at: 3, k: 'c3', tone: 'muted' },
  ] as const).map((c) => ({
    ...c,
    title: t(`c.choose.${c.k}t`),
    when: t(`c.choose.${c.k}w`),
    pros: [1, 2, 3].map((n) => t(`c.choose.${c.k}p${n}`)).filter((v) => !v.startsWith('c.choose.')),
    cons: [1, 2, 3].map((n) => t(`c.choose.${c.k}c${n}`)).filter((v) => !v.startsWith('c.choose.')),
  })),
)
</script>

<template>
  <div class="wu">
    <section
      v-for="c in COLS" :key="c.k"
      class="wu__col"
      :class="[`wu__col--${c.tone}`, { 'is-on': props.stage >= c.at }]"
    >
      <h3 class="wu__h">{{ c.title }}</h3>
      <p class="wu__when">{{ c.when }}</p>

      <ul class="wu__list">
        <li v-for="p in c.pros" :key="p" class="wu__pro">{{ p }}</li>
      </ul>
      <ul class="wu__list">
        <li v-for="p in c.cons" :key="p" class="wu__con">{{ p }}</li>
      </ul>
    </section>

    <p class="wu__punch" :class="{ 'is-on': props.stage >= 4 }" v-html="md('c.choose.punch')" />
  </div>
</template>

<style scoped>
.wu { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-6); align-items: start; }

.wu__col {
  display: flex; flex-direction: column; gap: 7px;
  padding-left: 12px;
  border-left: 2px solid var(--hairline);
  opacity: 0; translate: 0 16px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.wu__col.is-on { opacity: 1; translate: 0 0; }
.wu__col--action { border-left-color: var(--accent-action); }
.wu__col--lang { border-left-color: var(--accent-lang); }
.wu__col--muted { border-left-color: var(--hairline-strong); }

.wu__h { margin: 0; font-size: var(--fs-h3); font-variation-settings: 'wght' 500; color: var(--text-primary); }
.wu__when { margin: 0 0 4px; font-size: var(--fs-small); color: var(--text-muted); }

.wu__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 3px; }
.wu__list li { margin: 0; padding-left: 15px; position: relative; font-size: var(--fs-small); max-width: none; }
.wu__list li::before { content: ''; position: absolute; left: 0; top: 0.56em; width: 7px; height: 2px; border-radius: 1px; }
.wu__pro { color: var(--text-secondary); }
.wu__pro::before { background: var(--signal-ok); }
.wu__con { color: var(--text-muted); }
.wu__con::before { background: var(--signal-warn); }

.wu__punch {
  grid-column: 1 / -1;
  margin: var(--sp-4) 0 0;
  max-width: 88ch;
  font-size: var(--fs-lead); line-height: 1.4; color: var(--text-secondary);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.wu__punch.is-on { opacity: 1; translate: 0 0; }
.wu__punch strong { color: var(--text-primary); }
</style>

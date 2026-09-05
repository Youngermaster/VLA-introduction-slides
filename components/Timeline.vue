<!-- ACT 2 — how we got here. Revealed step by step, left to right, matching the deck's current. -->
<script setup lang="ts">
import { computed } from 'vue'
import { useTx } from '../lib/tx'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const { t, md } = useTx()

const ERAS = computed(() =>
  ([1, 2, 3, 4] as const).map((n, i) => ({
    at: n,
    year: t(`c.timeline.e${n}y`),
    title: t(`c.timeline.e${n}t`),
    body: t(`c.timeline.e${n}b`),
    tone: (['muted', 'action', 'lang', 'lang'] as const)[i],
  })),
)
</script>

<template>
  <div class="tl">
    <div class="tl__axis"><span class="tl__axisline" :style="{ scale: `${Math.min(props.stage, 4) / 4} 1` }" /></div>
    <div class="tl__row">
      <section
        v-for="e in ERAS" :key="e.title"
        class="tl__era" :class="[`tl__era--${e.tone}`, { 'is-on': props.stage >= e.at }]"
      >
        <span class="tl__dot" />
        <span class="tl__year t-mono">{{ e.year }}</span>
        <h3 class="tl__title">{{ e.title }}</h3>
        <p class="tl__body">{{ e.body }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tl { display: flex; flex-direction: column; gap: var(--sp-4); }
.tl__axis { height: 2px; background: var(--hairline); position: relative; }
.tl__axisline {
  position: absolute; inset: 0; background: var(--accent-action);
  transform-origin: left center;
  transition: scale var(--d-settle) var(--e-out-quart);
}
.tl__row { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-5); }

.tl__era {
  display: flex; flex-direction: column; gap: 4px; position: relative;
  opacity: 0; translate: 0 16px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.tl__era.is-on { opacity: 1; translate: 0 0; }
.tl__dot {
  position: absolute; top: -25px; left: 0;
  width: 9px; height: 9px; border-radius: 50%;
  background: var(--accent-action); border: 2px solid var(--bg-base);
}
.tl__era--muted .tl__dot { background: var(--hairline-strong); }
.tl__era--lang .tl__dot { background: var(--accent-lang); }

.tl__year { font-size: var(--fs-micro); letter-spacing: var(--tr-micro); color: var(--text-muted); text-transform: uppercase; }
.tl__title { margin: 0; font-size: var(--fs-h3); font-variation-settings: 'wght' 500; color: var(--text-primary); }
.tl__body { margin: 0; font-size: var(--fs-small); color: var(--text-secondary); max-width: none; }
</style>

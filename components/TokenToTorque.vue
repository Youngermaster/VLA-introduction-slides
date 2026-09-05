<!--
  Title slide — the deck's signature.

  Tokens on the left resolve into a joint trajectory on the right: the talk's
  title, animated literally. It runs ONCE on slide entry and then stops. The
  no-idle-motion rule holds — a title that keeps breathing while you introduce
  yourself reads as "the deck is waiting", and it competes with your first words.

  Uses onSlideEnter rather than onMounted because Slidev keeps every slide
  mounted; onMounted would fire once for the whole session and never replay if
  you navigate back to the title.
-->
<script setup lang="ts">
import { ref } from 'vue'
import { onSlideEnter, onSlideLeave } from '@slidev/client'

const played = ref(false)
const TOKENS = ['Del', 'Token', 'al', 'Torque']
const N = 30

// A settling trajectory: the arm converging on a target, not oscillating forever.
const path = (() => {
  const pts: string[] = []
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const decay = Math.exp(-t * 3.1)
    const y = 42 - Math.sin(t * Math.PI * 3.4) * 30 * decay
    pts.push(`${(t * 260).toFixed(1)},${y.toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
})()

onSlideEnter(() => {
  played.value = false
  // Two frames: paint the from-state before enabling the transition, otherwise
  // the browser coalesces both into one style recalc and nothing animates.
  requestAnimationFrame(() => requestAnimationFrame(() => { played.value = true }))
})
onSlideLeave(() => { played.value = false })
</script>

<template>
  <div class="tt" :class="{ 'is-played': played }">
    <div class="tt__tokens">
      <span
        v-for="(t, i) in TOKENS" :key="t"
        class="tt__tok t-mono"
        :style="{ transitionDelay: `${i * 55}ms` }"
      >{{ t }}</span>
    </div>

    <span class="tt__join" />

    <svg viewBox="0 0 260 84" class="tt__svg">
      <path :d="path" class="tt__path" pathLength="1" />
    </svg>
  </div>
</template>

<style scoped>
.tt { display: flex; align-items: center; gap: var(--sp-4); }

.tt__tokens { display: flex; gap: 4px; }
.tt__tok {
  font-size: var(--fs-caption);
  padding: 3px 7px;
  border-radius: var(--radius-sm);
  background: var(--accent-lang-tint);
  color: var(--accent-lang);
  opacity: 0;
  translate: 0 12px;
  transition:
    opacity 0ms var(--e-linear),
    translate var(--d-entry) var(--e-out-quint);
}
.tt.is-played .tt__tok { opacity: 1; translate: 0 0; }

.tt__join {
  width: 34px; height: 1px; background: var(--hairline-strong);
  scale: 0 1; transform-origin: left center;
  transition: scale var(--d-entry) var(--e-out-quart) 240ms;
}
.tt.is-played .tt__join { scale: 1 1; }

.tt__svg { width: 260px; height: 84px; flex: none; }
.tt__path {
  fill: none;
  stroke: var(--accent-action);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  /* set from JS-free CSS: the dash length is normalised by pathLength below */
  transition: stroke-dashoffset var(--d-settle) var(--e-out-expo) 340ms;
}
.tt.is-played .tt__path { stroke-dashoffset: 0; }
</style>

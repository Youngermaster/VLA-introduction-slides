<!--
  ACT 8 — what a world model actually adds.

  Left: today's VLA. A closed reactive loop — observe, act, observe, act. It has
  no notion of what will happen next; it only ever answers "what do I do now".

  Right: a world model. Before acting it ROLLS OUT several imagined futures and
  picks one. The ghosted branches are the whole idea.

  The concrete anchor is VLA-JEPA, which now ships in LeRobot: a V-JEPA2 video
  world model supervises training, and is then dropped at inference. That detail
  matters — it says the field is currently using world models to LEARN, not yet
  to PLAN, which is exactly where the frontier sits.
-->
<script setup lang="ts">
import { useTx } from '../lib/tx'
import { computed } from 'vue'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const { t, md } = useTx()

const LOOP = computed(() => [
  { k: 'obs', label: t('c.world.obs') },
  { k: 'pol', label: t('c.world.pol') },
  { k: 'act', label: t('c.world.act') },
])

/** Imagined rollouts: same origin, diverging futures, one of them chosen. */
const branches = computed(() =>
  Array.from({ length: 4 }, (_, b) => {
    const spread = (b - 1.5) * 17
    const pts = Array.from({ length: 7 }, (_, i) => {
      const t = i / 6
      const x = 40 + t * 200
      const y = 70 + spread * t * t + Math.sin(t * 3 + b) * 3
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    return { b, d: `M ${pts.join(' L ')}`, chosen: b === 2 }
  }),
)
</script>

<template>
  <div class="rp">
    <!-- REACTIVE ---------------------------------------------------------->
    <section class="rp__side" :class="{ 'is-on': props.stage >= 1 }">
      <h3 class="rp__h">{{ t('c.world.h1') }}</h3>
      <svg viewBox="0 0 280 140" class="rp__svg">
        <g class="rp__loop">
          <circle cx="140" cy="70" r="46" class="rp__ring" />
          <g v-for="(n, i) in LOOP" :key="n.k">
            <circle
              :cx="140 + 46 * Math.cos((i / 3) * Math.PI * 2 - Math.PI / 2)"
              :cy="70 + 46 * Math.sin((i / 3) * Math.PI * 2 - Math.PI / 2)"
              r="6" class="rp__node"
            />
            <text
              :x="140 + 70 * Math.cos((i / 3) * Math.PI * 2 - Math.PI / 2)"
              :y="70 + 70 * Math.sin((i / 3) * Math.PI * 2 - Math.PI / 2) + 4"
              class="rp__label"
              text-anchor="middle"
            >{{ n.label }}</text>
          </g>
        </g>
      </svg>
      <p class="rp__p" v-html="md('c.world.p1')" />
    </section>

    <!-- PREDICTIVE -------------------------------------------------------->
    <section class="rp__side" :class="{ 'is-on': props.stage >= 2 }">
      <h3 class="rp__h">{{ t('c.world.h2') }}</h3>
      <svg viewBox="0 0 280 140" class="rp__svg">
        <circle cx="40" cy="70" r="6" class="rp__node rp__node--lang" />
        <path
          v-for="br in branches" :key="br.b"
          :d="br.d"
          class="rp__branch"
          :class="{ 'is-chosen': br.chosen && props.stage >= 3 }"
          :style="{ transitionDelay: props.stage >= 2 ? `${br.b * 70}ms` : '0ms' }"
        />
        <text x="40" y="52" class="rp__label" text-anchor="middle">{{ t('c.world.now') }}</text>
        <text x="248" y="34" class="rp__label" text-anchor="end">{{ t('c.world.futures') }}</text>
      </svg>
      <p class="rp__p" v-html="md('c.world.p2')" />
    </section>

    <!-- the concrete anchor ------------------------------------------------>
    <footer class="rp__anchor" :class="{ 'is-on': props.stage >= 4 }">
      <span class="rp__anchork t-mono">{{ t('c.world.anchorTag') }}</span>
      <span class="rp__anchorv" v-html="md('c.world.anchor')" />
    </footer>
  </div>
</template>

<style scoped>
.rp {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-5) var(--sp-7);
}
.rp__side {
  display: flex; flex-direction: column; gap: var(--sp-2);
  opacity: 0; translate: 0 14px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.rp__side.is-on { opacity: 1; translate: 0 0; }

.rp__h {
  margin: 0;
  font-size: var(--fs-h3);
  font-variation-settings: 'wght' 500;
  color: var(--text-primary);
}
.rp__svg { width: 100%; height: 140px; }

.rp__ring { fill: none; stroke: var(--accent-action-dim); stroke-width: 1.5; stroke-dasharray: 4 4; }
.rp__node { fill: var(--accent-action); }
.rp__node--lang { fill: var(--accent-lang); }
.rp__label { fill: var(--text-muted); font-size: 9px; font-family: 'Geist Mono Variable', monospace; }

.rp__branch {
  fill: none;
  stroke: var(--accent-lang);
  stroke-width: 1.5;
  stroke-dasharray: 3 4;
  opacity: 0.3;
  transition: opacity var(--d-step) var(--e-linear), stroke-width var(--d-step) var(--e-linear);
}
.rp__branch.is-chosen {
  opacity: 1;
  stroke-width: 2.5;
  stroke-dasharray: none;
}

.rp__p { margin: 0; font-size: var(--fs-body); color: var(--text-secondary); max-width: 42ch; }
.rp__p :deep(em), .rp__p :deep(strong) { color: var(--text-primary); font-style: normal; font-weight: 400; font-variation-settings: 'wght' 600; }

.rp__anchor {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 14px;
  border-left: 2px solid var(--accent-lang);
  opacity: 0;
  translate: 0 12px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.rp__anchor.is-on { opacity: 1; translate: 0 0; }
.rp__anchork {
  font-size: var(--fs-micro);
  letter-spacing: var(--tr-micro);
  text-transform: uppercase;
  color: var(--accent-lang);
}
.rp__anchorv { font-size: var(--fs-body); color: var(--text-secondary); max-width: 92ch; }
.rp__anchorv :deep(strong) { color: var(--text-primary); font-weight: 400; font-variation-settings: 'wght' 600; }
</style>

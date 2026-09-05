<!--
  ACT 3 close — the whole inference loop in one picture, running.

  Everything explained separately (encoder, backbone, expert, chunk) now runs as
  one cycle. The token travelling around the ring is the carrier: the eye follows
  an object, not an abstraction, and this is the slide where the pieces have to
  become a single mechanism rather than a list.

  It animates once per click and stops — the loop does not idle, because a
  looping diagram behind you while you talk reads as "the deck is waiting".
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useTx } from '../lib/tx'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const { t, md } = useTx()

const STEPS = [
  { k: 'obs', tone: 'action' },
  { k: 'enc', tone: 'lang' },
  { k: 'vlm', tone: 'lang' },
  { k: 'head', tone: 'action' },
  { k: 'dec', tone: 'action' },
  { k: 'exec', tone: 'action' },
]

const R = 96
const CX = 200
const CY = 118

const nodes = computed(() =>
  STEPS.map((s, i) => {
    const a = (i / STEPS.length) * Math.PI * 2 - Math.PI / 2
    return { ...s, i, label: t(`c.loop.${s.k}`), sub: t(`c.loop.${s.k}Sub`), x: CX + R * Math.cos(a), y: CY + R * Math.sin(a), a }
  }),
)

/** How far around the ring the carrier has travelled. */
const progress = computed(() => Math.min(props.stage, STEPS.length) / STEPS.length)
const carrier = computed(() => {
  const a = progress.value * Math.PI * 2 - Math.PI / 2
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) }
})
</script>

<template>
  <div class="cx">
    <svg viewBox="0 0 400 250" class="cx__svg">
      <circle :cx="CX" :cy="CY" :r="R" class="cx__ring" />
      <!-- the arc already travelled -->
      <circle
        :cx="CX" :cy="CY" :r="R"
        class="cx__arc"
        :style="{ strokeDasharray: `${progress * 2 * Math.PI * R} ${2 * Math.PI * R}` }"
      />

      <g v-for="n in nodes" :key="n.k" :class="{ 'is-on': props.stage >= n.i + 1 }" class="cx__node">
        <circle :cx="n.x" :cy="n.y" r="7" :class="`cx__dot cx__dot--${n.tone}`" />
        <text
          :x="n.x + Math.cos(n.a) * 30" :y="n.y + Math.sin(n.a) * 30 + 3"
          :text-anchor="Math.cos(n.a) > 0.25 ? 'start' : Math.cos(n.a) < -0.25 ? 'end' : 'middle'"
          class="cx__label"
        >{{ n.label }}</text>
        <text
          :x="n.x + Math.cos(n.a) * 30" :y="n.y + Math.sin(n.a) * 30 + 14"
          :text-anchor="Math.cos(n.a) > 0.25 ? 'start' : Math.cos(n.a) < -0.25 ? 'end' : 'middle'"
          class="cx__sub"
        >{{ n.sub }}</text>
      </g>

      <!-- the carrier: one object crossing every stage -->
      <circle
        v-if="props.stage >= 1"
        :cx="carrier.x" :cy="carrier.y" r="4.5"
        class="cx__carrier"
      />

      <text :x="CX" :y="CY - 6" text-anchor="middle" class="cx__hz">30 Hz</text>
      <text :x="CX" :y="CY + 12" text-anchor="middle" class="cx__hzsub">{{ t('c.loop.hzSub') }}</text>
    </svg>

    <p class="cx__note" :class="{ 'is-on': props.stage >= STEPS.length }" v-html="md('c.loop.note')" />
  </div>
</template>

<style scoped>
.cx { display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); }
.cx__svg { width: 100%; max-width: 560px; height: 250px; overflow: visible; }

.cx__ring { fill: none; stroke: var(--hairline); stroke-width: 1.5; stroke-dasharray: 3 5; }
.cx__arc {
  fill: none; stroke: var(--accent-action); stroke-width: 2;
  transform: rotate(-90deg); transform-origin: 200px 118px;
  transition: stroke-dasharray var(--d-settle) var(--e-out-quart);
}

.cx__node { opacity: 0; transition: opacity var(--d-step) var(--e-linear); }
.cx__node.is-on { opacity: 1; }
.cx__dot { fill: var(--bg-base); stroke-width: 2.5; }
.cx__dot--action { stroke: var(--accent-action); }
.cx__dot--lang { stroke: var(--accent-lang); }

.cx__label {
  fill: var(--text-primary); font-size: 12px;
  font-family: 'Instrument Sans Variable', sans-serif; font-variation-settings: 'wght' 500;
}
.cx__sub {
  fill: var(--text-muted); font-size: 9px;
  font-family: 'Geist Mono Variable', monospace;
}
.cx__hz {
  fill: var(--text-primary); font-size: 22px;
  font-family: 'Geist Mono Variable', monospace; font-variation-settings: 'wght' 500;
}
.cx__hzsub { fill: var(--text-muted); font-size: 10px; font-family: 'Instrument Sans Variable', sans-serif; }

.cx__carrier {
  fill: var(--accent-lang);
  transition: cx var(--d-settle) var(--e-out-quart), cy var(--d-settle) var(--e-out-quart);
}

.cx__note {
  margin: 0; max-width: 84ch; text-align: center;
  font-size: var(--fs-small); color: var(--text-secondary);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.cx__note.is-on { opacity: 1; translate: 0 0; }
.cx__note strong { color: var(--text-primary); }
</style>

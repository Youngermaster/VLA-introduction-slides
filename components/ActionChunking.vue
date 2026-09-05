<!--
  ACT 3 — action chunking, and why it exists.

  The temptation is to draw two static trajectories and label one "smooth". That
  teaches nothing. What actually matters is a TIMING story, so this animates the
  control loop itself:

    stage 1  single-step control. One action per inference. The arm stalls at
             every tick because the policy has not answered yet, and each answer
             ignores the last, so the path jitters.
    stage 2  chunked control. One inference returns ~50 future steps, executed
             back to back, so the motion is continuous between decisions.
    stage 3  the seam problem nobody mentions: while chunk N executes, chunk N+1
             is still computing, and it comes back disagreeing with where the arm
             actually is.
    stage 4  Real-Time Chunking: the overlap is inpainted so the chunks agree.

  The jitter is deterministic (index-derived, not Math.random) because a deck
  gets scrubbed backwards and a reshuffling path would be a bug you only notice
  in front of a room.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useTx } from '../lib/tx'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const { t, md } = useTx()

const W = 820
const H = 150
const STEPS = 64

/** The underlying task trajectory both controllers are trying to follow. */
function truth(t: number): number {
  return H / 2 - Math.sin(t * Math.PI * 1.6) * 44 - Math.sin(t * Math.PI * 4.4) * 9
}

function noise(i: number, seed: number): number {
  const x = Math.sin(i * 91.7 + seed * 13.3) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

const x = (i: number) => (i / (STEPS - 1)) * W

/* --- single-step: every point is an independent guess, so it rattles --- */
const singlePath = computed(() => {
  const pts = Array.from({ length: STEPS }, (_, i) => {
    const t = i / (STEPS - 1)
    return `${x(i).toFixed(1)},${(truth(t) + noise(i, 1) * 11).toFixed(1)}`
  })
  return `M ${pts.join(' L ')}`
})

/* Where the arm is actually allowed to move: it stalls while the policy thinks */
const stalls = computed(() =>
  Array.from({ length: 8 }, (_, k) => ({ k, from: x(k * 8 + 4), to: x(k * 8 + 7) })),
)

/* --- chunked: one inference emits a run of steps that agree with each other --- */
const CHUNK = 16
const chunks = computed(() =>
  Array.from({ length: Math.ceil(STEPS / CHUNK) }, (_, c) => {
    const start = c * CHUNK
    const end = Math.min(start + CHUNK, STEPS)
    // each chunk carries one small constant offset — the disagreement between
    // consecutive inferences, which is exactly what RTC has to reconcile
    const bias = noise(c, 7) * 9
    const pts = []
    for (let i = start; i < end; i++) {
      const t = i / (STEPS - 1)
      pts.push(`${x(i).toFixed(1)},${(truth(t) + bias).toFixed(1)}`)
    }
    const tStart = start / (STEPS - 1)
    const prevBias = c > 0 ? noise(c - 1, 7) * 9 : bias
    return {
      c,
      d: `M ${pts.join(' L ')}`,
      bias,
      xStart: x(start),
      xEnd: x(end - 1),
      // where the previous chunk left the arm, vs where this one wants it:
      // that vertical gap IS the seam problem
      yPrev: truth(tStart) + prevBias,
      yHere: truth(tStart) + bias,
    }
  }),
)

/* --- RTC: the same chunks, but the first steps of each are blended toward the
       tail of the previous one, so the joins disappear --- */
const rtcPath = computed(() => {
  const pts: string[] = []
  for (let i = 0; i < STEPS; i++) {
    const t = i / (STEPS - 1)
    const c = Math.floor(i / CHUNK)
    const within = i % CHUNK
    const bias = noise(c, 7) * 9
    const prevBias = c > 0 ? noise(c - 1, 7) * 9 : bias
    // soft transition mask over the first quarter of the chunk
    const blend = Math.min(1, within / (CHUNK * 0.35))
    const applied = prevBias + (bias - prevBias) * blend
    pts.push(`${x(i).toFixed(1)},${(truth(t) + applied * 0.35).toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
})

const showSingle = computed(() => props.stage >= 1 && props.stage < 2)
const showChunked = computed(() => props.stage >= 2)
const showSeams = computed(() => props.stage === 3)
const showRtc = computed(() => props.stage >= 4)

const caption = computed(() => {
  const n = props.stage
  if (n < 1 || n > 4) return { k: '', v: '' }
  return { k: t(`c.chunking.s${n}k`), v: t(`c.chunking.s${n}v`) }
})
</script>

<template>
  <div class="ac">
    <svg :viewBox="`0 0 ${W} ${H}`" class="ac__svg" preserveAspectRatio="none">
      <!-- the task itself, always faintly present -->
      <path :d="rtcPath" class="ac__truth" />

      <!-- stage 1: single-step -->
      <g :class="{ 'is-on': showSingle }" class="ac__grp">
        <rect
          v-for="s in stalls" :key="s.k"
          :x="s.from" :y="0" :width="s.to - s.from" :height="H"
          class="ac__stall"
        />
        <path :d="singlePath" class="ac__single" />
      </g>

      <!-- stage 2+: chunked -->
      <g :class="{ 'is-on': showChunked && !showRtc }" class="ac__grp">
        <path
          v-for="c in chunks" :key="c.c"
          :d="c.d"
          class="ac__chunk"
          :style="{ transitionDelay: showChunked ? `${c.c * 70}ms` : '0ms' }"
        />
        <!-- the disagreement at each join -->
        <g :class="{ 'is-on': showSeams }" class="ac__grp">
          <g v-for="c in chunks.slice(1)" :key="`s${c.c}`">
            <line :x1="c.xStart" :y1="c.yPrev" :x2="c.xStart" :y2="c.yHere" class="ac__seamline" />
            <circle :cx="c.xStart" :cy="c.yHere" r="4" class="ac__seam" />
          </g>
        </g>
      </g>

      <!-- stage 4: RTC -->
      <path :d="rtcPath" class="ac__rtc" :class="{ 'is-on': showRtc }" />
    </svg>

    <!-- chunk boundaries as a legend under the plot -->
    <div class="ac__ticks" :class="{ 'is-on': showChunked }">
      <span v-for="c in chunks" :key="c.c" class="ac__tick">
        <em class="t-mono">{{ t('c.chunking.chunk') }} {{ c.c + 1 }}</em>
      </span>
    </div>

    <p class="ac__cap" :class="{ 'is-on': props.stage >= 1 }">
      <span class="ac__capk t-mono">{{ caption.k }}</span>
      <span class="ac__capv">{{ caption.v }}</span>
    </p>
  </div>
</template>

<style scoped>
.ac { display: flex; flex-direction: column; gap: var(--sp-3); }
.ac__svg { width: 100%; height: 150px; overflow: visible; }

.ac__grp { opacity: 0; transition: opacity var(--d-step) var(--e-linear); }
.ac__grp.is-on { opacity: 1; }

.ac__truth { fill: none; stroke: var(--hairline); stroke-width: 1; stroke-dasharray: 3 5; }

.ac__stall { fill: var(--accent-action-tint); }
.ac__single {
  fill: none;
  stroke: var(--accent-action);
  stroke-width: 2;
  stroke-linejoin: round;
}

.ac__chunk {
  fill: none;
  stroke: var(--accent-action);
  stroke-width: 2.5;
  stroke-linecap: round;
  opacity: 0;
  transition: opacity var(--d-step) var(--e-linear);
}
.ac__grp.is-on .ac__chunk { opacity: 1; }

.ac__seam { fill: var(--bg-base); stroke: var(--signal-warn); stroke-width: 2; }
.ac__seamline { stroke: var(--signal-warn); stroke-width: 2; stroke-dasharray: 2 3; }

.ac__rtc {
  fill: none;
  stroke: var(--accent-lang);
  stroke-width: 2.5;
  stroke-linecap: round;
  opacity: 0;
  transition: opacity var(--d-entry) var(--e-linear);
}
.ac__rtc.is-on { opacity: 1; }

.ac__ticks {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  opacity: 0;
  transition: opacity var(--d-step) var(--e-linear);
}
.ac__ticks.is-on { opacity: 1; }
.ac__tick {
  border-top: 1px solid var(--hairline);
  padding-top: 4px;
}
.ac__tick em {
  font-style: normal;
  font-size: var(--fs-micro);
  letter-spacing: var(--tr-micro);
  color: var(--text-muted);
}

.ac__cap {
  margin: var(--sp-3) 0 0;
  max-width: 82ch;
  opacity: 0;
  translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.ac__cap.is-on { opacity: 1; translate: 0 0; }
.ac__capk {
  display: block;
  font-size: var(--fs-caption);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent-action);
  font-variation-settings: 'wght' 600;
  margin-bottom: 3px;
}
.ac__capv { font-size: var(--fs-lead); line-height: 1.4; color: var(--text-primary); }
</style>

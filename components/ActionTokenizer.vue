<!--
  ACT 3 — how a continuous robot motion becomes something a transformer can predict.

  This is the slide where most talks show a paper figure and move on. The three
  families really are different ideas, so each gets its own stage:

    1  the raw continuous signal — 7 joints, 50 Hz, real numbers
    2  naive binning (RT-2, OpenVLA): 256 bins per dimension, one token per
       dimension per timestep. Shown honestly: the token count explodes, and you
       can see the quantization staircase eating the smooth curve.
    3  FAST (Pertsch et al. 2025): treat the chunk as a SIGNAL. DCT decorrelates
       it, quantization zeroes the high frequencies, BPE merges repeated motifs.
       ~10x fewer tokens. The intuition is JPEG, and the visual says so.
    4  continuous flow-matching expert (pi-0, SmolVLA, GR00T): no tokens at all.
-->
<script setup lang="ts">
import { useTx } from '../lib/tx'
import { computed } from 'vue'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const { t } = useTx()

const W = 300
const H = 78
const N = 48

function signal(i: number): number {
  const t = i / (N - 1)
  return (
    H / 2 -
    Math.sin(t * Math.PI * 2.1) * 30 -
    Math.sin(t * Math.PI * 5.3) * 7
  )
}

const raw = computed(
  () => `M ${Array.from({ length: N }, (_, i) => `${((i / (N - 1)) * W).toFixed(1)},${signal(i).toFixed(1)}`).join(' L ')}`,
)

/** Quantized to visible levels — the staircase is the whole point. */
const LEVELS = 9
const binned = computed(() => {
  const step = H / LEVELS
  const pts: string[] = []
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * W
    const y = Math.round(signal(i) / step) * step
    if (i > 0) pts.push(`${x.toFixed(1)},${pts.length ? pts[pts.length - 1].split(',')[1] : y}`)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
})

/** A DCT-like spectrum: nearly all the energy sits in the low frequencies,
    which is exactly why robot trajectories compress so well. */
const spectrum = computed(() =>
  Array.from({ length: 24 }, (_, k) => ({
    k,
    mag: Math.max(0.02, Math.exp(-k / 2.6) * (1 - 0.12 * Math.sin(k * 2.3))),
    kept: k < 6,
  })),
)

const FAMILIES = computed(() => [
  { at: 2, key: 'binning', name: t('c.tokenizer.f1n'), who: 'RT-2 · OpenVLA', tokens: '350', note: t('c.tokenizer.f1note') },
  { at: 3, key: 'fast', name: t('c.tokenizer.f2n'), who: 'π₀-FAST', tokens: '30–60', note: t('c.tokenizer.f2note') },
  { at: 4, key: 'flow', name: t('c.tokenizer.f3n'), who: 'π₀ · SmolVLA · GR00T', tokens: '0', note: t('c.tokenizer.f3note') },
])

const active = computed(() => FAMILIES.value.find((f) => f.at === props.stage))
</script>

<template>
  <div class="at">
    <!-- the signal panel morphs with the stage -->
    <div class="at__panel">
      <span class="at__ptitle t-mono">
        {{ props.stage >= 3 ? t('c.tokenizer.specTitle') : t('c.tokenizer.trajTitle') }}
      </span>

      <svg v-if="props.stage < 3" :viewBox="`0 0 ${W} ${H}`" class="at__svg">
        <path :d="raw" class="at__raw" :class="{ 'is-dim': props.stage >= 2 }" />
        <path :d="binned" class="at__binned" :class="{ 'is-on': props.stage >= 2 }" />
        <g v-if="props.stage >= 2" class="at__levels">
          <line v-for="l in LEVELS" :key="l" :x1="0" :x2="W" :y1="(l * H) / LEVELS" :y2="(l * H) / LEVELS" />
        </g>
      </svg>

      <svg v-else :viewBox="`0 0 ${W} ${H}`" class="at__svg">
        <g class="at__spec">
          <rect
            v-for="s in spectrum" :key="s.k"
            :x="s.k * (W / 24) + 1.5"
            :y="H - s.mag * H"
            :width="W / 24 - 3"
            :height="s.mag * H"
            :class="{ 'is-kept': s.kept, 'is-drop': !s.kept }"
          />
        </g>
      </svg>

      <span class="at__pfoot t-caption">
        {{ props.stage >= 3 ? t('c.tokenizer.footSpec') : props.stage >= 2 ? t('c.tokenizer.footBin') : t('c.tokenizer.footRaw') }}
      </span>
    </div>

    <!-- the three families as a ladder -->
    <ol class="at__fams">
      <li
        v-for="f in FAMILIES" :key="f.key"
        class="at__fam"
        :class="{ 'is-on': props.stage >= f.at, 'is-active': props.stage === f.at }"
      >
        <div class="at__famhead">
          <span class="at__famname">{{ f.name }}</span>
          <span class="at__famwho t-mono">{{ f.who }}</span>
        </div>
        <div class="at__famtok">
          <span class="at__tokn t-mono">{{ f.tokens }}</span>
          <span class="at__toku">{{ t('c.tokenizer.tokensUnit') }}</span>
        </div>
      </li>
    </ol>

    <p class="at__note" :class="{ 'is-on': !!active }">
      {{ active?.note ?? '' }}
    </p>
  </div>
</template>

<style scoped>
.at {
  display: grid;
  grid-template-columns: 340px 1fr;
  grid-template-rows: auto auto;
  gap: var(--sp-4) var(--sp-6);
  align-items: start;
}

.at__panel { display: flex; flex-direction: column; gap: 6px; }
.at__ptitle {
  font-size: var(--fs-micro);
  letter-spacing: var(--tr-micro);
  color: var(--text-muted);
  text-transform: uppercase;
}
.at__svg { width: 100%; height: 78px; }
.at__pfoot { max-width: 44ch; }

.at__raw { fill: none; stroke: var(--accent-action); stroke-width: 2; transition: opacity var(--d-step) var(--e-linear); }
.at__raw.is-dim { opacity: 0.22; }
.at__binned {
  fill: none; stroke: var(--accent-lang); stroke-width: 2;
  opacity: 0; transition: opacity var(--d-step) var(--e-linear);
}
.at__binned.is-on { opacity: 1; }
.at__levels line { stroke: var(--hairline); stroke-width: 0.5; }

.at__spec rect { transition: opacity var(--d-step) var(--e-linear); }
.at__spec .is-kept { fill: var(--accent-lang); }
.at__spec .is-drop { fill: var(--hairline); }

/* the ladder */
.at__fams { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.at__fam {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--sp-4);
  padding-left: 14px;
  /* a 2px rule, not a card: on a projector a card border is invisible but a
     saturated rule against near-black still reads */
  border-left: 2px solid transparent;
  opacity: 0;
  translate: 0 12px;
  transition:
    opacity var(--d-step) var(--e-linear),
    translate var(--d-entry) var(--e-out-quart),
    border-color var(--d-step) var(--e-linear);
}
.at__fam.is-on { opacity: 0.42; translate: 0 0; }
.at__fam.is-active { opacity: 1; border-left-color: var(--accent-action); }

.at__famhead { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.at__famname { font-size: var(--fs-lead); color: var(--text-primary); font-variation-settings: 'wght' 500; }
.at__famwho { font-size: var(--fs-caption); color: var(--text-muted); }

.at__famtok { display: flex; align-items: baseline; gap: 6px; flex: none; }
.at__tokn {
  font-size: 23px;
  color: var(--accent-action);
  font-variation-settings: 'wght' 500;
  font-variant-numeric: tabular-nums;
}
.at__toku { font-size: var(--fs-caption); color: var(--text-muted); }

.at__note {
  grid-column: 1 / -1;
  margin: 0;
  max-width: 88ch;
  min-height: 2.4em;
  font-size: var(--fs-body);
  line-height: 1.4;
  color: var(--text-primary);
  opacity: 0;
  translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.at__note.is-on { opacity: 1; translate: 0 0; }
</style>

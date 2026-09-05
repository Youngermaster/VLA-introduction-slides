<!--
  ACT 1 — the central tension of the talk.

  The honest framing matters here. A naive "big pile vs small pile" would be a
  lie: you cannot put 15 trillion text tokens and a million robot episodes on the
  same linear axis, and the units aren't comparable anyway.

  So this animates RATE OF ACQUISITION instead of volume, which is the real
  asymmetry and is truthful. Text floods in — scraped, parallel, already written.
  Robot episodes arrive one at a time, in real time, because a human has to
  physically move an arm for thirty seconds to make each one.

  Stages
    1  the text side floods
    2  the robot side accrues, one slow episode at a time
    3  the real numbers land under each
    4  the punchline
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })

const COLS = 44
const ROWS = 13
const TEXT_CELLS = COLS * ROWS

// A deterministic pseudo-random so the layout is identical every render —
// a deck gets scrubbed backwards, and Math.random() would reshuffle on the way back.
function jitter(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const textCells = computed(() =>
  Array.from({ length: TEXT_CELLS }, (_, i) => ({
    i,
    // gaps shrink across the flood so it accelerates rather than crawling
    delay: Math.round(jitter(i) * 260),
    op: 0.35 + jitter(i * 7) * 0.65,
  })),
)

const EPISODES = 5
const episodes = computed(() =>
  Array.from({ length: EPISODES }, (_, i) => ({ i, delay: i * 260 })),
)
</script>

<template>
  <div class="da">
    <!-- LANGUAGE side ------------------------------------------------------->
    <section class="da__col">
      <header class="da__head">
        <span class="da__label c-lang t-mono">TEXTO</span>
        <span class="da__sub">se recolecta</span>
      </header>

      <div class="da__grid" :style="{ '--cols': COLS }">
        <i
          v-for="c in textCells"
          :key="c.i"
          class="da__cell da__cell--lang"
          :style="{
            opacity: props.stage >= 1 ? c.op : 0,
            transitionDelay: props.stage >= 1 ? `${c.delay}ms` : '0ms',
          }"
        />
      </div>

      <footer class="da__foot" :class="{ 'is-on': props.stage >= 3 }">
        <div class="da__stat t-mono c-lang">~15 000 000 000 000</div>
        <div class="da__unit">tokens de texto — el corpus de entrenamiento de Llama&nbsp;3</div>
      </footer>
    </section>

    <!-- ACTION side --------------------------------------------------------->
    <section class="da__col">
      <header class="da__head">
        <span class="da__label c-action t-mono">ACCIÓN</span>
        <span class="da__sub">hay que actuarla</span>
      </header>

      <div class="da__episodes">
        <div
          v-for="e in episodes"
          :key="e.i"
          class="da__ep"
          :style="{
            opacity: props.stage >= 2 ? 1 : 0,
            translate: props.stage >= 2 ? '0 0' : '0 14px',
            transitionDelay: props.stage >= 2 ? `${e.delay}ms` : '0ms',
          }"
        >
          <span class="da__epbar" />
          <span class="da__eptime t-mono">30&nbsp;s</span>
        </div>
        <div class="da__ellipsis" :style="{ opacity: props.stage >= 2 ? 1 : 0 }">
          <span /><span /><span />
        </div>
      </div>

      <footer class="da__foot" :class="{ 'is-on': props.stage >= 3 }">
        <div class="da__stat t-mono c-action">~1 000 000</div>
        <div class="da__unit">episodios en Open&nbsp;X-Embodiment — 34 laboratorios, años de trabajo</div>
      </footer>
    </section>

    <!-- The punchline ------------------------------------------------------->
    <p class="da__punch" :class="{ 'is-on': props.stage >= 4 }">
      El texto ya estaba escrito.
      <strong>Cada episodio de robot hay que vivirlo en tiempo real.</strong>
    </p>
  </div>
</template>

<style scoped>
.da {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-7);
  align-items: start;
}
.da__col { display: flex; flex-direction: column; gap: var(--sp-3); min-width: 0; }

.da__head { display: flex; align-items: baseline; gap: var(--sp-3); }
.da__label {
  font-size: var(--fs-caption);
  letter-spacing: 0.12em;
  font-variation-settings: 'wght' 600;
}
.da__sub { font-size: var(--fs-caption); color: var(--text-muted); }

/* --- text flood --- */
.da__grid {
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  gap: 2px;
  height: 104px;
  align-content: start;
}
.da__cell {
  display: block;
  height: 5px;
  border-radius: 1px;
  /* opacity only, and short: 700+ elements animating transform would drop frames */
  transition: opacity 220ms var(--e-linear);
}
.da__cell--lang { background: var(--accent-lang); }

/* --- robot episodes --- */
.da__episodes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 104px;
  justify-content: flex-start;
}
.da__ep {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  transition:
    opacity 0ms var(--e-linear),
    translate 260ms var(--e-out-quint);
}
.da__epbar {
  height: 5px;
  width: 168px;
  border-radius: 1px;
  background: var(--accent-action);
}
.da__eptime { font-size: var(--fs-micro); color: var(--text-muted); }

.da__ellipsis { display: flex; gap: 5px; padding-top: 5px; transition: opacity 200ms var(--e-linear) 1600ms; }
.da__ellipsis span { width: 3px; height: 3px; border-radius: 50%; background: var(--accent-action-dim); }

/* --- stats --- */
.da__foot {
  opacity: 0;
  translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
  margin-top: var(--sp-2);
}
.da__foot.is-on { opacity: 1; translate: 0 0; }
.da__stat {
  font-size: 25px;
  font-variation-settings: 'wght' 500;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}
.da__unit { font-size: var(--fs-caption); color: var(--text-muted); margin-top: 2px; max-width: 40ch; }

/* --- punchline --- */
.da__punch {
  grid-column: 1 / -1;
  margin: var(--sp-5) 0 0;
  max-width: 74ch;
  font-size: var(--fs-lead);
  line-height: var(--lh-lead);
  color: var(--text-secondary);
  opacity: 0;
  translate: 0 12px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.da__punch.is-on { opacity: 1; translate: 0 0; }
.da__punch strong { color: var(--text-primary); }
</style>

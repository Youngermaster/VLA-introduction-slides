<!--
  ACT 3 — the other half of tokenization, which almost nothing explains: how you
  get back OUT.

  The model emits token ids. A motor needs degrees. This shows the whole return
  path, because "the de-tokenizer converts tokens to actions" is a sentence that
  explains nothing on its own.

    token id → bin index → normalised [-1, 1] → real units → motor command

  The de-normalisation uses per-dimension statistics from the training set (1st
  and 99th percentile rather than min/max, so one bad demonstration can't stretch
  the whole scale).
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useTx } from '../lib/tx'
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const { t, md } = useTx()
const on = (n: number) => props.stage >= n

interface Dim {
  d: string
  id: number
  bin: number
  norm: number
  real: string
  /** The gripper channel is absolute and is not de-normalized (mask[6] = false). */
  abs?: boolean
}

const DIMS = computed<Dim[]>(() => [
  { d: 'Δx',     id: 31_918, bin: 174, norm: 0.36,  real: '+4.1 mm' },
  { d: 'Δy',     id: 31_744, bin: 0,   norm: -1.0,  real: '−11.2 mm' },
  { d: 'Δz',     id: 31_872, bin: 128, norm: 0.0,   real: '0.0 mm' },
  { d: 'Δroll',  id: 31_884, bin: 140, norm: 0.09,  real: '+1.4°' },
  { d: 'Δpitch', id: 31_856, bin: 112, norm: -0.13, real: '−2.0°' },
  { d: 'Δyaw',   id: 31_875, bin: 131, norm: 0.02,  real: '+0.3°' },
  // The gripper is absolute and is NOT de-normalized (mask[6] = false in every
  // norm_stats entry), so it is deliberately styled differently.
  { d: 'grip',   id: 31_999, bin: 254, norm: 1.0,   real: t('c.detok.grip'), abs: true },
])
</script>

<template>
  <div class="dt">
    <div class="dt__grid">
      <!-- header -->
      <span class="dt__h" />
      <span class="dt__h t-mono" :class="{ 'is-on': on(1) }">{{ t('c.detok.hId') }}</span>
      <span class="dt__h t-mono" :class="{ 'is-on': on(2) }">{{ t('c.detok.hBin') }}</span>
      <span class="dt__h t-mono" :class="{ 'is-on': on(3) }">{{ t('c.detok.hNorm') }}</span>
      <span class="dt__h t-mono" :class="{ 'is-on': on(4) }">{{ t('c.detok.hReal') }}</span>

      <template v-for="(r, i) in DIMS" :key="r.d">
        <span class="dt__d t-mono" :style="{ transitionDelay: `${i * 35}ms` }" :class="{ 'is-on': on(1) }">{{ r.d }}</span>

        <span class="dt__c dt__c--id t-mono" :style="{ transitionDelay: `${i * 35}ms` }" :class="{ 'is-on': on(1) }">{{ r.id }}</span>

        <span class="dt__c dt__c--bin" :style="{ transitionDelay: `${i * 35}ms` }" :class="{ 'is-on': on(2) }">
          <i class="dt__bar" :style="{ width: `${(r.bin / 255) * 100}%` }" />
          <b class="t-mono">{{ r.bin }}</b>
        </span>

        <span class="dt__c dt__c--norm t-mono" :style="{ transitionDelay: `${i * 35}ms` }" :class="{ 'is-on': on(3) }">
          {{ r.norm > 0 ? '+' : '' }}{{ r.norm.toFixed(2) }}
        </span>

        <span class="dt__c dt__c--real t-mono" :style="{ transitionDelay: `${i * 35}ms` }" :class="{ 'is-on': on(4), 'is-abs': r.abs }">{{ r.real }}</span>
      </template>
    </div>

    <div class="dt__steps">
      <span class="dt__step" :class="{ 'is-on': on(2) }">
        <b class="t-mono">id − 31 744</b> {{ t('c.detok.step1') }}</span>
      <span class="dt__step" :class="{ 'is-on': on(3) }">
        <b class="t-mono">centro del cajón</b> {{ t('c.detok.step2') }}</span>
      <span class="dt__step" :class="{ 'is-on': on(4) }">
        <b class="t-mono">½(â+1)(q₉₉ − q₀₁) + q₀₁</b> {{ t('c.detok.step3') }}</span>
    </div>

    <p class="dt__punch" :class="{ 'is-on': on(5) }" v-html="md('c.detok.punch')" />
  </div>
</template>

<style scoped>
.dt { display: flex; flex-direction: column; gap: var(--sp-3); }

.dt__grid {
  display: grid;
  grid-template-columns: 62px 92px 1fr 92px 106px;
  gap: 1px var(--sp-4);
  align-items: center;
}
.dt__h, .dt__d, .dt__c {
  opacity: 0;
  transition: opacity var(--d-step) var(--e-linear);
  font-size: var(--fs-small);
}
.dt__h { font-size: var(--fs-micro); color: var(--text-muted); text-transform: uppercase; letter-spacing: var(--tr-micro); }
.dt__h.is-on, .dt__d.is-on, .dt__c.is-on { opacity: 1; }

.dt__d { color: var(--accent-action); }
.dt__c--id { color: var(--text-muted); }
.dt__c--bin { display: flex; align-items: center; gap: 7px; }
.dt__bar { height: 7px; border-radius: 2px; background: var(--accent-lang); min-width: 2px; }
.dt__c--bin b { font-weight: 400; font-size: var(--fs-micro); color: var(--text-muted); flex: none; }
.dt__c--norm { color: var(--text-secondary); }
.dt__c--real { color: var(--text-primary); }
.dt__c--real.is-abs { color: var(--text-muted); }

.dt__steps { display: flex; flex-direction: column; gap: 3px; }
.dt__step {
  font-size: var(--fs-caption); color: var(--text-secondary);
  opacity: 0; transition: opacity var(--d-step) var(--e-linear);
}
.dt__step.is-on { opacity: 1; }
.dt__step b {
  font-weight: 400; color: var(--accent-lang);
  background: var(--accent-lang-tint); padding: 1px 5px; border-radius: var(--radius-sm);
  margin-right: 6px;
}

.dt__punch {
  margin: 0; max-width: 92ch;
  font-size: var(--fs-small); line-height: 1.5; color: var(--text-secondary);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.dt__punch.is-on { opacity: 1; translate: 0 0; }
.dt__punch strong { color: var(--text-primary); }
</style>

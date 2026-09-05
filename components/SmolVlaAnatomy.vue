<!--
  ACT 3 — SmolVLA, the model that is actually running in the demo.

  Two things make it worth its own slide, and both are visible in the paper
  figure once you draw it properly:

  1. THE CUT. It uses only the first half of the VLM's layers. The later layers
     of a language model specialise in producing language, which a robot does
     not need — so they are simply discarded. That scissors mark is the single
     most memorable idea in the architecture.

  2. THE ALTERNATION. The action expert interleaves cross-attention (reading the
     VLM's keys and values) with its own self-attention. That is what lets a
     100M-parameter head steer on top of a much larger frozen backbone.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useTx } from '../lib/tx'
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const on = (n: number) => props.stage >= n
const { t, md } = useTx()

/** The expert alternates: cross reads the VLM, self mixes its own tokens. */
const EXPERT = computed(() =>
  (['self', 'cross', 'self', 'cross'] as const).map((kind, i) => ({
    kind,
    from: kind === 'self' ? 'QKV' : 'KV',
    idx: `${t('c.smolvla.layer')} ${i}`,
  })),
)
</script>

<template>
  <div class="sv">
    <!-- VLM column -->
    <section class="sv__col sv__col--vlm">
      <header class="sv__h" :class="{ 'is-on': on(1) }">
        <span class="sv__ht">{{ t('c.smolvla.vlmTitle') }}</span>
        <span class="sv__hs t-mono">{{ t('c.smolvla.vlmSub') }}</span>
      </header>

      <div class="sv__layers">
        <div v-for="i in 3" :key="`k${i}`" class="sv__layer sv__layer--kept"
             :class="{ 'is-on': on(1) }" :style="{ transitionDelay: on(1) ? `${i * 60}ms` : '0ms' }">
          <span>Self-Attention</span>
        </div>

        <!-- the cut -->
        <div class="sv__cut" :class="{ 'is-on': on(2) }">
          <span class="sv__cutline" />
          <span class="sv__cuttext t-mono">{{ t('c.smolvla.cut') }}</span>
          <span class="sv__cutline" />
        </div>

        <div v-for="i in 2" :key="`d${i}`" class="sv__layer sv__layer--dropped"
             :class="{ 'is-on': on(2) }" :style="{ transitionDelay: on(2) ? `${i * 60}ms` : '0ms' }">
          <span>Self-Attention</span>
          <em class="t-mono">{{ t('c.smolvla.dropped') }}</em>
        </div>
      </div>

      <div class="sv__inputs" :class="{ 'is-on': on(1) }">
        <span class="sv__chip sv__chip--action t-mono">{{ t('c.smolvla.chipCams') }}</span>
        <span class="sv__chip sv__chip--lang t-mono">{{ t('c.smolvla.chipTask') }}</span>
        <span class="sv__chip sv__chip--action t-mono">{{ t('c.smolvla.chipState') }}</span>
      </div>
    </section>

    <!-- the bridge -->
    <div class="sv__bridge">
      <div v-for="(l, i) in EXPERT" :key="i" class="sv__wire"
           :class="{ 'is-on': on(3) }" :style="{ transitionDelay: on(3) ? `${i * 90}ms` : '0ms' }">
        <span class="sv__wirelabel t-mono">{{ l.from }}</span>
        <span class="sv__wireline" />
      </div>
    </div>

    <!-- Action expert column -->
    <section class="sv__col sv__col--expert">
      <header class="sv__h" :class="{ 'is-on': on(3) }">
        <span class="sv__ht">{{ t('c.smolvla.expertTitle') }}</span>
        <span class="sv__hs t-mono">{{ t('c.smolvla.expertSub') }}</span>
      </header>

      <div class="sv__layers">
        <div v-for="(l, i) in EXPERT" :key="i"
             class="sv__layer" :class="[`sv__layer--${l.kind}`, { 'is-on': on(3) }]"
             :style="{ transitionDelay: on(3) ? `${i * 90}ms` : '0ms' }">
          <span>{{ l.kind === 'cross' ? 'Cross-Attention' : 'Self-Attention' }}</span>
          <em class="t-mono">{{ l.idx }}</em>
        </div>
      </div>

      <div class="sv__noisy" :class="{ 'is-on': on(4) }">
        <span class="sv__chip sv__chip--muted t-mono">{{ t('c.smolvla.noisy') }}</span>
        <span class="sv__arrow" />
        <span class="sv__chip sv__chip--action t-mono">{{ t('c.smolvla.out') }}</span>
      </div>
    </section>

    <p class="sv__punch" :class="{ 'is-on': on(5) }" v-html="md('c.smolvla.punch')" />
  </div>
</template>

<style scoped>
.sv { display: grid; grid-template-columns: 1fr 88px 1fr; gap: var(--sp-3); align-items: start; }

.sv__col { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.sv__h {
  display: flex; flex-direction: column; gap: 1px;
  opacity: 0; translate: 0 12px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.sv__h.is-on { opacity: 1; translate: 0 0; }
.sv__ht { font-size: var(--fs-h3); color: var(--text-primary); font-variation-settings: 'wght' 500; }
.sv__hs { font-size: var(--fs-micro); color: var(--text-muted); }

.sv__layers { display: flex; flex-direction: column; gap: 4px; }
.sv__layer {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
  padding: 5px 11px; border-radius: var(--radius-sm);
  font-size: var(--fs-small);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.sv__layer.is-on { opacity: 1; translate: 0 0; }
.sv__layer--kept { background: var(--accent-lang-tint); color: var(--accent-lang); }
.sv__layer--dropped {
  background: transparent; color: var(--text-muted);
  border: 1px dashed var(--hairline-strong);
  text-decoration: line-through;
  text-decoration-color: var(--signal-warn);
}
.sv__layer--dropped.is-on { opacity: 0.55; }
.sv__layer--dropped em { font-style: normal; font-size: var(--fs-micro); text-decoration: none; }
.sv__layer em { font-style: normal; font-size: 9px; color: var(--text-muted); flex: none; }
.sv__layer--cross { background: var(--accent-action-tint); color: var(--accent-action); }
.sv__layer--self { background: var(--surface-2); color: var(--text-secondary); }

.sv__cut {
  display: flex; align-items: center; gap: 7px; margin: 3px 0;
  opacity: 0; transition: opacity var(--d-entry) var(--e-linear);
}
.sv__cut.is-on { opacity: 1; }
.sv__cutline { flex: 1; height: 1px; background: var(--signal-warn); }
.sv__cuttext {
  font-size: var(--fs-micro); color: var(--signal-warn);
  text-transform: uppercase; letter-spacing: var(--tr-micro); white-space: nowrap;
}

.sv__inputs, .sv__noisy {
  display: flex; gap: 4px; flex-wrap: wrap; align-items: center;
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.sv__inputs.is-on, .sv__noisy.is-on { opacity: 1; translate: 0 0; }
.sv__chip { font-size: var(--fs-micro); padding: 3px 7px; border-radius: var(--radius-sm); }
.sv__chip--action { background: var(--accent-action-tint); color: var(--accent-action); }
.sv__chip--lang { background: var(--accent-lang-tint); color: var(--accent-lang); }
.sv__chip--muted { background: var(--surface-2); color: var(--text-muted); }
.sv__arrow { width: 16px; height: 2px; background: var(--hairline-strong); }

.sv__bridge { display: flex; flex-direction: column; gap: 4px; padding-top: 52px; }
.sv__wire {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  height: 33px; justify-content: center;
  opacity: 0; transition: opacity var(--d-step) var(--e-linear);
}
.sv__wire.is-on { opacity: 1; }
.sv__wirelabel { font-size: 9px; color: var(--text-muted); }
.sv__wireline { width: 100%; height: 2px; background: var(--accent-action-dim); position: relative; }
.sv__wireline::after {
  content: ''; position: absolute; right: 0; top: -3px;
  border-left: 6px solid var(--accent-action-dim);
  border-top: 4px solid transparent; border-bottom: 4px solid transparent;
}

.sv__punch {
  grid-column: 1 / -1; margin: var(--sp-2) 0 0; max-width: 100ch;
  font-size: var(--fs-small); line-height: 1.5; color: var(--text-secondary);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.sv__punch.is-on { opacity: 1; translate: 0 0; }
.sv__punch strong { color: var(--text-primary); }
</style>

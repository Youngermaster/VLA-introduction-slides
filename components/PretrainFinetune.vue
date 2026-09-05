<!--
  ACT 3 — what pretraining actually buys you.

  The point to land: you are not training a VLA. You are fine-tuning one that has
  already seen hundreds of robots, and that is the ONLY reason 50 episodes on a
  $150 arm can work at all.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useTx } from '../lib/tx'
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const on = (n: number) => props.stage >= n
const { t, md } = useTx()
</script>

<template>
  <div class="pf">
    <section class="pf__phase" :class="{ 'is-on': on(1) }">
      <span class="pf__tag t-mono">{{ t('c.pretrain.tag1') }}</span>
      <h3 class="pf__h">{{ t('c.pretrain.h1') }}</h3>
      <div class="pf__bars">
        <span v-for="i in 22" :key="i" class="pf__bar" :style="{ transitionDelay: on(1) ? `${i * 14}ms` : '0ms' }" />
      </div>
      <p class="pf__p" v-html="md('c.pretrain.p1')" />
    </section>

    <div class="pf__arrow" :class="{ 'is-on': on(2) }">
      <span class="pf__arrowline" />
      <span class="pf__arrowtext t-mono">{{ t('c.pretrain.arrow') }}</span>
    </div>

    <section class="pf__phase" :class="{ 'is-on': on(2) }">
      <span class="pf__tag t-mono">{{ t('c.pretrain.tag2') }}</span>
      <h3 class="pf__h">{{ t('c.pretrain.h2') }}</h3>
      <div class="pf__bars pf__bars--few">
        <span v-for="i in 3" :key="i" class="pf__bar pf__bar--action" :style="{ transitionDelay: on(2) ? `${i * 90}ms` : '0ms' }" />
      </div>
      <p class="pf__p" v-html="md('c.pretrain.p2')" />
    </section>

    <footer class="pf__punch" :class="{ 'is-on': on(3) }" v-html="md('c.pretrain.punch')" />
  </div>
</template>

<style scoped>
.pf { display: grid; grid-template-columns: 1fr 132px 1fr; gap: var(--sp-5); align-items: start; }

.pf__phase {
  display: flex; flex-direction: column; gap: 6px;
  opacity: 0; translate: 0 16px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.pf__phase.is-on { opacity: 1; translate: 0 0; }

.pf__tag {
  font-size: var(--fs-micro); letter-spacing: var(--tr-micro);
  text-transform: uppercase; color: var(--text-muted);
}
.pf__h { margin: 0; font-size: var(--fs-h3); font-variation-settings: 'wght' 500; color: var(--text-primary); }

.pf__bars { display: flex; flex-wrap: wrap; gap: 3px; margin: 4px 0; min-height: 30px; align-content: flex-start; }
.pf__bar {
  width: 13px; height: 13px; border-radius: 2px; background: var(--accent-lang);
  opacity: 0; transition: opacity 180ms var(--e-linear);
}
.pf__bars--few .pf__bar { width: 34px; background: var(--accent-action); }
.pf__phase.is-on .pf__bar { opacity: 0.85; }

.pf__p { margin: 0; font-size: var(--fs-body); color: var(--text-secondary); max-width: 40ch; }
.pf__p strong { color: var(--text-primary); }

.pf__arrow {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding-top: 46px;
  opacity: 0; transition: opacity var(--d-entry) var(--e-linear);
}
.pf__arrow.is-on { opacity: 1; }
.pf__arrowline { width: 100%; height: 1px; background: var(--hairline-strong); }
.pf__arrowtext { font-size: var(--fs-micro); color: var(--text-muted); text-align: center; }

.pf__punch {
  grid-column: 1 / -1;
  margin-top: var(--sp-4);
  max-width: 90ch;
  font-size: var(--fs-lead); line-height: 1.4; color: var(--text-secondary);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.pf__punch.is-on { opacity: 1; translate: 0 0; }
.pf__punch strong { color: var(--text-primary); }
</style>

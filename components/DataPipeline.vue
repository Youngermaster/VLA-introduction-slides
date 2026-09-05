<!--
  ACT 3 — where the training data actually comes from.

  The audience needs this before tokenization makes sense: a VLA is trained on
  recordings of a human moving the robot. Teleoperation is the whole pipeline's
  source of truth, and it is why the data is expensive.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useTx } from '../lib/tx'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const { t, md } = useTx()

const STEPS = computed(() => [
  { at: 1, k: 'pipeline1', title: t('c.pipeline.s1t'), body: t('c.pipeline.s1b'), mono: 'lerobot-record' },
  { at: 2, k: 'pipeline2', title: t('c.pipeline.s2t'), body: t('c.pipeline.s2b'), mono: 'observation.images.top · observation.state · action' },
  { at: 3, k: 'pipeline3', title: t('c.pipeline.s3t'), body: t('c.pipeline.s3b'), mono: 'LeRobotDataset v3' },
  { at: 4, k: 'pipeline4', title: t('c.pipeline.s4t'), body: t('c.pipeline.s4b'), mono: 'lerobot-train' },
])
</script>

<template>
  <div class="dp">
    <div
      v-for="(s, i) in STEPS" :key="s.k"
      class="dp__step"
      :class="{ 'is-on': props.stage >= s.at }"
    >
      <div class="dp__num t-mono">{{ i + 1 }}</div>
      <div class="dp__body">
        <span class="dp__title">{{ s.title }}</span>
        <p class="dp__text">{{ s.body }}</p>
        <span class="dp__mono t-mono">{{ s.mono }}</span>
      </div>
      <div v-if="i < STEPS.length - 1" class="dp__arrow" :class="{ 'is-on': props.stage >= s.at + 1 }" />
    </div>
  </div>
</template>

<style scoped>
.dp { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-5); align-items: start; }
.dp__step {
  position: relative;
  display: flex; flex-direction: column; gap: 7px;
  padding-left: 12px;
  border-left: 2px solid var(--accent-action);
  opacity: 0;
  translate: 0 16px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.dp__step.is-on { opacity: 1; translate: 0 0; }

.dp__num { font-size: var(--fs-caption); color: var(--accent-action); font-variation-settings: 'wght' 600; }
.dp__body { display: flex; flex-direction: column; gap: 4px; }
.dp__title { font-size: var(--fs-lead); color: var(--text-primary); font-variation-settings: 'wght' 500; }
.dp__text { margin: 0; font-size: var(--fs-small); color: var(--text-secondary); }
.dp__mono { font-size: var(--fs-micro); color: var(--text-muted); word-break: break-word; }

.dp__arrow {
  position: absolute; right: calc(var(--sp-5) / -2 - 4px); top: 4px;
  width: 8px; height: 8px;
  border-top: 1.5px solid var(--accent-action-dim);
  border-right: 1.5px solid var(--accent-action-dim);
  rotate: 45deg;
  opacity: 0;
  transition: opacity var(--d-step) var(--e-linear);
}
.dp__arrow.is-on { opacity: 1; }
</style>

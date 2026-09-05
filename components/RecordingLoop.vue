<!--
  ACT 3 — what is physically happening when you record a dataset.

  The teaching point most write-ups skip: with leader/follower teleoperation the
  two things being recorded are NOT the same signal.

    observation.state  = where the FOLLOWER actually is  (the robot's body)
    action             = where the LEADER was commanded  (the human's intent)

  The policy is trained to predict the second from the first. That is the whole
  of behaviour cloning, and seeing the two arms separated on screen makes it
  land in a way a bullet point does not.
-->
<script setup lang="ts">
import { useTx } from '../lib/tx'
import { computed } from 'vue'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const on = (n: number) => props.stage >= n
const { t, md } = useTx()

/** Six joints; the leader leads and the follower lags slightly behind it. */
const joints = computed(() =>
  Array.from({ length: 6 }, (_, i) => {
    const lead = 0.5 + Math.sin(i * 1.1) * 0.42
    return {
      i,
      lead,
      follow: lead - Math.sin(i * 1.1) * 0.06, // the lag is the point
    }
  }),
)

const COLUMNS = computed(() => [
  { k: 'observation.images.top',   v: '480×640×3', tone: 'action' },
  { k: 'observation.images.wrist', v: '480×640×3', tone: 'action' },
  { k: 'observation.images.base',  v: '480×640×3', tone: 'action' },
  { k: 'observation.state',        v: 'float32[6]', tone: 'action', note: t('c.recording.noteState') },
  { k: 'action',                   v: 'float32[6]', tone: 'warn',   note: t('c.recording.noteAction') },
  { k: 'task',                     v: 'string',     tone: 'lang',   note: t('c.recording.noteTask') },
  { k: 'timestamp · frame_index · episode_index', v: '', tone: 'muted' },
])
</script>

<template>
  <div class="rl">
    <!-- the two arms -->
    <div class="rl__arms">
      <div class="rl__arm rl__arm--lead" :class="{ 'is-on': on(1) }">
        <span class="rl__armlabel t-mono">{{ t('c.recording.leader') }}</span>
        <div class="rl__bars">
          <span v-for="j in joints" :key="j.i" class="rl__bar rl__bar--warn"
                :style="{ height: `${18 + j.lead * 46}px` }" />
        </div>
      </div>

      <div class="rl__link" :class="{ 'is-on': on(1) }">
        <span class="rl__linkline" />
        <span class="rl__linktext t-mono">{{ t('c.recording.copies') }}</span>
      </div>

      <div class="rl__arm rl__arm--follow" :class="{ 'is-on': on(1) }">
        <span class="rl__armlabel t-mono">{{ t('c.recording.follower') }}</span>
        <div class="rl__bars">
          <span v-for="j in joints" :key="j.i" class="rl__bar"
                :style="{ height: `${18 + j.follow * 46}px` }" />
        </div>
      </div>
    </div>

    <!-- what lands on disk -->
    <div class="rl__row" :class="{ 'is-on': on(2) }">
      <span class="rl__rowtag t-mono">{{ t('c.recording.rowTag') }}</span>
      <div class="rl__cols">
        <div v-for="(c, i) in COLUMNS" :key="c.k"
             class="rl__col" :class="[`rl__col--${c.tone}`, { 'is-hl': on(3) && (c.k === 'action' || c.k === 'observation.state') }]"
             :style="{ transitionDelay: on(2) ? `${i * 45}ms` : '0ms' }">
          <span class="rl__ck t-mono">{{ c.k }}</span>
          <span v-if="c.v" class="rl__cv t-mono">{{ c.v }}</span>
          <span v-if="c.note" class="rl__cn">{{ c.note }}</span>
        </div>
      </div>
    </div>

    <p class="rl__punch" :class="{ 'is-on': on(3) }" v-html="md('c.recording.punch')" />
  </div>
</template>

<style scoped>
.rl { display: flex; flex-direction: column; gap: var(--sp-5); }

.rl__arms { display: grid; grid-template-columns: 1fr 150px 1fr; gap: var(--sp-4); align-items: end; }
.rl__arm {
  display: flex; flex-direction: column; gap: 7px;
  opacity: 0; translate: 0 14px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.rl__arm.is-on { opacity: 1; translate: 0 0; }
.rl__armlabel { font-size: var(--fs-micro); color: var(--text-muted); }
.rl__bars { display: flex; align-items: flex-end; gap: 5px; height: 66px; }
.rl__bar { width: 22px; border-radius: 2px 2px 0 0; background: var(--accent-action); }
.rl__bar--warn { background: var(--signal-warn); }

.rl__link {
  display: flex; flex-direction: column; align-items: center; gap: 5px; padding-bottom: 22px;
  opacity: 0; transition: opacity var(--d-entry) var(--e-linear);
}
.rl__link.is-on { opacity: 1; }
.rl__linkline { width: 100%; height: 1px; background: var(--hairline-strong); }
.rl__linktext { font-size: var(--fs-micro); color: var(--text-muted); }

.rl__row {
  display: flex; flex-direction: column; gap: 7px;
  opacity: 0; translate: 0 14px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.rl__row.is-on { opacity: 1; translate: 0 0; }
.rl__rowtag { font-size: var(--fs-micro); letter-spacing: var(--tr-micro); text-transform: uppercase; color: var(--text-muted); }

.rl__cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.rl__col {
  display: flex; flex-direction: column; gap: 1px;
  padding: 6px 9px; border-radius: var(--radius-sm);
  border-left: 2px solid var(--hairline);
  opacity: 0; transition: opacity var(--d-step) var(--e-linear), border-left-color var(--d-step) var(--e-linear);
}
.rl__row.is-on .rl__col { opacity: 1; }
.rl__col--action { border-left-color: var(--accent-action-dim); }
.rl__col--lang { border-left-color: var(--accent-lang-dim); }
.rl__col--warn { border-left-color: var(--signal-warn); }
.rl__col--muted { border-left-color: var(--hairline); grid-column: span 2; }
.rl__col.is-hl { background: var(--surface-1); border-left-width: 3px; }

.rl__ck { font-size: var(--fs-micro); color: var(--text-primary); word-break: break-word; }
.rl__cv { font-size: var(--fs-micro); color: var(--text-muted); }
.rl__cn { font-size: var(--fs-micro); color: var(--text-secondary); margin-top: 2px; }

.rl__punch {
  margin: 0; max-width: 94ch;
  font-size: var(--fs-body); line-height: 1.5; color: var(--text-secondary);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.rl__punch.is-on { opacity: 1; translate: 0 0; }
.rl__punch strong { color: var(--text-primary); }
.c-warn { color: var(--signal-warn); }
</style>

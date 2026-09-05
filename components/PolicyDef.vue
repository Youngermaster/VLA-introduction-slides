<!--
  ACT 3 opener — "policy" is jargon the room has heard and probably not had
  defined. Define it once, precisely, and the rest of the act is easier.

  The build: the word, then the formal object, then the honest note that this is
  behaviour cloning and not reinforcement learning — no reward anywhere.
-->
<script setup lang="ts">
import { useTx } from '../lib/tx'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const on = (n: number) => props.stage >= n
const { t, md } = useTx()
</script>

<template>
  <div class="pd">
    <!-- the formula, built up term by term -->
    <div class="pd__formula">
      <span class="pd__pi" :class="{ 'is-on': on(1) }">π</span>
      <span class="pd__paren" :class="{ 'is-on': on(1) }">(</span>
      <span class="pd__term pd__term--action" :class="{ 'is-on': on(1) }">a<sub>t…t+H</sub></span>
      <span class="pd__bar" :class="{ 'is-on': on(2) }">|</span>
      <span class="pd__term pd__term--obs" :class="{ 'is-on': on(2) }">o<sub>t</sub></span>
      <span class="pd__comma" :class="{ 'is-on': on(3) }">,</span>
      <span class="pd__term pd__term--lang" :class="{ 'is-on': on(3) }">ℓ</span>
      <span class="pd__paren" :class="{ 'is-on': on(1) }">)</span>
    </div>

    <div class="pd__legend">
      <span class="pd__leg pd__leg--action" :class="{ 'is-on': on(1) }">
        <b class="t-mono">a</b> {{ t('c.policy.legendA') }}
      </span>
      <span class="pd__leg pd__leg--obs" :class="{ 'is-on': on(2) }">
        <b class="t-mono">o</b> {{ t('c.policy.legendO') }}
      </span>
      <span class="pd__leg pd__leg--lang" :class="{ 'is-on': on(3) }">
        <b class="t-mono">ℓ</b> {{ t('c.policy.legendL') }}
      </span>
    </div>

    <p class="pd__read" :class="{ 'is-on': on(3) }">
      <span v-html="md('c.policy.read')" />&#32;<span class="c-lang">{{ t('c.policy.readHi') }}</span>
    </p>

    <!-- what it is NOT -->
    <div class="pd__note" :class="{ 'is-on': on(4) }">
      <span class="pd__notetag t-mono">{{ t('c.policy.noteTag') }}</span>
      <span class="pd__notebody" v-html="md('c.policy.noteBody')" />
    </div>
  </div>
</template>

<style scoped>
.pd { display: flex; flex-direction: column; gap: var(--sp-4); }

.pd__formula {
  display: flex;
  align-items: baseline;
  gap: 7px;
  flex-wrap: wrap;
  font-family: 'Geist Mono Variable', monospace;
}
.pd__pi, .pd__paren, .pd__bar, .pd__comma {
  font-size: 46px;
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity var(--d-step) var(--e-linear);
  line-height: 1.1;
}
.pd__pi { color: var(--text-primary); }
.pd__pi.is-on, .pd__paren.is-on, .pd__bar.is-on, .pd__comma.is-on { opacity: 1; }

.pd__term {
  font-size: 46px; line-height: 1.15;
  opacity: 0; translate: 0 14px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.pd__term.is-on { opacity: 1; translate: 0 0; }
.pd__term sub { font-size: 0.42em; }
.pd__legend { display: flex; flex-direction: column; gap: 2px; }
.pd__leg {
  font-size: var(--fs-small); color: var(--text-secondary);
  opacity: 0; transition: opacity var(--d-step) var(--e-linear);
}
.pd__leg.is-on { opacity: 1; }
.pd__leg b { font-weight: 400; margin-right: 8px; display: inline-block; min-width: 1.4ch; }
.pd__leg--action b { color: var(--accent-action); }
.pd__leg--obs b { color: var(--text-primary); }
.pd__leg--lang b { color: var(--accent-lang); }
.pd__term--action { color: var(--accent-action); }
.pd__term--obs { color: var(--text-primary); }
.pd__term--lang { color: var(--accent-lang); }

.pd__read {
  margin: 0; max-width: 84ch;
  font-size: var(--fs-lead); line-height: 1.45; color: var(--text-secondary);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.pd__read.is-on { opacity: 1; translate: 0 0; }
.pd__read strong { color: var(--text-primary); }

.pd__note {
  display: flex; flex-direction: column; gap: 3px;
  padding-left: 14px; border-left: 2px solid var(--accent-lang);
  opacity: 0; translate: 0 12px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.pd__note.is-on { opacity: 1; translate: 0 0; }
.pd__notetag {
  font-size: var(--fs-micro); letter-spacing: var(--tr-micro);
  text-transform: uppercase; color: var(--accent-lang);
}
.pd__notebody { font-size: var(--fs-body); color: var(--text-secondary); max-width: 88ch; }
.pd__notebody strong { color: var(--text-primary); }
</style>

<!--
  ACT 3 — how the instruction actually gets into the model.

  The user's question, almost verbatim: "how do the language instructions come
  in, how do we tokenize them?" The answer is reassuring and worth showing
  explicitly, because people assume there must be something special: there
  isn't. It is the ordinary text tokenizer, the ordinary embedding table, and
  the resulting vectors are simply concatenated with the image tokens into one
  sequence.

  The one genuinely VLA-specific detail is the prompt template — the instruction
  is wrapped in a fixed question so the model is doing next-token prediction on
  a familiar-looking problem.
-->
<script setup lang="ts">
import { useTx } from '../lib/tx'
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const on = (n: number) => props.stage >= n
const { t } = useTx()

/** Illustrative sub-word split with plausible ids — the point is the shape. */
const TOKENS = [
  { t: 'agarra', id: 8_732 },
  { t: ' el', id: 604 },
  { t: ' fra', id: 15_209 },
  { t: 'sco', id: 3_411 },
  { t: ' de', id: 372 },
  { t: ' magn', id: 21_884 },
  { t: 'esio', id: 6_017 },
]
</script>

<template>
  <div class="li">
    <!-- 1 · the raw sentence -->
    <div class="li__step" :class="{ 'is-on': on(1) }">
      <span class="li__tag t-mono">{{ t('c.langin.s1') }}</span>
      <div class="li__sentence">{{ t('c.langin.sentence') }}</div>
    </div>

    <!-- 2 · the prompt template -->
    <div class="li__step" :class="{ 'is-on': on(2) }">
      <span class="li__tag t-mono">{{ t('c.langin.s2') }}</span>
      <div class="li__prompt t-mono">
        <span class="li__pfix">In: What action should the robot take to</span>
        <span class="li__pvar">&#123;{{ t('c.langin.promptVar') }}&#125;</span><span class="li__pfix">?</span>
        <span class="li__pfix">Out:</span>
      </div>
      <span class="li__note">{{ t('c.langin.note2') }}</span>
    </div>

    <!-- 3 · tokenizer -->
    <div class="li__step" :class="{ 'is-on': on(3) }">
      <span class="li__tag t-mono">{{ t('c.langin.s3') }}</span>
      <div class="li__toks">
        <span
          v-for="(tk, i) in TOKENS" :key="i"
          class="li__tok"
          :style="{ transitionDelay: on(3) ? `${i * 40}ms` : '0ms' }"
        >
          <em class="t-mono">{{ tk.t }}</em>
          <b class="t-mono">{{ tk.id }}</b>
        </span>
      </div>
      <span class="li__note">{{ t('c.langin.note3') }}</span>
    </div>

    <!-- 4 · one sequence -->
    <div class="li__step" :class="{ 'is-on': on(4) }">
      <span class="li__tag t-mono">{{ t('c.langin.s4') }}</span>
      <div class="li__seq">
        <span v-for="i in 10" :key="`v${i}`" class="li__cell li__cell--vis" />
        <span v-for="i in 7" :key="`l${i}`" class="li__cell li__cell--lang" />
      </div>
      <div class="li__legend">
        <span><i class="li__sw li__sw--vis" /> {{ t('c.langin.legVis') }}</span>
        <span><i class="li__sw li__sw--lang" /> {{ t('c.langin.legLang') }}</span>
        <span class="c-muted">{{ t('c.langin.legNote') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.li { display: flex; flex-direction: column; gap: var(--sp-4); }
.li__step {
  display: flex; flex-direction: column; gap: 5px;
  padding-left: 13px; border-left: 2px solid var(--accent-lang);
  opacity: 0; translate: 0 14px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.li__step.is-on { opacity: 1; translate: 0 0; }

.li__tag {
  font-size: var(--fs-micro); letter-spacing: var(--tr-micro);
  text-transform: uppercase; color: var(--text-muted);
}
.li__sentence { font-size: var(--fs-h3); color: var(--text-primary); }

.li__prompt {
  font-size: var(--fs-small); line-height: 1.6;
  padding: 7px 11px; border-radius: var(--radius-sm);
  background: var(--surface-1);
}
.li__pfix { color: var(--text-muted); }
.li__pvar { color: var(--accent-lang); }

.li__note { font-size: var(--fs-caption); color: var(--text-secondary); max-width: 78ch; }

.li__toks { display: flex; flex-wrap: wrap; gap: 4px; }
.li__tok {
  display: flex; flex-direction: column; align-items: center; gap: 0;
  padding: 3px 7px; border-radius: var(--radius-sm);
  background: var(--accent-lang-tint);
  opacity: 0; transition: opacity var(--d-step) var(--e-linear);
}
.li__step.is-on .li__tok { opacity: 1; }
.li__tok em { font-style: normal; font-size: var(--fs-caption); color: var(--accent-lang); }
.li__tok b { font-weight: 400; font-size: var(--fs-micro); color: var(--text-muted); }

.li__seq { display: flex; gap: 3px; flex-wrap: wrap; }
.li__cell { width: 24px; height: 11px; border-radius: 2px; }
.li__cell--vis { background: var(--accent-action); opacity: 0.85; }
.li__cell--lang { background: var(--accent-lang); opacity: 0.85; }

.li__legend { display: flex; gap: var(--sp-4); flex-wrap: wrap; font-size: var(--fs-micro); color: var(--text-secondary); }
.li__legend span { display: flex; align-items: center; gap: 5px; }
.li__sw { width: 11px; height: 8px; border-radius: 2px; display: inline-block; }
.li__sw--vis { background: var(--accent-action); }
.li__sw--lang { background: var(--accent-lang); }
</style>

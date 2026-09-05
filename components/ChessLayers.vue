<!--
  ACT 7 — the architecture lesson, using the chess robot as the case study.

  The thing worth teaching is not "here are four boxes". It is that the CHESS
  LANGUAGE DIES before it ever reaches the policy. Stockfish thinks in moves;
  the orchestrator expands one move into several atomic pick-and-place
  operations (a capture is two, castling is two, a promotion is three); and what
  finally crosses into ACT is a pair of coordinates. The muscle never knows a
  game is happening.

  So the animation is a literal descent: the token "Nxe5" travels down the
  layers, and at the boundary its LETTERS fade out while only numbers survive.
-->
<script setup lang="ts">
import { useTx } from '../lib/tx'
import { computed } from 'vue'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const { t } = useTx()

const LAYERS = computed(() => [
  { at: 1, name: t('c.chess.l1n'), role: t('c.chess.l1r'), payload: 'Nxe5', kind: 'lang', note: t('c.chess.l1note') },
  { at: 2, name: t('c.chess.l2n'), role: t('c.chess.l2r'), payload: t('c.chess.l2p'), kind: 'lang', note: t('c.chess.l2note') },
  { at: 3, name: t('c.chess.l3n'), role: t('c.chess.l3r'), payload: 'e5 → (0.21, −0.08, 0.03)', kind: 'bridge', note: t('c.chess.l3note') },
  { at: 4, name: t('c.chess.l4n'), role: t('c.chess.l4r'), payload: '[0.21, −0.08, 0.03, …]', kind: 'action', note: t('c.chess.l4note') },
])

const active = computed(() => LAYERS.value.find((l) => l.at === props.stage))
</script>

<template>
  <div class="cl">
    <ol class="cl__stack">
      <li
        v-for="(l, i) in LAYERS" :key="l.name"
        class="cl__layer"
        :class="[`cl__layer--${l.kind}`, { 'is-on': props.stage >= l.at, 'is-active': props.stage === l.at }]"
        :style="{ transitionDelay: props.stage >= l.at ? '0ms' : '0ms' }"
      >
        <div class="cl__meta">
          <span class="cl__name">{{ l.name }}</span>
          <span class="cl__role">{{ l.role }}</span>
        </div>

        <div class="cl__payload t-mono" :class="`cl__payload--${l.kind}`">
          {{ l.payload }}
        </div>

        <!-- the boundary marker sits between the bridge layer and the policy -->
        <div v-if="i === 2" class="cl__frontier" :class="{ 'is-on': props.stage >= 3 }">
          <span class="cl__frontierline" />
          <span class="cl__frontiertext t-mono">{{ t('c.chess.frontier') }}</span>
          <span class="cl__frontierline" />
        </div>
      </li>
    </ol>

    <p class="cl__note" :class="{ 'is-on': !!active }">{{ active?.note ?? '' }}</p>
  </div>
</template>

<style scoped>
.cl { display: flex; flex-direction: column; gap: var(--sp-3); }
.cl__stack { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }

.cl__layer {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  gap: var(--sp-5);
  padding: 3px 0 3px 12px;
  border-left: 2px solid var(--hairline);
  opacity: 0;
  translate: 0 14px;
  transition:
    opacity var(--d-step) var(--e-linear),
    translate var(--d-entry) var(--e-out-quart),
    border-color var(--d-step) var(--e-linear);
}
.cl__layer.is-on { opacity: 0.4; translate: 0 0; }
.cl__layer.is-active { opacity: 1; }
.cl__layer--lang.is-active { border-left-color: var(--accent-lang); }
.cl__layer--bridge.is-active { border-left-color: var(--text-secondary); }
.cl__layer--action.is-active { border-left-color: var(--accent-action); }

.cl__meta { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.cl__name { font-size: var(--fs-body); color: var(--text-primary); font-variation-settings: 'wght' 500; }
.cl__role { font-size: var(--fs-micro); color: var(--text-muted); }

.cl__payload { font-size: var(--fs-small); white-space: nowrap; }
.cl__payload--lang { color: var(--accent-lang); }
.cl__payload--bridge { color: var(--text-secondary); }
.cl__payload--action { color: var(--accent-action); }

.cl__frontier {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin: 6px 0 1px;
  opacity: 0;
  transition: opacity var(--d-entry) var(--e-linear);
}
.cl__frontier.is-on { opacity: 1; }
.cl__frontierline { flex: 1; height: 1px; background: var(--accent-action-dim); }
.cl__frontiertext {
  font-size: var(--fs-micro);
  letter-spacing: var(--tr-micro);
  text-transform: uppercase;
  color: var(--accent-action);
  white-space: nowrap;
}

.cl__note {
  margin: 0;
  max-width: 84ch;
  min-height: 2.6em;
  font-size: var(--fs-body);
  line-height: 1.45;
  color: var(--text-primary);
  opacity: 0;
  translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.cl__note.is-on { opacity: 1; translate: 0 0; }
</style>

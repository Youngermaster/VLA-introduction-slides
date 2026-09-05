<!--
  ACT 3 — "is this the same attention as ChatGPT?"

  The audience will ask, and the honest answer is: yes for the backbone, and the
  interesting part is the ONE place it differs. So this shows the two mechanisms
  side by side in terms of where Q, K and V actually come from — which is the
  only definition of the difference that isn't hand-waving.

  Left  · self-attention: Q, K, V all from the same sequence. This is exactly
          what a text LLM does, and it is what the VLM backbone runs.
  Right · cross-attention: Q from the action expert, K and V from the VLM. This
          is how SmolVLA's action head reads the backbone without being part of it.
-->
<script setup lang="ts">
import { useTx } from '../lib/tx'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const on = (n: number) => props.stage >= n
const { t, md } = useTx()
</script>

<template>
  <div class="ax">
    <!-- SELF -->
    <section class="ax__side" :class="{ 'is-on': on(1) }">
      <header class="ax__head">
        <span class="ax__tag t-mono">{{ t('c.attention.selfTag') }}</span>
        <span class="ax__who">{{ t('c.attention.selfWho') }}</span>
      </header>

      <div class="ax__diag">
        <div class="ax__seq ax__seq--lang">
          <span v-for="i in 7" :key="i" class="ax__tok" />
          <span class="ax__seqlabel t-mono">{{ t('c.attention.selfSeq') }}</span>
        </div>
        <div class="ax__qkv">
          <span class="ax__q">Q</span><span class="ax__k">K</span><span class="ax__v">V</span>
        </div>
        <span class="ax__from t-mono">{{ t('c.attention.selfFrom') }}</span>
      </div>

      <p class="ax__p">{{ t('c.attention.selfP') }}</p>
    </section>

    <!-- CROSS -->
    <section class="ax__side" :class="{ 'is-on': on(2) }">
      <header class="ax__head">
        <span class="ax__tag ax__tag--action t-mono">{{ t('c.attention.crossTag') }}</span>
        <span class="ax__who">{{ t('c.attention.crossWho') }}</span>
      </header>

      <div class="ax__diag">
        <div class="ax__cross">
          <div class="ax__seq ax__seq--lang ax__seq--small">
            <span v-for="i in 7" :key="i" class="ax__tok" />
            <span class="ax__seqlabel t-mono">{{ t('c.attention.crossKv') }}</span>
          </div>
          <div class="ax__arrow" :class="{ 'is-on': on(3) }" />
          <div class="ax__seq ax__seq--action ax__seq--small">
            <span v-for="i in 4" :key="i" class="ax__tok ax__tok--action" />
            <span class="ax__seqlabel t-mono">{{ t('c.attention.crossQ') }}</span>
          </div>
        </div>
        <span class="ax__from t-mono">{{ t('c.attention.crossFrom') }}</span>
      </div>

      <p class="ax__p" v-html="md('c.attention.crossP')" />
    </section>

    <!-- the one real difference in the backbone: the mask -->
    <div class="ax__mask" :class="{ 'is-on': on(3) }">
      <span class="ax__masktag t-mono">{{ t('c.attention.maskTag') }}</span>
      <div class="ax__blocks">
        <span class="ax__block ax__block--prefix">{{ t('c.attention.maskPrefix') }}<em>{{ t('c.attention.maskPrefixSub') }}</em></span>
        <span class="ax__block ax__block--state">{{ t('c.attention.maskState') }}<em>{{ t('c.attention.maskStateSub') }}</em></span>
        <span class="ax__block ax__block--act">{{ t('c.attention.maskAct') }}<em>{{ t('c.attention.maskActSub') }}</em></span>
      </div>
      <span class="ax__masknote" v-html="md('c.attention.maskNote')" />
    </div>

    <footer class="ax__punch" :class="{ 'is-on': on(4) }" v-html="md('c.attention.punch')" />
  </div>
</template>

<style scoped>
.ax { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3) var(--sp-6); }

.ax__side {
  display: flex; flex-direction: column; gap: 7px;
  opacity: 0; translate: 0 16px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.ax__side.is-on { opacity: 1; translate: 0 0; }

.ax__head { display: flex; flex-direction: column; gap: 1px; }
.ax__tag {
  font-size: var(--fs-caption); letter-spacing: 0.09em;
  text-transform: uppercase; color: var(--accent-lang);
  font-variation-settings: 'wght' 600;
}
.ax__tag--action { color: var(--accent-action); }
.ax__who { font-size: var(--fs-caption); color: var(--text-muted); }

.ax__diag { display: flex; flex-direction: column; gap: 7px; }

.ax__seq { display: flex; flex-wrap: wrap; gap: 3px; align-items: center; }
.ax__seq--small { flex-direction: column; align-items: flex-start; gap: 4px; }
.ax__tok {
  width: 20px; height: 9px; border-radius: 2px;
  background: var(--accent-lang); opacity: 0.8;
}
.ax__tok--action { background: var(--accent-action); }
.ax__seq--small .ax__tok { display: inline-block; }
.ax__seqlabel { font-size: var(--fs-micro); color: var(--text-muted); flex-basis: 100%; }

.ax__qkv { display: flex; gap: 6px; }
.ax__qkv span {
  font-family: 'Geist Mono Variable', monospace;
  font-size: var(--fs-caption);
  padding: 2px 8px; border-radius: var(--radius-sm);
  background: var(--accent-lang-tint); color: var(--accent-lang);
}
.ax__from { font-size: var(--fs-micro); color: var(--text-muted); }

.ax__cross { display: flex; align-items: center; gap: 10px; }
.ax__cross .ax__seq { flex-direction: row; flex-wrap: wrap; max-width: 108px; }
.ax__arrow {
  width: 26px; height: 2px; background: var(--accent-action); flex: none; position: relative;
  opacity: 0; transition: opacity var(--d-step) var(--e-linear);
}
.ax__arrow.is-on { opacity: 1; }
.ax__arrow::after {
  content: ''; position: absolute; right: -1px; top: -3px;
  border-left: 7px solid var(--accent-action);
  border-top: 4px solid transparent; border-bottom: 4px solid transparent;
}

.ax__p { margin: 0; font-size: var(--fs-caption); line-height: 1.45; color: var(--text-secondary); max-width: 48ch; }
.ax__p :deep(em), .ax__p :deep(strong) { font-style: normal; font-weight: 400; color: var(--text-primary); font-variation-settings: 'wght' 600; }

.ax__mask {
  grid-column: 1 / -1;
  display: flex; flex-direction: column; gap: 6px;
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.ax__mask.is-on { opacity: 1; translate: 0 0; }
.ax__masktag {
  font-size: var(--fs-micro); letter-spacing: var(--tr-micro);
  text-transform: uppercase; color: var(--text-muted);
}
.ax__blocks { display: flex; gap: 5px; flex-wrap: wrap; }
.ax__block {
  display: flex; flex-direction: column; gap: 0;
  padding: 5px 10px; border-radius: var(--radius-sm);
  font-size: var(--fs-caption);
}
.ax__block em { font-style: normal; font-size: var(--fs-micro); opacity: 0.75; }
.ax__block--prefix { background: var(--accent-lang-tint); color: var(--accent-lang); }
.ax__block--state { background: var(--surface-2); color: var(--text-secondary); }
.ax__block--act { background: var(--accent-action-tint); color: var(--accent-action); }
.ax__masknote { font-size: var(--fs-caption); color: var(--text-secondary); max-width: 92ch; }
.ax__masknote strong { color: var(--text-primary); }

.ax__punch {
  grid-column: 1 / -1;
  max-width: 96ch;
  font-size: var(--fs-body); line-height: 1.4; color: var(--text-secondary);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.ax__punch.is-on { opacity: 1; translate: 0 0; }
.ax__punch strong { color: var(--text-primary); }
</style>

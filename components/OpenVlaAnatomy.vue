<!--
  ACT 3 — OpenVLA, drawn properly.

  Rebuilt as a live diagram rather than a screenshot of the paper figure, so it
  can be revealed in the order the explanation needs: the two input paths first,
  then where they merge, then how the answer becomes motion. A pasted figure
  forces the room to parse all of it at once while you talk over it.

  This is also the cleanest architecture to teach with, because every box maps
  onto something the audience already knows: a ViT, a Llama, a tokenizer.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useTx } from '../lib/tx'
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const on = (n: number) => props.stage >= n
const { t } = useTx()
</script>

<template>
  <div class="ov">
    <!-- ── inputs ─────────────────────────────────────────────────────── -->
    <div class="ov__inputs">
      <div class="ov__in" :class="{ 'is-on': on(1) }">
        <span class="ov__intag t-mono">{{ t('c.openvla.imgTag') }}</span>
        <div class="ov__thumb"><span class="t-mono">640×480</span></div>
      </div>
      <div class="ov__in" :class="{ 'is-on': on(3) }">
        <span class="ov__intag t-mono">{{ t('c.openvla.instrTag') }}</span>
        <div class="ov__instr">{{ t('c.openvla.instr') }}</div>
      </div>
    </div>

    <!-- ── encoders ───────────────────────────────────────────────────── -->
    <div class="ov__enc">
      <div class="ov__box ov__box--action" :class="{ 'is-on': on(1) }">
        <span class="ov__n">1</span>
        <span class="ov__bt">{{ t('c.openvla.b1') }}</span>
        <span class="ov__bs t-mono">{{ t('c.openvla.b1s') }}</span>
      </div>
      <div class="ov__box ov__box--action" :class="{ 'is-on': on(2) }">
        <span class="ov__n">2</span>
        <span class="ov__bt">{{ t('c.openvla.b2') }}</span>
        <span class="ov__bs t-mono">2176 → 8704 → 4096 → 4096</span>
      </div>
      <div class="ov__box ov__box--lang" :class="{ 'is-on': on(3) }">
        <span class="ov__bt">{{ t('c.openvla.b3') }}</span>
        <span class="ov__bs t-mono">{{ t('c.openvla.b3s') }}</span>
      </div>
    </div>

    <!-- ── the merged sequence ────────────────────────────────────────── -->
    <div class="ov__seq" :class="{ 'is-on': on(4) }">
      <span v-for="i in 8" :key="`v${i}`" class="ov__cell ov__cell--vis" />
      <span v-for="i in 6" :key="`l${i}`" class="ov__cell ov__cell--lang" />
      <span class="ov__seqtag t-mono">{{ t('c.openvla.seqTag') }}</span>
    </div>

    <!-- ── backbone ───────────────────────────────────────────────────── -->
    <div class="ov__box ov__box--core" :class="{ 'is-on': on(4) }">
      <span class="ov__n">3</span>
      <span class="ov__bt ov__bt--big">Llama 2 · 7B</span>
      <span class="ov__bs t-mono">{{ t('c.openvla.coreS') }}</span>
    </div>

    <!-- ── output ─────────────────────────────────────────────────────── -->
    <div class="ov__out">
      <div class="ov__acts" :class="{ 'is-on': on(5) }">
        <span v-for="i in 7" :key="i" class="ov__act t-mono"
              :style="{ transitionDelay: on(5) ? `${i * 40}ms` : '0ms' }">▮</span>
        <span class="ov__seqtag t-mono">{{ t('c.openvla.actsTag') }}</span>
      </div>

      <div class="ov__box ov__box--action" :class="{ 'is-on': on(6) }">
        <span class="ov__bt">{{ t('c.openvla.detok') }}</span>
        <span class="ov__bs t-mono">{{ t('c.openvla.detokS') }}</span>
      </div>

      <div class="ov__vec" :class="{ 'is-on': on(6) }">
        <span class="t-mono">[ Δx  Δy  Δz  Δroll  Δpitch  Δyaw  Δgrip ]</span>
        <em>{{ t('c.openvla.vecNote') }}</em>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ov { display: flex; flex-direction: column; gap: 9px; }

.ov__inputs { display: flex; gap: var(--sp-4); }
.ov__in, .ov__box, .ov__seq, .ov__acts, .ov__vec {
  opacity: 0; translate: 0 12px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.ov__in.is-on, .ov__box.is-on, .ov__seq.is-on, .ov__acts.is-on, .ov__vec.is-on { opacity: 1; translate: 0 0; }

.ov__in { display: flex; align-items: center; gap: 9px; }
.ov__intag { font-size: var(--fs-micro); color: var(--text-muted); text-transform: uppercase; letter-spacing: var(--tr-micro); }
.ov__thumb {
  padding: 4px 10px; border-radius: var(--radius-sm);
  background: var(--accent-action-tint); border-left: 2px solid var(--accent-action);
  font-size: var(--fs-micro); color: var(--accent-action);
}
.ov__instr {
  padding: 4px 10px; border-radius: var(--radius-sm);
  background: var(--accent-lang-tint); border-left: 2px solid var(--accent-lang);
  font-size: var(--fs-caption); color: var(--accent-lang);
}

.ov__enc { display: flex; gap: 7px; flex-wrap: wrap; }

.ov__box {
  position: relative;
  display: flex; flex-direction: column; gap: 1px;
  padding: 7px 11px 7px 13px; border-radius: var(--radius-md);
  border-left: 2px solid var(--hairline);
}
.ov__box--action { border-left-color: var(--accent-action); background: var(--accent-action-tint); }
.ov__box--lang { border-left-color: var(--accent-lang); background: var(--accent-lang-tint); }
.ov__box--core { border-left-color: var(--text-primary); background: var(--surface-2); padding: 11px 14px; }

.ov__n {
  position: absolute; top: 5px; right: 8px;
  font-family: 'Geist Mono Variable', monospace; font-size: 9px;
  color: var(--text-muted);
}
.ov__bt { font-size: var(--fs-body); color: var(--text-primary); font-variation-settings: 'wght' 500; }
.ov__bt--big { font-size: var(--fs-h3); }
.ov__bs { font-size: var(--fs-micro); color: var(--text-muted); }

.ov__seq, .ov__acts { display: flex; align-items: center; gap: 3px; flex-wrap: wrap; }
.ov__cell { width: 22px; height: 10px; border-radius: 2px; }
.ov__cell--vis { background: var(--accent-action); opacity: 0.85; }
.ov__cell--lang { background: var(--accent-lang); opacity: 0.85; }
.ov__seqtag { font-size: var(--fs-micro); color: var(--text-muted); margin-left: 7px; }

.ov__out { display: flex; flex-direction: column; gap: 7px; }
.ov__act {
  color: var(--accent-action); font-size: 15px;
  opacity: 0; transition: opacity var(--d-step) var(--e-linear);
}
.ov__acts.is-on .ov__act { opacity: 1; }

.ov__vec { display: flex; align-items: baseline; gap: var(--sp-3); flex-wrap: wrap; }
.ov__vec span { font-size: var(--fs-body); color: var(--accent-action); }
.ov__vec em { font-style: normal; font-size: var(--fs-caption); color: var(--text-muted); }
</style>

<!--
  ACT 5 — the demo hardware, so the room knows exactly what it is watching.

  Worth being specific here: the split between the training machine and the
  presenting machine IS the interesting part. Training happened on an RTX 5060 Ti
  at home; the laptop on stage only runs inference through MPS, pulling weights
  from the Hub. That separation is what makes a live robot demo portable at all.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const on = (n: number) => props.stage >= n
</script>

<template>
  <div class="rd">
    <!-- training, elsewhere -->
    <section class="rd__zone rd__zone--past" :class="{ 'is-on': on(1) }">
      <span class="rd__ztag t-mono">en casa · antes</span>
      <div class="rd__box">
        <span class="rd__bname">PC torre</span>
        <span class="rd__bsub t-mono">RTX 5060 Ti · 16 GB</span>
        <span class="rd__bnote">Fine-tuning de SmolVLA sobre mi dataset</span>
      </div>
      <div class="rd__box rd__box--hub">
        <span class="rd__bname">Hugging Face Hub</span>
        <span class="rd__bsub t-mono">push del modelo entrenado</span>
      </div>
    </section>

    <div class="rd__link" :class="{ 'is-on': on(2) }">
      <span class="rd__linkline" />
      <span class="rd__linktext t-mono">sólo se descargan los pesos</span>
    </div>

    <!-- the stage -->
    <section class="rd__zone rd__zone--now" :class="{ 'is-on': on(2) }">
      <span class="rd__ztag t-mono">aquí · ahora</span>
      <div class="rd__box rd__box--live">
        <span class="rd__bname">MacBook M3 · 16 GB</span>
        <span class="rd__bsub t-mono">inferencia en MPS</span>
        <span class="rd__bnote">lerobot-rollout --device=mps</span>
      </div>

      <div class="rd__cams" :class="{ 'is-on': on(3) }">
        <span v-for="c in ['cenital', 'muñeca', 'base']" :key="c" class="rd__cam t-mono">{{ c }}</span>
      </div>

      <div class="rd__box rd__box--arm" :class="{ 'is-on': on(3) }">
        <span class="rd__bname">SO-101 follower</span>
        <span class="rd__bsub t-mono">6× Feetech STS3215 · bus serie</span>
        <span class="rd__bnote">impreso en una Ender 3 V3 KE</span>
      </div>
    </section>

    <footer class="rd__foot" :class="{ 'is-on': on(4) }">
      <span class="rd__foottag t-mono">si algo falla</span>
      <span class="rd__foottext">
        Tecla <kbd>B</kbd> → vídeo de respaldo. Tecla <kbd>V</kbd> → volver aquí.
      </span>
    </footer>
  </div>
</template>

<style scoped>
.rd { display: grid; grid-template-columns: 1fr 148px 1.25fr; gap: var(--sp-5); align-items: start; }

.rd__zone {
  display: flex; flex-direction: column; gap: 8px;
  opacity: 0; translate: 0 16px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.rd__zone.is-on { opacity: 1; translate: 0 0; }
.rd__ztag {
  font-size: var(--fs-micro); letter-spacing: var(--tr-micro);
  text-transform: uppercase; color: var(--text-muted);
}

.rd__box {
  display: flex; flex-direction: column; gap: 2px;
  padding: 9px 12px; border-radius: var(--radius-md);
  border-left: 2px solid var(--hairline-strong);
}
.rd__box--hub { border-left-color: var(--accent-lang); background: var(--accent-lang-tint); }
.rd__box--live { border-left-color: var(--accent-lang); background: var(--accent-lang-tint); }
.rd__box--arm { border-left-color: var(--accent-action); background: var(--accent-action-tint); }

.rd__bname { font-size: var(--fs-body); color: var(--text-primary); font-variation-settings: 'wght' 500; }
.rd__bsub { font-size: var(--fs-micro); color: var(--text-muted); }
.rd__bnote { font-size: var(--fs-small); color: var(--text-secondary); margin-top: 3px; }

.rd__link {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding-top: 40px;
  opacity: 0; transition: opacity var(--d-entry) var(--e-linear);
}
.rd__link.is-on { opacity: 1; }
.rd__linkline { width: 100%; height: 1px; background: var(--hairline-strong); }
.rd__linktext { font-size: var(--fs-micro); color: var(--text-muted); text-align: center; }

.rd__cams { display: flex; gap: 5px; opacity: 0; transition: opacity var(--d-step) var(--e-linear); }
.rd__cams.is-on { opacity: 1; }
.rd__cam {
  font-size: var(--fs-micro); padding: 3px 7px; border-radius: var(--radius-sm);
  background: var(--accent-action-tint); color: var(--accent-action);
}

.rd__foot {
  grid-column: 1 / -1;
  display: flex; align-items: baseline; gap: var(--sp-3);
  padding-left: 12px; border-left: 2px solid var(--signal-warn);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.rd__foot.is-on { opacity: 1; translate: 0 0; }
.rd__foottag {
  font-size: var(--fs-micro); letter-spacing: var(--tr-micro);
  text-transform: uppercase; color: var(--signal-warn);
}
.rd__foottext { font-size: var(--fs-body); color: var(--text-secondary); }
.rd__foottext kbd {
  font-family: 'Geist Mono Variable', monospace;
  font-size: 0.9em; padding: 1px 5px; border-radius: var(--radius-sm);
  background: var(--surface-3); color: var(--text-primary);
}
</style>

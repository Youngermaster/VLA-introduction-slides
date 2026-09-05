<!--
  ACT 3 — "where does the ACT part live inside a VLA?"

  A question the audience will genuinely have, because the talk spends Act 2 on
  ACT and then seems to leave it behind. The honest answer is that it never left:
  the action expert at the end of a VLA is doing exactly what ACT does — take a
  representation of the current situation and emit a CHUNK of future actions. The
  difference is only what feeds it.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })

const ROWS = [
  { k: 'in',    label: 'Entrada',                 act: 'imágenes + estado del robot',        vla: 'imágenes + estado + instrucción' },
  { k: 'enc',   label: 'Representación',          act: 'ResNet entrenado desde cero',        vla: 'VLM preentrenado en internet' },
  { k: 'head',  label: 'Cabeza de acción',        act: 'transformer CVAE → chunk',           vla: 'action expert → chunk' },
  { k: 'out',   label: 'Salida',                  act: '~100 acciones futuras',              vla: '~50 acciones futuras' },
  { k: 'lang',  label: 'Entiende lenguaje',       act: 'no',                                 vla: 'sí' },
  { k: 'gen',   label: 'Generaliza a objetos nuevos', act: 'no',                             vla: 'algo' },
] as const
</script>

<template>
  <div class="iv">
    <div class="iv__head">
      <span />
      <span class="iv__hact t-mono">ACT</span>
      <span class="iv__hvla t-mono">VLA</span>
    </div>

    <div
      v-for="(r, i) in ROWS" :key="r.k"
      class="iv__row"
      :class="{ 'is-on': props.stage >= 1, 'is-hl': (r.k === 'head' && props.stage >= 2) }"
      :style="{ transitionDelay: props.stage >= 1 ? `${i * 55}ms` : '0ms' }"
    >
      <span class="iv__label">{{ r.label }}</span>
      <span class="iv__act">{{ r.act }}</span>
      <span class="iv__vla">{{ r.vla }}</span>
    </div>

    <p class="iv__punch" :class="{ 'is-on': props.stage >= 3 }">
      La cabeza de acción de un VLA <strong>es</strong> una política de chunking.
      Lo que cambió no es el músculo — es lo que le habla al músculo.
    </p>
  </div>
</template>

<style scoped>
.iv { display: flex; flex-direction: column; gap: 0; }
.iv__head, .iv__row {
  display: grid;
  grid-template-columns: 210px 1fr 1fr;
  gap: var(--sp-4);
  align-items: baseline;
  padding: 7px 0 7px 12px;
  border-left: 2px solid transparent;
}
.iv__head { padding-bottom: 4px; }
.iv__hact { font-size: var(--fs-caption); color: var(--accent-action); letter-spacing: 0.1em; font-variation-settings: 'wght' 600; }
.iv__hvla { font-size: var(--fs-caption); color: var(--accent-lang); letter-spacing: 0.1em; font-variation-settings: 'wght' 600; }

.iv__row {
  border-bottom: 1px solid var(--hairline);
  opacity: 0;
  translate: 0 10px;
  transition:
    opacity var(--d-step) var(--e-linear),
    translate var(--d-entry) var(--e-out-quart),
    border-left-color var(--d-step) var(--e-linear);
}
.iv__row.is-on { opacity: 1; translate: 0 0; }
.iv__row.is-hl { border-left-color: var(--accent-action); }

.iv__label { font-size: var(--fs-small); color: var(--text-muted); }
.iv__act { font-size: var(--fs-body); color: var(--text-secondary); }
.iv__vla { font-size: var(--fs-body); color: var(--text-primary); }

.iv__punch {
  margin: var(--sp-5) 0 0;
  max-width: 84ch;
  font-size: var(--fs-lead);
  line-height: 1.4;
  color: var(--text-secondary);
  opacity: 0;
  translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.iv__punch.is-on { opacity: 1; translate: 0 0; }
.iv__punch strong { color: var(--text-primary); }
</style>

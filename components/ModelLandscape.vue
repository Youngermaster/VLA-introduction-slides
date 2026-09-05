<!--
  ACT 4 — the landscape, with hardware numbers that are actually sourced.

  Every figure here was checked against the primary source in Sept 2026. The ones
  that circulate on blogs and could NOT be verified were dropped rather than
  repeated: there is no published SmolVLA Hz figure and no published SmolVLA VRAM
  table, so this shows what the paper does report instead.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })

const MODELS = [
  { at: 1, name: 'RT-2',      year: '2023', params: '12B / 55B', open: 'no',       vram: '—',              note: 'La idea fundacional: el conocimiento de internet transfiere al control.' },
  { at: 2, name: 'OpenVLA',   year: '2024', params: '7B',        open: 'sí',       vram: '~15 GB LoRA',    note: 'El primer VLA abierto serio. Llama 2 + DINOv2 + SigLIP, 256 bins.' },
  { at: 3, name: 'π₀ / π₀.₅', year: '2024–25', params: '3.3B',   open: 'sí',       vram: '22.5 GB LoRA · >70 GB completo', note: 'PaliGemma + action expert por flow matching. π₀.₇ ya existe, pero cerrado.' },
  { at: 4, name: 'GR00T N1.7', year: '2026', params: '3B',       open: 'sí',       vram: '16 GB inferencia · ~35 GB fine-tune', note: 'Backbone Cosmos-Reason2. 8.9 Hz en un AGX Thor montado en el robot.' },
  { at: 5, name: 'SmolVLA',   year: '2025', params: '450M',      open: 'sí',       vram: 'una sola GPU',   note: 'Supera a π₀ (3.3B) en tareas reales de SO-100. Este es el que corre en tu mesa.' },
] as const
</script>

<template>
  <div class="ml">
    <div class="ml__head">
      <span>Modelo</span><span>Params</span><span>Abierto</span><span>Memoria</span>
    </div>

    <div
      v-for="m in MODELS" :key="m.name"
      class="ml__row"
      :class="{ 'is-on': props.stage >= m.at, 'is-active': props.stage === m.at, 'is-star': m.name === 'SmolVLA' }"
    >
      <div class="ml__name">
        <span class="ml__nm">{{ m.name }}</span>
        <span class="ml__yr t-mono">{{ m.year }}</span>
      </div>
      <span class="ml__params t-mono">{{ m.params }}</span>
      <span class="ml__open t-mono" :class="m.open === 'sí' ? 'c-lang' : 'c-muted'">{{ m.open }}</span>
      <span class="ml__vram t-mono">{{ m.vram }}</span>
      <p class="ml__note" :class="{ 'is-on': props.stage === m.at }">{{ m.note }}</p>
    </div>
  </div>
</template>

<style scoped>
.ml { display: flex; flex-direction: column; }
.ml__head, .ml__row {
  display: grid;
  grid-template-columns: 190px 128px 84px 1fr;
  gap: var(--sp-4);
  align-items: baseline;
  padding: 5px 0 5px 12px;
  border-left: 2px solid transparent;
}
.ml__head {
  font-size: var(--fs-caption);
  color: var(--text-muted);
  padding-bottom: 4px;
  border-bottom: 1px solid var(--hairline);
}
.ml__row {
  border-bottom: 1px solid var(--hairline);
  opacity: 0;
  translate: 0 10px;
  transition:
    opacity var(--d-step) var(--e-linear),
    translate var(--d-entry) var(--e-out-quart),
    border-left-color var(--d-step) var(--e-linear);
}
.ml__row.is-on { opacity: 0.5; translate: 0 0; }
.ml__row.is-active { opacity: 1; border-left-color: var(--accent-action); }
.ml__row.is-star.is-on { opacity: 0.75; }
.ml__row.is-star.is-active { opacity: 1; }

.ml__name { display: flex; flex-direction: column; gap: 0; }
.ml__nm { font-size: var(--fs-lead); color: var(--text-primary); font-variation-settings: 'wght' 500; }
.ml__yr { font-size: var(--fs-micro); color: var(--text-muted); }
.ml__params, .ml__vram { font-size: var(--fs-small); color: var(--text-secondary); }
.ml__open { font-size: var(--fs-small); }

.ml__note {
  grid-column: 1 / -1;
  margin: 3px 0 0;
  font-size: var(--fs-small);
  color: var(--text-secondary);
  max-width: 88ch;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height var(--d-step) var(--e-out-quart), opacity var(--d-step) var(--e-linear);
}
.ml__note.is-on { max-height: 3.2em; opacity: 1; }
</style>

<!--
  ACT 2 — what ACT actually is, and what it is missing.

  The empty slot where language should be is the argument. Stage 3 drops an
  instruction onto it and shows it bouncing off: nothing in the network consumes
  text, so the sentence changes nothing about what the arm does.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })
const on = (n: number) => props.stage >= n
</script>

<template>
  <div class="ar">
    <div class="ar__flow">
      <div class="ar__node ar__node--in" :class="{ 'is-on': on(1) }">
        <span class="ar__ntitle">Imágenes</span>
        <span class="ar__nsub t-mono">3 cámaras · 30 Hz</span>
      </div>
      <div class="ar__node ar__node--in" :class="{ 'is-on': on(1) }">
        <span class="ar__ntitle">Estado</span>
        <span class="ar__nsub t-mono">6 articulaciones</span>
      </div>

      <div class="ar__arrow" :class="{ 'is-on': on(2) }" />

      <div class="ar__node ar__node--core" :class="{ 'is-on': on(2) }">
        <span class="ar__ntitle">ACT</span>
        <span class="ar__nsub t-mono">CVAE + transformer</span>
      </div>

      <div class="ar__arrow" :class="{ 'is-on': on(2) }" />

      <div class="ar__node ar__node--out" :class="{ 'is-on': on(2) }">
        <span class="ar__ntitle">Chunk de acciones</span>
        <span class="ar__nsub t-mono">~90–100 pasos</span>
      </div>
    </div>

    <!-- the missing input -->
    <div class="ar__lang" :class="{ 'is-on': on(3) }">
      <span class="ar__langbox t-mono">«agarra el frasco de magnesio»</span>
      <span class="ar__langx">no hay dónde conectarlo</span>
    </div>

    <p class="ar__punch" :class="{ 'is-on': on(4) }">
      ACT es un <strong>reflejo</strong>. Extraordinariamente bueno en la tarea que
      vio, y completamente sordo. Cambias el objeto y falla; le hablas y no pasa nada.
    </p>
  </div>
</template>

<style scoped>
.ar { display: flex; flex-direction: column; gap: var(--sp-5); }
.ar__flow { display: flex; align-items: center; gap: var(--sp-3); flex-wrap: wrap; }

.ar__node {
  display: flex; flex-direction: column; gap: 2px;
  padding: 9px 13px; border-radius: var(--radius-md);
  border-left: 2px solid var(--hairline);
  opacity: 0; translate: 0 14px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.ar__node.is-on { opacity: 1; translate: 0 0; }
.ar__node--in { border-left-color: var(--accent-action); background: var(--accent-action-tint); }
.ar__node--core { border-left-color: var(--accent-action); background: var(--accent-action-tint); }
.ar__node--out { border-left-color: var(--accent-action); background: var(--accent-action-tint); }

.ar__ntitle { font-size: var(--fs-body); color: var(--text-primary); font-variation-settings: 'wght' 500; }
.ar__nsub { font-size: var(--fs-micro); color: var(--text-muted); }

.ar__arrow {
  width: 22px; height: 2px; background: var(--hairline-strong); flex: none;
  opacity: 0; transition: opacity var(--d-step) var(--e-linear);
}
.ar__arrow.is-on { opacity: 1; }

.ar__lang {
  display: flex; align-items: center; gap: var(--sp-3);
  opacity: 0; translate: 0 12px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.ar__lang.is-on { opacity: 1; translate: 0 0; }
.ar__langbox {
  padding: 7px 11px; border-radius: var(--radius-md);
  background: var(--accent-lang-tint); color: var(--accent-lang);
  font-size: var(--fs-small);
  /* struck through: the sentence exists, it just has no receiver */
  text-decoration: line-through;
  text-decoration-color: var(--signal-warn);
  text-decoration-thickness: 2px;
}
.ar__langx { font-size: var(--fs-small); color: var(--signal-warn); }

.ar__punch {
  margin: 0; max-width: 84ch;
  font-size: var(--fs-lead); line-height: 1.4; color: var(--text-secondary);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.ar__punch.is-on { opacity: 1; translate: 0 0; }
.ar__punch strong { color: var(--text-primary); }
</style>

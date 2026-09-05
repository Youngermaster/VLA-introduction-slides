<!--
  ACT 4 — the honest decision guide.

  This is the slide that earns trust with an industry audience, because it says
  out loud that the thing the talk is about is often the wrong choice. For ONE
  fixed task with a fixed object, plain ACT or a Diffusion Policy usually beats a
  VLA: fewer parameters, faster inference, less to go wrong. VLAs earn their keep
  when you need language conditioning or generalization.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })

const COLS = [
  {
    at: 1, k: 'act', tone: 'action', title: 'ACT / Diffusion Policy',
    when: 'Una tarea fija. Un objeto. Un entorno.',
    pros: ['Más preciso en su tarea', 'Inferencia rápida y barata', 'Entrena en una GPU modesta'],
    cons: ['No entiende lenguaje', 'Cambias el objeto y falla', 'Una política por tarea'],
  },
  {
    at: 2, k: 'vla', tone: 'lang', title: 'VLA (SmolVLA, π₀, GR00T)',
    when: 'Varias tareas. Instrucciones en lenguaje. Objetos que cambian.',
    pros: ['Condicionado por lenguaje', 'Generaliza algo a objetos nuevos', 'Una política, muchas tareas'],
    cons: ['Más lento y más pesado', 'Suele perder en precisión pura', 'Necesita más VRAM'],
  },
  {
    at: 3, k: 'gen', tone: 'muted', title: 'Modelos generalistas',
    when: 'Todavía no, salvo que tengas la flota y el presupuesto.',
    pros: ['El techo más alto', 'Transferencia entre robots'],
    cons: ['Los mejores son cerrados', 'Cómputo fuera de alcance', 'La brecha sim → real sigue enorme'],
  },
] as const
</script>

<template>
  <div class="wu">
    <section
      v-for="c in COLS" :key="c.k"
      class="wu__col"
      :class="[`wu__col--${c.tone}`, { 'is-on': props.stage >= c.at }]"
    >
      <h3 class="wu__h">{{ c.title }}</h3>
      <p class="wu__when">{{ c.when }}</p>

      <ul class="wu__list">
        <li v-for="p in c.pros" :key="p" class="wu__pro">{{ p }}</li>
      </ul>
      <ul class="wu__list">
        <li v-for="p in c.cons" :key="p" class="wu__con">{{ p }}</li>
      </ul>
    </section>

    <p class="wu__punch" :class="{ 'is-on': props.stage >= 4 }">
      Para <strong>una</strong> tarea fija, ACT casi siempre gana. Un VLA se paga
      solo cuando necesitas que el lenguaje cambie el comportamiento.
    </p>
  </div>
</template>

<style scoped>
.wu { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-6); align-items: start; }

.wu__col {
  display: flex; flex-direction: column; gap: 7px;
  padding-left: 12px;
  border-left: 2px solid var(--hairline);
  opacity: 0; translate: 0 16px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.wu__col.is-on { opacity: 1; translate: 0 0; }
.wu__col--action { border-left-color: var(--accent-action); }
.wu__col--lang { border-left-color: var(--accent-lang); }
.wu__col--muted { border-left-color: var(--hairline-strong); }

.wu__h { margin: 0; font-size: var(--fs-h3); font-variation-settings: 'wght' 500; color: var(--text-primary); }
.wu__when { margin: 0 0 4px; font-size: var(--fs-small); color: var(--text-muted); }

.wu__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 3px; }
.wu__list li { margin: 0; padding-left: 15px; position: relative; font-size: var(--fs-small); max-width: none; }
.wu__list li::before { content: ''; position: absolute; left: 0; top: 0.56em; width: 7px; height: 2px; border-radius: 1px; }
.wu__pro { color: var(--text-secondary); }
.wu__pro::before { background: var(--signal-ok); }
.wu__con { color: var(--text-muted); }
.wu__con::before { background: var(--signal-warn); }

.wu__punch {
  grid-column: 1 / -1;
  margin: var(--sp-4) 0 0;
  max-width: 88ch;
  font-size: var(--fs-lead); line-height: 1.4; color: var(--text-secondary);
  opacity: 0; translate: 0 10px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.wu__punch.is-on { opacity: 1; translate: 0 0; }
.wu__punch strong { color: var(--text-primary); }
</style>

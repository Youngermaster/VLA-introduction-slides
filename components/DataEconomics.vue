<!--
  ACT 6 — the real cost of robot data.

  The figure that circulates for this ($340/h in 2024 falling to $118/h in 2026)
  traces back to a single proprietary vendor report with no published methodology
  and a sample of one benchmark task. Repeating it in a technical room is a
  credibility risk, so this uses primary sources instead — and they make a
  stronger point anyway: the unit of cost is not dollars per hour, it is
  institution-years.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })

const DROID = [
  { k: '76 000', v: 'trayectorias' },
  { k: '350', v: 'horas de interacción' },
  { k: '564', v: 'escenas' },
  { k: '50', v: 'personas recolectando' },
  { k: '13', v: 'instituciones' },
  { k: '12', v: 'meses' },
]
</script>

<template>
  <div class="de">
    <section class="de__block" :class="{ 'is-on': props.stage >= 1 }">
      <span class="de__tag t-mono">lo que cuesta un dataset</span>
      <div class="de__stats">
        <div
          v-for="(d, i) in DROID" :key="d.k"
          class="de__stat"
          :style="{ transitionDelay: props.stage >= 1 ? `${i * 55}ms` : '0ms' }"
        >
          <span class="de__k t-mono">{{ d.k }}</span>
          <span class="de__v">{{ d.v }}</span>
        </div>
      </div>
      <p class="de__p">
        Eso es <strong>DROID</strong>, uno solo. Tres continentes, hardware idéntico,
        un año. La unidad real no son dólares por hora — son <strong>años-institución</strong>.
      </p>
    </section>

    <section class="de__block" :class="{ 'is-on': props.stage >= 2 }">
      <span class="de__tag t-mono">y lo que compras con ellos</span>
      <p class="de__lead">
        La generalización escala con la <strong>diversidad</strong> de escenas y
        objetos, siguiendo una ley de potencias. Las demostraciones adicionales
        <em>por escena</em> se saturan rápido.
      </p>
      <p class="de__p">
        Es decir: no estás pagando por volumen. Estás pagando por variedad —
        y ahí es donde casi todo el mundo gasta mal su presupuesto.
      </p>
    </section>
  </div>
</template>

<style scoped>
.de { display: grid; grid-template-columns: 1.15fr 1fr; gap: var(--sp-7); align-items: start; }
.de__block {
  display: flex; flex-direction: column; gap: 10px;
  opacity: 0; translate: 0 16px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.de__block.is-on { opacity: 1; translate: 0 0; }

.de__tag {
  font-size: var(--fs-micro); letter-spacing: var(--tr-micro);
  text-transform: uppercase; color: var(--text-muted);
}
.de__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-3) var(--sp-4); }
.de__stat {
  display: flex; flex-direction: column; gap: 0;
  opacity: 0; transition: opacity var(--d-step) var(--e-linear);
}
.de__block.is-on .de__stat { opacity: 1; }
.de__k {
  font-size: 24px; color: var(--accent-action);
  font-variation-settings: 'wght' 500; font-variant-numeric: tabular-nums;
}
.de__v { font-size: var(--fs-caption); color: var(--text-muted); }

.de__lead { margin: 0; font-size: var(--fs-lead); line-height: 1.4; color: var(--text-primary); max-width: 44ch; }
.de__p { margin: 0; font-size: var(--fs-body); color: var(--text-secondary); max-width: 48ch; }
.de__p strong, .de__lead strong { color: var(--text-primary); }
.de__lead em { font-style: normal; color: var(--accent-lang); }
</style>

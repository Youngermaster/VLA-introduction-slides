<!--
  ACT 8 — what a world model actually adds.

  Left: today's VLA. A closed reactive loop — observe, act, observe, act. It has
  no notion of what will happen next; it only ever answers "what do I do now".

  Right: a world model. Before acting it ROLLS OUT several imagined futures and
  picks one. The ghosted branches are the whole idea.

  The concrete anchor is VLA-JEPA, which now ships in LeRobot: a V-JEPA2 video
  world model supervises training, and is then dropped at inference. That detail
  matters — it says the field is currently using world models to LEARN, not yet
  to PLAN, which is exactly where the frontier sits.
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })

const LOOP = [
  { k: 'obs', label: 'observa' },
  { k: 'pol', label: 'política' },
  { k: 'act', label: 'actúa' },
]

/** Imagined rollouts: same origin, diverging futures, one of them chosen. */
const branches = computed(() =>
  Array.from({ length: 4 }, (_, b) => {
    const spread = (b - 1.5) * 17
    const pts = Array.from({ length: 7 }, (_, i) => {
      const t = i / 6
      const x = 40 + t * 200
      const y = 70 + spread * t * t + Math.sin(t * 3 + b) * 3
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    return { b, d: `M ${pts.join(' L ')}`, chosen: b === 2 }
  }),
)
</script>

<template>
  <div class="rp">
    <!-- REACTIVE ---------------------------------------------------------->
    <section class="rp__side" :class="{ 'is-on': props.stage >= 1 }">
      <h3 class="rp__h">Hoy: reactivo</h3>
      <svg viewBox="0 0 280 140" class="rp__svg">
        <g class="rp__loop">
          <circle cx="140" cy="70" r="46" class="rp__ring" />
          <g v-for="(n, i) in LOOP" :key="n.k">
            <circle
              :cx="140 + 46 * Math.cos((i / 3) * Math.PI * 2 - Math.PI / 2)"
              :cy="70 + 46 * Math.sin((i / 3) * Math.PI * 2 - Math.PI / 2)"
              r="6" class="rp__node"
            />
            <text
              :x="140 + 70 * Math.cos((i / 3) * Math.PI * 2 - Math.PI / 2)"
              :y="70 + 70 * Math.sin((i / 3) * Math.PI * 2 - Math.PI / 2) + 4"
              class="rp__label"
              text-anchor="middle"
            >{{ n.label }}</text>
          </g>
        </g>
      </svg>
      <p class="rp__p">
        Ve y actúa. No tiene ninguna noción de lo que <em>va a pasar</em> —
        sólo responde a lo que hay delante.
      </p>
    </section>

    <!-- PREDICTIVE -------------------------------------------------------->
    <section class="rp__side" :class="{ 'is-on': props.stage >= 2 }">
      <h3 class="rp__h">Siguiente: predictivo</h3>
      <svg viewBox="0 0 280 140" class="rp__svg">
        <circle cx="40" cy="70" r="6" class="rp__node rp__node--lang" />
        <path
          v-for="br in branches" :key="br.b"
          :d="br.d"
          class="rp__branch"
          :class="{ 'is-chosen': br.chosen && props.stage >= 3 }"
          :style="{ transitionDelay: props.stage >= 2 ? `${br.b * 70}ms` : '0ms' }"
        />
        <text x="40" y="52" class="rp__label" text-anchor="middle">ahora</text>
        <text x="248" y="34" class="rp__label" text-anchor="end">futuros imaginados</text>
      </svg>
      <p class="rp__p">
        Antes de mover, simula varios futuros y elige. El modelo del mundo es
        lo que le permite <em>equivocarse en su cabeza</em> en vez de en la mesa.
      </p>
    </section>

    <!-- the concrete anchor ------------------------------------------------>
    <footer class="rp__anchor" :class="{ 'is-on': props.stage >= 4 }">
      <span class="rp__anchork t-mono">ya está en LeRobot</span>
      <span class="rp__anchorv">
        <strong>VLA-JEPA</strong> — backbone Qwen3-VL + modelo del mundo V-JEPA2 + cabeza
        de acción flow-matching. El detalle revelador: el modelo del mundo se usa
        <strong>sólo durante el entrenamiento</strong>. Hoy sirve para aprender, todavía no para planear.
      </span>
    </footer>
  </div>
</template>

<style scoped>
.rp {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-5) var(--sp-7);
}
.rp__side {
  display: flex; flex-direction: column; gap: var(--sp-2);
  opacity: 0; translate: 0 14px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.rp__side.is-on { opacity: 1; translate: 0 0; }

.rp__h {
  margin: 0;
  font-size: var(--fs-h3);
  font-variation-settings: 'wght' 500;
  color: var(--text-primary);
}
.rp__svg { width: 100%; height: 140px; }

.rp__ring { fill: none; stroke: var(--accent-action-dim); stroke-width: 1.5; stroke-dasharray: 4 4; }
.rp__node { fill: var(--accent-action); }
.rp__node--lang { fill: var(--accent-lang); }
.rp__label { fill: var(--text-muted); font-size: 9px; font-family: 'Geist Mono Variable', monospace; }

.rp__branch {
  fill: none;
  stroke: var(--accent-lang);
  stroke-width: 1.5;
  stroke-dasharray: 3 4;
  opacity: 0.3;
  transition: opacity var(--d-step) var(--e-linear), stroke-width var(--d-step) var(--e-linear);
}
.rp__branch.is-chosen {
  opacity: 1;
  stroke-width: 2.5;
  stroke-dasharray: none;
}

.rp__p { margin: 0; font-size: var(--fs-body); color: var(--text-secondary); max-width: 42ch; }
.rp__p em { color: var(--text-primary); font-style: normal; font-variation-settings: 'wght' 600; }

.rp__anchor {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 14px;
  border-left: 2px solid var(--accent-lang);
  opacity: 0;
  translate: 0 12px;
  transition: opacity var(--d-step) var(--e-linear), translate var(--d-entry) var(--e-out-quart);
}
.rp__anchor.is-on { opacity: 1; translate: 0 0; }
.rp__anchork {
  font-size: var(--fs-micro);
  letter-spacing: var(--tr-micro);
  text-transform: uppercase;
  color: var(--accent-lang);
}
.rp__anchorv { font-size: var(--fs-body); color: var(--text-secondary); max-width: 92ch; }
.rp__anchorv strong { color: var(--text-primary); }
</style>

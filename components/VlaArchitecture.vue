<!--
  ACT 3 — the three components, assembled live.

  This is the deck's ONE authored moment. Everything else gets the plain 480ms
  rise; this slide gets the full motion budget, because it is the slide the
  audience should still be able to draw on a napkin a week later.

  Built up in the order that makes the architecture make sense:
    1  three camera views                      (the body's senses)
    2  a vision encoder turns them into tokens (SigLIP / DINOv2)
    3  the instruction, tokenized              (the language side)
    4  both streams meet in a PRETRAINED VLM   (the RT-2 insight lives here)
    5  an action expert turns hidden states into a chunk of joint targets
    6  the chunk executes and the loop closes
-->
<script setup lang="ts">
import { useTx } from '../lib/tx'
import { computed } from 'vue'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })

const CAMS = computed(() => [
  { k: 'top', label: t('c.arch.camTop') },
  { k: 'wrist', label: t('c.arch.camWrist') },
  { k: 'base', label: t('c.arch.camBase') },
])

const visionTokens = computed(() => Array.from({ length: 12 }, (_, i) => i))
const langTokens = computed(() => t('demo.instr2').split(' '))
const joints = ['θ1', 'θ2', 'θ3', 'θ4', 'θ5', 'grip']

const on = (n: number) => props.stage >= n
const { t } = useTx()
</script>

<template>
  <div class="va">
    <!-- INPUTS ------------------------------------------------------------->
    <div class="va__col va__col--in">
      <div class="va__group" :class="{ 'is-on': on(1) }">
        <span class="va__gtitle t-mono">{{ t('c.arch.cams') }}</span>
        <div class="va__cams">
          <div
            v-for="(c, i) in CAMS" :key="c.k"
            class="va__cam"
            :style="{ transitionDelay: on(1) ? `${i * 70}ms` : '0ms' }"
          >
            <span class="va__camlabel t-mono">{{ c.label }}</span>
          </div>
        </div>
      </div>

      <div class="va__group" :class="{ 'is-on': on(3) }">
        <span class="va__gtitle t-mono">{{ t('c.arch.instruction') }}</span>
        <div class="va__lang">
          <span
            v-for="(t, i) in langTokens" :key="t"
            class="va__ltok t-mono"
            :style="{ transitionDelay: on(3) ? `${i * 45}ms` : '0ms' }"
          >{{ t }}</span>
        </div>
      </div>
    </div>

    <!-- ENCODERS ----------------------------------------------------------->
    <div class="va__col va__col--enc">
      <div class="va__box va__box--action" :class="{ 'is-on': on(2) }">
        <span class="va__bname">{{ t('c.arch.visionName') }}</span>
        <span class="va__bwho t-mono">SigLIP · DINOv2</span>
        <div class="va__vtok">
          <i v-for="t in visionTokens" :key="t" :style="{ transitionDelay: on(2) ? `${t * 22}ms` : '0ms' }" />
        </div>
      </div>
    </div>

    <!-- BACKBONE ----------------------------------------------------------->
    <div class="va__col va__col--core">
      <div class="va__box va__box--lang va__box--tall" :class="{ 'is-on': on(4) }">
        <span class="va__bname">{{ t('c.arch.coreName') }}</span>
        <span class="va__bwho t-mono">PaliGemma · SmolVLM2 · Qwen-VL</span>
        <p class="va__bnote">{{ t('c.arch.coreNote') }}</p>
      </div>
    </div>

    <!-- ACTION HEAD -------------------------------------------------------->
    <div class="va__col va__col--head">
      <div class="va__box va__box--action" :class="{ 'is-on': on(5) }">
        <span class="va__bname">{{ t('c.arch.headName') }}</span>
        <span class="va__bwho t-mono">{{ t('c.arch.headWho') }}</span>
      </div>

      <div class="va__out" :class="{ 'is-on': on(6) }">
        <span class="va__gtitle t-mono">{{ t('c.arch.outTag') }}</span>
        <div class="va__joints">
          <span
            v-for="(j, i) in joints" :key="j"
            class="va__joint t-mono"
            :style="{ transitionDelay: on(6) ? `${i * 40}ms` : '0ms' }"
          >{{ j }}</span>
        </div>
        <span class="va__outnote t-caption">{{ t('c.arch.outNote') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.va {
  display: grid;
  grid-template-columns: 158px 146px 1fr 176px;
  gap: var(--sp-3);
  align-items: center;
}
.va__col { display: flex; flex-direction: column; gap: var(--sp-4); min-width: 0; }

.va__group,
.va__box,
.va__out {
  opacity: 0;
  translate: 0 16px;
  transition:
    opacity var(--d-step) var(--e-linear),
    translate var(--d-settle) var(--e-settle);
}
.va__group.is-on, .va__box.is-on, .va__out.is-on { opacity: 1; translate: 0 0; }

.va__gtitle {
  display: block;
  font-size: var(--fs-micro);
  letter-spacing: var(--tr-micro);
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 5px;
}

/* cameras */
.va__cams { display: flex; flex-direction: column; gap: 4px; }
.va__cam {
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--accent-action-tint);
  border-left: 2px solid var(--accent-action);
  display: flex; align-items: center; padding-left: 7px;
  opacity: 0;
  transition: opacity var(--d-step) var(--e-linear);
}
.va__group.is-on .va__cam { opacity: 1; }
.va__camlabel { font-size: var(--fs-micro); color: var(--text-secondary); }

/* language tokens */
.va__lang { display: flex; flex-wrap: wrap; gap: 3px; }
.va__ltok {
  font-size: var(--fs-micro);
  padding: 2px 5px;
  border-radius: var(--radius-sm);
  background: var(--accent-lang-tint);
  color: var(--accent-lang);
  opacity: 0;
  transition: opacity 0ms var(--e-linear);
}
.va__group.is-on .va__ltok { opacity: 1; }

/* boxes */
.va__box {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border-left: 2px solid var(--hairline);
  display: flex; flex-direction: column; gap: 2px;
}
.va__box--action { border-left-color: var(--accent-action); background: var(--accent-action-tint); }
.va__box--lang { border-left-color: var(--accent-lang); background: var(--accent-lang-tint); }
.va__box--tall { padding: var(--sp-4); gap: 4px; }

.va__bname { font-size: var(--fs-body); color: var(--text-primary); font-variation-settings: 'wght' 500; }
.va__bwho { font-size: var(--fs-micro); color: var(--text-muted); }
.va__bnote { margin: 6px 0 0; font-size: var(--fs-caption); line-height: 1.45; color: var(--text-secondary); max-width: 32ch; }

/* vision tokens */
.va__vtok { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; margin-top: 6px; }
.va__vtok i {
  height: 5px; border-radius: 1px; background: var(--accent-action);
  opacity: 0; transition: opacity 160ms var(--e-linear);
}
.va__box.is-on .va__vtok i { opacity: 0.75; }

/* output */
.va__joints { display: flex; flex-wrap: wrap; gap: 3px; }
.va__joint {
  font-size: var(--fs-micro);
  padding: 2px 5px;
  border-radius: var(--radius-sm);
  background: var(--accent-action-tint);
  color: var(--accent-action);
  opacity: 0;
  transition: opacity 0ms var(--e-linear);
}
.va__out.is-on .va__joint { opacity: 1; }
.va__outnote { display: block; margin-top: 5px; }
</style>

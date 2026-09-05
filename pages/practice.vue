<!--
  /practice — the rehearsal tool.
  ---------------------------------------------------------------------------
  Left:  the spoken monologue for the current slide.
  Right: the live slide, in an iframe.

  The two panes have INDEPENDENT language selectors, which is the whole point:
  you can rehearse the Spanish delivery while looking at the English slides, or
  the reverse. Nothing off-the-shelf does this — teleprompters are deck-agnostic
  and have no idea which slide you are on.

  The iframe is deliberate rather than importing Slidev's SlideWrapper /
  SlideContainer internals: those are private, carry no semver guarantee, and
  would need a hand-built ClicksContext. An iframe also isolates the slide's own
  keyboard handling from this page's.

  Sections join to slides by routeAlias, never by index, so reordering slides in
  slides.md can't silently desync the script.
-->
<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useNav } from '@slidev/client'
import { monologues, formatDuration, type Section } from '../lib/monologue'
import { LOCALES, LOCALE_LABEL, type Locale } from '../lib/locale'

const { slides } = useNav()

/** Independent language state for each pane — the reason this page exists. */
const scriptLang = ref<Locale>('es')
const slideLang = ref<Locale>('es')

const current = ref(1)

/** routeAlias for each slide number, taken from the deck itself. */
interface SlideMeta {
  slide?: {
    frontmatter?: { routeAlias?: string }
    /** Rendered speaker notes — the short stage cues, not the full script. */
    noteHTML?: string
  }
}

const aliases = computed(() =>
  slides.value.map((s) => (s.meta as SlideMeta)?.slide?.frontmatter?.routeAlias ?? ''),
)

const total = computed(() => slides.value.length)

/** The deck's own speaker notes for the current slide: the on-stage cues. */
const cueHtml = computed(
  () => (slides.value[current.value - 1]?.meta as SlideMeta)?.slide?.noteHTML ?? '',
)

const sections = computed(() => monologues[scriptLang.value])
const byAlias = computed(() => {
  const m = new Map<string, Section>()
  for (const s of sections.value) m.set(s.alias, s)
  return m
})

const currentAlias = computed(() => aliases.value[current.value - 1] ?? '')
const currentSection = computed(() => byAlias.value.get(currentAlias.value))
const nextSection = computed(() => byAlias.value.get(aliases.value[current.value] ?? ''))

/* --- coverage: which slides have no script yet ---------------------------- */
const missing = computed(() =>
  aliases.value.filter((a) => a && !byAlias.value.has(a)),
)

/* --- timing budget -------------------------------------------------------- */
const TALK_BUDGET = 50 * 60
const estimated = computed(() => sections.value.reduce((n, s) => n + s.estimate, 0))
const budgetPct = computed(() => Math.min(100, (estimated.value / TALK_BUDGET) * 100))
const overBudget = computed(() => estimated.value > TALK_BUDGET)

/** Cumulative estimated clock at the start of the current section. */
const elapsedTo = computed(() => {
  let n = 0
  for (let i = 0; i < current.value - 1; i++) {
    const s = byAlias.value.get(aliases.value[i] ?? '')
    if (s) n += s.estimate
  }
  return n
})

/* --- rehearsal timer ------------------------------------------------------ */
const running = ref(false)
const elapsed = ref(0)
let timer: number | undefined

function toggleTimer() {
  running.value = !running.value
}
function resetTimer() {
  running.value = false
  elapsed.value = 0
}
onMounted(() => {
  timer = window.setInterval(() => {
    if (running.value) elapsed.value += 1
  }, 1000)
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  if (timer) window.clearInterval(timer)
  window.removeEventListener('keydown', onKey)
})

/* --- navigation ----------------------------------------------------------- */
function go(n: number) {
  current.value = Math.max(1, Math.min(total.value || 1, n))
}
function onKey(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null
  if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { go(current.value + 1); e.preventDefault() }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { go(current.value - 1); e.preventDefault() }
  else if (e.key === ' ') { toggleTimer(); e.preventDefault() }
}

const base = import.meta.env.BASE_URL ?? '/'
/** `clicks=99` is clamped by Slidev to the slide's real maximum, so the preview
 *  always shows the fully built slide rather than an empty first frame. */
const slideSrc = computed(
  () => `${base}#/${current.value}?clicks=99&lang=${slideLang.value}`,
)

/** Pace: how the timer is tracking against this section's estimate. */
const pace = computed(() => {
  const est = currentSection.value?.estimate ?? 0
  if (!running.value && elapsed.value === 0) return 'idle'
  const target = elapsedTo.value + est
  if (elapsed.value > target + 20) return 'behind'
  if (elapsed.value < elapsedTo.value - 20) return 'ahead'
  return 'on'
})
</script>

<template>
  <div class="pr">
    <!-- ── header ──────────────────────────────────────────────────────── -->
    <header class="pr__bar">
      <a :href="`${'./'}`" class="pr__back t-mono">← deck</a>

      <div class="pr__nav">
        <button class="pr__btn" :disabled="current <= 1" @click="go(current - 1)">←</button>
        <span class="pr__pos t-mono">{{ current }} / {{ total }}</span>
        <button class="pr__btn" :disabled="current >= total" @click="go(current + 1)">→</button>
        <span class="pr__alias t-mono">{{ currentAlias || '—' }}</span>
      </div>

      <div class="pr__timer" :class="`is-${pace}`">
        <button class="pr__btn pr__btn--wide" @click="toggleTimer">
          {{ running ? 'pausa' : 'iniciar' }}
        </button>
        <span class="pr__clock t-mono">{{ formatDuration(elapsed) }}</span>
        <span class="pr__target t-mono">/ {{ formatDuration(elapsedTo + (currentSection?.estimate ?? 0)) }}</span>
        <button class="pr__btn" title="reiniciar" @click="resetTimer">⟲</button>
      </div>
    </header>

    <!-- ── panes ───────────────────────────────────────────────────────── -->
    <div class="pr__body">
      <!-- script -->
      <section class="pr__pane pr__pane--script">
        <div class="pr__panehead">
          <span class="pr__panetitle t-mono">monólogo</span>
          <div class="pr__langs">
            <button
              v-for="l in LOCALES" :key="l"
              class="pr__lang" :class="{ 'is-on': scriptLang === l }"
              @click="scriptLang = l"
            >{{ LOCALE_LABEL[l] }}</button>
          </div>
        </div>

        <div class="pr__scroll">
          <div v-if="currentSection" class="pr__section">
            <div class="pr__meta t-mono">
              <span>{{ currentSection.words }} palabras</span>
              <span>≈ {{ formatDuration(currentSection.estimate) }}</span>
              <span v-if="currentSection.target">
                objetivo {{ formatDuration(currentSection.target) }}
              </span>
              <span
                v-if="currentSection.target"
                class="pr__delta"
                :class="currentSection.estimate > currentSection.target ? 'is-over' : 'is-under'"
              >
                {{ currentSection.estimate > currentSection.target ? '+' : '−'
                }}{{ formatDuration(Math.abs(currentSection.estimate - currentSection.target)) }}
              </span>
            </div>
            <article class="pr__text" v-html="currentSection.html" />
          </div>

          <p v-else class="pr__empty">
            No hay monólogo para <code>{{ currentAlias || 'esta diapositiva' }}</code> en
            {{ LOCALE_LABEL[scriptLang] }}.<br />
            Añade una sección <code>## {{ currentAlias }}</code> en
            <code>monologue/{{ scriptLang }}.md</code>.
          </p>

          <div v-if="nextSection" class="pr__next">
            <span class="pr__nexttag t-mono">sigue · {{ nextSection.alias }}</span>
            <article class="pr__text pr__text--dim" v-html="nextSection.html" />
          </div>
        </div>
      </section>

      <!-- slide -->
      <section class="pr__pane pr__pane--slide">
        <div class="pr__panehead">
          <span class="pr__panetitle t-mono">diapositiva</span>
          <div class="pr__langs">
            <button
              v-for="l in LOCALES" :key="l"
              class="pr__lang" :class="{ 'is-on': slideLang === l }"
              @click="slideLang = l"
            >{{ LOCALE_LABEL[l] }}</button>
          </div>
        </div>

        <div class="pr__framewrap">
          <iframe :key="`${current}-${slideLang}`" :src="slideSrc" class="pr__frame" />
        </div>

        <!-- the deck's own speaker notes — what you glance at on stage -->
        <div class="pr__cues">
          <span class="pr__panetitle t-mono">notas del presentador</span>
          <div v-if="cueHtml" class="pr__cuebody" v-html="cueHtml" />
          <p v-else class="pr__cueempty t-mono">sin notas para esta diapositiva</p>
        </div>

        <!-- budget -->
        <div class="pr__budget">
          <div class="pr__bmeta t-mono">
            <span>total estimado {{ formatDuration(estimated) }}</span>
            <span :class="overBudget ? 'is-over' : 'is-under'">
              presupuesto {{ formatDuration(TALK_BUDGET) }}
            </span>
          </div>
          <div class="pr__bbar">
            <span class="pr__bfill" :class="{ 'is-over': overBudget }" :style="{ width: `${budgetPct}%` }" />
          </div>
          <p v-if="missing.length" class="pr__missing t-mono">
            sin monólogo ({{ LOCALE_LABEL[scriptLang] }}): {{ missing.join(' · ') }}
          </p>
        </div>
      </section>
    </div>

    <footer class="pr__foot t-mono">
      ← → cambia de diapositiva · espacio inicia y pausa el cronómetro
    </footer>
  </div>
</template>

<style scoped>
.pr {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Instrument Sans Variable', ui-sans-serif, system-ui, sans-serif;
}

/* header */
.pr__bar {
  display: flex; align-items: center; justify-content: space-between; gap: var(--sp-5);
  padding: 10px 18px; border-bottom: 1px solid var(--hairline);
  flex: none;
}
.pr__back { font-size: var(--fs-caption); color: var(--text-muted); text-decoration: none; }
.pr__back:hover { color: var(--accent-lang); }

.pr__nav { display: flex; align-items: center; gap: 9px; }
.pr__pos { font-size: var(--fs-small); color: var(--text-primary); }
.pr__alias { font-size: var(--fs-micro); color: var(--text-muted); margin-left: 6px; }

.pr__btn {
  min-width: 28px; height: 26px; padding: 0 8px;
  border: 1px solid var(--hairline); border-radius: var(--radius-sm);
  background: var(--surface-1); color: var(--text-secondary);
  font-size: var(--fs-caption); cursor: pointer;
  transition: border-color var(--d-micro) var(--e-out-cubic), color var(--d-micro) var(--e-out-cubic);
}
.pr__btn:hover:not(:disabled) { border-color: var(--accent-lang); color: var(--accent-lang); }
.pr__btn:disabled { opacity: 0.35; cursor: default; }
.pr__btn--wide { min-width: 62px; }

.pr__timer { display: flex; align-items: center; gap: 8px; }
.pr__clock { font-size: var(--fs-lead); font-variant-numeric: tabular-nums; }
.pr__target { font-size: var(--fs-caption); color: var(--text-muted); }
.pr__timer.is-behind .pr__clock { color: var(--signal-warn); }
.pr__timer.is-ahead .pr__clock { color: var(--accent-lang); }
.pr__timer.is-on .pr__clock { color: var(--signal-ok); }

/* panes */
.pr__body { display: grid; grid-template-columns: 1fr 1fr; flex: 1 1 auto; min-height: 0; }
.pr__pane { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.pr__pane--script { border-right: 1px solid var(--hairline); }

.pr__panehead {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 18px; border-bottom: 1px solid var(--hairline); flex: none;
}
.pr__panetitle {
  font-size: var(--fs-micro); letter-spacing: var(--tr-micro);
  text-transform: uppercase; color: var(--text-muted);
}
.pr__langs { display: flex; gap: 4px; }
.pr__lang {
  padding: 3px 9px; border-radius: var(--radius-sm);
  border: 1px solid transparent; background: none;
  color: var(--text-muted); font-size: var(--fs-caption); cursor: pointer;
  font-family: inherit;
  transition: color var(--d-micro) var(--e-out-cubic), border-color var(--d-micro) var(--e-out-cubic);
}
.pr__lang:hover { color: var(--text-secondary); }
.pr__lang.is-on { color: var(--accent-lang); border-color: var(--accent-lang); }

/* script */
.pr__scroll { flex: 1 1 auto; overflow-y: auto; padding: 18px 22px 40px; }
.pr__meta {
  display: flex; gap: var(--sp-4); flex-wrap: wrap;
  font-size: var(--fs-micro); color: var(--text-muted); margin-bottom: 14px;
}
.pr__delta.is-over { color: var(--signal-warn); }
.pr__delta.is-under { color: var(--signal-ok); }

.pr__text { font-size: 20px; line-height: 1.62; color: var(--text-primary); max-width: 60ch; }
.pr__text :deep(p) { margin: 0 0 0.9em; }
.pr__text :deep(strong) { color: var(--accent-action); font-variation-settings: 'wght' 600; }
.pr__text :deep(em) { color: var(--accent-lang); font-style: normal; }
.pr__text--dim { font-size: 16px; color: var(--text-muted); }
.pr__text--dim :deep(strong), .pr__text--dim :deep(em) { color: var(--text-secondary); }

.pr__empty { font-size: var(--fs-body); color: var(--text-muted); max-width: 54ch; }
.pr__empty code {
  font-family: 'Geist Mono Variable', monospace; font-size: 0.9em;
  color: var(--accent-lang); background: var(--accent-lang-tint);
  padding: 1px 4px; border-radius: var(--radius-sm);
}

.pr__next { margin-top: 28px; padding-top: 18px; border-top: 1px solid var(--hairline); }
.pr__nexttag {
  display: block; font-size: var(--fs-micro); letter-spacing: var(--tr-micro);
  text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;
}

/* slide pane */
.pr__framewrap { padding: 14px 18px 0; flex: none; }
.pr__frame {
  width: 100%; aspect-ratio: 16 / 9; border: 1px solid var(--hairline);
  border-radius: var(--radius-md); background: var(--bg-base);
}

.pr__cues {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 0 18px 14px;
  border-top: 1px solid var(--hairline);
  margin-top: 4px;
  padding-top: 12px;
}
.pr__cuebody {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin-top: 7px;
}
.pr__cuebody :deep(p) { margin: 0 0 0.7em; }
.pr__cuebody :deep(strong) { color: var(--accent-action); font-variation-settings: 'wght' 600; }
.pr__cuebody :deep(code) {
  font-family: 'Geist Mono Variable', monospace;
  color: var(--accent-lang);
}
.pr__cueempty { font-size: var(--fs-caption); color: var(--text-muted); margin: 7px 0 0; }

.pr__budget { padding: 0 18px 18px; }
.pr__bmeta { display: flex; justify-content: space-between; font-size: var(--fs-micro); color: var(--text-muted); margin-bottom: 5px; }
.pr__bmeta .is-over { color: var(--signal-warn); }
.pr__bmeta .is-under { color: var(--signal-ok); }
.pr__bbar { height: 3px; border-radius: 2px; background: var(--surface-3); overflow: hidden; }
.pr__bfill { display: block; height: 100%; background: var(--accent-lang); transition: width var(--d-entry) var(--e-out-quart); }
.pr__bfill.is-over { background: var(--signal-warn); }
.pr__missing { margin: 8px 0 0; font-size: var(--fs-micro); color: var(--signal-warn); word-break: break-word; }

.pr__foot {
  flex: none; padding: 7px 18px; border-top: 1px solid var(--hairline);
  font-size: var(--fs-micro); color: var(--text-muted);
}
</style>

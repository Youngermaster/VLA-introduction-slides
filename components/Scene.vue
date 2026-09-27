<!--
  <Scene name="vlaHero" />  — a canvas motion-graphics scene driven by clicks.

  The scene is a pure function of a playhead `t`. Each click moves the TARGET
  to the scene's next cue and the playhead runs there in real time, then stops:
  motion is punctuation tied to a keypress, never an idle loop. Pressing ←
  rewinds quickly to the previous cue, so a scene is always scrubbable in
  front of the room.

  Anywhere that is not the live slide — PDF export, overview thumbnails, the
  presenter's next-slide preview, reduced motion — the playhead snaps straight
  to the cue, so every click step exports as its finished state.

  Debug: ?scene_t=3.2 freezes every scene at that time; ?scene_snap shows
  each scene's finished state for the current click (screenshots).
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onSlideEnter, onSlideLeave, useNav, useSlideContext } from '@slidev/client'
import { scenes } from '../scenes'
import { W, H } from '../lib/scene/kit'
import { renderScene } from '../lib/scene/render'
import { clamp, outCubic } from '../lib/scene/math'
import { slideLocale } from '../lib/locale'

const props = withDefaults(defineProps<{
  name: string
  /** click offset, if the slide spends clicks before the scene starts */
  at?: number
  /** logical height; scenes are 1920 wide */
  height?: number
  /** string variant: `<v>_key` overrides `key` (one scene, several slides) */
  v?: string
}>(), { at: 0, height: H })

const def = scenes[props.name]
if (!def) console.error(`[Scene] no scene named "${props.name}" in scenes/`)

const { $clicks, $renderContext, $nav, $page } = useSlideContext()
const { isPrintMode } = useNav()
const el = ref<HTMLCanvasElement>()

const maxStage = def ? def.cues.length - 1 : 0
const stage = computed(() => clamp($clicks.value - props.at, 0, maxStage))
const cue = (s: number) => (def ? def.cues[s] : 0)

const debugQuery = (() => {
  if (typeof window === 'undefined') return new URLSearchParams()
  const q = [window.location.search.replace(/^\?/, ''), window.location.hash.split('?')[1] ?? ''].filter(Boolean).join('&')
  return new URLSearchParams(q)
})()
const debugT = debugQuery.has('scene_t') ? Number(debugQuery.get('scene_t')) : null
/** ?scene_snap: every scene jumps straight to its cue (screenshots, fit checks) */
const snap = debugQuery.has('scene_snap')

const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const isActive = () => $page.value === $nav.value.currentSlideNo
const isStatic = () =>
  reduced || snap || debugT !== null || isPrintMode.value || !['slide', 'presenter'].includes($renderContext.value)

let t = 0
let target = 0
let raf = 0
let last: number | null = null
let rewind: { from: number; to: number; start: number } | null = null
let freeTimer: ReturnType<typeof setTimeout> | undefined

function size() {
  const c = el.value
  if (!c) return
  const r = c.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  // At least 1920 wide so exports stay crisp; capped so a 5K display does not
  // allocate a 60 MB backing store per slide.
  const bw = Math.round(clamp(r.width * dpr, $renderContext.value === 'overview' ? 320 : 1920, 2880))
  const bh = Math.round((bw * props.height) / W)
  if (c.width !== bw || c.height !== bh) {
    c.width = bw
    c.height = bh
  }
}

function draw() {
  const c = el.value
  if (!c || !def) return
  if (c.width < 2) size()
  renderScene(c, props.name, debugT ?? t, stage.value, slideLocale.value, props.height, props.v)
}

function frame(now: number) {
  if (rewind) {
    const k = (now - rewind.start) / 450
    t = rewind.from + (rewind.to - rewind.from) * outCubic(k)
    if (k >= 1) {
      t = rewind.to
      rewind = null
    }
  }
  else {
    const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000)
    // Two quick clicks should not queue a long replay: catch up within ~1.5 s.
    const rate = Math.max(1, (target - t) / 1.5)
    t = Math.min(target, t + dt * rate)
  }
  last = now
  draw()
  if (rewind || t < target) raf = requestAnimationFrame(frame)
  else {
    raf = 0
    last = null
  }
}

function go() {
  const T = cue(stage.value)
  target = T
  if (isStatic() || !isActive()) {
    t = T
    draw()
    return
  }
  rewind = T < t ? { from: t, to: T, start: performance.now() } : null
  if (!raf) {
    last = null
    raf = requestAnimationFrame(frame)
  }
}

watch(stage, go)
watch(slideLocale, draw)

onSlideEnter(() => {
  clearTimeout(freeTimer)
  size()
  // Arriving forward replays the entrance; arriving backward (clicks already at
  // max) shows the finished state instead of replaying the whole scene.
  t = stage.value === 0 && !isStatic() ? 0 : cue(stage.value)
  go()
})

onSlideLeave(() => {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  rewind = null
  // Release the backing store once the exit transition is over; slides stay
  // mounted and 30 full-HD canvases add up.
  freeTimer = setTimeout(() => {
    if (!isActive() && el.value && $renderContext.value === 'slide' && !isPrintMode.value) {
      el.value.width = 1
      el.value.height = 1
    }
  }, 1200)
})

let onResize: (() => void) | undefined
onMounted(async () => {
  size()
  t = cue(stage.value)
  draw()
  // Canvas text needs the webfonts actually loaded, not just declared.
  try {
    await document.fonts.ready
    await Promise.all([
      document.fonts.load("700 40px 'Unbounded Variable'"),
      document.fonts.load("600 40px 'Instrument Sans Variable'"),
      document.fonts.load("500 40px 'Geist Mono Variable'"),
    ])
  }
  catch {}
  draw()
  onResize = () => {
    size()
    draw()
  }
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  clearTimeout(freeTimer)
  if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<template>
  <canvas
    ref="el"
    class="scene-canvas"
    :style="{ aspectRatio: `${W} / ${height}` }"
    :aria-label="name"
    role="img"
  />
</template>

<style scoped>
.scene-canvas {
  display: block;
  width: 100%;
  height: auto;
}
</style>

<!--
  <VideoSlot src="/video/demo-real.mp4" :label="$t('demovideo.placeholder')" />

  Drop the file into public/video/ and it plays; until then the slot shows a
  labelled placeholder, so a missing asset is obvious in rehearsal and never
  a black rectangle on stage. Plays when its slide is entered (muted, so the
  browser allows it) and pauses when you leave.
-->
<script setup lang="ts">
import { ref } from 'vue'
import { onSlideEnter, onSlideLeave, useNav } from '@slidev/client'

const props = withDefaults(defineProps<{ src: string; label: string; autoplay?: boolean; loop?: boolean }>(), {
  autoplay: true,
  loop: false,
})

const { isPrintMode } = useNav()
const el = ref<HTMLVideoElement>()
const missing = ref(false)
const base = import.meta.env.BASE_URL.replace(/\/$/, '')

onSlideEnter(() => {
  if (!props.autoplay || missing.value || isPrintMode.value || !el.value) return
  el.value.currentTime = 0
  el.value.play().catch(() => {})
})
onSlideLeave(() => el.value?.pause())
</script>

<template>
  <div class="vslot">
    <video
      v-show="!missing"
      ref="el"
      class="vslot__video"
      :src="`${base}${src}`"
      :loop="loop"
      muted
      playsinline
      controls
      preload="metadata"
      @error="missing = true"
    />
    <div v-if="missing" class="vslot__ph">
      <span class="t-mono">{{ label }}</span>
      <span class="t-mono vslot__path">public{{ src }}</span>
    </div>
  </div>
</template>

<style scoped>
.vslot { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.vslot__video { max-width: 100%; max-height: 100%; border-radius: var(--radius-md); background: #000; }
.vslot__ph {
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 100%;
  border: 1.5px dashed var(--hairline-strong);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: var(--fs-small);
  text-align: center;
  padding: 16px;
}
.vslot__path { color: var(--accent-action); font-size: var(--fs-caption); }
</style>

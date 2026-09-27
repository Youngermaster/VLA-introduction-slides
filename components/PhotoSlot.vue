<!--
  <PhotoSlot src="/images/so101-build.jpg" label="…" />
  Shows the photo once it exists in public/; a labelled placeholder until then.
-->
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ src: string; label: string }>()
const missing = ref(false)
const base = import.meta.env.BASE_URL.replace(/\/$/, '')
</script>

<template>
  <div class="pslot">
    <img v-if="!missing" :src="`${base}${src}`" alt="" class="pslot__img" @error="missing = true">
    <div v-else class="pslot__ph">
      <span class="t-mono">{{ label }}</span>
      <span class="t-mono pslot__path">public{{ src }}</span>
    </div>
  </div>
</template>

<style scoped>
.pslot { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.pslot__img { max-width: 100%; max-height: 420px; border-radius: var(--radius-md); object-fit: cover; }
.pslot__ph {
  width: 100%; min-height: 300px; border: 1.5px dashed var(--hairline-strong); border-radius: var(--radius-md);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  color: var(--text-secondary); font-size: var(--fs-small); text-align: center; padding: 16px;
}
.pslot__path { color: var(--accent-action); font-size: var(--fs-caption); }
</style>

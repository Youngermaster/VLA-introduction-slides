<!--
  Two columns. `ratio` is settable because a comparison and a figure+caption want
  very different splits. Content goes in the ::left:: and ::right:: MDC slots.
-->
<script setup lang="ts">
defineProps<{ ratio?: string }>()
</script>

<template>
  <div class="slidev-layout split" :style="{ gridTemplateColumns: ratio || '1fr 1fr' }">
    <div class="split__col"><slot name="left" /></div>
    <div class="split__col"><slot name="right" /></div>
  </div>
</template>

<style scoped>
.split {
  display: grid;
  gap: var(--sp-6);
  align-content: safe center;
  height: 100%;
}
.split__col { min-width: 0; }
.split__col :deep(h1) { margin-bottom: var(--sp-4); font-size: 38px; line-height: 1.1; }
.split__col :deep(li) { margin-bottom: 5px; font-size: var(--fs-small); line-height: 1.42; }
.split__col :deep(p) { margin-bottom: 6px; line-height: 1.45; }
.split__col :deep(pre) { margin: 0; }
</style>

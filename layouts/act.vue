<!--
  Chapter opener. The act number is deliberately NOT rendered as a "SECTION 01"
  eyebrow — a meta-label above a heading is the cheapest-looking thing a deck can
  do. The act is carried by a short rule in the accent instead, which reads as
  structure without claiming to be content.
-->
<script setup lang="ts">
defineProps<{ accent?: 'action' | 'lang' }>()
</script>

<template>
  <div class="slidev-layout act">
    <div class="act__rule" :class="`act__rule--${accent ?? 'action'}`" />
    <div class="act__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.act {
  display: flex;
  flex-direction: column;
  justify-content: safe center;
  height: 100%;
  text-align: left;
  padding-left: var(--sp-9);
}
.act__rule {
  width: 72px;
  height: 3px;
  border-radius: 2px;
  margin-bottom: var(--sp-6);
}
.act__rule--action { background: var(--accent-action); }
.act__rule--lang { background: var(--accent-lang); }

.act__body :deep(h1) {
  font-size: var(--fs-hero);
  line-height: var(--lh-hero);
  letter-spacing: var(--tr-hero);
  max-width: 18ch;
  margin-bottom: var(--sp-4);
}
.act__body :deep(p) {
  font-size: var(--fs-lead);
  line-height: var(--lh-lead);
  color: var(--text-secondary);
  max-width: 46ch;
}
</style>

<!-- One sentence, nothing else. Used for the turns in the argument. -->
<template>
  <div class="slidev-layout claim">
    <div class="claim__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.claim {
  display: flex;
  /* `safe center` rather than `center`: when the content is taller than the
     slide, plain centring overflows in BOTH directions and silently clips the
     top of the heading. `safe` falls back to flex-start instead. */
  align-items: safe center;
  justify-content: flex-start;
  height: 100%;
  text-align: left;
}
.claim__body {
  max-width: 46ch;
}
.claim__body :deep(h1) {
  font-size: 46px;
  line-height: 1.05;
  letter-spacing: var(--tr-h1);
  max-width: 24ch;
  margin-bottom: var(--sp-5);
}
.claim__body :deep(p) {
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  max-width: 62ch;
  color: var(--text-secondary);
}
</style>

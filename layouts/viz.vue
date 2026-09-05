<!--
  Title + a full-width visualization.
  Deliberately no named slots: MDC slot syntax adds a layer of indirection for
  no gain here, and plain flow is what survives a refactor. The h1 is styled
  down because on these slides the diagram is the argument, not the heading.
-->
<template>
  <div class="slidev-layout viz">
    <slot />
  </div>
</template>

<style scoped>
.viz {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.viz :deep(h1) {
  font-size: var(--fs-h2);
  line-height: var(--lh-h2);
  letter-spacing: var(--tr-h2);
  margin-bottom: var(--sp-4);
  max-width: 34ch;
  flex: none;
}
/* The visualization takes the remaining height and centres in it */
.viz :deep(> *:not(h1)) { flex: none; }
.viz :deep(.viz-fill) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  /* flex-start, not center: if the diagram is ever taller than the space left,
     centring makes it overflow UPWARD through the title. Anchoring to the top
     means a too-tall diagram is visibly clipped at the bottom instead, which is
     a bug you notice in rehearsal rather than one you discover on stage. */
  justify-content: flex-start;
}
</style>

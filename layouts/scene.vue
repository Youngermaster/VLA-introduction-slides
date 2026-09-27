<!--
  Full-bleed canvas scene. The scene draws its own title and captions, so the
  layout adds nothing: no padding, no heading styles — the canvas IS the slide.
  Anything else in the slot (a cite, a DOM overlay) is laid over it.
-->
<template>
  <div class="slidev-layout scene-layout">
    <slot />
  </div>
</template>

<style scoped>
.scene-layout.scene-layout {
  padding: 0;
  position: relative;
  height: 100%;
  overflow: hidden;
}
.scene-layout :deep(.scene-canvas) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>

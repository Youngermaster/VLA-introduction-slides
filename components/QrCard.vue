<!--
  Closing — QR codes that actually scan from the back of a room.

  Generated locally as inline SVG by the bundled `qrcode` package. No image
  service, no network: a QR slide that needs the internet to render is exactly
  the slide that fails at a venue with bad WiFi.

  Sizing note: error-correction level M with a generous quiet zone and pure
  white modules. A QR rendered in an accent colour on near-black is a QR that
  half the room's phones will refuse to read.
-->
<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import QRCode from 'qrcode'

const props = withDefaults(
  defineProps<{ url: string; label: string; sub?: string; size?: number }>(),
  { size: 132 },
)

const svg = ref('')

watchEffect(async () => {
  try {
    svg.value = await QRCode.toString(props.url, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: { dark: '#FFFFFF', light: '#0A0B0D' },
    })
  } catch {
    svg.value = ''
  }
})
</script>

<template>
  <div class="qr">
    <div class="qr__code" :style="{ width: `${size}px`, height: `${size}px` }" v-html="svg" />
    <div class="qr__meta">
      <span class="qr__label">{{ label }}</span>
      <span v-if="sub" class="qr__sub t-mono">{{ sub }}</span>
    </div>
  </div>
</template>

<style scoped>
.qr { display: flex; flex-direction: column; gap: 8px; }
.qr__code { border-radius: var(--radius-sm); overflow: hidden; }
.qr__code :deep(svg) { width: 100%; height: 100%; display: block; }
.qr__meta { display: flex; flex-direction: column; gap: 1px; }
.qr__label { font-size: var(--fs-small); color: var(--text-primary); font-variation-settings: 'wght' 500; }
.qr__sub { font-size: var(--fs-micro); color: var(--text-muted); word-break: break-all; }
</style>

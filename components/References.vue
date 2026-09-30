<!--
  The references slide: every paper and link the talk leans on, grouped.
  Kept as data here (not in the locales): titles and IDs don't translate.
  docs/RESEARCH.md has the facts each one supports.
-->
<script setup lang="ts">
type Ref = { t: string; a: string; id: string }
const groups: { h: string; items: Ref[] }[] = [
  {
    h: 'VLAs',
    items: [
      { t: 'RT-2', a: 'Brohan et al. 2023', id: 'arXiv:2307.15818' },
      { t: 'OpenVLA', a: 'Kim et al. 2024', id: 'arXiv:2406.09246' },
      { t: 'OpenVLA-OFT', a: 'Kim et al. 2025', id: 'arXiv:2502.19645' },
      { t: 'π0', a: 'Black et al. 2024', id: 'arXiv:2410.24164' },
      { t: 'FAST', a: 'Pertsch et al. 2025', id: 'arXiv:2501.09747' },
      { t: 'Real-Time Chunking', a: 'Black et al. 2025', id: 'arXiv:2506.07339' },
      { t: 'π0.5', a: 'Physical Intelligence 2025', id: 'arXiv:2504.16054' },
      { t: 'π0.7', a: 'Physical Intelligence 2026', id: 'arXiv:2604.15483' },
      { t: 'SmolVLA', a: 'Shukor et al. 2025', id: 'arXiv:2506.01844' },
      { t: 'GR00T N1', a: 'Bjorck et al. 2025', id: 'arXiv:2503.14734' },
      { t: 'Gemini Robotics 1.5', a: 'Google DeepMind 2025', id: 'arXiv:2510.03342' },
    ],
  },
  {
    h: 'Imitation, data, evaluation',
    items: [
      { t: 'ACT / ALOHA', a: 'Zhao et al. 2023', id: 'arXiv:2304.13705' },
      { t: 'Diffusion Policy', a: 'Chi et al. 2023', id: 'arXiv:2303.04137' },
      { t: 'Open X-Embodiment', a: 'OXE Collab. 2023', id: 'arXiv:2310.08864' },
      { t: 'DROID', a: 'Khazatsky et al. 2024', id: 'arXiv:2403.12945' },
      { t: 'Data scaling laws in IL', a: 'Lin et al. 2024', id: 'arXiv:2410.18647' },
      { t: 'LIBERO', a: 'Liu et al. 2023', id: 'arXiv:2306.03310' },
      { t: 'RoboArena', a: 'Atreya et al. 2025', id: 'arXiv:2506.18123' },
      { t: 'VLAs at ICLR 2026', a: 'M. Reuss 2025', id: 'mbreuss.github.io' },
    ],
  },
  {
    h: 'World models',
    items: [
      { t: 'V-JEPA 2', a: 'Assran et al. 2025', id: 'arXiv:2506.09985' },
      { t: 'DreamGen', a: 'Jang et al. 2025', id: 'arXiv:2505.12705' },
      { t: 'Cosmos Policy', a: 'Kim et al. 2026', id: 'arXiv:2601.16163' },
      { t: 'VLA-JEPA', a: 'Sun et al. 2026', id: 'arXiv:2602.10098' },
      { t: 'Veo world simulator', a: 'Google DeepMind 2025', id: 'arXiv:2512.10675' },
      { t: 'Fast-WAM', a: '2026', id: 'arXiv:2603.16666' },
    ],
  },
  {
    h: 'Code and models',
    items: [
      { t: 'LeRobot', a: 'Hugging Face', id: 'github.com/huggingface/lerobot' },
      { t: 'smolvla_base', a: 'Hugging Face', id: 'hf.co/lerobot/smolvla_base' },
      { t: 'SmolVLA blog', a: 'Hugging Face', id: 'hf.co/blog/smolvla' },
      { t: 'SO-100 docs', a: 'LeRobot', id: 'hf.co/docs/lerobot/so100' },
      { t: 'SO-ARM100 (SO-100 BOM)', a: 'TheRobotStudio', id: 'github.com/TheRobotStudio/SO-ARM100' },
      { t: 'OpenVLA 7B', a: 'model card', id: 'hf.co/openvla/openvla-7b' },
      { t: 'openpi (π0, π0.5)', a: 'Physical Intelligence', id: 'github.com/Physical-Intelligence/openpi' },
      { t: 'Isaac GR00T', a: 'NVIDIA', id: 'github.com/NVIDIA/Isaac-GR00T' },
    ],
  },
]
</script>

<template>
  <div class="refs">
    <section v-for="(g, gi) in groups" :key="g.h" class="refs__g">
      <h3 class="refs__h t-mono">{{ g.h }}</h3>
      <ul class="refs__l">
        <li v-for="r in g.items" :key="r.id" class="refs__i">
          <span class="refs__t">{{ r.t }} <span class="refs__a">· {{ r.a }}</span></span>
          <span class="refs__id t-mono">{{ r.id }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
/* doubled classes: the theme's h3 / ul / li rules are more specific than one */
.refs.refs { display: grid; grid-template-columns: 1.05fr 1fr 0.9fr 1.15fr; gap: 26px; }
.refs .refs__h.refs__h {
  font-family: 'Geist Mono Variable', monospace;
  font-size: 12px;
  line-height: 1.3;
  color: var(--accent-lang);
  margin: 0 0 10px;
  letter-spacing: 0.02em;
  font-variation-settings: 'wght' 500;
}
.refs ul.refs__l { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }
.refs li.refs__i { display: flex; flex-direction: column; line-height: 1.2; margin: 0; padding: 0; }
.refs li.refs__i::before, .refs li.refs__i::marker { content: none; display: none; }
.refs__t { font-size: 12px; color: var(--text-primary); font-variation-settings: 'wght' 560; }
.refs__a { font-size: 11px; color: var(--text-secondary); }
.refs__id { font-size: 10px; color: var(--text-muted); word-break: break-all; }
</style>

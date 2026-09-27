/**
 * The field is exploding: ICLR "Vision-Language-Action" submissions, then the
 * wall of models released in the last eighteen months.
 *
 *   arrive  title
 *   1       three columns rise with rolling counters: 1 → 9 → 164, "18×"
 *   2       the 2025–2026 model wall staggers in; LeRobot's policy count
 */
import { defineScene } from '../lib/scene/types'
import { C } from '../lib/scene/kit'
import { alpha, inOutCubic, lerp, outBack, outCubic, outExpo, presence, seg } from '../lib/scene/math'

const BASE_Y = 900
const MAX_H = 520
const BAR_W = 210
const BARS = [
  { x: 260, year: '2024', n: 1, t0: 1.8 },
  { x: 540, year: '2025', n: 9, t0: 2.1 },
  { x: 820, year: '2026', n: 164, t0: 2.5 },
] as const

// dates are release / paper dates from docs/RESEARCH.md
const MODELS = [
  ['π0.5', '2025·04'],
  ['SmolVLA', '2025·06'],
  ['EO-1', '2025·08'],
  ['X-VLA', '2025·10'],
  ['π*0.6', '2025·11'],
  ['GR00T N1.7', '2026·04'],
  ['π0.7', '2026·04'],
  ['MolmoAct2', '2026·05'],
  ['Gemini Robotics 2', '2026·07'],
] as const

export default defineScene({
  cues: [1.5, 5.0, 8.4],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)

    // ── columns ─────────────────────────────────────────────────────────
    const axisK = outExpo(seg(t, 1.6, 2.2))
    if (axisK > 0) {
      ctx.save()
      ctx.globalAlpha *= axisK
      K.line(110, BASE_Y, lerp(110, 930, axisK), BASE_Y, C.faint, 3)
      ctx.restore()
    }
    BARS.forEach((b, i) => {
      const k = outExpo(seg(t, b.t0, b.t0 + 1.4))
      if (k <= 0) return
      const hero = i === 2
      const h = Math.max(6, (b.n / 164) * MAX_H * k)
      ctx.fillStyle = hero ? C.action : alpha(C.paper, 0.85)
      ctx.fillRect(b.x - BAR_W / 2, BASE_Y - h, BAR_W, h)
      const n = Math.round(b.n * k)
      K.text(String(n), b.x, BASE_Y - h - 26, {
        size: hero ? 96 : 64, weight: 700, fam: 'display', color: hero ? C.action : C.paper, align: 'center', alpha: Math.min(1, k * 3),
      })
      K.text(b.year, b.x, BASE_Y + 48, { size: 28, weight: 500, fam: 'mono', color: C.dim, align: 'center', alpha: k })
      if (i === 0) K.text(L('rejected'), b.x, BASE_Y + 84, { size: 22, weight: 500, fam: 'mono', color: C.mute, align: 'center', alpha: outCubic(seg(t, 2.6, 3.0)) })
    })
    K.text(L('axis'), 110, 282, { size: 24, weight: 500, fam: 'mono', color: C.mute, alpha: outCubic(seg(t, 1.8, 2.3)) })

    // 18× jump: a curved arrow from the 2025 counter up to the 2026 one
    const jk = inOutCubic(seg(t, 3.7, 4.4))
    if (jk > 0) {
      const p0 = { x: 540, y: BASE_Y - (9 / 164) * MAX_H - 110 }
      const p2 = { x: 820 - BAR_W / 2 - 24, y: BASE_Y - MAX_H + 170 }
      const pc = { x: 580, y: p2.y - 20 }
      const pts = K.sample((u) => ({
        x: (1 - u) ** 2 * p0.x + 2 * (1 - u) * u * pc.x + u * u * p2.x,
        y: (1 - u) ** 2 * p0.y + 2 * (1 - u) * u * pc.y + u * u * p2.y,
      }), 40)
      const end = K.trace(pts, jk, { color: C.action, lw: 4, dash: [2, 12] })
      if (end && jk >= 1) K.arrow(end.x - 18, end.y + 2, end.x + 2, end.y, { color: C.action, lw: 4, head: 16 })
      const lk = outBack(seg(t, 4.2, 4.6))
      if (lk > 0) {
        ctx.save()
        ctx.translate(560, p2.y - 70)
        ctx.scale(0.7 + 0.3 * lk, 0.7 + 0.3 * lk)
        K.text(L('jump'), 0, 0, { size: 60, weight: 800, fam: 'display', color: C.action, align: 'center', alpha: Math.min(1, lk * 3) })
        ctx.restore()
      }
    }

    // ── model wall ──────────────────────────────────────────────────────
    const wallX = 1080
    const rightX = 1848
    const hk = presence(t, 5.1, Infinity, 0.4)
    K.fade(hk, () => K.label(L('wall'), wallX, 282, { color: C.mute }))
    MODELS.forEach(([name, date], i) => {
      const t0 = 5.3 + i * 0.13
      const k = outExpo(seg(t, t0, t0 + 0.5))
      if (k <= 0) return
      const y = 350 + i * 62
      ctx.save()
      ctx.globalAlpha *= Math.min(1, k * 2.5)
      ctx.translate((1 - k) * 60, 0)
      K.dot(wallX + 8, y - 13, 7, C.lang)
      K.text(name, wallX + 34, y, { size: 38, weight: 700, fam: 'display', color: C.paper })
      K.text(date, rightX, y, { size: 24, weight: 500, fam: 'mono', color: C.mute, align: 'right' })
      ctx.restore()
      if (i < MODELS.length - 1) {
        const lk = outCubic(seg(t, t0 + 0.2, t0 + 0.6))
        if (lk > 0) K.line(wallX + 34, y + 22, lerp(wallX + 34, rightX, lk), y + 22, alpha(C.paper, 0.08), 1.5)
      }
    })
    K.punch(L('lerobot'), t, 6.9, { x: wallX, y: 952, size: 36, maxW: 780 })

    K.fade(presence(t, 2.4), () => K.cite(L('cite')))
  },
})

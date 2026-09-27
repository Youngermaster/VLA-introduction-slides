/**
 * Behaviour cloning, visually.
 *
 *   arrive  a strip of recorded frames, the policy, empty axes
 *   1       one sample goes in; the policy predicts a chunk (dashed) against what
 *           the human did (solid); the gap between them is the loss
 *   2       training: the loss curve falls over 20k steps while the prediction
 *           closes onto the human's curve
 *   3       no reward, no trial and error: it copies
 */
import { defineScene } from '../lib/scene/types'
import { C, type Kit } from '../lib/scene/kit'
import { alpha, clamp, hash, inOutCubic, lerp, outBack, outCubic, outExpo, presence, seg } from '../lib/scene/math'

const P1 = 2.0
const P2 = 5.2
const P3 = 9.2

// layout
const STRIP = { x: 72, y: 270, w: 200, h: 104, gap: 18, n: 5 }
const MODEL = { x: 390, y: 400, w: 300, h: 300 }
const PLOT = { x: 860, y: 280, w: 980, h: 340 }
const LOSS = { x: 860, y: 720, w: 980, h: 150 }
const SAMPLE = 2

const human = (u: number) => 0.55 * Math.sin(u * Math.PI * 1.15 + 0.2) + 0.18 * Math.sin(u * 5.2)
const err = (u: number) => 0.42 * Math.sin(u * 3.1 + 1.3) + 0.22
const lossAt = (s: number) => 0.81 * Math.exp(-3.4 * s) + 0.03 + 0.035 * (hash(Math.floor(s * 60), 5) - 0.5) * Math.exp(-2.5 * s)

/** Training progress 0..1 over click 2. */
const trainK = (t: number) => inOutCubic(seg(t, P2 + 0.3, P3 - 0.5))

function frameThumb(K: Kit, x: number, y: number, w: number, h: number, i: number) {
  K.fillRR(x, y, w, h, 8, C.bg2)
  K.strokeRR(x, y, w, h, 8, C.faint, 2)
  const g = 0.2 + (i / (STRIP.n - 1)) * 0.6
  K.ctx.fillStyle = C.faint
  K.ctx.fillRect(x + 10, y + h - 22, w - 20, 3)
  K.ctx.fillStyle = C.action
  K.ctx.fillRect(x + w * 0.62, y + h - 44, 22, 22)
  // gripper, a little further along in each frame
  const gx = x + lerp(w * 0.2, w * 0.66, g)
  const gy = y + lerp(22, 42, Math.sin(g * Math.PI))
  K.line(gx, gy - 16, gx, gy, C.paper, 5)
  K.line(gx - 12, gy, gx + 12, gy, C.paper, 5)
  K.line(gx - 12, gy, gx - 12, gy + 14, C.paper, 4)
  K.line(gx + 12, gy, gx + 12, gy + 14, C.paper, 4)
}

export default defineScene({
  cues: [1.9, P2, P3, P3 + 2.2],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)

    // ── dataset strip ──────────────────────────────────────────────────
    K.fade(presence(t, 0.3, Infinity, 0.4), () => K.label(L('dataset'), STRIP.x, STRIP.y - 24, { color: C.dim }))
    for (let i = 0; i < STRIP.n; i++) {
      const k = outExpo(seg(t, 0.35 + i * 0.07, 0.85 + i * 0.07))
      if (k <= 0) continue
      const y = STRIP.y + i * (STRIP.h + STRIP.gap)
      const picked = i === SAMPLE && t > P1
      ctx.save()
      ctx.globalAlpha *= k * (picked ? 0.35 : 1)
      frameThumb(K, STRIP.x, y + (1 - k) * -30, STRIP.w, STRIP.h, i)
      ctx.restore()
    }
    // the sample: flies into the policy and dissolves into it
    const fly = inOutCubic(seg(t, P1 + 0.15, P1 + 0.75))
    if (t > P1 && fly < 1) {
      const sy = STRIP.y + SAMPLE * (STRIP.h + STRIP.gap)
      const x = lerp(STRIP.x, MODEL.x + MODEL.w / 2 - STRIP.w * 0.3, fly)
      const y = lerp(sy, MODEL.y + MODEL.h / 2 - STRIP.h * 0.3, fly)
      ctx.save()
      ctx.globalAlpha *= 1 - seg(fly, 0.7, 1)
      ctx.translate(x, y)
      ctx.scale(lerp(1, 0.6, fly), lerp(1, 0.6, fly))
      frameThumb(K, 0, 0, STRIP.w, STRIP.h, SAMPLE)
      K.strokeRR(0, 0, STRIP.w, STRIP.h, 8, C.action, 4)
      ctx.restore()
    }

    // ── the policy ─────────────────────────────────────────────────────
    const mk = outExpo(seg(t, 0.7, 1.3))
    if (mk > 0) {
      ctx.save()
      ctx.globalAlpha *= mk
      K.fillRR(MODEL.x, MODEL.y, MODEL.w, MODEL.h, 18, C.bg2)
      K.strokeRR(MODEL.x, MODEL.y, MODEL.w, MODEL.h, 18, C.faint, 2)
      // layers: light up bottom to top on each forward pass
      const pass = (t0: number) => seg(t, t0, t0 + 0.5)
      for (let i = 0; i < 6; i++) {
        const y = MODEL.y + MODEL.h - 50 - i * 40
        const fwd = pass(P1 + 0.75)
        const on = clamp((fwd * 7 - i) / 1.5) * (1 - clamp((fwd * 7 - i - 2) / 1.5))
        const tr = trainK(t)
        const flick = t > P2 && t < P3 ? 0.35 * Math.max(0, Math.sin(tr * 60 + i)) : 0
        K.fillRR(MODEL.x + 34, y, MODEL.w - 68, 16, 8, alpha(C.lang, 0.18 + 0.7 * Math.max(on, flick)))
      }
      K.text('π', MODEL.x + MODEL.w / 2, MODEL.y - 26, { size: 64, weight: 700, fam: 'display', color: C.lang, align: 'center' })
      K.label(L('policy'), MODEL.x + MODEL.w / 2, MODEL.y + MODEL.h + 44, { align: 'center', color: C.dim })
      ctx.restore()
      K.arrow(STRIP.x + STRIP.w + 24, MODEL.y + MODEL.h / 2, MODEL.x - 18, MODEL.y + MODEL.h / 2, { color: C.faint, k: mk })
      K.arrow(MODEL.x + MODEL.w + 18, MODEL.y + MODEL.h / 2, PLOT.x - 30, PLOT.y + PLOT.h / 2, { color: C.faint, k: mk })
    }

    // ── the action chunk: prediction vs human ──────────────────────────
    const ax = outCubic(seg(t, 0.9, 1.5))
    const px = (u: number) => PLOT.x + u * PLOT.w
    const py = (v: number) => PLOT.y + PLOT.h * 0.58 - v * (PLOT.h / 2) * 0.62
    K.fade(ax, () => {
      K.line(PLOT.x, PLOT.y + PLOT.h, PLOT.x + PLOT.w, PLOT.y + PLOT.h, alpha(C.paper, 0.25), 2)
      K.line(PLOT.x, PLOT.y, PLOT.x, PLOT.y + PLOT.h, alpha(C.paper, 0.25), 2)
      K.label(L('chunk'), PLOT.x, PLOT.y - 24, { color: C.dim })
      K.label('t + 0', PLOT.x, PLOT.y + PLOT.h + 34, { size: 22 })
      K.label('t + 49', PLOT.x + PLOT.w, PLOT.y + PLOT.h + 34, { size: 22, align: 'right' })
    })
    const humanK = outCubic(seg(t, P1 + 1.1, P1 + 1.7))
    const predK = outCubic(seg(t, P1 + 1.4, P1 + 2.1))
    const shadeK = outCubic(seg(t, P1 + 2.1, P1 + 2.6))
    const tk = trainK(t)
    const closing = (lossAt(tk) - 0.03) / 0.81
    const pred = (u: number) => human(u) + err(u) * clamp(closing)
    if (shadeK > 0) {
      ctx.save()
      ctx.beginPath()
      for (let i = 0; i <= 80; i++) ctx.lineTo(px(i / 80), py(human(i / 80)))
      for (let i = 80; i >= 0; i--) ctx.lineTo(px(i / 80), py(pred(i / 80)))
      ctx.closePath()
      ctx.fillStyle = alpha(C.warn, 0.22 * shadeK)
      ctx.fill()
      ctx.restore()
    }
    if (humanK > 0) K.trace(K.sample((u) => ({ x: px(u), y: py(human(u)) }), 80), humanK, { color: C.paper, lw: 5 })
    if (predK > 0) K.trace(K.sample((u) => ({ x: px(u), y: py(pred(u)) }), 80), predK, { color: C.action, lw: 5, dash: [14, 10] })
    // legend
    K.fade(humanK, () => {
      K.line(PLOT.x + PLOT.w - 360, PLOT.y - 34, PLOT.x + PLOT.w - 320, PLOT.y - 34, C.paper, 5)
      K.text(L('human'), PLOT.x + PLOT.w - 308, PLOT.y - 26, { size: 24, weight: 500, fam: 'mono', color: C.paper })
    })
    K.fade(predK, () => {
      K.line(PLOT.x + PLOT.w - 360, PLOT.y - 2, PLOT.x + PLOT.w - 320, PLOT.y - 2, C.action, 5, [10, 6])
      K.text(L('predicted'), PLOT.x + PLOT.w - 308, PLOT.y + 6, { size: 24, weight: 500, fam: 'mono', color: C.action })
    })
    if (shadeK > 0) {
      const v = lossAt(tk)
      K.text(`loss ${v.toFixed(2)}`, PLOT.x + 24, PLOT.y + 40, { size: 30, weight: 600, fam: 'mono', color: C.warn, alpha: shadeK })
    }

    // ── the loss curve over training ───────────────────────────────────
    const lk = outCubic(seg(t, P2, P2 + 0.4))
    if (lk > 0) {
      const lx = (s: number) => LOSS.x + s * LOSS.w
      const ly = (v: number) => LOSS.y + LOSS.h - (v / 0.9) * LOSS.h
      K.fade(lk, () => {
        K.line(LOSS.x, LOSS.y + LOSS.h, LOSS.x + LOSS.w, LOSS.y + LOSS.h, alpha(C.paper, 0.25), 2)
        K.line(LOSS.x, LOSS.y, LOSS.x, LOSS.y + LOSS.h, alpha(C.paper, 0.25), 2)
        K.label('loss', LOSS.x - 14, LOSS.y + 20, { align: 'right', size: 22 })
        K.label(L('steps'), LOSS.x, LOSS.y + LOSS.h + 34, { size: 22 })
        K.label(`${K.count(0, 20000, tk)}`, LOSS.x + LOSS.w, LOSS.y + LOSS.h + 34, { size: 22, align: 'right', color: C.paper })
      })
      K.trace(K.sample((s) => ({ x: lx(s), y: ly(lossAt(s)) }), 120), tk, { color: C.warn, lw: 4 })
      if (tk > 0) {
        const s = tk
        K.dot(lx(s), ly(lossAt(s)), 8 * outBack(seg(t, P2 + 0.3, P2 + 0.6)), C.warn)
      }
    }

    // ── the point ──────────────────────────────────────────────────────
    K.punch(L('punch'), t, P3 + 0.1, { y: 975, size: 44 })
    K.cite(L('cite'), presence(t, 0.3, Infinity, 0.4))
  },
})

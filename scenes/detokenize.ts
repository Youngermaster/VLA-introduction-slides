/**
 * The half nobody explains: from action tokens back to torque.
 *
 *   arrive   seven token IDs in a column, one per action dimension
 *   1        subtract the offset: each ID counts down into its bin (0..255)
 *   2        bin → [-1, 1] → de-normalised with the dataset's q01/q99 into mm and
 *            degrees; a histogram shows why percentiles and not min/max
 *   3        the numbers drive the arm: a servo dial turns; six deltas, one absolute gripper
 */
import { defineScene } from '../lib/scene/types'
import { C } from '../lib/scene/kit'
import { clamp, inOutCubic, lerp, outBack, outCubic, outExpo, presence, seg } from '../lib/scene/math'
import { arm } from '../lib/scene/robot'

const OFFSET = 31744
const DIMS = ['Δx', 'Δy', 'Δz', 'Δroll', 'Δpitch', 'Δyaw', 'grip'] as const
const BINS = [174, 49, 128, 140, 112, 131, 255]
const NORM = BINS.map((b) => (b / 255) * 2 - 1)
// q01 / q99 of the (illustrative) dataset: ±12 mm, ±10°
const RANGE = [12, 12, 12, 10, 10, 10, 1]
const UNIT = ['mm', 'mm', 'mm', '°', '°', '°', '']
const REAL = NORM.map((n, i) => n * RANGE[i])

const COLX = [290, 620, 890, 1150]
const ROW0 = 320
const DY = 88
const T_BIN = 2.4
const T_NORM = 4.6
const T_HIST = 5.5
const T_REAL = 6.9
const T_ARM = 8.3

const sign = (v: number, d: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(d)}`

export default defineScene({
  cues: [2.2, 4.4, 8.2, 11.2],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)

    // ── column headers ─────────────────────────────────────────────────
    const heads = [L('h_id'), L('h_bin'), '[-1, 1]', L('h_real')]
    const ops = [`− ${OFFSET}`, '÷ 255', '× q01·q99']
    const headT = [0.6, T_BIN - 0.1, T_NORM - 0.1, T_REAL - 0.1]
    heads.forEach((h, i) => K.fade(presence(t, headT[i]), () => K.label(h, COLX[i], ROW0 - 44, { color: i === 0 ? C.lang : i === 3 ? C.action : C.dim })))
    ops.forEach((o, i) => {
      const k = outExpo(seg(t, headT[i + 1], headT[i + 1] + 0.5))
      if (k <= 0) return
      const x0 = COLX[i] + 170
      K.fade(k, () => K.label(o, (x0 + COLX[i + 1] - 20) / 2, ROW0 - 86, { align: 'center', color: C.dim, size: 26 }))
      K.arrow(x0, ROW0 - 52, lerp(x0, COLX[i + 1] - 24, k), ROW0 - 52, { color: C.faint, lw: 2, head: 10 })
    })

    // ── rows ───────────────────────────────────────────────────────────
    DIMS.forEach((d, i) => {
      const y = ROW0 + i * DY
      const rk = seg(t, 0.5 + i * 0.07, 0.9 + i * 0.07)
      if (rk <= 0) return
      K.fade(clamp(rk * 3), () => K.text(d, 90, y + 36, { size: 36, weight: 500, fam: 'mono', color: C.paper }))

      // the value travels column to column, counting as it goes
      const k1 = inOutCubic(seg(t, T_BIN + i * 0.08, T_BIN + 0.9 + i * 0.08))
      const k2 = inOutCubic(seg(t, T_NORM + i * 0.08, T_NORM + 0.8 + i * 0.08))
      const k3 = inOutCubic(seg(t, T_REAL + i * 0.08, T_REAL + 0.8 + i * 0.08))
      const id = OFFSET + BINS[i]
      // ghosts left behind in earlier columns
      if (k1 > 0) K.fade(0.28, () => K.text(String(id), COLX[0] + 12, y + 36, { size: 34, weight: 500, fam: 'mono', color: C.lang }))
      if (k2 > 0) K.fade(0.28, () => K.text(String(BINS[i]), COLX[1], y + 36, { size: 34, weight: 500, fam: 'mono', color: C.dim }))
      if (k3 > 0) K.fade(0.28, () => K.text(sign(NORM[i], 2), COLX[2], y + 36, { size: 34, weight: 500, fam: 'mono', color: C.dim }))

      if (k1 <= 0) {
        K.chip(String(id), COLX[0], y, { size: 34, k: rk, h: 54, pad: 12 })
      }
      else if (k2 <= 0) {
        const v = Math.round(lerp(id, BINS[i], k1))
        K.text(String(v), lerp(COLX[0] + 12, COLX[1], k1), y + 36, { size: 34, weight: 500, fam: 'mono', color: C.paper })
      }
      else if (k3 <= 0) {
        const v = lerp(BINS[i], NORM[i], k2)
        K.text(k2 < 1 ? sign(v, k2 < 0.5 ? 0 : 2) : sign(NORM[i], 2), lerp(COLX[1], COLX[2], k2), y + 36, { size: 34, weight: 500, fam: 'mono', color: C.paper })
      }
      else {
        const last = i === DIMS.length - 1
        const v = lerp(NORM[i], REAL[i], k3)
        const txt = last ? (k3 < 1 ? v.toFixed(2) : L('open')) : `${sign(v, 1)} ${UNIT[i]}`
        K.text(txt, lerp(COLX[2], COLX[3], k3), y + 36, { size: 34, weight: 600, fam: 'mono', color: C.action })
      }

      // delta / absolute tags
      const tk = seg(t, T_ARM + 0.2 + i * 0.06, T_ARM + 0.5 + i * 0.06)
      if (tk > 0) {
        const last = i === DIMS.length - 1
        K.chip(last ? L('abs') : L('delta'), COLX[3] + 270, y + 6, {
          size: 22, h: 40, pad: 10, k: tk,
          bg: last ? C.actionDeep : '#1A1D22', fg: last ? C.action : C.dim,
        })
      }
    })

    // ── histogram: why percentiles ─────────────────────────────────────
    const hx = 1470
    const hy = 540
    const hw = 380
    const hk = seg(t, T_HIST, T_HIST + 1.0)
    const hOut = 1 - outCubic(seg(t, T_ARM, T_ARM + 0.5))
    if (hk > 0 && hOut > 0) {
      ctx.save()
      ctx.globalAlpha *= hOut
      K.words(L('hist'), hx, 250, { t, t0: T_HIST, size: 24, weight: 500, fam: 'mono', color: C.dim, maxW: hw + 40, lh: 1.3, ls: 0, stagger: 0.02 })
      const nb = 22
      for (let b = 0; b < nb; b++) {
        const u = b / (nb - 1)
        const h = 190 * Math.exp(-((u - 0.4) ** 2) / (2 * 0.12 ** 2))
        const k = outExpo(seg(hk, b / nb * 0.6, b / nb * 0.6 + 0.4))
        K.fillRR(hx + u * (hw * 0.78), hy - h * k, hw * 0.78 / nb - 5, h * k + 2, 3, C.paper)
      }
      // the one bad demo
      const ok = outBack(seg(t, T_HIST + 0.6, T_HIST + 1.0))
      K.fillRR(hx + hw - 14, hy - 26 * ok, 14, 26 * ok + 2, 3, C.warn)
      // min / max
      const mk = outCubic(seg(t, T_HIST + 1.0, T_HIST + 1.5))
      K.fade(mk, () => {
        K.line(hx - 6, hy + 14, hx - 6, 330, C.warn, 3, [6, 8])
        K.line(hx + hw, hy + 14, hx + hw, 330, C.warn, 3, [6, 8])
        K.label('min · max', hx + hw, 324, { align: 'right', color: C.warn })
      })
      // q01 / q99
      const qk = outCubic(seg(t, T_HIST + 1.5, T_HIST + 2.0))
      const q1 = hx + hw * 0.78 * 0.12
      const q9 = hx + hw * 0.78 * 0.7
      K.fade(qk, () => {
        K.line(q1, hy + 14, q1, 370, C.action, 4)
        K.line(q9, hy + 14, q9, 370, C.action, 4)
        K.label('q01 · q99', (q1 + q9) / 2, hy + 48, { align: 'center', color: C.action })
        K.words(L('hist_note'), hx, hy + 100, { t, t0: T_HIST + 1.6, size: 28, weight: 500, fam: 'sans', color: C.dim, maxW: hw, lh: 1.3, ls: 0 })
      })
      ctx.restore()
    }

    // ── servo dial + arm ───────────────────────────────────────────────
    const ak = outExpo(seg(t, T_ARM, T_ARM + 0.7))
    if (ak > 0) {
      const mv = inOutCubic(seg(t, T_ARM + 0.9, T_ARM + 2.4))
      ctx.save()
      ctx.globalAlpha *= ak
      ctx.translate(0, (1 - ak) * 40)
      // dial
      const dx = 1705
      const dy = 450
      const r = 118
      ctx.strokeStyle = C.faint
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(dx, dy, r, 0, Math.PI * 2)
      ctx.stroke()
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2
        K.line(dx + Math.cos(a) * (r - 18), dy + Math.sin(a) * (r - 18), dx + Math.cos(a) * (r - 4), dy + Math.sin(a) * (r - 4), i % 6 === 0 ? C.dim : C.faint, 3)
      }
      const a0 = -Math.PI / 2
      const a1 = a0 + mv * 0.9
      ctx.strokeStyle = C.action
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.arc(dx, dy, r + 16, a0, Math.max(a0 + 0.001, a1))
      ctx.stroke()
      K.line(dx, dy, dx + Math.cos(a1) * (r - 30), dy + Math.sin(a1) * (r - 30), C.paper, 8)
      K.dot(dx, dy, 16, C.action)
      K.label('STS3215', dx, dy + r + 62, { align: 'center', color: C.dim })
      // mini arm
      const s = 0.5
      const bx = 1790
      const by = 930
      ctx.save()
      ctx.translate(bx, by)
      ctx.scale(s, s)
      K.fillRR(-110, 0, 220, 22, 6, C.table)
      arm(K, { x: 0, y: 0 }, { x: lerp(-260, -200, mv), y: lerp(-250, -210, mv) }, { l1: 380, l2: 340, grip: 1 })
      ctx.restore()
      ctx.restore()
    }
    if (t > T_ARM + 1.8) K.punch(L('punch'), t, T_ARM + 1.9, { y: 975, size: 40 })

    K.fade(presence(t, 0.8), () => K.cite(L('cite')))
  },
})

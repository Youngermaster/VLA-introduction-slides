/**
 * VLAs vs the generalist models, as a real comparison first: two columns,
 * one row per difference. Only the last click shows how they combine, so
 * the room doesn't read "one goes with the other" before it has seen that
 * they are different things.
 *
 *   arrive  title, the two column headers
 *   1       rows: what goes in, what comes out, how fast
 *   2       rows: what it learns from, what a mistake costs
 *   3       the rows clear; the generalist writes a plan, hands one step to
 *           the VLA, the arm does it. Punch: WHAT vs HOW
 */
import { defineScene } from '../lib/scene/types'
import { C, H } from '../lib/scene/kit'
import { inOutCubic, lerp, outBack, outCubic, outExpo, path2, presence, seg } from '../lib/scene/math'
import { GRIP_DROP, arm, bottle } from '../lib/scene/robot'

const LX = 110 // row labels
const GX = 420 // generalist column
const VX = 1160 // VLA column
const CW = 640
const ROW0 = 430
const ROWH = 100

export default defineScene({
  cues: [2.0, 5.0, 7.4, 11.4],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)

    // ── column headers (they stay for the whole slide) ─────────────────
    const hk = (d: number) => outExpo(seg(t, 0.3 + d, 0.9 + d))
    K.fade(hk(0), () => {
      K.text(L('g'), GX, 300, { size: 44, weight: 800, fam: 'display', color: C.lang })
      K.text(L('gex'), GX, 346, { size: 22, weight: 500, fam: 'mono', color: C.mute })
    })
    K.fade(hk(0.15), () => {
      K.text(L('v'), VX, 300, { size: 44, weight: 800, fam: 'display', color: C.action })
      K.text(L('vex'), VX, 346, { size: 22, weight: 500, fam: 'mono', color: C.mute })
    })
    const rule = outCubic(seg(t, 0.6, 1.4))
    if (rule > 0) {
      K.line(GX, 372, GX + CW * rule, 372, C.lang, 3)
      K.line(VX, 372, VX + CW * rule, 372, C.action, 3)
    }

    // ── the comparison rows ────────────────────────────────────────────
    const rowsOut = 1 - outCubic(seg(t, 7.5, 7.9))
    const rows = [
      { k: 'r1', t0: 2.1 },
      { k: 'r2', t0: 2.8 },
      { k: 'r3', t0: 3.5 },
      { k: 'r4', t0: 5.1 },
      { k: 'r5', t0: 5.9 },
    ]
    if (rowsOut > 0) {
      K.fade(rowsOut, () => {
        rows.forEach((r, i) => {
          const y = ROW0 + i * ROWH
          const lk = outCubic(seg(t, r.t0, r.t0 + 0.4))
          if (lk <= 0) return
          if (i > 0) K.line(LX, y - 52, VX + CW, y - 52, C.rail, 1.5)
          K.text(L(r.k), LX, y, { size: 24, weight: 500, fam: 'mono', color: C.mute, alpha: lk })
          K.words(L(`${r.k}g`), GX, y, { t, t0: r.t0 + 0.1, size: 30, weight: 500, fam: 'sans', ls: 0, color: C.paper, accent: C.lang, maxW: CW, lh: 1.2, stagger: 0.02 })
          K.words(L(`${r.k}v`), VX, y, { t, t0: r.t0 + 0.35, size: 30, weight: 500, fam: 'sans', ls: 0, color: C.paper, accent: r.k === 'r5' ? C.warn : C.action, maxW: CW, lh: 1.2, stagger: 0.02 })
        })
      })
    }

    // ── 3 · how they combine ───────────────────────────────────────────
    if (t > 7.8) {
      K.words(L('combine'), LX, 450, { t, t0: 7.9, size: 44, weight: 700, fam: 'display', maxW: 1700, accent: C.paper })

      // the generalist writes a plan
      const gk = outBack(seg(t, 8.2, 8.6))
      K.chip(L('goal'), GX, 500, { size: 30, k: gk, fam: 'sans', weight: 600 })
      const subs = [L('sub1'), L('sub2'), L('sub3')]
      subs.forEach((s, i) => {
        const tk = seg(t, 8.6 + i * 0.3, 8.9 + i * 0.3)
        if (tk <= 0) return
        const y = 610 + i * 50
        K.text(`${i + 1}`, GX, y, { size: 26, weight: 500, fam: 'mono', color: C.lang })
        K.text(K.typed(s, tk), GX + 34, y, { size: 30, weight: 500, fam: 'sans', color: i === 0 ? C.paper : C.dim })
      })

      // step 1 is handed to the VLA
      const hand = inOutCubic(seg(t, 9.6, 10.1))
      if (hand > 0) {
        const x0 = GX + 34 + K.measure(subs[0], 30, 500, 'sans') + 24
        const y0 = 600
        const x1 = VX - 20
        const pts = K.sample((u) => ({ x: lerp(x0, x1, u), y: y0 - Math.sin(u * Math.PI) * 60 }), 40)
        K.trace(pts, hand, { color: C.lang, lw: 3, dash: [10, 10] })
        if (hand >= 1) K.dot(x1, y0, 8, C.lang)
      }

      // …and the VLA does it
      const ak = outExpo(seg(t, 9.8, 10.3))
      if (ak > 0) {
        const reach = seg(t, 10.1, 11.3)
        const base = { x: VX + 520, y: 830 }
        ctx.save()
        ctx.globalAlpha *= ak
        ctx.translate(base.x, base.y)
        ctx.scale(0.5, 0.5)
        const grab = 0.55
        const w = path2(reach, [[0, -150, -440], [grab, -520, -70 - GRIP_DROP], [0.62, -520, -70 - GRIP_DROP], [1, -380, -420]])
        const carried = reach > 0.62
        const bx = carried ? w.x : -520
        const by = carried ? w.y + GRIP_DROP + 70 : 0
        bottle(K, bx, by, 1)
        arm(K, { x: 0, y: 0 }, w, { l1: 400, l2: 380, grip: reach > grab ? 0.72 : 1 })
        ctx.restore()
        K.line(VX, base.y, VX + CW, base.y, C.faint, 3)
      }

      K.punch(L('punch'), t, 10.4, { y: 950, size: 42 })
      K.words(L('tools'), LX, 1000, { t, t0: 10.9, size: 26, weight: 500, fam: 'sans', ls: 0, color: C.dim, accent: C.lang, maxW: 1700, stagger: 0.012 })
    }

    K.fade(presence(t, 2.2) * (1 - seg(t, 10.2, 10.4)), () => K.cite(L('cite')))
    void H
  },
})

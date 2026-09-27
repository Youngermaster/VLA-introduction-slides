/**
 * From continuous motion to tokens.
 *
 *   arrive   title, empty plot
 *   1        one joint over one second draws as a curve; a mini arm moves in sync
 *   2        sampled at 30 Hz: dots drop onto the curve
 *   3        quantised into bins: dots snap, a staircase forms, each step gets a token ID
 *   4        two better ways: FAST (DCT, like JPEG) and flow matching (no tokens)
 *
 * The plot shows 24 bin lines, not 256: at projector scale 256 lines are a grey
 * wash. The label says so.
 */
import { defineScene } from '../lib/scene/types'
import { C, W } from '../lib/scene/kit'
import { alpha, clamp, hash, inOutCubic, lerp, outBack, outCubic, outExpo, presence, seg } from '../lib/scene/math'
import { arm } from '../lib/scene/robot'

// plot rectangle
const PX = 190
const PY = 300
const PW = 1060
const PH = 460
const MID = PY + PH / 2
const N = 30 // 30 Hz × 1 s
const SHOWN_BINS = 24

/** The joint's normalised angle over one second, in [-1, 1]. */
const joint = (u: number) => 0.62 * Math.sin(Math.PI * (u * 1.25 - 0.18)) + 0.2 * Math.sin(2 * Math.PI * 2.1 * u + 0.4)
const px = (u: number) => PX + u * PW
const py = (v: number) => MID - v * (PH / 2) * 0.92
const bin256 = (v: number) => Math.round(((clamp(v, -1, 1) + 1) / 2) * 255)
const snapShown = (v: number) => {
  const step = 2 / SHOWN_BINS
  return clamp(Math.round((v + 1) / step) * step - 1, -1, 1)
}

// timings
const T_CURVE = [2.2, 4.4] as const
const T_DROP = 4.8
const T_SNAP = [7.3, 8.3] as const
const T_IDS = 8.4
const T_ALT = 10.6

export default defineScene({
  cues: [2.0, 4.6, 6.8, 10.0, 13.6],
  draw({ t, L, K, ctx }) {
    const out4 = 1 - outCubic(seg(t, T_ALT, T_ALT + 0.5))

    K.title(L('title'), t)

    // ── plot frame ─────────────────────────────────────────────────────
    K.fade(out4, () => {
      const ax = outExpo(seg(t, 0.4, 1.4))
      K.line(PX, PY + PH, PX + PW * ax, PY + PH, C.faint, 3)
      K.line(PX, PY + PH, PX, PY + PH - PH * ax, C.faint, 3)
      K.fade(presence(t, 0.9), () => {
        K.label(L('axis_t'), PX + PW, PY + PH + 44, { align: 'right' })
        K.label(L('axis_a'), PX - 20, PY - 22, { align: 'left' })
      })

      // bins (stage 3): horizontal lines appear top to bottom
      if (t > T_SNAP[0] - 0.8) {
        for (let b = 0; b <= SHOWN_BINS; b++) {
          const v = -1 + (2 * b) / SHOWN_BINS
          const k = outExpo(seg(t, T_SNAP[0] - 0.8 + b * 0.02, T_SNAP[0] - 0.4 + b * 0.02))
          if (k <= 0) continue
          K.line(PX, py(v), PX + PW * k, py(v), alpha(C.lang, 0.22), 1.5)
        }
        K.fade(presence(t, T_SNAP[0] - 0.3), () => K.label(L('bins'), PX + PW + 24, py(1) + 8, { color: C.lang }))
      }

      // the curve
      const ck = inOutCubic(seg(t, T_CURVE[0], T_CURVE[1]))
      const dimCurve = lerp(1, 0.3, outCubic(seg(t, T_DROP, T_DROP + 0.6)))
      ctx.save()
      ctx.globalAlpha *= dimCurve
      const end = K.trace(K.sample((u) => ({ x: px(u), y: py(joint(u)) }), 120), ck, { color: C.action, lw: 6 })
      ctx.restore()
      if (ck > 0 && ck < 1 && end) K.dot(end.x, end.y, 12, C.action)

      // samples → snapped staircase
      const snapK = inOutCubic(seg(t, T_SNAP[0], T_SNAP[1]))
      const pts: { x: number; y: number }[] = []
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1)
        const v = joint(u)
        const vs = lerp(v, snapShown(v), snapK)
        const dk = seg(t, T_DROP + i * 0.05, T_DROP + i * 0.05 + 0.35)
        pts.push({ x: px(u), y: py(vs) })
        if (dk <= 0) continue
        const y = lerp(PY - 60, py(vs), outBack(dk, 1.2))
        K.fade(clamp(dk * 4), () => K.dot(px(u), y, 9, C.paper))
      }
      // staircase
      const sk = outCubic(seg(t, T_SNAP[1] - 0.2, T_SNAP[1] + 0.5))
      if (sk > 0) {
        const stair: { x: number; y: number }[] = []
        pts.forEach((p, i) => {
          if (i > 0) stair.push({ x: p.x, y: pts[i - 1].y })
          stair.push(p)
        })
        K.trace(stair, sk, { color: C.paper, lw: 3 })
      }

      // token ids for the first samples
      if (t > T_IDS) {
        const show = 12
        for (let i = 0; i < show; i++) {
          const k = seg(t, T_IDS + i * 0.07, T_IDS + i * 0.07 + 0.3)
          if (k <= 0) continue
          const id = 31744 + bin256(joint(i / (N - 1)))
          K.chip(String(id), PX + i * 96, PY + PH + 86, { size: 24, k, h: 44, pad: 10 })
        }
        K.fade(presence(t, T_IDS + 0.9), () => K.text('…', PX + 12 * 96 + 8, PY + PH + 120, { size: 36, color: C.lang, fam: 'mono' }))
      }
    })

    // ── mini arm, in sync with the curve ───────────────────────────────
    K.fade(out4 * outExpo(seg(t, 0.8, 1.6)), () => {
      const ck = seg(t, T_CURVE[0], T_CURVE[1])
      const u = inOutCubic(ck)
      const v = joint(u)
      const bx = 1560
      const by = 790
      const s = 0.72
      const th = -Math.PI / 2 + 0.25 - v * 0.9 // shoulder angle follows the joint
      const l1 = 380
      const l2 = 340
      const sh = { x: 0, y: -96 }
      const el = { x: sh.x + l1 * Math.cos(th), y: sh.y + l1 * Math.sin(th) }
      const wr = { x: el.x + l2 * Math.cos(th + 1.9), y: el.y + l2 * Math.sin(th + 1.9) }
      ctx.save()
      ctx.translate(bx, by)
      ctx.scale(s, s)
      K.fillRR(-220, 0, 440, 22, 6, C.table)
      arm(K, { x: 0, y: 0 }, wr, { l1, l2, grip: 0.7 })
      // the joint being plotted: an amber ring on the shoulder
      ctx.strokeStyle = C.action
      ctx.lineWidth = 10
      ctx.beginPath()
      ctx.arc(sh.x, sh.y, 58, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
      K.fade(presence(t, 1.2), () => K.label(L('joint'), bx, by + 64, { align: 'center', color: C.action }))
    })

    // ── stage captions ─────────────────────────────────────────────────
    K.fade(presence(t, 2.3, 4.7) * out4, () => K.punch(L('p1'), t, 2.4, { y: 975, size: 38, tout: 4.7 }))
    K.fade(presence(t, 4.9, 7.1) * out4, () => K.punch(L('p2'), t, 5.0, { y: 975, size: 38, tout: 7.1 }))
    K.fade(out4, () => {
      if (t > 7.3) K.punch(L('p3'), t, 9.2, { y: 975, size: 38, tout: T_ALT - 0.1 })
    })

    // ── stage 4: two better ways ───────────────────────────────────────
    if (t > T_ALT) {
      const colW = 800
      const lx = 90
      const rx = 1030
      const top = 290

      // FAST
      K.fade(presence(t, T_ALT + 0.3), () => {
        K.text('FAST', lx, top + 20, { size: 64, weight: 700, fam: 'display', color: C.lang })
        K.text(L('fast_sub'), lx, top + 76, { size: 32, weight: 500, color: C.dim })
      })
      const bars = 16
      for (let i = 0; i < bars; i++) {
        const mag = Math.exp(-i * 0.42) * (0.9 + 0.2 * hash(i, 3))
        const k = outExpo(seg(t, T_ALT + 0.5 + i * 0.04, T_ALT + 0.9 + i * 0.04))
        const kept = i < 5
        const drop = outCubic(seg(t, T_ALT + 1.4, T_ALT + 1.9))
        const a = kept ? 1 : lerp(1, 0.18, drop)
        const h = 240 * mag * k
        const x = lx + i * (colW / bars)
        K.fade(a, () => K.fillRR(x, top + 390 - h, colW / bars - 14, h, 4, kept ? C.lang : C.mute))
      }
      K.fade(presence(t, T_ALT + 1.0), () => K.label(L('fast_freq'), lx, top + 432))
      K.fade(presence(t, T_ALT + 1.9), () => {
        const k = seg(t, T_ALT + 1.9, T_ALT + 2.7)
        K.text(`700 → ${K.count(700, 53, k)}`, lx, top + 540, { size: 72, weight: 700, fam: 'display', color: C.paper })
        K.text(L('fast_note'), lx, top + 590, { size: 28, weight: 500, color: C.mute })
      })

      // divider
      K.fade(presence(t, T_ALT + 0.4), () => K.line(W / 2 + 20, top - 20, W / 2 + 20, top + 620, C.faint, 2))

      // flow matching
      K.fade(presence(t, T_ALT + 0.6), () => {
        K.text(L('flow'), rx, top + 20, { size: 64, weight: 700, fam: 'display', color: C.action })
        K.text(L('flow_sub'), rx, top + 76, { size: 32, weight: 500, color: C.dim })
      })
      const stepK = seg(t, T_ALT + 1.1, T_ALT + 2.7)
      const stepN = Math.round(stepK * 10)
      const noise = 1 - stepN / 10
      const fy = top + 270
      const pts = K.sample((u) => {
        // smooth value noise: interpolated knots plus a little grain
        const f = u * 14
        const i0 = Math.floor(f)
        const sm = (f - i0) * (f - i0) * (3 - 2 * (f - i0))
        const knot = lerp(hash(i0, 11), hash(i0 + 1, 11), sm) - 0.5
        const n = (knot * 2 * 110 + (hash(Math.round(u * 60), 12) - 0.5) * 36) * noise
        return { x: rx + u * colW, y: fy - joint(u) * 120 + n }
      }, 60)
      K.fade(presence(t, T_ALT + 0.9), () => {
        K.trace(pts, 1, { color: noise > 0.05 ? C.mute : C.action, lw: 5 })
        K.label(`${L('step')} ${stepN} / 10`, rx, top + 432, { color: stepN === 10 ? C.action : C.mute })
      })
      K.fade(presence(t, T_ALT + 2.5), () => {
        K.text(L('flow_big'), rx, top + 540, { size: 72, weight: 700, fam: 'display', color: C.paper })
        K.text('π0 · SmolVLA · GR00T', rx, top + 590, { size: 28, weight: 500, fam: 'sans', color: C.mute })
      })
    }

    K.fade(presence(t, 0.6) * out4, () => K.cite(L('cite1')))
    K.fade(presence(t, T_ALT + 0.4), () => K.cite(L('cite2')))
  },
})

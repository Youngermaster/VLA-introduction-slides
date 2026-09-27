/**
 * Predict a block, not a step.
 *
 *   arrive   title and two empty lanes (time runs left to right)
 *   1        top lane: one step per inference. The arm stops while the model
 *            thinks (cyan), then lurches to a slightly-wrong next point. Stutter.
 *   2        bottom lane: one inference returns 50 future actions (amber dots);
 *            motion between inferences is smooth, but it still pauses at the seam
 *   3        real-time chunking: chunk k+1 is computed while chunk k executes;
 *            the overlap is blended and the pause disappears
 */
import { defineScene } from '../lib/scene/types'
import { C, W } from '../lib/scene/kit'
import { alpha, clamp, hash, inOutCubic, lerp, outCubic, outExpo, presence, seg } from '../lib/scene/math'
import { arm } from '../lib/scene/robot'

const X0 = 120
const X1 = 1380
const LANE = [{ y: 290, h: 190 }, { y: 660, h: 190 }] as const
const D = 3.2 // seconds of robot time shown per lane

/** The motion the task needs, in [-1, 1] over the lane. */
const goal = (u: number) => 0.95 * Math.sin(Math.PI * (1.2 * u - 0.15))

// ── top lane: think 0.18 s, move 0.22 s, repeat ────────────────────────
const P = 0.4
const THINK = 0.18
function stepwise(tau: number) {
  const n = Math.floor(tau / P)
  const f = tau - n * P
  const target = (k: number) => (k <= 0 ? goal(0) : goal(clamp((k * P) / D)) + (hash(k, 5) - 0.5) * 0.42)
  if (f < THINK) return target(n)
  return lerp(target(n), target(n + 1), inOutCubic((f - THINK) / (P - THINK)))
}

// ── bottom lane: synchronous chunks, then RTC ──────────────────────────
// sync:  think [0, .3] exec [.3, 1.6] think [1.6, 1.9] exec [1.9, 3.2]
// rtc:   the second think moves under the end of chunk 1; the pause closes
function chunked(tau: number, m: number) {
  const pause = 0.3 * (1 - m)
  const e1 = [0.3, 1.6] as const
  const e2 = [1.6 + pause, D] as const
  // progress along the goal: chunk 1 covers u in [0, 0.5], chunk 2 [0.5, 1]
  if (tau < e1[0]) return goal(0)
  if (tau < e1[1]) return goal(0.5 * seg(tau, e1[0], e1[1]))
  if (tau < e2[0]) return goal(0.5)
  return goal(0.5 + 0.5 * seg(tau, e2[0], e2[1]))
}

const T1 = [1.9, 5.1] as const
const T2 = [5.6, 8.8] as const
const T3 = [9.2, 10.6] as const

export default defineScene({
  cues: [1.8, 5.4, 9.0, 12.4],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)

    const vy = (lane: number, v: number) => LANE[lane].y + LANE[lane].h / 2 - v * (LANE[lane].h / 2) * 0.9
    const vx = (tau: number) => X0 + (tau / D) * (X1 - X0)

    // lane frames + labels
    LANE.forEach((ln, i) => {
      const k = outExpo(seg(t, 0.4 + i * 0.15, 1.3 + i * 0.15))
      K.line(X0, ln.y + ln.h + 16, X0 + (X1 - X0) * k, ln.y + ln.h + 16, C.faint, 3)
      K.fade(presence(t, 0.6 + i * 0.15), () => {
        K.text(L(i === 0 ? 'lane1' : 'lane2'), X0, ln.y - 34, { size: 36, weight: 600, color: C.paper })
      })
      // the goal, faint
      K.fade(0.22 * k, () => K.trace(K.sample((u) => ({ x: vx(u * D), y: vy(i, goal(u)) }), 80), 1, { color: C.dim, lw: 2, dash: [4, 10] }))
    })

    // ── lane 1: stepwise ───────────────────────────────────────────────
    const tau1 = D * seg(t, T1[0], T1[1])
    if (t > T1[0]) {
      // thinking bars
      for (let n = 0; n * P < tau1; n++) {
        const a = n * P
        const fill = clamp((tau1 - a) / THINK)
        K.fillRR(vx(a), LANE[0].y + LANE[0].h + 22, (vx(a + THINK) - vx(a)) * fill, 14, 4, C.lang)
      }
      for (let n = 1; n * P - (P - THINK) <= tau1 && n * P <= D; n++) {
        K.dot(vx(n * P), vy(0, stepwise(n * P - 0.001)) + 22, 5, alpha(C.action, 0.6))
      }
      const pts = K.sample((u) => ({ x: vx(u * tau1), y: vy(0, stepwise(u * tau1)) }), 240)
      K.trace(pts, 1, { color: C.action, lw: 5 })
      K.dot(vx(tau1), vy(0, stepwise(tau1)), 10, C.action)
    }

    // ── lane 2: chunks ─────────────────────────────────────────────────
    const m = inOutCubic(seg(t, T3[0], T3[1]))
    const tau2 = D * seg(t, T2[0], T2[1])
    if (t > T2[0]) {
      const pause = 0.3 * (1 - m)
      const thinks = [[0, 0.3], [lerp(1.6, 1.3, m), lerp(1.9, 1.6, m)]] as const
      thinks.forEach(([a, b]) => {
        if (tau2 <= a) return
        const fill = clamp((tau2 - a) / (b - a))
        K.fillRR(vx(a), LANE[1].y + LANE[1].h + 22, (vx(b) - vx(a)) * fill, 14, 4, C.lang)
      })
      // RTC overlap band
      const ov = outCubic(seg(t, T3[1] - 0.3, T3[1] + 0.4))
      if (ov > 0) {
        const a = vx(1.3)
        const b = vx(1.6)
        ctx.fillStyle = alpha(C.lang, 0.12 * ov)
        ctx.fillRect(a, LANE[1].y - 8, b - a, LANE[1].h + 58)
        K.fade(ov, () => K.label(L('overlap'), (a + b) / 2, LANE[1].y - 20, { align: 'center', color: C.lang, size: 24 }))
      }
      // chunk arrival: 50 dots ahead, consumed as executed
      const chunks = [[0.3, 1.6, 0, 0.5], [1.6 + pause, D, 0.5, 1]] as const
      chunks.forEach(([e0, e1, u0, u1], ci) => {
        const arrive = ci === 0 ? 0.3 : thinks[1][1]
        if (tau2 < arrive) return
        for (let j = 0; j < 50; j++) {
          const f = j / 49
          const tj = lerp(e0, e1, f)
          const k = outExpo(seg(tau2, arrive + f * 0.25, arrive + f * 0.25 + 0.2))
          const done = tj < tau2 - 0.02
          K.fade(k * (done ? 0.45 : 1), () => K.dot(vx(tj), vy(1, goal(lerp(u0, u1, f))) + (done ? 22 : 0), done ? 4 : 6, C.action))
        }
        K.fade(presence(tau2, arrive, Infinity, 0.2), () => K.label(L('chunk50'), vx(lerp(e0, e1, 0.5)), vy(1, goal(lerp(u0, u1, 0.5))) - 30, { color: C.action, size: 24, align: 'center' }))
      })
      const pts = K.sample((u) => ({ x: vx(u * tau2), y: vy(1, chunked(u * tau2, m)) }), 240)
      K.trace(pts, 1, { color: C.action, lw: 5 })
      K.dot(vx(tau2), vy(1, chunked(tau2, m)), 10, C.action)
      // the seam pause, called out
      const gk = presence(t, T2[0] + 1.9, T3[0] + 0.3) * (1 - m)
      K.fade(gk, () => {
        const a = vx(1.6)
        const b = vx(1.9)
        K.line(a, LANE[1].y + LANE[1].h + 50, b, LANE[1].y + LANE[1].h + 50, C.warn, 3)
        K.label(L('pause'), (a + b) / 2, LANE[1].y + LANE[1].h + 80, { align: 'center', color: C.warn, size: 22 })
      })
    }

    // ── mini arms, one per lane ────────────────────────────────────────
    const armFor = (lane: number, v: number, a: number) => K.fade(a, () => {
      ctx.save()
      ctx.translate(1660, LANE[lane].y + LANE[lane].h + 16)
      ctx.scale(0.36, 0.36)
      K.fillRR(-220, 0, 440, 22, 6, C.table)
      arm(K, { x: 0, y: 0 }, { x: -330, y: -250 - v * 190 }, { l1: 380, l2: 340, grip: 0.6 })
      ctx.restore()
    })
    armFor(0, t > T1[0] ? stepwise(tau1) : goal(0), outExpo(seg(t, 0.6, 1.4)))
    armFor(1, t > T2[0] ? chunked(tau2, m) : goal(0), outExpo(seg(t, 0.75, 1.55)))

    // captions
    K.fade(presence(t, T1[0] + 1.0), () => K.label(L('think'), X0, LANE[0].y + LANE[0].h + 74, { color: C.lang }))
    K.fade(presence(t, T2[1] - 0.6, T3[0]), () => K.label(L('facts'), X0, 975, { color: C.dim, size: 26 }))
    if (t > T3[0]) {
      K.punch(L('punch'), t, T3[1] - 0.2, { y: 975, size: 40, maxW: 1150 })
      const code = '--inference.type=rtc'
      K.chip(code, W - 72 - (K.measure(code, 28, 500, 'mono') + 32), 936, { size: 28, k: seg(t, T3[1] + 0.6, T3[1] + 1.0), bg: C.langDeep, fg: C.lang, h: 52, align: 'left', pad: 16 })
    }

    K.fade(presence(t, 0.8), () => K.cite(L('cite')))
  },
})

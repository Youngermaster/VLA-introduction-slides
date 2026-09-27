/**
 * ACT is a reflex; a VLA is a reflex that listens.
 *
 *   arrive  two arms, two tables: ACT (trained on "pick the red cube") and a VLA
 *   1       ACT: the instruction bounces off (no input for it); it picks the red
 *           cube anyway; the cube moves 10 cm and the gripper closes on air
 *   2       VLA: the instruction goes in; it picks the blue cube; a second
 *           instruction stacks the red one on top
 *   3       the punchline under each arm
 */
import { defineScene } from '../lib/scene/types'
import { C, W, type Kit } from '../lib/scene/kit'
import { alpha, inOutCubic, keys, lerp, outBack, outCubic, outExpo, path2, presence, seg, step } from '../lib/scene/math'
import { GRIP_DROP, arm, cube } from '../lib/scene/robot'

const S = 0.8
const ACT = { x: 660, y: 820 }
const VLA = { x: 1620, y: 820 }
const RED = '#FF6B6B'
const BLUE = '#6E8BFF'
const HOME = { x: 80, y: -400 }
const CARRY = GRIP_DROP + 48

const P1 = 1.9 // click 1 starts
const P2 = 7.8
const P3 = 13.0

type KF = readonly (readonly [number, number, number])[]

const actKF: KF = [
  [3.5, HOME.x, HOME.y],
  [4.1, -330, -330],
  [4.4, -330, -176],
  [4.6, -330, -176],
  [4.9, -330, -360],
  [5.2, -330, -176],
  [5.4, -330, -176],
  [5.75, HOME.x, HOME.y],
  [6.3, HOME.x, HOME.y],
  [6.8, -330, -330],
  [7.1, -330, -176],
  [7.3, -330, -176],
  [7.45, -330, -300],
  [7.75, HOME.x, HOME.y],
]
const actGrip = (t: number) => keys(t, [[0, 1], [4.4, 1], [4.55, 0.62], [5.25, 0.62], [5.4, 1], [7.1, 1], [7.3, 0]])
const actWrist = (t: number) => (t < actKF[0][0] ? HOME : path2(t, actKF))

const vlaKF: KF = [
  [8.4, HOME.x, HOME.y],
  [8.9, -500, -330],
  [9.15, -500, -176],
  [9.3, -500, -176],
  [9.55, -500, -360],
  [9.95, -150, -360],
  [10.15, -150, -196],
  [10.3, -150, -196],
  [10.5, -150, -360],
  [10.75, HOME.x, HOME.y],
  [11.2, -330, -330],
  [11.45, -330, -176],
  [11.6, -330, -176],
  [11.85, -330, -400],
  [12.15, -150, -400],
  [12.35, -150, -292],
  [12.5, -150, -292],
  [12.65, -150, -420],
  [12.9, HOME.x, HOME.y],
]
const vlaGrip = (t: number) => keys(t, [[0, 1], [9.15, 1], [9.28, 0.62], [10.15, 0.62], [10.28, 1], [11.45, 1], [11.58, 0.62], [12.35, 0.62], [12.48, 1]])
const vlaWrist = (t: number) => (t < vlaKF[0][0] ? HOME : path2(t, vlaKF))

/** Object position (local): resting, carried between two times, then resting elsewhere. */
function held(t: number, wrist: (t: number) => { x: number; y: number }, rest: { x: number; y: number }, t0: number, t1: number, after: { x: number; y: number }) {
  if (t < t0) return rest
  if (t < t1) {
    const w = wrist(t)
    return { x: w.x, y: w.y + CARRY }
  }
  return after
}

const toScreen = (b: { x: number; y: number }, p: { x: number; y: number }) => ({ x: b.x + p.x * S, y: b.y + p.y * S })

/** A table strip in local coordinates. */
function localTable(K: Kit, x0: number, x1: number) {
  K.ctx.fillStyle = C.table
  K.ctx.fillRect(x0, 0, x1 - x0, 40)
  K.ctx.fillStyle = C.faint
  K.ctx.fillRect(x0, 0, x1 - x0, 5)
}

export default defineScene({
  cues: [P1, P2, P3, P3 + 2.2],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)

    // ── headers ────────────────────────────────────────────────────────
    const hA = presence(t, 0.4, Infinity, 0.5)
    const vlaFocus = outCubic(seg(t, P2, P2 + 0.4))
    K.fade(hA * lerp(1, 0.55, vlaFocus * (1 - seg(t, P3, P3 + 0.4))), () => {
      K.text('ACT', 132, 280, { size: 52, weight: 700, fam: 'display', color: C.paper })
      K.text(L('actSub'), 132, 326, { size: 24, weight: 500, fam: 'mono', color: C.dim })
    })
    K.fade(hA * lerp(0.55, 1, vlaFocus), () => {
      K.text('VLA', 1092, 280, { size: 52, weight: 700, fam: 'display', color: C.paper })
      K.text(L('vlaSub'), 1092, 326, { size: 24, weight: 500, fam: 'mono', color: C.dim })
    })
    // divider
    K.fade(hA, () => K.line(W / 2 + 10, 250, W / 2 + 10, 880, alpha(C.paper, 0.1), 2))

    // ── the two worlds ─────────────────────────────────────────────────
    const drop = (i: number) => (1 - step(t, 0.5 + i * 0.1)) * -300
    const armIn = outExpo(seg(t, 0.8, 1.5))

    // ACT
    const actRed = (() => {
      const base = held(t, actWrist, { x: -330, y: 0 }, 4.55, 5.3, { x: -330, y: 0 })
      if (t >= 5.3) base.x = lerp(-330, -180, inOutCubic(seg(t, 5.8, 6.3)))
      return base
    })()
    ctx.save()
    ctx.translate(ACT.x, ACT.y)
    ctx.scale(S, S)
    ctx.globalAlpha *= hA
    localTable(K, -760, 220)
    cube(K, -500, drop(0), BLUE)
    cube(K, actRed.x, actRed.y + drop(1), RED)
    // the 10 cm marker
    const mk = outCubic(seg(t, 6.0, 6.4)) * (1 - seg(t, P3, P3 + 0.4))
    if (mk > 0) {
      ctx.globalAlpha = hA * mk
      K.line(-330, 70, -180, 70, C.dim, 4)
      K.line(-330, 56, -330, 84, C.dim, 4)
      K.line(-180, 56, -180, 84, C.dim, 4)
      K.text('10 cm', -255, 130, { size: 34, weight: 500, fam: 'mono', color: C.dim, align: 'center' })
      ctx.globalAlpha = hA
    }
    ctx.globalAlpha = hA * armIn
    arm(K, { x: 0, y: 0 }, actWrist(t), { l1: 300, l2: 290, grip: actGrip(t) })
    ctx.restore()

    // miss marker: the gripper closes on air
    const missK = seg(t, 7.35, 7.6)
    if (missK > 0) {
      const p = toScreen(ACT, { x: -330, y: -176 + GRIP_DROP })
      const s = 22 * outBack(missK)
      K.fade(1 - seg(t, P3 + 0.2, P3 + 0.6) * 0.6, () => {
        K.line(p.x - s, p.y - s, p.x + s, p.y + s, C.warn, 6)
        K.line(p.x + s, p.y - s, p.x - s, p.y + s, C.warn, 6)
        K.text(L('miss'), p.x, p.y - 70, { align: 'center', size: 26, weight: 500, fam: 'mono', color: C.warn, alpha: outCubic(missK) })
      })
    }

    // VLA
    const vBlue = held(t, vlaWrist, { x: -500, y: 0 }, 9.28, 10.22, { x: -150, y: -20 })
    const vRed = held(t, vlaWrist, { x: -330, y: 0 }, 11.58, 12.42, { x: -150, y: -116 })
    ctx.save()
    ctx.translate(VLA.x, VLA.y)
    ctx.scale(S, S)
    ctx.globalAlpha *= hA
    localTable(K, -760, 220)
    K.fillRR(-230, -20, 160, 20, 4, '#2E343D')
    cube(K, vBlue.x, vBlue.y + drop(2), BLUE)
    cube(K, vRed.x, vRed.y + drop(3), RED)
    ctx.globalAlpha = hA * armIn
    arm(K, { x: 0, y: 0 }, vlaWrist(t), { l1: 300, l2: 290, grip: vlaGrip(t) })
    ctx.restore()

    // ── instructions ───────────────────────────────────────────────────
    // ACT: flies at the arm, stops dead, shakes, dissolves
    const aStart = { x: 250, y: 400 }
    const aHit = toScreen(ACT, { x: -270, y: -520 })
    const fly = inOutCubic(seg(t, 2.4, 2.95))
    const shake = t > 2.95 && t < 3.35 ? Math.sin((t - 2.95) * 70) * 12 * (1 - seg(t, 2.95, 3.35)) : 0
    const dissolve = seg(t, 3.2, 3.6)
    const aIn = seg(t, 2.1, 2.35)
    if (aIn > 0 && dissolve < 1) {
      const x = lerp(aStart.x, aHit.x, fly) + shake
      const y = lerp(aStart.y, aHit.y, fly)
      ctx.save()
      ctx.globalAlpha *= 1 - dissolve
      if ('filter' in ctx && dissolve > 0) ctx.filter = `blur(${(dissolve * 14).toFixed(1)}px)`
      K.chip(L('instr'), x, y, { k: aIn, align: 'center', size: 28, fam: 'sans', weight: 600, bg: C.langDeep, fg: C.lang })
      ctx.restore()
    }
    const noK = outCubic(seg(t, 3.1, 3.4)) * (1 - seg(t, P3, P3 + 0.4) * 0.6)
    if (noK > 0) K.text(L('noInput'), aHit.x, aHit.y + 10, { size: 26, weight: 500, fam: 'mono', color: C.warn, alpha: noK, align: 'center' })

    // VLA: two instructions, each absorbed at the shoulder
    const shoulder = toScreen(VLA, { x: 0, y: -96 })
    const absorb = (label: string, t0: number, from: { x: number; y: number }) => {
      const k = seg(t, t0, t0 + 0.25)
      const f = inOutCubic(seg(t, t0 + 0.25, t0 + 0.7))
      if (k <= 0) return
      const gone = seg(t, t0 + 0.55, t0 + 0.75)
      if (gone < 1) {
        ctx.save()
        ctx.globalAlpha *= 1 - gone
        ctx.translate(lerp(from.x, shoulder.x, f), lerp(from.y, shoulder.y, f))
        ctx.scale(lerp(1, 0.25, f), lerp(1, 0.25, f))
        K.chip(label, 0, -24, { k, align: 'center', size: 28, fam: 'sans', weight: 600 })
        ctx.restore()
      }
      // the ring where the language enters the model
      const ring = seg(t, t0 + 0.65, t0 + 1.05)
      if (ring > 0 && ring < 1) {
        ctx.save()
        ctx.strokeStyle = alpha(C.lang, 1 - ring)
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(shoulder.x, shoulder.y, 20 + ring * 70, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
    }
    absorb(L('instr'), P2 + 0.1, { x: 1400, y: 420 })
    absorb(L('instr2'), 10.2, { x: 1400, y: 420 })
    // the last instruction stays on screen, small, as the record of what was asked
    const inK = outCubic(seg(t, 8.5, 8.8))
    if (inK > 0) {
      const s2 = t >= 10.9
      K.text(`ℓ = “${s2 ? L('instr2') : L('instr')}”`, 1092, 372, { size: 26, weight: 500, fam: 'mono', color: C.lang, alpha: inK })
    }

    // ── punchlines ─────────────────────────────────────────────────────
    K.punch(L('punchAct'), t, P3 + 0.15, { x: 132, y: 950, size: 40, maxW: 800 })
    K.punch(L('punchVla'), t, P3 + 0.55, { x: 1092, y: 950, size: 40, maxW: 760 })

    K.cite(L('cite'), presence(t, 0.4, Infinity, 0.5))
  },
})

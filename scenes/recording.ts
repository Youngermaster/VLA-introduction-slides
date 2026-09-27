/**
 * What happens when you record a dataset with LeRobot.
 *
 *   arrive  leader and follower on one table, three camera feeds
 *   1       a hand moves the leader through a pick; the follower copies ~100 ms behind
 *   2       every tick at 30 Hz writes a row; a second take freezes mid-move
 *   3       the frozen row, blown up: observation.state ≠ action
 */
import { defineScene } from '../lib/scene/types'
import { C, W, type Kit } from '../lib/scene/kit'
import { alpha, clamp, inOutCubic, keys, lerp, outCubic, outExpo, path2, presence, seg } from '../lib/scene/math'
import { GRIP_DROP, arm, cube, ik } from '../lib/scene/robot'

const S = 0.72
const LEAD = { x: 420, y: 612 }
const FOLL = { x: 1040, y: 612 }
const LAG = 0.12
const EP1 = 2.3
const EP2 = 6.3
const EPD = 3.6
const FREEZE = 8.3 // mid-move in take 2: leader and follower disagree here
const L1 = 300
const L2 = 290
const SRC = -300
const DST = -110

const P1 = 2.0
const P2 = 6.0
const P3 = FREEZE

/** One take, local coordinates, u ∈ [0, 1]. */
function take(u: number) {
  const home = { x: 70, y: -390 }
  const w = path2(u, [
    [0, home.x, home.y],
    [0.2, SRC, -330],
    [0.32, SRC, -176],
    [0.4, SRC, -176],
    [0.5, SRC, -360],
    [0.68, DST, -360],
    [0.78, DST, -176],
    [0.85, DST, -176],
    [0.92, DST, -330],
    [1, home.x, home.y],
  ])
  const grip = keys(u, [[0, 1], [0.32, 1], [0.38, 0.62], [0.79, 0.62], [0.85, 1]])
  return { w, grip, carry: u >= 0.37 && u < 0.81, placed: u >= 0.81 }
}

/** Leader pose at time t: take 1, then take 2 frozen at FREEZE. */
function leaderAt(t: number) {
  const tt = Math.min(t, FREEZE)
  if (tt >= EP2) return take((tt - EP2) / EPD)
  if (tt >= EP1) return take(Math.min(1, (tt - EP1) / EPD))
  return take(0)
}
/** The follower is the leader, LAG seconds late (and frozen LAG behind it). */
const followerAt = (t: number) => leaderAt(Math.min(t, FREEZE) - LAG)

/** Cube on the follower's table. */
function cubeAt(t: number) {
  const f = followerAt(t)
  const tt = Math.min(t, FREEZE) - LAG
  const inTake2 = tt >= EP2
  if (f.carry) return { x: f.w.x, y: f.w.y + GRIP_DROP + 48 }
  if (inTake2) return { x: SRC, y: 0 }
  if (tt >= EP1 && f.placed) return { x: DST, y: 0 }
  // between takes the cube is reset to the start (a human puts it back)
  return { x: SRC, y: 0 }
}

/** The six joint values a real SO-101 would log, from the drawn pose (degrees). */
const norm = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180
function joints(w: { x: number; y: number }, grip: number) {
  const sh = { x: 0, y: -96 }
  const e = ik(sh, w, L1, L2)
  const tu = (Math.atan2(e.y - sh.y, e.x - sh.x) * 180) / Math.PI
  const tf = (Math.atan2(w.y - e.y, w.x - e.x) * 180) / Math.PI
  return [4.2, norm(-tu - 90), norm(tf - tu), norm(90 - tf), 0.0, grip * 100]
}
const fmt = (v: number) => v.toFixed(1).padStart(6, ' ')

function localTable(K: Kit, x0: number, x1: number) {
  K.ctx.fillStyle = C.table
  K.ctx.fillRect(x0, 0, x1 - x0, 40)
  K.ctx.fillStyle = C.faint
  K.ctx.fillRect(x0, 0, x1 - x0, 5)
}

// table layout
const COLS = { frame: 72, img: 170, state: 420, action: 1000, task: 1590 }
const ROW_Y = 766
const ROW_H = 42

export default defineScene({
  cues: [1.8, P2, P3, P3 + 2.4],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)
    const inA = presence(t, 0.3, Infinity, 0.5)
    const armIn = outExpo(seg(t, 0.5, 1.2))
    const lead = leaderAt(t)
    const foll = followerAt(t)
    const c = cubeAt(t)

    // the rig sits centred until the data needs the room, then rises
    const lift = lerp(140, 0, inOutCubic(seg(t, P2, P2 + 0.7)))
    ctx.save()
    ctx.translate(0, lift)

    // ── the two arms ───────────────────────────────────────────────────
    for (const [base, pose, isLead] of [[LEAD, lead, true], [FOLL, foll, false]] as const) {
      ctx.save()
      ctx.translate(base.x, base.y)
      ctx.scale(S, S)
      ctx.globalAlpha *= inA
      localTable(K, -460, 220)
      if (!isLead) cube(K, c.x, c.y, C.action)
      ctx.globalAlpha *= armIn
      arm(K, { x: 0, y: 0 }, pose.w, { l1: L1, l2: L2, grip: pose.grip, accent: isLead ? C.action : C.paper })
      ctx.restore()
    }
    K.fade(inA, () => {
      const lx = LEAD.x - 460 * S
      const fx = FOLL.x - 460 * S
      const w1 = K.measure(L('leader'), 28, 700, 'display')
      const w2 = K.measure(L('follower'), 28, 700, 'display')
      K.text(L('leader'), lx, LEAD.y + 76, { size: 28, weight: 700, fam: 'display', color: C.action })
      K.text(L('leaderSub'), lx + w1 + 16, LEAD.y + 74, { size: 22, weight: 500, fam: 'mono', color: C.dim })
      K.text(L('follower'), fx, FOLL.y + 76, { size: 28, weight: 700, fam: 'display', color: C.paper })
      K.text(L('followerSub'), fx + w2 + 16, FOLL.y + 74, { size: 22, weight: 500, fam: 'mono', color: C.dim })
    })

    // the hand on the leader: a touch ring that rides the wrist
    const handK = presence(t, P1 - 0.1, Infinity, 0.3)
    if (handK > 0) {
      const p = { x: LEAD.x + lead.w.x * S, y: LEAD.y + lead.w.y * S }
      ctx.save()
      ctx.globalAlpha *= handK
      ctx.strokeStyle = C.paper
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(p.x, p.y, 34, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = alpha(C.paper, 0.18)
      ctx.fill()
      ctx.restore()
      K.label(L('hand'), p.x + 44, p.y - 30, { color: C.paper, alpha: handK * (1 - seg(t, P3, P3 + 0.3)) })
    }
    // the copy link: dashed line leader wrist → follower wrist
    if (t > P1) {
      const a = { x: LEAD.x + lead.w.x * S, y: LEAD.y + lead.w.y * S }
      const b = { x: FOLL.x + foll.w.x * S, y: FOLL.y + foll.w.y * S }
      K.fade(outCubic(seg(t, P1, P1 + 0.4)) * 0.5, () => K.line(a.x + 40, a.y, b.x - 40, b.y, C.dim, 2, [6, 10]))
    }

    // ── three camera feeds ─────────────────────────────────────────────
    const camNames = [L('camTop'), L('camWrist'), L('camBase')]
    camNames.forEach((name, i) => {
      const x = 1440
      const y = 250 + i * 128
      const ck = outExpo(seg(t, 0.8 + i * 0.1, 1.3 + i * 0.1))
      if (ck <= 0) return
      ctx.save()
      ctx.globalAlpha *= ck
      K.fillRR(x, y, 190, 107, 8, C.bg2)
      K.strokeRR(x, y, 190, 107, 8, C.faint, 2)
      ctx.beginPath()
      ctx.rect(x, y, 190, 107)
      ctx.clip()
      const gx = x + 95 + foll.w.x * 0.18
      const cxp = x + 95 + c.x * 0.18
      if (i === 0) {
        // from above: cube and gripper as squares
        ctx.fillStyle = C.action
        ctx.fillRect(cxp - 12, y + 50, 24, 24)
        K.strokeRR(gx - 16, y + 44 + (foll.grip < 0.9 ? 3 : 0), 32, 36, 6, C.paper, 3)
      }
      else if (i === 1) {
        // wrist camera: the cube grows as the gripper descends
        const near = clamp((-foll.w.y - 176) / 220)
        const s = lerp(70, 24, near)
        ctx.fillStyle = C.action
        ctx.fillRect(x + 95 + (c.x - foll.w.x) * 0.6 - s / 2, y + 60 - s / 2, s, s)
        ctx.strokeStyle = C.paper
        ctx.lineWidth = 5
        const g = lerp(20, 60, foll.grip)
        K.line(x + 95 - g, y + 107, x + 95 - g, y + 84, C.paper, 6)
        K.line(x + 95 + g, y + 107, x + 95 + g, y + 84, C.paper, 6)
      }
      else {
        // base camera: side view silhouette
        ctx.fillStyle = C.action
        ctx.fillRect(cxp - 10, y + 88 + c.y * 0.18 - 20, 20, 20)
        K.dot(gx, y + 88 + foll.w.y * 0.18 + 20, 7, C.paper)
        ctx.fillStyle = C.faint
        ctx.fillRect(x, y + 88, 190, 3)
      }
      ctx.restore()
      K.label(name, x - 14, y + 62, { align: 'right', color: C.mute, alpha: ck })
    })

    ctx.restore()

    // ── the dataset rows ───────────────────────────────────────────────
    const rowsIn = outCubic(seg(t, P2, P2 + 0.4))
    const focus = outCubic(seg(t, P3, P3 + 0.5))
    if (rowsIn > 0) {
      ctx.save()
      ctx.globalAlpha *= rowsIn * (1 - focus)
      const hy = ROW_Y - 22
      K.label('frame', COLS.frame, hy, { size: 21 })
      K.label('observation.images', COLS.img, hy, { size: 21 })
      K.label('observation.state', COLS.state, hy, { size: 21, color: C.paper })
      K.label('action', COLS.action, hy, { size: 21, color: C.action })
      K.label('task', COLS.task, hy, { size: 21 })
      K.line(COLS.frame, hy + 12, W - 72, hy + 12, alpha(C.paper, 0.15), 2)
      const tt = Math.min(t, FREEZE)
      const n = Math.max(0, Math.floor((tt - EP2) * 30))
      const shown = Math.min(5, n + 1)
      for (let r = 0; r < shown; r++) {
        const f = n - r
        const tf = EP2 + f / 30
        const lp = leaderAt(tf)
        const fp = followerAt(tf)
        const y = ROW_Y + 30 + r * ROW_H
        const a = r === 0 ? 1 : 0.75 - r * 0.12
        ctx.globalAlpha = rowsIn * (1 - focus) * a
        K.text(String(108 + f).padStart(4, '0'), COLS.frame, y, { size: 22, weight: 500, fam: 'mono', color: C.dim })
        for (let k = 0; k < 3; k++) {
          K.fillRR(COLS.img + k * 76, y - 26, 64, 34, 4, C.bg2)
          K.strokeRR(COLS.img + k * 76, y - 26, 64, 34, 4, C.faint, 2)
          ctx.fillStyle = C.action
          ctx.fillRect(COLS.img + k * 76 + 26 + (k - 1) * 6, y - 15, 12, 12)
        }
        K.text(joints(fp.w, fp.grip).map(fmt).join(' '), COLS.state, y, { size: 22, weight: 500, fam: 'mono', color: C.paper })
        K.text(joints(lp.w, lp.grip).map(fmt).join(' '), COLS.action, y, { size: 22, weight: 500, fam: 'mono', color: C.action })
        K.text(L('task'), COLS.task, y, { size: 22, weight: 500, fam: 'mono', color: C.lang })
      }
      ctx.restore()
      if (t > P2 + 0.3) {
        const paused = t >= FREEZE
        K.label(paused ? `❚❚ ${L('paused')}` : '● REC · 30 Hz', W - 72, 250 + 3 * 128 + 10, { align: 'right', color: paused ? C.dim : C.warn, alpha: 1 - focus * 0.6 })
      }
    }

    // ── the point: state ≠ action ──────────────────────────────────────
    if (focus > 0) {
      const fp = followerAt(FREEZE)
      const lp = leaderAt(FREEZE)
      const js = joints(fp.w, fp.grip)
      const ja = joints(lp.w, lp.grip)
      const y1 = 800
      const y2 = 872
      K.fade(focus, () => {
        K.text('observation.state', 72, y1, { size: 30, weight: 500, fam: 'mono', color: C.paper })
        K.text('action', 72, y2, { size: 30, weight: 500, fam: 'mono', color: C.action })
        js.forEach((v, i) => {
          const x = 400 + i * 150
          const diff = Math.abs(ja[i] - v) > 0.05
          K.text(fmt(v), x, y1, { size: 34, weight: 600, fam: 'mono', color: C.paper })
          K.text(fmt(ja[i]), x, y2, { size: 34, weight: 600, fam: 'mono', color: C.action })
          if (diff) K.line(x + 8, y2 + 16, x + 110, y2 + 16, alpha(C.action, 0.6), 3)
        })
        K.text(L('stateIs'), 1340, y1, { size: 26, weight: 500, fam: 'sans', color: C.dim })
        K.text(L('actionIs'), 1340, y2, { size: 26, weight: 500, fam: 'sans', color: C.action })
      })
      K.punch(L('punch'), t, P3 + 0.5, { y: 960, size: 40 })
    }

    K.cite(L('cite'), inA * (1 - focus))
  },
})

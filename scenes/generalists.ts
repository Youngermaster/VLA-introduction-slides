/**
 * VLAs vs the generalist models: a brain stack. The slow generalist decides
 * WHAT, the fast VLA decides HOW, a 1 kHz layer keeps balance and contact.
 * Tick density in each band is how often that layer decides, per second.
 *
 *   arrive  three dim layers, tick trains drawn on
 *   1       the planner lights: "clean the table" → three written subtasks
 *   2       a subtask pulses down: the VLA executes it (arm picks), S0 holds contact
 *   3       punch: generalist = what, VLA = how; VLAs as tools
 */
import { defineScene } from '../lib/scene/types'
import { C, type Kit } from '../lib/scene/kit'
import { alpha, inOutCubic, lerp, outBack, outCubic, outExpo, path2, presence, seg } from '../lib/scene/math'
import { GRIP_DROP, arm, bottle } from '../lib/scene/robot'

const BAND = [230, 445, 660] as const // tops
const BH = 185
const TICK_X0 = 650
const TICK_X1 = 1240
const RX = 1330 // right column

interface Layer { key: string; n: number; color: string; on: number }

function band(K: Kit, t: number, top: number, L: (k: string) => string, l: Layer, i: number) {
  const { ctx } = K
  const lit = outCubic(seg(t, l.on, l.on + 0.4))
  const nameCol = lit > 0.5 ? l.color : C.mute
  const ink = lerp(0.55, 1, lit)
  K.text(L(`${l.key}`), 72, top + 62, { size: 46, weight: 800, fam: 'display', color: nameCol, alpha: outExpo(seg(t, 0.2 + i * 0.12, 0.8 + i * 0.12)) })
  K.fade(ink, () => {
    K.words(L(`${l.key}sub`), 72, top + 110, { t, t0: 0.4 + i * 0.12, size: 28, weight: 500, fam: 'sans', ls: 0, color: C.dim, maxW: 540, stagger: 0.02 })
    K.words(L(`${l.key}ex`), 72, top + 152, { t, t0: 0.6 + i * 0.12, size: 22, weight: 500, fam: 'mono', ls: 0, color: C.mute, maxW: 540, stagger: 0.012 })
  })
  // one second of decisions
  const tk = inOutCubic(seg(t, 0.5 + i * 0.25, 1.7 + i * 0.25))
  const y0 = top + 96
  const y1 = top + 146
  ctx.save()
  ctx.globalAlpha *= lerp(0.35, 1, lit)
  ctx.strokeStyle = l.color
  ctx.lineWidth = l.n > 60 ? 1.6 : 4
  ctx.beginPath()
  for (let j = 0; j < l.n; j++) {
    const x = TICK_X0 + ((j + 0.5) / l.n) * (TICK_X1 - TICK_X0)
    if (x > lerp(TICK_X0, TICK_X1, tk)) break
    ctx.moveTo(x, y0)
    ctx.lineTo(x, y1)
  }
  ctx.stroke()
  ctx.restore()
  K.text(L(`${l.key}hz`), TICK_X1, top + 70, { size: 38, weight: 800, fam: 'display', color: nameCol, align: 'right', alpha: outExpo(seg(t, 1.0 + i * 0.25, 1.5 + i * 0.25)) })
  if (i === 0) K.label(L('sec'), TICK_X0, top + 70, { alpha: tk })
}

export default defineScene({
  cues: [2.0, 5.4, 9.4, 11.4],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)

    const layers: Layer[] = [
      { key: 's2', n: 8, color: C.lang, on: 2.1 },
      { key: 's1', n: 50, color: C.action, on: 5.6 },
      { key: 's0', n: 150, color: C.action, on: 7.4 },
    ]
    layers.forEach((l, i) => band(K, t, BAND[i], L, l, i))

    // separators between layers
    for (let i = 1; i < 3; i++) {
      const k = outExpo(seg(t, 0.3 + i * 0.1, 1.1 + i * 0.1))
      if (k > 0) K.line(72, BAND[i] - 12, lerp(72, 1848, k), BAND[i] - 12, alpha(C.paper, 0.08), 2)
    }

    // ── planner I/O (top band, right) ──────────────────────────────────
    const top = BAND[0]
    const ck = outExpo(seg(t, 2.2, 2.6))
    if (ck > 0) {
      const goal = K.typed(L('goal'), seg(t, 2.5, 3.3))
      const gw = K.measure(L('goal'), 32, 600, 'sans') + 48
      ctx.save()
      ctx.globalAlpha *= ck
      K.fillRR(RX, top + 18, gw, 58, 29, C.bg2)
      K.strokeRR(RX, top + 18, gw, 58, 29, C.faint, 2)
      K.text(goal, RX + 24, top + 57, { size: 32, weight: 600, fam: 'sans', color: C.paper })
      ctx.restore()
    }
    const subs = [L('sub1'), L('sub2'), L('sub3')]
    subs.forEach((s, j) => {
      const t0 = 3.5 + j * 0.45
      const k = seg(t, t0, t0 + 0.45)
      if (k <= 0) return
      const y = top + 112 + j * 36
      const active = j === 0 && t > 5.6
      K.text(`${j + 1}`, RX + 4, y, { size: 26, weight: 500, fam: 'mono', color: active ? C.action : C.lang })
      K.text(K.typed(s, k), RX + 40, y, { size: 28, weight: 500, fam: 'sans', color: active ? C.action : C.dim })
    })

    // ── the subtask pulses down to the VLA ─────────────────────────────
    const pk = seg(t, 5.6, 6.4)
    if (pk > 0 && pk < 1) {
      for (let d = 0; d < 5; d++) {
        const u = seg(t, 5.6 + d * 0.08, 6.3 + d * 0.08)
        if (u <= 0 || u >= 1) continue
        const p = { x: RX - 30, y: lerp(top + 112, BAND[1] + 60, inOutCubic(u)) }
        K.dot(p.x, p.y, 8 - d, C.action)
      }
    }
    const lk = outExpo(seg(t, 5.6, 6.2))
    if (lk > 0) K.arrow(RX - 30, top + 130, RX - 30, lerp(top + 130, BAND[1] + 40, lk), { color: alpha(C.action, 0.6), lw: 3, head: 12 })

    // ── the arm (middle + bottom bands, right) ─────────────────────────
    const gy = BAND[2] + BH - 20
    const armK = outExpo(seg(t, 5.8, 6.4))
    if (armK > 0) {
      ctx.save()
      ctx.globalAlpha *= armK
      const s = 0.56
      ctx.translate(RX + 10, gy)
      ctx.scale(s, s)
      K.line(-80, 0, 900, 0, C.faint, 6)
      const lift = seg(t, 7.2, 8.4)
      const bx = 180
      const kf = [[0, 700, -560], [0.45, bx, -420], [0.75, bx, -70 - GRIP_DROP], [1, bx, -70 - GRIP_DROP]] as const
      const reach = inOutCubic(seg(t, 6.2, 7.2))
      let w = path2(reach, kf, (x) => x)
      if (lift > 0) w = { x: bx, y: lerp(-70 - GRIP_DROP, -430, inOutCubic(lift)) }
      const gripped = t > 7.1
      bottle(K, bx, gripped ? w.y + GRIP_DROP + 70 : 0, 1)
      arm(K, { x: 820, y: 0 }, w, { grip: lerp(1, 0.72, seg(t, 7.0, 7.15)) })
      // contact: the fast layer's job, a ring at the jaws
      const rk = seg(t, 7.1, 7.9)
      if (rk > 0 && rk < 1) {
        ctx.strokeStyle = alpha(C.action, 1 - rk)
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.arc(w.x, w.y + GRIP_DROP - 30, 40 + rk * 90, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
    }
    // the executed subtask as a chip near the arm
    const ek = outBack(seg(t, 6.0, 6.4))
    if (ek > 0) {
      ctx.save()
      ctx.globalAlpha *= Math.min(1, ek * 3)
      K.text(L('sub1'), RX, BAND[1] + 58, { size: 28, weight: 600, fam: 'sans', color: C.action })
      ctx.restore()
    }

    // ── punch ──────────────────────────────────────────────────────────
    K.punch(L('punch'), t, 9.5, { y: 942, size: 48 })
    K.fade(presence(t, 10.2), () => K.words(L('tools'), 72, 996, { t, t0: 10.2, size: 30, weight: 500, fam: 'sans', ls: 0, color: C.dim, accent: C.lang, maxW: 1760, stagger: 0.015 }))
    K.fade(presence(t, 2.2) * (1 - seg(t, 9.3, 9.5)), () => K.cite(L('cite')))
  },
})

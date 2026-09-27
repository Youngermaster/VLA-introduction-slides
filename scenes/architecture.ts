/**
 * The whole machine, SmolVLA-style, as a flow of pulses.
 *
 *   arrive   inputs (3 cameras, instruction, joint state) → VLM → action expert → arm
 *   1        tokens travel from every input into ONE sequence; the layers light up
 *   2        the VLM has 32 layers; a cut keeps only the first 16
 *   3        the action expert reads the VLM (cross-attention), denoises noise into
 *            a 50-step chunk in 10 steps; the chunk drives the arm; the loop closes
 *   4        OpenVLA vs SmolVLA, one line each
 */
import { defineScene } from '../lib/scene/types'
import { C, W } from '../lib/scene/kit'
import { alpha, hash, inOutCubic, lerp, outBack, outCubic, outExpo, presence, seg } from '../lib/scene/math'
import { arm } from '../lib/scene/robot'

// inputs
const CAM = { x: 90, w: 220, h: 118, ys: [236, 372, 508] }
const INSTR_Y = 660
const STATE_Y = 740
// VLM stack (layer 0 at the bottom)
const VX = 560
const VW = 340
const VBOT = 800
const LH = 13
const LG = 4
const layerY = (i: number) => VBOT - (i + 1) * (LH + LG)
// token row under the stack
const ROW_Y = 824
const SQ = 11
const ROW_N = 24
const rowX = (j: number) => VX + 2 + j * 14
// expert
const EX = { x: 1030, y: 400, w: 280, h: 250 }
// arm
const AB = { x: 1730, y: 820 }

const T = { pulse: 2.5, wave: 3.4, cut: 5.5, lift: 6.4, xattn: 8.1, noise: 8.7, chunk: 10.1, move: 10.5, loop: 11.1, cmp: 12.2 }

/** Tiny camera frame: the demo table from three viewpoints. */
function thumb(K: import('../lib/scene/kit').Kit, x: number, y: number, view: number) {
  const { ctx } = K
  K.fillRR(x, y, CAM.w, CAM.h, 8, '#15181D')
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, CAM.w, CAM.h)
  ctx.clip()
  if (view === 0) {
    // top: objects from above
    K.fillRR(x + 20, y + 20, CAM.w - 40, CAM.h - 40, 6, '#1C2027')
    K.fillRR(x + 46, y + 44, 36, 30, 4, '#FF8A6B')
    K.dot(x + 118, y + 58, 16, '#6FDCA8')
    K.dot(x + 170, y + 62, 22, '#2E343D')
  }
  else if (view === 1) {
    // wrist: the bottle, close and big, between the jaws
    K.fillRR(x + 78, y + 26, 64, 100, 12, '#E9ECF1')
    ctx.fillStyle = '#6FDCA8'
    ctx.fillRect(x + 78, y + 58, 64, 30)
    K.line(x + 40, y, x + 60, y + 60, C.paper, 12)
    K.line(x + 180, y, x + 160, y + 60, C.paper, 12)
  }
  else {
    // base: side view
    ctx.fillStyle = C.faint
    ctx.fillRect(x, y + 90, CAM.w, 4)
    K.fillRR(x + 30, y + 52, 30, 38, 3, '#E9ECF1')
    K.fillRR(x + 84, y + 60, 24, 30, 5, '#E9ECF1')
    ctx.fillStyle = '#6FDCA8'
    ctx.fillRect(x + 84, y + 68, 24, 10)
    K.fillRR(x + 130, y + 76, 60, 14, 3, '#2E343D')
  }
  ctx.restore()
}

export default defineScene({
  cues: [2.4, 5.2, 8.0, 12.0, 13.8],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)
    const cmpDim = lerp(1, 0.55, outCubic(seg(t, T.cmp, T.cmp + 0.5)))

    ctx.save()
    ctx.globalAlpha *= cmpDim

    // ── inputs ─────────────────────────────────────────────────────────
    const camLabels = [L('top'), L('wrist'), L('base')]
    CAM.ys.forEach((y, i) => {
      const k = outExpo(seg(t, 0.3 + i * 0.1, 0.9 + i * 0.1))
      K.fade(k, () => {
        thumb(K, CAM.x - (1 - k) * 40, y, i)
        K.label(camLabels[i], CAM.x + CAM.w + 12, y + 26, { size: 22 })
      })
    })
    const ik = seg(t, 0.6, 1.0)
    K.chip(L('instr'), CAM.x, INSTR_Y, { size: 24, h: 48, pad: 14, k: ik })
    K.chip(L('state'), CAM.x, STATE_Y, { size: 24, h: 48, pad: 14, k: seg(t, 0.7, 1.1), bg: C.actionDeep, fg: C.action })

    // ── VLM stack ──────────────────────────────────────────────────────
    const lift = outCubic(seg(t, T.lift, T.lift + 0.7))
    for (let i = 0; i < 32; i++) {
      const k = outExpo(seg(t, 0.7 + i * 0.02, 1.1 + i * 0.02))
      if (k <= 0) continue
      const cut = i >= 16
      const y = layerY(i) - (cut ? lift * 36 : 0)
      const a = cut ? lerp(1, 0.12, lift) : 1
      const lit = outCubic(seg(t, T.wave + i * 0.04, T.wave + 0.3 + i * 0.04))
      K.fade(a, () => {
        K.fillRR(VX + (1 - k) * 60, y, VW * k, LH, 3, lit > 0 ? alpha(C.lang, 0.12 + 0.5 * lit * (1 - i / 48)) : '#1A1D22')
      })
    }
    K.fade(presence(t, 1.2), () => {
      K.text('SmolVLM2', VX, layerY(31) - 26, { size: 34, weight: 700, fam: 'display', color: C.paper, alpha: lerp(1, 0.3, lift) })
      K.label(L('layers32'), VX + K.measure('SmolVLM2', 34, 700, 'display') + 18, layerY(31) - 28, { alpha: lerp(1, 0.3, lift) })
    })
    // after the cut, the label moves onto the kept half
    K.fade(outCubic(seg(t, T.lift + 0.4, T.lift + 0.9)), () => {
      K.text('SmolVLM2', VX, layerY(15) - 26, { size: 34, weight: 700, fam: 'display', color: C.paper })
      K.label('16 / 32', VX + K.measure('SmolVLM2', 34, 700, 'display') + 18, layerY(15) - 28, { color: C.lang })
    })

    // ── token row + pulses ─────────────────────────────────────────────
    const kinds = Array.from({ length: ROW_N }, (_, j) => (j < 18 ? 0 : j < 23 ? 1 : 2)) // image · text · state
    const colorOf = (k: number) => (k === 0 ? C.paper : k === 1 ? C.lang : C.action)
    kinds.forEach((kind, j) => {
      const src = kind === 0
        ? { x: CAM.x + CAM.w, y: CAM.ys[Math.floor(j / 6)] + CAM.h / 2 }
        : kind === 1 ? { x: CAM.x + 330, y: INSTR_Y + 24 } : { x: CAM.x + 200, y: STATE_Y + 24 }
      const t0 = T.pulse + j * 0.045
      const k = inOutCubic(seg(t, t0, t0 + 0.8))
      if (k <= 0) return
      const dst = { x: rowX(j), y: ROW_Y }
      const mx = lerp(src.x, dst.x, 0.5)
      const my = Math.max(src.y, dst.y) + 60
      const x = (1 - k) ** 2 * src.x + 2 * (1 - k) * k * mx + k * k * dst.x
      const y = (1 - k) ** 2 * src.y + 2 * (1 - k) * k * my + k * k * dst.y
      ctx.fillStyle = colorOf(kind)
      ctx.fillRect(x, y, SQ, SQ)
    })
    K.fade(presence(t, T.pulse + 1.6), () => K.label(L('sequence'), VX, ROW_Y + 50, { size: 22, color: C.dim }))

    // ── the cut ────────────────────────────────────────────────────────
    const ck = inOutCubic(seg(t, T.cut, T.cut + 0.9))
    if (ck > 0) {
      const cy = layerY(15) - LG / 2 - lift * 18
      const x0 = VX - 60
      const x1 = x0 + (VW + 120) * ck
      K.fade(1 - outCubic(seg(t, T.lift + 0.6, T.lift + 1.2)), () => K.line(x0, cy, x1, cy, C.warn, 3, [10, 8]))
      // scissors at the cutting point
      K.fade(1 - outCubic(seg(t, T.cut + 0.9, T.cut + 1.3)), () => {
        const open = 0.35 * Math.abs(Math.sin(ck * Math.PI * 4))
        ctx.save()
        ctx.translate(x1, cy)
        ctx.strokeStyle = C.warn
        ctx.lineWidth = 5
        for (const sgn of [-1, 1]) {
          ctx.save()
          ctx.rotate(sgn * open)
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(-44, sgn * 4)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(-58, sgn * 12, 12, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        }
        ctx.restore()
      })
    }
    // the reason, beside the stack
    K.fade(presence(t, T.lift + 0.5, T.xattn + 0.1), () => {
      K.words(L('cut'), VX + 16, layerY(26), { t, t0: T.lift + 0.5, size: 32, weight: 600, fam: 'sans', maxW: VW - 30, lh: 1.25, ls: 0 })
    })

    // ── action expert ──────────────────────────────────────────────────
    const ek = outExpo(seg(t, 1.2, 1.8))
    K.fade(ek, () => {
      K.fillRR(EX.x, EX.y, EX.w, EX.h, 14, '#15181D')
      K.text(L('expert'), EX.x, EX.y - 22, { size: 32, weight: 700, fam: 'display', color: C.action })
      K.label('~100M · flow matching', EX.x, EX.y + EX.h + 40, { size: 22 })
    })
    // cross-attention: kept layers → expert
    for (let i = 0; i < 8; i++) {
      const k = outCubic(seg(t, T.xattn + i * 0.05, T.xattn + 0.5 + i * 0.05))
      if (k <= 0) continue
      const y0 = layerY(i * 2) + LH / 2
      K.fade(0.55, () => K.trace([{ x: VX + VW, y: y0 }, { x: lerp(VX + VW, EX.x, 0.5), y: y0 }, { x: EX.x, y: EX.y + 40 + i * 24 }], k, { color: C.lang, lw: 2 }))
    }
    K.fade(presence(t, T.xattn + 0.5), () => K.label(L('xattn'), VX + VW + 8, layerY(0) + LH + 34, { color: C.lang, size: 22 }))
    // denoising inside the expert
    const steps = Math.round(10 * seg(t, T.noise, T.chunk - 0.1))
    if (t > T.noise - 0.2) {
      const noise = 1 - steps / 10
      const traj = (u: number) => Math.sin(Math.PI * (1.1 * u - 0.1)) * 0.8
      const pts = K.sample((u) => {
        const f = u * 12
        const i0 = Math.floor(f)
        const sm = (f - i0) * (f - i0) * (3 - 2 * (f - i0))
        const n = (lerp(hash(i0, 21), hash(i0 + 1, 21), sm) - 0.5) * 2 * 80 + (hash(Math.round(u * 49), 22) - 0.5) * 30
        return { x: EX.x + 24 + u * (EX.w - 48), y: EX.y + EX.h / 2 - traj(u) * 70 + n * noise }
      }, 49)
      K.fade(outCubic(seg(t, T.noise - 0.2, T.noise + 0.1)), () => {
        K.trace(pts, 1, { color: noise > 0.05 ? C.mute : C.action, lw: 4 })
        K.label(`${L('step')} ${steps}/10`, EX.x + EX.w - 20, EX.y + 34, { align: 'right', size: 22, color: steps === 10 ? C.action : C.mute })
      })
    }

    // ── chunk → arm ────────────────────────────────────────────────────
    const flow = outCubic(seg(t, T.chunk, T.chunk + 0.7))
    if (flow > 0) {
      for (let j = 0; j < 50; j++) {
        const f = j / 49
        const x = lerp(EX.x + EX.w + 20, EX.x + EX.w + 20 + 240 * f, flow)
        const y = EX.y + EX.h / 2 + Math.sin(f * Math.PI * 2) * 10
        const consumed = seg(t, T.move + f * 1.0, T.move + f * 1.0 + 0.05)
        K.fade(outBack(seg(flow, f * 0.4, f * 0.4 + 0.6)) * (1 - consumed * 0.7), () => K.dot(x, y, 4.5, C.action))
      }
      K.fade(presence(t, T.chunk + 0.4), () => K.label(L('chunk'), EX.x + EX.w + 20, EX.y + EX.h / 2 - 34, { size: 22, color: C.action }))
    }
    const mv = inOutCubic(seg(t, T.move, T.move + 1.1))
    K.fade(outExpo(seg(t, 1.5, 2.2)), () => {
      ctx.save()
      ctx.translate(AB.x, AB.y)
      ctx.scale(0.5, 0.5)
      K.fillRR(-230, 0, 460, 24, 6, C.table)
      arm(K, { x: 0, y: 0 }, { x: lerp(-250, -380, mv), y: lerp(-420, -220, mv) }, { l1: 380, l2: 340, grip: lerp(1, 0.65, seg(t, T.move + 1.0, T.move + 1.2)) })
      ctx.restore()
    })

    // ── the loop closes back to the cameras ────────────────────────────
    const lk = inOutCubic(seg(t, T.loop, T.loop + 0.9))
    if (lk > 0) {
      const pts = [
        { x: AB.x, y: AB.y + 28 },
        { x: AB.x, y: 904 },
        { x: 56, y: 904 },
        { x: 56, y: CAM.ys[0] + CAM.h / 2 },
        { x: CAM.x - 8, y: CAM.ys[0] + CAM.h / 2 },
      ]
      const end = K.trace(pts, lk, { color: C.dim, lw: 3, dash: [8, 10] })
      if (lk >= 1 && end) K.arrow(CAM.x - 30, end.y, CAM.x - 6, end.y, { color: C.dim, lw: 3, head: 12 })
      K.fade(presence(t, T.loop + 0.6), () => K.label(L('loop'), 1360, 892, { align: 'center', size: 22, color: C.dim }))
    }

    ctx.restore()

    // ── click 2 punch ──────────────────────────────────────────────────
    if (t > T.lift) K.punch(L('punch'), t, T.lift + 0.9, { y: 975, size: 40, tout: T.xattn + 0.1 })

    // ── comparison strip ───────────────────────────────────────────────
    if (t > T.cmp) {
      const rows = [
        { name: 'OpenVLA', rest: L('cmp_open'), col: C.lang },
        { name: 'SmolVLA', rest: L('cmp_smol'), col: C.action },
      ]
      rows.forEach((r, i) => {
        const x = 72 + i * (W / 2 - 36)
        const k = seg(t, T.cmp + 0.2 + i * 0.25, T.cmp + 0.7 + i * 0.25)
        K.fade(outCubic(k), () => {
          ctx.save()
          ctx.translate(0, (1 - outExpo(k)) * 24)
          K.text(r.name, x, 972, { size: 36, weight: 700, fam: 'display', color: r.col })
          K.text(r.rest, x + K.measure(r.name, 36, 700, 'display') + 18, 970, { size: 27, weight: 500, color: C.paper })
          ctx.restore()
        })
      })
    }

    K.fade(presence(t, 0.8), () => K.cite(L('cite')))
  },
})

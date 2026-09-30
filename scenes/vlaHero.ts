/**
 * The hero scene: one VLA step, end to end, on the table the demo uses.
 *
 *   arrive   the table, the objects, the arm
 *   1 see    camera → patches (vision tokens) → every object detected
 *   2 read   the instruction is typed and split into sub-word tokens
 *   3 ground the named words pull the attention onto two objects; mask
 *   4 act    action tokens stream, the arm picks the bottle into the tray
 *   5 done   the payoff line
 *
 * Honesty: a VLA does not draw boxes or masks — grounding is implicit in its
 * attention. The boxes are how we SHOW it; the footnote says so on screen.
 */
import { defineScene } from '../lib/scene/types'
import { C, H, W } from '../lib/scene/kit'
import { alpha, clamp, inExpo, inOutCubic, keys, lerp, outBack, outCubic, outExpo, path2, presence, seg, step } from '../lib/scene/math'
import { GRIP_DROP, arm, bottle, camera, mug, table, trayBack, trayFront, vitaminBox, type Box } from '../lib/scene/robot'

const TY = 820
const BASE = { x: 1500, y: TY }
const X = { vit: 360, mug: 590, bot: 830, tray: 1130 }
const HOME = { x: 1290, y: 450 }

// wrist keyframes for the pick (seconds)
const KF = [
  [10.2, HOME.x, HOME.y],
  [11.2, X.bot, 430],
  [11.8, X.bot, TY - 70 - GRIP_DROP],
  [12.1, X.bot, TY - 70 - GRIP_DROP],
  [12.8, X.bot, 440],
  [13.9, X.tray, 440],
  [14.5, X.tray, TY - 82 - GRIP_DROP],
  [14.75, X.tray, TY - 82 - GRIP_DROP],
  [15.3, X.tray, 440],
  [16.3, HOME.x, HOME.y],
] as const
const wrist = (t: number) => (t < KF[0][0] ? HOME : path2(t, KF))
const GRIP_CLOSE = 11.85
const GRIP_OPEN = 14.6
const grip = (t: number) => lerp(lerp(1, 0.72, inOutCubic(seg(t, 11.8, 12.0))), 1, outExpo(seg(t, GRIP_OPEN, GRIP_OPEN + 0.18)))

/** Bottom-centre of the bottle: on the table, in the gripper, then in the tray. */
function bottlePos(t: number) {
  if (t < GRIP_CLOSE) return { x: X.bot, y: TY }
  if (t < GRIP_OPEN) {
    const w = wrist(t)
    return { x: w.x, y: w.y + GRIP_DROP + 70 }
  }
  const drop = inExpo(seg(t, GRIP_OPEN, GRIP_OPEN + 0.14))
  const w = wrist(GRIP_OPEN)
  const bounce = Math.sin(seg(t, GRIP_OPEN + 0.14, GRIP_OPEN + 0.34) * Math.PI) * 6
  return { x: w.x, y: lerp(w.y + GRIP_DROP + 70, TY - 12, drop) - bounce }
}

export default defineScene({
  cues: [2.2, 5.0, 7.7, 10.1, 16.4, 18.4],
  draw({ t, L, K, ctx }) {
    const stageK = (a: number, b: number) => seg(t, a, b)

    // ── stage ground ───────────────────────────────────────────────────
    K.grid(0.035 * outCubic(stageK(0, 0.8)))

    // camera: a slow push-in while the words find their objects
    const z = keys(t, [[0, 1.24], [7.7, 1.24], [8.7, 1.4], [10.1, 1.4], [10.9, 1.28], [16.4, 1.28], [17.4, 1.2]])
    const cx = keys(t, [[0, 900], [7.7, 900], [8.7, 1000], [10.1, 1000], [10.9, 960]])
    const cy = keys(t, [[0, 600], [7.7, 600], [8.7, 660], [10.1, 660], [10.9, 610]])
    const TX = W / 2
    const TYs = 610
    const S = (p: { x: number; y: number }) => ({ x: (p.x - cx) * z + TX, y: (p.y - cy) * z + TYs })
    ctx.save()
    ctx.translate(TX, TYs)
    ctx.scale(z, z)
    ctx.translate(-cx, -cy)

    const tableK = outExpo(stageK(0.1, 0.9))
    ctx.save()
    ctx.translate(0, (1 - tableK) * 60)
    ctx.globalAlpha = tableK
    table(K, TY, 150, 1790)
    ctx.restore()

    // ── vision patches (behind objects) ────────────────────────────────
    const pIn = stageK(2.35, 3.2)
    const pOut = 1 - stageK(10.1, 10.8)
    if (pIn > 0 && pOut > 0) {
      const focus = outCubic(stageK(7.9, 8.8))
      const b = bottlePos(t)
      for (let j = 0; j < 9; j++) {
        for (let i = 0; i < 16; i++) {
          const cx = i * 120 + 60
          const cy = j * 120 + 60
          const ak = seg(pIn, i / 16 * 0.7, i / 16 * 0.7 + 0.3)
          if (ak <= 0) continue
          const heat = Math.exp(-((cx - b.x) ** 2 + (cy - (TY - 90)) ** 2) / (2 * 140 * 140))
            + 0.8 * Math.exp(-((cx - X.tray) ** 2 + (cy - (TY - 50)) ** 2) / (2 * 150 * 150))
          const a = lerp(0.05, 0.03 + heat * 0.42, focus)
          ctx.globalAlpha = ak * pOut * a
          ctx.fillStyle = C.lang
          ctx.fillRect(i * 120 + 3, j * 120 + 3, 114, 114)
          ctx.globalAlpha = ak * pOut * 0.14
          ctx.strokeStyle = C.lang
          ctx.lineWidth = 1.5
          ctx.strokeRect(i * 120 + 3, j * 120 + 3, 114, 114)
        }
      }
      ctx.globalAlpha = 1
      // scan line sweeping the frame
      const sx = lerp(-40, W + 40, outCubic(stageK(2.3, 3.3)))
      if (t > 2.3 && t < 3.4) K.line(sx, 0, sx, H, alpha(C.lang, 0.7), 3)
    }


    // ── objects (drop in on arrival) ───────────────────────────────────
    const drop = (i: number) => {
      const k = step(t, 0.5 + i * 0.14)
      return { y: (1 - k) * -520, a: clamp(k * 4) }
    }
    const boxes: Record<string, Box> = {}
    const put = (i: number, fn: (dy: number) => Box, key: string) => {
      const d = drop(i)
      ctx.save()
      ctx.globalAlpha *= d.a
      boxes[key] = fn(d.y)
      ctx.restore()
    }
    trayBack(K, X.tray, TY)
    put(0, (dy) => vitaminBox(K, X.vit, TY + dy), 'vit')
    put(1, (dy) => mug(K, X.mug, TY + dy), 'mug')
    const bp = bottlePos(t)
    put(2, (dy) => bottle(K, bp.x, bp.y + dy), 'bot')
    boxes.tray = trayFront(K, X.tray, TY)

    // segmentation mask over the bottle
    const maskK = outCubic(stageK(8.5, 9.3)) * (1 - stageK(15.0, 15.5))
    if (maskK > 0) {
      const bb = boxes.bot
      ctx.save()
      ctx.beginPath()
      ctx.rect(bb.x - 6, bb.y - 6, bb.w + 12, (bb.h + 12) * maskK)
      ctx.clip()
      K.rr(bb.x + 10, bb.y, bb.w - 20, 34, 6)
      ctx.fillStyle = alpha(C.action, 0.55)
      ctx.fill()
      K.rr(bb.x, bb.y + 30, bb.w, bb.h - 30, 16)
      ctx.fill()
      ctx.strokeStyle = C.action
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.restore()
    }

    // ── the arm ────────────────────────────────────────────────────────
    const armK = outExpo(stageK(0.9, 1.7))
    const w = wrist(t)
    // planned path + the chunk ahead of the gripper
    if (t > 10.1 && t < 16.4) {
      const pk = outExpo(stageK(10.1, 10.7)) * (1 - stageK(15.9, 16.4))
      const pts = K.sample((u) => {
        const q = wrist(lerp(10.2, 16.3, u))
        return { x: q.x, y: q.y + GRIP_DROP }
      }, 90)
      ctx.globalAlpha = pk * 0.6
      K.trace(pts, pk, { color: C.action, lw: 3, dash: [3, 14] })
      ctx.globalAlpha = 1
      for (let i = 1; i <= 8; i++) {
        const q = wrist(t + i * 0.1)
        K.fade(pk * (1 - i / 10), () => K.dot(q.x, q.y + GRIP_DROP, 11 - i, C.action))
      }
    }
    ctx.save()
    ctx.translate((1 - armK) * 260, 0)
    ctx.globalAlpha *= armK
    arm(K, BASE, w, { l1: 400, l2: 380, grip: grip(t) })
    ctx.restore()

    // ── detections ─────────────────────────────────────────────────────
    const dim = outCubic(stageK(8.0, 8.6))
    const objs = [
      { key: 'vit', lab: L('obj_vit'), conf: 0.94 },
      { key: 'mug', lab: L('obj_mug'), conf: 0.91 },
      { key: 'bot', lab: L('obj_bot'), conf: 0.96 },
      { key: 'tray', lab: L('obj_tray'), conf: 0.93 },
    ]
    const detOut = 1 - stageK(15.6, 16.2)
    objs.forEach((o, i) => {
      const t0 = 3.2 + i * 0.16
      const bk = seg(t, t0, t0 + 0.3)
      if (bk <= 0) return
      const b = boxes[o.key]
      const target = o.key === 'bot' || o.key === 'tray'
      const s = lerp(1.14, 1, outBack(bk))
      let color: string = C.paper
      let a = detOut
      let lab: string | undefined = o.lab
      let conf: number | undefined = o.conf * outExpo(seg(t, t0 + 0.1, t0 + 0.5))
      if (target && dim > 0.5) color = C.action
      if (!target) {
        a *= lerp(1, 0.22, dim)
        if (dim > 0.4) lab = undefined
      }
      if (o.key === 'bot') a *= 1 - stageK(14.6, 14.9)
      if (o.key === 'tray' && t > 14.7) {
        color = C.ok
        lab = L('done')
        conf = outExpo(seg(t, 14.75, 15.2))
        a = 1 - stageK(17.8, 18.3)
      }
      const pad = 16
      const bw = (b.w + pad * 2) * s
      const bh = (b.h + pad * 2) * s
      K.detBox(b.x + b.w / 2 - bw / 2, b.y + b.h / 2 - bh / 2, bw, bh, {
        color, label: lab, conf, alpha: a, k: 1, labelK: seg(t, t0 + 0.1, t0 + 0.45),
      })
    })

    ctx.restore() // camera

    // the robot's camera, in screen space
    const camK = outCubic(stageK(2.1, 2.6)) * (1 - stageK(10.1, 10.6))
    K.fade(camK, () => camera(K, 110, 330, 0.5, { cone: 1, len: 1000, spread: 0.34, color: C.lang }))

    // ── the instruction and its tokens ─────────────────────────────────
    const toks = L('tokens').split('|')
    const ids = L('ids').split(' ')
    const sentence = toks.join('')
    const size = 46
    const tw = K.measure(sentence, size, 500, 'sans')
    const x0 = W / 2 - tw / 2
    const y0 = 150
    const chipIn = outExpo(stageK(5.0, 5.35))
    const chipOut = 1 - stageK(17.0, 17.4)
    if (chipIn > 0 && chipOut > 0) {
      ctx.save()
      ctx.globalAlpha *= chipIn * chipOut
      K.fillRR(x0 - 40, y0 - 56, tw + 80, 88, 44, C.bg2)
      K.strokeRR(x0 - 40, y0 - 56, tw + 80, 88, 44, C.faint, 2)
      const shown = K.typed(sentence, seg(t, 5.3, 6.6))
      K.text(shown, x0, y0 + 2, { size, weight: 500, color: C.paper })
      if (t < 7.0 && (t < 6.6 || Math.floor(t * 4) % 2 === 0)) {
        const cx = x0 + K.measure(shown, size, 500, 'sans') + 6
        ctx.fillStyle = C.lang
        ctx.fillRect(cx, y0 - 36, 4, 48)
      }
      // token brackets + ids
      let acc = ''
      toks.forEach((tok, i) => {
        const sx = x0 + K.measure(acc + (tok.startsWith(' ') ? ' ' : ''), size, 500, 'sans')
        acc += tok
        const ex = x0 + K.measure(acc, size, 500, 'sans')
        const tk = seg(t, 6.7 + i * 0.07, 6.95 + i * 0.07)
        if (tk <= 0) return
        const yb = y0 + 24
        const gA0 = Number(L('gA'))
        const grounded = (i >= gA0 && i < gA0 + Number(L('gAn'))) || i === Number(L('gB'))
        const col = grounded && dim > 0.3 ? C.action : C.lang
        ctx.save()
        ctx.globalAlpha *= outExpo(tk)
        K.line(sx + 3, yb, ex - 3, yb, col, 3)
        K.line(sx + 3, yb - 8, sx + 3, yb, col, 3)
        K.line(ex - 3, yb - 8, ex - 3, yb, col, 3)
        ctx.restore()
        if (chipOut > 0.5) K.text(ids[i] ?? '', (sx + ex) / 2, yb + 36, { size: 24, weight: 500, fam: 'mono', color: col, align: 'center', alpha: outExpo(tk) * 0.9 })
      })
      // grounding lines: words → objects
      const lineTo = (i0: number, i1: number, key: string, delay: number) => {
        const a0 = toks.slice(0, i0).join('')
        const a1 = toks.slice(0, i1 + 1).join('')
        const mx = x0 + (K.measure(a0, size, 500, 'sans') + K.measure(a1, size, 500, 'sans')) / 2
        const my = y0 + 70
        const b = boxes[key]
        const e = S({ x: b.x + b.w / 2, y: b.y - 40 })
        const tx = e.x
        const ty = e.y - 30
        const lk = inOutCubic(stageK(8.0 + delay, 8.6 + delay)) * (1 - stageK(15.6, 16.0))
        if (lk <= 0) return
        const pts = K.sample((u) => ({ x: lerp(mx, tx, u), y: (1 - u) ** 2 * my + 2 * (1 - u) * u * (my + 120) + u * u * ty }), 40)
        K.trace(pts, lk, { color: C.lang, lw: 3, dash: [10, 10] })
        if (lk >= 1) K.dot(tx, ty, 8, C.lang)
      }
      const gA = Number(L('gA'))
      const gB = Number(L('gB'))
      lineTo(gA, gA + Number(L('gAn')) - 1, 'bot', 0)
      lineTo(gB, gB, 'tray', 0.18)
      ctx.restore()
    }

    // ── action tokens strip ────────────────────────────────────────────
    const ak = outExpo(stageK(10.1, 10.5)) * (1 - stageK(16.0, 16.4))
    if (ak > 0) {
      const w0 = wrist(t - 0.03)
      const w1 = wrist(t + 0.03)
      const vx = (w1.x - w0.x) / 0.06 / 700
      const vy = (w1.y - w0.y) / 0.06 / 500
      const vals = [vx, -vy * 0.6, -vy, Math.sin(t * 3) * 0.12 * Math.abs(vx), vy * 0.3, vx * 0.2, grip(t) > 0.9 ? 0.9 : -0.9]
      const labs = ['Δx', 'Δy', 'Δz', 'Δroll', 'Δpitch', 'Δyaw', 'grip']
      const bx = 90
      const by = 330
      ctx.save()
      ctx.globalAlpha *= ak
      vals.forEach((v, i) => {
        const q = Math.round(clamp(v, -1, 1) * 10) / 10
        const x = bx + i * 96
        const hgt = q * 48
        ctx.fillStyle = C.action
        ctx.fillRect(x, by - Math.max(hgt, 0), 62, Math.abs(hgt) + 3)
        K.text(labs[i], x + 31, by + 84, { size: 22, weight: 500, fam: 'mono', color: C.mute, align: 'center' })
        K.text(String(Math.floor(((q + 1) / 2) * 255)), x + 31, by - 66, { size: 22, weight: 500, fam: 'mono', color: C.action, align: 'center' })
      })
      K.text(L('actions'), bx, by - 118, { size: 24, weight: 500, fam: 'mono', color: C.dim })
      ctx.restore()
    }

    // ── payoff ─────────────────────────────────────────────────────────
    if (t > 16.4) {
      K.words(L('outro'), W / 2, 170, { t, t0: 17.4, size: 64, align: 'center', maxW: 1500 })
    }

    // ── HUD ────────────────────────────────────────────────────────────
    const hud = presence(t, 1.0, Infinity, 0.4)
    K.fade(hud, () => {
      K.label(L('hud'), 72, 70, { color: C.mute })
      if (t > 10.1 && t < 16.4) K.label(`${Math.floor((t - 10.1) * 30).toString().padStart(3, '0')} · 30 Hz`, W - 72, 116, { align: 'right', color: C.action })
    })
    const phase = t < 5.0 ? 0 : t < 7.7 ? 1 : t < 10.1 ? 2 : 3
    if (t > 2.1 && t < 17.0) K.stepper([L('s1'), L('s2'), L('s3'), L('s4')], phase, presence(t, 2.1, 16.6), 70)
    K.fade(presence(t, 8.2, 17.0), () => K.cite(L('note')))
  },
})

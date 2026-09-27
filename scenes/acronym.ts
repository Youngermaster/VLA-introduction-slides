/**
 * V · L · A — what the three letters mean, one panel per click.
 *
 * Each panel floods with its colour from the bottom (the showreel's panel
 * move), the letter inverts, and a tiny mechanism plays inside it: a camera
 * frame splitting into patches, a sentence splitting into tokens, a gripper
 * tracing an arc. The words under each are the whole definition.
 */
import { defineScene } from '../lib/scene/types'
import { C, H } from '../lib/scene/kit'
import { clamp, inOutCubic, lerp, outBack, outCubic, outExpo, seg } from '../lib/scene/math'
import { bottle, mug, vitaminBox } from '../lib/scene/robot'

const COL = 640
const INK = C.bg

export default defineScene({
  cues: [2.0, 4.6, 7.2, 9.8],
  draw({ t, L, K, ctx }) {
    const panels = [
      { letter: 'V', word: L('v'), desc: L('vdesc'), bg: C.paper, t0: 2.0 },
      { letter: 'L', word: L('l'), desc: L('ldesc'), bg: C.lang, t0: 4.6 },
      { letter: 'A', word: L('a'), desc: L('adesc'), bg: C.action, t0: 7.2 },
    ]

    panels.forEach((p, i) => {
      const x0 = i * COL
      const cx = x0 + COL / 2
      const open = outExpo(seg(t, p.t0, p.t0 + 0.5))
      // flood from the bottom
      if (open > 0) {
        ctx.fillStyle = p.bg
        ctx.fillRect(x0 - 1, H * (1 - open), COL + 2, H * open + 2)
      }
      const ink = open > 0.55 ? INK : C.paper
      // the letter: rises on arrival, lifts when its panel opens
      const lift = outExpo(seg(t, p.t0 + 0.1, p.t0 + 0.7))
      const size = lerp(400, 300, lift)
      const y = lerp(640, 420, lift)
      const a = open > 0 ? 1 : lerp(1, 0.35, outCubic(seg(t, panels[0].t0, panels[0].t0 + 0.4)))
      K.fade(a, () => {
        K.rise(p.letter, cx, y, { t, t0: 0.15 + i * 0.18, size, weight: 800, color: ink, align: 'center', dur: 0.6 })
        K.words(p.word, cx, y + lerp(110, 90, lift), { t, t0: 0.9 + i * 0.18, size: 44, weight: 700, fam: 'display', color: ink, align: 'center', maxW: COL - 80 })
      })
      if (open <= 0) return

      // mechanism inside the panel (y 560–820)
      const m = (a0: number, a1: number) => seg(t, p.t0 + a0, p.t0 + a1)
      ctx.save()
      if (i === 0) {
        // a camera frame; the scene inside splits into patches
        const fx = cx - 220
        const fy = 580
        const fw = 440
        const fh = 248
        const k = outCubic(m(0.4, 0.8))
        ctx.globalAlpha = k
        K.fillRR(fx, fy, fw, fh, 14, '#DDE2E9')
        ctx.save()
        K.rr(fx, fy, fw, fh, 14)
        ctx.clip()
        ctx.fillStyle = '#C3C9D2'
        ctx.fillRect(fx, fy + fh - 44, fw, 44)
        vitaminBox(K, fx + 100, fy + fh - 44, 0.62)
        bottle(K, fx + 230, fy + fh - 44, 0.66)
        mug(K, fx + 340, fy + fh - 44, 0.62, '#7C8796')
        const g = m(0.9, 1.6)
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 7; c++) {
            const pk = seg(g, (r * 7 + c) / 28 * 0.6, (r * 7 + c) / 28 * 0.6 + 0.4)
            if (pk <= 0) continue
            ctx.strokeStyle = INK
            ctx.globalAlpha = k * pk * 0.9
            ctx.lineWidth = 3
            ctx.strokeRect(fx + c * (fw / 7) + 3, fy + r * (fh / 4) + 3, fw / 7 - 6, fh / 4 - 6)
          }
        }
        ctx.restore()
        K.strokeRR(fx, fy, fw, fh, 14, INK, 4)
      }
      else if (i === 1) {
        // a sentence typed, then split into token chips
        const sent = L('lsent')
        const toks = L('ltoks').split('|')
        const typeK = m(0.4, 1.2)
        const splitK = m(1.3, 2.0)
        if (splitK <= 0) {
          const s = K.typed(sent, typeK)
          K.text(s, cx, 690, { size: 40, weight: 500, color: INK, align: 'center' })
        }
        else {
          const widths = toks.map((tk) => K.measure(tk, 30, 500, 'mono') + 28)
          const gap = 12
          const total = widths.reduce((s, w) => s + w, 0) + gap * (toks.length - 1)
          let x = cx - total / 2
          toks.forEach((tk, j) => {
            const kk = outBack(seg(splitK, j * 0.1, j * 0.1 + 0.5))
            K.chip(tk, x, 650, { bg: INK, fg: C.lang, size: 30, k: kk })
            x += widths[j] + gap
          })
          ctx.globalAlpha = outCubic(seg(splitK, 0.5, 1))
          K.text(L('ltokhint'), cx, 780, { size: 26, weight: 500, fam: 'mono', color: INK, align: 'center' })
        }
      }
      else {
        // a gripper tracing an arc, action bars pulsing underneath
        const k = inOutCubic(m(0.5, 1.9))
        const ax = cx - 200
        const bx = cx + 220
        const pts = K.sample((u) => ({ x: lerp(ax, bx, u), y: 760 - Math.sin(u * Math.PI) * 170 + u * 0 }), 60)
        const end = K.trace(pts, k, { color: INK, lw: 6, dash: [2, 16] })
        K.dot(ax, 760, 10, INK)
        if (end && k > 0) {
          ctx.lineCap = 'round'
          ctx.strokeStyle = INK
          ctx.lineWidth = 12
          ctx.beginPath()
          ctx.moveTo(end.x, end.y - 44)
          ctx.lineTo(end.x, end.y - 10)
          ctx.moveTo(end.x - 26, end.y - 10)
          ctx.lineTo(end.x + 26, end.y - 10)
          ctx.moveTo(end.x - 22, end.y - 10)
          ctx.lineTo(end.x - 22, end.y + 22)
          ctx.moveTo(end.x + 22, end.y - 10)
          ctx.lineTo(end.x + 22, end.y + 22)
          ctx.stroke()
        }
        for (let j = 0; j < 7; j++) {
          const bk = outExpo(m(0.4 + j * 0.06, 0.8 + j * 0.06))
          const hgt = (0.3 + 0.7 * Math.abs(Math.sin(j * 1.7 + 0.5))) * 46 * bk
          ctx.fillStyle = INK
          ctx.fillRect(cx - 200 + j * 46, 850 - hgt, 30, hgt)
        }
      }
      ctx.restore()

      // the definition
      const dk = m(0.5, 1.2)
      K.words(p.desc, cx, 920, { t, t0: p.t0 + 0.6, size: 34, weight: 600, fam: 'sans', color: INK, align: 'center', maxW: COL - 100, lh: 1.2, ls: -0.01 })
      void dk
    })

    // the thin rules between columns before any panel opens
    const rule = 1 - clamp(seg(t, 2.0, 2.4))
    K.fade(outCubic(seg(t, 0.4, 1.2)) * rule, () => {
      K.line(COL, 300, COL, 900, C.faint, 2)
      K.line(COL * 2, 300, COL * 2, 900, C.faint, 2)
    })
  },
})

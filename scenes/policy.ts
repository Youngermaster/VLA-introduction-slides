/**
 * What a policy is: π(a | o, ℓ), built piece by piece, then each term earns
 * its picture underneath it.
 *
 *   arrive  title + the formula, letters still dim
 *   1 o     three camera frames + the six joint readings
 *   2 ℓ     the instruction chip
 *   3 a     π emits a chunk of 50 actions; a small arm plays it back;
 *           punchline: this is behaviour cloning, not RL
 */
import { defineScene } from '../lib/scene/types'
import { C, H, W, type Kit } from '../lib/scene/kit'
import { alpha, clamp, inOutCubic, lerp, mix, outBack, outCubic, outExpo, seg } from '../lib/scene/math'
import { arm } from '../lib/scene/robot'

// Greek letters are not in the bundled fonts, so the formula uses a math serif.
const MATH = "'Iowan Old Style', 'Times New Roman', Georgia, serif"

const FY = 420 // formula baseline
const FS = 150 // formula size
const PANEL_Y = 600

/** A tiny camera frame of the demo table, seen from one of three angles. */
function frame(K: Kit, x: number, y: number, w: number, h: number, view: number) {
  const { ctx } = K
  K.fillRR(x, y, w, h, 8, C.bg2)
  ctx.save()
  K.rr(x, y, w, h, 8)
  ctx.clip()
  const ty = y + h * (0.72 - view * 0.08)
  ctx.fillStyle = C.table
  ctx.fillRect(x, ty, w, h)
  ctx.fillStyle = C.faint
  ctx.fillRect(x, ty, w, 3)
  const s = 1 + view * 0.25
  const off = (view - 1) * w * 0.12
  // vitamin box, bottle, mug as flat shapes
  ctx.fillStyle = '#E9ECF1'
  ctx.fillRect(x + w * 0.2 + off, ty - 34 * s, 26 * s, 34 * s)
  ctx.fillStyle = '#FF8A6B'
  ctx.fillRect(x + w * 0.2 + off, ty - 28 * s, 26 * s, 9 * s)
  K.fillRR(x + w * 0.48 + off, ty - 30 * s, 20 * s, 30 * s, 5, '#E9ECF1')
  ctx.fillStyle = '#6FDCA8'
  ctx.fillRect(x + w * 0.48 + off, ty - 20 * s, 20 * s, 10 * s)
  ctx.fillStyle = '#7C8796'
  ctx.fillRect(x + w * 0.7 + off, ty - 22 * s, 22 * s, 22 * s)
  ctx.restore()
  K.strokeRR(x, y, w, h, 8, C.paper, 3)
}

/** The planned chunk: 50 values of one joint over the next ~1.7 s. */
const CHUNK = Array.from({ length: 50 }, (_, i) => {
  const u = i / 49
  return Math.sin(u * Math.PI * 1.15 - 0.3) * 0.75 + 0.12 * Math.sin(u * 9)
})

export default defineScene({
  cues: [2.4, 5.2, 7.4, 11.4],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t, 0.1, { tout: 10.3 })

    // ── the formula ────────────────────────────────────────────────────
    const parts = [
      { s: 'π', it: true, role: 'pi' },
      { s: '(', it: false, role: '' },
      { s: 'a', it: true, role: 'a' },
      { s: ' | ', it: false, role: '' },
      { s: 'o', it: true, role: 'o' },
      { s: ', ', it: false, role: '' },
      { s: 'ℓ', it: true, role: 'l' },
      { s: ')', it: false, role: '' },
    ] as const
    const font = (it: boolean) => `${it ? 'italic ' : ''}400 ${FS}px ${MATH}`
    const widths = parts.map((p) => {
      ctx.font = font(p.it)
      return ctx.measureText(p.s).width
    })
    const total = widths.reduce((a, b) => a + b, 0)
    let x = W / 2 - total / 2
    const at: Record<string, number> = {}
    const lit = {
      o: outCubic(seg(t, 2.5, 3.0)),
      l: outCubic(seg(t, 5.3, 5.8)),
      a: outCubic(seg(t, 7.5, 8.0)),
    }
    const tint = { o: C.paper, l: C.lang, a: C.action } as const
    parts.forEach((p, i) => {
      const k = outExpo(seg(t, 0.55 + i * 0.13, 1.15 + i * 0.13))
      at[p.role || `_${i}`] = x + widths[i] / 2
      if (k > 0) {
        ctx.save()
        ctx.globalAlpha = clamp(k * 2)
        if (k < 0.98) ctx.filter = `blur(${((1 - k) * 10).toFixed(1)}px)`
        ctx.font = font(p.it)
        ctx.textBaseline = 'alphabetic'
        let color: string = p.role === 'pi' ? C.paper : C.mute
        if (p.role === 'o' || p.role === 'l' || p.role === 'a') color = mix(C.mute, tint[p.role], lit[p.role])
        ctx.fillStyle = color
        ctx.fillText(p.s, x, FY + (1 - k) * 50)
        ctx.restore()
      }
      x += widths[i]
    })

    // ── panels: a (left), o (centre), ℓ (right) ─────────────────────────
    const panels = {
      a: { x: 72, w: 600 },
      o: { x: 700, w: 520 },
      l: { x: 1260, w: 588 },
    } as const
    const connector = (role: 'a' | 'o' | 'l', k: number) => {
      if (k <= 0) return
      const p = panels[role]
      const sx = at[role]
      const sy = FY + 40
      const ex = p.x + p.w / 2
      const ey = PANEL_Y - 18
      const pts = K.sample((u) => ({ x: lerp(sx, ex, inOutCubic(u)), y: lerp(sy, ey, u) }), 30)
      K.trace(pts, k, { color: alpha(tint[role], 0.8), lw: 3 })
      K.fillRR(sx - 22, FY + 26, 44, 5, 3, tint[role])
    }
    const panelLabel = (role: 'a' | 'o' | 'l', k: number) => {
      const p = panels[role]
      K.text(L(`${role}_label`), p.x + p.w / 2, PANEL_Y + 22, {
        size: 26, weight: 500, fam: 'mono', color: tint[role], align: 'center', alpha: k,
      })
    }

    // o: observation
    connector('o', outCubic(seg(t, 2.6, 3.2)))
    K.fade(outCubic(seg(t, 3.0, 3.4)), () => panelLabel('o', 1))
    const views = [L('cam1'), L('cam2'), L('cam3')]
    views.forEach((v, i) => {
      const k = outExpo(seg(t, 3.1 + i * 0.12, 3.7 + i * 0.12))
      if (k <= 0) return
      const fx = panels.o.x + 6 + i * 172
      ctx.save()
      ctx.globalAlpha *= clamp(k * 2)
      ctx.translate((1 - k) * -120, 0)
      frame(K, fx, PANEL_Y + 60, 160, 106, i)
      K.text(v, fx + 80, PANEL_Y + 200, { size: 22, weight: 500, fam: 'mono', color: C.mute, align: 'center' })
      ctx.restore()
    })
    const joints = [0.55, -0.35, 0.8, 0.2, -0.6, 0.45]
    joints.forEach((j, i) => {
      const k = outBack(seg(t, 3.8 + i * 0.07, 4.2 + i * 0.07))
      if (k <= 0) return
      const bx = panels.o.x + 70 + i * 66
      const base = PANEL_Y + 330
      const h = j * 64 * clamp(k)
      ctx.fillStyle = C.paper
      ctx.fillRect(bx, base - Math.max(h, 0), 40, Math.abs(h) + 3)
    })
    K.fade(outCubic(seg(t, 4.2, 4.6)), () => {
      ctx.fillStyle = alpha(C.paper, 0.25)
      ctx.fillRect(panels.o.x + 60, PANEL_Y + 330, 410, 2)
      K.text(L('joints'), panels.o.x + panels.o.w / 2, PANEL_Y + 400, { size: 22, weight: 500, fam: 'mono', color: C.mute, align: 'center' })
    })

    // ℓ: the instruction
    connector('l', outCubic(seg(t, 5.4, 6.0)))
    K.fade(outCubic(seg(t, 5.8, 6.2)), () => panelLabel('l', 1))
    const ck = outExpo(seg(t, 5.9, 6.5))
    if (ck > 0) {
      ctx.save()
      ctx.translate((1 - ck) * 160, 0)
      K.chip(L('instr'), panels.l.x + panels.l.w / 2, PANEL_Y + 130, { size: 30, k: ck, align: 'center', fam: 'sans', weight: 500, h: 64, pad: 26 })
      ctx.restore()
      K.text(L('instr_note'), panels.l.x + panels.l.w / 2, PANEL_Y + 262, {
        size: 22, weight: 500, fam: 'mono', color: C.mute, align: 'center', alpha: outCubic(seg(t, 6.4, 6.9)),
      })
    }

    // a: the chunk
    connector('a', outCubic(seg(t, 7.5, 8.1)))
    K.fade(outCubic(seg(t, 7.9, 8.3)), () => panelLabel('a', 1))
    const bx0 = panels.a.x + 50
    const pitch = 11
    const baseY = PANEL_Y + 130
    const E0 = 8.1 // emission start
    const X0 = 9.2 // playback start
    const X1 = 10.9
    const play = seg(t, X0, X1)
    const head = play * 50
    CHUNK.forEach((v, i) => {
      const k = outBack(seg(t, E0 + i * 0.016, E0 + i * 0.016 + 0.25))
      if (k <= 0) return
      const h = v * 72 * clamp(k)
      const done = i < head
      ctx.fillStyle = done ? alpha(C.action, 0.35) : C.action
      ctx.fillRect(bx0 + i * pitch, baseY - Math.max(h, 0), 7, Math.abs(h) + 2)
    })
    K.fade(outCubic(seg(t, 8.4, 8.8)), () => {
      ctx.fillStyle = alpha(C.action, 0.3)
      ctx.fillRect(bx0 - 6, baseY, 50 * pitch + 6, 2)
      K.text('a_t', bx0, baseY + 52, { size: 22, weight: 500, fam: 'mono', color: C.action })
      K.text('a_t+49', bx0 + 49 * pitch + 7, baseY + 52, { size: 22, weight: 500, fam: 'mono', color: C.action, align: 'right' })
    })
    if (play > 0 && play < 1) {
      const hx = bx0 + head * pitch
      K.line(hx, baseY - 70, hx, baseY + 70, C.paper, 3)
    }

    // the mini arm plays the chunk back
    const armK = outCubic(seg(t, 8.5, 9.0))
    if (armK > 0) {
      const idx = clamp(Math.floor(head), 0, 49)
      const frac = clamp(head - idx)
      const v = lerp(CHUNK[idx], CHUNK[Math.min(49, idx + 1)], frac)
      const s = 0.42
      const base = { x: 600, y: 1010 }
      const wrist = {
        x: base.x + lerp(-560, -150, inOutCubic(play)),
        y: base.y - 400 - v * 150,
      }
      ctx.save()
      ctx.globalAlpha *= armK
      ctx.translate(base.x, base.y)
      ctx.scale(s, s)
      ctx.translate(-base.x, -base.y)
      // the trail it has already drawn
      const trail = K.sample((u) => {
        const hh = u * head
        const i = clamp(Math.floor(hh), 0, 49)
        const vv = lerp(CHUNK[i], CHUNK[Math.min(49, i + 1)], clamp(hh - i))
        return { x: base.x + lerp(-560, -150, inOutCubic(hh / 50)), y: base.y - 400 - vv * 150 + 128 }
      }, 60)
      if (head > 0.5) K.trace(trail, 1, { color: alpha(C.action, 0.6), lw: 6, dash: [4, 16] })
      arm(K, base, wrist, { l1: 400, l2: 380, grip: 0.8 })
      ctx.restore()
    }

    // ── the punchline ──────────────────────────────────────────────────
    K.punch(L('punch'), t, 10.5, { y: 132, maxW: 1700, size: 44 })
  },
})

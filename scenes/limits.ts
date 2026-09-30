/**
 * The honest part: three things that still don't work.
 *
 *   1  what "saturated benchmark" means, full width: a benchmark is a
 *      standard exam; scores climb from 76.5 to 98.6 and pile up under the
 *      ceiling; so the exam no longer tells models apart, and a 98 % says
 *      little about your table
 *   2  that explanation collapses into column 1; the real test is a real
 *      robot: blind A/B arms, votes; DROID's scale
 *   3  fragile: the light changes, the same reach misses; diversity > volume
 */
import { defineScene } from '../lib/scene/types'
import { C, type Kit } from '../lib/scene/kit'
import { alpha, inOutCubic, lerp, outBack, outCubic, outExpo, path2, presence, seg } from '../lib/scene/math'
import { arm, bottle, cube } from '../lib/scene/robot'

const COL = [110, 710, 1310] as const
const CW = 500
const GY = 560 // glyph ground line
const HEAD_Y = 660

/** A column's headline + fact, blur-rising from t0. */
function caption(K: Kit, t: number, t0: number, x: number, head: string, fact: string, extra?: string) {
  const hh = K.words(head, x, HEAD_Y, { t, t0, size: 40, weight: 700, fam: 'sans', ls: -0.01, maxW: CW, stagger: 0.03 })
  const fh = K.words(fact, x, HEAD_Y + hh + 8, { t, t0: t0 + 0.25, size: 28, weight: 500, fam: 'sans', ls: 0, color: C.dim, maxW: CW, lh: 1.3, stagger: 0.015, accent: C.paper })
  if (extra) K.words(extra, x, HEAD_Y + hh + fh + 18, { t, t0: t0 + 0.6, size: 24, weight: 500, fam: 'mono', ls: 0, color: C.mute, maxW: CW, lh: 1.35, stagger: 0.012, accent: C.lang })
}

export default defineScene({
  cues: [1.4, 6.0, 9.8, 13.5],
  draw({ t: T, L, K, ctx }) {
    K.title(L('title'), T)

    // ── 1 · the explanation, full width (click 1 only) ───────────────────
    const big = presence(T, 1.5, 6.05, 0.3, 0.35)
    if (big > 0) K.fade(big, () => {
      const x0 = 110
      const base = 880
      const scale = 520 // 100 % = 520 px
      const top = base - scale
      // the ceiling: 100 % and the 95-100 band where everyone now sits
      const ck = outCubic(seg(T, 1.6, 2.2))
      K.line(x0, base, x0 + 820 * ck, base, C.faint, 3)
      K.line(x0, top, x0 + 820 * ck, top, C.mute, 2, [6, 8])
      K.text('100 %', x0 + 830, top + 8, { size: 24, weight: 600, fam: 'mono', color: C.mute, alpha: ck })
      const bandK = outCubic(seg(T, 3.6, 4.1))
      if (bandK > 0) {
        ctx.save()
        ctx.globalAlpha *= bandK * 0.16
        ctx.fillStyle = C.action
        ctx.fillRect(x0, top, 820, scale * 0.05)
        ctx.restore()
        K.text(L('band'), x0 + 830, top + scale * 0.05 + 30, { size: 22, weight: 500, fam: 'mono', color: C.action, alpha: bandK })
      }
      const bars = [
        { v: 76.5, lab: 'OpenVLA', yr: '2024' },
        { v: 97.1, lab: 'OpenVLA-OFT', yr: '2025' },
        { v: 98.5, lab: 'Cosmos Policy', yr: '2026' },
        { v: 98.6, lab: 'LaWAM', yr: '2026' },
      ]
      bars.forEach((b, i) => {
        const k = outExpo(seg(T, 1.9 + i * 0.35, 2.9 + i * 0.35))
        if (k <= 0) return
        const bx = x0 + 30 + i * 200
        const h = (b.v / 100) * scale * k
        ctx.fillStyle = i === 0 ? '#3A4150' : C.paper
        ctx.fillRect(bx, base - h, 130, h)
        // value inside the bar's top, so it never collides with the ceiling
        K.text((b.v * k).toFixed(1), bx + 65, base - h + 44, { size: 30, weight: 700, fam: 'mono', color: i === 0 ? C.paper : C.bg, align: 'center', alpha: Math.min(1, k * 3) })
        K.text(b.lab, bx + 65, base + 36, { size: 22, weight: 500, fam: 'mono', color: C.dim, align: 'center', alpha: k })
        K.text(b.yr, bx + 65, base + 64, { size: 20, weight: 500, fam: 'mono', color: C.mute, align: 'center', alpha: k })
      })
      K.label(L('axis'), x0, top - 30, { alpha: ck })

      // the words: what it is, what saturated means, why it matters
      const tx = 1110
      const tw = 700
      let y = 330
      y += K.words(L('what'), tx, y, { t: T, t0: 1.9, size: 40, weight: 700, fam: 'display', maxW: tw, lh: 1.15 }) + 14
      y += K.words(L('whatf'), tx, y, { t: T, t0: 2.2, size: 30, weight: 500, fam: 'sans', ls: 0, color: C.dim, maxW: tw, lh: 1.3, stagger: 0.015, accent: C.paper }) + 40
      y += K.words(L('sat'), tx, y, { t: T, t0: 3.7, size: 30, weight: 600, fam: 'sans', ls: 0, maxW: tw, lh: 1.3, stagger: 0.015 }) + 40
      K.text(L('why'), tx, y, { size: 22, weight: 600, fam: 'mono', color: C.action, alpha: outCubic(seg(T, 4.6, 5.0)) })
      K.words(L('whyf'), tx, y + 46, { t: T, t0: 4.8, size: 30, weight: 500, fam: 'sans', ls: 0, maxW: tw, lh: 1.3, stagger: 0.015 })
    })
    // Everything below keeps the original 3-column timing, shifted so it
    // starts once the explanation above has cleared.
    const t = T - 1.9

    // ── 1 · saturated benchmarks, compact (from click 2) ────────────────
    if (T > 6.3) {
      const t = T - 6.3 + 1.5 // replay the column's own entrance, fast

      const x0 = COL[0]
      const base = GY
      const scale = 300 // 100 % = 300 px
      const bars = [
        { v: 97.1, lab: 'OFT' },
        { v: 98.5, lab: 'Cosmos' },
        { v: 98.6, lab: 'LaWAM' },
      ]
      const ak = outExpo(seg(t, 1.5, 1.9))
      if (ak > 0) K.line(x0, base, x0 + CW * ak, base, C.faint, 3)
      bars.forEach((b, i) => {
        const k = outExpo(seg(t, 1.6 + i * 0.18, 2.8 + i * 0.18))
        if (k <= 0) return
        const bx = x0 + 40 + i * 150
        const h = (b.v / 100) * scale * k
        ctx.fillStyle = alpha(C.paper, 0.22)
        ctx.fillRect(bx, base - h, 100, h)
        // the part above 95 %: where every paper now lives
        const cap = Math.max(0, h - 0.95 * scale)
        const ck = outCubic(seg(t, 3.2, 3.7))
        ctx.fillStyle = ck > 0 ? alpha(C.action, lerp(0.22, 1, ck)) : alpha(C.paper, 0.22)
        ctx.fillRect(bx, base - h, 100, cap)
        K.text((b.v * k).toFixed(1), bx + 50, base - h - 18, { size: 28, weight: 500, fam: 'mono', color: C.paper, align: 'center', alpha: Math.min(1, k * 3) })
        K.text(b.lab, bx + 50, base + 36, { size: 22, weight: 500, fam: 'mono', color: C.mute, align: 'center', alpha: k })
      })
      // the 95 % line every paper clears
      const bk = outCubic(seg(t, 3.2, 3.8))
      if (bk > 0) {
        const y95 = base - 0.95 * scale
        K.line(x0 + 20, y95, x0 + 20 + (CW - 40) * bk, y95, C.action, 3, [6, 8])
        K.text('95 %', x0 + CW - 20, y95 + 34, { size: 24, weight: 600, fam: 'mono', color: C.action, align: 'right', alpha: bk })
      }
      caption(K, t, 1.8, x0, L('c1'), L('c1f'))
    }

    // ── 2 · real robots, blind A/B ──────────────────────────────────────
    {
      const cx = COL[1] + CW / 2
      const k = outExpo(seg(t, 4.5, 5.2))
      const reach = inOutCubic(seg(t, 5.0, 6.2))
      const sides = [
        { dir: 1, name: 'A', votes: 3 },
        { dir: -1, name: 'B', votes: 5 },
      ] as const
      sides.forEach((s, i) => {
        if (k <= 0) return
        const bx = cx - s.dir * 190
        ctx.save()
        ctx.globalAlpha *= k
        ctx.translate(bx, GY - 60)
        ctx.scale(s.dir * 0.34, 0.34)
        cube(K, 360, 0, i ? C.lang : C.action, 1)
        const w = path2(reach, [[0, 140, -420], [0.6, 360, -300], [1, 360, -96 - 128 - 20]])
        arm(K, { x: 0, y: 0 }, w, { l1: 380, l2: 340, grip: lerp(1, 0.6, seg(reach, 0.85, 1)) })
        ctx.restore()
        K.text(s.name, bx - 70, GY + 50, { size: 40, weight: 800, fam: 'display', color: C.paper, align: 'center', alpha: k })
        // votes
        for (let v = 0; v < s.votes; v++) {
          const vk = outBack(seg(t, 6.2 + v * 0.1 + i * 0.05, 6.5 + v * 0.1 + i * 0.05))
          if (vk <= 0) continue
          const vx = bx - 26 + v * 22
          ctx.save()
          ctx.globalAlpha *= Math.min(1, vk * 3)
          ctx.fillStyle = C.lang
          ctx.fillRect(vx - 7, GY + 18 + (1 - vk) * 10, 14, 32)
          ctx.restore()
        }
      })
      // the curtain: the judge never knows which policy is which
      const ck = inOutCubic(seg(t, 4.8, 5.4))
      if (ck > 0) {
        K.line(cx, GY - 330, cx, lerp(GY - 330, GY + 50, ck), C.mute, 3, [8, 10])
        K.text('?', cx, GY - 350, { size: 44, weight: 800, fam: 'display', color: C.mute, align: 'center', alpha: ck })
      }
      caption(K, t, 5.4, COL[1], L('c2'), L('c2f'), L('c2g'))
    }

    // ── 3 · fragile ─────────────────────────────────────────────────────
    {
      const x0 = COL[2]
      const cx = x0 + CW / 2
      const k = outExpo(seg(t, 8.0, 8.6))
      // the light changes: the column's ground warms and a lamp appears
      const lk = outCubic(seg(t, 8.6, 9.2))
      if (lk > 0) {
        const lx = x0 + 40
        const ly = 300
        K.line(lx, 250, lx, ly - 20, C.mute, 3)
        ctx.save()
        ctx.globalAlpha *= lk
        ctx.fillStyle = C.action
        ctx.beginPath()
        ctx.moveTo(lx - 30, ly)
        ctx.lineTo(lx + 30, ly)
        ctx.lineTo(lx + 18, ly - 26)
        ctx.lineTo(lx - 18, ly - 26)
        ctx.closePath()
        ctx.fill()
        ctx.globalAlpha *= 0.12
        ctx.beginPath()
        ctx.moveTo(lx - 30, ly)
        ctx.lineTo(lx + 30, ly)
        ctx.lineTo(lx + 180, GY)
        ctx.lineTo(lx - 20, GY)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      if (k > 0) {
        const reach = inOutCubic(seg(t, 9.2, 10.4))
        ctx.save()
        ctx.globalAlpha *= k
        ctx.translate(cx + 60, GY)
        ctx.scale(0.42, 0.42)
        bottle(K, -420, 0, 1)
        // the reach lands 110 px short: the policy saw a different scene
        const w = path2(reach, [[0, 60, -380], [0.6, -310, -330], [1, -310, -70 - 128]])
        arm(K, { x: 240, y: 0 }, w, { l1: 380, l2: 340, grip: lerp(1, 0.35, seg(reach, 0.85, 1)) })
        ctx.restore()
        K.line(x0 - 10, GY, x0 + CW + 10, GY, C.faint, 3)
        const xk = outBack(seg(t, 10.4, 10.7))
        if (xk > 0) {
          const mx = cx + 60 + -310 * 0.42
          const my = GY - (70 + 20) * 0.42
          ctx.save()
          ctx.translate(mx, my - 70)
          ctx.scale(xk, xk)
          K.line(-18, -18, 18, 18, C.warn, 7)
          K.line(18, -18, -18, 18, C.warn, 7)
          ctx.restore()
        }
      }
      caption(K, t, 8.4, x0, L('c3'), L('c3f'))
    }

    K.punch(L('punch'), t, 10.6, { y: 972, size: 38, maxW: 1760 })
    K.fade(presence(T, 2.2) * (1 - seg(t, 10.4, 10.6)), () => K.cite(L('cite')))
  },
})

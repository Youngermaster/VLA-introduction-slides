/**
 * What pre-training buys you.
 *
 *   arrive  title, the empty base model
 *   1       phase 1: 481 community datasets rain into smolvla_base; counters
 *   2       phase 2: your ~50 episodes (5 positions × 10) fine-tune a copy
 *   3       the same 50 episodes without phase 1 fail; with it, they work
 */
import { defineScene } from '../lib/scene/types'
import { C, W, type Kit } from '../lib/scene/kit'
import { alpha, clamp, hash, inOutCubic, lerp, outBack, outCubic, outExpo, path2, presence, seg } from '../lib/scene/math'
import { GRIP_DROP, arm, cube } from '../lib/scene/robot'

const P1 = 1.8
const P2 = 5.2
const P3 = 8.4

const B1 = { x: 110, y: 540, w: 440, h: 200 }
const B2 = { x: 1180, y: 540, w: 500, h: 200 }
const TILES = 481
const RAIN0 = P1 + 0.2
const RAIN = 2.4

function modelBlock(K: Kit, b: { x: number; y: number; w: number; h: number }, fill: number, band: number, name: string) {
  const { ctx } = K
  K.fillRR(b.x, b.y, b.w, b.h, 18, C.bg2)
  if (fill > 0) {
    ctx.save()
    K.rr(b.x, b.y, b.w, b.h, 18)
    ctx.clip()
    ctx.fillStyle = alpha(C.lang, 0.28)
    ctx.fillRect(b.x, b.y + b.h * (1 - fill), b.w, b.h * fill)
    ctx.restore()
  }
  if (band > 0) {
    ctx.save()
    K.rr(b.x, b.y, b.w, b.h, 18)
    ctx.clip()
    ctx.fillStyle = C.action
    ctx.fillRect(b.x, b.y + b.h - 26, b.w * band, 26)
    ctx.restore()
  }
  K.strokeRR(b.x, b.y, b.w, b.h, 18, fill > 0.5 ? C.lang : C.faint, 3)
  K.text(name, b.x + b.w / 2, b.y + b.h / 2 + 14, { size: 38, weight: 700, fam: 'display', color: C.paper, align: 'center' })
}

export default defineScene({
  cues: [1.6, P2, P3, P3 + 2.6],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)
    const swap = 1 - outCubic(seg(t, P3, P3 + 0.35))

    // ── phase 1 ────────────────────────────────────────────────────────
    K.fade(swap, () => {
      const hk = presence(t, 0.4, Infinity, 0.5)
      K.fade(hk, () => {
        K.text(L('phase1'), B1.x, 262, { size: 30, weight: 700, fam: 'display', color: C.lang })
        K.text(L('phase1Sub'), B1.x, 298, { size: 22, weight: 500, fam: 'mono', color: C.dim })
      })
      // the rain: each tile falls into the block and is gone
      let landed = 0
      for (let i = 0; i < TILES; i++) {
        const t0 = RAIN0 + (i / TILES) * RAIN + hash(i, 1) * 0.15
        const k = seg(t, t0, t0 + 0.55)
        if (k >= 1) {
          landed++
          continue
        }
        if (k <= 0) continue
        const x = B1.x + 20 + hash(i, 2) * (B1.w - 50)
        const y0 = 330 + hash(i, 3) * 60
        const y = lerp(y0, B1.y + 10, k * k)
        ctx.fillStyle = alpha(hash(i, 4) > 0.5 ? C.paper : C.dim, 0.85 * clamp(k * 5))
        ctx.fillRect(x, y, 12, 12)
      }
      const fill = landed / TILES
      const bk = outExpo(seg(t, 0.5, 1.1))
      ctx.save()
      ctx.globalAlpha *= bk
      modelBlock(K, B1, fill, 0, 'smolvla_base')
      ctx.restore()
      // counters
      const ck = seg(t, RAIN0, RAIN0 + RAIN + 0.4)
      if (ck > 0) {
        const rows: [string, string][] = [
          [K.count(0, 481, ck), L('datasets')],
          [`${(22.9 * outExpo(ck)).toFixed(1)}K`, L('episodes')],
          [`${(10.6 * outExpo(ck)).toFixed(1)}M`, L('frames')],
        ]
        rows.forEach(([n, lab], i) => {
          const y = B1.y + 40 + i * 88
          K.text(n, B1.x + B1.w + 44, y, { size: 44, weight: 700, fam: 'display', color: C.lang, alpha: clamp(ck * 6) })
          K.text(lab, B1.x + B1.w + 44, y + 30, { size: 22, weight: 500, fam: 'mono', color: C.dim, alpha: clamp(ck * 6) })
        })
      }
      K.fade(outCubic(seg(t, RAIN0 + RAIN, RAIN0 + RAIN + 0.5)), () =>
        K.text(L('gpu'), B1.x, B1.y + B1.h + 110, { size: 30, weight: 600, fam: 'sans', color: C.dim }))
    })

    // ── phase 2 ────────────────────────────────────────────────────────
    K.fade(swap, () => {
      const hk = presence(t, P2, Infinity, 0.4)
      if (hk <= 0) return
      K.fade(hk, () => {
        K.text(L('phase2'), B2.x, 262, { size: 30, weight: 700, fam: 'display', color: C.action })
        K.text(L('phase2Sub'), B2.x, 298, { size: 22, weight: 500, fam: 'mono', color: C.dim })
      })
      // the weights come down
      const dk = inOutCubic(seg(t, P2 + 0.1, P2 + 0.7))
      if (dk > 0) {
        K.arrow(B1.x + B1.w + 250, B1.y + B1.h / 2, B2.x - 24, B2.y + B2.h / 2, { color: C.lang, k: dk, lw: 4 })
        K.label(L('download'), (B1.x + B1.w + 250 + B2.x) / 2, B1.y + B1.h / 2 - 22, { align: 'center', color: C.lang, alpha: dk })
      }
      const bk = outExpo(seg(t, P2 + 0.5, P2 + 1.0))
      // your 50 episodes: 5 positions × 10
      let arrived = 0
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 10; c++) {
          const i = r * 10 + c
          const x0 = B2.x + 70 + c * 38
          const y0 = 340 + r * 34
          const inK = outBack(seg(t, P2 + 0.4 + i * 0.012, P2 + 0.7 + i * 0.012))
          const f = inOutCubic(seg(t, P2 + 1.4 + i * 0.02, P2 + 1.9 + i * 0.02))
          if (f >= 1) {
            arrived++
            continue
          }
          if (inK <= 0) continue
          const x = lerp(x0, B2.x + B2.w / 2 - 12, f)
          const y = lerp(y0, B2.y + B2.h - 30, f)
          ctx.fillStyle = C.action
          ctx.globalAlpha = clamp(inK) * (1 - f * 0.6)
          ctx.fillRect(x, y, 24 * lerp(1, 0.5, f), 24 * lerp(1, 0.5, f))
          ctx.globalAlpha = 1
        }
      }
      ctx.save()
      ctx.globalAlpha *= bk
      modelBlock(K, B2, 1, arrived / 50, 'smolvla_base')
      ctx.restore()
      K.fade(outCubic(seg(t, P2 + 2.6, P2 + 3.0)), () =>
        K.text(L('hours'), B2.x, B2.y + B2.h + 110, { size: 30, weight: 600, fam: 'sans', color: C.dim }))
    })

    // ── without vs with phase 1 ────────────────────────────────────────
    const ck = outCubic(seg(t, P3 + 0.25, P3 + 0.6))
    if (ck > 0) {
      const panels = [
        { x: 120, ok: false, head: L('without') },
        { x: 1020, ok: true, head: L('with') },
      ]
      panels.forEach((p, pi) => {
        ctx.save()
        ctx.globalAlpha *= ck
        K.text(p.head, p.x, 262, { size: 34, weight: 700, fam: 'display', color: p.ok ? C.ok : C.warn })
        // 50 tiles + model
        for (let i = 0; i < 50; i++) {
          ctx.fillStyle = C.action
          ctx.fillRect(p.x + (i % 10) * 22, 320 + Math.floor(i / 10) * 22, 16, 16)
        }
        K.text('+', p.x + 250, 390, { size: 48, weight: 700, fam: 'display', color: C.dim })
        const mb = { x: p.x + 300, y: 318, w: 250, h: 104 }
        K.fillRR(mb.x, mb.y, mb.w, mb.h, 14, C.bg2)
        if (p.ok) {
          ctx.save()
          K.rr(mb.x, mb.y, mb.w, mb.h, 14)
          ctx.clip()
          ctx.fillStyle = alpha(C.lang, 0.28)
          ctx.fillRect(mb.x, mb.y, mb.w, mb.h)
          ctx.restore()
        }
        K.strokeRR(mb.x, mb.y, mb.w, mb.h, 14, p.ok ? C.lang : C.faint, 3)
        K.text(p.ok ? 'smolvla_base' : L('random'), mb.x + mb.w / 2, mb.y + mb.h / 2 + 10, { size: p.ok ? 26 : 24, weight: 600, fam: p.ok ? 'display' : 'mono', color: p.ok ? C.paper : C.mute, align: 'center' })
        // the mini arm tries the task
        const a0 = P3 + 0.6 + pi * 0.15
        const u = seg(t, a0, a0 + 1.4)
        const cubeX = -250
        const target = p.ok ? { x: cubeX, y: -176 } : { x: cubeX + 110, y: -176 }
        const w = path2(u, [[0, 70, -380], [0.45, target.x, -330], [0.7, target.x, -176], [1, target.x, p.ok ? -330 : -176]])
        const grip = u < 0.7 ? 1 : lerp(1, p.ok ? 0.62 : 0, seg(u, 0.7, 0.8))
        const held = p.ok && u > 0.8
        const base = { x: p.x + 560, y: 820 }
        ctx.translate(base.x, base.y)
        ctx.scale(0.62, 0.62)
        K.ctx.fillStyle = C.table
        K.ctx.fillRect(-520, 0, 760, 40)
        K.ctx.fillStyle = C.faint
        K.ctx.fillRect(-520, 0, 760, 5)
        cube(K, held ? w.x : cubeX, held ? w.y + GRIP_DROP + 48 : 0, C.action)
        arm(K, { x: 0, y: 0 }, w, { l1: 300, l2: 290, grip })
        ctx.restore()
        // verdict
        const vk = outBack(seg(t, a0 + 1.4, a0 + 1.7))
        if (vk > 0) {
          const vx = p.x + 80
          const vy = 700
          ctx.save()
          ctx.translate(vx, vy)
          ctx.scale(vk, vk)
          if (p.ok) {
            K.trace([{ x: -28, y: 0 }, { x: -8, y: 22 }, { x: 32, y: -26 }], 1, { color: C.ok, lw: 10 })
          }
          else {
            K.line(-24, -24, 24, 24, C.warn, 10)
            K.line(24, -24, -24, 24, C.warn, 10)
          }
          ctx.restore()
          K.text(p.ok ? L('works') : L('fails'), vx - 30, vy + 80, { size: 28, weight: 600, fam: 'sans', color: p.ok ? C.ok : C.warn, alpha: clamp(vk) })
        }
      })
      K.fade(ck, () => K.line(W / 2 - 20, 240, W / 2 - 20, 860, alpha(C.paper, 0.1), 2))
    }

    K.punch(L('punch'), t, P3 + 1.9, { y: 960, size: 44 })
    K.cite(L('cite'), presence(t, 0.4, Infinity, 0.4))
  },
})

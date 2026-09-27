/**
 * The asymmetry that explains the whole talk.
 *
 *   arrive  title
 *   1       text: a torrent of tokens fills a block; the counter rolls to ~15T
 *   2       robots: one small arm lives each episode in real time; bars crawl
 *   3       the punchline
 */
import { defineScene } from '../lib/scene/types'
import { C, H, W } from '../lib/scene/kit'
import { alpha, clamp, hash, lerp, outCubic, outExpo, path2, presence, seg } from '../lib/scene/math'
import { GRIP_DROP, arm, cube, table } from '../lib/scene/robot'

// token block, left half
const GX = 72
const GY = 250
const COLS = 46
const ROWS = 24
const CELL = 15
const GAP = 3

// the robot, right half (drawn at half scale around its base)
const RB = { x: 1400, y: 590 }
const RS = 0.6
const EP0 = 5.4
const EPD = 1.0
const EPISODES = 4
const SRC = -250
const DST = 250

/** One pick-and-place, local to the arm (table at y = 0, base at x = 0). u ∈ [0, 1]. */
function episode(u: number, src: number, dst: number) {
  const home = { x: 60, y: -360 }
  const kf = [
    [0, home.x, home.y],
    [0.18, src, -330],
    [0.3, src, -176],
    [0.38, src, -176],
    [0.5, src, -330],
    [0.66, dst, -330],
    [0.76, dst, -176],
    [0.83, dst, -176],
    [0.9, dst, -330],
    [1, home.x, home.y],
  ] as const
  const w = path2(u, kf)
  const grip = u < 0.3 ? 1 : u < 0.36 ? lerp(1, 0.62, seg(u, 0.3, 0.36)) : u < 0.77 ? 0.62 : lerp(0.62, 1, seg(u, 0.77, 0.83))
  const carried = u >= 0.35 && u < 0.79
  const obj = carried ? { x: w.x, y: w.y + GRIP_DROP + 48 } : { x: u < 0.35 ? src : dst, y: 0 }
  return { w, grip, obj }
}

export default defineScene({
  cues: [1.6, 5.0, EP0 + EPD * EPISODES + 0.3, EP0 + EPD * EPISODES + 2.6],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)

    // ── text: the torrent ──────────────────────────────────────────────
    const tk = seg(t, 1.9, 4.1)
    const labA = presence(t, 0.5, Infinity, 0.6)
    K.fade(labA, () => K.label(L('textLabel'), GX, GY - 26, { color: C.lang }))
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c
        const on = hash(i, 3) * 0.55 + (c / COLS) * 0.45
        const k = clamp((tk - on * 0.9) / 0.1)
        const x = GX + c * (CELL + GAP)
        const y = GY + r * (CELL + GAP)
        if (k <= 0) {
          if (labA > 0) {
            ctx.fillStyle = alpha(C.paper, 0.04 * labA)
            ctx.fillRect(x, y, CELL, CELL)
          }
          continue
        }
        ctx.fillStyle = alpha(C.lang, lerp(0.35, 0.55 + hash(i, 9) * 0.45, k))
        ctx.fillRect(x, y + (1 - outExpo(k)) * -14, CELL, CELL)
      }
    }
    const blockBottom = GY + ROWS * (CELL + GAP)
    const nk = seg(t, 2.0, 4.4)
    if (nk > 0) {
      K.text(`~${K.count(0, 15_000_000_000_000, nk)}`, GX, blockBottom + 92, { size: 62, weight: 700, fam: 'display', color: C.lang, alpha: clamp(nk * 5) })
      K.text(L('textSub'), GX, blockBottom + 140, { size: 26, weight: 500, fam: 'mono', color: C.dim, alpha: outCubic(seg(t, 4.0, 4.6)) })
    }

    // ── robots: one episode at a time ──────────────────────────────────
    const rA = presence(t, 5.0, Infinity, 0.4)
    K.fade(presence(t, 0.5, Infinity, 0.6) * (1 - rA), () => K.label(L('robotLabel'), 1010, GY - 26, { color: C.action, alpha: 0.5 }))
    if (rA > 0) {
      K.fade(rA, () => K.label(L('robotLabel'), 1010, GY - 26, { color: C.action }))
      const u = (t - EP0) / EPD
      const e = clamp(Math.floor(u), 0, EPISODES - 1)
      const inEp = u >= 0 && u < EPISODES
      const flip = e % 2 === 1
      const st = inEp ? episode(u - e, flip ? DST : SRC, flip ? SRC : DST) : episode(0, SRC, DST)
      if (u >= EPISODES) st.obj = { x: EPISODES % 2 === 0 ? SRC : DST, y: 0 }
      ctx.save()
      ctx.globalAlpha *= rA
      ctx.translate(RB.x, RB.y)
      ctx.scale(RS, RS)
      ctx.translate(0, (1 - outExpo(seg(t, 5.0, 5.5))) * 80)
      table(K, 0, -640, 560)
      cube(K, st.obj.x, st.obj.y, C.action)
      arm(K, { x: 0, y: 0 }, st.w, { l1: 300, l2: 290, grip: st.grip })
      ctx.restore()

      // one bar per finished episode, in real time
      const done = clamp(Math.floor(Math.max(0, u)), 0, EPISODES)
      const barY = 640
      for (let i = 0; i < 30; i++) {
        const x = 1010 + i * 21
        ctx.fillStyle = alpha(C.paper, 0.06 * rA)
        ctx.fillRect(x, barY, 15, 40)
        if (i < done) {
          const k = outExpo(seg(t, EP0 + (i + 1) * EPD, EP0 + (i + 1) * EPD + 0.3))
          ctx.fillStyle = C.action
          ctx.fillRect(x, barY + 40 * (1 - k), 15, 40 * k)
        }
      }
      // current episode progress sliver
      if (inEp) {
        ctx.fillStyle = alpha(C.action, 0.5)
        ctx.fillRect(1010 + done * 21, barY + 40 * (1 - (u - e)), 15, 40 * (u - e))
      }
      K.text(`${L('episode')} ${Math.min(done + (inEp ? 1 : 0), EPISODES)}`, 1010 + 30 * 21 + 14, barY + 32, { size: 26, weight: 500, fam: 'mono', color: C.dim, alpha: rA })
      const bigK = seg(t, EP0 + EPD * EPISODES - 0.6, EP0 + EPD * EPISODES + 0.3)
      if (bigK > 0) {
        K.text('~1 000 000', 1010, blockBottom + 92, { size: 62, weight: 700, fam: 'display', color: C.action, alpha: outCubic(bigK) })
        K.text(L('robotSub'), 1010, blockBottom + 140, { size: 26, weight: 500, fam: 'mono', color: C.dim, alpha: outCubic(bigK) })
      }
    }

    // ── the punchline ──────────────────────────────────────────────────
    const P = EP0 + EPD * EPISODES + 0.4
    const pk = outCubic(seg(t, P, P + 0.4))
    if (pk > 0) {
      ctx.fillStyle = alpha(C.bg, 0.72 * pk)
      ctx.fillRect(0, 200, W, H - 200)
      K.punch(L('punch'), t, P + 0.15, { x: W / 2, y: 520, size: 66, maxW: 1500, align: 'center' })
    }

    K.cite(L('cite'), presence(t, 2.0, Infinity, 0.4))
  },
})

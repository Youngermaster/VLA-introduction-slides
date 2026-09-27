/**
 * How the image gets in.
 *
 *   arrive  title + one camera frame of the demo table
 *   1 grid  an 8 × 8 grid cuts it into 64 patches (SmolVLA: 64 tokens per frame)
 *   2 fly   the patches lift off and line up as a single row of tokens
 *   3 join  text tokens and one state token join the row: ONE sequence
 */
import { defineScene } from '../lib/scene/types'
import { C, W, type Kit } from '../lib/scene/kit'
import { clamp, inOutCubic, lerp, outBack, outCubic, outExpo, seg } from '../lib/scene/math'
import { bottle, mug, trayBack, trayFront, vitaminBox } from '../lib/scene/robot'

const IMG = { x: 720, y: 236, s: 480 }
const N = 8
const ROW_Y = 880 // centre line of the token row

/** The camera frame: the demo table seen from above-front, in a 1000×1000 box. */
function photo(K: Kit) {
  const { ctx } = K
  ctx.fillStyle = '#1A1E25'
  ctx.fillRect(0, 0, 1000, 1000)
  // light from a window, upper left: gives every patch something to encode
  const g = ctx.createRadialGradient(220, 120, 20, 220, 120, 620)
  g.addColorStop(0, 'rgba(255,214,160,0.20)')
  g.addColorStop(1, 'rgba(255,214,160,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 1000, 1000)
  ctx.fillStyle = '#2A2F37'
  ctx.fillRect(0, 520, 1000, 480)
  ctx.fillStyle = '#454B56'
  ctx.fillRect(0, 520, 1000, 8)
  trayBack(K, 900, 830, 280)
  vitaminBox(K, 175, 790, 1.75)
  mug(K, 440, 790, 1.65)
  bottle(K, 680, 790, 2.0)
  trayFront(K, 900, 830, 280)
}

/** Draw the patch (i, j) of the photo into the rect (x, y, w, h). */
function patch(K: Kit, i: number, j: number, x: number, y: number, w: number, h: number) {
  const { ctx } = K
  const p = 1000 / N
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.translate(x, y)
  ctx.scale(w / p, h / p)
  ctx.translate(-i * p, -j * p)
  photo(K)
  ctx.restore()
}

export default defineScene({
  cues: [2.2, 4.8, 8.4, 11.8],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t, 0.1, { tout: 11.0 })

    const P = IMG.s / N
    const flyStart = 5.0
    const flyEnd = (k: number) => flyStart + k * 0.03 + 0.8
    const lastLand = flyEnd(N * N - 1)

    // ── the camera frame ───────────────────────────────────────────────
    const inK = outExpo(seg(t, 0.4, 1.3))
    // once every patch has left, the original stays as a dim reference
    const srcA = lerp(1, 0.22, outCubic(seg(t, 5.0, 6.8)))
    if (inK > 0) {
      ctx.save()
      ctx.globalAlpha *= inK * srcA
      const sc = lerp(0.92, 1, inK)
      ctx.translate(IMG.x + IMG.s / 2, IMG.y + IMG.s / 2)
      ctx.scale(sc, sc)
      ctx.translate(-IMG.x - IMG.s / 2, -IMG.y - IMG.s / 2)
      ctx.save()
      K.rr(IMG.x, IMG.y, IMG.s, IMG.s, 14)
      ctx.clip()
      ctx.translate(IMG.x, IMG.y)
      ctx.scale(IMG.s / 1000, IMG.s / 1000)
      photo(K)
      ctx.restore()
      K.strokeRR(IMG.x, IMG.y, IMG.s, IMG.s, 14, C.paper, 3)
      ctx.restore()
      K.label(L('cam'), IMG.x, IMG.y - 18, { alpha: inK * lerp(1, 0.5, seg(t, 5.0, 6.0)) })
    }

    const cntK = outExpo(seg(t, 3.3, 3.9)) * (1 - outCubic(seg(t, 8.5, 8.9)))
    if (cntK > 0) {
      K.text(L('count'), IMG.x + IMG.s + 60, IMG.y + IMG.s / 2 - 10, { size: 96, weight: 700, fam: 'display', color: C.lang, alpha: cntK })
      K.text(L('count_sub'), IMG.x + IMG.s + 64, IMG.y + IMG.s / 2 + 44, { size: 26, weight: 500, fam: 'mono', color: C.dim, alpha: cntK })
      K.text(L('count_note'), IMG.x + IMG.s + 64, IMG.y + IMG.s / 2 + 84, { size: 22, weight: 500, fam: 'mono', color: C.mute, alpha: cntK })
    }

    // ── 2 + 3. patches fly into a row, then the row joins the text ─────
    const joinK = inOutCubic(seg(t, 8.6, 9.5))
    // row geometry, before (click 2) and after (click 3) the join
    const pitchA = 25
    const tileA = 22
    const pitchB = 16
    const tileB = 13
    const toks = L('tokens').split('|')
    const chipW = toks.map((s) => K.measure(s, 26, 500, 'mono') + 22)
    const gapT = 8
    const textW = chipW.reduce((a, b) => a + b, 0) + gapT * (toks.length - 1)
    const stateW = 96
    const groupGap = 26
    const rowBW = N * N * pitchB - (pitchB - tileB) + groupGap + textW + groupGap + stateW
    const rowAX = W / 2 - (N * N * pitchA - (pitchA - tileA)) / 2
    const rowBX = W / 2 - rowBW / 2
    const tileH = lerp(tileA, 48, joinK)

    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const k = j * N + i
        const fk = inOutCubic(seg(t, flyStart + k * 0.03, flyEnd(k)))
        const sx = IMG.x + i * P
        const sy = IMG.y + j * P
        const ax = rowAX + k * pitchA
        const bx = rowBX + k * pitchB
        const dx = lerp(ax, bx, joinK)
        const dw = lerp(tileA, tileB, joinK)
        const x = lerp(sx, dx, fk)
        const y = lerp(sy, ROW_Y - tileH / 2, fk) - Math.sin(fk * Math.PI) * (40 + (k % 5) * 12)
        const w = lerp(P, dw, fk)
        const h = lerp(P, tileH, fk)
        if (fk <= 0) {
          // still sitting in the image (drawn above the dimmed source while the grid is up)
          if (t >= 2.3) patch(K, i, j, sx, sy, P, P)
          continue
        }
        patch(K, i, j, x, y, w, h)
        if (fk >= 1) {
          ctx.strokeStyle = C.lang
          ctx.lineWidth = 1.5
          ctx.strokeRect(x, y, w, h)
        }
      }
    }
    // ── 1. the grid (over the patches still in the image) ──────────────
    const gk = seg(t, 2.3, 3.3)
    const gridOut = 1 - outCubic(seg(t, 5.0, 5.6))
    if (gk > 0 && gridOut > 0) {
      ctx.save()
      ctx.globalAlpha *= gridOut
      for (let i = 1; i < N; i++) {
        const k = outCubic(seg(gk, i * 0.06, i * 0.06 + 0.5))
        K.line(IMG.x + i * P, IMG.y, IMG.x + i * P, IMG.y + IMG.s * k, C.lang, 3)
        K.line(IMG.x, IMG.y + i * P, IMG.x + IMG.s * k, IMG.y + i * P, C.lang, 3)
      }
      ctx.restore()
    }
    const rowLab = outCubic(seg(t, lastLand - 0.2, lastLand + 0.3)) * (1 - outCubic(seg(t, 8.6, 8.9)))
    K.text(L('row'), W / 2, ROW_Y + 64, { size: 26, weight: 500, fam: 'mono', color: C.lang, align: 'center', alpha: rowLab })

    // text tokens + state token slide in from the right
    let tx = rowBX + N * N * pitchB - (pitchB - tileB) + groupGap
    const textX0 = tx
    toks.forEach((s, i) => {
      const k = outExpo(seg(t, 9.2 + i * 0.08, 9.8 + i * 0.08))
      if (k > 0) {
        ctx.save()
        ctx.translate((1 - k) * 300, 0)
        K.chip(s, tx, ROW_Y - 24, { size: 26, h: 48, pad: 11, k })
        ctx.restore()
      }
      tx += chipW[i] + gapT
    })
    const stateX = tx - gapT + groupGap
    const sk = outBack(seg(t, 9.9, 10.3))
    if (sk > 0) {
      ctx.save()
      ctx.globalAlpha *= clamp(sk * 2)
      ctx.translate(stateX + stateW / 2, ROW_Y)
      ctx.scale(0.6 + 0.4 * sk, 0.6 + 0.4 * sk)
      K.fillRR(-stateW / 2, -24, stateW, 48, 10, C.actionDeep)
      K.text(L('state_tok'), 0, 1, { size: 24, weight: 500, fam: 'mono', color: C.action, align: 'center', base: 'middle' })
      ctx.restore()
    }

    // group labels, then one bracket over everything
    const gl = outCubic(seg(t, 10.2, 10.6))
    if (gl > 0) {
      const imgEnd = rowBX + N * N * pitchB - (pitchB - tileB)
      const lab = (s: string, a: number, b: number, col: string) => {
        K.line(a, ROW_Y + 40, b, ROW_Y + 40, col, 2)
        K.text(s, (a + b) / 2, ROW_Y + 76, { size: 24, weight: 500, fam: 'mono', color: col, align: 'center' })
      }
      ctx.save()
      ctx.globalAlpha *= gl
      lab(L('g_img'), rowBX, imgEnd, C.paper)
      lab(L('g_txt'), textX0, textX0 + textW, C.lang)
      lab(L('g_state'), stateX, stateX + stateW, C.action)
      ctx.restore()
    }
    const bk = outCubic(seg(t, 10.5, 11.1))
    if (bk > 0) {
      const a = rowBX
      const b = stateX + stateW
      const y = ROW_Y - 58
      const m = (a + b) / 2
      ctx.save()
      ctx.globalAlpha *= bk
      K.line(m - (m - a) * bk, y, m + (b - m) * bk, y, C.paper, 3)
      if (bk > 0.95) {
        K.line(a, y, a, y + 12, C.paper, 3)
        K.line(b, y, b, y + 12, C.paper, 3)
      }
      ctx.restore()
      K.text(L('one_seq'), m, y - 22, { size: 30, weight: 600, fam: 'sans', color: C.paper, align: 'center', alpha: bk })
    }

    K.punch(L('punch'), t, 11.0, { y: 132, maxW: 1700, size: 44 })
    K.fade(outCubic(seg(t, 3.4, 3.9)), () => K.cite(L('cite')))
  },
})

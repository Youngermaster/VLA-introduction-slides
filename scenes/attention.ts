/**
 * Is this the same attention as ChatGPT?
 *
 *   arrive  title, the camera frame, the token row (16 image patches + words)
 *   1 self  "zinc" asks every token; the arcs' weight lands on the bottle
 *   2 math  softmax(QKᵀ/√d)·V: yes, the same operation
 *   3 cross a row of action queries asks the VLM (Q from actions, K,V from the VLM)
 *   4 mask  the attention mask: prefix sees everything, actions only the past
 */
import { defineScene } from '../lib/scene/types'
import { C, type Kit } from '../lib/scene/kit'
import { alpha, clamp, hash, inOutCubic, lerp, outBack, outCubic, outExpo, seg } from '../lib/scene/math'
import { bottle, mug, trayBack, trayFront, vitaminBox } from '../lib/scene/robot'

const IMG = { x: 110, y: 230, s: 380 }
const G = 4 // the frame, downsampled to 4 × 4 patches for legibility
const ROW_Y = 760 // centre of the token row
const TILE = 50
const TGAP = 6
const ACT_Y = 945

function photo(K: Kit) {
  const { ctx } = K
  ctx.fillStyle = '#1A1E25'
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
function patch(K: Kit, i: number, j: number, x: number, y: number, w: number, h: number) {
  const { ctx } = K
  const p = 1000 / G
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

/** How much "zinc" attends to image patch (i, j): the bottle sits in column 2. */
const W_IMG = (i: number, j: number) => {
  const table: Record<string, number> = { '2,1': 0.7, '2,2': 1, '2,3': 0.45, '3,2': 0.3, '3,3': 0.2 }
  return table[`${i},${j}`] ?? 0.04 + hash(i, j) * 0.06
}

export default defineScene({
  cues: [2.2, 5.6, 8.4, 11.6, 15.2],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t, 0.1, { tout: 14.0 })

    // ── the camera frame, with heat ────────────────────────────────────
    const ik = outExpo(seg(t, 0.4, 1.2))
    const heat = outCubic(seg(t, 3.3, 4.3))
    if (ik > 0) {
      ctx.save()
      ctx.globalAlpha *= ik
      ctx.save()
      K.rr(IMG.x, IMG.y, IMG.s, IMG.s, 12)
      ctx.clip()
      ctx.translate(IMG.x, IMG.y)
      ctx.scale(IMG.s / 1000, IMG.s / 1000)
      photo(K)
      ctx.restore()
      const P = IMG.s / G
      for (let j = 0; j < G; j++) {
        for (let i = 0; i < G; i++) {
          if (heat > 0) {
            ctx.fillStyle = alpha(C.lang, heat * W_IMG(i, j) * 0.6)
            ctx.fillRect(IMG.x + i * P, IMG.y + j * P, P, P)
          }
          ctx.strokeStyle = alpha(C.lang, 0.35)
          ctx.lineWidth = 1.5
          ctx.strokeRect(IMG.x + i * P, IMG.y + j * P, P, P)
        }
      }
      K.strokeRR(IMG.x, IMG.y, IMG.s, IMG.s, 12, C.paper, 3)
      ctx.restore()
      K.label(L('cam'), IMG.x, IMG.y - 18, { alpha: ik })
    }

    // ── the token row: 16 image patches, then the words ────────────────
    const words = L('words').split('|')
    const qi = Number(L('q')) // index of the query word
    const wW = words.map((s) => K.measure(s, 28, 500, 'mono') + 28)
    type Tok = { x: number; w: number; kind: 'img' | 'txt'; i?: number; j?: number; label?: string; wq: number }
    const toks: Tok[] = []
    let x = IMG.x
    for (let n = 0; n < G * G; n++) {
      const i = n % G
      const j = Math.floor(n / G)
      toks.push({ x, w: TILE, kind: 'img', i, j, wq: W_IMG(i, j) })
      x += TILE + TGAP
    }
    x += 22
    words.forEach((s, n) => {
      toks.push({ x, w: wW[n], kind: 'txt', label: s, wq: n === qi ? 0 : n === words.length - 1 ? 0.3 : 0.06 })
      x += wW[n] + 10
    })
    const q = toks[G * G + qi]
    const selfDim = lerp(1, 0.45, outCubic(seg(t, 5.6, 6.1))) * lerp(1, 0.6, outCubic(seg(t, 8.5, 9.0)))

    // self-attention arcs from the query word
    const arcK = seg(t, 2.6, 3.9)
    if (arcK > 0) {
      const qx = q.x + q.w / 2
      const top = ROW_Y - 32
      toks.forEach((tk, n) => {
        if (tk === q) return
        const k = inOutCubic(seg(arcK, (n / toks.length) * 0.5, (n / toks.length) * 0.5 + 0.5))
        if (k <= 0) return
        const tx = tk.x + tk.w / 2
        const lift = Math.min(40 + Math.abs(qx - tx) * 0.28, 200)
        const pts = K.sample((u) => ({ x: lerp(qx, tx, u), y: top - Math.sin(u * Math.PI) * lift }), 36)
        ctx.save()
        ctx.globalAlpha *= (0.25 + 0.75 * tk.wq) * selfDim
        K.trace(pts, k, { color: C.lang, lw: 1.5 + tk.wq * 9 })
        ctx.restore()
      })
    }

    const rowK = (n: number) => outBack(seg(t, 0.9 + n * 0.035, 1.3 + n * 0.035))
    toks.forEach((tk, n) => {
      const k = rowK(n)
      if (k <= 0) return
      ctx.save()
      ctx.globalAlpha *= clamp(k * 2)
      if (tk.kind === 'img') {
        const s = 0.6 + 0.4 * k
        const y = ROW_Y - (TILE * s) / 2
        patch(K, tk.i!, tk.j!, tk.x + (TILE - TILE * s) / 2, y, TILE * s, TILE * s)
        const hk = heat * tk.wq
        ctx.strokeStyle = hk > 0.3 ? C.lang : alpha(C.lang, 0.5)
        ctx.lineWidth = hk > 0.3 ? 4 : 1.5
        ctx.strokeRect(tk.x, ROW_Y - TILE / 2, TILE, TILE)
      }
      else {
        const isQ = tk === q
        const on = isQ ? outCubic(seg(t, 2.3, 2.6)) : 0
        K.chip(tk.label!, tk.x, ROW_Y - 28, { size: 28, h: 56, pad: 14, k, stroke: on > 0.5 ? C.lang : undefined, bg: on > 0.5 ? '#123A50' : C.langDeep })
      }
      ctx.restore()
    })
    // Q over the query word, K under every other
    const qk = outExpo(seg(t, 2.4, 2.8))
    if (qk > 0) {
      K.text('Q', q.x + q.w / 2, ROW_Y - 48, { size: 30, weight: 700, fam: 'display', color: C.lang, align: 'center', alpha: qk * selfDim })
      K.text(L('self_label'), IMG.x, ROW_Y + 74, { size: 24, weight: 500, fam: 'mono', color: C.lang, alpha: outCubic(seg(t, 4.2, 4.7)) * (1 - outCubic(seg(t, 8.4, 8.8))) })
    }

    // ── 2. the formula ─────────────────────────────────────────────────
    const fOut = 11.6
    if (t > 5.65) K.rise('softmax(QKᵀ/√d)·V', 620, 360, { t, t0: 5.7, size: 64, weight: 700, color: C.paper, tout: fOut })
    K.punch(L('math_punch'), t, 6.6, { x: 624, y: 450, maxW: 1200, size: 40, tout: fOut })

    // ── 3. cross-attention: actions ask, the VLM answers ───────────────
    const NA = 8
    const aX = (n: number) => IMG.x + n * (44 + 12)
    for (let n = 0; n < NA; n++) {
      const k = outBack(seg(t, 8.6 + n * 0.06, 9.0 + n * 0.06))
      if (k <= 0) continue
      const s = 0.6 + 0.4 * k
      ctx.save()
      ctx.globalAlpha *= clamp(k * 2)
      K.fillRR(aX(n) + 22 - 22 * s, ACT_Y - 22 * s, 44 * s, 44 * s, 8, C.action)
      ctx.restore()
    }
    const crossK = seg(t, 9.3, 10.6)
    if (crossK > 0) {
      for (let n = 0; n < NA; n++) {
        // each query picks its three strongest keys
        const ranked = toks.map((tk, m) => ({ m, w: tk.wq * 0.6 + hash(n + 40, m) * 0.7 })).sort((a, b) => b.w - a.w).slice(0, 3)
        ranked.forEach((r, ri) => {
          const tk = toks[r.m]
          const k = inOutCubic(seg(crossK, n * 0.06 + ri * 0.05, n * 0.06 + ri * 0.05 + 0.45))
          if (k <= 0) return
          const sx = aX(n) + 22
          const sy = ACT_Y - 24
          const tx = tk.x + tk.w / 2
          const ty = ROW_Y + 30
          const pts = K.sample((u) => ({ x: lerp(sx, tx, inOutCubic(u)), y: lerp(sy, ty, u) }), 30)
          ctx.save()
          ctx.globalAlpha *= 0.35 + 0.5 * (1 - ri / 3)
          K.trace(pts, k, { color: C.action, lw: 3 - ri * 0.6 })
          ctx.restore()
        })
      }
    }
    const cl = outCubic(seg(t, 10.4, 10.9))
    if (cl > 0) {
      K.text('Q', aX(NA) + 10, ACT_Y + 12, { size: 30, weight: 700, fam: 'display', color: C.action, alpha: cl })
      K.text(L('cross_a'), aX(NA) + 64, ACT_Y - 4, { size: 30, weight: 600, fam: 'sans', color: C.action, alpha: cl })
      K.text(L('cross_b'), aX(NA) + 64, ACT_Y + 34, { size: 30, weight: 600, fam: 'sans', color: C.lang, alpha: cl })
    }

    // ── 4. the mask ────────────────────────────────────────────────────
    const groups = [
      { n: 4, label: L('m_img'), color: C.paper },
      { n: 3, label: L('m_txt'), color: C.lang },
      { n: 1, label: L('m_state'), color: C.action },
      { n: 4, label: L('m_act'), color: C.action },
    ]
    const NM = groups.reduce((a, g) => a + g.n, 0)
    const PRE = 8
    const CELLS = 34
    const MX = 1380
    const MY = 250
    const mk = seg(t, 11.9, 13.6)
    if (mk > 0) {
      for (let r = 0; r < NM; r++) {
        for (let c = 0; c < NM; c++) {
          const on = r < PRE ? c < PRE : c < PRE || c <= r
          const k = outCubic(seg(mk, (r / NM) * 0.7, (r / NM) * 0.7 + 0.3))
          if (k <= 0) continue
          const x0 = MX + c * CELLS
          const y0 = MY + r * CELLS
          if (on) {
            ctx.fillStyle = r < PRE ? alpha(C.lang, 0.85 * k) : alpha(C.action, 0.9 * k)
            ctx.fillRect(x0 + 2, y0 + 2, CELLS - 4, CELLS - 4)
          }
          else {
            ctx.strokeStyle = alpha(C.paper, 0.18 * k)
            ctx.lineWidth = 1.5
            ctx.strokeRect(x0 + 3, y0 + 3, CELLS - 6, CELLS - 6)
          }
        }
      }
      // group ticks along the left edge
      let gy = MY
      groups.forEach((g, gi) => {
        const a = outCubic(seg(t, 12.0 + gi * 0.12, 12.4 + gi * 0.12))
        K.text(g.label, MX - 16, gy + (g.n * CELLS) / 2 + 9, { size: 22, weight: 500, fam: 'mono', color: g.color, align: 'right', alpha: a })
        gy += g.n * CELLS
      })
    }
    const lg = outCubic(seg(t, 13.6, 14.1))
    if (lg > 0) {
      const lx = 560
      K.text(L('m_rows'), lx, 310, { size: 24, weight: 500, fam: 'mono', color: C.mute, alpha: lg })
      ctx.fillStyle = alpha(C.lang, 0.85 * lg)
      ctx.fillRect(lx, 356, 30, 30)
      K.text(L('m_prefix'), lx + 48, 380, { size: 30, weight: 600, fam: 'sans', color: C.paper, alpha: lg })
      ctx.fillStyle = alpha(C.action, 0.9 * lg)
      ctx.fillRect(lx, 424, 30, 30)
      K.text(L('m_causal'), lx + 48, 448, { size: 30, weight: 600, fam: 'sans', color: C.paper, alpha: lg })
    }
    K.punch(L('punch'), t, 14.2, { y: 132, maxW: 1700, size: 44 })

    K.fade(outCubic(seg(t, 8.8, 9.4)), () => K.cite(L('cite')))
  },
})

/**
 * How the instruction gets in.
 *
 *   arrive  title
 *   1 wrap  the sentence types in, then drops into OpenVLA's prompt template
 *   2 split the task flies apart into sub-word tokens with their IDs
 *   3 embed every token falls into its own column of numbers: a vector
 */
import { defineScene } from '../lib/scene/types'
import { C, W } from '../lib/scene/kit'
import { clamp, hash, inOutCubic, lerp, mix, outBack, outCubic, outExpo, seg } from '../lib/scene/math'

const TPL_Y = 360 // template line 1 baseline
const TPL_SIZE = 38
const ROW_Y = 560 // chip row top
const CHIP_H = 84
const COL_Y = 700 // embedding columns top
const CELLS = 9
const CELL = 28

export default defineScene({
  cues: [2.0, 5.8, 8.8, 11.8],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t, 0.1, { tout: 11.0 })

    const sentence = L('sentence')
    const pre = 'In: What action should the robot take to '
    const post = '?'

    // ── 1. the sentence types in big, then drops into the template ─────
    const typeK = seg(t, 2.1, 3.4)
    const morph = inOutCubic(seg(t, 3.7, 4.6))
    const tplK = outCubic(seg(t, 3.9, 4.6))
    const preW = K.measure(pre, TPL_SIZE, 500, 'mono')
    const sentW = K.measure(sentence, TPL_SIZE, 500, 'mono')
    const postW = K.measure(post, TPL_SIZE, 500, 'mono')
    const lineW = preW + sentW + postW
    const tx0 = W / 2 - lineW / 2
    const slotX = tx0 + preW

    if (typeK > 0) {
      const big = 72
      const bigW = K.measure(sentence, big, 500, 'sans')
      const bx = W / 2 - bigW / 2
      const by = 520
      const size = lerp(big, TPL_SIZE, morph)
      const x = lerp(bx, slotX, morph)
      const y = lerp(by, TPL_Y, morph)
      const shown = K.typed(sentence, typeK)
      const fam = morph < 0.5 ? 'sans' : 'mono'
      const col = mix(C.paper, C.lang, morph)
      // the task dims once its tokens have flown out (click 2)
      const dimK = seg(t, 6.0, 6.6)
      K.text(shown, x, y, { size, weight: 500, fam, color: col, alpha: lerp(1, 0.45, dimK) })
      if (t < 3.7 && (typeK < 1 || Math.floor(t * 4) % 2 === 0)) {
        ctx.fillStyle = C.lang
        ctx.fillRect(bx + K.measure(shown, big, 500, 'sans') + 8, by - 58, 5, 72)
      }
    }
    if (tplK > 0) {
      ctx.save()
      ctx.globalAlpha *= tplK
      K.text(pre, tx0 - (1 - tplK) * 40, TPL_Y, { size: TPL_SIZE, weight: 500, fam: 'mono', color: C.dim })
      K.text(post, slotX + sentW, TPL_Y, { size: TPL_SIZE, weight: 500, fam: 'mono', color: C.dim })
      K.text('Out:', tx0 - (1 - tplK) * 40, TPL_Y + 58, { size: TPL_SIZE, weight: 500, fam: 'mono', color: C.dim })
      ctx.restore()
      K.text(L('tpl_note'), W / 2, TPL_Y + 150, {
        size: 28, weight: 500, fam: 'sans', color: C.mute, align: 'center',
        alpha: outCubic(seg(t, 4.7, 5.2)) * (1 - outCubic(seg(t, 5.9, 6.3))),
      })
    }

    // ── 2. split into sub-word tokens ──────────────────────────────────
    const toks = L('tokens').split('|')
    const ids = L('ids').split(' ')
    const labels = toks.map((s) => s.replace(/^\s/, ''))
    const cont = toks.map((s, i) => i > 0 && !s.startsWith(' '))
    const split = toks.map((_, i) => cont[i] || cont[i + 1] === true)
    const gap = 22
    const widths = labels.map((s) => K.measure(s, 46, 500, 'mono') + 44)
    const rowW = widths.reduce((a, b) => a + b, 0) + gap * (toks.length - 1)
    let rx = W / 2 - rowW / 2
    const chips = labels.map((s, i) => {
      // where this token sits inside the template line
      const before = toks.slice(0, i).join('')
      const lead = toks[i].startsWith(' ') ? 1 : 0
      const sx = slotX + K.measure(before + ' '.repeat(lead), TPL_SIZE, 500, 'mono')
      const sw = K.measure(s, TPL_SIZE, 500, 'mono')
      const c = { label: s, x: rx, w: widths[i], srcX: sx + sw / 2, id: ids[i] ?? '', split: split[i] }
      rx += widths[i] + gap
      return c
    })

    chips.forEach((c, i) => {
      const t0 = 6.0 + i * 0.08
      const k = inOutCubic(seg(t, t0, t0 + 0.7))
      if (k <= 0) return
      const cx = lerp(c.srcX, c.x + c.w / 2, k)
      const cy = lerp(TPL_Y - 30, ROW_Y, k) - Math.sin(k * Math.PI) * 60
      const fade = 1 - outCubic(seg(t, 9.0 + i * 0.06, 9.4 + i * 0.06)) * 0.15
      ctx.save()
      ctx.globalAlpha *= clamp(k * 3) * fade
      K.chip(c.label, cx, cy, {
        size: 46, h: CHIP_H, pad: 22, align: 'center', k: 1,
        stroke: c.split ? C.paper : undefined,
      })
      ctx.restore()
      const idK = outExpo(seg(t, t0 + 0.6, t0 + 1.0)) * (1 - outCubic(seg(t, 8.9, 9.2)))
      K.text(c.id, c.x + c.w / 2, ROW_Y + CHIP_H + 44, { size: 26, weight: 500, fam: 'mono', color: C.lang, align: 'center', alpha: idK })
    })

    // "one word, two tokens"
    const sp = chips.filter((c) => c.split)
    if (sp.length) {
      const k = outCubic(seg(t, 7.2, 7.7)) * (1 - outCubic(seg(t, 8.9, 9.2)))
      if (k > 0) {
        const x0 = sp[0].x
        const x1 = sp[sp.length - 1].x + sp[sp.length - 1].w
        const y = ROW_Y + CHIP_H + 80
        ctx.save()
        ctx.globalAlpha *= k
        K.line(x0, y, x1, y, C.paper, 3)
        K.line(x0, y - 10, x0, y, C.paper, 3)
        K.line(x1, y - 10, x1, y, C.paper, 3)
        ctx.restore()
        K.text(L('split_note'), (x0 + x1) / 2, y + 46, { size: 26, weight: 500, fam: 'mono', color: C.paper, align: 'center', alpha: k })
      }
    }
    K.text(L('same_tok'), W / 2, 880, {
      size: 30, weight: 500, fam: 'sans', color: C.dim, align: 'center',
      alpha: outCubic(seg(t, 7.8, 8.4)) * (1 - outCubic(seg(t, 8.9, 9.2))),
    })

    // ── 3. every token becomes a vector ────────────────────────────────
    chips.forEach((c, i) => {
      const t0 = 9.0 + i * 0.1
      const cx = c.x + c.w / 2
      for (let j = 0; j < CELLS; j++) {
        const k = outBack(seg(t, t0 + j * 0.035, t0 + j * 0.035 + 0.35))
        if (k <= 0) continue
        const v = hash(i + 3, j + 11)
        const y = COL_Y + j * (CELL + 4) + (1 - clamp(k)) * -40
        ctx.fillStyle = mix(C.langDeep, C.lang, 0.15 + v * 0.85)
        ctx.globalAlpha = clamp(k * 2)
        ctx.fillRect(cx - 42, y, 84, CELL)
        ctx.globalAlpha = 1
      }
      // the drop that feeds the column
      const dk = seg(t, t0 - 0.2, t0 + 0.1)
      if (dk > 0 && dk < 1) K.dot(cx, lerp(ROW_Y + CHIP_H, COL_Y, dk), 8, C.lang)
    })
    const vk = outCubic(seg(t, 10.2, 10.7))
    if (vk > 0) {
      const lastX = chips[chips.length - 1].x + chips[chips.length - 1].w
      const top = COL_Y
      const bot = COL_Y + CELLS * (CELL + 4) - 4
      ctx.save()
      ctx.globalAlpha *= vk
      K.line(lastX + 30, top, lastX + 30, bot, C.lang, 3)
      K.line(lastX + 22, top, lastX + 30, top, C.lang, 3)
      K.line(lastX + 22, bot, lastX + 30, bot, C.lang, 3)
      ctx.restore()
      K.text(L('vec_label'), lastX + 50, (top + bot) / 2 + 10, { size: 26, weight: 500, fam: 'mono', color: C.lang, alpha: vk })
    }
    K.punch(L('punch'), t, 11.0, { y: 132, maxW: 1700, size: 44 })

    K.fade(outCubic(seg(t, 4.2, 4.8)), () => K.cite(L('cite')))
  },
})

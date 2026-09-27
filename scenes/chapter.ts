/**
 * Chapter opener, shared by every act: <Scene name="chapter" v="inside" />.
 * A rule draws, the title rises letter by letter, a line of context follows,
 * and the act's numeral sits huge and hollow behind it. Ten seconds of rhythm,
 * not content.
 */
import { defineScene } from '../lib/scene/types'
import { C, H, W } from '../lib/scene/kit'
import { outCubic, outExpo, seg } from '../lib/scene/math'

export default defineScene({
  cues: [2.2],
  draw({ t, L, K, ctx }) {
    // the numeral, hollow, drifting in from the right
    const nk = outExpo(seg(t, 0, 1.4))
    ctx.save()
    ctx.globalAlpha = 0.16 * nk
    K.setFont(560, 800, 'display')
    ctx.strokeStyle = C.paper
    ctx.lineWidth = 3
    ctx.textAlign = 'right'
    ctx.textBaseline = 'alphabetic'
    ctx.strokeText(L('n'), W - 90 + (1 - nk) * 120, H - 150)
    ctx.restore()

    const accent = L('accent') === 'lang' ? C.lang : C.action
    const rk = outExpo(seg(t, 0.1, 0.7))
    ctx.fillStyle = accent
    ctx.fillRect(120, 380, 96 * rk, 6)

    const lines = L('title').split('\n')
    lines.forEach((ln, i) => K.rise(ln, 120, 530 + i * 128, { t, t0: 0.3 + i * 0.12, size: 116, weight: 800 }))
    K.words(L('sub'), 124, 530 + lines.length * 128 + 10, { t, t0: 1.0, size: 40, weight: 500, fam: 'sans', color: C.dim, maxW: 1200, ls: -0.005 })
    void outCubic
  },
})

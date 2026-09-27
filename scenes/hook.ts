/**
 * The hook: the question, then the easy answer struck out, then the real one.
 * Underneath, the contrast plays small: a chat reply streams out in a blink
 * while an arm is still reaching for a bottle.
 */
import { defineScene } from '../lib/scene/types'
import { C, W } from '../lib/scene/kit'
import { inOutCubic, lerp, outCubic, outExpo, seg } from '../lib/scene/math'
import { arm, bottle, table } from '../lib/scene/robot'

export default defineScene({
  cues: [2.6, 5.2, 7.4],
  draw({ t, L, K, ctx }) {
    // the question, huge, then it steps back when the answers arrive
    const back = outExpo(seg(t, 2.6, 3.2))
    const qSize = lerp(96, 64, back)
    const qy = lerp(330, 190, back)
    const h1 = K.words(L('q1'), 120, qy, { t, t0: 0.1, size: qSize, maxW: 1700, stagger: 0.06 })
    K.words(L('q2'), 120, qy + h1, { t, t0: 0.5, size: qSize, maxW: 1700, stagger: 0.06 })

    // the easy answer, then struck through
    const eh = K.words(L('easy'), 120, 470, { t, t0: 2.9, size: 48, weight: 600, fam: 'sans', color: C.dim, maxW: 1600, ls: -0.01 })
    const strike = inOutCubic(seg(t, 4.3, 4.8))
    if (strike > 0) {
      const w = Math.min(1600, K.measure(L('easy'), 48, 600, 'sans', -0.01))
      K.line(116, 470 - 16, 116 + w * strike, 470 - 16, C.warn, 5)
      K.words(L('notonly'), 120, 470 + eh + 10, { t, t0: 4.7, size: 48, weight: 600, fam: 'sans', color: C.warn, maxW: 1600 })
    }
    // the real answer
    K.words(L('real'), 120, 700, { t, t0: 5.4, size: 64, weight: 700, maxW: 1700, stagger: 0.05 })

    // the contrast, small, along the bottom (arrival only; then it rests)
    const low = 1 - outCubic(seg(t, 5.2, 5.7))
    K.fade(low * outCubic(seg(t, 1.0, 1.6)), () => {
      // chat: a reply streams out in under a second
      const bx = 120
      const by = 820
      K.fillRR(bx, by, 700, 150, 22, C.bg2)
      K.label(L('chat'), bx + 28, by + 44, { color: C.lang })
      const reply = L('reply')
      K.text(K.typed(reply, seg(t, 1.3, 2.1)), bx + 28, by + 104, { size: 32, weight: 500, color: C.paper })
      // arm: still on its way to the bottle
      ctx.save()
      ctx.translate(0, 40)
      table(K, 960, 1100, 1800)
      bottle(K, 1260, 960, 0.8)
      const u = inOutCubic(seg(t, 1.2, 5.0))
      arm(K, { x: 1680, y: 960 }, { x: lerp(1560, 1330, u), y: lerp(620, 720, u) }, { l1: 230, l2: 220, grip: 1 })
      ctx.restore()
    })
    void W
  },
})

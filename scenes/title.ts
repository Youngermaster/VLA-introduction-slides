/**
 * Title: the talk's name, animated literally. The words land, the tokens
 * under them turn from cyan (symbol) to amber (action), and an arm on the
 * right draws the trajectory those tokens decode into. Runs once, then rests.
 */
import { defineScene } from '../lib/scene/types'
import { C, W } from '../lib/scene/kit'
import { inOutCubic, lerp, mix, outBack, outCubic, seg } from '../lib/scene/math'
import { GRIP_DROP, arm, table } from '../lib/scene/robot'

// A settling wave: the arm converging on a target, not oscillating forever.
const traj = (u: number) => ({
  x: lerp(1210, 1490, u),
  y: 540 - Math.sin(u * Math.PI * 2.6) * 120 * Math.exp(-u * 1.6),
})

export default defineScene({
  cues: [4.6],
  draw({ t, L, K, ctx }) {
    K.grid(0.03 * outCubic(seg(t, 0, 1)))
    const x = 120
    K.rise(L('t1'), x, 430, { t, t0: 0.15, size: 132, weight: 800 })
    K.rise(L('t2a'), x, 590, { t, t0: 0.45, size: 132, weight: 800 })
    const w2 = K.measure(`${L('t2a')} `, 132, 800, 'display', -0.02)
    K.rise(L('t2b'), x + w2, 590, { t, t0: 0.6, size: 132, weight: 800, color: C.action })
    K.words(L('sub'), x, 700, { t, t0: 1.1, size: 40, weight: 500, fam: 'sans', color: C.dim, maxW: 1000, ls: -0.005 })

    // tokens: cyan symbols that become amber actions
    const toks = L('toks').split('|')
    let tx = x
    toks.forEach((tk, i) => {
      const k = seg(t, 1.5 + i * 0.1, 1.9 + i * 0.1)
      const turn = inOutCubic(seg(t, 2.3 + i * 0.12, 2.7 + i * 0.12))
      const w = K.chip(tk, tx, 780, {
        size: 26,
        k: outBack(k),
        bg: mix(C.langDeep, C.actionDeep, turn),
        fg: mix(C.lang, C.action, turn),
      })
      tx += w + 12
    })

    // the arm and the trajectory it draws
    const armK = outCubic(seg(t, 1.2, 2.2))
    const wrist = (tt: number) => traj(inOutCubic(seg(tt, 2.4, 4.3)))
    ctx.save()
    ctx.globalAlpha *= armK
    ctx.translate((1 - armK) * 120, 0)
    table(K, 860, 1060, 1800)
    const trailK = inOutCubic(seg(t, 2.4, 4.3))
    if (trailK > 0) {
      const pts = K.sample((u) => {
        const p = traj(u)
        return { x: p.x, y: p.y + GRIP_DROP }
      }, 80)
      K.trace(pts, trailK, { color: C.action, lw: 5 })
    }
    arm(K, { x: 1640, y: 860 }, wrist(t), { l1: 330, l2: 320, grip: 1 })
    ctx.restore()

    K.fade(outCubic(seg(t, 2.8, 3.6)), () => {
      K.text(L('author'), x, 1000, { size: 26, weight: 500, fam: 'mono', color: C.mute })
    })
    void W
  },
})

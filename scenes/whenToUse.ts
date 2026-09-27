/**
 * When to use which: a decision map drawn faint on arrival; each click sends a
 * dot down the trunk and along one branch to its answer.
 *
 *   arrive  the map: trunk, three questions, dashed branches
 *   1       one fixed task, tight budget → ACT / Diffusion Policy
 *   2       language picks the object, hobby hardware → SmolVLA / π0 fine-tune
 *   3       long horizon, open-ended → a planner calling a VLA as a tool
 */
import { defineScene } from '../lib/scene/types'
import { C } from '../lib/scene/kit'
import { alpha, inOutCubic, lerp, outBack, outCubic, outExpo, presence, seg } from '../lib/scene/math'

const TRUNK_X = 110
const START_Y = 280
const BRANCH_Y = [390, 620, 850] as const
const Q_X = 160
const END_X = 1000
const DEST_X = 1060

export default defineScene({
  cues: [1.8, 5.0, 8.2, 11.4],
  draw({ t, L, K, ctx, stage }) {
    void stage
    K.title(L('title'), t)
    const cues = [1.8, 5.0, 8.2, 11.4]

    // the map: trunk + dashed branches, drawn on at arrival
    const mk = inOutCubic(seg(t, 0.3, 1.4))
    K.dot(TRUNK_X, START_Y, 12 * outBack(seg(t, 0.2, 0.5)), C.paper)
    K.text(L('start'), TRUNK_X + 30, START_Y + 9, { size: 28, weight: 500, fam: 'mono', color: C.mute, alpha: outCubic(seg(t, 0.3, 0.7)) })
    if (mk > 0) K.line(TRUNK_X, START_Y, TRUNK_X, lerp(START_Y, BRANCH_Y[2], mk), C.faint, 4)

    BRANCH_Y.forEach((y, i) => {
      const bk = inOutCubic(seg(t, 0.6 + i * 0.15, 1.5 + i * 0.15))
      if (bk > 0) K.line(TRUNK_X, y, lerp(TRUNK_X, END_X, bk), y, C.faint, 3, [6, 10])
      const c0 = cues[i]
      const c1 = cues[i + 1]
      const span = c1 - c0
      const lit = seg(t, c0, c0 + span * 0.2)
      // question: faint on the map, bright once its path lights
      // multi-line questions grow upward so the last line sits on the branch
      const qLines = K.wrap(L(`q${i + 1}`), END_X - Q_X, 40, 600, 'sans', -0.01).length
      K.words(L(`q${i + 1}`), Q_X, y - 22 - (qLines - 1) * 40 * 1.12, {
        t, t0: 0.8 + i * 0.15, size: 40, weight: 600, fam: 'sans', ls: -0.01, maxW: END_X - Q_X,
        color: lit > 0 ? C.paper : alpha(C.paper, 0.4), stagger: 0.02,
      })

      // the travelling dot
      const u1 = inOutCubic(seg(t, c0, c0 + span * 0.35))
      const u2 = inOutCubic(seg(t, c0 + span * 0.3, c0 + span * 0.7))
      if (u1 > 0) {
        // lit path
        K.line(TRUNK_X, START_Y, TRUNK_X, lerp(START_Y, y, u1), C.action, 5)
        if (u2 > 0) K.line(TRUNK_X, y, lerp(TRUNK_X, END_X, u2), y, C.action, 5)
        const p = u2 > 0 ? { x: lerp(TRUNK_X, END_X, u2), y } : { x: TRUNK_X, y: lerp(START_Y, y, u1) }
        K.dot(p.x, p.y, 14, C.action)
      }

      // the answer
      const ak = outExpo(seg(t, c0 + span * 0.65, c0 + span * 0.9))
      if (ak > 0) {
        ctx.save()
        ctx.globalAlpha *= Math.min(1, ak * 2)
        ctx.translate((1 - ak) * 40, 0)
        const lab = L(`a${i + 1}`)
        const size = Math.min(54, (54 * (1848 - DEST_X)) / K.measure(lab, 54, 800, 'display'))
        K.text(lab, DEST_X, y + 18, { size, weight: 800, fam: 'display', color: C.action })
        ctx.restore()
        K.words(L(`f${i + 1}`), DEST_X, y + 70, {
          t, t0: c0 + span * 0.75, size: 30, weight: 500, fam: 'sans', ls: 0, color: C.dim, accent: C.paper, maxW: 1848 - DEST_X, lh: 1.3, stagger: 0.015,
        })
      }
    })

    K.fade(presence(t, 3.8), () => K.cite(L('foot')))
  },
})

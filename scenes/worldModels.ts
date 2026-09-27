/**
 * VLA + world models. A reactive VLA only sees and acts; a world model lets it
 * imagine first. Then the four ways the two combine today, as lanes.
 *
 *   arrive  a reactive VLA: see → act
 *   1       planner: three imagined futures (ghost arms), scored, best one executed
 *   2       the vignette shrinks into lane 3; lane 1: data generator
 *   3       lane 2: training signal (world model used in training only)
 *   4       lane 4: evaluator; punch: most gain today is the training signal
 *
 * The rollout scores are illustrative; the footnote says so.
 */
import { defineScene } from '../lib/scene/types'
import { C, H, type Kit } from '../lib/scene/kit'
import { alpha, clamp, inOutCubic, lerp, outBack, outCubic, outExpo, path2, presence, seg } from '../lib/scene/math'
import { GRIP_DROP, arm, bottle } from '../lib/scene/robot'

type P3 = readonly (readonly [number, number, number])[]
const HOME = { x: 150, y: -440 }
const GRASP_Y = -70 - GRIP_DROP
// three imagined futures, in the vignette's local space (u: 0..1)
const FUTURES: { kf: P3; score: number }[] = [
  { kf: [[0, HOME.x, HOME.y], [0.55, -500, -440], [1, -430, -230]], score: 0.21 },
  { kf: [[0, HOME.x, HOME.y], [0.55, -220, -540], [1, -220, GRASP_Y]], score: 0.92 },
  { kf: [[0, HOME.x, HOME.y], [0.55, 0, -380], [1, -40, -200]], score: 0.35 },
]
const BEST = 1
const LANE_X = (i: number) => 72 + i * 450
const LANE_W = 420
const LANE_GY = 600 // lane glyph ground
const LANE_TEXT_Y = 684

/** The planner vignette: arm, bottle, ghosts, chosen path. Local origin = table centre. */
function vignette(K: Kit, t: number, L: (k: string) => string, big: number) {
  const { ctx } = K
  K.line(-430, 0, 430, 0, C.faint, 4)
  bottle(K, -220, 0, 1)
  const base = { x: 320, y: 0 }
  // ghosts
  FUTURES.forEach((f, i) => {
    const t0 = 2.6 + i * 0.18
    const u = inOutCubic(seg(t, t0, t0 + 1.4))
    if (u <= 0) return
    const chosen = i === BEST
    const fade = chosen ? 1 : 1 - outCubic(seg(t, 5.0, 5.35))
    if (fade <= 0) return
    const pts = K.sample((v) => {
      const p = path2(v * u, f.kf, (x) => x)
      return { x: p.x, y: p.y + GRIP_DROP }
    }, 40)
    const pk = outCubic(seg(t, 5.0, 5.35))
    ctx.save()
    ctx.globalAlpha *= fade
    K.trace(pts, 1, { color: chosen && pk > 0 ? mixC(pk) : C.lang, lw: chosen ? lerp(3, 6, pk) : 3, dash: chosen && pk > 0.5 ? undefined : [8, 10] })
    if (t < 5.3 || !chosen) arm(K, base, path2(u, f.kf, (x) => x), { ghost: 0.32, body: C.lang, accent: C.lang })
    const sk = outBack(seg(t, t0 + 1.35, t0 + 1.65))
    if (sk > 0) {
      const apex = path2(0.55, f.kf, (x) => x)
      K.text(f.score.toFixed(2), apex.x, apex.y - 60, {
        size: 46, weight: 600, fam: 'mono', color: chosen && pk > 0 ? C.action : C.lang, align: 'center', alpha: Math.min(1, sk * 3) * big,
      })
    }
    ctx.restore()
  })
  // the real arm: waits, then executes the chosen future
  const u = inOutCubic(seg(t, 5.25, 6.05))
  const w = path2(u, FUTURES[BEST].kf)
  arm(K, base, w, { grip: lerp(1, 0.72, seg(t, 6.0, 6.15)) })
  // the reactive loop badge
  const rk = presence(t, 0.5, 6.2, 0.5, 0.3)
  if (rk > 0) {
    ctx.save()
    ctx.globalAlpha *= rk
    const cx = -640
    const cy = -250
    const r = 78
    const loop = outCubic(seg(t, 0.6, 1.6))
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.strokeStyle = C.lang
    ctx.beginPath()
    ctx.arc(cx, cy, r, Math.PI * 1.05, Math.PI * (1.05 + 0.9 * loop))
    ctx.stroke()
    ctx.strokeStyle = C.action
    ctx.beginPath()
    ctx.arc(cx, cy, r, Math.PI * 0.05, Math.PI * (0.05 + 0.9 * loop))
    ctx.stroke()
    K.text(L('see'), cx, cy - r - 26, { size: 40, weight: 600, fam: 'sans', color: C.lang, align: 'center', alpha: loop })
    K.text(L('act'), cx, cy + r + 58, { size: 40, weight: 600, fam: 'sans', color: C.action, align: 'center', alpha: loop })
    ctx.restore()
  }
}

const mixC = (k: number) => (k > 0.5 ? C.action : C.lang)

/** Lane caption: name + fact + source, stacked by measured height. */
function laneText(K: Kit, t: number, t0: number, i: number, name: string, fact: string, hot = 0) {
  const x = LANE_X(i)
  const hh = K.words(name, x, LANE_TEXT_Y, { t, t0, size: 38, weight: 700, fam: 'sans', ls: -0.01, maxW: LANE_W, color: hot > 0.5 ? C.action : C.paper, stagger: 0.03 })
  if (hot > 0) {
    K.ctx.fillStyle = C.action
    K.ctx.fillRect(x, LANE_TEXT_Y + 14, K.measure(name, 38, 700, 'sans', -0.01) * outExpo(hot), 4)
  }
  K.words(fact, x, LANE_TEXT_Y + hh + 12, { t, t0: t0 + 0.2, size: 27, weight: 500, fam: 'sans', ls: 0, color: C.dim, maxW: LANE_W, lh: 1.3, stagger: 0.012, accent: C.paper })
}

/** A lane's glyph ground line. */
function ground(K: Kit, i: number, k: number) {
  if (k > 0) K.line(LANE_X(i), LANE_GY, LANE_X(i) + LANE_W * k, LANE_GY, C.faint, 3)
}

export default defineScene({
  cues: [2.2, 6.2, 9.0, 11.8, 15.0],
  draw({ t, L, K, ctx }) {
    K.title(L('title'), t)

    // ── the vignette: centre stage, then shrinks into lane 3 ────────────
    const sk = inOutCubic(seg(t, 6.2, 7.1))
    const ox = lerp(1000, LANE_X(2) + LANE_W / 2 - 20, sk)
    const oy = lerp(880, LANE_GY, sk)
    const sc = lerp(0.82, 0.44, sk)
    const vIn = outExpo(seg(t, 0.2, 1.0))
    ctx.save()
    ctx.globalAlpha *= vIn
    ctx.translate(ox, oy + (1 - vIn) * 40)
    ctx.scale(sc, sc)
    vignette(K, t, L, 1 - sk)
    ctx.restore()

    // big-stage labels for the planner
    const bk = presence(t, 2.3, 6.2, 0.3, 0.25)
    K.fade(bk, () => {
      K.words(L('imagine'), 1000, 290, { t, t0: 2.3, size: 40, weight: 700, fam: 'sans', ls: -0.01, align: 'center', color: C.lang, maxW: 1200 })
    })
    K.fade(presence(t, 5.3, 6.2, 0.3, 0.25), () => {
      K.words(L('planF'), 1000, 960, { t, t0: 5.3, size: 32, weight: 500, fam: 'sans', ls: 0, align: 'center', color: C.dim, accent: C.paper, maxW: 1400 })
    })

    // ── lane 3 (planner) text once the vignette has landed ─────────────
    laneText(K, t, 6.9, 2, L('l3'), L('l3f'))

    // ── lane 1: data generator ─────────────────────────────────────────
    {
      const i = 0
      const k = outExpo(seg(t, 7.0, 7.6))
      ground(K, i, k)
      if (k > 0) {
        const x = LANE_X(i)
        // the world model: a filled block that "prints" frames
        ctx.save()
        ctx.globalAlpha *= k
        K.fillRR(x, LANE_GY - 190, 110, 150, 14, C.langDeep)
        K.strokeRR(x, LANE_GY - 190, 110, 150, 14, C.lang, 3)
        K.text('WM', x + 55, LANE_GY - 104, { size: 30, weight: 800, fam: 'display', color: C.lang, align: 'center' })
        ctx.restore()
        for (let f = 0; f < 4; f++) {
          const fk = outExpo(seg(t, 7.4 + f * 0.16, 7.9 + f * 0.16))
          if (fk <= 0) continue
          const fx = lerp(x + 60, x + 140 + f * 56, fk)
          const fy = LANE_GY - 270 + f * 26
          ctx.save()
          ctx.globalAlpha *= Math.min(1, fk * 2)
          K.fillRR(fx, fy, 96, 70, 8, C.bg2)
          K.strokeRR(fx, fy, 96, 70, 8, C.paper, 2)
          // a tiny stick arm, a different pose per frame
          const a = -0.9 + f * 0.35
          const bx = fx + 76
          const by = fy + 60
          const ex = bx + Math.cos(Math.PI + a) * 32
          const ey = by - Math.abs(Math.sin(Math.PI + a)) * 30 - 8
          K.line(bx, by, ex, ey, C.paper, 4)
          K.line(ex, ey, ex - 22, ey + 16 + f * 3, C.paper, 4)
          K.dot(ex - 22, ey + 16 + f * 3, 4, C.action)
          ctx.restore()
        }
        const nk = outBack(seg(t, 8.3, 8.7))
        if (nk > 0) K.text('1 → 22', x + LANE_W - 10, LANE_GY - 18, { size: 40, weight: 800, fam: 'display', color: C.action, align: 'right', alpha: Math.min(1, nk * 3) })
      }
      laneText(K, t, 7.3, i, L('l1'), L('l1f'))
    }

    // ── lane 2: training signal ────────────────────────────────────────
    const hot = outCubic(seg(t, 13.2, 13.7))
    {
      const i = 1
      const k = outExpo(seg(t, 9.1, 9.7))
      ground(K, i, k)
      if (k > 0) {
        const x = LANE_X(i)
        const gone = outCubic(seg(t, 10.7, 11.3))
        ctx.save()
        ctx.globalAlpha *= k
        // the VLA block
        K.fillRR(x, LANE_GY - 200, 130, 170, 14, C.paper)
        K.text('VLA', x + 65, LANE_GY - 104, { size: 30, weight: 800, fam: 'display', color: C.bg, align: 'center' })
        // action head → chunk (stays)
        const ak = outExpo(seg(t, 9.5, 10.0))
        K.arrow(x + 140, LANE_GY - 70, x + 140 + 70 * ak, LANE_GY - 70, { color: C.action, lw: 4, k: 1 })
        for (let b = 0; b < 6; b++) {
          const bh = 18 + ((b * 37) % 40)
          ctx.globalAlpha = k * outCubic(seg(t, 9.8 + b * 0.05, 10.1 + b * 0.05))
          ctx.fillStyle = C.action
          ctx.fillRect(x + 228 + b * 26, LANE_GY - 50 - bh, 18, bh)
        }
        ctx.globalAlpha = k
        // future head → imagined frame (training only)
        const fk = outExpo(seg(t, 9.8, 10.3)) * lerp(1, 0.22, gone)
        ctx.globalAlpha = k * fk
        K.arrow(x + 140, LANE_GY - 160, x + 210, LANE_GY - 190, { color: C.lang, lw: 4, dash: [6, 6] })
        ctx.setLineDash([8, 8])
        K.strokeRR(x + 222, LANE_GY - 260, 170, 110, 10, C.lang, 3)
        ctx.setLineDash([])
        K.text(L('future'), x + 307, LANE_GY - 196, { size: 24, weight: 500, fam: 'mono', color: C.lang, align: 'center' })
        ctx.restore()
        const gk = outBack(seg(t, 11.0, 11.4))
        if (gk > 0) K.text(L('trainOnly'), x + 307, LANE_GY - 280, { size: 24, weight: 600, fam: 'mono', color: C.action, align: 'center', alpha: Math.min(1, gk * 3) })
      }
      laneText(K, t, 9.4, i, L('l2'), L('l2f'), hot)
    }

    // ── lane 4: evaluator ──────────────────────────────────────────────
    {
      const i = 3
      const k = outExpo(seg(t, 11.9, 12.5))
      ground(K, i, k)
      if (k > 0) {
        const x = LANE_X(i)
        ctx.save()
        ctx.globalAlpha *= k
        // a simulated screen with a predicted-success meter
        K.fillRR(x, LANE_GY - 250, 250, 170, 12, C.bg2)
        K.strokeRR(x, LANE_GY - 250, 250, 170, 12, C.lang, 3)
        const sw = outCubic(seg(t, 12.2, 12.9))
        const wx = lerp(x + 190, x + 90, sw)
        K.line(x + 210, LANE_GY - 110, wx, LANE_GY - 190, C.paper, 6)
        K.line(wx, LANE_GY - 190, wx - 10, LANE_GY - 140, C.paper, 6)
        K.dot(x + 70, LANE_GY - 112, 12, '#6FDCA8')
        const mk = outExpo(seg(t, 12.5, 13.2))
        K.fillRR(x, LANE_GY - 60, 250, 16, 8, C.rail)
        K.fillRR(x, LANE_GY - 60, 250 * 0.8 * mk, 16, 8, C.lang)
        K.text(`${Math.round(80 * mk)} %`, x + 262, LANE_GY - 45, { size: 26, weight: 600, fam: 'mono', color: C.lang })
        ctx.restore()
        // real trials that check it
        const marks = [1, 1, 0, 1, 1]
        marks.forEach((m, j) => {
          const mk2 = outBack(seg(t, 12.8 + j * 0.1, 13.1 + j * 0.1))
          if (mk2 <= 0) return
          const mx = x + 300 + (j % 3) * 40
          const my = LANE_GY - 220 + Math.floor(j / 3) * 46
          ctx.save()
          ctx.translate(mx, my)
          ctx.scale(mk2, mk2)
          if (m) {
            K.line(-10, 0, -2, 9, C.ok, 5)
            K.line(-2, 9, 13, -10, C.ok, 5)
          }
          else {
            K.line(-9, -9, 9, 9, C.warn, 5)
            K.line(9, -9, -9, 9, C.warn, 5)
          }
          ctx.restore()
        })
      }
      laneText(K, t, 12.2, i, L('l4'), L('l4f'))
    }

    K.punch(L('punch'), t, 13.4, { y: 1000, size: 40, maxW: 1760 })
    K.fade(presence(t, 2.4) * (1 - seg(t, 13.2, 13.4)), () => K.cite(L('cite')))
    void clamp
    void alpha
    void H
  },
})

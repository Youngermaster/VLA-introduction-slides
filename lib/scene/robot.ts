/**
 * The robot and its world, drawn side-on. Stylised, but the proportions and
 * the gripper follow the SO-100 (a static jaw plus one moving jaw), because the
 * real one sits on the table next to the projector.
 *
 * Every object is placed by its bottom-centre on the table line and returns
 * its bounding box, so detections, masks and grounding lines can find it.
 */
import { C, type Kit } from './kit'
import { clamp, lerp } from './math'

export type Box = { x: number; y: number; w: number; h: number }
export type Pt = { x: number; y: number }

/** Table surface: a bright top edge carries it — surfaces vanish on a projector. */
export function table(K: Kit, y: number, x0 = 120, x1 = 1800) {
  const { ctx } = K
  ctx.fillStyle = C.table
  ctx.fillRect(x0, y, x1 - x0, 30)
  ctx.fillStyle = C.faint
  ctx.fillRect(x0, y, x1 - x0, 4)
}

export interface ArmOpts {
  /** upper arm and forearm length */
  l1?: number
  l2?: number
  /** 0 = closed, 1 = fully open */
  grip?: number
  /** gripper rotation in radians; 0 = pointing straight down */
  tilt?: number
  body?: string
  accent?: string
  /** draw as a ghost (planning / imagined futures) */
  ghost?: number
}

/** Two-link IK, elbow-up. Returns the elbow for a wrist target. */
export function ik(shoulder: Pt, wrist: Pt, l1: number, l2: number): Pt {
  const dx = wrist.x - shoulder.x
  const dy = wrist.y - shoulder.y
  const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 1, l1 + l2 - 1)
  const a = Math.atan2(dy, dx)
  const c = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1))
  const e1 = { x: shoulder.x + l1 * Math.cos(a + c), y: shoulder.y + l1 * Math.sin(a + c) }
  const e2 = { x: shoulder.x + l1 * Math.cos(a - c), y: shoulder.y + l1 * Math.sin(a - c) }
  return e1.y < e2.y ? e1 : e2
}

/** Where the jaws close, relative to the wrist — objects hang from here. */
export const GRIP_DROP = 128

/**
 * Draw the arm. `base` is the bottom-centre of the base plate on the table;
 * `wrist` is the wrist joint. Returns the joints (for overlays: joint angles,
 * the action-token strip, trails).
 */
export function arm(K: Kit, base: Pt, wrist: Pt, o: ArmOpts = {}) {
  const { ctx } = K
  const { l1 = 380, l2 = 340, grip = 1, tilt = 0, body = C.paper, accent = C.action, ghost = 0 } = o
  const shoulder = { x: base.x, y: base.y - 96 }
  const elbow = ik(shoulder, wrist, l1, l2)
  ctx.save()
  if (ghost) ctx.globalAlpha *= ghost
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // base plate + turret
  if (!ghost) {
    K.fillRR(base.x - 92, base.y - 34, 184, 34, 8, '#20242B')
    K.fillRR(base.x - 50, base.y - 100, 100, 70, 12, '#2A2F37')
  }
  ctx.strokeStyle = body
  ctx.lineWidth = 42
  ctx.beginPath()
  ctx.moveTo(shoulder.x, shoulder.y)
  ctx.lineTo(elbow.x, elbow.y)
  ctx.stroke()
  ctx.lineWidth = 32
  ctx.beginPath()
  ctx.moveTo(elbow.x, elbow.y)
  ctx.lineTo(wrist.x, wrist.y)
  ctx.stroke()
  // gripper
  ctx.save()
  ctx.translate(wrist.x, wrist.y)
  ctx.rotate(tilt)
  const gap = lerp(34, 132, clamp(grip))
  ctx.lineWidth = 24
  ctx.beginPath()
  ctx.moveTo(0, -6)
  ctx.lineTo(0, 38)
  ctx.stroke()
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(-gap / 2 - 8, 44)
  ctx.lineTo(gap / 2 + 8, 44)
  ctx.stroke()
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.moveTo(-gap / 2, 44)
  ctx.lineTo(-gap / 2 + 3, GRIP_DROP)
  ctx.moveTo(gap / 2, 44)
  ctx.lineTo(gap / 2 - 3, GRIP_DROP)
  ctx.stroke()
  ctx.restore()
  // joints: dark hub, paper ring, amber core — the actuators are the "action"
  for (const [p, r] of [[shoulder, 32], [elbow, 26], [wrist, 21]] as const) {
    ctx.fillStyle = C.bg
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = body
    ctx.lineWidth = 6
    ctx.stroke()
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.arc(p.x, p.y, r * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
  return { shoulder, elbow, wrist, tip: { x: wrist.x, y: wrist.y + GRIP_DROP } }
}

/* ── objects ─────────────────────────────────────────────────────────── */

/** "Complejo B" — a vitamin blister pack in its box, coral band, big B. */
export function vitaminBox(K: Kit, x: number, y: number, s = 1): Box {
  const w = 150 * s
  const h = 190 * s
  const bx = x - w / 2
  const by = y - h
  K.fillRR(bx, by, w, h, 8 * s, '#E9ECF1')
  K.ctx.fillStyle = '#FF8A6B'
  K.ctx.fillRect(bx, by + h * 0.18, w, h * 0.3)
  K.text('B', x, by + h * 0.43, { size: 64 * s, weight: 800, fam: 'display', color: '#0A0B0D', align: 'center' })
  K.fillRR(bx + w * 0.14, by + h * 0.62, w * 0.72, 10 * s, 5 * s, '#C3C9D2')
  K.fillRR(bx + w * 0.14, by + h * 0.74, w * 0.5, 10 * s, 5 * s, '#C3C9D2')
  return { x: bx, y: by, w, h }
}

/** Zinc pill bottle: cylinder, cap, mint label "Zn". */
export function bottle(K: Kit, x: number, y: number, s = 1): Box {
  const w = 104 * s
  const h = 170 * s
  const bx = x - w / 2
  const by = y - h
  K.fillRR(bx + 10 * s, by, w - 20 * s, 34 * s, 6 * s, '#9AA4B2')
  K.fillRR(bx, by + 30 * s, w, h - 30 * s, 16 * s, '#E9ECF1')
  K.ctx.fillStyle = '#6FDCA8'
  K.ctx.fillRect(bx, by + 70 * s, w, 62 * s)
  K.text('Zn', x, by + 114 * s, { size: 36 * s, weight: 800, fam: 'display', color: '#0A0B0D', align: 'center' })
  return { x: bx, y: by, w, h }
}

/** A plain mug — the distractor. */
export function mug(K: Kit, x: number, y: number, s = 1, color = '#7C8796'): Box {
  const w = 120 * s
  const h = 130 * s
  const { ctx } = K
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x - w / 2, y - h)
  ctx.lineTo(x + w / 2, y - h)
  ctx.lineTo(x + w / 2 - 10 * s, y)
  ctx.lineTo(x - w / 2 + 10 * s, y)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 13 * s
  ctx.beginPath()
  ctx.arc(x + w / 2 + 4 * s, y - h * 0.55, 28 * s, -1.3, 1.3)
  ctx.stroke()
  return { x: x - w / 2, y: y - h, w, h }
}

/** A cube, for the ACT anecdote (red cube vs blue cube). */
export function cube(K: Kit, x: number, y: number, color: string, s = 1): Box {
  const w = 96 * s
  K.fillRR(x - w / 2, y - w, w, w, 10 * s, color)
  return { x: x - w / 2, y: y - w, w, h: w }
}

/** The tray things get put into. Drawn in two passes so objects sit inside. */
export function trayBack(K: Kit, x: number, y: number, w = 300) {
  K.ctx.fillStyle = '#1C2027'
  K.ctx.beginPath()
  K.ctx.ellipse(x, y - 70, w / 2, 16, 0, 0, Math.PI * 2)
  K.ctx.fill()
}
export function trayFront(K: Kit, x: number, y: number, w = 300): Box {
  const { ctx } = K
  ctx.fillStyle = '#2E343D'
  ctx.beginPath()
  ctx.moveTo(x - w / 2, y - 70)
  ctx.lineTo(x + w / 2, y - 70)
  ctx.lineTo(x + w / 2 - 22, y)
  ctx.lineTo(x - w / 2 + 22, y)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = C.faint
  ctx.fillRect(x - w / 2, y - 72, w, 5)
  return { x: x - w / 2, y: y - 86, w, h: 86 }
}

/** A USB camera glyph with its view cone, for "what the robot sees". */
export function camera(K: Kit, x: number, y: number, angle: number, o: { cone?: number; color?: string; len?: number; spread?: number } = {}) {
  const { ctx } = K
  const { cone = 0, color = C.paper, len = 520, spread = 0.42 } = o
  if (cone > 0) {
    ctx.save()
    ctx.globalAlpha *= cone * 0.1
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle - spread) * len, y + Math.sin(angle - spread) * len)
    ctx.lineTo(x + Math.cos(angle + spread) * len, y + Math.sin(angle + spread) * len)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  K.fillRR(-34, -24, 56, 48, 8, '#2A2F37')
  K.fillRR(18, -16, 22, 32, 4, '#2A2F37')
  K.dot(40, 0, 10, color)
  ctx.restore()
}

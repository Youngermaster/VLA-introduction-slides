/**
 * Motion math for canvas scenes. Every value is a pure function of time in
 * SECONDS — no state between frames — so a scene renders identically whether
 * it is playing, scrubbed backwards, jumped to in the overview, or rasterised
 * by the PDF exporter at a single instant.
 *
 * Springs are ported from the Grisú motion kit (videos/projects/morph-shorts
 * kit/motion.ts), measured off a 60 fps reference: ~0.12 s to 90 %, 5-8 %
 * overshoot, settled by ~0.4 s. Figures that must LAND on a value use finite
 * eases instead — a critically damped spring creeps and shows 2,802 for 2,809.
 */

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
/** Progress of t through [a, b], clamped to 0..1. */
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k
export const mod = (a: number, n: number) => ((a % n) + n) % n

/* ── eases ─────────────────────────────────────────────────────────────── */
export const outExpo = (k: number) => (k >= 1 ? 1 : 1 - 2 ** (-10 * clamp(k)))
export const inExpo = (k: number) => (k <= 0 ? 0 : 2 ** (10 * clamp(k) - 10))
export const outCubic = (k: number) => 1 - (1 - clamp(k)) ** 3
export const inOutCubic = (k: number) => {
  const c = clamp(k)
  return c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2
}
export const outQuint = (k: number) => 1 - (1 - clamp(k)) ** 5
/** Tiny overshoot, for things that land (chips, stamps). */
export const outBack = (k: number, s = 1.7) => {
  const c = clamp(k) - 1
  return 1 + (s + 1) * c ** 3 + s * c ** 2
}

/* ── springs ───────────────────────────────────────────────────────────── */
export type Spring = { w: number; z: number }
export const SNAP: Spring = { w: 20, z: 0.72 }
export const SOFT: Spring = { w: 11, z: 0.86 }
export const HAND: Spring = { w: 9, z: 0.92 }

/** Unit step response of a damped spring released at t0: 0 before, → 1 after. */
export const step = (t: number, t0: number, s: Spring = SNAP): number => {
  const u = t - t0
  if (u <= 0) return 0
  const { w, z } = s
  if (z >= 1) return 1 - Math.exp(-w * u) * (1 + w * u)
  const wd = w * Math.sqrt(1 - z * z)
  return 1 - Math.exp(-z * w * u) * (Math.cos(wd * u) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * u))
}

export type Key = readonly [number, number]
/** A value that springs to each new target at its key time: the sum of springs. */
export const track = (t: number, keys: readonly Key[], s: Spring = SNAP): number => {
  let v = keys[0][1]
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * step(t, keys[i][0], s)
  return v
}

/** Piecewise keyframes with an ease per segment — for paths that must land exactly. */
export const keys = (
  t: number,
  kf: readonly (readonly [number, number])[],
  ease: (k: number) => number = inOutCubic,
): number => {
  if (t <= kf[0][0]) return kf[0][1]
  for (let i = 0; i < kf.length - 1; i++) {
    const [ta, va] = kf[i]
    const [tb, vb] = kf[i + 1]
    if (t <= tb) return lerp(va, vb, ease(seg(t, ta, tb)))
  }
  return kf[kf.length - 1][1]
}

/** Same, for points. Keys are [t, x, y]. */
export const path2 = (
  t: number,
  kf: readonly (readonly [number, number, number])[],
  ease: (k: number) => number = inOutCubic,
) => ({
  x: keys(t, kf.map(([a, x]) => [a, x] as const), ease),
  y: keys(t, kf.map(([a, , y]) => [a, y] as const), ease),
})

/**
 * Presence window: 0 → 1 over `din` from tin, 1 → 0 over `dout` from tout.
 * Content that swaps in one place uses two windows that do NOT overlap —
 * cross-fading two texts in one spot reads as mush.
 */
export const presence = (t: number, tin: number, tout = Infinity, din = 0.3, dout = 0.2) =>
  Math.min(outCubic(seg(t, tin, tin + din)), Number.isFinite(tout) ? 1 - outCubic(seg(t, tout, tout + dout)) : 1)

/* ── deterministic noise ───────────────────────────────────────────────── */
/** mulberry32: the same seed gives the same "random" layout on every frame. */
export function rng(seed: number) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let x = Math.imul(s ^ (s >>> 15), 1 | s)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}
/** A stable pseudo-random number for (a, b) — no generator to thread through. */
export const hash = (a: number, b = 0) => rng(a * 7919 + b * 104729 + 17)()

/* ── colour ────────────────────────────────────────────────────────────── */
const hex = (c: string): [number, number, number] => {
  const n = Number.parseInt(c.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export const alpha = (c: string, a: number) => {
  const [r, g, b] = hex(c)
  return `rgba(${r},${g},${b},${clamp(a)})`
}
export const mix = (a: string, b: string, k: number) => {
  const A = hex(a)
  const B = hex(b)
  const c = A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

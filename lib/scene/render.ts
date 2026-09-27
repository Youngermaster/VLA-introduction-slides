import { scenes } from '../../scenes'
import { C, H, W, makeKit } from './kit'
import { labeler } from './strings'
import type { Locale } from '../locale'

/** Draw scene `name` at time t into a canvas whose backing store is already sized. */
export function renderScene(canvas: HTMLCanvasElement, name: string, t: number, stage: number, lang: Locale, height = H, variant?: string) {
  const def = scenes[name]
  const ctx = canvas.getContext('2d')
  if (!def || !ctx) return
  const s = canvas.width / W
  ctx.setTransform(s, 0, 0, s, 0, 0)
  ctx.globalAlpha = 1
  ctx.filter = 'none'
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, height)
  try {
    def.draw({ t, stage, L: labeler(name, lang, variant), lang, K: makeKit(ctx), ctx })
  }
  catch (e) {
    console.error(`[Scene ${name}] t=${t}`, e)
  }
}

/** The stage a given time belongs to: the first cue at or after t. */
export function stageAt(name: string, t: number) {
  const cues = scenes[name]?.cues ?? [0]
  const i = cues.findIndex((c) => t <= c + 1e-6)
  return i === -1 ? cues.length - 1 : i
}

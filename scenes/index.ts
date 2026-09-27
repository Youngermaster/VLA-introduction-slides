/**
 * Scene registry: every scenes/<name>.ts default-exports a defineScene(…).
 * The file name is the scene name used in <Scene name="…"/> and in
 * locales/scenes/<name>.yml.
 */
import type { SceneDef } from '../lib/scene/types'

const mods = import.meta.glob('./*.ts', { eager: true, import: 'default' }) as Record<string, SceneDef>

export const scenes: Record<string, SceneDef> = Object.fromEntries(
  Object.entries(mods)
    .filter(([p]) => !p.endsWith('/index.ts'))
    .map(([p, d]) => [p.slice(2, -3), d]),
)

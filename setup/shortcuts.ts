import type { NavOperations, ShortcutOptions } from '@slidev/types'
import { defineShortcutsSetup } from '@slidev/types'
import { slides } from '#slidev/slides'
import { toggleSlideLocale } from '../lib/locale'

/**
 * PANIC MODE.
 *
 * If the live robot demo fails, `B` jumps straight to the pre-recorded backup
 * video and `V` returns to wherever you jumped from. Two keys, no fumbling with
 * the slide-picker in front of a room.
 *
 * The target is resolved by ROUTE ALIAS, not a hardcoded slide number, so
 * inserting or reordering slides can never silently break it.
 */
function slideNoByAlias(alias: string): number | undefined {
  const index = slides.value.findIndex(
    (s) => s.meta?.slide?.frontmatter?.routeAlias === alias,
  )
  return index >= 0 ? index + 1 : undefined
}

let returnTo: number | undefined

export default defineShortcutsSetup((nav: NavOperations, base: ShortcutOptions[]) => {
  return [
    ...base,
    {
      key: 'b',
      name: 'panic.backup',
      fn: () => {
        const target = slideNoByAlias('backup-demo')
        if (target === undefined) return
        const current = getCurrentSlideNo()
        if (current !== target) returnTo = current
        nav.go(target)
      },
    },
    {
      key: 'v',
      name: 'panic.return',
      fn: () => {
        if (returnTo !== undefined) {
          nav.go(returnTo)
          returnTo = undefined
        }
      },
    },
    {
      // Live language switch. Useful if someone in the room asks for English,
      // and how the practice route's slide pane is driven.
      key: 'l',
      name: 'locale.toggle',
      fn: () => toggleSlideLocale(),
    },
  ]
})

function getCurrentSlideNo(): number | undefined {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  const parsed = Number.parseInt(raw, 10)
  if (Number.isFinite(parsed)) return parsed
  const path = Number.parseInt(window.location.pathname.split('/').pop() ?? '', 10)
  return Number.isFinite(path) ? path : undefined
}

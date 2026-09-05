import { defineUnoSetup } from '@slidev/types'

/**
 * Slidev's client defines the shortcut `bg-main: 'bg-white dark:bg-[#121212]'`
 * and puts that class on <body> and on its own UI chrome. #121212 is not our
 * ground, so during a slide seam — when the two slides' summed opacity dips
 * below 1 — that lighter grey shows through as a flash at every boundary.
 *
 * Redefining the shortcut fixes the deck AND Slidev's chrome in one place,
 * which is why this beats fighting it with a more specific CSS selector.
 */
export default defineUnoSetup(() => ({
  shortcuts: {
    'bg-main': 'bg-[#0A0B0D]',
    'text-main': 'text-[#F4F6F8]',
  },
  theme: {
    colors: {
      action: '#FFB65C',
      lang: '#5CC8FF',
      ground: '#0A0B0D',
      ink: '#F4F6F8',
      inkdim: '#C6CDD8',
      inkmute: '#98A0AD',
      hairline: '#363B44',
    },
  },
}))

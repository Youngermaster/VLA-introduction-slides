import { defineRoutesSetup } from '@slidev/types'

/**
 * The rehearsal route.
 *
 * Nothing off-the-shelf does this: QPrompt, PrompterOne and RemoteCue are all
 * deck-agnostic scrolling teleprompters that have no idea which slide you are
 * on, and none of them can run the script in one language while the slides run
 * in another. So it is custom — but it is a ROUTE, not a new presentation
 * engine. `defineRoutesSetup` is a supported Slidev API.
 *
 * A static segment outranks the built-in `/:no` param route in Vue Router's
 * path ranking, so `/practice` wins without needing to be prepended.
 */
export default defineRoutesSetup((routes) => [
  ...routes,
  {
    path: '/practice',
    name: 'practice',
    component: () => import('../pages/practice.vue'),
  },
])

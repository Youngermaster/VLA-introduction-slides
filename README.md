# Del Token al Torque

An interactive talk on **Vision-Language-Action (VLA) models**, built for the AI
Medellín meetup, with a live SO-100 robot arm demo.

Most slides are **motion-graphics scenes drawn in code**: a camera splits the
table into patches, words find their objects, tokens turn into servo angles, an
arm picks the bottle. Few words on screen, the mechanism shown instead of
described. Bilingual (Spanish / English), dark-themed for projectors, runs fully
offline, exports to PDF, and ships a `/practice` rehearsal mode.

```bash
pnpm install
pnpm dev          # → http://localhost:3030
```

---

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Static SPA into `dist/` (hash routing, for GitHub Pages) |
| `pnpm build:es` / `pnpm build:en` | One build per language into `dist/es`, `dist/en` |
| `pnpm export` / `pnpm export:en` | PDF into `export/`, the fallback if the projector fails |
| `pnpm verify` | TypeScript strict + the content drift guard |
| `pnpm check:content` | Locale parity, key resolution, monologue coverage |
| `pnpm check:fit` | Flags any slide whose content overflows the canvas, in **both** languages (dev server must be running) |
| `node scripts/shots.mjs --lang es [--clicks]` | Screenshot every slide (dev server must be running) |
| `node scripts/sheet.mjs <scene> [--lang en]` | Contact sheet of one canvas scene, every cue and midpoint |

> **Do not add `--per-slide` to the export.** It renders each slide in its own
> pass and silently drops the click steps. The PDF comes out at one page per
> slide, which means every build-up visualization exports as a blank canvas.
> The correct export has one page per click step of every slide.

> **Frontmatter changes need a server restart.** Slidev's HMR does not reliably
> pick up `clicks:` or `layout:` edits, and the slide will silently register zero
> click steps. If a build-up stops advancing, restart `pnpm dev` before debugging
> anything else.

---

## Presenting

Full stage notes are in **[docs/PRESENTING.md](docs/PRESENTING.md)**. Read that
one on the day. The two keys that matter:

| Key | Action |
|---|---|
| **B** | **Panic mode.** Jump back to the recorded demo videos from anywhere. |
| **V** | Return to the slide you jumped from. |
| **L** | Switch the deck's language live. |

Presenter mode with speaker notes: `http://localhost:3030/#/presenter`.

---

## Scenes: the motion graphics

25 of the 32 slides are canvas scenes (`scenes/*.ts`), in the spirit of the
LibreYOLO showreel in `motion-graphics-experiments/`. Each one is a pure
function of time: every click plays the scene forward to its next cue and
stops, ← rewinds, and the PDF export and overview show each step's finished
frame. Springs and eases are ported from the Grisú motion kit.

```
scenes/<name>.ts               defineScene({ cues, draw })
locales/scenes/<name>.yml      es and en, side by side
slides.md                      layout: scene · clicks: cues.length - 1 · <Scene name="<name>" />
```

The workbench is at **`/#/lab`**: scrub any scene, jump between cues, switch
language. Style and motion rules are in **[docs/SCENES.md](docs/SCENES.md)**; every
number drawn on screen comes from **[docs/RESEARCH.md](docs/RESEARCH.md)**.

---

## How the bilingual deck works

Slidev has no built-in i18n ([upstream #1125](https://github.com/slidevjs/slidev/issues/1125)
is still open), so this deck brings its own. **Structure and text are separated:**

```
slides.md                  layout, components, click budgets: the deck's skeleton
locales/{es,en}.yml        the text of the HTML slides (demo, photo, closing)
locales/scenes/<name>.yml  each scene's words, both languages side by side
```

**Scenes are localized too.** A scene reads its words with `L('key')`, and the
check fails if a key is missing in either language. Hardcoding a label in a
scene is the easy way to end up with an "English" deck full of Spanish diagrams.

In an HTML slide, text comes through one of two forms:

```md
# {{ $t('hook.title') }}        <!-- plain string -->
<T k="hook.body" block />       <!-- markdown: bold, links, inline code -->
```

The alternative (two `slides.es.md` / `slides.en.md` files) was rejected
because it duplicates slide *structure*: reordering a slide would mean doing it
twice, and the practice mode's independent language switching would be
impossible.

**To edit a sentence, open `locales/<lang>.yml`, not `slides.md`.** YAML block
scalars (`key: |`) keep it real markdown, so prose stays comfortable to write.

Two YAML traps worth knowing, because both fail loudly and confusingly:
a plain scalar containing `": "` is a syntax error (use `>-`), and a literal
`{brace}` in a message is a vue-i18n compile error (keep braces in the template).

Language resolution order: `?lang=` → `localStorage` → `VITE_DECK_LOCALE` env →
`es`. The env var is what makes per-language PDF export work, since
`slidev export` drives its own browser and can't be handed a query string.

---

## Practice mode

```
http://localhost:3030/#/practice
```

The spoken script on the left, the live slide on the right, **each with its own
language selector**, so you can rehearse the Spanish delivery while reading the
English slides, or the reverse. Nothing off-the-shelf does this; teleprompters
are deck-agnostic and don't know which slide you're on.

Below the slide it shows the deck's own **speaker notes** (the short stage cues),
so the right-hand pane is what you actually stand behind: the slide, plus what
you glance at. The full script stays on the left.

It also gives you:

- per-section **word count → estimated spoken duration** (150 wpm ES / 160 wpm EN)
  against the target you declared, so overruns show up while you're *writing*
- a running total against the time budget
- a rehearsal timer that colours green / amber when you drift off pace
- a list of slides that have no script yet

The script lives in `monologue/es.md` and `monologue/en.md`, keyed by each
slide's `routeAlias`:

```md
## hook
<!-- target: 60 -->

Quiero empezar por una pregunta…
```

Because the join key is the **alias, not the slide number**, reordering slides
never desynchronises the script. `pnpm check:content` fails if a slide has no
section, or a section has no slide.

### Two kinds of notes, on purpose

- **Speaker notes** (the `<!-- -->` block at the end of each slide in
  `slides.md`) are short delivery cues and timing, what you glance at on stage.
- **`monologue/*.md`** is the full word-for-word script you rehearse against.

They are different artifacts because they have different jobs. Notes are also
static markdown and cannot be switched at runtime, which is the other reason the
full script lives separately.

---

## Offline

The venue WiFi will be bad. This deck assumes it:

- Fonts are **npm packages** (`@fontsource-variable/*`) imported in
  `styles/index.ts`. Headmatter sets `fonts: { provider: none }`, because Slidev's
  default emits a `fonts.googleapis.com` stylesheet that the **browser** resolves
  at runtime, which is the classic way an "offline" deck dies on stage.
- QR codes are generated locally as inline SVG. No image service.
- Everything else lives in `public/`.

Verify before you travel:

```bash
pnpm build
npx serve dist          # then turn WiFi OFF and click through
```

In DevTools → Network, confirm **zero requests to `fonts.googleapis.com`**.

---

## Project layout

```
slides.md                deck structure
scenes/                  23 canvas scenes (one reused for the 5 chapter openers)
lib/scene/               the scene engine: math (springs, eases), kit (text, chips,
                         boxes, traces), robot (SO-100 arm with IK, objects), render
components/              Scene · VideoSlot · PhotoSlot · QrCard · References · T
locales/{es,en}.yml      HTML-slide text · locales/scenes/*.yml scene text
monologue/{es,en}.md     the spoken script
layouts/                 scene · claim · act · viz · split
pages/                   practice (rehearsal) · lab (scene workbench)
setup/                   main (i18n) · routes · shortcuts · unocss
styles/                  tokens · base · slides · motion
scripts/                 check-content · check-fit · check-types · shots · sheet · reorder
docs/                    PRESENTING · ASSETS · SCENES · RESEARCH
public/                  images, video (your assets go here)
```

Layouts are named `claim` and `act` rather than `statement` and `section`
because **those two names are taken by the default theme**, whose CSS forces
`text-center` onto them regardless of your component.

---

## Assets

Photos and videos are drop-in: put the file at the path the placeholder shows
and it appears. **[docs/ASSETS.md](docs/ASSETS.md)** lists the three files,
including the recording of your real demo.

---

## Why no animation library

The scenes are plain Canvas 2D driven by a small kit (`lib/scene/`): closed-form
springs and eases evaluated at time *t*, so any frame can be drawn in any order.
That is what makes ← rewind, overview thumbnails and PDF export work with no
extra machinery, and it's the same rule the Remotion shorts follow. An animation
runtime with internal state (GSAP timelines, spring integrators) would fight it.

## Design notes

Two accents carry meaning consistently and are never swapped:

- **amber `#FFB65C`**: the world and the body: robot, gripper, trajectory, torque
- **cyan `#5CC8FF`**: the model and the symbol: tokens, attention, language

They sit on the blue↔orange axis, the one axis preserved under deuteranopia, and
they also separate on luminance alone, so they survive a grayscale projector or
a photo of the screen.

The load-bearing constraint: under a modeled projector veil, surface elevations
land at **1.04:1** and hairline borders at **1.18:1**, which is invisible from row three.
So structure is carried by type scale, weight, accent and whitespace, never by
cards or borders. If you add a slide, follow that.

A third ground colour appears only in the V·L·A panels (paper, cyan, amber).
Headlines use Unbounded, the same face in HTML slides and scenes.

Between keypresses everything is at rest: no idle loops, no pulsing glows.
Motion is punctuation tied to a key.

---

## License

Apache-2.0. Slides and script by Juan Manuel Young Hoyos.

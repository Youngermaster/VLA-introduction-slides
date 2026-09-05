# Del Token al Torque

An interactive talk on **Vision-Language-Action (VLA) models**, built for the AI
Medellín meetup — with a live SO-101 robot arm demo.

Bilingual (Spanish / English), dark-themed for projectors, runs fully offline,
exports to PDF, and ships a `/practice` rehearsal mode.

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
| `pnpm export` / `pnpm export:en` | PDF into `export/` — the projector-fails fallback |
| `pnpm verify` | TypeScript strict + the content drift guard |
| `pnpm check:content` | Locale parity, key resolution, monologue coverage |
| `pnpm check:fit` | Flags any slide whose content overflows the canvas, in **both** languages (dev server must be running) |
| `node scripts/shots.mjs --lang es [--clicks]` | Screenshot every slide (dev server must be running) |

> **Do not add `--per-slide` to the export.** It renders each slide in its own
> pass and silently drops the click steps — the PDF comes out at one page per
> slide, which means every build-up visualization exports as a blank canvas.
> The correct export is 177 pages (47 slides + their click steps).

> **Frontmatter changes need a server restart.** Slidev's HMR does not reliably
> pick up `clicks:` or `layout:` edits — the slide will silently register zero
> click steps. If a build-up stops advancing, restart `pnpm dev` before debugging
> anything else.

---

## Presenting

Full stage notes are in **[docs/PRESENTING.md](docs/PRESENTING.md)** — read that
one on the day. The two keys that matter:

| Key | Action |
|---|---|
| **B** | **Panic mode.** Jump to the backup demo video from anywhere. |
| **V** | Return to the slide you jumped from. |
| **L** | Switch the deck's language live. |

Presenter mode with speaker notes: `http://localhost:3030/#/presenter`.

---

## How the bilingual deck works

Slidev has no built-in i18n ([upstream #1125](https://github.com/slidevjs/slidev/issues/1125)
is still open), so this deck brings its own. **Structure and text are separated:**

```
slides.md          layout, components, click budgets — the deck's skeleton
locales/es.yml     every word on every slide, as editable markdown prose
locales/en.yml
```

**The visualizations are localized too.** Diagram labels live under the `c.*`
namespace and are read with `useTx()` from `lib/tx.ts` — `t()` for plain strings,
`md()` for copy that needs **bold**. Hardcoding a label in a `.vue` file is the
easy way to end up with an "English" deck full of Spanish diagrams.

In a slide, text comes through one of two forms:

```md
# {{ $t('hook.title') }}        <!-- plain string -->
<T k="hook.body" block />       <!-- markdown: bold, links, inline code -->
```

The alternative — two `slides.es.md` / `slides.en.md` files — was rejected
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
language selector** — so you can rehearse the Spanish delivery while reading the
English slides, or the reverse. Nothing off-the-shelf does this; teleprompters
are deck-agnostic and don't know which slide you're on.

Below the slide it shows the deck's own **speaker notes** — the short stage cues
— so the right-hand pane is what you actually stand behind: the slide, plus what
you glance at. The full script stays on the left.

It also gives you:

- per-section **word count → estimated spoken duration** (150 wpm ES / 160 wpm EN)
  against the target you declared, so overruns show up while you're *writing*
- a running total against the 50-minute budget
- a rehearsal timer that colours green / amber when you drift off pace
- a list of slides that have no script yet

The script lives in `monologue/es.md` and `monologue/en.md`, keyed by each
slide's `routeAlias`:

```md
## hook-provocation
<!-- target: 75s -->

Quiero empezar por una pregunta…
```

Because the join key is the **alias, not the slide number**, reordering slides
never desynchronises the script. `pnpm check:content` fails if a slide has no
section, or a section has no slide.

### Two kinds of notes, on purpose

- **Speaker notes** (the `<!-- -->` block at the end of each slide in
  `slides.md`) are short delivery cues and timing — what you glance at on stage.
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
  at runtime — the classic way an "offline" deck dies on stage.
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
locales/{es,en}.yml      all slide prose
monologue/{es,en}.md     the spoken script
components/              25 custom visualizations, all localized via lib/tx.ts
layouts/                 claim · act · viz · split
scripts/reorder.mjs      reorder slides by routeAlias (narrative order changes often)
pages/practice.vue       rehearsal route
setup/                   main (i18n) · routes · shortcuts · unocss
styles/                  tokens · base · slides · motion
scripts/                 check-content · check-fit · check-types · shots · reorder
docs/                    PRESENTING · ASSETS
public/                  images, video, fonts — your assets go here
```

Layouts are named `claim` and `act` rather than `statement` and `section`
because **those two names are taken by the default theme**, whose CSS forces
`text-center` onto them regardless of your component.

---

## Assets

Everything visual is currently a placeholder. **[docs/ASSETS.md](docs/ASSETS.md)**
lists exactly what to drop where.

---

## Why there is no animation library

GSAP was in here for a while, on the theory that the trajectory and chunking
visualizations would need timeline scrubbing. They didn't: every animation in the
deck is a CSS transition on `transform`/`opacity` driven by `$clicks`, which is
seek-safe by construction — the state at click *n* is a pure function of *n*, so
stepping backwards works with no extra machinery. The library ended up importing
~100 KB to set a default ease nothing used, so it came back out.

If a future slide genuinely needs a scrubbed timeline or 2D grid stagger, `gsap`
is the right addition (it is free including all plugins, has zero runtime
dependencies, and vendors fully offline). Until then it would be weight.

## Design notes

Two accents carry meaning consistently and are never swapped:

- **amber `#FFB65C`** — the world and the body: robot, gripper, trajectory, torque
- **cyan `#5CC8FF`** — the model and the symbol: tokens, attention, language

They sit on the blue↔orange axis, the one axis preserved under deuteranopia, and
they also separate on luminance alone — so they survive a grayscale projector or
a photo of the screen.

The load-bearing constraint: under a modeled projector veil, surface elevations
land at **1.04:1** and hairline borders at **1.18:1** — invisible from row three.
So structure is carried by type scale, weight, accent and whitespace, never by
cards or borders. If you add a slide, follow that.

Motion tokens live in `styles/motion.css`. Between keypresses everything is at
rest: no idle loops, no pulsing glows. Motion is punctuation tied to a key.

---

## License

Apache-2.0. Slides and script by Juan Manuel Younes.

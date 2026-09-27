# Scenes: how the motion graphics work

Most slides in this deck are **canvas scenes**: motion graphics drawn in code,
in the spirit of the LibreYOLO showreel in `motion-graphics-experiments/` and
the Grisú motion playbook. A scene explains a mechanism by *showing* it (a
camera sees, tokens split, an arm moves), with a few words on screen instead
of a paragraph.

## Anatomy

```
scenes/<name>.ts               export default defineScene({ cues, draw })
locales/scenes/<name>.yml      es: {…}  en: {…}   (both languages side by side)
slides.md                      layout: scene · clicks: cues.length - 1 · <Scene name="<name>" />
```

- **`draw({ t, stage, L, K, ctx })` is a pure function of `t`** (seconds). No
  state, no timers, no `Math.random()` (use `rng(seed)` / `hash()`), no
  `Date.now()`. The same `t` must always paint the same frame: the scene is
  scrubbed backwards live, jumped around in the overview, and rasterised at a
  single instant by the PDF export.
- **`cues`**: where the playhead rests. `cues[0]` ends the arrival animation;
  `cues[k]` ends click *k*. The slide's `clicks:` must equal `cues.length - 1`
  (`pnpm check:content` enforces it).
- **At rest nothing moves.** At every cue the frame is final: no blinking
  cursor, no ticking counter, no breathing. Motion is punctuation tied to a
  keypress. Something that animates *is* allowed only between cues.
- Draw in the **1920 × 1080 logical space** (`W`, `H` from the kit). Keep a
  72 px margin on every side. The bottom 56 px holds the `K.cite()` source line.
- **Strings come only from `L('key')`**, defined in both `es` and `en`. Never
  hardcode prose in the scene file (numbers, code identifiers and symbols like
  `π`, `Δx`, `q01` are fine).

## Visual language

| Token | Use |
|---|---|
| `C.paper` | the world as seen: objects, arm body, detection boxes, main text |
| `C.lang` (cyan) | the model and symbols: tokens, attention, grounding lines, embeddings |
| `C.action` (amber) | the body acting: trajectories, action tokens, the target, accent words |
| `C.ok` / `C.warn` | success / failure only |
| `C.mute`, `C.dim` | labels, captions, secondary |

Never swap the two accents. Structure comes from type, colour and space, not
from boxes: surfaces and hairlines vanish on a projector. Fill shapes when a
thing matters; keep borders for detection boxes.

**Type** (`K.text(…, { fam })`): `display` = Unbounded (titles, huge numbers,
kinetic statements), `sans` = Instrument Sans (sentences, 36–48 px), `mono` =
Geist Mono (labels, token IDs, code). **Minimum size 22 px**: this is read
from the back of a room.

**Words on screen**: a scene is not a paragraph. A title (≤ 8 words), labels,
and at most one short punchline per stage. The spoken script carries the rest.

## Motion language

- Titles: `K.title(L('title'), t)`: words blur-rise 40 ms apart, top-left.
- Punchlines: `K.punch(L('punch'), t, t0)`: one sentence, `*accent*` words in amber.
- Arrivals: `outExpo` for things that land, `outBack` for chips that pop,
  `step()` springs for objects that drop in. Figures that must land exactly
  (numbers) use finite eases, never springs.
- Lines draw on with `K.trace(points, k)`; boxes with `K.detBox(…, { k })`.
- Stagger lists ~40–80 ms per item; a click's animation should read in
  **1.5–4 s** (a pick-and-place may take up to ~6 s).
- Content that swaps in one place uses two presence windows that don't overlap.
- One bold move per scene (a camera push-in, a morph, a counter). Scattered
  effects read as a template.
- Banned: idle loops, glows/neon, gradients on chrome, bouncy easing, emoji,
  particle bursts for their own sake.

## Honesty

Numbers come from `docs/RESEARCH.md` and are cited on screen with `K.cite()`.
When a scene *illustrates* rather than depicts (VLAs don't draw bounding boxes;
token IDs made up for display), a footnote says so.

## Tooling

```sh
pnpm dev                                        # then:
open 'http://localhost:3030/#/lab'              # the scene workbench (scrubber, cue buttons, language)
node scripts/sheet.mjs <name> --lang en --port 3030   # contact sheet → .shots/scenes/<name>.en.png
node scripts/sheet.mjs <name> --times 0.5,2,4   # chosen instants
```

Look at the sheet in **both languages** before calling a scene done: overlaps,
text running off the frame and ghost elements only show up there. Add
`?scene_t=3.2` to a deck URL to freeze every scene at that time.

## Writing

No em dashes in any on-screen or spoken text. Use a comma, a period, a colon
or a connector word.

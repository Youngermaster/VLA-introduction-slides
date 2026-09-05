# Presenting — the day-of checklist

Read this one on the day. Everything else can wait.

---

## Keys

| Key | Action |
|---|---|
| **B** | **PANIC MODE** — jump straight to the backup demo video, from any slide |
| **V** | Return to the slide you jumped from |
| **L** | Switch the deck's language live (ES ⇄ EN) |
| → / ← | Next / previous step |
| **F** | Fullscreen |
| **O** | Slide overview |
| **D** | Drawing mode (annotate live) |
| **G** | Go to slide by number |

Panic mode resolves the backup slide **by route alias**, not by a hard-coded
number, so it keeps working if you reorder or insert slides.

---

## The night before

- [ ] `pnpm export` — put the PDF on the laptop **and** on a USB stick. If the
      laptop dies you can present from someone else's machine.
- [ ] Record the backup demo video and drop it in `public/video/`
      (see [ASSETS.md](ASSETS.md)). **Do this even if the live demo is working.**
- [ ] Full run-through in `/practice` with the timer. If you're over 38 minutes
      of speaking, cut from Act 4 — never from `data-asymmetry` or the demo.
- [ ] Charge everything. Bring your own power strip; do not assume there's an
      outlet where the robot needs to be.
- [ ] `pnpm build && npx serve dist` with **WiFi off**, click through the whole
      deck. This is the only way to catch a font or asset that still needs the
      network.

## One hour before, in the room

- [ ] **Verify camera indices here.** USB camera order changes on every
      reconnect. Run `lerobot-find-cameras` and update the command. This is the
      single most common way a robot demo fails.
- [ ] Calibrate the arm in the room's actual lighting.
- [ ] Test the projector: does the amber accent still read? Does the cyan?
      If the projector is washing everything out, raise the room's contrast by
      killing the lights nearest the screen rather than fiddling with the deck.
- [ ] Run the demo end to end **twice**. If it fails twice, present from video
      and say so — that's a normal outcome, not a defeat.
- [ ] Place the props: Complejo B pack, magnesium bottle. Mark their positions
      with tape so you can reset them fast between runs.
- [ ] Bring your own lamp if the room's light differs from where you trained.
      Imitation policies are very sensitive to lighting.

---

## Timing

Total slot ~50 min. The script is ~26 minutes of speaking; the rest is the demo,
transitions and Q&A.

| Act | Slides | Target |
|---|---|---|
| 1 · Hook | title → data-asymmetry | 4 min |
| 2 · How we got here | act2-open → act-limitation | 6 min |
| 3 · How VLAs work | act3-open → rt2-insight | 12 min |
| 4 · Landscape | act4-open → when-to-use | 6 min |
| 5 · **Live demo** | act5-open → backup-demo | 9 min |
| 6 · Reality | act6-open → data-economics | 5 min |
| 7 · Architecture lesson | act7-open → chess-lesson | 4 min |
| 8 · Future | act8-open → open-question | 5 min |
| Closing | resources → thanks | 2 min |

**If you're running late**, cut in this order:
1. `demo-act-video` (the ACT comparison) — down to 30 s or skip
2. `generalist-models`
3. `model-landscape` — do two rows instead of five
4. `adoption`

**Never cut** `data-asymmetry`, `vla-architecture`, the demo, or `chess-lesson`.
Those four are the talk.

---

## If the demo fails

You planned for this. The demo is mid-talk precisely so a failure isn't the last
thing the room remembers.

1. Try **once** more. Not three times.
2. Press **B**. Play the backup video, narrate over it.
3. Say the line: *"this happens, and it's actually a perfect transition, because
   the next act is called 'the honest part'."* Then move on.
4. Do not apologise more than once. The room is on your side.

A failed live demo that you handle calmly is more credible than a demo that
works. It proves the limitations slide is honest.

---

## Questions you should expect

**"How much did the arm cost?"**
~150 USD in parts plus filament. The servos are most of it.

**"Can it do X?"**
Be honest about the generalization gap — that's slide `limitations`. It handles
objects near what it saw. It does not handle a new task.

**"How long did training take?"**
SmolVLA fine-tune, ~20k steps: a few hours on the 5060 Ti. The dataset recording
was the slow part.

**"Why not just use an LLM with a robot API?"**
Good question, and it's the `chess-lesson` answer: you can, and for structured
tasks you *should*. The VLA earns its place where the motion itself has to
generalize, not just the plan.

**"What about safety?"**
Not solved. Current VLAs have no notion of consequence — that's the
`world-models` slide. On real deployments this is handled outside the policy,
with force limits and workspace constraints.

**"Does it work in Spanish?"**
Depends on the backbone's language coverage. The instruction is encoded by the
VLM, so multilingual backbones handle it. Worth testing before claiming it.

# Presenting: the day-of checklist

Read this one on the day. Everything else can wait.

---

## Keys

| Key | Action |
|---|---|
| **B** | **PANIC MODE**: jump back to the first recorded demo (`demo-video`), from any slide |
| **V** | Return to the slide you jumped from |
| **L** | Switch the deck's language live (ES ⇄ EN) |
| → / ← | Next / previous step |
| **F** | Fullscreen |
| **O** | Slide overview |
| **D** | Drawing mode (annotate live) |
| **G** | Go to slide by number |

Panic mode resolves the demo slide **by route alias**, not by a hard-coded
number, so it keeps working if you reorder or insert slides.

---

## The night before

- [ ] `pnpm export` and put the PDF on the laptop **and** on a USB stick. If the
      laptop dies you can present from someone else's machine.
- [ ] Play both recorded demos once (`demo-video`, `demo-zinc`) on the laptop
      you present from. They are your fallback if the live run fails.
- [ ] Full run-through in `/practice` with the timer. If you're over 38 minutes
      of speaking, cut from Act 4, never from `data-asymmetry` or the demo.
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
      and say so. That's a normal outcome, not a defeat.
- [ ] Place the props: Complejo B pack, zinc bottle. Mark their positions
      with tape so you can reset them fast between runs.
- [ ] Bring your own lamp if the room's light differs from where you trained.
      Imitation policies are very sensitive to lighting.

---

## Timing

Budget **30–40 min** plus questions. The script is **~25 min of speech** (Spanish); with
each click's animation, pauses and ~5 min of demo it lands at **~35 min**.
`/practice` measures the speech from the actual text.

| Part | Slides | Target |
|---|---|---|
| Opening | title → data-asymmetry | 3 min |
| 01 · What is a VLA | ch-vla → act-vs-vla | 6.5 min |
| 02 · **Inside** | ch-inside → architecture | 12.5 min |
| 03 · How it learns | ch-train → pretrain-finetune | 4.5 min |
| 04 · **Demo** | ch-demo → demo-zinc, then live | 6.5 min |
| 05 · What comes next | ch-future → when-to-use | 6.5 min |
| Closing | thanks → references | 0.5 min + Q&A |

32 slides; 25 of them are canvas scenes, so almost every click *shows*
something happening. Let each click's animation finish before you talk over it.

**If you're running late**, cut in this order. Each can go without breaking the
argument:

1. `field-growth`
2. `detokenizer`, only if desperate. It's the half nobody else explains
3. `vision-in`: say one sentence over `language-in` instead
4. `limitations`: keep only its first click (the saturated benchmark)

**Never cut** `data-asymmetry`, `vla-hero`, `action-tokens`, `architecture` or
the demo. Those are the talk.

### The mechanism run (02 · Inside)

The densest stretch. Treat `language-in` → `vision-in` → `attention` as *how
things get in*, and `action-tokens` → `detokenizer` → `action-chunking` as *how
things get back out*. `architecture` is the payoff, the slide where the parts
become one machine. Don't rush it.

If the room looks lost during tokenization, the rescue line is:
*"discrete to reuse the language model's machinery; continuous to be fast and
precise."* Then move on.

### Scenes, practically

- Each click plays a short animation and stops. Nothing moves between clicks.
- **←** rewinds the scene to the previous step, so you can re-show a moment.
- Arriving at a scene from the next slide shows its finished state.
- The overview (**O**) and the PDF show every step's finished frame.

---

## The live demo

The two recorded clips come first: `demo-video` ("agarra la caja de Complejo
B") and `demo-zinc` ("agarra el frasco de zinc"), same weights, only the
sentence changes. Then switch to the terminal and the rerun window and do it
live. The stage directions are in `demo-zinc`'s notes.

```bash
lerobot-rollout \
  --strategy.type=base \
  --inference.type=rtc \
  --policy.path=$HF_USER/smolvla-medicamentos \
  --robot.type=so100_follower \
  --robot.port=/dev/tty.usbmodem58FA0929601 \
  --task="agarra el frasco de zinc" \
  --device=mps
```

`--device` on rollout, `--policy.device` on train: don't mix them up live. The
second brain's `tools/demo.sh "<instruction>"` wraps this for the MacBook.


---

## If the demo fails

You planned for this. The demo is mid-talk precisely so a failure isn't the last
thing the room remembers.

1. Try **once** more. Not three times.
2. Press **B**. You're back on the recorded demos they already saw work;
   replay them and narrate over it.
3. Say the line: *"this happens, and it's exactly what the limitations slide is
   about."* Then move on.
4. Do not apologise more than once. The room is on your side.

A failed live demo that you handle calmly is more credible than a demo that
works. It proves the limitations slide is honest.

---

## Questions you should expect

**"How much did the arm cost?"**
The official SO-100 bill of materials is USD 232 for leader + follower
(USD 123 for the follower alone), not counting the printed parts. The twelve
STS3215 servos are most of it.

**"Can it do X?"**
Be honest about the generalization gap (that's slide `limitations`). It handles
objects near what it saw. It does not handle a new task.

**"How long did training take?"**
SmolVLA fine-tune, ~20k steps: a few hours on the 5060 Ti. The dataset recording
was the slow part.

**"Is the attention the same as in an LLM?"**
Yes for the operator: same scaled dot-product, same RoPE, same GQA. The
difference is the *mask*: images and text form one bidirectionally-attending
prefix block rather than a causal triangle, and the action tokens are their own
block (causal in SmolVLA, bidirectional in π₀). Slide `attention` covers it.

**"Why not just use an LLM with a robot API?"**
Good question. You can, and for structured tasks you *should*: let the LLM plan
and hand the arm something narrow, like coordinates. The VLA earns its place
where the motion itself has to generalize, not just the plan.

**"What about safety?"**
Not solved. Current VLAs have no notion of consequence (that's the
`world-models` slide). On real deployments this is handled outside the policy,
with force limits and workspace constraints.

**"Does it work in Spanish?"**
Depends on the backbone's language coverage. The instruction is encoded by the
VLM, so multilingual backbones handle it. Worth testing before claiming it.

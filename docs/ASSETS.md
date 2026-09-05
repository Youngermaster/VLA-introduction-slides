# Assets — what to supply, and where

Every image and video in the deck is currently a **placeholder**: a dashed box
with a label. They are deliberately loud, so none of them can survive to the
talk by accident.

Drop files in `public/`, then update the path in `slides.md`.

---

## Required

### 1. SO-101 build photo — slide `my-build`

- **Path:** `public/images/so101-build.jpg`
- **What:** the assembled arm, ideally with all three cameras visible in frame.
  Leader and follower together is even better.
- **Aspect:** roughly 4:3 or 3:2, landscape. It sits in a ~400×300 slot.
- **Why it matters:** this is the credibility slide. A real photo of *your* arm
  with visible 3D-print layer lines does more than a clean render would.

Replace in `slides.md`:

```html
<div class="ph ph--tall">…</div>
<!-- with -->
<img src="/images/so101-build.jpg" alt="SO-101 armado con las tres cámaras" class="fig" />
```

### 2. Arm on the demo table — slide `accessibility`

- **Path:** `public/images/rig-table.jpg`
- **What:** the arm on the table with the actual demo props (Complejo B pack,
  magnesium bottle) in shot.
- **Aspect:** landscape.

### 3. ACT comparison video — slide `demo-act-video`

- **Path:** `public/video/act-baseline.mp4`
- **Length:** 20–30 s, silent, loopable.
- **What:** the ACT policy doing the task. Ideally it visibly ignores a spoken
  instruction, since that is the point being made.

```html
<SlidevVideo autoplay="once" controls poster="/images/act-poster.jpg">
  <source src="/video/act-baseline.mp4" type="video/mp4" />
</SlidevVideo>
```

### 4. Backup demo video — slide `backup-demo` ← **the important one**

- **Path:** `public/video/backup-demo.mp4`
- **Length:** 60–90 s.
- **What:** the full VLA demo working — **both instructions**, with the sentence
  change clearly visible on screen. Add a caption or overlay showing the exact
  instruction text at the moment it changes.
- **Record this even if the live demo is working.** It is the whole reason
  panic mode exists.

```html
<SlidevVideo controls autoreset="slide" poster="/images/backup-poster.jpg">
  <source src="/video/backup-demo.mp4" type="video/mp4" />
</SlidevVideo>
```

---

## Details to fill in

Search `slides.md` and `locales/*.yml` for these:

| What | Where | Currently |
|---|---|---|
| Hugging Face model repo | `demo-vla` code block | `$HF_USER/smolvla-medicamentos` |
| Serial port | `demo-vla` code block | `/dev/tty.usbmodem58FA0929601` |
| Measured inference rate on the M3 | consider adding to `accessibility` | not stated |

On that last one: **there is no published SmolVLA benchmark for Apple Silicon.**
Measure it yourself the night before and caption it *"measured on M3 16GB,
PyTorch MPS"*. Don't cite a number you can't source — the rest of the deck is
careful about this and one loose figure undermines all of it.

---

## Encoding

Keep files small; they are bundled into the build.

```bash
ffmpeg -i raw.mov -vf "scale=1280:-2" -c:v libx264 -crf 24 -preset slow \
       -an -movflags +faststart public/video/backup-demo.mp4
```

`-an` drops audio — you will be talking over it.

Poster frames:

```bash
ffmpeg -i public/video/backup-demo.mp4 -ss 2 -vframes 1 public/images/backup-poster.jpg
```

---

## Image style

To sit well against the `#0A0B0D` ground:

- Shoot against a **dark or neutral** background if you can.
- Avoid flash. Soft, directional light shows the printed texture better.
- Slightly underexpose. A bright white photo on a dark deck is a flashbang in a
  dark room.
- Add `class="fig"` so the image picks up the deck's radius and border.

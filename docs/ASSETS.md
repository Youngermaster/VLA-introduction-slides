# Assets: what to supply, and where

Photos and videos live in `public/`. The slots in the deck **find them by
path**: drop the file with the right name and it appears. Until then the slot
shows a dashed placeholder with the exact path it expects, so a missing asset
is obvious in rehearsal and never a black rectangle on stage.

You don't need to edit `slides.md` for any of these.

---

## The three files

| File | Slide | What |
|---|---|---|
| `public/images/so100-build.jpg` | `my-build` | Your assembled SO-100, leader and follower, all three cameras in frame. Landscape, ~4:3. |
| `public/video/demo-real.mp4` | `demo-video` | **Your best take of the real demo**, at home, good light: "agarra el Complejo B", then the sentence changes, then "agarra el frasco de zinc". 45–75 s. This is the one you show off before going live. |
| `public/video/backup-demo.mp4` | `backup-demo` (key **B**) | The full VLA demo working, both instructions, with the exact instruction text visible when it changes. 60–90 s. **Record it even if the live demo works**: it is why panic mode exists. It can be the same footage as `demo-real.mp4`. |

Videos autoplay muted when you enter the slide and pause when you leave. They
have controls, so you can scrub while you talk.

---

## Details to fill in

| What | Where | Currently |
|---|---|---|
| Hugging Face model repo | live-demo command in `docs/PRESENTING.md` | `$HF_USER/smolvla-medicamentos` |
| Serial port | live-demo command in `docs/PRESENTING.md` | `/dev/tty.usbmodem58FA0929601` |
| Inference rate on the M3 | say it out loud during the demo | not on any slide |

On the last one: **there is no published SmolVLA benchmark for Apple Silicon.**
Measure it yourself the night before and say "measured on my M3, PyTorch MPS".
Don't cite a number you can't source.

---

## Encoding

Keep files small; they are bundled into the build.

```bash
ffmpeg -i raw.mov -vf "scale=1280:-2" -c:v libx264 -crf 24 -preset slow \
       -an -movflags +faststart public/video/demo-real.mp4
```

`-an` drops audio, since you will be talking over it.

---

## Image style

To sit well against the `#0A0B0D` ground:

- Shoot against a **dark or neutral** background if you can.
- Avoid flash. Soft, directional light shows the printed texture better.
- Slightly underexpose. A bright white photo on a dark deck is a flashbang in
  a dark room.

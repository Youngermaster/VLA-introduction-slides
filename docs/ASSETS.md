# Assets: what's in the deck, and where

Photos and videos live in `public/`. The slots in the deck **find them by
path**: replace the file with the same name and the slide picks it up. A missing
file shows a dashed placeholder with the exact path it expects, so it's obvious
in rehearsal and never a black rectangle on stage.

You don't need to edit `slides.md` for any of these.

---

## The three files

| File | Slide | What | Source |
|---|---|---|---|
| `public/images/so100-build.jpg` | `my-build` | The SO-100 pair on the desk, top camera on its mast. Portrait, 1200×1600. | `IMG_4818.jpeg`, rotation baked in |
| `public/video/demo-complejo-b.mp4` | `demo-video` (key **B**) | "agarra la caja de Complejo B". 720×1280, 27 s. | `IMG_5425.MOV` |
| `public/video/demo-zinc.mp4` | `demo-zinc` | "agarra el frasco de zinc": same weights, only the sentence changes. 720×1280, 25 s. | `IMG_5424.MOV` |

Videos autoplay muted when you enter the slide and pause when you leave. They
have controls, so you can scrub while you talk.

To replace a clip, re-encode it with the same settings (vertical phone clips
work as they are):

```bash
ffmpeg -i IMG_xxxx.MOV -vf "scale=720:-2,fps=30" -c:v libx264 -crf 24 -preset slow \
       -pix_fmt yuv420p -an -movflags +faststart public/video/demo-zinc.mp4
```

`-an` drops audio, since you will be talking over it. For photos, bake the
phone's rotation in (`ffmpeg -i IMG.jpeg -vf "scale=-2:1600" -q:v 3 out.jpg`):
the PDF exporter and some browsers ignore EXIF orientation.

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

## Image style

To sit well against the `#0A0B0D` ground:

- Shoot against a **dark or neutral** background if you can.
- Avoid flash. Soft, directional light shows the printed texture better.
- Slightly underexpose. A bright white photo on a dark deck is a flashbang in
  a dark room.

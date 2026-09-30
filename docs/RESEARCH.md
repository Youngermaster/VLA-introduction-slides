# Research notes (verified 2026-09-27)

Every number on a slide comes from this file. Each fact was checked against a
primary source (arXiv abstract or HTML, official blog, model card, official
repo). Where only a secondary source exists, it says so.

## VLA basics

**RT-2** (Brohan et al., Jul 2023, arXiv:2307.15818)
- Title claim: "VLA Models Transfer Web Knowledge to Robotic Control". Coins "vision-language-action".
- Actions as text tokens; each continuous dimension discretised into 256 uniform bins. PaLM-E variant overwrites the 256 least-used tokens.
- 5B and 55B (PaLI-X), 12B (PaLM-E). 6k evaluation trials. Emergent reasoning (a rock as an improvised hammer).

**OpenVLA** (Kim et al., Jun 2024, arXiv:2406.09246)
- 7B, Llama 2 + fused DINOv2 + SigLIP. 970k real demos from Open X-Embodiment.
- Beats RT-2-X (55B) by 16.5% absolute success across 29 tasks, with 7× fewer parameters.
- ~6 Hz on one RTX 4090; 15 GB VRAM bf16, 7 GB at 4-bit. LoRA fine-tune 10–15 h on one A100. Pretraining 64 A100 × 14 days.
- Model card: does not zero-shot generalise to unseen embodiments.

**Open X-Embodiment** (Oct 2023, arXiv:2310.08864)
- 22 robots, 21 institutions, 527 skills, 160,266 tasks, 1M+ trajectories from 60 datasets / 34 labs.

**π0** (Black et al., Oct 2024, arXiv:2410.24164)
- PaliGemma + a 300M action expert, flow matching, 3.3B total. Up to 50 Hz, chunks of H = 50. 10,000+ h of robot data, 7 robot configurations.

**FAST** (Pertsch et al., Jan 2025, arXiv:2501.09747)
- DCT-based action tokenizer. Compression vs naive binning from 1.75× (Bridge, 5 Hz) to 13.2× (T-shirt folding, 50 Hz: 700 → 53 tokens). π0-FAST matches π0 with up to 5× less training compute.

**π0.5** (Physical Intelligence, Apr 2025, arXiv:2504.16054)
- Predicts a high-level subtask, then the action, inside one model. ~400 h of mobile-manipulator data in ~100 homes; tested in 3 unseen homes.

**SmolVLA** (Shukor et al., Jun 2025, arXiv:2506.01844)
- 450M, SmolVLM2 backbone, keeps the first 16 of 32 LLM layers, 64 visual tokens per frame, ~100M flow-matching action expert.
- Pretrained on 481 community datasets, 22.9K episodes, 10.6M frames (the blog says 487; quote the paper).
- Async inference: 13.75 s → 9.70 s per task; 9 → 19 cycles in 60 s.
- SO-100 multi-task: SmolVLA 78.3% vs π0 (3.5B) 61.7%. SO-101 pick-place: SmolVLA 90% / 50% vs ACT 70% / 40% (in / out of distribution).
- LeRobot docs: ~50 episodes (e.g. 5 positions × 10); 25 was not enough. 20k steps ≈ 4 h on one A100.

**ACT / ALOHA** (Zhao et al., Apr 2023, arXiv:2304.13705)
- Action chunking (k = 100 at 50 Hz), CVAE, temporal ensembling. 50 demos per task (10–20 min of data), 80–90% success. LeRobot docs: ~80M params, ResNet-18.

**LeRobot** (github.com/huggingface/lerobot)
- Policies: ACT, Diffusion, VQ-BeT; VLAs: π0, π0-FAST, π0.5, GR00T N1.7, SmolVLA, X-VLA, EO-1, MolmoAct2, WALL-OSS, EVO1; world models: VLA-JEPA, LingBot-VA, FastWAM, LaWAM.
- LeRobotDataset v3.0: many episodes per Parquet/MP4 file, Hub streaming.
- **The arm on stage is an SO-100.** SO-100 bill of materials (github.com/TheRobotStudio/SO-ARM100, `SO100.md`, now marked deprecated in favour of SO-101): $232 for leader + follower, $123 follower only, excluding printed parts. 6 × STS3215 servos per arm. For reference, the SO-101 BOM is $229.88 / $121.94.

**Real-Time Chunking** (Black, Galliker, Levine, Jun 2025, arXiv:2506.07339)
- Computes the next action chunk while executing the current one and inpaints the overlap. In LeRobot: `lerobot-rollout --inference.type=rtc`.

**Recent (dated)**
- Gemini Robotics On-Device (Jun 2025): adapts with 50–100 demos.
- Gemini Robotics 1.5 + ER 1.5 (Sep 2025, arXiv:2510.03342): the VLA "thinks before acting"; ER 1.5 is the high-level brain and calls tools.
- GR00T N1.6 (Sep 2025): Cosmos Reason as the thinking brain.
- X-VLA (Oct 2025, arXiv:2510.10274), EO-1 (Aug 2025, arXiv:2508.21112).
- π*0.6 / RECAP (Nov 2025, arXiv:2511.14759): learns from its own experience, >2× throughput on the hardest tasks.
- Figure Helix 02 (Jan 2026): S0 at 1 kHz, S1 at 200 Hz, S2 slow.
- π0.7 (Apr 2026, arXiv:2604.15483): ~5B (Gemma3 4B + 860M expert); zero-shot shirt folding on a new robot at 80% success vs expert teleoperators 80.6%.
- GR00T N1.7 (Apr 2026): 3B, Cosmos-Reason2-2B as System 2, DiT as System 1, 20,854 h of egocentric human video.
- MolmoAct2 (AI2, May 2026, arXiv:2605.02881): fully open incl. data.
- Gemini Robotics 2 / ER 2 (Jul 2026): ER 2 lets developers declare VLAs as tools.

## World models + VLAs

| Work | What | World model used for | Source |
|---|---|---|---|
| UniSim | learned interactive simulator | training environment | arXiv:2310.06114 |
| DreamGen / GR00T Dreams | video WM generates robot videos; 1 teleop task → 22 new behaviours | data generation | arXiv:2505.12705 |
| V-JEPA 2-AC (Meta) | 1M+ h video pretraining, <62 h robot data; zero-shot pick-and-place 65–80% via MPC | planning at inference | arXiv:2506.09985 |
| WorldVLA, DreamVLA | predict future images / world knowledge alongside actions | training signal | arXiv:2506.21539, 2507.04447 |
| Veo World Simulator | predicts policy success; validated on 1,600+ real trials | evaluation | arXiv:2512.10675 |
| Cosmos Policy | Cosmos-Predict2 outputs actions, future frames, values | policy + planning | arXiv:2601.16163 |
| VLA-JEPA (in LeRobot) | Qwen3-VL + flow head + V-JEPA2 predictor; WM "training only" | training signal | arXiv:2602.10098 |
| Fast-WAM | video co-training matters more than test-time imagination | training only | arXiv:2603.16666 |

Four ways they combine: **data generator**, **training signal**, **planner**
(imagination at inference, costs latency), **evaluator**. 2026 evidence
(Fast-WAM) says most of the benefit comes from the training signal.

## Generalist planners vs VLAs vs specialists

- Planner / embodied reasoner (slow, reasons, calls tools): Gemini Robotics-ER, Cosmos-Reason, Helix S2 (7B VLM at 7–9 Hz).
- VLA motor policy (fast, language-conditioned): π0 up to 50 Hz; Helix S1 at 200 Hz; OpenVLA ~6 Hz.
- Specialist (ACT, Diffusion Policy): one task, ~50 demos, hours on one GPU.
- When to use: fixed task & budget → ACT; language-conditioned multi-object → SmolVLA / π0 fine-tune (openpi: >8 GB inference, >22.5 GB LoRA, >70 GB full); long-horizon → planner calling a VLA as a tool.

## Limits

- LIBERO saturated: OpenVLA-OFT 97.1% (arXiv:2502.19645); Reuss: papers "all achieve between 95-98%".
- RoboArena (arXiv:2506.18123): double-blind pairwise real-robot evaluation, 7 institutions.
- DROID (arXiv:2403.12945): 76k trajectories, 350 h, 564 scenes, 50 collectors, 12 months.
- Scaling laws (Lin et al., arXiv:2410.18647): diversity of environments and objects matters far more than demos per scene.

## Growth

- ICLR "Vision-Language-Action" submissions (Reuss, mbreuss.github.io/blog_post_iclr_26_vla.html): 2024: 1 (rejected), 2025: 9, 2026: 164. Keyword matches, not a census.
- lerobot/smolvla_base: 71,104 downloads last month (fetched 2026-09-27).

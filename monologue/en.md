# From Tokens to Torque — monologue (English)

Full spoken script. Each `##` is a slide's `routeAlias`, so reordering
`slides.md` never desynchronises the script.

`<!-- target: Ns -->` declares how long a section should take. `/practice`
compares that target against a word-count estimate.

Budget: ~50 min total = ~35 min speaking + ~8 min demo + Q&A.

---

## title
<!-- target: 45 -->

Good evening. My name is Juan Manuel.

A few months ago I printed a robot arm at home, assembled it, and taught it to
understand spoken instructions. Tonight I want to show you how that works
underneath — and in a little while we'll do it live, right here, with this arm.

It's called **From Tokens to Torque**, because that's what this is about: how a
sentence you type ends up as a motor that turns.

## hook-provocation
<!-- target: 75 -->

I want to start with a question that's been bothering me.

In three years we went from AI writing strange sentences to half the world using
it every day for real work. That was fast.

Robotics has been promising the same thing for far longer. And it still hasn't
arrived. We keep seeing impressive lab videos, and we still don't have a robot
that does anything useful in a house.

The easy answer is that moving things is harder than writing text. That's true,
but it isn't *the* reason. The real reason is about data.

## data-asymmetry
<!-- target: 120 -->

Look at this, because this is the slide the whole talk rests on.

On the left, text. GPT and every language model were trained on the internet:
text that was already written, that someone else had already produced, that you
can download in parallel, essentially for free. Fifteen trillion tokens.

On the right, robot data. Every one of those bars is thirty seconds of a person
physically moving an arm, in real time. It can't be parallelised. It can't be
scraped. It doesn't exist yet.

And the number underneath: **one million** episodes in Open X-Embodiment, the
largest open dataset there is. Thirty-four labs pooled their work to build it.

That's the asymmetry. The text was already written. Every robot episode has to
be lived through in real time.

Everything that follows — all the engineering, all the tricks — is people trying
to route around that one problem.

## act2-open
<!-- target: 15 -->

To understand what a VLA is and why it matters, we need a quick look at where it
came from.

## timeline
<!-- target: 90 -->

Three eras, five years.

Until roughly 2020, robotics meant programmed control. Inverse kinematics,
hand-written trajectories. Works perfectly — until the object moves one
centimetre and the whole thing collapses.

In 2023 imitation learning arrives. Instead of programming the trajectory, you
show the robot how it's done and it learns to copy you. That's ACT and Diffusion
Policy. And that's where I came in.

Almost at the same time the first VLAs appear. RT-2 is the key moment: someone
connects a language model to a robot and finds out it works.

And in 2025 and 2026 this comes down to ordinary hardware. Models of four hundred
and fifty million parameters that run on a laptop. In a moment I'll show you how
much this field grew — the number will surprise you.

## act-reflex
<!-- target: 90 -->

Let's start with ACT, because that's what I had working.

ACT is simple to describe. Camera images go in, plus the joint state — where
every motor is right now. A block of future actions comes out. That's it. A
direct mapping from observation to motion.

It works surprisingly well. With fifty demonstrations it learns a task with a
fluency that's genuinely satisfying to watch.

But notice what is **not** in this diagram. There is no text input. None. Even if
I speak to the robot, there is no wire for that sentence to enter through.

ACT is a reflex. An excellent one, and completely deaf.

## my-build
<!-- target: 90 -->

Let me tell you why I know this.

I printed a full SO-101, leader and follower, on an Ender 3. And here's the
detail that taught me the most: my first holes came out half a millimetre too
small, and I stripped the screws. I had to learn to compensate print tolerances
in X and Y before I could assemble anything.

Six Feetech servos on a shared serial bus. Three USB cameras: overhead, wrist,
and base. And ACT policies trained with LeRobot on an RTX 5060 Ti.

I'm not telling you this as biography. I'm telling you because everything that
follows, I know exactly where it breaks.

## act-limitation
<!-- target: 60 -->

Because it does break.

My policy picked up a red cube perfectly. Flawless.

I put a blue cube next to it, and it still went for the red one. I moved the red
one ten centimetres, and it failed. I spoke to it, and of course, nothing
happened.

One policy, one task. Every new task means recording again and training again.

And that's where you start asking the question that opens everything else: what
if, instead of recording a thousand tasks, the model already knew what a bottle
is?

## act3-open
<!-- target: 12 -->

This is the technical part of the talk. Give me about ten minutes — it's where
the good stuff is.

## vla-architecture
<!-- target: 150 -->

A VLA has three components. Let's build it up.

First, the cameras. Same as ACT: several views of the world.

Second, a vision encoder that turns those pixels into tokens. SigLIP, DINOv2 —
the same ones used in ordinary computer vision.

Third, and this is the new part: **the instruction**. The sentence comes in
tokenized, exactly as it would in any language model.

And now the piece that changes everything: a **pretrained VLM**. PaliGemma,
SmolVLM2, Qwen-VL. This model has already seen the internet. It already knows
what a bottle is, what "red" means, that glass things are handled carefully.
Nobody taught it that with a robot. It learned it by reading.

And at the end, a small head — the action expert — that turns all of that into
motion: a block of fifty future actions, roughly one second.

If you take one image away from this whole talk, make it this one.

## data-pipeline
<!-- target: 90 -->

So where does the training data come from? The same place as with ACT.

One: teleoperation. I move the leader arm by hand, the follower copies. Thirty
seconds per episode, in real time. There's no shortcut.

Two: each episode is stored as three synchronised videos, plus the state of the
six joints at thirty hertz, plus the instruction as text.

Three: about fifty episodes per task. And this matters — fifty spread across
**variations**. Changing the object's position, the lighting, adding
distractors. Fifty repetitions of exactly the same thing are worth nothing. That
point comes back later.

Four: you train. The policy learns to predict which action the human took given
those same observations.

## action-tokenization
<!-- target: 150 -->

Now, the most beautiful technical problem in all of this.

Motion is a continuous signal: real numbers, at fifty hertz. A transformer
predicts discrete symbols from a vocabulary. That bridge has to be crossed
somehow.

The obvious way is to chop it into bins. Two hundred and fifty-six bins per
dimension. RT-2 did exactly that — and in fact it overwrote the two hundred and
fifty-six least-used tokens in the language model's vocabulary to store actions
there. It works. But look at the staircase: that precision, once lost, is lost
forever. And it costs three hundred and fifty tokens per chunk.

Then FAST comes along, and the idea is lovely: what if instead of treating it as
loose numbers, we treat it as a **signal**?

It's literally JPEG. You apply a cosine transform, and you find that almost all
the energy in a robot trajectory sits in the low frequencies — because robots
move smoothly. You throw away the high frequencies, compress the repeated
patterns with the same algorithm text tokenizers use, and you go from three
hundred and fifty tokens to forty.

And the third option is to skip tokens entirely: a continuous action expert that
generates the whole block by flow matching. That's what π-zero, SmolVLA and
GR00T do today.

The summary, if you get lost: discrete to reuse the language model's machinery;
continuous to be fast and precise.

## action-chunking
<!-- target: 120 -->

The second key idea: action chunking.

Start with what happens without it. You predict one action, execute it, predict
again. The arm **stalls** at every inference — those bands are the model
thinking. And because each prediction ignores the last, the motion jitters.

With chunking, a single inference returns fifty future actions. Between
decisions the motion is continuous. ACT uses ninety to a hundred steps at fifty
hertz — about two seconds of future.

But there's a problem almost nobody mentions. While one chunk executes, the next
is already being computed. And when it arrives, it disagrees with where the arm
actually is. Those red circles are that disagreement.

The fix is called Real-Time Chunking: you inpaint the overlap so the two chunks
agree. And the detail I love: that's a paper from June 2025, and today it's a
command-line flag in LeRobot.

## pretrain-finetune
<!-- target: 90 -->

So why does this work with so little of your own data?

Because you don't train a VLA. You fine-tune one that already exists.

SmolVLA was pretrained on four hundred and eighty-one community datasets:
twenty-two thousand episodes, ten and a half million frames. Months of GPU time
you didn't pay for.

And you contribute fifty episodes of your task. On your table. In your lighting.
A few hours of GPU.

Without phase one, fifty episodes are nowhere near enough. With phase one,
they're enough. That is literally all "foundation model" means in robotics.

## act-inside-vla
<!-- target: 75 -->

A question you're probably asking: where did ACT go in all of this?

It didn't go anywhere.

Look at the middle row. A VLA's action head does exactly what ACT does: it takes
a representation of the situation and emits a block of future actions. Same job.

What changed is what comes **before**. ACT builds its representation from
scratch, with a ResNet that only ever saw your fifty videos. A VLA builds it with
a model that saw the internet.

A VLA's action head *is* a chunking policy. What changed isn't the muscle — it's
what talks to the muscle.

## rt2-insight
<!-- target: 60 -->

Which brings us to the central insight, and it's from RT-2.

A model that has never seen a robot already knows what a bottle is. It knows what
"red" means. It knows fragile things are handled carefully. It learned that from
text and images.

RT-2 showed that this knowledge **transfers to physical control**. You don't have
to teach the robot what an object is. You only have to teach it how to move
toward one.

That's why a VLA generalizes where ACT doesn't. It isn't that it learns better.
It's that it starts out knowing vastly more.

## act4-open
<!-- target: 10 -->

Right. So what's actually available to use today?

## model-landscape
<!-- target: 120 -->

This is the landscape, and I checked every one of these numbers against the
primary sources, because there are a lot of loose figures circulating.

RT-2: closed, enormous, but it's the one that opened the door.

OpenVLA: the first genuinely open one. Seven billion parameters, Llama 2
underneath.

π-zero and π-zero-five, from Physical Intelligence. Note this: they're already on
π-zero-seven, but the latest one they released is zero-five.

GR00T N1.7, from NVIDIA. What's interesting here isn't the size, it's this:
almost nine hertz running on a Jetson mounted **on the robot itself**. No PC.

And SmolVLA. Four hundred and fifty million parameters. This is the one running
on my table, and the one the demo uses.

## accessibility
<!-- target: 90 -->

I want to pause here, because this is the real shift.

SmolVLA is four hundred and fifty million parameters. Three hundred and fifty of
language model — and it only uses half the layers. A hundred million of action
head. Sixty-four visual tokens per frame.

It was trained on **community** datasets, not frontier-lab data.

And this is the figure I find most striking in the whole talk: on real tasks with
an SO-100 arm, **it beats π-zero**, which has seven times the parameters.
Seventy-eight percent against sixty-one.

The arm costs about a hundred and fifty dollars. The model is open. You record
the dataset yourself in an afternoon.

That's what changed. This isn't only Google's anymore.

## when-to-use
<!-- target: 90 -->

Now the honest part, and I want it to land, because it's the one I most often
forget to tell myself.

If you have **one** fixed task, one fixed object, one fixed environment: use ACT
or Diffusion Policy. Full stop. It will be more precise, faster and cheaper than
any VLA.

A VLA pays for itself when you need something else: language changing the
behaviour, or the system tolerating objects it never saw.

And the big generalist models, right now, are for whoever has the fleet and the
budget. The best ones are closed.

So: I came here to talk about VLAs, and I'm telling you they're often not the
answer. That's part of understanding a technology too.

## act5-open
<!-- target: 20 -->

Alright. Time for the part that can go wrong.

And let me tell you something: I put the demo mid-talk on purpose. If it goes
well, we still have the best part ahead. And if it goes badly, I have twenty
minutes to recover. Never put a live demo at the end.

## demo-rig
<!-- target: 90 -->

Here's what's set up.

At home I have the tower with the 5060 Ti. That's where I fine-tuned SmolVLA on
my dataset, and I pushed the trained model to Hugging Face.

Here, on this Mac, nothing is trained. I only download the weights and run
inference on MPS, which is PyTorch's Metal backend. That separation is what makes
a robot demo portable.

Three USB cameras — and one piece of advice if you try this: camera indices
change every time you reconnect them. Verify them on site, not at home.

And the arm, the SO-101 follower.

Oh, and if none of this works: I have a key. The letter B takes me to a video
where everything goes perfectly. Now you know, so I can't cheat without you
noticing.

## demo-vla
<!-- target: 330 -->

Here we go.

First, what I'm going to ask for. Watch this closely, because it's the only thing
that changes between the two runs: **one sentence**.

Run one: "pick up the vitamin B pack."

*(run it, let it play in silence)*

Good. Now I put the objects back exactly as they were.

And now — and this is the only thing I'm going to touch — I change the sentence.
Same model. Same weights. Same robot. Same cameras. Only the sentence.

"Pick up the magnesium bottle."

*(run it)*

There. That is a VLA.

There is no `if` anywhere. I did not program a bottle detector. There is no
lookup table of objects. The instruction comes in through the same door as the
images, and the behaviour changes.

This entire talk is the explanation of how you get to that.

## demo-act-video
<!-- target: 60 -->

And for contrast, this is the same task with ACT.

Look: it does it well. Very well, in fact. Smoother than the VLA, even.

But it does it **the same way** no matter what I say. I can ask for the
magnesium, I can ask for the vitamin B, I can recite poetry at it. It will do
exactly the same thing, because it isn't listening to me.

That's the entire leap of this talk, in two videos.

## backup-demo
<!-- target: 30 -->

*(only if the live demo fails)*

Well, it happens. And honestly it's a perfect transition, because the next act is
called "the honest part" and it's about exactly this: these systems are still
fragile.

This is the same test, recorded yesterday. Watch the instruction change.

## act6-open
<!-- target: 12 -->

And now the part almost nobody puts in their talks.

## adoption
<!-- target: 75 -->

First, to give you a sense of how fast this is moving.

VLA papers submitted to ICLR, one of the big machine learning conferences.

In 2024: **one**. And it was rejected.

In 2025: nine.

In 2026: a hundred and sixty-four.

Eighteen times in one year. The projection for 2027 is over a thousand.

And a methodological note I want to make explicit: there are figures circulating
about industrial adoption — that VLAs now back forty percent of new deployments.
That number comes from a private market report with no published methodology. I
give it to you as a direction, not as a fact. I'd rather hand you a number you
can verify than one that sounds better.

## limitations
<!-- target: 105 -->

Now, what doesn't work.

First: the benchmarks are saturated. LIBERO, which everyone reports, sits between
ninety-five and ninety-nine percent. It no longer separates anything.

Second, and this is the important one: those benchmarks **hide** the real gap.
There's an evaluation called RoboArena that compares policies on physical robots,
blind, across different labs. And there the picture is completely different:
almost no open model comes close to Physical Intelligence's.

Third: latency. The model takes longer to think a chunk than the robot takes to
execute it. That's why RTC exists.

And fourth: fragile generalization. Change the light, change the table, move a
camera — and performance collapses.

If someone shows you ninety-eight percent on LIBERO, they've told you almost
nothing about what will happen on a real table.

## data-economics
<!-- target: 90 -->

And we come back to where we started: data.

This is DROID. Seventy-six thousand trajectories. Three hundred and fifty hours.
Five hundred and sixty-four scenes. Fifty people collecting. Thirteen
institutions. Twelve months.

And that is **one** dataset.

That's why I said the unit isn't dollars per hour. The unit is
**institution-years**.

But there's a result that changes how you should spend that budget, and it's
counterintuitive. Generalization scales with the **diversity** of scenes and
objects, following a power law. Additional demonstrations *in the same scene*
saturate very quickly.

So: you're not paying for volume. You're paying for variety. And that's where
almost everyone spends badly.

That's why I laboured the point about variations twenty minutes ago.

## act7-open
<!-- target: 12 -->

I want to tell you about a project I designed, because the lesson it taught me
isn't about models — it's about architecture.

## chess-layers
<!-- target: 120 -->

A robot that plays chess.

At the top, Stockfish. It evaluates millions of positions and picks the best
move. It doesn't know an arm exists. It doesn't know a physical world exists.

Below it, the orchestrator. And here's the lovely part: **one** chess move can be
**two or three** physical operations. A capture is two: first you remove the
captured piece from the board, then you move yours. Castling is two: king and
rook. A promotion is three: lift the pawn, take it off the board, place the queen.

Then vision: it finds the board, and translates "e5" into coordinates in
millimetres.

And here, on this line, **chess dies**.

Because the only thing that crosses downward is three numbers. ACT receives
coordinates and grasps. It doesn't know what a knight is. It doesn't know what a
capture is. It doesn't know a game is happening.

## chess-lesson
<!-- target: 90 -->

And that's the lesson.

When I started designing it, I wanted to push chess down into the policy. I
wanted a model that "understood chess and moved pieces". That's the default
mistake, and it's enormously expensive: you'd need robot data for every possible
chess situation.

The right answer is the opposite. Put the reasoning where the reasoning is — a
chess engine, which is already superhuman and needs no training. Put the muscle
where the muscle is — a policy that only knows how to grasp and place. And let
them meet at the narrowest possible point: here, a pair of coordinates.

The muscle never learns the difference between a capture and a castle. And it
shouldn't have to.

I've designed this, not built it. I'm telling you anyway, because the mistake I
nearly made is more useful than the finished project.

## act8-open
<!-- target: 10 -->

And to close, where this is heading.

## world-models
<!-- target: 120 -->

Everything we saw today is **reactive**. The robot sees, acts, sees again, acts
again. At no point does it have any notion of what is going to happen. It only
responds to what's in front of it.

The next step is **world models**. The idea is that before moving, the model
simulates several possible futures — what happens if I grasp here, what happens
if I grasp there — and picks one.

Put differently: it can be wrong in its head instead of being wrong on the table.

And this is no longer science fiction. There's a model called VLA-JEPA already in
LeRobot: a Qwen3-VL backbone, a video world model called V-JEPA2, and a
flow-matching action head.

But look at the detail, because it tells you exactly where the frontier is: in
VLA-JEPA, the world model is used **only during training**. At inference it's
discarded.

So: today, world models help us **learn** better. Not yet **plan**. That jump is
what's coming.

## generalist-models
<!-- target: 90 -->

And a question you probably have: how is this different from the generalist
models everyone talks about?

The fashionable models are generalists of text and images. A VLA is a generalist
of **action**. And the difference isn't size, it's kind.

A language model gets it wrong and you rewrite the prompt. A VLA gets it wrong and
knocks a bottle onto the floor.

A language model is evaluated with reproducible benchmarks. A VLA is only really
evaluated on a physical table — and every table in the world is different.

A language model learns from data that already existed. A VLA needs data someone
has to generate by moving a robot.

The bottleneck for language models was compute. For VLAs it's the physical world.
And that doesn't scale by buying more GPUs.

## open-question
<!-- target: 60 -->

So I'll leave you with an open question, and it's genuinely open.

Is the bottleneck the **data**? It doesn't exist at web scale, and generating it
costs institution-years.

Is it the **architecture**? Nobody has yet demonstrated the recipe that clearly
wins. A hundred and sixty-four papers don't agree.

Or is it the **hardware**? Cheap, precise, reliable hands still don't exist.

My bet is data. But I genuinely don't know, and that's why this field is so much
fun right now.

## resources
<!-- target: 45 -->

Here's where to go next. These codes scan from the back of the room.

The first is the survey, if you want the full map of the field. The second is
LeRobot, which is where you start if you want to build something. The third is
SmolVLA. And the last is these slides, with every reference in them.

## thanks
<!-- target: 30 -->

Thank you.

If any of you work in robotics, manufacturing or logistics — or you just want to
build one of these arms and don't know where to start — come find me. I'll be
here all evening and I love talking about this.

Now: questions.

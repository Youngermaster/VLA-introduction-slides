# From Tokens to Torque: monologue (English)

Full spoken script. Each `##` is a slide's `routeAlias`, so reordering
`slides.md` never desynchronises the script.

The `<!-- target: Ns -->` comment is how long the section should take. The
`/practice` route compares that target with a word-count estimate.

Budget: 30-40 min. The script is ~16 min of speech; with each click's
animation, the pauses and ~5 min of demo, the talk lands at ~30-35 min. The
`target` values include animation time, so the word-count estimate sitting
below them is expected. Then Q&A.

---

## title
<!-- target: 45 -->

Good evening. My name is Juan Manuel.

A few months ago I 3D-printed a robot arm at home, assembled it, and taught it
to understand Spanish. Tonight I want to show you how that works on the
inside, and in a little while we'll do it live, here, with this arm.

The talk is called **From Tokens to Torque**, because that's what it is about:
how a sentence you type ends up as a motor that turns.

## hook
<!-- target: 60 -->

I want to start with a question. Why did ChatGPT explode, and robots didn't?

In three years we went from an AI that wrote strange sentences to one that
half the world uses every day. Robotics has been promising the same thing for
much longer, and it still hasn't arrived.

The easy answer is that moving things is harder than writing. That's true,
but it isn't the reason. Or not the whole reason.

The deeper reason is that the data is a different kind of thing.

## data-asymmetry
<!-- target: 90 -->

Look at this. A model like Llama 3 was trained on about fifteen trillion
tokens. And almost all of that text already existed: someone else wrote it,
published it, and we just downloaded it.

Now, robot data. Each of these bars is one episode: a person physically moving
an arm for thirty seconds, in real time. You can't speed it up, you can't
parallelise it, you can't scrape it from the web. The biggest open dataset the
community has pooled, Open X-Embodiment, has around a million episodes, from
34 labs.

The text was already written. Every robot episode has to be lived in real
time.

Hold on to that, because everything tonight is, one way or another, a way of
getting more out of very little data.

## ch-vla
<!-- target: 10 -->

So what exactly is a VLA?

## vla-acronym
<!-- target: 75 -->

VLA is three letters.

**Vision.** The model sees the world through cameras. Each image is cut into
small patches, and each patch becomes a token, just like a word.

**Language.** It understands what you ask. The instruction goes through the
same tokenizer a language model uses. Nothing special.

**Action.** And this is the new part. The output isn't text. It's motor
commands: how much to move each joint, and whether to open or close the
gripper.

Now let's watch all three happen at once.

## vla-hero
<!-- target: 150 -->

This is the demo table: a vitamin B pack, a mug, the magnesium bottle and a
tray.

First, **see**. The camera captures the scene and the image is split into
patches. The model recognises what's on the table.

Second, **read**. I type: "put the magnesium in the tray". The sentence is split
into tokens, exactly like in ChatGPT. Notice "magnesium" is split into two
pieces, and nothing bad happens.

Third, **ground**. The words "magnesium" and "tray" pull the model's attention
onto those two objects, and everything else fades.

An honest note: the boxes and the mask are for us to see. A VLA doesn't draw
boxes. This grounding happens implicitly inside its attention, and I'll show
you how in a minute.

Fourth, **act**. The only thing that comes out of the model is these seven
numbers: three for position, three for rotation and one for the gripper.
Thirty times a second.

(Let the pick run in silence.)

One model. No if statements. Nobody wrote "if it says magnesium, go left".

## what-is-a-policy
<!-- target: 60 -->

I'm going to use one word a lot, so let me define it: **policy**.

A policy is a function. It takes **o**, the observation: what the cameras see
and where the joints are. It takes **ℓ**, the instruction. And it returns
**a**: not one action, a block of future actions.

ACT, the model I started with, doesn't have that ℓ term. A VLA does. The whole
talk fits in that difference.

And one detail people often get wrong: this is not reinforcement learning.
There's no reward, no trial and error. It's supervised learning, and the label
is what the human did.

## act-vs-vla
<!-- target: 90 -->

Here's how I learned that.

I trained an ACT policy to pick up a red cube. It worked perfectly. One day I
put a blue cube next to it and said "pick up the blue one". It picked up the
red one. Of course: there is no wire for the sentence to come in through. I
can talk to it all I want; it has no way to hear me.

Worse: I moved the red cube ten centimetres and it closed the gripper on thin
air. It had learned that task very well, in that position.

A VLA takes the sentence through the same door as the images. Say "the blue
one", it goes for the blue one. Say something else, it does something else.

ACT is a reflex: excellent, and deaf. A VLA is a reflex that listens.

## ch-inside
<!-- target: 10 -->

This is the technical part. Bear with me for about ten minutes.

## language-in
<!-- target: 70 -->

Let's start with how language gets in.

You don't pass the sentence on its own. You wrap it in a fixed template. In
OpenVLA it's literally: "In: What action should the robot take to... your
sentence? Out:".

That's clever, because the model isn't learning a new task. It keeps doing
what it always did: predicting the next token after "Out".

The sentence goes through the usual tokenizer, the same one a text model
uses. And each token becomes a vector, a list of numbers. From here on, to the
model, everything is numbers.

## vision-in
<!-- target: 60 -->

The image comes in in a very similar way.

It's cut into a grid of patches. SmolVLA, the model in the demo, uses 64
tokens per image. Each patch becomes a token, just like a word.

And here's the important part: the image tokens, the sentence tokens and one
more with the arm's state are glued into a single sequence. To the
transformer it's one row of numbers. It doesn't know which were pixels and
which were words.

## attention
<!-- target: 100 -->

And here comes the question that always shows up: is this the same attention
as ChatGPT?

Look at what happens with the word "magnesium". It looks at the whole image,
and gives more weight to the patches where the bottle is. That's how the model
"grounds" the object without drawing any box.

And yes: it's exactly the same operation. Softmax of Q times K transposed,
times V. Same maths, same libraries, the same transformer.

What changes is at the end. The action expert uses cross-attention: the
actions ask the questions, and the vision-language model answers.

And the mask: who can look at whom. Image and text see each other; actions
only look backwards. In practice, almost all of the difference from an LLM is
in the mask and the last layers.

## action-tokens
<!-- target: 110 -->

Now the most interesting part: how does a transformer, which predicts
symbols, turn into motion?

A motion is a continuous signal. This curve is one joint over one second.

You sample it thirty times a second.

And you cut the range into 256 bins. Each bin is a token. RT-2 and OpenVLA do
exactly this: they reuse the 256 least-used tokens in the vocabulary and give
them a new meaning. It works, but look at the staircase: that precision is
gone.

Today there are two better ways. **FAST** treats the trajectory as a signal, the
way JPEG treats an image: it moves to frequencies and compresses. On a
T-shirt-folding task, 700 tokens become 53.

And **flow matching** skips tokens entirely: it starts from noise and cleans it
up until it's a trajectory. That's what π0, SmolVLA and GR00T use.

## detokenizer
<!-- target: 60 -->

And the way back, which almost nobody explains.

The model outputs seven token IDs. Subtract the offset and you get the bin,
from 0 to 255. Map it to minus one to one.

Then de-normalise with the dataset's 1st and 99th percentiles. Not the min and
max, so that one bad demonstration doesn't stretch the whole scale.

Now they're millimetres and degrees, and that moves the servo. Six of them are
deltas, "move a little that way". The gripper is the exception: it's absolute.

## action-chunking
<!-- target: 80 -->

Another key trick: predict blocks, not steps.

If you predict one action per inference, the arm stops to think on every tick,
and since each prediction ignores the previous one, it shakes.

With chunking, one inference returns fifty future actions, and the motion is
continuous. ACT uses about a hundred; SmolVLA and π0, fifty.

And the fine detail from 2025: while it executes one block, it's already
computing the next, and it stitches them so you can't see the seam. It's
called real-time chunking, and in LeRobot today it's one command-line flag.

## architecture
<!-- target: 110 -->

Let's put it all together. This is the whole machine, SmolVLA style.

Three cameras, the sentence and the arm's state go into the vision-language
model.

And here's my favourite idea in the paper. SmolVLA only uses the first half of
the layers: 16 of 32. The last layers of a language model specialise in
producing language, and a robot doesn't need to talk. So they cut them.

The action expert starts from noise and cleans it in ten steps into fifty
actions. The arm moves, the camera sees the result, and the loop starts again.

For perspective: OpenVLA has 7 billion parameters, uses discrete tokens and
runs at about 6 Hz on a 4090. SmolVLA has 450 million and runs on a laptop.
It's the one you're about to see.

## ch-train
<!-- target: 10 -->

Now we know how it thinks. Next, how it learns.

## recording
<!-- target: 75 -->

It all starts with recording data. And the setup has two arms.

I move the **leader** arm by hand. The **follower** copies the motion, a tiny
bit late.

Thirty times a second a row is written: the images from the three cameras, the
arm's state, and the action.

And look at these two rows, because they are not the same. The state is where
the robot **is**, the follower. The action is where the human **sent** it, the
leader. Training a policy is learning to predict the second from the first.
That's all behaviour cloning is.

## training
<!-- target: 70 -->

Training is that, repeated millions of times.

The model looks at a sample and predicts a block of actions. You compare it
with what the human did, and the difference is the error.

Twenty thousand steps later, the prediction lands on top of what the human
did.

No reward, no trial and error: it copies. For SmolVLA with about fifty
episodes, that's around four hours on an A100.

## pretrain-finetune
<!-- target: 70 -->

So where does "fifty episodes is enough" come from?

From pre-training. SmolVLA was first trained on 481 community datasets: over
ten million frames. Months of GPU time you didn't pay for.

You bring your part: fifty episodes, for example five positions with ten
repetitions each. A few hours.

Without the first phase, fifty episodes are nowhere near enough. With it, they
are. That is all "foundation model" means in robotics.

## ch-demo
<!-- target: 20 -->

And now, the part that can go wrong.

I put the demo in the middle of the talk on purpose. If it fails, I still have
half a talk to recover.

## my-build
<!-- target: 60 -->

First, the arm. It's an SO-101, an open design, and I printed it on an Ender 3.

Six servos per arm, all on one serial bus, and three USB cameras: overhead, on
the wrist and at the base.

The story that sums it up: my first holes came out half a millimetre too small
and I stripped the screws. I had to calibrate the printer's compensation
before I could build anything.

The pair, leader and follower, is about 230 dollars in parts.

## demo-video
<!-- target: 60 -->

This is on my table, at home, with the model I trained. Same arm, same
objects.

(Let the video play.)

Now we're going to do it here, live, under this room's lights.

## demo-live
<!-- target: 240 -->

Same robot. Same model. Same weights. The only thing that will change is the
sentence.

First: "pick up the vitamin B pack".

(Run it. Silence. Let the room watch.)

Now I change only the sentence: "pick up the magnesium bottle".

(Run it. When it goes for the other object, stop talking.)

There's no if anywhere. That is a VLA. Everything else in this talk explains
how it gets there.

## demo-act-video
<!-- target: 30 -->

And for comparison: this is the same task with ACT. It does it very well. But
it does it the same way, whatever I say.

## backup-demo
<!-- target: 5 -->

(Only if the demo failed.) This happens, and it's exactly what we're about to
talk about. This is what it looks like when it works.

## ch-future
<!-- target: 10 -->

So where is all of this going?

## field-growth
<!-- target: 45 -->

First, the field exploded. ICLR submissions mentioning Vision-Language-Action:
one in 2024, and it was rejected. Nine in 2025. A hundred and sixty-four in
2026. Those are keyword searches, not a census, but the trend is obvious.

And in the last year we got π0.5, SmolVLA, GR00T, π0.7, Gemini Robotics 2...
Half of them you can already use from LeRobot.

## limitations
<!-- target: 60 -->

But let's be honest about what still doesn't work.

Simulation benchmarks are saturated. On LIBERO everyone scores between 95 and
98 percent. They no longer separate anyone.

In the real world, with blind evaluations on physical robots like RoboArena,
the picture is very different. And collecting real data is still expensive:
DROID took fifty people a whole year.

And the most counter-intuitive part: what improves generalisation isn't the
number of demonstrations, it's diversity. More scenes and more objects, not
more repetitions of the same thing.

## world-models
<!-- target: 110 -->

Everything we saw tonight is reactive: it sees and acts. It has no idea what
happens next.

A world model learns to predict the future: "if I do this, the scene will look
like that". And it combines with a VLA in four ways.

As a **planner**: it imagines several futures before moving and picks the best.
Meta's V-JEPA 2 does pick-and-place with objects it has never seen.

As a **data generator**: from one video of a robot doing a task, it generates
videos of new tasks. Exactly what we're short of.

As a **training signal**: the model learns to predict the future while it
learns to act. VLA-JEPA is already in LeRobot, and the detail is that the world
model is only used during training.

And as an **evaluator**: testing policies in a learned simulator before
touching a real robot.

Today, most of the gain comes from using it to train better. Planning in real
time is still expensive.

## generalist-models
<!-- target: 90 -->

And how does this fit with the generalist models everyone is talking about?

Think in layers. On top, a generalist model reasons. You say "clean the table"
and it turns that into steps. It's slow, but it knows about the world and can
use tools.

Below, the VLA executes each step: "pick up the magnesium bottle". Fast, tens
or hundreds of times a second.

The generalist decides **what**. The VLA decides **how**. And there are already
systems where the generalist calls the VLA as just another tool.

And one deep difference: an LLM gets it wrong and you rewrite the prompt. A VLA
gets it wrong and knocks a bottle onto the floor.

## when-to-use
<!-- target: 75 -->

So, when should you use what?

If you have **one fixed task** and a small budget: ACT. About fifty demos, a
few hours on one GPU. It's the cheap baseline, though not always the best.

If **language picks** the object or the task, like in the demo: fine-tune a
small VLA like SmolVLA.

And if the task is **long and open-ended**, it needs world knowledge: a
generalist planner that calls the VLA as a tool.

And I'll say it plainly: what I came to tell you about tonight is often not the
answer. Use it when language really has to change the behaviour.

## thanks
<!-- target: 20 -->

Thank you very much.

The QR code takes you to the slides, with every reference. Happy to take
questions.

## references
<!-- target: 5 -->

(Not presented. It's there for whoever downloads the slides.)

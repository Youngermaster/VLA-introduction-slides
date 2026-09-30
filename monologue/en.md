# From Tokens to Torque: monologue (English)

Full spoken script. Each `##` is a slide's `routeAlias`, so reordering
`slides.md` never desynchronises the script.

The `<!-- target: Ns -->` comment is how long the section should take. The
`/practice` route compares that target with a word-count estimate.

Budget: 30-40 min. The script is ~23 min of speech; with each click's
animation, the pauses and ~5 min of demo, the talk lands at ~35 min. The
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

This is the demo table: a vitamin B pack, a mug, the zinc bottle and a tray.

First, **see**. The camera captures the scene and the image is split into
patches. The model recognises what's on the table.

Second, **read**. I type: "put the zinc in the tray". The sentence is split into
little pieces called tokens, exactly like in ChatGPT, and each piece becomes a
number.

Third, **ground**. The words "zinc" and "tray" pull the model's attention onto
those two objects, and everything else fades.

An honest note: the boxes and the mask are for us to see. A VLA doesn't draw
boxes. This grounding happens implicitly inside its attention, and in a minute
I'll explain what that is.

Fourth, **act**. The only thing that comes out of the model is these numbers:
how much to move each joint and what to do with the gripper. Thirty times a
second.

(Let the pick run in silence.)

One model. No if statements. Nobody wrote "if it says zinc, go left".

## what-is-a-policy
<!-- target: 65 -->

I'm going to use one word a lot, so let me define it: **policy**.

In robotics, the policy is the control brain. It's a function, like the ones
from school: something goes in, something comes out.

In goes **o**, the observation: what the cameras see and where the joints are
right now. In goes **ℓ**, the instruction, what you asked for. And out comes
**a**, the action: not a single move, but a block of moves into the future,
about a second and a half of plan.

ACT, the model I started with, doesn't have that ℓ term. A VLA does. The whole
talk fits in that difference.

And one detail people often get wrong: this is not reinforcement learning, not
a robot learning by trial and error with rewards. It's learning by imitation:
we show it how a person does it, and it copies.

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

This is the technical part. Bear with me for about twelve minutes; I'll take
it one step at a time.

## language-in
<!-- target: 100 -->

Let's start with how language gets in. And for that you need to know what a
token is.

A language model doesn't read letters or whole words. It has a fixed
dictionary of tens of thousands of text pieces, and it chops any sentence into
those pieces. Each piece is a **token**. Common words are a single token; rare
ones get split into two or three. Here "bottle" is split in two, and nothing
bad happens.

Each token has a number in that dictionary, its ID. But a bare number says
nothing about meaning. So the model keeps a huge table where each ID points to
a list of numbers, a **vector**. In SmolVLA that's 960 numbers per token. That
list is like a fingerprint of the meaning: similar words get similar lists.
"Bottle" and "jar" end up close; "bottle" and "walking", far apart.

And one clever trick: we don't pass the sentence on its own. In OpenVLA it's
wrapped in a fixed template: "In: What action should the robot take to... your
sentence? Out:". So the model isn't learning some strange new task. It keeps
doing what it always does, the same as ChatGPT: completing what comes after
"Out".

From here on, to the model, the sentence is no longer text. It's a row of
vectors.

## vision-in
<!-- target: 75 -->

The image comes in in a very similar way.

To a computer, a photo is a grid of pixels, and each pixel is three numbers:
how much red, how much green, how much blue. That's all.

What we do is cut the photo into little squares, patches, like a jigsaw. Each
patch goes through a vision encoder, a network that was already trained on
millions of images with their captions. That network turns each patch into a
vector the same size as the word vectors. A patch that contains the bottle ends
up with a list of numbers that "looks like" the idea of a bottle.

SmolVLA summarises each image into 64 tokens, and since I have three cameras,
that's about two hundred image tokens at every moment.

And there's one more ingredient: where the arm is. Each motor reports its
angle, and those six numbers also become a vector, a state token.

Now the important part: the image tokens, the sentence tokens and the state
token are glued into a single row. To the transformer it's a sequence of
vectors. It doesn't know which were pixels and which were words, and it
doesn't need to.

## attention
<!-- target: 145 -->

So now: what is **attention**? The word gets used a lot and almost nobody
explains it.

Picture a meeting where every token can ask a question to all the others. To
do that, each token prepares three things. A **question**: what am I looking
for. A **label**: what do I have to offer. And a **content**: the information I
hand over if someone picks me. In the papers they're called Q, K and V: query,
key and value.

Take the word "zinc". Its question is something like "where is a small
bottle with a label?". That question is compared with every other token's
label, and each comparison gives a score: how well it matches. The patches
with the bottle match strongly; the mug, weakly; the empty table, almost not
at all.

Those scores are turned into percentages that add up to a hundred. That's the
softmax. And the "zinc" token takes a blend of everyone's content in those
proportions: most of what the bottle offers, a little of the rest. So after
attention, the "zinc" vector knows where the zinc is in the image. That's
grounding without drawing any box.

And it doesn't happen once. It happens in parallel, with several different
questions at the same time, and it repeats layer after layer, sixteen times in
SmolVLA.

Is this the same attention as ChatGPT? Yes, exactly the same operation: the
formula on the screen. ChatGPT uses it to decide which earlier words matter for
writing the next one. Here we use it to mix words with pieces of image.

What's new is at the end. The action tokens only ask, and the vision-language
model answers. That's cross-attention: the actions ask "what do I do?", and the
answer comes from what the model saw and read.

And the mask decides who can look at whom. In ChatGPT each word only looks
backwards, so it can't cheat by peeking at the future. Here the image and the
sentence see each other completely, and each action only looks at the earlier
actions. Almost all of the difference from an LLM is in that mask and the last
layers.

## action-tokens
<!-- target: 130 -->

Now the most interesting part: how does motion come out of a model that was
built to write?

Let's start with what's really in the arm. Each motor has a sensor that says
where it is: a number from 0 to 4095 per turn. When you calibrate, LeRobot
converts that number into degrees. Thirty times a second we read six numbers:
the base, the shoulder, the elbow, the wrist, its roll and the gripper.

So a motion, as the computer sees it, is just a table of numbers over time.
This curve is one joint over one second.

We sample it thirty times a second: thirty points.

And here's the problem. A transformer doesn't write numbers with decimals. It
picks pieces from a dictionary. So every number has to become a piece.

The simplest way: take the range that joint moves through and cut it into 256
equal bins, like a ruler with 256 marks. Each value falls into a bin, and the
bin's number is the token. It's like rounding a price to the nearest dollar.
RT-2 and OpenVLA do exactly this: they take the 256 least-used tokens in the
dictionary and give them a new meaning, "bin 0" to "bin 255". It works, but
look at the staircase: rounding loses precision.

Today there are two better ways. **FAST** doesn't round point by point: it
describes the whole curve as a sum of waves, the way JPEG does with a photo. A
smooth motion needs only a few waves, so you keep those few and compress a
lot. On a T-shirt-folding task, 700 tokens become 53.

And **flow matching**, which is what the demo model uses, skips tokens
entirely. It doesn't pick pieces: it outputs the numbers directly. It starts
from a block of random numbers, pure noise, and in ten steps it polishes it,
like developing a photo, until it's a trajectory. That's what π0, SmolVLA and
GR00T use.

## detokenizer
<!-- target: 85 -->

And the way back, which almost nobody explains. From token to torque.

In OpenVLA, the model outputs seven tokens: three to move the hand in space,
three to rotate it and one for the gripper. Each token is a dictionary entry,
so you subtract where those entries start and you're left with the bin number,
from 0 to 255.

That bin is mapped to a scale from minus one to one. Then it's
"de-normalised": back to real units, millimetres and degrees, using how the
arm moved in the training data. A fine detail: it uses the 1st and 99th
percentiles, not the min and max, so one bad demonstration doesn't stretch the
whole ruler.

In SmolVLA it's more direct, because there are no bins: the numbers already
come out of the model, and you just turn them back into degrees with the mean
and spread measured in the dataset.

So where is the torque? That final number is sent to each motor as "I want you
at this position". The motor has its own controller inside: it measures where
it is, sees how far it has to go, and applies the force needed to get there.
That's the torque in the title. The model decides where; the motor takes care
of the push.

## action-chunking
<!-- target: 85 -->

Another key trick: predict blocks, not steps.

Think of driving. If you could only look at the road once a second and decide
one single turn of the wheel each time, you'd drive in jerks. That's what
happens to a robot that predicts one action per inference: it stops to think
at every step, and since each decision ignores the last one, it shakes.

With chunking, one inference returns a block of fifty future actions, and the
arm executes them back to back. Fifty actions at thirty per second is almost
two seconds of motion. On my 5060 Ti, computing one block takes about 150
milliseconds. Think a little, move a lot.

ACT uses blocks of about a hundred actions; SmolVLA and π0, fifty.

But there's still a seam: when one block hands over to the next, the arm can
hiccup. The 2025 fix is to compute the next block while the current one is
still running, and blend the part where they overlap so you can't see the
switch. It's called real-time chunking, and in LeRobot today it's one
command-line flag.

## architecture
<!-- target: 115 -->

Let's put it all together. This is the whole machine, SmolVLA style, and we'll
follow one cycle from start to finish.

In come three photos, one per camera, each summarised into 64 tokens. In comes
the sentence, a handful of tokens. And in comes the state token, where the arm
is. About two hundred tokens in a single row.

That row goes through the vision-language model, layer by layer, and in each
layer attention mixes the information: the word zinc finds the bottle, the
bottle gets related to where the gripper is.

And here's my favourite idea in the paper. The original model has 32 layers,
and SmolVLA only uses the first 16. The last layers of a language model
specialise in producing nice text, and a robot doesn't need to talk. So they
cut them, and the model is half as heavy.

Then comes the action expert, a small model of about a hundred million
parameters. It starts from noise, asks the big model through cross-attention,
and in ten steps cleans that noise into fifty actions. The arm executes them,
the camera sees the result, and the cycle starts again.

For perspective: OpenVLA has 7 billion parameters, uses discrete tokens and
runs at about 6 cycles a second on a 4090. SmolVLA has 450 million and runs on
a laptop. It's the one you're about to see.

## ch-train
<!-- target: 10 -->

Now we know how it thinks. Next, how it learns.

## recording
<!-- target: 80 -->

It all starts with recording data. And the setup has two identical arms.

I move the **leader** arm by hand, like a puppeteer. The **follower** copies the
motion, a tiny bit late. Meanwhile, the three cameras record.

Thirty times a second a row is written, like in a spreadsheet: the three images
of that instant, the follower's six angles, the leader's six angles and the
task sentence. Each time I do the whole task, that's one episode.

And look at these two rows, because they are not the same. The **state** is
where the robot is, what the follower reads. The **action** is where the human
sent it, what the leader says. Training a policy is learning to guess the
second from the first and the images. That's all behaviour cloning is.

## training
<!-- target: 85 -->

And what does training actually mean?

The model has millions of knobs, its parameters. At first it guesses badly. We
show it one instant from the dataset, the images, the sentence and the state,
and ask it for the block of actions that comes next. We compare that with what
the human really did. The gap between the two curves is the **error**.

Then every knob is turned a tiny bit, exactly in the direction that makes that
error smaller. That's one training step. And it repeats with another instant,
and another, thousands of times.

Twenty thousand steps later, the prediction lands on top of what the human
did.

No reward, no trial and error: it copies. For SmolVLA with about fifty
episodes, that's around four hours on an A100.

## pretrain-finetune
<!-- target: 70 -->

So how are fifty episodes enough, if we said data is the problem?

Pre-training. Before I ever touched it, SmolVLA had already been trained on 481
community datasets: over ten million frames of robots doing things. And before
that, its vision-and-language part had already seen millions of images with
text. It already knows what a bottle is and how an arm moves in general.
Months of GPU time you didn't pay for.

You bring your part: fifty episodes, for example five positions with ten
repetitions each. A few hours. That only teaches it the details of your table,
your arm and your objects.

Without the first phase, fifty episodes are nowhere near enough. With it, they
are. That is all "foundation model" means in robotics.

## ch-demo
<!-- target: 20 -->

And now, the part that can go wrong.

I put the demo in the middle of the talk on purpose. If it fails, I still have
half a talk to recover.

## my-build
<!-- target: 60 -->

First, the arm. It's an SO-100, an open design, and I printed it on an Ender 3.

Six servos per arm, all on one serial bus, and three USB cameras: overhead, on
the wrist and at the base.

The story that sums it up: my first holes came out half a millimetre too small
and I stripped the screws. I had to calibrate the printer's compensation
before I could build anything.

The pair, leader and follower, is about 230 dollars in parts.

## demo-video
<!-- target: 270 -->

This is on my table, at home, with the model I trained. Same arm, same
objects.

(Let the video play.)

Now we're going to do it here, live, under this room's lights.

(Switch to the terminal for the live demo.)

Same robot. Same model. Same weights. The only thing that will change is the
sentence.

First: "pick up the vitamin B pack".

(Run it. Silence. Let the room watch.)

Now I change only the sentence: "pick up the zinc bottle".

(Run it. When it goes for the other object, stop talking.)

There's no if anywhere. That is a VLA. Everything else in this talk explains
how it gets there.

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
<!-- target: 90 -->

But let's be honest about what still doesn't work.

First, a word you'll see in every paper: benchmark. A benchmark is a standard
exam: the same tasks, in a simulator, for every model. It's how papers compare
themselves with each other.

In 2024, OpenVLA scored 76 % on the most used one, LIBERO. Today everyone scores
97 or 98. That's what we call a saturated benchmark: the exam got easy and no
longer separates the good from the best.

Why should you care? Because if someone shows you 98 % on LIBERO, it tells you
almost nothing about how that model will do on your table, with your light and
your objects.

The real test is a real robot. RoboArena, for example, has two policies do the
same task on physical robots, and people vote without knowing which is which.
And collecting real data is still expensive: DROID took fifty people a whole
year.

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
<!-- target: 100 -->

And the question you probably have: what does this have to do with the
generalist models everyone is talking about, like GPT, Gemini or Claude?

Let's compare them side by side.

What goes **in**: the generalist takes text and images. The VLA takes the
cameras, the instruction and the arm's state.

What comes **out**: the generalist returns text, plans or tool calls. The VLA
returns motor movements.

**Speed**: the generalist thinks a few times a second, or less. The VLA has to
act 30 to 200 times a second, because the world doesn't wait.

What it **learns from**: the generalist learned from the internet, text and
images that already existed. The VLA, from demonstrations someone had to
record.

And **when it's wrong**: with the generalist, you rewrite the prompt. With the
VLA, a bottle hits the floor.

So they don't compete: they combine. The generalist takes "clean the table"
and turns it into steps. The VLA carries out each step. The generalist decides
**what**; the VLA decides **how**. And there are already systems where the
generalist calls the VLA as just another tool, the way it would call an API.

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

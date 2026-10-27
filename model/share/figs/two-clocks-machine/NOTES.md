# Two clocks marble machine (`two-clocks-machine`)

Size: **Hero**, interactive, SVG only. A bench-top marble machine with two clock movements. Marbles
(problems) are lifted from a hopper by a chain lift and roll down three short chutes on a pegboard
(requirements, design, software), paced by a small, fast clock movement with a flyball governor. They wait
in a glass-walled lane at the hardware gate, then a long four-flight staircase (fabrication, integration
and test, qualification, launch) lets them down one step per swing-and-back of a big, slow pendulum clock
(the one lit part, `#22CFFF`). The AI lever on the front sets the governor; a gauge reads program length
against today; a toggle engages the robots pawl on the slow clock's escape wheel.

## Files

| File | What |
|---|---|
| `model.mjs` | The pure Amdahl model: shares, speedups, program length, readout text. Inlined in the page. |
| `machine.mjs` | Layout (world units) and a deterministic simulation of marbles, lift, pendulum and escapement pins. |
| `scene.mjs` | Moving parts as pure functions of the machine state (transforms, paths), shared by the build and the page. |
| `live.js` | The page's loop, controls, tour, reduced motion, offscreen pause. |
| `build.mjs` | Builds `two-clocks-machine.html`, `.svg`, `.fragment.html`; `--audit` runs the kit audit, `--count` prints parts. |
| `render.mjs` | Writes `two-clocks-machine.png` (the SVG as an `<img>`, 2× on `#0C0E11`, 1280 × 880), `poster-still.png` (the card, 2×) and the host-page tests in `shots/`. |

## Part count

140 recorded solids (base, feet, pegboard, hopper, sprocket flanges, movement plates, pillars and wheels,
governor, three chutes, lane, glass, gate, 13 treads, 8 stringers, 6 trestles, funnel, tower, dial, escape
wheel, anchor, pawl, pendulum, beat plate, lever, gauge, switch), plus 10 hopper marbles, 14 lift cups,
28 escapement pins, the chain and up to about 35 moving marbles. `node build.mjs --count`.

## True numbers and where they come from

All from `Space Unlock Tree - model.md`, section 3 ("Two clocks").

- **Amdahl table** ("Why 5-10x faster thinking gives about 1.6x faster programs by 2031"): shares 10 / 15 / 10 /
  25 / 25 / 10 / 5%; speedups Plateau / Exponential / Recursive: requirements 2 / 5 / 20×, design 2 / 10 / 50×,
  software 2 / 5 / 20×, fabrication 1.0 / 1.1 / 1.3×, integration and test 1.0 / 1.2 / 1.5×, qualification
  1.0 / 1.2 / 1.5×, launch 1.0×. Program length = Σ share / speedup, today = 1.0.
  `model.mjs` reproduces: Plateau 0.825 (17.5% shorter, 1.2×), Exponential 0.624 (37.6%, 1.6×),
  Recursive 0.489 (51.1%, 2.0×). The table says about 18%, 38%, 51%.
- **Robots switch: a fit, not a model row.** It keeps Recursive thinking speeds and sets fabrication 1.5×,
  integration and test 1.8×, qualification 1.6×, launch 1.0×, giving 0.431 (56.9% shorter, 2.3×), inside the
  model's 56–60% ceiling for a robot-first firm by 2031 (section 3 ceiling table). Labelled `ROBOT_FIT` in `model.mjs`.
- **Queue fact** (caption): under Exponential in 2029, 122 of 155 frontier-math, applied-math and physics-model
  nodes have reached their earliest year, only 44 of 167 validated technologies and operational systems
  ("a stock of solved problems waiting on hardware"). Stored as `QUEUE_FACT`.
- **Lengths in the drawing** are proportional to the shares: 3.4 units of run along x per 1% (chutes 34 / 51 / 34;
  flights 85 / 85 / 34 / 17 of tread run, 5 / 5 / 2 / 1 treads of 17).
- The plinth label is `2031`, the year of the table.

## What is illustrative (not model numbers)

- Machine timing: one program today takes 40 s; the staircase has 13 steps, so the pendulum beats once a second
  at today. Thinking chute times are exact per stage (share / speedup × 40 s). The staircase steps every marble
  together, so the doing total and the program length are exact, but within the doing section each flight's
  time is share-weighted rather than its own speedup.
- Throughput: thinking delivers marbles at 0.6 of the hardware's intake at today (hardware waits on design),
  scaled by the thinking speedup; the queue holds 9. These set how fast the queue fills, not any readout number.
- Between detents the lever interpolates speedups in log space; the readout names the nearest detent and prints
  the program number the gauge shows at that instant.
- Governor spin is `speedup^0.6` (to avoid strobing); the thinking dial hand sweeps at the true thinking speedup;
  the doing dial hand steps once per beat.

## Checks run (results)

- `node build.mjs --audit` → every line 0, `audit · 1 tubes · 169 solids · 147 items · 1 depth states · 486 overlaps · 486 order rules · 3.9 s` then `audit passed`.
- `node scripts/lines.mjs two-clocks-machine.html --out shots/lines.png` → `line ends: 0 of 968 ends on 102 lines float`;
  with `--reduced` (the still) → `line ends: 0 of 968 ends on 102 lines float`.
- Captures read: card desktop and phone 390 (no sideways scroll), 3–8× close-ups of the lift, governor, chutes,
  lane and gate, flights, gauge, tower escapement, funnel and switch; tour shots; a slowed sheet at Recursive.
- `drive.mjs`: keys 1–4, R, arrows and drags give the right readouts; reduced motion responds to keys; the loop
  stops offscreen and resumes; frame script 0.8 ms median, 1.1 ms p95.
- SVG: valid XML (`xmllint`), no scripts or external refs, only `tower.pendulum` uses the lit token; rendered as
  an `<img>` into `two-clocks-machine.png`.
- Fragment in a host page with Hanken Grotesk headings (`shots/host.html`, shots at 1280 and 390): host h1/p
  styles unchanged, no globals added (`["__before"]` only, the host's own), plate corners keep the mono face.

## Known issues

- The lever and the robots switch have no visible linkage to the governor and the pawl (the chutes sit flush on
  the pegboard, so there is no clear route for a rod or cable); the motion shows the coupling.
- The anchor on the slow clock is small and partly behind the pendulum rod; it reads as an anchor only at 4×.
- Marbles racing at Recursive cross a chute in 4–12 frames, so they jump rather than roll.

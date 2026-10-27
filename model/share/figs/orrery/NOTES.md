# orrery — "Missions fly AI-designed trajectories"

Node `astro-ai-designed-trajectory-flown` (graph-v8.json): earliest 2029 in the base case (S2; S1 2030), High by 2031 and 2035, binding gate **launch**.

## The object
A brass-and-steel desk orrery of the Earth–Moon system on a two-tier round plinth on four bun feet. A crank (on an hour dial with 24 ticks: one turn = one day) drives a visible two-stage gear train to the Moon arm. The Earth globe leans on a tilted axle that rises from a knuckle on a cranked bracket at the top of the column. The Moon rides a post on its arm, with a counterweight arm opposite it. The **lit part** (`#22CFFF`, the only one) is the transfer wire with its spacecraft bead. The wire is held by four fine stays on the arms: one on the counterweight arm, one on each of two outriggers, and one on a bracket at the tip of the Moon arm. Every stay ends on a clip ball. Because the wire rides the arms, it turns with the Moon: it is drawn in the Earth–Moon rotating frame, which is the frame trajectory designers work in. The only words in the drawing are the engraved `2029` on the plinth's label plate.

## Parts
66 recorded solids and 1 wire route (4 runs, about 70 depth-sorted chunks), giving 120 drawn items.
- Base (13): plinth, 2 tiers; 4 feet, 2 parts each; label plate; degree ring with 72 ticks; movement plate.
- Movement: wheels 70 and 39 with spoke windows; two 10-tooth pinions; boss; collar; sleeve; arbor bushes and rods; bridge bar on 2 pillars; crank boss, arm, neck and knurled knob; hour dial.
- Arms and the Earth: hub; Moon arm with its tip bracket; counterweight arm with a knurled weight; 2 outriggers; column; collar; bracket; knuckle ball; 2 axle segments; finial; globe (equator, tropics, polar circles, 6 meridians).
- Moon: collar, post, cup, Moon with 3 craters.
- Trajectory: wire, bead, 4 clip balls, and 4 stays with their feet.

## Numbers and where they come from
| Number | Use | Source |
|---|---|---|
| 2029 | engraved label | node `earliest_year.S2` (base case) |
| Moon 27.3 d | readout; gear train 39/10 × 70/10 = **27.30** crank turns (days) per Moon orbit | sidereal month 27.32 d (true; the train is within 0.1 %) |
| 23.44° | Earth axle tilt | Earth's obliquity (true) |
| Moon radius 0.27 × Earth's | globe 26, Moon 7 | 1737/6371 km = 0.273 (true) |
| 6–18 months freeze; 30+ missions 2024–2030; launches slip | caption | node `why` text |
| transfer ≈ 3–4 months | readout | **illustrative**: typical ballistic lunar transfer duration (general knowledge, not in graph-v8) |

**Illustrative, not to scale:** the Earth–Moon distance (the arm is 100 units; to scale it would be 60 Earth radii, about 1,560); the wire's swing out to about 1.45 × the Moon's distance (a real ballistic transfer reaches about 4 ×, around 1.5 million km); the shape of the wire, which is a smooth spline through hand-placed points and not a computed trajectory; the size and 18° inclination of the capture orbit; the gear module and the trapezoidal (not involute) tooth form; all other dimensions.

## Checks run (results)
- `node build.mjs`: runs clean. Output: `wrote orrery.html, orrery.svg · 120 items · 66 solids · wire 487 units · ratio 27.30`.
- `node build.mjs --audit`: every line is 0 and the run ends `audit passed` (`shots/audit.txt`). Clearance, terminals, loose ends, folds, support (0 unsupported, 0 hanging, 0 sunk), depth order, self-overlap, wobble, stand-in shapes and crowding are all 0.
- `lines.mjs orrery.html --out shots/lines.png`: `line ends: 0 of 276 ends on 23 lines float`.
- Captures (all read):
  - `shots/card.png` (desktop) and `shots/phone.png` (390 px): no sideways scroll, clean console.
  - 4× close-ups: `sub.png`, `moon.png`, `globe.png`, `apogee.png`, `hub.png`, `mech.png`, `train.png`; 8×: `bead.png`.
- SVG on its own: `shots/svg-check.html` shows `orrery.svg` as an `<img>` on #0C0E11. `orrery.png` (1280 × 880) is a headless Chrome screenshot of that page at device scale 2, and it renders correctly. The SVG has no scripts, no external references and no external fonts, and the token overrides are embedded in its `<style>`.
- Fit: the drawing spans 66 % of the viewBox width and 81 % of its height, centred, with 40 units of margin for the halo.

## Known issues
- **`Fig 2` is a placeholder.** The set's numbering isn't fixed; the Raptor figure already uses `Fig 1`.
- **Gear pairs are drawn as one item each.** Each meshing pair (70/10 and 39/10) is one drawn item because the teeth interleave and can't be painter-sorted. Inside a pair the far gear is drawn first, so at sub-pixel scale a far tooth tip can't appear in front of the near pinion's flank.
- **The Earth's daily-rotation drive is not shown.** That would be a 1:1 drive through the centre arbor, hidden inside the column.
- **A capture-tool quirk.** `capture.mjs --select img --scale 2` drew the SVG at half size in the corner, so the PNG was made with headless Chrome directly. This is a tool quirk, not a fault in the figure.
- **Dark theme only, per the spec.** The light theme is not built or checked.

# refuel — Routine orbital refuelling economy (Fig 3)

Ship-to-ship cryogenic propellant transfer interface, drawn as a test article on a display plinth.
There are two insulated tank end sections, dome to dome, docked through a collar and a latched ring
with umbilical plates on top. Below them, each dome's sump boss feeds a vacuum-jacketed line:
bellows → flow meter → isolation valve (with actuator) → cryogenic quick-disconnect. The lit part
(`#22CFFF`, the only lit part) is the main transfer line between the two quick-disconnects. Each tank
also has a vent line with a relief valve and rain cap, a pressurisation line that runs over the
collar (held by a stand-off) to its umbilical plate, a mass-gauging sensor whose cable runs to a
junction box on the plinth, cradle straps on saddle pedestals, and a blind end plate. Tank B's plate
also carries a manway and three instrument ports. Engraved plinth label: `2030`.

## Files
- `build.mjs`: `node build.mjs` writes `refuel.html` and `refuel.svg`. `--audit` runs the kit audit, and `--parts` prints the part count.
- `refuel.html`: the review card. Fig 3 top left, title top right, hint empty (still figure), readout bottom right, plus a legend and caption.
- `refuel.svg`: `figureSvg({ standalone: "dark" })` with the token overrides in its own `<style>`. It has no script, no `href`, no fonts, no external refs, and a transparent background.
- `refuel.png`: 1280 × 880. It is `refuel.svg` drawn as an `<img>` (`shots/svg-img.html`, on `#0C0E11`) by headless Chrome with `--force-device-scale-factor=2 --window-size=640,440 --screenshot`.
- `shots/`: card, phone, line-check and 4× close-ups.

## Part count
`node build.mjs --parts` → 85 standalone solids + 9 lines carrying 46 fittings (14 flanges, 8 bellows
convolutions, 4 clamps, 4 bands, 2 valves with neck and actuator, 2 meters with flanges, neck and head)
+ 6 feet. Grouped as a reader would count them, that is about 100 distinct components (131 recorded
solids, 182 drawn items). This is **above the 40–80 "Figure" range**, mostly because of small
fittings on the lines. I did not strip detail to hit the band.

## True numbers and where they come from (`graph-v8.json`)
- Readout `1,200 t · 1% gauge = 12 t ≈ 0.1 tanker`: `prop-cislunar-propellant-economy.why` ("gauging error at 1% of a 1,200 t load is ~12 t, ~0.1 tanker"). The build computes it from `LOAD_T = 1200` and `GAUGE = 0.01`. `TANKER_T = 120` t is **implied** by the node's own "12 t ≈ 0.1 tanker". It is not a separate sourced figure.
- Caption, all from the same node and `prop-hls-refuel-campaign`:
  - lunar-lander campaigns need more than 10 tankers (NASA OIG, Mar 2026, quoted in the nodes);
  - boil-off costs about 1–5 extra tankers per campaign (the node calls its table illustrative);
  - validated boil-off and transfer models recover only a few percent of campaign launches;
  - cadence and reuse set the economics;
  - earliest year 2030 in S2 (base case), band 2031 Medium (S2), band 2035 High, binding gate launch.
- Plinth label `2030` = `earliest_year.S2`.
- All dimensions are illustrative: a generic member of the class, not to the scale of any vehicle, with no livery.

## Checks run (final build)
- `node build.mjs --audit`: every line 0. Last lines: `audit · 29 tubes · 131 solids · 182 items · 1 depth states · 447 overlaps · 447 order rules · 1.6 s` / `audit passed`.
  - Fixed on the way: main-line support posts sat 1.05 under the jacket (clamps grown to r + 2.2); the cradle pedestals were wider than their straps (straps widened to 10, pedestals a = 4.6); a press-line bend pinched (vertical leg lengthened); the label plate sank into a junction box (label moved to the front centre).
- `node scripts/lines.mjs refuel.html --out shots/lines.png`: `line ends: 0 of 346 ends on 89 lines float`. Fixed on the way: two flow-meter seam arcs ended 1.5 px from anything, because a hull-filled lathe had no body outline. The meter is now a body plus two flange solids.
- `capture.mjs`: card at 720 px (`shots/card.png`), phone at 390 px (`shots/phone.png`, no sideways scroll). Console clean in both.
- 4× close-ups read: mechanism and lit line (`z-mech`), each feed train (`z-feedA`, `z-feedB`), docking ring, latches and umbilicals (`z-dock`), tank A dome and cradle (`z-tankA`), tank B end plate (`z-tankB`), gauge cables (`z-gaugeA`, `z-gaugeB`), label (`z-label`).
- SVG on its own: `shots/svg-img.html` loads `refuel.svg` as an `<img>`. `shots/svg-img-page.png` (capture.mjs, console clean) and `refuel.png` both render correctly.
- Composition: in the 640 × 440 viewBox the object spans about 72% of the width and 64% of the height, centred, with margin for the halo. Camera is azimuth 60°, elevation 30°.

## Known issues / judgement calls
- Component count is about 100, above the Figure range (see above).
- Tank B's sump and pressurisation bosses sit on the far side of its dome and are hidden by design. The camera sees dome A's face and dome B's back.
- With the tanks in `mid` tone, the hierarchy puts the transfer assembly forward. At 1× the tanks read darker than in a typical kit figure.
- `capture.mjs --select img --scale 2` gave a mis-scaled clip of the `<img>` page, so `refuel.png` is rendered by headless Chrome directly instead (command above).
- The pressurisation route over the collar to umbilical plates is a plausible arrangement, not a specific vehicle's.

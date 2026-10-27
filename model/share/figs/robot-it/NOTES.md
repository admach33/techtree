# robot-it: notes

Still isometric figure for the unlock "Robots run integration and test around the clock"
(`robo-24x7-integration-test`, graph-v8.json). Built with the Anatomy kit, framework-free.

## Files
- `build.mjs`: builds everything (`node build.mjs`; `node build.mjs --audit` runs the geometry audit).
- `robot-it.html`: dark review card (Fig, title, empty hint, readout `TVAC: 4 cycles · 12 h plateaus`, legend, caption).
- `robot-it.svg`: drawing alone, `figureSvg({ standalone: "dark" })` plus the token overrides, no scripts, no external refs (one internal `url(#rit-mouth)` clip).
- `robot-it.png`: 1280 × 880, the SVG rendered as an `<img>` on `#0C0E11` (via `shots/svg-img.html`).
- `shots/`: card, phone, 4× close-ups, line-check ring map.

## The object
A robot integration-and-test cell on a plinth (camera azimuth 55°, elevation 30°, so the arm is seen in profile):
- **Lit (`#22CFFF`), one assembly: the six-axis arm**: base, J1 ring, turret, lower arm, J2/J3 caps, elbow casting with
  motor cap, round forearm (J4), wrist (J5), J6 flange, tool changer, vacuum gripper plate and four cups. It rides a
  carriage on a floor rail (bed, two rails, gear rack, scale strip, end stops, bumpers, four bearing blocks, track motor).
- **The satellite** on its test fixture at the chamber door: fixture base, legs, braces, thermal platen with two fluid
  ports, adapter, separation ring, bus with body-mounted array, patch antenna, star tracker with baffle, GPS puck. The arm
  holds a side panel 3 units off the bus on two guide pins (mating it).
- **Thermal-vacuum chamber, unlit**: shell with ellipsoidal head and weld seams, mouth flange with bolt circle and seal
  groove, dark interior with shroud rings and internal rails, five swing-bolt door clamps, hinge pin with caps, door open
  80° on two strap hinges showing its inner face and shroud plate, three feedthrough flanges on saddle pads (two
  connectors, one thermocouple), a viewport on a saddle pad, two saddle supports on base plates.
- **Vacuum pump line**: port pad, elbow ball, vertical line with a gate valve (round actuator can), flange on the inlet of
  a roughing pump (body, feet, finned motor, fan cover).
- Tool rack with three spare end effectors (two-finger gripper, nutrunner, vacuum pad tool), cable tray with three
  cables, two safety posts with stack lights, plinth with six feet, groove, corner screws, engraved `2033`.

**Part count**: 138 drawn items (136 solids or assemblies + 2 pipe chunks), 147 recorded solids, 28 lit solids.
Counting a clamp with its eye, a feedthrough with its pad and plug, or a spare tool as one part, about 105 physical parts:
slightly above the brief's "up to about 100".

## True numbers and where they come from
- `2033` (plinth label): earliest year, base case (S2/S3), `robo-24x7-integration-test.earliest_year`. Bands: Low by 2031,
  Medium by 2035 (`band_2031`, `band_2035`). Embodied scenario (S4): 2031, High by 2035. Binding gate: `qualification`.
- `TVAC: 4 cycles · 12 h plateaus` (readout): "GEVS thermal-vacuum minimums (4 cycles, 12 h plateaus) do not compress",
  `robo-24x7-integration-test.status_oct2026`.
- Caption: integration and test is about a quarter of a new space program's critical path (`status_oct2026`); Rosie cut
  composite work on one Electron from more than 400 h to 12 (33× on one step) yet Electron's launch rate rose about 3.5×
  over six years (`robo-aerospace-tolerance-work.strongest_case_small` and the brief).
- Geometry (chamber radius, arm link lengths, satellite size, rack, tray) is illustrative, not to scale of any product.
  No company's logo, livery or branding is drawn.

## Checks run (actual output)
- `node build.mjs` → `wrote robot-it.html and robot-it.svg · 138 items · 142 shapes · svg 423 KB` (exit 0).
- `node build.mjs --audit` → every line 0 (clearance, terminals, loose ends, folds, support 0 unsupported · 0 hanging ·
  0 sunk, depth order 0, self-overlap 0, wobble 0, stand-in shapes 0, crowding 0), then
  `audit · 2 tubes · 147 solids · 138 items · 1 depth states · 397 overlaps · 397 order rules · 3.9 s` and `audit passed`.
- `node scripts/lines.mjs robot-it.html --out shots/lines.png` → `line ends: 0 of 356 ends on 60 lines float`.
- SVG as `<img>` (`shots/svg-img.html` → `robot-it.png`): renders with the embedded styles, cyan arm, halo; console clean.
- Card capture desktop and phone (390 wide): console clean, no sideways scroll; the arm still reads at phone width.
- 4× close-ups read: arm (`shots/z-arm.png`), gripper and panel (`z-grip.png`), chamber mouth, door and hinge
  (`z-door.png`), pump line (`z-pump.png`), rail and carriage (`z-rail.png`), tool rack (`z-rack.png`), fixture
  (`z-fixture.png`).

## Known issues / open
- `Fig 1` is a placeholder: set the number when the set is ordered.
- The satellite stands on its fixture at the open door rather than inside the chamber, so the arm can reach it; the
  chamber's internal rails are drawn but the fixture has no matching rails.
- The hinge is simplified: a pin tangent to the flange rim and two strap hinges, no knuckles.
- No dress-pack cable on the arm and no cable chain from the carriage to the tray.
- About 105 physical parts and a 423 KB SVG: heavier than a typical Figure.
- Dark theme only (per the spec); no light build.

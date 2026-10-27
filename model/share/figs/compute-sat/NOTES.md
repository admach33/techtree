# compute-sat: notes

Unlock: "Commercial AI chips running in orbit at scale" (`materials-cots-orbital-compute-ops`), earliest 2029 in
every scenario, High by 2031, binding gate launch. Related: `struct-gw-orbital-compute` (1 GW in orbit).

## What it shows
A generic, unbranded compute satellite of the 250 kW class as a museum model on its rotation fixture, on a plinth
engraved `2029`. Camera azimuth 50°, elevation 30°. The Sun is implied overhead: the solar wings face up, the two
radiator panels stand vertical (edge-on to it). The lit part (`#22CFFF`) is the tray stack of the compute module.

- Plinth: slab on four feet, bevel, groove, side seam, corner screws, alignment scale, recessed label field with the
  engraved year, soft halo and a soft shadow under the satellite.
- Rotation fixture: four leveling jacks, two rails, two crossbeams, two uprights with gussets, trunnion adapter
  plates on the bus front and back, trunnion shafts, bearing cap, handwheel (knurled rim, spokes, crank and knob),
  spring index pin, two clamp jaws with knurled clamp screws hooking over the bus deck.
- Bus: flat-pack body with seam and deck groove, two Hall thrusters and a baffled star tracker on the front face,
  two laser inter-satellite terminals (base, pedestal, gimbal ball, lens barrel) on the deck.
- Compute module: open-front rack (floor, back, two walls, lid), six accelerator trays with vents, screws and pull
  handles (lit), access panel swung open on two hinge barrels with a latch.
- Radiators: two panels with frame, riser lines and lower and upper manifold bars, on hinge cheeks.
- Coolant loop: on each side a supply and a return line (r 1.1, flanged at both ends) from the module wall to the
  lower manifold; each return line carries a canned pump whose motor can sits on a saddle cut to the pump body.
- Solar wings: root bracket, hold-down release, hinge barrel, boom, yoke, two cell panels (frame, cell grid, bus
  bars) joined by hinge knuckles, and a power harness with connector shells from yoke to bus. The left wing is
  mid-deployment: its outer panel is still rising 38° about its hinge line ("partly deployed").

## Part count
About 85 distinct parts (a pipe with its flanges, a tray with its handle, a laser terminal or a jack counted once).
Drawn: 123 solids (114 recorded for the audit, including the plinth slab, plus 8 foot pieces and the scale strip in
the plinth layer) and 6 routed lines (4 coolant pipes, 2 harness cables; 8 drawn runs). Recorded by group: fixture
35, bus 13, compute module 21, radiators 10, wings 18, pipe and cable fittings 16 (flanges, shells, pumps, motors).

## True numbers and where they come from
- Card readout `250 kW peak · < 4,000 kg · ×4,000 = 1 GW`.
- 250 kW peak / 175 kW average per satellite: SpaceX's public target (both nodes' `status_oct2026`).
- Under 4,000 kg per satellite: SpaceX's Sep 16 2026 FCC response (`struct-gw-orbital-compute`, `status_oct2026`).
- 1 GW ≈ 4,000 satellites at 250 kW peak, ~16,000–18,000 t, ~110–180 Starship flights
  (`struct-gw-orbital-compute`, `description`).
- First 100-kW-class flight ~2028, paying operations 2029, High by 2031, gate launch
  (`materials-cots-orbital-compute-ops`, `why`, `earliest_year`, `band_2031`, `binding_gate`).
- Plinth label `2029` = `earliest_year` (all four scenarios).
- Caption numbers repeat the above. Nothing else in the drawing is a measured dimension.

Illustrative, not to scale: the node gives up to ~6 km² of array and ~0.7–1.3 km² of radiator per GW, which is about
1,500 m² of array and 175–325 m² of radiator per satellite (my division by 4,000). The model's wings are shown short
(two panels each) so the radiators and the compute module stay readable; real wings are several times the radiator
area. Tray count (6), pipe sizes and every other dimension are illustrative.

## Checks run (final build)
- `node build.mjs` runs clean: `wrote compute-sat.html (312 KB) and compute-sat.svg (310 KB) · 133 items`.
- `node build.mjs --audit` (full output in `shots/audit.txt`): every line 0 (clearance, terminals, loose ends,
  screen folds, support, depth order, self-overlap, wobble, saddles, stand-in shapes, crowding),
  `audit · 8 tubes · 114 solids · 133 items · 1 depth states · 618 overlaps · 618 order rules`, `audit passed`.
- `node scripts/lines.mjs compute-sat.html --out shots/lines.png`: `line ends: 0 of 358 ends on 76 lines float`.
- Captures read: card at 1440 (`shots/desk.png`), phone at 390 (`shots/phone.png`, no sideways scroll, console
  clean), 4× close-ups of the compute module, coolant pipes, fixture, both wing roots and the plinth label
  (`shots/z-*.png`), and an 8× close-up of the pump and motor saddle (`shots/z-pump8.png`).
- Standalone SVG checked as an `<img>` on `#0C0E11` (`shots/img-test.html`); that render is `compute-sat.png`
  (1280 × 880). The SVG has no scripts, external fonts or external references.

## Known issues / open
- `Fig 1` is a placeholder; set the real figure number for the set.
- Dark theme only (per the spec); no light build was made or checked.
- Radiator risers are drawn as lines on the panel face (embedded tubes), not as routed pipes.
- The far-side items (back upright, back adapter and shaft, left coolant lines and left pump) exist and are audited
  but are mostly hidden by the bus and the compute module.
- The wings sit at the bus mid-plane and the radiators rise from the deck; this is a plausible generic layout, not
  a specific vehicle.

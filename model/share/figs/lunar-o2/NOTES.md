# lunar-o2: Tonne-per-year lunar oxygen plant

Unlock node `auton-lunar-oxygen-ops` in `graph-v8.json`. Still isometric figure, dark theme, built with the Anatomy kit.

## Files
- `build.mjs` writes `lunar-o2.html` (review card), `lunar-o2.svg` (standalone, token overrides embedded) and `svg-test.html` (the SVG as an `<img>` on #0C0E11). `node build.mjs --audit` also runs the geometry audit.
- `lunar-o2.png` is a 1280 × 880 render of `svg-test.html` (the SVG as an `<img>`), made with `scripts/capture.mjs --select img --zoom 0,0,640,440 --zoom-scale 2`.
- `shots/` holds the card, the phone width, `lines.png` and the 4× close-ups (lid, body, auger, gas train, box, tank, label, anodes).

## Object
A pilot molten-regolith electrolysis plant on a regolith plinth. The plinth has four feet, a side groove, rocks and three lander footpad prints, and the engraved label `2032`. The plant parts:
- feed hopper on four legs
- screw auger with its motor, dropping regolith through a chute into the reactor lid
- insulated reactor: foot ring and skirt, a jacketed vessel (the one lit part, `#22CFFF`) with viewport and two thermocouple bosses, a bolted lid with two anode feedthroughs, a bolted anode change port, a feed port and a hot-gas outlet
- slag tap (spout, ball valve, nozzle) over an open tray with a slag cake
- power junction box at the skirt
- hot-gas line with a finned cooler section to a compressor, then an oxygen line to a spherical tank on three legs (relief valve, gauge)
- power and control box with a radiator panel on stand-offs
- ground harness from a tall vertical solar-array mast (ridge-site design)
- three spare anodes on cradles

Part count: **124 solids** (116 recorded in the audit, plus the 8 plinth-foot solids). That is above the 40–80 Figure range. The extra are small fittings: 11 pipe flanges, bands and cooler fins, 15 feet and pads, 5 rocks, 6 tray pieces and 8 spare-anode pieces. The figure has 141 depth-sorted items and 4 routes: 2 pipes and 2 cables.

## True numbers and where they come from
Two sources: graph-v8.json `auton-lunar-oxygen-ops` (`why`, `status_oct2026`, `year_num`, `binding_gate`), and model doc §moon-mars plus its claims table ("0.07 kg/h (molten-regolith rig) … against about 0.11 kg/h for a 1 t/yr lunar plant", ICES 2026 MRE demonstration).
- Earliest year, base case (S2): **2032**. This is the plinth label.
- 1 t/yr = 1000 / 8760 = **0.114 kg/h**, which the readout shows as `0.11 kg/h needed`.
- Demonstrated rig rate: **0.07 kg/h** (`0.07 kg/h shown`). The ratio is **1.6×**, computed in the build.
- Power: **~3–6 kW** continuous, which a ridge-site solar array can supply (the hint corner).
- Melt: **~1,600 °C** (the hint corner).
- Run hours: **8,760 h a year**, against the rig's **9 h** (the lit-part legend key).
- Anode life: **~1,000 h**, which gives about **9 swaps a year** (computed; legend key).
- Binding gate: **capital** (caption).

Illustrative, not from the node: the layout, every dimension, the finned gas cooler, the compressor, the tank, the slag tray, the spare-anode cradles and the junction box. The 2025 systems study's vertical solar arrays support the mast design. The figure claims no numbers for any of these parts.

## Checks (all run on the final build)
- `node build.mjs`: clean. It prints `wrote lunar-o2.html, lunar-o2.svg, svg-test.html · 124 parts · 141 items · 4 routes · scale 1.630`.
- `node build.mjs --audit` puts every line at 0 and ends `audit passed`. Totals: 11 tubes · 116 solids · 141 items · 281 overlaps · 281 order rules.
- `lines.mjs lunar-o2.html --out shots/lines.png`: `line ends: 0 of 181 ends on 46 lines float`.
- `capture.mjs`, card and phone (390): console clean, no sideways scroll, readout `0.11 kg/h needed · 0.07 kg/h shown`.
- SVG on its own: shown as an `<img>` in `svg-test.html`, console clean, renders with the cyan lit vessel and the dark tokens. It has no scripts and no external refs (a grep for script, href, @import and url(http finds 0).
- 4× close-ups read: lid, vessel body, auger and hopper, gas train, box and mast base, tank top, plinth label, spare anodes.

## Known issues and choices
- `Fig 6` is a placeholder (the node is tier 6). Set it to the figure's number in the set.
- The part count is above the Figure range (see above).
- The lid feedthroughs have no visible leads. Power reaches the reactor through the junction box beside the skirt, which simplifies a real electrode bus.
- The hint corner normally uppercases; the page overrides that so `kW` keeps its case.
- The light theme was not built: the spec is dark only.

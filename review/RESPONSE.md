# Response to the 26 Oct 2026 review

Integration of [two-clocks-space-review-2026-10-26.md](two-clocks-space-review-2026-10-26.md) per [PRD-two-clocks-review-oct26.md](../PRD-two-clocks-review-oct26.md), 27 Oct 2026. Model: `model/graph-v9.json` (482 nodes, `meta.version` 9, `meta.launch_source` = Mach33 Launch Keystone v1.3). Page: `model/share/site/two-clocks.html`. Every page number comes from `model/share/data/facts.json`.

**Status key:** fixed · partly (what is missing is named) · deferred (with reason) · needs Alex.

## Findings

| ID | Sev | What changed | Where | Status |
|---|---|---|---|---|
| OC-1 | 🔴 | One satellite class: SpaceX's AI1 (Starmind program), 150 kW peak / 120 kW average, about 2.1 t. The 250 kW unit appears only as a later generation at S-1 density. | `build_page.py` COPY `materials-cots-orbital-compute-ops`; nodes `struct-gw-orbital-compute`, `materials-cots-orbital-compute-ops`, `struct-35-mw-class-compute-satellite`, `struct-35-10gw-orbital-compute` (`work/R9-2-orbital-compute.json`) | fixed |
| OC-2 | 🔴 | The card states payload per flight (60 to 90 t to SSO), peak and average power, about 6,700 AI1s (8,300 at average), 14,000 t and 155 to 235 flights per GW. The S-1 basis (10,000 t, 110 to 170 flights) is in the node and the doc. The caption explains that the Nov 2025 "100 GW" estimate counted array power. The page row of the review's OC-2 table now reads "Yes". | card copy; `struct-gw-orbital-compute.description`; `doc/branches/orbital-compute-power.md`; `doc/12-quotable.md` | fixed |
| OC-3 | 🔴 | Dawn-dusk SSO is named on the card, in the nodes and in the footer. Average power is quoted beside peak. The 1.5x SSO delivery placeholder (`ODC_HEO_LEO_X`) is flagged in `struct-gw-orbital-compute.why`. The footer credits the AI1 reconstruction (Jun 2026) by name and link. | card; footer; nodes | fixed (TODO(source): the 16 Oct orbit-ruling note is not in this repo) |
| OC-4 | 🔴 | We read the AI Compute Keystone's 1 GW crossing from `model_series.csv` (package downloaded from MCP model 62, read with `python3 -I`): **1.5 GW installed in 2028** in the base, air-pocket, disciplined-build and Jevons lenses, and **2029 in the cadence-bound lens**, reaching 437.9 GW by 2040. The tree's `odds_by.medium` for 1 GW in S2 is **2031**. The card and the branch text say the two measure different things (a modeled path, against the odds that a milestone has happened) and link the model. 1 GW was re-rated up: S2 is Medium from 2031 (was Low by 2031) and High from 2034; S3/S4 have earliest year 2030 and High from 2033. | card; `struct-gw-orbital-compute` | fixed |
| OC-5 | 🟡 | Caption line: launch cadence sets the date, and launch price barely moves the cost crossover. | card caption; node `gate_note` | fixed. The x1.5 statement is the AI Compute reviewer's model run; we did not re-run the downloaded package's code. |
| OC-6 | 🟢 | Cites the S-1's "as early as 2028" against the tree's 2029 earliest year, and links "Debunking the Cooling Constraint". | card caption; `materials-cots-orbital-compute-ops.why` | fixed |
| IC-1 | 🔴 | Hero: "1.6× faster new programs by 2031: a ceiling", with "1.5 to 1.7× in the central scenario" (Amdahl range computed in `build_facts.py` as `amdahl.hero_range`). Realized gains are labelled as realized ("about a third shorter by 2035"). Bridge chart is titled "Ceiling by 2035" and its note says "with robots". The Bridge text adds "By 2035, with robots, the ceiling on a new program rises to 2.3 to 3.7×." | `page.src.html` hero and bridge | fixed |
| IC-2 | 🔴 | The kicker makes one closing claim: capital and adoption gate the most outcomes, launch gates the space-specific ones, and an evidence rule is the lever policy can pull. "Biggest lever" is gone, and "That curve, not the math, sets the dates" is removed. | kicker | fixed |
| IC-3 | 🔴 | Root fix (WS1): odds are rated for every year. There is no checkpoint switch in the page, tree, viewer or doc. In S2 the largest one-year step is 26 points (thinking 2028 to 2029); there is no 2032 jump, and hardware rises 39 → 47 → 57 → 58% over 2032 to 2035. The peak callout is recomputed (S2: 2030, 54 pts). Plateau's widest gap is 2034, so its second card shows 2035. The rule `second_stat` guarantees the two cards never repeat a year. | `tools/apply_edits.py`, `tools/derive_odds.py`, `build_facts.py`, `tree.js`, `page.src.html`, `doc/04-two-clocks.md` | fixed |
| IC-4 | 🟡 | The rule is written in `doc/02-method.md` "Binding gates": the binding gate is the gate whose removal moves the S2 earliest year most, ties go later in the physical chain, and each node from tier 5 up carries `runner_up_gate` and `gate_note` (all 482 do). Thinking binds 0 of 168 outcomes and is the runner-up for 21. The page says so and reconciles "a third of the path" with "binds none". | method doc; bottleneck section; `analytics.py` `gates_t67`; `facts.outcome_gates.runner_up_thinking` | fixed |
| IC-5 | 🟡 | Footer excepts the Raptor ("It shows a real engine, the Raptor 2"). The tree caption separates unlit-at-2035 milestones (97) from those dated after 2035 (20 of 21 hardware). The "another cut" line names its subsets (tiers 1 to 3, tiers 5 and 6) and is computed from `facts.proved_vs_flown` (155 is correct; the review's 156 was off by one). Vocabulary: "milestone", with "thinking"/"hardware", throughout the tree and caption. "End of the decade" → "by 2035". | caption, `tree.js`, `tree.html`, gap note | fixed |
| LK-1 | 🔴 | Pinned to **Launch Keystone v1.3** (Alex's decision, 27 Oct; v1.4 differs only slightly): `meta.launch_source`, v1.3 figures in every launch anchor's `why`, the footer names v1.3 and both post dates, and `doc/12-quotable.md` rows carry post date and basis (internal cost, spot price, realized price). Wave-45 deltas are recorded as a sensitivity only (`physclock-cheap-mass-customer.why`, `doc/04-two-clocks.md`). | `work/R9-1-launch.json`; footer; doc | fixed |
| LK-2 | 🟡 | The gate is split into `launch-internal` (23 nodes) and `launch-external` (22 nodes), table below. New tier-6 node `physclock-customer-launch-access`: Medium from 2031 (v1.3 opening year), High from 2033 (end of the tested range). The trajectories card gets the rideshare closure and "slip months to years"; the kicker names it. The trajectories wonder moves from High by 2029 to Medium from 2031 (earliest year 2030 in S2). | nodes; card; kicker; bottleneck chart (two rows) | fixed (TODO(source): SpaceNews link) |
| LK-3 | 🟡 | Refuelling card restated in the 30× → 7× tankers-per-delivered-load framing. | card copy | partly: TODO(source), MOONCITY reference not on the MCP |
| LK-4 | 🟢 | Every $/kg on the page and in the quotable rows says internal cost delivered, spot price or realized price, in 2026 dollars. There are no 2040 prices or p95 masses on the page (437.9 GW by 2040 is a compute path, labelled as such). | doc 04, 12; footer | fixed |
| LK-5 | 🟢 | "AI math saves 2–9% of launched mass" is off the card. It stays in the node and quotable row, marked as not a launch-market driver. | card; `doc/12-quotable.md` | fixed |
| CK-1 | 🟡 | Three nodes in `networks`: `comms-d2c-v2-service` (tier 6; 2028, Medium from 2029), `comms-d2c-v3` (tier 6; 2030, Medium from 2031, launch-internal) and `comms-starlink-mobile` (tier 7; 100M monthly users, 2029, Medium from 2030). Status lines come from the MCP (650 D2C satellites, 22M users and 36 operators, the Oct spectrum items). | `work/R9-3-d2c.json`; `doc/branches/networks.md` | partly: dates follow public windows with TODO(source) until the Connectivity Keystone supplies its own |
| CK-2 | 🟡 | Node retitled "Software adds 10%+ capacity per satellite at fixed spectrum". The description counts sellable capacity, not traffic. The `why` checks utilisation against the keystone evidence base (5,436 Tbps sellable against 590 Tbps used in 2030). | `comms-capacity-per-dollar-share` | fixed |
| CK-3 | 🟢 | The branch narrative and footer link the Connectivity Keystone research (post 154); the orbital compute card and branch link the AI Compute model. | networks.md; card; footer | partly: the Connectivity Keystone model page is not yet released (TODO(source)) |
| CK-4 | 🟢 | "Base case" → "central scenario" on the page, tree, kit, viewer chrome, doc prose and branch theses and hooks (`work/R9-5-copy.json`). Kept where it names a Mach33 keystone's own base case, in archived debate records, and in node-level `why` text (much of which quotes Mach33 base cases). | page, `tree.js`, `build_kit.py`, `build_viewer.py`, doc | fixed |
| FR-1 | 🔴 | The page speaks as Mach33: "We built the Space Unlock Tree", and links the 27 Oct brief (post 160). | footer, lede | fixed |
| FR-2 | 🔴 | Cited in place: $200 to $2,000 (The Decoder); unverified results ("agent-written and unchecked by outsiders, the lowest of our trust tiers", linked to the release); 0.07 kg/h rig (ICES 2026 DOI). The release is named in words with a link. | lede; lunar oxygen card | fixed |
| FR-3 | 🟡 | Hero row "Hardware milestones unlocked by 2035": Plateau 37%, Exponential 58%, Recursive 69%, Embodied 74% (from `facts.clock_curve`). The bottleneck text pairs the 1.2 to 1.7 years (recomputed from tiers 6 and 7, was 1.3 to 1.8) with the shares. | hero; bottleneck | fixed |
| FR-4 | 🟡 | New "For investors" section: what capital can buy down, what it cannot, who sits on the hardware clock, and what to watch 2027 to 2029 (from `doc/10-signposts.md` and v1.3). | `page.src.html#investors` | fixed |
| FR-5 | 🟢 | The kicker gives Mars its own sentence (windows 2031, 2033, 2035; a missed window costs two years). | kicker | fixed |
| FR-6 | 🟢 | Added the line "One milestone moves the thinking share by 0.4 points and the hardware share by 0.4" (`facts.one_node_pts`). | gap note | fixed |
| FR-7 | 🟢 | Subtitle under the hero tree: a turn is one year; hexagons, squares and diamonds (matches `tree.js` marks). The tree live line also says "one turn is one year". | hero; `tree.js` | fixed |
| FR-8 | 🟢 | Robots card ends "The odds include a faster robot rollout, so a robot milestone can arrive before its listed year." | card copy | fixed |
| IN-1 | 🔴 | "Raptor illustration: Ryan, MIT license." No tooling names on the page. | card credit; footer | fixed |
| IN-2 | 🟡 | "OpenAI's October 2026 mathematics release", linked. | lede; footer | fixed (needs Alex: the release's exact public title, if it has one beyond the repository) |
| IN-3 | 🟢 | Caption: "One dot per operational system or strategic outcome". | bottleneck note | fixed |
| IN-4 | 🟢 | Not changed. | artifact sharing | needs Alex: should the artifact link stay open? The brief is public, so this is only about the link. |
| VI-1 | 🟡 | Tokens from the review's Brand MCP reading: Black Space `#030911` page, Mission White `#FAFEFF` text, Orbital Signal Blue `#1C79D6` for buttons and focus, data blue `#5B9FE2` for the thinking clock and lit parts. `#22CFFF` is gone from the page, tree, kit and all six figure SVGs (one `--anatomy-lit` token each). `FIGURE-SPEC.md` is updated. | `page.src.html`, `tree.css`, `tree.html`, `build_kit.py`, `figs/*/*.svg`, `FIGURE-SPEC.md` | partly: TODO(source), confirm against `get_brand_tokens` (the Brand MCP is not connected here) |
| VI-2 | 🟢 | Role colours: ODC blue top rule on the orbital compute card; lunar-Mars red (`#902005`) on the refuelling and lunar oxygen cards. No Starlink card on the page, so green is defined but unused. | card CSS | fixed |
| VI-3 | 🟡 | Hanken Grotesk stays as a stand-in. | `page.src.html` head | needs Alex: Mach 33 Grotesk woff2 (TODO(source)) |
| VI-4 | 🟢 | Wordmark slot marked in the header. | hero eyebrow | needs Alex: white wordmark SVG (TODO(source)) |
| VI-5 | 🟡 | Tested the lunar oxygen card at 375 px on a cold load (headless Chrome, fresh profile): the illustration renders. `fig_file()` copies the SVG only above 2,000 bytes; the file is well above that. Not reproduced. | `shots/review3/m-card-lunar-o2-coldload.png` | fixed (not reproduced) |
| ST-1 | 🟡 | "to" in every range in prose, and also in the display numerals ("5 to 10×", "$5 to 20"), pending Aaron's call. No en-dash ranges remain in the page, tree, kit or card copy. | page, COPY, kit | partly: Aaron's hyphen-or-"to" ruling for display numerals pending |
| ST-2 | 🟡 | The headline stays as the logged exception. Rewritten: "a ceiling, not a forecast", "the earliest credible year, not a forecast", "analyst judgments, not computed probabilities", "launch, not labor", "That curve, not the math", "not any company's design". | page | fixed |
| ST-3 | 🟡 | "We assign each … binding gate"; "the date depends on funding…"; "The rest depends on SpaceX's cadence and reuse"; "That curve… sets the dates" removed. "Launch cadence sets the date" stays once in the compute caption as the OC-5 claim. | page | fixed |
| ST-4 | 🟡 | "license", "metric ton". | footer; lunar oxygen card | fixed |
| ST-5 | 🟢 | Cut "only about 3.5×", "only 1.1 to 1.5×", "almost never", "still pulls" and "directly". | page | fixed |
| ST-6 | 🟢 | "its launches rose about 3.5× by 2025 (6 to 21)". | robots card | fixed |
| MO-1 | 🟡 | Sticky year row at phone width, measured pinned at top 0 while the tree scrolls past. A "Later years →" cue shortens to "→" once scrolled. | `tree.js`, `tree.css`, `tree.html` | fixed |
| MO-2 | 🟡 | Phone toast is slim (no pictures, about 150 px). Wonder labels try six positions, avoid lane names and the visible edges, and hide when their wonder is scrolled out of view. Odds rows stack on the cards below 760 px. | `tree.js`, `tree.css`, `page.src.html` | fixed |
| MO-3 | 🟢 | Caption and hint say "Tap or hover"; legend unchanged. | `build_page.py` caption, `tree.js` | fixed |
| MO-4 | 🟢 | Revisits start at 2035 with no autoplay (`localStorage`, try/catch), plus a "Skip to 2035" button. | `tree.js`, `tree.html` | fixed |
| MO-5 | 🟢 | Tooltips carry the full first sentence; no ellipsis. | `build_tree.py` | fixed |
| MO-6 | 🟢 | Tested End turn, Play/Pause, Skip and wonder-to-card at desktop (1024 px) and 375 px, plus the touch sheet's "See its card". All pass. Smooth scroll can be dropped (seen in the background browser pane), so the jump now falls back to an instant scroll. | `shots/review3/` | fixed |
| §10 | ⚪ | Arithmetic re-verified on v9, table below. | | fixed |

## Launch gate split (45 nodes from v8)

"Edge" means the node now has `physclock-customer-launch-access` as a hard prerequisite. Four tier-6 external nodes take no edge because their launches are contracted on non-SpaceX vehicles: `astro-adr-large-object-removed` (ADRAS-J2; ClearSpace-1 on Vega-C), `science-35-lisa-launch` and `science-lisa-precision-science` (Ariane 6), and `plasma-side-view-monitors` (Vigil on Ariane 6). Each says so in its revision note and `gate_note`. That is the one exception to "every `launch-external` tier 6–7 node has a hard path to customer-price access". Tier-5 external demos take no edge either: they are single flights mostly manifested before the closure. The exception is `hyper-thinner-tps-flown`, whose Varda flights ride Transporter. One new node is also launch-internal (`comms-d2c-v3`).

| Node | Tier | Title | Gate | Edge |
|---|---|---|---|---|
| `verif-mission-loss-rate` | 7 | Fewer missions lost to software logic (hard to see by 2031) | launch-external | yes |
| `astro-35-lunar-nav-certified-service` | 6 | Lunar navigation with proven error bounds in routine use | launch-external | yes |
| `astro-adr-large-object-removed` | 6 | First large debris object removed from orbit | launch-external |  |
| `astro-ai-designed-trajectory-flown` | 6 | Missions fly AI-designed trajectories | launch-external | yes |
| `astro-leo-pnt-assured-service` | 6 | Low-orbit navigation service with published error bounds | launch-external | yes |
| `comms-35-certified-shell-in-service` | 6 | Constellation designed with certified tools enters service | launch-external | yes |
| `plasma-side-view-monitors` | 6 | Side-view and upstream solar-wind monitoring | launch-external |  |
| `robo-in-space-assembly` | 6 | Robots assemble large structures in orbit at scale | launch-external | yes |
| `science-35-lisa-launch` | 6 | LISA launches | launch-external |  |
| `science-lisa-precision-science` | 6 | LISA does precision strong-gravity science from day one | launch-external |  |
| `struct-fsp-lunar-100kwe` | 6 | A 100 kW-electric fission reactor operating on the Moon | launch-external | yes |
| `astro-autonomous-nav-demo` | 5 | Autonomous Earth-Moon navigation with proven error bounds | launch-external |  |
| `auton-assembly-flight-demo` | 5 | Robotic assembly in space with certified skills | launch-external |  |
| `auton-icy-regolith-ground-truth` | 5 | First measurements of how hard polar ice is to dig | launch-external |  |
| `auton-lunar-o2-flight-demo` | 5 | First oxygen made on the Moon | launch-external |  |
| `auton-robotic-landing-pad` | 5 | First robot-built landing pad or blast berm on the Moon | launch-external |  |
| `auton-verified-autonomy-lunar-flight` | 5 | A lunar robot operates with proof-checked autonomy | launch-external |  |
| `comms-pq-ttc-flight-demo` | 5 | Flight demo of verified post-quantum command links | launch-external |  |
| `comms-space-qkd-network-demo` | 5 | Multi-node satellite quantum-key demonstrations | launch-external |  |
| `hyper-thinner-tps-flown` | 5 | Flown heat shield sized with reduced, model-based margins | launch-external | yes |
| `prop-loxsat-cfm-flight-data` | 5 | Public flight data on storing cryogenic propellant in orbit | launch-external |  |
| `verif-rpo-assured-autonomy` | 5 | Proof-checked autonomous docking, servicing and refueling | launch-external |  |
| `auton-mars-architecture-close` | 7 | Mars outpost logistics cut by local resources and recycling | launch-internal |  |
| `capability-35-internal-cost-100` | 7 | Starship internal cost under $100 per kg | launch-internal |  |
| `physclock-cheap-mass-internal` | 7 | Starship internal cost under $300 per kg | launch-internal |  |
| `prop-35-mars-window-fueling` | 7 | Tankers fuel five Mars ships for one window | launch-internal |  |
| `prop-cislunar-propellant-economy` | 7 | Routine orbital refueling economy | launch-internal |  |
| `struct-35-10gw-orbital-compute` | 7 | 10 GW of compute operating in orbit | launch-internal |  |
| `struct-gw-orbital-compute` | 7 | 1 GW of compute operating in orbit | launch-internal |  |
| `auton-35-lunar-cargo-cadence` | 6 | Ten heavy cargo landings on the Moon in one year | launch-internal |  |
| `auton-35-mars-robot-site-prep` | 6 | Robots prepare a Mars landing site and power | launch-internal |  |
| `auton-lunar-heavy-cargo-landing` | 6 | Heavy cargo landed on the Moon | launch-internal |  |
| `auton-mars-propellant-plant` | 6 | Starship-scale propellant plant on Mars | launch-internal |  |
| `hyper-35-crewed-ship-reentry` | 6 | People return from orbit on a reusable ship | launch-internal |  |
| `hyper-35-mars-pinpoint-landing` | 6 | Second heavy Mars lander lands within 1 km of the first | launch-internal |  |
| `hyper-mars-heavy-landing` | 6 | First landing of 20 t or more on Mars | launch-internal |  |
| `materials-cots-orbital-compute-ops` | 6 | Commercial AI chips running in orbit at scale | launch-internal |  |
| `prop-35-lunar-lander-reuse` | 6 | One lunar lander makes three landings, refueled in space | launch-internal |  |
| `prop-hls-refuel-campaign` | 6 | Full lunar-lander refueling campaign | launch-internal |  |
| `robo-lunar-construction` | 6 | Robots build lunar pads, berms and roads at outpost scale | launch-internal |  |
| `auton-mars-isru-demo` | 5 | Kilogram-per-hour propellant production on Mars | launch-internal |  |
| `hyper-rapid-reuse-heatshield` | 5 | Rapidly reusable orbital heat shield (ship scale) | launch-internal |  |
| `prop-ship-transfer-demo` | 5 | Ship-to-ship cryogenic transfer demonstrated | launch-internal |  |
| `verif-35-mars-verified-landing` | 5 | A Mars lander flies proof-checked landing and fault logic | launch-internal |  |
| `hyper-flight-data-pipeline` | 0 | High-cadence instrumented reentry flights | launch-internal |  |
## Section 10 arithmetic, re-verified on v9 (central scenario unless stated)

| Claim on the page | Check | v8 | v9 |
|---|---|---|---|
| Milestones | thinking + hardware | 478 = 250 + 228 | **482 = 250 + 232** (4 new: 3 direct-to-cell, 1 customer access) |
| Branches | rows in the tree | 13 | 13 |
| 2029 | thinking / hardware unlocked | 75% / 22% (188/250, 51/228) | **54% / 8%** (135/250, 18/232) |
| 2030 (widest gap) | | 83% / 29% (207/250, 67/228) | **75% / 21%** (187/250, 48/232), gap 54 pts |
| 2035 | | 93% / 57% (233/250, 131/228) | **93% / 58%** (233/250, 135/232) |
| Outcomes and gates | sum of gate rows | 164 = 34+33+29+19+18+13+12+6 | **168 = 36+34+19+19+18+13+12+11+6** (adoption, capital, regulatory, launch-internal, qualification, fabrication, data, launch-external, experiment); thinking binds 0, runner-up for 21 |
| Hardware unlocked by 2035, four scenarios | | 35 / 57 / 69 / 74% | **37 / 58 / 69 / 74%** |
| Hero ceiling | Amdahl, thinking 35% of path at 5 to 10×, rest 1.1 to 1.2× | "1.6× at most" | **1.6× (1.5 to 1.7×), a ceiling** |
| 15 to 120× cheaper code | $300/$20 and $600/$5 | pass | pass |
| Satellites per GW | 1 GW / 150 kW peak; / 120 kW average | 4,000 at 250 kW | **6,667 ≈ 6,700; 8,333 ≈ 8,300** |
| Tonnes per GW | 6,667 × 2.1 t | 16,000 to 18,000 | **14,000** (10,000 at 100 kW/t) |
| Flights per GW | 14,000 / 90 to 14,000 / 60 | 110 to 180 | **156 to 233 ≈ 155 to 235** (111 to 167 ≈ 110 to 170 at S-1 density) |
| A metric ton of lunar oxygen a year | 1,000 / 8,760 | 0.114 kg/h | unchanged |
| Anode swaps a year | 8,760 / 1,000 | about 9 | unchanged |
| Failure-free starts | ln(0.1) / ln(0.99) | 229.1 | unchanged |
| Program ceilings 2035 | 1 / (1 − share shorter) | 2.3 to 3.7× | unchanged |
| Outcome pull-forward, Plateau → Exponential | mean year shift, tiers 6 and 7 | 1.3 to 1.8 years | **1.2 to 1.7 years** |
| One milestone's weight | 100/250, 100/232 | — | **0.4 pts each** |

The public brief (post 160) quotes "478 milestones in 13 branches". With v9 it should read 482; the brief and the page must be re-synced (Alex or the publishing team).

## TODO(source) markers, all needing Alex or another Mach33 source

| Marker | Where | Needs |
|---|---|---|
| SpaceNews rideshare closure link (late June 2026) | `physclock-customer-launch-access.status_oct2026`; `astro-ai-designed-trajectory-flown.why`; trajectories card (HTML comment) | the SpaceNews URL from `launch-monthly-research-handoff.md` |
| MOONCITY tanker ratio (30× → 7×) | refuelling card (HTML comment) | the MOONCITY reference, or drop the framing |
| AI Compute Keystone SSO re-base and 16 Oct orbit ruling | `struct-gw-orbital-compute.why` | `claude/note-for-ai-compute-keystone-orbit-1016.md` |
| Connectivity Keystone D2C dates, odds and user path | `comms-d2c-v2-service`, `comms-d2c-v3`, `comms-starlink-mobile`; `doc/branches/networks.md` | keystone release or the team's figures |
| Connectivity Keystone model page | `work/R9-3-d2c.json` (`link`), networks narrative | URL once released |
| Brand tokens, Mach 33 Grotesk woff2, wordmark SVG | `page.src.html` head and header (HTML comments) | Brand MCP `get_brand_tokens` (brand version 23 Oct 2026) |

## Open questions for Alex (PRD section 6, updated)

1. **IN-4:** should the page artifact stay open to anyone with the link?
2. **ST-1:** Aaron's ruling on hyphen or "to" in display numerals. The page uses "to" everywhere for now.
3. **OC-2 / PRD Q4:** we name the 250 kW unit as a later generation at S-1 density, not AI1. `capability-compute-launch-demand.status_oct2026` still records SpaceX's Aug 2026 product page at 175 kW average / 250 kW peak; if that page described AI1 itself, the AI1 reconstruction and the product page disagree and the card should say which it rates.
4. **Binding-gate labels flagged by reviewers, not changed:** `prop-rde-flight-demo` (qualification; its text says customer and money bind), `verif-onboard-optimizer-certificates` (formalization; text says timing characterisation and HIL qualification bind), `physclock-ai-mishap-analysis` (experiment; text calls diagnosis cognitive), `science-coronal-heating-theory` (data; text says theory binds once data exist). One label was changed: `plasma-eruption-onset-theory` data → cognitive, with data as runner-up.
5. The public brief's milestone count (478 → 482) and any figures it quotes from v8.

## Acceptance criteria (PRD section 5)

- [x] `graph-v9.json` passes `apply_edits.py check` with zero findings (also `--against graph-v8.json`); `meta.version` 9; `meta.launch_source` names v1.3.
- [x] Every node has `odds_by` (all four scenarios, `odds_source: review` on all 482), `band_by_year`, `runner_up_gate` and `gate_note` (all nodes, not only tiers 5–7). Four nodes changed a checkpoint band against v8 (`astro-ai-designed-trajectory-flown`, `hyper-thinner-tps-flown`, `struct-100kw-per-tonne-fleet`, `struct-gw-orbital-compute`); each has an R9 `revisions[]` entry.
- [x] No node carries `binding_gate: launch`; the two launch values appear in the bottleneck chart, the viewer (gate badge, glossary) and the method text.
- [~] The three D2C nodes exist in `networks` with sources; their dates are public-window placeholders with TODO(source) until the Connectivity Keystone supplies dates.
- [x] `facts.json` regenerated, and every page number comes from it, including the hero range, scenario row, "another cut" subsets, pull-forward years, evidence-rule years and card odds via `{ob:…}`. No checkpoint note and no 2032 step; the two stat cards never share a year.
- [x] The orbital compute card names one generation (AI1), the orbit (dawn-dusk SSO), payload per flight, peak and average power, and bridges to the AI Compute model.
- [x] Hero, bridge chart and realized figures each carry one labelled frame; the kicker makes one closing claim.
- [x] No internal tooling names on the page; the three hook figures are cited; the author is named ("we", Mach33); the Launch Keystone version is named.
- [~] Brand: colour tokens applied from the review's Brand MCP reading, and `FIGURE-SPEC.md` updated. Fonts and wordmark await the Brand MCP (TODO(source)).
- [x] Style sweep: no en-dash ranges in page prose, the listed contrasts rewritten (headline excepted), US English.
- [x] 375 px pass: sticky year row, labels kept off the edges and lane names, slim toast, stacked odds rows; End turn, Play, Skip and wonder-jump tested; screenshots in `model/share/shots/review3/`.
- [x] Kit PNGs regenerated; both MP4s regenerated (the hero changed).
- [x] This file covers every finding ID.
- [~] `Space Unlock Tree - model.md` and the viewer are rebuilt from v9. **Not republished at the existing URLs:** both CDb9dUrYcXHCHRjztx2wVy (page) and 1ppfto5R4NFusiEDjWiFvB (viewer) belong to an account outside the one this session runs as (alex.darvishian@gmail.com sees them as public or shared, with no edit access), so the tool refused to update them. The v9 builds are published as separate private artifacts: page https://claude.ai/artifact/XezndTCNwFEz3iwzEcVGya, viewer https://claude.ai/artifact/WzFYYjTtBtkpk9VeFgSWzS. To keep the public URLs, the owning account republishes `model/share/site/two-clocks.html` (with `figs/*`) and `model/viewer/space-unlock-tree.html` to them. The page's 'Explore the full tree' link still points to the existing viewer URL.

## How the per-year odds were set

`tools/derive_odds.py` seeded `odds_by` from the v8 checkpoints (reproducing every v8 band). Seven parallel branch reviews then replaced every value with a judgment, using the skeptic/advocate/resolver pattern on contested nodes, and recorded the reasons under `R9-odds` in each node's `revision_note`. Their files are `model/work/R9-4-odds-<branch>.json`. The checker now also enforces that a node is never likelier by a year than any hard prerequisite. On the final apply, autofix raised one value: `plasma-stellarator-design-loop` S1 Medium from 2030 to 2031, with no band change.

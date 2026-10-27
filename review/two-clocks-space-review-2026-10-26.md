# Two Clocks of Space: Combined Review

**Page:** https://claude.ai/artifact/CDb9dUrYcXHCHRjztx2wVy (rendered version, 26 Oct 2026)
**Combines three reviews:**
- **[A] Launch Keystone review:** checked against Launch Keystone v1.4 (wave 45), the Charter v3 principles and the launch rulings.
- **[B] AI Compute review:** checked against the AI Compute Keystone rulings, the publication rules, the Brand MCP and published Mach33 research.
- **[C] Connectivity Keystone review:** checked against the AI1 reconstruction, the Launch Keystone post, the Brand MCP and the Connectivity Keystone conventions. This pass also hovered nodes in the tree, opened the full scenario table and loaded the page at 375 px.

**Severity** (mach33-audit scale):
- 🔴 must fix before publication
- 🟡 should fix
- 🟢 soft flag
- ⚪ verified clean

Each finding notes which reviews raised it. Where the reviews disagreed, the resolution is stated.

---

## Verdict

All three reviews reach the same verdict. The thesis is sharp: AI speeds up the thinking part of a hardware program, while launch, capital, adoption and qualification set the dates. The unlock tree and the seven wonder cards make that concrete, and nearly all the arithmetic holds.

Four things stand between the page and publication:

1. **Orbital compute card.** Its satellite class contradicts itself, it names no orbit, and it doesn't say how it relates to Mach33's published orbital compute work.
2. **Headline numbers.** Several headline figures disagree with each other: the speed-up figures, the "biggest lever" claims, and the gap chart's shape.
3. **Provenance.** The launch inputs Mach33 supplied need pinning to Launch Keystone v1.4, and the page has to say clearly whose model this is.
4. **Reader-facing text.** Internal tooling names show on the page, and the house style pass hasn't been run.

None of this needs a rebuild. It is mostly copy, one chart change, a card reconciliation and a brand pass.

---

## 1. Orbital compute card

### OC-1 🔴 Satellite class contradicts itself [A, B, C]

The card opens with "100 kW-class satellites with paying customers", then sizes a gigawatt at "about 4,000 satellites at their 250 kW peak rating". Pick one class, or say that the 100 kW class comes first and 250 kW units follow.

### OC-2 🔴 State the per-flight basis and the satellite generation [A, B, C]

The three reviews tested the gigawatt sizing against different references. Read together, the page's figure holds, but only on one basis, and the page doesn't state it.

| Reference | Power per tonne | Tonnes per GW | MW per Starship flight | Fits the page? |
|---|---|---|---|---|
| Page: 4,000 satellites, 110 to 180 flights | Not stated | Not stated | 5.6 to 9.1 | |
| SpaceX S-1 (over 100 kW per tonne) [A] | 100 kW/t | about 10,000 | 6 to 9 at 60 to 90 t a flight | Yes |
| Mach33 AI1 reconstruction, Jun 2026 [C] | 71 kW/t peak (150 kW, 2.1 t) | about 14,000 | about 7 at 100 t | Close |
| "Inside Musk's Plan for 100 GW", Nov 2025 [B] | Solar array at 0.8 kW/kg | n/a | about 80 (1,200 launches per 100 GW) | No |

Resolution:

- The page agrees with the S-1 and with the newer AI1 work. The Nov 2025 figure is the outlier: it ran on solar-array specific power, not whole-satellite mass, and predates the AI1 disclosure.
- The 250 kW unit is not AI1. At S-1 density it is a satellite of about 2.5 t, which gives 22 to 36 satellites a flight at 56 to 91 t a flight.
- At AI1 specs (150 kW peak, 120 kW average), a gigawatt takes about 6,700 satellites at peak, or about 8,300 at average.

Fix:

- State the per-flight payload and orbit on the card, for example "about 60 to 90 t a flight to sun-synchronous orbit".
- Name the 250 kW unit as a later generation at S-1 density, and say AI1 is 150 kW.
- Add one line saying the Nov 2025 figure counted array power, not whole-satellite mass, so readers don't see two Mach33 numbers that disagree.

### OC-3 🔴 Orbit basis [A, B]

The 16 Oct ruling put orbital compute in sun-synchronous orbit (SSO), and post 55 and its sibling model need re-basing from high Earth orbit (HEO). The card names no orbit.

- [B] argued that a "peak" rating doesn't fit dawn-dusk SSO. **Resolution:** our own AI1 piece reports AI1 in dawn-dusk SSO with a 150 kW peak and a 120 kW average, and says the gap is unexplained. So "peak" is defensible.
- Fix: name SSO on the card, and quote average as well as peak power.
- [A]: flag that the figure rests on the 1.5x SSO delivery placeholder (`ODC_HEO_LEO_X`) while the AI Compute Keystone's SSO re-base is still open (W45 open item 5).
- Confirm the "orbital compute satellite reconstruction" in the footer is the AI1 or SSO work, not the HEO-era work.

### OC-4 🔴 Milestone odds against the AI Compute model path [B]

The card rates 1 GW in orbit "Low by 2031, Medium by 2035". [B] reports the AI Compute model's X card 05 at 437.9 GW of orbital compute by 2040. [C] did not re-check that figure.

Milestone odds and a model path measure different things, but the page never says so, so it reads as Mach33 undercutting its own thesis. Fix: one bridging sentence plus a link to the AI Compute model.

### OC-5 🟡 Cadence sets the date, price does not move the crossover [B]

The AI Compute model finds that launch price barely moves the cost crossover (x1.5 has no effect). This page says launch is the gate for orbital compute. Both hold, because here the constraint is cadence. Fix: one caption line saying launch cadence sets the date, while launch price does not move the crossover.

### OC-6 🟢 Earliest 2029 date [A, B]

"Earliest 2029" sits a year after the S-1's "as early as 2028" deployment start. That is consistent; cite it. [B] also notes the 100 kW class matches "Debunking the Cooling Constraint", so link that post too.

---

## 2. Internal contradictions

### IC-1 🔴 Four speed-up figures, and the hero cap sits below its own math [A, B, C]

| Where | Figure |
|---|---|
| Hero | 1.6x faster new programs by 2031, "at most" |
| Bridge text | Without robots, AI trims programs 1.1 to 1.5x |
| Bridge chart | Ceilings of 2.3x to 3.7x by 2035 |
| Bridge chart note | Realised gains "a third shorter" by 2035 (about 1.5x) |

Amdahl on the hero's inputs (thinking is a third of the critical path at 5 to 10x faster, hardware gains 10 to 20%) [A, B]:

| Inputs | Speed-up |
|---|---|
| 5x and 10% | 1.5x |
| 7.5x and 15% | 1.6x |
| 10x and 20% | 1.7x |

So 1.6x is the midpoint, not "at most".

Fix:

- Choose one frame for the hero: ceiling or realised, one year, one scenario.
- Write "1.5 to 1.7x" if it stays a ceiling.
- Label the other three figures in the same terms.
- Add one clause in the Bridge section, for example "by 2035, with robots, the ceiling rises to 2.3 to 3.7x".

### IC-2 🔴 Three different "biggest levers" [A, B]

- The bottleneck chart ranks capital first (34 of 164 outcomes), adoption second (33), launch third (29) and regulators fourth (19).
- The kicker says the launch-cost curve "sets the dates".
- The next sentence calls an evidence rule for AI-made analysis "the biggest lever on the hardware clock".

Fix: pick one closing claim, or rank the three in one sentence. For example: capital and adoption gate the most outcomes, launch gates the space-specific ones, and the evidence rule is the lever policy can pull. If "biggest lever" stays, define it (years saved per unit of change) and show the figure.

### IC-3 🔴 The gap chart's shape comes from the rating method [A, B, C]

The page's own note says most of the 2032 step comes from switching the checkpoint from end-2031 to end-2035. The same switch flattens every scenario from 2033 to 2035. It also shapes the "widest gap, 54 pts in 2030" callout, because the gap narrows when hardware jumps at the switch. Measurement comes before assertion (Charter Principle 9), so a headline should not rest on this artefact.

Fix: rate odds every year, or plot each checkpoint as its own series, or mark the switch with a dashed line and drop the 2030 peak callout.

[C] also found that in the Plateau view the widest gap falls in 2033, so both stat cards show the same "76% vs 35%". Swap in a different second card when the years match.

### IC-4 🟡 "Thinking binds none of them" can read as circular [A, B, C]

If thinking is assumed cheap in every scenario, it can never be the slowest gate, so the zero can look built in. The hero also says thinking is a third of the critical path, and a reader will ask how a third of the path binds nothing.

Fix:

- One line on the test for "binding", for example the gate whose removal moves the outcome's year the most.
- One line reconciling "a third of the path" with "binds none".
- [C]: show how many outcomes have thinking as the second-tightest gate. That turns the claim into evidence.

### IC-5 🟡 Smaller inconsistencies [A, C]

- **Engines card [A]:** the caption names a specific Raptor engine, while the footer says the machines are "illustrative members of their class, not any company's design". **Version:** [A] read "Raptor 3"; [B] and [C] both read "Raptor 2" on the rendered page, at desktop and at phone width. Use whichever is correct, but the conflict with the footer stands either way.
- **Waiting counts [A]:** the tree's status line says 97 hardware techs still wait at 2035; the body says "20 of the 21 techs pushed past 2035 are hardware". These count different things (unreached against rated past 2035). Name the difference.
- **Denominators [C]:** the table note says "122 of 156 math and physics-model milestones" and "44 of 167 validated technologies", while the rest of the page uses 250 and 228. Name the subsets or drop the line.
- **Vocabulary [C]:** the page uses tech, milestone, outcome, unlock and wonder for overlapping things. The tree caption says "research techs" and "build techs"; the chart says "thinking milestones" and "hardware milestones". Pick one pair.
- **Time frame [B]:** the 2035 stat says "Hardware is still behind at the end of the decade". Write "by 2035".

---

## 3. Launch Keystone ties [A]

The footer says Mach33 supplied the launch-cost curve, the orbital compute reconstruction and several cadence figures. That makes the page a downstream reader of our models, so it inherits our rulings.

### LK-1 🔴 Pin the launch inputs to v1.4 [A, B, C]

Wave 45 (ratified 21 Oct) moved the near term:

- The price hinge moved from 2031 to 2030, and has passed by 2030 in 53% of worlds (was 20%).
- Starship entry-year internal cost rose from $412/kg to $677/kg.
- External revenue in 2030 fell from a median of $28.5B to $12.6B.
- Open item: the engine flies 9.1 Starships in 2026 against about 4 to 5 flown.

The three "waits on launch" cards dated 2029 and 2030 (trajectories, orbital compute, refuelling) depend on these numbers.

- Confirm the supplied curve postdates v1.4, and name the Launch Keystone as the source in the footer.
- The June 2026 GigaModel is out of date and must not be the source.
- The client package copy that the mach33-model-lookup skill reads still says v1.3 (W45 open item 7). Any figure pulled that way today would be pre-W45.

### LK-2 🟡 Internal-first framing on the launch gate

Our thesis is that cheap launch reaches SpaceX's own programs first, and the external market is what remains after SpaceX's internal allocation. The page treats launch as one gate for everyone. A non-SpaceX orbital compute operator or lunar cargo customer faces a later, costlier gate.

The strongest public evidence: in late June 2026 at least nine SpaceX partners and customers told SpaceNews that new Transporter and Bandwagon bookings beyond late 2028 or early 2029 are closed.

Fix: add a sentence to the trajectories card ("small lunar missions slip months to years") and one to the kicker naming the rideshare closure.

### LK-3 🟡 Refuelling card

"More than 10 tanker flights" holds under the MOONCITY scope, which models tankers as a falling ratio: 30x launched-per-delivered early, falling to 7x at maturity. If the page cites Mach33, match that framing.

### LK-4 🟢 Price discipline

If the page or the full tree quotes any $/kg:

- State purchased or delivered (PRICE-01).
- Quote any 2040 price as the two conditional bands (TAIL-01).
- Quote 2040 mass as a median with its band, never a p95 (W45 docket 10).

### LK-5 🟢 Mass saving

"AI math saves 2 to 9% of launched mass" is small against the open MASS-01 gap (642 t booked in 2026 against 413 t on trend). Don't present it as a launch-market driver.

---

## 4. Connectivity Keystone ties [C]

The "Links and spectrum" branch holds these hardware milestones:

| Milestone | Earliest | Odds 2031 / 2035 | Waits on |
|---|---|---|---|
| Weather-robust optical ground network service | 2030 | Medium / Medium | capital |
| Software adds 10%+ capacity on the same hardware | 2030 | Low / Medium | adoption |
| Machine-checked crypto becomes a procurement norm | 2030 | Low / Medium | regulators |
| Certified quantum-key service from space | 2031 | Low / Low | capital |
| Satellites in service switch to post-quantum encryption | 2032 | Speculative / Medium | regulators |
| AI-designed codes ship in a satellite link standard | 2033 | Speculative / Medium | adoption |

### CK-1 🟡 Direct to cell is missing

Direct to cell is the largest connectivity story in Mach33's thesis, and the branch has no D2C milestone.

- Add V2 D2C service and V3 D2C as hardware milestones, with Starlink Mobile as the outcome.
- Date them from the Connectivity Keystone and use its naming: V1 D2C flies today on the V2 Mini bus; V2 D2C is the filed next generation; V3 D2C follows.

### CK-2 🟡 "Software adds 10%+ capacity" touches a live keystone debate

The keystone has been revised toward less delivered capacity, on the view that satellites don't run near full capacity. Check that the 10% gain doesn't assume a utilisation the keystone has dropped, and phrase it as capacity per satellite at fixed spectrum.

### CK-3 🟢 Cross-links

- Point the branch to the Connectivity Keystone model page.
- Point the "Orbital compute" and "AI chips in orbit" milestones to the AI Compute model.
- This keeps Mach33 pages from giving different dates for the same event.

### CK-4 🟢 "Base case" collides with keystone language

In the keystones, the base is never quoted as the forecast and the median is the headline. This page calls the Exponential scenario the "base case". Call it the "central scenario" if it sits on research.33fg.com beside the keystone pages.

---

## 5. Framing, argument and authorship

| ID | Sev | Finding | Fix | Raised by |
|---|---|---|---|---|
| FR-1 | 🔴 | **Who is speaking.** The header reads "MACH33 RESEARCH", but the source note reads like a third party ("built from the openai/math release… Mach33 supplied the model's launch-cost curve"). Readers can't tell whose model this is. | If the Space Unlock Tree is Mach33's, write "we built" and "we supplied". If not, name the author and frame Mach33 as a contributor. | B |
| FR-2 | 🔴 | **The hook has no source.** "$200 to $2,000 of compute a result" and "none of the October 2026 results has been independently verified" carry the opening, and neither is cited. The 2024 lunar oxygen ground rig (0.07 kg an hour) is also uncited. | Cite each in place, and name the release in words with a link. | A, B, C |
| FR-3 | 🟡 | **The strongest finding sits in a collapsed table.** The AI path more than doubles hardware unlocked by 2035: Plateau 35%, Exponential 57%, Recursive 69%, Embodied 74%. The text says AI pulls outcomes forward "1.3 to 1.8 years", which reads as a small effect. | Pull it into the text: AI never binds alone, yet the AI path decides whether a third or three quarters of the hardware arrives by 2035. Show all four scenarios in one compact row in the hero [A]. | A, C |
| FR-4 | 🟡 | **No investor takeaway.** The page ends on Mars windows and reading notes. The bottleneck chart (capital, adoption, launch) sets up a capital point and then drops it. | Add a short closing section: which gates capital can buy down, which companies sit on the hardware clock, and what to watch from 2027 to 2029. | B |
| FR-5 | 🟢 | **Title and section don't match.** "Mars windows still open every 26 months, whatever the AI" heads a section that mentions Mars in a single clause. | Retitle around reusable heavy lift, or give Mars its own sentence. | B |
| FR-6 | 🟢 | **Precision.** 93% and 57% carry one-point precision on analyst ratings with a 30% threshold. | Round to the nearest five, or add a line on how far one rating change moves them. | A |
| FR-7 | 🟢 | **Game vocabulary needs a key.** "Turn", "End turn", "Wonder" and "Research screen" are a good hook, but per Aaron's chart acceptance test the plain subtitle has to carry the meaning. | A subtitle saying a turn is one year and what the dots and squares count. | B, C |
| FR-8 | 🟢 | **Unclear sentence on the robots card:** "Robot odds also weigh a faster robot path, so they can run ahead of the date." | "The odds include a faster robot rollout, so a robot milestone can arrive before its listed year." | B |

---

## 6. Internal references showing to readers

| ID | Sev | Finding | Fix | Raised by |
|---|---|---|---|---|
| IN-1 | 🔴 | **Tooling credits.** The engine caption reads "an example figure from the Anatomy skill, by Ryan (MIT)", and the footer says "drawn with the Anatomy skill for Claude Code". | A plain illustration credit that keeps the license attribution, for example "Raptor illustration: Ryan, MIT license". | A, B, C |
| IN-2 | 🟡 | **Repo name.** "the openai/math release" is a repository path, not a publication. | Use the release's public title and link it. | A, B, C |
| IN-3 | 🟢 | **Model jargon.** The bottleneck caption says "tiers 6 and 7 of the tree". | "operational systems and strategic outcomes". | B |
| IN-4 | 🟢 | **Sharing.** The artifact is open to anyone with the link. | Confirm that is intended before the keystone figures are re-pinned. | A |

---

## 7. House style (mach33-prose and publication rules)

| ID | Sev | Finding | Fix | Raised by |
|---|---|---|---|---|
| ST-1 | 🟡 | **En dashes in ranges:** "5–10×", "$300–600", "$5–20", "15–120×", "6–18 months", "1.1–1.5×", "2–9%", "66–67%", "70–73%", "2.9–3.0×", "3.3–3.7×", the legend's "Medium 30–70%". The page also mixes in hyphens ("110-180", "10-20%"). | Write "to" in prose. For large display numerals, ask Aaron whether a hyphen is acceptable, then apply one rule everywhere. | A, B, C |
| ST-2 | 🟡 | **Binary contrasts:** "The proof is ready. The rocket isn't." · "a ceiling, not a forecast" · "the earliest credible year, not a forecast" · "analyst judgments, not computed probabilities" · "launch, not labor, was the limit" · "That curve, not the math, sets the dates" · "not any company's design". | Keep the headline as a deliberate, logged exception if you want it; all three reviews see it as earning its place. Rewrite the rest as plain statements. | A, B, C |
| ST-3 | 🟡 | **False agency:** "the tree names its binding gate", "launch sets the date", "Cadence and reuse decide the rest", "That curve… sets the dates". | Give each a human or model subject, for example "we assign each outcome its binding gate". | A |
| ST-4 | 🟡 | **US English:** "licence" (footer), "tonne" (lunar oxygen card). | "license", "metric ton". | A, B |
| ST-5 | 🟢 | **Adverbs:** "only about 3.5×", "only 1.1 to 1.5×", "almost never the math", "still pulls them forward", "directly". | Cut where the number does the work. | B, C |
| ST-6 | 🟢 | **Electron count.** Rocket Lab's 21 launches in 2025 include HASTE suborbital flights. | Say "launches", not "Electron orbital launches". | B |

---

## 8. Visual, brand and build

| ID | Sev | Finding | Fix | Raised by |
|---|---|---|---|---|
| VI-1 | 🟡 | **Accent colour off palette.** The page runs cyan ([A] read #22CFFF) for thinking, data and buttons, which matches no Brand MCP token. | Accent: Orbital Signal Blue `#1C79D6`; data: `#3C8CDC`, `#5B9FE2`, `#7BB2E8`; background: Black Space `#030911`; text: Mission White `#FAFEFF`. Don't use Deep Orbit Blue as a background (OOTWD rule, Eugene, 9 Oct 2026). | A, B, C |
| VI-2 | 🟢 | **Role colours.** The Mach33 chart system assigns ODC blue, Starlink green and lunar-Mars red by role. | Carry the role colours on the orbital compute and Moon and Mars cards, using token greens (`#00A57C` family) and reds (`#902005` family). | A |
| VI-3 | 🟡 | **Typeface.** The number callouts look like Turret Road, which is correct (numbers only). Body and headlines should be Mach 33 Grotesk. No review could confirm which font loads. | Embed the Mach 33 Grotesk woff2 files as base64. | B, C |
| VI-4 | 🟢 | **No logo.** The header shows "MACH33 RESEARCH" in type but no Mach33 mark. | Embed the white wordmark SVG from the Brand MCP. | B |
| VI-5 | 🟡 | **Lunar oxygen illustration.** [B] saw an empty left panel on the 2032 lunar oxygen card. [C] saw the illustration (an oxygen plant with a solar array) at desktop width. | Likely a load or phone-width rendering failure. Check that card at phone width and on a cold load. | B, C |

---

## 9. Phone width and interaction

| ID | Sev | Finding | Fix | Raised by |
|---|---|---|---|---|
| MO-1 | 🟡 | **Tree navigation.** At 375 px the tree scrolls sideways and shows about 2026 to 2030 at a time; scrolling down, the year row leaves the screen. | Make the year row sticky, and add a "scroll for later years" cue. | B, C |
| MO-2 | 🟡 | **Overlaps.** The "Wonder unlocked" toast covers the lower third of the tree. Wonder labels clip at the left edge ("AI-designed trajectories") and sit on branch names ("AI chips in orbit" over "Moon and Mars"). On the wonder cards the odds row collides ("Speculative" runs into the next column's dots). | Move or shrink the toast on phones, offset the labels, and stack the odds row. | B, C |
| MO-3 | 🟢 | **Copy for touch.** The tree caption says "Hover any tech" and "click a wonder", while the legend already says "tap". | Match the caption to the legend. | C |
| MO-4 | 🟢 | **Autoplay.** The tree replays from 2026 on every load, so a returning reader waits through the animation before inspecting a node. | Start at the final year on revisits, or add a "Skip to 2035" control. | B, C |
| MO-5 | 🟢 | **Tooltips truncate.** Long descriptions end in an ellipsis (for example, the post-quantum milestone). | Let the card grow, or move the full text to a tap-to-expand panel. | C |
| MO-6 | 🟢 | **Interaction coverage.** [C] confirmed at desktop that hover paths, scenario chips and "See the numbers" work. "End turn", "Play" and "click a wonder to jump to its card" were not tested. | A manual pass on those three before sending to Aaron. | B, C |

---

## 10. Verified clean ⚪

**Arithmetic**

| Claim | Check | Result | Checked by |
|---|---|---|---|
| 478 milestones | 250 thinking plus 228 hardware | Pass | A, B, C |
| 13 branches | Rows in the tree | Pass | A, B |
| 2029: 75% and 22% | 188 of 250 and 51 of 228 | Pass | B |
| 2030: 83% and 29% | 207 of 250 and 67 of 228 | Pass | B, C |
| 2035: 93% and 57% | 233 of 250 and 131 of 228 | Pass | A, B |
| 164 outcomes | 34 + 33 + 29 + 19 + 18 + 13 + 12 + 6 | Pass | A, B, C |
| 15 to 120x cheaper code | $300 / $20 and $600 / $5 | Pass | A, B, C |
| 4,000 satellites per GW | 1 GW / 250 kW | Pass (see OC-1, OC-2) | A, B, C |
| 110 to 180 flights per GW | About 10,000 t at S-1 density, 56 to 91 t a flight | Consistent (see OC-2) | A, C |
| A metric ton of lunar oxygen a year | 1,000 / 8,760 = 0.114 kg/h | Pass | A, B, C |
| About 9 anode swaps a year | 8,760 h / 1,000 h | Pass | A, B |
| 230 failure-free starts | ln(0.1) / ln(0.99) = 229.1 | Pass | A, B, C |
| Program ceilings 2.3x to 3.7x | 1 / (1 minus share shorter) | Pass | A, B, C |
| 1.6x "at most" | Amdahl on the stated inputs | Runs 1.5 to 1.7x (see IC-1) | A, B |

**Facts**

- **Rosie robot:** a step of Electron production cut from 400+ hours to 12 (Nov 2019). [B]
- **Electron launches:** 6 in 2019 and 21 in 2025, about 3.5x. [A, B, C]
- **Mars windows:** every 26 months. [C]

**Compliance**

- The SpaceX equity disclosure sits in the footer, not at the top. [A, B, C]
- There is no glut or shortage vocabulary, and no register IDs, on the page. [B]

---

## 11. Order of work

1. **Model session:** OC-1 to OC-4 and LK-1, using the mach33-model-lookup skill against the AI1 work, the AI Compute model and Launch Keystone v1.4. Note that the lookup route still serves the v1.3 client package.
2. **Authorship and sources:** FR-1, FR-2, IN-1, IN-2.
3. **Contradictions:** IC-1 to IC-5, including the gap chart rebuild.
4. **Argument:** FR-3 and FR-4 (scenario finding, investor close), LK-2 (rideshare closure), CK-1 and CK-2 (D2C milestones, capacity phrasing).
5. **Brand pass after `get_brand_tokens`:** VI-1 to VI-5.
6. **Style sweep:** ST-1 to ST-6, IN-3, FR-5 to FR-8.
7. **Phone and interaction check:** MO-1 to MO-6. Then send to Aaron.

---

## Sources

**Mach33 research**
- [SpaceX AI1: A Subsystem-Level Reconstruction](https://research.33fg.com/analysis/spacex-ai1-a-subsystem-level-reconstruction) (Jun 2026)
- [Launch Providers Earn $945 per Customer Kilogram in Our Median 2035 Case](https://research.33fg.com/analysis/launch-providers-earn-945-per-customer-kilogram-in-our-median-2035-case) (10 Sep 2026)
- [Inside Musk's Plan for 100 GW of Compute in Orbit](https://research.33fg.com/analysis/inside-musk-s-plan-for-100-gw-of-compute-in-orbit) (5 Nov 2025)
- [Debunking the Cooling Constraint in Space Data Centers](https://research.33fg.com/analysis/debunking-the-cooling-constraint-in-space-data-centers) (17 Dec 2025)
- [Where Should Space Data Centers Live?](https://research.33fg.com/analysis/where-should-space-data-centers-live-the-solar-radiation-and-capacity-benchmarking) (10 Dec 2025)

**Project docs (cited by review A)**
- `claude/launch-keystone-w45-status-1021.md`
- `claude/note-for-ai-compute-keystone-orbit-1016.md`
- `launch-monthly-research-handoff.md` (SpaceX S-1 orbital compute figures; SpaceNews rideshare closure)

**External**
- [Rosie Rocks Rocket Lab](https://satnews.com/2019/11/13/rosie-rocks-rocket-lab/) (SatNews, 13 Nov 2019)
- [Rocket Lab ends 2025 with 21 launches](https://rocketlabcorp.com/updates/rocket-lab-successfully-launches-for-iqps-ends-2025-with-21-launches-and-100-mission-succes/) (Rocket Lab)

**Brand**
- Mach33 Brand MCP, `get_brand_tokens` (brand version 23 Oct 2026)

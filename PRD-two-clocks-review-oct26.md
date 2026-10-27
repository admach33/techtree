# PRD: Integrate the 26 Oct 2026 review into the Space Unlock Tree and the Two Clocks page

**Branch:** `review-oct26` (worktree at `/Users/alex/projects/techtree-review-oct26`), base `main` at commit `d0d33ad`.
**Repo:** https://github.com/admach33/techtree
**Review being integrated:** [review/two-clocks-space-review-2026-10-26.md](review/two-clocks-space-review-2026-10-26.md) (three Mach33 keystone reviews, combined). Every finding ID below (OC-1, IC-3, LK-2, …) refers to that file.
**Owner:** Alex Darvishian (Mach33 Research). **Written:** 27 Oct 2026.

---

## 0. Where the project stands

Two deliverables share one model:

| Thing | Source of truth | Built by | Published at |
|---|---|---|---|
| **Space Unlock Tree model**: 478 milestones, 13 branches, 4 scenarios (S1 Plateau, S2 Exponential, S3 Recursive, S4 Embodied), horizon 2035 | `model/graph-v8.json` | edits via `model/tools/apply_edits.py` (edit-file format in its docstring) | — |
| Model analytics | `model/work/analytics-v8.json` | `model/tools/analytics.py` | — |
| Model document (long form) | `model/doc/*.md` + `model/doc/branches/*.md` + graph | `model/tools/build_doc.py` → `model/Space Unlock Tree - model.md` | — |
| Interactive viewer (full tree) | `model/viewer/template.html` + graph | `model/tools/build_viewer.py` → `model/viewer/space-unlock-tree.html` | https://claude.ai/artifact/1ppfto5R4NFusiEDjWiFvB |
| **Two Clocks of Space** (the share page under review) | `model/share/page.src.html` (template), `model/share/build_page.py` (card copy in `COPY`), `model/share/tree.{js,css,html}` (hero tech tree) | `build_facts.py` → `build_tree.py` → `build_page.py` → `model/share/site/two-clocks.html` | https://claude.ai/artifact/CDb9dUrYcXHCHRjztx2wVy (republish the same file path to keep the URL; `files` = `figs/*.svg` + `figs/raptor.jpg`) |
| Share kit (PNG poster, social card, 7 unlock cards) and two MP4s | `model/share/build_kit.py`, `capture_kit.sh`, `video/record.mjs`, `video/encode` | needs the `share` preview server (`.claude/launch.json`, port 8766) | `model/share/kit/` |
| Anatomy figures (7 isometric SVGs) | `model/share/figs/<slug>/` per `figs/FIGURE-SPEC.md` | anatomy skill | copied into `site/figs/` by `build_page.py` |

**Rule the whole stack obeys:** every number on the page comes from `share/data/facts.json`, which `build_facts.py` computes from the graph. Never hard-code a number in copy; change the model or `build_facts.py` and rebuild.

**Current model facts the review reacts to** (from `facts.json`, S2 unless stated): clock curve peaks at a 54-point gap in 2030 (83% thinking vs 29% hardware), reaches 93% vs 57% in 2035, and is flat 2033–35; 164 tier 6–7 outcomes gated capital 34 / adoption 33 / launch 29 / regulatory 19 / qualification 18 / fabrication 13 / data 12 / experiment 6, cognition 0; Amdahl S2 ceiling 1.6× by 2031 (38% shorter); 45 nodes carry `binding_gate: launch`, 29 of them tier 6–7.

**Schema today** (per node): `earliest_year{S1..S4}` ("2029" or ">2035"), `band_2031{S1..S4}`, `band_2035{S1..S4}` (High/Medium/Low/Speculative), one `binding_gate`, `prerequisites` (hard), `accelerated_by` (soft), `why`, `status_oct2026`, `signpost`, `note_2035`, `revision_note`, `revisions[]`. Odds exist only at the two checkpoints. There is no runner-up gate, and "launch" is a single gate value.

---

## 1. Goal

Ship a revised model (`graph-v9.json`) and a revised Two Clocks page that resolve every 🔴 and 🟡 finding in the review and as many 🟢 as fit, so the page can go to Aaron for publication on research.33fg.com. The five headline changes, in the owner's words:

> The biggest change touches the whole tree: rate every milestone each year rather than only at 2031 and 2035, which fixes the false jump in 2032 and the flat lines after it. The biggest date changes come from two places. First, re-pinning launch to Launch Keystone v1.4 and splitting the launch gate in two: SpaceX gets cheap launch first, and outside customers wait longer. Second, rebuilding orbital compute on AI1 in sun-synchronous orbit, which likely lifts the odds for 1 GW in orbit. Two smaller changes add a few nodes or a new field: direct-to-cell milestones from the Connectivity Keystone in "Links and spectrum", and a written rule for each outcome's binding gate that records the runner-up gate too.

**Launch version, decided 27 Oct.** Launch Keystone v1.4 differs only slightly from v1.3, so the launch re-pin uses the **v1.3** series that the Mach33 server publishes (model 67, posts 126, 127, 133). The wave-45 deltas the review quotes (hinge 2030, $677/kg entry-year internal cost, $12.6B 2030 external revenue) are not applied; where a node's `why` would turn on them, note them as a one-line sensitivity against v1.3.

**Non-goals.** No rebuild of the page's structure or figures beyond what a finding requires. No new branches. No change to the four scenarios or the trust-tier framework. No new research outside what the named Mach33 sources supply.

---

## 2. Inputs, and where each one comes from

The **Mach33 MCP server** is connected to this project (tools `list_models`, `get_model`, `search_all`, `list_posts`, `get_post`, `list_news`, `get_news`, `whats_new`). On 27 Oct it was queried for everything below; the figures it returned are recorded in [review/inputs/mach33-mcp-inputs.md](review/inputs/mach33-mcp-inputs.md) so you can cite them without re-fetching. Read that file before WS2–WS4.

| Input | Status | Source |
|---|---|---|
| AI1 reconstruction (150 kW peak, 120 kW average, 2.1 t, 71 kW/t, dawn-dusk orbit, subsystem split) | **Have it** | MCP post 96; inputs file §3 |
| AI Compute Keystone headline path (437.9 GW orbital by 2040, crossover 2029 in all lenses) | **Have it** | MCP model 62 / post 117; inputs file §2 |
| AI Compute model's 1 GW orbital crossing year (OC-4) | In the package, not the post | Download model 62 (10 MB zip) into an empty directory and read `model_series.csv` with `python3 -I` |
| Launch Keystone **v1.3** published series (internal cost path, customer realized and spot prices, opening-year tests, internal-first wording) | **Have it** | MCP model 67, posts 126, 127, 133; inputs file §1 |
| Launch Keystone **v1.4 / wave 45** (hinge 2030, $677/kg entry-year internal cost, $12.6B 2030 external revenue) | **Not needed.** Alex (27 Oct): v1.4 differs only slightly from v1.3, so pin to v1.3 | The review's W45 figures above may be quoted as a sensitivity line only; nothing on the page or in the graph is sourced to v1.4 |
| Direct-to-cell naming and Oct 2026 status (V1 on V2 Mini, Starlink Mobile brand, V2 "5G-like" 2027–28, spectrum news) | **Have it** | MCP news 403, 411, 681, 723, 750 and post 154; inputs file §4 |
| Connectivity Keystone V2 D2C and V3 D2C **dates and odds** | **Not on the MCP**; the keystone model is unreleased (post 154 says so) | Alex or the keystone team. Until supplied, date V2 D2C from the public 2027–28 window with a `TODO(source)` marker |
| Brand tokens, Mach 33 Grotesk woff2, wordmark SVG | **Not on this MCP** | Alex, via the Brand MCP (`get_brand_tokens`, brand version 23 Oct 2026) |
| SpaceNews rideshare closure (late June 2026), SpaceX S-1 orbital-compute figures | Not on the MCP | `launch-monthly-research-handoff.md` in the Mach33 repo |
| AI Compute Keystone SSO re-base (W45 open item 5), 16 Oct orbit ruling | Not on the MCP | `claude/note-for-ai-compute-keystone-orbit-1016.md` |

If an item marked "Alex" is still missing when you reach it, do everything else, leave a `TODO(source)` marker in the affected copy, and list it in `review/RESPONSE.md`.

**Also found on the MCP:** Mach33 published a brief on 27 Oct 2026, [How AI Changes the Timeline for Space Technology](https://research.33fg.com/analysis/how-ai-changes-the-timeline-for-space-technology) (post 160): "We traced how cheaper mathematical work could change space technology through 2035, across 478 milestones in 13 branches." That settles FR-1 (the tree is Mach33's own work; write "we") and means the public brief must agree with the page once v9 changes the counts.

---

## 3. Workstreams

Order matters: WS1–WS5 change the model, and every number downstream regenerates from it. Do them first, rebuild, then do the page work on the new numbers.

### WS1. Rate every milestone each year (IC-3, and the root of the flat lines)

**Problem.** "Unlocked" = earliest year reached AND band at the *next checkpoint* ≥ Medium (end-2031 for years ≤ 2031, end-2035 after). The switch at 2032 makes 246 S2 nodes (319 in S1) jump at once, flattens 2033–35, and shapes the "widest gap, 54 pts in 2030" headline. See `build_facts.py: band_at/unlocked`, `tools/analytics.py: band_at/likely`, `tree.js: CHECKPOINT` (lines 27, 124–128, 254–256), `page.src.html` line 278 note, `doc/04-two-clocks.md` ("Most of the jump between 2031 and 2032…").

**Design.** Replace the two checkpoint bands with crossing years per scenario, from which a band for every year is derived.

- New per-node field `odds_by`: for each scenario, the first year by which the odds reach each band:
  ```json
  "odds_by": {"S2": {"low": "2029", "medium": "2030", "high": ">2035"}, ...}
  ```
  Semantics: Speculative before `low`; Low from `low`; Medium from `medium`; High from `high`. `">2035"` means never by the horizon. Default `low` = `earliest_year` (a milestone is at least Low once its earliest credible year arrives; a reviewer may set it later with a note).
- Derived, written by the tool: `band_by_year{S}[2026..2035]` (ten bands), and `band_2031`/`band_2035` recomputed from it so the viewer, doc tables and analytics keep working unchanged in shape.
- Validation in `apply_edits.py check`: `earliest_year ≤ low ≤ medium ≤ high` per scenario; scenario order (S1 ≥ S2 ≥ S3 ≥ S4 in years, existing rule); robots-branch exception kept (years on the base robot path, odds weigh the faster path); every node whose recomputed `band_2031`/`band_2035` differs from v8 is listed in the report, and each such change must carry a `revisions[]` entry.
- **Unlocked rule becomes:** `band_by_year[y] ≥ Medium`. Apply it in `build_facts.py`, `build_tree.py`/`tree.js`, `analytics.py`, `build_doc.py` (clock-curve table) and `build_viewer.py`.

**Process.**
1. Write `tools/derive_odds.py`: seed `odds_by` from v8 for every node (`low` = earliest; `medium` = earliest if `band_2031 ≥ Medium`, else the first year 2032–35 implied by `note_2035`/`why` if `band_2035 ≥ Medium`, else ">2035"; `high` likewise), marking each seeded value `"odds_source": "derived"`.
2. Branch review, one agent per branch (the project's existing skeptic/advocate/resolver pattern, see `doc/02-method.md` stage 7): replace seeded values with judgments, priority on the nodes whose band rises between 2031 and 2035 (that is where the crossing year is a real decision), and on every tier 6–7 node. Record reasons in `revision_note` with the prefix `R9-odds`.
3. Remove the checkpoint machinery: `CHECKPOINT` and the "odds rated to end-2035 →" marker and toast in `tree.js`; the page note at `page.src.html:278`; the "Most of the jump…" and "rows after the checkpoint change are starred" text in `doc/04-two-clocks.md`; the caption text in `build_page.py:102`.
4. `build_facts.py`: `gap_peak` now comes from the per-year curve. If a scenario's peak year equals its final year (the review found this in Plateau), the second stat card must show a different year (use 2031) so the two cards never repeat the same numbers.

**Done when:** the S2 clock curve has no single-year step larger than the largest year-on-year change in the thinking line before 2031, the 2033–35 hardware line is not flat unless the model says so node by node, the check report is clean, and the page, viewer and doc carry no mention of a checkpoint switch.

### WS2. Re-pin launch to Launch Keystone v1.3 and split the launch gate (LK-1, LK-2, LK-3, LK-4, LK-5)

**Re-pin.** The model dates launch-cost thresholds "about a year after Mach33's path" but never names the version or the wave it is reading from (see `doc/04-two-clocks.md` and the quotable row in `doc/12-quotable.md`). The re-pin names it: **Launch Keystone v1.3**, the version the Mach33 server publishes, with the internal cost path from the 23 Sep post (wave 44 base) and the customer side from the 10 Sep post (wave 38b). The review's wave-45 deltas (hinge 2031 → 2030, entry-year internal cost $412 → $677/kg, 2030 external revenue median $28.5B → $12.6B) are small by Alex's judgment and are not applied.

- What the MCP shows: the model's current chain ($4,900 expended 2026 → about $650 in 2027 → about $300 in 2028, then $13/kg by 2035) already is the v1.3 wave-44 base from the 23 Sep post, so the internal-cost curve keeps its numbers and gains a version tag and the exact figures ($4,915, $656, about $300). The work is on the customer side, which the model has never pinned: the v1.3 reference case opens Starship spare capacity to customers in 2031 (tested 2029 to 2033), spot price $6,200 (2029) → $5,634 (2030) → $820 (2031) → $562 (2033), realized price median $5,823/kg in 2030 and $945 in 2035. These bear on `physclock-cheap-mass-customer` and every `launch-external` node.
- Add `meta.launch_source = "Mach33 Launch Keystone v1.3 (wave 44 internal path, 2026-09-23; wave 38b customer path, 2026-09-10)"` to the graph.
- Re-derive, against the v1.3 series, the years and odds of: `physclock-cheap-mass-internal` (internal < $300/kg, now 2029 all scenarios), `capability-35-internal-cost-100`, `physclock-cheap-mass-customer` (customers < $1,000/kg, S2 2031 Low/High), `physclock-flight-test-cadence`, `physclock-starship-full-reuse`, `physclock-heavy-cadence-100`, `capability-35-heavy-cadence-300`, `physclock-pad-propellant-infra`, `physclock-reusable-competition`, `capability-compute-launch-demand`. Keep the model's own slip convention (threshold dated after Mach33's median) but state it against v1.3 in each `why`, and in `physclock-cheap-mass-customer.why` add the sensitivity line that wave 45 moves the hinge to 2030.
- Rewrite the "Space has its own exponential" paragraph in `doc/04-two-clocks.md`, the trunk narrative `doc/branches/trunk.md`, and the quotable row. Footer of the page names "Mach33 Launch Keystone v1.3" as the source of the launch curve (LK-1).
- Price discipline (LK-4): every $/kg on the page or in the doc says purchased or delivered; no p95 masses; no 2040 figures (horizon is 2035, so none should appear).
- LK-5: the orbital compute card's "AI math saves 2–9% of launched mass; launch sets the date" stops reading as a launch-market driver. Keep the 2–9% as a side note or drop it from the card.
- LK-3: the refuelling card's "more than 10 tanker flights" is restated in the MOONCITY framing if Mach33 is cited: tankers launched per delivered load fall from about 30× early to about 7× at maturity.

**Split the gate.** Thesis, in Mach33's published words (Launch Keystone post): "an activity can become viable for a provider using spare capacity on its own rocket before it becomes viable for a customer buying a flight." The keystone books Starlink, SpaceX's own orbital compute, Moon and Mars cargo and NASA's lunar tanker flights in the internal account; customers wait for the opening year (v1.3 reference 2031, tested 2029 to 2033) and pay the spot price ($5,634/kg in 2030 falling to $820 in 2031 in the v1.3 reference case). New Transporter and Bandwagon bookings beyond late 2028 or early 2029 were closed as of late June 2026 (SpaceNews, nine partners and customers).

- Replace the gate value `launch` with two values: `launch-internal` (SpaceX's own manifest: Starlink, AI1/orbital compute flown by SpaceX, HLS tankers, Mars) and `launch-external` (anyone buying launch: outside orbital compute operators, small lunar and cislunar missions, science missions, other constellations). Update `doc/02-method.md` "Binding gates" list, `build_facts.py: outcome_gates`, the bottleneck chart (two rows, or one row split in two colours with a legend), `build_tree.py` and the viewer.
- Classify all 45 launch-gated nodes (list in `review/RESPONSE.md`; `python3 -I -c` on the graph prints them). External ones get `physclock-cheap-mass-customer` as a hard prerequisite (or a new tier-6 node "Rideshare and dedicated manifest slots reopen for outside customers", with the SpaceNews closure as status) and are re-dated so no external outcome precedes customer access. Internal ones keep `physclock-cheap-mass-internal`.
- Nodes the cards depend on: `astro-ai-designed-trajectory-flown` is external (small lunar missions); `materials-cots-orbital-compute-ops` is internal for SpaceX but external for Starcloud, Google and others, so the card must say which operator it rates; `prop-cislunar-propellant-economy` is internal.
- Page copy (LK-2): the trajectories card gets one sentence on the rideshare closure and slips of months to years; the kicker gets one sentence naming it.

**Done when:** no node carries the bare value `launch`; every `launch-external` tier 6–7 node has a hard path to customer-price access; the page footer names v1.3; every launch figure in `doc/12-quotable.md` carries its post date and basis (internal cost, realized price or spot price).

### WS3. Rebuild orbital compute on AI1 in sun-synchronous orbit (OC-1 to OC-6)

**Problem.** The card says "100 kW-class satellites with paying customers" and then sizes a gigawatt at "about 4,000 satellites at their 250 kW peak rating", 110–180 Starship flights, no orbit named. The model's basis (`struct-gw-orbital-compute.description`) is a Starmind-class unit at 250 kW peak / 175 kW average, 4.0–4.5 t, 16,000–18,000 t per GW. Mach33's AI1 reconstruction gives 150 kW peak / 120 kW average, about 2.1 t (71 kW/t), in dawn-dusk SSO; the SpaceX S-1 says over 100 kW/t.

**Changes.**
- Re-base on AI1 in SSO: `struct-gw-orbital-compute`, `materials-cots-orbital-compute-ops`, `struct-highflux-radiator-flight`, `struct-formation-compute-clusters`, `struct-35-mw-class-compute-satellite`, `struct-35-beyond-dawn-dusk-compute`, `struct-35-10gw-orbital-compute`, `capability-compute-launch-demand`, and `doc/branches/orbital-compute-power.md`. State in each description: satellite generation (AI1 at 150 kW peak / 120 kW average), orbit (dawn-dusk SSO), per-GW count (about 6,700 at peak, about 8,300 at average), tonnes per GW (about 14,000 t at AI1 density; about 10,000 t at S-1 density), per-flight payload to SSO (about 60–90 t) and the resulting flight count. Name the 250 kW unit, if it stays anywhere, as a later generation at S-1 density, not AI1.
- Re-rate 1 GW odds under WS1's scheme. The expected direction is up (fewer tonnes per GW, a disclosed design), but the agent decides, writing the chain out as the node does now. Flag in `why` that the figure rests on the 1.5× SSO delivery placeholder (`ODC_HEO_LEO_X`) while the AI Compute Keystone's SSO re-base is open (W45 open item 5).
- Card copy (`build_page.py: COPY['materials-cots-orbital-compute-ops']`): one satellite class with the generation named; per-flight payload and orbit on the card; peak and average both quoted; one line that the Nov 2025 "100 GW" post counted solar-array power, not whole-satellite mass (OC-2); one bridging sentence plus link to the AI Compute model so "Low by 2031 / Medium by 2035 for 1 GW" and the model's 437.9 GW by 2040 are read as different measures, with the AI Compute model's own 1 GW crossing year compared with the tree's `odds_by.medium` (OC-4); one caption line that launch cadence sets the date while launch price does not move the cost crossover (x1.5 has no effect) (OC-5); cite the S-1's "as early as 2028" deployment start for the 2029 earliest year, and link "Debunking the Cooling Constraint" for the 100 kW class (OC-6).
- Footer: confirm the "orbital-compute satellite reconstruction" credited is the AI1/SSO work and name it (OC-3).
- Role colours (VI-2): orbital compute cards carry ODC blue, Moon and Mars cards the lunar-Mars red family (`#902005`), Starlink/D2C the green family (`#00A57C`), from Brand MCP tokens.

**Done when:** the card, the node, the branch narrative and the quotable row agree on one basis, and the review's OC-2 table would show "Yes" for the page row.

### WS4. Direct-to-cell milestones in "Links and spectrum" (CK-1 to CK-4)

- Add to the `networks` branch (lane "Links and spectrum" in the hero): `comms-d2c-v2-service` (tier 6, V2 D2C service), `comms-d2c-v3` (tier 6, V3 D2C), `comms-starlink-mobile` (tier 7 outcome, Starlink Mobile). Naming per the Connectivity Keystone: V1 D2C flies today on the V2 Mini bus; V2 D2C is the filed next generation; V3 D2C follows. `status_oct2026` from the MCP (inputs file §4): about 650 D2C-enabled satellites, 22M monthly Starlink Mobile users through 36 operators (Aug 2026), V2 framed as "5G-like" at about 100× V1's data density for 2027–28 on the EchoStar 2 GHz band, plus the October spectrum items (AWS-3, 800 MHz, Brazil S-band, the CTIA objection). Dates and odds from the keystone when Alex supplies them; otherwise V2 D2C at the public 2027–28 window with a `TODO(source)` marker and V3 D2C dated after the V3 Starlink ramp. Hard prerequisites as the keystone implies (V3 on Starship → `launch-internal`; spectrum → regulatory), soft edge from the existing `comms-d2d-coexistence-scheduling` ("Phone-to-satellite service scheduled around interference"). Pathway "P7 (exogenous)" like the launch anchors. Update `doc/branches/networks.md`.
- CK-2: reword the tier-7 node "Software adds 10%+ capacity on the same hardware" as capacity per satellite at fixed spectrum, and check its `why` does not assume a utilisation the keystone has dropped.
- CK-3: the branch narrative and the page cards link to the Connectivity Keystone model page; the orbital compute and "AI chips in orbit" items link to the AI Compute model page.
- CK-4: on the page, viewer and model doc, "base case" becomes "central scenario" (`tree.js: READER`, `page.src.html` footer and lede, `build_page.py` copy, `doc/*.md`). Tool docstrings may keep "base case".

Node, milestone and outcome counts (478, 250, 228, 164) all regenerate; do not touch them by hand.

### WS5. A written rule for the binding gate, with a runner-up (IC-4, user's fifth change)

- Write the rule in `doc/02-method.md` under "Binding gates": the binding gate is the gate whose removal would move the node's earliest year the most in the central scenario; the runner-up is the next. Ties go to the gate later in the physical chain.
- Add `runner_up_gate` to every tier 5–7 node (all nodes if time allows) and a one-clause `gate_note` giving the ranking. Branch reviewers assign them in the same pass as WS1.
- `analytics.py` and `build_facts.py`: count outcomes whose runner-up is `cognitive` or `formalization`. The bottleneck section states it ("Thinking is the second-tightest gate for N of 164"), which turns "binds none of them" into evidence. Add one line reconciling "thinking is a third of the critical path" with "binds none" (a third of the path can run fast without ever being the slowest step).
- The viewer and the hero tooltip show both gates.

### WS6. Headline reconciliation (IC-1, IC-2, IC-3 consequences, IC-5)

- IC-1: pick one frame for the hero. Recommended: "about 1.6× (1.5–1.7×) faster new programs by 2031: a ceiling in the central scenario". Amdahl on the stated inputs runs 1.5–1.7×, so "at most" with a midpoint is wrong. Label the bridge chart's 2.3–3.7× as "ceiling by 2035, with robots", and the realised "about a third shorter by 2035" as realised. Add the clause "by 2035, with robots, the ceiling rises to 2.3 to 3.7×" to the Bridge section.
- IC-2: one closing claim in the kicker. Recommended: capital and adoption gate the most outcomes, launch gates the space-specific ones, and an evidence rule for AI-made analysis is the lever policy can pull. If "biggest lever" stays, define it (years saved per unit of change) and show the figure from the model.
- IC-3: resolved by WS1; after rebuild, re-check the two stat cards and the peak callout per scenario.
- IC-5: footer "not any company's design" must except the Raptor (the card names Raptor 2; review A's "Raptor 3" was a misread; `COPY` says Raptor 2). Name the difference between "97 hardware techs still wait at 2035" (`tree.js:266`, unreached) and "20 of the 21 techs pushed past 2035 are hardware" (rated past 2035). Name the subsets behind "122 of 155 math and physics-model milestones" (tiers 1–3) and "44 of 167" (tiers 5–6), or drop the line; note the page says 155 and the review wrote 156, so recount after WS4. Pick one vocabulary pair: "milestone" everywhere, with "thinking"/"hardware" (replace "research techs"/"build techs" in the tree caption and "tech" in `tree.js` strings). "end of the decade" → "by 2035".

### WS7. Provenance, authorship and sources (FR-1, FR-2, IN-1 to IN-4, LK-1)

- FR-1: the page speaks as Mach33: "we built the Space Unlock Tree… we supplied the launch-cost curve". Settled: Mach33's own brief of 27 Oct 2026 (post 160 on the MCP) says "We traced…". Link the page and the brief to each other.
- FR-2: cite in place: "$200 to $2,000 of compute a result" (The Decoder, as in `doc/12-quotable.md`), "none of the October 2026 results has been independently verified" (the openai/math repository's own unchecked-proof note and the model doc's trust tiers), the 2024 lunar oxygen ground rig 0.07 kg/h (ICES 2026 DOI in `doc/12-quotable.md`). Name the release in words ("OpenAI's October 2026 mathematics release") with a link.
- IN-1: replace "an example figure from the Anatomy skill, by Ryan (MIT)" and "drawn with the Anatomy skill for Claude Code" with a plain credit: "Raptor illustration: Ryan, MIT license." Keep the license attribution.
- IN-2: "the openai/math release" → the release's public title, linked.
- IN-3: "tiers 6 and 7 of the tree" → "operational systems and strategic outcomes".
- IN-4: the artifact's sharing setting: confirm with Alex whether link-sharing is intended before keystone figures are re-pinned (the project notes say it was published private; the review found it open).

### WS8. Argument and copy (FR-3 to FR-8, LK-2 copy, ST-6)

- FR-3: pull the strongest finding into the text and the hero: by 2035 the AI path decides whether a third or three quarters of the hardware arrives (Plateau 35%, Exponential 57%, Recursive 69%, Embodied 74%, all from `facts.physical_share`, regenerated). One compact four-scenario row in the hero. Keep "1.3 to 1.8 years" only with the share figures beside it.
- FR-4: a short closing section for investors: which gates capital can buy down (capital, some fabrication and qualification), which cannot (launch cadence, regulatory, adoption), which companies sit on the hardware clock, and what to watch in 2027–29 (take signposts from `doc/10-signposts.md`).
- FR-5: retitle the kicker around reusable heavy lift, or give Mars its own sentence.
- FR-6: round 93% and 57% to the nearest five on the page, or add one line on how far one rating change moves them (compute it: one node is 0.4 points of 250 or 228).
- FR-7: a subtitle under the hero tree: a turn is one year; dots are thinking milestones and squares hardware milestones (match the actual marks in `tree.js`).
- FR-8: robots card last sentence → "The odds include a faster robot rollout, so a robot milestone can arrive before its listed year."
- ST-6: "21 launches" not "Electron orbital launches" (HASTE suborbital flights are in the count).

### WS9. Brand and house style (VI-1 to VI-5, ST-1 to ST-5)

- VI-1: call `get_brand_tokens` first. The page and figures use `#22CFFF` as the one lit accent (`figs/FIGURE-SPEC.md` calls it "Mach33 Highlight Blue"; the review says it matches no token). Resolve against the Brand MCP. If it must change: accent Orbital Signal Blue `#1C79D6`; data `#3C8CDC`, `#5B9FE2`, `#7BB2E8`; background Black Space `#030911`; text Mission White `#FAFEFF`; never Deep Orbit Blue as a background (OOTWD rule, Eugene, 9 Oct 2026). Each SVG carries the value once as the `--anatomy-lit` token, `page.src.html` five times, `tree.css` none, so the recolour is a token edit per file, not a redraw. Update `FIGURE-SPEC.md` so future figures match.
- VI-3: embed Mach 33 Grotesk woff2 as base64 for body and headlines; Turret Road stays for number callouts only. Check the 16 MB artifact limit after embedding.
- VI-4: embed the white wordmark SVG in the header.
- VI-5: the lunar oxygen illustration rendered empty for one reviewer. Test the card at 375 px and on a cold load; check `fig_file()` in `build_page.py` and the SVG's size guard (> 2,000 bytes).
- ST-1: "to" in prose ranges everywhere ("5 to 10×", "$300 to 600"); one rule for display numerals, confirmed with Aaron (hyphen or "to"); no mixed en dashes and hyphens.
- ST-2: keep "The proof is ready. The rocket isn't." as a logged exception; rewrite the other six binary contrasts listed in the review as plain statements.
- ST-3: give false-agency sentences a human or model subject ("we assign each outcome its binding gate").
- ST-4: US English: "license", "metric ton".
- ST-5: cut the adverbs listed where the number does the work.

### WS10. Phone width and interaction (MO-1 to MO-6)

- MO-1: sticky year row in the hero tree at phone width, plus a "scroll for later years" cue.
- MO-2: move or shrink the "Wonder unlocked" toast on phones; offset wonder labels so they do not clip at the left edge or sit on lane names; stack the odds row on the wonder cards.
- MO-3: tree caption says "tap", matching the legend.
- MO-4: on revisit start at 2035 (per-viewer `localStorage`, wrapped in try/catch), or add a "Skip to 2035" control.
- MO-5: tooltips show full text (let the card grow or tap-to-expand).
- MO-6: manual pass on "End turn", "Play" and "click a wonder to jump to its card", at desktop and 375 px, with screenshots saved under `model/share/shots/review3/`.

### WS11. Rebuild, verify, publish

Model (from `model/`):
```bash
python3 tools/apply_edits.py apply graph-v8.json graph-v9.json work/R9-*.json --autofix
python3 tools/apply_edits.py check graph-v9.json
python3 tools/analytics.py graph-v9.json work/analytics-v9.json
python3 tools/build_doc.py graph-v9.json work/analytics-v9.json doc "Space Unlock Tree - model.md" work/wf*-result.json
python3 tools/build_viewer.py graph-v9.json viewer/template.html viewer/space-unlock-tree.html
```
Page and kit (from `model/`; point `GRAPH` in `share/build_facts.py` and `share/build_tree.py` at `graph-v9.json`):
```bash
python3 share/build_facts.py && python3 share/build_tree.py && python3 share/build_page.py && python3 share/build_kit.py
zsh share/capture_kit.sh
```
The kit capture and the videos (`node share/video/record.mjs vid169 <frames>`, then `share/video/encode`, which is gitignored and rebuilt from `encode.swift`) need the `share` preview server from `.claude/launch.json` on port 8766. Regenerate the kit PNGs; regenerate the two MP4s only if the hero tree changed visibly (WS1 and WS9 both change it, so expect to).

Publish: republish `model/share/site/two-clocks.html` to https://claude.ai/artifact/CDb9dUrYcXHCHRjztx2wVy with the same `files` map (figs), and `model/viewer/space-unlock-tree.html` to https://claude.ai/artifact/1ppfto5R4NFusiEDjWiFvB. Same file paths keep the URLs.

Write `review/RESPONSE.md`: a table of every finding ID, what changed, where (file and line or node id), and the status (fixed / partly / deferred with reason). Include the re-verified arithmetic table from review section 10 with the new numbers.

---

## 4. Order of work

1. WS5 rule text and WS1 schema + tools (`derive_odds.py`, `apply_edits.py`, `analytics.py`, `build_facts.py`, `build_tree.py`, `build_doc.py`, `build_viewer.py`), on v8 data, so the pipeline runs end to end before any judgment changes.
2. Model session: WS2, WS3, WS4 edits as `work/R9-launch.json`, `work/R9-orbital-compute.json`, `work/R9-d2c.json`; then the branch review pass that fills `odds_by` and `runner_up_gate` (WS1 step 2, WS5), as `work/R9-odds-<branch>.json`. Apply, check, build `graph-v9.json`.
3. Rebuild everything; read the new `facts.json` before touching copy.
4. WS7 (authorship, sources), then WS6 (headlines), then WS8 (argument), then WS9 (brand, style), then WS10 (phone).
5. WS11 verification, screenshots, `review/RESPONSE.md`, republish.
6. One commit per workstream on `review-oct26`, then a PR to `main` titled "Integrate the 26 Oct review: per-year odds, Launch Keystone v1.3, AI1 orbital compute, D2C, gate rule".

---

## 5. Acceptance criteria

- [ ] `graph-v9.json` passes `apply_edits.py check` with zero findings; `meta.version` is 9 and `meta.launch_source` names v1.3.
- [ ] Every node has `odds_by` for all four scenarios, `band_by_year`, and (tiers 5–7 at least) `runner_up_gate` and `gate_note`; every band that differs from v8 has a `revisions[]` entry.
- [ ] No node carries `binding_gate: launch`; the two launch values appear in the bottleneck chart, the viewer and the method text.
- [ ] The three new D2C nodes exist in the `networks` branch with keystone dates and sources.
- [ ] `facts.json` is regenerated and every number on the page comes from it; the page shows no checkpoint note and no 2032 step; the two stat cards in every scenario show different years.
- [ ] The orbital compute card names one satellite generation, the orbit, the per-flight payload, peak and average power, and bridges to the AI Compute model.
- [ ] Hero speed-up, bridge chart and realised figures use one labelled frame each; the kicker has one closing claim.
- [ ] The page has no internal tooling names, cites the three hook figures, names its author, and names the Launch Keystone version.
- [ ] Brand tokens, fonts and wordmark applied per the Brand MCP; `FIGURE-SPEC.md` updated.
- [ ] Style sweep done: no en-dash ranges in prose, listed contrasts rewritten (headline excepted), US English.
- [ ] 375 px pass: sticky year row, no clipped labels, no toast over the tree, odds rows stacked; "End turn", "Play" and wonder-jump tested; screenshots saved.
- [ ] Kit PNGs regenerated; MP4s regenerated if the hero changed.
- [ ] `review/RESPONSE.md` covers every finding ID.
- [ ] Both artifacts republished at their existing URLs; `Space Unlock Tree - model.md` and the viewer rebuilt from v9.

---

## 6. Decisions, assumptions and open questions for Alex

**Decided here (change if wrong):**
- Per-year odds are implemented as crossing years (`odds_by`) with derived per-year bands, not as ten hand-rated bands per node. It is the same information with a quarter of the judgments and it validates cleanly.
- The launch gate becomes two gate values rather than a separate field, so the bottleneck chart and the gate counts change shape in one place.
- "Base case" becomes "central scenario" in all reader-facing text, including the model doc.
- The headline "The proof is ready. The rocket isn't." stays, as the reviews allow.

**Needs Alex:**
1. IN-4: should the page stay open to anyone with the link? (The Mach33 brief is already public, so the question is only whether the artifact link itself should be.)
2. ST-1: hyphen or "to" in large display numerals (Aaron's call).
3. The inputs section 2 still marks "Alex": Connectivity Keystone D2C dates, Brand MCP tokens, fonts and wordmark, the SpaceNews item, the SSO re-base note. The MCP has covered the rest, and the launch re-pin is settled on v1.3. Without the D2C dates the three nodes carry `TODO(source)`; without brand assets WS9 is blocked.
4. OC-2: whether SpaceX's Starmind 250 kW unit is still to be mentioned as a later generation, or dropped in favour of AI1 only.
5. OC-4: permission to download the AI Compute Keystone package (10 MB zip from the MCP) to read the 1 GW crossing year; the PRD assumes yes.

---

## 7. Finding coverage map

| IDs | Workstream |
|---|---|
| IC-3 | WS1 |
| LK-1, LK-2, LK-3, LK-4, LK-5 | WS2 |
| OC-1, OC-2, OC-3, OC-4, OC-5, OC-6, VI-2 | WS3 |
| CK-1, CK-2, CK-3, CK-4 | WS4 |
| IC-4 | WS5 |
| IC-1, IC-2, IC-5 | WS6 |
| FR-1, FR-2, IN-1, IN-2, IN-3, IN-4 | WS7 |
| FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, ST-6 | WS8 |
| VI-1, VI-3, VI-4, VI-5, ST-1, ST-2, ST-3, ST-4, ST-5 | WS9 |
| MO-1, MO-2, MO-3, MO-4, MO-5, MO-6 | WS10 |
| Section 10 arithmetic re-verification | WS11 |

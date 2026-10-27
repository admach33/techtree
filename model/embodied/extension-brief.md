# Brief: extending the Space Unlock Tree to 2035 and adding S4 Embodied

The model now has four scenarios and a horizon of end-2035. Full S4 analysis: `embodied/s4-embodied.md`, structured data: `embodied/s4-embodied.json`. Every agent working on the extension uses the parameters below so that branches stay consistent.

## Scenarios

| | Cognitive clock | Robots | Physical gates by 2031 | Physical gates by 2035 |
| --- | --- | --- | --- | --- |
| S1 Plateau | Task horizon doubles every 12–18 months; outside teams get research-grade math 2028. By 2035, S1 cognition is roughly where S2 is in 2029–30. | Slow robot path: fleet 1.4M (2031), 4.6M (2035) | ~1.0–1.1x | ~1.1–1.2x |
| S2 Exponential (base case) | Doubling every 6–9 months; public research-grade math 2027; physics theory 2029. By 2033–35, cognitive work is cheap and abundant even without recursion. | Slow robot path | 1.1–1.3x | ~1.2–1.4x |
| S3 Recursive | S2 to 2028, then ~3-month doubling; cognitive work near-free from ~2029 | Slow robot path, plus the specialized AI-run test stands and factories already in S3 | 1.3–1.5x | Gate durations ~10% below S3 2031 |
| S4 Embodied | Same as S3 | Base robot path: fleet 0.46M (2028), 6.2M (2031), 62M (2035); fast path 14M / 158M is the S4 upside | Same as S3 for a typical program; robot-first firms slightly better | Robot-first firms: integration and test ~2.2x, fabrication ~1.9x, qualification ~1.95x, launch campaign ~1.4x, construction 1.4–1.8x over today; typical programs less |

**Never compresses, in any scenario:** physics time constants (thermal-vacuum dwell, creep and fatigue hours, concrete cure, irradiation fluence), reliability statistics (~229 zero-failure trials for 0.99 at 90% unless model-based priors are accepted), orbital mechanics (Mars windows: late 2026, Dec 2028–Jan 2029, early 2031, ~Apr 2033, ~mid 2035), biology's clocks (trial endpoints, growth cycles), statutory clocks, and appropriations. Institutions may move faster through a non-robotic "institutional overlay" that applies equally to S2, S3 and S4.

**Launch clock (exogenous, all scenarios):** Starship full reuse 2027; internal cost under $300/kg ~2029; 100+ heavy launches a year ~2030 (S3 2029); customer prices under $1,000/kg ~2031 (S3 2030). Mach33 base case: internal ~$13/kg by 2035; hundreds of heavy flights a year by the mid-2030s, bounded by pads, propellant and airspace. AI mathematics moves this by months; robots add at most ~1.4x to launch campaigns by 2035.

## S4 rules

- **When robots become useful at scale (base path):**
  - Single-task factory work: now.
  - Multi-task factory work and robot makers' own lines: ~2029.
  - General lab bench work: 2029–31.
  - Aerospace flight-tolerance work at leading firms: 2030–31, or 2029 for handling, inspection and refurbishment. Suppliers come after 2031.
  - Construction trades: 2031–35.
  - Robots working in the robot supply chain (the robots-build-robots loop): ~2032.
  - Off Earth: pilots 2029–31 on hardware frozen in 2027–28; real infrastructure work 2032–35.
- **Through 2031, S4 equals S3** for every existing node: the same year and the same band_2031. The review found no node moves by a year or a band before 2032.
- **From 2032, a node gets S4 credit only if all four hold:**
  1. Its binding gate at the firm that will achieve it is labor- or throughput-bound.
  2. General-purpose robots are useful there before the node's year.
  3. No hard prerequisite lands later.
  4. The credit is not specialized automation already counted in S2/S3.
- **Typical S4 credit** is 0.5–1.5 years on such nodes by 2035, sometimes a band step. Institution-, physics-, launch-window- and appropriations-bound nodes get none.
- **A requalification gate applies.** Putting robots on flight hardware needs process requalification, taking 6–24 months per process per supplier. Robots shipping is not robots on flight hardware.

## Robotics node ids

The robots branch owns these ids. Other branches reference them, preferring soft edges (accelerated_by). Use a hard edge only when the node literally cannot happen without robots, as with robot-built lunar pads.

- `robo-structured-factory-useful`: general-purpose robots do multi-task factory work at scale.
- `robo-fleet-1m`: 1 million general-purpose robots in service.
- `robo-fleet-10m`: 10 million general-purpose robots in service.
- `robo-lab-bench-useful`: robots do general lab bench work at scale.
- `robo-aerospace-tolerance-work`: robots do paid flight-hardware assembly, integration and test at leading space firms.
- `robo-requal-standard`: an accepted robotic-process requalification route for flight hardware.
- `robo-24x7-integration-test`: robot-run, around-the-clock integration and test at a leading space firm.
- `robo-supply-chain-loop`: robots work in robot supply-chain plants (reducers, screws, motors, magnets); the loop starts.
- `robo-construction-trades`: general-purpose robots do construction trade work at scale.
- `robo-lunar-construction`: robots build lunar surface infrastructure (pads, berms, roads).
- `robo-in-space-assembly`: robotic assembly of large structures in orbit at scale.
- `robo-mfg-10pct`: robots supply 10% of global manufacturing labor.

## Bands and years

- **Years.** earliest_year has values for S1–S4. Each value is a specific year from 2026 to 2035, or ">2035". The legacy value ">2031" must not remain anywhere.
- **Bands.** band_2031 and band_2035 each have values for S1–S4: High (above about 70%), Medium (30–70%), Low (10–30%) or Speculative (under 10%). They are judgments, not probabilities.
- **Invariants:**
  - band_2035 ≥ band_2031 within a scenario.
  - Years: S4 ≤ S3 ≤ S2 ≤ S1.
  - Bands: S4 ≥ S3 ≥ S2 ≥ S1, at each checkpoint.
  - A node is never dated before any of its hard prerequisites.
  - If the year is after 2035, band_2035 is Low or Speculative.
  - If the year is after 2031, band_2031 is Low or Speculative.
- **Regulatory cap.** Anything that needs a regulator's or certifier's acceptance stays capped at Medium for 2031. For 2035 it may be High only when the regulatory path is already in motion through a named mechanism; otherwise it stays capped at Medium.
- **Trust tiers.** T1/T2 premises stay "conditional", one band down. Galactic speedups are never practical.
- **notes.** Every reviewed node gets `note_2035`, one or two sentences on what changes in 2032–35 and why S4 differs or does not.

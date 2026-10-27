The three original scenarios vary only the cognitive clock. **Embodied (S4)** adds the mechanism that could carry the acceleration into the physical world: Recursive cognition plus general-purpose robots at scale, including robots that help build robots, factories, labs, test stands and infrastructure. This section summarizes the reviewed analysis behind S4; the full version, with sources, is in `model/embodied/s4-embodied.md`. Its passages on the tree predate the 2035 extension round; where they differ, the tree's node values govern.

**The short answer.** Robots are how AI reaches the physical world, but they act on the 2030s more than on the 2020s.

- *Fast in rate, small in share.* The robot fleet grows fast, but its share of the work stays small for years. In the base path, general-purpose robots in service reach about 6 million in 2031 and about 60 million in 2035. That is 0.7% of global manufacturing labor in 2031 and about 9% in 2035.
- *Throughput more than latency.* Robots raise throughput far more than they shorten any single program. Physics time constants, reliability statistics, launch windows, trial endpoints and statutory reviews do not shrink.
- *The tree through 2031.* The robot review found no node outside the robots branch that robots move by a year or a band before 2032. The model therefore holds Embodied equal to Recursive there through 2031. Across the tree, {{n_s4_credit}} nodes gain from robots: {{n_s4_year}} arrive earlier and {{n_s4_band}} become more likely by 2035. {{n_s4_credit_robots}} are robots-branch milestones, and {{n_s4_pre2032}} of those already differ before 2032. The other {{n_s4_credit_other}} are space nodes that gain only in 2032–35 dates or 2035 likelihoods.

**How fast robots arrive.** The starting point is small.

- *Shipments.* Humanoid shipments were about 13,300 in 2025 ([Omdia via TechNode](https://technode.com/2026/01/09/chinas-agibot-leads-global-humanoid-robot-shipments-in-2025-omdia-says/)). In the first half of 2026 they were about 19,000 ([Smart Analytics Global via TechNode](https://technode.com/2026/08/11/chinese-makers-accounted-for-more-than-97-of-global-humanoid-robot-shipments-in-h1-2026/)) to 25,000 ([IDC](https://roboticsandautomationnews.com/2026/10/02/idc-data-shows-agibot-led-global-humanoid-robot-shipments-in-h1-2026/105463/)). Over 97% were Chinese (Smart Analytics Global).
- *Paid work.* Most current uses are narrow and often need teleoperation ([IFR](https://www.zawya.com/en/press-release/asia-press-releases/global-sales-of-professional-service-robots-surge-24-1458551)). In January 2026 Musk said Optimus was "not in usage in our factories in a material way" ([Electrek](https://electrek.co/2026/01/28/musk-admits-no-optimus-robots-are-doing-useful-work-at-tesla-after-claiming-otherwise/)).
- *Output trend.* Output at the leading makers grew linearly through 2026.

| Robot path (weight within Embodied) | Fleet 2028 / 2031 / 2035 (millions) | Output doubling 2026–31 / 2031–35 | Fleet passes 1M / 10M |
| --- | --- | --- | --- |
| Slow (25%; also used for Exponential and Recursive, with Plateau about a year behind) | 0.24 / 1.4 / 4.6 | 18 / 32 months | 2031 (Plateau 2032) / after 2035 |
| Base (55%; the Embodied case) | 0.46 / 6.2 / 62 | 10 / 16 months | late 2029 / late 2032 |
| Fast (20%; the Embodied upside) | 0.91 / 14 / 158 | 9 / 15 months | early 2029 / mid-2031 |

Even the base path is historic. It needs a 10-month doubling held for five years. US military aircraft production under total mobilization doubled about every 12 months over 1940–44, and grew just 13% from 1943 to 1944. [Epoch AI](https://epoch.ai/blog/how-fast-could-robot-production-scale-up) calls 1.5–3 million humanoids a year by the end of 2030 "clearly achievable" if a demand shock hits at the end of 2027. Bank forecasts for 2030 (0.9–1.2 million worldwide; Morgan Stanley's 0.45 million covers China alone) sit between the slow and base paths.

**When robots become useful, by setting.**

| Setting | Useful at scale (base path) |
| --- | --- |
| Structured single-task factory and warehouse work | Now, in low thousands |
| Multi-task factory work; robot makers' own lines | About 2029 |
| General lab bench work | 2029–31 |
| Flight-hardware assembly, integration and test | 2030–31 at leading firms (2029 for handling and inspection); suppliers after 2031 |
| Construction trades | 2031–35 |
| Robots in the robot supply chain (the loop starts) | About 2032 |
| Infrastructure work off Earth | Pilots 2029–31; real work 2032–35 |

The premise that Recursive cognition turns dexterity into mainly a software problem by about 2028 is an assumption. Field reliability is physical. Showing 1,000 hours between interventions at 90% confidence takes about 2,300 failure-free hours per task. Putting robots on flight hardware is a process change that needs requalification under AS9100 and NADCAP, an estimated 6–24 months per process per supplier.

**What robots compress, and what they cannot.** A robot works around the clock and in parallel. It removes labor, shift and queue time and turns capacity limits into capital limits. It cannot shorten a step set by physics, statistics, orbital mechanics, biology or statute.

**How the model gives robots credit.** From 2032, a node gets an Embodied gain only if four conditions hold:

1. its binding gate, at the firm that will achieve it, is labor- or throughput-bound;
2. general-purpose robots are useful there before the node's year;
3. no hard prerequisite lands later;
4. the gain is not specialized automation already counted in Exponential or Recursive.

A typical gain is 0.5–1.5 years, sometimes one band. Nodes bound by institutions, physics, launch windows or appropriations get none. The branch disputes refer to these as conditions 1 to 4.

- *Where robots go, labor often is not the binding gate.* Rocket Lab's Rosie robot cut one composite step from 400+ hours to 12, while launch cadence rose about 3.5x over six years. SpaceX builds about 70 Starlink satellites a week and keeps Starship hulls ahead of flights, so launch binds.
- *Robots raise demand as well as supply.* Equipment lead times are queues, backlog divided by throughput, and Embodied raises demand at the same time. GE Vernova held 116 GW of gas-turbine backlog and slot reservations, 53 GW of it firm orders, against a production rate it expected to reach 20 GW a year in late 2026.

| Space gate | 2026 duration | Recursive 2031 | Embodied 2035, leading firm | What cannot compress |
| --- | --- | --- | --- | --- |
| Clean-sheet launcher or new engine | 5–13 years | 0.7–0.8x | 0.45–0.51x | Failures found only in hot fire and flight |
| Integrated flight-test interval | 48–91 days | 0.5–0.7x | 0.34–0.48x | Serial build-fly-learn; mishap closure |
| Environmental qualification | 6–18 months | 0.7–0.8x | 0.43–0.50x | Thermal-vacuum cycles and dwell times |
| Material or process qualification | 10–20+ years | 0.5–0.7x | 0.36–0.50x | 10,000–100,000-hour creep tests; lots from separate heats |
| Pad and propellant plant | 2–4 years | 0.8–0.9x | 0.50–0.57x | Transformer lead times; permits |
| Reliability demonstrated by test | ~229 trials for 0.99 at 90% | Unchanged | Components faster on parallel rigs; system trials unchanged | The trial count |
| Licensing and environmental review | 180 days to 2+ years | 0.5–0.7x | Same as Recursive | Statute, comment periods, litigation |
| Mars learning loop | 26-month windows | 1.0x | 1.0x | Orbital mechanics |

**Amdahl beyond space.** Section 3 gives the space-program ceilings. The same method, with physics time constants and institutions held at Recursive values, gives these for other domains.

| Program | Recursive 2031 | Embodied 2031 | Recursive 2035 | Embodied 2035 |
| --- | --- | --- | --- | --- |
| US grid-connected data center or power plant | 19% | 19–21% | 25% | 27–33% |
| Small-molecule drug program (16 years) | 30% | 33% (robots only) | 41% | 44% (48% with institutional change) |
| New material to flight qualification (15 years) | 32% | 37% | 43% | 48% (55% with model-based allowables) |

At a robot-first firm in 2035, labor falls to 16% of what remains on a space program's critical path. Physics is 44%, materials and capital 18%, and institutions 20% (shares rounded). Schedules end up set by physics and paperwork. Faster labs alone cannot make a drug program more than 34% shorter, because Phase I through review takes 10.5 of its 16 years. The larger cuts in the table come from AI shortening clinical operations and reviews, which is cognitive and institutional work.

**Robots building robots.** The loop is real, but it is not super-exponential before 2035.

- *By 2031 it adds only 1.0–1.2x.* Assembly labor is not what limits robot production; actuators, magnets, chips, capital and certification are.
- *It bites from about 2032.* That is when robots start working in reducer, screw and motor plants. Holding a 12-month doubling to 2035 would give about 104 million robots instead of 62 million.
- *Precedent.* FANUC has run lines where robots build robots since 2001. Its robot output grew from about 185 a month in 1983 to a capacity of 5,000–6,000 a month in 2016, a doubling about every seven years, because demand set the pace.

What caps the loop, roughly in the order each starts to bind:

1. precision actuators;
2. field reliability;
3. rare-earth magnets (the base path needs 26–118 thousand tonnes in 2035, depending on magnet mass per robot, against roughly 250–350 thousand tonnes of 2025 output);
4. capital ($50–100 billion a year in 2031 and $0.4–0.8 trillion in 2035);
5. compute and power, which robots share with AI data centers;
6. politics and safety rules.

Energy does not limit the robots themselves; the base fleet uses about 93 TWh a year in 2035. It does limit compute, chip fabs and any economy-wide doubling.

**Every domain moves at the pace of its slowest essential input.** Measured in physical output:

| Physical output | Earliest doubling in under two years | Likelihood | Weak link |
| --- | --- | --- | --- |
| General-purpose robots | Already; base path holds about 10 months to 2031 | High | Actuators, reliability |
| Lab experiments per year | Already, in robotic workcells | High | Characterization |
| Mass to orbit | 2027–28 | Medium | Pads, flight failures (launch-driven, not robots) |
| Satellites | 2027–29 | Medium | Launch |
| Lunar landed mass and robot-hours | 2028–30 | Medium | Landers, power |
| Manufacturing output in a leading economy | 2034–35 | Low by 2035 | Energy, equipment |
| Construction, grid electricity, drug approvals, magnet supply | After 2035 | Speculative | Permits, turbines, trials, mines |

What doubles fast is small or rides launch's own exponential. Large mature sectors do not double before 2035.

**What robots change in the tree.** Most of the {{n_s4_credit}} nodes that robots move are milestones in the robots branch itself. The Embodied case reaches each of the following earlier or more surely:

- one million robots in late 2029;
- robots on flight hardware at leading firms in 2030;
- around-the-clock integration and test in 2031;
- ten million robots in late 2032;
- robots across the aerospace supplier base in 2033.

Outside that branch, robots move only throughput-bound nodes, and the gains are 2033–35 dates or higher 2035 likelihoods:

- arc-jet test runs double;
- merchant laser terminals ship at 3,000 a year;
- qualification campaigns are 30% shorter at leading firms (High by 2035, against Medium in Recursive);
- the flight-software verification calendar halves;
- a new large engine flies four years after program start;
- a new reusable launcher reaches orbit three years after start;
- leading firms halve development cycles (2034, Medium);
- a hundred robots work on the Moon at once.

Robots move no launch date, no lunar or Mars landing date, no regulator or appropriations milestone and no science flight. The branch narratives in section 10 say which branches robots leave untouched, and why.
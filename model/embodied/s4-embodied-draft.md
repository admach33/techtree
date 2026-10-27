# S4 Embodied: when the cognitive exponential gets hands

**Draft scenario for the Space Unlock Tree · as of 7 October 2026 · structured data in `s4-embodied.json`**

## Bottom line

The question is whether AI mathematics at volume, possibly the first of three releases, bleeds into the physical world through robots, and whether robots then accelerate every physical domain. We answer it by adding a fourth scenario, S4 Embodied: S3 Recursive cognition plus general-purpose robots at scale, including robots that help build robots.

- **Yes, robotics is already bleeding in, and fast in growth rate.** Humanoid output roughly doubled every 4-5 months in 2024-26. In share it is still tiny: about 0.1 million general-purpose robots at end-2026, against 5.0 million industrial robots and about 460 million manufacturing workers.
- **By 2031, S4 is a step change at a few firms, not across the economy.** In the base path the fleet reaches about 9 million in 2031, about the size of the industrial-robot stock then (~8.4 million, up from 5.0 million today). That is about 1.3% of global manufacturing labor, but 5-7% of lab and aerospace production labor, concentrated in robot-first firms.
- **Robots compress throughput, not latency.** They cut labor, shift, queue and replicate time. They do not shorten a thermal-vacuum dwell, a creep test, a hot-fire failure, a 229-flight reliability case, a Mars window, a Phase III endpoint or a statutory review.
- **Amdahl, recomputed.** A new space program's compression ceiling rises from 51% (S3) to 56% for a typical program and 60-64% at robot-first firms by 2031, then 68-73% by 2035. Infinite cognition plus infinite robots still stops at about 77%. Infrastructure gains 2-13 points over S3 by 2031, drug programs about 5 and new materials about 6. By 2035 robots add about 12-20 points for space and infrastructure, 12 for materials and only about 7 for drugs.
- **The robots-build-robots loop is not super-exponential before the early 2030s.** It stops the usual slowdown, holding production doubling near 9-12 months instead of 15-18. That gives about 2x more robots by 2031 and 5-10x more by 2035. Energy, magnets, capital, permitting and the reliability long tail cap it. Before 2035, energy rules out a doubling of the whole physical economy in under two years.
- **For the tree:** 19 of the 150 tier 5-7 nodes move earlier, by about 0.9 years on average, 6 rise from Medium to High and 3 from Low to Medium. 113 do not move at all. Regulatory, Mars, nuclear, data-bound and physics-bound nodes are untouched.
- **The rumor** is unsubstantiated. If true, it says more about the cognitive clock (S2 versus S3) than about robots or launch dates.

## 1. S4 defined

**S4 Embodied** is S3 Recursive cognition plus general-purpose robots at scale. S3 means cognitive work runs 20-50x faster from about 2029. The robots are humanoids and mobile manipulators run by foundation models, working in factories, labs, test facilities, construction and off Earth. S4 assumes S3 cognition turns dexterity and reliability into mainly software problems by about 2028. S3 already assumes AI-run test stands and factories with physical multipliers of about 1.3-1.5x. What S4 adds is labor that runs 24/7, works in parallel and is cheap.

**Where we start (October 2026).** Global humanoid shipments were 13,318 in 2025 ([Omdia via TechNode, Jan 9 2026](https://technode.com/2026/01/09/chinas-agibot-leads-global-humanoid-robot-shipments-in-2025-omdia-says/)) and about 25,000 in H1 2026, up 432% ([IDC, Oct 2 2026](https://roboticsandautomationnews.com/2026/10/02/idc-data-shows-agibot-led-global-humanoid-robot-shipments-in-h1-2026/105463/)). More than 97% came from Chinese makers. The IFR counts only about 7,000 full-size humanoids sold for professional use in 2025 and says most "often need human teleoperation" ([IFR, Sep 30 2026](https://www.zawya.com/en/press-release/asia-press-releases/global-sales-of-professional-service-robots-surge-24-1458551)). In January 2026 Musk said no Optimus was doing useful work in Tesla factories ([Electrek, Jan 28 2026](https://electrek.co/2026/01/28/musk-admits-no-optimus-robots-are-doing-useful-work-at-tesla-after-claiming-otherwise/)).

The best paid deployments are single-task:

- Agility Digit: more than 65,000 customer-site hours and about 98% on-task accuracy at GXO ([Form 425, Sep 15 2026](https://www.sec.gov/Archives/edgar/data/0002074973/000121390026100159/ea0305579-425_churchill.htm)).
- Figure 02 at BMW: 1,250+ hours of sheet-metal loading at a 5 mm tolerance ([Figure, Nov 2025](https://www.figure.ai/news/production-at-bmw)).
- UBTech Walker S2: 30-50% of human productivity.

Western nameplate capacity has been 1-25% realized. Agility built about 150 units against a 10,000/yr plant, and Tesla built a few hundred against 5,000-10,000.

**Fleet trajectory** (general-purpose robots, millions; active fleet at end of year, 5-year life). Multipliers for 2027-2031 are from the ramp research; the post-2031 paths are ours.

| Path (weight within S4) | Shipments 2026 / 2028 / 2029 / 2031 / 2035 | Active fleet 2028 / 2029 / 2031 / 2035 | Output doubling 2026-31 / 2031-35 | Fleet passes 1M / 10M / 100M |
| --- | --- | --- | --- | --- |
| Slow (25%): robots stay narrow and half-productive | 0.05 / 0.15 / 0.24 / 0.51 / 1.5 | 0.24 / 0.49 / 1.4 / 4.7 | 18 / 32 months | Q2 2031 / after 2035 / after 2035 |
| Base (55%): useful from 2028; WWII-mobilization pace for 5 years | 0.07 / 0.55 / 1.26 / 4.5 / 30 | 0.76 / 2.0 / 9.0 / 71 | 10 / 18 months | Q2 2029 / Q1 2032 / ~2036 |
| Fast (20%): working loop, wartime capital | 0.10 / 1.2 / 3.0 / 13 / 69 | 1.6 / 4.6 / 24 / ~200 | 8.5 / 20 months | Q3 2028 / Q4 2030 / mid-2034 |

Cross-checks:

- **Bank forecasts sit between slow and base.** Bank 2030 forecasts run 0.45-1.2M shipments: Goldman raised its figure to 0.89M ([247WallSt, Sep 14 2026](https://247wallst.com/investing/2026/09/14/goldman-sachs-just-supercharged-its-humanoid-robot-prediction-5x-to-6-5-million-by-2035/)).
- **Epoch brackets base and fast.** It calls 1.5-3M a year by end-2030 "clearly achievable" after a demand shock and 5-10M "plausible". It also notes that high-precision reducers cap output near 500k a year today ([Epoch, Apr 22 2026](https://epoch.ai/blog/how-fast-could-robot-production-scale-up)).
- **Base is already historic.** A 10-month doubling held for five years matches US aircraft output in 1940-44, the best sustained ramp of a complex machine on record.
- **Outside the S4 premise the ordering flips.** The ramp research weights slow about 50%, base 35% and fast 15%.

**When robots become useful at scale** (base path)

| Setting | Useful at scale | Base fleet there 2031 / 2035 |
| --- | --- | --- |
| Structured factory and warehouse, single task | Now (low thousands of units) | ~4M / ~29M (manufacturing) |
| Structured factory, multi-task; robot makers' own lines | 2028-2030 (safety standard ISO 25785-1 likely ~2028) | included above |
| Labs, general bench work beyond workcells | 2029-2031 | ~0.2M / ~0.7M |
| Aerospace production, I&T, test stands, refurbishment | 2029-30 at leading firms; supply chain after 2031 | ~0.09M / ~0.36M (space needs ~0.05-0.17M) |
| Construction, general trade work | Specialized single-task robots now; humanoids 2031-35 | ~0.36M / ~4.3M (U.S. ~80k / ~0.9M) |
| Off Earth (lunar surface, servicing) | Pilot demonstrations 2029-31 | tens / hundreds |

**Robot labor as a share of today's workforce** (human-equivalents; slow / base / fast)

| Sector | 2031 | 2035 |
| --- | --- | --- |
| Manufacturing (~460M) | 0.1% / 1.3% / 4.8% | 0.4% / 11% / 41% |
| Construction (~250M) | 0.02% / 0.2% / 0.8% | 0.1% / 3% / 11% |
| Lab technicians (~5M, general) | 0.4% / 5% / 20% | 0.9% / 26% / saturates |
| Aerospace production (~2M, general) | 0.6% / 7% / 24% | 1.2% / 32% / saturates |

Concentration matters more than averages. If the US hosts a quarter of the fleet, robots supply about 11% of US manufacturing labor in base 2031 and 30% in fast. Vertically integrated firms such as Tesla/SpaceX, BYD and the Chinese humanoid makers sit far above that.

**S4 multipliers by gate class** (calendar speedup)

| Gate class | S3 by 2031 | S4 by 2031 | S4 by 2035 |
| --- | --- | --- | --- |
| Cognitive | 20-50x | 20-50x | 50-100x |
| Experiment and flight test | 1.3-1.5x | 1.4-1.8x (ground I&T 1.7-2.1x) | 1.7-2.3x |
| Fabrication and supply chain | 1.2-1.3x | 1.5-1.8x in-house; 1.3-1.5x supply chain | 2.0-2.7x |
| Qualification | 1.25-1.4x | 1.5-1.8x | 1.9-2.6x |
| Construction (pads, plants, facilities) | 1.1-1.25x | 1.2-1.35x | 1.4-1.8x |
| Regulatory | 1.5-2x | 1.5-2x | 1.5-2x |
| Politics, orbital mechanics, biology's clocks | 1.0x | 1.0x | 1.0x |

## 2. Gate by gate

The rule is simple. A robot runs a step 24/7 and in parallel, so it removes labor, shift and queue time and turns capacity limits into capital limits. It cannot shorten a step whose time is set by physics, statistics, orbital mechanics, biology or statute.

Factory automation in space shows this already. Rocket Lab's Rosie robot cut Electron composite processing from 400+ hours to 12, about 33x ([TechCrunch, Nov 13 2019](https://techcrunch.com/2019/11/13/rocket-labs-new-rosie-the-robot-speeds-up-launch-vehicle-production-by-a-lot)). Cadence rose only about 3.5x in six years, to 21 launches in 2025. SpaceX builds about 70 Starlink satellites a week and holds Starship hulls ahead of flights ([SpaceX S-1/A](https://www.sec.gov/Archives/edgar/data/0001181412/000162828026040364/spaceexplorationtechnologib.htm)). The gate has moved to launch and flight learning.

**Space gates.** The table extends the model's physical-gate table. Factors are calendar time as a fraction of 2026 duration. The split is the share of each gate's calendar that is labor-bound (L), physics-bound (P: time constants, statistics, windows, biology), materials, energy and capital-bound (M) and institution-bound (I). All S4 values and splits are estimates.

| Gate | 2026 | S3 2031 | S4 2031 | S4 2035 | L/P/M/I % | What cannot compress |
| --- | --- | --- | --- | --- | --- | --- |
| Clean-sheet launcher | 5-13 yr | 0.7-0.8 | 0.65-0.75 | 0.5-0.65 | 35/40/15/10 | Hot-fire and flight failures; pads |
| New engine to flight | 6-13 yr | 0.7-0.8 | 0.65-0.75 | 0.5-0.65 | 35/40/15/10 | Turbopump failures appear only in hot fire |
| Engine and vehicle production rate | Raptor ~1/day (2022) | 0.7-0.8 | 0.5-0.7 | 0.35-0.55 | 45/20/30/5 | Acceptance hot fire per engine; buildings, castings |
| Integrated flight-test interval | 48-91 days | 0.5-0.7 | 0.45-0.65 | 0.35-0.55 | 35/35/0/30 | Serial build-fly-learn; mishap closure |
| Mishap to return to flight | 5 days-4 months | 0.5-0.8 | 0.45-0.7 | 0.4-0.65 | 35/30/10/25 | Retest physics; FAA acceptance |
| Reuse learning | 3-5 yr to 10+ flights | 0.7-0.8 | 0.65-0.75 | 0.55-0.7 | 25/65/0/10 | Each life data point costs a flight |
| Heavy launch cadence | Starship 3 flights in 2026 | 0.5-1 yr earlier | 1-1.5 yr earlier than S2 | Pads, propellant, airspace | 35/40/0/25 | Failures cost 1-12 months each |
| Satellite generation (commercial) | 18-36 months | 0.5-0.7 | 0.45-0.6 | 0.35-0.5 | 35/20/30/15 | Launch; payload qualification; ITU |
| Environmental qualification | 6-18 months | 0.7-0.8 | 0.6-0.7 | 0.45-0.6 | 35/40/10/15 | GEVS: ≥4 cycles, ≥12 h plateaus |
| Test-stand and arc-jet queues | Ames is NASA's sole TPS arc jet | ~0.67-0.77 | 0.6-0.75 | 0.4-0.6 | 40/25/25/10 | Arc-heater power; flight is the final test |
| Material or process qualification | 10-20+ yr | 0.5-0.7 | 0.5-0.6 | 0.4-0.55 | 20/50/0/30 | 10^4-10^5 h creep; multi-lot allowables |
| Reliability by test | ~229 trials (0.99/90%) | Unchanged | Components 0.3-0.5; system = trials ÷ cadence | 229 flights: 9.2 yr at 25/yr, 0.6 yr at 400/yr | 10/90/0/0 | The trial count |
| Human rating | ~6 yr | 0.8-0.9 | 0.8-0.9 | 0.75-0.85 | 10/40/0/50 | Crewed tests; review boards |
| FAA Part 450, NEPA, spectrum | 180 days; EIS 2.2 yr | 0.5; 0.7; 0.5 | Same | Same (NEPA 0.6-0.7) | 0/0/0/100 | Statute, comment, litigation |
| Pad and propellant plant | 2-4 yr; Pad 2 ~16 months | 0.8-0.9 | 0.75-0.85 | 0.55-0.7 | 35/15/35/15 | Transformers 128-160+ weeks; permits |
| Long-lead parts | 12-24+ months | 0.8-0.9 | 0.75-0.9 | 0.55-0.75 | 30/20/30/20 | Fab capacity; requalification 6-24 months |
| In-space assembly and servicing | MRV launched Jul 21 2026 | n/a | 0.6-0.75 | 0.45-0.6 | 20/45/10/25 | Flight demos 2-4 yr each |
| Lunar construction and ISRU | No demo flown | n/a | 0.6-0.8 vs S3 | 0.4-0.6 | 0/30/50/20 | Landed mass; power through lunar night |
| Mars learning loop | 26-month windows | 1.0 | 1.0 | 1.0 | 0/100/0/0 | 1-2 cycles by 2031, 3-4 by 2035 |
| Space nuclear; flagship | 5+ yr; 8-15 yr | 0.8-0.9; 0.85 | Same | 0.7-0.85; 0.8 | Mostly I and M | HALEU, NSPM-20, appropriations |
| Hardware cost; internal launch cost | ~$4,915/kg Flight 14 | -25-40% dev labor | Unit cost -10-25%; cost milestones 0.5-1.5 yr earlier than S2 | -25-45% | | Flights to prove reuse; market structure |

Sources: [research-space.json](research-space.json) (S-1/A, NASA TFAWS 2026, NTRS 2024, NSF), model gate table, [LBNL/pv magazine on transformers (May 11 2026)](https://pv-magazine-usa.com/2026/05/11/u-s-transformer-market-faces-severe-supply-constraints-as-lead-times-extend-to-four-years/).

**Beyond space** (selected; full table in JSON)

| Gate | 2026 | S3 2031 | S4 2031 | S4 2035 | Binds after robots |
| --- | --- | --- | --- | --- | --- |
| Earthwork and piling | weeks-months | 0.9 | 0.5-0.7 | 0.3-0.5 | Soil, weather |
| Large transformer delivery | 128-144 weeks | 0.9-1.0 | 0.8-1.0 | 0.5-0.7 | Factory build; GOES steel; rising demand |
| Generator interconnection | 61 months median | 0.75-0.85 | same | 0.55-0.75 | Study cycles |
| U.S. fab, permit to output | ~38 months (Taiwan ~19) | 0.8-0.9 | 0.65-0.8 | 0.5-0.6 | Tools; yield ramp |
| Target to preclinical candidate | 2.5-4 yr (AI-native ~13 months) | 0.3-0.4 | 0.15-0.25 | 0.1-0.2 | In-vivo models |
| Phase III | 3.3 yr | 0.9-0.95 | 0.9 | 0.75-0.85 | Endpoint duration, n |
| Cast-in-place concrete | 28 days | 1.0 | 1.0 | 1.0 | Hydration chemistry |

Equipment lead times are queues, and a queue's lead time is its backlog divided by its throughput. Robots raise throughput, but AI demand raises the backlog too. GE Vernova held 116 GW under contract or reservation against about 20 GW a year of output ([Turbomachinery, Jul 22 2026](https://www.turbomachinerymag.com/view/ge-vernova-gas-turbine-backlog-hits-116-gw-as-power-orders-more-than-double)). Speed also provokes backlash. Texas froze all data-center permits on Sep 21 2026 ([Bracewell, Sep 23 2026](https://www.bracewell.com/resources/governor-abbott-orders-tceq-to-pause-all-permit-issuance-for-data-center-projects/)).

## 3. Amdahl, recomputed

**(a) A new space hardware program.** We keep the model's critical-path shares: 35% cognitive, then fabrication 25%, integration and test 25%, qualification 10% and launch 5%. Each physical slice is split into labor, physics, materials and institution sub-shares, and the S3 sub-multipliers are calibrated to reproduce the model's 51%. S4 then raises mainly the labor multipliers: 2.2-4x by 2031 and 4-8x by 2035.

| Case | Ceiling: % shorter (speedup) | Realized |
| --- | --- | --- |
| S2 2031 (check) | 38% (1.6x) | 20-30% |
| S3 2031 | 51% (2.05x) | 35-45% |
| S3 with infinite cognition | 53% (2.1x) | n/a |
| S4 2031, typical program | 56% (2.3x) | 38-46% |
| S4 2031, leading firm | 60% (2.5x) | 42-50% |
| S4 2031, robot-first integrated firm | 64% (2.8x) | 45-55% |
| S3 2035 | 56% (2.25x) | 40-48% |
| S4 2035, central / high | 68% (3.1x) / 73% (3.7x) | 50-62% |
| Floor: infinite cognition and robots (2031 / 2035 institutions) | 69% / 77% (4.4x) | n/a |

What is left matters as much as the headline. Under S3 2031, labor is 29% of the remaining critical path. Under S4 2035 it is 16%, while physics and statistics rise from 35% to 43% and institutions from 16% to 22%. In S4, schedules end up set by physics and paperwork.

**(b)-(d) Infrastructure, drugs and materials**

| Program | S3 2031 | S4 2031 | S3 2035 | S4 2035 | Ceiling or note |
| --- | --- | --- | --- | --- | --- |
| U.S. grid-connected data center or power plant | 19% | 21% (average) to 28% (leading edge) | 25% | 38-45% | 56% with labor and equipment free |
| Permissive or behind-the-meter build | 18% | 21-31% | 25% | 45-54% | 79% |
| Small-molecule drug (16 yr baseline) | 30% (11.3 yr) | 35% (10.4 yr) | 41% (9.4 yr) | 48% (8.3 yr) | 34% if every lab step took zero time |
| New material to flight qualification (15 yr) | 32% (10.2 yr) | 38% (9.3 yr) | 43% (8.6 yr) | 55% (6.8 yr) | 40-45% without model-based allowables |

**Infrastructure.** Critical-path shares come from the infrastructure research. For a U.S. grid-connected project they are 40% institutional, 20% equipment queue, 25% field labor, 10% physics and 5% capital. For a permissive project they are 15/35/40/10/0. Best practice is already 3-12x faster than typical without robots: xAI built Colossus 1 in 122 days with human crews ([SemiAnalysis, Sep 16 2025](https://newsletter.semianalysis.com/p/xais-colossus-2-first-gigawatt-datacenter)). Robots mainly raise how many such sites run at once. Interconnection takes 61 months median ([LBNL Queued Up 2026](https://eta-publications.lbl.gov/sites/default/files/2026-06/queued_up_2026_edition.pdf)).

**Drugs.** Phase I through review takes 10.5 of a typical program's 16 years ([BIO 2011-2020](https://www.bio.org/clinical-development-success-rates-and-contributing-factors-2011-2020)). Rentosertib is the empirical test. AI saved about 3 years before the first human dose and none afterwards; Phase III runs from Jul 2026 to a readout around late 2029 ([Wikipedia](https://en.wikipedia.org/wiki/Rentosertib)). Robots' bigger lever is probability of success. Raising Phase II success from 29% to 40-50% cuts programs per approval by 30-40%.

**Materials.** Discovery and synthesis shrink to under a year. Creep, fatigue, multi-lot allowables and insertion keep about two-thirds of what remains. The A-Lab correction shows the new bottleneck is characterization, not synthesis: 36 of 40 claimed successes were confirmed ([PMC, Jan 2026](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12872444/)).

## 4. The feedback loop

**Is robots-build-robots super-exponential?** Not before the early 2030s. Super-exponential growth means the doubling time keeps shrinking. Every historical ramp of a complex machine does the opposite. Output doubles every 3-8 months for 1-3 years from a small base, then slows to doublings of 12-36 months as a downstream gate binds. US aircraft held about 10 months over 1940-44. BYD went from about 7 months to about 28. FANUC has built robots with robots, lights-out, since 2001, and its output still doubled only about every 7 years because demand set the rate ([FANUC, 2016](https://fanuc.co.jp/en/ir/announce_other/pdf/2016/notice20161011_e.pdf)).

**What the loop actually buys:**

- **Labor is cheap to close.** Robot production labor is small. 4.5M robots a year at 100-300 supply-chain hours each is 0.2-0.7M full-time workers, which 1-3% of the 2031 base fleet could replace.
- **Its leverage is time and capital, not labor.** It removes hiring lag: Willow Run needed 42,000 workers and about 18 months to reach rate. Running capital 24/7 roughly halves capital per unit of output.
- **The effect is real but bounded.** Holding production doubling at 9 months from 2029, instead of letting it decay to 15, gives about 2.1x more robots by 2031 and 9x by 2035. Holding 6 months against 12 gives 4x and 64x.
- **The order in which it bites:** inside robot makers' own lines in 2028-29, across the robot supply chain (reducers, screws, motors) in 2030-32, and up the capital-goods chain (machine tools, furnaces, fabs, construction) in the mid-2030s.

Forethought's estimate is roughly a 1-year doubling for self-replicating robots with abundant AI cognition, "a few years" with real-world frictions, and days to weeks only as a far limit ([Forethought, May 21 2025](https://forethought.org/research/the-industrial-explosion)).

**What caps it**

| Cap | When it binds |
| --- | --- |
| Precision actuators | 2026-28 in every path. Thread-grinding for roller screws is tight; harmonic reducers had ~4-5M/yr of capacity in 2026, against ~60M reducer-equivalents/yr the base path needs by 2031 |
| Reliability long tail | 2026-29. Lab success of 50-95% must reach >99.x% in the field; hardware generations take 12-30 months |
| Capital | Base: ~$70-180B/yr by 2031 and $0.4-1.2T/yr by 2035; fast: $0.2-0.5T/yr by 2031 |
| NdFeB magnets | Politically now (Chinese export licensing). Physically: base 2035 needs 18-40% and fast 2035 needs 42-94% of 2025 world output of ~330 kt ([FAI](https://policygradients.thefai.org/p/the-robot-boom-has-a-magnet-problem)) |
| Chips | Not by unit count. Leading-edge capacity is shared with AI data centers: one 100k wafer-starts-a-month Terafab-class fab yields ~44M chips/yr, and Tesla cars plus Optimus need 5-6M ([33FG/Mach33, May 27 2026](https://research.33fg.com/analysis/pricing-terafab-a-bottom-up-the-s-1-won-t-give-you)) |
| Factory build and permits | 6-12 months per expansion step in China, 2+ years in the West |
| Energy | Not for the robots themselves: the base fleet uses ~14 TWh/yr in 2031 and ~107 TWh in 2035, under 0.4% of world electricity. Energy does bind compute, fabs, smelting and any economy-wide doubling. Installing all of the world's ~1.1 TW/yr of solar module output would add only ~4-5% a year to world electricity ([SolarPower Europe, Jun 2026](https://www.solarpowereurope.org/press-releases/new-report-global-solar-market-hits-new-record-of-664-gw-installation-in-2025-as-global-solar-fleet-passes-3-tw)) |

For an economy-wide effect, robots would have to supply about 10% of global manufacturing labor. In our paths that happens around 2035 in base (11% of today's manufacturing workforce) and 2032-33 in fast. Construction lags further: 3% in base by 2035.

**Earliest year physical output could double in under two years** (bands are judgments: High >~70%, Medium 30-70%, Low 10-30%, Speculative <10%)

| Sector | Earliest | Band | Driver |
| --- | --- | --- | --- |
| General-purpose robot production | Already (4-5 month doubling) | High | Small base; held under 24 months through 2031 in base |
| Robot actuators (reducers) | Already (Leaderdrive ~0.43M to >1M capacity, 2025-26) | High | Humanoid demand |
| Autonomous-lab experiment capacity | Already (Ginkgo ~50 to ~100 workcells in 2026) | High | Capex, not humanoids |
| Mass to orbit | 2027-28 | Medium (High by 2029-30) | Starship reuse, not robots: ~2,690 t in 2025 against a Mach33 reference of 10,100 t of Starlink in 2028 |
| Satellite manufacturing (mass) | 2027-29 | Medium | Starship V3, orbital compute |
| Lunar surface activity | 2028-30 | Medium | Tiny base; Starship cargo |
| Manufacturing value added, leading economy | 2033-35 | Low by 2035 (Speculative by 2031) | Needs ~41%/yr growth; only WWII did it |
| Leading-edge wafer output | 2031-33 | Low | Fabs take 2-4 yr; ASML shipped 48 EUV tools in 2025 |
| Construction output | After 2035 | Speculative | Equipment queues, permits |
| Grid electricity | After 2035 | Speculative | Growth tops out at ~4-8%/yr |
| Drug approvals | After 2035 | Speculative | Human trial clocks |
| NdFeB magnet output | After 2035 | Speculative | Mines take 7-15 yr (general) |

The pattern: what doubles fast is either small (robots, labs, lunar work) or riding a non-robotic exponential (launch). Large mature sectors do not double in under two years before 2035, except plausibly one leading economy's manufacturing in the fast path.

## 5. The rumor: three dumps

We found no OpenAI statement or named report that calls the Oct 6 release one of three dumps ([openai/math](https://github.com/openai/math)). The repository has a single commit, and OpenAI wrote only "for future releases" ([Engadget, Oct 7 2026](https://www.engadget.com/2279815/openai-just-posted-hundreds-more-results-on-major-math-problems/)). The rumor probably comes from three sources:

- Three OpenAI math releases in about 9.5 weeks: Astra's ten results on Aug 1, the Navier-Stokes claim on Sep 8 and openai/math on Oct 6.
- Staff remarks suggesting held-back results ([Scientific American, Oct 6 2026](https://www.scientificamerican.com/article/openai-unleashes-hundreds-more-math-results-upon-a-field-already-in-shock/)).
- Reported progress on three other Millennium problems ([Fortune, Oct 7 2026](https://fortune.com/2026/10/07/openai-math-controversy-solutions-370-outstanding-challenges-published-criticisms-celebration/)).

**If it is true, it implies:**

- Research-grade mathematics is cheap and plentiful. Output went from 10 results to 372 families in 66 days, a 12.6-day doubling. That measures throughput (about 4,000 problems posed, about 9% kept), not task-horizon capability.
- Moderate evidence for upper S2 or an earlier S3. Shift about 10-15 points toward S3 and run a sensitivity case with recursion starting in 2027.

**It does not imply:**

- Faster robots. AI mathematics is a second-order input to robotics, worth about 1.1-1.3x on the robotics timeline in S2 and 1.2-1.5x in S3. Its main contributions are contact simulation and formal safety certificates. Robotics is bound by data diversity, hands, reliability, components and certification.
- Shorter space programs. Infinite cognition moves the ceiling only from 51% to 53%.
- Recursion. That would need the dumps to come from successively stronger models a few weeks apart.

The S4 premise does depend on frontier AI in general (vision-language backbones, world models, coding agents writing controllers), so more evidence for S3 does make S4 somewhat more likely.

## 6. What S4 changes in the Space Unlock Tree

Of the 150 tier 5-7 nodes:

- 19 move earlier, by 0.86 years on average.
- 15 gain months within the same year and band.
- 3 move by 2035 but not by 2031.
- 113 do not move.

Averaged over all 150, S4 adds about 0.13 years by 2031. That is about a third of what S3 adds over S2 for the same tiers (0.39 years). High-or-Medium nodes by 2031 rise from 92 to 95 and High nodes from 35 to 41.

**Nodes that move earlier** (S3 → S4: earliest year, band by 2031)

| Node | S3 | S4 | Mechanism |
| --- | --- | --- | --- |
| 100+ fully reusable heavy launches a year | 2029 High | 2028 High | Robotic TPS and pad refurbishment |
| Rapidly reusable orbital heat shield (ship scale) | 2029 Medium | 2028 High | Tile inspection and replacement is the cited bottleneck |
| Starship internal cost under $300 per kg | 2029 High | 2028 High | Cadence plus 10-25% lower hardware cost |
| New satellite generations every year | 2029 Medium | 2028 High | Retooling 0.7-0.8x |
| Lightweight solar arrays at compute-constellation volume | 2029 Medium | 2028 High | Production ramp 0.55-0.7x |
| Ultralight radiators in serial production | 2030 Medium | 2029 High | Same |
| 100 kW-per-tonne compute satellites in serial production | 2031 Medium | 2030 Medium | Same; launch and chips still bind |
| Autonomous labs discover real new materials | 2029 High | 2028 High | Synthesis 0.1-0.2x; characterization binds |
| AI-designed heat-shield material flies | 2030 High | 2029 High | Arc-jet queues 0.6-0.75x |
| First AI-agent-designed alloy flies in a rocket engine | 2030 Medium | 2029 Medium | Parallel allowables; hot fire still needed |
| Engine development time and cost cut | 2031 Low | 2030 Medium | Engine factory 0.5-0.65x; parallel engines |
| Development cycles 20-30% shorter, not 10x | 2030 Medium | 2029 High | Realized 38-55% |
| Qualification campaigns at least 15% shorter | 2030 Medium | 2029 High | Environmental campaigns 0.6-0.7x |
| AI cuts new space hardware development cost by about 10-20% | 2029 High | 2028 High | Adds hardware labor savings |
| Sensors and models track wear on reusable stages | 2031 Medium | 2030 Medium | Robotic inspection data |
| Severalfold more robot work per operator | 2029 High | 2028 High | Robots are the product |
| First robot-built landing pad or blast berm on the Moon | 2030 Low | 2029 Medium | Adaptable robot crews; landed mass binds |
| Robotic assembly in space with certified skills | 2030 Low | 2029 Medium | Manipulation becomes software; flight demos bind |
| Lunar base runs itself between crew visits | 2031 Medium | 2030 Medium | Robots replace crew maintenance; power binds |

**Move by 2035, not 2031:**

- Kilometre-scale monolithic structure in orbit. Robotic in-orbit assembly decouples structure size from fairing size.
- New space materials reach flight in five years or less. This needs model-based allowables.
- A new reusable launcher from start to orbit in three years. Even at 0.65-0.75x, a 5-13 year program takes 3.3-9.8 years by 2031.

Pads and propellant plants, the tonne-per-year lunar oxygen plant and the 12-14 km/s entry design basis gain months by 2031 and more by 2035, once robots reach equipment makers and construction.

**Nodes that do not move at all:**

- **Regulatory (9).** Examples: Launch licensing in weeks; Proof-backed autonomous flight termination under FAA rules; Crewed lander autonomy certified with AI proofs.
- **Orbital mechanics (6).** Examples: First landing of 20 t or more on Mars; Starship-scale propellant plant on Mars.
- **Nuclear (4).** Examples: A U.S. fission reactor launched; A 100 kW-electric fission reactor operating on the Moon.
- **Physics and frontier technology (7).** Examples: 12 kW Gateway thruster passes a three-year wear test; First magnetic-fusion net energy gain.
- **Data and nature (8).** Examples: Solar-storm arrival forecast within about 8 hours; LISA nodes.
- **Chip fabs (3).** Example: AI-designed radiation-tolerant space processor.
- **Institutional acceptance (8).** Examples: Crew and defense payloads fly on data-cleared reused rockets; Model-priced insurance.
- **Cognitive and adoption nodes (25)** that robots do not touch. Examples: Verified flight code 15-120x cheaper per line; Math expertise stops limiting space programs.
- **Launch-, demonstration- or funding-bound missions (43).** Examples: Both Starship stages caught and reflown; Full lunar-lander refueling campaign; Commercial AI chips running in orbit at scale.

**One node to add:** a robotic-process requalification standard (AS9100, NADCAP and customer acceptance of robot-made flight hardware). It is the institutional gate on S4 adoption in aerospace.

## 7. Signposts

- **Full-year 2026 humanoid shipments:** under 50k points to slow, 70-100k to base and over 150k to fast.
- **Proof of useful work:** a humanoid maker publishes fleet mean time between interventions, or Tesla reports Optimus units in productive use.
- **Safety standard:** ISO 25785-1 reaches DIS, or the first uncaged deployments appear.
- **Robots building robots:** humanoids do final assembly of humanoids, not just handling.
- **Space adoption:** humanoids do paid aerospace assembly or test-stand work, or SpaceX discloses robot counts. Starship ship turnaround falls under a week.
- **Equipment queues:** transformer lead times fall below 100 weeks while demand is still rising.
- **Magnets:** China's rare-earth decision around Nov 10 2026, and new magnet capacity outside China.
- **Evidence rules:** a regulator accepts model-based allowables or reliability priors.
- **The rumor:** a further batch of results from a newer OpenAI model within weeks.

*Method.* This draft synthesizes six research files compiled on 7 Oct 2026 ([capability](research-capability.json), [ramp](research-ramp.json), [space](research-space.json), [infrastructure](research-infrastructure.json), [biology](research-biology.json), [theory](research-theory.json)) and graph-v5.json. The web-search quota was exhausted for this synthesis, so no new searches were run; two 33FG items on Terafab were checked directly. Fleet paths, labor shares, sub-share splits, multipliers, Amdahl results and node moves are our estimates, computed by script and reproduced in `s4-embodied.json`. Figures marked (general) are unsourced background.

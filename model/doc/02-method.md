The model asks one question of space technology. If AI keeps getting better at research mathematics, and then gets robot hands, which problems become solvable, and what does each solution unlock further down the line? The answer is a skill tree of {{n_nodes}} nodes joined by {{n_hard}} hard and {{n_soft}} soft dependencies, organized in {{n_branches}} branches.

**Scope.** Space technology and development, including the physics and engineering disciplines that feed it, from October 2026 to the end of 2035. Likelihoods are judged for every year: each node records the first year its odds reach Low, Medium and High, and the end-2031 and end-2035 ratings are read off that series.

**The trigger.** OpenAI's [openai/math](https://github.com/openai/math) release of 6 October 2026, from an unreleased model.

- 722 manuscripts in 372 result families, dated 10 September to 6 October 2026.
- About 4,000 problems were posed. The 372 families are the results that survived the lab's aggregation and significance filter.
- In 127 families (counted from the repository's `formalization.yaml`), at least one manuscript's main result has an agent-written Lean proof. The repository marks these proofs unchecked. Auditors also found Lean documentation for more families than that, and the difference has not been reconciled.
- No outside expert audit had been reported by 7 October.

A Lean check covers only the formal statement, which can be narrower than the headline. The quasi-Riemann challenge, for example, targets the zeta function only, not every Dirichlet L-function. In this tree, families 104, 117, 143, 263, 347 and 365 have formal parts narrower than their headlines, and the rest of each headline is treated as manuscript-only.

**Nodes.** Each node is something that can be solved or achieved. Tiers run from the AI capability itself down to strategic outcomes:

| Tier | Layer | Clock |
| --- | --- | --- |
| 0 | AI capability and infrastructure | Cognitive |
| 1 | Frontier mathematics | Cognitive |
| 2 | Applied mathematics, numerics and verification methods | Cognitive |
| 3 | Physics models and theory | Cognitive |
| 4 | Engineering tools and methods | Cognitive |
| 5 | Validated technology (ground test or flight demonstration) | Physical |
| 6 | Operational systems and missions | Physical |
| 7 | Strategic and economic outcomes | Physical |

Every node carries, for each of the four scenarios, an **earliest credible year** and two **likelihood bands**.

- The earliest credible year is the first year the node is credibly achieved: a result proved, a tool in routine use, a first flight.
- The two bands are the chance it happens by the end of 2031 and by the end of 2035.

Each node also names its **binding gate** (the slowest thing between it and reality) and its **translation pathway**. It records the **trust tier** of any AI-math result it rests on, the causal chain behind its timing, the strongest case that its effect is small, and a signpost to watch. A node with an early year and a Low band could happen that early but probably will not by the year the band refers to. A node is rated Speculative for every year before its earliest year, except in the robots branch, where years follow the base robot path and odds also weigh the faster path. A node is never rated likelier by a year than any of its hard prerequisites. Node tiers are written "tier 0" to "tier 7" throughout, to keep them apart from trust tiers (T1–T5).

**Edges.** A hard edge means the dependent node cannot be achieved before its prerequisite. A soft edge means the prerequisite speeds the dependent up but is not required. No node is dated earlier than any of its hard prerequisites in any scenario.

**How it was built.** The work ran in seven stages, each done by independent AI research agents under the framework below.

1. *Research.* Thirteen researchers each took one domain:
   - flight software and certification;
   - astrodynamics, guidance and space traffic;
   - propulsion and combustion;
   - plasma, electric propulsion and space weather;
   - hypersonics and entry;
   - materials and electronics;
   - structures, thermal, power and orbital compute;
   - communications and security;
   - autonomy, robotics and in-situ resources;
   - space science;
   - the mathematics frontier;
   - the AI capability curve;
   - the physical clock.

   Each started from what its field actually spends mathematical effort on, not from the release's catalog, and searched current sources. Together they cited about 600 sources.
2. *Integration.* Duplicate nodes were merged and cross-domain dependencies added. Timings were calibrated against a lag ladder for the central scenario, measured from design-complete rather than program start, to first flight:
   - small satellite or derivative payload: 12–18 months;
   - new launch-vehicle subsystem: 2–3 years;
   - new engine: 4–6 years;
   - crewed system: 5 years or more;
   - space reactor: 4–6 years from a funded start.
3. *Challenge.* Each branch went to three independent reviewers:
   - a physics-and-engineering skeptic;
   - an advocate for the exponential premise;
   - an auditor who checked the framework's rules and the load-bearing facts against their sources.

   A resolver for each branch accepted about 720 changes, rejected about 130, and recorded the disputes (section 10). The auditors flagged 173 facts; about 40 were contradicted by their sources and corrected, including two that appear to have been fabricated.
4. *Completeness.* Two critics checked coverage against a map of space sectors and of downstream disciplines. They added 20 nodes covering Earth observation, positioning and timing, national-security tracking, space insurance, debris removal, power electronics, photonics and others.
5. *Clean-up and review.* Residual errors were swept from tables and notes, and high-likelihood hardware outcomes were re-audited. Three final reviewers then checked the document against the graph, the framework's rules and a reader's needs.
6. *Robots.* Six researchers studied robot capability, production ramps, the space physical clock, infrastructure, biology and the economics of an "industrial explosion". A skeptic and an advocate challenged the resulting Embodied scenario before a resolver settled it (section 4).
7. *Extension to 2035.* A new robots branch was built. Every other branch was then re-dated to 2035 and given Embodied values and new 2032–35 nodes. Each branch went through a skeptic and an advocate, and a resolver settled it. About 240 changes were accepted and about 90 rejected, and the disputes are recorded with each branch.

**Framework.** The model uses the AI Mathematics Frontier Analyst framework.

- *Trust tiers for AI-produced results:*
  - T1: a manuscript only.
  - T2: a manuscript plus a named outside expert's endorsement.
  - T3: a Lean proof of the main result in the lab's repository, unchecked by outsiders.
  - T4: a T3 result plus an independent Comparator run and an audit of the formal statement against the manuscript.
  - T5: established, meaning independently reconstructed, refereed or reused.

  Nothing in the October release is above T3. Implications that rest on a T1 or T2 result are labeled conditional and dropped one band.
- *Translation pathways:*
  - P1, capability transfer: teams pose their own hard math, within 0–2 years of public access.
  - P2, formal verification: 2–4 years to certified use.
  - P3, ceilings and counterexamples: months.
  - P4, practical algorithms: 1–5 years when the constants are practical, never when the speedup is galactic.
  - P5, model confidence: 1–3 years.
  - P6, new theory into tools: 4–10 years.
  - P7, physical or hardware outcomes: usually more than 5 years.
- *Likelihood bands:* High (roughly over 70%), Medium (30–70%), Low (10–30%) and Speculative (under 10%). They are judgments, not computed probabilities. The 2035 band is never below the 2031 band.

**Where this model departs from the framework's defaults.** The framework starts each implication at its pathway's default band (High for P1 and P3, Medium for P2, Medium or Low for P4 and P5, Low for P6, Speculative for P7) and adjusts only downward. This model departs from that on purpose, in four ways.

1. In the Exponential and Recursive cases, the premise itself lifts many cognitive-tier nodes above their pathway default.
2. A few hardware nodes are raised with stated reasons, such as commercial capsules that iterate in months.
3. Exogenous launch anchors take their bands from industry forecasts.
4. For frontier-mathematics nodes, the bands are the judged chances that the result is independently checked by each year.

Two framework rules are kept:

- anything that needs a regulator's or certifier's acceptance is capped at Medium by 2031. By 2035 it may be High only where acceptance runs through a named mechanism already in use, such as DO-333 credit through an already-qualified checker;
- implications that rest on T1 or T2 results drop one band.

A third rule would cap at Medium anything that depends on the internal model becoming public. It is not applied to the trunk node "Research-grade math for outside teams" (High in every scenario), because public release is how the scenarios are defined. Everything downstream of that node is conditional on the release happening.

**Terms used throughout.**

- *Lean* is a proof language in which a computer checks every step. *Mathlib* is its shared library.
- *Comparator* re-checks a Lean proof against its stated target theorem. A *statement audit* is an expert check that the formal statement says what the paper claims. *Hexagon* is a community repository for AI-generated mathematics, launched on 6 October 2026, and a likely venue for both.
- *Certified* or *guaranteed* error bars are proven bounds. *Honest* or *calibrated* error bars are estimates that state their uncertainty but carry no proof.
- A *galactic* algorithm is faster only at problem sizes too large to occur in practice.
- *Posing* is stating an engineering question precisely enough for a machine to prove an answer.
- *Forced* Navier–Stokes is the setting of OpenAI's September 2026 blowup claim. That setting uses a smooth external force, which two of the Clay prize's four official statements allow. The *unforced* problem remains open, and Clay still lists the prize as unclaimed.
- *Binding gates* name what holds a node back:
  - cognitive: the mathematics or design itself;
  - formalization: making it machine-checkable;
  - adoption: organizations choosing to use it;
  - launch-internal: launch on SpaceX's own manifest (Starlink, SpaceX's orbital compute, lunar-lander tankers and cargo, Mars), which sees SpaceX's internal cost;
  - launch-external: launch bought by anyone else (outside orbital-compute operators, small lunar and cislunar missions, science missions, other constellations), which waits for customer access and pays customer prices;
  - data, experiment, fabrication, qualification, regulatory or capital.

  **The rule.** We assign each node the gate whose removal would move its earliest year the most in the central scenario (Exponential). The runner-up gate is the one whose removal would move it the next most. Ties go to the gate later in the physical chain (cognitive, formalization, data, experiment, fabrication, qualification, regulatory, capital, launch, adoption). Each node from tier 5 up records both gates and a one-clause note giving the ranking. Launch splits in two because, in Mach33's Launch Keystone, an activity can become viable for a provider using spare capacity on its own rocket before it becomes viable for a customer buying a flight.
- *Exogenous* nodes, such as Starship reuse and launch cost, do not depend on AI mathematics. They are in the tree because AI-math nodes depend on them.
- *General-purpose robots* are humanoids and mobile manipulators run by AI models that can do many tasks. Specialized automation (welding cells, tile installers, lab workcells) is already counted in the Exponential and Recursive cases.
- *Robot-first firm* is a firm that redesigns its factory, test and integration lines around robots rather than adding robots to human lines.

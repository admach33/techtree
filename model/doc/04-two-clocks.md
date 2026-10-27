Every node in the tree runs on one of two clocks.

- The **cognitive clock** governs mathematics, theory, design, software and verification.
- The **physical clock** governs experiments, test campaigns, fabrication, qualification, launch, regulation and budgets.

The exponential premise accelerates the first and touches the second much less. Robots are the one mechanism in the model that acts on the second directly, and section 4 treats them. This is the most important structural fact in the model.

The tree measures it directly.

- **The cognitive layers move a lot, and surely.** Going from Plateau to Exponential pulls tiers 0–4 forward by {{shift_cog}} years on average. Under Exponential, {{hm31_cog_s2}} of each cognitive tier is rated High or Medium by 2031, and {{hm35_cog_s2}} by 2035.
- **The physical layers move later, and less surely.** Tiers 5–7 move {{shift_phys}} years. Under Exponential, the shares of each physical tier rated High or Medium are:

  | Tier | By 2031 | By 2035 |
  | --- | --- | --- |
  | Validated technologies | {{hm31_t5_s2}} | {{hm35_t5_s2}} |
  | Operational systems | {{hm31_t6_s2}} | {{hm35_t6_s2}} |
  | Strategic outcomes | {{hm31_t7_s2}} | {{hm35_t7_s2}} |

- **Recursive and Embodied add less.** Going from Exponential to Recursive adds {{shift_s3}} years. Going on to Embodied adds {{shift_s4}} years across the tree, or {{shift_s4_phys}} years on the physical tiers. By 2035, Embodied lifts the share of physical tiers rated High or Medium to {{hm35_t5_s4}}, {{hm35_t6_s4}} and {{hm35_t7_s4}}.

The physical layers move at all mainly because their cognitive prerequisites arrive sooner. Tests, factories and launches do not themselves get much faster before robots arrive.

**The two clocks, year by year.** The table shows the share of each half of the tree that is unlocked: its year has arrived and its odds for that year are High or Medium. Every node records the first year its odds reach Low, Medium and High in each scenario, so it carries a rating for every year from 2026 to 2035, not only at end-2031 and end-2035. The table covers {{n_cog_nodes}} cognitive and {{n_phys_nodes}} physical nodes, and it is the series behind the viewer's headline chart. A node that is Low by 2031 and Medium by 2035 crosses into Medium in the year its reviewers judged it passes 30%, so the curves rise through the early 2030s rather than in one step.

{{clock_curve_table}}

**Why 5–10 times faster thinking shortens programs by 38% at most by 2031.** Only about a third of a hardware program's critical path is cognitive work: requirements, design, analysis and software. The rest is fabrication, integration and test, qualification and launch. Under Exponential the cognitive slices run 5–10 times faster, but the physical ones compress only 1.0–1.2 times. Amdahl's law says a job cannot speed up by more than its unchanged parts allow, which caps schedule compression for a new program:

| Scenario | Ceiling by 2031 | Ceiling by 2035 |
| --- | --- | --- |
| Plateau | about 18% | not modeled |
| Exponential | about 38% | not modeled; about a third realized (judgment) |
| Recursive | about 51% | about 56% |
| Embodied, typical program | about 52% | about 58% |
| Embodied, robot-first firm | 56–60% | 66–67% |
| Unlimited cognition and robots | 67–70% | 70–73% |

The reviewers settled on 20–30% as the realistic Exponential gain by 2031, and on about a third by 2035 for programs finished by then (section 10, the engine branch). Some of the cognitive gain is already counted inside the physical multipliers, and organizations adopt new methods slowly.

**What can be proved runs ahead of what can be flown.**

- *2029.* Under Exponential, {{gap_2029_cog_s2}} of the {{n_t13}} frontier-math, applied-math and physics-model nodes have reached their earliest year. Only {{gap_2029_phys_s2}} of the {{n_t56}} validated technologies and operational systems have.
- *2031.* The counts are {{gap_2031_cog_s2}} and {{gap_2031_phys_s2}}, and only {{gap_2031_phys_hm}} of the hardware nodes are rated High or Medium.
- *2035.* The counts are {{gap_2035_cog_s2}} of {{n_t13}} and {{gap_2035_phys_s2}} of {{n_t56}}. Of the hardware nodes, {{gap_2035_phys_hm}} are rated High or Medium under Exponential, {{gap_2035_phys_hm_s3}} under Recursive and {{gap_2035_phys_hm_s4}} under Embodied. Most of the Embodied gain over Recursive is robot milestones themselves.

The exponential shows up first as a stock of solved problems waiting on hardware, data and approval, and the hardware catches up through the early 2030s.

**What binds at the outcome end.** Of the {{n_t67}} operational systems and strategic outcomes in the tree, the binding gates are {{gates_t67}}. Cognition binds none of them. It is the runner-up gate for {{runner_up_thinking_t67}} of them: removing the binding gate would leave thinking as the next thing holding the date. The runner-up gates are {{runner_up_t67}}. That is how thinking can be about a third of a program's critical path and bind no outcome: a third of the path can run fast without ever being the slowest step.

**Space has its own exponential, and it is physical.** Launch cost is falling fast for reasons that owe nothing to AI mathematics: reuse, larger payloads and production learning. We pin the launch curve to Mach33 Launch Keystone v1.3: the internal cost path of its wave 44 base (23 Sep 2026) and the customer path of wave 38b (10 Sep 2026). All prices are 2026 dollars.

- *Internal cost, delivered to low orbit.* v1.3 takes SpaceX's own Starship cost from $4,915/kg on expended Flight 14 to $656/kg in 2027 and about $300/kg in 2028, then $13/kg in 2035. These are costs to SpaceX, not prices.
- *Customer prices.* v1.3 opens Starship spare capacity to customers in 2031 in its reference case (tested from 2029 to 2033). The spot price runs $6,200/kg in 2029, $5,634 in 2030, $820 in 2031 and $562 in 2033. The realized price, revenue per customer kilogram, has a median of $5,823/kg in 2030 and $945 in 2035.
- *Our dates.* We date each threshold about a year after Mach33's path, consistent with the slips seen between announced and actual schedules. Internal cost under $300/kg comes about 2029 in every scenario and under $100/kg about 2031 (2032 in Plateau), High by 2035 as long as rapid heat-shield reuse stays on track. Customers buying under $1,000/kg come about 2031 in the Exponential case, Medium from 2032. Three hundred or more heavy launches a year come about 2033 (Medium by 2035).
- *Sensitivity.* Wave 45 (v1.4, ratified 21 Oct 2026) moves the customer price hinge from 2031 to 2030 and raises the entry-year internal cost. We do not apply it; it would bring customer-priced nodes about a year earlier.

**Cheap launch reaches SpaceX first.** Mach33's thesis is that an activity can become viable for a provider using spare capacity on its own rocket before it becomes viable for a customer buying a flight. So we split the launch gate in two. *Launch-internal* nodes ride SpaceX's own manifest: Starlink, SpaceX's orbital compute, lunar-lander tankers and cargo, and Mars. *Launch-external* nodes are bought by someone else: outside compute operators, small lunar missions, science missions and other constellations. As of late June 2026, SpaceX partners and customers reported new Transporter and Bandwagon bookings beyond late 2028 or early 2029 closed, so the external outcomes that need new SpaceX capacity now wait on a customer-access node dated by v1.3's opening year. Of the {{n_t67}} operational systems and strategic outcomes, {{n_t67_launch_internal}} are bound by internal launch and {{n_t67_launch_external}} by external launch.

AI mathematics moves the launch curve by months, and robots move none of its dates in the model. Orbital compute, orbital refueling and rapid heat-shield reuse are where the two curves meet. There, AI adds confidence, months and a few percent of mass, while launch cadence sets the dates.

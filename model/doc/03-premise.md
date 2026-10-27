The premise this study was asked to test is that AI mathematics is at the start of an exponential curve. The evidence for the capability itself is strong. In about fifteen months, frontier systems went from competition problems to famous conjectures at volume:

{{ladder_table}}

Three features of that record matter for space.

- **The pace is set by more than one lab.** OpenAI, Google DeepMind and Anthropic all produced research-grade or formally verified results in 2026, and the gap between them appears to be months.
- **Price is not the gate.** A research-grade result costs roughly $200–2,000 in compute. The low end is OpenAI's token cost for ten published successes at API prices; counting failed attempts moves it toward the high end. A thousand hard problems a year costs about as much as one to ten engineers, before checking. Checking, not generating, sets the real price.
- **The applied frontier is closer than the famous one.** Most of the mathematics an engineering team needs is bespoke and easier than the catalog's problems. Examples are a stability proof for a control law, an error bound for an estimator, or a convergence proof for a solver. For that work, the October 2026 capability is already enough.

The model turns the premise into four scenarios. The first three differ in how fast the length of task an AI can complete grows; the fourth adds robots.

- **Plateau** (S1) is the framework's default view. Capability keeps improving, but slowly: the task horizon doubles every 12–18 months, and research-grade mathematics reaches outside teams only in 2028.
- **Exponential** (S2) is the base case and the premise under test. The task horizon doubles every 6–9 months, close to the long-run trend measured on software tasks. Research-grade mathematics reaches outside teams in 2027.
- **Recursive** (S3) adds AI that speeds up its own research from 2028. After that, cognitive work is close to free.
- **Embodied** (S4) is Recursive cognition plus general-purpose robots at scale, about 6 million in service by 2031 and 60 million by 2035, including robots that help build robots. Exponential and Recursive assume a slow robot path, about 1.4 million by 2031 and 4.6 million by 2035. Plateau runs about a year behind that, because its cognition lags. Section 4 sets out the Embodied case.

By 2035 the cognitive differences narrow. Plateau reaches roughly where Exponential stands in 2029–30, and cheap, abundant cognitive work arrives in every scenario except Plateau. The scenarios then differ mainly in what they have already built and in how many robots they have.

A rumor says the October release is one of three planned "dumps" of solved problems. As of 7 October 2026 it was unconfirmed, and OpenAI spoke only of "future releases". If true, it is moderate evidence for the upper Exponential or an earlier Recursive case. The real test is whether each release comes from a newer, stronger model. It says little about robots or space programs. Better mathematics is worth about 1.1–1.5x on the robotics timeline, and unlimited cognition moves the Recursive ceiling on program compression only from 51% to 53%.

The evidence does not show three things the exponential is often assumed to deliver.

1. **That the results are right.** Nothing in the release has been independently verified. The best results are T3: Lean proofs in OpenAI's own repository, unchecked by outsiders. A tech blog ran Comparator on three challenge targets on 6 October. One passed and two ran out of memory, and no statement was audited, so no result moved to T4.
2. **That outside teams can use the capability.** The model that produced the release is unreleased. The strongest public model, GPT-6 Astra, solved 2 of 68 FrontierMath Erdős problems in September 2026. Access is governed by lab release decisions and government pre-release review as well as by price. Export-controlled and classified engineering data, which covers much of space, adds its own gate.
3. **That applied problems behave like pure ones.** For the applied mathematics space engineering needs, raw capability is rarely the limit. Four things limit it, in order:
   1. *Access* to the model.
   2. *Posing*: stating the engineering question precisely enough to prove.
   3. *Formal trust.* Lean's library barely covers the equations of physics and numerical methods. Only 3 of the release's 16 families on partial differential equations were machine-checked, against 5 of 6 in logic.
   4. *Data*, wherever a physics model has to be tuned to measurements.

   Only 28 of the release's 372 families (7.5%) concern partial differential equations or dynamics. That reflects which problems the lab chose to pose and which survived its filter.

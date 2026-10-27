// Two clocks: the Amdahl model behind the figure. Pure, no DOM, no imports.
// Shares and speedups by 2031 are the model's Amdahl table, section 3 of
// "Space Unlock Tree - model.md" ("Why 5-10x faster thinking gives about 1.6x faster programs by 2031").
// The build inlines this file into the page, so the motion and the readout read the same numbers.

export const STAGES = [
  { id: "req", name: "Requirements and trade studies", clock: "thinking", share: 0.10, speed: { today: 1, plateau: 2, exponential: 5, recursive: 20 } },
  { id: "design", name: "Design and analysis", clock: "thinking", share: 0.15, speed: { today: 1, plateau: 2, exponential: 10, recursive: 50 } },
  { id: "software", name: "Software development and verification", clock: "thinking", share: 0.10, speed: { today: 1, plateau: 2, exponential: 5, recursive: 20 } },
  { id: "fab", name: "Fabrication and procurement", clock: "doing", share: 0.25, speed: { today: 1, plateau: 1.0, exponential: 1.1, recursive: 1.3 } },
  { id: "test", name: "Integration and test", clock: "doing", share: 0.25, speed: { today: 1, plateau: 1.0, exponential: 1.2, recursive: 1.5 } },
  { id: "qual", name: "Qualification and reviews", clock: "doing", share: 0.10, speed: { today: 1, plateau: 1.0, exponential: 1.2, recursive: 1.5 } },
  { id: "launch", name: "Launch campaign", clock: "doing", share: 0.05, speed: { today: 1, plateau: 1.0, exponential: 1.0, recursive: 1.0 } },
];

// The robots switch. NOT a model row: a fit to the model's ceiling for a robot-first firm in 2031
// (section 3, "Embodied, robot-first firm: 56-60%"). It keeps Recursive thinking speeds and raises
// the doing speedups to these values, which lands at about 57% shorter.
export const ROBOT_FIT = { fab: 1.5, test: 1.8, qual: 1.6, launch: 1.0 };

// The four lever detents, in order.
export const DETENTS = ["today", "plateau", "exponential", "recursive"];
export const LABELS = { today: "Today", plateau: "Plateau", exponential: "Exponential", recursive: "Recursive", robots: "Robot-first" };

// Speedup of one stage at a detent (robots only changes the doing stages, on top of Recursive).
export function speedOf(stage, detent, robots = false) {
  if (robots && stage.clock === "doing") return ROBOT_FIT[stage.id];
  return stage.speed[robots ? "recursive" : detent];
}

// Program length relative to today: sum of share / speedup. Today = 1.0.
export function lengthOf(detent, robots = false) {
  return STAGES.reduce((sum, stage) => sum + stage.share / speedOf(stage, detent, robots), 0);
}
export const timeOf = (clock, detent, robots = false) =>
  STAGES.filter((stage) => stage.clock === clock).reduce((sum, stage) => sum + stage.share / speedOf(stage, detent, robots), 0);

// The range of speedups on one clock, as the readout prints it ("5-10x", "1.1-1.2x", "1x").
export function rangeOf(clock, detent, robots = false) {
  const list = STAGES.filter((stage) => stage.clock === clock).map((stage) => speedOf(stage, detent, robots));
  const fmt = (value) => (clock === "thinking" ? String(Math.round(value)) : value.toFixed(1));
  const lo = Math.min(...list);
  const hi = Math.max(...list);
  return lo === hi ? `${fmt(hi)}×` : `${fmt(lo)}–${fmt(hi)}×`;
}

// One state of the machine: everything the motion and the readout need.
export function stateOf(detent, robots = false) {
  const length = lengthOf(detent, robots);
  const thinking = timeOf("thinking", detent, robots);
  const doing = timeOf("doing", detent, robots);
  return {
    detent,
    robots,
    label: LABELS[robots ? "robots" : detent],
    length,
    speedup: 1 / length,
    shorter: 1 - length,
    thinking,
    doing,
    thinkingSpeedup: timeOf("thinking", "today") / thinking,
    doingSpeedup: timeOf("doing", "today") / doing,
    thinkingRange: rangeOf("thinking", detent, robots),
    doingRange: rangeOf("doing", detent, robots),
    stages: STAGES.map((stage) => ({ id: stage.id, clock: stage.clock, share: stage.share, speed: speedOf(stage, detent, robots), time: stage.share / speedOf(stage, detent, robots) })),
  };
}

// A continuous lever position u in [0, 3] along DETENTS (and robots r in [0, 1]) for the motion while the
// lever travels between detents: each stage's speedup is interpolated in log space between the two detents.
export function blendOf(u, robots = 0) {
  const at = Math.max(0, Math.min(3, u));
  const index = Math.min(2, Math.floor(at));
  const f = at - index;
  const mix = (a, b, t) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t);
  const stages = STAGES.map((stage) => {
    let speed = mix(speedOf(stage, DETENTS[index]), speedOf(stage, DETENTS[index + 1]), f);
    if (stage.clock === "doing" && robots > 0) speed = mix(speed, ROBOT_FIT[stage.id], robots);
    return { id: stage.id, clock: stage.clock, share: stage.share, speed, time: stage.share / speed };
  });
  const sum = (clock) => stages.filter((stage) => !clock || stage.clock === clock).reduce((total, stage) => total + stage.time, 0);
  const thinking = sum("thinking");
  const doing = sum("doing");
  return { length: thinking + doing, thinking, doing, thinkingSpeedup: 0.35 / thinking, doingSpeedup: 0.65 / doing, stages };
}

export function readoutOf(state) {
  const program = `program ${state.speedup.toFixed(1)}×`;
  return state.robots ? `${state.label} · doing ${state.doingRange} · ${program}` : `${state.label} · thinking ${state.thinkingRange} · ${program}`;
}

// The second true fact, for the queue (section 3, "What can be proved runs ahead of what can be flown"):
// under Exponential in 2029, 122 of 155 math and physics-model nodes have reached their earliest year,
// but only 44 of 167 validated technologies and operational systems have.
export const QUEUE_FACT = { year: 2029, scenario: "exponential", cognitive: [122, 155], hardware: [44, 167] };

// Machine timing (illustrative, not model numbers): one program today takes 40 s on the machine. The
// doing staircase has 13 steps (5, 5, 2 and 1 for the four flights, in proportion to 25, 25, 10 and 5%),
// and every marble on it moves one step per swing pair of the pendulum, so at today the pendulum beats
// once a second, a seconds pendulum. The thinking side delivers solved problems at THINK_BALANCE of the
// hardware's intake at today (hardware waits on design, which is why design is on the critical path),
// and that rate scales with the thinking speedup. The queue holds QUEUE_SLOTS marbles.
export const MACHINE = { programSeconds: 40, steps: 13, thinkBalance: 0.6, queueSlots: 9 };

export function timingOf(state) {
  const step = (state.doing * MACHINE.programSeconds) / MACHINE.steps;
  const todayStep = (0.65 * MACHINE.programSeconds) / MACHINE.steps;
  return {
    step,
    beat: step / 2,
    release: todayStep / (MACHINE.thinkBalance * state.thinkingSpeedup),
    stageSeconds: state.stages.map((stage) => stage.time * MACHINE.programSeconds),
  };
}

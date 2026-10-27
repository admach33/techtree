// The marble machine: layout (world units, x along the bench, y toward the viewer, z up) and a pure,
// deterministic simulation of the marbles, the lift chain, the pendulum and the escapement pins.
// The build uses it to draw the still; the page inlines it to drive the motion. No DOM, no kit.
import { blendOf, timingOf, MACHINE } from "./model.mjs";

export const MR = 3.6; // marble radius
const SLOPE = Math.tan((12 * Math.PI) / 180); // chute slope
const LANE = Math.tan((2 * Math.PI) / 180); // queue lane slope
const GROOVE = 2.2; // half-width of a chute groove
const SEAT = Math.sqrt(MR * MR - GROOVE * GROOVE); // marble centre above a groove's top face
const UNIT = 3.4; // run along x for 1% of the critical path: tread 17 = 5%

function chutesOf() {
  const lengths = [10, 15, 10].map((share) => share * UNIT);
  const out = [];
  let x = -226;
  let z = 131;
  lengths.forEach((length, index) => {
    const chute = { index, x0: x, z0: z, x1: x + length, z1: z - length * SLOPE };
    out.push(chute);
    x = chute.x1 + 4;
    z = chute.z1 - 4;
  });
  return { list: out, exit: [x, z] };
}
const CH = chutesOf();

const FLIGHTS = [5, 5, 2, 1];
const flightOf = (j) => (j < 5 ? 0 : j < 10 ? 1 : j < 12 ? 2 : 3);
const TREAD = 17;
const X0 = -13;
const treadX = (j) => X0 + TREAD * j + 4 * flightOf(j);
const treadZ = (j) => 84 - 5 * j;

const laneEntry = CH.exit; // [-95, 93.7]
const laneZ = (x) => laneEntry[1] - (x - laneEntry[0]) * LANE;
const GATE_X = -20;
const slotX = (k) => (k === 0 ? GATE_X : GATE_X - 2 * MR - 1.2 - 7.6 * (k - 1));

export const LAYOUT = {
  MR,
  SEAT,
  GROOVE,
  SLOPE,
  LANE,
  UNIT,
  plate: { x: -272, y: -48, w: 594, d: 108, r: 8 },
  lift: { x: -242, yc: -6.5, zb: 18, zt: 124, rs: 7, rc: 8.1, cup: 4.6, cups: 14 },
  board: { x0: -256, x1: -95, y0: -16, y1: -12, top: 146, flat: -228, low: 108 },
  movement: { x0: -256, x1: -228, y0: -16, y1: 4, z0: 146, z1: 170 },
  chutes: CH.list,
  lane: { x0: laneEntry[0], x1: -14, zAt: laneZ, gateX: GATE_X, slotX, slots: MACHINE.queueSlots, gatePin: GATE_X + MR + 0.6, holdPin: GATE_X - MR - 0.6 },
  stairs: { flights: FLIGHTS, flightOf, treadX, treadZ, tread: TREAD, steps: 13, hold: 3.8, holdPin: 8, front: 12.2, frontPin: 16.4 },
  funnel: { x: 226, y: 0, r: 6.5 },
  tower: { x: 272, plinth: { x: 234, y: -22, w: 76, d: 36, r: 3 }, pivot: [272, 6, 133.5], bob: 40, wheel: [272, 124], dial: [272, 152] },
};

const L = LAYOUT;
const TAU = Math.PI * 2;

// ---- the lift chain: arc length s around the loop, starting at the bottom of the left run, going up.
const H = L.lift.zt - L.lift.zb;
const ARC = Math.PI * L.lift.rc;
export const LOOP = 2 * H + 2 * ARC;
export const CUP_GAP = LOOP / L.lift.cups;
export const RELEASE_AT = H + ARC / 2; // top centre: a loaded cup tips its marble onto the first chute
export function chainAt(s, out = 0) {
  const { x, zb, zt } = L.lift;
  const r = L.lift.rc + out;
  const t = ((s % LOOP) + LOOP) % LOOP;
  if (t < H) return { p: [x - r, zb + t], n: [-1, 0] };
  if (t < H + ARC) {
    const a = Math.PI - ((t - H) / ARC) * Math.PI;
    return { p: [x + r * Math.cos(a), zt + r * Math.sin(a)], n: [Math.cos(a), Math.sin(a)] };
  }
  if (t < 2 * H + ARC) return { p: [x + r, zt - (t - H - ARC)], n: [1, 0] };
  const a = -((t - 2 * H - ARC) / ARC) * Math.PI;
  return { p: [x + r * Math.cos(a), zb + r * Math.sin(a)], n: [Math.cos(a), Math.sin(a)] };
}
const cupMarble = (s) => {
  const { p } = chainAt(s, L.lift.cup);
  return [p[0], 0, p[1]];
};

// ---- marble paths
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
function chutePoint(index, f, fall) {
  const c = L.chutes[index];
  const startZ = c.z0;
  if (index > 0 && f < fall) {
    // falling from the previous chute's end onto this chute's start
    const p = L.chutes[index - 1];
    const t = f / fall;
    return [lerp(p.x1, c.x0, t), 0, lerp(p.z1, startZ, t * t)];
  }
  const t = index > 0 ? (f - fall) / (1 - fall) : f;
  return [lerp(c.x0, c.x1, t), 0, lerp(c.z0, c.z1, t)];
}
function stairPoint(j, x) {
  return [x, 0, treadZ(j) + MR];
}
// a roll from the front stop of tread j over the nosing and down onto tread j + 1 (or into the funnel)
function stepPath(j, t) {
  const x0 = treadX(j) + L.stairs.front;
  const nose = treadX(j) + TREAD;
  const z0 = treadZ(j) + MR;
  if (j >= 12) {
    const x = lerp(x0, L.funnel.x, ease(t));
    const over = Math.max(0, (x - nose) / (L.funnel.x - nose));
    return [x, 0, z0 - (z0 - 3) * over * over];
  }
  const x1 = treadX(j + 1) + L.stairs.hold;
  const z1 = treadZ(j + 1) + MR;
  const x = lerp(x0, x1, ease(t));
  const land = treadX(j + 1) + 1.2;
  const over = Math.max(0, Math.min(1, (x - nose + MR * 0.4) / (land - nose + MR * 0.4)));
  return [x, 0, z0 - (z0 - z1) * over * over];
}
function gatePath(t) {
  const x0 = slotX(0);
  const nose = L.lane.x1;
  const z0 = laneZ(x0);
  const x1 = treadX(0) + L.stairs.hold;
  const z1 = treadZ(0) + MR;
  const x = lerp(x0, x1, ease(t));
  const over = Math.max(0, Math.min(1, (x - nose) / (treadX(0) + 1.2 - nose)));
  return [x, 0, z0 - (z0 - z1) * over * over];
}

// ---- the simulation
export function createSim() {
  const sim = {
    t: 0,
    beats: 0,
    phase: 0,
    pins: 1, // 1: exit pins up, hold pins down (after a tock); 0: exit down, hold up (after a tick)
    chain: 0,
    cups: Array.from({ length: L.lift.cups }, (_, i) => i * CUP_GAP < RELEASE_AT),
    governor: 0,
    thinkHand: 0,
    doingHand: 0,
    wheel: 0,
    wheelTarget: 0,
    handTarget: 0,
    marbles: [],
    next: 1,
    blend: blendOf(0, 0),
    timing: null,
    launched: 0,
  };
  sim.timing = timingOf(sim.blend);
  return sim;
}

const inQueue = (sim) => sim.marbles.filter((m) => m.where === "queue");
const thinkingCount = (sim) => sim.marbles.filter((m) => m.where === "lift" || m.where === "chute" || m.where === "drop").length;

function onTick(sim) {
  // exit pins drop: every marble at a front stop rolls to the next tread; the gate lets the queue's head in
  for (const m of sim.marbles) if (m.where === "stair" && m.at === "front" && !m.move) m.move = { kind: "step", t: 0 };
  const head = inQueue(sim).find((m) => m.slot === 0 && Math.abs(m.x - slotX(0)) < 0.3);
  if (head) {
    head.where = "gate";
    head.move = { kind: "gate", t: 0 };
  }
}
function onTock(sim) {
  // hold pins drop: every marble at a hold rolls to its tread's front stop; the queue moves up a slot
  for (const m of sim.marbles) if (m.where === "stair" && m.at === "hold" && !m.move) m.move = { kind: "front", t: 0 };
  const queue = inQueue(sim).sort((a, b) => a.slot - b.slot);
  if (!queue.some((m) => m.slot === 0)) queue.forEach((m) => (m.slot -= 1));
}

export function stepSim(sim, dt, { u, robots }) {
  sim.t += dt;
  sim.blend = blendOf(u, robots);
  const T = (sim.timing = timingOf(sim.blend));
  const roll = Math.min(0.42, T.beat * 0.85);

  // pendulum and escapement
  const before = Math.floor(sim.phase);
  sim.phase += dt / T.beat;
  const after = Math.floor(sim.phase);
  for (let b = before + 1; b <= after; b++) {
    sim.beats = b;
    if (b % 2 === 1) onTick(sim);
    else onTock(sim);
    sim.wheelTarget += TAU / 30;
    sim.handTarget += TAU / 60;
  }
  const pinsTarget = sim.beats % 2 === 1 ? 0 : 1;
  sim.pins += (pinsTarget - sim.pins) * (1 - Math.exp(-dt / 0.035));
  sim.wheel += (sim.wheelTarget - sim.wheel) * (1 - Math.exp(-dt / 0.045));
  sim.doingHand += (sim.handTarget - sim.doingHand) * (1 - Math.exp(-dt / 0.045));

  // the thinking clock: governor, sweep hand
  sim.governor += TAU * 0.35 * Math.pow(sim.blend.thinkingSpeedup, 0.6) * dt;
  sim.thinkHand += (TAU / 60) * sim.blend.thinkingSpeedup * dt;

  // the lift chain: one cup per release interval, held back when the queue and chutes are full
  const speed = CUP_GAP / T.release;
  let advance = speed * dt;
  const room = thinkingCount(sim) + inQueue(sim).length < L.lane.slots;
  if (!room) {
    // stop just short of the next release
    let gap = Infinity;
    sim.cups.forEach((loaded, i) => {
      if (!loaded) return;
      const s = (((i * CUP_GAP + sim.chain) % LOOP) + LOOP) % LOOP;
      const d = s <= RELEASE_AT ? RELEASE_AT - s : Infinity;
      gap = Math.min(gap, d);
    });
    advance = Math.max(0, Math.min(advance, gap - 0.4));
  }
  const old = sim.chain;
  sim.chain += advance;
  sim.cups.forEach((loaded, i) => {
    const s0 = i * CUP_GAP + old;
    const s1 = i * CUP_GAP + sim.chain;
    const k0 = Math.floor((s0 - RELEASE_AT) / LOOP);
    const k1 = Math.floor((s1 - RELEASE_AT) / LOOP);
    if (k1 > k0 && loaded) {
      sim.cups[i] = false;
      sim.marbles.push({ id: sim.next++, where: "lift", t: 0, from: cupMarble(RELEASE_AT) });
    }
    const b0 = Math.floor(s0 / LOOP);
    const b1 = Math.floor(s1 / LOOP);
    if (b1 > b0) sim.cups[i] = true; // a cup leaving the hopper is loaded
  });

  // marbles
  const done = [];
  for (const m of sim.marbles) {
    if (m.where === "lift") {
      m.t += dt / 0.22;
      if (m.t >= 1) Object.assign(m, { where: "chute", index: 0, f: 0 });
    } else if (m.where === "chute") {
      const seconds = T.stageSeconds[m.index];
      const fall = m.index > 0 ? Math.min(0.5, 0.16 / seconds) : 0;
      m.fall = fall;
      m.f += dt / seconds;
      if (m.f >= 1) {
        if (m.index < 2) Object.assign(m, { index: m.index + 1, f: 0 });
        else {
          const taken = inQueue(sim).length;
          Object.assign(m, { where: "queue", slot: taken, x: CH.exit[0], drop: 0 });
        }
      }
    } else if (m.where === "queue") {
      m.x = Math.min(slotX(m.slot), m.x + 34 * dt);
      m.drop = Math.min(1, m.drop + dt / 0.14);
    } else if (m.where === "gate") {
      m.move.t += dt / roll;
      if (m.move.t >= 1) Object.assign(m, { where: "stair", j: 0, at: "hold", move: null });
    } else if (m.where === "stair" && m.move) {
      m.move.t += dt / (m.move.kind === "step" ? roll : roll * 0.6);
      if (m.move.t >= 1) {
        if (m.move.kind === "front") Object.assign(m, { at: "front", move: null });
        else if (m.j >= 12) done.push(m);
        else Object.assign(m, { j: m.j + 1, at: "hold", move: null });
      }
    }
  }
  if (done.length) {
    sim.launched += done.length;
    sim.marbles = sim.marbles.filter((m) => !done.includes(m));
  }
  return sim;
}

// Where each marble is, which layer slot paints it, and how visible it is.
export function marblesOf(sim) {
  return sim.marbles.map((m) => {
    if (m.where === "lift") {
      const top = cupMarble(RELEASE_AT);
      const c = L.chutes[0];
      const t = ease(m.t);
      return { id: m.id, slot: "chute0", p: [lerp(top[0], c.x0, t), 0, lerp(top[2], c.z0, t) + Math.sin(t * Math.PI) * 1.5] };
    }
    if (m.where === "chute") return { id: m.id, slot: `chute${m.index}`, p: chutePoint(m.index, Math.min(1, m.f), m.fall ?? 0) };
    if (m.where === "queue") {
      const x = m.x;
      const fallen = ease(m.drop);
      const z = laneZ(x) * fallen + CH.exit[1] * (1 - fallen);
      return { id: m.id, slot: "queue", p: [x, 0, z] };
    }
    if (m.where === "gate") return { id: m.id, slot: m.move.t < 0.45 ? "queue" : "flight0", p: gatePath(Math.min(1, m.move.t)) };
    if (m.where === "stair") {
      const j = m.j;
      if (m.move && m.move.kind === "step") {
        const t = Math.min(1, m.move.t);
        const p = stepPath(j, t);
        const next = j >= 12 ? "funnel" : `flight${flightOf(j + 1)}`;
        const crossed = p[0] > treadX(j) + TREAD + 0.6;
        const fade = j >= 12 ? Math.max(0, Math.min(1, (p[2] - 3) / 9)) : 1;
        return { id: m.id, slot: crossed ? next : `flight${flightOf(j)}`, p, alpha: fade };
      }
      if (m.move && m.move.kind === "front") return { id: m.id, slot: `flight${flightOf(j)}`, p: stairPoint(j, lerp(treadX(j) + L.stairs.hold, treadX(j) + L.stairs.front, ease(Math.min(1, m.move.t)))) };
      return { id: m.id, slot: `flight${flightOf(j)}`, p: stairPoint(j, treadX(j) + (m.at === "front" ? L.stairs.front : L.stairs.hold)) };
    }
    return null;
  }).filter(Boolean);
}

// Marbles riding up in the lift's cups (loaded cups on the way up), as world points.
export function cupsOf(sim) {
  return sim.cups.map((loaded, i) => {
    const s = (((i * CUP_GAP + sim.chain) % LOOP) + LOOP) % LOOP;
    return { s, loaded: loaded && s < RELEASE_AT, at: chainAt(s, 0), marble: cupMarble(s) };
  });
}

// Run the machine from empty at today until it is in its steady state, then at a scenario for a while.
export function warmed(u, robots, seconds = 6, warm = 70) {
  const sim = createSim();
  const dt = 1 / 120;
  for (let t = 0; t < warm; t += dt) stepSim(sim, dt, { u: 0, robots: 0 });
  for (let t = 0; t < seconds; t += dt) stepSim(sim, dt, { u, robots });
  return sim;
}

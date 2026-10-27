// Compute satellite on its rotation fixture: "Commercial AI chips running in orbit at scale" (2029).
// node build.mjs           writes compute-sat.html and compute-sat.svg
// node build.mjs --audit   also proves the geometry (kit/audit.mjs) and exits non-zero on any problem
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/alex/.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/Users/alex/.claude/skills/anatomy/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "/Users/alex/.claude/skills/anatomy/kit/tube.mjs";
import * as A from "/Users/alex/.claude/skills/anatomy/kit/audit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SLUG = "compute-sat";
const W = 640;
const H = 440;
const TOKENS = ".iso{--anatomy-page:#08090B;--anatomy-card:#0C0E11;--anatomy-paper:#0C0E11;--anatomy-lit:#22CFFF}";

// ---- true numbers (graph-v8.json: materials-cots-orbital-compute-ops, struct-gw-orbital-compute) ----
const TRUTH = { peakKw: 250, avgKw: 175, massBoundKg: 4000, fleet: 4000, gw: 1, earliest: 2029 };
const READOUT = `${TRUTH.peakKw} kW peak · < ${TRUTH.massBoundKg.toLocaleString("en-US")} kg · ×${TRUTH.fleet.toLocaleString("en-US")} = ${TRUTH.gw} GW`;

// ---- world plan (units ≈ 1 px of the model; z up) ----
const PLINTH = { x: -92, y: -56, w: 184, d: 112, r: 8 };
const PLINTH_H = 12;
const FOOT_H = 5;
const BUS = { x: -36, y: -26, w: 72, d: 52, r: 1.5 };
const BUS_Z = 36;
const BUS_TOP = 48;
const AXLE_Z = 42;
const CM = { x: -18, y: -14, w: 36, d: 30 };
const CM_TOP = 80;
const RAD_Y = -25;
const RAD_T = 2;
const RAD_TOP = 106;
const WING_Z = 42;
const PANEL = { w: 42, d: 52 };

const P = k.fitProjection(
  [
    ...k.boxCorners(PLINTH, -PLINTH_H - FOOT_H, 0),
    [149, -26, 43], [149, 26, 43], [-107, -26, 43], [-107, 26, 43],
    [-106 - 43 * Math.cos(0.663), -26, 43 + 43 * Math.sin(0.663)], [-106 - 43 * Math.cos(0.663), 26, 43 + 43 * Math.sin(0.663)],
    [-44, RAD_Y, RAD_TOP], [44, RAD_Y, RAD_TOP],
  ],
  W,
  H,
  { pad: 30, azimuth: 50 },
);
const V = G.viewOf(P);
const KS = G.scaleOf(P);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const poly = (points, close = true) => points.map((p, i) => `${i ? "L" : "M"}${at(p).map((v) => v.toFixed(1)).join(" ")}`).join("") + (close ? "Z" : "");
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const AX = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const frame = (o, a) => (a === "y" ? G.frameOf(o, AX.y, AX.x, AX.z) : a === "x" ? G.frameOf(o, AX.x, AX.y, AX.z) : a === "-x" ? G.frameOf(o, [-1, 0, 0], AX.y, AX.z) : G.frameOf(o, AX.z, AX.x, AX.y));

// ---- recorder and helpers ----
const R = A.recorder(P);
const COUNT = { solids: 0, pipes: 0 };
function put(atPoint, svg, { bias = 0, name, shapes = [], route, chunk } = {}) {
  R.put({ piece: "sat", at: atPoint, bias, svg, shapes, name: name ?? R.nameFor("sat.item"), route, chunk });
}
function slab(name, plan, z, h, style = {}, { extra = "", inner = "", bias = 0, owner, steps = 3, bevel = 0.5 } = {}) {
  const id = R.nameFor(name);
  const shape = R.solid(A.slab(plan, z, h, { name: id, owner }, steps));
  put([plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], S(k.slabOf(plan, z, h, P, steps, bevel), { tone: "hi", ...style, inner }) + extra, { bias, name: id, shapes: [shape] });
  COUNT.solids++;
  return shape;
}
function post(name, cx, cy, r, z, h, style = {}, { extra = "", inner = "", bias = 0, owner, bevel = 0 } = {}) {
  const id = R.nameFor(name);
  const shape = R.solid(A.cylinder(cx, cy, r, z, h, { name: id, owner }));
  put([cx, cy, z + h / 2], S(k.cylinder(cx, cy, r, z, h, P, G.stepsFor(r, 20, 64, KS), bevel), { tone: "hi", ...style, inner }) + extra, { bias, name: id, shapes: [shape] });
  COUNT.solids++;
  return shape;
}
function disc(name, F, s0, s1, r, style = {}, { extra = "", inner = "", bias = 0, owner, bevel = 0 } = {}) {
  const id = R.nameFor(name);
  const shape = R.solid(A.disc(F, s0, s1, r, { name: id, owner }));
  put(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), S(G.disc(s0, s1, r, F, P, { bevel }), { tone: "hi", ...style, inner }) + extra, { bias, name: id, shapes: [shape] });
  COUNT.solids++;
  return shape;
}
function ball(name, c, r, style = {}, { extra = "", bias = 0, owner } = {}) {
  const id = R.nameFor(name);
  const shape = R.solid(A.ball(c, r, { name: id, owner }));
  put(c, S(G.sphereOf(c, r, P, { steps: G.stepsFor(r, 32) }), { tone: "hi", ...style }) + extra, { bias, name: id, shapes: [shape] });
  COUNT.solids++;
  return shape;
}
function flangeAt(name, centre, axis, r, thick, { owner, tone = "hi" } = {}) {
  const F = G.frameAlong(centre, axis);
  const towards = G.dot3(F.a, V) > 0 ? thick / 2 : -thick / 2;
  const bolts = Math.abs(G.dot3(F.a, V)) > 0.12 ? Dots(G.dotsOf(F, towards, r * 0.74, 6, P, { all: true }), { size: 0.4, tone: "mid" }) : "";
  disc(name, F, -thick / 2, thick / 2, r, { tone }, { extra: bolts, owner });
}
const PIPES = [];
function pipe(name, control, r, { flangeR = 1.7, tone = "hi", maxLength = 7, pump = null } = {}) {
  const line = G.fillet(control, Math.max(r * 2.6, 3), 12, { P, tube: r });
  const total = G.pathLength(line);
  const thick = Math.max(0.9, r * 0.6);
  const collars = [[0, -1], [total, 1]].map(([along, sign]) => {
    const tangent = G.tangentAlong(line, along);
    return { centre: G.add3(G.pointAlong(line, along), G.mul3(tangent, (-sign * thick) / 2)), tangent, gap: sign < 0 ? [0, thick] : [total - thick, total] };
  });
  const gaps = collars.map((c) => c.gap);
  const PUMP_L = 3.2;
  if (pump !== null) gaps.push([total - pump - PUMP_L, total - pump + PUMP_L]);
  const id = R.nameFor(name);
  R.route(id, line, r, { owner: id, gaps, rims: [r * flangeR, r * flangeR], piece: "sat" });
  if (pump !== null) {
    // canned loop pump on a straight leg: body along the pipe, end bells, and its motor standing on top
    const along = total - pump;
    const c = G.pointAlong(line, along);
    const F = G.frameAlong(c, G.tangentAlong(line, along));
    const body = [[-PUMP_L, 0], [-PUMP_L, r * 1.6], [-PUMP_L + 0.8, r * 2.2], [PUMP_L - 0.8, r * 2.2], [PUMP_L, r * 1.6], [PUMP_L, 0]];
    const pid = R.nameFor(`${name}.pump`);
    const pumpShape = R.solid(A.body(F, body, { name: pid, owner: id }));
    put(c, S(G.lathe(body, F, P, { steps: 40 }), { tone: "hi", inner: Ln(G.arcOf(F, 0, r * 2.2, P), { tone: "faint" }) }), { name: pid, shapes: [pumpShape] });
    // the motor can stands out sideways (away from the neighbouring line), its base cut to the pump body
    const MR = 1.5;
    const HR = r * 2.2;
    const MF = G.frameOf(c, [Math.sign(c[0]) || 1, 0, 0], [0, 0, 1], F.a);
    const s1 = HR + 3.8;
    const mid = R.nameFor(`${name}.motor`);
    const ribs = k.fadedSvg(G.ribsOf(MF, HR + 0.6, HR + 3.0, MR, 14, P, { fade: [0.1, 0.55] }), { tone: "lo" });
    const face = G.dot3(MF.a, V) > 0.15 ? Ln(G.circleOf(MF, s1, 0.7, P, 12), { tone: "lo" }) : "";
    const motorShape = R.solid(A.disc(MF, Math.sqrt(HR ** 2 - MR ** 2) - 0.05, s1, MR, { name: mid, owner: id, seated: true, cut: [pumpShape] }));
    put(G.add3(c, G.mul3(MF.a, (HR + s1) / 2)), S(G.saddleOf(MF, MR, HR, s1, P), { tone: "hi" }) + ribs + face, { name: mid, shapes: [motorShape] });
    COUNT.solids++;
    COUNT.solids++;
  }
  tubePieces(line, r, P, { maxLength, spacing: 0.8, gaps }).forEach((part, index) =>
    put(part.mid, tubeSvg(part, { tone }), { name: `${id}:${index}`, route: id, chunk: index, shapes: [A.tube(part.points, part.radii)] }),
  );
  collars.forEach((c, i) => flangeAt(`${id}.flange${i}`, c.centre, c.tangent, r * flangeR, thick, { owner: id }));
  PIPES.push({ id, total });
  COUNT.pipes++;
}
const CABLES = [];
function cable(name, control, r = 0.55) {
  const line = G.fillet(control, 3, 12, { P, tube: r });
  const total = G.pathLength(line);
  const SHELL = 2;
  const gaps = [[0, SHELL], [total - SHELL, total]];
  const id = R.nameFor(name);
  R.route(id, line, r, { owner: id, gaps, limp: true, rims: [r * 2, r * 2], piece: "sat" });
  tubePieces(line, r, P, { maxLength: 8, spacing: 0.8, gaps }).forEach((part, index) =>
    put(part.mid, tubeSvg(part, { tone: "mid" }), { name: `${id}:${index}`, route: id, chunk: index, shapes: [A.tube(part.points, part.radii)] }),
  );
  [0, 1].forEach((end) => {
    const tangent = G.tangentAlong(line, end ? total : 0);
    const F = G.frameAlong(end ? line[line.length - 1] : line[0], tangent);
    const [s0, s1] = end ? [-SHELL, 0] : [0, SHELL];
    disc(`${id}.shell`, F, s0, s1, r * 2, { tone: "mid" }, { bevel: 0.2, owner: id });
  });
  CABLES.push(id);
}
// a closed slot on a vertical face (plane y = c or x = c), for vents, handles, hatches
const slotY = (y, x0, x1, z0, z1) => poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]);
const slotX = (x, y0, y1, z0, z1) => poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]);

// =====================================================================================
// Plinth (ground, drawn first)
// =====================================================================================
const back = [];
back.push(`<path class="iso-halo" d="${k.haloOf(PLINTH, -PLINTH_H - FOOT_H, PLINTH_H, P)}"/>`);
for (const [x, y] of byDepth(k.corners(PLINTH, 20))) {
  back.push(S(k.cylinder(x, y, 7, -PLINTH_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
  back.push(S(k.cylinder(x, y, 5.4, -PLINTH_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
}
const bandZ = -PLINTH_H + 3;
back.push(S(k.slabOf(PLINTH, -PLINTH_H, PLINTH_H, P, 8, 1.6), { tone: "mid", inner: Ln(k.sideSeam(PLINTH, bandZ, P, 8), { tone: "faint" }) }));
R.solid(A.slab(PLINTH, -PLINTH_H, PLINTH_H, { name: "stand.plinth" }, 8));
back.push(Ln(k.planOutline(k.insetPlan(PLINTH, 5), 0, P), { tone: "lo" }));
const SCREWS = k.corners(PLINTH, 10);
back.push(Ln(SCREWS.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
back.push(Dots(SCREWS.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
// engraved year on the front face, inside a recessed label field
const LBL = { x0: 50, x1: 76, z0: -PLINTH_H + 4.5, z1: -1.5 };
const FRONT = PLINTH.y + PLINTH.d;
back.push(Ln(slotY(FRONT, LBL.x0, LBL.x1, LBL.z0 + 0.0, LBL.z1), { tone: "lo" }));
back.push(Dots([at([LBL.x0 + 1.6, FRONT, (LBL.z0 + LBL.z1) / 2]), at([LBL.x1 - 1.6, FRONT, (LBL.z0 + LBL.z1) / 2])], { size: 0.4 }));
if (process.env.ENGRAVE) back.push(k.faceTextSvg(k.sideMatrix([(LBL.x0 + LBL.x1) / 2, FRONT], LBL.z0 + 1.4, P, "left"), String(TRUTH.earliest), { size: 4.6, tone: "mid", anchor: "middle" }));
// alignment scale along the front of the plinth top
const STRIP = { x: -62, y: 44.5, w: 124, d: 5, r: 0.8 };
back.push(S(k.slabOf(STRIP, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
const TICKS = k.topTicks(STRIP.x + 2, STRIP.x + STRIP.w - 2, 4, 5, STRIP.y + 0.6, 0.6, [1.6, 3], P);
back.push(Ln(TICKS.minor, { tone: "lo" }), Ln(TICKS.major, { tone: "mid" }));
back.push(Dots([at([STRIP.x + 1.2, STRIP.y + 3.6, 0.6]), at([STRIP.x + STRIP.w - 1.2, STRIP.y + 3.6, 0.6])], { size: 0.4 }));
// soft shadow of the satellite on the plinth top
back.push(`<path class="iso-halo" style="filter:blur(5px);opacity:.55" d="${k.haloOf({ x: -72, y: -44, w: 144, d: 88, r: 10 }, 0, 0.1, P)}"/>`);

// =====================================================================================
// Rotation fixture (structure, tone mid)
// =====================================================================================
const FIX = { tone: "mid" };
const RAIL_Z = 4.4;
const RAIL_TOP = 10.4;
for (const [x, y] of k.corners({ x: -70, y: -42, w: 140, d: 84, r: 0 }, 6)) {
  post("fix.pad", x, y, 4.6, 0, 1.4, { tone: "lo" }, { bevel: 0.4 });
  post("fix.jack", x, y, 2.4, 1.4, RAIL_Z - 1.4, FIX, { extra: Ln(k.sideArc(x, y, 2.4, 2.9, P, 16), { tone: "faint" }) });
}
for (const y of [34, -42]) {
  const rail = { x: -70, y, w: 140, d: 8, r: 1 };
  const rivets = [-50, -26, 26, 50].map((x) => at([x, y + 4, RAIL_TOP]));
  slab("fix.rail", rail, RAIL_Z, RAIL_TOP - RAIL_Z, FIX, { bevel: 0.6, extra: Dots(rivets, { size: 0.42 }) });
}
for (const x of [-62, 54]) {
  const beam = { x, y: -34, w: 8, d: 68, r: 0.6 };
  slab("fix.crossbeam", beam, RAIL_Z, RAIL_TOP - RAIL_Z - 0.8, FIX, { bevel: 0.4, extra: Dots([at([x + 4, -26, RAIL_TOP - 0.8]), at([x + 4, 26, RAIL_TOP - 0.8])], { size: 0.4 }) });
}
// uprights, gussets, adapters, trunnion shafts
const UP_TOP = 50;
for (const [y, front] of [[34, true], [-42, false]]) {
  const col = { x: -6, y, w: 12, d: 8, r: 0.8 };
  const slot = front ? Ln(slotY(y + 8, -2.2, 2.2, 16, 30), { tone: "lo" }) : "";
  slab("fix.upright", col, RAIL_TOP, UP_TOP - RAIL_TOP, FIX, { bevel: 0.5, extra: slot + Dots([at([-3.5, y + 4, UP_TOP]), at([3.5, y + 4, UP_TOP])], { size: 0.4 }) });
  for (const gx of [-12, 6]) slab("fix.gusset", { x: gx, y: y + 1, w: 6, d: 6, r: 0.4 }, RAIL_TOP, 7, FIX, { bevel: 0.3 });
}
const ADAPT_Z = [36, 50];
slab("fix.adapter", { x: -11, y: 26, w: 22, d: 3, r: 0.5 }, ADAPT_Z[0], ADAPT_Z[1] - ADAPT_Z[0], FIX, { bevel: 0.3, extra: Dots([[-8, 38.5], [8, 38.5], [-8, 47.5], [8, 47.5]].map(([x, z]) => at([x, 29, z])), { size: 0.42 }) });
slab("fix.adapter", { x: -11, y: -29, w: 22, d: 3, r: 0.5 }, ADAPT_Z[0], ADAPT_Z[1] - ADAPT_Z[0], FIX, { bevel: 0.3 });
disc("fix.shaft", frame([0, 29, AXLE_Z], "y"), 0, 5, 2.6, FIX);
disc("fix.shaft", frame([0, -34, AXLE_Z], "y"), 0, 5, 2.6, FIX);
const CAP = frame([0, 42, AXLE_Z], "y");
disc("fix.bearing-cap", CAP, 0, 2, 5, FIX, { extra: Dots(G.dotsOf(CAP, 2, 4, 6, P, { all: true, phase: Math.PI / 6 }), { size: 0.4 }) });
disc("fix.hub", CAP, 2, 3.5, 2.5, FIX);
const WHEEL_R = 9;
const spokes = [0, 1, 2].map((i) => {
  const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
  return k.segment(G.pointOf(CAP, 5.5, 2.5, a), G.pointOf(CAP, 5.5, WHEEL_R - 1.6, a), P);
});
disc("fix.handwheel", CAP, 3.5, 5.5, WHEEL_R, FIX, {
  bevel: 0.4,
  inner: Ln(G.arcOf(CAP, 4.5, WHEEL_R, P), { tone: "faint" }),
  extra: k.fadedSvg(G.ribsOf(CAP, 3.5, 5.5, WHEEL_R, 54, P, { fade: [0.1, 0.55] }), { tone: "lo" }) + Ln(G.circleOf(CAP, 5.5, WHEEL_R - 1.6, P, 48) + G.circleOf(CAP, 5.5, 2.5, P, 24), { tone: "lo" }) + Ln(spokes.join(""), { tone: "lo" }),
});
const CRANK = G.frameOf(G.pointOf(CAP, 0, 6.4, Math.PI / 4), AX.y, AX.x, AX.z);
disc("fix.crank", CRANK, 5.5, 9.5, 1.1, FIX);
disc("fix.crank-knob", CRANK, 9.5, 12.5, 1.8, FIX, { bevel: 0.3 });
// spring index pin that locks the rotation, on the front upright's side face
const PIN = frame([6, 38, 46], "x");
disc("fix.index-body", PIN, 0, 3, 1.6, FIX, { inner: Ln(G.arcOf(PIN, 1.5, 1.6, P), { tone: "faint" }) });
disc("fix.index-knob", PIN, 3, 5.4, 2.1, FIX, { bevel: 0.3, extra: k.fadedSvg(G.ribsOf(PIN, 3, 5.4, 2.1, 18, P, { fade: [0.1, 0.55] }), { tone: "lo" }) });
// clamp jaws that hook over the bus top edge, with knurled clamp screws
for (const x of [-9.5, 4.5]) {
  slab("fix.jaw", { x, y: 22, w: 5, d: 4, r: 0.5 }, BUS_TOP, 2.5, FIX, { bevel: 0.3 });
  const cx = x + 2.5;
  post("fix.screw", cx, 24, 1.1, BUS_TOP + 2.5, 2, FIX);
  post("fix.screw-head", cx, 24, 2, BUS_TOP + 4.5, 2.4, FIX, { extra: Ln(k.knurl(cx, 24, 2, BUS_TOP + 4.5, BUS_TOP + 6.9, 16, P), { tone: "lo" }) + Ln(k.ring(cx, 24, 0.9, BUS_TOP + 6.9, P, 12), { tone: "lo" }) });
}

// =====================================================================================
// Bus (subject, tone hi)
// =====================================================================================
const busSeam = Ln(k.sideSeam(BUS, AXLE_Z + 2.5, P, 3), { tone: "faint" });
const busTop = Ln(k.planOutline(k.insetPlan(BUS, 2.4), BUS_TOP, P, 2), { tone: "faint" }) + Dots(k.corners(BUS, 4.4).map(([x, y]) => at([x, y, BUS_TOP])), { size: 0.45 });
slab("bus.body", BUS, BUS_Z, BUS_TOP - BUS_Z, {}, { bevel: 0.8, inner: busSeam, extra: busTop });
// Hall thrusters and a star tracker on the front face
for (const x of [23, 30.8]) {
  const F = frame([x, BUS.y + BUS.d, AXLE_Z - 1], "y");
  disc("bus.thruster", F, 0, 2.6, 3.6, {}, { bevel: 0.3, extra: Ln(G.circleOf(F, 2.6, 2.5, P, 32) + G.circleOf(F, 2.6, 1.2, P, 20), { tone: "lo" }) + Dots([at(G.pointOf(F, 2.6, 0, 0))], { size: 0.5, tone: "hi" }) });
}
const TRK = frame([14.6, BUS.y + BUS.d, AXLE_Z - 1], "y");
disc("bus.tracker", TRK, 0, 4.6, 2.4, {}, { inner: Ln(G.arcOf(TRK, 2.2, 2.4, P), { tone: "faint" }) });
disc("bus.tracker-baffle", TRK, 4.6, 6.2, 3.2, {}, { bevel: 0.3, extra: Ln(G.circleOf(TRK, 6.2, 2.2, P, 28), { tone: "lo" }) });
// laser inter-satellite terminals on the top deck (base, pedestal, gimbal ball, lens barrel)
for (const [x, dir] of [[27, [0.82, 0.57, 0.08]], [-27, [0.2, 0.98, 0.08]]]) {
  const owner = `bus.laser${x > 0 ? "R" : "L"}`;
  const y = 11;
  post(`${owner}.base`, x, y, 4, BUS_TOP, 1.6, {}, { bevel: 0.3, owner, extra: Dots([0, 1, 2, 3].map((i) => at([x + 3.1 * Math.cos(i * Math.PI / 2 + 0.6), y + 3.1 * Math.sin(i * Math.PI / 2 + 0.6), BUS_TOP + 1.6])), { size: 0.38 }) });
  post(`${owner}.pedestal`, x, y, 2.1, BUS_TOP + 1.6, 3, {}, { owner });
  const HEAD = 3.4;
  const c = [x, y, BUS_TOP + 4.6 + Math.sqrt(HEAD ** 2 - 2.1 ** 2)];
  ball(`${owner}.head`, c, HEAD, {}, { owner });
  const LF = G.frameAlong(c, G.unit3(dir));
  const s0 = Math.sqrt(HEAD ** 2 - 1.7 ** 2);
  disc(`${owner}.lens`, LF, s0, HEAD + 1.4, 1.7, {}, { owner, extra: Ln(G.circleOf(LF, HEAD + 1.4, 1.05, P, 20), { tone: "lo" }) });
}

// =====================================================================================
// Compute module: an open-front rack whose access panel is swung open; the tray stack is lit
// =====================================================================================
const CM_Z = BUS_TOP;
const WALL_Z0 = CM_Z + 1.5;
const WALL_Z1 = CM_TOP - 1.5;
slab("cm.floor", { ...CM, r: 0.6 }, CM_Z, 1.5, {}, { bevel: 0.3 });
slab("cm.back", { x: CM.x, y: CM.y, w: CM.w, d: 2, r: 0.3 }, WALL_Z0, WALL_Z1 - WALL_Z0, {});
slab("cm.wall", { x: CM.x, y: CM.y + 2, w: 2, d: CM.d - 2, r: 0.3 }, WALL_Z0, WALL_Z1 - WALL_Z0, {});
const portZ = 55;
const wallR = Ln(slotX(CM.x + CM.w, -11, 13, 62, 75), { tone: "faint" }) + Dots([[-9.5, 63.5], [11.5, 63.5], [-9.5, 73.5], [11.5, 73.5]].map(([y, z]) => at([CM.x + CM.w, y, z])), { size: 0.4 });
slab("cm.wall", { x: CM.x + CM.w - 2, y: CM.y + 2, w: 2, d: CM.d - 2, r: 0.3 }, WALL_Z0, WALL_Z1 - WALL_Z0, {}, { extra: wallR });
const lid = Ln(k.planOutline(k.insetPlan({ ...CM, r: 0.6 }, 2), CM_TOP, P, 2), { tone: "faint" }) + Dots(k.corners(CM, 1.1).map(([x, y]) => at([x, y, CM_TOP])), { size: 0.4 });
slab("cm.lid", { ...CM, r: 0.6 }, WALL_Z1, 1.5, {}, { bevel: 0.4, extra: lid });
const TRAYS = 6;
const TRAY_H = 3.6;
const TRAY_PITCH = 4.6;
const TRAY = { x: CM.x + 2, y: CM.y + 2, w: CM.w - 4, d: CM.d - 1, r: 0.3 };
const trayFront = TRAY.y + TRAY.d;
for (let i = 0; i < TRAYS; i++) {
  const z0 = WALL_Z0 + 0.6 + i * TRAY_PITCH;
  const mid = z0 + TRAY_H / 2;
  const face = Ln(slotY(trayFront, 7, 13.4, mid - 0.55, mid + 0.55) + slotY(trayFront, -13.4, -7, mid - 0.55, mid + 0.55), { tone: "lit" }) + Dots([at([-15, trayFront, mid]), at([15, trayFront, mid])], { size: 0.38, tone: "hi" });
  slab("cm.tray", TRAY, z0, TRAY_H, { lit: true }, { bevel: 0.25, extra: face });
  slab("cm.tray-handle", { x: -4.5, y: trayFront, w: 9, d: 1.3, r: 0.4 }, mid - 0.8, 1.6, { lit: true }, { bevel: 0 });
}
// the access panel, hinged on its left edge and swung open 90°
const DOOR = { x: CM.x - 1.4, y: CM.y + CM.d + 1.2, w: 1.4, d: 28, r: 0.3 };
const doorFace = Ln(slotX(CM.x, DOOR.y + 2, DOOR.y + DOOR.d - 2, WALL_Z0 + 2, WALL_Z1 - 2), { tone: "faint" }) + Dots([[DOOR.y + 4, WALL_Z0 + 4], [DOOR.y + DOOR.d - 4, WALL_Z0 + 4], [DOOR.y + 4, WALL_Z1 - 4], [DOOR.y + DOOR.d - 4, WALL_Z1 - 4]].map(([y, z]) => at([CM.x, y, z])), { size: 0.4 });
slab("cm.door", DOOR, WALL_Z0 + 0.5, WALL_Z1 - WALL_Z0 - 1, {}, { bevel: 0.2, extra: doorFace });
for (const z of [WALL_Z0 + 4, WALL_Z1 - 7]) post("cm.door-hinge", CM.x - 0.6, CM.y + CM.d + 0.5, 0.9, z, 3, {}, { extra: Ln(k.ring(CM.x - 0.6, CM.y + CM.d + 0.5, 0.35, z + 3, P, 10), { tone: "lo" }) });
slab("cm.door-latch", { x: CM.x, y: DOOR.y + DOOR.d - 6, w: 1.2, d: 3, r: 0.3 }, 62, 4, {}, { bevel: 0 });

// =====================================================================================
// Radiators: two deployed panels, edge-on to the Sun (overhead), with fluid-loop manifolds
// =====================================================================================
const BAR = { z0: 53, z1: 57, top0: 99, top1: 103 };
for (const side of [1, -1]) {
  const x0 = side > 0 ? 2 : -44;
  const panel = { x: x0, y: RAD_Y, w: 42, d: RAD_T, r: 0.4 };
  const fy = RAD_Y + RAD_T;
  const risers = [];
  for (let x = x0 + 5; x <= x0 + 37.1; x += 3.2) risers.push(k.segment([x, fy, BAR.z1], [x, fy, BAR.top0], P));
  const frameLine = slotY(fy, x0 + 1.4, x0 + 40.6, BUS_TOP + 1.4, RAD_TOP - 1.4);
  slab("rad.panel", panel, BUS_TOP, RAD_TOP - BUS_TOP, {}, { bevel: 0.3, extra: Ln(frameLine, { tone: "faint" }) + Ln(risers.join(""), { tone: "lo" }) });
  const bx0 = x0 + 4;
  for (const z of [[BAR.z0, BAR.z1], [BAR.top0, BAR.top1]]) {
    const bar = { x: bx0, y: fy, w: 34, d: 3, r: 0.6 };
    slab("rad.manifold", bar, z[0], z[1] - z[0], {}, { bevel: 0.3, extra: Dots([at([bx0 + 1.6, fy + 1.5, z[1]]), at([bx0 + 32.4, fy + 1.5, z[1]])], { size: 0.38 }) });
  }
  // hinge cheeks on the deck
  for (const hx of side > 0 ? [4, 14] : [-8, -18]) {
    slab("rad.hinge", { x: hx, y: fy, w: 4, d: 2.5, r: 0.4 }, BUS_TOP, 3.6, {}, { bevel: 0.2, extra: Dots([at([hx + 2, fy + 2.5, BUS_TOP + 1.8])], { size: 0.45, tone: "hi" }) });
  }
}

// coolant loop: supply and return from each side of the compute module to its radiator's lower manifold
const MAN_Y = RAD_Y + RAD_T + 3;
for (const side of [1, -1]) {
  const wx = side * (CM.x + CM.w);
  pipe("loop.supply", [[wx, -8, portZ], [side * 24, -8, portZ], [side * 24, MAN_Y, portZ]], 1.1);
  pipe("loop.return", [[wx, -2, portZ], [side * 32, -2, portZ], [side * 32, MAN_Y, portZ]], 1.1, { pump: 8.5 });
}

// =====================================================================================
// Solar wings on hinged booms (hinge barrel, boom, yoke, two panels joined by hinge knuckles)
// =====================================================================================
function panelTop(plan, z) {
  const inset = k.insetPlan(plan, 1.3);
  const x0 = inset.x, x1 = inset.x + inset.w, y0 = inset.y, y1 = inset.y + inset.d;
  const cols = 7, rows = 9;
  const cells = [];
  const buses = [];
  for (let i = 1; i < cols; i++) {
    const x = x0 + ((x1 - x0) * i) / cols;
    (i % 2 ? cells : buses).push(k.lineOnTop([x, y0], [x, y1], z, P));
  }
  for (let j = 1; j < rows; j++) {
    const y = y0 + ((y1 - y0) * j) / rows;
    cells.push(k.lineOnTop([x0, y], [x1, y], z, P));
  }
  return Ln(k.planOutline(inset, z, P, 2), { tone: "lo" }) + Ln(cells.join(""), { tone: "faint" }) + Ln(buses.join(""), { tone: "lo" });
}
// a panel of the left wing turned up by `deg` about its hinge line (axis along y through `hinge`)
function tiltedPanel(name, hinge, deg) {
  const f = (deg * Math.PI) / 180;
  const u = [-Math.cos(f), 0, Math.sin(f)];
  const a = [Math.sin(f), 0, Math.cos(f)];
  const F = { o: hinge, a, u, v: [0, 1, 0] };
  const U0 = 1, U1 = 1 + PANEL.w, V0 = -PANEL.d / 2, V1 = PANEL.d / 2;
  const polygon = [[U0, V0], [U1, V0], [U1, V1], [U0, V1]];
  const on = (uu, vv, s = 1) => G.add3(G.add3(hinge, G.mul3(u, uu)), G.add3(G.mul3([0, 1, 0], vv), G.mul3(a, s)));
  const i0 = U0 + 1.3, i1 = U1 - 1.3, j0 = V0 + 1.3, j1 = V1 - 1.3;
  const cells = [], buses = [];
  for (let i = 1; i < 7; i++) {
    const uu = i0 + ((i1 - i0) * i) / 7;
    (i % 2 ? cells : buses).push(k.segment(on(uu, j0), on(uu, j1), P));
  }
  for (let j = 1; j < 9; j++) {
    const vv = j0 + ((j1 - j0) * j) / 9;
    cells.push(k.segment(on(i0, vv), on(i1, vv), P));
  }
  const top = Ln(poly([on(i0, j0), on(i1, j0), on(i1, j1), on(i0, j1)]), { tone: "lo" }) + Ln(cells.join(""), { tone: "faint" }) + Ln(buses.join(""), { tone: "lo" });
  const id = R.nameFor(name);
  const shape = R.solid(A.prism(F, polygon, -1, 1, { name: id }));
  put(on((U0 + U1) / 2, 0, 0), S(G.prismOf(F, polygon, -1, 1, P), { tone: "hi" }) + top, { name: id, shapes: [shape] });
  COUNT.solids++;
}
const FOLD = 38;
for (const side of [1, -1]) {
  const X = (x) => side * x; // mirror along x
  const span = (a, b) => (side > 0 ? [a, b] : [-b, -a]);
  const tag = side > 0 ? "R" : "L";
  const [bx0, bx1] = span(BUS.x + BUS.w, BUS.x + BUS.w + 5);
  slab(`wing${tag}.root`, { x: bx0, y: -7, w: bx1 - bx0, d: 14, r: 0.5 }, WING_Z - 5, 10, {}, { bevel: 0.3, extra: Dots([at([X(BUS.x + BUS.w + 2.5), -4.5, WING_Z + 5]), at([X(BUS.x + BUS.w + 2.5), 4.5, WING_Z + 5])], { size: 0.4 }) });
  cable(`wing${tag}.harness`, [[X(BUS.x + BUS.w + 24), -11, WING_Z], [X(BUS.x + BUS.w + 15), -11, WING_Z], [X(BUS.x + BUS.w + 9), -11, WING_Z - 4], [X(BUS.x + BUS.w), -11, WING_Z - 4]]);
  post(`wing${tag}.hdrm`, X(BUS.x + BUS.w + 2.5), 0, 1.5, WING_Z + 5, 2.6, {}, { extra: Ln(k.ring(X(BUS.x + BUS.w + 2.5), 0, 0.7, WING_Z + 7.6, P, 12), { tone: "lo" }) });
  const hingeX = X(BUS.x + BUS.w + 5 + 2.4);
  const HF = frame([hingeX, -7, WING_Z], "y");
  disc(`wing${tag}.hinge`, HF, 0, 14, 2.4, {}, { inner: Ln(G.arcOf(HF, 4.5, 2.4, P) + G.arcOf(HF, 9.5, 2.4, P), { tone: "faint" }) });
  const [m0, m1] = span(BUS.x + BUS.w + 9.8, BUS.x + BUS.w + 24);
  slab(`wing${tag}.boom`, { x: m0, y: -2, w: m1 - m0, d: 4, r: 0.5 }, WING_Z - 1.5, 3, {}, { bevel: 0.3 });
  const [y0, y1] = span(BUS.x + BUS.w + 24, BUS.x + BUS.w + 27);
  slab(`wing${tag}.yoke`, { x: y0, y: -PANEL.d / 2, w: y1 - y0, d: PANEL.d, r: 0.5 }, WING_Z - 2, 4, {}, { bevel: 0.3, extra: Dots([-20, -10, 10, 20].map((y) => at([X(BUS.x + BUS.w + 25.5), y, WING_Z + 2])), { size: 0.38 }) });
  let from = BUS.x + BUS.w + 27;
  for (let p = 0; p < 2; p++) {
    if (p === 1 && side < 0) {
      // the left wing is mid-deployment: its outer panel is still rising about the hinge line
      tiltedPanel(`wing${tag}.panel`, [X(from - 1), 0, WING_Z], FOLD);
      from += PANEL.w;
      continue;
    }
    const [p0, p1] = span(from, from + PANEL.w);
    const plan = { x: p0, y: -PANEL.d / 2, w: p1 - p0, d: PANEL.d, r: 0.5 };
    slab(`wing${tag}.panel`, plan, WING_Z - 1, 2, {}, { bevel: 0, extra: panelTop(plan, WING_Z + 1) });
    from += PANEL.w;
    if (p === 0) {
      for (const ky of [-18, 12]) disc(`wing${tag}.knuckle`, frame([X(from + 1), ky, WING_Z], "y"), 0, 6, 1, {});
      from += 2;
    }
  }
}

// =====================================================================================
// Settle the painter's order from the recorded geometry, then write the page and the SVG
// =====================================================================================
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
const body = [...back, ...R.items.map((item) => `<g data-k="${item.key.toFixed(2)}">${item.svg}</g>`)];
const LABEL =
  "A generic compute satellite of the 250-kilowatt class, as a museum model on its rotation fixture on a plinth. A flat-pack bus is held by trunnions in two uprights with a handwheel and clamp jaws. Two solar wings on hinged booms carry gridded cell panels; two radiator panels stand edge-on to the Sun behind the compute module, fed by supply and return coolant pipes from its sides. The compute module's access panel is swung open on its hinge to show a stack of six accelerator trays, the one lit part. Laser terminals, Hall thrusters and a star tracker sit on the bus.";
const svgPage = k.figureSvg({ width: W, height: H, label: LABEL, body });
const svgAlone = k.figureSvg({ width: W, height: H, label: LABEL, body, standalone: "dark" }).replace("</style>", `${TOKENS}</style>`);

const caption = `A 100-kW-class compute satellite first flies about 2028; commercial AI chips running in orbit with paying customers arrive by 2029 in every scenario (High by 2031), gated by launch. SpaceX's public target is ${TRUTH.peakKw} kW peak / ${TRUTH.avgKw} kW average per satellite, and its Sep 2026 FCC response bounds each satellite under ${TRUTH.massBoundKg.toLocaleString("en-US")} kg. One gigawatt in orbit is about ${TRUTH.fleet.toLocaleString("en-US")} such satellites, 16,000–18,000 t and 110–180 Starship flights. Generic and illustrative; proportions are not to scale (real wings are several times the radiator area).`;
const plate = k.plateHtml({
  fig: "Fig 1",
  title: "Compute satellite",
  hint: "",
  readout: READOUT,
  keys: [
    { mark: "lit", label: "Compute module: six accelerator trays behind the open access panel" },
    { mark: "raised", label: "Solar wings face the Sun; radiators stand edge-on to it, fed by the coolant loop" },
  ],
  caption,
  body: `<div class="iso-stage">${svgPage}</div>`,
});
const page = k.pageHtml({ title: "Compute satellite", theme: "dark", body: `<style>${TOKENS}</style>${plate}`, width: 680 });
writeFileSync(join(HERE, `${SLUG}.html`), page);
writeFileSync(join(HERE, `${SLUG}.svg`), svgAlone);
console.log(`wrote ${SLUG}.html (${(page.length / 1024).toFixed(0)} KB) and ${SLUG}.svg (${(svgAlone.length / 1024).toFixed(0)} KB) · ${R.items.length} items · ${COUNT.solids} solids · ${COUNT.pipes} pipes · scale ${KS.toFixed(3)}`);

const GROUPS = {};
for (const shape of R.solids) {
  const name = (shape.name ?? "").replace(/#\d+$/, "");
  const group = name.startsWith("loop.") || name.includes(".harness") ? "pipes and cables (flanges, shells)" : name.split(".")[0].replace(/[LR]$/, "").replace(/^bus$/, "bus");
  GROUPS[group] = (GROUPS[group] ?? 0) + 1;
}
console.log("solids by group:", Object.entries(GROUPS).map(([g, n]) => `${g} ${n}`).join(" · "), `· plinth layer ${1 + 8 + 1} · tubes ${PIPES.length + CABLES.length}`);
A.auditOrExit(R, P);

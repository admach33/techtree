// Ship-to-ship cryogenic propellant transfer interface, as a test article on a plinth.
// Two tank end sections face each other dome to dome, docked through a collar and latched ring,
// and joined below by the transfer assembly: bellows, flow meter, isolation valve and a cryogenic
// quick-disconnect on each side, and between the two quick-disconnects the lit main transfer line.
// node build.mjs            -> refuel.html, refuel.svg
// node build.mjs --audit    -> the same, then the geometry audit
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/alex/.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/Users/alex/.claude/skills/anatomy/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "/Users/alex/.claude/skills/anatomy/kit/tube.mjs";
import * as A from "/Users/alex/.claude/skills/anatomy/kit/audit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEG = Math.PI / 180;
const W = 640;
const H = 440;
const AZ = 60;
const EL = 30;

// ---- the true numbers (graph-v8.json, prop-cislunar-propellant-economy, `why`) ----
const LOAD_T = 1200; // a full HLS-class load, t
const GAUGE = 0.01; // gauging error, share of the load
const TANKER_T = 120; // ~12 t is ~0.1 tanker in the node, so one tanker carries ~120 t (implied)
const GAUGE_T = LOAD_T * GAUGE;
const READOUT = `${LOAD_T.toLocaleString("en-US")} t · ${Math.round(GAUGE * 100)}% gauge = ${GAUGE_T} t ≈ ${(GAUGE_T / TANKER_T).toFixed(1)} tanker`;

// ---- world (units ~ px), z up, tank axis along x ----
const ZA = 58; // tank axis height above the plinth top
const RT = 40; // tank radius
const HD = 21; // dome height (2:1 ellipsoidal head ~ 0.53 R)
const XD = 104; // dome base |x|
const LB = 38; // barrel length
const RC = 11; // docking collar radius
const ST = HD * Math.sqrt(1 - (RC / RT) ** 2); // where the dome meets the collar
const RING_S = 100; // docking ring flange, s from the dome base (s = XD is the interface plane x = 0)
const RING_R = 19;
const LATCH_R = 22.4;
const PLINTH = { x: -172, y: -60, w: 344, d: 120, r: 6 };
const PL_H = 12;
const FOOT_H = 6;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLINTH, -PL_H - FOOT_H, 0),
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sy) => [sx * (XD + LB + 3), sy * (RT + 2), ZA + RT + 2])),
    [-125, 0, 126],
    [125, 0, 126],
  ],
  W,
  H,
  { pad: 74, azimuth: AZ, elevation: EL },
);
const V = G.viewOf(P);
const KS = G.scaleOf(P);
const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const Faded = (list, style) => k.fadedSvg(list, style);
const FADE = [0.04, 0.42];
const RIB_FADE = [0.1, 0.55];
const ZERO = [0, 0, 0];

// Tank A sits at -x with its axis pointing +x (toward the interface); tank B mirrors it.
// Both frames have u = +y; v = +z for A and -z for B so both stay right-handed.
// Angles below are world angles phi in the y-z plane (0 = +y toward the viewer, 90 = up).
const FA = { ...G.frameOf([-XD, 0, ZA], [1, 0, 0], [0, 1, 0], [0, 0, 1]), sg: 1, side: -1, id: "a" };
const FB = { ...G.frameOf([XD, 0, ZA], [-1, 0, 0], [0, 1, 0], [0, 0, -1]), sg: -1, side: 1, id: "b" };
const ang = (F, phi) => F.sg * phi * DEG;
const radial = (phi) => [0, Math.cos(phi * DEG), Math.sin(phi * DEG)];
const visibleFace = (normal) => G.dot3(normal, V) > 0.12;

const dome = (s) => RT * Math.sqrt(Math.max(0, 1 - (s / HD) ** 2));
const domeSlope = (s) => (-RT * RT * s) / (HD * HD * Math.max(1e-6, dome(s)));
const onDome = (F, phi, s) => {
  const angle = ang(F, phi);
  const point = G.pointOf(F, s, dome(s), angle);
  const normal = G.unit3(G.sub3(G.radialOf(F, angle), G.mul3(F.a, domeSlope(s))));
  return { point, normal };
};

// ---- recorder and helpers (after examples/raptor-engine/build.mjs) ----
const R = A.recorder(P);
const { nameFor } = R;
const record = R.solid;
function put(ref, svg, { bias = 0, shapes = [], name, route, chunk } = {}) {
  R.put({ piece: "rig", at: ref, bias, svg, move: ZERO, shapes, name: name ?? nameFor("rig.item"), route, chunk });
}
function tubeItems(route, r, { name, tone = "hi", cls, bias = 0, maxLength = 20, spacing, owner, touch, limp = false, gaps = [], caps = true, ends = [true, true], rims, free = [false, false] } = {}) {
  const id = nameFor(name);
  R.route(id, route, r, { owner: owner ?? id, touch, limp, gaps, ends, rims, free, piece: "rig", move: ZERO });
  tubePieces(route, r, P, { maxLength, spacing, gaps, caps }).forEach((part, index) => {
    const svg = tubeSvg(part, { tone });
    put(part.mid, cls ? `<g class="${cls}">${svg}</g>` : svg, { bias, name: `${id}:${index}`, route: id, chunk: index, shapes: [A.tube(part.points, part.radii)] });
  });
  return id;
}
function turned(F, profile, style = {}, { extra = "", inner = "", bias = 0, rims, bevel = 0, steps, name, owner, smooth = profile.some((point) => point[2]) } = {}) {
  const paths = G.solidOf(profile, F, P, { bevel, smooth: smooth === true ? { rows: 3 } : smooth, ...(rims ? { rims } : {}), ...(steps ? { steps } : {}) });
  const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
  const id = nameFor(name ?? "rig.turned");
  const shape = record(A.solid(F, profile, { name: id, owner, curve: smooth && !smooth.slope ? profile : undefined }));
  put(G.add3(F.o, G.mul3(F.a, mid)), S(paths, { tone: "hi", ...style, inner }) + extra, { bias, name: id, shapes: [shape] });
  return shape;
}
const band = (F, s0, s1, r, style = {}, options = {}) => turned(F, [[s0, r], [s1, r]], style, options);
function flangeAt(centre, axis, r, thick, { bolts = 8, tone = "hi", bias = 0, boltR, name, owner } = {}) {
  const F = G.frameAlong(centre, axis);
  const id = nameFor(name ?? "rig.flange");
  const towards = G.dot3(F.a, V) > 0 ? thick / 2 : -thick / 2;
  const face = Math.abs(G.dot3(F.a, V)) > 0.12 && bolts ? Dots(G.dotsOf(F, towards, boltR ?? r * 0.74, bolts, P, { all: true }), { size: 0.38, tone: "mid" }) : "";
  put(centre, S(G.disc(-thick / 2, thick / 2, r, F, P), { tone }) + face, { bias, name: id, shapes: [record(A.disc(F, -thick / 2, thick / 2, r, { name: id, owner }))] });
}
function boxAt(plan, z, h, style = {}, { extra = "", bias = 0, bevel = 0.5, steps = 3, name, owner } = {}) {
  const centre = [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2];
  const id = nameFor(name ?? "rig.box");
  const shape = record(A.box([plan.x, plan.y, z], [plan.x + plan.w, plan.y + plan.d, z + h], { name: id, owner }));
  put(centre, S(k.slabOf(plan, z, h, P, steps, bevel), { tone: "hi", ...style }) + extra, { bias, name: id, shapes: [shape] });
  return shape;
}
function padOn(host, point, outward, a, h, { name, tone = "hi", bias = 0.1, owner, ring = false } = {}) {
  const hosts = [host].flat();
  const inside = (p) => hosts.some((shape) => A.sdf(shape, p) < 0);
  const axis = G.unit3(outward);
  const F = G.frameAlong(point, axis);
  const start = (angle) => {
    let lo = -2.5 * a;
    let hi = h;
    if (!inside(G.pointOf(F, lo, a, angle))) return 0;
    for (let step = 0; step < 40; step++) {
      const mid = (lo + hi) / 2;
      if (inside(G.pointOf(F, mid, a, angle))) lo = mid;
      else hi = mid;
    }
    return hi;
  };
  const low = Math.min(...Array.from({ length: 48 }, (_, index) => start((index / 48) * Math.PI * 2)));
  const id = nameFor(name ?? "rig.pad");
  const face = ring && G.dot3(axis, V) > 0.15 ? Ln(G.circleOf(F, h, a * 0.55, P, 16), { tone: "faint" }) : "";
  const shape = record(A.disc(F, low - 0.05, h, a, { name: id, owner, seated: true, cut: hosts }));
  put(G.add3(point, G.mul3(axis, h / 2)), S(G.saddleOf(F, a, start, h, P), { tone }) + face, { bias, name: id, shapes: [shape] });
  return { face: G.add3(point, G.mul3(axis, h)), shape };
}
function disc(F, s0, s1, r, style = {}, { extra = "", inner = "", bias = 0, bevel = 0, name, owner, seated, cut } = {}) {
  const id = nameFor(name ?? "rig.disc");
  const shape = record(A.disc(F, s0, s1, r, { name: id, owner, ...(seated ? { seated, cut } : {}) }));
  put(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), S(G.disc(s0, s1, r, F, P, { bevel }), { tone: "hi", ...style, inner }) + extra, { bias, name: id, shapes: [shape] });
  return shape;
}
function prism(F, polygon, s0, s1, style = {}, { extra = "", bias = 0, name, owner } = {}) {
  const id = nameFor(name ?? "rig.prism");
  const shape = record(A.prism(F, polygon, s0, s1, { name: id, owner }));
  const cx = polygon.reduce((sum, p) => sum + p[0], 0) / polygon.length;
  const cy = polygon.reduce((sum, p) => sum + p[1], 0) / polygon.length;
  const centre = G.add3(G.add3(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), G.mul3(F.u, cx)), G.mul3(F.v, cy));
  put(centre, S(G.prismOf(F, polygon, s0, s1, P), { tone: "hi", ...style }) + extra, { bias, name: id, shapes: [shape] });
  return shape;
}

// A pipe: a few straight legs, filleted, gapped wherever a collar, valve or meter wraps it.
// Positions along it are arc lengths; a negative one counts back from the far end.
const CLAMP_T = 3.4;
const CLAMP_GROW = 2.2;
function pipe(control, r, { name, tone = "hi", cls, bend = 2.6, flanges = [true, true], flangeR = 1.55, bands = [], bellows = [], valves = [], meters = [], clamps = [], maxLength = 20, free, touch } = {}) {
  const line = G.fillet(control, Math.max(r * bend, 3), r > 3 ? 24 : 12, { P, tube: r });
  const total = G.pathLength(line);
  const along = (value) => (value < 0 ? total + value : value);
  const fr = [flangeR].flat().length > 1 ? [flangeR].flat() : [flangeR, flangeR].flat();
  const collars = [];
  [[0, -1], [total, 1]].forEach(([s, sign], index) => {
    if (!flanges[index]) return;
    const thick = Math.max(0.9, r * 0.55);
    const tangent = G.tangentAlong(line, s);
    collars.push({ kind: "flange", centre: G.add3(G.pointAlong(line, s), G.mul3(tangent, (-sign * thick) / 2)), tangent, radius: r * fr[index], thick, gap: sign < 0 ? [0, thick] : [total - thick, total] });
  });
  const ring = (s, radius, thick, kind) => collars.push({ kind, centre: G.pointAlong(line, s), tangent: G.tangentAlong(line, s), radius, thick, gap: [s - thick / 2, s + thick / 2] });
  bands.forEach((s) => ring(along(s), r * 1.18, Math.max(0.8, r * 0.7), "band"));
  bellows.forEach((s) => ring(along(s), r * 1.26, Math.max(0.6, r * 0.3), "bellows"));
  clamps.forEach((s) => ring(along(s), r + CLAMP_GROW, CLAMP_T, "clamp"));
  const gaps = collars.map(({ gap }) => gap);
  valves.forEach((s) => gaps.push([along(s) - r * 2.4, along(s) + r * 2.4]));
  meters.forEach((s) => gaps.push([along(s) - r * METER, along(s) + r * METER]));
  const owner = tubeItems(line, r, { name, tone, cls, maxLength, spacing: Math.max(0.8, Math.min(2.4, r * 0.18)), touch, gaps, free, rims: flanges.map((flanged, index) => (flanged ? r * fr[index] : r)) });
  for (const { kind, centre, tangent, radius, thick } of collars) flangeAt(centre, tangent, radius, thick, { bolts: kind === "flange" && r > 3 ? 8 : 0, tone: kind === "flange" ? "hi" : "mid", name: `${owner}.${kind}`, owner });
  line.owner = owner;
  line.total = total;
  line.along = along;
  line.r = r;
  line.collars = collars;
  return line;
}

function valveOn(line, s, r, { tone = "hi", name, side = [0, 0, 1] } = {}) {
  const along = line.along(s);
  const centre = G.pointAlong(line, along);
  const tangent = G.tangentAlong(line, along);
  const F = G.frameAlong(centre, tangent);
  const body = r * 1.85;
  const id = nameFor(name ?? `${line.owner}.valve`);
  const owner = line.owner;
  const crown = body * 1.08;
  const bulge = (x) => r * 1.45 + (crown - r * 1.45) * Math.sqrt(Math.max(0, 1 - (x / (r * 1.6)) ** 2));
  const bulgeSlope = (x) => {
    if (Math.abs(x) >= r * 1.6 - 1e-9) return 0;
    const t = Math.max(-0.995, Math.min(0.995, x / (r * 1.6)));
    return (-(crown - r * 1.45) * t) / (r * 1.6 * Math.sqrt(1 - t * t));
  };
  const meridian = [
    [-r * 2.4, 0],
    [-r * 2.4, r * 1.45],
    ...Array.from({ length: 17 }, (_, index) => {
      const x = r * 1.6 * Math.sin(((index - 8) / 8) * (Math.PI / 2));
      return [x, bulge(x), index && index < 16 ? 1 : 0];
    }),
    [r * 2.4, r * 1.45],
    [r * 2.4, 0],
  ];
  const faceS = G.dot3(F.a, V) > 0 ? r * 2.4 : -r * 2.4;
  put(centre, S(G.lathe(meridian, F, P, { steps: 36, smooth: { slope: bulgeSlope, rows: 3 } }), { tone }) + Dots(G.dotsOf(F, faceS, r * 1.2, 8, P, { all: true }), { size: 0.38, tone: "mid" }), { name: id, shapes: [record(A.body(F, meridian, { name: id, owner }))] });
  const up = G.unit3(side);
  const NF = G.frameAlong(centre, up);
  const s0 = body * 1.08 - 0.25;
  const s1 = body * 1.08 + body * 0.45;
  put(G.add3(centre, G.mul3(up, (s0 + s1) / 2)), S(G.disc(s0, s1, r * 0.5, NF, P), { tone }), { bias: 0.2, name: `${id}.neck`, shapes: [record(A.disc(NF, s0, s1, r * 0.5, { name: `${id}.neck`, owner }))] });
  const top = G.add3(centre, [0, 0, s1]);
  const plan = { x: top[0] - r * 1.5, y: top[1] - r * 1.5, w: r * 3, d: r * 3, r: 0.8 };
  const lid = top[2] + r * 2.2;
  boxAt(plan, top[2], r * 2.2, { tone, inner: Ln(k.sideSeam(plan, top[2] + r * 0.7, P, 3), { tone: "faint" }) }, {
    bias: 0.3,
    name: `${id}.actuator`,
    owner,
    extra: Ln(k.planOutline(k.insetPlan(plan, 0.8), lid, P, 2), { tone: "faint" }) + Dots([at([plan.x + 1.2, plan.y + 1.2, lid]), at([plan.x + plan.w - 1.2, plan.y + plan.d - 1.2, lid])], { size: 0.4 }) + Dots([at([top[0], top[1], lid])], { size: 0.6, tone: "hi" }),
  });
  return { centre, top: lid };
}

// Turbine flow meter: a flanged spool with a transmitter head on a neck.
const METER = 2.0;
function meterOn(line, s, r, { name } = {}) {
  const along = line.along(s);
  const centre = G.pointAlong(line, along);
  const tangent = G.tangentAlong(line, along);
  const F = G.frameAlong(centre, tangent);
  const half = r * METER;
  const body = r * 1.38;
  const fl = r * 1.72;
  const ft = 1.5;
  const id = nameFor(name ?? `${line.owner}.meter`);
  const owner = line.owner;
  const toward = G.dot3(F.a, V) > 0;
  // spool body between two bolted flanges, each its own turned part
  const inner = Ln([-half + ft + 2.2, half - ft - 2.2].map((x) => G.arcOf(F, x, body, P)).join(""), { tone: "faint" });
  disc(F, -half + ft, half - ft, body, {}, { name: id, owner, inner });
  for (const [s0, s1] of [[-half, -half + ft], [half - ft, half]]) {
    const face = toward ? s1 : s0;
    const outer = toward ? s1 === half : s0 === -half;
    const boltR = outer ? fl * 0.78 : (fl + body) / 2;
    disc(F, s0, s1, fl, {}, { name: `${id}.flange`, owner, extra: Dots(G.dotsOf(F, face, boltR, 8, P, { all: true }), { size: 0.36, tone: "mid" }) });
  }
  const NF = G.frameAlong(centre, [0, 0, 1]);
  const n0 = body - 0.25;
  const n1 = body + 2.8;
  put(G.add3(centre, [0, 0, (n0 + n1) / 2]), S(G.disc(n0, n1, 1.3, NF, P), { tone: "hi" }), { bias: 0.2, name: `${id}.neck`, shapes: [record(A.disc(NF, n0, n1, 1.3, { name: `${id}.neck`, owner }))] });
  const h1 = n1 + 4.2;
  const headTop = G.add3(centre, [0, 0, h1]);
  put(
    G.add3(centre, [0, 0, (n1 + h1) / 2]),
    S(G.disc(n1, h1, 3.5, NF, P, { bevel: 0.45 }), { tone: "hi", inner: Ln(G.arcOf(NF, n1 + 1.4, 3.5, P), { tone: "faint" }) }) + Ln(G.circleOf(NF, h1, 2.1, P, 28), { tone: "faint" }) + Dots([at(G.add3(headTop, [-2.75, 0, 0])), at(G.add3(headTop, [2.75, 0, 0]))], { size: 0.4 }) + Dots([at(headTop)], { size: 0.55, tone: "hi" }),
    { bias: 0.3, name: `${id}.head`, shapes: [record(A.disc(NF, n1, h1, 3.5, { name: `${id}.head`, owner }))] },
  );
  return { centre, bottom: centre[2] - body };
}

// A support stanchion from the plinth: base plate, round post up to what it carries.
function stanchion(x, y, zTop, { name = "stand.stanchion", r = 1.4 } = {}) {
  const plate = { x: x - 5, y: y - 5, w: 10, d: 10, r: 1 };
  boxAt(plate, 0, 2, { tone: "mid" }, { name: `${name}.plate`, bevel: 0.4, extra: Dots(k.corners(plate, 1.8).map(([px, py]) => at([px, py, 2])), { size: 0.4 }) });
  const F = G.frameOf([x, y, 2], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  disc(F, 0, zTop - 2, r, { tone: "mid" }, { name: `${name}.post` });
}

function cable(points, { r = 0.6, bend = 6, name } = {}) {
  const route = G.fillet(points, bend, 12, { P, tube: r });
  const id = tubeItems(route, r, { name, tone: "mid", maxLength: 14, spacing: 1, limp: true, rims: [r, r] });
  [0, 1].forEach((index) => {
    const end = index ? route[route.length - 1] : route[0];
    put(end, Dots([at(end)], { size: 0.5, tone: "hi" }), { bias: 0.15, name: `${id}.end`, shapes: [A.ball(end, 0.5 / KS)] });
  });
  return route;
}

// ---- the plinth (static back layer, recorded as the ground) ----
const back = [];
back.push(`<path class="iso-halo" d="${k.haloOf(PLINTH, -PL_H - FOOT_H, PL_H, P)}"/>`);
const FEET = [-1, 1].flatMap((sx) => [-1, 1].map((sy) => [sx * (PLINTH.w / 2 - 22), sy * (PLINTH.d / 2 - 16)])).concat([[0, PLINTH.d / 2 - 16], [0, -PLINTH.d / 2 + 16]]);
FEET.sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
for (const [x, y] of FEET) {
  back.push(S(k.cylinder(x, y, 8, -PL_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
  back.push(S(k.cylinder(x, y, 6.2, -PL_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
}
back.push(S(k.slabOf(PLINTH, -PL_H, PL_H, P, 8, 1.4), { tone: "mid", inner: Ln(k.sideSeam(PLINTH, -PL_H + 3.2, P, 8), { tone: "faint" }) }));
record(A.box([PLINTH.x, PLINTH.y, -PL_H], [PLINTH.x + PLINTH.w, PLINTH.y + PLINTH.d, 0], { name: "stand.plinth", ground: true }));
back.push(Ln(k.planOutline(k.insetPlan(PLINTH, 6), 0, P), { tone: "lo" }));
const SCREWS = k.corners(PLINTH, 12);
back.push(Ln(SCREWS.map(([x, y]) => k.ring(x, y, 2.6, 0, P, 18)).join(""), { tone: "lo" }));
back.push(Dots(SCREWS.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
// ruler ticks down the plinth's front face, hanging from its top edge
const FRONT_Y = PLINTH.y + PLINTH.d;
const TICKS = k.sideTicks(PLINTH.x + 30, PLINTH.x + PLINTH.w - 30, 6, 5, FRONT_Y, 0, [2, 3.8], P, "x");
back.push(Ln(TICKS.minor, { tone: "lo" }), Ln(TICKS.major, { tone: "mid" }));

// engraved label plate: the earliest year, and nothing else
const LABEL = { x: -20, y: 40, w: 40, d: 13, r: 1.5 };
boxAt(LABEL, 0, 1, { tone: "mid" }, {
  name: "stand.label",
  bevel: 0.3,
  extra:
    Ln(k.planOutline(k.insetPlan(LABEL, 1.6), 1, P, 3), { tone: "faint" }) +
    (process.env.ENGRAVE ? k.faceTextSvg(k.topMatrix([LABEL.x + 8.2, LABEL.y + LABEL.d / 2 + 2.3], 1, P, "x"), "2030", { size: 6.6, tone: "mid" }) : "") +
    Dots([at([LABEL.x + 3.2, LABEL.y + LABEL.d / 2, 1]), at([LABEL.x + LABEL.w - 3.2, LABEL.y + LABEL.d / 2, 1])], { size: 0.42 }),
});

// ---- the two tank end sections ----
const TANK = {};
const DOME_KNOTS = Array.from({ length: 27 }, (_, index) => {
  const s = ST * Math.sin(((index / 26) * Math.PI) / 2);
  return [s, dome(s), index && index < 26 ? 1 : 0];
});
const STRAPS = [[-34, -24], [-12, -2]];
const BANDS = [[-LB, -34], [-24, -12], [-2, 0]];
const POLAR_S = 15;

function tank(F) {
  const T = { F };
  const x = (s) => G.pointOf(F, s, 0, 0);
  // end closure: blind plate with its bolt circle, and a manway on the plate when its face shows
  const outward = G.mul3(F.a, -1);
  const plateShows = visibleFace(outward);
  T.plate = disc(F, -LB - 3, -LB, RT + 2.2, { tone: "mid" }, {
    name: `tank-${F.id}.end-plate`,
    bevel: plateShows ? 0.8 : 0,
    extra: plateShows ? Dots(G.dotsOf(F, -LB - 3, RT + 1, 44, P, { all: true }), { size: 0.4, tone: "mid" }) + Ln(G.circleOf(F, -LB - 3, RT - 1.2, P), { tone: "faint" }) : "",
  });
  if (plateShows) {
    disc(F, -LB - 5, -LB - 3, 12, { tone: "mid" }, { name: `tank-${F.id}.manway`, bevel: 0.5, extra: Dots(G.dotsOf(F, -LB - 5, 10.6, 16, P, { all: true }), { size: 0.38, tone: "mid" }) + Ln(G.circleOf(F, -LB - 5, 6.4, P), { tone: "faint" }) });
    // instrument ports on the blind plate: temperature, pressure, purge
    for (const phi of [150, 205, 255]) {
      const point = G.pointOf(F, -LB - 3, 25, ang(F, phi));
      const PF = G.frameAlong(point, outward);
      disc(PF, 0, 2.2, 2.6, { tone: "mid" }, { name: `tank-${F.id}.port`, bevel: 0.3, extra: Dots(G.dotsOf(PF, 2.2, 2.05, 4, P, { all: true, phase: Math.PI / 4 }), { size: 0.3, tone: "mid" }) });
      disc(PF, 2.2, 3.6, 1.3, {}, { name: `tank-${F.id}.port-plug`, extra: Ln(G.circleOf(PF, 3.6, 0.6, P, 16), { tone: "faint" }) });
    }
    disc(F, -LB - 7, -LB - 5, 3, { tone: "mid" }, { name: `tank-${F.id}.manway-plug`, bevel: 0.3, extra: Ln(G.circleOf(F, -LB - 7, 1.4, P, 20), { tone: "faint" }) });
  }
  // barrel under its insulation blanket, in three bands between the two cradle straps
  T.bands = BANDS.map(([s0, s1], index) => {
    const ribs = G.ribsOf(F, s0, s1, RT, 14, P, { fade: RIB_FADE, seams: true, phase: ang(F, 0) + Math.PI / 14 });
    const mid = (s0 + s1) / 2;
    const stitch = index === 1 ? [mid - 0.9, mid + 0.9] : [];
    const inner = Faded(ribs, { tone: "faint" }) + (stitch.length ? Ln(G.arcOf(F, mid, RT, P), { tone: "faint" }) : "");
    const extra = [s0 + 1.1, s1 - 1.1, ...stitch].map((s) => Dots(G.dotsOf(F, s, RT, 120, P, { fade: FADE }), { size: 0.26, tone: "lo" })).join("");
    return band(F, s0, s1, RT, { tone: "mid" }, { name: `tank-${F.id}.barrel`, inner, extra });
  });
  T.straps = STRAPS.map(([s0, s1]) =>
    band(F, s0, s1, RT + 0.9, { tone: "mid" }, { name: `tank-${F.id}.strap`, inner: Ln(G.arcOf(F, (s0 + s1) / 2, RT + 0.9, P), { tone: "faint" }), extra: Dots(G.dotsOf(F, (s0 + s1) / 2, RT + 0.9, 36, P, { fade: FADE }), { size: 0.34, tone: "mid" }) }),
  );
  // the domed bulkhead: Y-ring at the barrel, gore welds up to the polar-cap weld
  const gores = [];
  for (let index = 0; index < 8; index++) {
    const angle = ((index + 0.5) / 8) * Math.PI * 2;
    const samples = Array.from({ length: 17 }, (_, j) => 0.4 + ((POLAR_S - 0.4) * j) / 16);
    const facing = Math.min(...samples.map((s) => G.facingOf(F, angle, P, domeSlope(s))));
    if (facing < 0.02) continue;
    const d = "M" + samples.map((s) => at(G.pointOf(F, s, dome(s), angle)).map((v) => v.toFixed(1)).join(" ")).join("L");
    gores.push({ d, alpha: G.fadeOf(facing, RIB_FADE) });
  }
  const domeInner = Faded(gores, { tone: "faint" }) + Ln(G.arcOf(F, POLAR_S, dome(POLAR_S), P, { slope: domeSlope(POLAR_S) }) + G.arcOf(F, 0.4, dome(0.4), P, { slope: domeSlope(0.4) }), { tone: "faint" });
  T.dome = turned(F, DOME_KNOTS, { tone: "mid" }, { name: `tank-${F.id}.dome`, smooth: { slope: domeSlope, rows: 6 }, inner: domeInner, extra: Dots(G.dotsOf(F, POLAR_S + 1.2, dome(POLAR_S + 1.2), 28, P, { slope: domeSlope(POLAR_S + 1.2), fade: FADE }), { size: 0.34, tone: "mid" }) });
  // docking collar, flare and ring
  const collarInner = Ln([42, 68].map((s) => G.arcOf(F, s, RC, P)).join(""), { tone: "faint" });
  const collarDots = Dots([44, 66].flatMap((s) => G.dotsOf(F, s, RC, 22, P, { fade: FADE })), { size: 0.32, tone: "mid" });
  T.collar = turned(F, [[ST, RC], [88, RC], [96, 17], [RING_S, 17]], { tone: "mid" }, { name: `tank-${F.id}.collar`, inner: collarInner, extra: collarDots });
  const ringFace = G.mul3(F.a, -1);
  T.ring = disc(F, RING_S, XD, RING_R, {}, { name: `tank-${F.id}.docking-ring`, extra: visibleFace(ringFace) ? Dots(G.dotsOf(F, RING_S, 18, 30, P, { all: true }), { size: 0.34, tone: "mid" }) : "" });
  // cradle: saddle pedestals under the straps, on base plates
  T.posts = STRAPS.map(([s0, s1]) => {
    const s = (s0 + s1) / 2;
    const foot = G.add3(x(s), [0, 0, 0]);
    const plate = { x: foot[0] - 10, y: -13, w: 20, d: 26, r: 2 };
    boxAt(plate, 0, 3, { tone: "mid" }, { name: `stand.cradle-plate`, bevel: 0.6, extra: Dots(k.corners(plate, 3).map(([px, py]) => at([px, py, 3])), { size: 0.45 }) + Ln(k.corners(plate, 3).map(([px, py]) => k.ring(px, py, 1.6, 3, P, 14)).join(""), { tone: "lo" }) });
    const strap = T.straps[STRAPS.findIndex((entry) => entry[0] === s0)];
    const bottom = [foot[0], 0, ZA - RT - 0.9];
    return padOn(strap, bottom, [0, 0, -1], 4.6, bottom[2] - 3, { name: `tank-${F.id}.pedestal`, tone: "mid" });
  });
  TANK[F.id] = T;
  return T;
}
tank(FA);
tank(FB);

// ---- docking interface: latches round the mated rings, umbilical plates on top ----
const ringPoly = (phi, r0, r1, half) => {
  const c = [Math.cos(phi * DEG), Math.sin(phi * DEG)];
  const t = [-c[1], c[0]];
  return [[c[0] * r0 + t[0] * half, c[1] * r0 + t[1] * half], [c[0] * r1 + t[0] * half, c[1] * r1 + t[1] * half], [c[0] * r1 - t[0] * half, c[1] * r1 - t[1] * half], [c[0] * r0 - t[0] * half, c[1] * r0 - t[1] * half]];
};

// ---- pressurisation lines: dome boss -> over the collar -> umbilical plate ----
const PRESS_R = 1.4;
const PRESS_PHI = 75;
const PRESS_S = 8;
const PRESS = {};
for (const F of [FA, FB]) {
  const { point, normal } = onDome(F, PRESS_PHI, PRESS_S);
  const pad = padOn(TANK[F.id].dome, point, normal, 2.7, 1, { name: `tank-${F.id}.press-boss` });
  PRESS[F.id] = { pad, normal };
}
const PRESS_Z = 98.5;
const pressLeg = (PRESS_Z - PRESS.a.pad.face[2]) / PRESS.a.normal[2];
const PRESS_P1 = G.add3(PRESS.a.pad.face, G.mul3(PRESS.a.normal, pressLeg));
const UMB_PHI = Math.atan2(PRESS_P1[2] - ZA, PRESS_P1[1]) / DEG;
const UMB_R1 = 26;
const UMB_HALF = 6.5;
for (const F of [FA, FB]) {
  const polygon = ringPoly(UMB_PHI * F.sg, RING_R, UMB_R1, UMB_HALF);
  const c = radial(UMB_PHI);
  const tan = [0, -c[2], c[1]];
  const corner = (sa, ta) => G.add3(G.add3(G.add3(F.o, G.mul3(F.a, sa)), G.mul3(c, UMB_R1)), G.mul3(tan, ta));
  const lidPath = "M" + [corner(XD - 7.8, UMB_HALF - 1.2), corner(XD - 1.2, UMB_HALF - 1.2), corner(XD - 1.2, -UMB_HALF + 1.2), corner(XD - 7.8, -UMB_HALF + 1.2)].map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join("L") + "Z";
  const screws = Dots([corner(XD - 8.4, UMB_HALF - 0.9), corner(XD - 8.4, -UMB_HALF + 0.9)].map(at), { size: 0.4 });
  prism(F, polygon, XD - 9, XD, {}, { name: `dock.umbilical-${F.id}`, extra: Ln(lidPath, { tone: "faint" }) + screws });
}
const LATCH_HALF = 2.4;
for (let index = 1; index < 6; index++) {
  const phi = UMB_PHI + index * 60;
  const c = radial(phi);
  const tan = [0, -c[2], c[1]];
  const outer = (xw) => G.add3([xw, 0, ZA], G.mul3(c, LATCH_R));
  const bolts = [-3.6, -1.6, 1.6, 3.6].map((xw) => at(G.add3(outer(xw), G.mul3(tan, 0))));
  const show = visibleFace(c);
  prism(FA, ringPoly(phi, RING_R, LATCH_R, LATCH_HALF), XD - 6.5, XD + 6.5, {}, { name: "dock.latch", extra: show ? Dots(bolts, { size: 0.38, tone: "mid" }) : "" });
}

// ---- transfer assembly: dome sump boss -> bellows -> flow meter -> isolation valve -> QD ----
const FEED_R = 3.2;
const FEED_PHI = -60;
const FEED_S = 6;
const QD_X = 45; // |x| where the feed line meets its quick-disconnect
const QD = [5, 5, 2]; // receptacle, coupling nut, poppet housing lengths
const MAIN_R = 3.6;
const MAIN_X = QD_X - QD[0] - QD[1] - QD[2];
const FEED = {};
for (const F of [FA, FB]) {
  const { point, normal } = onDome(F, FEED_PHI, FEED_S);
  const pad = padOn(TANK[F.id].dome, point, normal, 5.2, 1.2, { name: `tank-${F.id}.sump-boss` });
  const p1 = G.add3(pad.face, G.mul3(normal, 10));
  const end = [F.side * QD_X, p1[1], p1[2]];
  // spans counted back from the QD end, so both sides match
  const line = pipe([pad.face, p1, end], FEED_R, {
    name: `feed-${F.id}`,
    bellows: [-41, -39.8, -38.6, -37.4],
    meters: [-29],
    valves: [-13.5],
    maxLength: 12,
  });
  const meter = meterOn(line, -29, FEED_R, { name: `feed-${F.id}.meter` });
  valveOn(line, -13.5, FEED_R, { name: `feed-${F.id}.isolation-valve` });
  stanchion(meter.centre[0], meter.centre[1], meter.bottom + 0.05, { name: `stand.meter-${F.id}` });
  // quick-disconnect: ship-side receptacle (hex), coupling nut (knurled), poppet housing
  const QF = G.frameAlong(end, F.a);
  const hex = Faded(G.ribsOf(QF, 0, QD[0], 5.4, 6, P, { fade: RIB_FADE, phase: Math.PI / 6 }), { tone: "lo" });
  const knurl = Faded(G.ribsOf(QF, QD[0] + 0.6, QD[0] + QD[1] - 0.6, 6, 30, P, { fade: RIB_FADE, seams: true }), { tone: "lo" });
  disc(QF, 0, QD[0], 5.4, {}, { name: `qd-${F.id}.receptacle`, inner: hex });
  disc(QF, QD[0], QD[0] + QD[1], 6, {}, { name: `qd-${F.id}.coupling-nut`, inner: knurl, bevel: 0.4 });
  disc(QF, QD[0] + QD[1], QD[0] + QD[1] + QD[2], 5.4, {}, { name: `qd-${F.id}.poppet-housing`, inner: Ln(G.arcOf(QF, QD[0] + QD[1] + 1, 5.4, P), { tone: "faint" }) });
  FEED[F.id] = { line, end, y: p1[1], z: p1[2] };
}

// the lit part: the main transfer line between the two quick-disconnects
const MAIN_Y = FEED.a.y;
const MAIN_Z = FEED.a.z;
const CLAMP_X = 18;
const main = pipe([[-MAIN_X, MAIN_Y, MAIN_Z], [MAIN_X, MAIN_Y, MAIN_Z]], MAIN_R, { name: "main-transfer-line", tone: "lit", cls: "rf-lit", flangeR: 1.5, clamps: [MAIN_X - CLAMP_X, MAIN_X + CLAMP_X], maxLength: 10 });
for (const xw of [-CLAMP_X, CLAMP_X]) stanchion(xw, MAIN_Y, MAIN_Z - MAIN_R - CLAMP_GROW + 0.05, { name: "stand.main-support", r: 1.2 });

// pressurisation lines: up off the dome, over the collar, down onto the umbilical plate
const STANDOFF = [];
for (const F of [FA, FB]) {
  const { pad, normal } = PRESS[F.id];
  const leg = (PRESS_Z - pad.face[2]) / normal[2];
  const p1 = G.add3(pad.face, G.mul3(normal, leg));
  const c = radial(UMB_PHI);
  const landS = XD - 4.5;
  const land = G.add3(G.add3(F.o, G.mul3(F.a, landS)), G.mul3(c, UMB_R1));
  const above = G.add3(land, G.mul3(c, (PRESS_Z - land[2]) / c[2]));
  const line = pipe([pad.face, p1, above, land], PRESS_R, { name: `press-${F.id}`, bands: [14], clamps: [G.len3(G.sub3(p1, pad.face)) + 46], maxLength: 16, bend: 3 });
  STANDOFF.push({ F, line, clampAt: line.collars.find((c) => c.kind === "clamp").centre });
}

// a stand-off from the collar holds each pressurisation line at its clamp
for (const { F, clampAt } of STANDOFF) {
  const c = radial(UMB_PHI);
  const sAxis = G.dot3(G.sub3(clampAt, F.o), F.a);
  const base = G.add3(G.add3(F.o, G.mul3(F.a, sAxis)), G.mul3(c, RC));
  const pad = padOn(TANK[F.id].collar, base, c, 1.8, 0.8, { name: `tank-${F.id}.standoff-pad` });
  const reach = G.len3(G.sub3(clampAt, pad.face)) - (PRESS_R + CLAMP_GROW) + 0.05;
  const SF = G.frameAlong(pad.face, c);
  disc(SF, 0, reach, 0.85, { tone: "mid" }, { name: `tank-${F.id}.standoff` });
}

// vent line with relief valve and rain cap, off the barrel top
for (const F of [FA, FB]) {
  const s = -18;
  const host = TANK[F.id].bands[1];
  const top = G.pointOf(F, s, RT, ang(F, 90));
  const pad = padOn(host, top, [0, 0, 1], 3.4, 1.2, { name: `tank-${F.id}.vent-boss` });
  const VZ = 111;
  pipe([pad.face, [pad.face[0], pad.face[1], VZ]], 2, { name: `vent-${F.id}`, bands: [5.2], maxLength: 16 });
  const VF = G.frameOf([pad.face[0], pad.face[1], VZ], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  turned(VF, [[0, 3.4], [1.6, 3.4], [1.6, 2.9], [6.2, 2.9], [6.2, 2.2], [9.6, 1.7], [9.6, 2.4], [11, 2.4]], {}, { name: `vent-${F.id}.relief-valve`, inner: Ln(G.arcOf(VF, 3.9, 2.9, P), { tone: "faint" }), extra: Dots(G.dotsOf(VF, 1.6, 3.15, 8, P, { all: true }), { size: 0.34, tone: "mid" }) });
  disc(VF, 11, 12.4, 4.2, {}, { name: `vent-${F.id}.rain-cap`, bevel: 0.4, extra: Ln(G.circleOf(VF, 12.4, 2.2, P, 24), { tone: "faint" }) });
}

// mass-gauging sensor on each barrel: boss, sensor head, finned neck, connector
for (const F of [FA, FB]) {
  const s = -18;
  const phi = -30;
  const host = TANK[F.id].bands[1];
  const point = G.pointOf(F, s, RT, ang(F, phi));
  const outward = radial(phi);
  const pad = padOn(host, point, outward, 4.2, 1, { name: `tank-${F.id}.gauge-boss` });
  const GF = G.frameAlong(pad.face, outward);
  disc(GF, 0, 2.6, 3.6, {}, { name: `gauge-${F.id}.head`, bevel: 0.4, extra: Dots(G.dotsOf(GF, 2.6, 2.9, 6, P, { all: true, phase: Math.PI / 6 }), { size: 0.34, tone: "mid" }) });
  disc(GF, 2.6, 6, 1.5, {}, { name: `gauge-${F.id}.neck`, inner: Faded(G.ribsOf(GF, 2.6, 6, 1.5, 10, P, { fade: RIB_FADE, seams: true }), { tone: "lo" }) });
  disc(GF, 6, 8.6, 2.3, {}, { name: `gauge-${F.id}.connector`, bevel: 0.3, extra: Ln(G.circleOf(GF, 8.6, 1.4, P, 20), { tone: "faint" }) });
  // signal cable: out of the connector, straight down to a junction box on the plinth
  const plug = G.pointOf(GF, 8.6, 0, 0);
  const out = G.add3(plug, G.mul3(outward, 9));
  const JB = { x: out[0] - 8, y: out[1] - 5.5, w: 16, d: 11, r: 1.2 };
  const JH = 7;
  boxAt(JB, 0, JH, { tone: "mid", inner: Ln(k.sideSeam(JB, JH - 1.6, P, 3), { tone: "faint" }) }, { name: `stand.jbox-${F.id}`, bevel: 0.5, extra: Ln(k.planOutline(k.insetPlan(JB, 1.2), JH, P, 2), { tone: "faint" }) + Dots(k.corners(JB, 2).map(([px, py]) => at([px, py, JH])), { size: 0.4 }) });
  const GL = G.frameOf([out[0], out[1], JH], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  disc(GL, 0, 2.4, 1.5, { tone: "mid" }, { name: `stand.jbox-${F.id}.gland`, bevel: 0.25 });
  const SP = G.frameOf([out[0] + F.side * -4.6, out[1], JH], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  disc(SP, 0, 1.6, 1.3, { tone: "mid" }, { name: `stand.jbox-${F.id}.spare`, extra: Ln(G.circleOf(SP, 1.6, 0.6, P, 14), { tone: "faint" }) });
  cable([plug, out, [out[0], out[1], JH + 2.4]], { name: `gauge-${F.id}.cable` });
}

// ---- settle, draw ----
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
const body = [...back, ...R.items.map((item) => `<g class="it" data-name="${item.name}">${item.svg}</g>`)];

const TOKENS = `--anatomy-page:#08090B;--anatomy-card:#0C0E11;--anatomy-paper:#0C0E11;--anatomy-lit:#22CFFF;`;
const OWN_CSS = `.iso{${TOKENS}}.iso-plate{${TOKENS}}.rf-lit .tb-body{fill:var(--anatomy-lit-shade)}.rf-lit .tb-shine{fill:var(--anatomy-lit-top)}`;
const LABEL_TEXT =
  "A ship-to-ship cryogenic propellant transfer interface as a test article on a plinth: two insulated tank end sections face each other dome to dome, docked through a collar and a latched ring with umbilical plates on top. Below, each dome's sump boss feeds a vacuum-jacketed line with bellows, a flow meter and an isolation valve to a quick-disconnect; the lit main transfer line runs between the two quick-disconnects. Each tank also carries a vent line with a relief valve, a pressurisation line to the umbilical, and a mass-gauging sensor.";

const svgStandalone = k.figureSvg({ width: W, height: H, label: LABEL_TEXT, body: [`<style>${OWN_CSS}</style>`, ...body], standalone: "dark" });
writeFileSync(join(HERE, "refuel.svg"), svgStandalone);

const svgInline = k.figureSvg({ width: W, height: H, label: LABEL_TEXT, body });
const plate = k.plateHtml({
  fig: "Fig 3",
  title: "Ship-to-ship transfer",
  hint: "",
  readout: READOUT,
  keys: [
    { mark: "lit", label: "Main transfer line between the two quick-disconnects: where the propellant moves" },
    { mark: "raised", label: "Per tank: sump boss, bellows, flow meter, isolation valve, quick-disconnect; vent, pressurisation line, mass gauge" },
  ],
  caption:
    "A lunar-lander refuelling campaign needs more than 10 tanker flights, each ending in a transfer like this one. Boil-off costs about 1–5 extra tankers per campaign; a 1% gauging error on a 1,200 t load is about 12 t, about 0.1 tanker. Validated boil-off and transfer models recover only a few percent of campaign launches. Cadence and reuse set the economics. Earliest routine use: 2030 (base case), Medium by 2031, High by 2035; the binding gate is launch.",
  body: `<div class="iso-stage">${svgInline}</div>`,
});
const page = k.pageHtml({ title: "Ship-to-ship transfer", theme: "dark", body: `<style>${OWN_CSS}body.iso{background:#08090B}</style>${plate}`, width: 720 });
writeFileSync(join(HERE, "refuel.html"), page);
const solids = R.solids.length;
console.log("wrote refuel.html, refuel.svg", `${(svgStandalone.length / 1024).toFixed(0)} KB svg`, `${R.items.length} items`, `${solids} solids`, `${R.routes.length} routes`, `readout: ${READOUT}`);

A.auditOrExit(R, P);

if (process.argv.includes("--parts")) {
  const routes = new Set(R.routes.map((route) => route.name));
  const fittings = R.solids.filter((shape) => shape.owner && routes.has(shape.owner));
  const own = R.solids.filter((shape) => !(shape.owner && routes.has(shape.owner)));
  const kinds = {};
  for (const shape of fittings) {
    const kind = shape.name.replace(/#\d+$/, "").split(".").slice(1).join(".") || shape.name;
    kinds[kind] = (kinds[kind] ?? 0) + 1;
  }
  console.log(`parts: ${own.length} standalone solids + ${R.routes.length} lines carrying ${fittings.length} fittings (${Object.entries(kinds).map(([kind, n]) => `${n} ${kind}`).join(", ")}) + ${FEET.length} feet`);
}

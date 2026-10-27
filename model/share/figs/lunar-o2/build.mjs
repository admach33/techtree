// Fig: "Tonne-per-year lunar oxygen plant" (node auton-lunar-oxygen-ops, graph-v8.json).
// A pilot molten-regolith electrolysis plant standing on a regolith plinth, built with the Anatomy kit.
// node build.mjs           -> lunar-o2.html, lunar-o2.svg, svg-test.html
// node build.mjs --audit   -> also runs the geometry audit
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/alex/.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/Users/alex/.claude/skills/anatomy/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "/Users/alex/.claude/skills/anatomy/kit/tube.mjs";
import * as A from "/Users/alex/.claude/skills/anatomy/kit/audit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SLUG = "lunar-o2";
const DEG = Math.PI / 180;

// ---- truth (graph-v8.json, auton-lunar-oxygen-ops; model doc, MRE rig ICES 2026) ----
const TRUTH = {
  year: 2032, // earliest year, base case (S2)
  tPerYear: 1,
  hoursPerYear: 8760,
  needKgH: 1000 / 8760, // 0.114 kg/h
  rigKgH: 0.07, // 2024 molten-regolith electrolysis rig
  rigHours: 9,
  powerKw: [3, 6],
  meltC: 1600,
  anodeHours: 1000,
};
TRUTH.ratio = TRUTH.needKgH / TRUTH.rigKgH; // ~1.6x
TRUTH.swaps = Math.round(TRUTH.hoursPerYear / TRUTH.anodeHours); // ~9

// ---- world layout (x, y on the floor, z up; viewer looks from +x +y) ----
const W = 640;
const H = 440;
const PLINTH = { x: -138, y: -93, w: 208, d: 208, r: 6 };
const PLINTH_Z = [-16, -2];
const REGO = k.insetPlan(PLINTH, 3);
const FOOT_Z = -22;

const RC = [10, 10]; // reactor axis
const V_R = 20; // vessel radius
const Z = { skirt: 2, vessel: 10, lid: 58, lidTop: 61, plate: 65 };
const HC = [15, -52]; // hopper axis
const AUGER_Z = 84;
const AUGER_R = 5;
const TC = [-72.5, 29]; // oxygen tank
const TANK_R = 19;
const TANK_Z = 48;
const BOX = { x: -67, y: 85, w: 24, d: 20, r: 1.5 };
const MAST = [-95, 92];
const MAST_TOP = 176;
const PANEL = { z0: 80, z1: 172, half: 32, thick: 2 };

const P = k.fitProjection(
  [
    ...k.boxCorners(PLINTH, FOOT_Z, 0),
    [MAST[0], MAST[1], MAST_TOP + 3],
    [MAST[0] + 3.4 * Math.SQRT1_2 - PANEL.half * Math.SQRT1_2, MAST[1] + 3.4 * Math.SQRT1_2 + PANEL.half * Math.SQRT1_2, PANEL.z1],
    [HC[0], HC[1], 131],
  ],
  W,
  H,
  { pad: 24, azimuth: 45, elevation: 30 },
);
const V = G.viewOf(P);
const KS = G.scaleOf(P);
const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);

const R = A.recorder(P, {});
const record = R.solid;
function put(ref, svg, { bias = 0, shapes = [], name, route, chunk } = {}) {
  R.put({ piece: "plant", at: ref, bias, svg, shapes, name: name ?? R.nameFor("plant.item"), route, chunk });
}
const vF = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);

// ---- part helpers: each one draws and records the true shape ----
let PARTS = 0;
function vcyl(name, [x, y], r, z0, z1, style = {}, { bias = 0, extra = "", inner = "", owner, steps, bevel = 0 } = {}) {
  const id = R.nameFor(name);
  const paths = k.cylinder(x, y, r, z0, z1 - z0, P, steps ?? Math.max(24, Math.round(r * 5)), bevel);
  put([x, y, (z0 + z1) / 2], S(paths, { tone: "mid", ...style, inner }) + extra, { bias, name: id, shapes: [record(A.cylinder(x, y, r, z0, z1 - z0, { name: id, owner }))] });
  PARTS++;
  return id;
}
function slab(name, plan, z0, z1, style = {}, { bias = 0, extra = "", inner = "", owner, steps = 3, bevel = 0.5 } = {}) {
  const id = R.nameFor(name);
  put([plan.x + plan.w / 2, plan.y + plan.d / 2, (z0 + z1) / 2], S(k.slabOf(plan, z0, z1 - z0, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, {
    bias,
    name: id,
    shapes: [record(A.slab(plan, z0, z1 - z0, { name: id, owner }, steps))],
  });
  PARTS++;
  return id;
}
function discOn(name, F, s0, s1, r, style = {}, { bias = 0, extra = "", owner, bevel = 0 } = {}) {
  const id = R.nameFor(name);
  put(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), S(G.disc(s0, s1, r, F, P, { bevel }), { tone: "mid", ...style }) + extra, { bias, name: id, shapes: [record(A.disc(F, s0, s1, r, { name: id, owner }))] });
  PARTS++;
  return id;
}
function turned(name, F, profile, style = {}, { bias = 0, extra = "", inner = "", owner } = {}) {
  const id = R.nameFor(name);
  const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
  put(G.add3(F.o, G.mul3(F.a, mid)), S(G.solidOf(profile, F, P, { smooth: false }), { tone: "hi", ...style, inner }) + extra, { bias, name: id, shapes: [record(A.solid(F, profile, { name: id, owner }))] });
  PARTS++;
  return id;
}
function ball(name, centre, r, style = {}, { bias = 0, extra = "", owner } = {}) {
  const id = R.nameFor(name);
  put(centre, S(G.sphereOf(centre, r, P, { steps: G.stepsFor(r, 32) }), { tone: "hi", ...style }) + extra, { bias, name: id, shapes: [record(A.ball(centre, r, { name: id, owner }))] });
  PARTS++;
  return id;
}
function saddle(name, F, a, hostR, s1, host, style = {}, { bias = 0, extra = "" } = {}) {
  const id = R.nameFor(name);
  const low = Math.sqrt(hostR ** 2 - a ** 2);
  put(G.add3(F.o, G.mul3(F.a, (low + s1) / 2)), S(G.saddleOf(F, a, hostR, s1, P), { tone: "mid", ...style }) + extra, {
    bias,
    name: id,
    shapes: [record(A.disc(F, low - 0.05, s1, a, { name: id, seated: true, cut: [host] }))],
  });
  PARTS++;
  return id;
}
function prism(name, ring, z0, z1, style = {}, { bias = 0, extra = "", inner = "", owner, bevel = 0.5 } = {}) {
  const id = R.nameFor(name);
  const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length;
  const cy = ring.reduce((s, p) => s + p[1], 0) / ring.length;
  put([cx, cy, (z0 + z1) / 2], S(k.extrude(ring, z0, z1 - z0, P, { bevel }), { tone: "mid", ...style, inner }) + extra, { bias, name: id, shapes: [record(A.extruded(ring, z0, z1 - z0, { name: id, owner }))] });
  PARTS++;
  return id;
}

// pipes and cables (after the Raptor's pipe() and cable())
const ROUTES = [];
function tubeItems(route, r, { name, tone = "hi", bias = 0, maxLength = 18, spacing, owner, touch, limp = false, gaps = [], rims } = {}) {
  const id = R.nameFor(name);
  R.route(id, route, r, { owner: owner ?? id, touch, limp, gaps, rims });
  tubePieces(route, r, P, { maxLength, spacing, gaps }).forEach((part, index) =>
    put(part.mid, tubeSvg(part, { tone }), { bias, name: `${id}:${index}`, route: id, chunk: index, shapes: [A.tube(part.points, part.radii)] }),
  );
  ROUTES.push(id);
  return id;
}
function flangeAt(name, centre, axis, r, thick, { tone = "hi", bolts = 0, owner } = {}) {
  const F = G.frameAlong(centre, axis);
  const id = R.nameFor(name);
  const toward = G.dot3(F.a, V) > 0 ? thick / 2 : -thick / 2;
  const face = bolts && Math.abs(G.dot3(F.a, V)) > 0.12 ? Dots(G.dotsOf(F, toward, r * 0.74, bolts, P, { all: true }), { size: 0.42, tone: "mid" }) : "";
  put(centre, S(G.disc(-thick / 2, thick / 2, r, F, P), { tone }) + face, { name: id, shapes: [record(A.disc(F, -thick / 2, thick / 2, r, { name: id, owner }))] });
  PARTS++;
}
function pipe(control, r, { name, bend = 2.8, tone = "hi", flangeR = 1.6, bands = [], bandR = 1.22, bandT = 0, maxLength = 18 } = {}) {
  const line = G.fillet(control, Math.max(r * bend, 3), 14, { P, tube: r });
  const total = G.pathLength(line);
  const thick = Math.max(0.9, r * 0.6);
  const collars = [];
  [[0, -1], [total, 1]].forEach(([along, sign]) => {
    const tangent = G.tangentAlong(line, along);
    collars.push({ kind: "flange", centre: G.add3(G.pointAlong(line, along), G.mul3(tangent, (-sign * thick) / 2)), tangent, radius: r * flangeR, thick, gap: sign < 0 ? [0, thick] : [total - thick, total] });
  });
  for (const share of bands) {
    const along = total * share;
    const t = bandT || Math.max(0.8, r * 0.7);
    collars.push({ kind: "band", centre: G.pointAlong(line, along), tangent: G.tangentAlong(line, along), radius: r * bandR, thick: t, gap: [along - t / 2, along + t / 2] });
  }
  const id = tubeItems(line, r, { name, tone, maxLength, spacing: Math.max(0.8, r * 0.3), gaps: collars.map((c) => c.gap), rims: [r * flangeR, r * flangeR] });
  for (const c of collars) flangeAt(`${id}.${c.kind}`, c.centre, c.tangent, c.radius, c.thick, { tone: c.kind === "flange" ? tone : "mid", bolts: c.kind === "flange" ? 6 : 0, owner: id });
  return line;
}
function cable(points, { name, r = 0.9, bend = 4, touch } = {}) {
  const route = G.fillet(points, bend, 12, { P, tube: r });
  const id = tubeItems(route, r, { name, tone: "mid", bias: 0.2, maxLength: 14, spacing: 1, limp: true, touch, rims: [r, r] });
  for (const end of [route[0], route[route.length - 1]]) put(end, Dots([at(end)], { size: 0.55, tone: "hi" }), { bias: 0.4, name: `${id}.end`, shapes: [A.ball(end, 0.55 / KS)] });
  return route;
}

// ================= back layer: the plinth and its regolith =================
const back = [];
back.push(`<path class="iso-halo" d="${k.haloOf(PLINTH, FOOT_Z, PLINTH_Z[1] - FOOT_Z, P)}"/>`);
const FEET = k.corners(PLINTH, 20).sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
for (const [x, y] of FEET) {
  back.push(S(k.cylinder(x, y, 9, FOOT_Z, 1.6, P, 32), { tone: "lo" }));
  back.push(S(k.cylinder(x, y, 7, FOOT_Z + 1.6, PLINTH_Z[0] - FOOT_Z - 1.6, P, 32), { tone: "mid" }));
  PARTS += 2;
}
record(A.slab(PLINTH, PLINTH_Z[0], PLINTH_Z[1] - PLINTH_Z[0], { name: "stand.plinth" }, 6));
// plinth slab with a groove that wraps its visible corners, and the one engraved label
back.push(S(k.slabOf(PLINTH, PLINTH_Z[0], PLINTH_Z[1] - PLINTH_Z[0], P, 6, 1.2), { tone: "mid", inner: Ln(k.sideSeam(PLINTH, -11.5, P, 6), { tone: "lo" }) }));
if (process.env.ENGRAVE) back.push(k.faceTextSvg(k.sideMatrix([PLINTH.x + PLINTH.w - 30, PLINTH.y + PLINTH.d], PLINTH_Z[0] + 2.4, P, "left"), String(TRUTH.year), { size: 5.2, tone: "mid", anchor: "middle" }));
PARTS++;
record(A.slab(REGO, PLINTH_Z[1], -PLINTH_Z[1], { name: "stand.regolith" }, 6));
back.push(S(k.slabOf(REGO, PLINTH_Z[1], -PLINTH_Z[1], P, 6, 0.6), { tone: "lo" }));
PARTS++;
// lander footpad prints pressed into the regolith (closed rings)
for (const [x, y, r] of [
  [52, 84, 9],
  [-38, -72, 8.5],
  [50, -40, 8],
])
  back.push(Ln(k.ring(x, y, r, 0, P, 48) + k.ring(x, y, r - 2.6, 0, P, 40), { tone: "faint" }) + Ln(k.ring(x, y, r + 1.4, 0, P, 52), { tone: "lo" }));
// soft halos under what stands on the ground
back.push(`<path class="iso-halo" style="filter:blur(5px)" d="${k.haloOf({ x: RC[0] - 21, y: RC[1] - 21, w: 42, d: 42, r: 21 }, 0, 0.1, P)}"/>`);
back.push(`<path class="iso-halo" style="filter:blur(6px);opacity:.5" d="${k.haloOf({ x: HC[0] - 20, y: HC[1] - 20, w: 40, d: 40, r: 20 }, 0, 0.1, P)}"/>`);
back.push(`<path class="iso-halo" style="filter:blur(6px);opacity:.5" d="${k.haloOf({ x: TC[0] - 19, y: TC[1] - 19, w: 38, d: 38, r: 19 }, 0, 0.1, P)}"/>`);
back.push(`<path class="iso-halo" style="filter:blur(4px)" d="${k.haloOf(k.insetPlan(BOX, -2), 0, 0.1, P)}"/>`);

// rocks: low convex lumps on the regolith
function rock(cx, cy, r, h, seed) {
  const ring = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 + seed;
    const rr = r * (0.78 + 0.22 * Math.abs(Math.sin(seed * 3.1 + i * 1.7)));
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a) * 0.8];
  });
  prism("rock", ring, 0, h, { tone: "lo" }, { bevel: 0.6 });
}
rock(28, 104, 6, 4, 0.4);
rock(62, 30, 4.5, 3, 1.3);
rock(-60, -48, 5.5, 3.6, 2.2);
rock(-120, -24, 4, 2.6, 0.9);
rock(38, -80, 3.6, 2.4, 1.8);

// ================= the reactor (the lit vessel) =================
const RF = vF(RC[0], RC[1], 0);
const rAt = (dx, dy) => [RC[0] + dx, RC[1] + dy];
vcyl("reactor.footring", RC, 19, 0, Z.skirt, { tone: "lo" }, { bevel: 0.5 });
vcyl("reactor.skirt", RC, 16, Z.skirt, Z.vessel, { tone: "mid" }, { inner: Ln(k.sideArc(RC[0], RC[1], 16, 6, P, 48), { tone: "faint" }) });
// the vessel: refractory-lined crucible in an insulated jacket, the one lit part
{
  const id = "reactor.vessel";
  const seams = [22, 34, 46].map((z) => k.sideArc(RC[0], RC[1], V_R, z, P, 72)).join("");
  const staves = [15, 45, 75].map((deg) => {
    const a = deg * DEG;
    const x = RC[0] + V_R * Math.cos(a);
    const y = RC[1] + V_R * Math.sin(a);
    return k.segment([x, y, Z.vessel], [x, y, Z.lid], P);
  }).join("");
  const rivets = [22, 34, 46].flatMap((z) => [0, 30, 60, 90].map((deg) => at([RC[0] + V_R * Math.cos((deg + 30) * DEG), RC[1] + V_R * Math.sin((deg + 30) * DEG), z])));
  put([RC[0], RC[1], (Z.vessel + Z.lid) / 2], S(k.cylinder(RC[0], RC[1], V_R, Z.vessel, Z.lid - Z.vessel, P, 96, 0), { tone: "hi", lit: true, inner: Ln(seams + staves, { tone: "faint" }) }) + Dots(rivets, { size: 0.42, tone: "mid" }), {
    name: id,
    shapes: [record(A.cylinder(RC[0], RC[1], V_R, Z.vessel, Z.lid - Z.vessel, { name: id }))],
  });
  PARTS++;
}
// on the jacket: a viewport and two thermocouple bosses, rim on the shell
{
  const radial = (deg, z) => G.frameOf([RC[0], RC[1], z], [Math.cos(deg * DEG), Math.sin(deg * DEG), 0], [0, 0, 1], [-Math.sin(deg * DEG), Math.cos(deg * DEG), 0]);
  const VP = radial(45, 40);
  const v0 = Math.sqrt(V_R ** 2 - 3.6 ** 2);
  discOn("reactor.viewport", VP, v0, V_R + 1.6, 3.6, { tone: "hi" }, {
    owner: "reactor.vessel",
    extra: Ln(G.circleOf(VP, V_R + 1.6, 2.3, P, 28), { tone: "lo" }) + Ln(G.circleOf(VP, V_R + 1.6, 1.5, P, 24), { tone: "faint" }) + Dots(G.dotsOf(VP, V_R + 1.6, 3.0, 6, P, { all: true, phase: 0.5 }), { size: 0.36, tone: "mid" }),
  });
  for (const [deg, z] of [
    [25, 28],
    [65, 28],
  ]) {
    const TF = radial(deg, z);
    discOn("reactor.thermocouple", TF, Math.sqrt(V_R ** 2 - 1.5 ** 2), V_R + 2.2, 1.5, { tone: "mid" }, { owner: "reactor.vessel", extra: Dots([at(G.pointOf(TF, V_R + 2.2, 0, 0))], { size: 0.5, tone: "hi" }) });
  }
}
// spare anodes lying on two cradles in front of the plant (anodes last ~1,000 h: about 9 swaps a year)
{
  const ROD_R = 1.6;
  const ROD_Z = 3 + ROD_R;
  for (const x of [40, 54]) slab("anode.cradle", { x, y: 45, w: 3.4, d: 15, r: 0.6 }, 0, 3, { tone: "mid" }, { bevel: 0.3, steps: 2, extra: Dots([at([x + 1.7, 46.4, 3]), at([x + 1.7, 58.6, 3])], { size: 0.38 }) });
  for (const y of [48.5, 52.5, 56.5]) {
    const F = G.frameOf([36, y, ROD_Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    discOn("anode.spare", F, 0, 24, ROD_R, { tone: "hi" });
    discOn("anode.spare.head", F, 24, 27, 2.1, { tone: "mid" }, { bevel: 0.3 });
  }
}
// lid flange with its bolt circle, and the insulated lid plate
const lidBolts = Array.from({ length: 24 }, (_, i) => at([RC[0] + 21.8 * Math.cos((i / 24) * Math.PI * 2), RC[1] + 21.8 * Math.sin((i / 24) * Math.PI * 2), Z.lidTop]));
vcyl("reactor.lidflange", RC, 23, Z.lid, Z.lidTop, { tone: "hi" }, { bevel: 0.5, extra: Dots(lidBolts, { size: 0.42, tone: "mid" }), steps: 96 });
vcyl("reactor.lidplate", RC, 20.5, Z.lidTop, Z.plate, { tone: "hi" }, { bevel: 0.6, steps: 96, extra: Ln(k.ring(RC[0], RC[1], 17.6, Z.plate, P, 72), { tone: "faint" }) });
// anode change port: neck, flange, bolted blind cover and a lifting lug
vcyl("reactor.changeport.neck", RC, 6.5, Z.plate, 70, { tone: "mid" });
vcyl("reactor.changeport.flange", RC, 9, 70, 72, { tone: "hi" }, { bevel: 0.4 });
const coverBolts = Array.from({ length: 8 }, (_, i) => at([RC[0] + 7.6 * Math.cos((i / 8) * Math.PI * 2 + 0.2), RC[1] + 7.6 * Math.sin((i / 8) * Math.PI * 2 + 0.2), 74.5]));
vcyl("reactor.changeport.cover", RC, 9, 72, 74.5, { tone: "hi" }, { bevel: 0.5, extra: Dots(coverBolts, { size: 0.45, tone: "mid" }) });
slab("reactor.changeport.lug", { x: RC[0] - 1.2, y: RC[1] - 4, w: 2.4, d: 8, r: 0.6 }, 74.5, 78, { tone: "mid" }, { bevel: 0.3, steps: 2 });
// two anode feedthroughs: seat boss, ceramic insulator with sheds, terminal cap
for (const [dx, dy] of [
  [6, 13],
  [13, 3],
]) {
  const p = rAt(dx, dy);
  vcyl("reactor.feedthrough.seat", p, 3.4, Z.plate, 67, { tone: "mid" });
  vcyl("reactor.feedthrough.insulator", p, 2.4, 67, 73, { tone: "hi" }, { inner: Ln([69, 71].map((z) => k.sideArc(p[0], p[1], 2.4, z, P, 16)).join(""), { tone: "lo" }) });
  vcyl("reactor.feedthrough.cap", p, 2.9, 73, 76.5, { tone: "hi" }, { bevel: 0.3, extra: Ln(k.ring(p[0], p[1], 1.2, 76.5, P, 14), { tone: "lo" }) });
}
// feed port collar on the lid, under the auger's drop chute
const FEED = rAt(5, -13);
vcyl("reactor.feedport.collar", FEED, 4.2, Z.plate, 69, { tone: "mid" });
vcyl("reactor.feedport.flange", FEED, 5.6, 69, 70.5, { tone: "hi" }, { bevel: 0.3 });
// hot-gas outlet boss on the lid
const GAS = rAt(-12, 6);
vcyl("reactor.gasport", GAS, 3.2, Z.plate, 69, { tone: "mid" });
// slag tap low on the +x side: spout, ball valve with a handle, nozzle; a slag pan below
{
  const F = G.frameOf([RC[0], RC[1], 16], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const s0 = Math.sqrt(V_R ** 2 - 2.4 ** 2);
  discOn("reactor.slagtap.spout", F, s0, 25.5, 2.4, { tone: "hi" }, { owner: "reactor.slagtap" });
  ball("reactor.slagtap.valve", G.pointOf(F, 28.2, 0, 0), 3.6, { tone: "hi" }, { owner: "reactor.slagtap" });
  discOn("reactor.slagtap.stem", G.frameOf(G.pointOf(F, 28.2, 0, 0), [0, 0, 1], [1, 0, 0], [0, 1, 0]), Math.sqrt(3.6 ** 2 - 1 ** 2), 5.6, 1, { tone: "mid" }, { owner: "reactor.slagtap" });
  slab("reactor.slagtap.handle", { x: RC[0] + 28.2 - 1, y: RC[1] - 5.5, w: 2, d: 7, r: 0.6 }, 16 + 5.6, 16 + 6.8, { tone: "mid" }, { bevel: 0.2, steps: 2 });
  discOn("reactor.slagtap.nozzle", F, 28.2 + Math.sqrt(3.6 ** 2 - 2 ** 2), 34, 2, { tone: "hi" }, { owner: "reactor.slagtap" });
  // open slag tray: floor, four walls, a cooled slag cake inside
  const pan = { x: RC[0] + 29, y: RC[1] - 8, w: 16, d: 16, r: 1 };
  const T = 1.2;
  slab("reactor.slagtray.floor", pan, 0, 1, { tone: "lo" }, { bevel: 0, steps: 2 });
  slab("reactor.slagtray.wall", { x: pan.x, y: pan.y, w: pan.w, d: T, r: 0.3 }, 1, 5, { tone: "mid" }, { bevel: 0.2, steps: 2, owner: "slagtray" });
  slab("reactor.slagtray.wall", { x: pan.x, y: pan.y + T, w: T, d: pan.d - T, r: 0.3 }, 1, 5, { tone: "mid" }, { bevel: 0.2, steps: 2, owner: "slagtray" });
  prism("reactor.slagcake", [[pan.x + 4, pan.y + 4], [pan.x + 10.5, pan.y + 3.4], [pan.x + 12.8, pan.y + 8], [pan.x + 10, pan.y + 12.6], [pan.x + 4.2, pan.y + 11.8], [pan.x + 2.6, pan.y + 7.6]], 1, 2.8, { tone: "lo" }, { bevel: 0.4 });
  slab("reactor.slagtray.wall", { x: pan.x + pan.w - T, y: pan.y + T, w: T, d: pan.d - T, r: 0.3 }, 1, 5, { tone: "mid" }, { bevel: 0.2, steps: 2, owner: "slagtray" });
  slab("reactor.slagtray.wall", { x: pan.x + T, y: pan.y + pan.d - T, w: pan.w - 2 * T, d: T, r: 0.3 }, 1, 5, { tone: "mid" }, { bevel: 0.2, steps: 2, owner: "slagtray" });
}
// power junction box beside the skirt, where the electrode bus comes in
const JBOX = { x: -1, y: 29.5, w: 7, d: 8, r: 0.8 };
slab("reactor.junction", JBOX, 0, 9, { tone: "mid" }, {
  extra: Ln(k.planOutline(k.insetPlan(JBOX, 1.2), 9, P, 2), { tone: "faint" }) + Dots([at([JBOX.x + 1.3, JBOX.y + 1.3, 9]), at([JBOX.x + JBOX.w - 1.3, JBOX.y + JBOX.d - 1.3, 9])], { size: 0.4 }),
});
const JF = G.frameOf([JBOX.x + JBOX.w / 2, JBOX.y + JBOX.d, 4.5], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
discOn("reactor.junction.connector", JF, 0, 1.6, 1.7, { tone: "hi" });

// ================= feed hopper and screw auger =================
const HF = vF(HC[0], HC[1], 0);
// stand: four legs on pads under the hopper's ring flange
const LEG_RAD = 19.5;
for (const deg of [45, 135, 225, 315]) {
  const p = [HC[0] + LEG_RAD * Math.cos(deg * DEG), HC[1] + LEG_RAD * Math.sin(deg * DEG)];
  vcyl("hopper.pad", p, 3.4, 0, 1.6, { tone: "lo" }, { extra: Dots([at([p[0], p[1], 1.6])], { size: 0.4 }) });
  vcyl("hopper.leg", p, 1.7, 1.6, 106, { tone: "mid" }, { inner: Ln(k.sideArc(p[0], p[1], 1.7, 54, P, 12), { tone: "faint" }) });
}
turned("hopper.cone", vF(HC[0], HC[1], 90), [[0, 4.4], [16, 17.6]], { tone: "hi" });
vcyl("hopper.ringflange", HC, 21.4, 106, 109, { tone: "mid" }, {
  bevel: 0.5,
  extra: Dots(Array.from({ length: 16 }, (_, i) => at([HC[0] + 20 * Math.cos((i / 16) * Math.PI * 2), HC[1] + 20 * Math.sin((i / 16) * Math.PI * 2), 109])), { size: 0.4 }),
});
vcyl("hopper.bin", HC, 18, 109, 128, { tone: "hi" }, { inner: Ln([115.5, 122].map((z) => k.sideArc(HC[0], HC[1], 18, z, P, 64)).join(""), { tone: "faint" }) });
vcyl("hopper.lid", HC, 18.8, 128, 130, { tone: "hi" }, { bevel: 0.5, extra: Ln(k.ring(HC[0], HC[1], 16.6, 130, P, 64), { tone: "faint" }) });
slab("hopper.hatch", { x: HC[0] - 6, y: HC[1] - 2, w: 10, d: 10, r: 1 }, 130, 131.4, { tone: "mid" }, {
  bevel: 0.3,
  extra: Dots([at([HC[0] - 4.6, HC[1] - 0.6, 131.4]), at([HC[0] + 2.6, HC[1] + 6.6, 131.4])], { size: 0.4 }),
});
// auger housing along +y from the motor to the drop chute over the feed port
{
  const AF = G.frameOf([HC[0], HC[1], AUGER_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const s = (y) => y - HC[1];
  const end = s(FEED[1] + 5.4);
  const sections = [s(HC[1] + 9), s(HC[1] + 21), s(HC[1] + 33), s(FEED[1] - 7)];
  const id = R.nameFor("auger.housing");
  put(G.pointOf(AF, (s(HC[1] - 6) + end) / 2, 0, 0), S(G.disc(s(HC[1] - 6), end, AUGER_R, AF, P), { tone: "hi", inner: Ln(sections.map((sv) => G.arcOf(AF, sv, AUGER_R, P)).join(""), { tone: "faint" }) }) + Dots(sections.flatMap((sv) => G.dotsOf(AF, sv, AUGER_R, 10, P, { fade: [0.04, 0.42] })), { size: 0.38, tone: "mid" }), {
    name: id,
    shapes: [record(A.disc(AF, s(HC[1] - 6), end, AUGER_R, { name: id }))],
  });
  PARTS++;
  const HOUSING = R.solids[R.solids.length - 1];
  saddle("hopper.throat", G.frameOf([HC[0], HC[1], AUGER_Z], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 4.4, AUGER_R, 90 - AUGER_Z, HOUSING, { tone: "mid" });
  saddle("auger.chute", G.frameOf([FEED[0], FEED[1], AUGER_Z], [0, 0, -1], [1, 0, 0], [0, 1, 0]), 3.4, AUGER_R, AUGER_Z - 70.5, HOUSING, { tone: "mid" });
  discOn("auger.endcap", AF, end, end + 1.6, AUGER_R + 1, { tone: "hi" }, { bevel: 0.3 });
  discOn("auger.motorflange", AF, s(HC[1] - 8), s(HC[1] - 6), AUGER_R + 1.6, { tone: "hi" });
  {
    const id2 = R.nameFor("auger.motor");
    const s0 = s(HC[1] - 20);
    const s1 = s(HC[1] - 8);
    const fins = G.ribsOf(AF, s0, s1, 6, 30, P, { fade: [0.1, 0.55], seams: true });
    put(G.pointOf(AF, (s0 + s1) / 2, 0, 0), S(G.disc(s0, s1, 6, AF, P), { tone: "mid" }) + k.fadedSvg(fins, { tone: "lo" }), { name: id2, shapes: [record(A.disc(AF, s0, s1, 6, { name: id2 }))] });
    PARTS++;
  }
  discOn("auger.endbell", AF, s(HC[1] - 22.5), s(HC[1] - 20), 4.6, { tone: "mid" }, { bevel: 0.4 });
}

// ================= power and control box with its radiator =================
const BOX_BASE = k.insetPlan(BOX, -2);
slab("box.base", BOX_BASE, 0, 2, { tone: "lo" }, {
  bevel: 0.4,
  extra: Dots(k.corners(BOX_BASE, 1.2).map(([x, y]) => at([x, y, 2])), { size: 0.45 }),
});
{
  const vents = [0, 1, 2, 3, 4].map((i) => {
    const y0 = BOX.y + 4 + i * 2.6;
    const pts = [
      [BOX.x + BOX.w, y0, 10],
      [BOX.x + BOX.w, y0 + 1.2, 10],
      [BOX.x + BOX.w, y0 + 1.2, 26],
      [BOX.x + BOX.w, y0, 26],
    ].map(at);
    return `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L")}Z`;
  }).join("");
  const seam = k.sideSeam(BOX, 35, P, 3);
  const panelY = BOX.y + BOX.d;
  const door = [
    [BOX.x + 3, panelY, 6],
    [BOX.x + BOX.w - 3, panelY, 6],
    [BOX.x + BOX.w - 3, panelY, 32],
    [BOX.x + 3, panelY, 32],
  ].map(at);
  const doorD = `M${door.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L")}Z`;
  slab("box.cabinet", BOX, 2, 40, { tone: "hi" }, {
    bevel: 0.6,
    inner: Ln(seam, { tone: "faint" }),
    extra: Ln(vents + doorD, { tone: "lo" }) + Dots([at([BOX.x + 5, panelY, 29]), at([BOX.x + BOX.w - 5, panelY, 29]), at([BOX.x + 5, panelY, 9]), at([BOX.x + BOX.w - 5, panelY, 9])], { size: 0.42 }),
  });
  slab("box.lamp", { x: BOX.x + BOX.w - 7.5, y: panelY, w: 3, d: 0.8, r: 0.3 }, 23, 25.5, { tone: "mid" }, { bevel: 0, steps: 1 });
}
// connectors: harness in on the -x face (from the mast), power out on the +x face (to the reactor)
const HARN_IN = [BOX.x, MAST[1], 5.5];
discOn("box.harness.connector", G.frameOf(HARN_IN, [-1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 1.6, 1.7, { tone: "hi" });
const POWER_OUT = [BOX.x + BOX.w, MAST[1], 5];
discOn("box.power.connector", G.frameOf(POWER_OUT, [1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 1.6, 1.9, { tone: "hi" });
// radiator: a finned panel on two stand-offs on the cabinet roof
for (const x of [BOX.x + 4, BOX.x + BOX.w - 7]) slab("box.radiator.standoff", { x, y: BOX.y + 8.6, w: 3, d: 4.4, r: 0.5 }, 40, 44, { tone: "mid" }, { bevel: 0.2, steps: 2 });
{
  const RAD = { x: BOX.x + 2.5, y: BOX.y + 9.6, w: BOX.w - 5, d: 2.4, r: 0.4 };
  const fy = RAD.y + RAD.d;
  const fins = [];
  for (let x = RAD.x + 1.6; x < RAD.x + RAD.w - 1; x += 1.6) fins.push(k.segment([x, fy, 44], [x, fy, 70], P));
  slab("box.radiator", RAD, 44, 70, { tone: "hi" }, { bevel: 0.3, steps: 2, extra: Ln(fins.join(""), { tone: "lo" }) });
}

// ================= vertical solar array mast (ridge-site design) =================
vcyl("mast.foot", MAST, 10, 0, 2, { tone: "lo" }, {
  bevel: 0.5,
  extra: Dots(Array.from({ length: 6 }, (_, i) => at([MAST[0] + 8.2 * Math.cos((i / 6) * Math.PI * 2 + 0.5), MAST[1] + 8.2 * Math.sin((i / 6) * Math.PI * 2 + 0.5), 2])), { size: 0.45 }),
});
vcyl("mast.drive", MAST, 6, 2, 16, { tone: "mid" }, { bevel: 0.4, inner: Ln([6, 11].map((z) => k.sideArc(MAST[0], MAST[1], 6, z, P, 32)).join(""), { tone: "faint" }) });
const MJ = { x: MAST[0] + 5.6, y: MAST[1] - 4, w: 6.4, d: 8, r: 0.6 };
slab("mast.junction", MJ, 2, 11, { tone: "mid" }, { extra: Ln(k.planOutline(k.insetPlan(MJ, 1.1), 11, P, 2), { tone: "faint" }) });
const MAST_OUT = [MJ.x + MJ.w, MAST[1], 5.5];
discOn("mast.connector", G.frameOf(MAST_OUT, [1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 1.6, 1.7, { tone: "hi" });
vcyl("mast.tube", MAST, 2.4, 16, PANEL.z0 - 4, { tone: "mid" }, { inner: Ln(k.sideArc(MAST[0], MAST[1], 2.4, 48, P, 16), { tone: "faint" }) });
vcyl("mast.tube.upper", MAST, 2.4, PANEL.z0 - 1.5, MAST_TOP, { tone: "mid" });
vcyl("mast.cap", MAST, 3.4, MAST_TOP, MAST_TOP + 3, { tone: "mid" }, { bevel: 0.3 });
{
  const n = [Math.SQRT1_2, Math.SQRT1_2];
  const t = [Math.SQRT1_2, -Math.SQRT1_2];
  const c = [MAST[0] + n[0] * (2.4 + PANEL.thick / 2), MAST[1] + n[1] * (2.4 + PANEL.thick / 2)];
  const pt = (along, off) => [c[0] + t[0] * along + n[0] * off, c[1] + t[1] * along + n[1] * off];
  const ring = [pt(-PANEL.half, -PANEL.thick / 2), pt(PANEL.half, -PANEL.thick / 2), pt(PANEL.half, PANEL.thick / 2), pt(-PANEL.half, PANEL.thick / 2)];
  const face = (along, z) => {
    const [x, y] = pt(along, PANEL.thick / 2);
    return [x, y, z];
  };
  const grid = [];
  for (const along of [-24, -16, -8, 0, 8, 16, 24]) grid.push(k.segment(face(along, PANEL.z0), face(along, PANEL.z1), P));
  for (let z = PANEL.z0 + 11.5; z < PANEL.z1 - 1; z += 11.5) grid.push(k.segment(face(-PANEL.half, z), face(PANEL.half, z), P));
  prism("mast.panel", ring, PANEL.z0, PANEL.z1, { tone: "hi" }, { bevel: 0.5, extra: Ln(grid.join(""), { tone: "lo" }) });
  // clamp bands holding the panel to the mast, below and above it
  vcyl("mast.clamp", MAST, 3.2, PANEL.z0 - 4, PANEL.z0 - 1.5, { tone: "mid" });
}

// ================= gas train: compressor and spherical oxygen tank =================
const CPLATE = { x: -37, y: 24, w: 30, d: 16, r: 1.5 };
slab("comp.plate", CPLATE, 0, 2.5, { tone: "lo" }, { bevel: 0.4, extra: Dots(k.corners(CPLATE, 1.6).map(([x, y]) => at([x, y, 2.5])), { size: 0.42 }) });
const HEAD = { x: -35, y: 25.5, w: 12, d: 13, r: 1.4 };
{
  const fins = [];
  for (let z = 5; z < 15; z += 1.6) fins.push(k.sideSeam(HEAD, z, P, 3));
  slab("comp.head", HEAD, 2.5, 15.5, { tone: "hi" }, { bevel: 0.5, inner: Ln(fins.join(""), { tone: "faint" }) });
}
slab("comp.coupling", { x: -23, y: 29, w: 2.2, d: 7, r: 0.5 }, 5, 12, { tone: "mid" }, { steps: 2 });
vcyl("comp.motor", [-15.2, 32.5], 5.8, 2.5, 18, { tone: "mid" }, { inner: Ln(k.knurl(-15.2, 32.5, 5.8, 5, 15, 26, P, 0.4), { tone: "lo" }) + Ln(k.sideArc(-15.2, 32.5, 5.8, 5, P, 32) + k.sideArc(-15.2, 32.5, 5.8, 15, P, 32), { tone: "faint" }) });
vcyl("comp.motorcap", [-15.2, 32.5], 4.4, 18, 20, { tone: "mid" }, { bevel: 0.3 });
const COMP_IN = [-29, 31];
vcyl("comp.inlet", COMP_IN, 2.8, 15.5, 18, { tone: "hi" });
const COMP_OUT = [HEAD.x, TC[1], 8];
discOn("comp.outlet", G.frameOf(COMP_OUT, [-1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 2.4, 2.4, { tone: "hi" });

// tank on three legs tangent at its equator; bottom inlet, top relief valve and gauge
for (const deg of [60, 180, 300]) {
  const p = [TC[0] + (TANK_R + 1.6) * Math.cos(deg * DEG), TC[1] + (TANK_R + 1.6) * Math.sin(deg * DEG)];
  vcyl("tank.pad", p, 3.2, 0, 1.6, { tone: "lo" });
  vcyl("tank.leg", p, 1.6, 1.6, TANK_Z + 1, { tone: "mid" }, { inner: Ln(k.sideArc(p[0], p[1], 1.6, 24, P, 12), { tone: "faint" }) });
}
{
  const centre = [TC[0], TC[1], TANK_Z];
  const TF = vF(TC[0], TC[1], TANK_Z);
  const girth = G.arcOf(TF, 0, TANK_R, P);
  const id = R.nameFor("tank.sphere");
  put(centre, S(G.sphereOf(centre, TANK_R, P, { steps: 72 }), { tone: "hi", inner: Ln(girth, { tone: "faint" }) }), { name: id, shapes: [record(A.ball(centre, TANK_R, { name: id }))] });
  PARTS++;
}
const TANK_IN_Z = TANK_Z - Math.sqrt(TANK_R ** 2 - 3 ** 2);
vcyl("tank.inlet", TC, 3, TANK_IN_Z - 4, TANK_IN_Z, { tone: "hi" });
const TANK_TOP_Z = TANK_Z + Math.sqrt(TANK_R ** 2 - 3 ** 2);
vcyl("tank.topboss", TC, 3, TANK_TOP_Z, TANK_TOP_Z + 5, { tone: "hi" });
vcyl("tank.relief", TC, 1.8, TANK_TOP_Z + 5, TANK_TOP_Z + 9, { tone: "mid" }, { extra: Ln(k.ring(TC[0], TC[1], 0.9, TANK_TOP_Z + 9, P, 12), { tone: "lo" }) });
{
  // pressure gauge on a short stem, dial facing the viewer
  const stemFrame = G.frameOf([TC[0], TC[1], TANK_TOP_Z + 3.4], [Math.SQRT1_2, Math.SQRT1_2, 0], [Math.SQRT1_2, -Math.SQRT1_2, 0], [0, 0, 1]);
  discOn("tank.gauge.stem", stemFrame, 3, 6, 0.8, { tone: "mid" });
  const gaugeAt = G.pointOf(stemFrame, 6, 0, 0);
  const GF = G.frameOf(gaugeAt, [Math.SQRT1_2, Math.SQRT1_2, 0], [Math.SQRT1_2, -Math.SQRT1_2, 0], [0, 0, 1]);
  const id = R.nameFor("tank.gauge");
  const face = G.circleOf(GF, 1.6, 2.2, P, 32);
  const needle = k.segment(G.pointOf(GF, 1.65, 0, 0), G.pointOf(GF, 1.65, 1.8, -0.6), P);
  put(gaugeAt, S(G.disc(0, 1.6, 2.9, GF, P), { tone: "hi" }) + Ln(face, { tone: "lo" }) + Ln(needle, { tone: "hi", free: "end" }) + Dots([at(G.pointOf(GF, 1.65, 0, 0))], { size: 0.4, tone: "hi" }), {
    bias: 0.3,
    name: id,
    shapes: [record(A.disc(GF, 0, 1.6, 2.9, { name: id }))],
  });
  PARTS++;
}

// ================= pipes and cables =================
// hot gas: lid outlet up, across to the compressor, down into its inlet; a finned cooler on the drop
pipe(
  [
    [GAS[0], GAS[1], 69],
    [GAS[0], GAS[1], 80],
    [COMP_IN[0], COMP_IN[1], 80],
    [COMP_IN[0], COMP_IN[1], 18],
  ],
  1.8,
  { name: "pipe.hotgas", bands: [0.6, 0.64, 0.68, 0.72, 0.76, 0.8], bandR: 2.3, bandT: 0.7 },
);
// oxygen: compressor outlet along -x under the tank, up into the bottom inlet
pipe(
  [
    [COMP_OUT[0] - 2.4, COMP_OUT[1], COMP_OUT[2]],
    [TC[0], TC[1], COMP_OUT[2]],
    [TC[0], TC[1], TANK_IN_Z - 4],
  ],
  1.25,
  { name: "pipe.oxygen", bands: [0.4] },
);
// harness: mast junction to the control box, lying on the regolith
const GROUND = ["stand.regolith"];
cable(
  [
    [MAST_OUT[0] + 1.6, MAST_OUT[1], MAST_OUT[2]],
    [HARN_IN[0] - 1.6, HARN_IN[1], HARN_IN[2]],
  ],
  { name: "cable.harness", r: 0.9, touch: GROUND },
);
// power: control box to the reactor's junction box, on the regolith
cable(
  [
    [POWER_OUT[0] + 1.6, POWER_OUT[1], POWER_OUT[2]],
    [POWER_OUT[0] + 6, POWER_OUT[1], POWER_OUT[2]],
    [POWER_OUT[0] + 12, POWER_OUT[1], 1.1],
    [JBOX.x + JBOX.w / 2 - 14, POWER_OUT[1], 1.1],
    [JBOX.x + JBOX.w / 2, 62, 1.1],
    [JBOX.x + JBOX.w / 2, JBOX.y + JBOX.d + 13, 1.1],
    [JBOX.x + JBOX.w / 2, JBOX.y + JBOX.d + 6, 4.5],
    [JBOX.x + JBOX.w / 2, JBOX.y + JBOX.d + 1.6, 4.5],
  ],
  { name: "cable.power", r: 1.1, touch: GROUND },
);

// ================= order, assemble, write =================
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
const front = R.items.map((item) => `<g data-k="${item.key.toFixed(2)}">${item.svg}</g>`);

const LABEL =
  "A pilot molten-regolith electrolysis plant on a square of lunar regolith edged as a display plinth: a feed hopper on four legs with a screw auger that drops regolith into the lid of an insulated electrolysis reactor; the reactor lid carries two anode feedthroughs, an anode change port and a hot-gas outlet that runs through a finned cooler to a small compressor and a spherical oxygen tank on three legs; a slag tap and pan, a power and control box with a radiator panel, and a harness from a tall vertical solar array mast. The reactor vessel is lit.";
const CORNER_CSS = `.iso-plate-corner[data-corner="hint"]{text-transform:none;letter-spacing:.04em}`;
const TOKENS = `.iso,.iso[data-theme="dark"]{--anatomy-page:#08090B;--anatomy-card:#0C0E11;--anatomy-paper:#0C0E11;--anatomy-lit:#22CFFF}.iso-plate{--anatomy-paper:#0C0E11}`;

const svgBody = [...back, ...front];
const pageSvg = k.figureSvg({ width: W, height: H, label: LABEL, body: svgBody });
let lone = k.figureSvg({ width: W, height: H, label: LABEL, body: svgBody, standalone: "dark" });
lone = lone.replace("</style>", `${TOKENS}</style>`);

const readout = `${TRUTH.needKgH.toFixed(2)} kg/h needed · ${TRUTH.rigKgH.toFixed(2)} kg/h shown`;
const body =
  `<style>${TOKENS}${CORNER_CSS}</style>` +
  k.plateHtml({
    fig: "Fig 6",
    title: "Lunar oxygen plant",
    hint: `${TRUTH.powerKw[0]}–${TRUTH.powerKw[1]} kW · melt ~${TRUTH.meltC.toLocaleString("en-US")} °C`,
    readout,
    keys: [
      { mark: "lit", label: `Reactor vessel: must run ${TRUTH.hoursPerYear.toLocaleString("en-US")} h a year; the 2024 rig ran ${TRUTH.rigHours} h` },
      { mark: "raised", label: `Anode change port and spare anodes: ~${TRUTH.anodeHours.toLocaleString("en-US")} h each, about ${TRUTH.swaps} swaps a year` },
    ],
    caption: `A tonne of oxygen a year is about ${TRUTH.needKgH.toFixed(2)} kg/h, ${TRUTH.ratio.toFixed(1)}× the ${TRUTH.rigKgH} kg/h a 2024 molten-regolith electrolysis rig showed. It needs only about ${TRUTH.powerKw[0]}–${TRUTH.powerKw[1]} kW continuous, which a ridge-site vertical solar array can supply. The hard parts are hours and hardware: a ~${TRUTH.meltC.toLocaleString("en-US")} °C melt kept running all year, anodes swapped about ${TRUTH.swaps} times, and a funded pilot plant landed. Earliest ${TRUTH.year} in the base case; binding gate: capital.`,
    body: `<div class="iso-stage">${pageSvg}</div>`,
  });

writeFileSync(join(HERE, `${SLUG}.html`), k.pageHtml({ title: "Lunar oxygen plant", theme: "dark", body, width: 720 }));
writeFileSync(join(HERE, `${SLUG}.svg`), lone);
writeFileSync(
  join(HERE, "svg-test.html"),
  `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#0C0E11}img{display:block;width:640px;height:440px}</style></head><body><img src="${SLUG}.svg" width="640" height="440" alt="lunar oxygen plant"></body></html>`,
);
console.log(`wrote ${SLUG}.html, ${SLUG}.svg, svg-test.html · ${PARTS} parts · ${R.items.length} items · ${ROUTES.length} routes · scale ${KS.toFixed(3)}`);

A.auditOrExit(R, P, { crowd: [] });

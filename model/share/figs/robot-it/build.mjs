// Robot integration-and-test cell: a six-axis arm on a floor rail mates a side panel onto a small
// satellite on its test fixture at the open door of a thermal-vacuum chamber.
// Node: robo-24x7-integration-test (graph-v8.json). The arm is the one lit part; the chamber stays unlit.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/alex/.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/Users/alex/.claude/skills/anatomy/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "/Users/alex/.claude/skills/anatomy/kit/tube.mjs";
import * as A from "/Users/alex/.claude/skills/anatomy/kit/audit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SLUG = "robot-it";
const W = 640;
const H = 440;
const AZ = 55;
const DEG = Math.PI / 180;

// ---------- true numbers (graph-v8.json, node robo-24x7-integration-test and robo-aerospace-tolerance-work) ----------
const TRUTH = {
  year: 2033, // earliest year, base case (S2/S3)
  tvac: { cycles: 4, plateauH: 12 }, // GEVS thermal-vacuum minimums, status_oct2026
};

// ---------- world plan ----------
const PLINTH = { x: -198, y: -104, w: 396, d: 144, r: 9 };
const PL_H = 12;
const FOOT_H = 5;
const AX = { y: -25, z: 56 }; // chamber axis (along x)
const CR = 40; // chamber shell radius
const CF = G.frameOf([-176, AX.y, AX.z], [1, 0, 0], [0, 1, 0], [0, 0, 1]); // angle 0 = +y (front), 90 = +z (top)
const MOUTH_S = 129; // flange front face, x = -47
const FL = { s0: 124, s1: 129, r: 46 };
const PIN = [-47, -74]; // door hinge pin centre (tangent to the flange rim)
const DOOR_OPEN = 80; // degrees
const DOOR_R = 46;

// robot joints in the x-z plane (y = -25)
const J2 = [114, 52];
const J3 = [100, 102];
const J5 = [37, 56];
const RY = -25;

const P = k.fitProjection(
  [
    ...k.boxCorners(PLINTH, -PL_H - FOOT_H, 0),
    [111, RY, 119],
    [-126, AX.y, 108],
    [-186, 26, 97],
    [186, -92, 97],
    [2, -68, 102],
  ],
  W,
  H,
  { pad: 30, azimuth: AZ },
);
const V = G.viewOf(P);
const KS = G.scaleOf(P);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const Faded = (list, style) => k.fadedSvg(list, style);
const LIT = { tone: "hi", lit: true };

// ---------- recorder and drawing helpers ----------
const R = A.recorder(P);
const { nameFor } = R;
const record = R.solid;
function put(name, ref, svg, shapes, bias = 0) {
  R.put({ piece: "cell", name, at: ref, bias, svg, shapes });
}
function slab(name, plan, z, h, style = {}, { extra = "", inner = "", steps = 3, bevel = 0.5, bias = 0, owner } = {}) {
  const id = nameFor(name);
  put(id, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], S(k.slabOf(plan, z, h, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, [record(A.slab(plan, z, h, { name: id, owner }, steps))], bias);
  return id;
}
function cyl(name, cx, cy, r, z, h, style = {}, { extra = "", inner = "", steps = 28, bevel = 0, bias = 0, owner } = {}) {
  const id = nameFor(name);
  put(id, [cx, cy, z + h / 2], S(k.cylinder(cx, cy, r, z, h, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, [record(A.cylinder(cx, cy, r, z, h, { name: id, owner }))], bias);
  return id;
}
function disc(name, F, s0, s1, r, style = {}, { extra = "", inner = "", bevel = 0, bias = 0, owner, seated, cut } = {}) {
  const id = nameFor(name);
  put(id, G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), S(G.disc(s0, s1, r, F, P, { bevel }), { tone: "mid", ...style, inner }) + extra, [record(A.disc(F, s0, s1, r, { name: id, owner, seated, cut }))], bias);
  return id;
}
function turned(name, F, profile, style = {}, { extra = "", inner = "", bias = 0, owner, smooth, radius } = {}) {
  const id = nameFor(name);
  const paths = G.solidOf(profile, F, P, smooth ? { smooth } : {});
  const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
  const shape = record(A.solid(F, profile, { name: id, owner, radius }));
  put(id, G.add3(F.o, G.mul3(F.a, mid)), S(paths, { tone: "mid", ...style, inner }) + extra, [shape], bias);
  return shape;
}
// a prism whose outline lies in the x-z plane, extruded along y from y0 to y1
function prismXZ(name, poly, y0, y1, style = {}, { extra = "", inner = "", bias = 0, owner } = {}) {
  const id = nameFor(name);
  const F = G.frameOf([0, y0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const hull = G.hullOf(poly);
  const cx = hull.reduce((sum, [x]) => sum + x, 0) / hull.length;
  const cz = hull.reduce((sum, [, z]) => sum + z, 0) / hull.length;
  put(id, [cx, (y0 + y1) / 2, cz], S(G.prismOf(F, hull, 0, y1 - y0, P), { tone: "mid", ...style, inner }) + extra, [record(A.prism(F, hull, 0, y1 - y0, { name: id, owner }))], bias);
  return hull;
}
function prismIn(name, F, poly, s0, s1, style = {}, { extra = "", bias = 0, owner } = {}) {
  const id = nameFor(name);
  const cx = poly.reduce((sum, [x]) => sum + x, 0) / poly.length;
  const cy = poly.reduce((sum, [, y]) => sum + y, 0) / poly.length;
  const centre = G.add3(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), G.add3(G.mul3(F.u, cx), G.mul3(F.v, cy)));
  put(id, centre, S(G.prismOf(F, poly, s0, s1, P), { tone: "mid", ...style }) + extra, [record(A.prism(F, poly, s0, s1, { name: id, owner }))], bias);
}
function ballAt(name, centre, r, style = {}, { owner } = {}) {
  const id = nameFor(name);
  put(id, centre, S(G.sphereOf(centre, r, P, { steps: G.stepsFor(r, 32) }), { tone: "mid", ...style }), [record(A.ball(centre, r, { name: id, owner }))]);
}
// a flat flange seated on a curved host through a saddle pad (Raptor padOn)
function padOn(name, host, point, outward, a, h, style = {}, { owner } = {}) {
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
  const id = nameFor(name);
  put(id, G.add3(point, G.mul3(axis, h / 2)), S(G.saddleOf(F, a, start, h, P), { tone: "mid", ...style }), [record(A.disc(F, low - 0.05, h, a, { name: id, owner, seated: true, cut: hosts }))], 0.1);
  return G.add3(point, G.mul3(axis, h));
}
const circle = ([cx, cz], r, steps = 40) => Array.from({ length: steps }, (_, index) => [cx + r * Math.cos((index / steps) * 2 * Math.PI), cz + r * Math.sin((index / steps) * 2 * Math.PI)]);
const faceLoop = (points) => k.pathOf(points.map(at), true);

// ---------- the plinth (static back layer, recorded as ground) ----------
const back = [];
back.push(`<path class="iso-halo" d="${k.haloOf(PLINTH, -PL_H - FOOT_H, PL_H, P)}"/>`);
const FEET = [...k.corners(PLINTH, 26), [0, PLINTH.y + 26], [0, PLINTH.y + PLINTH.d - 26]].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
for (const [x, y] of FEET) {
  back.push(S(k.cylinder(x, y, 8, -PL_H - FOOT_H, 1.8, P, 28), { tone: "lo" }));
  back.push(S(k.cylinder(x, y, 6.2, -PL_H - FOOT_H + 1.8, FOOT_H - 1.8, P, 28), { tone: "mid" }));
  record(A.cylinder(x, y, 8, -PL_H - FOOT_H, FOOT_H, { name: nameFor("stand.foot") }));
}
back.push(S(k.slabOf(PLINTH, -PL_H, PL_H, P, 8, 1.6), { tone: "mid", inner: Ln(k.sideSeam(PLINTH, -PL_H + 3, P, 8), { tone: "faint" }) }));
record(A.slab(PLINTH, -PL_H, PL_H, { name: "stand.plinth" }, 8));
back.push(Ln(k.planOutline(k.insetPlan(PLINTH, 6), 0, P), { tone: "lo" }));
const PL_SCREWS = k.corners(PLINTH, 12);
back.push(Ln(PL_SCREWS.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 18)).join(""), { tone: "lo" }));
back.push(Dots(PL_SCREWS.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
// engraved year on the front face
if (process.env.ENGRAVE) back.push(k.faceTextSvg(k.sideMatrix([150, PLINTH.y + PLINTH.d], -PL_H + 3 + 1.6, P, "left"), String(TRUTH.year), { size: 5.2, tone: "lo" }));

// ================= the thermal-vacuum chamber =================
const DOME = 14;
const shellR = (s) => (s >= DOME ? CR : CR * Math.sqrt(Math.max(0, 1 - ((DOME - s) / DOME) ** 2)));
const shellSlope = (s) => {
  if (s >= DOME) return 0;
  const t = Math.min(0.999, (DOME - s) / DOME);
  return (CR * (t / DOME)) / Math.sqrt(1 - t * t);
};
const SHELL_PROFILE = [
  ...Array.from({ length: 14 }, (_, index) => {
    const phi = ((index + 1) / 15) * (Math.PI / 2);
    return [DOME * (1 - Math.cos(phi)), CR * Math.sin(phi), 1];
  }),
  [DOME, CR, 1],
  [FL.s0, CR],
];
const SEAMS = [40, 78, 108];
const shellInner = Ln(SEAMS.map((s) => G.arcOf(CF, s, CR, P)).join(""), { tone: "faint" });
const SHELL = turned("chamber.shell", CF, SHELL_PROFILE, { tone: "mid" }, { inner: shellInner, smooth: { slope: shellSlope }, radius: shellR });

// mouth flange, the dark inside of the vessel seen through the open door
const mouthRing = G.circleOf(CF, MOUTH_S, CR, P);
const deep = G.circleOf(CF, MOUTH_S - 46, CR, P);
const shroudRings = [118, 107, 96].map((s) => G.circleOf(CF, s, CR - 1.5, P)).join("");
const innerRail = (dy) => {
  const z = AX.z - Math.sqrt((CR - 1.5) ** 2 - dy ** 2);
  return k.pathOf([[CF.o[0] + 60, AX.y + dy - 1.2, z], [CF.o[0] + MOUTH_S, AX.y + dy - 1.2, z], [CF.o[0] + MOUTH_S, AX.y + dy + 1.2, z], [CF.o[0] + 60, AX.y + dy + 1.2, z]].map(at), true);
};
const rails = innerRail(-15) + innerRail(15);
const inside = `<clipPath id="rit-mouth"><path d="${mouthRing}"/></clipPath><g clip-path="url(#rit-mouth)"><path class="rit-wall" d="${mouthRing}"/>${Ln(shroudRings, { tone: "faint" })}<path class="rit-void" d="${deep}"/>${Ln(deep, { tone: "faint" })}<path class="rit-rail" d="${rails}"/>${Ln(rails, { tone: "lo" })}</g>${Ln(mouthRing, { tone: "lo" })}`;
{
  const id = nameFor("chamber.flange");
  const F = CF;
  const bolts = Dots(G.dotsOf(F, FL.s1, 43, 24, P, { all: true }), { size: 0.42, tone: "mid" });
  const groove = Ln(G.circleOf(F, FL.s1, 41.6, P), { tone: "faint" });
  put(id, G.pointOf(F, (FL.s0 + FL.s1) / 2, 0, 0), S(G.ringBand(FL.s0, FL.s1, CR, FL.r, F, P), { tone: "mid" }) + inside + groove + bolts, [record(A.ring(F, FL.s0, FL.s1, CR, FL.r, { name: id }))]);
}

// swing-bolt door clamps on the flange rim
for (const phi of [0, 52, 104, -52, -104]) {
  const rd = [0, Math.cos(phi * DEG), Math.sin(phi * DEG)];
  const tg = [0, -Math.sin(phi * DEG), Math.cos(phi * DEG)];
  const o = G.pointOf(CF, (FL.s0 + FL.s1) / 2, 0, 0);
  const KF = G.frameOf(o, rd, [1, 0, 0], tg);
  const poly = [[-2.5, -2.4], [2.5, -2.4], [2.5, 2.4], [-2.5, 2.4]];
  prismIn("chamber.clamp", KF, poly, FL.r, FL.r + 4.5, { tone: "mid" });
  const KF2 = G.frameAlong(G.add3(o, G.mul3(rd, 0)), rd);
  disc("chamber.clamp-eye", KF2, FL.r + 4.5, FL.r + 7.5, 1.5, { tone: "hi" });
}

// saddle supports
for (const s of [32, 106]) {
  const x = CF.o[0] + s;
  slab("chamber.saddle-plate", { x: x - 9, y: AX.y - 31, w: 18, d: 62, r: 1.5 }, 0, 3, { tone: "lo" }, { extra: Dots([at([x - 5.5, AX.y - 27, 3]), at([x + 5.5, AX.y + 27, 3]), at([x + 5.5, AX.y - 27, 3]), at([x - 5.5, AX.y + 27, 3])], { size: 0.45 }) });
  const SF = G.frameOf([x, AX.y, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  prismIn("chamber.saddle", SF, [[-28, 3], [28, 3], [9, AX.z - CR], [-9, AX.z - CR]], -4, 4, { tone: "mid" });
}

// feedthrough flanges on the top of the shell
const FEED = [26, 50, 74];
FEED.forEach((s, index) => {
  const x = CF.o[0] + s;
  const face = padOn("chamber.feed-pad", SHELL, [x, AX.y, AX.z + CR], [0, 0, 1], 7.6, 3);
  const z0 = face[2];
  const FF = G.frameOf([x, AX.y, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  cyl("chamber.feed-flange", x, AX.y, 7.2, z0, 2.4, { tone: "mid" }, { extra: Dots(G.dotsOf(FF, z0 + 2.4, 5.8, 6, P, { all: true }), { size: 0.4, tone: "mid" }) });
  if (index < 2) {
    cyl("chamber.feed-plug", x, AX.y, 3.2, z0 + 2.4, 5.6, { tone: "hi" }, { extra: Ln(k.knurl(x, AX.y, 3.2, z0 + 3.4, z0 + 7.4, 16, P), { tone: "lo" }) + Ln(k.ring(x, AX.y, 1.6, z0 + 8, P, 16), { tone: "lo" }) });
  } else {
    cyl("chamber.feed-tc", x, AX.y, 2.4, z0 + 2.4, 3, { tone: "hi" }, { extra: Dots([-1, 0, 1].map((t) => at([x + t * 1.1, AX.y, z0 + 5.4])), { size: 0.35, tone: "hi" }) });
  }
});

// viewport on the front of the shell
{
  const s = 48;
  const x = CF.o[0] + s;
  const face = padOn("chamber.view-pad", SHELL, [x, AX.y + CR, AX.z], [0, 1, 0], 11, 3);
  const VF = G.frameAlong(face, [0, 1, 0]);
  const glass = G.circleOf(VF, 3.4, 6.8, P);
  const chord = (a0, a1) => k.pathOf([G.pointOf(VF, 3.4, 6.8, a0 * DEG), G.pointOf(VF, 3.4, 6.8, a1 * DEG)].map(at));
  const ring = Ln(G.circleOf(VF, 3.4, 8.2, P), { tone: "lo" });
  disc("chamber.viewport", VF, 0, 3.4, 10.6, { tone: "mid" }, {
    extra: ring + `<path class="rit-glass" d="${glass}"/>` + Ln(glass, { tone: "mid" }) + Ln(chord(110, 200) + chord(125, 185), { tone: "lo" }) + Dots(G.dotsOf(VF, 3.4, 9.4, 8, P, { all: true, phase: Math.PI / 8 }), { size: 0.42, tone: "mid" }),
  });
}

// the hinge pin and the open door
const HINGE = nameFor("chamber.hinge-pin");
put(HINGE, [PIN[0], PIN[1], 56], S(k.cylinder(PIN[0], PIN[1], 3, 32, 48, P, 24), { tone: "mid", inner: Ln([46, 66].map((z) => k.sideArc(PIN[0], PIN[1], 3, z, P, 16)).join(""), { tone: "faint" }) }), [record(A.cylinder(PIN[0], PIN[1], 3, 32, 48, { name: HINGE }))]);
cyl("chamber.hinge-cap", PIN[0], PIN[1], 3.8, 80, 2, { tone: "mid" });
cyl("chamber.hinge-foot", PIN[0], PIN[1], 3.8, 30, 2, { tone: "mid" });
const rot = (x, y, deg) => [x * Math.cos(deg * DEG) + y * Math.sin(deg * DEG), -x * Math.sin(deg * DEG) + y * Math.cos(deg * DEG)];
const dc = rot(2.5, 49, DOOR_OPEN);
const DOOR_C = [PIN[0] + dc[0], PIN[1] + dc[1], AX.z];
const DA = [...rot(1, 0, DOOR_OPEN), 0];
const DU = [...rot(0, 1, DOOR_OPEN), 0];
const DF = G.frameOf(DOOR_C, DA, DU, [0, 0, 1]);
{
  const inner = -2.5;
  const extra = Ln(G.circleOf(DF, inner, 42.4, P), { tone: "lo" }) + Ln(G.circleOf(DF, inner, 41.2, P), { tone: "faint" });
  disc("chamber.door", DF, -2.5, 2.5, DOOR_R, { tone: "mid" }, { extra, bevel: 0.6 });
  disc("chamber.door-shroud", DF, -4.2, -2.5, 33, { tone: "mid" }, { extra: Ln(G.circleOf(DF, -4.2, 28, P) + G.circleOf(DF, -4.2, 18, P), { tone: "faint" }) + Dots(G.dotsOf(DF, -4.2, 30.6, 12, P, { all: true }), { size: 0.4, tone: "mid" }) });
  // strap hinges lying on the inner face, from the pin to the door
  const HF = G.frameOf([PIN[0], PIN[1], AX.z], G.mul3(DA, -1), DU, [0, 0, 1]);
  for (const v of [-15, 15]) prismIn("chamber.strap", HF, [[3, v - 2.6], [18, v - 2.6], [18, v + 2.6], [3, v + 2.6]], 0, 1.8, { tone: "mid" }, { extra: Dots([G.add3(G.add3(HF.o, G.mul3(HF.u, 13.5)), G.add3(G.mul3(HF.v, v), G.mul3(HF.a, 1.8)))].map(at), { size: 0.45 }) });
}

// ================= the vacuum pump and its line =================
const BALL_R = 7.8;
const PORT_Y = AX.y + CR + 4 + Math.sqrt(BALL_R ** 2 - 5.6 ** 2);
const PUMP = { x: -110, y: PORT_Y - 10, w: 28, d: 20, r: 2 };
const PUMP_X = -95;
const PUMP_Y = PUMP.y + PUMP.d / 2;
slab("pump.foot", { x: -108, y: PUMP.y + 1, w: 24, d: 3, r: 0.6 }, 0, 3, { tone: "lo" });
slab("pump.foot", { x: -108, y: PUMP.y + PUMP.d - 4, w: 24, d: 3, r: 0.6 }, 0, 3, { tone: "lo" });
slab("pump.body", PUMP, 3, 15, { tone: "mid" }, { inner: Ln(k.sideSeam(PUMP, 10, P, 3), { tone: "faint" }), extra: Ln(k.planOutline(k.insetPlan({ x: -108, y: PUMP.y + 2, w: 9, d: 16, r: 1 }, 0), 18, P, 2), { tone: "faint" }) });
{
  const MF = G.frameOf([PUMP.x + PUMP.w, PUMP_Y, 10.5], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  turned("pump.motor", MF, [[0, 6.4], [18, 6.4]], { tone: "mid" }, { extra: Faded(G.ribsOf(MF, 1.5, 16.5, 6.4, 18, P, { fade: [0.1, 0.55] }), { tone: "lo" }) + Ln(G.arcOf(MF, 1.5, 6.4, P) + G.arcOf(MF, 16.5, 6.4, P), { tone: "lo" }) });
  turned("pump.fan-cover", MF, [[18, 7], [22, 7]], { tone: "mid" }, { extra: Ln(G.circleOf(MF, 22, 4.6, P) + G.circleOf(MF, 22, 2.2, P), { tone: "faint" }) });
}
cyl("pump.inlet", PUMP_X, PUMP_Y, 6, 18, 3, { tone: "mid" });

// chamber port, elbow ball, vertical line with a gate valve, flange on the pump inlet
const PORT_S = 81;
const portFace = padOn("chamber.pump-port", SHELL, [CF.o[0] + PORT_S, AX.y + CR, AX.z], [0, 1, 0], 5.6, 4, {}, { owner: "pump.port" });
const LINE_R = 3.5;
const ballC = G.add3(portFace, [0, Math.sqrt(BALL_R ** 2 - 5.6 ** 2), 0]);
ballAt("pump.elbow", ballC, BALL_R, { tone: "mid" }, { owner: "pump.port" });
const lineTop = G.add3(ballC, [0, 0, -Math.sqrt(BALL_R ** 2 - LINE_R ** 2)]);
const lineBottom = [ballC[0], ballC[1], 21];
const LINE = [lineTop, lineBottom];
const LINE_ID = "pump.line";
{
  const total = G.pathLength(LINE);
  const thick = 2.2;
  const flangeR = LINE_R * 1.55;
  const valveAt = 13;
  const valveHalf = LINE_R * 2.4;
  const gaps = [[valveAt - valveHalf, valveAt + valveHalf], [total - thick, total]];
  R.route(LINE_ID, LINE, LINE_R, { owner: LINE_ID, gaps, rims: [LINE_R, flangeR], piece: "cell" });
  tubePieces(LINE, LINE_R, P, { maxLength: 10, spacing: 0.8, gaps }).forEach((part, index) => R.put({ piece: "cell", name: `${LINE_ID}:${index}`, at: part.mid, svg: tubeSvg(part, { tone: "mid" }), route: LINE_ID, chunk: index, shapes: [A.tube(part.points, part.radii)] }));
  // flange on the pump inlet
  const FFl = G.frameAlong(G.add3(lineBottom, [0, 0, thick / 2]), [0, 0, 1]);
  disc("pump.line-flange", FFl, -thick / 2, thick / 2, flangeR, { tone: "mid" }, { owner: LINE_ID, extra: Dots(G.dotsOf(FFl, thick / 2, flangeR * 0.78, 6, P, { all: true }), { size: 0.38 }) });
  // gate valve body (bulged lathe), neck and a round actuator can standing out sideways (+x)
  const centre = G.pointAlong(LINE, valveAt);
  const VF = G.frameAlong(centre, [0, 0, -1]);
  const r = LINE_R;
  const crown = r * 1.85 * 1.08;
  const bulge = (x) => r * 1.45 + (crown - r * 1.45) * Math.sqrt(Math.max(0, 1 - (x / (r * 1.6)) ** 2));
  const bulgeSlope = (x) => {
    if (Math.abs(x) >= r * 1.6 - 1e-9) return 0;
    const t = Math.max(-0.995, Math.min(0.995, x / (r * 1.6)));
    return (-(crown - r * 1.45) * t) / (r * 1.6 * Math.sqrt(1 - t * t));
  };
  const meridian = [[-valveHalf, 0], [-valveHalf, r * 1.45], ...Array.from({ length: 17 }, (_, index) => { const x = r * 1.6 * Math.sin(((index - 8) / 8) * (Math.PI / 2)); return [x, bulge(x), index && index < 16 ? 1 : 0]; }), [valveHalf, r * 1.45], [valveHalf, 0]];
  const vid = nameFor("pump.valve");
  put(vid, centre, S(G.lathe(meridian, VF, P, { steps: 36, smooth: { slope: bulgeSlope, rows: 3 } }), { tone: "mid" }) + Dots(G.dotsOf(VF, -valveHalf, r * 1.2, 6, P, { all: true }), { size: 0.38 }), [record(A.body(VF, meridian, { name: vid, owner: LINE_ID }))]);
  const NF = G.frameAlong(centre, [1, 0, 0]);
  const s0 = crown - 0.25;
  const s1 = crown + r * 0.9;
  disc("pump.valve-neck", NF, s0, s1, r * 0.55, { tone: "mid" }, { owner: LINE_ID, bias: 0.2 });
  const can = [[s1, 0], [s1, r * 1.5], [s1 + r * 2.2, r * 1.5], [s1 + r * 2.2, 0]];
  const aid = nameFor("pump.valve-actuator");
  put(aid, G.add3(centre, [s1 + r * 1.1, 0, 0]), S(G.lathe(can, NF, P, { steps: 32, bevel: 0.5 }), { tone: "mid" }) + Ln(G.circleOf(NF, s1 + r * 2.2, r * 1.0, P, 24), { tone: "faint" }) + Dots(G.dotsOf(NF, s1 + r * 2.2, r * 1.2, 4, P, { all: true, phase: Math.PI / 4 }), { size: 0.38 }), [record(A.body(NF, can, { name: aid, owner: LINE_ID }))], 0.3);
}

// ================= the satellite on its test fixture =================
const FIX = { x: -40, y: -53, w: 56, d: 56, r: 2.5 };
slab("fixture.base", { ...FIX, r: 2 }, 0, 4, { tone: "lo" }, { extra: Dots(k.corners(FIX, 4).map(([x, y]) => at([x, y, 4])), { size: 0.45 }) });
for (const [x, y] of k.corners(FIX, 4.5)) slab("fixture.leg", { x: x - 2.5, y: y - 2.5, w: 5, d: 5, r: 0.8 }, 4, 24, { tone: "mid" });
slab("fixture.brace", { x: -33, y: -3.5, w: 42.5, d: 4, r: 0.5 }, 9, 3.5, { tone: "mid" }, { extra: Dots([at([-30, 0.5, 10.75]), at([6.5, 0.5, 10.75])], { size: 0.4 }) });
slab("fixture.brace", { x: 9.5, y: -46, w: 4, d: 42.5, r: 0.5 }, 9, 3.5, { tone: "mid" }, { extra: Dots([at([13.5, -43, 10.75]), at([13.5, -6.5, 10.75])], { size: 0.4 }) });
for (const x of [-26, -16]) disc("fixture.port", G.frameAlong([x, FIX.y + FIX.d, 30.5], [0, 1, 0]), 0, 2.4, 1.5, { tone: "hi" }, { extra: Ln(G.circleOf(G.frameAlong([x, FIX.y + FIX.d, 30.5], [0, 1, 0]), 2.4, 0.7, P, 12), { tone: "lo" }) });
slab("fixture.platen", FIX, 28, 5, { tone: "mid" }, { bevel: 0.8, extra: Ln(k.planOutline(k.insetPlan(FIX, 4), 33, P, 3), { tone: "faint" }) + Dots(k.corners(FIX, 7).map(([x, y]) => at([x, y, 33])), { size: 0.45 }) });
const SAT_C = [-7, -25];
cyl("sat.adapter", SAT_C[0], SAT_C[1], 14, 33, 3, { tone: "mid" }, { extra: Dots(Array.from({ length: 12 }, (_, i) => at([SAT_C[0] + 12.6 * Math.cos((i / 12) * 2 * Math.PI), SAT_C[1] + 12.6 * Math.sin((i / 12) * 2 * Math.PI), 36])), { size: 0.38 }) });
cyl("sat.sep-ring", SAT_C[0], SAT_C[1], 11.5, 36, 3, { tone: "hi" }, { inner: Ln(k.sideArc(SAT_C[0], SAT_C[1], 11.5, 37.5, P, 24), { tone: "lo" }) });
const SAT = { x: -22, y: -40, w: 30, d: 30, r: 0.8 };
const SAT_Z = [39, 73];
slab("sat.bus", SAT, SAT_Z[0], SAT_Z[1] - SAT_Z[0], { tone: "hi", crease: "lo" }, { inner: Ln(k.sideSeam(SAT, 70.5, P, 3), { tone: "lo" }), bevel: 0.5 });
{
  // body-mounted solar array on the +y face, cells run edge to edge
  const y = SAT.y + SAT.d + 0.6;
  const x0 = -20;
  const x1 = 6;
  const z0 = 42;
  const z1 = 70;
  const grid = [];
  for (let i = 1; i < 5; i++) grid.push(k.segment([x0 + ((x1 - x0) * i) / 5, y, z0], [x0 + ((x1 - x0) * i) / 5, y, z1], P));
  for (let j = 1; j < 4; j++) grid.push(k.segment([x0, y, z0 + ((z1 - z0) * j) / 4], [x1, y, z0 + ((z1 - z0) * j) / 4], P));
  const id = nameFor("sat.array");
  put(id, [(x0 + x1) / 2, y - 0.3, (z0 + z1) / 2], S(k.slabOf({ x: x0, y: SAT.y + SAT.d, w: x1 - x0, d: 0.6, r: 0 }, z0, z1 - z0, P, 1), { tone: "lo", crease: "none" }) + Ln(grid.join(""), { tone: "faint" }), [record(A.box([x0, SAT.y + SAT.d, z0], [x1, y, z1], { name: id }))]);
}
slab("sat.patch", { x: -19, y: -37, w: 10, d: 10, r: 0.6 }, SAT_Z[1], 1.2, { tone: "mid" }, { extra: Ln(k.planOutline({ x: -16.5, y: -34.5, w: 5, d: 5, r: 0.3 }, SAT_Z[1] + 1.2, P, 2), { tone: "lo" }) });
cyl("sat.tracker", -1, -16, 3, SAT_Z[1], 5, { tone: "mid" });
cyl("sat.baffle", -1, -16, 3.9, SAT_Z[1] + 5, 3.4, { tone: "hi" }, { extra: `<path class="rit-void" d="${k.ring(-1, -16, 2.4, SAT_Z[1] + 8.4, P, 24)}"/>` + Ln(k.ring(-1, -16, 2.4, SAT_Z[1] + 8.4, P, 24), { tone: "lo" }) });
cyl("sat.gps", -15, -16, 2.2, SAT_Z[1], 1.4, { tone: "mid" });
// guide pins from the bus face into the panel
for (const [y, z] of [[-35.5, 45], [-14.5, 67]]) disc("sat.pin", G.frameAlong([8, y, z], [1, 0, 0]), 0, 3, 0.9, { tone: "hi" });
// the side panel the robot is mating, held 3 units off the bus on the guide pins
{
  const id = nameFor("sat.panel");
  const plan = { x: 11, y: -38, w: 2, d: 26, r: 0 };
  const loop = faceLoop([[13, -35.5, 44.5], [13, -14.5, 44.5], [13, -14.5, 67.5], [13, -35.5, 67.5]]);
  put(id, [12, -25, 56], S(k.slabOf(plan, 42, 28, P, 1, 0.4), { tone: "hi", crease: "lo" }) + Ln(loop, { tone: "faint" }), [record(A.box([11, -38, 42], [13, -12, 70], { name: id }))]);
}

// ================= the robot: rail, carriage and six-axis arm =================
slab("rail.bed", { x: 28, y: -47, w: 154, d: 44, r: 2 }, 0, 4, { tone: "lo" }, { bevel: 0.6 });
for (const y of [-41, -14]) slab("rail.rail", { x: 33, y, w: 144, d: 5, r: 0.8 }, 4, 4.5, { tone: "mid" }, { extra: Dots([40, 70, 100, 130, 160].map((x) => at([x, y + 2.5, 8.5])), { size: 0.38 }) });
{
  const rack = { x: 34, y: -27.5, w: 142, d: 5, r: 0.4 };
  const teeth = k.topTicks(rack.x + 1, rack.x + rack.w - 1, 2, 1000, rack.y, 1.5, [5, 5], P);
  const id = slab("rail.rack", rack, 4, 1.5, { tone: "mid", crease: "none" }, { extra: Ln(teeth.minor + teeth.major, { tone: "lo" }), bevel: 0 });
  const strip = { x: 34, y: -8.6, w: 142, d: 4.2, r: 0.4 };
  const ticks = k.topTicks(strip.x + 2, strip.x + strip.w - 2, 4, 5, strip.y, 0.6, [1.6, 3], P);
  slab("rail.scale", strip, 4, 0.6, { tone: "lo", crease: "none" }, { extra: Ln(ticks.minor, { tone: "lo" }) + Ln(ticks.major, { tone: "mid" }), bevel: 0 });
}
for (const x of [28, 178]) {
  slab("rail.stop", { x, y: -45, w: 4, d: 40, r: 0.8 }, 4, 9, { tone: "mid" }, { extra: Dots([at([x + 2, -40, 13]), at([x + 2, -8, 13])], { size: 0.42 }) });
  slab("rail.bumper", { x: x === 28 ? 32 : 176, y: -30, w: 2, d: 10, r: 0.6 }, 6, 5, { tone: "lo" });
}
const CAR = { x: 88, y: -47, w: 44, d: 44, r: 3 };
for (const x of [91, 117]) for (const y of [-42.5, -15.5]) slab("robot.bearing", { x, y, w: 12, d: 7, r: 0.8 }, 8.5, 4.5, { tone: "mid" });
slab("robot.carriage", CAR, 13, 6, { tone: "mid" }, { bevel: 0.6, extra: Dots(k.corners(CAR, 4).map(([x, y]) => at([x, y, 19])), { size: 0.45 }) + Ln(k.corners(CAR, 4).map(([x, y]) => k.ring(x, y, 1.6, 19, P, 14)).join(""), { tone: "lo" }) });
cyl("robot.track-motor", 125, -9, 4, 19, 10, { tone: "mid" }, { extra: Faded(G.ribsOf(G.frameOf([125, -9, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), 20.5, 27.5, 4, 14, P, { fade: [0.1, 0.55], seams: true }), { tone: "lo" }) });
cyl("robot.track-motor-cap", 125, -9, 3.2, 29, 1.6, { tone: "mid" });

const BASE = [110, RY];
cyl("robot.base", BASE[0], BASE[1], 17, 19, 13, LIT, { bevel: 0.7, steps: 48, inner: Ln(k.sideArc(BASE[0], BASE[1], 17, 22, P, 32), { tone: "lo" }), extra: Dots(Array.from({ length: 16 }, (_, i) => at([BASE[0] + 15.6 * Math.cos((i / 16) * 2 * Math.PI), BASE[1] + 15.6 * Math.sin((i / 16) * 2 * Math.PI), 32])), { size: 0.4, tone: "hi" }) });
cyl("robot.j1-ring", BASE[0], BASE[1], 14, 32, 3, LIT, { steps: 40 });
// turret
const TURRET = prismXZ("robot.turret", [[98, 35], [122, 35], ...circle(J2, 13)], -37, -13, LIT);
// lower arm, on the +y side of the turret
const LOWER = G.hullOf([...circle(J2, 11), ...circle(J3, 9.5)]);
{
  const insetLoop = G.hullOf([...circle(J2, 7.5), ...circle(J3, 6)]);
  prismXZ("robot.lower-arm", LOWER, -13, -1, LIT, { extra: Ln(k.pathOf(insetLoop.map(([x, z]) => at([x, -1, z])), true), { tone: "lo" }) });
}
const capAt = (name, [x, z], r, y0, bolts) => {
  const F = G.frameOf([x, y0, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  disc(name, F, 0, 2.4, r, LIT, { extra: Dots(G.dotsOf(F, 2.4, r - 1.6, bolts, P, { all: true }), { size: 0.4, tone: "hi" }) + Ln(G.circleOf(F, 2.4, r * 0.35, P, 16), { tone: "lo" }) });
};
capAt("robot.j2-cap", J2, 8, -1, 8);
capAt("robot.j3-cap", J3, 6.6, -1, 6);
// elbow casting with its counterweight end, then the round forearm (J4 roll) to the wrist
const D3 = G.unit3([J5[0] - J3[0], 0, J5[1] - J3[1]]);
const d2 = [D3[0], D3[2]];
const n2 = [-d2[1], d2[0]];
const F0 = [J3[0] + 16 * d2[0], J3[1] + 16 * d2[1]];
const W0 = [J5[0] - 12 * d2[0], J5[1] - 12 * d2[1]];
const off = ([x, z], [dx, dz], t) => [x + dx * t, z + dz * t];
prismXZ("robot.elbow", [...circle(J3, 12), ...circle(off(J3, d2, -14), 8.5), off(F0, n2, 7.6), off(F0, n2, -7.6)], -37, -13, LIT);
{
  const FF = G.frameAlong([F0[0], RY, F0[1]], D3);
  const L = Math.hypot(W0[0] - F0[0], W0[1] - F0[1]);
  turned("robot.forearm", FF, [[0, 6.5], [L, 6.5]], LIT, { inner: Ln(G.arcOf(FF, L * 0.3, 6.5, P) + G.arcOf(FF, L * 0.33, 6.5, P), { tone: "lo" }) });
}
{
  const [mx, mz] = off(J3, d2, -17.5);
  const F = G.frameOf([mx, -13, mz], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  disc("robot.j3-motor", F, 0, 2.6, 5, LIT, { extra: Dots(G.dotsOf(F, 2.6, 3.7, 4, P, { all: true, phase: Math.PI / 4 }), { size: 0.38, tone: "hi" }) + Ln(G.circleOf(F, 2.6, 1.8, P, 16), { tone: "lo" }) });
}
prismXZ("robot.wrist", [...circle(J5, 8.5), [28.5, 48.5], [28.5, 63.5], off(W0, n2, 7.6), off(W0, n2, -7.6)], -34, -16, LIT);
capAt("robot.j5-cap", J5, 6, -16, 6);
{
  const TF = G.frameOf([28.5, RY, J5[1]], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
  disc("robot.j6-flange", TF, 0, 3, 6.5, LIT);
  disc("robot.changer", TF, 3, 7.5, 7.6, LIT, { inner: Ln(G.arcOf(TF, 5.2, 7.6, P), { tone: "lo" }) });
}
slab("robot.gripper", { x: 18, y: -36, w: 3, d: 22, r: 0.6 }, 45, 22, LIT, { extra: Ln(faceLoop([[21, -33, 48], [21, -17, 48], [21, -17, 64], [21, -33, 64]]), { tone: "lo" }) });
for (const [y, z] of [[-31, 50], [-19, 50], [-31, 62], [-19, 62]]) {
  const UF = G.frameOf([18, y, z], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
  disc("robot.cup-stem", UF, 0, 2.5, 1.3, LIT);
  turned("robot.cup", UF, [[2.5, 1.4], [5, 3]], LIT);
}

// ================= tool rack with spare end effectors =================
slab("rack.base", { x: 122, y: -96, w: 56, d: 28, r: 2 }, 0, 3, { tone: "lo" }, { extra: Dots(k.corners({ x: 122, y: -96, w: 56, d: 28 }, 3).map(([x, y]) => at([x, y, 3])), { size: 0.45 }) });
slab("rack.back", { x: 126, y: -96, w: 50, d: 4, r: 0.6 }, 3, 43, { tone: "mid" }, { extra: Dots([132, 151, 170].map((x) => at([x, -94, 46])), { size: 0.42 }), inner: Ln(k.sideSeam({ x: 126, y: -96, w: 50, d: 4, r: 0.6 }, 36, P, 3), { tone: "faint" }) });
for (const x of [128, 171.5]) slab("rack.gusset", { x, y: -92, w: 2.5, d: 14, r: 0.3 }, 3, 21, { tone: "mid" });
slab("rack.shelf", { x: 128, y: -92, w: 46, d: 20, r: 0.6 }, 24, 4, { tone: "mid" }, { extra: Ln([140, 151.5, 163].map((x) => k.ring(x, -82, 6, 28, P, 24)).join(""), { tone: "faint" }) + Dots([at([130.5, -74.5, 28]), at([171.5, -74.5, 28])], { size: 0.42 }) });
// tool 1: two-finger gripper
slab("rack.finger", { x: 134, y: -85, w: 2, d: 6, r: 0.3 }, 28, 6, { tone: "mid" });
slab("rack.finger", { x: 144, y: -85, w: 2, d: 6, r: 0.3 }, 28, 6, { tone: "mid" });
slab("rack.gripper", { x: 133, y: -87, w: 14, d: 10, r: 1 }, 34, 7, { tone: "hi", crease: "lo" }, { inner: Ln(k.sideSeam({ x: 133, y: -87, w: 14, d: 10, r: 1 }, 37.5, P, 3), { tone: "lo" }) });
cyl("rack.changer", 140, -82, 4.6, 41, 3, { tone: "mid" });
// tool 2: nutrunner
cyl("rack.socket", 151.5, -82, 2, 28, 4, { tone: "mid" });
cyl("rack.nutrunner", 151.5, -82, 3.8, 32, 13, { tone: "hi" }, { extra: Ln(k.knurl(151.5, -82, 3.8, 39, 43, 18, P), { tone: "lo" }) + Ln(k.sideArc(151.5, -82, 3.8, 39, P, 16) + k.sideArc(151.5, -82, 3.8, 43, P, 16), { tone: "lo" }) });
cyl("rack.changer", 151.5, -82, 4.6, 45, 3, { tone: "mid" });
// tool 3: vacuum pad tool
cyl("rack.cup", 159, -82, 2.2, 28, 2, { tone: "mid" });
cyl("rack.cup", 167, -82, 2.2, 28, 2, { tone: "mid" });
slab("rack.pad-plate", { x: 156, y: -85, w: 14, d: 6, r: 0.6 }, 30, 2, { tone: "hi" });
cyl("rack.pad-post", 163, -82, 1.8, 32, 5, { tone: "mid" });
cyl("rack.changer", 163, -82, 4.6, 37, 3, { tone: "mid" });

// ================= cable tray in front of the rail =================
{
  const id = nameFor("tray.trough");
  const parts = [];
  const shapes = [];
  const box = (plan, z, h, tone = "mid") => {
    parts.push(S(k.slabOf(plan, z, h, P, 2, 0), { tone }));
    shapes.push(record(A.slab(plan, z, h, { name: nameFor(`${id}.part`), owner: id }, 2)));
  };
  box({ x: 30, y: 1, w: 150, d: 10, r: 0.4 }, 3, 1, "lo");
  box({ x: 30, y: 1, w: 150, d: 1, r: 0.2 }, 4, 3);
  parts.push(Ln([3.4, 5.2, 7].map((y) => k.segment([30.5, y, 4.45], [179.5, y, 4.45], P)).join(""), { tone: "mid" }));
  box({ x: 30, y: 2, w: 1, d: 8, r: 0.2 }, 4, 3);
  box({ x: 179, y: 2, w: 1, d: 8, r: 0.2 }, 4, 3);
  box({ x: 30, y: 10, w: 150, d: 1, r: 0.2 }, 4, 3);
  put(id, [105, 6, 4], parts.join(""), shapes);
  for (const x of [36, 102, 168]) slab("tray.stand", { x: x - 3, y: 1, w: 6, d: 10, r: 0.5 }, 0, 3, { tone: "lo" });
}

// ================= safety posts with stack lights =================
for (const [x, y] of [[-186, 26], [186, -92]]) {
  slab("post.plate", { x: x - 6, y: y - 6, w: 12, d: 12, r: 1 }, 0, 2, { tone: "lo" }, { extra: Dots(k.corners({ x: x - 6, y: y - 6, w: 12, d: 12 }, 2).map(([px, py]) => at([px, py, 2])), { size: 0.42 }) });
  slab("post.tube", { x: x - 3, y: y - 3, w: 6, d: 6, r: 1 }, 2, 76, { tone: "mid" });
  slab("post.cap", { x: x - 3.6, y: y - 3.6, w: 7.2, d: 7.2, r: 1 }, 78, 2, { tone: "mid" });
  cyl("post.light", x, y, 2.7, 80, 15, { tone: "hi" }, { inner: Ln(k.sideArc(x, y, 2.7, 85, P, 16) + k.sideArc(x, y, 2.7, 90, P, 16), { tone: "lo" }) });
  cyl("post.light-top", x, y, 1.8, 95, 1.2, { tone: "mid" });
}

// ---------- settle the painter's keys, build the SVG and the page ----------
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
const items = R.items.map((item) => `<g data-k="${item.key.toFixed(2)}" data-n="${item.name}">${item.svg}</g>`);

const FIG_CSS = `.iso{--anatomy-page:#08090B;--anatomy-card:#0C0E11;--anatomy-paper:#0C0E11;--anatomy-lit:#22CFFF}
.rit-void{fill:#030405;stroke:none}.rit-wall{fill:#101215;stroke:none}.rit-rail{fill:#16181b;stroke:none}.rit-glass{fill:#14171b;stroke:none}`;
const LABEL =
  "A robot integration and test cell on a plinth: a six-axis robot arm on a floor rail mates a side panel onto a small satellite on its test fixture, at the open door of a cylindrical thermal-vacuum chamber with door clamps, a viewport, feedthrough flanges and a vacuum pump line. A tool rack holds spare end effectors; a cable tray and two safety posts complete the cell.";

const body = [...back, ...items];
const svgPage = k.figureSvg({ width: W, height: H, label: LABEL, body });
const svgAlone = k.figureSvg({ width: W, height: H, label: LABEL, body: [`<style>${FIG_CSS}</style>`, ...body], standalone: "dark" });

const caption =
  "Integration and test is about a quarter of a new space program's critical path. In the base case robots run it around the clock at a leading firm by 2033 (Low by 2031, Medium by 2035); with general-purpose robots at scale, by 2031 (High by 2035). The binding gate is qualification. The arm is the new worker; the chamber is unlit because its clock does not change: thermal-vacuum minimums of 4 cycles with 12 h plateaus hold whoever loads it. Rocket Lab's Rosie robot cut composite work on one Electron from more than 400 hours to 12 in 2019 (33× on one step), yet Electron's launch rate rose only about 3.5× over the next six years.";
const plate = k.plateHtml({
  fig: "Fig 1",
  title: "Robots on the test line",
  hint: "",
  readout: `TVAC: ${TRUTH.tvac.cycles} cycles · ${TRUTH.tvac.plateauH} h plateaus`,
  keys: [
    { mark: "lit", label: "Robot arm: the new worker, any shift" },
    { mark: "raised", label: "Thermal-vacuum chamber: its clock does not change" },
  ],
  caption,
  body: `<div class="iso-stage">${svgPage}</div>`,
});
writeFileSync(join(HERE, `${SLUG}.html`), k.pageHtml({ title: "Robots on the test line", theme: "dark", body: `<style>${FIG_CSS}</style>${plate}`, width: 820 }));
writeFileSync(join(HERE, `${SLUG}.svg`), svgAlone);
const solids = R.items.reduce((sum, item) => sum + item.shapes.length, 0);
console.log(`wrote ${SLUG}.html and ${SLUG}.svg · ${R.items.length} items · ${solids} shapes · svg ${(svgAlone.length / 1024).toFixed(0)} KB`);

A.auditOrExit(R, P);

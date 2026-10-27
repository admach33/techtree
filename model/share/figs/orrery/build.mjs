// Orrery: a brass desk orrery of the Earth–Moon system whose lit wire is an
// AI-designed ballistic lunar transfer. Builds orrery.html, orrery.svg and
// (with the audit) proves the geometry: node build.mjs [--audit]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/alex/.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/Users/alex/.claude/skills/anatomy/kit/lathe.mjs";
import { tubePieces, tubeSvg } from "/Users/alex/.claude/skills/anatomy/kit/tube.mjs";
import * as A from "/Users/alex/.claude/skills/anatomy/kit/audit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SLUG = "orrery";
const DEG = Math.PI / 180;
const W = 640;
const H = 440;

// ---------- truth (see NOTES.md) ----------
const SIDEREAL_MONTH = 27.3217; // days, Moon's sidereal period
const TRAIN = [
  [10, 39],
  [10, 70],
]; // pinion : wheel, stage by stage; 39/10 x 70/10 = 27.3 crank turns per Moon orbit
const RATIO = TRAIN.reduce((product, [pinion, wheel]) => product * (wheel / pinion), 1);
const TILT = 23.44; // Earth's axial tilt, degrees
const EARLIEST = "2029"; // node astro-ai-designed-trajectory-flown, base case (S2)

// ---------- world plan (units ≈ px, z up) ----------
const PLINTH = { r0: 160, r1: 152, z0: -18, z1: -8, z2: 0 };
const FOOT = { at: 132, r0: 9, r1: 7, z0: -27, z1: -25.4 };
const RING = { r: 110, h: 0.8 }; // degree ring under the movement
const PLATE = { r: 97, z: RING.h, h: 3 };
const PT = PLATE.z + PLATE.h; // movement plate top
const ARM_Z = 36; // hub bottom
const ARM = { z: ARM_Z + 1, h: 3 }; // arm bars
const ARM_TOP = ARM.z + ARM.h;
const ZE = 112; // Earth centre, Moon centre and wire plane
const RE = 26; // Earth globe radius
const RM = 7; // Moon radius (0.27 of Earth, the true ratio)
const D = 100; // Moon arm radius (not to scale: the true distance is 60 Earth radii)
const PHI_M = 330; // Moon arm direction, degrees from +x toward +y
const WIRE_R = 0.85;
const CLIP_R = 1.5;
const STAY_R = 0.55;
const BEAD_R = 3.2;
const M = 1.2; // gear module

const dir = (deg) => [Math.cos(deg * DEG), Math.sin(deg * DEG)];
const pol = (deg, r, z = 0) => [r * Math.cos(deg * DEG), r * Math.sin(deg * DEG), z];
const add2 = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s];

// gear train positions
const O = [0, 0];
const I = add2(O, dir(95), (M * (TRAIN[1][1] + TRAIN[1][0])) / 2); // 48 from the centre
const C = add2(I, dir(140), (M * (TRAIN[0][1] + TRAIN[0][0])) / 2); // 29.4 from I
const CRANK_DIR = 150;
const KNOB = add2(C, dir(CRANK_DIR), 15);
const PILLARS = [add2(I, dir(185), 28), add2(I, dir(5), 28)];

// Earth on a tilted axle: the north pole leans toward the viewer's left (φ = 135°)
const AXIS = (() => {
  const t = TILT * DEG;
  const [hx, hy] = dir(135);
  return [hx * Math.sin(t), hy * Math.sin(t), Math.cos(t)];
})();
const EARTH = [0, 0, ZE];
const KNUCKLE_L = 42; // knuckle ball centre to Earth centre, along the axle
const KNUCKLE_R = 3;
const KNUCKLE = G.sub3(EARTH, G.mul3(AXIS, KNUCKLE_L));
const BRACKET_TOP = KNUCKLE[2] - KNUCKLE_R;
const BRACKET_H = 3;
const COLLAR_TOP = BRACKET_TOP - BRACKET_H;
const COLLAR_H = 4;
const MOON = pol(PHI_M, D, ZE);


const put = (name, ref, svg, shapes, bias = 0) => R.put({ name, at: ref, bias, svg, shapes: shapes.map((shape) => R.solid(shape)) });

function cyl(name, [cx, cy], r, z, h, style = {}, { extra = "", inner = "", steps, bevel = 0, bias = 0 } = {}) {
  const paths = k.cylinder(cx, cy, r, z, h, P, steps ?? Math.max(20, Math.min(160, Math.round(r * 5))), bevel);
  put(name, [cx, cy, z + h / 2], S(paths, { tone: "mid", ...style, inner }) + extra, [A.cylinder(cx, cy, r, z, h, { name })], bias);
}

function stadium(p0, p1, hw, steps = 10) {
  const [ux, uy] = (() => {
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const length = Math.hypot(dx, dy);
    return [dx / length, dy / length];
  })();
  const nx = -uy;
  const ny = ux;
  const ring = [];
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (i / steps) * Math.PI;
    ring.push([p1[0] + (ux * Math.cos(a) + nx * Math.sin(a)) * hw, p1[1] + (uy * Math.cos(a) + ny * Math.sin(a)) * hw]);
  }
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI / 2 + (i / steps) * Math.PI;
    ring.push([p0[0] + (ux * Math.cos(a) + nx * Math.sin(a)) * hw, p0[1] + (uy * Math.cos(a) + ny * Math.sin(a)) * hw]);
  }
  return ring;
}

function bar(name, p0, p1, hw, z, h, style = {}, { extra = "", bevel = 0.4, bias = 0 } = {}) {
  const ring = stadium(p0, p1, hw);
  const paths = k.extrude(ring, z, h, P, { bevel });
  const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, z + h / 2];
  put(name, mid, S(paths, { tone: "mid", ...style }) + extra, [A.extruded(ring, z, h, { name })], bias);
}

function ball(name, c, r, style = {}, { inner = "", extra = "", bias = 0, className, owner } = {}) {
  const paths = G.sphereOf(c, r, P);
  const svg = S(paths, { tone: "hi", ...style, inner }) + extra;
  put(name, c, className ? `<g class="${className}">${svg}</g>` : svg, [A.ball(c, r, { name, owner })], bias);
}

// a horizontal spur gear: root, flank, tip, flank per tooth (true tooth count)
function gearRing([cx, cy], teeth, phase) {
  const rp = (M * teeth) / 2;
  const ra = rp + M;
  const rf = rp - 1.25 * M;
  const pitch = (2 * Math.PI) / teeth;
  const ring = [];
  for (let i = 0; i < teeth; i++) {
    const c = phase + i * pitch;
    for (const [r, a] of [
      [rf, c - pitch * 0.29],
      [ra, c - pitch * 0.13],
      [ra, c + pitch * 0.13],
      [rf, c + pitch * 0.29],
    ])
      ring.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return ring;
}

// crossings (spoke windows) of a wheel, as closed outlines on its top face
function windows([cx, cy], count, r0, r1, spoke, z, phase) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a0 = phase + (i / count) * 2 * Math.PI;
    const a1 = phase + ((i + 1) / count) * 2 * Math.PI;
    const points = [];
    const outerPad = Math.asin(spoke / 2 / r1);
    const innerPad = Math.asin(spoke / 2 / r0);
    for (let j = 0; j <= 12; j++) {
      const a = a0 + outerPad + (j / 12) * (a1 - a0 - 2 * outerPad);
      points.push([cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)]);
    }
    for (let j = 6; j >= 0; j--) {
      const a = a0 + innerPad + (j / 6) * (a1 - a0 - 2 * innerPad);
      points.push([cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)]);
    }
    out.push(k.onTop(points, z, P, true));
  }
  return out.join("");
}

function gearSvg(centre, teeth, phase, z, h, { windows: win } = {}) {
  const ring = gearRing(centre, teeth, phase);
  const paths = k.extrude(ring, z, h, P, { convex: false });
  const holes = win ? `<path class="orr-window" d="${windows(centre, win.count, win.r0, win.r1, win.spoke, z + h, win.phase ?? phase)}"/>` : "";
  return { svg: S(paths, { tone: "mid", crease: "lo" }) + holes, shape: A.extruded(ring, z, h, { name: `gear${teeth}@${centre.map((v) => v.toFixed(0)).join(",")}` }), ring };
}

// ---------- static base (drawn first, recorded as stand.*) ----------
function base() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.cylinder(0, 0, PLINTH.r0 + 4, FOOT.z0, -FOOT.z0, P, 120).fill}"/>`);
  const feet = [45, 135, 225, 315].map((deg) => dir(deg).map((v) => v * FOOT.at)).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P));
  feet.forEach(([x, y], index) => {
    out.push(S(k.cylinder(x, y, FOOT.r0, FOOT.z0, FOOT.z1 - FOOT.z0, P, 40), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, FOOT.r1, FOOT.z1, PLINTH.z0 - FOOT.z1, P, 40, 0.4), { tone: "mid" }));
    R.solid(A.cylinder(x, y, FOOT.r0, FOOT.z0, FOOT.z1 - FOOT.z0, { name: `stand.foot${index}`, ground: true }));
    R.solid(A.cylinder(x, y, FOOT.r1, FOOT.z1, PLINTH.z0 - FOOT.z1, { name: `stand.foot${index}.bun`, ground: true }));
  });
  // two-tier plinth with a bead seam on the lower tier
  out.push(S(k.cylinder(0, 0, PLINTH.r0, PLINTH.z0, PLINTH.z1 - PLINTH.z0, P, 160, 1.2), { tone: "mid", inner: Ln(k.sideArc(0, 0, PLINTH.r0, PLINTH.z0 + 3.5, P, 96), { tone: "faint" }) }));
  out.push(S(k.cylinder(0, 0, PLINTH.r1, PLINTH.z1, PLINTH.z2 - PLINTH.z1, P, 160, 1.6), { tone: "mid" }));
  R.solid(A.cylinder(0, 0, PLINTH.r0, PLINTH.z0, PLINTH.z1 - PLINTH.z0, { name: "stand.plinth", ground: true }));
  R.solid(A.cylinder(0, 0, PLINTH.r1, PLINTH.z1, PLINTH.z2 - PLINTH.z1, { name: "stand.plinth.top", ground: true }));
  out.push(Ln(k.ring(0, 0, 145, 0, P, 160), { tone: "lo" }));
  out.push(Ln(k.ring(0, 0, 116, 0, P, 140), { tone: "faint" }));
  // eight screws holding the movement table to the plinth
  const screws = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => dir(deg).map((v) => v * 130.5));
  out.push(Ln(screws.map(([x, y]) => k.ring(x, y, 2.1, 0, P, 18)).join(""), { tone: "lo" }));
  out.push(Dots(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // engraved year plate at the front
  const right = [Math.SQRT1_2, -Math.SQRT1_2];
  const front = [Math.SQRT1_2, Math.SQRT1_2];
  const centre = dir(45).map((v) => v * 130.5);
  const plate = [];
  const half = [16, 6];
  const corner = 1.6;
  for (const [sx, sy, a0] of [
    [1, 1, 0],
    [-1, 1, 90],
    [-1, -1, 180],
    [1, -1, 270],
  ])
    for (let j = 0; j <= 4; j++) {
      const a = (a0 + (j / 4) * 90) * DEG;
      const u = sx * (half[0] - corner) + Math.cos(a) * corner;
      const v = sy * (half[1] - corner) + Math.sin(a) * corner;
      plate.push([centre[0] + right[0] * u + front[0] * v, centre[1] + right[1] * u + front[1] * v]);
    }
  out.push(S(k.extrude(plate, 0, 0.9, P, { bevel: 0.35 }), { tone: "mid" }));
  R.solid(A.extruded(plate, 0, 0.9, { name: "stand.label", ground: true }));
  const o = at([centre[0], centre[1], 0.9]);
  const ex = G.sub3(at([centre[0] + right[0], centre[1] + right[1], 0.9]), [...o, 0]).slice(0, 2);
  const ey = G.sub3(at([centre[0] + front[0], centre[1] + front[1], 0.9]), [...o, 0]).slice(0, 2);
  const t = (v) => v.toFixed(4);
  if (process.env.ENGRAVE) out.push(k.faceTextSvg(`matrix(${t(ex[0])} ${t(ex[1])} ${t(ey[0])} ${t(ey[1])} ${t(o[0])} ${t(o[1])})`, EARLIEST, { size: 6.4, tone: "hi", anchor: "middle" }).replace("<text", '<text dy="2.3"'));
  const plateScrews = [-12.6, 12.6].map((u) => [centre[0] + right[0] * u, centre[1] + right[1] * u, 0.9]);
  out.push(Dots(plateScrews.map(at), { size: 0.45, tone: "mid" }));
  // degree ring (72 x 5°) and the movement table
  out.push(S(k.cylinder(0, 0, RING.r, 0, RING.h, P, 150), { tone: "lo", crease: "lo" }));
  R.solid(A.cylinder(0, 0, RING.r, 0, RING.h, { name: "stand.ring", ground: true }));
  const ticks = k.radialTicks(0, 0, RING.r - 0.5, 72, 6, RING.h, [2.4, 4.6], P);
  out.push(Ln(ticks.minor, { tone: "lo" }), Ln(ticks.major, { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, PLATE.r, PLATE.z, PLATE.h, P, 150, 0.8), { tone: "mid" }));
  R.solid(A.cylinder(0, 0, PLATE.r, PLATE.z, PLATE.h, { name: "stand.movement", ground: true }));
  out.push(Ln(k.ring(0, 0, PLATE.r - 4.5, PT, P, 140), { tone: "faint" }));
  const plateScrews2 = [20, 80, 140, 200, 260, 320].map((deg) => dir(deg).map((v) => v * (PLATE.r - 8.5)));
  out.push(Ln(plateScrews2.map(([x, y]) => k.ring(x, y, 1.9, PT, P, 16)).join(""), { tone: "lo" }));
  out.push(Dots(plateScrews2.map(([x, y]) => at([x, y, PT])), { size: 0.45 }));
  return out.join("");
}

// ---------- movement: two-stage gear train, 27.3 : 1 ----------
const phaseToward = (from, to) => Math.atan2(to[1] - from[1], to[0] - from[0]);
const B1 = phaseToward(C, I);
const B2 = phaseToward(I, O);
function movement() {
  // stage 2: pinion 10 on I drives wheel 70 on the centre (one item: their teeth interleave)
  const w70 = gearSvg(O, TRAIN[1][1], B2 + Math.PI + Math.PI / TRAIN[1][1], PT + 3, 3, { windows: { count: 5, r0: 13.5, r1: 33.5, spoke: 5, phase: 0.3 } });
  const p10b = gearSvg(I, TRAIN[1][0], B2, PT + 3, 3);
  put("train.stage2", [I[0] * 0.3, I[1] * 0.3, PT + 4.5], w70.svg + Ln(k.ring(0, 0, 10.5, PT + 6, P, 48), { tone: "faint" }) + p10b.svg, [w70.shape, p10b.shape]);
  // stage 1: pinion 10 on the crank arbor C drives wheel 39 on I
  const w39 = gearSvg(I, TRAIN[0][1], B1 + Math.PI + Math.PI / TRAIN[0][1], PT + 9, 3, { windows: { count: 4, r0: 7.5, r1: 18.2, spoke: 3.6, phase: 0.6 } });
  const p10a = gearSvg(C, TRAIN[0][0], B1, PT + 9, 3);
  put("train.stage1", [(I[0] + C[0]) / 2, (I[1] + C[1]) / 2, PT + 10.5], w39.svg + p10a.svg, [w39.shape, p10a.shape]);

  // centre: boss, wheel collar, sleeve to the arm hub
  cyl("centre.boss", O, 8, PT, 3, {}, { bevel: 0.4 });
  cyl("centre.collar", O, 8, PT + 6, 3, {}, { bevel: 0.4, extra: Dots([30, 150, 270].map((deg) => at([...dir(deg).map((v) => v * 5.6), PT + 9])), { size: 0.45 }) });
  cyl("centre.sleeve", O, 4.5, PT + 9, ARM_Z - PT - 9, { crease: "none" }, { inner: Ln(k.sideArc(0, 0, 4.5, 24, P, 24), { tone: "faint" }) });

  // arbor I: bush, rod, rod, bridge (cock) on two pillars
  cyl("arborI.bush", I, 3.5, PT, 3);
  cyl("arborI.rod1", I, 1.6, PT + 6, 3, { crease: "none" });
  cyl("arborI.rod2", I, 1.6, PT + 12, 3, { crease: "none" });
  PILLARS.forEach((p, index) => cyl(`bridge.pillar${index}`, p, 2.4, PT, 15, { crease: "none" }, { inner: Ln(k.sideArc(p[0], p[1], 2.4, PT + 4, P, 12), { tone: "faint" }) }));
  const bridgeTop = PT + 18;
  bar("bridge.bar", PILLARS[0], PILLARS[1], 3.2, PT + 15, 3, {}, {
    bevel: 0.5,
    extra:
      Ln(PILLARS.map(([x, y]) => k.ring(x, y, 1.5, bridgeTop, P, 14)).join("") + k.ring(I[0], I[1], 1.9, bridgeTop, P, 16), { tone: "lo" }) +
      Dots([...PILLARS, I].map(([x, y]) => at([x, y, bridgeTop])), { size: 0.45 }),
  });

  // crank arbor C: hour dial (24 ticks: one turn = one day), bush, rods, crank
  cyl("crank.dial", C, 14, PT, 0.8, { tone: "lo", crease: "lo" }, {
    extra: (() => {
      const t = k.radialTicks(C[0], C[1], 13.6, 24, 6, PT + 0.8, [1.8, 3.4], P);
      return Ln(t.minor, { tone: "lo" }) + Ln(t.major, { tone: "mid" });
    })(),
  });
  cyl("crank.bush", C, 3.5, PT + 0.8, 3.2, {}, { bevel: 0.3 });
  cyl("crank.rod1", C, 1.6, PT + 4, 5, { crease: "none" });
  cyl("crank.rod2", C, 1.6, PT + 12, 6, { crease: "none" });
  cyl("crank.boss", C, 3.2, PT + 18, 3, {}, { bevel: 0.3, extra: Dots([at([C[0], C[1], PT + 21])], { size: 0.5, tone: "hi" }) });
  bar("crank.arm", add2(C, dir(CRANK_DIR), 3.1 + 1.9), KNOB, 1.9, PT + 18.5, 2.2, {}, { bevel: 0.3 });
  cyl("crank.neck", KNOB, 1.3, PT + 20.7, 1.5, { crease: "none" });
  cyl("crank.knob", KNOB, 2.8, PT + 22.2, 7, {}, { bevel: 0.4, extra: Ln(k.knurl(KNOB[0], KNOB[1], 2.8, PT + 22.2, PT + 29.2, 16, P), { tone: "lo" }) });
}

// ---------- arms: hub on the sleeve, Moon arm, counterweight arm, two outriggers ----------
const HUB_R = 8.5;
const armFrom = (deg) => dir(deg).map((v) => v * (HUB_R - 0.1 + 0.0));
function arm(name, deg, length, hw) {
  const screws = [HUB_R + hw + 3, HUB_R + hw + 8].map((r) => at([...dir(deg).map((v) => v * r), ARM_TOP]));
  bar(name, armFrom(deg).map((v, i) => v + dir(deg)[i] * hw), dir(deg).map((v) => v * length), hw, ARM.z, ARM.h, {}, { bevel: 0.4, extra: Dots(screws, { size: 0.45 }) });
}
function stay(name, xy, topZ, baseZ = ARM_TOP) {
  cyl(`${name}.foot`, xy, 1.6, baseZ, 1.5, {}, { bevel: 0.2 });
  const top = topZ - Math.sqrt(CLIP_R ** 2 - STAY_R ** 2);
  cyl(`${name}.rod`, xy, STAY_R, baseZ + 1.5, top - baseZ - 1.5, { crease: "none" }, { steps: 16 });
}

// ---------- the transfer: a ballistic lunar transfer in the arm's rotating frame ----------
function catmull(points, per = 16) {
  const out = [];
  const pts = [points[0], ...points, points[points.length - 1]];
  for (let i = 1; i < pts.length - 2; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1], pts[i], pts[i + 1], pts[i + 2]];
    const t0 = 0;
    const t1 = t0 + Math.max(1e-6, Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) ** 0.5);
    const t2 = t1 + Math.max(1e-6, Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) ** 0.5);
    const t3 = t2 + Math.max(1e-6, Math.hypot(p3[0] - p2[0], p3[1] - p2[1]) ** 0.5);
    for (let j = 0; j < per; j++) {
      const t = t1 + ((t2 - t1) * j) / per;
      const lerp = (a, b, ta, tb) => a.map((v, n) => (v * (tb - t) + b[n] * (t - ta)) / (tb - ta));
      const a1 = lerp(p0, p1, t0, t1);
      const a2 = lerp(p1, p2, t1, t2);
      const a3 = lerp(p2, p3, t2, t3);
      const b1 = lerp(a1, a2, t0, t2);
      const b2 = lerp(a2, a3, t1, t3);
      out.push(lerp(b1, b2, t1, t2));
    }
  }
  out.push(points[points.length - 1]);
  return out;
}
const RHAT = dir(PHI_M);
const THAT = dir(PHI_M + 90);
const LOOP_TILT = 18; // the capture orbit is inclined to the wire plane, so it visibly wraps the Moon
const aroundMoon3 = (psi, d, tilt = LOOP_TILT) => {
  const c = Math.cos(psi * DEG) * d;
  const t = Math.sin(psi * DEG) * d;
  return [MOON[0] + c * RHAT[0] + t * Math.cos(tilt * DEG) * THAT[0], MOON[1] + c * RHAT[1] + t * Math.cos(tilt * DEG) * THAT[1], ZE - t * Math.sin(tilt * DEG)];
};
const aroundMoon = (psi, d) => [MOON[0] + d * (Math.cos(psi * DEG) * RHAT[0] + Math.sin(psi * DEG) * THAT[0]), MOON[1] + d * (Math.cos(psi * DEG) * RHAT[1] + Math.sin(psi * DEG) * THAT[1])];
const CONTROL = [
  pol(150, 33, ZE), // departure, just off the globe
  pol(163, 50, ZE),
  pol(182, 82, ZE),
  pol(208, 120, ZE),
  pol(240, 145, ZE), // out beyond the Moon's orbit (1.45 x)
  pol(272, 143, ZE),
  pol(300, 127, ZE),
  [...aroundMoon(-70, 30), ZE], // falls back in toward the Moon from outside its orbit
  ...Array.from({ length: 22 }, (_, i) => -25 + i * 15).map((psi) => aroundMoon3(psi, 15)), // capture orbit, -25° to 290°
];
const CURVE = G.resample(catmull(CONTROL, 20), 0.8);
const TOTAL = G.pathLength(CURVE);
const END_CUT = Math.sqrt(CLIP_R ** 2 - WIRE_R ** 2);
const BEAD_CUT = Math.sqrt(BEAD_R ** 2 - WIRE_R ** 2);
const nearestS = (xy) => {
  let best = 0;
  let bestD = Infinity;
  let walked = 0;
  CURVE.forEach((p, i) => {
    if (i) walked += G.len3(G.sub3(p, CURVE[i - 1]));
    const d = Math.hypot(p[0] - xy[0], p[1] - xy[1]);
    if (d < bestD) (bestD = d), (best = walked);
  });
  return best;
};
const S_LOOP = nearestS(aroundMoon3(-25, 15));
const S_STAYS = [0.26, 0.52].map((f) => f * S_LOOP);
const S_BEAD = 0.73 * S_LOOP;
const STAY_PTS = S_STAYS.map((s) => G.pointAlong(CURVE, s));
const BEAD = G.pointAlong(CURVE, S_BEAD);
const START = CURVE[0];
const END = CURVE[CURVE.length - 1];

function transfer() {
  const route = G.cut(CURVE, END_CUT, TOTAL - END_CUT);
  const shift = END_CUT;
  const pad = 0.12; // arc length over chord on the curve, so each run's end ring sits just on its clip
  const gaps = [...S_STAYS.map((s) => [s - shift - END_CUT - pad, s - shift + END_CUT + pad]), [S_BEAD - shift - BEAD_CUT - pad, S_BEAD - shift + BEAD_CUT + pad]];
  R.route("wire", route, WIRE_R, { gaps });
  tubePieces(route, WIRE_R, P, { maxLength: 7, gaps }).forEach((part, index) =>
    R.put({ name: `wire:${index}`, at: part.mid, svg: `<g class="orr-lit">${tubeSvg(part, { tone: "lit" })}</g>`, route: "wire", chunk: index, shapes: [A.tube(part.points, part.radii)] }),
  );
  ball("bead", BEAD, BEAD_R, { tone: "lit" }, { className: "orr-lit orr-bead", owner: "wire" });
  // the end clips are the wire's mounts (heads of their stays); the middle clips and the bead are the wire's own fittings
  [START, ...STAY_PTS, END].forEach((p, index, list) => ball(`clip${index}`, p, CLIP_R, { tone: "mid" }, { owner: index === 0 || index === list.length - 1 ? undefined : "wire" }));
}

// ---------- Earth, Moon and the column ----------
function earth() {
  cyl("hub", O, HUB_R, ARM_Z, 5, {}, { bevel: 0.5, extra: Dots([at([...dir(45).map((v) => v * HUB_R), ARM_Z + 2.5])], { size: 0.55, tone: "hi" }) });
  cyl("column", O, 3, ARM_Z + 5, COLLAR_TOP - COLLAR_H - ARM_Z - 5, { crease: "none" }, { inner: Ln(k.sideArc(0, 0, 3, 50, P, 16), { tone: "faint" }) });
  cyl("column.collar", O, 4.2, COLLAR_TOP - COLLAR_H, COLLAR_H, {}, { bevel: 0.3 });
  bar("column.bracket", [0, 0], KNUCKLE.slice(0, 2), 2.7, COLLAR_TOP, BRACKET_H, {}, { bevel: 0.35 });
  ball("knuckle", KNUCKLE, KNUCKLE_R, { tone: "mid" });
  const F = G.frameAlong(KNUCKLE, AXIS);
  const axleR = 1.2;
  const lower = [Math.sqrt(KNUCKLE_R ** 2 - axleR ** 2), KNUCKLE_L - Math.sqrt(RE ** 2 - axleR ** 2)];
  const upper = [KNUCKLE_L + Math.sqrt(RE ** 2 - axleR ** 2), KNUCKLE_L + RE + 7];
  const finialR = 2;
  for (const [name, [s0, s1]] of [
    ["axle.lower", lower],
    ["axle.upper", upper],
  ])
    put(name, G.pointOf(F, (s0 + s1) / 2, 0, 0), S(G.disc(s0, s1, axleR, F, P), { tone: "mid", crease: "none" }), [A.disc(F, s0, s1, axleR, { name })]);
  ball("finial", G.pointOf(F, upper[1] + Math.sqrt(finialR ** 2 - axleR ** 2), 0, 0), finialR, { tone: "mid" });
  // the globe: equator, tropics, polar circles and six meridians, all on the tilted axis
  const E = G.frameAlong(EARTH, AXIS);
  const lat = (deg) => {
    const s = RE * Math.sin(deg * DEG);
    const r = RE * Math.cos(deg * DEG);
    return G.arcOf(E, s, r, P, { slope: -s / r });
  };
  const meridians = [0, 30, 60, 90, 120, 150].map((deg) => {
    const axis = G.add3(G.mul3(E.u, Math.cos(deg * DEG)), G.mul3(E.v, Math.sin(deg * DEG)));
    return G.arcOf(G.frameAlong(EARTH, axis), 0, RE, P);
  });
  const inner = Ln(lat(0), { tone: "lo" }) + Ln([lat(TILT), lat(-TILT), lat(90 - TILT), lat(TILT - 90)].join(""), { tone: "faint" }) + Ln(meridians.join(""), { tone: "faint" });
  ball("earth", EARTH, RE, { tone: "hi" }, { inner });

  // Moon on its post at the end of the Moon arm
  arm("arm.moon", PHI_M, D + 4.5, 2.6);
  const MXY = MOON.slice(0, 2);
  cyl("moon.collar", MXY, 2.4, ARM_TOP, 2, {}, { bevel: 0.2 });
  const CUP_R = 2.2;
  const cupTop = ZE - Math.sqrt(RM ** 2 - CUP_R ** 2);
  cyl("moon.post", MXY, 1.3, ARM_TOP + 2, cupTop - 2.4 - ARM_TOP - 2, { crease: "none" }, { steps: 20 });
  cyl("moon.cup", MXY, CUP_R, cupTop - 2.4, 2.4, {}, { bevel: 0.2 });
  const craters = [
    [0.55, 0.35, 1.1],
    [-0.2, 0.6, 0.8],
    [0.25, -0.15, 0.6],
  ].map(([a, b, r]) => {
    const Fm = G.frameAlong(MOON, V);
    const n = G.unit3(G.add3(V, G.add3(G.mul3(Fm.u, a), G.mul3(Fm.v, b))));
    const Fc = G.frameAlong(MOON, n);
    return G.circleOf(Fc, Math.sqrt(RM ** 2 - r ** 2), r, P, 18);
  });
  ball("moon", MOON, RM, { tone: "hi" }, { inner: Ln(craters.join(""), { tone: "faint" }) });

  // counterweight arm opposite the Moon, carrying the departure stay
  const CW = PHI_M - 180;
  arm("arm.counter", CW, 62, 2.6);
  const cw = dir(CW).map((v) => v * 51);
  cyl("counterweight", cw, 7, ARM_TOP, 9, {}, { bevel: 0.6, inner: Ln(k.sideArc(cw[0], cw[1], 7, ARM_TOP + 4.5, P, 40), { tone: "faint" }) + Ln(k.knurl(cw[0], cw[1], 7, ARM_TOP, ARM_TOP + 4.5, 44, P), { tone: "lo" }) });
  stay("stay.depart", START.slice(0, 2), ZE);
  // two outriggers carrying stays under the outbound and return legs
  STAY_PTS.forEach((p, index) => {
    const deg = Math.atan2(p[1], p[0]) / DEG;
    const r = Math.hypot(p[0], p[1]);
    arm(`arm.out${index}`, deg, r + 4, 2);
    stay(`stay.out${index}`, p.slice(0, 2), ZE);
  });
  // a side bracket at the tip of the Moon arm carries the stay under the end of the capture orbit
  const tip = RHAT.map((v) => v * (D + 5));
  const under = END.slice(0, 2);
  const bracketEnd = add2(under, [under[0] - tip[0], under[1] - tip[1]], 0.0);
  bar("arm.moon.bracket", tip, bracketEnd, 1.8, ARM_TOP, 2.5, {}, { bevel: 0.3 });
  stay("stay.capture", under, END[2], ARM_TOP + 2.5);
}

const P = k.fitProjection(
  [
    ...[0, 45, 90, 135, 180, 225, 270, 315].flatMap((deg) => [pol(deg, PLINTH.r0, FOOT.z0 - 6), pol(deg, PLINTH.r0, 0)]),
    G.add3(EARTH, G.mul3(AXIS, RE + 11)),
    ...CURVE.map(([x, y, z]) => [x, y, z + 2]),
  ],
  W,
  H,
  { pad: 40, azimuth: 45, elevation: 30 },
);
const V = G.viewOf(P);
const KS = G.scaleOf(P);
const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);

// ---------- recorder ----------
const R = A.recorder(P);

// ---------- build ----------
const BASE = base();
movement();
earth();
transfer();
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);

const OVERRIDES = `.iso{--anatomy-page:#08090B;--anatomy-card:#0C0E11;--anatomy-paper:#0C0E11;--anatomy-lit:#22CFFF}
.iso-plate{--anatomy-paper:#0C0E11}
.orr-window{fill:var(--anatomy-shade-0);stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight);stroke-linejoin:round}
.orr-lit .tb-body{fill:color-mix(in srgb,var(--anatomy-lit) 46%,var(--anatomy-paper))}
.orr-bead{--anatomy-paper:color-mix(in srgb,var(--anatomy-lit) 30%,#0C0E11);--anatomy-shade-0:color-mix(in srgb,var(--anatomy-lit) 36%,#0C0E11);--anatomy-shade-1:color-mix(in srgb,var(--anatomy-lit) 48%,#0C0E11);--anatomy-shade-2:color-mix(in srgb,var(--anatomy-lit) 60%,#0C0E11);--anatomy-shade-3:color-mix(in srgb,var(--anatomy-lit) 72%,#0C0E11);--anatomy-top:color-mix(in srgb,var(--anatomy-lit) 80%,#ffffff)}`;

const LABEL =
  "A brass desk orrery of the Earth and Moon on a round plinth. A crank turns a two-stage gear train, 10 to 39 and 10 to 70, so 27.3 turns of the crank, one per day, carry the Moon once round the Earth. The Earth globe leans 23.4 degrees on its axle. A lit wire held by fine stays on the arms traces a ballistic lunar transfer: it leaves the Earth, swings out beyond the Moon's orbit and falls back to be captured in a loop round the Moon, with a small spacecraft bead on the return leg.";
const body = [BASE, ...R.items.map((item) => item.svg)];
const svgInCard = k.figureSvg({ width: W, height: H, label: LABEL, body });
const standalone = k.figureSvg({ width: W, height: H, label: LABEL, body, standalone: "dark" }).replace("</style>", `${OVERRIDES}</style>`);
writeFileSync(join(HERE, `${SLUG}.svg`), standalone);

const plate = k.plateHtml({
  fig: "Fig 2",
  title: "Earth–Moon orrery",
  hint: "",
  readout: `transfer ≈ 3–4 months · Moon ${SIDEREAL_MONTH.toFixed(1)} d`,
  keys: [
    { mark: "lit", label: "Transfer wire and spacecraft bead: the AI-designed trajectory" },
    { mark: "raised", label: `Gear train 10:39 × 10:70 = ${RATIO.toFixed(1)} crank turns (days) per lunar orbit` },
  ],
  caption:
    "Missions fly AI-designed trajectories, earliest 2029 in the base case. The design itself is fast cognitive work, but the wire waits on the clock below it: designs freeze 6–18 months before launch, and launches of the 30-plus small lunar and cislunar missions planned for 2024–2030 routinely slip.",
  body: `<div class="iso-stage">${svgInCard}</div>`,
});
writeFileSync(join(HERE, `${SLUG}.html`), k.pageHtml({ title: "Earth–Moon orrery", theme: "dark", body: `<style>${OVERRIDES}</style>${plate}` }));

const solids = R.solids.length;
console.log("stays at r", STAY_PTS.map((p) => Math.hypot(p[0], p[1]).toFixed(1)).join(", "), "bead r", Math.hypot(BEAD[0], BEAD[1]).toFixed(1), "end r", Math.hypot(END[0], END[1]).toFixed(1));
console.log(`wrote ${SLUG}.html, ${SLUG}.svg · ${R.items.length} items · ${solids} solids · wire ${TOTAL.toFixed(0)} units · ratio ${RATIO.toFixed(2)} · scale ${KS.toFixed(3)}`);
A.auditOrExit(R, P);

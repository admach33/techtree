// Two clocks: a bench-top marble machine. node build.mjs [--audit]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/alex/.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "/Users/alex/.claude/skills/anatomy/kit/lathe.mjs";
import * as A from "/Users/alex/.claude/skills/anatomy/kit/audit.mjs";
import { kitScript } from "/Users/alex/.claude/skills/anatomy/scripts/inline-kit.mjs";
import * as M from "./model.mjs";
import * as MC from "./machine.mjs";
import { sceneOf } from "./scene.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SLUG = "two-clocks-machine";
const W = 640;
const H = 440;
const L = MC.LAYOUT;
const MR = L.MR;
const XE = L.lift.x;

const PLATE = L.plate;
const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -17, 0),
    [XE - 14, -16, 172], [XE + 14, 4, 172], [XE, -6, 201], [XE + 12, -6, 192], [XE - 12, -6, 192],
    [234, -20, 188], [310, 8, 188], [310, -20, 184],
  ],
  W,
  H,
  { pad: 48, azimuth: 59, elevation: 30 },
);
const V = G.viewOf(P);
const at = (p) => k.iso(p, P);
const path3 = (points, closed = false) => k.pathOf(points.map(at), closed);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const SC = sceneOf({ P, k, G, MC });
// the still: run the machine at today until it is steady, then 6 s at Exponential (queue part-full)
const still = MC.warmed(2, 0, 2.6);

// ---------------------------------------------------------------- recorder and helpers
const R = A.recorder(P);
function put(name, ref, svg, shapes, { bias = 0, ...rest } = {}) {
  return R.put({ name, at: ref, bias, svg, shapes, piece: "machine", ...rest });
}
function box(name, [x0, y0, z0], [x1, y1, z1], style = {}, { r = 0.6, steps = 3, bevel = 0, extra = "", inner = "", bias = 0, owner, ground } = {}) {
  const plan = { x: x0, y: y0, w: x1 - x0, d: y1 - y0, r };
  const shape = R.solid(A.slab(plan, z0, z1 - z0, { name, owner, ground }, steps));
  put(name, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], S(k.slabOf(plan, z0, z1 - z0, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, [shape], { bias });
  return shape;
}
function cyl(name, cx, cy, r, z0, z1, style = {}, { extra = "", inner = "", bias = 0, steps = 28, bevel = 0, owner, ground } = {}) {
  const shape = R.solid(A.cylinder(cx, cy, r, z0, z1 - z0, { name, owner, ground }));
  put(name, [cx, cy, (z0 + z1) / 2], S(k.cylinder(cx, cy, r, z0, z1 - z0, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, [shape], { bias });
  return shape;
}
const FY = (x, z) => G.frameOf([x, 0, z], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
function discY(name, x, z, y0, y1, r, style = {}, { extra = "", inner = "", bias = 0, owner } = {}) {
  const F = FY(x, z);
  const shape = R.solid(A.disc(F, y0, y1, r, { name, owner }));
  put(name, [x, (y0 + y1) / 2, z], S(G.disc(y0, y1, r, F, P), { tone: "mid", ...style, inner }) + extra, [shape], { bias });
  return shape;
}
const XZ = G.frameOf([0, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 0]);
const uvOf = (poly) => poly.map(([x, z]) => [z, x]);
const prismShape = (name, poly, y0, y1, meta = {}) => A.prism(XZ, uvOf(poly), y0, y1, { name, ...meta });
const prismPaths = (poly, y0, y1) => G.prismOf(XZ, uvOf(poly), y0, y1, P);
function prismY(name, poly, y0, y1, style = {}, { extra = "", inner = "", bias = 0, ref, owner } = {}) {
  const shape = R.solid(prismShape(name, poly, y0, y1, { owner }));
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
  const cz = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  put(name, ref ?? [cx, (y0 + y1) / 2, cz], S(prismPaths(poly, y0, y1), { tone: "mid", ...style, inner }) + extra, [shape], { bias });
  return shape;
}
const screws = (points, size = 0.45) => Dots(points.map(at), { size, tone: "mid" });
const ringsOnFace = (list, y, tone = "lo") => Ln(list.map(([x, z, r]) => G.circleOf(FY(x, z), y, r, P, 20)).join(""), { tone });
const GLINT = (() => {
  const o = at([0, 0, 0]);
  const l = at(G.lightOf(P));
  const d = Math.hypot(l[0] - o[0], l[1] - o[1]) || 1;
  const r = MR * G.scaleOf(P) * 0.42;
  return [o[0] + ((l[0] - o[0]) / d) * r, o[1] + ((l[1] - o[1]) / d) * r];
})();
const MARBLE = `<g class="tcm-marble">${S(G.sphereOf([0, 0, 0], MR, P), { tone: "hi", crease: "none" })}<circle class="tcm-glint-dot" cx="${GLINT[0].toFixed(2)}" cy="${GLINT[1].toFixed(2)}" r="0.9"/></g>`;
const marbleAt = (p, alpha = 1) => `<g data-marble="" transform="${SC.shift(p)}"${alpha < 1 ? ` opacity="${alpha.toFixed(2)}"` : ""}>${MARBLE}</g>`;

// ---------------------------------------------------------------- the base (stand)
const halo = `<path class="iso-halo" d="${k.haloOf(PLATE, -17, 12, P)}"/>`;
for (const [x, y] of k.corners(PLATE, 22)) {
  cyl("stand.foot.flange", x, y, 7.4, -17, -15.4, { tone: "lo" }, { ground: true });
  cyl("stand.foot", x, y, 5.6, -15.4, -12, { tone: "mid" });
}
{
  const groove = Ln(k.planOutline(k.insetPlan(PLATE, 5), 0, P, 8), { tone: "faint" });
  const corners = k.corners(PLATE, 10);
  const rings = Ln(corners.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" });
  box("stand.plate", [PLATE.x, PLATE.y, -12], [PLATE.x + PLATE.w, PLATE.y + PLATE.d, 0], { tone: "mid" }, { r: PLATE.r, steps: 8, bevel: 1.6, extra: groove + rings + screws(corners.map(([x, y]) => [x, y, 0]), 0.5), bias: -1000 });
}
{
  const strip = { x: -250, y: 50, w: 556, d: 5.5, r: 1 };
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y, 0.6, [1.8, 3.4], P);
  const shape = R.solid(A.slab(strip, 0, 0.6, { name: "stand.ruler" }, 3));
  put("stand.ruler", [strip.x + strip.w / 2, strip.y + 2, 0.3], S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }) + Ln(t.minor, { tone: "lo" }) + Ln(t.major, { tone: "mid" }) + screws([[strip.x + 2, strip.y + 3, 0.6], [strip.x + strip.w - 2, strip.y + 3, 0.6]]), [shape]);
}
{
  const plan = { x: 150, y: 32, w: 40, d: 13, r: 1.5 };
  const shape = R.solid(A.slab(plan, 0, 0.8, { name: "stand.label" }, 4));
  const text = k.faceTextSvg(k.topMatrix([plan.x + plan.w / 2, plan.y + 8.6], 0.8, P, "x"), "2031", { size: 6.2, tone: "mid", anchor: "middle" });
  put(
    "stand.label",
    [plan.x + 20, plan.y + 6, 0.4],
    S(k.slabOf(plan, 0, 0.8, P, 4), { tone: "lo" }) + Ln(k.planOutline(k.insetPlan(plan, 1.6), 0.8, P, 4), { tone: "faint" }) + text + screws([[plan.x + 3.4, plan.y + 3.4, 0.8], [plan.x + plan.w - 3.4, plan.y + plan.d - 3.4, 0.8]]),
    [shape],
  );
}

// ---------------------------------------------------------------- the thinking wall (pegboard)
const B = L.board;
const boardTop = (x) => (x <= B.flat ? B.top : B.top + ((x - B.flat) / (B.x1 - B.flat)) * (B.low - B.top));
{
  const poly = [[B.x0, 0], [B.x1, 0], [B.x1, B.low], [B.flat, B.top], [B.x0, B.top]];
  const holes = [];
  for (let x = B.x0 + 6; x <= B.x1 - 5; x += 8) for (let z = 7; z <= boardTop(x) - 6; z += 8) holes.push(at([x, B.y1, z]));
  const frame = path3([[B.x0 + 3, B.y1, 3], [B.x1 - 3, B.y1, 3], [B.x1 - 3, B.y1, boardTop(B.x1 - 3) - 3], [B.flat, B.y1, B.top - 3], [B.x0 + 3, B.y1, B.top - 3]], true);
  prismY("think.board", poly, B.y0, B.y1, { tone: "mid" }, { extra: Ln(frame, { tone: "faint" }) + Dots(holes, { size: 0.42, tone: "lo" }) });
  for (const x of [B.x0 + 54, B.x1 - 14]) {
    box("think.board.bracket", [x - 3, B.y1, 0], [x + 3, B.y1 + 7, 6], { tone: "mid" }, { extra: screws([[x, B.y1 + 3.5, 6]]) });
  }
}

// ---------------------------------------------------------------- the lift: hopper, sprockets, chain
const LI = L.lift;
{
  const x0 = XE - 26;
  const x1 = XE + 15.5;
  box("lift.hopper.floor", [x0, -12, 0], [x1, 14, 1.5], { tone: "lo" }, { r: 0.4 });
  box("lift.hopper.back", [x0, -12, 1.5], [x1, -10.5, 22], { tone: "mid" }, { r: 0.3, steps: 2 });
  box("lift.hopper.left", [x0, -10.5, 1.5], [x0 + 1.5, 12.5, 22], { tone: "mid" }, { r: 0.3, steps: 2 });
  box("lift.hopper.right", [x1 - 1.5, -10.5, 1.5], [x1, 12.5, 22], { tone: "mid" }, { r: 0.3, steps: 2, extra: screws([[x1 - 0.75, 0, 22], [x1 - 0.75, 10, 22]]) });
  box("lift.hopper.front", [x0, 12.5, 1.5], [x1, 14, 12], { tone: "mid" }, { r: 0.3, steps: 2, bevel: 0.3, extra: screws([[x0 + 3, 14, 9], [x1 - 3, 14, 9]].map((p) => p)) });
  // the stock of marbles in the hopper
  const z1 = MR + 1.5;
  const z2 = z1 + Math.sqrt(4 * MR * MR - MR * MR);
  const pile = [
    [XE - 20.6, 1.4, z1], [XE - 20.6, 8.6, z1], [XE - 13.4, 8.6, z1], [XE - 6.2, 8.6, z1], [XE + 1, 8.6, z1], [XE + 8.2, 8.6, z1],
    [XE - 17, 8.6, z2], [XE - 2.6, 8.6, z2], [XE + 4.6, 8.6, z2], [XE - 20.6, -5.2, z1],
  ];
  for (const [name, list] of [["lift.hopper.pile.back", pile.filter((p) => p[1] < 5)], ["lift.hopper.pile", pile.filter((p) => p[1] >= 5)]]) {
    const sorted = [...list].sort((a, b) => G.dot3(a, V) - G.dot3(b, V));
    const c = sorted.reduce((sum, p) => G.add3(sum, G.mul3(p, 1 / sorted.length)), [0, 0, 0]);
    put(name, c, sorted.map((p) => marbleAt(p)).join(""), sorted.map((p) => R.solid(A.ball(p, MR, { name, owner: "pile" }))));
  }
}
for (const [which, z] of [["bottom", LI.zb], ["top", LI.zt]]) {
  discY(`lift.axle.${which}`, XE, z, which === "bottom" ? -10.5 : -12, -8, 1.8, { tone: "mid" });
  const F = FY(XE, z);
  const teeth = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    teeth.push(k.pathOf([at(G.pointOf(F, -5, LI.rs - 1.2, a)), at(G.pointOf(F, -5, LI.rs, a))]));
  }
  const holes = [0, 1, 2, 3, 4].map((i) => {
    const a = (i / 5) * Math.PI * 2;
    return G.circleOf(G.frameOf(G.pointOf(F, 0, 3.9, a), [0, 1, 0], [0, 0, 1], [1, 0, 0]), -5, 1.1, P, 14);
  });
  const face = `<g data-live="sprocket-${which}" transform="${SC.sprocket(still, which)}">${Ln(teeth.join(""), { tone: "lo" })}${Ln(holes.join(""), { tone: "lo" })}</g>`;
  discY(`lift.sprocket.${which}.back`, XE, z, -8, -7.4, LI.rs, { tone: "mid" });
  discY(`lift.sprocket.${which}.spacer`, XE, z, -7.4, -5.6, 3, { tone: "mid" });
  discY(`lift.sprocket.${which}`, XE, z, -5.6, -5, LI.rs, { tone: "mid" }, { extra: face });
  discY(`lift.hub.${which}`, XE, z, -5, -3.6, 2.4, { tone: "mid" }, { extra: Dots([at([XE, -3.6, z])], { size: 0.5, tone: "mid" }) });
}
{
  // the chain: two link-plate edges round the loop, and link pins that move with it
  const loop = (out) => Array.from({ length: 160 }, (_, i) => MC.chainAt((i / 160) * MC.LOOP, out).p);
  const edge = (out) => k.pathOf(loop(out).map(([x, z]) => at([x, LI.yc, z])), true);
  const pins = SC.linksOf(still).map(([x, y]) => `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="0.42"/>`).join("");
  const svg = Ln(edge(-0.75) + edge(0.75), { tone: "mid" }) + `<g class="iso-dots" data-tone="hi" data-live="links">${pins}</g>`;
  const points = loop(0).map(([x, z]) => [x, LI.yc, z]);
  const tubes = R.route("lift.chain", [...points, points[0]], 0.8, { closed: true, limp: true, touch: ["lift.sprocket.top*", "lift.sprocket.bottom*"] });
  put("lift.chain", [XE, LI.yc, (LI.zb + LI.zt) / 2], svg, tubes, { bias: 0.4 });
}

// ---------------------------------------------------------------- the thinking movement and its governor
const MV = L.movement;
{
  box("think.movement.back", [MV.x0, MV.y0, MV.z0], [MV.x1, MV.y0 + 3, MV.z1 + 2], { tone: "mid" }, { r: 1, bevel: 0.5 });
  const pillars = [[XE - 8.4, MV.z0 + 2.4], [XE + 8.4, MV.z0 + 2.4], [XE - 8.4, MV.z1 - 0.4], [XE + 8.4, MV.z1 - 0.4]];
  // wheels between the plates
  const gear = (name, x, z, y0, y1, r, count) => {
    const F = FY(x, z);
    const teeth = G.spokesOf(F, y1, r - 1, r, count, P);
    discY(name, x, z, y0, y1, r, { tone: "mid" }, { extra: Ln(teeth, { tone: "lo" }) + Ln(G.circleOf(F, y1, r * 0.55, P, 24), { tone: "faint" }) + Dots([at([x, y1, z])], { size: 0.55, tone: "mid" }) });
  };
  discY("think.movement.arbor", XE - 5, 159, MV.y0 + 3, -9, 1, { tone: "mid" });
  gear("think.movement.wheel", XE - 5, 159, -9, -7.4, 8, 36);
  discY("think.movement.arbor2", XE + 5, 155, MV.y0 + 3, -6.4, 1, { tone: "mid" });
  gear("think.movement.pinion", XE + 5, 155, -6.4, -5, 4.2, 16);
  pillars.forEach(([x, z], i) => discY(`think.movement.pillar${i}`, x, z, MV.y0 + 3, 1, 1.3, { tone: "mid" }));
  box("think.movement.front", [XE - 11, 1, MV.z0], [XE + 11, MV.y1, MV.z1 + 2], { tone: "mid" }, { r: 1, bevel: 0.5, extra: screws(pillars.map(([x, z]) => [x, MV.y1, z])) });
  // the small dial: 60 divisions, one sweep hand
  const D = [XE, 158];
  const F = FY(D[0], D[1]);
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const long = i % 5 === 0;
    ticks.push({ long, d: k.pathOf([at(G.pointOf(F, 5.2, 8.4, a)), at(G.pointOf(F, 5.2, long ? 6.6 : 7.5, a))]) });
  }
  const hand = `<g data-live="think-hand" transform="${SC.thinkHand(still)}">${Ln(path3([[D[0], 5.3, D[1] - 1.6], [D[0], 5.3, D[1] + 7.2]]), { tone: "hi", free: true })}</g>`;
  discY("think.dial", D[0], D[1], MV.y1, 5.2, 9.4, { tone: "hi", crease: "lo" }, {
    extra:
      Ln(G.circleOf(F, 5.2, 8.4, P, 64), { tone: "lo" }) +
      Ln(ticks.filter((t) => !t.long).map((t) => t.d).join(""), { tone: "lo" }) +
      Ln(ticks.filter((t) => t.long).map((t) => t.d).join(""), { tone: "mid" }) +
      hand +
      Dots([at([D[0], 5.3, D[1]])], { size: 0.8, tone: "hi" }),
  });
  // bridge and governor
  box("think.governor.bridge", [XE - 8, MV.y0, MV.z1 + 2], [XE + 8, MV.y1, MV.z1 + 4], { tone: "mid" }, { r: 0.8, bevel: 0.4, extra: screws([[XE - 5.5, MV.y0 + 1.5, MV.z1 + 4], [XE + 5.5, MV.y1 - 1.5, MV.z1 + 4]]) });
  const g = SC.GOV;
  cyl("think.governor.collar", g.x, g.y, 3.2, MV.z1 + 4, g.z0, { tone: "mid" }, { steps: 24 });
  const live = `<g data-live="governor">${SC.governorSvg(still, S, Ln, Dots)}</g>`;
  const shapes = [R.solid(A.cylinder(g.x, g.y, 9.6, g.z0, g.top + 1.8, { name: "think.governor", owner: "governor" }))];
  put("think.governor", [g.x, g.y, 184], live, shapes);
}

// ---------------------------------------------------------------- the three thinking chutes
const SEAT = L.SEAT;
L.chutes.forEach((c, i) => {
  const xa = c.x0 - 3;
  const xb = c.x1 + 1;
  const zAt = (x) => c.z0 + ((x - c.x0) / (c.x1 - c.x0)) * (c.z1 - c.z0) - SEAT;
  const poly = [[xa, zAt(xa)], [xb, zAt(xb)], [xb, zAt(xb) - 6], [xa, zAt(xa) - 6]];
  const grooves = [-L.GROOVE, L.GROOVE].map((y) => path3([[xa, y, zAt(xa)], [xb, y, zAt(xb)]])).join("");
  const bolts = screws([[xa + 3, 5, zAt(xa + 3) - 3], [xb - 3, 5, zAt(xb - 3) - 3]]);
  prismY(`think.chute${i}`, poly, -12, 5, { tone: "hi", crease: "lo" }, { extra: Ln(grooves, { tone: "lo" }) + bolts });
});

// ---------------------------------------------------------------- the queue lane (glass walls)
const LN = L.lane;
const floorTop = (x) => LN.zAt(x) - SEAT;
{
  const xa = LN.x0 - 1;
  const xb = LN.x1;
  const poly = [[xa, floorTop(xa)], [xb, floorTop(xb)], [xb, 83], [xa, 83]];
  const grooves = [-L.GROOVE, L.GROOVE].map((y) => path3([[xa, y, floorTop(xa)], [xb, y, floorTop(xb)]])).join("");
  const slots = [LN.gatePin, LN.holdPin].map((x) => k.planOutline({ x: x - 0.9, y: -0.9, w: 1.8, d: 1.8, r: 0.6 }, floorTop(x), P, 3)).join("");
  prismY("queue.floor", poly, -6, 6, { tone: "mid" }, { extra: Ln(grooves, { tone: "lo" }) + Ln(slots, { tone: "lo" }) });
  for (const x of [-80, -32]) {
    cyl("queue.post.collar", x, 0, 3.6, 0, 2.4, { tone: "mid" }, { steps: 24 });
    cyl("queue.post", x, 0, 2.1, 2.4, 80.6, { tone: "mid" }, { steps: 20, inner: Ln(k.sideArc(x, 0, 2.1, 40, P, 12), { tone: "faint" }) });
    cyl("queue.post.cap", x, 0, 3.4, 80.6, 83, { tone: "mid" }, { steps: 24 });
  }
}
function glass(name, y0, y1, front) {
  const xa = LN.x0 + 3;
  const xb = LN.x1 - 3;
  const poly = [[xa, floorTop(xa) + 9.5], [xb, floorTop(xb) + 9.5], [xb, floorTop(xb)], [xa, floorTop(xa)]];
  const paths = prismPaths(poly, y0, y1);
  const glint = front ? Ln(path3([[xa + 8, y1, floorTop(xa + 8) + 7.5], [xa + 22, y1, floorTop(xa + 22) + 7.5]]), { tone: "faint", className: "tcm-glint" }) : "";
  const svg = `<g class="tcm-glass"><path class="tcm-pane" d="${paths.fill}"/>${Ln(paths.crease, { tone: "faint" })}${glint}${Ln(paths.outline, { tone: "lo" })}</g>`;
  put(name, [(xa + xb) / 2, (y0 + y1) / 2, floorTop((xa + xb) / 2) + 4], svg, [R.solid(prismShape(name, poly, y0, y1, { owner: name }))]);
  const cap = [[xa, floorTop(xa) + 9.5], [xb, floorTop(xb) + 9.5], [xb, floorTop(xb) + 10.6], [xa, floorTop(xa) + 10.6]];
  prismY(`${name}.cap`, cap, y0 - 0.3, y1 + 0.3, { tone: "mid", crease: "none" }, { owner: name });
  for (const [x0, x1] of [[xa - 1.6, xa], [xb, xb + 1.6]]) {
    const z0 = floorTop(x1);
    const tall = x0 === xb ? 17 : 10.6;
    box(`${name}.clip`, [x0, y0 - 0.4, z0], [x1, y1 + 0.4, z0 + tall], { tone: "mid" }, { r: 0.2, steps: 2, owner: name, extra: front ? screws([[(x0 + x1) / 2, y1 + 0.4, z0 + 5.3]], 0.4) : "" });
  }
}
glass("queue.glass.back", -6, -5.2, false);
glass("queue.glass.front", 5.2, 6, true);
{
  // the hardware gate: a portal over the lane's end that carries the gate's escapement
  const x0 = LN.x1 - 3;
  const z0 = floorTop(x0 + 1.6);
  box("queue.gate.bar", [x0, -4.8, z0 + 15], [x0 + 1.6, 4.8, z0 + 17], { tone: "mid" }, { r: 0.2, steps: 2 });
  box("queue.gate.housing", [x0 - 0.8, -3.2, z0 + 17], [x0 + 2.4, 3.2, z0 + 20.4], { tone: "mid" }, { r: 0.6, steps: 3, bevel: 0.3, extra: screws([[x0 + 0.8, 0, z0 + 20.4]], 0.5) });
}

// ---------------------------------------------------------------- the doing staircase: four flights
const ST = L.stairs;
const flights = ST.flights.reduce((list, count) => {
  const from = list.length ? list[list.length - 1].to + 1 : 0;
  list.push({ from, to: from + count - 1 });
  return list;
}, []);
for (let j = 0; j < ST.steps; j++) {
  const x = ST.treadX(j);
  const z = ST.treadZ(j);
  const slots = [ST.holdPin, ST.frontPin].map((dx) => k.planOutline({ x: x + dx - 0.9, y: -0.9, w: 1.8, d: 1.8, r: 0.6 }, z, P, 3)).join("");
  box(`stairs.tread${j}`, [x, -6, z - 3], [x + ST.tread, 6, z], { tone: "hi", crease: "lo" }, { r: 0.4, steps: 2, bevel: 0.4, extra: Ln(slots, { tone: "lo" }) });
}
flights.forEach((f, index) => {
  const xa = ST.treadX(f.from) - 1.5;
  const xb = ST.treadX(f.to) + ST.tread + 1.5;
  const top = (x) => ST.treadZ(f.from) + 1.5 - ((x - ST.treadX(f.from)) * 5) / ST.tread;
  const poly = [[xa, top(xa)], [xb, top(xb)], [xb, top(xb) - 12], [xa, top(xa) - 12]];
  for (const [side, y0, y1] of [["back", -8, -6], ["front", 6, 8]]) {
    const housing = [];
    for (let j = f.from; j <= f.to; j++) housing.push([ST.treadX(j) + ST.tread / 2, 8, top(ST.treadX(j) + ST.tread / 2) - 4.2]);
    const bolts = side === "front" ? screws([[xa + 3, 8, top(xa + 3) - 9], [xb - 3, 8, top(xb - 3) - 9], ...housing]) : "";
    prismY(`stairs.flight${index}.${side}`, poly, y0, y1, { tone: "mid" }, { extra: bolts });
  }
  const posts = f.to - f.from >= 3 ? [xa + (xb - xa) * 0.25, xa + (xb - xa) * 0.75] : [(xa + xb) / 2];
  posts.forEach((xc) => {
    const bottom = (x) => top(x) - 12;
    const zb = bottom(xc + 3.5) - 2.5;
    prismY(`stairs.flight${index}.crossbar`, [[xc - 3.5, bottom(xc - 3.5)], [xc + 3.5, bottom(xc + 3.5)], [xc + 3.5, zb], [xc - 3.5, zb]], -8, 8, { tone: "mid" });
    cyl(`stairs.flight${index}.collar`, xc, 0, 3.4, 0, 2.4, { tone: "mid" }, { steps: 24 });
    cyl(`stairs.flight${index}.post`, xc, 0, 1.9, 2.4, zb, { tone: "mid" }, { steps: 20 });
  });
});
{
  const F = G.frameOf([L.funnel.x, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const void_ = `<path class="tcm-void" d="${G.circleOf(F, 5, 4.4, P, 40)}"/>`;
  const shape = R.solid(A.ring(F, 0, 5, 4.4, L.funnel.r, { name: "stairs.funnel" }));
  put("stairs.funnel", [L.funnel.x, 0, 2.5], S(G.ringBand(0, 5, 4.4, L.funnel.r, F, P), { tone: "mid" }) + void_ + Ln(G.circleOf(F, 5, 4.4, P, 40), { tone: "lo" }), [shape]);
}

// ---------------------------------------------------------------- the doing clock: a regulator on a tower
const TW = L.tower;
{
  const pl = TW.plinth;
  box("tower.plinth", [pl.x, pl.y, 0], [pl.x + pl.w, pl.y + pl.d, 8], { tone: "mid" }, { r: pl.r, steps: 4, bevel: 1, extra: screws(k.corners(pl, 4).map(([x, y]) => [x, y, 8])) + Ln(k.planOutline(k.insetPlan(pl, 3), 8, P, 4), { tone: "faint" }) });
  for (const [side, x0, x1] of [["left", 238, 245], ["right", 299, 306]]) {
    const [b0, b1] = side === "left" ? [x0 - 1.2, x1] : [x0, x1 + 1.2];
    box(`tower.post.${side}.base`, [b0, -17.2, 8], [b1, -6.8, 14], { tone: "mid" }, { r: 0.8, bevel: 0.5 });
    box(`tower.post.${side}`, [x0, -16, 14], [x1, -8, 168], { tone: "mid" }, { r: 0.8, inner: Ln([60, 110].map((z) => k.sideSeam({ x: x0, y: -16, w: x1 - x0, d: 8, r: 0.8 }, z, P, 3)).join(""), { tone: "faint" }) });
    box(`tower.post.${side}.cap`, [b0, -17.2, 168], [b1, -6.8, 176], { tone: "mid" }, { r: 0.8, bevel: 0.5 });
  }
  const seams = [40, 80, 120].map((z) => path3([[245, -12, z], [299, -12, z]])).join("");
  box("tower.board", [245, -16, 8], [299, -12, 176], { tone: "mid" }, { r: 0, steps: 1, extra: Ln(seams, { tone: "faint" }) + screws([[249, -12, 12], [295, -12, 12], [249, -12, 172], [295, -12, 172]]) });
  box("tower.hood", [234, -20, 176], [310, 8, 184], { tone: "mid" }, { r: 1.2, bevel: 0.8, inner: Ln(k.sideSeam({ x: 234, y: -20, w: 76, d: 28, r: 1.2 }, 179, P, 3), { tone: "faint" }), extra: screws([[238, 4, 184], [306, 4, 184]]) });
  box("tower.cornice", [238, -18, 184], [306, 6, 188], { tone: "mid" }, { r: 1, bevel: 0.6, extra: Ln(k.planOutline({ x: 244, y: -13, w: 56, d: 14, r: 1 }, 188, P, 3), { tone: "faint" }) + screws([[247, -10, 188], [297, 3, 188]]) });
  // the movement, its dial (one step a beat) and the escapement
  const plateJoin = path3([[290, -4, 116], [290, -4, 170], [254, -4, 170]]);
  box("tower.movement", [254, -12, 116], [290, 2, 170], { tone: "mid" }, { r: 0, steps: 1, bevel: 0.6, inner: Ln(plateJoin, { tone: "faint" }), extra: screws([[257, 2, 119], [287, 2, 119], [257, 2, 167], [287, 2, 167]]) });
  const D = TW.dial;
  const F = FY(D[0], D[1]);
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const long = i % 5 === 0;
    ticks.push({ long, d: k.pathOf([at(G.pointOf(F, 3.4, 13, a)), at(G.pointOf(F, 3.4, long ? 10.4 : 11.8, a))]) });
  }
  const hand = `<g data-live="doing-hand" transform="${SC.doingHand(still)}">${Ln(path3([[D[0], 3.5, D[1] - 2.4], [D[0], 3.5, D[1] + 11]]), { tone: "hi", free: true })}</g>`;
  discY("tower.dial", D[0], D[1], 2, 3.4, 14.6, { tone: "hi", crease: "lo" }, {
    extra:
      Ln(G.circleOf(F, 3.4, 13, P, 72) + G.circleOf(F, 3.4, 8.6, P, 48), { tone: "lo" }) +
      Ln(ticks.filter((t) => !t.long).map((t) => t.d).join(""), { tone: "lo" }) +
      Ln(ticks.filter((t) => t.long).map((t) => t.d).join(""), { tone: "mid" }) +
      hand +
      Dots([at([D[0], 3.5, D[1]])], { size: 1, tone: "hi" }),
  });
  // escape wheel: 15 teeth, turns half a tooth a beat
  const Wc = TW.wheel;
  const WF = FY(Wc[0], Wc[1]);
  const teeth = [];
  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * Math.PI * 2;
    teeth.push(k.pathOf([at(G.pointOf(WF, 3.2, 5.2, a)), at(G.pointOf(WF, 3.2, 7.4, a + 0.16)), at(G.pointOf(WF, 3.2, 6.2, a + 0.42))]));
  }
  const spokes = G.spokesOf(WF, 3.2, 1.6, 4.6, 5, P);
  discY("tower.wheel", Wc[0], Wc[1], 2, 3.2, 6.2, { tone: "mid" }, { extra: `<g data-live="wheel" transform="${SC.wheel(still)}">${Ln(G.circleOf(WF, 3.2, 5.2, P, 40), { tone: "lo" })}${Ln(teeth.join(""), { tone: "hi" })}${Ln(spokes, { tone: "lo" })}</g>` + Dots([at([Wc[0], 3.2, Wc[1]])], { size: 0.6 }) });
  // the anchor rocks with the pendulum; drawn flat on its arbor plane
  const piv = SC.PIV.anchor;
  const anchorPoly = [[-1.6, 1.8], [1.6, 1.8], [6.4, -4.2], [5.2, -5.6], [0, -1.6], [-5.2, -5.6], [-6.4, -4.2]].map(([x, z]) => [piv[0] + x, piv[2] + z]);
  const anchorShape = R.solid(prismShape("tower.anchor", [[piv[0] - 6.4, piv[2] - 5.6], [piv[0] + 6.4, piv[2] - 5.6], [piv[0] + 6.4, piv[2] + 1.8], [piv[0] - 6.4, piv[2] + 1.8]], 3.2, 4.4));
  const anchorSvg = `<path class="iso-fill" d="${path3(anchorPoly.map(([x, z]) => [x, 4.4, z]), true)}"/><path class="iso-shade" data-shade="1" d="${path3(anchorPoly.map(([x, z]) => [x, 4.4, z]), true)}"/>${Ln(path3(anchorPoly.map(([x, z]) => [x, 4.4, z]), true), { tone: "hi" })}`;
  put("tower.anchor", [piv[0], 3.8, piv[2] - 2], `<g data-live="anchor" transform="${SC.anchor(still)}">${anchorSvg}</g>`, [anchorShape]);
  discY("tower.arbor", piv[0], piv[2], 4.4, 6.6, 1.3, { tone: "mid" });
  // the robots pawl: a second click that drops into the escape wheel
  const pw = SC.PIV.pawl;
  discY("tower.pawl.boss", pw[0], pw[2], 2, 3.4, 1.6, { tone: "mid" });
  const pawlPoly = [[pw[0] - 0.9, pw[2] + 0.9], [pw[0] - 9.6, pw[2] - 4.6], [pw[0] - 9.2, pw[2] - 6.2], [pw[0] + 0.9, pw[2] - 0.9]];
  const pawlTurn = (34 * Math.PI) / 180;
  const pawlRest = pawlPoly.map(([x, z]) => [pw[0] + (x - pw[0]) * Math.cos(pawlTurn) - (z - pw[2]) * Math.sin(pawlTurn), pw[2] + (x - pw[0]) * Math.sin(pawlTurn) + (z - pw[2]) * Math.cos(pawlTurn)]);
  const pawlShape = R.solid(prismShape("tower.pawl", pawlRest, 3.4, 4.4, { owner: "pawl" }));
  put("tower.pawl", [pw[0] - 4, 3.9, pw[2] - 2.5], `<g data-live="pawl" transform="${SC.pawl(0)}">${S(prismPaths(pawlPoly, 3.4, 4.4), { tone: "mid" })}</g>`, [pawlShape]);
  // the pendulum: the one lit part
  const pv = TW.pivot;
  const rod = [[pv[0] - 1, TW.bob], [pv[0] + 1, TW.bob], [pv[0] + 1, pv[2] + 1.2], [pv[0] - 1, pv[2] + 1.2]];
  const pointer = [[pv[0] - 0.5, 22.4], [pv[0] + 0.5, 22.4], [pv[0] + 0.5, TW.bob - 8], [pv[0] - 0.5, TW.bob - 8]];
  const BF = FY(pv[0], TW.bob);
  const nut = FY(pv[0], TW.bob - 10.6);
  const pendulum =
    S(prismPaths(rod, 6.6, 8), { tone: "hi", lit: true, crease: "none" }) +
    S(prismPaths(pointer, 6.8, 7.8), { tone: "hi", lit: true, crease: "none" }) +
    S(G.disc(5.2, 9.4, 9.2, BF, P), { tone: "hi", lit: true }) +
    S(G.disc(6.2, 8.4, 2.2, nut, P), { tone: "hi", lit: true }) +
    Ln(G.circleOf(BF, 9.4, 6.4, P, 48), { tone: "lit" }) +
    S(G.disc(8, 9.2, 1.9, FY(pv[0], pv[2]), P), { tone: "hi", lit: true });
  const pendShapes = [
    R.solid(prismShape("tower.pendulum", rod, 6.6, 8, { owner: "pendulum" })),
    R.solid(prismShape("tower.pendulum", pointer, 6.8, 7.8, { owner: "pendulum" })),
    R.solid(A.disc(BF, 5.2, 9.4, 9.2, { name: "tower.pendulum", owner: "pendulum" })),
    R.solid(A.disc(nut, 6.2, 8.4, 2.2, { name: "tower.pendulum", owner: "pendulum" })),
    R.solid(A.disc(FY(pv[0], pv[2]), 8, 9.2, 1.9, { name: "tower.pendulum", owner: "pendulum" })),
  ];
  put("tower.pendulum", [pv[0], 7.3, 80], `<g data-live="pendulum" transform="${SC.pendulum(still)}">${pendulum}</g>`, pendShapes, { bias: 0.5 });
  // the beat plate under the pointer, with its scale
  box("tower.beat", [258, -12, 8], [286, 4.6, 19], { tone: "mid" }, { r: 0.8, bevel: 0.5 });
  const strip = { x: 260, y: 1.6, w: 24, d: 3, r: 0.4 };
  const t = k.topTicks(strip.x + 2, strip.x + strip.w - 2, 2, 5, strip.y, 19.6, [1, 1.8], P);
  const shape = R.solid(A.slab(strip, 19, 0.6, { name: "tower.beat.scale" }, 2));
  put("tower.beat.scale", [272, 3, 19.3], S(k.slabOf(strip, 19, 0.6, P, 2), { tone: "lo", crease: "none" }) + Ln(t.minor, { tone: "lo" }) + Ln(t.major, { tone: "mid" }), [shape]);
}

// ---------------------------------------------------------------- controls: the AI lever, the gauge, the robots switch
{
  const pv = SC.PIV.lever;
  box("control.lever.foot", [pv[0] - 15, 25, 0], [pv[0] + 15, 35, 4], { tone: "mid" }, { r: 1, bevel: 0.5, extra: screws([[pv[0] - 12, 30, 4], [pv[0] + 12, 30, 4]]) });
  const arc = (r, from, to, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
    const a = (from + ((to - from) * i) / n) * (Math.PI / 180);
    return [pv[0] - r * Math.sin(a), pv[2] + r * Math.cos(a)];
  });
  const sector = [[pv[0] + 9, 4], ...arc(31, -48, 48).reverse().reverse(), [pv[0] - 9, 4]];
  const hull = G.hullOf(sector);
  const scale = path3(arc(27.5, -44, 44, 40).map(([x, z]) => [x, 31, z]));
  const detents = [0, 1, 2, 3].map((u) => {
    const a = (36 - 24 * u) * (Math.PI / 180);
    return path3([[pv[0] - 27.5 * Math.sin(a), 31, pv[2] + 27.5 * Math.cos(a)], [pv[0] - 23.4 * Math.sin(a), 31, pv[2] + 23.4 * Math.cos(a)]]);
  });
  const notches = [0, 1, 2, 3].map((u) => {
    const a = (36 - 24 * u) * (Math.PI / 180);
    return at([pv[0] - 29.6 * Math.sin(a), 31, pv[2] + 29.6 * Math.cos(a)]);
  });
  prismY("control.lever.quadrant", hull, 28, 31, { tone: "mid" }, { extra: Ln(scale, { tone: "lo" }) + Ln(detents.join(""), { tone: "mid" }) + Dots(notches, { size: 0.7, tone: "hi" }) });
  discY("control.lever.boss", pv[0], pv[2], 31, 33, 3.4, { tone: "mid" });
  const arm = [[pv[0] - 1.5, pv[2] - 2.5], [pv[0] + 1.5, pv[2] - 2.5], [pv[0] + 1.2, pv[2] + 31.5], [pv[0] - 1.2, pv[2] + 31.5]];
  const knobAt = [pv[0], 34, pv[2] + 34.2];
  const leverSvg = S(prismPaths(arm, 33, 35), { tone: "mid" }) + S(G.sphereOf(knobAt, 3.6, P), { tone: "hi", className: "tcm-ball" }) + Dots([at([pv[0], 35, pv[2]])], { size: 0.7, tone: "hi" });
  const rot = (p, theta) => [pv[0] + (p[0] - pv[0]) * Math.cos(theta) - (p[1] - pv[2]) * Math.sin(theta), pv[2] + (p[0] - pv[0]) * Math.sin(theta) + (p[1] - pv[2]) * Math.cos(theta)];
  const theta = SC.leverAngle(2);
  const knobRest = rot([knobAt[0], knobAt[2]], theta);
  const leverShapes = [R.solid(prismShape("control.lever.arm", arm.map((p) => rot(p, theta)), 33, 35, { owner: "lever" })), R.solid(A.ball([knobRest[0], 34, knobRest[1]], 3.6, { name: "control.lever.arm", owner: "lever" }))];
  put("control.lever.arm", [pv[0], 34, pv[2] + 16], `<g data-live="lever" transform="${SC.lever(2)}">${leverSvg}</g>`, leverShapes, { bias: 0.3 });
}
{
  // the program-length gauge: today = 1.0 at the left, shorter to the right
  const g = SC.PIV.gauge;
  const vents = [0, 1, 2].map((i) => k.planOutline({ x: g[0] - 13 + i * 9, y: 29, w: 6, d: 6, r: 1 }, 40, P, 3)).join("");
  box("control.gauge.case", [g[0] - 37, 26, 0], [g[0] + 37, 38, 40], { tone: "mid" }, { r: 1.6, steps: 4, bevel: 0.8, extra: Ln(vents, { tone: "lo" }) + screws([[g[0] - 34, 38, 37], [g[0] + 34, 38, 37], [g[0] - 34, 38, 3], [g[0] + 34, 38, 3]]) });
  const value = (v) => SC.needleAngle(v);
  const R0 = 28;
  const pointAt = (r, v) => {
    const a = value(v);
    return [g[0] - r * Math.sin(a), 39.4, g[2] + r * Math.cos(a)];
  };
  const arc = Array.from({ length: 49 }, (_, i) => pointAt(R0, 1 - (i / 48) * 0.6));
  const minor = [];
  const major = [];
  for (let i = 0; i <= 12; i++) {
    const v = 1 - i * 0.05;
    (i % 2 === 0 ? major : minor).push(path3([pointAt(R0, v), pointAt(i % 2 === 0 ? R0 - 4.4 : R0 - 2.6, v)]));
  }
  const fine = [];
  for (let i = 0; i <= 60; i++) if (i % 5) fine.push(path3([pointAt(R0, 1 - i * 0.01), pointAt(R0 - 1.3, 1 - i * 0.01)]));
  const zero = path3([pointAt(R0, 1), pointAt(R0 - 6.4, 1)]);
  const marks = ["plateau", "exponential", "recursive"].map((d) => at(pointAt(R0 + 2.4, M.lengthOf(d)))).concat([at(pointAt(R0 + 2.4, M.lengthOf("recursive", true)))]);
  const face = { x: g[0] - 33, y: 38, w: 66, d: 1.4, r: 0.6 };
  const needle = `<g data-live="needle" transform="${SC.needle(M.lengthOf("exponential"))}">${Ln(path3([[g[0], 39.6, g[2] - 3.6], [g[0], 39.6, g[2] + R0 - 1.6]]), { tone: "hi", free: true })}</g>`;
  const shape = R.solid(A.slab(face, 2.4, 34.2, { name: "control.gauge.face" }, 2));
  put(
    "control.gauge.face",
    [g[0], 38.7, 18],
    S(k.slabOf(face, 2.4, 34.2, P, 2), { tone: "hi", crease: "lo" }) +
      Ln(path3(arc), { tone: "lo" }) + Ln(fine.join(""), { tone: "faint" }) + Ln(minor.join(""), { tone: "lo" }) + Ln(major.join(""), { tone: "mid" }) + Ln(zero, { tone: "hi" }) +
      Dots(marks, { size: 0.7, tone: "hi" }) + needle,
    [shape],
  );
  discY("control.gauge.hub", g[0], g[2], 39.4, 40.8, 2.4, { tone: "mid" }, { extra: Dots([at([g[0], 40.8, g[2]])], { size: 0.55, tone: "hi" }) });
}
{
  // the robots switch
  box("control.robots.case", [244, 32, 0], [262, 44, 6], { tone: "mid" }, { r: 1, bevel: 0.5, extra: screws([[246.5, 34.5, 6], [259.5, 41.5, 6]]) });
  cyl("control.robots.nut", 253, 38, 3, 6, 7.2, { tone: "mid" }, { steps: 6 });
  cyl("control.robots.bushing", 253, 38, 1.8, 7.2, 9, { tone: "mid" }, { steps: 16 });
  const pv = SC.PIV.bat;
  const bat = [[pv[0] - 0.8, pv[2]], [pv[0] + 0.8, pv[2]], [pv[0] + 0.5, pv[2] + 9], [pv[0] - 0.5, pv[2] + 9]];
  const tip = [pv[0], 38, pv[2] + 10.2];
  const svg = S(prismPaths(bat, 37.2, 38.8), { tone: "mid" }) + S(G.sphereOf(tip, 1.4, P, { steps: 24 }), { tone: "hi", className: "tcm-ball" });
  const theta = (22 * Math.PI) / 180;
  const rot = (p) => [pv[0] + (p[0] - pv[0]) * Math.cos(theta) - (p[1] - pv[2]) * Math.sin(theta), pv[2] + (p[0] - pv[0]) * Math.sin(theta) + (p[1] - pv[2]) * Math.cos(theta)];
  const t2 = rot([tip[0], tip[2]]);
  put("control.robots.bat", [pv[0], 38, pv[2] + 5], `<g data-live="bat" transform="${SC.bat(0)}">${svg}</g>`, [R.solid(prismShape("control.robots.bat", bat.map(rot), 37.2, 38.8, { owner: "bat" })), R.solid(A.ball([t2[0], 38, t2[1]], 1.4, { name: "control.robots.bat", owner: "bat" }))]);
}

// ---------------------------------------------------------------- slots for the moving marbles, cups and pins
const stillMarbles = MC.marblesOf(still);
const pinsAll = SC.pinsOf(still);
function slotMarkup(name) {
  const marbles = stillMarbles.filter((m) => m.slot === name).sort((a, b) => G.dot3(a.p, V) - G.dot3(b.p, V));
  const pins = pinsAll.map((p, i) => ({ ...p, i })).filter((p) => (name === "queue" ? p.flight === "queue" : name === `flight${p.flight}`));
  const pinSvg = pins.map((p) => `${p.d ? `<path class="iso-line" data-tone="mid" data-pin="${p.i}" d="${p.d}"/>` : `<path class="iso-line" data-tone="mid" data-pin="${p.i}"/>`}<circle class="tcm-pincap" data-pincap="${p.i}" cx="${p.cap[0].toFixed(2)}" cy="${p.cap[1].toFixed(2)}" r="${p.top ? 0.62 : 0}"/>`).join("");
  return `<g data-slot="${name}">${pinSvg}<g data-marbles="">${marbles.map((m) => marbleAt(m.p, m.alpha ?? 1)).join("")}</g></g>`;
}
// lift: the cups and the marbles they carry, in the plane in front of the chain
{
  const ref = SC.cupRef;
  const ledge = { x: ref[0] - 8.8, y: -5.2, w: 8.8, d: 7.8, r: 0.4 };
  const lip = { x: ref[0] - 8.8, y: -5.2, w: 1.3, d: 7.8, r: 0.3 };
  const cup = S(k.slabOf(ledge, ref[2] - MR - 1.2, 1.2, P, 2), { tone: "mid" }) + S(k.slabOf(lip, ref[2] - MR, 2.6, P, 2), { tone: "mid" });
  const cups = SC.cupsOf(still);
  const inner = cups.map((c, i) => `<g data-cup="${i}" transform="${c.move}">${cup}</g>`).join("") +
    `<g data-cupmarbles="">${cups.map((c, i) => `<g data-cupmarble="${i}" transform="${c.marble}"${c.loaded ? "" : ' display="none"'}>${MARBLE}</g>`).join("")}</g>`;
  const shape = R.solid(A.box([XE - 16.2, -3.6, 1.8], [XE + 12, 3.6, 140.4], { name: "lift.cups", owner: "cups", limp: true }));
  put("lift.cups", [XE, 0, 70], `<g data-slot="lift">${inner}</g>`, [shape]);
}
L.chutes.forEach((c, i) => {
  const xa = c.x0 - 3;
  const xb = c.x1 + 1;
  const zAt = (x) => c.z0 + ((x - c.x0) / (c.x1 - c.x0)) * (c.z1 - c.z0) - SEAT;
  const poly = [[xa, zAt(xa) + 2 * MR], [xb, zAt(xb) + 2 * MR], [xb, zAt(xb)], [xa, zAt(xa)]];
  put(`think.chute${i}.run`, [(xa + xb) / 2, 0, zAt((xa + xb) / 2) + MR], slotMarkup(`chute${i}`), [R.solid(prismShape(`think.chute${i}.run`, poly, -MR, MR, { owner: "marbles" }))]);
});
{
  const xa = LN.x0 + 3;
  const xb = LN.x1;
  const poly = [[xa, floorTop(xa) + 2 * MR], [xb, floorTop(xb) + 2 * MR], [xb, floorTop(xb)], [xa, floorTop(xa)]];
  put("queue.run", [(xa + xb) / 2, 0, floorTop((xa + xb) / 2) + MR], slotMarkup("queue"), [R.solid(prismShape("queue.run", poly, -MR, MR, { owner: "marbles" }))]);
}
flights.forEach((f, index) => {
  const shapes = [];
  for (let j = f.from; j <= f.to; j++) shapes.push(R.solid(A.box([ST.treadX(j) + 0.2, -MR, ST.treadZ(j)], [ST.treadX(j) + ST.tread - 0.2, MR, ST.treadZ(j) + 2 * MR], { name: `stairs.flight${index}.run`, owner: "marbles" })));
  const mid = (ST.treadX(f.from) + ST.treadX(f.to) + ST.tread) / 2;
  put(`stairs.flight${index}.run`, [mid, 0, (ST.treadZ(f.from) + ST.treadZ(f.to)) / 2 + MR], slotMarkup(`flight${index}`), shapes);
});
put("stairs.funnel.run", [L.funnel.x - 2, 0, 16], slotMarkup("funnel"), [R.solid(A.box([ST.treadX(12) + ST.tread + 0.4, -MR, 5], [L.funnel.x + 3, MR, 28], { name: "stairs.funnel.run", owner: "marbles" }))]);

// ---------------------------------------------------------------- order, page, svg, fragment
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
const body = [halo, `<defs><g id="tcm-marble">${MARBLE}</g></defs>`, ...R.items.map((item) => `<g class="it" data-name="${item.name}">${item.svg}</g>`)];

const LABEL =
  "A bench-top marble machine with two clocks. On the left a small, fast clock movement with a flyball governor drives a chain lift that carries marbles from a hopper to three short chutes on a pegboard: requirements, design and software. The marbles wait in a glass-walled lane, then a long four-flight staircase lets them down one step per swing of a big, slow pendulum clock: fabrication, integration and test, qualification and launch. Lengths follow each stage's share of a space program's critical path. The AI lever on the front sets the governor; a gauge reads the program's length against today.";
const svgInner = k.figureSvg({ width: W, height: H, label: LABEL, body });

const TOKENS = `--anatomy-page:#08090B;--anatomy-card:#0C0E11;--anatomy-paper:#0C0E11;--anatomy-lit:#22CFFF;`;
const FIG_CSS = `
.iso{${TOKENS}}
.tcm-glass .tcm-pane{fill:var(--anatomy-hi);fill-opacity:.035;stroke:none}
.tcm-void{fill:var(--anatomy-halo);stroke:none}
.tcm-pincap{fill:var(--anatomy-dot);opacity:.7;stroke:none}
.tcm-glint-dot{fill:var(--anatomy-hi);opacity:.85;stroke:none}
.tcm-marble,.tcm-ball{--anatomy-paper:#16191e;--anatomy-shade-0:#16191e;--anatomy-shade-1:#1d2026;--anatomy-shade-2:#262a31;--anatomy-shade-3:#30353d}
.tcm-stage{position:relative;outline:none;touch-action:pan-y;cursor:ew-resize}
.tcm-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
.tcm-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:560px){.tcm-stage{overflow:hidden;margin:0 -12px}.tcm-stage .iso-svg{width:118%;margin:-2% -9% -4%}}
`;

// The kit CSS, scoped to one wrapper so it cannot reach the host page.
function scopeCss(css, scope) {
  const out = [];
  let i = 0;
  const rule = (selectors, block) =>
    `${selectors
      .split(",")
      .map((s) => s.trim())
      .map((s) => (s.startsWith(".iso") && /^\.iso(?![\w-])/.test(s) ? `${scope}${s}` : `${scope} ${s}`))
      .join(",")}{${block}}`;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) break;
    const head = css.slice(i, open).trim();
    if (head.startsWith("@keyframes")) {
      let depth = 1;
      let j = open + 1;
      while (depth && j < css.length) (css[j] === "{" ? depth++ : css[j] === "}" ? depth-- : 0), j++;
      out.push(css.slice(i, j).trim().replace(/@keyframes\s+([\w-]+)/, (m, name) => `@keyframes tcm-${name}`));
      i = j;
    } else if (head.startsWith("@media")) {
      let depth = 1;
      let j = open + 1;
      while (depth && j < css.length) (css[j] === "{" ? depth++ : css[j] === "}" ? depth-- : 0), j++;
      out.push(`${head}{${scopeCss(css.slice(open + 1, j - 1), scope)}}`);
      i = j;
    } else {
      const close = css.indexOf("}", open);
      out.push(rule(head, css.slice(open + 1, close)));
      i = close + 1;
    }
  }
  return out.join("\n").replace(/animation:\s*iso-/g, "animation:tcm-iso-");
}
const SCOPED = scopeCss(k.ISO_CSS + FIG_CSS, ".tcm");

// Inline the pure modules as private scopes.
function moduleOf(file, name, uses = "") {
  const src = readFileSync(join(file), "utf8").replace(/^import .*$/gm, "");
  const names = [...src.matchAll(/^export\s+(?:const|function|let)\s+([\w$]+)/gm)].map((m) => m[1]);
  return `const ${name} = (() => {${uses}\n${src.replace(/^export\s+/gm, "")}\nreturn { ${names.join(", ")} };\n})();\n`;
}
const latheSrc = readFileSync("/Users/alex/.claude/skills/anatomy/kit/lathe.mjs", "utf8").replace(/^import .*$/gm, "");
const latheNames = [...latheSrc.matchAll(/^export\s+(?:const|function)\s+([\w$]+)/gm)].map((m) => m[1]);
const G_SCRIPT = `const G = (() => {${latheSrc.replace(/^export\s+/gm, "")}\nreturn { ${latheNames.join(", ")} };\n})();\n`;
const LIVE = readFileSync(join(HERE, "live.js"), "utf8");
const DATA = { P, W, H, detents: M.DETENTS };
const SCRIPT =
  "(() => {\n" +
  kitScript() +
  G_SCRIPT +
  moduleOf(join(HERE, "model.mjs"), "MODEL") +
  moduleOf(join(HERE, "machine.mjs"), "MACH", "const { blendOf, timingOf, MACHINE } = MODEL;") +
  moduleOf(join(HERE, "scene.mjs"), "SCENE") +
  `const DATA = ${JSON.stringify(DATA)};\n` +
  LIVE +
  "\n})();";

const start = M.stateOf("exponential");
const plate = k.plateHtml({
  fig: "Fig 2",
  title: "Two clocks",
  hint: "Drag lever · 1–4 scenario · R robots",
  readout: M.readoutOf(start),
  keys: [
    { mark: "lit", label: "The slow clock: each swing and back lets every marble down one step" },
    { mark: "raised", label: "Thinking chutes and doing flights, lengths in proportion to today's critical path" },
  ],
  caption:
    "Thinking (requirements, design, software) is 35% of a hardware program's critical path; doing (fabrication, integration and test, qualification, launch) is 65%. The lever sets the thinking speedups by 2031 from the model's Amdahl table: 2× on a plateau, 5–10× exponential, 20–50× recursive. Doing speeds up only 1.0–1.5×, so programs get 18%, 38% and 51% shorter, and solved problems pile up at the hardware gate: under Exponential in 2029, 122 of 155 math and physics-model nodes have reached their earliest year, but only 44 of 167 hardware nodes. The robots switch is a fit to the model's ceiling for a robot-first firm (about 57% shorter), not a row of the table.",
  body: `<div class="iso-stage tcm-stage" tabindex="0" role="slider" aria-label="Two clocks marble machine. Keys 1 to 4 set the AI lever to Today, Plateau, Exponential or Recursive; arrow keys step it; R toggles robots; drag sideways to move the lever." aria-valuemin="0" aria-valuemax="3" aria-valuenow="2" aria-valuetext="${M.readoutOf(start)}">${svgInner}<span class="tcm-sr" role="status" aria-live="polite" data-status></span></div>`,
});
const wrapper = (inner) => `<div class="tcm iso" data-theme="dark">${inner}</div>`;

// 1. the review page
const page = k
  .pageHtml({ title: "Two clocks", theme: "dark", body: wrapper(plate), script: SCRIPT })
  .replace("</style>", `${FIG_CSS}</style>`);
writeFileSync(join(HERE, `${SLUG}.html`), page);

// 2. the standalone still: no script, no external refs, styles embedded
const standalone = k.figureSvg({ width: W, height: H, label: LABEL, body, standalone: "dark" }).replace("</style>", `${FIG_CSS}</style>`);
writeFileSync(join(HERE, `${SLUG}.svg`), standalone);

// 3. the embeddable fragment: one wrapper, one scoped style, one IIFE
const fragment = `<!-- Two clocks marble machine: embeddable fragment. One instance per page. -->
<div class="tcm iso" data-theme="dark">
<style>
${SCOPED}
.tcm{background:transparent;color:var(--anatomy-text)}
.tcm .iso-plate-corner{font-family:var(--anatomy-mono)}
</style>
${plate}
<script>
${SCRIPT.replace(/<\/(script)/gi, "<\\/$1")}
</script>
</div>
`;
writeFileSync(join(HERE, `${SLUG}.fragment.html`), fragment);

const solids = R.solids.length;
console.log(`wrote ${SLUG}.html (${(page.length / 1024).toFixed(0)} KB), .svg (${(standalone.length / 1024).toFixed(0)} KB), .fragment.html · ${R.items.length} items · ${solids} solids · scale ${G.scaleOf(P).toFixed(3)}`);
console.log(`still: ${stillMarbles.length} marbles moving, queue ${still.marbles.filter((m) => m.where === "queue").length}, stairs ${still.marbles.filter((m) => m.where === "stair").length}`);
A.auditOrExit(R, P, {});
if (process.argv.includes("--count")) {
  const parts = R.solids.filter((s) => !/\.run$|^lift\.cups$|pile/.test(s.name ?? ""));
  console.log(`parts: ${parts.length} recorded solids (+ ${R.solids.filter((s) => /pile/.test(s.name ?? "")).length} hopper marbles, 14 lift cups, 28 escapement pins, 1 chain, moving marbles)`);
}

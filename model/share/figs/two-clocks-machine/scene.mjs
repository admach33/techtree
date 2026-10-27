// The moving parts as pure functions of the machine state: transforms, paths and small markup strings.
// The build calls them once for the still; the page calls them every frame and writes attributes.
// Dependencies are passed in, so the same file runs in Node and inlined in the page.
export function sceneOf({ P, k, G, MC }) {
  const L = MC.LAYOUT;
  const TAU = Math.PI * 2;
  const RAD = Math.PI / 180;
  const at = (p) => k.iso(p, P);
  const O = at([0, 0, 0]);
  const ex = k.axisVector(P, [1, 0, 0]);
  const ez = k.axisVector(P, [0, 0, 1]);
  const r3 = (v) => Math.round(v * 1000) / 1000;
  const r2 = (v) => Math.round(v * 100) / 100;
  const shift = (p) => {
    const s = at(p);
    return `translate(${r2(s[0] - O[0])} ${r2(s[1] - O[1])})`;
  };
  // A rotation by theta (radians, counter-clockwise as seen from the front) about a world pivot, for a
  // part that lies in an x-z plane: the screen affine A·R·A⁻¹ about the pivot's screen point.
  const det = ex[0] * ez[1] - ez[0] * ex[1];
  const inv = [ez[1] / det, -ez[0] / det, -ex[1] / det, ex[0] / det];
  function spin(pivot, theta) {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const r = [c * inv[0] - s * inv[2], c * inv[1] - s * inv[3], s * inv[0] + c * inv[2], s * inv[1] + c * inv[3]];
    const m = [ex[0] * r[0] + ez[0] * r[2], ex[0] * r[1] + ez[0] * r[3], ex[1] * r[0] + ez[1] * r[2], ex[1] * r[1] + ez[1] * r[3]];
    const q = at(pivot);
    const e = q[0] - (m[0] * q[0] + m[1] * q[1]);
    const f = q[1] - (m[2] * q[0] + m[3] * q[1]);
    return `matrix(${r3(m[0])} ${r3(m[2])} ${r3(m[1])} ${r3(m[3])} ${r2(e)} ${r2(f)})`;
  }

  const T = L.tower;
  const PIV = {
    pendulum: T.pivot,
    anchor: [T.pivot[0], 3.2, T.pivot[2]],
    wheel: [T.wheel[0], 3.2, T.wheel[1]],
    doingDial: [T.dial[0], 3.4, T.dial[1]],
    thinkDial: [L.lift.x, 5.2, 158],
    lever: [-196, 33, 10],
    gauge: [44, 39.4, 6],
    bat: [253, 38, 9],
    pawl: [287, 3.5, 130],
    sprocketTop: [L.lift.x, -5, L.lift.zt],
    sprocketBottom: [L.lift.x, -5, L.lift.zb],
  };

  const leverAngle = (u) => (36 - 24 * u) * RAD;
  const needleAngle = (length) => (50 - ((1 - length) / 0.6) * 100) * RAD;
  const pendulumAngle = (sim) => 6.5 * RAD * Math.sin(Math.PI * sim.phase);

  // the escapement pins: a vertical stub from its slot on the tread (or lane floor) up `h`
  const rise = ez;
  function pin(base, h) {
    const b = at(base);
    if (h < 0.15) return { d: "", top: null, cap: b };
    const t = [b[0] + rise[0] * h, b[1] + rise[1] * h];
    return { d: `M${r2(b[0])} ${r2(b[1])}L${r2(t[0])} ${r2(t[1])}`, top: t, cap: t };
  }
  const PIN_H = 2.6;
  function pinsOf(sim) {
    const exit = PIN_H * sim.pins;
    const hold = PIN_H * (1 - sim.pins);
    const out = [];
    for (let j = 0; j < 13; j++) {
      const x = L.stairs.treadX(j);
      const z = L.stairs.treadZ(j);
      out.push({ flight: L.stairs.flightOf(j), kind: "hold", ...pin([x + L.stairs.holdPin, 0, z], hold) });
      out.push({ flight: L.stairs.flightOf(j), kind: "exit", ...pin([x + L.stairs.frontPin, 0, z], exit) });
    }
    const gz = (x) => L.lane.zAt(x) - L.SEAT;
    out.push({ flight: "queue", kind: "hold", ...pin([L.lane.holdPin, 0, gz(L.lane.holdPin)], hold) });
    out.push({ flight: "queue", kind: "exit", ...pin([L.lane.gatePin, 0, gz(L.lane.gatePin)], exit) });
    return out;
  }

  // the lift chain's link pins and cups
  const LINKS = Math.round(MC.LOOP / 3.25);
  function linksOf(sim) {
    const list = [];
    for (let i = 0; i < LINKS; i++) {
      const { p } = MC.chainAt((i * MC.LOOP) / LINKS + sim.chain, 0);
      list.push(at([p[0], L.lift.yc, p[1]]));
    }
    return list;
  }
  const CUP_REF = MC.chainAt(0, 0); // left run, bottom, normal (-1, 0)
  const cupRef = [CUP_REF.p[0], -3, CUP_REF.p[1]];
  function cupsOf(sim) {
    return MC.cupsOf(sim).map((cup) => {
      const angle = Math.atan2(cup.at.n[1], cup.at.n[0]) - Math.PI;
      const there = at([cup.at.p[0], -3, cup.at.p[1]]);
      const here = at(cupRef);
      const move = `translate(${r2(there[0] - here[0])} ${r2(there[1] - here[1])}) ${spin(cupRef, angle)}`;
      return { move, loaded: cup.loaded, marble: shift(cup.marble) };
    });
  }

  // the flyball governor on the thinking movement
  const GOV = { x: L.lift.x, y: -6, z0: 174, top: 197 };
  function governorOf(sim) {
    const speed = sim.blend.thinkingSpeedup;
    const spread = Math.min(1, Math.log(speed) / Math.log(27));
    const reach = 5.2 + 6 * spread;
    const drop = 10.4 - 5.6 * spread;
    const sleeve = 180 + 4.4 * spread;
    const balls = [0, Math.PI].map((phase) => {
      const a = sim.governor + phase;
      const p = [GOV.x + reach * Math.cos(a), GOV.y + reach * Math.sin(a), GOV.top - drop - 3];
      return { p, depth: G.dot3(p, G.viewOf(P)), a };
    });
    return { balls, sleeve, reach };
  }
  function governorSvg(sim, solid, line, dots) {
    const { balls, sleeve } = governorOf(sim);
    const order = [...balls].sort((a, b) => a.depth - b.depth);
    const ballSvg = (ball) => {
      const top = [GOV.x + 1.2 * Math.cos(ball.a), GOV.y + 1.2 * Math.sin(ball.a), GOV.top];
      const low = [GOV.x + 2.2 * Math.cos(ball.a), GOV.y + 2.2 * Math.sin(ball.a), sleeve + 1];
      const arm = k.pathOf([at(top), at(ball.p)]);
      const link = k.pathOf([at(low), at(ball.p)]);
      return line(arm + link, { tone: "mid" }) + solid(G.sphereOf(ball.p, 2.8, P, { steps: 28 }), { tone: "hi", className: "tcm-ball" });
    };
    const spindle =
      solid(k.cylinder(GOV.x, GOV.y, 0.9, GOV.z0, GOV.top - GOV.z0 + 0.6, P, 16), { tone: "mid", crease: "none" }) +
      solid(k.cylinder(GOV.x, GOV.y, 2.3, sleeve, 2.2, P, 20), { tone: "mid" }) +
      solid(k.cylinder(GOV.x, GOV.y, 1.8, GOV.top, 1.8, P, 20), { tone: "mid" });
    return ballSvg(order[0]) + spindle + ballSvg(order[1]);
  }

  return {
    O,
    at,
    shift,
    spin,
    PIV,
    GOV,
    PIN_H,
    leverAngle,
    needleAngle,
    pendulumAngle,
    pinsOf,
    linksOf,
    cupsOf,
    cupRef,
    governorOf,
    governorSvg,
    pendulum: (sim) => spin(PIV.pendulum, pendulumAngle(sim)),
    anchor: (sim) => spin(PIV.anchor, pendulumAngle(sim) * 0.9),
    wheel: (sim) => spin(PIV.wheel, -sim.wheel),
    doingHand: (sim) => spin(PIV.doingDial, -sim.doingHand),
    thinkHand: (sim) => spin(PIV.thinkDial, -sim.thinkHand),
    sprocket: (sim, which) => spin(which === "top" ? PIV.sprocketTop : PIV.sprocketBottom, -sim.chain / L.lift.rc),
    lever: (u) => spin(PIV.lever, leverAngle(u)),
    needle: (length) => spin(PIV.gauge, needleAngle(length)),
    bat: (robots) => spin(PIV.bat, (22 - 44 * robots) * RAD),
    pawl: (robots) => spin(PIV.pawl, (34 - 34 * robots) * RAD),
  };
}

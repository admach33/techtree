// The live page. Runs inside one IIFE after the kit, G (lathe), MODEL, MACH, SCENE and DATA.
const P = DATA.P;
const root = (document.currentScript && document.currentScript.closest(".tcm")) || document.querySelector(".tcm");
if (root && !root.dataset.tcmLive) {
  root.dataset.tcmLive = "1";
  const kit = { iso, pathOf, cylinder, axisVector, solidSvg, lineSvg, dotsSvg };
  const SC = SCENE.sceneOf({ P, k: kit, G, MC: MACH });
  const V = G.viewOf(P);
  const stage = root.querySelector(".tcm-stage");
  const svg = stage.querySelector("svg");
  const readout = root.querySelector("[data-readout]");
  const status = root.querySelector("[data-status]");
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const q = (sel) => svg.querySelector(sel);
  const live = {};
  for (const name of ["pendulum", "anchor", "wheel", "doing-hand", "think-hand", "sprocket-top", "sprocket-bottom", "lever", "needle", "bat", "pawl", "governor", "links"]) live[name] = q(`[data-live="${name}"]`);
  const links = [...live.links.querySelectorAll("circle")];
  const cups = [...svg.querySelectorAll("[data-cup]")];
  const cupMarbles = [...svg.querySelectorAll("[data-cupmarble]")];
  const pinPaths = [...svg.querySelectorAll("[data-pin]")];
  const pinCaps = [...svg.querySelectorAll("[data-pincap]")];
  const slots = {};
  svg.querySelectorAll("[data-slot]").forEach((g) => {
    const box = g.querySelector("[data-marbles]");
    if (box) box.textContent = "";
    slots[g.dataset.slot] = box;
  });
  const MARBLE = q("#tcm-marble").innerHTML;
  const NS = "http://www.w3.org/2000/svg";
  const nodes = new Map();

  // ---- controls
  const lever = { x: 2, target: 2 };
  const bot = { x: 0, target: 0 };
  let sim = MACH.warmed(2, 0, 2.6);
  let dragging = null;
  let touring = !still.matches;
  let tourClock = 0;
  let tourStep = 0;
  let idle = 0;
  const TOUR = [
    [2, 0, 9],
    [3, 0, 7],
    [3, 1, 8],
    [0, 0, 12],
  ];

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const nearest = () => Math.round(clamp(lever.x, 0, 3));
  function textNow() {
    const robots = bot.x > 0.5;
    const s = MODEL.stateOf(MODEL.DETENTS[nearest()], robots);
    const b = MODEL.blendOf(lever.x, bot.x);
    const program = `program ${(1 / b.length).toFixed(1)}×`;
    return robots ? `${s.label} · doing ${s.doingRange} · ${program}` : `${s.label} · thinking ${s.thinkingRange} · ${program}`;
  }
  function describe() {
    const s = MODEL.stateOf(MODEL.DETENTS[Math.round(lever.target)], bot.target > 0.5);
    stage.setAttribute("aria-valuenow", String(Math.round(lever.target)));
    stage.setAttribute("aria-valuetext", `${MODEL.readoutOf(s)}, ${Math.round(s.shorter * 100)}% shorter than today`);
  }
  let announceTimer = 0;
  function announce() {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      if (status) status.textContent = textNow();
    }, 700);
  }

  // ---- drawing
  function render() {
    live.pendulum.setAttribute("transform", SC.pendulum(sim));
    live.anchor.setAttribute("transform", SC.anchor(sim));
    live.wheel.setAttribute("transform", SC.wheel(sim));
    live["doing-hand"].setAttribute("transform", SC.doingHand(sim));
    live["think-hand"].setAttribute("transform", SC.thinkHand(sim));
    live["sprocket-top"].setAttribute("transform", SC.sprocket(sim, "top"));
    live["sprocket-bottom"].setAttribute("transform", SC.sprocket(sim, "bottom"));
    live.lever.setAttribute("transform", SC.lever(lever.x));
    live.needle.setAttribute("transform", SC.needle(MODEL.blendOf(lever.x, bot.x).length));
    live.bat.setAttribute("transform", SC.bat(bot.x));
    live.pawl.setAttribute("transform", SC.pawl(bot.x));
    live.governor.innerHTML = SC.governorSvg(sim, solidSvg, lineSvg, dotsSvg);
    SC.linksOf(sim).forEach(([x, y], i) => {
      links[i].setAttribute("cx", x.toFixed(2));
      links[i].setAttribute("cy", y.toFixed(2));
    });
    SC.cupsOf(sim).forEach((c, i) => {
      cups[i].setAttribute("transform", c.move);
      if (c.loaded) {
        cupMarbles[i].removeAttribute("display");
        cupMarbles[i].setAttribute("transform", c.marble);
      } else cupMarbles[i].setAttribute("display", "none");
    });
    SC.pinsOf(sim).forEach((p, i) => {
      if (p.d) pinPaths[i].setAttribute("d", p.d);
      else pinPaths[i].removeAttribute("d");
      pinCaps[i].setAttribute("cx", p.cap[0].toFixed(2));
      pinCaps[i].setAttribute("cy", p.cap[1].toFixed(2));
      pinCaps[i].setAttribute("r", p.top ? "0.62" : "0");
    });
    const seen = new Set();
    const bySlot = {};
    for (const m of MACH.marblesOf(sim)) {
      seen.add(m.id);
      let node = nodes.get(m.id);
      if (!node) {
        node = document.createElementNS(NS, "g");
        node.setAttribute("data-marble", "");
        node.innerHTML = MARBLE;
        nodes.set(m.id, node);
      }
      node.setAttribute("transform", SC.shift(m.p));
      if ((m.alpha ?? 1) < 1) node.setAttribute("opacity", m.alpha.toFixed(2));
      else node.removeAttribute("opacity");
      node.__depth = G.dot3(m.p, V);
      (bySlot[m.slot] ??= []).push(node);
    }
    for (const [id, node] of nodes) if (!seen.has(id)) (node.remove(), nodes.delete(id));
    for (const [name, list] of Object.entries(bySlot)) {
      const box = slots[name];
      if (!box) continue;
      list.sort((a, b) => a.__depth - b.__depth);
      const children = box.children;
      let same = children.length === list.length;
      for (let i = 0; same && i < list.length; i++) same = children[i] === list[i];
      if (!same) {
        const frag = document.createDocumentFragment();
        list.forEach((node) => frag.appendChild(node));
        box.appendChild(frag);
      }
    }
    const text = textNow();
    if (readout && readout.textContent !== text) readout.textContent = text;
  }

  // ---- the loop
  let frame = 0;
  let last = 0;
  let visible = false;
  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    if (touring) {
      tourClock += dt;
      if (tourClock > TOUR[tourStep][2]) {
        tourClock = 0;
        tourStep = (tourStep + 1) % TOUR.length;
        lever.target = TOUR[tourStep][0];
        bot.target = TOUR[tourStep][1];
        describe();
      }
    }
    const tau = dragging ? 0.08 : 0.32;
    lever.x += (lever.target - lever.x) * (1 - Math.exp(-dt / tau));
    if (Math.abs(lever.target - lever.x) < 1e-3) lever.x = lever.target;
    bot.x += (bot.target - bot.x) * (1 - Math.exp(-dt / 0.38));
    if (Math.abs(bot.target - bot.x) < 1e-3) bot.x = bot.target;
    MACH.stepSim(sim, dt, { u: lever.x, robots: bot.x });
    render();
    frame = visible ? requestAnimationFrame(tick) : 0;
  }
  const run = () => {
    if (still.matches) return;
    if (!frame && visible) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };
  function settleStill() {
    // reduced motion: jump to the chosen state and show one still frame of the machine there
    lever.x = lever.target;
    bot.x = bot.target;
    sim = MACH.warmed(lever.x, bot.x, 2.6);
    render();
  }
  function steer() {
    touring = false;
    clearTimeout(idle);
    idle = setTimeout(() => {
      if (still.matches) return;
      touring = true;
      tourClock = 0;
      tourStep = TOUR.findIndex(([u, r]) => u === Math.round(lever.target) && r === Math.round(bot.target));
      if (tourStep < 0) tourStep = 0;
      run();
    }, 3600);
    describe();
    announce();
    if (still.matches) settleStill();
    else run();
  }
  function setDetent(d) {
    lever.target = clamp(d, 0, 3);
    if (lever.target < 2.5 && bot.target > 0) bot.target = 0;
    steer();
  }
  function toggleRobots() {
    if (bot.target > 0.5) bot.target = 0;
    else {
      bot.target = 1;
      lever.target = 3;
    }
    steer();
  }

  new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) run();
  }, { rootMargin: "120px 0px" }).observe(stage);

  stage.addEventListener("keydown", (event) => {
    const key = event.key;
    let used = true;
    if (key >= "1" && key <= "4") setDetent(Number(key) - 1);
    else if (key === "r" || key === "R") toggleRobots();
    else if (key === "ArrowRight" || key === "ArrowUp") setDetent(Math.round(lever.target) + 1);
    else if (key === "ArrowLeft" || key === "ArrowDown") setDetent(Math.round(lever.target) - 1);
    else if (key === "Home") setDetent(0);
    else if (key === "End") setDetent(3);
    else used = false;
    if (used) event.preventDefault();
  });
  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const box = svg.getBoundingClientRect();
    dragging = { x: event.clientX, u: lever.x, per: Math.max(36, box.width / 9) };
    try {
      stage.setPointerCapture(event.pointerId);
    } catch (error) {}
    steer();
  });
  stage.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    lever.target = clamp(dragging.u + (event.clientX - dragging.x) / dragging.per, 0, 3);
    if (lever.target < 2.5 && bot.target > 0) bot.target = 0;
    steer();
  });
  const release = () => {
    if (!dragging) return;
    dragging = null;
    setDetent(Math.round(lever.target));
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
  stage.addEventListener("focus", () => status && (status.textContent = textNow()));
  still.addEventListener?.("change", () => {
    if (still.matches) {
      touring = false;
      settleStill();
    } else {
      touring = true;
      run();
    }
  });

  describe();
  render();
  if (still.matches) settleStill();
}

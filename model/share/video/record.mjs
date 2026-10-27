// Record the tech tree playing 2026 → 2035 as PNG frames, on a virtual clock so every frame is exact.
// The page's timers and its CSS transitions and animations all advance by exactly 1/fps between screenshots.
// Usage: node share/video/record.mjs <vid169|vid45> <framesDir>   (needs the "share" preview server on :8766)
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { chromePort } from "/Users/alex/.claude/skills/anatomy/scripts/chrome-port.mjs";

const SIZES = { vid169: [1600, 900, 1.2], vid45: [1080, 1350, 1] }; // CSS size and device scale: 1920×1080 and 1080×1350
const FPS = 30, SECONDS = 15, PLAY_AT = 0.4; // play starts 0.4 s in; the run ends on the end-of-decade summary

// Injected before the page's own scripts: a clock that only moves when the recorder says so.
const CLOCK = `(() => {
  let now = 0, nextId = 1;
  const timers = new Map(), seen = new Map();
  const t0 = Date.now(), p0 = performance.now();
  Date.now = () => t0 + now;
  performance.now = () => p0 + now;
  window.setTimeout = (fn, ms = 0, ...a) => { const id = nextId++; timers.set(id, { at: now + Math.max(0, +ms || 0), fn, a }); return id; };
  window.clearTimeout = id => { timers.delete(id); };
  window.setInterval = (fn, ms = 0, ...a) => { const id = nextId++; const every = Math.max(1, +ms || 0); timers.set(id, { at: now + every, fn, a, every }); return id; };
  window.clearInterval = window.clearTimeout;
  window.requestAnimationFrame = fn => window.setTimeout(() => fn(performance.now()), 0);
  window.cancelAnimationFrame = window.clearTimeout;
  function sync() {
    for (const a of document.getAnimations()) {
      if (!seen.has(a)) seen.set(a, now);
      const t = now - seen.get(a);
      const end = a.effect && a.effect.getComputedTiming().endTime;
      if (end != null && isFinite(end) && t >= end) { a.cancel(); seen.delete(a); continue; }
      a.pause();
      a.currentTime = t;
    }
  }
  window.__vt = {
    now: () => now,
    step(ms) {
      const target = now + ms;
      for (;;) {
        let due = null;
        for (const [id, t] of timers) if (t.at <= target && (!due || t.at < due[1].at)) due = [id, t];
        if (!due) break;
        const [id, t] = due;
        now = Math.max(now, t.at);
        if (t.every) t.at += t.every; else timers.delete(id);
        try { t.fn(...t.a); } catch (e) { console.error(e && e.stack || e); }
      }
      now = target;
      sync();
    },
  };
})();`;

function chromePath() {
  const list = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium"].filter(Boolean);
  const pw = join(homedir(), "Library/Caches/ms-playwright");
  if (existsSync(pw)) for (const d of readdirSync(pw).sort().reverse()) list.push(join(pw, d, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"));
  return list.find((p) => existsSync(p));
}

async function main() {
  const [which, outDir] = process.argv.slice(2);
  if (!SIZES[which] || !outDir) { console.error("usage: record.mjs <vid169|vid45> <framesDir>"); process.exit(1); }
  const [w, h, dsf] = SIZES[which];
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const profile = mkdtempSync(join(tmpdir(), "tt-video-"));
  const chrome = spawn(chromePath(), ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run",
    "--no-default-browser-check", "--hide-scrollbars", "--force-color-profile=srgb", "--enable-unsafe-swiftshader", "about:blank"]);
  const port = await chromePort(chrome, profile);
  const done = (code) => { chrome.kill("SIGKILL"); try { rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(code); };
  try {
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));
    let id = 0;
    const pending = new Map(), events = [];
    const problems = [];
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
      else if (d.method) {
        events.push(d.method);
        if (d.method === "Runtime.exceptionThrown") problems.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
        if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") problems.push(d.params.args.map((a) => a.value ?? a.description).join(" "));
      }
    };
    const send = (method, params = {}) => new Promise((r, j) => {
      const n = ++id;
      pending.set(n, (d) => (d.error ? j(new Error(`${method}: ${d.error.message}`)) : r(d.result)));
      ws.send(JSON.stringify({ id: n, method, params }));
    });
    const evaluate = async (expression) => {
      const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    };
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Page.addScriptToEvaluateOnNewDocument", { source: CLOCK });
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: dsf, mobile: false });
    await send("Page.navigate", { url: `http://localhost:8766/kit.html?only=${which}` });
    for (let i = 0; i < 200; i++) {
      if (await evaluate("window.__ready === true && document.fonts.status === 'loaded'").catch(() => false)) break;
      await new Promise((r) => globalThis.setTimeout(r, 100));
    }
    await new Promise((r) => globalThis.setTimeout(r, 1200)); // let the toast pictures finish loading
    const tree = `window.__trees.${which}`;
    await evaluate(`${tree}.setTurn(2026)`);
    for (let i = 0; i < 60; i++) await evaluate(`__vt.step(${1000 / FPS})`); // settle any transition from mount
    const total = FPS * SECONDS, playFrame = Math.round(PLAY_AT * FPS), log = [];
    for (let f = 0; f < total; f++) {
      if (f === playFrame) await evaluate(`${tree}.play()`);
      await evaluate(`__vt.step(${1000 / FPS})`);
      const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
      writeFileSync(join(outDir, `f${String(f).padStart(4, "0")}.png`), Buffer.from(shot.data, "base64"));
      if (f % FPS === 0 || f === total - 1) {
        const s = await evaluate(`(() => { const r = document.getElementById('${which}'); const t = r.querySelector('.tt-toast');
          return r.querySelector('[data-tt=year]').textContent + ' | ' + (t.classList.contains('show') ? t.innerText.replace(/\\s+/g, ' ').slice(0, 90) : '-'); })()`);
        log.push(`${(f / FPS).toFixed(1)}s  ${s}`);
      }
    }
    console.log(log.join("\n"));
    console.log(`${total} frames → ${outDir}`);
    if (problems.length) { console.log("page problems:\n" + problems.slice(0, 10).join("\n")); done(2); }
    done(0);
  } catch (e) {
    console.error(e);
    done(1);
  }
}

if (typeof WebSocket === "undefined" && !process.execArgv.includes("--experimental-websocket")) {
  const child = spawn(process.execPath, ["--experimental-websocket", ...process.argv.slice(1)], { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 1));
} else {
  await main();
}

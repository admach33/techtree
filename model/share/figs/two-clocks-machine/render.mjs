// Renders the PNGs and the test pages: node render.mjs (after node build.mjs). Needs Chrome.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const SLUG = "two-clocks-machine";
const CAPTURE = "/Users/alex/.claude/skills/anatomy/scripts/capture.mjs";
const SHOTS = join(HERE, "shots");
mkdirSync(SHOTS, { recursive: true });

// the standalone SVG as an <img> on the card colour, 640 x 440
writeFileSync(
  join(SHOTS, "img.html"),
  `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#0C0E11}img{display:block;width:640px;height:440px}</style></head><body><img src="../${SLUG}.svg" alt="Two clocks marble machine"></body></html>`,
);

// the fragment inside a host page with its own type and heading styles
const fragment = readFileSync(join(HERE, `${SLUG}.fragment.html`), "utf8");
writeFileSync(
  join(SHOTS, "host.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Host test</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<script>window.__before = new Set(Object.getOwnPropertyNames(window));</script>
<style>
*{box-sizing:border-box}
html{background:#08090B;color:#d6d8db}
body{margin:0;font:17px/1.6 "Hanken Grotesk",system-ui,sans-serif}
main{max-width:760px;margin:0 auto;padding:44px 16px 80px}
h1{font-weight:700;font-size:38px;line-height:1.1;letter-spacing:-.015em;margin:0 0 14px;color:#fff}
h2{font-weight:600;font-size:22px;margin:36px 0 10px;color:#fff}
p{margin:0 0 18px;color:#a4a9b0}
figure{margin:40px 0;border:0}
svg{max-width:100%}
</style></head><body><main>
<h1>Two clocks</h1>
<p>AI makes the thinking part of space engineering fast. Hardware, launch and paperwork set the dates. Turn the lever and watch which clock moves.</p>
${fragment}
<h2>What the machine shows</h2>
<p>The thinking chutes race; the staircase barely speeds up; solved problems wait at the hardware gate.</p>
</main></body></html>`,
);

const run = (args) => {
  const out = execFileSync("node", [CAPTURE, ...args], { encoding: "utf8" });
  process.stdout.write(out.split("\n").filter((line) => /saved|console|readout|scrolls/.test(line)).map((line) => `  ${line}`).join("\n") + "\n");
};
console.log(`${SLUG}.png (the SVG as an image, 2x on #0C0E11, 1280 x 880)`);
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", "--force-device-scale-factor=2", "--window-size=640,440", `--screenshot=${join(HERE, `${SLUG}.png`)}`, `file://${join(SHOTS, "img.html")}`], { stdio: "ignore" });
console.log(`  saved ${join(HERE, `${SLUG}.png`)}`);
console.log("poster-still.png (the card at the still state, 2x)");
run([join(HERE, `${SLUG}.html`), "--out", join(HERE, "poster-still.png"), "--width", "1440", "--height", "1100", "--scale", "2", "--reduced"]);
console.log("host page at 1280 and 390");
run([join(SHOTS, "host.html"), "--out", join(SHOTS, "host-1280.png"), "--width", "1280", "--height", "1400", "--scale", "1", "--select", "main", "--wait", "3000"]);
run([join(SHOTS, "host.html"), "--out", join(SHOTS, "host-390.png"), "--width", "390", "--height", "1400", "--scale", "2", "--select", "main", "--wait", "3000"]);

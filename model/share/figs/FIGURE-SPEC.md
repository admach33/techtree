# Two Clocks: figure spec (shared by every figure in this set)

These figures illustrate a shareable story, "Two Clocks", distilled from the Space Unlock Tree
(`/Users/alex/projects/openai math paper/model/graph-v8.json`, 478 nodes, four scenarios).
The story's one message: **AI makes the thinking part of space engineering fast; hardware,
launch and paperwork set the dates.** Readers are space and AI investors and engineers
(Mach33 / 33FG research readers).

## Tooling

- Skill: `/Users/alex/.claude/skills/anatomy`. Read `SKILL.md` first, then `references/craft.md`,
  `references/kit.md` and `references/verify.md` as needed. Open the closest example before starting
  (`examples/dial-indicator/` is the smallest framework-free one; `examples/raptor-engine/` for round
  parts and pipes; `examples/arcade-cabinet/` for a dense Hero with moving parts).
- Framework-free: a Node build script `build.mjs` in your own folder that imports the kit by absolute
  path (`/Users/alex/.claude/skills/anatomy/kit/iso-kit.mjs`, plus `lathe.mjs`, `tube.mjs`,
  `audit.mjs` as needed) and `scripts/inline-kit.mjs` for `kitScript()`.
- Run `date` at the start and at the end and report elapsed time.

## Shared look

- **Theme: dark only.** Override these tokens after the kit's CSS, everywhere the figure renders
  (the review page and the standalone SVG):
  `--anatomy-page:#08090B; --anatomy-card:#0C0E11; --anatomy-paper:#0C0E11; --anatomy-lit:#5B9FE2;`
  Leave every other token at the kit's dark values. `#5B9FE2` (Mach33 data blue, Brand MCP token per the 26 Oct review, VI-1; it replaced the off-palette `#22CFFF`) is the one lit
  accent: exactly one part is lit, the part the reader should watch. No other colour unless colour is
  the subject. Page tokens around the figures: Black Space `#030911` background, Mission White `#FAFEFF`
  text, Orbital Signal Blue `#1C79D6` for buttons and focus; never Deep Orbit Blue as a background (OOTWD rule,
  9 Oct 2026). Role colours when a card needs one: ODC blue `#3C8CDC`, lunar-Mars red `#902005`, Starlink green `#00A57C`.
- **"Museum models of the next decade."** Each unlock object stands on a low display plinth or its
  real ground-handling fixture (a base plate on feet, bevel, groove, corner screws, halo), like a
  scale model in a gallery. The plinth carries at most one tiny engraved label: the earliest year
  (for example `2029`). No other words inside the drawing.
- Camera: azimuth 45° unless the object reads better at 35–60°, elevation 30°.
- Composition: landscape. The standalone SVG's `viewBox` is about **640 × 440**. The object fills
  about 70% of it (there is no card chrome in the SVG, so fill more than the usual 55–65%), centred,
  with clear margin for the halo. It must still read at 360 px wide on a phone.
- Size: **Figure** (40–80 parts) unless your brief says otherwise. Highly detailed at 1×, still
  rewarding at 4×, per the skill.

## Deliverables (in your folder only: `.../model/share/figs/<slug>/`)

1. `build.mjs`: builds everything below. `node build.mjs` must run clean.
2. `<slug>.html`: the kit's normal card page (`plateHtml` + `pageHtml`), dark, for review: Fig n
   top left, short title top right, hint bottom left (a still figure may leave it empty), live or
   true readout bottom right.
3. `<slug>.svg`: the drawing alone, `figureSvg({ standalone: "dark" })` with the token overrides
   embedded in its `<style>`, no card chrome, background transparent (the page puts it on `#0C0E11`).
   It must render correctly as an `<img src>` (no scripts, no external fonts, no external refs).
4. `<slug>.png`: a 2× render of the SVG on `#0C0E11` (1280 × 880), via headless Chrome
   (`scripts/capture.mjs` or your own small script).
5. `NOTES.md`: part count, the true numbers the figure uses and where they come from (node ids in
   graph-v8.json or the model doc), the checks you ran and their results, and anything you know is
   still wrong.

## Verify before you report (per the skill, step 10)

- Capture the card page and 4× close-ups of the subject and mechanism, and read every PNG.
- `node /Users/alex/.claude/skills/anatomy/scripts/lines.mjs <slug>.html --out shots/lines.png`
  must print `line ends: 0`.
- If the figure has pipes, cables or round parts, `node build.mjs --audit` must end `audit passed`.
- Check the SVG on its own: open it as an `<img>` in a tiny test page and screenshot it.

## Rules of the engagement

- Work only inside your own folder. Do not publish to the Anatomy gallery. Do not edit the skill.
- Do not invent facts. Use the numbers in your brief; if you need another number, take it from the
  node's `why` / `status_oct2026` text in graph-v8.json or say in NOTES.md that it is illustrative.
- The object must be recognisable and true to the real hardware class, but it is a generic,
  illustrative member of the class. Do not imitate a company's logo, livery or branding.
- Time box: about 75 minutes for a Figure, about 3 hours for the Hero. If you pass twice that,
  stop deepening, make sure the deliverables exist and pass the checks, and report what is left.
- Final message: the file paths, part count, check results (with the actual tool output lines),
  elapsed time, and open issues. Keep it under 250 words.

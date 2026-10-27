"""Build the share kit page (poster, social card, one card per unlock) for PNG capture.

Usage: python3 share/build_kit.py  (run from model/, after build_page.py)
Writes share/site/kit.html. Capture with share/capture_kit.sh.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(__file__))
from build_page import COPY  # noqa: E402

HERE = 'share'
SITE = os.path.join(HERE, 'site')
GATE = {'launch-internal': 'launch (SpaceX)', 'launch-external': 'launch (customers)', 'capital': 'capital', 'adoption': 'adoption', 'data': 'flight data',
        'qualification': 'qualification', 'regulatory': 'regulators', 'fabrication': 'fabrication', 'experiment': 'experiments'}
RANK = {'Speculative': 1, 'Low': 2, 'Medium': 3, 'High': 4}
# Every image travels without the page, so each carries the disclosure and, where odds appear, their key.
DISCLOSE = 'Mach33, its affiliates and its employees hold SpaceX equity, including pre-IPO positions.'
ODDS_KEY = 'Odds are analyst ratings: High over 70%, Medium 30 to 70%, Low 10 to 30%, Speculative under 10%.'
UNLOCKED = 'Unlocked = earliest year reached and odds for that year Medium or better (over 30%); odds are rated for every year.'

CSS = """
:root { --page:#030911; --card:#0C0E11; --ink:#FAFEFF; --accent:#1C79D6; --on-accent:#FAFEFF; --ink-2:#94a3b8; --ink-3:#7A8999; --ink-4:#5F6C7C;
  --think:#5B9FE2; --ink-4:#728091; --do:#E6EBF3; --rule:rgba(255,255,255,.07);
  --f-body:'Hanken Grotesk',ui-sans-serif,system-ui,sans-serif; --f-num:'Turret Road','Hanken Grotesk',sans-serif; color-scheme:dark;
  --card-2:#101318; --rule-2:rgba(255,255,255,.10); }
.switch { display:flex; flex-wrap:wrap; gap:8px; }
.switch button { font:500 12px/1 var(--f-body); color:var(--ink-2); background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:999px; padding:7px 10px; }
.switch button[aria-pressed="true"] { color:var(--on-accent); background:var(--accent); border-color:var(--accent); font-weight:600; }
.treebox { position:relative; }
* { box-sizing:border-box; }
body { margin:0; background:#030911; color:var(--ink); font-family:var(--f-body); -webkit-font-smoothing:antialiased; }
.share { position:relative; overflow:hidden; background:var(--page); margin:0 0 40px; display:flex; flex-direction:column; }
.p45 { width:1080px; height:1350px; padding:72px 72px 56px; }
.p169 { width:1200px; height:675px; padding:56px 60px 44px; }
.eyebrow { font-size:16px; letter-spacing:3px; text-transform:uppercase; color:var(--ink-3); font-weight:500; }
.eyebrow b { color:var(--ink-2); font-weight:600; }
.think { color:var(--think); } .do { color:var(--do); }
a { color:var(--think); text-underline-offset:3px; }
h1 { margin:0; font-weight:800; letter-spacing:-.045em; line-height:.96; }
.foot { margin-top:auto; display:flex; justify-content:space-between; align-items:flex-end; gap:20px; padding-top:22px;
  border-top:1px solid var(--rule); font-size:15px; color:var(--ink-4); letter-spacing:.2px; }
.foot .disc { display:block; margin-top:6px; font-size:13px; color:var(--ink-4); }
.foot .brand { letter-spacing:2.5px; text-transform:uppercase; color:var(--ink-3); font-size:14px; white-space:nowrap; }
.clocks { display:flex; align-items:flex-end; gap:30px; }
.clock .num { font-family:var(--f-num); font-weight:700; line-height:.9; }
.clock .lbl { color:var(--ink-2); margin-top:10px; line-height:1.35; }
.clock .lbl b { color:var(--ink); font-weight:600; }
.arrow { font-family:var(--f-num); color:var(--ink-4); }
.chart svg { display:block; }
/* unlock card */
.u .fig { position:relative; margin-top:30px; height:560px; border-radius:18px; background:var(--card); border:1px solid rgba(255,255,255,.05);
  display:grid; place-items:center; overflow:hidden; }
.u .fig img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; }
.u .fig img[src*="orrery"] { transform:scale(1.12); }
.u .fig img[src*="refuel"] { transform:scale(1.25); }
.u .fig img[src$=".jpg"] { inset:5% 0; height:90%; }
body.one .share:not(.on) { display:none !important; } body.one .share.on { margin:0; }  /* inline display (grid) on the 16:9 sections must lose too */
.u .row { display:flex; align-items:baseline; gap:18px; margin-top:34px; }
.u .yr { font-family:var(--f-num); font-weight:700; font-size:104px; line-height:.85; color:var(--do); }
.u .yrl { font-size:17px; color:var(--ink-3); letter-spacing:2px; text-transform:uppercase; line-height:1.4; }
.u h2 { margin:22px 0 0; font-size:46px; line-height:1.1; letter-spacing:-.02em; font-weight:700; max-width:26ch; }
.u p { margin:16px 0 0; font-size:22px; line-height:1.45; color:var(--ink-2); max-width:58ch; }
.u .odds { margin-top:10px; font-size:14px; color:var(--ink-4); }
.u p strong { color:var(--ink); font-weight:600; }
.chips { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0 24px; margin-top:auto; padding-top:20px; border-top:1px solid var(--rule); }
.chip { display:grid; gap:9px; align-content:start; font-size:20px; color:var(--ink); }
.chip .k { font-size:14px; letter-spacing:2px; text-transform:uppercase; color:var(--ink-4); font-weight:600; }
.chip .v { display:inline-flex; align-items:center; gap:12px; }
.chip b { color:var(--ink); font-weight:600; }
.chip.gate b { font-size:24px; color:var(--do); font-weight:700; }
.meter { display:inline-flex; gap:4px; } .meter i { width:9px; height:9px; border-radius:2px; background:rgba(255,255,255,.12); }
.meter i.on { background:var(--do); }
.code { display:grid; gap:14px; text-align:center; }
.code .from { font-family:var(--f-num); font-size:64px; color:var(--ink-4); text-decoration:line-through; text-decoration-thickness:3px;
  text-decoration-color:rgba(230,235,243,.35); }
.code .to { font-family:var(--f-num); font-weight:800; font-size:150px; line-height:.95; color:var(--think); }
.code .per { font-size:18px; letter-spacing:2.5px; text-transform:uppercase; color:var(--ink-3); }
.bn { display:flex; align-items:center; gap:26px; }
.bn .z { font-family:var(--f-body); font-weight:800; font-size:120px; line-height:.8; color:var(--think); letter-spacing:-.04em; }
.bn .t { font-size:28px; line-height:1.25; font-weight:600; max-width:36ch; }
.bn .t span { color:var(--ink-2); font-weight:400; }
"""


def meter(band, thinking=False):
    r = RANK.get(band, 0)
    return '<span class="meter">' + ''.join(f'<i class="{"on" if i <= r else ""}"></i>' for i in range(1, 5)) + '</span>'


def chart(rows, W, H, fs):
    m = {'l': 60, 'r': 150, 't': 20, 'b': 40}
    n = len(rows)
    x = lambda i: m['l'] + (W - m['l'] - m['r']) * i / (n - 1)
    y = lambda v: m['t'] + (H - m['t'] - m['b']) * (1 - v / 100)
    s = [f'<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">']
    for v in (0, 50, 100):
        s.append(f'<line x1="{m["l"]}" x2="{W - m["r"]}" y1="{y(v)}" y2="{y(v)}" stroke="rgba(255,255,255,{0.08 if v == 0 else 0.04})"/>')
        s.append(f'<text x="{m["l"] - 12}" y="{y(v) + 5}" text-anchor="end" fill="#7A8999" font-size="{fs}" font-family="Hanken Grotesk">{v}%</text>')
    for i, r in enumerate(rows):
        if i % 3 == 0 or i == n - 1:
            s.append(f'<text x="{x(i)}" y="{H - 8}" text-anchor="middle" fill="#7A8999" font-size="{fs}" font-family="Hanken Grotesk">{r["year"]}</text>')
    top = [f'{x(i)},{y(r["cognitive"])}' for i, r in enumerate(rows)]
    bot = [f'{x(i)},{y(r["physical"])}' for i, r in enumerate(rows)][::-1]
    s.append(f'<polygon points="{" ".join(top + bot)}" fill="rgba(91,159,226,0.11)"/>')
    pk = max(rows, key=lambda r: r['gap'])
    pi = rows.index(pk)
    s.append(f'<line x1="{x(pi)}" x2="{x(pi)}" y1="{y(pk["cognitive"]) + 5}" y2="{y(pk["physical"]) - 5}" stroke="rgba(91,159,226,.6)" stroke-dasharray="3 4"/>')
    ly = y(pk['cognitive']) + (H - m['t'] - m['b']) * 0.13
    for j, t in enumerate(('ready on paper,', 'not yet built')):
        s.append(f'<text x="{x(pi) + 12}" y="{ly + j * (fs + 8)}" fill="#5B9FE2" font-size="{fs + 4}" font-weight="600" font-family="Hanken Grotesk">{t}</text>')
    for k, c in (('physical', '#E6EBF3'), ('cognitive', '#5B9FE2')):
        d = ''.join(f'{"L" if i else "M"}{x(i)},{y(r[k])}' for i, r in enumerate(rows))
        s.append(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="3.5" stroke-linejoin="round"/>')
        for i, r in enumerate(rows):
            s.append(f'<circle cx="{x(i)}" cy="{y(r[k])}" r="4.5" fill="{c}" stroke="#08090B" stroke-width="2.5"/>')
    last = rows[-1]
    lx = W - m['r'] + 16
    for k, c, lab, dy in (('cognitive', '#5B9FE2', 'thinking', 0), ('physical', '#E6EBF3', 'hardware', 0)):
        yy = y(last[k])
        s.append(f'<text x="{lx}" y="{yy + 2}" fill="{c}" font-size="{fs + 16}" font-weight="700" font-family="Hanken Grotesk">{last[k]}%</text>')
        s.append(f'<text x="{lx}" y="{yy + 24}" fill="#7A8999" font-size="{fs}" font-family="Hanken Grotesk">{lab}</text>')
    s.append('</svg>')
    return ''.join(s)


def main():
    F = json.load(open(os.path.join(HERE, 'data', 'facts.json')))
    page_copy = json.loads(open(os.path.join(SITE, 'two-clocks.html')).read().split('const COPY = ', 1)[1].split(';\n', 1)[0])
    rows = F['clock_curve']['S2']
    pk = F['gap_peak']['S2']
    G = F['outcome_gates']
    out = [f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Two Clocks share kit</title>'
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Turret+Road:wght@500;700;800&display=swap">'
           f'<style>{CSS}</style></head><body>'
           '<script>const o=new URLSearchParams(location.search).get("only");if(o){document.body.classList.add("one");'
           'addEventListener("DOMContentLoaded",()=>document.getElementById(o).classList.add("on"))}</script>']

    # Poster, 4:5
    out.append(f'''<section class="share p45" id="poster">
  <div class="eyebrow"><b>Mach33 Research</b> · Two Clocks of Space</div>
  <h1 style="font-size:100px;margin-top:30px"><span class="think" style="display:block">The proof is ready.</span><span class="do">The rocket isn’t.</span></h1>
  <div style="margin-top:24px;font-size:24px;color:var(--ink-2)">AI math, traced through {F["n_nodes"]} space milestones to 2035.</div>
  <div class="clocks" style="margin-top:36px">
    <div class="clock"><div class="num think" style="font-size:96px">5 to 10×</div><div class="lbl" style="font-size:20px"><b>faster thinking with AI</b><br>math, design, software</div></div>
    <div class="arrow" style="font-size:44px;padding-bottom:40px">→</div>
    <div class="clock"><div class="num do" style="font-size:96px">1.6×</div><div class="lbl" style="font-size:20px"><b>faster new programs by 2031: a ceiling</b><br>build, test and launch set the pace</div></div>
  </div>
  <div style="margin-top:40px;font-size:19px;color:var(--ink-2)"><b style="color:var(--ink)">Share of milestones unlocked by each year:</b> <span class="think">thinking</span> (math, models, design) vs <span class="do">hardware</span> (tested, flown, in service)</div>
  <div class="chart" style="margin-top:12px">{chart(rows, 936, 360, 16)}</div>
  <div style="margin-top:6px;font-size:14px;color:var(--ink-4)">{UNLOCKED}</div>
  <div class="bn" style="margin-top:22px"><div class="z">{G["cognition"]}</div><div class="t">of the tree’s {G["total"]} end results have thinking as their bottleneck. <span>Adoption, capital and launch hold back the most.</span></div></div>
  <div class="foot"><span>Central scenario: AI capability keeps compounding. Each year is the earliest credible year; the odds carry the expectation.<span class="disc">{DISCLOSE}</span></span><span class="brand">research.33fg.com</span></div>
</section>''')

    # Social card, 16:9
    out.append(f'''<section class="share p169" id="social">
  <div class="eyebrow" style="font-size:14px"><b>Mach33 Research</b> · Two Clocks of Space</div>
  <div style="display:grid;grid-template-columns:1fr 470px;gap:30px;margin-top:34px;align-items:start">
    <div>
      <h1 style="font-size:64px"><span class="think" style="display:block">The proof is ready.</span><span class="do">The rocket isn’t.</span></h1>
      <div style="margin-top:18px;font-size:19px;color:var(--ink-2)">AI labs now produce research-grade math (not yet independently checked). We traced it through {F["n_nodes"]} space milestones to 2035.</div>
      <div class="clocks" style="margin-top:28px">
        <div class="clock"><div class="num think" style="font-size:66px">5 to 10×</div><div class="lbl" style="font-size:16px"><b>faster thinking with AI</b></div></div>
        <div class="arrow" style="font-size:32px;padding-bottom:30px">→</div>
        <div class="clock"><div class="num do" style="font-size:66px">1.6×</div><div class="lbl" style="font-size:16px"><b>faster new programs by 2031: a ceiling</b></div></div>
      </div>
      <div style="margin-top:30px;font-size:18px;color:var(--ink-2);display:flex;align-items:center;gap:14px"><span class="think" style="font-weight:800;font-size:48px;line-height:1">{G["cognition"]}</span><span>of {G["total"]} end results have thinking as their bottleneck.<br>Adoption, capital and launch hold back the most.</span></div>
    </div>
    <div><div style="font-size:15px;color:var(--ink-2)"><b style="color:var(--ink)">Share of milestones unlocked by each year</b><br><span class="think">thinking</span> (math, models, design) vs <span class="do">hardware</span> (tested, flown)</div>
      <div class="chart" style="margin-top:10px">{chart(rows, 470, 350, 13)}</div>
      <div style="margin-top:2px;font-size:12px;color:var(--ink-4);max-width:470px">{UNLOCKED}</div></div>
  </div>
  <div class="foot" style="font-size:13px"><span>Central scenario: AI capability keeps compounding · earliest credible years<span class="disc" style="font-size:12px">{DISCLOSE}</span></span><span class="brand" style="font-size:12px">research.33fg.com</span></div>
</section>''')

    # One card per unlock
    total = len(F['cards'])
    for i, c in enumerate(F['cards'], 1):
        k = page_copy[c['id']]
        think = k.get('kind') == 'think'
        if c['figure']:
            img = k.get('img')
            fig = f'<img src="{img}" alt="">' if img else '<span style="color:var(--ink-4);letter-spacing:2px">ILLUSTRATION IN PROGRESS</span>'
        else:
            fig = '<div class="code"><div class="from">$300 to 600</div><div class="to">$5 to 20</div><div class="per">per machine-checked line of flight code</div></div>'
        s = 'S2'
        out.append(f'''<section class="share p45 u{' thinking' if think else ''}" id="card-{i}">
  <div class="eyebrow"><b>Two Clocks of Space</b> · Unlock {i} of {total}</div>
  <div class="fig">{fig}</div>
  <div class="row"><div class="yr">{c["year"][s]}</div><div class="yrl"><span style="color:var(--ink-2);font-weight:600">{k["lane"]}</span><br>earliest credible year, central scenario</div></div>
  <h2>{k["title"]}</h2>
  <p>{k["line"]}</p>
  <div class="chips">
    <span class="chip gate"><span class="k">Waits on</span><b>{GATE.get(c["gate"], c["gate"])}</b></span>
    <span class="chip"><span class="k">Odds by 2031</span><span class="v">{meter(c["band_2031"][s])}<b>{c["band_2031"][s]}</b></span></span>
    <span class="chip"><span class="k">Odds by 2035</span><span class="v">{meter(c["band_2035"][s])}<b>{c["band_2035"][s]}</b></span></span>
  </div>
  <div class="odds">{ODDS_KEY}</div>
  <div class="foot" style="margin-top:22px"><span>Mach33 Research · Two Clocks of Space<span class="disc">{DISCLOSE}</span></span><span class="brand">research.33fg.com</span></div>
</section>''')
    # Tech tree, frozen at turn 2030 in the central scenario (the widest gap), as 4:5 and 16:9 images
    tdata = open(os.path.join(HERE, 'data', 'tree.json')).read()
    td = json.loads(tdata)
    pills = ''.join(f'<button type="button" aria-pressed="{str(s == "S2").lower()}">{n}</button>'
                    for s, n in zip(['S1', 'S2', 'S3', 'S4'], ['Plateau', 'Exponential', 'Recursive', 'Embodied']))
    tmark = (open(os.path.join(HERE, 'tree.html')).read().replace('__N__', str(len(td['nodes']))).replace('__E__', str(len(td['edges'])))
             .replace('<div class="switch" data-switch role="group" aria-label="Scenario"></div>', f'<div class="switch">{pills}</div>'))
    c30 = [r for r in F['clock_curve']['S2'] if r['year'] == 2030][0]
    out.append(f'''<section class="share p45" id="tree45">
  <div class="eyebrow"><b>Mach33 Research</b> · Two Clocks of Space</div>
  <h1 style="font-size:64px;margin-top:22px"><span class="think">The proof is ready.</span> <span class="do">The rocket isn’t.</span></h1>
  <div style="margin-top:14px;font-size:19px;line-height:1.45;color:var(--ink-2)">All {len(td["nodes"])} milestones of the Space Unlock Tree, as a game tech tree, at turn 2030 in the central scenario: <span class="think">{c30["cognitive"]}% of thinking milestones</span> unlocked, <span class="do">{c30["physical"]}% of hardware</span>.</div>
  <div class="treebox" id="tb45" style="margin-top:20px;width:936px;overflow:hidden"><div id="tb45i" style="width:1080px;transform-origin:top left">{tmark.replace('id="tree"', 'id="tree45t"')}</div></div>
  <div class="foot" id="tb45f" style="margin-top:16px;padding-top:14px"><span>{UNLOCKED} Years are earliest credible years.<span class="disc">{DISCLOSE}</span></span><span class="brand">research.33fg.com</span></div>
</section>''')
    out.append(f'''<section class="share" id="tree169" style="width:1600px;height:900px;padding:40px 44px 34px;display:grid;grid-template-columns:400px 1fr;grid-template-rows:minmax(0,1fr);gap:36px;overflow:hidden">
  <div style="display:flex;flex-direction:column">
    <div class="eyebrow" style="font-size:13px"><b>Mach33 Research</b> · Two Clocks of Space</div>
    <h1 style="font-size:50px;margin-top:26px"><span class="think" style="display:block">The proof is ready.</span><span class="do">The rocket isn’t.</span></h1>
    <div style="margin-top:22px;font-size:19px;line-height:1.5;color:var(--ink-2)">AI labs now produce research-grade math (not yet independently checked). We traced it through all {len(td["nodes"])} milestones of the Space Unlock Tree, to 2035.</div>
    <div style="margin-top:22px;font-size:19px;line-height:1.5;color:var(--ink-2)">At turn 2030 in the central scenario, <b class="think">{c30["cognitive"]}%</b> of thinking milestones are unlocked and <b class="do">{c30["physical"]}%</b> of hardware. Thinking is the bottleneck for none of the tree’s {F["outcome_gates"]["total"]} end results.</div>
    <div class="foot" style="font-size:13px"><span>{UNLOCKED} Earliest credible years.<span class="disc" style="font-size:12px">{DISCLOSE}</span></span></div>
    <div style="margin-top:10px;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:var(--ink-3)">research.33fg.com</div>
  </div>
  <div id="tb169w" style="align-self:start;overflow:hidden"><div class="treebox" id="tb169" style="width:1080px;transform-origin:top left">{tmark.replace('id="tree"', 'id="tree169t"')}</div></div>
</section>''')
    # Video frames: the same tree, live (toasts on, no hover hint), driven turn by turn by share/video/record.mjs
    out.append(f'''<section class="share video" id="vid169" style="width:1600px;height:900px;padding:40px 44px 34px;display:grid;grid-template-columns:400px 1fr;grid-template-rows:minmax(0,1fr);gap:36px;overflow:hidden">
  <div style="display:flex;flex-direction:column">
    <div class="eyebrow" style="font-size:13px"><b>Mach33 Research</b> · Two Clocks of Space</div>
    <h1 style="font-size:50px;margin-top:26px"><span class="think" style="display:block">The proof is ready.</span><span class="do">The rocket isn’t.</span></h1>
    <div style="margin-top:22px;font-size:19px;line-height:1.5;color:var(--ink-2)">AI labs now produce research-grade math (not yet independently checked). This is every one of the {len(td["nodes"])} milestones in the Space Unlock Tree, played turn by turn to 2035.</div>
    <div style="margin-top:22px;font-size:19px;line-height:1.5;color:var(--ink-2)">Watch the two rows: <b class="think">thinking</b> lights up years before <b class="do">hardware</b>. Central scenario.</div>
    <div class="foot" style="font-size:13px"><span>{UNLOCKED} Earliest credible years.<span class="disc" style="font-size:12px">{DISCLOSE}</span></span></div>
    <div style="margin-top:10px;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:var(--ink-3)">research.33fg.com</div>
  </div>
  <div id="vb169w" style="align-self:start;overflow:hidden"><div class="treebox" id="vb169" style="width:1080px;transform-origin:top left">{tmark.replace('id="tree"', 'id="vid169t"')}</div></div>
</section>''')
    out.append(f'''<section class="share p45 video" id="vid45">
  <div class="eyebrow"><b>Mach33 Research</b> · Two Clocks of Space</div>
  <h1 style="font-size:64px;margin-top:22px"><span class="think">The proof is ready.</span> <span class="do">The rocket isn’t.</span></h1>
  <div style="margin-top:14px;font-size:19px;line-height:1.45;color:var(--ink-2)">All {len(td["nodes"])} milestones of the Space Unlock Tree, played turn by turn to 2035 in the central scenario. <span class="think">Thinking</span> lights up years before <span class="do">hardware</span>.</div>
  <div class="treebox" id="vb45" style="margin-top:20px;width:936px;overflow:hidden"><div id="vb45i" style="width:1080px;transform-origin:top left">{tmark.replace('id="tree"', 'id="vid45t"')}</div></div>
  <div class="foot" id="vb45f" style="margin-top:16px;padding-top:14px"><span>{UNLOCKED} Years are earliest credible years.<span class="disc">{DISCLOSE}</span></span><span class="brand">research.33fg.com</span></div>
</section>''')
    # the clip never changes scenario or steps back, so those controls stay out of the frame
    out.append('<style>.video .tt-hint, .video [data-tt="prev"], .video .switch button[aria-pressed="false"] { display: none; }</style>')
    out.append('<style>' + open(os.path.join(HERE, 'tree.css')).read() + '</style>')
    out.append('<script>const TREE = ' + tdata + ';</script><script>' + open(os.path.join(HERE, 'tree.js')).read() + '</script>')
    out.append('''<script>
// Mount after load: in single-image mode the sections are shown at DOMContentLoaded, and a hidden tree measures 0 wide.
addEventListener('load', () => {
  TechTree.mount(document.getElementById('tree45t'), TREE, { scenario: 'S2', turn: 2030, autoplay: false, still: true, minWidth: 1080 });
  // 16:9: try a few tree widths and keep the one that fills the 1076 x 826 column best
  const b169 = document.getElementById('tb169'), r169 = document.getElementById('tree169t');
  let bestW = 1080, bestArea = 0;
  for (const w of [1080, 1160, 1240, 1320, 1400]) {
    b169.style.width = w + 'px';
    TechTree.mount(r169, TREE, { scenario: 'S2', turn: 2030, autoplay: false, still: true, minWidth: w });
    const k = Math.min(1076 / w, 826 / b169.scrollHeight), area = k * k * w * b169.scrollHeight;
    if (area > bestArea) { bestArea = area; bestW = w; }
  }
  b169.style.width = bestW + 'px';
  TechTree.mount(r169, TREE, { scenario: 'S2', turn: 2030, autoplay: false, still: true, minWidth: bestW });
  // fit the 16:9 tree into its column
  // fit the 4:5 tree between the headline and the footer
  const wrap = document.getElementById('tb45'), inner = document.getElementById('tb45i'), foot = document.getElementById('tb45f');
  const room = 1350 - 56 - wrap.offsetTop - foot.offsetHeight - 16;
  const k45 = Math.min(936 / 1080, room / inner.scrollHeight);
  inner.style.transform = `scale(${k45})`;
  wrap.style.height = `${inner.scrollHeight * k45}px`;
  const k169 = Math.min(1, 826 / b169.scrollHeight, 1076 / b169.scrollWidth);
  b169.style.transform = `scale(${k169})`;
  const w169 = document.getElementById('tb169w');
  w169.style.width = `${b169.scrollWidth * k169}px`; w169.style.height = `${b169.scrollHeight * k169}px`;
  // live trees for the video, at the same fit as the stills
  const pace = { step: 650, hold: 1800 };
  window.__trees = {};
  const vb169 = document.getElementById('vb169');
  vb169.style.width = bestW + 'px';
  window.__trees.vid169 = TechTree.mount(document.getElementById('vid169t'), TREE, { scenario: 'S2', turn: 2026, autoplay: false, minWidth: bestW, pace });
  const kv = Math.min(1, 826 / vb169.scrollHeight, 1076 / vb169.scrollWidth);
  vb169.style.transform = `scale(${kv})`;
  const vw169 = document.getElementById('vb169w');
  vw169.style.width = `${vb169.scrollWidth * kv}px`; vw169.style.height = `${vb169.scrollHeight * kv}px`;
  window.__trees.vid45 = TechTree.mount(document.getElementById('vid45t'), TREE, { scenario: 'S2', turn: 2026, autoplay: false, minWidth: 1080, pace });
  const vwrap = document.getElementById('vb45'), vinner = document.getElementById('vb45i'), vfoot = document.getElementById('vb45f');
  const vroom = 1350 - 56 - vwrap.offsetTop - vfoot.offsetHeight - 16;
  const kv45 = Math.min(936 / 1080, vroom / vinner.scrollHeight);
  vinner.style.transform = `scale(${kv45})`;
  vwrap.style.height = `${vinner.scrollHeight * kv45}px`;
  // the toast pictures load ahead, so no frame shows an empty slot
  TREE.nodes.filter(n => n.img).forEach(n => { const im = new Image(); im.src = n.img; });
  window.__ready = true;
});
</script>''')
    out.append('</body></html>')
    open(os.path.join(SITE, 'kit.html'), 'w').write('\n'.join(out))
    print('wrote kit.html with', total, 'cards')


if __name__ == '__main__':
    main()

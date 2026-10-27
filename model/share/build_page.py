"""Assemble the Two Clocks page from the template, the facts and whichever figures are finished.

Usage: python3 share/build_page.py  (run from model/; run build_facts.py first)
Writes share/site/two-clocks.html and copies figure files into share/site/figs/.
"""
import json, os, re, shutil, subprocess

HERE = 'share'
SITE = os.path.join(HERE, 'site')
FIGS = os.path.join(HERE, 'figs')

# Card copy. Every number here is from graph-v9.json node text, the model doc (appendix A) or a cited source;
# {ob:NODE:SCEN:band} is replaced with the year the node's odds reach that band (odds_by), so card odds follow the graph.
# TODO(source) markers sit in HTML comments, invisible to readers, and are listed in review/RESPONSE.md.
COPY = {
    'verif-assurance-cost-collapse': {
        'kind': 'think',
        'title': 'Machine-checked flight code gets 15 to 120× cheaper per line',
        # Per-scenario cost per line, from the node's why text (S4 shares S3's cognition).
        'to': {'S1': '$50 to 150', 'S2': '$5 to 20', 'S3': '$1 to 5', 'S4': '$1 to 5'},
        'title_by': {'S1': 'Machine-checked flight code gets 2 to 12× cheaper per line',
                     'S3': 'Machine-checked flight code falls to $1 to 5 a line', 'S4': 'Machine-checked flight code falls to $1 to 5 a line'},
        'line': 'On our cost assumptions, proof labor turns into compute. Knowing what to prove stays hard: in our review of 12 notable '
                'mission losses and near-losses, 9 involved software or logic, and in each a <strong>wrong assumption or spec</strong> was the missing piece.',
    },
    'astro-ai-designed-trajectory-flown': {
        'title': 'Missions fly AI-designed trajectories',
        'line': 'Designing the path gets cheap fast. Flying it waits on the manifest: designs freeze <strong>6 to 18 months before launch</strong>. '
                'Small lunar missions buy their launch, and by June 2026 SpaceX partners reported new rideshare bookings beyond early 2029 closed'
                '<!-- TODO(source): SpaceNews, late June 2026, via launch-monthly-research-handoff.md -->; Mach33\'s Launch Keystone v1.3 opens Starship '
                'capacity to customers in 2031. These missions slip months to years, so we rate them Medium from {ob:astro-ai-designed-trajectory-flown:S2:medium}.',
        'alt': 'Isometric drawing of a desk orrery of the Earth and Moon with a lit wire tracing a looping lunar transfer and a small spacecraft bead on it.',
    },
    'materials-cots-orbital-compute-ops': {
        'title': 'AI chips serve paying customers in orbit',
        'line': 'We rate SpaceX\'s own AI1 satellites, from its Starmind program: <strong>150 kW peak, 120 kW average, about 2.1 t</strong>, in dawn-dusk sun-synchronous orbit, '
                'where a Starship carries about 60 to 90 t. Outside operators such as Starcloud and Google buy launch and come later. A gigawatt is about '
                '<strong>6,700 AI1s</strong> (8,300 at average power), 14,000 t and 155 to 235 flights; we rate it Medium from {ob:struct-gw-orbital-compute:S2:medium} '
                'in the central scenario. Mach33\'s <a href="https://research.33fg.com/analysis/ai-compute-keystone-model-download" target="_blank" rel="noopener">AI Compute Keystone</a> '
                'models a build-out path that crosses 1 GW in 2028 and reaches 437.9 GW by 2040; our rating is the odds that the milestone has happened, so the two measure different things.',
        'caption': 'Launch cadence sets the date; in the AI Compute Keystone, launch price barely moves the cost crossover. The S-1 puts deployment "as early as 2028", a year before our earliest year. '
                   'The 100 kW class matches our <a href="https://research.33fg.com/analysis/debunking-the-cooling-constraint-in-space-data-centers" target="_blank" rel="noopener">cooling analysis</a>; '
                   'our Nov 2025 "100 GW" estimate counted solar-array power, not whole-satellite mass.',
        'alt': 'Isometric drawing of a compute satellite on its handling fixture, with solar wings, radiator panels and a lit stack of accelerator trays.',
        'role': 'odc',
    },
    'prop-cislunar-propellant-economy': {
        'title': 'Refueling in orbit becomes routine',
        'line': 'A lunar landing campaign takes more than 10 tanker flights: in Mach33\'s lunar logistics work, tankers launched per delivered load fall from about '
                '<strong>30× early to about 7× at maturity</strong><!-- TODO(source): MOONCITY scope, per the 26 Oct Launch Keystone review -->. Better boil-off and gauging '
                'models save a few percent of those flights. The rest depends on SpaceX\'s cadence and reuse, on its own manifest.',
        'alt': 'Isometric drawing of a ship-to-ship cryogenic propellant transfer interface: two tank domes joined by couplings, valves and a lit transfer line.',
        'role': 'lunar',
    },
    'auton-lunar-oxygen-ops': {
        'title': 'A metric ton of lunar oxygen a year',
        'line': 'A 2024 ground rig made <strong>0.07 kg of oxygen an hour, for 9 hours</strong> '
                '(<a href="https://doi.org/10.32865/2346/108973" target="_blank" rel="noopener">ICES 2026</a>). A metric ton a year means 0.11 kg an hour '
                'for 8,760 hours at a 1,600 °C melt, with anodes swapped about 9 times a year even if they reach 1,000 hours, a life no one has shown yet. '
                'AI models help design and run the plant; the date depends on funding, run hours and landing success.',
        'alt': 'Isometric drawing of a pilot molten-regolith oxygen plant on the lunar surface: hopper, lit reactor vessel, oxygen tank and a tall solar mast.',
        'role': 'lunar',
    },
    'prop-35-engine-50-flight-life': {
        'title': 'Fleet-leader engines fly 50 missions without overhaul',
        'line': 'AI life models let operators stretch the gap between teardowns a step at a time. But every data point on engine life '
                'costs a flight, and proving 99% reliability (at 90% confidence) by test alone takes <strong>about 230 failure-free starts</strong>.',
        'alt': 'Isometric drawing of a Raptor 2 engine firing in a vertical test stand, its plume lighting the deck.',
        'credit': 'Raptor illustration: Ryan, MIT license.',
    },
    'robo-24x7-integration-test': {
        'title': 'Robots run integration and test around the clock',
        'line': "In 2019 Rocket Lab's Rosie robot cut one step of building an Electron from 400+ hours to 12, yet its launches rose "
                "<strong>about 3.5×</strong> by 2025 (6 to 21): launch was the limit. Thermal-vacuum tests still run 4 cycles with 12-hour plateaus. "
                "The odds include a faster robot rollout, so a robot milestone can arrive before its listed year.",
        'alt': 'Isometric drawing of a robot arm on a floor rail beside a thermal-vacuum chamber holding a small satellite.',
    },
}


def fill(text, graph):
    """Replace {ob:NODE:SCEN:band} with the year the node's odds reach that band."""
    def ob(m):
        y = graph['nodes'][m.group(1)]['odds_by'][m.group(2)][m.group(3)]
        return 'after 2035' if y.startswith('>') else y
    return re.sub(r'\{ob:([\w-]+):(S[1-4]):(low|medium|high)\}', ob, text)


def fig_file(slug):
    """Return the published path for a finished figure, copying it into the site, or None."""
    os.makedirs(os.path.join(SITE, 'figs'), exist_ok=True)
    svg = os.path.join(FIGS, slug, f'{slug}.svg')
    if os.path.exists(svg) and os.path.getsize(svg) > 2000:
        shutil.copyfile(svg, os.path.join(SITE, 'figs', f'{slug}.svg'))
        return f'figs/{slug}.svg'
    jpg = os.path.join(FIGS, slug, f'{slug}.jpg')
    if os.path.exists(jpg):
        shutil.copyfile(jpg, os.path.join(SITE, 'figs', f'{slug}.jpg'))
        return f'figs/{slug}.jpg'
    return None


def tree_html():
    """The tech-tree hero: markup, its CSS and engine, and the graph data, all inline."""
    data = open(os.path.join(HERE, 'data', 'tree.json')).read()
    d = json.loads(data)
    markup = open(os.path.join(HERE, 'tree.html')).read().replace('__N__', str(len(d['nodes']))).replace('__E__', str(len(d['edges'])))
    return ('<style>' + open(os.path.join(HERE, 'tree.css')).read() + '</style>' + markup
            + '<script>const TREE = ' + data + ';</script><script>' + open(os.path.join(HERE, 'tree.js')).read() + '</script>')


def tree_caption():
    """What to notice in the tree, central scenario, with its numbers counted from the tree data."""
    d = json.load(open(os.path.join(HERE, 'data', 'tree.json')))
    si = d['scenarios'].index('S2')

    def share(k, t):
        ns = [n for n in d['nodes'] if n['k'] == k]
        on = sum(1 for n in ns if n['y'][si] <= t and int(n['o'][si][t - 2026]) >= 2)
        return round(100 * on / len(ns))
    later = [n for n in d['nodes'] if n['y'][si] > 2035]
    hw = [n for n in d['nodes'] if n['k']]
    waiting = sum(1 for n in hw if not (n['y'][si] <= 2035 and int(n['o'][si][-1]) >= 2))
    return (f"Watch the two rows (central scenario): thinking milestones are {share(0, 2029)}% lit by 2029; hardware milestones reach "
            f"{share(1, 2030)}% in 2030 and {share(1, 2035)}% by 2035. At 2035, {waiting} hardware milestones are still unlit: "
            f"{sum(n['k'] for n in later)} of the {len(later)} milestones dated after 2035 are hardware, and the rest have reached their year "
            "but are rated under 30%. A milestone lights once its year has come and its odds for that year are over 30%. "
            "Tap or hover any milestone to see what it waits on; tap a wonder to jump to its card.")


def hero_html():
    d = os.path.join(FIGS, 'two-clocks-machine')
    frag = os.path.join(d, 'two-clocks-machine.fragment.html')
    if os.path.exists(frag):
        return '<div class="machine-frame machine-live">' + open(frag).read().replace('>Fig 2<', '>Fig 1<') + '</div>'
    png = os.path.join(d, 'poster-still.png')
    if os.path.exists(png):
        shutil.copyfile(png, os.path.join(SITE, 'figs', 'two-clocks-machine.png'))
        return '<div class="machine-frame"><img src="figs/two-clocks-machine.png" alt="The two clocks machine"></div>'
    return ''  # no machine yet: the hero stands on the headline and the two numerals


def main():
    facts = json.load(open(os.path.join(HERE, 'data', 'facts.json')))
    graph = json.load(open('graph-v9.json'))
    tiers = {n['id']: n['tier'] for n in graph['nodes'].values()}
    tree = json.load(open(os.path.join(HERE, 'data', 'tree.json')))
    lanes = {n['id']: tree['lanes'][n['l']]['name'] for n in tree['nodes']}
    copy = {}
    for c in facts['cards']:
        k = {f: (fill(v, graph) if isinstance(v, str) else v) for f, v in COPY[c['id']].items()}
        k['kind'] = k.get('kind') or ('think' if tiers[c['id']] <= 4 else 'do')
        k['lane'] = lanes[c['id']]
        if c['figure']:
            k['img'] = fig_file(c['figure'])
        copy[c['id']] = k
    page = open(os.path.join(HERE, 'page.src.html')).read()
    page = page.replace('/*FACTS*/null', json.dumps(facts, separators=(',', ':')))
    page = page.replace('/*COPY*/null', json.dumps(copy, ensure_ascii=False, separators=(',', ':')))
    page = page.replace('<!--HERO-->', tree_html())
    page = page.replace('<!--TREECAP-->', tree_caption())
    os.makedirs(SITE, exist_ok=True)
    out = os.path.join(SITE, 'two-clocks.html')
    open(out, 'w').write(page)
    # Local preview: the artifact host adds the doctype, charset and viewport; a plain static server does not.
    open(os.path.join(SITE, 'preview.html'), 'w').write('<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + page + '</body></html>')
    have = sorted(os.listdir(os.path.join(SITE, 'figs')))
    print('wrote', out, len(page), 'bytes; figures:', have)
    print('kinds:', {c: k['kind'] for c, k in copy.items()})


if __name__ == '__main__':
    main()

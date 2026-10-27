"""Assemble the Two Clocks page from the template, the facts and whichever figures are finished.

Usage: python3 share/build_page.py  (run from model/; run build_facts.py first)
Writes share/site/two-clocks.html and copies figure files into share/site/figs/.
"""
import json, os, shutil, subprocess

HERE = 'share'
SITE = os.path.join(HERE, 'site')
FIGS = os.path.join(HERE, 'figs')

# Card copy. Every number here is from graph-v9.json node text or the model doc (appendix A).
COPY = {
    'verif-assurance-cost-collapse': {
        'kind': 'think',
        'title': 'Machine-checked flight code gets 15–120× cheaper per line',
        # Per-scenario cost per line, from the node's why text (S4 shares S3's cognition).
        'to': {'S1': '$50–150', 'S2': '$5–20', 'S3': '$1–5', 'S4': '$1–5'},
        'title_by': {'S1': 'Machine-checked flight code gets 2–12× cheaper per line',
                     'S3': 'Machine-checked flight code falls to $1–5 a line', 'S4': 'Machine-checked flight code falls to $1–5 a line'},
        'line': 'On the model\'s cost assumptions, proof labor turns into compute. Knowing what to prove stays hard: in an analyst review of 12 notable '
                'mission losses and near-losses, 9 involved software or logic, and in each a <strong>wrong assumption or spec</strong> was the missing piece.',
    },
    'astro-ai-designed-trajectory-flown': {
        'title': 'Missions fly AI-designed trajectories',
        'line': 'Designing the path gets cheap fast. Flying it waits on the manifest: designs freeze <strong>6–18 months before launch</strong>, '
                'and small lunar missions slip months to years.',
        'alt': 'Isometric drawing of a desk orrery of the Earth and Moon with a lit wire tracing a looping lunar transfer and a small spacecraft bead on it.',
    },
    'materials-cots-orbital-compute-ops': {
        'title': 'AI chips serve paying customers in orbit',
        'line': 'Here that means 100 kW-class satellites with paying customers. A gigawatt is another matter: about <strong>4,000 satellites</strong> '
                'at their 250 kW peak rating and 110–180 Starship flights, in the base case Low by 2031 and Medium by 2035. '
                'AI math saves 2–9% of launched mass; launch sets the date.',
        'alt': 'Isometric drawing of a compute satellite on its handling fixture, with solar wings, radiator panels and a lit stack of accelerator trays.',
    },
    'prop-cislunar-propellant-economy': {
        'title': 'Refueling in orbit becomes routine',
        'line': 'A lunar landing campaign takes more than 10 tanker flights. Better boil-off and gauging models save '
                '<strong>a few percent</strong> of them. Cadence and reuse decide the rest.',
        'alt': 'Isometric drawing of a ship-to-ship cryogenic propellant transfer interface: two tank domes joined by couplings, valves and a lit transfer line.',
    },
    'auton-lunar-oxygen-ops': {
        'title': 'A tonne of lunar oxygen a year',
        'line': 'A 2024 ground rig made <strong>0.07 kg of oxygen an hour, for 9 hours</strong>. A tonne a year means 0.11 kg/h '
                'for 8,760 hours at a 1,600 °C melt, with anodes swapped about 9 times a year even if they reach 1,000 hours, a life no one has shown yet. '
                'AI models help design and run the plant, but funding, run hours and landing success set the date.',
        'alt': 'Isometric drawing of a pilot molten-regolith oxygen plant on the lunar surface: hopper, lit reactor vessel, oxygen tank and a tall solar mast.',
    },
    'prop-35-engine-50-flight-life': {
        'title': 'Fleet-leader engines fly 50 missions without overhaul',
        'line': 'AI life models let operators stretch the gap between teardowns a step at a time. But every data point on engine life '
                'costs a flight, and proving 99% reliability (at 90% confidence) by test alone takes <strong>about 230 failure-free starts</strong>.',
        'alt': 'Isometric drawing of a Raptor 2 engine firing in a vertical test stand, its plume lighting the deck.',
        'credit': 'Raptor 2 on a test stand: an example figure from the Anatomy skill, by Ryan (MIT).',
    },
    'robo-24x7-integration-test': {
        'title': 'Robots run integration and test around the clock',
        'line': "In 2019 Rocket Lab's Rosie robot cut one step of building an Electron from 400+ hours to 12, yet launches rose "
                "<strong>only about 3.5×</strong> by 2025: launch, not labor, was the limit. Thermal-vacuum tests still run 4 cycles with 12-hour plateaus. "
                "Robot odds also weigh a faster robot path, so they can run ahead of the date.",
        'alt': 'Isometric drawing of a robot arm on a floor rail beside a thermal-vacuum chamber holding a small satellite.',
    },
}


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
    """What to notice in the tree, base case, with its numbers counted from the tree data."""
    d = json.load(open(os.path.join(HERE, 'data', 'tree.json')))
    si = d['scenarios'].index('S2')

    def share(k, t):
        ns = [n for n in d['nodes'] if n['k'] == k]
        on = sum(1 for n in ns if n['y'][si] <= t and int(n['o'][si][t - 2026]) >= 2)
        return round(100 * on / len(ns))
    later = [n for n in d['nodes'] if n['y'][si] > 2035]
    return (f"Watch the two rows (base case): research techs are {share(0, 2029)}% lit by 2029; build techs reach "
            f"{share(1, 2030)}% in 2030 and {share(1, 2035)}% by 2035, and {sum(n['k'] for n in later)} of the {len(later)} techs "
            "pushed past 2035 are hardware. A tech lights once its year has come and it is rated over 30% likely at the next "
            "checkpoint (end-2031, then end-2035). Hover any tech to see what it waits on; click a wonder to jump to its card.")


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
        k = dict(COPY[c['id']])
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

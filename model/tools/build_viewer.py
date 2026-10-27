"""Build the interactive skill-tree page from a graph file.

Usage: python3 build_viewer.py GRAPH.json TEMPLATE.html OUT.html [WF_RESULT.json ...]
WF_RESULT.json (optional) is the build-verify workflow's return value; its per-branch debates are attached.
"""
import json, sys, os, re

DOMAIN_TITLES = {
    'verif': 'Flight software and certification',
    'astro': 'Astrodynamics, guidance and space traffic',
    'prop': 'Propulsion, fluids and combustion',
    'plasma': 'Plasma, electric propulsion and space weather',
    'hyper': 'Hypersonics, entry and thermal protection',
    'materials': 'Materials, electronics and manufacturing',
    'struct': 'Structures, thermal, power and orbital compute',
    'comms': 'Communications, networks and security',
    'auton': 'Autonomy, robotics, ISRU and life support',
    'science': 'Space science and physics ceilings',
    'frontier': 'The mathematics frontier',
    'capability': 'The AI capability curve',
    'physclock': 'The physical clock',
    'robots': 'General-purpose robotics',
}
TIERS = [
    (0, 'AI capability and infrastructure', 'AI capability'),
    (1, 'Frontier mathematics', 'Frontier math'),
    (2, 'Applied math and verification', 'Applied math'),
    (3, 'Physics models and theory', 'Physics models'),
    (4, 'Engineering tools and methods', 'Engineering tools'),
    (5, 'Validated technology', 'Validated tech'),
    (6, 'Operational systems and missions', 'Systems & missions'),
    (7, 'Strategic and economic outcomes', 'Outcomes'),
]
SCENARIOS = [
    {'id': 'S1', 'name': 'Plateau', 'blurb': 'AI math stays near today’s level. Task horizon doubles every 12–18 months; research-grade math reaches outside teams around 2028.'},
    {'id': 'S2', 'name': 'Exponential', 'blurb': 'Central scenario. Doubling every 6–9 months; public research-grade math in 2027, applied math and verified numerics by 2028, physics theory-building by 2029.'},
    {'id': 'S3', 'name': 'Recursive', 'blurb': 'Exponential until 2028, then AI speeds its own research (about 3-month doubling); cognitive work is near-free from about 2029.'},
    {'id': 'S4', 'name': 'Embodied', 'blurb': 'Recursive cognition plus general-purpose robots at scale: about 6 million in service by 2031 and 60 million by 2035, including robots building robots. Same as Recursive through 2031; differs after.'},
]
BEYOND = 2036.0
SHORT = {'robots': 'robots', 'trunk': 'trunk', 'math-frontier': 'math frontier', 'verified-autonomy': 'verified software', 'networks': 'networks',
         'certification': 'certification', 'engines-materials': 'engines', 'entry': 'entry', 'orbital-compute-power': 'orbital compute',
         'moon-mars': 'Moon and Mars', 'science': 'science', 'safe-orbits': 'safe orbits', 'plasma-nuclear': 'plasma and nuclear'}


def year(s):
    if s is None:
        return None
    s = str(s).strip().lower()
    m0 = re.match(r'^>\s*(20\d\d)', s)
    if m0:
        return min(float(int(m0.group(1)) + 1), BEYOND)
    if 'post' in s or 'beyond' in s or 'never' in s:
        return BEYOND
    if 'exist' in s or 'already' in s or 'now' in s:
        return 2026.0
    m = [int(x) for x in re.findall(r'(20\d\d)', s)]
    if not m:
        return None
    r = re.search(r'(20\d\d)\s*[-–]\s*(\d\d)\b', s)
    if r and len(m) == 1:
        return (int(r.group(1)) + int('20' + r.group(2))) / 2
    return sum(m) / len(m) if len(m) <= 2 else float(m[0])


def scrub(text, nodes):
    if not text:
        return text
    ids = sorted(nodes, key=len, reverse=True)
    rx = re.compile(r'(?<![\w-])(' + '|'.join(re.escape(i) for i in ids) + r')(?![\w-])')
    text = rx.sub(lambda m: '"' + (nodes[m.group(1)].get('title') or m.group(1)) + '"', text)
    text = re.sub(r'\s*\((?:per )?(?:analyst )?(?:position )?(?:tl|fc|tr)-position-\d(?:[,; ]+(?:tl|fc|tr)-position-\d)*\)', '', text)
    return re.sub(r"\bclient\b", "study", text)


def md_segments(par):
    """Split a markdown paragraph into text / link / bold segments (no HTML)."""
    par = ' '.join(par.split())
    out, pos = [], 0
    for m in re.finditer(r'\[([^\]]+)\]\((https?://[^)\s]+)\)|\*\*([^*]+)\*\*', par):
        if m.start() > pos:
            out.append({'t': par[pos:m.start()]})
        if m.group(2):
            out.append({'t': m.group(1), 'a': m.group(2)})
        else:
            out.append({'t': m.group(3), 'b': 1})
        pos = m.end()
    if pos < len(par):
        out.append({'t': par[pos:]})
    for o in out:
        o['t'] = re.sub(r'(?<![*])\*([^*]+)\*(?![*])', r'\1', o['t'])
    return out


def main():
    gpath, tpath, opath = sys.argv[1:4]
    g = json.load(open(gpath))
    debates = {}
    for f in sys.argv[4:]:
        if not os.path.exists(f):
            continue
        wf = json.load(open(f))
        for c in (wf.get('challenge') or []):
            if c:
                debates.setdefault(c['branch'], []).extend(dict(d, round='2031 review') for d in c.get('debates', []))
        for c in (wf.get('branches') or []):
            if c:
                debates.setdefault(c['branch'], []).extend(dict(d, round='2035 and Embodied review') for d in c.get('debates', []))

    branches = g.get('branches') or []
    if not branches:  # development fallback: one branch per domain
        doms = sorted({n.get('domain') for n in g['nodes'].values()})
        branches = [{'id': d, 'title': DOMAIN_TITLES.get(d, d), 'thesis': '', 'nodes': [k for k, n in g['nodes'].items() if n.get('domain') == d], 'spine': [], 'roots': []} for d in doms]
    branches = sorted(branches, key=lambda b: b.get('order', 99))
    member = {}
    for b in branches:
        for k in b.get('nodes', []):
            member.setdefault(k, b['id'])

    nodes = {}
    for k, n in g['nodes'].items():
        nodes[k] = {
            't': n.get('title'), 'tier': n.get('tier'), 'kind': n.get('kind'),
            'd': n.get('description'), 'st': n.get('status_oct2026'), 'fam': n.get('catalog_families', []),
            'pre': n.get('prerequisites', []), 'acc': n.get('accelerated_by', []), 'unl': n.get('unlocks', []),
            'gate': n.get('binding_gate'), 'gate2': n.get('runner_up_gate'), 'gnote': n.get('gate_note'), 'path': n.get('pathway'),
            'ys': n.get('earliest_year', {}), 'y': {s: year((n.get('earliest_year') or {}).get(s)) for s in ('S1', 'S2', 'S3', 'S4')},
            'b': n.get('band_2031', {}), 'b5': n.get('band_2035', {}), 'n35': n.get('note_2035'), 'pt': n.get('premise_tier'),
            # odds for each year 2026..2035, one letter a year (S, L, M, H), per scenario
            'by': {s: ''.join(b[0] for b in v) for s, v in (n.get('band_by_year') or {}).items()},
            'ob': n.get('odds_by', {}),
            'why': n.get('why'), 'small': n.get('strongest_case_small'), 'sign': n.get('signpost'),
            'dom': n.get('domain'), 'br': member.get(k),
        }
    domains = {}
    for key, d in (g.get('domains') or {}).items():
        domains[key] = {
            'title': DOMAIN_TITLES.get(key, key),
            'nil': [scrub(x, g['nodes']) for x in d.get('nil_effects', [])],
            'insights': d.get('key_insights', []),
            'sources': [{'title': s.get('title'), 'url': s.get('url'), 'date': s.get('date')} for s in d.get('sources', []) if s.get('url', '').startswith('http')],
        }
    for n in nodes.values():
        if n['dom'] and n['dom'] not in domains:
            domains[n['dom']] = {'title': DOMAIN_TITLES.get(n['dom'], n['dom']), 'nil': [], 'insights': [], 'sources': []}

    out_br = []
    ndir = os.path.join(os.path.dirname(os.path.abspath(gpath)), 'doc', 'branches')
    for b in branches:
        narr = []
        f = os.path.join(ndir, b['id'] + '.md')
        if os.path.exists(f):
            narr = [md_segments(p) for p in re.split(r'\n\s*\n', open(f).read().strip()) if p.strip() and not p.strip().startswith('#')]
        deb = [{k: (scrub(v, g['nodes']) if isinstance(v, str) else v) for k, v in d.items()} for d in debates.get(b['id'], [])]
        out_br.append({k: b.get(k) for k in ('id', 'title', 'thesis', 'reader_hook', 'binding_gate', 'roots', 'spine', 'nodes', 'side_chains')} | {'debates': deb, 'narr': narr, 'short': SHORT.get(b['id'], b['id'])})

    data = {
        'meta': {'asOf': '2026-10-07', 'nNodes': len(nodes), 'nEdges': sum(len(n['pre']) for n in nodes.values())},
        'scenarios': SCENARIOS,
        'tiers': [{'t': t, 'name': a, 'short': s} for t, a, s in TIERS],
        'branches': out_br, 'nodes': nodes, 'domains': domains,
    }
    blob = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'share'))
    import brand  # Mach33 brand fonts and wordmarks, shared with the Two Clocks page
    html = open(tpath).read().replace('__VIEWER_DATA__', blob)
    html = html.replace('/*BRAND-FONTS*/', brand.font_css()).replace('<!--WORDMARK-->', brand.wordmark(16, colour='black') + brand.wordmark(16, colour='white'))
    open(opath, 'w').write(html)
    print(f'wrote {opath}: {len(html)/1e6:.2f} MB, {len(nodes)} nodes, {len(out_br)} branches')


if __name__ == '__main__':
    main()

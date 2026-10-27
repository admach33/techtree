"""Build the compact tech-tree data behind the Two Clocks hero.

Every node of the graph goes in, so the hero shows the whole tree; the seven unlock cards become "wonders".
Usage: python3 share/build_tree.py  (run from model/)
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(__file__))
from build_page import COPY  # noqa: E402  (card copy: wonder titles and the flight-code cost per scenario)

GRAPH = 'graph-v8.json'
OUT = 'share/data/tree.json'
SCEN = ['S1', 'S2', 'S3', 'S4']
RANK = {'Speculative': 0, 'Low': 1, 'Medium': 2, 'High': 3}
LATER = 2036  # column for "after 2035"

# Lane names short enough for a game sidebar, and the icon each lane draws.
LANES = {
    'trunk': ('AI and launch', 'chip'),
    'math-frontier': ('Famous problems', 'sigma'),
    'verified-autonomy': ('Provable software', 'shield'),
    'networks': ('Links and spectrum', 'dish'),
    'certification': ('Certification', 'stamp'),
    'engines-materials': ('Engines, fuels, alloys', 'flame'),
    'entry': ('Reentry', 'capsule'),
    'orbital-compute-power': ('Orbital compute', 'satellite'),
    'moon-mars': ('Moon and Mars', 'moon'),
    'science': ('Space science', 'telescope'),
    'safe-orbits': ('Safe orbits', 'orbit'),
    'plasma-nuclear': ('Plasma and nuclear', 'atom'),
    'robots': ('Robots', 'arm'),
}

# The seven unlock cards, as wonders: short name and the illustration the toast shows.
WONDERS = {
    'verif-assurance-cost-collapse': ('Proved flight code', None),
    'astro-ai-designed-trajectory-flown': ('AI-designed trajectories', 'figs/orrery.svg'),
    'materials-cots-orbital-compute-ops': ('AI chips in orbit', 'figs/compute-sat.svg'),
    'prop-cislunar-propellant-economy': ('Orbital refueling', 'figs/refuel.svg'),
    'auton-lunar-oxygen-ops': ('Lunar oxygen', 'figs/lunar-o2.svg'),
    'prop-35-engine-50-flight-life': ('50-flight engines', 'figs/raptor.jpg'),
    'robo-24x7-integration-test': ('Round-the-clock robot test', 'figs/robot-it.svg'),
}

TIER_NAMES = ['AI capability and infrastructure', 'Frontier math', 'Applied math', 'Physics models', 'Engineering tools',
              'Validated technology', 'Systems and missions', 'Strategic outcomes']


def year(v):
    return LATER if v.startswith('>') else int(v)


READER = {'S1': 'Plateau', 'S2': 'the base case', 'S3': 'Recursive', 'S4': 'Embodied'}


WEAK_END = {'a', 'an', 'the', 'of', 'to', 'and', 'or', 'by', 'for', 'in', 'on', 'at', 'with', 'from', 'as', 'than', 'that', 'its', 'is', 'are', 'be'}


def first_sentence(text, limit=320):
    """The first sentence, without splitting at abbreviations; long ones end at a clause boundary."""
    text = re.sub(r'\b(S[1-4])\b', lambda m: READER[m.group(1)], text)
    s = re.split(r'(?<!U\.S\.)(?<!e\.g\.)(?<!i\.e\.)(?<!vs\.)(?<=[.!?])\s', text.strip(), maxsplit=1)[0]
    if limit is None or len(s) <= limit:
        return s
    cut = s[:limit]
    for mark in ('; ', ', ', ' ('):
        k = cut.rfind(mark)
        if k > limit * 0.6:
            cut = cut[:k]
            break
    words = cut.rstrip(' ,;:(').split(' ')
    while words and words[-1].lower() in WEAK_END:
        words.pop()
    return ' '.join(words) + '…'


def main():
    g = json.load(open(GRAPH))
    N = g['nodes']
    lane_ids = [b['id'] for b in g['branches']]
    lane_of = {nid: lane_ids.index(b['id']) for b in g['branches'] for nid in b['nodes']}
    order = sorted(N, key=lambda k: (lane_of[k], N[k]['tier'], N[k]['year_num']['S2'] or LATER, k))
    index = {k: i for i, k in enumerate(order)}
    nodes = []
    for k in order:
        n = N[k]
        w = WONDERS.get(k)
        nodes.append({
            'id': k, 't': n['title'], 'l': lane_of[k], 'k': 1 if n['tier'] >= 5 else 0, 'tier': n['tier'],
            'y': [year(n['earliest_year'][s]) for s in SCEN],
            'a': [RANK[n['band_2031'][s]] for s in SCEN], 'b': [RANK[n['band_2035'][s]] for s in SCEN],
            'g': n['binding_gate'], 'd': first_sentence(n['description'], None if w else 320),
            **({'w': w[0], 'img': w[1], 'wt': [COPY[k].get('title_by', {}).get(s, COPY[k]['title']) for s in SCEN],
                **({'wb': [COPY[k]['to'][s] for s in SCEN]} if 'to' in COPY[k] else {})} if w else {}),
        })
    edges = [[index[p], index[k]] for k in order for p in N[k]['prerequisites'] if p in index]
    data = {'lanes': [{'id': i, 'name': LANES[i][0], 'icon': LANES[i][1]} for i in lane_ids],
            'tiers': TIER_NAMES, 'years': list(range(2026, LATER + 1)), 'scenarios': SCEN,
            'nodes': nodes, 'edges': edges}
    json.dump(data, open(OUT, 'w'), separators=(',', ':'), ensure_ascii=False)
    print(f'{len(nodes)} nodes, {len(edges)} edges, {len(data["lanes"])} lanes, '
          f'{sum(1 for n in nodes if "w" in n)} wonders, {len(json.dumps(data)) // 1024} KB')


if __name__ == '__main__':
    main()

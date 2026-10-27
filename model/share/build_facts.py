"""Build the numbers behind the Two Clocks page from the model graph.

Every figure the page shows comes from here, so the page cannot drift from the model.
Usage: python3 share/build_facts.py  (run from model/)
"""
import json, collections

GRAPH = 'graph-v8.json'
OUT = 'share/data/facts.json'
SCEN = ['S1', 'S2', 'S3', 'S4']
NAMES = {'S1': 'Plateau', 'S2': 'Exponential', 'S3': 'Recursive', 'S4': 'Embodied'}
YEARS = list(range(2026, 2036))
BEYOND = 2036.0
RANK = {'Speculative': 0, 'Low': 1, 'Medium': 2, 'High': 3}

# The unlock cards, in story order, with the figure that illustrates each.
CARDS = [
    ('verif-assurance-cost-collapse', None),
    ('astro-ai-designed-trajectory-flown', 'orrery'),
    ('materials-cots-orbital-compute-ops', 'compute-sat'),
    ('prop-cislunar-propellant-economy', 'refuel'),
    ('auton-lunar-oxygen-ops', 'lunar-o2'),
    ('prop-35-engine-50-flight-life', 'raptor'),
    ('robo-24x7-integration-test', 'robot-it'),
]

# Amdahl table, model doc section 3 (illustrative critical-path shares, speedups by 2031).
AMDAHL = [
    ('Requirements and trade studies', 0.10, 'think', [2, 5, 20]),
    ('Design and analysis', 0.15, 'think', [2, 10, 50]),
    ('Software and verification', 0.10, 'think', [2, 5, 20]),
    ('Fabrication and procurement', 0.25, 'do', [1.0, 1.1, 1.3]),
    ('Integration and test', 0.25, 'do', [1.0, 1.2, 1.5]),
    ('Qualification and reviews', 0.10, 'do', [1.0, 1.2, 1.5]),
    ('Launch campaign', 0.05, 'do', [1.0, 1.0, 1.0]),
]


def yr(n, s):
    v = n['year_num'].get(s)
    return BEYOND if v is None else min(v, BEYOND)


def band_at(n, s, y):
    return n['band_2031'][s] if y <= 2031 else n['band_2035'][s]


def unlocked(n, s, y):
    return yr(n, s) < BEYOND and int(yr(n, s)) <= y and RANK.get(band_at(n, s, y), 0) >= 2


def main():
    g = json.load(open(GRAPH))
    N = g['nodes']
    cog = [n for n in N.values() if n['tier'] <= 4]
    phy = [n for n in N.values() if n['tier'] >= 5]
    f = {'scenario_names': NAMES, 'n_nodes': len(N), 'n_cognitive': len(cog), 'n_physical': len(phy),
         'n_branches': len(g['branches'])}

    curve = {}
    for s in SCEN:
        rows = []
        for y in YEARS:
            c = sum(unlocked(n, s, y) for n in cog) / len(cog)
            p = sum(unlocked(n, s, y) for n in phy) / len(phy)
            rows.append({'year': y, 'cognitive': round(100 * c), 'physical': round(100 * p),
                         'gap': round(100 * c) - round(100 * p)})
        curve[s] = rows
    f['clock_curve'] = curve
    f['gap_peak'] = {s: max(curve[s], key=lambda r: r['gap']) for s in SCEN}

    # What can be proved runs ahead of what can be flown (tiers 1-3 against tiers 5-6).
    proof = [n for n in N.values() if n['tier'] in (1, 2, 3)]
    hard = [n for n in N.values() if n['tier'] in (5, 6)]
    f['proved_vs_flown'] = {str(y): {'proof_reached': sum(yr(n, 'S2') <= y for n in proof), 'proof_total': len(proof),
                                     'hardware_reached': sum(yr(n, 'S2') <= y for n in hard), 'hardware_total': len(hard)}
                            for y in (2029, 2031, 2035)}

    outcomes = [n for n in N.values() if n['tier'] in (6, 7)]
    gates = collections.Counter(n['binding_gate'] for n in outcomes)
    f['outcome_gates'] = {'total': len(outcomes), 'counts': dict(gates.most_common()),
                          'cognition': sum(v for k, v in gates.items() if k in ('cognitive', 'cognition', 'math', 'formalization'))}

    def share(ns, s, key):
        return round(100 * sum(RANK[n[key][s]] >= 2 for n in ns) / len(ns))
    f['physical_share'] = {s: {'2031': share(phy, s, 'band_2031'), '2035': share(phy, s, 'band_2035')} for s in SCEN}
    f['cognitive_share'] = {s: {'2031': share(cog, s, 'band_2031'), '2035': share(cog, s, 'band_2035')} for s in SCEN}

    am = []
    for i, s in enumerate(['S1', 'S2', 'S3']):
        length = sum(sh / sp[i] for _, sh, _, sp in AMDAHL)
        think = [sp[i] for _, _, k, sp in AMDAHL if k == 'think']
        am.append({'scenario': s, 'length': round(length, 3), 'shorter_pct': round(100 * (1 - length)),
                   'speedup': round(1 / length, 1), 'think_min': min(think), 'think_max': max(think)})
    f['amdahl'] = {'rows': [{'activity': a, 'share': sh, 'kind': k, 'speedup': sp} for a, sh, k, sp in AMDAHL],
                   'scenarios': am, 'think_share': sum(sh for _, sh, k, _ in AMDAHL if k == 'think')}

    cards = []
    for nid, fig in CARDS:
        n = N[nid]
        cards.append({'id': nid, 'figure': fig, 'title': n['title'], 'branch': n['domain'], 'gate': n['binding_gate'],
                      'year': n['earliest_year'], 'band_2031': n['band_2031'], 'band_2035': n['band_2035']})
    f['cards'] = cards

    json.dump(f, open(OUT, 'w'), indent=1)
    s2 = f['clock_curve']['S2']
    print('S2 2028', s2[2], 'peak', f['gap_peak'])
    print('proved vs flown', f['proved_vs_flown'])
    print('gates', f['outcome_gates'])
    print('physical', f['physical_share'], '\ncognitive', f['cognitive_share'])
    print('amdahl', f['amdahl']['scenarios'])
    for c in cards:
        print(c['year']['S2'], c['band_2031']['S2'], c['band_2035']['S2'], c['gate'], c['title'])


if __name__ == '__main__':
    main()

"""Build the numbers behind the Two Clocks page from the model graph.

Every figure the page shows comes from here, so the page cannot drift from the model.
Usage: python3 share/build_facts.py  (run from model/)
"""
import json, collections

GRAPH = 'graph-v9.json'
OUT = 'share/data/facts.json'
SCEN = ['S1', 'S2', 'S3', 'S4']
NAMES = {'S1': 'Plateau', 'S2': 'Exponential', 'S3': 'Recursive', 'S4': 'Embodied'}
YEARS = list(range(2026, 2036))
BEYOND = 2036.0
RANK = {'Speculative': 0, 'Low': 1, 'Medium': 2, 'High': 3}
THINKING = ('cognitive', 'formalization')

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
    """Odds of being achieved by the end of year y, rated for every year (band_by_year, from odds_by)."""
    return n['band_by_year'][s][YEARS.index(y)]


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
    # The second stat card shows 2035; when a scenario's widest gap is in 2035 itself, show 2031 instead so the two
    # cards never repeat the same numbers.
    f['second_stat'] = {s: (curve[s][-1] if f['gap_peak'][s]['year'] != YEARS[-1] else curve[s][YEARS.index(2031)]) for s in SCEN}
    f['curve_steps'] = {s: {'thinking_max_step_to_2031': max(curve[s][i]['cognitive'] - curve[s][i - 1]['cognitive'] for i in range(1, YEARS.index(2031) + 1)),
                            'max_step': max(max(abs(curve[s][i][k] - curve[s][i - 1][k]) for k in ('cognitive', 'physical')) for i in range(1, len(YEARS)))}
                        for s in SCEN}

    # What can be proved runs ahead of what can be flown (tiers 1-3 against tiers 5-6).
    proof = [n for n in N.values() if n['tier'] in (1, 2, 3)]
    hard = [n for n in N.values() if n['tier'] in (5, 6)]
    f['proved_vs_flown'] = {str(y): {'proof_reached': sum(yr(n, 'S2') <= y for n in proof), 'proof_total': len(proof),
                                     'hardware_reached': sum(yr(n, 'S2') <= y for n in hard), 'hardware_total': len(hard)}
                            for y in (2029, 2031, 2035)}

    outcomes = [n for n in N.values() if n['tier'] in (6, 7)]
    gates = collections.Counter(n['binding_gate'] for n in outcomes)
    runner = collections.Counter(n.get('runner_up_gate') for n in outcomes)
    f['outcome_gates'] = {'total': len(outcomes), 'counts': dict(gates.most_common()),
                          'cognition': sum(v for k, v in gates.items() if k in THINKING),
                          'runner_up': dict(runner.most_common()),
                          'runner_up_thinking': sum(v for k, v in runner.items() if k in THINKING),
                          'launch': gates.get('launch-internal', 0) + gates.get('launch-external', 0)}

    def share(ns, s, y):
        return round(100 * sum(RANK[band_at(n, s, y)] >= 2 for n in ns) / len(ns))
    f['physical_share'] = {s: {'2031': share(phy, s, 2031), '2035': share(phy, s, 2035)} for s in SCEN}
    f['cognitive_share'] = {s: {'2031': share(cog, s, 2031), '2035': share(cog, s, 2035)} for s in SCEN}
    # How far one rating change moves a share: one node out of each denominator, in percentage points.
    f['one_node_pts'] = {'cognitive': round(100 / len(cog), 1), 'physical': round(100 / len(phy), 1)}

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
                      'runner_up': n.get('runner_up_gate'), 'year': n['earliest_year'], 'odds_by': n['odds_by'],
                      'band_2031': n['band_2031'], 'band_2035': n['band_2035']})
    f['cards'] = cards

    json.dump(f, open(OUT, 'w'), indent=1)
    s2 = f['clock_curve']['S2']
    print('S2 curve', [(r['year'], r['cognitive'], r['physical']) for r in s2])
    print('peak', f['gap_peak'], '\nsecond stat', f['second_stat'], '\nsteps', f['curve_steps'])
    print('proved vs flown', f['proved_vs_flown'])
    print('gates', f['outcome_gates'])
    print('physical', f['physical_share'], '\ncognitive', f['cognitive_share'])
    print('amdahl', f['amdahl']['scenarios'])
    for c in cards:
        print(c['year']['S2'], c['band_2031']['S2'], c['band_2035']['S2'], c['gate'], c['title'])


if __name__ == '__main__':
    main()

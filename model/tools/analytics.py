"""Compute model analytics from a graph file (4 scenarios, odds rated for every year 2026-2035).

Usage: python3 analytics.py GRAPH.json OUT.json
"""
import json, sys, collections, statistics

SCEN = ['S1', 'S2', 'S3', 'S4']
BEYOND = 2036.0
YEARS = list(range(2026, 2036))
RANK = {'Speculative': 0, 'Low': 1, 'Medium': 2, 'High': 3}
AI_ROOTS = ('cap-', 'infra-')


def y(n, s):
    v = n['year_num'].get(s)
    return BEYOND if v is None else min(v, BEYOND)


def band_at(n, s, yr):
    """Likelihood of being achieved by the end of a calendar year (band_by_year, derived from odds_by)."""
    if 'band_by_year' in n:
        return n['band_by_year'][s][YEARS.index(min(max(yr, YEARS[0]), YEARS[-1]))]
    return n['band_2031'][s] if yr <= 2031 else n['band_2035'][s]  # graphs before v9


def likely(n, s, yr):
    return y(n, s) < BEYOND and int(y(n, s)) <= yr and RANK.get(band_at(n, s, yr), 0) >= 2


THINKING = ('cognitive', 'formalization')


def reached(n, s, yr):
    return y(n, s) < BEYOND and int(y(n, s)) <= yr


def main():
    g = json.load(open(sys.argv[1]))
    N = g['nodes']
    out = {'scenarios': SCEN, 'years': YEARS}

    shift = {}
    for t in range(8):
        ns = [n for n in N.values() if n['tier'] == t]
        if not ns:
            continue
        shift[t] = {
            'n': len(ns),
            'mean_S2_year': round(statistics.mean(y(n, 'S2') for n in ns), 2),
            'shift_S1_S2': round(statistics.mean(y(n, 'S1') - y(n, 'S2') for n in ns), 2),
            'shift_S2_S3': round(statistics.mean(y(n, 'S2') - y(n, 'S3') for n in ns), 2),
            'shift_S3_S4': round(statistics.mean(y(n, 'S3') - y(n, 'S4') for n in ns), 2),
            'hm_2031': {s: round(sum(1 for n in ns if RANK[n['band_2031'][s]] >= 2) / len(ns), 2) for s in SCEN},
            'hm_2035': {s: round(sum(1 for n in ns if RANK[n['band_2035'][s]] >= 2) / len(ns), 2) for s in SCEN},
            'reached_2031': {s: round(sum(1 for n in ns if y(n, s) <= 2031) / len(ns), 2) for s in SCEN},
            'reached_2035': {s: round(sum(1 for n in ns if y(n, s) <= 2035) / len(ns), 2) for s in SCEN},
        }
    out['tier_shift'] = shift

    cog = [n for n in N.values() if n['tier'] <= 4]
    phy = [n for n in N.values() if n['tier'] >= 5]
    out['clock_curve'] = {s: {yr: {'cognitive': round(sum(likely(n, s, yr) for n in cog) / len(cog), 3),
                                   'physical': round(sum(likely(n, s, yr) for n in phy) / len(phy), 3)} for yr in YEARS} for s in SCEN}
    out['n_cog'], out['n_phys'] = len(cog), len(phy)

    per_year = {}
    for s in SCEN:
        per_year[s] = {}
        for yr in YEARS + ['>2035']:
            sel = [n for n in N.values() if (y(n, s) >= BEYOND if yr == '>2035' else (y(n, s) < BEYOND and int(y(n, s)) == yr))]
            per_year[s][str(yr)] = sorted(([n['id'], n['tier'], n['title'], n['band_2031'][s], n['band_2035'][s]] for n in sel), key=lambda r: (r[1], r[2]))
    out['per_year'] = per_year

    memo = {}

    def reach(k):
        if k in memo:
            return memo[k]
        r = set()
        for u in N[k].get('unlocks', []):
            if u in N:
                r.add(u)
                r |= reach(u)
        memo[k] = r
        return r
    sys.setrecursionlimit(10000)
    ks = sorted(((len(reach(k)), k) for k in N), reverse=True)
    out['keystones'] = [{'id': k, 'title': N[k]['title'], 'tier': N[k]['tier'], 'reach': c, 'S2': N[k]['earliest_year']['S2'],
                         'reach_tier6_7': sum(1 for x in reach(k) if N[x]['tier'] >= 6)} for c, k in ks[:40]]

    def crit(k, s):
        path, cur = [k], k
        while True:
            pre = [p for p in N[cur]['prerequisites'] if p in N]
            if not pre:
                break
            cur = max(pre, key=lambda p: (y(N[p], s), N[p]['tier']))
            path.append(cur)
        return list(reversed(path))

    def ancestors(k, seen=None):
        seen = set() if seen is None else seen
        for p in N[k]['prerequisites']:
            if p in N and p not in seen:
                seen.add(p)
                ancestors(p, seen)
        return seen

    def cps(s, checkpoint):
        bf = 'band_2031' if checkpoint == 2031 else 'band_2035'
        rows = []
        for k, n in N.items():
            if n['tier'] >= 5 and RANK[n[bf][s]] >= 2 and y(n, s) <= checkpoint:
                p = crit(k, s)
                anc = ancestors(k)
                rows.append({'id': k, 'title': n['title'], 'tier': n['tier'], 'year': n['earliest_year'][s], 'band': n[bf][s],
                             'gate': n['binding_gate'], 'path': [[x, N[x]['tier'], N[x]['earliest_year'][s], N[x]['binding_gate']] for x in p],
                             'ai_in_ancestry': any(a.startswith(AI_ROOTS) for a in anc),
                             'ai_on_critical_path': any(x.startswith(AI_ROOTS) for x in p),
                             'public_on_critical_path': 'cap-research-math-public' in p,
                             'robots_in_ancestry': any(a.startswith('robo-') for a in anc) or any(a.startswith('robo-') for a in N[k].get('accelerated_by', [])),
                             'robots_on_critical_path': any(x.startswith('robo-') for x in p)})
        return sorted(rows, key=lambda r: (r['tier'], y(N[r['id']], s)))
    out['critical_paths'] = {'S2_2031': cps('S2', 2031), 'S2_2035': cps('S2', 2035), 'S4_2035': cps('S4', 2035)}

    out['gap'] = {s: {yr: [sum(1 for n in N.values() if 1 <= n['tier'] <= 3 and reached(n, s, yr)),
                          sum(1 for n in N.values() if 5 <= n['tier'] <= 6 and reached(n, s, yr))] for yr in YEARS} for s in SCEN}

    s4credit = [n for n in N.values() if y(n, 'S4') < y(n, 'S3') or RANK[n['band_2035']['S4']] > RANK[n['band_2035']['S3']]]
    out['s4_credit'] = {'n': len(s4credit), 'n_year_earlier': sum(1 for n in s4credit if y(n, 'S4') < y(n, 'S3')),
                        'n_band_up_2035': sum(1 for n in s4credit if RANK[n['band_2035']['S4']] > RANK[n['band_2035']['S3']]),
                        'n_pre2032_diff': sum(1 for n in N.values() if (y(n, 'S4') != y(n, 'S3') and min(y(n, 'S3'), y(n, 'S4')) <= 2031) or n['band_2031']['S4'] != n['band_2031']['S3']),
                        'nodes': sorted(([n['id'], n['title'], n['tier'], n['earliest_year']['S3'], n['earliest_year']['S4'], n['band_2035']['S3'], n['band_2035']['S4']] for n in s4credit), key=lambda r: (r[2], r[0]))}

    bs = []
    for b in g.get('branches', []):
        ids = [k for k in b.get('nodes', []) if k in N]
        if not ids:
            continue
        bs.append({'id': b['id'], 'title': b.get('title'), 'n': len(ids),
                   'hm_2031': {s: sum(1 for k in ids if RANK[N[k]['band_2031'][s]] >= 2 and y(N[k], s) <= 2031) for s in SCEN},
                   'hm_2035': {s: sum(1 for k in ids if RANK[N[k]['band_2035'][s]] >= 2 and y(N[k], s) <= 2035) for s in SCEN},
                   'gates': dict(collections.Counter(N[k]['binding_gate'] for k in ids).most_common(3))})
    out['branches'] = bs

    # Binding and runner-up gates of the operational systems and strategic outcomes (tiers 6-7).
    t67 = [n for n in N.values() if n['tier'] >= 6]
    out['gates_t67'] = {'binding': dict(collections.Counter(n['binding_gate'] for n in t67).most_common()),
                        'runner_up': dict(collections.Counter(n.get('runner_up_gate') for n in t67).most_common()),
                        'runner_up_thinking': sum(1 for n in t67 if n.get('runner_up_gate') in THINKING),
                        'binding_thinking': sum(1 for n in t67 if n['binding_gate'] in THINKING), 'n': len(t67)}

    json.dump(out, open(sys.argv[2], 'w'), indent=1, default=str)
    print('TIER SHIFT (years earlier S1->S2 / S2->S3 / S3->S4; High-or-Medium by 2031 and 2035, S1/S2/S3/S4)')
    for t, r in shift.items():
        print(f"  tier {t} n={r['n']:3d} S2 {r['mean_S2_year']} shift {r['shift_S1_S2']:+.2f}/{r['shift_S2_S3']:+.2f}/{r['shift_S3_S4']:+.2f} "
              f"HM31 {[r['hm_2031'][s] for s in SCEN]} HM35 {[r['hm_2035'][s] for s in SCEN]}")
    for s in SCEN:
        print('  clock', s, {yr: (v['cognitive'], v['physical']) for yr, v in out['clock_curve'][s].items() if yr in (2028, 2031, 2033, 2035)})
    print('S4 credit:', {k: v for k, v in out['s4_credit'].items() if k != 'nodes'})
    print('critical paths:', {k: len(v) for k, v in out['critical_paths'].items()})
    print('gates t6-7:', out['gates_t67'])


if __name__ == '__main__':
    main()

"""Seed per-year odds (odds_by) for every node from its two checkpoint bands, as an edit file.

Usage: python3 tools/derive_odds.py GRAPH.json OUT_EDIT.json   (run from model/)

For each scenario and each band threshold (low, medium, high) the seed is the first year by which the node's odds
reach that band, read off the two v8 checkpoints:
  - rated at that band or above by end-2031: the node's earliest year (a milestone is at that band once its earliest
    credible year arrives; branch reviewers move it later with a note);
  - first reached by end-2035: the first year in 2032..2035, no earlier than the earliest year, at which a straight line
    between the band midpoints (Speculative 5%, Low 20%, Medium 50%, High 80%) at end-2031 and end-2035 passes the
    band's floor (10%, 30%, 70%); for a node first credible after 2032 the line starts from 5% the year before;
  - not reached by end-2035: ">2035".
Robots-branch nodes keep the model's exception (years on the base robot path, odds weigh the faster path), so their
crossings may precede the earliest year. Every seeded value carries "odds_source": "derived"; branch review replaces
them with judgments ("odds_source": "review"). The seed reproduces the v8 bands at 2031 and 2035 exactly.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_edits import SCEN, RANK, THRESH, EXEMPT_BRANCH, year, band_series  # noqa: E402


MID = {'Speculative': 0.05, 'Low': 0.20, 'Medium': 0.50, 'High': 0.80}
FLOOR = {1: 0.10, 2: 0.30, 3: 0.70}


def crossing(t, e, b31, b35, exempt):
    """First year the odds reach threshold t (1 Low, 2 Medium, 3 High)."""
    if RANK[b31] >= t:
        return min(e, 2031) if exempt else e
    if RANK[b35] >= t:
        lo = max(e if not exempt else min(e, 2035), 2032)
        a, pa = (2031, MID[b31]) if lo == 2032 else (lo - 1, 0.05)
        return next((y for y in range(lo, 2035) if pa + (MID[b35] - pa) * (y - a) / (2035 - a) >= FLOOR[t]), 2035)
    return None


def seed(n, exempt):
    out = {}
    for s in SCEN:
        e = int(min(year(n['earliest_year'][s]), 2036))
        ys = [crossing(t, e, n['band_2031'][s], n['band_2035'][s], exempt) for t in (1, 2, 3)]
        for i in (1, 2):  # never cross a higher band before a lower one
            if ys[i] is not None and ys[i - 1] is not None:
                ys[i] = max(ys[i], ys[i - 1])
        out[s] = {t: (str(y) if y is not None else '>2035') for t, y in zip(THRESH, ys)}
    return out


def main():
    g = json.load(open(sys.argv[1]))
    exempt = {nid for b in g['branches'] if b['id'] == EXEMPT_BRANCH for nid in b['nodes']}
    upd, mismatch = [], []
    for k, n in g['nodes'].items():
        ob = seed(n, k in exempt)
        for s in SCEN:
            bs = band_series(ob[s])
            if bs[5] != n['band_2031'][s] or bs[-1] != n['band_2035'][s]:
                mismatch.append([k, s, n['band_2031'][s], n['band_2035'][s], ob[s]])
        upd.append({'id': k, 'patch': {'odds_by': ob, 'odds_source': 'derived'}})
    json.dump({'notes': 'R9 WS1 seed: odds_by derived from the v8 checkpoint bands by tools/derive_odds.py; '
                        'replaced node by node in the R9-4-odds-<branch> review files.', 'update': upd},
              open(sys.argv[2], 'w'), indent=1)
    print(len(upd), 'nodes seeded;', len(mismatch), 'do not reproduce their v8 bands')
    for m in mismatch[:20]:
        print(' ', m)


if __name__ == '__main__':
    main()

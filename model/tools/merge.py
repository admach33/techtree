"""Merge per-domain research outputs into one raw skill-tree graph and report integrity problems.

Usage: python3 merge.py [research_dir] [out_dir]
"""
import json, re, sys, glob, os, collections

RESEARCH = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'research')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..')
SCEN = ['S1', 'S2', 'S3']
SHARED_OWNER = 'capability'
BEYOND = 2032  # sentinel for ">2031"


def year(s):
    """'2027' -> 2027.0, '2027-28' -> 2027.5, '>2031' / 'post-2031' -> 2032, 'exists'/'2026' -> 2026."""
    if s is None:
        return None
    s = str(s).strip().lower()
    if not s:
        return None
    if s.startswith('>') or 'post' in s or 'beyond' in s or 'after 2031' in s or 'never' in s:
        return float(BEYOND)
    if 'exist' in s or 'already' in s or 'done' in s or 'now' in s:
        return 2026.0
    m = re.findall(r'(20\d\d)', s)
    if not m:
        return None
    ys = [int(x) for x in m]
    r = re.search(r'(20\d\d)\s*[-–]\s*(\d\d)\b', s)
    if r and len(ys) == 1:
        return (int(r.group(1)) + int('20' + r.group(2))) / 2
    return sum(ys) / len(ys) if len(ys) <= 2 else float(ys[0])


def main():
    files = sorted(glob.glob(os.path.join(RESEARCH, '*.json')))
    domains, nodes, defs = {}, {}, collections.defaultdict(list)
    for f in files:
        key = os.path.splitext(os.path.basename(f))[0]
        with open(f) as fh:
            d = json.load(fh)
        domains[key] = {k: v for k, v in d.items() if k != 'nodes'}
        for n in d.get('nodes', []):
            n = dict(n)
            n['domain'] = key
            defs[n['id']].append(n)

    report = {'files': [os.path.basename(f) for f in files], 'duplicate_ids': {}, 'dangling': {}, 'monotonic_violations': [], 'unparsed_years': []}
    for nid, ds in defs.items():
        if len(ds) > 1:
            report['duplicate_ids'][nid] = [x['domain'] for x in ds]
            owner = [x for x in ds if x['domain'] == SHARED_OWNER]
            keep = owner[0] if owner else ds[0]
            keep['also_defined_by'] = [x['domain'] for x in ds if x is not keep]
            # union prerequisites from all definitions so no dependency is lost
            pre = list(dict.fromkeys(sum((x.get('prerequisites', []) for x in ds), [])))
            keep['prerequisites'] = [p for p in pre if p != nid]
            nodes[nid] = keep
        else:
            nodes[nid] = ds[0]

    for nid, n in nodes.items():
        n['year_num'] = {}
        for s in SCEN:
            y = year((n.get('earliest_year') or {}).get(s))
            if y is None:
                report['unparsed_years'].append((nid, s, (n.get('earliest_year') or {}).get(s)))
            n['year_num'][s] = y
        missing = [p for p in n.get('prerequisites', []) if p not in nodes]
        if missing:
            report['dangling'][nid] = missing

    for nid, n in nodes.items():
        for s in SCEN:
            y = n['year_num'][s]
            for p in n.get('prerequisites', []):
                if p in nodes:
                    py = nodes[p]['year_num'][s]
                    if y is not None and py is not None and py > y:
                        report['monotonic_violations'].append({'node': nid, 'prereq': p, 'scenario': s, 'node_year': y, 'prereq_year': py})

    unlocks = collections.defaultdict(list)
    for nid, n in nodes.items():
        for p in n.get('prerequisites', []):
            unlocks[p].append(nid)
    for nid in nodes:
        nodes[nid]['unlocks'] = unlocks.get(nid, [])

    stats = {
        'n_nodes': len(nodes),
        'by_domain': collections.Counter(n['domain'] for n in nodes.values()),
        'by_tier': collections.Counter(n['tier'] for n in nodes.values()),
        'by_gate': collections.Counter(n.get('binding_gate') for n in nodes.values()),
        'band_by_scenario': {s: collections.Counter(n['band_2031'][s] for n in nodes.values()) for s in SCEN},
        'unlocked_by_2031': {s: sum(1 for n in nodes.values() if n['year_num'][s] is not None and n['year_num'][s] <= 2031) for s in SCEN},
        'top_fanout': sorted(((len(v), k) for k, v in unlocks.items()), reverse=True)[:25],
        'n_dangling_refs': sum(len(v) for v in report['dangling'].values()),
        'n_monotonic_violations': len(report['monotonic_violations']),
    }
    with open(os.path.join(OUT, 'merged-raw.json'), 'w') as fh:
        json.dump({'domains': domains, 'nodes': nodes}, fh, indent=1)
    with open(os.path.join(OUT, 'merge-report.json'), 'w') as fh:
        json.dump({'stats': stats, **report}, fh, indent=1, default=list)
    print(json.dumps(stats, indent=1, default=list))
    print('duplicates:', len(report['duplicate_ids']), '| dangling nodes:', len(report['dangling']), '| monotonic violations:', len(report['monotonic_violations']), '| unparsed years:', len(report['unparsed_years']))


if __name__ == '__main__':
    main()

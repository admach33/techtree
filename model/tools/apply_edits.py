"""Apply edit files to the skill-tree graph and check integrity (4 scenarios, horizon 2035).

Usage:
  python3 apply_edits.py migrate IN.json OUT.json  # 3-scenario/2031 graph -> 4-scenario/2035 graph with defaults
  python3 apply_edits.py apply IN.json OUT.json EDIT1.json [EDIT2.json ...] [--autofix]
  python3 apply_edits.py check GRAPH.json
  python3 apply_edits.py branch GRAPH.json BRANCH_ID
  python3 apply_edits.py index GRAPH.json OUT.txt

Scenarios: S1 Plateau, S2 Exponential (base case), S3 Recursive, S4 Embodied (S3 + general-purpose robots at scale).
Each node has earliest_year {S1..S4} ("2029", or ">2035" for beyond the horizon) and odds_by {S1..S4}: the first year
by which the likelihood of being achieved reaches each band, {"low": "2029", "medium": "2030", "high": ">2035"}
(Speculative before low). The tool derives band_by_year {S1..S4} (ten bands, 2026..2035) from odds_by, and from it
band_2031 and band_2035 (likelihood by end-2031 / end-2035: High, Medium, Low, Speculative). A node without odds_by
keeps hand-set band_2031/band_2035 (graphs before v9).

Each node names a binding_gate (one of GATES) and, from v9, a runner_up_gate and a one-clause gate_note. The rule
(model doc, "Binding gates"): the binding gate is the gate whose removal would move the node's earliest year the most
in the central scenario (S2); the runner-up is the next; ties go to the gate later in the physical chain.

  check GRAPH.json [--against BASE.json]  # with a base graph, lists every node whose band_2031/band_2035 changed
                                          # and flags changes without a matching revisions[] entry

Edit file format (every key optional):
{
  "merge":        [{"keep": "id", "drop": ["id", ...], "patch": {...}}],
  "update":       [{"id": "id", "patch": {"field": value, "earliest_year": {"S4": "2033"}, "odds_by": {"S2": {"medium": "2032"}},
                                          "revision_note_add": "R9-odds: appended to revision_note with ' | '",
                                          "why_add": "appended to why with a space"}}],
  "add_nodes":    [{...full node...}],
  "remove_nodes": ["id", ...],
  "add_edges":    [{"from": "prereq-id", "to": "node-id"}],          # hard prerequisite
  "remove_edges": [{"from": "prereq-id", "to": "node-id"}],
  "add_soft_edges": [{"from": "id", "to": "id"}],                     # accelerates, no ordering constraint
  "remove_soft_edges": [{"from": "id", "to": "id"}],
  "branches":     [{"id": "...", "title": "...", "nodes": [...], "spine": [...], ...}],  # replaces all branches
  "branch_new":   [{"id": "...", "title": "...", "nodes": [...], "spine": [...], ...}],  # appends a branch
  "branch_add":   [{"branch": "id", "nodes": ["id", ...], "spine": ["id", ...]}],      # append members
  "branch_update":[{"branch": "id", "patch": {"thesis": "...", ...}}],
  "meta":         {"launch_source": "..."},                          # merged into graph meta; a "version" here is kept as is
  "notes":        "free text"
}
--autofix raises a node's year to its latest hard prerequisite's year in each scenario (an unlock cannot precede
its prerequisites), raises any odds_by year below a hard prerequisite's (a node is never likelier by a year than
what it needs) or below the new earliest year, and records the change in
node['autofix']. Every band_2031/band_2035 the derivation changes gets a revisions[] entry written by apply.
"""
import json, re, sys, os, collections, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SCEN = ['S1', 'S2', 'S3', 'S4']
HORIZON = 2035
BEYOND = 2036.0
NESTED = ('earliest_year', 'band_2031', 'band_2035')
RANK = {'Speculative': 0, 'Low': 1, 'Medium': 2, 'High': 3}
BANDS = ['Speculative', 'Low', 'Medium', 'High']
YEARS = list(range(2026, HORIZON + 1))
THRESH = ('low', 'medium', 'high')
# Gates in physical-chain order (later = further downstream), for the tie rule.
GATES = ['cognitive', 'formalization', 'data', 'experiment', 'fabrication', 'qualification', 'regulatory', 'capital',
         'launch-internal', 'launch-external', 'adoption']
EXEMPT_BRANCH = 'robots'  # years follow the base robot path, odds also weigh the faster path


def year(s):
    """'2029' -> 2029; '>2035' -> 2036; legacy '>2031' -> 2032 (flagged by check as unresolved)."""
    if s is None:
        return None
    s = str(s).strip().lower()
    if not s:
        return None
    m = re.match(r'^>\s*(20\d\d)', s)
    if m:
        return min(float(int(m.group(1)) + 1), BEYOND)
    if 'post' in s or 'beyond' in s or 'never' in s or s.startswith('after'):
        m2 = re.findall(r'(20\d\d)', s)
        return min(float(int(m2[0]) + 1), BEYOND) if m2 else BEYOND
    if 'exist' in s or 'already' in s or 'done' in s or 'now' in s:
        return 2026.0
    m = [int(x) for x in re.findall(r'(20\d\d)', s)]
    if not m:
        return None
    r = re.search(r'(20\d\d)\s*[-–]\s*(\d\d)\b', s)
    if r and len(m) == 1:
        return (int(r.group(1)) + int('20' + r.group(2))) / 2
    return sum(m) / len(m) if len(m) <= 2 else float(m[0])


def ystr(y):
    if y is None:
        return None
    if y >= BEYOND:
        return '>2035'
    return str(int(y)) if float(y).is_integer() else f'{int(y)}-{str(int(y) + 1)[2:]}'


def band_series(ob):
    """odds_by for one scenario -> ten bands, 2026..2035."""
    ys = [year(ob.get(t)) for t in THRESH]
    return [BANDS[sum(1 for y in ys if y is not None and y <= yr)] for yr in YEARS]


def derive_bands(n):
    if not n.get('odds_by'):
        return
    n['band_by_year'] = {s: band_series(n['odds_by'].get(s, {})) for s in SCEN}
    n['band_2031'] = {s: n['band_by_year'][s][YEARS.index(2031)] for s in SCEN}
    n['band_2035'] = {s: n['band_by_year'][s][-1] for s in SCEN}


def recompute(nodes):
    for n in nodes.values():
        derive_bands(n)
        n['year_num'] = {s: year((n.get('earliest_year') or {}).get(s)) for s in SCEN}
        n['prerequisites'] = [p for p in dict.fromkeys(n.get('prerequisites', [])) if p != n['id']]
        n['accelerated_by'] = [p for p in dict.fromkeys(n.get('accelerated_by', [])) if p != n['id']]
    unlocks = collections.defaultdict(list)
    for nid, n in nodes.items():
        for p in n['prerequisites']:
            unlocks[p].append(nid)
    for nid, n in nodes.items():
        n['unlocks'] = sorted(unlocks.get(nid, []))


def find_cycles(nodes):
    color, cycles = {}, []

    def dfs(u, stack):
        color[u] = 1
        stack.append(u)
        for v in nodes[u]['prerequisites']:
            if v not in nodes:
                continue
            if color.get(v) == 1:
                cycles.append(stack[stack.index(v):] + [v])
            elif not color.get(v):
                dfs(v, stack)
        stack.pop()
        color[u] = 2

    sys.setrecursionlimit(10000)
    for u in nodes:
        if not color.get(u):
            dfs(u, [])
    return cycles


def topo(nodes):
    indeg = {k: 0 for k in nodes}
    for k, n in nodes.items():
        for p in n['prerequisites']:
            if p in nodes:
                indeg[k] += 1
    q = [k for k, d in indeg.items() if d == 0]
    out = []
    while q:
        u = q.pop()
        out.append(u)
        for v in nodes[u]['unlocks']:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return out


def autofix(nodes, exempt=()):
    fixes = []
    for k in topo(nodes):
        n = nodes[k]
        for s in SCEN:
            ys = [nodes[p]['year_num'][s] for p in n['prerequisites'] if p in nodes and nodes[p]['year_num'][s] is not None]
            if ys and n['year_num'][s] is not None and max(ys) > n['year_num'][s]:
                old = n['earliest_year'][s]
                n['earliest_year'][s] = ystr(max(ys))
                n['year_num'][s] = max(ys)
                n.setdefault('autofix', []).append(f'{s}: {old} -> {n["earliest_year"][s]} (prerequisite later)')
                y = n['year_num'][s]
                flag = (y > 2031 and n.get('band_2031', {}).get(s) in ('High', 'Medium')) or (y > HORIZON and n.get('band_2035', {}).get(s) in ('High', 'Medium'))
                fixes.append({'node': k, 'scenario': s, 'from': old, 'to': n['earliest_year'][s], 'band_needs_review': flag})
            ob = (n.get('odds_by') or {}).get(s)
            # a node is never likelier by a year than any of its hard prerequisites
            for t in THRESH:
                pre = [(nodes[p]['odds_by'][s][t], p) for p in n['prerequisites'] if p in nodes and nodes[p].get('odds_by')]
                if ob and pre:
                    py, pid = max(pre, key=lambda x: year(x[0]))
                    if year(py) > year(ob[t]):
                        old = ob[t]
                        ob[t] = py
                        n.setdefault('autofix', []).append(f'{s}: odds_by.{t} {old} -> {py} (prerequisite {pid} later)')
                        fixes.append({'node': k, 'scenario': s, 'odds': t, 'from': old, 'to': py, 'band_needs_review': False})
            if ob and k not in exempt and n['year_num'][s] is not None:
                for t in THRESH:
                    if year(ob.get(t)) is not None and year(ob[t]) < n['year_num'][s]:
                        old = ob[t]
                        ob[t] = n['earliest_year'][s]
                        n.setdefault('autofix', []).append(f'{s}: odds_by.{t} {old} -> {ob[t]} (earliest year later)')
                        fixes.append({'node': k, 'scenario': s, 'odds': t, 'from': old, 'to': ob[t], 'band_needs_review': False})
        derive_bands(n)
    return fixes


def band_changes(base, nodes):
    """Nodes whose band_2031/band_2035 differ from a base graph's: {id: {field: {scenario: [old, new]}}}."""
    out = {}
    for k, n in nodes.items():
        b = base.get(k)
        if not b:
            continue
        for f in ('band_2031', 'band_2035'):
            d = {s: [b[f][s], n[f][s]] for s in SCEN if b.get(f, {}).get(s) != n.get(f, {}).get(s)}
            if d:
                out.setdefault(k, {})[f] = d
    return out


def record_band_revisions(base, nodes, by):
    """Write a revisions[] entry for every band the edits changed, citing the node's latest R9 note."""
    today = datetime.date.today().isoformat()
    ch = band_changes(base, nodes)
    for k, d in ch.items():
        n = nodes[k]
        notes = [x.strip() for x in str(n.get('revision_note', '')).split(' | ') if x.strip().startswith('R9')]
        n.setdefault('revisions', []).append({
            'by': by, 'date': today, 'fields': sorted(d),
            'reason': (notes[-1] if notes else 'R9: bands derived from per-year odds (odds_by)') + ' Changes: ' + '; '.join(
                f"{f}: " + ', '.join(f"{s} {a} -> {b}" for s, (a, b) in v.items()) for f, v in d.items()),
            'from': {f: {s: a for s, (a, _) in v.items()} for f, v in d.items()}})
    return ch


def check(g, base=None):
    nodes = g['nodes']
    rep = {'dangling': {}, 'dangling_soft': {}, 'monotonic_violations': [], 'cycles': [], 'unparsed_years': [], 'bad_bands': [],
           'unresolved_gt2031': [], 'late_but_likely_2031': [], 'late_but_likely_2035': [], 'band_time_order': [], 'scenario_order_violations': []}
    v9 = any(n.get('odds_by') for n in nodes.values())
    exempt = {nid for b in g.get('branches', []) if b['id'] == EXEMPT_BRANCH for nid in b.get('nodes', [])}
    if v9:
        rep.update({'missing_odds_by': [], 'bad_odds_by': [], 'odds_before_earliest': [], 'odds_order': [], 'odds_prereq_order': [], 'odds_scenario_order': [],
                    'bad_gate': [], 'missing_runner_up': [], 'bad_runner_up': [], 'band_changes_without_revision': []})
        for k, n in nodes.items():
            ob = n.get('odds_by') or {}
            if sorted(ob) != SCEN or any(sorted(ob[s]) != sorted(THRESH) for s in ob):
                rep['missing_odds_by'].append(k)
                continue
            for s in SCEN:
                ys = [year(ob[s][t]) for t in THRESH]
                if None in ys or any(not re.match(r'^(20\d\d|>2035)$', str(ob[s][t])) for t in THRESH):
                    rep['bad_odds_by'].append([k, s, ob[s]])
                    continue
                if not (ys[0] <= ys[1] <= ys[2]):
                    rep['odds_order'].append([k, s, ob[s]])
                for p in n['prerequisites']:
                    po = (nodes.get(p) or {}).get('odds_by', {}).get(s)
                    if po and any(year(po[t]) is not None and year(po[t]) > ys[i] for i, t in enumerate(THRESH)):
                        rep['odds_prereq_order'].append([k, p, s, ob[s], po])
                e = n['year_num'][s]
                if k not in exempt and e is not None and e < BEYOND and ys[0] < e:
                    rep['odds_before_earliest'].append([k, s, n['earliest_year'][s], ob[s]])
            for t in THRESH:
                ys = [year(ob[s][t]) for s in SCEN]
                if None not in ys and not (ys[3] <= ys[2] <= ys[1] <= ys[0]):
                    rep['odds_scenario_order'].append([k, t, {s: ob[s][t] for s in SCEN}])
            if n.get('binding_gate') not in GATES:
                rep['bad_gate'].append([k, n.get('binding_gate')])
            ru = n.get('runner_up_gate')
            if n['tier'] >= 5 and (not ru or not n.get('gate_note')):
                rep['missing_runner_up'].append(k)
            if ru and (ru not in GATES or ru == n.get('binding_gate')):
                rep['bad_runner_up'].append([k, n.get('binding_gate'), ru])
        if base is not None:
            ch = band_changes(base['nodes'], nodes)
            rep['band_changes'] = ch
            for k, d in ch.items():
                recorded = {f for r in nodes[k].get('revisions', []) if str(r.get('by', '')).startswith('R9')
                            for f in r.get('fields', [r.get('field')])}
                miss = sorted(set(d) - recorded)
                if miss:
                    rep['band_changes_without_revision'].append([k, miss])
    for k, n in nodes.items():
        miss = [p for p in n['prerequisites'] if p not in nodes]
        if miss:
            rep['dangling'][k] = miss
        miss = [p for p in n.get('accelerated_by', []) if p not in nodes]
        if miss:
            rep['dangling_soft'][k] = miss
        for s in SCEN:
            ys = (n.get('earliest_year') or {}).get(s)
            if n['year_num'][s] is None:
                rep['unparsed_years'].append([k, s, ys])
            if str(ys).strip().startswith('>') and year(ys) is not None and year(ys) < BEYOND:
                rep['unresolved_gt2031'].append([k, s, ys])
            for fld in ('band_2031', 'band_2035'):
                if (n.get(fld) or {}).get(s) not in RANK:
                    rep['bad_bands'].append([k, s, fld, (n.get(fld) or {}).get(s)])
            y = n['year_num'][s]
            b31, b35 = (n.get('band_2031') or {}).get(s), (n.get('band_2035') or {}).get(s)
            if y and y > 2031 and b31 in ('High', 'Medium'):
                rep['late_but_likely_2031'].append([k, s, ys, b31])
            if y and y > HORIZON and b35 in ('High', 'Medium'):
                rep['late_but_likely_2035'].append([k, s, ys, b35])
            if b31 in RANK and b35 in RANK and RANK[b35] < RANK[b31]:
                rep['band_time_order'].append([k, s, b31, b35])
            for p in n['prerequisites']:
                if p in nodes and y is not None and nodes[p]['year_num'][s] is not None and nodes[p]['year_num'][s] > y:
                    rep['monotonic_violations'].append([k, p, s, y, nodes[p]['year_num'][s]])
        yy = n['year_num']
        if None not in yy.values() and not (yy['S4'] <= yy['S3'] <= yy['S2'] <= yy['S1']):
            rep['scenario_order_violations'].append([k, 'year', n['earliest_year']])
        for fld in ('band_2031', 'band_2035'):
            b = n.get(fld) or {}
            if all(b.get(s) in RANK for s in SCEN) and not (RANK[b['S4']] >= RANK[b['S3']] >= RANK[b['S2']] >= RANK[b['S1']]):
                rep['scenario_order_violations'].append([k, fld, b])
    rep['cycles'] = find_cycles(nodes)
    member = collections.Counter(nid for b in g.get('branches', []) for nid in b.get('nodes', []))
    rep['branch_unknown_nodes'] = sorted(set(member) - set(nodes))
    rep['nodes_without_branch'] = sorted(set(nodes) - set(member))
    rep['nodes_in_two_branches'] = sorted(k for k, c in member.items() if c > 1)
    rep['summary'] = {
        'n_nodes': len(nodes),
        'n_hard_edges': sum(len(n['prerequisites']) for n in nodes.values()),
        'n_soft_edges': sum(len(n.get('accelerated_by', [])) for n in nodes.values()),
        'by_tier': dict(sorted(collections.Counter(n['tier'] for n in nodes.values()).items())),
        'reached_by_2031': {s: sum(1 for n in nodes.values() if n['year_num'][s] is not None and n['year_num'][s] <= 2031) for s in SCEN},
        'reached_by_2035': {s: sum(1 for n in nodes.values() if n['year_num'][s] is not None and n['year_num'][s] <= HORIZON) for s in SCEN},
        'n_branches': len(g.get('branches', [])),
        'counts': {k: len(v) for k, v in rep.items() if isinstance(v, (list, dict)) and k != 'band_changes'},
    }
    if 'band_changes' in rep:
        rep['summary']['n_band_changes'] = {'nodes': len(rep['band_changes']),
                                           'cells': sum(len(v) for d in rep['band_changes'].values() for v in d.values())}
    return rep


def apply(g, e):
    nodes = g['nodes']
    log = []
    for m in e.get('merge', []):
        keep, drops = m['keep'], [d for d in m.get('drop', []) if d != m['keep']]
        if keep not in nodes:
            src = next((d for d in drops if d in nodes), None)
            if src is None:
                log.append(f'merge skipped, nothing to keep: {keep}')
                continue
            nodes[keep] = dict(nodes[src], id=keep)
        k = nodes[keep]
        for d in drops:
            if d not in nodes:
                log.append(f'merge: {d} not found')
                continue
            dn = nodes.pop(d)
            k['prerequisites'] = k.get('prerequisites', []) + dn.get('prerequisites', [])
            k['accelerated_by'] = k.get('accelerated_by', []) + dn.get('accelerated_by', [])
            k['catalog_families'] = sorted(set(k.get('catalog_families', [])) | set(dn.get('catalog_families', [])))
            k.setdefault('merged_from', []).append(d)
            for n in nodes.values():
                n['prerequisites'] = [keep if p == d else p for p in n.get('prerequisites', [])]
                n['accelerated_by'] = [keep if p == d else p for p in n.get('accelerated_by', [])]
            for b in g.get('branches', []):
                for fld in ('nodes', 'spine', 'roots'):
                    if fld in b:
                        b[fld] = list(dict.fromkeys(keep if x == d else x for x in b[fld]))
        patch_node(k, m.get('patch', {}))
    for u in e.get('update', []):
        if u['id'] not in nodes:
            log.append(f'update: {u["id"]} not found')
            continue
        patch_node(nodes[u['id']], u.get('patch', {}))
    for n in e.get('add_nodes', []):
        if n['id'] in nodes:
            log.append(f'add_nodes: {n["id"]} exists, patched instead')
            patch_node(nodes[n['id']], n)
        else:
            n = dict(n)
            if 'revision_note_add' in n:
                n['revision_note'] = n.pop('revision_note_add')
            n.setdefault('prerequisites', [])
            n.setdefault('accelerated_by', [])
            n.setdefault('catalog_families', [])
            nodes[n['id']] = n
    for r in e.get('remove_nodes', []):
        if nodes.pop(r, None) is None:
            log.append(f'remove: {r} not found')
        for b in g.get('branches', []):
            for fld in ('nodes', 'spine', 'roots'):
                if fld in b:
                    b[fld] = [x for x in b[fld] if x != r]
        for n in nodes.values():
            n['prerequisites'] = [p for p in n.get('prerequisites', []) if p != r]
            n['accelerated_by'] = [p for p in n.get('accelerated_by', []) if p != r]
    for ed in e.get('add_edges', []):
        if ed['to'] in nodes and ed['from'] in nodes:
            nodes[ed['to']].setdefault('prerequisites', []).append(ed['from'])
        else:
            log.append(f'add_edge skipped (missing end): {ed}')
    for ed in e.get('remove_edges', []):
        if ed['to'] in nodes:
            nodes[ed['to']]['prerequisites'] = [p for p in nodes[ed['to']].get('prerequisites', []) if p != ed['from']]
    for ed in e.get('add_soft_edges', []):
        if ed['to'] in nodes and ed['from'] in nodes:
            nodes[ed['to']].setdefault('accelerated_by', []).append(ed['from'])
        else:
            log.append(f'add_soft_edge skipped (missing end): {ed}')
    for ed in e.get('remove_soft_edges', []):
        if ed['to'] in nodes:
            nodes[ed['to']]['accelerated_by'] = [p for p in nodes[ed['to']].get('accelerated_by', []) if p != ed['from']]
    if e.get('branches'):
        g['branches'] = e['branches']
    for bn in e.get('branch_new', []):
        if any(b['id'] == bn['id'] for b in g.get('branches', [])):
            log.append(f'branch_new: {bn["id"]} exists, updated instead')
            next(b for b in g['branches'] if b['id'] == bn['id']).update(bn)
        else:
            g.setdefault('branches', []).append(dict(bn))
    for ba in e.get('branch_add', []):
        b = next((x for x in g.get('branches', []) if x['id'] == ba['branch']), None)
        if b is None:
            log.append(f'branch_add: unknown branch {ba["branch"]}')
            continue
        b['nodes'] = list(dict.fromkeys(b.get('nodes', []) + [x for x in ba.get('nodes', []) if x in nodes]))
        if ba.get('spine'):
            b['spine'] = list(dict.fromkeys(b.get('spine', []) + [x for x in ba['spine'] if x in nodes]))
    for bu in e.get('branch_update', []):
        b = next((x for x in g.get('branches', []) if x['id'] == bu['branch']), None)
        if b is None:
            log.append(f'branch_update: unknown branch {bu["branch"]}')
            continue
        b.update(bu.get('patch', {}))
    if e.get('meta'):
        g.setdefault('meta', {}).update(e['meta'])
    return log


def patch_node(n, patch):
    for f, v in patch.items():
        if f == 'odds_by' and isinstance(v, dict):
            for s_, ob in v.items():
                n.setdefault('odds_by', {}).setdefault(s_, {}).update(ob)
        elif f == 'why_add':
            n['why'] = (str(n.get('why') or '').rstrip() + ' ' + v).strip()
        elif f == 'revision_note_add':
            n['revision_note'] = (str(n.get('revision_note') or '') + ' | ' + v).lstrip(' |')
        elif f in NESTED and isinstance(v, dict):
            n.setdefault(f, {}).update(v)
        elif f in ('prerequisites_add',):
            n.setdefault('prerequisites', []).extend(v)
        else:
            n[f] = v
    n.setdefault('revisions', [])


def migrate(g):
    """Add S4 (defaults to S3) and band_2035 (defaults to band_2031) to every node; flag nodes needing review."""
    for n in g['nodes'].values():
        ey, b31 = n['earliest_year'], n['band_2031']
        ey['S4'] = ey.get('S4', ey['S3'])
        b31['S4'] = b31.get('S4', b31['S3'])
        n['band_2035'] = {s: (n.get('band_2035') or {}).get(s, b31[s]) for s in SCEN}
        needs = any(str(ey[s]).startswith('>') for s in SCEN) or any(b31[s] != 'High' for s in SCEN)
        n['needs_2035_review'] = needs
    g.setdefault('meta', {}).update({'scenarios': SCEN, 'horizon': HORIZON})
    return g


def line(k, q, ext=''):
    ey, b31, b35 = q['earliest_year'], q.get('band_2031', {}), q.get('band_2035', {})
    yrs = ' '.join(f"{s}:{ey.get(s)}" for s in SCEN)
    bands = ' '.join(f"{s}:{(b31.get(s) or '?')[:1]}{(b35.get(s) or '?')[:1]}" for s in SCEN)
    return f"{k} | tier {q['tier']} | {q['title']} | {yrs} | bands(2031,2035) {bands} | {q.get('binding_gate')}{ext}"


def main():
    cmd = sys.argv[1]
    if cmd == 'migrate':
        g = json.load(open(sys.argv[2]))
        migrate(g)
        recompute(g['nodes'])
        json.dump(g, open(sys.argv[3], 'w'), indent=1)
        rep = check(g)
        print(json.dumps(rep['summary'], indent=1))
        print('needs_2035_review:', sum(1 for n in g['nodes'].values() if n.get('needs_2035_review')))
        return
    if cmd == 'branch':
        g = json.load(open(sys.argv[2]))
        bid = sys.argv[3]
        b = next(x for x in g['branches'] if x['id'] == bid)
        ids = set(b['nodes'])
        keep = ('revisions', 'year_num')
        full = {k: {f: v for f, v in g['nodes'][k].items() if f not in keep} for k in b['nodes'] if k in g['nodes']}
        ext = {}
        for k in ids:
            n = g['nodes'].get(k)
            if not n:
                continue
            for p in n['prerequisites'] + n.get('accelerated_by', []) + n['unlocks']:
                if p not in ids and p in g['nodes']:
                    ext[p] = line(p, g['nodes'][p], ' | branch-external')
        print(json.dumps({'branch': {k: v for k, v in b.items() if k != 'nodes'}, 'nodes': full, 'external_neighbors': sorted(ext.values())}, indent=1))
        return
    if cmd == 'index':
        g = json.load(open(sys.argv[2]))
        out = [line(k, n, ' | pre:' + ','.join(n['prerequisites'])) for k, n in g['nodes'].items()]
        open(sys.argv[3], 'w').write('\n'.join(out))
        print(len(out), 'nodes indexed')
        return
    if cmd == 'check':
        g = json.load(open(sys.argv[2]))
        base = json.load(open(sys.argv[sys.argv.index('--against') + 1])) if '--against' in sys.argv else None
        recompute(g['nodes'])
        rep = check(g, base)
        print(json.dumps(rep, indent=1, default=list))
        return
    if cmd == 'apply':
        args = [a for a in sys.argv[2:] if not a.startswith('--')]
        inp, out, edits = args[0], args[1], args[2:]
        g = json.load(open(inp))
        base = json.loads(json.dumps(g['nodes']))
        recompute(base)
        v0 = g.get('meta', {}).get('version', 0)
        all_log, set_version = [], False
        for ef in edits:
            e = json.load(open(ef))
            set_version |= 'version' in e.get('meta', {})
            all_log += [f'{os.path.basename(ef)}: {x}' for x in apply(g, e)]
        recompute(g['nodes'])
        exempt = {nid for b in g.get('branches', []) if b['id'] == EXEMPT_BRANCH for nid in b.get('nodes', [])}
        fixes = autofix(g['nodes'], exempt) if '--autofix' in sys.argv else []
        recompute(g['nodes'])
        changed = record_band_revisions(base, g['nodes'], 'R9') if any(n.get('odds_by') for n in g['nodes'].values()) else {}
        if not set_version:
            g.setdefault('meta', {})['version'] = v0 + 1
        json.dump(g, open(out, 'w'), indent=1)
        rep = check(g, {'nodes': base})
        rep['band_changes_recorded'] = len(changed)
        rep['apply_log'] = all_log
        rep['autofixes'] = fixes
        rpt = os.path.splitext(out)[0] + '-report.json'
        json.dump(rep, open(rpt, 'w'), indent=1, default=list)
        print(json.dumps({'summary': rep['summary'], 'apply_log_lines': len(all_log), 'autofixes': len(fixes),
                          'autofix_band_reviews': [f for f in fixes if f['band_needs_review']][:40],
                          'apply_log_head': all_log[:30]}, indent=1, default=list))
        return
    raise SystemExit('unknown command')


if __name__ == '__main__':
    main()

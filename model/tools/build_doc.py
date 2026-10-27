"""Assemble the model document from hand-written sections and graph-generated tables (4 scenarios, horizon 2035).

Usage: python3 build_doc.py GRAPH.json ANALYTICS.json SECTIONS_DIR OUT.md [WF_RESULT.json ...]

SECTIONS_DIR holds hand-written markdown files included by {{file:NAME}} in _skeleton.md; generated blocks fill
{{marker}} placeholders (see gen()). WF_RESULT files supply per-branch reviewer disputes: the 2031 challenge round
('challenge' list) and the 2035 extension round ('branches' list).
"""
import json, sys, os, re, collections

SCEN = ['S1', 'S2', 'S3', 'S4']
SNAME = {'S1': 'Plateau', 'S2': 'Exponential', 'S3': 'Recursive', 'S4': 'Embodied'}
RANK = {'Speculative': 0, 'Low': 1, 'Medium': 2, 'High': 3}
TIER = ['AI capability', 'Frontier math', 'Applied math', 'Physics models', 'Engineering tools', 'Validated tech', 'Systems & missions', 'Outcomes']
BEYOND = 2036.0
YEARS = list(range(2026, 2036))
NARR_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'doc', 'branches')

DOMAIN_NAMES = {'verif': 'Flight software and certification', 'astro': 'Astrodynamics, guidance and space traffic', 'prop': 'Propulsion and combustion',
                'plasma': 'Plasma, electric propulsion and space weather', 'hyper': 'Hypersonics and entry', 'materials': 'Materials and electronics',
                'struct': 'Structures, thermal, power and orbital compute', 'comms': 'Communications and security', 'auton': 'Autonomy, robotics and resources',
                'science': 'Space science', 'frontier': 'Mathematics frontier', 'capability': 'AI capability curve', 'physclock': 'Physical clock',
                'robots': 'General-purpose robotics'}
SKILL_CATALOG = '/Users/alex/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/9b7c817d-9774-4bec-b621-0fe370d063ff/7a4058c3-1fca-4ea0-b9a7-8ce71f5867fd/skills/ai-math-frontier-analyst/references/knowledge/assess-result/ref-family-catalog.md'
LEAN = set(re.findall(r'^\| (\d{3}) \| L \|', open(SKILL_CATALOG).read(), re.M)) if os.path.exists(SKILL_CATALOG) else set()
_IDRE = None
_ALIAS = None
B1 = {'High': 'H', 'Medium': 'M', 'Low': 'L', 'Speculative': 'S'}


def scrub(text, N):
    """Replace internal node ids with titles and drop knowledge-base position tags."""
    global _IDRE, _ALIAS
    if not text:
        return text
    if _IDRE is None:
        short = lambda i: re.sub(r'^[a-z]+-(?:35-)?', '', i)
        cnt = collections.Counter(short(i) for i in N)
        _ALIAS = {i: i for i in N}
        _ALIAS.update({short(i): i for i in N if short(i) != i and '-' in short(i) and cnt[short(i)] == 1 and short(i) not in N})
        if 'capability-35-heavy-cadence-300' in N:
            _ALIAS['cadence-300'] = 'capability-35-heavy-cadence-300'
        ids = sorted(_ALIAS, key=len, reverse=True)
        _IDRE = re.compile(r'(?<![\w-])(' + '|'.join(re.escape(i) for i in ids) + r')(?![\w-])')
    text = re.sub(r'\s*\(which absorbed [\w-]+\)', '', text)
    text = _IDRE.sub(lambda m: '"' + N[_ALIAS[m.group(1)]]['title'] + '"', text)
    for a, b in ((r'\bband_(20\d\d)\b', r'the \1 band'), (r"(?i)\bthe brief's\b", "the extension rules'"), (r'(?i)\bthe brief\b', 'the extension rules'),
                 (r'\b(?:its|the|a) why field\b', 'its rationale'), (r'\bwhy fields\b', 'rationales'), (r'\bwhy field\b', 'rationale'), (r'\bE-[\w-]+\.json\b', 'an edit file'),
                 (r'\bnote_2035\b', 'the 2032-35 note'), (r'\bearliest_year\b', 'earliest year')):
        text = re.sub(a, b, text)
    text = re.sub(r'\s*\((?:per )?(?:analyst )?(?:position )?(?:tl|fc|tr)-position-\d(?:[,; ]+(?:tl|fc|tr)-position-\d)*\)', '', text)
    text = re.sub(r'(?:per )?(?:analyst )?(?:position )?(?:tl|fc|tr)-position-\d', 'the analyst framework', text)
    text = re.sub(r"\bthe client's\b", "the study's", text)
    text = re.sub(r"\bclient\b", "study", text)
    return text


def esc(s):
    return (s or '').replace('|', '\\|').replace('\n', ' ').strip()


def md_table(cols, rows):
    out = ['| ' + ' | '.join(cols) + ' |', '| ' + ' | '.join('---' for _ in cols) + ' |']
    out += ['| ' + ' | '.join(esc(str(c)) for c in r) + ' |' for r in rows]
    return '\n'.join(out)


def domain_table(g, dom, title_match):
    for t in g['domains'].get(dom, {}).get('tables', []):
        if re.search(title_match, t['title'], re.I):
            return t
    return None


def yv(n, s):
    v = n.get('year_num', {}).get(s)
    return BEYOND if v is None else min(v, BEYOND)


def bands(n, s):
    return f"{n['band_2031'][s]} / {n['band_2035'][s]}" if n['band_2031'][s] != n['band_2035'][s] else n['band_2031'][s]


def tag(n, s='S2'):
    return f"tier {n['tier']} · {n['earliest_year'][s]} · {bands(n, s)}"


def spine_tree(g, b):
    N = g['nodes']
    sp = [k for k in b.get('spine', []) if k in N]
    if not sp:
        return '', ''
    S = set(sp)
    kids = {k: sorted([u for u in N[k].get('unlocks', []) if u in S], key=lambda u: (yv(N[u], 'S2'), N[u]['tier'])) for k in sp}
    has_parent = {u for k in sp for u in kids[k]}
    roots = sorted([k for k in sp if k not in has_parent], key=lambda k: (N[k]['tier'], yv(N[k], 'S2')))
    lines, seen = [], set()

    def walk(k, depth):
        n = N[k]
        arrow = '' if depth == 0 else '→ '
        again = ' (see above)' if k in seen else ''
        y2, y3, y4 = n['earliest_year']['S2'], n['earliest_year']['S3'], n['earliest_year']['S4']
        s4 = (f"; Recursive {y3}" if y3 != y2 else '') + (f"; Embodied {y4}" if y4 != y3 else '')
        gate = n['binding_gate'] + (f", then {n['runner_up_gate']}" if n.get('runner_up_gate') else '')
        lines.append('  ' * depth + f"- {arrow}**{n['title']}** ({tag(n)}{s4}; gate: {gate}){again}")
        if k in seen:
            return
        seen.add(k)
        for c in kids[k]:
            walk(c, depth + 1)
    for r in roots:
        walk(r, 0)
    mm = ['```mermaid', 'flowchart TD']
    ids = {k: f'n{i}' for i, k in enumerate(sp)}
    for k in sp:
        n = N[k]
        label = f"{n['title']}<br/>tier {n['tier']} · {n['earliest_year']['S2']} · {bands(n, 'S2')}".replace('"', "'")
        mm.append(f'  {ids[k]}["{label}"]')
    for k in sp:
        for c in kids[k]:
            mm.append(f'  {ids[k]} --> {ids[c]}')
    cls = {'cog': [ids[k] for k in sp if N[k]['tier'] <= 4], 'phys': [ids[k] for k in sp if N[k]['tier'] >= 5]}
    mm.append('  classDef cog fill:#dce9fa,stroke:#2a78d6,color:#0f1820')
    mm.append('  classDef phys fill:#fbe3d8,stroke:#eb6834,color:#0f1820')
    for c, v in cls.items():
        if v:
            mm.append(f'  class {",".join(v)} {c}')
    mm.append('```')
    return '\n'.join(lines), '\n'.join(mm)


def gen(g, an, debates31, debates35):
    N = g['nodes']
    blocks = {}
    T = lambda t: md_table([scrub(c, N) for c in t['columns']], [[scrub(c, N) for c in r] for r in t['rows']]) if t else ''
    blocks['scenario_table'] = T(domain_table(g, 'capability', r'parametri'))
    blocks['amdahl_table'] = T(domain_table(g, 'capability', r'amdahl|10x faster'))
    blocks['gate_table'] = T(domain_table(g, 'physclock', r'physical gates'))
    blocks['ladder_table'] = T(domain_table(g, 'capability', r'ladder'))
    ts = an['tier_shift']
    rng = lambda vals, fmt='{:.1f}': (fmt.format(min(vals)) + '–' + fmt.format(max(vals))) if fmt.format(min(vals)) != fmt.format(max(vals)) else fmt.format(min(vals))
    pct = lambda v: f'{100 * v:.0f}%'
    cog = [ts[str(t)] for t in range(5) if str(t) in ts]
    phy = [ts[str(t)] for t in range(5, 8) if str(t) in ts]
    blocks['n_nodes'] = str(len(N))
    blocks['n_hard'] = str(sum(len(n['prerequisites']) for n in N.values()))
    blocks['n_soft'] = str(sum(len(n.get('accelerated_by', [])) for n in N.values()))
    blocks['n_branches'] = str(len(g.get('branches', [])))
    blocks['shift_cog'] = rng([r['shift_S1_S2'] for r in cog])
    blocks['shift_phys'] = rng([r['shift_S1_S2'] for r in phy])
    blocks['shift_s3'] = rng([r['shift_S2_S3'] for r in cog + phy])
    blocks['shift_s4'] = rng([r['shift_S3_S4'] for r in cog + phy], '{:.2f}')
    blocks['shift_s4_phys'] = rng([r['shift_S3_S4'] for r in phy], '{:.2f}')
    for cp in ('2031', '2035'):
        for s in SCEN:
            blocks[f'hm{cp[2:]}_cog_{s.lower()}'] = rng([100 * r[f'hm_{cp}'][s] for r in cog], '{:.0f}') + '%'
            for t in (5, 6, 7):
                blocks[f'hm{cp[2:]}_t{t}_{s.lower()}'] = pct(ts[str(t)][f'hm_{cp}'][s])
    # back-compat names used in older prose
    blocks['hm_cog_s2'] = blocks['hm31_cog_s2']
    for t in (5, 6, 7):
        blocks[f'hm_t{t}'] = blocks[f'hm31_t{t}_s2']
    for s in ('S2', 'S4'):
        gap = an['gap'][s]
        for yr in ('2029', '2031', '2033', '2035'):
            blocks[f'gap_{yr}_cog_{s.lower()}'], blocks[f'gap_{yr}_phys_{s.lower()}'] = str(gap[yr][0]), str(gap[yr][1])
    blocks['gap_2029_cog'], blocks['gap_2029_phys'] = blocks['gap_2029_cog_s2'], blocks['gap_2029_phys_s2']
    blocks['gap_2031_cog'], blocks['gap_2031_phys'] = blocks['gap_2031_cog_s2'], blocks['gap_2031_phys_s2']
    blocks['n_t13'] = str(sum(1 for n in N.values() if 1 <= n['tier'] <= 3))
    blocks['n_t56'] = str(sum(1 for n in N.values() if 5 <= n['tier'] <= 6))
    blocks['gap_2031_phys_hm'] = str(sum(1 for n in N.values() if 5 <= n['tier'] <= 6 and yv(n, 'S2') <= 2031 and RANK[n['band_2031']['S2']] >= 2))
    blocks['gap_2035_phys_hm'] = str(sum(1 for n in N.values() if 5 <= n['tier'] <= 6 and yv(n, 'S2') <= 2035 and RANK[n['band_2035']['S2']] >= 2))
    blocks['gap_2035_phys_hm_s3'] = str(sum(1 for n in N.values() if 5 <= n['tier'] <= 6 and yv(n, 'S3') <= 2035 and RANK[n['band_2035']['S3']] >= 2))
    def likely_cp(n, s, yr):
        b = n['band_by_year'][s][YEARS.index(yr)] if 'band_by_year' in n else (n['band_2031'][s] if yr <= 2031 else n['band_2035'][s])
        return yv(n, s) < BEYOND and int(yv(n, s)) <= yr and RANK[b] >= 2
    nonrobo_phys = [n for n in N.values() if n['tier'] >= 5 and n.get('domain') != 'robots' and not n['id'].startswith('robo-')]
    for s in ('S3', 'S4'):
        for yr in (2031, 2035):
            blocks[f'cc_{yr}_phys_{s.lower()}_nr'] = f"{100 * sum(likely_cp(n, s, yr) for n in nonrobo_phys) / len(nonrobo_phys):.0f}%"
    blocks['gap_2035_phys_hm_s4'] = str(sum(1 for n in N.values() if 5 <= n['tier'] <= 6 and yv(n, 'S4') <= 2035 and RANK[n['band_2035']['S4']] >= 2))
    # two-clocks table, 2026-2035, four scenarios
    cc = an['clock_curve']
    rows = []
    for yr in YEARS:
        row = [str(yr)]
        for s in SCEN:
            v = cc[s][str(yr)] if str(yr) in cc[s] else cc[s][yr]
            row += [pct(v['cognitive']), pct(v['physical'])]
        rows.append(row)
    blocks['clock_curve_table'] = md_table(['Year'] + [f'{SNAME[s]}: {h}' for s in SCEN for h in ('cognitive', 'physical')], rows)
    blocks['n_cog_nodes'], blocks['n_phys_nodes'] = str(an['n_cog']), str(an['n_phys'])
    for s in SCEN:
        for yr in ('2031', '2035'):
            v = cc[s][yr]
            blocks[f'cc_{yr}_cog_{s.lower()}'], blocks[f'cc_{yr}_phys_{s.lower()}'] = pct(v['cognitive']), pct(v['physical'])
    t67 = [n for n in N.values() if n['tier'] >= 6]
    blocks['n_t67'] = str(len(t67))
    gc = collections.Counter(n['binding_gate'] for n in t67).most_common()
    blocks['gates_t67'] = ', '.join(f'{k} ({v})' for k, v in gc[:-1]) + f' and {gc[-1][0]} ({gc[-1][1]})'
    ru = collections.Counter(n.get('runner_up_gate') for n in t67 if n.get('runner_up_gate'))
    blocks['runner_up_thinking_t67'] = str(sum(v for k, v in ru.items() if k in ('cognitive', 'formalization')))
    blocks['runner_up_t67'] = ', '.join(f'{k} ({v})' for k, v in ru.most_common())
    fam_nodes = [n for n in N.values() if n.get('catalog_families')]
    blocks['n_fam_nodes'] = str(len(fam_nodes))
    blocks['n_fam'] = str(len({f for n in fam_nodes for f in n['catalog_families']}))
    blocks['n_fam_math_nodes'] = str(sum(1 for n in fam_nodes if 1 <= n['tier'] <= 2))
    trust = lambda fams: 'T3, unaudited Lean' if all(f in LEAN for f in fams) else ('manuscript-only, T1 and conditional' if not any(f in LEAN for f in fams) else 'partly T1, conditional')
    hw = [n for n in fam_nodes if n['tier'] >= 5 and RANK[n['band_2035']['S2']] >= 2]
    if not hw:
        blocks['fam_hw_sentence'] = 'No node in the hardware tiers (5–7) rated Medium or better by 2035 depends on a catalog family.'
    else:
        blocks['fam_hw_sentence'] = (f"In the hardware tiers (5–7), only {len(hw)} node{'s' if len(hw) > 1 else ''} rated Medium or better by 2035 "
                                     f"cite{'' if len(hw) > 1 else 's'} a family ({'; '.join('“' + n['title'] + '”, family ' + ', '.join(n['catalog_families']) + ': ' + trust(n['catalog_families']) for n in hw)}), and only as supporting theory.")
    ks = {k['id']: k for k in an['keystones']}
    blocks['reach_public'] = str(ks.get('cap-research-math-public', {}).get('reach', ''))
    blocks['reach_applied'] = str(ks.get('cap-applied-math', {}).get('reach', ''))
    gcount = collections.Counter(n['binding_gate'] for n in N.values())
    for k in ('adoption', 'data', 'experiment', 'cognitive'):
        blocks[f'n_gate_{k}'] = str(gcount.get(k, 0))
    rows = []
    for tier, r in ts.items():
        rows.append([f'{tier} {TIER[int(tier)]}', r['n'], r['mean_S2_year'], f"{r['shift_S1_S2']:+.1f}", f"{r['shift_S2_S3']:+.1f}", f"{r['shift_S3_S4']:+.2f}",
                     ' / '.join(pct(r['hm_2031'][s]) for s in SCEN), ' / '.join(pct(r['hm_2035'][s]) for s in SCEN)])
    blocks['tier_shift_table'] = md_table(['Tier', 'Nodes', 'Mean Exponential year', 'Plateau → Exponential', 'Exponential → Recursive', 'Recursive → Embodied',
                                           'High or Medium by 2031 (S1 / S2 / S3 / S4)', 'High or Medium by 2035 (S1 / S2 / S3 / S4)'], rows)
    blocks['keystones_table'] = md_table(['Node', 'Tier', 'Exponential year', 'Nodes downstream', 'Of which systems/outcomes'],
                                         [[k['title'], k['tier'], k['S2'], k['reach'], k['reach_tier6_7']] for k in an['keystones'][:15]])
    # S4 credit
    sc = an['s4_credit']
    blocks['n_s4_credit'], blocks['n_s4_year'], blocks['n_s4_band'] = str(sc['n']), str(sc['n_year_earlier']), str(sc['n_band_up_2035'])
    blocks['n_s4_pre2032'] = str(sc['n_pre2032_diff'])
    isrobo = lambda i: i.startswith('robo-') or N[i].get('domain') == 'robots'
    blocks['n_s4_credit_robots'] = str(sum(1 for r in sc['nodes'] if isrobo(r[0])))
    blocks['n_s4_credit_other'] = str(sum(1 for r in sc['nodes'] if not isrobo(r[0])))
    blocks['s4_credit_table'] = md_table(['Node', 'Tier', 'Recursive year', 'Embodied year', 'By 2035: Recursive', 'By 2035: Embodied'],
                                         [[t_, tier, y3, y4, b3, b4] for _, t_, tier, y3, y4, b3, b4 in sc['nodes']])
    # year by year, Exponential, tiers 4-7
    out = []
    for yr in [str(x) for x in YEARS] + ['>2035']:
        items = an['per_year']['S2'].get(yr, [])
        if yr == '>2035':
            items = [r for r in items if r[1] >= 4]
        else:
            items = [r for r in items if r[1] >= 4 and (RANK.get(r[3], 0) >= 2 or RANK.get(r[4], 0) >= 2)]
        if not items:
            continue
        out.append(f"**{'after 2035' if yr == '>2035' else yr}**" + ('' if yr == '>2035' else ' (High or Medium by 2031 or by 2035; likelihoods shown as 2031 / 2035)'))
        for k, tier, title, b31, b35 in items:
            n = N[k]
            out.append(f"- {title} (tier {tier}, {bands(n, 'S2')}; Plateau {n['earliest_year']['S1']}, Recursive {n['earliest_year']['S3']}, Embodied {n['earliest_year']['S4']})")
        out.append('')
    blocks['year_by_year'] = '\n'.join(out)
    # branches
    bl = []
    for b in sorted(g.get('branches', []), key=lambda b: b.get('order', 99)):
        ids = [k for k in b.get('nodes', []) if k in N]
        if not ids:
            continue
        tree, mm = spine_tree(g, b)
        bl.append(f"### {b.get('title')}\n")
        if b.get('thesis'):
            bl.append(f"*{b['thesis']}*\n")
        nf = os.path.join(NARR_DIR, b['id'] + '.md')
        if os.path.exists(nf):
            bl.append(open(nf).read().strip() + '\n')
        h31 = {s: sum(1 for k in ids if yv(N[k], s) <= 2031 and RANK[N[k]['band_2031'][s]] >= 2) for s in SCEN}
        h35 = {s: sum(1 for k in ids if yv(N[k], s) <= 2035 and RANK[N[k]['band_2035'][s]] >= 2) for s in SCEN}
        bl.append(f"{len(ids)} nodes. Rated High or Medium by 2031: " + ', '.join(f"{SNAME[s]} {h31[s]}" for s in SCEN)
                  + ". By 2035: " + ', '.join(f"{SNAME[s]} {h35[s]}" for s in SCEN) + f". Main binding gate: {b.get('binding_gate', 'n/a')}.\n")
        if tree:
            bl.append('**Main chain** (each node: tier · earliest year in the Exponential case · likelihood by 2031 / by 2035; Recursive and Embodied years shown where they differ)\n')
            bl.append(tree + '\n')
            bl.append(mm + '\n')
        sides = [c for c in (b.get('side_chains') or []) if c]
        if sides:
            bl.append('**Side lanes** (connected to the branch but off its main chain)\n')
            for c in sides:
                bl.append('- ' + ' → '.join(f"{N[x]['title']} ({tag(N[x])})" for x in c if x in N))
            bl.append('')
        for label, src in (('2031 challenge round', debates31), ('2035 and Embodied extension round', debates35)):
            d = src.get(b['id']) or []
            if d:
                bl.append(f"<details><summary>Where the reviewers disagreed: {label} ({len(d)} disputes)</summary>\n")
                if label.startswith('2031'):
                    bl.append('Recorded during the 2031 challenge round. Later passes adjusted some dates and bands; the node table below has the final values.\n')
                for x in d:
                    bl.append(scrub(f"- **{x['topic'].rstrip('.')}{'' if x['topic'].rstrip().endswith('?') else '.'}** *Skeptic:* {x['skeptic_view']} *Advocate:* {x['advocate_view']} *Resolution:* {x['resolution']}", N))
                bl.append('\n</details>\n')
        rows = []
        for k in sorted(ids, key=lambda k: (N[k]['tier'], yv(N[k], 'S2'))):
            n = N[k]
            rows.append([n['title'], n['tier'], ' / '.join(n['earliest_year'][s] for s in SCEN),
                         ' / '.join(B1[n['band_2031'][s]] for s in SCEN), ' / '.join(B1[n['band_2035'][s]] for s in SCEN), n['binding_gate'], n['pathway']])
        bl.append('<details><summary>All nodes in this branch</summary>\n')
        bl.append('Years and likelihoods are listed for Plateau / Exponential / Recursive / Embodied. H = High, M = Medium, L = Low, S = Speculative.\n')
        bl.append(md_table(['Node', 'Tier', 'Year', 'By 2031', 'By 2035', 'Binding gate', 'Pathway'], rows))
        bl.append('\n</details>\n')
    blocks['branches'] = '\n'.join(bl)
    # critical paths
    for key, s, cpt in (('S2_2031', 'S2', '2031'), ('S2_2035', 'S2', '2035'), ('S4_2035', 'S4', '2035')):
        rows_ = an['critical_paths'][key]
        tbl = []
        for r in rows_:
            chain = ' → '.join(f"{N[x]['title']} ({yy})" for x, t_, yy, gt in r['path'])
            tbl.append([r['title'], r['tier'], r['year'], r['band'], r['gate'], 'yes' if r['ai_on_critical_path'] else ('off the date-setting path' if r['ai_in_ancestry'] else 'none'),
                        'yes' if r['robots_on_critical_path'] else ('helps' if r['robots_in_ancestry'] else ''), chain])
        blocks[f'critical_paths_{key}'] = md_table(['Technology, system or outcome', 'Tier', f'{SNAME[s]} year', f'By {cpt}', 'Binding gate', 'AI-math step on the date-setting path', 'Robots', f'Path (latest prerequisite at each step, {SNAME[s]} years)'], tbl)
        p = key.lower()
        blocks[f'n_cp_{p}'] = str(len(rows_))
        blocks[f'n_cp_t5_{p}'] = str(sum(1 for r in rows_ if r['tier'] == 5))
        blocks[f'n_cp_ai_{p}'] = str(sum(1 for r in rows_ if r['ai_on_critical_path']))
        blocks[f'n_cp_public_{p}'] = str(sum(1 for r in rows_ if r['public_on_critical_path']))
        blocks[f'n_cp_noai_crit_{p}'] = str(sum(1 for r in rows_ if not r['ai_on_critical_path']))
        blocks[f'n_cp_noai_any_{p}'] = str(sum(1 for r in rows_ if not r['ai_in_ancestry']))
        blocks[f'n_cp_robots_crit_{p}'] = str(sum(1 for r in rows_ if r['robots_on_critical_path']))
        blocks[f'n_cp_robots_any_{p}'] = str(sum(1 for r in rows_ if r['robots_in_ancestry'] or r['robots_on_critical_path']))
        cg = collections.Counter(r['gate'] for r in rows_).most_common()
        blocks[f'cp_gates_{p}'] = ', '.join(f'{k} ({v})' for k, v in cg)
    # back-compat
    for k_old, k_new in (('n_cp', 'n_cp_s2_2031'), ('n_cp_t5', 'n_cp_t5_s2_2031'), ('n_cp_ai', 'n_cp_ai_s2_2031'), ('n_cp_public', 'n_cp_public_s2_2031'),
                         ('n_cp_noai_crit', 'n_cp_noai_crit_s2_2031'), ('n_cp_noai_any', 'n_cp_noai_any_s2_2031'), ('cp_gates', 'cp_gates_s2_2031')):
        blocks[k_old] = blocks[k_new]
    blocks['critical_paths'] = blocks['critical_paths_S2_2031']
    nil = []
    for dk, d in g['domains'].items():
        for x in d.get('nil_effects', [])[:3]:
            nil.append(f'- *{DOMAIN_NAMES.get(dk, dk)}.* {scrub(x, N)}')
    blocks['nil_effects'] = '\n'.join(nil)
    sp = []
    for dk, d in g['domains'].items():
        for x in d.get('signposts', [])[:3]:
            sp.append([DOMAIN_NAMES.get(dk, dk), scrub(x['event'], N), scrub(x['what_it_changes'], N)])
    blocks['signposts'] = md_table(['Domain', 'Event', 'What it would change'], sp)
    src = []
    for dk, d in g['domains'].items():
        src.append(f"**{DOMAIN_NAMES.get(dk, dk)}** ({len(d.get('sources', []))} sources)\n")
        for s in d.get('sources', []):
            if str(s.get('url', '')).startswith('http'):
                src.append(f"- [{esc(s.get('title'))}]({s['url']}) ({s.get('date', '')})")
        src.append('')
    blocks['sources'] = '\n'.join(src)
    return blocks


def main():
    gpath, apath, sdir, opath = sys.argv[1:5]
    debates31, debates35 = {}, {}
    for f in sys.argv[5:]:
        if not os.path.exists(f):
            continue
        wf = json.load(open(f))
        for c in (wf.get('challenge') or []):
            if c:
                debates31.setdefault(c['branch'], []).extend(c.get('debates', []))
        for c in (wf.get('branches') or []):
            if c:
                debates35.setdefault(c['branch'], []).extend(c.get('debates', []))
    g, an = json.load(open(gpath)), json.load(open(apath))
    blocks = gen(g, an, debates31, debates35)
    skel = open(os.path.join(sdir, '_skeleton.md')).read()

    def inc(m):
        f = os.path.join(sdir, m.group(1))
        return open(f).read().strip() if os.path.exists(f) else f'<!-- missing {m.group(1)} -->'
    doc = re.sub(r'\{\{file:([^}]+)\}\}', inc, skel)
    doc = re.sub(r'\{\{(\w+)\}\}', lambda m: blocks.get(m.group(1), m.group(0)), doc)
    open(opath, 'w').write(doc)
    left = sorted(set(re.findall(r'\{\{(\w+)\}\}', doc)))
    print(f'wrote {opath}: {len(doc.split())} words' + (f' | unfilled: {left}' if left else ''))


if __name__ == '__main__':
    main()

/* Tech tree hero: the whole Space Unlock Tree as a game research screen.
   Lanes are branches; each lane has a thinking row and a hardware row of milestones.
   A tech sits in the column of its earliest credible year; it is unlocked once that year has come and its odds for
   that year are Medium or better (odds are rated for every year; the same rule as the gap chart). */
const TechTree = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const BAND = ['Speculative', 'Low', 'Medium', 'High'];
  const NAMES = { S1: 'Plateau', S2: 'Exponential', S3: 'Recursive', S4: 'Embodied' };
  const GATE = { 'launch-internal': "launch (SpaceX's own)", 'launch-external': 'launch (customers)', capital: 'capital', adoption: 'adoption', data: 'data', qualification: 'qualification',
    regulatory: 'regulators', fabrication: 'fabrication', experiment: 'experiments', cognitive: 'thinking', formalization: 'formal proof' };
  // 24-unit line icons, one per lane
  const ICONS = {
    chip: 'M8 8h8v8H8z M10 5v3M14 5v3M10 16v3M14 16v3M5 10h3M5 14h3M16 10h3M16 14h3',
    sigma: 'M17 5H7l6 7-6 7h10',
    shield: 'M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z M9 12l2 2 4-4',
    dish: 'M5 10a9 9 0 0 0 9 9z M9.5 14.5l6-6 M17 6.5a1.5 1.5 0 1 1 0 .1 M8 21h6',
    stamp: 'M12 4a5 5 0 1 1 0 10a5 5 0 1 1 0-10z M9.8 9l1.6 1.6 2.8-3 M9 13.5L8 20l4-2 4 2-1-6.5',
    flame: 'M12 3c3 4 5.5 6 5.5 10a5.5 5.5 0 0 1-11 0c0-2.2 1.1-3.8 2.2-4.8 0 2 1 3.3 2.3 3.3C11 8.5 10 6.5 12 3z',
    capsule: 'M9 4h6l4 12H5z M5 16q7 5 14 0',
    satellite: 'M10 9h4v6h-4z M3 10h5v4H3z M16 10h5v4h-5z M12 9V5 M10.5 5h3',
    moon: 'M15 4a8 8 0 1 0 5 13A7 7 0 0 1 15 4z',
    telescope: 'M4 13l11-6 2.2 4-11 6z M17 6l2-1 2.2 4-2 1 M10 15l-2.5 6 M12 14l2.5 7',
    orbit: 'M3.5 15.5c-1.2-2.4 3-6.6 9.3-9.4s12-3 13.2-.6 M12 9.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5z',
    atom: 'M12 10.8a1.2 1.2 0 1 1 0 2.4a1.2 1.2 0 1 1 0-2.4z M3 12c0-2 4-3.6 9-3.6s9 1.6 9 3.6-4 3.6-9 3.6-9-1.6-9-3.6z M7.5 4.2c1.7-1 5 1.6 7.5 6s3.1 8.6 1.4 9.6-5-1.6-7.5-6-3.1-8.6-1.4-9.6z',
    arm: 'M4 20h8 M8 20v-3 M8 17l3-6 5 2 M11 11a1.4 1.4 0 1 1 0 .1 M16 13l2.5-3 M16 13l3 1.2',
  };
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const hexPts = r => [0, 1, 2, 3, 4, 5].map(i => { const a = Math.PI / 3 * i; return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`; }).join(' ');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function mount(root, D, opts) {
    const o = Object.assign({ scenario: 'S2', turn: 2030, autoplay: true, minWidth: 900, still: false, pace: { step: 760, hold: 1900 } }, opts || {});
    const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    const stage = root.querySelector('.tt-stage');
    const card = root.querySelector('.tt-card');
    const toast = root.querySelector('.tt-toast');
    const $ = k => root.querySelector(`[data-tt="${k}"]`);
    const YEARS = D.years, FIRST = YEARS[0], LAST = 2035;
    const N = D.nodes, E = D.edges;
    const parents = N.map(() => []);
    E.forEach(([a, b]) => parents[b].push(a));
    if (o.still) root.classList.add('still');
    let si = Math.max(0, D.scenarios.indexOf(o.scenario)), turn = o.turn;
    let W, H, colW, perRow, lanesY, pos, svg, gCols, gHead, gEdges, gNodes, gLabels, gSticky, front;
    let compact = false, LW = 168, frontX = 0, focusI = -1, timer = null, toastTimer = null, toastTurn = null, edgeTimer = null, touchAt = 0;
    const yrbar = root.querySelector('.tt-yrs'), more = root.querySelector('.tt-more');
    // a returning reader starts at the last turn instead of waiting through the replay (MO-4); per viewer, best effort
    let seen = false;
    try { seen = !o.still && localStorage.getItem('tc-tree-seen') === '1'; localStorage.setItem('tc-tree-seen', '1'); } catch (e) {}
    if (seen) turn = LAST;
    const PAD_R = 14, HEAD = 32, STEP = 11;

    const scen = () => D.scenarios[si];
    const odds = (n, t = turn) => +n.o[si][Math.min(LAST, Math.max(FIRST, t)) - FIRST];
    const state = (n, t = turn) => {
      if (n.y[si] > t) return 'lock';
      return odds(n, t) >= 2 ? 'on' : 'res';
    };
    // first year each band is reached, for the card: "Medium from 2031 · High from 2034"
    const crossings = n => [1, 2, 3].map(b => { const k = n.o[si].split('').findIndex(c => +c >= b); return k < 0 ? null : FIRST + k; });
    const wTitle = n => (n.wt && n.wt[si]) || n.t;

    // ---------- layout ----------
    function layout() {
      const vw = Math.floor(stage.clientWidth || o.minWidth);
      // Below the full width the side column keeps only icons and the names ride inside the lanes.
      compact = !o.still && vw < o.minWidth;
      root.classList.toggle('compact', compact);
      LW = compact ? 34 : 168;
      W = Math.max(compact ? 660 : o.minWidth, vw);
      colW = (W - LW - PAD_R) / YEARS.length;
      perRow = Math.max(3, Math.floor((colW - 8) / STEP));
      const need = D.lanes.map(() => [1, 1]);
      for (let s = 0; s < D.scenarios.length; s++) {
        const cnt = {};
        N.forEach(n => { const key = n.l + ':' + n.k + ':' + n.y[s]; cnt[key] = (cnt[key] || 0) + (n.w ? 2 : 1); });
        for (const key in cnt) { const [l, k] = key.split(':').map(Number); need[l][k] = Math.max(need[l][k], Math.ceil(cnt[key] / perRow)); }
      }
      let y = HEAD;
      lanesY = D.lanes.map((_, l) => {
        const top = y, sTop = top + (compact ? 19 : 7), pTop = sTop + need[l][0] * STEP + 5, bottom = pTop + need[l][1] * STEP + 8;
        y = bottom;
        return { top, sTop, pTop, bottom };
      });
      H = y + 22;
    }

    // Slot within its (lane, row, year) cell; a wonder goes last and takes two slots so its diamond has room.
    function positions(s) {
      const cells = {}, out = new Array(N.length);
      N.forEach((n, i) => { const key = n.l + ':' + n.k + ':' + n.y[s]; (cells[key] = cells[key] || []).push(i); });
      for (const key in cells) {
        const ids = cells[key].sort((a, b) => (N[a].w ? 1 : 0) - (N[b].w ? 1 : 0) || N[a].tier - N[b].tier || a - b);
        const slots = ids.length + ids.filter(i => N[i].w).length;
        const across = Math.min(slots, perRow);
        let j = 0;
        ids.forEach(i => {
          const n = N[i], col = YEARS.indexOf(n.y[s]);
          if (n.w && j % perRow === perRow - 1) j++; // keep the wonder's two slots on one line
          const x0 = LW + col * colW + (colW - across * STEP) / 2 + STEP / 2;
          const L = lanesY[n.l];
          const xx = x0 + (j % perRow) * STEP + (n.w ? STEP / 2 : 0);
          out[i] = [xx, (n.k ? L.pTop : L.sTop) + Math.floor(j / perRow) * STEP + STEP / 2];
          j += n.w ? 2 : 1;
        });
      }
      return out;
    }

    function edgeD(a, b) {
      const [x1, y1] = a, [x2, y2] = b;
      if (x2 - x1 < 6) { const bx = Math.max(x1, x2) + 16; return `M${x1 + 4},${y1}C${bx},${y1} ${bx},${y2} ${x2 + 4},${y2}`; }
      const dx = Math.max(14, (x2 - x1) * 0.5);
      return `M${x1 + 5},${y1}C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2 - 5},${y2}`;
    }

    // ---------- drawing ----------
    function draw() {
      layout();
      pos = positions(si);
      stage.innerHTML = '';
      svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img' }, stage);
      gCols = el('g', {}, svg);
      YEARS.forEach((y, c) => el('rect', { class: 'tt-col', x: LW + c * colW + 1, y: HEAD - 6, width: colW - 2, height: H - HEAD - 10, rx: 4, 'data-y': y }, gCols));
      gHead = el('g', {}, svg);
      YEARS.forEach((y, c) => {
        const t = el('text', { class: 'tt-yr', x: LW + c * colW + colW / 2, y: 18, 'text-anchor': 'middle', 'data-y': y }, gHead);
        t.textContent = y > LAST ? 'Later' : y;
      });
      const gLanes = el('g', {}, svg);
      gSticky = el('g', {}, svg);
      D.lanes.forEach((lane, l) => {
        const L = lanesY[l];
        if (l) el('line', { class: 'tt-lane-sep', x1: 10, x2: W - PAD_R, y1: L.top, y2: L.top }, gLanes);
        const ic = el('g', { transform: compact ? `translate(9 ${L.top + 4}) scale(0.68)` : `translate(12 ${L.sTop - 4}) scale(0.7)` }, compact ? gSticky : gLanes);
        el('path', { class: 'tt-lane-icon', d: ICONS[lane.icon] }, ic);
        const nm = compact ? el('text', { class: 'tt-lane-name c', x: 28, y: L.top + 13 }, gSticky)
          : el('text', { class: 'tt-lane-name', x: 34, y: L.sTop + 9 }, gLanes);
        nm.textContent = lane.name;
      });
      let lt = null;
      stage.onscroll = compact ? () => {
        gSticky.style.transform = `translateX(${stage.scrollLeft}px)`;
        if (yrbar) yrbar.style.transform = `translateX(${-stage.scrollLeft}px)`;
        if (more) {
          more.classList.toggle('gone', stage.scrollLeft + stage.clientWidth >= stage.scrollWidth - 8);
          more.textContent = stage.scrollLeft < 24 ? 'Later years →' : '→';
        }
        clearTimeout(lt); lt = setTimeout(placeLabels, 80);
      } : null;
      gEdges = el('g', {}, svg);
      front = el('line', { class: 'tt-front', x1: 0, x2: 0, y1: HEAD - 8, y2: H - 16 }, svg);
      gNodes = el('g', {}, svg);
      gLabels = el('g', {}, svg);
      N.forEach((n, i) => {
        const g = el('g', { class: `tt-n ${n.k ? 'p' : 's'}${n.w ? ' w' : ''}`, 'data-i': i }, gNodes);
        g.style.transform = `translate(${pos[i][0]}px, ${pos[i][1]}px)`;
        el('rect', { class: 'hit', x: n.w ? -8 : -6, y: n.w ? -8 : -6, width: n.w ? 16 : 12, height: n.w ? 16 : 12 }, g);
        if (n.w) {
          el('polygon', { class: 'sh', points: '0,-6.5 6.5,0 0,6.5 -6.5,0' }, g);
          g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
          g.setAttribute('aria-label', `Wonder: ${n.w}. Show its card.`);
          const lab = el('g', { class: 'tt-wl', 'data-i': i }, gLabels);
          const tw = n.w.length * 6.1 + 24;
          lab.dataset.w = tw;
          el('rect', { x: 0, y: 0, width: tw, height: 17, rx: 8.5 }, lab);
          const st = el('text', { class: 'star', x: 8, y: 12 }, lab); st.textContent = '★';
          const tx = el('text', { x: 19, y: 12.5 }, lab); tx.textContent = n.w;
        } else if (n.k) {
          el('rect', { class: 'sh', x: -3.9, y: -3.9, width: 7.8, height: 7.8, rx: 1.3 }, g);
        } else {
          el('polygon', { class: 'sh', points: hexPts(4.6) }, g);
        }
      });
      drawEdges();
      paint(null);
      bindNodes();
      const hint = root.querySelector('.tt-hint');
      if (hint && !o.still) hint.textContent = compact && W > stage.clientWidth ? 'Swipe the tree sideways · tap a milestone to light the path to it' : 'Tap or hover a milestone to light the path that leads to it';
      if (yrbar) {
        yrbar.style.width = W + 'px';
        yrbar.innerHTML = YEARS.map((y, c) => `<span data-y="${y}" style="left:${LW + c * colW + colW / 2}px">${y > LAST ? 'Later' : y}</span>`).join('');
      }
      follow(true);
      if (stage.onscroll) stage.onscroll();
    }

    function drawEdges() {
      gEdges.innerHTML = '';
      E.forEach(([a, b], k) => el('path', { class: `tt-e${N[b].k ? ' p' : ''}`, d: edgeD(pos[a], pos[b]), 'data-k': k }, gEdges));
    }

    // Wonder name pills: try six spots around the diamond and keep the one covering the fewest milestones, off the front line,
    // inside the visible tree and, at phone width, off the lane names that ride along the left edge (MO-2).
    function placeLabels() {
      const vx = compact ? stage.scrollLeft : 0, vw = compact ? stage.clientWidth : W;
      gLabels.querySelectorAll('.tt-wl').forEach(lab => {
        const i = +lab.dataset.i, [x, y] = pos[i], w = +lab.dataset.w, h = 17;
        // a wonder scrolled out of view drops its label rather than leave a clipped pill at the edge
        lab.style.opacity = compact && (x < vx + 6 || x > vx + vw - 6) ? '0' : '';
        const cands = [[9, -h - 4], [-w - 9, -h - 4], [9, 5], [-w - 9, 5], [-w / 2, -h - 9], [-w / 2, 10]];
        let best = null, bestScore = Infinity;
        cands.forEach(([dx, dy], c) => {
          const x0 = x + dx, y0 = y + dy, x1 = x0 + w, y1 = y0 + h;
          let score = c * 0.1;
          for (let j = 0; j < N.length; j++) if (j !== i) { const [px, py] = pos[j]; if (px > x0 - 5 && px < x1 + 5 && py > y0 - 5 && py < y1 + 5) score += 1; }
          if (frontX > x0 && frontX < x1) score += 6;
          if (x0 < LW || x1 > W - 4) score += 50;
          if (compact && (x0 < vx + 4 || x1 > vx + vw - 4)) score += 100;
          if (compact) lanesY.forEach(L => { if (x0 < vx + 160 && y0 < L.top + 19 && y1 > L.top) score += 30; });
          if (score < bestScore) { bestScore = score; best = [x0, y0]; }
        });
        lab.style.transform = `translate(${best[0]}px, ${best[1]}px)`;
      });
    }

    // ---------- state ----------
    function counts(t) {
      let s = 0, p = 0, sT = 0, pT = 0;
      N.forEach(n => { const on = state(n, t) === 'on'; if (n.k) { pT++; if (on) p++; } else { sT++; if (on) s++; } });
      return { s, p, sT, pT, sp: Math.round(100 * s / sT), pp: Math.round(100 * p / pT) };
    }

    function paint(fromTurn) {
      const prev = fromTurn != null ? N.map(n => state(n, fromTurn)) : null;
      const st = N.map(n => state(n));
      gNodes.querySelectorAll('.tt-n').forEach(g => {
        const i = +g.dataset.i;
        g.classList.remove('lock', 'res', 'on');
        g.classList.add(st[i]);
        if (prev && prev[i] !== 'on' && st[i] === 'on' && !reduced) { g.classList.add('pop'); setTimeout(() => g.classList.remove('pop'), 650); }
      });
      gLabels.querySelectorAll('.tt-wl').forEach(g => g.classList.toggle('lock', st[+g.dataset.i] !== 'on'));
      gEdges.querySelectorAll('.tt-e').forEach(e => { const [a, b] = E[+e.dataset.k]; e.classList.toggle('on', st[a] === 'on' && st[b] === 'on'); });
      gCols.querySelectorAll('.tt-col').forEach(r => r.classList.toggle('past', +r.dataset.y <= turn));
      gHead.querySelectorAll('.tt-yr').forEach(t => t.classList.toggle('now', +t.dataset.y === turn));
      if (yrbar) yrbar.querySelectorAll('span').forEach(t => t.classList.toggle('now', +t.dataset.y === turn));
      frontX = LW + (YEARS.indexOf(turn) + 1) * colW;
      front.style.transform = `translateX(${frontX}px)`;
      placeLabels();
      const c = counts(turn);
      $('year').textContent = turn;
      $('s-val').innerHTML = `${c.sp}%<small>${c.s} of ${c.sT}</small>`;
      $('p-val').innerHTML = `${c.pp}%<small>${c.p} of ${c.pT}</small>`;
      $('s-fill').style.width = `${100 * c.s / c.sT}%`;
      $('p-fill').style.width = `${100 * c.p / c.pT}%`;
      const live = $('live');
      if (live) live.textContent = `Turn ${turn} (one turn is one year): thinking leads hardware by ${c.sp - c.pp} pts`;
      // move focus off a button before it is disabled, so keyboard users keep their place
      const atStart = turn <= FIRST, atEnd = turn >= LAST;
      if (atEnd && document.activeElement === $('next')) $('play').focus();
      if (atStart && document.activeElement === $('prev')) $('next').focus();
      $('prev').disabled = atStart;
      $('next').disabled = atEnd;
      if (!timer) $('play').textContent = atEnd ? '↺ Replay' : '▶ Play';
      if ($('skip')) $('skip').disabled = atEnd;
      svg.setAttribute('aria-label', `Tree of ${N.length} milestones, turn ${turn}, ${NAMES[scen()]} case: ${c.s} of ${c.sT} thinking milestones and ${c.p} of ${c.pT} hardware milestones unlocked.`);
      if (prev) announce(prev, st, fromTurn);
      if (focusI >= 0) highlight(focusI);
    }

    // ---------- toasts: wonders and the end of the run ----------
    function announce(prev, st, fromTurn) {
      const rows = [];
      const fresh = N.map((n, i) => (n.w && prev[i] !== 'on' && st[i] === 'on') ? i : -1).filter(i => i >= 0);
      fresh.slice(0, 3).forEach(i => {
        const n = N[i];
        const pic = n.img ? `<img src="${esc(n.img)}" alt="">` : `<b>${esc((n.wb && n.wb[si]) || '')}</b>`;
        rows.push(`<div class="row"><div class="pic">${pic}</div><div><div class="t">★ ${esc(n.w)}</div><div class="y">${esc(wTitle(n))}</div></div></div>`);
      });
      let head = fresh.length ? `${fresh.length === 1 ? 'Wonder' : fresh.length + ' wonders'} unlocked · ${turn}` : `Turn ${turn}`;
      let ms = 2800 + 900 * Math.max(0, fresh.length - 1);
      if (turn >= LAST && fromTurn < LAST) {
        const c = counts(turn);
        const wait = {};
        N.forEach(n => { if (n.k && state(n) !== 'on') wait[n.g] = (wait[n.g] || 0) + 1; });
        const top = Object.entries(wait).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g, k]) => `${GATE[g] || g} (${k})`);
        const left = c.pT - c.p;
        rows.push(`<div class="sum"><b>${NAMES[scen()]} case, turn ${turn}:</b> thinking ${c.sp}% · hardware ${c.pp}%. ${left} hardware milestones are still unlit, mostly waiting on ${top.slice(0, -1).join(', ')} and ${top[top.length - 1]}.</div>`);
        if (!fresh.length) head = `By 2035 · ${turn}`;
        ms = 7000;
      }
      if (!rows.length) return;
      showToast(head, rows.join(''), ms);
    }

    function showToast(head, body, ms) {
      if (o.still) return;
      toast.innerHTML = `<span class="tt-k k">${esc(head)}</span>${body}`;
      if (!coarse && !compact) toast.style.top = (stage.offsetTop + 10) + 'px';
      toast.classList.add('show');
      toastTurn = turn;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), ms);
    }

    // ---------- focus: one tech and its research path ----------
    function ancestors(i) {
      const seen = new Set([i]), stack = [i];
      while (stack.length) for (const p of parents[stack.pop()]) if (!seen.has(p)) { seen.add(p); stack.push(p); }
      return seen;
    }
    function highlight(i) {
      const keep = ancestors(i);
      root.classList.add('focus');
      gNodes.querySelectorAll('.tt-n').forEach(g => { const j = +g.dataset.i; g.classList.toggle('hl', keep.has(j)); g.classList.toggle('cur', j === i); });
      gLabels.querySelectorAll('.tt-wl').forEach(g => g.classList.toggle('hl', keep.has(+g.dataset.i)));
      gEdges.querySelectorAll('.tt-e').forEach(e => { const [a, b] = E[+e.dataset.k]; e.classList.toggle('hl', keep.has(a) && keep.has(b)); });
      return keep.size - 1;
    }
    function clearFocus() {
      focusI = -1;
      root.classList.remove('focus');
      if (!gNodes) return;
      gNodes.querySelectorAll('.hl, .cur').forEach(g => g.classList.remove('hl', 'cur'));
      gLabels.querySelectorAll('.hl').forEach(g => g.classList.remove('hl'));
      gEdges.querySelectorAll('.hl').forEach(e => e.classList.remove('hl'));
      card.classList.remove('show', 'sheet');
    }
    function showCard(i, sheet) {
      const n = N[i], st = state(n);
      const nPath = highlight(i);
      focusI = i;
      const yr = n.y[si] > LAST ? 'after 2035' : n.y[si];
      const status = st === 'on' ? 'Unlocked' : st === 'res' ? 'Year reached, odds under 30%' : 'Not yet';
      const toCard = n.w && sheet && document.getElementById('h-' + n.id) ? `<button class="go" type="button" data-go="${esc(n.id)}">See its card ↓</button>` : '';
      card.innerHTML = `<button class="close" type="button" aria-label="Close">×</button>
        <div class="kind ${n.k ? 'p' : 's'}"><span>${n.w ? '★ Wonder · ' : ''}${n.k ? 'Hardware' : 'Thinking'}</span><span>${esc(D.tiers[n.tier])}</span></div>
        <h4>${esc(n.w ? wTitle(n) : n.t)}</h4>
        ${n.img ? `<div class="img"><img src="${esc(n.img)}" alt=""></div>` : ''}
        <div>${esc(n.d)}</div>
        <dl><dt>Earliest</dt><dd>${yr} <span class="dim">(${NAMES[scen()]})</span></dd>
        <dt>Odds</dt><dd>${BAND[odds(n)]} in ${turn}${oddsLine(n)}</dd>
        <dt>Waits on</dt><dd>${GATE[n.g] || n.g}${n.r ? `<span class="dim">, then ${GATE[n.r] || n.r}</span>` : ''}</dd>
        <dt>Turn ${turn}</dt><dd>${status}</dd></dl>
        <div class="path">${nPath ? `Lit: the ${nPath} milestone${nPath === 1 ? '' : 's'} on the path to it.` : 'A root milestone: nothing comes before it.'}${n.w && !sheet ? ' Click the wonder to see its card.' : ''}</div>${toCard}`;
      card.classList.toggle('sheet', !!sheet);
      card.style.left = card.style.top = '';
      if (!sheet) {
        // keep the card inside both the tree and the visible part of the window
        const fr = root.getBoundingClientRect();
        const nb = gNodes.querySelector(`[data-i="${i}"]`).getBoundingClientRect();
        const cw = card.offsetWidth || 320, ch = card.offsetHeight || 240;
        let x = nb.right - fr.left + 14;
        if (x + cw > fr.width - 10) x = nb.left - fr.left - cw - 14;
        const vTop = Math.max(10, 10 - fr.top), vBot = Math.min(fr.height, innerHeight - fr.top) - 10;
        const y = Math.max(vTop, Math.min(nb.top - fr.top - 30, vBot - ch));
        card.style.left = Math.max(10, x) + 'px'; card.style.top = y + 'px';
      }
      card.classList.add('show');
    }
    function oddsLine(n) {
      const c = crossings(n), parts = [];
      ['Low', 'Medium', 'High'].forEach((b, k) => { if (c[k] != null && c[k] > turn && (k === 0 || c[k] !== c[k - 1])) parts.push(`${b} from ${c[k]}`); });
      return parts.length ? ' · ' + parts.join(' · ') : '';
    }
    // smooth scrolling can be dropped (some phone browsers, background tabs); fall back to a jump if the card is not on screen
    const toCardOf = id => {
      const h = document.getElementById('h-' + id);
      if (!h) return;
      h.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      const y0 = scrollY;
      setTimeout(() => { const r = h.getBoundingClientRect(); if (scrollY === y0 && (r.top < 0 || r.bottom > innerHeight)) h.scrollIntoView({ block: 'center' }); }, 450);
    };

    // ---------- turns and play ----------
    function follow(jump) {
      const vw = stage.clientWidth;
      if (!vw || stage.scrollWidth <= vw + 2) return;
      if (!jump && frontX > stage.scrollLeft + 40 && frontX < stage.scrollLeft + vw - 40) return;
      stage.scrollTo({ left: Math.max(0, frontX - vw * 0.7), behavior: jump || reduced ? 'auto' : 'smooth' });
    }
    function setTurn(t, withToast) {
      const from = turn;
      turn = Math.max(FIRST, Math.min(LAST, t));
      paint(withToast && turn !== from ? from : null);
      follow(false);
      if (focusI >= 0 && card.classList.contains('show')) showCard(focusI, card.classList.contains('sheet'));
    }
    function stop() { clearTimeout(timer); timer = null; $('play').textContent = turn >= LAST ? '↺ Replay' : '▶ Play'; }
    function play(from, onDone) {
      stop();
      if (from != null) setTurn(from, false);
      else if (turn >= LAST) setTurn(FIRST, false);
      $('play').textContent = '❚❚ Pause';
      const tick = () => {
        if (turn >= LAST) { stop(); if (onDone) onDone(); return; }
        setTurn(turn + 1, true);
        timer = setTimeout(tick, toastTurn === turn ? o.pace.hold : o.pace.step); // hold a beat when something was announced
      };
      timer = setTimeout(tick, o.pace.step);
    }

    // ---------- autoplay once, handing control to the reader at the first touch ----------
    let autoDone = !o.autoplay || reduced || o.still || seen, autoRun = false, autoT = null;
    function stopAuto() { autoDone = true; clearTimeout(autoT); if (autoRun) { autoRun = false; stop(); } }
    if (!autoDone && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => {
        const e = es[es.length - 1];
        const seen = e.intersectionRatio >= 0.35 || e.intersectionRect.height >= innerHeight * 0.6;
        if (autoDone || !seen) return;
        autoDone = true; io.disconnect();
        autoT = setTimeout(() => {
          if (timer) return;
          autoRun = true;
          play(FIRST, () => { autoRun = false; if (compact) stage.scrollTo({ left: 0, behavior: 'smooth' }); });
        }, 900);
      }, { threshold: [0, 0.15, 0.3, 0.35] });
      io.observe(root);
    }
    // on phones the toast is fixed to the screen, so it only shows while the tree is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { const on = es[es.length - 1].isIntersecting; root.classList.toggle('inview', on); if (!on) toast.classList.remove('show'); }).observe(root);
    }

    // ---------- events ----------
    function bindNodes() {
      gNodes.addEventListener('pointerover', ev => {
        if (ev.pointerType === 'touch') return;
        const g = ev.target.closest('.tt-n'); if (g) showCard(+g.dataset.i, false);
      });
      gNodes.addEventListener('pointerleave', ev => { if (ev.pointerType !== 'touch') clearFocus(); });
      gNodes.addEventListener('pointerdown', ev => {
        if (ev.pointerType !== 'touch') return;
        const g = ev.target.closest('.tt-n');
        if (g) { touchAt = performance.now(); stopAuto(); showCard(+g.dataset.i, true); }
      });
      gNodes.addEventListener('click', ev => {
        const g = ev.target.closest('.tt-n.w');
        if (g && performance.now() - touchAt > 600) toCardOf(N[+g.dataset.i].id);
      });
    }
    root.addEventListener('focusin', ev => {
      const g = ev.target.closest && ev.target.closest('.tt-n');
      if (g && performance.now() - touchAt > 600) showCard(+g.dataset.i, false);
    });
    root.addEventListener('focusout', ev => { if (ev.target.closest && ev.target.closest('.tt-n') && !card.classList.contains('sheet')) clearFocus(); });
    root.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') clearFocus();
      if (ev.key === 'Enter' && ev.target.closest && ev.target.closest('.tt-n.w')) toCardOf(N[+ev.target.closest('.tt-n.w').dataset.i].id);
    });
    card.addEventListener('click', ev => {
      if (ev.target.closest('.close')) clearFocus();
      const go = ev.target.closest('[data-go]');
      if (go) { const id = go.dataset.go; clearFocus(); toCardOf(id); }
    });
    stage.addEventListener('pointerdown', stopAuto);
    stage.addEventListener('wheel', stopAuto, { passive: true });
    $('prev').addEventListener('click', () => { stopAuto(); stop(); setTurn(turn - 1, false); });
    $('next').addEventListener('click', () => { stopAuto(); stop(); setTurn(turn + 1, true); });
    $('play').addEventListener('click', () => { stopAuto(); timer ? stop() : play(); });
    if ($('skip')) $('skip').addEventListener('click', () => { stopAuto(); stop(); setTurn(LAST, true); });

    function setScenario(s) {
      const k = D.scenarios.indexOf(s);
      if (k < 0 || k === si) return;
      si = k;
      clearFocus();
      pos = positions(si);
      gEdges.style.opacity = '0';
      gNodes.querySelectorAll('.tt-n').forEach(g => { g.style.transform = `translate(${pos[+g.dataset.i][0]}px, ${pos[+g.dataset.i][1]}px)`; });
      paint(null);
      clearTimeout(edgeTimer);
      edgeTimer = setTimeout(() => { drawEdges(); paint(null); gEdges.style.opacity = ''; }, reduced ? 0 : 620);
    }

    let rt, lastW = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        const w = stage.clientWidth;
        if (Math.abs(w - lastW) > 30 || (w < o.minWidth) !== compact) { lastW = w; clearFocus(); draw(); }
      }, 160);
    });
    draw();
    lastW = stage.clientWidth;
    return { setScenario, setTurn: t => setTurn(t, false), play, focus: i => showCard(i, false) };
  }

  return { mount };
})();

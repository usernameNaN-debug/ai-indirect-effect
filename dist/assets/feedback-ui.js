import { DEFAULTS, PRESETS, solveBoundaryPath } from './model.js';
import { FEEDBACK_NODES, feedbackMeasurements } from './feedback-model.js';

const NS = 'http://www.w3.org/2000/svg';
const BLUE = '#0F4D92', LIGHT_BLUE = '#3775BA', RED = '#B64342', GRAY = '#767676';
const finite = Number.isFinite;
const format = (v, digits = 3) => !finite(v) ? 'Undefined' : Math.abs(v) > 9999 || Math.abs(v) > 0 && Math.abs(v) < .001 ? v.toExponential(2) : Number(v.toFixed(digits)).toLocaleString('en-US', { maximumFractionDigits: digits });
const signed = (v, digits = 2) => {const rounded=Number(v.toFixed(digits));return `${rounded > 0 ? '+' : rounded < 0 ? '−' : ''}${format(Math.abs(rounded), digits)}`;};
const percent = v => `${format(v * 100, 1)}%`;
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const make = (tag, attrs = {}, parent, text) => { const e = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); if (text !== undefined) e.textContent = text; parent?.append(e); return e; };
const svg = (tag, attrs = {}, parent, text) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); if (text !== undefined) e.textContent = text; parent?.append(e); return e; };
const regime = r => ({ human: 'Human research', mixed: 'Mixed research', machine: 'Autonomous research', grounded: 'Human grounding' }[r] || 'Research');
const SHOCKS = {
  practice: { title: 'Practice loss', key: 'practiceDecay', target: 3, description: 'Faster loss of diagnostic work as customer capability grows.' },
  services: { title: 'New services', key: 'demandGrowth', target: .55, description: 'Discovery raises the demand for expert services at a given wage.' },
  machines: { title: 'Cheaper research', key: 'machineMultiplier', target: .7, description: 'Fewer machine resources are required for each completed research packet.' },
};
const PARTS = {
  full: { title: 'Full view', nodes: FEEDBACK_NODES.map(n => n.id), description: 'Follow customer work through careers, research, and the returning frontier.' },
  customers: { title: 'Customer work', nodes: ['c', 'prep', 'm', 'disc', 'ds', 'cp', 'pf'], description: 'Customer preparation changes diagnostic practice, while discovery changes the services purchased.' },
  careers: { title: 'Careers', nodes: ['m', 'e', 'w', 'd', 'x'], description: 'Practice and privately financed study replenish expertise as wages and career values adjust.' },
  research: { title: 'Research', nodes: ['c', 'prep', 'm', 'e', 'w', 'lr', 'a'], description: 'Customer work changes expert supply and wages, which determine the research a fixed budget purchases.' },
  machines: { title: 'Machines', nodes: ['a', 'my', 'wp', 'w', 'd', 'x'], description: 'Complete machine methods change research costs, parity wages, and the value of qualification.' },
};
const METRICS = { E: { title: 'Experts', label: 'Expert population share', unit: 'population share', format: percent }, w: { title: 'Wage', label: 'Hourly wage', unit: 'numeraire / hour', format }, Delta: { title: 'Value', label: 'Qualification value', unit: 'numeraire', format }, A: { title: 'Frontier', label: 'Frontier productivity', unit: 'productivity index', format } };
const NODE_COPY = {
  c: 'Customer capability rises with the research frontier through the model’s logarithmic interface.',
  prep: 'Diagnostic displacement records the fraction of initial practice removed from the selected customer portfolio.',
  disc: 'Discovery is shown through the net service-demand index, incorporating the selected preparation and discovery response.',
  cp: 'Qualification value finances the learning discount attached to this illustrative marginal case.',
  m: 'Practice counts verified transitions into qualification supplied by customer work per unit of model time.',
  ds: 'Purchased expert hours respond to the selected customer portfolio and the wage that clears the shared market.',
  pf: 'For the local payment example, one basic hour has a cash floor of 0.5. Its incoming links show the separate credit rule.',
  e: 'Expertise is inherited at time zero, then changes through diagnostic practice, formal study, and obsolescence.',
  w: 'Service customers and the research fund compete for the same qualified hours at the clearing wage.',
  wp: 'Equal complete-packet costs determine the parity wage, which pins the market wage while both research methods operate.',
  x: 'Each novice chooses formal study from the qualification value divided by the training cost parameter.',
  d: 'Career value anticipates future wage premia and satisfies the specified terminal qualification payoff.',
  diff: 'Idea difficulty gives the number of completed packets needed for another absolute frontier increment.',
  a: 'Completed, validated research packets advance the frontier and change the tools available to customers.',
  lr: 'Research procurement assigns expert time to human work or grounding as the available methods compete.',
  my: 'Machine output per dollar accounts for the resources used in both generation and validation.',
};
const NODE_UNITS = { c: 'capability index', prep: 'diagnostic-displacement index', disc: 'net demand index', cp: 'numeraire / local case', m: 'transitions / model time', ds: 'hours / model time', pf: 'numeraire / local case', e: 'population share', w: 'numeraire / hour', wp: 'numeraire / hour', x: 'per model time', d: 'numeraire', diff: 'difficulty index', a: 'productivity index', lr: 'hours / model time', my: 'packets / research dollar' };
let sequence = 0, worker, nextRequest = 0;
const jobs = new Map();
function solve(options) {
  return new Promise((resolve, reject) => {
    if (!window.Worker) { setTimeout(() => resolve(solveBoundaryPath(options)), 0); return; }
    if (!worker) {
      worker = new Worker(new URL('./model-worker.js', import.meta.url), { type: 'module' });
      worker.addEventListener('message', ({ data }) => { const job = jobs.get(data.id); if (job) { jobs.delete(data.id); job.resolve(data.result); } });
      worker.addEventListener('error', e => { jobs.forEach(j => j.reject(new Error(e.message || 'Numerical calculation requires another parameter setting.'))); jobs.clear(); worker.terminate(); worker = null; });
    }
    const id = ++nextRequest; jobs.set(id, { resolve, reject }); worker.postMessage({ id, type: 'path', options });
  });
}
function tabGroup(parent, label, values, current, change) {
  const group = make('div', { class: 'fb-tabs', role: 'group', 'aria-label': label }, parent);
  const buttons = values.map(([key, title]) => { const b = make('button', { type: 'button', 'aria-pressed': String(key === current) }, group, title); b.addEventListener('click', () => change(key)); return [key, b]; });
  return { group, set(value) { buttons.forEach(([key, b]) => b.setAttribute('aria-pressed', String(key === value))); } };
}
function valueChange(before, after) {
  if (!finite(before) || !finite(after)) return { value: 0, label: 'Undefined', absolute: true };
  const difference = after - before;
  return Math.abs(before) < 1e-9 ? { value: difference, label: `Δ ${signed(difference, 3)}`, absolute: true } : { value: difference / Math.abs(before) * 100, label: `${signed(difference / Math.abs(before) * 100, 1)}%`, absolute: false };
}
function frameAt(result, t) { return result.points.reduce((best, p) => Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best, result.points[0]); }

export function mountFeedback(host) {
  if (host.dataset.feedbackMounted) return;
  host.dataset.feedbackMounted = 'true'; host.classList.add('interactive', 'feedback-interactive');
  const full = host.dataset.fullscreen === 'true' || host.dataset.widget === 'feedback';
  host.classList.toggle('fb-fullscreen', full); host.classList.toggle('fb-embedded', !full);
  host.replaceChildren();
  if(full) make('h1',{class:'fb-sr-only'},host,'Economic feedback');
  const state = { view: 'shock', part: full && innerWidth >= 900 ? 'full' : 'customers', shock: 'practice', strength: 100, metric: 'E', time: 0, selected: { kind: 'node', id: 'e' }, hover: null, playing: false, ready: false, visible: false, autoplay: true };
  if (!PARTS[state.part].nodes.includes(state.selected.id)) state.selected.id = PARTS[state.part].nodes[0];
  const baseOptions = { ...DEFAULTS, ...PRESETS.mixed.options, steps: 240, E0: .55, A0: 1, terminalDelta: 0 };
  let baseline, after, afterOptions, revision = 0, frame = 0, previous = 0, lastTime = -1, scene, latest;
  const toolbar = make('div', { class: 'fb-toolbar' }, host);
  const views = tabGroup(toolbar, 'Feedback view', [['connections', 'Connections'], ['strength', 'Elasticities'], ['shock', 'Shock']], state.view, key => { state.view = key; views.set(key); host.dataset.view = key; update(true); });
  const playback = make('div', { class: 'fb-playback' }, toolbar);
  const play = make('button', { type: 'button', class: 'fb-play', disabled: '', 'aria-label': 'Play the solved paths' }, playback, 'Play');
  const replay = make('button', { type: 'button', class: 'fb-replay', disabled: '' }, playback, 'Replay');
  const clock = make('output', { class: 'fb-clock', 'aria-label': 'Current model time' }, playback, 't = 0 / 12');
  const controls = make('div', { class: 'fb-scenarios' }, host);
  const shocks = tabGroup(controls, 'Economic change', Object.entries(SHOCKS).map(([key, s]) => [key, s.title]), state.shock, key => { state.shock = key; shocks.set(key); state.autoplay = true; compute(); });
  const size = make('label', { class: 'fb-size' }, controls, 'Size');
  const strength = make('input', { type: 'number', min: '0', max: '200', step: '25', value: '100', 'aria-label': 'Shock size as a percentage of the named change' }, size);
  make('span', {}, size, '%');
  strength.addEventListener('change', () => { if (!strength.checkValidity() || strength.value === '') { status.textContent = 'Enter a shock size from 0 to 200 percent.'; return; } state.strength = +strength.value; state.autoplay = true; compute(); });
  const parts = tabGroup(host, 'Economic part', Object.entries(PARTS).filter(([key]) => full || key !== 'full').map(([key, p]) => [key, p.title]), state.part, key => { state.part = key; parts.set(key); if (!PARTS[key].nodes.includes(state.selected.id)) state.selected = { kind: 'node', id: PARTS[key].nodes[0] }; state.hover = null; buildGraph(); update(true); });
  parts.group.classList.add('fb-parts');
  const stage = make('div', { class: 'fb-stage' }, host);
  const graph = make('div', { class: 'fb-surface' }, stage);
  const inspector = make('aside', { class: 'fb-inspector', 'aria-label': 'Selected mechanism' }, stage);
  const inspectorContent = make('div', { class: 'fb-inspector-content' }, inspector);
  const below = make('div', { class: 'fb-below' }, host);
  const metricTabs = tabGroup(below, 'Path variable', Object.entries(METRICS).map(([key, m]) => [key, m.title]), state.metric, key => { state.metric = key; metricTabs.set(key); drawPlot(); updateInspector(); });
  const legend = make('div', { class: 'fb-legend' }, below);
  make('span', { class: 'fb-reference-key' }, legend, 'Baseline'); make('span', { class: 'fb-change-key' }, legend, 'After change');
  const plot = make('div', { class: 'fb-plot' }, host);
  const footer = make('div', { class: 'fb-footer' }, host);
  const status = make('p', { class: 'fb-status', role: 'status' }, footer, 'Computing the paired paths');
  const scale = make('p', { class: 'fb-scale' }, footer, 'Node bars show change from the baseline.');
  if (!full) make('a', { href: new URL('../feedback/', location.href).pathname, class: 'fb-full-link' }, footer, 'Full feedback map');
  host.dataset.view = state.view;

  function pause() { state.playing = false; cancelAnimationFrame(frame); play.textContent = 'Play'; play.setAttribute('aria-label', 'Play the solved paths'); }
  function start(reset = false) {
    if (!state.ready) return;
    if (reset || state.time >= baseOptions.horizon) state.time = 0;
    state.playing = true; previous = 0; play.textContent = 'Pause'; play.setAttribute('aria-label', 'Pause the solved paths');
    frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    if (!state.playing || !host.isConnected) return;
    if (previous && !document.hidden) state.time = Math.min(baseOptions.horizon, state.time + (now - previous) / 1000 * baseOptions.horizon / 13);
    previous = now; update();
    if (state.time >= baseOptions.horizon) { pause(); return; }
    frame = requestAnimationFrame(tick);
  }
  play.addEventListener('click', () => state.playing ? pause() : start());
  replay.addEventListener('click', () => { pause(); start(true); });
  graph.addEventListener('pointerover', event => { if (state.playing && event.target.closest('.fb-node,.fb-edge-hit')) pause(); });
  plot.addEventListener('pointerenter', () => { if (state.playing) pause(); });
  stage.addEventListener('focusin', () => { if (state.playing) pause(); });
  function autoStart() {
    if (!state.ready || !state.visible || !state.autoplay) return;
    state.autoplay = false;
    if (reduced()) { state.time = baseOptions.horizon; update(true); } else start(true);
  }
  async function compute() {
    const token = ++revision; pause(); state.ready = false; play.disabled = true; replay.disabled = true; state.time = 0; latest = null; lastTime = -1;
    status.textContent = 'Computing the paired paths';
    const change = SHOCKS[state.shock]; afterOptions = { ...baseOptions, [change.key]: baseOptions[change.key] + (change.target - baseOptions[change.key]) * state.strength / 100 };
    try {
      const results = await Promise.all([baseline ? Promise.resolve(baseline) : solve(baseOptions), solve(afterOptions)]);
      if (token !== revision) return;
      const failed = results.find(r => !r?.ok);
      if (failed) { graph.replaceChildren(); plot.replaceChildren(); inspectorContent.replaceChildren(); status.textContent = `Path unavailable. ${failed.diagnostics?.message || 'Choose another parameter setting to compute the paths.'}`; return; }
      [baseline, after] = results; state.ready = true; play.disabled = false; replay.disabled = false;
      buildGraph(); drawPlot(); update(true); autoStart();
    } catch (error) { if (token === revision) { graph.replaceChildren(); plot.replaceChildren(); status.textContent = `Path unavailable. ${error.message}`; } }
  }
  const observer = new IntersectionObserver(entries => { state.visible = entries[0].isIntersecting; if (state.visible) autoStart(); else if (state.playing) pause(); }, { threshold: .12 });
  observer.observe(host);
  let resizeWidth = 0;
  const resize = new ResizeObserver(entries => { const width = Math.round(entries[0].contentRect.width); if (width === resizeWidth || width < 1) return; resizeWidth = width; if (state.ready) { buildGraph(); drawPlot(); update(true); } });
  resize.observe(host);
  compute();

  // Rendering functions below share only state and the numerical ledger.
  function current() {
    const b = frameAt(baseline, state.time), a = frameAt(after, state.time);
    if (!latest || latest.t !== a.t) latest = { t: a.t, b, a, before: feedbackMeasurements({ point: b, points: baseline.points, parameters: baseOptions }), after: feedbackMeasurements({ point: a, points: after.points, parameters: afterOptions }) };
    return latest;
  }
  function target() { return state.hover || state.selected; }
  function focus(kind, id, transient) { if(state.playing)pause(); if (transient) state.hover = { kind, id }; else state.selected = { kind, id }; update(true); }
  function leave() { state.hover = null; update(true); }

  function graphLayout() {
    if (state.part === 'full' && graph.clientWidth >= 650) {
      return { width: 1000, height: 385, nodeWidth: 128, nodeHeight: 58, landscape: true,
        positions: { c: [80,65], prep: [248,65], m: [416,65], ds: [584,65], disc: [752,65], cp: [920,65], wp: [80,192], x: [248,192], e: [416,192], w: [584,192], d: [752,192], pf: [920,192], diff: [248,318], a: [416,318], lr: [584,318], my: [752,318] } };
    }
    if (state.part === 'full') {
      const positions = {}; ['c','prep','m','disc','ds','cp','pf','e','w','wp','d','x','diff','a','lr','my'].forEach((id, i) => { positions[id] = [65 + i % 3 * 125, 45 + Math.floor(i / 3) * 112]; });
      return { width: 380, height: 650, nodeWidth: 108, nodeHeight: 58, positions, landscape: false };
    }
    const layouts = {
      customers: { c: [70,65], prep: [242,65], m: [416,65], ds: [590,65], disc: [590,205], cp: [242,205], pf: [70,205] },
      careers: { m: [70,65], e: [242,65], w: [416,65], d: [590,65], x: [330,205] },
      research: { c: [70,65], prep: [242,65], m: [416,65], e: [590,65], w: [590,205], lr: [416,205], a: [242,205] },
      machines: { a: [100,65], my: [330,65], wp: [560,65], w: [560,205], d: [330,205], x: [100,205] },
    };
    if (graph.clientWidth < 500) {
      const positions = {}; PARTS[state.part].nodes.forEach((id, i) => { positions[id] = [65 + i % 3 * 125, 42 + Math.floor(i / 3) * 94]; });
      return { width: 380, height: PARTS[state.part].nodes.length > 6 ? 275 : 205, nodeWidth: 108, nodeHeight: 56, positions, landscape: false };
    }
    return { width: 660, height: 272, nodeWidth: 130, nodeHeight: 60, positions: layouts[state.part], landscape: false };
  }
  function pathFor(edge, layout) {
    const [x1,y1] = layout.positions[edge.from], [x2,y2] = layout.positions[edge.to], hw = layout.nodeWidth / 2, hh = layout.nodeHeight / 2;
    if (layout.landscape) {
      const routes = {
        p2: 'M80 36 C80 17 752 17 752 36',
        p5: 'M920 36 C920 2 248 2 248 36',
        p7: 'M752 163 C752 125 920 125 920 94',
        p12: 'M752 221 C752 249 248 249 248 221',
        p14: 'M80 163 C80 134 584 134 584 163',
        p17: 'M416 347 C416 374 6 374 6 344 L6 78 Q6 65 16 65',
        p18: 'M416 289 C416 272 248 272 248 289',
        p19: 'M312 328 C336 344 328 344 352 328',
        p20: 'M416 347 C416 365 752 365 752 347',
        p21: 'M752 289 C752 260 416 260 416 289',
        p22: 'M816 318 C875 318 972 287 972 268 Q972 253 952 253 L104 253 Q80 253 80 221',
      };
      if (routes[edge.id]) return routes[edge.id];
    }
    if (edge.id === 'p20' || edge.id === 'p21') {
      const down = edge.id === 'p20' ? 1 : -1;
      return `M${x1} ${y1 + down * hh} C${x1} ${y1 + down * (hh + 24)},${x2} ${y2 + down * (hh + 24)},${x2} ${y2 + down * hh}`;
    }
    if (Math.abs(x2-x1) > Math.abs(y2-y1)) {
      const dir = Math.sign(x2-x1), sx = x1+dir*hw, ex = x2-dir*hw;
      return `M${sx} ${y1} C${(sx+ex)/2} ${y1},${(sx+ex)/2} ${y2},${ex} ${y2}`;
    }
    const dir = Math.sign(y2-y1) || 1, sy = y1+dir*hh, ey = y2-dir*hh;
    return `M${x1} ${sy} C${x1} ${(sy+ey)/2},${x2} ${(sy+ey)/2},${x2} ${ey}`;
  }
  function buildGraph() {
    if (!state.ready) return;
    const data = current().after, layout = graphLayout(), id = `fb-${++sequence}`;
    graph.replaceChildren(); graph.dataset.part = state.part; graph.classList.toggle('fb-mobile-full', state.part === 'full' && !layout.landscape);
    const root = svg('svg', { viewBox: `0 0 ${layout.width} ${layout.height}`, role: 'group', 'aria-label': state.part === 'full' ? 'Complete economic feedback map with sixteen nodes and twenty-two relationships' : `${PARTS[state.part].title} feedback relationships` }, graph);
    svg('title', {}, root, PARTS[state.part].description);
    const defs = svg('defs', {}, root);
    const marker = svg('marker', { id: `${id}-arrow`, viewBox: '0 0 8 8', refX: '7', refY: '4', markerWidth: '5', markerHeight: '5', orient: 'auto-start-reverse', markerUnits: 'strokeWidth' }, defs);
    svg('path', { d: 'M1 1 L7 4 L1 7', fill: 'none', stroke: 'context-stroke', 'stroke-width': '1.2' }, marker);
    if (layout.landscape) {
      [['Customers',31,71,'#B4C0E4'],['Careers',157,71,'#E4CCD8'],['Research',284,68,'#F0C0CC']].forEach(([label,y,h,fill]) => {
        svg('text', { x: 13, y: y+h+17, class: 'fb-region-label' }, root, label);
      });
    }
    const links = svg('g', { class: 'fb-links' }, root), packets = svg('g', { class: 'fb-packets', 'pointer-events': 'none', 'aria-hidden': 'true' }, root), marks = svg('g', { class: 'fb-marks' }, root);
    const packetRefs = Array.from({ length: 3 }, (_,i) => svg('rect', { width: 9, height: 9, rx: 3, fill: i===1?'#D88A9A':'#3775BA', opacity: '.9' }, packets));
    const edgeRefs = new Map(), nodeRefs = new Map();
    Object.values(data.edges).filter(e => layout.positions[e.from] && layout.positions[e.to]).forEach(edge => {
      const d = pathFor(edge, layout);
      const path = svg('path', { d, class: 'fb-edge', 'marker-end': `url(#${id}-arrow)` }, links);
      const hit = svg('path', { d, class: 'fb-edge-hit', tabindex: '0', role: 'button', 'aria-label': edge.title, 'data-edge': edge.id }, links);
      hit.addEventListener('pointerenter', () => focus('edge', edge.id, true)); hit.addEventListener('pointerleave', leave);
      hit.addEventListener('focus', () => focus('edge', edge.id, true)); hit.addEventListener('blur', leave);
      hit.addEventListener('click', () => focus('edge', edge.id, false));
      hit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focus('edge', edge.id, false); } });
      edgeRefs.set(edge.id, { path, hit });
    });
    for (const [key, [x,y]] of Object.entries(layout.positions)) {
      const node = data.nodes[key], group = svg('g', { class: 'fb-node', transform: `translate(${x},${y})`, tabindex: '0', role: 'button', 'aria-label': node.title, 'data-node': key }, marks);
      const box = svg('rect', { x: -layout.nodeWidth/2, y: -layout.nodeHeight/2, width: layout.nodeWidth, height: layout.nodeHeight, rx: '11', class: 'fb-node-box' }, group);
      svg('text', { x: 0, y: -9, 'text-anchor': 'middle', class: 'fb-node-title' }, group, node.title);
      const value = svg('text', { x: 0, y: 10, 'text-anchor': 'middle', class: 'fb-node-value' }, group);
      const bar = svg('g', { class: 'fb-node-bar' }, group);
      svg('line', { x1: -layout.nodeWidth*.37, x2: layout.nodeWidth*.37, y1: 21, y2: 21, class: 'fb-bar-track' }, bar);
      svg('line', { x1: 0, x2: 0, y1: 17, y2: 25, class: 'fb-bar-zero' }, bar);
      const amount = svg('rect', { x: 0, y: 18, width: 0, height: 6, rx: '1' }, bar);
      const dot = svg('circle', { cx: 0, cy: 21, r: '1.3', fill: GRAY }, bar);
      group.addEventListener('pointerenter', () => focus('node', key, true)); group.addEventListener('pointerleave', leave);
      group.addEventListener('focus', () => focus('node', key, true)); group.addEventListener('blur', leave);
      group.addEventListener('click', () => focus('node', key, false));
      group.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focus('node', key, false); } });
      nodeRefs.set(key, { group, box, value, bar, amount, dot });
    }
    const coefficient = svg('g', { class: 'fb-edge-coefficient', 'pointer-events': 'none' }, root);
    const badge = svg('rect', { rx: '3', fill: '#fff' }, coefficient), coefficientText = svg('text', { 'text-anchor': 'middle', class: 'fb-coefficient-text' }, coefficient);
    graph.append(replay);
    scene = { root, layout, edgeRefs, nodeRefs, coefficient, badge, coefficientText, packetRefs };
  }
  function update(force = false) {
    if (!state.ready || !scene) return;
    const data = current();
    if (!data.after.ok || !data.before.ok) { status.textContent = data.after.diagnostics?.message || data.before.diagnostics?.message || 'Selected model state is unavailable.'; return; }
    if (!force && lastTime === data.t) return;
    lastTime = data.t;
    clock.textContent = `t = ${format(data.t, 1)} / ${baseOptions.horizon}`;
    const active = target(), activeEdge = active.kind === 'edge' ? data.after.edges[active.id] : null;
    const neighbors = new Set(active.kind === 'node' ? [active.id] : [activeEdge?.from,activeEdge?.to]);
    if (active.kind === 'node') Object.values(data.after.edges).forEach(e => { if (e.from === active.id) neighbors.add(e.to); if (e.to === active.id) neighbors.add(e.from); });
    const maxima = {}; Object.values(data.after.edges).forEach(e => { if (finite(e.value)) maxima[e.measure] = Math.max(maxima[e.measure] || 0, Math.abs(e.value)); });
    let largest = 10;
    const changes = {};
    scene.nodeRefs.forEach((ref, key) => { changes[key] = valueChange(data.before.nodes[key].value, data.after.nodes[key].value); if (!changes[key].absolute) largest = Math.max(largest, Math.abs(changes[key].value)); });
    const barScale = Math.ceil(largest/10)*10;
    scene.edgeRefs.forEach(({path,hit}, key) => {
      const e = data.after.edges[key], connected = active.kind === 'edge' ? key === active.id : e.from === active.id || e.to === active.id;
      const width = state.view === 'strength' && finite(e.value) ? 1 + 3*Math.abs(e.value)/(maxima[e.measure] || 1) : 1.25;
      path.style.strokeWidth = `${connected ? Math.max(2, width) : width}px`;
      path.style.stroke = connected ? '#667481' : '#b3b8be';
      path.style.opacity = connected ? '1' : state.hover ? '.26' : e.active ? '.8' : '.45';
      path.style.strokeDasharray = !e.active ? '3 4' : '';
      hit.setAttribute('aria-pressed', String(state.selected.kind === 'edge' && state.selected.id === key));
      hit.setAttribute('aria-label', `${e.title}. ${e.measure}. ${format(e.value)}.`);
    });
    const candidates = [...scene.edgeRefs.keys()].filter(key => data.after.edges[key].active && (active.kind === 'edge' ? key===active.id : data.after.edges[key].from===active.id || data.after.edges[key].to===active.id));
    const moving = candidates.length ? candidates : [...scene.edgeRefs.keys()].filter(key => data.after.edges[key].active).filter((_,i)=>i%3===0);
    scene.packetRefs.forEach((packet,i)=>{
      const key=moving[i];
      packet.style.display=key && state.view!=='strength' && !reduced()?'':'none';
      if(key){const path=scene.edgeRefs.get(key).path,progress=(state.time/baseOptions.horizon*3+i*.29)%1,p=path.getPointAtLength(path.getTotalLength()*progress);packet.setAttribute('x',p.x-4.5);packet.setAttribute('y',p.y-4.5);}
    });
    scene.nodeRefs.forEach((ref,key) => {
      const node = data.after.nodes[key], selected = active.kind === 'node' && active.id === key, connected = neighbors.has(key), change = changes[key];
      ref.group.classList.toggle('is-selected', selected); ref.group.classList.toggle('is-connected', connected); ref.group.classList.toggle('is-inactive', !node.active);
      ref.group.setAttribute('aria-pressed', String(state.selected.kind === 'node' && state.selected.id === key));
      ref.group.setAttribute('aria-label', `${node.title}. ${format(node.value)}. Change ${change.label}.`);
      ref.value.textContent = state.view === 'shock' ? change.label : key === 'e' ? percent(node.value) : format(node.value);
      ref.bar.style.display = state.view === 'shock' ? '' : 'none';
      const scaled = change.absolute ? Math.min(1, Math.abs(change.value)/Math.max(1,Math.abs(node.value))) : Math.abs(change.value)/barScale;
      const length = scaled*scene.layout.nodeWidth*.37;
      ref.amount.setAttribute('x', change.value < 0 ? -length : 0); ref.amount.setAttribute('width', length); ref.amount.setAttribute('fill', change.value < 0 ? RED : BLUE);
      ref.dot.style.display = length < .5 ? '' : 'none';
    });
    scene.coefficient.style.display = activeEdge && scene.edgeRefs.has(active.id) ? '' : 'none';
    if (activeEdge && scene.edgeRefs.has(active.id)) {
      const path = scene.edgeRefs.get(active.id).path, center = path.getPointAtLength(path.getTotalLength()/2), label = finite(activeEdge.value) ? signed(activeEdge.value, 3) : 'Undefined';
      scene.coefficientText.textContent = label; scene.coefficientText.setAttribute('x', center.x); scene.coefficientText.setAttribute('y', center.y-4);
      const width = Math.max(42,label.length*7+12); scene.badge.setAttribute('x', center.x-width/2); scene.badge.setAttribute('y', center.y-19); scene.badge.setAttribute('width', width); scene.badge.setAttribute('height', 19);
    }
    scale.textContent = state.view === 'shock' ? `Node bars use a ±${format(barScale,0)}% scale. Zero references show an absolute change.` : state.view === 'strength' ? 'Line width compares coefficients within each measurement type.' : PARTS[state.part].description;
    status.textContent = `${regime(data.b.regime)} baseline · ${regime(data.a.regime)} after change`;
    updatePlotCursor(); updateInspector();
  }
  let plotState;
  function drawPlot() {
    if (!state.ready) return;
    const width = Math.max(280, plot.clientWidth), height = full ? 148 : 166, margin = { left: 53, right: 16, top: 25, bottom: 37 }, metric = METRICS[state.metric];
    const values = [...baseline.points,...after.points].map(p => p[state.metric]);
    const low = Math.min(...values), high = Math.max(...values), pad = Math.max((high-low)*.16, high*.025, .001), min = Math.max(0,low-pad), max = high+pad;
    const X = t => margin.left+t/baseOptions.horizon*(width-margin.left-margin.right), Y = y => height-margin.bottom-(y-min)/(max-min)*(height-margin.top-margin.bottom);
    plot.replaceChildren();
    const root = svg('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': `${metric.label} along baseline and changed economy`, height }, plot);
    svg('title', {}, root, `${metric.label}. Both paths are solved over ${baseOptions.horizon} model time units.`);
    for (let i = 0; i < 3; i++) {
      const value = min+(max-min)*i/2, y = Y(value);
      svg('line', { x1: margin.left, x2: width-margin.right, y1: y, y2: y, class: 'fb-gridline' }, root);
      svg('text', { x: margin.left-8, y: y+4, 'text-anchor': 'end', class: 'fb-axis-label' }, root, metric.format(value,2));
    }
    for (const time of [0,baseOptions.horizon/2,baseOptions.horizon]) svg('text', { x: X(time), y: height-20, 'text-anchor': 'middle', class: 'fb-axis-label' }, root, format(time,0));
    svg('text', { x: margin.left, y: 13, class: 'fb-plot-label' }, root, width<450?({E:'Expert share',w:'Hourly wage',Delta:'Career value',A:'Frontier A'})[state.metric]:metric.label);
    svg('text', { x: width-margin.right, y: height-3, 'text-anchor': 'end', class: 'fb-axis-unit' }, root, 'Model time');
    const band = svg('g', { class: 'fb-change-band' }, root);
    function region(t0,t1,b0,b1,a0,a1) {
      const diff = a0+a1-b0-b1;
      svg('path', { d: `M${X(t0)} ${Y(b0)} L${X(t1)} ${Y(b1)} L${X(t1)} ${Y(a1)} L${X(t0)} ${Y(a0)} Z`, fill: diff>=0?BLUE:RED, opacity: '.11' }, band);
    }
    for (let i=0;i<baseline.points.length-1;i++) {
      const b0=baseline.points[i],b1=baseline.points[i+1],a0=after.points[i],a1=after.points[i+1],key=state.metric,d0=a0[key]-b0[key],d1=a1[key]-b1[key];
      if (d0*d1<0) {
        const f=d0/(d0-d1),t=b0.t+(b1.t-b0.t)*f,cross=b0[key]+(b1[key]-b0[key])*f;
        region(b0.t,t,b0[key],cross,a0[key],cross); region(t,b1.t,cross,b1[key],cross,a1[key]);
      } else region(b0.t,b1.t,b0[key],b1[key],a0[key],a1[key]);
    }
    for (const [result,color,dash] of [[baseline,GRAY,'5 4'],[after,BLUE,'']]) {
      const path = result.points.map((p,i)=>`${i?'L':'M'}${X(p.t).toFixed(2)} ${Y(p[state.metric]).toFixed(2)}`).join(' ');
      svg('path', { d:path, fill:'none', stroke:color, 'stroke-width':'1.8', 'stroke-dasharray':dash, class:'fb-path' }, root);
    }
    const cursor = svg('line', { x1:X(state.time),x2:X(state.time),y1:margin.top,y2:height-margin.bottom,class:'fb-time-cursor' }, root);
    const beforeDot=svg('circle',{r:'3.1',fill:GRAY,stroke:'#fff','stroke-width':'1'},root),afterDot=svg('circle',{r:'3.6',fill:BLUE,stroke:'#fff','stroke-width':'1'},root);
    const readout=svg('text',{x:width-margin.right,y:13,'text-anchor':'end',class:'fb-plot-readout'},root);
    const surface=svg('rect',{x:margin.left,y:margin.top,width:width-margin.left-margin.right,height:height-margin.top-margin.bottom,fill:'transparent',tabindex:'0',role:'button','aria-label':'Inspect the solved path at a time. Arrow keys move through model time.',class:'fb-plot-surface'},root);
    const tooltip=make('div',{class:'fb-plot-tooltip',hidden:''},plot);
    const chooseTime = event => { const r=root.getBoundingClientRect(); return Math.max(0,Math.min(baseOptions.horizon,((event.clientX-r.left)*width/r.width-margin.left)/(width-margin.left-margin.right)*baseOptions.horizon)); };
    surface.addEventListener('pointermove',event=>{
      const time=chooseTime(event),b=frameAt(baseline,time),a=frameAt(after,time),r=root.getBoundingClientRect();
      tooltip.textContent=`t ${format(a.t,1)} · Baseline ${metric.format(b[state.metric])} · After ${metric.format(a[state.metric])}`;tooltip.hidden=false;
      tooltip.style.left=`${Math.max(5,Math.min(width-235,event.clientX-r.left+10))}px`;tooltip.style.top='20px';
    });
    surface.addEventListener('pointerleave',()=>{tooltip.hidden=true;});
    surface.addEventListener('click',event=>{pause();state.time=chooseTime(event);update(true);});
    surface.addEventListener('focus',()=>pause());
    surface.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();state.time=Math.max(0,Math.min(baseOptions.horizon,state.time+(event.key==='ArrowLeft'?-.25:.25)));update(true);}});
    plotState={root,cursor,beforeDot,afterDot,readout,X,Y};updatePlotCursor();
  }
  function updatePlotCursor() {
    if(!plotState||!state.ready)return;
    const data=current(),key=state.metric,metric=METRICS[key],{cursor,beforeDot,afterDot,readout,X,Y}=plotState;
    cursor.setAttribute('x1',X(data.t));cursor.setAttribute('x2',X(data.t));
    beforeDot.setAttribute('cx',X(data.t));beforeDot.setAttribute('cy',Y(data.b[key]));afterDot.setAttribute('cx',X(data.t));afterDot.setAttribute('cy',Y(data.a[key]));
    readout.textContent=full?`After ${metric.format(data.a[key])} · ${valueChange(data.b[key],data.a[key]).label}`:valueChange(data.b[key],data.a[key]).label;
  }
  function comparison(before,changed,unit) {
    const max=Math.max(Math.abs(before||0),Math.abs(changed||0),1e-10);
    return `<div class="fb-comparison" aria-label="Baseline and changed values"><div><span>Baseline</span><strong>${escape(format(before))}</strong><i style="width:${finite(before)?Math.abs(before)/max*100:0}%;background:${GRAY}"></i></div><div><span>After change</span><strong>${escape(format(changed))}</strong><i style="width:${finite(changed)?Math.abs(changed)/max*100:0}%;background:${BLUE}"></i></div></div><p class="fb-inspector-unit">${escape(unit)}</p>`;
  }
  function updateInspector() {
    if(!state.ready||!latest)return;
    const data=current(),item=target();
    if(item.kind==='node') {
      const node=data.after.nodes[item.id],before=data.before.nodes[item.id],change=valueChange(before.value,node.value),unit=NODE_UNITS[item.id];
      inspectorContent.innerHTML=`<p class="fb-inspector-kicker">${escape(PARTS[state.part].title)} · t ${format(data.t,1)}</p><h3>${escape(node.title)}</h3><p class="fb-inspector-change" style="color:${change.value<0?RED:BLUE}">${escape(change.label)}</p>${comparison(before.value,node.value,unit)}<p class="fb-inspector-explanation">${escape(NODE_COPY[item.id])}</p>${node.subtitle?`<p class="fb-inspector-basis">${escape(node.subtitle)}</p>`:''}`;
      if(['cp','pf'].includes(item.id)) {
        const credit=data.after.credit;
        make('p',{class:'fb-inspector-basis'},inspectorContent,`Full learning value ${format(credit.fullCredit)}. Cash-floor cap ${format(credit.cap)}. Complete pricing applies to this solved path.`);
      }
    } else {
      const edge=data.after.edges[item.id],before=data.before.edges[item.id];
      if(!edge)return;
      const sentence=edge.conditioning.split(/(?<=\.)\s/)[0];
      inspectorContent.innerHTML=`<p class="fb-inspector-kicker">${escape(edge.measure)} · ${escape(regime(edge.regime))}</p><h3>${escape(edge.title)}</h3><p class="fb-inspector-coefficient" style="color:${edge.value<0?RED:BLUE}">${finite(edge.value)?escape(signed(edge.value,4)):escape(edge.status==='undefined'?'Undefined at this state':edge.status)}</p><p class="fb-inspector-formula">${escape(edge.formula)}</p><p class="fb-inspector-explanation">${escape(sentence)}</p><dl class="fb-secondary">${edge.secondary.filter(v=>finite(v.value)).slice(0,2).map(v=>`<div><dt>${escape(v.label)}</dt><dd>${escape(format(v.value))}${v.unit?` <small>${escape(v.unit)}</small>`:''}</dd></div>`).join('')}</dl><details class="fb-definition"><summary>Definition and conditions</summary><p>${escape(edge.conditioning)}</p><p>${escape(edge.basis)}</p><p>${escape(edge.source)}</p>${before?.measure===edge.measure?`<p>Baseline coefficient ${escape(format(before.value))}. After-change coefficient ${escape(format(edge.value))}.</p>`:''}</details>`;
    }
  }
}

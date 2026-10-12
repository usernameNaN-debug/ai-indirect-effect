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
  full: { title: 'The economy', nodes: FEEDBACK_NODES.map(n => n.id), description: 'Customer work connects careers, research, and the returning frontier.' },
  customers: { title: 'Customer work', nodes: ['c', 'prep', 'm', 'disc', 'ds', 'cp', 'pf'], description: 'Customer preparation changes diagnostic practice, while discovery changes the services purchased.' },
  careers: { title: 'Careers', nodes: ['m', 'e', 'w', 'd', 'x'], description: 'Practice and privately financed study replenish expertise as wages and career values adjust.' },
  research: { title: 'Research', nodes: ['e', 'w', 'lr', 'a', 'diff'], description: 'Experts share a labor market with research, while idea difficulty changes the progress completed packets produce.' },
  machines: { title: 'Machines', nodes: ['a', 'my', 'wp', 'w', 'd', 'x'], description: 'Complete machine methods change research costs, parity wages, and the value of qualification.' },
};
// Literal geometry from the supplied original HTML, lines 2609–2662.
const ORIGINAL_NODES = {
  c:[105,88,'Customer AI','capability c'], prep:[265,88,'Preparation','work moves home'], disc:[425,88,'Discovery','new cases found'],
  cp:[105,168,'Credit price','learning fee'], m:[265,168,'Practice M','learning cases'], ds:[425,168,'Expert demand','hours bought'],
  pf:[105,294,'Pay floor s','caps credit'], e:[265,294,'Experts E','headcount'], w:[425,294,'Wage w','clears market'], wp:[585,294,'Parity wage','machine = human'],
  x:[265,382,'Study x','formal training'], d:[425,382,'Value Δ','qualification'], diff:[105,518,'Difficulty','harder ideas'],
  a:[265,518,'Frontier A','AI capability'], lr:[425,518,'Research time','budget-limited'], my:[265,598,'Machine output','per dollar'],
};
const ORIGINAL_PATHS = {
  p1:'M172 80 L198 80', p2:'M105 62 L105 46 L425 46 L425 60', p3:'M425 116 L425 140', p4:'M265 116 L265 140',
  p5:'M172 168 L185 168 L185 104 L198 104', p6:'M105 266 L105 196',
  // p7 alone corrects the source's exogenous-pay-floor endpoint to credit.
  p7:'M390 408 L390 424 L185 424 L185 220 L105 220 L105 196',
  p8:'M425 196 L425 266', p9:'M265 196 L265 266', p10:'M332 294 L358 294', p11:'M425 322 L425 354',
  p12:'M358 382 L332 382', p13:'M265 354 L265 322', p14:'M518 280 L492 280', p15:'M492 308 L505 308 L505 518 L492 518',
  p16:'M358 518 L332 518', p17:'M265 492 L265 478 L24 478 L24 88 L38 88', p18:'M198 506 L172 506',
  p19:'M172 530 L198 530', p20:'M240 546 L240 570', p21:'M290 570 L290 546', p22:'M332 598 L585 598 L585 322',
};
const LOOPS = {
  all:{title:'All loops',edges:Object.keys(ORIGINAL_PATHS),description:'Customer choices, private careers, and research allocation form the complete economy.'},
  B1:{title:'Career investment',edges:['p10','p11','p12','p13'],description:'Scarcer expertise changes wages and the private value that finances formal study.'},
  B2:{title:'Learning-credit pricing',edges:['p4','p5','p6','p7','p9','p10','p11'],description:'Qualification value prices the learning in a customer file, with the pay floor changing the separate local credit rule.'},
  B3:{title:'Customer progress and research hours',edges:['p1','p2','p3','p4','p8','p9','p10','p15','p16','p17'],description:'Customer work changes expertise and research wages, while frontier progress returns to the customer interface.'},
  B4:{title:'Idea difficulty',edges:['p18','p19'],description:'Each frontier advance raises the packet requirement for a further absolute increment.'},
  R1:{title:'Recursive improvement',edges:['p20','p21'],description:'Current AI lowers the machine resources needed to generate and validate research. Completed research advances the AI used in the next cycle.'},
  S:{title:'Automation and career incentives',edges:['p11','p12','p13','p14','p20','p22'],description:'Relative complete-method productivity changes parity wages and the value of becoming qualified.'},
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
  a: 'Completed, validated research packets advance the frontier, updating the AI available to both customers and the next research cycle.',
  lr: 'Research procurement assigns expert time to human work or grounding as the available methods compete.',
  my: 'Machine output per dollar accounts for the resources used in both generation and validation.',
};
const NODE_UNITS = { c: 'capability index', prep: 'diagnostic-displacement index', disc: 'net demand index', cp: 'numeraire / local case', m: 'transitions / model time', ds: 'hours / model time', pf: 'numeraire / local case', e: 'population share', w: 'numeraire / hour', wp: 'numeraire / hour', x: 'per model time', d: 'numeraire', diff: 'difficulty index', a: 'productivity index', lr: 'hours / model time', my: 'packets / research dollar' };
const ELASTICITY_LABELS={p3:'Demand → hours',p8:'Services → wage',p10:'Experts → wage',p12:'Value → study',p15:'Wage → research',p16:'Research → frontier',p18:'Frontier → difficulty',p19:'Difficulty → frontier',p20:'Frontier → machines',p21:'Machines → frontier',p22:'Frontier → parity'};
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
function effectOf(edge) {
  if(edge.id==='p5')return edge.secondary.find(v=>v.label.includes('dG/dℓ'))?.value??-1;
  if(edge.id==='p13')return edge.secondary.find(v=>v.label.includes('∂Ė/∂x'))?.value??null;
  return edge.value;
}
function frameAt(result, t) { return result.points.reduce((best, p) => Math.abs(p.t - t) < Math.abs(best.t - t) ? p : best, result.points[0]); }
// Same reveal, fade and arrival-arrow behavior as Filing a return's flowSignal.
function economyFlowSignal(path,color=BLUE,weight=1) {
  const d=path.getAttribute('d'),width=Math.max(1.5,+path.getAttribute('stroke-width'))+weight;
  const group=svg('g',{class:'fb-flow-signal','pointer-events':'none','aria-hidden':'true'});
  path.after(group);
  svg('path',{d,fill:'none',stroke:color,'stroke-width':width+5,opacity:.08,'stroke-linecap':'round','stroke-linejoin':'round'},group);
  const reveal=svg('path',{d,fill:'none',stroke:color,'stroke-width':width,pathLength:100,'stroke-dasharray':'100 100','stroke-linecap':'round','stroke-linejoin':'round'},group);
  const length=path.getTotalLength(),end=path.getPointAtLength(length),before=path.getPointAtLength(Math.max(0,length-2)),angle=Math.atan2(end.y-before.y,end.x-before.x)*180/Math.PI;
  const arrow=svg('path',{d:'M-6 -3.5L0 0L-6 3.5',fill:'none',stroke:color,'stroke-width':1.8,'stroke-linecap':'round','stroke-linejoin':'round',transform:`translate(${end.x} ${end.y}) rotate(${angle})`},group);
  return progress=>{
    const visible=progress>=0&&progress<=1,p=Math.max(0,Math.min(1,progress)),travel=Math.max(0,Math.min(1,p/.78)),smooth=travel*travel*(3-2*travel);
    const opacity=visible?Math.min(1,p/.10,(1-p)/.22):0;
    group.setAttribute('opacity',Math.max(0,opacity));
    reveal.setAttribute('stroke-dashoffset',100*(1-smooth));
    arrow.setAttribute('opacity',Math.max(0,Math.min(1,(travel-.83)/.17)));
  };
}

export function mountFeedback(host) {
  if (host.dataset.feedbackMounted) return;
  host.dataset.feedbackMounted = 'true'; host.classList.add('interactive', 'feedback-interactive');
  const full = host.dataset.fullscreen === 'true' || host.dataset.widget === 'feedback';
  host.classList.toggle('fb-fullscreen', full); host.classList.toggle('fb-embedded', !full);
  host.replaceChildren();
  const heading=full?make('h1',{class:'fb-economy-title'},host,'Explore the economy'):null;
  const state = { view: 'connections', part: full ? 'full' : 'customers', loop:'all', shock: 'practice', strength: 100, metric: 'E', time: 0, selected: full?null:{kind:'node',id:'c'}, hover: null, playing: false, ready: false, visible: false, autoplay: true, resumeHover:false, resumeVisible:false };
  const baseOptions = { ...DEFAULTS, ...PRESETS.mixed.options, steps: 240, E0: .55, A0: 1, terminalDelta: 0 };
  let baseline, after, afterOptions, revision = 0, frame = 0, previous = 0, lastTime = -1, scene, latest, elasticityScene;
  const toolbar = make('div', { class: 'fb-toolbar' }, host);
  const views = tabGroup(toolbar, 'Economy view', [['connections', 'Loops'], ['strength', 'Elasticities'], ['shock', 'Shock']], state.view, key => { state.view = key; views.set(key); host.dataset.view = key; update(true); });
  const playback = make('div', { class: 'fb-playback' }, toolbar);
  const play = make('button', { type: 'button', class: 'fb-play', disabled: '', 'aria-label': 'Play the solved paths' }, playback, 'Play');
  const replay = make('button', { type: 'button', class: 'fb-replay', disabled: '' }, playback, 'Replay');
  const clock = make('output', { class: 'fb-clock', 'aria-label': 'Current model time' }, playback, 't = 0 / 12');
  const controls = make('div', { class: 'fb-scenarios' }, host);
  const shocks = tabGroup(controls, 'Economic change', Object.entries(SHOCKS).map(([key, s]) => [key, s.title]), state.shock, key => { state.shock = key; shocks.set(key); state.autoplay = true; compute(); });
  let parts;
  if(full) {
    parts=tabGroup(host,'Economic feedback loop',Object.entries(LOOPS).map(([key,l])=>[key,key==='all'?l.title:`${key} ${l.title}`]),state.loop,key=>{state.loop=key;state.selected=null;state.hover=null;parts.set(key);update(true);});
    parts.group.classList.add('fb-loops');
  } else {
    parts=tabGroup(host,'Economic part',Object.entries(PARTS).filter(([key])=>key!=='full').map(([key,p])=>[key,p.title]),state.part,key=>{state.part=key;parts.set(key);if(!PARTS[key].nodes.includes(state.selected?.id))state.selected={kind:'node',id:PARTS[key].nodes[0]};state.hover=null;buildGraph();update(true);});
    parts.group.classList.add('fb-parts');
  }
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
  const scale = make('p', { class: 'fb-caption' }, footer);
  if (!full) make('a', { href: new URL('../economy/', location.href).pathname, class: 'fb-full-link' }, footer, 'Explore the economy');
  if(full) {
    const layout=make('div',{class:'fb-economy-layout'},host),left=make('div',{class:'fb-economy-controls'},layout),right=make('div',{class:'fb-economy-figure'},layout);
    left.append(heading,toolbar,controls,parts.group,inspector,below,plot,footer);
    right.append(graph,scale);stage.remove();
  }
  host.dataset.view = state.view;

  function pause(manual=true) { if(manual)state.resumeHover=false;state.playing = false; cancelAnimationFrame(frame); play.textContent = 'Resume'; play.setAttribute('aria-label', 'Resume the solved paths'); }
  function hold() { if(state.playing){state.resumeHover=true;pause(false);} }
  function unhold() {
    const focused=document.activeElement,keyboardFocused=focused?.matches?.(':focus-visible')&&(inspector.contains(focused)||graph.contains(focused));
    const inspecting=inspector.matches(':hover')||plot.matches(':hover')||graph.querySelector('.fb-node:hover,.fb-edge-hit:hover')||keyboardFocused;
    if(state.resumeHover&&state.visible&&!reduced()&&!inspecting){state.resumeHover=false;start();}
  }
  function start(reset = false) {
    if (!state.ready) return;
    if (reset || state.time >= baseOptions.horizon) state.time = 0;
    if(state.hover){state.resumeHover=true;return;}
    state.playing = true; previous = 0; play.textContent = 'Pause'; play.setAttribute('aria-label', 'Pause the solved paths');
    frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    if (!state.playing || !host.isConnected) return;
    if (previous && !document.hidden) state.time = (state.time + (now - previous) / 1000 * baseOptions.horizon / 16) % baseOptions.horizon;
    previous = now; update();renderMotion();
    frame = requestAnimationFrame(tick);
  }
  play.addEventListener('click', () => state.playing ? pause() : start());
  replay.addEventListener('click', () => { pause(); start(true); });
  plot.addEventListener('pointerenter',hold);plot.addEventListener('pointerleave',unhold);
  inspector.addEventListener('pointerenter',hold);inspector.addEventListener('pointerleave',unhold);
  inspector.addEventListener('focusin',hold);inspector.addEventListener('focusout',event=>{if(!inspector.contains(event.relatedTarget))unhold();});
  function autoStart() {
    if (!state.ready || !state.visible || !state.autoplay) return;
    state.autoplay = false;
    if (reduced()) { state.time = baseOptions.horizon; update(true); } else start(true);
  }
  async function compute() {
    const token = ++revision; pause(); state.ready = false; play.disabled = true; replay.disabled = true; state.time = 0; latest = null; lastTime = -1;
    status.hidden=false;status.textContent = 'Computing the paired paths';
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
  const observer = new IntersectionObserver(entries => { state.visible = entries[0].isIntersecting; if (state.visible) { if(state.resumeVisible){state.resumeVisible=false;start();}else autoStart(); } else if(state.playing){state.resumeVisible=true;pause(false);} }, { threshold: .12 });
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
  function target() { return state.hover || state.selected || {kind:'loop',id:state.loop}; }
  function focus(kind, id, transient) { hold(); if (transient) state.hover = { kind, id }; else state.selected = { kind, id }; update(true); }
  function leave() { state.hover = null; update(true);unhold(); }

  function graphLayout() {
    const crops={full:[0,0,680,680],customers:[24,36,482,298],careers:[184,128,322,294],research:[24,254,498,306],machines:[184,252,484,388]};
    const [left,top,width,height]=crops[state.part],positions=Object.fromEntries(PARTS[state.part].nodes.map(id=>[id,ORIGINAL_NODES[id].slice(0,2)]));
    return {left,top,width,height,nodeWidth:130,nodeHeight:52,positions,original:true};
  }
  function pathFor(edge, layout) {
    return ORIGINAL_PATHS[edge.id];
  }
  function buildGraph() {
    if (!state.ready) return;
    const data = current().after, layout = graphLayout(), id = `fb-${++sequence}`;
    graph.replaceChildren(); graph.dataset.part = state.part;
    const root = svg('svg', { viewBox: `${layout.left} ${layout.top} ${layout.width} ${layout.height}`, role: 'group', 'aria-label': state.part === 'full' ? 'The economy with sixteen nodes and twenty-two relationships in the original diagram layout' : `${PARTS[state.part].title} relationships` }, graph);
    svg('title', {}, root, PARTS[state.part].description);
    const defs = svg('defs', {}, root);
    const marker = svg('marker', { id: `${id}-arrow`, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse', markerUnits: 'strokeWidth' }, defs);
    svg('path', { d: 'M2 1L8 5L2 9', fill: 'none', stroke: 'context-stroke', 'stroke-width': '1.5','stroke-linecap':'round','stroke-linejoin':'round' }, marker);
    if (full) {
      [[14,206,'Customers and service market',32],[232,220,'Workforce and careers',250],[464,190,'Research and frontier',644]].forEach(([y,height,label,textY]) => {
        svg('rect',{x:10,y,width:660,height,rx:12,class:'fb-original-band'},root);
        svg('text',{x:660,y:textY,'text-anchor':'end',class:'fb-region-label'},root,label);
      });
    }
    const links = svg('g', { class: 'fb-links' }, root),marks = svg('g', { class: 'fb-marks' }, root);
    const edgeRefs = new Map(), nodeRefs = new Map(),traceRefs=new Map();
    Object.values(data.edges).filter(e => layout.positions[e.from] && layout.positions[e.to]).forEach(edge => {
      const d = pathFor(edge, layout);
      const path = svg('path', { d, class: 'fb-edge', 'marker-end': `url(#${id}-arrow)` }, links);
      traceRefs.set(edge.id,economyFlowSignal(path,effectOf(edge)<0?RED:BLUE));
      const hit = svg('path', { d, class: 'fb-edge-hit', tabindex: '0', role: 'button', 'aria-label': edge.title, 'data-edge': edge.id }, links);
      hit.addEventListener('pointerenter', () => focus('edge', edge.id, true)); hit.addEventListener('pointerleave', leave);
      hit.addEventListener('focus', () => focus('edge', edge.id, true)); hit.addEventListener('blur', leave);
      hit.addEventListener('click', () => focus('edge', edge.id, false));
      hit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focus('edge', edge.id, false); } });
      edgeRefs.set(edge.id, { path, hit });
    });
    for (const [key, [x,y]] of Object.entries(layout.positions)) {
      const node = data.nodes[key], group = svg('g', { class: 'fb-node', transform: `translate(${x},${y})`, tabindex: '0', role: 'button', 'aria-label': node.title, 'data-node': key }, marks);
      const box = svg('rect', { x: -layout.nodeWidth/2, y: -layout.nodeHeight/2, width: layout.nodeWidth, height: layout.nodeHeight, rx: '8', class: 'fb-node-box' }, group);
      svg('text', { x: 0, y: -8, 'text-anchor': 'middle','dominant-baseline':'central',class: 'fb-node-title' }, group, ORIGINAL_NODES[key][2]);
      const value = svg('text', { x: 0, y: 10, 'text-anchor': 'middle','dominant-baseline':'central',class: 'fb-node-value' }, group,ORIGINAL_NODES[key][3]);
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
    if(!full)graph.append(replay);
    scene = { root, layout, edgeRefs, nodeRefs,traceRefs,movingEdges:[] };
  }
  function update(force = false) {
    if (!state.ready || !scene) return;
    const data = current();
    if (!data.after.ok || !data.before.ok) { status.hidden=false;status.textContent = data.after.diagnostics?.message || data.before.diagnostics?.message || 'Selected model state is unavailable.'; return; }
    if (!force && lastTime === data.t) return;
    lastTime = data.t;
    clock.textContent = `t = ${format(data.t, 1)} / ${baseOptions.horizon}`;
    const active = target(), activeEdge = active.kind === 'edge' ? data.after.edges[active.id] : null;
    const loopEdges=new Set(full?LOOPS[state.loop].edges:Object.keys(data.after.edges));
    const neighbors = new Set(active.kind === 'node' ? [active.id] : active.kind==='edge'?[activeEdge?.from,activeEdge?.to]:[...loopEdges].flatMap(key=>[data.after.edges[key].from,data.after.edges[key].to]));
    if (active.kind === 'node') Object.values(data.after.edges).forEach(e => { if (e.from === active.id) neighbors.add(e.to); if (e.to === active.id) neighbors.add(e.from); });
    let largest = 10;
    const changes = {};
    scene.nodeRefs.forEach((ref, key) => { changes[key] = valueChange(data.before.nodes[key].value, data.after.nodes[key].value); if (!changes[key].absolute) largest = Math.max(largest, Math.abs(changes[key].value)); });
    const barScale = Math.ceil(largest/10)*10;
    scene.edgeRefs.forEach(({path,hit}, key) => {
      const e = data.after.edges[key],inLoop=loopEdges.has(key),connected = active.kind === 'loop'?inLoop:active.kind === 'edge' ? key === active.id : e.from === active.id || e.to === active.id;
      const width = 1.1;
      const emphasized=active.kind!=='loop'||state.loop!=='all';
      path.style.strokeWidth = `${connected&&emphasized ? Math.max(1.65, width) : width}px`;
      path.style.stroke = connected ? '#667481' : '#b3b8be';
      path.style.opacity = connected ? e.active?'1':'.48' : inLoop?e.active?'.55':'.25':'.12';
      path.style.strokeDasharray = !e.active?'3 4':effectOf(e)<0?'5 4':'';
      hit.setAttribute('aria-pressed', String(state.selected?.kind === 'edge' && state.selected.id === key));
      hit.setAttribute('aria-label', `${e.title}. ${e.measure}. ${format(e.value)}.`);
    });
    const candidates = [...scene.edgeRefs.keys()].filter(key => data.after.edges[key].active && (active.kind==='loop'?loopEdges.has(key):active.kind === 'edge' ? key===active.id : data.after.edges[key].from===active.id || data.after.edges[key].to===active.id));
    scene.movingEdges=candidates.length>3?[candidates[0],candidates[Math.floor(candidates.length/3)],candidates[Math.floor(2*candidates.length/3)]]:candidates;
    scene.nodeRefs.forEach((ref,key) => {
      const node = data.after.nodes[key], selected = active.kind === 'node' && active.id === key, connected = neighbors.has(key), change = changes[key];
      ref.group.classList.toggle('is-selected', selected); ref.group.classList.toggle('is-connected', connected); ref.group.classList.toggle('is-inactive', !node.active);
      ref.group.classList.toggle('is-hovered',state.hover?.kind==='node'&&state.hover.id===key);
      ref.group.style.opacity=connected?'1':'.42';
      ref.group.setAttribute('aria-pressed', String(state.selected?.kind === 'node' && state.selected.id === key));
      ref.group.setAttribute('aria-label', `${node.title}. ${format(node.value)}. Change ${change.label}.`);
      ref.value.textContent=ORIGINAL_NODES[key][3];
      ref.bar.style.display = state.view === 'shock' ? '' : 'none';
      const scaled = change.absolute ? Math.min(1, Math.abs(change.value)/Math.max(1,Math.abs(node.value))) : Math.abs(change.value)/barScale;
      ref.box.style.fill=state.hover?.kind==='node'&&state.hover.id===key?'#f1f3f5':state.view==='shock'?`color-mix(in srgb, ${change.value<0?RED:BLUE} ${Math.min(13,scaled*13)}%, white)`:'#fff';
      const length = scaled*scene.layout.nodeWidth*.37;
      ref.amount.setAttribute('x', change.value < 0 ? -length : 0); ref.amount.setAttribute('width', length); ref.amount.setAttribute('fill', change.value < 0 ? RED : BLUE);
      ref.dot.style.display = length < .5 ? '' : 'none';
    });
    const caption=state.view==='shock'?'Customer preparation, newly discovered services, and cheaper research change the demand for expertise and the incentive to train. Paired paths follow those effects into wages, qualification, and frontier progress.':state.view==='strength'?'Elasticities identify where expertise, wages, and research output respond most strongly to a proportional change. Equal-cost substitution and autonomous research can remove a channel through human research even while careers continue to adjust.':'Customer work changes the practice and demand reaching a profession. Wages carry those changes into private training and research, whose progress returns through the customer interface.';
    if(scale.textContent!==caption)scale.textContent=caption;
    status.hidden=true;status.textContent='';
    updatePlotCursor(); updateInspector();renderMotion();
  }
  function renderMotion() {
    if(!scene||!latest)return;
    scene.traceRefs.forEach((signal,key)=>{
      const index=scene.movingEdges.indexOf(key),show=index>=0&&state.view!=='strength'&&!reduced();
      signal(show?(state.time/2.4+index*.32)%1:-1);
    });
  }
  let plotState;
  function drawPlot() {
    if (!state.ready) return;
    const width = Math.max(280, plot.clientWidth), height = full ? 132 : 166, margin = { left: 53, right: 16, top: 25, bottom: 37 }, metric = METRICS[state.metric];
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
    const readout=svg('text',{x:width-margin.right,y:13,'text-anchor':'end',class:'fb-plot-readout',display:width<450?'none':''},root);
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
    surface.addEventListener('focus',hold);surface.addEventListener('blur',unhold);
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
  function coefficientUnit(edge) {
    if(edge.measure==='elasticity')return '% output per 1% input';
    return {p1:'displacement index per capability unit',p2:'log demand per capability unit',p4:'practice flow per displacement unit',p5:'numeraire per case',p6:'credit per cash-floor unit',p7:'credit per career-value unit',p9:'expert share per practice-flow unit',p11:'model time',p13:'share of qualification entries',p14:'wage per parity-wage unit',p17:'capability per log frontier',p22:'wage per log frontier'}[edge.id]||edge.measure;
  }
  function edgeDetail(edge) {
    const sentence=edge.conditioning.split('. ')[0].replace(/[.]+$/,'')+'.',value=finite(edge.value)?signed(edge.value,3):'Undefined';
    return `<h3>${escape(ELASTICITY_LABELS[edge.id]||edge.title)}</h3><div class="fb-coefficient-strip"><strong style="color:${edge.value<0?RED:BLUE}">${escape(value)}</strong><span>${escape(coefficientUnit(edge))}</span></div><p class="fb-inspector-formula">${escape(edge.formula)}</p><p class="fb-inspector-explanation">${escape(sentence)}</p><details class="fb-definition"><summary>Definition</summary><p>${escape(edge.conditioning)}</p><p>${escape(edge.basis)}</p><p>${escape(edge.source)}</p></details>`;
  }
  function updateElasticities(data,item) {
    const included=Object.values(data.after.edges).filter(e=>scene.edgeRefs.has(e.id)&&e.measure==='elasticity'&&(!full||state.loop==='all'||LOOPS[state.loop].edges.includes(e.id)));
    const measured=included.filter(e=>finite(e.value)),undefinedEdges=included.filter(e=>!finite(e.value)),width=Math.max(280,inspectorContent.clientWidth-7);
    const signature=`${state.part}/${state.loop}/${Math.round(width)}/${measured.map(e=>e.id).join(',')}`;
    if(inspectorContent.dataset.mode!=='elasticities'||elasticityScene?.signature!==signature) {
      inspectorContent.replaceChildren();inspectorContent.dataset.mode='elasticities';
      make('h4',{class:'fb-el-heading'},inspectorContent,'Output response · % per 1% input change');
      const area=make('div',{class:'fb-el-chart'},inspectorContent),height=42+measured.length*32;
      const root=svg('svg',{viewBox:`0 0 ${width} ${height}`,role:'group','aria-label':'Signed dimensionless elasticities at the selected economy state'},area);
      const left=148,right=width-50,zero=(left+right)/2,rows=new Map();
      const axis=svg('line',{x1:zero,x2:zero,y1:25,y2:height-14,class:'fb-el-zero'},root);
      const ticks=[-1,0,1].map(sign=>svg('text',{x:sign<0?left:sign>0?right:zero,y:15,'text-anchor':'middle',class:'fb-el-axis'},root));
      measured.forEach((edge,i)=>{
        const y=38+i*32,g=svg('g',{class:'fb-el-row',tabindex:'0',role:'button','data-edge-row':edge.id},root);
        const backdrop=svg('rect',{x:0,y:y-14,width,height:31,rx:3,class:'fb-el-backdrop'},g);
        const label=svg('text',{x:0,y:y+4,class:'fb-el-label'},g,ELASTICITY_LABELS[edge.id]||`${data.after.nodes[edge.from].symbol} → ${data.after.nodes[edge.to].symbol}`);
        const stem=svg('line',{x1:zero,x2:zero,y1:y,y2:y,class:'fb-el-stem'},g),dot=svg('circle',{cx:zero,cy:y,r:3.5,class:'fb-el-dot'},g);
        const value=svg('text',{x:width-1,y:y+4,'text-anchor':'end',class:'fb-el-value'},g);
        g.addEventListener('pointerenter',()=>focus('edge',edge.id,true));g.addEventListener('pointerleave',leave);
        g.addEventListener('focus',()=>focus('edge',edge.id,true));g.addEventListener('blur',leave);
        g.addEventListener('click',()=>focus('edge',edge.id,false));g.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();focus('edge',edge.id,false);}});
        rows.set(edge.id,{g,backdrop,label,stem,dot,value});
      });
      const unavailable=make('p',{class:'fb-el-unavailable'},inspectorContent),detail=make('div',{class:'fb-el-detail'},inspectorContent);
      elasticityScene={signature,root,axis,ticks,rows,left,right,zero,unavailable,detail};
    }
    const range=Math.max(.5,Math.ceil(Math.max(0,...measured.map(e=>Math.abs(e.value)))*2)/2),{left,right,zero,ticks,rows,unavailable,detail}=elasticityScene;
    ticks.forEach((tick,i)=>{tick.textContent=i===0?`−${format(range)}`:i===2?`+${format(range)}`:'0';});
    measured.forEach(edge=>{
      const ref=rows.get(edge.id),x=zero+edge.value/range*(right-left)/2,selected=item.kind==='edge'?item.id===edge.id:item.kind==='node'?(edge.from===item.id||edge.to===item.id):false,color=edge.active?(edge.value<0?RED:edge.value>0?BLUE:GRAY):'#aaa';
      ref.g.classList.toggle('is-selected',selected);ref.g.classList.toggle('is-inactive',!edge.active);
      ref.g.setAttribute('aria-label',`${ELASTICITY_LABELS[edge.id]}. ${format(edge.value)} percent output per one percent input.${edge.active?'':' Inactive research route.'}`);
      ref.g.setAttribute('aria-pressed',String(state.selected?.kind==='edge'&&state.selected.id===edge.id));
      ref.stem.setAttribute('x2',x);ref.stem.style.stroke=color;ref.dot.setAttribute('cx',x);ref.dot.style.fill=edge.active?color:'#fff';ref.dot.style.stroke=color;
      ref.value.textContent=signed(edge.value,2);ref.value.style.fill=color;
    });
    unavailable.textContent=undefinedEdges.map(e=>`${ELASTICITY_LABELS[e.id]} is undefined at this state.`).join(' ');unavailable.hidden=!undefinedEdges.length;
    if(item.kind==='edge') detail.innerHTML=edgeDetail(data.after.edges[item.id]);
    else if(item.kind==='node') {const node=data.after.nodes[item.id];detail.innerHTML=`<h3>${escape(node.title)}</h3><p class="fb-coefficient-strip"><strong>${escape(format(node.value))}</strong><span>${escape(NODE_UNITS[item.id])}</span></p>`;}
    else detail.replaceChildren();
  }
  function updateInspector() {
    if(!state.ready||!latest)return;
    const data=current(),item=target();
    if(state.view==='strength'){updateElasticities(data,item);return;}
    inspectorContent.dataset.mode='detail';
    if(item.kind==='loop') {
      const loop=LOOPS[state.loop],metric=METRICS[state.metric];
      inspectorContent.innerHTML=`<h3>${escape(state.loop==='all'?metric.title:loop.title)}</h3>${comparison(data.b[state.metric],data.a[state.metric],metric.unit)}${state.loop==='all'?'':`<p class="fb-inspector-explanation">${escape(loop.description)}</p>`}`;
      return;
    }
    if(item.kind==='node') {
      const node=data.after.nodes[item.id],before=data.before.nodes[item.id],change=valueChange(before.value,node.value),unit=NODE_UNITS[item.id];
      inspectorContent.innerHTML=`<h3>${escape(node.title)}</h3><p class="fb-inspector-change" style="color:${change.value<0?RED:BLUE}">${escape(change.label)}</p>${comparison(before.value,node.value,unit)}<p class="fb-inspector-explanation">${escape(NODE_COPY[item.id])}</p>`;
      if(['cp','pf'].includes(item.id)) {
        const credit=data.after.credit;
        make('p',{class:'fb-inspector-basis'},inspectorContent,`Full learning value ${format(credit.fullCredit)}. Cash-floor cap ${format(credit.cap)}. Complete pricing applies to this solved path.`);
      }
    } else {
      const edge=data.after.edges[item.id];
      if(edge)inspectorContent.innerHTML=edgeDetail(edge);
    }
  }
}

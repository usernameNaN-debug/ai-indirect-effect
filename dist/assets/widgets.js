import { DEFAULTS, PRESETS, solveMarket, solveBoundaryPath, learningRisk, localWelfare, growthPaths } from './model.js';
import { mountFeedback } from './feedback-ui.js?v=20261013c';

const NS = 'http://www.w3.org/2000/svg';
const C = { teal: '#0F4D92', rust: '#B64342', blue: '#3775BA', ink: 'var(--ink, #242424)', muted: '#767676', line: 'var(--line, #dedede)', paper: '#ffffff', mixed: '#E4CCD8', humanFill: '#B4C0E4', machineFill: '#F0C0CC', quiet: '#f4f4f4' };
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const finite = x => typeof x === 'number' && Number.isFinite(x);
const fmt = (x, digits = 2) => !finite(x) ? '—' : Math.abs(x) >= 10000 || (Math.abs(x) > 0 && Math.abs(x) < 0.001) ? x.toExponential(1) : Number(x.toFixed(digits)).toLocaleString('en-US', { maximumFractionDigits: digits });
const pct = x => `${fmt(x * 100, 1)}%`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let uid = 0;
function el(tag, attrs = {}, parent, text) { const n = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') n.className = v; else n.setAttribute(k, v); } if (text !== undefined) n.textContent = text; if (parent) parent.append(n); return n; }
function se(tag, attrs = {}, parent, text) { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (text !== undefined) n.textContent = text; if (parent) parent.append(n); return n; }
function tx(svg, x, y, text, attrs = {}) { return se('text', { x, y, ...attrs, ...(attrs.fill?{style:`${attrs.style||''};fill:${attrs.fill}`}:{}) }, svg, text); }
function svgBase(host, height, label) { const width = Math.max(270, Math.round(host.getBoundingClientRect().width || 640)); host.replaceChildren(); const svg = se('svg', { viewBox: `0 0 ${width} ${height}`, width, height, role: 'img', 'aria-label': label }, host); se('title', {}, svg, label); return { svg, width, height }; }
function watch(host, draw) { let width = 0; const observer = new ResizeObserver(entries => { const next = Math.round(entries[0].contentRect.width); if (next > 0 && next !== width) { width = next; draw(); } }); observer.observe(host); draw(); return observer; }
function title(host, heading) { const row = el('div', { class: 'figure-heading' }, host); el('h3', {}, row, heading); }
function caption(host, html) { const p = el('p', { class: 'figure-caption' }, host); p.innerHTML = html; return p; }
function tabs(host, options, value, fn) { const wrap = el('div', { class: 'widget-tabs', role: 'group' }, host); const buttons = options.map(o => { const button = el('button', { type: 'button', 'aria-pressed': String(o.value === value) }, wrap, o.label); button.addEventListener('click', () => { buttons.forEach(([b, key]) => b.setAttribute('aria-pressed', String(key === o.value))); fn(o.value); }); return [button, o.value]; }); return { wrap, set(v) { buttons.forEach(([b, key]) => b.setAttribute('aria-pressed', String(key === v))); } }; }
function legend(host, series) { const box = el('div', { class: 'figure-legend' }, host); series.forEach(s => { const item = el('span', {}, box); const line = el('i', { class: s.square ? 'legend-square' : 'legend-line', style: `color:${s.color};${s.dash ? 'border-top-style:dashed' : ''}` }, item); line.setAttribute('aria-hidden', 'true'); item.append(document.createTextNode(s.label)); }); return box; }
function readout(host) { const box = el('div', { class: 'figure-readout' }, host); return values => { const html = values.map(([l, v]) => `<span>${esc(l)}<strong>${esc(v)}</strong></span>`).join(''); if (box.innerHTML !== html) box.innerHTML = html; }; }
function detail(host) { const box = el('div', { class: 'figure-detail', 'aria-live': 'polite' }, host); return (head, formula, body) => { box.innerHTML = `<h4>${esc(head)}</h4>${formula ? `<p class="formula">${esc(formula)}</p>` : ''}<p>${esc(body)}</p>`; }; }
function button(host, text, fn) { const b = el('button', { type: 'button' }, host, text); b.addEventListener('click', fn); return b; }
function playback(host, max, onchange, options = {}) {
  const box = el('div', { class: 'figure-playback' }, host), duration = options.duration || 12000;
  let t = reducedMotion() ? max * .65 : 0, wanted = false, frame = 0, previous = 0, lastDraw = 0, inView = false, hovering = false, focused = false, scrubbing = false, completedAt = 0;
  let slider, sliderValue;
  const scrub = options.scrub;
  if (scrub) {
    const wrap = el('label', { class: 'playback-scrub' }, box);
    el('span', {}, wrap, scrub.label);
    sliderValue = el('output', {}, wrap);
    slider = el('input', { type: 'range', min: scrub.min ?? 0, max: scrub.max ?? max, step: scrub.step ?? .01, 'aria-label': scrub.label }, wrap);
    slider.addEventListener('pointerdown', () => { scrubbing = true; sync(); });
    slider.addEventListener('input', () => { const value = +slider.value; scrubbing = true; sync(); set(scrub.toTime ? scrub.toTime(value) : value); });
    slider.addEventListener('change', () => { scrubbing = false; sync(); });
    slider.addEventListener('pointerup', () => { scrubbing = false; sync(); });
    slider.addEventListener('pointercancel', () => { scrubbing = false; sync(); });
    slider.addEventListener('blur', () => { scrubbing = false; sync(); });
  }
  const b = button(box, 'Play', () => wanted ? stop() : play()); b.classList.add('primary-play');
  const restart = button(box, 'Replay', () => { set(0); play(); }); restart.classList.add('restart-play');
  const clock = !scrub && options.clock !== false ? el('output', { class: 'playback-time', 'aria-label': options.label || 'Current model time' }, box) : null;
  function update() {
    if (slider) {
      const value = scrub.fromTime ? scrub.fromTime(t) : t;
      slider.value = value; slider.disabled = b.disabled || !!scrub.disabled?.();
      const display = scrub.format ? scrub.format(value) : fmt(value, 1);
      sliderValue.value = display; slider.setAttribute('aria-valuetext', display);
      slider.style.setProperty('--range-progress', `${clamp((value - +slider.min) / (+slider.max - +slider.min), 0, 1) * 100}%`);
    }
    if (clock) clock.value = options.format ? options.format(t, max) : `Time ${fmt(t, 1)} of ${fmt(max, 0)}`;
    b.textContent = wanted ? 'Pause' : t > 0 ? 'Resume' : 'Play'; b.setAttribute('aria-label', wanted ? 'Pause animation' : 'Play animation');
  }
  function set(v) { t = clamp(v, 0, max); completedAt = 0; update(); onchange(t); }
  function sync() {
    cancelAnimationFrame(frame); previous = 0; completedAt = 0; update();
    if (wanted && inView && !document.hidden && !hovering && !focused && !scrubbing && !b.disabled) frame = requestAnimationFrame(tick);
  }
  function stop() { wanted = false; sync(); }
  function play() { if (b.disabled) return; wanted = true; sync(); }
  function tick(now) {
    if (!document.contains(host)) { observer.disconnect(); document.removeEventListener('visibilitychange', sync); return; }
    if (previous) t = Math.min(max, t + (now - previous) / duration * max);
    previous = now;
    if (t >= max) { if (!completedAt) completedAt = now; if (now - completedAt > 700) { t = 0; completedAt = 0; } }
    if (now - lastDraw > (options.interval || 40)) { update(); onchange(t); lastDraw = now; }
    frame = requestAnimationFrame(tick);
  }
  const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }, { threshold: .12 }); observer.observe(host);
  document.addEventListener('visibilitychange', sync);
  host.querySelectorAll('.plot-area').forEach(plot => {
    plot.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovering = true; sync(); } });
    plot.addEventListener('pointerleave', () => { hovering = false; sync(); });
    plot.addEventListener('focusin', event => { focused = event.target.matches(':focus-visible'); sync(); });
    plot.addEventListener('focusout', event => { if (!plot.contains(event.relatedTarget)) { focused = false; sync(); } });
  });
  update();
  return { setMax(v) { max = v; t = Math.min(t, max); if (slider && scrub.max === undefined) slider.max = max; update(); }, set, refresh: update, value: () => t, stop, play, hold() { scrubbing = true; sync(); }, release() { scrubbing = false; sync(); }, button: b, autoplay() { wanted = !reducedMotion(); sync(); }, box };
}

function markTooltip(host,svg,mark,heading,body){
  const tooltip=el('div',{class:'plot-tooltip',hidden:''},host);mark.setAttribute('tabindex','0');mark.setAttribute('role','img');mark.setAttribute('aria-label',`${heading}. ${body}`);
  const show=event=>{tooltip.innerHTML=`<strong>${esc(heading)}</strong><br>${esc(body)}`;tooltip.hidden=false;const box=host.getBoundingClientRect(),r=mark.getBoundingClientRect(),x=event?.clientX??(r.left+r.width/2),y=event?.clientY??r.top;tooltip.style.left=`${clamp(x-box.left+10,2,Math.max(2,box.width-tooltip.offsetWidth-2))}px`;tooltip.style.top=`${Math.max(0,y-box.top-tooltip.offsetHeight-8)}px`;};
  mark.addEventListener('pointerenter',show);mark.addEventListener('pointermove',show);mark.addEventListener('pointerleave',()=>tooltip.hidden=true);mark.addEventListener('focus',show);mark.addEventListener('blur',()=>tooltip.hidden=true);mark.addEventListener('click',show);
}
function numberTicks(lo, hi, count = 4) { if (!(hi > lo)) return [lo]; const raw = (hi - lo) / count, power = 10 ** Math.floor(Math.log10(raw)), ratio = raw / power; const step = (ratio < 1.5 ? 1 : ratio < 3 ? 2 : ratio < 7 ? 5 : 10) * power; const ticks = []; for (let t = Math.ceil(lo / step) * step; t <= hi + step * .001; t += step) ticks.push(Math.abs(t) < step * .0001 ? 0 : t); return ticks; }
function extent(values, includeZero = false) { const a = values.filter(finite); if (!a.length) return [0, 1]; let lo = Math.min(...a), hi = Math.max(...a); if (includeZero) lo = Math.min(lo, 0); const pad = Math.max((hi - lo) * .12, Math.abs(hi) * .015, .001); return [lo === 0 && includeZero ? 0 : lo - pad, hi + pad]; }
function linePath(points, X, Y, x, y) { let open = false; return points.map(p => { const px = x(p), py = y(p); if (!finite(px) || !finite(py)) { open = false; return ''; } const d = `${open ? 'L' : 'M'}${X(px).toFixed(2)},${Y(py).toFixed(2)}`; open = true; return d; }).join(''); }
function chart(host, config) {
  const height = config.height || 225, { svg, width } = svgBase(host, height, config.label || config.yLabel);
  const margin = { l: 47, r: 15, t: 24, b: 39 }, right = width - margin.r, bottom = height - margin.b;
  const series = config.series || [], xs = series.flatMap(s => s.points.map(s.x || (p => p.t))), ys = series.flatMap(s => s.points.map(s.y));
  const xd = config.xDomain || extent(xs), yd = config.yDomain || extent(ys, !!config.zero);
  const X = x => margin.l + (x - xd[0]) / (xd[1] - xd[0]) * (right - margin.l), Y = y => bottom - (y - yd[0]) / (yd[1] - yd[0]) * (bottom - margin.t);
  numberTicks(yd[0], yd[1], 3).forEach(y => { se('line', { x1: margin.l, x2: right, y1: Y(y), y2: Y(y), class: 'gridline' }, svg); tx(svg, margin.l - 8, Y(y) + 4, (config.yFormat || fmt)(y), { 'text-anchor': 'end' }); });
  numberTicks(xd[0], xd[1], width < 340 ? 3 : 4).forEach(x => { tx(svg, X(x), bottom + 17, (config.xFormat || fmt)(x), { 'text-anchor': 'middle' }); });
  se('line', { x1: margin.l, x2: right, y1: bottom, y2: bottom, class: 'axis' }, svg);
  tx(svg, margin.l, 13, config.yLabel || '', { class: 'svg-label' }); tx(svg, right, height - 3, config.xLabel || 'Time · periods', { 'text-anchor': 'end' });
  const clipId = `plot-clip-${++uid}`, defs = se('defs', {}, svg), clip = se('clipPath', { id: clipId }, defs); se('rect', { x: margin.l, y: margin.t, width: right - margin.l, height: bottom - margin.t }, clip);
  const curves = se('g', { 'clip-path': `url(#${clipId})` }, svg);
  if (config.bands) config.bands.forEach(b => se('rect', { x: X(b.from), y: margin.t, width: Math.max(0, X(b.to) - X(b.from)), height: bottom - margin.t, fill: b.color, opacity: .06 }, curves));
  series.forEach(s => { if (!s.hideLine) se('path', { d: linePath(s.points, X, Y, s.x || (p => p.t), s.y), class: 'series', stroke: s.color || C.teal, 'stroke-dasharray': s.dash ? '5 4' : '', opacity: s.opacity || 1 }, curves); });
  if (finite(config.vertical) && config.vertical >= xd[0] && config.vertical <= xd[1]) se('line', { x1: X(config.vertical), x2: X(config.vertical), y1: margin.t, y2: bottom, class: 'cursor-line' }, curves);
  if (finite(config.cursor)) {
    if (!config.phase) se('line', { x1: X(config.cursor), x2: X(config.cursor), y1: margin.t, y2: bottom, class: 'cursor-line' }, curves);
    series.forEach(s => { const p = nearest(s.points, config.cursor); if (!s.hideLine && p && finite(s.y(p))) se('circle', { cx: X((s.x || (q => q.t))(p)), cy: Y(s.y(p)), r: 3.4, fill: s.color || C.teal, stroke: C.paper, 'stroke-width': 1.5 }, curves); });
  }
  const tooltip = el('div', { class: 'plot-tooltip', hidden: '' }, host), hover = se('g', { class: 'hover-layer' }, svg);
  const surface = se('rect', { x: margin.l, y: margin.t, width: right - margin.l, height: bottom - margin.t, fill: 'transparent', tabindex: '0', role: 'img', 'aria-label': `${config.label || config.yLabel}. Move across the chart to inspect values.` }, svg);
  function show(px, py) { const x = xd[0] + clamp((px - margin.l) / (right - margin.l), 0, 1) * (xd[1] - xd[0]); hover.replaceChildren(); se('line', { x1: X(x), x2: X(x), y1: margin.t, y2: bottom, class: 'cursor-line' }, hover); const rows = series.map(s => { const value = interpolateValue(s.points, x, s.x || (p => p.t), s.y); return `${esc(s.label)} <strong>${esc((s.format || fmt)(value))}</strong>`; }); tooltip.innerHTML = `<strong>${esc(config.xLabel || 'Time · periods')} ${esc(fmt(x))}</strong><br>${rows.join('<br>')}`; tooltip.hidden = false; tooltip.style.left = `${clamp(px + 12, 0, width - Math.min(220, tooltip.offsetWidth) - 4)}px`; tooltip.style.top = `${Math.max(20, Math.min(height - tooltip.offsetHeight - 2, py - 15))}px`; }
  surface.addEventListener('pointermove', event => { const r = svg.getBoundingClientRect(); show((event.clientX - r.left) * width / r.width, event.clientY - r.top); });
  surface.addEventListener('pointerleave', () => { tooltip.hidden = true; hover.replaceChildren(); }); surface.addEventListener('blur', () => { tooltip.hidden = true; hover.replaceChildren(); });
  let keyboardX = (xd[0] + xd[1]) / 2; surface.addEventListener('focus', () => show(X(keyboardX), 40)); surface.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); keyboardX = clamp(keyboardX + (event.key === 'ArrowRight' ? 1 : -1) * (xd[1] - xd[0]) / 20, ...xd); show(X(keyboardX), 40); } });
  return { svg, X, Y, width, height, margin, right, bottom };
}
function nearest(points, t) { return nearestBy(points, t, p => p.t); }
function nearestBy(points, x, fn) { let result, delta = Infinity; for (const p of points) { const d = Math.abs(fn(p) - x); if (finite(d) && d < delta) { delta = d; result = p; } } return result; }
function interpolateValue(points, x, getX, getY) { if (!points.length) return null; for (let i = 1; i < points.length; i++) { const a = points[i - 1], b = points[i], xa = getX(a), xb = getX(b); if (finite(xa) && finite(xb) && x >= Math.min(xa, xb) && x <= Math.max(xa, xb)) { const ya = getY(a), yb = getY(b); if (!finite(ya) || !finite(yb)) return null; return xb === xa ? yb : ya + (yb - ya) * (x - xa) / (xb - xa); } } const p = nearestBy(points, x, getX); return p && finite(getY(p)) ? getY(p) : null; }
function regimeFill(r) { return /mix/i.test(r) ? C.mixed : /machine|auto|ground/i.test(r) ? C.machineFill : C.humanFill; }
function regimeLabel(r) { return /mix/i.test(r) ? 'Mixed methods' : /ground/i.test(r) ? 'Grounded machine' : /machine|auto/i.test(r) ? 'Machine research' : 'Human research'; }
function paramsFor(key) { return { ...DEFAULTS, ...(PRESETS[key]?.options || {}) }; }
let worker, workerId = 0; const pending = new Map();
function solvePath(options) { return new Promise((resolve, reject) => { try { if (!worker && window.Worker) { worker = new Worker(new URL('./model-worker.js', import.meta.url), { type: 'module' }); worker.addEventListener('message', event => { const job = pending.get(event.data.id); if (job) { pending.delete(event.data.id); event.data.error ? job.reject(new Error(event.data.error)) : job.resolve(event.data.result); } }); worker.addEventListener('error', event => { for (const job of pending.values()) job.reject(new Error(event.message)); pending.clear(); worker.terminate(); worker = null; }); } if (worker) { const id = ++workerId; pending.set(id, { resolve, reject }); worker.postMessage({ id, type: 'path', options }); } else setTimeout(() => { try { resolve(solveBoundaryPath(options)); } catch (error) { reject(error); } }, 0); } catch (error) { reject(error); } }); }
function diagnosticText(result) { const d = result.diagnostics || {}; return `${d.converged === false ? 'Unconverged' : 'Converged'} · ${d.iterations ?? '—'} iterations · equation residual ${fmt(d.maxResidual, 6)} · boundary residual ${fmt(d.boundaryResidual, 6)}`; }
function flowBox(svg, x, y, width, height, lines, subtitle = '') {
  const g = se('g', { class: 'flow-block' }, svg);
  se('rect', { x, y, width, height, rx: 10, fill: '#fff', stroke: '#d6d6d6' }, g);
  const first = y + (height - (lines.length - 1) * 16 - (subtitle ? 22 : 0)) / 2 + 4;
  lines.forEach((line, i) => tx(g, x + width / 2, first + i * 16, line, { 'text-anchor': 'middle', class: 'flow-label' }));
  if (subtitle) tx(g, x + width / 2, first + lines.length * 16 + 5, subtitle, { 'text-anchor': 'middle' });
  return g;
}

function emphasizeBlock(block, amount, color = C.blue) {
  const rect = block.querySelector('rect'), strength = clamp(amount, 0, 1);
  rect.style.fill = `color-mix(in srgb, ${color} ${3 + strength * 7}%, white)`;
  rect.style.stroke = `color-mix(in srgb, ${color} ${15 + strength * 55}%, #d6d6d6)`;
}

function flowLink(svg, points, { dash = false, color = '#b8b8b8', width = 1.5 } = {}) {
  let d = `M${points[0].join(',')}`;
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1], b = points[i], c = points[i + 1], before = Math.hypot(b[0] - a[0], b[1] - a[1]), after = Math.hypot(c[0] - b[0], c[1] - b[1]), r = Math.min(9, before / 2, after / 2);
    if (!before || !after) continue;
    d += `L${b[0] - (b[0] - a[0]) / before * r},${b[1] - (b[1] - a[1]) / before * r}Q${b.join(',')} ${b[0] + (c[0] - b[0]) / after * r},${b[1] + (c[1] - b[1]) / after * r}`;
  }
  d += `L${points.at(-1).join(',')}`;
  const id = `flow-arrow-${++uid}`, defs = se('defs', {}, svg), marker = se('marker', { id, viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' }, defs);
  se('path', { d: 'M1 1L7 4L1 7', fill: 'none', stroke: color, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, marker);
  return se('path', { d, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dash ? '4 4' : '', 'marker-end': `url(#${id})` }, svg);
}

function flowSignal(svg, path, color = C.blue, weight = 1) {
  const d = path.getAttribute('d'), width = Math.max(1.5, +path.getAttribute('stroke-width')) + weight;
  const group = se('g', { class: 'flow-signal', 'pointer-events': 'none' });
  path.after(group);
  se('path', { d, fill: 'none', stroke: color, 'stroke-width': width + 5, opacity: .08, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, group);
  const reveal = se('path', { d, fill: 'none', stroke: color, 'stroke-width': width, pathLength: 100, 'stroke-dasharray': '100 100', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, group);
  const length = path.getTotalLength(), end = path.getPointAtLength(length), before = path.getPointAtLength(Math.max(0, length - 2)), angle = Math.atan2(end.y - before.y, end.x - before.x) * 180 / Math.PI;
  const arrow = se('path', { d: 'M-6 -3.5L0 0L-6 3.5', fill: 'none', stroke: color, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: `translate(${end.x} ${end.y}) rotate(${angle})` }, group);
  return progress => {
    const visible = progress >= 0 && progress <= 1, p = clamp(progress, 0, 1), travel = clamp(p / .78, 0, 1), smooth = travel * travel * (3 - 2 * travel);
    const opacity = visible ? Math.min(1, p / .10, (1 - p) / .22) : 0;
    group.setAttribute('opacity', Math.max(0, opacity));
    reveal.setAttribute('stroke-dashoffset', 100 * (1 - smooth));
    arrow.setAttribute('opacity', clamp((travel - .83) / .17, 0, 1));
  };
}

function tax(host) {
  title(host, 'Filing a return');
  let retained = true, signals = [], blocks = [];
  tabs(host, [{ value: 'retained', label: 'Reasoning retained' }, { value: 'answer', label: 'Answer only' }], 'retained', v => { retained = v === 'retained'; draw(); });
  const plot = el('div', { class: 'plot-area tax-workflow' }, host), phase = el('p', { class: 'workflow-phase' }, host);
  const play = playback(host, 1, update, { duration: 13000, clock: false, interval: 25 });
  caption(host, 'AI preparation moves records and reconciled entries into professional review. Keeping the calculations and reasoning lets junior staff reconstruct the case, ask questions, and develop judgment alongside the completed return.');
  function draw() {
    signals = []; blocks = [];
    const small = plot.clientWidth < 580, { svg, width } = svgBase(plot, small ? 452 : 288, 'Household records pass through AI preparation and professional review to a completed return. Retained reasoning supports junior judgment and feedback.');
    const bw = small ? (width - 46) / 2 : (width - 82) / 4, xs = small ? [8, width - bw - 8, width - bw - 8, 8] : [8, 8 + bw + 22, 8 + 2 * (bw + 22), 8 + 3 * (bw + 22)];
    const source = [xs[0], small ? 55 : 83, bw, 72], organize = [xs[1], small ? 55 : 72, bw, 44], reconcile = [xs[1], small ? 114 : 129, bw, 44], review = [xs[2], small ? 218 : 102, bw, 64], complete = [xs[3], small ? 218 : 102, bw, 64];
    const records = [small ? xs[0] : xs[1], small ? 356 : 222, bw, 56], junior = [xs[2], small ? 356 : 222, bw, 56];
    const center = b => b[0] + b[2] / 2, mid = b => b[1] + b[3] / 2;
    se('rect', { x: xs[1] - 7, y: small ? 22 : 34, width: bw + 14, height: small ? 153 : 155, rx: 13, fill: '#f0f0f0', stroke: '#d0d0d0', 'stroke-dasharray': '4 5' }, svg);
    tx(svg, center(organize), small ? 42 : 57, 'AI preparation', { 'text-anchor': 'middle', class: 'svg-label' });
    const paths = [];
    paths.push(flowLink(svg, [[source[0] + bw, mid(source)], [organize[0] - 12, mid(source)], [organize[0] - 12, mid(organize)], [organize[0], mid(organize)]]));
    paths.push(flowLink(svg, [[center(organize), organize[1] + 44], [center(reconcile), reconcile[1]]]));
    paths.push(flowLink(svg, small ? [[center(reconcile), reconcile[1] + 44], [center(review), review[1]]] : [[reconcile[0] + bw, mid(reconcile)], [review[0] - 11, mid(reconcile)], [review[0] - 11, mid(review)], [review[0], mid(review)]]));
    paths.push(flowLink(svg, small ? [[review[0], mid(review)], [complete[0] + bw, mid(complete)]] : [[review[0] + bw, mid(review)], [complete[0], mid(complete)]]));
    const retainedPath = flowLink(svg, small ? [[reconcile[0], mid(reconcile)], [source[0] - 5, mid(reconcile)], [source[0] - 5, 332], [center(records), 332], [center(records), records[1]]] : [[center(reconcile), reconcile[1] + 44], [center(records), records[1]]], { dash: true });
    const judgmentPath = flowLink(svg, [[records[0] + bw, mid(records)], [junior[0], mid(junior)]], { dash: true });
    const feedback = flowLink(svg, [[center(junior), junior[1]], [center(review), review[1] + 64]], { dash: true });
    const questions = flowLink(svg, small ? [[review[0] + bw, mid(review)], [width - 1, mid(review)], [width - 1, 8], [center(organize), 8], [center(organize), 22]] : [[center(review), review[1]], [center(review), 17], [center(organize), 17], [center(organize), 34]], { dash: true });
    if (!small) tx(svg, (center(review) + center(organize)) / 2, 10, 'Questions', { 'text-anchor': 'middle' });
    const entries = [
      [source, ['Household', 'records'], 'Source documents', 'Receipts, statements, and household details start the case.'],
      [organize, ['Organize records'], 'Organized records', 'AI groups source records for the return.'],
      [reconcile, ['Reconcile entries'], 'Reconciled entries', 'Entries are matched and discrepancies are traced to source records.'],
      [review, ['Professional', 'review'], 'Professional review', 'The professional checks tax treatment and returns questions.'],
      [complete, ['Completed', 'return'], 'Completed return', 'The reviewed case is ready to file.'],
      [records, retained ? ['Records and', 'reasoning'] : ['Final answer'], 'Learning material', retained ? 'The worked case preserves the route from source documents to the answer.' : 'The handoff contains the final figures.'],
      [junior, ['Junior judgment'], 'Junior judgment', retained ? 'Junior staff reconstruct the case and bring questions to review.' : 'Junior staff receive the submitted result.'],
    ];
    entries.forEach(([box, lines, heading, body]) => { const g = flowBox(svg, ...box, lines); blocks.push(g); markTooltip(plot, svg, g, heading, body); });
    const times = [[.01, .17], [.15, .29], [.28, .47], [.69, .85]];
    paths.forEach((path, i) => signals.push({ move: flowSignal(svg, path, i === 3 ? C.teal : C.blue), start: times[i][0], end: times[i][1] }));
    signals.push({ move: flowSignal(svg, questions, C.machineFill), start: .45, end: .62 });
    signals.push({ move: flowSignal(svg, retainedPath, retained ? C.humanFill : C.machineFill), start: .30, end: .48 });
    signals.push({ move: flowSignal(svg, judgmentPath, retained ? C.blue : C.machineFill), start: .49, end: .69 });
    if (retained) signals.push({ move: flowSignal(svg, feedback, C.machineFill), start: .69, end: .86 });
    update(play.value());
  }
  function update(t) {
    signals.forEach(p => p.move((t - p.start) / (p.end - p.start)));
    const active = t < .17 ? 0 : t < .29 ? 1 : t < .47 ? 2 : t < .69 ? 3 : t < .86 ? 6 : 4;
    blocks.forEach((block, i) => block.classList.toggle('flow-active', i === active || retained && i === 5 && t >= .3 && t < .69));
    const message = t < .17 ? 'Household records enter the case.' : t < .29 ? 'AI organizes the source documents.' : t < .47 ? 'Entries are reconciled and the reasoning is recorded.' : t < .69 ? 'Professional review returns questions to the preparation stage.' : t < .86 ? retained ? 'Junior staff reconstruct the case and return their questions.' : 'Junior staff receive the completed figures.' : 'The reviewed return is ready to file.';
    if (phase.textContent !== message) phase.textContent = message;
  }
  watch(plot, draw); play.autoplay();
}

function learning(host) {
  title(host, 'Learning from records', 'Binary experiment');
  const state = { rB: .8, rA: .8, access: 0 }; let retained = true;
  tabs(host, [{ value: 'retained', label: 'Worked case retained' }, { value: 'answer', label: 'Answer only' }], 'retained', v => { retained = v === 'retained'; draw(); });
  const grid = el('div', { class: 'figure-plots' }, host), information = el('div', { class: 'plot-area' }, grid), riskPlot = el('div', { class: 'plot-area' }, grid);
  const play = playback(host, 1, draw, { duration: 10000, scrub: { label: 'Receipt probability p', max: 1, step: .01, format: pct, fromTime: t => retained ? t : 0, disabled: () => !retained } });
  caption(host, 'Learning depends on which parts of a worked case reach the learner. Access to source information alongside an explanation lowers prediction risk, while an answer alone leaves less information for reconstructing the underlying reasoning.');
  function draw() {
    play.refresh();
    state.access = retained ? play.value() : 0;
    const risk = learningRisk(state);
    const points = Array.from({ length: 51 }, (_, i) => ({ t: i / 50, ...learningRisk({ ...state, access: i / 50 }) }));
    chart(riskPlot, { label: 'Learning risk by probability of receiving both signals', height: 248, yLabel: 'Prediction risk', xLabel: 'Receipt probability p', xDomain: [0, 1], yDomain: [0, 1.06], cursor: state.access, series: [{ label: 'Worked case access', points, y: p => p.risk, color: C.teal }, { label: 'Answer alone', points, y: p => p.explanationOnlyRisk, color: C.muted, dash: true }] });
    const { svg, width } = svgBase(information, 248, 'Foundation and explanation signals jointly support judgment');
    const bw = (width - 36) / 2, center = width / 2;
    tx(svg, 6, 13, 'Information reaching the learner', { class: 'svg-label' });
    const a = flowLink(svg, [[6 + bw / 2, 86], [6 + bw / 2, 113], [center, 113], [center, 142]], { dash: !retained });
    const b = flowLink(svg, [[width - 6 - bw / 2, 86], [width - 6 - bw / 2, 113], [center, 113], [center, 142]]);
    const foundation = flowBox(svg, 6, 34, bw, 52, ['Foundation S']);
    const explanation = flowBox(svg, width - 6 - bw, 34, bw, 52, ['Explanation Y']);
    const judgment = flowBox(svg, center - 84, 142, 168, 66, ['Joint judgment'], `Risk ${fmt(risk.risk, 3)}`);
    foundation.setAttribute('opacity', retained ? 1 : .45);
    markTooltip(information, svg, foundation, 'Foundation signal', 'Source information has reliability 0.8.');
    markTooltip(information, svg, explanation, 'Explanation signal', 'The explanation has reliability 0.8.');
    markTooltip(information, svg, judgment, 'Prediction risk', `Risk is 1 − p(rB rA)². Current access p is ${fmt(state.access, 2)}.`);
    const motion = (play.value() * 2) % 1;
    if (retained) flowSignal(svg, a, C.blue)(motion);
    flowSignal(svg, b, C.machineFill)((motion + .35) % 1);
    emphasizeBlock(foundation, retained ? Math.sin(Math.PI * motion) ** 2 : 0);
    emphasizeBlock(explanation, Math.sin(Math.PI * ((motion + .35) % 1)) ** 2, C.machineFill);
    emphasizeBlock(judgment, state.access);
  }
  watch(grid, draw); play.autoplay();
}

function careers(host) {
  title(host, 'Careers over time', 'Boundary-value solution');
  const state = { preset: 'practiceLoss', horizon: DEFAULTS.horizon, view: 'E' }; let result, baseline, revision = 0;
  tabs(host, [{ value: 'practiceLoss', label: 'Practice loss' }, { value: 'discovery', label: 'Discovery' }, { value: 'announcement', label: 'Automation announcement' }], state.preset, v => { state.preset = v; compute(); });
  const chartGrid = el('div', { class: 'career-panel' }, host), mechanism = el('div', { class: 'plot-area career-mechanism' }, chartGrid), right = el('div', { class: 'career-chart' }, chartGrid);
  tabs(right, [{ value: 'E', label: 'Experts' }, { value: 'Delta', label: 'Value' }, { value: 'w', label: 'Wage' }], state.view, v => { state.view = v; draw(); });
  const pathPlot = el('div', { class: 'plot-area' }, right);
  legend(right, [{ label: 'Selected economy', color: C.teal }, { label: 'Human baseline', color: C.muted, dash: true }]);
  const scrub = playback(host, state.horizon, draw, { scrub: { label: 'Time', step: .05, format: v => `${fmt(v, 1)} / ${state.horizon}` } }), status = el('p', { class: 'figure-status', role: 'status' }, host);
  caption(host, 'Practice and formal study replenish expertise while obsolescence reduces it. Comparing career paths shows how changes in work and research alter the expert population, the value of qualifying, and the wage earned by experts.');
  async function compute() {
    const token = ++revision; result = null; baseline = null; scrub.stop(); scrub.setMax(state.horizon); scrub.button.disabled = true;
    status.innerHTML = '<span class="loading-mark" aria-hidden="true"></span>Solving the two boundary problems';
    const options = { ...paramsFor(state.preset), horizon: state.horizon, steps: 240, E0: DEFAULTS.E0, A0: 1, terminalDelta: 0 };
    try {
      const solved = await Promise.all([solvePath(options), solvePath({ ...paramsFor('baseline'), horizon: state.horizon, steps: 240, E0: DEFAULTS.E0, A0: 1, terminalDelta: 0 })]);
      if (token !== revision) return;
      if (!solved.every(r => r?.ok)) { const failed = solved.find(r => !r?.ok); chartGrid.querySelectorAll('.plot-area').forEach(p => p.replaceChildren()); status.textContent = `Path unavailable · ${failed?.diagnostics?.message || 'Numerical convergence failed.'}`; return; }
      [result, baseline] = solved; scrub.button.disabled = false; status.textContent = ''; host.dataset.numericalConditions = diagnosticText(result); scrub.set(reducedMotion() ? state.horizon * .5 : 0); scrub.autoplay();
    } catch (error) { if (token !== revision) return; status.textContent = `Path unavailable · ${error.message}`; chartGrid.querySelectorAll('.plot-area').forEach(p => p.replaceChildren()); }
  }
  function draw() {
    if (!result?.ok || !baseline?.ok) return;
    const time = scrub.value(), p = nearest(result.points, time), key = state.view, labels = { E: 'Expert share E', Delta: 'Qualification value Δ', w: 'Hourly wage w' };
    chart(pathPlot, { label: labels[key], height: 215, yLabel: labels[key], xDomain: [0, state.horizon], cursor: time, zero: key === 'Delta', yFormat: key === 'E' ? pct : fmt, vertical: paramsFor(state.preset).announcementTime, series: [{ label: 'Selected economy', points: result.points, y: p => p[key], color: C.teal, format: key === 'E' ? pct : fmt }, { label: 'Human baseline', points: baseline.points, y: p => p[key], color: C.muted, dash: true, opacity: .7, format: key === 'E' ? pct : fmt }] });
    const { svg, width } = svgBase(mechanism, 282, 'Practice and formal study feed the expert population along the solved path');
    const bw = (width - 40) / 2, center = width / 2, totalMax = Math.max(...result.points.map(point => point.M + point.T));
    tx(svg, 6, 16, 'Entry into expertise', { class: 'svg-label' });
    const practice = flowLink(svg, [[6 + bw / 2, 104], [6 + bw / 2, 136], [center, 136], [center, 169]], { width: 1.5 + 3 * p.M / totalMax });
    const study = flowLink(svg, [[width - 6 - bw / 2, 104], [width - 6 - bw / 2, 136], [center, 136], [center, 169]], { width: 1.5 + 3 * p.T / totalMax });
    const a = flowBox(svg, 6, 38, bw, 66, ['Practice'], `M ${fmt(p.M, 3)}`), b = flowBox(svg, width - 6 - bw, 38, bw, 66, ['Formal study'], `T ${fmt(p.T, 3)}`);
    const population = flowBox(svg, 6, 169, width - 12, 66, ['Expert population'], '');
    population.querySelector('text').setAttribute('y', '188');
    se('rect', { x: 21, y: 200, width: width - 42, height: 10, rx: 5, fill: '#e8e8e8' }, population);
    se('rect', { x: 21, y: 200, width: (width - 42) * p.E, height: 10, rx: 5, fill: C.humanFill }, population);
    tx(population, center, 228, `E ${pct(p.E)}`, { 'text-anchor': 'middle', class: 'svg-number' });
    const expiry=paramsFor(state.preset).delta*p.E,exit=flowLink(svg,[[center,235],[center,256]],{width:1.5+3*expiry/totalMax});
    markTooltip(mechanism, svg, a, 'Practice entry', `${fmt(p.M, 4)} qualifications per period from practice.`);
    markTooltip(mechanism, svg, b, 'Formal entry', `${fmt(p.T, 4)} qualifications per period. Study intensity x is ${fmt(p.x, 3)}.`);
    markTooltip(mechanism, svg, population, 'Expert population', `Ė = M + T − δE. Current expert share is ${pct(p.E)}.`);
    const progress = time / state.horizon * 5;
    if (p.M > 0) flowSignal(svg, practice, C.blue, .6)(progress % 1);
    if (p.T > 0) flowSignal(svg, study, C.machineFill, .6)((progress + .45) % 1);
    flowSignal(svg,exit,C.muted,.6)((progress+.2)%1);
    emphasizeBlock(a, Math.sin(Math.PI * (progress % 1)) ** 2);
    emphasizeBlock(b, Math.sin(Math.PI * ((progress + .45) % 1)) ** 2, C.machineFill);
    emphasizeBlock(population, .25 + .45 * Math.sin(Math.PI * (progress % 1)) ** 2);
    tx(svg,center,277,`Obsolescence  δE ${fmt(expiry,3)}`,{'text-anchor':'middle'});
  }
  watch(chartGrid, draw); compute();
}

function heatmap(host, { label, xLabel, yLabel, xDomain, yDomain, sample, color, selected, onselect, resolution = [40, 28], yFormat = fmt, xFormat = fmt, legendText, regionLabel }) {
  const height = host.clientWidth < 400 ? 295 : 325, { svg, width } = svgBase(host, height, label), margin = { l: 49, r: 16, t: 24, b: 46 }, right = width - margin.r, bottom = height - margin.b;
  const X = x => margin.l + (x - xDomain[0]) / (xDomain[1] - xDomain[0]) * (right - margin.l), Y = y => bottom - (y - yDomain[0]) / (yDomain[1] - yDomain[0]) * (bottom - margin.t);
  const [nx, ny] = resolution,regions=new Map();
  for (let ix = 0; ix < nx; ix++) for (let iy = 0; iy < ny; iy++) { const x = xDomain[0] + (ix + .5) / nx * (xDomain[1] - xDomain[0]), y = yDomain[0] + (iy + .5) / ny * (yDomain[1] - yDomain[0]); const value = sample(x, y); se('rect', { x: margin.l + ix / nx * (right - margin.l), y: bottom - (iy + 1) / ny * (bottom - margin.t), width: (right - margin.l) / nx + .3, height: (bottom - margin.t) / ny + .3, fill: color(value), 'data-map-value': typeof value === 'number' ? value : '' }, svg);if(regionLabel){const key=regionLabel(value);if(key){const group=regions.get(key)||{x:0,y:0,n:0};group.x+=x;group.y+=y;group.n++;regions.set(key,group);}} }
  if(regionLabel)regions.forEach((r,key)=>{const x=r.x/r.n,y=r.y/r.n;if(r.n>30&&regionLabel(sample(x,y))===key)tx(svg,X(x),Y(y)+4,key,{'text-anchor':'middle',fill:C.ink,style:'paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round'});});
  numberTicks(xDomain[0], xDomain[1], 4).forEach(x => tx(svg, X(x), bottom + 18, xFormat(x), { 'text-anchor': 'middle' }));
  numberTicks(yDomain[0], yDomain[1], 4).forEach(y => tx(svg, margin.l - 8, Y(y) + 4, yFormat(y), { 'text-anchor': 'end' }));
  tx(svg, margin.l, 12, yLabel, { class: 'svg-label' }); tx(svg, right, height - 5, xLabel, { 'text-anchor': 'end' });
  const current = selected ? [...selected] : null;
  let vertical, horizontal, pointer;
  if (current) {
    const cursor = se('g', { 'pointer-events': 'none' }, svg);
    vertical = se('line', { y1: margin.t, y2: bottom, stroke: C.paper, opacity: .75, 'stroke-width': 1 }, cursor);
    horizontal = se('line', { x1: margin.l, x2: right, stroke: C.paper, opacity: .75, 'stroke-width': 1 }, cursor);
    pointer = se('circle', { r: 5, class: 'map-pointer' }, cursor);
  }
  function setSelected(x, y) {
    if (!current) return;
    current[0] = clamp(x, ...xDomain); current[1] = clamp(y, ...yDomain);
    const px = X(current[0]), py = Y(current[1]);
    vertical.setAttribute('x1', px); vertical.setAttribute('x2', px);
    horizontal.setAttribute('y1', py); horizontal.setAttribute('y2', py);
    pointer.setAttribute('cx', px); pointer.setAttribute('cy', py);
  }
  if (current) setSelected(...current);
  const tooltip = el('div', { class: 'plot-tooltip', hidden: '' }, host), surface = se('rect', { x: margin.l, y: margin.t, width: right - margin.l, height: bottom - margin.t, fill: 'transparent', 'aria-label': label }, svg);
  function coords(event) { const r = svg.getBoundingClientRect(), px = (event.clientX - r.left) * width / r.width, py = (event.clientY - r.top) * height / r.height; return { px, py, x: xDomain[0] + clamp((px - margin.l) / (right - margin.l), 0, 1) * (xDomain[1] - xDomain[0]), y: yDomain[0] + clamp((bottom - py) / (bottom - margin.t), 0, 1) * (yDomain[1] - yDomain[0]) }; }
  function show(px, py, x, y) { tooltip.innerHTML = `${esc(xLabel)} <strong>${esc(xFormat(x))}</strong><br>${esc(yLabel)} <strong>${esc(yFormat(y))}</strong><br>${esc(legendText(sample(x, y)))}`; tooltip.hidden = false; tooltip.style.left = `${clamp(px + 10, 0, width - tooltip.offsetWidth - 2)}px`; tooltip.style.top = `${clamp(py - 16, 20, height - tooltip.offsetHeight)}px`; }
  function choose(x, y) { setSelected(x, y); onselect?.(x, y); }
  surface.addEventListener('pointermove', event => { const { px, py, x, y } = coords(event); show(px, py, x, y); if (onselect) choose(x, y); });
  if (onselect) {
    surface.setAttribute('tabindex', '0'); surface.setAttribute('role', 'img');
    surface.setAttribute('aria-label', `${label}. Move the pointer or use arrow keys to select an allocation.`);
    surface.addEventListener('pointerdown', event => { const { px, py, x, y } = coords(event); choose(x, y); show(px, py, x, y); });
    surface.addEventListener('keydown', event => {
      const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowDown: [0, -1], ArrowUp: [0, 1] }[event.key];
      if (!delta || !current) return;
      event.preventDefault();
      const x = clamp(current[0] + delta[0] * (xDomain[1] - xDomain[0]) / 50, ...xDomain), y = clamp(current[1] + delta[1] * (yDomain[1] - yDomain[0]) / 50, ...yDomain);
      choose(x, y); show(X(x), Y(y), x, y);
    });
    surface.addEventListener('blur', () => { tooltip.hidden = true; });
  }
  surface.addEventListener('pointerleave', () => { tooltip.hidden = true; });
  return { svg, X, Y, width, height, margin, right, bottom, setSelected };
}

function regimes(host) {
  title(host, 'Research allocation', 'Frozen-state clearing');
  let state = { E: .55, A: 1.5, machineMultiplier: 1.05, method: 'both' };
  let mapGraph, mapKey = '', selectionFrame = 0;
  tabs(host, [{ value: 'both', label: 'Competing methods' }, { value: 'human', label: 'Human research' }, { value: 'grounded', label: 'Human grounding' }], state.method, v => { state.method = v; draw(); });
  const grid = el('div', { class: 'figure-plots' }, host), map = el('div', { class: 'plot-area' }, grid), clearing = el('div', { class: 'plot-area' }, grid);
  legend(host, [{ label: 'Human', color: C.humanFill, square: true }, { label: 'Mixed', color: C.mixed, square: true }, { label: 'Machine / grounded', color: C.machineFill, square: true }, { label: 'Career premium below zero', color: '#e8e8e8', square: true }]);
  const output = readout(host), explain = detail(host);
  const sweep = playback(host, 1, t => { state.A = 1 + 4 * t; draw(); }, { duration: 13000, interval: 140, scrub: { label: 'Frontier A', min: 1, max: 5, step: .01, fromTime: t => 1 + 4 * t, toTime: value => (value - 1) / 4, format: v => fmt(v, 2) } });
  map.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') sweep.hold(); });
  ['pointerup', 'pointercancel'].forEach(type => map.addEventListener(type, event => { if (event.pointerType === 'touch') sweep.release(); }));
  caption(host, 'Research methods compete as the frontier changes their costs. The map locates human, mixed, and machine research, while the adjacent demand curves show the wage that balances expert hours across services and research.');
  function draw() {
    const p = { ...DEFAULTS, ...state }, m = solveMarket(p);
    if (!m.ok) { explain('Allocation unavailable', '', m.diagnostics.message); return; }
    const nextMapKey = `${state.A}|${state.method}|${Math.round(map.getBoundingClientRect().width)}`;
    if (nextMapKey !== mapKey) {
      mapKey = nextMapKey;
      mapGraph = heatmap(map, { label: 'Research regime by expert population and machine resource requirements', xLabel: 'Expert share E', yLabel: 'Machine resource multiplier', xDomain: [.2, .85], yDomain: [.4, 4], selected: [state.E, state.machineMultiplier], sample: (E, machineMultiplier) => solveMarket({ ...p, E, machineMultiplier }), color: value => value.w < p.b ? '#e8e8e8' : regimeFill(value.regime),regionLabel:value=>value.w<p.b?'':value.regime==='human'?'Human':value.regime==='mixed'?'Mixed':value.regime==='grounded'?'Grounded':'Machine', xFormat: v => pct(v), legendText: value => `${regimeLabel(value.regime)} · ${value.w < p.b ? 'negative career premium' : 'positive career premium'}`, onselect: (E, machineMultiplier) => {
        state.E = E; state.machineMultiplier = machineMultiplier;
        if (!selectionFrame) selectionFrame = requestAnimationFrame(() => { selectionFrame = 0; draw(); });
      } });
    } else mapGraph.setSelected(state.E, state.machineMultiplier);
    const points = Array.from({ length: 81 }, (_, i) => { const w = Math.max(.05, m.w * .25) + i / 80 * (m.w * 2.05); const DS = m.C * w ** -p.epsilon; let LR; if (p.method === 'grounded') LR = p.BR * m.aG / (p.q * m.aM + w * m.aG); else if (p.method === 'human' || w <= m.wbar) LR = p.BR / (w + p.q * p.xi); else LR = 0; return { t: w, DS, total: DS + LR, supply: state.E }; });
    if (p.method === 'both' && m.wbar > points[0].t && m.wbar < points.at(-1).t) { const DS = m.C * m.wbar ** -p.epsilon; points.push({ t: m.wbar, DS, total: DS + p.BR / (m.wbar + p.q * p.xi), supply: state.E }, { t: m.wbar, DS, total: DS, supply: state.E }); points.sort((a, b) => a.t - b.t); }
    const graph = chart(clearing, { label: 'Expert demand and supply against wage', height: map.clientWidth < 400 ? 295 : 325, yLabel: 'Expert hours / population', xLabel: 'Hourly wage w', xDomain: [points[0].t, points.at(-1).t], yDomain: [0, Math.min(1.6, Math.max(state.E * 1.8, .6))], vertical: m.w, series: [{ label: 'Services', points, y: p => p.DS, color: C.muted }, { label: 'Services + research', points, y: p => p.total, color: C.teal }, { label: 'Expert supply', points, y: p => p.supply, color: C.rust, dash: true }] });
    se('circle', { cx: graph.X(m.w), cy: graph.Y(state.E), r: 4.5, fill: C.ink, stroke: C.paper, 'stroke-width': 2 }, graph.svg);
    output([['Wage', fmt(m.w, 3)], ['Research hours', fmt(m.LR, 3)], ['Frontier drift', fmt(m.F, 4)]]);
    const costText = p.method === 'grounded' ? `Grounded packet cost ${fmt(m.kStar, 3)}. Human grounding uses ${fmt(m.aG, 3)} hours per packet.` : `Human packet cost ${fmt(m.kH, 3)}. Machine packet cost ${fmt(m.kM, 3)}. Parity wage ${fmt(m.wbar, 3)}.`;
    explain(regimeLabel(m.regime), `E = Dₛ + Lᵣ = ${fmt(m.DS, 3)} + ${fmt(m.LR, 3)}`, costText);
  }
  watch(grid, draw); sweep.set(sweep.value()); sweep.autoplay();
}

function welfare(host) {
  title(host, 'Private and public value', 'Local preparation margin');
  const market = solveMarket({ ...DEFAULTS, method: 'human', E: DEFAULTS.E0, A: 1 });
  const state = { P: .2, gap: .8, premium: .5, m: .35, e: .45, scenario: 'learning' };
  const bounds = { P: [0, .6], gap: [.25, 1.25], premium: [.05, 1] };
  let anchor = state.gap;
  const activeKey = () => state.scenario === 'learning' ? 'gap' : 'premium';
  tabs(host, [{ value: 'learning', label: 'Value of learning' }, { value: 'research', label: 'Research value' }], state.scenario, v => { state.scenario = v; anchor = state[activeKey()]; play.set(0); });
  const grid = el('div', { class: 'figure-plots' }, host), map = el('div', { class: 'plot-area' }, grid), flow = el('div', { class: 'plot-area' }, grid);
  legend(host, [{ label: 'Positive public value', color: C.teal, square: true }, { label: 'Negative public value', color: C.rust, square: true }, { label: 'Zero public value', color: C.muted, dash: true }]);
  const output = readout(host), controls = el('div', { class: 'figure-adjustments welfare-coefficients' }, host);
  const sliders = [['P', 'Private gain P'], ['gap', 'Learning value gap λ − Δ'], ['premium', 'Research premium Π − h']].map(([key, label]) => {
    const wrap = el('label', { class: 'playback-scrub' }, controls);
    el('span', {}, wrap, label); const display = el('output', {}, wrap);
    const [min, max] = bounds[key];
    const input = el('input', { type: 'range', min, max, step: .01, 'aria-label': label }, wrap);
    input.addEventListener('pointerdown', () => play.hold());
    input.addEventListener('input', () => {
      const value = +input.value;
      play.hold(); state[key] = value; anchor = state[activeKey()]; play.set(0);
    });
    ['change', 'pointerup', 'pointercancel', 'blur'].forEach(event => input.addEventListener(event, () => play.release()));
    return { key, min, max, input, display };
  });
  const play = playback(host, 1, draw, { duration: 12000, interval: 60, clock: false });
  caption(host, 'Private gains, lost learning, and research benefits jointly determine public value. Changing their valuations shifts the diagonal boundary between positive and negative cases, while the decomposition follows the same prepared case.');
  function value(m, e) { return localWelfare({ P: state.P, lambda: state.gap + 1, Delta: 1, m, Pi: market.h + state.premium, h: market.h, chiR: market.chiR, e }); }
  let graph;
  function fieldColor(v) { const strength = clamp(Math.abs(v) / 1.25, 0, 1); return `color-mix(in srgb, ${v >= 0 ? C.teal : C.rust} ${8 + strength * 75}%, ${C.paper})`; }
  function drawMap() {
    const nx = 36, ny = 24;
    graph = heatmap(map, { label: 'Local welfare by learning lost and expert hours released', xLabel: 'Learning lost m', yLabel: 'Expert hours released e', xDomain: [0, 1], yDomain: [0, 1], resolution: [nx, ny], sample: (m, e) => value(m, e).W, color: fieldColor, legendText: v => `Local public value ${fmt(v, 3)}` });
    graph.cells = [...graph.svg.querySelectorAll('[data-map-value]')].map((cell, i) => ({ cell, m: (Math.floor(i / ny) + .5) / nx, e: (i % ny + .5) / ny }));
    const m0 = state.P / state.gap, m1 = (state.P + state.premium * market.chiR) / state.gap, id = `welfare-clip-${++uid}`;
    const defs = se('defs', {}, graph.svg), clip = se('clipPath', { id }, defs); se('rect', { x: graph.margin.l, y: graph.margin.t, width: graph.right - graph.margin.l, height: graph.bottom - graph.margin.t }, clip);
    graph.boundary = se('line', { x1: graph.X(m0), y1: graph.Y(0), x2: graph.X(m1), y2: graph.Y(1), stroke: C.ink, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', 'clip-path': `url(#${id})`, 'pointer-events': 'none', 'data-welfare-boundary': '', opacity: .8 }, graph.svg);
  }
  function draw() {
    if (!graph) return;
    const key = activeKey(), [lo, hi] = bounds[key], phase = Math.acos(1 - 2 * clamp((anchor - lo) / (hi - lo), 0, 1));
    state[key] = lo + (hi - lo) * (1 - Math.cos(phase + 2 * Math.PI * play.value())) / 2;
    sliders.forEach(({ key, min, max, input, display }) => {
      input.value = state[key]; display.value = fmt(state[key], 2); input.setAttribute('aria-valuetext', display.value);
      input.style.setProperty('--range-progress', `${(state[key] - min) / (max - min) * 100}%`);
    });
    const w = value(state.m, state.e);
    graph.cells.forEach(({ cell, m, e }) => { const W = state.P - state.gap * m + state.premium * market.chiR * e; cell.setAttribute('fill', fieldColor(W)); cell.dataset.mapValue = W; });
    graph.boundary.setAttribute('x1', graph.X(state.P / state.gap));
    graph.boundary.setAttribute('x2', graph.X((state.P + state.premium * market.chiR) / state.gap));
    const { svg, width } = svgBase(flow, map.clientWidth < 400 ? 295 : 325, 'Decomposition of local public value using supplied continuation values');
    tx(svg, 12, 13, 'Per-case value', { class: 'svg-label' });
    const terms = [{ label: 'Private gain', value: w.privateGain, color: C.teal, body: `Supplied private gain P = ${fmt(state.P, 2)}.` }, { label: 'Learning cost', value: -w.learningCost, color: C.rust, body: `Learning value gap λ − Δ = ${fmt(state.gap, 2)}, multiplied by learning lost m.` }, { label: 'Research gain', value: w.researchGain, color: C.blue, body: `Research premium Π − h = ${fmt(state.premium, 2)}. Market absorption χᵣ = ${fmt(market.chiR, 3)}.` }, { label: 'Public value', value: w.W, color: C.ink, body: 'Private gain minus learning cost plus research gain.' }];
    const max = Math.max(.6, ...terms.map(term => Math.abs(term.value))), startX = width * .60, span = width * .20;
    se('line', { x1: startX, x2: startX, y1: 36, y2: 218, class: 'axis' }, svg);
    terms.forEach((term, i) => {
      const y = 49 + i * 43, len = term.value / max * span, group = se('g', {}, svg);
      se('rect', { x: 7, y: y - 17, width: width - 14, height: 34, rx: 6, fill: i === 3 ? '#efefef' : 'transparent' }, group);
      tx(group, 12, y + 5, term.label);
      se('line', { x1: startX, x2: startX + len, y1: y, y2: y, stroke: term.color, 'stroke-width': 10, opacity: i === 3 ? 1 : .8 }, group);
      tx(group, width - 7, y + 5, fmt(term.value, 3), { 'text-anchor': 'end', class: 'svg-number' });
      markTooltip(flow, svg, group, term.label, term.body);
    });
    const by = (map.clientWidth < 400 ? 295 : 325) - 48, research = market.chiR * state.e, service = (1 - market.chiR) * state.e;
    tx(svg, 12, by - 11, 'Released expert hours');
    se('rect', { x: 12, y: by, width: (width - 24) * market.chiR, height: 6, fill: C.humanFill }, svg);
    se('rect', { x: 12 + (width - 24) * market.chiR, y: by, width: (width - 24) * (1 - market.chiR), height: 6, fill: C.muted, opacity: .3 }, svg);
    tx(svg, 12, by + 25, `Research ${fmt(research, 3)}`); tx(svg, width - 12, by + 25, `Services ${fmt(service, 3)}`, { 'text-anchor': 'end' });
    output([['Learning lost m', fmt(state.m, 3)], ['Hours released e', fmt(state.e, 3)], ['Public value', fmt(w.W, 3)]]);
  }
  watch(grid, () => { drawMap(); draw(); }); play.autoplay();
}

function growth(host) {
  title(host, 'Growth and delay', 'Scalar growth comparisons');
  const state = { eta: 1.9, phi: .7, k: .18, absorptionTime: 1.5, delay: 1.5, horizon: 12, log: false }; let result;
  const thresholds = tabs(host, [{ value: 'subcritical', label: 'Subcritical' }, { value: 'critical', label: 'Critical' }, { value: 'supercritical', label: 'Supercritical' }], 'supercritical', key => { state.eta = state.phi + (key === 'subcritical' ? .5 : key === 'critical' ? 1 : 1.2); compute(); });
  const grid = el('div', { class: 'figure-plots' }, host), timePlot = el('div', { class: 'plot-area' }, grid), phasePlot = el('div', { class: 'plot-area' }, grid);
  legend(host, [{ label: 'Pure power', color: C.muted, dash: true }, { label: 'Gradual absorption', color: C.teal }, { label: 'Fixed delay', color: C.rust }]);
  const scrub = playback(host, state.horizon, () => draw(), { scrub: { label: 'Time', step: .05, format: v => `${fmt(v, 1)} / ${state.horizon}` } }), output = readout(host), status = el('p', { class: 'figure-status', role: 'status' }, host);
  caption(host, 'Research capability reaches productive use through absorption and delay. Comparing the growth paths shows how these timing differences reshape frontier progress and its rate of change under each research productivity scenario.');
  function compute() { result = growthPaths({ ...state, A0: 1, steps: 600 }); if (!result.ok) { status.textContent = result.diagnostics?.message || 'Growth comparison unavailable'; timePlot.replaceChildren(); phasePlot.replaceChildren(); return; } thresholds.set(result.class); draw();scrub.autoplay(); }
  function draw() {
    if (!result?.ok) return;
    const transform = v => finite(v) && v > 0 ? state.log ? Math.log10(v) : v : null;
    const keys = [{ key: 'power', label: 'Pure power', color: C.muted, dash: true }, { key: 'absorption', label: 'Absorption', color: C.teal }, { key: 'delay', label: 'Fixed delay', color: C.rust }];
    const points = result.points.map((p, i, all) => { const left = all[Math.max(0, i - 1)], right = all[Math.min(all.length - 1, i + 1)]; const out = { ...p }; for (const { key } of keys) out[`${key}Rate`] = finite(left[key]) && finite(right[key]) && right.t > left.t ? (right[key] - left[key]) / (right.t - left.t) : null; return out; });
    const available = points.flatMap(p => keys.map(({ key }) => p[key])).filter(finite), largest = Math.max(...available), normalBound = !state.log && largest > 80 ? 80 : null;
    const series = keys.map(s => ({ label: s.label, color: s.color, dash: s.dash, points, y: p => transform(p[s.key]) }));
    chart(timePlot, { label: 'Frontier trajectories through time', yLabel: state.log ? 'Frontier · log₁₀ A' : 'Frontier A', xDomain: [0, state.horizon], ...(normalBound ? { yDomain: [0, normalBound] } : {}), height: 260, cursor: scrub.value(), vertical: result.powerDivergenceTime, series });
    const phaseSeries = keys.map(s => ({ label: s.label, color: s.color, dash: s.dash, points, x: p => transform(p[s.key]), y: p => transform(p[`${s.key}Rate`]) }));
    chart(phasePlot, { label: 'Frontier growth rates against the frontier', yLabel: state.log ? 'Growth rate · log₁₀ Ȧ' : 'Growth rate Ȧ / period', xLabel: state.log ? 'Frontier · log₁₀ A' : 'Frontier A', height: 260, cursor: scrub.value(), phase: true, ...(normalBound ? { xDomain: [0, 80], yDomain: [0, 30] } : {}), series: phaseSeries });
    const selected = nearest(points, scrub.value()), beta = state.eta - state.phi;
    output([['Net exponent η − φ', fmt(beta)], ['Pure power', finite(selected.power) ? fmt(selected.power, 3) : 'Beyond divergence'], ['Absorption', fmt(selected.absorption, 3)], ['Fixed delay', fmt(selected.delay, 3)]]);
    const divergence = finite(result.powerDivergenceTime) ? `Pure-power divergence at t = ${fmt(result.powerDivergenceTime, 2)}.` : `Pure-power growth is ${beta === 1 ? 'exponential' : 'global'}.`;
    const warnings = (result.diagnostics.warnings || []).filter(w => w.code !== 'analytic-divergence').map(w => w.message).join(' ');
    status.textContent = `${divergence}${normalBound ? ' Large values extend beyond the linear display and remain visible with logarithmic axes.' : ''}${warnings ? ` ${warnings}` : ''}`;
    host.dataset.numericalConditions = `Ȧ = kA^(η−φ). Absorption uses Ȧ = kB^η/A^φ and εḂ = A−B. Fixed delay uses Ȧ = kA(t−τ)^η/A^φ. Phase rates use centered differences along the solved paths. ${JSON.stringify(result.diagnostics)}`;
  }
  watch(grid, draw); compute();
}

const WIDGETS = { tax, handoff:tax, learning, careers, regimes, welfare, feedback:mountFeedback, 'feedback-parts':mountFeedback, growth };
export function mountWidgets(root = document) {
  root.querySelectorAll('[data-widget]').forEach(host => {
    const build=WIDGETS[host.dataset.widget];if(!build||host.dataset.mounted)return;
    host.dataset.mounted='true';host.classList.add('interactive');host.replaceChildren();
    try {
      if(build===mountFeedback){build(host);return;}
      const surface=el('div',{class:'widget-surface'},host);build(surface);
      surface.querySelectorAll(':scope > .figure-caption, :scope > .tax-takeaway').forEach(p=>{p.classList.add('figure-caption');host.append(p);});
      surface.querySelectorAll(':scope > .figure-playback').forEach(row=>surface.append(row));
    } catch(error){el('p',{class:'figure-status',role:'status'},host,`Figure unavailable · ${error.message}`);console.error('Interactive figure',host.dataset.widget,error);}
  });
}

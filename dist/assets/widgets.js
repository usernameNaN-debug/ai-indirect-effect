import { DEFAULTS, PARAMETER_RANGES, PRESETS, solveMarket, solveBoundaryPath, learningRisk, localWelfare, growthPaths } from './model.js';
import { FEEDBACK_NODES, feedbackMeasurements } from './feedback-model.js';

const NS = 'http://www.w3.org/2000/svg';
const C = { teal: 'var(--teal, #2b6963)', rust: 'var(--rust, #a8583b)', blue: 'var(--blue, #527084)', ink: 'var(--ink, #272925)', muted: 'var(--muted, #777a71)', line: 'var(--line, #d7d3c9)', paper: 'var(--paper, #f6f4ed)', mixed: '#8e8a72' };
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const finite = x => typeof x === 'number' && Number.isFinite(x);
const fmt = (x, digits = 2) => !finite(x) ? '—' : Math.abs(x) >= 10000 || (Math.abs(x) > 0 && Math.abs(x) < 0.001) ? x.toExponential(1) : Number(x.toFixed(digits)).toLocaleString('en-US', { maximumFractionDigits: digits });
const pct = x => `${fmt(x * 100, 1)}%`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let uid = 0;
function el(tag, attrs = {}, parent, text) { const n = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'class') n.className = v; else n.setAttribute(k, v); } if (text !== undefined) n.textContent = text; if (parent) parent.append(n); return n; }
function se(tag, attrs = {}, parent, text) { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (text !== undefined) n.textContent = text; if (parent) parent.append(n); return n; }
function tx(svg, x, y, text, attrs = {}) { return se('text', { x, y, ...attrs }, svg, text); }
function svgBase(host, height, label) { const width = Math.max(270, Math.round(host.getBoundingClientRect().width || 640)); host.replaceChildren(); const svg = se('svg', { viewBox: `0 0 ${width} ${height}`, width, height, role: 'img', 'aria-label': label }, host); se('title', {}, svg, label); return { svg, width, height }; }
function watch(host, draw) { let width = 0; const observer = new ResizeObserver(entries => { const next = Math.round(entries[0].contentRect.width); if (next > 0 && next !== width) { width = next; draw(); } }); observer.observe(host); draw(); return observer; }
function title(host, heading, kind) { const row = el('div', { class: 'figure-heading' }, host); el('h3', {}, row, heading); el('span', { class: 'figure-kind' }, row, kind); }
function caption(host, html) { const p = el('p', { class: 'figure-caption' }, host); p.innerHTML = html; return p; }
function range(host, label, value, min, max, step, fn, format = fmt) { const id = `widget-range-${++uid}`; const box = el('div', { class: 'widget-control' }, host); el('label', { for: id }, box, label); const output = el('output', { for: id }, box, format(value)); const input = el('input', { type: 'range', id, min, max, step, value, 'aria-label': label }, box); const update = v => { input.value = v; output.value = format(+v); input.setAttribute('aria-valuetext', format(+v)); }; update(value); input.addEventListener('input', () => { update(input.value); fn(+input.value); }); return { input, output, set: update, box }; }
function select(host, label, options, selected, fn) { const id = `widget-select-${++uid}`; const wrap = el('div', { class: 'widget-select' }, host); el('label', { for: id }, wrap, label); const input = el('select', { id, 'aria-label': label }, wrap); options.forEach(o => el('option', { value: o.value }, input, o.label)); input.value = selected; input.addEventListener('change', () => fn(input.value)); return input; }
function tabs(host, options, value, fn) { const wrap = el('div', { class: 'widget-tabs', role: 'group' }, host); const buttons = options.map(o => { const button = el('button', { type: 'button', 'aria-pressed': String(o.value === value) }, wrap, o.label); button.addEventListener('click', () => { buttons.forEach(([b, key]) => b.setAttribute('aria-pressed', String(key === o.value))); fn(o.value); }); return [button, o.value]; }); return { wrap, set(v) { buttons.forEach(([b, key]) => b.setAttribute('aria-pressed', String(key === v))); } }; }
function legend(host, series) { const box = el('div', { class: 'figure-legend' }, host); series.forEach(s => { const item = el('span', {}, box); const line = el('i', { class: s.square ? 'legend-square' : 'legend-line', style: `color:${s.color};${s.dash ? 'border-top-style:dashed' : ''}` }, item); line.setAttribute('aria-hidden', 'true'); item.append(document.createTextNode(s.label)); }); return box; }
function readout(host) { const box = el('div', { class: 'figure-readout', 'aria-live': 'polite', 'aria-atomic': 'true' }, host); return values => { box.innerHTML = values.map(([l, v]) => `<span>${esc(l)}<strong>${esc(v)}</strong></span>`).join(''); }; }
function detail(host) { const box = el('div', { class: 'figure-detail', 'aria-live': 'polite' }, host); return (head, formula, body) => { box.innerHTML = `<h4>${esc(head)}</h4>${formula ? `<p class="formula">${esc(formula)}</p>` : ''}<p>${esc(body)}</p>`; }; }
function button(host, text, fn) { const b = el('button', { type: 'button' }, host, text); b.addEventListener('click', fn); return b; }
function playback(host, max, onchange, format = v => `${fmt(v, 1)} periods`) { const box = el('div', { class: 'figure-scrub' }, host); let playing = false, frame = 0, previous = 0; const b = button(box, 'Play path', () => { playing = !playing; b.textContent = playing ? 'Pause' : 'Play path'; if (playing) { if (+r.input.value >= +r.input.max) r.set(0); previous = 0; frame = requestAnimationFrame(tick); } else cancelAnimationFrame(frame); }); const r = range(box, 'Time', 0, 0, max, .01, v => { onchange(v); }, format); function tick(time) { if (!playing || !document.contains(host)) return; if (previous && !document.hidden) { const next = Math.min(+r.input.max, +r.input.value + (time - previous) / 1000 * (+r.input.max / 14)); r.set(next); onchange(next); if (next >= +r.input.max) { playing = false; b.textContent = 'Play path'; return; } } previous = time; frame = requestAnimationFrame(tick); } return { setMax(v) { r.input.max = v; r.set(Math.min(+r.input.value, v)); }, set(v) { r.set(v); onchange(v); }, value: () => +r.input.value, stop() { playing = false; cancelAnimationFrame(frame); b.textContent = 'Play path'; }, button: b }; }
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
  series.forEach(s => se('path', { d: linePath(s.points, X, Y, s.x || (p => p.t), s.y), class: 'series', stroke: s.color || C.teal, 'stroke-dasharray': s.dash ? '5 4' : '', opacity: s.opacity || 1 }, curves));
  if (finite(config.vertical) && config.vertical >= xd[0] && config.vertical <= xd[1]) se('line', { x1: X(config.vertical), x2: X(config.vertical), y1: margin.t, y2: bottom, class: 'cursor-line' }, curves);
  if (finite(config.cursor)) {
    if (!config.phase) se('line', { x1: X(config.cursor), x2: X(config.cursor), y1: margin.t, y2: bottom, class: 'cursor-line' }, curves);
    series.forEach(s => { const p = nearest(s.points, config.cursor); if (p && finite(s.y(p))) se('circle', { cx: X((s.x || (q => q.t))(p)), cy: Y(s.y(p)), r: 3.4, fill: s.color || C.teal, stroke: C.paper, 'stroke-width': 1.5 }, curves); });
  }
  const tooltip = el('div', { class: 'plot-tooltip', hidden: '' }, host), hover = se('g', { class: 'hover-layer' }, svg);
  const surface = se('rect', { x: margin.l, y: margin.t, width: right - margin.l, height: bottom - margin.t, fill: 'transparent', tabindex: '0', role: 'img', 'aria-label': `${config.label || config.yLabel}. Move across the chart to inspect values.` }, svg);
  function show(px, py) { const x = xd[0] + clamp((px - margin.l) / (right - margin.l), 0, 1) * (xd[1] - xd[0]); hover.replaceChildren(); se('line', { x1: X(x), x2: X(x), y1: margin.t, y2: bottom, class: 'cursor-line' }, hover); const rows = series.map(s => { const value = interpolateValue(s.points, x, s.x || (p => p.t), s.y); return `${esc(s.label)} <strong>${esc((s.format || fmt)(value))}</strong>`; }); tooltip.innerHTML = `<strong>${esc(config.xLabel || 'Time · periods')} ${esc(fmt(x))}</strong><br>${rows.join('<br>')}`; tooltip.hidden = false; tooltip.style.left = `${clamp(px + 12, 0, width - Math.min(220, tooltip.offsetWidth) - 4)}px`; tooltip.style.top = `${Math.max(20, Math.min(height - tooltip.offsetHeight - 2, py - 15))}px`; }
  surface.addEventListener('pointermove', event => { const r = svg.getBoundingClientRect(); show((event.clientX - r.left) * width / r.width, event.clientY - r.top); });
  surface.addEventListener('pointerleave', () => { tooltip.hidden = true; hover.replaceChildren(); }); surface.addEventListener('blur', () => { tooltip.hidden = true; hover.replaceChildren(); });
  let keyboardX = (xd[0] + xd[1]) / 2; surface.addEventListener('focus', () => show(X(keyboardX), 40)); surface.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); keyboardX = clamp(keyboardX + (event.key === 'ArrowRight' ? 1 : -1) * (xd[1] - xd[0]) / 20, ...xd); show(X(keyboardX), 40); } });
  if (config.onclick) surface.addEventListener('pointerdown', event => { const r = svg.getBoundingClientRect(); config.onclick(xd[0] + clamp(((event.clientX - r.left) * width / r.width - margin.l) / (right - margin.l), 0, 1) * (xd[1] - xd[0])); });
  return { svg, X, Y, width, height, margin, right, bottom };
}
function nearest(points, t) { return nearestBy(points, t, p => p.t); }
function nearestBy(points, x, fn) { let result, delta = Infinity; for (const p of points) { const d = Math.abs(fn(p) - x); if (finite(d) && d < delta) { delta = d; result = p; } } return result; }
function interpolateValue(points, x, getX, getY) { if (!points.length) return null; for (let i = 1; i < points.length; i++) { const a = points[i - 1], b = points[i], xa = getX(a), xb = getX(b); if (finite(xa) && finite(xb) && x >= Math.min(xa, xb) && x <= Math.max(xa, xb)) { const ya = getY(a), yb = getY(b); if (!finite(ya) || !finite(yb)) return null; return xb === xa ? yb : ya + (yb - ya) * (x - xa) / (xb - xa); } } const p = nearestBy(points, x, getX); return p && finite(getY(p)) ? getY(p) : null; }
function regimeColor(r) { return /mix/i.test(r) ? C.mixed : /machine|auto|ground/i.test(r) ? C.rust : C.teal; }
function regimeLabel(r) { return /mix/i.test(r) ? 'Mixed methods' : /ground/i.test(r) ? 'Grounded machine' : /machine|auto/i.test(r) ? 'Machine research' : 'Human research'; }
function presetOptions() { return Object.entries(PRESETS).map(([value, p]) => ({ value, label: p.label })); }
function paramsFor(key) { return { ...DEFAULTS, ...(PRESETS[key]?.options || {}) }; }
function parameterBounds(key, fallback) { const r = PARAMETER_RANGES[key]; return r ? [r.min, r.max, r.step] : fallback; }
function makeRegimeTrack(host, points) { host.replaceChildren(); if (!points.length) return; let runs = []; points.forEach(p => { if (!runs.length || runs.at(-1).regime !== p.regime) runs.push({ regime: p.regime, n: 1 }); else runs.at(-1).n++; }); runs.forEach(run => el('span', { style: `width:${run.n / points.length * 100}%;background:${regimeColor(run.regime)}`, title: regimeLabel(run.regime) }, host)); }
let worker, workerId = 0; const pending = new Map();
function solvePath(options) { return new Promise((resolve, reject) => { try { if (!worker && window.Worker) { worker = new Worker(new URL('./model-worker.js', import.meta.url), { type: 'module' }); worker.addEventListener('message', event => { const job = pending.get(event.data.id); if (job) { pending.delete(event.data.id); event.data.error ? job.reject(new Error(event.data.error)) : job.resolve(event.data.result); } }); worker.addEventListener('error', event => { for (const job of pending.values()) job.reject(new Error(event.message)); pending.clear(); worker.terminate(); worker = null; }); } if (worker) { const id = ++workerId; pending.set(id, { resolve, reject }); worker.postMessage({ id, type: 'path', options }); } else setTimeout(() => { try { resolve(solveBoundaryPath(options)); } catch (error) { reject(error); } }, 0); } catch (error) { reject(error); } }); }
function debounce(fn, delay = 180) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }
function diagnosticText(result) { const d = result.diagnostics || {}; return `${d.converged === false ? 'Unconverged' : 'Converged'} · ${d.iterations ?? '—'} iterations · equation residual ${fmt(d.maxResidual, 6)} · boundary residual ${fmt(d.boundaryResidual, 6)}`; }

function handoff(host) {
  title(host, 'Before the handoff', 'One customer file');
  const state = { preparation: 2, record: 'pair' }, stages = ['Raw records', 'Records organized', 'Cause reconstructed', 'Summary prepared'];
  const controls = el('div', { class: 'widget-controls' }, host);
  range(controls, 'Preparation at home', state.preparation, 0, 3, 1, v => { state.preparation = v; draw(true); }, v => stages[v]);
  const choice = el('div', {}, controls); select(choice, 'Material received', [{ value: 'pair', label: 'Records and worked reasoning' }, { value: 'answer', label: 'Final answer only' }], state.record, v => { state.record = v; draw(true); });
  const plot = el('div', { class: 'plot-area' }, host), explain = detail(host);
  const replay = el('div', { class: 'widget-tabs' }, host); button(replay, 'Replay handoff', () => draw(true));
  caption(host, 'With more preparation completed at home, the professional receives a different file. Retaining the records and worked reasoning gives a learner access to the reconstruction behind the answer.');
  function draw(animate = false) {
    const small = plot.clientWidth < 520, { svg, width } = svgBase(plot, small ? 420 : 330, 'Customer records, preparation at home, expert review, and the reasoning available to a learner.');
    const file = small ? [width * .22, 58] : [width * .13, 79], prep = small ? [width * .73, 64] : [width * .43, 77], review = small ? [width * .75, 266] : [width * .83, 92], learner = small ? [width * .25, 266] : [width * .72, 245];
    const paths = [];
    function connection(from, to, color, dashed = false, curved = false) { const [x1, y1] = from, [x2, y2] = to, d = curved ? `M${x1} ${y1} C${x1} ${(y1 + y2) / 2},${x2} ${(y1 + y2) / 2},${x2} ${y2}` : `M${x1} ${y1} L${x2} ${y2}`; se('path', { d, fill: 'none', stroke: color, 'stroke-width': 1.3, 'stroke-dasharray': dashed ? '4 4' : '' }, svg); paths.push({ d, color, active: !dashed }); }
    if (small) { connection([file[0] + 24, file[1] + 1], [prep[0] - 59, prep[1] + 1], C.muted); connection([prep[0] + 14, prep[1] + 68], [review[0], review[1] - 36], C.rust, false, true); connection([prep[0] - 25, prep[1] + 68], [learner[0], learner[1] - 35], state.record === 'pair' ? C.teal : C.line, state.record === 'answer', true); se('line', { x1: 5, x2: width - 5, y1: 180, y2: 180, stroke: C.line, 'stroke-dasharray': '3 4' }, svg); tx(svg, width - 5, 172, 'Professional handoff', { 'text-anchor': 'end' }); }
    else { connection([file[0] + 27, file[1]], [prep[0] - 78, prep[1]], C.muted); connection([prep[0] + 78, prep[1]], [review[0] - 45, review[1] - 5], C.rust); connection([prep[0] + 10, prep[1] + 72], [learner[0] - 31, learner[1] - 20], state.record === 'pair' ? C.teal : C.line, state.record === 'answer', true); se('line', { x1: width * .625, x2: width * .625, y1: 25, y2: 291, stroke: C.line, 'stroke-dasharray': '3 4' }, svg); tx(svg, width * .64, 14, 'Professional handoff'); }
    se('path', { d: `M${file[0] - 23} ${file[1] - 36}h33l13 13v57h-46z M${file[0] + 10} ${file[1] - 36}v13h13`, fill: C.paper, stroke: C.ink, 'stroke-width': 1.1 }, svg);
    for (let i = 0; i < 5; i++) se('line', { x1: file[0] - 15, x2: file[0] + (i % 2 ? 9 : 14), y1: file[1] - 10 + i * 8, y2: file[1] - 10 + i * 8, stroke: C.line, 'stroke-width': 1.4 }, svg);
    tx(svg, file[0], file[1] + 56, 'Customer records', { 'text-anchor': 'middle', class: 'svg-label' });
    const boxW = small ? 116 : 154;
    se('rect', { x: prep[0] - boxW / 2, y: prep[1] - 41, width: boxW, height: 108, rx: 9, fill: C.paper, stroke: C.line }, svg);
    tx(svg, prep[0], prep[1] - 20, 'Work at home', { 'text-anchor': 'middle', class: 'svg-label' });
    ['Sort records', 'Trace the cause', 'Draft summary'].forEach((label, i) => { const done = i < state.preparation, x = prep[0] - boxW / 2 + 9, y = prep[1] + 1 + i * 22; se('circle', { cx: x + 3, cy: y - 3, r: 3, fill: done ? C.teal : C.paper, stroke: done ? C.teal : C.line }, svg); tx(svg, x + 13, y + 1, label, { fill: done ? C.ink : C.muted, 'font-size': 11 }); });
    se('circle', { cx: review[0], cy: review[1] - 9, r: 15, fill: 'none', stroke: C.rust, 'stroke-width': 1.4 }, svg); se('path', { d: `M${review[0] - 29} ${review[1] + 25}Q${review[0]} ${review[1] - 1} ${review[0] + 29} ${review[1] + 25}`, fill: 'none', stroke: C.rust, 'stroke-width': 1.4 }, svg); tx(svg, review[0], review[1] + 49, 'Expert review', { 'text-anchor': 'middle', class: 'svg-label' });
    const [lx, ly] = learner, hasReasoning = state.record === 'pair';
    se('path', { d: `M${lx - 28} ${ly - 25}Q${lx - 14} ${ly - 31} ${lx} ${ly - 23}Q${lx + 14} ${ly - 31} ${lx + 28} ${ly - 25}v46Q${lx + 14} ${ly + 15} ${lx} ${ly + 23}Q${lx - 14} ${ly + 15} ${lx - 28} ${ly + 21}z M${lx} ${ly - 23}v46`, fill: C.paper, stroke: hasReasoning ? C.teal : C.muted, 'stroke-width': 1.3 }, svg);
    for (let i = 0; i < 4; i++) { se('line', { x1: lx - 21, x2: lx - 6, y1: ly - 13 + i * 8, y2: ly - 12 + i * 8, stroke: hasReasoning ? C.teal : C.line, opacity: hasReasoning ? .6 : .4 }, svg); if (hasReasoning) se('line', { x1: lx + 6, x2: lx + 21, y1: ly - 12 + i * 8, y2: ly - 13 + i * 8, stroke: C.teal, opacity: .6 }, svg); }
    tx(svg, lx, ly + 49, hasReasoning ? 'Reasoning retained' : 'Answer received', { 'text-anchor': 'middle', class: 'svg-label' });
    if (animate && !reducedMotion()) paths.forEach((path, i) => { if (!path.active) return; const packet = se('rect', { x: -4, y: -5, width: 8, height: 10, rx: 2, fill: C.paper, stroke: path.color, 'stroke-width': 1.5 }, svg); const motion = se('animateMotion', { path: path.d, dur: '1.1s', begin: `${i * .28}s`, fill: 'freeze', rotate: 'auto' }, packet); const opacity = se('animate', { attributeName: 'opacity', values: '0;1;1;0', keyTimes: '0;.08;.9;1', dur: '1.1s', begin: `${i * .28}s`, fill: 'freeze' }, packet); packet.setAttribute('opacity', '0'); motion.beginElementAt(i * .28); opacity.beginElementAt(i * .28); });
    const mode = hasReasoning ? 'Records and reasoning travel together' : 'Answer travels alone';
    explain(mode, '', state.preparation < 2 ? 'Reconstructing the cause remains part of the professional task, so the learner can still encounter the underlying reasoning through work.' : hasReasoning ? 'Preparation has moved home, while the worked reconstruction remains available for a learner to receive and process.' : 'Preparation has moved home, and the received answer omits the records and reconstruction through which a learner could follow the case.');
  }
  watch(plot, draw);
}

function learning(host) {
  title(host, 'What reaches the learner', 'Binary experiment');
  const state = { rB: .8, rA: .8, access: .65, signB: 1, signA: 1 }, controls = el('div', { class: 'widget-controls' }, host);
  range(controls, 'Foundation reliability rB', state.rB, 0, 1, .01, v => { state.rB = v; draw(); });
  range(controls, 'Explanation reliability rA', state.rA, 0, 1, .01, v => { state.rA = v; draw(); });
  range(controls, 'Probability of receiving both p', state.access, 0, 1, .01, v => { state.access = v; draw(); }, pct);
  const signalButtons = el('div', { class: 'widget-select' }, controls); el('span', {}, signalButtons, 'Observed signals');
  const b = button(signalButtons, 'S = +1', () => { state.signB *= -1; b.textContent = `S = ${state.signB > 0 ? '+1' : '−1'}`; draw(); });
  const a = button(signalButtons, 'Y = +1', () => { state.signA *= -1; a.textContent = `Y = ${state.signA > 0 ? '+1' : '−1'}`; draw(); });
  const grid = el('div', { class: 'figure-plots' }, host), riskPlot = el('div', { class: 'plot-area' }, grid), posteriorPlot = el('div', { class: 'plot-area' }, grid);
  const output = readout(host);
  caption(host, 'With a target taking values −1 and +1, prediction risk measures mean squared error relative to a prior risk of 1. Observed signals determine the posterior mean, while the pair’s risk remains constant across its four possible realizations.');
  function draw() {
    const risk = learningRisk(state), mean = state.rB * state.rA * state.signB * state.signA;
    const points = Array.from({ length: 51 }, (_, i) => ({ t: i / 50, ...learningRisk({ ...state, access: i / 50 }) }));
    chart(riskPlot, { label: 'Learning risk by probability of receiving both signals', yLabel: 'Prediction risk', xLabel: 'Receipt probability p', xDomain: [0, 1], yDomain: [0, 1.06], cursor: state.access, series: [{ label: 'Access-weighted risk', points, y: p => p.risk, color: C.teal }, { label: 'Answer alone', points, y: p => p.explanationOnlyRisk, color: C.muted, dash: true }], onclick: p => { state.access = p; controls.querySelectorAll('input')[2].value = p; controls.querySelectorAll('output')[2].value = pct(p); draw(); } });
    const { svg, width } = svgBase(posteriorPlot, 225, 'Posterior distribution for the target after both signals');
    tx(svg, 15, 13, 'Posterior after both signals', { class: 'svg-label' });
    const y = 65, left = 24, right = width - 24, center = width / 2, pPlus = (1 + mean) / 2;
    se('rect', { x: left, y, width: (right - left) * (1 - pPlus), height: 34, fill: C.rust, opacity: .72 }, svg); se('rect', { x: left + (right - left) * (1 - pPlus), y, width: (right - left) * pPlus, height: 34, fill: C.teal, opacity: .85 }, svg);
    tx(svg, left, y - 11, 'T = −1'); tx(svg, right, y - 11, 'T = +1', { 'text-anchor': 'end' }); tx(svg, left, y + 55, pct(1 - pPlus), { class: 'svg-number' }); tx(svg, right, y + 55, pct(pPlus), { class: 'svg-number', 'text-anchor': 'end' });
    tx(svg, center, 163, `E[T | S, Y] = ${fmt(mean, 3)}`, { 'text-anchor': 'middle', class: 'svg-number' }); tx(svg, center, 190, `Risk with the pair ${fmt(risk.pairedRisk, 3)}`, { 'text-anchor': 'middle' });
    output([['Answer alone', fmt(risk.explanationOnlyRisk, 3)], ['Both signals', fmt(risk.pairedRisk, 3)], ['With access probability p', fmt(risk.risk, 3)]]);
  }
  watch(grid, draw);
}

function careers(host) {
  title(host, 'A career unfolds over time', 'Boundary-value solution');
  let state = { preset: 'practiceLoss', kappa: DEFAULTS.kappa, horizon: DEFAULTS.horizon }, result, baseline, revision = 0;
  const picker = select(host, 'Selected economy', presetOptions(), state.preset, v => { state.preset = v; state.kappa = paramsFor(v).kappa; training.set(state.kappa); compute(); });
  const controls = el('div', { class: 'widget-controls' }, host);
  const training = range(controls, 'Training cost κ', state.kappa, ...parameterBounds('kappa', [15, 70, 1]), v => { state.kappa = v; schedule(); });
  range(controls, 'Career horizon T', state.horizon, 4, 20, 1, v => { state.horizon = v; schedule(); }, v => `${fmt(v, 0)} periods`);
  const chartGrid = el('div', { class: 'figure-plots' }, host);
  const plots = ['E', 'Delta', 'w', 'T'].map(key => ({ key, host: el('div', { class: 'plot-area' }, chartGrid) }));
  legend(host, [{ label: 'Selected economy', color: C.teal }, { label: 'Human baseline · κ = 30', color: C.muted, dash: true }]);
  const scrub = playback(host, state.horizon, () => draw());
  const track = el('div', { class: 'regime-track', 'aria-label': 'Research method along the selected path' }, host);
  legend(host, [{ label: 'Human research', color: C.teal, square: true }, { label: 'Mixed', color: C.mixed, square: true }, { label: 'Machine / grounded', color: C.rust, square: true }]);
  const output = readout(host), status = el('p', { class: 'figure-status', role: 'status' }, host);
  const diagnostics = el('details', { class: 'figure-diagnostics' }, host); el('summary', {}, diagnostics, 'Numerical conditions'); const diagnosticBody = el('p', {}, diagnostics);
  caption(host, 'Both economies share E(0) = 0.55, A(0) = 1, and the terminal condition Δ(T) = 0, with the human reference retaining κ = 30 as the selected economy changes. Each path solves the coupled career and frontier equations across the full horizon.');
  const schedule = debounce(compute);
  async function compute() {
    const token = ++revision; result = null; baseline = null; scrub.stop(); scrub.setMax(state.horizon); scrub.button.disabled = true;
    status.innerHTML = '<span class="loading-mark" aria-hidden="true"></span>Solving the two boundary problems';
    const options = { ...paramsFor(state.preset), kappa: state.kappa, horizon: state.horizon, steps: 240, E0: DEFAULTS.E0, A0: 1, terminalDelta: 0 };
    try {
      const solved = await Promise.all([solvePath(options), solvePath({ ...paramsFor('baseline'), horizon: state.horizon, steps: 240, E0: DEFAULTS.E0, A0: 1, terminalDelta: 0 })]);
      if (token !== revision) return;
      if (!solved.every(r => r?.ok)) { const failed = solved.find(r => !r?.ok); chartGrid.querySelectorAll('.plot-area').forEach(p => p.replaceChildren()); track.replaceChildren(); status.textContent = `Path unavailable · ${failed?.diagnostics?.message || 'Numerical convergence failed.'}`; diagnosticBody.textContent = JSON.stringify(failed?.diagnostics || {}); output([['Solution', 'Outside the selected feasible region']]); return; }
      [result, baseline] = solved; scrub.button.disabled = false; status.textContent = 'Finite-horizon paths · illustrative numerical economy'; diagnosticBody.textContent = diagnosticText(result); makeRegimeTrack(track, result.points); draw();
    } catch (error) { if (token !== revision) return; status.textContent = `Path unavailable · ${error.message}`; chartGrid.querySelectorAll('.plot-area').forEach(p => p.replaceChildren()); }
  }
  function draw() {
    if (!result?.ok || !baseline?.ok) return;
    const time = scrub.value(), p = nearest(result.points, time), labels = { E: 'Expert share E', Delta: 'Qualification value Δ', w: 'Hourly wage w', T: 'Formal transitions / period' };
    plots.forEach(({ key, host: plot }) => chart(plot, { label: labels[key], yLabel: labels[key], xDomain: [0, state.horizon], cursor: time, zero: key === 'Delta' || key === 'T', yFormat: key === 'E' ? v => `${fmt(100 * v, 0)}%` : v => fmt(v, key === 'T' ? 3 : 2), series: [{ label: 'Selected', points: result.points, y: p => p[key], color: C.teal, format: key === 'E' ? pct : fmt }, { label: 'Baseline', points: baseline.points, y: p => p[key], color: C.muted, dash: true, opacity: .7 }], onclick: t => scrub.set(t) }));
    output([['At time', fmt(time, 1)], ['Expert share', pct(p.E)], ['Study intensity x', fmt(p.x, 3)], ['Training resources', fmt(p.trainingCost, 4)], ['Research', regimeLabel(p.regime)]]);
  }
  watch(chartGrid, draw); compute();
}

function heatmap(host, { label, xLabel, yLabel, xDomain, yDomain, sample, color, selected, onclick, resolution = [40, 28], yFormat = fmt, xFormat = fmt, legendText }) {
  const height = host.clientWidth < 400 ? 295 : 325, { svg, width } = svgBase(host, height, label), margin = { l: 49, r: 16, t: 24, b: 46 }, right = width - margin.r, bottom = height - margin.b;
  const X = x => margin.l + (x - xDomain[0]) / (xDomain[1] - xDomain[0]) * (right - margin.l), Y = y => bottom - (y - yDomain[0]) / (yDomain[1] - yDomain[0]) * (bottom - margin.t);
  const [nx, ny] = resolution;
  for (let ix = 0; ix < nx; ix++) for (let iy = 0; iy < ny; iy++) { const x = xDomain[0] + (ix + .5) / nx * (xDomain[1] - xDomain[0]), y = yDomain[0] + (iy + .5) / ny * (yDomain[1] - yDomain[0]); const value = sample(x, y); se('rect', { x: margin.l + ix / nx * (right - margin.l), y: bottom - (iy + 1) / ny * (bottom - margin.t), width: (right - margin.l) / nx + .3, height: (bottom - margin.t) / ny + .3, fill: color(value), 'data-map-value': typeof value === 'number' ? value : '' }, svg); }
  numberTicks(xDomain[0], xDomain[1], 4).forEach(x => tx(svg, X(x), bottom + 18, xFormat(x), { 'text-anchor': 'middle' }));
  numberTicks(yDomain[0], yDomain[1], 4).forEach(y => tx(svg, margin.l - 8, Y(y) + 4, yFormat(y), { 'text-anchor': 'end' }));
  tx(svg, margin.l, 12, yLabel, { class: 'svg-label' }); tx(svg, right, height - 5, xLabel, { 'text-anchor': 'end' });
  if (selected) { se('line', { x1: X(selected[0]), x2: X(selected[0]), y1: margin.t, y2: bottom, stroke: C.paper, opacity: .75, 'stroke-width': 1 }, svg); se('line', { x1: margin.l, x2: right, y1: Y(selected[1]), y2: Y(selected[1]), stroke: C.paper, opacity: .75, 'stroke-width': 1 }, svg); se('circle', { cx: X(selected[0]), cy: Y(selected[1]), r: 5, class: 'map-pointer' }, svg); }
  const tooltip = el('div', { class: 'plot-tooltip', hidden: '' }, host), surface = se('rect', { x: margin.l, y: margin.t, width: right - margin.l, height: bottom - margin.t, fill: 'transparent', 'aria-label': label }, svg);
  function coords(event) { const r = svg.getBoundingClientRect(), px = (event.clientX - r.left) * width / r.width, py = (event.clientY - r.top) * height / r.height; return { px, py, x: xDomain[0] + clamp((px - margin.l) / (right - margin.l), 0, 1) * (xDomain[1] - xDomain[0]), y: yDomain[0] + clamp((bottom - py) / (bottom - margin.t), 0, 1) * (yDomain[1] - yDomain[0]) }; }
  surface.addEventListener('pointermove', event => { const { px, py, x, y } = coords(event); tooltip.innerHTML = `${esc(xLabel)} <strong>${esc(xFormat(x))}</strong><br>${esc(yLabel)} <strong>${esc(yFormat(y))}</strong><br>${esc(legendText(sample(x, y)))}`; tooltip.hidden = false; tooltip.style.left = `${clamp(px + 10, 0, width - tooltip.offsetWidth - 2)}px`; tooltip.style.top = `${clamp(py - 16, 20, height - tooltip.offsetHeight)}px`; });
  surface.addEventListener('pointerleave', () => { tooltip.hidden = true; }); if (onclick) surface.addEventListener('pointerdown', event => { const { x, y } = coords(event); onclick(x, y); });
  return { svg, X, Y, width, height, margin, right, bottom };
}

function regimes(host) {
  title(host, 'Where research changes hands', 'Frozen-state clearing');
  let state = { E: .55, A: 1.5, machineMultiplier: 1.05, method: 'both' };
  tabs(host, [{ value: 'both', label: 'Competing methods' }, { value: 'human', label: 'Human research' }, { value: 'grounded', label: 'Human grounding' }], state.method, v => { state.method = v; draw(); });
  const controls = el('div', { class: 'widget-controls' }, host);
  const expert = range(controls, 'Expert share E', state.E, .2, .85, .01, v => { state.E = v; draw(); }, pct);
  const machine = range(controls, 'Machine resource multiplier', state.machineMultiplier, .4, 4, .05, v => { state.machineMultiplier = v; draw(); });
  range(controls, 'Frontier A', state.A, 1, 5, .05, v => { state.A = v; draw(); });
  const grid = el('div', { class: 'figure-plots' }, host), map = el('div', { class: 'plot-area' }, grid), clearing = el('div', { class: 'plot-area' }, grid);
  legend(host, [{ label: 'Human', color: C.teal, square: true }, { label: 'Mixed', color: C.mixed, square: true }, { label: 'Machine / grounded', color: C.rust, square: true }, { label: 'Career premium below zero', color: '#ddd8cc', square: true }]);
  const output = readout(host), explain = detail(host);
  caption(host, 'Across the map, inherited expertise and machine resource requirements determine which method receives the research budget, with the selected point linked to its wage-clearing diagram. Within the mixed region, both methods supply research at equal packet costs.');
  function draw() {
    const p = { ...DEFAULTS, ...state }, m = solveMarket(p);
    if (!m.ok) { explain('Allocation unavailable', '', m.diagnostics.message); return; }
    heatmap(map, { label: 'Research regime by expert population and machine resource requirements', xLabel: 'Expert share E', yLabel: 'Machine resource multiplier', xDomain: [.2, .85], yDomain: [.4, 4], selected: [state.E, state.machineMultiplier], sample: (E, machineMultiplier) => solveMarket({ ...p, E, machineMultiplier }), color: value => value.w < p.b ? '#ddd8cc' : regimeColor(value.regime), xFormat: v => pct(v), legendText: value => `${regimeLabel(value.regime)} · ${value.w < p.b ? 'negative career premium' : 'positive career premium'}`, onclick: (E, machineMultiplier) => { state.E = E; state.machineMultiplier = machineMultiplier; expert.set(E); machine.set(machineMultiplier); draw(); } });
    const points = Array.from({ length: 81 }, (_, i) => { const w = Math.max(.05, m.w * .25) + i / 80 * (m.w * 2.05); const DS = m.C * w ** -p.epsilon; let LR; if (p.method === 'grounded') LR = p.BR * m.aG / (p.q * m.aM + w * m.aG); else if (p.method === 'human' || w <= m.wbar) LR = p.BR / (w + p.q * p.xi); else LR = 0; return { t: w, DS, total: DS + LR, supply: state.E }; });
    if (p.method === 'both' && m.wbar > points[0].t && m.wbar < points.at(-1).t) { const DS = m.C * m.wbar ** -p.epsilon; points.push({ t: m.wbar, DS, total: DS + p.BR / (m.wbar + p.q * p.xi), supply: state.E }, { t: m.wbar, DS, total: DS, supply: state.E }); points.sort((a, b) => a.t - b.t); }
    const graph = chart(clearing, { label: 'Expert demand and supply against wage', height: map.clientWidth < 400 ? 295 : 325, yLabel: 'Expert hours / population', xLabel: 'Hourly wage w', xDomain: [points[0].t, points.at(-1).t], yDomain: [0, Math.min(1.6, Math.max(state.E * 1.8, .6))], vertical: m.w, series: [{ label: 'Services', points, y: p => p.DS, color: C.muted }, { label: 'Services + research', points, y: p => p.total, color: C.teal }, { label: 'Expert supply', points, y: p => p.supply, color: C.rust, dash: true }] });
    se('circle', { cx: graph.X(m.w), cy: graph.Y(state.E), r: 4.5, fill: C.ink, stroke: C.paper, 'stroke-width': 2 }, graph.svg);
    output([['Regime', regimeLabel(m.regime)], ['Wage', fmt(m.w, 3)], ['Career premium w − b', fmt(m.w - p.b, 3)], ['Service hours', fmt(m.DS, 3)], ['Research hours', fmt(m.LR, 3)], ['Frontier drift', fmt(m.F, 4)]]);
    const costText = p.method === 'grounded' ? `Grounded packet cost ${fmt(m.kStar, 3)}. Human grounding uses ${fmt(m.aG, 3)} hours per packet.` : `Human packet cost ${fmt(m.kH, 3)}. Machine packet cost ${fmt(m.kM, 3)}. Parity wage ${fmt(m.wbar, 3)}.`;
    explain(regimeLabel(m.regime), `E = Dₛ + Lᵣ = ${fmt(m.DS, 3)} + ${fmt(m.LR, 3)}`, costText + ` Clearing residual ${fmt(m.diagnostics.maxResidual, 7)}.`);
  }
  watch(grid, draw);
}

function welfare(host) {
  title(host, 'Private gains and public value', 'Local preparation margin');
  const market = solveMarket({ ...DEFAULTS, method: 'human', E: DEFAULTS.E0, A: 1 });
  const state = { P: .2, gap: .8, premium: .5, m: .35, e: .45 };
  const controls = el('div', { class: 'widget-controls' }, host);
  range(controls, 'Private gain P', state.P, 0, 1, .01, v => { state.P = v; draw(); });
  range(controls, 'Qualification value gap λ − Δ', state.gap, 0, 2, .02, v => { state.gap = v; draw(); });
  range(controls, 'Research value premium Π − h', state.premium, -1, 3, .02, v => { state.premium = v; draw(); });
  const lost = range(controls, 'Learning lost per case m', state.m, 0, 1, .01, v => { state.m = v; draw(); });
  const released = range(controls, 'Expert hours released e', state.e, 0, 1, .01, v => { state.e = v; draw(); });
  const grid = el('div', { class: 'figure-plots' }, host), map = el('div', { class: 'plot-area' }, grid), flow = el('div', { class: 'plot-area' }, grid);
  legend(host, [{ label: 'Positive public value', color: C.teal, square: true }, { label: 'Negative public value', color: C.rust, square: true }]);
  const output = readout(host);
  caption(host, 'For one local preparation margin at a strict human research corner, supplied continuation values λ and Π determine how lost learning and released time enter public value. Research absorbs the fraction χᵣ of released expert time obtained from the frozen market.');
  function value(m, e) { return localWelfare({ P: state.P, lambda: state.gap + 1, Delta: 1, m, Pi: market.h + state.premium, h: market.h, chiR: market.chiR, e }); }
  function draw() {
    const w = value(state.m, state.e), scale = Math.max(.2, state.gap, Math.abs(state.premium * market.chiR), state.P);
    const graph = heatmap(map, { label: 'Local welfare by learning lost and expert hours released', xLabel: 'Learning lost m', yLabel: 'Expert hours released e', xDomain: [0, 1], yDomain: [0, 1], selected: [state.m, state.e], sample: (m, e) => value(m, e).W, color: v => { const strength = clamp(Math.abs(v) / scale, 0, 1); return `color-mix(in srgb, ${v >= 0 ? C.teal : C.rust} ${8 + strength * 75}%, ${C.paper})`; }, legendText: v => `Local public value ${fmt(v, 3)}`, onclick: (m, e) => { state.m = m; state.e = e; lost.set(m); released.set(e); draw(); } });
    if (state.gap > 0) { const m0 = state.P / state.gap, m1 = (state.P + state.premium * market.chiR) / state.gap; const id = `welfare-clip-${++uid}`; const defs = se('defs', {}, graph.svg), clip = se('clipPath', { id }, defs); se('rect', { x: graph.margin.l, y: graph.margin.t, width: graph.right - graph.margin.l, height: graph.bottom - graph.margin.t }, clip); se('line', { x1: graph.X(m0), y1: graph.Y(0), x2: graph.X(m1), y2: graph.Y(1), stroke: C.ink, 'stroke-width': 1, 'stroke-dasharray': '4 3', 'clip-path': `url(#${id})`, opacity: .65 }, graph.svg); }
    const { svg, width } = svgBase(flow, map.clientWidth < 400 ? 295 : 325, 'Decomposition of the local public value and released expert time');
    tx(svg, 12, 13, 'Per-case value · numeraire units', { class: 'svg-label' });
    const terms = [{ label: 'Private gain', value: w.privateGain, color: C.teal }, { label: 'Learning gap', value: -w.learningCost, color: C.rust }, { label: 'Research value', value: w.researchGain, color: w.researchGain >= 0 ? C.teal : C.rust }, { label: 'Public value', value: w.W, color: C.ink }];
    const max = Math.max(.2, ...terms.map(t => Math.abs(t.value))), start = width * .54, span = width * .31;
    se('line', { x1: start, x2: start, y1: 36, y2: 218, class: 'axis' }, svg);
    terms.forEach((t, i) => { const y = 49 + i * 43, len = t.value / max * span; tx(svg, 12, y + 5, t.label); se('line', { x1: start, x2: start + len, y1: y, y2: y, stroke: t.color, 'stroke-width': 10, opacity: i === 3 ? 1 : .8 }, svg); tx(svg, width - 7, y + 5, fmt(t.value, 3), { 'text-anchor': 'end', class: 'svg-number' }); });
    const by = (map.clientWidth < 400 ? 295 : 325) - 48, research = market.chiR * state.e, service = (1 - market.chiR) * state.e;
    tx(svg, 12, by - 11, 'Released expert hours'); se('rect', { x: 12, y: by, width: (width - 24) * market.chiR, height: 6, fill: C.teal }, svg); se('rect', { x: 12 + (width - 24) * market.chiR, y: by, width: (width - 24) * (1 - market.chiR), height: 6, fill: C.muted, opacity: .45 }, svg); tx(svg, 12, by + 25, `Research ${fmt(research, 3)}`); tx(svg, width - 12, by + 25, `Services ${fmt(service, 3)}`, { 'text-anchor': 'end' });
    output([['Private gain', fmt(w.privateGain, 3)], ['Public value', fmt(w.W, 3)], ['Research absorption χᵣ', pct(market.chiR)], ['Selected case', w.W >= 0 ? 'Positive public value' : 'Negative public value']]);
  }
  watch(grid, draw);
}

function feedback(host) {
  title(host, 'Trace a feedback', 'Local links + solved path');
  const state = { preset: 'mixed', loop: 'career', selected: 'E', edge: null, metric: 'E' }; let result, revision = 0;
  select(host, 'Selected economy', presetOptions(), state.preset, v => { state.preset = v; compute(); });
  const loops = [ { value: 'career', label: 'Career investment' }, { value: 'research', label: 'Research allocation' }, { value: 'machine', label: 'Machine substitution' }, { value: 'all', label: 'Full system' } ];
  tabs(host, loops, state.loop, v => { state.loop = v; state.selected = null; state.edge = null; draw(); });
  const graph = el('div', { class: 'plot-area feedback-graph' }, host), explain = detail(host);
  const scrub = playback(host, DEFAULTS.horizon, () => draw());
  const track = el('div', { class: 'regime-track', 'aria-label': 'Research regimes along the solved path' }, host);
  const lower = el('div', { class: 'figure-select' }, host);
  tabs(lower, [{ value: 'E', label: 'Expertise' }, { value: 'w', label: 'Wage' }, { value: 'A', label: 'Frontier' }], state.metric, v => { state.metric = v; drawPath(); });
  const path = el('div', { class: 'plot-area' }, host), output = readout(host), status = el('p', { class: 'figure-status', role: 'status' }, host);
  caption(host, 'Each node exposes a current value, while each link reports a derivative with its stated variables held fixed. Scrubbing through the complete boundary-value solution connects those local relationships to the changing economy below.');
  const nodes = [
    { id: 'c', title: 'Customer AI', symbol: 'c', field: 'c', note: 'Customer capability follows the frontier through c = κc log(A/A₀).' },
    { id: 'M', title: 'Practice', symbol: 'M', field: 'M', note: 'Diagnostic transitions acquired from customer work per period.' },
    { id: 'DS', title: 'Service demand', symbol: 'Dₛ', field: 'DS', note: 'Professional expert hours used in customer services.' },
    { id: 'E', title: 'Expertise', symbol: 'E', field: 'E', note: 'Inherited expert population share changes through practice, training, and attrition.' },
    { id: 'w', title: 'Hourly wage', symbol: 'w', field: 'w', note: 'Expert services and research jointly determine the clearing wage at the selected inherited states.' },
    { id: 'Delta', title: 'Career value', symbol: 'Δ', field: 'Delta', note: 'Qualification value is solved with the terminal condition Δ(T) = 0.' },
    { id: 'x', title: 'Study intensity', symbol: 'x', field: 'x', note: 'Private formal study satisfies x = Δ/κ for every novice.' },
    { id: 'LR', title: 'Research hours', symbol: 'Lᵣ', field: 'LR', note: 'Expert hours purchased by the research fund from the shared professional market.' },
    { id: 'A', title: 'Frontier', symbol: 'A', field: 'A', note: 'Frontier productivity advances through completed, validated research packets.' },
    { id: 'machine', title: 'Machine input', symbol: 'aₘ', field: 'aM', note: 'Machine computation required for one completed research packet.' },
  ];
  const edges = [
    { id: 'cM', from: 'c', to: 'M', loops: ['research'], negative: true, title: 'Capability and diagnostic work', formula: '∂M/∂c = −practiceDecay · M', value: (p, m) => m.derivatives.practiceC, note: 'Customer portfolio choices fix the practice response to capability.' },
    { id: 'cDS', from: 'c', to: 'DS', loops: ['research'], title: 'Capability and expert demand', formula: '∂Dₛ/∂c = demandGrowth · Dₛ', value: (p, m) => m.derivatives.serviceC, note: 'Holding the hourly wage fixed isolates the service-demand response whose sign follows the selected discovery parameter.' },
    { id: 'ME', from: 'M', to: 'E', loops: ['career', 'research'], title: 'Practice enters expertise', formula: '∂Ė/∂M = 1', value: () => 1, note: 'Current E and individual formal study are held fixed.' },
    { id: 'DSw', from: 'DS', to: 'w', loops: ['research'], title: 'Service demand and wage', formula: '∂w/∂C₀ at fixed E and A', value: (p, m, q) => { const h = q.C0 * .0001; return (solveMarket({ ...q, E: p.E, A: p.A, C0: q.C0 + h }).w - solveMarket({ ...q, E: p.E, A: p.A, C0: q.C0 - h }).w) / (2 * h); }, note: 'Changing the service-demand scale C₀ at the current state yields the displayed numerical derivative.' },
    { id: 'Ew', from: 'E', to: 'w', loops: ['career', 'research', 'machine'], negative: true, title: 'Expert supply and scarcity wage', formula: '∂w/∂E at fixed A and c', value: (p, m) => m.derivatives.wE, note: 'Mixed methods pin the wage at parity while route shares adjust.' },
    { id: 'wD', from: 'w', to: 'Delta', loops: ['career', 'machine'], title: 'Wage and qualification value', formula: '∂Δ̇/∂w', value: () => -1, note: 'Within the forward value equation, the wage coefficient equals −1, while qualification value is solved backward from its terminal condition.' },
    { id: 'Dx', from: 'Delta', to: 'x', loops: ['career', 'machine'], title: 'Value and formal study', formula: '∂x/∂Δ = 1/κ', value: (p, m, q) => 1 / q.kappa, note: 'Individual study follows the private return to qualification under quadratic teaching costs.' },
    { id: 'xE', from: 'x', to: 'E', loops: ['career', 'machine'], title: 'Formal transitions', formula: '∂Ė/∂x = 1 − E', value: p => 1 - p.E, note: 'Formal transitions among current novices increase the expert population.' },
    { id: 'ELR', from: 'E', to: 'LR', loops: ['research'], title: 'Expertise and research allocation', formula: '∂Lᵣ/∂E at fixed A and c', value: (p, m) => m.derivatives.LRE, note: 'Shared-market clearing divides additional expertise between services and research.' },
    { id: 'EA', from: 'E', to: 'A', loops: ['research'], title: 'Expertise and frontier progress', formula: '∂F/∂E = F · (F_E/F)', value: (p, m) => m.F * m.derivatives.FEoverF, note: 'Clearing the research market gives the frontier response to E, which equals zero inside the mixed region as route substitution preserves total research output.' },
    { id: 'Ac', from: 'A', to: 'c', loops: ['research'], title: 'Frontier and customer capability', formula: 'dc/dA = κc/A', value: (p, m, q) => q.kappaC / p.A, note: 'Customer-use interfaces connect the research frontier to preparation and discovery.' },
    { id: 'Am', from: 'A', to: 'machine', loops: ['machine'], negative: true, title: 'Frontier and machine requirements', formula: 'daₘ/dA from the packet technology', value: (p, m, q) => -q.machineMultiplier * (q.mu * p.A ** (-q.mu - 1) + q.mR * q.zeta * p.A ** (-q.zeta - 1)), note: 'Both machine generation and machine validation enter the packet requirement.' },
    { id: 'mw', from: 'machine', to: 'w', loops: ['machine'], title: 'Machine costs and wage', formula: '∂w/∂machineMultiplier at fixed E and A', value: (p, m, q) => { const h = q.machineMultiplier * .0001; return (solveMarket({ ...q, E: p.E, A: p.A, machineMultiplier: q.machineMultiplier + h }).w - solveMarket({ ...q, E: p.E, A: p.A, machineMultiplier: q.machineMultiplier - h }).w) / (2 * h); }, note: 'Cheaper machines change the wage wherever they alter the marginal research method.' },
  ];
  async function compute() {
    const token = ++revision; result = null; scrub.stop(); scrub.button.disabled = true; graph.replaceChildren(); path.replaceChildren(); status.innerHTML = '<span class="loading-mark" aria-hidden="true"></span>Solving the feedback path';
    try { const solved = await solvePath({ ...paramsFor(state.preset), steps: 240 }); if (token !== revision) return; if (!solved.ok) { status.textContent = `Path unavailable · ${solved.diagnostics?.message || 'Numerical convergence failed.'}`; return; } result = solved; scrub.button.disabled = false; scrub.setMax(result.points.at(-1).t); makeRegimeTrack(track, result.points); status.textContent = diagnosticText(result); draw(); } catch (error) { if (token === revision) status.textContent = `Path unavailable · ${error.message}`; }
  }
  function current() { const p = nearest(result.points, scrub.value()), q = paramsFor(state.preset); if (q.announcementTime !== null && p.t >= q.announcementTime && q.announcedMachineMultiplier !== null) q.machineMultiplier = q.announcedMachineMultiplier; const m = solveMarket({ ...q, E: p.E, A: p.A }); return { p, q, m }; }
  function draw() {
    if (!result?.ok) return;
    const { p, m, q } = current(), mobile = graph.clientWidth < 550, { svg, width } = svgBase(graph, mobile ? 694 : 668, 'Interactive feedback network. Select nodes and links to inspect conditional derivatives.'); svg.setAttribute('role', 'group');
    const nodeW = mobile ? Math.min(128, width * .39) : Math.min(142, width * .25), nodeH = 57;
    const positions = mobile ? { c: [.27, 45], M: [.27, 151], DS: [.73, 151], E: [.27, 268], w: [.73, 268], x: [.27, 388], Delta: [.73, 388], LR: [.73, 507], A: [.27, 622], machine: [.73, 622] } : { c: [.5, 45], M: [.2, 156], DS: [.8, 156], E: [.2, 291], w: [.5, 291], Delta: [.8, 291], x: [.8, 403], LR: [.5, 512], A: [.2, 618], machine: [.8, 618] };
    const nodeById = new Map(nodes.map(n => [n.id, n]));
    const activeEdges = edges.filter(e => state.loop === 'all' || e.loops.includes(state.loop)), activeNodes = new Set(activeEdges.flatMap(e => [e.from, e.to]));
    const neighbor = state.selected ? new Set([state.selected, ...activeEdges.filter(e => e.from === state.selected || e.to === state.selected).flatMap(e => [e.from, e.to])]) : null;
    const defs = se('defs', {}, svg), arrow = `feedback-arrow-${++uid}`, marker = se('marker', { id: arrow, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto' }, defs); se('path', { d: 'M1 1 L8 5 L1 9', fill: 'none', stroke: 'context-stroke', 'stroke-width': 1.4 }, marker);
    const edgeGroup = se('g', { class: 'graph-links' }, svg);
    edges.forEach((edge, i) => {
      const [x1r, y1] = positions[edge.from], [x2r, y2] = positions[edge.to], x1 = x1r * width, x2 = x2r * width;
      let sx, sy, ex, ey, d;
      if (edge.id === 'Ac') { sx = x1 - nodeW / 2; sy = y1; ex = x2 - nodeW / 2; ey = y2; const gutter = 4; d = `M${sx} ${sy} C${gutter} ${sy},${gutter} ${ey},${ex} ${ey}`; }
      else if (edge.id === 'xE') { sx = x1 - nodeW / 2; sy = y1; ex = x2; ey = y2 + nodeH / 2; d = `M${sx} ${sy} Q${x2} ${y1} ${ex} ${ey}`; }
      else if (edge.id === 'mw') { sx = x1 + nodeW / 2; sy = y1; ex = x2 + nodeW / 2; ey = y2; const gutter = width - 4; d = `M${sx} ${sy} C${gutter} ${sy},${gutter} ${ey},${ex} ${ey}`; }
      else if (Math.abs(y2 - y1) < 10) { const direction = x2 > x1 ? 1 : -1; sx = x1 + direction * nodeW / 2; sy = y1; ex = x2 - direction * nodeW / 2; ey = y2; d = `M${sx} ${sy} L${ex} ${ey}`; }
      else { const direction = y2 > y1 ? 1 : -1; sx = x1; sy = y1 + direction * nodeH / 2; ex = x2; ey = y2 - direction * nodeH / 2; d = `M${sx} ${sy} C${sx} ${(sy + ey) / 2},${ex} ${(sy + ey) / 2},${ex} ${ey}`; }
      const active = activeEdges.includes(edge), connected = !state.selected || edge.from === state.selected || edge.to === state.selected, selected = state.edge === edge.id;
      const value = edge.value(p, m, q), negative = finite(value) ? value < 0 : edge.negative;
      se('path', { d, class: `graph-edge${negative ? ' negative' : ''}${!active || !connected ? ' is-muted' : ''}${selected ? ' is-selected' : ''}${active && connected && state.loop !== 'all' && !reducedMotion() ? ' is-active' : ''}`, 'marker-end': `url(#${arrow})` }, edgeGroup);
      if (active) { const hit = se('path', { d, class: 'graph-hit', tabindex: '0', role: 'button', 'aria-label': `${edge.title}. Conditional derivative ${fmt(value, 3)}`, 'aria-pressed': String(selected) }, edgeGroup); const activate = () => { state.edge = edge.id; state.selected = null; draw(); }; hit.addEventListener('click', activate); hit.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } }); }
    });
    const nodeGroup = se('g', { class: 'graph-nodes' }, svg);
    nodes.forEach(n => { const [xr, y] = positions[n.id], x = xr * width, value = n.field === 'aM' ? m.aM : p[n.field]; const g = se('g', { class: `flow-node${state.selected === n.id ? ' is-selected' : ''}${!activeNodes.has(n.id) || neighbor && !neighbor.has(n.id) ? ' is-muted' : ''}`, tabindex: '0', role: 'button', 'aria-label': `${n.title} ${fmt(value, 3)}. ${n.note}`, 'aria-pressed': String(state.selected === n.id) }, nodeGroup); se('rect', { x: x - nodeW / 2, y: y - nodeH / 2, width: nodeW, height: nodeH }, g); tx(g, x, y - 8, n.title, { 'text-anchor': 'middle', class: 'svg-label' }); tx(g, x, y + 13, `${n.symbol}  ${fmt(value, 3)}`, { 'text-anchor': 'middle', class: 'svg-number' }); const activate = () => { state.selected = state.selected === n.id ? null : n.id; state.edge = null; draw(); }; g.addEventListener('click', activate); g.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } }); });
    if (state.edge) { const edge = edges.find(e => e.id === state.edge); explain(edge.title, `${edge.formula} = ${fmt(edge.value(p, m, q), 4)}`, edge.note); }
    else if (state.selected) { const n = nodeById.get(state.selected), value = n.field === 'aM' ? m.aM : p[n.field]; explain(n.title, `${n.symbol} = ${fmt(value, 4)} at t = ${fmt(p.t, 2)}`, n.note); }
    else explain(loops.find(l => l.value === state.loop).label, `t = ${fmt(p.t, 2)} · ${regimeLabel(p.regime)}`, 'Highlighted links connect the selected part of the economy, with each link opening its derivative and the variables held fixed.');
    output([['Current research', regimeLabel(p.regime)], ['Practice / period', fmt(p.M, 3)], ['Formal study x', fmt(p.x, 3)], ['Research hours', fmt(p.LR, 3)]]);
    drawPath();
  }
  function drawPath() { if (!result?.ok) return; const labels = { E: 'Expert population share E', w: 'Hourly wage w', A: 'Frontier A' }; chart(path, { label: labels[state.metric], yLabel: labels[state.metric], xDomain: [0, result.points.at(-1).t], height: 230, cursor: scrub.value(), yFormat: state.metric === 'E' ? pct : fmt, series: [{ label: labels[state.metric], points: result.points, y: p => p[state.metric], color: C.teal, format: state.metric === 'E' ? pct : fmt }], onclick: t => scrub.set(t) }); }
  watch(graph, () => { if (result?.ok) draw(); }); compute();
}

const FEEDBACK_LOOPS = {
  all: { title: 'All connections', kind: 'Complete structure', text: 'Customer decisions change the work reaching a profession, whose career choices and research allocation feed into future capability.' },
  B1: { title: 'Career investment', kind: 'Balancing loop', text: 'Lost practice changes expert supply and scarcity wages, with expected career returns drawing novices into formal study.' },
  B2: { title: 'Learning-credit pricing', kind: 'Local choice margin', text: 'Qualification value enters the credit attached to a diagnostic case, while a binding cash-pay floor limits the discount offered to its customer.' },
  B3: { title: 'Customer progress and research hours', kind: 'Conditional balancing loop', text: 'Customer capability changes practice and service demand, which affect the wages and expert time available to a fixed research budget.' },
  B4: { title: 'Idea difficulty', kind: 'Balancing loop', text: 'Each frontier increment requires more completed research as difficulty rises, reducing progress at a given packet flow.' },
  R1: { title: 'Self-improving research', kind: 'Reinforcing loop', text: 'Improving machine generation and validation raises completed research per dollar, feeding additional progress into research technology.' },
  S: { title: 'Automation and career incentives', kind: 'Transmission chain', text: 'Changing relative research costs moves the parity wage, linking the anticipated machine route to qualification value and private study.' },
};
const FEEDBACK_EDGE_LOOPS = { p1:['B3'],p2:['B3'],p3:['B3'],p4:['B2','B3'],p5:['B2'],p6:['B2'],p7:['B2'],p8:['B3'],p9:['B2','B3'],p10:['B1','B2','B3'],p11:['B1','B2','S'],p12:['B1','S'],p13:['B1','S'],p14:['S'],p15:['B3'],p16:['B3'],p17:['B3'],p18:['B4'],p19:['B4'],p20:['R1','S'],p21:['R1'],p22:['S'] };
const FEEDBACK_NODE_TEXT = {
  c: 'Customer capability determines how much a household or firm can investigate before contacting a professional, linking research progress to the files reaching the profession.',
  prep: 'Preparation relocates reconstruction work to customers. Its displayed index records diagnostic displacement in the chosen numerical portfolio.',
  disc: 'Discovery brings newly recognized problems into professional demand. Its displayed index includes the net service-demand change in the chosen portfolio.',
  cp: 'Competitive provision passes a learning payment through to the customer as a fee discount, with the displayed amount attached to one separate marginal case.',
  m: 'Diagnostic practice counts successful transitions into qualification through received and processed work, measured separately from professional hours.',
  ds: 'Customers purchase expert hours after deciding which tasks to prepare and which services to buy, with the demand schedule responding to the wage.',
  pf: 'Minimum cash compensation limits the learning credit when separate placement charges are excluded from the local case contract.',
  e: 'Expertise grows through diagnostic practice and formal study and declines through obsolescence, with every qualified worker supplying one expert hour.',
  w: 'Services and research jointly clear the market for expert hours, allowing scarcity earnings and the population of experts to move in different directions.',
  wp: 'Equal complete-packet costs define the parity wage at which human and machine research can share a fixed procurement budget.',
  x: 'Novices finance formal study from expected career returns, with quadratic teaching costs giving individual intensity x = Δ/κ.',
  d: 'Qualification value discounts future wage premiums, so anticipated research automation can affect current study before the wage changes.',
  diff: 'Research difficulty measures the completed packets required for another absolute increment of frontier capability.',
  a: 'Frontier capability accumulates completed and validated research, then feeds back into the customer tools used before professional handoff.',
  lr: 'Research purchases expert hours from the shared professional market, with fixed-budget procurement linking its allocation to wages and competing methods.',
  my: 'Machine output measures completed and validated research packets per dollar, with both generation and validation contributing to its frontier elasticity.',
};
const FEEDBACK_DESKTOP = { c:[105,88],prep:[265,88],disc:[425,88],cp:[105,178],m:[265,178],ds:[425,178],pf:[105,304],e:[265,304],w:[425,304],wp:[585,304],x:[265,402],d:[425,402],diff:[105,538],a:[265,538],lr:[425,538],my:[265,632] };
const FEEDBACK_SOURCE_PATHS = {
  p1:[[170,88],[200,88]],p2:[[105,54],[105,35],[425,35],[425,54]],p3:[[425,122],[425,144]],p4:[[265,122],[265,144]],p5:[[170,178],[186,178],[186,108],[200,108]],p6:[[105,270],[105,212]],p7:[[390,436],[390,451],[22,451],[22,178],[40,178]],p8:[[425,212],[425,270]],p9:[[265,212],[265,270]],p10:[[330,304],[360,304]],p11:[[425,338],[425,368]],p12:[[360,402],[330,402]],p13:[[265,368],[265,338]],p14:[[520,290],[490,290]],p15:[[490,320],[505,320],[505,538],[490,538]],p16:[[360,538],[330,538]],p17:[[265,504],[265,484],[11,484],[11,88],[40,88]],p18:[[200,526],[170,526]],p19:[[170,550],[200,550]],p20:[[240,572],[240,598]],p21:[[290,598],[290,572]],p22:[[330,632],[585,632],[585,338]],
};
function feedbackEdgeHTML(edge) {
  const number = finite(edge.value) ? fmt(edge.value, 4) : edge.status === 'undefined' ? 'Undefined at zero' : edge.status;
  const secondary = (edge.secondary || []).filter(v => finite(v.value)).map(v => `<p>${esc(v.label)} <strong>${esc(fmt(v.value, 4))}</strong> ${esc(v.unit || '')}</p>`).join('');
  return `<h4>${esc(edge.title)}</h4><p class="tooltip-measure">${esc(number)} <small>${esc(edge.measure)}</small></p><p class="tooltip-formula">${esc(edge.formula)}</p><p>${esc(edge.conditioning)}</p>${secondary}<p class="tooltip-condition">${esc(edge.basis)}${edge.active ? '' : ' · inactive channel'}</p>`;
}
function drawCompleteFeedbackGraph(host, config) {
  const { state, measurements, baselineMeasurements, animate, onSelect, onHover, onLeave } = config;
  const narrow = host.clientWidth < 640, height = narrow ? 914 : 710;
  const { svg, width } = svgBase(host, height, 'Sixteen economic quantities connected by twenty-two conditional relationships. Nodes and links open their values and formulas.');
  svg.setAttribute('role', 'group');
  const nodeW = narrow ? Math.min(136, width * .39) : 130 * width / 680, nodeH = 68;
  const mobile = {c:[.25,78],prep:[.75,78],cp:[.25,176],disc:[.75,176],m:[.25,274],ds:[.75,274],pf:[.25,410],e:[.75,410],wp:[.25,508],w:[.75,508],x:[.25,606],d:[.75,606],diff:[.25,744],a:[.75,744],my:[.25,842],lr:[.75,842]};
  const pos = Object.fromEntries(FEEDBACK_NODES.map(n => [n.id, narrow ? [mobile[n.id][0]*width,mobile[n.id][1]] : [FEEDBACK_DESKTOP[n.id][0]*width/680,FEEDBACK_DESKTOP[n.id][1]]]));
  const bands = narrow ? [[18,312,'Customer work'],[350,300,'Professional careers'],[688,196,'Research']] : [[16,205,'Customer work'],[244,210,'Professional careers'],[475,200,'Research']];
  bands.forEach(([y,h,label]) => { se('rect',{x:1,y,width:width-2,height:h,rx:12,class:'feedback-band'},svg);tx(svg,14,y+18,label,{class:'feedback-band-label'}); });
  const edges = Object.values(measurements.edges), selectedEdges = edges.filter(e => state.loop==='all' || FEEDBACK_EDGE_LOOPS[e.id].includes(state.loop));
  const selectedIds = new Set(selectedEdges.map(e=>e.id)), selectedNodes = new Set(selectedEdges.flatMap(e=>[e.from,e.to]));
  const maxima = {};
  edges.forEach(e => { if(finite(e.value)) maxima[e.measure] = Math.max(maxima[e.measure]||0,Math.abs(e.value)); });
  const defs = se('defs',{},svg), markerId = `full-feedback-${++uid}`;
  const marker = se('marker',{id:markerId,viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:5,markerHeight:5,orient:'auto'},defs);
  se('path',{d:'M1 1L8 5L1 9',fill:'none',stroke:'context-stroke','stroke-width':1.5},marker);
  const edgeGroup = se('g',{class:'graph-links'},svg), labelGroup = se('g',{},svg), nodeGroup = se('g',{class:'graph-nodes'},svg);
  const tooltip = el('div',{class:'plot-tooltip feedback-tooltip',role:'tooltip',hidden:''},host);
  const edgeElements = new Map(), nodeElements = new Map(), occupied = Object.values(pos).map(([x,y])=>({x:x-nodeW/2-4,y:y-nodeH/2-4,w:nodeW+8,h:nodeH+8}));
  function connected(selection, edge) { return !selection || (selection.type==='edge' ? edge.id===selection.id : edge.from===selection.id || edge.to===selection.id); }
  function highlight(selection) {
    const neighbors = new Set(selection?.type==='node' ? [selection.id] : []);
    edges.filter(e=>connected(selection,e)).forEach(e=>{neighbors.add(e.from);neighbors.add(e.to);});
    edgeElements.forEach((g,id)=>{const edge=measurements.edges[id];g.style.opacity=selectedIds.has(id) && connected(selection,edge) ? (edge.active?1:.45) : .13;});
    nodeElements.forEach((g,id)=>{g.style.opacity=selectedNodes.has(id) && (!selection || neighbors.has(id)) ? 1 : .26;g.classList.toggle('is-selected',selection?.type==='node'&&selection.id===id);});
  }
  function show(selection,event,target) {
    if(selection.type==='edge') tooltip.innerHTML=feedbackEdgeHTML(measurements.edges[selection.id]);
    else {const n=measurements.nodes[selection.id];tooltip.innerHTML=`<h4>${esc(n.title)}</h4><p class="tooltip-measure">${esc(n.symbol)} = ${esc(fmt(n.value,4))}</p><p>${esc(FEEDBACK_NODE_TEXT[n.id])}</p>`;}
    tooltip.hidden=false;
    const rect=host.getBoundingClientRect(),targetRect=target.getBoundingClientRect();
    const x=event?.clientX ? event.clientX-rect.left : targetRect.left-rect.left+targetRect.width/2;
    const y=event?.clientY ? event.clientY-rect.top : targetRect.top-rect.top;
    tooltip.style.left=`${clamp(x+14,5,Math.max(5,width-tooltip.offsetWidth-5))}px`;
    tooltip.style.top=`${clamp(y+16,5,Math.max(5,height-tooltip.offsetHeight-5))}px`;
    highlight(selection);onHover(selection,event);
  }
  function bind(target,selection) {
    target.addEventListener('pointerenter',event=>show(selection,event,target));
    target.addEventListener('pointerleave',()=>{tooltip.hidden=true;highlight(state.selected);onLeave();});
    target.addEventListener('focus',()=>show(selection,null,target));
    target.addEventListener('blur',()=>{tooltip.hidden=true;highlight(state.selected);onLeave();});
    const activate=()=>{state.selected=state.selected?.type===selection.type&&state.selected?.id===selection.id?null:selection;highlight(state.selected);onSelect(state.selected);};
    target.addEventListener('click',activate);
    target.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}});
  }
  function mobilePath(edge,index) {
    const [x1,y1]=pos[edge.from],[x2,y2]=pos[edge.to];
    if(['p7','p17','p22'].includes(edge.id)){const gutter=edge.id==='p17'?width-5:5+(edge.id==='p7'?0:10),sign=gutter>width/2?1:-1;return `M${x1+sign*nodeW/2},${y1}L${gutter},${y1}L${gutter},${y2}L${x2+sign*nodeW/2},${y2}`;}
    if(Math.abs(y2-y1)<2){const sign=x2>x1?1:-1,offset=['p18','p19'].includes(edge.id)?(edge.id==='p18'?-12:12):0;return `M${x1+sign*nodeW/2},${y1+offset}L${x2-sign*nodeW/2},${y2+offset}`;}
    const sign=y2>y1?1:-1,sx=x1,sy=y1+sign*nodeH/2,ex=x2,ey=y2-sign*nodeH/2;
    if(x1===x2&&Math.abs(y2-y1)<110)return `M${sx},${sy}L${ex},${ey}`;
    const lane=width/2+((index%3)-1)*8;
    return `M${sx},${sy}L${sx},${sy+sign*12}L${lane},${sy+sign*12}L${lane},${ey-sign*12}L${ex},${ey-sign*12}L${ex},${ey}`;
  }
  const labelPositions = {p1:[185,88],p2:[260,35],p3:[425,133],p4:[265,133],p5:[186,151],p6:[105,243],p7:[215,451],p8:[425,244],p9:[265,244],p10:[345,304],p11:[425,354],p12:[345,402],p13:[265,354],p14:[505,290],p15:[505,439],p16:[345,538],p17:[11,356],p18:[185,521],p19:[185,555],p20:[240,585],p21:[290,585],p22:[585,504]};
  edges.forEach((edge,index)=>{
    const points=FEEDBACK_SOURCE_PATHS[edge.id];
    const d=narrow?mobilePath(edge,index):points.map(([x,y],i)=>`${i?'L':'M'}${x*width/680},${y}`).join('');
    const g=se('g',{'data-feedback-edge':edge.id},edgeGroup);edgeElements.set(edge.id,g);
    const negative=finite(edge.value)&&edge.value<0,color=negative?C.rust:C.teal;
    const weight=state.view==='strength'&&finite(edge.value)?1+2.4*Math.sqrt(Math.abs(edge.value)/(maxima[edge.measure]||1)):1.5;
    const line=se('path',{d,class:`graph-edge${negative?' negative':''}`,'marker-end':`url(#${markerId})`,style:`stroke-width:${weight};stroke:${color}`},g);
    const hit=se('path',{d,class:'graph-hit',role:'button',tabindex:0,'aria-label':`${edge.title}. ${edge.measure} ${finite(edge.value)?fmt(edge.value,4):edge.status}`},g);
    bind(hit,{type:'edge',id:edge.id});
    if(animate&&selectedIds.has(edge.id)&&edge.active&&!reducedMotion()){
      const dot=se('circle',{r:3.2,fill:color,opacity:0},g);
      se('animateMotion',{path:d,dur:'1.5s',begin:`${(index%6)*.13}s`,repeatCount:2,fill:'freeze'},dot);
      se('animate',{attributeName:'opacity',values:'0;1;1;0',keyTimes:'0;.05;.9;1',dur:'3s',begin:`${(index%6)*.13}s`,fill:'freeze'},dot);
    }
    if(state.view==='strength'&&selectedIds.has(edge.id)){
      const length=line.getTotalLength(),point=line.getPointAtLength(length*.5);
      let [lx,ly]=narrow?[point.x,point.y]:[labelPositions[edge.id][0]*width/680,labelPositions[edge.id][1]];
      const value=finite(edge.value)?fmt(edge.value,2):'n/a',lw=Math.max(34,value.length*7+12),lh=20;
      const box={x:clamp(lx-lw/2,1,width-lw-1),y:ly-lh/2,w:lw,h:lh};
      const overlaps=occupied.some(b=>box.x<b.x+b.w&&box.x+box.w>b.x&&box.y<b.y+b.h&&box.y+box.h>b.y);
      if(!narrow||!overlaps){const label=se('g',{class:'edge-value','data-coefficient':edge.id},labelGroup);se('rect',{x:box.x,y:box.y,width:lw,height:lh,rx:6},label);tx(label,box.x+lw/2,ly+4,value,{'text-anchor':'middle'});occupied.push(box);}
    }
  });
  FEEDBACK_NODES.forEach(n=>{
    const node=measurements.nodes[n.id],[x,y]=pos[n.id];
    const g=se('g',{class:'flow-node','data-feedback-node':n.id,role:'button',tabindex:0,'aria-label':`${node.title}. ${node.symbol} ${fmt(node.value,4)}`},nodeGroup);nodeElements.set(n.id,g);
    se('rect',{x:x-nodeW/2,y:y-nodeH/2,width:nodeW,height:nodeH,rx:10},g);
    tx(g,x,y-11,node.title,{'text-anchor':'middle',class:'svg-label'});
    tx(g,x,y+9,`${node.symbol} ${fmt(node.value,3)}`,{'text-anchor':'middle',class:'feedback-node-value'});
    if(state.view==='shock'){
      const reference=baselineMeasurements?.nodes[n.id]?.value,change=node.value-reference;
      const changeText=finite(change)?Math.abs(reference)>1e-8?`${change>=0?'+':''}${fmt(100*change/Math.abs(reference),1)}%`:`${change>=0?'+':''}${fmt(change,3)}`:'—';
      tx(g,x,y+25,changeText,{'text-anchor':'middle',class:'feedback-node-value',style:`fill:${change<0?C.rust:C.teal}`});
    }
    bind(g,{type:'node',id:n.id});
  });
  highlight(state.selected);
}
function completeFeedback(host) {
  title(host, 'The complete feedback system', '');
  const state = { view:'loops',loop:'all',preset:'mixed',creditMode:'complete',payFloor:.5,practiceDecay:3,demandGrowth:.15,kappa:DEFAULTS.kappa,machineMultiplier:1.05,selected:null,hover:null,time:0 };
  let result, baseline, revision=0, measurements, baselineMeasurements;
  const views = el('div',{class:'feedback-views'},host);
  tabs(views,[{value:'loops',label:'Loops'},{value:'strength',label:'Strength'},{value:'shock',label:'Shock'}],state.view,v=>{state.view=v;shockControls.hidden=v!=='shock';strengthNote.hidden=v!=='strength';compute(v==='shock');});
  const toolbar=el('div',{class:'feedback-toolbar'},host);
  select(toolbar,'Research economy',presetOptions(),state.preset,v=>{state.preset=v;state.machineMultiplier=paramsFor(v).machineMultiplier;machine.set(state.machineMultiplier);compute();});
  select(toolbar,'Learning credit',[{value:'complete',label:'Complete pricing'},{value:'floor',label:'Cash-pay floor'}],state.creditMode,v=>{state.creditMode=v;draw();});
  const loopbar=el('div',{class:'feedback-loopbar','aria-label':'Feedback loops'},host),loopButtons={};
  Object.entries(FEEDBACK_LOOPS).forEach(([id,loop])=>{const b=button(loopbar,'',()=>{state.loop=id;state.selected=null;Object.entries(loopButtons).forEach(([k,v])=>v.setAttribute('aria-pressed',String(k===id)));draw(true);});b.innerHTML=`${id==='all'?'':`<em>${id}</em>`}${esc(loop.title)}`;b.setAttribute('aria-pressed',String(id===state.loop));loopButtons[id]=b;});
  const intro=el('p',{class:'feedback-intro'},host),strengthNote=el('p',{class:'widget-note',hidden:''},host,'Stroke widths compare magnitudes within the same measurement type. Labels distinguish elasticities, marginal derivatives, shares, and choice margins.');
  const caseDetails=el('details',{class:'feedback-parameters'},host);el('summary',{},caseDetails,'Local case and payment terms');
  const caseControls=el('div',{class:'widget-controls'},caseDetails);range(caseControls,'Cash-pay floor s',state.payFloor,0,.95,.01,v=>{state.payFloor=v;draw();});
  el('p',{class:'widget-note'},caseDetails,'The local case uses a basic wage of 1, learning probability 0.25, and preparation saving 0.625. Its payment rule leaves the numerical macro portfolio unchanged.');
  const shockControls=el('div',{class:'feedback-parameters',hidden:''},host),shockGrid=el('div',{class:'widget-controls'},shockControls);
  const schedule=debounce(()=>compute(true),220);
  range(shockGrid,'Practice displacement β',state.practiceDecay,0,4,.1,v=>{state.practiceDecay=v;schedule();});
  range(shockGrid,'Service demand response γ',state.demandGrowth,-.8,.8,.05,v=>{state.demandGrowth=v;schedule();});
  range(shockGrid,'Training cost κ',state.kappa,15,70,1,v=>{state.kappa=v;schedule();});
  const machine=range(shockGrid,'Machine resource multiplier',state.machineMultiplier,.4,4,.05,v=>{state.machineMultiplier=v;schedule();});
  el('p',{class:'widget-note'},shockControls,'Node percentages compare both paths at the same date. Quantities with a zero reference display their absolute change.');
  button(shockControls,'Replay transmission',()=>draw(true));
  const graph=el('div',{class:'plot-area feedback-graph'},host),panel=el('div',{class:'figure-detail feedback-detail','aria-live':'polite'},host);
  const scrub=playback(host,DEFAULTS.horizon,t=>{state.time=t;draw();});
  const track=el('div',{class:'regime-track','aria-label':'Selected research regime through time'},host);
  const output=readout(host),plotGrid=el('div',{class:'figure-plots'},host),plots=['E','Delta','w','A'].map(key=>({key,host:el('div',{class:'plot-area'},plotGrid)}));
  legend(host,[{label:'Selected path',color:C.teal},{label:'Reference economy',color:C.muted,dash:true}]);
  const status=el('p',{class:'figure-status',role:'status'},host);
  caption(host,'All sixteen nodes and twenty-two relationships retain their own measurement and economic conditions. Current market derivatives, stationary career comparisons, and the separate local payment case appear alongside the complete boundary-value paths.');
  function params(shock=false){return {...paramsFor(state.preset),...(shock?{practiceDecay:state.practiceDecay,demandGrowth:state.demandGrowth,kappa:state.kappa,machineMultiplier:state.machineMultiplier}:{}),steps:240};}
  async function compute(animate=false){
    const token=++revision;result=null;baseline=null;scrub.stop();scrub.button.disabled=true;graph.replaceChildren();plotGrid.querySelectorAll('.plot-area').forEach(p=>p.replaceChildren());status.innerHTML='<span class="loading-mark" aria-hidden="true"></span>Solving the complete feedback paths';
    try { const solved=await Promise.all([solvePath(params(state.view==='shock')),solvePath(params(false))]);if(token!==revision)return;
      if(!solved.every(r=>r.ok)){status.textContent=`Path unavailable · ${solved.find(r=>!r.ok)?.diagnostics?.message || 'Numerical convergence failed'}`;panel.replaceChildren();track.replaceChildren();return;}
      [result,baseline]=solved;scrub.button.disabled=false;makeRegimeTrack(track,result.points);status.textContent=diagnosticText(result);if(state.view==='shock'&&state.time===0){state.time=DEFAULTS.horizon*.5;scrub.set(state.time);}draw(animate);
    }catch(error){if(token===revision)status.textContent=`Path unavailable · ${error.message}`;}
  }
  function ledger(path,shock){const point=nearest(path.points,state.time);return feedbackMeasurements({point,points:path.points,parameters:params(shock),creditMode:state.creditMode,payFloor:state.payFloor,caseLearning:.25,caseSaving:.625,caseBasicWage:1});}
  function draw(animate=false){
    if(!result?.ok)return;measurements=ledger(result,state.view==='shock');baselineMeasurements=ledger(baseline,false);if(!measurements.ok){status.textContent=measurements.diagnostics?.message||'Measurement unavailable';return;}
    const loop=FEEDBACK_LOOPS[state.loop];intro.textContent=loop.text;
    drawCompleteFeedbackGraph(graph,{state,measurements,baselineMeasurements,animate,onSelect(selection){state.selected=selection;showDetail(selection,true);},onHover(selection,event){showDetail(selection,false);},onLeave(){showDetail(state.selected,true);}});
    showDetail(state.selected,true);
    output([['Research regime',regimeLabel(measurements.market.regime)],['Time',fmt(nearest(result.points,state.time).t,2)],['Expert share',pct(measurements.nodes.e.value)],['Local credit',fmt(measurements.credit.discount,3)],['Local case choice',measurements.credit.decision]]);
    const labels={E:'Expert share E',Delta:'Qualification value Δ',w:'Hourly wage w',A:'Frontier A'};
    plots.forEach(({key,host:p})=>chart(p,{label:labels[key],yLabel:labels[key],height:225,xDomain:[0,DEFAULTS.horizon],cursor:state.time,yFormat:key==='E'?pct:fmt,series:[{label:'Selected path',points:result.points,y:p=>p[key],color:C.teal},{label:'Reference economy',points:baseline.points,y:p=>p[key],color:C.muted,dash:true}],onclick:t=>scrub.set(t)}));
  }
  function showDetail(selection,persist){
    if(!measurements?.ok)return;
    if(selection?.type==='edge'){const edge=measurements.edges[selection.id];panel.innerHTML=feedbackEdgeHTML(edge);return;}
    if(selection?.type==='node'){const node=measurements.nodes[selection.id],links=Object.values(measurements.edges),incoming=links.filter(e=>e.to===node.id).map(e=>measurements.nodes[e.from].title),outgoing=links.filter(e=>e.from===node.id).map(e=>measurements.nodes[e.to].title);panel.innerHTML=`<h4>${esc(node.title)}</h4><p class="formula">${esc(node.symbol)} = ${esc(fmt(node.value,4))}</p><p>${esc(FEEDBACK_NODE_TEXT[node.id])}</p>${node.subtitle?`<p class="measurement-context">${esc(node.subtitle)}</p>`:''}<p class="measurement-context">Receives ${esc(incoming.join(', ')||'the selected policy input')}. Influences ${esc(outgoing.join(', ')||'the selected state')}.</p>`;return;}
    const loop=FEEDBACK_LOOPS[state.loop];panel.innerHTML=`<h4>${esc(loop.title)}</h4><p>${esc(loop.text)}</p><p class="measurement-context">${esc(loop.kind)} · ${esc(regimeLabel(measurements.market.regime))}</p>`;
  }
  watch(graph,()=>{if(result?.ok)draw();});compute();
}

function growth(host) {
  title(host, 'Production, absorption, and delay', 'Scalar growth comparisons');
  const state = { eta: 1.9, phi: .7, k: .18, absorptionTime: 1.5, delay: 1.5, horizon: 12, log: false }; let result;
  const thresholds = tabs(host, [{ value: 'subcritical', label: 'Subcritical' }, { value: 'critical', label: 'Critical' }, { value: 'supercritical', label: 'Supercritical' }], 'supercritical', key => { state.eta = clamp(state.phi + (key === 'subcritical' ? .5 : key === 'critical' ? 1 : 1.6), .3, 3); productivity.set(state.eta); compute(); });
  const controls = el('div', { class: 'widget-controls' }, host);
  const productivity = range(controls, 'Research exponent η', state.eta, .3, 3, .05, v => { state.eta = v; compute(); });
  range(controls, 'Difficulty exponent φ', state.phi, 0, 2, .05, v => { state.phi = v; compute(); });
  range(controls, 'Absorption time ε', state.absorptionTime, .25, 4, .25, v => { state.absorptionTime = v; compute(); }, v => `${fmt(v)} periods`);
  range(controls, 'Minimum research duration τ', state.delay, .25, 4, .25, v => { state.delay = v; compute(); }, v => `${fmt(v)} periods`);
  const display = el('div', { class: 'widget-tabs' }, host), logButton = button(display, 'Logarithmic axes', () => { state.log = !state.log; logButton.setAttribute('aria-pressed', String(state.log)); draw(); }); logButton.setAttribute('aria-pressed', 'false');
  const grid = el('div', { class: 'figure-plots' }, host), timePlot = el('div', { class: 'plot-area' }, grid), phasePlot = el('div', { class: 'plot-area' }, grid);
  legend(host, [{ label: 'Pure power', color: C.muted, dash: true }, { label: 'Gradual absorption', color: C.teal }, { label: 'Fixed delay', color: C.rust }]);
  const scrub = playback(host, state.horizon, () => draw()), output = readout(host), status = el('p', { class: 'figure-status', role: 'status' }, host);
  const diagnostics = el('details', { class: 'figure-diagnostics' }, host); el('summary', {}, diagnostics, 'Growth equations and numerical conditions'); const text = el('p', {}, diagnostics);
  caption(host, 'All paths begin at A(0) = 1 with k = 0.18. Pure power uses its analytic solution. Absorption adds εḂ = A − B and uses B in research. Fixed delay uses A(t − τ), with constant history before time zero.');
  function compute() { result = growthPaths({ ...state, A0: 1, steps: 600 }); if (!result.ok) { status.textContent = result.diagnostics?.message || 'Growth comparison unavailable'; timePlot.replaceChildren(); phasePlot.replaceChildren(); return; } thresholds.set(result.class); draw(); }
  function draw() {
    if (!result?.ok) return;
    const transform = v => finite(v) && v > 0 ? state.log ? Math.log10(v) : v : null;
    const keys = [{ key: 'power', label: 'Pure power', color: C.muted, dash: true }, { key: 'absorption', label: 'Absorption', color: C.teal }, { key: 'delay', label: 'Fixed delay', color: C.rust }];
    const points = result.points.map((p, i, all) => { const left = all[Math.max(0, i - 1)], right = all[Math.min(all.length - 1, i + 1)]; const out = { ...p }; for (const { key } of keys) out[`${key}Rate`] = finite(left[key]) && finite(right[key]) && right.t > left.t ? (right[key] - left[key]) / (right.t - left.t) : null; return out; });
    const available = points.flatMap(p => keys.map(({ key }) => p[key])).filter(finite), largest = Math.max(...available), normalBound = !state.log && largest > 80 ? 80 : null;
    const series = keys.map(s => ({ label: s.label, color: s.color, dash: s.dash, points, y: p => transform(p[s.key]) }));
    chart(timePlot, { label: 'Frontier trajectories through time', yLabel: state.log ? 'Frontier · log₁₀ A' : 'Frontier A', xDomain: [0, state.horizon], ...(normalBound ? { yDomain: [0, normalBound] } : {}), height: 260, cursor: scrub.value(), vertical: result.powerDivergenceTime, series, onclick: t => scrub.set(t) });
    const phaseSeries = keys.map(s => ({ label: s.label, color: s.color, dash: s.dash, points, x: p => transform(p[s.key]), y: p => transform(p[`${s.key}Rate`]) }));
    chart(phasePlot, { label: 'Frontier growth rates against the frontier', yLabel: state.log ? 'Growth rate · log₁₀ Ȧ' : 'Growth rate Ȧ / period', xLabel: state.log ? 'Frontier · log₁₀ A' : 'Frontier A', height: 260, cursor: scrub.value(), phase: true, ...(normalBound ? { xDomain: [0, 80], yDomain: [0, 30] } : {}), series: phaseSeries });
    const selected = nearest(points, scrub.value()), beta = state.eta - state.phi;
    output([['Net exponent η − φ', fmt(beta)], ['Pure power', finite(selected.power) ? fmt(selected.power, 3) : 'Beyond divergence'], ['Absorption', fmt(selected.absorption, 3)], ['Fixed delay', fmt(selected.delay, 3)]]);
    const divergence = finite(result.powerDivergenceTime) ? `Pure-power divergence at t = ${fmt(result.powerDivergenceTime, 2)}.` : `Pure-power growth is ${beta === 1 ? 'exponential' : 'global'}.`;
    const warnings = (result.diagnostics.warnings || []).filter(w => w.code !== 'analytic-divergence').map(w => w.message).join(' ');
    status.textContent = `${divergence}${normalBound ? ' Large values extend beyond the linear display and remain visible with logarithmic axes.' : ''}${warnings ? ` ${warnings}` : ''}`;
    text.textContent = `Ȧ = kA^(η−φ). Absorption uses Ȧ = kB^η/A^φ and εḂ = A−B. Fixed delay uses Ȧ = kA(t−τ)^η/A^φ. Phase rates use centered differences along the solved paths. ${JSON.stringify(result.diagnostics)}`;
  }
  watch(grid, draw); compute();
}

const WIDGETS = { handoff, learning, careers, regimes, welfare, feedback: completeFeedback, growth };
export function mountWidgets(root = document) { root.querySelectorAll('[data-widget]').forEach(host => { const build = WIDGETS[host.dataset.widget]; if (!build || host.dataset.mounted) return; host.dataset.mounted = 'true'; host.classList.add('interactive'); host.replaceChildren(); try { build(host); } catch (error) { el('p', { class: 'figure-status', role: 'status' }, host, `Figure unavailable · ${error.message}`); console.error('Interactive figure', host.dataset.widget, error); } }); }

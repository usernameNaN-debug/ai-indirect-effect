import { DEFAULTS, PARAMETER_RANGES, PRESETS, solveMarket, solveBoundaryPath, learningRisk, localWelfare, growthPaths } from './model.js';
import { mountFeedback } from './feedback-ui.js';

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
function title(host, heading, kind) { const row = el('div', { class: 'figure-heading' }, host); el('h3', {}, row, heading); el('span', { class: 'figure-kind' }, row, kind); }
function caption(host, html) { const p = el('p', { class: 'figure-caption' }, host); p.innerHTML = html; return p; }
function range(host, label, value, min, max, step, fn, format = fmt) {
  const id=`widget-number-${++uid}`,box=el('div',{class:'widget-control'},host);
  el('label',{for:id},box,label);const stepper=el('div',{class:'number-stepper'},box),minus=button(stepper,'−',()=>commit(+input.value-step)),input=el('input',{type:'number',id,min,max,step,value,inputmode:'decimal','aria-label':label},stepper),plus=button(stepper,'+',()=>commit(+input.value+step));
  minus.setAttribute('aria-label',`Decrease ${label}`);plus.setAttribute('aria-label',`Increase ${label}`);const output=el('output',{for:id,class:'number-formatted'},box);
  const precision=Math.max(0,(String(step).split('.')[1]||'').length),normalize=v=>Number(clamp(+v,min,max).toFixed(precision));
  const update=v=>{const next=normalize(v);input.value=next;output.value=format(next);output.hidden=String(format(next))===String(next);input.setAttribute('aria-valuetext',String(format(next)));minus.disabled=next<=min;plus.disabled=next>=max;};
  function commit(v){if(!finite(v))v=value;value=normalize(v);update(value);fn(value);}
  input.addEventListener('input',()=>{const v=input.valueAsNumber;if(finite(v)&&v>=min&&v<=max){value=v;output.value=format(v);fn(v);}});input.addEventListener('change',()=>commit(input.valueAsNumber));update(value);
  return {input,output,set:update,box};
}
function select(host, label, options, selected, fn) { const id = `widget-select-${++uid}`; const wrap = el('div', { class: 'widget-select' }, host); el('label', { for: id }, wrap, label); const input = el('select', { id, 'aria-label': label }, wrap); options.forEach(o => el('option', { value: o.value }, input, o.label)); input.value = selected; input.addEventListener('change', () => fn(input.value)); return input; }
function tabs(host, options, value, fn) { const wrap = el('div', { class: 'widget-tabs', role: 'group' }, host); const buttons = options.map(o => { const button = el('button', { type: 'button', 'aria-pressed': String(o.value === value) }, wrap, o.label); button.addEventListener('click', () => { buttons.forEach(([b, key]) => b.setAttribute('aria-pressed', String(key === o.value))); fn(o.value); }); return [button, o.value]; }); return { wrap, set(v) { buttons.forEach(([b, key]) => b.setAttribute('aria-pressed', String(key === v))); } }; }
function legend(host, series) { const box = el('div', { class: 'figure-legend' }, host); series.forEach(s => { const item = el('span', {}, box); const line = el('i', { class: s.square ? 'legend-square' : 'legend-line', style: `color:${s.color};${s.dash ? 'border-top-style:dashed' : ''}` }, item); line.setAttribute('aria-hidden', 'true'); item.append(document.createTextNode(s.label)); }); return box; }
function readout(host) { const box = el('div', { class: 'figure-readout', 'aria-live': 'polite', 'aria-atomic': 'true' }, host); return values => { box.innerHTML = values.map(([l, v]) => `<span>${esc(l)}<strong>${esc(v)}</strong></span>`).join(''); }; }
function detail(host) { const box = el('div', { class: 'figure-detail', 'aria-live': 'polite' }, host); return (head, formula, body) => { box.innerHTML = `<h4>${esc(head)}</h4>${formula ? `<p class="formula">${esc(formula)}</p>` : ''}<p>${esc(body)}</p>`; }; }
function button(host, text, fn) { const b = el('button', { type: 'button' }, host, text); b.addEventListener('click', fn); return b; }
function playback(host, max, onchange) {
  const box=el('div',{class:'figure-playback'},host);let t=0,playing=false,frame=0,previous=0,lastDraw=0,inView=false,armed=false,autoPlayed=false;
  const b=button(box,'Play',()=>playing?stop():play());b.classList.add('primary-play');b.setAttribute('aria-label','Play time path');
  const restart=button(box,'Restart',()=>{stop();set(0);play();});restart.classList.add('restart-play');
  const clock=el('output',{class:'playback-time','aria-label':'Current model time'},box);const update=()=>{clock.value=`t ${fmt(t,1)} / ${fmt(max,0)}`;};
  function set(v){t=clamp(v,0,max);update();onchange(t);}
  function stop(){playing=false;cancelAnimationFrame(frame);b.textContent='Play';b.setAttribute('aria-label','Play time path');}
  function play(){if(b.disabled)return;if(t>=max)t=0;playing=true;previous=0;lastDraw=0;b.textContent='Pause';b.setAttribute('aria-label','Pause time path');frame=requestAnimationFrame(tick);}
  function tick(now){if(!playing||!document.contains(host))return;if(!inView||document.hidden){stop();return;}if(previous)t=Math.min(max,t+(now-previous)/1000*max/10);previous=now;if(now-lastDraw>(reducedMotion()?240:45)||t>=max){update();onchange(t);lastDraw=now;}if(t>=max){stop();return;}frame=requestAnimationFrame(tick);}
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(!inView&&playing)stop();else if(inView&&armed&&!autoPlayed&&!reducedMotion()){autoPlayed=true;play();}},{threshold:.12});observer.observe(host);update();
  host.addEventListener('pointerover',event=>{if(playing&&event.target.closest('.plot-area'))stop();});
  host.addEventListener('focusin',event=>{if(playing&&event.target.closest('.plot-area'))stop();});
  return {setMax(v){max=v;t=Math.min(t,max);update();},set,value:()=>t,stop,button:b,autoplay(){armed=true;if(inView&&!autoPlayed&&!reducedMotion()){autoPlayed=true;play();}},box};
}
function inViewOnce(host,fn){let done=false;const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!done){done=true;observer.disconnect();if(!reducedMotion())fn();}},{threshold:.2});observer.observe(host);}
function settings(host,label='Numerical settings'){const section=el('details',{class:'figure-settings'},host);el('summary',{},section,label);return el('div',{class:'widget-controls'},section);}
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
  if (config.onclick) surface.addEventListener('pointerdown', event => { const r = svg.getBoundingClientRect(); config.onclick(xd[0] + clamp(((event.clientX - r.left) * width / r.width - margin.l) / (right - margin.l), 0, 1) * (xd[1] - xd[0])); });
  return { svg, X, Y, width, height, margin, right, bottom };
}
function nearest(points, t) { return nearestBy(points, t, p => p.t); }
function nearestBy(points, x, fn) { let result, delta = Infinity; for (const p of points) { const d = Math.abs(fn(p) - x); if (finite(d) && d < delta) { delta = d; result = p; } } return result; }
function interpolateValue(points, x, getX, getY) { if (!points.length) return null; for (let i = 1; i < points.length; i++) { const a = points[i - 1], b = points[i], xa = getX(a), xb = getX(b); if (finite(xa) && finite(xb) && x >= Math.min(xa, xb) && x <= Math.max(xa, xb)) { const ya = getY(a), yb = getY(b); if (!finite(ya) || !finite(yb)) return null; return xb === xa ? yb : ya + (yb - ya) * (x - xa) / (xb - xa); } } const p = nearestBy(points, x, getX); return p && finite(getY(p)) ? getY(p) : null; }
function regimeColor(r) { return /mix/i.test(r) ? C.mixed : /machine|auto|ground/i.test(r) ? C.rust : C.teal; }
function regimeFill(r) { return /mix/i.test(r) ? C.mixed : /machine|auto|ground/i.test(r) ? C.machineFill : C.humanFill; }
function regimeLabel(r) { return /mix/i.test(r) ? 'Mixed methods' : /ground/i.test(r) ? 'Grounded machine' : /machine|auto/i.test(r) ? 'Machine research' : 'Human research'; }
function presetOptions() { return Object.entries(PRESETS).map(([value, p]) => ({ value, label: p.label })); }
function paramsFor(key) { return { ...DEFAULTS, ...(PRESETS[key]?.options || {}) }; }
function parameterBounds(key, fallback) { const r = PARAMETER_RANGES[key]; return r ? [r.min, r.max, r.step] : fallback; }
function makeRegimeTrack(host, points) { host.replaceChildren(); if (!points.length) return; let runs = []; points.forEach(p => { if (!runs.length || runs.at(-1).regime !== p.regime) runs.push({ regime: p.regime, n: 1 }); else runs.at(-1).n++; }); runs.forEach(run => el('span', { style: `width:${run.n / points.length * 100}%;background:${regimeColor(run.regime)}`, title: regimeLabel(run.regime) }, host)); }
let worker, workerId = 0; const pending = new Map();
function solvePath(options) { return new Promise((resolve, reject) => { try { if (!worker && window.Worker) { worker = new Worker(new URL('./model-worker.js', import.meta.url), { type: 'module' }); worker.addEventListener('message', event => { const job = pending.get(event.data.id); if (job) { pending.delete(event.data.id); event.data.error ? job.reject(new Error(event.data.error)) : job.resolve(event.data.result); } }); worker.addEventListener('error', event => { for (const job of pending.values()) job.reject(new Error(event.message)); pending.clear(); worker.terminate(); worker = null; }); } if (worker) { const id = ++workerId; pending.set(id, { resolve, reject }); worker.postMessage({ id, type: 'path', options }); } else setTimeout(() => { try { resolve(solveBoundaryPath(options)); } catch (error) { reject(error); } }, 0); } catch (error) { reject(error); } }); }
function debounce(fn, delay = 180) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }
function diagnosticText(result) { const d = result.diagnostics || {}; return `${d.converged === false ? 'Unconverged' : 'Converged'} · ${d.iterations ?? '—'} iterations · equation residual ${fmt(d.maxResidual, 6)} · boundary residual ${fmt(d.boundaryResidual, 6)}`; }
function tax(host) {
  title(host,'Filing a return','');
  const state={scenario:'organized',reasoning:'worked'},owners={organized:['home','home','professional','professional'],draft:['home','home','home','professional']},baseline=['home','professional','professional','professional'];
  let previous=baseline;
  const choices=el('div',{class:'tax-choices'},host);
  tabs(choices,[{value:'organized',label:'Organized records'},{value:'draft',label:'Drafted tax analysis'}],state.scenario,v=>{state.scenario=v;draw(true);});
  const plot=el('div',{class:'plot-area tax-allocation'},host);
  const under=el('div',{class:'tax-under'},host);
  tabs(under,[{value:'worked',label:'Reasoning retained'},{value:'answer',label:'Final answer only'}],state.reasoning,v=>{state.reasoning=v;draw(true);});
  const replay=button(under,'Replay transfer',()=>{previous=baseline;draw(true);});replay.classList.add('primary-play');
  const takeaway=el('p',{class:'tax-takeaway','aria-live':'polite'},host);
  const tasks=[{lines:['Gather','records'],label:'Gather records',description:'Statements and receipts provide the source records for the return.'},{lines:['Reconcile','entries'],label:'Reconcile entries',description:'Reconciliation matches records, resolves duplicates, and explains discrepancies.'},{lines:['Resolve','tax treatment'],label:'Resolve tax treatment',description:'Tax analysis connects the relevant rules to the case and preserves the reasoning behind the treatment.'},{lines:['Review','& file'],label:'Review and file',description:'Professional review verifies the treatment and checks the complete return before filing.'}];
  function draw(animate=false){
    const small=plot.clientWidth<560,{svg,width}=svgBase(plot,small?386:352,'Four tax-return tasks, with and without customer AI. Customer preparation changes task ownership while professional review remains.');
    const left=small?2:17,right=width-(small?2:17),gap=small?7:18,column=(right-left-gap*3)/4,ys=[112,246],current=owners[state.scenario];
    tx(svg,left,20,'Without customer AI',{class:'svg-label'});tx(svg,left,167,'With customer AI',{class:'svg-label'});
    const connector=se('line',{x1:left,x2:right,y1:194,y2:194,stroke:C.line,'stroke-width':1},svg);
    tasks.forEach((task,i)=>{
      const x=left+i*(column+gap),center=x+column/2;
      task.lines.forEach((line,j)=>tx(svg,center,54+j*16,line,{'text-anchor':'middle',class:'tax-task-label'}));
      [baseline,current].forEach((row,rowIndex)=>{
        const owner=row[i],y=ys[rowIndex],professional=owner==='professional',g=se('g',{'data-tax-task':`${rowIndex}-${i}`},svg),fill=professional?C.humanFill:C.quiet,stroke=professional?C.teal:C.muted;
        const block=se('rect',{x,y:y-23,width:column,height:46,rx:8,fill,stroke:professional?'none':'#e3e3e3'},g);
        tx(g,center,y+5,professional?'Paid work':'At home',{'text-anchor':'middle',fill:professional?C.teal:C.muted,class:'tax-owner'});
        if(rowIndex===1&&owner!==baseline[i]){se('path',{d:`M${center} ${y-55}v22m-4-5 4 5 4-5`,fill:'none',stroke:C.rust,'stroke-width':1.3},svg);}
        markTooltip(plot,svg,g,`${task.label} · ${professional?'professional':'customer'}`,task.description+(rowIndex===1&&owner!==baseline[i]?' Customer AI moves this preparation into the household.':''));
        if(animate&&rowIndex===1&&previous[i]!==owner&&!reducedMotion()){g.animate([{transform:'translateY(-60px)',opacity:.35},{transform:'translateY(0)',opacity:1}],{duration:650,delay:i*95,easing:'cubic-bezier(.2,.65,.3,1)'});block.animate([{fill:previous[i]==='professional'?C.humanFill:C.quiet},{fill}],{duration:650,delay:i*95,easing:'ease-out'});}
      });
    });
    const reasonY=small?331:317,worked=state.reasoning==='worked',reasonText=worked?'Records + calculations + reasoning':'Final figures',learnText=worked?'Junior follows the reconstruction':'Junior sees the submitted answer';
    se('line',{x1:left,x2:right,y1:290,y2:290,stroke:C.line},svg);
    tx(svg,left,reasonY-14,reasonText,{class:'svg-label',fill:worked?C.teal:C.muted});
    if(small){tx(svg,left,reasonY+13,learnText,{class:'svg-label'});}else{se('path',{d:`M${width*.48} ${reasonY-18}h${width*.07}m-5-4 5 4-5 4`,fill:'none',stroke:worked?C.teal:C.muted,'stroke-dasharray':worked?'':'3 3'},svg);tx(svg,right,reasonY-14,learnText,{'text-anchor':'end',class:'svg-label'});}
    previous=[...current];
    takeaway.textContent=state.scenario==='draft'?'Customer AI prepares the reconciliation and an initial tax analysis. Professional time shifts toward checking the treatment and completing the return.':'Customer AI organizes and reconciles the records before handoff. Professional work begins with the tax treatment and final review.';
  }
  watch(plot,()=>draw());inViewOnce(plot,()=>{previous=baseline;draw(true);});
}

function learning(host) {
  title(host, 'Learning from records', 'Binary experiment');
  const state = { rB: .8, rA: .8, access: .65, signB: 1, signA: 1 };
  const cases={worked:1,occasional:.65,answer:0};tabs(host,[{value:'worked',label:'Worked case retained'},{value:'occasional',label:'Occasional access'},{value:'answer',label:'Answer only'}],'occasional',v=>{state.access=cases[v];receipt.set(state.access);draw();});
  const controls=settings(host,'Signal and access settings');
  range(controls, 'Foundation reliability rB', state.rB, 0, 1, .01, v => { state.rB = v; draw(); });
  range(controls, 'Explanation reliability rA', state.rA, 0, 1, .01, v => { state.rA = v; draw(); });
  const receipt=range(controls, 'Probability of receiving both p', state.access, 0, 1, .01, v => { state.access = v; draw(); }, pct);
  const signalButtons = el('div', { class: 'widget-select' }, controls); el('span', {}, signalButtons, 'Observed signals');
  const b = button(signalButtons, 'S = +1', () => { state.signB *= -1; b.textContent = `S = ${state.signB > 0 ? '+1' : '−1'}`; draw(); });
  const a = button(signalButtons, 'Y = +1', () => { state.signA *= -1; a.textContent = `Y = ${state.signA > 0 ? '+1' : '−1'}`; draw(); });
  const grid = el('div', { class: 'figure-plots' }, host), riskPlot = el('div', { class: 'plot-area' }, grid), posteriorPlot = el('div', { class: 'plot-area' }, grid);
  const output = readout(host);
  caption(host, 'With a target taking values −1 and +1, prediction risk measures mean squared error relative to a prior risk of 1. Observed signals determine the posterior mean, while the pair’s risk remains constant across its four possible realizations.');
  function draw() {
    const risk = learningRisk(state), mean = state.rB * state.rA * state.signB * state.signA;
    const points = Array.from({ length: 51 }, (_, i) => ({ t: i / 50, ...learningRisk({ ...state, access: i / 50 }) }));
    chart(riskPlot, { label: 'Learning risk by probability of receiving both signals', yLabel: 'Prediction risk', xLabel: 'Receipt probability p', xDomain: [0, 1], yDomain: [0, 1.06], cursor: state.access, series: [{ label: 'Access-weighted risk', points, y: p => p.risk, color: C.teal }, { label: 'Answer alone', points, y: p => p.explanationOnlyRisk, color: C.muted, dash: true }], onclick: p => { state.access = p; receipt.set(p); draw(); } });
    const { svg, width } = svgBase(posteriorPlot, 225, 'Posterior distribution for the target after both signals');
    tx(svg, 15, 13, 'Posterior after both signals', { class: 'svg-label' });
    const y = 65, left = 24, right = width - 24, center = width / 2, pPlus = (1 + mean) / 2;
    const minusBar=se('rect', { x: left, y, width: (right - left) * (1 - pPlus), height: 34, fill: C.machineFill }, svg),plusBar=se('rect', { x: left + (right - left) * (1 - pPlus), y, width: (right - left) * pPlus, height: 34, fill: C.humanFill }, svg);
    markTooltip(posteriorPlot,svg,minusBar,'Posterior probability T = −1',`${pct(1-pPlus)} after both observed signals.`);markTooltip(posteriorPlot,svg,plusBar,'Posterior probability T = +1',`${pct(pPlus)} after both observed signals.`);
    tx(svg, left, y - 11, 'T = −1'); tx(svg, right, y - 11, 'T = +1', { 'text-anchor': 'end' }); tx(svg, left, y + 55, pct(1 - pPlus), { class: 'svg-number' }); tx(svg, right, y + 55, pct(pPlus), { class: 'svg-number', 'text-anchor': 'end' });
    tx(svg, center, 163, `E[T | S, Y] = ${fmt(mean, 3)}`, { 'text-anchor': 'middle', class: 'svg-number' }); tx(svg, center, 190, `Risk with the pair ${fmt(risk.pairedRisk, 3)}`, { 'text-anchor': 'middle' });
    output([['Answer alone', fmt(risk.explanationOnlyRisk, 3)], ['Both signals', fmt(risk.pairedRisk, 3)], ['With access probability p', fmt(risk.risk, 3)]]);
  }
  watch(grid, draw);
}

function careers(host) {
  title(host, 'Careers over time', 'Boundary-value solution');
  let state = { preset: 'practiceLoss', kappa: DEFAULTS.kappa, horizon: DEFAULTS.horizon }, result, baseline, revision = 0;
  const picker = select(host, 'Selected economy', presetOptions(), state.preset, v => { state.preset = v; state.kappa = paramsFor(v).kappa; training.set(state.kappa); compute(); });
  const controls = settings(host,'Career settings');
  const training = range(controls, 'Training cost κ', state.kappa, ...parameterBounds('kappa', [15, 70, 1]), v => { state.kappa = v; schedule(); });
  range(controls, 'Career horizon T', state.horizon, 4, 20, 1, v => { state.horizon = v; schedule(); }, v => `${fmt(v, 0)} periods`);
  const chartGrid = el('div', { class: 'figure-plots' }, host);
  const plots = ['E', 'Delta', 'w', 'T'].map(key => ({ key, host: el('div', { class: 'plot-area' }, chartGrid) }));
  legend(host, [{ label: 'Selected economy', color: C.teal }, { label: 'Human baseline · κ = 30', color: C.muted, dash: true }]);
  const flowPlot=el('div',{class:'plot-area qualification-flow'},host);
  legend(host,[{label:'Qualifications from practice',color:C.blue,square:true},{label:'Qualifications from formal study',color:C.machineFill,square:true}]);
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
      [result, baseline] = solved; scrub.button.disabled = false; status.textContent = ''; diagnosticBody.textContent = diagnosticText(result); makeRegimeTrack(track, result.points); draw();scrub.autoplay();
    } catch (error) { if (token !== revision) return; status.textContent = `Path unavailable · ${error.message}`; chartGrid.querySelectorAll('.plot-area').forEach(p => p.replaceChildren()); }
  }
  function draw() {
    if (!result?.ok || !baseline?.ok) return;
    const time = scrub.value(), p = nearest(result.points, time), labels = { E: 'Expert share E', Delta: 'Qualification value Δ', w: 'Hourly wage w', T: 'Formal transitions / period' };
    plots.forEach(({ key, host: plot }) => chart(plot, { label: labels[key], yLabel: labels[key], xDomain: [0, state.horizon], cursor: time, zero: key === 'Delta' || key === 'T', yFormat: key === 'E' ? v => `${fmt(100 * v, 0)}%` : v => fmt(v, key === 'T' ? 3 : 2), series: [{ label: 'Selected', points: result.points, y: p => p[key], color: C.teal, format: key === 'E' ? pct : fmt }, { label: 'Baseline', points: baseline.points, y: p => p[key], color: C.muted, dash: true, opacity: .7 }], onclick: t => scrub.set(t) }));
    qualificationFlow(flowPlot,result.points,time,t=>scrub.set(t));
    output([['At time', fmt(time, 1)], ['Expert share', pct(p.E)], ['Study intensity x', fmt(p.x, 3)], ['Training resources', fmt(p.trainingCost, 4)], ['Research', regimeLabel(p.regime)]]);
  }
  watch(chartGrid, draw); compute();
}

function qualificationFlow(host,points,time,onTime){
  const max=Math.max(...points.map(p=>p.M+p.T))*1.15;
  const plot=chart(host,{label:'New qualifications from practice and formal study',yLabel:'New qualifications / period',height:245,xDomain:[0,points.at(-1).t],yDomain:[0,max],cursor:time,series:[{label:'Practice',points,y:p=>p.M,color:C.blue},{label:'Formal study',points,y:p=>p.T,color:C.rust,hideLine:true},{label:'Total entry',points,y:p=>p.M+p.T,color:C.teal}],onclick:onTime});
  const {svg,X,Y}=plot,curves=svg.querySelector('g[clip-path]');
  const boundary=fn=>points.map((p,i)=>`${i?'L':'M'}${X(p.t)},${Y(fn(p))}`).join('');
  const practice=boundary(p=>p.M)+`L${X(points.at(-1).t)},${Y(0)}L${X(points[0].t)},${Y(0)}Z`;
  const formal=boundary(p=>p.M+p.T)+[...points].reverse().map(p=>`L${X(p.t)},${Y(p.M)}`).join('')+'Z';
  const a=se('path',{d:practice,fill:C.humanFill,opacity:.9}),b=se('path',{d:formal,fill:C.machineFill,opacity:.8});curves.prepend(b);curves.prepend(a);
  const direct=nearest(points,points.at(-1).t*.64);tx(svg,X(direct.t),Y(direct.M/2)+4,'Practice',{fill:C.teal,'text-anchor':'middle'});
  if(Y(direct.M)-Y(direct.M+direct.T)>23)tx(svg,X(direct.t),Y(direct.M+direct.T/2)+4,'Formal study',{fill:C.rust,'text-anchor':'middle'});
}

function heatmap(host, { label, xLabel, yLabel, xDomain, yDomain, sample, color, selected, onclick, resolution = [40, 28], yFormat = fmt, xFormat = fmt, legendText, regionLabel }) {
  const height = host.clientWidth < 400 ? 295 : 325, { svg, width } = svgBase(host, height, label), margin = { l: 49, r: 16, t: 24, b: 46 }, right = width - margin.r, bottom = height - margin.b;
  const X = x => margin.l + (x - xDomain[0]) / (xDomain[1] - xDomain[0]) * (right - margin.l), Y = y => bottom - (y - yDomain[0]) / (yDomain[1] - yDomain[0]) * (bottom - margin.t);
  const [nx, ny] = resolution,regions=new Map();
  for (let ix = 0; ix < nx; ix++) for (let iy = 0; iy < ny; iy++) { const x = xDomain[0] + (ix + .5) / nx * (xDomain[1] - xDomain[0]), y = yDomain[0] + (iy + .5) / ny * (yDomain[1] - yDomain[0]); const value = sample(x, y); se('rect', { x: margin.l + ix / nx * (right - margin.l), y: bottom - (iy + 1) / ny * (bottom - margin.t), width: (right - margin.l) / nx + .3, height: (bottom - margin.t) / ny + .3, fill: color(value), 'data-map-value': typeof value === 'number' ? value : '' }, svg);if(regionLabel){const key=regionLabel(value);if(key){const group=regions.get(key)||{x:0,y:0,n:0};group.x+=x;group.y+=y;group.n++;regions.set(key,group);}} }
  if(regionLabel)regions.forEach((r,key)=>{const x=r.x/r.n,y=r.y/r.n;if(r.n>30&&regionLabel(sample(x,y))===key)tx(svg,X(x),Y(y)+4,key,{'text-anchor':'middle',fill:C.ink,style:'paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round'});});
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
  title(host, 'Research allocation', 'Frozen-state clearing');
  let state = { E: .55, A: 1.5, machineMultiplier: 1.05, method: 'both' };
  tabs(host, [{ value: 'both', label: 'Competing methods' }, { value: 'human', label: 'Human research' }, { value: 'grounded', label: 'Human grounding' }], state.method, v => { state.method = v; draw(); });
  const controls = settings(host,'Market settings');
  const expert = range(controls, 'Expert share E', state.E, .2, .85, .01, v => { state.E = v; draw(); }, pct);
  const machine = range(controls, 'Machine resource multiplier', state.machineMultiplier, .4, 4, .05, v => { state.machineMultiplier = v; draw(); });
  const frontier = range(controls, 'Frontier A', state.A, 1, 5, .05, v => { stopSweep(); state.A = v; draw(); });
  const sweepRow=el('div',{class:'figure-playback'},host);let sweepFrame=0,sweeping=false,sweepStart=0,lastSweep=0;
  const sweepButton=button(sweepRow,'Animate frontier',()=>sweeping?stopSweep():startSweep());sweepButton.classList.add('primary-play');
  const sweepOutput=el('output',{class:'playback-time'},sweepRow);
  function stopSweep(){sweeping=false;cancelAnimationFrame(sweepFrame);sweepButton.textContent='Animate frontier';}
  function startSweep(){sweeping=true;sweepStart=0;lastSweep=0;sweepButton.textContent='Pause';sweepFrame=requestAnimationFrame(sweep);}
  function sweep(now){if(!sweeping)return;if(document.hidden){stopSweep();return;}if(!sweepStart)sweepStart=now;const progress=Math.min(1,(now-sweepStart)/9000);if(now-lastSweep>100||progress===1){state.A=1+4*progress;frontier.set(state.A);draw();lastSweep=now;}if(progress===1)stopSweep();else sweepFrame=requestAnimationFrame(sweep);}
  const grid = el('div', { class: 'figure-plots' }, host), map = el('div', { class: 'plot-area' }, grid), clearing = el('div', { class: 'plot-area' }, grid);
  legend(host, [{ label: 'Human', color: C.humanFill, square: true }, { label: 'Mixed', color: C.mixed, square: true }, { label: 'Machine / grounded', color: C.machineFill, square: true }, { label: 'Career premium below zero', color: '#e8e8e8', square: true }]);
  const output = readout(host), explain = detail(host);
  caption(host, 'Across the map, inherited expertise and machine resource requirements determine which method receives the research budget, with the selected point linked to its wage-clearing diagram. Within the mixed region, both methods supply research at equal packet costs.');
  function draw() {
    const p = { ...DEFAULTS, ...state }, m = solveMarket(p);
    if (!m.ok) { explain('Allocation unavailable', '', m.diagnostics.message); return; }
    sweepOutput.value=`Frontier A ${fmt(state.A,2)}`;
    heatmap(map, { label: 'Research regime by expert population and machine resource requirements', xLabel: 'Expert share E', yLabel: 'Machine resource multiplier', xDomain: [.2, .85], yDomain: [.4, 4], selected: [state.E, state.machineMultiplier], sample: (E, machineMultiplier) => solveMarket({ ...p, E, machineMultiplier }), color: value => value.w < p.b ? '#e8e8e8' : regimeFill(value.regime),regionLabel:value=>value.w<p.b?'':value.regime==='human'?'Human':value.regime==='mixed'?'Mixed':value.regime==='grounded'?'Grounded':'Machine', xFormat: v => pct(v), legendText: value => `${regimeLabel(value.regime)} · ${value.w < p.b ? 'negative career premium' : 'positive career premium'}`, onclick: (E, machineMultiplier) => { state.E = E; state.machineMultiplier = machineMultiplier; expert.set(E); machine.set(machineMultiplier); draw(); } });
    const points = Array.from({ length: 81 }, (_, i) => { const w = Math.max(.05, m.w * .25) + i / 80 * (m.w * 2.05); const DS = m.C * w ** -p.epsilon; let LR; if (p.method === 'grounded') LR = p.BR * m.aG / (p.q * m.aM + w * m.aG); else if (p.method === 'human' || w <= m.wbar) LR = p.BR / (w + p.q * p.xi); else LR = 0; return { t: w, DS, total: DS + LR, supply: state.E }; });
    if (p.method === 'both' && m.wbar > points[0].t && m.wbar < points.at(-1).t) { const DS = m.C * m.wbar ** -p.epsilon; points.push({ t: m.wbar, DS, total: DS + p.BR / (m.wbar + p.q * p.xi), supply: state.E }, { t: m.wbar, DS, total: DS, supply: state.E }); points.sort((a, b) => a.t - b.t); }
    const graph = chart(clearing, { label: 'Expert demand and supply against wage', height: map.clientWidth < 400 ? 295 : 325, yLabel: 'Expert hours / population', xLabel: 'Hourly wage w', xDomain: [points[0].t, points.at(-1).t], yDomain: [0, Math.min(1.6, Math.max(state.E * 1.8, .6))], vertical: m.w, series: [{ label: 'Services', points, y: p => p.DS, color: C.muted }, { label: 'Services + research', points, y: p => p.total, color: C.teal }, { label: 'Expert supply', points, y: p => p.supply, color: C.rust, dash: true }] });
    se('circle', { cx: graph.X(m.w), cy: graph.Y(state.E), r: 4.5, fill: C.ink, stroke: C.paper, 'stroke-width': 2 }, graph.svg);
    output([['Regime', regimeLabel(m.regime)], ['Wage', fmt(m.w, 3)], ['Career premium w − b', fmt(m.w - p.b, 3)], ['Service hours', fmt(m.DS, 3)], ['Research hours', fmt(m.LR, 3)], ['Frontier drift', fmt(m.F, 4)]]);
    const costText = p.method === 'grounded' ? `Grounded packet cost ${fmt(m.kStar, 3)}. Human grounding uses ${fmt(m.aG, 3)} hours per packet.` : `Human packet cost ${fmt(m.kH, 3)}. Machine packet cost ${fmt(m.kM, 3)}. Parity wage ${fmt(m.wbar, 3)}.`;
    explain(regimeLabel(m.regime), `E = Dₛ + Lᵣ = ${fmt(m.DS, 3)} + ${fmt(m.LR, 3)}`, costText);
  }
  host.addEventListener('pointerover',event=>{if(sweeping&&event.target.closest('.plot-area'))stopSweep();});
  host.addEventListener('focusin',event=>{if(sweeping&&event.target.closest('.plot-area'))stopSweep();});
  watch(grid, draw);inViewOnce(grid,startSweep);
}

function welfare(host) {
  title(host, 'Private and public value', 'Local preparation margin');
  const market = solveMarket({ ...DEFAULTS, method: 'human', E: DEFAULTS.E0, A: 1 });
  const state = { P: .2, gap: .8, premium: .5, m: .35, e: .45 };
  const controls = settings(host,'Local value settings');
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
    const max = Math.max(.2, ...terms.map(t => Math.abs(t.value))), start = width * .60, span = width * .20;
    se('line', { x1: start, x2: start, y1: 36, y2: 218, class: 'axis' }, svg);
    terms.forEach((t, i) => { const y = 49 + i * 43, len = t.value / max * span; tx(svg, 12, y + 5, t.label); se('line', { x1: start, x2: start + len, y1: y, y2: y, stroke: t.color, 'stroke-width': 10, opacity: i === 3 ? 1 : .8 }, svg); tx(svg, width - 7, y + 5, fmt(t.value, 3), { 'text-anchor': 'end', class: 'svg-number' }); });
    const by = (map.clientWidth < 400 ? 295 : 325) - 48, research = market.chiR * state.e, service = (1 - market.chiR) * state.e;
    tx(svg, 12, by - 11, 'Released expert hours'); se('rect', { x: 12, y: by, width: (width - 24) * market.chiR, height: 6, fill: C.teal }, svg); se('rect', { x: 12 + (width - 24) * market.chiR, y: by, width: (width - 24) * (1 - market.chiR), height: 6, fill: C.muted, opacity: .45 }, svg); tx(svg, 12, by + 25, `Research ${fmt(research, 3)}`); tx(svg, width - 12, by + 25, `Services ${fmt(service, 3)}`, { 'text-anchor': 'end' });
    output([['Private gain', fmt(w.privateGain, 3)], ['Public value', fmt(w.W, 3)], ['Research absorption χᵣ', pct(market.chiR)], ['Selected case', w.W >= 0 ? 'Positive public value' : 'Negative public value']]);
  }
  watch(grid, draw);
}
function growth(host) {
  title(host, 'Growth and delay', 'Scalar growth comparisons');
  const state = { eta: 1.9, phi: .7, k: .18, absorptionTime: 1.5, delay: 1.5, horizon: 12, log: false }; let result;
  const thresholds = tabs(host, [{ value: 'subcritical', label: 'Subcritical' }, { value: 'critical', label: 'Critical' }, { value: 'supercritical', label: 'Supercritical' }], 'supercritical', key => { state.eta = clamp(state.phi + (key === 'subcritical' ? .5 : key === 'critical' ? 1 : 1.6), .3, 3); productivity.set(state.eta); compute(); });
  const controls = settings(host,'Growth settings');
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
  function compute() { result = growthPaths({ ...state, A0: 1, steps: 600 }); if (!result.ok) { status.textContent = result.diagnostics?.message || 'Growth comparison unavailable'; timePlot.replaceChildren(); phasePlot.replaceChildren(); return; } thresholds.set(result.class); draw();scrub.autoplay(); }
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

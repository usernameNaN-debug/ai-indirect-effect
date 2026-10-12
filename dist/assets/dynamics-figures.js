import { DEFAULTS, PRESETS, solveBoundaryPath } from './model.js';

// Four complementary views of the same finite-horizon equilibrium. All plotted
// observations are retained; a zero percentage denominator is explicitly masked.
const C = { blue:'#0F4D92', mid:'#3775BA', rose:'#B64342', soft:'#B4C0E4', pink:'#E4CCD8', ink:'#383C43', muted:'#767A80' };
const jobs = new Map(), cache = new Map();
let worker, jobId = 0, figureId = 0;
function solved(options) {
  const p = { ...DEFAULTS, ...options }, key = JSON.stringify(Object.entries(p).sort(([a],[b])=>a.localeCompare(b)));
  if (!cache.has(key)) cache.set(key, new Promise((resolve,reject)=>{
    const finish = result => result.ok ? resolve(result) : reject(new Error(result.diagnostics.message));
    if (typeof Worker === 'undefined') { setTimeout(()=>finish(solveBoundaryPath(p)),0); return; }
    if (!worker) {
      worker = new Worker(new URL('./model-worker.js',import.meta.url),{type:'module'});
      worker.addEventListener('message',({data})=>{ const job=jobs.get(data.id); if(job) { jobs.delete(data.id); job.finish(data.result); } });
      worker.addEventListener('error',event=>{ for(const job of jobs.values()) job.reject(new Error(event.message)); jobs.clear(); worker.terminate(); worker=null; });
    }
    const id=++jobId; jobs.set(id,{finish,reject}); worker.postMessage({id,type:'path',options:p});
  }));
  return cache.get(key);
}

export function responseData(base, changed, fields=['E','w','Delta','A']) {
  if(base.length!==changed.length || base.some((p,i)=>p.t!==changed[i].t)) throw new Error('Response paths require the same observation times.');
  return fields.map(key=>({key,cells:base.map((p,i)=>({ t:p.t, base:p[key], changed:changed[i][key], percent:p[key]===0?null:100*(changed[i][key]-p[key])/p[key] }))}));
}
export function valuationKernel(points,{rho,delta}) {
  const cumulative=new Float64Array(points.length);
  for(let i=1;i<points.length;i++) {
    const dt=points[i].t-points[i-1].t;
    if(!(dt>0)) throw new Error('Kernel observation times must increase.');
    cumulative[i]=cumulative[i-1]+dt*(rho+delta+(points[i-1].x+points[i].x)/2);
  }
  return { cumulative, at:(i,j)=>j<i?null:Math.exp(-(cumulative[j]-cumulative[i])) };
}

const node=(tag,cls,text)=>{ const n=document.createElement(tag); if(cls)n.className=cls; if(text!==undefined)n.textContent=text; return n; };
const svgNode=(tag,attrs={},text)=>{ const n=document.createElementNS('http://www.w3.org/2000/svg',tag); for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v); if(text!==undefined)n.textContent=text; return n; };
const add=(parent,tag,attrs,text)=>{ const n=svgNode(tag,attrs,text); parent.append(n); return n; };
const label=(p,x,y,t,attrs={})=>add(p,'text',{x,y,...attrs},t);
const line=(p,x1,y1,x2,y2,attrs={})=>add(p,'line',{x1,y1,x2,y2,class:'dyn-axis',...attrs});
const fmt=(v,d=3)=>v.toFixed(d), clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const percent=(v,d=1)=>{const n=Number(v.toFixed(d));return `${n>0?'+':''}${(n===0?0:n).toFixed(d)}%`;};
const scale=(a,b,c,d)=>v=>c+(v-a)*(d-c)/(b-a);
const path=(points,x,y)=>points.map((p,i)=>`${i?'L':'M'}${x(p,i).toFixed(2)},${y(p,i).toFixed(2)}`).join('');
const area=(points,x,low,high)=>path(points,x,high)+path([...points].reverse(),x,low).replace('M','L')+'Z';
const tickTimes=(T)=>[0,T/3,2*T/3,T];
function axes(s,b,xDomain,yDomain,xTitle,yTitle) {
  const x=scale(...xDomain,b.x,b.x+b.w), y=scale(...yDomain,b.y+b.h,b.y);
  line(s,b.x,b.y+b.h,b.x+b.w,b.y+b.h); line(s,b.x,b.y,b.x,b.y+b.h);
  for(const v of tickTimes(xDomain[1]-xDomain[0]).map(v=>v+xDomain[0])) {
    const z=x(v); line(s,z,b.y+b.h,z,b.y+b.h+4); label(s,z,b.y+b.h+21,fmt(v,xDomain[1]<=1?2:0),{'text-anchor':'middle'});
  }
  for(let i=0;i<3;i++) {
    const v=yDomain[0]+i*(yDomain[1]-yDomain[0])/2, z=y(v);
    line(s,b.x-4,z,b.x,z); label(s,b.x-9,z+4,fmt(v,yDomain[1]<=1?2:1),{'text-anchor':'end'});
  }
  label(s,b.x,b.y-12,yTitle,{class:'dyn-axis-title'});
  label(s,b.x+b.w/2,b.y+b.h+43,xTitle,{'text-anchor':'middle',class:'dyn-axis-title'});
  return {x,y};
}
function clip(s,id,b) { const d=add(s,'defs'), c=add(d,'clipPath',{id}); return add(c,'rect',{x:b.x,y:b.y,width:b.w,height:b.h}); }
function guide(s,b) { return line(s,b.x,b.y,b.x,b.y+b.h,{class:'dyn-guide'}); }
function placeGuide(g,x,b) { g.setAttribute('x1',x);g.setAttribute('x2',x);g.setAttribute('y1',b.y);g.setAttribute('y2',b.y+b.h); }
function mix(hex,a) { const n=parseInt(hex.slice(1),16); return `rgb(${[16,8,0].map(k=>Math.round(255+( (n>>k&255)-255)*clamp(a))).join(',')})`; }
function timeIndex(points,f) { const t=points.at(-1).t*clamp(f); let lo=0,hi=points.length-1; while(lo<hi){ const m=(lo+hi)>>1; if(points[m].t<t)lo=m+1;else hi=m; } return lo>0&&t-points[lo-1].t<points[lo].t-t?lo-1:lo; }
function colorbar(s,id,x,y,w,max,diverging=false) {
  const d=add(s,'defs'), g=add(d,'linearGradient',{id});
  for(const [offset,color] of (diverging?[[0,C.rose],[.5,'#fff'],[1,C.blue]]:[[0,'#fff'],[1,C.blue]]))add(g,'stop',{offset,'stop-color':color});
  add(s,'rect',{x,y,width:w,height:7,fill:`url(#${id})`,stroke:'#D6DAE0','stroke-width':.5});
  label(s,x,y-6,diverging?`−${fmt(max,1)}%`:'0');label(s,x+w,y-6,diverging?`+${fmt(max,1)}%`:'1',{'text-anchor':'end'});
  if(diverging)label(s,x+w/2,y-6,'0',{'text-anchor':'middle'});
}

function shell(host,title,caption) {
  host.classList.add('dynamic-figure');
  const figure=node('figure','dyn-figure'), heading=node('div','dyn-heading'), h=node('h3','',title), button=node('button','dyn-pause','Pause');
  button.type='button';button.setAttribute('aria-label',`Pause animation: ${title}`);button.setAttribute('aria-pressed','false');heading.append(h,button);
  const plot=node('div','dyn-plot'), svg=svgNode('svg',{role:'img',tabindex:0,'aria-label':`${title}. Move across the plot or use arrow keys to inspect model values.`});
  plot.append(svg); const readout=node('div','dyn-readout','Solving the equilibrium…');
  readout.setAttribute('aria-live','off');const cap=node('figcaption','dyn-caption',caption);
  figure.append(heading,plot,readout,cap);host.replaceChildren(figure);
  return {host,figure,heading,button,plot,svg,readout,cap,id:`dyn-${++figureId}`};
}
function run(view,build) {
  let scene,frame=0,visible=false,paused=false,hover=null,fraction=.06,last=0,rendered=-1;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'), duration=15000;
  function draw(){ if(scene)scene.paint(fraction,hover,reduced.matches); }
  function step(now) {
    frame=0; if(!visible||paused||hover||document.hidden||reduced.matches){last=0;return;}
    if(last)fraction=(fraction+(now-last)/duration)%1;last=now;
    const f=fraction;if(f!==rendered){scene.paint(f,null,false);rendered=f;}
    frame=requestAnimationFrame(step);
  }
  function wake(){ if(!frame&&visible&&!paused&&!hover&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(step); }
  function rebuild() { const w=Math.max(300,Math.round(view.plot.clientWidth));view.svg.replaceChildren();scene=build(w);view.svg.setAttribute('viewBox',`0 0 ${w} ${scene.height}`);view.svg.style.height=`${scene.height}px`;draw();wake(); }
  const resize=new ResizeObserver(rebuild);resize.observe(view.plot);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;last=0;}},{threshold:.06});observer.observe(view.host);
  view.svg.addEventListener('pointermove',event=>{
    const r=view.svg.getBoundingClientRect(), box=view.svg.viewBox.baseVal, x=(event.clientX-r.left)*box.width/r.width,y=(event.clientY-r.top)*box.height/r.height;
    hover=scene.inspect(x,y,fraction);fraction=hover.fraction;last=0;draw();
  });
  view.svg.addEventListener('pointerleave',()=>{hover=null;last=0;wake();});
  view.svg.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();fraction=event.key==='Home'?0:event.key==='End'?1:clamp(fraction+(event.key==='ArrowRight'?.025:-.025));hover={fraction};draw();});
  view.svg.addEventListener('blur',()=>{hover=null;wake();});
  view.button.addEventListener('click',()=>{paused=!paused;view.button.textContent=paused?'Play':'Pause';view.button.setAttribute('aria-pressed',String(paused));view.button.setAttribute('aria-label',`${paused?'Play':'Pause'} animation`);last=0;wake();});
  function motion(){view.button.hidden=reduced.matches;fraction=reduced.matches?.4:fraction;draw();wake();}
  reduced.addEventListener('change',motion);document.addEventListener('visibilitychange',()=>{last=0;wake();});motion();rebuild();
  return rebuild;
}

async function careerPhase(host) {
  const view=shell(host,'Career paths','Expectations change the value of qualification before the workforce can adjust. Following expertise and career value together shows how lost practice and anticipated machine improvements send the profession along different paths through time.');
  const specs=[['baseline','Human research',C.muted],['practiceLoss','Practice loss',C.rose],['announcement','Announcement',C.blue]];
  const paths=await Promise.all(specs.map(async([key,name,color])=>({name,color,...await solved(PRESETS[key].options)})));
  run(view,w=>{
    const s=view.svg,mobile=w<530,b={x:49,y:mobile?76:46,w:w-(mobile?71:190),h:mobile?185:205}, all=paths.flatMap(p=>p.points), xmin=Math.min(...all.map(p=>p.E))-.01,ymax=Math.max(...all.map(p=>p.Delta))*1.12;
    const {x,y}=axes(s,b,[xmin,.555],[0,ymax],'Expert share E','Qualification value Δ');
    const strokes=paths.map((p,k)=>{
      const d=path(p.points,v=>x(v.E),v=>y(v.Delta));add(s,'path',{d,fill:'none',stroke:p.color,'stroke-width':1.4,opacity:.18});
      const trail=add(s,'path',{d,fill:'none',stroke:p.color,'stroke-width':8,opacity:.11,pathLength:1,'stroke-linecap':'round'});
      const stroke=add(s,'path',{d,fill:'none',stroke:p.color,'stroke-width':k===2?2.6:2,pathLength:1,'stroke-dasharray':1,'stroke-linecap':'round'});
      const first=p.points[0],ly=mobile?18:b.y+[57,17,107][k],lx=mobile?(k+.5)*w/3:b.x+b.w+12,anchor=mobile?'middle':'start';
      if(!mobile)line(s,x(first.E),y(first.Delta),lx-5,ly-4,{stroke:p.color,'stroke-width':.8,class:'dyn-leader'});
      label(s,lx,ly,p.name,{fill:p.color,class:'dyn-direct','text-anchor':anchor});
      label(s,lx,ly+17,`Δ₀ = ${fmt(first.Delta,2)}`,{class:'dyn-value','text-anchor':anchor});
      const end=p.points.at(-1);line(s,x(end.E),y(0)-4,x(end.E),y(0)+4,{stroke:p.color,'stroke-width':2,class:'dyn-leader'});
      const lengths=[0];for(let i=1;i<p.points.length;i++){const a=p.points[i-1],q=p.points[i];lengths.push(lengths.at(-1)+Math.hypot(x(q.E)-x(a.E),y(q.Delta)-y(a.Delta)));}
      return {stroke,trail,lengths,total:lengths.at(-1)};
    });
    label(s,mobile?b.x:b.x+b.w+12,b.y+b.h+(mobile?42:-8),'t = 12',{class:'dyn-note'});
    if(!mobile)label(s,b.x+b.w+12,b.y+b.h+8,'Δ(T) = 0',{class:'dyn-note'});
    const ann=paths[2].points.find(p=>p.t===4);line(s,x(ann.E)-4,y(ann.Delta)-4,x(ann.E)+4,y(ann.Delta)+4,{stroke:C.blue,'stroke-width':1.5,class:'dyn-leader'});
    label(s,x(ann.E)-9,y(ann.Delta)+18,'t = 4',{'text-anchor':'end',fill:C.blue});
    const cross=line(s,b.x,b.y,b.x,b.y+b.h,{class:'dyn-guide',opacity:0});
    return {height:mobile?319:309,paint(f,h,reduced){
      const i=timeIndex(paths[0].points,f);strokes.forEach((r,k)=>{const q=reduced?1:r.lengths[i]/r.total,a=Math.max(0,q-.17);r.stroke.setAttribute('stroke-dashoffset',1-q);r.trail.setAttribute('stroke-dasharray',`0 ${a} ${q-a} 1`);});
      const selected=paths[h?.series??2],p=selected.points[i];cross.setAttribute('opacity',h?.65:0);placeGuide(cross,x(p.E),b);
      view.readout.textContent=`t = ${fmt(p.t,2)} · ${selected.name} · E = ${fmt(p.E)} · Δ = ${fmt(p.Delta)} · wage = ${fmt(p.w)}`;
    },inspect(px,py){let best={distance:Infinity,fraction:0,series:0};paths.forEach((p,k)=>p.points.forEach(q=>{const d=Math.hypot(x(q.E)-px,y(q.Delta)-py);if(d<best.distance)best={distance:d,fraction:q.t/12,series:k};}));return best;}};
  });
}

async function responseMap(host) {
  const view=shell(host,'Adjustment across time','Changes in practice, demand, and research costs reach expertise, wages, career value, and frontier productivity at different times. Color intensity reveals where each response grows or fades as the economy adjusts to a shared change.');
  const baseOptions={...DEFAULTS,...PRESETS.mixed.options}, scenarios=[['Practice loss',{practiceDecay:3}],['New services',{demandGrowth:.55}],['Cheaper machines',{machineMultiplier:.55}]];
  const tabs=node('div','dyn-tabs');view.heading.after(tabs);
  const results=await Promise.all([solved(baseOptions),...scenarios.map(([,p])=>solved({...baseOptions,...p}))]);
  const baseline=results[0], points=baseline.points, T=points.at(-1).t;
  let selected=0,rebuild;
  scenarios.forEach(([name],i)=>{const button=node('button','',name);button.type='button';button.setAttribute('aria-pressed',String(i===0));button.addEventListener('click',()=>{selected=i;for(const [j,b] of [...tabs.children].entries())b.setAttribute('aria-pressed',String(i===j));rebuild();});tabs.append(button);});
  rebuild=run(view,w=>{
    const s=view.svg,rows=responseData(points,results[selected+1].points), max=Math.max(...rows.flatMap(r=>r.cells.map(c=>Math.abs(c.percent??0))))||1;
    const b={x:82,y:52,w:w-147,h:167},x=scale(0,T,b.x,b.x+b.w),rh=b.h/4,defs=add(s,'defs');
    const mask=add(defs,'pattern',{id:`${view.id}-mask`,width:4,height:4,patternUnits:'userSpaceOnUse'});add(mask,'rect',{width:4,height:4,fill:'#fff'});line(mask,0,4,4,0,{stroke:'#767A80',class:'dyn-leader'});
    colorbar(s,`${view.id}-scale`,b.x,24,Math.min(210,b.w),max,true);
    const full=add(s,'g'),names=['Experts E','Wage w','Value Δ','Frontier A'], readouts=[];
    rows.forEach((row,r)=>{
      label(s,b.x-10,b.y+r*rh+rh/2+4,names[r],{'text-anchor':'end',class:'dyn-row-label'});
      readouts.push(label(s,b.x+b.w+9,b.y+r*rh+rh/2+4,'',{class:'dyn-live-value'}));
      row.cells.forEach((c,i)=>{ const lo=i? (c.t+row.cells[i-1].t)/2:0,hi=i<row.cells.length-1?(c.t+row.cells[i+1].t)/2:T;
        add(full,'rect',{x:x(lo),y:b.y+r*rh,width:x(hi)-x(lo)+.1,height:rh-4,'shape-rendering':'crispEdges',fill:c.percent===null?`url(#${view.id}-mask)`:mix(c.percent>=0?C.blue:C.rose,Math.abs(c.percent)/max)});
      });
    });
    full.setAttribute('opacity',.23);const vivid=full.cloneNode(true);vivid.setAttribute('opacity',1);s.append(vivid);
    const curtain=clip(s,`${view.id}-reveal`,b);vivid.setAttribute('clip-path',`url(#${view.id}-reveal)`);
    const glow=add(s,'rect',{x:b.x,y:b.y,width:18,height:b.h-4,fill:'#fff',opacity:.28,'pointer-events':'none'}),g=guide(s,b);
    for(const t of tickTimes(T))label(s,x(t),b.y+b.h+21,fmt(t,0),{'text-anchor':'middle'});
    label(s,b.x+b.w/2,b.y+b.h+43,'Time t',{'text-anchor':'middle',class:'dyn-axis-title'});
    return {height:271,paint(f,h,reduced){
      const i=timeIndex(points,f),t=points[i].t,px=x(t);curtain.setAttribute('width',reduced?b.w:px-b.x);placeGuide(g,px,b);glow.setAttribute('x',Math.min(px-9,b.x+b.w-18));
      rows.forEach((r,j)=>{const v=r.cells[i].percent;readouts[j].textContent=v===null?'n/a':percent(v);readouts[j].setAttribute('fill',v===null?C.muted:v>=0?C.blue:C.rose);});
      const row=h?.row??2,c=rows[row].cells[i];view.readout.textContent=`t = ${fmt(t,2)} · ${names[row]} · baseline ${fmt(c.base)} → ${fmt(c.changed)} · ${c.percent===null?'undefined: baseline Δ(T) = 0':percent(c.percent,2)}`;
    },inspect(px,py){return {fraction:clamp((px-b.x)/b.w),row:clamp(Math.floor((py-b.y)/rh),0,3)};}};
  });
}

async function researchAllocation(host) {
  const view=shell(host,'Research reallocation','Expert time released from services can enter research while machines change how research gets done. Following the allocation of hours alongside the production of complete research packets connects occupational change to progress at the frontier.');
  const result=await solved(PRESETS.mixed.options),points=result.points,T=points.at(-1).t;
  run(view,w=>{
    const s=view.svg,stacked=w<590,gap=58,pw=stacked?w-77:(w-133)/2,ph=stacked?133:171,top=42;
    const boxes=[{x:51,y:top,w:pw,h:ph},{x:stacked?51:51+pw+gap,y:stacked?top+ph+112:top,w:pw,h:ph}];
    const maxima=[Math.max(...points.map(p=>p.E))*1.06,Math.max(...points.map(p=>p.humanPackets+p.machinePackets))*1.06];
    const ax=boxes.map((b,i)=>axes(s,b,[0,T],[0,maxima[i]],'Time t',i?'Completed packets / time':'Expert hours / time'));
    const definitions=[[[p=>0,p=>p.DS,'#E4E7EB'],[p=>p.DS,p=>p.E,C.soft]],[[p=>0,p=>p.humanPackets,C.soft],[p=>p.humanPackets,p=>p.humanPackets+p.machinePackets,C.pink]]];
    const clips=[],guides=[];
    boxes.forEach((b,j)=>{
      const a=ax[j],faded=add(s,'g',{opacity:.22}),vivid=add(s,'g');
      for(const [low,high,color] of definitions[j]) {
        const d=area(points,p=>a.x(p.t),p=>a.y(low(p)),p=>a.y(high(p)));
        add(faded,'path',{d,fill:color});add(vivid,'path',{d,fill:color});
        add(vivid,'path',{d:path(points,p=>a.x(p.t),p=>a.y(high(p))),fill:'none',stroke:color===C.pink?C.rose:color===C.soft?C.blue:'#959BA3','stroke-width':1.5});
      }
      clips.push(clip(s,`${view.id}-${j}`,b));vivid.setAttribute('clip-path',`url(#${view.id}-${j})`);guides.push(guide(s,b));
      const runs=[];points.forEach((p,i)=>{const last=runs.at(-1),edge=i?(points[i-1].t+p.t)/2:0;if(last?.regime===p.regime)last.end=i===points.length-1?T:(p.t+points[i+1].t)/2;else runs.push({regime:p.regime,start:edge,end:i===points.length-1?T:(p.t+points[i+1].t)/2});});
      for(const r of runs){const color=r.regime==='human'?C.soft:r.regime==='mixed'?'#E1D9E8':C.pink;add(s,'rect',{x:a.x(r.start),y:b.y+b.h+57,width:a.x(r.end)-a.x(r.start),height:4,fill:color});label(s,a.x((r.start+r.end)/2),b.y+b.h+77,r.regime[0].toUpperCase()+r.regime.slice(1),{'text-anchor':'middle',class:'dyn-regime'});}
    });
    const q=points[0],human=points[35],machine=points[180];
    label(s,ax[0].x(.55),ax[0].y(q.DS/2),'Services Dₛ',{class:'dyn-direct',fill:C.ink});
    label(s,ax[0].x(.55),ax[0].y(q.DS+q.LR/2)+4,'Research Lᵣ',{class:'dyn-direct',fill:C.blue});
    label(s,ax[1].x(.55),ax[1].y(human.humanPackets/2)+3,'Human',{class:'dyn-direct',fill:C.blue});
    label(s,ax[1].x(7.3),ax[1].y(machine.machinePackets/2)+4,'Machine',{class:'dyn-direct',fill:C.rose});
    return {height:stacked?top+2*ph+203:top+ph+89,paint(f,h,reduced){
      const i=timeIndex(points,f),p=points[i];clips.forEach((c,j)=>{c.setAttribute('width',reduced?boxes[j].w:ax[j].x(p.t)-boxes[j].x);placeGuide(guides[j],ax[j].x(p.t),boxes[j]);});
      view.readout.textContent=`t = ${fmt(p.t,2)} · ${p.regime} research · hours ${fmt(p.DS)} + ${fmt(p.LR)} = ${fmt(p.E)} · packets ${fmt(p.humanPackets)} + ${fmt(p.machinePackets)} = ${fmt(p.humanPackets+p.machinePackets)}`;
    },inspect(px,py){const j=stacked?(py>boxes[1].y-35?1:0):(px>boxes[1].x-25?1:0);return {fraction:clamp((px-boxes[j].x)/boxes[j].w)};}};
  });
}

async function wageKernel(host) {
  const view=shell(host,'Future wage weights','Future earnings influence today’s investment in expertise through weights that decline with distance into the future. Following these weights across career entry dates reveals which parts of the wage path matter most for qualification value.');
  const result=await solved(PRESETS.baseline.options),points=result.points,T=points.at(-1).t,kernel=valuationKernel(points,result.parameters);
  const n=points.length,canvas=document.createElement('canvas');canvas.width=n;canvas.height=n;
  const context=canvas.getContext('2d'),pixels=context.createImageData(n,n);
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){
    const k=kernel.at(i,j),offset=((n-1-j)*n+i)*4,a=k??0,base=[15,77,146];
    for(let channel=0;channel<3;channel++)pixels.data[offset+channel]=k===null?255:Math.round(255+(base[channel]-255)*a);
    pixels.data[offset+3]=255;
  }
  context.putImageData(pixels,0,0);const image=canvas.toDataURL();
  run(view,w=>{
    const s=view.svg,stacked=w<570,map={x:47,y:48,w:stacked?w-71:(w-117)*.62,h:stacked?195:216};
    const curve={x:stacked?47:map.x+map.w+58,y:stacked?map.y+map.h+89:77,w:stacked?w-71:w-map.x-map.w-83,h:stacked?116:187};
    const mx=scale(0,T,map.x,map.x+map.w),my=scale(0,T,map.y+map.h,map.y),cx=scale(0,T,curve.x,curve.x+curve.w),cy=scale(0,1,curve.y+curve.h,curve.y);
    label(s,map.x,map.y-19,'Future date s',{class:'dyn-axis-title'});
    add(s,'image',{x:map.x,y:map.y,width:map.w,height:map.h,href:image,preserveAspectRatio:'none',class:'dyn-kernel-map'});
    line(s,mx(0),my(0),mx(T),my(T),{stroke:'#fff','stroke-width':1,class:'dyn-leader'});
    label(s,mx(T*.61),my(T*.25),'s < t',{'text-anchor':'middle',class:'dyn-note'});
    line(s,map.x,map.y+map.h,map.x+map.w,map.y+map.h);line(s,map.x,map.y,map.x,map.y+map.h);
    for(const t of tickTimes(T)){label(s,mx(t),map.y+map.h+21,fmt(t,0),{'text-anchor':'middle'});label(s,map.x-10,my(t)+4,fmt(t,0),{'text-anchor':'end'});}
    label(s,map.x+map.w/2,map.y+map.h+43,'Current date t',{'text-anchor':'middle',class:'dyn-axis-title'});
    colorbar(s,`${view.id}-scale`,map.x+Math.max(100,map.w-115),map.y-13,Math.min(110,map.w-100),1);
    axes(s,curve,[0,T],[0,1],'Future date s','Weight K(t, s)');
    const fill=add(s,'path',{fill:C.soft,opacity:.48}),stroke=add(s,'path',{fill:'none',stroke:C.blue,'stroke-width':2.2});
    const selected=add(s,'rect',{x:map.x,y:map.y,width:Math.max(2,map.w/n),height:map.h,fill:'#fff',opacity:.43});
    const column=line(s,map.x,map.y,map.x,map.y+map.h,{stroke:'#fff','stroke-width':1.2,class:'dyn-leader'});
    const selectedDate=label(s,curve.x,curve.y-32,'',{fill:C.blue,class:'dyn-direct'});
    const futureGuide=line(s,curve.x,curve.y,curve.x,curve.y+curve.h,{class:'dyn-guide',opacity:0});
    let lastIndex=-1;
    return {height:stacked?curve.y+curve.h+57:map.y+map.h+57,paint(f,h){
      const i=timeIndex(points,f),p=points[i],px=mx(p.t),startY=my(p.t);selected.setAttribute('x',px-Math.max(2,map.w/n)/2);selected.setAttribute('height',startY-map.y);column.setAttribute('x1',px);column.setAttribute('x2',px);column.setAttribute('y2',startY);
      if(i!==lastIndex){const tail=points.slice(i),d=path(tail,q=>cx(q.t),(_q,j)=>cy(kernel.at(i,i+j)));stroke.setAttribute('d',d);fill.setAttribute('d',`${d}L${cx(T)},${cy(0)}L${cx(p.t)},${cy(0)}Z`);lastIndex=i;selectedDate.textContent=`Current t = ${fmt(p.t,2)}`;}
      const j=h?.future??points.length-1,q=points[j],k=kernel.at(i,j);futureGuide.setAttribute('opacity',h&&k!==null?.65:0);placeGuide(futureGuide,cx(q.t),curve);
      view.readout.textContent=`Current t = ${fmt(p.t,2)} · future s = ${fmt(q.t,2)} · ${k===null?'s precedes the current date':`weight K = ${fmt(k,3)} · future wage w(s) = ${fmt(q.w,3)}`}`;
    },inspect(px,py,f){
      const inCurve=stacked?py>curve.y-28:px>curve.x-20;
      return inCurve?{fraction:f,future:timeIndex(points,clamp((px-curve.x)/curve.w))}:{fraction:clamp((px-map.x)/map.w),future:timeIndex(points,clamp((map.y+map.h-py)/map.h))};
    }};
  });
}

const builders={'career-phase':careerPhase,'response-map':responseMap,'research-allocation':researchAllocation,'wage-kernel':wageKernel};
export function mountDynamics(root=document) {
  const hosts=[...(root.matches?.('[data-dynamic]')?[root]:[]),...root.querySelectorAll('[data-dynamic]')];
  return Promise.all(hosts.map(async host=>{
    if(host.dataset.dynamicMounted)return;host.dataset.dynamicMounted='true';
    try { const builder=builders[host.dataset.dynamic];if(!builder)throw new Error('Unknown dynamic figure.');await builder(host);host.dataset.dynamicReady='true'; }
    catch(error) { const target=host.querySelector('.dyn-readout')||host;target.textContent=`Figure calculation: ${error.message}`;host.dataset.dynamicError='true'; }
  }));
}

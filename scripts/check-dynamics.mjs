import assert from 'node:assert/strict';
import { DEFAULTS, PRESETS, solveBoundaryPath } from '../dist/assets/model.js';
import { responseData, valuationKernel } from '../dist/assets/dynamics-figures.js';

const solve=options=>{const r=solveBoundaryPath(options);assert.equal(r.ok,true,JSON.stringify(r.diagnostics));return r;};
const baseline=solve(PRESETS.baseline.options),mixed=solve(PRESETS.mixed.options);
const kernel=valuationKernel(baseline.points,baseline.parameters);
for(let i=0;i<baseline.points.length;i++) {
  assert.equal(kernel.at(i,i),1);
  if(i)assert.equal(kernel.at(i,i-1),null);
  let last=1;
  for(let j=i+1;j<baseline.points.length;j++) {const k=kernel.at(i,j);assert.ok(k>0&&k<last,'Positive weights decay in future time.');last=k;}
}
// An independently integrated affine hazard is exact under trapezoidal
// quadrature, including on this nonuniform grid.
const grid=[0,.07,.32,.9,1.4,3.1,5.8],a=.045,b=.007,rho=.05,delta=.12;
const affine=valuationKernel(grid.map(t=>({t,x:a+b*t})),{rho,delta});
let kernelError=0;
for(let i=0;i<grid.length;i++)for(let j=i;j<grid.length;j++){
  const t=grid[i],s=grid[j],exact=Math.exp(-(rho+delta+a)*(s-t)-b*(s*s-t*t)/2);
  kernelError=Math.max(kernelError,Math.abs(affine.at(i,j)-exact));
}
assert.ok(kernelError<4e-16);
const constant=valuationKernel(grid.map(t=>({t,x:.08})),{rho,delta});
assert.ok(Math.abs(constant.at(0,grid.length-1)-Math.exp(-.25*grid.at(-1)))<2e-16);

let maxHoursError=0,maxPacketsError=0,observations=0;
for(const point of mixed.points) {
  maxHoursError=Math.max(maxHoursError,Math.abs(point.DS+point.LR-point.E));
  maxPacketsError=Math.max(maxPacketsError,Math.abs(point.F-point.A**(-mixed.parameters.phi)*(point.humanPackets+point.machinePackets)));
}
assert.ok(maxHoursError<1e-11&&maxPacketsError<1e-11);
assert.deepEqual([...new Set(mixed.points.map(p=>p.regime))],['human','mixed','machine']);
assert.equal(mixed.points.at(-1).LR,0);
assert.ok(mixed.points.at(-1).machinePackets>mixed.points[0].humanPackets);
for(const options of [{practiceDecay:3},{demandGrowth:.55},{machineMultiplier:.55}]) {
  const changed=solve({...DEFAULTS,...PRESETS.mixed.options,...options}),rows=responseData(mixed.points,changed.points);
  assert.equal(rows.length,4);
  for(const row of rows) {
    assert.equal(row.cells.length,mixed.points.length);
    row.cells.forEach((cell,i)=>{
      observations++;
      if(row.key==='Delta'&&i===mixed.points.length-1)assert.equal(cell.percent,null);
      else assert.ok(Number.isFinite(cell.percent));
    });
  }
  assert.equal(rows[0].cells[0].percent,0);
  assert.equal(rows[3].cells[0].percent,0);
}
const loss=solve(PRESETS.practiceLoss.options),announcement=solve(PRESETS.announcement.options);
assert.equal(loss.points[0].E,baseline.points[0].E);
assert.equal(announcement.points[0].E,baseline.points[0].E);
assert.ok(loss.points[0].Delta>baseline.points[0].Delta);
assert.ok(announcement.points[0].Delta<baseline.points[0].Delta);
assert.throws(()=>responseData([{t:0,E:1}],[{t:1,E:1}],['E']),/same observation times/);
console.log(JSON.stringify({status:'passed',responseObservations:observations,maskedTerminalCells:3,kernelError,maxHoursError,maxPacketsError,regimes:mixed.diagnostics.regimes},null,2));

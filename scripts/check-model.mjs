import assert from 'node:assert/strict';
import { DEFAULTS, PRESETS, solveMarket, stationaryEquilibrium, solveBoundaryPath, learningRisk, localWelfare, growthPaths } from '../dist/assets/model.js';
import { FEEDBACK_NODES, feedbackMeasurements } from '../dist/assets/feedback-model.js';

let checks=0;
const report=[];
function check(value,message) { assert.ok(value,message);checks++; }
function close(actual,expected,tolerance,message) {check(Math.abs(actual-expected)<=tolerance,`${message}: ${actual} versus ${expected}`);}
function success(result,name) {check(result.ok,`${name}: ${JSON.stringify(result.diagnostics)}`);return result;}
const compact=p=>({E:p.E,Delta:p.Delta,A:p.A,w:p.w});

// Procurement corners and the mixed interval satisfy independent labor,
// expenditure, and packet accounting identities.
for(const method of ['human','both','grounded']) {
  for(const multiplier of [0.45,0.85,2.5]) {
    for(const E of [0.3,0.55,0.8]) {
      const m=success(solveMarket({method,machineMultiplier:multiplier,E,A:1.7}),'market');
      close(m.DS+m.LR,E,1e-10,'Expert labor clearing');
      close((method==='grounded'?m.w:m.h)*m.LR+DEFAULTS.q*m.QM,DEFAULTS.BR,1e-10,'Research spending');
      close(m.F,1.7**-DEFAULTS.phi*(m.humanPackets+m.machinePackets),1e-10,'Completed packets');
      check(m.LR>=0&&m.QM>=0,'Nonnegative input allocation');
    }
  }
}

// Endogenous switches preserve the wage. Finite differences independently
// check the economic derivative used by the feedback graph.
const reference=success(solveMarket({E:0.55,A:1}),'reference');
const perUnitAM=1+DEFAULTS.mR;
const multiplier0=(reference.w0+DEFAULTS.q*DEFAULTS.xi)*reference.aH/(DEFAULTS.q*perUnitAM);
const multiplier1=(reference.w1+DEFAULTS.q*DEFAULTS.xi)*reference.aH/(DEFAULTS.q*perUnitAM);
for(const [threshold,wage] of [[multiplier0,reference.w0],[multiplier1,reference.w1]]) {
  const left=success(solveMarket({machineMultiplier:threshold-1e-7}),'switch left');
  const right=success(solveMarket({machineMultiplier:threshold+1e-7}),'switch right');
  close(left.w,wage,2e-7,'Left switch continuity');
  close(right.w,wage,2e-7,'Right switch continuity');
}
for(const opts of [{method:'human'},{method:'both',machineMultiplier:(multiplier0+multiplier1)/2},{method:'both',machineMultiplier:0.45},{method:'grounded',machineMultiplier:0.55}]) {
  const center=success(solveMarket(opts),'derivative center');
  const step=1e-5;
  const low=success(solveMarket({...opts,E:DEFAULTS.E0-step}),'derivative low');
  const high=success(solveMarket({...opts,E:DEFAULTS.E0+step}),'derivative high');
  close((high.w-low.w)/(2*step),center.derivatives.wE,3e-7,'Wage derivative');
  close((high.F-low.F)/(2*step)/center.F,center.derivatives.FEoverF,3e-7,'Research derivative');
  close((high.LR-low.LR)/(2*step),center.derivatives.LRE,3e-7,'Research labor derivative');
  close((high.QM-low.QM)/(2*step),center.derivatives.QM_E,3e-7,'Machine input derivative');
}

// The stationary replacement comparison changes diagnostic practice while
// preserving the exact inverse wage schedule and frontier.
const s0=success(stationaryEquilibrium({method:'human',practice:0.04}),'High-practice steady state');
const s1=success(stationaryEquilibrium({method:'human',practice:0.01}),'Low-practice steady state');
check(s1.E<s0.E&&s1.w>s0.w&&s1.x>s0.x,'Stationary headcount and price orders');
check(s1.T>s0.T&&s1.T-s0.T<0.03,'Strict partial formal replacement');
check(s1.trainingCost>s0.trainingCost,'Formal resource cost increases');
close(s1.T-s0.T,0.03-DEFAULTS.delta*(s0.E-s1.E),1e-10,'Stationary flow identity');
check(s0.diagnostics.maxResidual<1e-10&&s1.diagnostics.maxResidual<1e-10,'Stationary residuals');
const zero=success(stationaryEquilibrium({method:'human',practice:0}),'Zero-practice persistence');
check(zero.E>0&&zero.x>0,'Private investment maintains a positive expert population');
report.push({stationary:{higherPractice:compact(s0),lowerPractice:compact(s1),replacementFraction:(s1.T-s0.T)/0.03}});

// Solve each illustrative equilibrium, including endogenous corner switches.
const paths={};
for(const [key,preset] of Object.entries(PRESETS)) {
  const result=success(solveBoundaryPath(preset.options),`BVP ${key}`);
  paths[key]=result;
  check(result.diagnostics.maxResidual<1e-7,`${key} collocation residual`);
  close(result.points[0].E,DEFAULTS.E0,1e-12,`${key} initial expert share`);
  close(result.points[0].A,DEFAULTS.A0,1e-12,`${key} initial frontier`);
  close(result.points.at(-1).Delta,DEFAULTS.terminalDelta,1e-12,`${key} terminal payoff`);
  for(const v of result.points) {
    check(v.E>0&&v.E<1-DEFAULTS.basicDemand&&v.w>DEFAULTS.b&&v.Delta>=0,`${key} feasible career region`);
    close(v.x,v.Delta/DEFAULTS.kappa,1e-12,'Private study optimum');
  }
  report.push({preset:key,iterations:result.diagnostics.iterations,residual:result.diagnostics.maxResidual,regimes:result.diagnostics.regimes,start:compact(result.points[0]),end:compact(result.points.at(-1))});
}
check(paths.mixed.diagnostics.regimes.join(',')==='human,mixed,machine','All research regimes occur in the mixed preset');
check(paths.announcement.points[0].Delta<paths.mixed.points[0].Delta,'Announced future improvement changes present qualification value');
close(paths.announcement.points[0].w,paths.mixed.points[0].w,1e-12,'Pre-adoption primitives share initial wage');

// Mesh convergence checks the approximation to the continuous boundary
// problem, separately from the discrete collocation residual.
function meshDistance(coarse,fine) {
  return Math.max(...coarse.points.flatMap((a,i)=>{
    const b=fine.points[2*i];return ['E','Delta','A'].map(k=>Math.abs(a[k]-b[k]));
  }));
}
for(const key of ['baseline','mixed','announcement']) {
  const opts=PRESETS[key].options;
  const a=success(solveBoundaryPath({...opts,steps:120}),`${key} coarse mesh`);
  const b=success(solveBoundaryPath({...opts,steps:240}),`${key} middle mesh`);
  const c=success(solveBoundaryPath({...opts,steps:480}),`${key} fine mesh`);
  const coarse=meshDistance(a,b),fine=meshDistance(b,c);
  check(fine<coarse*0.85,`${key} refinement reduces discretization error across regime boundaries`);
  check(fine<3e-4,`${key} fine-mesh accuracy`);
  if(key==='baseline') check(coarse/fine>3.5&&coarse/fine<4.5,'Second-order convergence away from switches');
  report.push({mesh:key,coarse,fine,ratio:coarse/fine});
}
const continuation=success(solveBoundaryPath({terminalDelta:2}), 'Positive continuation payoff');
close(continuation.points.at(-1).Delta,2,1e-12,'Explicit positive terminal condition');
check(continuation.points[0].Delta>paths.baseline.points[0].Delta,'Higher continuation raises present qualification value');

// An independent closed-form joint path: constant complete-method costs keep
// a mixed wage fixed, a stationary continuation holds E and Delta constant,
// and the frontier rises linearly when idea difficulty is zero.
const constantOptions={alpha:0,nu:0,mu:0,zeta:0,phi:0,practiceDecay:0,demandGrowth:0,machineMultiplier:0.9};
const exactStationary=success(stationaryEquilibrium(constantOptions),'Constant mixed benchmark');
check(exactStationary.regime==='mixed','Benchmark lies in the mixed interval');
const exactPath=success(solveBoundaryPath({...constantOptions,E0:exactStationary.E,terminalDelta:exactStationary.Delta}),'Constant mixed joint path');
for(const v of exactPath.points) {
  close(v.E,exactStationary.E,1e-9,'Exact constant expertise');
  close(v.Delta,exactStationary.Delta,1e-9,'Exact constant qualification value');
  close(v.A,1+v.t*DEFAULTS.BR/(0.9*(1+DEFAULTS.mR)),1e-9,'Exact linear frontier');
}

// Impossible or unsupported domains produce diagnostics and no clipped path.
for(const bad of [{C0:0.005,E0:0.8},{M0:2},{initialDelta:1},{steps:2},{epsilon:0},{horizon:Infinity},{maxIterations:1}]) {
  const result=solveBoundaryPath(bad);
  check(!result.ok&&!!result.diagnostics.code&&!result.points,`Diagnostic for ${JSON.stringify(bad)}`);
}
check(!solveMarket({E:1}).ok,'Market rejects exhausted novice pool');
check(!stationaryEquilibrium({practice:2}).ok,'Stationary equation rejects infeasible practice');

// Information risks and the welfare derivative have independent limiting checks.
close(learningRisk({rB:0,rA:1}).risk,1,1e-12,'No foundation signal');
close(learningRisk({rB:1,rA:1,access:1}).risk,0,1e-12,'Revealing signal pair');
close(learningRisk({rB:1,rA:1,access:0.3}).risk,0.7,1e-12,'Independent diagnostic access');
close(localWelfare({P:0.2,lambda:2,Delta:2,Pi:1,h:1}).W,0.2,1e-12,'Welfare equals private gain when wedges vanish');
close(localWelfare({P:0.08,lambda:3,Delta:2,m:0.1,Pi:2,h:1,chiR:0.25,e:0.1}).W,0.005,1e-12,'Welfare decomposition');

// Growth laws are a separate scalar comparison. Delay has exact history on
// [-tau,0], and its first interval admits an independently evaluable solution.
const g=success(growthPaths(),'Growth defaults');
check(g.class==='critical'&&g.diagnostics.converged,'Critical comparison completes');
for(const v of g.points) {
  close(v.power,Math.exp(0.12*v.t),1e-10,'Instantaneous critical growth');
  check(v.absorbedCapability<=v.absorption+1e-10&&v.absorption<=v.power+1e-9,'Absorption preserves capability order');
  if(v.t<=1.5) close(v.delay,(1+1.7*0.12*v.t)**(1/1.7),1e-10,'Exact first delayed interval');
}
close(g.criticalRates.absorption*(1+1.5*g.criticalRates.absorption)**1.7,0.12,1e-12,'Absorption limiting growth equation');
close(g.criticalRates.delay*Math.exp(1.7*1.5*g.criticalRates.delay),0.12,1e-12,'Delay limiting growth equation');
const gd1=success(growthPaths({steps:120}),'Growth coarse'),gd2=success(growthPaths({steps:240}),'Growth medium'),gd3=success(growthPaths({steps:480}),'Growth fine');
const delayCoarse=Math.abs(gd1.points.at(-1).delay-gd2.points.at(-1).delay),delayFine=Math.abs(gd2.points.at(-1).delay-gd3.points.at(-1).delay);
check(delayFine<delayCoarse*0.4&&delayFine<1e-5,'Delay history interpolation converges');
const supercritical=success(growthPaths({eta:2.5,horizon:12}),'Supercritical comparison');
close(supercritical.powerDivergenceTime,1/(0.12*0.8),1e-10,'Exact instantaneous divergence time');
check(supercritical.points.at(-1).power===null&&Number.isFinite(supercritical.points.at(-1).delay),'Fixed delay stays finite beyond instantaneous divergence');
check(supercritical.diagnostics.warnings.some(v=>v.code==='analytic-divergence'),'Divergence is explicitly diagnosed');
check(!growthPaths({delay:0}).ok,'Zero fixed duration is rejected');
report.push({growth:{delayCoarse,delayFine,criticalRates:g.criticalRates,powerDivergenceTime:supercritical.powerDivergenceTime}});

// Every feedback link carries auditable units and conditioning. Check its
// elasticities against independent finite perturbations of the actual market.
check(FEEDBACK_NODES.length===16,'The full reference contains sixteen nodes');
for(const opts of [{method:'human'},{method:'both',machineMultiplier:0.85},{method:'both',machineMultiplier:0.45},{method:'grounded',machineMultiplier:0.55}]) {
  const center=solveMarket(opts),point={...center,t:0,Delta:2};
  const ledger=success(feedbackMeasurements({point,parameters:opts}),'Feedback ledger');
  check(Object.keys(ledger.edges).length===22,'All twenty-two links are represented');
  check(Object.values(ledger.edges).every(e=>e.formula&&e.conditioning&&e.source&&e.measure),'Every link has definitions and evidence');
  check(ledger.edges.p7.to==='cp'&&ledger.edges.p6.from==='pf','Private qualification value affects credit and leaves the policy input exogenous');
  const h=1e-5;
  const cLow=solveMarket({...opts,C0:DEFAULTS.C0*Math.exp(-h)}),cHigh=solveMarket({...opts,C0:DEFAULTS.C0*Math.exp(h)});
  close(ledger.edges.p8.value,Math.log(cHigh.w/cLow.w)/(2*h),2e-7,'Exact demand-scale wage elasticity');
  const eLow=solveMarket({...opts,E:DEFAULTS.E0*Math.exp(-h)}),eHigh=solveMarket({...opts,E:DEFAULTS.E0*Math.exp(h)});
  close(ledger.edges.p10.value,Math.log(eHigh.w/eLow.w)/(2*h),2e-7,'Exact wage headcount elasticity');
  if(center.LR>0) close(ledger.edges.p16.value,Math.log(eHigh.F/eLow.F)/Math.log(eHigh.LR/eLow.LR),3e-7,'Cleared research labor-output elasticity');
  const multiplier=opts.machineMultiplier??DEFAULTS.machineMultiplier;
  const uLow=solveMarket({...opts,machineMultiplier:multiplier*Math.exp(h)}),uHigh=solveMarket({...opts,machineMultiplier:multiplier*Math.exp(-h)});
  close(ledger.edges.p21.value,Math.log(uHigh.F/uLow.F)/(2*h),3e-7,'Machine-efficiency frontier elasticity');
  const aLow=solveMarket({...opts,A:Math.exp(-h)}),aHigh=solveMarket({...opts,A:Math.exp(h)});
  close(ledger.edges.p20.value,-Math.log(aHigh.aM/aLow.aM)/(2*h),2e-7,'Finite-stage machine elasticity');
  if(center.wbar>0) close(ledger.edges.p22.value,Math.log(aHigh.wbar/aLow.wbar)/(2*h),2e-7,'Exact parity-wage elasticity');
  const ss=ledger.stationary,ml=stationaryEquilibrium({...opts,practice:ss.M-h}),mh=stationaryEquilibrium({...opts,practice:ss.M+h});
  close(ledger.edges.p9.value,(mh.E-ml.E)/(2*h),2e-6,'Stationary practice multiplier');
  check(ledger.edges.p11.basis==='stationary wage-value identity','Wage-value slope is explicitly stationary');
}
const constrained=success(feedbackMeasurements({creditMode:'floor',caseDelta:3,caseLearning:0.25,payFloor:0.5,caseSaving:0.625,caseBasicWage:1}),'Positive cash-floor example');
close(constrained.credit.discount,0.5,1e-12,'Cash floor caps the financed discount');
close(constrained.credit.privateGain,0.125,1e-12,'Constrained private preparation gain');
close(constrained.credit.completeContractGain,-0.125,1e-12,'Resource loss at the full learning value');
close(constrained.edges.p6.value,-1,1e-12,'Binding floor derivative');
close(constrained.edges.p7.value,0,1e-12,'Binding credit blocks qualification-value pass-through');
const pathLedger=success(feedbackMeasurements({point:paths.baseline.points[0],points:paths.baseline.points,parameters:PRESETS.baseline.options}),'Path-based wage kernel');
check(pathLedger.edges.p11.dynamicKernel.every((v,i,a)=>v.value>0&&v.value<1&&(i===0||v.value<a[i-1].value)),'Future-wage kernel is positive and decays');
report.push({feedback:{nodes:16,links:22,creditExample:constrained.credit.paperExample,stationaryPracticeMultiplier:pathLedger.edges.p9.value}});

console.log(JSON.stringify({passed:true,checks,report},null,2));

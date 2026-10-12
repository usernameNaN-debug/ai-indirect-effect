/** Numerical illustrations of The Indirect Effects of AI on Professional Work.
 * Source equations and numerical contract are documented in MODEL_NOTES.md.
 * All public calculations are pure. Failed calculations return explicit diagnostics.
 */
export const DEFAULTS = Object.freeze({
  b: 0.4, rho: 0.05, delta: 0.12, kappa: 30,
  C0: 0.34, epsilon: 1.3, demandGrowth: -0.35,
  M0: 0.025, practiceDecay: 1.2, kappaC: 1, basicDemand: 0.02,
  BR: 0.12, q: 1, xi: 0.15, phi: 0.7,
  alpha: 0.8, nu: 0.4, vR: 0.5,
  mu: 1.6, zeta: 1, mR: 0.6, machineMultiplier: 2.2,
  method: 'both', machineAvailableA: 1,
  groundingScale: 0.7, groundingExponent: 0.4,
  A0: 1, E0: 0.55, horizon: 12, steps: 240, terminalDelta: 0,
  announcementTime: null, announcedMachineMultiplier: null,
});

export const PARAMETER_RANGES = Object.freeze({
  E: { min: 0.2, max: 0.85, step: 0.01, label: 'Expert population share' },
  E0: { min: 0.3, max: 0.7, step: 0.01, label: 'Initial expert share' },
  A: { min: 1, max: 5, step: 0.05, label: 'Frontier productivity' },
  C0: { min: 0.2, max: 0.6, step: 0.01, label: 'Initial service demand scale' },
  M0: { min: 0, max: 0.07, step: 0.001, label: 'Initial practice transitions' },
  practiceDecay: { min: 0, max: 4, step: 0.1, label: 'Practice displacement' },
  demandGrowth: { min: -0.8, max: 0.8, step: 0.05, label: 'Service discovery and preparation' },
  kappa: { min: 15, max: 70, step: 1, label: 'Formal training cost' },
  epsilon: { min: 0.8, max: 2, step: 0.1, label: 'Service demand elasticity' },
  machineMultiplier: { min: 0.4, max: 4, step: 0.05, label: 'Machine resource requirement' },
  BR: { min: 0.04, max: 0.25, step: 0.01, label: 'Research budget' },
  terminalDelta: { min: 0, max: 4, step: 0.1, label: 'Terminal qualification payoff' },
  horizon: { min: 4, max: 20, step: 1, label: 'Career horizon' },
  groundingScale: { min: 0.1, max: 2, step: 0.05, label: 'Grounding hours per packet at A = 1' },
  eta: { min: 0.3, max: 3, step: 0.05, label: 'Research productivity exponent' },
  phi: { min: 0, max: 2, step: 0.05, label: 'Idea difficulty exponent' },
  absorptionTime: { min: 0.25, max: 4, step: 0.25, label: 'Absorption time' },
  delay: { min: 0.25, max: 4, step: 0.25, label: 'Minimum research duration' },
});

export const PRESETS = Object.freeze({
  baseline: { label: 'Human research', options: { method: 'human' } },
  practiceLoss: { label: 'Faster loss of practice', options: { method: 'human', practiceDecay: 3 } },
  discovery: { label: 'More discovered services', options: { method: 'human', demandGrowth: 0.55 } },
  mixed: { label: 'Competing research methods', options: { method: 'both', machineMultiplier: 1.05 } },
  autonomous: { label: 'Autonomous research', options: { method: 'both', machineMultiplier: 0.55 } },
  grounded: { label: 'Human grounding', options: { method: 'grounded', machineMultiplier: 0.55 } },
  announcement: { label: 'Announced machine improvement', options: { method: 'both', machineMultiplier: 1.05, announcementTime: 4, announcedMachineMultiplier: 0.7 } },
});

class ModelError extends Error {
  constructor(code, message, detail = {}) { super(message); this.code = code; this.detail = detail; }
}
function fail(code, message, detail) { throw new ModelError(code, message, detail); }
function finite(name, value, lo = -Infinity, hi = Infinity) {
  if (!Number.isFinite(value) || value < lo || value > hi)
    fail('invalid-parameter', `${name} must be finite and lie in [${lo}, ${hi}].`, { parameter: name, value });
}
function positive(name, value) {
  finite(name, value, 0);
  if (value === 0) fail('invalid-parameter', `${name} must be positive.`, { parameter: name, value });
}
function guard(run) {
  try { return run(); }
  catch (error) {
    return { ok: false, diagnostics: { converged: false, code: error.code || 'numerical-failure', message: error.message, ...error.detail } };
  }
}
function parameters(options = {}) {
  const p = { ...DEFAULTS, ...options };
  for (const name of ['b','rho','delta','kappa','C0','epsilon','vR','mR','q','machineMultiplier','A0','groundingScale']) positive(name, p[name]);
  for (const name of ['M0','practiceDecay','kappaC','basicDemand','BR','xi','alpha','nu','mu','zeta','groundingExponent','machineAvailableA','phi']) finite(name, p[name], 0);
  finite('demandGrowth', p.demandGrowth);
  if (!['both','human','grounded'].includes(p.method)) fail('invalid-parameter', 'method must be both, human, or grounded.');
  if (p.basicDemand >= 1) fail('novice-capacity', 'Basic work must leave a positive novice endowment.');
  if (p.c !== undefined) finite('c', p.c);
  if (p.practice !== undefined) finite('practice', p.practice, 0);
  return p;
}

// A safeguarded Newton solve on a strictly decreasing demand curve.
function wageRoot(E, C, epsilon, budget, overhead) {
  const serviceWage = (C / E) ** (1 / epsilon);
  if (budget === 0) return serviceWage;
  let low = serviceWage;
  let high = Math.max(2 * serviceWage, 2 * budget / E, 1);
  const excess = w => C * w ** -epsilon + budget / (w + overhead) - E;
  for (let n = 0; excess(high) > 0 && n < 80; n++) high *= 2;
  if (!Number.isFinite(high) || excess(high) > 0) fail('wage-bracket', 'The market wage could not be bracketed.');
  let w = (low + high) / 2;
  for (let n = 0; n < 70; n++) {
    const ds = C * w ** -epsilon;
    const value = ds + budget / (w + overhead) - E;
    if (Math.abs(value) <= 2e-13 * Math.max(1, E)) return w;
    if (value > 0) low = w; else high = w;
    const slope = -epsilon * ds / w - budget / (w + overhead) ** 2;
    const next = w - value / slope;
    w = next > low && next < high ? next : (low + high) / 2;
  }
  fail('wage-convergence', 'The wage solver exceeded its convergence budget.');
}

function market(p, E, A, cOverride) {
  finite('E', E, 0, 1);
  positive('A', A);
  if (E <= 0 || E >= 1) fail('state-domain', 'The expert share must remain strictly between zero and one.', { E, A });
  const c = cOverride ?? p.c ?? p.kappaC * Math.log(A / p.A0);
  const C = p.C0 * Math.exp(p.demandGrowth * c);
  const M = p.practice ?? p.M0 * Math.exp(-p.practiceDecay * c);
  const aH = A ** -p.alpha + p.vR * A ** -p.nu;
  const aM = p.machineMultiplier * (A ** -p.mu + p.mR * A ** -p.zeta);
  const aG = p.groundingScale * A ** -p.groundingExponent;
  if (![C,M,aH,aM,aG].every(Number.isFinite) || C <= 0 || aH <= 0 || aM <= 0)
    fail('resource-domain', 'The requested resource coefficients exceed numerical representability.', { A, c });
  const w0 = (C / E) ** (1 / p.epsilon);
  const w1 = wageRoot(E, C, p.epsilon, p.BR, p.q * p.xi);
  const wbar = p.q * aM / aH - p.q * p.xi;
  let w, LR, QM, regime, kStar, humanPackets = 0, machinePackets = 0;
  if (p.method === 'grounded') {
    const overhead = p.q * aM / aG;
    w = wageRoot(E, C, p.epsilon, p.BR, overhead);
    kStar = p.q * aM + w * aG;
    machinePackets = p.BR / kStar;
    LR = aG * machinePackets;
    QM = aM * machinePackets;
    regime = 'grounded';
  } else if (p.method === 'human' || A < p.machineAvailableA || w1 <= wbar) {
    w = w1; LR = p.BR / (w + p.q * p.xi); QM = 0;
    kStar = aH * (w + p.q * p.xi); humanPackets = LR / aH;
    regime = 'human';
  } else if (w0 >= wbar) {
    w = w0; LR = 0; QM = p.BR / p.q;
    kStar = p.q * aM; machinePackets = QM / aM;
    regime = 'machine';
  } else {
    w = wbar; LR = E - C * w ** -p.epsilon;
    QM = (p.BR - (w + p.q * p.xi) * LR) / p.q;
    kStar = p.q * aM; humanPackets = LR / aH; machinePackets = QM / aM;
    regime = 'mixed';
  }
  const DS = C * w ** -p.epsilon;
  const h = w + p.q * p.xi;
  const F = A ** -p.phi * p.BR / kStar;
  const serviceW = -p.epsilon * DS / w;
  const J = -serviceW + p.BR / h ** 2;
  let wE, FEoverF, LRE, QME, chiR;
  if (regime === 'human') {
    wE = -1 / J; FEoverF = 1 / (h * J);
    LRE = p.BR / (h * h * J); QME = 0; chiR = LRE;
  } else if (regime === 'mixed') {
    wE = 0; FEoverF = 0; LRE = 1; QME = -h / p.q; chiR = 1;
  } else if (regime === 'grounded') {
    const JG = -serviceW + p.BR * aG * aG / kStar ** 2;
    wE = -1 / JG; FEoverF = aG / (kStar * JG);
    LRE = p.BR * aG * aG / (kStar * kStar * JG);
    QME = aM * p.BR * aG / (kStar * kStar * JG); chiR = LRE;
  } else {
    wE = 1 / serviceW; FEoverF = 0; LRE = 0; QME = 0; chiR = 0;
  }
  const marketResidual = DS + LR - E;
  const budgetResidual = (regime === 'grounded' ? w : h) * LR + p.q * QM - p.BR;
  const packetResidual = F - A ** -p.phi * (humanPackets + machinePackets);
  if (![w,LR,QM,F].every(Number.isFinite) || w <= 0 || LR < -1e-11 || QM < -1e-11 || F < 0)
    fail('allocation-domain', 'Market clearing produced an infeasible allocation.', { E, A, w, LR, QM });
  return { E,A,c,C,w,w0,w1,wbar,DS,LR,QM,F,M,regime,h,aH,aM,aG,kStar,
    kH:aH*h,kM:p.q*aM,humanPackets,machinePackets,chiR,
    marketResidual,budgetResidual,packetResidual,
    derivatives:{ wE,FEoverF,LRE,QM_E:QME,serviceW,serviceC:p.demandGrowth*DS,practiceC:-p.practiceDecay*M },
  };
}

export function solveMarket(options = {}) {
  return guard(() => {
    const p = parameters(options);
    const m = market(p, options.E ?? p.E0, options.A ?? p.A0);
    return { ok:true,...m,diagnostics:{ converged:true,maxResidual:Math.max(Math.abs(m.marketResidual),Math.abs(m.budgetResidual),Math.abs(m.packetResidual)),positivePremium:m.w>p.b,noviceSlack:1-m.E-p.basicDemand } };
  });
}

function stationary(p, A = p.A0) {
  const value = E => {
    const m = market(p,E,A);
    if (m.w <= p.b) return null;
    const R = p.rho+p.delta;
    // Rationalized root avoids cancellation for a small wage premium.
    const x = 2*(m.w-p.b)/p.kappa/(Math.sqrt(R*R+2*(m.w-p.b)/p.kappa)+R);
    return { ...m,x,Delta:p.kappa*x,balance:m.M+(1-E)*x-p.delta*E };
  };
  let lower, upper;
  const minE = 0.001, maxE = 1-p.basicDemand-1e-7;
  for (let i=0;i<=240;i++) {
    const m = value(minE+(maxE-minE)*i/240);
    if (!m) break;
    if (m.balance>0) lower=m;
    else if(lower) { upper=m; break; }
  }
  if (!lower || !upper) fail('stationary-feasibility','No stationary root was bracketed inside the positive-premium region with novice time available.',{A});
  let result;
  for (let i=0;i<70;i++) {
    result=value((lower.E+upper.E)/2);
    if (!result) fail('stationary-feasibility','The stationary wage left the positive-premium region.');
    if (Math.abs(result.balance)<1e-12) break;
    if(result.balance>0) lower=result; else upper=result;
  }
  const T=(1-result.E)*result.x;
  const trainingCost=p.kappa*(1-result.E)*result.x**2/2;
  const valueResidual=(p.rho+p.delta)*result.Delta-(result.w-p.b)+result.Delta**2/(2*p.kappa);
  return {ok:true,...result,T,trainingCost,expertIncome:result.w*result.E,
    diagnostics:{converged:true,maxResidual:Math.max(Math.abs(result.balance),Math.abs(valueResidual),Math.abs(result.marketResidual),Math.abs(result.budgetResidual)),stateResidual:result.balance,valueResidual,noviceSlack:1-result.E-p.basicDemand,interpretation:'Stationary careers at a fixed frontier and customer capability.'}};
}
export function stationaryEquilibrium(options = {}) {
  return guard(() => {const p=parameters(options); return stationary(p,options.A??p.A0);});
}

function effective(p,t) {
  if(p.announcementTime!==null && t>=p.announcementTime && p.announcedMachineMultiplier!==null)
    return {...p,machineMultiplier:p.announcedMachineMultiplier};
  return p;
}
function checkCareer(p,m,D,t) {
  if(m.w<p.b-1e-10) fail('negative-premium','The career path leaves the wage region supporting nonnegative qualification investment.',{t,E:m.E,A:m.A,w:m.w,b:p.b});
  if(1-m.E<=p.basicDemand) fail('novice-capacity','Basic work exhausts the novice time available on this path.',{t,E:m.E,basicDemand:p.basicDemand});
  if(D < -1e-10 || !Number.isFinite(D)) fail('qualification-domain','The computed qualification value is outside the nonnegative domain.',{t,Delta:D});
}

// Implicit midpoint state step. For fixed midpoint A and Delta the E equation
// is linear and solved exactly. Only one nonlinear scalar equation remains.
function forwardStep(p,E,A,Dmid,dt,t) {
  const x=Dmid/p.kappa, denominator=1+dt*(x+p.delta)/2;
  function at(Am) {
    const c=p.c??p.kappaC*Math.log(Am/p.A0);
    const M=p.practice??p.M0*Math.exp(-p.practiceDecay*c);
    const Em=(E+dt*(M+x)/2)/denominator;
    const m=market(p,Em,Am);
    checkCareer(p,m,Dmid,t+dt/2);
    return {m,r:Am-A-dt*m.F/2};
  }
  const m0=market(p,E,A);
  let Am=A+dt*m0.F/2;
  let state;
  for(let iteration=0;iteration<30;iteration++) {
    state=at(Am);
    if(Math.abs(state.r)<1e-12*Math.max(1,Am)) break;
    const eps=1e-6*Math.max(1,Am);
    const slope=(at(Am+eps).r-state.r)/eps;
    let update=state.r/slope;
    if(!Number.isFinite(update)||slope<=0) fail('state-step','The implicit frontier step has lost its regular local branch. Reduce the time step or growth intensity.',{t,A,dt});
    if(Am-update<A) update=(Am-A)/2;
    Am-=update;
    if(Am>1e9) fail('frontier-range','The frontier exceeded the finite numerical range of this illustration.',{t,A:Am});
    if(iteration===29) fail('state-step','The implicit frontier step did not converge.',{t,A,dt});
  }
  const En=2*state.m.E-E, An=2*Am-A;
  if(En<=0 || En>=1) fail('state-domain','The expert share leaves the feasible population interval.',{t:t+dt,E:En,A:An});
  return {E:En,A:An,mid:state.m};
}

function forward(p,times,D) {
  const E=[p.E0],A=[p.A0],mids=[];
  for(let i=0;i<times.length-1;i++) {
    const dt=times[i+1]-times[i],pi=effective(p,(times[i]+times[i+1])/2);
    const step=forwardStep(pi,E[i],A[i],(D[i]+D[i+1])/2,dt,times[i]);
    E.push(step.E);A.push(step.A);mids.push(step.mid);
  }
  return {E,A,mids};
}
function backward(p,times,mids) {
  const D=Array(times.length);D[D.length-1]=p.terminalDelta;
  for(let i=D.length-2;i>=0;i--) {
    const dt=times[i+1]-times[i],B=2+dt*(p.rho+p.delta),a=dt/(2*p.kappa),c=2*D[i+1]+dt*(mids[i].w-p.b);
    if(c<0) fail('negative-premium','The backward value equation has a negative forcing term.',{t:times[i]});
    const dm=2*c/(B+Math.sqrt(B*B+4*a*c));
    D[i]=2*dm-D[i+1];
    if(D[i]<-1e-10) fail('qualification-domain','The value discretization left the positive branch. Reduce the time step.',{t:times[i],Delta:D[i]});
  }
  return D;
}

export function solveBoundaryPath(options = {}) {
  return guard(() => {
    const p=parameters(options);
    positive('horizon',p.horizon);finite('horizon',p.horizon,0.1,60);
    finite('steps',p.steps,20,1600);
    if(!Number.isInteger(p.steps)) fail('invalid-parameter','steps must be an integer.');
    finite('terminalDelta',p.terminalDelta,0,50);
    finite('E0',p.E0,0,1);
    if(p.announcementTime!==null) finite('announcementTime',p.announcementTime,0,p.horizon);
    if(p.announcedMachineMultiplier!==null) positive('announcedMachineMultiplier',p.announcedMachineMultiplier);
    if(options.initialDelta!==undefined) fail('invalid-boundary','Specify terminalDelta. Initial qualification value is solved from the career boundary problem.');
    const times=Array.from({length:p.steps+1},(_,i)=>i*p.horizon/p.steps);
    if(p.announcementTime>0&&p.announcementTime<p.horizon&&!times.some(t=>Math.abs(t-p.announcementTime)<1e-10)) {
      times.push(p.announcementTime);times.sort((a,b)=>a-b);
    }
    const initialMarket=market(effective(p,0),p.E0,p.A0);
    checkCareer(p,initialMarket,0,0);
    const R=p.rho+p.delta;
    const stationaryD=2*(initialMarket.w-p.b)/(Math.sqrt(R*R+2*(initialMarket.w-p.b)/p.kappa)+R);
    let D=times.map(t=>p.terminalDelta+(stationaryD-p.terminalDelta)*(1-Math.exp(-R*(p.horizon-t))));
    let result,iterations=0,error=Infinity,oldError=Infinity,relaxation=0.55;
    const tolerance=options.tolerance??2e-9,maxIterations=options.maxIterations??240;
    finite('tolerance',tolerance,1e-12,1e-5);finite('maxIterations',maxIterations,1,1000);
    for(iterations=1;iterations<=maxIterations;iterations++) {
      result=forward(p,times,D);
      const proposed=backward(p,times,result.mids);
      error=Math.max(...D.map((d,i)=>Math.abs(d-proposed[i])));
      if(error<tolerance) {D=proposed;result=forward(p,times,D);break;}
      if(error>oldError*1.15) relaxation=Math.max(0.12,relaxation*0.7);
      D=D.map((d,i)=>d+relaxation*(proposed[i]-d));
      oldError=error;
    }
    if(iterations>maxIterations) fail('boundary-convergence','The forward and backward paths did not reach a common boundary-value solution within the iteration budget.',{iterations:maxIterations,iterationError:error});
    let stateResidual=0,valueResidual=0,frontierResidual=0,marketResidual=0,budgetResidual=0;
    for(let i=0;i<times.length-1;i++) {
      const dt=times[i+1]-times[i],m=result.mids[i],dm=(D[i]+D[i+1])/2;
      stateResidual=Math.max(stateResidual,Math.abs((result.E[i+1]-result.E[i])/dt-(m.M+(1-m.E)*dm/p.kappa-p.delta*m.E)));
      valueResidual=Math.max(valueResidual,Math.abs((D[i+1]-D[i])/dt-(R*dm-(m.w-p.b)+dm*dm/(2*p.kappa))));
      frontierResidual=Math.max(frontierResidual,Math.abs((result.A[i+1]-result.A[i])/dt-m.F));
    }
    const points=times.map((t,i)=> {
      const m=market(effective(p,t),result.E[i],result.A[i]);
      checkCareer(p,m,D[i],t);
      marketResidual=Math.max(marketResidual,Math.abs(m.marketResidual));
      budgetResidual=Math.max(budgetResidual,Math.abs(m.budgetResidual));
      const x=D[i]/p.kappa,T=(1-m.E)*x;
      return {t,...m,Delta:D[i],x,T,trainingCost:p.kappa*(1-m.E)*x*x/2,expertIncome:m.w*m.E};
    });
    const boundaryResidual=Math.max(Math.abs(points[0].E-p.E0),Math.abs(points[0].A-p.A0),Math.abs(points.at(-1).Delta-p.terminalDelta));
    const maxResidual=Math.max(stateResidual,valueResidual,frontierResidual,marketResidual,budgetResidual,boundaryResidual);
    if(maxResidual>1e-6) fail('residual-check','The numerical path failed the equation residual check.',{maxResidual,stateResidual,valueResidual,frontierResidual});
    const regimes=[...new Set(points.map(v=>v.regime))];
    return {ok:true,points,parameters:p,diagnostics:{converged:true,iterations,iterationError:error,maxResidual,stateResidual,valueResidual,frontierResidual,marketResidual,budgetResidual,boundaryResidual,steps:times.length-1,maxStep:Math.max(...times.slice(1).map((t,i)=>t-times[i])),regimes,method:'Damped forward/backward iteration with implicit midpoint collocation',interpretation:'Finite-horizon boundary-value equilibrium with specified terminal qualification payoff.'}};
  });
}

export function learningRisk({rB=0.8,rA=0.9,access=1}={}) {
  return guard(()=> {
    for(const [name,v] of Object.entries({rB,rA,access})) finite(name,v,0,1);
    const riskReduction=access*rB*rB*rA*rA;
    return {ok:true,risk:1-riskReduction,pairedRisk:1-rB*rB*rA*rA,explanationOnlyRisk:1,knownFoundationRisk:1-rA*rA,riskReduction,diagnostics:{interpretation:'Bayes squared-error risk for the binary information experiment.'}};
  });
}
export function localWelfare({P=0.08,lambda=3,Delta=2,m=0.1,Pi=2,h=1,chiR=0.25,e=0.1,E,kappa}={}) {
  return guard(()=> {
    for(const [name,v] of Object.entries({P,lambda,Delta,Pi})) finite(name,v);
    for(const [name,v] of Object.entries({m,h,e})) finite(name,v,0);
    finite('chiR',chiR,0,1);
    const learningCost=(lambda-Delta)*m,researchGain=(Pi-h)*chiR*e;
    const result={ok:true,W:P-learningCost+researchGain,privateGain:P,learningCost,researchGain,diagnostics:{interpretation:'Local welfare derivative at a strict human-research corner, conditional on supplied continuation values.'}};
    if(E!==undefined&&kappa!==undefined) {finite('E',E,0,1);positive('kappa',kappa);result.trainingSubsidyGain=(1-E)*(lambda-Delta)/kappa;}
    return result;
  });
}

function bisectIncreasing(fn,lo,hi) {
  for(let i=0;i<100;i++) {const mid=(lo+hi)/2;if(fn(mid)>0) hi=mid;else lo=mid;}
  return (lo+hi)/2;
}
function rk4(y,h,field) {
  const a=field(y),b=field(y.map((v,i)=>v+h*a[i]/2)),c=field(y.map((v,i)=>v+h*b[i]/2)),d=field(y.map((v,i)=>v+h*c[i]));
  return y.map((v,i)=>v+h*(a[i]+2*b[i]+2*c[i]+d[i])/6);
}

export function growthPaths(options={}) {
  return guard(()=> {
    const p={A0:1,k:0.12,phi:0.7,eta:1.7,horizon:12,steps:240,absorptionTime:1.5,delay:1.5,...options};
    for(const name of ['A0','k','horizon','absorptionTime','delay']) positive(name,p[name]);
    for(const name of ['phi','eta']) finite(name,p[name],0,8);
    finite('steps',p.steps,20,4000);finite('horizon',p.horizon,0.01,200);
    if(!Number.isInteger(p.steps)) fail('invalid-parameter','steps must be an integer.');
    const gamma=1+p.phi-p.eta,classification=Math.abs(gamma)<1e-10?'critical':gamma>0?'subcritical':'supercritical';
    const divergenceTime=gamma<0?p.A0**gamma/(-gamma*p.k):null;
    const points=[],warnings=[];
    const critAbs=bisectIncreasing(g=>g*(1+p.absorptionTime*g)**p.eta-p.k,0,p.k);
    const critDelay=bisectIncreasing(g=>g*Math.exp((1+p.phi)*g*p.delay)-p.k,0,p.k);
    // The absorption ODE is integrated in log A, log r, using an embedded
    // step-doubling estimate. It retains positive states without clipping.
    let absorption=[Math.log(p.A0),Math.log(p.A0)],absorptionActive=true,absTime=0,powerRangeReported=false;
    const absField=([a,r])=>[p.k*Math.exp(p.eta*r-(1+p.phi)*a),Math.expm1(a-r)/p.absorptionTime];
    function advanceAbs(target) {
      let h=Math.min(target-absTime,p.absorptionTime/5),attempts=0;
      while(absTime<target-1e-12) {
        if(++attempts>20000) {absorptionActive=false;warnings.push({mode:'absorption',code:'resolution-limit',t:absTime,message:'Adaptive integration reached its resolution limit before the requested date.'});return;}
        h=Math.min(h,target-absTime);
        const full=rk4(absorption,h,absField),half=rk4(rk4(absorption,h/2,absField),h/2,absField);
        const error=Math.max(...half.map((v,i)=>Math.abs(v-full[i])/Math.max(1,Math.abs(v))));
        if(!half.every(Number.isFinite)||!Number.isFinite(error)||error>2e-9) {
          h/=2;
          if(h<1e-10*Math.max(1,absTime)) {absorptionActive=false;warnings.push({mode:'absorption',code:'resolution-limit',t:absTime,message:'The absorption path needs time resolution below the numerical limit.'});return;}
          continue;
        }
        absorption=half;absTime+=h;
        if(absorption[0]>680) {absorptionActive=false;warnings.push({mode:'absorption',code:'representability-limit',t:absTime,message:'The finite calculation exceeds the displayed numerical range.'});return;}
        if(error<2e-11) h*=1.6;
      }
    }
    // X=A^(1+phi) gives X'=(1+phi)k X(t-delay)^(eta/(1+phi)).
    // The grid resolves each positive delay by at least eight intervals.
    const internalSteps=Math.ceil(Math.max(p.steps,p.horizon*8/p.delay));
    if(internalSteps>20000) fail('delay-resolution','The requested delay requires more than 20,000 history intervals.');
    const dh=p.horizon/internalSteps,history=[p.A0**(1+p.phi)],r=p.eta/(1+p.phi),coef=(1+p.phi)*p.k;
    let delayActive=true,delayDone=0;
    function past(t) {
      if(t<=0) return history[0];
      const j=t/dh,i=Math.floor(j),fraction=j-i;
      if(i+1>=history.length) return history[i];
      return history[i]*(1-fraction)+history[i+1]*fraction;
    }
    function advanceDelay(targetIndex) {
      while(delayDone<targetIndex&&delayActive) {
        const t=delayDone*dh;
        const next=history[delayDone]+dh*coef/6*(past(t-p.delay)**r+4*past(t+dh/2-p.delay)**r+past(t+dh-p.delay)**r);
        delayDone++;
        if(!Number.isFinite(next)||next<=0) {delayActive=false;warnings.push({mode:'delay',code:'representability-limit',t,message:'The fixed-delay law remains finite at finite dates. Its numerical magnitude exceeds floating-point representation.'});break;}
        history.push(next);
      }
    }
    for(let i=0;i<=p.steps;i++) {
      const t=i*p.horizon/p.steps;
      if(absorptionActive&&i>0) advanceAbs(t);
      advanceDelay(Math.min(internalSteps,Math.ceil(t/dh-1e-10)));
      let power=null;
      if(divergenceTime===null||t<divergenceTime) {
        const logA=Math.abs(gamma)<1e-10?Math.log(p.A0)+p.k*t:Math.log(p.A0**gamma+gamma*p.k*t)/gamma;
        if(logA<700) power=Math.exp(logA);
        else if(!powerRangeReported) {
          warnings.push({mode:'power',code:'representability-limit',t,message:'The instantaneous power path exceeds the displayed numerical range before its analytic endpoint.'});
          powerRangeReported=true;
        }
      }
      const delayed=delayActive?past(t)**(1/(1+p.phi)):null;
      points.push({t,power,absorption:absorptionActive?Math.exp(absorption[0]):null,absorbedCapability:absorptionActive?Math.exp(absorption[1]):null,delay:delayed});
    }
    if(divergenceTime!==null&&divergenceTime<=p.horizon) warnings.push({mode:'power',code:'analytic-divergence',t:divergenceTime,message:'The instantaneous power law reaches its exact finite divergence time.'});
    return {ok:true,points,parameters:p,powerDivergenceTime:divergenceTime,class:classification,
      criticalRates:classification==='critical'?{power:p.k,absorption:critAbs,delay:critDelay}:null,
      diagnostics:{converged:absorptionActive&&delayActive,warnings,delayInternalSteps:internalSteps,interpretation:'Scalar growth laws at a fixed research resource scale. These paths are separate from the career equilibrium.'}};
  });
}

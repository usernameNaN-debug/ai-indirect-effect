import { DEFAULTS, solveMarket, stationaryEquilibrium } from './model.js';

/** All 22 reference relationships, with explicit measurement and conditioning.
 * The reference has 16 nodes. p7 is corrected to qualification value → credit.
 * Current-path, stationary, and local-case calculations retain separate bases.
 */
export const FEEDBACK_NODES = Object.freeze([
  {id:'c',title:'Customer AI',symbol:'c',band:'customers'},
  {id:'prep',title:'Preparation',symbol:'P',band:'customers',subtitle:'Diagnostic-displacement index'},
  {id:'disc',title:'Discovery',symbol:'D',band:'customers',subtitle:'Net service-demand index'},
  {id:'cp',title:'Learning credit',symbol:'ℓ',band:'customers',subtitle:'Numeraire per local case'},
  {id:'m',title:'Practice',symbol:'M',band:'customers'},
  {id:'ds',title:'Expert demand',symbol:'Dₛ',band:'customers'},
  {id:'pf',title:'Pay floor',symbol:'s',band:'careers',subtitle:'Separate local payment rule'},
  {id:'e',title:'Experts',symbol:'E',band:'careers'},
  {id:'w',title:'Hourly wage',symbol:'w',band:'careers'},
  {id:'wp',title:'Parity wage',symbol:'w̄',band:'careers'},
  {id:'x',title:'Formal study',symbol:'x',band:'careers'},
  {id:'d',title:'Career value',symbol:'Δ',band:'careers'},
  {id:'diff',title:'Idea difficulty',symbol:'Aᵠ',band:'research'},
  {id:'a',title:'Frontier',symbol:'A',band:'research'},
  {id:'lr',title:'Research time',symbol:'Lᵣ',band:'research'},
  {id:'my',title:'Machine output',symbol:'uₘ',band:'research',subtitle:'Packets per research dollar'},
]);

const research='appendix_research.tex · research-allocation / research-feedback';
const career='appendix_career.tex · career-denominator / career-derivatives';
const model='MODEL_NOTES.md · Illustrative service portfolio';
const contract='appendix_career.tex · practice-contract / credit restriction';
const growth='appendix_growth.tex · production bounds / grounded clearing';
const num=(label,value,unit='')=>({label,value:Number.isFinite(value)?value:null,unit});

export function feedbackMeasurements({point,points,parameters:options={},creditMode='complete',payFloor=0.5,caseLearning=0.25,caseSaving=0.625,caseBasicWage=1,caseDelta}={}) {
  const q={...DEFAULTS,...options};
  if(!point) {
    const equilibrium=stationaryEquilibrium({...q,A:options.A??q.A0});
    if(!equilibrium.ok) return equilibrium;
    return feedbackMeasurements({point:{...equilibrium,t:0},points,parameters:options,creditMode,payFloor,caseLearning,caseSaving,caseBasicWage,caseDelta});
  }
  if(point&&q.announcementTime!==null&&point.t>=q.announcementTime&&q.announcedMachineMultiplier!==null) q.machineMultiplier=q.announcedMachineMultiplier;
  if(!['complete','floor'].includes(creditMode)) return {ok:false,diagnostics:{code:'credit-mode',message:'Credit mode must be complete or floor.'}};
  if(![payFloor,caseLearning,caseSaving,caseBasicWage].every(Number.isFinite)||caseLearning<=0||caseLearning>1||payFloor<0||caseBasicWage<=payFloor)
    return {ok:false,diagnostics:{code:'local-case-domain',message:'Use a positive case learning probability, and a cash floor below the case basic wage.'}};
  const m=solveMarket({...q,E:point?.E??q.E0,A:point?.A??q.A0});
  if(!m.ok) return m;
  const s=stationaryEquilibrium({...q,A:m.A});
  const Delta=point?.Delta??(s.ok?s.Delta:0),x=Delta/q.kappa,T=(1-m.E)*x;
  const privateCaseValue=caseDelta??Delta;
  if(!Number.isFinite(privateCaseValue)||privateCaseValue<0) return {ok:false,diagnostics:{code:'local-case-domain',message:'Local case qualification value must be nonnegative.'}};
  const fullCredit=privateCaseValue*caseLearning,cap=caseBasicWage-payFloor;
  const discount=creditMode==='floor'?Math.min(fullCredit,cap):fullCredit;
  const binding=creditMode==='floor'&&fullCredit>cap+1e-10;
  const kink=creditMode==='floor'&&Math.abs(fullCredit-cap)<=1e-10;
  const credit={mode:creditMode,payFloor,caseLearning,caseSaving,caseBasicWage,Delta:privateCaseValue,fullCredit,cap,discount,
    transitionPrice:discount/caseLearning,binding,kink,passThrough:fullCredit>0?discount/fullCredit:null,
    privateGain:caseSaving-discount,completeContractGain:caseSaving-fullCredit,
    decision:caseSaving>discount?'Prepare':caseSaving<discount?'Retain diagnostic work':'Indifferent',
    basis:'Payment effects are evaluated for a separate marginal case within the selected macro portfolio.',
    paperExample:{b:1,s:0.5,resourceCost:0.375,saving:0.625,fullLearningCredit:0.75,cappedCredit:0.5,privateGain:0.125,resourceGain:-0.125},
  };
  const displacement=q.M0>0?1-m.M/q.M0:null,demandIndex=m.C/q.C0;
  const epsH=(q.alpha*m.A**-q.alpha+q.nu*q.vR*m.A**-q.nu)/(m.A**-q.alpha+q.vR*m.A**-q.nu);
  const epsM=(q.mu*m.A**-q.mu+q.zeta*q.mR*m.A**-q.zeta)/(m.A**-q.mu+q.mR*m.A**-q.zeta);
  const Omega=-m.w/(m.E*m.derivatives.wE);
  const wageScaleElasticity=-m.DS*m.derivatives.wE/m.w;
  const wageHeadcountElasticity=m.E*m.derivatives.wE/m.w;
  const researchHeadcountElasticity=m.E*m.derivatives.FEoverF;
  const R=q.rho+q.delta;
  let stat={ok:false,diagnostics:s.diagnostics};
  if(s.ok) {
    const xE=s.derivatives.wE/(q.kappa*(R+s.x));
    const Lambda=q.delta+s.x-(1-s.E)*xE;
    stat={...s,xE,Lambda,dEdM:1/Lambda,replacementFraction:1-q.delta/Lambda,dDeltadW:1/(R+s.x),
      deltaPremiumElasticity:(s.w-q.b)/(s.Delta*(R+s.x)),reference:'Stationary careers are solved separately at the displayed frontier.'};
  }
  const nearBoundary=q.method==='both'&&m.A>=q.machineAvailableA&&(Math.abs(m.wbar-m.w0)<1e-7||Math.abs(m.wbar-m.w1)<1e-7);
  const machineActive=['mixed','machine','grounded'].includes(m.regime);
  const humanLaborActive=['human','mixed','grounded'].includes(m.regime);
  const nodes=Object.fromEntries(FEEDBACK_NODES.map(n=>[n.id,{...n}]));
  const values={c:m.c,prep:displacement,disc:demandIndex,cp:discount,m:m.M,ds:m.DS,pf:payFloor,e:m.E,w:m.w,wp:m.wbar,x,d:Delta,diff:m.A**q.phi,a:m.A,lr:m.LR,my:1/(q.q*m.aM)};
  for(const [id,value] of Object.entries(values)) {nodes[id].value=value;nodes[id].active=true;}
  nodes.pf.active=creditMode==='floor';nodes.wp.active=m.regime==='mixed';nodes.lr.active=humanLaborActive;nodes.my.active=machineActive;
  const edges={};
  function add(id,from,to,title,measure,value,formula,conditioning,source,extra={}) {
    edges[id]={id,from,to,title,measure,value:Number.isFinite(value)?value:null,formula,conditioning,source,regime:m.regime,active:true,basis:'current frozen market',secondary:[],status:Number.isFinite(value)?'measured':'undefined',...extra};
  }
  add('p1','c','prep','Capability and diagnostic displacement','marginal derivative',displacement===null?null:q.practice!==undefined?0:q.practiceDecay*(1-displacement),
    'dP/dc = β exp(−βc), P = 1 − M/M₀',
    'P records diagnostic displacement implied by the numerical portfolio. Estimating a customer preparation-share elasticity would require a distribution of mode-choice margins.',model,
    {basis:'specified portfolio index',secondary:[num('Practice semielasticity d ln M / dc',q.practice!==undefined?0:-q.practiceDecay,'per capability unit'),num('Diagnostic displacement index',displacement)]});
  add('p2','c','disc','Capability and the net demand index','semielasticity',q.demandGrowth,
    'd ln D/dc = γ, D = C(c)/C₀ = exp(γc)',
    'Discovery and preparation enter through the chosen net service-demand response. Its index falls when preparation outweighs discovery.',model,
    {basis:'specified portfolio index',secondary:[num('Net service-demand index',demandIndex),num('Index derivative dD/dc',q.demandGrowth*demandIndex)]});
  add('p3','disc','ds','Demand scale and purchased expert hours','elasticity',1,
    '∂ ln Dₛ / ∂ ln D = 1',
    'Hold the hourly wage and baseline scale C₀ fixed. Service demand is C₀D w^(−ε).',model,
    {secondary:[num('Service wage elasticity',-q.epsilon),num('Current service hours',m.DS,'hours / model time')]});
  add('p4','prep','m','Diagnostic displacement and practice','marginal derivative',-q.M0,
    'dM/dP = −M₀',
    'Practice follows the accounting definition M=M₀(1−P) for the displayed displacement index.',model,
    {basis:'specified portfolio index',secondary:[num('Practice retained',q.M0>0?m.M/q.M0:null,'share'),num('Practice flow',m.M,'transitions / model time')]});
  add('p5','cp','prep','Learning credit and the preparation choice','choice margin',credit.privateGain,
    'G = saving − ℓ; prepare when G > 0',
    'Hold the local case saving and transition probability fixed. Increasing its credit lowers G one for one. Aggregating preparation responses requires a distribution of case margins.',contract,
    {basis:'separate local case',secondary:[num('Marginal choice-surplus response dG/dℓ',-1),num('Saving',caseSaving,'numeraire / case'),num('Credit ℓ',discount,'numeraire / case')],decision:credit.decision});
  add('p6','pf','cp','Cash compensation and the credit cap','marginal derivative',kink?null:binding?-1:0,
    'ℓ = min(Δm, b_case − s); dℓ/ds = −1 when binding',
    'Each displayed case uses one basic hour under a rule prohibiting separate placement charges. At equality, one-sided derivatives are −1 and 0.',contract,
    {basis:'separate local case',active:creditMode==='floor',status:kink?'one-sided boundary':'measured',secondary:[num('Credit cap',cap,'numeraire / case'),num('Fraction of full learning value paid',credit.passThrough,'share')]});
  add('p7','d','cp','Qualification value and the learning credit','marginal derivative',kink?null:binding?0:caseLearning,
    'dℓ/dΔ = m under complete pricing; 0 at a binding cap',
    'Hold the transition probability and local cash-pay rule fixed. Qualification value affects the credit under the exogenous cash-floor rule.',contract,
    {basis:'separate local case',status:kink?'one-sided boundary':'measured',secondary:[num('Credit elasticity to Δ',fullCredit>0&&!kink?(binding?0:1):null),num('Per-transition price a = ℓ/m',credit.transitionPrice)]});
  add('p8','ds','w','Service-demand shifts and the clearing wage','elasticity',wageScaleElasticity,
    '∂ ln w / ∂ ln C = −Dₛ w_E / w',
    'Hold E, A, research technology, and the budget fixed while scaling the whole service demand schedule. Equal-cost substitution gives zero inside the mixed region.',research,
    {secondary:[num('Service share of expert hours',m.DS/m.E,'share'),num('Effective demand elasticity Ω',Number.isFinite(Omega)?Omega:null)]});
  add('p9','m','e','Stationary expertise response to practice','marginal derivative',stat.ok?stat.dEdM:null,
    'dE*/dM = 1/Λ; Λ = δ + x* − (1−E*)x_E',
    'Use the separately solved stationary economy at this frontier, with its inverse wage schedule fixed. Stationarity gives the long-run comparison, while current expertise drift has ∂Ė/∂M=1.',career,
    {basis:'stationary career comparison',regime:stat.regime,referenceState:stat.ok?{E:stat.E,A:stat.A,w:stat.w,Delta:stat.Delta,x:stat.x}:null,status:stat.ok?'measured':'stationary unavailable',secondary:[num('Current drift coefficient ∂Ė/∂M',1),num('Stationary E*',stat.E),num('Career adjustment denominator Λ',stat.Lambda),num('Formal replacement fraction',stat.replacementFraction,'share')]});
  add('p10','e','w','Expert headcount and scarcity wages','elasticity',wageHeadcountElasticity,
    '∂ ln w / ∂ ln E = E w_E / w',
    'Hold frontier and the customer interface fixed and clear services with the available research methods. Exact demand slopes determine the response in the selected market.',research,
    {secondary:[num('Marginal wage response w_E',m.derivatives.wE),num('Research elasticity ∂ ln F / ∂ ln E',researchHeadcountElasticity)]});
  add('p11','w','d','Permanent wages and stationary career value','marginal derivative',stat.ok?stat.dDeltadW:null,
    'dΔ*/dw = 1/(ρ + δ + x*)',
    'Stationary Bellman values give this derivative. Finite-horizon wages affect current value through their positive discounted kernel and the terminal payoff.',career,
    {basis:'stationary wage-value identity',regime:stat.regime,referenceState:stat.ok?{E:stat.E,A:stat.A,w:stat.w,Delta:stat.Delta,x:stat.x}:null,status:stat.ok?'measured':'stationary unavailable',secondary:[num('Elasticity of Δ* to wage premium w*−b',stat.deltaPremiumElasticity),num('Stationary Δ*',stat.Delta),num('Forward value-equation coefficient ∂Δ̇/∂w',-1)],dynamicKernel:[]});
  if(Array.isArray(points)&&points.length>1&&point) {
    let integral=0,last=point;
    for(const next of points.filter(v=>v.t>point.t)) {
      integral+=(R+(last.Delta+next.Delta)/(2*q.kappa))*(next.t-last.t);
      edges.p11.dynamicKernel.push({lag:next.t-point.t,value:Math.exp(-integral)});last=next;
    }
  }
  add('p12','d','x','Qualification value and private study','elasticity',Delta>0?1:null,
    'x = Δ/κ; ∂ ln x / ∂ ln Δ = 1',
    'Hold the teaching cost parameter fixed. At zero terminal value, use the level derivative 1/κ.',career,
    {secondary:[num('Level derivative dx/dΔ',1/q.kappa),num('Current study hazard x',x,'per model time')]});
  add('p13','x','e','Formal study and occupational entry','accounting share',m.M+T>0?T/(m.M+T):null,
    'Formal entry share = T/(M+T); T=(1−E)x',
    'Formal study supplies this share of current new qualifications. Its corresponding state-equation derivative holds E fixed.',career,
    {secondary:[num('Marginal drift response ∂Ė/∂x',1-m.E),num('Formal transition flow T',T,'transitions / model time'),num('Obsolescence flow δE',q.delta*m.E,'transitions / model time')]});
  add('p14','wp','w','Parity and the clearing wage','marginal derivative',nearBoundary?null:m.regime==='mixed'?1:0,
    'w = min(w₁, max(w₀, w̄)); ∂w/∂w̄ = 1 inside mixing',
    'Hold the two corner wage schedules fixed while moving the parity wage. At an endpoint, the one-sided derivatives are zero and one.',research,
    {active:m.regime==='mixed'||nearBoundary,status:nearBoundary?'one-sided boundary':'measured',secondary:[num('Service-only wage w₀',m.w0),num('Human-research wage w₁',m.w1),num('Parity wage w̄',m.wbar)]});
  const laborElasticity=m.regime==='human'?-m.w/m.h:m.regime==='grounded'?-m.w*m.aG/m.kStar:null;
  add('p15','w','lr','Research hours purchased from a fixed budget','elasticity',laborElasticity,
    m.regime==='grounded'?'∂ ln Lᵣ/∂ ln w = −w a_G/k_G':'∂ ln Lᵣ/∂ ln w = −w/(w+qξ)',
    m.regime==='mixed'?'Mixed procurement pins w and assigns the residual E−Dₛ to human research, leaving an independent wage elasticity on the cleared branch undefined.':m.regime==='machine'?'Autonomous procurement purchases zero expert hours. Zero labor use gives a zero level response and an undefined logarithmic elasticity.':'Hold the frontier, procurement budget, and input prices fixed within the selected strict research corner.',research,
    {active:m.regime==='human'||m.regime==='grounded',secondary:[num('Research labor share of budget',m.w*m.LR/q.BR,'share'),num('Research hours Lᵣ',m.LR),num('Mixed labor response ∂Lᵣ/∂E',m.regime==='mixed'?1:null)]});
  add('p16','lr','a','Research labor and completed frontier increments','elasticity',m.regime==='machine'?null:m.regime==='mixed'?0:1,
    m.regime==='mixed'?'d ln F / d ln Lᵣ = 0 under equal-cost reallocation':'d ln F / d ln Lᵣ = 1 at a strict labor-using research corner',
    'Move inherited headcount at matched A and customer technology, with procurement clearing throughout. Inside mixing, the fixed budget substitutes human and machine packets at equal unit cost.',research,
    {active:humanLaborActive,secondary:[num('Full cleared headcount elasticity E F_E/F',researchHeadcountElasticity),num('Current frontier drift F',m.F,'frontier units / model time')]});
  add('p17','a','c','Frontier and customer capability','semielasticity',q.kappaC,
    'dc/d ln A = κc',
    'Capability is measured in levels per unit log change in frontier productivity. At c=0, the ordinary log-log elasticity is undefined.',model,
    {secondary:[num('Level derivative dc/dA',q.kappaC/m.A),num('Log-log elasticity of c to A',m.c!==0?q.kappaC/m.c:null)]});
  add('p18','a','diff','Frontier and the difficulty of another increment','elasticity',q.phi,
    'd ln(A^φ)/d ln A = φ',
    'Difficulty counts completed packets per absolute frontier increment.',growth,
    {secondary:[num('Difficulty index A^φ',m.A**q.phi)]});
  add('p19','diff','a','Idea difficulty and frontier drift','elasticity',-1,
    '∂ ln F / ∂ ln difficulty = −1',
    'Hold the completed packet flow fixed. Frontier drift F is the output of this link, with the frontier stock accumulating that flow.',growth,
    {secondary:[num('Completed packet flow',m.humanPackets+m.machinePackets),num('Frontier drift F',m.F)]});
  add('p20','a','my','Complete machine productivity at the current frontier','elasticity',epsM,
    'εM = (μ A^(−μ) + ζ mR A^(−ζ))/(A^(−μ)+mR A^(−ζ))',
    'Hold the resource multiplier and compute price fixed. Generation and validation jointly determine the displayed finite-frontier elasticity, which approaches the minimum exponent as the frontier increases.',research,
    {active:machineActive,secondary:[num('Human complete-method elasticity εH',epsH),num('Machine asymptotic exponent min(μ,ζ)',Math.min(q.mu,q.zeta)),num('Packets per dollar uM',1/(q.q*m.aM))]});
  let packetGain=m.regime==='human'?0:1;
  if(m.regime==='grounded') {
    const JG=-m.derivatives.serviceW+q.BR*m.aG*m.aG/(m.kStar*m.kStar);
    packetGain=q.q*m.aM/m.kStar*(-m.derivatives.serviceW)/JG;
  }
  add('p21','my','a','Machine packets per dollar and frontier drift','elasticity',packetGain,
    m.regime==='grounded'?'∂ ln F/∂ ln uM = (q aM/kG)(−D_w)/J_G':'∂ ln F / ∂ ln uM = 1 in machine or mixed procurement',
    'Vary machine resource efficiency at fixed frontier, inherited headcount, service demand, and budget, clearing the expert market. Unused autonomous methods have zero local output effect at a strict human corner.',research,
    {active:machineActive,secondary:[num('Frontier drift F',m.F),num('Machine packets per dollar uM',1/(q.q*m.aM))]});
  const parityLogDerivative=(m.wbar+q.q*q.xi)*(epsH-epsM);
  add('p22','my','wp','Relative complete-method productivity and parity wages',m.wbar>0?'elasticity':'marginal derivative',m.wbar>0?parityLogDerivative/m.wbar:parityLogDerivative,
    m.wbar>0?'d ln w̄/d ln A = [(w̄+qξ)/w̄](εH−εM)':'dw̄/d ln A = (w̄+qξ)(εH−εM)',
    'Increase frontier productivity with both complete methods evolving. Wage and compute costs jointly enter the ratio, while parity transmits to the market wage during mixed procurement.',research,
    {active:m.regime==='mixed',secondary:[num('Human elasticity εH',epsH),num('Machine elasticity εM',epsM),num('Parity log-input derivative dw̄/d ln A',parityLogDerivative)]});
  if(nearBoundary) for(const id of ['p8','p10','p15','p16','p21']) {
    edges[id].status='one-sided branch';
    edges[id].conditioning+=' At this regime boundary the displayed coefficient uses the solver’s selected one-sided branch.';
  }
  return {ok:true,nodes,edges,stationary:stat,credit,market:m,
    diagnostics:{nodeCount:FEEDBACK_NODES.length,edgeCount:Object.keys(edges).length,regime:m.regime,nearRegimeBoundary:nearBoundary,macroContract:'Complete pricing in the selected strict portfolio',localCaseSeparate:true,
      message:'Each edge states its own measurement and conditioning. Current market, stationary careers, and a separate local case retain distinct reference states.'}};
}

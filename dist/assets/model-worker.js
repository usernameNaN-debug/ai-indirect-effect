import { solveBoundaryPath, stationaryEquilibrium, solveMarket, growthPaths } from './model.js';

const jobs={path:solveBoundaryPath,stationary:stationaryEquilibrium,market:solveMarket,growth:growthPaths};
self.addEventListener('message',({data})=>{
  const {id,type='path',options={}}=data||{};
  const calculate=jobs[type];
  if(!calculate) {
    self.postMessage({id,result:{ok:false,diagnostics:{code:'unknown-job',message:`Unknown numerical job ${type}.`}}});
    return;
  }
  try {self.postMessage({id,result:calculate(options)});}
  catch(error) {self.postMessage({id,result:{ok:false,diagnostics:{code:'worker-failure',message:error.message}}});}
});

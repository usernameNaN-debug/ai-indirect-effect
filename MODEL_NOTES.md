# Numerical model and validation

The website solves the career and research equations in `../feedback_refinement_2026_10_12/` for an explicitly specified illustrative economy. Time is measured in model time units. Productivity is an index with initial value one. Wages, costs, and private qualification values use the model's numeraire. Expert population and labor quantities use a population normalized to one. Numerical magnitudes are illustrative parameters, with no empirical calibration.

## Source and scope

The authoritative equations are in the current paper components.

| Calculation | Paper source labels |
| --- | --- |
| Binary learning risk | `appendix_career.tex`, `eq:binary-risk`, `eq:information-comparison` |
| Private careers and formal study | `appendix_career.tex`, `eq:career`, `eq:stationary-study` |
| Partial replacement after stationary practice loss | `appendix_career.tex`, `eq:finite-flow-balance` |
| Complete research methods | `appendix_research.tex`, `eq:research-human-cost`, `eq:research-machine-cost` |
| Exact market clearing and procurement | `appendix_research.tex`, `eq:research-allocation`, `eq:research-field` |
| Conditional local research derivatives | `appendix_research.tex`, `eq:research-feedback` |
| Finite career boundary conditions | `appendix_equilibrium.tex`, `eq:eqm-fields`, finite-careers section |
| Grounded machine research | `appendix_growth.tex`, `eq:growth-grounded-clearing`, `eq:growth-grounded-feedback` |
| Local welfare | `appendix_joint_welfare.tex`, `eq:jw-preparation-welfare` |
| Absorption and fixed research duration | `appendix_growth.tex`, `eq:growth-absorption-system`, `eq:growth-minimum-delay` |

The supplied `paper_feedback_system_elasticities.html` was inspected as a reference. Its effective demand elasticity and exponential shock curves serve as interaction references. The numerical engine below implements the paper's market equations and career boundary problem directly.

## Illustrative service portfolio

The selected customer portfolio uses

\[
c=\kappa_c\log(A/A_0),\quad C(c)=C_0e^{\gamma c},\quad
D_S=C(c)w^{-\epsilon},\quad M(c)=M_0e^{-\beta c}.
\]

The API names `demandGrowth` and `practiceDecay` correspond to \(\gamma\) and \(\beta\). They change the scale of purchased expert services and the flow of diagnostic qualification transitions. A positive discovery parameter raises service demand at a fixed wage. A negative parameter represents net preparation or self-service that reduces purchased hours. Practice is measured in transitions per model time unit. Formal transition flow is \(T=(1-E)\Delta/\kappa\).

This is the paper's strict selected-portfolio specialization with aggregate service demand and practice independent of the contemporaneous qualification value. In the general customer mode economy, both quantities can depend on \(\Delta\). The displayed paths use the specified specialization. The binary learning experiment is a separate information calculation, with access and signal reliability determining its Bayes risk. Its risk reduction is not automatically a macroeconomic transition rate.

Basic hours are set to `basicDemand = 0.02`. Every accepted career path has \(1-E>0.02\), keeping the outside basic activity available. The numerical state checks enforce \(0<E<1\), positive productivity, \(w\ge b\), and nonnegative qualification value. The public frozen-market function also reports whether a state has a positive wage premium, because procurement itself can clear outside the career interior.

The research coefficients are

\[
a_H=A^{-\alpha}+v_RA^{-\nu},\qquad
a_M=s_M(A^{-\mu}+m_RA^{-\zeta}).
\]

Here `machineMultiplier` is the illustrative resource scale \(s_M\). It multiplies both complete machine stages. `method = 'both'` compares complete human and autonomous methods with the paper's exact clamped wage. `method = 'human'` restricts availability to human research. `method = 'grounded'` selects the separate sole grounded-machine method \(k_G=qa_M+wa_G\), \(a_G=g_GA^{-\chi}\). Grounded procurement counts expert costs as \(wL_R\) and machine costs as \(qQ_M\). The human method's extra compute requirement \(q\xi L_R\) belongs to that method alone.

## Solved career paths

The joint state and value equations are

\[
\dot E=M+(1-E)\Delta/\kappa-\delta E,\qquad
\dot\Delta=(\rho+\delta)\Delta-(w-b)+\Delta^2/(2\kappa),\qquad
\dot A=A^{-\phi}B_R/k_*.
\]

The default boundaries are \(E(0)=0.55\), \(A(0)=1\), and \(\Delta(12)=0\). The terminal value represents the specified finite career payoff. It influences investment near the endpoint and earlier through expected earnings. Setting `terminalDelta` supplies a positive continuation payoff. A proposed `initialDelta` is rejected because initial qualification value is an output of this boundary problem.

The default initial expertise is an inherited state. A separate stationary calculation holds the frontier fixed and solves both career flow equations. Its stationary value supplies the frozen-frontier comparison, while the boundary solver lets productivity evolve.

The solver uses damped forward and backward iteration. For each interval it places \(E,A,\Delta\) at the implicit midpoint. Given midpoint \(\Delta\), the expert-state equation is linear in midpoint \(E\). Eliminating that variable leaves a scalar implicit frontier equation, solved with a local Newton step. The value equation is integrated backward using the positive root of its scalar midpoint quadratic. Repeating these passes reaches a common collocation path. The output includes separate state, value, frontier, market, budget, and boundary residuals. A path is accepted only after iteration convergence and a maximum equation residual below \(10^{-6}\).

Announced changes to `machineMultiplier` are represented by `announcementTime` and `announcedMachineMultiplier`. The grid includes the announcement date exactly, and each interval uses its own applicable coefficients. Equal-cost regime changes arise from procurement at each computed state. The announcement preset is a numerical comparison with possible regime changes. The paper's analytic mixed-region anticipation proposition has the additional assumption that both economies remain mixed throughout its comparison.

The selected defaults and presets pass mesh-refinement checks. Numerical convergence establishes a solution of the checked boundary discretization and its mesh consistency. The paper provides its separate compact-region existence and local determinacy conditions.

The interface bounds are exported as `PARAMETER_RANGES`. Combining extreme values can leave the positive-premium career region. Such a request returns `ok: false` with a named diagnostic and no path. States, qualification values, and wages are never clipped to manufacture a feasible equilibrium. Tiny negative procurement tolerances occur only in accounting checks around roundoff. The wage clamp implements the economic allocation theorem.

## Welfare and growth

`localWelfare` evaluates

\[
\mathcal W=P-(\lambda-\Delta)m+(\Pi-h)\chi_Re.
\]

Its social continuation values \(\lambda\) and \(\Pi\) are inputs. The function displays the paper's local derivative at a strict human-research corner conditional on these inputs. It does not infer an economy-wide welfare level from career paths. The derivative \(\chi_R\) is computed from market clearing when supplied by the human procurement illustration. When social wedges vanish, the calculation equals the supplied private gain \(P\).

`growthPaths` compares three scalar laws at a fixed research resource scale.

\[
\dot A=kA^{\eta-\phi},\qquad
\dot A=kr^\eta A^{-\phi},\quad\dot r=(A-r)/\ell,\qquad
\dot A=kA(t-\tau)^\eta A^{-\phi}.
\]

These growth paths are separate from the joint career equilibrium. The instantaneous law is evaluated analytically. Its finite divergence time is returned exactly, with missing values after that time. The absorption law uses adaptive fourth-order Runge–Kutta integration in log coordinates, with step doubling for accuracy. The fixed-duration law uses \(X=A^{1+\phi}\), a positive constant history \(A(t)=A_0\) on \([-\tau,0]\), and the method of steps. Simpson integration of the delayed forcing and linear history interpolation give second-order convergence. The internal mesh resolves every positive delay by at least eight intervals.

At \(\eta=1+\phi\), returned long-run rates solve \(g(1+\ell g)^\eta=k\) for absorption and \(g\exp((1+\phi)g\tau)=k\) for fixed duration. These are asymptotic rates. At supercritical exponents the delayed law is finite at every finite date. Extremely large delayed values can exceed floating-point representation, which is reported as a numerical representability limit rather than an economic divergence date. Absorption resolution failures likewise return explicit warnings. The chart must display warnings when the requested numerical horizon cannot be completed.

## API

All functions return `{ ok, diagnostics, ... }`. An unsuccessful calculation returns a diagnostic `code`, explanatory `message`, relevant state or parameter details, and no fabricated path.

- `solveMarket(options)` returns `w`, `w0`, `w1`, `wbar`, `DS`, `LR`, `QM`, `F`, `M`, `regime`, method costs, packet flows, accounting residuals, and conditional derivatives. `derivatives.FEoverF` is \(F_E/F\) at matched frontier, customer capability, and private value. It is a local derivative.
- `stationaryEquilibrium(options)` adds the stationary `E`, `Delta`, study hazard `x`, aggregate formal transitions `T`, training expenditure, and expert income. An optional `practice` overrides diagnostic transition flow in the frozen comparison.
- `solveBoundaryPath(options)` returns `points` with all market quantities, state and value variables, study and training quantities, and `diagnostics` for the entire boundary calculation.
- `learningRisk({rB,rA,access})` returns ex ante risk, paired-signal risk, explanation-only risk, known-foundation risk, and risk reduction.
- `localWelfare({P,lambda,Delta,m,Pi,h,chiR,e})` returns `W`, `privateGain`, `learningCost`, and `researchGain`. Supplying `E` and `kappa` also returns the short-intervention derivative for a training subsidy.
- `growthPaths(options)` returns `points` containing `power`, `absorption`, `delay`, and `absorbedCapability`, the threshold class, analytic power divergence time, critical asymptotic rates, and numerical warnings.

The module worker accepts `{ id, type, options }` and replies `{ id, result }`. Types are `path`, `stationary`, `market`, and `growth`. A caller can ignore obsolete request IDs when controls change. Each request is deterministic.

## Reproducible checks

Run `node scripts/check-model.mjs` from the site directory. The script executes 4,934 assertions over independent accounting identities, exact limiting cases, finite-difference derivatives, all presets, boundary conditions, stationary practice replacement, numerical failure handling, mesh refinement, and the complete feedback measurement ledger. An additional closed-form joint benchmark has constant mixed-method wages, stationary expertise and qualification value, and a linearly growing frontier. The numerical solution matches all three exact paths to below \(10^{-9}\). `FEEDBACK_NOTES.md` documents all 22 graph links and their distinct conditioning.

Results with the delivered defaults are as follows.

| Check | Result |
| --- | --- |
| Seven career presets | Converged in 20–23 iterations |
| Largest preset equation residual | \(1.18\times10^{-10}\) |
| Initial and terminal boundary residual | Zero |
| Human path, 120 to 240 intervals | Max \(E,\Delta,A\) discrepancy \(4.185\times10^{-5}\) |
| Human path, 240 to 480 intervals | Max discrepancy \(1.046\times10^{-5}\), ratio 4.000 |
| Switching path, 240 to 480 intervals | Max discrepancy \(6.602\times10^{-6}\) |
| Announcement path, 240 to 480 intervals | Max discrepancy \(1.825\times10^{-5}\) |
| Fixed-duration endpoint, 120 to 240 intervals | Discrepancy \(3.576\times10^{-5}\) |
| Fixed-duration endpoint, 240 to 480 intervals | Discrepancy \(8.940\times10^{-6}\) |

For the frozen human-research economy, reducing practice from 0.04 to 0.01 lowers stationary expertise from 0.57240445 to 0.46847471. Formal training replaces 0.584281 of the lost diagnostic transitions, and the exact flow identity is satisfied to below \(10^{-10}\). This number describes the selected illustrative parameters.

With \(k=0.12\), \(\phi=0.7\), \(\eta=1.7\), and both timing parameters equal to 1.5, the critical long-run growth rates are 0.120000 for instantaneous uptake, 0.0955613 for gradual absorption, and 0.0943415 for fixed duration.

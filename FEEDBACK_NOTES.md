# Full feedback measurement ledger

`dist/assets/feedback-model.js` exports `FEEDBACK_NODES` and `feedbackMeasurements`. The supplied HTML has 16 nodes and 22 edges. The ledger preserves these relationships, with one topology correction. Original edge `p7` has formula `a = Δ` and description qualification value to credit, while its SVG endpoint is the exogenous pay-floor node. The implemented economic edge runs from qualification value `d` to learning credit `cp`. The pay floor has its own incoming-to-credit edge `p6`.

## Measurement bases

The graph combines four expressly named calculations.

1. Current frozen-market coefficients use the selected boundary path's inherited `E`, frontier `A`, current technology, and research procurement regime. These are exact derivatives or finite-stage technology elasticities from the numerical model.
2. Stationary career coefficients use a separate fixed-frontier equilibrium solved at the displayed `A`. Its expert share, wage, study intensity, and qualification value are returned under `stationary`. In particular, `dE*/dM` and `dΔ*/dw` use this reference state.
3. The payment rule evaluates a separate marginal case, using the selected private qualification value or an explicitly supplied local value. It shows the financed fee discount, the customer's preparation surplus, and whether a pay floor binds.
4. The portfolio's preparation and discovery nodes are declared indices. `P=1−M/M0` measures diagnostic displacement, while `D=C(c)/C0` measures the net service-demand shift. They exactly encode the implemented portfolio functions. An aggregate customer mode-choice derivative would additionally require a specified distribution of case margins.

The macro boundary solver retains complete practice pricing and the strict selected portfolio. Changing the local pay-floor example changes that case's displayed credit and surplus. It leaves the macroeconomic scenario fixed. The full customer-choice model's learning-credit channel is represented by its economic margin, while the selected macro specialization has locally fixed customer mode choices with respect to `Δ`.

Each edge returns a `measure`, numerical `value`, `formula`, `conditioning`, `source`, `basis`, `active` flag, and additional labeled quantities under `secondary`. Logarithmic derivatives at zero quantities have `value = null`. The corresponding level derivative or zero-use statement remains visible in the metadata. A number labeled elasticity is dimensionless. Semielasticities, marginal derivatives, accounting shares, and case surpluses have their own units and cannot be ranked together by the raw coefficient alone.

## Edge definitions

Write `h=w+qξ`, `F=Ȧ`, `R=ρ+δ`, and `w_E` for the exact cleared wage derivative. The index `D` below differs from aggregate purchased hours `Dₛ`. The local credit `ℓ` is a numeraire fee discount per case, while the per-transition practice price is `a=ℓ/m`.

| Edge | Relationship | Primary measure | Conditioning |
| --- | --- | --- | --- |
| p1 | Customer capability → preparation | `dP/dc = β exp(−βc)` | Diagnostic-displacement index. Also displays `d ln M/dc = −β`. |
| p2 | Customer capability → discovery | `d ln D/dc = γ` | Net demand-scale index at the specified customer interface. |
| p3 | Discovery → expert demand | `∂ ln Dₛ/∂ ln D = 1` | Fixed wage and baseline demand scale. |
| p4 | Preparation → practice | `dM/dP = −M0` | Exact identity `M=M0(1−P)`. |
| p5 | Credit → preparation | `G=saving−ℓ` | Local choice surplus. Prepare when positive. The local surplus derivative is `dG/dℓ=−1`. |
| p6 | Pay floor → credit | `dℓ/ds = −1` if binding, otherwise `0` | Local one-basic-hour case. Credit `ℓ=min(Δm,b_case−s)`. |
| p7 | Qualification value → credit | `dℓ/dΔ=m` under complete pricing, `0` if capped | Fixed case probability and payment rule. |
| p8 | Service demand → wage | `∂ ln w/∂ ln C = −Dₛ w_E/w` | Scale the service schedule at fixed inherited `E,A` and research budget. |
| p9 | Practice → experts | `dE*/dM = 1/Λ` | Separate stationary equilibrium, `Λ=δ+x*−(1−E*)x_E`. Also reports instantaneous drift coefficient `∂Ė/∂M=1`. |
| p10 | Experts → wage | `∂ ln w/∂ ln E = E w_E/w` | Exact cleared market at fixed frontier and customer interface. |
| p11 | Wage → qualification value | `dΔ*/dw = 1/(R+x*)` | Stationary Bellman identity. Future wage paths use the positive kernel described below. |
| p12 | Qualification value → study | `∂ ln x/∂ ln Δ=1` | Positive values and fixed training cost. Level derivative `1/κ` at the terminal zero value. |
| p13 | Study → experts | `T/(M+T)` | Accounting share of new qualifications supplied by formal study. Also reports `∂Ė/∂x=1−E`. |
| p14 | Parity wage → market wage | `∂w/∂w̄=1` within mixing, otherwise `0` | Fixed corner wage schedules. At endpoints use one-sided derivatives. |
| p15 | Wage → research hours | `∂ ln Lᵣ/∂ ln w=−w/h` | Strict human corner and fixed budget. Grounded corner has `−waG/kG`. Mixing pins the wage, and zero machine-corner labor has no log elasticity. |
| p16 | Research hours → frontier drift | Cleared elasticity `1` at strict labor-using corners and `0` within mixing | Vary inherited headcount at matched frontier and technology. Mixed procurement substitutes equal-cost packets under a fixed budget. |
| p17 | Frontier → customer capability | `dc/d ln A=κc` | A level change in capability per log change in frontier. The ordinary level derivative is `κc/A`. |
| p18 | Frontier → idea difficulty | `d ln(A^φ)/d ln A=φ` | Difficulty per absolute frontier increment. |
| p19 | Difficulty → frontier drift | `∂ ln F/∂ ln difficulty=−1` | Fixed completed packet flow. The affected quantity is drift `F`. |
| p20 | Frontier → machine output per dollar | Complete-method elasticity `εM` | Fixed resource multiplier and compute price, with both generation and validation requirements included. |
| p21 | Machine output per dollar → frontier drift | `1` in mixed/machine procurement, `0` at an unused strict human corner | Fixed `A,E`, service schedule, and budget, with market clearing. Grounded case accounts for the induced wage response. |
| p22 | Relative research productivity → parity wage | `d ln w̄/d ln A=[(w̄+qξ)/w̄](εH−εM)` | Both complete methods evolve with the frontier. Uses a level derivative when the parity wage is nonpositive. |

## Exact research elasticities

The effective wage elasticity is computed from the actual market derivative,

\[
\Omega=-\frac{w}{Ew_E},\qquad
\frac{\partial\log w}{\partial\log E}=-\frac1\Omega.
\]

In the human regime this equals

\[
\Omega=\epsilon\frac{D_S}{E}
+\frac{w}{w+q\xi}\frac{L_R}{E}.
\]

Both weights and the human wage share are endogenous. The shared-market research elasticity is `E * derivatives.FEoverF`. It is positive at strict human and grounded corners and zero within mixed or autonomous procurement. It appears as a secondary result on `p10` and `p16`.

The complete human and machine technology elasticities are the finite-frontier weighted expressions

\[
\epsilon_H=
\frac{\alpha A^{-\alpha}+\nu v_RA^{-\nu}}
     {A^{-\alpha}+v_RA^{-\nu}},\qquad
\epsilon_M=
\frac{\mu A^{-\mu}+\zeta m_RA^{-\zeta}}
     {A^{-\mu}+m_RA^{-\zeta}}.
\]

Their asymptotic limits are the respective minimum exponents. The parity-wage formula includes the finite-frontier ratio `(wbar+q*xi)/wbar`, as well as these complete-method elasticities.

For sole grounded-machine procurement, let `JG=−D_w+B_R aG²/kG²`. A rise in autonomous packets per dollar lowers machine resource costs while increasing the wage bid for grounding hours. Clearing the market gives the exact p21 elasticity

\[
\frac{\partial\log F}{\partial\log u_M}
=\frac{qa_M}{k_G}\frac{-D_w}{\mathcal J_G}.
\]

The script validates this expression against a direct perturbation of `machineMultiplier` through `solveMarket`.

## Future wages and the stationary derivative

The stationary wage-value derivative on p11 uses `x*` from the fixed-frontier stationary solution. It is distinct from the current coefficient `∂Δdot/∂w=−1` in the forward value equation.

For an infinitesimal conditional wage forcing along the displayed finite career path with its terminal value fixed, the positive kernel is

\[
K(t,s)=\exp\left[-\int_t^s(R+x(u))\,du\right].
\]

The ledger returns sampled kernel weights under `edges.p11.dynamicKernel` when a complete `points` path is supplied. Endogenous wage and frontier changes are still determined by the complete boundary problem. Kernel weights quantify the conditional value equation and are not substituted for a jointly solved economic response.

## Payment floor example

The returned `credit.paperExample` preserves the paper's positive cash-floor construction. One basic hour has value `b=1`, the minimum cash payment is `s=1/2`, preparation costs `3/8`, and its lost learning has value `Δm=3/4`. The cap is `1/2`, the private preparation gain is `1/8`, and the resource gain at full learning value is `−1/8`.

At a binding floor, increasing `Δ` has zero local effect on the paid discount. Under complete pricing the derivative is the case's transition probability. At exact equality between full learning value and the cap, the ledger reports a one-sided boundary.

## Validation

`node scripts/check-model.mjs` runs 4,934 assertions including the original model checks. The feedback additions test all 16 nodes and 22 links, mandatory measurement metadata, the corrected credit topology, current-market demand and headcount elasticities, stationary practice multipliers, finite-stage machine and parity elasticities, grounded efficiency feedback, and the paper's positive-floor example. Current-market derivatives are compared with independent symmetric finite perturbations in human, mixed, machine, and grounded regimes. Future-wage kernel weights are checked for positivity and decay.

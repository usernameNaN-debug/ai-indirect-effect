const html = (strings, ...values) => String.raw(strings, ...values).replace(/\\\([\s\S]*?\\\)/g, math => math.replaceAll('<', '&lt;').replaceAll('>', '&gt;'));
const tex = String.raw;

export const pages = {
  home: {
    title: 'The work that reaches us',
    deck: 'How customer AI changes professional work, the acquisition of expertise, and the research that depends on both.',
    part: 'Story',
    sections: [
      {
        id: 'customer-file',
        title: 'Before the engineer opens the file',
        paragraphs: [
          html`Before a customer brings a software problem to an engineer, an AI conversation may already have produced a working example, traced an error, and suggested a repair, so the first professional encounter begins with a file containing work that previously happened inside the office. When we follow that file across the boundary of the firm, we find that customer AI can change an occupation even while the professionals themselves continue using exactly the same tools.`,
          html`Within the prepared file, several changes travel together, because routine reconstruction may have disappeared while a newly discovered security question creates a reason to purchase expert help. For the junior engineer assigned to the case, the material can also contain the observations and feedback through which an unfamiliar principle becomes understandable, meaning that the same transaction supplies both a service today and a possible qualification for tomorrow.`
        ]
      },
      {
        id: 'information',
        title: 'What remains after the service',
        paragraphs: [
          html`Our starting point is the information a person actually processes, since an hour of practice contributes to future judgment when its content reveals something relevant to that judgment. By preserving the failed attempts, diagnostic observations, and reasons behind a repair, customer preparation can transmit the learning occasion along with the finished result, whereas a file containing only the result can remove the reconstruction through which a novice would have learned.`,
          html`Once that learning occasion has a price, the career response becomes part of the transaction itself, because a novice who expects higher future earnings can finance a placement through a payment or a wage concession. Within the stationary comparison holding expert demand fixed, lost diagnostic practice raises total privately financed formal training, while the increase in formal qualification remains smaller than the reduction in diagnostic qualification, leaving fewer experts who receive higher hourly earnings when expert demand slopes downward.`
        ]
      },
      {
        id: 'shared-expertise',
        title: 'Where the same expertise goes next',
        paragraphs: [
          html`Qualified engineers also supply the generation and validation required by research, so the wage connecting customers to professionals determines how many research hours a fixed fund can purchase. Customer preparation releases some professional time immediately, while its effect on the entry of qualified people unfolds through careers, and research responds to the balance between those two changes.`,
          html`When a complete machine method becomes available, its cost can set the price of a validated research result and change the future earnings that justify training today. Because novices value an entire career, an announced improvement can affect present study before adoption, while the eventual frontier also depends on the work required for validation, the availability of human grounding, and the duration of a research cycle.`
        ]
      },
      {
        id: 'reading',
        title: 'Following the argument',
        paragraphs: [
          html`We begin with <a href="/work/">work and learning</a>, then follow <a href="/careers/">private careers</a> into <a href="/research/">shared research</a> and <a href="/welfare/">social value</a>, so each chapter carries forward an economic object introduced in the previous one. Readers who want the equations can continue through the <a href="/model/">model</a>, <a href="/dynamics/">dynamic equilibrium</a>, and <a href="/growth/">growth</a> chapters, with derivations collected in the <a href="/appendix/">mathematical appendix</a>.`,
          html`Throughout these pages, interactive figures display specified theoretical economies whose controls reveal the mechanisms behind the argument, with numerical values generated from their displayed assumptions. In <a href="/assets/paper.pdf#page=1">The Indirect Effects of AI on Professional Work</a>, the complete analysis, proofs, and literature discussion follow the consequences of work and information carried in a customer file.`
        ]
      }
    ]
  },
  work: {
    title: 'What the file teaches',
    deck: 'Customer preparation changes the tasks purchased and the information through which a novice acquires independent judgment.',
    part: 'Story',
    sections: [
      {
        id: 'purchased-work',
        title: 'From a software fault to a professional question',
        paragraphs: [
          html`When an application fails intermittently, a customer can arrive with a vague description or with a minimal example, a trace of the failure, and an AI-generated patch, and the engineer faces different work under each arrangement. By comparing those alternatives for the same underlying problem, we can follow preparation without confusing a change in how a matter is handled with a change in which matters exist.`,
          html`Customer capability also changes the choice to purchase help, because discovering a problem can create demand, successful self-service can resolve it at home, and better information can direct attention toward cases where intervention is valuable. Even an informative signal that raises the value of having a professional option leaves purchased hours dependent on the actions chosen after that signal, so our demand measure counts the expert time contained in the files that actually arrive.`,
          html`Within each file we track basic work, expert work, and a possible transition into qualification, giving the learning consequence its own unit alongside the clock hours used to deliver the service. Customer time and inference resources enter the same resource account, following the household-production perspective of <a href="https://doi.org/10.2307/2228949">Becker’s allocation-of-time analysis</a>, which places work completed at home within the economic comparison.`
        ]
      },
      {
        id: 'foundation',
        title: 'Why an explanation can need a foundation',
        widget: 'learning',
        paragraphs: [
          html`For a junior engineer, an explanation such as “the repair works because these operations occur in the opposite order” becomes useful only when the person understands which order occurred in the original execution. We represent that foundation by a hidden sign \(B\) and the principle needed for a later judgment by a hidden sign \(T\), with a diagnostic observation revealing \(B\) imperfectly and a relational explanation revealing their product \(BT\) imperfectly.`,
          html`When the foundation remains unknown, the product alone leaves the target principle equally likely to have either sign, because changing both signs preserves the explanation. When the learner processes both pieces, multiplying the observations cancels the foundation and reveals the target through the remaining noise, which gives a precise reason why the quality of an explanation and access to reconstruction can complement each other.`,
          html`In the experiment, foundation reliability \(r_B\) and explanation reliability \(r_A\) determine the error of a later unaided judgment through \(1-r_B^2r_A^2\), while an exposure probability \(p\) determines how often that pair reaches the learner. Moving the controls changes this specified information experiment, so its risk reduction is a theoretical measure of retained judgment measured against the prior error of one.`,
          html`Better explanations can compensate for less frequent exposure when their joint information gain rises, and a submitted file that preserves the same processed observations preserves the same learning value. Direct instruction that reveals \(T\) itself offers another route to the principle, connecting the experiment to the formal study that will enter the career model.`
        ]
      },
      {
        id: 'diagnostic',
        title: 'From useful information to qualification',
        paragraphs: [
          html`Across a professional portfolio, diagnostic cases are those whose verified feedback distinguishes principles relevant to the qualification assessment, so repeated hours on unrelated tasks can leave the target judgment unchanged. Within a model of several uncertain principles, practice transfers through the covariance between what an exercise reveals and what the later decision requires, giving an exact statistical meaning to the relevance of experience.`,
          html`To connect that information to occupational entry, we focus on a qualification margin where a fully revealing occasion allows an eligible novice to pass an unaided assessment. Aggregating the retained diagnostic occasions gives a transition flow \(M\), measured in newly acquired qualifications per unit of time, while the qualified population share \(E\) counts people who possess the assessed ability.`,
          html`Allocation matters because a revealing occasion creates a transition only when it reaches someone who still needs the qualification, and the benchmark assigns such occasions to eligible novices. Under random contact across the entire occupation, the eligible share is \(1-E\), so a contact rate \(m(c)\) produces \(M=(1-E)m(c)\), with repeated exposure yielding less additional entry as more people become qualified.`,
          html`For measurement, the path from a customer file to \(M\) runs through case arrivals, diagnostic content, actual recipient exposure, and subsequent unaided assessment, allowing a study to identify which part changed. <a href="/assets/paper.pdf#page=4">Pages 4–5 of the paper</a> develop these definitions, and <a href="/assets/paper.pdf#page=15">Appendix A</a> gives the signal calculation behind the figure.`
        ]
      },
      {
        id: 'learning-price',
        title: 'Why a learning opportunity changes the fee',
        paragraphs: [
          html`Once qualification belongs to its holder and can be carried to another employer, a diagnostic placement has a private value that a novice can help finance. Writing that value as \(\Delta\), a case with transition probability \(m\) supports a learning payment \(\Delta m\), which can appear as an explicit placement payment or as a wage concession within the service arrangement.`,
          html`Competition passes that payment into the customer fee, so the provider can cover the basic and expert labor bills while charging the customer less for a case that teaches someone. When customer preparation removes the diagnostic occasion, it removes that discount as well as saving work, tying the immediate purchase decision to the earnings that the novice expects across a career.`,
          html`Through this payment, information carried in an ordinary file becomes part of an investment decision, and the next chapter follows <a href="/careers/">how private study responds when diagnostic practice falls</a>. Keeping the qualification value attached to its owner will also explain why changes in headcount, hourly earnings, and total professional income move according to different equations.`
        ]
      }
    ]
  },
  careers: {
    title: 'Learning as a private investment',
    deck: 'With expert demand held fixed, lost diagnostic practice raises aggregate formal training and lowers the stationary expert population.',
    part: 'Story',
    sections: [
      {
        id: 'portable-qualification',
        title: 'An asset that travels with the worker',
        paragraphs: [
          html`For a junior engineer deciding whether to pay for instruction, qualification has value because it opens a stream of expert earnings that remains available after changing employers. We measure that value by \(\Delta\), the difference between discounted lifetime income as an expert and as a novice, so borrowing against future earnings connects today’s tuition to tomorrow’s professional opportunities.`,
          html`Formal study produces a qualification intensity \(x\), with a resource cost \(\kappa x^2/2\) that becomes steeper as study intensifies, while qualification becomes obsolete at rate \(\delta\). Choosing study balances its marginal expense against its expected capital gain, giving \(x=\Delta/\kappa\), through which a higher qualification value raises the rate at which each novice invests.`,
          html`Diagnostic placements provide a second source of entry, and complete pricing transfers the placement’s private capital gain to its seller through the apprenticeship payment. After that payment is accounted for, practice still changes the population acquiring qualification, while future wage premia determine the private value that guides formal study, a division derived from the worker’s value equations on <a href="/assets/paper.pdf#page=16">pages 16–18</a>.`
        ]
      },
      {
        id: 'replacement',
        title: 'Why replacement is incomplete',
        widget: 'careers',
        paragraphs: [
          html`Within the stationary comparison, we hold the expert-demand schedule fixed and remove diagnostic content from a purchased portfolio whose service requirements remain unchanged. At the old expert population, fewer practice transitions leave entry below the flow needed to replace obsolescence, so the stationary population moves downward until formal entry and the remaining diagnostic entry once again balance qualification loss.`,
          html`As experts become scarcer, a decreasing inverse demand schedule raises their hourly wage, which raises the qualification value and each novice’s study intensity. At the same time, the smaller expert share leaves more novices able to undertake study, so aggregate formal transitions increase through both the number of learners and, where wages respond strictly, their individual investment.`,
          html`Full replacement would preserve the old population and its old wage, which would also preserve the old private incentive to study, whereas the increased investment in this comparison is supported by changed career returns. Flow balance then gives a sharper statement, because the lost practice equals the increase in formal transitions plus the reduction in replacement needs caused by the smaller expert population.`,
          html`For any finite practice reduction inside the feasible stationary interval, formal transitions rise by a strictly positive amount smaller than the lost practice, and total teaching resources also rise. <a href="/assets/paper.pdf#page=19">Proposition C.1</a> obtains that finite comparison from monotonicity, including continuous demand schedules with corners, while the differentiable formula in the mathematical chapter measures the fraction replaced locally.`
        ]
      },
      {
        id: 'earnings',
        title: 'Higher hourly earnings and fewer recipients',
        paragraphs: [
          html`When the expert population falls, the remaining experts receive higher hourly earnings wherever demand slopes strictly downward, and their qualification becomes a more valuable private asset. Total income received by the occupation also counts how many experts remain, so its response combines the wage increase with the reduction in people receiving that wage.`,
          html`Within the service-and-training economy, isoelastic expert demand \(D_S=Cw^{-\varepsilon}\) and clearing \(E=D_S\) give total expert income proportional to \(E^{1-1/\varepsilon}\), producing a fall in the wage bill after practice loss when \(\varepsilon>1\). Within that region, someone observing higher professional rates and someone observing lower total expert income would be measuring distinct outcomes of the same stationary adjustment.`,
          html`Novice finances require their own account because placement payments and tuition reduce current cash income while purchased training changes future earnings. Lifetime values incorporate those investments, and the benchmark’s stationary novice value is \(b/\rho+\Delta^2/(2\kappa\rho)\), where \(b\) is the basic outside wage and \(\rho\) is the discount rate, making explicit the difference between current receipts and the value of a career.`,
          html`When customer discovery also expands service demand, the demand shift raises training incentives even at a fixed expert population, introducing a second source of entry alongside the scarcity response. Expertise falls in that comparison when the diagnostic loss exceeds the formal entry induced by the direct demand shift, so the separate effects on practice and purchased expert hours retain their economic role.`
        ]
      },
      {
        id: 'expectations',
        title: 'Future opportunities enter present study',
        paragraphs: [
          html`During a transition, the professional population is inherited from earlier learning and obsolescence, while qualification value responds to the future wages that a newly qualified person expects to receive. Announcements about future customer demand or research automation can change that value immediately, which allows current study to move before the announced technology changes current work.`,
          html`With the same terminal career payoff, the difference in present qualification values equals a positively weighted integral of the two future wage paths, giving a direct connection between anticipated earnings and current investment. Once research competes for the same people, its method choices become part of those expected wages, and <a href="/research/">the shared research market</a> supplies the next part of the argument.`,
          html`Within the interactive career figure, both paths begin with expert share \(E(0)=0.55\) and frontier \(A(0)=1\), and the finite career payoff is \(\Delta(T)=0\), so formal study approaches zero at the terminal date as the remaining investment horizon closes. Those paths solve the evolving joint economy, while the stationary replacement result above compares fixed-frontier equilibria whose qualification values remain positive.`,
          html`Numerical quantities use the model’s normalized units and the selected economy’s demand, practice, and research parameters, with the comparison curve retaining the human-research baseline. Selecting the announcement case includes changes in method availability and can cross research regimes, while the signed anticipation theorem in the next chapter follows a comparison in which both economies remain mixed.`
        ]
      }
    ]
  },
  research: {
    title: 'The same people do research',
    deck: 'Customer work and research share a qualification market, so released time and future career entry meet through the wage.',
    part: 'Story',
    sections: [
      {
        id: 'complete-result',
        title: 'Buying a completed research result',
        paragraphs: [
          html`When the engineer who diagnoses a customer’s software problem can also develop and evaluate a new research method, professional services and research draw on the same qualified population. We give a research fund a fixed expenditure flow and a mandate to purchase completed, validated research packets, so its demand for people depends on the cost of carrying an idea through both generation and checking.`,
          html`Within the human method, generation uses expert time and validation uses additional expert time, with both requirements declining as research tools improve. Each hour also requires computation, while the autonomous method purchases generation and validation entirely through computation when that complete route is available, so a faster generator changes only one component of the cost of a completed result.`,
          html`Because a packet includes every stage needed for completion, residual validation can determine the eventual productivity of the method even when generation improves quickly. Through that accounting, the research comparison retains a physical question about what a qualified person or a machine must actually do, before introducing a price comparison between the resulting methods.`
        ]
      },
      {
        id: 'regimes',
        title: 'How the allocation selects its method',
        widget: 'regimes',
        paragraphs: [
          html`At the wage that clears customer services alone, every expert works on customer files, while a fund purchasing human research adds another claim on those hours and raises the clearing wage. Comparing these two wages with the wage at which human and machine packets have equal costs determines whether research employs people, computation, or a mixture of both.`,
          html`When human research remains cheaper even at the higher clearing wage, the fund spends its budget on human packets and employs the hours that its wage-plus-compute expense permits. When the autonomous route is cheaper at the service-only wage, the fund purchases machine packets and the professional wage clears customer work alone.`,
          html`Between those cases, equal packet costs fix the wage while labor clearing determines how much human research fits beside customer services, and the remaining budget purchases autonomous packets. Extra expertise then increases the human share at that fixed wage, with each dollar still purchasing the same quantity of completed research, giving a local regime where frontier output is independent of expert headcount.`,
          html`Within the figure, changing the expert population, service demand, or machine requirements recomputes these clearing conditions at a fixed frontier. Its quantities describe a frozen-state allocation, with the chapter on <a href="/dynamics/">dynamic equilibrium</a> following how the population, frontier, and qualification value change together over time.`
        ]
      },
      {
        id: 'released-hours',
        title: 'Released hours and lost future entrants',
        paragraphs: [
          html`At a human research allocation, customer preparation that saves expert time releases hours from professional work and reduces the wage needed to clear the shared market, allowing the fixed research fund to purchase more labor. Because services also expand when the wage falls, research receives a fraction of the released time, with that fraction determined by the responsiveness of both service demand and research demand.`,
          html`Along a career transition, the same preparation can reduce diagnostic entry and leave fewer qualified people available later, raising the wage paid by the fund at a common frontier. Both channels appear in the local research formula, where the change in expert population enters with the opposite sign to the change in service demand measured at the old wage.`,
          html`For an exact finite comparison after customer task requirements settle, eventual human research rises when the professional hours released at the old wage exceed the loss of expert supply evaluated at the old training incentive. Holding service demand fixed gives lower eventual research labor after practice loss, while sufficiently large service savings reverse that ordering, a threshold proved on <a href="/assets/paper.pdf#page=48">pages 48–49</a>.`,
          html`When a machine method requires a residual human grounding stage, each completed machine packet again purchases some expert time, so expertise changes its cost and research output at the grounded corner. Full autonomous validation and human grounding consequently imply different local responses, with equal-cost mixing still able to absorb changes through method shares.`
        ]
      },
      {
        id: 'anticipated-methods',
        title: 'Why a future machine changes today’s study',
        paragraphs: [
          html`Within an interior mixed allocation, the equal-cost wage follows the relative productivities of the two complete research methods, and a faster-improving machine route can lower that wage as the frontier advances. Announced reductions in future machine requirements then change the earnings available over a novice’s career, so their effect on training begins when the announcement changes expectations.`,
          html`In the paper’s joint comparison, both economies remain mixed, share the same initial states and terminal qualification payoff, and face identical methods until the adoption date. When the improved machine route has productivity elasticity at least as large as the human route over the relevant interval, adoption produces a weakly faster frontier and a weakly lower wage path, which lowers current qualification value and study whenever future wages fall strictly over a positive interval.`,
          html`Because the frontier and wage paths agree before adoption within that comparison, the reduction in initial training comes through expected future returns, while current research allocation remains governed by today’s costs. <a href="/assets/paper.pdf#page=34">Proposition H.4</a> gives the argument, and the <a href="/welfare/">welfare chapter</a> follows the further question of how the value received by an individual worker relates to the value of the research that worker supports.`
        ]
      }
    ]
  },
  welfare: {
    title: 'What a saved hour is worth',
    deck: 'Current service savings, lost qualification, and additional research enter one resource account, with private and social values linked through explicit prices.',
    part: 'Story',
    sections: [
      {
        id: 'resource-account',
        title: 'Following resources through the transaction',
        paragraphs: [
          html`When customer preparation saves an hour inside an engineering office, the resource gain includes the work avoided and the customer time or computation used to accomplish it, while any removed learning occasion changes the future supply of expertise. Adding the customer, provider, and worker accounts cancels fees and wages as transfers, leaving service benefits, displaced outside work, teaching resources, and computation in the welfare calculation.`,
          html`Within the competitive service-and-training benchmark, the novice pays the full private value of diagnostic learning, and the same qualification value supports the social allocation of work and study. Because training cost is convex and allocation constraints are affine, a feasible competitive path satisfying the stated transversality condition maximizes the resource objective, giving an equality between private qualification value \(\Delta\) and social qualification value \(\lambda\).`,
          html`Under those conditions, an optional customer improvement that preserves every earlier mode weakly raises welfare, since the earlier allocation remains feasible and the expanded menu offers additional choices. Expertise can fall during that adjustment when the new modes save enough resources to cover the fully valued learning opportunities they displace, a pathwise result proved in <a href="/assets/paper.pdf#page=22">Appendix D</a>.`
        ]
      },
      {
        id: 'payment-limit',
        title: 'When the learning discount is restricted',
        paragraphs: [
          html`Institutional payment rules can prevent the diagnostic value from reaching the customer’s fee, as happens when a positive minimum cash payment to an apprentice is combined with a ban on separately charging for the placement. For a case that uses one basic hour, the available learning credit is then capped by the difference between the basic outside wage and the required cash compensation.`,
          html`When the cap binds, a customer can privately prefer preparation because its resource saving exceeds the permitted learning discount, while the qualification displaced is worth more than that saving in the benchmark social account. In symbols, the interval is \(b-s<b-r_C<\Delta m\), where \(s\) is minimum cash compensation, \(r_C\) is the cost of preparation, and \(m\) is the lost transition probability.`,
          html`For the paper’s symbolic example, \(b=1\), \(s=1/2\), \(r_C=3/8\), and \(\Delta m=3/4\) give a positive private saving of \(1/8\) and a negative resource gain of \(-1/8\). Those values establish feasibility within the model, and <a href="/assets/paper.pdf#page=24">Appendix E</a> states the marginal case comparison from which they follow.`,
          html`Once the restriction covers a positive share of transactions, the resulting economy has its own private qualification value and social continuation value, whose difference must be evaluated along that altered allocation. Through this explicit payment rule, the welfare effect remains attached to the missing learning credit and the resources saved by preparation.`
        ]
      },
      {
        id: 'public-research',
        title: 'Research adds a public return to qualification',
        paragraphs: [
          html`When qualified people also produce research, their wage records the payment received for an hour, while the frontier improvements supported by that hour can create benefits throughout the future economy. Writing the gross social return to a human research hour as \(\Pi\) and its wage-plus-compute expense as \(h\), the difference \(\Pi-h\) measures the public research return beyond those inputs.`,
          html`Along a regular selected continuation, more inherited expertise can reduce the wage paid by the research fund and increase the research hours purchased with its budget, so the social qualification value follows both procurement and innovation. With common terminal private and social qualification values, positive future research returns and a positive labor response give \(\lambda>\Delta\), as the positive-weight representation on <a href="/assets/paper.pdf#page=40">pages 40–42</a> shows.`,
          html`Under that value ordering, a small subsidy to formal qualification has a positive marginal welfare effect because the added transition contributes more to continuation welfare than its marginal teaching expense. Within an interior mixed or autonomous research regime, the local research contribution to this value difference is zero, while future human-research intervals can still enter today’s continuation value.`
        ]
      },
      {
        id: 'preparation-surface',
        title: 'One prepared file in the joint economy',
        widget: 'welfare',
        equation: tex`P=bj-r_C+we-Delta m,qquad mathcal W=P-(lambda-Delta)m+(Pi-h)chi_R e`,
        paragraphs: [
          html`For a short unannounced preparation change at a strict human research corner, the private gain \(P\) includes saved basic hours \(j\), saved expert hours \(e\), preparation resources \(r_C\), and the lost privately priced learning opportunity \(\Delta m\). Only a fraction \(\chi_R\) of released expert time enters research, because the wage adjustment also supports additional customer services.`,
          html`Its marginal social value \(\mathcal W\) follows from the private gain after charging the remaining social value of lost qualification and crediting the additional net return to research. Within the displayed local comparison, changing the qualification wedge or public research return moves the welfare boundary while the selected baseline values and released-hour fraction remain fixed.`,
          html`When \((\lambda-\Delta)m\) exceeds \((\Pi-h)\chi_R e\), a range of positive private savings produces negative marginal welfare even as research hours increase, so the research expansion and total resource gain have distinct economic meanings. In the <a href="/assets/paper.pdf#page=42">preparation theorem and its signed construction</a>, that range follows from a feasible local intervention, while the figure visualizes the equation’s illustrative inputs.`,
          html`Having followed the file through work, learning, careers, and public returns, we can now put the same objects into a complete system, beginning with <a href="/model/">the customer choice and career equations</a>. Each value in the welfare calculation then retains a defined source in the allocations and future opportunities of that system.`
        ]
      }
    ]
  },
  model: {
    title: 'From choices to equations',
    deck: 'A customer menu, a portable qualification, and two complete research methods determine the economy’s prices and physical flows.',
    part: 'Mathematics',
    sections: [
      {
        id: 'customer-choice',
        title: 'Customer modes and the price of practice',
        equation: tex`F_d=bj_d+we_d-\Delta m_d,\qquad d^*(z)\in\underset{d\in\mathcal D(z,c)}{\operatorname{arg\,max}}\{U_d-bj_d-we_d+\Delta m_d\}`,
        paragraphs: [
          html`For recurring matters \(z\) measured by \(\mu_Z\), customer capability \(c\) determines a menu \(\mathcal D(z,c)\) containing unresolved, self-service, and professional modes with different preparation. Expected benefit \(U_d\) already deducts customer time, inference, and other nonlabor resources, while \(j_d\) and \(e_d\) record basic and expert clock hours, and \(m_d\) records the expected qualification transition assigned to an eligible novice.`,
          html`With basic time available at outside wage \(b\), expert time priced at \(w\), and complete practice payments valued at \(\Delta\), competitive fees follow the expression above. Adding the novice’s payment \(\Delta m_d\) to the customer fee exactly covers the provider’s labor bill, giving the learning credit a financing source before it enters the customer’s optimization.`,
          html`Aggregation over selected modes produces service demand \(D_S=\int e_{d^*(z)}\,d\mu_Z\), practice \(M=\int m_{d^*(z)}\,d\mu_Z\), and basic demand \(J=\int j_{d^*(z)}\,d\mu_Z\). Within the region \(J<1-E\), the novice outside activity fixes \(b\), while the scarce expert market determines \(w\), as developed in <a href="/assets/paper.pdf#page=3">the customer model</a>.`
        ]
      },
      {
        id: 'private-career',
        title: 'Private study and qualification accumulation',
        equation: tex`x=\frac{\Delta}{\kappa},\qquad \dot E=M+(1-E)\frac{\Delta}{\kappa}-\delta E,\qquad \dot\Delta=(\rho+\delta)\Delta-(w-b)+\frac{\Delta^2}{2\kappa}`,
        paragraphs: [
          html`Qualification is a portable individual asset with value difference \(\Delta=V_E-V_N\), while obsolescence returns experts to novice status at rate \(\delta>0\). For a novice purchasing intensity \(x\ge0\) at cost \(\kappa x^2/2\), maximizing \(x\Delta-\kappa x^2/2\) on the positive-value region gives the study choice in the first equation.`,
          html`Practice arrives at per-novice rate \(M/(1-E)\), and paying \(\Delta\) per successful transition cancels its private capital gain inside the novice’s value equation. Subtracting that equation from the expert’s equation leaves the wage premium, obsolescence, discounting, and optimized study surplus, producing the qualification-value law while practice remains present in physical accumulation.`,
          html`Units keep these roles distinct because \(E\) is a population share, \(M\) is an aggregate transition flow, \(x\) is an individual intensity, and \(\Delta\) is a stock of discounted value. With one expert clock hour supplied by each qualified person per unit of time, the same \(E\) also measures the expert labor available to services and research.`
        ]
      },
      {
        id: 'stationary-entry',
        title: 'Stationary entry and incomplete replacement',
        equation: tex`R=\rho+\delta,\qquad x(E)=\sqrt{R^2+\frac{2[w(E)-b]}{\kappa}}-R,\qquad M+(1-E)x(E)=\delta E`,
        paragraphs: [
          html`Within the strict diagnostic-portfolio comparison, the selected service modes retain their purchase margins while practice changes, giving an inverse wage \(w(E)>b\) independent of \(M\) and \(\Delta\). For a continuous nonincreasing wage schedule, stationary individual study decreases weakly with \(E\), and aggregate formal transitions \(T(E)=(1-E)x(E)\) decrease strictly because the novice population also contracts.`,
          html`Positive qualification drift at the lower feasible endpoint and negative drift at the upper endpoint give a unique stationary population for each practice flow in the comparison interval. At two such equilibria, subtracting their accumulation identities gives \(T^1-T^0=(M^0-M^1)-\delta(E^0-E^1)\), so a practice loss lowers expertise and induces strictly positive, incomplete formal replacement.`,
          html`For a differentiable wage, the denominator \(\Lambda=\delta+x-(1-E)w_E/[\kappa(R+x)]\) gives \(E_M=1/\Lambda\) and replacement fraction \(-T_M=1-\delta/\Lambda\). Because \(\Lambda>\delta\), this fraction lies strictly between zero and one, with its magnitude determined jointly by study costs, obsolescence, and the equilibrium wage response.`
        ]
      },
      {
        id: 'service-validation',
        title: 'Validation, fees, and service demand',
        equation: tex`\mathcal T(w,c)=\min_{v\ge0}\{w[e(c)+v]+k(c)+r_\gamma(\pi(c)e^{-v})\},\qquad P=\frac{\varepsilon}{\varepsilon-1}\mathcal T`,
        paragraphs: [
          html`For the service-quality extension, customers purchase cases from fixed franchises and face a generalized price \(P\) combining the fee with the certainty-equivalent loss from unresolved error. Each case needs generation time \(e(c)\), validation time \(v\), and other resources \(k(c)\), while the error probability \(\pi(c)e^{-v}\) declines with expert checking, so the provider’s choice connects customer reliability to purchased professional judgment.`,
          html`With constant absolute risk aversion \(\gamma\) and error loss \(L\), the certainty-equivalent cost is \(r_\gamma(z)=\gamma^{-1}\log[1+z(e^{\gamma L}-1)]\), whose risk-neutral limit is \(Lz\). Optimized generalized unit cost \(\mathcal T\) enters the isoelastic markup shown above, and its wage derivative counts the expert hours needed per completed case, giving aggregate demand \(D_S=\mathcal T_w N(c)P^{-\varepsilon}\).`,
          html`For risk-neutral customers, optimal checking is \(v^*=[\log(L\pi(c)/w)]_+\), so more reliable files reduce validation at a fixed wage while a larger possible loss raises its return. <a href="/assets/paper.pdf#page=25">Lemma F.1</a> proves that the resulting expert demand decreases strictly with the wage, including the points at which validation enters or leaves the selected service.`
        ]
      },
      {
        id: 'research-production',
        title: 'Complete methods and market clearing',
        equation: tex`\begin{aligned}a_H(A)&=A^{-\alpha}+v_RA^{-\nu},& k_H&=a_H(A)(w+q\xi),\\a_M(A)&=A^{-\mu}+m_RA^{-\zeta},& k_M&=qa_M(A),\\E&=D_S+L_R,& (w+q\xi)L_R+qQ_M&=B_R,\\\dot A&=A^{-\phi}\frac{B_R}{\min_{j\in\mathcal F(A)}k_j},& c(A)&=\kappa_c\log(A/A_0).\end{aligned}`,
        paragraphs: [
          html`Positive coefficients \(v_R\) and \(m_R\) preserve the validation stage of each complete method, while \(q\) prices computation and \(\xi\) measures computation used per human research hour. Human packets use \(a_H\) expert hours and autonomous packets use \(a_M\) computation units, with the feasible-method set \(\mathcal F(A)\) determining which costs procurement can compare.`,
          html`Expert clearing joins customer services to human research, and the fixed expenditure flow \(B_R\) pays for human labor and all research computation. Completed packets advance the cardinal frontier \(A\), while idea difficulty \(A^{-\phi}\) reduces the increment supplied by each packet as the frontier grows, connecting improved research methods to a progressively harder innovation task.`,
          html`Within the interactive economy, a positive multiplier on \(a_M\) changes complete machine requirements, while \(C(c)=C_0e^{\gamma c}\), \(D_S=C(c)w^{-\varepsilon}\), and \(M(c)=M_0e^{-\beta_c c}\) specify the selected service and diagnostic portfolios. Discovery and net preparation enter through \(\gamma\), while \(\beta_c\) sets practice displacement, with both schedules independent of contemporaneous qualification value in this specialization.`,
          html`Research prices are solved from clearing at each state, and the <a href="/dynamics/">next chapter</a> uses those prices to select a path with inherited population and frontier values and an explicit terminal career payoff. Through that boundary problem, the numerical comparison preserves the distinction between current market clearing and the future earnings used to finance study.`
        ]
      }
    ]
  },
  dynamics: {
    title: 'How the feedback closes',
    deck: 'Inherited expertise and frontier productivity move forward, while the value of becoming qualified is selected by future career earnings.',
    part: 'Mathematics',
    sections: [
      {
        id: 'two-boundaries',
        title: 'Initial states and a terminal career value',
        equation: tex`E(0)=E_0,\qquad A(0)=A_0,\qquad \Delta(T)=\overline\Delta,\qquad \dot X=H(X,\Delta),\quad \dot\Delta=G(X,\Delta),\quad X=(E,A)`,
        paragraphs: [
          html`At the date a customer technology changes, the economy inherits its qualified people and its research frontier, while the private value of a qualification reflects the future wages available from that date onward. Closing a finite career horizon requires a terminal payoff \(\overline\Delta\) supplied by a continuation occupation, giving two initial conditions for the physical states and one terminal condition for the forward value.`,
          html`Given a trial qualification-value path, we can integrate population and frontier forward while clearing the labor market at each date, then integrate the value equation backward from its terminal payoff using the resulting wages. Repeating those updates seeks a path whose physical evolution and anticipated earnings agree, the same logical construction used in the paper’s finite-horizon existence proof.`,
          html`Within a compact feasible region, uniformly decreasing service demand gives regular wage roots, bounded wages keep private values bounded, and a sufficiently short horizon limits the feedback between the two path updates. <a href="/assets/paper.pdf#page=31">Proposition H.1</a> supplies an explicit contraction condition under which the boundary problem has one equilibrium inside that region, including endogenous changes in the active research allocation.`
        ],
        details: [{
          title: 'A sufficient contraction condition',
          paragraphs: [html`With \(R=\rho+\delta\), state-field Lipschitz constant \(L_H\), and wage Lipschitz constant \(L_W\), the forward update changes distances by at most \(TL_H\) and the backward update by at most \((1-e^{-RT})L_W/R\). Taking their maximum below one gives a contraction, while \(TH_{\max}<m_X\) keeps states inside the region and a value bound \(D\) satisfying \(RD+D^2/(2\kappa)\ge W_{\max}-b\) keeps the backward value within \([0,D]\).`],
          equation: tex`\max\left\{TL_H,\frac{1-e^{-RT}}{R}L_W\right\}<1`
        }]
      },
      {
        id: 'feedback',
        title: 'Local links and complete paths',
        widget: 'feedback',
        equation: tex`\mathcal J=-D_{S,w}+\frac{B_R}{h^2},\qquad h=w+q\xi,\qquad d\log F=\frac{dE-dD_S|_w}{h\mathcal J}`,
        paragraphs: [
          html`Through the shared market, more expertise lowers the human research wage, while greater customer demand raises it, and both price effects change the packets purchased by a fixed fund. At a common frontier in a strict human regime, differentiating clearing gives the displayed local relationship, where \(dD_S|_w\) includes customer and qualification-value effects evaluated at the original wage.`,
          html`Within the feedback graph, Loops follows the connected economic channels, while Strength examines their exact conditional derivatives at the selected state. For positive quantities \(u\) and \(v\), the elasticity \((u/v)\,\partial v/\partial u\) expresses a local percentage response under the displayed conditioning, while derivatives of accumulation or value equations retain the meaning of their specified flows.`,
          html`With Shock, changing the customer or research environment recomputes a complete boundary-value path, so future practice, study, headcount, wages, and frontier productivity respond together. Those paths combine the local channels through the career equations and market clearing, allowing a positive link from expertise to research to coexist with a transition whose outcome also reflects released service hours and a different research regime.`,
          html`Human, mixed, and autonomous allocations have different derivative structures because an interior mixture and an autonomous corner price completed output through the machine cost. At a fixed frontier in those regions, \(F_E=0\), while human research has \(F_E/F=1/(h\mathcal J)>0\), and the graph’s selected regime identifies which relationship applies.`,
          html`When the model retains a human grounding requirement inside the machine route, expertise again changes research output at the grounded corner through the price of that required labor. Equal-cost mixing can still adjust the human share while preserving output per unit of budget, so the complete allocation rule determines which feedback is active.`
        ]
      },
      {
        id: 'value-kernel',
        title: 'Why expectations work backward',
        equation: tex`\begin{aligned}\Delta_1(t)-\Delta_0(t)&=\mathcal K(t,T)[\Delta_1(T)-\Delta_0(T)]\\&\quad+\int_t^T\mathcal K(t,s)[w_1(s)-w_0(s)]\,ds,\\\mathcal K(t,s)&=\exp\!\left[-\int_t^s\left(\rho+\delta+\frac{\Delta_1(u)+\Delta_0(u)}{2\kappa}\right)du\right].\end{aligned}`,
        paragraphs: [
          html`Subtracting two private value equations produces a scalar linear equation for their difference, because the difference of squared values factors into their sum times their difference. Backward integration then gives the positive kernel above, whose weight combines ordinary discounting, qualification obsolescence, and the optimized study terms of the two paths.`,
          html`With common terminal values, every future wage difference enters present qualification value with positive weight, so a lower future wage path lowers today’s study incentive. For bounded global value paths, the terminal term vanishes as the horizon grows, and the same comparison becomes an integral over the entire future, as proved in <a href="/assets/paper.pdf#page=29">Proposition G.3</a>.`,
          html`For an announced machine improvement, the wage difference comes from the endogenous research allocation and its frontier path, with the mixed-regime theorem giving a signed joint example under the relative-productivity condition. Through the kernel, future wage changes that differ in sign contribute according to their place along the full discounted path when determining current investment.`
        ]
      },
      {
        id: 'path-selection',
        title: 'How a numerical path is selected',
        paragraphs: [
          html`At a fixed frontier, the stationary career system has one stable direction and one unstable direction under the strict diagnostic-portfolio conditions, so a nearby inherited expert population selects one locally convergent initial qualification value. Numerical selection can use forward and backward relaxation or vary the initial value until the terminal payoff is satisfied, with feasibility, clearing, and boundary residuals evaluated on the resulting path.`,
          html`For a longer finite horizon, the shooting residual \(S(\Delta_0)=\Delta(T)-\Psi(E(T),A(T))\) gives a local selection test, since a nonzero derivative \(S'(\Delta_0)\) allows the implicit-function theorem to identify one nearby initial value. Endogenous equal-cost boundaries preserve the wage level and use piecewise derivatives, while a discrete first-availability event also changes its date under perturbation.`,
          html`Displayed interactive paths use a specified illustrative economy with positive-premium feasibility and an explicit continuation payoff, and numerical diagnostics describe that selected boundary solution. Once the career mechanism and research allocation are linked, <a href="/growth/">frontier growth</a> follows from their long-run production requirements and from the time needed to put new research capability to work.`
        ]
      }
    ]
  },
  growth: {
    title: 'What sets the pace of the frontier',
    deck: 'Complete research methods, private entry, public resources, and the duration of a research cycle determine different kinds of growth.',
    part: 'Mathematics',
    sections: [
      {
        id: 'human-input',
        title: 'Expertise after diagnostic practice disappears',
        paragraphs: [
          html`When customer preparation eventually removes diagnostic practice, formal study remains available to novices whose future expert earnings justify its cost. In a persistent human-research economy, the budget and labor market imply \(w+q\xi\ge B_R/E\), so a very small qualified population supports a large earnings incentive through the research fund’s demand for scarce expertise.`,
          html`Along a global feasible career path with nonnegative qualification values, that scarcity condition prevents expertise from remaining arbitrarily close to zero, because study below replacement would force the value equation downward too quickly to preserve a nonnegative career value. <a href="/assets/paper.pdf#page=45">Proposition J.1</a> gives an explicit positive population bound even with \(M=0\), and a bounded service-demand envelope then gives an upper wage bound.`,
          html`For settled customer environments, eventual human research labor weakly rises exactly when service hours released at the old wage cover the lost expert supply evaluated at the old training incentive. Through that comparison, customer preparation determines the coefficient of subsequent frontier growth, while the productivity of the complete research method determines its exponent.`
        ],
        details: [{
          title: 'The finite customer threshold',
          paragraphs: [
            html`For environments \(i=0,1\), eventual practice flows \(\overline M_i\in[0,\delta)\) and service schedules \(D_i(w)\) give occupational supply \((\overline M_i+x(w))/(\delta+x(w))\), with stationary wage \(w_i\) clearing services and human research. At the old stationary wage \(w_0\), the difference in supply caused by practice loss is \((\overline M_0-\overline M_1)/(\delta+x(w_0))\), so comparing it with released service hours determines the sign of the new market imbalance.`,
            html`Increasing occupational supply and decreasing labor demand then order the new stationary wage, whose inverse relationship with \(L_i=B_R/(w_i+q\xi)\) gives the equivalence below. With \(a_H(A)\sim a_\infty A^{-p_H}\), eventual coefficient \(K_i=L_i/a_\infty\) satisfies \(A_i(t)^{1+\phi-p_H}\sim(1+\phi-p_H)K_i t\) below the critical exponent, while the proportional growth rate tends to \(K_i\) at equality.`
          ],
          equation: tex`L_1\ge L_0\quad\Longleftrightarrow\quad D_0(w_0)-D_1(w_0)\ge\frac{\overline M_0-\overline M_1}{\delta+x(w_0)}`
        }]
      },
      {
        id: 'complete-exponents',
        title: 'Generation and validation set a complete-method exponent',
        equation: tex`p_H=\min\{\alpha,\nu\},\qquad p_M=\min\{\mu,\zeta\},\qquad \dot A\asymp A^{p-\phi}`,
        paragraphs: [
          html`Within each serial method, generation and validation requirements add, so the stage whose input requirement declines more slowly dominates their eventual sum. Factoring the smaller exponent from \(a_H\) or \(a_M\) leaves a positive bounded factor, giving the complete-method exponents above and a direct route from stage-level productivity to packet cost.`,
          html`With the effective human input price bounded above and away from zero, persistent human research gives \(p=p_H\), while two continuously available methods give \(p=\max\{p_H,p_M\}\) because procurement selects the cheaper complete route. Idea difficulty then subtracts \(\phi\) from that productivity exponent, producing power growth for \(p<1+\phi\), exponential order at equality, and a finite production endpoint for \(p>1+\phi\) under the stated continuation conditions.`,
          html`For a grounded machine method, completing each packet additionally requires \(a_G=g_GA^{-\chi}\) expert hours, and under the paper’s bounded-overhead conditions with \(\chi\le p_M\), that human stage governs its complete-route exponent. When \(\chi\le1+\phi<p_M\), the grounding requirement gives a global frontier path in a comparison whose fully autonomous route has a finite endpoint, as developed in <a href="/assets/paper.pdf#page=49">Proposition J.7</a>.`
        ]
      },
      {
        id: 'growth-comparison',
        title: 'Growth in levels and growth in percentages',
        widget: 'growth',
        equation: tex`\dot A=kA^\beta,\qquad \ddot A=\beta k^2A^{2\beta-1},\qquad g_A=\dot A/A,\qquad \dot g_A=(\beta-1)g_A^2`,
        paragraphs: [
          html`For the scalar law in the figure, the exponent \(\beta\) compares effective research productivity with idea difficulty, while \(k\) fixes the resource scale. When \(0<\beta<1\), successive absolute frontier increments grow even as proportional growth falls, with the level chart displaying \(A\), the phase chart displaying absolute increments \(\dot A\), and the equation for \(g_A\) identifying the percentage-growth distinction.`,
          html`In human research, changes in the wage also enter proportional growth, with \(\dot g_A/g_A=(\epsilon_H-\phi-1)g_A-\dot w/(w+q\xi)\). When wages fall, the budget purchases more research, while rising scarcity earnings absorb some productivity gains, connecting the career path to the growth rate beyond the scalar exponent comparison.`,
          html`Numerical curves in this figure compare the displayed scalar laws under a common initial frontier and chosen coefficients, and the career-equilibrium figure supplies the separate joint model where wages and expertise are solved endogenously. Their axes distinguish frontier units from rates per unit of model time, making the meaning of each comparison explicit.`
        ]
      },
      {
        id: 'time',
        title: 'Absorption time and a minimum research duration',
        equation: tex`\begin{aligned}\dot A&=kr^\eta A^{-\phi},& \dot r&=(A-r)/\ell,\\\dot A(t)&=kA(t-\tau)^\eta A(t)^{-\phi}.\end{aligned}`,
        paragraphs: [
          html`Under gradual absorption, effective research capability \(r\) approaches the current frontier with time scale \(\ell>0\), giving recent improvements a continuously increasing role in production. Below \(\eta=1+\phi\), the power asymptotic survives, while at equality the limiting exponential rate solves \(g(1+\ell g)^\eta=k\), and higher elasticities retain a finite production endpoint.`,
          html`Under a positive minimum duration \(\tau\), today’s research can use only capability available at least one cycle earlier, so each interval inherits bounded inputs from the completed interval before it. Applying the method of steps then gives a finite frontier at every finite date, while supercritical productivity still yields growth whose double logarithm rises asymptotically at rate \(\tau^{-1}\log[\eta/(1+\phi)]\).`,
          html`At the threshold, the fixed-duration exponential rate solves \(ge^{(1+\phi)g\tau}=k\), which differs from the gradual-absorption equation because the two timing technologies pass improvements into production differently. <a href="/assets/paper.pdf#page=53">Pages 53–56</a> give the classifications and proofs behind this comparison.`
        ]
      },
      {
        id: 'resources-continuation',
        title: 'Resources and economic continuation',
        equation: tex`\int_{A_0}^{A(t)}u^\phi a_M(u)\,du=\int_0^t\frac{B_R(s)}{q(s)}\,ds`,
        paragraphs: [
          html`For autonomous research, integrating the production law gives an exact resource clock, with the left side measuring the cumulative computation-adjusted effort needed to reach a frontier and the right side measuring available research purchasing power. If frontier-indexed budgets and compute prices scale with exponents \(\beta_B\) and \(\beta_q\), the finite-arrival threshold becomes \(p_M+\beta_B-\beta_q>1+\phi\).`,
          html`Human research also faces the physical bound \(L_R\le E\), so additional expenditure can bid up wages when existing expertise is already employed, with subsequent entry determined by private training. For a technology whose frontier coordinate has a finite endpoint, the paper specifies completion of a public software program and a residual implementation occupation, providing a finite continuation qualification value for the preceding career problem.`,
          html`With that continuation, research completion becomes an absorbing activity state while wages, study, and lifetime values continue in calendar time. Within the <a href="/appendix/">mathematical appendix</a>, the arguments connect the information experiment, career equilibrium, welfare values, and growth comparisons into the full account.`
        ]
      }
    ]
  },
  appendix: {
    title: 'Mathematical appendix',
    deck: 'Derivations and proof sketches for the information, career, equilibrium, welfare, and growth results used throughout the site.',
    part: 'Mathematics',
    sections: [
      {
        id: 'information-proof',
        title: 'Information and transfer',
        paragraphs: [
          html`For independent symmetric signs \(B\) and \(T\), the observations \(S=B\eta\) and \(Y=BT\epsilon\) contain independent noise with means \(r_B\) and \(r_A\). Averaging over the unknown foundation gives \(\Pr(Y=y\mid T=t)=1/2\), so the explanation by itself leaves the target’s prior unchanged, while the joint likelihood retains their shared foundation.`,
          html`Bayes’ rule applied to that likelihood gives posterior mean \(r_Br_A SY\), and because \(T^2=1\), its conditional variance is \(1-r_B^2r_A^2\). Independent receipt of the foundational observation with probability \(p\) averages that risk with the prior risk of one, yielding expected risk reduction \(pr_B^2r_A^2\), the quantity displayed in the learning experiment.`,
          html`For several uncertain principles, a Gaussian prior provides the same logic through covariance overlap, since an exercise helps a later target to the extent that their uncertain components move together. <a href="/assets/paper.pdf#page=15">Proposition A.1 and its corollary</a> prove these statements and identify equality of processed information as the condition under which a customer file preserves the learning occasion.`
        ],
        details: [
          {
            title: 'Binary posterior',
            paragraphs: [html`Summing the conditional probabilities over the two foundation values cancels terms linear in the foundation and retains the product of signal reliabilities, giving the likelihood below. Multiplication by the symmetric target prior then gives \(\Pr(T=t\mid S=s,Y=y)=(1+r_Br_A syt)/2\), from which the posterior mean and risk follow directly.`],
            equation: tex`\Pr(S=s,Y=y\mid T=t)=\frac14(1+r_Br_A syt)`
          },
          {
            title: 'Gaussian transfer',
            paragraphs: [html`With \(\theta\sim N(\bar\theta,\Sigma)\) and observation \(Z=u^{\mathsf T}\theta+\varepsilon\), independent noise variance \(\sigma^2>0\) gives posterior covariance \(\Sigma-\Sigma uu^{\mathsf T}\Sigma/(\sigma^2+u^{\mathsf T}\Sigma u)\). Multiplying that covariance reduction on both sides by the target direction \(v\) gives the expression below, whose numerator vanishes exactly when the exercise and target have zero prior covariance.`],
            equation: tex`\mathcal R_{\mathrm{before}}-\mathcal R_{\mathrm{after}}=\frac{(v^{\mathsf T}\Sigma u)^2}{\sigma^2+u^{\mathsf T}\Sigma u}`
          }
        ]
      },
      {
        id: 'career-proof',
        title: 'Private values and stationary replacement',
        paragraphs: [
          html`Under complete pricing, a novice’s practice transition yields capital gain \(\Delta\) and carries payment \(\Delta\), while formal study contributes optimized surplus \(\Delta^2/(2\kappa)\). Subtracting novice and expert value equations gives the career law, with the qualification discount \(\rho+\delta\) reflecting both ordinary discounting and obsolescence.`,
          html`For stationary wages above \(b\), the positive quadratic root gives study \(x(E)\), and differentiating the identity \(\kappa Rx+\kappa x^2/2=w(E)-b\) yields \(x_E=w_E/[\kappa(R+x)]\). Under a nonincreasing wage, \(T(E)=(1-E)x(E)\) is strictly decreasing, so the stationary accumulation equation has one root when its endpoint signs differ.`,
          html`When a finite practice loss lowers that root, the difference between the two stationary flow balances partitions the loss into additional formal transitions and reduced obsolescence replacement. Since both parts are positive, the replacement increase lies strictly between zero and the lost diagnostic flow, with <a href="/assets/paper.pdf#page=19">Proposition C.1</a> also proving increased teaching expenditure.`
        ],
        details: [
          {
            title: 'The local replacement fraction',
            paragraphs: [html`Implicit differentiation of \(M+T(E)-\delta E=0\) gives \(E_M=1/(\delta-T_E)\), while substitution of the study derivative identifies \(\Lambda=\delta-T_E\). Because \(x>0\) and \(w_E\le0\), we obtain \(\Lambda>\delta\), so the fraction of a marginal practice loss replaced by additional formal transitions is strictly between zero and one.`],
            equation: tex`\Lambda=\delta+x-\frac{(1-E)w_E}{\kappa(R+x)},\qquad E_M=\Lambda^{-1},\qquad -T_M=1-\frac\delta\Lambda`
          },
          {
            title: 'Random contacts and eligible recipients',
            paragraphs: [html`With random contacts, \(M=(1-E)m\) and stationarity gives \((1-E)(m+x)=\delta E\), preserving a decreasing qualification drift and the finite incomplete-replacement comparison in actual transition flows. For an initially novice cohort exposed only to revealing contacts, acquisition probability is \(1-\exp[-\int_0^t m(c_s)ds]\), while social valuation also includes the reduction in future eligible recipients after an additional person qualifies.`]
          }
        ]
      },
      {
        id: 'allocation-proof',
        title: 'Research allocation and equilibrium selection',
        paragraphs: [
          html`For continuous strictly decreasing service demand, the roots \(D_S(w_0)=E\) and \(D_S(w_1)+B_R/(w_1+q\xi)=E\) are unique in the stated wage interval, with \(w_0<w_1\) because human research adds positive demand. Procurement buys the cheaper feasible packet, and equal packet costs define \(\overline w=qa_M/a_H-q\xi\), which determines the mixed wage.`,
          html`Clamping that equal-cost wage between the two clearing roots gives the complete allocation rule, whose continuity at the boundaries allows paths to change regime while preserving the wage level. Implicit differentiation gives regular root derivatives under a uniform negative bound on demand’s wage derivative, so finite minima and maxima preserve local Lipschitz continuity across those boundaries.`,
          html`With these cleared prices, the joint equilibrium combines the two inherited states and the terminal private value described in <a href="/dynamics/">the dynamics chapter</a>. <a href="/assets/paper.pdf#page=31">Propositions H.1–H.3</a> connect the short-horizon contraction, local shooting selection, and stationary saddle structure, supplying explicit conditions for the paths used in comparative exercises.`
        ],
        equation: tex`w=\min\{w_1,\max\{w_0,\overline w\}\}`,
        details: [
          {
            title: 'The shared-wage derivative',
            paragraphs: [html`At a strict human corner, differentiating \(E=D_S(w,c,\Delta)+B_R/(w+q\xi)\) gives \(dE=dD_S|_w-\mathcal J\,dw\). Since frontier output at fixed \(A\) is proportional to \(1/(w+q\xi)\), dividing its differential by its level yields the research feedback below, with released professional hours entering through a negative demand shift.`],
            equation: tex`w_E=-\mathcal J^{-1},\qquad \frac{F_E}{F}=\frac1{h\mathcal J},\qquad (L_R)_E=\frac{B_R}{h^2\mathcal J}`
          },
          {
            title: 'The career saddle',
            paragraphs: [html`For the fixed-frontier diagnostic portfolio with a strictly decreasing cleared wage, the career Jacobian has \(f_E=-x-\delta<0\), \(f_\Delta=(1-E)/\kappa>0\), \(g_E=-w_E>0\), and \(g_\Delta=R+x>0\). Its determinant \(f_Eg_\Delta-f_\Delta g_E\) is negative, giving eigenvalues of opposite signs, and the stable eigenvector has a nonzero population component with negative value slope, so the stable manifold is locally a graph over inherited expertise. Within an interior mixed regime, \(g_E=0\) and \(f_E<0<g_\Delta\) preserve the saddle structure while giving a horizontal stable tangent.`]
          },
          {
            title: 'Announced machine improvements',
            paragraphs: [html`With both paths interior mixed, frontier output depends only on the machine method, so identical pre-adoption methods give identical pre-adoption frontiers and wages. Lower subsequent machine requirements raise the scalar frontier field, while machine productivity elasticity at least as large as human productivity elasticity keeps the improved equal-cost wage weakly decreasing along that faster frontier, giving the future wage ordering that the positive career-value kernel transmits to current study.`]
          }
        ]
      },
      {
        id: 'welfare-proof',
        title: 'Social qualification value and released time',
        paragraphs: [
          html`Along a smooth selected equilibrium continuation, resource value \(V(t,E,A)\) has derivatives \(\lambda=V_E\) and \(\Theta=V_A\), while the expert and frontier drifts are \(f\) and \(F\). Differentiating the continuation equation in inherited expertise and subtracting the private value equation leaves the gap law below, whose forcing term combines the fund’s wage response with the social return to innovation.`,
          html`At a strict human corner, the budget identity turns \(L_Rw_E+\Theta F_E\) into \((\Pi-h)(L_R)_E\), where \(\Pi=\Theta A^{-\phi}/a_H\). Backward integration with positive weight \(\exp[-\int_t^s(\rho-f_E)du]\) gives a nonnegative qualification gap when terminal private and social qualification values agree, every future human-research interval satisfies \(\Pi\ge h\) and \((L_R)_E\ge0\), and intervening regimes are mixed or autonomous, with strictness whenever the forcing is positive over a future interval.`,
          html`For a short unannounced preparation change, the leading current-value welfare effect holds the preexisting qualification value fixed while accounting for the changed continuation states. At the human corner, clearing allocates fraction \(\chi_R=B_R/(h^2\mathcal J)\) of released expert hours to research, yielding the private gain plus the social qualification and research terms shown in <a href="/welfare/">the welfare figure</a>.`
        ],
        equation: tex`\frac{d}{dt}(\lambda-\Delta)=(\rho-f_E)(\lambda-\Delta)-\Gamma_E,\qquad \Gamma_E=L_Rw_E+\Theta F_E`,
        details: [
          {
            title: 'Competitive service welfare',
            paragraphs: [html`In the service-and-training benchmark, aggregate formal entry \(I\) uses resources \(\kappa I^2/[2(1-E)]\), a convex perspective of the quadratic study cost. Together with affine feasibility and qualification constraints, that structure gives a concave resource objective, so the competitive customer choices, expert wage, and private qualification value support the global allocation when basic time is slack and discounted private value tends to zero.`, html`At those prices, \(\lambda=\Delta\) aligns both the learning credit and the marginal return to formal instruction with their social values, while preserving earlier customer modes keeps the earlier allocation feasible after an optional technology expansion. Across the resulting welfare comparison, complete feasible paths can include different expert populations and teaching expenditures as part of the efficient adjustment.`]
          },
          {
            title: 'Resource and private-value cancellation',
            paragraphs: [html`Customer optimization supplies an envelope for changes in selected modes, while expert clearing and the differentiated research budget relate service hours to research inputs. Combining those identities with \(\kappa x=\Delta\) cancels the private training and practice terms, leaving \(G_E+\Delta f_E=w-b-\Delta^2/(2\kappa)-\delta\Delta+L_Rw_E\), which delivers the gap equation after subtraction of the private adjoint.`]
          },
          {
            title: 'The signed welfare interval',
            paragraphs: [html`Writing \(K_C=(\lambda-\Delta)m-(\Pi-h)\chi_Re\), the local preparation identity becomes \(\mathcal W=P-K_C\). When \(K_C>0\), every private gain in \(0<P<K_C\) gives negative marginal welfare alongside positive released research hours whenever \(e>0\), and <a href="/assets/paper.pdf#page=43">Corollary I.4</a> constructs a feasible case with nonnegative preparation resources.`]
          }
        ]
      },
      {
        id: 'growth-proof',
        title: 'Production order and research duration',
        paragraphs: [
          html`Positive stage coefficients put each complete-method requirement between two positive multiples of its limiting power, and bounded effective input prices transfer those bounds to packet costs. For \(\dot A\) between positive multiples of \(A^{p-\phi}\), integrating the power gives global polynomial order below \(p=1+\phi\), exponential bounds at equality, and a finite production endpoint above it when bounded frontier states admit continuation.`,
          html`For persistent human research, the expertise floor and a service-demand envelope supply the upper wage bound used in that argument, even after practice vanishes. When customer requirements settle, convergence to the stationary career allocation identifies eventual labor \(L_i\), and \(a_H\sim a_\infty A^{-p_H}\) gives coefficient \(K_i=L_i/a_\infty\), connecting the occupational threshold to a growth coefficient or critical exponential rate.`,
          html`With a positive minimum research duration, the production law becomes a delayed equation whose transformation \(X=A^{1+\phi}\) gives \(X'=aX(t-\tau)^r\), with \(a=(1+\phi)k\) and \(r=\eta/(1+\phi)\). Each successive delay interval receives a bounded forcing path from its predecessor, giving existence at every finite date before any asymptotic comparison is used.`
        ],
        details: [
          {
            title: 'The expertise floor',
            paragraphs: [html`For sufficiently small \(e>0\), define \(d=\kappa\delta e/(1-e)\) and \(a=B_R/e-\overline s_R-b-Rd-d^2/(2\kappa)>0\), where \(\overline s_R\) bounds the compute expense per human research hour. Within \(E\le e\) and \(0\le\Delta\le d\), market clearing implies \(\dot\Delta\le-a\), so a global nonnegative value path can remain in that region for at most \(d/a\) time units.`, html`At a downward crossing of \(E=e\), the population equation implies \(\Delta\le d\), while \(\dot E\ge-\delta E\) bounds the population decline during that excursion. Repeating the argument gives \(E(t)\ge\min\{E(0),e\}\exp(-\delta d/a)>0\), with the initial case above \(d\) handled by the positive population drift supplied by its stronger study incentive.`]
          },
          {
            title: 'The autonomous resource clock',
            paragraphs: [html`Multiplying \(\dot A=B_R(t)A^{-\phi}/[q(t)a_M(A)]\) by \(A^\phi a_M(A)\) and integrating gives equality between required cumulative research effort and cumulative purchasing power. When total effort to reach arbitrarily large frontiers is finite, the arrival date is finite if the resource clock reaches that value, while a resource clock whose limit remains smaller yields a bounded frontier.`, html`For frontier-indexed asymptotic resources, direct substitution gives drift proportional to \(A^{p_M+\beta_B-\beta_q-\phi}\), so the same power integration places the finite-arrival threshold at \(p_M+\beta_B-\beta_q>1+\phi\). <a href="/assets/paper.pdf#page=51">Proposition J.9</a> states the full integral comparison and its resource cases.`]
          },
          {
            title: 'Subcritical and critical delay growth',
            paragraphs: [html`For \(r<1\), monotonicity gives \(X'/X\le aX^{r-1}\to0\), so \(X(t-\tau)/X(t)\to1\) and differentiating \(X^{1-r}\) gives the same leading power coefficient as instantaneous production. For \(r=1\), exponential solutions satisfy \(\lambda e^{\lambda\tau}=a\), and upper and lower exponential multiples fitted to the positive initial history bound the full trajectory.`]
          },
          {
            title: 'Supercritical delay growth',
            paragraphs: [html`For \(r>1\), setting \(Y=\log X\) gives \(Y'=a\exp[rY(t-\tau)-Y(t)]\), which admits exponential subsolutions and supersolutions for \(Y\) at rates on either side of \(\log r/\tau\). Taking logarithms of those bounds yields the limit below, quantifying superexponential growth while each finite date retains a finite frontier, as proved in <a href="/assets/paper.pdf#page=55">Proposition J.11</a>.`, html`Through these derivations, each interactive comparison returns to a specified economic allocation or information experiment, while the <a href="/assets/paper.pdf#page=1">complete paper</a> supplies the full arguments and research context. Returning to <a href="/">the customer file</a> then places the equations beside the practical sequence of work, feedback, training, and research that they describe.`],
            equation: tex`\lim_{t\to\infty}\frac{\log\log A(t)}{t}=\frac1\tau\log\frac{\eta}{1+\phi}`
          }
        ]
      }
    ]
  },
};

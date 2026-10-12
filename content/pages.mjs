const html = (strings, ...values) => String.raw(strings, ...values).replace(/\\\([\s\S]*?\\\)/g, math => math.replaceAll('<', '&lt;').replaceAll('>', '&gt;'));
const tex = String.raw;

export const pages = {
  home: {
    title: 'Before filing',
    deck: '',
    part: 'Story',
    sections: [
      {
        id: 'customer-file',
        title: 'Preparing at home',
        widget: 'tax',
        note: { title: 'Customer technology', text: 'Office tools follow the same path while households prepare more of the file at home.' },
        paragraphs: [
          html`Before a household reaches its tax preparer, work has already begun around the kitchen table, where receipts, statements, and records of unfamiliar transactions have to become a file that someone else can understand. With access to AI, the household can organize those records, investigate a question, and bring the preparer a partly completed return whose remaining difficulty has become easier to describe, even while the office continues using the same software and procedures.`,
          html`For that household, the immediate gain may be a shorter appointment or fewer hours purchased, while another conversation may reveal a question that gives a household a reason to seek advice for the first time. We can follow both changes through the file arriving at the office, where work completed at home alters the professional service being purchased and begins to affect people who have never used the household’s AI tool.`
        ]
      },
      {
        id: 'information',
        title: 'Across filing seasons',
        note: { title: 'Diagnostic practice', text: 'Useful experience connects received records and verified feedback to later independent judgment.' },
        paragraphs: [
          html`Inside the office, a junior preparer may once have traced a discrepancy back through the supporting records and learned which distinction resolved it, so removing that reconstruction can change the experience available during the filing season. When the household supplies the records, reasoning, and subsequent feedback together, the same prepared file can preserve the lesson while saving some of the work needed to complete the return.`,
          html`Over successive seasons, those differences in received information enter the qualifications of people who will advise later households, while workers can also purchase instruction to acquire the judgment that their cases teach less often. Because qualification belongs to the worker and carries future earnings, study responds to the value of the remaining professional work, linking today’s customer preparation to tomorrow’s fees and available expertise.`
        ]
      },
      {
        id: 'shared-expertise',
        title: 'Prices and learning',
        paragraphs: [
          html`When a novice can pay for an informative placement through a wage concession or a separate payment, the learning opportunity helps finance the service received by the household. Removing that opportunity also removes its contribution to the fee, so the private calculation already includes some of the future value of what the novice would have learned.`,
          html`We then follow a fixed-demand comparison in which diagnostic practice falls, total formal training rises, and the eventual expert population becomes smaller, with higher hourly earnings where expert demand slopes downward. Those career and price effects begin with <a href="/work/">what the prepared file teaches</a>, through the records and feedback that remain after the household has finished its work.`
        ]
      }
    ]
  },
  work: {
    title: 'Learning from records',
    deck: '',
    part: 'Story',
    sections: [
      {
        id: 'purchased-work',
        title: 'Remaining work',
        note: { title: 'Purchased hours', text: 'Discovery adds reasons to seek help, while preparation changes the work required after a purchase.' },
        paragraphs: [
          html`When a household brings its records to a tax office, the preparer may receive an unsorted collection of statements or a file organized around a question that the household has already investigated with AI. Comparing those submissions for the same underlying matter allows us to follow the work moved across the office boundary, including the time saved when a calculation arrives with supporting records that the preparer can use.`,
          html`For the household deciding whether to purchase help, preparation changes the cost of the remaining service while discovery can change the reason for buying it. Someone who can complete a straightforward return at home may leave the professional market, while someone who learns that a transaction deserves closer examination may enter it, so the number of customers and the expert hours used by each customer respond through different parts of the same choice.`,
          html`Better information also directs professional attention toward matters where resolving an issue has greater expected value, with purchased work following the household’s decision after that information arrives. We count customer time and inference resources alongside the office’s basic and expert hours, following <a href="https://doi.org/10.2307/2228949">Becker’s allocation-of-time analysis</a>, so the economic comparison includes the preparation performed before a fee is paid.`
        ]
      },
      {
        id: 'foundation',
        title: 'Interpreting an explanation',
        widget: 'learning',
        note: { title: 'Processed information', text: 'Preserving the same records and explanation preserves their learning value when the recipient processes both.' },
        paragraphs: [
          html`For a junior preparer reviewing a completed calculation, an explanation can depend on knowing how the underlying transaction fits the supporting records, so the route from documents to an answer can teach something that the answer alone leaves unresolved. We represent the needed foundation by a hidden sign \(B\) and the principle used in a later judgment by a hidden sign \(T\), with one observation revealing \(B\) imperfectly and a relational explanation revealing their product \(BT\) imperfectly.`,
          html`When the foundation remains unknown, either target sign fits the observed product because changing both hidden signs preserves the explanation. After processing both observations, the learner can multiply them to cancel the foundation, leaving information about the target through the remaining noise, which explains why a stronger explanation has more educational value when its recipient understands the records on which it depends.`,
          html`Within this calculation, foundation reliability \(r_B\) and explanation reliability \(r_A\) determine later unaided prediction error through \(1-r_B^2r_A^2\), while receipt probability \(p\) determines how often the learner processes the pair. As either reliability improves, a received pair becomes more informative, and increasing access passes that gain to more learners, with prior error normalized to one in the figure.`,
          html`By including the observations behind a calculation, a household can preserve the learning occasion in a file whose preparation has already saved professional time, and better explanation quality can compensate for less frequent exposure when the joint information gain rises. Formal instruction offers another way to reach the same principle by revealing \(T\) directly, giving the junior worker a deliberate learning choice alongside experience gained from current returns.`
        ]
      },
      {
        id: 'diagnostic',
        title: 'Diagnostic cases',
        paragraphs: [
          html`Across the returns reaching an office, a diagnostic case reveals a distinction that changes how a junior worker handles a later matter, while a familiar calculation may produce little additional understanding even after taking the same time. With several uncertain principles, we measure this relevance through the covariance between what an exercise reveals and what the later decision requires, giving a statistical account of why experience on one task transfers to another.`,
          html`To follow that learning into professional entry, we focus on a qualification margin where a fully revealing occasion allows an eligible novice to pass an unaided assessment. Aggregating retained diagnostic occasions gives a transition flow \(M\), measured in newly acquired qualifications per unit of time, while the qualified population share \(E\) counts people who can perform the assessed judgment independently.`,
          html`Allocation matters because a revealing occasion creates a transition only when it reaches someone who still needs the qualification, and the benchmark assigns such occasions to eligible novices. Under random contact across the entire occupation, the eligible share is \(1-E\), so a contact rate \(m(c)\) produces \(M=(1-E)m(c)\), with repeated exposure yielding less additional entry as more people become qualified.`,
          html`For measurement, the path from a customer file to \(M\) runs through case arrivals, diagnostic content, actual recipient exposure, and subsequent unaided assessment, allowing a study to identify which part changed. <a href="/assets/paper.pdf#page=4">Pages 4–5 of the paper</a> develop these definitions, and <a href="/assets/paper.pdf#page=15">Appendix A</a> gives the signal calculation behind the figure.`
        ]
      },
      {
        id: 'learning-price',
        title: 'Paying for practice',
        paragraphs: [
          html`Once the junior preparer can carry acquired qualification to another employer, an informative placement has a private value tied to future professional earnings. Writing the value of qualification as \(\Delta\), a case with transition probability \(m\) supports a learning payment \(\Delta m\), which the novice can finance through a separate payment or a wage concession within the service arrangement.`,
          html`Competition passes this contribution into the fee charged to the household, allowing the office to cover its basic and expert labor bills while charging less for a case that teaches someone. When preparation removes the diagnostic occasion, it removes that learning discount along with some current work, so the household’s saving depends on both the labor avoided and the private value of the lost experience.`,
          html`Through that payment, the supporting material in an ordinary tax file enters an investment decision whose return extends across filing seasons. Following <a href="/careers/">the novice’s career</a> then reveals how purchased instruction responds to a changing flow of experience and how the resulting expertise enters the prices faced by later households.`
        ]
      }
    ]
  },
  careers: {
    title: 'Careers and fees',
    deck: '',
    part: 'Story',
    sections: [
      {
        id: 'portable-qualification',
        title: 'Portable qualification',
        note: { title: 'Individual and total', text: 'Aggregate formal entry depends on each novice’s study intensity and on the number of novices.' },
        paragraphs: [
          html`For a junior preparer deciding whether to pay for instruction between filing seasons, acquired judgment has value through the future work it permits, including work at another office. We measure that private value by \(\Delta\), the difference between discounted lifetime income as an expert and as a novice, so financing tuition against future earnings connects the cost of learning today to the professional opportunities expected later.`,
          html`As the novice intensifies study, the resources used in instruction rise according to \(\kappa x^2/2\), where \(x\) is the rate of acquiring qualification and \(\kappa\) governs teaching cost. Balancing marginal expense against the expected value of qualification gives \(x=\Delta/\kappa\), while obsolescence at rate \(\delta\) returns some qualified people to novice status and creates a continuing need for entry.`,
          html`Through an informative customer file, the novice gains another path into qualification, with its private capital gain paid to the placement’s seller under complete pricing. After accounting for that apprenticeship payment, received practice still changes the number of qualified people, while future wage premia determine the value guiding purchased study, as the worker equations on <a href="/assets/paper.pdf#page=16">pages 16–18</a> show.`
        ]
      },
      {
        id: 'replacement',
        title: 'Replacing practice',
        paragraphs: [
          html`To follow the effect of lost experience, we keep the profession’s expert-demand schedule fixed while the diagnostic material retained in its purchased cases falls. At the old expert population, fewer practice transitions leave entry below the flow needed to replace obsolescence, so the stationary population moves downward until purchased instruction and remaining diagnostic entry once again balance qualification loss.`,
          html`As experts become scarcer, a decreasing inverse demand schedule raises their hourly wage, which raises the qualification value and each novice’s study intensity. At the same time, the smaller expert share leaves more novices able to undertake study, so aggregate formal transitions increase through both the number of learners and, where wages respond strictly, their individual investment.`,
          html`Replacing every lost practice transition would preserve the old population, wage, and number of novices, leaving the private study choice unchanged at the very point where greater formal entry was needed. As the population adjusts, the flow identity records how replacement occurs, with lost practice equal to additional formal transitions plus the reduction in obsolescence replacement caused by the smaller expert population.`,
          html`For any finite practice reduction inside the feasible stationary interval, formal transitions rise by a strictly positive amount smaller than the lost practice, and total teaching resources also rise. <a href="/assets/paper.pdf#page=19">Proposition C.1</a> obtains that finite comparison from monotonicity, including continuous demand schedules with corners, while the differentiable formula in the mathematical chapter measures the fraction replaced locally.`
        ]
      },
      {
        id: 'earnings',
        title: 'Earnings and fees',
        paragraphs: [
          html`For the next household seeking advice, the price of remaining professional work reflects the time its file requires and the wage of the people able to supply it, together with any learning payment that helps finance the case. In the competitive fee \(bj+we-\Delta m\), customer preparation can reduce basic hours \(j\) or expert hours \(e\), while the career response changes \(w\) and the value \(\Delta\) of the learning opportunity.`,
          html`When fewer qualified preparers remain and expert demand slopes strictly downward, each receives higher hourly earnings and holds a more valuable qualification. Total income earned by the profession also counts the number of recipients, so its movement combines that higher wage with the reduction in people receiving it, even while a household’s bill follows the particular mix of work left in its return.`,
          html`Within the service-and-training economy, isoelastic expert demand \(D_S=Cw^{-\varepsilon}\) and clearing \(E=D_S\) give total expert income proportional to \(E^{1-1/\varepsilon}\), producing a fall in the wage bill after practice loss when \(\varepsilon>1\). Within that region, someone observing higher professional rates and someone observing lower total expert income would be measuring distinct outcomes of the same stationary adjustment.`,
          html`Novice finances require their own account because placement payments and tuition reduce current cash income while purchased training changes future earnings. Lifetime values incorporate those investments, and the benchmark’s stationary novice value is \(b/\rho+\Delta^2/(2\kappa\rho)\), where \(b\) is the basic outside wage and \(\rho\) is the discount rate, making explicit the difference between current receipts and the value of a career.`,
          html`When household conversations with AI reveal additional matters requiring advice, the resulting demand shift raises training incentives even at a fixed expert population. Expertise falls in that comparison when the diagnostic loss exceeds the formal entry induced by the direct demand shift, which brings the household’s newly discovered questions into the same career calculation as the preparation it completes at home.`
        ]
      },
      {
        id: 'expectations',
        title: 'Future opportunities',
        widget: 'careers',
        note: { title: 'Career horizon', text: 'Displayed finite careers end with zero qualification payoff, so study intensity reaches zero at the terminal date.' },
        paragraphs: [
          html`For a novice choosing instruction this year, the current filing season supplies only part of the return, because qualification opens work across a future whose customer tools may keep improving. Expectations of that work enter \(\Delta\) immediately, allowing study to change before the households arriving at the office have altered their current preparation.`,
          html`With the same terminal career payoff, the difference in present qualification values is a positively weighted integral of future wage differences, so the entire anticipated earnings path contributes to current investment. Population adjusts through the people who actually learn and through obsolescence, giving inherited expertise and forward-looking career value different roles during the transition.`,
          html`We can now carry this service-and-career mechanism into a broader economy where a field’s qualified people divide their time between customer work and research. In <a href="/research/">that extension</a>, research opportunities also enter expected earnings, while the expertise formed through services becomes one of the inputs through which research advances the technology available to future customers.`
        ]
      }
    ]
  },
  research: {
    title: 'Expertise in research',
    deck: '',
    part: 'Story',
    sections: [
      {
        id: 'complete-result',
        title: 'Beyond household services',
        note: { title: 'Shared expertise', text: 'Research enters through a field where customer work and research require the same assessed qualification.' },
        paragraphs: [
          html`Following the household’s tax return has shown how a technology developed elsewhere reaches a profession through its customers, changing purchased work, retained experience, and the return to qualification inside that occupation. We now extend the service economy to a field whose assessed expertise is also used in research, so the people qualified to perform customer work can divide their time between serving customers and producing new knowledge.`,
          html`Within this extension, the same portable qualification supports both activities, and the shared wage carries changes in customer demand into the cost of research. Our career mechanism continues to determine how many qualified people become available, while completed research advances the frontier supplying future customer capability, closing a connection between occupational adjustment and technological progress.`,
          html`To give research demand an explicit source, we assign a fund a fixed expenditure flow and a mandate to purchase completed, validated research packets, whose cost includes generation and checking. Within the human method, both stages use expert time together with computation, while a feasible autonomous method purchases both stages through computation, allowing procurement to compare two complete ways of producing a result.`,
          html`Because each packet includes every stage required for completion, validation can determine the eventual productivity of the method even as generation becomes faster. We first follow the hours and computation needed to finish that work, then allow their market prices to determine which method the fund purchases and how its decision affects the earnings available to qualified people.`
        ]
      },
      {
        id: 'regimes',
        title: 'Research methods',
        widget: 'regimes',
        note: { title: 'Equal packet costs', text: 'Inside a mixed allocation, additional expertise changes method shares while output per unit of budget stays fixed.' },
        paragraphs: [
          html`At the wage that clears customer services alone, every expert works on customer files, while a fund purchasing human research adds another claim on those hours and raises the clearing wage. Comparing these two wages with the wage at which human and machine packets have equal costs determines whether research employs people, computation, or a mixture of both.`,
          html`When human research remains cheaper even at the higher clearing wage, the fund spends its budget on human packets and employs the hours that its wage-plus-compute expense permits. When the autonomous route is cheaper at the service-only wage, the fund purchases machine packets and the professional wage clears customer work alone.`,
          html`Between those cases, equal packet costs fix the wage while labor clearing determines how much human research fits beside customer services, and the remaining budget purchases autonomous packets. Extra expertise then increases the human share at that fixed wage, with each dollar still purchasing the same quantity of completed research, giving a local regime where frontier output is independent of expert headcount.`,
          html`Holding the frontier fixed lets us follow how inherited expertise and customer demand divide today’s research budget, because each method then has a given generation and validation requirement. Along a career path, those inherited quantities change as people learn and research advances, so <a href="/dynamics/">dynamic equilibrium</a> carries the same clearing conditions from one date to the next.`
        ]
      },
      {
        id: 'released-hours',
        title: 'Hours and entrants',
        paragraphs: [
          html`At a human research allocation, customer preparation that saves expert time releases hours from professional work and reduces the wage needed to clear the shared market, allowing the fixed research fund to purchase more labor. Because services also expand when the wage falls, research receives a fraction of the released time, with that fraction determined by the responsiveness of both service demand and research demand.`,
          html`Along a career transition, the same preparation can reduce diagnostic entry and leave fewer qualified people available later, raising the wage paid by the fund at a common frontier. Both channels appear in the local research formula, where the change in expert population enters with the opposite sign to the change in service demand measured at the old wage.`,
          html`For an exact finite comparison after customer task requirements settle, eventual human research rises when the professional hours released at the old wage exceed the loss of expert supply evaluated at the old training incentive. Holding service demand fixed gives lower eventual research labor after practice loss, while sufficiently large service savings reverse that ordering, a threshold proved on <a href="/assets/paper.pdf#page=48">pages 48–49</a>.`,
          html`When a machine method requires a residual human grounding stage, each completed machine packet again purchases some expert time, so expertise changes its cost and research output at the grounded corner. Full autonomous validation and human grounding consequently imply different local responses, with equal-cost mixing still able to absorb changes through method shares.`
        ]
      },
      {
        id: 'anticipated-methods',
        title: 'Future research earnings',
        paragraphs: [
          html`Within an interior mixed allocation, the equal-cost wage follows the relative productivities of the two complete research methods, and a faster-improving machine route can lower that wage as the frontier advances. Announced reductions in future machine requirements then change the earnings available over a novice’s career, so their effect on training begins when the announcement changes expectations.`,
          html`In the paper’s joint comparison, both economies remain mixed, share the same initial states and terminal qualification payoff, and face identical methods until the adoption date. When the improved machine route has productivity elasticity at least as large as the human route over the relevant interval, adoption produces a weakly faster frontier and a weakly lower wage path, which lowers current qualification value and study whenever future wages fall strictly over a positive interval.`,
          html`Because the frontier and wage paths agree before adoption within that comparison, the reduction in initial training comes through expected future returns, while current research allocation remains governed by today’s costs. <a href="/assets/paper.pdf#page=34">Proposition H.4</a> gives the argument, and the <a href="/welfare/">welfare chapter</a> follows the further question of how the value received by an individual worker relates to the value of the research that worker supports.`
        ]
      }
    ]
  },
  welfare: {
    title: 'Valuing preparation',
    deck: '',
    part: 'Story',
    sections: [
      {
        id: 'resource-account',
        title: 'Household resources',
        note: { title: 'Resource value', text: 'Fees transfer purchasing power, while preparation, instruction, and professional time use resources.' },
        paragraphs: [
          html`For the household preparing its tax file at home, an hour saved inside the office belongs in the same account as the household time and computation used to accomplish that work. If preparation also removes an occasion through which a junior worker would acquire qualification, its future consequences enter through the expertise available to later households, so the resource comparison follows the file beyond the current fee.`,
          html`Adding the household, office, and worker accounts cancels fees and wages as transfers and retains the benefits of completed services together with the resources used in preparation, instruction, and professional work. Within the competitive service-and-training benchmark, the novice pays the full private value of diagnostic learning, and that value also supports the social allocation of work and study, giving \(\lambda=\Delta\) between social and private qualification values.`,
          html`Convex training cost and affine allocation constraints give a concave resource problem, so a feasible competitive path satisfying the stated transversality condition maximizes its objective. When an optional improvement in household technology preserves earlier choices, welfare weakly rises because the earlier allocation remains available, while expertise can fall when the resource savings cover the full value of displaced learning, as <a href="/assets/paper.pdf#page=22">Appendix D</a> proves.`
        ]
      },
      {
        id: 'payment-limit',
        title: 'Learning payments',
        paragraphs: [
          html`For a junior worker acquiring experience through a client file, the permitted payment arrangement determines how much learning value can reach the household’s fee. When the arrangement requires positive minimum cash compensation and prohibits a separate charge for the placement, a case using one basic hour can carry a learning credit only up to the difference between the outside basic wage and that required compensation.`,
          html`When this cap binds, a household can prefer preparation because the resources it saves exceed the permitted learning discount, while the qualification displaced is worth more than that saving in the benchmark social account. In symbols, the interval is \(b-s<b-r_C<\Delta m\), where \(s\) is minimum cash compensation, \(r_C\) is the cost of preparation, and \(m\) is the lost transition probability.`,
          html`Within the case analyzed in <a href="/assets/paper.pdf#page=24">Appendix E</a>, \(b=1\), \(s=1/2\), \(r_C=3/8\), and \(\Delta m=3/4\) give a positive private saving of \(1/8\) and a negative resource gain of \(-1/8\). By following the permitted credit through the fee, we can locate the difference in a payment that values the lost experience below its contribution to future services.`,
          html`Once the restriction covers a positive share of transactions, the resulting economy has its own private qualification value and social continuation value, whose difference must be evaluated along that altered allocation. Through this explicit payment rule, the welfare effect remains attached to the missing learning credit and the resources saved by preparation.`
        ]
      },
      {
        id: 'public-research',
        title: 'Public research',
        paragraphs: [
          html`Once we extend the service economy to a field whose qualified people also produce research, an additional hour can support frontier improvements whose benefits continue through the future economy. Writing the gross social return to that research hour as \(\Pi\) and its wage-plus-compute expense as \(h\), the difference \(\Pi-h\) measures the public research return beyond the resources used to produce it.`,
          html`Along a regular selected continuation, more inherited expertise can reduce the wage paid by the research fund and increase the research hours purchased with its budget, so the social qualification value follows both procurement and innovation. With common terminal private and social qualification values, positive future research returns and a positive labor response give \(\lambda>\Delta\), as the positive-weight representation on <a href="/assets/paper.pdf#page=40">pages 40–42</a> shows.`,
          html`Under that value ordering, a small subsidy to formal qualification has a positive marginal welfare effect because the added transition contributes more to continuation welfare than its marginal teaching expense. Within an interior mixed or autonomous research regime, the local research contribution to this value difference is zero, while future human-research intervals can still enter today’s continuation value.`
        ]
      },
      {
        id: 'preparation-surface',
        title: 'One prepared case',
        widget: 'welfare',
        note: { title: 'Local comparison', text: 'Private saving is adjusted for the social value of lost learning and the net return to released research time.' },
        equation: tex`P=bj-r_C+we-\Delta m,\qquad \mathcal W=P-(\lambda-\Delta)m+(\Pi-h)\chi_R e`,
        paragraphs: [
          html`For a short unannounced preparation change at a strict human research corner, the private gain \(P\) includes saved basic hours \(j\), saved expert hours \(e\), preparation resources \(r_C\), and the lost privately priced learning opportunity \(\Delta m\). Only a fraction \(\chi_R\) of released expert time enters research, because the wage adjustment also supports additional customer services.`,
          html`Its marginal social value \(\mathcal W\) follows from the private gain after charging the remaining social value of lost qualification and crediting the additional net return to research. Greater social value of expertise raises the cost of removing a diagnostic occasion, while a greater research return raises the benefit of releasing an expert hour, and their balance determines the welfare boundary for the prepared case.`,
          html`When \((\lambda-\Delta)m\) exceeds \((\Pi-h)\chi_R e\), a range of positive private savings produces negative marginal welfare even as research hours increase, so the expansion of research and the net resource gain have distinct meanings. In the <a href="/assets/paper.pdf#page=42">preparation theorem</a>, that range follows from a short intervention and the continuation states it changes.`,
          html`Returning to the household’s original decision, the same accounting principle follows what preparation saves today and what its file contributes to future expertise, including the qualified time that later customers and research activities can purchase.`
        ]
      }
    ]
  },
  model: {
    title: 'Choices and prices',
    deck: '',
    part: 'Mathematics',
    sections: [
      {
        id: 'customer-choice',
        title: 'Customer choices',
        note: { title: 'One submitted file', text: 'Each way of proceeding has a service benefit, labor requirements, and a possible learning contribution.' },
        equation: tex`F_d=bj_d+we_d-\Delta m_d,\qquad d^*(z)\in\underset{d\in\mathcal D(z,c)}{\operatorname{arg\,max}}\{U_d-bj_d-we_d+\Delta m_d\}`,
        paragraphs: [
          html`For a household assembling its tax return, capability \(c\) changes the ways it can handle a recurring matter \(z\), whose menu \(\mathcal D(z,c)\) includes leaving it unresolved, completing it at home, and purchasing help with different amounts of preparation. Across matters measured by \(\mu_Z\), each choice has expected benefit \(U_d\) after customer time and other nonlabor resources, basic and expert hours \(j_d,e_d\), and expected qualification transition \(m_d\) assigned to an eligible novice.`,
          html`With basic time available at outside wage \(b\), expert time priced at \(w\), and complete practice payments valued at \(\Delta\), competitive fees follow the expression above. Adding the novice’s payment \(\Delta m_d\) to the customer fee exactly covers the provider’s labor bill, giving the learning credit a financing source before it enters the customer’s optimization.`,
          html`Aggregation over selected modes produces service demand \(D_S=\int e_{d^*(z)}\,d\mu_Z\), practice \(M=\int m_{d^*(z)}\,d\mu_Z\), and basic demand \(J=\int j_{d^*(z)}\,d\mu_Z\). Within the region \(J<1-E\), the novice outside activity fixes \(b\), while the scarce expert market determines \(w\), as developed in <a href="/assets/paper.pdf#page=3">the customer model</a>.`
        ]
      },
      {
        id: 'private-career',
        title: 'Private study',
        equation: tex`x=\frac{\Delta}{\kappa},\qquad \dot E=M+(1-E)\frac{\Delta}{\kappa}-\delta E,\qquad \dot\Delta=(\rho+\delta)\Delta-(w-b)+\frac{\Delta^2}{2\kappa}`,
        paragraphs: [
          html`For a novice learning to handle later client matters independently, qualification opens future expert earnings and has portable value \(\Delta=V_E-V_N\), while obsolescence returns experts to novice status at rate \(\delta>0\). Purchasing study intensity \(x\ge0\) at cost \(\kappa x^2/2\) gives expected gain \(x\Delta-\kappa x^2/2\), whose maximizer on the positive-value region supplies the study choice in the first equation.`,
          html`Practice arrives at per-novice rate \(M/(1-E)\), and paying \(\Delta\) per successful transition cancels its private capital gain inside the novice’s value equation. Subtracting that equation from the expert’s equation leaves the wage premium, obsolescence, discounting, and optimized study surplus, producing the qualification-value law while practice remains present in physical accumulation.`,
          html`We measure \(E\) as a qualified population share, \(M\) as an aggregate transition flow, \(x\) as individual study intensity, and \(\Delta\) as discounted career value, so the entry equation counts the people who actually acquire the assessed ability. Each qualified person supplies one expert clock hour per unit of time, connecting the resulting population to available service hours and, in the shared-expertise extension, to research labor.`
        ]
      },
      {
        id: 'stationary-entry',
        title: 'Stationary entry',
        equation: tex`R=\rho+\delta,\qquad x(E)=\sqrt{R^2+\frac{2[w(E)-b]}{\kappa}}-R,\qquad M+(1-E)x(E)=\delta E`,
        paragraphs: [
          html`When the material retained for junior learning changes while the remaining expert work in purchased files stays fixed, we obtain the diagnostic-portfolio comparison by keeping the selected modes within their strict purchase margins. Its inverse wage \(w(E)>b\) is independent of \(M\) and \(\Delta\), and a continuous nonincreasing wage schedule gives weakly decreasing individual study and strictly decreasing aggregate formal transitions \(T(E)=(1-E)x(E)\), since the novice population also contracts as \(E\) rises.`,
          html`Positive qualification drift at the lower feasible endpoint and negative drift at the upper endpoint give a unique stationary population for each practice flow in the comparison interval. At two such equilibria, subtracting their accumulation identities gives \(T^1-T^0=(M^0-M^1)-\delta(E^0-E^1)\), so a practice loss lowers expertise and induces strictly positive, incomplete formal replacement.`,
          html`For a differentiable wage, the denominator \(\Lambda=\delta+x-(1-E)w_E/[\kappa(R+x)]\) gives \(E_M=1/\Lambda\) and replacement fraction \(-T_M=1-\delta/\Lambda\). Because \(\Lambda>\delta\), this fraction lies strictly between zero and one, with its magnitude determined jointly by study costs, obsolescence, and the equilibrium wage response.`
        ]
      },
      {
        id: 'service-validation',
        title: 'Fees and validation',
        equation: tex`\mathcal T(w,c)=\min_{v\ge0}\{w[e(c)+v]+k(c)+r_\gamma(\pi(c)e^{-v})\},\qquad P=\frac{\varepsilon}{\varepsilon-1}\mathcal T`,
        paragraphs: [
          html`For a household comparing the cost of advice with the consequence of an unresolved mistake, the fee and the reliability of the completed return enter the same decision. In the service-quality extension, fixed franchises serve customer groups at generalized price \(P\), combining the fee with the certainty-equivalent loss from error, while each case uses generation time \(e(c)\), checking time \(v\), and other resources \(k(c)\), with error probability \(\pi(c)e^{-v}\) declining as experts validate the work.`,
          html`With constant absolute risk aversion \(\gamma\) and error loss \(L\), the certainty-equivalent cost is \(r_\gamma(z)=\gamma^{-1}\log[1+z(e^{\gamma L}-1)]\), whose risk-neutral limit is \(Lz\). Optimized generalized unit cost \(\mathcal T\) enters the isoelastic markup shown above, and its wage derivative counts the expert hours needed per completed case, giving aggregate demand \(D_S=\mathcal T_w N(c)P^{-\varepsilon}\).`,
          html`For risk-neutral customers, optimal checking is \(v^*=[\log(L\pi(c)/w)]_+\), so more reliable files reduce validation at a fixed wage while a larger possible loss raises its return. <a href="/assets/paper.pdf#page=25">Lemma F.1</a> proves that the resulting expert demand decreases strictly with the wage, including the points at which validation enters or leaves the selected service.`
        ]
      },
      {
        id: 'research-production',
        title: 'Shared research',
        note: { title: 'Expert hours', text: 'Within the research extension, services and human research share the hours supplied by qualified people.' },
        equation: tex`\begin{aligned}a_H(A)&=A^{-\alpha}+v_RA^{-\nu},& k_H&=a_H(A)(w+q\xi),\\a_M(A)&=A^{-\mu}+m_RA^{-\zeta},& k_M&=qa_M(A),\\E&=D_S+L_R,& (w+q\xi)L_R+qQ_M&=B_R,\\\dot A&=A^{-\phi}\frac{B_R}{\min_{j\in\mathcal F(A)}k_j},& c(A)&=\kappa_c\log(A/A_0).\end{aligned}`,
        paragraphs: [
          html`Extending the service economy to a field with expertise shared by customer work and research introduces completed research packets alongside client cases. Positive coefficients \(v_R\) and \(m_R\) preserve each method’s validation stage, while \(q\) prices computation and \(\xi\) measures its use per human research hour, so human packets require \(a_H\) expert hours and autonomous packets require \(a_M\) computation units.`,
          html`Expert clearing joins customer services to human research, and the fixed expenditure flow \(B_R\) pays for human labor and all research computation. Completed packets advance the cardinal frontier \(A\), while idea difficulty \(A^{-\phi}\) reduces the increment supplied by each packet as the frontier grows, connecting improved research methods to a progressively harder innovation task.`,
          html`For the selected service portfolio, \(C(c)=C_0e^{\gamma c}\) and \(D_S=C(c)w^{-\varepsilon}\) translate discovery and preparation into purchased expert hours, while \(M(c)=M_0e^{-\beta_c c}\) follows diagnostic transitions as customer capability grows. Multiplying \(a_M\) by a positive factor changes the computation needed for both stages of the machine method, giving customer use and research production separate ways to alter the shared economy.`,
          html`Market clearing determines today’s wage from the inherited population and the feasible research methods, while the <a href="/dynamics/">career equations</a> connect that wage to the earnings expected over the remaining horizon. Following both conditions together gives a path in which customer preparation changes current work and the value of becoming able to perform future work.`
        ]
      }
    ]
  },
  dynamics: {
    title: 'Learning over time',
    deck: '',
    part: 'Mathematics',
    sections: [
      {
        id: 'two-boundaries',
        title: 'Inherited conditions',
        note: { title: 'Two time directions', text: 'Population carries earlier learning forward, while qualification value depends on future earnings.' },
        equation: tex`E(0)=E_0,\qquad A(0)=A_0,\qquad \Delta(T)=\overline\Delta,\qquad \dot X=H(X,\Delta),\quad \dot\Delta=G(X,\Delta),\quad X=(E,A)`,
        paragraphs: [
          html`At the beginning of a filing season, the people available to advise households carry the learning acquired during earlier seasons, while a novice’s decision to study depends on the professional work expected ahead. In the shared research economy, inherited expertise \(E\) and frontier productivity \(A\) supply the initial states, while a terminal career payoff \(\overline\Delta\) records the value of qualification in the continuation occupation.`,
          html`Given a trial qualification-value path, we can integrate population and frontier forward while clearing the labor market at each date, then integrate the value equation backward from its terminal payoff using the resulting wages. Repeating those updates seeks a path whose physical evolution and anticipated earnings agree, the same logical construction used in the paper’s finite-horizon existence proof.`,
          html`Within a compact feasible region, uniformly decreasing service demand gives regular wage roots, bounded wages keep private values bounded, and a sufficiently short horizon limits the feedback between the two path updates. <a href="/assets/paper.pdf#page=31">Proposition H.1</a> supplies an explicit contraction condition under which the boundary problem has one equilibrium inside that region, including endogenous changes in the active research allocation.`
        ],
        details: [{
          title: 'Contraction condition',
          paragraphs: [html`With \(R=\rho+\delta\), state-field Lipschitz constant \(L_H\), and wage Lipschitz constant \(L_W\), the forward update changes distances by at most \(TL_H\) and the backward update by at most \((1-e^{-RT})L_W/R\). Taking their maximum below one gives a contraction, while \(TH_{\max}<m_X\) keeps states inside the region and a value bound \(D\) satisfying \(RD+D^2/(2\kappa)\ge W_{\max}-b\) keeps the backward value within \([0,D]\).`],
          equation: tex`\max\left\{TL_H,\frac{1-e^{-RT}}{R}L_W\right\}<1`
        }]
      },
      {
        id: 'feedback',
        title: 'Connected channels',
        widget: 'feedback-parts',
        note: { title: 'Conditional response', text: 'Each link holds its stated variables fixed, while complete paths allow those quantities to respond together.' },
        equation: tex`\mathcal J=-D_{S,w}+\frac{B_R}{h^2},\qquad h=w+q\xi,\qquad d\log F=\frac{dE-dD_S|_w}{h\mathcal J}`,
        paragraphs: [
          html`Through the shared market, more expertise lowers the human research wage, while greater customer demand raises it, and both price effects change the packets purchased by a fixed fund. At a common frontier in a strict human regime, differentiating clearing gives the displayed local relationship, where \(dD_S|_w\) includes customer and qualification-value effects evaluated at the original wage.`,
          html`Within each diagram, we follow one part of the connection from customer preparation to professional work, from learning to career value, or from the shared wage to research. For positive quantities \(u\) and \(v\), the elasticity \((u/v)\,\partial v/\partial u\) expresses the exact local percentage response under the specified conditioning, while a derivative of an accumulation or value equation describes its corresponding flow.`,
          html`When a customer or research change persists across time, the career equations and market clearing carry it into future practice, study, and available expertise, which in turn enter the frontier path. Within the <a href="/feedback/">full feedback graph</a>, Loops, Strength, and Shock join these diagrams and connect the conditional relationships to complete paths selected by the initial states and terminal career payoff.`,
          html`Human, mixed, and autonomous allocations have different derivative structures because an interior mixture and an autonomous corner price completed output through the machine cost. At a fixed frontier in those regions, \(F_E=0\), while human research has \(F_E/F=1/(h\mathcal J)>0\), and the graph’s selected regime identifies which relationship applies.`,
          html`When the model retains a human grounding requirement inside the machine route, expertise again changes research output at the grounded corner through the price of that required labor. Equal-cost mixing can still adjust the human share while preserving output per unit of budget, so the complete allocation rule determines which feedback is active.`
        ]
      },
      {
        id: 'value-kernel',
        title: 'Career expectations',
        equation: tex`\begin{aligned}\Delta_1(t)-\Delta_0(t)&=\mathcal K(t,T)[\Delta_1(T)-\Delta_0(T)]\\&\quad+\int_t^T\mathcal K(t,s)[w_1(s)-w_0(s)]\,ds,\\\mathcal K(t,s)&=\exp\!\left[-\int_t^s\left(\rho+\delta+\frac{\Delta_1(u)+\Delta_0(u)}{2\kappa}\right)du\right].\end{aligned}`,
        paragraphs: [
          html`For a novice deciding whether this year’s tuition is justified by later professional work, comparing two future wage paths requires carrying their earnings differences back to the date of study. Subtracting the private value equations gives a scalar linear equation because the difference of squared values factors into their sum times their difference, and backward integration produces the positive kernel above.`,
          html`With common terminal values, every future wage difference enters present qualification value with positive weight, so a lower future wage path lowers today’s study incentive. For bounded global value paths, the terminal term vanishes as the horizon grows, and the same comparison becomes an integral over the entire future, as proved in <a href="/assets/paper.pdf#page=29">Proposition G.3</a>.`,
          html`For an announced machine improvement, the wage difference comes from the endogenous research allocation and its frontier path, with the mixed-regime theorem giving a signed joint example under the relative-productivity condition. Through the kernel, future wage changes that differ in sign contribute according to their place along the full discounted path when determining current investment.`
        ]
      },
      {
        id: 'path-selection',
        title: 'Selecting a path',
        paragraphs: [
          html`At a fixed frontier, the stationary career system has one stable direction and one unstable direction under the strict diagnostic-portfolio conditions, so a nearby inherited expert population selects one locally convergent initial qualification value. Numerical selection can use forward and backward relaxation or vary the initial value until the terminal payoff is satisfied, with feasibility, clearing, and boundary residuals evaluated on the resulting path.`,
          html`For a longer finite horizon, the shooting residual \(S(\Delta_0)=\Delta(T)-\Psi(E(T),A(T))\) gives a local selection test, since a nonzero derivative \(S'(\Delta_0)\) allows the implicit-function theorem to identify one nearby initial value. Endogenous equal-cost boundaries preserve the wage level and use piecewise derivatives, while a discrete first-availability event also changes its date under perturbation.`,
          html`At each date on the resulting path, work reaches people whose expertise was accumulated earlier, while their investment reflects the earnings expected from later work. Once this career mechanism is joined to research allocation, <a href="/growth/">frontier growth</a> follows from the productivity of complete research methods and from the time needed to put newly produced knowledge into use.`
        ]
      }
    ]
  },
  growth: {
    title: 'Capability and time',
    deck: '',
    part: 'Mathematics',
    sections: [
      {
        id: 'human-input',
        title: 'Persistent expertise',
        paragraphs: [
          html`Across successive filing seasons, the experience left in household submissions can diminish as customers complete more work, while novices retain the option of purchasing instruction when future professional earnings justify its cost. In the shared-expertise extension with persistent human research, the budget and labor market imply \(w+q\xi\ge B_R/E\), so a small qualified population supports a strong training incentive through the research fund’s demand for scarce expertise.`,
          html`Along a global feasible career path with nonnegative qualification values, that scarcity condition prevents expertise from remaining arbitrarily close to zero, because study below replacement would force the value equation downward too quickly to preserve a nonnegative career value. <a href="/assets/paper.pdf#page=45">Proposition J.1</a> gives an explicit positive population bound even with \(M=0\), and a bounded service-demand envelope then gives an upper wage bound.`,
          html`For settled customer environments, eventual human research labor weakly rises exactly when service hours released at the old wage cover the lost expert supply evaluated at the old training incentive. Through that comparison, customer preparation determines the coefficient of subsequent frontier growth, while the productivity of the complete research method determines its exponent.`
        ],
        details: [{
          title: 'Customer threshold',
          paragraphs: [
            html`For environments \(i=0,1\), eventual practice flows \(\overline M_i\in[0,\delta)\) and service schedules \(D_i(w)\) give occupational supply \((\overline M_i+x(w))/(\delta+x(w))\), with stationary wage \(w_i\) clearing services and human research. At the old stationary wage \(w_0\), the difference in supply caused by practice loss is \((\overline M_0-\overline M_1)/(\delta+x(w_0))\), so comparing it with released service hours determines the sign of the new market imbalance.`,
            html`Increasing occupational supply and decreasing labor demand then order the new stationary wage, whose inverse relationship with \(L_i=B_R/(w_i+q\xi)\) gives the equivalence below. With \(a_H(A)\sim a_\infty A^{-p_H}\), eventual coefficient \(K_i=L_i/a_\infty\) satisfies \(A_i(t)^{1+\phi-p_H}\sim(1+\phi-p_H)K_i t\) below the critical exponent, while the proportional growth rate tends to \(K_i\) at equality.`
          ],
          equation: tex`L_1\ge L_0\quad\Longleftrightarrow\quad D_0(w_0)-D_1(w_0)\ge\frac{\overline M_0-\overline M_1}{\delta+x(w_0)}`
        }]
      },
      {
        id: 'complete-exponents',
        title: 'Complete methods',
        equation: tex`p_H=\min\{\alpha,\nu\},\qquad p_M=\min\{\mu,\zeta\},\qquad \dot A\asymp A^{p-\phi}`,
        paragraphs: [
          html`Within each serial method, generation and validation requirements add, so the stage whose input requirement declines more slowly dominates their eventual sum. Factoring the smaller exponent from \(a_H\) or \(a_M\) leaves a positive bounded factor, giving the complete-method exponents above and a direct route from stage-level productivity to packet cost.`,
          html`With the effective human input price bounded above and away from zero, persistent human research gives \(p=p_H\), while two continuously available methods give \(p=\max\{p_H,p_M\}\) because procurement selects the cheaper complete route. Idea difficulty then subtracts \(\phi\) from that productivity exponent, producing power growth for \(p<1+\phi\), exponential order at equality, and a finite production endpoint for \(p>1+\phi\) under the stated continuation conditions.`,
          html`For a grounded machine method, completing each packet additionally requires \(a_G=g_GA^{-\chi}\) expert hours, and under the paper’s bounded-overhead conditions with \(\chi\le p_M\), that human stage governs its complete-route exponent. When \(\chi\le1+\phi<p_M\), the grounding requirement gives a global frontier path in a comparison whose fully autonomous route has a finite endpoint, as developed in <a href="/assets/paper.pdf#page=49">Proposition J.7</a>.`
        ]
      },
      {
        id: 'growth-comparison',
        title: 'Levels and rates',
        widget: 'growth',
        note: { title: 'Growth rates', text: 'Larger absolute frontier increments can coexist with a declining proportional growth rate.' },
        equation: tex`\dot A=kA^\beta,\qquad \ddot A=\beta k^2A^{2\beta-1},\qquad g_A=\dot A/A,\qquad \dot g_A=(\beta-1)g_A^2`,
        paragraphs: [
          html`For the scalar law in the figure, the exponent \(\beta\) compares effective research productivity with idea difficulty, while \(k\) fixes the resource scale. When \(0<\beta<1\), successive absolute frontier increments grow even as proportional growth falls, with the level chart displaying \(A\), the phase chart displaying absolute increments \(\dot A\), and the equation for \(g_A\) identifying the percentage-growth distinction.`,
          html`In human research, changes in the wage also enter proportional growth, with \(\dot g_A/g_A=(\epsilon_H-\phi-1)g_A-\dot w/(w+q\xi)\). When wages fall, the budget purchases more research, while rising scarcity earnings absorb some productivity gains, connecting the career path to the growth rate beyond the scalar exponent comparison.`,
          html`Holding the initial frontier and research resource scale fixed allows us to follow how the timing of new capability changes the research it supports. Immediate use, gradual absorption, and a minimum research duration pass the same improvement into subsequent work at different dates, which changes the connection between today’s discovery and tomorrow’s productive tools.`
        ]
      },
      {
        id: 'time',
        title: 'Research duration',
        equation: tex`\begin{aligned}\dot A&=kr^\eta A^{-\phi},& \dot r&=(A-r)/\ell,\\\dot A(t)&=kA(t-\tau)^\eta A(t)^{-\phi}.\end{aligned}`,
        paragraphs: [
          html`Under gradual absorption, effective research capability \(r\) approaches the current frontier with time scale \(\ell>0\), giving recent improvements a continuously increasing role in production. Below \(\eta=1+\phi\), the power asymptotic survives, while at equality the limiting exponential rate solves \(g(1+\ell g)^\eta=k\), and higher elasticities retain a finite production endpoint.`,
          html`Under a positive minimum duration \(\tau\), today’s research can use only capability available at least one cycle earlier, so each interval inherits bounded inputs from the completed interval before it. Applying the method of steps then gives a finite frontier at every finite date, while supercritical productivity still yields growth whose double logarithm rises asymptotically at rate \(\tau^{-1}\log[\eta/(1+\phi)]\).`,
          html`At the threshold, the fixed-duration exponential rate solves \(ge^{(1+\phi)g\tau}=k\), which differs from the gradual-absorption equation because the two timing technologies pass improvements into production differently. <a href="/assets/paper.pdf#page=53">Pages 53–56</a> give the classifications and proofs behind this comparison.`
        ]
      },
      {
        id: 'resources-continuation',
        title: 'Resources and continuation',
        note: { title: 'Research purchasing power', text: 'Autonomous research follows cumulative expenditure relative to the price of computation.' },
        equation: tex`\int_{A_0}^{A(t)}u^\phi a_M(u)\,du=\int_0^t\frac{B_R(s)}{q(s)}\,ds`,
        paragraphs: [
          html`For autonomous research, integrating the production law gives an exact resource clock, with the left side measuring the cumulative computation-adjusted effort needed to reach a frontier and the right side measuring available research purchasing power. If frontier-indexed budgets and compute prices scale with exponents \(\beta_B\) and \(\beta_q\), the finite-arrival threshold becomes \(p_M+\beta_B-\beta_q>1+\phi\).`,
          html`Human research also faces the physical bound \(L_R\le E\), so additional expenditure can bid up wages when existing expertise is already employed, with subsequent entry determined by private training. For a technology whose frontier coordinate has a finite endpoint, completion of the public program leaves a residual implementation occupation, whose earnings provide the continuation qualification value used in the preceding career problem.`,
          html`With that continuation, research completion becomes an absorbing activity state while wages, study, and lifetime values continue in calendar time, linking the value of expertise before completion to the work remaining after the research program has ended.`
        ]
      }
    ]
  },
  appendix: {
    title: 'Derivations',
    deck: '',
    part: 'Mathematics',
    sections: [
      {
        id: 'information-proof',
        title: 'Information and transfer',
        note: { title: 'Retained judgment', text: 'Prediction error is evaluated using the information the learner has processed before a later unaided decision.' },
        paragraphs: [
          html`To follow what a junior preparer retains from a worked return, we represent the needed foundation and later target judgment by independent symmetric signs \(B\) and \(T\). Observations \(S=B\eta\) and \(Y=BT\epsilon\) contain independent noise with means \(r_B\) and \(r_A\), and averaging over the unknown foundation gives \(\Pr(Y=y\mid T=t)=1/2\), so the explanation alone leaves the target’s prior unchanged while the joint likelihood retains the shared foundation.`,
          html`Bayes’ rule applied to that likelihood gives posterior mean \(r_Br_A SY\), and because \(T^2=1\), its conditional variance is \(1-r_B^2r_A^2\). Independent receipt of the foundational observation with probability \(p\) averages that risk with the prior risk of one, yielding expected risk \(1-pr_B^2r_A^2\), the quantity displayed in the learning experiment.`,
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
        title: 'Qualification and replacement',
        paragraphs: [
          html`Following experience from a household file into the novice’s career requires accounting for the payment used to acquire it, because complete pricing assigns both capital gain \(\Delta\) and payment \(\Delta\) to a successful practice transition. Formal study contributes optimized surplus \(\Delta^2/(2\kappa)\), and subtracting the novice and expert value equations gives the career law with qualification discount \(\rho+\delta\), reflecting ordinary discounting and obsolescence.`,
          html`For stationary wages above \(b\), the positive quadratic root gives study \(x(E)\), and differentiating the identity \(\kappa Rx+\kappa x^2/2=w(E)-b\) yields \(x_E=w_E/[\kappa(R+x)]\). Under a nonincreasing wage, \(T(E)=(1-E)x(E)\) is strictly decreasing, so the stationary accumulation equation has one root when its endpoint signs differ.`,
          html`When a finite practice loss lowers that root, the difference between the two stationary flow balances partitions the loss into additional formal transitions and reduced obsolescence replacement. Since both parts are positive, the replacement increase lies strictly between zero and the lost diagnostic flow, with <a href="/assets/paper.pdf#page=19">Proposition C.1</a> also proving increased teaching expenditure.`
        ],
        details: [
          {
            title: 'Replacement fraction',
            paragraphs: [html`Implicit differentiation of \(M+T(E)-\delta E=0\) gives \(E_M=1/(\delta-T_E)\), while substitution of the study derivative identifies \(\Lambda=\delta-T_E\). Because \(x>0\) and \(w_E\le0\), we obtain \(\Lambda>\delta\), so the fraction of a marginal practice loss replaced by additional formal transitions is strictly between zero and one.`],
            equation: tex`\Lambda=\delta+x-\frac{(1-E)w_E}{\kappa(R+x)},\qquad E_M=\Lambda^{-1},\qquad -T_M=1-\frac\delta\Lambda`
          },
          {
            title: 'Eligible recipients',
            paragraphs: [html`With random contacts, \(M=(1-E)m\) and stationarity gives \((1-E)(m+x)=\delta E\), preserving a decreasing qualification drift and the finite incomplete-replacement comparison in actual transition flows. For an initially novice cohort exposed only to revealing contacts, acquisition probability is \(1-\exp[-\int_0^t m(c_s)ds]\), while social valuation also includes the reduction in future eligible recipients after an additional person qualifies.`]
          }
        ]
      },
      {
        id: 'allocation-proof',
        title: 'Research equilibrium',
        paragraphs: [
          html`Within the extension where services and research share qualified labor, continuous strictly decreasing service demand gives unique roots \(D_S(w_0)=E\) and \(D_S(w_1)+B_R/(w_1+q\xi)=E\) in the stated wage interval, with \(w_0<w_1\) because human research adds positive demand. Procurement buys the cheaper feasible packet, and equal packet costs define \(\overline w=qa_M/a_H-q\xi\), which determines the mixed wage.`,
          html`Once both research methods are feasible, clamping that equal-cost wage between the two clearing roots gives the allocation rule, whose continuity at the boundaries allows paths to change regime while preserving the wage level. Before autonomous research becomes feasible, human research clears at \(w_1\), and implicit differentiation gives regular root derivatives under a uniform negative bound on demand’s wage derivative, so finite minima and maxima preserve local Lipschitz continuity across the subsequent regime boundaries.`,
          html`With these cleared prices, the joint equilibrium combines the two inherited states and the terminal private value described in <a href="/dynamics/">the dynamics chapter</a>. <a href="/assets/paper.pdf#page=31">Propositions H.1–H.3</a> connect the short-horizon contraction, local shooting selection, and stationary saddle structure, supplying explicit conditions for the paths used in comparative exercises.`
        ],
        equation: tex`w=\min\{w_1,\max\{w_0,\overline w\}\}`,
        details: [
          {
            title: 'Shared-wage derivative',
            paragraphs: [html`At a strict human corner, differentiating \(E=D_S(w,c,\Delta)+B_R/(w+q\xi)\) gives \(dE=dD_S|_w-\mathcal J\,dw\). Since frontier output at fixed \(A\) is proportional to \(1/(w+q\xi)\), dividing its differential by its level yields the research feedback below, with released professional hours entering through a negative demand shift.`],
            equation: tex`w_E=-\mathcal J^{-1},\qquad \frac{F_E}{F}=\frac1{h\mathcal J},\qquad (L_R)_E=\frac{B_R}{h^2\mathcal J}`
          },
          {
            title: 'Career saddle',
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
        title: 'Social qualification value',
        note: { title: 'Public research return', text: 'Additional research contributes its social return after deducting the resources used to produce it.' },
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
            title: 'Value cancellation',
            paragraphs: [html`Customer optimization supplies an envelope for changes in selected modes, while expert clearing and the differentiated research budget relate service hours to research inputs. Combining those identities with \(\kappa x=\Delta\) cancels the private training and practice terms, leaving \(G_E+\Delta f_E=w-b-\Delta^2/(2\kappa)-\delta\Delta+L_Rw_E\), which delivers the gap equation after subtraction of the private adjoint.`]
          },
          {
            title: 'Welfare interval',
            paragraphs: [html`Writing \(K_C=(\lambda-\Delta)m-(\Pi-h)\chi_Re\), the local preparation identity becomes \(\mathcal W=P-K_C\). When \(K_C>0\), every private gain in \(0<P<K_C\) gives negative marginal welfare alongside positive released research hours whenever \(e>0\), and <a href="/assets/paper.pdf#page=43">Corollary I.4</a> constructs a feasible case with nonnegative preparation resources.`]
          }
        ]
      },
      {
        id: 'growth-proof',
        title: 'Growth and duration',
        paragraphs: [
          html`Positive stage coefficients put each complete-method requirement between two positive multiples of its limiting power, and bounded effective input prices transfer those bounds to packet costs. For \(\dot A\) between positive multiples of \(A^{p-\phi}\), integrating the power gives global polynomial order below \(p=1+\phi\), exponential bounds at equality, and a finite production endpoint above it when bounded frontier states admit continuation.`,
          html`For persistent human research, the expertise floor and a service-demand envelope supply the upper wage bound used in that argument, even after practice vanishes. When customer requirements settle, convergence to the stationary career allocation identifies eventual labor \(L_i\), and \(a_H\sim a_\infty A^{-p_H}\) gives coefficient \(K_i=L_i/a_\infty\), connecting the occupational threshold to a growth coefficient or critical exponential rate.`,
          html`With a positive minimum research duration, the production law becomes a delayed equation whose transformation \(X=A^{1+\phi}\) gives \(X'=aX(t-\tau)^r\), with \(a=(1+\phi)k\) and \(r=\eta/(1+\phi)\). Each successive delay interval receives a bounded forcing path from its predecessor, giving existence at every finite date before any asymptotic comparison is used.`
        ],
        details: [
          {
            title: 'Expertise floor',
            paragraphs: [html`For sufficiently small \(e>0\), define \(d=\kappa\delta e/(1-e)\) and \(a=B_R/e-\overline s_R-b-Rd-d^2/(2\kappa)>0\), where \(\overline s_R\) bounds the compute expense per human research hour. Within \(E\le e\) and \(0\le\Delta\le d\), market clearing implies \(\dot\Delta\le-a\), so a global nonnegative value path can remain in that region for at most \(d/a\) time units.`, html`At a downward crossing of \(E=e\), the population equation implies \(\Delta\le d\), while \(\dot E\ge-\delta E\) bounds the population decline during that excursion. Repeating the argument gives \(E(t)\ge\min\{E(0),e\}\exp(-\delta d/a)>0\), with the initial case above \(d\) handled by the positive population drift supplied by its stronger study incentive.`]
          },
          {
            title: 'Resource clock',
            paragraphs: [html`Multiplying \(\dot A=B_R(t)A^{-\phi}/[q(t)a_M(A)]\) by \(A^\phi a_M(A)\) and integrating gives equality between required cumulative research effort and cumulative purchasing power. When total effort to reach arbitrarily large frontiers is finite, the arrival date is finite if the resource clock reaches that value, while a resource clock whose limit remains smaller yields a bounded frontier.`, html`For frontier-indexed asymptotic resources, direct substitution gives drift proportional to \(A^{p_M+\beta_B-\beta_q-\phi}\), so the same power integration places the finite-arrival threshold at \(p_M+\beta_B-\beta_q>1+\phi\). <a href="/assets/paper.pdf#page=51">Proposition J.9</a> states the full integral comparison and its resource cases.`]
          },
          {
            title: 'Slower delayed growth',
            paragraphs: [html`For \(r<1\), monotonicity gives \(X'/X\le aX^{r-1}\to0\), so \(X(t-\tau)/X(t)\to1\) and differentiating \(X^{1-r}\) gives the same leading power coefficient as instantaneous production. For \(r=1\), exponential solutions satisfy \(\lambda e^{\lambda\tau}=a\), and upper and lower exponential multiples fitted to the positive initial history bound the full trajectory.`]
          },
          {
            title: 'Supercritical delay growth',
            paragraphs: [html`For \(r>1\), setting \(Y=\log X\) gives \(Y'=a\exp[rY(t-\tau)-Y(t)]\), which admits exponential subsolutions and supersolutions for \(Y\) at rates on either side of \(\log r/\tau\). Taking logarithms of those bounds yields the limit below, quantifying superexponential growth while each finite date retains a finite frontier, as proved in <a href="/assets/paper.pdf#page=55">Proposition J.11</a>.`],
            equation: tex`\lim_{t\to\infty}\frac{\log\log A(t)}{t}=\frac1\tau\log\frac{\eta}{1+\phi}`
          }
        ]
      }
    ]
  },
};

import { cite, bibliography } from './references.mjs';

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
        note: { title: 'Household production', text: html`${cite('becker1965')} treats household time and purchased inputs as ingredients in production, giving work completed at home a place in the resource account.` },
        paragraphs: [
          html`Before a household reaches its tax preparer, work has already begun around the kitchen table. Receipts, statements, and records of unfamiliar transactions have to become a file someone else can understand. With AI, the household can organize those records and investigate a question before bringing in a partly completed return. Its remaining difficulty is easier to describe, even while the office uses the same software and procedures (<a href="/story/#figure-1">fig. 1</a>).`,
          html`For that household, the immediate gain may be a shorter appointment or fewer hours purchased, while another conversation may reveal a question that gives a household a reason to seek advice for the first time. Following the household-production account of ${cite('becker1965')}, we count preparation time alongside purchased inputs, then follow the completed file into the professional work that remains.`,
          html`Keeping office tools fixed lets us compare what happens when the same preparer receives a different file for the same matter. Its contents change the hours required, the price worth paying, and the remaining work assigned to a junior colleague. We follow that colleague through the records received and the judgment learned while completing the return.`
        ]
      },
      {
        id: 'information',
        title: 'Across filing seasons',
        note: { title: 'Learning through work', text: html`${cite('arrow1962')} connects experience in production to future performance, while our diagnostic measure follows the information retained from an individual case.` },
        paragraphs: [
          html`Inside the office, a junior preparer may once have traced a discrepancy through supporting records and learned which distinction resolved it, linking current production to later ability through the learning-by-doing mechanism studied by ${cite('arrow1962')}. When the household supplies the records, reasoning, and subsequent feedback together, the prepared file can preserve that lesson while saving work needed to complete the return.`,
          html`Over successive seasons, those differences in received information enter the qualifications of people who will advise later households, while workers can also purchase instruction to acquire the judgment that their cases teach less often. Because qualification belongs to the worker and carries future earnings, study responds to the value of the remaining professional work, linking today’s customer preparation to tomorrow’s fees and available expertise.`,
          html`We can follow two files that produce an equally successful return yet leave different lessons with their recipients, because one preserves the observations behind a decision while the other supplies only its conclusion. That difference becomes economically relevant when the recipient later faces another household’s problem independently and must draw on what the earlier case taught.`
        ]
      },
      {
        id: 'shared-expertise',
        title: 'Prices and learning',
        paragraphs: [
          html`When a novice can pay for an informative placement through a wage concession or a separate payment, the learning opportunity helps finance the service received by the household. Removing that opportunity also removes its contribution to the fee, so the private calculation already includes some of the future value of what the novice would have learned.`,
          html`For the household choosing what to hand over, a file’s remaining work and learning value enter the same fee. We now examine <a href="/work/">what the prepared file teaches</a> by following the records and feedback that reach the junior preparer after the household has finished its work.`
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
        note: { title: 'Task allocation', text: html`${cite('acemogluRestrepo2019')} follows labor demand through changing task assignments, which motivates tracing preparation across the household and office boundary.` },
        paragraphs: [
          html`When a household brings its records to a tax office, the preparer may receive an unsorted collection of statements or a file organized around a question that the household has already investigated with AI. Comparing those submissions for the same underlying matter allows us to follow the work moved across the office boundary, including the time saved when a calculation arrives with supporting records that the preparer can use.`,
          html`For the household deciding whether to purchase help, preparation changes the cost of the remaining service while discovery can change the reason for buying it. Through the task-allocation perspective in ${cite('acemogluRestrepo2019')}, we follow the work assigned to people and machines across the household and office boundary as customers finish some operations and bring different remaining questions to professionals.`,
          html`Better information also directs professional attention toward matters where resolving an issue has greater expected value, with purchased work following the household’s decision after that information arrives. We count customer time and inference resources alongside the office’s basic and expert hours, following <a href="https://doi.org/10.2307/2228949">Becker’s allocation-of-time analysis</a>, so the economic comparison includes the preparation performed before a fee is paid.`,
          html`For a household close to purchasing help, a completed calculation can lower the remaining bill enough to bring the case into the office, even as each purchased case requires fewer hours. When another household completes the entire matter at home, its professional demand disappears, so adding the arriving files requires following both participation and the amount of work contained in each purchase.`
        ]
      },
      {
        id: 'foundation',
        title: 'Understanding explanations',
        widget: 'learning',
        note: { title: 'Unaided learning', text: html`${cite('bastani2025')} compares practice assistance with later unaided mathematics performance, showing why the design of help matters for retained ability.` },
        paragraphs: [
          html`For a junior preparer reviewing a calculation, understanding the explanation can require knowing how the transaction fits its supporting records. Working from those documents to an answer can teach something the answer alone leaves unresolved. We represent the needed foundation by a hidden sign \(B\) and the principle used in a later judgment by a hidden sign \(T\). One observation reveals \(B\) imperfectly, while a relational explanation reveals their product \(BT\) imperfectly.`,
          html`When the foundation remains unknown, either target sign fits the observed product because changing both hidden signs preserves the explanation. After processing both observations, the learner can multiply them to cancel the foundation, leaving information about the target through the remaining noise, which explains why a stronger explanation has more educational value when its recipient understands the records on which it depends (<a href="/work/#figure-2">fig. 2</a>).`,
          html`Within this calculation, foundation reliability \(r_B\) and explanation reliability \(r_A\) determine later unaided prediction error through \(1-r_B^2r_A^2\), while receipt probability \(p\) determines how often the learner processes the pair. As either reliability improves, a received pair becomes more informative, and increasing access passes that gain to more learners, with prior error normalized to one in the figure.`,
          html`At zero foundational reliability, either possible foundation remains equally plausible, so increasing explanation reliability alone leaves the learner’s target uncertainty unchanged. Once the foundation carries information, improving the explanation has a positive return, and a person who already knows the foundation can use the explanation immediately, giving the same material different educational value according to the knowledge brought to it.`,
          html`Within a high-school mathematics experiment, ${cite('bastani2025')} found that ordinary AI assistance improved practice performance while subsequent unaided performance fell, and a tutor designed to safeguard learning largely mitigated that loss. We follow retained information through the case for the same measurement reason, while instruction that reveals \(T\) directly supplies another route to the principle.`
        ]
      },
      {
        id: 'diagnostic',
        title: 'Diagnostic cases',
        note: { title: 'Learning with assistance', text: html`${cite('brynjolfsson2025')} finds experience-dependent gains and evidence of worker learning in customer support, connecting useful assistance to the recipient’s prior knowledge.` },
        paragraphs: [
          html`Across the returns reaching an office, a diagnostic case reveals a distinction that changes how a junior worker handles a later matter, while a familiar calculation may add little understanding. In customer support, ${cite('brynjolfsson2025')} finds larger assistance gains among less experienced workers together with evidence of learning, giving an empirical reason to track received guidance and prior experience when studying what work teaches.`,
          html`To follow that learning into professional entry, we focus on a qualification margin where a fully revealing occasion allows an eligible novice to pass an unaided assessment. Aggregating retained diagnostic occasions gives a transition flow \(M\), measured in newly acquired qualifications per unit of time, while the qualified population share \(E\) counts people who can perform the assessed judgment independently.`,
          html`Allocation matters because a revealing occasion creates a transition only when it reaches someone who still needs the qualification, and the benchmark assigns such occasions to eligible novices. Under random contact across the entire occupation, the eligible share is \(1-E\), so a contact rate \(m(c)\) produces \(M=(1-E)m(c)\), with repeated exposure yielding less additional entry as more people become qualified.`,
          html`Because the object counted is an acquired ability, sending the same lesson to an already qualified person leaves the expert headcount unchanged, while sending it to an eligible novice can add someone able to perform the assessed judgment. Obsolescence can later return that person to the novice group, keeping receipt, learning, and continued possession of qualification connected through the population account.`,
          html`For measurement, the path from a customer file to \(M\) runs through case arrivals, diagnostic content, actual recipient exposure, and subsequent unaided assessment, allowing a study to identify which part changed. <a href="/assets/paper.pdf#page=4">Pages 4–5 of the paper</a> develop these definitions, and <a href="/assets/paper.pdf#page=15">Appendix A</a> gives the signal calculation behind the figure.`
        ]
      },
      {
        id: 'learning-price',
        title: 'Paying for practice',
        paragraphs: [
          html`Once the junior preparer can carry acquired qualification to another employer, an informative placement has a private value tied to future professional earnings. Writing the value of qualification as \(\Delta\), a case with transition probability \(m\) supports a learning payment \(\Delta m\), which the novice can finance through a separate payment or a wage concession within the service arrangement.`,
          html`Competition passes this contribution into the fee charged to the household, allowing the office to cover its basic and expert labor bills while charging less for a case that teaches someone. When preparation removes the diagnostic occasion, it removes that learning discount along with some current work, so the household’s saving depends on both the labor avoided and the private value of the lost experience.`,
          html`For two ways of handling the same matter, retained diagnostic material can consequently support a lower customer payment even when its processing uses additional time. We weigh that time against the novice’s expected qualification gain, with the credit following the person who receives and processes the information and the preparation resources remaining part of the service’s total cost.`,
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
        note: { title: 'Portable skills', text: html`${cite('becker1962')} assigns returns to general skills to their owner in competitive labor markets, grounding the private financing of qualification.` },
        paragraphs: [
          html`For a junior preparer deciding whether to pay for instruction between filing seasons, acquired judgment has value through the future work it permits, including work at another office. Following the competitive general-training logic of ${cite('becker1962')}, qualification belongs to its holder, whose value difference \(\Delta\) connects today’s financing to the future earnings available as an expert.`,
          html`As the novice intensifies study, the resources used in instruction rise according to \(\kappa x^2/2\), where \(x\) is the rate of acquiring qualification and \(\kappa\) governs teaching cost. Balancing marginal expense against the expected value of qualification gives \(x=\Delta/\kappa\), while obsolescence at rate \(\delta\) returns some qualified people to novice status and creates a continuing need for entry.`,
          html`At a given career value, cheaper instruction increases the study intensity worth purchasing, because each additional unit of effort reaches the same expected qualification gain at a lower marginal resource cost. Once the resulting entrants affect the professional wage, the value itself also adjusts, so the immediate response to teaching costs becomes part of a market process operating through later earnings.`,
          html`Through an informative customer file, the novice gains another path into qualification. Under complete pricing, the placement’s seller receives its private capital gain as payment. Practice still changes the number of qualified people after that payment is accounted for. Future wage premia determine the value guiding purchased study, as the worker equations on <a href="/assets/paper.pdf#page=16">pages 16–18</a> show.`
        ]
      },
      {
        id: 'replacement',
        title: 'Replacing practice',
        paragraphs: [
          html`To follow the effect of lost experience, we keep the profession’s expert-demand schedule fixed while the diagnostic material retained in its purchased cases falls. At the old expert population, fewer practice transitions leave entry below the flow needed to replace obsolescence, so the stationary population moves downward until purchased instruction and remaining diagnostic entry once again balance qualification loss.`,
          html`As experts become scarcer, a decreasing inverse demand schedule raises their hourly wage, which raises the qualification value and each novice’s study intensity. At the same time, the smaller expert share leaves more novices able to undertake study, so aggregate formal transitions increase through both the number of learners and, where wages respond strictly, their individual investment (<a href="/careers/#figure-3">fig. 3</a>).`,
          html`Replacing every lost practice transition would preserve the old population, wage, and number of novices, leaving the private study choice unchanged at the very point where greater formal entry was needed. As the population adjusts, the flow identity records how replacement occurs, with lost practice equal to additional formal transitions plus the reduction in obsolescence replacement caused by the smaller expert population.`,
          html`For any finite practice reduction inside the feasible stationary interval, formal transitions rise by a strictly positive amount smaller than the lost practice, and total teaching resources also rise. <a href="/assets/paper.pdf#page=19">Proposition C.1</a> obtains that finite comparison from monotonicity, including continuous demand schedules with corners, while the differentiable formula in the mathematical chapter measures the fraction replaced locally.`,
          html`When the wage is flat over the relevant interval, individual study remains constant while the larger novice population still generates more formal transitions. We can thus observe rising aggregate training alongside a smaller expert population through a change in who remains eligible to learn, with the scarcity response adding a further incentive wherever the wage rises as expertise becomes less abundant.`
        ]
      },
      {
        id: 'earnings',
        title: 'Earnings and fees',
        paragraphs: [
          html`For the next household seeking advice, the price of remaining professional work reflects the time its file requires and the wage of the people able to supply it, together with any learning payment that helps finance the case. In the competitive fee \(bj+we-\Delta m\), customer preparation can reduce basic hours \(j\) or expert hours \(e\), while the career response changes \(w\) and the value \(\Delta\) of the learning opportunity.`,
          html`Holding a returning household’s case requirements fixed isolates the price adjustment, since a higher expert wage raises the labor bill while a higher qualification value increases the contribution supplied by an informative placement. For a case with zero diagnostic contribution, the wage change enters through its expert hours alone, while a diagnostic case carries both changes into the fee the household pays.`,
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
        note: { title: 'Career horizon', text: html`${cite('benPorath1970')} frames human-capital investment across the working life, connecting present instruction to the period over which its return can be earned.` },
        paragraphs: [
          html`For a novice choosing instruction this year, the current filing season supplies only part of the return, because qualification opens work across a future whose customer tools may keep improving. Building on the life-cycle investment perspective in ${cite('benPorath1970')}, we value that future work through \(\Delta\), allowing study to respond before arriving households change their current preparation.`,
          html`With the same terminal career payoff, the difference in present qualification values is a positively weighted integral of future wage differences, so the entire anticipated earnings path contributes to current investment. Population adjusts through the people who actually learn and through obsolescence, giving inherited expertise and forward-looking career value different roles during the transition.`,
          html`For workers starting from the same inherited expert share, different future opportunities can imply different current qualification values, so the human-research baseline, faster practice loss, and announced machine improvement begin at a common population coordinate with separately selected values (<a href="/careers/#figure-4">fig. 4</a>). Following their paths through the population–value plane reveals how today’s investment carries those earnings expectations into the expertise available later.`,
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
        title: 'Shared expertise',
        note: { title: 'Specialized knowledge', text: html`${cite('garicano2000')} connects problems to specialized knowledge, while ${cite('jones2009')} relates deeper knowledge to educational burden and teamwork.` },
        paragraphs: [
          html`Following the household’s tax return has shown how customer choices change the work arriving at a profession, whose specialized knowledge can be organized around the problems people know how to solve, as in ${cite('garicano2000')}. We now extend the service economy to a field where the same assessed expertise also supplies research, allowing qualified people to divide their time between customers and the production of new knowledge.`,
          html`Acquiring that expertise uses resources, with ${cite('jones2009')} connecting accumulated knowledge to a greater educational burden, narrower specialization, and increased teamwork in innovation. Within our extension, a portable qualification supports both services and research, so the shared wage carries customer demand into research costs while the career mechanism determines how many qualified people become available.`,
          html`To give research demand an explicit source, we assign a fund a fixed expenditure flow to buy completed, validated research packets. Each packet’s cost includes generation and checking. In the human method, both stages use expert time and computation. In a feasible autonomous method, computation supplies both stages. Procurement can then compare two complete ways of producing a result.`,
          html`Because each packet includes every stage required for completion, validation can determine the eventual productivity of the method even as generation becomes faster. We first follow the hours and computation needed to finish that work, then allow their market prices to determine which method the fund purchases and how its decision affects the earnings available to qualified people.`,
          html`When research uses the current frontier, each completed advance can enter the generation and validation of the research that follows, forming a recursive connection between today’s AI and the next frontier. Human-led research carries this connection through people using improved tools, while complete autonomous research carries it through machine generation and validation, with both routes supplying capability that also changes the work customers bring to professionals.`
        ]
      },
      {
        id: 'regimes',
        title: 'Research methods',
        widget: 'regimes',
        note: { title: 'Research wages', text: html`${cite('korinekSuh2024')} follows wages through automation and capital accumulation. Our <a href="/assets/paper.pdf#page=27">research allocation result</a> derives wages from a fixed procurement budget.` },
        paragraphs: [
          html`At the wage that clears customer services alone, every expert works on customer files, while a fund purchasing human research adds another claim on those hours and raises the clearing wage. Comparing these two wages with the wage at which human and machine packets have equal costs determines whether research employs people, computation, or a mixture of both (<a href="/research/#figure-5">fig. 5</a>).`,
          html`When human research remains cheaper even at the higher clearing wage, the fund spends its budget on human packets and employs the hours that its wage-plus-compute expense permits. When the autonomous route is cheaper at the service-only wage, the fund purchases machine packets and the professional wage clears customer work alone.`,
          html`Between those cases, equal packet costs fix the wage while labor clearing determines how much human research fits beside customer services, and the remaining budget purchases autonomous packets. Extra expertise then increases the human share at that fixed wage, with each dollar still purchasing the same quantity of completed research, giving a local regime where frontier output is independent of expert headcount.`,
          html`At equal costs, the fund can buy the same number of packets through different expenditure shares, while the labor market determines which share fits the available people. Once customer services use their required hours at the parity wage, the remaining expertise supplies human research, and the unspent part of the budget supplies computation, so the mixture follows from the two markets clearing together.`,
          html`Holding the frontier fixed isolates the allocation in <a href="/assets/paper.pdf#page=27">Proposition G.1</a>, whose wage follows the expert population and the fund’s budget. Across a wider task economy, ${cite('korinekSuh2024')} shows how wage paths depend on the pace of automation relative to capital accumulation, giving a further reason to follow the economic adjustment accompanying a change in machine capability.`,
          html`Along our career path, inherited expertise changes as people learn and research advances, so <a href="/dynamics/">dynamic equilibrium</a> carries the clearing conditions from one date to the next. Method costs, available people, and expected earnings then respond within the same evolving allocation.`
        ]
      },
      {
        id: 'released-hours',
        title: 'Hours and entrants',
        paragraphs: [
          html`At a human research allocation, customer preparation that saves expert time releases hours from professional work and reduces the wage needed to clear the shared market, allowing the fixed research fund to purchase more labor. Because services also expand when the wage falls, research receives a fraction of the released time, with that fraction determined by the responsiveness of both service demand and research demand.`,
          html`When service demand responds strongly to a lower wage, additional client work absorbs more of the hours initially released by preparation, leaving a smaller fraction for research. When that response is weaker, the fixed research budget purchases more of the released time, which explains why the same direct saving of professional hours can produce different research gains in different customer markets.`,
          html`We can follow that allocation in hours, where services and human research add to available expertise, and then in completed packets, where each method converts its inputs through its own requirement (<a href="/research/#figure-6">fig. 6</a>). At a fixed frontier, human packets equal research hours divided by the human requirement, while machine packets use computation, so a changing method share alters the relation between research employment and total completed output.`,
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
          html`Because the frontier and wage paths agree before adoption within that comparison, the reduction in initial training comes through expected future returns, while current research allocation remains governed by today’s costs. <a href="/assets/paper.pdf#page=34">Proposition H.4</a> gives the argument, and the <a href="/welfare/">welfare chapter</a> follows the further question of how the value received by an individual worker relates to the value of the research that worker supports.`,
          html`During the pre-adoption interval, lower study can already change the people entering qualification even while the mixed wage remains fixed by current packet costs. With both methods active, their shares accommodate the changed allocation of expertise at that common wage, allowing the career response to begin before the improved machine method changes the frontier’s current production rate.`
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
        note: { title: 'Resource value', text: html`${cite('becker1965')} includes household time in production costs, while <a href="/assets/paper.pdf#page=22">the service welfare result</a> values learning and instruction along the same allocation.` },
        paragraphs: [
          html`For the household preparing its tax file at home, an hour saved inside the office belongs in the same account as the time and computation used to accomplish that work, following the household-production reasoning in ${cite('becker1965')}. If preparation removes a learning occasion, its future consequences also enter through the expertise available to later households.`,
          html`Adding the household, office, and worker accounts cancels fees and wages as transfers and retains the benefits of completed services together with the resources used in preparation, instruction, and professional work. Within the competitive service-and-training benchmark, the novice pays the full private value of diagnostic learning, and that value also supports the social allocation of work and study, giving \(\lambda=\Delta\) between social and private qualification values.`,
          html`After those payments cancel, a lower bill contributes through the resources saved or the additional service obtained, while its transfer of income between the household and the office has already been counted on both sides. Carrying future qualification into that account allows a current saving to be evaluated together with the later professional work supported by the experience that remains.`,
          html`Convex training cost and affine allocation constraints give a concave resource problem, so a feasible competitive path satisfying the stated transversality condition maximizes its objective. When an optional improvement in household technology preserves earlier choices, welfare weakly rises because the earlier allocation remains available, while expertise can fall when the resource savings cover the full value of displaced learning, as <a href="/assets/paper.pdf#page=22">Appendix D</a> proves.`
        ]
      },
      {
        id: 'payment-limit',
        title: 'Learning payments',
        note: { title: 'Training institutions', text: html`${cite('acemogluPischke1999')} shows how wage compression can support employer-financed general training, locating financing incentives in the wage structure.` },
        paragraphs: [
          html`For a junior worker acquiring experience through a client file, the payment arrangement determines how much learning value reaches the household’s fee. Institutions also shape who finances general training in ${cite('acemogluPischke1999')}, where wage compression can give employers an incentive to pay. Our contract comparison combines a minimum cash payment with a prohibition on separately charging for the placement. For a case using one basic hour, the permitted learning credit is capped by the outside basic wage less that cash payment.`,
          html`When this cap binds, a household can prefer preparation because the resources it saves exceed the permitted learning discount, while the qualification displaced is worth more than that saving in the benchmark social account. In symbols, the interval is \(b-s<b-r_C<\Delta m\), where \(s\) is minimum cash compensation, \(r_C\) is the cost of preparation, and \(m\) is the lost transition probability.`,
          html`Permitting a larger learning payment would lower the fee attached to the informative mode and increase what the household gives up by replacing it with preparation. In this comparison, the novice’s financing carries the value of future expertise into the current choice, so limiting that payment changes the relative attractiveness of two ways to handle the same matter.`,
          html`Within the case analyzed in <a href="/assets/paper.pdf#page=24">Appendix E</a>, \(b=1\), \(s=1/2\), \(r_C=3/8\), and \(\Delta m=3/4\) give a positive private saving of \(1/8\) and a negative resource gain of \(-1/8\). By following the permitted credit through the fee, we can locate the difference in a payment that values the lost experience below its contribution to future services.`,
          html`Once the restriction covers a positive share of transactions, the resulting economy has its own private qualification value and social continuation value, whose difference must be evaluated along that altered allocation. Through this explicit payment rule, the welfare effect remains attached to the missing learning credit and the resources saved by preparation.`
        ]
      },
      {
        id: 'public-research',
        title: 'Public research',
        note: { title: 'Nonrival ideas', text: html`${cite('romer1990')} treats ideas as nonrival and partly excludable, connecting research incentives to value beyond one producer’s use.` },
        paragraphs: [
          html`Once qualified people also produce research, an additional hour can support improvements used throughout the future economy, drawing on the nonrival character of ideas formalized by ${cite('romer1990')}. We write the gross social return to that hour as \(\Pi\) and its wage-plus-compute expense as \(h\), so \(\Pi-h\) measures the research return beyond the resources used to produce it.`,
          html`Along a regular selected continuation, more inherited expertise can reduce the wage paid by the research fund and increase the research hours purchased with its budget, so the social qualification value follows both procurement and innovation. With common terminal private and social qualification values, positive future research returns and a positive labor response give \(\lambda>\Delta\), as the positive-weight representation on <a href="/assets/paper.pdf#page=40">pages 40–42</a> shows.`,
          html`For an additional qualified person, the private account follows the earnings available to that person, while the social account also follows the extra frontier progress their presence supports through the research market. Comparing \(\Pi\) with \(h\) values that progress against the inputs required, giving the qualification gap an economic source in future research opportunities whose benefits extend beyond the worker’s compensation.`,
          html`Under that value ordering, a small subsidy to formal qualification has a positive marginal welfare effect because the added transition contributes more to continuation welfare than its marginal teaching expense. Within an interior mixed or autonomous research regime, the local research contribution to this value difference is zero, while future human-research intervals can still enter today’s continuation value.`
        ]
      },
      {
        id: 'preparation-surface',
        title: 'One prepared case',
        widget: 'welfare',
        note: { title: 'Local comparison', text: html`Within the <a href="/assets/paper.pdf#page=42">preparation theorem</a>, lost qualification and released research time are valued through the continuation following a short intervention.` },
        equation: tex`P=bj-r_C+we-\Delta m,\qquad \mathcal W=P-(\lambda-\Delta)m+(\Pi-h)\chi_R e`,
        paragraphs: [
          html`For a short unannounced preparation change at a strict human research corner, the private gain \(P\) includes saved basic hours \(j\), saved expert hours \(e\), preparation resources \(r_C\), and the lost privately priced learning opportunity \(\Delta m\). Only a fraction \(\chi_R\) of released expert time enters research, because the wage adjustment also supports additional customer services.`,
          html`Its marginal social value \(\mathcal W\) follows from the private gain after charging the remaining social value of lost qualification and crediting the additional net return to research. Greater social value of expertise raises the cost of removing a diagnostic occasion, while a greater research return raises the benefit of releasing an expert hour, and their balance determines the welfare boundary for the prepared case (<a href="/welfare/#figure-7">fig. 7</a>).`,
          html`For a fixed prepared case and private gain, a larger qualification-value gap increases the social cost of its lost learning, while a larger research premium increases the value of its released expert time. As those continuation values change, the zero-value boundary moves around the same case, allowing its welfare sign to change while its saved hours and diagnostic content remain fixed.`,
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
        equation: tex`F_d=bj_d+we_d-\Delta m_d,\qquad d^*(z)\in\underset{d\in\mathcal D(z,c)}{\operatorname{arg\,max}}\{U_d-bj_d-we_d+\Delta m_d\}`,
        paragraphs: [
          html`For a household assembling its tax return, capability \(c\) changes the ways it can handle a recurring matter \(z\), whose menu \(\mathcal D(z,c)\) includes leaving it unresolved, completing it at home, and purchasing help with different amounts of preparation. Across matters measured by \(\mu_Z\), each choice has expected benefit \(U_d\) after customer time and other nonlabor resources, basic and expert hours \(j_d,e_d\), and expected qualification transition \(m_d\) assigned to an eligible novice.`,
          html`With basic time available at outside wage \(b\), expert time priced at \(w\), and complete practice payments valued at \(\Delta\), competitive fees follow the expression above. Adding the novice’s payment \(\Delta m_d\) to the customer fee exactly covers the provider’s labor bill, giving the learning credit a financing source before it enters the customer’s optimization.`,
          html`Between two modes for the same matter, a higher expert wage gives greater weight to the hours each uses, while a higher qualification value gives greater weight to the learning each supplies. Even with customer capability fixed, these prices can change which file the household submits, connecting the service-demand and practice schedules to the evolving professional market.`,
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
          html`Over a short interval, purchased study gives each novice a transition probability proportional to \(x\), whose expected gain is the probability times the value of qualification. Multiplying that individual intensity by the novice share gives formal entry, while multiplying obsolescence by the expert share gives qualification loss, so both sides of accumulation count population transitions in the same units.`,
          html`We measure \(E\) as a qualified population share, \(M\) as an aggregate transition flow, \(x\) as individual study intensity, and \(\Delta\) as discounted career value, so the entry equation counts the people who actually acquire the assessed ability. Each qualified person supplies one expert clock hour per unit of time, connecting the resulting population to available service hours and, in the shared-expertise extension, to research labor.`
        ]
      },
      {
        id: 'stationary-entry',
        title: 'Long-run entry',
        equation: tex`R=\rho+\delta,\qquad x(E)=\sqrt{R^2+\frac{2[w(E)-b]}{\kappa}}-R,\qquad M+(1-E)x(E)=\delta E`,
        paragraphs: [
          html`When the material retained for junior learning changes while the remaining expert work in purchased files stays fixed, we obtain the diagnostic-portfolio comparison by keeping the selected modes within their strict purchase margins. Its inverse wage \(w(E)>b\) is independent of \(M\) and \(\Delta\), and a continuous nonincreasing wage schedule gives weakly decreasing individual study and strictly decreasing aggregate formal transitions \(T(E)=(1-E)x(E)\), since the novice population also contracts as \(E\) rises.`,
          html`Positive qualification drift at the lower feasible endpoint and negative drift at the upper endpoint give a unique stationary population for each practice flow in the comparison interval. At two such equilibria, subtracting their accumulation identities gives \(T^1-T^0=(M^0-M^1)-\delta(E^0-E^1)\), so a practice loss lowers expertise and induces strictly positive, incomplete formal replacement.`,
          html`For a differentiable wage, the denominator \(\Lambda=\delta+x-(1-E)w_E/[\kappa(R+x)]\) gives \(E_M=1/\Lambda\) and replacement fraction \(-T_M=1-\delta/\Lambda\). Because \(\Lambda>\delta\), this fraction lies strictly between zero and one, with its magnitude determined jointly by study costs, obsolescence, and the equilibrium wage response.`,
          html`Increasing expertise affects this balance through more people losing qualification, fewer novices able to acquire it, and a weaker study incentive wherever the wage falls. Together those responses determine how strongly net entry declines with the population, which is why their common denominator converts a change in practice into a change in stationary expertise.`
        ]
      },
      {
        id: 'service-validation',
        title: 'Fees and validation',
        note: { title: 'Expert services', text: html`${cite('dulleckKerschbamer2006')} studies diagnosis and treatment when customers have difficulty assessing expert services, motivating the joint account of fees and reliability.` },
        equation: tex`\mathcal T(w,c)=\min_{v\ge0}\{w[e(c)+v]+k(c)+r_\gamma(\pi(c)e^{-v})\},\qquad P=\frac{\varepsilon}{\varepsilon-1}\mathcal T`,
        paragraphs: [
          html`For a household deciding whether to purchase advice, both the fee and the risk of an unresolved mistake matter, as the credence-goods analysis of ${cite('dulleckKerschbamer2006')} explains. Within our extension, fixed franchises face isoelastic demand with \(\varepsilon>1\). Generalized price \(P\) combines the fee with the certainty-equivalent loss from error. Each case uses generation time \(e(c)\), checking time \(v\), and resources \(k(c)\). Its error probability \(\pi(c)e^{-v}\) declines as experts validate the work.`,
          html`With constant absolute risk aversion \(\gamma\) and error loss \(L\), the certainty-equivalent cost is \(r_\gamma(z)=\gamma^{-1}\log[1+z(e^{\gamma L}-1)]\), whose risk-neutral limit is \(Lz\). Optimized generalized unit cost \(\mathcal T\) enters the isoelastic markup shown above, and its wage derivative counts the expert hours needed per completed case, giving aggregate demand \(D_S=\mathcal T_w N(c)P^{-\varepsilon}\).`,
          html`For risk-neutral customers, optimal checking is \(v^*=[\log(L\pi(c)/w)]_+\), so more reliable files reduce validation at a fixed wage while a larger possible loss raises its return. <a href="/assets/paper.pdf#page=25">Lemma F.1</a> proves that the resulting expert demand decreases strictly with the wage, including the points at which validation enters or leaves the selected service.`,
          html`At an interior checking choice, the marginal reduction in expected error loss equals the wage paid for the additional expert time. More reliable household material reduces that marginal benefit at the old checking intensity, while greater potential loss raises it, carrying the content and consequences of a submitted file into the amount of professional review purchased.`,
        ]
      },
      {
        id: 'research-production',
        title: 'Research production',
        note: { title: 'Research difficulty', text: html`${cite('bloom2020')} documents rising research effort alongside declining research productivity across several settings, motivating explicit difficulty in producing the next advance.` },
        equation: tex`\begin{aligned}a_H(A)&=A^{-\alpha}+v_RA^{-\nu},& k_H&=a_H(A)(w+q\xi),\\a_M(A)&=A^{-\mu}+m_RA^{-\zeta},& k_M&=qa_M(A),\\E&=D_S+L_R,& (w+q\xi)L_R+qQ_M&=B_R,\\\dot A&=A^{-\phi}\frac{B_R}{\min_{j\in\mathcal F(A)}k_j},& c(A)&=\kappa_c\log(A/A_0).\end{aligned}`,
        paragraphs: [
          html`Extending the service economy to a field with expertise shared by customer work and research introduces completed research packets alongside client cases. Positive coefficients \(v_R\) and \(m_R\) preserve each method’s validation stage, while \(q\) prices computation and \(\xi\) measures its use per human research hour, so human packets require \(a_H\) expert hours and autonomous packets require \(a_M\) computation units.`,
          html`Expert clearing joins customer services to human research, whose fixed expenditure flow \(B_R\) purchases labor and computation. Across industries, products, and firms, ${cite('bloom2020')} documents rising research effort alongside declining research productivity, motivating our explicit difficulty term \(A^{-\phi}\), which reduces the frontier increment supplied by a completed packet as \(A\) grows.`,
          html`For the selected service portfolio, \(C(c)=C_0e^{\gamma c}\) and \(D_S=C(c)w^{-\varepsilon}\) translate discovery and preparation into purchased expert hours, while \(M(c)=M_0e^{-\beta_c c}\) follows diagnostic transitions as customer capability grows. Multiplying \(a_M\) by a positive factor changes the computation needed for both stages of the machine method, giving customer use and research production separate ways to alter the shared economy.`,
          html`Market clearing determines today’s wage from the inherited population and the feasible research methods, while the <a href="/dynamics/">career equations</a> connect that wage to the earnings expected over the remaining horizon. Following both conditions together gives a path in which customer preparation changes current work and the value of becoming able to perform future work.`,
          html`Procurement compares packet costs at the wage supporting the allocation, determining the research method and its labor cost together (<a href="/research/#figure-5">fig. 5</a>). Changing expertise or customer demand moves the clearing roots, which can carry the economy across a method boundary while research requirements remain fixed.`
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
        title: 'Initial conditions',
        note: { title: 'Boundary conditions', text: html`Within the <a href="/assets/paper.pdf#page=31">finite-horizon equilibrium result</a>, inherited expertise and frontier productivity are joined to the terminal value of qualification.` },
        equation: tex`E(0)=E_0,\qquad A(0)=A_0,\qquad \Delta(T)=\overline\Delta,\qquad \dot X=H(X,\Delta),\quad \dot\Delta=G(X,\Delta),\quad X=(E,A)`,
        paragraphs: [
          html`At the beginning of a filing season, the people available to advise households carry the learning acquired during earlier seasons, while a novice’s decision to study depends on the professional work expected ahead. In the shared research economy, inherited expertise \(E\) and frontier productivity \(A\) supply the initial states, while a terminal career payoff \(\overline\Delta\) records the value of qualification in the continuation occupation.`,
          html`Given a trial qualification-value path, we integrate population and frontier forward while clearing the labor market at each date. Using the resulting wages, we then integrate the value equation backward from its terminal payoff. Repeating these updates seeks agreement between physical evolution and anticipated earnings, following the construction in the paper’s finite-horizon existence proof.`,
          html`Choosing a current qualification value changes study immediately and thus changes the population that later wages must clear, while those wages determine whether the original value was justified. Specifying the terminal payoff closes this relationship through what a qualification is worth after the modeled interval, allowing the initial value to adjust until the whole earnings path supports it.`,
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
        title: 'Research feedback',
        widget: 'feedback-parts',
        note: { title: 'Conditional response', text: html`At a fixed frontier, the <a href="/assets/paper.pdf#page=28">shared-wage derivative</a> follows expert supply and service demand through research costs.` },
        equation: tex`\mathcal J=-D_{S,w}+\frac{B_R}{h^2},\qquad h=w+q\xi,\qquad d\log F=\frac{dE-dD_S|_w}{h\mathcal J}`,
        paragraphs: [
          html`Through the shared market, more expertise lowers the human research wage, while greater customer demand raises it, and both price effects change the packets purchased by a fixed fund. At a common frontier in a strict human regime, <a href="/assets/paper.pdf#page=28">Proposition G.2</a> differentiates clearing to give the displayed relationship, where \(dD_S|_w\) includes customer and qualification-value effects evaluated at the original wage.`,
          html`Customer preparation changes remaining work, received practice enters career accumulation, and the shared wage carries expertise into research costs, giving each part of the mechanism its own conditional relationship (<a href="/dynamics/#figure-8">fig. 8</a>). For positive quantities \(u\) and \(v\), the elasticity \((u/v)\,\partial v/\partial u\) expresses a local percentage response, while a derivative of an accumulation or value equation describes its corresponding flow.`,
          html`When a customer or research change persists across time, the career equations and market clearing carry it into future practice, study, and available expertise, which in turn enter the frontier path. Joining those relationships closes the connection from customer work to the technology available to future customers (<a href="/economy/#figure-12">fig. 12</a>), with complete paths selected by inherited states and the terminal career payoff.`,
          html`Recursive improvement enters research through complete-method productivity, while the expert population enters through the labor required by the selected method. At a fixed frontier, human research has \(F_E/F=1/(h\mathcal J)>0\), so the expertise formed through customer work changes the research purchased by the fund. Within an interior mixed or autonomous allocation, \(F_E=0\), while the recursion continues through machine costs as the frontier advances.`,
          html`When a machine route retains a human grounding requirement, expertise again increases research output at the grounded corner through the price of that required labor. Equal-cost mixing can still absorb population changes through method shares, so the customer-to-expertise channel and the frontier-to-research channel combine according to the complete allocation rule.`
        ]
      },
      {
        id: 'value-kernel',
        title: 'Career expectations',
        equation: tex`\begin{aligned}\Delta_1(t)-\Delta_0(t)&=\mathcal K(t,T)[\Delta_1(T)-\Delta_0(T)]\\&\quad+\int_t^T\mathcal K(t,s)[w_1(s)-w_0(s)]\,ds,\\\mathcal K(t,s)&=\exp\!\left[-\int_t^s\left(\rho+\delta+\frac{\Delta_1(u)+\Delta_0(u)}{2\kappa}\right)du\right].\end{aligned}`,
        paragraphs: [
          html`For a novice deciding whether this year’s tuition is justified by later professional work, comparing two future wage paths requires carrying their earnings differences back to the date of study. Subtracting the private value equations gives a scalar linear equation because the difference of squared values factors into their sum times their difference, and backward integration produces the positive kernel above.`,
          html`With common terminal values, every future wage difference enters present qualification value with positive weight, so a lower future wage path lowers today’s study incentive. For bounded global value paths, the terminal term vanishes as the horizon grows, and the same comparison becomes an integral over the entire future, as proved in <a href="/assets/paper.pdf#page=29">Proposition G.3</a>.`,
          html`Along a selected baseline, the local weight on a small wage increment during a future interval decays with \(\rho+\delta+x(s)\), combining ordinary discounting, obsolescence, and the novice’s own future opportunities to qualify (<a href="/dynamics/#figure-10">fig. 10</a>). Faster future study narrows the extra advantage of already possessing qualification, while a wage change occurring after the valuation date still contributes positively whenever its interval lies inside the remaining career.`,
          html`With an imposed wage increment, these weights carry a supplied earnings change through the private value equation, giving its conditional contribution to current study. When customer technology or research methods change, their wage path instead comes from the shared markets, so integrating the same positive weights follows the earnings consequences of the complete adjustment.`,
          html`For an announced machine improvement, the wage difference comes from the endogenous research allocation and its frontier path, with the mixed-regime theorem giving a signed joint example under the relative-productivity condition. Through the kernel, future wage changes that differ in sign contribute according to their place along the full discounted path when determining current investment.`
        ]
      },
      {
        id: 'path-selection',
        title: 'Selecting a path',
        paragraphs: [
          html`At a fixed frontier, the stationary career system has one stable direction and one unstable direction under the strict diagnostic-portfolio conditions, so a nearby inherited expert population selects one locally convergent initial qualification value. Numerical selection can use forward and backward relaxation or vary the initial value until the terminal payoff is satisfied, with feasibility, clearing, and boundary residuals evaluated on the resulting path.`,
          html`For a longer finite horizon, the shooting residual \(S(\Delta_0)=\Delta(T)-\Psi(E(T),A(T))\) gives a local selection test, since a nonzero derivative \(S'(\Delta_0)\) allows the implicit-function theorem to identify one nearby initial value. Endogenous equal-cost boundaries preserve the wage level and use piecewise derivatives, while a discrete first-availability event also changes its date under perturbation.`,
          html`Beginning from common population and frontier states, a change in practice, service demand, or machine requirements can move current prices and values before its accumulated effects appear in expertise and productivity (<a href="/dynamics/#figure-9">fig. 9</a>). Comparing each path with the economy where both research methods are available follows that timing in proportional changes, while the qualification paths meet at their common terminal zero and proportional value differences are defined at earlier dates with positive baseline value.`,
          html`At each date on the resulting path, work reaches people whose expertise was accumulated earlier, while their investment reflects the earnings expected from later work. Research uses current AI to produce a new frontier that returns both to subsequent research and to customer preparation, so <a href="/growth/">frontier growth</a> follows this recursion through complete-method productivity, available expertise, and the time needed to use an advance.`
        ]
      }
    ]
  },
  growth: {
    title: 'AI growth',
    deck: '',
    part: 'Mathematics',
    sections: [
      {
        id: 'human-input',
        title: 'Expert supply',
        paragraphs: [
          html`Across successive filing seasons, the experience left in household submissions can diminish as customers complete more work, while novices retain the option of purchasing instruction when future professional earnings justify its cost. In the shared-expertise extension with persistent human research, the budget and labor market imply \(w+q\xi\ge B_R/E\), so a small qualified population supports a strong training incentive through the research fund’s demand for scarce expertise.`,
          html`Along a global feasible career path with nonnegative qualification values, that scarcity condition prevents expertise from remaining arbitrarily close to zero, because study below replacement would force the value equation downward too quickly to preserve a nonnegative career value. <a href="/assets/paper.pdf#page=45">Proposition J.1</a> gives an explicit positive population bound even with \(M=0\), and a bounded service-demand envelope then gives an upper wage bound.`,
          html`For settled customer environments, eventual human research labor weakly rises exactly when service hours released at the old wage cover the lost expert supply evaluated at the old training incentive. Through that comparison, customer preparation determines the coefficient of subsequent frontier growth, while the productivity of the complete research method determines its exponent.`,
          html`Evaluating both changes at the old wage gives a common price for comparing the work released and the expertise lost, before the new market adjusts. Their difference determines the direction of that adjustment, while eventual research labor translates it into the number of packets produced at each frontier, so customer preparation can change the speed along a growth path whose production exponent stays the same.`
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
        title: 'Recursive improvement',
        note: { title: 'Weak links', text: html`${cite('jonesTonetti2026')} studies complementary tasks with substitution elasticity below one. Our generation-and-validation exponent follows separately from the sum of required inputs.` },
        equation: tex`p_H=\min\{\alpha,\nu\},\qquad p_M=\min\{\mu,\zeta\},\qquad \dot A\asymp A^{p-\phi}`,
        paragraphs: [
          html`Writing \(r\) for capability used inside research separates the tools producing an advance from the frontier \(A\) that the advance extends. With updating research tools \(r=A\), the requirements \(a_H(A)\) and \(a_M(A)\) carry each new capability into subsequent generation and validation, while \(A^{-\phi}\) records the difficulty of extending the frontier and \(c(A)\) carries the same advance into customer use.`,
          html`To isolate this recursion, we define an updating case with \(r_t=A_t\) and a frozen-tool case with \(r_t=A_0\), starting from the same frontier and expert population. Each case requires its own market clearing and privately chosen investment while sharing the customer interface \(c(A)\), provider technology, and training primitives, so the comparison includes the career response to the research opportunities created by each tool path.`,
          html`For a common target frontier, the relevant comparison follows each economy to its own arrival date and accumulates the research labor, computation, and training resources used along the way. Household fees, professional earnings, and inherited expertise at those arrivals then connect the time and resources required to produce the same capability with the indirect effects carried through the customer relationship.`,
          html`Within the CES task economy of ${cite('jonesTonetti2026')}, substitution elasticity below one leaves output constrained by remaining tasks when a fixed subset becomes arbitrarily productive. Their dynamic extension also automates idea production, linking innovation to further automation while weak links slow its consequences, and our serial research methods follow each required stage through a sum of generation and validation inputs.`,
          html`Within that sum, the stage whose input requirement declines more slowly dominates the eventual requirement per completed packet. Factoring the smaller exponent from \(a_H\) or \(a_M\) leaves a positive bounded factor, giving the complete-method exponents above and a direct route from stage-level productivity to packet cost.`,
          html`Within a method, completion requires both stages, so the smaller productivity exponent governs the input requirement that remains costly longest. Across complete methods, the fund can choose the cheaper route, so the larger eventual exponent can govern the selected cost under bounded input prices, giving the minimum within each method and the maximum across available methods distinct economic roles.`,
          html`With updating tools \(r=A\) and the effective human input price bounded above and away from zero, persistent human research gives \(p=p_H\). With two continuously available methods, procurement selects the cheaper complete route and gives \(p=\max\{p_H,p_M\}\). Idea difficulty subtracts \(\phi\) from that productivity exponent. Under the stated continuation conditions, we obtain power growth for \(p<1+\phi\), exponential order at equality, and a finite production endpoint for \(p>1+\phi\). Within the power-growth region, research tools keep improving while the proportional growth rate tends to zero.`,
          html`For a grounded machine method, completing each packet additionally requires \(a_G=g_GA^{-\chi}\) expert hours, and under the paper’s bounded-overhead conditions with \(\chi\le p_M\), that human stage governs its complete-route exponent. When \(\chi\le1+\phi<p_M\), the grounding requirement gives a global frontier path in a comparison whose fully autonomous route has a finite endpoint, as developed in <a href="/assets/paper.pdf#page=49">Proposition J.7</a>.`
        ]
      },
      {
        id: 'growth-comparison',
        title: 'Growth rates',
        widget: 'growth',
        equation: tex`\dot A=kA^\beta,\qquad \ddot A=\beta k^2A^{2\beta-1},\qquad g_A=\dot A/A,\qquad \dot g_A=(\beta-1)g_A^2`,
        paragraphs: [
          html`For a fixed resource scale \(k\), the exponent \(\beta\) compares effective research productivity with idea difficulty. When \(0<\beta<1\), a larger frontier produces a larger absolute increment whose size still falls relative to the frontier already reached, so accelerating gains in levels coexist with declining proportional growth (<a href="/growth/#figure-11">fig. 11</a>).`,
          html`In human research, changes in the wage also enter proportional growth, with \(\dot g_A/g_A=(\epsilon_H-\phi-1)g_A-\dot w/(w+q\xi)\). When wages fall, the budget purchases more research, while rising scarcity earnings absorb some productivity gains, connecting the career path to the growth rate beyond the scalar exponent comparison.`,
          html`Holding the initial frontier and research resource scale fixed allows us to follow how the timing of new capability changes the research it supports. Immediate use, gradual absorption, and a minimum research duration pass the same improvement into subsequent work at different dates, which changes the connection between today’s discovery and tomorrow’s productive tools.`,
          html`At the critical productivity exponent, either positive timing requirement lowers the eventual exponential rate below the rate supplied by immediate use, because each new improvement takes time to contribute fully to the next. Increasing the absorption time or minimum duration lengthens that passage, connecting the implicit growth-rate equations to a concrete delay in the production of subsequent advances.`
        ]
      },
      {
        id: 'time',
        title: 'Research duration',
        equation: tex`\begin{aligned}\dot A&=kr^\eta A^{-\phi},& \dot r&=(A-r)/\ell,\\\dot A(t)&=kA(t-\tau)^\eta A(t)^{-\phi}.\end{aligned}`,
        paragraphs: [
          html`Under gradual absorption, effective research capability \(r\) approaches the current frontier with time scale \(\ell>0\), giving recent improvements a continuously increasing role in production. Below \(\eta=1+\phi\), the power asymptotic survives, while at equality the limiting exponential rate solves \(g(1+\ell g)^\eta=k\), and higher elasticities retain a finite production endpoint.`,
          html`Under a positive minimum duration \(\tau\), today’s research can use only capability available at least one cycle earlier, so each interval inherits bounded inputs from the completed interval before it. Applying the method of steps then gives a finite frontier at every finite date, while supercritical productivity still yields growth whose double logarithm rises asymptotically at rate \(\tau^{-1}\log[\eta/(1+\phi)]\).`,
          html`During each such interval, research uses a capability history already produced, and the improvements it creates enter a later cycle, letting us bound production one completed interval at a time. Gradual absorption instead begins incorporating a recent improvement continuously, so its lag preserves a different connection between current frontier gains and the capability contributing to current research.`,
          html`At the threshold, the fixed-duration exponential rate solves \(ge^{(1+\phi)g\tau}=k\), which differs from the gradual-absorption equation because the two timing technologies pass improvements into production differently. <a href="/assets/paper.pdf#page=53">Pages 53–56</a> give the classifications and proofs behind this comparison.`
        ]
      },
      {
        id: 'resources-continuation',
        title: 'Resources and continuation',
        note: { title: 'Research resources', text: html`${cite('aghionJonesJones2019')} distinguishes automation in goods production from automation in ideas, connecting research inputs to the economy’s growth possibilities.` },
        equation: tex`\int_{A_0}^{A(t)}u^\phi a_M(u)\,du=\int_0^t\frac{B_R(s)}{q(s)}\,ds`,
        paragraphs: [
          html`Distinguishing automation of goods from automation of ideas, as ${cite('aghionJonesJones2019')} does, directs attention to the resources that research uses while improving future production. In our autonomous research law, integration gives an exact resource clock, with cumulative effort required to reach a frontier on the left and available research purchasing power on the right. If budgets and compute prices scale with frontier exponents \(\beta_B\) and \(\beta_q\), the finite-arrival threshold becomes \(p_M+\beta_B-\beta_q>1+\phi\).`,
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
        title: 'Learning signals',
        note: { title: 'Retained judgment', text: html`Within the <a href="/assets/paper.pdf#page=15">information experiment</a>, prediction error follows from the signals actually processed before a later unaided judgment.` },
        paragraphs: [
          html`To follow what a junior preparer retains from a worked return, we represent the needed foundation and later target judgment by independent symmetric signs \(B\) and \(T\). Observations \(S=B\eta\) and \(Y=BT\epsilon\) contain independent noise with means \(r_B\) and \(r_A\), and averaging over the unknown foundation gives \(\Pr(Y=y\mid T=t)=1/2\), so the explanation alone leaves the target’s prior unchanged while the joint likelihood retains the shared foundation.`,
          html`Bayes’ rule applied to that likelihood gives posterior mean \(r_Br_A SY\), and because \(T^2=1\), its conditional variance is \(1-r_B^2r_A^2\). Independent receipt of the foundational observation with probability \(p\) averages that risk with the prior risk of one, yielding expected risk \(1-pr_B^2r_A^2\), which connects receipt of the record pair to the expected error of later judgment (<a href="/work/#figure-2">fig. 2</a>).`,
          html`For several uncertain principles, a Gaussian prior provides the same logic through covariance overlap, since an exercise helps a later target to the extent that their uncertain components move together. <a href="/assets/paper.pdf#page=15">Proposition A.1 and its corollary</a> prove these statements and identify equality of processed information as the condition under which a customer file preserves the learning occasion.`
        ],
        details: [
          {
            title: 'Binary posterior',
            paragraphs: [html`Summing the conditional probabilities over the two foundation values cancels terms linear in the foundation and retains the product of signal reliabilities, giving the likelihood below. Multiplication by the symmetric target prior then gives \(\Pr(T=t\mid S=s,Y=y)=(1+r_Br_A syt)/2\), from which the posterior mean and risk follow directly.`, html`Changing one observed sign reverses the direction of the posterior mean while preserving its magnitude, so the favored target changes while uncertainty remains the same. Across all four signal pairs, squaring that mean gives the same variance reduction, allowing observed answers to differ while the information quality associated with the experiment remains fixed.`],
            equation: tex`\Pr(S=s,Y=y\mid T=t)=\frac14(1+r_Br_A syt)`
          },
          {
            title: 'Gaussian transfer',
            paragraphs: [html`With \(\theta\sim N(\bar\theta,\Sigma)\) and observation \(Z=u^{\mathsf T}\theta+\varepsilon\), independent noise variance \(\sigma^2>0\) gives posterior covariance \(\Sigma-\Sigma uu^{\mathsf T}\Sigma/(\sigma^2+u^{\mathsf T}\Sigma u)\). Multiplying that covariance reduction on both sides by the target direction \(v\) gives the expression below, whose numerator vanishes exactly when the exercise and target have zero prior covariance. For positive overlap, increasing observational noise reduces the learning transferred to the target, connecting the reliability of a worked example to the part of uncertainty that it can resolve.`],
            equation: tex`\mathcal R_{\mathrm{before}}-\mathcal R_{\mathrm{after}}=\frac{(v^{\mathsf T}\Sigma u)^2}{\sigma^2+u^{\mathsf T}\Sigma u}`
          }
        ]
      },
      {
        id: 'career-proof',
        title: 'Replacing practice',
        paragraphs: [
          html`Following experience from a household file into the novice’s career requires accounting for the payment used to acquire it, because complete pricing assigns both capital gain \(\Delta\) and payment \(\Delta\) to a successful practice transition. Formal study contributes optimized surplus \(\Delta^2/(2\kappa)\), and subtracting the novice and expert value equations gives the career law with qualification discount \(\rho+\delta\), reflecting ordinary discounting and obsolescence.`,
          html`For stationary wages above \(b\), the positive quadratic root gives study \(x(E)\), and differentiating the identity \(\kappa Rx+\kappa x^2/2=w(E)-b\) yields \(x_E=w_E/[\kappa(R+x)]\). Under a nonincreasing wage, \(T(E)=(1-E)x(E)\) is strictly decreasing, so the stationary accumulation equation has one root when its endpoint signs differ.`,
          html`When a finite practice loss lowers that root, the difference between the two stationary flow balances partitions the loss into additional formal transitions and reduced obsolescence replacement. Since both parts are positive, the replacement increase lies strictly between zero and the lost diagnostic flow, with <a href="/assets/paper.pdf#page=19">Proposition C.1</a> also proving increased teaching expenditure.`
        ],
        details: [
          {
            title: 'Replacement fraction',
            paragraphs: [html`Implicit differentiation of \(M+T(E)-\delta E=0\) gives \(E_M=1/(\delta-T_E)\), while substitution of the study derivative identifies \(\Lambda=\delta-T_E\). Because \(x>0\) and \(w_E\le0\), we obtain \(\Lambda>\delta\), so the fraction of a marginal practice loss replaced by additional formal transitions is strictly between zero and one.`, html`Formal teaching expenditure follows \(\kappa(1-E)x(E)^2/2\), whose derivative in expertise is negative because the novice share falls and study intensity decreases weakly as \(E\) rises. Moving to the smaller stationary population increases that expenditure along with formal transitions, including the flat-wage case where individual study stays fixed and the number of eligible learners changes.`],
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
          html`Once both research methods are feasible, clamping the equal-cost wage between the two clearing roots gives the allocation rule. Its continuity lets paths cross regime boundaries while preserving the wage level. Before autonomous research becomes feasible, human research clears at \(w_1\). Under a uniform negative bound on demand’s wage derivative, implicit differentiation gives regular root derivatives. Finite minima and maxima then preserve local Lipschitz continuity across the subsequent regime boundaries.`,
          html`With these cleared prices, the joint equilibrium combines the two inherited states and the terminal private value described in <a href="/dynamics/">the dynamics chapter</a>. <a href="/assets/paper.pdf#page=31">Propositions H.1–H.3</a> connect the short-horizon contraction, local shooting selection, and stationary saddle structure, supplying explicit conditions for the paths used in comparative exercises.`
        ],
        equation: tex`w=\min\{w_1,\max\{w_0,\overline w\}\}`,
        details: [
          {
            title: 'Research response',
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
          },
          {
            title: 'Valuing future wages',
            paragraphs: [html`For value difference \(d=\Delta_1-\Delta_0\), the identity \(\Delta_1^2-\Delta_0^2=(\Delta_1+\Delta_0)d\) turns subtraction of the career equations into \(\dot d=a(t)d-(w_1-w_0)\), where \(a=\rho+\delta+(\Delta_1+\Delta_0)/(2\kappa)\). Multiplication by its integrating factor and integration backward from the terminal payoff gives the positive weights in <a href="/assets/paper.pdf#page=29">Proposition G.3</a>.`, html`For an infinitesimal wage change around one baseline, the coefficient becomes \(\rho+\delta+x(t)\), so only earnings at dates after the valuation date contribute to its remaining career value (<a href="/dynamics/#figure-10">fig. 10</a>). Holding the supplied wage perturbation as the input to this equation identifies a conditional value response, while the joint economy determines that input through its market adjustment.`]
          }
        ]
      },
      {
        id: 'welfare-proof',
        title: 'Social value',
        note: { title: 'Public research return', text: html`Within the <a href="/assets/paper.pdf#page=40">qualification-value comparison</a>, both the fund’s wage response and the continuation value of frontier improvements enter social value.` },
        paragraphs: [
          html`Along a smooth selected equilibrium continuation, resource value \(V(t,E,A)\) has derivatives \(\lambda=V_E\) and \(\Theta=V_A\), while the expert and frontier drifts are \(f\) and \(F\). In <a href="/assets/paper.pdf#page=40">Proposition I.1</a>, differentiating the continuation equation in expertise and subtracting the private value equation gives the gap law below, whose forcing combines the fund’s wage response with the social return to innovation.`,
          html`At a strict human corner, the budget identity turns \(L_Rw_E+\Theta F_E\) into \((\Pi-h)(L_R)_E\), where \(\Pi=\Theta A^{-\phi}/a_H\). Backward integration with positive weight \(\exp[-\int_t^s(\rho-f_E)du]\) gives a nonnegative qualification gap when terminal private and social qualification values agree, every future human-research interval satisfies \(\Pi\ge h\) and \((L_R)_E\ge0\), and intervening regimes are mixed or autonomous, with strictness whenever the forcing is positive over a future interval.`,
          html`For a short unannounced preparation change, the leading current-value welfare effect holds the preexisting qualification value fixed while accounting for the changed continuation states. At the human corner, clearing allocates fraction \(\chi_R=B_R/(h^2\mathcal J)\) of released expert hours to research, yielding the private gain plus the social qualification and research terms shown in <a href="/welfare/">the welfare figure</a>.`
        ],
        equation: tex`\frac{d}{dt}(\lambda-\Delta)=(\rho-f_E)(\lambda-\Delta)-\Gamma_E,\qquad \Gamma_E=L_Rw_E+\Theta F_E`,
        details: [
          {
            title: 'Service welfare',
            paragraphs: [html`In the service-and-training benchmark, aggregate formal entry \(I\) uses resources \(\kappa I^2/[2(1-E)]\), a convex perspective of the quadratic study cost. Together with affine feasibility and qualification constraints, that structure gives a concave resource objective, so the competitive customer choices, expert wage, and private qualification value support the global allocation when basic time is slack and discounted private value tends to zero.`, html`At those prices, \(\lambda=\Delta\) aligns both the learning credit and the marginal return to formal instruction with their social values, while preserving earlier customer modes keeps the earlier allocation feasible after an optional technology expansion. Across the resulting welfare comparison, complete feasible paths can include different expert populations and teaching expenditures as part of the efficient adjustment.`]
          },
          {
            title: 'Value cancellation',
            paragraphs: [html`Customer optimization supplies an envelope for changes in selected modes, while expert clearing and the differentiated research budget relate service hours to research inputs. Combining those identities with \(\kappa x=\Delta\) cancels the private training and practice terms, leaving \(G_E+\Delta f_E=w-b-\Delta^2/(2\kappa)-\delta\Delta+L_Rw_E\), which delivers the gap equation after subtraction of the private adjoint.`, html`At the human corner, differentiating \(L_R=B_R/h\) gives \(L_Rw_E=-h(L_R)_E\), while the frontier contribution is \(\Theta F_E=\Pi(L_R)_E\). Their sum is the net research return times the additional research hours, so subtracting input cost emerges directly from the procurement identity when private and social qualification values are compared.`]
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
            paragraphs: [html`Multiplying \(\dot A=B_R(t)A^{-\phi}/[q(t)a_M(A)]\) by \(A^\phi a_M(A)\) and integrating gives equality between required cumulative research effort and cumulative purchasing power. When total effort to reach arbitrarily large frontiers is finite, the arrival date is finite if the resource clock reaches that value, while a resource clock whose limit remains smaller yields a bounded frontier.`, html`Because the required-effort integral is strictly increasing in its upper frontier limit, its inverse converts accumulated research purchasing power into a unique frontier while that power stays below the integral’s limiting value. Through this representation, a production endpoint is located by the effort needed for further advances, and its calendar date follows the resources that the research economy supplies over time.`, html`For frontier-indexed asymptotic resources, direct substitution gives drift proportional to \(A^{p_M+\beta_B-\beta_q-\phi}\), so the same power integration places the finite-arrival threshold at \(p_M+\beta_B-\beta_q>1+\phi\). <a href="/assets/paper.pdf#page=51">Proposition J.9</a> states the full integral comparison and its resource cases.`]
          },
          {
            title: 'Slower delayed growth',
            paragraphs: [html`For \(r<1\), monotonicity gives \(X'/X\le aX^{r-1}\to0\), so \(X(t-\tau)/X(t)\to1\) and differentiating \(X^{1-r}\) gives the same leading power coefficient as instantaneous production. For \(r=1\), exponential solutions satisfy \(\lambda e^{\lambda\tau}=a\), and upper and lower exponential multiples fitted to the positive initial history bound the full trajectory.`]
          },
          {
            title: 'Supercritical delay growth',
            paragraphs: [html`For \(r>1\), setting \(Y=\log X\) gives \(Y'=a\exp[rY(t-\tau)-Y(t)]\), which admits exponential subsolutions and supersolutions for \(Y\) at rates on either side of \(\log r/\tau\). Taking logarithms of those bounds yields the limit below, quantifying superexponential growth while each finite date retains a finite frontier, as proved in <a href="/assets/paper.pdf#page=55">Proposition J.11</a>.`],
            equation: tex`\lim_{t\to\infty}\frac{\log\log A(t)}{t}=\frac1\tau\log\frac{\eta}{1+\phi}`
          },
          {
            title: 'Households and learning',
            paragraphs: bibliography(['becker1965', 'arrow1962', 'acemogluRestrepo2019', 'bastani2025', 'brynjolfsson2025'])
          },
          {
            title: 'Skills and institutions',
            paragraphs: bibliography(['becker1962', 'benPorath1970', 'garicano2000', 'acemogluPischke1999', 'dulleckKerschbamer2006'])
          },
          {
            title: 'Research and growth',
            paragraphs: bibliography(['jones2009', 'korinekSuh2024', 'romer1990', 'bloom2020', 'jonesTonetti2026', 'aghionJonesJones2019'])
          }
        ]
      }
    ]
  },
};

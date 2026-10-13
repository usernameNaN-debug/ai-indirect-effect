const html = String.raw;
const figure = key => `<a data-figure-ref="${key}"></a>`;

export const introductions = {
  introduction: {
    title: 'AI and work', deck: '', part: 'Story',
    sections: [
      {
        id: 'starting-point', title: 'Customer preparation', overview: 'overview-story', figureAfter: 2,
        paragraphs: [
          html`AI can change a profession through its customers. People arrive with more work completed, different questions, and new reasons to seek advice. Professional demand then changes even when practitioners keep their own tools and procedures. We study this indirect route because the economic effects of AI extend beyond the workplace where it is used.`,
          html`Our question concerns what happens over time. Work completed today also trains the people who will supply expertise tomorrow. When their expertise contributes to research, customer choices can reach the production of new AI. Future capabilities then return to customers and researchers, connecting professional change to technological progress (${figure('overview-story')}).`,
          html`We follow this connection through the choices of customers, workers, and a research fund. Each responds to a price or an expected return, and their choices determine what work is done and who learns from it. Bringing those decisions together lets us trace an immediate saving into its later consequences.`
        ]
      },
      {
        id: 'central-idea', title: 'Work and learning',
        paragraphs: [
          html`We treat experience as something conveyed by the information a worker actually receives. Completing a service and learning from it are distinct outcomes, so a change in working hours can carry a different change in future ability. This distinction allows customer preparation to affect both current production and the formation of expertise.`,
          html`Workers own the qualifications they acquire and can carry them to another employer. We connect learning opportunities to future earnings, and place their financing alongside the customer’s fee and the cost of formal instruction. This gives experience a price and makes the supply of expertise respond to the work people expect to do.`
        ]
      },
      {
        id: 'main-findings', title: 'Key findings',
        paragraphs: [
          html`Learning opportunities can lower service fees when workers can pay for the experience they gain. Customers then face part of the future cost of displacing that experience. Restrictions on learning payments weaken this connection, making the rules for financing training relevant to the customer’s preparation choice.`,
          html`More formal training can accompany fewer experts. In our comparison with demand for remaining expert work held fixed, formal instruction replaces only part of the lost practice. Rising training effort can thus be a response to lost workplace learning while the eventual expert workforce becomes smaller.`,
          html`Research can gain time immediately and lose expertise later. Under human research, its eventual labor depends on the service hours released relative to the expert supply lost, evaluated at the old wage and training incentive. This connects customer efficiency to the future capacity for innovation. When methods mix at equal cost, their shares can adjust while the budget purchases the same output.`,
          html`Smaller bills and greater social value can move differently. Expertise that supports further research can be worth more to society than to its holder. Customer preparation then has to be valued through both the learning it displaces and the expert time that reaches research, alongside its private saving.`
        ]
      },
      {
        id: 'recursive-progress', title: 'Recursive improvement',
        paragraphs: [
          html`Research uses current AI to help produce future AI. We call this recursive self-improvement, or RSI. People can carry the process by using AI throughout their research, and a feasible autonomous method can carry it through computation. Including both routes lets us ask how much technological progress continues to depend on human expertise.`,
          html`Each route must complete generation and validation, and each advance takes time to become useful in later research. We include these requirements when following the recursion. They determine how the customer and career mechanisms operate within a growing economy, and why faster individual research tasks can lead to different long-run growth paths.`
        ]
      },
      {
        id: 'reading-route', title: 'Reading guide',
        paragraphs: [
          html`We begin with <a href="/story/">the household’s return</a> and then examine <a href="/work/">what its records teach</a>. <a href="/careers/">Careers</a> follows the price of that learning and the response of formal training, <a href="/research/">Research</a> carries the resulting expertise into the production of new knowledge, and <a href="/welfare/">Welfare</a> brings the private and social accounts together. In the <a href="/mathematics/">mathematical introduction</a>, we explain how these decisions fit into one equilibrium, while <a href="/economy/">Explore the economy</a> lets us follow their connections directly.`
        ]
      }
    ]
  },
  mathematics: {
    title: 'Inside the model', deck: '', part: 'Mathematics',
    sections: [
      {
        id: 'model-question', title: 'Our question', overview: 'overview-math', figureAfter: 2,
        paragraphs: [
          html`Current resource savings and future investment operate on different timescales. Prices can adjust when a technology changes, while learning and research accumulate over time. Our mathematical task is to find a path where current decisions, those accumulated changes, and expected future returns remain consistent.`,
          html`We organize that task around current allocation, inherited states, and future valuation. Expertise \(E\) and the frontier \(A\) carry earlier decisions into the present. Qualification value \(\Delta\) brings later opportunities into today’s investment. Their connection turns a sequence of market allocations into one dynamic equilibrium (${figure('overview-math')}).`,
          html`This organization also determines how we compare changes. We can hold a frontier fixed to isolate a market response, compare stationary occupations to study lasting training adjustments, or follow a full transition after an announcement. Each comparison answers a different question about the same economy.`
        ]
      },
      {
        id: 'decisions-and-states', title: 'Choices and states',
        paragraphs: [
          html`Current markets allocate what the economy already has. Customers select services, workers choose instruction, and research procurement chooses among feasible methods. One wage connects customer demand to research costs wherever both activities use qualified labor. This shared price makes their allocations depend on each other.`,
          html`Inherited states record changes that take time. Training and experience add qualifications, obsolescence removes them, and completed research advances the frontier. Keeping these accumulated quantities separate from current choices lets us distinguish reallocating existing expertise from creating more of it.`
        ]
      },
      {
        id: 'two-time-directions', title: 'Forward and backward',
        paragraphs: [
          html`We specify initial conditions for \(E\) and \(A\), and a terminal payoff for \(\Delta\). These conditions describe different economic commitments. Initial states say what earlier generations have left available. Terminal value says what a qualification will be worth beyond the interval we study. Together they connect an inherited economy to the future its workers anticipate.`,
          html`Equilibrium requires those expectations to agree with the earnings the path produces. Study changes future labor supply, which changes the wages used to value study today. We solve this mutual dependence across the whole path. Announced changes can consequently affect investment before they alter current production.`
        ]
      },
      {
        id: 'results-to-read', title: 'Key results',
        paragraphs: [
          html`Our finite-horizon result gives conditions for a unique equilibrium within a specified feasible region over a sufficiently short horizon. For longer horizons, a local selection condition identifies a nearby solution. These results explain how inherited states and future payoffs select the paths used in our comparisons.`,
          html`Future wage differences enter current qualification value with positive weights when terminal values agree. This gives a direct interpretation of anticipation. Earnings expected further along a career already matter for current training, and the full path determines their combined effect.`,
          html`Growth depends on the productivity of a complete research method. Within a method, the slower-improving required stage sets its eventual exponent. Across available methods, procurement selects the cheaper route. Under the stated input-price and continuation conditions, comparison with research difficulty separates power growth, exponential order, and a finite production endpoint.`,
          html`Research timing changes that classification. Gradual absorption can preserve a finite production endpoint at high productivity, while a positive minimum research duration keeps the frontier finite at every finite date. Superexponential growth can still occur in the latter case. This result distinguishes how fast capability grows from whether it becomes unbounded in finite time.`
        ]
      },
      {
        id: 'mathematical-route', title: 'Equation guide',
        paragraphs: [
          html`We start with the <a href="/model/">equilibrium chapter</a>, which defines customer costs, private study, wages, and research production. <a href="/dynamics/">Dynamics</a> connects inherited states to future earnings and explains the response relationships in the economy diagram. <a href="/growth/">RSI and growth</a> follows complete-method productivity and research timing, and <a href="/appendix/">Derivations</a> supplies the intermediate steps. Reading the <a href="/introduction/">story introduction</a> gives the economic interpretation of the same sequence.`
        ]
      }
    ]
  }
};

export const overviewLabels = {
  'overview-story': {
    title: 'Work and AI',
    nodes: [ ['Available AI','Tools used today'], ['Customer choices','Preparation and discovery'], ['Professional work','Remaining service hours'], ['Expertise','Practice and formal study'], ['Research allocation','Human / machine'], ['New AI frontier','Completed research'] ],
    links: ['Research tools','Hours released'],
    caption: 'Customer use changes the work reaching a profession and the expertise formed through that work. Research receives both the available expertise and the current AI tools, producing advances that return to customers and the next research cycle.'
  },
  'overview-math': {
    title: 'Equilibrium path',
    nodes: [ ['Choices and prices','Demand, practice, wages'], ['Expertise and frontier','E(t) and A(t) move forward'], ['Qualification value','Δ(t) selects formal study'] ],
    links: ['Future wages','Practice and research','Inherited states','Formal study','Initial E₀ and A₀','Terminal value Δ(T)'],
    caption: 'Current choices and market clearing provide the flows that move expertise and the frontier forward. Future wage premia select qualification value backward, while formal study joins these two time directions within the same equilibrium path.'
  }
};

export type JournalEntry = {
  id: string;
  title: string;
  blurb: string;
  body: string[];
};

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "decision-problems",
    title: "Why Most Software Problems Are Actually Decision Problems",
    blurb:
      "Most projects fail because of weak or rushed decisions—not bad code. Here's why clarity beats cleverness.",
    body: [
      "Most software projects don't fail because the code is bad. They fail because the decisions leading up to the code were weak, rushed, or never made explicit.",
      "By the time a bug appears, a system becomes slow, or a product feels bloated, the real mistake usually happened much earlier—during scoping, prioritisation, or assumption-making. Code just happens to be where the consequences surface.",
      "Before a single line is written, there are decisions about: what problem is actually being solved, who the real user is, what won't be built, how much complexity the system is allowed to carry, and what kind of future this codebase is being optimised for. When those decisions are unclear or avoided, no amount of clean code can compensate.",
      "A common pattern I see is teams jumping to implementation too quickly. The pressure to \"start building\" often masks uncertainty. Writing code feels productive, while slowing down to make hard trade-offs feels risky. But that risk doesn't disappear—it gets deferred and amplified.",
      "If you don't decide whether a product is meant to be flexible or opinionated, you'll end up with a system that's fragile and hard to use. If you don't decide what scale actually means for your business, you'll either over-engineer prematurely or under-prepare entirely. If you don't decide what success looks like, every feature request starts to feel equally important.",
      "These are not technical problems. They're judgment problems.",
      "Good software development is largely about reducing ambiguity. That means surfacing assumptions early, naming constraints clearly, and accepting that every choice closes off other paths. Strong developers don't avoid this responsibility—they lean into it.",
      "When I approach a project, I spend a disproportionate amount of time on questions that don't look like \"coding\": What breaks first if this succeeds? What happens if this only half-works? What decisions are we postponing by saying \"we'll figure it out later\"?",
      "The goal isn't perfection. It's alignment. Once the right decisions are made, the code often becomes surprisingly straightforward. When the decisions are wrong—or missing—the codebase slowly turns into a negotiation between past uncertainty and present reality.",
      "In my experience, the best software is rarely clever. It's decisive.",
    ],
  },
  {
    id: "boring-tech",
    title: "The Quiet Power of Boring Tech Stacks",
    blurb:
      "Reliable software is often built on tools nobody gets excited about. Boring stacks are a feature, not a limitation.",
    body: [
      "There's a reason the most reliable software in the world is built on technologies that no one gets excited about.",
      "Boring tech stacks don't trend on social media. They don't make for flashy conference talks. But they survive traffic spikes, team changes, business pivots, and years of incremental growth. That's not accidental—it's earned.",
      "A boring stack is one where the failure modes are well understood, the tooling is mature, the ecosystem is deep, and the trade-offs are known. This predictability is a feature, not a limitation.",
      "In contrast, exciting stacks often promise leverage but quietly introduce fragility. New frameworks optimise for developer experience today, but leave unanswered questions about maintenance, hiring, debugging, and long-term support. Those questions don't matter much in a demo. They matter a lot in production.",
      "When I choose tools, I'm not asking \"what's the newest?\" I'm asking: Can this be reasoned about under pressure? Will this still make sense in three years? Can another competent developer understand this quickly? Does this reduce risk, or just move it around?",
      "This is why I gravitate toward stacks that are sometimes dismissed as \"boring\": Next.js, TypeScript, Tailwind, Postgres, simple APIs, well-understood deployment platforms. These tools don't fight you. They don't demand heroics. They allow you to focus on the actual problem you're solving instead of the infrastructure required to solve it.",
      "There's also an honesty to boring stacks. They force you to confront reality. If performance is bad, you can't blame the framework. If onboarding is confusing, you can't hide behind abstraction. The system reflects your decisions clearly. That clarity compounds over time.",
      "Boring stacks are also kind to small teams. They reduce cognitive load, make onboarding easier, and allow progress without constant reinvention. This matters more than people admit—especially in real businesses where time, money, and attention are finite.",
      "None of this means avoiding innovation. It means being intentional about where novelty lives. I'd rather take risks in product ideas, business models, or user experience than in the foundations that everything else depends on.",
      "The irony is that boring tech often enables more ambitious outcomes. Because when the stack is calm, the team can be bold. Quietly, reliably, over the long term—that's power.",
    ],
  },
];

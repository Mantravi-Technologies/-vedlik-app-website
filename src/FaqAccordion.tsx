import type { ReactNode } from 'react'
import SpaLink from './SpaLink'

const FAQ_ITEMS: readonly { question: string; answer: ReactNode }[] = [
  {
    question: 'Is Vedlik free?',
    answer:
      'Yes. Vedlik is free to download and use. There is no subscription or paywall for the core experience—we want trustworthy AI and tech intelligence available to everyone building and investing in the space.',
  },
  {
    question: 'Why use Vedlik if I already read the news elsewhere?',
    answer:
      'Vedlik focuses on what changed and what matters—so you stay updated on AI, startups, and tech without drowning in noise. You get curated insight and clear takeaways with sources, built for people who want to stay current and act with context, not chase endless generic headlines.',
  },
  {
    question: 'How can I read technical changes and Signals?',
    answer:
      'Start on the main story view for a quick, readable brief. Flip to the back (like turning the phone in the demo) to open Signals—a view aimed at what changed, technical implications, and structured context. Same story, two sides: fast scan in front, deeper technical and signal-style detail on the back.',
  },
  {
    question: 'How do you pick sources and handle mistakes?',
    answer:
      'We prioritize reputable publishers and primary reporting, and we surface attribution so you can always open the original. Summaries and insights can miss nuance or get something wrong—use the source as the authority, and we keep improving wording and checks as the product evolves.',
  },
  {
    question: 'Which platforms is Vedlik on?',
    answer:
      'Vedlik is built for iOS and Android. Join the waitlist to be notified as soon as early access opens on your platform, and we will share App Store and Google Play links when they are live.',
  },
  ,
  {
    question: 'How does the waitlist work?',
    answer:
      'Add your email through Join Waitlist. We will email you first when early access opens—no spam, and you can ignore messages if your plans change. There is a short cooldown between submissions to keep the list healthy.',
  },
]

const summaryClass =
  'flex w-full cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-left text-[0.95rem] font-semibold leading-snug text-white outline-none transition-colors hover:text-white/95 focus-visible:ring-2 focus-visible:ring-[#2DD4BF]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#000] sm:py-4 sm:text-base [&::-webkit-details-marker]:hidden'

export default function FaqAccordion() {
  return (
    <div className="w-full max-w-3xl">
      <p className="text-[#2DD4BF] text-[11px] sm:text-xs tracking-[0.14em] uppercase">FAQ</p>
      <h2 className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-white leading-tight">
        Common questions
      </h2>
      <p className="mt-2 text-sm sm:text-base text-white/60 leading-relaxed max-w-2xl">
        Quick answers on the product, trust, platforms, data, and early access.
      </p>
      <div className="mt-5 sm:mt-6 rounded-xl border border-white/[0.1] bg-black/25 px-3 sm:px-5 divide-y divide-white/[0.08]">
        {FAQ_ITEMS.map(({ question, answer }) => (
          <details key={question} className="group/faq">
            <summary className={summaryClass}>
              <span>{question}</span>
              <span
                className="shrink-0 text-[#2DD4BF] text-lg leading-none transition-transform duration-200 group-open/faq:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <div className="pb-3.5 pl-0 pr-2 text-[0.8125rem] sm:text-sm leading-relaxed text-white/68 sm:pb-4">
              {answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

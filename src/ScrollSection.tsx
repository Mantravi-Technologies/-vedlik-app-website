import type { RefObject } from 'react'
import HeroKeywordRotate from './HeroKeywordRotate'
import PhoneMockup from './PhoneMockup'

const HERO_KEYWORDS_1 = ['Funding', 'Models', 'Startups', 'Policy'] as const
const HERO_KEYWORDS_2 = ['Clarity', 'Signal', 'Depth', 'Truth'] as const
const HERO_KEYWORDS_3 = ['Entities', 'Scores', 'Claims', 'Proof'] as const

interface ScrollSectionProps {
  sectionRef: RefObject<HTMLElement>
  text1Ref: RefObject<HTMLDivElement>
  text2Ref: RefObject<HTMLDivElement>
  text3Ref: RefObject<HTMLDivElement>
  phoneRef: RefObject<HTMLDivElement>
  screenContainerRef: RefObject<HTMLDivElement>
  frontFaceRef: RefObject<HTMLDivElement>
  backFaceRef: RefObject<HTMLDivElement>
  article1Ref: RefObject<HTMLDivElement>
  article2Ref: RefObject<HTMLDivElement>
  onJoinWaitlist: () => void
}

export default function ScrollSection({
  sectionRef,
  text1Ref,
  text2Ref,
  text3Ref,
  phoneRef,
  screenContainerRef,
  frontFaceRef,
  backFaceRef,
  article1Ref,
  article2Ref,
  onJoinWaitlist,
}: ScrollSectionProps) {
  return (
    <section
      ref={sectionRef}
      className="vedlik-mobile-section relative w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-10 md:gap-12 px-4 sm:px-6 md:px-10 lg:px-12 md:py-20 md:h-[100dvh] md:min-h-[100dvh] bg-[#000] border-b border-white/[0.08] overflow-hidden snap-start snap-always"
    >
      <div className="absolute inset-0 opacity-[0.38] md:opacity-[0.28] pointer-events-none">
        <img src="/images/section_2_bg.png" alt="" className="w-full h-full object-cover object-[86%_88%] md:object-center" />
      </div>

      {/* Text: on mobile first (order-1), on desktop left (md:order-1) */}
      <div className="relative order-1 md:order-1 z-10 flex flex-col justify-center pt-1.5 sm:pt-5 md:pt-0 md:w-[46%] lg:max-w-xl shrink-0 min-h-[16vh] sm:min-h-[24vh] md:min-h-[240px] max-md:pb-2">
        <div ref={text1Ref} className="absolute inset-0 flex flex-col justify-start pt-0 sm:pt-3 md:justify-center md:pt-0 items-center md:items-start text-center md:text-left opacity-100 md:translate-x-10 lg:translate-x-14 translate-y-0 sm:translate-y-3 md:translate-y-0">
          <h1 className="max-w-none text-[1.72rem] leading-[1.02] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            AI &amp; Tech, Decoded.
          </h1>
          <p className="mt-2 sm:mt-4 md:mt-5 text-white/70 text-[0.74rem] leading-[1.3] sm:text-xl md:text-2xl max-w-lg mx-auto md:mx-0">
            <span className="block whitespace-nowrap sm:hidden">AI, startups, and tech in one feed.</span>
            <span className="hidden sm:inline">Artificial intelligence, startups, and technology intelligence one clear feed.</span>
          </p>
          <HeroKeywordRotate words={HERO_KEYWORDS_1} />
          <div className="mt-2.5 sm:mt-6 w-full flex justify-center md:justify-start -translate-x-1 sm:translate-x-0 md:translate-x-0">
            <button
              type="button"
              onClick={onJoinWaitlist}
              className="inline-flex items-center justify-center rounded-xl border border-[#2DD4BF]/60 bg-gradient-to-r from-[#0A1114] via-[#102B2F] to-[#0A1114] shadow-[0_8px_26px_rgba(45,212,191,0.2)] px-5 py-2 text-sm font-semibold tracking-[0.01em] text-white hover:from-[#102125] hover:via-[#15383d] hover:to-[#102125] transition-colors sm:rounded-2xl sm:px-12 sm:py-4.5 sm:text-2xl sm:shadow-[0_12px_36px_rgba(45,212,191,0.22)]"
            >
              Join Waitlist
            </button>
          </div>
        </div>
        <div ref={text2Ref} className="absolute inset-0 flex flex-col justify-start pt-0 sm:pt-3 md:justify-center md:pt-0 items-center md:items-start text-center md:text-left opacity-0 md:translate-x-10 lg:translate-x-14 translate-y-0 sm:translate-y-3 md:translate-y-0">
          <h1 className="max-w-none text-[1.72rem] leading-[1.02] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            Read what matters.
          </h1>
          <p className="mt-2 sm:mt-4 md:mt-5 text-white/70 text-[0.74rem] leading-[1.3] sm:text-xl md:text-2xl max-w-lg mx-auto md:mx-0">
            <span className="block whitespace-nowrap sm:hidden">AI-powered clarity on every story.</span>
            <span className="hidden sm:inline">AI-powered clarity on every story.</span>
          </p>
          <HeroKeywordRotate words={HERO_KEYWORDS_2} />
          <div className="mt-2.5 sm:mt-6 w-full flex justify-center md:justify-start -translate-x-1 sm:translate-x-0 md:translate-x-0">
            <button
              type="button"
              onClick={onJoinWaitlist}
              className="inline-flex items-center justify-center rounded-xl border border-[#2DD4BF]/60 bg-gradient-to-r from-[#0A1114] via-[#102B2F] to-[#0A1114] shadow-[0_8px_26px_rgba(45,212,191,0.2)] px-5 py-2 text-sm font-semibold tracking-[0.01em] text-white hover:from-[#102125] hover:via-[#15383d] hover:to-[#102125] transition-colors sm:rounded-2xl sm:px-12 sm:py-4.5 sm:text-2xl sm:shadow-[0_12px_36px_rgba(45,212,191,0.22)]"
            >
              Join Waitlist
            </button>
          </div>
        </div>
        <div ref={text3Ref} className="absolute inset-0 flex flex-col justify-start pt-0 sm:pt-3 md:justify-center md:pt-0 items-center md:items-start text-center md:text-left opacity-0 md:translate-x-10 lg:translate-x-14 translate-y-0 sm:translate-y-3 md:translate-y-0">
          <h1 className="max-w-none text-[1.72rem] leading-[1.02] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            See the insight.
          </h1>
          <p className="mt-2 sm:mt-4 md:mt-5 text-white/70 text-[0.74rem] leading-[1.3] sm:text-xl md:text-2xl max-w-lg mx-auto md:mx-0">
            <span className="block whitespace-nowrap sm:hidden">Context and credibility for funding intel.</span>
            <span className="hidden sm:inline">Credibility, context, and entities built for tech and startup funding intelligence.</span>
          </p>
          <HeroKeywordRotate words={HERO_KEYWORDS_3} />
          <div className="mt-2.5 sm:mt-6 w-full flex justify-center md:justify-start -translate-x-1 sm:translate-x-0 md:translate-x-0">
            <button
              type="button"
              onClick={onJoinWaitlist}
              className="inline-flex items-center justify-center rounded-xl border border-[#2DD4BF]/60 bg-gradient-to-r from-[#0A1114] via-[#102B2F] to-[#0A1114] shadow-[0_8px_26px_rgba(45,212,191,0.2)] px-5 py-2 text-sm font-semibold tracking-[0.01em] text-white hover:from-[#102125] hover:via-[#15383d] hover:to-[#102125] transition-colors sm:rounded-2xl sm:px-12 sm:py-4.5 sm:text-2xl sm:shadow-[0_12px_36px_rgba(45,212,191,0.22)]"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </div>

      {/* Phone: tighter top margin on mobile so mockup sits higher under the smaller CTA */}
      <div className="order-2 md:order-2 z-10 flex min-h-0 flex-1 flex-col items-center justify-center max-md:mt-6 sm:max-md:mt-8 md:mt-10 md:w-[58%] min-h-[38vh] sm:min-h-[50vh] md:min-h-0 lg:mt-12">
        <div className="flex max-h-full min-h-0 min-w-0 w-full max-w-full flex-1 items-center justify-center max-md:overflow-x-hidden overflow-visible md:overflow-hidden px-0 sm:px-1 md:pt-2 lg:pt-3">
          <PhoneMockup
            phoneRef={phoneRef}
            screenContainerRef={screenContainerRef}
            frontFaceRef={frontFaceRef}
            backFaceRef={backFaceRef}
            article1Ref={article1Ref}
            article2Ref={article2Ref}
          />
        </div>
      </div>
    </section>
  )
}

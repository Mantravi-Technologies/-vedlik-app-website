import type { RefObject } from 'react'
import HeroKeywordRotate from './HeroKeywordRotate'
import PhoneMockup from './PhoneMockup'

const APP_STORE_URL = 'https://apps.apple.com/in/app/vedlik-ai-tech-insights/id6761024663'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.mantravi.ai.briefing'

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

function StoreBadges({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-row items-center gap-2 sm:gap-3 ${className}`}>
      <a href={APP_STORE_URL} target="_blank" rel="noreferrer" className="inline-flex w-[44%] sm:w-auto">
        <img
          src="/images/app_store_badge.png"
          alt="Download on the App Store"
          className="h-auto w-full sm:w-auto sm:h-11 md:h-12 lg:h-[54px] object-contain"
          draggable={false}
          loading="eager"
          decoding="async"
        />
      </a>
      <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className="inline-flex w-[44%] sm:w-auto">
        <img
          src="/images/google_play_badge.png"
          alt="Get it on Google Play"
          className="h-auto w-full sm:w-auto sm:h-11 md:h-12 lg:h-[54px] object-contain"
          draggable={false}
          loading="eager"
          decoding="async"
        />
      </a>
    </div>
  )
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
  onJoinWaitlist: _onJoinWaitlist,
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
      <div className="relative order-1 md:order-1 z-10 flex flex-col justify-center pt-0 sm:pt-5 md:pt-0 md:w-[46%] lg:max-w-xl shrink-0 min-h-[22vh] sm:min-h-[26vh] md:min-h-[240px] max-md:pb-1">
        <div ref={text1Ref} className="absolute inset-0 flex flex-col justify-start pt-0 sm:pt-3 md:justify-center md:pt-0 items-center md:items-start text-center md:text-left opacity-100 md:translate-x-10 lg:translate-x-14 translate-y-0 sm:translate-y-3 md:translate-y-0">
          <h1 className="max-w-none text-[1.72rem] leading-[1.02] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            AI &amp; Tech, Decoded.
          </h1>
          <p className="mt-2 sm:mt-4 md:mt-5 text-white/70 text-[0.74rem] leading-[1.3] sm:text-xl md:text-2xl max-w-lg mx-auto md:mx-0">
            <span className="block whitespace-nowrap sm:hidden">AI, startups, and tech in one feed.</span>
            <span className="hidden sm:inline">Artificial intelligence, startups, and technology intelligence one clear feed.</span>
          </p>
          <HeroKeywordRotate words={HERO_KEYWORDS_1} />
          <StoreBadges className="mt-2.5 sm:mt-5 w-full justify-center md:justify-start" />
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
          <StoreBadges className="mt-2.5 sm:mt-5 w-full justify-center md:justify-start" />
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
          <StoreBadges className="mt-2.5 sm:mt-5 w-full justify-center md:justify-start" />
        </div>
      </div>

      {/* Phone: tighter top margin on mobile so mockup sits higher under the smaller CTA */}
      <div className="order-2 md:order-2 z-10 flex min-h-0 flex-1 flex-col items-center justify-center max-md:mt-2 sm:max-md:mt-4 md:mt-10 md:w-[58%] min-h-[34vh] sm:min-h-[46vh] md:min-h-0 lg:mt-12">
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

      <p
        className="pointer-events-none absolute bottom-[max(0.65rem,env(safe-area-inset-bottom,0px))] left-0 right-0 z-20 px-4 text-center text-[7px] leading-tight text-white/40 sm:bottom-3 sm:px-6 md:bottom-4 md:px-10 lg:px-12"
        role="note"
      >
        Demo UI for illustration only—not live data.
      </p>
    </section>
  )
}

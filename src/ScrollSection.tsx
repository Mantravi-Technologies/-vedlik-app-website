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

function StoreBadges() {
  return (
    <div className="flex flex-row items-center gap-3">
      <a href={APP_STORE_URL} target="_blank" rel="noreferrer" className="inline-flex">
        <img
          src="/images/app_store_badge.png"
          alt="Download on the App Store"
          className="h-9 md:h-11 lg:h-13 w-auto object-contain"
          draggable={false}
          loading="eager"
          decoding="async"
        />
      </a>
      <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className="inline-flex">
        <img
          src="/images/google_play_badge.png"
          alt="Get it on Google Play"
          className="h-9 md:h-11 lg:h-13 w-auto object-contain"
          draggable={false}
          loading="eager"
          decoding="async"
        />
      </a>
    </div>
  )
}

const SLIDES = [
  {
    key: 'slide1',
    heading: 'AI & Tech, Decoded.',
    sub: 'AI, startups, and tech in one feed.',
    subDesktop: 'Artificial intelligence, startups, and technology in one clear feed.',
    words: HERO_KEYWORDS_1,
    visible: true,
  },
  {
    key: 'slide2',
    heading: 'Read what matters.',
    sub: 'AI-powered clarity on every story.',
    subDesktop: 'AI-powered clarity on every story.',
    words: HERO_KEYWORDS_2,
    visible: false,
  },
  {
    key: 'slide3',
    heading: 'See the insight.',
    sub: 'Context and credibility for funding intel.',
    subDesktop: 'Credibility, context, and entities for tech and startup intelligence.',
    words: HERO_KEYWORDS_3,
    visible: false,
  },
] as const

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
  const slideRefs = [text1Ref, text2Ref, text3Ref]

  return (
    <section
      ref={sectionRef}
      className="vedlik-hero-section relative w-full bg-[#000] border-b border-white/[0.08] overflow-hidden snap-start snap-always"
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none">
        <img
          src="/images/section_2_bg.png"
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/*
       * Single unified layout.
       * Stacked → flex-col: text block (shrink-to-content) → badges → phone (flex-1)
       * Wide      → flex-row: text+badges column (40%) | phone (60%)
       *
       * Row + left-aligned copy use lg: (1024px), not md:. Chrome “Desktop site” on phones
       * often reports ~980px layout width while the screen is narrow; md: would clip under
       * overflow-x:hidden. True phones stay stacked; real desktops stay unchanged.
       *
       * ONE set of slide divs with refs so GSAP always animates the right elements.
       * Short vs long subcopy follows the same lg breakpoint as the row layout.
       */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row lg:items-center lg:px-[4vw] lg:gap-[2vw]">

        {/* ── Text + badges column ── */}
        <div className="hero-text-side shrink-0 w-full lg:w-[40%] flex flex-col lg:justify-center">

          {/*
           * Slide container.
           * Mobile: relative + invisible spacer reserves natural height.
           * Desktop: relative, auto height — slides stack absolutely over the spacer,
           *   badges follow in normal flow right below.
           */}
          <div className="relative">

            {/* Invisible spacer — reserves height on both mobile and desktop */}
            <div className="invisible flex flex-col px-6 lg:px-0 py-4 lg:py-0 items-center lg:items-start text-center lg:text-left" aria-hidden>
              <span
                className="font-bold leading-[1.04] text-[1.9rem]"
                style={{ fontSize: 'clamp(1.6rem, 3.6vw, 4.5rem)' }}
              >
                {SLIDES[0].heading}
              </span>
              <span
                className="mt-2 lg:mt-[1.2vw] leading-relaxed text-[0.82rem] lg:max-w-[36vw]"
                style={{ fontSize: 'clamp(0.82rem, 1.3vw, 1.35rem)' }}
              >
                <span className="lg:hidden">{SLIDES[0].sub}</span>
                <span className="hidden lg:inline">{SLIDES[0].subDesktop}</span>
              </span>
              {/* keyword line placeholder */}
              <span className="mt-[1vw] block h-[1.35em]" />
            </div>

            {/* Actual animated slides — absolutely cover the spacer */}
            {SLIDES.map(({ key, heading, sub, subDesktop, words, visible }, i) => (
              <div
                key={key}
                ref={slideRefs[i]}
                className={`
                  absolute inset-0 flex flex-col
                  justify-center items-center text-center px-6
                  lg:items-start lg:text-left lg:px-0 lg:justify-center
                  ${visible ? 'opacity-100' : 'opacity-0'}
                `}
              >
                <h1
                  className="font-bold tracking-tight text-white leading-[1.04] text-[1.9rem]"
                  style={{ fontSize: 'clamp(1.6rem, 3.6vw, 4.5rem)' }}
                >
                  {heading}
                </h1>
                <p
                  className="mt-2 lg:mt-[1.2vw] text-white/70 leading-relaxed text-[0.82rem] lg:max-w-[36vw]"
                  style={{ fontSize: 'clamp(0.82rem, 1.3vw, 1.35rem)' }}
                >
                  <span className="lg:hidden">{sub}</span>
                  <span className="hidden lg:inline">{subDesktop}</span>
                </p>
                <HeroKeywordRotate words={words} />
              </div>
            ))}
          </div>

          {/* Store badges — in normal flow, right below the spacer on both mobile & desktop */}
          <div className="flex justify-center lg:justify-start pt-3 lg:pt-[1.5vw]">
            <StoreBadges />
          </div>
        </div>

        {/* ── Phone — flex-1 takes all remaining height on mobile ── */}
        <div className="flex-1 w-full lg:h-full flex items-start lg:items-center justify-center overflow-hidden px-3 pb-1 lg:px-0 lg:pb-0 lg:py-[2vh]">
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
        className="pointer-events-none absolute bottom-[max(0.5rem,env(safe-area-inset-bottom,0px))] left-0 right-0 z-20 text-center text-[7px] leading-tight text-white/40"
        role="note"
      >
        Demo UI for illustration only—not live data.
      </p>
    </section>
  )
}

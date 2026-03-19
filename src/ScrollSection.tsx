import type { RefObject } from 'react'
import PhoneMockup from './PhoneMockup'

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
}: ScrollSectionProps) {
  return (
    <section
      ref={sectionRef}
      className="relative w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8 sm:gap-10 md:gap-12 px-4 sm:px-6 md:px-10 lg:px-12 py-8 sm:py-12 md:py-20 h-[100vh] min-h-[100dvh] max-h-[100vh] bg-[#000] border-b border-white/[0.08] overflow-hidden snap-start snap-always"
    >
      <div className="absolute inset-0 opacity-[0.38] md:opacity-[0.28] pointer-events-none">
        <img src="/images/section_2_bg.png" alt="" className="w-full h-full object-cover object-[86%_88%] md:object-center" />
      </div>

      {/* Text: on mobile first (order-1), on desktop left (md:order-1) */}
      <div className="relative order-1 md:order-1 z-10 flex flex-col justify-center md:w-[46%] lg:max-w-xl shrink-0 min-h-[22vh] sm:min-h-[26vh] md:min-h-[240px]">
        <div ref={text1Ref} className="absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left opacity-100 md:translate-x-10 lg:translate-x-14 translate-y-10 sm:translate-y-12 md:translate-y-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[0.95]">
            Signals, Decoded.
          </h1>
          <p className="mt-3 sm:mt-4 md:mt-5 text-white/70 text-lg sm:text-xl md:text-2xl max-w-lg mx-auto md:mx-0">
            Cut through the noise. One feed, one truth.
          </p>
          <div className="mt-5 sm:mt-6 w-full flex justify-center md:justify-start -translate-x-1 sm:translate-x-0 md:translate-x-0">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-2xl border border-[#2DD4BF]/60 bg-gradient-to-r from-[#0A1114] via-[#102B2F] to-[#0A1114] shadow-[0_12px_36px_rgba(45,212,191,0.22)] px-9 sm:px-12 py-4 sm:py-4.5 text-lg sm:text-2xl font-semibold tracking-[0.01em] text-white hover:from-[#102125] hover:via-[#15383d] hover:to-[#102125] transition-colors"
            >
              Join Waitlist
            </a>
          </div>
        </div>
        <div ref={text2Ref} className="absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left opacity-0 md:translate-x-10 lg:translate-x-14 translate-y-10 sm:translate-y-12 md:translate-y-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[0.95]">
            Read what matters.
          </h1>
          <p className="mt-3 sm:mt-4 md:mt-5 text-white/70 text-lg sm:text-xl md:text-2xl max-w-lg mx-auto md:mx-0">
            AI-powered clarity on every story.
          </p>
          <div className="mt-5 sm:mt-6 w-full flex justify-center md:justify-start -translate-x-1 sm:translate-x-0 md:translate-x-0">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-2xl border border-[#2DD4BF]/60 bg-gradient-to-r from-[#0A1114] via-[#102B2F] to-[#0A1114] shadow-[0_12px_36px_rgba(45,212,191,0.22)] px-9 sm:px-12 py-4 sm:py-4.5 text-lg sm:text-2xl font-semibold tracking-[0.01em] text-white hover:from-[#102125] hover:via-[#15383d] hover:to-[#102125] transition-colors"
            >
              Join Waitlist
            </a>
          </div>
        </div>
        <div ref={text3Ref} className="absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left opacity-0 md:translate-x-10 lg:translate-x-14 translate-y-10 sm:translate-y-12 md:translate-y-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[0.95]">
            See the signals.
          </h1>
          <p className="mt-3 sm:mt-4 md:mt-5 text-white/70 text-lg sm:text-xl md:text-2xl max-w-lg mx-auto md:mx-0">
            Credibility. Sentiment. Entities.
          </p>
          <div className="mt-5 sm:mt-6 w-full flex justify-center md:justify-start -translate-x-1 sm:translate-x-0 md:translate-x-0">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-2xl border border-[#2DD4BF]/60 bg-gradient-to-r from-[#0A1114] via-[#102B2F] to-[#0A1114] shadow-[0_12px_36px_rgba(45,212,191,0.22)] px-9 sm:px-12 py-4 sm:py-4.5 text-lg sm:text-2xl font-semibold tracking-[0.01em] text-white hover:from-[#102125] hover:via-[#15383d] hover:to-[#102125] transition-colors"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </div>

      {/* Phone: on mobile below text (order-2), on desktop right and brought left (center of column) */}
      <div className="order-2 md:order-2 flex-1 z-10 flex items-center justify-center md:justify-center md:w-[58%] min-h-[55vh] sm:min-h-[50vh] md:min-h-0">
        <PhoneMockup
          phoneRef={phoneRef}
          screenContainerRef={screenContainerRef}
          frontFaceRef={frontFaceRef}
          backFaceRef={backFaceRef}
          article1Ref={article1Ref}
          article2Ref={article2Ref}
        />
      </div>
    </section>
  )
}

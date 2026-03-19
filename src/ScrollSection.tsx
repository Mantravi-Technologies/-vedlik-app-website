import type { RefObject } from 'react'
import PhoneMockup from './PhoneMockup'

interface ScrollSectionProps {
  sectionRef: RefObject<HTMLElement>
  text1Ref: RefObject<HTMLDivElement>
  text2Ref: RefObject<HTMLDivElement>
  text3Ref: RefObject<HTMLDivElement>
  phoneRef: RefObject<HTMLDivElement>
  screenContainerRef: RefObject<HTMLDivElement>
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
  article1Ref,
  article2Ref,
}: ScrollSectionProps) {
  return (
    <section
      ref={sectionRef}
      className="relative w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8 sm:gap-10 md:gap-12 px-4 sm:px-6 md:px-10 lg:px-12 py-8 sm:py-12 md:py-20 h-[100vh] min-h-[100dvh] max-h-[100vh] bg-[#000] border-b border-white/[0.08] overflow-hidden snap-start snap-always"
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <img src="/images/hero_see_the_signals.png" alt="" className="w-full h-full object-cover object-center" />
      </div>

      {/* Text: on mobile first (order-1), on desktop left (md:order-1) */}
      <div className="relative order-1 md:order-1 z-10 flex flex-col justify-center md:w-[42%] lg:max-w-md shrink-0 min-h-[22vh] sm:min-h-[26vh] md:min-h-[240px]">
        <div ref={text1Ref} className="absolute inset-0 flex flex-col justify-center opacity-100">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            News, Decoded.
          </h1>
          <p className="mt-2 sm:mt-3 md:mt-4 text-white/55 text-sm sm:text-base md:text-lg max-w-md">
            Cut through the noise. One feed, one truth.
          </p>
        </div>
        <div ref={text2Ref} className="absolute inset-0 flex flex-col justify-center opacity-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Read what matters.
          </h1>
          <p className="mt-2 sm:mt-3 md:mt-4 text-white/55 text-sm sm:text-base md:text-lg max-w-md">
            AI-powered clarity on every story.
          </p>
        </div>
        <div ref={text3Ref} className="absolute inset-0 flex flex-col justify-center opacity-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            See the signals.
          </h1>
          <p className="mt-2 sm:mt-3 md:mt-4 text-white/55 text-sm sm:text-base md:text-lg max-w-md">
            Credibility. Sentiment. Entities.
          </p>
        </div>
      </div>

      {/* Phone: on mobile below text (order-2), on desktop right and brought left (center of column) */}
      <div className="order-2 md:order-2 flex-1 z-10 flex items-center justify-center md:justify-center md:w-[58%] min-h-[55vh] sm:min-h-[50vh] md:min-h-0">
        <PhoneMockup
          phoneRef={phoneRef}
          screenContainerRef={screenContainerRef}
          article1Ref={article1Ref}
          article2Ref={article2Ref}
        />
      </div>
    </section>
  )
}

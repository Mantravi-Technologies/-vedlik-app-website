import type { RefObject } from 'react'
import { useMediaQuery } from './useMediaQuery'

/**
 * Content area inset = gap between mockup edge and the article/signal content.
 * Increase left/right so content stays inside the phone and doesn’t overlap bezels.
 * These values are applied in the style object below — change here and save to see updates.
 */
const CONTENT_INSET_DESKTOP = {
  top: '11%',
  left: '16%',
  right: '17.1%',
  bottom: '13.3%',
}

const CONTENT_INSET_MOBILE = {
  top: '17%',
  left: '13%',
  right: '14.2%',
  bottom: '19%',
}

interface PhoneMockupProps {
  phoneRef: RefObject<HTMLDivElement>
  screenContainerRef: RefObject<HTMLDivElement>
  article1Ref: RefObject<HTMLDivElement>
  article2Ref: RefObject<HTMLDivElement>
}

export default function PhoneMockup({
  phoneRef,
  screenContainerRef,
  article1Ref,
  article2Ref,
}: PhoneMockupProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const inset = isMobile ? CONTENT_INSET_MOBILE : CONTENT_INSET_DESKTOP

  return (
    <div
      ref={phoneRef}
      className="relative w-[280px] min-w-[280px] shrink-0 sm:w-[300px] sm:min-w-[300px] md:w-[360px] md:min-w-[360px] lg:w-[380px] lg:min-w-[380px] origin-center"
      style={{ perspective: 1000 }}
    >
      <div className="relative w-full aspect-[9/19] max-h-[min(72vh,620px)] sm:max-h-[min(74vh,640px)] md:max-h-[min(78vh,680px)]">
        <img
          src="/images/mockup_frame.png"
          alt="Phone"
          className="absolute inset-0 w-full h-full object-contain object-center select-none pointer-events-none"
          draggable={false}
        />

        {/* Content area: no rounded corners, sits inside mockup screen; inset from edges so it doesn’t overflow */}
        <div
          className="absolute overflow-hidden bg-[#000]"
          style={{
            top: inset.top,
            left: inset.left,
            right: inset.right,
            bottom: inset.bottom,
            transformStyle: 'preserve-3d',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          <div
            ref={screenContainerRef}
            className="relative w-full h-full overflow-hidden"
            style={{
              transformStyle: 'preserve-3d',
              position: 'relative',
              willChange: 'transform',
              contain: 'layout paint',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div ref={article1Ref} className="absolute inset-0">
                <img
                  src="/images/front_1.png"
                  alt="Article 1"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div
                ref={article2Ref}
                className="absolute inset-0 opacity-0 pointer-events-none"
              >
                <img
                  src="/images/front_2.png"
                  alt="Article 2"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <img
                src="/images/back_signals.png"
                alt="Vedlik Signals"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

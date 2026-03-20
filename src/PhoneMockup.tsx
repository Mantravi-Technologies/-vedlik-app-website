import { useEffect, type RefObject } from 'react'
import { useMediaQuery } from './useMediaQuery'

/**
 * Content area inset = gap between mockup edge and the article/signal content.
 * Increase left/right so content stays inside the phone and doesn’t overlap bezels.
 *
 * - CONTENT_INSET_MOBILE: narrow viewport (normal mobile site).
 * - CONTENT_INSET_DESKTOP: wide viewport + mouse / fine pointer (real desktop).
 * - CONTENT_INSET_DESKTOP_TOUCH: wide viewport but touch-first UI — e.g. “Request desktop
 *   site” on a phone. Uses `(hover: none) and (pointer: coarse)` with width ≥ 768.
 *   Defaults match DESKTOP until you tune for that mode.
 */
const CONTENT_INSET_DESKTOP = {
  top: '11%',
  left: '16%',
  right: '17.1%',
  bottom: '13.3%',
}

/** Same keys as above; edit when desktop layout on a phone looks misaligned. */
const CONTENT_INSET_DESKTOP_TOUCH = {
  top: '13.2%',
  left: '14%',
  right: '15.1%',
  bottom: '14.3%',
}

const CONTENT_INSET_MOBILE = {
  top: '13.6%',
  left: '13.6%',
  right: '14.6%',
  bottom: '15.7%',
}

interface PhoneMockupProps {
  phoneRef: RefObject<HTMLDivElement>
  screenContainerRef: RefObject<HTMLDivElement>
  frontFaceRef: RefObject<HTMLDivElement>
  backFaceRef: RefObject<HTMLDivElement>
  article1Ref: RefObject<HTMLDivElement>
  article2Ref: RefObject<HTMLDivElement>
}

export default function PhoneMockup({
  phoneRef,
  screenContainerRef,
  frontFaceRef,
  backFaceRef,
  article1Ref,
  article2Ref,
}: PhoneMockupProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isCoarseTouchUi = useMediaQuery('(hover: none) and (pointer: coarse)')
  const inset = isMobile
    ? CONTENT_INSET_MOBILE
    : isCoarseTouchUi
      ? CONTENT_INSET_DESKTOP_TOUCH
      : CONTENT_INSET_DESKTOP

  // Preload/decode screen assets so hero mockup appears quickly on mobile.
  useEffect(() => {
    const urls = ['/images/front_1.webp', '/images/front_2.webp', '/images/back_signals.webp']
    urls.forEach((url) => {
      const img = new Image()
      img.src = url
      if ('decode' in img) {
        img.decode().catch(() => {})
      }
    })
  }, [])

  return (
    <div
      ref={phoneRef}
      className="relative w-[250px] min-w-[250px] shrink-0 sm:w-[300px] sm:min-w-[300px] md:w-[360px] md:min-w-[360px] lg:w-[380px] lg:min-w-[380px] origin-center"
      style={{ perspective: 1000 }}
    >
      <div className="relative w-full aspect-[9/19] max-h-[min(65vh,730px)] sm:max-h-[min(74vh,640px)] md:max-h-[min(78vh,680px)]">
        <img
          src="/images/mockup_frame.webp"
          alt="Phone"
          className="absolute inset-0 w-full h-full object-contain object-center select-none pointer-events-none"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          draggable={false}
        />

        {/* Content area: no rounded corners, sits inside mockup screen; inset from edges so it doesn’t overflow */}
        <div
          className="absolute overflow-hidden isolate bg-[#000]"
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
            className="relative w-full h-full overflow-hidden isolate z-10"
            style={{
              transformStyle: 'preserve-3d',
              position: 'relative',
              willChange: 'transform',
              contain: 'layout paint',
            }}
          >
            <div
              ref={frontFaceRef}
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)',
                WebkitTransform: 'rotateY(0deg)',
                transformStyle: 'preserve-3d',
                willChange: 'opacity, transform',
              }}
            >
              <div
                ref={article1Ref}
                className="absolute inset-0"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <img
                  src="/images/front_1.webp"
                  alt="Article 1"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                />
              </div>
              <div
                ref={article2Ref}
                className="absolute inset-0 opacity-0 pointer-events-none"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <img
                  src="/images/front_2.webp"
                  alt="Article 2"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                />
              </div>
            </div>

            <div
              ref={backFaceRef}
              className="absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)',
                WebkitTransform: 'rotateY(0deg)',
                transformStyle: 'preserve-3d',
                willChange: 'opacity, transform',
              }}
            >
              <img
                src="/images/back_signals.webp"
                alt="Vedlik Signals"
                className="w-full h-full object-cover object-top"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

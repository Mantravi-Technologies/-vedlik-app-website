import { useEffect, type RefObject } from 'react'
import { useMediaQuery } from './useMediaQuery'

/**
 * Portal insets are **% of the full mockup `<img>` box** (`w-full h-auto`). If `mockup_frame.webp` has extra **transparent
 * padding** (common for shadows), that space is inside the box too—so the same % for top/bottom as for left/right can
 * misalign the “glass” vertically. **Left/right** can still look fine while **top/bottom** bleed or gap.
 *
 * **Fix (asset):** crop the frame so the bitmap hugs the hardware (best). **Fix (CSS):** bump **only** `top`/`bottom`
 * until the portal sits on the real bezel; keep `left`/`right` if they already match.
 *
 * Feed uses **background-size: cover** (no transform scale) + `overflow-hidden` on the frame stack.
 */
/** Desktop — larger top/bottom vs left/right to offset vertical transparent padding in the frame asset */
const CONTENT_INSET_DESKTOP = {
  top: '10.5%',
  left: '13%',
  right: '14.5%',
  bottom: '13.5%',
}

const CONTENT_INSET_DESKTOP_TOUCH = {
  top: '12%',
  left: '13.1%',
  right: '15.1%',
  bottom: '13.5%',
}

const CONTENT_INSET_MOBILE = {
  top: '10.5%',
  left: '15.6%',
  right: '16.7%',
  bottom: '13.5%',
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
    <div className="relative mx-auto w-[85%] max-w-[min(320px,100%)] min-w-0 shrink overflow-hidden perspective-[1000px] sm:max-w-[340px] md:max-w-[360px] lg:max-w-[380px]">
      <div ref={phoneRef} className="relative w-full min-w-0 overflow-hidden [transform-style:preserve-3d]">
        <div className="relative w-full min-w-0 overflow-hidden">
          <img
            src="/images/mockup_frame.webp"
            alt="Phone"
            className="relative z-0 block h-auto w-full min-w-0 select-none pointer-events-none"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
          />

          <div
            className="absolute z-10 min-h-0 min-w-0 overflow-hidden rounded-none bg-black"
            style={{
              top: inset.top,
              left: inset.left,
              right: inset.right,
              bottom: inset.bottom,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
              clipPath: 'inset(0)',
              WebkitClipPath: 'inset(0)',
            }}
          >
            <div
              className="h-full min-h-0 min-w-0 w-full max-w-full overflow-hidden"
              style={{
                transform: 'scale(1)',
                WebkitTransform: 'scale(1)',
                transformOrigin: 'center center',
              }}
            >
              <div
                ref={screenContainerRef}
                className="relative z-10 h-full min-h-0 min-w-0 w-full max-w-full overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  position: 'relative',
                  willChange: 'transform',
                }}
              >
                <div
                  ref={frontFaceRef}
                  className="absolute inset-0 min-h-0 min-w-0 max-w-full overflow-hidden"
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
                    role="img"
                    aria-label="Article preview in Vedlik feed"
                    className="absolute inset-0 min-h-0 min-w-0 max-w-full overflow-hidden bg-black bg-no-repeat"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      backgroundImage: 'url(/images/front_1.webp)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center center',
                    }}
                  />
                  <div
                    ref={article2Ref}
                    role="img"
                    aria-label="Second article preview in Vedlik feed"
                    className="pointer-events-none absolute inset-0 min-h-0 min-w-0 max-w-full overflow-hidden bg-black bg-no-repeat opacity-0"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      backgroundImage: 'url(/images/front_2.webp)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center center',
                    }}
                  />
                </div>

                <div
                  ref={backFaceRef}
                  className="absolute inset-0 min-h-0 min-w-0 max-w-full overflow-hidden"
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
                    role="img"
                    aria-label="Vedlik Signals screen"
                    className="absolute inset-0 min-h-0 min-w-0 max-w-full overflow-hidden bg-black bg-no-repeat"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      backgroundImage: 'url(/images/back_signals.webp)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center top',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

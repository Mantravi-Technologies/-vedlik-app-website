import { useEffect, type RefObject } from 'react'

/**
 * Portal insets are % of the full mockup <img> box.
 * The frame image has transparent padding (shadow), so top/bottom insets
 * are slightly larger than left/right to align the glass portal with the bezel.
 */
const CONTENT_INSET = {
  top: '10.6%',
  left: '13%',
  right: '14.5%',
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
  useEffect(() => {
    const urls = ['/images/front_1.webp', '/images/front_2.webp', '/images/back_signals.webp']
    urls.forEach((url) => {
      const img = new Image()
      img.src = url
      if ('decode' in img) img.decode().catch(() => {})
    })
  }, [])

  return (
    /*
     * The phone always renders at a height proportional to the viewport.
     * Width is auto-derived from the image aspect ratio (720×1280 = 0.5625).
     * This means at every screen size, the phone takes the same % of screen height.
     *
     * max-h keeps it from being too large on ultra-wide screens.
     * The outer div is inline-flex so it shrinks to the image's natural width.
     */
    <div
      className="relative inline-flex shrink-0 overflow-hidden perspective-[1200px]"
      style={{ height: '100%', maxHeight: '88dvh' }}
    >
      <div
        ref={phoneRef}
        className="relative h-full overflow-hidden [transform-style:preserve-3d]"
      >
        {/* Frame image drives the layout — w-auto means width follows aspect ratio of height */}
        <div className="relative h-full w-auto inline-flex">
          <img
            src="/images/mockup_frame.webp"
            alt="Phone"
            width={720}
            height={1280}
            className="relative z-0 block h-full w-auto select-none pointer-events-none"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
          />

          {/* Screen portal — % insets relative to the image box above */}
          <div
            className="absolute z-10 overflow-hidden bg-black"
            style={{
              top: CONTENT_INSET.top,
              left: CONTENT_INSET.left,
              right: CONTENT_INSET.right,
              bottom: CONTENT_INSET.bottom,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
              clipPath: 'inset(0)',
              WebkitClipPath: 'inset(0)',
            }}
          >
            <div className="h-full w-full overflow-hidden">
              <div
                ref={screenContainerRef}
                className="relative z-10 h-full w-full overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
              >
                <div
                  ref={frontFaceRef}
                  className="absolute inset-0 overflow-hidden"
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
                    className="absolute inset-0 overflow-hidden bg-black"
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
                    className="pointer-events-none absolute inset-0 overflow-hidden bg-black opacity-0"
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
                  className="absolute inset-0 overflow-hidden"
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
                    className="absolute inset-0 overflow-hidden bg-black"
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

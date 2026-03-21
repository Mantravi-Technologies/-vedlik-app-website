import { useEffect, type RefObject } from 'react'
import { useMediaQuery } from './useMediaQuery'

/**
 * Customize the mockup (edit this file):
 *
 * 1) **Whole phone size** — `ref={phoneRef}` wrapper classes: `w-[85%]`, `max-w-[320px]`, `aspect-[430/932]`, breakpoints.
 *
 * 2) **Screen opening (position + size vs frame)** — `CONTENT_INSET_*` objects below (`top/left/right/bottom` as % of the
 *    aspect box). Nudge in DevTools until the portal matches the glass area of `mockup_frame.webp`.
 *
 * 3) **Screenshot inside the portal** — each `<img>` uses `object-cover` + `object-center` / `object-top` (back).
 *    Change to e.g. `object-[50%_20%]` (Tailwind arbitrary) or inline `style={{ objectPosition: 'center top' }}` to pan/zoom
 *    the image without changing assets. Use `object-contain` if you prefer letterboxing over cropping.
 *
 * Frame sits under the screen layer so opaque mockups don’t hide UI.
 *
 * Vertical bleed: avoid `transform-style: preserve-3d` on the same node as `overflow-hidden` (clips fail). 3D lives on `screenContainerRef` only.
 */
const CONTENT_INSET_DESKTOP = {
  top: '17.7%',
  left: '13%',
  right: '14.5%',
  bottom: '19.9%',
}

const CONTENT_INSET_DESKTOP_TOUCH = {
  top: '17.2%',
  left: '13.1%',
  right: '15.1%',
  bottom: '18.3%',
}

const CONTENT_INSET_MOBILE = {
  top: '10.6%',
  left: '14.6%',
  right: '15.7%',
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
    <div
      ref={phoneRef}
      className="relative mx-auto aspect-[430/932] w-[85%] max-w-[320px] min-h-0 max-h-full shrink-0 self-center overflow-hidden sm:max-w-[340px] md:max-w-[360px] lg:max-w-[380px]"
      style={{ perspective: 1000 }}
    >
      {/* Pillar 1: aspect-ratio parent drives both width and height together */}

      {/* Frame: sits UNDER the screen layer so an opaque mockup PNG cannot hide feed UI */}
      <img
        src="/images/mockup_frame.webp"
        alt="Phone"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-contain object-center"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        draggable={false}
      />

      {/* Screen portal: above frame so UI is never covered by mockup artwork */}
      <div
        className="absolute isolate z-10 overflow-hidden rounded-none bg-black"
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
          className="relative isolate z-10 h-full w-full overflow-hidden"
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
              className="absolute inset-0 min-h-0 overflow-hidden"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <img
                src="/images/front_1.webp"
                alt="Article 1"
                className="h-full min-h-0 w-full max-w-full object-cover object-center"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  maxHeight: '100%',
                }}
              />
            </div>
            <div
              ref={article2Ref}
              className="pointer-events-none absolute inset-0 min-h-0 overflow-hidden opacity-0"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <img
                src="/images/front_2.webp"
                alt="Article 2"
                className="h-full min-h-0 w-full max-w-full object-cover object-center"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  maxHeight: '100%',
                }}
              />
            </div>
          </div>

          <div
            ref={backFaceRef}
            className="absolute inset-0 min-h-0 overflow-hidden"
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
              className="h-full min-h-0 w-full max-w-full object-cover object-top"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                maxHeight: '100%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

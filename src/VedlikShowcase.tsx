import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Observer } from 'gsap/all'
import ScrollSection from './ScrollSection'
import StickyHeader from './StickyHeader'
import StickyFooter from './StickyFooter'
import CoreFeaturesSection from './CoreFeaturesSection'
import WaitlistModal from './WaitlistModal'

gsap.registerPlugin(Observer)

const ANIM_DURATION = 0.68
const SECTION_DURATION = 1.02
const FLIP_SWAP_POINT = 0.45

export default function VedlikShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroSectionRef = useRef<HTMLElement>(null)
  const sectionsWrapperRef = useRef<HTMLDivElement>(null)
  const text1Ref = useRef<HTMLDivElement>(null)
  const text2Ref = useRef<HTMLDivElement>(null)
  const text3Ref = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  const screenContainerRef = useRef<HTMLDivElement>(null)
  const frontFaceRef = useRef<HTMLDivElement>(null)
  const backFaceRef = useRef<HTMLDivElement>(null)
  const article1Ref = useRef<HTMLDivElement>(null)
  const article2Ref = useRef<HTMLDivElement>(null)
  const currentSection = useRef(0)
  const heroStep = useRef(0) // 0 -> article1, 1 -> article2, 2 -> flipped
  const isAnimating = useRef(false)
  const lastGestureAt = useRef(0)
  const lockUntil = useRef(0)
  const totalSections = 4
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)

  const openWaitlistModal = () => setIsWaitlistOpen(true)
  const closeWaitlistModal = () => setIsWaitlistOpen(false)

  useGSAP(
    () => {
      const section = heroSectionRef.current
      const container = containerRef.current
      const sectionsWrapper = sectionsWrapperRef.current
      const screenContainer = screenContainerRef.current
      const frontFace = frontFaceRef.current
      const backFace = backFaceRef.current
      const text1 = text1Ref.current
      const text2 = text2Ref.current
      const text3 = text3Ref.current
      const article1 = article1Ref.current
      const article2 = article2Ref.current

      if (
        !section ||
        !container ||
        !sectionsWrapper ||
        !screenContainer ||
        !frontFace ||
        !backFace ||
        !text1 ||
        !text2 ||
        !text3 ||
        !article1 ||
        !article2
      ) {
        return
      }

      const setHeroStepInstant = (step: number) => {
        heroStep.current = step
        if (step === 0) {
          gsap.set(text1, { opacity: 1, y: 0, filter: 'blur(0px)' })
          gsap.set(text2, { opacity: 0, y: 12, filter: 'blur(4px)' })
          gsap.set(text3, { opacity: 0, y: 12, filter: 'blur(4px)' })
          gsap.set(article1, { yPercent: 0, opacity: 1 })
          gsap.set(article2, { yPercent: 100, opacity: 0 })
          gsap.set(screenContainer, { rotateY: 0, force3D: true })
          gsap.set(frontFace, { opacity: 1 })
          gsap.set(backFace, { opacity: 0 })
        } else if (step === 1) {
          gsap.set(text1, { opacity: 0, y: -8, filter: 'blur(2px)' })
          gsap.set(text2, { opacity: 1, y: 0, filter: 'blur(0px)' })
          gsap.set(text3, { opacity: 0, y: 12, filter: 'blur(4px)' })
          gsap.set(article1, { yPercent: -100, opacity: 0 })
          gsap.set(article2, { yPercent: 0, opacity: 1 })
          gsap.set(screenContainer, { rotateY: 0, force3D: true })
          gsap.set(frontFace, { opacity: 1 })
          gsap.set(backFace, { opacity: 0 })
        } else {
          gsap.set(text1, { opacity: 0, y: -8, filter: 'blur(2px)' })
          gsap.set(text2, { opacity: 0, y: -8, filter: 'blur(2px)' })
          gsap.set(text3, { opacity: 1, y: 0, filter: 'blur(0px)' })
          gsap.set(article1, { yPercent: -100, opacity: 0 })
          gsap.set(article2, { yPercent: 0, opacity: 1 })
          gsap.set(screenContainer, { rotateY: 0, force3D: true })
          gsap.set(frontFace, { opacity: 0 })
          gsap.set(backFace, { opacity: 1 })
        }
      }

      const ease = 'power2.inOut'
      setHeroStepInstant(0)
      gsap.set(sectionsWrapper, { y: 0, force3D: true })
      window.dispatchEvent(new CustomEvent('vedlik:section-change', { detail: { sectionIndex: 0 } }))

      const getSectionOffset = (index: number) => -index * window.innerHeight

      const animateHeroNext = () => {
        if (heroStep.current === 0) {
          heroStep.current = 1
          gsap.timeline({
            defaults: { duration: ANIM_DURATION, ease },
            onComplete: () => {
              isAnimating.current = false
              lockUntil.current = performance.now() + 180
            },
          })
            .to(text1, { opacity: 0, y: -8, filter: 'blur(2px)', duration: ANIM_DURATION * 0.42 }, 0)
            .fromTo(
              text2,
              { opacity: 0, y: 14, filter: 'blur(4px)' },
              { opacity: 1, y: 0, filter: 'blur(0px)', duration: ANIM_DURATION * 0.48 },
              0
            )
            .to(article1, { yPercent: -100, opacity: 0 }, 0)
            .fromTo(article2, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1 }, 0)
          return
        }
        if (heroStep.current === 1) {
          heroStep.current = 2
          gsap.timeline({
            defaults: { duration: ANIM_DURATION, ease },
            onComplete: () => {
              isAnimating.current = false
              lockUntil.current = performance.now() + 180
            },
          })
            .to(text2, { opacity: 0, y: -8, filter: 'blur(2px)', duration: ANIM_DURATION * 0.42 }, 0)
            .fromTo(
              text3,
              { opacity: 0, y: 14, filter: 'blur(4px)' },
              { opacity: 1, y: 0, filter: 'blur(0px)', duration: ANIM_DURATION * 0.48 },
              0
            )
            .to(screenContainer, { rotateY: 90, force3D: true, duration: ANIM_DURATION * 0.5 }, 0)
            .to(frontFace, { opacity: 0, duration: 0.001 }, ANIM_DURATION * FLIP_SWAP_POINT)
            .to(backFace, { opacity: 1, duration: 0.001 }, ANIM_DURATION * FLIP_SWAP_POINT)
            .to(
              screenContainer,
              { rotateY: 0, force3D: true, duration: ANIM_DURATION * 0.5 },
              ANIM_DURATION * 0.5
            )
        }
      }

      const animateHeroPrev = () => {
        if (heroStep.current === 2) {
          heroStep.current = 1
          gsap.timeline({
            defaults: { duration: ANIM_DURATION, ease },
            onComplete: () => {
              isAnimating.current = false
              lockUntil.current = performance.now() + 180
            },
          })
            .to(text3, { opacity: 0, y: -8, filter: 'blur(2px)', duration: ANIM_DURATION * 0.42 }, 0)
            .fromTo(
              text2,
              { opacity: 0, y: 14, filter: 'blur(4px)' },
              { opacity: 1, y: 0, filter: 'blur(0px)', duration: ANIM_DURATION * 0.48 },
              0
            )
            .to(screenContainer, { rotateY: 90, force3D: true, duration: ANIM_DURATION * 0.5 }, 0)
            .to(backFace, { opacity: 0, duration: 0.001 }, ANIM_DURATION * FLIP_SWAP_POINT)
            .to(frontFace, { opacity: 1, duration: 0.001 }, ANIM_DURATION * FLIP_SWAP_POINT)
            .to(
              screenContainer,
              { rotateY: 0, force3D: true, duration: ANIM_DURATION * 0.5 },
              ANIM_DURATION * 0.5
            )
          return
        }
        if (heroStep.current === 1) {
          heroStep.current = 0
          gsap.timeline({
            defaults: { duration: ANIM_DURATION, ease },
            onComplete: () => {
              isAnimating.current = false
              lockUntil.current = performance.now() + 180
            },
          })
            .to(text2, { opacity: 0, y: -8, filter: 'blur(2px)', duration: ANIM_DURATION * 0.42 }, 0)
            .fromTo(
              text1,
              { opacity: 0, y: 14, filter: 'blur(4px)' },
              { opacity: 1, y: 0, filter: 'blur(0px)', duration: ANIM_DURATION * 0.48 },
              0
            )
            .to(article2, { yPercent: 100, opacity: 0 }, 0)
            .to(article1, { yPercent: 0, opacity: 1 }, 0)
        }
      }

      const gotoSection = (index: number) => {
        if (index < 0 || index >= totalSections || isAnimating.current) return
        isAnimating.current = true
        currentSection.current = index
        gsap.to(sectionsWrapper, {
          y: getSectionOffset(index),
          duration: SECTION_DURATION,
          ease: 'power3.inOut',
          force3D: true,
          onComplete: () => {
            isAnimating.current = false
            lockUntil.current = performance.now() + 220
            window.dispatchEvent(new CustomEvent('vedlik:section-change', { detail: { sectionIndex: index } }))
          },
        })
      }

      const navigateToSection = (target: number) => {
        if (isAnimating.current) return
        const clamped = Math.max(0, Math.min(totalSections - 1, target))
        if (clamped === currentSection.current) return

        if (clamped === 0) {
          // Going to overview should always show first hero state.
          setHeroStepInstant(0)
          gotoSection(0)
          return
        }

        // If navigating away from hero, ensure hero is in completed state first.
        if (currentSection.current === 0 && heroStep.current < 2) {
          setHeroStepInstant(2)
        }
        gotoSection(clamped)
      }

      const goNext = () => {
        const now = performance.now()
        if (now - lastGestureAt.current < 205) return
        if (now < lockUntil.current) return
        if (isAnimating.current) return
        lastGestureAt.current = now
        if (currentSection.current === 0) {
          if (heroStep.current < 2) {
            isAnimating.current = true
            animateHeroNext()
            return
          }
          gotoSection(1)
          return
        }
        gotoSection(currentSection.current + 1)
      }

      const goPrev = () => {
        const now = performance.now()
        if (now - lastGestureAt.current < 205) return
        if (now < lockUntil.current) return
        if (isAnimating.current) return
        lastGestureAt.current = now
        if (currentSection.current === 0) {
          if (heroStep.current > 0) {
            isAnimating.current = true
            animateHeroPrev()
          }
          return
        }
        const target = currentSection.current - 1
        if (target === 0) {
          // Re-enter hero at completed state; further upward gestures reverse hero steps.
          setHeroStepInstant(2)
        }
        gotoSection(target)
      }

      const observer = Observer.create({
        target: container,
        type: 'wheel,touch',
        wheelSpeed: -1,
        tolerance: 16,
        preventDefault: true,
        lockAxis: true,
        // Let Core Features carousel always use native gestures.
        ignore: '[data-vedlik-carousel], [data-vedlik-carousel] *',
        ignoreCheck: (event) => {
          const target = event.target
          return target instanceof Element ? Boolean(target.closest('[data-vedlik-carousel]')) : false
        },
        onDown: goPrev,
        onUp: goNext,
      })

      const previousBodyOverflow = document.body.style.overflow
      const previousHtmlOverflow = document.documentElement.style.overflow
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'

      const handleResize = () => {
        gsap.set(sectionsWrapper, { y: getSectionOffset(currentSection.current), force3D: true })
      }
      window.addEventListener('resize', handleResize)

      const handleNavigate = (e: Event) => {
        const custom = e as CustomEvent<{ sectionIndex?: number }>
        if (typeof custom.detail?.sectionIndex !== 'number') return
        navigateToSection(custom.detail.sectionIndex)
      }
      window.addEventListener('vedlik:navigate', handleNavigate as EventListener)

      return () => {
        observer.kill()
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('vedlik:navigate', handleNavigate as EventListener)
        document.body.style.overflow = previousBodyOverflow
        document.documentElement.style.overflow = previousHtmlOverflow
      }
    },
    { dependencies: [], scope: containerRef }
  )

  return (
    <div ref={containerRef} className="h-screen w-full overflow-hidden overscroll-none bg-[#000] text-white">
      <StickyHeader />
      <main className="h-screen w-full relative overflow-hidden">
        <div ref={sectionsWrapperRef} className="w-full absolute inset-0 will-change-transform" style={{ height: `${totalSections * 100}dvh` }}>
          <ScrollSection
            sectionRef={heroSectionRef}
            text1Ref={text1Ref}
            text2Ref={text2Ref}
            text3Ref={text3Ref}
            phoneRef={phoneRef}
            screenContainerRef={screenContainerRef}
            frontFaceRef={frontFaceRef}
            backFaceRef={backFaceRef}
            article1Ref={article1Ref}
            article2Ref={article2Ref}
            onJoinWaitlist={openWaitlistModal}
          />
          <section className="vedlik-mobile-section relative flex items-center border-t border-white/[0.08] bg-[#000] px-4 sm:px-6 md:px-10 lg:px-12 md:pt-0 md:pb-0 md:h-[100dvh] md:min-h-[100dvh] overflow-hidden">
            <picture>
              <source media="(max-width: 768px)" srcSet="/images/hero_gradient_34-960.webp" type="image/webp" />
              <source media="(min-width: 769px)" srcSet="/images/hero_gradient_34-1600.webp" type="image/webp" />
              <img
                src="/images/hero_gradient_34.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-[86%_88%] md:object-center opacity-70 md:opacity-55 pointer-events-none"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div className="absolute inset-0 bg-black/28 md:bg-black/45 pointer-events-none" />
            <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-[1.25fr_1fr] gap-4 sm:gap-8 md:gap-14 items-start">
              <div>
                <p className="text-[#2DD4BF] text-xs sm:text-sm tracking-[0.14em] uppercase">Why Vedlik</p>
                <h2 className="mt-2 sm:mt-3 text-[1.9rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[0.95]">
                  Less noise. Faster insight.
                </h2>
                <p className="mt-2.5 sm:mt-5 text-white/70 text-[0.98rem] sm:text-lg md:text-xl leading-relaxed max-w-2xl">
                  Most tech coverage buries the important part. Vedlik is built for people who need to understand what changed,
                  why it matters, and what to do next.
                </p>
              </div>
              <div className="border-l border-white/[0.12] pl-4 sm:pl-6 md:pl-8">
                <p className="text-[#2DD4BF] text-[11px] tracking-[0.14em] uppercase">Designed For</p>
                <div className="mt-2.5 sm:mt-4 space-y-2.5 sm:space-y-5">
                  <div>
                    <p className="text-white text-sm font-semibold">Developers & Engineers</p>
                    <p className="mt-1 text-white/60 text-xs sm:text-sm leading-relaxed">Breaking changes, API pricing, and source links without marketing filler.</p>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Founders & Investors</p>
                    <p className="mt-1 text-white/60 text-xs sm:text-sm leading-relaxed">Funding, M&amp;A, and startup category shifts that change strategy.</p>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Students & Tech Grads</p>
                    <p className="mt-1 text-white/60 text-xs sm:text-sm leading-relaxed">Clear explanations of AI concepts that actually help in interviews and projects.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <CoreFeaturesSection />
          <section className="vedlik-mobile-section relative flex min-h-0 flex-col border-t border-white/[0.08] bg-[#000] md:h-[100dvh] md:min-h-[100dvh] overflow-hidden">
            <img
              src="/images/section_4_bg.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-[86%_88%] md:object-center opacity-68 md:opacity-52 pointer-events-none"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-black/30 md:bg-black/46 pointer-events-none" />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-5 sm:px-6 sm:py-6 md:px-10 lg:px-12 md:py-8">
                <div className="max-w-6xl w-full mx-auto">
                  <p className="text-[#2DD4BF] text-xs sm:text-sm tracking-[0.14em] uppercase">Why People Trust Vedlik</p>
                  <h2 className="mt-2 sm:mt-3 text-[1.9rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[0.95] max-w-4xl">
                    Clarity you can trust.
                  </h2>
                  <div className="mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-6 md:gap-8">
                    <div>
                      <p className="text-white text-sm font-semibold">No clickbait, no fluff</p>
                      <p className="mt-2 text-white/60 text-xs sm:text-sm leading-relaxed">You get the point in seconds with concise, useful summaries instead of endless noise.</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Facts before opinions</p>
                      <p className="mt-2 text-white/60 text-xs sm:text-sm leading-relaxed">Every story is broken into key facts and takeaways so you can understand impact quickly.</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Built for daily decisions</p>
                      <p className="mt-2 text-white/60 text-xs sm:text-sm leading-relaxed">From developers to founders, Vedlik helps you stay informed and act with confidence.</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-9 flex flex-row items-center gap-3 sm:gap-5">
                    <button type="button" onClick={openWaitlistModal} className="inline-flex w-[44%] sm:w-auto">
                      <img
                        src="/images/app_store_badge.png"
                        alt="Download on the App Store"
                        className="h-auto w-full sm:w-auto sm:h-14 md:h-16 lg:h-[72px] object-contain"
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                    <button type="button" onClick={openWaitlistModal} className="inline-flex w-[44%] sm:w-auto">
                      <img
                        src="/images/google_play_badge.png"
                        alt="Get it on Google Play"
                        className="h-auto w-full sm:w-auto sm:h-14 md:h-16 lg:h-[72px] object-contain"
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  </div>
                </div>
              </div>
              <StickyFooter />
            </div>
          </section>
        </div>
      </main>
      <WaitlistModal isOpen={isWaitlistOpen} onClose={closeWaitlistModal} />
    </div>
  )
}

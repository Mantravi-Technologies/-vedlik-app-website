import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Observer } from 'gsap/all'
import ScrollSection from './ScrollSection'
import StickyHeader from './StickyHeader'
import StickyFooter from './StickyFooter'

gsap.registerPlugin(Observer)

const ANIM_DURATION = 0.72
const SECTION_DURATION = 1.08
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
        if (now - lastGestureAt.current < 220) return
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
        if (now - lastGestureAt.current < 220) return
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
        tolerance: 18,
        preventDefault: true,
        lockAxis: true,
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
    <div ref={containerRef} className="h-screen w-full overflow-hidden overscroll-none touch-none bg-[#000] text-white">
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
          />
          <section className="relative h-[100dvh] min-h-[100dvh] flex items-center border-t border-white/[0.08] bg-[#000] px-4 sm:px-6 md:px-10 lg:px-12 pt-16 sm:pt-[4.5rem] md:pt-0 pb-14 sm:pb-16 md:pb-0 overflow-hidden">
            <picture>
              <source media="(max-width: 768px)" srcSet="/images/hero_gradient_34-960.webp" type="image/webp" />
              <source media="(min-width: 769px)" srcSet="/images/hero_gradient_34-1600.webp" type="image/webp" />
              <img
                src="/images/hero_gradient_34.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-[86%_88%] md:object-center opacity-70 md:opacity-55 pointer-events-none"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
            <div className="absolute inset-0 bg-black/28 md:bg-black/45 pointer-events-none" />
            <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-[1.25fr_1fr] gap-6 sm:gap-8 md:gap-14 items-start">
              <div>
                <p className="text-[#2DD4BF] text-xs sm:text-sm tracking-[0.14em] uppercase">Why Vedlik</p>
                <h2 className="mt-2 sm:mt-3 text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[0.95]">
                  Less noise. Faster signal.
                </h2>
                <p className="mt-3 sm:mt-5 text-white/70 text-[1.02rem] sm:text-lg md:text-xl leading-relaxed max-w-2xl">
                  Most tech coverage buries the important part. Vedlik is built for people who need to understand what changed,
                  why it matters, and what to do next.
                </p>
              </div>
              <div className="border-l border-white/[0.12] pl-4 sm:pl-6 md:pl-8">
                <p className="text-[#2DD4BF] text-[11px] tracking-[0.14em] uppercase">Designed For</p>
                <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-5">
                  <div>
                    <p className="text-white text-sm font-semibold">Developers & Engineers</p>
                    <p className="mt-1 text-white/60 text-xs sm:text-sm leading-relaxed">Breaking changes, API pricing, and source links without marketing filler.</p>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Founders & Investors</p>
                    <p className="mt-1 text-white/60 text-xs sm:text-sm leading-relaxed">Signals around funding, M&amp;A, and category shifts that change strategy.</p>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Students & Tech Grads</p>
                    <p className="mt-1 text-white/60 text-xs sm:text-sm leading-relaxed">Clear explanations of AI concepts that actually help in interviews and projects.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="h-[100dvh] min-h-[100dvh] flex items-start md:items-center border-t border-white/[0.08] bg-[#0a0a0a] px-4 sm:px-6 md:px-10 lg:px-12 pt-16 sm:pt-[4.5rem] md:pt-0 pb-14 sm:pb-16 md:pb-0">
            <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-4 sm:gap-6 md:gap-12 items-start md:items-center">
              <div>
              <p className="text-[#2DD4BF] text-xs sm:text-sm tracking-[0.14em] uppercase">Core Features</p>
              <h2 className="mt-2 text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[0.95]">
                Four ways to read smarter.
              </h2>
              <div className="mt-4 sm:mt-8 divide-y divide-white/[0.12] border-t border-b border-white/[0.12]">
                <div className="py-2.5 sm:py-5 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1.5 sm:gap-3 md:gap-6">
                  <p className="text-white/45 text-xs sm:text-sm tracking-[0.08em] uppercase">01 — Intelligence Flip</p>
                  <p className="text-white/80 text-[0.97rem] sm:text-base leading-relaxed">Tap a card and flip into extracted metrics: model size, valuation, hardware footprint, and licensing.</p>
                </div>
                <div className="py-2.5 sm:py-5 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1.5 sm:gap-3 md:gap-6">
                  <p className="text-white/45 text-xs sm:text-sm tracking-[0.08em] uppercase">02 — Knowledge Engine</p>
                  <p className="text-white/80 text-[0.97rem] sm:text-base leading-relaxed">Highlight a technical term and get a plain-language definition without leaving the feed.</p>
                </div>
                <div className="py-2.5 sm:py-5 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1.5 sm:gap-3 md:gap-6">
                  <p className="text-white/45 text-xs sm:text-sm tracking-[0.08em] uppercase">03 — Anti-Fluff Feed</p>
                  <p className="text-white/80 text-[0.97rem] sm:text-base leading-relaxed">Short summaries that preserve the signal and remove repetitive narrative.</p>
                </div>
                <div className="py-2.5 sm:py-5 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1.5 sm:gap-3 md:gap-6">
                  <p className="text-white/45 text-xs sm:text-sm tracking-[0.08em] uppercase">04 — Intel Library</p>
                  <p className="text-white/80 text-[0.97rem] sm:text-base leading-relaxed">Bookmark key updates and build a personal research trail you can return to fast.</p>
                </div>
              </div>
              </div>
              <div className="w-full flex items-start justify-center md:justify-end -mt-8 sm:-mt-3 md:mt-0 pt-0">
                <img
                  src="/images/vedlik_mockup_2.png"
                  alt="Vedlik app mockup"
                  className="w-auto h-[35vh] sm:h-[58vh] md:h-[78vh] lg:h-[84vh] max-w-full object-contain object-center select-none pointer-events-none mix-blend-screen"
                  draggable={false}
                />
              </div>
            </div>
          </section>
          <section className="relative h-[100dvh] min-h-[100dvh] flex items-center border-t border-white/[0.08] bg-[#000] px-4 sm:px-6 md:px-10 lg:px-12 pt-16 sm:pt-[4.5rem] md:pt-0 pb-14 sm:pb-16 md:pb-0 overflow-hidden">
            <img
              src="/images/section_4_bg.png"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-[86%_88%] md:object-center opacity-68 md:opacity-52 pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/30 md:bg-black/46 pointer-events-none" />
            <div className="relative z-10 max-w-6xl w-full">
              <p className="text-[#2DD4BF] text-xs sm:text-sm tracking-[0.14em] uppercase">Why People Trust Vedlik</p>
              <h2 className="mt-2 sm:mt-3 text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[0.95] max-w-4xl">
                Clarity you can trust.
              </h2>
              <div className="mt-5 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                <div>
                  <p className="text-white text-sm font-semibold">No clickbait, no fluff</p>
                  <p className="mt-2 text-white/60 text-xs sm:text-sm leading-relaxed">You get the point in seconds with concise, useful summaries instead of endless noise.</p>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Facts before opinions</p>
                  <p className="mt-2 text-white/60 text-xs sm:text-sm leading-relaxed">Every story is broken into key facts and signals so you can understand impact quickly.</p>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Built for daily decisions</p>
                  <p className="mt-2 text-white/60 text-xs sm:text-sm leading-relaxed">From developers to founders, Vedlik helps you stay informed and act with confidence.</p>
                </div>
              </div>
              <div className="mt-5 sm:mt-9 flex flex-row items-center gap-3 sm:gap-5">
                <a href="#" className="inline-flex w-[44%] sm:w-auto">
                  <img
                    src="/images/app_store_badge.png"
                    alt="Download on the App Store"
                    className="h-auto w-full sm:w-auto sm:h-14 md:h-16 lg:h-[72px] object-contain"
                    draggable={false}
                  />
                </a>
                <a href="#" className="inline-flex w-[44%] sm:w-auto">
                  <img
                    src="/images/google_play_badge.png"
                    alt="Get it on Google Play"
                    className="h-auto w-full sm:w-auto sm:h-14 md:h-16 lg:h-[72px] object-contain"
                    draggable={false}
                  />
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <StickyFooter />
    </div>
  )
}

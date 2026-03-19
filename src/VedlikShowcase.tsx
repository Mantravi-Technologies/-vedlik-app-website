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
          gsap.set(text1, { opacity: 1 })
          gsap.set(text2, { opacity: 0 })
          gsap.set(text3, { opacity: 0 })
          gsap.set(article1, { yPercent: 0, opacity: 1 })
          gsap.set(article2, { yPercent: 100, opacity: 0 })
          gsap.set(screenContainer, { rotateY: 0, force3D: true })
          gsap.set(frontFace, { opacity: 1 })
          gsap.set(backFace, { opacity: 0 })
        } else if (step === 1) {
          gsap.set(text1, { opacity: 0 })
          gsap.set(text2, { opacity: 1 })
          gsap.set(text3, { opacity: 0 })
          gsap.set(article1, { yPercent: -100, opacity: 0 })
          gsap.set(article2, { yPercent: 0, opacity: 1 })
          gsap.set(screenContainer, { rotateY: 0, force3D: true })
          gsap.set(frontFace, { opacity: 1 })
          gsap.set(backFace, { opacity: 0 })
        } else {
          gsap.set(text1, { opacity: 0 })
          gsap.set(text2, { opacity: 0 })
          gsap.set(text3, { opacity: 1 })
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
            .to(text1, { opacity: 0, duration: ANIM_DURATION * 0.42 }, 0)
            .to(text2, { opacity: 1, duration: ANIM_DURATION * 0.42 }, 0)
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
            .to(text2, { opacity: 0, duration: ANIM_DURATION * 0.42 }, 0)
            .to(text3, { opacity: 1, duration: ANIM_DURATION * 0.42 }, 0)
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
            .to(text3, { opacity: 0, duration: ANIM_DURATION * 0.42 }, 0)
            .to(text2, { opacity: 1, duration: ANIM_DURATION * 0.42 }, 0)
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
            .to(text2, { opacity: 0, duration: ANIM_DURATION * 0.42 }, 0)
            .to(text1, { opacity: 1, duration: ANIM_DURATION * 0.42 }, 0)
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

      return () => {
        observer.kill()
        window.removeEventListener('resize', handleResize)
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
          <section className="h-screen min-h-[100dvh] flex items-center justify-center border-t border-white/[0.08] bg-[#000]">
            <p className="text-white/50 text-sm">Vedlik — News, Decoded.</p>
          </section>
          <section className="h-screen min-h-[100dvh] flex items-center justify-center border-t border-white/[0.08] bg-[#0a0a0a]">
            <p className="text-white/40 text-sm">One feed. One truth.</p>
          </section>
          <section className="h-screen min-h-[100dvh] flex items-center justify-center border-t border-white/[0.08] bg-[#000]">
            <p className="text-white/40 text-sm">Download Vedlik.</p>
          </section>
        </div>
      </main>
      <StickyFooter />
    </div>
  )
}

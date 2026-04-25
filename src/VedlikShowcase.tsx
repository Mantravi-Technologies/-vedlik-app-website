import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Observer } from 'gsap/all'
import ScrollSection from './ScrollSection'
import StickyHeader from './StickyHeader'
import StickyFooter from './StickyFooter'
import CoreFeaturesSection from './CoreFeaturesSection'
import FaqAccordion from './FaqAccordion'
import WaitlistModal from './WaitlistModal'

gsap.registerPlugin(Observer)

const ANIM_DURATION = 0.68
const SECTION_DURATION = 1.12
const FLIP_SWAP_POINT = 0.45
const SECTION_EASE = 'power4.inOut'
const CONTENT_SCROLL_DURATION = 0.88
const CONTENT_SCROLL_EASE = 'power3.inOut'

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
  const contentScrollRef = useRef<HTMLDivElement>(null)
  const whyVedlikRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const trustRef = useRef<HTMLElement>(null)
  const faqRef = useRef<HTMLElement>(null)
  const currentSection = useRef(0)
  const heroStep = useRef(0) // 0 -> article1, 1 -> article2, 2 -> flipped
  const isAnimating = useRef(false)
  const lastGestureAt = useRef(0)
  const lockUntil = useRef(0)
  const contentScrollTween = useRef<gsap.core.Tween | null>(null)
  const totalSections = 2
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
      const contentScroll = contentScrollRef.current
      const whyVedlikSection = whyVedlikRef.current
      const featuresSection = featuresRef.current
      const trustSection = trustRef.current
      const faqSection = faqRef.current

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
        !article2 ||
        !contentScroll ||
        !whyVedlikSection ||
        !featuresSection ||
        !trustSection ||
        !faqSection
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
      const contentBlocks: HTMLElement[] = [whyVedlikSection, featuresSection, trustSection, faqSection]

      const getBlockTops = () => contentBlocks.map((el) => el.offsetTop)

      /** 0=Why … 3=FAQ — which "page" the viewport is in (for wheel / nav). */
      const getActiveContentIndex = () => {
        const tops = getBlockTops()
        if (tops.length < 4) return 0
        const st = contentScroll.scrollTop
        const bias = contentScroll.clientHeight * 0.12
        let idx = 0
        for (let i = 0; i < 4; i += 1) {
          if (st + bias >= tops[i] - 2) idx = i
        }
        return idx
      }

      const parallaxLayers = Array.from(
        container.querySelectorAll<HTMLElement>('[data-vedlik-parallax-bg]')
      )
      const parallaxSetters = parallaxLayers.map((layer) =>
        gsap.quickTo(layer, 'y', { duration: 0.48, ease: 'power2.out' })
      )

      const updateContentParallax = () => {
        const scrollTop = contentScroll.scrollTop
        const viewportHeight = Math.max(contentScroll.clientHeight, 1)
        parallaxLayers.forEach((layer, index) => {
          const sectionRoot = layer.closest<HTMLElement>('[data-vedlik-parallax-root]')
          if (!sectionRoot) return
          const sectionStart = sectionRoot.offsetTop
          const progressRaw = (scrollTop - sectionStart + viewportHeight) / (viewportHeight * 2)
          const progress = Math.max(0, Math.min(1, progressRaw))
          const y = (progress - 0.5) * (20 + index * 6)
          parallaxSetters[index]?.(y)
        })
      }

      const setActiveTabFromContentScroll = () => {
        if (currentSection.current !== 1) return
        const active = getActiveContentIndex() + 1
        window.dispatchEvent(
          new CustomEvent('vedlik:section-change', { detail: { sectionIndex: active } })
        )
        updateContentParallax()
      }

      const animateContentToOffset = (y: number, tabIndex1Based: number) => {
        contentScrollTween.current?.kill()
        isAnimating.current = true
        contentScrollTween.current = gsap.to(contentScroll, {
          scrollTop: Math.max(0, y),
          duration: CONTENT_SCROLL_DURATION,
          ease: CONTENT_SCROLL_EASE,
          overwrite: 'auto',
          onUpdate: () => {
            updateContentParallax()
          },
          onComplete: () => {
            isAnimating.current = false
            contentScrollTween.current = null
            lockUntil.current = performance.now() + 200
            window.dispatchEvent(
              new CustomEvent('vedlik:section-change', { detail: { sectionIndex: tabIndex1Based } })
            )
            setActiveTabFromContentScroll()
          },
        })
      }

      const scrollToContentTab = (tabIndex1Based: number) => {
        const idx = Math.max(0, Math.min(3, tabIndex1Based - 1))
        const el = contentBlocks[idx]
        animateContentToOffset(el.offsetTop, tabIndex1Based)
      }

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

      const syncCurrentPanelFromTransform = () => {
        const y = Number(gsap.getProperty(sectionsWrapper, 'y'))
        const h = window.innerHeight || 1
        currentSection.current = Math.min(
          totalSections - 1,
          Math.max(0, Math.round(Math.abs(y) / h))
        )
      }

      const killHeroMotion = () => {
        gsap.killTweensOf([text1, text2, text3, article1, article2, screenContainer, frontFace, backFace])
      }

      const gotoSection = (index: number) => {
        if (index < 0 || index >= totalSections || isAnimating.current) return
        const fromIndex = currentSection.current
        isAnimating.current = true
        currentSection.current = index
        gsap.to(sectionsWrapper, {
          y: getSectionOffset(index),
          duration: SECTION_DURATION,
          ease: SECTION_EASE,
          force3D: true,
          onComplete: () => {
            isAnimating.current = false
            lockUntil.current = performance.now() + 220
            if (index === 1 && fromIndex === 0) {
              contentScrollTween.current?.kill()
              gsap.set(contentScroll, { scrollTop: 0 })
              updateContentParallax()
            }
            if (index === 0) {
              window.dispatchEvent(new CustomEvent('vedlik:section-change', { detail: { sectionIndex: 0 } }))
            } else {
              const activeSub = getActiveContentIndex() + 1
              window.dispatchEvent(
                new CustomEvent('vedlik:section-change', { detail: { sectionIndex: activeSub } })
              )
            }
          },
        })
      }

      let pendingContentTabNav: gsap.core.Tween | null = null

      const navigateToSection = (target: number) => {
        pendingContentTabNav?.kill()
        pendingContentTabNav = null
        contentScrollTween.current?.kill()
        contentScrollTween.current = null
        gsap.killTweensOf(sectionsWrapper)
        gsap.killTweensOf(contentScroll)
        killHeroMotion()
        syncCurrentPanelFromTransform()
        isAnimating.current = false

        const clamped = Math.max(0, Math.min(4, target))

        if (clamped === 0) {
          // Going to overview always shows the first hero state (also when already on section 0).
          setHeroStepInstant(0)
          if (currentSection.current !== 0) {
            gotoSection(0)
          } else {
            window.dispatchEvent(new CustomEvent('vedlik:section-change', { detail: { sectionIndex: 0 } }))
          }
          return
        }
        if (currentSection.current === 1) {
          scrollToContentTab(clamped)
          return
        }

        if (currentSection.current === 0 && heroStep.current < 2) {
          setHeroStepInstant(2)
        }
        if (currentSection.current !== 1) {
          gotoSection(1)
        }
        pendingContentTabNav = gsap.delayedCall(SECTION_DURATION + 0.02, () => {
          pendingContentTabNav = null
          scrollToContentTab(clamped)
        })
      }

      const goContentNext = () => {
        const idx = getActiveContentIndex()
        if (idx < 3) {
          const next = contentBlocks[idx + 1]
          animateContentToOffset(next.offsetTop, idx + 2)
        }
      }

      const goContentPrev = () => {
        const idx = getActiveContentIndex()
        const st = contentScroll.scrollTop
        if (idx === 0 && st <= 8) {
          setHeroStepInstant(2)
          gotoSection(0)
          return
        }
        if (idx > 0) {
          const prev = contentBlocks[idx - 1]
          animateContentToOffset(prev.offsetTop, idx)
          return
        }
        if (idx === 0 && st > 8) {
          animateContentToOffset(0, 1)
        }
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
        if (currentSection.current === 1) {
          goContentNext()
        }
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
        if (currentSection.current === 1) {
          goContentPrev()
        }
      }

      const observer = Observer.create({
        target: container,
        type: 'wheel,touch,pointer',
        wheelSpeed: -1,
        tolerance: 16,
        preventDefault: true,
        lockAxis: true,
        ignore: '[data-vedlik-carousel], [data-vedlik-carousel] *',
        ignoreCheck: (event) => {
          const target = event.target
          if (!(target instanceof Element)) return false
          if (target.closest('[data-vedlik-carousel]')) return true

          const mainScrollEl = target.closest('[data-vedlik-main-scroll]')
          const nestedScroll = target.closest('[data-vedlik-scrollable]')
          const isInsideFaqInner =
            nestedScroll &&
            mainScrollEl &&
            nestedScroll !== mainScrollEl &&
            mainScrollEl.contains(nestedScroll)

          // Wheel on main page (Why / Features / Trust / outer FAQ): one step per gesture — never native free-scroll.
          if (event instanceof WheelEvent && mainScrollEl && !isInsideFaqInner) {
            return false
          }

          const scrollRoot = target.closest('[data-vedlik-scrollable], [data-vedlik-main-scroll]') as HTMLElement | null
          if (!scrollRoot) return false

          const { scrollTop, scrollHeight, clientHeight } = scrollRoot
          const edge = 4
          const canScrollY = scrollHeight > clientHeight + 1

          // Wheel: pass through when FAQ inner (or other nested scroller) can still scroll in that direction.
          if (event instanceof WheelEvent) {
            if (!canScrollY) return false
            const atTop = scrollTop <= edge
            const atBottom = scrollTop + clientHeight >= scrollHeight - edge
            const dy = event.deltaY
            if (dy > 0 && !atBottom) return true
            if (dy < 0 && !atTop) return true
            return false
          }

          // Touch/pointer: pass through to let native scroll work.
          // Edge-based section navigation for touch is handled by the
          // separate touchstart/touchend listener below.
          if (event instanceof TouchEvent || event instanceof PointerEvent) {
            return true
          }

          return false
        },
        onDown: goPrev,
        onUp: goNext,
      })

      // Touch handler for [data-vedlik-scrollable]: let content scroll freely,
      // but fire section navigation when swiping past the top or bottom edge.
      const scrollables = container.querySelectorAll<HTMLElement>('[data-vedlik-scrollable], [data-vedlik-main-scroll]')
      let touchStartY = 0
      let touchStartScrollTop = 0
      let activeTouchScrollRoot: HTMLElement | null = null

      const onTouchStart = (e: TouchEvent) => {
        const target = e.target
        if (!(target instanceof Element)) return
        const root = target.closest<HTMLElement>('[data-vedlik-scrollable], [data-vedlik-main-scroll]')
        if (!root) return
        activeTouchScrollRoot = root
        touchStartY = e.touches[0].clientY
        touchStartScrollTop = root.scrollTop
      }

      const onTouchEnd = (e: TouchEvent) => {
        if (!activeTouchScrollRoot) return
        const root = activeTouchScrollRoot
        activeTouchScrollRoot = null

        const endY = e.changedTouches[0].clientY
        const dy = touchStartY - endY          // positive = swipe up (next), negative = swipe down (prev)
        const SWIPE_THRESHOLD = 40             // minimum px to count as intentional swipe

        if (Math.abs(dy) < SWIPE_THRESHOLD) return

        if (root.hasAttribute('data-vedlik-main-scroll')) {
          if (dy > 0) {
            goNext()
          } else {
            goPrev()
          }
          return
        }

        const { scrollHeight, clientHeight } = root
        const edge = 4
        const atTop = touchStartScrollTop <= edge
        const atBottom = touchStartScrollTop + clientHeight >= scrollHeight - edge

        if (dy > 0 && atBottom) {
          goNext()
        } else if (dy < 0 && atTop) {
          goPrev()
        }
      }

      scrollables.forEach((el) => {
        el.addEventListener('touchstart', onTouchStart, { passive: true })
        el.addEventListener('touchend', onTouchEnd, { passive: true })
      })
      contentScroll.addEventListener('scroll', setActiveTabFromContentScroll, { passive: true })
      updateContentParallax()

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
        pendingContentTabNav?.kill()
        pendingContentTabNav = null
        contentScrollTween.current?.kill()
        contentScrollTween.current = null
        observer.kill()
        scrollables.forEach((el) => {
          el.removeEventListener('touchstart', onTouchStart)
          el.removeEventListener('touchend', onTouchEnd)
        })
        contentScroll.removeEventListener('scroll', setActiveTabFromContentScroll)
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('vedlik:navigate', handleNavigate as EventListener)
        document.body.style.overflow = previousBodyOverflow
        document.documentElement.style.overflow = previousHtmlOverflow
      }
    },
    { dependencies: [], scope: containerRef }
  )

  return (
    <div className="h-screen w-full overflow-hidden overscroll-none bg-[#000] text-white">
      <StickyHeader />
      <main ref={containerRef} className="h-screen w-full relative overflow-hidden">
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
          <section className="relative flex h-[100dvh] min-h-[100dvh] flex-col border-t border-white/[0.08] bg-[#000]">
            <div
              ref={contentScrollRef}
              className="h-full flex-1 min-h-0 overflow-y-auto overscroll-y-contain"
              data-vedlik-main-scroll
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
            >
              <section ref={whyVedlikRef} data-vedlik-parallax-root className="vedlik-mobile-section relative flex flex-col justify-center min-h-[100dvh] border-b border-white/[0.08] bg-[#000]">
                <picture>
                  <source media="(max-width: 768px)" srcSet="/images/hero_gradient_34-960.webp" type="image/webp" />
                  <source media="(min-width: 769px)" srcSet="/images/hero_gradient_34-1600.webp" type="image/webp" />
                  <img
                    src="/images/hero_gradient_34.jpg"
                    alt=""
                    data-vedlik-parallax-bg
                    className="absolute inset-0 w-full h-full object-cover object-[86%_88%] md:object-center opacity-70 md:opacity-55 pointer-events-none will-change-transform"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <div className="absolute inset-0 bg-black/28 md:bg-black/45 pointer-events-none" />
                <div className="relative z-10 px-4 py-4 sm:px-6 sm:py-6 md:px-10 lg:px-12 md:py-0 w-full">
                  <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-[1.25fr_1fr] gap-5 sm:gap-8 md:gap-14 items-start">
                    <div>
                      <p className="text-[#2DD4BF] text-xs sm:text-sm tracking-[0.14em] uppercase">Why Vedlik</p>
                      <h2 className="mt-2 sm:mt-3 text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[0.95]">
                        Less noise. Faster insight.
                      </h2>
                      <p className="mt-2.5 sm:mt-5 text-white/70 text-[0.9rem] sm:text-lg md:text-xl leading-relaxed max-w-2xl">
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
                </div>
              </section>
              <section ref={featuresRef}>
                <CoreFeaturesSection />
              </section>
              <section ref={trustRef} data-vedlik-parallax-root className="vedlik-mobile-section relative flex min-h-0 flex-col border-t border-white/[0.08] bg-[#000]">
                <img
                  src="/images/section_4_bg.png"
                  alt=""
                  data-vedlik-parallax-bg
                  className="absolute inset-0 w-full h-full object-cover object-[86%_88%] md:object-center opacity-68 md:opacity-52 pointer-events-none will-change-transform"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/30 md:bg-black/46 pointer-events-none" />
                <div className="relative z-10 flex min-h-[100dvh] flex-1 flex-col">
                  <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-5 sm:px-6 sm:py-6 md:px-10 lg:px-12 md:py-8">
                    <div className="max-w-6xl w-full mx-auto">
                      <p className="text-[#2DD4BF] text-xs sm:text-sm tracking-[0.14em] uppercase">Why People Trust Vedlik</p>
                      <h2 className="mt-2 sm:mt-3 text-[1.9rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[0.95] max-w-4xl">
                        Clarity you can trust.
                      </h2>
                      <div className="mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-6 md:gap-8">
                        <div>
                          <p className="text-white text-sm font-semibold">No clickbait, no fluff</p>
                          <p className="mt-2 text-white/60 text-xs sm:text-sm leading-relaxed">You get the point in seconds with concise, bullet-point briefs instead of endless noise.</p>
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
                        <a href="https://apps.apple.com/in/app/vedlik-ai-tech-insights/id6761024663" target="_blank" rel="noreferrer" className="inline-flex w-[44%] sm:w-auto">
                          <img
                            src="/images/app_store_badge.png"
                            alt="Download on the App Store"
                            className="h-auto w-full sm:w-auto sm:h-14 md:h-16 lg:h-[72px] object-contain"
                            draggable={false}
                            loading="lazy"
                            decoding="async"
                          />
                        </a>
                        <a href="https://play.google.com/store/apps/details?id=com.mantravi.ai.briefing" target="_blank" rel="noreferrer" className="inline-flex w-[44%] sm:w-auto">
                          <img
                            src="/images/google_play_badge.png"
                            alt="Get it on Google Play"
                            className="h-auto w-full sm:w-auto sm:h-14 md:h-16 lg:h-[72px] object-contain"
                            draggable={false}
                            loading="lazy"
                            decoding="async"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section ref={faqRef} data-vedlik-parallax-root className="vedlik-mobile-section relative flex flex-col border-t border-white/[0.08] bg-[#030708] overflow-hidden">
                <div data-vedlik-parallax-bg className="absolute inset-0 bg-gradient-to-b from-[#0a1214]/90 to-[#000] pointer-events-none will-change-transform" aria-hidden />
                <div className="relative z-10 flex flex-col min-h-0 flex-1">
                  <div
                    className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 pt-3 pb-4 sm:px-6 sm:pt-4 md:px-10 lg:px-12 md:pt-[calc(4rem+2rem)] lg:pt-[calc(4rem+2.5rem)] md:pb-3"
                    data-vedlik-scrollable
                    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                  >
                    <div className="max-w-6xl w-full mx-auto pb-4">
                      <FaqAccordion />
                    </div>
                  </div>
                  <div className="relative z-10 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(new CustomEvent('vedlik:navigate', { detail: { sectionIndex: 0 } }))
                      }
                      className="absolute left-1/2 bottom-full z-20 mb-1.5 -translate-x-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.2] bg-[#0a1214]/95 text-[#2DD4BF] shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-colors hover:border-[#2DD4BF]/45 hover:bg-[#0f1a1c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]/50 md:h-12 md:w-12 md:mb-2"
                      aria-label="Back to overview"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 md:h-6 md:w-6"
                        aria-hidden
                      >
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    </button>
                    <StickyFooter />
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
      <WaitlistModal isOpen={isWaitlistOpen} onClose={closeWaitlistModal} />

      {/* SEO-only content: visually hidden, crawlable by search engines */}
      <div className="sr-only" aria-hidden="true">
        <h2>Latest AI Updates &amp; Tech News</h2>
        <p>
          Vedlik is your source for the latest AI updates, artificial intelligence news, and technology breakthroughs.
          Follow daily tech news including ChatGPT updates, OpenAI news, Google AI announcements, machine learning model
          releases, and generative AI tool launches — all in concise, source-backed briefs.
        </p>
        <h3>What's Covered</h3>
        <ul>
          <li>AI updates and artificial intelligence news — OpenAI, Claude, Google DeepMind, Anthropic, Meta AI, Mistral</li>
          <li>Tech news today — breaking technology news with context and attribution</li>
          <li>Startup funding rounds — venture capital, seed, Series A/B/C, and M&amp;A</li>
          <li>Machine learning news — model releases, benchmarks, and research</li>
          <li>Generative AI — image generation, video AI, LLMs, and code generation tools</li>
          <li>Technology policy and AI regulation news</li>
          <li>Developer tools, API changes, and platform updates</li>
          <li>Tech industry trends and emerging technology categories</li>
        </ul>
        <h3>Built For</h3>
        <ul>
          <li>Developers and software engineers tracking AI tools and APIs</li>
          <li>Startup founders and investors following tech funding news</li>
          <li>Students and tech graduates learning AI and machine learning</li>
          <li>Tech professionals staying current on industry trends</li>
        </ul>
        <p>
          Download the Vedlik app free on iOS and Android. Stay ahead of AI breakthroughs, technology trends, and
          startup news every day.
        </p>
      </div>
    </div>
  )
}

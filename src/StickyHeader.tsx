'use client'

import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react'
import gsap from 'gsap'

const TEAL = '#2DD4BF'

const TABS = ['Overview', 'Why Vedlik', 'Features', 'Under The Hood', 'FAQ']
/** Tab index → full-page section index (0 = hero … 4 = FAQ + footer) */
const SECTION_MAP = [0, 1, 2, 3, 4]
/** Section index → which tab is highlighted */
const SECTION_TO_TAB = [0, 1, 2, 3, 4]

export default function StickyHeader() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex
  const underlineRef = useRef<HTMLDivElement>(null)
  const navTrackRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const underlineAnimatedOnce = useRef(false)

  /** `offsetLeft` drifts vs painted flex layout after font swap / subpixel layout; use track‑relative geometry. */
  const measureUnderline = useCallback((): { left: number; width: number } | null => {
    const idx = activeIndexRef.current
    const btn = tabsRef.current[idx]
    const track = navTrackRef.current
    if (!btn || !track) return null
    const trackRect = track.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    return {
      left: btnRect.left - trackRect.left + track.scrollLeft,
      width: btnRect.width,
    }
  }, [])

  const setUnderlineInstant = useCallback(() => {
    const underline = underlineRef.current
    const m = measureUnderline()
    if (!underline || !m) return
    gsap.set(underline, { left: m.left, width: m.width })
  }, [measureUnderline])

  const animateUnderline = useCallback(() => {
    const underline = underlineRef.current
    const m = measureUnderline()
    if (!underline || !m) return
    if (!underlineAnimatedOnce.current) {
      gsap.set(underline, { left: m.left, width: m.width })
      underlineAnimatedOnce.current = true
      return
    }
    gsap.to(underline, {
      left: m.left,
      width: m.width,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [measureUnderline])

  useLayoutEffect(() => {
    animateUnderline()
  }, [activeIndex, animateUnderline])

  useEffect(() => {
    const onLayout = () => setUnderlineInstant()
    const ro = new ResizeObserver(onLayout)
    const track = navTrackRef.current
    if (track) ro.observe(track)
    // Tab intrinsic widths can change without the flex track’s box resizing (e.g. font swap).
    tabsRef.current.forEach((btn) => {
      if (btn) ro.observe(btn)
    })
    const mq = window.matchMedia('(min-width: 768px)')
    const onBp = () => requestAnimationFrame(onLayout)
    mq.addEventListener('change', onBp)
    window.addEventListener('resize', onLayout)
    void document.fonts?.ready?.then(onLayout)
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', onBp)
      window.removeEventListener('resize', onLayout)
    }
  }, [setUnderlineInstant])



  useEffect(() => {
    const onSectionChange = (e: Event) => {
      const custom = e as CustomEvent<{ sectionIndex?: number }>
      const sectionIndex = custom.detail?.sectionIndex
      if (typeof sectionIndex !== 'number') return
      const nextTab = SECTION_TO_TAB[sectionIndex] ?? 0
      setActiveIndex(nextTab)
    }

    window.addEventListener('vedlik:section-change', onSectionChange as EventListener)
    return () => window.removeEventListener('vedlik:section-change', onSectionChange as EventListener)
  }, [])

  const handleTabClick = (tabIndex: number) => {
    setActiveIndex(tabIndex)
    setIsMobileMenuOpen(false)
    window.dispatchEvent(
      new CustomEvent('vedlik:navigate', {
        detail: { sectionIndex: SECTION_MAP[tabIndex] ?? 0 },
      })
    )
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#000]"
      style={{ backgroundColor: '#000000' }}
    >
      <div className="flex items-center gap-1.5 sm:gap-3 px-3 sm:px-4 md:px-8 h-12 sm:h-14 md:h-16 min-h-0 w-full">
        <a href="/" className="flex items-center shrink-0 py-0.5">
          <img
            src="/images/vedlik_logo_header.png"
            alt="Vedlik"
            className="h-6 w-auto sm:h-7 md:h-8 object-contain"
            draggable={false}
          />
        </a>
        <nav className="hidden md:flex flex-1 min-w-0 justify-end overflow-hidden py-2">
          <div
            ref={navTrackRef}
            className="relative w-full flex items-center justify-end gap-2 sm:gap-4 md:gap-8 px-1 sm:px-2 md:min-w-max"
          >
            {TABS.map((label, i) => (
              <button
                key={label}
                ref={(el) => { tabsRef.current[i] = el }}
                type="button"
                onClick={() => handleTabClick(i)}
                className="relative py-2 text-[11px] sm:text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]/50 rounded"
                style={{
                  color: activeIndex === i ? TEAL : 'rgba(255,255,255,0.5)',
                }}
              >
                {label}
              </button>
            ))}
            <div
              ref={underlineRef}
              className="absolute bottom-0 h-0.5 rounded-full pointer-events-none"
              style={{ backgroundColor: TEAL }}
            />
          </div>
        </nav>
        <div className="flex-1 min-w-0 md:hidden" aria-hidden />
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden h-9 w-9 shrink-0 inline-flex items-center justify-center text-white/85 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <span className="flex flex-col items-center gap-1.5">
            <span className="h-[1.5px] w-4 rounded-full bg-current" />
            <span className="h-[1.5px] w-4 rounded-full bg-current" />
            <span className="h-[1.5px] w-4 rounded-full bg-current" />
          </span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />
          <aside className="absolute right-0 top-0 h-full w-[82vw] max-w-[320px] bg-[#050505] border-l border-white/[0.1] p-4 pt-5">
            <div className="flex items-center justify-between">
              <p className="text-white text-sm font-semibold">Menu</p>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-white/[0.18] bg-white/[0.03] text-white/85 hover:bg-white/[0.08] transition-colors"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <div className="mt-4 divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
              {TABS.map((label, i) => (
                <button
                  key={`mobile-${label}`}
                  type="button"
                  onClick={() => handleTabClick(i)}
                  className="w-full text-left py-3 text-sm font-medium"
                  style={{
                    color: activeIndex === i ? TEAL : 'rgba(255,255,255,0.75)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}

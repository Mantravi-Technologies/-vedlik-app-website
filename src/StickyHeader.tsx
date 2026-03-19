'use client'

import { useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'

const TEAL = '#2DD4BF'
const TABS = ['All', 'AI & ML', 'Startups', 'Markets', 'Tech']

export default function StickyHeader() {
  const [activeIndex, setActiveIndex] = useState(1)
  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex
  const underlineRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  const isFirstMount = useRef(true)
  useLayoutEffect(() => {
    const idx = activeIndexRef.current
    const activeEl = tabsRef.current[idx]
    const underline = underlineRef.current
    if (!activeEl || !underline) return
    if (isFirstMount.current) {
      underline.style.left = `${activeEl.offsetLeft}px`
      underline.style.width = `${activeEl.offsetWidth}px`
      isFirstMount.current = false
      const onResize = () => {
        const el = tabsRef.current[activeIndexRef.current]
        if (el && underlineRef.current) {
          underlineRef.current.style.left = `${el.offsetLeft}px`
          underlineRef.current.style.width = `${el.offsetWidth}px`
        }
      }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }
    gsap.to(underline, {
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [activeIndex])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#000]"
      style={{ backgroundColor: '#000000' }}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 md:px-8 h-12 sm:h-14 md:h-16 min-h-0">
        <a href="#" className="flex items-center gap-2 shrink-0">
          <span className="text-base sm:text-lg font-bold tracking-tight text-white">Vedlik</span>
        </a>
        <nav className="flex-1 min-w-0 flex justify-end sm:justify-center md:justify-end overflow-x-auto scrollbar-hide py-2 -mr-2 sm:mr-0">
          <div className="relative flex items-center gap-4 sm:gap-6 md:gap-8 min-w-max px-2">
            {TABS.map((label, i) => (
              <button
                key={label}
                ref={(el) => { tabsRef.current[i] = el }}
                type="button"
                onClick={() => setActiveIndex(i)}
                className="relative py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]/50 rounded"
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
      </div>
    </header>
  )
}

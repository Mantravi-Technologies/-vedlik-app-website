'use client'

const TEAL = '#2DD4BF'

export default function StickyFooter() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#000]"
      style={{ backgroundColor: '#000000' }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 md:px-8 py-3 sm:py-0 h-auto sm:h-14 md:h-16 sm:min-h-[3.5rem]">
        <p className="text-[10px] sm:text-xs text-white/40 text-center sm:text-left order-2 sm:order-1">© Vedlik. News, Decoded.</p>
        <div className="flex items-center gap-4 sm:gap-6 order-1 sm:order-2">
          <a href="#" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: TEAL }}>
            Privacy
          </a>
          <a href="#" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: TEAL }}>
            Terms
          </a>
        </div>
      </div>
    </footer>
  )
}

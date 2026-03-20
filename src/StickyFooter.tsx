'use client'

import SpaLink from './SpaLink'

const TEAL = '#2DD4BF'

export default function StickyFooter() {
  return (
    <footer
      className="relative w-full border-t border-white/[0.08] bg-[#000]"
      style={{ backgroundColor: '#000000' }}
    >
      <div className="relative flex items-center justify-between px-3 sm:px-4 md:px-8 py-2 h-10 sm:h-11 md:h-12">
        <p className="text-[9px] sm:text-[10px] md:text-xs text-white/45 text-left whitespace-nowrap pr-2">
          © Vedlik · AI &amp; tech intelligence
        </p>
        <a
          href="https://mantravi.com"
          target="_blank"
          rel="noreferrer"
          className="absolute left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] md:text-xs text-white/65 hover:text-white transition-colors whitespace-nowrap"
        >
          Powered by Mantravi
        </a>
        <div className="flex items-center gap-3 sm:gap-5">
          <SpaLink href="/privacy-policy" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: TEAL }}>
            Privacy
          </SpaLink>
          <SpaLink href="/terms-and-conditions" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: TEAL }}>
            Terms
          </SpaLink>
        </div>
      </div>
    </footer>
  )
}

'use client'

import SpaLink from './SpaLink'

const TEAL = '#2DD4BF'

const PRODUCT_HUNT_URL =
  'https://www.producthunt.com/products/vedlik-ai-tech-startup-intelligence?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-vedlik-ai-tech-startup-intelligence'
const PRODUCT_HUNT_IMG =
  'https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1123775&theme=light&t=1777047553818'
const PRODUCT_HUNT_IMG_ALT =
  'Vedlik - AI, Tech & Startup Intelligence - The pulse of AI & startups — 4 bullets, flip for signals | Product Hunt'

const NEXTGEN_URL =
  'https://www.nxgntools.com/tools/vedlik-ai-and-tech-insights?utm_source=vedlik-ai-and-tech-insights'
const NEXTGEN_IMG =
  'https://www.nxgntools.com/api/embed/vedlik-ai-and-tech-insights?type=FEATURED_ON&hideUpvotes=true'

const SHIPIT_URL = 'https://www.shipit.buzz/products/vedlik-ai-tech-insights?ref=badge'
const SHIPIT_IMG = 'https://www.shipit.buzz/api/products/vedlik-ai-tech-insights/badge?theme=light'

function badgeLinkClass() {
  return 'inline-flex shrink-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]/50'
}

function nextGenImgClass() {
  return 'block h-10 w-auto max-h-10 sm:h-11 sm:max-h-11 md:h-12 md:max-h-[48px] object-contain'
}

function shipitImgClass() {
  return 'block h-9 w-auto max-h-9 sm:h-10 sm:max-h-10 md:h-11 md:max-h-11 object-contain'
}

function productHuntImgClass() {
  return 'block h-8 w-auto max-h-8 max-w-[min(46vw,200px)] sm:h-9 sm:max-h-9 sm:max-w-[220px] md:h-10 md:max-h-10 md:max-w-[240px] object-contain object-left'
}

export default function StickyFooter() {
  return (
    <footer
      className="relative w-full border-t border-white/[0.08] bg-[#000]"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Desktop: taller bar, badges centered between copy and links */}
      <div className="hidden md:flex relative items-center justify-between px-8 py-4 min-h-[88px] lg:min-h-[92px] gap-4">
        <div className="text-left shrink-0 max-w-[30%] lg:max-w-[32%] flex flex-col gap-1">
          <p className="text-xs text-white/45 leading-snug">
            © Vedlik · AI &amp; tech intelligence
          </p>
          <a
            href="https://mantravi.com"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-white/65 hover:text-white transition-colors w-fit"
          >
            Powered by Mantravi
          </a>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-3 lg:gap-4 flex-wrap max-w-[min(72vw,640px)]">
          <a
            href={PRODUCT_HUNT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={badgeLinkClass()}
            aria-label="View Vedlik on Product Hunt"
          >
            <img
              src={PRODUCT_HUNT_IMG}
              alt={PRODUCT_HUNT_IMG_ALT}
              width={250}
              height={54}
              className={productHuntImgClass()}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </a>
          <a
            href={NEXTGEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={badgeLinkClass()}
            aria-label="Featured on NextGen Tools"
          >
            <img
              src={NEXTGEN_IMG}
              alt="Featured on NextGen Tools"
              className={nextGenImgClass()}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </a>
          <a
            href={SHIPIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={badgeLinkClass()}
            aria-label="Featured on Shipit"
          >
            <img
              src={SHIPIT_IMG}
              alt="Featured on Shipit"
              className={shipitImgClass()}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </a>
        </div>

        <div className="flex items-center gap-5 shrink-0 ml-auto">
          <SpaLink href="/privacy-policy" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: TEAL }}>
            Privacy
          </SpaLink>
          <SpaLink href="/terms-and-conditions" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: TEAL }}>
            Terms
          </SpaLink>
        </div>
      </div>

      {/* Mobile: extra vertical space + stacked badges */}
      <div className="md:hidden px-3 sm:px-4 pt-3 pb-3.5 sm:pt-3.5 sm:pb-4 min-h-[132px] sm:min-h-[140px] flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[9px] sm:text-[10px] text-white/45 text-left leading-snug pr-2">
            © Vedlik · AI &amp; tech intelligence
          </p>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <SpaLink href="/privacy-policy" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: TEAL }}>
              Privacy
            </SpaLink>
            <SpaLink href="/terms-and-conditions" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: TEAL }}>
              Terms
            </SpaLink>
          </div>
        </div>

        <a
          href="https://mantravi.com"
          target="_blank"
          rel="noreferrer"
          className="text-center text-[9px] sm:text-[10px] text-white/65 hover:text-white transition-colors"
        >
          Powered by Mantravi
        </a>

        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-0.5 border-t border-white/[0.06]">
          <a
            href={PRODUCT_HUNT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={badgeLinkClass()}
            aria-label="View Vedlik on Product Hunt"
          >
            <img
              src={PRODUCT_HUNT_IMG}
              alt={PRODUCT_HUNT_IMG_ALT}
              width={250}
              height={54}
              className={productHuntImgClass()}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </a>
          <a
            href={NEXTGEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={badgeLinkClass()}
            aria-label="Featured on NextGen Tools"
          >
            <img
              src={NEXTGEN_IMG}
              alt="Featured on NextGen Tools"
              className={nextGenImgClass()}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </a>
          <a
            href={SHIPIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={badgeLinkClass()}
            aria-label="Featured on Shipit"
          >
            <img
              src={SHIPIT_IMG}
              alt="Featured on Shipit"
              className={shipitImgClass()}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </a>
        </div>
      </div>
    </footer>
  )
}

const TEAL = '#2DD4BF'

const FEATURES = [
  {
    id: '01',
    title: 'Intelligence Flip',
    body: 'Tap a card and flip into extracted metrics: model size, valuation, hardware footprint, and licensing.',
  },
  {
    id: '02',
    title: 'Knowledge Engine',
    body: 'Highlight a technical term and get a plain-language definition without leaving the feed.',
  },
  {
    id: '03',
    title: 'Anti-Fluff Feed',
    body: 'Short summaries that preserve the signal and remove repetitive narrative.',
  },
  {
    id: '04',
    title: 'Intel Library',
    body: 'Bookmark key updates and build a personal research trail you can return to fast.',
  },
] as const

function FeatureCardItem({
  id,
  title,
  body,
  className = '',
}: {
  id: string
  title: string
  body: string
  className?: string
}) {
  return (
    <article
      className={`rounded-2xl border border-white/[0.09] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-3.5 sm:p-4 md:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-colors duration-300 md:hover:border-white/[0.14] ${className}`}
    >
      <span
        className="font-mono text-[10px] sm:text-xs tabular-nums tracking-tight opacity-90"
        style={{ color: TEAL }}
      >
        {id}
      </span>
      <h3 className="mt-1.5 text-[13px] sm:text-sm md:text-base font-semibold tracking-[-0.02em] text-white leading-snug">
        {title}
      </h3>
      <p className="mt-1.5 text-[11px] sm:text-xs md:text-[0.9375rem] text-white/55 leading-relaxed md:leading-relaxed line-clamp-4 md:line-clamp-none">
        {body}
      </p>
    </article>
  )
}

export default function CoreFeaturesSection() {
  return (
    <section className="vedlik-mobile-section relative flex flex-col border-t border-white/[0.06] bg-[#050505] px-0 md:px-10 lg:px-12 md:h-[100dvh] md:min-h-[100dvh] overflow-hidden">
      {/* Ambient layers */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-40%,rgba(45,212,191,0.11),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_100%_60%,rgba(99,102,241,0.06),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/50 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex h-full min-h-0 w-full flex-col px-4 pb-2 pt-0 sm:px-6 md:mx-auto md:max-w-[min(100%,1480px)] md:flex-row md:items-stretch md:gap-8 lg:gap-12 md:px-8 lg:px-6">
        {/* Copy + features */}
        <div className="flex min-h-0 w-full shrink-0 flex-col md:max-w-[min(100%,480px)] lg:max-w-[520px] md:flex-none md:justify-center md:py-2">
          <header className="shrink-0 md:pr-2">
            <p
              className="text-[10px] font-medium uppercase tracking-[0.24em] sm:text-[11px]"
              style={{ color: TEAL }}
            >
              Core features
            </p>
            <h2 className="mt-1 max-w-[16rem] text-[1.625rem] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:mt-2 sm:max-w-xl sm:text-3xl md:mt-3 md:max-w-none md:text-[2.375rem] lg:text-[2.75rem]">
              Four ways to read smarter.
            </h2>
            <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-white/45 sm:mt-2 sm:text-sm md:text-[0.9375rem] md:leading-relaxed">
              Precision tools for scanning signal—without the noise.
            </p>
          </header>

          {/* Mobile: horizontal snap row — frees vertical space for the device */}
          <div
            data-vedlik-carousel
            className="mt-3 flex min-h-0 touch-pan-x gap-2.5 overflow-x-auto overflow-y-visible overscroll-x-contain pb-1 pt-0.5 scrollbar-hide snap-x snap-mandatory sm:gap-3 md:hidden"
          >
            {FEATURES.map((f) => (
              <FeatureCardItem
                key={f.id}
                id={f.id}
                title={f.title}
                body={f.body}
                className="w-[min(82vw,300px)] shrink-0 snap-center sm:w-[min(78vw,320px)]"
              />
            ))}
          </div>

          {/* Desktop: bento grid */}
          <div className="mt-8 hidden grid-cols-2 gap-3 md:grid md:gap-4 lg:gap-5">
            {FEATURES.map((f) => (
              <FeatureCardItem key={f.id} id={f.id} title={f.title} body={f.body} />
            ))}
          </div>
        </div>

        {/* Device — mobile: hug top below carousel; desktop: fill column height */}
        <div className="relative mt-1 flex min-h-0 flex-1 flex-col items-center justify-start md:mt-0 md:min-h-0 md:flex-1 md:justify-center md:py-1 lg:py-2">
          <div
            className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-[min(55vw,240px)] w-[min(55vw,240px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl sm:top-1/2 sm:h-[min(50vw,280px)] sm:w-[min(50vw,280px)] md:top-1/2 md:h-[min(55vw,560px)] md:w-[min(55vw,560px)] md:opacity-90"
            style={{ background: `radial-gradient(circle, ${TEAL}33 0%, transparent 70%)` }}
            aria-hidden
          />
          <div className="relative z-10 flex w-full max-w-[min(92vw,320px)] shrink-0 items-start justify-center sm:max-w-[min(88vw,360px)] md:h-full md:max-h-none md:max-w-none md:min-h-0 md:flex-1 md:items-center md:px-2 lg:px-4">
            <img
              src="/images/vedlik_mockup_2.png"
              alt="Vedlik app on iPhone"
              className="h-auto w-full max-h-[min(36dvh,340px)] object-contain object-center drop-shadow-[0_28px_80px_rgba(0,0,0,0.75)] sm:max-h-[min(40dvh,400px)] md:max-h-[min(88dvh,920px)] md:max-w-[min(640px,58vw)] md:w-auto md:object-contain md:object-center"
              draggable={false}
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

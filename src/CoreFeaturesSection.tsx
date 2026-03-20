const TEAL = '#2DD4BF'

const FEATURES = [
  {
    id: '01',
    title: 'Intelligence Flip',
    tag: 'Analysis',
    body: 'Open any card into extracted metrics: model size, startup valuation, hardware footprint, and licensing.'
  },
  {
    id: '02',
    title: 'Knowledge Engine',
    tag: 'Context',
    body: 'Highlight AI or technology terms and get plain-language explanations without leaving the feed.'
  },
  {
    id: '03',
    title: 'Anti-Fluff Feed',
    tag: 'Speed',
    body: 'Concise briefs keep the core tech and funding detail while removing repetitive narrative.'
  },
  {
    id: '04',
    title: 'Intel Library',
    tag: 'Memory',
    body: 'Save AI industry and startup updates into a personal research trail you can reopen anytime.'
  },
] as const

function FeatureCardItem({
  id,
  title,
  tag,
  body,
  className = '',
}: {
  id: string
  title: string
  tag: string
  body: string
  className?: string
}) {
  return (
    <article
      className={[
        'group relative overflow-hidden rounded-2xl border border-white/[0.12]',
        'bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.01)_55%)]',
        'backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]',
        'transition-all duration-300 md:hover:-translate-y-0.5 md:hover:border-white/[0.22]',
        'p-4 sm:p-5',
        className,
      ].join(' ')}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#2DD4BF]/10 blur-2xl transition-opacity duration-300 md:group-hover:opacity-90" />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <span
            className="inline-flex h-6 min-w-[2.1rem] items-center justify-center rounded-full border border-[#2DD4BF]/40 bg-[#2DD4BF]/10 px-2 font-mono text-[10px] tracking-wide"
            style={{ color: TEAL }}
          >
            {id}
          </span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">{tag}</span>
        </div>

        <h3 className="mt-3 text-[1.02rem] font-semibold leading-tight tracking-[-0.02em] text-white">{title}</h3>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-white/62">{body}</p>
      </div>
    </article>
  )
}

export default function CoreFeaturesSection() {
  return (
    <section className="vedlik-mobile-section relative flex flex-col overflow-hidden border-t border-white/[0.07] bg-[#050607] px-0 md:h-[100dvh] md:min-h-[100dvh] md:px-10 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 15% -20%, rgba(45,212,191,0.14), transparent 45%), radial-gradient(75% 65% at 100% 45%, rgba(99,102,241,0.08), transparent 55%)',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/40 to-transparent" aria-hidden />

      <div className="relative z-10 flex h-full min-h-0 w-full flex-col px-3 pb-2 pt-0 sm:px-6 md:mx-auto md:max-w-[min(100%,1480px)] md:flex-row md:items-stretch md:gap-8 md:px-8 lg:gap-12 lg:px-6">
        <div className="flex min-h-0 w-full shrink-0 flex-col md:max-w-[min(100%,500px)] md:flex-none md:justify-center md:py-2 lg:max-w-[540px]">
          <header className="shrink-0 md:pr-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] sm:text-[11px]" style={{ color: TEAL }}>
              Core features
            </p>
            <h2 className="mt-1 max-w-[16rem] text-[1.625rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:mt-2 sm:max-w-xl sm:text-3xl md:mt-3 md:max-w-none md:text-[2.4rem] lg:text-[2.85rem]">
              Four ways to read smarter.
            </h2>
            <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-white/50 sm:mt-2 sm:text-sm md:text-[0.95rem] md:leading-relaxed">
              Built for AI, technology, startup, and funding intelligence with cleaner focus and less noise.
            </p>
          </header>

          {/* Mobile: premium horizontal cards with peek + snap */}
          <div
            data-vedlik-carousel
            className="mt-3 flex min-h-0 w-full touch-pan-x gap-3 overflow-x-auto overflow-y-visible overscroll-x-contain pb-1 pt-0.5 scrollbar-hide snap-x snap-mandatory md:hidden"
          >
            {FEATURES.map((f) => (
              <FeatureCardItem
                key={f.id}
                id={f.id}
                title={f.title}
                tag={f.tag}
                body={f.body}
                className="w-[88%] min-w-[88%] shrink-0 snap-center snap-always"
              />
            ))}
          </div>

          {/* Desktop: modern asymmetric grid */}
          <div className="mt-8 hidden grid-cols-2 gap-4 md:grid lg:gap-5">
            {FEATURES.map((f, idx) => (
              <FeatureCardItem
                key={f.id}
                id={f.id}
                title={f.title}
                tag={f.tag}
                body={f.body}
                className={idx % 2 === 0 ? 'md:-translate-y-1' : 'md:translate-y-2'}
              />
            ))}
          </div>
        </div>

        <div className="relative mt-0.5 flex min-h-0 flex-1 flex-col items-stretch md:mt-0 md:items-center md:justify-center md:py-1 lg:py-2">
          <div
            className="pointer-events-none absolute left-1/2 top-[45%] z-0 h-[min(74vw,340px)] w-[min(74vw,340px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-3xl sm:top-1/2 sm:h-[min(70vw,400px)] sm:w-[min(70vw,400px)] md:top-1/2 md:h-[min(58vw,600px)] md:w-[min(58vw,600px)] md:opacity-95"
            style={{ background: `radial-gradient(circle, ${TEAL}36 0%, transparent 70%)` }}
            aria-hidden
          />
          <div className="relative z-10 flex min-h-0 w-full flex-1 items-center justify-center px-0 sm:px-1 md:h-full md:min-h-0 md:flex-1 md:px-2 lg:px-4">
            <img
              src="/images/vedlik_mockup_2.png"
              alt="Vedlik app on iPhone"
              className="mx-auto h-auto max-h-full w-full max-w-[90vw] object-contain object-center drop-shadow-[0_28px_80px_rgba(0,0,0,0.75)] sm:max-w-[min(90vw,520px)] md:max-h-[min(88dvh,920px)] md:max-w-[min(560px,52vw)]"
              draggable={false}
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

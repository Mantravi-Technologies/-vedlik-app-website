import type { RefObject } from 'react'

interface ScreenBackProps {
  credibilityRef: RefObject<SVGCircleElement>
  sentimentRef: RefObject<HTMLDivElement>
  entitiesRef: RefObject<HTMLDivElement>
}

export default function ScreenBack({ credibilityRef, sentimentRef, entitiesRef }: ScreenBackProps) {
  return (
    <div className="absolute inset-0 rounded-[2.25rem] overflow-hidden bg-[#111]">
      {/* Your back_signals screenshot as main content */}
      <img
        src="/images/back_signals.png"
        alt="Vedlik AI Signals"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      {/* Optional: keep animated overlays on top so scroll reveal still works (credibility ring, sentiment bar, entities) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-16 px-4">
        <div className="relative flex justify-center mb-2">
          <svg className="w-16 h-16 -rotate-90 opacity-90" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="14" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
            <circle
              ref={credibilityRef}
              cx="18"
              cy="18"
              r="14"
              stroke="#2DD4BF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="88"
              strokeDashoffset="88"
              fill="none"
            />
          </svg>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden max-w-[80%] mx-auto">
          <div
            ref={sentimentRef}
            className="h-full rounded-full bg-[#2DD4BF]"
            style={{ width: '0%' }}
          />
        </div>
        <div ref={entitiesRef} className="flex flex-wrap gap-1.5 justify-center mt-2 opacity-0">
          {['Federal Reserve', 'Interest Rates', 'Markets'].map((entity) => (
            <span
              key={entity}
              className="px-2 py-0.5 rounded-full text-[9px] font-medium border border-[#2DD4BF] text-[#2DD4BF]"
            >
              {entity}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useMediaQuery } from './useMediaQuery'

const TEAL = '#2DD4BF'
const INTERVAL_MS = 2400

type HeroKeywordRotateProps = {
  /** Short labels; longest word reserves width so the line doesn’t jump. */
  words: readonly string[]
}

/**
 * Single-line rotating keyword strip (teal). Same footprint on mobile & desktop via invisible widest-word spacer.
 * Respects `prefers-reduced-motion`: shows all words joined, one line, no timer.
 */
export default function HeroKeywordRotate({ words }: HeroKeywordRotateProps) {
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const widest = useMemo(() => words.reduce((a, b) => (a.length >= b.length ? a : b), ''), [words])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (prefersReduced || words.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [prefersReduced, words.length])

  if (words.length === 0) return null

  const labelClass =
    'mt-1.5 sm:mt-2 w-full max-w-lg font-medium uppercase tracking-[0.14em] text-[10px] leading-none sm:text-[11px] md:text-xs text-center md:text-left mx-auto md:mx-0'

  if (prefersReduced) {
    return (
      <p className={`${labelClass} whitespace-nowrap text-ellipsis overflow-hidden`} style={{ color: TEAL }}>
        {words.join(' · ')}
      </p>
    )
  }

  return (
    <div className={`${labelClass} flex h-[1.35em] min-h-[1.35em] flex-none justify-center md:justify-start`}>
      <span className="relative inline-block max-w-full">
        <span className="invisible block select-none whitespace-nowrap" aria-hidden>
          {widest}
        </span>
        {words.map((word, idx) => (
          <span
            key={word}
            className={`absolute left-1/2 top-1/2 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 md:left-0 md:translate-x-0 ${
              idx === index ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            style={{ color: TEAL }}
            aria-hidden={idx !== index}
          >
            {word}
          </span>
        ))}
      </span>
    </div>
  )
}

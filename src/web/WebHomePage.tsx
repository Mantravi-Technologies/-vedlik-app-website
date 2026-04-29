import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  WEB_FALLBACK_IMAGE,
  listArticles,
  listCategories,
  type WebArticleSummary,
  type WebCategory,
} from './api'
import { applyPageSeo, removeJsonLd, upsertJsonLd } from './seo'
import {
  formatCategoryLabel,
  formatDisruptionScore,
  formatPublishedTime,
  formatSourceName,
  parseDisruptionScore,
  sanitizeWhyItMatters,
} from './formatters'

const BRAND = '#20b2aa'
/** Text on primary teal (matches “Install App” pill). */
const BRAND_ON = '#032a26'
const APP_STORE_URL = 'https://apps.apple.com/in/app/vedlik-ai-tech-insights/id6761024663'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.mantravi.ai.briefing'
const SITE_URL = 'https://vedlik.com'
const SURFACE_BASE = 'var(--vedlik-bg-base)'
const SURFACE_RAISED = 'var(--vedlik-bg-surface-1)'
const SURFACE_ELEVATED = 'var(--vedlik-bg-surface-2)'
const BORDER = 'var(--vedlik-border-subtle)'
const TEXT_PRIMARY = 'var(--vedlik-text-primary)'
const TEXT_SECONDARY = 'var(--vedlik-text-secondary)'
const CARD_BODY = 'var(--vedlik-card-body)'

/** Cropped Vedlik wordmarks: dark → light text / icon block; light theme → dark text, same teal. */
function VedlikWordmarkLink({ theme, className }: { theme: 'dark' | 'light'; className?: string }) {
  const src =
    theme === 'dark' ? '/brand/vedlik-wordmark-dark.png' : '/brand/vedlik-wordmark-light.png'
  return (
    <a
      href="/web"
      className={`inline-flex min-w-0 shrink-0 items-center ${className ?? ''}`}
      aria-label="Vedlik home"
    >
      <img
        src={src}
        alt=""
        decoding="async"
        loading="eager"
        className="h-7 w-auto max-w-[min(248px,70vw)] object-contain object-left md:h-8"
      />
    </a>
  )
}

/** CTA under header — same horizontal bounds as `main` / cards (not full-bleed on desktop). */
function SignalAppDownloadBanner() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 pt-3 md:px-6 md:pt-4">
      <aside
        className="w-full rounded-xl border border-black/10 shadow-sm"
        style={{ backgroundColor: BRAND }}
        role="complementary"
        aria-label="Download the Vedlik app for the full Signal breakdown"
      >
        <div className="flex w-full flex-col items-stretch gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 md:px-4 md:py-3.5">
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-center sm:justify-start sm:text-left">
          <span
            className="text-sm font-semibold leading-snug sm:text-[0.95rem] md:text-lg md:leading-snug lg:text-xl"
            style={{ color: BRAND_ON }}
          >
            See the full Signal breakdown on
          </span>
          <img
            src="/brand/vedlik-wordmark-light.png"
            alt="Vedlik"
            className="h-6 w-auto max-w-[min(220px,52vw)] object-contain object-bottom sm:h-7 md:h-9"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>
        <div className="flex shrink-0 flex-row flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-[46%] sm:max-w-none"
          >
            <img
              src="/images/app_store_badge.png"
              alt="Download on the App Store"
              className="h-9 w-auto object-contain sm:h-11 md:h-[3.25rem] lg:h-14"
              draggable={false}
              loading="lazy"
              decoding="async"
            />
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-[46%] sm:max-w-none"
          >
            <img
              src="/images/google_play_badge.png"
              alt="Get it on Google Play"
              className="h-9 w-auto object-contain sm:h-11 md:h-[3.25rem] lg:h-14"
              draggable={false}
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>
        </div>
      </aside>
    </div>
  )
}

type WebArticle = {
  id: string
  slug?: string
  title: string
  imageUrl: string
  articleUrl?: string
  author?: string
  uiCategory?: string
  source: string
  category: string
  whyItMatters: string[]
  publishedAt: string
  /** Normalized from API `disruptionScore` / `disruption_score` when present. */
  disruptionScore?: number
  canonicalUrl?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: string
  }
}

/** Build GET /articles query from the selected category row returned by listCategories() — no hardcoded uiCategory/sort. */
function articleListParamsFromCategorySelection(
  topicSlug: string | undefined,
  categories: WebCategory[],
  activeSlug: string,
): { uiCategory?: string; sort?: string; topic?: string } {
  if (topicSlug) return { topic: topicSlug }

  const row = categories.find((c) => c.slug === activeSlug)
  if (!row) return {}

  const uiCategory = row.uiCategory?.trim() || row.label?.trim()
  if (!uiCategory) return {}

  const sort = row.sort?.trim()
  return {
    uiCategory,
    ...(sort ? { sort } : {}),
  }
}

function clampText(input: string, maxLen: number) {
  if (input.length <= maxLen) return input
  return `${input.slice(0, maxLen - 1)}...`
}

/**
 * Native share payload: omit Signal URL from `text` — it is passed as `url` so clients don’t duplicate it.
 * Clipboard still embeds the URL in plain text (no structured URL field).
 */
function buildSignalShareBodyForNavigator(title: string): string {
  const t = title.trim()
  return [
    t,
    '',
    `Read this Signal with full context in the Vedlik app: ${SITE_URL}/app`,
  ].join('\n')
}

/** Full plaintext for clipboard fallback: headline, Signal URL, app link (each links once). */
function buildSignalShareTextForClipboard(title: string, shareUrl: string): string {
  const t = title.trim()
  return [
    t,
    '',
    shareUrl,
    '',
    `Read this Signal with full context in the Vedlik app: ${SITE_URL}/app`,
  ].join('\n')
}

function externalArticleUrlFrom(article: WebArticle): string | undefined {
  if (article.articleUrl?.startsWith('http')) return article.articleUrl
  if (article.canonicalUrl?.startsWith('http')) return article.canonicalUrl
  return undefined
}

/** Share‑2 network (three nodes — stroke inherits `currentColor`). */
function ShareIconGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 4.98" />
    </svg>
  )
}

function DisruptionScoreBadge({ score, inline }: { score: number; inline?: boolean }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Disruption score ${formatDisruptionScore(score)}`}>
      <span
        className={`font-semibold tabular-nums leading-none tracking-tight ${
          inline ? 'text-[15px] md:text-[17px]' : 'text-xl md:text-2xl'
        }`}
        style={{ color: TEXT_PRIMARY }}
      >
        {formatDisruptionScore(score)}
      </span>
      <span
        className={`inline-flex shrink-0 text-amber-400 ${inline ? 'h-4 w-4 md:h-[1.15rem] md:w-[1.15rem]' : 'h-5 w-5 md:h-6 md:w-6'}`}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
          <path
            fillRule="evenodd"
            d="M14.615 1.595a.75.75 0 0 1 .359.852L13.957 11h7.089a.75.75 0 0 1 .528 1.275l-9.392 10.098a.75.75 0 0 1-1.248-.734l2.062-10.086H5.096a.75.75 0 0 1-.547-1.251l9.39-10.098a.75.75 0 0 1 .676-.189z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </div>
  )
}

function SignalBullet({
  text,
  index,
  desktopComfort,
}: {
  text: string
  index: number
  /** Slightly larger bullets + icons on desktop card layout only. */
  desktopComfort?: boolean
}) {
  const icon = index % 3
  const iconClass = desktopComfort ? 'h-3.5 w-3.5 md:h-4 md:w-4' : 'h-3.5 w-3.5'
  return (
    <li className={`flex items-start ${desktopComfort ? 'gap-2.5 md:gap-3' : 'gap-2.5'}`}>
      <span
        className={`mt-[3px] inline-flex shrink-0 items-center justify-center ${desktopComfort ? 'h-4 w-4 md:h-[1.1rem] md:w-[1.1rem]' : 'h-4 w-4'}`}
        style={{ color: BRAND }}
      >
        {icon === 0 ? (
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3l2.3 4.9L20 10l-4 3.9.9 5.6-4.9-2.7-4.9 2.7.9-5.6L4 10l5.7-2.1L12 3z" />
          </svg>
        ) : icon === 1 ? (
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 19l14-14M8 5h11v11" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2l3 6 6 .9-4.5 4.4 1 6.2L12 16.8 6.5 19.5l1-6.2L3 8.9 9 8l3-6z" />
          </svg>
        )}
      </span>
      <span>{text}</span>
    </li>
  )
}

function ThemeToggle({
  value,
  onChange,
}: {
  value: 'dark' | 'light'
  onChange: (value: 'dark' | 'light') => void
}) {
  const nextLabel = value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
  return (
    <button
      type="button"
      onClick={() => onChange(value === 'dark' ? 'light' : 'dark')}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-sm outline-none ring-offset-2 ring-offset-transparent transition-colors duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--vedlik-accent)]"
      style={{ borderColor: BORDER, color: TEXT_PRIMARY, backgroundColor: SURFACE_ELEVATED }}
      aria-label={nextLabel}
    >
      {/* Heroicons outline strokes (consistent 8-ray sun + crescent moon) */}
      <span className="pointer-events-none flex h-[22px] w-[22px] items-center justify-center motion-safe:transition-opacity motion-safe:duration-150">
        {value === 'dark' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[22px] w-[22px]"
            aria-hidden
          >
            <path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[22px] w-[22px]"
            aria-hidden
          >
            <path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.902-8.998Z" />
          </svg>
        )}
      </span>
    </button>
  )
}

function CategoryDrawer({
  open,
  categories,
  activeSlug,
  onSelect,
  onClose,
}: {
  open: boolean
  categories: WebCategory[]
  activeSlug: string
  onSelect: (slug: string) => void
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Categories">
      <button
        type="button"
        className="vedlik-drawer-backdrop-anim absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside
        id="vedlik-category-drawer"
        className="vedlik-drawer-panel-anim relative ml-0 flex h-full w-[min(100%,340px)] flex-col border-r shadow-xl"
        style={{ borderColor: BORDER, backgroundColor: SURFACE_RAISED }}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: BORDER }}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em]" style={{ color: TEXT_PRIMARY }}>
            Categories
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
            style={{ borderColor: BORDER, color: TEXT_SECONDARY, backgroundColor: SURFACE_ELEVATED }}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {categories.map((category) => {
              const active = category.slug === activeSlug
              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => {
                    onSelect(category.slug)
                    onClose()
                  }}
                  className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors duration-200 ease-out"
                  style={{
                    color: active ? '#002f2b' : TEXT_PRIMARY,
                    borderColor: active ? BRAND : BORDER,
                    backgroundColor: active ? BRAND : SURFACE_ELEVATED,
                  }}
                >
                  <span>{category.label}</span>
                  <span style={{ color: active ? 'rgba(0,47,43,0.9)' : TEXT_SECONDARY }}>{category.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

function Skel({ className }: { className?: string }) {
  return <div className={`vedlik-shimmer rounded-md ${className ?? ''}`} aria-hidden />
}

/**
 * Mirrors ArticleCard: same image breakpoints (12rem / 13rem), meta+category→title gap,
 * three bullet lines, optional read-more row, then teal footer (two-line body + share inset).
 */
function ArticleCardSkeleton() {
  const stripBase =
    'vedlik-signal-footer-strip -mx-4 rounded-b-2xl px-4 py-3.5 sm:py-4 md:mx-0 md:rounded-b-none md:rounded-br-2xl md:py-4'
  /** Matches SignalCardFooter: border-t row + teal strip inner (multi-line footer text). */
  const footerSkeleton = (
    <div className="mt-4 w-full md:mt-auto">
      <div className="border-t pt-3" style={{ borderColor: BORDER }}>
        <div className="flex w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-2 md:justify-start">
          <Skel className="h-[14px] w-full max-w-[15rem] flex-1 sm:h-[15px]" />
          <Skel className="h-3 w-[3.25rem] shrink-0 md:hidden" />
        </div>
      </div>
      <div className={`${stripBase} mt-3`}>
        <div className="vedlik-signal-footer-strip__inner relative min-h-[4.25rem] md:min-h-[4.75rem]">
          <div className="space-y-1.5 pr-12 sm:space-y-2 md:justify-center md:space-y-2 md:pr-0">
            <Skel className="h-3 min-h-[13px] w-full md:h-[1.0625rem] lg:h-5" />
            <Skel className="h-3 min-h-[13px] w-[96%] sm:w-[92%] md:h-[1rem] lg:h-6" />
            <Skel className="hidden h-4 md:block md:h-6 lg:h-7" />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <article className="vedlik-web-signal-card isolate overflow-hidden rounded-2xl">
      <div className="relative z-0 flex flex-col md:hidden">
        <Skel className="vedlik-web-signal-card__media h-[12rem] w-full shrink-0 rounded-t-2xl sm:h-[13rem]" />
        <div
          className="relative z-[1] flex flex-col rounded-b-2xl px-4 pb-0 pt-3"
          style={{ backgroundColor: CARD_BODY }}
        >
          <div className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <Skel className="h-3 w-full max-w-[14rem]" />
            <Skel className="h-4 w-10 shrink-0 rounded-md" />
          </div>
          <Skel className="mt-2 h-2.5 w-[7rem]" />
          <Skel className="mt-2 h-8 w-full max-w-[99%]" />
          <Skel className="mt-1 h-7 w-[88%]" />
          <div className="mt-3 space-y-1.5">
            <Skel className="min-h-[1rem] w-full" />
            <Skel className="min-h-[1rem] w-[97%]" />
            <Skel className="min-h-[1rem] w-[82%]" />
          </div>
          {footerSkeleton}
        </div>
      </div>
      <div className="hidden md:flex md:items-stretch md:gap-4 md:p-4">
        <Skel className="vedlik-web-signal-card__media h-[300px] w-[360px] shrink-0 rounded-xl" />
        <div className="flex min-h-[300px] min-w-0 flex-1 flex-col">
          <div className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <Skel className="h-3 w-[12rem]" />
            <Skel className="h-5 w-[2.625rem] shrink-0 rounded-md" />
          </div>
          <Skel className="mt-2 h-3 w-[6rem]" />
          <Skel className="mt-1.5 h-7 w-full max-w-[96%]" />
          <Skel className="mt-1 h-[1.625rem] w-[84%]" />
          <div className="mt-1.5 space-y-0.5 md:space-y-1">
            <Skel className="min-h-[0.9375rem] w-full md:min-h-4 lg:min-h-5" />
            <Skel className="min-h-[0.9375rem] w-[95%] md:min-h-4 lg:min-h-5" />
            <Skel className="min-h-[0.9375rem] w-[78%] md:min-h-4 lg:min-h-5" />
          </div>
          {footerSkeleton}
        </div>
      </div>
    </article>
  )
}

function SignalCardFooter({ article, sourceName }: { article: WebArticle; sourceName: string }) {
  const externalSource = externalArticleUrlFrom(article)
  const appArticleUrl = `${SITE_URL}/article/${article.id}`
  const signalPath = `/signal/${article.slug ?? article.id}`
  const shareSignalUrl = `${SITE_URL}${signalPath}`

  async function handleShareSignal() {
    const navigatorText = buildSignalShareBodyForNavigator(article.title)
    const clipboardText = buildSignalShareTextForClipboard(article.title, shareSignalUrl)
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: article.title,
          text: navigatorText,
          url: shareSignalUrl,
        })
        return
      }
    } catch (err) {
      const e = err as { name?: string }
      if (e?.name === 'AbortError') return
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(clipboardText)
      } else {
        window.open(shareSignalUrl, '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.open(shareSignalUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const stripBase =
    'vedlik-signal-footer-strip -mx-4 rounded-b-2xl px-4 py-3.5 sm:py-4 md:mx-0 md:rounded-b-none md:rounded-br-2xl md:py-4'
  const stripTop = externalSource != null ? 'mt-3' : 'mt-4'
  return (
    <div className="mt-0">
      {externalSource != null ? (
        <div className="border-t pt-3" style={{ borderColor: BORDER }}>
          {/* mSite: keep “Read more” left-aligned; timestamp on the right (desktop unchanged: no time here). */}
          <div className="flex w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-2 md:justify-start">
            <a
              href={externalSource}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 text-sm font-medium underline-offset-4 hover:underline md:text-base"
              style={{ color: TEXT_PRIMARY }}
            >
              Read more at <span style={{ color: BRAND }}>{sourceName}</span>
            </a>
            <time
              dateTime={article.publishedAt}
              className="shrink-0 text-right text-[11px] font-semibold uppercase tracking-[0.08em] md:hidden"
              style={{ color: TEXT_SECONDARY }}
            >
              {formatPublishedTime(article.publishedAt)}
            </time>
          </div>
        </div>
      ) : null}
      <div className={`${stripBase} ${stripTop}`}>
        <div className="vedlik-signal-footer-strip__inner">
          <button
            type="button"
            className="vedlik-signal-share absolute right-2 top-1/2 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center md:hidden"
            aria-label={`Share: ${clampText(article.title, 80)}`}
            onClick={() => void handleShareSignal()}
          >
            <ShareIconGlyph className="h-5 w-5 shrink-0" />
          </button>
          <p className="md:hidden pr-11 text-[clamp(11px,3.1vw,13px)] font-medium leading-snug tracking-tight sm:pr-12">
            <span className="vedlik-signal-footer-muted">
              Insights, technical change, and developer impact available on the{' '}
            </span>
            <a href={appArticleUrl} className="vedlik-signal-footer-link" rel="noopener noreferrer">
              Vedlik app
            </a>
            <span className="vedlik-signal-footer-muted">.</span>
          </p>
          <p className="hidden text-sm font-medium leading-snug md:block md:text-base md:leading-relaxed lg:text-lg">
            <span className="vedlik-signal-footer-muted">
              Insights, technical change, and developer impact available on the{' '}
            </span>
            <a href={appArticleUrl} className="vedlik-signal-footer-link" rel="noopener noreferrer">
              Vedlik app
            </a>
            <span className="vedlik-signal-footer-muted">.</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function ArticleCard({
  article,
}: {
  article: WebArticle
}) {
  const cleanBullets = sanitizeWhyItMatters(article.whyItMatters)
  const primaryBullet = cleanBullets.slice(0, 3)
  const desktopBullets = cleanBullets.slice(0, 3)
  const authorName = article.author?.trim() ?? ''
  const sourceName = formatSourceName(article.source)
  const disruption = article.disruptionScore
  const externalArticleUrl = externalArticleUrlFrom(article)

  return (
    <article className="vedlik-web-signal-card isolate overflow-hidden rounded-2xl">
      <div className="relative z-0 flex flex-col md:hidden">
        <div className="vedlik-web-signal-card__media relative h-[12rem] w-full shrink-0 overflow-hidden rounded-t-2xl bg-black sm:h-[13rem]">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div
          className="relative z-[1] flex flex-col rounded-b-2xl px-4 pb-0 pt-3"
          style={{ backgroundColor: CARD_BODY }}
        >
          <div
            className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.08em]"
            style={{ color: TEXT_SECONDARY }}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
              {externalArticleUrl == null ? (
                <time dateTime={article.publishedAt}>{formatPublishedTime(article.publishedAt)}</time>
              ) : null}
              {/* With off-site Read more link, publish time sits before that link on mobile (SignalCardFooter). */}
            </div>
            {disruption != null ? (
              <div className="shrink-0 self-center">
                <DisruptionScoreBadge score={disruption} inline />
              </div>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.08em]" style={{ color: BRAND }}>
            {formatCategoryLabel(article.category)}
          </p>
          <h3
            className="vedlik-web-signal-card__title mt-2 text-[24px] font-semibold leading-[1.12]"
            style={{ color: TEXT_PRIMARY }}
          >
            {clampText(article.title, 105)}
          </h3>
          <div className="mt-3">
            <ul className="space-y-1.5 text-sm leading-6" style={{ color: 'var(--vedlik-text-bullet)' }}>
              {primaryBullet.map((point, index) => (
                <SignalBullet key={point} text={point} index={index} />
              ))}
              {primaryBullet.length === 0 && (
                <li style={{ color: TEXT_SECONDARY }}>Context is being prepared for this signal.</li>
              )}
            </ul>
          </div>
          <div className="mt-4">
            <SignalCardFooter article={article} sourceName={sourceName} />
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:items-stretch md:gap-4 md:p-4">
        <div className="vedlik-web-signal-card__media relative h-[300px] w-[360px] shrink-0 overflow-hidden rounded-xl bg-black">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col md:min-h-[300px]">
          <div
            className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.08em] md:text-[13px] md:tracking-[0.09em]"
            style={{ color: TEXT_SECONDARY }}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
              <time dateTime={article.publishedAt}>{formatPublishedTime(article.publishedAt)}</time>
              {authorName ? (
                <>
                  <span>/</span>
                  <span>
                    Signal by <span style={{ color: TEXT_PRIMARY }}>{authorName}</span>
                  </span>
                </>
              ) : null}
            </div>
            {disruption != null ? (
              <div className="shrink-0 self-center">
                <DisruptionScoreBadge score={disruption} inline />
              </div>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.08em] md:mt-2.5 md:text-xs" style={{ color: BRAND }}>
            {formatCategoryLabel(article.category)}
          </p>
          <h3
            className="vedlik-web-signal-card__title mt-1.5 text-[20px] font-semibold leading-[1.18] md:mt-2 md:text-2xl md:leading-tight"
            style={{ color: TEXT_PRIMARY }}
          >
            {clampText(article.title, 72)}
          </h3>
          <div className="mt-1.5 md:mt-2">
            <ul
              className="space-y-0.5 text-[12.5px] leading-5 md:space-y-1 md:text-[0.95rem] md:leading-7 lg:text-base lg:leading-7"
              style={{ color: 'var(--vedlik-text-bullet)' }}
            >
              {desktopBullets.map((point, index) => (
                <SignalBullet key={point} desktopComfort text={point} index={index} />
              ))}
              {desktopBullets.length === 0 && (
                <li style={{ color: TEXT_SECONDARY }}>Context is being prepared for this signal.</li>
              )}
            </ul>
          </div>
          <div className="mt-4 w-full md:mt-auto">
            <SignalCardFooter article={article} sourceName={sourceName} />
          </div>
        </div>
      </div>
    </article>
  )
}

function mapArticle(item: WebArticleSummary): WebArticle {
  const extra = item as WebArticleSummary & { disruption_score?: number | string }
  const disrupted = parseDisruptionScore(item.disruptionScore ?? extra.disruption_score)
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    imageUrl: item.imageUrl ?? WEB_FALLBACK_IMAGE,
    articleUrl: item.articleUrl,
    author: item.author,
    uiCategory: item.uiCategory,
    source: item.source ?? 'Vedlik',
    category: item.category ?? 'All',
    whyItMatters: item.whyItMattersPreview ?? item.whyItMatters ?? [],
    publishedAt: item.publishedAt,
    ...(disrupted != null ? { disruptionScore: disrupted } : {}),
    canonicalUrl: item.canonicalUrl,
    seo: item.seo,
  }
}

export default function WebHomePage({
  topicSlug,
  initialSignalIdOrSlug,
}: {
  topicSlug?: string
  initialSignalIdOrSlug?: string
}) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [menuOpen, setMenuOpen] = useState(false)
  const closeCategoryDrawer = useCallback(() => setMenuOpen(false), [])
  const [categories, setCategories] = useState<WebCategory[]>([])
  const [articles, setArticles] = useState<WebArticle[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  /** First feed request for the current filter has finished (success or handled error). */
  const [feedReady, setFeedReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialSeekDone, setInitialSeekDone] = useState(false)
  const cardElementsRef = useRef<Map<string, HTMLElement>>(new Map())
  const currentSignalPathRef = useRef<string | null>(null)
  const categoryScrollReadyRef = useRef(false)

  const hasArticles = useMemo(() => articles.length > 0, [articles.length])
  const awaitingCategoriesForFeed = !topicSlug && categories.length === 0
  const showFeedSkeleton = useMemo(
    () =>
      articles.length === 0 &&
      !error &&
      (awaitingCategoriesForFeed || loading || !feedReady),
    [articles.length, error, awaitingCategoriesForFeed, loading, feedReady],
  )
  /** Subtle fade while reloading the feed so category switches feel less abrupt. */
  const refreshingFeed = useMemo(
    () => loading && hasArticles && !showFeedSkeleton,
    [loading, hasArticles, showFeedSkeleton],
  )
  const activeCategoryLabel =
    categories.find((item) => item.slug === activeCategory)?.label ?? ''

  useEffect(() => {
    const stored = localStorage.getItem('vedlik_theme')
    const preferred =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    const nextTheme = stored === 'light' || stored === 'dark' ? stored : preferred
    setTheme(nextTheme)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('vedlik_theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.add('vedlik-web-feed')
    return () => {
      document.documentElement.classList.remove('vedlik-web-feed')
    }
  }, [])

  useEffect(() => {
    closeCategoryDrawer()
  }, [topicSlug, activeCategory, closeCategoryDrawer])

  /** After choosing a homepage category, ease the viewport back to the feed start. */
  useEffect(() => {
    if (topicSlug) return
    if (!categoryScrollReadyRef.current) {
      categoryScrollReadyRef.current = true
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeCategory, topicSlug])

  useEffect(() => {
    let cancelled = false

    const loadCategories = async () => {
      try {
        const payload = await listCategories()
        if (cancelled) return
        const incoming = payload ?? []
        const hasAll = incoming.some((item) => item.slug === 'all')
        setCategories(hasAll ? incoming : [{ slug: 'all', label: 'All', count: 0 }, ...incoming])
      } catch {
        if (!cancelled) {
          setCategories([{ slug: 'all', label: 'All', count: 0 }])
        }
      }
    }

    void loadCategories()
    return () => {
      cancelled = true
    }
  }, [topicSlug])

  useEffect(() => {
    if (!topicSlug && categories.length === 0) return

    let cancelled = false

    const loadArticles = async () => {
      setLoading(true)
      setFeedReady(false)
      setError(null)
      try {
        const payload = await listArticles({
          limit: 20,
          ...articleListParamsFromCategorySelection(topicSlug, categories, activeCategory),
        })
        if (cancelled) return
        const mapped = payload.items.map(mapArticle)
        setArticles(mapped)
        setNextCursor(payload.nextCursor)
      } catch {
        if (!cancelled) {
          setError('Could not load articles from production API.')
          setArticles([])
          setNextCursor(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setFeedReady(true)
        }
      }
    }

    void loadArticles()
    return () => {
      cancelled = true
    }
  }, [activeCategory, topicSlug, categories])

  const loadMore = async () => {
    if (!nextCursor || loading) return
    setLoading(true)
    setError(null)
    try {
      const payload = await listArticles({
        limit: 20,
        cursor: nextCursor,
        ...articleListParamsFromCategorySelection(topicSlug, categories, activeCategory),
      })
      const mapped = payload.items.map(mapArticle)
      setArticles((current) => [...current, ...mapped])
      setNextCursor(payload.nextCursor)
    } catch {
      setError('Could not load more articles from production API.')
    } finally {
      setLoading(false)
    }
  }

  const setPathIfChanged = (path: string) => {
    if (currentSignalPathRef.current === path) return
    currentSignalPathRef.current = path
    if (window.location.pathname !== path) {
      window.history.replaceState({ path }, '', path)
    }
  }

  useEffect(() => {
    if (topicSlug || !initialSignalIdOrSlug || initialSeekDone || loading) return
    const normalized = initialSignalIdOrSlug.toLowerCase()
    const found = articles.some(
      (item) => item.id.toLowerCase() === normalized || (item.slug ?? '').toLowerCase() === normalized
    )
    if (found) {
      setInitialSeekDone(true)
      return
    }
    if (nextCursor) {
      void loadMore()
      return
    }
    setInitialSeekDone(true)
  }, [articles, initialSeekDone, initialSignalIdOrSlug, loading, nextCursor, topicSlug])

  useEffect(() => {
    if (!initialSignalIdOrSlug || !initialSeekDone) return
    const normalized = initialSignalIdOrSlug.toLowerCase()
    const target = articles.find(
      (item) => item.id.toLowerCase() === normalized || (item.slug ?? '').toLowerCase() === normalized
    )
    if (!target) return
    const key = target.slug ?? target.id
    const el = cardElementsRef.current.get(key)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setPathIfChanged(`/signal/${key}`)
  }, [articles, initialSeekDone, initialSignalIdOrSlug])

  useEffect(() => {
    if (articles.length === 0) return
    let ticking = false
    const updateFromViewport = () => {
      const candidates = Array.from(cardElementsRef.current.values())
      if (candidates.length === 0) return
      const viewportAnchor = window.innerHeight * 0.42
      let bestPath: string | null = null
      let bestScore = Number.POSITIVE_INFINITY
      for (const el of candidates) {
        const rect = el.getBoundingClientRect()
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue
        const center = rect.top + rect.height / 2
        const score = Math.abs(center - viewportAnchor)
        if (score < bestScore) {
          bestScore = score
          bestPath = el.dataset.signalPath ?? null
        }
      }
      if (bestPath) setPathIfChanged(bestPath)
    }

    const onScrollOrResize = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        updateFromViewport()
      })
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    onScrollOrResize()

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [articles])

  useEffect(() => {
    if (articles.length === 0) return
    if (!initialSignalIdOrSlug) {
      setPathIfChanged(`/signal/${articles[0].slug ?? articles[0].id}`)
    }
  }, [articles, initialSignalIdOrSlug, topicSlug, activeCategory])

  useEffect(() => {
    currentSignalPathRef.current = null
  }, [topicSlug, activeCategory])

  useEffect(() => {
    const title = topicSlug
      ? `Topic: ${topicSlug} | Vedlik`
      : 'Vedlik — AI, Tech and Startup Intelligence'
    const description = topicSlug
      ? `Latest stories for topic ${topicSlug} on Vedlik.`
      : 'Read AI, tech, and startup stories with why-it-matters context on Vedlik web.'
    const canonicalUrl = topicSlug ? `${SITE_URL}/topic/${topicSlug}` : `${SITE_URL}/web`
    applyPageSeo({ title, description, canonicalUrl })
  }, [topicSlug])

  useEffect(() => {
    if (articles.length === 0) {
      removeJsonLd('feed-itemlist')
      return
    }
    const itemListElement = articles.map((article, index) => {
      const slug = article.slug ?? article.id
      const path = `/signal/${slug}`
      const url = `${SITE_URL}${path}`
      const seo = article.seo
      const headline = seo?.metaTitle?.trim() || article.title
      const image = seo?.ogImage?.trim() || article.imageUrl
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'NewsArticle',
          headline,
          name: article.title,
          url,
          ...(image && image !== WEB_FALLBACK_IMAGE ? { image } : {}),
          ...(seo?.metaDescription?.trim() ? { description: seo.metaDescription.trim() } : {}),
        },
      }
    })
    upsertJsonLd('feed-itemlist', {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: topicSlug ? `Topic: ${topicSlug}` : 'Vedlik signals',
      itemListElement,
    })
    return () => {
      removeJsonLd('feed-itemlist')
    }
  }, [articles, topicSlug])

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE_BASE, color: TEXT_PRIMARY }}>
      <header
        className="fixed inset-x-0 top-0 z-30 border-b bg-[color-mix(in_srgb,var(--vedlik-bg-surface-1)_88%,transparent)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-md"
        style={{ borderColor: BORDER }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between px-4 md:h-16 md:px-6">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {!topicSlug ? (
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
                style={{ borderColor: BORDER, color: TEXT_SECONDARY, backgroundColor: SURFACE_ELEVATED }}
                aria-label={menuOpen ? 'Close categories' : 'Open categories'}
                aria-expanded={menuOpen}
                aria-controls="vedlik-category-drawer"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            ) : (
              <span className="inline-flex h-9 w-9 shrink-0" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <VedlikWordmarkLink theme={theme} className="mb-1" />
              {(topicSlug || activeCategoryLabel) ? (
                <p
                  className="text-[11px] uppercase tracking-[0.12em] md:text-sm"
                  style={{ color: TEXT_SECONDARY }}
                >
                  {topicSlug ? (
                    <>
                      Topic · <span style={{ color: TEXT_PRIMARY }}>{topicSlug}</span>
                    </>
                  ) : (
                    <>
                      Browse · <span style={{ color: BRAND }}>{activeCategoryLabel}</span>
                    </>
                  )}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle value={theme} onChange={setTheme} />
            <a
              href="/app"
              className="rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: BRAND, color: BRAND_ON }}
            >
              Install App
            </a>
          </div>
        </div>
      </header>
      {/* Reserve space for fixed header + notch (content starts below). */}
      <div
        className="h-[calc(3.5rem+env(safe-area-inset-top,0px))] shrink-0 md:h-[calc(4rem+env(safe-area-inset-top,0px))]"
        aria-hidden
      />

      <SignalAppDownloadBanner />

      {!topicSlug && (
        <CategoryDrawer
          open={menuOpen}
          categories={categories}
          activeSlug={activeCategory}
          onSelect={setActiveCategory}
          onClose={closeCategoryDrawer}
        />
      )}

      <main className="mx-auto w-full max-w-[1240px] px-4 py-5 md:px-6 md:py-7">
        <section
          className={`grid grid-cols-1 gap-8 md:gap-8 transition-opacity duration-300 ease-out ${
            refreshingFeed ? 'opacity-[0.93] motion-reduce:opacity-100' : 'opacity-100'
          }`}
          aria-busy={showFeedSkeleton}
        >
          {showFeedSkeleton
            ? Array.from({ length: 5 }, (_, i) => <ArticleCardSkeleton key={`feed-skel-${i}`} />)
            : articles.map((article) => (
                <div
                  key={article.id}
                  className="scroll-mt-[7.5rem] md:scroll-mt-[8rem]"
                  ref={(node) => {
                    const key = article.slug ?? article.id
                    if (node) {
                      cardElementsRef.current.set(key, node)
                    } else {
                      cardElementsRef.current.delete(key)
                    }
                  }}
                  data-signal-path={`/signal/${article.slug ?? article.id}`}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
        </section>
        {!showFeedSkeleton && !loading && !hasArticles && !error && (
          <p className="py-10 text-center text-sm" style={{ color: TEXT_SECONDARY }}>
            No signals available for this category.
          </p>
        )}
        {error && <p className="py-6 text-center text-sm text-red-400">{error}</p>}
        {nextCursor && (
          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              style={{ backgroundColor: BRAND, color: '#032a26' }}
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

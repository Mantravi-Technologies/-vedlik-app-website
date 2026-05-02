import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  WEB_FALLBACK_IMAGE,
  getArticleByIdOrSlug,
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
import { getPathname } from '../spaNavigation'
import {
  FEED_BREADCRUMB_SIGNAL_NAME,
  FEED_BREADCRUMB_WEB_NAME,
  SIGNAL_FEED_DESCRIPTION,
  SIGNAL_FEED_H1,
  SIGNAL_FEED_TITLE,
  SIGNAL_STORY_FALLBACK_DESCRIPTION,
  SIGNAL_STORY_FALLBACK_TITLE,
  SITE_URL,
  WEB_FEED_DESCRIPTION,
  WEB_FEED_TITLE,
  seoPayloadForFeedArticle,
  topicPageDescription,
  topicPageTitle,
} from '../seo/siteSeoCopy'

const BRAND = '#20b2aa'
/** Text on primary teal (matches “Install App” pill). */
const BRAND_ON = '#032a26'
const APP_STORE_URL = 'https://apps.apple.com/in/app/vedlik-ai-tech-insights/id6761024663'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.mantravi.ai.briefing'
const SURFACE_BASE = 'var(--vedlik-bg-base)'
const SURFACE_RAISED = 'var(--vedlik-bg-surface-1)'
const SURFACE_ELEVATED = 'var(--vedlik-bg-surface-2)'
const BORDER = 'var(--vedlik-border-subtle)'
const TEXT_PRIMARY = 'var(--vedlik-text-primary)'
const TEXT_SECONDARY = 'var(--vedlik-text-secondary)'
const CARD_BODY = 'var(--vedlik-card-body)'

/** User-facing feed errors (no internal/prod jargon). */
type FeedUserError = {
  scope: 'initial' | 'loadMore'
  title: string
  body: string
}

function FeedErrorPanel({
  error,
  onRetry,
  compact,
}: {
  error: FeedUserError
  onRetry: () => void
  compact?: boolean
}) {
  return (
    <div
      role="alert"
      className={
        compact
          ? 'rounded-2xl border px-4 py-4 text-left shadow-sm'
          : 'mx-auto max-w-md rounded-2xl border px-5 py-6 text-center shadow-sm'
      }
      style={{ borderColor: BORDER, backgroundColor: SURFACE_ELEVATED }}
    >
      <div className={compact ? 'flex gap-3 sm:items-start' : 'flex flex-col items-center gap-3'}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-full border ${compact ? 'h-10 w-10' : 'h-12 w-12'}`}
          style={{ borderColor: BORDER, color: BRAND }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 9v4M12 17h.01M10.3 3.3h3.4L21 17.1a1 1 0 0 1-.9 1.4H3.8a1 1 0 0 1-.9-1.4L10.3 3.3z" />
          </svg>
        </div>
        <div className={compact ? 'min-w-0 flex-1' : ''}>
          <h2 className={`font-semibold leading-snug ${compact ? 'text-base' : 'text-lg'}`} style={{ color: TEXT_PRIMARY }}>
            {error.title}
          </h2>
          <p className={`mt-1.5 text-sm leading-relaxed ${compact ? '' : 'max-w-sm mx-auto'}`} style={{ color: TEXT_SECONDARY }}>
            {error.body}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className={`mt-4 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-95 ${compact ? '' : 'w-full max-w-xs sm:w-auto'}`}
            style={{ backgroundColor: BRAND, color: BRAND_ON }}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}

/** Cropped Vedlik wordmarks: dark → light text / icon block; light theme → dark text, same teal. */
function VedlikWordmarkLink({ theme, className }: { theme: 'dark' | 'light'; className?: string }) {
  const src =
    theme === 'dark' ? '/brand/vedlik-wordmark-dark.png' : '/brand/vedlik-wordmark-light.png'
  return (
    <a
      href="/"
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
  /** API / Firestore canonical slug — compare to URL segment exactly when present. */
  canonicalSlug?: string
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

/**
 * When Browse · All loads before `listCategories()` has hydrated, `articleListParamsFromCategorySelection`
 * returns `{}`; the list API still needs `uiCategory` + `sort`. Defaults match the anchored share path.
 */
function listQueryForActiveCategory(
  topicSlug: string | undefined,
  categories: WebCategory[],
  activeSlug: string,
): { uiCategory?: string; sort?: string; topic?: string } {
  const parsed = articleListParamsFromCategorySelection(topicSlug, categories, activeSlug)
  if (topicSlug || activeSlug !== 'all') return parsed
  return {
    ...parsed,
    uiCategory: parsed.uiCategory ?? 'All',
    sort: parsed.sort ?? 'feedRank',
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
                  className="flex w-full items-center rounded-lg border px-3 py-2.5 text-left text-sm transition-colors duration-200 ease-out"
                  style={{
                    color: active ? '#002f2b' : TEXT_PRIMARY,
                    borderColor: active ? BRAND : BORDER,
                    backgroundColor: active ? BRAND : SURFACE_ELEVATED,
                  }}
                >
                  {category.label}
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
          {/* Mobile: “Read more” + time on one row; from md up the time is hidden in this strip. */}
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

const foldSharedKey = (s: string) => s.trim().toLowerCase()

/** Match URL pathname key to feed row (`id`, `slug`, `canonicalSlug`, URL fields) — exact, then ASCII case-fold. */
function articleRowMatchesSharedKey(
  item: Pick<WebArticle, 'id' | 'slug' | 'canonicalSlug' | 'canonicalUrl' | 'articleUrl'>,
  pathnameKey: string,
): boolean {
  const k = pathnameKey.trim()
  if (k === '') return false

  if (item.id === k) return true
  if (item.slug != null && item.slug !== '' && item.slug === k) return true
  if (item.canonicalSlug != null && item.canonicalSlug !== '' && item.canonicalSlug === k) return true

  const fk = foldSharedKey(k)
  if (foldSharedKey(item.id) === fk) return true
  if (item.slug && foldSharedKey(item.slug) === fk) return true
  if (item.canonicalSlug && foldSharedKey(item.canonicalSlug) === fk) return true

  const url = item.canonicalUrl ?? item.articleUrl
  if (typeof url === 'string' && url.includes('/signal/')) {
    try {
      const base =
        typeof window !== 'undefined' ? window.location.origin : 'https://vedlik.com'
      const path = new URL(url, base).pathname
      const seg = path.match(/\/signal\/([^/]+)/)?.[1]
      if (seg) {
        if (seg === k || foldSharedKey(seg) === fk) return true
        try {
          if (decodeURIComponent(seg) === k || foldSharedKey(decodeURIComponent(seg)) === fk)
            return true
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore invalid URL */
    }
  }

  return false
}

/** Dev-only: confirms `items[0]` resolved to the share URL segment after client reorder/hydrate. */
function assertAnchoredFeedHeadOrDevWarn(rows: WebArticle[], urlSegment: string): void {
  if (!import.meta.env.DEV || rows.length === 0) return
  if (articleRowMatchesSharedKey(rows[0], urlSegment)) return
  console.warn(
    '[vedlik-feed] Anchored landing: first row does not match URL segment (check Firestore slug vs share link, or list filters).',
    {
      urlSegment,
      head: { slug: rows[0].slug, canonicalSlug: rows[0].canonicalSlug, id: rows[0].id },
    },
  )
}

function mapArticle(item: WebArticleSummary): WebArticle {
  const extra = item as WebArticleSummary & { disruption_score?: number | string }
  const disrupted = parseDisruptionScore(item.disruptionScore ?? extra.disruption_score)
  return {
    id: item.id,
    slug: item.slug,
    canonicalSlug: item.canonicalSlug,
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

/** Breadcrumb JSON-LD for feed, topic, and deep-linked Signal URLs. */
function buildWebFeedBreadcrumbList(
  path: string,
  options?: { storyName?: string; storyCanonicalUrl?: string },
): Record<string, unknown> | null {
  const homeItem = { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` }
  if (path === '/signal' || path === '/web') {
    const label = path === '/signal' ? FEED_BREADCRUMB_SIGNAL_NAME : FEED_BREADCRUMB_WEB_NAME
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        homeItem,
        { '@type': 'ListItem', position: 2, name: label, item: `${SITE_URL}${path}` },
      ],
    }
  }
  if (path.startsWith('/topic/')) {
    const raw = path.slice('/topic/'.length)
    const label = decodeURIComponent(raw)
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        homeItem,
        { '@type': 'ListItem', position: 2, name: 'Signals', item: `${SITE_URL}/signal` },
        {
          '@type': 'ListItem',
          position: 3,
          name: `Topic: ${label}`,
          item: `${SITE_URL}/topic/${encodeURIComponent(raw)}`,
        },
      ],
    }
  }
  if (path.startsWith('/signal/') || path.startsWith('/article/')) {
    const name = options?.storyName?.trim() || 'Signal'
    const item =
      options?.storyCanonicalUrl?.trim() ||
      (path.startsWith('/signal/')
        ? `${SITE_URL}${path}`
        : `${SITE_URL}/signal/${encodeURIComponent(decodeURIComponent(path.slice('/article/'.length)))}`)
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        homeItem,
        { '@type': 'ListItem', position: 2, name: 'Signals', item: `${SITE_URL}/signal` },
        { '@type': 'ListItem', position: 3, name: name.length > 90 ? `${name.slice(0, 87)}…` : name, item },
      ],
    }
  }
  return null
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
  const [feedReloadKey, setFeedReloadKey] = useState(0)
  const [feedError, setFeedError] = useState<FeedUserError | null>(null)
  const [initialSeekDone, setInitialSeekDone] = useState(false)
  const cardElementsRef = useRef<Map<string, HTMLElement>>(new Map())
  const currentSignalPathRef = useRef<string | null>(null)
  const categoryScrollReadyRef = useRef(false)
  /** Avoid re-running deep-link scroll on every append (e.g. Load more). */
  const didScrollToDeepLinkRef = useRef<string | null>(null)
  /** Keeps catalogue rows readable without listing `categories` in the feed effect deps (avoids duplicate page-1 fetches). */
  const categoriesRef = useRef<WebCategory[]>(categories)
  categoriesRef.current = categories

  const hasArticles = useMemo(() => articles.length > 0, [articles.length])
  /** Chips for non–Browse-All tabs; never block the shimmer on `/categories` while on “All”. */
  const awaitingCategoriesForFeed =
    !topicSlug && categories.length === 0 && activeCategory !== 'all'
  const showFeedSkeleton = useMemo(
    () =>
      articles.length === 0 &&
      !feedError &&
      (awaitingCategoriesForFeed || loading || !feedReady),
    [articles.length, feedError, awaitingCategoriesForFeed, loading, feedReady],
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

  /** Reset deep-link scroll when the shared slug in the URL changes or is cleared. */
  useEffect(() => {
    didScrollToDeepLinkRef.current = null
    setInitialSeekDone(false)
  }, [initialSignalIdOrSlug])

  /**
   * Category tab changes imply a fresh page-1 fetch (cursor reset in loader) and must not reuse
   * anchored-scroll bookkeeping from the “All + share slug” landing.
   */
  useEffect(() => {
    didScrollToDeepLinkRef.current = null
  }, [activeCategory])

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
    // Browse · All (and `/signal/:slug`) use fixed catalogue params — don’t block on `listCategories()`.
    const browseAllBootstrap = !topicSlug && activeCategory === 'all'
    if (!topicSlug && categories.length === 0 && !browseAllBootstrap) return

    let cancelled = false

    const loadArticles = async () => {
      setLoading(true)
      setFeedReady(false)
      setFeedError(null)
      try {
        const cats = categoriesRef.current
        const params = listQueryForActiveCategory(topicSlug, cats, activeCategory)

        /**
         * Share landing: anchored first page — same catalogue row as Browse · All (`listCategories`).
         * No `intent` query param unless share URLs deliberately encode persona.
         */
        if (initialSignalIdOrSlug && !topicSlug && activeCategory === 'all') {
          const urlSlug = initialSignalIdOrSlug
          const catalogueParams = listQueryForActiveCategory(topicSlug, cats, 'all')
          const detailAbort = new AbortController()
          const detailPromise = getArticleByIdOrSlug(urlSlug, { signal: detailAbort.signal }).catch(
            () => null,
          )

          const listPayload = await listArticles({
            limit: 20,
            ...catalogueParams,
            anchorSlug: urlSlug,
          })
          if (cancelled) {
            detailAbort.abort()
            return
          }

          let fromList = listPayload.items.map(mapArticle)

          if (listPayload.leadStory) {
            const lead = mapArticle(listPayload.leadStory)
            if (articleRowMatchesSharedKey(lead, urlSlug)) {
              fromList = [
                lead,
                ...fromList.filter(
                  (a) => a.id !== lead.id && !articleRowMatchesSharedKey(a, urlSlug),
                ),
              ]
            }
          }

          const firstMatches = fromList.length > 0 && articleRowMatchesSharedKey(fromList[0], urlSlug)
          const matchIdx = fromList.findIndex((a) => articleRowMatchesSharedKey(a, urlSlug))

          const commitAnchoredLanding = (
            rows: WebArticle[],
            cursor: string | null,
            seekResolved: boolean,
          ) => {
            assertAnchoredFeedHeadOrDevWarn(rows, urlSlug)
            setArticles(rows)
            setNextCursor(cursor)
            setInitialSeekDone(seekResolved)
          }

          if (firstMatches) {
            detailAbort.abort()
            commitAnchoredLanding(fromList, listPayload.nextCursor, true)
          } else if (matchIdx >= 0) {
            detailAbort.abort()
            const hit = fromList[matchIdx]
            const rest = fromList.filter((_, i) => i !== matchIdx)
            commitAnchoredLanding([hit, ...rest], listPayload.nextCursor, true)
          } else {
            try {
              const detail = await detailPromise
              if (cancelled) return
              if (detail && typeof detail === 'object' && 'id' in detail) {
                const pin = mapArticle(detail as WebArticleSummary)
                const pinId = pin.id
                const deduped = fromList.filter(
                  (a) => a.id !== pinId && !articleRowMatchesSharedKey(a, urlSlug),
                )
                commitAnchoredLanding([pin, ...deduped], listPayload.nextCursor, true)
              } else {
                assertAnchoredFeedHeadOrDevWarn(fromList, urlSlug)
                setArticles(fromList)
                setNextCursor(listPayload.nextCursor)
                setInitialSeekDone(true)
              }
            } catch {
              assertAnchoredFeedHeadOrDevWarn(fromList, urlSlug)
              setArticles(fromList)
              setNextCursor(listPayload.nextCursor)
              /** Never paginate client-side to “find” the slug — that burns O(n) requests on deep items. */
              setInitialSeekDone(true)
            }
          }
        } else {
          const payload = await listArticles({
            limit: 20,
            ...params,
          })
          if (cancelled) return
          const mapped = payload.items.map(mapArticle)
          setArticles(mapped)
          setNextCursor(payload.nextCursor)
          if (initialSignalIdOrSlug && !topicSlug) {
            /** Non–Browse-All: no `anchorSlug`; still finish “landing” without cursor-chaining. */
            setInitialSeekDone(true)
          }
        }
      } catch {
        if (!cancelled) {
          setFeedError({
            scope: 'initial',
            title: "We couldn't load the feed",
            body: 'Check your connection and try again. Signals will appear here when the request succeeds.',
          })
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
    // Omit `categories` from deps intentionally: Browse · All first paint uses refs + fixed fallbacks so
    // `/categories` returning does not re-fetch the feed (would duplicate Firebase work).
  }, [activeCategory, topicSlug, feedReloadKey, initialSignalIdOrSlug])

  const loadMore = useCallback(async (): Promise<void> => {
    if (!nextCursor || loading) return
    setLoading(true)
    setFeedError(null)
    try {
      // Continuation page: cursor only — never resend `anchorSlug` on paginated fetches.
      const payload = await listArticles({
        limit: 20,
        cursor: nextCursor,
        ...listQueryForActiveCategory(topicSlug, categories, activeCategory),
      })
      const mapped = payload.items.map(mapArticle)
      setArticles((current) => [...current, ...mapped])
      setNextCursor(payload.nextCursor)
    } catch {
      setFeedError({
        scope: 'loadMore',
        title: "Couldn't load more signals",
        body: 'Something went wrong. Please try again in a moment.',
      })
    } finally {
      setLoading(false)
    }
  }, [nextCursor, loading, topicSlug, categories, activeCategory])

  const retryInitialFeed = useCallback(() => {
    setFeedError(null)
    setFeedReloadKey((k) => k + 1)
  }, [])

  const setPathIfChanged = (path: string) => {
    if (currentSignalPathRef.current === path) return
    currentSignalPathRef.current = path
    if (window.location.pathname !== path) {
      window.history.replaceState({ path }, '', path)
      window.dispatchEvent(new CustomEvent('vedlik:pathreplace', { detail: { path } }))
    }
  }

  /**
   * After the anchored row is committed, bring it into view (fixed header + `scroll-margin-top`).
   */
  useEffect(() => {
    if (!initialSignalIdOrSlug || !initialSeekDone || topicSlug || loading) return
    const urlSlug = initialSignalIdOrSlug
    if (didScrollToDeepLinkRef.current === urlSlug) return

    const idx = articles.findIndex((item) => articleRowMatchesSharedKey(item, urlSlug))
    if (idx < 0) return

    let attempts = 0
    const run = () => {
      attempts++
      const el = document.querySelector<HTMLElement>(`[data-feed-index="${idx}"]`)
      if (!el && attempts < 24) {
        requestAnimationFrame(run)
        return
      }
      if (!el) return
      el.scrollIntoView({ behavior: 'auto', block: 'start' })
      const synced = articles[idx]
      if (synced)
        setPathIfChanged(`/signal/${encodeURIComponent(synced.slug ?? synced.id)}`)
      didScrollToDeepLinkRef.current = urlSlug
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(run)
    })
  }, [articles, initialSeekDone, initialSignalIdOrSlug, loading, topicSlug])

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
    currentSignalPathRef.current = null
  }, [topicSlug, activeCategory])

  useEffect(() => {
    const applyPathSeo = (pathOverride?: string) => {
      const path = pathOverride ?? getPathname()
      let breadcrumbLd: Record<string, unknown> | null = null

      if (topicSlug) {
        const canonicalUrl = `${SITE_URL}/topic/${encodeURIComponent(topicSlug)}`
        applyPageSeo({
          title: topicPageTitle(topicSlug),
          description: topicPageDescription(topicSlug),
          canonicalUrl,
        })
        breadcrumbLd = buildWebFeedBreadcrumbList(path.startsWith('/topic/') ? path : `/topic/${encodeURIComponent(topicSlug)}`)
      } else if (path === '/signal') {
        applyPageSeo({
          title: SIGNAL_FEED_TITLE,
          description: SIGNAL_FEED_DESCRIPTION,
          canonicalUrl: `${SITE_URL}/signal`,
        })
        breadcrumbLd = buildWebFeedBreadcrumbList(path)
      } else if (path === '/web') {
        applyPageSeo({
          title: WEB_FEED_TITLE,
          description: WEB_FEED_DESCRIPTION,
          canonicalUrl: `${SITE_URL}/web`,
        })
        breadcrumbLd = buildWebFeedBreadcrumbList(path)
      } else if (path.startsWith('/signal/') || path.startsWith('/article/')) {
        const rawSeg = path.startsWith('/signal/') ? path.slice('/signal/'.length) : path.slice('/article/'.length)
        let key = rawSeg
        try {
          key = decodeURIComponent(rawSeg)
        } catch {
          key = rawSeg
        }
        const article = articles.find((a) => articleRowMatchesSharedKey(a, key))
        if (article) {
          const payload = seoPayloadForFeedArticle(article)
          applyPageSeo({
            title: payload.title,
            description: payload.description,
            canonicalUrl: payload.canonicalUrl,
            ogImage: payload.ogImage,
            ogType: 'article',
          })
          breadcrumbLd = buildWebFeedBreadcrumbList(path, {
            storyName: article.title,
            storyCanonicalUrl: payload.canonicalUrl,
          })
        } else {
          const canonicalUrl =
            path.startsWith('/signal/') ? `${SITE_URL}${path}` : `${SITE_URL}/signal/${encodeURIComponent(key)}`
          applyPageSeo({
            title: SIGNAL_STORY_FALLBACK_TITLE,
            description: SIGNAL_STORY_FALLBACK_DESCRIPTION,
            canonicalUrl,
          })
          breadcrumbLd = buildWebFeedBreadcrumbList(path)
        }
      } else {
        applyPageSeo({
          title: SIGNAL_FEED_TITLE,
          description: SIGNAL_FEED_DESCRIPTION,
          canonicalUrl: `${SITE_URL}/signal`,
        })
      }

      if (breadcrumbLd) upsertJsonLd('breadcrumbs', breadcrumbLd)
      else removeJsonLd('breadcrumbs')
    }

    applyPathSeo()

    const onPathReplace = (ev: Event) => {
      const detail = (ev as CustomEvent<{ path: string }>).detail
      if (detail?.path) applyPathSeo(detail.path)
      else applyPathSeo()
    }
    window.addEventListener('vedlik:pathreplace', onPathReplace)
    return () => {
      window.removeEventListener('vedlik:pathreplace', onPathReplace)
      removeJsonLd('breadcrumbs')
    }
  }, [topicSlug, articles, initialSignalIdOrSlug])

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
      name: topicSlug
        ? `Vedlik Signals — topic “${topicSlug}” (AI news, tech updates, startups)`
        : 'Vedlik Signals — latest AI news, tech updates, and startup briefs',
      numberOfItems: itemListElement.length,
      itemListElement,
    })
    return () => {
      removeJsonLd('feed-itemlist')
    }
  }, [articles, topicSlug])

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE_BASE, color: TEXT_PRIMARY }}>
      <h1 className="sr-only">
        {topicSlug ? `Topic: ${topicSlug} — ${SIGNAL_FEED_H1}` : SIGNAL_FEED_H1}
      </h1>
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
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
            : articles.map((article, feedIndex) => (
                <div
                  key={article.id}
                  data-feed-index={feedIndex}
                  className="scroll-mt-[7.5rem] md:scroll-mt-[8rem] rounded-2xl"
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
        {!showFeedSkeleton && !loading && !hasArticles && !feedError && (
          <p className="py-10 text-center text-sm" style={{ color: TEXT_SECONDARY }}>
            No signals available for this category.
          </p>
        )}
        {!showFeedSkeleton && feedError?.scope === 'initial' ? (
          <div className="py-12">
            <FeedErrorPanel
              error={feedError}
              onRetry={() => {
                retryInitialFeed()
              }}
            />
          </div>
        ) : null}
        {!showFeedSkeleton && hasArticles && feedError?.scope === 'loadMore' ? (
          <div className="pt-6">
            <FeedErrorPanel error={feedError} onRetry={() => void loadMore()} compact />
          </div>
        ) : null}
        {nextCursor && (
          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={() => void loadMore()}
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

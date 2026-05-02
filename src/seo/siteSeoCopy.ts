/**
 * All user-visible SEO strings for marketing + feed routes live here.
 *
 * Editorial rules (keep future edits boring and consistent):
 * - Plain English only: no codenames (mSite, “preview” as a product label), no cute stacks (“web + browser + news”).
 * - `/signal` and `/web` are the same Signals catalog; copy differs only where the URL must be explicit.
 * - Titles stay parallel; descriptions stay parallel so tabs, OG, and JSON-LD do not drift.
 */
import { WEB_FALLBACK_IMAGE } from '../web/api'

/** Canonical site origin for meta URLs. */
export const SITE_URL = 'https://vedlik.com'

/** Marketing homepage (`/`, `/showcase`) — matches `index.html` until we add a build-time sync step. */
export const HOME_TITLE = 'Vedlik — Latest AI Updates, Tech News & Startup Intelligence'
export const HOME_DESCRIPTION =
  'Vedlik delivers the latest AI updates, tech news, startup funding rounds, and technology breakthroughs in concise, source-backed briefs. Stay ahead of AI tools, machine learning models, and industry trends—browse Signals on vedlik.com/signal or vedlik.com/web, or download Vedlik for iOS and Android.'

/** `/signal` — primary public feed URL. */
export const SIGNAL_FEED_TITLE = 'Vedlik Signals — Latest AI News & Tech Updates | Vedlik'
export const SIGNAL_FEED_DESCRIPTION =
  'Browse Vedlik Signals at vedlik.com/signal: the latest AI news, tech updates, and startup intelligence in short, source-backed briefs—with context on models, funding, generative AI, and policy. Download Vedlik on iOS or Android for the full app experience.'

/** `/web` — same catalog as `/signal`; only the path changes. */
export const WEB_FEED_TITLE = 'Vedlik Web — Latest AI News & Tech Updates | Vedlik'
export const WEB_FEED_DESCRIPTION =
  'Browse Vedlik Signals at vedlik.com/web (the same feed as vedlik.com/signal): the latest AI news, tech updates, and startup intelligence in short, source-backed briefs—with context on models, funding, generative AI, and policy. Download Vedlik on iOS or Android for the full app experience.'

/** One H1 for the feed shell (screen-reader + crawler clarity; layout unchanged). */
export const SIGNAL_FEED_H1 = 'Latest AI news, tech updates, and startup Signals — Vedlik'

/** JSON-LD `BreadcrumbList` item names — must stay aligned with feed titles above. */
export const FEED_BREADCRUMB_SIGNAL_NAME = 'Signals — latest AI news & tech updates'
export const FEED_BREADCRUMB_WEB_NAME = 'Vedlik Web — latest AI news & tech updates'

/** Deep-linked row not yet merged into `articles`. */
export const SIGNAL_STORY_FALLBACK_TITLE = 'Vedlik Signal | Vedlik'
export const SIGNAL_STORY_FALLBACK_DESCRIPTION =
  'Read this Signal for AI and tech context—open vedlik.com/signal for the full feed, or download Vedlik on iOS or Android.'

function clampText(input: string, maxLen: number): string {
  const t = input.trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, maxLen - 1).trimEnd()}…`
}

export function topicPageTitle(topicSlug: string): string {
  return `Topic: ${topicSlug} | Vedlik`
}

export function topicPageDescription(topicSlug: string): string {
  return clampText(
    `Signals about “${topicSlug}” on Vedlik—AI news, tech updates, and startups with source-backed context. Browse vedlik.com/signal or vedlik.com/web, or download Vedlik on iOS or Android.`,
    320,
  )
}

export type FeedArticleSeoFields = {
  id: string
  slug?: string
  title: string
  imageUrl?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: string
  }
  whyItMatters?: string[]
}

/**
 * Title / description / canonical / og:image for a Signal row (matches WebArticlePage priority).
 */
export function seoPayloadForFeedArticle(article: FeedArticleSeoFields): {
  title: string
  description: string
  canonicalUrl: string
  ogImage?: string
} {
  const slug = article.slug ?? article.id
  const canonicalUrl = `${SITE_URL}/signal/${encodeURIComponent(slug)}`
  const rawTitle = (article.seo?.metaTitle ?? article.title).trim() || SIGNAL_STORY_FALLBACK_TITLE
  const title = clampText(rawTitle, 70)
  const rawDesc =
    article.seo?.metaDescription?.trim() ??
    article.whyItMatters?.[0] ??
    SIGNAL_STORY_FALLBACK_DESCRIPTION
  const description = clampText(rawDesc, 165)
  const og = article.seo?.ogImage?.trim() || article.imageUrl?.trim()
  const ogImage = og && og !== WEB_FALLBACK_IMAGE ? og : undefined
  return { title, description, canonicalUrl, ...(ogImage ? { ogImage } : {}) }
}

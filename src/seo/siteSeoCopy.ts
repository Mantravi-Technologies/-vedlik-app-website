import { WEB_FALLBACK_IMAGE } from '../web/api'

/** Canonical site origin for meta URLs. */
export const SITE_URL = 'https://vedlik.com'

/** Homepage — primary brand line unchanged; description layers keyword themes. */
export const HOME_TITLE = 'Vedlik — Latest AI Updates, Tech News & Startup Intelligence'
export const HOME_DESCRIPTION =
  'Vedlik delivers the latest AI updates, tech news, startup funding rounds, and technology breakthroughs in concise, source-backed briefs. Stay ahead of AI tools, machine learning models, and tech industry trends—and browse Signals (AI news, LLM updates, tech policy, VC rounds) on vedlik.com/signal or use Vedlik on iOS & Android.'

/** `/signal` feed hub — distinct from `/web`. */
export const SIGNAL_FEED_TITLE = 'Vedlik Signals — Latest AI News & Tech Updates | Vedlik'
export const SIGNAL_FEED_DESCRIPTION =
  'Vedlik web feed at vedlik.com/signal: today’s AI news, tech updates, startup intelligence, and why-it-matters-first Signals—mobile web & desktop preview with source-backed briefs on models, funding, generative AI, and policy. Install Vedlik on iOS or Android for the full in-app experience.'

/** `/web` feed preview entry. */
export const WEB_FEED_TITLE = 'Vedlik Web — mSite + Desktop Preview | Vedlik'
export const WEB_FEED_DESCRIPTION =
  'Vedlik web experience preview for mobile web and desktop: AI updates, tech news, startup funding, LLM & developer Signals with why-it-matters-first cards. Same Signals spirit as vedlik.com/signal—open in browser or install Vedlik for iOS & Android.'

/** Visible + SR heading for the Signals feed shell (one H1 per view). */
export const SIGNAL_FEED_H1 = 'Latest AI news, tech updates, and startup Signals — Vedlik'

/** Before a deep-linked row hydrates into `articles`. */
export const SIGNAL_STORY_FALLBACK_TITLE = 'Vedlik Signal | Vedlik'
export const SIGNAL_STORY_FALLBACK_DESCRIPTION =
  'Read this Vedlik Signal with why-it-matters context—AI news, tech updates, and source-backed briefs. Open vedlik.com/signal for the full feed or install Vedlik on iOS & Android.'

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
    `Latest AI news, tech updates, and startup stories for topic “${topicSlug}” on Vedlik—Signals with why-it-matters context. More AI & tech coverage at vedlik.com/signal; install Vedlik for the full app experience on iOS or Android.`,
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

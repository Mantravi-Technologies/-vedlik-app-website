/**
 * Browser calls same-origin /api/v1/* (Vercel proxies to Cloud Function).
 * Local dev: vite.config proxy rewrites /api/v1 → …/webApi/v1/web
 */
const API_BASE = import.meta.env.VITE_PUBLIC_API_BASE ?? '/api/v1'

export const WEB_FALLBACK_IMAGE = 'https://vedlik.com/assets/images/logo.png'

/** Rows from GET /categories — use these fields to build GET /articles filter params (no client hardcoding). */
export type WebCategory = {
  slug: string
  label: string
  count: number
  /** If set, sent as `uiCategory` query param; otherwise `label` is used. */
  uiCategory?: string
  /** If set, sent as `sort` (e.g. `feedRank` for the primary feed tab). */
  sort?: string
}

export type WebArticleSummary = {
  id: string
  slug?: string
  title: string
  imageUrl?: string
  articleUrl?: string
  author?: string
  uiCategory?: string
  source?: string
  category?: string
  topicSlugs?: string[]
  whyItMattersPreview?: string[]
  whyItMatters?: string[]
  publishedAt: string
  /** Disruption index from API (number or numeric string). */
  disruptionScore?: number | string
  canonicalUrl?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: string
  }
}

export type WebArticleDetail = WebArticleSummary & {
  articleUrl?: string
  author?: string
  canonicalSourceUrl?: string
  technicalChange?: string
  developerImpact?: string
  signals?: Record<string, unknown>
  disruptionScore?: number | string
}

export type ListArticlesResponse = {
  items: WebArticleSummary[]
  nextCursor: string | null
  hasMore: boolean
}

type CategoriesResponse = {
  items: WebCategory[]
}

export async function listCategories(): Promise<WebCategory[]> {
  const response = await fetch(`${API_BASE}/categories`)
  if (!response.ok) throw new Error('Unable to load categories')
  const payload = (await response.json()) as CategoriesResponse
  return payload.items ?? []
}

export async function listArticles(params: {
  limit?: number
  cursor?: string
  uiCategory?: string
  sort?: string
  topic?: string
}): Promise<ListArticlesResponse> {
  const query = new URLSearchParams()
  query.set('limit', String(params.limit ?? 20))
  if (params.cursor) query.set('cursor', params.cursor)
  if (params.uiCategory) query.set('uiCategory', params.uiCategory)
  if (params.sort) query.set('sort', params.sort)
  if (params.topic) query.set('topic', params.topic)
  const response = await fetch(`${API_BASE}/articles?${query.toString()}`)
  if (!response.ok) throw new Error('Unable to load articles')
  return (await response.json()) as ListArticlesResponse
}

export async function getArticleByIdOrSlug(idOrSlug: string): Promise<WebArticleDetail> {
  const response = await fetch(`${API_BASE}/articles/${encodeURIComponent(idOrSlug)}`)
  if (!response.ok) {
    if (response.status === 404) throw new Error('not_found')
    throw new Error('Unable to load article')
  }
  return (await response.json()) as WebArticleDetail
}

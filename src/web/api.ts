/**
 * Browser calls same-origin paths that match `api/*.ts` on Vercel (no rewrite required).
 * Override with VITE_PUBLIC_API_BASE if needed (e.g. absolute URL).
 * Local dev: vite.config maps these `/api/*` paths to the Cloud Function.
 */
const API_BASE = import.meta.env.VITE_PUBLIC_API_BASE ?? '/api'

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

function jsonContentType(response: Response): boolean {
  const ct = response.headers.get('content-type') ?? ''
  return ct.includes('application/json') || ct.includes('application/problem+json')
}

function normalizeCategoryRows(payload: unknown): WebCategory[] {
  if (Array.isArray(payload)) return payload as WebCategory[]
  if (payload && typeof payload === 'object') {
    const o = payload as Record<string, unknown>
    const raw = o.items ?? o.categories ?? o.data
    if (Array.isArray(raw)) return raw as WebCategory[]
  }
  return []
}

export async function listCategories(): Promise<WebCategory[]> {
  const response = await fetch(`${API_BASE}/categories`)
  if (!response.ok) throw new Error('Unable to load categories')
  if (!jsonContentType(response)) throw new Error('Unable to load categories')
  const payload = await response.json()
  return normalizeCategoryRows(payload)
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
  const response = await fetch(`${API_BASE}/articles-list?${query.toString()}`)
  if (!response.ok) throw new Error('Unable to load articles')
  if (!jsonContentType(response)) throw new Error('Unable to load articles')
  const data = (await response.json()) as Record<string, unknown>
  const items = Array.isArray(data.items) ? (data.items as WebArticleSummary[]) : []
  return {
    items,
    nextCursor: typeof data.nextCursor === 'string' ? data.nextCursor : null,
    hasMore: Boolean(data.hasMore),
  }
}

export async function getArticleByIdOrSlug(idOrSlug: string): Promise<WebArticleDetail> {
  const response = await fetch(
    `${API_BASE}/article-detail/${encodeURIComponent(idOrSlug)}`,
  )
  if (!response.ok) {
    if (response.status === 404) throw new Error('not_found')
    throw new Error('Unable to load article')
  }
  if (!jsonContentType(response)) throw new Error('Unable to load article')
  return (await response.json()) as WebArticleDetail
}

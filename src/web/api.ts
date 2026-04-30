/**
 * Browser calls **`/api/v1/*`** (rewritten on Vercel to `api/*.ts` handlers in `vercel.json`).
 * Override origin/prefix with `VITE_PUBLIC_API_BASE` only when the SPA and API live on different hosts.
 *
 * Prefer **`/api/v1/...`** for every fetch so prod rewrites (`/api/v1/categories` → `/api/categories`, etc.)
 * stay consistent; plain `/api/categories` can 404 on static-only hosts that do not ship the `api/` folder.
 */
function normalizedApiRoot(): string {
  let root = String(import.meta.env.VITE_PUBLIC_API_BASE ?? '/api').replace(/\/$/, '')
  /** `VITE_PUBLIC_API_BASE=https://site.com/api/v1` would double `/v1` in URLs — normalize to `/api`. */
  if (root.endsWith('/v1')) {
    root = root.slice(0, -3) || '/api'
    if (root === '') root = '/api'
  }
  return root
}

function webApiUrl(pathQueryOrHash: string): string {
  const p = pathQueryOrHash.startsWith('/') ? pathQueryOrHash : `/${pathQueryOrHash}`
  return `${normalizedApiRoot()}${p}`
}

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
  /** When set, must match the web URL slug exactly (Firestore / API parity). */
  canonicalSlug?: string
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
  /** Some APIs return the deep-linked row alongside `items` instead of reordering `items`. */
  leadStory?: WebArticleSummary
}

function pickStr(o: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return undefined
}

/** Map mixed API shapes (camelCase, snake_case, nested ids) into `WebArticleSummary` for stable UI matching. */
export function normalizeArticleSummaryFromApi(raw: unknown): WebArticleSummary {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      id: 'unknown',
      title: 'Untitled',
      publishedAt: new Date(0).toISOString(),
    }
  }
  const o = raw as Record<string, unknown>
  if (o.article && typeof o.article === 'object' && !Array.isArray(o.article)) {
    return normalizeArticleSummaryFromApi(o.article)
  }
  if (o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
    return normalizeArticleSummaryFromApi(o.data)
  }

  let slug = pickStr(o, ['slug', 'storySlug', 'story_slug', 'urlSlug', 'url_slug'])
  const pathRaw = pickStr(o, ['path', 'webPath', 'pathname', 'signalPath', 'web_path'])
  if (!slug && pathRaw && pathRaw.includes('/signal/')) {
    try {
      const seg = pathRaw.split('/signal/')[1]?.split('/')[0]?.split('?')[0]
      if (seg) slug = decodeURIComponent(seg)
    } catch {
      /* ignore */
    }
  }

  const id =
    pickStr(o, ['id', '_id', 'articleId', 'article_id', 'firebaseId']) ?? slug ?? 'unknown'

  const canonicalSlug = pickStr(o, ['canonicalSlug', 'canonical_slug', 'canonicalPath', 'canonical_path'])

  const title = pickStr(o, ['title', 'headline', 'metaTitle']) ?? 'Untitled'
  const publishedAt =
    pickStr(o, ['publishedAt', 'published_at', 'createdAt', 'created_at']) ??
    new Date(0).toISOString()

  const imageUrl = pickStr(o, [
    'imageUrl',
    'image_url',
    'coverImage',
    'cover_image',
    'heroImage',
    'hero_image',
    'thumbnailUrl',
    'thumbnail_url',
  ])

  const whyItMattersPreview = Array.isArray(o.whyItMattersPreview)
    ? (o.whyItMattersPreview as string[])
    : Array.isArray(o.why_it_matters_preview)
      ? (o.why_it_matters_preview as string[])
      : undefined
  const whyItMatters = Array.isArray(o.whyItMatters)
    ? (o.whyItMatters as string[])
    : Array.isArray(o.why_it_matters)
      ? (o.why_it_matters as string[])
      : undefined

  const disruptionScore =
    (typeof o.disruptionScore === 'number' || typeof o.disruptionScore === 'string'
      ? o.disruptionScore
      : undefined) ??
    (typeof o.disruption_score === 'number' || typeof o.disruption_score === 'string'
      ? o.disruption_score
      : undefined)

  const seo =
    o.seo && typeof o.seo === 'object' && !Array.isArray(o.seo)
      ? (o.seo as WebArticleSummary['seo'])
      : undefined

  return {
    id,
    slug,
    canonicalSlug,
    title,
    imageUrl,
    articleUrl:
      pickStr(o, ['articleUrl', 'article_url', 'canonicalSourceUrl', 'canonical_source_url']) ??
      undefined,
    author: pickStr(o, ['author', 'authorName', 'author_name']),
    uiCategory:
      pickStr(o, ['uiCategory', 'ui_category', 'categoryLabel', 'category_label']) ?? undefined,
    source: pickStr(o, ['source', 'publisher', 'publisherName']),
    category: pickStr(o, ['category', 'segment']) ?? undefined,
    topicSlugs: Array.isArray(o.topicSlugs)
      ? (o.topicSlugs as string[])
      : Array.isArray(o.topic_slugs)
        ? (o.topic_slugs as string[])
        : undefined,
    whyItMattersPreview,
    whyItMatters,
    publishedAt,
    disruptionScore,
    canonicalUrl: pickStr(o, ['canonicalUrl', 'canonical_url']),
    seo,
  }
}

const OPTIONAL_LEAD_KEYS = [
  'anchor',
  'anchorItem',
  'anchorStory',
  'pinnedItem',
  'pinned',
  'pinnedStory',
  'lead',
  'leadItem',
  'targetItem',
  'highlightedItem',
  'focusedItem',
  'focusedStory',
  'include',
  'included',
  'includedItem',
  'includedStory',
  'included_item',
  'included_story',
]

function extractLeadStory(data: Record<string, unknown>): WebArticleSummary | undefined {
  for (const key of OPTIONAL_LEAD_KEYS) {
    const v = data[key]
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const n = normalizeArticleSummaryFromApi(v)
      if (n.id !== 'unknown' || n.slug) return n
    }
    if (Array.isArray(v)) {
      for (const el of v) {
        if (el && typeof el === 'object' && !Array.isArray(el)) {
          const n = normalizeArticleSummaryFromApi(el)
          if (n.id !== 'unknown' || n.slug) return n
        }
      }
    }
  }
  return undefined
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
  const response = await fetch(webApiUrl('/v1/categories'))
  if (!response.ok) throw new Error('Unable to load categories')
  if (!jsonContentType(response)) throw new Error('Unable to load categories')
  const payload = await response.json()
  return normalizeCategoryRows(payload)
}

/**
 * Feed list. Proxied as `GET /api/v1/articles?…` → upstream `…/articles?…`.
 * On the first page only, pass pinned story keys; omit whenever `cursor` is set.
 */
export async function listArticles(params: {
  limit?: number
  cursor?: string
  uiCategory?: string
  sort?: string
  topic?: string
  /** First-page deep link key (pathname segment); sent as `anchorSlug` (Firebase webApi contract). */
  anchorSlug?: string
}): Promise<ListArticlesResponse> {
  const query = new URLSearchParams()
  query.set('limit', String(params.limit ?? 20))
  if (params.cursor) query.set('cursor', params.cursor)
  if (params.uiCategory) query.set('uiCategory', params.uiCategory)
  if (params.sort) query.set('sort', params.sort)
  if (params.topic) query.set('topic', params.topic)
  if (!params.cursor && params.anchorSlug) {
    query.set('anchorSlug', params.anchorSlug)
  }
  const response = await fetch(webApiUrl(`/v1/articles?${query.toString()}`))
  if (!response.ok) throw new Error('Unable to load articles')
  if (!jsonContentType(response)) throw new Error('Unable to load articles')
  const data = (await response.json()) as Record<string, unknown>
  const rawItems = Array.isArray(data.items) ? data.items : []
  const items = rawItems.map((row) => normalizeArticleSummaryFromApi(row))
  const leadStory = extractLeadStory(data)

  return {
    items,
    nextCursor: typeof data.nextCursor === 'string' ? data.nextCursor : null,
    hasMore: Boolean(data.hasMore),
    ...(leadStory ? { leadStory } : {}),
  }
}

/** Direct lookup when the list endpoint did not return the keyed story on the first page. */
export async function getArticleByIdOrSlug(
  idOrSlug: string,
  options?: { signal?: AbortSignal },
): Promise<WebArticleDetail> {
  const response = await fetch(webApiUrl(`/v1/articles/${encodeURIComponent(idOrSlug)}`), {
    signal: options?.signal,
  })
  if (!response.ok) {
    if (response.status === 404) throw new Error('not_found')
    throw new Error('Unable to load article')
  }
  if (!jsonContentType(response)) throw new Error('Unable to load article')
  const raw = await response.json()
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Unable to load article')
  }
  const r = raw as Record<string, unknown>
  return {
    ...(r as unknown as WebArticleDetail),
    ...normalizeArticleSummaryFromApi(r),
  } as WebArticleDetail
}

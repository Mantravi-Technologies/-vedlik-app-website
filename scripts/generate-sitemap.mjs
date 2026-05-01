/**
 * Sitemap generator: full catalog (default) or incremental + persisted master (optional).
 *
 * ## Full mode (default)
 * GET `{API_BASE}/v1/web/sitemap/articles?limit=&cursor=` — paginate until done.
 *
 * ## Incremental mode (`SITEMAP_USE_MASTER=1`)
 * 1. Load `public/sitemaps/article-master.json` (map of `loc` → `{ lastmod }`).
 * 2. If missing/empty → one full fetch (same as above), write master + XML.
 * 3. Else → GET delta with `publishedAfter` + `publishedBefore` (or legacy single param), merge into master, write master + XML.
 *
 * ### Backend contract (delta = same host, either option)
 *
 * **A — Window on existing articles route (matches webApi):**
 * `GET /v1/web/sitemap/articles?limit=500&publishedAfter={ISO}&publishedAtLt={ISO}&cursor=…`
 * **Single rule:** `publishedAt >= publishedAfter` when `publishedAfter` is set (inclusive lower);
 * `publishedAt < publishedAtLt` when `publishedAtLt` is set (**exclusive** upper — query param name on API).
 * If both set: **`publishedAfter` must be strictly `<` `publishedAtLt`** or API returns **400**.
 * Controller default **limit 500**, max **1000** (`normalizeSitemapLimit` on server).
 * Response: `{ items: [...], nextCursor?, hasMore? }` — each item: `slug` or `id`, plus `publishedAt` for `lastmod`.
 *
 * **B — Dedicated thin endpoint:** same query keys unless overridden via env.
 *
 * **Legacy — single lower bound only:** set `SITEMAP_SINCE_QUERY_KEY=publishedSince` (or any name) and `SITEMAP_PUBLISHED_BEFORE=0` to omit the upper bound param.
 * Same JSON shape; items may be only `{ slug, publishedAt?, updatedAt? }`.
 *
 * Optional: `{ removed: [ "slug-or-id" | "https://vedlik.com/signal/…" ] }` on any page to drop URLs from master (unpublish).
 *
 * Overlap: client sends `max(lastmod) - SITEMAP_SINCE_OVERLAP_MS` to avoid missing edge rows.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_URL = process.env.SITE_URL ?? 'https://vedlik.com'

function pickEnv(...keys) {
  for (const key of keys) {
    const v = process.env[key]
    if (typeof v === 'string' && v.trim()) return v.trim().replace(/\/+$/, '')
  }
  return null
}

/** Same rule as `api/categories.ts`: env may be `…cloudfunctions.net` or `…/webApi`. */
function webApiUpstreamRoot(raw) {
  const b = raw.replace(/\/$/, '')
  return b.endsWith('/webApi') ? b : `${b}/webApi`
}

/** Prefer direct upstream (CI/local); paths append `/v1/web/…` under this root. */
const rawUpstream = pickEnv('WEB_API_UPSTREAM', 'WEB_API_BASE')
const API_BASE = rawUpstream
  ? webApiUpstreamRoot(rawUpstream)
  : 'https://us-central1-gen-lang-client-0290483815.cloudfunctions.net/webApi'

function upstreamAuthHeaders() {
  const secret = pickEnv('WEB_API_SECRET')
  const h = {}
  if (secret) {
    h['x-web-api-secret'] = secret
  }
  return h
}
/** Align with webApi sitemap: default 500, clamp 1…1000 (server `normalizeSitemapLimit`). */
const RAW_SITEMAP_LIMIT = Number(process.env.SITEMAP_API_LIMIT ?? 500)
const API_LIMIT = Number.isFinite(RAW_SITEMAP_LIMIT)
  ? Math.min(1000, Math.max(1, Math.floor(RAW_SITEMAP_LIMIT)))
  : 500
const URLS_PER_FILE = Number(process.env.SITEMAP_URLS_PER_FILE ?? 5000)
const LATEST_WINDOW_DAYS = Number(process.env.SITEMAP_LATEST_DAYS ?? 5)
const LATEST_MAX_URLS = Number(process.env.SITEMAP_LATEST_MAX_URLS ?? 1000)

const USE_MASTER = process.env.SITEMAP_USE_MASTER === '1' || process.env.SITEMAP_INCREMENTAL === '1'
const FORCE_FULL_SYNC = process.env.SITEMAP_FULL_SYNC === '1'
const DELTA_FALLBACK_FULL = process.env.SITEMAP_DELTA_FALLBACK_FULL !== '0'
const SINCE_OVERLAP_MS = Number(process.env.SITEMAP_SINCE_OVERLAP_MS ?? 120_000)
const ARTICLES_REL_PATH = `/${(process.env.SITEMAP_ARTICLES_REL_PATH ?? '/v1/web/sitemap/articles').replace(/^\/+/, '')}`
const rawDelta = (process.env.SITEMAP_DELTA_REL_PATH ?? '').trim()
/** If set (e.g. `v1/web/sitemap/article-delta`), used for incremental fetches instead of articles + since. */
const DELTA_REL_PATH = rawDelta ? `/${rawDelta.replace(/^\/+/, '')}` : ''
const PUBLISHED_AFTER_KEY = (process.env.SITEMAP_PUBLISHED_AFTER_KEY ?? 'publishedAfter').trim() || 'publishedAfter'
/** Exclusive upper bound; webApi uses `publishedAtLt` (Firestore `publishedAt < publishedAtLt`). */
const PUBLISHED_AT_LT_KEY = (process.env.SITEMAP_PUBLISHED_AT_LT_KEY ?? 'publishedAtLt').trim() || 'publishedAtLt'
/** If set (e.g. `publishedSince`), incremental sends only this one param + value; ignores after / upper pair. */
const LEGACY_SINCE_QUERY_KEY = (process.env.SITEMAP_SINCE_QUERY_KEY ?? '').trim()
/** When not `0`, incremental adds `publishedAtLt=now` (UTC ISO). Set `0` for lower-bound-only APIs. */
const USE_PUBLISHED_AT_LT = process.env.SITEMAP_PUBLISHED_BEFORE !== '0' && process.env.SITEMAP_PUBLISHED_AT_LT !== '0'

function buildIncrementalQueryParams(sinceIso) {
  if (LEGACY_SINCE_QUERY_KEY) return { [LEGACY_SINCE_QUERY_KEY]: sinceIso }
  const p = { [PUBLISHED_AFTER_KEY]: sinceIso }
  if (USE_PUBLISHED_AT_LT) p[PUBLISHED_AT_LT_KEY] = new Date().toISOString()
  return p
}

const STATIC_PATHS = [
  '/',
  '/web',
  '/signal',
  '/app',
  '/privacy-policy',
  '/terms-and-conditions',
  '/data-deletion-request',
  '/support',
]

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.resolve(__dirname, '..', 'public')
const sitemapsDir = path.join(publicDir, 'sitemaps')
const DEFAULT_MASTER_PATH = path.join(sitemapsDir, 'article-master.json')
const MASTER_PATH = process.env.SITEMAP_MASTER_PATH
  ? path.isAbsolute(process.env.SITEMAP_MASTER_PATH)
    ? process.env.SITEMAP_MASTER_PATH
    : path.resolve(__dirname, '..', process.env.SITEMAP_MASTER_PATH)
  : DEFAULT_MASTER_PATH

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function sameSiteHostname(url, siteBase) {
  const a = url.hostname.replace(/^www\./i, '').toLowerCase()
  const b = new URL(siteBase).hostname.replace(/^www\./i, '').toLowerCase()
  return a === b
}

/** API rows may use `loc`, `url`, or `canonicalUrl`; hosts may use `www.` — output always uses SITE_URL origin. */
function normalizeSitemapLoc(rawLoc) {
  if (typeof rawLoc !== 'string' || rawLoc.length === 0) return null
  try {
    const url = rawLoc.startsWith('/')
      ? new URL(rawLoc, SITE_URL)
      : new URL(rawLoc)
    if (!sameSiteHostname(url, SITE_URL)) return null
    let path = url.pathname
    if (path.startsWith('/article/')) {
      path = path.replace(/^\/article\//, '/signal/')
    }
    const out = new URL(path + url.search + url.hash, SITE_URL)
    return out.toString()
  } catch {
    return null
  }
}

function pickLocFromItem(item) {
  if (!item || typeof item !== 'object') return null
  const o = item
  const a = o.loc
  if (typeof a === 'string' && a.trim()) return a.trim()
  const b = o.canonicalUrl ?? o.canonical_url
  if (typeof b === 'string' && b.trim()) return b.trim()
  const c = o.url
  if (typeof c === 'string' && c.trim()) return c.trim()
  return null
}

/** Sitemap API often puts the *source* URL in `loc`; crawlers need our on-site Signal URL. */
function vedlikSignalLocFromItem(item) {
  if (!item || typeof item !== 'object') return null
  const slug = typeof item.slug === 'string' && item.slug.trim() ? item.slug.trim() : null
  const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : null
  const seg = slug ?? id
  if (!seg) return null
  return `${SITE_URL}/signal/${encodeURIComponent(seg)}`
}

function itemToEntry(item) {
  const onSite = vedlikSignalLocFromItem(item)
  const loc =
    (onSite && normalizeSitemapLoc(onSite)) ?? normalizeSitemapLoc(pickLocFromItem(item))
  if (!loc) return null
  return {
    loc,
    lastmod: item.updatedAt ?? item.updatedAtUtc ?? item.publishedAt ?? item.publishedAtUtc ?? item.createdAt ?? null,
    changefreq: 'always',
    priority: 0.9,
  }
}

function mergeEntryIntoMap(map, candidate) {
  const existing = map.get(candidate.loc)
  if (!existing) {
    map.set(candidate.loc, candidate)
    return
  }
  const existingDate = existing.lastmod ? Date.parse(existing.lastmod) : 0
  const candidateDate = candidate.lastmod ? Date.parse(candidate.lastmod) : 0
  if (candidateDate >= existingDate) map.set(candidate.loc, candidate)
}

function normalizedRemovedLoc(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const s = raw.trim()
  if (s.startsWith('http')) return normalizeSitemapLoc(s)
  const loc = vedlikSignalLocFromItem({ slug: s }) ?? vedlikSignalLocFromItem({ id: s })
  return loc ? normalizeSitemapLoc(loc) : null
}

function applyRemovedToMap(map, removed) {
  if (!Array.isArray(removed)) return
  for (const raw of removed) {
    const loc = normalizedRemovedLoc(String(raw))
    if (loc) map.delete(loc)
  }
}

/** @returns {Promise<Map<string, { loc: string, lastmod: string | null, changefreq: string, priority: number }>>} */
async function readMasterJson() {
  try {
    const raw = await readFile(MASTER_PATH, 'utf8')
    const j = JSON.parse(raw)
    if (j.v !== 1 || typeof j.entries !== 'object' || !j.entries) return null
    const map = new Map()
    for (const [loc, row] of Object.entries(j.entries)) {
      if (typeof loc !== 'string') continue
      const lastmod = row && typeof row.lastmod === 'string' ? row.lastmod : null
      mergeEntryIntoMap(map, {
        loc,
        lastmod,
        changefreq: 'always',
        priority: 0.9,
      })
    }
    return map.size > 0 ? map : null
  } catch (e) {
    if (e && e.code === 'ENOENT') return null
    throw e
  }
}

async function writeMasterJson(map) {
  /** @type {Record<string, { lastmod: string | null }>} */
  const entries = {}
  for (const [, e] of map) {
    entries[e.loc] = { lastmod: e.lastmod }
  }
  const body = JSON.stringify({
    v: 1,
    savedAt: new Date().toISOString(),
    count: map.size,
    entries,
  })
  await mkdir(path.dirname(MASTER_PATH), { recursive: true })
  await writeFile(MASTER_PATH, body, 'utf8')
}

function mapEntriesToSortedArticleArray(map) {
  return [...map.values()].sort((a, b) => {
    const aTime = a.lastmod ? Date.parse(a.lastmod) : 0
    const bTime = b.lastmod ? Date.parse(b.lastmod) : 0
    return bTime - aTime
  })
}

/** Max lastmod in map; overlap subtracted before sending as `publishedAfter` (or legacy since key). */
function computeSinceFromMaster(map) {
  let maxT = 0
  for (const e of map.values()) {
    const t = e.lastmod ? Date.parse(e.lastmod) : 0
    if (Number.isFinite(t) && t > maxT) maxT = t
  }
  if (maxT <= 0) return null
  return new Date(Math.max(0, maxT - SINCE_OVERLAP_MS)).toISOString()
}

/**
 * Paginated fetch; merges into `map`. Optionally applies `removed` from each payload.
 * @returns {Promise<void>}
 */
async function fetchAndMergeArticlesPages(map, extraParams = {}, pathSuffix = ARTICLES_REL_PATH) {
  let cursor = null
  let page = 0
  while (true) {
    const qs = new URLSearchParams()
    qs.set('limit', String(API_LIMIT))
    for (const [k, val] of Object.entries(extraParams)) {
      if (val != null && val !== '') qs.set(k, String(val))
    }
    if (cursor) qs.set('cursor', cursor)
    const url = `${API_BASE}${pathSuffix}?${qs.toString()}`
    const response = await fetch(url, { headers: upstreamAuthHeaders(), cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Sitemap API failed (${response.status}) for ${url}`)
    }
    const payload = await response.json()
    applyRemovedToMap(map, payload.removed)
    const items = Array.isArray(payload.items) ? payload.items : []
    for (const item of items) {
      const cand = itemToEntry(item)
      if (cand) mergeEntryIntoMap(map, cand)
    }
    page += 1
    console.log(`Fetched ${pathSuffix} page ${page}: ${items.length} items (${map.size} URLs in merged map)`)
    const nextCursor = payload.nextCursor ?? null
    const hasMore = Boolean(payload.hasMore && nextCursor)
    if (!hasMore) break
    cursor = nextCursor
  }
}

function buildUrlsetXml(urls) {
  const body = urls
    .map((url) => {
      const lastmodTag = url.lastmod ? `\n    <lastmod>${escapeXml(url.lastmod)}</lastmod>` : ''
      const changefreq = url.changefreq ?? 'always'
      const priority = typeof url.priority === 'number' ? url.priority : 0.9
      return `  <url>\n    <loc>${escapeXml(url.loc)}</loc>${lastmodTag}\n    <changefreq>${escapeXml(changefreq)}</changefreq>\n    <priority>${escapeXml(priority.toFixed(1))}</priority>\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

function buildSitemapIndexXml(sitemaps) {
  const body = sitemaps
    .map((item) => {
      const lastmodTag = item.lastmod ? `\n    <lastmod>${escapeXml(item.lastmod)}</lastmod>` : ''
      return `  <sitemap>\n    <loc>${escapeXml(item.loc)}</loc>${lastmodTag}\n  </sitemap>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`
}

async function resolveArticleEntries() {
  /** @type {Map<string, { loc: string, lastmod: string | null, changefreq: string, priority: number }>} */
  const articleMap = new Map()
  let mode = 'full-no-master'

  if (USE_MASTER && !FORCE_FULL_SYNC) {
    const master = await readMasterJson()
    if (!master) {
      console.log('[sitemap] no article-master.json (or invalid) — bootstrap: full pagination')
      await fetchAndMergeArticlesPages(articleMap)
      mode = 'bootstrap-full'
    } else {
      for (const [, e] of master) articleMap.set(e.loc, e)
      const since = computeSinceFromMaster(articleMap)
      const pathSuffix = DELTA_REL_PATH || ARTICLES_REL_PATH
      if (!since) {
        console.warn('[sitemap] master has no valid lastmod — full pagination')
        await fetchAndMergeArticlesPages(articleMap)
        mode = 'full-master-no-dates'
      } else {
        try {
          const incQs = buildIncrementalQueryParams(since)
          console.log(`[sitemap] incremental ${JSON.stringify(incQs)} path=${pathSuffix}`)
          await fetchAndMergeArticlesPages(articleMap, incQs, pathSuffix)
          mode = 'incremental'
        } catch (err) {
          if (!DELTA_FALLBACK_FULL) throw err
          console.warn('[sitemap] incremental failed; falling back to full pagination:', err?.message ?? err)
          articleMap.clear()
          await fetchAndMergeArticlesPages(articleMap)
          mode = 'full-after-incremental-failure'
        }
      }
    }
  } else {
    if (USE_MASTER && FORCE_FULL_SYNC) console.log('[sitemap] SITEMAP_FULL_SYNC=1 — full pagination')
    await fetchAndMergeArticlesPages(articleMap)
    mode = USE_MASTER && FORCE_FULL_SYNC ? 'forced-full-for-master' : 'full-single-run'
  }

  const entries = mapEntriesToSortedArticleArray(articleMap)
  console.log(`[sitemap] resolved ${entries.length} article URLs (mode=${mode})`)
  if (USE_MASTER) await writeMasterJson(articleMap)
  return entries
}

async function main() {
  await mkdir(sitemapsDir, { recursive: true })

  const nowIso = new Date().toISOString()
  const staticUrls = STATIC_PATHS.map((routePath) => ({
    loc: `${SITE_URL}${routePath === '/' ? '' : routePath}`,
    lastmod: nowIso,
    changefreq: 'daily',
    priority: routePath === '/' ? 1.0 : 0.7,
  }))
  const staticSitemapXml = buildUrlsetXml(staticUrls)
  await writeFile(path.join(publicDir, 'sitemap-static.xml'), staticSitemapXml, 'utf8')

  const articleEntries = await resolveArticleEntries()
  const latestCutoffMs = Date.now() - LATEST_WINDOW_DAYS * 24 * 60 * 60 * 1000
  function lastmodMs(item) {
    if (!item.lastmod) return null
    const t = Date.parse(item.lastmod)
    return Number.isFinite(t) ? t : null
  }
  let latestEntries = articleEntries
    .filter((item) => {
      const t = lastmodMs(item)
      return t != null && t >= latestCutoffMs
    })
    .slice(0, LATEST_MAX_URLS)
  /** If the rolling window is too tight or dates are odd, keep newest N so “latest” is never empty while articles exist. */
  if (latestEntries.length === 0 && articleEntries.length > 0) {
    const n = Math.min(200, LATEST_MAX_URLS, articleEntries.length)
    console.warn(
      `sitemap-latest: no URLs in last ${LATEST_WINDOW_DAYS}d window; using top ${n} articles by recency as fallback`,
    )
    latestEntries = articleEntries.slice(0, n)
  }
  const sitemapIndexEntries = [
    {
      loc: `${SITE_URL}/sitemap-static.xml`,
      lastmod: nowIso,
    },
  ]

  const latestSitemapXml = buildUrlsetXml(latestEntries)
  await writeFile(path.join(sitemapsDir, 'sitemap-latest.xml'), latestSitemapXml, 'utf8')
  sitemapIndexEntries.push({
    loc: `${SITE_URL}/sitemaps/sitemap-latest.xml`,
    lastmod: latestEntries[0]?.lastmod ?? nowIso,
  })

  let fileCount = 0
  for (let i = 0; i < articleEntries.length; i += URLS_PER_FILE) {
    const chunk = articleEntries.slice(i, i + URLS_PER_FILE)
    fileCount += 1
    const fileName = `sitemap-articles-${fileCount}.xml`
    const filePath = path.join(sitemapsDir, fileName)
    const xml = buildUrlsetXml(chunk)
    await writeFile(filePath, xml, 'utf8')
    sitemapIndexEntries.push({
      loc: `${SITE_URL}/sitemaps/${fileName}`,
      lastmod: chunk[0]?.lastmod ?? nowIso,
    })
  }

  const sitemapIndexXml = buildSitemapIndexXml(sitemapIndexEntries)
  await writeFile(path.join(publicDir, 'sitemap_index.xml'), sitemapIndexXml, 'utf8')
  await mkdir(path.join(publicDir, 'sitemap'), { recursive: true })
  await writeFile(path.join(publicDir, 'sitemap', 'sitemap.xml'), sitemapIndexXml, 'utf8')
  // Keep a compatibility alias for crawlers/tools still checking /sitemap.xml.
  await writeFile(path.join(publicDir, 'sitemap.xml'), sitemapIndexXml, 'utf8')

  console.log(
    `Generated sitemap_index.xml (+ sitemap.xml alias), sitemap-latest.xml (${latestEntries.length} URLs), and ${fileCount} article sitemap file(s) with ${articleEntries.length} deduplicated article URLs.`
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

import { mkdir, writeFile } from 'node:fs/promises'
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
const API_LIMIT = Number(process.env.SITEMAP_API_LIMIT ?? 1000)
const URLS_PER_FILE = Number(process.env.SITEMAP_URLS_PER_FILE ?? 5000)
const LATEST_WINDOW_DAYS = Number(process.env.SITEMAP_LATEST_DAYS ?? 2)
const LATEST_MAX_URLS = Number(process.env.SITEMAP_LATEST_MAX_URLS ?? 1000)

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

async function fetchArticleSitemapEntries() {
  const unique = new Map()
  let cursor = null
  let page = 0
  while (true) {
    const qs = new URLSearchParams()
    qs.set('limit', String(API_LIMIT))
    if (cursor) qs.set('cursor', cursor)
    const url = `${API_BASE}/v1/web/sitemap/articles?${qs.toString()}`
    const response = await fetch(url, { headers: upstreamAuthHeaders(), cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Sitemap API failed (${response.status}) for ${url}`)
    }
    const payload = await response.json()
    const items = Array.isArray(payload.items) ? payload.items : []
    for (const item of items) {
      const onSite = vedlikSignalLocFromItem(item)
      const loc =
        (onSite && normalizeSitemapLoc(onSite)) ??
        normalizeSitemapLoc(pickLocFromItem(item))
      if (!loc) continue
      const existing = unique.get(loc)
      const candidate = {
        loc,
        lastmod: item.updatedAt ?? item.publishedAt ?? null,
        changefreq: 'always',
        priority: 0.9,
      }
      if (!existing) {
        unique.set(loc, candidate)
      } else {
        const existingDate = existing.lastmod ? Date.parse(existing.lastmod) : 0
        const candidateDate = candidate.lastmod ? Date.parse(candidate.lastmod) : 0
        if (candidateDate > existingDate) unique.set(loc, candidate)
      }
    }
    page += 1
    const nextCursor = payload.nextCursor ?? null
    const hasMore = Boolean(payload.hasMore && nextCursor)
    console.log(
      `Fetched sitemap page ${page}: ${items.length} items (${unique.size} Vedlik /signal URLs after dedupe so far)`,
    )
    if (!hasMore) break
    cursor = nextCursor
  }
  return Array.from(unique.values()).sort((a, b) => {
    const aTime = a.lastmod ? Date.parse(a.lastmod) : 0
    const bTime = b.lastmod ? Date.parse(b.lastmod) : 0
    return bTime - aTime
  })
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

  const articleEntries = await fetchArticleSitemapEntries()
  const latestCutoffMs = Date.now() - LATEST_WINDOW_DAYS * 24 * 60 * 60 * 1000
  const latestEntries = articleEntries
    .filter((item) => (item.lastmod ? Date.parse(item.lastmod) >= latestCutoffMs : false))
    .slice(0, LATEST_MAX_URLS)
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

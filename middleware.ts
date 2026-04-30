/**
 * Link-preview bots (WhatsApp, Facebook, etc.) fetch HTML without running the SPA.
 * For `/signal/:slug` we return minimal HTML with og:image so shares show the article image.
 * Real browsers still get `next()` → normal Vite SPA.
 */
import { next } from '@vercel/edge'

const SITE_URL = 'https://vedlik.com'
const FALLBACK_OG = `${SITE_URL}/assets/images/logo.png`

const BOT_UA =
  /WhatsApp|facebookexternalhit|Facebot|Twitterbot|Slackbot|LinkedInBot|Telegram|Discord|Googlebot|bingbot|Pinterest|vkShare|Applebot/i

function webApiUpstreamRoot(raw: string): string {
  const b = raw.replace(/\/$/, '')
  return b.endsWith('/webApi') ? b : `${b}/webApi`
}

function readUpstreamRaw(): string | null {
  const raw = process.env.WEB_API_UPSTREAM
  if (!raw || typeof raw !== 'string') return null
  let s = raw.trim().replace(/^[\uFEFF\s]+/, '')
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim()
  }
  if (!s) return null
  return s.replace(/\/+$/, '')
}

function upstreamHeaders(): Record<string, string> {
  const h: Record<string, string> = { accept: 'application/json' }
  const secret = process.env.WEB_API_SECRET
  if (typeof secret === 'string' && secret.trim()) {
    h['x-web-api-secret'] = secret.trim()
  }
  return h
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
}

function absoluteOgImage(raw: string | undefined): string {
  const u = raw?.trim()
  if (!u) return FALLBACK_OG
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  if (u.startsWith('/')) return `${SITE_URL}${u}`
  return FALLBACK_OG
}

function pickSeoString(seo: unknown, key: string): string | undefined {
  if (!seo || typeof seo !== 'object') return undefined
  const v = (seo as Record<string, unknown>)[key]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

export const config = {
  matcher: '/signal/:path*',
}

export default async function middleware(request: Request): Promise<Response> {
  const ua = request.headers.get('user-agent') ?? ''
  if (!BOT_UA.test(ua)) {
    return next()
  }

  const url = new URL(request.url)
  const m = url.pathname.match(/^\/signal\/([^/]+)\/?$/)
  if (!m?.[1]) {
    return next()
  }

  let segment: string
  try {
    segment = decodeURIComponent(m[1])
  } catch {
    return next()
  }
  if (!segment) {
    return next()
  }

  const rawBase = readUpstreamRaw()
  if (!rawBase) {
    return next()
  }

  let target: string
  try {
    const root = webApiUpstreamRoot(rawBase)
    target = `${root}/v1/web/articles/${encodeURIComponent(segment)}`
    new URL(target)
  } catch {
    return next()
  }

  let r: Response
  try {
    r = await fetch(target, { headers: upstreamHeaders(), cache: 'no-store' })
  } catch {
    return next()
  }

  if (!r.ok) {
    return next()
  }

  const ct = r.headers.get('content-type') ?? ''
  if (!ct.toLowerCase().includes('application/json')) {
    return next()
  }

  let data: Record<string, unknown>
  try {
    data = (await r.json()) as Record<string, unknown>
  } catch {
    return next()
  }

  const seo = data.seo
  const title =
    pickSeoString(seo, 'metaTitle') ??
    (typeof data.title === 'string' ? data.title : null) ??
    'Vedlik'
  const description =
    pickSeoString(seo, 'metaDescription') ??
    (Array.isArray(data.whyItMattersPreview) && typeof data.whyItMattersPreview[0] === 'string'
      ? data.whyItMattersPreview[0]
      : null) ??
    'Read AI and tech context on Vedlik.'
  const ogImageRaw = pickSeoString(seo, 'ogImage') ?? (typeof data.imageUrl === 'string' ? data.imageUrl : undefined)
  const ogImageAbs = absoluteOgImage(ogImageRaw)

  const canonical = `${SITE_URL}${url.pathname.replace(/\/$/, '')}`

  const safeTitle = escapeAttr(title.slice(0, 200))
  const safeDesc = escapeAttr(description.slice(0, 320))
  const safeOg = escapeAttr(ogImageAbs)
  const safeUrl = escapeAttr(canonical)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${safeTitle}</title>
<link rel="canonical" href="${safeUrl}" />
<meta name="description" content="${safeDesc}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Vedlik" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDesc}" />
<meta property="og:url" content="${safeUrl}" />
<meta property="og:image" content="${safeOg}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDesc}" />
<meta name="twitter:image" content="${safeOg}" />
</head>
<body>
<p><a href="${safeUrl}">Open this Signal on Vedlik</a></p>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=120, stale-while-revalidate=600',
    },
  })
}

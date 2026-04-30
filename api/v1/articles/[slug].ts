/**
 * GET /api/v1/articles/:slug — self-contained proxy (slug from query for Vercel dynamic route).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

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

function upstreamSecretHeaders(): Record<string, string> {
  const fwd: Record<string, string> = {}
  const secret = process.env.WEB_API_SECRET
  if (typeof secret === 'string' && secret.trim()) {
    fwd['x-web-api-secret'] = secret.trim()
  }
  return fwd
}

async function forwardUpstreamGet(
  res: VercelResponse,
  target: string,
  cacheControl: string,
  logLabel: string,
): Promise<void> {
  try {
    const r = await fetch(target, { headers: upstreamSecretHeaders(), cache: 'no-store' })
    const body = await r.text()
    const ct = r.headers.get('content-type')
    if (ct) res.setHeader('content-type', ct)
    res.setHeader('cache-control', cacheControl)
    res.setHeader('cdn-cache-control', 'private, no-store')
    res.setHeader('vercel-cdn-cache-control', 'private, no-store')
    res.status(r.status).send(body)
  } catch (err) {
    console.error(`[${logLabel}] upstream:`, err)
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.status(502).json({ error: 'Bad gateway' })
  }
}

function resolveSlug(req: VercelRequest): string | undefined {
  const q = req.query.slug
  if (typeof q === 'string' && q.length > 0) return q
  if (Array.isArray(q) && q[0] && typeof q[0] === 'string') return q[0]

  const rawUrl = typeof req.url === 'string' ? req.url : ''
  try {
    const u = new URL(rawUrl, 'http://internal')
    const mDetail = u.pathname.match(/^\/api\/article-detail\/(.+)$/)
    if (mDetail?.[1]) {
      try {
        return decodeURIComponent(mDetail[1])
      } catch {
        return mDetail[1]
      }
    }
    const mV1 = u.pathname.match(/^\/api\/v1\/articles\/([^/]+)\/?$/)
    if (mV1?.[1]) {
      try {
        return decodeURIComponent(mV1[1])
      } catch {
        return mV1[1]
      }
    }
  } catch {
    /* ignore */
  }
  return undefined
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const rawBase = readUpstreamRaw()
  if (!rawBase) {
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.status(500).json({ error: 'WEB_API_UPSTREAM is not configured' })
    return
  }

  const slug = resolveSlug(req)
  if (!slug) {
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.status(400).json({ error: 'Missing slug' })
    return
  }

  let target: string
  try {
    const root = webApiUpstreamRoot(rawBase)
    target = `${root}/v1/web/articles/${encodeURIComponent(slug)}`
    new URL(target)
  } catch {
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.status(500).json({
      error: 'WEB_API_UPSTREAM is invalid',
      hint: 'Use a full HTTPS origin, e.g. https://us-central1-….cloudfunctions.net (no trailing spaces or quotes)',
    })
    return
  }

  await forwardUpstreamGet(
    res,
    target,
    'public, s-maxage=60, stale-while-revalidate=120',
    'webApi/v1/articles/[slug]',
  )
}

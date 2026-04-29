/**
 * GET /api/article-detail?slug=… (preferred) or GET /api/article-detail/:slug (legacy path).
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

function resolveSlug(req: VercelRequest): string | undefined {
  const q = req.query.slug
  if (typeof q === 'string' && q.length > 0) return q
  if (Array.isArray(q) && q[0] && typeof q[0] === 'string') return q[0]

  const rawUrl = typeof req.url === 'string' ? req.url : ''
  try {
    const u = new URL(rawUrl, 'http://internal')
    const m = u.pathname.match(/^\/api\/article-detail\/(.+)$/)
    if (m?.[1]) {
      try {
        return decodeURIComponent(m[1])
      } catch {
        return m[1]
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

  const fwd: Record<string, string> = {}
  const secret = process.env.WEB_API_SECRET
  if (typeof secret === 'string' && secret.trim()) {
    fwd['x-web-api-secret'] = secret.trim()
  }

  try {
    const r = await fetch(target, { headers: fwd, cache: 'no-store' })
    const body = await r.text()
    const ct = r.headers.get('content-type')
    if (ct) res.setHeader('content-type', ct)
    res.setHeader('cache-control', 'public, s-maxage=60, stale-while-revalidate=120')
    res.status(r.status).send(body)
  } catch (err) {
    console.error('[api/article-detail] upstream:', err)
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.status(502).json({ error: 'Bad gateway' })
  }
}

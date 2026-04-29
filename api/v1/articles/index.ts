/**
 * GET /api/v1/articles → upstream …/webApi/v1/web/articles
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

/** Preserve client query string for passthrough. */
function searchFromReq(req: VercelRequest): string {
  const rawUrl = typeof req.url === 'string' ? req.url : ''
  const qi = rawUrl.indexOf('?')
  if (qi >= 0) return rawUrl.slice(qi)
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(req.query ?? {})) {
    if (Array.isArray(v)) {
      v.forEach((item) => params.append(k, item))
    } else if (v !== undefined) {
      params.append(k, v)
    }
  }
  const s = params.toString()
  return s ? `?${s}` : ''
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

  const search = searchFromReq(req)

  let target: string
  try {
    const root = webApiUpstreamRoot(rawBase)
    target = `${root}/v1/web/articles${search}`
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
    res.setHeader('cache-control', 'public, s-maxage=30, stale-while-revalidate=60')
    res.status(r.status).send(body)
  } catch (err) {
    console.error('[api/v1/articles] upstream:', err)
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.status(502).json({ error: 'Bad gateway' })
  }
}

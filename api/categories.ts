/**
 * GET /api/categories — proxy to Firebase `…/webApi/v1/web/categories`.
 * Intentionally self-contained: Vercel ships one compiled file per Serverless route; relative
 * imports to other repo files under `api/` do not reliably land in `/var/task` (NODE ESM
 * ERR_MODULE_NOT_FOUND).
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

  let target: string
  try {
    const root = webApiUpstreamRoot(rawBase)
    target = `${root}/v1/web/categories`
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
    'public, s-maxage=300, stale-while-revalidate=600',
    'webApi/categories',
  )
}

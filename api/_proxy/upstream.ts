/**
 * Shared Firebase webApi forwarder. Lives under `api/_proxy/` so Vercel bundles it with route
 * entrypoints; leading `_` excludes this path from becoming its own HTTP route.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export function webApiUpstreamRoot(raw: string): string {
  const b = raw.replace(/\/$/, '')
  return b.endsWith('/webApi') ? b : `${b}/webApi`
}

export function readUpstreamRaw(): string | null {
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

export function upstreamSecretHeaders(): Record<string, string> {
  const fwd: Record<string, string> = {}
  const secret = process.env.WEB_API_SECRET
  if (typeof secret === 'string' && secret.trim()) {
    fwd['x-web-api-secret'] = secret.trim()
  }
  return fwd
}

export async function forwardUpstreamGet(
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
    res.status(r.status).send(body)
  } catch (err) {
    console.error(`[${logLabel}] upstream:`, err)
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.status(502).json({ error: 'Bad gateway' })
  }
}

export function searchFromReq(req: VercelRequest): string {
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

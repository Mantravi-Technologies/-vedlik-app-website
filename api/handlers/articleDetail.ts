import type { VercelRequest, VercelResponse } from '@vercel/node'

import { forwardUpstreamGet, readUpstreamRaw, webApiUpstreamRoot } from '../lib/webApiUpstream'

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

export default async function articleDetailHandler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
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
    'api/article-detail',
  )
}

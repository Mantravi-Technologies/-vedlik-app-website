import type { VercelRequest, VercelResponse } from '@vercel/node'

import {
  forwardUpstreamGet,
  readUpstreamRaw,
  searchFromReq,
  webApiUpstreamRoot,
} from './upstream'

export default async function articlesListHandler(
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

  await forwardUpstreamGet(
    res,
    target,
    'public, s-maxage=30, stale-while-revalidate=60',
    'webApi/articles-list',
  )
}

/**
 * GET /api/v1/articles/:slug → upstream …/webApi/v1/web/articles/:slug
 */
import { webApiUpstreamRoot } from '../../_lib/upstreamBase'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const upstreamBase = process.env.WEB_API_UPSTREAM
  if (!upstreamBase || typeof upstreamBase !== 'string') {
    return new Response(JSON.stringify({ error: 'WEB_API_UPSTREAM is not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }

  const url = new URL(request.url)
  const match = url.pathname.match(/\/api\/v1\/articles\/([^/]+)\/?$/)
  const slug = match?.[1]
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }

  const target = `${webApiUpstreamRoot(upstreamBase)}/v1/web/articles/${encodeURIComponent(slug)}`
  const headers: Record<string, string> = {}
  const secret = process.env.WEB_API_SECRET
  if (secret) headers['x-web-api-secret'] = secret

  const r = await fetch(target, { headers, cache: 'no-store' })
  const body = await r.text()
  const out = new Response(body, { status: r.status })
  const ct = r.headers.get('content-type')
  if (ct) out.headers.set('content-type', ct)
  out.headers.set('cache-control', 'public, s-maxage=60, stale-while-revalidate=120')
  return out
}

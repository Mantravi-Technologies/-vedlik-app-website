/**
 * GET /api/v1/articles → upstream …/webApi/v1/web/articles
 *
 * Env (Vercel / local preview): WEB_API_UPSTREAM=https://….cloudfunctions.net/webApi
 * Optional: WEB_API_SECRET → forwarded as header x-web-api-secret
 */

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
  const target = `${upstreamBase.replace(/\/$/, '')}/v1/web/articles${url.search}`

  const headers: Record<string, string> = {}
  const secret = process.env.WEB_API_SECRET
  if (secret) headers['x-web-api-secret'] = secret

  const r = await fetch(target, { headers, cache: 'no-store' })
  const body = await r.text()
  const out = new Response(body, { status: r.status })
  const ct = r.headers.get('content-type')
  if (ct) out.headers.set('content-type', ct)
  out.headers.set('cache-control', 'public, s-maxage=30, stale-while-revalidate=60')
  return out
}

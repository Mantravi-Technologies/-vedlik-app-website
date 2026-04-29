/**
 * Vite dev proxy: `/api/v1/*` → `${host}/webApi/v1/web/*`.
 * Vercel handlers must use the same path segment so `WEB_API_UPSTREAM` may be either
 * `https://…cloudfunctions.net` or `https://…cloudfunctions.net/webApi`.
 */
export function webApiUpstreamRoot(raw: string): string {
  const b = raw.replace(/\/$/, '')
  return b.endsWith('/webApi') ? b : `${b}/webApi`
}

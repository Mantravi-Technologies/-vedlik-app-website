/**
 * Same path semantics as vite.config proxy rewrite to `/webApi/v1/web/*`.
 */
export function webApiUpstreamRoot(raw: string): string {
  const b = raw.replace(/\/$/, '')
  return b.endsWith('/webApi') ? b : `${b}/webApi`
}

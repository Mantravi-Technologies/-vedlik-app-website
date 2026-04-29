/** Routes handled by client-side AppRouter (static hosts must still rewrite unknown paths to index.html). */
export const SPA_ROUTE_PATHS = new Set([
  '/',
  '/web',
  '/app',
  '/privacy-policy',
  '/terms-and-conditions',
  '/data-deletion-request',
  '/support',
])

const SPA_ROUTE_PREFIXES = ['/article/', '/signal/', '/topic/']

export function normalizePathname(path: string): string {
  const p = path.replace(/\/+$/, '') || '/'
  return p
}

export function getPathname(): string {
  return normalizePathname(window.location.pathname)
}

export function isSpaInternalHref(href: string): boolean {
  try {
    const u = new URL(href, window.location.origin)
    if (u.origin !== window.location.origin) return false
    const path = normalizePathname(u.pathname)
    return SPA_ROUTE_PATHS.has(path) || SPA_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix))
  } catch {
    return false
  }
}

/** Client-only navigation so /privacy-policy works without a full reload (works on static hosting). */
export function spaNavigateTo(path: string): void {
  const next = normalizePathname(path)
  const cur = getPathname()
  if (next === cur) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  window.history.pushState({ path: next }, '', next || '/')
  window.dispatchEvent(new Event('vedlik:route'))
}

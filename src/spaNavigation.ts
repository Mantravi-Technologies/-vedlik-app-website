/** Routes handled by client-side AppRouter (static hosts must still rewrite unknown paths to index.html). */
export const SPA_ROUTE_PATHS = new Set([
  '/',
  '/privacy-policy',
  '/terms-and-conditions',
  '/data-deletion-request',
])

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
    return SPA_ROUTE_PATHS.has(normalizePathname(u.pathname))
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

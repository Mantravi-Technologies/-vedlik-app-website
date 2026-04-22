import { useEffect } from 'react'

/**
 * Forces a full document load so static `deep_link_fallback.html` is served
 * (Universal / App Links + store fallback), instead of the SPA shell.
 */
export default function DeepLinkDocumentReload({ target }: { target: string }) {
  useEffect(() => {
    const u = new URL(target, window.location.origin)
    u.search = window.location.search
    const next = `${u.pathname}${u.search}`
    const cur = `${window.location.pathname}${window.location.search}`
    if (next === cur) {
      window.location.reload()
      return
    }
    window.location.replace(u.href)
  }, [target])

  return (
    <div className="min-h-[100dvh] w-full bg-[#000] text-white flex flex-col items-center justify-center px-6">
      <p className="text-sm text-white/70">Opening…</p>
    </div>
  )
}

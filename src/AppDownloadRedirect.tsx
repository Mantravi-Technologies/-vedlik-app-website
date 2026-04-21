import { useEffect } from 'react'

/**
 * Client-side navigation to `/app` (e.g. SpaLink) loads the SPA first.
 * Production serves `/app` as static `app_download_fallback.html` (Vercel rewrite)
 * so Universal / App Links can open the native app when installed.
 * Force a full navigation to `/app` so that HTML is used instead of this bundle.
 */
export default function AppDownloadRedirect() {
  useEffect(() => {
    const url = new URL('/app', window.location.origin).href
    window.location.replace(url)
  }, [])

  return (
    <div className="min-h-[100dvh] w-full bg-[#000] text-white flex flex-col items-center justify-center px-6">
      <p className="text-sm text-white/70">Opening download page…</p>
    </div>
  )
}

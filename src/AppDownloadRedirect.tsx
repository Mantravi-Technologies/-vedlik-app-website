import { useEffect } from 'react'

const APP_STORE_URL =
  'https://apps.apple.com/in/app/vedlik-ai-tech-insights/id6761024663'
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.mantravi.ai.briefing'

function detectMobileStore(): 'ios' | 'android' | null {
  const ua = navigator.userAgent || ''
  const iPadOS =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  const isIOS = /iPhone|iPod/i.test(ua) || iPadOS
  if (isIOS) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return null
}

/**
 * /app — sends phones to the correct store; desktop gets both links.
 */
export default function AppDownloadRedirect() {
  useEffect(() => {
    const target = detectMobileStore()
    if (target === 'ios') {
      window.location.replace(APP_STORE_URL)
      return
    }
    if (target === 'android') {
      window.location.replace(PLAY_STORE_URL)
    }
  }, [])

  return (
    <div className="min-h-[100dvh] w-full bg-[#000] text-white flex flex-col items-center justify-center px-6 py-16">
      <p className="text-lg font-semibold tracking-tight">Download Vedlik</p>
      <p className="mt-2 text-sm text-white/65 text-center max-w-md">
        Opening the store for your device… If nothing happens, pick a store below.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <a
          href={APP_STORE_URL}
          className="inline-flex min-w-[200px] justify-center rounded-lg border border-white/20 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white transition hover:border-[#2DD4BF]/50 hover:bg-white/[0.1]"
        >
          App Store
        </a>
        <a
          href={PLAY_STORE_URL}
          className="inline-flex min-w-[200px] justify-center rounded-lg border border-white/20 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white transition hover:border-[#2DD4BF]/50 hover:bg-white/[0.1]"
        >
          Google Play
        </a>
      </div>
    </div>
  )
}

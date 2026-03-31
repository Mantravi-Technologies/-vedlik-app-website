import type { ReactNode } from 'react'
import SpaLink from './SpaLink'

type LegalPageProps = {
  title: string
  description: string
  children: ReactNode
}

export default function LegalPage({ title, description, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[#040404] text-white">
      <header className="sticky top-0 z-10 border-b border-white/[0.08] bg-black/90 backdrop-blur px-4 sm:px-6 md:px-10 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <SpaLink href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors">
            <img
              src="/images/vedlik_logo_header.png"
              alt="Vedlik"
              className="h-7 sm:h-8 w-auto object-contain"
              draggable={false}
            />
          </SpaLink>
          <nav className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm">
            <SpaLink href="/privacy-policy" className="text-white/70 hover:text-white transition-colors">Privacy</SpaLink>
            <SpaLink href="/terms-and-conditions" className="text-white/70 hover:text-white transition-colors">Terms</SpaLink>
            <SpaLink href="/data-deletion-request" className="text-white/70 hover:text-white transition-colors">Data Deletion</SpaLink>
            <SpaLink href="/support" className="text-white/70 hover:text-white transition-colors">Support</SpaLink>
          </nav>
        </div>
      </header>

      <main className="px-4 sm:px-6 md:px-10 py-10 sm:py-12 md:py-16">
        <article className="mx-auto max-w-5xl rounded-2xl border border-white/[0.1] bg-white/[0.02] p-5 sm:p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-4 text-white/70 text-sm sm:text-base leading-relaxed max-w-3xl">{description}</p>
          <div className="mt-8 legal-content text-white/85 text-sm sm:text-base leading-relaxed space-y-4">
            {children}
          </div>
        </article>
      </main>

      <footer className="border-t border-white/[0.08] px-4 sm:px-6 md:px-10 py-5">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-white/45">© Vedlik · AI &amp; tech intelligence</p>
          <div className="flex items-center gap-4 text-xs">
            <a href="https://mantravi.com" target="_blank" rel="noreferrer" className="text-white/65 hover:text-white">
              Powered by Mantravi
            </a>
            <SpaLink href="/privacy-policy" className="text-[#2DD4BF] hover:opacity-85">Privacy</SpaLink>
            <SpaLink href="/terms-and-conditions" className="text-[#2DD4BF] hover:opacity-85">Terms</SpaLink>
          </div>
        </div>
      </footer>
    </div>
  )
}

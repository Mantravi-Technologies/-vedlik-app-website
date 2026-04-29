import { useEffect, useMemo, useState } from 'react'
import SpaLink from '../SpaLink'
import { applyPageSeo } from './seo'
import { WEB_FALLBACK_IMAGE, getArticleByIdOrSlug, type WebArticleDetail } from './api'
import { formatDisruptionScore, parseDisruptionScore } from './formatters'

const BRAND = '#20b2aa'
const SITE_URL = 'https://vedlik.com'

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function WebArticlePage({ idOrSlug }: { idOrSlug: string }) {
  const [article, setArticle] = useState<WebArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setNotFound(false)
      setError(null)
      try {
        const payload = await getArticleByIdOrSlug(idOrSlug)
        if (cancelled) return
        setArticle(payload)
      } catch (e) {
        if (cancelled) return
        if (e instanceof Error && e.message === 'not_found') {
          setNotFound(true)
        } else {
          setError('Could not load article from production API.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [idOrSlug])

  useEffect(() => {
    if (!article) return
    const description =
      article.seo?.metaDescription ??
      article.whyItMattersPreview?.[0] ??
      article.whyItMatters?.[0] ??
      'Vedlik article detail'
    const canonical = article.canonicalUrl ?? `${SITE_URL}/signal/${article.slug ?? article.id}`
    applyPageSeo({
      title: article.seo?.metaTitle ?? article.title,
      description,
      canonicalUrl: canonical,
      ogImage: article.seo?.ogImage ?? article.imageUrl,
    })
  }, [article])

  const whyItMatters = useMemo(() => {
    if (!article) return []
    return article.whyItMatters ?? article.whyItMattersPreview ?? []
  }, [article])

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-6 text-slate-600">Loading article...</div>
  }
  if (notFound) {
    return <div className="min-h-screen bg-slate-50 p-6 text-slate-700">Article not found.</div>
  }
  if (error || !article) {
    return <div className="min-h-screen bg-slate-50 p-6 text-red-600">{error ?? 'Failed to load article.'}</div>
  }

  const detailExtra = article as WebArticleDetail & { disruption_score?: number | string }
  const disruption = parseDisruptionScore(article.disruptionScore ?? detailExtra.disruption_score)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4 md:h-16 md:px-6">
          <SpaLink href="/web" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            Back to feed
          </SpaLink>
          <a
            href="/app"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: BRAND }}
          >
            Install App
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-5 md:px-6 md:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: BRAND }}>
          {article.category ?? 'All'}
        </p>
        {disruption != null ? (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-2xl font-semibold tabular-nums text-slate-900">
              {formatDisruptionScore(disruption)}
            </span>
            <span className="inline-flex h-6 w-6 text-amber-500" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                <path
                  fillRule="evenodd"
                  d="M14.615 1.595a.75.75 0 0 1 .359.852L13.957 11h7.089a.75.75 0 0 1 .528 1.275l-9.392 10.098a.75.75 0 0 1-1.248-.734l2.062-10.086H5.096a.75.75 0 0 1-.547-1.251l9.39-10.098a.75.75 0 0 1 .676-.189z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="sr-only">Disruption score</span>
          </div>
        ) : null}
        <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 md:text-4xl">{article.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>{article.source ?? 'Vedlik'}</span>
          <span>•</span>
          <time dateTime={article.publishedAt}>{formatTime(article.publishedAt)}</time>
          {article.author ? (
            <>
              <span>•</span>
              <span>{article.author}</span>
            </>
          ) : null}
        </div>

        <img
          src={article.imageUrl ?? WEB_FALLBACK_IMAGE}
          alt={article.title}
          className="mt-5 h-56 w-full rounded-xl object-cover md:h-80"
        />

        <section className="mt-6 rounded-xl border border-[#20b2aa]/25 bg-[#20b2aa]/10 p-4 md:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-900">Why it matters</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 md:text-base">
            {whyItMatters.length > 0 ? (
              whyItMatters.map((point) => <li key={point}>- {point}</li>)
            ) : (
              <li>- Context is being prepared for this story.</li>
            )}
          </ul>
        </section>

        {article.technicalChange ? (
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Technical change</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 md:text-base">{article.technicalChange}</p>
          </section>
        ) : null}

        {article.developerImpact ? (
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Developer impact</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 md:text-base">{article.developerImpact}</p>
          </section>
        ) : null}

        {article.articleUrl || article.canonicalSourceUrl ? (
          <div className="mt-8">
            <a
              href={article.articleUrl ?? article.canonicalSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
            >
              Read source article
            </a>
          </div>
        ) : null}
      </main>
    </div>
  )
}

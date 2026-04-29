type SeoInput = {
  title: string
  description: string
  canonicalUrl: string
  ogImage?: string
}

function setMetaTag(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setCanonical(url: string) {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', url)
}

export function applyPageSeo(input: SeoInput) {
  document.title = input.title
  setCanonical(input.canonicalUrl)
  setMetaTag('meta[name="description"]', 'name', 'description', input.description)
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', input.title)
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', input.description)
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', input.canonicalUrl)
  setMetaTag(
    'meta[property="og:image"]',
    'property',
    'og:image',
    input.ogImage ?? 'https://vedlik.com/assets/images/logo.png'
  )
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', input.title)
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', input.description)
  setMetaTag(
    'meta[name="twitter:image"]',
    'name',
    'twitter:image',
    input.ogImage ?? 'https://vedlik.com/assets/images/logo.png'
  )
}

/** Client-side JSON-LD (SPA). Bots that execute JS can read this; SSR/crawl parity may still use static index.html LD. */
const JSON_LD_PREFIX = 'vedlik-jsonld-'

export function upsertJsonLd(id: string, data: Record<string, unknown>) {
  if (typeof document === 'undefined') return
  const fullId = id.startsWith(JSON_LD_PREFIX) ? id : `${JSON_LD_PREFIX}${id}`
  document.getElementById(fullId)?.remove()
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = fullId
  script.setAttribute('data-vedlik', 'jsonld')
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

export function removeJsonLd(id: string) {
  if (typeof document === 'undefined') return
  const fullId = id.startsWith(JSON_LD_PREFIX) ? id : `${JSON_LD_PREFIX}${id}`
  document.getElementById(fullId)?.remove()
}

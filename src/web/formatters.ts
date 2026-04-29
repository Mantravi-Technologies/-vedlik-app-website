export function formatSourceName(input?: string) {
  if (!input || input.trim().length === 0) return 'Vedlik'
  const cleaned = input.replace(/\s+/g, ' ').trim()
  return cleaned
    .split(' ')
    .map((word) => (word.length <= 2 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)))
    .join(' ')
}

export function formatCategoryLabel(input?: string) {
  if (!input || input.trim().length === 0) return 'All'
  const cleaned = input.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function formatTopicLabel(input: string) {
  const cleaned = input
    .replace(/^#+/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function isDisplayableTopic(input: string) {
  const normalized = input.replace(/^#+/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
  if (!normalized) return false
  if (normalized === 'topic learner' || normalized === 'topic builder') return false
  if (normalized === 'learner' || normalized === 'builder') return false
  return true
}

export function formatPublishedTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function sanitizeWhyItMatters(items: string[]) {
  const seen = new Set<string>()
  return items
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .map((item) => item.replace(/^[\-•\s]+/, ''))
    .map((item) => item.replace(/\s*([.,!?;:])\s*$/, '$1'))
    .filter((item) => item.length > 0)
    .filter((item) => {
      const key = item.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function parseDisruptionScore(raw: unknown): number | undefined {
  if (raw == null) return undefined
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'string') {
    const n = parseFloat(raw.replace(/,/g, '').trim())
    if (Number.isFinite(n)) return n
  }
  return undefined
}

export function formatDisruptionScore(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

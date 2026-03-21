import { useEffect, useMemo, useRef, useState } from 'react'

type WaitlistModalProps = {
  isOpen: boolean
  onClose: () => void
}

const COLLECT_EMAIL_ENDPOINT =
  'https://us-central1-gen-lang-client-0290483815.cloudfunctions.net/collectEmail'
const COOLDOWN_MS = 15000
const LAST_SUBMIT_KEY = 'vedlik_waitlist_last_submit_at'

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getVisibleFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.getClientRects().length > 0
  )
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const t = window.setTimeout(() => inputRef.current?.focus(), 130)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !modalRootRef.current) return

      const focusables = getVisibleFocusables(modalRootRef.current)
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey) {
        if (active === first || !modalRootRef.current.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last || !modalRootRef.current.contains(active)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [isOpen, onClose])

  const canSubmit = useMemo(() => !isSubmitting && status !== 'success', [isSubmitting, status])

  if (!isOpen) return null

  const isEmailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const getRemainingCooldown = () => {
    const raw = window.localStorage.getItem(LAST_SUBMIT_KEY)
    const last = raw ? Number(raw) : 0
    const elapsed = Date.now() - last
    const remaining = COOLDOWN_MS - elapsed
    return Math.max(0, remaining)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    const normalizedEmail = email.trim().toLowerCase()
    if (!isEmailValid(normalizedEmail)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    const remainingCooldown = getRemainingCooldown()
    if (remainingCooldown > 0) {
      setStatus('error')
      setMessage(`Please wait ${Math.ceil(remainingCooldown / 1000)}s before submitting again.`)
      return
    }

    setIsSubmitting(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch(COLLECT_EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, source: 'website' }),
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      window.localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()))
      setStatus('success')
      setMessage('You are in. We will email you first when early access opens.')
    } catch {
      setStatus('error')
      setMessage('Could not join right now. Please try again in a moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div ref={modalRootRef} className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close waitlist modal"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-modal-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.14] bg-[linear-gradient(155deg,rgba(18,30,34,0.95),rgba(8,12,14,0.98))] shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
      >
        <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[#2DD4BF]/20 blur-3xl" />

        <div className="relative p-5 sm:p-6">
          <div className="inline-flex items-center rounded-full border border-[#2DD4BF]/45 bg-[#2DD4BF]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#2DD4BF]">
            Priority access
          </div>

          <h3 id="waitlist-modal-title" className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Join the Vedlik waitlist
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/68">
            Get early access to AI, tech, startup, and funding intelligence before public rollout.
          </p>

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            <label htmlFor="waitlist-email" className="sr-only">Email</label>
            <input
              id="waitlist-email"
              ref={inputRef}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#2DD4BF]/70"
            />

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl border border-[#2DD4BF]/55 bg-gradient-to-r from-[#0A1114] via-[#102B2F] to-[#0A1114] px-4 py-3 text-sm font-semibold text-white transition-colors hover:from-[#102125] hover:via-[#15383d] hover:to-[#102125] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSubmitting ? 'Joining...' : status === 'success' ? 'Joined Successfully' : 'Get Early Access'}
            </button>
          </form>

          {message && (
            <p className={`mt-3 text-sm ${status === 'success' ? 'text-[#2DD4BF]' : 'text-rose-300'}`}>{message}</p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-xs text-white/55 transition-colors hover:text-white/85"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

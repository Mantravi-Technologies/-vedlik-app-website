import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }

type State = {
  hasError: boolean
}

/**
 * Catches render errors in the tree so a single failure doesn’t blank the whole host.
 * Does not change behavior on the happy path.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Vedlik] App error:', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#040404] px-6 py-12 text-center text-white">
          <p className="text-lg font-semibold tracking-tight">Something went wrong</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
            Try reloading the page. If this keeps happening, please try again later.
          </p>
          <button
            type="button"
            className="mt-8 rounded-xl border border-[#2DD4BF]/50 bg-gradient-to-r from-[#0A1114] via-[#102B2F] to-[#0A1114] px-6 py-3 text-sm font-semibold text-white transition-colors hover:from-[#102125] hover:via-[#15383d] hover:to-[#102125]"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

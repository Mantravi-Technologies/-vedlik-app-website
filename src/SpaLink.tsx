import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { isSpaInternalHref, spaNavigateTo } from './spaNavigation'

type SpaLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  children: ReactNode
}

export default function SpaLink({ href, onClick, children, ...rest }: SpaLinkProps) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (isSpaInternalHref(href)) {
          e.preventDefault()
          spaNavigateTo(href)
        }
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

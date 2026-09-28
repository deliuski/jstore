import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { buttonClass, buttonIconClass, type ButtonStyle } from './buttonClass'

type ButtonLinkProps = ButtonStyle &
  Omit<LinkProps, 'className'> & {
    icon?: ReactNode
  }

/** A router link that looks like `Button`. */
export function ButtonLink({ variant, size, block, className, icon, children, ...rest }: ButtonLinkProps) {
  return (
    <Link {...rest} className={buttonClass({ variant, size, block, className })}>
      {icon && <span className={buttonIconClass}>{icon}</span>}
      {children}
    </Link>
  )
}

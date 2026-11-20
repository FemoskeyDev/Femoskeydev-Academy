import type { ReactNode } from 'react'
import { classNames } from '../../lib/classNames'
import styles from './ComingSoon.module.css'

/** Stands in for a link to a page that isn't live yet: it looks like the link, goes nowhere,
 *  and shows a "Coming soon" tooltip on hover, focus or tap. */
export function ComingSoon({ children, className, placement = 'below' }: { children: ReactNode; className?: string; placement?: 'above' | 'below' }) {
  return <span className={classNames(styles.soon, className)} tabIndex={0} aria-disabled="true">
    {children}
    <span className={styles.tip} data-placement={placement} role="tooltip">Coming soon</span>
  </span>
}

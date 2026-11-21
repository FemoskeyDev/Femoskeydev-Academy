import { ArrowTopRightIcon } from '@radix-ui/react-icons'

/** The site's ↗ arrow, as a Radix icon sized to the surrounding text. Decorative: the link or button
 *  around it carries the label. */
export function Arrow({ className }: { className?: string }) {
  return <span className={className} aria-hidden="true"><ArrowTopRightIcon width="1em" height="1em" /></span>
}

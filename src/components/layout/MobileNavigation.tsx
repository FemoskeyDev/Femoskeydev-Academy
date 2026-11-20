import type { RefObject } from 'react'
import { Cross1Icon, HamburgerMenuIcon } from '@radix-ui/react-icons'
import { NavigationLinks } from './DesktopNavigation'

export function MobileNavigation({ open, toggleRef, onToggle, onNavigate }: {
  open: boolean
  toggleRef: RefObject<HTMLButtonElement | null>
  onToggle: () => void
  onNavigate: () => void
}) {
  return <div className="mobile-navigation">
    <button ref={toggleRef} type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-site-nav" onClick={onToggle}>
      {open ? <Cross1Icon width={24} height={24} aria-hidden="true" /> : <HamburgerMenuIcon width={24} height={24} aria-hidden="true" />}
      {open ? 'Close' : 'Menu'}
    </button>
    <nav id="mobile-site-nav" className={`nav mobile-nav${open ? ' nav-open' : ''}`} aria-label="Main navigation" inert={!open} aria-hidden={!open}>
      <NavigationLinks onNavigate={onNavigate} />
    </nav>
  </div>
}

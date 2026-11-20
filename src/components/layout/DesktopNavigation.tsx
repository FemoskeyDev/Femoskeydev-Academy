import { NavLink, useLocation } from 'react-router-dom'
import { isAcademyPath, navigation } from '../../data/navigation'

export function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()
  return navigation.map(item => <NavLink
    key={item.to}
    to={item.to}
    end={item.to === '/'}
    onClick={onNavigate}
    className={({ isActive }) => isActive || item.to === '/academy' && isAcademyPath(pathname) ? 'nav-active' : ''}
  >{item.label}</NavLink>)
}

export function DesktopNavigation() {
  return <nav className="nav desktop-nav" aria-label="Main navigation"><NavigationLinks /></nav>
}

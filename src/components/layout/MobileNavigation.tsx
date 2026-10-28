import { Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigation } from '../../data/navigation'
import { IconButton } from '../ui/IconButton'
import { Button } from '../ui/Button'
export function MobileNavigation({ open, onToggle, onNavigate }: { open: boolean; onToggle: () => void; onNavigate: () => void }) { return <div className="mobile-navigation"><IconButton className="menu-toggle" label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-site-nav" onClick={onToggle}>{open ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}</IconButton><nav id="mobile-site-nav" className={`nav mobile-nav${open ? ' nav-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!open}>{navigation.map(item => <NavLink key={item.to} to={item.to} onClick={onNavigate} className={({ isActive }) => isActive ? 'nav-active' : ''}>{item.label}</NavLink>)}<Button to="/learning-paths" className="nav-cta" onClick={onNavigate}>Start Learning</Button></nav></div> }

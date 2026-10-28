import { NavLink } from 'react-router-dom'
import { navigation } from '../../data/navigation'
import { Button } from '../ui/Button'
export function DesktopNavigation() { return <nav className="nav desktop-nav" aria-label="Main navigation">{navigation.map(item => <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'nav-active' : ''}>{item.label}</NavLink>)}<Button to="/learning-paths" className="nav-cta">Start Learning</Button></nav> }

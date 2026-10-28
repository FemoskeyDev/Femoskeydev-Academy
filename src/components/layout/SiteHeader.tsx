import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BrandMark } from '../ui/BrandMark'
import { DesktopNavigation } from './DesktopNavigation'
import { MobileNavigation } from './MobileNavigation'
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  useEffect(() => { if (!open) return; const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }; window.addEventListener('keydown', dismiss); return () => window.removeEventListener('keydown', dismiss) }, [open])
  const close = () => setOpen(false)
  return <header className="header"><NavLink to="/" className="brand" aria-label="Femoskeydev Academy home" onClick={close}><BrandMark/><span>Femoskeydev<br/><b>Academy</b></span></NavLink>
    <DesktopNavigation/><MobileNavigation open={open} onToggle={() => setOpen(value => !value)} onNavigate={close}/>
  </header>
}

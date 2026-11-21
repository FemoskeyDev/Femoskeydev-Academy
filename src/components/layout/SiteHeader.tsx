import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { siteConfig } from '../../data/siteConfig'
import { Button } from '../ui/Button'
import { ComingSoon } from '../ui/ComingSoon'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const location = useLocation()
  return <Header key={location.key} />
}

function Header() {
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)
  const focusFirstLink = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cancelClose = () => clearTimeout(closeTimer.current)
  const closeMenus = () => { cancelClose(); setOpen(false); setMoreOpen(false) }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setMoreOpen(false), 160)
  }
  useEffect(() => () => clearTimeout(closeTimer.current), [])
  useEffect(() => {
    if (!moreOpen || !focusFirstLink.current) return
    const frame = requestAnimationFrame(() => {
      const firstLink = document.querySelector<HTMLElement>('#more-navigation [tabindex]')
      firstLink?.focus({ preventScroll: true })
      if (document.activeElement === firstLink) focusFirstLink.current = false
    })
    return () => cancelAnimationFrame(frame)
  }, [moreOpen])

  return <>
    <div className={styles.spacer} aria-hidden="true" />
    <div data-navigation-backdrop className={`${styles.backdrop} ${moreOpen ? styles.backdropOpen : ''}`} aria-hidden="true" onClick={closeMenus} />
    <header className={styles.header} onPointerEnter={cancelClose} onPointerLeave={event => {
      if (event.pointerType === 'mouse') scheduleClose()
    }} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setMoreOpen(false)
    }} onKeyDown={event => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      if (moreOpen) { setMoreOpen(false); moreRef.current?.focus() }
      else { setOpen(false); toggleRef.current?.focus() }
    }}>
      <div className={`${styles.bar} ${moreOpen ? styles.expanded : ''}`}>
        <Link to="/" className={styles.brand} aria-label="Femoskeydev home" onClick={closeMenus}>
          <img src="/images/portfolio/2193b.svg" alt="Femoskeydev" />
        </Link>
        <button ref={toggleRef} type="button" className={styles.toggle} aria-expanded={open} aria-controls="site-navigation" onClick={() => {
          setOpen(value => !value)
          setMoreOpen(false)
        }} aria-label={open ? 'Close menu' : 'Open menu'}><span className={styles.burger} aria-hidden="true"><span /><span /></span></button>
        <nav id="site-navigation" aria-label="Main navigation" className={`${styles.navigation} ${open ? styles.open : ''}`}>
            <ComingSoon>Services</ComingSoon>
            <NavLink to="/work" onPointerEnter={() => setMoreOpen(false)} onClick={closeMenus}>Case Studies</NavLink>
            <ComingSoon>About</ComingSoon>
            <div className={styles.more} onPointerEnter={event => {
              if (event.pointerType === 'mouse' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                cancelClose()
                setMoreOpen(true)
              }
            }}>
              <button ref={moreRef} className={styles.moreToggle} type="button" aria-expanded={moreOpen} aria-controls="more-navigation" onClick={() => setMoreOpen(value => !value)} onKeyDown={event => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  focusFirstLink.current = true
                  setMoreOpen(true)
                  if (moreOpen) document.querySelector<HTMLElement>('#more-navigation [tabindex]')?.focus({ preventScroll: true })
                }
              }}>More<span>.</span></button>
              <div id="more-navigation" className={`${styles.dropdown} ${moreOpen ? styles.dropdownOpen : ''}`} inert={!moreOpen} aria-hidden={!moreOpen} onTransitionEnd={event => {
                if (event.target === event.currentTarget && moreOpen && focusFirstLink.current) {
                  document.querySelector<HTMLElement>('#more-navigation [tabindex]')?.focus({ preventScroll: true })
                  focusFirstLink.current = false
                }
              }}>
                <div className={styles.dropdownInner}>
                  <div className={styles.dropdownContent}>
                  <p>Explore Femoskeydev</p>
                  <ComingSoon placement="above">Academy</ComingSoon>
                  <ComingSoon placement="above">Mentorship</ComingSoon>
                  </div>
                </div>
              </div>
            </div>
            <Button href={siteConfig.bookingUrl} target="_blank" rel="noreferrer" onClick={closeMenus} onPointerEnter={() => setMoreOpen(false)}>Contact us</Button>
        </nav>
      </div>
    </header>
  </>
}

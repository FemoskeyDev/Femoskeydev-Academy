import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import styles from './CursorCard.module.css'

/** On touch screens, a small pill at the bottom of a card that slides in once the card is in view. */
export function TapHint() {
  return <span className={styles.tapHint} aria-hidden="true">Tap to view <span>↗</span></span>
}

/** A real link with a decorative pointer follower; keyboard focus keeps a visible affordance and touch
 *  screens get a tap hint instead. `tooltip` adds a name pill that travels with the pointer under the disc;
 *  `fallback={false}` drops the centred focus disc for cards that already show their own arrow;
 *  `hint={false}` leaves the tap hint to the card, to place it somewhere else (see TapHint). */
export function CursorCard({ children, className = '', to, label, tooltip, fallback = true, hint = true }: { children?: ReactNode; className?: string; to: string; label: string; tooltip?: string; fallback?: boolean; hint?: boolean }) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  // Marks the card while it is on screen, which brings in the tap hint on touch screens.
  useEffect(() => {
    const link = linkRef.current
    if (!link || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) link.dataset.inView = 'true'
      else delete link.dataset.inView
    }, { threshold: 0.6 })
    observer.observe(link)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const link = linkRef.current
    const cursor = cursorRef.current
    if (!link || !cursor) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let active = false
    let x = 0, y = 0, targetX = 0, targetY = 0, previousTime = 0
    const position = () => { cursor.style.transform = `translate3d(${x}px, ${y}px, 0)` }
    const tick = (time: number) => {
      const dt = previousTime ? Math.min(time - previousTime, 64) : 16.67
      previousTime = time
      const blend = 1 - Math.exp(-dt / 45)
      x += (targetX - x) * blend
      y += (targetY - y) * blend
      position()
      if (active && (Math.abs(targetX - x) > .1 || Math.abs(targetY - y) > .1)) frame = requestAnimationFrame(tick)
      else { frame = 0; previousTime = 0 }
    }
    const leave = () => {
      active = false
      delete link.dataset.cursorActive
      delete cursor.dataset.active
      cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !fine.matches || reduced.matches) return
      targetX = event.clientX
      targetY = event.clientY
      if (!active) {
        x = targetX; y = targetY; position()
        active = true
        link.dataset.cursorActive = 'true'
        cursor.dataset.active = 'true'
      }
      if (!frame) frame = requestAnimationFrame(tick)
    }
    link.addEventListener('pointerenter', move)
    link.addEventListener('pointermove', move)
    link.addEventListener('pointerleave', leave)
    link.addEventListener('pointercancel', leave)
    link.addEventListener('click', leave)
    window.addEventListener('scroll', leave, { passive: true, capture: true })
    window.addEventListener('blur', leave)
    window.addEventListener('resize', leave)
    document.addEventListener('visibilitychange', leave)
    fine.addEventListener('change', leave)
    reduced.addEventListener('change', leave)
    return () => {
      leave()
      link.removeEventListener('pointerenter', move)
      link.removeEventListener('pointermove', move)
      link.removeEventListener('pointerleave', leave)
      link.removeEventListener('pointercancel', leave)
      link.removeEventListener('click', leave)
      window.removeEventListener('scroll', leave, true)
      window.removeEventListener('blur', leave)
      window.removeEventListener('resize', leave)
      document.removeEventListener('visibilitychange', leave)
      fine.removeEventListener('change', leave)
      reduced.removeEventListener('change', leave)
    }
  }, [])

  return <>
    <Link ref={linkRef} to={to} aria-label={label} className={`${styles.card} ${className}`}>
      {children}
      {fallback && <span className={`${styles.disc} ${styles.fallback}`} aria-hidden="true"><span className={styles.arrow}>↗</span></span>}
      {hint && <TapHint />}
    </Link>
    {typeof document !== 'undefined' && createPortal(<span ref={cursorRef} className={styles.cursor} aria-hidden="true"><span className={styles.disc}><span className={styles.arrow}>↗</span></span>{tooltip && <span className={styles.tooltip}>{tooltip}</span>}</span>, document.body)}
  </>
}

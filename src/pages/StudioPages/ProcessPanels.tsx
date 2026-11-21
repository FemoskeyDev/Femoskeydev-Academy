import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { processSteps } from './processSteps'
import styles from './ProcessPanels.module.css'

const ADVANCE_MS = 5500

/** Three panels side by side; the open one widens to show its art. Hover or tap opens a panel, and
 *  while the section is on screen it moves on by itself until someone interacts. Phones get an accordion
 *  that only opens on tap, since auto-advancing would change its height under the reader. */
export function ProcessPanels() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const [inView, setInView] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [wide, setWide] = useState(() => typeof window.matchMedia !== 'function' || window.matchMedia('(min-width: 901px)').matches)
  const reduced = useReducedMotion()
  const playing = auto && wide && inView && !hovering && !reduced

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(min-width: 901px)')
    const sync = () => setWide(query.matches)
    query.addEventListener?.('change', sync)
    return () => query.removeEventListener?.('change', sync)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.5 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => setActive(index => (index + 1) % processSteps.length), ADVANCE_MS)
    return () => window.clearTimeout(timer)
  }, [playing, active])

  const open = (index: number) => { setActive(index); setAuto(false) }
  const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  return <div ref={rootRef} className={styles.panels} onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}>
    {processSteps.map((step, index) => {
      const isActive = index === active
      return <article key={step.id} className={styles.panel} data-active={isActive || undefined} style={{ '--art-bg': step.background, '--advance': `${ADVANCE_MS}ms` } as CSSProperties}
        onPointerEnter={event => { if (event.pointerType === 'mouse' && fine() && !isActive) open(index) }}>
        <button type="button" className={styles.trigger} aria-expanded={isActive} aria-controls={`panel-${step.id}`} onClick={() => open(index)}>
          <span className={styles.row}><span><img src={`/images/portfolio/${step.icon}`} alt="" />{step.label}</span><span className={styles.number}>{step.number}</span></span>
          <span className={styles.rail} aria-hidden="true"><span className={styles.number}>{step.number}</span><span className={styles.railLabel}>{step.label}</span></span>
        </button>
        {isActive && playing && <span key={active} className={styles.progress} aria-hidden="true" />}
        <div id={`panel-${step.id}`} className={styles.body} inert={!isActive}>
          <div className={styles.bodyInner}>
            <div className={styles.text}>
              <h3>{step.title}</h3>
              <p>{step.line}</p>
            </div>
            <div className={styles.art}><img src={step.art} alt={step.alt} width="715" height="560" loading="lazy" /></div>
          </div>
        </div>
      </article>
    })}
  </div>
}

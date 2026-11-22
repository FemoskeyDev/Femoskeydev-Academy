import { useEffect, useRef, useState } from 'react'
import { Arrow } from '../../components/ui/Arrow'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { siteConfig } from '../../data/siteConfig'
import styles from './ServicesPreview.module.css'

const services = [
  { name: 'Product Design', image: 'product-design', summary: 'Research, UX flows and interfaces for apps and dashboards.', includes: ['Research', 'UX flows', 'UI design', 'Prototyping', 'Design systems'] },
  { name: 'Development', image: 'development', summary: 'Websites and apps built from the designs, ready to ship.', includes: ['Websites', 'Web apps', 'Mobile apps', 'CMS'] },
  { name: 'Branding & Identity', image: 'branding', summary: 'Logos, type and colour that hold up everywhere.', includes: ['Logo', 'Visual identity', 'Guidelines'] },
  { name: 'Graphic Design', image: 'graphic-design', summary: 'Campaigns, social posts and print that stay on brand.', includes: ['Social', 'Campaigns', 'Print'] },
  { name: 'Motion & Animation', image: 'motion', summary: 'Product films, launch reels and micro-interactions.', includes: ['Product films', 'Launch reels', 'Micro-interactions'] },
]

/** A big-type index of services. On a mouse, the hovered row fills and a small card with that service's
 *  illustration trails the cursor; touch screens get the list on its own. Every row books a call. */
export function ServicesPreview() {
  const [active, setActive] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const frame = useRef(0)
  const reduced = useReducedMotion()

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // Ease the card towards the pointer, so it trails a little behind it; reduced motion places it directly.
  const follow = () => {
    const ease = reduced ? 1 : .16
    current.current.x += (target.current.x - current.current.x) * ease
    current.current.y += (target.current.y - current.current.y) * ease
    cardRef.current?.style.setProperty('--card-x', `${current.current.x}px`)
    cardRef.current?.style.setProperty('--card-y', `${current.current.y}px`)
    if (Math.abs(target.current.x - current.current.x) + Math.abs(target.current.y - current.current.y) > .5) frame.current = requestAnimationFrame(follow)
    else frame.current = 0
  }

  return <div ref={rootRef} className={styles.index} onPointerMove={event => {
    if (event.pointerType !== 'mouse' || !rootRef.current) return
    const bounds = rootRef.current.getBoundingClientRect()
    target.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
    if (active === null) current.current = { ...target.current }
    if (!frame.current) frame.current = requestAnimationFrame(follow)
  }} onPointerLeave={() => setActive(null)}>
    <ul className={styles.list} aria-label="Our services">
      {services.map((service, index) => <li key={service.image} data-active={index === active || undefined} onPointerEnter={event => {
        if (event.pointerType === 'mouse') setActive(index)
      }}>
        <a href={siteConfig.bookingUrl} target="_blank" rel="noreferrer" aria-label={`${service.name}: ${service.includes.join(', ')}. Book a call (opens in a new tab)`}>
          <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <span className={styles.name}>{service.name}</span>
          <span className={styles.includes} aria-hidden="true">{service.includes.map(item => <span key={item}>{item}</span>)}</span>
          <span className={styles.arrow}><Arrow weight="semibold" /></span>
        </a>
      </li>)}
    </ul>
    <div ref={cardRef} className={styles.card} data-visible={active !== null || undefined} aria-hidden="true">
      <div className={styles.cardArt}>
        {services.map((service, index) => <img key={service.image} src={`/images/services/${service.image}.svg`} alt="" width="640" height="600" draggable="false" data-active={index === active || undefined} />)}
      </div>
      <p>{services[active ?? 0].summary}</p>
    </div>
  </div>
}

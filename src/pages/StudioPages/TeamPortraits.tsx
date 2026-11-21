import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './TeamPortraits.module.css'

const SHOW_MS = 5000
const asset = (file: string) => `/images/portfolio/${file}`

const people = [
  { id: 'femi', name: 'Lawal Oluwafemi', handle: 'Femoskeydev', role: 'CEO & Designer', ring: '#c8fdce' },
  { id: 'ayomide', name: 'Lawal Ayomide', handle: 'AYCODEZ', role: 'Developer', ring: '#6a9dff' },
]

/** One portrait at a time with a frosted name card. Under it, each person's avatar ring fills as a
 *  countdown; when it completes the portrait dissolves to the next person. Tapping an avatar switches
 *  straight away. The countdown pauses off screen or under the pointer; reduced motion only switches on tap. */
export function TeamPortraits() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [inView, setInView] = useState(false)
  const [hovering, setHovering] = useState(false)
  const reduced = useReducedMotion()
  const running = inView && !hovering && !reduced

  useEffect(() => {
    const root = rootRef.current
    if (!root || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const show = (index: number) => { setActive(index); setCycle(value => value + 1) }

  return <div ref={rootRef} className={styles.team} onPointerEnter={event => { if (event.pointerType === 'mouse') setHovering(true) }} onPointerLeave={() => setHovering(false)}>
    <div className={styles.portrait}>
      {people.map((person, index) => <figure key={person.id} className={styles.slide} data-active={index === active || undefined} aria-hidden={index !== active}>
        <img src={asset(`team-${person.id}.webp`)} alt={`${person.name} (${person.handle}), ${person.role}`} width="783" height="1045" loading="lazy" />
        <figcaption className={styles.card}><strong>{person.name} <span>({person.handle})</span></strong><span>{person.role}</span></figcaption>
      </figure>)}
    </div>
    <div className={styles.avatars} role="group" aria-label="Who's behind Femoskeydev">
      {people.map((person, index) => {
        const isActive = index === active
        return <button key={person.id} type="button" className={styles.avatar} aria-pressed={isActive} aria-label={`Show ${person.name}, ${person.role}`} onClick={() => show(index)} style={{ '--ring': person.ring, '--show': `${SHOW_MS}ms` } as CSSProperties}>
          <img src={asset(`team-${person.id}-avatar.webp`)} alt="" width="120" height="120" />
          <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden="true">
            {isActive && <circle key={cycle} className={styles.progress} data-running={running || undefined} data-static={reduced || undefined} cx="50" cy="50" r="48.5" pathLength="100"
              onAnimationEnd={() => show((index + 1) % people.length)} />}
          </svg>
        </button>
      })}
    </div>
  </div>
}

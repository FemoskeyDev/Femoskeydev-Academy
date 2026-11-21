import { useEffect, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { processSteps } from './processSteps'
import styles from './ProcessStack.module.css'

gsap.registerPlugin(ScrollTrigger)

/** Each step is a card that sticks under the header; the next one slides up and stacks on top,
 *  while the card beneath eases back and dims. */
export function ProcessStack() {
  const listRef = useRef<HTMLOListElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const list = listRef.current
    if (!list || reduced) return
    const cards = Array.from(list.querySelectorAll<HTMLElement>(`.${styles.card}`))
    const context = gsap.context(() => {
      cards.slice(0, -1).forEach((card, index) => {
        const next = cards[index + 1]
        gsap.timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=120', scrub: 0.4 } })
          .to(card, { scale: 0.94, ease: 'none' }, 0)
          .to(card.querySelector(`.${styles.shade}`), { opacity: 0.55, ease: 'none' }, 0)
      })
    }, list)
    return () => context.revert()
  }, [reduced])

  return <ol ref={listRef} className={styles.stack} aria-label="How we work">
    {processSteps.map((step, index) => <li key={step.id} className={styles.item} style={{ '--i': index } as CSSProperties}>
      <article className={styles.card} aria-labelledby={`stack-${step.id}`}>
        <div className={styles.copy}>
          <div className={styles.meta}><span><img src={`/images/portfolio/${step.icon}`} alt="" />{step.label}</span><span>{step.number}</span></div>
          <div>
            <h3 id={`stack-${step.id}`}>{step.title}</h3>
            <p>{step.line}</p>
          </div>
        </div>
        <div className={styles.art} style={{ background: step.background }}>
          <img src={step.art} alt={step.alt} width="715" height="560" loading="lazy" />
        </div>
        <span className={styles.shade} aria-hidden="true" />
      </article>
    </li>)}
  </ol>
}

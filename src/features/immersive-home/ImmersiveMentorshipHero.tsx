import { useCallback, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { CreativeScanner } from './CreativeScanner'
import { PortraitCanvas, type PortraitProgress } from './PortraitCanvas'
import styles from './ImmersiveMentorshipHero.module.css'

export function ImmersiveMentorshipHero() {
  const rootRef = useRef<HTMLElement>(null)
  const progress = useRef<PortraitProgress>({ zoom: 0, extra: 0 })
  const invalidate = useRef<(() => void) | undefined>(undefined)
  const reducedMotion = useReducedMotion()
  const getProgress = useCallback(() => progress.current, [])
  const onInvalidate = useCallback((draw?: () => void) => { invalidate.current = draw }, [])
  const onReady = useCallback(() => invalidate.current?.(), [])

  useLayoutEffect(() => {
    if (!rootRef.current || reducedMotion) return
    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro.fromTo('[data-intro="portrait"]', { autoAlpha: 0, scale: 1.035, filter: 'blur(12px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: .9, clearProps: 'filter,transform' }, 0)
      intro.fromTo('[data-intro="copy"]', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: .72, stagger: .08, clearProps: 'transform' }, .14)
      intro.fromTo('[data-draw]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .8, stagger: .012, ease: 'power2.out' }, .42)
    }, rootRef)
    return () => context.revert()
  }, [reducedMotion])

  return (
    <section className={styles.mentorshipHero} ref={rootRef} aria-labelledby="mentorship-hero-title">
      <div className={styles.visual} data-intro="portrait" aria-hidden="true">
        <PortraitCanvas getProgress={getProgress} onReady={onReady} onInvalidate={onInvalidate}/>
        <div className={styles.tint}/>
        <CreativeScanner/>
        <div className={styles.visualCaption}><span>01 / PRACTICE</span><span>GUIDANCE FOR YOUR NEXT STEP</span></div>
      </div>
      <div className={styles.copy}>
        <p className={styles.mentorshipEyebrow} data-intro="copy"><span aria-hidden="true">✳</span> FEMOSKEYDEV ACADEMY <i>/</i> MENTORSHIP</p>
        <h1 id="mentorship-hero-title" data-intro="copy">Get guidance<br/>as you build<br/><em>your skills.</em></h1>
        <p className={styles.support} data-intro="copy">Learn through practice, thoughtful feedback, and support shaped around your creative growth.</p>
        <div className={styles.actions} data-intro="copy">
          <Link className={styles.primary} to="/contact">Ask about mentorship <span aria-hidden="true">↗</span></Link>
          <a className={styles.secondary} href="#mentorship-approach">How mentorship works <span aria-hidden="true">↓</span></a>
        </div>
        <p className={styles.note} data-intro="copy">A thoughtful process, shaped around the work you want to make.</p>
      </div>
      <div className={styles.index} aria-hidden="true">FDA <span>—</span> 02</div>
    </section>
  )
}

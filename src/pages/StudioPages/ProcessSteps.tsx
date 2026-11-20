import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './ProcessSteps.module.css'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    id: 'brief', label: 'Brief', icon: 'bd1e6.svg', number: '01', background: '#ffd5bf',
    title: 'First things first, let’s get to know your idea.',
    copy: 'We’ll get to know you, introduce you to the team, and explore what you’re looking to create. Together, we’ll gather everything we need to understand your vision and project goals.',
    items: ['Project questionnaire', 'Requirements & documentation', 'Brand assets & creative references'],
    art: '/images/process/brief.svg', alt: 'Chat bubbles beside a project questionnaire clipboard',
  },
  {
    id: 'proposal', label: 'Proposal', icon: '91eb7.svg', number: '02', background: '#fffacf',
    title: 'Let’s put a plan together.',
    copy: 'Now that we understand your project, we’ll prepare a detailed proposal covering what we’ll deliver, how we’ll approach it, and what it takes to bring your idea to life.',
    items: ['Project scope, budget & timeline', 'Proposed solutions & deliverables', 'Project risks & requirements'],
    art: '/images/process/proposal.svg', alt: 'A project timeline, a budget chart and a deliverables checklist',
  },
  {
    id: 'contract', label: 'Contract', icon: 'f00bb.svg', number: '03', background: '#ffcff7',
    title: 'Let’s make it official!',
    copy: 'Happy with the plan? Awesome! We’ll agree on the terms, handle the necessary paperwork, and get everything ready to kick off your project.',
    items: ['Contract & invoicing', 'Initial project deposit', 'Project kickoff'],
    art: '/images/process/contract.svg', alt: 'A signed contract, an invoice and a kickoff date on a calendar',
  },
]

/** On desktop the steps pin under the header and slide sideways as the page scrolls; elsewhere they stack. */
export function ProcessSteps() {
  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const stage = stageRef.current
    const track = trackRef.current
    if (!stage || !track || reduced) return
    const media = gsap.matchMedia()
    media.add('(min-width: 901px)', () => {
      const distance = () => track.scrollWidth - (track.parentElement?.clientWidth ?? 0)
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top top+=96',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          snap: { snapTo: 1 / (steps.length - 1), duration: { min: 0.2, max: 0.5 }, ease: 'power1.inOut' },
          invalidateOnRefresh: true,
          onUpdate: self => setActive(Math.round(self.progress * (steps.length - 1))),
        },
      })
      triggerRef.current = tween.scrollTrigger ?? null
      return () => { triggerRef.current = null }
    })
    return () => media.revert()
  }, [reduced])

  const goTo = (index: number) => {
    setActive(index)
    const trigger = triggerRef.current
    if (trigger) {
      window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * index / (steps.length - 1), behavior: reduced ? 'auto' : 'smooth' })
    } else {
      document.getElementById(`step-${steps[index].id}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }
  }

  return <div ref={stageRef} className={styles.stage}>
    <div className={styles.pills} role="group" aria-label="Project process">
      {steps.map((step, index) => <button key={step.id} type="button" className={styles.pill} aria-current={index === active ? 'step' : undefined} aria-controls={`step-${step.id}`} onClick={() => goTo(index)}>
        <span><img src={`/images/portfolio/${step.icon}`} alt="" />{step.label}</span><span>{step.number}</span>
      </button>)}
    </div>
    <div className={styles.viewport}>
      <div ref={trackRef} className={styles.track}>
        {steps.map(step => <article key={step.id} id={`step-${step.id}`} className={styles.step} aria-labelledby={`step-${step.id}-title`}>
          <div className={styles.copy}>
            <span className={styles.number}>{step.number}</span>
            <h3 id={`step-${step.id}-title`}>{step.title}</h3>
            <p>{step.copy}</p>
            <ul>{step.items.map(item => <li key={item}><span aria-hidden="true">↗</span> {item}</li>)}</ul>
          </div>
          <div className={styles.art} style={{ background: step.background }}>
            <img data-flare src={step.art} alt={step.alt} width="715" height="560" loading="lazy" />
          </div>
        </article>)}
      </div>
    </div>
  </div>
}

import { useEffect, useRef } from 'react'
import { Button } from '../../components/ui/Button'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './PortfolioLanding.module.css'
import { CursorCard } from './CursorCard'
import { HeroFilm } from './HeroFilm'
import { ProcessStack } from './ProcessStack'
import { TeamPortraits } from './TeamPortraits'
import { ContactCta } from './ContactCta'
import { ProjectCover } from './ProjectCover'
import { projects } from '../../data/projects'

const [liziwaride, paymita, savecircle, edgecore] = projects
import { ServicesPreview } from './ServicesPreview'

const asset = (file: string) => `/images/portfolio/${file}`

// Reveal each part once when it reaches the reading area.
function useTeamMotion() {
  const ref = useRef<HTMLElement>(null)
  const revealed = useRef(new WeakSet<Element>())
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (!root || reduced || !Element.prototype.animate || !('IntersectionObserver' in window)) return

    const animations = new Map<Element, Animation>()
    let observer: IntersectionObserver | undefined

    try {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          revealed.current.add(entry.target)
          animations.get(entry.target)?.play()
          observer?.unobserve(entry.target)
        }
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })

      root.querySelectorAll<HTMLElement>('[data-team-motion]').forEach(element => {
        if (revealed.current.has(element)) return
        const name = element.dataset.teamMotion ?? ''
        const metric = name.startsWith('metric-')
        const delay = metric ? Number(name.slice(7)) * 90 : name === 'support' ? 80 : 0
        const distance = metric ? 14 : 22
        const animation = element.animate([
          { opacity: 0, transform: `translate3d(0, ${distance}px, 0)` },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ], {
          duration: metric ? 650 : 800,
          delay,
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'both',
          iterations: 1,
        })
        animation.pause()
        // Release the animation after settling into the element's normal CSS.
        animation.onfinish = () => animation.cancel()
        animations.set(element, animation)
        observer?.observe(element)
      })
    } catch {
      observer?.disconnect()
      animations.forEach(animation => animation.cancel())
    }

    return () => {
      observer?.disconnect()
      animations.forEach(animation => animation.cancel())
    }
  }, [reduced])

  return ref
}

const metrics = [
  { value: 6, suffix: '+', label: 'Years designing digital products' },
  { value: 35, suffix: '+', label: 'Projects designed and shipped' },
  { value: 5, suffix: '', label: 'Creative disciplines under one roof' },
]

// Counts up once when it scrolls into view. Screen readers always get the final figure.
function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element || reduced || !('IntersectionObserver' in window)) return
    let frame = 0
    element.textContent = `0${suffix}`
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 1400, 1)
        element.textContent = `${Math.round(value * (1 - (1 - progress) ** 3))}${suffix}`
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, { threshold: 0.6 })
    observer.observe(element)
    return () => { observer.disconnect(); cancelAnimationFrame(frame); element.textContent = `${value}${suffix}` }
  }, [reduced, suffix, value])

  return <><span className={styles.srOnly}>{value}{suffix}</span><span ref={ref} aria-hidden="true">{value}{suffix}</span></>
}

export function PortfolioLanding() {
  usePageMeta('Digital design & development studio', 'You bring the vision. We bring design and code. Femoskeydev builds and scales digital products.', 'Femoskeydev')
  const teamRef = useTeamMotion()
  return <div className={styles.page}>
    <section className={`${styles.wrap} ${styles.hero}`} aria-labelledby="portfolio-title">
      <div className={styles.heroCopy}>
        <a className={styles.welcome} href="#selected-work">Hi, Welcome Again! <img src={asset('welcome-avatar.webp')} alt="" width="28" height="28" /></a>
        <h1 id="portfolio-title">We build and scale digital<br className={styles.desktopBreak} /> products &amp; <mark>then some.</mark></h1>
        <p>You bring the <strong>vision</strong>. We bring <strong>design and code.</strong></p>
      </div>
      <HeroFilm />
    </section>

    <section id="selected-work" className={`${styles.wrap} ${styles.work}`} aria-labelledby="work-title">
      <div className={styles.workIntro}><img src={asset('5b7fa.svg')} alt="" /><div><h2 id="work-title">Don't just take our word for it.</h2><p>We've built some pretty cool products. Here are a few of our favourites.</p></div></div>
      <div className={styles.workGrid} aria-label="Project showcase">
        {/* Figma order: Liziwaride (wide), Paymita, SaveCircle, EdgeCore (wide, coming soon). */}
        <CursorCard to="/work/liziwaride" label="Liziwaride case study" tooltip="Liziwaride" className={styles.widePanel}><ProjectCover project={liziwaride} /></CursorCard>
        <CursorCard to="/work/paymita" label="Paymita case study" tooltip="Paymita"><ProjectCover project={paymita} /></CursorCard>
        <CursorCard to="/work/savecircle" label="SaveCircle case study" tooltip="SaveCircle"><ProjectCover project={savecircle} /></CursorCard>
        <div className={styles.widePanel} role="img" aria-label="EdgeCore case study, coming soon"><ProjectCover project={edgecore} /></div>
      </div>
      <Button to="/work" className={styles.workMore}>View all cases</Button>
    </section>

    <section id="services" className={`${styles.wrap} ${styles.services}`} aria-labelledby="services-title">
      <div className={styles.servicesIntro}><div className={styles.brandTile}><img src={asset('0c7e0.svg')} alt="" /></div><div><h2 id="services-title">Wait, there's more?</h2><p>Oh, you bet! We do more than make things look good. Here's how we bring your ideas to life.</p></div></div>
      <ServicesPreview />
    </section>

    <section id="team" ref={teamRef} className={`${styles.wrap} ${styles.team}`} aria-labelledby="team-title">
      <div className={styles.teamCopy}>
        <div className={styles.teamIntro}><div data-team-motion="heading" className={styles.teamHeading}><span aria-hidden="true">“</span><h2 id="team-title">Okay, who's<br /> behind all this?</h2></div><p data-team-motion="support">We are an awesome creative team with a love for thoughtful design, clean code, and bringing ambitious ideas to life.</p></div>
        <dl className={styles.metrics}>
          {metrics.map((metric, i) => <div key={metric.label} data-team-motion={`metric-${i}`}><dt>{metric.label}</dt><dd><CountUp value={metric.value} suffix={metric.suffix} /></dd></div>)}
        </dl>
        <Button data-team-motion="cta" to="/work">View all cases</Button>
      </div>
      <div data-team-motion="portrait" className={styles.teamPortrait}><TeamPortraits /></div>
    </section>

    <section id="how-we-work" className={styles.process} aria-labelledby="process-title"><div className={styles.wrap}>
      <div className={styles.processIntro}><p className={styles.eyebrow}>HOW WE WORK</p><h2 id="process-title">From “what if?”<br />to “wow, it's real.”</h2><p>Good question! Every great project starts with a conversation. We listen, explore, and work closely with you to create something that looks great, works beautifully, and actually makes sense for your business.</p></div>
      <ProcessStack />
    </div></section>

    <section className={styles.motto} aria-label="Our design philosophy"><div><img src={asset('0a938.webp')} alt="" loading="lazy" /><p>We create awesome, usable and<br className={styles.desktopBreak} /> aesthetically pleasing interfaces for<br className={styles.desktopBreak} /> SaaS companies and startups</p></div></section>
    <ContactCta />
  </div>
}


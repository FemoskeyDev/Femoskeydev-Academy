import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowTopRightIcon } from '@radix-ui/react-icons'
import { Button } from '../../components/ui/Button'
import { RevealOnScroll } from '../../components/ui/RevealOnScroll'
import { siteConfig } from '../../data/siteConfig'
import { usePageMeta } from '../../hooks/usePageMeta'
import { ContactOptions } from '../ContactPage/sections/ContactOptions'
import { projects } from '../../data/projects'
import { ProjectCover } from './ProjectCover'
import { ContactCta } from './ContactCta'
import styles from './StudioPages.module.css'

const description = 'Femoskeydev is a founder-led digital design and development studio for products and websites.'

function PageIntro({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return <header className={`${styles.wrap} ${styles.intro}`}>
    <p className={styles.kicker}>{label}</p>
    <h1>{title}</h1>
    <div className={styles.lede}>{children}</div>
  </header>
}

function ProjectGrid({ heading: Heading = 'h2' }: { heading?: 'h2' | 'h3' }) {
  return <div className={styles.projects}>
    {projects.map(project => {
      const content = <>
        <div className={styles.projectImage}><ProjectCover project={project} /></div>
        <div className={styles.projectCaption}>
          <div><p className={styles.kicker}>{project.type}</p><Heading>{project.name}</Heading></div>
          {project.to && <span className={styles.circle}><ArrowTopRightIcon width={22} height={22} aria-hidden="true" /></span>}
        </div>
      </>
      return <RevealOnScroll className={styles.project} key={project.slug}>
        {project.to ? <Link className={styles.projectLink} to={project.to}>{content}</Link> : <div className={styles.projectLink} aria-label={`${project.name}, case study coming soon`}>{content}</div>}
      </RevealOnScroll>
    })}
  </div>
}

function ContactBanner() {
  return <section className={styles.contactBand}>
    <RevealOnScroll className={styles.wrap}>
      <p className={styles.kicker}>Work with the studio</p>
      <h2>What are you<br />working on?</h2>
      <Button href={siteConfig.bookingUrl} target="_blank" rel="noreferrer" variant="primary">Start a project</Button>
    </RevealOnScroll>
  </section>
}

export function ServicesPage() {
  usePageMeta('Services', 'Product design, development, branding, graphic design, and motion for digital products and websites.', 'Femoskeydev')
  const services = [
    { name: 'Product Design', image: 'product-design', copy: 'User flows, interfaces, and prototypes that turn your product idea into a clear, usable experience.' },
    { name: 'Development', image: 'development', copy: 'Responsive websites and digital products, with design and implementation developed together.' },
    { name: 'Branding & Identity', image: 'branding', copy: 'Visual identities and brand systems that give your business a clear and consistent presence.' },
    { name: 'Graphic Design', image: 'graphic-design', copy: 'Visual communication for digital platforms, campaigns, and the materials your brand needs.' },
    { name: 'Motion & Animation', image: 'motion', copy: 'Purposeful interface motion and animation that bring digital experiences to life.' },
  ]
  return <div className={styles.site}>
    <PageIntro label="Our services" title="Design, code, and then some."><p>From the first idea to the final interaction, explore how we can help bring your project to life.</p></PageIntro>
    <section className={`${styles.wrap} ${styles.serviceDetails}`} aria-label="Studio services">
      {services.map(service => <article className={styles.serviceDetail} key={service.image}>
        <img src={`/images/services/${service.image}.svg`} alt={`${service.name} illustration`} width="640" height="600" loading="lazy" />
        <div><h2>{service.name}</h2><p>{service.copy}</p><Button to={`/contact?service=${encodeURIComponent(service.name)}`}>Discuss your project</Button></div>
      </article>)}
    </section>
    <ContactBanner />
  </div>
}

export function WorkPage() {
  usePageMeta('Work', 'Case studies from Femoskeydev: Liziwaride, Paymita and more on the way.', 'Femoskeydev')
  return <div className={styles.site}>
    <PageIntro label="Femoskeydev studio" title="Selected work.">
      <p>Explore the products we’ve designed, from Liziwaride’s mobility apps to Paymita’s payments wallet, with more on the way.</p>
    </PageIntro>
    <section className={`${styles.wrap} ${styles.workList}`} aria-label="Projects"><ProjectGrid /></section>
    <ContactCta />
  </div>
}

export function StudioPage() {
  usePageMeta('Studio', description, 'Femoskeydev')
  return <div className={styles.site}>
    <PageIntro label="About the studio" title="Two brothers. One studio.">
      <p>We bring product design and development together from the first conversation through to the build.</p>
    </PageIntro>
    <section className={styles.studioBand} aria-label="Team">
      <RevealOnScroll className={`${styles.wrap} ${styles.split}`}>
        <img className={styles.founder} src={siteConfig.portrait} alt="Femoskeydev studio founder" width="2048" height="2048" />
        <div className={styles.team}>
          <div><p className={styles.kicker}>Founder</p><h2>Product designer &amp; design engineer</h2><p>Leads product design and works in code to carry design decisions through to the interface.</p></div>
          <div><p className={styles.kicker}>Founder’s brother</p><h2>Developer</h2><p>Works alongside the founder on technical decisions and development.</p></div>
        </div>
      </RevealOnScroll>
    </section>
    <section className={`${styles.wrap} ${styles.section}`}>
      <RevealOnScroll className={styles.caseCopy}>
        <h2>What we do</h2>
        <ul className={styles.services}>
          <li><h3>Product design</h3><p>Flows, interfaces, and prototypes for digital products.</p></li>
          <li><h3>Design engineering</h3><p>Responsive components, interaction, and motion in code.</p></li>
          <li><h3>Web development</h3><p>Building and refining websites and digital experiences.</p></li>
        </ul>
      </RevealOnScroll>
    </section>
    <ContactBanner />
  </div>
}

export function StudioContactPage() {
  usePageMeta('Contact', 'Get in touch with Femoskeydev about studio projects or Academy enquiries.', 'Femoskeydev')
  const [brief, setBrief] = useState('')
  const [status, setStatus] = useState('')
  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(brief)
      setStatus('Brief copied.')
    } catch {
      setStatus('Select and copy the brief from the field above.')
    }
  }

  return <div className={styles.site}>
    <PageIntro label="Contact" title="Tell us what you’re building.">
      <p>For a studio project, tell us what you need, who it’s for, and when you’d like to launch.</p>
    </PageIntro>
    <section className={`${styles.wrap} ${styles.contactForm}`} aria-labelledby="project-enquiry">
      <h2 id="project-enquiry">Studio enquiries</h2>
      {siteConfig.studioContactUrl ? <a className="button button-dark" href={siteConfig.studioContactUrl}>Contact the studio <ArrowTopRightIcon width={18} height={18} aria-hidden="true" /></a> : <>
        <p>The studio’s contact details are being prepared. You can draft and copy a brief here for later.</p>
        <label htmlFor="project-brief">Project brief</label>
        <textarea id="project-brief" rows={5} value={brief} onChange={event => { setBrief(event.target.value); setStatus('') }} />
        <button className="button button-dark" type="button" disabled={!brief.trim()} onClick={copyBrief}>Copy brief</button>
        <p role="status">{status}</p>
      </>}
    </section>
    <ContactOptions />
  </div>
}

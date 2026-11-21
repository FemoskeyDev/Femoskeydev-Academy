import { Link } from 'react-router-dom'
import { ArrowTopRightIcon } from '@radix-ui/react-icons'
import { usePageMeta } from '../../hooks/usePageMeta'
import { ContactCta } from '../StudioPages/ContactCta'
import { Heading, MediaBento, type BentoTile } from './parts'
import { ShowcaseFilm } from './ShowcaseFilm'
import { responsive } from '../../lib/images'
import styles from './CaseStudy.module.css'

const image = (file: string) => `/images/work/savecircle/${file}.webp`
const tile = (file: string, alt: string, w = 408, h?: number): BentoTile => ({ src: image(file), alt, w, h })

const meta = [
  ['Role', 'Product designer'],
  ['Timeline', 'February 2024 – ongoing'],
  ['Platforms', 'iOS & Android app, admin dashboard'],
]

type Section = { id: string; title: string; subtitle: string; copy: string; rows: BentoTile[][] }

// Shots first, one line of copy per section, following the Figma case study.
const sections: Section[] = [
  {
    id: 'brand', title: 'The SaveCircle brand', subtitle: 'two colours, one circle',
    copy: 'A circle mark in purple and green that holds up on every background.',
    rows: [[
      tile('brand-logo', 'The SaveCircle logo on SaveCircle purple', 828, 400),
      tile('brand-icon', 'The SaveCircle circle mark up close', 408, 400),
    ]],
  },
  {
    id: 'onboarding', title: 'First impressions', subtitle: 'people first',
    copy: 'Real faces and three simple promises before sign-up.',
    rows: [[
      tile('onb-1', 'SaveCircle splash screen with the logo on purple', 303),
      tile('onb-2', 'Onboarding screen with a ring of member photos', 303),
      tile('onb-3', 'Onboarding screen introducing saving with people you trust', 303),
      tile('onb-4', 'Onboarding screen with the final promise before sign-up', 303),
    ]],
  },
  {
    id: 'home', title: 'Home', subtitle: 'your money and your circles',
    copy: 'Balance, circles and activity at a glance.',
    rows: [
      [tile('home-1', 'Home screen with the personal balance and ongoing circles'),
        tile('home-2', 'Home screen for a new member with options to create or join a circle'),
        tile('home-3', 'Quick actions menu: create a circle, join a circle, add money, send money')],
      [tile('home-4', 'Circles screen listing ongoing circles and their progress'),
        tile('home-5', 'The SaveCircle mark surrounded by member photos', 828)],
    ],
  },
  {
    id: 'create', title: 'Create a circle', subtitle: 'in four steps',
    copy: 'Name it, set the amount, choose a schedule, assign slots.',
    rows: [
      [tile('create-1', 'Create circle screen with the circle name and username'),
        tile('create-2', 'Set contribution amount screen with quick amounts'),
        tile('create-3', 'Set contribution frequency screen with bi-weekly selected')],
      [tile('create-4', 'Slot assignment screen'),
        tile('create-5', 'A group of friends seen from below, beside a smiling member', 828)],
    ],
  },
  {
    id: 'dashboard', title: 'Circle dashboard', subtitle: 'everyone in the loop',
    copy: 'Contributions, recipients and progress for every member.',
    rows: [
      [tile('dash-1', 'Circle dashboard showing the amount contributed and the next recipient'),
        tile('dash-2', 'Circle dashboard with the circle balance and saving round'),
        tile('dash-3', 'Circle details with frequency, due day, slots and the circle leader')],
      [tile('dash-4', 'A smiling member framed by the SaveCircle ring', 828),
        tile('dash-5', 'Circle dashboard with goal progress and contribution amount')],
    ],
  },
  {
    id: 'money', title: 'Contribute and add money', subtitle: 'in a few taps',
    copy: 'Confirm, pay and get a receipt.',
    rows: [
      [tile('money-1', 'Confirm contribution screen with the payment method', 303),
        tile('money-2', 'Contribution successful receipt', 303),
        tile('money-3', 'Add money keypad showing $25', 303),
        tile('money-4', 'Scan a QR code to send money', 303)],
      [tile('money-5', 'Lock screen notifications from SaveCircle: a savings insight, a successful contribution and a reminder', 1248)],
    ],
  },
]

export function SaveCircleCaseStudy() {
  usePageMeta('SaveCircle case study', 'Group savings circles for friends, family and colleagues: create a circle, contribute on a schedule and track every payment together.', 'Femoskeydev')
  return <>
    <article className={styles.page}>
      <div className={styles.hero} style={{ background: '#8f2ceb' }}>
        <img data-flare {...responsive(image('hero'), 2752, '(max-width: 1440px) 100vw, 1376px')} alt="SaveCircle home and circle screens on two phones, beside the line: Save together, grow together" width="2752" height="1520" fetchPriority="high" />
      </div>

      <header className={`${styles.wrap} ${styles.intro}`}>
        <p className={styles.kicker}>Case study · Fintech · Savings</p>
        <h1>SaveCircle</h1>
        <p className={styles.lede}>Group savings, made simple. Create a circle, invite people you trust and save towards shared goals.</p>
        <div className={styles.details}>
          <p>SaveCircle turns the traditional rotating savings circle into an app. Members contribute on a schedule, take turns receiving the pot, and track every payment together.</p>
          <dl className={styles.meta}>
            <div className={styles.metaWide}><dt>Problem</dt><dd>How might we make group saving transparent and easy to manage for everyone in the circle?</dd></div>
            <div className={styles.metaWide}><dt>Outcome</dt><dd>A mobile app, admin dashboard and website, built on one design system.</dd></div>
            {meta.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </div>
      </header>

      <ShowcaseFilm src="/images/work/savecircle/admin-film.mp4" poster={image('admin-film-poster')} sound={false} background="#a6a6a6" label="Film of the SaveCircle admin dashboard on a desk monitor: opening Manage Circles, a circle's details and contribution history, then Analytics" />

      {sections.map(section => <section key={section.id} className={`${styles.wrap} ${styles.section}`} aria-labelledby={section.id}>
        <div className={styles.sectionHead}><Heading id={section.id} title={section.title} subtitle={section.subtitle} /><p>{section.copy}</p></div>
        <MediaBento rows={section.rows} />
      </section>)}

      <nav className={`${styles.wrap} ${styles.next}`} aria-label="Next project">
        <p className={styles.kicker}>Next project</p>
        <Link to="/work/liziwaride">Liziwaride <ArrowTopRightIcon width={40} height={40} aria-hidden="true" /></Link>
      </nav>
    </article>
    <ContactCta />
  </>
}

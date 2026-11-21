import { Link } from 'react-router-dom'
import { ArrowTopRightIcon } from '@radix-ui/react-icons'
import { RevealOnScroll } from '../../components/ui/RevealOnScroll'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Heading } from './parts'
import { ContactCta } from '../StudioPages/ContactCta'
import { responsive } from '../../lib/images'
import styles from './CaseStudy.module.css'

const image = (file: string) => `/images/work/liziwaride/${file}.webp`

type Tile = { file: string; alt: string; wide?: boolean }
type Feature = { id: string; title: string; subtitle: string; copy: string; columns?: 3 | 4; tiles: Tile[] }

const meta = [
  ['Role', 'Product designer'],
  ['Timeline', 'January 2025 – ongoing'],
  ['Platforms', 'iOS & Android apps, web admin dashboard'],
]

const features: Feature[] = [
  {
    id: 'onboarding', title: 'First impressions', subtitle: 'safety from the start', columns: 4,
    copy: 'Onboarding introduces the three promises of the product (ride smarter, safety first, and taking the bus) before sign-up and identity checks.',
    tiles: [
      { file: 'onboarding-1', alt: 'Liziwaride splash screen with the logo on purple' },
      { file: 'onboarding-2', alt: 'Onboarding screen: Ride smarter across Africa' },
      { file: 'onboarding-3', alt: 'Onboarding screen: Your safety comes first' },
      { file: 'onboarding-4', alt: 'Onboarding screen: Take a bus' },
    ],
  },
  {
    id: 'ride-hailing', title: 'Ride hailing', subtitle: 'from pickup to drop-off',
    copy: 'Pick a pickup and drop-off from saved places, compare ride types with prices shown up front, then follow the driver live from arrival to drop-off.',
    tiles: [
      { file: 'ride-1', alt: 'Book a ride screen with saved places and the drop-off search' },
      { file: 'ride-2', alt: 'Choose your ride screen comparing Economy, Comfort and Premium prices' },
      { file: 'ride-3', alt: 'Driver arriving in 3 minutes, with pickup details and the driver’s profile' },
      { file: 'ride-4', alt: 'Trip in progress with the live route on the map' },
      { file: 'ride-illustration', alt: 'Illustration of a map globe, a passenger photo card and Liziwaride payment cards', wide: true },
    ],
  },
  {
    id: 'smart-bus', title: 'Smart Bus', subtitle: 'tap in, tap out',
    copy: 'Passengers tap in and out of smart buses with a Liziwaride NFC card, with a boarding QR code as a fallback when the reader is unavailable. Adding a card, checking its balance and seeing recent trips all happen in the app.',
    tiles: [
      { file: 'bus-1', alt: 'Boarding QR code sheet for the smart bus' },
      { file: 'bus-2', alt: 'How Smart Bus QR codes work, with a scanner photo and steps' },
      { file: 'bus-3', alt: 'Add your NFC card screen waiting for a card to be held to the phone' },
      { file: 'bus-illustration', alt: 'Illustration of a passenger stepping onto a smart bus', wide: true },
      { file: 'bus-4', alt: 'NFC cards list with active and inactive cards' },
    ],
  },
  {
    id: 'special-services', title: 'Special services', subtitle: 'and one wallet',
    copy: 'Airport transfers, hotel pickups, VIP rides and corporate shuttles can be scheduled ahead for a set date and time. One wallet funds every ride type, with quick top-up amounts.',
    tiles: [
      { file: 'special-1', alt: 'Special services home: plan, book and relax, with ride types and recent special rides' },
      { file: 'special-2', alt: 'Schedule a special ride sheet over a photo of an airport drop-off' },
      { file: 'special-3', alt: 'Add money screen asking how much to add to the wallet' },
      { file: 'special-4', alt: 'Add money screen with quick top-up amounts and the keypad' },
      { file: 'special-wide', alt: 'Illustration of a hand tapping a phone to pay', wide: true },
    ],
  },
  {
    id: 'driver-app', title: 'Driver app', subtitle: 'the other side of the trip',
    copy: 'Drivers sign up with vehicle details and KYC, go online with one tap, run trips with the route and passenger in view, and follow their earnings and payouts to a bank account.',
    tiles: [
      { file: 'driver-1', alt: 'Driver home while offline, with a Go online button and today’s earnings' },
      { file: 'driver-2', alt: 'Driver home online, with high-demand areas nearby' },
      { file: 'driver-3', alt: 'Driver trip in progress with the destination and an End trip button' },
      { file: 'driver-4', alt: 'Large buttons, fewer taps' },
      { file: 'driver-5', alt: 'Driver navigation map during a trip' },
      { file: 'driver-6', alt: 'Driver earnings screen with payouts and transactions' },
    ],
  },
]

export function LiziwarideCaseStudy() {
  usePageMeta()
  const reduced = useReducedMotion()
  return <>
  <article className={styles.page}>
    <div className={styles.hero}>
      <img data-flare {...responsive(image('hero'), 2752, '(max-width: 1440px) 100vw, 1376px')} alt="Hand holding a phone showing the Liziwaride home screen, beside the line: Ride smarter across Africa" width="2752" height="1520" fetchPriority="high" />
    </div>

    <header className={`${styles.wrap} ${styles.intro}`}>
      <p className={styles.kicker}>Case study · Mobility · Product design</p>
      <h1>Liziwaride</h1>
      <p className={styles.lede}>Ride smarter across Africa. Ride hailing, smart buses and scheduled rides in one app, backed by a driver app and an admin dashboard.</p>
      <div className={styles.details}>
        <p>Liziwaride brings the ways people move around Abuja into one product. Passengers can hail a car, board a smart bus with a QR code or NFC card, or schedule a special ride, and pay for all of it from one wallet. Drivers get their own app to go online, run trips and track earnings, and operators manage the whole network from an admin dashboard.</p>
        <dl className={styles.meta}>
          <div className={styles.metaWide}><dt>Problem</dt><dd>How might we give commuters one reliable, transparent way to get around the city, by car or by bus, while keeping drivers and operators in the loop?</dd></div>
          <div className={styles.metaWide}><dt>Outcome</dt><dd>End-to-end designs for a passenger app, a driver app and an admin dashboard, built on one shared design system.</dd></div>
          {meta.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </div>
    </header>

    <div className={styles.fullBleed}>
      <img data-flare {...responsive(image('showcase'), 2880, '100vw')} alt="The Liziwaride admin dashboard on a desktop monitor" width="2880" height="1404" loading="lazy" />
    </div>

    {features.map(feature => <section key={feature.id} className={`${styles.wrap} ${styles.section}`} aria-labelledby={feature.id}>
      <div className={styles.sectionHead}><Heading id={feature.id} title={feature.title} subtitle={feature.subtitle} /><p>{feature.copy}</p></div>
      <RevealOnScroll className={`${styles.bento} ${feature.columns === 4 ? styles.four : ''}`}>
        {feature.tiles.map(tile => <figure key={tile.file} className={tile.wide ? styles.wideTile : styles.tile}>
          <img data-flare {...responsive(image(tile.file), tile.wide ? 1656 : feature.columns === 4 ? 606 : 816, tile.wide ? '(max-width: 600px) 100vw, 66vw' : '(max-width: 600px) 50vw, 33vw')} alt={tile.alt} loading="lazy" />
        </figure>)}
      </RevealOnScroll>
    </section>)}

    <section className={styles.section} aria-labelledby="admin">
      <div className={`${styles.wrap} ${styles.sectionHead}`}><Heading id="admin" title="Admin dashboard" subtitle="running the network" /><p>Operators get a web dashboard for the whole network: live trips on a map, passengers and drivers, operations, finance, pricing, geography, partners, vehicles and settings.</p></div>
      <div className={styles.wrap}>
        {/* Reduced motion keeps the film paused on its poster with controls. */}
        <video data-flare className={styles.film} src="/images/work/liziwaride/admin-film.mp4" poster="/images/work/liziwaride/admin-film-poster.webp" width="1600" height="900" muted loop playsInline preload="none" autoPlay={!reduced} controls={reduced} aria-label="Film of an operator freezing a passenger account and opening Wallet & NFC Cards in the admin dashboard" />
      </div>
    </section>

    <section className={styles.section} aria-labelledby="final">
      <div className={`${styles.wrap} ${styles.sectionHead}`}><Heading id="final" title="Liziwaride" subtitle="on your home screen" /><p>The app icon and launch experience on iOS and Android.</p></div>
      <div className={styles.fullBleed}>
        <img data-flare {...responsive(image('app-icon'), 2880, '100vw')} alt="The Liziwaride app icon on iOS and Android home screens" width="2880" height="1360" loading="lazy" />
      </div>
    </section>

    <nav className={`${styles.wrap} ${styles.next}`} aria-label="Next project">
      <p className={styles.kicker}>Next project</p>
      <Link to="/work/paymita">Paymita <ArrowTopRightIcon width={40} height={40} aria-hidden="true" /></Link>
    </nav>
  </article>
  <ContactCta />
  </>
}

import { usePageMeta } from '../../hooks/usePageMeta'
import { ContactCta } from '../StudioPages/ContactCta'
import { Heading, MediaBento, type BentoTile } from './parts'
import { ShowcaseFilm } from './ShowcaseFilm'
import styles from './CaseStudy.module.css'

const image = (file: string) => `/images/work/paymita/${file}.jpg`
const tile = (file: string, alt: string, w = 408, h?: number): BentoTile => ({ src: image(file), alt, w, h })

const meta = [
  ['Role', 'Product designer'],
  ['Timeline', '2024 – 2025'],
  ['Platforms', 'iOS & Android app'],
]

type Section = { id: string; title: string; subtitle: string; copy: string; rows: BentoTile[][] }

const sections: Section[] = [
  {
    id: 'brand', title: 'The Paymita brand', subtitle: 'logo, type and colour',
    copy: 'The P mark and wordmark, the Urbanist typeface, Paymita blue for every action and a deep navy for depth. The same foundations carry through every screen in the app.',
    rows: [
      [tile('brand-logo', 'The white Paymita logo on Paymita blue', 828, 400), tile('brand-icon', 'The Paymita app icon: a white P mark on a blue rounded square', 408, 400)],
      [tile('brand-foundations', 'Foundations: Aa set in Urbanist with the four brand colours', 408, 400),
        tile('brand-blue', 'The Paymita Blue scale from 100 to 900, with hex values', 408, 400),
        tile('brand-button', 'Primary, secondary and disabled buttons', 408, 400)],
    ],
  },
  {
    id: 'onboarding', title: 'First impressions', subtitle: 'from bills to cash',
    copy: 'Onboarding introduces Paymita’s three promises (paying bills in seconds, converting airtime to cash, and starting a journey) before sign-up and verification.',
    rows: [[
      tile('onb-1', 'Paymita splash screen with the P mark on blue', 303),
      tile('onb-2', 'Onboarding screen: Pay your bills in seconds', 303),
      tile('onb-3', 'Onboarding screen: Convert airtime to cash', 303),
      tile('onb-4', 'Onboarding screen: Your journey starts here', 303),
    ]],
  },
  {
    id: 'everyday', title: 'Everyday payments', subtitle: 'in a few taps',
    copy: 'Home puts the balance, quick actions and recent transactions first. Every bill (airtime, data, electricity, cable TV, education, betting) follows the same pattern: choose a provider, enter the details, confirm the amount.',
    rows: [
      [tile('pay-1', 'Home screen with the wallet balance, quick actions and recent transactions'),
        tile('pay-2', 'All payments screen listing airtime, data, TV and electricity'),
        tile('pay-3', 'Buy airtime screen with network providers')],
      [tile('pay-4', 'Electricity bill payment form'),
        tile('pay-5', 'Paymita banner: Enjoy faster and seamless bills payment and subscriptions', 828)],
    ],
  },
  {
    id: 'airtime-to-cash', title: 'Airtime to cash', subtitle: 'spare credit, real money',
    copy: 'Pick a network, enter the number, amount and airtime share PIN, confirm with an OTP, and the cash lands in the wallet. The receipt shows the airtime sent, the conversion rate and the amount credited.',
    rows: [
      [tile('a2c-1', 'Instant airtime to cash form'),
        tile('a2c-2', 'Airtime to cash form filled in with MTN, a phone number and an amount'),
        tile('a2c-3', 'Enter OTP screen')],
      [tile('a2c-4', 'Illustration of a Paymita card surrounded by bill payment icons', 828),
        tile('a2c-5', 'Airtime to cash receipt showing the amount credited')],
    ],
  },
  {
    id: 'virtual-cards', title: 'Virtual dollar cards', subtitle: 'for paying online',
    copy: 'Create a Mastercard or Visa virtual card in a few steps. The card fee, funding amount and exchange rate are shown before paying, and cards can be frozen, limited or deleted at any time.',
    rows: [
      [tile('card-1', 'Create virtual card screen: choosing Standard or Platinum'),
        tile('card-2', 'Funding a new virtual card with fees and the exchange rate'),
        tile('card-3', 'Your virtual card is ready')],
      [tile('card-4', 'A smiling man holding a phone in front of a hot-air balloon, with a 50% off badge'),
        tile('card-5', 'Illustration of two Paymita USD and NGN virtual cards', 828)],
    ],
  },
  {
    id: 'verify', title: 'Verify once', subtitle: 'unlock higher limits',
    copy: 'Accounts start on a basic tier. NIN verification and a selfie unlock higher daily limits, and the same clear steps carry through to adding money and withdrawing to a bank.',
    rows: [
      [tile('verify-1', 'Verify your NIN screen'),
        tile('verify-2', 'Take a selfie screen for identity verification'),
        tile('verify-3', 'Account limits screen with upgrade tiers')],
      [tile('verify-4', 'Money in, money out', 461),
        tile('verify-5', 'Fund with card screen with quick amounts', 381),
        tile('verify-6', 'Become a Reseller screen', 381)],
    ],
  },
]

export function PaymitaCaseStudy() {
  usePageMeta('Paymita case study', 'Pay your bills in seconds: airtime, data, electricity, cable TV, airtime to cash and virtual dollar cards in one wallet.', 'Femoskeydev')
  return <>
    <article className={styles.page}>
      <div className={`${styles.hero} ${styles.renderHero}`}>
        <div className={styles.renderHeroCopy}>
          <p>Paymita</p>
          <p className={styles.renderHeroTitle}><span>Pay your bills</span> in seconds.</p>
          <p>Airtime, data, power, TV and airtime to cash, all from one wallet.</p>
        </div>
        <img data-flare src={image('hero-render')} alt="The Paymita home screen on an iPhone, beside a Paymita virtual Mastercard and the back of a second phone" width="2000" height="1000" fetchPriority="high" />
      </div>

      <header className={`${styles.wrap} ${styles.intro}`}>
        <p className={styles.kicker}>Case study · Fintech · Product design</p>
        <h1>Paymita</h1>
        <p className={styles.lede}>Pay your bills in seconds. Airtime, data, electricity, cable TV and more, plus airtime to cash and virtual dollar cards, from one wallet.</p>
        <div className={styles.details}>
          <p>Paymita is a payments wallet for everyday life in Nigeria. People top up airtime and data, pay for electricity, cable TV, education and betting, convert unused airtime into cash, and create virtual dollar cards for paying online. A tiered verification flow unlocks higher limits as people use the app more.</p>
          <dl className={styles.meta}>
            <div className={styles.metaWide}><dt>Problem</dt><dd>How might we make paying everyday bills fast and trustworthy, and give people new ways to move money, like turning spare airtime into cash?</dd></div>
            <div className={styles.metaWide}><dt>Outcome</dt><dd>End-to-end designs for the Paymita mobile app on iOS and Android, built on one shared design system.</dd></div>
            {meta.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </div>
      </header>

      <ShowcaseFilm src="/images/work/paymita/walkthrough.mp4" poster={image('walkthrough-poster')} label="Walkthrough on an iPhone 16 Pro: converting airtime to cash, then creating a virtual card" />

      {sections.map(section => <section key={section.id} className={`${styles.wrap} ${styles.section}`} aria-labelledby={section.id}>
        <div className={styles.sectionHead}><Heading id={section.id} title={section.title} subtitle={section.subtitle} /><p>{section.copy}</p></div>
        <MediaBento rows={section.rows} />
      </section>)}
    </article>
    <ContactCta />
  </>
}

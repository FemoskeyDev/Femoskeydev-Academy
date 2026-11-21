import { Link } from 'react-router-dom'
import { siteConfig } from '../../data/siteConfig'
import { Arrow } from '../../components/ui/Arrow'
import { usePageMeta } from '../../hooks/usePageMeta'
import styles from '../NotFoundPage/NotFoundPage.module.css'

/** Shown at the URL of any page that isn't live yet, so only finished pages are reachable. */
export function ComingSoonPage({ title }: { title: string }) {
  usePageMeta(`${title} · Coming soon`, `${title} is coming soon to Femoskeydev.`, 'Femoskeydev')
  return <section className={`not-found section-pad ${styles.notFound}`}>
    <div className="eyebrow">Coming soon</div>
    <h1>{title} is on its way.</h1>
    <p>We're still putting this page together. In the meantime, take a look at our work or book a call.</p>
    <div className={styles.actions}>
      <Link to="/work" className="button button-dark">See our work <Arrow /></Link>
      <a href={siteConfig.bookingUrl} target="_blank" rel="noreferrer" className="button button-outline">Book a call <Arrow /></a>
    </div>
  </section>
}

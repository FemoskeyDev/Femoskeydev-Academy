import { Arrow } from '../../components/ui/Arrow'
import { siteConfig } from '../../data/siteConfig'
import styles from './ContactCta.module.css'

/** The dark "Let's talk" block that ends every live page: a short headline and line on the left and, in place of a
 *  form, one big card that books a call. It stays dark into the footer. */
export function ContactCta() {
  return <section className={styles.contact} aria-labelledby="contact-title" data-surface-fixed>
    <div className={styles.inner}>
      <div className={styles.copy}>
        <h2 id="contact-title">Let's talk.</h2>
        <p className={styles.lead}>We're here to design, build and ship something awesome with you.</p>
        <p className={styles.note}><span className={styles.dot} aria-hidden="true" />Pick a time that suits you. No forms, no back and forth.</p>
      </div>
      <a className={styles.book} href={siteConfig.bookingUrl} target="_blank" rel="noreferrer" aria-label="Book a call on Cal.com (opens in a new tab)">
        <span className={styles.label}>Start a project</span>
        <span className={styles.arrow} aria-hidden="true"><Arrow className={styles.glyph} weight="semibold" /></span>
        <span className={styles.action}>Book a call</span>
        <span className={styles.where}>cal.com/femoskeydev</span>
      </a>
    </div>
  </section>
}

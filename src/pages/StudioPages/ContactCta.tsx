import { Button } from '../../components/ui/Button'
import { siteConfig } from '../../data/siteConfig'
import styles from './ContactCta.module.css'

/** The dark "Let's create something awesome together" block that ends every live page; it stays dark into the footer. */
export function ContactCta() {
  return <section className={styles.contact} aria-labelledby="contact-title" data-surface-fixed><div><h2 id="contact-title">Let's create something<br /><span>awesome</span> <em>together</em>.</h2><p>We’re always looking to collaborate on interesting projects with great people. Need a supportive hand? We have four!</p><Button href={siteConfig.bookingUrl} target="_blank" rel="noreferrer" variant="lime">Get in touch</Button></div></section>
}

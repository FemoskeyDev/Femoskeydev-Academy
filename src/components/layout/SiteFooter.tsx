import { Link } from 'react-router-dom'
import { InstagramLogoIcon, LinkedInLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons'
import { siteConfig } from '../../data/siteConfig'
import { socialLinks } from '../../data/socialLinks'
import { Arrow } from '../ui/Arrow'
import { ComingSoon } from '../ui/ComingSoon'
import styles from './SiteFooter.module.css'

const asset = (file: string) => `/images/portfolio/${file}`

// Pages that aren't live yet show a "Coming soon" tooltip instead of linking.
const comingSoon = ['Services', 'About', 'Academy']
const arrow = <Arrow className={styles.arrow} />
const socialIcons = { X: TwitterLogoIcon, Instagram: InstagramLogoIcon, LinkedIn: LinkedInLogoIcon }

/** Logo and two link columns, then the studio name set huge in see-through white, rising out of a slow
 *  brand-colour fog, with the small print on top of it. */
export function SiteFooter() {
  return <footer className={styles.footer}>
    <div className={styles.top}>
      <Link to="/" className={styles.brand} aria-label="Femoskeydev home"><img src={asset('logo-white.svg')} alt="Femoskeydev" width="220" height="32" /></Link>
      <nav aria-label="Footer navigation" className={styles.column}>
        <h2>Navigation</h2>
        <Link to="/">Home {arrow}</Link>
        <Link to="/work">Case Studies {arrow}</Link>
        {comingSoon.map(label => <ComingSoon key={label} placement="above">{label}</ComingSoon>)}
        <a href={siteConfig.bookingUrl} target="_blank" rel="noreferrer">Contact {arrow}</a>
      </nav>
      <div className={styles.column} role="group" aria-labelledby="footer-social">
        <h2 id="footer-social">Social</h2>
        {socialLinks.map(({ label, href }) => {
          const Icon = socialIcons[label]
          const icon = <Icon width={16} height={16} aria-hidden="true" />
          return href
            ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}>{icon}{label} {arrow}</a>
            : <ComingSoon key={label} placement="above">{icon}{label}</ComingSoon>
        })}
      </div>
    </div>
    <div className={styles.stage}>
      <div className={styles.fog} aria-hidden="true"><i /><i /><i /><i /></div>
      <p className={styles.wordmark} aria-hidden="true">femoskeydev</p>
      <p className={styles.legal}><span>© {new Date().getFullYear()} Femoskeydev</span><span>Design &amp; development studio</span></p>
    </div>
  </footer>
}

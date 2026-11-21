import { Link } from 'react-router-dom'
import { InstagramLogoIcon, LinkedInLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons'
import { siteConfig } from '../../data/siteConfig'
import { socialLinks } from '../../data/socialLinks'
import { ComingSoon } from '../ui/ComingSoon'
import styles from './SiteFooter.module.css'

const asset = (file: string) => `/images/portfolio/${file}`

// Pages that aren't live yet show a "Coming soon" tooltip instead of linking.
const comingSoon = ['Services', 'About', 'Academy']
const socialIcons = { X: TwitterLogoIcon, Instagram: InstagramLogoIcon, LinkedIn: LinkedInLogoIcon }

export function SiteFooter() {
  return <footer className={styles.footer}>
    <div className={styles.top}>
      <Link to="/" className={styles.brand} aria-label="Femoskeydev home"><img src={asset('logo-white.svg')} alt="Femoskeydev" width="220" height="32" /></Link>
      <div className={styles.socials} role="group" aria-label="Social profiles">
        {socialLinks.map(({ label, href }) => {
          const Icon = socialIcons[label]
          return href
            ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}><Icon width={20} height={20} aria-hidden="true" /></a>
            : <span key={label} role="img" aria-label={`${label}, coming soon`} title={`${label}: coming soon`}><Icon width={20} height={20} aria-hidden="true" /></span>
        })}
      </div>
    </div>
    <div className={styles.separator}><img src={asset('878e4.svg')} alt="" /></div>
    <nav aria-label="Footer navigation">
      <Link to="/work" className="text-link">Case Studies</Link>
      {comingSoon.map(label => <ComingSoon key={label} placement="above">{label}</ComingSoon>)}
      <a href={siteConfig.bookingUrl} target="_blank" rel="noreferrer" className="text-link">Contact</a>
    </nav>
  </footer>
}

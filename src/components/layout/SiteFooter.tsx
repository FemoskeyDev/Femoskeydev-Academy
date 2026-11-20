import { Link } from 'react-router-dom'
import { siteConfig } from '../../data/siteConfig'
import { socialLinks } from '../../data/socialLinks'
import { ComingSoon } from '../ui/ComingSoon'
import styles from './SiteFooter.module.css'

const asset = (file: string) => `/images/portfolio/${file}`

// Pages that aren't live yet show a "Coming soon" tooltip instead of linking.
const comingSoon = ['Services', 'About', 'Academy']

export function SiteFooter() {
  const socials = socialLinks.filter(item => item.href)

  return <footer className={styles.footer}>
    <div className={styles.top}>
      <Link to="/" className={styles.brand} aria-label="Femoskeydev home"><img src={asset('logo-white.svg')} alt="Femoskeydev" width="220" height="32" /></Link>
      <div className={styles.socials} aria-label={socials.length ? 'Social profiles' : 'Social profiles coming soon'}>
        {socials.length ? socials.map(item => <a key={item.label} href={item.href}>{item.label}</a>) : [
          { image: '7a0de.svg', label: 'X' },
          { image: '39cb4.svg', label: 'Instagram' },
          { image: '2b725.svg', label: 'Dribbble' },
        ].map(item => <span key={item.image} title={`${item.label} — link coming soon`}><img src={asset(item.image)} alt={item.label} /></span>)}
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

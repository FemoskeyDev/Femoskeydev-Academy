import { Link } from 'react-router-dom'
import { navigation } from '../../data/navigation'
import { siteConfig } from '../../data/siteConfig'
import { socialLinks } from '../../data/socialLinks'
import { BrandMark } from '../ui/BrandMark'
export function SiteFooter() { return <footer className="footer"><Link to="/" className="footer-brand"><BrandMark/><span>Femoskeydev<br/><b>Academy</b></span></Link><p>{siteConfig.tagline}</p><nav aria-label="Footer navigation">{navigation.map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}<Link to="/contact">Contact</Link></nav>{socialLinks.length > 0 && <div className="footer-socials">{socialLinks.filter(item => item.href).map(item => <a href={item.href} key={item.label}>{item.label}</a>)}</div>}<div className="footer-bottom"><span>© {new Date().getFullYear()} {siteConfig.name}</span><span>MADE FOR WHAT YOU'LL MAKE</span><a href="#top">BACK TO TOP ↑</a></div></footer> }

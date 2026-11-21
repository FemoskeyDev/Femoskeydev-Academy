import { Link, useLocation } from 'react-router-dom'
import { isAcademyPath } from '../../data/navigation'
import { siteConfig } from '../../data/siteConfig'
import { Arrow } from '../../components/ui/Arrow'
import { usePageMeta } from '../../hooks/usePageMeta'
import styles from './NotFoundPage.module.css'
export function NotFoundPage() {
  // Studio URLs get the studio name in the tab title; only Academy URLs carry the Academy name.
  const { pathname } = useLocation()
  usePageMeta('Page not found', 'The page you are looking for could not be found.', isAcademyPath(pathname) ? siteConfig.name : 'Femoskeydev')
  return <section className={`not-found section-pad ${styles.notFound}`}><div className="eyebrow">404 · A WRONG TURN</div><h1>This page isn't on the map.</h1><p>Head back to the studio homepage to find your way.</p><Link to="/" className="button button-dark">Back to home <Arrow /></Link></section>
}

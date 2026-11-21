import { Link } from 'react-router-dom'
import { Arrow } from '../../components/ui/Arrow'
import { usePageMeta } from '../../hooks/usePageMeta'
import styles from './NotFoundPage.module.css'
export function NotFoundPage() {
  usePageMeta()
  return <section className={`not-found section-pad ${styles.notFound}`}><div className="eyebrow">404 · A WRONG TURN</div><h1>This page isn't on the map.</h1><p>Head back to the studio homepage to find your way.</p><Link to="/" className="button button-dark">Back to home <Arrow /></Link></section>
}

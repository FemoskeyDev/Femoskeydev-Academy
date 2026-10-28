import { Link } from 'react-router-dom'
import { usePageMeta } from '../../hooks/usePageMeta'
import styles from './NotFoundPage.module.css'
export function NotFoundPage() { usePageMeta('Page not found','The page you are looking for could not be found.'); return <section className={`not-found section-pad ${styles.notFound}`}><div className="eyebrow">404 · A WRONG TURN</div><h1>This page isn't on the map.</h1><p>Try a learning pathway or head back to the Academy homepage.</p><Link to="/" className="button button-dark">Back to home <span aria-hidden="true">↗</span></Link></section> }

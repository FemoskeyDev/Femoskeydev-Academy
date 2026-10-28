import { Outlet, ScrollRestoration } from 'react-router-dom'
import { SkipLink } from './SkipLink'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
export function SiteLayout() { return <div id="top" className="site-shell"><SkipLink/><SiteHeader/><main id="main-content" tabIndex={-1}><Outlet/></main><SiteFooter/><ScrollRestoration/></div> }

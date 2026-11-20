import { Outlet, ScrollRestoration } from 'react-router-dom'
import { SkipLink } from './SkipLink'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { useSectionSurfaceTransitions } from '../../hooks/useSectionSurfaceTransitions'
import { usePageTransitions } from '../../hooks/usePageTransitions'
import { useEdgeFlare } from '../../features/edge-flare/useEdgeFlare'
export function SiteLayout() {
  usePageTransitions()
  useEdgeFlare()
  const surfaceRef = useSectionSurfaceTransitions()
  return <div ref={surfaceRef} id="top" className="site-shell"><SkipLink/><SiteHeader/><main id="main-content" tabIndex={-1}><Outlet/></main><SiteFooter/><ScrollRestoration/></div>
}

import { SiteLayout } from '../components/layout/SiteLayout'
import { WorkPage } from '../pages/StudioPages/StudioPages'
import { ComingSoonPage } from '../pages/ComingSoonPage/ComingSoonPage'
import { PortfolioLanding } from '../pages/StudioPages/PortfolioLanding'
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage'
import { comingSoonPages } from '../data/seo'

/** Loads a page module only when its route is first visited, keeping the studio homepage bundle small. */
const page = <T,>(load: () => Promise<T>, pick: (module: T) => React.ComponentType) =>
  async () => ({ Component: pick(await load()) })


export const routeConfig = [{ path: '/', element: <SiteLayout/>, children: [
  { index: true, element: <PortfolioLanding/> },
  { path: 'work', element: <WorkPage/> },
  // Case studies are split into their own chunks.
  { path: 'work/liziwaride', lazy: page(() => import('../pages/CaseStudies/LiziwarideCaseStudy'), m => m.LiziwarideCaseStudy) },
  { path: 'work/paymita', lazy: page(() => import('../pages/CaseStudies/PaymitaCaseStudy'), m => m.PaymitaCaseStudy) },
  { path: 'work/savecircle', lazy: page(() => import('../pages/CaseStudies/SaveCircleCaseStudy'), m => m.SaveCircleCaseStudy) },
  { path: 'work/ninelines', lazy: page(() => import('../pages/CaseStudies/NineLinesCaseStudy'), m => m.NineLinesCaseStudy) },
  // Only the portfolio, the work page and the case studies are live; every other page shows Coming soon.
  ...comingSoonPages.map(([path, title]) => ({ path, element: <ComingSoonPage title={title}/> })),
  ...(import.meta.env.DEV ? [{
    path: 'version-control',
    lazy: page(() => import('../pages/VersionControlPage/VersionControlPage'), m => m.VersionControlPage),
  }] : []),
  { path: '*', element: <NotFoundPage/> },
]}]

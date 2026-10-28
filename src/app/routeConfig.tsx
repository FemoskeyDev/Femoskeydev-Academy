import { SiteLayout } from '../components/layout/SiteLayout'
import { HomePage } from '../pages/HomePage/HomePage'
import { LearningPathsPage } from '../pages/LearningPathsPage/LearningPathsPage'
import { LearningPathDetailPage } from '../pages/LearningPathDetailPage/LearningPathDetailPage'
import { MentorshipPage } from '../pages/MentorshipPage/MentorshipPage'
import { CommunityPage } from '../pages/CommunityPage/CommunityPage'
import { AboutPage } from '../pages/AboutPage/AboutPage'
import { ContactPage } from '../pages/ContactPage/ContactPage'
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage'

export const routeConfig = [{ path: '/', element: <SiteLayout/>, children: [
  { index: true, element: <HomePage/> },
  { path: 'learning-paths', element: <LearningPathsPage/> },
  { path: 'learning-paths/:slug', element: <LearningPathDetailPage/> },
  { path: 'mentorship', element: <MentorshipPage/> },
  { path: 'community', element: <CommunityPage/> },
  { path: 'about', element: <AboutPage/> },
  { path: 'contact', element: <ContactPage/> },
  ...(import.meta.env.DEV ? [{
    path: 'version-control',
    lazy: async () => {
      const page = await import('../pages/VersionControlPage/VersionControlPage')
      return { Component: page.VersionControlPage }
    },
  }] : []),
  { path: '*', element: <NotFoundPage/> },
]}]

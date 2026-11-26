/** Case studies shown on the homepage grid and the /work page. Covers follow the Figma work grid:
 *  the brand mark centred on the brand colour. */
export type ProjectCover = {
  background: string
  src: string
  /** `logo` sits wide in the middle, `icon` is a smaller app icon, `image` fills the card. */
  kind: 'logo' | 'icon' | 'image'
  /** Colour of the soft shadow under an app icon. */
  glow?: string
}

/** What the studio did on a project; the /work page filters by these. */
export type Service = 'Branding' | 'Mobile app' | 'Dashboard' | 'Motion'
export const serviceFilters: { label: string; service?: Service }[] = [
  { label: 'All' }, { label: 'Branding', service: 'Branding' }, { label: 'Mobile apps', service: 'Mobile app' },
  { label: 'Dashboards', service: 'Dashboard' }, { label: 'Motion', service: 'Motion' },
]

export type Project = {
  slug: string
  name: string
  summary: string
  /** Case study page; absent while a project is still coming soon. */
  to?: string
  /** The year the project began, shown on its card; a coming-soon project has none. */
  year?: string
  services: Service[]
  cover: ProjectCover
}

export const projects: Project[] = [
  {
    slug: 'ninelines',
    name: 'Nine Lines',
    summary: 'A quiet identity for an interior and furniture studio: a 9 and an l drawn as one continuous line.',
    to: '/work/ninelines',
    year: '2026',
    services: ['Branding', 'Motion'],
    cover: { background: '#315357', src: '/images/work/ninelines/logo.svg', kind: 'logo' },
  },
  {
    slug: 'liziwaride',
    name: 'Liziwaride',
    summary: 'Ride hailing, smart buses and scheduled rides in one app, with a driver app and an admin dashboard.',
    to: '/work/liziwaride',
    year: '2025',
    services: ['Mobile app', 'Dashboard'],
    cover: { background: '#5841d8', src: '/images/work/liziwaride/logo.svg', kind: 'logo' },
  },
  {
    slug: 'paymita',
    name: 'Paymita',
    summary: 'Pay your bills in seconds: airtime, data, power, TV, airtime to cash and virtual dollar cards in one wallet.',
    to: '/work/paymita',
    year: '2024',
    services: ['Mobile app'],
    cover: { background: '#eaf1ff', src: '/images/work/paymita/app-icon.svg', kind: 'icon', glow: 'rgba(29,78,216,.35)' },
  },
  {
    slug: 'savecircle',
    name: 'SaveCircle',
    summary: 'Group savings circles for friends, family and colleagues, with an admin dashboard.',
    to: '/work/savecircle',
    year: '2024',
    services: ['Branding', 'Mobile app', 'Dashboard', 'Motion'],
    cover: { background: '#f5e5ff', src: '/images/work/savecircle/app-icon.svg', kind: 'icon', glow: 'rgba(143,44,235,.35)' },
  },
  {
    slug: 'edgecore',
    name: 'EdgeCore',
    summary: 'A new case study is on its way.',
    services: ['Dashboard'],
    cover: { background: '#246172', src: '/images/work/edgecore/cover.webp', kind: 'image' },
  },
]

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

export type Project = {
  slug: string
  name: string
  type: string
  summary: string
  /** Case study page; absent while a project is still coming soon. */
  to?: string
  cover: ProjectCover
}

export const projects: Project[] = [
  {
    slug: 'liziwaride',
    name: 'Liziwaride',
    type: 'Case study · Mobility',
    summary: 'Ride hailing, smart buses and scheduled rides in one app, with a driver app and an admin dashboard.',
    to: '/work/liziwaride',
    cover: { background: '#5841d8', src: '/images/work/liziwaride/logo.svg', kind: 'logo' },
  },
  {
    slug: 'paymita',
    name: 'Paymita',
    type: 'Case study · Fintech',
    summary: 'Pay your bills in seconds: airtime, data, power, TV, airtime to cash and virtual dollar cards in one wallet.',
    to: '/work/paymita',
    cover: { background: '#eaf1ff', src: '/images/work/paymita/app-icon.svg', kind: 'icon', glow: 'rgba(29,78,216,.35)' },
  },
  {
    slug: 'savecircle',
    name: 'SaveCircle',
    type: 'Case study · Savings',
    summary: 'Group savings circles for friends, family and colleagues, with an admin dashboard.',
    to: '/work/savecircle',
    cover: { background: '#f5e5ff', src: '/images/work/savecircle/app-icon.svg', kind: 'icon', glow: 'rgba(143,44,235,.35)' },
  },
  {
    slug: 'edgecore',
    name: 'EdgeCore',
    type: 'Case study · Coming soon',
    summary: 'A new case study is on its way.',
    cover: { background: '#246172', src: '/images/work/edgecore/cover.jpg', kind: 'image' },
  },
]

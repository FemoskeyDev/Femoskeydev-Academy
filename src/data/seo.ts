/*
 * What search engines and link previews see for each page: one place for titles, descriptions and share images.
 * The browser applies it on navigation (usePageMeta), and the build writes it into a real HTML file per page
 * (seoPages in vite.config.ts), so crawlers that don't run JavaScript get the right page too. Plain TypeScript,
 * no JSX: vite.config.ts imports it.
 */

export const site = {
  name: 'Femoskeydev',
  url: 'https://femoskeydev.com',
  x: '@Femoskeydev',
  logo: '/images/social/icon-512.png',
  sameAs: ['https://x.com/Femoskeydev', 'https://www.instagram.com/femoskeydev/'],
  founder: { name: 'Lawal Oluwafemi', jobTitle: 'CEO & Designer', linkedin: 'https://www.linkedin.com/in/oluwafemilawal/' },
}

export type PageSeo = {
  title: string
  description: string
  image: string
  imageAlt: string
  /** Kept out of search results (Coming soon and not-found pages). */
  noindex?: boolean
  /** A case study, described to search engines as a creative work. */
  caseStudy?: boolean
}

const studioImage = { image: '/images/social/femoskeydev.jpg', imageAlt: 'Femoskeydev' }

const studioDescription = 'We design and build digital products: mobile apps, websites and dashboards for fintech, mobility and more. You bring the vision; we bring design and code.'

/** Pages that are live and belong in search results, in sitemap order. */
export const livePages: Record<string, PageSeo> = {
  '/': {
    title: 'Femoskeydev — Product Design & Development Studio',
    description: studioDescription,
    ...studioImage,
  },
  '/work': {
    title: 'Work: Product Design Case Studies | Femoskeydev',
    description: 'Case studies from Femoskeydev: Paymita bill payments, Liziwaride ride hailing and SaveCircle group savings, from research and UX to UI, brand and build.',
    ...studioImage,
  },
  '/work/paymita': {
    title: 'Paymita: Bill Payments App Case Study | Femoskeydev',
    description: 'How we designed Paymita: pay bills in seconds, with airtime, data, electricity, cable TV, airtime to cash and virtual dollar cards in one wallet.',
    image: '/images/social/paymita.jpg',
    imageAlt: 'Paymita on iPhone: pay your bills in seconds.',
    caseStudy: true,
  },
  '/work/liziwaride': {
    title: 'Liziwaride: Ride-Hailing App Case Study | Femoskeydev',
    description: 'How we designed Liziwaride: ride hailing, smart buses and scheduled rides in one app, with a driver app and an operations dashboard.',
    image: '/images/social/liziwaride.jpg',
    imageAlt: 'Liziwaride on iPhone: ride smarter across Africa.',
    caseStudy: true,
  },
  '/work/savecircle': {
    title: 'SaveCircle: Group Savings App Case Study | Femoskeydev',
    description: 'How we designed SaveCircle: savings circles for friends, family and colleagues. Create a circle, contribute on a schedule and track every payment together.',
    image: '/images/social/savecircle.jpg',
    imageAlt: 'SaveCircle on iPhone: save together, grow together.',
    caseStudy: true,
  },
}

/** Routes that render the Coming soon page until they launch, with the name shown on it. */
export const comingSoonPages = [
  ['services', 'Services'], ['studio', 'About'], ['contact', 'Contact'], ['academy', 'The Academy'],
  ['learning-paths/*', 'Learning paths'], ['learning-paths', 'Learning paths'], ['mentorship', 'Mentorship'],
  ['community', 'Community'], ['about', 'About'],
] as const

const comingSoonSeo = (name: string): PageSeo => ({
  title: `${name} · Coming soon | Femoskeydev`, description: `${name} is coming soon to Femoskeydev.`, ...studioImage, noindex: true,
})

const notFound: PageSeo = { title: 'Page not found | Femoskeydev', description: 'The page you are looking for could not be found.', ...studioImage, noindex: true }

export function seoFor(pathname: string): PageSeo {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (livePages[path]) return livePages[path]
  const soon = comingSoonPages.find(([route]) => route.endsWith('/*') ? path.startsWith(`/${route.slice(0, -2)}/`) : path === `/${route}`)
  return soon ? comingSoonSeo(soon[1]) : notFound
}

/** Every Coming soon route with a fixed URL, for the build to write. */
export const comingSoonPaths = comingSoonPages.filter(([route]) => !route.includes('*')).map(([route]) => `/${route}`)

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function structuredData(path: string, page: PageSeo) {
  const organization = {
    '@type': 'Organization', '@id': `${site.url}/#organization`, name: site.name, url: site.url, logo: `${site.url}${site.logo}`,
    description: studioDescription, sameAs: site.sameAs,
    founder: { '@type': 'Person', name: site.founder.name, jobTitle: site.founder.jobTitle, sameAs: [site.founder.linkedin] },
  }
  const graph: object[] = [organization, { '@type': 'WebSite', '@id': `${site.url}/#website`, name: site.name, url: site.url, publisher: { '@id': `${site.url}/#organization` } }]
  if (page.caseStudy) graph.push({
    '@type': 'CreativeWork', name: page.title.split(' | ')[0], description: page.description, url: `${site.url}${path}`,
    image: `${site.url}${page.image}`, creator: { '@id': `${site.url}/#organization` },
  })
  // Escape "<" so the JSON can't close the script element.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')
}

/** The head tags for a page, as HTML, between markers the build can find again. */
export function headTags(path: string) {
  const page = seoFor(path)
  const url = `${site.url}${path === '/' ? '/' : path}`
  const image = `${site.url}${page.image}`
  return [
    '<!--seo:start-->',
    `<title>${escape(page.title)}</title>`,
    `<meta name="description" content="${escape(page.description)}" />`,
    `<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${page.caseStudy ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${site.name}" />`,
    `<meta property="og:title" content="${escape(page.title)}" />`,
    `<meta property="og:description" content="${escape(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${escape(page.imageAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:site" content="${site.x}" />`,
    `<meta name="twitter:title" content="${escape(page.title)}" />`,
    `<meta name="twitter:description" content="${escape(page.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json">${structuredData(path, page)}</script>`,
    '<!--seo:end-->',
  ].join('\n    ')
}

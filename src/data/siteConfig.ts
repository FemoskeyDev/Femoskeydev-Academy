export const siteConfig = {
  name: 'Femoskeydev',
  url: 'https://femoskeydev.com',
  // Copy for the Academy homepage, which isn't live yet. Page titles and descriptions live in src/data/seo.ts.
  home: {
    eyebrow: 'FEMOSKEYDEV ACADEMY',
    headline: { before: 'The Pathway to Becoming an', emphasis: 'Awesome Creative.' },
    support: 'Learn practical creative skills, build real projects, and grow with mentorship and a community that helps you move forward.',
    primaryAction: 'Explore Learning Paths',
    secondaryAction: 'Join the Community',
  },
  /** Where every Contact link goes: the studio's Cal.com booking page. */
  bookingUrl: 'https://cal.com/femoskeydev',
  studioContactUrl: '',
  contactUrl: '',
  communityUrl: '',
  logo: '/logo.svg',
  portrait: '/images/femoskeydev-portrait-hero.png',
} as const

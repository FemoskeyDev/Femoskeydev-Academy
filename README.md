# Femoskeydev

The website for a founder-led digital design and development studio. It showcases in-house work and hosts Femoskeydev Academy, with learning pathways, mentorship, and community pages.

## Stack and local development

- Vite, React 19, strict TypeScript
- React Router for page routes and browser history
- GSAP and ScrollTrigger for scroll-driven section transitions
- CSS Modules for focused feature/page styles; shared tokens and layout styles are plain CSS
- Radix Icons
- Vitest, React Testing Library, and jsdom

Install dependencies and start the local server:

```sh
npm install
npm run dev
```

Useful checks:

```sh
npm run typecheck
npm run lint
npm run test
npm run build
```

The original brief requested pnpm, but pnpm was not installed in the supplied environment. `package-lock.json` is therefore the checked in lockfile.

## Architecture

- `src/app` defines the shared router and application entry point.
- `src/components/layout` contains the shared site shell, header, responsive navigation, footer, skip link, container, section, and breadcrumbs.
- `src/components/ui` contains reusable controls, headings, accordion, scroll reveal, logo, and loader.
- `src/components/sections` contains reusable page intro, FAQ, and final CTA sections.
- `src/features` contains reusable learning path cards and the immersive mentorship hero.
- `src/pages` contains each route and its page-specific sections.
- `src/data` is the source of site configuration, navigation, pathways, programme formats, FAQs, and social links.
- `src/hooks` and `src/lib` contain cross-page behaviours and utilities.
- `src/styles` holds local font registration, shared tokens, resets, brand styles, and utilities.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Studio homepage and selected work |
| `/work` | Project showcase |
| `/work/:slug` | Project details |
| `/studio` | Team and services |
| `/academy` | Academy homepage |
| `/learning-paths` | Overview of all four pathways |
| `/learning-paths/interfaces` | FDA Interfaces detail |
| `/learning-paths/pixels` | FDA Pixels detail |
| `/learning-paths/codes` | FDA Codes detail |
| `/learning-paths/no-code` | No-code design detail |
| `/mentorship` | Mentorship approach and enquiry guidance |
| `/community` | Community introduction |
| `/about` | Academy mission and founder |
| `/contact` | Contact and programme enquiry options |
| `*` | Accessible not-found page |

### Extending the site

Add a pathway to `src/data/learningPaths.ts`; the overview cards and reusable detail route update from that data. Add page routes in `src/app/routeConfig.tsx`, create a route-specific page under `src/pages`, and compose it from its own `sections` folder plus shared components. Reusable visual components belong in `src/components` or `src/features` when they have feature-specific behaviour.

Update `src/data/siteConfig.ts` with the verified studio enquiry URL and Academy contact and community destinations. Empty contact and community URLs intentionally render no external join/contact link. Programme formats can be edited in `src/data/programmes.ts`; current dates, pricing, and availability should only be added when confirmed. FAQs live in `src/data/faqs.ts` and primary navigation in `src/data/navigation.ts`.

## Assets and typography

- `public/logo.svg` is the supplied Academy logo and is used in the header, footer, preloader, and favicon.
- The site uses aligned, 2048 px transparent PNG derivatives in `public/images/` to reduce transfer size. Full source portraits and unused local artwork are kept outside the public repository.
- `public/fonts` contains the supplied Tomato Grotesk static OTF family. Regular, Medium, SemiBold, and Bold are registered as weights 400, 500, 600, and 700 in `src/styles/fonts.css`. The source files should be redistributed only under the applicable font licence.

## Configuration notes

`siteConfig.ts` holds the domain, default metadata, and asset paths. `usePageMeta` updates each route's title, description, Open Graph title/description, and canonical URL. Contact uses a configured destination. Until a studio enquiry URL is provided, visitors can draft and copy a brief locally. The site has no submission backend.

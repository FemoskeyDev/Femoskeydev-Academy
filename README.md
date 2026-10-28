# Femoskeydev Academy

A responsive learning platform for aspiring and developing creatives. The site presents the Academy's learning pathways, mentorship approach, community, and founder. It is a frontend only; programme availability, contact, and community destinations are configurable and are not fabricated.

## Stack and local development

- Vite, React 19, strict TypeScript
- React Router for page routes and browser history
- Three.js and React Three Fiber for the isolated hero WebGL scene
- CSS Modules for focused feature/page styles; shared tokens and layout styles are plain CSS
- Lucide React icons
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
- `src/features` contains reusable learning path cards and the interactive portrait feature.
- `src/pages` contains each route and its page-specific sections.
- `src/data` is the source of site configuration, navigation, pathways, programme formats, FAQs, and social links.
- `src/hooks` and `src/lib` contain cross-page behaviours and utilities.
- `src/styles` holds local font registration, shared tokens, resets, brand styles, and utilities.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Academy homepage |
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

Add a pathway to `src/data/learningPaths.ts`; the overview cards and reusable detail route update from that data. Add page routes in `src/app/AppRouter.tsx`, create a route-specific page under `src/pages`, and compose it from its own `sections` folder plus shared components. Reusable visual components belong in `src/components` or `src/features` when they have feature-specific behaviour.

Update `src/data/siteConfig.ts` with verified Academy destinations. Empty contact and community URLs intentionally render no external join/contact link. Programme formats can be edited in `src/data/programmes.ts`; current dates, pricing, and availability should only be added when confirmed. FAQs live in `src/data/faqs.ts` and primary navigation in `src/data/navigation.ts`.

## Assets and typography

- `public/logo.svg` is the supplied Academy logo and is used in the header, footer, preloader, and favicon.
- The site uses aligned, 2048 px transparent PNG derivatives in `public/images/` to reduce transfer size and fit the WebGL 2 minimum texture size. Full source portraits and unused local artwork are kept outside the public repository.
- The portrait experience lives in `src/features/interactive-portrait`. Three.js and React Three Fiber use a custom GLSL compositor to blend the human and cybernetic images with an organic pointer-centred reveal. `WireframeTreatment.tsx` draws a separate, original SVG head scan aligned to the supplied images. The two square images share a transparent background and closely match in crop and facial landmarks; a small configured cybernetic image offset refines the eye-line alignment. Two local GLB assets were inspected; both contain position-only geometry without normals, UVs, materials, or textures. They are excluded from the public deployment and repository, so the hero uses image compositing and SVG linework rather than presenting either as a finished cybernetic helmet model.
- The existing loader waits for the Tomato Grotesk font and both hero images to decode. The experience uses a CSS image reveal if WebGL is unavailable. Visual parameters, image crop, reveal scale, noise, transition duration, and registration offset are in `portraitConfig.ts`.
- `public/fonts` contains the supplied Tomato Grotesk static OTF family. Regular, Medium, SemiBold, and Bold are registered as weights 400, 500, 600, and 700 in `src/styles/fonts.css`. The source files should be redistributed only under the applicable font licence.

### Interactive hero dependency audit

| Category | Dependencies | Decision |
| --- | --- | --- |
| Already installed and suitable | React 19, Vite, TypeScript, Three.js 0.186, React Three Fiber 9 | Reused; Fiber 9 is compatible with React 19. |
| Recommended for the initial interactive hero | Custom GLSL using Three.js and React Three Fiber | Already covered by the installed stack. `@react-three/drei` was not added because this image compositor needs no model, environment, or control helpers. |
| Deferred until the scroll phase | GSAP/ScrollTrigger, Lenis, post-processing packages | Not added; scroll animation is out of scope. |

## Configuration notes

`siteConfig.ts` holds the domain, default metadata, and asset paths. `usePageMeta` updates each route's title, description, Open Graph title/description, and canonical URL. No backend, form submission, analytics, external community destination, or social account has been configured.

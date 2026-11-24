# Femoskeydev

Studio portfolio and Femoskeydev Academy site. Vite + React 19 + strict TS, CSS Modules, React Router 7, GSAP.
Founder-led studio; the owner reviews everything visually. Keep changes small and match the surrounding code.

## Project map

- `src/pages/StudioPages/` The live portfolio: homepage sections, case studies, team, How we work float
- `src/components/layout/` Header, footer, shell. `src/components/ui/` loader, animated logo, buttons
- `src/app/routeConfig.tsx` Routes; the `comingSoon` list hides unfinished pages
- `src/data/` Site config (`siteConfig.bookingUrl` is Cal.com, the only contact link), SEO, projects, socials
- `public/images/portfolio/` Site images (WebP with `-1x.webp` half-size copies, see `src/lib/images.ts`) and videos
- `showreel/` Remotion 4 project: the reel, How we work film (16:9 and 9:16), social covers
- `illustrations/` Blender 3D illustration pipeline; read its `README.md` and `DIRECTION.md` before touching it
- Figma: file `mS66rooODtiHTFFb52XO4B` holds case studies, social, Academy brand and flyer pages

## Conventions

- Colours, type and spacing come from `src/styles/tokens.css`; fonts are Tomato Grotesk.
- Every animation has a `prefers-reduced-motion` fallback.
- Motion should feel Apple-like: crisp, smooth, simple. Brand green highlight is `#B8F7C4`; ink is `#151515`.
- Never invent links. LinkedIn and other URLs come from the owner; no placeholders.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Deploys (IMPORTANT)

1. Work on `staging` and push it: preview at staging.femoskeydev.com (behind the owner's Vercel login, so only
   they can check it).
2. Merge into `main` (production, femoskeydev.com) **only when the owner says "Go live"**. Use a worktree off
   `main`, merge `origin/staging`, confirm `git diff origin/staging HEAD` is empty, push.
3. Confirm production by checking femoskeydev.com serves the new `assets/index-*.js` bundle (1–2 minutes).
4. Vercel, DNS (Truehost) and Search Console changes are the owner's to make.

## Checks

- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` before pushing site changes.
- Then look at it in the browser at localhost:5173 (`.claude/launch.json` → `dev`), desktop and mobile widths.
  Tests can't judge feel; a visual check is required.

## Gotchas

- The browser pane's tab may run in the background, where scrolling and real hover don't happen. Test in a
  fixed-size iframe injected into the dev page, and fire `pointerover`/`pointermove` (React ignores
  synthetic `pointerenter`).
- Remotion renders from Claude's sandbox need `--browser-executable` pointing at a chrome-headless-shell outside
  `~/Documents`. Its bundled ffmpeg is minimal; move the moov atom with `swift showreel/scripts/faststart.swift`.
- Blender renders take ~2GB each and must run one at a time (`illustrations/render.sh` does this).
- SVG filters scale with transforms: put the `filter` outside any `scale()` group.

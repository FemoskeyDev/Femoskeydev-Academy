# Showreel

The homepage hero film, made in [Remotion](https://www.remotion.dev) (free for companies of up to 3 people).
The edit lives in `src/Reel.tsx`: the `shots` list at the bottom sets the order and length of each shot (30 fps).

```bash
npm install
npm run studio    # preview and scrub in the browser
npm run publish   # render, then write ../public/images/portfolio/showreel.mp4
```

`npm run poster` writes `out/poster.png`; convert it to `../public/images/portfolio/showreel-poster.webp` (and a 960px `-1x` copy).

App screens are in `public/s` (exported from Figma). Fonts, logos and the case-study films are copied from the site's `public` folder,
and the people shots are downloaded from Pexels (IDs in `scripts/assets.mjs`), each time you run `npm run assets`.

If a render stops with "Target closed", Remotion's Chrome couldn't read its own files (macOS can block that inside Documents).
Point it at another copy with `--browser-executable=/path/to/chrome-headless-shell`.

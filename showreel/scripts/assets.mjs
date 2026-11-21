// Gathers what the reel needs but doesn't keep in git: fonts, logos and films from the site's public folder,
// and the Pexels people clips (free to use under the Pexels licence, no credit required).
import { copyFile, mkdir, access, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const site = resolve(root, '../public')
const out = resolve(root, 'public')

const fromSite = {
  'f/TomatoGrotesk-Regular.otf': 'fonts/TomatoGrotesk-Regular.otf',
  'f/TomatoGrotesk-Medium.otf': 'fonts/TomatoGrotesk-Medium.otf',
  'f/TomatoGrotesk-SemiBold.otf': 'fonts/TomatoGrotesk-SemiBold.otf',
  'b/logo-white.svg': 'images/portfolio/logo-white.svg',
  'b/pm-logo.webp': 'images/work/paymita/brand-logo.webp',
  'b/lz-hero.webp': 'images/work/liziwaride/hero.webp',
  'b/lz-logo.svg': 'images/work/liziwaride/logo.svg',
  'b/sc-logo.webp': 'images/work/savecircle/brand-logo.webp',
  'v/pm-walk.mp4': 'images/work/paymita/walkthrough.mp4',
  'v/lz-film.mp4': 'images/work/liziwaride/admin-film.mp4',
  'v/sc-film.mp4': 'images/work/savecircle/admin-film.mp4',
}
const pexels = ['7326361', '7884810', '6612142', '7450036', '8496455', '7230113']

const exists = path => access(path).then(() => true, () => false)

for (const [to, from] of Object.entries(fromSite)) {
  await mkdir(dirname(resolve(out, to)), { recursive: true })
  await copyFile(resolve(site, from), resolve(out, to))
}
for (const id of pexels) {
  const file = resolve(out, `v/pexels-${id}.mp4`)
  if (await exists(file)) continue
  const response = await fetch(`https://www.pexels.com/download/video/${id}/?h=1080&w=1920`)
  if (!response.ok) throw new Error(`Pexels ${id}: ${response.status}`)
  await writeFile(file, Buffer.from(await response.arrayBuffer()))
  console.log(`downloaded pexels ${id}`)
}
console.log('assets ready')

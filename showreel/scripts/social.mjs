// Renders the link-preview images for src/data/seo.ts into ../public/images/social, plus the PNG icons.
import { execFileSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, '../public/images/social')
const browser = process.argv.find(arg => arg.startsWith('--browser-executable='))
await mkdir(resolve(root, 'out'), { recursive: true })
await mkdir(out, { recursive: true })

for (const variant of ['studio', 'paymita', 'liziwaride', 'savecircle']) {
  const still = resolve(root, `out/social-${variant}.png`)
  execFileSync(resolve(root, 'node_modules/.bin/remotion'), ['still', 'src/index.tsx', 'Social', still, '--frame=150', `--props=${JSON.stringify({ variant })}`, ...(browser ? [browser] : [])], { cwd: root, stdio: 'inherit' })
  await sharp(still).resize(1200, 630).jpeg({ quality: 86, mozjpeg: true }).toFile(resolve(out, variant === 'studio' ? 'femoskeydev.jpg' : `${variant}.jpg`))
}
const logo = resolve(root, '../public/logo.svg')
for (const [name, size] of [['favicon-48', 48], ['apple-touch-icon', 180], ['icon-192', 192], ['icon-512', 512]]) {
  await sharp(logo, { density: 400 }).resize(size, size).png().toFile(resolve(out, `${name}.png`))
}
console.log('social images ready')

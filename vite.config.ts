import { defineConfig } from 'vitest/config'
import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { comingSoonPaths, headTags, livePages, site } from './src/data/seo'

const execFileAsync = promisify(execFile)

function localVersionHistoryPlugin(): Plugin {
  return {
    name: 'local-version-history',
    apply: 'serve' as const,
    configureServer(server) {
      server.middlewares.use('/__femoskey-version-control/history', async (request, response, next) => {
        if (request.method !== 'GET') return next()

        try {
          const { stdout } = await execFileAsync('git', [
            'log',
            '--date=iso-strict',
            '--format=commit%x1f%H%x1f%s%x1f%an%x1f%ad',
            '--name-status',
            '--no-renames',
          ], { cwd: server.config.root, maxBuffer: 8 * 1024 * 1024 })

          const commits: { hash: string; subject: string; author: string; date: string; files: { status: string; path: string }[] }[] = []
          let current: (typeof commits)[number] | undefined

          for (const line of stdout.split(/\r?\n/)) {
            if (line.startsWith('commit\u001f')) {
              if (current) commits.push(current)
              const [, hash, subject, author, date] = line.split('\u001f')
              current = { hash, subject, author, date, files: [] }
            } else if (current && line.trim()) {
              const [status, ...pathParts] = line.split('\t')
              if (status && pathParts.length) current.files.push({ status, path: pathParts.join('\t') })
            }
          }
          if (current) commits.push(current)

          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.setHeader('Cache-Control', 'no-store')
          response.end(JSON.stringify({ commits }))
        } catch {
          response.statusCode = 503
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ error: 'Git history is unavailable in this workspace.' }))
        }
      })
    },
  }
}

/** Puts each page's title, description and share tags into its own HTML file (dist/work/paymita/index.html, …) so
 *  search engines and link previews see them without running JavaScript, and writes the sitemap of live pages.
 *  Vercel serves these files before falling back to the SPA rewrite. */
function seoPages(): Plugin {
  let outDir = 'dist'
  return {
    name: 'seo-pages',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir) },
    transformIndexHtml(html) { return html.replace('<!--seo-->', headTags('/')) },
    async writeBundle() {
      const html = await readFile(join(outDir, 'index.html'), 'utf8')
      for (const path of [...Object.keys(livePages), ...comingSoonPaths].filter(path => path !== '/')) {
        await mkdir(join(outDir, path), { recursive: true })
        await writeFile(join(outDir, path, 'index.html'), html.replace(/<!--seo:start-->[\s\S]*<!--seo:end-->/, headTags(path)))
      }
      const today = new Date().toISOString().slice(0, 10)
      const urls = Object.keys(livePages).map(path => `  <url><loc>${site.url}${path}</loc><lastmod>${today}</lastmod></url>`)
      await writeFile(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)
    },
  }
}

export default defineConfig({
  plugins: [react(), localVersionHistoryPlugin(), seoPages()],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], css: true },
  build: { rollupOptions: { output: { manualChunks(id) {
    if (id.includes('/node_modules/three/')) return 'three-core'
    if (id.includes('/node_modules/@react-three/fiber/')) return 'react-three-fiber'
  } } } },
})

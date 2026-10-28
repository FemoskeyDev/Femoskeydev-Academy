import { defineConfig } from 'vitest/config'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

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

export default defineConfig({
  plugins: [react(), localVersionHistoryPlugin()],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], css: true },
  build: { rollupOptions: { output: { manualChunks(id) {
    if (id.includes('/node_modules/three/')) return 'three-core'
    if (id.includes('/node_modules/@react-three/fiber/')) return 'react-three-fiber'
  } } } },
})

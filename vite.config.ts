import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Connect } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const deepLinkFallback = path.join(__dirname, 'public', 'deep_link_fallback.html')
const appUniversalLink = path.join(__dirname, 'public', 'app_universal_link.html')

/** Match Vercel: /app and /article/* serve static universal-link fallbacks. */
function universalLinkDevPlugin() {
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const pathname = req.url?.split('?')[0] ?? ''

    if (pathname === '/app' || pathname === '/app/') {
      try {
        const html = fs.readFileSync(appUniversalLink, 'utf-8')
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.statusCode = 200
        res.end(html)
      } catch {
        next()
      }
      return
    }

    if (!/^\/article\//.test(pathname)) {
      next()
      return
    }

    try {
      const html = fs.readFileSync(deepLinkFallback, 'utf-8')
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.statusCode = 200
      res.end(html)
    } catch {
      next()
    }
  }

  return {
    name: 'universal-link-fallback-dev',
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig({
  plugins: [universalLinkDevPlugin(), react()],
})

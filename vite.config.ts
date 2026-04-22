import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Connect } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const deepLinkFallback = path.join(__dirname, 'public', 'deep_link_fallback.html')

/** Match Vercel: /article/* → static deep link HTML; /app → /article/download */
function deepLinkDevPlugin() {
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const pathname = req.url?.split('?')[0] ?? ''

    if (pathname === '/app' || pathname === '/app/') {
      res.statusCode = 307
      res.setHeader('Location', '/article/download')
      res.end()
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
    name: 'deep-link-fallback-dev',
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig({
  plugins: [deepLinkDevPlugin(), react()],
})

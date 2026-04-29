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

    if (pathname === '/api/health') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.statusCode = 200
      res.end(JSON.stringify({ ok: true, service: 'vedlik-showcase-api', dev: true }))
      return
    }

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

const WEB_API_UPSTREAM =
  process.env.VITE_WEB_API_UPSTREAM ??
  'https://us-central1-gen-lang-client-0290483815.cloudfunctions.net'

export default defineConfig({
  plugins: [universalLinkDevPlugin(), react()],
  server: {
    proxy: {
      '/api': {
        target: WEB_API_UPSTREAM,
        changeOrigin: true,
        rewrite: (path) => {
          const qi = path.indexOf('?')
          const pathname = qi >= 0 ? path.slice(0, qi) : path
          const search = qi >= 0 ? path.slice(qi) : ''
          const p =
            pathname.length > 1 && pathname.endsWith('/')
              ? pathname.slice(0, -1)
              : pathname
          if (p === '/api/categories') return `/webApi/v1/web/categories${search}`
          if (p === '/api/articles-list') return `/webApi/v1/web/articles${search}`
          if (p === '/api/article-detail') {
            const u = new URL(path, 'http://localhost')
            const slug = u.searchParams.get('slug')
            if (slug) return `/webApi/v1/web/articles/${encodeURIComponent(slug)}`
          }
          const m = p.match(/^\/api\/article-detail\/(.+)$/)
          if (m) {
            const slug = encodeURIComponent(decodeURIComponent(m[1]))
            return `/webApi/v1/web/articles/${slug}${search}`
          }
          if (path.startsWith('/api/v1')) {
            return path.replace(/^\/api\/v1/, '/webApi/v1/web')
          }
          return path
        },
      },
    },
  },
})

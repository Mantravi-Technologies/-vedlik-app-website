import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Connect } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appDownloadFallback = path.join(__dirname, 'public', 'app_download_fallback.html')

function serveAppDownloadHtml(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const pathname = req.url?.split('?')[0] ?? ''
    if (pathname !== '/app' && pathname !== '/app/') {
      next()
      return
    }
    try {
      const html = fs.readFileSync(appDownloadFallback, 'utf-8')
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.statusCode = 200
      res.end(html)
    } catch {
      next()
    }
  }
}

/** Match production (Vercel): /app is static HTML so Universal / App Links work. */
function appDownloadPlugin() {
  return {
    name: 'serve-app-download-fallback',
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(serveAppDownloadHtml())
    },
    configurePreviewServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(serveAppDownloadHtml())
    },
  }
}

export default defineConfig({
  plugins: [appDownloadPlugin(), react()],
})

/**
 * GET /api/health — confirms Vercel picked up the `api/` directory (returns JSON, not SPA HTML).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse): void {
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'private, no-store')

  const body: Record<string, unknown> = { ok: true, service: 'vedlik-showcase-api' }
  if (process.env.VERCEL === '1') {
    body.deploy = {
      env: process.env.VERCEL_ENV ?? null,
      url: process.env.VERCEL_URL ?? null,
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      gitCommitRef: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      repoSlug: process.env.VERCEL_GIT_REPO_SLUG ?? null,
      repoProvider: process.env.VERCEL_GIT_PROVIDER ?? null,
    }
  }

  res.status(200).json(body)
}

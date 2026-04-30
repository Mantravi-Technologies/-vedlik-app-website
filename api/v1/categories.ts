/**
 * Served at **`/api/v1/categories`** (no rewrite).
 * Thin re-export — Vite + older Vercel builds were not resolving rewritten `/api/categories`.
 */
export { default } from '../categories'

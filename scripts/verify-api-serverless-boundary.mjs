#!/usr/bin/env node
/**
 * Vercel emits one JS entry per api/*.ts route; sibling project imports often do not exist at
 * `/var/task/...`, causing ERR_MODULE_NOT_FOUND in production ESM runtime.
 *
 * Allowed under api/*.ts imports: `@vercel/node` only (+ Node built-ins). No `./_proxy`, `../server`, `./handlers`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const apiRoot = path.join(__dirname, '..', 'api')

const DISALLOW = [/from\s+['"][^'"]*_proxy/i, /from\s+['"][^'"]*server\/webApi/i, /from\s+['"][^'"]*\/handlers\/|from\s+['"][./]*handlers\b/i]

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, acc)
    else if (ent.name.endsWith('.ts')) acc.push(p)
  }
  return acc
}

let bad = []
for (const file of walk(apiRoot)) {
  const txt = fs.readFileSync(file, 'utf8')
  for (const rx of DISALLOW) {
    if (rx.test(txt)) {
      bad.push({ file: path.relative(path.join(__dirname, '..'), file), pattern: rx.toString() })
      break
    }
  }
}

if (bad.length) {
  console.error('verify-api-serverless-boundary failed — forbidden sibling imports:\n')
  for (const b of bad) console.error(`  ${b.file}`)
  console.error('\nRoutes under api/ must be self-contained (no _proxy/handlers/server imports).')
  process.exit(1)
}

console.log('api/ boundary OK (no forbidden relative imports)')
process.exit(0)

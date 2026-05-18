// After `vite build` writes the SPA into dist/meals/, copy the static
// landing page over dist/ so Firebase Hosting serves / from landing
// and /meals/** from the SPA build.
import { cpSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const landingDir = join(root, 'landing')
const distDir = join(root, 'dist')

if (!existsSync(landingDir)) {
  console.error('post-build: landing/ directory not found at', landingDir)
  process.exit(1)
}

mkdirSync(distDir, { recursive: true })
cpSync(landingDir, distDir, { recursive: true })
console.log('post-build: copied landing/ → dist/')

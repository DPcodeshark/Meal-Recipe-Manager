// Renders favicon.svg / icon-maskable.svg into the PNG sizes the PWA manifest
// and iOS apple-touch-icon expect. Run once after editing either SVG.
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const publicDir = join(root, 'public')

const mainSvg = readFileSync(join(publicDir, 'favicon.svg'))
const maskableSvg = readFileSync(join(publicDir, 'icon-maskable.svg'))

async function renderPng(svg, size, outName) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, outName))
  console.log(`  ✓ ${outName.padEnd(28)} ${size}×${size}`)
}

const tasks = [
  [mainSvg,      192, 'icon-192.png'],
  [mainSvg,      512, 'icon-512.png'],
  [mainSvg,      180, 'apple-touch-icon.png'],
  [maskableSvg,  512, 'icon-maskable-512.png'],
]

console.log('Generating PWA icons:')
for (const [svg, size, name] of tasks) await renderPng(svg, size, name)
console.log('Done.')

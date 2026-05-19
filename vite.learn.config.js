import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Separate build for the /learn site. Lives at zavods.com/learn,
// shares package.json + node_modules with the Dinner App but is a
// completely independent React entry/bundle.
export default defineConfig({
  root: 'learn',
  base: '/learn/',
  build: {
    outDir: '../dist/learn',
    emptyOutDir: true,
  },
  plugins: [react()],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/meals/',
  build: {
    outDir: 'dist/meals',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        navigateFallback: '/meals/index.html',
        navigateFallbackAllowlist: [/^\/meals\//],
      },
      manifest: {
        name: 'Dinner App — Family Meal Planner',
        short_name: 'Dinner App',
        description: 'Plan family meals, vote on suggestions, and manage grocery lists together.',
        theme_color: '#fdf8f1',
        background_color: '#fdf8f1',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/meals/',
        scope: '/meals/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
})

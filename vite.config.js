import { defineConfig } from 'vite'
import react           from '@vitejs/plugin-react'
import { VitePWA }     from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType:  'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],

      manifest: {
        name:             'Brew POS',
        short_name:       'Brew POS',
        description:      'Coffee Shop Point of Sale — Summer Edition',
        theme_color:      '#FF8C42',
        background_color: '#FFEED4',
        display:          'standalone',
        orientation:      'landscape',
        scope:            '/',
        start_url:        '/',
        icons: [
          {
            src:     '/icons/icon-192.png',
            sizes:   '192x192',
            type:    'image/png',
          },
          {
            src:     '/icons/icon-512.png',
            sizes:   '512x512',
            type:    'image/png',
          },
          {
            src:     '/icons/icon-512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        // Cache all app shell assets
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Cache Google Fonts so the app works fully offline
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler:    'CacheFirst',
            options: {
              cacheName:          'google-fonts-cache',
              expiration:         { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse:  { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler:    'CacheFirst',
            options: {
              cacheName:          'gstatic-fonts-cache',
              expiration:         { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse:  { statuses: [0, 200] },
            },
          },
        ],
      },

      devOptions: {
        enabled: false, // keep dev fast; SW only active on `npm run preview`
      },
    }),
  ],
  server: { port: 3000 },
})

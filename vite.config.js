import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'InvenSys - Sistem Inventori',
        short_name: 'InvenSys',
        description: 'Aplikasi manajemen inventori dan pembelian barang',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Cache API calls ke backend Flask supaya bisa dipakai basic offline
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/gudang') ||
                                     url.pathname.startsWith('/barang') ||
                                     url.pathname.startsWith('/supplier') ||
                                     url.pathname.startsWith('/pembelian') ||
                                     url.pathname.startsWith('/mutasi') ||
                                     url.pathname.startsWith('/stokgudang'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
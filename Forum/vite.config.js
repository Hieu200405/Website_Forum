import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { VitePWA } from 'vite-plugin-pwa'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'ForumHub',
        short_name: 'ForumHub',
        description: 'Diễn đàn cộng đồng hiện đại — chia sẻ, thảo luận và kết nối',
        theme_color: '#6366f1',
        background_color: '#0d0d1a',
        display: 'standalone',
        start_url: '/user',
        scope: '/',
        lang: 'vi',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
        ],
        shortcuts: [
          { name: 'Trang chủ', url: '/user', icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] },
          { name: 'Đăng bài',  url: '/user/create-post', icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] },
          { name: 'Xếp hạng', url: '/user/leaderboard', icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] },
        ],
      },
      workbox: {
        // Cache strategies
        runtimeCaching: [
          {
            // Cache API responses for 10 minutes
            urlPattern: /^https?:\/\/.*\/api\/(posts|categories|users\/leaderboard)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 600 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Cache avatar images (Cloudinary, ui-avatars)
            urlPattern: /^https:\/\/(res\.cloudinary\.com|ui-avatars\.com)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: false, // disable in dev to avoid HMR conflicts
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Manual code splitting chunks
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-query':    ['@tanstack/react-query'],
          'vendor-charts':   ['recharts', 'react-is'],
          'vendor-ui':       ['lucide-react', 'react-hot-toast'],
          'vendor-date':     ['date-fns'],
          'vendor-misc':     ['axios', 'zustand', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

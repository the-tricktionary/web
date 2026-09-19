import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unfonts from 'unplugin-fonts/vite'
import { VitePWA } from 'vite-plugin-pwa'
import Unocss from 'unocss/vite'
import Icons from 'unplugin-icons/vite'

// the admin reads the English keys and strings from https://the-tricktionary.com/locales/en.json
const englishMessages = {
  name: 'english-messages',
  generateBundle () {
    this.emitFile({
      type: 'asset',
      fileName: 'locales/en.json',
      source: readFileSync(fileURLToPath(new URL('./src/locales/en.json', import.meta.url)))
    })
  }
} satisfies Plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    englishMessages,
    vue({
      template: {
        compilerOptions: {
          // <mux-player> is a web component
          isCustomElement: tag => tag.startsWith('mux-')
        }
      }
    }),
    Icons({
      compiler: 'vue3'
    }),
    Unocss(),
    Unfonts({
      google: {
        preconnect: true,
        display: 'swap',
        families: ['PT Sans']
      },
    }),
    VitePWA({
      workbox: {
        navigateFallbackDenylist: [
          /^\/__\//,
          /^\/sitemap\.xml/
        ],
        offlineGoogleAnalytics: true
      },
      manifest: {
        name: 'the Tricktionary',
        short_name: 'Tricktionary',
        description: 'A dictionary of jumprope tricks categorised after difficulty and completed with prerequisites and videos.',
        lang: 'en',
        orientation: 'any',
        background_color: '#fe3500',
        theme_color: '#fe3500',
        prefer_related_applications: true,
        categories: ['fitness', 'sports', 'education'],
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        // screenshots: [],
        related_applications: [
          {
            platform: 'play',
            url: 'https://play.google.com/store/apps/details?id=com.the_tricktionary.app',
            id: 'com.the_tricktionary.app'
          },
          {
            platform: 'webapp',
            url: 'https://the-tricktionary.com'
          }
        ]
      }
    })
  ],
  server: {
    port: 3002
  },
  build: {
    sourcemap: true
  }
})

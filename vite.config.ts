import { defineConfig } from 'vite'
import windiCSS from 'vite-plugin-windicss'
import vue from '@vitejs/plugin-vue'
import Unfonts from 'unplugin-fonts/vite'
import { VitePWA } from 'vite-plugin-pwa'
import Icons from 'unplugin-icons/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    basicSsl(),
    vue(),
    Icons({
      compiler: 'vue3'
    }),
    windiCSS(),
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
            'src': '/android-chrome-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': '/android-chrome-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          }
        ],
        // screenshots: [],
        related_applications: [
          {
            platform: 'play',
            url: 'https://play.google.com/store/apps/details?id=trictionary.jumproper.com.jumpropetrictionary',
            id: 'trictionary.jumproper.com.jumpropetrictionary'
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

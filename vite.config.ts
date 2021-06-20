import { defineConfig } from 'vite'
import windiCSS from 'vite-plugin-windicss'
import vue from '@vitejs/plugin-vue'
import viteFonts from 'vite-plugin-fonts'
import { VitePWA } from 'vite-plugin-pwa'
import icons from 'vite-plugin-icons'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    windiCSS(),
    viteFonts({
      google: {
        preconnect: true,
        display: 'swap',
        families: ['PT Sans']
      },
    }),
    vue(),
    icons(),
    VitePWA({
      manifest: {
        name: 'the Tricktionary',
        short_name: 'Tricktionary',
        description: 'A dictionary of jumprope tricks categorised after difficulty and completed with prerequisites and videos.',
        lang: 'en',
        background_color: '#fe3500',
        theme_color: '#fe3500',
        prefer_related_applications: true,
        icons: [],
        related_applications: [
          {
            platform: 'play',
            url: 'https://play.google.com/store/apps/details?id=trictionary.jumproper.com.jumpropetrictionary',
            id: 'trictionary.jumproper.com.jumpropetrictionary'
          },
          {
            platform: 'web',
            url: 'https://the-tricktionary.com'
          }
        ]
      }
    })
  ],
  server: {
    port: 3001
  }
})

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
    VitePWA()
  ],
  server: {
    port: 3001
  }
})

import { defineConfig } from 'vite-plugin-windicss'

export default defineConfig({
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        ttred: {
          '500': '#fe3500',
          '900': '#da1100'
        },
        ttyellow: {
          '300': '#feedb2',
          '500': '#fec500'
        }
      },
    },
    fontFamily: {
      sans: ['"PT Sans"', 'sans-serif']
    }
  },
  plugins: [
    require('windicss/plugin/forms')
  ]
})

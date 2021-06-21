import { defineConfig } from 'vite-plugin-windicss'
import plugin from 'windicss/plugin'

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
    require('windicss/plugin/forms'),
    require('windicss/plugin/aspect-ratio'),
    plugin(({ addBase, theme }) => {
      addBase({
        p: {
          marginBottom: '0.5rem'
        },
        'p a': {
          color: theme('colors.blue.500') as string,
          textDecorationLine: 'underline',
          textUnderlineOffset: '1px',
          '&:hover': {
            color: theme('colors.blue.800') as string,
            textUnderlineOffset: '3px',
          }
        },
        h1: {
          fontSize: '2.25rem',
          lineHeight: '2.5rem',
          fontWeight: '600'
        },
        h2: {
          fontSize: '1.125rem',
          lineHeight: '1.75rem',
          fontWeight: '600'
        }
      })
    }),
    plugin(({ addComponents, theme }) => {
      addComponents({
        '.btn': {
          padding: '.5rem',
          borderRadius: '.25rem',
          display: 'block',
          width: '100%',
          backgroundColor: theme('colors.white') as string,
          borderColor: theme('colors.gray.300') as string,
          borderWidth: '1px',
          borderStyle: 'solid',
          cursor: 'pointer',
          textAlign: 'center',
          '&:hover': {
            backgroundColor: theme('colors.gray.200') as string
          },
          '&:disabled': {
            cursor: 'default',
            backgroundColor: theme('colors.gray.200')as string,
            color: theme('colors.gray.500') as string
          }
        },
        'form:invalid .btn': {
          cursor: 'default',
          backgroundColor: theme('colors.gray.200') as string,
          color: theme('colors.gray.500') as string
        },

        '.trick-level': {
          '&:before': {
            right: '100%'
          },
          '&:after': {
            left: '100%'
          },
          '&:before, &:after': {
            content: '" "',
            borderBottomWidth: '2px',
            borderColor: theme('colors.gray.300') as string,
            position: 'absolute',
            width: '100%',
            maxWidth: '20vw',
            top: '50%'
          }
        },

        '.prose p, .prose ul': {
          marginBottom: '.5rem'
        },
        '.prose ul': {
          listStyle: 'disc',
          paddingLeft: '3rem'
        }
      })
    })
  ]
})

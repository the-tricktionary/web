import { defineConfig } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  presets: [
    presetWind4({
      dark: 'media',
      preflights: {
        reset: true,
        theme: 'on-demand'
      }
    })
  ],
  transformers: [
    transformerDirectives()
  ],
  theme: {
    colors: {
      ttred: {
        500: '#fe3500',
        900: '#da1100'
      },
      ttyellow: {
        300: '#feedb2',
        500: '#fec500'
      }
    },
    font: {
      sans: '"PT Sans", sans-serif'
    },
    default: {
      font: {
        family: '"PT Sans", sans-serif'
      }
    }
  },
  shortcuts: {
    // Generic button, also used for link-buttons and submit inputs
    btn: [
      'block w-full p-2 rounded text-center cursor-pointer',
      'bg-white border border-solid border-gray-300',
      'hover:bg-gray-200',
      'disabled:cursor-default disabled:bg-gray-200 disabled:text-gray-500',
      'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ttred-900 focus-visible:outline-offset-2'
    ].join(' ')
  },
  preflights: [
    {
      getCSS: ({ theme }) => {
        const colors = theme.colors as Record<string, Record<string, string>>
        const gray300 = colors.gray['300']
        const gray200 = colors.gray['200']
        const gray500 = colors.gray['500']
        const blue500 = colors.blue['500']
        const blue800 = colors.blue['800']
        const red900 = colors.ttred['900']

        return `
          p { margin-bottom: 0.5rem; }
          p a {
            color: ${blue500};
            text-decoration-line: underline;
            text-underline-offset: 1px;
          }
          p a:hover {
            color: ${blue800};
            text-underline-offset: 3px;
          }
          h1 { font-size: 2.25rem; line-height: 2.5rem; font-weight: 600; }
          h2 { font-size: 1.125rem; line-height: 1.75rem; font-weight: 600; }

          /* Replacement for the windicss forms plugin, only the controls this app uses */
          input:where([type="text"], [type="email"], [type="search"], [type="url"], [type="tel"], [type="number"], [type="password"]),
          select,
          textarea {
            appearance: none;
            background-color: #fff;
            border: 1px solid ${gray500};
            padding: 0.5rem 0.75rem;
            font-size: 1rem;
            line-height: 1.5rem;
          }
          input::placeholder, textarea::placeholder { color: ${gray500}; }

          /* Visible focus indicator for everything focusable */
          :where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
            outline: 2px solid ${red900};
            outline-offset: 2px;
          }

          form:invalid .btn {
            cursor: default;
            background-color: ${gray200};
            color: ${gray500};
          }

          .prose p, .prose ul { margin-bottom: 0.5rem; }
          .prose ul { list-style: disc; padding-left: 3rem; }

          /* keep a neutral default border colour like windi/tailwind v3 had */
          *, ::before, ::after { border-color: ${gray300}; }
        `
      }
    }
  ]
})

import { defineConfig } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import transformerDirectives from '@unocss/transformer-directives'

/**
 * Semantic colour tokens.
 *
 * Every surface, border and text colour in the app refers to one of these
 * roles rather than to a literal grey, so the whole palette flips in one
 * place instead of needing a `dark:` counterpart on each utility.
 *
 * The light values are the exact palette entries the app rendered before dark
 * mode (quoted from preset-wind4, hence the oklch notation), so light mode is
 * pixel-for-pixel unchanged. The dark values are bespoke.
 */
const lightTokens = {
  // Page and surfaces
  page: '#fff',
  surface: '#fff',
  /** Hover/active fill on top of a surface, and the fill of a disabled control */
  elevated: 'oklch(92.8% 0.006 264.531)', // gray-200
  /** Recessed wells, e.g. the ad container and disabled inputs */
  sunken: 'oklch(96.7% 0.003 264.542)', // gray-100
  /** Behind images and videos, visible until the media loads */
  placeholder: 'oklch(87.2% 0.01 258.338)', // gray-300

  // Lines
  line: 'oklch(87.2% 0.01 258.338)', // gray-300
  /** Borders of text inputs, which need more weight than a plain divider */
  field: 'oklch(55.1% 0.027 264.364)', // gray-500

  // Text
  content: '#000',
  /** Secondary text, e.g. a trick's type and level */
  'muted-strong': 'oklch(44.6% 0.03 256.802)', // gray-600
  /** Tertiary text, e.g. placeholder icons and disabled labels */
  muted: 'oklch(55.1% 0.027 264.364)', // gray-500
  link: 'oklch(62.3% 0.214 259.815)', // blue-500
  'link-hover': 'oklch(42.4% 0.199 265.638)', // blue-800

  // Feedback
  success: 'oklch(72.3% 0.219 149.579)', // green-500
  /** Lower-emphasis success, used while a completion is in flight */
  'success-soft': 'oklch(87.1% 0.15 154.449)', // green-300

  // Inverted surface, currently only the level-verification tooltip
  tooltip: 'oklch(21% 0.034 264.665)', // gray-900
  'tooltip-content': '#fff'
}

const darkTokens: typeof lightTokens = {
  page: '#0d1117',
  surface: '#161b22',
  elevated: '#21262d',
  sunken: '#0b0f14',
  placeholder: '#21262d',

  line: '#30363d',
  field: '#484f58',

  content: '#e6edf3',
  'muted-strong': '#b1bac4',
  muted: '#9198a1',
  link: '#60a5fa',
  'link-hover': '#93c5fd',

  success: '#238636',
  'success-soft': '#166534',

  // Kept darker than a plain inversion so it does not glare on a dark page
  tooltip: '#2d333b',
  'tooltip-content': '#e6edf3'
}

const declarations = (tokens: typeof lightTokens) => Object.entries(tokens)
  .map(([name, value]) => `--tt-${name}: ${value};`)
  .join('\n            ')

/** Expose each token to UnoCSS so `bg-surface`, `border-line`, … all work */
const tokenColors = Object.fromEntries(
  Object.keys(lightTokens).map(name => [name, `var(--tt-${name})`])
)

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
      ...tokenColors,
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
      'bg-surface border border-solid border-line',
      'hover:bg-elevated',
      'disabled:cursor-default disabled:bg-elevated disabled:text-muted',
      'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ttred-900 focus-visible:outline-offset-2'
    ].join(' ')
  },
  preflights: [
    {
      getCSS: () => `
          /*
           * Dark mode follows the operating system. The data-theme attribute on
           * <html> is an escape hatch that forces one scheme, so a manual
           * toggle can be added later without touching any component.
           */
          :root {
            color-scheme: light;
            ${declarations(lightTokens)}
          }

          @media (prefers-color-scheme: dark) {
            :root:not([data-theme="light"]) {
              color-scheme: dark;
              ${declarations(darkTokens)}
            }
          }

          :root[data-theme="dark"] {
            color-scheme: dark;
            ${declarations(darkTokens)}
          }

          html {
            background-color: var(--tt-page);
            color: var(--tt-content);
          }

          p { margin-bottom: 0.5rem; }
          p a {
            color: var(--tt-link);
            text-decoration-line: underline;
            text-underline-offset: 1px;
          }
          p a:hover {
            color: var(--tt-link-hover);
            text-underline-offset: 3px;
          }
          h1 { font-size: 2.25rem; line-height: 2.5rem; font-weight: 600; }
          h2 { font-size: 1.125rem; line-height: 1.75rem; font-weight: 600; }

          /* Replacement for the windicss forms plugin, only the controls this app uses */
          input:where([type="text"], [type="email"], [type="search"], [type="url"], [type="tel"], [type="number"], [type="password"]),
          select,
          textarea {
            appearance: none;
            background-color: var(--tt-surface);
            color: var(--tt-content);
            border: 1px solid var(--tt-field);
            padding: 0.5rem 0.75rem;
            font-size: 1rem;
            line-height: 1.5rem;
          }
          input::placeholder, textarea::placeholder { color: var(--tt-muted); }

          /* Visible focus indicator for everything focusable */
          :where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
            outline: 2px solid #da1100;
            outline-offset: 2px;
          }

          form:invalid .btn {
            cursor: default;
            background-color: var(--tt-elevated);
            color: var(--tt-muted);
          }

          .prose p, .prose ul { margin-bottom: 0.5rem; }
          .prose ul { list-style: disc; padding-left: 3rem; }

          /* keep a neutral default border colour like windi/tailwind v3 had */
          *, ::before, ::after { border-color: var(--tt-line); }
        `
    }
  ]
})

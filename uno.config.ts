import { defineConfig } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import transformerDirectives from '@unocss/transformer-directives'
import { colors } from '@unocss/preset-wind4/colors'

/**
 * Semantic colour tokens.
 *
 * Every surface, border and text colour in the app refers to one of these
 * roles rather than to a literal grey, so the whole palette flips in one
 * place instead of needing a `dark:` counterpart on each utility.
 *
 * The values are shades from the preset's own palette, so there is nothing
 * bespoke to keep in sync with it.
 */
const lightTokens = {
  // Page and surfaces
  page: colors.white,
  surface: colors.white,
  /** Hover/active fill on top of a surface, and the fill of a disabled control */
  elevated: colors.gray[200],
  /** Recessed wells, e.g. the ad container and disabled inputs */
  sunken: colors.gray[100],
  /** Behind images and videos, visible until the media loads */
  placeholder: colors.gray[300],

  // Lines
  line: colors.gray[300],
  /** Borders of text inputs, which need more weight than a plain divider */
  field: colors.gray[500],

  // Text
  content: colors.black,
  /** Secondary text, e.g. placeholder icons, disabled labels, a trick's level */
  muted: colors.gray[500],
  link: colors.blue[500],
  'link-hover': colors.blue[800],

  // Feedback
  success: colors.green[500],
  /** Lower-emphasis success, used while a completion is in flight */
  'success-soft': colors.green[300],

  // Inverted surface, currently only the level-verification tooltip
  tooltip: colors.gray[900],
  'tooltip-content': colors.white
}

const darkTokens: typeof lightTokens = {
  page: colors.gray[950],
  surface: colors.gray[900],
  elevated: colors.gray[800],
  sunken: colors.gray[800],
  placeholder: colors.gray[800],

  line: colors.gray[700],
  field: colors.gray[600],

  content: colors.gray[100],
  muted: colors.gray[400],
  link: colors.blue[400],
  'link-hover': colors.blue[300],

  success: colors.green[600],
  'success-soft': colors.green[800],

  // Lighter than the surface, so it reads as raised rather than glaring
  tooltip: colors.gray[700],
  'tooltip-content': colors.gray[100]
}

/** Brand colours, the only values here that are ours rather than the preset's */
const brand = {
  ttred: {
    500: '#fe3500',
    900: '#da1100'
  },
  ttyellow: {
    300: '#feedb2',
    500: '#fec500'
  }
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
      ...brand
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
  rules: [
    // A block wider than the page container, out to a 1rem gutter; the gutter is
    // what keeps the document from scrolling sideways, since 100vw counts the scrollbar
    ['full-bleed', { 'margin-inline': 'calc(50% - 50vw + 1rem)' }]
  ],
  shortcuts: {
    // Generic button, also used for link-buttons and submit inputs
    btn: [
      'block w-full p-2 rounded text-center cursor-pointer',
      // A label that wraps makes the button, and the bottom bar holding it, a
      // line taller. min-w-min keeps it from being squeezed narrower than its
      // label instead: as a flex child it may shrink, and with nowrap its
      // min-content width is the whole label. A bar that runs out of room
      // scrolls, which is what its overflow-x is for.
      'whitespace-nowrap min-w-min',
      'bg-surface border border-solid border-line',
      'hover:bg-elevated',
      'disabled:cursor-default disabled:bg-elevated disabled:text-muted',
      'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ttred-900 focus-visible:outline-offset-2'
    ].join(' '),
    // The floor for anything meant to be hit with a thumb, 44 CSS px square
    'touch-target': 'min-w-11 min-h-11'
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
          th { white-space: nowrap; }

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

          /* A disabled control reads as recessed and muted, as the btn shortcut does */
          input:where([type="text"], [type="email"], [type="search"], [type="url"], [type="tel"], [type="number"], [type="password"]):disabled,
          select:disabled,
          textarea:disabled {
            background-color: var(--tt-sunken);
            color: var(--tt-muted);
            cursor: default;
          }

          /* The chevron a native select loses to appearance: none */
          select {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 7.5 5 5 5-5'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1rem;
            padding-right: 2.5rem;
          }

          /* Visible focus indicator for everything focusable */
          :where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
            outline: 2px solid ${brand.ttred[900]};
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

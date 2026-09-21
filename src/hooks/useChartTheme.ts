import { computed } from 'vue'
import { usePreferredDark } from '@vueuse/core'

/**
 * Chart colours for the current colour scheme.
 *
 * The series colours are slots of a colourblind-validated categorical palette,
 * checked against the site's light and dark surfaces (worst pair ΔE 24.7
 * light / 26.8 dark under protanopia, every slot ≥ 3:1). Slots 3 to 6 were
 * added under the same rule — green, pink, gold and violet, each tuned for
 * its own surface — and under a Viénot simulation of protanopia and
 * deuteranopia no pair of the six falls below ΔE2000 16.9 light / 17.0 dark,
 * with every slot at 3.09:1 or better against its surface. Past six series a
 * chart falls back to `muted`, so order series by how much there is to read.
 * Everything else mirrors the semantic tokens in uno.config.ts.
 */
export default function useChartTheme () {
  const dark = usePreferredDark()

  return computed(() => dark.value
    ? {
        series: ['#3987e5', '#d95926', '#5cdcac', '#a86285', '#f2d24b', '#c9b2f5'] as const,
        surface: 'oklch(21% 0.034 264.665)',
        ink: 'oklch(96.7% 0.003 264.542)',
        muted: 'oklch(70.7% 0.022 261.325)',
        grid: 'oklch(37.3% 0.034 259.733)',
        trend: 'oklch(55.1% 0.027 264.364)'
      }
    : {
        series: ['#2a78d6', '#eb6834', '#1a7a5d', '#c07fa2', '#6b5c05', '#573a75'] as const,
        surface: '#ffffff',
        ink: '#000000',
        muted: 'oklch(55.1% 0.027 264.364)',
        grid: 'oklch(87.2% 0.01 258.338)',
        trend: 'oklch(55.1% 0.027 264.364)'
      }
  )
}

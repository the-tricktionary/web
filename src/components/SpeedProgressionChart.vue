<template>
  <Chart :definition="definition" :height="280" :aria-label="chartLabel" class="w-full" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { defineChart, dot, linearRegressionY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/vue'
import { scaleTime } from 'd3-scale'

import useChartTheme from '../hooks/useChartTheme'

export interface ProgressionPoint {
  id: string
  date: Date
  count: number
  name: string
}

const props = defineProps<{
  points: ProgressionPoint[]
  /** Accessible name of the chart */
  chartLabel: string
}>()

const { t } = useI18n()
const theme = useChartTheme()

const definition = computed(() => {
  const colours = theme.value
  const points = [...props.points].sort((a, b) => a.date.getTime() - b.date.getTime())

  return defineChart({
    marks: [
      // a trend needs at least two scores to fit
      ...(points.length >= 2
        ? [linearRegressionY(points, { x: 'date', y: 'count', ci: 0, stroke: colours.trend, strokeWidth: 2 })]
        : []),
      dot(points, { x: 'date', y: 'count', r: 5, fill: colours.series[0], stroke: colours.surface, strokeWidth: 2 })
    ],
    scales: {
      x: { scale: scaleTime, nice: true, axis: { label: t('speed.chart.date') } },
      y: { scale: scaleLinear, nice: true, grid: true, axis: { label: t('speed.chart.steps') } }
    },
    theme: {
      foreground: colours.ink,
      muted: colours.muted,
      grid: colours.grid,
      background: colours.surface,
      palette: colours.series
    },
    tooltip
  })
})
</script>

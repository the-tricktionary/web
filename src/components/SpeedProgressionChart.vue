<template>
  <div class="flex flex-col gap-2">
    <chart-legend v-if="seriesLabels.length > 1" :items="legend" />
    <Chart :definition="definition" :height="280" :aria-label="chartLabel" class="w-full" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { defineChart, dot, linearRegressionY } from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/vue'
import { scaleTime } from 'd3-scale'

import ChartLegend from './ChartLegend.vue'
import useChartTheme from '../hooks/useChartTheme'

export interface ProgressionPoint {
  id: string
  date: Date
  count: number
  name: string
  /** Which line the point belongs to, for a chart given series */
  series?: string
}

const props = defineProps<{
  points: ProgressionPoint[]
  /** The lines to draw, in the order they take their colours and legend */
  series?: string[]
  /** Series drawn with a dashed trend, to set them apart from the rest */
  dashedSeries?: string[]
  /** Accessible name of the chart */
  chartLabel: string
}>()

const { t } = useI18n()
const theme = useChartTheme()

const seriesLabels = computed(() => props.series ?? [])
const dashedLabels = computed(() => new Set(props.dashedSeries ?? []))
const seriesColours = computed(() => seriesLabels.value.map((_, idx) => theme.value.series[idx] ?? theme.value.muted))
const legend = computed(() => seriesLabels.value.map((label, idx) => ({
  label,
  color: seriesColours.value[idx] ?? theme.value.muted,
  dashed: dashedLabels.value.has(label)
})))

const definition = computed(() => {
  const colours = theme.value
  const points = [...props.points].sort((a, b) => a.date.getTime() - b.date.getTime())
  const grouped = seriesLabels.value.length > 0

  const dashed = grouped ? points.filter(point => dashedLabels.value.has(point.series ?? '')) : []
  const solid = grouped ? points.filter(point => !dashedLabels.value.has(point.series ?? '')) : points

  return defineChart({
    marks: [
      // a trend needs at least two scores to fit, per series when there are series
      ...(solid.length >= 2
        ? [linearRegressionY(solid, {
            id: 'trend',
            x: 'date',
            y: 'count',
            ci: 0,
            ...(grouped ? { z: 'series' } : { stroke: colours.trend }),
            strokeWidth: 2
          })]
        : []),
      ...(dashed.length >= 2
        ? [linearRegressionY(dashed, {
            id: 'trend-dashed',
            x: 'date',
            y: 'count',
            ci: 0,
            z: 'series',
            strokeWidth: 2,
            strokeDasharray: '6 4'
          })]
        : []),
      dot(points, {
        x: 'date',
        y: 'count',
        r: 5,
        ...(grouped ? { color: 'series' } : { fill: colours.series[0] }),
        stroke: colours.surface,
        strokeWidth: 2
      })
    ],
    scales: {
      x: { scale: scaleTime, nice: true, axis: { label: t('speed.chart.date') } },
      y: { scale: scaleLinear, nice: true, grid: true, axis: { label: t('speed.chart.steps') } }
    },
    ...(grouped ? { color: { domain: seriesLabels.value, range: seriesColours.value } } : {}),
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

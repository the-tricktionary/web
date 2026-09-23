<template>
  <div class="flex flex-col gap-2">
    <chart-legend v-if="series.length > 1" :items="series.map((s, idx) => ({ label: s.label, color: theme.series[idx] ?? theme.muted }))" />
    <Chart :definition="definition" :height="260" :aria-label="chartLabel" class="w-full" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { areaY, defineChart, lineY, ruleX, text } from '@tanstack/charts'
import { d3Curve } from '@tanstack/charts/d3/shape'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/vue'
import { curveMonotoneX } from 'd3-shape'

import ChartLegend from './ChartLegend.vue'
import useChartTheme from '../hooks/useChartTheme'

export interface PaceSeries {
  label: string
  /** The pace in each whole second of the event, see SpeedAnalysis */
  stepsPerSecondSeries: readonly number[]
}

/**
 * Monotone rather than a rounder spline: it runs through every point and
 * never overshoots, so the curve cannot invent a peak the athlete never hit
 * or dip below zero between two slow seconds.
 */
const curve = d3Curve(curveMonotoneX)

export interface PaceSegment {
  /** Seconds from the start of the event */
  start: number
  end: number
  label?: string | null
}

interface PaceRow {
  /** The second this value covers, 1-based so the first covers 0..1 s */
  second: number
  pace: number
  series: string
}

const props = defineProps<{
  series: PaceSeries[]
  /** Boundaries between athletes, drawn as rules with their labels */
  segments?: PaceSegment[]
  /** Accessible name of the chart */
  chartLabel: string
}>()

const { t } = useI18n()
const theme = useChartTheme()

const rows = computed<PaceRow[]>(() => props.series.flatMap(s => s.stepsPerSecondSeries.map((pace, idx) => ({
  second: idx + 1,
  pace,
  series: s.label
}))))

const peak = computed(() => Math.max(1, ...rows.value.map(row => row.pace)))

/** Rules go at every boundary but the very first (which is the y axis) */
const boundaries = computed(() => (props.segments ?? []).filter(segment => segment.start > 0).map(segment => ({ second: segment.start })))
const segmentLabels = computed(() => (props.segments ?? [])
  .filter(segment => segment.label)
  .map(segment => ({ second: (segment.start + segment.end) / 2, label: segment.label ?? '' })))

const definition = computed(() => {
  const colours = theme.value
  const single = props.series.length === 1
  const labels = props.series.map(s => s.label)

  return defineChart({
    marks: [
      ...(single
        ? [
            areaY(rows.value, { x: 'second', y: 'pace', fill: colours.series[0], fillOpacity: 0.1, strokeWidth: 0, curve }),
            lineY(rows.value, { x: 'second', y: 'pace', stroke: colours.series[0], strokeWidth: 2, curve })
          ]
        : [
            lineY(rows.value, { x: 'second', y: 'pace', z: 'series', color: 'series', strokeWidth: 2, curve })
          ]),
      ruleX(boundaries.value, { x: 'second', stroke: colours.muted, strokeWidth: 1 }),
      // a row above the peak, so the labels never sit on the line
      text(segmentLabels.value, { x: 'second', y: () => peak.value + 1, text: 'label', fill: colours.muted, fontSize: 11 })
    ],
    scales: {
      x: { scale: scaleLinear, axis: { label: t('speed.chart.seconds') } },
      y: { scale: scaleLinear, nice: true, grid: true, axis: { label: t('speed.chart.stepsPerSecond') } }
    },
    color: { domain: labels, range: colours.series.slice(0, labels.length) },
    theme: colours.chart,
    tooltip
  })
})
</script>

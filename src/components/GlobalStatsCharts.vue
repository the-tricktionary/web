<template>
  <div class="flex flex-col gap-6 mb-4">
    <figure class="m-0 flex flex-col gap-2">
      <figcaption class="font-semibold">
        {{ t('about.stats.completionsChart') }}
      </figcaption>
      <chart-legend :items="legend" />
      <Chart :definition="completionsDefinition" :height="280" :aria-label="t('about.stats.completionsChart')" class="w-full" />
    </figure>

    <div class="grid md:grid-cols-2 gap-6">
      <figure v-for="speed of speedCharts" :key="speed.label" class="m-0 flex flex-col gap-2">
        <figcaption class="font-semibold">
          {{ speed.label }}
        </figcaption>
        <Chart :definition="speed.definition" :height="220" :aria-label="speed.label" class="w-full" />
      </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { areaY, defineChart, lineY, ruleY, stack } from '@tanstack/charts'
import { crosshair } from '@tanstack/charts/crosshair'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/vue'
import { scaleTime } from 'd3-scale'

import ChartLegend from './ChartLegend.vue'
import useChartTheme from '../hooks/useChartTheme'
import useSpeedFormat from '../hooks/useSpeedFormat'

import type { GlobalStatsQuery } from '../graphql/generated/graphql'

const props = defineProps<{
  /** Oldest first */
  history: GlobalStatsQuery['globalStatsHistory']
}>()

const { t } = useI18n()
const theme = useChartTheme()
const { number } = useSpeedFormat()

/** Across all snapshots, so a level keeps its colour */
const levels = computed(() => [...new Set(props.history.flatMap(snapshot => snapshot.levels.map(level => level.level)))]
  .sort((a, b) => Number(a) - Number(b)))
const levelLabels = computed(() => levels.value.map(level => t('profile.level', { level })))
const levelColours = computed(() => levelLabels.value.map((_, idx) => theme.value.series[idx] ?? theme.value.muted))
const legend = computed(() => levelLabels.value.map((label, idx) => ({ label, color: levelColours.value[idx] ?? theme.value.muted })))

const completionsDefinition = computed(() => {
  // a missing level stacks as 0
  const rows = props.history.flatMap(snapshot => levels.value.map(level => ({
    date: new Date(snapshot.countedAt),
    level: t('profile.level', { level }),
    completions: snapshot.levels.find(entry => entry.level === level)?.completions ?? 0
  })))

  return defineChart({
    marks: [
      areaY(rows, {
        x: 'date',
        y: 'completions',
        color: 'level',
        layout: stack({ order: levelLabels.value }),
        fillOpacity: 0.85
      }),
      ruleY([0]),
      crosshair({ x: { label: true }, y: false })
    ],
    scales: {
      x: { scale: scaleTime, axis: { label: t('about.stats.date') } },
      y: { scale: scaleLinear, nice: true, grid: true, axis: { label: t('about.stats.completions'), ticks: { format: number } } }
    },
    color: { domain: levelLabels.value, range: levelColours.value },
    theme: theme.value.chart,
    focus: 'nearest-x',
    tooltip
  })
})

function speedDefinition (y: 'speedResults' | 'speedSteps', label: string) {
  const rows = props.history.map(snapshot => ({ date: new Date(snapshot.countedAt), value: snapshot[y] }))

  return defineChart({
    marks: [
      lineY(rows, { x: 'date', y: 'value', stroke: theme.value.series[0], strokeWidth: 2 }),
      crosshair({ x: { label: true }, y: false })
    ],
    scales: {
      x: { scale: scaleTime, axis: { label: t('about.stats.date') } },
      y: { scale: scaleLinear, nice: true, grid: true, axis: { label, ticks: { format: number } } }
    },
    theme: theme.value.chart,
    focus: 'nearest-x',
    tooltip
  })
}

const speedCharts = computed(() => [
  { label: t('about.stats.speedResults'), definition: speedDefinition('speedResults', t('about.stats.speedResults')) },
  { label: t('about.stats.speedSteps'), definition: speedDefinition('speedSteps', t('about.stats.speedSteps')) }
])
</script>

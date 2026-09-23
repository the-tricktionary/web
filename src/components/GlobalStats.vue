<template>
  <div v-if="stats" class="my-6">
    <h3 class="font-semibold mb-3">
      {{ t('about.stats.title') }}
    </h3>

    <dl class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="figure of figures" :key="figure.label" class="flex flex-col-reverse gap-1">
        <dt class="text-muted">
          {{ figure.label }}
        </dt>
        <dd class="text-4xl font-bold leading-none tabular-nums">
          {{ figure.value }}
        </dd>
      </div>
    </dl>

    <template v-if="stats.levels.length">
      <h4 class="font-semibold mb-2">
        {{ t('about.stats.averagePerLevel') }}
      </h4>
      <ul class="flex flex-col gap-3 max-w-160 mb-6">
        <level-progress
          v-for="level of stats.levels"
          :key="level.level"
          :label="t('profile.level', { level: level.level })"
          :text="t('profile.completedOf', { completed: number(level.averageCompletions, { decimals: 1 }), total: number(level.tricks) })"
          :value="level.averageCompletions"
          :max="level.tricks"
        />
      </ul>
    </template>

    <global-stats-charts v-if="history.length >= 2" :history="history" />

    <p class="text-sm text-muted">
      {{ t('about.stats.countedAt', { date: dateTime(stats.countedAt) }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { startOfDay, subMonths } from 'date-fns'

import { useGlobalStatsQuery } from '../graphql/generated/graphql'
import LevelProgress from './LevelProgress.vue'
import useSpeedFormat from '../hooks/useSpeedFormat'

// keeps the chart library out of the home page bundle
const GlobalStatsCharts = defineAsyncComponent(async () => await import('./GlobalStatsCharts.vue'))

const { t } = useI18n()
const { number, dateTime } = useSpeedFormat()

// to the day, so the variables and the cache entry stay the same all day
const from = startOfDay(subMonths(new Date(), 12))
const statsQuery = useGlobalStatsQuery({ from: from.getTime() }, { fetchPolicy: 'cache-and-network' })
const stats = computed(() => statsQuery.result.value?.globalStats)
const history = computed(() => statsQuery.result.value?.globalStatsHistory ?? [])

const figures = computed(() => stats.value
  ? [
      { label: t('about.stats.tricks'), value: number(stats.value.tricks) },
      { label: t('about.stats.completions'), value: number(stats.value.completions) },
      { label: t('about.stats.averageCompletions'), value: number(stats.value.averageCompletions, { decimals: 1 }) },
      { label: t('about.stats.acceptedSubmissions'), value: number(stats.value.acceptedSubmissions) }
    ]
  : [])
</script>

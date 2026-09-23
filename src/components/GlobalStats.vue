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
        <li v-for="level of stats.levels" :key="level.level" class="grid grid-cols-[auto_max-content] gap-x-4 gap-y-1 items-baseline">
          <span class="font-semibold">{{ t('profile.level', { level: level.level }) }}</span>
          <span class="text-muted tabular-nums">{{ t('profile.completedOf', { completed: number(level.averageCompletions, { decimals: 1 }), total: number(level.tricks) }) }}</span>
          <div
            class="col-span-2 h-2 rounded bg-sunken overflow-hidden"
            role="progressbar"
            :aria-label="t('profile.level', { level: level.level })"
            :aria-valuenow="level.averageCompletions"
            aria-valuemin="0"
            :aria-valuemax="level.tricks"
          >
            <div class="h-full rounded bg-success" :style="{ width: `${percent(level)}%` }" />
          </div>
        </li>
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

import { useGlobalStatsQuery } from '../graphql/generated/graphql'
import useSpeedFormat from '../hooks/useSpeedFormat'

// the chart library stays out of the home page's own bundle
const GlobalStatsCharts = defineAsyncComponent(async () => await import('./GlobalStatsCharts.vue'))

const { t } = useI18n()
const { number, dateTime } = useSpeedFormat()

const statsQuery = useGlobalStatsQuery({ fetchPolicy: 'cache-and-network' })
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

function percent (level: { averageCompletions: number, tricks: number }) {
  if (level.tricks <= 0) return 0
  return Math.min(100, Math.round((level.averageCompletions / level.tricks) * 100))
}
</script>

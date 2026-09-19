<template>
  <div class="container mx-auto px-2 py-4 mb-20">
    <h1 class="mb-4">
      {{ t('speed.compare.title') }}
    </h1>

    <div v-if="loading && (!a || !b)" class="flex items-center justify-center flex-col" role="status">
      <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
      {{ t('speed.compare.loading') }}
    </div>

    <template v-else-if="a && b">
      <speed-pace-chart
        v-if="a.analysis && b.analysis"
        :series="[
          { label: labelOf(a), stepsPerSecondSeries: a.analysis.stepsPerSecondSeries },
          { label: labelOf(b), stepsPerSecondSeries: b.analysis.stepsPerSecondSeries }
        ]"
        :segments="a.analysis.segments"
        :chart-label="t('speed.chart.compareOf', { a: labelOf(a), b: labelOf(b) })"
      />
      <p v-else class="text-muted">
        {{ t('speed.compare.noPace') }}
      </p>

      <table class="w-full border-collapse mt-6">
        <thead>
          <tr class="border-b border-line text-left">
            <th scope="col" class="py-2 pr-2">
              <span class="sr-only">{{ t('speed.compare.statistic') }}</span>
            </th>
            <th scope="col" class="py-2 pr-2">
              {{ labelOf(a) }}
            </th>
            <th scope="col" class="py-2 pr-2">
              {{ labelOf(b) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row of statRows" :key="row.label" class="border-b border-line">
            <th scope="row" class="py-2 pr-2 text-left font-semibold">
              {{ row.label }}
            </th>
            <td class="py-2 pr-2 tabular-nums">
              {{ row.a }}
            </td>
            <td class="py-2 pr-2 tabular-nums">
              {{ row.b }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-else-if="a">
      <p>{{ t('speed.compare.pickSecond', { name: labelOf(a) }) }}</p>
      <label class="flex items-center gap-2 mb-4">
        <input v-model="sameEventOnly" type="checkbox">
        {{ t('speed.compare.sameEventOnly', { event: a.eventDefinition.name }) }}
      </label>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <speed-box
          v-for="candidate of candidates"
          :key="candidate.id"
          :result="candidate"
          :to="{ name: 'speed-compare', query: { a: a.id, b: candidate.id } }"
        />
      </div>
      <p v-if="!candidates.length" class="text-muted">
        {{ t('speed.compare.noCandidates') }}
      </p>
    </template>

    <i18n-t v-else keypath="speed.compare.pickFrom" tag="p">
      <template #link>
        <router-link :to="{ name: 'speed' }">
          {{ t('speed.compare.yourScores') }}
        </router-link>
      </template>
    </i18n-t>
  </div>

  <bottom-bar>
    <router-link :to="a ? { name: 'speed-details', params: { id: a.id } } : { name: 'speed' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.compare.back') }}</span>
    </router-link>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'

import { useSpeedResultQuery, useSpeedResultsQuery } from '../graphql/generated/graphql'
import useSpeedFormat from '../hooks/useSpeedFormat'

import BottomBar from '../components/BottomBar.vue'
import SpeedBox from '../components/SpeedBox.vue'
import SpeedPaceChart from '../components/SpeedPaceChart.vue'
import IconLoading from '~icons/mdi/loading'
import IconChevronLeft from '~icons/mdi/chevron-left'

import type { SpeedResultQuery } from '../graphql/generated/graphql'

type Result = NonNullable<NonNullable<SpeedResultQuery['me']>['speedResult']>

const { t } = useI18n()
const { dateTime, duration, number } = useSpeedFormat()

useHead({ title: computed(() => t('speed.compare.title')) })

const route = useRoute()

const idA = computed(() => typeof route.query.a === 'string' ? route.query.a : '')
const idB = computed(() => typeof route.query.b === 'string' ? route.query.b : '')

const queryA = useSpeedResultQuery(() => ({ speedResultId: idA.value }), () => ({ enabled: idA.value !== '', fetchPolicy: 'cache-and-network' }))
const queryB = useSpeedResultQuery(() => ({ speedResultId: idB.value }), () => ({ enabled: idB.value !== '', fetchPolicy: 'cache-and-network' }))
const a = computed(() => queryA.result.value?.me?.speedResult ?? null)
const b = computed(() => queryB.result.value?.me?.speedResult ?? null)
const loading = computed(() => queryA.loading.value || queryB.loading.value)

const listQuery = useSpeedResultsQuery({ limit: 100, startAfter: null }, () => ({ enabled: idA.value !== '' && idB.value === '', fetchPolicy: 'cache-and-network' }))
const sameEventOnly = ref(true)
const candidates = computed(() => (listQuery.result.value?.me?.speedResults ?? [])
  .filter(candidate => candidate.id !== a.value?.id)
  .filter(candidate => !sameEventOnly.value || candidate.eventDefinition.id === a.value?.eventDefinition.id))

function labelOf (result: Result) {
  return result.name ?? `${result.eventDefinition.name} ${dateTime(result.createdAt)}`
}

const statRows = computed(() => {
  if (!a.value || !b.value) return []
  const count = (n: number | null | undefined) => n == null ? '–' : number(n)
  const pace = (n: number | null | undefined) => n == null ? '–' : t('speed.details.pace', { pace: number(n) })
  return [
    { label: t('speed.details.event'), a: a.value.eventDefinition.name, b: b.value.eventDefinition.name },
    { label: t('speed.details.duration'), a: duration(a.value.eventDefinition.totalDuration), b: duration(b.value.eventDefinition.totalDuration) },
    { label: t('speed.compare.date'), a: dateTime(a.value.createdAt), b: dateTime(b.value.createdAt) },
    { label: t('speed.compare.steps'), a: count(a.value.count), b: count(b.value.count) },
    { label: t('speed.details.averagePace'), a: pace(a.value.analysis?.stepsPerSecond), b: pace(b.value.analysis?.stepsPerSecond) },
    { label: t('speed.details.peakPace'), a: pace(a.value.analysis?.maxStepsPerSecond), b: pace(b.value.analysis?.maxStepsPerSecond) },
    { label: t('speed.details.misses'), a: count(a.value.analysis?.misses), b: count(b.value.analysis?.misses) },
    { label: t('speed.details.stepsLost'), a: count(a.value.analysis?.stepsLost), b: count(b.value.analysis?.stepsLost) }
  ]
})
</script>

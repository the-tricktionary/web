<template>
  <div class="container mx-auto px-2 py-4 mb-20">
    <h1 class="mb-4">
      {{ t('speed.progress.title') }}
    </h1>

    <label class="flex flex-col gap-1 max-w-120 mb-6">
      <span class="font-semibold">{{ t('speed.progress.event') }}</span>
      <event-picker v-model="eventDefinitionId" :placeholder="t('speed.progress.pickEvent')" />
    </label>

    <template v-if="eventDefinitionId">
      <div v-if="loading && !results.length" class="flex items-center justify-center flex-col" role="status">
        <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
        {{ t('speed.progress.loading') }}
      </div>

      <template v-else-if="results.length">
        <speed-progression-chart :points="points" :chart-label="t('speed.chart.progressOf', { event: selectedEvent?.name ?? '' })" />
        <p class="text-muted text-sm mt-1">
          {{ t('speed.progress.caption') }}
        </p>

        <table class="w-full border-collapse mt-6">
          <thead>
            <tr class="border-b border-line text-left">
              <th scope="col" class="py-2 pr-2">
                {{ t('speed.progress.date') }}
              </th>
              <th scope="col" class="py-2 pr-2">
                {{ t('speed.progress.name') }}
              </th>
              <th scope="col" class="py-2 pr-2 text-right">
                {{ t('speed.progress.steps') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result of results" :key="result.id" class="border-b border-line">
              <td class="py-2 pr-2">
                <router-link :to="{ name: 'speed-details', params: { id: result.id } }">
                  {{ dateTime(result.createdAt) }}
                </router-link>
              </td>
              <td class="py-2 pr-2">
                {{ result.name ?? '' }}
              </td>
              <td class="py-2 pr-2 text-right tabular-nums">
                {{ number(result.count) }}
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <p v-else class="text-muted">
        {{ t('speed.progress.empty') }}
      </p>
    </template>
  </div>

  <bottom-bar>
    <router-link :to="{ name: 'speed' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.allScores') }}</span>
    </router-link>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'

import { useSpeedResultsQuery } from '../graphql/generated/graphql'
import useEventDefinitions from '../hooks/useEventDefinitions'
import useSpeedFormat from '../hooks/useSpeedFormat'

import BottomBar from '../components/BottomBar.vue'
import EventPicker from '../components/EventPicker.vue'
import SpeedProgressionChart from '../components/SpeedProgressionChart.vue'
import IconLoading from '~icons/mdi/loading'
import IconChevronLeft from '~icons/mdi/chevron-left'

const PAGE_SIZE = 100

const { t } = useI18n()
const { dateTime, number } = useSpeedFormat()

useHead({ title: computed(() => t('speed.progress.title')) })

const route = useRoute()
const router = useRouter()

const { eventDefinitions } = useEventDefinitions()

const eventDefinitionId = ref(typeof route.query.event === 'string' ? route.query.event : '')
const selectedEvent = computed(() => eventDefinitions.value.find(eventDefinition => eventDefinition.id === eventDefinitionId.value))

watch(eventDefinitionId, value => {
  void router.replace({ query: value ? { event: value } : {} })
})

const resultsQuery = useSpeedResultsQuery(
  () => ({ limit: PAGE_SIZE, startAfter: null, eventDefinitionId: eventDefinitionId.value }),
  () => ({ enabled: eventDefinitionId.value !== '', fetchPolicy: 'cache-and-network' })
)
const { loading } = resultsQuery
const results = computed(() => resultsQuery.result.value?.me?.speedResults ?? [])

// a progression wants every score, so keep paging until a page comes back short
resultsQuery.onResult(({ data, loading }) => {
  if (loading) return
  const page = data.me?.speedResults ?? []
  if (page.length >= PAGE_SIZE) {
    const last = page[page.length - 1]
    if (last) void resultsQuery.fetchMore({ variables: { limit: PAGE_SIZE, startAfter: last.createdAt, eventDefinitionId: eventDefinitionId.value } })
  }
})

const points = computed(() => results.value.map(result => ({
  id: result.id,
  date: new Date(result.createdAt),
  count: result.count,
  name: result.name ?? result.eventDefinition.name
})))
</script>

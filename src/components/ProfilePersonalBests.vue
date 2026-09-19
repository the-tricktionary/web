<template>
  <section>
    <h2 class="mb-2">
      {{ t('profile.personalBests') }}
    </h2>

    <label class="flex flex-col gap-1 max-w-120 mb-4">
      <span class="font-semibold">{{ t('profile.event') }}</span>
      <select v-model="selectedId" class="rounded">
        <option v-for="result of results" :key="result.id" :value="result.id">
          {{ result.eventDefinition.name }}
        </option>
      </select>
    </label>

    <div v-if="selected" class="border border-line rounded p-4 max-w-160">
      <p class="text-muted font-semibold mb-0">
        <time :datetime="new Date(selected.createdAt).toISOString()">{{ dateTime(selected.createdAt) }}</time>
      </p>

      <p class="flex items-baseline gap-2 mb-4">
        <router-link
          v-if="isMe"
          :to="{ name: 'speed-details', params: { id: selected.id } }"
          class="text-6xl font-bold leading-none"
        >
          {{ number(selected.count) }}
        </router-link>
        <span v-else class="text-6xl font-bold leading-none">{{ number(selected.count) }}</span>
        <span class="text-muted">{{ t('speed.steps') }}</span>
      </p>

      <template v-if="selected.analysis">
        <dl class="grid grid-cols-[max-content_auto] gap-x-6 gap-y-2 mb-4">
          <dt class="font-semibold">
            {{ t('speed.details.averagePace') }}
          </dt>
          <dd>{{ t('speed.details.pace', { pace: number(selected.analysis.stepsPerSecond) }) }}</dd>
          <dt class="font-semibold">
            {{ t('speed.details.peakPace') }}
          </dt>
          <dd>{{ t('speed.details.pace', { pace: number(selected.analysis.maxStepsPerSecond) }) }}</dd>
        </dl>

        <speed-pace-chart
          :series="[{ label: selected.eventDefinition.name, stepsPerSecondSeries: selected.analysis.stepsPerSecondSeries }]"
          :segments="selected.analysis.segments"
          :chart-label="t('speed.chart.paceOf', { event: selected.eventDefinition.name })"
        />
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import useSpeedFormat from '../hooks/useSpeedFormat'

import SpeedPaceChart from './SpeedPaceChart.vue'

import type { ProfileUserFragment } from '../graphql/generated/graphql'

type PersonalBest = NonNullable<ProfileUserFragment['speedPersonalBests']>[number]

const props = defineProps<{
  results: readonly PersonalBest[]
  /** Only your own scores can be opened, the details view reads your account */
  isMe: boolean
}>()

const { t } = useI18n()
const { dateTime, number } = useSpeedFormat()

const selectedId = ref(props.results[0]?.id ?? '')
const selected = computed(() => props.results.find(result => result.id === selectedId.value))

// The events on offer change as the profile loads, so fall back to the first
watch(() => props.results, results => {
  if (!results.some(result => result.id === selectedId.value)) selectedId.value = results[0]?.id ?? ''
})
</script>

<template>
  <section>
    <h2 class="mb-2">
      {{ t('profile.personalBests') }}
    </h2>

    <label class="flex flex-col gap-1 max-w-120 mb-4">
      <span class="font-semibold">{{ t('profile.event') }}</span>
      <select v-model="selectedId" class="rounded">
        <option v-for="best of bests" :key="best.eventDefinition.id" :value="best.eventDefinition.id">
          {{ best.eventDefinition.name }}
        </option>
      </select>
    </label>

    <div v-if="selected" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="border border-line rounded p-4">
        <h3 class="font-semibold mb-2">
          {{ t('profile.bestTotal') }}
        </h3>
        <div class="flex items-baseline justify-between gap-4">
          <p class="text-muted font-semibold mb-0">
            <time :datetime="new Date(selected.total.createdAt).toISOString()">{{ dateTime(selected.total.createdAt) }}</time>
          </p>
          <router-link
            v-if="isMe"
            :to="{ name: 'speed-details', params: { id: selected.total.id } }"
            class="inline-flex items-center text-sm text-link hover:text-link-hover underline whitespace-nowrap rounded"
          >
            {{ t('profile.openScore') }}
            <icon-chevron-right aria-hidden="true" />
          </router-link>
        </div>

        <p class="flex items-baseline gap-2 mb-4">
          <span class="text-6xl font-bold leading-none">{{ number(selected.total.count) }}</span>
          <span class="text-muted">{{ t('speed.steps') }}</span>
        </p>

        <template v-if="selected.total.analysis">
          <dl class="grid grid-cols-[max-content_auto] gap-x-6 gap-y-2 mb-4">
            <dt class="font-semibold">
              {{ t('speed.details.averagePace') }}
            </dt>
            <dd>{{ t('speed.details.pace', { pace: number(selected.total.analysis.stepsPerSecond) }) }}</dd>
            <dt class="font-semibold">
              {{ t('speed.details.peakPace') }}
            </dt>
            <dd>{{ t('speed.details.pace', { pace: number(selected.total.analysis.maxStepsPerSecond) }) }}</dd>
          </dl>

          <speed-pace-chart
            :series="[{ label: selected.eventDefinition.name, stepsPerSecondSeries: selected.total.analysis.stepsPerSecondSeries }]"
            :segments="selected.total.analysis.segments"
            :chart-label="t('speed.chart.paceOf', { event: selected.eventDefinition.name })"
          />
        </template>
      </div>

      <div v-if="selected.ownSegment" class="border border-line rounded p-4">
        <h3 class="font-semibold mb-2">
          {{ t('profile.bestSegment') }}
        </h3>
        <div class="flex items-baseline justify-between gap-4">
          <p class="text-muted font-semibold mb-0">
            <time :datetime="new Date(selected.ownSegment.result.createdAt).toISOString()">{{ dateTime(selected.ownSegment.result.createdAt) }}</time>
            &middot; {{ segmentLabel(selected.ownSegment.segment) }}
          </p>
          <router-link
            v-if="isMe"
            :to="{ name: 'speed-details', params: { id: selected.ownSegment.result.id } }"
            class="inline-flex items-center text-sm text-link hover:text-link-hover underline whitespace-nowrap rounded"
          >
            {{ t('profile.openScore') }}
            <icon-chevron-right aria-hidden="true" />
          </router-link>
        </div>

        <p class="flex items-baseline gap-2 mb-4">
          <span class="text-6xl font-bold leading-none">{{ number(selected.ownSegment.count) }}</span>
          <span class="text-muted">{{ t('speed.steps') }}</span>
        </p>

        <dl class="grid grid-cols-[max-content_auto] gap-x-6 gap-y-2 mb-4">
          <dt class="font-semibold">
            {{ t('speed.details.averagePace') }}
          </dt>
          <dd>
            {{ selected.ownSegment.stepsPerSecond == null
              ? t('profile.paceUnknown')
              : t('speed.details.pace', { pace: number(selected.ownSegment.stepsPerSecond) }) }}
          </dd>
          <dt class="font-semibold">
            {{ t('profile.segmentShare') }}
          </dt>
          <dd>{{ t('groups.speed.analysis.share', { share: number(segmentShare(selected.ownSegment), { decimals: 0 }) }) }}</dd>
        </dl>

        <speed-pace-chart
          v-if="selected.ownSegment.result.analysis"
          :series="[{ label: selected.eventDefinition.name, stepsPerSecondSeries: selected.ownSegment.result.analysis.stepsPerSecondSeries }]"
          :segments="selected.ownSegment.result.analysis.segments"
          :chart-label="t('speed.chart.paceOf', { event: selected.eventDefinition.name })"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import useSpeedFormat from '../hooks/useSpeedFormat'

import SpeedPaceChart from './SpeedPaceChart.vue'
import IconChevronRight from '~icons/mdi/chevron-right'

import type { ProfileUserFragment } from '../graphql/generated/graphql'

type PersonalBest = NonNullable<ProfileUserFragment['speedBests']>[number]
type OwnSegment = NonNullable<PersonalBest['ownSegment']>

const props = defineProps<{
  bests: readonly PersonalBest[]
  /** The details view only opens your own scores */
  isMe: boolean
}>()

const { t } = useI18n()
const { dateTime, number } = useSpeedFormat()

const selectedId = ref(props.bests[0]?.eventDefinition.id ?? '')
const selected = computed(() => props.bests.find(best => best.eventDefinition.id === selectedId.value))

function segmentLabel (segment: OwnSegment['segment']) {
  if (!segment) return t('speed.group.wholeScore')
  return segment.label ?? t('speed.details.segmentN', { n: segment.index + 1 })
}

function segmentShare (ownSegment: OwnSegment) {
  return ownSegment.result.count > 0 ? (ownSegment.count / ownSegment.result.count) * 100 : 0
}

watch(() => props.bests, bests => {
  if (!bests.some(best => best.eventDefinition.id === selectedId.value)) selectedId.value = bests[0]?.eventDefinition.id ?? ''
})
</script>

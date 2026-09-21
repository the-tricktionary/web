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

    <div v-if="total" class="border border-line rounded p-4 max-w-160">
      <div class="flex items-baseline justify-between gap-4">
        <p class="text-muted font-semibold mb-0">
          <time :datetime="new Date(total.createdAt).toISOString()">{{ dateTime(total.createdAt) }}</time>
        </p>
        <router-link
          v-if="isMe"
          :to="{ name: 'speed-details', params: { id: total.id } }"
          class="inline-flex items-center text-sm text-link hover:text-link-hover underline whitespace-nowrap rounded"
        >
          {{ t('profile.openScore') }}
          <icon-chevron-right aria-hidden="true" />
        </router-link>
      </div>

      <p class="flex items-baseline gap-2" :class="ownSection ? 'mb-1' : 'mb-4'">
        <span class="text-6xl font-bold leading-none">{{ number(total.count) }}</span>
        <span class="text-muted">{{ t('speed.steps') }}</span>
      </p>

      <p v-if="ownSection" class="text-muted mb-4">
        {{ ownSection }}
      </p>

      <template v-if="total.analysis">
        <dl class="grid grid-cols-[max-content_auto] gap-x-6 gap-y-2 mb-4">
          <dt class="font-semibold">
            {{ t('speed.details.averagePace') }}
          </dt>
          <dd>{{ t('speed.details.pace', { pace: number(total.analysis.stepsPerSecond) }) }}</dd>
          <dt class="font-semibold">
            {{ t('speed.details.peakPace') }}
          </dt>
          <dd>{{ t('speed.details.pace', { pace: number(total.analysis.maxStepsPerSecond) }) }}</dd>
        </dl>

        <speed-pace-chart
          :series="[{ label: total.eventDefinition.name, stepsPerSecondSeries: total.analysis.stepsPerSecondSeries }]"
          :segments="total.analysis.segments"
          :chart-label="t('speed.chart.paceOf', { event: total.eventDefinition.name })"
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
import IconChevronRight from '~icons/mdi/chevron-right'

import type { ProfileUserFragment } from '../graphql/generated/graphql'

type PersonalBest = NonNullable<ProfileUserFragment['speedBests']>[number]

const props = defineProps<{
  bests: readonly PersonalBest[]
  /** Whose bests these are, for the line naming their own section */
  name: string
  /** The details view only opens your own scores */
  isMe: boolean
}>()

const { t } = useI18n()
const { dateTime, number } = useSpeedFormat()

const selectedId = ref(props.bests[0]?.eventDefinition.id ?? '')
const selected = computed(() => props.bests.find(best => best.eventDefinition.id === selectedId.value))
const total = computed(() => selected.value?.total)

/** What the athlete jumped themselves, when the best is a score they shared a leg of */
const ownSection = computed(() => {
  const segment = selected.value?.ownSegment
  if (!segment) return ''
  const count = number(segment.count)
  return segment.segment?.label
    ? t('profile.ownSectionLabelled', { name: props.name, label: segment.segment.label, count })
    : t('profile.ownSection', { name: props.name, count })
})

watch(() => props.bests, bests => {
  if (!bests.some(best => best.eventDefinition.id === selectedId.value)) selectedId.value = bests[0]?.eventDefinition.id ?? ''
})
</script>

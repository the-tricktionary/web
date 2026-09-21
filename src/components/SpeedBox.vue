<template>
  <router-link
    class="grid grid-cols-[auto_5rem] grid-rows-[auto_auto] rounded border border-line bg-surface hover:bg-elevated p-2 gap-x-2"
    :to="to ?? { name: 'speed-details', params: { id: result.id } }"
  >
    <span class="col-start-1 row-start-1 flex items-center gap-1 min-w-0">
      <span class="font-bold truncate">{{ title ?? result.name ?? result.eventDefinition.name }}</span>
      <icon-chart
        v-if="result.counted"
        class="shrink-0 text-muted"
        role="img"
        :aria-label="t('speed.countedScore')"
      />
      <icon-account-question
        v-if="needsAthletes"
        class="shrink-0 text-muted"
        role="img"
        :aria-label="t('speed.group.needsAthletes')"
      />
    </span>
    <span class="col-start-1 row-start-2 text-muted text-sm truncate">
      <template v-if="result.group">{{ result.group.name }} &middot; </template>
      <template v-if="result.name || title">{{ result.eventDefinition.name }} &middot; </template>
      {{ duration(result.eventDefinition.totalDuration) }} &middot;
      <template v-if="note">{{ note }} &middot; </template>
      <time :datetime="new Date(result.createdAt).toISOString()">{{ dateTime(result.createdAt) }}</time>
    </span>

    <span class="col-start-2 row-span-2 flex flex-col justify-center items-center">
      <span class="text-3xl font-bold leading-none">{{ number(count ?? result.count) }}</span>
      <span class="text-muted text-xs">{{ t('speed.steps') }}</span>
    </span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import useSpeedFormat from '../hooks/useSpeedFormat'

import IconAccountQuestion from '~icons/mdi/account-question'
import IconChart from '~icons/mdi/chart-line'

import type { PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { SpeedResultBaseFragment } from '../graphql/generated/graphql'

const props = defineProps({
  result: {
    type: Object as PropType<SpeedResultBaseFragment>,
    required: true
  },
  /** Where the box links, the result's own page unless something else is given */
  to: {
    type: Object as PropType<RouteLocationRaw>,
    default: undefined
  },
  /** Replaces the score's own heading, for a box about a part of the score */
  title: {
    type: String,
    default: undefined
  },
  /** Replaces the score's own count, for a box about a part of the score */
  count: {
    type: Number,
    default: undefined
  },
  /** An extra word in the line under the heading, e.g. a pace */
  note: {
    type: String,
    default: undefined
  }
})

const { t } = useI18n()
const { dateTime, duration, number } = useSpeedFormat()

/** A score shared with a group that nobody has been named on yet */
const needsAthletes = computed(() => props.result.group != null && props.result.participants.length === 0)
</script>

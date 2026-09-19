<template>
  <router-link
    class="grid grid-cols-[auto_5rem] grid-rows-[auto_auto] rounded border border-line bg-surface hover:bg-elevated p-2 gap-x-2"
    :to="to ?? { name: 'speed-details', params: { id: result.id } }"
  >
    <span class="col-start-1 row-start-1 font-bold truncate">
      {{ result.name ?? result.eventDefinition.name }}
    </span>
    <span class="col-start-1 row-start-2 text-muted text-sm truncate">
      <template v-if="result.name">{{ result.eventDefinition.name }} &middot; </template>
      {{ duration(result.eventDefinition.totalDuration) }} &middot;
      <time :datetime="new Date(result.createdAt).toISOString()">{{ dateTime(result.createdAt) }}</time>
    </span>

    <span class="col-start-2 row-span-2 flex flex-col justify-center items-center">
      <span class="text-3xl font-bold leading-none">{{ number(result.count) }}</span>
      <span class="text-muted text-xs">{{ t('speed.steps') }}</span>
    </span>
  </router-link>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import useSpeedFormat from '../hooks/useSpeedFormat'

import type { PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { SpeedResultBaseFragment } from '../graphql/generated/graphql'

defineProps({
  result: {
    type: Object as PropType<SpeedResultBaseFragment>,
    required: true
  },
  /** Where the box links, the result's own page unless something else is given */
  to: {
    type: Object as PropType<RouteLocationRaw>,
    default: undefined
  }
})

const { t } = useI18n()
const { dateTime, duration, number } = useSpeedFormat()
</script>

<template>
  <router-link
    class="
      block grid grid-cols-[auto,4rem] grid-rows-3
      rounded border border-gray-300 hover:bg-gray-200
      p-2
    "
    :to="`/speed/${result.id}`"
    @click="$emit('navigate')"
  >
    <span class="col-start-2 row-span-3 flex justify-center items-center">{{ result.count }}</span>

    <span class="col-start-1 row-start-1 font-bold">
      {{ result.eventDefinition.name }}
    </span>
    <span class="col-start-1">{{ formatDateTime(result.createdAt) }}</span>
    <span class="col-start-1">{{ result.name }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { formatDateTime } from '../helpers'

import type { PropType } from 'vue'
import type { SpeedResult } from '../graphql/generated/graphql'

defineProps({
  result: {
    type: Object as PropType<Pick<SpeedResult, 'id' | 'name' | 'createdAt' | 'count' | 'eventDefinition'>>,
    required: true
  }
})

const a = 1
</script>

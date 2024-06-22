
<template>
  <div v-if="loading" class="flex items-center justify-center flex-col">
    <icon-loading class="animate-spin w-32 h-32" />
    Loading tricks...
  </div>
  <template v-for="(trickTypes, level) of sorted" v-else-if="numTricks" :key="`tt-${level}`">
    <h2 class="trick-level mx-auto w-32 px-4 mt-6 text-3xl font-bold relative text-center">
      Level {{ level }}
    </h2>
    <template v-for="(group, trickType) of trickTypes" :key="`tt-${level}-${trickType}`">
      <template v-if="group.length">
        <h3 class="mx-auto text-center px-4 text-2xl mt-4">
          {{ trickType }}
        </h3>
        <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
          <trick-box v-for="trick of group" :key="trick.id" :enable-checklist="enableChecklist" :completed="checklist.has(trick.id)" :trick="trick" />
        </div>
      </template>
    </template>
  </template>
  <div v-else class="flex items-center justify-center flex-col">
    <icon-confused class="w-32 h-32" />
    Oops! We couldn't find any tricks with the given filters.
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { TrickType } from '../graphql/generated/graphql'
import { trickSorter } from '../helpers'

import IconLoading from '~icons/mdi/loading'
import IconConfused from '~icons/mdi/map-marker-question-outline'
import TrickBox from './TrickBox.vue'

import type { PropType } from 'vue'
import type { TricksQuery } from '../graphql/generated/graphql'

const props = defineProps({
  tricks: {
    type: Array as PropType<Readonly<TricksQuery['tricks']> | TricksQuery['tricks']>,
    required: false,
    default: () => []
  },
  checklist: {
    type: Set as PropType<Set<string>>,
    default: new Set()
  },
  loading: {
    type: Boolean,
    default: false
  },
  hideCompleted: {
    type: Boolean,
    default: false
  },
  enableChecklist: {
    type: Boolean,
    default: false
  }
})

const sorted = computed(() => {
  const sorted: Record<string, Record<TrickType, TricksQuery['tricks']>> = {}
  let dataTricks = [...props.tricks ?? []]
  if (props.hideCompleted) dataTricks = dataTricks.filter(t => !props.checklist.has(t.id))
  dataTricks.sort(trickSorter)
  for (const trick of dataTricks) {
    const level = trick.ttLevels[0]?.level
    const trickType = trick.trickType
    if (!sorted[level]) sorted[level] = Object.fromEntries(Object.values(TrickType).sort((a, b) => a.localeCompare(b)).map(type => [type, []])) as unknown as Record<TrickType, Array<TricksQuery['tricks'][number]>>
    sorted[level][trickType].push(trick)
  }
  return sorted
})

const numTricks = computed(() => props.tricks?.length)
</script>

<style scoped>
.trick-level:before,
.trick-level:after {
  content: " ";
  @apply border-b-2;
  @apply border-gray-300;
  @apply absolute;
  width: 100%;
  max-width: 20vw;
  top: 50%;
}

.trick-level:before {
  right: 100%;
}

.trick-level:after {
  left: 100%;
}

.trick-level+h3 {
  @apply mt-0;
}
</style>

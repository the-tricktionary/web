
<template>
  <div v-if="loading" class="flex items-center justify-center flex-col">
    <icon-loading class="animate-spin w-32 h-32" />
    Loading tricks...
  </div>
  <template v-else-if="numTricks" v-for="(trickTypes, level) of tricks" :key="`tt-${level}`">
    <h2 class="trick-level mx-auto w-32 px-4 mt-6 text-3xl font-bold relative text-center">Level {{ level }}</h2>
    <template v-for="(tricks, trickType) of trickTypes" :key="`tt-${level}-${trickType}`">
      <template v-if="tricks.length">
        <h3 class="mx-auto text-center px-4 text-2xl mt-4">{{ trickType }}</h3>
        <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
          <trick-box :completed="completed.has(trick.id)" :trick="trick" v-for="trick of tricks" :key="trick.id" />
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
import { computed, defineProps, watch } from 'vue'
import { useResult } from '@vue/apollo-composable'

import { Discipline, TrickType, useTricksQuery } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'

import IconLoading from 'virtual:vite-icons/mdi/loading'
import IconConfused from 'virtual:vite-icons/mdi/map-marker-question-outline'
import TrickBox from './TrickBox.vue'

import type { PropType } from 'vue'
import type { TricksQuery } from '../graphql/generated/graphql'
import { trickSorter } from '../helpers'

const props = defineProps({
  discipline: {
    type: String as PropType<Discipline>,
    default: Discipline.SingleRope
  }
})
const { user } = useAuth({ withChecklist: true })

const tricksQuery = useTricksQuery({
  discipline: props.discipline,
  withLocalised: !!user.value?.lang,
  lang: user.value?.lang
})
const { loading } = tricksQuery

watch(props, () => {
  tricksQuery.variables.value.discipline = props.discipline
})
watch(user, user => {
  if (user?.lang) {
    tricksQuery.variables.value.withLocalised = true
    tricksQuery.variables.value.lang = user?.lang
  } else {
    tricksQuery.variables.value.withLocalised = false
  }
})

const tricks = useResult(tricksQuery.result, null, data => {
  const tricks: { [level: string]: Record<TrickType, Array<TricksQuery['tricks'][number]>> } = {}
  const dataTricks = [...data.tricks]
  dataTricks.sort(trickSorter)
  for (const trick of dataTricks) {
    const level = trick.ttLevels[0]?.level
    const trickType = trick.trickType
    if (!tricks[level]) tricks[level] = Object.fromEntries(Object.values(TrickType).sort((a, b) => a.localeCompare(b)).map(type => [type, []])) as unknown as Record<TrickType, Array<TricksQuery['tricks'][number]>>
    tricks[level][trickType].push(trick)
  }
  return tricks
})

const numTricks = useResult(tricksQuery.result, 0, data => data.tricks.length)

const completed = computed(() => {
  return new Set(user.value?.checklist?.map(checklistItem => checklistItem.trick.id))
})
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

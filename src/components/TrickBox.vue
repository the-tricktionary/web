<template>
  <div
    class="grid"
    :class="{ 'border-green-500': completed, 'grid-cols-[3rem,auto]': user }"
  >
    <label
      v-if="user"
      class="cursor-pointer flex rounded-l h-full border border-r-0 border-gray-300 hover:bg-gray-200 items-center justify-center"
      :class="{ 'bg-green-500': completed, 'border-green-500': completed, 'hover:bg-green-300': completed, 'bg-green-300': loading }"
      aria-label="Completed Trick"
    >
      <icon-loading class="text-white animate-spin" v-if="loading" />
      <icon-check class="text-white" v-else />
      <input @click="completeTrick()" type="checkbox" class="hidden" :checked="completed" :disabled="!user || loading">
    </label>
    <router-link
      class="flex rounded-r border border-gray-300 p-2 items-center justify-center text-center hover:bg-gray-200"
      :class="{ 'border-green-500': completed, 'rounded-l': !user }"
      :to="`/trick/${discipline}/${trick.slug}`"
    >
      {{ trick.localised?.name ?? trick.en?.name }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, toRef } from 'vue'

import { disciplineToSlug } from "../helpers";
import useAuth from '../hooks/useAuth'

import IconCheck from 'virtual:vite-icons/mdi/check'
import IconLoading from 'virtual:vite-icons/mdi/loading'

import type { PropType } from 'vue'
import type { MeQuery, MeQueryVariables, TricksQuery } from '../graphql/generated/graphql'
import useCompleteTrick from '../hooks/useCompleteTrick';

const props = defineProps({
  trick: {
    required: true,
    type: Object as PropType<TricksQuery['tricks'][number]>
  },
  completed: {
    type: Boolean as PropType<boolean>,
    default: false
  }
})

const trick = toRef(props, 'trick')
const completed = toRef(props, 'completed')

const user = useAuth()
const discipline = ref(disciplineToSlug(trick.value.discipline))

const { mutate: completeTrick, loading } = useCompleteTrick({
  trickId: toRef(trick.value, 'id'),
  completed: completed
})
</script>

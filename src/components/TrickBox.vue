<template>
  <div
    class="grid"
    :class="{ 'border-green-500': completed, 'grid-cols-[3rem_auto]': enableChecklist }"
  >
    <label
      v-if="enableChecklist"
      class="cursor-pointer flex rounded-l h-full border border-r-0 border-gray-300 hover:bg-gray-200 items-center justify-center focus-within:outline-2 focus-within:outline-solid focus-within:outline-ttred-900 focus-within:outline-offset-2"
      :class="{
        'bg-green-500': completed,
        'border-green-500': completed,
        'hover:bg-green-300': completed,
        'bg-green-300': loading
      }"
    >
      <icon-loading v-if="loading" class="text-white animate-spin" aria-hidden="true" />
      <icon-check v-else class="text-white" aria-hidden="true" />
      <input
        type="checkbox"
        class="sr-only"
        :checked="completed"
        :disabled="!enableChecklist || loading"
        :aria-busy="loading"
        @change="completeTrick(($event.target as HTMLInputElement).checked)"
      >
      <span class="sr-only">Completed: {{ trick.localised?.name ?? trick.en?.name }}</span>
    </label>
    <router-link
      class="flex rounded-r border border-gray-300 p-2 items-center justify-center text-center hover:bg-gray-200"
      :class="{
        'border-green-500': completed,
        'rounded-l': !enableChecklist,
        'pr-[3rem]': enableChecklist
      }"
      :to="`/trick/${discipline}/${trick.slug}`"
      @click="$emit('navigate')"
    >
      {{ trick.localised?.name ?? trick.en?.name }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'

import { disciplineToSlug } from '../helpers'

import IconCheck from '~icons/mdi/check'
import IconLoading from '~icons/mdi/loading'

import type { PropType } from 'vue'
import type { TricksQuery } from '../graphql/generated/graphql'
import useCompleteTrick from '../hooks/useCompleteTrick'

const props = defineProps({
  trick: {
    type: Object as PropType<TricksQuery['tricks'][number]>,
    required: true
  },
  completed: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  enableChecklist: {
    type: Boolean,
    default: false
  }
})

defineEmits<{
  navigate: []
}>()

const trick = toRef(props, 'trick')
const completed = toRef(props, 'completed')

const discipline = ref(disciplineToSlug(trick.value.discipline))

const { mutate: completeTrickMutate, loading } = useCompleteTrick()

async function completeTrick (completed?: boolean) {
  if (!trick.value) return
  if (typeof completed !== 'boolean') return
  await completeTrickMutate({
    trickId: trick.value.id,
    completed
  })
}
</script>

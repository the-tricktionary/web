<template>
  <div
    class="grid"
    :class="{ 'border-green-500': completed, 'grid-cols-[3rem,auto]': user }"
  >
    <label
      v-if="user"
      class="cursor-pointer flex rounded-l h-full border border-r-0 rounded-l border-gray-300 hover:bg-gray-200 items-center justify-center"
      :class="{ 'bg-green-500': completed, 'border-green-500': completed, 'hover:bg-green-300': completed, 'bg-green-300': loading }"
      aria-label="Completed Trick"
    >
      <icon-loading class="text-white spin" v-if="loading" />
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
import { MeDocument, useCompleteTrickMutation } from "../graphql/generated/graphql";

import { disciplineToSlug } from "../helpers";
import useAuth from '../hooks/useAuth'

import IconCheck from 'virtual:vite-icons/mdi/check'
import IconLoading from 'virtual:vite-icons/mdi/loading'

import type { PropType } from 'vue'
import type { MeQuery, MeQueryVariables, TricksQuery } from '../graphql/generated/graphql'

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

const { loading, mutate: completeTrick } = useCompleteTrickMutation(() => ({
  variables: { trickId: trick.value.id, completed: !completed.value },
  update (cache, { data }) {
    const cachedData = cache.readQuery<MeQuery, MeQueryVariables>({ query: MeDocument, variables: { withChecklist: true } })

    if (cachedData?.me?.checklist?.length) {
      const checklist = [...cachedData.me.checklist]
      if (data?.deleteTrickCompletion) {
        const cachedIdx = cachedData.me.checklist.findIndex(tc => tc.id === data.deleteTrickCompletion?.id)
        checklist.splice(cachedIdx, 1)
      }
      if (data?.createTrickCompletion?.id) {
        checklist.push(data.createTrickCompletion)
      }

      cache.writeQuery<Partial<MeQuery> | null, MeQueryVariables>({
        query: MeDocument,
        variables: { withChecklist: true },
        data: { me: { id: cachedData?.me?.id, checklist } }
      })
    }
  }
}))
</script>

<style scoped>
.spin {
  animation-name: spin;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes spin {
  from {
    transform:rotate(0deg);
  }
  to {
    transform:rotate(360deg);
  }
}
</style>

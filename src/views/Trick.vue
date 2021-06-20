
<template>
  <div v-if="loading" class="container mx-auto flex items-center justify-center flex-col">
    <icon-loading class="animate-spin w-32 h-32" />
    Loading trick...
  </div>
  <div v-else-if="trick" class="grid grid-cols-1 lg:grid-cols-[4fr,1fr] gap-4 container mx-auto px-2 py-4 mb-20">
    <div>
      <div class="mb-4">
        <h1 class="text-4xl font-semibold">{{ trick.localised?.name ?? trick.en?.name }}</h1>

        <p class="text-gray-600 font-semibold">
          <span class="inline-flex items-center">
            {{ trick.trickType }}
            &mdash; IJRU Level {{ trick.ijruLevels[0]?.level }}
            <icon-check-all v-if="trick.ijruLevels[0]?.verificationLevel === VerificationLevel.Official" />
            <icon-check v-else-if="trick.ijruLevels[0]?.verificationLevel === VerificationLevel.Judge" />
          </span>
        </p>

        <p v-if="trick.localised?.alternativeNames ?? trick.en?.alternativeNames">
          Alternative names: {{ formatList(trick.en?.alternativeNames ?? [], trick.localised?.alternativeNames) }}
        </p>
      </div>

      <videos v-if="trick.videos" :videos="trick.videos"/>

      <div class="my-4">
        <p>
          {{ trick.localised?.description ?? trick.en?.description }}
        </p>
      </div>
    </div>

    <div class="flex flex-col">
      <div v-if="trick.prerequisiteFor.length">
        <h2 class="mb-4 text-2xl font-semibold relative">Next</h2>
        <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <trick-box :completed="completed.has(prereq.id)" :trick="prereq" v-for="prereq of trick.prerequisiteFor" :key="prereq.id" />
        </div>
      </div>

      <div v-if="trick.prerequisites.length">
        <h2 class="w-32 mb-4 text-2xl font-semibold relative" :class="{ 'mt-6': trick.prerequisiteFor.length }">Previous</h2>
        <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <trick-box :completed="completed.has(prereq.id)" :trick="prereq" v-for="prereq of trick.prerequisites" :key="prereq.id" />
        </div>
      </div>
    </div>
  </div>

  <div class="bg-white fixed bottom-0 border-t border-gray-300 w-full p-2">
    <div class="container mx-auto mx-auto flex justify-between gap-4 overflow-x-auto">
      <router-link to="/">
        <icon-button class="btn inline-flex items-center mt-0 w-max">
          <template #icon>
            <icon-chevron-left />
          </template>
          All Tricks
        </icon-button>
      </router-link>

      <div class="<md:hidden flex-grow"></div>

      <label
        v-if="user && trick"
        class="grid rounded cursor-pointer grid-cols-[3rem,auto] bg-gray-300 hover:bg-ttyellow-300"
      >
        <input @click="completeTrick()" type="checkbox" class="hidden" :checked="completed.has(trick.id)" :disabled="mutating">
        <div
          class="flex rounded-l h-full items-center justify-center"
          :class="{
            'bg-green-500': completed.has(trick.id),
            'bg-green-300': mutating
          }"
        >
          <icon-loading class="text-white animate-spin" v-if="mutating" />
          <icon-check class="text-white" v-else-if="completed.has(trick.id)" />
          <icon-close class="text-black" v-else />
        </div>
        <div class="flex px-2 items-center">Completed</div>
      </label>

      <icon-button
        v-if="canShare"
        :disabled="!trick"
        @click="share()"
        class="w-max btn inline-flex items-center mt-0"
      >
        <template #icon>
          <icon-share />
        </template>
        Share
      </icon-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { useResult } from '@vue/apollo-composable'
import { getAnalytics, logEvent } from '@firebase/analytics'
import { useHead } from '@vueuse/head'

import { useTrickBySlugQuery, VerificationLevel } from '../graphql/generated/graphql'
import { slugToDiscipline, trickSorter } from '../helpers'
import useAuth from '../hooks/useAuth'
import useCompleteTrick from '../hooks/useCompleteTrick'

import Videos from '../components/Videos.vue'
import IconLoading from 'virtual:vite-icons/mdi/loading'
import IconShare from 'virtual:vite-icons/mdi/share'
import IconChevronLeft from 'virtual:vite-icons/mdi/chevron-left'
import IconCheck from 'virtual:vite-icons/mdi/check'
import IconClose from 'virtual:vite-icons/mdi/close'
import IconCheckAll from 'virtual:vite-icons/mdi/check-all'
import TrickBox from '../components/TrickBox.vue'
import IconButton from '../components/IconButton.vue'

import type { Ref } from 'vue'

const route = useRoute()
const router = useRouter()
const analytics = getAnalytics()
const discipline = ref(slugToDiscipline(route.params.discipline as string))

const { user } = useAuth({ withChecklist: true })
const trickQuery = useTrickBySlugQuery({
  discipline: discipline,
  slug: route.params.slug,
  withLocalised: !!user.value?.lang,
  lang: user.value?.lang
})
const { loading } = trickQuery
const trick = useResult(trickQuery.result, null, data => data.trick)

const enListFormater = new Intl.ListFormat('en', { style: 'long', type: 'disjunction' })

function formatList (en: string[], local?: string[] | null) {
  if (user.value?.lang && local) {
    const localFormatter = new Intl.ListFormat(user.value.lang, { style: 'long', type: 'disjunction' })
    return localFormatter.format(local)
  }
  return enListFormater.format(en)
}

const { mutate: completeTrick, loading: mutating } = useCompleteTrick({
  trickId: toRef(trick.value ?? { id: null }, 'id') as Ref<string>,
  completed: computed(() => completed.value.has(trick.value!.id))
})

useHead({
  title: computed(() => trick.value ? `${trick.value.localised?.name ?? trick.value.en?.name} | the Tricktionary` : 'the Tricktionary')
})

watch(user, user => {
  if (user?.lang) {
    trickQuery.variables.value.withLocalised = true
    trickQuery.variables.value.lang = user?.lang
  } else {
    trickQuery.variables.value.withLocalised = false
  }
})

onBeforeRouteUpdate((to, from) => {
  if (to.name === from.name) {
    trickQuery.variables.value.discipline = slugToDiscipline(to.params.discipline as string)
    trickQuery.variables.value.slug = to.params.slug as string
  }
})

trickQuery.onResult(({ data }) => {
  if (!data.trick) {
    router.push({
      name: 'not_found',
      params: { catchAll: route.fullPath.substring(1).split('/') },
      query: route.query,
      hash: route.hash
    })
  } else {
    console.log(data.trick.id)
    // the android app uses this event, so so do we
    logEvent(analytics, 'view_trick', {
      trick_name: data.trick.en?.name,
      user: user.value?.id
    })

    // // sort prereqs
    // trick.value?.prerequisites.sort(trickSorter)
    // trick.value?.prerequisiteFor.sort(trickSorter)
  }
})

const canShare = ref('share' in navigator)

async function share () {
  if (!canShare.value) return false
  const result = await navigator.share({
    title: `the Tricktionary - ${trick.value?.localised?.name ?? trick.value?.en?.name}`,
    text: 'Check out this trick on the Tricktionary',
    url: `${window.location.origin}${route.path}?utm_source=webshare&utm_medium=referral`
  })
}

const completed = computed(() => {
  return new Set(user.value?.checklist?.map(checklistItem => checklistItem.trick.id))
})
</script>

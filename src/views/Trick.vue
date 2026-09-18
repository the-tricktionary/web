<template>
  <div v-if="loading" class="container mx-auto flex items-center justify-center flex-col" role="status">
    <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
    Loading trick...
  </div>
  <div v-else-if="trick" class="grid grid-cols-1 lg:grid-cols-[4fr_1fr] gap-4 container mx-auto px-2 py-4 mb-20">
    <div>
      <div class="mb-4">
        <h1>{{ trick.localised?.name ?? trick.en?.name }}</h1>

        <p class="text-muted font-semibold">
          <span class="inline-flex items-center">
            {{ trick.trickType }}
            <template v-if="level">
              &mdash; {{ level.ruleset.name }} Level {{ level.level }}
              <level-verification v-if="level.verificationLevel" :level="level.verificationLevel" />
            </template>
          </span>
        </p>

        <p v-if="trick.localised?.alternativeNames ?? trick.en?.alternativeNames">
          Alternative names: {{ formatList(trick.en?.alternativeNames ?? [], trick.localised?.alternativeNames) }}
        </p>
      </div>

      <videos
        v-if="trick.videos"
        :videos="trick.videos"
        :trick-id="trick.id"
        :title="trick.localised?.name ?? trick.en?.name"
      />

      <div class="my-4">
        <p>
          {{ trick.localised?.description ?? trick.en?.description }}
        </p>
      </div>
    </div>

    <div class="flex flex-col">
      <trick-levels :levels="trick.levels" class="mb-6" />

      <div v-if="trick.prerequisiteFor.length">
        <h2 class="mb-4 text-2xl font-semibold relative">
          Next
        </h2>
        <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <trick-box
            v-for="prereq of trick.prerequisiteFor"
            :key="prereq.id"
            :enable-checklist="!!user"
            :completed="completed.has(prereq.id)"
            :trick="prereq"
            @navigate="viewNext(prereq)"
          />
        </div>
      </div>

      <div v-if="trick.prerequisites.length">
        <h2 class="w-32 mb-4 text-2xl font-semibold relative" :class="{ 'mt-6': trick.prerequisiteFor.length }">
          Previous
        </h2>
        <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <trick-box
            v-for="prereq of trick.prerequisites"
            :key="prereq.id"
            :enable-checklist="!!user"
            :completed="completed.has(prereq.id)"
            :trick="prereq"
            @navigate="viewPrevious(prereq)"
          />
        </div>
      </div>
    </div>
  </div>

  <bottom-bar>
    <router-link to="/" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">All Tricks</span>
    </router-link>

    <icon-checkbox
      v-if="user && trick"
      :checked="completed.has(trick.id)"
      :disabled="mutating"
      :loading="mutating"
      @update:checked="completeTrick($event)"
    >
      Completed
    </icon-checkbox>

    <icon-button
      v-if="canShare"
      :disabled="!trick"
      class="w-max btn inline-flex items-center mt-0"
      @click="share()"
    >
      <template #icon>
        <icon-share />
      </template>
      Share
    </icon-button>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { getAnalytics, logEvent } from '@firebase/analytics'
import { useHead } from '@vueuse/head'

import { type Discipline, useTrickBySlugQuery } from '../graphql/generated/graphql'
import { slugToDiscipline } from '../helpers'
import useAuth from '../hooks/useAuth'
import useCompleteTrick from '../hooks/useCompleteTrick'
import useRuleset from '../hooks/useRuleset'

import Videos from '../components/Videos.vue'
import IconLoading from '~icons/mdi/loading'
import IconShare from '~icons/mdi/share'
import IconChevronLeft from '~icons/mdi/chevron-left'
import TrickBox from '../components/TrickBox.vue'
import LevelVerification from '../components/LevelVerification.vue'
import IconButton from '../components/IconButton.vue'

import type { TrickBoxFragment } from '../graphql/generated/graphql'
import IconCheckbox from '../components/IconCheckbox.vue'
import BottomBar from '../components/BottomBar.vue'
import TrickLevels from '../components/TrickLevels.vue'

const route = useRoute()
const router = useRouter()
const analytics = getAnalytics()
const discipline = ref(slugToDiscipline(route.params.discipline as string))

const { user } = useAuth({ withChecklist: true })
const trickQuery = useTrickBySlugQuery({
  discipline: discipline as unknown as Discipline,
  slug: route.params.slug as string,
  withLocalised: !!user.value?.lang && user.value?.lang !== 'en',
  lang: !!user.value?.lang && user.value?.lang !== 'en' ? user.value.lang : undefined
})
const { loading } = trickQuery
const trick = computed(() => trickQuery.result.value?.trick)

const { ruleset } = useRuleset()
/** This trick's level in the ruleset the user follows, if it has one */
const level = computed(() => trick.value?.levels.find(level => level.rulesId === ruleset.value?.id))

const enListFormater = new Intl.ListFormat('en', { style: 'long', type: 'disjunction' })

function formatList (en: string[], local?: string[] | null) {
  if (user.value?.lang && local) {
    const localFormatter = new Intl.ListFormat(user.value.lang, { style: 'long', type: 'disjunction' })
    return localFormatter.format(local)
  }
  return enListFormater.format(en)
}

const { mutate: completeTrickMutate, loading: mutating } = useCompleteTrick()

async function completeTrick (completed?: boolean) {
  if (!trick.value) return
  if (typeof completed !== 'boolean') return
  await completeTrickMutate({
    trickId: trick.value?.id,
    completed
  })
}

useHead({
  title: computed(() => trick.value ? `${trick.value.localised?.name ?? trick.value.en?.name} | the Tricktionary` : 'the Tricktionary')
})

watch(user, user => {
  if (user?.lang) {
    trickQuery.variables.value!.withLocalised = true
    trickQuery.variables.value!.lang = user?.lang
  } else {
    trickQuery.variables.value!.withLocalised = false
  }
})

onBeforeRouteUpdate((to, from) => {
  if (to.name === from.name) {
    const discipline = slugToDiscipline(to.params.discipline as string)
    trickQuery.variables.value!.discipline = discipline
    trickQuery.variables.value!.slug = to.params.slug as string
  }
})

trickQuery.onResult(({ data }) => {
  if (!data) return
  if (!data.trick) {
    void router.push({
      name: 'not_found',
      params: { catchAll: route.fullPath.substring(1).split('/') },
      query: route.query,
      hash: route.hash
    })
  } else {
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
  await navigator.share({
    title: `the Tricktionary - ${trick.value?.localised?.name ?? trick.value?.en?.name}`,
    text: 'Check out this trick on the Tricktionary',
    url: `${window.location.origin}${route.path}?utm_source=webshare&utm_medium=referral`
  })
  logEvent(analytics, 'share', {
    item_id: `Trick:${trick.value?.id}`
  })
}

const completed = computed(() => {
  return new Set(user.value?.checklist?.map(checklistItem => checklistItem.trick.id))
})

// the andoird app tracks these events, so we do too
function viewNext (trick: TrickBoxFragment) {
  logEvent(analytics, 'view_next_trick', {
    next_trick: trick.en?.name ?? trick.slug
  })
}
function viewPrevious (trick: TrickBoxFragment) {
  logEvent(analytics, 'view_prereq', {
    prereq: trick.en?.name ?? trick.slug
  })
}
</script>

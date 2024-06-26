
<template>
  <discipline-selector v-model:discipline="discipline" />
  <links />

  <bottom-bar>
    <input
      v-model="search"
      type="search"
      placeholder="Search tricks"
      class="rounded focus:border-b-ttred-900 border-gray-300 flex-grow"
    >

    <icon-checkbox
      v-model:checked="settings.hideCompleted"
      class="w-max whitespace-nowrap"
      :class="{ hidden: !user }"
    >
      Hide Completed
    </icon-checkbox>

    <!-- TODO: language select -->
  </bottom-bar>

  <div class="container mx-auto p-2">
    <trick-list
      :tricks="tricks"
      :checklist="checklist"
      :loading="tricksQuery.loading.value"
      :hide-completed="settings.hideCompleted"
      :enable-checklist="!!user"
    />
  </div>


  <ad-adsense />
  <about />

  <tt-footer class="mb-14" />
</template>

<script setup lang="ts">
import { ref, watch , computed } from 'vue'
import { getAnalytics, logEvent } from '@firebase/analytics'

import TrickList from '../components/TrickList.vue'
import DisciplineSelector from '../components/DisciplineSelector.vue'
import About from '../components/About.vue'
import TtFooter from '../components/Footer.vue'
import Links from '../components/Links.vue'
import IconCheckbox from '../components/IconCheckbox.vue'

import { Discipline, useTricksQuery } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useSettings from '../hooks/useSettings'
import AdAdsense from '../components/AdAdsense.vue'
import { useDebounce } from '@vueuse/core'

import BottomBar from '../components/BottomBar.vue'

const discipline = ref<Discipline>()
const settings = useSettings()
const analytics = getAnalytics()
const { firebaseUser, user } = useAuth({ withChecklist: true })

const tricksQuery = useTricksQuery({
  discipline: discipline.value,
  withLocalised: !!user.value?.lang && user.value?.lang !== 'en',
  lang: !!user.value?.lang && user.value?.lang !== 'en' ? user.value.lang : undefined
})
const tricks = computed(() => tricksQuery.result.value?.tricks ?? [])
const checklist = ref<Set<string>>(new Set())
const search = ref<string | undefined>(undefined)
const debouncedSearch = useDebounce(search, 1000)

watch(discipline, discipline => {
  tricksQuery.variables.value!.discipline = discipline ?? Discipline.SingleRope
})
watch(user, user => {
  if (user?.lang && user.lang !== 'en') {
    tricksQuery.variables.value!.withLocalised = true
    tricksQuery.variables.value!.lang = user?.lang
  } else {
    tricksQuery.variables.value!.withLocalised = false
    tricksQuery.variables.value!.lang = undefined
  }
  checklist.value = new Set(user?.checklist?.map(checklistItem => checklistItem.trick.id))
})
watch(debouncedSearch, search => {
  console.log(search)
  if (search?.trim() === '') tricksQuery.variables.value!.searchQuery = null
  else tricksQuery.variables.value!.searchQuery = search
})

// The android app does this
logEvent(analytics, 'view_tricktionary', {
  user: firebaseUser.value?.uid ?? 'Guest'
})
</script>

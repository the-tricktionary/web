
<template>
  <discipline-selector v-model:discipline="discipline" />
  <links />

  <div class="container mx-auto p-2">
    <trick-list
      :tricks="tricks"
      :checklist="checklist"
      :loading="tricksQuery.loading.value"
      :hide-completed="settings.hideCompleted"
      :enable-checklist="!!user"
    />
  </div>

  <div class="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-300 py-2">
    <div class="container mx-auto px-2">
      <icon-checkbox v-model:checked="settings.hideCompleted" class="w-max">
        Hide Completed
      </icon-checkbox>
    </div>
    <!-- TODO: serach -->
    <!-- TODO: language select -->
  </div>

  <ad-adsense />
  <about />

  <tt-footer class="mb-14" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getAnalytics, logEvent } from '@firebase/analytics'
import { useResult } from '@vue/apollo-composable'

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

import type { TricksQuery } from '../graphql/generated/graphql'

const discipline = ref<Discipline>()
const settings = useSettings()
const analytics = getAnalytics()
const { firebaseUser, user } = useAuth({ withChecklist: true })

const tricksQuery = useTricksQuery({
  discipline: discipline.value,
  withLocalised: !!user.value?.lang,
  lang: user.value?.lang
})
const tricks = useResult(tricksQuery.result, [] as TricksQuery['tricks'], data => data.tricks)
const checklist = ref<Set<string>>(new Set())

watch(discipline, discipline => {
  tricksQuery.variables.value.discipline = discipline ?? Discipline.SingleRope
})
watch(user, user => {
  if (user?.lang) {
    tricksQuery.variables.value.withLocalised = true
    tricksQuery.variables.value.lang = user?.lang
  } else {
    tricksQuery.variables.value.withLocalised = false
  }
  checklist.value = new Set(user?.checklist?.map(checklistItem => checklistItem.trick.id))
})

// The android app does this
logEvent(analytics, 'view_tricktionary', {
  user: firebaseUser.value?.uid ?? 'Guest'
})
</script>

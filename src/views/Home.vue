
<template>
  <discipline-selector v-model:discipline="discipline" />
  <links />
  <div class="container mx-auto p-2">
    <trick-list
      :tricks="tricks"
      :checklist="checklist"
      :loading="tricksQuery.loading.value"
    />
  </div>

  <ad-adsense />
  <about />

  <tt-footer />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getAnalytics, logEvent } from '@firebase/analytics'

import TrickList from '../components/TrickList.vue'
import DisciplineSelector from '../components/DisciplineSelector.vue'
import About from '../components/About.vue'
import TtFooter from '../components/Footer.vue'
import Links from '../components/Links.vue'

import { Discipline, useTricksQuery } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import AdAdsense from '../components/AdAdsense.vue'
import { useResult } from '@vue/apollo-composable'

import type { TricksQuery } from '../graphql/generated/graphql'

const discipline = ref<Discipline>()
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

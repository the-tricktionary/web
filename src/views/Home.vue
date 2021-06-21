
<template>
  <discipline-selector v-model:discipline="discipline" />
  <links />
  <div class="container mx-auto p-2">
    <trick-list :discipline="discipline" />
  </div>

  <ad-adsense />
  <about />

  <tt-footer />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getAnalytics, logEvent } from '@firebase/analytics'

import TrickList from '../components/TrickList.vue'
import DisciplineSelector from '../components/DisciplineSelector.vue'
import About from '../components/About.vue'
import TtFooter from '../components/Footer.vue'
import Links from '../components/Links.vue'

import type { Discipline } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import AdAdsense from '../components/AdAdsense.vue'

const discipline = ref<Discipline>()
const analytics = getAnalytics()
const { firebaseUser } = useAuth()

// The android app does this
logEvent(analytics, 'view_tricktionary', {
  user: firebaseUser.value?.uid ?? 'Guest'
})
</script>

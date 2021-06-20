
<template>
  <discipline-selector v-model:discipline="discipline" />
  <div class="container mx-auto p-2">
    <trick-list :discipline="discipline" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getAnalytics, logEvent } from '@firebase/analytics'

import TrickList from '../components/TrickList.vue'
import DisciplineSelector from '../components/DisciplineSelector.vue'

import type { Discipline } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'

const discipline = ref<Discipline>()
const analytics = getAnalytics()
const { firebaseUser } = useAuth()

// The android app does this
logEvent(analytics, 'view_tricktionary', {
  user: firebaseUser.value?.uid ?? 'Guest'
})
</script>

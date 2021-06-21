
<template>
  <discipline-selector v-model:discipline="discipline" />
  <div class="container mx-auto p-2">
    <trick-list :discipline="discipline" />
  </div>

  <footer class="py-2 mt-6 w-full border-t border-gray-300 dark:bg-gray-700">
    <p class="container p-2 mx-auto">
      <router-link to="/policies">
        Privacy policy, store policy
      </router-link>
    </p>
  </footer>
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

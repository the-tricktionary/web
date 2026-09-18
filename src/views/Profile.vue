<template>
  <div class="container mx-auto pt-4 px-2">
    <language-selector show-label class="mb-4" />

    <button class="btn" @click="signOut()">
      Sign out
    </button>
  </div>
</template>

<script setup lang="ts">
import { getAuth } from '@firebase/auth'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

import LanguageSelector from '../components/LanguageSelector.vue'
import useAuth from '../hooks/useAuth'

const auth = getAuth()
const { firebaseUser: user } = useAuth()
const router = useRouter()

watch(user, newUser => {
  if (!newUser) {
    void router.replace('/auth')
  }
})

async function signOut () {
  await auth.signOut()
}
</script>

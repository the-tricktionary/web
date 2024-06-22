<template>
  <div class="container mx-auto pt-4 px-2">
    <button class="btn" @click="signOut()">
      Sign out
    </button>
  </div>
</template>

<script setup lang="ts">
import { getAuth } from '@firebase/auth'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

import useAuth from '../hooks/useAuth'

const auth = getAuth()
const { firebaseUser: user } = useAuth()
const router = useRouter()

watch(user, newUser => {
  if (!newUser) {
    router.replace('/auth')
  }
})

async function signOut () {
  await auth.signOut()
}
</script>

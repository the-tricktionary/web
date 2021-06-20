<template>
  <button class="btn" @click="signOut()">Sign out</button>
</template>

<script setup lang="ts">
import { getAuth } from '@firebase/auth'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

import useAuth from '../hooks/useAuth'

const auth = getAuth()
const user = useAuth()
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

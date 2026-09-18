<template>
  <div class="container mx-auto pt-4 px-2">
    <button class="btn" @click="signOut()">
      Sign out
    </button>
  </div>
</template>

<script setup lang="ts">
import { getAuth } from '@firebase/auth'

const auth = getAuth()

async function signOut () {
  await auth.signOut()
}
</script>

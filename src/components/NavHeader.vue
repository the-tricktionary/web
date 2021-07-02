<template>
  <header class="border-b-ttred-900 bg-ttred-500 border-b sticky top-0 left-0 right-0 flex justify-between items-center py-1 px-2 whitespace-nowrap z-1000">
    <router-link to="/" class="inline-flex justify-start items-center text-white text-size-xl">
      <img src="/tricktionary2.svg" height="30" with="30" class="h-30px mr-1 align-bottom">
      the Tricktionary
    </router-link>

    <nav class="flex">
      <router-link exact-active-class="active" class="nav-link" to="/">Tricks</router-link>
      <!-- <router-link active-class="active" class="nav-link" to="/speed">Speed</router-link> -->
      <router-link active-class="active" class="nav-link" to="/shop">Shop</router-link>
      <router-link active-class="active" class="nav-link" to="/profile" v-if="user">Profile</router-link>
      <router-link active-class="active" class="nav-link" to="/auth" v-else>Sign in</router-link>
    </nav>
  </header>
</template>

<script setup lang="ts">
import useAuth from '../hooks/useAuth'

const { firebaseUser: user } = useAuth()
</script>

<style scoped>
.nav-link {
  @apply bg-ttred-900;
  @apply rounded;
  @apply m-1;
  @apply px-2;
  @apply py-1;
  color: white;
}

.nav-link:hover,
.nav-link.active {
  @apply bg-ttyellow-500;
  @apply text-black;
}
</style>

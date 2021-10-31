<template>
  <header ref="headerRef" class="border-b-ttred-900 bg-ttred-500 border-b sticky top-0 left-0 right-0 flex justify-between items-center py-1 px-2 whitespace-nowrap z-1000">
    <router-link to="/" class="inline-flex justify-start items-center text-white text-size-xl">
      <img src="/tricktionary2.svg" height="30" with="30" class="h-30px mr-1 align-bottom">
      the Tricktionary
    </router-link>

    <div class="flex sm:hidden">
      <a
        class="nav-link inline-flex items-center justify-center min-h-8 pointer-hand"
        @click="showNav = !showNav"
      ><icon-menu title="Toggle Menu" /></a>
    </div>
    <nav
      class="flex <sm:absolute <sm:top-12 <sm:right-0 <sm:left-0 <sm:flex-col"
      :class="{
        '<sm:hidden': !showNav,
      }"
      @click="showNav = false"
    >
      <router-link exact-active-class="active" class="nav-block nav-link" to="/">Tricks</router-link>
      <router-link active-class="active" class="nav-block nav-link" to="/speed">Speed</router-link>
      <router-link active-class="active" class="nav-block nav-link" to="/shop">Shop</router-link>
      <router-link active-class="active" class="nav-block nav-link" to="/profile" v-if="user">Profile</router-link>
      <router-link active-class="active" class="nav-block nav-link" to="/auth" v-else>Sign in</router-link>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import useAuth from '../hooks/useAuth'

import IconMenu from 'virtual:vite-icons/mdi/menu'

const { firebaseUser: user } = useAuth()
const showNav = ref(false)
const headerRef = ref()

onClickOutside(headerRef, () => {
  showNav.value = false
})
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

@media (max-width: 639.9px) {
  .nav-block {
    @apply bg-ttred-500;
    @apply rounded-none;
    @apply m-0;
    @apply py-4;
    @apply border-t;
    @apply border-ttred-900;
  }
}

.nav-link:hover,
.nav-link.active {
  @apply bg-ttyellow-500;
  @apply text-black;
}
</style>

<template>
  <header ref="headerRef" class="border-b-ttred-900 bg-ttred-500 border-b sticky top-0 left-0 right-0 flex justify-between items-center py-1 px-2 whitespace-nowrap z-1000">
    <router-link to="/" class="inline-flex justify-start items-center text-white text-xl">
      <img src="/tricktionary2.svg" height="30" width="30" alt="" class="h-30px mr-1 align-bottom">
      the Tricktionary
    </router-link>

    <button
      type="button"
      class="nav-link sm:hidden inline-flex items-center justify-center min-h-8 cursor-pointer"
      :aria-expanded="showNav"
      aria-controls="main-nav"
      aria-label="Toggle menu"
      @click="showNav = !showNav"
    >
      <icon-close v-if="showNav" aria-hidden="true" />
      <icon-menu v-else aria-hidden="true" />
    </button>

    <nav
      id="main-nav"
      class="flex max-sm:absolute max-sm:top-full max-sm:inset-x-0 max-sm:flex-col max-sm:bg-ttred-500 max-sm:border-b max-sm:border-ttred-900"
      :class="{ 'max-sm:hidden': !showNav }"
      aria-label="Main"
      @click="showNav = false"
    >
      <router-link exact-active-class="active" class="nav-link" to="/">
        Tricks
      </router-link>
      <router-link active-class="active" class="nav-link" to="/speed">
        Speed
      </router-link>
      <router-link active-class="active" class="nav-link" to="/shop">
        Shop
      </router-link>
      <router-link v-if="user" active-class="active" class="nav-link" to="/profile">
        Profile
      </router-link>
      <router-link v-else active-class="active" class="nav-link" to="/auth">
        Sign in
      </router-link>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import useAuth from '../hooks/useAuth'

import IconMenu from '~icons/mdi/menu'
import IconClose from '~icons/mdi/close'

const { firebaseUser: user } = useAuth()
const showNav = ref(false)
const headerRef = ref<HTMLElement>()

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

/* Stacked full-width entries in the dropdown on narrow screens */
@media (max-width: 639.9px) {
  nav .nav-link {
    @apply rounded-none;
    @apply m-0;
    @apply py-4;
    @apply px-4;
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

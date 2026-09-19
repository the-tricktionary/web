<template>
  <header class="border-b-ttred-900 bg-ttred-500 border-b sticky top-0 left-0 right-0 flex justify-between items-center py-1 px-2 whitespace-nowrap z-1000">
    <router-link to="/" class="inline-flex justify-start items-center text-white text-xl">
      <img src="/tricktionary2.svg" height="30" width="30" alt="" class="h-30px mr-1 align-bottom">
      the Tricktionary
    </router-link>

    <nav class="flex" :aria-label="t('nav.label')">
      <router-link exact-active-class="active" class="nav-link" to="/">
        {{ t('nav.tricks') }}
      </router-link>
      <!-- <router-link active-class="active" class="nav-link" to="/speed">Speed</router-link> -->
      <router-link active-class="active" class="nav-link" to="/shop">
        {{ t('nav.shop') }}
      </router-link>
      <router-link v-if="user" active-class="active" class="nav-link" to="/profile">
        {{ t('nav.profile') }}
      </router-link>
      <router-link v-else active-class="active" class="nav-link" to="/auth">
        {{ t('nav.signIn') }}
      </router-link>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import useAuth from '../hooks/useAuth'

const { t } = useI18n()
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

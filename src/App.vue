<template>
  <nav-header />
  <router-view />
  <div
    id="bottom-bars"
    class="fixed bottom-0 right-0 left-0 flex flex-col"
  />
  <refresh-needed />
  <cookie-consent />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { useHead } from '@unhead/vue'
import { apolloClient } from './apollo'
import NavHeader from './components/NavHeader.vue'
import CookieConsent from './components/CookieConsent.vue'
import RefreshNeeded from './components/RefreshNeeded.vue'
import useLanguage from './hooks/useLanguage'

provide(DefaultApolloClient, apolloClient)

const { lang } = useLanguage()

useHead({
  htmlAttrs: { lang },
  titleTemplate: title => title ? `${title} | the Tricktionary` : 'the Tricktionary'
})
</script>

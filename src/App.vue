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
import { computed, provide, watch } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { useHead } from '@unhead/vue'
import { apolloClient } from './apollo'
import i18n from './i18n'
import NavHeader from './components/NavHeader.vue'
import CookieConsent from './components/CookieConsent.vue'
import RefreshNeeded from './components/RefreshNeeded.vue'
import useLanguage from './hooks/useLanguage'
import useTheme from './hooks/useTheme'
import useUiMessages from './hooks/useUiMessages'

provide(DefaultApolloClient, apolloClient)

const { lang } = useLanguage()
const { theme } = useTheme()
useUiMessages()

// null removes the attribute, leaving the scheme to the media query
const dataTheme = computed(() => theme.value?.toLowerCase() ?? null)

watch(lang, lang => {
  i18n.global.locale.value = lang
}, { immediate: true })

useHead({
  htmlAttrs: { lang, 'data-theme': dataTheme },
  titleTemplate: title => title ? `${title} | the Tricktionary` : 'the Tricktionary'
})
</script>

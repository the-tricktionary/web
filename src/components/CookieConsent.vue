<template>
  <bottom-bar v-if="cookie.granted.value === null" class="border-t bg-surface border-line py-4">
    <div class="container mx-auto px-2">
      <h2>{{ t('cookies.title') }}</h2>
      <i18n-t keypath="cookies.body" tag="p">
        <template #policy>
          <router-link to="/policies">
            {{ t('cookies.privacyPolicy') }}
          </router-link>
        </template>
      </i18n-t>
      <div class="flex gap-4 flex-wrap mt-2">
        <button
          id="accept-cookies"
          class="btn w-full sm:w-auto"
          @click="cookie.grant()"
        >
          {{ t('cookies.accept') }}
        </button>
        <button
          id="deny-cookies"
          class="btn w-full sm:w-auto"
          @click="cookie.deny()"
        >
          {{ t('cookies.deny') }}
        </button>
      </div>
    </div>
  </bottom-bar>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import useConsentCookie from '../hooks/useCookieConsent'
import BottomBar from './BottomBar.vue'

const { t } = useI18n()
const cookie = useConsentCookie()
</script>

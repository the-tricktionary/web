<template>
  <div class="container mx-auto pt-4 px-2">
    <language-selector show-label class="mb-4" />

    <button class="btn" @click="signOut()">
      {{ t('profile.signOut') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { getAuth } from '@firebase/auth'
import { useI18n } from 'vue-i18n'

import LanguageSelector from '../components/LanguageSelector.vue'

const { t } = useI18n()
const auth = getAuth()

async function signOut () {
  await auth.signOut()
}
</script>

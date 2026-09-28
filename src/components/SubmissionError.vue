<template>
  <p v-if="error" class="text-ttred-900 mb-0" role="alert">
    {{ error }}
  </p>
  <p v-else-if="uploadError" class="text-ttred-900 mb-0" role="alert">
    {{ t('submit.videoMissing', { error: uploadError }) }}
    <router-link :to="{ name: 'profile' }">
      {{ t('submit.seeSubmissions') }}
    </router-link>
  </p>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  error: string | null
  uploadError: string | null
}>()

const { t } = useI18n()
</script>

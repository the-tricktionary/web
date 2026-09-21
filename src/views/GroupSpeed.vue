<template>
  <p class="text-muted mb-0">
    {{ t('groups.comingSoon') }}
  </p>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

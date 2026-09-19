<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="mt-10">
      {{ t('notFound.title') }}
    </h1>
    <p>
      <router-link to="/">
        {{ t('notFound.goHome') }}
      </router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

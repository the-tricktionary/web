<template>
  <section class="container mx-auto px-2 mt-4">
    <h2>{{ t('about.title') }}</h2>

    <p>{{ t('about.sport') }}</p>

    <global-stats />

    <i18n-t keypath="about.apps" tag="p">
      <template #email>
        <a href="mailto:develop@the-tricktionary.com">develop@the-tricktionary.com</a>
      </template>
      <template #github>
        <a href="https://github.com/the-tricktionary" rel="noopener">GitHub</a>
      </template>
    </i18n-t>

    <p>{{ t('about.support') }}</p>
  </section>

  <links />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import GlobalStats from './GlobalStats.vue'
import Links from './Links.vue'

const { t } = useI18n()
</script>

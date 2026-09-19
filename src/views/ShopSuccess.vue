<template>
  <div class="container mx-auto px-2 py-4">
    <h1>{{ t('shop.title') }}</h1>

    <p>{{ t('shop.success.thanks') }}</p>

    <router-link to="/" class="btn inline-block w-max">
      {{ t('shop.success.backToTricks') }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
// TODO: fetch the checkout session and log the purchase to analytics
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

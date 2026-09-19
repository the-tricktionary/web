<template>
  <footer class="py-2 mt-6 w-full border-t border-line">
    <p class="container p-2 mx-auto">
      <router-link to="/policies">
        {{ t('footer.policies') }}
      </router-link>
    </p>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

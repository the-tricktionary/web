<template>
  <div>
    <p class="font-semibold mb-1">
      {{ t('groups.consent.title') }}
    </p>
    <ul class="list-disc pl-5 flex flex-col gap-1 mb-0">
      <li>{{ t('groups.consent.checklistVisible') }}</li>
      <li>{{ t('groups.consent.adminsCanTick') }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <ul class="list-none m-0 p-0 flex flex-wrap gap-x-4 gap-y-1 text-sm" :aria-label="t('speed.chart.series')">
    <li v-for="item of items" :key="item.label" class="inline-flex items-center gap-2">
      <span class="inline-block w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }" aria-hidden="true" />
      {{ item.label }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  items: Array<{ label: string, color: string }>
}>()

const { t } = useI18n()
</script>

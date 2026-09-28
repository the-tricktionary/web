<template>
  <div class="flex gap-2 items-center">
    <button
      type="button"
      class="btn w-max touch-target flex items-center justify-center"
      :aria-label="previousLabel"
      @click="emit('step', -1)"
    >
      <icon-chevron-left aria-hidden="true" />
    </button>
    <span aria-live="polite">{{ t('pager.counter', { current: index + 1, total }) }}</span>
    <button
      type="button"
      class="btn w-max touch-target flex items-center justify-center"
      :aria-label="nextLabel"
      @click="emit('step', 1)"
    >
      <icon-chevron-right aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import IconChevronLeft from '~icons/mdi/chevron-left'
import IconChevronRight from '~icons/mdi/chevron-right'

defineProps<{
  index: number
  total: number
  previousLabel: string
  nextLabel: string
}>()

const emit = defineEmits<{
  step: [by: number]
}>()

const { t } = useI18n()
</script>

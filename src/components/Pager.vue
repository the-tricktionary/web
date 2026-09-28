<template>
  <div class="flex gap-2 items-center">
    <button
      type="button"
      class="btn w-max touch-target flex items-center justify-center"
      :aria-label="previousLabel"
      @click="step(-1)"
    >
      <icon-chevron-left aria-hidden="true" />
    </button>
    <span aria-live="polite">{{ t('pager.counter', { current: index + 1, total }) }}</span>
    <button
      type="button"
      class="btn w-max touch-target flex items-center justify-center"
      :aria-label="nextLabel"
      @click="step(1)"
    >
      <icon-chevron-right aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import IconChevronLeft from '~icons/mdi/chevron-left'
import IconChevronRight from '~icons/mdi/chevron-right'

const { total } = defineProps<{
  total: number
  previousLabel: string
  nextLabel: string
}>()

const index = defineModel<number>('index', { required: true })

const { t } = useI18n()

/** Wraps around at both ends */
function step (by: number) {
  index.value = (index.value + by + total) % total
}
</script>

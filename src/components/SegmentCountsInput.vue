<template>
  <fieldset class="border-none p-0 m-0 flex flex-col gap-2" :disabled="disabled">
    <legend class="sr-only">
      {{ t('speed.create.perSegment') }}
    </legend>

    <label v-for="(segment, idx) of segments" :key="segment.index" class="flex gap-2 items-center">
      <span class="w-32 shrink-0 text-sm text-muted">
        {{ segment.label ?? t('speed.details.segmentN', { n: segment.index + 1 }) }}
      </span>
      <input
        :value="counts[idx] ?? ''"
        type="number"
        required
        min="0"
        step="1"
        inputmode="numeric"
        class="rounded flex-1"
        @input="assign(idx, ($event.target as HTMLInputElement).value)"
      >
    </label>

    <p class="text-muted text-sm mb-0">
      {{ total == null || total === sum
        ? t('speed.create.segmentSum', { sum: number(sum) })
        : t('speed.create.segmentSumMismatch', { sum: number(sum), total: number(total) }) }}
    </p>
  </fieldset>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import useSpeedFormat from '../hooks/useSpeedFormat'

/** Enough of a leg to label an input, from segmentsOf or from a score */
interface CountSegment {
  index: number
  label?: string | null
}

const props = withDefaults(defineProps<{
  /** The legs of the event, one input each */
  segments: readonly CountSegment[]
  /** What the legs have to add up to, while one has been entered */
  total?: number
  disabled?: boolean
}>(), {
  total: undefined,
  disabled: false
})

const counts = defineModel<Array<number | undefined>>({ required: true })

const { t } = useI18n()
const { number } = useSpeedFormat()

const sum = computed(() => counts.value.reduce<number>((steps, count) => steps + (Number.isSafeInteger(count) ? count! : 0), 0))

/** Keeps one entry per leg, so a missing one reads as missing rather than as a hole */
function assign (idx: number, value: string) {
  const next = props.segments.map((segment, index) => counts.value[index])
  next[idx] = value === '' ? undefined : Number(value)
  counts.value = next
}
</script>

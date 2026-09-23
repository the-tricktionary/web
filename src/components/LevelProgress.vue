<template>
  <li class="grid grid-cols-[auto_max-content] gap-x-4 gap-y-1 items-baseline">
    <span class="font-semibold">{{ label }}</span>
    <span class="text-muted tabular-nums">{{ text }}</span>
    <div
      class="col-span-2 h-2 rounded bg-sunken overflow-hidden"
      role="progressbar"
      :aria-label="label"
      :aria-valuenow="value"
      aria-valuemin="0"
      :aria-valuemax="max"
    >
      <div class="h-full rounded bg-success" :style="{ width: `${percent}%` }" />
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  text: string
  value: number
  max: number
}>()

const percent = computed(() => props.max > 0 ? Math.min(100, Math.round((props.value / props.max) * 100)) : 0)
</script>

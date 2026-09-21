<template>
  <div ref="rootRef" class="relative">
    <button
      :id="buttonId"
      type="button"
      class="w-full text-left rounded border border-field bg-surface text-content px-3 py-2 pr-10 leading-6 truncate disabled:bg-sunken disabled:text-muted disabled:cursor-default"
      :class="{ 'text-muted': !picked.length && !disabled }"
      :disabled="disabled"
      aria-haspopup="true"
      :aria-expanded="open"
      :aria-controls="panelId"
      :aria-labelledby="labelledby ? `${labelledby} ${buttonId}` : undefined"
      @click="open = !open"
      @keydown.escape.prevent="close()"
    >
      {{ summary }}
    </button>
    <icon-chevron-down class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" aria-hidden="true" />

    <div
      v-show="open"
      :id="panelId"
      class="absolute z-20 mt-1 w-full min-w-60 max-h-72 overflow-y-auto rounded border border-line bg-surface shadow-lg py-1"
      @keydown.escape.prevent="close()"
    >
      <template v-for="group of groups" :key="group.label ?? ''">
        <p v-if="group.label" class="text-muted text-sm px-3 pt-2 pb-0.5 mb-0">
          {{ group.label }}
        </p>
        <label
          v-for="option of group.options"
          :key="option.value"
          class="flex items-center gap-2 px-3 py-1.5 hover:bg-elevated cursor-pointer"
        >
          <input v-model="picked" type="checkbox" :value="option.value" class="w-4 h-4 shrink-0">
          <span class="truncate">{{ option.label }}</span>
        </label>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'

import IconChevronDown from '~icons/mdi/chevron-down'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectGroup {
  /** Absent for options that sit outside any heading */
  label?: string
  options: MultiSelectOption[]
}

const props = defineProps<{
  groups: MultiSelectGroup[]
  /** Shown while nothing is picked */
  placeholder: string
  /** The id of the element naming this control, since a button cannot sit in a label */
  labelledby?: string
  disabled?: boolean
}>()

const picked = defineModel<string[]>({ required: true })

const rootRef = useTemplateRef('rootRef')
const buttonId = useId()
const panelId = useId()
const open = ref(false)

const summary = computed(() => {
  if (!picked.value.length) return props.placeholder
  const labels = props.groups.flatMap(group => group.options)
    .filter(option => picked.value.includes(option.value))
    .map(option => option.label)
  return labels.join(', ')
})

function close () {
  if (!open.value) return
  open.value = false
  document.getElementById(buttonId)?.focus()
}

onClickOutside(rootRef, () => { open.value = false })
</script>

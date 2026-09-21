<template>
  <label
    class="grid cursor-pointer grid-cols-[3rem_auto] rounded bg-surface hover:bg-elevated focus-within:outline-2 focus-within:outline-solid focus-within:outline-ttred-900 focus-within:outline-offset-2"
    :class="{ 'cursor-default': disabled }"
  >
    <input
      type="checkbox"
      class="sr-only"
      :checked="checked"
      :disabled="disabled"
      :aria-busy="loading"
      @change="$emit('update:checked', ($event.target as HTMLInputElement).checked)"
    >
    <div
      class="flex rounded-l h-full items-center justify-center border-line border"
      :class="{
        'bg-success border-success': checked && !disabled,
        'bg-success-soft border-success': checked && disabled,
        'bg-sunken': !checked && disabled
      }"
      aria-hidden="true"
    >
      <slot name="icon">
        <icon-loading v-if="loading" class="text-white animate-spin" />
        <icon-check v-else-if="checked" class="text-white" />
        <icon-close v-else :class="disabled ? 'text-muted' : 'text-content'" />
      </slot>
    </div>
    <div class="rounded-r flex p-2 items-center border border-l-0 border-line" :class="{ 'text-muted': disabled }">
      <slot />
    </div>
  </label>
</template>

<script setup lang="ts">
import IconCheck from '~icons/mdi/check'
import IconClose from '~icons/mdi/close'
import IconLoading from '~icons/mdi/loading'

defineProps({
  checked: Boolean,
  disabled: Boolean,
  loading: Boolean
})

defineEmits<{
  'update:checked': [checked: boolean]
}>()
</script>

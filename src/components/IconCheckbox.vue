<template>
  <label
    class="grid cursor-pointer grid-cols-[3rem,auto] rounded bg-white hover:bg-gray-200"
  >
    <input
      type="checkbox"
      class="hidden"
      :checked="checked"
      :disabled="disabled"
      @click="$emit('update:checked', !checked)"
    >
    <div
      class="flex rounded-l h-full items-center justify-center border-gray-300 border"
      :class="{
        'bg-green-500': checked,
        'bg-green-300': disabled,
        'border-green-500': checked
      }"
    >
      <slot name="icon">
        <icon-loading v-if="loading" class="text-white animate-spin" />
        <icon-check v-else-if="checked" class="text-white" />
        <icon-close v-else class="text-black" />
      </slot>
    </div>
    <div class="rounded-r flex p-2 items-center border border-l-0 border-gray-300">
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

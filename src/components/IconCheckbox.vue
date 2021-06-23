<template>
  <label
    class="grid cursor-pointer grid-cols-[3rem,auto] rounded bg-white hover:bg-gray-200"
  >
    <input
      @click="$emit('update:checked', !checked)"
      type="checkbox" class="hidden"
      :checked="checked"
      :disabled="disabled">
    <div
      class="flex rounded-l h-full items-center justify-center border-gray-300 border"
      :class="{
        'bg-green-500': checked,
        'bg-green-300': disabled,
        'border-green-500': checked
      }"
    >
      <slot name="icon">
        <icon-loading class="text-white animate-spin" v-if="loading" />
        <icon-check class="text-white" v-else-if="checked" />
        <icon-close class="text-black" v-else />
      </slot>
    </div>
    <div class="rounded-r flex p-2 items-center border border-l-0 border-gray-300">
      <slot></slot>
    </div>
  </label>
</template>

<script setup lang="ts">
import { defineProps } from "vue-demi";

import IconCheck from 'virtual:vite-icons/mdi/check'
import IconClose from 'virtual:vite-icons/mdi/close'
import IconLoading from 'virtual:vite-icons/mdi/loading'

defineProps({
  checked: Boolean,
  disabled: Boolean,
  loading: Boolean
})
</script>

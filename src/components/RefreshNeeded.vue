<template>
  <bottom-bar v-if="sw.needRefresh.value" class="fixed bottom-0 right-0 left-0 border-t bg-white border-gray-300 py-2 overflow-x-auto z-10000">
    <div class="container mx-auto px-2 flex flex-wrap items-baseline gap-2 justify-between">
      <p>New version available, click on reload to update.</p>

      <div class="flex gap-4 flex-nowrap">
        <button class="btn w-full sm:w-auto border border-green-500" @click="sw.updateSW()">
          Reload
        </button>
        <button class="btn w-full sm:w-auto" @click="sw.dismiss()">
          Dismiss
        </button>
      </div>
    </div>
  </bottom-bar>
</template>

<script setup lang="ts">
import useSW from '../hooks/useSW'
import BottomBar from "./BottomBar.vue"

const sw = useSW()
</script>

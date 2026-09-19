<template>
  <bottom-bar v-if="sw.needRefresh.value" class="fixed bottom-0 right-0 left-0 border-t bg-surface border-line py-2 overflow-x-auto z-10000">
    <div class="container mx-auto px-2 flex flex-wrap items-baseline gap-2 justify-between">
      <p>{{ t('refresh.message') }}</p>

      <div class="flex gap-4 flex-nowrap">
        <button class="btn w-full sm:w-auto border border-success" @click="sw.updateSW()">
          {{ t('refresh.reload') }}
        </button>
        <button class="btn w-full sm:w-auto" @click="sw.dismiss()">
          {{ t('refresh.dismiss') }}
        </button>
      </div>
    </div>
  </bottom-bar>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import useSW from '../hooks/useSW'
import BottomBar from './BottomBar.vue'

const { t } = useI18n()
const sw = useSW()
</script>

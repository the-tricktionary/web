<template>
  <bottom-bar>
    <router-link :to="{ name: 'groups' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('groups.backToGroups') }}</span>
    </router-link>
    <slot />
  </bottom-bar>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import BottomBar from './BottomBar.vue'
import IconChevronLeft from '~icons/mdi/chevron-left'

const { t } = useI18n()
</script>

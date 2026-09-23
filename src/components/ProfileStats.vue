<template>
  <section>
    <h2 class="mb-2">
      {{ t('profile.stats') }}
    </h2>

    <p class="flex items-baseline gap-2 mb-4">
      <span class="text-6xl font-bold leading-none">{{ number(stats.completed) }}</span>
      <span class="text-muted">{{ t('profile.tricksCompleted') }}</span>
    </p>

    <ul v-if="stats.levels.length" class="flex flex-col gap-3 max-w-160">
      <level-progress
        v-for="level of stats.levels"
        :key="level.level"
        :label="t('profile.level', { level: level.level })"
        :text="t('profile.completedOf', { completed: number(level.completed), total: number(level.total) })"
        :value="level.completed"
        :max="level.total"
      />
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import LevelProgress from './LevelProgress.vue'
import useSpeedFormat from '../hooks/useSpeedFormat'

import type { ProfileHeaderFragment } from '../graphql/generated/graphql'

defineProps<{
  stats: ProfileHeaderFragment['checklistStats']
}>()

const { t } = useI18n()
const { number } = useSpeedFormat()
</script>

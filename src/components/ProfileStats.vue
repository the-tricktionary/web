<template>
  <section>
    <h2 class="mb-2">
      {{ t('profile.stats') }}
    </h2>

    <p class="flex items-baseline gap-2 mb-4">
      <span class="text-6xl font-bold leading-none">{{ number(stats.completed) }}</span>
      <span class="text-muted">{{ t('profile.ofTricks', { total: number(stats.total) }) }}</span>
    </p>

    <ul v-if="stats.levels.length" class="flex flex-col gap-3 max-w-160">
      <li v-for="level of stats.levels" :key="level.level" class="grid grid-cols-[auto_max-content] gap-x-4 gap-y-1 items-baseline">
        <span class="font-semibold">{{ t('profile.level', { level: level.level }) }}</span>
        <span class="text-muted tabular-nums">{{ t('profile.completedOf', { completed: number(level.completed), total: number(level.total) }) }}</span>
        <div
          class="col-span-2 h-2 rounded bg-sunken overflow-hidden"
          role="progressbar"
          :aria-label="t('profile.level', { level: level.level })"
          :aria-valuenow="level.completed"
          aria-valuemin="0"
          :aria-valuemax="level.total"
        >
          <div class="h-full rounded bg-success" :style="{ width: `${percent(level)}%` }" />
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import useSpeedFormat from '../hooks/useSpeedFormat'

import type { ProfileHeaderFragment } from '../graphql/generated/graphql'

defineProps<{
  stats: ProfileHeaderFragment['checklistStats']
}>()

const { t } = useI18n()
const { number } = useSpeedFormat()

/** How full a level's bar is, a level without tricks reads as empty */
function percent (level: { completed: number, total: number }) {
  if (level.total <= 0) return 0
  return Math.min(100, Math.round((level.completed / level.total) * 100))
}
</script>

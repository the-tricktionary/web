<template>
  <div v-if="rows.length" class="mb-6">
    <h2 class="mb-4 text-2xl font-semibold relative">
      {{ t('trick.levels.title') }}
    </h2>

    <table :id="tableId" class="w-full text-sm text-left border-collapse border border-line bg-surface">
      <thead>
        <tr class="border-b border-line">
          <th scope="col" class="px-2 py-1 font-semibold">
            {{ t('trick.levels.ruleset') }}
          </th>
          <th scope="col" class="px-2 py-1 font-semibold">
            {{ t('trick.levels.level') }}
          </th>
          <th scope="col" class="px-2 py-1 font-semibold">
            <span class="sr-only">{{ t('trick.levels.actions') }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row of visibleRows" :key="row.ruleset.id" class="border-b border-line last:border-b-0">
          <th scope="row" class="px-2 py-1 font-normal">
            {{ row.ruleset.name }}
          </th>
          <td class="px-2 py-1">
            <span v-if="row.level" class="inline-flex items-center">
              {{ row.level.level }}
              <level-verification v-if="row.level.verificationLevel" :level="row.level.verificationLevel" />
            </span>
            <span v-else class="text-muted">
              <span aria-hidden="true">&ndash;</span>
              <span class="sr-only">{{ t('trick.levels.noLevel') }}</span>
            </span>
          </td>
          <td class="px-2 py-1 text-right">
            <span v-if="row.ruleset.id === ruleset?.id" class="text-muted">{{ t('trick.levels.default') }}</span>
            <button
              v-else
              type="button"
              class="text-link hover:text-link-hover underline cursor-pointer whitespace-nowrap rounded"
              @click="follow(row.ruleset.id)"
            >
              {{ t('trick.levels.useAsDefault') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <button
      v-if="rows.length > 1"
      type="button"
      class="mt-2 text-sm text-link hover:text-link-hover underline cursor-pointer rounded"
      :aria-expanded="expanded"
      :aria-controls="tableId"
      @click="expanded = !expanded"
    >
      {{ expanded ? t('trick.levels.showFewer') : t('trick.levels.showAll') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'

import useRuleset from '../hooks/useRuleset'

import LevelVerification from './LevelVerification.vue'

import type { TrickBySlugQuery } from '../graphql/generated/graphql'

type TrickLevel = NonNullable<TrickBySlugQuery['trick']>['levels'][number]

const { levels } = defineProps<{ levels: TrickLevel[] }>()

const { t } = useI18n()
const { rulesets, ruleset, follow } = useRuleset()

const tableId = useId()
const expanded = ref(false)

const rows = computed(() => rulesets.value
  .map(selectable => ({ ruleset: selectable, level: levels.find(level => level.rulesId === selectable.id) }))
  .filter(row => row.level != null || row.ruleset.id === ruleset.value?.id)
)

const visibleRows = computed(() => expanded.value
  ? rows.value
  : rows.value.filter(row => row.ruleset.id === ruleset.value?.id)
)
</script>

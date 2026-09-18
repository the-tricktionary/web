<template>
  <div v-if="rulesets.length">
    <h2 class="mb-4 text-2xl font-semibold relative">
      Levels
    </h2>

    <table class="w-full text-sm text-left border-collapse border border-line rounded bg-surface">
      <thead>
        <tr class="border-b border-line">
          <th scope="col" class="px-2 py-1 font-semibold">
            Ruleset
          </th>
          <th scope="col" class="px-2 py-1 font-semibold">
            Level
          </th>
          <th scope="col" class="px-2 py-1 font-semibold">
            <span class="sr-only">Actions</span>
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
              <span class="sr-only">No level</span>
            </span>
          </td>
          <td class="px-2 py-1 text-right">
            <span v-if="row.ruleset.id === ruleset?.id" class="text-muted">Default</span>
            <button
              v-else
              type="button"
              class="text-link hover:text-link-hover underline cursor-pointer whitespace-nowrap rounded"
              @click="useAsDefault(row.ruleset)"
            >
              Use as default
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
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Show fewer' : 'Show all rulesets' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import useRuleset from '../hooks/useRuleset'

import LevelVerification from './LevelVerification.vue'

import type { TrickBySlugQuery } from '../graphql/generated/graphql'
import type { Ruleset } from '../hooks/useRuleset'

type TrickLevel = NonNullable<TrickBySlugQuery['trick']>['levels'][number]

const { levels } = defineProps<{ levels: TrickLevel[] }>()

const { rulesets, primary, selectedRulesId, ruleset } = useRuleset()

const expanded = ref(false)

/** The rulesets this trick has a level in, plus the default ruleset even if it doesn't */
const rows = computed(() => rulesets.value
  .map(selectable => ({ ruleset: selectable, level: levels.find(level => level.rulesId === selectable.id) }))
  .filter(row => row.level != null || row.ruleset.id === ruleset.value?.id)
)

const visibleRows = computed(() => expanded.value
  ? rows.value
  : rows.value.filter(row => row.ruleset.id === ruleset.value?.id)
)

function useAsDefault (selected: Ruleset) {
  // following the primary ruleset is stored as "no choice", so that a later
  // change of primary ruleset carries over
  selectedRulesId.value = selected.id === primary.value?.id ? null : selected.id
}
</script>

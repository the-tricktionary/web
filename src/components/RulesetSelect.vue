<template>
  <select
    :value="value"
    aria-label="Ruleset"
    class="rounded border-line w-max"
    @change="selectedRulesId = ($event.target as HTMLSelectElement).value || null"
  >
    <option value="">
      Default{{ primary ? ` (${primary.name})` : '' }}
    </option>
    <option v-for="ruleset of rulesets" :key="ruleset.id" :value="ruleset.id">
      {{ ruleset.name }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import useRuleset from '../hooks/useRuleset'

const { rulesets, primary, selectedRulesId } = useRuleset()

// falls back to the default option while the rulesets load, and if the
// selected one no longer exists
const value = computed(() => rulesets.value.some(ruleset => ruleset.id === selectedRulesId.value)
  ? selectedRulesId.value
  : ''
)
</script>

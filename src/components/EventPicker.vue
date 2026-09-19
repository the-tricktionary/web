<template>
  <select v-model="eventDefinitionId" class="rounded" :required="required" :disabled="disabled">
    <option v-if="placeholder" value="" disabled>
      {{ placeholder }}
    </option>
    <!-- Ungrouped and first, so it reads as the odd one out rather than
         as a trailing member of the last duration group -->
    <option v-if="allowCustom" :value="CUSTOM_EVENT">
      {{ t('speed.create.customEvent') }}
    </option>
    <optgroup v-for="group of eventGroups" :key="group.label" :label="group.label">
      <option v-for="eventDefinition of group.eventDefinitions" :key="eventDefinition.id" :value="eventDefinition.id">
        {{ eventDefinition.name }}{{ markAudio && eventDefinition.timingTrack?.audioUrl ? ' ♪' : '' }}
      </option>
    </optgroup>
  </select>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import useEventDefinitions from '../hooks/useEventDefinitions'
import { CUSTOM_EVENT } from '../helpers'

withDefaults(defineProps<{
  /** Offers the custom event entry, whose value is CUSTOM_EVENT */
  allowCustom?: boolean
  /** A disabled first entry shown while nothing is selected */
  placeholder?: string
  /** Marks events that have audio to play, for the live counter */
  markAudio?: boolean
  required?: boolean
  disabled?: boolean
}>(), {
  allowCustom: false,
  placeholder: undefined,
  markAudio: false,
  required: false,
  disabled: false
})

const eventDefinitionId = defineModel<string>({ required: true })

const { t } = useI18n()
const { eventGroups } = useEventDefinitions()
</script>

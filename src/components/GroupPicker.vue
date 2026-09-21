<template>
  <select v-model="groupId" class="rounded" :disabled="disabled">
    <option value="">
      {{ t('speed.group.none') }}
    </option>
    <option v-for="group of groups" :key="group.id" :value="group.id">
      {{ group.name }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import useMyGroups from '../hooks/useMyGroups'

withDefaults(defineProps<{
  disabled?: boolean
}>(), {
  disabled: false
})

/** The group the score is shared with, an empty string for none */
const groupId = defineModel<string>({ required: true })

const { t } = useI18n()
const { groups } = useMyGroups()
</script>

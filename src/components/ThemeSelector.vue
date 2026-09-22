<template>
  <label class="block max-w-120">
    <span class="block mb-1">{{ t('theme.label') }}</span>
    <select
      class="w-full block rounded"
      :value="theme ?? ''"
      @change="onChange"
    >
      <option value="">
        {{ t('theme.system') }}
      </option>
      <option :value="Theme.Light">
        {{ t('theme.light') }}
      </option>
      <option :value="Theme.Dark">
        {{ t('theme.dark') }}
      </option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { Theme } from '../graphql/generated/graphql'
import useTheme from '../hooks/useTheme'

const { t } = useI18n()
const { theme, setTheme } = useTheme()

function onChange (event: Event) {
  const { value } = event.target as HTMLSelectElement
  setTheme(value ? value as Theme : null)
}
</script>

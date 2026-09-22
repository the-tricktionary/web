<template>
  <label v-if="languages.length > 1" :class="showLabel ? 'block max-w-120' : 'inline-flex items-center gap-2'">
    <span :class="showLabel ? 'block mb-1' : 'sr-only'">{{ t('language.label') }}</span>
    <select
      :class="showLabel ? 'w-full block rounded' : 'rounded py-1'"
      :value="lang"
      @change="setLang(($event.target as HTMLSelectElement).value)"
    >
      <option v-for="language of languages" :key="language.id" :value="language.id" :lang="language.id">
        {{ languageName(language.id) }}
      </option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { languageName } from '../helpers'
import useLanguage from '../hooks/useLanguage'

const { showLabel } = defineProps<{ showLabel?: boolean }>()

const { t } = useI18n()
const { languages, lang, setLang } = useLanguage()
</script>

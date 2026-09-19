<template>
  <label v-if="languages.length > 1" :class="showLabel ? 'block max-w-120' : 'inline-flex items-center gap-2'">
    <span :class="showLabel ? 'block mb-1' : 'sr-only'">Language</span>
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
import useLanguage from '../hooks/useLanguage'

const { showLabel } = defineProps<{ showLabel?: boolean }>()

const { languages, lang, setLang } = useLanguage()

/** The name of a language in that language itself, the tag when we can't name it */
function languageName (tag: string) {
  try {
    const name = new Intl.DisplayNames([tag], { type: 'language' }).of(tag) ?? tag
    return name.charAt(0).toLocaleUpperCase(tag) + name.slice(1)
  } catch {
    return tag
  }
}
</script>

<template>
  <div class="container mx-auto px-2 py-4 mb-20 max-w-160">
    <h1 class="mb-2">
      {{ t('booklets.title') }}
    </h1>
    <p>{{ t('booklets.intro') }}</p>

    <form class="flex flex-col gap-4 mt-4" @submit.prevent="download()">
      <discipline-selector v-model:discipline="discipline" />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('booklets.paper') }}</span>
          <select v-model="paper" class="rounded">
            <option value="a4">{{ t('booklets.paperA4') }}</option>
            <option value="letter">{{ t('booklets.paperLetter') }}</option>
          </select>
        </label>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('booklets.language') }}</span>
          <select v-model="bookletLang" class="rounded" @change="langTouched = true">
            <option v-for="language of languages" :key="language.id" :value="language.id" :lang="language.id">
              {{ languageName(language.id) }}
            </option>
          </select>
        </label>
      </div>

      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('booklets.ruleset') }}</span>
        <select v-model="rulesId" class="rounded" :aria-describedby="rulesetHelpId" @change="rulesetTouched = true">
          <option :value="null">{{ t('booklets.noRuleset') }}</option>
          <option v-for="rs of rulesets" :key="rs.id" :value="rs.id">
            {{ rs.name }}
          </option>
        </select>
        <span :id="rulesetHelpId" class="text-muted text-sm">{{ t('booklets.rulesetHelp') }}</span>
      </label>

      <div>
        <icon-checkbox v-model:checked="detailed">
          {{ t('booklets.detailed') }}
        </icon-checkbox>
        <p class="text-muted text-sm mt-1 mb-0">
          {{ t('booklets.detailedHelp') }}
        </p>
      </div>

      <fieldset class="flex flex-col gap-2">
        <legend class="font-semibold mb-1">
          {{ t('booklets.layout') }}
        </legend>
        <label v-for="option of layouts" :key="option.value" class="flex gap-2 items-start cursor-pointer">
          <input v-model="layout" type="radio" name="layout" :value="option.value" class="mt-1">
          <span>
            <span class="font-semibold">{{ option.label }}</span>
            <span class="block text-muted text-sm">{{ option.help }}</span>
          </span>
        </label>
      </fieldset>

      <a
        :href="downloadUrl"
        target="_blank"
        rel="noopener"
        class="btn w-max inline-flex items-center gap-2"
        @click="logDownload()"
      >
        <icon-download aria-hidden="true" />
        {{ t('booklets.download') }}
      </a>
    </form>

    <section class="mt-10">
      <h2 class="mb-2">
        {{ t('booklets.printed.title') }}
      </h2>
      <p>{{ t('booklets.printed.text') }}</p>
      <router-link to="/shop" class="btn w-max inline-block">
        {{ t('booklets.printed.cta') }}
      </router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAnalytics, logEvent } from '@firebase/analytics'
import { useHead } from '@unhead/vue'

import { Discipline } from '../graphql/generated/graphql'
import { disciplineToSlug } from '../helpers'
import useLanguage from '../hooks/useLanguage'
import useRuleset from '../hooks/useRuleset'

import DisciplineSelector from '../components/DisciplineSelector.vue'
import IconCheckbox from '../components/IconCheckbox.vue'
import IconDownload from '~icons/mdi/download'

type Paper = 'a4' | 'letter'
type Layout = 'pages' | 'booklet'

const { t } = useI18n()
const analytics = getAnalytics()
const { languages, lang } = useLanguage()
const { rulesets, ruleset } = useRuleset()

useHead({ title: computed(() => t('booklets.title')) })

const rulesetHelpId = useId()

/** Letter where it is the norm, A4 everywhere else */
function defaultPaper (): Paper {
  const region = new Intl.Locale(navigator.language).maximize().region
  return region === 'US' || region === 'CA' ? 'letter' : 'a4'
}

const discipline = ref<Discipline>(Discipline.SingleRope)
const paper = ref<Paper>(defaultPaper())
const bookletLang = ref(lang.value)
const rulesId = ref<string | null>(ruleset.value?.id ?? null)
const detailed = ref(false)
const layout = ref<Layout>('booklet')

// the site's language and followed ruleset arrive once their queries answer,
// the form follows them until a choice is made here
const langTouched = ref(false)
const rulesetTouched = ref(false)
watch(lang, lang => { if (!langTouched.value) bookletLang.value = lang })
watch(ruleset, ruleset => { if (!rulesetTouched.value) rulesId.value = ruleset?.id ?? null })

const layouts = computed(() => [
  { value: 'booklet' as const, label: t('booklets.layoutBooklet'), help: t('booklets.layoutBookletHelp') },
  { value: 'pages' as const, label: t('booklets.layoutPages'), help: t('booklets.layoutPagesHelp') }
])

// Served by the API through a Firebase Hosting rewrite on the site's own
// origin, whose CDN caches each combination of parameters, so defaults are
// left out to share cache entries. In development there is no rewrite, so the
// API is asked directly.
const origin = import.meta.env.DEV ? import.meta.env.VITE_GRAPHQL_URL : window.location.origin

const downloadUrl = computed(() => {
  const url = new URL('/booklets/tricks.pdf', origin)
  url.searchParams.set('discipline', disciplineToSlug(discipline.value))
  if (paper.value !== 'a4') url.searchParams.set('paper', paper.value)
  if (bookletLang.value !== 'en') url.searchParams.set('lang', bookletLang.value)
  if (detailed.value) url.searchParams.set('detailed', '1')
  if (rulesId.value != null) url.searchParams.set('rulesId', rulesId.value)
  if (layout.value !== 'booklet') url.searchParams.set('layout', layout.value)
  return url.href
})

/** The name of a language in that language itself, the tag when we can't name it */
function languageName (tag: string) {
  try {
    const name = new Intl.DisplayNames([tag], { type: 'language' }).of(tag) ?? tag
    return name.charAt(0).toLocaleUpperCase(tag) + name.slice(1)
  } catch {
    return tag
  }
}

/** Submitting the form, e.g. with the enter key, is the same as following the link */
function download () {
  logDownload()
  window.open(downloadUrl.value, '_blank', 'noopener')
}

function logDownload () {
  logEvent(analytics, 'booklet_download', {
    discipline: discipline.value,
    paper: paper.value,
    lang: bookletLang.value,
    detailed: detailed.value,
    rules_id: rulesId.value ?? '',
    layout: layout.value
  })
}
</script>

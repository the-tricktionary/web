<template>
  <global-notices />

  <discipline-selector v-model:discipline="discipline" />

  <div class="container mx-auto px-2 mt-2 flex justify-end empty:hidden">
    <language-selector />
  </div>

  <bottom-bar>
    <input
      v-model="search"
      type="search"
      :placeholder="t('home.search')"
      :aria-label="t('home.search')"
      class="rounded focus:border-b-ttred-900 border-line flex-grow"
    >

    <icon-checkbox
      v-model:checked="settings.hideCompleted"
      class="w-max whitespace-nowrap"
      :class="{ hidden: !user }"
    >
      {{ t('home.hideCompleted') }}
    </icon-checkbox>
  </bottom-bar>

  <div class="container mx-auto p-2">
    <trick-list
      :tricks="tricks"
      :checklist="checklist"
      :loading="tricksQuery.loading.value"
      :hide-completed="settings.hideCompleted"
      :enable-checklist="!!user"
      submit-prompt
      :discipline="discipline ?? Discipline.SingleRope"
    />
  </div>

  <ad-adsense />
  <about />

  <tt-footer class="mb-14" />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { getAnalytics, logEvent } from '@firebase/analytics'

import TrickList from '../components/TrickList.vue'
import DisciplineSelector from '../components/DisciplineSelector.vue'
import GlobalNotices from '../components/GlobalNotices.vue'
import About from '../components/About.vue'
import TtFooter from '../components/Footer.vue'
import IconCheckbox from '../components/IconCheckbox.vue'
import LanguageSelector from '../components/LanguageSelector.vue'

import { Discipline, useTricksQuery } from '../graphql/generated/graphql'
import { disciplineToSlug, slugToDiscipline } from '../helpers'
import useAuth from '../hooks/useAuth'
import useLanguage from '../hooks/useLanguage'
import useSettings from '../hooks/useSettings'
import AdAdsense from '../components/AdAdsense.vue'
import { refDebounced } from '@vueuse/core'

import BottomBar from '../components/BottomBar.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

function disciplineFromQuery (slug: unknown) {
  if (typeof slug !== 'string') return undefined
  try {
    return slugToDiscipline(slug)
  } catch {
    return undefined
  }
}

function searchFromQuery (q: unknown) {
  return typeof q === 'string' && q.trim() !== '' ? q : undefined
}

// the discipline and the search live in the URL, so that a tag on a trick's
// page can link to the tricks carrying it, and a search can be shared
const discipline = ref<Discipline | undefined>(disciplineFromQuery(route.query.discipline))
const settings = useSettings()
const analytics = getAnalytics()
const { firebaseUser, user } = useAuth({ withChecklist: true })
const { lang } = useLanguage()

const search = ref<string | undefined>(searchFromQuery(route.query.q))
const debouncedSearch = refDebounced(search, 1000)

const tricksQuery = useTricksQuery({
  discipline: discipline.value,
  searchQuery: search.value ?? null,
  withLocalised: lang.value !== 'en',
  lang: lang.value
})
const tricks = computed(() => tricksQuery.result.value?.tricks ?? [])
const checklist = ref<Set<string>>(new Set())

watch(discipline, discipline => {
  tricksQuery.variables.value!.discipline = discipline ?? Discipline.SingleRope
})
watch(lang, lang => {
  tricksQuery.variables.value!.withLocalised = lang !== 'en'
  tricksQuery.variables.value!.lang = lang
})
watch(user, user => {
  checklist.value = new Set(user?.checklist?.map(checklistItem => checklistItem.trick.id))
})
watch(debouncedSearch, search => {
  if (search?.trim() === '') tricksQuery.variables.value!.searchQuery = null
  else tricksQuery.variables.value!.searchQuery = search
})

watch([discipline, debouncedSearch], ([discipline, search]) => {
  const q = searchFromQuery(search)
  const slug = discipline ? disciplineToSlug(discipline) : undefined
  if (route.query.q === q && route.query.discipline === slug) return
  void router.replace({ query: { ...route.query, discipline: slug, q } })
})

// going back and forward, compared with the debounced search so that what is
// still being typed isn't replaced by what the URL held a moment ago
watch(() => route.query, query => {
  if (route.name !== 'tricktionary') return
  const queryDiscipline = disciplineFromQuery(query.discipline)
  if (queryDiscipline != null && queryDiscipline !== discipline.value) discipline.value = queryDiscipline
  const q = searchFromQuery(query.q)
  if (q !== searchFromQuery(debouncedSearch.value)) search.value = q
})

// The android app does this
logEvent(analytics, 'view_tricktionary', {
  user: firebaseUser.value?.uid ?? 'Guest'
})
</script>

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
    />
  </div>

  <ad-adsense />
  <about />

  <tt-footer class="mb-14" />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAnalytics, logEvent } from '@firebase/analytics'

import TrickList from '../components/TrickList.vue'
import DisciplineSelector from '../components/DisciplineSelector.vue'
import GlobalNotices from '../components/GlobalNotices.vue'
import About from '../components/About.vue'
import TtFooter from '../components/Footer.vue'
import IconCheckbox from '../components/IconCheckbox.vue'
import LanguageSelector from '../components/LanguageSelector.vue'

import { Discipline, useTricksQuery } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useLanguage from '../hooks/useLanguage'
import useSettings from '../hooks/useSettings'
import AdAdsense from '../components/AdAdsense.vue'
import { refDebounced } from '@vueuse/core'

import BottomBar from '../components/BottomBar.vue'

const { t } = useI18n()
const discipline = ref<Discipline>()
const settings = useSettings()
const analytics = getAnalytics()
const { firebaseUser, user } = useAuth({ withChecklist: true })
const { lang } = useLanguage()

const tricksQuery = useTricksQuery({
  discipline: discipline.value,
  withLocalised: lang.value !== 'en',
  lang: lang.value
})
const tricks = computed(() => tricksQuery.result.value?.tricks ?? [])
const checklist = ref<Set<string>>(new Set())
const search = ref<string | undefined>(undefined)
const debouncedSearch = refDebounced(search, 1000)

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

// The android app does this
logEvent(analytics, 'view_tricktionary', {
  user: firebaseUser.value?.uid ?? 'Guest'
})
</script>

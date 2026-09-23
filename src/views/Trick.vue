<template>
  <div v-if="loading" class="container mx-auto flex items-center justify-center flex-col" role="status">
    <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
    {{ t('trick.loading') }}
  </div>
  <div v-else-if="trick" class="grid grid-cols-1 lg:grid-cols-[4fr_1fr] gap-4 container mx-auto px-2 py-4 mb-20">
    <div>
      <div class="mb-4">
        <h1 :lang="localised.nameLang === lang ? undefined : localised.nameLang">
          {{ localised.name }}
        </h1>

        <p class="text-muted font-semibold">
          <span class="inline-flex items-center">
            <router-link v-if="trickType" :to="homeSearch(tagSearch(TRICK_TYPE_TAG, trickType))">
              {{ trickTypeLabel(trickType) }}
            </router-link>
            <template v-if="level">
              &mdash; {{ t('trick.level', { ruleset: ruleset?.name ?? '', level: level.level }) }}
              <level-verification v-if="level.verificationLevel" :level="level.verificationLevel" />
            </template>
          </span>
        </p>

        <p v-if="localised.alternativeNames.length">
          {{ t('trick.alternativeNames', { names: alternativeNames }) }}
        </p>
      </div>

      <videos
        v-if="trick.videos"
        :videos="trick.videos"
        :trick-id="trick.id"
        :title="localised.name"
      />

      <div class="my-4">
        <p :lang="localised.descriptionLang === lang ? undefined : localised.descriptionLang">
          {{ localised.description }}
        </p>
      </div>

      <ul v-if="tagChips.length" class="list-none m-0 p-0 mb-4 flex flex-wrap gap-2" :aria-label="t('trick.tags')">
        <li v-for="chip of tagChips" :key="chip.key">
          <router-link :to="chip.to" class="inline-block rounded-full border border-solid border-line px-3 py-1 text-sm">
            {{ chip.label }}
          </router-link>
        </li>
      </ul>

      <p v-if="contributors" class="text-muted text-sm">
        {{ t('trick.contributors', { names: contributors }) }}
      </p>
    </div>

    <div class="flex flex-col">
      <trick-levels :levels="trick.levels" />

      <div v-if="trick.prerequisiteFor.length">
        <h2 class="mb-4 text-2xl font-semibold relative">
          {{ t('trick.next') }}
        </h2>
        <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <trick-box
            v-for="prereq of trick.prerequisiteFor"
            :key="prereq.id"
            :enable-checklist="!!user"
            :completed="completed.has(prereq.id)"
            :trick="prereq"
            @navigate="viewNext(prereq)"
          />
        </div>
      </div>

      <div v-if="trick.prerequisites.length">
        <h2 class="w-32 mb-4 text-2xl font-semibold relative" :class="{ 'mt-6': trick.prerequisiteFor.length }">
          {{ t('trick.previous') }}
        </h2>
        <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <trick-box
            v-for="prereq of trick.prerequisites"
            :key="prereq.id"
            :enable-checklist="!!user"
            :completed="completed.has(prereq.id)"
            :trick="prereq"
            @navigate="viewPrevious(prereq)"
          />
        </div>
      </div>

      <p v-if="completion" class="text-muted text-sm mt-6 mb-0">
        {{ completion.recordedBy
          ? t('trick.markedCompletedBy', { date: formatDate(completion.createdAt, lang), name: completion.recordedBy.name ?? '' })
          : t('trick.markedCompleted', { date: formatDate(completion.createdAt, lang) }) }}
      </p>
    </div>
  </div>

  <bottom-bar>
    <router-link :to="allTricks" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('trick.allTricks') }}</span>
    </router-link>

    <icon-checkbox
      v-if="user && trick"
      :checked="completed.has(trick.id)"
      :disabled="mutating"
      :loading="mutating"
      @update:checked="completeTrick($event)"
    >
      {{ t('trick.completed') }}
    </icon-checkbox>

    <icon-button
      v-if="canShare"
      :disabled="!trick"
      class="w-max btn inline-flex items-center mt-0"
      @click="share()"
    >
      <template #icon>
        <icon-share />
      </template>
      {{ t('trick.share') }}
    </icon-button>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { getAnalytics, logEvent } from '@firebase/analytics'
import { useHead } from '@unhead/vue'

import { type Discipline, TagValueType, useTrickBySlugQuery } from '../graphql/generated/graphql'
import { formatDate, localiseTrick, slugToDiscipline, tagSearch, TRICK_TYPE_TAG, trickTypeOf } from '../helpers'
import useAuth from '../hooks/useAuth'
import useCompleteTrick from '../hooks/useCompleteTrick'
import useLanguage from '../hooks/useLanguage'
import useRuleset from '../hooks/useRuleset'
import useTags from '../hooks/useTags'

import Videos from '../components/Videos.vue'
import IconLoading from '~icons/mdi/loading'
import IconShare from '~icons/mdi/share'
import IconChevronLeft from '~icons/mdi/chevron-left'
import TrickBox from '../components/TrickBox.vue'
import LevelVerification from '../components/LevelVerification.vue'
import IconButton from '../components/IconButton.vue'

import type { TrickBoxFragment } from '../graphql/generated/graphql'
import IconCheckbox from '../components/IconCheckbox.vue'
import BottomBar from '../components/BottomBar.vue'
import TrickLevels from '../components/TrickLevels.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const analytics = getAnalytics()
const discipline = ref(slugToDiscipline(route.params.discipline as string))

const { user } = useAuth({ withChecklist: true })
const { lang } = useLanguage()
const trickQuery = useTrickBySlugQuery({
  discipline: discipline as unknown as Discipline,
  slug: route.params.slug as string,
  withLocalised: lang.value !== 'en',
  lang: lang.value
})
const { loading } = trickQuery
const trick = computed(() => trickQuery.result.value?.trick)
const localised = computed(() => localiseTrick(trick.value ?? {}, lang.value))

const { ruleset } = useRuleset()
const level = computed(() => trick.value?.levels.find(level => level.rulesId === ruleset.value?.id))

const { tags, trickTypeLabel } = useTags()
const trickType = computed(() => trick.value ? trickTypeOf(trick.value) : null)

const allTricks = computed(() => ({ name: 'tricktionary', query: { discipline: route.params.discipline as string } }))

function homeSearch (q: string) {
  return { name: allTricks.value.name, query: { ...allTricks.value.query, q } }
}

/** But the trick type, which the heading shows, one chip per value */
const tagChips = computed(() => {
  const numberFormat = new Intl.NumberFormat(lang.value)
  return (trick.value?.tags ?? []).flatMap(trickTag => {
    const tag = tags.value.get(trickTag.tag.id)
    if (!tag || tag.system) return []
    switch (tag.valueType) {
      case TagValueType.Number:
        if (trickTag.number == null) return []
        return [{
          key: tag.id,
          label: t('trick.tagValue', { tag: tag.name, value: numberFormat.format(trickTag.number) }),
          to: homeSearch(tagSearch(tag.id, trickTag.number))
        }]
      case TagValueType.Enum:
        return trickTag.values.map(value => ({
          key: `${tag.id}:${value.id}`,
          label: t('trick.tagValue', { tag: tag.name, value: tag.values.find(tagValue => tagValue.id === value.id)?.name ?? value.id }),
          to: homeSearch(tagSearch(tag.id, value.id))
        }))
      default:
        return [{ key: tag.id, label: tag.name, to: homeSearch(tagSearch(tag.id)) }]
    }
  })
})

const alternativeNames = computed(() => new Intl.ListFormat(localised.value.nameLang, { style: 'long', type: 'disjunction' })
  .format(localised.value.alternativeNames)
)

const contributors = computed(() => trick.value?.contributors.length
  ? new Intl.ListFormat(lang.value, { style: 'long', type: 'conjunction' })
    .format(trick.value.contributors.map(contributor => contributor.name))
  : null
)

const { mutate: completeTrickMutate, loading: mutating } = useCompleteTrick()

async function completeTrick (completed?: boolean) {
  if (!trick.value) return
  if (typeof completed !== 'boolean') return
  await completeTrickMutate({
    trickId: trick.value?.id,
    completed
  })
}

useHead({
  title: computed(() => trick.value ? localised.value.name : null)
})

watch(lang, lang => {
  trickQuery.variables.value!.withLocalised = lang !== 'en'
  trickQuery.variables.value!.lang = lang
})

onBeforeRouteUpdate((to, from) => {
  if (to.name === from.name) {
    const discipline = slugToDiscipline(to.params.discipline as string)
    trickQuery.variables.value!.discipline = discipline
    trickQuery.variables.value!.slug = to.params.slug as string
  }
})

trickQuery.onResult(({ data }) => {
  if (!data) return
  if (!data.trick) {
    void router.push({
      name: 'not_found',
      params: { catchAll: route.fullPath.substring(1).split('/') },
      query: route.query,
      hash: route.hash
    })
  } else {
    // the android app uses this event, so so do we
    logEvent(analytics, 'view_trick', {
      trick_name: data.trick.en?.name,
      user: user.value?.id
    })

    // // sort prereqs
    // trick.value?.prerequisites.sort(trickSorter)
    // trick.value?.prerequisiteFor.sort(trickSorter)
  }
})

const canShare = ref('share' in navigator)

async function share () {
  if (!canShare.value) return false
  await navigator.share({
    title: t('trick.shareTitle', { name: localised.value.name }),
    text: t('trick.shareText'),
    url: `${window.location.origin}${route.path}?utm_source=webshare&utm_medium=referral`
  })
  logEvent(analytics, 'share', {
    item_id: `Trick:${trick.value?.id}`
  })
}

const completed = computed(() => {
  return new Set(user.value?.checklist?.map(checklistItem => checklistItem.trick.id))
})

const completion = computed(() => user.value?.checklist?.find(checklistItem => checklistItem.trick.id === trick.value?.id))

// the andoird app tracks these events, so we do too
function viewNext (trick: TrickBoxFragment) {
  logEvent(analytics, 'view_next_trick', {
    next_trick: trick.en?.name ?? trick.slug
  })
}
function viewPrevious (trick: TrickBoxFragment) {
  logEvent(analytics, 'view_prereq', {
    prereq: trick.en?.name ?? trick.slug
  })
}
</script>

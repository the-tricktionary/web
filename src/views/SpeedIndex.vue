<template>
  <div class="container mx-auto px-2 py-4 mb-20">
    <div class="flex justify-between items-center gap-2 mb-4">
      <h1>{{ t('speed.title') }}</h1>
      <router-link :to="{ name: 'speed-progress' }" class="btn w-max mt-0">
        {{ t('speed.progress.title') }}
      </router-link>
    </div>

    <div class="flex flex-wrap gap-4 mb-4">
      <label class="flex flex-col gap-1 min-w-60">
        <span class="font-semibold">{{ t('speed.filters.event') }}</span>
        <event-picker v-model="eventDefinitionId" :any-label="t('speed.filters.anyEvent')" />
      </label>

      <template v-if="myGroups.length">
        <label class="flex flex-col gap-1 min-w-60">
          <span class="font-semibold">{{ t('speed.filters.group') }}</span>
          <select v-model="groupId" class="rounded">
            <option value="">
              {{ t('speed.filters.anyGroup') }}
            </option>
            <option v-for="group of myGroups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </label>

        <label class="flex flex-col gap-1 min-w-60">
          <span class="font-semibold">{{ t('speed.filters.constellation') }}</span>
          <select v-model="constellation" class="rounded">
            <option value="">
              {{ t('speed.filters.anyConstellation') }}
            </option>
            <optgroup v-for="group of constellationGroups" :key="group.id" :label="group.name">
              <option v-for="option of group.constellations" :key="option.key" :value="option.key">
                {{ t('groups.speed.constellationOption', { names: constellationNames(option.members), count: option.resultCount }) }}
              </option>
            </optgroup>
          </select>
        </label>
      </template>
    </div>

    <div v-if="loading && !speedResults.length" class="flex items-center justify-center flex-col" role="status">
      <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
      {{ t('speed.loading') }}
    </div>

    <div v-else-if="!speedResults.length && filtered" class="flex items-center justify-center flex-col text-center" role="status">
      <icon-filter-remove class="w-32 h-32" aria-hidden="true" />
      <p>{{ t('speed.emptyFiltered') }}</p>
      <button type="button" class="btn w-max" @click="clearFilters()">
        {{ t('speed.clearFilters') }}
      </button>
    </div>

    <div v-else-if="!speedResults.length" class="flex items-center justify-center flex-col text-center" role="status">
      <icon-timer class="w-32 h-32" aria-hidden="true" />
      <p>{{ t('speed.empty') }}</p>
      <router-link :to="{ name: 'speed-count' }" class="btn w-max">
        {{ t('speed.countFirst') }}
      </router-link>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <speed-box v-for="speedResult of speedResults" :key="speedResult.id" :result="speedResult" />
      </div>

      <button
        v-if="hasMore"
        ref="loadMoreRef"
        type="button"
        class="btn mt-4"
        :disabled="loading"
        @click="loadMore()"
      >
        <icon-loading v-if="loading" class="animate-spin inline-block" aria-hidden="true" />
        <span v-else>{{ t('speed.loadMore') }}</span>
      </button>
    </template>
  </div>

  <bottom-bar>
    <router-link :to="{ name: 'speed-create' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0 ml-auto">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-plus />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.enterScore') }}</span>
    </router-link>
    <router-link :to="{ name: 'speed-count' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-timer />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.countLive') }}</span>
    </router-link>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useIntersectionObserver, useThrottleFn } from '@vueuse/core'

import { useGroupSpeedResultsQuery, useSpeedResultsQuery } from '../graphql/generated/graphql'
import { constellationMemberIds, constellationNames } from '../helpers'
import useMyConstellations from '../hooks/useMyConstellations'

import EventPicker from '../components/EventPicker.vue'
import SpeedBox from '../components/SpeedBox.vue'
import BottomBar from '../components/BottomBar.vue'
import IconFilterRemove from '~icons/mdi/filter-remove-outline'
import IconLoading from '~icons/mdi/loading'
import IconPlus from '~icons/mdi/plus'
import IconTimer from '~icons/mdi/timer-outline'

const PAGE_SIZE = 20

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

useHead({ title: computed(() => t('speed.title')) })

const queryValue = (name: string) => typeof route.query[name] === 'string' ? route.query[name] : ''

const eventDefinitionId = ref(queryValue('event'))
const groupId = ref(queryValue('group'))
const constellation = ref(queryValue('constellation'))

const loadMoreRef = ref<HTMLElement>()
const pagesLoaded = ref(1)

const { groups: myGroups, withConstellations } = useMyConstellations()

/** The groups whose constellations the filter offers, narrowed by the group filter */
const constellationGroups = computed(() => groupId.value
  ? withConstellations.value.filter(group => group.id === groupId.value)
  : withConstellations.value
)

/** The group the picked constellation jumps for, which the list then reads from */
const constellationGroupId = computed(() => {
  if (!constellation.value) return ''
  const owner = withConstellations.value.find(group => group.constellations.some(option => option.key === constellation.value))
  return owner?.id ?? ''
})

const usingGroup = computed(() => constellationGroupId.value !== '')
const filtered = computed(() => eventDefinitionId.value !== '' || groupId.value !== '' || constellation.value !== '')

const variables = computed(() => ({
  limit: PAGE_SIZE,
  eventDefinitionId: eventDefinitionId.value === '' ? null : eventDefinitionId.value,
  groupId: groupId.value === '' ? null : groupId.value
}))

const groupVariables = computed(() => ({
  ...variables.value,
  groupId: constellationGroupId.value,
  constellation: constellationMemberIds(constellation.value)
}))

const myQuery = useSpeedResultsQuery(
  () => ({ ...variables.value, startAfter: null }),
  () => ({ enabled: !usingGroup.value, fetchPolicy: 'cache-and-network' })
)
const groupQuery = useGroupSpeedResultsQuery(
  () => ({ ...groupVariables.value, startAfter: null }),
  () => ({ enabled: usingGroup.value, fetchPolicy: 'cache-and-network' })
)

const loading = computed(() => usingGroup.value ? groupQuery.loading.value : myQuery.loading.value)
const speedResults = computed(() => (usingGroup.value
  ? groupQuery.result.value?.group?.speedResults
  : myQuery.result.value?.me?.speedResults) ?? []
)
const hasMore = computed(() => speedResults.value.length >= pagesLoaded.value * PAGE_SIZE)

watch([variables, groupVariables, usingGroup], () => { pagesLoaded.value = 1 })

// a constellation belongs to one group, and reads as picked from it
watch(constellation, () => {
  if (constellationGroupId.value) groupId.value = constellationGroupId.value
})
watch(groupId, () => {
  if (constellation.value && constellationGroupId.value !== groupId.value) constellation.value = ''
})

watch([eventDefinitionId, groupId, constellation], () => {
  const query = {
    ...route.query,
    event: eventDefinitionId.value || undefined,
    group: groupId.value || undefined,
    constellation: constellation.value || undefined
  }
  if (JSON.stringify(query) === JSON.stringify(route.query)) return
  void router.replace({ query })
})

// a link or the back button carries the filters, the pickers follow them
watch(() => route.query, () => {
  eventDefinitionId.value = queryValue('event')
  groupId.value = queryValue('group')
  constellation.value = queryValue('constellation')
})

async function loadMore () {
  const lastResult = speedResults.value[speedResults.value.length - 1]
  if (!lastResult || !hasMore.value || loading.value) return
  if (usingGroup.value) {
    await groupQuery.fetchMore({ variables: { ...groupVariables.value, startAfter: lastResult.createdAt } })
  } else {
    await myQuery.fetchMore({ variables: { ...variables.value, startAfter: lastResult.createdAt } })
  }
  pagesLoaded.value += 1
}

const throttledLoadMore = useThrottleFn(loadMore, 2000)

useIntersectionObserver(loadMoreRef, ([entry]) => {
  if (entry?.isIntersecting) void throttledLoadMore()
})

function clearFilters () {
  eventDefinitionId.value = ''
  groupId.value = ''
  constellation.value = ''
}
</script>

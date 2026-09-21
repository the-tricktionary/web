<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap gap-4">
      <label class="flex flex-col gap-1 min-w-60">
        <span class="font-semibold">{{ t('groups.speed.event') }}</span>
        <event-picker v-model="eventDefinitionId" :any-label="t('groups.speed.allEvents')" />
      </label>

      <label class="flex flex-col gap-1 min-w-60">
        <span class="font-semibold">{{ t('groups.speed.constellation') }}</span>
        <select v-model="constellation" class="rounded">
          <option :value="ANY_CONSTELLATION">
            {{ t('groups.speed.allConstellations') }}
          </option>
          <optgroup v-for="bucket of constellationGroups" :key="bucket.size" :label="t('groups.athletes', bucket.size)">
            <option v-for="option of bucket.constellations" :key="option.key" :value="option.key">
              {{ t('groups.speed.constellationOption', { names: constellationNames(option.members), count: option.resultCount }) }}
            </option>
          </optgroup>
          <option value="">
            {{ t('groups.speed.unassigned') }}
          </option>
        </select>
      </label>
    </div>

    <p v-if="error" class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>

    <div v-if="loading && !results.length" class="flex items-center justify-center flex-col" role="status">
      <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
      {{ t('groups.speed.loading') }}
    </div>

    <div v-else-if="!results.length && filtered" class="flex items-center justify-center flex-col text-center" role="status">
      <icon-filter-remove class="w-32 h-32" aria-hidden="true" />
      <p>{{ t('groups.speed.emptyFiltered') }}</p>
      <button type="button" class="btn w-max" @click="clearFilters()">
        {{ t('groups.speed.clearFilters') }}
      </button>
    </div>

    <div v-else-if="!results.length" class="flex items-center justify-center flex-col text-center" role="status">
      <icon-timer class="w-32 h-32" aria-hidden="true" />
      <p>{{ t('groups.speed.empty') }}</p>
      <router-link :to="{ name: 'speed' }" class="btn w-max">
        {{ t('speed.allScores') }}
      </router-link>
    </div>

    <div v-else class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <speed-box
          v-for="result of results"
          :key="result.id"
          :result="result"
          :to="{ name: 'speed-details', params: { id: result.id }, query: { group: groupId } }"
        />
      </div>

      <button
        v-if="hasMore"
        ref="loadMoreRef"
        type="button"
        class="btn"
        :disabled="loading"
        @click="loadMore()"
      >
        <icon-loading v-if="loading" class="animate-spin inline-block" aria-hidden="true" />
        <span v-else>{{ t('speed.loadMore') }}</span>
      </button>
    </div>
  </div>

  <group-bottom-bar />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIntersectionObserver, useThrottleFn } from '@vueuse/core'

import { useGroupSpeedResultsQuery } from '../graphql/generated/graphql'
import { constellationMemberIds, constellationNames } from '../helpers'
import useAuth from '../hooks/useAuth'
import useGroupConstellations from '../hooks/useGroupConstellations'

import EventPicker from '../components/EventPicker.vue'
import GroupBottomBar from '../components/GroupBottomBar.vue'
import SpeedBox from '../components/SpeedBox.vue'
import IconFilterRemove from '~icons/mdi/filter-remove-outline'
import IconLoading from '~icons/mdi/loading'
import IconTimer from '~icons/mdi/timer-outline'

const PAGE_SIZE = 20
/** No member id is a bare star, so it cannot be a constellation's key */
const ANY_CONSTELLATION = '*'

const { t } = useI18n()
const route = useRoute()
const { firebaseUser } = useAuth()

const groupId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const eventDefinitionId = ref('')
const constellation = ref(ANY_CONSTELLATION)
const filtered = computed(() => eventDefinitionId.value !== '' || constellation.value !== ANY_CONSTELLATION)

const error = ref<string | null>(null)
const loadMoreRef = ref<HTMLElement>()
const pagesLoaded = ref(1)

const { constellationGroups } = useGroupConstellations(groupId)

const variables = computed(() => ({
  groupId: groupId.value,
  limit: PAGE_SIZE,
  eventDefinitionId: eventDefinitionId.value === '' ? null : eventDefinitionId.value,
  constellation: constellation.value === ANY_CONSTELLATION ? null : constellationMemberIds(constellation.value)
}))

const resultsQuery = useGroupSpeedResultsQuery(
  () => ({ ...variables.value, startAfter: null }),
  () => ({ enabled: groupId.value !== '', fetchPolicy: 'cache-and-network' })
)
const { loading } = resultsQuery
const results = computed(() => resultsQuery.result.value?.group?.speedResults ?? [])
const hasMore = computed(() => results.value.length >= pagesLoaded.value * PAGE_SIZE)

resultsQuery.onError(err => { error.value = t('groups.speed.failed', { error: err.message }) })
resultsQuery.onResult(({ loading }) => { if (!loading) error.value = null })

// the first request may leave before the session is restored
watch(() => firebaseUser.value?.uid, () => { void resultsQuery.refetch() })

watch(variables, () => { pagesLoaded.value = 1 })

async function loadMore () {
  const lastResult = results.value[results.value.length - 1]
  if (!lastResult || !hasMore.value || loading.value) return
  await resultsQuery.fetchMore({ variables: { ...variables.value, startAfter: lastResult.createdAt } })
  pagesLoaded.value += 1
}

const throttledLoadMore = useThrottleFn(loadMore, 2000)

useIntersectionObserver(loadMoreRef, ([entry]) => {
  if (entry?.isIntersecting) void throttledLoadMore()
})

function clearFilters () {
  eventDefinitionId.value = ''
  constellation.value = ANY_CONSTELLATION
}
</script>

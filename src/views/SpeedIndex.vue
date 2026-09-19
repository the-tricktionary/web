<template>
  <div class="container mx-auto px-2 py-4 mb-20">
    <h1 class="mb-4">
      {{ t('speed.title') }}
    </h1>

    <div v-if="loading && !speedResults.length" class="flex items-center justify-center flex-col" role="status">
      <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
      {{ t('speed.loading') }}
    </div>

    <div v-else-if="!speedResults.length" class="flex items-center justify-center flex-col text-center" role="status">
      <icon-timer class="w-32 h-32" aria-hidden="true" />
      <p>{{ t('speed.empty') }}</p>
      <router-link :to="{ name: 'speed-create' }" class="btn w-max">
        {{ t('speed.recordFirst') }}
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
      <span class="flex px-2 items-center">{{ t('speed.newScore') }}</span>
    </router-link>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useIntersectionObserver, useThrottleFn } from '@vueuse/core'

import { useSpeedResultsQuery } from '../graphql/generated/graphql'

import SpeedBox from '../components/SpeedBox.vue'
import BottomBar from '../components/BottomBar.vue'
import IconLoading from '~icons/mdi/loading'
import IconPlus from '~icons/mdi/plus'
import IconTimer from '~icons/mdi/timer-outline'

const PAGE_SIZE = 20

const { t } = useI18n()

useHead({ title: computed(() => t('speed.title')) })

const loadMoreRef = ref<HTMLElement>()
const hasMore = ref(true)

const speedResultsQuery = useSpeedResultsQuery({ limit: PAGE_SIZE, startAfter: null }, { fetchPolicy: 'cache-and-network' })
const { loading } = speedResultsQuery
const speedResults = computed(() => speedResultsQuery.result.value?.me?.speedResults ?? [])

speedResultsQuery.onResult(({ data, loading }) => {
  if (loading) return
  // A short first page means there is nothing more to fetch
  hasMore.value = (data.me?.speedResults.length ?? 0) >= PAGE_SIZE
})

async function loadMore () {
  const lastResult = speedResults.value[speedResults.value.length - 1]
  if (!lastResult || !hasMore.value || loading.value) return
  const result = await speedResultsQuery.fetchMore({
    variables: { limit: PAGE_SIZE, startAfter: lastResult.createdAt }
  })
  hasMore.value = (result?.data.me?.speedResults.length ?? 0) >= PAGE_SIZE
}

const throttledLoadMore = useThrottleFn(loadMore, 2000)

useIntersectionObserver(loadMoreRef, ([entry]) => {
  if (entry?.isIntersecting) void throttledLoadMore()
})
</script>

<template>
  <!-- position: fixed? -->
  <!-- TODO <section class="container mx-auto p-2">filters: eventDefinition, participants</section> -->

  <section class="container mx-auto p-2">
    <div class="min-h-[100vh] grid grid-cols-1 gap-2">
      <speed-box v-for="speedResult of speedResults" :key="speedResult.id" :result="speedResult" />
    </div>

    <button
      ref="loadMoreRef"
      class="btn full-w mt-2"
      :disabled="speedResultsQuery.loading.value"
      @click="loadMore()"
    >
      <span v-if="speedResultsQuery.loading.value">
        <icon-loading class="animate-spin" />
      </span>
      <span v-else>Load more</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResult } from '@vue/apollo-composable'
import { useIntersectionObserver, useThrottleFn } from '@vueuse/core'

import { useSpeedResultsQuery } from '../graphql/generated/graphql'

import SpeedBox from '../components/SpeedBox.vue'
import IconLoading from 'virtual:vite-icons/mdi/loading'

const loadMoreRef = ref()

const speedResultsQuery = useSpeedResultsQuery({
  limit: 20,
  startAfter: null
}, { fetchPolicy: 'cache-and-network' })
const speedResults = useResult(speedResultsQuery.result, [], data => data.me?.speedResults)

function loadMore() {
  const lastResult = speedResults.value[speedResults.value.length - 1]
  if (!lastResult) return false
  speedResultsQuery.fetchMore({
    variables: {
      limit: 20,
      startAfter: lastResult.createdAt
    }
  })
}

const throttledLoadMore = useThrottleFn(loadMore, 10000)

useIntersectionObserver(loadMoreRef, () => {
  if (speedResultsQuery.loading.value) return

  throttledLoadMore()
})
</script>

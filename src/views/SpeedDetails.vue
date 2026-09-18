<template>
  <div v-if="loading && !speedResult" class="container mx-auto flex items-center justify-center flex-col" role="status">
    <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
    Loading score...
  </div>

  <div v-else-if="!speedResult" class="container mx-auto flex flex-col items-center justify-center">
    <h1 class="mt-10">
      Score not found
    </h1>
    <p>
      <router-link :to="{ name: 'speed' }">
        Back to your scores
      </router-link>
    </p>
  </div>

  <div v-else class="container mx-auto px-2 py-4 mb-20 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
    <div>
      <p class="text-muted font-semibold mb-0">
        <time :datetime="new Date(speedResult.createdAt).toISOString()">{{ formatDateTime(speedResult.createdAt) }}</time>
      </p>
      <h1 class="mb-4">
        {{ speedResult.name ?? speedResult.eventDefinition.name }}
      </h1>

      <p class="flex items-baseline gap-2 mb-6">
        <span class="text-6xl font-bold leading-none">{{ speedResult.count }}</span>
        <span class="text-muted">steps</span>
      </p>

      <dl class="grid grid-cols-[max-content_auto] gap-x-6 gap-y-2">
        <dt class="font-semibold">
          Event
        </dt>
        <dd>{{ speedResult.eventDefinition.name }}</dd>
        <dt class="font-semibold">
          Duration
        </dt>
        <dd>{{ formatDuration(speedResult.eventDefinition.totalDuration) }}</dd>

        <template v-if="speedResult.analysis">
          <dt class="font-semibold">
            Average pace
          </dt>
          <dd>{{ speedResult.analysis.stepsPerSecond }} steps/s</dd>
          <dt class="font-semibold">
            Peak pace
          </dt>
          <dd>{{ speedResult.analysis.maxStepsPerSecond }} steps/s</dd>
          <dt class="font-semibold">
            Misses
          </dt>
          <dd>{{ speedResult.analysis.misses }}</dd>
          <dt class="font-semibold">
            Steps lost
          </dt>
          <dd>{{ speedResult.analysis.stepsLost }}</dd>
        </template>
      </dl>
    </div>

    <div>
      <h2 class="mb-2">
        Edit
      </h2>
      <form class="flex flex-col gap-4" @submit.prevent="save()">
        <label class="flex flex-col gap-1">
          <span class="font-semibold">Name</span>
          <input
            v-model="editName"
            type="text"
            maxlength="120"
            class="rounded"
            :disabled="saving"
            :placeholder="speedResult.eventDefinition.name"
          >
        </label>
        <label class="flex flex-col gap-1">
          <span class="font-semibold">Score</span>
          <input
            v-model.number="editCount"
            type="number"
            min="0"
            max="1000000"
            step="1"
            inputmode="numeric"
            class="rounded"
            :disabled="saving || !!speedResult.analysis"
          >
          <span v-if="speedResult.analysis" class="text-muted text-sm">This score was counted live, so its total can't be edited.</span>
        </label>
        <p v-if="error" class="text-ttred-900" role="alert">
          {{ error }}
        </p>
        <button type="submit" class="btn" :disabled="saving || !dirty">
          <icon-loading v-if="saving" class="animate-spin inline-block" aria-hidden="true" />
          <span v-else>Save changes</span>
        </button>
        <button type="button" class="btn text-ttred-900" :disabled="saving" @click="remove()">
          Delete score
        </button>
      </form>
    </div>
  </div>

  <bottom-bar>
    <router-link :to="{ name: 'speed' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">All scores</span>
    </router-link>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'

import { useDeleteSpeedResultMutation, useSpeedResultQuery, useUpdateSpeedResultMutation } from '../graphql/generated/graphql'
import { formatDateTime, formatDuration } from '../helpers'
import { removeSpeedResultFromCache } from '../hooks/useSpeedResults'

import BottomBar from '../components/BottomBar.vue'
import IconLoading from '~icons/mdi/loading'
import IconChevronLeft from '~icons/mdi/chevron-left'

const route = useRoute()
const router = useRouter()

const speedResultId = computed(() => route.params.id as string)
const speedResultQuery = useSpeedResultQuery(() => ({ speedResultId: speedResultId.value }), { fetchPolicy: 'cache-and-network' })
const { loading } = speedResultQuery
const speedResult = computed(() => speedResultQuery.result.value?.me?.speedResult)

useHead({
  title: computed(() => speedResult.value ? `${speedResult.value.name ?? speedResult.value.eventDefinition.name} | the Tricktionary` : 'Speed | the Tricktionary')
})

const editName = ref('')
const editCount = ref<number>()
const error = ref<string | null>(null)

watch(speedResult, result => {
  editName.value = result?.name ?? ''
  editCount.value = result?.count
}, { immediate: true })

const dirty = computed(() => {
  if (!speedResult.value) return false
  if (editName.value.trim() !== (speedResult.value.name ?? '')) return true
  return !speedResult.value.analysis && Number.isSafeInteger(editCount.value) && editCount.value !== speedResult.value.count
})

const { mutate: update, loading: updating } = useUpdateSpeedResultMutation({})
const { mutate: deleteResult, loading: deleting } = useDeleteSpeedResultMutation(() => ({
  update (cache, { data }) {
    if (data?.deleteSpeedResult) removeSpeedResultFromCache(cache, data.deleteSpeedResult.id)
  }
}))
const saving = computed(() => updating.value || deleting.value)

async function save () {
  if (!speedResult.value || !dirty.value || saving.value) return
  error.value = null
  try {
    await update({
      speedResultId: speedResult.value.id,
      data: {
        name: editName.value.trim(),
        ...(!speedResult.value.analysis && Number.isSafeInteger(editCount.value) && editCount.value !== speedResult.value.count
          ? { count: editCount.value }
          : {})
      }
    })
  } catch (err) {
    error.value = `Failed to save: ${(err as Error).message}`
    throw err
  }
}

async function remove () {
  if (!speedResult.value || saving.value) return
  if (!window.confirm('Do you really want to delete this score? This cannot be undone.')) return
  error.value = null
  try {
    await deleteResult({ speedResultId: speedResult.value.id })
    await router.replace({ name: 'speed' })
  } catch (err) {
    error.value = `Failed to delete: ${(err as Error).message}`
    throw err
  }
}
</script>

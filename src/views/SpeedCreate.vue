<template>
  <div class="container mx-auto px-2 py-4 mb-20">
    <h1 class="mb-4">
      New speed score
    </h1>

    <form class="flex flex-col gap-4 max-w-120" @submit.prevent="save()">
      <label class="flex flex-col gap-1">
        <span class="font-semibold">Event</span>
        <select v-model="eventDefinitionId" required class="rounded" :disabled="saving">
          <option v-for="group of eventGroups" :key="group.label" disabled class="font-bold">
            {{ group.label }}
          </option>
          <template v-for="group of eventGroups" :key="`${group.label}-options`">
            <option v-for="eventDefinition of group.eventDefinitions" :key="eventDefinition.id" :value="eventDefinition.id">
              {{ eventDefinition.name }} ({{ formatDuration(eventDefinition.totalDuration) }})
            </option>
          </template>
          <option :value="CUSTOM">
            Custom event...
          </option>
        </select>
      </label>

      <template v-if="eventDefinitionId === CUSTOM">
        <label class="flex flex-col gap-1">
          <span class="font-semibold">Event name</span>
          <input
            v-model="customName"
            type="text"
            required
            maxlength="120"
            placeholder="e.g. 2x30s pairs"
            class="rounded"
            :disabled="saving"
          >
        </label>
        <label class="flex flex-col gap-1">
          <span class="font-semibold">Duration (seconds)</span>
          <input
            v-model.number="customDuration"
            type="number"
            required
            min="0"
            max="86400"
            step="1"
            class="rounded"
            :disabled="saving"
          >
          <span class="text-muted text-sm">Use 0 for events without a time limit</span>
        </label>
      </template>

      <label class="flex flex-col gap-1">
        <span class="font-semibold">Name <span class="text-muted font-normal">(optional)</span></span>
        <input
          v-model="name"
          type="text"
          maxlength="120"
          placeholder="e.g. Practice, Regionals 2026"
          class="rounded"
          :disabled="saving"
        >
      </label>

      <label class="flex flex-col gap-1">
        <span class="font-semibold">Score</span>
        <input
          v-model.number="count"
          type="number"
          required
          min="0"
          max="1000000"
          step="1"
          inputmode="numeric"
          class="rounded text-2xl"
          :disabled="saving"
        >
      </label>

      <p v-if="error" class="text-ttred-900" role="alert">
        Failed to save the score: {{ error }}
      </p>

      <button type="submit" class="btn" :disabled="saving || !valid">
        <icon-loading v-if="saving" class="animate-spin inline-block" aria-hidden="true" />
        <span v-else>Save score</span>
      </button>
    </form>
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { getAnalytics, logEvent } from '@firebase/analytics'

import { useCreateSpeedResultMutation, useEventDefinitionsQuery } from '../graphql/generated/graphql'
import { formatDuration } from '../helpers'
import useAuth from '../hooks/useAuth'
import { addSpeedResultToCache } from '../hooks/useSpeedResults'

import BottomBar from '../components/BottomBar.vue'
import IconLoading from '~icons/mdi/loading'
import IconChevronLeft from '~icons/mdi/chevron-left'

import type { EventDefinitionsQuery } from '../graphql/generated/graphql'

const CUSTOM = 'custom'

useHead({ title: 'New speed score | the Tricktionary' })

const router = useRouter()
const analytics = getAnalytics()
const { user } = useAuth()

const eventDefinitionsQuery = useEventDefinitionsQuery({ fetchPolicy: 'cache-first' })
const eventGroups = computed(() => {
  const groups = new Map<number, EventDefinitionsQuery['eventDefinitions']>()
  for (const eventDefinition of eventDefinitionsQuery.result.value?.eventDefinitions ?? []) {
    const group = groups.get(eventDefinition.totalDuration) ?? []
    group.push(eventDefinition)
    groups.set(eventDefinition.totalDuration, group)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([totalDuration, eventDefinitions]) => ({
      label: formatDuration(totalDuration),
      eventDefinitions: [...eventDefinitions].sort((a, b) => a.name.localeCompare(b.name))
    }))
})

const eventDefinitionId = ref<string>('')
const customName = ref('')
const customDuration = ref<number>(30)
const name = ref('')
const count = ref<number>()
const error = ref<string | null>(null)

const valid = computed(() => {
  if (!Number.isSafeInteger(count.value) || count.value! < 0) return false
  if (!eventDefinitionId.value) return false
  if (eventDefinitionId.value === CUSTOM) {
    return customName.value.trim().length > 0 && Number.isSafeInteger(customDuration.value) && customDuration.value >= 0
  }
  return true
})

const { mutate, loading: saving } = useCreateSpeedResultMutation(() => ({
  update (cache, { data }) {
    if (data?.createSpeedResult && user.value) {
      addSpeedResultToCache(cache, user.value.id, data.createSpeedResult)
    }
  }
}))

async function save () {
  if (!valid.value || saving.value) return
  error.value = null
  try {
    const result = await mutate({
      data: {
        count: count.value,
        ...(name.value.trim() ? { name: name.value.trim() } : {}),
        ...(eventDefinitionId.value === CUSTOM
          ? { eventDefinition: { name: customName.value.trim(), totalDuration: customDuration.value } }
          : { eventDefinitionId: eventDefinitionId.value })
      }
    })
    const created = result?.data?.createSpeedResult
    if (!created) throw new Error('No result returned')

    logEvent(analytics, 'post_score', {
      score: created.count,
      level_name: created.eventDefinition.name
    })
    await router.replace({ name: 'speed-details', params: { id: created.id } })
  } catch (err) {
    error.value = (err as Error).message
    throw err
  }
}
</script>

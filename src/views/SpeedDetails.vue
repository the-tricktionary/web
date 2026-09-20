<template>
  <div v-if="loading && !speedResult" class="container mx-auto flex items-center justify-center flex-col" role="status">
    <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
    {{ t('speed.details.loading') }}
  </div>

  <div v-else-if="!speedResult" class="container mx-auto flex flex-col items-center justify-center">
    <h1 class="mt-10">
      {{ t('speed.details.notFound') }}
    </h1>
    <p>
      <router-link :to="{ name: 'speed' }">
        {{ t('speed.details.backToScores') }}
      </router-link>
    </p>
  </div>

  <div v-else class="container mx-auto px-2 py-4 mb-20 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
    <div>
      <p class="text-muted font-semibold mb-0">
        <time :datetime="new Date(speedResult.createdAt).toISOString()">{{ dateTime(speedResult.createdAt) }}</time>
      </p>
      <h1 class="mb-4">
        {{ speedResult.name ?? speedResult.eventDefinition.name }}
      </h1>

      <p class="flex items-baseline gap-2 mb-6">
        <span class="text-6xl font-bold leading-none">{{ number(speedResult.count) }}</span>
        <span class="text-muted">{{ t('speed.steps') }}</span>
      </p>

      <dl class="grid grid-cols-[max-content_auto] gap-x-6 gap-y-2">
        <dt class="font-semibold">
          {{ t('speed.details.event') }}
        </dt>
        <dd>{{ speedResult.eventDefinition.name }}</dd>
        <dt class="font-semibold">
          {{ t('speed.details.duration') }}
        </dt>
        <dd>{{ duration(speedResult.eventDefinition.totalDuration) }}</dd>

        <template v-if="speedResult.analysis">
          <dt class="font-semibold">
            {{ t('speed.details.counted') }}
          </dt>
          <dd>{{ t('speed.details.countedLive', { duration: seconds(speedResult.analysis.duration, { tenths: true }) }) }}</dd>
          <dt class="font-semibold">
            {{ t('speed.details.averagePace') }}
          </dt>
          <dd>{{ t('speed.details.pace', { pace: number(speedResult.analysis.stepsPerSecond) }) }}</dd>
          <dt class="font-semibold">
            {{ t('speed.details.peakPace') }}
          </dt>
          <dd>{{ t('speed.details.pace', { pace: number(speedResult.analysis.maxStepsPerSecond) }) }}</dd>
          <dt class="font-semibold">
            {{ t('speed.details.misses') }}
          </dt>
          <dd>{{ speedResult.analysis.misses }}</dd>
          <dt class="font-semibold">
            {{ t('speed.details.stepsLost') }}
          </dt>
          <dd>{{ speedResult.analysis.stepsLost }}</dd>
        </template>
      </dl>

      <template v-if="speedResult.analysis">
        <h2 class="mt-6 mb-2">
          {{ t('speed.details.paceTitle') }}
        </h2>
        <speed-pace-chart
          :series="[{ label: speedResult.name ?? speedResult.eventDefinition.name, stepsPerSecondSeries: speedResult.analysis.stepsPerSecondSeries }]"
          :segments="speedResult.analysis.segments"
          :chart-label="t('speed.chart.paceOf', { event: speedResult.eventDefinition.name })"
        />

        <table v-if="speedResult.analysis.segments.length > 1" class="w-full border-collapse mt-4">
          <caption class="text-left font-semibold mb-1">
            {{ t('speed.details.perAthlete') }}
          </caption>
          <thead>
            <tr class="border-b border-line text-left">
              <th scope="col" class="py-1 pr-2">
                {{ t('speed.details.segment') }}
              </th>
              <th scope="col" class="py-1 pr-2">
                {{ t('speed.details.time') }}
              </th>
              <th scope="col" class="py-1 pr-2 text-right">
                {{ t('speed.details.steps') }}
              </th>
              <th scope="col" class="py-1 text-right">
                {{ t('speed.details.paceColumn') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="segment of speedResult.analysis.segments" :key="segment.index" class="border-b border-line">
              <td class="py-1 pr-2">
                {{ segment.label ?? t('speed.details.segmentN', { n: segment.index + 1 }) }}
              </td>
              <td class="py-1 pr-2 tabular-nums">
                {{ seconds(segment.start) }} – {{ seconds(segment.end) }}
              </td>
              <td class="py-1 pr-2 text-right tabular-nums">
                {{ number(segment.count) }}
              </td>
              <td class="py-1 text-right tabular-nums">
                {{ t('speed.details.pace', { pace: number(segment.stepsPerSecond) }) }}
              </td>
            </tr>
          </tbody>
        </table>

        <router-link :to="{ name: 'speed-compare', query: { a: speedResult.id } }" class="btn w-max mt-4">
          {{ t('speed.details.compare') }}
        </router-link>
      </template>
    </div>

    <div>
      <h2 class="mb-2">
        {{ t('speed.details.edit') }}
      </h2>
      <form :id="formId" class="flex flex-col gap-4" @submit.prevent="save()">
        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('speed.details.name') }}</span>
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
          <span class="font-semibold flex items-center gap-1">
            {{ t('speed.details.score') }}
            <icon-lock v-if="speedResult.analysis" class="text-muted" aria-hidden="true" />
          </span>
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
          <span v-if="speedResult.analysis" class="text-muted text-sm">{{ t('speed.details.scoreLocked') }}</span>
        </label>
      </form>
    </div>
  </div>

  <bottom-bar v-if="error">
    <p class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>
  </bottom-bar>

  <bottom-bar>
    <router-link :to="{ name: 'speed' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.allScores') }}</span>
    </router-link>

    <div v-if="speedResult" class="flex gap-4 ml-auto">
      <button
        type="button"
        class="btn grid grid-cols-[2rem_auto] w-max mt-0 text-ttred-900"
        :disabled="saving"
        @click="remove()"
      >
        <span class="flex h-full items-center justify-center" aria-hidden="true">
          <icon-delete />
        </span>
        <span class="flex px-2 items-center">{{ t('speed.details.delete') }}</span>
      </button>

      <button
        type="submit"
        :form="formId"
        class="btn grid grid-cols-[2rem_auto] w-max mt-0"
        :disabled="saving || !dirty"
      >
        <span class="flex h-full items-center justify-center" aria-hidden="true">
          <icon-loading v-if="saving" class="animate-spin" />
          <icon-content-save v-else />
        </span>
        <span class="flex px-2 items-center">{{ t('speed.details.saveChanges') }}</span>
      </button>
    </div>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'

import { useDeleteSpeedResultMutation, useSpeedResultQuery, useUpdateSpeedResultMutation } from '../graphql/generated/graphql'
import useSpeedFormat from '../hooks/useSpeedFormat'
import { removeSpeedResultFromCache } from '../hooks/useSpeedResults'

import BottomBar from '../components/BottomBar.vue'
import SpeedPaceChart from '../components/SpeedPaceChart.vue'
import IconLoading from '~icons/mdi/loading'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconContentSave from '~icons/mdi/content-save'
import IconDelete from '~icons/mdi/delete'
import IconLock from '~icons/mdi/lock'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { dateTime, duration, number, seconds } = useSpeedFormat()

/** Lets the save button live in the bottom bar, outside the form element */
const formId = useId()

const speedResultId = computed(() => route.params.id as string)
const speedResultQuery = useSpeedResultQuery(() => ({ speedResultId: speedResultId.value }), { fetchPolicy: 'cache-and-network' })
const { loading } = speedResultQuery
const speedResult = computed(() => speedResultQuery.result.value?.me?.speedResult)

useHead({
  title: computed(() => speedResult.value ? speedResult.value.name ?? speedResult.value.eventDefinition.name : t('speed.title'))
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
    error.value = t('speed.details.failedSave', { error: (err as Error).message })
    throw err
  }
}

async function remove () {
  if (!speedResult.value || saving.value) return
  if (!window.confirm(t('speed.details.confirmDelete'))) return
  error.value = null
  try {
    await deleteResult({ speedResultId: speedResult.value.id })
    await router.replace({ name: 'speed' })
  } catch (err) {
    error.value = t('speed.details.failedDelete', { error: (err as Error).message })
    throw err
  }
}
</script>

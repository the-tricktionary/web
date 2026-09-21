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

        <router-link :to="{ name: 'speed-compare', query: { a: speedResult.id } }" class="btn w-max mt-4">
          {{ t('speed.details.compare') }}
        </router-link>
      </template>

      <template v-if="speedResult.segments.length > 1">
        <table class="w-full border-collapse mt-4">
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
            <tr v-for="segment of speedResult.segments" :key="segment.index" class="border-b border-line">
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
      </template>
    </div>

    <div>
      <template v-if="canManage">
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

          <icon-checkbox
            v-if="canSplit"
            :checked="editPerSegment"
            :disabled="saving"
            @update:checked="editPerSegment = $event"
          >
            {{ t('speed.create.perSegment') }}
          </icon-checkbox>

          <segment-counts-input
            v-if="canSplit && editPerSegment"
            v-model="editSegmentCounts"
            :segments="eventSegments"
            :total="editCount"
            :disabled="saving"
          />

          <label class="flex flex-col gap-1">
            <span class="font-semibold">{{ t('speed.group.label') }}</span>
            <group-picker v-model="editGroupId" :disabled="saving" />
          </label>

          <participant-picker
            v-if="editGroupId"
            v-model="editParticipants"
            :group-id="editGroupId"
            :segments="segments"
            :disabled="saving"
          />
        </form>
      </template>

      <template v-else-if="speedResult.group">
        <h2 class="mb-2">
          {{ t('speed.group.title') }}
        </h2>
        <p class="font-semibold">
          {{ speedResult.group.name }}
        </p>

        <h3 class="font-semibold mb-1">
          {{ t('speed.group.whoCompeted') }}
        </h3>
        <p v-if="!speedResult.participants.length" class="text-muted">
          {{ t('speed.group.needsAthletes') }}
        </p>
        <dl v-else class="grid grid-cols-[max-content_auto] gap-x-6 gap-y-2">
          <template v-for="participant of speedResult.participants" :key="participant.member.id">
            <dt class="text-muted">
              {{ participantLabel(participant.segmentIndex) }}
            </dt>
            <dd>{{ participant.member.name }}</dd>
          </template>
        </dl>
      </template>
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

    <div v-if="speedResult && canManage" class="flex gap-4 ml-auto">
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
        :disabled="saving || !dirty || !valid"
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

import {
  GroupRole,
  useDeleteSpeedResultMutation,
  useSetSpeedResultGroupMutation,
  useSpeedResultQuery,
  useUpdateSpeedResultMutation
} from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useSpeedFormat from '../hooks/useSpeedFormat'
import { removeSpeedResultFromCache } from '../hooks/useSpeedResults'
import { segmentsOf } from '../helpers'

import type { SpeedParticipantInput, SpeedResultQuery } from '../graphql/generated/graphql'

import BottomBar from '../components/BottomBar.vue'
import GroupPicker from '../components/GroupPicker.vue'
import IconCheckbox from '../components/IconCheckbox.vue'
import ParticipantPicker from '../components/ParticipantPicker.vue'
import SegmentCountsInput from '../components/SegmentCountsInput.vue'
import SpeedPaceChart from '../components/SpeedPaceChart.vue'
import IconLoading from '~icons/mdi/loading'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconContentSave from '~icons/mdi/content-save'
import IconDelete from '~icons/mdi/delete'
import IconLock from '~icons/mdi/lock'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { firebaseUser } = useAuth()
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

/** The creator and the admins of the group it is shared with may edit it */
const canManage = computed(() => {
  if (!speedResult.value) return false
  return speedResult.value.creator.id === firebaseUser.value?.uid ||
    speedResult.value.group?.myMembership?.role === GroupRole.Admin
})

/** The legs the score itself has, a score that says nothing about them was competed whole */
const segments = computed(() => speedResult.value?.segments ?? [])

/** What the event splits into, so a plain count can be given a count per leg */
const eventSegments = computed(() => {
  const eventDefinition = speedResult.value?.eventDefinition
  if (!eventDefinition) return []
  return segmentsOf(eventDefinition.totalDuration, eventDefinition.timingTrack?.cues ?? [])
})

const canSplit = computed(() => !speedResult.value?.analysis && eventSegments.value.length > 1)

const editName = ref('')
const editCount = ref<number>()
const editPerSegment = ref(false)
const editSegmentCounts = ref<Array<number | undefined>>([])
const editGroupId = ref('')
const editParticipants = ref<SpeedParticipantInput[]>([])
const error = ref<string | null>(null)

type Result = NonNullable<NonNullable<SpeedResultQuery['me']>['speedResult']>

function participantsOf (result: Result | null | undefined): SpeedParticipantInput[] {
  return result?.participants.map(participant => ({
    memberId: participant.member.id,
    ...(participant.segmentIndex == null ? {} : { segmentIndex: participant.segmentIndex })
  })) ?? []
}

/** Follows the saved values, so a refetch doesn't wipe what is being edited */
watch(speedResult, result => {
  editName.value = result?.name ?? ''
  editCount.value = result?.count
  editPerSegment.value = !!result?.segmentCounts?.length
  editSegmentCounts.value = [...result?.segmentCounts ?? []]
  editGroupId.value = result?.group?.id ?? ''
  editParticipants.value = participantsOf(result)
}, { immediate: true })

// the seeding above sets the saved group, so only a real change clears who competed
watch(editGroupId, groupId => {
  if (groupId !== (speedResult.value?.group?.id ?? '')) editParticipants.value = []
})

const participantKey = (participants: readonly SpeedParticipantInput[]) => participants
  .map(participant => `${participant.segmentIndex ?? ''}:${String(participant.memberId)}`)
  .sort((a, b) => a.localeCompare(b))
  .join(',')

/** The legs as they would be saved, an empty list clears them */
const editedSegmentCounts = computed(() => canSplit.value && editPerSegment.value ? editSegmentCounts.value : [])

const segmentCountsKey = (counts: ReadonlyArray<number | undefined>) => counts.map(count => count ?? '').join(',')

/** The count and its legs are one record, so a change to either sends both */
const countRecordDirty = computed(() => {
  if (!speedResult.value || speedResult.value.analysis) return false
  if (Number.isSafeInteger(editCount.value) && editCount.value !== speedResult.value.count) return true
  return segmentCountsKey(editedSegmentCounts.value) !== segmentCountsKey(speedResult.value.segmentCounts ?? [])
})

const detailsDirty = computed(() => {
  if (!speedResult.value) return false
  if (editName.value.trim() !== (speedResult.value.name ?? '')) return true
  return countRecordDirty.value
})

const sharingDirty = computed(() => {
  if (!speedResult.value) return false
  if (editGroupId.value !== (speedResult.value.group?.id ?? '')) return true
  return participantKey(editParticipants.value) !== participantKey(participantsOf(speedResult.value))
})

const dirty = computed(() => detailsDirty.value || sharingDirty.value)

const segmentSum = computed(() => editedSegmentCounts.value.reduce<number>((steps, segmentCount) => steps + (Number.isSafeInteger(segmentCount) ? segmentCount! : 0), 0))

const valid = computed(() => {
  if (!countRecordDirty.value) return true
  if (!Number.isSafeInteger(editCount.value) || editCount.value! < 0) return false
  if (!editedSegmentCounts.value.length) return true
  return editedSegmentCounts.value.length === eventSegments.value.length &&
    editedSegmentCounts.value.every(segmentCount => Number.isSafeInteger(segmentCount) && segmentCount! >= 0) &&
    segmentSum.value === editCount.value
})

function participantLabel (segmentIndex: number | null) {
  if (segmentIndex == null) return t('speed.group.wholeScore')
  const segment = segments.value.find(entry => entry.index === segmentIndex)
  return segment?.label ?? t('speed.details.segmentN', { n: segmentIndex + 1 })
}

const { mutate: update, loading: updating } = useUpdateSpeedResultMutation({})
const { mutate: setGroup, loading: sharing } = useSetSpeedResultGroupMutation({})
const { mutate: deleteResult, loading: deleting } = useDeleteSpeedResultMutation(() => ({
  update (cache, { data }) {
    if (data?.deleteSpeedResult) removeSpeedResultFromCache(cache, data.deleteSpeedResult.id)
  }
}))
const saving = computed(() => updating.value || sharing.value || deleting.value)

async function save () {
  if (!speedResult.value || !dirty.value || saving.value) return
  error.value = null
  try {
    if (detailsDirty.value) {
      await update({
        speedResultId: speedResult.value.id,
        data: {
          name: editName.value.trim(),
          ...(countRecordDirty.value
            ? {
                count: editCount.value,
                ...(editedSegmentCounts.value.length
                  ? { segmentCounts: editedSegmentCounts.value.map(segmentCount => segmentCount ?? 0) }
                  : {})
              }
            : {})
        }
      })
    }
    if (sharingDirty.value) {
      await setGroup({
        speedResultId: speedResult.value.id,
        data: {
          groupId: editGroupId.value === '' ? null : editGroupId.value,
          participants: editGroupId.value === '' ? [] : editParticipants.value
        }
      })
    }
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

<template>
  <div class="container mx-auto px-2 py-4 mb-20">
    <h1 class="mb-4">
      {{ t('speed.create.title') }}
    </h1>

    <form :id="formId" class="flex flex-col gap-4 max-w-120" @submit.prevent="save()">
      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('speed.create.event') }}</span>
        <event-picker v-model="eventDefinitionId" allow-custom required :disabled="saving" />
      </label>

      <custom-event-fields
        v-if="eventDefinitionId === CUSTOM_EVENT"
        v-model:name="customName"
        v-model:total-duration="customDuration"
        v-model:cues="cues"
        v-model:opening-label="openingLabel"
        v-model:valid="customValid"
        :disabled="saving"
      />

      <label v-if="groups.length" class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('speed.group.label') }} <span class="text-muted font-normal">{{ t('speed.create.optional') }}</span></span>
        <group-picker v-model="groupId" :disabled="saving" />
      </label>

      <participant-picker
        v-if="groupId"
        v-model="participants"
        :group-id="groupId"
        :segments="segments"
        :disabled="saving"
      />

      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('speed.create.name') }} <span class="text-muted font-normal">{{ t('speed.create.optional') }}</span></span>
        <input
          v-model="name"
          type="text"
          maxlength="120"
          :placeholder="t('speed.create.namePlaceholder')"
          class="rounded"
          :disabled="saving"
        >
      </label>

      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('speed.create.score') }}</span>
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

      <icon-checkbox
        v-if="segments.length > 1"
        :checked="perSegment"
        :disabled="saving"
        @update:checked="perSegment = $event"
      >
        {{ t('speed.create.perSegment') }}
      </icon-checkbox>

      <segment-counts-input
        v-if="perSegment && segments.length > 1"
        v-model="segmentCounts"
        :segments="segments"
        :total="count"
        :disabled="saving"
      />
    </form>
  </div>

  <bottom-bar v-if="error">
    <p class="text-ttred-900 mb-0" role="alert">
      {{ t('speed.create.failed', { error }) }}
    </p>
  </bottom-bar>

  <bottom-bar>
    <router-link :to="{ name: 'speed' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.allScores') }}</span>
    </router-link>

    <button
      type="submit"
      :form="formId"
      class="btn grid grid-cols-[2rem_auto] w-max mt-0 ml-auto"
      :disabled="saving || !valid"
    >
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-loading v-if="saving" class="animate-spin" />
        <icon-content-save v-else />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.create.save') }}</span>
    </button>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { getAnalytics, logEvent } from '@firebase/analytics'

import { useCreateSpeedResultMutation } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useEventDefinitions from '../hooks/useEventDefinitions'
import useMyGroups from '../hooks/useMyGroups'
import { addSpeedResultToCache } from '../hooks/useSpeedResults'
import { CUSTOM_EVENT, segmentsOf, switchCuesInput } from '../helpers'

import type { SpeedParticipantInput } from '../graphql/generated/graphql'
import type { SwitchRow } from '../helpers'

import BottomBar from '../components/BottomBar.vue'
import CustomEventFields from '../components/CustomEventFields.vue'
import EventPicker from '../components/EventPicker.vue'
import GroupPicker from '../components/GroupPicker.vue'
import IconCheckbox from '../components/IconCheckbox.vue'
import ParticipantPicker from '../components/ParticipantPicker.vue'
import SegmentCountsInput from '../components/SegmentCountsInput.vue'
import IconLoading from '~icons/mdi/loading'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconContentSave from '~icons/mdi/content-save'

const { t } = useI18n()

/** Lets the submit button live in the bottom bar, outside the form element */
const formId = useId()

useHead({ title: computed(() => t('speed.create.title')) })

const router = useRouter()
const analytics = getAnalytics()
const { user } = useAuth()

const eventDefinitionId = ref<string>('')
const customName = ref('')
const customDuration = ref<number>(30)
const cues = ref<SwitchRow[]>([])
const openingLabel = ref('')
const customValid = ref(false)
const name = ref('')
const count = ref<number>()
const perSegment = ref(false)
const segmentCounts = ref<Array<number | undefined>>([])
const groupId = ref('')
const participants = ref<SpeedParticipantInput[]>([])
const error = ref<string | null>(null)

const { eventDefinitions } = useEventDefinitions()
const { groups } = useMyGroups()

const selectedEvent = computed(() => eventDefinitions.value.find(eventDefinition => eventDefinition.id === eventDefinitionId.value))

/** The legs the score can be split between, from whichever kind of event is picked */
const segments = computed(() => eventDefinitionId.value === CUSTOM_EVENT
  ? segmentsOf(customDuration.value, switchCuesInput(cues.value, openingLabel.value).cues ?? [])
  : segmentsOf(selectedEvent.value?.totalDuration ?? 0, selectedEvent.value?.timingTrack?.cues ?? [])
)

// a different group's athletes are not this one's
watch(groupId, () => { participants.value = [] })

// the legs of one event say nothing about another's
watch(() => segments.value.length, length => {
  if (length < 2) perSegment.value = false
  segmentCounts.value = Array.from({ length }, () => undefined)
})

const segmentSum = computed(() => segmentCounts.value.reduce<number>((steps, segmentCount) => steps + (Number.isSafeInteger(segmentCount) ? segmentCount! : 0), 0))

const segmentCountsValid = computed(() =>
  segmentCounts.value.length === segments.value.length &&
  segmentCounts.value.every(segmentCount => Number.isSafeInteger(segmentCount) && segmentCount! >= 0) &&
  segmentSum.value === count.value
)

const valid = computed(() => {
  if (!Number.isSafeInteger(count.value) || count.value! < 0) return false
  if (!eventDefinitionId.value) return false
  if (perSegment.value && !segmentCountsValid.value) return false
  return eventDefinitionId.value !== CUSTOM_EVENT || customValid.value
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
        ...(perSegment.value ? { segmentCounts: segmentCounts.value.map(segmentCount => segmentCount ?? 0) } : {}),
        ...(name.value.trim() ? { name: name.value.trim() } : {}),
        ...(eventDefinitionId.value === CUSTOM_EVENT
          ? {
              eventDefinition: {
                name: customName.value.trim(),
                totalDuration: customDuration.value,
                ...switchCuesInput(cues.value, openingLabel.value)
              }
            }
          : { eventDefinitionId: eventDefinitionId.value }),
        ...(groupId.value ? { groupId: groupId.value, participants: participants.value } : {})
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

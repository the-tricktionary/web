<template>
  <fieldset class="border-none p-0 m-0 flex flex-col gap-2" :disabled="disabled">
    <legend class="font-semibold p-0 mb-1">
      {{ t('speed.group.whoCompeted') }}
    </legend>

    <p v-if="loading && !athletes.length" class="text-muted text-sm mb-0" role="status">
      {{ t('groups.members.loading') }}
    </p>
    <p v-else-if="!athletes.length" class="text-muted text-sm mb-0">
      {{ t('speed.group.noAthletes') }}
    </p>
    <template v-else>
      <label v-for="pick of picks" :key="pick.key" class="flex flex-col gap-1">
        <span class="text-muted text-sm">{{ pick.label }}</span>
        <select
          class="rounded"
          :value="pick.memberId"
          @change="assign(pick.segmentIndex, ($event.target as HTMLSelectElement).value)"
        >
          <option value="">
            {{ t('speed.group.unassigned') }}
          </option>
          <option v-for="athlete of optionsFor(pick.memberId)" :key="athlete.id" :value="athlete.id">
            {{ athlete.name }}
          </option>
        </select>
      </label>
    </template>
  </fieldset>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useGroupMembersQuery } from '../graphql/generated/graphql'

import type { SpeedParticipantInput } from '../graphql/generated/graphql'

/** Enough of a leg to label a picker, from segmentsOf or from an analysis */
interface ParticipantSegment {
  index: number
  label?: string | null
}

const props = withDefaults(defineProps<{
  groupId: string
  /** What the event is divided into, a single entry for a score competed whole */
  segments: readonly ParticipantSegment[]
  disabled?: boolean
}>(), {
  disabled: false
})

const participants = defineModel<SpeedParticipantInput[]>({ required: true })

const { t } = useI18n()

const membersQuery = useGroupMembersQuery(
  () => ({ groupId: props.groupId }),
  () => ({ enabled: props.groupId !== '', fetchPolicy: 'cache-and-network' })
)
const { loading } = membersQuery

const athletes = computed(() => (membersQuery.result.value?.group?.members ?? []).filter(member => !member.observer))

function memberAt (segmentIndex: number | null) {
  const participant = participants.value.find(entry => (entry.segmentIndex ?? null) === segmentIndex)
  return participant ? String(participant.memberId) : ''
}

/** One picker for the whole score, or one per leg, never a mixture */
const picks = computed(() => props.segments.length > 1
  ? props.segments.map(segment => ({
    key: String(segment.index),
    segmentIndex: segment.index,
    label: segment.label ?? t('speed.details.segmentN', { n: segment.index + 1 }),
    memberId: memberAt(segment.index)
  }))
  : [{ key: 'whole', segmentIndex: null, label: t('speed.group.wholeScore'), memberId: memberAt(null) }]
)

function optionsFor (memberId: string) {
  const taken = new Set(participants.value.map(entry => String(entry.memberId)))
  return athletes.value.filter(athlete => athlete.id === memberId || !taken.has(athlete.id))
}

function assign (segmentIndex: number | null, memberId: string) {
  const others = participants.value.filter(entry =>
    // an assignment made the other way around cannot stay, the two never mix
    (entry.segmentIndex == null) === (segmentIndex == null) &&
    (entry.segmentIndex ?? null) !== segmentIndex &&
    String(entry.memberId) !== memberId
  )
  participants.value = memberId === ''
    ? others
    : [...others, { memberId, ...(segmentIndex == null ? {} : { segmentIndex }) }]
        .sort((a, b) => (a.segmentIndex ?? 0) - (b.segmentIndex ?? 0))
}

// an event divided differently cannot keep what was assigned against the last one
watch(() => props.segments.length, () => { participants.value = [] })
</script>

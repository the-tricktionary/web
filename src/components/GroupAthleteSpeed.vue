<template>
  <section class="flex flex-col gap-4">
    <h2 class="mb-0">
      {{ t('groups.speed.athleteTitle') }}
    </h2>

    <p v-if="!athletes.length" class="text-muted mb-0">
      {{ t('groups.speed.noAthletes') }}
    </p>

    <template v-else>
      <label class="flex flex-col gap-1 min-w-60 max-w-120">
        <span class="font-semibold">{{ t('groups.speed.athlete') }}</span>
        <select v-model="memberId" class="rounded">
          <option value="" disabled>
            {{ t('groups.speed.pickAthlete') }}
          </option>
          <option v-for="athlete of athletes" :key="athlete.id" :value="athlete.id">
            {{ athlete.name }}
          </option>
        </select>
      </label>

      <p v-if="error" class="text-ttred-900 mb-0" role="alert">
        {{ error }}
      </p>

      <template v-if="member">
        <div v-if="loading && !bests.length" class="flex items-center justify-center flex-col" role="status">
          <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
          {{ t('groups.speed.loading') }}
        </div>

        <template v-else>
          <h3 class="mb-0">
            {{ t('groups.speed.bests') }}
          </h3>
          <p v-if="!bests.length" class="text-muted mb-0">
            {{ t('groups.speed.bestsEmpty', { name: member.name }) }}
          </p>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <speed-box v-for="best of bests" :key="best.id" :result="best" />
          </div>

          <p v-if="!eventDefinitionId" class="text-muted mb-0">
            {{ t('groups.speed.pickEventFor', { name: member.name }) }}
          </p>

          <p v-else-if="!points.length" class="text-muted mb-0">
            {{ t('groups.speed.athleteEmpty', { name: member.name }) }}
          </p>

          <template v-else>
            <speed-progression-chart
              :points="points"
              :series="series"
              :chart-label="t('groups.speed.athleteChart', { name: member.name, event: eventName })"
            />
            <p class="text-muted text-sm mb-0">
              {{ t('groups.speed.athleteCaption') }}
            </p>

            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-line text-left">
                  <th scope="col" class="py-2 pr-2">
                    {{ t('speed.progress.date') }}
                  </th>
                  <th scope="col" class="py-2 pr-2">
                    {{ t('groups.speed.leg') }}
                  </th>
                  <th scope="col" class="py-2 pr-2">
                    {{ t('groups.speed.constellation') }}
                  </th>
                  <th scope="col" class="py-2 pr-2 text-right">
                    {{ t('speed.progress.steps') }}
                  </th>
                  <th scope="col" class="py-2 pr-2 text-right">
                    {{ t('speed.details.paceColumn') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row of rows" :key="row.id" class="border-b border-line">
                  <td class="py-2 pr-2">
                    <router-link :to="{ name: 'speed-details', params: { id: row.resultId } }">
                      {{ dateTime(row.createdAt) }}
                    </router-link>
                  </td>
                  <td class="py-2 pr-2">
                    {{ row.leg }}
                  </td>
                  <td class="py-2 pr-2">
                    {{ row.constellation }}
                  </td>
                  <td class="py-2 pr-2 text-right tabular-nums">
                    {{ number(row.count) }}
                  </td>
                  <td class="py-2 pr-2 text-right tabular-nums">
                    {{ row.stepsPerSecond == null ? '—' : t('speed.details.pace', { pace: number(row.stepsPerSecond) }) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </template>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useGroupMembersQuery, useGroupMemberSpeedQuery } from '../graphql/generated/graphql'
import { constellationKey, constellationNames } from '../helpers'
import useAuth from '../hooks/useAuth'
import useEventDefinitions from '../hooks/useEventDefinitions'
import useSpeedFormat from '../hooks/useSpeedFormat'

import SpeedBox from './SpeedBox.vue'
import SpeedProgressionChart from './SpeedProgressionChart.vue'
import IconLoading from '~icons/mdi/loading'

import type { ProgressionPoint } from './SpeedProgressionChart.vue'

const props = defineProps<{
  groupId: string
  /** The event the tab is filtered to, no progression without one */
  eventDefinitionId: string
}>()

const { t } = useI18n()
const { dateTime, number } = useSpeedFormat()
const { firebaseUser } = useAuth()
const { eventDefinitions } = useEventDefinitions()

const memberId = ref('')
const error = ref<string | null>(null)

const membersQuery = useGroupMembersQuery(
  () => ({ groupId: props.groupId }),
  () => ({ enabled: props.groupId !== '', fetchPolicy: 'cache-and-network' })
)

const speedQuery = useGroupMemberSpeedQuery(
  () => ({
    groupId: props.groupId,
    eventDefinitionId: props.eventDefinitionId,
    withProgression: props.eventDefinitionId !== ''
  }),
  () => ({ enabled: memberId.value !== '' && props.groupId !== '', fetchPolicy: 'cache-and-network' })
)
const { loading } = speedQuery

speedQuery.onError(err => { error.value = t('groups.speed.failed', { error: err.message }) })
speedQuery.onResult(({ loading }) => { if (!loading) error.value = null })

// the first request may leave before the session is restored
watch(() => firebaseUser.value?.uid, () => {
  void membersQuery.refetch()
  if (memberId.value) void speedQuery.refetch()
})

const athletes = computed(() => (membersQuery.result.value?.group?.members ?? [])
  .filter(member => !member.observer)
  .toSorted((a, b) => a.name.localeCompare(b.name))
)

const member = computed(() => athletes.value.find(athlete => athlete.id === memberId.value) ?? null)
const speedMember = computed(() => speedQuery.result.value?.group?.members.find(entry => entry.id === memberId.value) ?? null)
const bests = computed(() => speedMember.value?.speedPersonalBests ?? [])
const progression = computed(() => speedMember.value?.speedProgression ?? [])

const eventName = computed(() => eventDefinitions.value.find(eventDefinition => eventDefinition.id === props.eventDefinitionId)?.name ?? '')

const rows = computed(() => progression.value.map(entry => {
  const members = entry.result.participants.map(participant => participant.member)
  return {
    id: `${entry.result.id}-${entry.segment?.index ?? 'whole'}`,
    resultId: entry.result.id,
    createdAt: entry.result.createdAt,
    count: entry.count,
    stepsPerSecond: entry.stepsPerSecond,
    leg: entry.segment
      ? entry.segment.label ?? t('speed.details.segmentN', { n: entry.segment.index + 1 })
      : t('speed.group.wholeScore'),
    key: constellationKey(members.map(athlete => athlete.id)),
    constellation: constellationNames(members)
  }
}))

// the API answers newest first, a progression reads the other way round
const points = computed<ProgressionPoint[]>(() => rows.value.toReversed().map(row => ({
  id: row.id,
  date: new Date(row.createdAt),
  count: row.count,
  name: row.leg,
  series: row.constellation
})))

const series = computed(() => {
  const counts = new Map<string, { label: string, count: number }>()
  for (const row of rows.value) {
    const seen = counts.get(row.key)
    counts.set(row.key, { label: row.constellation, count: (seen?.count ?? 0) + 1 })
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map(entry => entry.label)
})
</script>

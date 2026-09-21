<template>
  <div class="flex flex-col gap-4">
    <h2 class="mb-0">
      {{ t('groups.speed.bests') }}
    </h2>

    <div v-if="membersLoading && !athletes.length" class="flex items-center justify-center flex-col" role="status">
      <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
      {{ t('groups.speed.loading') }}
    </div>

    <p v-else-if="!athletes.length" class="text-muted mb-0">
      {{ t('groups.speed.noAthletes') }}
    </p>

    <template v-else>
      <label class="flex flex-col gap-1 min-w-60 max-w-120">
        <span class="font-semibold">{{ t('groups.speed.athlete') }}</span>
        <select v-model="memberId" class="rounded">
          <option value="" disabled>
            {{ t('groups.speed.pickAthlete') }}
          </option>
          <option v-for="option of athletes" :key="option.id" :value="option.id">
            {{ option.name }}
          </option>
        </select>
      </label>

      <p v-if="error" class="text-ttred-900 mb-0" role="alert">
        {{ error }}
      </p>

      <p v-if="!member" class="text-muted mb-0">
        {{ t('groups.speed.bestsPick') }}
      </p>

      <div v-else-if="loading && !bests.length" class="flex items-center justify-center flex-col" role="status">
        <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
        {{ t('groups.speed.loading') }}
      </div>

      <p v-else-if="!bests.length" class="text-muted mb-0">
        {{ t('groups.speed.bestsEmpty', { name: member.name }) }}
      </p>

      <template v-else>
        <section class="flex flex-col gap-2">
          <h3 class="font-semibold mb-0">
            {{ t('groups.speed.bestTotals') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <speed-box
              v-for="best of bests"
              :key="best.eventDefinition.id"
              :result="best.total"
              :to="{ name: 'speed-details', params: { id: best.total.id }, query: { group: groupId } }"
            />
          </div>
        </section>

        <section v-if="segmentBests.length" class="flex flex-col gap-2">
          <h3 class="font-semibold mb-0">
            {{ t('groups.speed.bestSegments') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <speed-box
              v-for="best of segmentBests"
              :key="best.eventDefinition.id"
              :result="best.ownSegment.result"
              :title="segmentLabel(best.ownSegment.segment)"
              :count="best.ownSegment.count"
              :note="paceNote(best.ownSegment.stepsPerSecond)"
              :to="{ name: 'speed-details', params: { id: best.ownSegment.result.id }, query: { group: groupId } }"
            />
          </div>
        </section>
      </template>
    </template>
  </div>

  <group-bottom-bar />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useGroupMemberBestsQuery, useGroupMembersQuery } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useSpeedFormat from '../hooks/useSpeedFormat'

import GroupBottomBar from '../components/GroupBottomBar.vue'
import SpeedBox from '../components/SpeedBox.vue'
import IconLoading from '~icons/mdi/loading'

import type { SpeedPersonalBestBaseFragment } from '../graphql/generated/graphql'

type PersonalBest = SpeedPersonalBestBaseFragment
type OwnSegment = NonNullable<PersonalBest['ownSegment']>

const { t } = useI18n()
const route = useRoute()
const { number } = useSpeedFormat()
const { firebaseUser } = useAuth()

const groupId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const memberId = ref('')
const error = ref<string | null>(null)

const membersQuery = useGroupMembersQuery(
  () => ({ groupId: groupId.value }),
  () => ({ enabled: groupId.value !== '', fetchPolicy: 'cache-and-network' })
)
const { loading: membersLoading } = membersQuery

const bestsQuery = useGroupMemberBestsQuery(
  () => ({ memberId: memberId.value }),
  () => ({ enabled: memberId.value !== '', fetchPolicy: 'cache-and-network' })
)
const { loading } = bestsQuery

bestsQuery.onError(err => { error.value = t('groups.speed.failed', { error: err.message }) })
bestsQuery.onResult(({ loading }) => { if (!loading) error.value = null })

// the first request may leave before the session is restored
watch(() => firebaseUser.value?.uid, () => {
  void membersQuery.refetch()
  if (memberId.value) void bestsQuery.refetch()
})

const athletes = computed(() => (membersQuery.result.value?.group?.members ?? [])
  .filter(entry => !entry.observer)
  .toSorted((a, b) => a.name.localeCompare(b.name))
)

const member = computed(() => athletes.value.find(athlete => athlete.id === memberId.value) ?? null)

const bests = computed(() => bestsQuery.result.value?.groupMember?.speedBests ?? [])

const segmentBests = computed(() => bests.value.filter((best): best is PersonalBest & { ownSegment: OwnSegment } => best.ownSegment != null))

function segmentLabel (segment: OwnSegment['segment']) {
  if (!segment) return t('speed.group.wholeScore')
  return segment.label ?? t('speed.details.segmentN', { n: segment.index + 1 })
}

function paceNote (stepsPerSecond: number | null) {
  return stepsPerSecond == null ? undefined : t('speed.details.pace', { pace: number(stepsPerSecond, { decimals: 2 }) })
}
</script>

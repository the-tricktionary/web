<template>
  <div class="flex flex-col gap-4">
    <h2 class="mb-0">
      {{ t('groups.speed.bests') }}
    </h2>

    <div v-if="loading && !athletes.length" class="flex items-center justify-center flex-col" role="status">
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
          <option v-for="athlete of athletes" :key="athlete.id" :value="athlete.id">
            {{ athlete.name }}
          </option>
        </select>
      </label>

      <p v-if="!member" class="text-muted mb-0">
        {{ t('groups.speed.bestsPick') }}
      </p>
      <p v-else class="text-muted mb-0">
        {{ t('groups.speed.bestsEmpty', { name: member.name }) }}
      </p>
    </template>
  </div>

  <group-bottom-bar />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useGroupMembersQuery } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'

import GroupBottomBar from '../components/GroupBottomBar.vue'
import IconLoading from '~icons/mdi/loading'

const { t } = useI18n()
const route = useRoute()
const { firebaseUser } = useAuth()

const groupId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const memberId = ref('')

const membersQuery = useGroupMembersQuery(
  () => ({ groupId: groupId.value }),
  () => ({ enabled: groupId.value !== '', fetchPolicy: 'cache-and-network' })
)
const { loading } = membersQuery

// the first request may leave before the session is restored
watch(() => firebaseUser.value?.uid, () => { void membersQuery.refetch() })

const athletes = computed(() => (membersQuery.result.value?.group?.members ?? [])
  .filter(member => !member.observer)
  .toSorted((a, b) => a.name.localeCompare(b.name))
)

const member = computed(() => athletes.value.find(athlete => athlete.id === memberId.value) ?? null)
</script>

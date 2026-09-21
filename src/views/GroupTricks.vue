<template>
  <div class="flex flex-col gap-4">
    <discipline-selector v-model:discipline="discipline" />

    <p v-if="!canEdit" class="text-muted mb-0">
      {{ t('groups.tricks.readOnly') }}
    </p>

    <div v-if="loading && !athletes.length" class="flex items-center justify-center flex-col" role="status">
      <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
      {{ t('groups.tricks.loading') }}
    </div>

    <div v-else-if="!athletes.length" class="flex items-center justify-center flex-col text-center" role="status">
      <icon-account-group class="w-32 h-32" aria-hidden="true" />
      <p>{{ t('groups.tricks.noAthletes') }}</p>
      <router-link :to="{ name: 'group-members', params: { id: groupId } }" class="btn w-max">
        {{ t('groups.tabs.members') }}
      </router-link>
    </div>

    <group-trick-table
      v-else
      :tricks="tricks"
      :athletes="athletes"
      :can-edit="canEdit"
      :hide-completed="hideCompleted"
    />
  </div>

  <group-bottom-bar>
    <icon-checkbox v-model:checked="hideCompleted" class="w-max flex-none whitespace-nowrap">
      {{ t('groups.tricks.hideCompleted') }}
    </icon-checkbox>
  </group-bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { Discipline, GroupRole, useGroupChecklistsQuery } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useLanguage from '../hooks/useLanguage'

import DisciplineSelector from '../components/DisciplineSelector.vue'
import GroupBottomBar from '../components/GroupBottomBar.vue'
import GroupTrickTable from '../components/GroupTrickTable.vue'
import IconCheckbox from '../components/IconCheckbox.vue'
import IconAccountGroup from '~icons/mdi/account-group'
import IconLoading from '~icons/mdi/loading'

const { t } = useI18n()
const route = useRoute()
const { firebaseUser } = useAuth()
const { lang } = useLanguage()

const groupId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const discipline = ref<Discipline>(Discipline.SingleRope)
const hideCompleted = ref(false)

const checklistsQuery = useGroupChecklistsQuery(
  () => ({
    groupId: groupId.value,
    discipline: discipline.value,
    withLocalised: lang.value !== 'en',
    lang: lang.value
  }),
  () => ({ enabled: groupId.value !== '', fetchPolicy: 'cache-and-network' })
)
const { loading } = checklistsQuery

// the first request may leave before the session is restored
watch(() => firebaseUser.value?.uid, () => { void checklistsQuery.refetch() })

const group = computed(() => checklistsQuery.result.value?.group ?? null)
const tricks = computed(() => checklistsQuery.result.value?.tricks ?? [])
const members = computed(() => group.value?.members ?? [])

const athletes = computed(() => members.value
  .filter(member => !member.observer)
  .toSorted((a, b) => a.name.localeCompare(b.name))
)

const canEdit = computed(() => group.value?.myMembership?.role === GroupRole.Admin)

</script>

<template>
  <div v-if="loading && !members.length" class="flex items-center justify-center flex-col" role="status">
    <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
    {{ t('groups.members.loading') }}
  </div>

  <div v-else class="flex flex-col gap-8">
    <section v-if="isAdmin && requests.length" class="flex flex-col gap-2">
      <h2 class="mb-0">
        {{ t('groups.requests.waitingTitle') }}
      </h2>
      <p class="text-muted mb-0">
        {{ t('groups.requests.waitingExplain') }}
      </p>
      <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
        <group-join-request
          v-for="request of requests"
          :key="request.id"
          :invite="request"
          :group-id="groupId"
          :unclaimed="unclaimed"
        />
      </ul>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="mb-0">
        {{ t('groups.members.athletes') }}
      </h2>
      <p v-if="!athletes.length" class="text-muted mb-0">
        {{ t('groups.members.noAthletes') }}
      </p>
      <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
        <group-member-row
          v-for="member of athletes"
          :key="member.id"
          :member="member"
          :group-id="groupId"
          :is-admin="isAdmin"
          :is-me="member.id === myMembership?.id"
          :last-admin="isLastAdmin(member)"
          @claim="startClaim"
          @leave="leave()"
        />
      </ul>
    </section>

    <section v-if="observers.length" class="flex flex-col gap-2">
      <h2 class="mb-0">
        {{ t('groups.members.observers') }}
      </h2>
      <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
        <group-member-row
          v-for="member of observers"
          :key="member.id"
          :member="member"
          :group-id="groupId"
          :is-admin="isAdmin"
          :is-me="member.id === myMembership?.id"
          :last-admin="isLastAdmin(member)"
          @claim="startClaim"
          @leave="leave()"
        />
      </ul>
    </section>

    <p v-if="leaveError" class="text-ttred-900 mb-0" role="alert">
      {{ leaveError }}
    </p>

    <template v-if="isAdmin">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section class="flex flex-col gap-2">
          <h2 class="mb-0">
            {{ t('groups.members.addAthlete') }}
          </h2>
          <p class="text-muted mb-0">
            {{ t('groups.members.addAthleteExplain') }}
          </p>
          <form class="flex flex-col gap-2" @submit.prevent="addAthlete()">
            <label class="flex flex-col gap-1">
              <span class="font-semibold">{{ t('groups.members.name') }}</span>
              <input
                v-model="athleteName"
                type="text"
                required
                maxlength="120"
                :placeholder="t('groups.members.namePlaceholder')"
                class="rounded"
                :disabled="adding"
              >
            </label>
            <p v-if="addError" class="text-ttred-900 mb-0" role="alert">
              {{ addError }}
            </p>
            <button type="submit" class="btn w-max" :disabled="adding || !athleteName.trim()">
              {{ t('groups.members.addAthlete') }}
            </button>
          </form>
        </section>

        <section class="flex flex-col gap-2">
          <h2 class="mb-0">
            {{ t('groups.members.invite') }}
          </h2>
          <p v-if="claiming" class="mb-0">
            {{ t('groups.members.claiming', { name: claiming.name }) }}
            <button type="button" class="underline" @click="claiming = null">
              {{ t('groups.members.cancelClaim') }}
            </button>
          </p>
          <p v-else class="text-muted mb-0">
            {{ t('groups.members.inviteExplain') }}
          </p>
          <form class="flex flex-col gap-2" @submit.prevent="invite()">
            <label class="flex flex-col gap-1">
              <span class="font-semibold">{{ t('groups.members.username') }}</span>
              <input
                ref="usernameInput"
                v-model="usernameOrId"
                type="text"
                required
                maxlength="120"
                autocapitalize="none"
                spellcheck="false"
                :placeholder="t('groups.members.usernamePlaceholder')"
                class="rounded"
                :disabled="inviting"
              >
            </label>
            <label class="flex flex-col gap-1">
              <span class="font-semibold">{{ t('groups.members.role') }}</span>
              <select v-model="role" class="rounded" :disabled="inviting">
                <option v-for="option of roles" :key="option" :value="option">
                  {{ t(enumKey('groupRole', option)) }}
                </option>
              </select>
            </label>
            <icon-checkbox v-model:checked="observer" class="w-max" :disabled="inviting || claiming != null">
              {{ t('groups.members.inviteAsObserver') }}
            </icon-checkbox>
            <p v-if="inviteError" class="text-ttred-900 mb-0" role="alert">
              {{ inviteError }}
            </p>
            <button type="submit" class="btn w-max" :disabled="inviting || !usernameOrId.trim()">
              {{ t('groups.members.invite') }}
            </button>
          </form>
        </section>
      </div>

      <section v-if="sent.length" class="flex flex-col gap-2">
        <h2 class="mb-0">
          {{ t('groups.sent.title') }}
        </h2>
        <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
          <group-invite-row v-for="invited of sent" :key="invited.id" :invite="invited" :group-id="groupId" />
        </ul>
      </section>

      <group-join-code :group-id="groupId" :join-code="joinCode" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getAuth } from '@firebase/auth'

import {
  GroupInviteKind,
  GroupInviteStatus,
  GroupRole,
  useAddGroupAthleteMutation,
  useGroupAdminQuery,
  useGroupMembersQuery,
  useInviteToGroupMutation,
  useLeaveGroupMutation
} from '../graphql/generated/graphql'
import { enumKey } from '../helpers'
import useAuth from '../hooks/useAuth'
import { addInviteToGroupCache, addMemberToCache, removeGroupFromCache } from '../hooks/useGroups'

import GroupInviteRow from '../components/GroupInviteRow.vue'
import GroupJoinCode from '../components/GroupJoinCode.vue'
import GroupJoinRequest from '../components/GroupJoinRequest.vue'
import GroupMemberRow from '../components/GroupMemberRow.vue'
import IconCheckbox from '../components/IconCheckbox.vue'
import IconLoading from '~icons/mdi/loading'

import type { GroupMemberBaseFragment } from '../graphql/generated/graphql'

const roles = [GroupRole.Member, GroupRole.Admin]

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { firebaseUser } = useAuth()

const groupId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const membersQuery = useGroupMembersQuery(
  () => ({ groupId: groupId.value }),
  () => ({ enabled: groupId.value !== '', fetchPolicy: 'cache-and-network' })
)
const { loading } = membersQuery

const members = computed(() => membersQuery.result.value?.group?.members ?? [])
const myMembership = computed(() => membersQuery.result.value?.group?.myMembership ?? null)
const isAdmin = computed(() => myMembership.value?.role === GroupRole.Admin)

// the join code and the group's own invitations resolve for admins only
const adminQuery = useGroupAdminQuery(
  () => ({ groupId: groupId.value }),
  () => ({ enabled: groupId.value !== '' && isAdmin.value, fetchPolicy: 'cache-and-network' })
)
const joinCode = computed(() => adminQuery.result.value?.group?.joinCode ?? null)
const invites = computed(() => adminQuery.result.value?.group?.invites ?? [])

const pending = computed(() => invites.value.filter(invite =>
  invite.status === GroupInviteStatus.Pending && invite.expiresAt > Date.now()
))
const requests = computed(() => pending.value.filter(invite => invite.kind === GroupInviteKind.Requested))
const sent = computed(() => pending.value.filter(invite => invite.kind === GroupInviteKind.Invited))

// the first request may leave before the session is restored
watch(() => firebaseUser.value?.uid, () => {
  void membersQuery.refetch()
  if (isAdmin.value) void adminQuery.refetch()
})

const byName = (a: GroupMemberBaseFragment, b: GroupMemberBaseFragment) => a.name.localeCompare(b.name)
const athletes = computed(() => members.value.filter(member => !member.observer).toSorted(byName))
const observers = computed(() => members.value.filter(member => member.observer).toSorted(byName))
const unclaimed = computed(() => members.value.filter(member => !member.user).toSorted(byName))

const admins = computed(() => members.value.filter(member => member.role === GroupRole.Admin && member.user))

function isLastAdmin (member: GroupMemberBaseFragment) {
  return admins.value.length === 1 && admins.value[0].id === member.id
}

const athleteName = ref('')
const addError = ref<string | null>(null)

const { mutate: addGroupAthlete, loading: adding } = useAddGroupAthleteMutation(() => ({
  update (cache, { data }) {
    if (!data?.addGroupAthlete) return
    addMemberToCache(cache, groupId.value, data.addGroupAthlete)
  }
}))

async function addAthlete () {
  const wanted = athleteName.value.trim()
  if (!wanted || adding.value) return
  addError.value = null
  try {
    await addGroupAthlete({ groupId: groupId.value, name: wanted })
    athleteName.value = ''
  } catch (err) {
    addError.value = t('groups.members.failedAdd', { error: (err as Error).message })
  }
}

const usernameOrId = ref('')
const role = ref<GroupRole>(GroupRole.Member)
const observer = ref(false)
const claiming = ref<GroupMemberBaseFragment | null>(null)
const inviteError = ref<string | null>(null)
const usernameInput = useTemplateRef<HTMLInputElement>('usernameInput')

const { mutate: inviteToGroup, loading: inviting } = useInviteToGroupMutation(() => ({
  update (cache, { data }) {
    if (!data?.inviteToGroup) return
    addInviteToGroupCache(cache, groupId.value, data.inviteToGroup)
  }
}))

function startClaim (member: GroupMemberBaseFragment) {
  claiming.value = member
  observer.value = false
  inviteError.value = null
  void nextTick(() => usernameInput.value?.focus())
}

async function invite () {
  const wanted = usernameOrId.value.trim()
  if (!wanted || inviting.value) return
  inviteError.value = null
  try {
    await inviteToGroup({
      groupId: groupId.value,
      usernameOrId: wanted,
      role: role.value,
      observer: observer.value,
      memberId: claiming.value?.id ?? null
    })
    usernameOrId.value = ''
    claiming.value = null
  } catch (err) {
    inviteError.value = t('groups.members.failedInvite', { error: (err as Error).message })
  }
}

const leaveError = ref<string | null>(null)

const { mutate: leaveGroup, loading: leaving } = useLeaveGroupMutation(() => ({
  update (cache, { data }) {
    const userId = getAuth().currentUser?.uid
    if (!data?.leaveGroup || !userId) return
    removeGroupFromCache(cache, userId, data.leaveGroup.id)
  }
}))

async function leave () {
  if (leaving.value) return
  if (!window.confirm(t('groups.members.confirmLeave'))) return
  leaveError.value = null
  try {
    await leaveGroup({ groupId: groupId.value })
    await router.replace({ name: 'groups' })
  } catch (err) {
    leaveError.value = t('groups.members.failedLeave', { error: (err as Error).message })
  }
}
</script>

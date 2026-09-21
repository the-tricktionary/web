<template>
  <li class="rounded border border-line bg-surface p-2 flex flex-col gap-2">
    <form v-if="renaming" class="flex flex-wrap items-end gap-2" @submit.prevent="rename()">
      <label class="flex flex-col gap-1 flex-grow max-w-80">
        <span class="font-semibold">{{ t('groups.members.name') }}</span>
        <input
          v-model="name"
          type="text"
          required
          maxlength="120"
          class="rounded"
          :disabled="saving"
        >
      </label>
      <button type="submit" class="btn w-max" :disabled="saving || !name.trim()">
        {{ t('groups.members.saveName') }}
      </button>
      <button type="button" class="btn w-max" :disabled="saving" @click="renaming = false">
        {{ t('groups.members.cancel') }}
      </button>
    </form>

    <div v-else>
      <p class="font-bold mb-0 truncate">
        {{ member.name }}
        <span v-if="isMe" class="font-normal text-muted">{{ t('groups.members.you') }}</span>
      </p>
      <p class="text-muted text-sm mb-0 truncate">
        <template v-if="member.user">
          {{ member.user.username ? `@${member.user.username}` : t('groups.members.hasAccount') }}
        </template>
        <template v-else>
          {{ t('groups.members.managed') }}
        </template>
        &middot; {{ t(enumKey('groupRole', member.role)) }}
        &middot; {{ member.observer ? t('groups.observer') : t('groups.athlete') }}
      </p>
    </div>

    <p v-if="lastAdmin" :id="reasonId" class="text-muted text-sm mb-0">
      {{ t('groups.members.lastAdmin') }}
    </p>

    <p v-if="error" class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>

    <div v-if="isAdmin || isMe" class="flex flex-wrap gap-2">
      <template v-if="isAdmin && member.user">
        <button
          type="button"
          class="btn w-max"
          :disabled="saving || lastAdmin"
          :aria-describedby="lastAdmin ? reasonId : undefined"
          @click="setRole(isAdminRole ? GroupRole.Member : GroupRole.Admin)"
        >
          {{ isAdminRole ? t('groups.members.demote') : t('groups.members.promote') }}
        </button>
        <button type="button" class="btn w-max" :disabled="saving" @click="setObserver(!member.observer)">
          {{ member.observer ? t('groups.members.makeAthlete') : t('groups.members.makeObserver') }}
        </button>
      </template>

      <template v-if="isAdmin && !member.user">
        <button type="button" class="btn w-max" :disabled="saving" @click="startRename()">
          {{ t('groups.members.rename') }}
        </button>
        <button type="button" class="btn w-max" :disabled="saving" @click="$emit('claim', member)">
          {{ t('groups.members.inviteToClaim') }}
        </button>
      </template>

      <button
        v-if="isAdmin && !isMe"
        type="button"
        class="btn w-max"
        :disabled="saving || lastAdmin"
        :aria-describedby="lastAdmin ? reasonId : undefined"
        @click="remove()"
      >
        {{ t('groups.members.remove') }}
      </button>

      <button
        v-if="isMe"
        type="button"
        class="btn w-max"
        :disabled="lastAdmin"
        :aria-describedby="lastAdmin ? reasonId : undefined"
        @click="$emit('leave')"
      >
        {{ t('groups.members.leave') }}
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'

import { GroupRole, useRemoveGroupMemberMutation, useUpdateGroupMemberMutation } from '../graphql/generated/graphql'
import { enumKey } from '../helpers'
import { removeMemberFromCache } from '../hooks/useGroups'

import type { PropType } from 'vue'
import type { GroupMemberBaseFragment } from '../graphql/generated/graphql'

const props = defineProps({
  member: {
    type: Object as PropType<GroupMemberBaseFragment>,
    required: true
  },
  groupId: {
    type: String,
    required: true
  },
  isAdmin: Boolean,
  isMe: Boolean,
  /** The only admin with an account: demoting, removing or leaving would leave the group without one */
  lastAdmin: Boolean
})

defineEmits<{
  claim: [member: GroupMemberBaseFragment]
  leave: []
}>()

const { t } = useI18n()

const reasonId = useId()
const renaming = ref(false)
const name = ref('')
const error = ref<string | null>(null)

const isAdminRole = computed(() => props.member.role === GroupRole.Admin)

const { mutate: updateMember, loading: updating } = useUpdateGroupMemberMutation({})
const { mutate: removeMember, loading: removing } = useRemoveGroupMemberMutation(() => ({
  update (cache, { data }) {
    const removed = data?.removeGroupMember
    if (!removed) return
    // one who has competed is kept as an athlete the group manages, and only
    // then does the row survive the removal
    if (props.member.user && removed.user == null) return
    removeMemberFromCache(cache, props.groupId, removed.id)
  }
}))

const saving = computed(() => updating.value || removing.value)

function startRename () {
  name.value = props.member.name
  error.value = null
  renaming.value = true
}

async function save (data: { name?: string | null, role: GroupRole, observer: boolean }) {
  error.value = null
  try {
    await updateMember({ memberId: props.member.id, data })
    return true
  } catch (err) {
    error.value = t('groups.members.failedSave', { error: (err as Error).message })
    return false
  }
}

async function rename () {
  const wanted = name.value.trim()
  if (!wanted || saving.value) return
  // the API takes the member as it should be once the update is applied
  if (await save({ name: wanted, role: props.member.role, observer: props.member.observer })) renaming.value = false
}

async function setRole (role: GroupRole) {
  if (saving.value) return
  await save({ role, observer: props.member.observer })
}

async function setObserver (observer: boolean) {
  if (saving.value) return
  await save({ role: props.member.role, observer })
}

async function remove () {
  if (saving.value) return
  if (!window.confirm(t('groups.members.confirmRemove', { name: props.member.name }))) return
  error.value = null
  try {
    await removeMember({ memberId: props.member.id })
  } catch (err) {
    error.value = t('groups.members.failedRemove', { error: (err as Error).message })
  }
}
</script>

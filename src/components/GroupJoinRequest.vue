<template>
  <li class="rounded border border-line bg-surface p-2 flex flex-col gap-2">
    <div>
      <p class="font-bold mb-0 truncate">
        {{ invite.user.name || invite.user.username || t('groups.requests.someone') }}
      </p>
      <p v-if="invite.user.username" class="text-muted text-sm mb-0 truncate">
        &commat;{{ invite.user.username }}
      </p>
    </div>

    <label v-if="unclaimed.length" class="flex flex-col gap-1">
      <span class="font-semibold">{{ t('groups.requests.pickExisting') }}</span>
      <select v-model="memberId" class="rounded" :disabled="saving">
        <option value="">
          {{ t('groups.requests.addAsNew') }}
        </option>
        <option v-for="athlete of unclaimed" :key="athlete.id" :value="athlete.id">
          {{ athlete.name }}
        </option>
      </select>
    </label>

    <p v-if="error" class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>

    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn w-max" :disabled="saving" @click="respond(true)">
        {{ t('groups.requests.approve') }}
      </button>
      <button type="button" class="btn w-max" :disabled="saving" @click="respond(false)">
        {{ t('groups.requests.refuse') }}
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useRespondToGroupJoinRequestMutation } from '../graphql/generated/graphql'
import { evictMembersFromCache, removeInviteFromGroupCache } from '../hooks/useGroups'

import type { PropType } from 'vue'
import type { GroupInviteAdminFragment, GroupMemberBaseFragment } from '../graphql/generated/graphql'

const props = defineProps({
  invite: {
    type: Object as PropType<GroupInviteAdminFragment>,
    required: true
  },
  groupId: {
    type: String,
    required: true
  },
  /** Athletes the group manages that nobody has claimed yet */
  unclaimed: {
    type: Array as PropType<readonly GroupMemberBaseFragment[]>,
    default: () => []
  }
})

const { t } = useI18n()

const memberId = ref('')
const error = ref<string | null>(null)

const { mutate: respondTo, loading: saving } = useRespondToGroupJoinRequestMutation(() => ({
  update (cache, { data }) {
    const answered = data?.respondToGroupJoinRequest
    if (!answered) return
    removeInviteFromGroupCache(cache, props.groupId, answered.id)
    evictMembersFromCache(cache, props.groupId)
  }
}))

async function respond (accept: boolean) {
  if (saving.value) return
  error.value = null
  try {
    await respondTo({
      inviteId: props.invite.id,
      accept,
      memberId: accept && memberId.value !== '' ? memberId.value : null
    })
  } catch (err) {
    error.value = t('groups.requests.failed', { error: (err as Error).message })
  }
}
</script>

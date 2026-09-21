<template>
  <div class="rounded border border-line bg-surface p-2 flex flex-col gap-2">
    <div>
      <p class="font-bold mb-0">
        {{ invite.group.name }}
      </p>
      <p class="text-muted text-sm mb-0">
        {{ invite.invitedBy ? t('groups.invitedBy', { name: invite.invitedBy.name ?? invite.invitedBy.username ?? '' }) : t('groups.invitedByUnknown') }}
        &middot; {{ invite.observer ? t('groups.observer') : t('groups.athlete') }}
        &middot; {{ t(enumKey('groupRole', invite.role)) }}
      </p>
    </div>

    <group-consent />

    <p v-if="error" class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>

    <div class="flex gap-2">
      <button type="button" class="btn w-max" :disabled="answering != null" @click="respondTo(true)">
        <icon-loading v-if="answering === true" class="animate-spin inline-block" aria-hidden="true" />
        <span v-else>{{ t('groups.accept') }}</span>
      </button>
      <button type="button" class="btn w-max" :disabled="answering != null" @click="respondTo(false)">
        <icon-loading v-if="answering === false" class="animate-spin inline-block" aria-hidden="true" />
        <span v-else>{{ t('groups.decline') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAuth } from '@firebase/auth'

import { GroupInviteStatus, useRespondToGroupInviteMutation } from '../graphql/generated/graphql'
import { addGroupToCache, removeGroupInviteFromCache } from '../hooks/useGroups'
import { enumKey } from '../helpers'

import GroupConsent from './GroupConsent.vue'
import IconLoading from '~icons/mdi/loading'

import type { PropType } from 'vue'
import type { GroupInviteBaseFragment } from '../graphql/generated/graphql'

const props = defineProps({
  invite: {
    type: Object as PropType<GroupInviteBaseFragment>,
    required: true
  }
})

const { t } = useI18n()

const answering = ref<boolean | null>(null)
const error = ref<string | null>(null)

const { mutate: respond } = useRespondToGroupInviteMutation(() => ({
  update (cache, { data }) {
    const answered = data?.respondToGroupInvite
    const userId = getAuth().currentUser?.uid
    if (!answered || !userId) return
    if (answered.status === GroupInviteStatus.Accepted) addGroupToCache(cache, userId, answered.group)
    removeGroupInviteFromCache(cache, userId, answered.id)
  }
}))

async function respondTo (accept: boolean) {
  if (answering.value != null) return
  error.value = null
  answering.value = accept
  try {
    await respond({ inviteId: props.invite.id, accept })
  } catch (err) {
    error.value = t('groups.failedRespond', { error: (err as Error).message })
  } finally {
    answering.value = null
  }
}
</script>
